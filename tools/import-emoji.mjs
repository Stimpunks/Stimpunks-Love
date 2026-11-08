#!/usr/bin/env node
/* Bring a folder of pictures onto the CB as our own emoji, under the names
   given (lib.mjs, "Custom emoji", importEmoji). Ryan's ask, 2026-11-08, for our
   Discord server's emoji, moving with our community.

     node tools/import-emoji.mjs <folder> <names.json>        says what it would do
     node tools/import-emoji.mjs <folder> <names.json> --go   does it

   names.json maps each file in the folder to its name: { "1.png": "lightning" }.
   Every file needs a name and every name a file, or nothing goes.

   Each picture is made at most EMOJI_PX across as a PNG with sips (macOS), as
   the radio's own redraw does in a browser, and importEmoji takes off whatever
   is still written into it. A name the street already has is left out and
   said; nothing is replaced. They go in as the street's (EMOJI_HOUSE), so only
   a moderator takes one down, and they are held to EMOJI_MAX.

   It writes to the live store with this machine's Netlify login (the token in
   the netlify CLI's own config, which it never prints) and the site linked in
   .netlify/state.json. It prints names and counts, nothing else. */
import { readFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir, homedir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getStore } from '@netlify/blobs';
import { importEmoji, readEmoji, emojiName, EMOJI_MAX, EMOJI_PX, EMOJI_BYTES } from '../netlify/cb/lib.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [folder, namesFile] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const go = process.argv.includes('--go');
if (!folder || !namesFile) { console.error('usage: node tools/import-emoji.mjs <folder> <names.json> [--go]'); process.exit(2); }

const names = JSON.parse(readFileSync(namesFile, 'utf8'));
const files = readdirSync(folder).filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f));
const problems = [];
for (const f of files) if (!names[f]) problems.push(`${f} has no name`);
for (const f of Object.keys(names)) if (!files.includes(f)) problems.push(`${f} is named but not in the folder`);
const seen = new Map();
for (const [f, n] of Object.entries(names)) {
  if (!emojiName(n)) problems.push(`${f}: "${n}" is not a name (2 to 32 letters, numbers or underscores, one letter at least)`);
  const k = String(n).toLowerCase();
  if (seen.has(k)) problems.push(`${f} and ${seen.get(k)} are both called ${n}`);
  seen.set(k, f);
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }

function login() {
  const site = JSON.parse(readFileSync(join(ROOT, '.netlify', 'state.json'), 'utf8')).siteId;
  const cfg = JSON.parse(readFileSync(join(homedir(), 'Library', 'Preferences', 'netlify', 'config.json'), 'utf8'));
  const user = (cfg.users || {})[cfg.userId] || Object.values(cfg.users || {})[0];
  const token = user && user.auth && user.auth.token;
  if (!site || !token) throw new Error('No Netlify login or linked site on this machine (netlify login, netlify link).');
  return getStore({ name: 'cb', siteID: site, token });
}

const s = login();
const have = new Set((await readEmoji(s)).map((e) => e.name.toLowerCase()));
const todo = Object.entries(names).sort((a, b) => a[1].localeCompare(b[1]));
const clash = todo.filter(([, n]) => have.has(n.toLowerCase()));
const fresh = todo.filter(([, n]) => !have.has(n.toLowerCase()));
console.log(`The street has ${have.size} of its ${EMOJI_MAX}. ${fresh.length} to add, ${clash.length} already there by name.`);
for (const [f, n] of clash) console.log(`  already there: :${n}: (${f}), left out`);
if (have.size + fresh.length > EMOJI_MAX) { console.error(`That is more than the street keeps (${EMOJI_MAX}).`); process.exit(1); }

const tmp = mkdtempSync(join(tmpdir(), 'emoji-'));
try {
  const ready = fresh.map(([f, n]) => {
    const out = join(tmp, n + '.png');
    execFileSync('sips', ['-Z', String(EMOJI_PX), '-s', 'format', 'png', join(folder, f), '--out', out], { stdio: 'ignore' });
    const bytes = new Uint8Array(readFileSync(out));
    if (bytes.length > EMOJI_BYTES) throw new Error(`${f} is still too big at ${EMOJI_PX} pixels`);
    return [f, n, bytes];
  });
  if (!go) { for (const [f, n, b] of ready) console.log(`  would add :${n}: (${f}, ${b.length} bytes)`); console.log('Nothing sent. Add --go to add them.'); process.exit(0); }
  let added = 0;
  for (const [f, n, bytes] of ready) {
    const r = await importEmoji(n, bytes, s);
    if (r.error) console.log(`  :${n}: (${f}) was not added: ${r.error}`);
    else { added++; console.log(`  added :${n}:`); }
  }
  console.log(`${added} added.`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
