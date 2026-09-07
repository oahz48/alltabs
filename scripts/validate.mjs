import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

export async function validateExtension() {
  const allowed = ['background.js','model.js','panel.js','panel.html','panel.css','manifest.json','icons/icon-16.png','icons/icon-32.png','icons/icon-48.png','icons/icon-128.png','icons/mark.svg'];
  async function walk(dir, prefix = '') {
    const files = [];
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      assert.ok(!entry.isSymbolicLink(), `Symlink forbidden: ${prefix}${entry.name}`);
      if (entry.isDirectory()) files.push(...await walk(`${dir}/${entry.name}`, `${prefix}${entry.name}/`));
      else files.push(`${prefix}${entry.name}`);
    }
    return files;
  }
  assert.deepEqual((await walk('extension')).sort(), allowed.sort(), 'Review and explicitly allow new packaged files');
  const manifest = JSON.parse(await readFile('extension/manifest.json', 'utf8'));
  assert.equal(manifest.manifest_version, 3);
  assert.match(manifest.version, /^\d+(\.\d+){0,3}$/);
  assert.ok(manifest.description.length <= 132);
  assert.deepEqual([...manifest.permissions].sort(), ['sidePanel','sessions','tabs','storage','favicon','clipboardWrite'].sort());
  assert.equal(manifest.host_permissions, undefined);
  assert.equal(manifest.content_scripts, undefined);
  assert.equal(manifest.background.service_worker, 'background.js');
  assert.equal(manifest.side_panel.default_path, 'panel.html');
  assert.equal(manifest.content_security_policy.extension_pages, "script-src 'self'; object-src 'none'; base-uri 'none'; connect-src 'none'");
  for (const size of [16,32,48,128]) {
    const data = await readFile(`extension/icons/icon-${size}.png`);
    assert.equal(data.subarray(0,8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(data.readUInt32BE(16), size);
    assert.equal(data.readUInt32BE(20), size);
  }
  for (const dir of ['extension', 'scripts', 'tests']) {
    for (const file of await walk(dir)) {
      if (!/\.(mjs|js)$/.test(file)) continue;
      const result = spawnSync(process.execPath, ['--check', `${dir}/${file}`], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr || `Could not check ${file}`);
    }
  }
  console.log('Release validation passed: manifest, permission baseline, icons, packaged files, JavaScript syntax.');
}
