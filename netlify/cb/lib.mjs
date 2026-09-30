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
     · EVERY ROOM HAS A CHANNEL OF ITS OWN, BESIDE THE WORLD ONE. Ryan,
       2026-09-28: the radio tunes to World, the channel it always had, or to
       the room it is in, and a room's channel is the World channel's shape
       exactly, ten messages and gone at midnight in Colorado, in a blob of
       its own. Tuned to a room, the radio has to say which room it wants,
       every time it listens; tuned to World it says nothing about where it
       is. That difference is written on privacy.html, and it is why World is
       where a radio starts.
     · A HOST'S BEACON SAYS WHERE ONE FILM HAS GOT TO, AND NOTHING ELSE. Ryan,
       2026-09-28, for watch-togethers: somebody watching a film in a room can
       host it, and every radio then shows their place in it, with a way to
       catch up. One small blob holds every beacon on the street, one per room,
       each the handle, the room, the film, the place, whether it is playing
       and when it was last heard; each is REPLACED on every update, so there
       is no history of anybody's viewing, and one not heard from for
       seventy-five seconds is shown to nobody and dropped by the next write.
       The channel's answer carries all of them, so the radio never has to
       tell us which room anybody is in to find the beacon for theirs.
     · A CALL IS A ROOM'S, AND ONLY THE CB GETS YOU INTO ONE. Ryan, 2026-09-28:
       voice and video through 8x8's Jitsi as a Service, one call per room.
       JaaS lets nobody in without a token signed with our private key, so
       this signs one for a signed-on handle and one room, and nothing else:
       the handle as the name shown in the call, a stable id made from it so
       8x8 does not count one person twice, moderator only for the base, and
       recording and transcription only for the base, who is who starts them.
       We keep nothing about a call. What 8x8 keeps is 8x8's, and
       privacy.html says so and links its policy.
     · THREE CALLS ARE PUBLIC, AND THE LOBBY IS WHAT KEEPS THEM SAFE. Ryan,
       2026-09-28: Cavendish Coworking's Events, Operations and Editorial rooms
       are open to the world, as our meetings always were, so /cb/call signs a
       GUEST token for those three and no others, for a name the guest typed:
       never a moderator, never recording or transcribing. JaaS asks our
       settings webhook before each meeting, and for those three we answer
       with the lobby on, so a guest knocks and waits for a moderator, which
       keeps strangers and bots out of the room and off our monthly-user bill.
     · A PASS IS CHECKED AND NOT KEPT. It is an HMAC of the handle keyed by the
       current password, so changing the password in Netlify's environment and
       redeploying signs everybody off at once, and there is no list of passes
       anywhere to go stale or leak.
   ============================================================================= */
import { createHmac, createHash, createSign, createPrivateKey, timingSafeEqual, randomUUID } from 'node:crypto';
import { getStore } from '@netlify/blobs';

export const KEEP = 10;             // messages on the channel at once
export const HANDLE_MAX = 24;       // characters
export const TEXT_MAX = 280;        // characters of a line on the Slake, the chalkboard or a bowl
export const MESSAGE_MAX = 2000;    // characters of a message on the CB's channels (Ryan, 2026-09-29)
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

/* ── Being seen in a room ──────────────────────────────────────────── */

/* BE SEEN HERE: the Slake's rule, for every room on the street. Ryan,
   2026-09-29, after people asked who else was about, and who was in a call
   before they joined it. It is the same switch both ways, as it is on the
   Slake: a radio that is seen in a room is told who else is seen there, and a
   radio that is not seen is told nothing. It is off until somebody presses it,
   and Ryan's call the same day is that a browser remembers it once pressed.

   It is the Slake's record in another drawer: presence in the key, one empty
   blob per visit, replaced as the visit moves, shown to nobody ROOM_FRESH after
   its last check, and HANDLES ONLY, in alphabetical order, with no number:
   nobody is first for having come first, and the page has no count to print.
   A room the base keeps (MOD_ROOMS) shows its people only to passes that room
   lets in, by roomAllows(), like its channel. */
export const ROOM_FRESH = 30 * 1000;       // shown to nobody this long after its last check
const ROOM_GONE = 2 * 60 * 1000;           // anybody's check deletes a record this stale
const SEEN = 'room-here/';

function seenKey(tag, visit, t, role, handle) {
  return `${SEEN}${tag}/${visit}.${t}.${role}.${b64(handle)}`;
}
function parseSeen(key) {
  const m = /^room-here\/([a-z0-9-]+)\/([A-Za-z0-9_-]+)\.(\d+)\.(mobile|base)\.([A-Za-z0-9_-]+)$/.exec(key);
  if (!m) return null;
  let handle;
  try { handle = Buffer.from(m[5], 'base64url').toString('utf8'); } catch (e) { return null; }
  return { key, tag: m[1], visit: m[2], t: Number(m[3]), base: m[4] === 'base', handle };
}
async function everySeen(s) {
  return ((await s.list({ prefix: SEEN })).blobs || []).map((b) => parseSeen(b.key)).filter(Boolean);
}
function seenIn(all, tag, visit, now) {
  const seen = new Map();
  for (const r of all) {
    if (r.tag !== tag || r.visit === visit || now - r.t >= ROOM_FRESH) continue;
    if (!seen.has(r.handle)) seen.set(r.handle, { handle: r.handle, base: r.base });
  }
  return [...seen.values()].sort((a, b) => a.handle.localeCompare(b.handle));
}

/* Be seen in a room, which is also what lets you see who else is. The visit's
   earlier record goes, wherever it was, so which rooms somebody has been in is
   never a trail. */
export async function beSeen(who, tag, visit, s = store(), now = Date.now()) {
  const all = await everySeen(s);
  const key = seenKey(tag, visit, now, who.role, who.handle);
  await s.set(key, '');
  for (const r of all) {
    if (r.key !== key && (r.visit === visit || now - r.t >= ROOM_GONE)) await s.delete(r.key);
  }
  return seenIn(all, tag, visit, now);
}

/* Stop being seen: every record for this visit, now. */
export async function unseen(visit, s = store()) {
  for (const r of await everySeen(s)) if (r.visit === visit) await s.delete(r.key);
}

export async function sweepSeen(s = store(), now = Date.now()) {
  let any = false;
  for (const r of await everySeen(s)) if (now - r.t >= ROOM_FRESH) { await s.delete(r.key); any = true; }
  return any;
}

/* ── Who is in a room's call ─────────────────────────────────────────── */

/* EVERYBODY IN A CALL, FROM 8x8. Ryan's call, 2026-09-29: who is in a room's
   call is told by JaaS's participant webhook, so it is everybody in it, guests
   included, and not only people who pressed Be seen here. It is shown only to a
   radio that is seen in that room (the one switch, both ways) and that the
   room lets in, and it is names only, alphabetical, with no number.

   What 8x8 sends is checked before anything is believed: X-Jaas-Signature is an
   HMAC-SHA256 of "<t>.<body>", base64, keyed by the endpoint's whole secret as
   the console shows it (whsec_ and all; 8x8's own worked example is in
   lib.test.mjs), and it is refused five minutes either side of now.

   WHAT IS KEPT is one empty blob per person in a call, the name and the time
   in its key and nothing else: no email, no id we could look anybody up by, the
   participant's id only as a hash. It goes when they leave, when the room
   closes, or at the hourly sweep once it is older than a token can be. A
   leaving that arrives before its joining (8x8 retries) leaves a mark for an
   hour, so the late joining is not believed. */
const IN_CALL = 'call-in/';
const CALL_LEFT = 'call-left/';
const callStale = () => (CALL_HOURS + 1) * 3600 * 1000;   // CALL_HOURS is further down
const LEFT_KEEP = 60 * 60 * 1000;
export const CALL_NAME_MAX = 60;
export const HOOK_SKEW = 5 * 60;           // seconds either side of now a signature is believed

export function jaasSigned(header, raw, secret, now = Date.now()) {
  if (!secret || typeof header !== 'string' || typeof raw !== 'string') return false;
  let t = null; const sigs = [];
  for (const part of header.split(',')) {
    const i = part.indexOf('=');
    if (i < 1) continue;
    const k = part.slice(0, i).trim(), v = part.slice(i + 1).trim();
    if (k === 't') t = v; else if (k === 'v1') sigs.push(v);
  }
  if (!t || !/^\d{9,11}$/.test(t) || !sigs.length) return false;
  if (Math.abs(now / 1000 - Number(t)) > HOOK_SKEW) return false;
  const want = Buffer.from(createHmac('sha256', secret).update(`${t}.${raw}`, 'utf8').digest('base64'));
  return sigs.some((v) => { const got = Buffer.from(v); return got.length === want.length && timingSafeEqual(got, want); });
}

/* The room an 8x8 event is about, or null: our App ID, one of our rooms. */
export function callEventRoom(fqn) {
  const m = /^([^/]+)\/stimpunks-([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(String(fqn || ''));
  return m && m[1] === JAAS_APP ? roomTag(m[2]) : null;
}
const pidOf = (d) => {
  const id = d && (d.participantId || d.participantJid || d.id);
  return id ? createHash('sha256').update(`stimpunks-call-pid\0${id}`).digest('base64url').slice(0, 22) : null;
};
function parseInCall(key) {
  const m = /^call-in\/([a-z0-9-]+)\/([A-Za-z0-9_-]+)\.(\d+)\.(m|p)\.([A-Za-z0-9_-]*)$/.exec(key);
  if (!m) return null;
  let name;
  try { name = Buffer.from(m[5], 'base64url').toString('utf8'); } catch (e) { return null; }
  return { key, tag: m[1], pid: m[2], t: Number(m[3]), base: m[4] === 'm', name };
}
function parseLeft(key) {
  const m = /^call-left\/([a-z0-9-]+)\/([A-Za-z0-9_-]+)\.(\d+)$/.exec(key);
  return m ? { key, tag: m[1], pid: m[2], t: Number(m[3]) } : null;
}
async function listed(s, prefix, parse) {
  return ((await s.list({ prefix })).blobs || []).map((b) => parse(b.key)).filter(Boolean);
}
function callName(v) {
  const t = tidy(v);
  return t ? [...t].slice(0, CALL_NAME_MAX).join('') : 'somebody';
}

/* One event from 8x8. Returns what it did, for the log-free test. */
export async function callEvent(ev, s = store(), now = Date.now()) {
  const tag = ev && callEventRoom(ev.fqn);
  if (!tag) return 'not ours';
  const at = Number.isFinite(Number(ev.timestamp)) && Number(ev.timestamp) > 0 ? Number(ev.timestamp) : now;
  const here = await listed(s, `${IN_CALL}${tag}/`, parseInCall);
  const d = ev.data || {};
  switch (ev.eventType) {
    case 'PARTICIPANT_JOINED': {
      const pid = pidOf(d);
      if (!pid) return 'no one';
      const left = await listed(s, `${CALL_LEFT}${tag}/`, parseLeft);
      if (left.some((l) => l.pid === pid && l.t >= at)) return 'already left';
      for (const r of here) if (r.pid === pid) await s.delete(r.key);
      const mod = d.moderator === true || d.moderator === 'true';
      await s.set(`${IN_CALL}${tag}/${pid}.${at}.${mod ? 'm' : 'p'}.${b64(callName(d.name))}`, '');
      return 'joined';
    }
    case 'PARTICIPANT_LEFT': {
      const pid = pidOf(d);
      if (!pid) return 'no one';
      for (const r of here) if (r.pid === pid && r.t <= at) await s.delete(r.key);
      await s.set(`${CALL_LEFT}${tag}/${pid}.${at}`, '');
      return 'left';
    }
    case 'ROOM_CREATED':
    case 'ROOM_DESTROYED':
      for (const r of here) if (r.t <= at) await s.delete(r.key);
      return 'emptied';
    default:
      return 'ignored';
  }
}

/* Who is in a room's call: names, each once, alphabetical, no number. */
export async function inCall(tag, s = store(), now = Date.now()) {
  const seen = new Map();
  for (const r of await listed(s, `${IN_CALL}${tag}/`, parseInCall)) {
    if (now - r.t >= callStale()) continue;
    if (!seen.has(r.name)) seen.set(r.name, { name: r.name, base: r.base });
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function sweepCalls(s = store(), now = Date.now()) {
  let any = false;
  for (const r of await listed(s, IN_CALL, parseInCall)) if (now - r.t >= callStale()) { await s.delete(r.key); any = true; }
  for (const r of await listed(s, CALL_LEFT, parseLeft)) if (now - r.t >= LEFT_KEEP) { await s.delete(r.key); any = true; }
  return any;
}

/* ── Pictures on the channel ─────────────────────────────────────────── */

/* A PICTURE IS PART OF ITS MESSAGE AND GOES WHEN THE MESSAGE GOES. Ryan,
   2026-09-29: screenshots and photos on the CB, which stay on the channel and
   never go onto the street, so none of the street's rules for published
   photographs apply to them. What does apply is the channel's own promise:
   a picture is deleted the moment its message leaves, whether it was pushed off
   by an eleventh, taken off by the base, or swept at midnight, and one that was
   uploaded and never sent is swept within the hour.

   IT IS REDRAWN IN THE SENDER'S BROWSER BEFORE IT IS SENT, which drops
   everything a camera writes into a file, the GPS first, so a photo taken at
   home does not say where home is. The server refuses a file that still
   carries any of it, because that file did not come through the radio.

   IT IS BOUND TO ITS ROOM. A picture sent in one of the Town Hall's private
   rooms is served to the passes that room lets in and nobody else, by the same
   roomAllows() that guards its words. A picture has no public address: it is
   fetched with the pass, like the channel. */
export const IMG_MAX = 1500000;          // bytes, after the browser has redrawn it
export const ALT_MAX = 280;              // characters of a description, which is optional
const IMG = 'img/';
const IMG_UNSENT = 60 * 60 * 1000;       // an upload nobody sent is swept after this

export function imageId(v) { return typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v) ? v : null; }
export function cleanAlt(v) { const t = tidy(v); return t && [...t].length <= ALT_MAX ? t : ''; }

/* What a file is, from its first bytes; anything else is refused. */
export function imageKind(b) {
  if (!b || b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (String.fromCharCode(...b.subarray(0, 4)) === 'RIFF' && String.fromCharCode(...b.subarray(8, 12)) === 'WEBP') return 'image/webp';
  return null;
}

/* Whether a file still carries what a camera or a phone writes into it: Exif
   (where the GPS lives), XMP, or a PNG's eXIf/tEXt chunks. A canvas's output
   carries none of those. */
export function carriesMetadata(b, kind) {
  const text = Buffer.from(b.subarray(0, Math.min(b.length, 131072))).toString('latin1');
  if (kind === 'image/jpeg') return /\xff\xe1..Exif\x00|\xff\xe1..http:\/\/ns\.adobe\.com\/xap/s.test(text);
  if (kind === 'image/png') return /eXIf|iTXtXML:com\.adobe\.xmp|tEXt/.test(text);
  if (kind === 'image/webp') return /EXIF|XMP /.test(text);
  return true;
}

export async function putImage(who, room, bytes, s = store(), now = Date.now()) {
  if (!bytes || !bytes.length) return { error: 'There was no picture in that.' };
  if (bytes.length > IMG_MAX) return { error: 'That picture is too big to send, even after the radio made it smaller.' };
  const kind = imageKind(bytes);
  if (!kind) return { error: 'That is not a picture the radio can send.' };
  if (carriesMetadata(bytes, kind)) return { error: 'That picture still carries its camera data. Send it through the radio, which takes that off.' };
  const id = randomUUID();
  await s.set(IMG + id, bytes, { metadata: { handle: who.handle, room: room || '', t: now, type: kind } });
  return { id };
}

export async function getImage(id, s = store()) {
  if (!imageId(id)) return null;
  const got = await s.getWithMetadata(IMG + id, { type: 'arrayBuffer' });
  if (!got || !got.metadata) return null;
  return { data: got.data, meta: got.metadata };
}

export async function dropImages(ids, s = store()) {
  for (const id of ids) if (imageId(id)) await s.delete(IMG + id);
}

/* Which pictures a change pushed off the channel: the ones in the messages it
   was given and not in the ones it left. */
export function droppedImages(before, after) {
  const kept = new Set(after.map((m) => m.img).filter(Boolean));
  return before.map((m) => m.img).filter((id) => id && !kept.has(id));
}

/* Hourly: every picture no live message holds, once it is past the hour an
   upload is given to be sent. A read never returns yesterday's channel, so
   yesterday's pictures are held by nothing and go on the next sweep. */
export async function sweepImages(s = store(), now = Date.now()) {
  const held = new Set();
  const keys = [KEY, ...((await s.list({ prefix: ROOM_TALK })).blobs || []).map((b) => b.key)];
  for (const key of keys) for (const m of (await readLog(key, s)).messages) if (m.img) held.add(m.img);
  let any = false;
  for (const b of (await s.list({ prefix: IMG })).blobs || []) {
    const id = b.key.slice(IMG.length);
    if (held.has(id)) continue;
    const got = await s.getWithMetadata(b.key, { type: 'arrayBuffer' });
    const t = got && got.metadata && got.metadata.t;
    if (typeof t === 'number' && now - t < IMG_UNSENT) continue;
    await s.delete(b.key);
    any = true;
  }
  return any;
}

/* ── Room channels ─────────────────────────────────────────────────────── */

const ROOM_TALK = 'room-talk-';

/* A room is named by its tag, the filename the street's own list uses. The
   server only checks its shape: a tag that is no room is a channel nobody's
   radio can tune to, and it is gone at midnight like every other. */
export function roomTag(r) {
  return typeof r === 'string' && r.length <= 80 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r) ? r : null;
}

export function readRoomTalk(room, s = store()) { return readLog(ROOM_TALK + room, s); }
export function updateRoomTalk(room, change, s = store()) { return updateLog(ROOM_TALK + room, change, s); }

/* THE TOWN HALL'S PRIVATE ROOMS ARE THE BASE'S, AND THIS IS THE ONE LIST.
   Ryan, 2026-09-29: anybody may walk into these rooms and read them, and their
   channel, their call and any film hosted in them are for people signed on
   with the moderators' password. A page that only hid the radio would be a
   lock painted on a door, so every function that touches a room asks here:
   listening, transmitting, hosting, the beacons everybody hears, and the call.
   tools/make-town-hall.py reads this map and refuses a page that disagrees,
   so a room cannot be private on the page and open on the server.

   EACH ROOM NAMES THE ROLE IT NEEDS, and the roles are CB_MODS's (see Passes
   below), and a room may take more than one. Ryan, 2026-09-29: the Moderators
   room takes any MOD, the Board room the board role and the director role,
   because directors join board meetings, the Directors room the director role,
   and an administrator can go anywhere. */
export const MOD_ROOMS = {
  'town-hall-directors': ['director'],
  'town-hall-board': ['board', 'director'],
  'town-hall-moderators': ['moderator'],
  'town-hall-executive-session': ['board'],
};
/* A ROOM THE ADMINISTRATOR KEY DOES NOT OPEN. Ryan, 2026-09-29: Executive
   Session is for those with the board role only. An executive session is the
   board meeting without staff, and an administrator who is not on the board
   is staff, so here the room's own roles are the only way in. Confirmed by
   Ryan the same day: administrators stay out. */
export const STRICT_ROOMS = ['town-hall-executive-session'];
export function modRoom(tag) { return Object.prototype.hasOwnProperty.call(MOD_ROOMS, tag) ? tag : null; }
export function roomAllows(who, tag) {
  if (!modRoom(tag)) return true;
  if (!who || who.role !== 'base' || !who.roles) return false;
  if (!STRICT_ROOMS.includes(tag) && who.roles.has('administrator')) return true;
  return MOD_ROOMS[tag].some((r) => who.roles.has(r));
}

/* The channel a request names: a room's, or World's when it names none. */
export function readTuned(room, s = store()) { return room ? readRoomTalk(room, s) : readChannel(s); }
export function updateTuned(room, change, s = store()) { return room ? updateRoomTalk(room, change, s) : updateChannel(change, s); }

/* Hourly, with the World channel's sweep: every room's channel whose day is
   over in Colorado. */
export async function sweepRoomTalk(s = store()) {
  let any = false;
  for (const b of (await s.list({ prefix: ROOM_TALK })).blobs || []) {
    const data = await s.get(b.key, { type: 'json' });
    if (!data || data.day !== today()) { await s.delete(b.key); any = true; }
  }
  return any;
}

/* ── Calls ─────────────────────────────────────────────────────────────── */

/* Our JaaS App ID. Not a secret: it is in every call's address. The private key
   and its id are, and they live in Netlify's environment, never here. */
export const JAAS_APP = 'vpaas-magic-cookie-7c4c52a95081498db34c04fcdadc50a2';
export const JAAS_HOST = 'https://8x8.vc/';
export const CALL_HOURS = 4;               // a token lets you (re)join for this long
export const callRoom = (tag) => `stimpunks-${tag}`;

/* The only calls a guest with no CB pass can get a token for. Each is a page
   on the street, by its filename, and each one's meeting starts with the lobby
   on (callSettings). Add a room here and it is open to the world. */
export const PUBLIC_CALLS = ['cavendish-events', 'cavendish-operations', 'cavendish-editorial'];
export function publicCall(tag) { return PUBLIC_CALLS.includes(tag) ? tag : null; }

/* JaaS's SETTINGS_PROVISIONING webhook: asked before every meeting, with the
   meeting's "AppID/roomName". A public call starts with the lobby on and every
   non-moderator knocking; every other call starts without one, because only
   people signed on to the CB can get into those at all. */
export function callSettings(fqn) {
  const m = /^([^/]+)\/stimpunks-([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(String(fqn || ''));
  if (!m || m[1] !== JAAS_APP) return { lobbyEnabled: false };
  return publicCall(m[2]) ? { lobbyEnabled: true, lobbyType: 'WAIT_FOR_APPROVAL' } : { lobbyEnabled: false };
}

/* A PASTED KEY LOSES ITS LINE BREAKS, and Node will not read a PEM without
   them. The first real key arrived in Netlify's environment as one line, its
   body in space-separated pieces, and signing threw inside the function; the
   radio could only say the call could not be opened. So the key is rebuilt
   here from what cannot be lost -- the armour's name and the base64 between
   -- and wrapped at 64, whatever whitespace or escaped newlines it came in. */
export function tidyPem(raw) {
  const m = /-----BEGIN ([A-Z ]+)-----([\s\S]*?)-----END \1-----/.exec(String(raw || '').replace(/\\n/g, '\n'));
  if (!m) return null;
  const body = m[2].replace(/[^A-Za-z0-9+/=]/g, '');
  if (!body) return null;
  return `-----BEGIN ${m[1]}-----\n${body.match(/.{1,64}/g).join('\n')}\n-----END ${m[1]}-----\n`;
}

function jaasKey() {
  const kid = process.env.CB_JAAS_KID;
  if (!kid || kid.indexOf(JAAS_APP + '/') !== 0) return null;
  const pem = tidyPem(process.env.CB_JAAS_KEY);
  if (!pem) return null;
  try { createPrivateKey(pem); } catch (e) { return null; }
  return { kid, pem };
}
// A key that cannot be read switches calls off, rather than a button that fails.
export function callsReady() { return !!jaasKey(); }

/* One token, for one handle in one room's call. 8x8 counts people by id, so
   the id is made from the handle and the role, the same every time, and says
   nothing a name in the call does not already say. */
export function callToken(who, tag, now = Date.now(), key = jaasKey()) {
  if (!key) return null;
  // A guest (role 'guest') is somebody with no CB pass in a public call: the
  // same token as a participant's, and never the base's.
  if (who.role === 'guest' && !publicCall(tag)) return null;
  // A private room's call is the base's, whatever else asks for it.
  if (!roomAllows(who, tag)) return null;
  const base = who.role === 'base';
  const t = Math.floor(now / 1000);
  const header = { alg: 'RS256', typ: 'JWT', kid: key.kid };
  const payload = {
    aud: 'jitsi', iss: 'chat', sub: JAAS_APP, room: callRoom(tag),
    iat: t, nbf: t - 10, exp: t + CALL_HOURS * 3600,
    context: {
      user: {
        id: createHash('sha256').update(`stimpunks-call\0${who.role}\0${who.handle}`).digest('base64url').slice(0, 22),
        name: who.handle,
        moderator: base ? 'true' : 'false',
      },
      features: {
        recording: base, transcription: base,
        livestreaming: false, 'outbound-call': false, 'inbound-call': false,
        'sip-outbound-call': false, 'sip-inbound-call': false,
        // Sharing a file in the call is for everybody in it, guests included:
        // Ryan's call, 2026-09-29, for screenshots and photos. The file goes to
        // 8x8, never to us, and privacy.html says so.
        'file-upload': true, 'list-visitors': false,
        'send-groupchat': true, 'create-polls': true,
      },
    },
  };
  const part = (o) => b64(JSON.stringify(o));
  const unsigned = `${part(header)}.${part(payload)}`;
  const sig = createSign('RSA-SHA256').update(unsigned).sign(key.pem);
  return `${unsigned}.${b64(sig)}`;
}

/* The address the call window frames. The fragment is Jitsi's own config:
   everybody arrives on the pre-join screen with camera and microphone OFF, and
   no invite links (an invite would be an address with no token in it).

   SHARED VIDEO NEEDS disableThirdPartyRequests OFF, and that one switch also
   brings back three things we do not want. Jitsi's isSharedVideoEnabled() is
   nothing but !disableThirdPartyRequests, so the first build, which set it,
   had no Share video in the menu (Ryan, 2026-09-28). The same switch also
   gates Jitsi's analytics, avatar lookups (gravatar, from a participant's id
   or email) and Giphy, so each of those is turned off by its own setting
   instead; all four keys are on Jitsi's configWhitelist, which is what lets
   an address set them. A shared video is YouTube, loaded by Jitsi inside the
   call for everybody in it, and privacy.html says so. */
export function callSrc(tag, token) {
  const conf = ['startWithAudioMuted=true', 'startWithVideoMuted=true', 'prejoinConfig.enabled=true',
    'disableDeepLinking=true', 'disableInviteFunctions=true',
    'analytics.disabled=true', 'gravatar.disabled=true', 'giphy.enabled=false']
    .map((c) => 'config.' + c).join('&');
  return `${JAAS_HOST}${JAAS_APP}/${callRoom(tag)}?jwt=${token}#${conf}`;
}

/* ── The beacons ───────────────────────────────────────────────────────── */

export const BEACON_FRESH = 75 * 1000;     // shown to nobody this long after it was last heard
export const FILM_MAX = 120;               // characters of a film's title
const BEACONS = 'beacons';

/* A beacon's room is checked the way a room channel's is; the radio shows
   nothing for a tag that is not a room on the street. */
export const beaconRoom = roomTag;
export function cleanFilm(s) {
  const t = tidy(s);
  return t && [...t].length <= FILM_MAX ? t : null;
}
// A place in a film, in seconds, to a tenth; a day at most.
export function cleanAt(n) {
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 86400 ? Math.round(n * 10) / 10 : null;
}

function heard(b, now) { return b && typeof b.t === 'number' && now - b.t < BEACON_FRESH; }

export async function readBeacons(s = store(), now = Date.now()) {
  const data = await s.get(BEACONS, { type: 'json' });
  return ((data && data.beacons) || []).filter((b) => heard(b, now));
}

/* The boards' conditional write, on the beacons: a stale one goes on the way
   through every write, and nothing is written without a version. */
async function updateBeacons(change, s, now) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, BEACONS);
    const live = ((cur.exists && cur.data && cur.data.beacons) || []).filter((b) => heard(b, now));
    const next = change(live.slice());
    if (next === null) return live;
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(BEACONS, { beacons: next }, opts);
    if (res.modified) return next;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* Host a room's film, or say where it has got to. One host per room: somebody
   else's live beacon there is theirs until they stop or go quiet, and only the
   base station can take a room over. The same handle may keep its own. */
export async function hostBeacon(who, room, film, at, playing, s = store(), now = Date.now()) {
  if (!roomAllows(who, room)) return { closed: true };
  let held = null;
  const beacons = await updateBeacons((list) => {
    held = null;
    const there = list.find((b) => b.room === room);
    if (there && there.handle !== who.handle && who.role !== 'base') { held = there.handle; return null; }
    return list.filter((b) => b.room !== room)
      .concat({ room, handle: who.handle, base: who.role === 'base', film, at, playing: !!playing, t: now });
  }, s, now);
  return held ? { held } : { beacons };
}

/* Stop hosting: your own beacon, or anybody's if you are the base. */
export async function stopBeacon(who, room, s = store(), now = Date.now()) {
  return updateBeacons((list) => {
    const next = list.filter((b) => !(b.room === room && (b.handle === who.handle || who.role === 'base')));
    return next.length === list.length ? null : next;
  }, s, now);
}

/* Hourly: a blob with nothing live left in it is emptied. */
export async function sweepBeacons(s = store(), now = Date.now()) {
  const data = await s.get(BEACONS, { type: 'json' });
  const all = (data && data.beacons) || [];
  if (!all.some((b) => !heard(b, now))) return false;
  await updateBeacons((list) => list, s, now);
  return true;
}

/* What a radio may hear of the beacons: everything, except a private room's
   to anybody who could not go in there. A film hosted in the board room is
   itself a thing about the board room. */
export function shapeBeacons(list, who = null) {
  return list.filter((b) => !who || roomAllows(who, b.room)).map((b) => ({ room: b.room, handle: b.handle, base: !!b.base, film: b.film, at: b.at, playing: !!b.playing, t: b.t }));
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

/* THE MODS' LIST. Ryan, 2026-09-29: a pre-approved list of MOD handles, which
   sign on only with the moderators' password and never with the community
   one, each with roles. It lives in Netlify's environment as CB_MODS, never in
   the repo, because who holds which role is not ours to publish, as one JSON
   object from handle to roles:

     {"Ryan":["administrator","board","director"],"Helen":["administrator","director"]}

   · moderator is implied: being on the list makes you one.
   · only ROLES are accepted; a list naming anything else is not read at all,
     rather than read as less than was meant.
   · a handle is matched folded (Unicode NFKC, case, runs of space), so "ryan "
     cannot pass for "Ryan", and two entries that fold alike are refused.
   · it is read on every request, so a change takes effect on the next listen:
     somebody taken off the list, or given a role, needs no new pass.
   · a list that is missing or unreadable locks MOD sign-on and every base pass,
     and nothing reaches a private room: fail closed. The community CB goes on
     working. Nothing here ever logs the list. */
export const ROLES = ['moderator', 'board', 'director', 'administrator'];

export function foldHandle(h) {
  return String(h == null ? '' : h).normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function readMods(raw = process.env.CB_MODS) {
  if (!raw) return null;
  let data;
  try { data = JSON.parse(raw); } catch (e) { return null; }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const mods = new Map();
  for (const [handle, roles] of Object.entries(data)) {
    if (cleanHandle(handle) !== handle || !Array.isArray(roles)) return null;
    if (!roles.every((r) => ROLES.includes(r))) return null;
    const key = foldHandle(handle);
    if (mods.has(key)) return null;
    mods.set(key, { handle, roles: new Set(['moderator', ...roles]) });
  }
  return mods.size ? mods : null;
}

/* Signing on. The moderators' password is only for a handle on the list, and
   the community password is refused for any handle on it. The answer is a role
   and the roles, or a sentence saying why not. */
export function signOn(handle, password, mods = readMods()) {
  const mod = secretFor('base');
  if (mod && same(password, mod)) {
    if (!mods) return { error: 'Moderator sign-on is switched off until its list of handles can be read. Tell Ryan or Helen.' };
    const m = mods.get(foldHandle(handle));
    if (!m) return { error: 'That handle is not on the moderators\' list.' };
    return { role: 'base', handle: m.handle, roles: m.roles };
  }
  const all = secretFor('mobile');
  if (all && same(password, all)) {
    if (mods && mods.has(foldHandle(handle))) {
      return { error: 'That handle belongs to a moderator. Sign on with the moderators\' password, or pick another handle.' };
    }
    return { role: 'mobile', handle, roles: new Set() };
  }
  return { error: 'That is not the community password.' };
}

export function issuePass(role, handle) {
  return `cb1.${role}.${b64(handle)}.${b64(sign(secretFor(role), role, handle))}`;
}

/* A pass is checked against the list every time, both ways: a base pass is only
   good while its handle is on the list, with the roles it has now; a community
   pass is refused once its handle belongs to a moderator. */
export function readPass(req, mods = readMods()) {
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
  const on = mods && mods.get(foldHandle(handle));
  if (role === 'base') return on ? { role, handle, roles: on.roles } : null;
  if (on) return null;
  return { role, handle, roles: new Set() };
}

/* What a radio is told about its own pass: which of the rooms that need a role
   it may go into, so the page can keep quiet in the others. */
export function rolesOf(who) { return who && who.roles ? [...who.roles].sort() : []; }

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

/* A message on the CB's channels keeps its lines, because it may be a list or
   a paragraph or a block of code: line breaks stay (at most one blank line in
   a row), tabs become spaces, every other control character goes, and each
   line loses the spaces at its end. The radio draws its Markdown from these
   lines; nothing in a message is ever HTML. */
export function cleanMessage(s) {
  const t = String(s == null ? '' : s)
    .replace(/\r\n?/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, ' ')
    .split('\n').map((line) => line.replace(/[ \u00a0]+$/, '')).join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+|\n+$/g, '');
  return t.trim() && [...t].length <= MESSAGE_MAX ? t : null;
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
  return messages.map((m) => {
    const out = { id: m.id, handle: m.handle, text: m.text || '', t: m.t, base: !!m.base };
    if (m.img) { out.img = m.img; out.alt = m.alt || ''; }
    return out;
  });
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
