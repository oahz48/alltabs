import { spawnSync } from 'node:child_process';
for (const args of [['scripts/check.mjs'], ['--test', 'tests/*.test.js'], ['tests/browser.mjs'], ['tests/browser.mjs','--extension'], ['scripts/package.mjs']]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log('Release checks passed. See docs/RELEASE.md for the remaining human checks.');
