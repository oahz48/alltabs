import { readFileSync, writeFileSync } from 'node:fs';
const pages = {'/':readFileSync('website/index.html','utf8'), '/privacy':readFileSync('docs/privacy.html','utf8')};
const assets = Object.fromEntries([['/assets/icon.png', 'extension/icons/icon-128.png'], ['/assets/panel-preview.png', 'website/assets/panel-preview.png']].map(([url, file]) => [url, readFileSync(file).toString('base64')]));
const code = `const pages = ${JSON.stringify(pages)};
const assets = ${JSON.stringify(assets)};
addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  const path = url.pathname === '/privacy/' || url.pathname === '/privacy.html' ? '/privacy' : url.pathname;
  const isAsset = Object.hasOwn(assets, path);
  const body = isAsset ? Uint8Array.from(atob(assets[path]), c => c.charCodeAt(0)) : Object.hasOwn(pages, path) ? pages[path] : undefined;
  const allowed = request.method === 'GET' || request.method === 'HEAD';
  event.respondWith(new Response(request.method === 'HEAD' ? null : (allowed ? (body || 'Not found') : 'Method not allowed'), {status: !allowed ? 405 : body ? 200 : 404, headers: {
    'Content-Type': !allowed ? 'text/plain; charset=utf-8' : isAsset ? 'image/png' : body ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8',
    'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'public, max-age=300',
    ...(!allowed ? {Allow: 'GET, HEAD'} : {})
  }}));
});
`;
writeFileSync('website/worker.js', code);
