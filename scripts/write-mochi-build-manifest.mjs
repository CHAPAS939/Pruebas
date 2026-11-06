import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [directory, platform, architecture] = process.argv.slice(2);
if (!directory || !['macOS', 'Windows'].includes(platform) || !architecture) throw Error('Usage: directory macOS|Windows architecture');
const output = resolve(directory);
const preview = JSON.parse(readFileSync(resolve(root, 'mochi-preview.json'), 'utf8'));
const files = readdirSync(output).filter(name => /\.(?:dmg|exe|msi|zip)$/.test(name));
if (!files.length) throw Error('No compiled installers: refusing to create a build manifest.');
for (const feature of ['home.js', 'perch.js']) readFileSync(resolve(root, 'shared/mochi-scenes', feature));
const artifacts = files.sort().map(name => {
  const path = resolve(output, name);
  return { name, size_bytes: statSync(path).size, sha256: createHash('sha256').update(readFileSync(path)).digest('hex') };
});
const signaturePath = resolve(output, 'signature-status.json');
let signature = platform === 'macOS' ? 'ad-hoc; not notarized' : 'unsigned';
try { signature = JSON.parse(readFileSync(signaturePath, 'utf8')).status; } catch {}
const manifest = { product: 'Coucou', channel: 'Mochi Studio community beta', version: preview.version, official_release: false, features: ['home', 'perch'],
  source_commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  source_base: 'b1bc09de7f7c24a80bd8eca5729b8bee60f66402', platform, architecture,
  signature, artifacts };
writeFileSync(resolve(output, 'build-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(resolve(output, 'SHA256SUMS.txt'), artifacts.map(a => `${a.sha256}  ${a.name}`).join('\n') + '\n');
console.log(JSON.stringify(manifest, null, 2));
