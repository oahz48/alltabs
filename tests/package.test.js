import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { inflateRawSync } from 'node:zlib';

test('release ZIP is reproducible and every extracted entry matches source', () => {
  const build = () => {
    const result = spawnSync(process.execPath, ['scripts/package.mjs'], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const manifest = JSON.parse(readFileSync('extension/manifest.json', 'utf8'));
    return readFileSync(`dist/alltabs-${manifest.version}.zip`);
  };
  const zip = build();
  assert.deepEqual(build(), zip);
  const end = zip.length - 22;
  assert.equal(zip.readUInt32LE(end), 0x06054b50);
  const count = zip.readUInt16LE(end + 10);
  let offset = zip.readUInt32LE(end + 16);
  const names = [];
  for (let i = 0; i < count; i++) {
    assert.equal(zip.readUInt32LE(offset), 0x02014b50);
    const length = zip.readUInt16LE(offset + 28);
    const name = zip.subarray(offset + 46, offset + 46 + length).toString();
    assert.ok(!name.includes('..') && !name.startsWith('/'));
    names.push(name);
    const local = zip.readUInt32LE(offset + 42);
    assert.equal(zip.readUInt32LE(local), 0x04034b50);
    const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    const data = inflateRawSync(zip.subarray(start, start + zip.readUInt32LE(offset + 20)));
    assert.equal(data.length, zip.readUInt32LE(offset + 24));
    assert.deepEqual(data, readFileSync(`extension/${name}`));
    offset += 46 + length + zip.readUInt16LE(offset + 30) + zip.readUInt16LE(offset + 32);
  }
  assert.equal(offset, end);
  assert.ok(names.includes('manifest.json'));
  assert.equal(new Set(names).size, count);
});
