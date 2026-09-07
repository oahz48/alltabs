import { normalizeDevices, filterDevices, allTabs, displayUrl, relativeTime, openTabs } from './model.js';

const $ = selector => document.querySelector(selector);
const paths = {
  refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 7a7 7 0 0 1 11.6-1L20 9M4 15l2.3 3A7 7 0 0 0 18 17"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="var(--bg)"/><circle cx="15" cy="17" r="3" fill="var(--bg)"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  computer: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4"/>',
  tabs: '<rect x="3" y="7" width="14" height="14" rx="3"/><path d="M8 3h10a3 3 0 0 1 3 3v10"/>'
};
function icon(name) {
  const span = document.createElement('span');
  // Only fixed, bundled artwork enters this markup. Tab titles and URLs use textContent.
  span.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.tabs}</svg>`;
  return span;
}
for (const target of document.querySelectorAll('[data-icon]')) target.append(icon(target.dataset.icon));
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

let devices = [], prefs = { expanded: {}, hidden: {}, showLocal: true };
let windowId, uiKey, scrollTimer, refreshTimer, toastTimer, bulkResolve;
let query = '', selected = new Set(), loading = false, busy = false, lastSnapshot = '';
let pendingScroll = null;
const list = $('#list');

function toast(message) {
  $('#toast').textContent = message;
  $('#toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4000);
}
function report(message) { $('#error').textContent = message; $('#error').hidden = false; }
function clearError() { $('#error').hidden = true; }
function persistPrefs() {
  chrome.storage.local.set({ preferences: prefs }).catch(() => report('Could not save preferences. Your changes may not survive closing Chrome.'));
}
function persistUI() {
  if (!uiKey) return;
  chrome.storage.session.set({ [uiKey]: { query, scroll: list.scrollTop, selected: [...selected] } }).catch(() => {});
}
function hiddenKeys() { return [...Object.keys(prefs.hidden), ...(prefs.showLocal ? [] : ['local'])]; }
function visibleDevices() { return filterDevices(devices, query, hiddenKeys()); }
function selectedTabs() { return devices.flatMap(allTabs).filter(tab => selected.has(tab.key)); }
function updateSelection() {
  $('#selection-bar').hidden = selected.size === 0;
  $('#footer').hidden = selected.size > 0;
  $('#selection-count').textContent = `${selected.size} selected`;
  $('#open-selected').disabled = busy;
  $('#copy-selected').disabled = busy;
  for (const row of list.querySelectorAll('.tab-row')) {
    const checked = selected.has(row.dataset.key);
    row.classList.toggle('selected', checked);
    row.querySelector('input').checked = checked;
  }
  persistUI();
}

async function confirmBulk(count) {
  if (count <= 20) return true;
  $('#bulk-description').textContent = `This will open ${count} new tabs in this window, in the background.`;
  $('#bulk-confirm').textContent = `Open ${count} tabs`;
  $('#bulk-dialog').showModal();
  return new Promise(resolve => { bulkResolve = resolve; });
}
function finishBulk(confirmed) {
  $('#bulk-dialog').close();
  bulkResolve?.(confirmed);
  bulkResolve = null;
}
$('#bulk-confirm').addEventListener('click', () => finishBulk(true));
$('#bulk-cancel').addEventListener('click', () => finishBulk(false));
$('#bulk-dialog').addEventListener('cancel', event => { event.preventDefault(); finishBulk(false); });

async function launch(tabs, active = false) {
  if (busy || !tabs.length) return;
  busy = true;
  updateSelection();
  try {
    if (!await confirmBulk(tabs.length)) return;
    const result = await openTabs(tabs, props => chrome.tabs.create(props), windowId, active);
    if (result.failed) toast(`Opened ${result.opened}. ${result.failed} could not be opened.`);
    else if (!active || tabs.length > 1) toast(`Opened ${result.opened} ${result.opened === 1 ? 'tab' : 'tabs'} in the background.`);
  } finally { busy = false; updateSelection(); scheduleRefresh(); }
}

function makeRow(tab) {
  const row = el('div', 'tab-row');
  row.dataset.key = tab.key;
  const check = el('input');
  check.type = 'checkbox';
  check.dataset.focus = `${tab.key}:check`;
  check.setAttribute('aria-label', `Select ${tab.title}`);
  check.disabled = !tab.openUrl;
  check.addEventListener('change', () => {
    if (check.checked) selected.add(tab.key); else selected.delete(tab.key);
    updateSelection();
  });
  const link = el('a', 'tab-link');
  link.dataset.focus = `${tab.key}:link`;
  link.href = tab.openUrl || '#';
  link.title = `${tab.title}\n${tab.url || 'Address unavailable'}`;
  if (!tab.openUrl) link.setAttribute('aria-disabled', 'true');
  const favicon = el('span', 'favicon', displayUrl(tab.url).charAt(0).toUpperCase() || '·');
  favicon.setAttribute('aria-hidden', 'true');
  if (/^https?:/i.test(tab.openUrl || '')) {
    const img = el('img');
    img.alt = ''; img.loading = 'lazy';
    const url = new URL(chrome.runtime.getURL('/_favicon/'));
    url.searchParams.set('pageUrl', tab.openUrl); url.searchParams.set('size', '32');
    img.src = url.href;
    img.addEventListener('error', () => img.remove());
    favicon.replaceChildren(img);
  }
  const text = el('span', 'tab-text');
  text.append(el('span', 'tab-title', tab.title), el('span', 'tab-url', displayUrl(tab.url)));
  link.append(favicon, text);
  const activate = event => {
    if (event.type === 'auxclick' && event.button !== 1) return;
    event.preventDefault();
    if (!tab.openUrl) return toast('Chrome did not provide an address that can be opened.');
    void launch([tab], !(event.ctrlKey || event.metaKey || event.button === 1));
  };
  link.addEventListener('click', activate);
  link.addEventListener('auxclick', activate);
  row.append(check, link);
  return row;
}

function makeDevice(device) {
  const section = el('section', 'device');
  section.dataset.device = device.key;
  const header = el('div', 'device-header');
  const toggle = el('button', 'device-toggle');
  toggle.dataset.focus = `${device.key}:toggle`;
  // Search reveals matches without overwriting the user's saved expansion choice.
  const expanded = query.trim() ? true : (prefs.expanded[device.key] ?? !device.local);
  toggle.setAttribute('aria-expanded', String(expanded));
  const symbol = icon(/phone|android|pixel|iphone|ipad|tablet/i.test(device.name) ? 'phone' : 'computer');
  symbol.className = 'device-symbol';
  const info = el('span', 'device-info');
  info.append(el('span', 'device-name', device.name));
  const time = el('span', 'device-time', device.local ? 'On this computer' : relativeTime(device.modified));
  if (device.modified) time.title = new Date(device.modified * 1000).toLocaleString();
  info.append(time);
  const count = allTabs(device).length;
  const countEl = el('span', 'tab-count', String(count));
  countEl.setAttribute('aria-label', `${count} tabs`);
  const chevron = icon('chevron'); chevron.className = 'chevron';
  toggle.append(symbol, info, countEl, chevron);
  const body = el('div', 'device-body'); body.hidden = !expanded;
  toggle.addEventListener('click', () => {
    const next = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(next));
    body.hidden = !next;
    if (!query.trim()) { prefs.expanded[device.key] = next; persistPrefs(); }
    persistUI();
  });
  const menu = el('details', 'device-menu'); menu.dataset.key = device.key;
  const trigger = el('summary', 'icon-button');
  trigger.dataset.focus = `${device.key}:menu`;
  trigger.setAttribute('aria-label', `Actions for ${device.name}`);
  trigger.title = `Actions for ${device.name}`;
  trigger.append(icon('more'));
  const content = el('div', 'menu-content');
  function action(label, callback) {
    const button = el('button', '', label);
    button.addEventListener('click', () => { menu.open = false; callback(); });
    content.append(button);
  }
  action(query.trim() ? 'Open matching tabs' : 'Open all tabs', () => void launch(allTabs(device)));
  action(query.trim() ? 'Select matching tabs' : 'Select all tabs', () => {
    allTabs(device).filter(tab => tab.openUrl).forEach(tab => selected.add(tab.key));
    updateSelection();
  });
  if (!device.local) action('Hide device', () => {
    prefs.hidden[device.key] = device.name;
    allTabs(devices.find(item => item.key === device.key)).forEach(tab => selected.delete(tab.key));
    persistPrefs(); render(); toast('Device hidden. Restore it in settings.');
  });
  menu.append(trigger, content);
  menu.addEventListener('toggle', () => {
    if (menu.open) for (const other of list.querySelectorAll('.device-menu')) if (other !== menu) other.open = false;
  });
  header.append(toggle, menu);
  device.windows.forEach((window, i) => {
    if (device.windows.length > 1) body.append(el('div', 'window-label', `Window ${i + 1} · ${window.tabs.length} tabs`));
    for (const tab of window.tabs) body.append(makeRow(tab));
  });
  if (!device.windows.length) body.append(el('p', 'muted window-label', 'No tabs available'));
  section.append(header, body);
  return section;
}

function render() {
  const scroll = pendingScroll ?? list.scrollTop;
  pendingScroll = null;
  const focusKey = document.activeElement?.dataset.focus;
  const openMenu = list.querySelector('.device-menu[open]')?.dataset.key;
  const previousRows = [...list.querySelectorAll('.tab-row')];
  const anchor = previousRows.find(row => row.getBoundingClientRect().bottom > list.getBoundingClientRect().top && row.getBoundingClientRect().height > 0);
  const anchorOffset = anchor ? anchor.getBoundingClientRect().top - list.getBoundingClientRect().top : 0;
  const shown = visibleDevices();
  const count = shown.reduce((sum, device) => sum + allTabs(device).length, 0);
  const remoteCount = shown.filter(device => !device.local).length;
  $('#summary').textContent = query.trim() ? `${count} ${count === 1 ? 'matching tab' : 'matching tabs'}` : `${remoteCount} ${remoteCount === 1 ? 'remote device' : 'remote devices'} · ${count} tabs`;
  const fragment = document.createDocumentFragment();
  if (query.trim() && !count) {
    const empty = el('div', 'empty');
    empty.append(icon('search'), el('h2', '', 'No matching tabs'), el('p', '', 'Try a different title or part of an address.'));
    const clear = el('button', 'secondary', 'Clear search'); clear.addEventListener('click', () => { $('#search').value = ''; setQuery(''); $('#search').focus(); });
    empty.append(clear); fragment.append(empty);
  } else {
    if (!remoteCount && !query.trim()) {
      const empty = el('div', 'empty');
      empty.append(icon('tabs'), el('h2', '', Object.keys(prefs.hidden).length ? 'Your devices are hidden' : 'Your other tabs belong here'), el('p', '', Object.keys(prefs.hidden).length ? 'Restore a device in settings to see its tabs again.' : 'Sign into the same Chrome profile on your other devices and enable history and open-tab sync.'));
      const help = el('button', 'secondary', Object.keys(prefs.hidden).length ? 'Manage hidden devices' : 'How to connect your devices');
      help.addEventListener('click', () => Object.keys(prefs.hidden).length ? showSettings() : $('#help-dialog').showModal());
      empty.append(help); fragment.append(empty);
    }
    for (const device of shown) fragment.append(makeDevice(device));
  }
  list.replaceChildren(fragment);
  updateSelection();
  if (openMenu) for (const menu of list.querySelectorAll('.device-menu')) if (menu.dataset.key === openMenu) menu.open = true;
  if (focusKey) for (const target of list.querySelectorAll('[data-focus]')) if (target.dataset.focus === focusKey) { target.focus({ preventScroll: true }); break; }
  list.scrollTop = scroll;
  if (anchor && scroll > 0) {
    const replacement = [...list.querySelectorAll('.tab-row')].find(row => row.dataset.key === anchor.dataset.key);
    if (replacement?.getBoundingClientRect().height) list.scrollTop += replacement.getBoundingClientRect().top - list.getBoundingClientRect().top - anchorOffset;
  }
  persistUI();
}

async function refresh(manual = false) {
  if (loading || busy) return;
  loading = true;
  $('#refresh').classList.add('busy'); $('#refresh').disabled = true;
  $('#activity').textContent = 'Checking…';
  try {
    const [remote, local] = await Promise.all([chrome.sessions.getDevices(), chrome.tabs.query({})]);
    const next = normalizeDevices(remote, local.filter(tab => !tab.url?.startsWith(chrome.runtime.getURL(''))));
    const snapshot = JSON.stringify(next);
    devices = next;
    const available = new Set(filterDevices(devices, '', hiddenKeys()).flatMap(allTabs).filter(tab => tab.openUrl).map(tab => tab.key));
    selected = new Set([...selected].filter(key => available.has(key)));
    if (snapshot !== lastSnapshot) { lastSnapshot = snapshot; render(); }
    else {
      for (const section of list.querySelectorAll('.device')) {
        const device = devices.find(item => item.key === section.dataset.device);
        if (device && !device.local) section.querySelector('.device-time').textContent = relativeTime(device.modified);
      }
    }
    clearError();
    $('#freshness').textContent = `Checked ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    $('#freshness').title = 'Latest snapshot from Chrome. Remote devices may take time to sync.';
    if (manual) toast('Updated from Chrome’s latest snapshot.');
  } catch (error) {
    report('Could not read tabs from Chrome. Your previous list is still shown. Try Refresh.');
    $('#freshness').textContent = 'Refresh unavailable';
    if (!lastSnapshot) {
      list.replaceChildren(el('div', 'empty', 'Your tabs will appear here when Chrome is available.'));
    }
    console.error('Unable to read tabs:', error);
  } finally {
    loading = false; $('#refresh').classList.remove('busy'); $('#refresh').disabled = false; $('#activity').textContent = '';
  }
}
function scheduleRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => { if (!document.hidden) void refresh(); }, 700);
}
function setQuery(value) {
  query = value;
  list.scrollTop = 0;
  render();
}
$('#search').addEventListener('input', event => setQuery(event.target.value));
list.addEventListener('scroll', () => { clearTimeout(scrollTimer); scrollTimer = setTimeout(persistUI, 120); }, { passive: true });
window.addEventListener('pagehide', persistUI);
document.addEventListener('visibilitychange', () => { if (document.hidden) persistUI(); else void refresh(); });
$('#refresh').addEventListener('click', () => void refresh(true));
$('#close').addEventListener('click', async () => {
  persistUI();
  try { await chrome.sidePanel.close({ windowId }); }
  catch { report('Could not close the panel. Use Chrome’s close button at the top of the side panel.'); }
});
$('#clear-selection').addEventListener('click', () => { selected.clear(); updateSelection(); });
$('#open-selected').addEventListener('click', () => void launch(selectedTabs()));
$('#copy-selected').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(selectedTabs().map(tab => tab.openUrl).filter(Boolean).join('\n'));
    toast(`Copied ${selected.size} ${selected.size === 1 ? 'link' : 'links'}.`);
  } catch { toast('Could not copy links. Keep the panel focused and try again.'); }
});
function showSettings() {
  $('#show-local').checked = prefs.showLocal;
  $('#hidden-devices').replaceChildren();
  for (const [key, name] of Object.entries(prefs.hidden)) {
    const row = el('div', 'hidden-device');
    const restore = el('button', '', 'Restore');
    restore.setAttribute('aria-label', `Restore ${name}`);
    restore.addEventListener('click', () => { delete prefs.hidden[key]; persistPrefs(); render(); showSettings(); });
    row.append(el('span', '', name), restore); $('#hidden-devices').append(row);
  }
  if (!Object.keys(prefs.hidden).length) $('#hidden-devices').append(el('p', 'muted', 'No hidden devices.'));
  if (!$('#settings-dialog').open) $('#settings-dialog').showModal();
}
$('#settings').addEventListener('click', showSettings);
$('#show-local').addEventListener('change', event => {
  prefs.showLocal = event.target.checked;
  if (!prefs.showLocal) allTabs(devices.find(device => device.local) || { windows: [] }).forEach(tab => selected.delete(tab.key));
  persistPrefs(); render();
});
$('#help').addEventListener('click', () => $('#help-dialog').showModal());
$('#native-history').addEventListener('click', () => void launch([{ openUrl: 'chrome://history/syncedTabs' }], true));
for (const button of document.querySelectorAll('[data-dismiss]')) button.addEventListener('click', () => button.closest('dialog').close());
document.addEventListener('click', event => {
  for (const menu of list.querySelectorAll('.device-menu[open]')) if (!menu.contains(event.target)) menu.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && !document.querySelector('dialog[open]')) {
    event.preventDefault(); $('#search').focus();
  }
  if (event.key === 'Escape' && !document.querySelector('dialog[open]')) {
    for (const menu of list.querySelectorAll('.device-menu[open]')) menu.open = false;
    if (document.activeElement === $('#search') && query) { $('#search').value = ''; setQuery(''); }
  }
});

async function initialize() {
  try {
    const [current, stored] = await Promise.all([chrome.windows.getCurrent(), chrome.storage.local.get('preferences')]);
    windowId = current.id; uiKey = `panel:${windowId}`;
    prefs = { ...prefs, ...stored.preferences, expanded: stored.preferences?.expanded || {}, hidden: stored.preferences?.hidden || {} };
    const saved = (await chrome.storage.session.get(uiKey))[uiKey];
    if (saved) { query = saved.query || ''; selected = new Set(saved.selected || []); pendingScroll = saved.scroll || 0; }
    $('#search').value = query;
    $('#version').textContent = chrome.runtime.getManifest().version;
    await refresh();
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local' || !changes.preferences) return;
      const value = changes.preferences.newValue;
      prefs = { showLocal: true, ...value, expanded: value?.expanded || {}, hidden: value?.hidden || {} };
      const available = new Set(filterDevices(devices, '', hiddenKeys()).flatMap(allTabs).map(tab => tab.key));
      selected = new Set([...selected].filter(key => available.has(key)));
      render();
      if ($('#settings-dialog').open) showSettings();
    });
    for (const event of [chrome.tabs.onCreated, chrome.tabs.onRemoved, chrome.tabs.onUpdated]) event.addListener(scheduleRefresh);
    setInterval(() => { if (!document.hidden) void refresh(); }, 30000);
  } catch (error) {
    report('Alltabs could not start. Reload the extension from Chrome’s Extensions page, then reopen the panel.');
    console.error(error);
  }
}
void initialize();
