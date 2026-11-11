// Writes the precache list and a version into sw.js.
// Usage: node scripts/sw-manifest.mjs [version]
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const root = new URL('..', import.meta.url).pathname;
const include = ['index.html', 'manifest.webmanifest', 'css', 'js', 'icons'];
const files = [];
const walk = (p) => { for (const f of readdirSync(p)) { const fp = join(p, f); if (statSync(fp).isDirectory()) walk(fp); else files.push(relative(root, fp)); } };
for (const i of include) { const fp = join(root, i); if (statSync(fp).isDirectory()) walk(fp); else files.push(i); }
files.sort();
const hash = createHash('sha1');
for (const f of files) hash.update(f).update(readFileSync(join(root, f)));
const version = process.argv[2] || hash.digest('hex').slice(0, 10);
const list = ['./', ...files.map((f) => './' + f)];
let sw = readFileSync(join(root, 'sw.js'), 'utf8');
sw = sw.replace(/const VERSION = '[^']*';/, `const VERSION = '${version}';`).replace(/const ASSETS = \[[^\]]*\];/, `const ASSETS = [/*ASSETS*/${list.map((f) => `\n  '${f}'`).join(',')}\n];`);
writeFileSync(join(root, 'sw.js'), sw);
console.log(`sw.js: ${list.length} assets, version ${version}`);
