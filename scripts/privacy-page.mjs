import { readFileSync, writeFileSync } from 'node:fs';
for (const file of ['PRIVACY.md','README.md','ROADMAP.md']) writeFileSync(file,readFileSync(file,'utf8').trimEnd()+'\n');
const escape = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const inline = text => escape(text).replace(/`([^`]+)`/g,'<code>$1</code>');
const blocks = readFileSync('PRIVACY.md','utf8').trim().split(/\r?\n\r?\n/).map(block => {
  if (block.startsWith('# ')) return `<h1>${inline(block.slice(2))}</h1>`;
  if (block.startsWith('## ')) return `<h2>${inline(block.slice(3))}</h2>`;
  if (block.startsWith('- ')) return `<ul>${block.split(/\r?\n/).map(line=>`<li>${inline(line.slice(2))}</li>`).join('')}</ul>`;
  if (block.startsWith('|')) return `<table>${block.split(/\r?\n/).filter((_,i)=>i!==1).map((line,i)=>`<tr>${line.split('|').slice(1,-1).map(cell=>`<${i?'td':'th'}>${inline(cell.trim())}</${i?'td':'th'}>`).join('')}</tr>`).join('')}</table>`;
  return `<p>${inline(block)}</p>`;
}).join('\n');
writeFileSync('docs/privacy.html',`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Alltabs Privacy Policy</title><style>body{max-width:850px;margin:50px auto;padding:0 24px;color:#18181b;background:#ffffff;font:17px/1.65 system-ui,sans-serif}h1,h2{line-height:1.2}table{border-collapse:collapse;width:100%;font-size:15px}td,th{text-align:left;border-bottom:1px solid #e4e4e7;padding:10px;vertical-align:top}code{font-size:.9em}li{margin:8px 0}</style><main>${blocks}</main></html>\n`);
