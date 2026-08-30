import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('package.json has no lifecycle dropper', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.scripts?.postinstall, undefined);
  assert.equal(pkg.scripts?.preinstall, undefined);
});

test('Dockerfile ignores npm lifecycle scripts', () => {
  const docker = readFileSync(join(root, 'Dockerfile'), 'utf8');
  assert.match(docker, /npm install --omit=dev --ignore-scripts/);
});
