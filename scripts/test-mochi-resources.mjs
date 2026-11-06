// Check the complete locally bundled renderer, including its MIT license.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const source = fileURLToPath(new URL('../shared/mochi-scenes/', import.meta.url));
const destination = resolve(process.argv[2] ?? 'windows/dist/mochi-scenes');
for (const name of readdirSync(source)) {
  assert.deepEqual(readFileSync(resolve(destination, name)), readFileSync(resolve(source, name)), `Bundled resource differs: ${name}`);
}
console.log('All shared scene resources and their license match the source.');
