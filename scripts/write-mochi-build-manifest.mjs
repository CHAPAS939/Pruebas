import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [directory, platform, architecture] = process.argv.slice(2);
if (!directory || !['macOS', 'Windows'].includes(platform) || !architecture) throw Error('Usage: directory macOS|Windows architecture');
const output = resolve(directory);
const files = readdirSync(output).filter(name => /\.(?:dmg|exe|msi|zip)$/.test(name));
if (!files.length) throw Error('No compiled installers: refusing to create a build manifest.');
for (const feature of ['home.js', 'perch.js']) readFileSync(resolve(root, 'shared/mochi-scenes', feature));
const artifacts = files.sort().map(name => {
  const path = resolve(output, name);
  return { name, size_bytes: statSync(path).size, sha256: createHash('sha256').update(readFileSync(path)).digest('hex') };
});
const manifest = { product: 'Coucou', channel: 'Mochi preview', features: ['home', 'perch'],
  source_commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  source_base: 'b1bc09de7f7c24a80bd8eca5729b8bee60f66402', platform, architecture,
  signature: platform === 'macOS' ? 'ad-hoc; not notarized' : 'unsigned', artifacts };
writeFileSync(resolve(output, 'build-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(resolve(output, 'SHA256SUMS.txt'), artifacts.map(a => `${a.sha256}  ${a.name}`).join('\n') + '\n');
console.log(JSON.stringify(manifest, null, 2));
