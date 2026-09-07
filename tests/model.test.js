import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDevices, filterDevices, allTabs, safeUrl, openTabs, relativeTime } from '../extension/model.js';

const fixture = () => [
  { deviceName:'Phone',sessions:[{lastModified:30,window:{sessionId:'w1',tabs:[{sessionId:'a',title:'Hello <script>',url:'https://example.com/a'},{sessionId:'b',url:'https://example.com/b'}]}}]},
  { deviceName:'Laptop',sessions:[{lastModified:50,tab:{sessionId:'c',title:'Work notes',url:'https://notes.example.com/work'}}]}
];
test('normalizes remote windows, sorted by activity, with local tabs last and no incognito', () => {
  const devices=normalizeDevices(fixture(),[{id:10,windowId:1,url:'https://example.com'},{id:11,windowId:1,incognito:true,url:'https://private.example'}]);
  assert.deepEqual(devices.map(d=>d.name),['Laptop','Phone','This device']);
  assert.equal(allTabs(devices[1]).length,2);
  assert.equal(allTabs(devices[2]).length,1);
  assert.equal(allTabs(devices[1])[0].title,'Hello <script>');
});
test('search matches title and URL, case insensitive across terms, without changing source', () => {
  const devices=normalizeDevices(fixture(),[]);
  const filtered=filterDevices(devices,'WORK NOTES');
  assert.equal(filtered.length,1); assert.equal(allTabs(filtered[0]).length,1);
  assert.equal(filterDevices(devices,'EXAMPLE.COM/a')[0].name,'Phone');
  assert.equal(allTabs(devices[1]).length,2);
  assert.equal(filterDevices(devices,'unfindable').length,0);
});
test('hidden devices are excluded, duplicate names have distinct keys, keys survive reordering sessions', () => {
  const input=fixture(); input.push(structuredClone(input[0]));
  const devices=normalizeDevices(input,[]);
  assert.equal(new Set(devices.map(d=>d.key)).size,devices.length);
  assert.equal(filterDevices(devices,'',[devices[0].key]).length,3);
  assert.equal(normalizeDevices(fixture().reverse(),[])[0].key,devices[0].key);
});
test('500 remote tabs are preserved across four devices, with no 25-tab truncation', () => {
  const remote=Array.from({length:4},(_,d)=>({deviceName:`device${d}`,sessions:Array.from({length:5},(_,w)=>({lastModified:w,window:{sessionId:`${d}-${w}`,tabs:Array.from({length:25},(_,i)=>({sessionId:`${d}-${w}-${i}`,url:`https://example.com/${i}`}))}}))}));
  const devices=normalizeDevices(remote,[]);
  assert.equal(devices.flatMap(allTabs).length,500);
  assert.equal(new Set(devices.flatMap(allTabs).map(t=>t.key)).size,500);
});
test('rejects executable and foreign extension addresses, keeps supported browser pages', () => {
  for (const value of ['javascript:alert(1)','data:text/html,Hi','chrome-extension://id/page','invalid','']) assert.equal(safeUrl(value),null);
  assert.equal(safeUrl('https://example.com/a'),'https://example.com/a');
  assert.equal(safeUrl('chrome://history/'),'chrome://history/');
});
test('opens in order in the owner window, reports partial failure and continues', async () => {
  const calls=[];
  const result=await openTabs([{openUrl:'https://a.com'},{openUrl:null},{openUrl:'https://b.com'},{openUrl:'https://c.com'}],async props=>{calls.push(props);if(props.url==='https://b.com')throw Error('unavailable');},42);
  assert.deepEqual(result,{opened:2,failed:2});
  assert.deepEqual(calls.map(c=>c.url),['https://a.com','https://b.com','https://c.com']);
  assert.ok(calls.every(c=>c.windowId===42&&!c.active));
});
test('timestamps handle missing and future sync times', () => {
  assert.equal(relativeTime(0),'Sync time unavailable');
  assert.equal(relativeTime(100,99000),'Synced just now');
  assert.equal(relativeTime(100,3700000),'Synced 1h ago');
});
