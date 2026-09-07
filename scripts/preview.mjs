import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function startPreview(port = 4173) {
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      let pathname = decodeURIComponent(url.pathname);
      if (['/store.html', '/promo.html'].includes(pathname)) {
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        response.end(await readFile(path.join(root, 'tests', pathname.slice(1))));
        return;
      }
      if (pathname === '/_favicon/') pathname = '/icons/icon-16.png';
      const isPanel = pathname === '/' || pathname === '/panel.html';
      const filename = pathname === '/preview-api.js' ? path.join(root, 'tests/preview-api.js') : path.resolve(root, 'extension', '.' + (isPanel ? '/panel.html' : pathname));
      if (filename !== path.join(root, 'tests/preview-api.js') && !filename.startsWith(path.join(root, 'extension') + path.sep)) {
        response.writeHead(403); response.end(); return;
      }
      let body = await readFile(filename);
      if (isPanel) body = Buffer.from(body.toString().replace('<script type="module"', '<script src="/preview-api.js"></script><script type="module"'));
      const types = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml' };
      response.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      response.end(body);
    } catch { response.writeHead(404); response.end('Not found'); }
  });
  return new Promise(resolve => server.listen(port, '127.0.0.1', () => resolve(server)));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = await startPreview();
  console.log(`Alltabs demo (sample data): http://127.0.0.1:${server.address().port}`);
}
