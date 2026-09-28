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
     · THE SLAKE, OUT THE BACK OF THE MUD ROOM, IS THE CB TOO. Ryan's calls,
       2026-09-27: you are seen by your handle only if you choose to be, on each
       visit, and each place on it has a channel of its own under the radio's
       rules. So presence is one tiny blob per visit, keyed so that a single
       listing says who is where, and it is shown to nobody thirty seconds after
       its last check and deleted by the next sweep at the latest; a place's talk
       is the channel's own blob shape, ten messages and gone at midnight. There
       is no list of everybody out there and no count of them, anywhere, and the
       places a visit has been are replaced rather than added to.
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

/* The pebble bowls: one per hosted room, on the chalkboard's rules. Helen
   Edgar's idea, 2026-09-26, on a visit to the Solarpunk Hermitage. Anybody
   reads a bowl, a CB pass leaves a pebble, and a pebble stays a week. The rooms
   are named HERE and nowhere else on the server side; tools/make-pebbles.py
   reads this array and refuses a page it does not name, the way make-csp.py
   reads love-embed.js's origins, so a bowl cannot exist in a page while the
   server refuses it, or the other way round. */
export const PEBBLE_ROOMS = ['solarpunk-hermitage', 'faery-yurt'];
export const PEBBLE_KEEP = 30;                    // pebbles in one bowl at once
export const PEBBLE_MAX = 200;                    // characters of words
export const PEBBLE_LINK_MAX = 300;               // characters of an address
const pebbleKey = (room) => `pebbles-${room}`;
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
export function readChannel(s = store()) { return readLog(KEY, s); }

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
export function updateChannel(change, s = store()) { return updateLog(KEY, change, s); }

/* A day's worth of messages in one blob, ten at most: the channel, and each
   place on the Slake. Written once so a place cannot drift from the channel's
   rules about how long a message stays or how a write that loses a race tries
   again. */
async function readLog(key, s) {
  const data = await s.get(key, { type: 'json' });
  if (!data || data.day !== today()) return { day: today(), messages: [] };
  return { day: data.day, messages: data.messages || [] };
}

async function updateLog(key, change, s) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    const live = cur.exists && cur.data && cur.data.day === today() ? cur.data.messages || [] : [];
    const next = change(live.slice());
    if (next === null) return live;
    const body = { day: today(), messages: next.slice(-KEEP) };
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, body, opts);
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

/* A board of notes that each last a week, kept in one blob: the chalkboard,
   and each room's pebble bowl. Written once, used by both, so the bowl cannot
   drift from the board's rules about how long a thing stays and how a write
   that loses a race tries again. */
async function readNotes(key, s) {
  const data = await s.get(key, { type: 'json' });
  return ((data && data.notes) || []).filter((n) => fresh(n));
}

/* updateChannel's conditional write, on the other blobs. Stale notes are
   dropped on the way through every write, and a full board rubs out its
   oldest, the way a real one does when somebody needs the room. */
async function updateNotes(key, keep, change, s) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    const was = (cur.exists && cur.data && cur.data.notes) || [];
    const live = was.filter((n) => fresh(n));
    const next = change(live.slice());
    if (next === null) return live;
    const body = { notes: next.slice(-keep) };
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, body, opts);
    if (res.modified) return body.notes;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* Rewrite a board without anything past its week. A board with nothing stale
   on it is left alone. */
async function sweepNotes(key, keep, s) {
  const data = await s.get(key, { type: 'json' });
  const notes = (data && data.notes) || [];
  if (!notes.some((n) => !fresh(n))) return false;
  await updateNotes(key, keep, (list) => list, s);
  return true;
}

export function readChalk(s = store()) { return readNotes(CHALK, s); }
export function updateChalk(change, s = store()) { return updateNotes(CHALK, CHALK_KEEP, change, s); }
/* Hourly, with the channel's sweep. */
export function sweepChalk(s = store()) { return sweepNotes(CHALK, CHALK_KEEP, s); }

export function cleanChalk(s) {
  const t = tidy(s);
  return t && [...t].length <= CHALK_MAX ? t : null;
}

/* ── The pebble bowls ─────────────────────────────────────────────────── */

export function pebbleRoom(room) { return PEBBLE_ROOMS.includes(room) ? room : null; }
export function readPebbles(room, s = store()) { return readNotes(pebbleKey(room), s); }
export function updatePebbles(room, change, s = store()) {
  return updateNotes(pebbleKey(room), PEBBLE_KEEP, change, s);
}
export async function sweepPebbles(s = store()) {
  let any = false;
  for (const room of PEBBLE_ROOMS) any = (await sweepNotes(pebbleKey(room), PEBBLE_KEEP, s)) || any;
  return any;
}

/* A pebble's words, on the chalk's rules. */
export function cleanPebble(s) {
  const t = tidy(s);
  return t && [...t].length <= PEBBLE_MAX ? t : null;
}

/* A pebble's link, if it has one: an http or https address and nothing else,
   with no name or password in it, short enough to print whole. It is shown as
   its own address, so what somebody reads is where it goes. Returns '' for no
   link and null for one that is refused. */
export function cleanLink(s) {
  const t = tidy(s);
  if (!t) return '';
  if (t.length > PEBBLE_LINK_MAX) return null;
  let u;
  try { u = new URL(t); } catch (e) { return null; }
  if ((u.protocol !== 'https:' && u.protocol !== 'http:') || u.username || u.password) return null;
  return u.href;
}

export function shapePebbles(list) {
  return list.map((n) => ({ id: n.id, handle: n.handle, text: n.text, link: n.link || '', t: n.t, base: !!n.base }));
}

export function shapeChalk(notes) {
  return notes.map((n) => ({ id: n.id, handle: n.handle, text: n.text, t: n.t, base: !!n.base }));
}

/* ── The Slake ───────────────────────────────────────────────────────────── */

/* Every place on the Slake, named HERE and nowhere else on the server side.
   tools/make-mud.py reads this array and refuses data/mud.json if the two
   disagree, the way make-pebbles.py reads PEBBLE_ROOMS: a place the game can
   walk to and the server refuses would be a place where nobody can meet. */
export const MUD_PLACES = ['mud-room', 'sea-wall', 'hide', 'reedbed', 'saltmarsh', 'tea-hut', 'tide-mill',
  'wheel-pit', 'mudlarks-hut', 'creek', 'boathouse', 'foreshore', 'mudflat', 'ferry-steps', 'causeway',
  'holm', 'beacon-top'];
export const MUD_FRESH = 30 * 1000;        // shown to nobody this long after its last check
const MUD_GONE = 2 * 60 * 1000;            // anybody's check deletes a record this stale
const HERE = 'mud-here/';
const talkKey = (place) => `mud-talk-${place}`;

export function mudPlace(p) { return MUD_PLACES.includes(p) ? p : null; }

/* A visit is a random id the page makes when it opens, and never shows anybody.
   It is what lets a visit move and leave without a list of visits anywhere. */
export function mudVisit(v) { return typeof v === 'string' && /^[A-Za-z0-9_-]{22,64}$/.test(v) ? v : null; }

/* PRESENCE IS IN THE KEY, so one listing answers who is where without reading
   anything: the place, the visit, the time, the role and the handle. The value
   is empty. Each key belongs to one visit, so writing one is not a race, and
   nothing here needs a conditional write. */
function hereKey(place, visit, t, role, handle) {
  return `${HERE}${place}/${visit}.${t}.${role}.${b64(handle)}`;
}
function parseHere(key) {
  const m = /^mud-here\/([a-z0-9-]+)\/([A-Za-z0-9_-]+)\.(\d+)\.(mobile|base)\.([A-Za-z0-9_-]+)$/.exec(key);
  if (!m) return null;
  let handle;
  try { handle = Buffer.from(m[5], 'base64url').toString('utf8'); } catch (e) { return null; }
  return { key, place: m[1], visit: m[2], t: Number(m[3]), base: m[4] === 'base', handle };
}
async function everyHere(s) {
  return ((await s.list({ prefix: HERE })).blobs || []).map((b) => parseHere(b.key)).filter(Boolean);
}

/* WHO ELSE IS HERE: handles only, each once however many tabs somebody has
   open, in alphabetical order so nobody is first for having arrived first. No
   count is returned, because the page must not have one to print. */
function othersAt(all, place, visit, now) {
  const seen = new Map();
  for (const r of all) {
    if (r.place !== place || r.visit === visit || now - r.t >= MUD_FRESH) continue;
    if (!seen.has(r.handle)) seen.set(r.handle, { handle: r.handle, base: r.base });
  }
  return [...seen.values()].sort((a, b) => a.handle.localeCompare(b.handle));
}

/* Be seen at a place, which is also what lets you see. Your visit's earlier
   record goes, wherever it was, so where you have been is never a trail; and
   any record two minutes stale goes too, so a tab somebody closed without
   saying so does not wait for the hourly sweep. */
export async function beHere(who, place, visit, s = store(), now = Date.now()) {
  const all = await everyHere(s);
  const key = hereKey(place, visit, now, who.role, who.handle);
  await s.set(key, '');
  for (const r of all) {
    if (r.key !== key && (r.visit === visit || now - r.t >= MUD_GONE)) await s.delete(r.key);
  }
  return othersAt(all, place, visit, now);
}

/* Stop being seen: every record for this visit, now. */
export async function leaveSlake(visit, s = store()) {
  for (const r of await everyHere(s)) if (r.visit === visit) await s.delete(r.key);
}

/* Only somebody seen at a place may speak there: talking unseen would be the
   one-way mirror this is built to refuse. */
export async function seenAt(place, visit, s = store(), now = Date.now()) {
  return (await everyHere(s)).some((r) => r.visit === visit && r.place === place && now - r.t < MUD_FRESH);
}

export function readTalk(place, s = store()) { return readLog(talkKey(place), s); }
export function updateTalk(place, change, s = store()) { return updateLog(talkKey(place), change, s); }

/* Hourly, with the channel's sweep: every stale presence record, and every
   place's talk from a day that is over in Colorado. */
export async function sweepSlake(s = store(), now = Date.now()) {
  let any = false;
  for (const r of await everyHere(s)) {
    if (now - r.t >= MUD_FRESH) { await s.delete(r.key); any = true; }
  }
  for (const place of MUD_PLACES) {
    const data = await s.get(talkKey(place), { type: 'json' });
    if (data && data.day !== today()) { await s.delete(talkKey(place)); any = true; }
  }
  return any;
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
