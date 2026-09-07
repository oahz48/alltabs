import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

// Rasterize our geometric mark with supersampling; no build dependency is needed.
function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type);
  const size = Buffer.alloc(4); size.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([size, name, data, crc]);
}
function rounded(x, y, left, top, width, height, radius) {
  const dx = Math.max(left + radius - x, 0, x - (left + width - radius));
  const dy = Math.max(top + radius - y, 0, y - (top + height - radius));
  return x >= left && x <= left + width && y >= top && y <= top + height && dx * dx + dy * dy <= radius * radius;
}
function pixel(x, y) {
  if (!rounded(x,y,2,2,124,124,30)) return [0,0,0,0];
  let color = [27,68,58,255];
  if (rounded(x,y,49,25,51,63,12)) color = [105,196,165,255];
  if (rounded(x,y,28,42,53,63,12)) color = [239,250,243,255];
  if (rounded(x,y,37,51,35,45,5)) color = [27,68,58,255];
  return color;
}
mkdirSync('extension/icons', { recursive: true });
for (const size of [16,32,48,128]) {
  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const total = [0,0,0,0];
    for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
      // Store icons need 16px transparent padding around a 96px square mark.
      const px = (x+(sx+.5)/4)*128/size, py = (y+(sy+.5)/4)*128/size;
      const rgba = size === 128 ? pixel((px-16)*128/96,(py-16)*128/96) : pixel(px,py);
      for (let c=0;c<4;c++) total[c] += rgba[c];
    }
    for (let c=0;c<4;c++) raw[y*(1+size*4)+1+x*4+c]=Math.round(total[c]/16);
  }
  const ihdr=Buffer.alloc(13); ihdr.writeUInt32BE(size); ihdr.writeUInt32BE(size,4); ihdr[8]=8; ihdr[9]=6;
  writeFileSync(`extension/icons/icon-${size}.png`,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]));
}
writeFileSync('extension/icons/mark.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect x="2" y="2" width="124" height="124" rx="30" fill="#1b443a"/><rect x="49" y="25" width="51" height="63" rx="12" fill="#69c4a5"/><rect x="28" y="42" width="53" height="63" rx="12" fill="#effaf3"/><rect x="37" y="51" width="35" height="45" rx="5" fill="#1b443a"/></svg>');
console.log('Generated icons at 16, 32, 48, and 128 px.');
