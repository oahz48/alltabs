// Test-only Chrome stand-in. This file is never included in the extension package.
(() => {
  const event = () => ({ callbacks: [], addListener(fn) { this.callbacks.push(fn); }, fire(...args) { this.callbacks.forEach(fn => fn(...args)); } });
  const now = Math.floor(Date.now() / 1000);
  const subjects = [
    ['Designing a calmer workspace', 'https://www.notion.so/workspace'],
    ['A weekend in the mountains', 'https://www.google.com/maps'],
    ['A collection of useful things', 'https://github.com/explore'],
    ['Read something wonderful', 'https://www.wikipedia.org/'],
    ['Notes for the next chapter', 'https://docs.google.com/document/notes'],
    ['The music for this moment', 'https://open.spotify.com/collection'],
    ['A place to begin', 'https://www.are.na/collection'],
    ['Making room for good ideas', 'https://www.figma.com/files']
  ];
  const remote = ['MacBook Air', 'Pixel 9', 'iPhone'].map((deviceName,d) => ({ deviceName, sessions: [{ lastModified: now - [120, 720, 3600][d], window: { sessionId: `window-${d}`, tabs: Array.from({length:[8,5,3][d]},(_,i) => ({ sessionId:`tab-${d}-${i}`,title:subjects[(i+d)%subjects.length][0],url:subjects[(i+d)%subjects.length][1] })) } }] }));
  const local = [{id:1,windowId:1,title:'Your current workspace',url:'https://example.com/workspace'}];
  const opened = [];
  function storage(prefix) {
    return {
      async get(key) { return { [key]: JSON.parse(localStorage.getItem(prefix + key) || 'null') }; },
      async set(values) { for (const [key,value] of Object.entries(values)) localStorage.setItem(prefix + key,JSON.stringify(value)); }
    };
  }
  const api = {
    runtime: { getURL: path => new URL(path || '/',location.origin).href, getManifest: () => ({version:'0.1.0 · Demo'}) },
    windows: { getCurrent: async () => ({id:1}) },
    storage: { local:storage('alltabs:local:'),session:storage('alltabs:session:'),onChanged:event() },
    sessions: { getDevices: async () => { if (window.demo.fail) throw new Error('Test sync error'); return structuredClone(remote); } },
    tabs: {
      query: async () => structuredClone(local),
      create: async props => { opened.push(props); const tab={...props,id:local.length+1,title:props.url}; local.push(tab); api.tabs.onCreated.fire(tab); return tab; },
      onCreated:event(),onRemoved:event(),onUpdated:event()
    },
    sidePanel: { close: async () => { window.demo.closed = true; } }
  };
  window.chrome = api;
  document.addEventListener('DOMContentLoaded', () => {
    document.title='Alltabs · Sample-data preview';
    const badge=document.createElement('span');badge.textContent='DEMO';badge.className='demo-badge';
    document.querySelector('.brand').append(badge);
  });
  window.demo = { remote,local,opened,fail:false,closed:false,
    large() {
      remote.splice(0,remote.length,...Array.from({length:4},(_,d) => ({deviceName:['MacBook Air','Pixel 9','iPhone','Office PC'][d],sessions:Array.from({length:5},(_,w) => ({lastModified:now-d*100,window:{sessionId:`w${d}-${w}`,tabs:Array.from({length:25},(_,i) => ({sessionId:`t${d}-${w}-${i}`,title:`${subjects[i%subjects.length][0]} ${w*25+i+1}`,url:`https://example.com/device-${d}/tab-${w*25+i+1}`}))}}))})));
    }
  };
  if (new URLSearchParams(location.search).has('large')) window.demo.large();
})();
