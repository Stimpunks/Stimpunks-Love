#!/usr/bin/env node
/* The Wiki's bot, from a session: Claude keeping the Wiki's pages up to date
   (Ryan's choice, 2026-10-26). Every request is signed with CB_FORUM_BOT_KEY,
   read out of 1Password with `op read` when it runs and never printed, written
   down or put in an argument anybody else could see. The server end is
   netlify/functions/cb-forum-bot.mjs, which can only list, read, start and
   edit pages in the Wiki and in Team Docs, under the name Claude, marked BOT.

     node tools/forum-bot.mjs test
     node tools/forum-bot.mjs cats                     where it may write
     node tools/forum-bot.mjs list [category]          (wiki, unless named)
     node tools/forum-bot.mjs read <topic id>          the page's Markdown, to stdout
     node tools/forum-bot.mjs start <category> <title> <file.md> [--tags a,b]
     node tools/forum-bot.mjs edit <topic id> <file.md> [--title "A new title"]

   STIMPUNKS_BASE (https://stimpunks.world), FORUM_BOT_KEY_REF and
   STIMPUNKS_OP_ACCOUNT override where it goes and where the key is read from. */
import { createHmac } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const BASE = process.env.STIMPUNKS_BASE || 'https://stimpunks.world';
const REF = process.env.FORUM_BOT_KEY_REF || 'op://Secrets/Stimpunks.World CB_FORUM_BOT_KEY Netlify/password';
const ACCOUNT = process.env.STIMPUNKS_OP_ACCOUNT || 'stimpunks.1password.com';

function key() {
  if (process.env.CB_FORUM_BOT_KEY) return process.env.CB_FORUM_BOT_KEY.trim();
  try {
    return execFileSync('op', ['read', '--account', ACCOUNT, REF], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch (e) {
    console.error('The bot’s key could not be read from 1Password. Is `op` signed in to ' + ACCOUNT + '?');
    process.exit(2);
  }
}

async function send(body) {
  const raw = JSON.stringify(body);
  const t = Math.floor(Date.now() / 1000);
  const sig = createHmac('sha256', key()).update(`${t}.${raw}`, 'utf8').digest('hex');
  const r = await fetch(BASE + '/cb/forum/bot', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-stimpunks-signature': `t=${t},v1=${sig}` },
    body: raw,
  });
  let out;
  try { out = await r.json(); } catch (e) { out = { error: `The server answered ${r.status}.` }; }
  if (!r.ok || out.error) { console.error(out.error || `The server answered ${r.status}.`); process.exit(1); }
  return out;
}

function flag(args, name) {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
}

const args = process.argv.slice(2);
const cmd = args.shift();
const link = (id) => `${BASE}/forum.html#/t/${id}`;

if (cmd === 'test') {
  await send({ test: true });
  console.log('The bot is open.');
} else if (cmd === 'cats') {
  const r = await send({ action: 'cats' });
  for (const c of r.cats) console.log(`${c.slug}  ${c.name}${c.parent ? `  (in ${c.parent})` : ''}`);
} else if (cmd === 'list') {
  const r = await send({ action: 'list', cat: args[0] || 'wiki' });
  for (const x of r.topics) console.log(`${x.id}  ${x.title}  (started by ${x.by})`);
} else if (cmd === 'read') {
  const r = await send({ action: 'read', id: args[0] });
  process.stdout.write(`# ${r.page.title}\n\n${r.page.body}\n`);
} else if (cmd === 'start') {
  const tags = flag(args, '--tags');
  const [cat, title, file] = args;
  if (!cat || !title || !file) { console.error('start <category> <title> <file.md> [--tags a,b]'); process.exit(64); }
  const r = await send({ action: 'start', cat, title, body: readFileSync(file, 'utf8'), tags: tags ? tags.split(',') : [] });
  console.log(`Started: ${r.page.title}\n${link(r.page.id)}`);
} else if (cmd === 'edit') {
  const title = flag(args, '--title');
  const [id, file] = args;
  if (!id || !file) { console.error('edit <topic id> <file.md> [--title "A new title"]'); process.exit(64); }
  const body = { action: 'edit', id, body: readFileSync(file, 'utf8') };
  if (title !== undefined) body.title = title;
  const r = await send(body);
  console.log(`Edited: ${r.page.title}\n${link(r.page.id)}`);
} else {
  console.error('test | cats | list [category] | read <id> | start <category> <title> <file.md> [--tags a,b] | edit <id> <file.md> [--title ...]');
  process.exit(64);
}
