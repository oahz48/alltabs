import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { startPreview } from '../scripts/preview.mjs';

const artifacts = path.resolve('artifacts');
await mkdir(artifacts, { recursive: true });
const profile = path.resolve('.cache', `browser-${Date.now()}`);
await mkdir(profile, { recursive: true });
const server = await startPreview(0);
const origin = `http://127.0.0.1:${server.address().port}`;
const extensionMode = process.argv.includes('--extension');
const browser = spawn(process.env.ALLTABS_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', `--user-data-dir=${profile}`,
  '--remote-debugging-pipe', ...(extensionMode ? ['--enable-unsafe-extension-debugging'] : []),
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--disable-sync', 'about:blank'
], { windowsHide: true, stdio: ['ignore','ignore','pipe','pipe','pipe'] });
let stderr=''; browser.stderr.on('data',data=>{stderr+=data;});
const delay = ms => new Promise(resolve=>setTimeout(resolve,ms));
let sequence=0, nativeSession, browserFailure;
const pending=new Map(), errors=[];
function failBrowser(error) {
  browserFailure=error;
  for(const job of pending.values()) job.reject(error);
  pending.clear();
}
browser.on('error',failBrowser);
browser.on('exit',(code,signal)=>failBrowser(new Error(`Chrome exited (code ${code}, signal ${signal}). ${stderr}`)));
browser.stdio[3].on('error',failBrowser);
async function send(method,params={},timeoutMs=15000) {
  if(browserFailure) throw browserFailure;
  const id=++sequence;
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{pending.delete(id);reject(new Error(`CDP timeout after ${timeoutMs}ms: ${method}. Chrome stderr: ${stderr || '(empty)'}`));},timeoutMs);
    pending.set(id,{resolve:value=>{clearTimeout(timer);resolve(value);},reject:error=>{clearTimeout(timer);reject(new Error(`${method}: ${error.message}`));}});
    const message=JSON.stringify({id,method,params,...(nativeSession&&!/^(Browser|Extensions|Target)\./.test(method)?{sessionId:nativeSession}:{})});
    browser.stdio[3].write(message+'\0');
  });
}
async function evaluate(expression) {
  const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});
  if(result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function until(expression) {
  const deadline=Date.now()+10000;
  while(Date.now()<deadline) {if(await evaluate(expression)) return;await delay(50);}
  throw new Error(`Timed out waiting for ${expression}`);
}
const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
async function search(value) { await evaluate(`document.querySelector('#search').value=${JSON.stringify(value)};document.querySelector('#search').dispatchEvent(new Event('input',{bubbles:true}))`); }
async function refresh() { await click('#refresh'); await until(`!document.querySelector('#refresh').disabled`); }
async function screenshot(name) { const result=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(artifacts,name),Buffer.from(result.data,'base64')); }
const results=[];
async function check(name,fn) {await fn();results.push(name);console.log(`PASS ${name}`);}
try {
  function receive(message) {
    if(message.id) {const job=pending.get(message.id);if(job){pending.delete(message.id);message.error?job.reject(new Error(JSON.stringify(message.error))):job.resolve(message.result);}}
    if(message.method==='Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
  }
  // Both suites use the inherited pipe: no debug-port file or localhost socket race.
  {
    let buffer='';
    browser.stdio[4].on('data',data=>{
      buffer+=data.toString();let end;
      while((end=buffer.indexOf('\0'))>=0){const part=buffer.slice(0,end);buffer=buffer.slice(end+1);if(part)receive(JSON.parse(part));}
    });
    const version=await send('Browser.getVersion',{},45000);
    console.log(`Browser: ${version.product}`);
    const targets=(await send('Target.getTargets')).targetInfos;
    const page=targets.find(target=>target.type==='page');
    const targetId=page?.targetId || (await send('Target.createTarget',{url:'about:blank'})).targetId;
    nativeSession=(await send('Target.attachToTarget',{targetId,flatten:true})).sessionId;
  }
  await send('Page.enable');await send('Runtime.enable');
  await send('Emulation.setFocusEmulationEnabled',{enabled:true});
  await send('Emulation.setDeviceMetricsOverride',{width:380,height:820,deviceScaleFactor:1,mobile:false});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});
  await send('Browser.grantPermissions',{origin,permissions:['clipboardReadWrite','clipboardSanitizedWrite']});
  if (process.argv.includes('--store-assets')) {
    await mkdir('docs/store-assets', { recursive: true });
    for (const [page, width, height, file] of [['store.html',1280,800,'screenshot.png'],['promo.html',440,280,'promo.png']]) {
      await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
      await send('Page.navigate',{url:`${origin}/${page}`});
      await until(`document.readyState==='complete'`);
      if (page==='store.html') await until(`document.querySelector('iframe')?.contentDocument.querySelectorAll('.device').length===4`);
      const result=await send('Page.captureScreenshot',{format:'png'});
      await writeFile(`docs/store-assets/${file}`,Buffer.from(result.data,'base64'));
    }
    assert.deepEqual(errors,[]);
    console.log('Store screenshot and small promotional image generated.');
  } else if (process.argv.includes('--extension')) {
    const { id } = await send('Extensions.loadUnpacked',{path:path.resolve('extension')});
    await send('Page.navigate',{url:`chrome-extension://${id}/panel.html`});
    await until(`document.querySelector('#summary')?.textContent.includes('remote device')`);
    await check('real unpacked extension starts without errors',async()=>{
      assert.equal(await evaluate(`document.querySelector('#error').hidden`),true);
      assert.equal(await evaluate(`chrome.runtime.getManifest().name`),'Alltabs – Synced Tabs Side Panel');
      assert.deepEqual(await evaluate(`chrome.sessions.getDevices()`),[]);
    });
    await check('real side panel uses toolbar toggle behavior',async()=>{
      assert.deepEqual(await evaluate(`chrome.sidePanel.getPanelBehavior()`),{openPanelOnActionClick:true});
      assert.equal((await evaluate(`chrome.sidePanel.getOptions({})`)).path,'panel.html');
    });
    await check('real tabs and preference storage APIs',async()=>{
      await evaluate(`chrome.tabs.create({url:'about:blank',active:false})`);
      await refresh();
      assert.ok(await evaluate(`document.querySelectorAll('.tab-row').length>=1`));
      await click('[data-device="local"] .device-toggle');
      assert.equal(await evaluate(`chrome.storage.local.get('preferences').then(result=>result.preferences.expanded.local)`),true);
    });
    await evaluate(`window.panelEvents=[];chrome.sidePanel.onOpened.addListener(()=>window.panelEvents.push('opened'));chrome.sidePanel.onClosed.addListener(()=>window.panelEvents.push('closed'))`);
    const targetId=(await send('Target.getTargets',{filter:[{type:'tab',exclude:false}]})).targetInfos.find(target=>target.url===`chrome-extension://${id}/panel.html`).targetId;
    await check('toolbar action opens and toggles the real side panel',async()=>{
      await send('Extensions.triggerAction',{id,targetId});
      await until(`window.panelEvents.includes('opened')`);
      await send('Extensions.triggerAction',{id,targetId});
      await until(`window.panelEvents.includes('closed')`);
    });
    await check('close button closes the real side panel',async()=>{
      await evaluate(`window.panelEvents=[]`);
      await send('Extensions.triggerAction',{id,targetId});
      await until(`window.panelEvents.includes('opened')`);
      await click('#close');
      await until(`window.panelEvents.includes('closed')`);
      assert.equal(await evaluate(`document.querySelector('#error').hidden`),true);
    });
    assert.deepEqual(errors,[]);
    await writeFile(path.join(artifacts,'extension-results.json'),JSON.stringify({passed:results.length,checks:results,pageErrors:errors},null,2));
    console.log(`${results.length} real-extension checks passed in a clean, unsigned-in Chrome profile.`);
  } else {
  await send('Page.navigate',{url:origin});
  await until(`document.querySelectorAll('.device').length===4`);
  await check('default remote expansion and collapsed local group',async()=>{
    assert.equal(await evaluate(`document.querySelectorAll('.device-toggle[aria-expanded="true"]').length`),3);
    assert.equal(await evaluate(`document.querySelectorAll('.tab-row').length`),17);
  });
  await screenshot('alltabs-light.png');
  await check('search, active opening, Ctrl-click and middle-click preserve search',async()=>{
    await search('notes');
    await click('.tab-link');
    await until(`window.demo.opened.length===1`);
    assert.equal(await evaluate(`window.demo.opened[0].active`),true);
    assert.equal(await evaluate(`document.querySelector('#search').value`),'notes');
    await until(`!document.querySelector('#open-selected').disabled`);
    await evaluate(`document.querySelector('.tab-link').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,ctrlKey:true}))`);
    await until(`window.demo.opened.length===2`);
    assert.equal(await evaluate(`window.demo.opened[1].active`),false);
    await until(`!document.querySelector('#open-selected').disabled`);
    await evaluate(`document.querySelector('.tab-link').dispatchEvent(new MouseEvent('auxclick',{bubbles:true,cancelable:true,button:1}))`);
    await until(`window.demo.opened.length===3`);
    assert.equal(await evaluate(`window.demo.opened[2].active`),false);
  });
  await check('multi-selection copies URLs and opens in the owner window',async()=>{
    // Capture clipboard output without changing the user's system clipboard.
    await evaluate(`window.testClipboard='';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.testClipboard=text;},readText:async()=>window.testClipboard}})`);
    await search('');
    await evaluate(`document.querySelectorAll('.tab-row input')[0].click();document.querySelectorAll('.tab-row input')[1].click()`);
    assert.equal(await evaluate(`document.querySelector('#selection-count').textContent`),'2 selected');
    await click('#copy-selected');
    assert.equal((await evaluate(`navigator.clipboard.readText()`)).split('\n').length,2);
    await click('#open-selected');
    await until(`window.demo.opened.length===5`);
    assert.ok(await evaluate(`window.demo.opened.every(tab=>tab.windowId===1)`));
    await screenshot('alltabs-selection.png');
    await click('#clear-selection');
  });
  await check('collapse and search persist across panel reload',async()=>{
    await click('.device-toggle');
    await search('notes');
    await delay(150);
    await send('Page.reload');
    await until(`document.querySelector('#search')?.value==='notes'&&document.querySelectorAll('.device').length>0`);
    await search('');
    assert.equal(await evaluate(`document.querySelector('.device-toggle').getAttribute('aria-expanded')`),'false');
    await click('.device-toggle');
  });
  await check('device hiding and restoration',async()=>{
    await click('.device-menu summary');
    await evaluate(`[...document.querySelector('.device-menu').querySelectorAll('button')].find(button=>button.textContent==='Hide device').click()`);
    assert.equal(await evaluate(`document.querySelectorAll('.device').length`),3);
    await click('#settings');
    await click('.hidden-device button');
    assert.equal(await evaluate(`document.querySelectorAll('.device').length`),4);
    await click('#settings-dialog [data-dismiss]');
  });
  await check('failed refresh preserves existing tabs and recovers',async()=>{
    const count=await evaluate(`document.querySelectorAll('.tab-row').length`);
    await evaluate(`window.demo.fail=true`);await refresh();
    assert.equal(await evaluate(`document.querySelector('#error').hidden`),false);
    assert.equal(await evaluate(`document.querySelectorAll('.tab-row').length`),count);
    await evaluate(`window.demo.fail=false`);await refresh();
    assert.equal(await evaluate(`document.querySelector('#error').hidden`),true);
  });
  await check('preferences changed in another window update the panel and selection',async()=>{
    await click('.tab-row input');
    await evaluate(`window.externalKey=document.querySelector('.device').dataset.device;chrome.storage.onChanged.fire({preferences:{newValue:{hidden:{[window.externalKey]:'Other window'},expanded:{},showLocal:true}}},'local')`);
    assert.equal(await evaluate(`document.querySelectorAll('.device').length`),3);
    assert.equal(await evaluate(`document.querySelector('#selection-bar').hidden`),true);
    await evaluate(`chrome.storage.onChanged.fire({preferences:{newValue:{hidden:{},expanded:{},showLocal:true}}},'local')`);
    assert.equal(await evaluate(`document.querySelectorAll('.device').length`),4);
  });
  await check('500-tab rendering, scrolling, opening and refresh retain position',async()=>{
    await evaluate(`window.demo.large();window.demo.local.splice(0)`);
    const start=Date.now();await refresh();
    assert.equal(await evaluate(`document.querySelectorAll('.tab-row').length`),500);
    console.log(`500-tab refresh: ${Date.now()-start} ms`);
    await evaluate(`document.querySelector('#list').scrollTop=5000`);
    await delay(150);
    const before=await evaluate(`document.querySelector('#list').scrollTop`);
    await refresh();
    assert.equal(await evaluate(`document.querySelector('#list').scrollTop`),before);
    await evaluate(`const area=document.querySelector('#list').getBoundingClientRect();[...document.querySelectorAll('.tab-link')].find(link=>link.getBoundingClientRect().top>area.top&&link.getBoundingClientRect().bottom<area.bottom).click()`);
    await delay(900);
    assert.equal(await evaluate(`document.querySelector('#list').scrollTop`),before);
    await screenshot('alltabs-500-tabs.png');
  });
  await check('bulk opening prompts and cancellation creates no tabs',async()=>{
    const before=await evaluate(`window.demo.opened.length`);
    await evaluate(`document.querySelector('#list').scrollTop=0;document.querySelector('.device-menu summary').click();[...document.querySelector('.device-menu').querySelectorAll('button')].find(button=>button.textContent==='Open all tabs').click()`);
    await until(`document.querySelector('#bulk-dialog').open`);
    await click('#bulk-cancel');
    assert.equal(await evaluate(`window.demo.opened.length`),before);
  });
  await check('untrusted synced titles remain text and executable URLs are disabled',async()=>{
    await evaluate(`window.demo.remote[0].sessions[0].window.tabs[0].title='<img src=x onerror=alert(1)>';window.demo.remote[0].sessions[0].window.tabs[0].url='javascript:alert(1)'`);
    await refresh();
    assert.equal(await evaluate(`document.querySelector('.tab-title').textContent`),'<img src=x onerror=alert(1)>');
    assert.equal(await evaluate(`document.querySelector('.tab-title img')`),null);
    assert.equal(await evaluate(`document.querySelector('.tab-link').getAttribute('aria-disabled')`),'true');
    assert.equal(await evaluate(`document.querySelector('.tab-row input').disabled`),true);
  });
  await check('narrow dark panel has no horizontal overflow',async()=>{
    await send('Emulation.setDeviceMetricsOverride',{width:280,height:740,deviceScaleFactor:1,mobile:false});
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'}]});
    assert.ok(await evaluate(`document.documentElement.scrollWidth<=280`));
    await screenshot('alltabs-dark-narrow.png');
  });
  await check('empty and no-match states, close action',async()=>{
    await search('unfindable-query');
    assert.equal(await evaluate(`document.querySelector('.empty h2').textContent`),'No matching tabs');
    await search('');await evaluate(`window.demo.remote.splice(0);window.demo.local.splice(0)`);await refresh();
    assert.equal(await evaluate(`document.querySelector('.empty h2').textContent`),'Your other tabs belong here');
    await click('#close');assert.equal(await evaluate(`window.demo.closed`),true);
  });
  assert.deepEqual(errors,[],'No unhandled page errors');
  await writeFile(path.join(artifacts,'browser-results.json'),JSON.stringify({passed:results.length,checks:results,pageErrors:errors},null,2));
  console.log(`${results.length} browser checks passed. Screenshots: ${artifacts}`);
  }
} finally {
  if(!browserFailure){try{await send('Browser.close',{},3000);}catch{}}
  browser.kill();server.close();
}
