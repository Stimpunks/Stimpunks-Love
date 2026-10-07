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
     · PANDO CALRISSIAN'S TREE IS KEPT FOR EVER, AND IT IS A
       NUMBER. Ryan's call, 2026-09-30: a community tree that grows as it is
       watered, whose count never expires. It counts water and never who
       poured it -- the blob is a number and a time, with no handle in it --
       and the notes on its fence are the chalkboard's, a week and gone.
     · THE FRIDGE OF SIGHS KEEPS SENTENCES FOR GOOD, AND NO NAME IN THEM.
       Ryan's calls, 2026-09-30: one word each, never two in a row, finished
       sentences kept for good. What makes "never two in a row" possible is one
       scrambled mark of whoever put up the last word, replaced by the next.
     · COUNT ME IN IS A STAIR COUNTED TOGETHER, WITH A LIFT BESIDE IT. Ryan's
       calls, 2026-09-30: a wrong number sends it back to one and names nobody,
       it keeps the highest step it has reached, and the chairlift takes
       anybody up a step without a number to get wrong.
     · RESCUE A CAT KNOWS NO RESCUER. Ryan's calls, 2026-09-30: cats turn up
       at random, the first pass to press rescues one and names it, and the
       shelter shows every cat for a week and never who brought it in. A
       rescuer's own list is kept in their browser, never here.
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
     · A USERNAME CAN BE CLAIMED, AND THAT IS THE ONLY ACCOUNT; A MODERATOR
       CAN CLAIM THEIRS TOO, AND KEEPS THEIR ROLES FROM THE LIST. Ryan's calls,
       2026-09-30: from Profile on the radio, with a password of your own and
       no email; a recovery code shown once; moderators can reset or delete
       one, by name, and there is no list of everybody. A claimed username
       signs on with its own password and the community password stops
       working for it. See the accounts section below.
     · A PASS IS CHECKED AND NOT KEPT. It is an HMAC of the handle keyed by the
       current password, so changing the password in Netlify's environment and
       redeploying signs everybody off at once, and there is no list of passes
       anywhere to go stale or leak.
   ============================================================================= */
import { createHmac, createHash, createSign, createPrivateKey, timingSafeEqual, randomUUID, randomBytes, scryptSync } from 'node:crypto';
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

/* ── Pando Calrissian's tree ──────────────────────────────────────────────── */

/* A NUMBER THE CB KEEPS FOR EVER, AND IT IS THE TREE'S. Ryan's calls,
   2026-09-30, after the grow-a-tree game in our Discord's Collaborative
   Nonsense channels: a community tree that grows as it is watered, a count of
   waterings that never expires, only a CB pass waters, and the ground soaks
   for a minute after any watering before it takes more, from anybody.

   It counts WATER AND NEVER WATERERS. The blob holds the number and the time
   of the last watering, and nothing else: no handle, no pass, no list of who,
   so there is nothing here that could become a per-person total, a leaderboard
   or a streak, and the tree cannot tell anybody who has been looking after it.
   A name goes on the fence if somebody writes one there, which is a note, on
   the chalkboard's rules, and gone in a week.

   THE SOAK IS WHOLE-TREE AND NOT PER-PERSON on purpose. A per-person wait
   would need a record of who watered when, which is the list this refuses. The
   soak also means one person with a script cannot make the number mean
   anything but a minute at a time. */
export const PANDO_SOAK = 60 * 1000;              // the ground takes one watering a minute
export const PANDO_KEEP = 30;                     // notes on the fence at once
export const PANDO_MAX = 200;                     // characters of a note
const PANDO = 'pando';
const PANDO_NOTES = 'pando-notes';

export async function readTree(s = store()) {
  const data = await s.get(PANDO, { type: 'json' });
  return { water: (data && Number.isInteger(data.water)) ? data.water : 0, wet: (data && data.wet) || 0 };
}

/* Water it once, unless the ground is still soaking from the last one. The
   answer says which: { tree, poured: true } or { tree, poured: false, soaks }
   with the milliseconds left. updateChannel's conditional write, so two
   waterings in the same instant cannot both land on the same number. */
export async function waterTree(s = store(), now = Date.now(), soak = PANDO_SOAK) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, PANDO);
    const was = cur.exists && cur.data ? cur.data : {};
    const water = Number.isInteger(was.water) ? was.water : 0;
    const wet = typeof was.wet === 'number' ? was.wet : 0;
    if (now - wet < soak) return { tree: { water, wet }, poured: false, soaks: soak - (now - wet) };
    const body = { water: water + 1, wet: now };
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(PANDO, body, opts);
    if (res.modified) return { tree: body, poured: true };
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

export function readFence(s = store()) { return readNotes(PANDO_NOTES, s); }
export function updateFence(change, s = store()) { return updateNotes(PANDO_NOTES, PANDO_KEEP, change, s); }
export function sweepFence(s = store()) { return sweepNotes(PANDO_NOTES, PANDO_KEEP, s); }
export function cleanFence(s) {
  const t = tidy(s);
  return t && [...t].length <= PANDO_MAX ? t : null;
}

/* ── The Fridge of Sighs ─────────────────────────────────────────────────── */

/* A SENTENCE BUILT ONE WORD AT A TIME BY WHOEVER COMES INTO THE KITCHEN. Ryan's
   calls, 2026-09-30, after the sentence builder in our Discord's
   Collaborative Nonsense channels: a CB pass puts up one word; nobody puts up
   two in a row; a word ending in . ! ? or … finishes the sentence; finished
   sentences are kept for good; and NO WORD CARRIES A NAME.

   THE ONLY TRACE OF A PERSON IS WHO PUT UP THE LAST WORD, SCRAMBLED, AND IT IS
   REPLACED BY THE NEXT WORD. "Not twice in a row" cannot be kept without it.
   It is an HMAC of the folded handle keyed by the community password, so it
   cannot be looked up from a handle without the password, it is never sent to
   any page, and a finished sentence holds none of it. Nothing records who put
   up any word but the last.

   THE DOOR AND THE DRAWER. One blob, `fridge`, holds the line being built, the
   last word's mark, and the newest finished sentences, so a finishing word and
   the sentence it finishes are one conditional write and cannot come apart.
   Past FRIDGE_DOOR on the door, the oldest are filed into a drawer by the month
   they were finished (`fridge-drawer-YYYY-MM`): copied in first, skipping any
   id already there, and only then taken off the door, so a filing that stops
   halfway loses nothing and doubles nothing, and the next word tries again. */
export const FRIDGE_WORD_MAX = 24;                // characters in one word
export const FRIDGE_WORDS = 40;                   // a line this long is finished as it stands
export const FRIDGE_DOOR = 40;                    // finished sentences on the door before filing
const FRIDGE = 'fridge';
const drawerKey = (month) => `fridge-drawer-${month}`;
const ENDS = /[.!?…]["”')]*$/;

/* One word, as a magnet can hold it: letters and numbers in any script, joined
   by an apostrophe or a hyphen, with an opening quote or bracket before it and
   up to three marks after it. No spaces, no markup, nothing else. */
const WORD = /^["“'(]?[\p{L}\p{M}\p{N}]+(?:['’\-][\p{L}\p{M}\p{N}]+)*[,;:.!?…"”')]{0,3}$/u;
export function cleanWord(s) {
  const t = String(s == null ? '' : s).normalize('NFC').trim();
  return t && [...t].length <= FRIDGE_WORD_MAX && WORD.test(t) ? t : null;
}

export function fridgeMark(handle, key = secretFor('mobile') || 'no-password-set') {
  return createHmac('sha256', key).update(`fridge|${foldHandle(handle)}`).digest('base64url').slice(0, 22);
}

export function monthOf(t) { return today(new Date(t)).slice(0, 7); }

export async function readFridge(s = store()) {
  const data = await s.get(FRIDGE, { type: 'json' });
  return { words: (data && data.words) || [], door: (data && data.door) || [] };
}

/* Put up one word for `mark`. Answers { put: true, finished, words, door } or
   { put: false, why: 'yours' } when the last word was this person's. */
export async function putWord(word, mark, s = store(), now = Date.now()) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, FRIDGE);
    const was = cur.exists && cur.data ? cur.data : {};
    const words = (was.words || []).slice();
    const door = (was.door || []).slice();
    if (was.last && was.last === mark) return { put: false, why: 'yours', words, door };
    words.push(word);
    let finished = null;
    if (ENDS.test(word) || words.length >= FRIDGE_WORDS) {
      finished = { id: randomUUID(), text: words.join(' '), t: now };
      door.push(finished);
      words.length = 0;
    }
    const body = { words, last: mark, door };
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(FRIDGE, body, opts);
    if (res.modified) return { put: true, finished, words, door };
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* A drawer: the sentences finished in one month, filed off the door. */
export async function readDrawer(month, s = store()) {
  const data = await s.get(drawerKey(month), { type: 'json' });
  return (data && data.sentences) || [];
}

export async function drawers(s = store()) {
  const got = await s.list({ prefix: 'fridge-drawer-' });
  return got.blobs.map((b) => b.key.slice('fridge-drawer-'.length)).filter((m) => /^\d{4}-\d{2}$/.test(m)).sort();
}

async function updateDrawer(month, change, s) {
  const key = drawerKey(month);
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    const list = ((cur.exists && cur.data && cur.data.sentences) || []).slice();
    const next = change(list);
    if (next === null) return list;
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, { sentences: next }, opts);
    if (res.modified) return next;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* File everything past FRIDGE_DOOR into the drawers: copy first, then take off
   the door by id, so a stop in between leaves a sentence in both places for a
   moment and never in neither. */
export async function fileFridge(s = store()) {
  const { door } = await readFridge(s);
  const over = door.slice(0, Math.max(0, door.length - FRIDGE_DOOR));
  if (!over.length) return 0;
  const byMonth = new Map();
  for (const n of over) {
    const m = monthOf(n.t);
    if (!byMonth.has(m)) byMonth.set(m, []);
    byMonth.get(m).push(n);
  }
  for (const [m, list] of byMonth) {
    await updateDrawer(m, (have) => {
      const ids = new Set(have.map((n) => n.id));
      const add = list.filter((n) => !ids.has(n.id));
      return add.length ? [...have, ...add] : null;
    }, s);
  }
  const gone = new Set(over.map((n) => n.id));
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, FRIDGE);
    if (!cur.exists) return 0;
    const was = cur.data || {};
    const body = { words: was.words || [], last: was.last || null, door: (was.door || []).filter((n) => !gone.has(n.id)) };
    const res = await s.setJSON(FRIDGE, body, { onlyIfMatch: cur.etag });
    if (res.modified) return gone.size;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* The base station taking a word off the line, or a finished sentence off the
   door or out of a drawer. The mark is left as it is. */
export async function strikeWord(index, s = store()) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, FRIDGE);
    if (!cur.exists) return { words: [], door: [] };
    const was = cur.data || {};
    const words = (was.words || []).filter((_, i) => i !== index);
    const body = { words, last: was.last || null, door: was.door || [] };
    const res = await s.setJSON(FRIDGE, body, { onlyIfMatch: cur.etag });
    if (res.modified) return { words, door: body.door };
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

export async function strikeSentence(id, s = store()) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, FRIDGE);
    if (!cur.exists) break;
    const was = cur.data || {};
    if (!(was.door || []).some((n) => n.id === id)) break;
    const body = { words: was.words || [], last: was.last || null, door: was.door.filter((n) => n.id !== id) };
    const res = await s.setJSON(FRIDGE, body, { onlyIfMatch: cur.etag });
    if (res.modified) return true;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  for (const m of await drawers(s)) {
    let hit = false;
    await updateDrawer(m, (have) => {
      if (!have.some((n) => n.id === id)) return null;
      hit = true;
      return have.filter((n) => n.id !== id);
    }, s);
    if (hit) return true;
  }
  return false;
}

/* What a page is shown: words and sentences, and never the mark. */
export function shapeLine(words) { return words.slice(); }
export function shapeSentences(list) { return list.map((n) => ({ id: n.id, text: n.text, t: n.t })); }

/* ── Count Me In ─────────────────────────────────────────────────────────── */

/* A STAIR EVERYBODY CLIMBS TOGETHER, A NUMBER TO A STEP. Ryan's calls,
   2026-09-30, after the counting game in our Discord's Collaborative Nonsense
   channels: a CB pass puts the next number; nobody climbs two steps in a row;
   a wrong number sends the stair back to one and NAMES NOBODY; and the stair
   keeps the highest step it has ever reached, which belongs to nobody either.

   THE LIFT IS A WAY UP THAT CANNOT GO WRONG, AND IT COUNTS THE SAME. Ryan, the
   same day: "add a chairlift to the stairs so everyone can join". Riding it
   asks the server for the next step rather than sending a number, so it needs
   no arithmetic and no typing, and it can never send anybody back to one.
   Nothing records which way anybody came up. The one-at-a-time rule holds for
   it too, because that is the game's and not the stair's.

   A NUMBER SOMEBODY ELSE GOT TO FIRST IS NOT A WRONG NUMBER. Two people who
   both see step 11 and both put 12 are both right; the second is told they
   were beaten to it and the stair stays where it is. The same goes for any
   number at or below the step we are on, because that is somebody whose page
   is behind, not somebody who got it wrong. Only a number that skips ahead of
   the next step sends the stair back to one.

   The only trace of a person is the fridge's: a scrambled mark of whoever took
   the last step, replaced by the next, never in any answer. */
export const STAIR_MAX = 9999999;               // the highest number the box takes
const STAIR = 'stair';

export function cleanStep(s) {
  const t = String(s == null ? '' : s).trim();
  if (!/^\d{1,7}$/.test(t)) return null;
  const n = Number(t);
  return n >= 1 && n <= STAIR_MAX ? n : null;
}

export async function readStair(s = store()) {
  const d = await s.get(STAIR, { type: 'json' });
  return { step: (d && d.step) || 0, best: (d && d.best) || 0, fell: (d && d.fell) || null };
}

/* Put `n` on the stair for `mark`, or ride the lift when `n` is 'lift'. The
   answer is { took: true, step, best } or { took: false, why } with why one of
   'yours' (you took the last step), 'beaten' (somebody took that step first) or
   'wrong' (the stair has gone back to one; `wanted` says what it wanted). */
export async function climb(n, mark, s = store(), now = Date.now()) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, STAIR);
    const was = cur.exists && cur.data ? cur.data : {};
    const step = was.step || 0, best = was.best || 0, fell = was.fell || null;
    if (was.last && was.last === mark) return { took: false, why: 'yours', step, best, fell };
    const want = step + 1;
    const got = n === 'lift' ? want : n;
    if (got <= step) return { took: false, why: 'beaten', step, best, fell };
    let body, answer;
    if (got === want) {
      body = { step: want, best: Math.max(best, want), last: mark, fell };
      answer = { took: true, step: body.step, best: body.best, fell };
    } else {
      body = { step: 0, best, last: mark, fell: { at: step, t: now } };
      answer = { took: false, why: 'wrong', wanted: want, step: 0, best, fell: body.fell };
    }
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(STAIR, body, opts);
    if (res.modified) return answer;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* ── The shelters: Rescue A Cat and Rescue A Dog ─────────────────────────── */

/* ANIMALS TURN UP AT RANDOM OUT ON THE STREET, AND THE FIRST CB PASS TO PRESS
   RESCUES ONE. Ryan's calls, 2026-09-30, after the catch-a-cat game in our
   Discord's Collaborative Nonsense channels, renamed: animals are rescued, not
   caught; whoever rescues one names it; the shelter shows every animal and
   never who rescued it; and "animals you rescued" is kept in the rescuer's own
   browser. Then, the same evening: adoption, a Profile in the CB, a list of
   everybody ever adopted, and dogs as well as cats.

   A SHELTER KNOWS ITS ANIMALS AND NOT THEIR RESCUERS. Each kind is one blob:
   when the next animal is due, the shelter's animals (looks, where it was
   found, name, when it came in), and any adoption still being filed. A rescue
   sends a pass, which is checked and forgotten.

   AN ANIMAL IS WAITING WHENEVER THE CLOCK HAS PASSED `due`, worked out rather
   than stored: its looks come from 32 bits of a hash of `due` per look, so
   every page sees the same animal and no look is even slightly rarer than
   another (a byte made four coats a twentieth less likely). Rescuing it sets
   the next `due` a random gap later, kept here and never sent, so nobody can
   know when the next is coming. The first animal is waiting from the start.

   AN ANIMAL STAYS IN THE SHELTER UNTIL SOMEBODY ADOPTS IT. Ryan's call. When
   the shelter is full, the next animal waits outside until somebody adopts.

   ADOPTING IS THE ONE PLACE THE STREET KEEPS SOMETHING UNDER A PERSON, and it
   is Ryan's call, made knowing that: your pets, so they follow you to any
   device you sign on with and sit in your CB's Profile. They are filed under
   a scrambled form of the folded handle (`petKey`), never the handle itself,
   and never under the community password, which would lose everybody's pets
   the day it changed. A handle is not an account: anybody who signs on with
   the same handle sees the same pets, and the tray says so. FORGET ME deletes
   the record; the animals stay on the forever list, which never says who
   adopted anybody.

   ADOPTION FILES IN THREE PLACES AND LOSES NOTHING. The shelter's conditional
   write decides who adopts (one person, once) and moves the animal into the
   shelter's own `leaving` list with the pet key it is going to; then it is
   copied into that person's pets and into the month's forever list, each
   skipping an id already there; then it leaves `leaving`. A stop anywhere in
   between is finished by the next adoption or the hourly sweep, and nothing
   is ever in neither place. */
export const ANIMAL_NAME_MAX = 24;
export const CAT_NAME_MAX = ANIMAL_NAME_MAX;
export const SHELTER_KEEP = 30;                   // animals in one shelter at once
export const ANIMAL_GAP = 25 * 60 * 1000;         // the average wait between one rescue and the next animal
const ANIMAL_GAP_MIN = 4 * 60 * 1000, ANIMAL_GAP_MAX = 3 * 60 * 60 * 1000;

export const CAT_COATS = [
  ['black', 'black all over'], ['ginger', 'ginger'], ['grey', 'grey'], ['white', 'white'],
  ['cream', 'cream'], ['tabby', 'brown tabby'], ['greytabby', 'grey tabby'], ['tortie', 'tortoiseshell'],
  ['calico', 'calico'], ['tuxedo', 'black and white'], ['gingerwhite', 'ginger and white'], ['bluecream', 'blue-cream'],
];
export const CAT_MARKS = [
  ['socks', 'with white socks'], ['bib', 'with a white bib'], ['kink', 'with a kink in the tail'],
  ['tip', 'with one ear tipped'], ['three', 'with three legs and no opinion about it'], ['oneeye', 'with one eye'],
  ['long', 'with long, tangled fur'], ['plain', 'and nothing else about them you would notice'],
];
export const CAT_PLACES = [
  ['car', 'under a parked car'], ['drain', 'halfway up a drainpipe'], ['box', 'in a soggy cardboard box'],
  ['bins', 'behind the bins'], ['sill', 'on a windowsill that is not theirs'], ['stoop', 'under the stoop'],
  ['tree', 'up a tree they cannot get down'], ['shed', 'on a shed roof'], ['kerb', 'in the rain by the kerb'],
  ['hedge', 'in the hedge'],
];
export const CAT_MOODS = [
  ['purr', 'purred the whole way in'], ['hiss', 'hissed, then purred'], ['alone', 'want to be left alone, which is allowed'],
  ['lap', 'went straight for a lap'], ['watch', 'watch everything from the top of the cupboard'],
  ['food', 'are only interested in food'], ['sleep', 'fell asleep before the door shut'],
];
export const DOG_COATS = [
  ['black', 'black'], ['brown', 'chocolate brown'], ['golden', 'golden'], ['white', 'white'],
  ['cream', 'cream'], ['grey', 'grey'], ['brindle', 'brindle'], ['blacktan', 'black and tan'],
  ['merle', 'merle'], ['spotted', 'white with black spots'], ['piebald', 'white and brown'], ['tricolour', 'tricolour'],
];
export const DOG_MARKS = [
  ['socks', 'with white socks'], ['blaze', 'with a white blaze down the face'], ['pointy', 'with ears that stand straight up'],
  ['patch', 'with a patch round one eye'], ['three', 'with three legs and no opinion about it'], ['oneeye', 'with one eye'],
  ['curly', 'with a curly coat'], ['plain', 'and nothing else about them you would notice'],
];
export const DOG_PLACES = [
  ['busstop', 'under the bus shelter, out of the snow'], ['pond', 'by the frozen pond'],
  ['shop', 'tied up outside the shop, and nobody came back'], ['doorway', 'curled up in a doorway'],
  ['bench', 'under a park bench'], ['hill', 'at the bottom of the sledging hill'],
  ['tracks', 'following somebody else’s footprints home'], ['bins', 'by the bins, in the snow'],
  ['stoop', 'on the stoop, waiting'], ['gate', 'at a gate that will not open'],
];
export const DOG_MOODS = [
  ['wag', 'wagged the whole way in'], ['lean', 'lean on everybody'], ['stick', 'brought back a stick nobody threw'],
  ['alone', 'want to be left alone, which is allowed'], ['radiator', 'went straight for the radiator'],
  ['food', 'are only interested in food'], ['sleep', 'fell asleep before the door shut'],
];

/* SMALL ANIMALS, Ryan's brief, 2026-09-30: rabbits, rats, mice, hamsters,
   gerbils, guinea pigs, chinchillas, ferrets and hedgehogs, in one shelter.
   Birds and reptiles may come later. THE SPECIES IS IN THE COAT, three coats
   each, so every species is exactly as likely as every other and no animal is
   rarer, and a coat can only be one that species actually comes in: there is
   no ginger hedgehog. The coat's words are the colour, and the species is its
   noun. Every coat word starts with a consonant, because the page writes
   "a" in front of it. */
export const SMALL_SPECIES = [
  ['rabbit', 'rabbit'], ['rat', 'rat'], ['mouse', 'mouse'], ['hamster', 'hamster'], ['gerbil', 'gerbil'],
  ['guineapig', 'guinea pig'], ['chinchilla', 'chinchilla'], ['ferret', 'ferret'], ['hedgehog', 'hedgehog'],
];
export const SMALL_COATS = [
  ['rabbit-brown', 'brown'], ['rabbit-white', 'white'], ['rabbit-dutch', 'black and white'],
  ['rat-hooded', 'hooded'], ['rat-brown', 'brown'], ['rat-grey', 'grey'],
  ['mouse-white', 'white'], ['mouse-brown', 'brown'], ['mouse-black', 'black'],
  ['hamster-golden', 'golden'], ['hamster-cream', 'cream'], ['hamster-grey', 'grey'],
  ['gerbil-sandy', 'sandy'], ['gerbil-white', 'white'], ['gerbil-black', 'black'],
  ['guineapig-gingerwhite', 'ginger and white'], ['guineapig-black', 'black'], ['guineapig-brownwhite', 'brown and white'],
  ['chinchilla-grey', 'grey'], ['chinchilla-beige', 'beige'], ['chinchilla-black', 'black'],
  ['ferret-sable', 'sable'], ['ferret-white', 'white'], ['ferret-cinnamon', 'cinnamon'],
  ['hedgehog-brown', 'brown'], ['hedgehog-pale', 'pale'], ['hedgehog-dark', 'dark'],
];
export const SMALL_MARKS = [
  ['plain', 'and nothing else about them you would notice'], ['three', 'with three legs and no opinion about it'],
  ['oneeye', 'with one eye'], ['patch', 'with a patch round one eye'], ['nick', 'with a nick out of one ear'],
  ['whiskers', 'with whiskers going every which way'], ['round', 'who is mostly round'],
];
export const SMALL_PLACES = [
  ['boards', 'under the floorboards'], ['shed', 'under the shed'], ['boot', 'in a boot by the back door'],
  ['pot', 'in an upturned flowerpot'], ['stairs', 'under the stairs'], ['shoebox', 'in a shoebox with the lid off'],
  ['skirting', 'behind the skirting board'], ['hay', 'in a bale of hay'], ['drawer', 'in the sock drawer'],
  ['grass', 'in the long grass by the fence'],
];
export const SMALL_MOODS = [
  ['nibble', 'nibbled everything on the way in'], ['still', 'kept very still, which is allowed'],
  ['zoom', 'went round the carrier twice'], ['food', 'are only interested in food'],
  ['sleep', 'fell asleep before the door shut'], ['burrow', 'burrowed straight into the bedding'],
  ['wash', 'washed their face the whole way in'],
];

export const KINDS = {
  cat: { key: 'cats', prefix: 'c', looks: [CAT_COATS, CAT_MARKS, CAT_PLACES, CAT_MOODS] },
  dog: { key: 'dogs', prefix: 'd', looks: [DOG_COATS, DOG_MARKS, DOG_PLACES, DOG_MOODS] },
  small: { key: 'smalls', prefix: 's', looks: [SMALL_COATS, SMALL_MARKS, SMALL_PLACES, SMALL_MOODS] },
};

/* What an animal is, in a word: cat, dog, or a small animal's species, read
   off its coat. */
export function animalNoun(kind, coat) {
  if (kind === 'small') {
    const sp = String(coat || '').split('-')[0];
    return (SMALL_SPECIES.find((x) => x[0] === sp) || [sp, 'small animal'])[1];
  }
  return kind === 'dog' ? 'dog' : 'cat';
}
/* An animal's id says which shelter it came through. */
export const ANIMAL_ID = /^[cds][0-9a-z]{1,12}$/;
export function animalKind(k) { return Object.prototype.hasOwnProperty.call(KINDS, k) ? k : null; }

function pick(list, n) { return list[n % list.length]; }

/* The animal waiting at `due`: its looks from a hash of the kind and `due`,
   the same for every page, and its id from `due` too, so a rescue names the
   animal it meant. */
export function animalAt(kind, due) {
  const K = KINDS[kind];
  const h = createHash('sha256').update(`${kind === 'cat' ? 'cat' : kind}|${due}`).digest();
  const [coat, mark, place, mood] = K.looks.map((list, i) => pick(list, h.readUInt32BE(i * 4)));
  return { id: `${K.prefix}${Number(due).toString(36)}`, kind, coat: coat[0], mark: mark[0], place: place[0], mood: mood[0] };
}
export function catAt(due) { return animalAt('cat', due); }

export function animalGap(u = Math.random()) {
  const g = -Math.log(1 - u) * ANIMAL_GAP;
  return Math.round(Math.min(ANIMAL_GAP_MAX, Math.max(ANIMAL_GAP_MIN, g)));
}
export const catGap = animalGap;

export function cleanAnimalName(s) {
  const t = tidy(s);
  if (!t) return '';
  return [...t].length <= ANIMAL_NAME_MAX ? t : null;
}
export const cleanCatName = cleanAnimalName;

/* Your pets are filed under this, never under your handle. A plain hash, not
   one keyed by the community password, because changing the password would
   otherwise lose everybody's pets. It is not a secret: it is only there so the
   store does not list handles. */
export function petKey(handle) {
  return createHash('sha256').update(`stimpunks-pets|${foldHandle(handle)}`).digest('base64url').slice(0, 32);
}
const petsBlob = (k) => `pets/${k}`;
const adoptedBlob = (kind, month) => `adopted-${kind}-${month}`;

export async function readShelter(kind, s = store(), now = Date.now()) {
  const d = await s.get(KINDS[kind].key, { type: 'json' });
  const due = (d && typeof d.due === 'number') ? d.due : 0;
  const shelter = (d && d.shelter) || [];
  return { waiting: now >= due ? animalAt(kind, due) : null, shelter, full: shelter.length >= SHELTER_KEEP };
}
export function readCats(s = store(), now = Date.now()) { return readShelter('cat', s, now); }

/* Rescue the animal `id`. { rescued: true, animal } for the first press on it;
   { rescued: false, why } when it is already safe ('safe') or the shelter is
   full and it has to wait outside ('full'). */
export async function rescueAnimal(kind, id, name, s = store(), now = Date.now(), gap = animalGap) {
  const key = KINDS[kind].key;
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    const was = cur.exists && cur.data ? cur.data : {};
    const due = typeof was.due === 'number' ? was.due : 0;
    const shelter = was.shelter || [];
    if (now < due || animalAt(kind, due).id !== id) return { rescued: false, why: 'safe', shelter };
    if (shelter.length >= SHELTER_KEEP) return { rescued: false, why: 'full', shelter };
    const animal = { ...animalAt(kind, due), name, t: now };
    const body = { due: now + gap(), shelter: [...shelter, animal], leaving: was.leaving || [] };
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, body, opts);
    if (res.modified) return { rescued: true, animal, cat: animal, shelter: body.shelter };
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}
export function rescueCat(id, name, s = store(), now = Date.now(), gap = animalGap) {
  return rescueAnimal('cat', id, name, s, now, gap);
}

/* A list in a blob, changed with the conditional write. Used for a person's
   pets and for each month's forever list. */
async function updateList(key, field, change, s) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    const list = ((cur.exists && cur.data && cur.data[field]) || []).slice();
    const next = change(list);
    if (next === null) return list;
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, { [field]: next }, opts);
    if (res.modified) return next;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

const addOnce = (item) => (list) => (list.some((x) => x.id === item.id) ? null : [...list, item]);

/* Adopt the animal `id` into the pets of `pk`. { adopted: true, animal } for
   the one person who gets it; { adopted: false } when it is not in the shelter
   (somebody else adopted it first). */
export async function adoptAnimal(kind, id, pk, s = store(), now = Date.now()) {
  const key = KINDS[kind].key;
  let animal = null;
  for (let attempt = 0; attempt < 12 && !animal; attempt++) {
    const cur = await versioned(s, key);
    if (!cur.exists) return { adopted: false, shelter: [] };
    const was = cur.data || {};
    const shelter = was.shelter || [];
    const found = shelter.find((a) => a.id === id);
    if (!found) return { adopted: false, shelter };
    const going = { ...found, at: now };
    const body = { due: was.due || 0, shelter: shelter.filter((a) => a.id !== id),
      leaving: [...(was.leaving || []), { animal: going, to: pk }] };
    const res = await s.setJSON(key, body, { onlyIfMatch: cur.etag });
    if (res.modified) { animal = going; break; }
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  if (!animal) throw new Error('busy');
  await finishAdoptions(kind, s);
  return { adopted: true, animal, shelter: (await readShelter(kind, s, now)).shelter };
}

/* Copy every adoption still leaving into its person's pets and its month's
   forever list, then take it out of `leaving`: copy first, remove after. */
export async function finishAdoptions(kind, s = store()) {
  const key = KINDS[kind].key;
  const d = await s.get(key, { type: 'json' });
  const leaving = (d && d.leaving) || [];
  if (!leaving.length) return 0;
  for (const { animal, to } of leaving) {
    await updateList(petsBlob(to), 'pets', addOnce(animal), s);
    await updateList(adoptedBlob(kind, today(new Date(animal.at)).slice(0, 7)), 'animals', addOnce(animal), s);
  }
  const done = new Set(leaving.map((l) => l.animal.id));
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    if (!cur.exists) return 0;
    const was = cur.data || {};
    const body = { due: was.due || 0, shelter: was.shelter || [], leaving: (was.leaving || []).filter((l) => !done.has(l.animal.id)) };
    const res = await s.setJSON(key, body, { onlyIfMatch: cur.etag });
    if (res.modified) return done.size;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}
export async function finishAllAdoptions(s = store()) {
  let n = 0;
  for (const kind of Object.keys(KINDS)) n += await finishAdoptions(kind, s);
  return n;
}

/* RENAMING A PET. Ryan's call, 2026-09-30: once adopted, a pet takes whatever
   name its person gives it, as often as they like. The name changes in their
   pets and on the forever list, which shows it with the name the animal came
   in under (`first`, kept once, the rescuer's), so the rescuer's naming is not
   written over and nothing on the list says who renamed anybody. An animal
   still in the shelter is nobody's to rename. { pet } or { error }. */
export async function renamePet(pk, id, name, s = store()) {
  await finishAllAdoptions(s);
  const pet = (await readPets(pk, s)).find((a) => a.id === id);
  if (!pet) return { error: 'That animal is not one of your pets.' };
  const rename = (list) => {
    const i = list.findIndex((a) => a.id === id);
    if (i < 0 || list[i].name === name) return null;
    const was = list[i];
    const next = list.slice();
    next[i] = { ...was, name, first: typeof was.first === 'string' ? was.first : (was.name || '') };
    return next;
  };
  // The person's own pets first, then the forever list: a stop between the two
  // leaves the list on the old name until the same rename is pressed again,
  // which finishes it.
  const pets = await updateList(petsBlob(pk), 'pets', rename, s);
  const kind = animalKind(pet.kind) || 'cat';
  await updateList(adoptedBlob(kind, today(new Date(pet.at)).slice(0, 7)), 'animals', rename, s);
  return { pet: pets.find((a) => a.id === id) };
}

export async function readPets(pk, s = store()) {
  const d = await s.get(petsBlob(pk), { type: 'json' });
  return (d && d.pets) || [];
}

/* FORGET ME: finish anything of this person's still being filed, then delete
   their record. The animals stay on the forever list, which never knew them. */
export async function forgetPets(pk, s = store()) {
  await finishAllAdoptions(s);
  await s.delete(petsBlob(pk));
  await s.delete(shownBlob(pk));
  return true;
}

export async function readAdopted(kind, month, s = store()) {
  const d = await s.get(adoptedBlob(kind, month), { type: 'json' });
  return (d && d.animals) || [];
}
export async function adoptedMonths(kind, s = store()) {
  const pre = `adopted-${kind}-`;
  const got = await s.list({ prefix: pre });
  return got.blobs.map((b) => b.key.slice(pre.length)).filter((m) => /^\d{4}-\d{2}$/.test(m)).sort();
}

/* The base station taking a name off an animal wherever it is: the shelter,
   the forever list, and anybody's pets. The animal stays. */
export async function unnameAnimal(kind, id, s = store()) {
  const key = KINDS[kind].key;
  // A renamed animal's first name goes too: taking a name off means every name
  // on it, the rescuer's and the adopter's.
  const clear = (list) => (list.some((a) => a.id === id && (a.name || a.first))
    ? list.map((a) => (a.id === id ? (a.first !== undefined ? { ...a, name: '', first: '' } : { ...a, name: '' }) : a)) : null);
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    if (!cur.exists) break;
    const was = cur.data || {};
    const shelter = was.shelter || [];
    if (!shelter.some((a) => a.id === id)) break;
    const body = { due: was.due || 0, shelter: clear(shelter) || shelter, leaving: was.leaving || [] };
    const res = await s.setJSON(key, body, { onlyIfMatch: cur.etag });
    if (res.modified) break;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  await finishAdoptions(kind, s);
  for (const m of await adoptedMonths(kind, s)) await updateList(adoptedBlob(kind, m), 'animals', clear, s);
  const pets = await s.list({ prefix: 'pets/' });
  for (const b of pets.blobs) await updateList(b.key, 'pets', clear, s);
  return (await readShelter(kind, s)).shelter;
}
export function unnameCat(id, s = store()) { return unnameAnimal('cat', id, s); }

/* What a page is shown about an animal: its kind, its looks in keys and words,
   its name, and when it came in or was adopted. Never a pet key. */
const says = (list, key) => (list.find((x) => x[0] === key) || [key, key])[1];
export function shapeAnimal(a) {
  const kind = animalKind(a.kind) || 'cat';
  const [coats, marks, places, moods] = KINDS[kind].looks;
  const out = { id: a.id, kind, coat: a.coat, mark: a.mark, place: a.place, mood: a.mood,
    words: { coat: says(coats, a.coat), mark: says(marks, a.mark), place: says(places, a.place), mood: says(moods, a.mood),
      noun: animalNoun(kind, a.coat) } };
  if (typeof a.t === 'number') { out.name = a.name || ''; out.t = a.t; }
  if (typeof a.first === 'string' && a.first && a.first !== out.name) out.first = a.first;
  if (typeof a.at === 'number') out.at = a.at;
  return out;
}
export const shapeCat = shapeAnimal;

/* ── Showing off your pets ─────────────────────────────────────────────────

   Ryan's brief, 2026-09-30: stickers of your pets to send to the channel, and
   clicking somebody's handle on the channel to see their pets, if they have
   made them public.

   A STICKER IS A COPY OF WHAT A PET LOOKS LIKE AND IS CALLED, taken when it is
   sent, and it is part of its message: it goes when the message goes, at
   midnight at the latest. It is only ever one of the sender's own pets, found
   by the server under the sender's pet key, never described by the request.
   It carries the kind, the coat, the markings and the name, which is all a
   sticker needs to be drawn, and nothing that points back at the pet record
   or the forever list: no id, no dates.

   YOUR PETS ARE PUBLIC ONLY WHEN YOU SAY SO, AND ONLY ON A CLAIMED USERNAME.
   An unclaimed handle is anybody's who signs on with it, so it cannot choose
   to be shown on anybody's behalf. The switch is one blob, shown/<pet key>,
   holding when it was switched on, deleted by switching it off, by Forget Me
   and by deleting the account. "Public" means people signed on to the CB: the
   lookup needs a pass, like the channel the handle was clicked on. The answer
   for a handle that is not shown is the same whether it is unclaimed, claimed
   and not shown, or not a handle at all. Showing your pets lets people match
   them to the list of everybody adopted, and the privacy page says so: that
   is the person's choice to make, and the list itself still says nothing. */
const shownBlob = (k) => `shown/${k}`;

export async function setShown(handle, on, s = store(), now = Date.now()) {
  const k = shownBlob(petKey(handle));
  if (!on) { await s.delete(k); return false; }
  // Switched on is switched on: a second press, or two at once, change nothing.
  const cur = await versioned(s, k);
  if (!cur.exists) await s.setJSON(k, { since: now }, { onlyIfNew: true });
  return true;
}

export async function isShown(handle, s = store()) {
  if (!(await readAccount(handle, s))) return false;
  const d = await s.get(shownBlob(petKey(handle)), { type: 'json' });
  return !!(d && typeof d.since === 'number');
}

/* Somebody's pets, as a person on the CB is shown them: { handle, pets } when
   they are public, and null otherwise, whatever the reason. The pets are drawn
   and named, and say what they are; they do not say when they were adopted. */
export async function shownPets(handle, s = store()) {
  if (!(await isShown(handle, s))) return null;
  const acct = await readAccount(handle, s);
  const pets = await readPets(petKey(handle), s);
  return { handle: acct.handle, pets: pets.map((a) => {
    const out = shapeAnimal(a);
    delete out.at; delete out.t;
    return out;
  }) };
}

/* A sticker of one of your own pets, or null if `id` is not one of them. */
export async function stickerOf(handle, id, s = store()) {
  if (typeof id !== 'string' || !ANIMAL_ID.test(id)) return null;
  const pet = (await readPets(petKey(handle), s)).find((a) => a.id === id);
  if (!pet) return null;
  return { kind: animalKind(pet.kind) || 'cat', coat: pet.coat, mark: pet.mark, name: pet.name || '' };
}

export function shapeSticker(st) {
  const kind = animalKind(st && st.kind);
  if (!kind) return null;
  const [coats, marks] = KINDS[kind].looks;
  if (!coats.some((c) => c[0] === st.coat) || !marks.some((m) => m[0] === st.mark)) return null;
  return { kind, coat: st.coat, mark: st.mark, name: typeof st.name === 'string' ? st.name : '',
    words: { coat: says(coats, st.coat), mark: says(marks, st.mark), noun: animalNoun(kind, st.coat) } };
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

/* `.acct` in a key marks a claimed username, set from the pass and never from
   the request, so a list can say CLAIMED the way the channel does. A `.find`
   key is the same mark under the name it had on its first day (2026-10-07),
   read so that one left over is still swept. */
function seenKey(tag, visit, t, role, handle, claimed) {
  return `${SEEN}${tag}/${visit}.${t}.${role}${claimed ? '.acct' : ''}.${b64(handle)}`;
}
function parseSeen(key) {
  const m = /^room-here\/([a-z0-9-]+)\/([A-Za-z0-9_-]+)\.(\d+)\.(mobile|base)(\.(?:acct|find))?\.([A-Za-z0-9_-]+)$/.exec(key);
  if (!m) return null;
  let handle;
  try { handle = Buffer.from(m[6], 'base64url').toString('utf8'); } catch (e) { return null; }
  return { key, tag: m[1], visit: m[2], t: Number(m[3]), base: m[4] === 'base', claimed: !!m[5], handle };
}
async function everySeen(s) {
  return ((await s.list({ prefix: SEEN })).blobs || []).map((b) => parseSeen(b.key)).filter(Boolean);
}
function seenIn(all, tag, visit, now) {
  const seen = new Map();
  for (const r of all) {
    if (r.tag !== tag || r.visit === visit || now - r.t >= ROOM_FRESH) continue;
    if (!seen.has(r.handle)) seen.set(r.handle, { handle: r.handle, base: r.base, claimed: r.claimed });
  }
  return [...seen.values()].sort((a, b) => a.handle.localeCompare(b.handle));
}

/* Be seen in a room, which is also what lets you see who else is. The visit's
   earlier record goes, wherever it was, so which rooms somebody has been in is
   never a trail. */
export async function beSeen(who, tag, visit, s = store(), now = Date.now()) {
  const all = await everySeen(s);
  const key = seenKey(tag, visit, now, who.role, who.handle, who.account === true);
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

/* WHO'S ONLINE. Ryan, 2026-10-07: "Folks are wanting to know who's around and
   are having a hard time connecting right now." Everybody seen in a room, with
   the rooms they are in, for anybody signed on, seen or not. That reverses two
   things written down here before: Be seen here used to show you only to the
   people seen in the same room, and a who's-online list was the edit this CB
   refused. Both were Ryan's calls and this is too; the privacy page says what
   Be seen here means now, and the Slake keeps its own rule, because its switch
   only ever said "out here".

   What it still keeps: only somebody who pressed Be seen here is on it; names
   in alphabetical order, so nobody is first for arriving first, and no number;
   CLAIMED beside a claimed username, because an unclaimed handle is anybody's
   who signs on with it; a room the asker may not enter is left out, and
   somebody seen only there is not on the asker's list at all; and nothing is
   stored for it, or records who looked. The same handle in two rooms (two
   tabs) is one row with both rooms; the same unclaimed handle on two people
   cannot be told apart, which is why the mark matters. */
export async function whoSeen(who, s = store(), now = Date.now()) {
  const people = new Map();
  for (const r of await everySeen(s)) {
    // A room that keeps to itself is never on it: who is there is the room's.
    if (now - r.t >= ROOM_FRESH || !roomAllows(who, r.tag) || quietRoom(r.tag)) continue;
    const k = `${r.claimed ? 'c' : 'u'}|${r.handle}`;
    let p = people.get(k);
    if (!p) people.set(k, p = { handle: r.handle, base: false, claimed: r.claimed, rooms: [] });
    if (r.base) p.base = true;
    if (!p.rooms.includes(r.tag)) p.rooms.push(r.tag);
  }
  return [...people.values()]
    .map((p) => ({ ...p, rooms: p.rooms.sort() }))
    .sort((a, b) => a.handle.localeCompare(b.handle) || Number(b.claimed) - Number(a.claimed));
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

/* ROOMS THAT KEEP TO THEMSELVES. Ryan, 2026-10-07: the street can carry rooms
   you have to know the address of, listed nowhere (tools/unlisted.py), and in
   them "all the usual amenities, just kept quiet": the room's own channel, Be
   seen here, its call, and hosting a film, "in room only, nothing announced
   outside". So what goes on in one is told only inside it: a film hosted there
   reaches only the radios tuned to its channel (shapeBeacons), and nobody seen
   there is on Who's online (whoSeen). Be seen here and the call already answer
   only a radio seen in the room. Its channel is any radio's that names it, and
   naming it means knowing the address, which is the way in.
   tools/check-unlisted.py refuses this list unless it is exactly the pages that
   say data-unlisted, so a room cannot be quiet on the page and loud here. */
export const QUIET_ROOMS = ['the-secret-cabin', 'lydtyss'];
export function quietRoom(tag) { return QUIET_ROOMS.includes(tag) ? tag : null; }

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
/* A beacon may say which video, by its YouTube id, so a radio can find that
   film's own play button exactly; a rack can hold several films with nearly
   the same title. An id names a public video and nobody. */
export function cleanVideo(v) { return typeof v === 'string' && /^[A-Za-z0-9_-]{11}$/.test(v) ? v : null; }
/* And how long the film runs, as the host's player reports it, so a radio
   that has to put the film's play button up for somebody (a moderator's video
   pasted into the radio has no button of its own on anybody else's page) can
   say how long before the press, like every play button on the street. */
export async function hostBeacon(who, room, film, at, playing, s = store(), now = Date.now(), video = null, length = null) {
  if (!roomAllows(who, room)) return { closed: true };
  let held = null;
  const beacons = await updateBeacons((list) => {
    held = null;
    const there = list.find((b) => b.room === room);
    if (there && there.handle !== who.handle && who.role !== 'base') { held = there.handle; return null; }
    return list.filter((b) => b.room !== room)
      .concat({ room, handle: who.handle, base: who.role === 'base', film, video: cleanVideo(video), length: cleanAt(length) || null, at, playing: !!playing, t: now });
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
   itself a thing about the board room. And a room that keeps to itself
   (QUIET_ROOMS) is heard only by a radio tuned to that room's channel, which is
   `tuned`: the room a listen names, or the room a host is hosting. */
export function shapeBeacons(list, who = null, tuned = null) {
  return list.filter((b) => (!who || roomAllows(who, b.room)) && (!quietRoom(b.room) || b.room === tuned)).map((b) => ({ room: b.room, handle: b.handle, base: !!b.base, film: b.film, video: b.video || null, length: b.length || null, at: b.at, playing: !!b.playing, t: b.t }));
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
export async function signOn(handle, password, mods = readMods(), s = store(), now = Date.now()) {
  const mod = secretFor('base');
  if (mod && same(password, mod)) {
    if (!mods) return { error: 'Moderator sign-on is switched off until its list of handles can be read. Tell Ryan or Helen.' };
    const m = mods.get(foldHandle(handle));
    if (!m) return { error: 'That handle is not on the moderators\' list.' };
    // A MODERATOR WHO HAS MOVED ONTO THEIR OWN PASSWORD is refused the shared
    // one, exactly as a claimed username is refused the community password:
    // every moderator knows the moderators' password, so while it worked for
    // this handle any of them could sign on as it.
    if (await readAccount(m.handle, s)) return { error: 'That moderator signs on with their own password now, not the moderators\' one.' };
    return { role: 'base', handle: m.handle, roles: m.roles };
  }
  // A CLAIMED USERNAME SIGNS ON WITH ITS OWN PASSWORD AND NOTHING ELSE. The
  // community password is refused for it, the way it is refused for a
  // moderator's handle, so nobody can sign on as somebody who has claimed.
  const acct = await readAccount(handle, s);
  if (acct) {
    const all0 = secretFor('mobile');
    if (all0 && same(password, all0)) {
      return { error: 'That username has been claimed. Sign on with its own password, or pick another handle.' };
    }
    const r = await checkPassword(handle, password, s, now);
    if (r.error) return r;
    // Its roles still come from the moderators' list, read now, never from the
    // account: taking somebody off the list leaves them an ordinary claimed
    // username with the same password.
    const on = mods && mods.get(foldHandle(handle));
    if (on) return { role: 'base', handle: on.handle, roles: on.roles, account: r.v };
    return { role: 'mobile', handle: acct.handle, roles: new Set(), account: r.v };
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
   pass is refused once its handle belongs to a moderator, and once it has been
   claimed. A claimed username's pass (cb2) carries the account's version, and
   is refused the moment the version moves: a password change, a reset or a
   deletion signs every device off at once. Both kinds are signed with the
   community password, so changing it still signs everybody off. */
export async function readPass(req, mods = readMods(), s = store()) {
  const h = req.headers.get('authorization') || '';
  const a = /^Bearer cb2\.(acct|base)\.([A-Za-z0-9_-]+)\.(\d{1,9})\.([A-Za-z0-9_-]+)$/.exec(h);
  if (a) {
    const kind = a[1];
    const secret = secretFor(kind === 'base' ? 'base' : 'mobile');
    if (!secret) return null;
    let handle;
    try { handle = Buffer.from(a[2], 'base64url').toString('utf8'); } catch (e) { return null; }
    if (cleanHandle(handle) !== handle) return null;
    const v = Number(a[3]);
    const want = createHmac('sha256', secret).update(`cb2|${kind}|${handle}|${v}`).digest();
    const got = Buffer.from(a[4], 'base64url');
    if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
    const on = mods && mods.get(foldHandle(handle));
    // A moderator's own pass is good only while they are on the list, and an
    // ordinary claimed pass is refused once its username is on it.
    if (kind === 'base' ? !on : on) return null;
    const acct = await readAccount(handle, s);
    if (!acct || acct.v !== v) return null;
    if (kind === 'base') return { role: 'base', handle: on.handle, roles: on.roles, account: true };
    return { role: 'mobile', handle: acct.handle, roles: new Set(), account: true };
  }
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
  if (role === 'base') {
    // The shared password's pass stops the moment a moderator moves onto their
    // own, the way a community pass stops when its username is claimed.
    if (!on || await readAccount(handle, s)) return null;
    return { role, handle, roles: on.roles };
  }
  if (on) return null;
  if (await readAccount(handle, s)) return null;
  return { role, handle, roles: new Set() };
}

/* A claimed username's pass. A moderator's is cb2.base, signed with the
   moderators' password so that changing it still signs every moderator off;
   everybody else's is cb2.acct, signed with the community password. */
export function issueAccountPass(handle, v, role = 'mobile') {
  const kind = role === 'base' ? 'base' : 'acct';
  const sig = createHmac('sha256', secretFor(role === 'base' ? 'base' : 'mobile')).update(`cb2|${kind}|${handle}|${v}`).digest();
  return `cb2.${kind}.${b64(handle)}.${v}.${b64(sig)}`;
}

/* The pass and what the radio is told, for a claimed username that has just
   signed on, claimed, changed its password or recovered: a moderator's if the
   username is on the list now, an ordinary one otherwise. */
export function accountAnswer(handle, v, mods = readMods()) {
  const on = mods && mods.get(foldHandle(handle));
  if (on) return { pass: issueAccountPass(on.handle, v, 'base'), handle: on.handle, base: true, roles: [...on.roles].sort(), claimed: true };
  return { pass: issueAccountPass(handle, v), handle, base: false, roles: [], claimed: true };
}

/* Whether a handle is a moderator's. The desk will not reset or delete one:
   a reset code for a moderator's username would let one moderator sign on as
   another, with the other's roles, which is the reason for moving moderators
   onto passwords of their own in the first place. */
export function isMod(handle, mods = readMods()) {
  return !!(mods && mods.has(foldHandle(handle)));
}

/* ── Accounts: a username you claim, with a password of your own ───────── */

/* Ryan's calls, 2026-09-30: a Profile on the CB where you can claim your
   username and set your own password; no email; a recovery code shown once
   when you claim; moderators can reset a password or delete an account, in
   the Moderators' room. Claiming is optional and only possible while signed
   on with the community password, so there is no public sign-up.

   MODERATORS CAN MOVE ONTO PASSWORDS OF THEIR OWN. Ryan's call, the same
   evening, starting with himself. A moderator signed on with the moderators'
   password claims their handle from Profile exactly as anybody else does; from
   then on that handle signs on with its own password, the shared one is
   refused for it, and its pass is cb2.base. The account is the same record as
   anybody's and holds no role: the roles are read off CB_MODS on every request,
   as they always were, so taking somebody off the list leaves them an ordinary
   claimed username. The desk will not reset or delete a moderator's username
   (isMod); a moderator who has lost both password and recovery code is taken
   off the list for a moment by whoever holds the Netlify keys, reset at the
   desk as an ordinary username, and put back.

   WHAT AN ACCOUNT IS: the username as claimed, a scrypt hash of its password
   and of its recovery code (each with its own salt), when it was claimed, a
   version, and a count of wrong passwords with the time it is locked until.
   No email, no other name, nothing about what anybody does. It is filed under
   acctKey, a plain hash of the folded username, so the store does not list
   usernames and there is nothing here to browse: a moderator finds an account
   by typing its name.

   A WRONG PASSWORD FIVE TIMES LOCKS IT FOR FIFTEEN MINUTES, on top of
   Netlify's limit per address. A moderator's reset gives a one-time code good
   for a day, which the person uses exactly as a recovery code; it bumps the
   version, so whoever was signed on as them is signed off. Deleting an account
   deletes its pets with it. */
export const ACCT_PW_MIN = 8;
export const ACCT_PW_MAX = 200;
export const ACCT_TRIES = 5;
export const ACCT_LOCK = 15 * 60 * 1000;
export const ACCT_RESET_FOR = 24 * 60 * 60 * 1000;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function acctKey(handle) {
  return createHash('sha256').update(`stimpunks-acct|${foldHandle(handle)}`).digest('base64url').slice(0, 32);
}
const acctBlob = (handle) => `acct/${acctKey(handle)}`;

function salt() { return randomBytes(16).toString('base64url'); }
function scrypt(secret, sl) {
  return scryptSync(String(secret).normalize('NFC'), sl, 32, { N: 16384, r: 8, p: 1 }).toString('base64url');
}
function matches(secret, sl, hash) {
  if (!sl || !hash) return false;
  const a = Buffer.from(scrypt(secret, sl)), b = Buffer.from(hash);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function makeCode(bytes = randomBytes(16)) {
  let out = '';
  for (let i = 0; i < 16; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out.match(/.{4}/g).join('-');
}
export function cleanCode(s) {
  return String(s == null ? '' : s).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function cleanPassword(p) {
  const t = typeof p === 'string' ? p : '';
  const n = [...t].length;
  return n >= ACCT_PW_MIN && n <= ACCT_PW_MAX ? t : null;
}

/* A password of your own is not one of the shared ones: the shared ones are
   checked first when anybody signs on, so it could never be used, and it
   would be known to everybody who holds it. */
function ownPassword(p) {
  const t = cleanPassword(p);
  if (!t) return null;
  for (const role of ['mobile', 'base']) {
    const shared = secretFor(role);
    if (shared && same(t, shared)) return null;
  }
  return t;
}

export async function readAccount(handle, s = store()) {
  const d = await s.get(acctBlob(handle), { type: 'json' });
  return d && typeof d.hash === 'string' ? d : null;
}

/* Change an account with the conditional write. `change` gets the record and
   returns the next one, or null to leave it. */
async function updateAccount(handle, change, s) {
  const key = acctBlob(handle);
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    if (!cur.exists || !cur.data) return null;
    const next = change({ ...cur.data });
    if (next === null) return cur.data;
    const res = await s.setJSON(key, next, { onlyIfMatch: cur.etag });
    if (res.modified) return next;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* Claim `handle` with `password`. The first claim wins; a handle on the
   moderators' list cannot be claimed. Answers { v, recovery } with the code
   to be shown once, or { error }. */
export async function claimAccount(handle, password, s = store(), now = Date.now(), mods = readMods(), asBase = false) {
  if (!asBase && mods && mods.has(foldHandle(handle))) return { error: 'That handle is a moderator\'s, and only they can move it onto a password of their own.' };
  const pw = ownPassword(password);
  if (!pw) return { error: `A password is between ${ACCT_PW_MIN} and ${ACCT_PW_MAX} characters, and not the community or the moderators' password. A few words you will remember is fine.` };
  const recovery = makeCode();
  const ps = salt(), rs = salt();
  const body = { handle, hash: scrypt(pw, ps), salt: ps, rhash: scrypt(cleanCode(recovery), rs), rsalt: rs,
    since: now, v: 1, fails: 0, lockUntil: 0 };
  const res = await s.setJSON(acctBlob(handle), body, { onlyIfNew: true });
  if (!res.modified) return { error: 'That username has already been claimed.' };
  return { v: 1, recovery, handle };
}

/* Check a password, counting the wrong ones. { v } when right, { error } when
   wrong or locked. */
export async function checkPassword(handle, password, s = store(), now = Date.now()) {
  const acct = await readAccount(handle, s);
  if (!acct) return { error: 'That username has not been claimed.' };
  if (acct.lockUntil > now) return { error: 'That username is locked for a few minutes after too many wrong passwords. Try again soon, or ask a moderator.', locked: true };
  if (matches(password, acct.salt, acct.hash)) {
    if (acct.fails) await updateAccount(handle, (a) => ({ ...a, fails: 0 }), s);
    return { v: acct.v };
  }
  const after = await updateAccount(handle, (a) => {
    const fails = (a.lockUntil > now ? 0 : a.fails || 0) + 1;
    return fails >= ACCT_TRIES ? { ...a, fails: 0, lockUntil: now + ACCT_LOCK } : { ...a, fails };
  }, s);
  return after && after.lockUntil > now
    ? { error: 'That is not its password, and that was the last try for now: it is locked for fifteen minutes.', locked: true }
    : { error: 'That is not its password.' };
}

export async function changePassword(handle, old, password, s = store(), now = Date.now()) {
  const ok = await checkPassword(handle, old, s, now);
  if (ok.error) return ok;
  const pw = ownPassword(password);
  if (!pw) return { error: `A password is between ${ACCT_PW_MIN} and ${ACCT_PW_MAX} characters, and not one of the shared ones.` };
  const ps = salt();
  const next = await updateAccount(handle, (a) => ({ ...a, hash: scrypt(pw, ps), salt: ps, v: a.v + 1, fails: 0, lockUntil: 0 }), s);
  return next ? { v: next.v } : { error: 'That username has not been claimed.' };
}

/* Set a new password with the recovery code, or with a moderator's reset code
   while it lasts. Either way a new recovery code is made and shown once, and
   the version moves. A wrong code counts as a wrong password. */
export async function recoverAccount(handle, code, password, s = store(), now = Date.now()) {
  const acct = await readAccount(handle, s);
  if (!acct) return { error: 'That username has not been claimed.' };
  if (acct.lockUntil > now) return { error: 'That username is locked for a few minutes after too many wrong tries. Try again soon, or ask a moderator.', locked: true };
  const c = cleanCode(code);
  const byReset = acct.reset && acct.reset.until > now && matches(c, acct.reset.salt, acct.reset.hash);
  const byCode = matches(c, acct.rsalt, acct.rhash);
  if (!byReset && !byCode) {
    const after = await updateAccount(handle, (a) => {
      const fails = (a.lockUntil > now ? 0 : a.fails || 0) + 1;
      return fails >= ACCT_TRIES ? { ...a, fails: 0, lockUntil: now + ACCT_LOCK } : { ...a, fails };
    }, s);
    return after && after.lockUntil > now ? { error: 'That is not its code, and it is locked for fifteen minutes now.', locked: true } : { error: 'That is not its recovery code, or a reset code a moderator gave you.' };
  }
  const pw = ownPassword(password);
  if (!pw) return { error: `A password is between ${ACCT_PW_MIN} and ${ACCT_PW_MAX} characters, and not one of the shared ones.` };
  const recovery = makeCode();
  const ps = salt(), rs = salt();
  const next = await updateAccount(handle, (a) => {
    const n = { ...a, hash: scrypt(pw, ps), salt: ps, rhash: scrypt(cleanCode(recovery), rs), rsalt: rs, v: a.v + 1, fails: 0, lockUntil: 0 };
    delete n.reset;
    return n;
  }, s);
  return next ? { v: next.v, recovery, handle: next.handle } : { error: 'That username has not been claimed.' };
}

/* A moderator's reset: a one-time code good for a day, and everybody signed
   on as that username is signed off. The code is shown to the moderator once
   and kept here only as a hash. */
export async function resetAccount(handle, s = store(), now = Date.now()) {
  const code = makeCode();
  const rs = salt();
  const next = await updateAccount(handle, (a) => ({ ...a, v: a.v + 1, reset: { hash: scrypt(cleanCode(code), rs), salt: rs, until: now + ACCT_RESET_FOR }, fails: 0, lockUntil: 0 }), s);
  return next ? { code, until: now + ACCT_RESET_FOR } : { error: 'That username has not been claimed.' };
}

/* Delete an account and its pets. The username is free again. */
export async function deleteAccount(handle, s = store()) {
  const acct = await readAccount(handle, s);
  if (!acct) return { error: 'That username has not been claimed.' };
  await forgetPets(petKey(handle), s);
  await s.delete(acctBlob(handle));
  return { deleted: true };
}

/* What a person, or a moderator looking them up, is told about an account:
   whether it is claimed, as what, and since when. Never a hash. */
export function shapeAccount(a) { return a ? { claimed: true, handle: a.handle, since: a.since } : { claimed: false }; }

/* What a radio is told about its own pass: which of the rooms that need a role
   it may go into, so the page can keep quiet in the others. */
export function rolesOf(who) { return who && who.roles ? [...who.roles].sort() : []; }

/* ── The Brass Tacks Board ──────────────────────────────────────────────────

   Ryan's brief, 2026-09-30: a board for things meant to persist -- news,
   notices, events, celebrations, posts -- that anybody can read and only a
   moderator can post on, with their username on the post for everybody to
   see. Ryan's calls the same evening: the author edits, any moderator takes a
   post down, the board has a feed of its own, and a post may carry a picture.

   ONE BLOB HOLDS EVERY POST (`brass`, newest first), written with the boards'
   conditional write, because a board of notices is dozens or hundreds of
   posts and not millions; if it ever needs search across thousands, that is
   Netlify's Postgres, not this. A post is kept until a moderator takes it
   down. There is no other copy and no archive.

   MARKDOWN IS READ HERE, ONCE, INTO A PLAIN STRUCTURE (`parseBrass`), never
   into HTML. The board's page builds that structure into elements with
   textContent, and the feed builds it into escaped HTML, so there is one
   reader and nothing a moderator types can become markup or script. A link
   goes only to http, https, mailto, or a path or anchor on this site; any
   other address stays as the words typed.

   A PICTURE IS THE CB'S PIPELINE WITH A PUBLIC ADDRESS. It is redrawn in the
   moderator's browser, refused here if it still carries camera data, needs a
   description, and is served to anybody from /cb/brass/image, because a board
   anybody reads cannot hide its pictures behind a pass. It lives under its own
   prefix, so the channel's sweep never reaches it, and goes when its post
   goes; an upload no post holds is swept after a day. The moderator says, on
   the form, that everybody recognisable in it has said yes. */
export const BRASS_TITLE_MAX = 120;
export const BRASS_BODY_MAX = 20000;
export const BRASS_ALT_MAX = 600;
const BRASS = 'brass';
const BRASS_IMG = 'brass-img/';
const BRASS_IMG_UNSENT = 24 * 60 * 60 * 1000;

export function cleanBrassTitle(v) { const t = tidy(v); return t && [...t].length <= BRASS_TITLE_MAX ? t : null; }
export function cleanBrassAlt(v) { const t = tidy(v); return t && [...t].length <= BRASS_ALT_MAX ? t : null; }
export function cleanBrassBody(v) {
  const t = String(v == null ? '' : v)
    .replace(/\r\n?/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g, ' ')
    .split('\n').map((line) => line.replace(/[  ]+$/, '')).join('\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/^\n+|\n+$/g, '');
  return t.trim() && [...t].length <= BRASS_BODY_MAX ? t : null;
}

/* Where a link may go, or null. Only these, and the words stay words otherwise. */
export function brassHref(u) {
  const v = String(u || '').trim();
  if (!v || v.length > 2000 || /[\s<>"]/.test(v)) return null;
  if (/^(https?:\/\/|mailto:)/i.test(v)) {
    try { const x = new URL(v); return /^(https?:|mailto:)$/.test(x.protocol) && !x.username && !x.password ? x.href : null; }
    catch (e) { return null; }
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return null;          // javascript:, data:, anything with a scheme
  if (/^\/\//.test(v)) return null;                          // protocol-relative: somewhere else in disguise
  return v;                                                   // /a-room.html, #a-post, a-room.html
}

/* Inline Markdown into nodes: text, b, i, s, code, a, br. */
function brassInline(src, depth = 0) {
  const out = [];
  let buf = '';
  const flush = () => { if (buf) { out.push({ t: 'text', v: buf }); buf = ''; } };
  const push = (n) => { flush(); out.push(n); };
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === '\\' && i + 1 < src.length && /[\\`*_{}\[\]()#+\-.!~|>]/.test(src[i + 1])) { buf += src[i + 1]; i += 2; continue; }
    if (c === '\n') { push({ t: 'br' }); i++; continue; }
    if (c === '`') {
      const run = /^`+/.exec(src.slice(i))[0];
      const end = src.indexOf(run, i + run.length);
      if (end > 0) { push({ t: 'code', v: src.slice(i + run.length, end).replace(/^ (.*) $/s, '$1') }); i = end + run.length; continue; }
      buf += run; i += run.length; continue;
    }
    if (c === '!' && src[i + 1] === '[') { buf += '!'; i++; continue; }  // no pictures from elsewhere: the link stays
    if (c === '[' && depth < 4) {
      const close = matchBracket(src, i);
      if (close > 0 && src[close + 1] === '(') {
        const pe = src.indexOf(')', close + 2);
        if (pe > 0) {
          const target = src.slice(close + 2, pe).trim().replace(/\s+"[^"]*"$/, '');
          const href = brassHref(target.replace(/^<(.*)>$/, '$1'));
          if (href) { push({ t: 'a', href, c: brassInline(src.slice(i + 1, close), depth + 1) }); i = pe + 1; continue; }
        }
      }
    }
    if (c === '<') {
      const m = /^<((?:https?:\/\/|mailto:)[^\s<>]+)>/i.exec(src.slice(i));
      const href = m && brassHref(m[1]);
      if (href) { push({ t: 'a', href, c: [{ t: 'text', v: m[1] }] }); i += m[0].length; continue; }
    }
    if ((c === 'h' || c === 'H') && /^https?:\/\//i.test(src.slice(i)) && !/[\w/]$/.test(buf)) {
      let m = /^https?:\/\/[^\s<>]+/i.exec(src.slice(i))[0];
      m = m.replace(/[.,;:!?'")\]]+$/, '');
      const href = brassHref(m);
      if (href) { push({ t: 'a', href, c: [{ t: 'text', v: m }] }); i += m.length; continue; }
    }
    if ((c === '*' || c === '_' || c === '~') && depth < 6) {
      const two = src.slice(i, i + 2);
      const kind = two === '**' || two === '__' ? 'b' : two === '~~' ? 's' : c !== '~' ? 'i' : null;
      const delim = kind === 'i' ? c : kind ? two : null;
      const intraword = c === '_' && /\w/.test(src[i - 1] || '');
      if (delim && !intraword && src[i + delim.length] && !/\s/.test(src[i + delim.length])) {
        let j = src.indexOf(delim, i + delim.length + 1);
        while (j > 0 && (/\s/.test(src[j - 1]) || (kind === 'i' && src[j + 1] === c) || (c === '_' && /\w/.test(src[j + delim.length] || '')))) j = src.indexOf(delim, j + 1);
        if (j > 0) { push({ t: kind, c: brassInline(src.slice(i + delim.length, j), depth + 1) }); i = j + delim.length; continue; }
      }
    }
    buf += c; i++;
  }
  flush();
  return out;
}

function matchBracket(src, i) {
  let d = 0;
  for (let k = i; k < src.length; k++) {
    if (src[k] === '\\') { k++; continue; }
    if (src[k] === '[') d++;
    else if (src[k] === ']') { d--; if (d === 0) return k; }
  }
  return -1;
}

const LIST_ITEM = /^( {0,3})([-*+]|\d{1,9}[.)])( +)(.*)$/;
function isBlockStart(line) {
  return /^ {0,3}(#{1,6})(\s|$)/.test(line) || /^ {0,3}(```|~~~)/.test(line) || /^ {0,3}>/.test(line)
    || LIST_ITEM.test(line) || /^ {0,3}([-*_])( *\1){2,} *$/.test(line);
}
function tableCells(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
}

/* Block Markdown into nodes: h, p, ul, ol, quote, code, hr, table. */
function brassBlocks(lines, depth = 0) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m;
    if ((m = /^ {0,3}(```|~~~)\s*([\w+#.-]*)\s*$/.exec(line))) {
      const fence = m[1], body = [];
      i++;
      while (i < lines.length && !new RegExp('^ {0,3}' + fence.replace(/[`~]/g, '\\$&') + '\\s*$').test(lines[i])) body.push(lines[i++]);
      i++;
      out.push({ t: 'code', lang: m[2] || '', v: body.join('\n') });
      continue;
    }
    if ((m = /^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line)) || (m = /^ {0,3}(#{1,6})$/.exec(line))) {
      out.push({ t: 'h', level: m[1].length, c: brassInline(m[2] || '', 0) });
      i++; continue;
    }
    if (/^ {0,3}([-*_])( *\1){2,} *$/.test(line)) { out.push({ t: 'hr' }); i++; continue; }
    if (/^ {0,3}>/.test(line)) {
      const body = [];
      while (i < lines.length && (/^ {0,3}>/.test(lines[i]) || (lines[i].trim() && !isBlockStart(lines[i]) && body.length && body[body.length - 1].trim()))) {
        body.push(lines[i].replace(/^ {0,3}> ?/, ''));
        i++;
      }
      out.push({ t: 'quote', c: depth < 8 ? brassBlocks(body, depth + 1) : [{ t: 'p', c: brassInline(body.join('\n')) }] });
      continue;
    }
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const head = tableCells(line);
      const align = tableCells(lines[i + 1]).map((c) => (/^:-+:$/.test(c) ? 'center' : /-+:$/.test(c) ? 'right' : /^:-+/.test(c) ? 'left' : ''));
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim() && lines[i].includes('|')) rows.push(tableCells(lines[i++]));
      out.push({ t: 'table', align: head.map((_, k) => align[k] || ''),
        head: head.map((c) => brassInline(c)), rows: rows.map((r) => head.map((_, k) => brassInline(r[k] || ''))) });
      continue;
    }
    if ((m = LIST_ITEM.exec(line))) {
      const ordered = /\d/.test(m[2]);
      const items = [];
      const start = ordered ? parseInt(m[2], 10) : 1;
      while (i < lines.length) {
        const it = LIST_ITEM.exec(lines[i]);
        if (!it || /\d/.test(it[2]) !== ordered) break;
        const indent = it[1].length + it[2].length + it[3].length;
        const body = [it[4]];
        i++;
        while (i < lines.length) {
          const next = lines[i];
          if (!next.trim()) {
            if (i + 1 < lines.length && /^\s+/.test(lines[i + 1]) && (lines[i + 1].length - lines[i + 1].trimStart().length) >= Math.min(indent, 2)) { body.push(''); i++; continue; }
            break;
          }
          const lead = next.length - next.trimStart().length;
          if (lead >= Math.min(indent, 2)) { body.push(next.slice(Math.min(lead, indent))); i++; continue; }
          if (LIST_ITEM.test(next) || isBlockStart(next)) break;
          body.push(next); i++;                                   // a lazy continuation line
        }
        items.push(depth < 8 ? brassBlocks(body, depth + 1) : [{ t: 'p', c: brassInline(body.join('\n')) }]);
        while (i < lines.length && !lines[i].trim() && i + 1 < lines.length && LIST_ITEM.test(lines[i + 1])) i++;
      }
      out.push(ordered ? { t: 'ol', start, items } : { t: 'ul', items });
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !(para.length && isBlockStart(lines[i]))) para.push(lines[i++].trim());
    out.push({ t: 'p', c: brassInline(para.join('\n')) });
  }
  return out;
}

export function parseBrass(body) {
  return brassBlocks(String(body || '').split('\n'));
}

/* The feed's HTML, built from the same nodes and escaping every word. */
const escHtml = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export function brassHtml(nodes, base = 'https://stimpunks.world/') {
  const inl = (ns) => ns.map((n) => {
    if (n.t === 'text') return escHtml(n.v);
    if (n.t === 'br') return '<br>';
    if (n.t === 'code') return `<code>${escHtml(n.v)}</code>`;
    if (n.t === 'a') {
      let href = n.href;
      try { href = new URL(href, base).href; } catch (e) { return inl(n.c); }
      return `<a href="${escHtml(href)}">${inl(n.c)}</a>`;
    }
    const tag = { b: 'strong', i: 'em', s: 'del' }[n.t];
    return tag ? `<${tag}>${inl(n.c)}</${tag}>` : '';
  }).join('');
  const blk = (bs) => bs.map((b) => {
    if (b.t === 'p') return `<p>${inl(b.c)}</p>`;
    if (b.t === 'h') { const l = Math.min(6, b.level + 1); return `<h${l}>${inl(b.c)}</h${l}>`; }
    if (b.t === 'hr') return '<hr>';
    if (b.t === 'code') return `<pre><code>${escHtml(b.v)}</code></pre>`;
    if (b.t === 'quote') return `<blockquote>${blk(b.c)}</blockquote>`;
    if (b.t === 'ul') return `<ul>${b.items.map((it) => `<li>${blk(it)}</li>`).join('')}</ul>`;
    if (b.t === 'ol') return `<ol${b.start !== 1 ? ` start="${Number(b.start)}"` : ''}>${b.items.map((it) => `<li>${blk(it)}</li>`).join('')}</ol>`;
    if (b.t === 'table') {
      const cell = (tag, c, k) => `<${tag}${b.align[k] ? ` style="text-align:${b.align[k]}"` : ''}>${inl(c)}</${tag}>`;
      return `<table><thead><tr>${b.head.map((c, k) => cell('th', c, k)).join('')}</tr></thead><tbody>${b.rows.map((r) => `<tr>${r.map((c, k) => cell('td', c, k)).join('')}</tr>`).join('')}</tbody></table>`;
    }
    return '';
  }).join('\n');
  return blk(nodes);
}

/* The posts, newest first. */
export async function readBrass(s = store()) {
  const d = await s.get(BRASS, { type: 'json' });
  return (d && Array.isArray(d.posts)) ? d.posts : [];
}

export function shapeBrass(p) {
  const out = { id: p.id, title: p.title, body: p.body, ast: parseBrass(p.body), handle: p.handle, t: p.t };
  if (typeof p.edited === 'number') out.edited = p.edited;
  if (p.img) { out.img = p.img; out.alt = p.alt || ''; }
  return out;
}

/* A moderator posting. { post } or { error }. */
export async function addBrass(who, fields, s = store(), now = Date.now()) {
  if (!who || who.role !== 'base') return { error: 'Only a moderator can post on the board.' };
  const ok = await brassFields(fields, s);
  if (ok.error) return ok;
  const post = { id: randomUUID(), title: ok.title, body: ok.body, handle: who.handle, t: now };
  if (ok.img) { post.img = ok.img; post.alt = ok.alt; }
  await updateList(BRASS, 'posts', (list) => [post, ...list], s);
  return { post };
}

/* The moderator who posted it, editing it. The picture can be kept, changed
   or taken off; one that is no longer on the post is deleted. */
export async function editBrass(who, id, fields, s = store(), now = Date.now()) {
  if (!who || who.role !== 'base') return { error: 'Only a moderator can edit a post.' };
  const ok = await brassFields(fields, s);
  if (ok.error) return ok;
  let why = null, dropped = null, done = null;
  await updateList(BRASS, 'posts', (list) => {
    why = null; dropped = null; done = null;
    const k = list.findIndex((p) => p.id === id);
    if (k < 0) { why = 'That post has been taken down.'; return null; }
    if (foldHandle(list[k].handle) !== foldHandle(who.handle)) { why = 'Only the moderator who posted it can edit it.'; return null; }
    const next = { ...list[k], title: ok.title, body: ok.body, edited: now };
    delete next.img; delete next.alt;
    if (ok.img) { next.img = ok.img; next.alt = ok.alt; }
    if (list[k].img && list[k].img !== next.img) dropped = list[k].img;
    done = next;
    const copy = list.slice(); copy[k] = next; return copy;
  }, s);
  if (why) return { error: why };
  if (dropped) await s.delete(BRASS_IMG + dropped);
  return { post: done };
}

/* Any moderator taking a post down, and its picture with it. */
export async function removeBrass(who, id, s = store()) {
  if (!who || who.role !== 'base') return { error: 'Only a moderator can take a post down.' };
  let gone = null;
  await updateList(BRASS, 'posts', (list) => {
    gone = list.find((p) => p.id === id) || null;
    return gone ? list.filter((p) => p.id !== id) : null;
  }, s);
  if (!gone) return { error: 'That post has already been taken down.' };
  if (gone.img) await s.delete(BRASS_IMG + gone.img);
  return { removed: true };
}

async function brassFields(f, s) {
  const title = cleanBrassTitle(f && f.title);
  if (!title) return { error: `A title is between one and ${BRASS_TITLE_MAX} characters.` };
  const body = cleanBrassBody(f && f.body);
  if (!body) return { error: `A post is between one and ${BRASS_BODY_MAX} characters.` };
  if (f.img == null || f.img === '') return { title, body };
  const img = imageId(f.img);
  if (!img || !(await getBrassImage(img, s))) return { error: 'That picture is not ready. Pick it again.' };
  const alt = cleanBrassAlt(f.alt);
  if (!alt) return { error: 'Say what is in the picture: a picture on the board needs a description.' };
  if (f.yes !== true) return { error: 'Say that everybody recognisable in the picture has said yes to it being on the board.' };
  return { title, body, img, alt };
}

export async function putBrassImage(who, bytes, s = store(), now = Date.now()) {
  if (!who || who.role !== 'base') return { error: 'Only a moderator can put a picture on the board.' };
  if (!bytes || !bytes.length) return { error: 'There was no picture in that.' };
  if (bytes.length > IMG_MAX) return { error: 'That picture is too big, even after the browser made it smaller.' };
  const kind = imageKind(bytes);
  if (!kind) return { error: 'That is not a picture the board can show.' };
  if (carriesMetadata(bytes, kind)) return { error: 'That picture still carries its camera data. Pick it again on the board, which takes that off.' };
  const id = randomUUID();
  await s.set(BRASS_IMG + id, bytes, { metadata: { t: now, type: kind } });
  return { id };
}

export async function getBrassImage(id, s = store()) {
  if (!imageId(id)) return null;
  const got = await s.getWithMetadata(BRASS_IMG + id, { type: 'arrayBuffer' });
  if (!got || !got.metadata) return null;
  return { data: got.data, meta: got.metadata };
}

/* Daily: every board picture no post holds, once a day has passed since it
   was put up. */
export async function sweepBrassImages(s = store(), now = Date.now()) {
  const held = new Set((await readBrass(s)).map((p) => p.img).filter(Boolean));
  for (const b of (await s.list({ prefix: BRASS_IMG })).blobs || []) {
    const id = b.key.slice(BRASS_IMG.length);
    if (held.has(id)) continue;
    const got = await s.getWithMetadata(b.key, { type: 'arrayBuffer' });
    const t = got && got.metadata && got.metadata.t;
    if (typeof t === 'number' && now - t < BRASS_IMG_UNSENT) continue;
    await s.delete(b.key);
  }
}

/* The board's own feed: every post, newest first, as RSS 2.0, with the post's
   own HTML in it, escaped, and its picture with its description. */
export function brassFeed(posts, base = 'https://stimpunks.world/') {
  const page = base + 'brass-tacks-board.html';
  const items = posts.slice(0, 50).map((p) => {
    let html = brassHtml(parseBrass(p.body), base);
    if (p.img) html = `<p><img src="${escHtml(base + 'cb/brass/image?id=' + p.img)}" alt="${escHtml(p.alt || '')}"></p>` + html;
    html += `<p>Posted by ${escHtml(p.handle)} on the Brass Tacks Board.</p>`;
    return `  <item>
    <title>${escHtml(p.title)}</title>
    <link>${escHtml(page + '#post-' + p.id)}</link>
    <guid isPermaLink="false">stimpunks-world-brass-${escHtml(p.id)}</guid>
    <pubDate>${new Date(p.t).toUTCString()}</pubDate>
    <dc:creator>${escHtml(p.handle)}</dc:creator>
    <description>${escHtml(html)}</description>
  </item>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>The Brass Tacks Board &#8212; Stimpunks.World</title>
  <link>${escHtml(page)}</link>
  <atom:link href="${escHtml(base + 'brass-tacks.xml')}" rel="self" type="application/rss+xml"/>
  <description>News, notices, events and celebrations, posted by our moderators.</description>
  <language>en</language>
${items}
</channel>
</rss>
`;
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

/* ── Reactions ────────────────────────────────────────────────────────────

   Ryan's brief, 2026-09-30: reactions on CB messages. A reaction is one of a
   fixed set, pressed on a message, and pressed again to take it back. It is
   part of its message: it goes when the message goes, at midnight at the
   latest, and taking a message off the air takes its reactions with it.

   NOBODY IS COUNTED. A reaction shows WHO reacted, by handle, in alphabetical
   order, and never how many: that is the street's no-headcount rule, the same
   one "Be seen here" keeps, and a number beside a heart is exactly the
   friendly edit it refuses. shape() sends the handles and no count; the radio
   draws the handles. The set is the quick row, each with a name for the
   button's label; Ryan added our community's usual ten the same evening.

   ANY OTHER EMOJI IS ALLOWED, AND ONLY AN EMOJI. A page cannot open the
   system's emoji picker, so the radio has a box the picker can type into, and
   what arrives here must be exactly one grapheme made of nothing but emoji
   parts (pictographs, skin tones, the joiner, variation selectors, tags,
   regional indicators, keycaps), with at least one pictograph, flag or keycap
   in it. So a word, two emoji or markup is refused, and 🏳️‍🌈 is not. A message
   holds at most REACT_KINDS different reactions. */
export const REACTIONS = [
  ['\u2764\uFE0F', 'heart'], ['\u{1F44D}', 'thumbs up'], ['\u{1F602}', 'laughing'], ['\u{1F389}', 'party'],
  ['\u{1F440}', 'eyes'], ['\u2728', 'sparkles'], ['\u{1F427}', 'a penguin, for a pebble'],
  ['\u{1F436}', 'dog'], ['\u{1F431}', 'cat'], ['\u{1F9A6}', 'otter'], ['\u{1F308}', 'rainbow'],
  ['\u{1F984}', 'unicorn'], ['\u{1F918}', 'sign of the horns'], ['\u{1F994}', 'hedgehog'],
  ['\u{1F917}', 'hugging face'], ['\u{1FAC2}', 'people hugging'], ['\u{1F622}', 'crying face'],
];
export const REACT_KINDS = 24;
const EMOJI_PARTS = /^[\p{Extended_Pictographic}\p{Emoji_Modifier}\p{Regional_Indicator}\u200D\uFE0F\u20E3#*0-9\u{E0020}-\u{E007F}]+$/u;
const EMOJI_CORE = /\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20E3/u;
const GRAPHEMES = new Intl.Segmenter('en', { granularity: 'grapheme' });
export function reactionOf(e) {
  if (typeof e !== 'string' || !e || e.length > 32) return null;
  if (REACTIONS.some((x) => x[0] === e)) return e;
  if (!EMOJI_PARTS.test(e) || !EMOJI_CORE.test(e)) return null;
  return [...GRAPHEMES.segment(e)].length === 1 ? e : null;
}

/* Press `emoji` on message `id` as `handle`: on if it was off, off if it was
   on. Answers the next list, or null when there is no such message. */
export function toggleReaction(list, id, emoji, handle) {
  const i = list.findIndex((m) => m.id === id);
  if (i < 0 || !reactionOf(emoji)) return null;
  const m = { ...list[i] };
  const rx = { ...(m.reactions || {}) };
  if (!rx[emoji] && Object.keys(rx).length >= REACT_KINDS) return null;
  const who = (rx[emoji] || []).slice();
  const at = who.findIndex((h) => foldHandle(h) === foldHandle(handle));
  if (at >= 0) who.splice(at, 1); else who.push(handle);
  if (who.length) rx[emoji] = who; else delete rx[emoji];
  if (Object.keys(rx).length) m.reactions = rx; else delete m.reactions;
  const next = list.slice();
  next[i] = m;
  return next;
}

/* The quick row's reactions first, in its order, then any others in the order
   they were first pressed. Another emoji has no name of ours: its label is
   the emoji, which screen readers speak. */
function shapeReactions(rx) {
  if (!rx || typeof rx !== 'object') return null;
  const out = [];
  const known = new Set(REACTIONS.map((x) => x[0]));
  const order = [...REACTIONS.map((x) => x[0]), ...Object.keys(rx).filter((e) => !known.has(e))];
  for (const e of order) {
    if (!reactionOf(e)) continue;
    const who = Array.isArray(rx[e]) ? [...new Set(rx[e])].sort((a, b) => a.localeCompare(b)) : [];
    const name = (REACTIONS.find((x) => x[0] === e) || [e, e])[1];
    if (who.length) out.push({ emoji: e, name, who });
  }
  return out.length ? out : null;
}

export function shape(messages) {
  return messages.map((m) => {
    const out = { id: m.id, handle: m.handle, text: m.text || '', t: m.t, base: !!m.base, claimed: !!m.claimed && !m.base };
    if (m.img) { out.img = m.img; out.alt = m.alt || ''; }
    const st = m.sticker && shapeSticker(m.sticker);
    if (st) out.sticker = st;
    const rx = shapeReactions(m.reactions);
    if (rx) out.reactions = rx;
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
