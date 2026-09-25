/* =============================================================================
   The CB — what every one of its functions shares.

   THE ONLY SERVER-SIDE CODE ON THIS SITE, and it is small on purpose. Everything
   else on stimpunks.world is a file Netlify serves as-is; this is the one place
   a request is answered by a program, and privacy.html says in plain words what
   it keeps. Every promise on that page is enforced here or in the functions
   beside it, so read that page before changing anything in this directory.

     · TEN MESSAGES AT MOST, AND NONE OF THEM PAST MIDNIGHT IN COLORADO. The whole
       channel is one JSON blob holding the day it belongs to and the latest ten
       messages. A read that finds yesterday's day returns nothing, and the hourly
       sweep deletes it. Nothing is archived, copied or backed up.
     · NO IP ADDRESS IS EVER STORED. Netlify's own rate limiter, declared in each
       function's config, is what stops somebody guessing the password; it counts
       addresses itself and never hands them to this code. Do not "improve" the
       limiter by keeping a list of addresses in a blob.
     · NOTHING A PERSON TYPES IS LOGGED. No console.log of a handle, a message, a
       password or a pass, anywhere. privacy.html promises it, and a log line is the
       easiest place in the world to break that promise while debugging.
     · THE CHALKBOARD KEEPS A WEEK, AND ANYBODY CAN READ IT. Helen Edgar's idea,
       after the board at her floatation tank place; the retention and the
       readership are Ryan's call, 2026-09-25. It is a second blob beside the
       channel: thirty notes at most, each rubbed out seven days after it was
       chalked, whether or not the sweep has got to it. Writing needs a pass,
       the same pass the radio uses; reading needs nothing, because a board on
       the pavement is read by whoever walks past, and privacy.html says so
       above the box you write in. Nothing else about it differs from the
       channel: no address, no log, no copy.
     · A PASS IS CHECKED AND NOT KEPT. It is an HMAC of the handle keyed by the
       current password, so changing the password in Netlify's environment and
       redeploying signs everybody off at once, and there is no list of passes
       anywhere to go stale or leak.
   ============================================================================= */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getStore } from '@netlify/blobs';

export const KEEP = 10;             // messages on the channel at once
export const HANDLE_MAX = 24;       // characters
export const TEXT_MAX = 280;        // characters
export const ZONE = 'America/Denver';
const KEY = 'channel';

export const CHALK_KEEP = 30;                     // notes on the board at once
export const CHALK_MAX = 200;                     // characters
export const CHALK_DAYS = 7;
const CHALK = 'chalk';
const WEEK = CHALK_DAYS * 24 * 60 * 60 * 1000;

/* Which day is it, in Colorado. "Cleared daily" has to mean a midnight somebody
   can name, and privacy.html names this one. */
export function today(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

/* Strong consistency, because the default is eventual and an eventually
   consistent channel is one where your own message takes a minute to appear. */
export function store() {
  return getStore({ name: 'cb', consistency: 'strong' });
}

/* The channel as it stands today. Yesterday's is not returned, whether or not
   the sweep has reached it yet. */
export async function readChannel(s = store()) {
  const data = await s.get(KEY, { type: 'json' });
  if (!data || data.day !== today()) return { day: today(), messages: [] };
  return { day: data.day, messages: data.messages || [] };
}

/* The channel AND the version it was read at, which a write needs.

   A read is supposed to carry its etag, and in production it does. Netlify's
   local emulator does not send one on a read, and `onlyIfMatch: undefined` is
   not a conditional write, it is an unconditional one -- which is how fifteen
   people keying up at once came out as three messages in the first test, every
   one of them told it had worked. So a read with no etag takes the version off
   a listing instead, on both sides of the read: if the listing did not move, the
   data belongs to it. What this never does is write without a version. */
async function versioned(s, key = KEY) {
  const got = await s.getWithMetadata(key, { type: 'json' });
  if (!got) return { exists: false };
  if (got.etag) return { exists: true, data: got.data, etag: got.etag };
  for (let attempt = 0; attempt < 4; attempt++) {
    const tag = async () => ((await s.list({ prefix: key })).blobs.find((b) => b.key === key) || {}).etag;
    const before = await tag();
    const data = await s.get(key, { type: 'json' });
    const after = await tag();
    if (!before && !after) return { exists: false };
    if (before && before === after) return { exists: true, data, etag: before };
  }
  throw new Error('busy');
}

/* Change the channel without losing somebody else's change. Two people keying
   up in the same second both read the same blob; a plain write would drop one of
   them in silence. Conditional writes make the second one read again. */
export async function updateChannel(change) {
  const s = store();
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s);
    const live = cur.exists && cur.data && cur.data.day === today() ? cur.data.messages || [] : [];
    const next = change(live.slice());
    if (next === null) return live;
    const body = { day: today(), messages: next.slice(-KEEP) };
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(KEY, body, opts);
    if (res.modified) return body.messages;
    // Somebody else got there first. Wait a moment, a different moment for
    // each of us, and read again.
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

export async function sweep() {
  const s = store();
  const got = await s.getWithMetadata(KEY, { type: 'json' });
  if (got && (!got.data || got.data.day !== today())) {
    await s.delete(KEY);
    return true;
  }
  return false;
}

/* ── The chalkboard ──────────────────────────────────────────────────── */

/* A note is on the board for seven days from the moment it was chalked. The
   check is made on every read, so a note is gone at seven days whether or not
   the hourly sweep has reached it -- the channel's midnight rule, with a week
   in it instead of a day. */
function fresh(n, now = Date.now()) { return n && typeof n.t === 'number' && now - n.t < WEEK; }

export async function readChalk(s = store()) {
  const data = await s.get(CHALK, { type: 'json' });
  return ((data && data.notes) || []).filter((n) => fresh(n));
}

/* updateChannel's conditional write, on the other blob. Stale notes are
   dropped on the way through every write, and a full board rubs out its
   oldest, the way a real one does when somebody needs the room. */
export async function updateChalk(change, s = store()) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, CHALK);
    const was = (cur.exists && cur.data && cur.data.notes) || [];
    const live = was.filter((n) => fresh(n));
    const next = change(live.slice());
    if (next === null) return live;
    const body = { notes: next.slice(-CHALK_KEEP) };
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(CHALK, body, opts);
    if (res.modified) return body.notes;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* Hourly, with the channel's sweep: rewrite the board without anything past
   its week. A board with nothing stale on it is left alone. */
export async function sweepChalk(s = store()) {
  const data = await s.get(CHALK, { type: 'json' });
  const notes = (data && data.notes) || [];
  if (!notes.some((n) => !fresh(n))) return false;
  await updateChalk((list) => list, s);
  return true;
}

export function cleanChalk(s) {
  const t = tidy(s);
  return t && [...t].length <= CHALK_MAX ? t : null;
}

export function shapeChalk(notes) {
  return notes.map((n) => ({ id: n.id, handle: n.handle, text: n.text, t: n.t, base: !!n.base }));
}

/* ── Passes ────────────────────────────────────────────────────────────── */

function b64(buf) { return Buffer.from(buf).toString('base64url'); }

function sign(secret, role, handle) {
  return createHmac('sha256', secret).update(`cb1|${role}|${handle}`).digest();
}

function secretFor(role) {
  const v = role === 'base' ? process.env.CB_MOD_PASSWORD : process.env.CB_PASSWORD;
  return v && v.length >= 8 ? v : null;
}

function same(a, b) {
  const x = createHmac('sha256', 'cb-compare').update(String(a)).digest();
  const y = createHmac('sha256', 'cb-compare').update(String(b)).digest();
  return timingSafeEqual(x, y);
}

/* Which role a password opens, if either. The moderators' password makes you
   the base station: your messages are marked as the base's, and you can take
   a message off the channel before midnight. */
export function roleFor(password) {
  const mod = secretFor('base');
  if (mod && same(password, mod)) return 'base';
  const all = secretFor('mobile');
  if (all && same(password, all)) return 'mobile';
  return null;
}

export function issuePass(role, handle) {
  return `cb1.${role}.${b64(handle)}.${b64(sign(secretFor(role), role, handle))}`;
}

export function readPass(req) {
  const h = req.headers.get('authorization') || '';
  const m = /^Bearer (cb1)\.(mobile|base)\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/.exec(h);
  if (!m) return null;
  const role = m[2];
  const secret = secretFor(role);
  if (!secret) return null;
  let handle;
  try { handle = Buffer.from(m[3], 'base64url').toString('utf8'); } catch (e) { return null; }
  if (cleanHandle(handle) !== handle) return null;
  const want = sign(secret, role, handle);
  const got = Buffer.from(m[4], 'base64url');
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  return { role, handle };
}

/* ── What people type ──────────────────────────────────────────────────── */

/* Control characters out, runs of space folded, the ends trimmed. Nothing is
   rewritten beyond that: a handle is whatever somebody typed. */
function tidy(s) {
  return String(s == null ? '' : s)
    .replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanHandle(s) {
  const t = tidy(s);
  return t && [...t].length <= HANDLE_MAX ? t : null;
}

export function cleanText(s) {
  const t = tidy(s);
  return t && [...t].length <= TEXT_MAX ? t : null;
}

/* ── Answers ───────────────────────────────────────────────────────────── */

export function json(status, body, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Nothing on the channel may sit in a cache anywhere: a cached copy is a
      // copy, and privacy.html says there are none.
      'cache-control': 'no-store',
      ...extra,
    },
  });
}

export function shape(messages) {
  return messages.map((m) => ({ id: m.id, handle: m.handle, text: m.text, t: m.t, base: !!m.base }));
}

export async function body(req) {
  try { return await req.json(); } catch (e) { return null; }
}

/* A request from anywhere but this site is refused. The pass travels in a
   header rather than a cookie, so no other site could ride on it anyway; this
   is the belt to that pair of braces. */
export function sameSite(req) {
  const origin = req.headers.get('origin');
  if (!origin) return req.method === 'GET';
  try { return new URL(origin).host === new URL(req.url).host; } catch (e) { return false; }
}
