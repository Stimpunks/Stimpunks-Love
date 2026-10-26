#!/usr/bin/env node
/* Every Netlify function loads, the way Netlify loads it.

   node --check reads a file's syntax and nothing more: an import of a name the
   module it names does not export passes it, and fails only when the module is
   loaded. On 2026-10-25 an edit put staffShut into cb-channel's and
   cb-transmit's first import, which is node:crypto, and both answered 502 on
   the live site until the next deploy: the radio could neither listen nor
   send. The CB's tests import lib.mjs, never the functions, so nothing here
   caught it. This imports every file in netlify/functions and refuses any that
   does not load. It calls nothing, so no function runs and nothing is sent. */
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'netlify', 'functions');
const files = readdirSync(dir).filter((f) => f.endsWith('.mjs')).sort();
const bad = [];
for (const f of files) {
  try {
    const m = await import(pathToFileURL(join(dir, f)).href);
    if (typeof m.default !== 'function') bad.push(`${f}: it has no default export, so Netlify has nothing to run.`);
  } catch (e) {
    bad.push(`${f}: ${String(e && e.message || e).split('\n')[0]}`);
  }
}
if (bad.length) {
  console.log('REFUSING:\n  ' + bad.join('\n  '));
  process.exit(1);
}
console.log('functions: every one loads, the way Netlify loads it.');
