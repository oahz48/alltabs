export function safeUrl(value) {
  try {
    const url = new URL(value);
    // Never execute a script or navigate to a foreign extension from synced data.
    return ['http:', 'https:', 'ftp:', 'file:', 'chrome:', 'about:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

export function displayUrl(value) {
  try {
    const url = new URL(value);
    return (url.host + (url.pathname === '/' ? '' : url.pathname)).replace(/^www\./, '') || value;
  } catch { return value || 'Address unavailable'; }
}

function makeTab(tab, key) {
  const url = tab.url || tab.pendingUrl || '';
  return { key, title: tab.title || displayUrl(url) || 'Untitled tab', url, openUrl: safeUrl(url) };
}

export function normalizeDevices(remote, local) {
  const occurrences = new Map();
  const devices = remote.map(device => {
    const name = device.deviceName || 'Unnamed device';
    const occurrence = occurrences.get(name) || 0;
    occurrences.set(name, occurrence + 1);
    // Chrome exposes a name, but no persistent foreign device ID.
    const key = `remote:${JSON.stringify([name, occurrence])}`;
    return {
      key, name, local: false,
      modified: Math.max(0, ...device.sessions.map(session => session.lastModified || 0)),
      windows: device.sessions.map((session, i) => {
        const windowKey = `${key}:window:${session.window?.sessionId || session.tab?.sessionId || i}`;
        return {
          key: windowKey,
          tabs: (session.window?.tabs || (session.tab ? [session.tab] : [])).map((tab, j) =>
            makeTab(tab, `${windowKey}:tab:${tab.sessionId || j}`))
        };
      }).filter(window => window.tabs.length)
    };
  }).sort((a, b) => b.modified - a.modified || a.name.localeCompare(b.name));
  const windows = new Map();
  for (const tab of local) {
    if (tab.incognito) continue;
    const key = `local:window:${tab.windowId}`;
    if (!windows.has(key)) windows.set(key, { key, tabs: [] });
    windows.get(key).tabs.push(makeTab(tab, `local:tab:${tab.id}`));
  }
  devices.push({ key: 'local', name: 'This device', local: true, modified: 0, windows: [...windows.values()] });
  return devices;
}

export function allTabs(device) { return device.windows.flatMap(window => window.tabs); }

export function filterDevices(devices, query, hidden = []) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return devices.filter(device => !hidden.includes(device.key)).map(device => ({
    ...device,
    windows: device.windows.map(window => ({
      ...window,
      tabs: window.tabs.filter(tab => terms.every(term => `${tab.title} ${tab.url}`.toLocaleLowerCase().includes(term)))
    })).filter(window => window.tabs.length)
  })).filter(device => !terms.length || device.windows.length);
}

export function relativeTime(seconds, now = Date.now()) {
  if (!seconds) return 'Sync time unavailable';
  const minutes = Math.max(0, Math.floor((now / 1000 - seconds) / 60));
  if (minutes < 1) return 'Synced just now';
  if (minutes < 60) return `Synced ${minutes}m ago`;
  if (minutes < 1440) return `Synced ${Math.floor(minutes / 60)}h ago`;
  return `Synced ${Math.floor(minutes / 1440)}d ago`;
}

export async function openTabs(tabs, create, windowId, active = false) {
  let opened = 0;
  let failed = 0;
  // Sequential creation keeps the selected order and avoids a burst of requests.
  for (const tab of tabs) {
    if (!tab.openUrl) { failed++; continue; }
    try { await create({ url: tab.openUrl, active, windowId }); opened++; }
    catch { failed++; }
  }
  return { opened, failed };
}
