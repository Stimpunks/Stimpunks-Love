/* =============================================================================
   The CB — what every one of its functions shares.

   THE ONLY SERVER-SIDE CODE ON THIS SITE, and it is small on purpose. Everything
   else on stimpunks.world is a file Netlify serves as-is; this is the one place
   a request is answered by a program, and privacy.html says in plain words what
   it keeps. Every promise on that page is enforced here or in the functions
   beside it, so read that page before changing anything in this directory.

     · FIFTY MESSAGES AT MOST, EACH GONE 48 HOURS AFTER IT WAS SENT. Ryan,
       2026-10-18: "Since we have people in timezones all over the world" --
       until then it was ten messages and gone at midnight in Colorado, which
       was the middle of somebody's afternoon, and people asleep through a
       conversation never saw it. The whole channel is one JSON blob holding the
       latest fifty messages. A read leaves out every message past its 48 hours,
       and the hourly sweep takes them out of the blob, and deletes a blob with
       none left. Nothing is archived or backed up, and the only copy is one
       somebody makes of a few messages into a forum topic (below).
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
       is the channel's own blob shape, fifty messages, each gone after 48 hours. There
       is no list of everybody out there and no count of them, anywhere, and the
       places a visit has been are replaced rather than added to.
     · EVERY ROOM HAS A CHANNEL OF ITS OWN, BESIDE THE WORLD ONE. Ryan,
       2026-09-28: the radio tunes to World, the channel it always had, or to
       the room it is in, and a room's channel is the World channel's shape
       exactly, fifty messages, each gone 48 hours after it was sent, in a blob
       of its own. Tuned to a room, the radio has to say which room it wants,
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
       one, or clear its profile card, by name, and there is no list of
       everybody. A claimed username
       signs on with its own password and the community password stops
       working for it. See the accounts section below.
     · THE FORUMS KEEP TOPICS FOR MONTHS, FOR CLAIMED USERNAMES ONLY. Ryan's
       calls, 2026-10-18: topics in categories after our Discord's channels,
       each gone a week, three or six months after its last post or kept for
       good, as its category says; read and written only by a claimed
       username; a few categories kept to CB roles; messages copied in from
       the CB by the server, never typed in by anybody, and taken back out by
       whoever sent them; pictures, redrawn in the writer's browser, and
       files, each fetched with the pass by readers of its topic only and gone
       with its post; and @mentions, which tell only a device that asked.
       Nothing about who reads is kept. See the forums section below.
     · A PASS IS CHECKED AND NOT KEPT. It is an HMAC of the handle keyed by the
       current password, so changing the password in Netlify's environment and
       redeploying signs everybody off at once, and there is no list of passes
       anywhere to go stale or leak.
   ============================================================================= */
import { createHmac, createHash, createSign, createPrivateKey, timingSafeEqual, randomUUID, randomBytes, scryptSync,
  createECDH, ECDH, createCipheriv, createDecipheriv, hkdfSync, sign as cryptoSign } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { lookup as dnsLookup } from 'node:dns';
import { isIP } from 'node:net';

export const KEEP = 50;             // messages on a channel at once (Ryan, 2026-10-18; ten until then)
export const LIFE = 48 * 60 * 60 * 1000;   // how long a message stays on its channel (the same day)
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

/* Which day is it, in Colorado: the street's clock. The channel was cleared at
   this midnight until 2026-10-18 (LIFE_FROM, below), and a forum topic still
   says which day its copy of the channel was made. */
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

/* The channel as it stands: no message past its 48 hours, whether or not the
   sweep has reached it yet. */
export function readChannel(s = store(), now = Date.now()) { return readLog(KEY, s, now); }

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

/* A MESSAGE IS ON ITS CHANNEL FOR 48 HOURS FROM WHEN IT WAS SENT, worked out
   on every read and every write, so it is gone at 48 hours whether or not the
   hourly sweep has got to it: the chalkboard's rule, in hours rather than days.

   EVERYTHING SENT BEFORE LIFE_FROM KEEPS THE PROMISE IT WAS SENT UNDER: gone
   at midnight in Colorado. LIFE_FROM is that midnight, the first after Ryan's
   call, so nothing anybody said before the change is kept a minute longer for
   it. Every message this applies to is gone by then, so the test can come out
   any time after 2026-10-19 without changing what anybody sees. */
const LIFE_FROM = Date.UTC(2026, 9, 19, 6, 0);   // 2026-10-19 00:00 in Colorado
export function onAir(m, now = Date.now()) {
  if (!m || typeof m.t !== 'number') return false;
  if (m.t < LIFE_FROM) return today(new Date(m.t)) === today(new Date(now));
  return now - m.t < LIFE;
}
function stored(data) { return data && Array.isArray(data.messages) ? data.messages : []; }

/* The latest messages in one blob, fifty at most: the channel, each room's,
   and each place on the Slake. Written once so a place cannot drift from the
   channel's rules about how long a message stays or how a write that loses a
   race tries again. */
async function readLog(key, s, now = Date.now()) {
  const data = await s.get(key, { type: 'json' });
  return { messages: stored(data).filter((m) => onAir(m, now)) };
}

async function updateLog(key, change, s) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    const now = Date.now();
    const live = cur.exists ? stored(cur.data).filter((m) => onAir(m, now)) : [];
    const next = change(live.slice());
    if (next === null) return live;
    const body = { messages: next.slice(-KEEP) };
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, body, opts);
    if (res.modified) return body.messages;
    // Somebody else got there first. Wait a moment, a different moment for
    // each of us, and read again.
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* Hourly: take every message past its 48 hours out of one log, with the same
   conditional write a message goes out with, and delete the log once nothing
   in it is left. */
async function sweepLog(key, s, now = Date.now()) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    if (!cur.exists) return false;
    const all = stored(cur.data);
    const live = all.filter((m) => onAir(m, now));
    if (!live.length) { await s.delete(key); return true; }
    if (live.length === all.length) return false;
    const res = await s.setJSON(key, { messages: live }, { onlyIfMatch: cur.etag });
    if (res.modified) return true;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

export function sweep(s = store(), now = Date.now()) { return sweepLog(KEY, s, now); }

/* ── The chalkboard ──────────────────────────────────────────────────── */

/* A note is on the board for seven days from the moment it was chalked. The
   check is made on every read, so a note is gone at seven days whether or not
   the hourly sweep has reached it -- the channel's own rule, with a week
   in it instead of 48 hours. */
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
   sent, and it is part of its message: it goes when the message goes, 48
   hours after it was sent at the latest. It is only ever one of the sender's own pets, found
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

/* ── Avatars ──────────────────────────────────────────────────────────────

   Every key an avatar may be made of: the Bodymind Booth's choices and the
   Dress-Up Den's rails, prints and colourways. GENERATED by
   tools/make-bodymind.py out of data/bodymind.json and data/dressup.json;
   never hand-edit between the markers. */
/* avatar:keys:begin */
export const AVATAR = {"garments":{"head":["slouchy-beanie","beanie","wide-brim","headscarf","wig"],"outer":["haori","cardigan","hoodie","cape","sequin-jacket"],"top":["button-down","tee","corset","flowing-dress","gown"],"bottom":["fisherman","skirt","wide-leg","leggings"],"feet":["platforms","slip-ons","crocs","hi-tops","socks"],"boa":["boa"],"scarf":["scarf"],"wings":["dragonfly-wings","butterfly-wings","moth-wings","great-wings"],"ears":["cat-ears","fox-ears","bunny-ears","bear-ears","mouse-ears"],"tail":["cat-tail","fox-tail","bunny-tail","bear-tail","dragon-tail","unicorn-tail"],"paws":["cat-paws","bear-paws","dragon-claws"],"neck":["bead-necklace","chunky-beads","pendant","choker"],"wrists":["rings","bead-bracelets","bangles"],"suit":["onesie","tiger-suit","bear-suit","dragon-suit","unicorn-suit"]},"bodyOnly":["wings","ears","tail","paws","neck","wrists","suit"],"prints":["solid","floral","blocks","patchwork","stripes","dots","gingham","moons","sequins"],"colourways":["rainbow","marigold-teal","pink-lime","tomato-turquoise","indigo-cream","violet-gold","mint-coral","moss-rust","denim-sky","midnight-gold","plum-black","black-silver","black"],"body":{"pose":["standing","wheelchair","powerchair"],"height":["shorter","middling","taller"],"shoulders":["narrow","middling","broad"],"middle":["flat","soft","round","big"],"hips":["narrow","middling","wide"],"skin":["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10","lavender","sage","sky","stone"],"marks":["freckles","vitiligo","birthmark","scar"],"face":["oval","round","square","long"],"eyes":["open","soft","aside","closed","wide"],"brows":["soft","straight","arched","bushy"],"nose":["small","round","long","broad"],"mouth":["rest","smile","grin","open"],"beard":["none","stubble","moustache","beard","long"],"hair":["bald","shaved","short","curly","afro","locs","braids","long","wavy","bob","bun","ponytail","mohawk","undercut"],"hairColour":["black","darkbrown","brown","auburn","red","ginger","blonde","grey","white","pink","blue","green","purple","teal","rainbow"],"eyewear":["none","glasses","dark"],"ears":["none","aids","cochlear","defenders","headphones"],"faceAid":["none","mask","cannula"],"hands":["none","cane","white","crutches","walker","aac","fidget"],"neck":["none","chew"],"limbs":["as-drawn","leg","arm-short","arm"],"layer":["coal","black","denim","cream","moss","plum","rust","sky"]},"multi":["marks"],"standingOnly":{"hands":["cane","white","crutches","walker"]}};
/* avatar:keys:end */

/* AN AVATAR IS A LIST OF CHOICES, AND THE SERVER KEEPS NOTHING ELSE. Ryan's
   brief, 2026-10-14: a bodymind made at the Bodymind Booth, dressed at the
   Dopamine Dress-Up Den or left as the Den's stand with clothes on it, kept in
   your Profile, one worn on the CB at a time, shown beside your name on Who's
   online, and sent as a sticker. What is kept is the look -- every value a key
   out of AVATAR above, checked here by cleanLook(), which avatar.js's clean()
   matches and tools/avatar.test.mjs checks against it -- with a name and what
   its owner wrote about it. Never a picture: there is nothing to upload and
   nothing an image could carry.

   THEY ARE THE SECOND THING THE STREET KEEPS UNDER A PERSON, after pets, and
   it is Ryan's call, made knowing that. They are filed under the same
   scrambled form of the folded handle (`petKey`), so a handle is not an
   account here either: anybody who signs on with an unclaimed handle sees its
   avatars, and Profile says so. FORGET ME and deleting the username delete
   them.

   WEARING ONE ON THE CB NEEDS A CLAIMED USERNAME, because an unclaimed handle
   is anybody's who signs on with it and could be dressed by any of them. What
   is worn is copied into one blob, `avatars-worn`, keyed by pet key and holding
   only the look and what its owner wrote, so Who's online reads one blob rather
   than one per person; it is shown only beside a claimed name, and the mark
   comes from the pass. Taking it off, deleting it, Forget Me and deleting the
   username take it out of that blob first, before anything else goes. */
export const AVATAR_KEEP = 24;            // avatars one person keeps at once
export const AVATAR_NAME_MAX = 24;
export const AVATAR_ABOUT_MAX = 280;
export const AVATAR_ID = /^v[A-Za-z0-9_-]{10}$/;
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

export function cleanLook(look) {
  if (!look || typeof look !== 'object' || Array.isArray(look)) return null;
  if (look.base !== 'stand' && look.base !== 'bodymind') return null;
  const out = { base: look.base };
  if (look.base === 'bodymind') {
    const b = look.body;
    if (!b || typeof b !== 'object' || Array.isArray(b)) return null;
    out.body = {};
    for (const [key, keys] of Object.entries(AVATAR.body)) {
      const v = b[key];
      if (AVATAR.multi.includes(key)) {
        if (!Array.isArray(v) || v.some((x) => !keys.includes(x))) return null;
        out.body[key] = keys.filter((k) => v.includes(k));
      } else {
        if (!keys.includes(v)) return null;
        out.body[key] = v;
      }
    }
    if (out.body.pose !== 'standing') {
      for (const [k, vals] of Object.entries(AVATAR.standingOnly)) if (vals.includes(out.body[k])) return null;
    }
  }
  const wear = look.wear == null ? {} : look.wear;
  if (typeof wear !== 'object' || Array.isArray(wear)) return null;
  out.wear = {};
  for (const slot of Object.keys(wear)) {
    const piece = wear[slot];
    if (piece == null) continue;
    if (!own(AVATAR.garments, slot) || !Array.isArray(piece) || piece.length !== 3) return null;
    if (!AVATAR.garments[slot].includes(piece[0]) || !AVATAR.prints.includes(piece[1]) || !AVATAR.colourways.includes(piece[2])) return null;
    out.wear[slot] = [piece[0], piece[1], piece[2]];
  }
  // Fantasy Fancy Dress's pieces need somebody to wear them: never on the stand.
  if (out.base === 'stand' && Object.keys(out.wear).some((k) => (AVATAR.bodyOnly || []).includes(k))) return null;
  return out;
}

function cleanUpTo(s, max) {
  const t = tidy(s);
  if (!t) return '';
  return [...t].length <= max ? t : null;
}
export const cleanAvatarName = (s) => cleanUpTo(s, AVATAR_NAME_MAX);
export const cleanAvatarAbout = (s) => cleanUpTo(s, AVATAR_ABOUT_MAX);

const avatarsBlob = (k) => `avatars/${k}`;
const WORN = 'avatars-worn';

export async function readAvatars(pk, s = store()) {
  const d = await s.get(avatarsBlob(pk), { type: 'json' });
  const avatars = (d && Array.isArray(d.avatars)) ? d.avatars : [];
  const wearing = d && typeof d.wearing === 'string' && avatars.some((a) => a.id === d.wearing) ? d.wearing : null;
  return { avatars, wearing };
}

/* One person's avatars, changed without losing a change made at the same
   moment from another tab. `change` gets { avatars, wearing } and returns the
   next state, null for no change, or { error }. */
async function updateAvatars(pk, change, s) {
  const key = avatarsBlob(pk);
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    const d = (cur.exists && cur.data) || {};
    const was = { avatars: (Array.isArray(d.avatars) ? d.avatars : []).slice(), wearing: typeof d.wearing === 'string' ? d.wearing : null };
    const next = change(was);
    if (next === null) return was;
    if (next.error) return next;
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, { avatars: next.avatars, wearing: next.wearing }, opts);
    if (res.modified) return next;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

async function updateWorn(change, s) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, WORN);
    const worn = { ...((cur.exists && cur.data && cur.data.worn) || {}) };
    if (change(worn) === false) return worn;
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(WORN, { worn }, opts);
    if (res.modified) return worn;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* What is worn, copied to where Who's online can read it, or taken out. */
async function showWorn(pk, avatar, s) {
  return updateWorn((worn) => {
    if (!avatar) { if (!own(worn, pk)) return false; delete worn[pk]; return true; }
    const was = own(worn, pk) ? JSON.stringify(worn[pk]) : '';
    worn[pk] = { look: avatar.look, about: avatar.about || '' };
    return JSON.stringify(worn[pk]) !== was;
  }, s);
}

export function shapeAvatar(a) {
  return { id: a.id, name: a.name || '', about: a.about || '', look: a.look, t: a.t };
}

/* Keep a new avatar. { kept } or { error }. */
export async function keepAvatar(pk, { look, name = '', about = '' }, s = store(), now = Date.now()) {
  const lk = cleanLook(look);
  if (!lk) return { error: 'look' };
  const rec = { id: 'v' + randomBytes(8).toString('base64url').slice(0, 10), name, about, look: lk, t: now };
  const next = await updateAvatars(pk, (was) => {
    if (was.avatars.length >= AVATAR_KEEP) return { error: 'full' };
    return { avatars: [...was.avatars, rec], wearing: was.wearing };
  }, s);
  if (next.error) return next;
  return { kept: rec, avatars: next.avatars, wearing: next.wearing };
}

/* Change one: its look, its name or what is written about it. */
export async function editAvatar(pk, id, patch, s = store(), now = Date.now()) {
  if (typeof id !== 'string' || !AVATAR_ID.test(id)) return { error: 'which' };
  const lk = patch.look !== undefined ? cleanLook(patch.look) : undefined;
  if (lk === null) return { error: 'look' };
  const next = await updateAvatars(pk, (was) => {
    const i = was.avatars.findIndex((a) => a.id === id);
    if (i < 0) return { error: 'which' };
    const a = { ...was.avatars[i] };
    if (lk) a.look = lk;
    if (patch.name !== undefined) a.name = patch.name;
    if (patch.about !== undefined) a.about = patch.about;
    a.t = now;
    const avatars = was.avatars.slice();
    avatars[i] = a;
    return { avatars, wearing: was.wearing };
  }, s);
  if (next.error) return next;
  if (next.wearing === id) await showWorn(pk, next.avatars.find((a) => a.id === id), s);
  return next;
}

/* Delete one. If it was worn, it comes off the CB first. */
export async function removeAvatar(pk, id, s = store()) {
  if (typeof id !== 'string' || !AVATAR_ID.test(id)) return { error: 'which' };
  const cur = await readAvatars(pk, s);
  if (cur.wearing === id) await showWorn(pk, null, s);
  return updateAvatars(pk, (was) => {
    if (!was.avatars.some((a) => a.id === id)) return null;
    return { avatars: was.avatars.filter((a) => a.id !== id), wearing: was.wearing === id ? null : was.wearing };
  }, s);
}

/* Wear one on the CB, or none. The caller has already checked the username
   is claimed; this does not know who is asking. */
export async function wearAvatar(pk, id, s = store()) {
  if (id !== null && (typeof id !== 'string' || !AVATAR_ID.test(id))) return { error: 'which' };
  if (id === null) await showWorn(pk, null, s);
  const next = await updateAvatars(pk, (was) => {
    if (id !== null && !was.avatars.some((a) => a.id === id)) return { error: 'which' };
    if (was.wearing === id) return null;
    return { avatars: was.avatars, wearing: id };
  }, s);
  if (next.error) return next;
  if (id !== null) await showWorn(pk, next.avatars.find((a) => a.id === id), s);
  return next;
}

/* FORGET ME, and deleting the username: off the CB first, then the record,
   then the switch that showed the rest. */
export async function forgetAvatars(pk, s = store()) {
  await showWorn(pk, null, s);
  await s.delete(avatarsBlob(pk));
  await s.delete(avShownBlob(pk));
  return true;
}

/* SOMEBODY'S AVATARS, IN THEIR PROFILE. Ryan, 2026-10-14: pressing a name on
   Who's online, or a handle on the channel, opens that person's profile, and
   it shows the avatar they wear, large and first. The one worn is already
   public to anybody signed on, beside their name; the others are shown only
   when the person switches on Show my avatars on the CB, and only on a claimed
   username, the pets' rule and for the pets' reason: an unclaimed handle is
   anybody's who signs on with it. The switch is one blob, avshown/<pet key>,
   holding when it was switched on, deleted by switching it off, by Forget Me
   and by deleting the username. The answer for a handle that is not claimed is
   the same whether it is unclaimed or nobody at all. A name and what was
   written about an avatar are shown with the rest only when the rest are; the
   worn one carries what was written about it, as it does on Who's online. */
const avShownBlob = (k) => `avshown/${k}`;

export async function setAvatarsShown(handle, on, s = store(), now = Date.now()) {
  const k = avShownBlob(petKey(handle));
  if (!on) { await s.delete(k); return false; }
  const cur = await versioned(s, k);
  if (!cur.exists) await s.setJSON(k, { since: now }, { onlyIfNew: true });
  return true;
}

export async function avatarsShown(handle, s = store()) {
  if (!(await readAccount(handle, s))) return false;
  const d = await s.get(avShownBlob(petKey(handle)), { type: 'json' });
  return !!(d && typeof d.since === 'number');
}

/* { handle, wearing, shown, avatars? } for a claimed username, or null. */
export async function shownAvatars(handle, s = store()) {
  const acct = await readAccount(handle, s);
  if (!acct) return null;
  const pk = petKey(handle);
  const { avatars, wearing } = await readAvatars(pk, s);
  const w = wearing ? avatars.find((a) => a.id === wearing) : null;
  const look = w && cleanLook(w.look);
  const shown = await avatarsShown(handle, s);
  const out = { handle: acct.handle, wearing: look ? { look, about: w.about || '' } : null, shown };
  if (shown) {
    // Worn first, then the rest, newest first: no ids, no dates.
    out.avatars = avatars.slice().reverse()
      .sort((a, b) => Number(b.id === wearing) - Number(a.id === wearing))
      .map((a) => ({ look: cleanLook(a.look), name: a.name || '', about: a.about || '', worn: a.id === wearing }))
      .filter((a) => a.look);
  }
  return out;
}

/* Who's online, with the avatar each claimed person wears. Nothing is added
   beside an unclaimed name, whatever the blob holds. */
export async function withAvatars(people, s = store()) {
  if (!people.some((p) => p.claimed)) return people;
  const d = await s.get(WORN, { type: 'json' });
  const worn = (d && d.worn) || {};
  return people.map((p) => {
    if (!p.claimed) return p;
    const k = petKey(p.handle);
    const w = own(worn, k) ? worn[k] : null;
    const look = w && cleanLook(w.look);
    return look ? { ...p, avatar: { look, about: typeof w.about === 'string' ? w.about : '' } } : p;
  });
}

/* A sticker of one of your own avatars, found here by its id and never
   described by the request: its look, its name and what you wrote about it,
   and nothing that points back at the record. */
export async function avatarSticker(handle, id, s = store()) {
  if (typeof id !== 'string' || !AVATAR_ID.test(id)) return null;
  const a = (await readAvatars(petKey(handle), s)).avatars.find((x) => x.id === id);
  if (!a) return null;
  return { look: a.look, name: a.name || '', about: a.about || '' };
}

export function shapeAvatarSticker(st) {
  const look = st && cleanLook(st.look);
  if (!look) return null;
  const name = cleanAvatarName(st.name), about = cleanAvatarAbout(st.about);
  return { look, name: name || '', about: about || '' };
}

/* ── Your chimeras ──────────────────────────────────────────────────────────

   Ryan's brief, 2026-10-18: a chimera made in Chimera Obscura, one creature out
   of two animals, kept in your Profile, named, and sent as a sticker. What is
   kept is its parts -- which animal gave the body, head, ears, mouth, tail,
   back, colours and markings, every value a key out of CHIMERA below, checked
   here by cleanChimera(), which chimera.js's clean() matches and
   tools/chimera.test.mjs checks against it -- and the name its maker gave it.
   Never a picture, and nothing about when.

   THEY ARE THE SIXTH THING THE STREET KEEPS UNDER A PERSON, after pets,
   avatars, jobs, patches and profile cards, and only when somebody presses
   Keep it in my Profile. They are filed under the same scrambled form of the
   folded handle (`petKey`), so a handle is not an account here either: anybody
   who signs on with an unclaimed handle sees its chimeras, and Profile says
   so. FORGET ME and deleting the username delete them.

   SHOWING THEM NEEDS A CLAIMED USERNAME, the pets' rule and for the pets'
   reason. The switch is one blob, chshown/<pet key>, holding when it was
   switched on, deleted by switching it off, by Forget Me and by deleting the
   username. The answer for a handle that is not claimed is the same whether it
   is unclaimed or nobody at all, and shown chimeras carry no ids. */
/* chimera:keys:begin */
export const CHIMERA = {"slots":["body","head","ears","mouth","arms","feet","tail","back","colours","markings"],"defaults":{"arms":"body","feet":"body"},"animals":["armadillo","badger","bear","cat","dog","elephant","fox","mouse","opossum","otter","owl","panda","penguin","pig","porcupine","possum","rabbit","raccoon","turtle","zebra"],"backs":["armadillo","porcupine","turtle","zebra"]};
/* chimera:keys:end */
export const CHIMERA_KEEP = 24;           // chimeras one person keeps at once
export const CHIMERA_NAME_MAX = 24;
export const CHIMERA_SAYINGS = 5;         // sayings one chimera keeps
export const CHIMERA_SAYING_MAX = 80;     // characters in one saying
export const CHIMERA_ID = /^h[A-Za-z0-9_-]{10}$/;

/* Exactly a chimera's parts, each its own property and an animal on the
   shelf, and nothing else. */
export function cleanChimera(c) {
  if (!c || typeof c !== 'object' || Array.isArray(c)) return null;
  if (Object.keys(c).some((k) => !CHIMERA.slots.includes(k))) return null;
  const out = {};
  for (const k of CHIMERA.slots) {
    // A part with a default (arms, feet) may be missing, from a chimera kept
    // before it was a part of its own, and takes its default's animal.
    const from = own(c, k) ? k : own(CHIMERA.defaults, k) ? CHIMERA.defaults[k] : null;
    if (!from || !own(c, from)) return null;
    const v = c[from];
    if (typeof v !== 'string') return null;
    if (k === 'back') { if (v !== 'none' && !CHIMERA.backs.includes(v)) return null; }
    else if (!CHIMERA.animals.includes(v)) return null;
    out[k] = v;
  }
  return out;
}
export const cleanChimeraName = (s) => cleanUpTo(s, CHIMERA_NAME_MAX);

/* A chimera's sayings (Ryan, 2026-10-19): what it says when you press it as a
   familiar, and in a speech bubble when it may move by itself, and under it in
   a profile. Its maker's words, a line each, CHIMERA_SAYINGS at most and each
   CHIMERA_SAYING_MAX characters at most; blank lines are dropped. An array, or
   null for anything else or anything too long. */
export function cleanChimeraSayings(list) {
  if (list == null) return [];
  if (!Array.isArray(list) || list.length > CHIMERA_SAYINGS * 2) return null;
  const out = [];
  for (const x of list) {
    if (typeof x !== 'string') return null;
    const t = cleanUpTo(x, CHIMERA_SAYING_MAX);
    if (t === null) return null;
    if (t && !out.includes(t)) out.push(t);
  }
  return out.length > CHIMERA_SAYINGS ? null : out;
}

const chimerasBlob = (k) => `chimeras/${k}`;
const chShownBlob = (k) => `chshown/${k}`;

export async function readChimeras(pk, s = store()) {
  const d = await s.get(chimerasBlob(pk), { type: 'json' });
  return { chimeras: (d && Array.isArray(d.chimeras)) ? d.chimeras : [] };
}

/* One person's chimeras, changed without losing a change made at the same
   moment from another tab, the avatars' arrangement. */
async function updateChimeras(pk, change, s) {
  const key = chimerasBlob(pk);
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    const d = (cur.exists && cur.data) || {};
    const was = { chimeras: (Array.isArray(d.chimeras) ? d.chimeras : []).slice() };
    const next = change(was);
    if (next === null) return was;
    if (next.error) return next;
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, { chimeras: next.chimeras }, opts);
    if (res.modified) return next;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

export function shapeChimera(c) {
  return { id: c.id, name: c.name || '', parts: cleanChimera(c.parts) || c.parts, sayings: sayingsOf(c) };
}
function sayingsOf(c) { return (c && Array.isArray(c.sayings) ? c.sayings : []).filter((x) => typeof x === 'string'); }

/* Keep a new chimera. { kept } or { error }. Sayings are kept only when it
   has some, so a chimera with none is exactly its id, name and parts. */
export async function keepChimera(pk, { parts, name = '', sayings = [] }, s = store()) {
  const p = cleanChimera(parts);
  if (!p) return { error: 'parts' };
  const said = cleanChimeraSayings(sayings);
  if (said === null) return { error: 'sayings' };
  const rec = { id: 'h' + randomBytes(8).toString('base64url').slice(0, 10), name, parts: p };
  if (said.length) rec.sayings = said;
  const next = await updateChimeras(pk, (was) => {
    if (was.chimeras.length >= CHIMERA_KEEP) return { error: 'full' };
    return { chimeras: [...was.chimeras, rec] };
  }, s);
  if (next.error) return next;
  return { kept: rec, chimeras: next.chimeras };
}

/* Change one: its parts, its name or its sayings. */
export async function editChimera(pk, id, patch, s = store()) {
  if (typeof id !== 'string' || !CHIMERA_ID.test(id)) return { error: 'which' };
  const p = patch.parts !== undefined ? cleanChimera(patch.parts) : undefined;
  if (p === null) return { error: 'parts' };
  const said = patch.sayings !== undefined ? cleanChimeraSayings(patch.sayings) : undefined;
  if (said === null) return { error: 'sayings' };
  return updateChimeras(pk, (was) => {
    const i = was.chimeras.findIndex((c) => c.id === id);
    if (i < 0) return { error: 'which' };
    const c = { ...was.chimeras[i] };
    if (p) c.parts = p;
    if (patch.name !== undefined) c.name = patch.name;
    if (said !== undefined) { if (said.length) c.sayings = said; else delete c.sayings; }
    const chimeras = was.chimeras.slice();
    chimeras[i] = c;
    return { chimeras };
  }, s);
}

export async function removeChimera(pk, id, s = store()) {
  if (typeof id !== 'string' || !CHIMERA_ID.test(id)) return { error: 'which' };
  return updateChimeras(pk, (was) => {
    if (!was.chimeras.some((c) => c.id === id)) return { error: 'which' };
    return { chimeras: was.chimeras.filter((c) => c.id !== id) };
  }, s);
}

/* FORGET ME, and deleting the username: the familiar out in rooms first,
   then the record, then the switch. */
export async function forgetChimeras(pk, s = store()) {
  await showFamiliar(pk, null, s);
  await s.delete(chimerasBlob(pk));
  await s.delete(chShownBlob(pk));
  return true;
}

export async function setChimerasShown(handle, on, s = store(), now = Date.now()) {
  const k = chShownBlob(petKey(handle));
  if (!on) { await s.delete(k); return false; }
  const cur = await versioned(s, k);
  if (!cur.exists) await s.setJSON(k, { since: now }, { onlyIfNew: true });
  return true;
}

export async function chimerasShown(handle, s = store()) {
  if (!(await readAccount(handle, s))) return false;
  const d = await s.get(chShownBlob(petKey(handle)), { type: 'json' });
  return !!(d && typeof d.since === 'number');
}

/* { handle, shown, chimeras? } for a claimed username, or null. Newest
   first, with no ids. */
export async function shownChimeras(handle, s = store()) {
  const acct = await readAccount(handle, s);
  if (!acct) return null;
  const shown = await chimerasShown(handle, s);
  const out = { handle: acct.handle, shown };
  if (shown) {
    out.chimeras = (await readChimeras(petKey(handle), s)).chimeras.slice().reverse()
      .map((c) => ({ parts: cleanChimera(c.parts), name: c.name || '', sayings: sayingsOf(c) }))
      .filter((c) => c.parts);
  }
  return out;
}

/* A sticker of one of your own chimeras, found here by its id and never
   described by the request: its parts and its name, and nothing that points
   back at the record. */
export async function chimeraSticker(handle, id, s = store()) {
  if (typeof id !== 'string' || !CHIMERA_ID.test(id)) return null;
  const c = (await readChimeras(petKey(handle), s)).chimeras.find((x) => x.id === id);
  if (!c) return null;
  return { parts: c.parts, name: c.name || '' };
}

export function shapeChimeraSticker(st) {
  const parts = st && cleanChimera(st.parts);
  if (!parts) return null;
  const name = cleanChimeraName(st.name);
  return { parts, name: name || '' };
}

/* ── Familiars, seen in the room you are in ─────────────────────────────

   Ryan, 2026-10-19: let other people see what chimeras are in the room. A
   familiar is a chimera somebody took with them (familiar.js keeps it in their
   own browser and sends nothing). This is the one copy of it the street keeps,
   and only once its person, signed on with a CLAIMED username, presses Bring
   my familiar on the radio: its parts, its name and its sayings, filed under
   the pet key in one blob (`familiars-out`), the worn avatar's arrangement, so
   the people seen in a room are read with one blob rather than one each.

   IT IS SEEN ONLY WHERE ITS PERSON IS SEEN, AND ONLY BY PEOPLE SEEN THERE:
   /cb/here adds it to the people seen in the asker's room (withFamiliars), and
   /cb/here answers only somebody who pressed Be seen here in that room, the one
   switch both ways. It is never on Who's online, nothing about when is kept,
   and nobody is told who looked. Sending it home, Forget me, deleting the
   username and switching Bring my familiar off take it out of the blob. */
const FAMILIARS = 'familiars-out';

export function cleanFamiliar(f) {
  if (!f || typeof f !== 'object' || Array.isArray(f)) return null;
  const parts = cleanChimera(f.parts);
  const name = cleanChimeraName(f.name);
  const sayings = cleanChimeraSayings(f.sayings);
  if (!parts || name === null || sayings === null) return null;
  return { parts, name: name || '', sayings };
}

async function updateFamiliars(change, s) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, FAMILIARS);
    const out = { ...((cur.exists && cur.data && cur.data.out) || {}) };
    if (change(out) === false) return out;
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(FAMILIARS, { out }, opts);
    if (res.modified) return out;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* Bring a familiar out, change it, or take it in (fam null). */
export async function showFamiliar(pk, fam, s = store()) {
  return updateFamiliars((out) => {
    if (!fam) { if (!own(out, pk)) return false; delete out[pk]; return true; }
    const was = own(out, pk) ? JSON.stringify(out[pk]) : '';
    out[pk] = fam;
    return JSON.stringify(out[pk]) !== was;
  }, s);
}

export async function familiarOut(handle, s = store()) {
  const d = await s.get(FAMILIARS, { type: 'json' });
  const pk = petKey(handle);
  return !!(d && d.out && own(d.out, pk));
}

/* The people seen in a room, with the familiar each claimed one brought.
   Nothing is added beside an unclaimed name, whatever the blob holds. */
export async function withFamiliars(people, s = store()) {
  if (!people.some((p) => p.claimed)) return people;
  const d = await s.get(FAMILIARS, { type: 'json' });
  const out = (d && d.out) || {};
  return people.map((p) => {
    if (!p.claimed) return p;
    const k = petKey(p.handle);
    const f = own(out, k) ? cleanFamiliar(out[k]) : null;
    return f ? { ...p, familiar: f } : p;
  });
}

/* ── Your jobs at the Adventurer's Guild ───────────────────────────────────

   Ryan's brief, 2026-10-14: completed jobs in a person's Profile, with a
   switch to show them on the CB, like pets and avatars.

   THEY ARE THE THIRD THING THE STREET KEEPS UNDER A PERSON, after pets and
   avatars, and only once somebody presses Keep my jobs in my Profile on the
   Guild's board. Until then the board keeps its stamps in the browser and
   sends nothing. The record is filed under the same scrambled form of the
   folded handle (`petKey`), so a handle is not an account here either.

   IT HOLDS WHICH JOBS, SORTED, AND NOTHING ABOUT WHEN. A list of times would
   be a record of how somebody spends their days, and the order they were
   handed in would be most of one. Every id is checked against QUEST_IDS,
   which tools/make-guild.py writes out of data/quests.json, so the record can
   only ever hold a job that is on the board. A badge is never kept: it is
   worked out from the jobs wherever it is shown.

   The record existing is what "keeping" means: switching it off, Forget me and
   deleting the username delete it, and the switch that shows it with it.
   SHOWING THEM needs a claimed username, the pets' rule and for their reason. */
/* quest:ids:begin */
export const QUEST_IDS = ["street-chalk", "map-pin", "pony-sequin", "chappell-rhinestone", "club-pin", "zine-staple", "zine2-clip", "quantum-fringe", "enid-sticker", "polaroids-pin", "play-block", "arcade-token", "quill-feather", "otter-clam", "pebbling-stone", "burrow-door", "jungle-leaf", "den-spindle", "mopery-card", "oracle-lozenge", "doom-foxing", "feed-splitflap", "your-room-keys", "board-clip", "camp-peg", "yurt-tallow", "reading-bookmark", "music-moth", "meadow-firefly", "hermitage-sunflower", "bns-spoon", "bgh-acorn", "mtn-carabiner", "ncx-stile", "anm-feather", "bds-chiltepin", "ghc-leaf", "atn-egg", "dry-churn", "hbx-coin", "wsc-seed", "liner-colophon", "garden-label", "zibaldone-nib", "hole-cuts", "checkpoint-pillow", "foundry-sort", "danny-drain", "outskirts-reflector", "lagoon-speaker", "sithen-thorn", "covenstead-kettle", "dead-tired-doorstop", "laughingstock-setlist", "picture-house-earmuffs", "samefood-divider", "collection-tag", "vital-sprig", "looming-flood", "dance-punks-glowstick", "small-hours-crayon", "repeater-qsl", "nothing-for-sale-torch", "caverns-rail", "glow-star", "rave-earplug", "cool-cap", "bigsteep-carboy", "mycelium-block", "frosty-thermometer", "breezy-ribbon", "community-letter", "world-dewdrop", "th-gavel", "fb-flake", "dr-key", "bd-lamp", "md-fuse", "es-note", "dressup-feather", "chm-lenscap", "booth-strip", "fancy-wing", "now-playing-brush", "mural-lid", "lib-slip", "lsp-string", "ook-peel", "cavendish-marker", "live-room-tape", "broadside-sheet", "doom-scoop-scoop", "mud-welly", "pando-leaf", "fridge-magnet", "stair-lift", "cats-torch", "dogs-lead", "smalls-hay", "onb-washi", "ll-dibber", "hgc-ladle", "pkp-mouse", "aqp-mat", "brass-tack", "wr-mantle", "op-tag", "ed-loupe", "wh-feather", "cf-marshmallow", "cv-icicle", "nh-honey", "wbb-carrot", "sb-fork", "run-ball", "tks-boat", "grn-leaf", "pil-tape"];
/* quest:ids:end */
const jobsBlob = (k) => `jobs/${k}`;
const jobsShownBlob = (k) => `jobshown/${k}`;

/* A list of job ids, each one on the board, or null if anything in it is not. */
export function questIds(list) {
  if (!Array.isArray(list) || list.length > QUEST_IDS.length) return null;
  const out = [];
  for (const v of list) {
    if (typeof v !== 'string' || !QUEST_IDS.includes(v)) return null;
    if (!out.includes(v)) out.push(v);
  }
  return out;
}

/* The jobs kept under `pk`, or null when nothing is being kept. */
export async function readJobs(pk, s = store()) {
  const d = await s.get(jobsBlob(pk), { type: 'json' });
  if (!d || !Array.isArray(d.jobs)) return null;
  return d.jobs.filter((id) => QUEST_IDS.includes(id)).sort();
}

/* Keep these jobs as well as any already kept, starting the record if there is
   none. With `start` false, nothing is kept unless the record already exists:
   a job handed in on a board whose page thought keeping was on, after it was
   switched off somewhere else, is not kept. Returns the jobs, or null. */
export async function keepJobs(pk, ids, start, s = store()) {
  const key = jobsBlob(pk);
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    if (!cur.exists && !start) return null;
    const had = (cur.exists && cur.data && Array.isArray(cur.data.jobs)) ? cur.data.jobs : [];
    const next = [...new Set([...had, ...ids])].filter((id) => QUEST_IDS.includes(id)).sort();
    if (cur.exists && next.length === had.length && next.every((id, i) => id === had[i])) return next;
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, { jobs: next }, opts);
    if (res.modified) return next;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* Stop keeping: the switch that shows them first, then the record. */
export async function forgetJobs(pk, s = store()) {
  await s.delete(jobsShownBlob(pk));
  await s.delete(jobsBlob(pk));
  return true;
}

export async function setJobsShown(handle, on, s = store(), now = Date.now()) {
  const k = jobsShownBlob(petKey(handle));
  if (!on) { await s.delete(k); return false; }
  const cur = await versioned(s, k);
  if (!cur.exists) await s.setJSON(k, { since: now }, { onlyIfNew: true });
  return true;
}

export async function jobsShown(handle, s = store()) {
  if (!(await readAccount(handle, s))) return false;
  const d = await s.get(jobsShownBlob(petKey(handle)), { type: 'json' });
  return !!(d && typeof d.since === 'number');
}

/* Somebody's jobs, as a person on the CB is shown them: { handle, jobs } when
   they are shown, and null otherwise, whatever the reason -- unclaimed, not
   shown, not kept or nobody at all. */
export async function shownJobs(handle, s = store()) {
  if (!(await jobsShown(handle, s))) return null;
  const acct = await readAccount(handle, s);
  return { handle: acct.handle, jobs: (await readJobs(petKey(handle), s)) || [] };
}

/* ── Patches for the battle jacket ──────────────────────────────────────────

   Ryan's brief, 2026-10-14: collect patches for your battle jacket, kept and
   shown in your Profile, and sent as stickers on the CB. Some lie about the
   street and some are on a counter in a shop; patches.js draws them all.

   THEY ARE THE FOURTH THING THE STREET KEEPS UNDER A PERSON, after pets,
   avatars and jobs, and only when somebody presses a button that says it
   takes one. The record is filed under the same scrambled form of the folded
   handle (`petKey`), so a handle is not an account here either.

   IT HOLDS WHICH PATCHES, SORTED, AND NOTHING ABOUT WHEN, the jobs' rule and
   for their reason; the jacket sews them on in the order the street lists
   them. Every id is checked against PATCH_IDS, which tools/make-patches.py
   writes out of data/patches.json. NOTHING COUNTS WHO HAS A PATCH: there is no
   list of a patch's takers, only each person's own record. Switching it off is
   Forget me or deleting the username; SHOWING THEM needs a claimed username,
   the pets' rule and for their reason. A sticker of a patch is only ever one
   of the sender's own, found here, carrying nothing but which patch. */
/* patch:ids:begin */
export const PATCH_IDS = ["stimpunks-world", "pink-pony-peep", "wand-and-rabbit", "interdependence", "kindness-is-punk", "plant-powered", "intermittently-social-lone-wolf", "synapse-of-the-soil"];
/* patch:ids:end */
const patchesBlob = (k) => `patches/${k}`;
const patchesShownBlob = (k) => `patchshown/${k}`;

export function patchId(v) { return typeof v === 'string' && PATCH_IDS.includes(v) ? v : null; }

export async function readPatches(pk, s = store()) {
  const d = await s.get(patchesBlob(pk), { type: 'json' });
  return ((d && Array.isArray(d.patches)) ? d.patches : []).filter((id) => PATCH_IDS.includes(id)).sort();
}

/* Take one patch. { taken: true, patches } the first time, { taken: false,
   patches } when it is on the jacket already. */
export async function takePatch(pk, id, s = store()) {
  const key = patchesBlob(pk);
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    const had = (cur.exists && cur.data && Array.isArray(cur.data.patches)) ? cur.data.patches : [];
    if (had.includes(id)) return { taken: false, patches: had.filter((x) => PATCH_IDS.includes(x)).sort() };
    const next = [...had, id].filter((x) => PATCH_IDS.includes(x)).sort();
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, { patches: next }, opts);
    if (res.modified) return { taken: true, patches: next };
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* Forget me, and deleting the username: the switch that shows them first,
   then the record. */
export async function forgetPatches(pk, s = store()) {
  await s.delete(patchesShownBlob(pk));
  await s.delete(patchesBlob(pk));
  return true;
}

export async function setPatchesShown(handle, on, s = store(), now = Date.now()) {
  const k = patchesShownBlob(petKey(handle));
  if (!on) { await s.delete(k); return false; }
  const cur = await versioned(s, k);
  if (!cur.exists) await s.setJSON(k, { since: now }, { onlyIfNew: true });
  return true;
}

export async function patchesShown(handle, s = store()) {
  if (!(await readAccount(handle, s))) return false;
  const d = await s.get(patchesShownBlob(petKey(handle)), { type: 'json' });
  return !!(d && typeof d.since === 'number');
}

/* Somebody's battle jacket, as a person on the CB is shown it: { handle,
   patches } when it is shown, and null otherwise, whatever the reason. */
export async function shownPatches(handle, s = store()) {
  if (!(await patchesShown(handle, s))) return null;
  const acct = await readAccount(handle, s);
  return { handle: acct.handle, patches: await readPatches(petKey(handle), s) };
}

/* A sticker of one of your own patches, or null if it is not on your jacket. */
export async function patchSticker(handle, id, s = store()) {
  if (!patchId(id)) return null;
  return (await readPatches(petKey(handle), s)).includes(id) ? { patch: id } : null;
}
export function shapePatchSticker(st) {
  return st && patchId(st.patch) ? { patch: st.patch } : null;
}

/* A sticker of your whole battle jacket (Ryan, 2026-10-16): which patches are
   sewn on it as it is sent, read here and never described by the request. It
   is a copy that lives and dies with its message, the pets' rule: taking a
   patch later does not change a jacket already sent, and nothing in it points
   back at the record. A jacket with nothing sewn on is no sticker. */
export async function jacketSticker(handle, s = store()) {
  const patches = await readPatches(petKey(handle), s);
  return patches.length ? { patches } : null;
}
export function shapeJacketSticker(st) {
  const patches = (st && Array.isArray(st.patches)) ? [...new Set(st.patches.filter((id) => patchId(id)))].sort() : [];
  return patches.length ? { patches } : null;
}

/* ── Profiles ────────────────────────────────────────────────────────────

   Ryan, 2026-10-17, after requests for profiles more like Discord's: a theme
   and a banner, a decoration round the avatar you wear, your name in a face of
   your choosing, a nameplate under your name on Who's online, your pronouns, a
   bio, links to your other places, and your favourite room on the street. And
   2026-10-18, Discord's two more: a frame round the profile and an effect
   over it, each chosen from profile.js's own list like a decoration.
   Ryan's calls the same day: all of those, NO DATE (nothing says when anybody
   claimed their username or joined, which a profile beside a name would turn
   into who has been here longest), and WHATEVER IS FILLED IN IS SHOWN, to
   anybody signed on to the CB, on a claimed username only, the way the avatar
   you wear already is. An unclaimed handle is anybody's who signs on with it,
   so it has no profile: nobody could write one on anybody's behalf.

   IT IS THE FIFTH THING KEPT UNDER A PERSON, filed under the pet key like the
   rest, and it holds the choices and the words and nothing else: no time, no
   count, nothing about who looked. Every choice is checked against the lists
   tools/make-profile.py writes between the markers below, out of call.js's
   themes, cb-themes.js's drawings and profile.js's decorations and faces; a
   link must be an http or https address with a dotted host and no name or
   password in it, shown as its own address with its host after it, the
   channel's rule; a room is a room's tag, never one that keeps to itself,
   because a quiet room named on a profile would be the listing it exists not
   to have. A profile with nothing in it is no profile, and is deleted.

   THE NAMEPLATE IS COPIED TO ONE BLOB, the way the avatar worn is, so Who's
   online reads one blob rather than one per person, and it is taken out of
   that blob FIRST when the profile goes. Forget me and deleting the username
   delete the profile, and a moderator can clear one card from the desk without
   deleting the username (clearProfile, Ryan's call, 2026-10-18). */
/* profile:keys:begin */
export const PROFILE_KEYS = {"themes":["amber","day","high","soldark","sollight","green","red","teal","biophilic","starstuff","lcars","glitter","solarpunk","biomech","greeble","cyborg","unicorn","wabi","lagoon","kelp","fairy","zelda","microchip","ascii","sml","digdug","deviant","hp49g","mario","cube","pipboy","gameboy","ti82","louise","paula","shop","mansn","w","termites","greenroom","sarah","crashers","inquisition","metroid","megaman","fable","skyrim","doom","portal","witcher","gta","loz","mordor"],"banners":["soldark","sollight","biophilic","starstuff","lcars","glitter","solarpunk","biomech","greeble","cyborg","unicorn","wabi","zelda","microchip","ascii","sml","digdug","deviant","hp49g","mario","cube","pipboy","gameboy","ti82","louise","paula","shop","mansn","w","termites","greenroom","sarah","crashers","inquisition","metroid","megaman","fable","skyrim","doom","portal","witcher","gta","loz","kelp","fairy","lagoon","mordor"],"decorations":["wreath","vines","stars","sparkles","mushrooms","leaves","hearts","gears","bubbles","snow","flames","moons","notes","paws","halo","circuit","butterflies","crystals","lanterns","otterring"],"frames":["briar","ivy","brass","lights","stitches","film","circuit","crystals","garland","starry","gate","fronds"],"effects":["butterflies","fireflies","petals","leaves","snow","bubbles","sparkles","shooting","notes","hearts","lagoon","otters","fairy","wolf","starward","dolphins","autumn"],"faces":["Atkinson Hyperlegible","Abril Fatface","Amarante","Anton","B612","Bagel Fat One","Bowlby One SC","Bungee","Bungee Shade","Caveat","Chakra Petch","Cherry Bomb One","Cinzel","Courier Prime","Della Respira","Doto","DynaPuff","Eczar","Exo 2","Forum","Fraunces","Fredoka","Gloria Hallelujah","Gravitas One","Inter","JetBrains Mono","Leckerli One","Libre Franklin","Lilita One","Limelight","Macondo","Marcellus SC","Martian Mono","Michroma","Monoton","Oxanium","Permanent Marker","Playfair Display","Press Start 2P","Righteous","Rubik Dirt","Rye","Sansita","Shrikhand","Sour Gummy","Space Mono","Syncopate","Titan One","Unbounded","VT323","Yanone Kaffeesatz","Yellowtail"]};
/* profile:keys:end */
export const PRONOUNS_MAX = 40;
export const BIO_MAX = 500;
export const PROFILE_LINKS = 5;
export const PROFILE_LINK_MAX = 300;
export const ROOM_WHY_MAX = 200;
const profileBlob = (k) => `profile/${k}`;
const PLATES = 'profiles-plates';

function inList(list, v) { return v === '' || v == null ? '' : (typeof v === 'string' && list.includes(v) ? v : null); }

/* What a card LOOKS like, as against what it says: the seven drawn choices,
   each with the list in PROFILE_KEYS it comes from and what a refusal calls
   it. A profile set keeps exactly these. */
const LOOK = [['theme', 'themes', 'theme'], ['banner', 'banners', 'banner'], ['decoration', 'decorations', 'decoration'],
  ['frame', 'frames', 'frame'], ['effect', 'effects', 'effect'], ['face', 'faces', 'name face'], ['plate', 'banners', 'nameplate']];

/* An address on somebody's profile, as typed, or '' for none and null for one
   refused: http or https, a dotted host, no name or password, short enough to
   print whole. What is typed is what is shown, and the radio links it to what
   URL() makes of it, so a lookalike shows its host. */
export function cleanProfileLink(v) {
  const t = tidy(v);
  if (!t) return '';
  if ([...t].length > PROFILE_LINK_MAX) return null;
  let u;
  try { u = new URL(t); } catch (e) { return null; }
  if ((u.protocol !== 'https:' && u.protocol !== 'http:') || u.username || u.password || !/\./.test(u.hostname)) return null;
  return t;
}

/* A bio keeps its lines, the channel's rule for a message, and is at most
   BIO_MAX characters. '' for none, null for too long. A prop is cleaned the
   same way, to PROP_MAX. */
export function cleanBio(v) { return cleanLines(v, BIO_MAX); }
function cleanLines(v, max) {
  const t = String(v == null ? '' : v)
    .replace(/\r\n?/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g, ' ')
    .split('\n').map((line) => line.replace(/[  ]+$/, '')).join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+|\n+$/g, '');
  if (!t.trim()) return '';
  return [...t].length <= max ? t : null;
}

/* A profile as somebody sent it, checked: { profile } with every part, empty
   ones as '' or [], or { error } saying which part was refused. */
export function cleanProfile(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return { error: 'That is not a profile.' };
  const K = PROFILE_KEYS;
  const out = {};
  for (const [k, list, said] of LOOK) {
    const v = inList(K[list], p[k]);
    if (v === null) return { error: `The street does not know that ${said}.` };
    out[k] = v;
  }
  const pronouns = cleanUpTo(p.pronouns, PRONOUNS_MAX);
  if (pronouns === null) return { error: `Pronouns are at most ${PRONOUNS_MAX} characters.` };
  out.pronouns = pronouns;
  const bio = cleanBio(p.bio);
  if (bio === null) return { error: `A bio is at most ${BIO_MAX} characters.` };
  out.bio = bio;
  const links = Array.isArray(p.links) ? p.links : (p.links == null ? [] : null);
  if (!links) return { error: 'Links are a list of addresses.' };
  out.links = [];
  for (const l of links) {
    const c = cleanProfileLink(l);
    if (c === null) return { error: `${String(l).slice(0, 60)} is not an address the CB can link: it needs to start with https:// or http://, with no name or password in it, and be at most ${PROFILE_LINK_MAX} characters.` };
    if (c && !out.links.includes(c)) out.links.push(c);
  }
  if (out.links.length > PROFILE_LINKS) return { error: `A profile links at most ${PROFILE_LINKS} places.` };
  const room = p.room == null || p.room === '' ? '' : roomTag(p.room);
  if (room === null) return { error: 'That is not a room on the street.' };
  if (room && quietRoom(room)) return { error: 'That room keeps to itself, so it cannot be named on a profile.' };
  out.room = room;
  const why = cleanUpTo(p.why, ROOM_WHY_MAX);
  if (why === null) return { error: `Why it is your favourite is at most ${ROOM_WHY_MAX} characters.` };
  out.why = room ? why : '';
  return { profile: out };
}

function emptyProfile(p) {
  return !p || !Object.keys(p).some((k) => (Array.isArray(p[k]) ? p[k].length : !!p[k]));
}

export async function readProfile(pk, s = store()) {
  const d = await s.get(profileBlob(pk), { type: 'json' });
  if (!d || typeof d !== 'object') return null;
  const c = cleanProfile(d);
  return c.profile && !emptyProfile(c.profile) ? c.profile : null;
}

async function updatePlates(change, s) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, PLATES);
    const plates = { ...((cur.exists && cur.data && cur.data.plates) || {}) };
    if (change(plates) === false) return plates;
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(PLATES, { plates }, opts);
    if (res.modified) return plates;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* The nameplate, copied to where Who's online can read it, or taken out. */
async function showPlate(pk, plate, s) {
  return updatePlates((plates) => {
    if (!plate) { if (!own(plates, pk)) return false; delete plates[pk]; return true; }
    if (plates[pk] === plate) return false;
    plates[pk] = plate;
    return true;
  }, s);
}

/* Keep a profile, already checked by cleanProfile. The caller has checked the
   username is claimed. One with nothing in it is forgotten instead. */
export async function keepProfile(pk, p, s = store()) {
  if (emptyProfile(p)) { await forgetProfile(pk, s); return null; }
  const key = profileBlob(pk);
  for (let attempt = 0; ; attempt++) {
    if (attempt >= 12) throw new Error('busy');
    const cur = await versioned(s, key);
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, p, opts);
    if (res.modified) break;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  await showPlate(pk, p.plate || '', s);
  return p;
}

/* Clearing it, a moderator clearing it, Forget me and deleting the username:
   off Who's online first, then the record. */
export async function forgetProfile(pk, s = store()) {
  await showPlate(pk, '', s);
  await s.delete(profileBlob(pk));
  return true;
}

/* A moderator clearing somebody's card from the desk. Ryan's call,
   2026-10-18: until then a card that broke the covenant could only go with the
   whole username, its password, pets, avatars, jobs and patches. This takes the
   card and its nameplate exactly as Clear my card does and leaves everything
   else, so the person can fill in a new one. Nothing is kept about it: not who
   cleared it, not when, not what the card said. { cleared, had } for a claimed
   username, whether or not it had a card; { error } for one not claimed, which
   has no card to clear. The desk refuses a moderator's username before this. */
export async function clearProfile(handle, s = store()) {
  const acct = await readAccount(handle, s);
  if (!acct) return { error: 'That username has not been claimed.' };
  const pk = petKey(handle);
  const had = !!(await readProfile(pk, s));
  await forgetProfile(pk, s);
  return { cleared: true, had };
}

/* Somebody's profile as anybody signed on is shown it: { handle, profile }
   for a claimed username, with profile null when there is nothing in it, and
   null for a handle that is not claimed, whatever the reason. */
export async function shownProfile(handle, s = store()) {
  const acct = await readAccount(handle, s);
  if (!acct) return null;
  return { handle: acct.handle, profile: await readProfile(petKey(handle), s) };
}

/* Who's online, with the nameplate each claimed person chose. Nothing is
   added beside an unclaimed name, whatever the blob holds. */
export async function withPlates(people, s = store()) {
  if (!people.some((p) => p.claimed)) return people;
  const d = await s.get(PLATES, { type: 'json' });
  const plates = (d && d.plates) || {};
  return people.map((p) => {
    if (!p.claimed) return p;
    const k = petKey(p.handle);
    const plate = own(plates, k) ? inList(PROFILE_KEYS.banners, plates[k]) : null;
    return plate ? { ...p, plate } : p;
  });
}


/* ── Profile sets ────────────────────────────────────────────────────────

   A request from our community, relayed by Ryan, 2026-10-19: save sets of
   profile settings, update them, and switch between them quickly, by mood,
   by the room you are in and by what is on (Otters, Halloween, Fairy Lights).

   A SET IS A CARD'S LOOK UNDER A NAME, and nothing else: the seven drawn
   choices in LOOK, and which avatar is worn, or none. The card's words are not
   in it (pronouns, bio, links, favourite room), so wearing a set changes how
   the card looks and never what it says, and words rewritten since are never
   put back by a press. A set is read off the card as it is saved and the
   avatar as it is worn, here, never off what a page sends, so a set only ever
   holds something that was really on the card.

   SETS ARE PRIVATE. Nobody else is told what sets anybody has, or that they
   have any, or which one a card is wearing: the card shows what is on it and
   nothing else. They are kept under the pet key, on a claimed username only,
   like the card, in one blob, profile-sets/<pet key>, holding each set's id,
   name, look and avatar and nothing about when. Nothing records which set is
   worn: the radio works it out by comparing. Forget me and deleting the
   username delete them; Clear my card and a moderator clearing a card leave
   them, because they hold no words, and a look is only ever choices off the
   street's own lists. */
export const PROFILE_SETS_KEEP = 24;       // sets one person keeps at once
export const PROFILE_SET_NAME_MAX = 24;
export const PROFILE_SET_ID = /^l[A-Za-z0-9_-]{10}$/;
const setsBlob = (k) => `profile-sets/${k}`;
export const cleanSetName = (v) => cleanUpTo(v, PROFILE_SET_NAME_MAX);

/* The look off a card, or off a set kept before a drawing left the street: a
   choice no longer on its list is no choice, so an old set can still be worn. */
export function cardLook(p) {
  const out = {};
  for (const [k, list] of LOOK) out[k] = inList(PROFILE_KEYS[list], p && typeof p === 'object' ? p[k] : '') || '';
  return out;
}

export async function readProfileSets(pk, s = store()) {
  const d = await s.get(setsBlob(pk), { type: 'json' });
  return (d && Array.isArray(d.sets)) ? d.sets : [];
}

/* One person's sets, changed without losing a change made at the same moment
   from another tab, the chimeras' arrangement. */
async function updateProfileSets(pk, change, s) {
  const key = setsBlob(pk);
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    const d = (cur.exists && cur.data) || {};
    const was = { sets: (Array.isArray(d.sets) ? d.sets : []).slice() };
    const next = change(was);
    if (next === null) return was;
    if (next.error) return next;
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, { sets: next.sets }, opts);
    if (res.modified) return next;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* A set as its owner is shown it, with the name of the avatar it wears,
   whether that avatar has been deleted since, and whether the card is wearing
   it, worked out here by comparing with the card and the avatar worn, so
   nothing has to record it. */
export function shapeProfileSet(set, avatars, card = null, wearing = null) {
  const a = set.avatar ? (avatars || []).find((x) => x.id === set.avatar) : null;
  const look = cardLook(set.look), mine = cardLook(card || {});
  const on = !(!!set.avatar && !a) && (set.avatar || null) === (wearing || null) && LOOK.every(([k]) => look[k] === mine[k]);
  return { id: set.id, name: set.name, look, avatar: a ? a.id : null, avatarName: a ? (a.name || '') : '', avatarGone: !!set.avatar && !a, on };
}

/* What a set saved or updated at this moment holds: the card as saved, and
   the avatar as worn. */
async function cardAsIs(pk, s) {
  const [p, av] = await Promise.all([readProfile(pk, s), readAvatars(pk, s)]);
  return { look: cardLook(p || {}), avatar: av.wearing || null };
}
const sameName = (a, b) => foldHandle(a) === foldHandle(b);
const setId = (id) => typeof id === 'string' && PROFILE_SET_ID.test(id);

/* Save the card as it is as a new set. { kept, sets } or { error }: 'name' for
   no name or one too long, 'taken' for a name already one of yours, 'full'. */
export async function saveProfileSet(pk, name, s = store()) {
  const n = cleanSetName(name);
  if (!n) return { error: 'name' };
  const card = await cardAsIs(pk, s);
  const rec = { id: 'l' + randomBytes(8).toString('base64url').slice(0, 10), name: n, look: card.look, avatar: card.avatar };
  const next = await updateProfileSets(pk, (was) => {
    if (was.sets.some((x) => sameName(x.name, n))) return { error: 'taken' };
    if (was.sets.length >= PROFILE_SETS_KEEP) return { error: 'full' };
    return { sets: [...was.sets, rec] };
  }, s);
  if (next.error) return next;
  return { kept: rec, sets: next.sets };
}

/* Put the card as it is into a set already kept, keeping its name and place. */
export async function refreshProfileSet(pk, id, s = store()) {
  if (!setId(id)) return { error: 'which' };
  const card = await cardAsIs(pk, s);
  return updateProfileSets(pk, (was) => {
    const i = was.sets.findIndex((x) => x.id === id);
    if (i < 0) return { error: 'which' };
    const sets = was.sets.slice();
    sets[i] = { id: sets[i].id, name: sets[i].name, look: card.look, avatar: card.avatar };
    return { sets };
  }, s);
}

export async function renameProfileSet(pk, id, name, s = store()) {
  if (!setId(id)) return { error: 'which' };
  const n = cleanSetName(name);
  if (!n) return { error: 'name' };
  return updateProfileSets(pk, (was) => {
    const i = was.sets.findIndex((x) => x.id === id);
    if (i < 0) return { error: 'which' };
    if (was.sets.some((x, j) => j !== i && sameName(x.name, n))) return { error: 'taken' };
    if (was.sets[i].name === n) return null;
    const sets = was.sets.slice();
    sets[i] = { ...sets[i], name: n };
    return { sets };
  }, s);
}

export async function removeProfileSet(pk, id, s = store()) {
  if (!setId(id)) return { error: 'which' };
  return updateProfileSets(pk, (was) => {
    if (!was.sets.some((x) => x.id === id)) return { error: 'which' };
    return { sets: was.sets.filter((x) => x.id !== id) };
  }, s);
}

/* Wear a set: its look laid over the card, whose words stay as they are, and
   its avatar worn, or the one worn taken off when the set wears none. An
   avatar deleted since the set was saved leaves the one worn as it is, and
   says so. { profile, wearing, avatarGone } or { error }. The caller has
   checked the username is claimed. */
export async function wearProfileSet(pk, id, s = store()) {
  if (!setId(id)) return { error: 'which' };
  const set = (await readProfileSets(pk, s)).find((x) => x.id === id);
  if (!set) return { error: 'which' };
  const c = cleanProfile({ ...((await readProfile(pk, s)) || {}), ...cardLook(set.look) });
  if (c.error) return { error: 'look' };
  const profile = await keepProfile(pk, c.profile, s);
  const want = typeof set.avatar === 'string' && AVATAR_ID.test(set.avatar) ? set.avatar : null;
  const av = await readAvatars(pk, s);
  if (want && !av.avatars.some((a) => a.id === want)) return { profile, wearing: av.wearing, avatarGone: true };
  if (av.wearing !== want) {
    const w = await wearAvatar(pk, want, s);
    if (w.error) return { profile, wearing: av.wearing, avatarGone: true };
  }
  return { profile, wearing: want, avatarGone: false };
}

/* Forget me, and deleting the username. */
export async function forgetProfileSets(pk, s = store()) {
  await s.delete(setsBlob(pk));
  return true;
}

/* ── Props ───────────────────────────────────────────────────────────────

   Ryan, 2026-10-18, after the forums' Props & Gratitude category: a Props tab
   in every profile, where anybody signed on reads the props somebody has been
   given and anybody with a claimed username writes them one. A prop is a
   sentence or a short paragraph thanking, acknowledging or celebrating
   somebody, usually for helping them or the community.

   NOTHING GOES UP UNTIL ITS PERSON SAYS YES. A prop written for somebody waits,
   seen only by them and by whoever wrote it, until they Confirm it, which puts
   it on their Props tab, or Reject it, which deletes it. Nobody is told it was
   rejected: it simply stops waiting. Once it is up, they can take it off again,
   its writer can take it back, and the base can take it down. Nothing is kept
   about any of that.

   THE TAB IS SHUT UNTIL ITS PERSON SWITCHES IT ON, the other tabs' rule, and
   only a claimed username can: an unclaimed handle is anybody's who signs on
   with it, so anybody could confirm props on its behalf. While it is shut,
   nobody can give that person props and their tab shows none; what they
   confirmed is kept, and comes back when they switch it on again.

   WRITING ONE NEEDS A CLAIMED USERNAME TOO (forumReader), because a prop
   carries its writer's name on somebody else's profile for as long as it is
   up, and a name anybody can sign on as could thank people in somebody else's
   voice. Each prop keeps its writer's handle, whether they were the base, and
   the forums' mark of the claimed username that wrote it (authorMark), which
   never leaves this file: it is how a name deleted and claimed again by
   somebody else cannot take back what its owner wrote. One prop from each
   writer waits for a person at a time, so nobody can fill somebody's queue.

   IT IS THE SEVENTH THING KEPT UNDER A PERSON, after pets, avatars, jobs,
   patches, profile cards and chimeras, filed under the pet key in one blob:
   whether the tab is open, the props waiting and the props up, each its words,
   its writer and an id, AND NOTHING ABOUT WHEN. NO COUNT EITHER: nothing says
   how many props anybody has or has waiting, and the friendly edit is a number
   on the tab, which is the headcount the street refuses wearing a thank-you.
   FORGET ME and deleting the username delete it. Props somebody wrote for other
   people stay up on their tabs, under the name they were written as, the way a
   forum post stays up. */
export const PROP_MAX = 500;
export const PROPS_KEEP = 100;            // props up on one profile at once
export const PROPS_WAITING = 20;          // props waiting for one person at once
export const PROP_ID = /^r[A-Za-z0-9_-]{10}$/;
const propsBlob = (k) => `props/${k}`;

export function cleanProp(v) { return cleanLines(v, PROP_MAX); }

function propsDoc(d) {
  d = d && typeof d === 'object' && !Array.isArray(d) ? d : {};
  return {
    open: d.open === true,
    waiting: Array.isArray(d.waiting) ? d.waiting.slice() : [],
    props: Array.isArray(d.props) ? d.props.slice() : [],
  };
}

export async function readProps(pk, s = store()) {
  return propsDoc(await s.get(propsBlob(pk), { type: 'json' }));
}

/* One person's props, changed without losing a change made at the same moment:
   fifteen people giving one person props at once, and that person confirming
   one while they do. change() returns the new record, null for no change, or
   { error }. */
async function updateProps(pk, change, s) {
  const key = propsBlob(pk);
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    const was = propsDoc(cur.exists && cur.data);
    const next = change(was);
    if (next === null) return was;
    if (next.error) return next;
    const rec = { open: next.open === true, waiting: next.waiting, props: next.props };
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, rec, opts);
    if (res.modified) return rec;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* A prop as anybody is shown it: its id, its words, who wrote it and their
   mark, and whether the person asking wrote it. Never the writer's mark. */
export function shapeProp(p, mark = null) {
  const out = { id: p.id, text: p.text, handle: p.handle, base: !!p.base, claimed: !p.base };
  if (mark && p.by === mark) out.mine = true;
  return out;
}

/* Give somebody props. { given, handle } or { error }: 'claim' for a writer
   whose username is not claimed, 'empty', 'long', 'self', 'closed' for a
   handle that is not claimed or whose tab is shut (the same answer for both),
   'waiting' when this writer already has props waiting for them, and 'full'. */
export async function giveProp(handle, who, text, s = store()) {
  if (!forumReader(who)) return { error: 'claim' };
  const t = cleanProp(text);
  if (t === null) return { error: 'long' };
  if (!t) return { error: 'empty' };
  const acct = await readAccount(handle, s);
  if (!acct) return { error: 'closed' };
  if (foldHandle(acct.handle) === foldHandle(who.handle)) return { error: 'self' };
  const by = authorMark(who);
  const rec = { id: 'r' + randomBytes(8).toString('base64url').slice(0, 10), text: t, handle: who.handle, by };
  if (who.role === 'base') rec.base = true;
  const next = await updateProps(petKey(acct.handle), (was) => {
    if (!was.open) return { error: 'closed' };
    if (was.waiting.some((p) => p.by === by)) return { error: 'waiting' };
    if (was.waiting.length >= PROPS_WAITING) return { error: 'full' };
    return { ...was, waiting: [...was.waiting, rec] };
  }, s);
  if (next.error) return next;
  return { given: rec, handle: acct.handle };
}

/* Its person says yes: off the waiting list and onto their tab. */
export async function confirmProp(pk, id, s = store()) {
  if (typeof id !== 'string' || !PROP_ID.test(id)) return { error: 'which' };
  return updateProps(pk, (was) => {
    const p = was.waiting.find((x) => x.id === id);
    if (!p) return { error: 'which' };
    if (was.props.length >= PROPS_KEEP) return { error: 'full' };
    return { ...was, waiting: was.waiting.filter((x) => x.id !== id), props: [...was.props, p] };
  }, s);
}

/* Its person says no: deleted, and nobody is told. */
export async function rejectProp(pk, id, s = store()) {
  if (typeof id !== 'string' || !PROP_ID.test(id)) return { error: 'which' };
  return updateProps(pk, (was) => {
    if (!was.waiting.some((x) => x.id === id)) return { error: 'which' };
    return { ...was, waiting: was.waiting.filter((x) => x.id !== id) };
  }, s);
}

/* Taking one off somebody's tab, or back off their waiting list. Their person
   takes any prop off their own tab; whoever wrote one takes it back, waiting
   or up, under the claimed username that wrote it; the base takes down any
   prop that is up, and never sees what is waiting. */
export async function dropProp(handle, who, id, s = store()) {
  if (typeof id !== 'string' || !PROP_ID.test(id) || !who) return { error: 'which' };
  const acct = await readAccount(handle, s);
  if (!acct) return { error: 'which' };
  const theirs = !!who.account && foldHandle(who.handle) === foldHandle(acct.handle);
  const mark = forumReader(who) ? authorMark(who) : null;
  return updateProps(petKey(acct.handle), (was) => {
    const up = was.props.find((x) => x.id === id);
    const waiting = was.waiting.find((x) => x.id === id);
    if (up && (theirs || (mark && up.by === mark) || who.role === 'base')) {
      return { ...was, props: was.props.filter((x) => x.id !== id) };
    }
    if (waiting && mark && waiting.by === mark) {
      return { ...was, waiting: was.waiting.filter((x) => x.id !== id) };
    }
    return { error: 'which' };
  }, s);
}

/* Opening the tab or shutting it. The caller has checked the username is
   claimed. */
export async function setPropsOpen(pk, on, s = store()) {
  return updateProps(pk, (was) => (was.open === !!on ? null : { ...was, open: !!on }), s);
}

/* Forget me and deleting the username. */
export async function forgetProps(pk, s = store()) {
  await s.delete(propsBlob(pk));
  return true;
}

/* Your own props, for Profile: what is waiting and what is up, newest first. */
export function ownProps(d) {
  return {
    open: d.open,
    waiting: d.waiting.slice().reverse().map((p) => shapeProp(p)),
    props: d.props.slice().reverse().map((p) => shapeProp(p)),
  };
}

/* Somebody's Props tab as the person asking is shown it: { handle, shown,
   props?, waiting, yours? } for a claimed username, and null for a handle that
   is not claimed, whatever the reason. The props that are up, newest first, if
   the tab is open; whatever the asker wrote that is still waiting, and nobody
   else's; and, for its own person, whether anything is waiting for them,
   which is a yes or a no and never how many. */
export async function shownProps(handle, who, s = store()) {
  const acct = await readAccount(handle, s);
  if (!acct) return null;
  const d = await readProps(petKey(acct.handle), s);
  const mark = forumReader(who) ? authorMark(who) : null;
  const out = { handle: acct.handle, shown: d.open };
  if (d.open) out.props = d.props.slice().reverse().map((p) => shapeProp(p, mark));
  out.waiting = mark ? d.waiting.filter((p) => p.by === mark).map((p) => shapeProp(p, mark)) : [];
  if (who && who.account && foldHandle(who.handle) === foldHandle(acct.handle)) out.yours = d.waiting.length > 0;
  return out;
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

/* Hourly, with the channel's sweep: every stale presence record, and
   everything said at a place more than 48 hours ago. */
export async function sweepSlake(s = store(), now = Date.now()) {
  let any = false;
  for (const r of await everyHere(s)) {
    if (now - r.t >= MUD_FRESH) { await s.delete(r.key); any = true; }
  }
  for (const place of MUD_PLACES) any = (await sweepLog(talkKey(place), s, now)) || any;
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
      // Nobody else was in it: the call has started, which notifyCall tells.
      return here.some((r) => r.pid !== pid) ? 'joined' : 'started';
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

/* EVERY CALL WITH SOMEBODY IN IT, for Who's online. Ryan, 2026-10-13, after
   user testing: people could not find the calls that were going. So Who's
   online also names every room whose call has anybody in it, for anybody
   signed on, seen or not. THE ROOM AND NOTHING ELSE: not who is in it, which
   is still shown only in that room to radios seen there (inCall, above), and
   not how many, because nothing here is counted. A room the asker may not
   enter is left out, and a room that keeps to itself is never named, by
   whoSeen's rules. Tags in alphabetical order; the radio puts them in the
   street's walking order. Nothing is stored for it, or records who asked. */
export async function callsOn(who, s = store(), now = Date.now()) {
  const on = new Set();
  for (const r of await listed(s, IN_CALL, parseInCall)) {
    if (now - r.t >= callStale() || !roomAllows(who, r.tag) || quietRoom(r.tag)) continue;
    on.add(r.tag);
  }
  return [...on].sort();
}

/* ── The World room's index ─────────────────────────────────────────────

   Ryan's brief, 2026-10-18: a list of every room, with which have people in
   them and which have calls going, filtered by active or not, and sorted by
   latest activity or by most active. Ryan's call the same day: MOST ACTIVE IS
   IN, which reverses the street's no-headcount rule for this one order and
   nowhere else. So the people seen in each room and in its call are counted
   here, every time somebody asks, and THE ANSWER CARRIES THE ORDER AND NEVER
   THE NUMBERS (busiest): nothing is stored for it, and no count leaves.

   For anybody signed on, by whoSeen's rules: who chose Be seen here, by name,
   a room the asker may not enter left out, and a room that keeps to itself
   never in it. Whether a room's call has somebody in it, and never who
   (callsOn's rule). And the time of the latest message on each room's channel,
   which is never more than 48 hours ago, and never its words: the one thing this shows that was not shown before,
   and privacy.html#world says so. The World channel's latest is the World
   room's, because its channel is World. */
export async function worldIndex(who, s = store(), now = Date.now()) {
  const rooms = new Map();
  const at = (tag) => { let r = rooms.get(tag); if (!r) rooms.set(tag, r = { people: new Map(), call: new Set(), last: 0 }); return r; };
  const fits = (tag) => roomAllows(who, tag) && !quietRoom(tag);
  for (const r of await everySeen(s)) {
    if (now - r.t >= ROOM_FRESH || !fits(r.tag)) continue;
    const x = at(r.tag);
    const k = `${r.claimed ? 'c' : 'u'}|${r.handle}`;
    const p = x.people.get(k) || { handle: r.handle, base: false, claimed: r.claimed };
    if (r.base) p.base = true;
    x.people.set(k, p);
    x.last = Math.max(x.last, r.t);
  }
  for (const r of await listed(s, IN_CALL, parseInCall)) {
    if (now - r.t >= callStale() || !fits(r.tag)) continue;
    const x = at(r.tag);
    x.call.add(foldHandle(r.name));
    x.last = Math.max(x.last, r.t);
  }
  const talk = [[WORLD_CALL, await readChannel(s)]];
  for (const b of (await s.list({ prefix: ROOM_TALK })).blobs || []) {
    const tag = b.key.slice(ROOM_TALK.length);
    if (!roomTag(tag) || tag === WORLD_CALL || !fits(tag)) continue;
    talk.push([tag, await readRoomTalk(tag, s)]);
  }
  for (const [tag, log] of talk) {
    const t = Math.max(0, ...log.messages.map((m) => (typeof m.t === 'number' ? m.t : 0)));
    if (t) { const x = at(tag); x.last = Math.max(x.last, t); }
  }
  const list = [...rooms.entries()].map(([tag, x]) => {
    // Everybody once: somebody seen in the room and in its call is one person.
    const names = new Set([...x.people.values()].map((p) => foldHandle(p.handle)));
    for (const n of x.call) names.add(n);
    return { tag, people: [...x.people.values()].sort((a, b) => a.handle.localeCompare(b.handle) || Number(b.claimed) - Number(a.claimed)),
      call: x.call.size > 0, last: x.last || null, n: names.size };
  });
  const busiest = list.filter((r) => r.n > 0)
    .sort((a, b) => b.n - a.n || (b.last || 0) - (a.last || 0) || a.tag.localeCompare(b.tag)).map((r) => r.tag);
  return { rooms: list.map((r) => ({ tag: r.tag, people: r.people, call: r.call, last: r.last })), busiest };
}

export async function sweepCalls(s = store(), now = Date.now()) {
  let any = false;
  for (const r of await listed(s, IN_CALL, parseInCall)) if (now - r.t >= callStale()) { await s.delete(r.key); any = true; }
  for (const r of await listed(s, CALL_LEFT, parseLeft)) if (now - r.t >= LEFT_KEEP) { await s.delete(r.key); any = true; }
  return any;
}

/* ── Direct messages ───────────────────────────────────────────────────────

   Ryan's calls, 2026-10-18, after requests from our community as it moves off
   Discord: messages between two people, on the CB, with these defaults.

   CLAIMED USERNAMES ONLY, AT BOTH ENDS (forumReader). An unclaimed handle is
   anybody's who signs on with it, so a message sent to one would be read by
   whoever used that handle next, and one sent from one could be anybody.

   NOBODY CAN START ONE WITH YOU UNTIL YOU SWITCH IT ON. Let people message me
   is off until its person switches it on (the other tabs' rule). The first
   message from somebody new WAITS, seen only by the two of them, until its
   person accepts it (or answers it, which is the same thing) or rejects it,
   which empties the conversation and tells nobody: props' rule. While it waits,
   whoever asked can send nothing more, so nobody can fill somebody's queue,
   though they can edit it or take it back. A conversation already going goes
   on whatever the switch says, until either of them blocks the other or it
   goes quiet. Somebody switched off, somebody who blocked you, a handle nobody
   has claimed and nobody at all all answer 'closed', the same words, so the
   answer never tells which.

   EVERY MESSAGE GOES 48 HOURS AFTER IT WAS SENT, the channel's LIFE, checked on
   every read, and fifty in a conversation at most. (Not onAir() itself, which
   still keeps the channel's old midnight for what was sent before LIFE_FROM:
   messages began after the change, and owe no midnight.) A conversation with
   nothing left in it is no conversation: who talked to whom is not kept a
   minute past the last message between them, so the next message after a
   quiet two days asks again. The hourly sweep deletes what is left.

   BLOCKING is kept in the blocker's own record, by a hash of the name blocked
   (petKey), so it holds if that name is deleted and claimed again; it empties
   the conversation between them, and refuses messages both ways with 'closed'
   for the one blocked and 'blocked' for the one who blocked. Nobody is told,
   and nobody but its owner sees a block list.

   NOT END-TO-END ENCRYPTED, and privacy.html#messages says so: the words sit in
   this store like the channel's, and nothing here reads them out to anybody
   but the two people in the conversation. NO MODERATOR CAN READ ONE. The only
   way a message reaches the moderators is a REPORT, which one of the two makes
   about a message the other sent: its words are copied onto the moderators'
   desk with who reported it and an optional note, and kept there until a
   moderator closes it or for thirty days, even if either of them deletes their
   username, because it is how the moderators look after the street.

   NOTHING COUNTED, NOTHING ABOUT WHO READ WHAT: no unread number, no read
   receipt, no "seen", no typing. The friendly edits are all four.

   STICKERS AND REACTIONS, ONCE A CONVERSATION IS ACCEPTED (Ryan's ask,
   2026-10-20: messages should do everything the channel does). A sticker is
   the channel's, found among the sender's own and copied when it goes
   (stickerOf and its kin), and a reaction is the channel's toggle on the
   message, naming who and never how many. Neither goes in a request, for the
   reason a picture does not: nobody's first contact with you is anything but
   words. Both go with their message.

   PICTURES, ONCE A CONVERSATION IS ACCEPTED. Ryan's call, 2026-10-19, after
   somebody in our community could not send him a screenshot privately: it
   settles the question DECISIONS.md left open when messages shipped words
   only. A REQUEST IS WORDS ONLY, so nobody's first contact with you is a
   picture: putDmImage and sendDm both refuse a picture until the conversation
   is open. Everything else is the channel's picture: redrawn in the sender's
   browser by the radio's one redraw, refused if it still carries camera data,
   no public address, and GONE WHEN ITS MESSAGE GOES, whether taken back,
   pushed off, emptied by a rejection or a block, forgotten, or past its 48
   hours. It is kept under its own prefix, DM_IMG, which the channel's sweep
   never lists, with whose it is (the sender's dmKey) and which conversation
   it is for, and getDmImage serves it only to the two people in that
   conversation, and only while a message there still holds it. A REPORTED
   PICTURE IS COPIED ONTO THE DESK with its message (REPORT_IMG), copy first,
   and goes when the report is closed or at its thirty days.

   WHAT IS KEPT. For each person (dmKey: the folded name and when it was
   claimed, the forums' authorMark's ingredients, so a name claimed again after
   its owner deleted it is somebody else): whether they take messages and who
   they blocked (dm-set/). For each conversation (dm/, under both people's
   keys): their two handles, who asked, whether it was accepted, and its
   messages, each its words, its sender's handle and key, BASE if so, when it
   was sent and last edited. And an empty marker per person per conversation
   (dm-with/), holding when it was written and nothing else, written before
   the conversation, so a listing finds somebody's
   conversations without anybody keeping a list of them. Forget me and deleting
   the username delete all of it. */
export const DM_KEEP = KEEP;                   // messages in one conversation at once, the channel's fifty
export const DM_WITH = 40;                     // conversations one person can be in at once
export const DM_BLOCKS = 200;                  // people one person can block
export const REPORT_KEEP = 200;                // reports waiting on the desk at once
export const REPORT_DAYS = 30;
export const REPORT_NOTE_MAX = 280;
export const DM_ID = /^d[A-Za-z0-9_-]{10}$/;
export const REPORT_ID = /^k[A-Za-z0-9_-]{10}$/;
const REPORT_LIFE = REPORT_DAYS * 24 * 60 * 60 * 1000;
const DM = 'dm/';
const DM_MARK = 'dm-with/';
const MARK_GRACE = 60 * 60 * 1000;             // a marker is written a moment before its conversation
const DM_SET = 'dm-set/';
const DM_IMG = 'dm-img/';                     // a conversation's pictures, never the channel's img/
const REPORT_IMG = 'dm-report-img/';          // a reported picture's copy, by its report's id
const REPORTS = 'dm-reports';
const pairBlob = (a, b) => DM + [a, b].sort().join('.');
const markBlob = (me, them) => `${DM_MARK}${me}/${them}`;

/* Who somebody is to their messages: the folded name and when it was claimed.
   Never sent anywhere. */
export function dmKey(handle, since) {
  return createHash('sha256').update(`stimpunks-dm|${foldHandle(handle)}|${since}`).digest('base64url').slice(0, 32);
}

function plain(d) { return d && typeof d === 'object' && !Array.isArray(d) ? d : {}; }

function dmSetDoc(d) {
  d = plain(d);
  const blocked = Array.isArray(d.blocked) ? d.blocked.filter((b) => b && typeof b.k === 'string' && typeof b.handle === 'string') : [];
  return { open: d.open === true, blocked };
}

/* A conversation as it stands now: no message past its 48 hours, and one with
   nothing left in it is nobody's. */
function convDoc(d, now = Date.now()) {
  d = plain(d);
  const messages = stored(d).filter((m) => m && typeof m.t === 'number' && now - m.t < LIFE);
  if (!messages.length) return { people: {}, from: null, open: false, messages: [] };
  return { people: { ...plain(d.people) }, from: typeof d.from === 'string' ? d.from : null, open: d.open === true, messages };
}

function reportsDoc(d, now = Date.now()) {
  const list = Array.isArray(plain(d).reports) ? plain(d).reports : [];
  return { reports: list.filter((r) => r && typeof r.t === 'number' && now - r.t < REPORT_LIFE) };
}

/* One record changed without losing a change made at the same moment: the
   props' write. change() returns the next record, null for no change, or
   { error }. */
async function updateDm(key, norm, change, s) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    const was = norm(cur.exists ? cur.data : null);
    const next = change(was);
    if (next === null) return was;
    if (next.error) return next;
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, next, opts);
    if (res.modified) return next;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

export async function readDmSet(me, s = store()) { return dmSetDoc(await s.get(DM_SET + me, { type: 'json' })); }
const updateDmSet = (me, change, s) => updateDm(DM_SET + me, dmSetDoc, change, s);
const blocks = (set, handle) => set.blocked.some((b) => b.k === petKey(handle));

/* Every write to a conversation goes through here, and a picture its write
   let go of (taken back, pushed off, emptied) is deleted as soon as the write
   has landed. One past its 48 hours is held by nothing and goes in the sweep. */
async function updateConv(key, change, s, now) {
  let before = null, after = null;
  const out = await updateDm(key, (d) => convDoc(d, now), (was) => {
    const next = change(was);
    if (!next || next.error) return next;
    before = was;
    after = { people: next.people, from: next.from, open: next.open === true, messages: next.messages.slice(-DM_KEEP) };
    return after;
  }, s);
  if (after && out === after) await dropDmImages(droppedImages(before.messages, after.messages), s);
  return out;
}
async function dropDmImages(ids, s) {
  for (const id of ids) if (imageId(id)) await s.delete(DM_IMG + id);
}
const emptied = () => ({ people: {}, from: null, open: false, messages: [] });

/* The two people a request is about, or why not. */
async function pairOf(who, handle, s) {
  if (!forumReader(who)) return { error: 'claim' };
  const h = cleanHandle(handle);
  if (!h) return { error: 'which' };
  if (foldHandle(h) === foldHandle(who.handle)) return { error: 'self' };
  const acct = await readAccount(h, s);
  const me = dmKey(who.handle, who.since);
  if (!acct) return { error: 'closed', me, handle: h };
  const them = dmKey(acct.handle, acct.since);
  return { me, them, acct, handle: acct.handle, key: pairBlob(me, them) };
}

/* A message as one of the two is shown it: never its sender's key, only
   whether it is theirs. */
export function shapeDm(m, me) {
  const out = { id: m.id, handle: m.handle, text: m.text, t: m.t, base: !!m.base };
  if (typeof m.edited === 'number') out.edited = m.edited;
  if (m.img) { out.img = m.img; out.alt = m.alt || ''; }
  const st = m.sticker && shapeSticker(m.sticker);
  if (st) out.sticker = st;
  const av = m.avatar && shapeAvatarSticker(m.avatar);
  if (av) out.avatar = av;
  const ch = m.chimera && shapeChimeraSticker(m.chimera);
  if (ch) out.chimera = ch;
  const pt = m.patch && shapePatchSticker(m.patch);
  if (pt) out.patch = pt;
  const jk = m.jacket && shapeJacketSticker(m.jacket);
  if (jk) out.jacket = jk;
  const rx = shapeReactions(m.reactions);
  if (rx) out.reactions = rx;
  if (m.by === me) out.mine = true;
  return out;
}

const STICKER_KINDS = ['sticker', 'avatar', 'chimera', 'patch', 'jacket'];
const hasSticker = (m) => STICKER_KINDS.some((k) => m[k]);

/* The sticker `said` asks for, found among the sender's own the channel's
   way, as { kind: copy }; null for none asked; { error } for one that is not
   theirs, or more than one. */
async function dmSticker(handle, said, s) {
  const asked = STICKER_KINDS.filter((k) => said && said[k] != null && said[k] !== false);
  if (!asked.length) return null;
  if (asked.length > 1) return { error: 'one' };
  const k = asked[0], id = said[k];
  const got = k === 'sticker' ? await stickerOf(handle, id, s)
    : k === 'avatar' ? await avatarSticker(handle, id, s)
      : k === 'chimera' ? await chimeraSticker(handle, id, s)
        : k === 'patch' ? await patchSticker(handle, id, s)
          : await jacketSticker(handle, s);
  return got ? { [k]: got } : { error: 'sticker' };
}
const stateOf = (c, me) => (!c.messages.length ? 'new' : c.open ? 'open' : c.from === me ? 'asked' : 'asking');

/* Send `said` to `handle`: its words, or { text, img, alt } with a picture
   putDmImage took for this conversation. { sent, handle, asked, accepted } or
   { error }: 'claim', 'self', 'empty', 'long', 'closed' (switched off, blocked
   you, not claimed or nobody: the same answer), 'blocked' (you blocked them),
   'waiting' (you asked and they have not answered), 'many' (in DM_WITH
   conversations already), 'accepted' (a picture before the conversation is),
   'picture' (no such picture of yours for this conversation). */
export async function sendDm(who, handle, said, s = store(), now = Date.now()) {
  if (!forumReader(who)) return { error: 'claim' };
  const pic = said && typeof said === 'object' ? said : null;
  const words = cleanLines(pic ? pic.text : said, MESSAGE_MAX);
  if (words === null) return { error: 'long' };
  const img = pic && pic.img != null ? imageId(pic.img) : null;
  if (pic && pic.img != null && !img) return { error: 'picture' };
  const stick = await dmSticker(who.handle, pic, s);
  if (stick && stick.error) return stick;
  if (img && stick) return { error: 'one' };
  if (!words && !img && !stick) return { error: 'empty' };
  const p = await pairOf(who, handle, s);
  if (p.error) return { error: p.error };
  const mine = await readDmSet(p.me, s), theirs = await readDmSet(p.them, s);
  if (blocks(mine, p.handle)) return { error: 'blocked' };
  if (blocks(theirs, who.handle)) return { error: 'closed' };
  const was = convDoc(await s.get(p.key, { type: 'json' }), now);
  // A sticker is not for a request either.
  if (stick && !was.open) return { error: 'accepted' };
  if (img) {
    if (!was.open) return { error: 'accepted' };
    const got = await s.getWithMetadata(DM_IMG + img, { type: 'arrayBuffer' });
    if (!got || !got.metadata || got.metadata.by !== p.me || got.metadata.pair !== p.key) return { error: 'picture' };
  }
  if (!was.messages.length) {
    if (!theirs.open) return { error: 'closed' };
    const marks = ((await s.list({ prefix: DM_MARK + p.me + '/' })).blobs || []).map((b) => b.key);
    if (!marks.includes(markBlob(p.me, p.them)) && marks.length >= DM_WITH) return { error: 'many' };
  }
  // Both markers before the conversation, so no conversation is ever missing
  // from either person's list; a marker with nothing behind it is swept.
  await s.setJSON(markBlob(p.me, p.them), { t: now }, { onlyIfNew: true });
  await s.setJSON(markBlob(p.them, p.me), { t: now }, { onlyIfNew: true });
  const m = { id: 'd' + randomBytes(8).toString('base64url').slice(0, 10), handle: who.handle, by: p.me, text: words, t: now };
  if (who.role === 'base') m.base = true;
  if (img) { m.img = img; m.alt = cleanAlt(pic.alt); }
  if (stick) Object.assign(m, stick);
  let asked = false, accepted = false;
  const next = await updateConv(p.key, (c) => {
    asked = false; accepted = false;
    // A request is words only, however the conversation got here.
    if (img && !c.open) return { error: 'accepted' };
    if (stick && !c.open) return { error: 'accepted' };
    if (!c.messages.length) {
      if (!theirs.open) return { error: 'closed' };
      asked = true;
      return { people: { [p.me]: who.handle, [p.them]: p.handle }, from: p.me, open: false, messages: [m] };
    }
    if (!c.open) {
      if (c.from === p.me) return { error: 'waiting' };
      accepted = true;
      return { ...c, open: true, messages: [...c.messages, m] };
    }
    return { ...c, messages: [...c.messages, m] };
  }, s, now);
  if (next.error) return next;
  return { sent: m, handle: p.handle, asked, accepted };
}

/* A picture for the conversation with `handle`, already redrawn by the radio,
   before the message that carries it: { id } or { error }, the same words as
   sendDm's for who, and 'accepted' until the conversation is. One nobody sends
   is swept after IMG_UNSENT. */
export async function putDmImage(who, handle, bytes, s = store(), now = Date.now()) {
  const p = await pairOf(who, handle, s);
  if (p.error) return { error: p.error };
  const mine = await readDmSet(p.me, s), theirs = await readDmSet(p.them, s);
  if (blocks(mine, p.handle)) return { error: 'blocked' };
  if (blocks(theirs, who.handle)) return { error: 'closed' };
  if (!convDoc(await s.get(p.key, { type: 'json' }), now).open) return { error: 'accepted' };
  const k = pictureCheck(bytes);
  if (k.error) return { error: 'bad', why: k.error };
  const id = randomUUID();
  await s.set(DM_IMG + id, bytes, { metadata: { by: p.me, pair: p.key, t: now, type: k.kind } });
  return { id };
}

/* A conversation's picture, for one of the two people in it, while a message
   there holds it; null for anybody and anything else. */
export async function getDmImage(who, id, s = store(), now = Date.now()) {
  if (!forumReader(who) || !imageId(id)) return null;
  const got = await s.getWithMetadata(DM_IMG + id, { type: 'arrayBuffer' });
  const meta = got && got.metadata;
  if (!meta || typeof meta.pair !== 'string' || !meta.pair.startsWith(DM)) return null;
  if (!meta.pair.slice(DM.length).split('.').includes(dmKey(who.handle, who.since))) return null;
  const c = convDoc(await s.get(meta.pair, { type: 'json' }), now);
  if (!c.messages.some((m) => m.img === id)) return null;
  return { data: got.data, type: meta.type };
}

/* The conversation with `handle`, as the person asking is shown it:
   { handle, state, can, messages }. state is 'new', 'asked' (you asked, they
   have not answered), 'asking' (they asked you) or 'open'; can is 'yes',
   'closed', 'blocked' or 'waiting'. */
export async function readDmWith(who, handle, s = store(), now = Date.now()) {
  const p = await pairOf(who, handle, s);
  if (p.error === 'closed') return { handle: p.handle, state: 'new', can: 'closed', messages: [] };
  if (p.error) return p;
  const mine = await readDmSet(p.me, s), theirs = await readDmSet(p.them, s);
  if (blocks(mine, p.handle)) return { handle: p.handle, state: 'new', can: 'blocked', messages: [] };
  if (blocks(theirs, who.handle)) return { handle: p.handle, state: 'new', can: 'closed', messages: [] };
  const c = convDoc(await s.get(p.key, { type: 'json' }), now);
  const state = stateOf(c, p.me);
  const can = state === 'asked' ? 'waiting' : state === 'new' && !theirs.open ? 'closed' : 'yes';
  return { handle: p.handle, state, can, messages: c.messages.map((m) => shapeDm(m, p.me)) };
}

/* Everybody you are in a conversation with, the latest first: who, whether
   it is waiting and on whom, and who wrote last and when. Never how many of
   anything, and never whether you have read it. With your switch and your
   block list, which nobody else is ever shown. */
export async function listDms(who, s = store(), now = Date.now()) {
  if (!forumReader(who)) return { error: 'claim' };
  const me = dmKey(who.handle, who.since);
  const set = await readDmSet(me, s);
  const prefix = DM_MARK + me + '/';
  const out = [];
  for (const b of (await s.list({ prefix })).blobs || []) {
    const them = b.key.slice(prefix.length);
    const c = convDoc(await s.get(pairBlob(me, them), { type: 'json' }), now);
    const handle = c.people[them];
    if (!c.messages.length || typeof handle !== 'string' || blocks(set, handle)) continue;
    const last = c.messages[c.messages.length - 1];
    const row = { handle, state: stateOf(c, me), last: { handle: last.handle, t: last.t, mine: last.by === me } };
    if (row.state === 'asking') row.text = c.messages[0].text;
    out.push(row);
  }
  out.sort((a, b) => b.last.t - a.last.t || a.handle.localeCompare(b.handle));
  return { open: set.open, blocked: set.blocked.map((b) => b.handle).sort((a, b) => a.localeCompare(b)), conversations: out };
}

/* Accept a request: what they asked is the start of a conversation. */
export async function acceptDm(who, handle, s = store(), now = Date.now()) {
  const p = await pairOf(who, handle, s);
  if (p.error) return { error: 'which' };
  return updateConv(p.key, (c) => (c.messages.length && !c.open && c.from === p.them ? { ...c, open: true } : { error: 'which' }), s, now);
}

/* Reject a request: emptied, and nobody is told. */
export async function rejectDm(who, handle, s = store(), now = Date.now()) {
  const p = await pairOf(who, handle, s);
  if (p.error) return { error: 'which' };
  return updateConv(p.key, (c) => (c.messages.length && !c.open && c.from === p.them ? emptied() : { error: 'which' }), s, now);
}

/* Take one of your own messages back. The last one going leaves no
   conversation. Nobody else's: a moderator cannot reach in here. */
export async function takeDm(who, handle, id, s = store(), now = Date.now()) {
  if (typeof id !== 'string' || !DM_ID.test(id)) return { error: 'which' };
  const p = await pairOf(who, handle, s);
  if (p.error) return { error: 'which' };
  return updateConv(p.key, (c) => {
    const m = c.messages.find((x) => x.id === id);
    if (!m || m.by !== p.me) return { error: 'which' };
    const left = c.messages.filter((x) => x.id !== id);
    return left.length ? { ...c, messages: left } : emptied();
  }, s, now);
}

/* Edit one of your own messages: the channel's rule, the words replaced and
   `edited` set, the old words kept nowhere, and still gone 48 hours after it
   was SENT. */
export async function editDm(who, handle, id, text, s = store(), now = Date.now()) {
  if (typeof id !== 'string' || !DM_ID.test(id)) return { error: 'which' };
  const words = cleanLines(text, MESSAGE_MAX);
  if (words === null) return { error: 'long' };
  const p = await pairOf(who, handle, s);
  if (p.error) return { error: 'which' };
  return updateConv(p.key, (c) => {
    const i = c.messages.findIndex((x) => x.id === id);
    if (i < 0 || c.messages[i].by !== p.me) return { error: 'which' };
    // Only a picture's or a sticker's message may be left with no words.
    if (!words && !c.messages[i].img && !hasSticker(c.messages[i])) return { error: 'empty' };
    if (c.messages[i].text === words) return null;
    const messages = c.messages.slice();
    messages[i] = { ...messages[i], text: words, edited: now };
    return { ...c, messages };
  }, s, now);
}

/* React to a message in the conversation, or take yours back: the channel's
   toggle, once the conversation is accepted. 'accepted' before then, 'which'
   for a message that is not there, 'full' for one with every kind it holds. */
export async function reactDm(who, handle, id, emoji, s = store(), now = Date.now()) {
  if (typeof id !== 'string' || !DM_ID.test(id)) return { error: 'which' };
  if (!reactionOf(emoji)) return { error: 'emoji' };
  const p = await pairOf(who, handle, s);
  if (p.error) return { error: 'which' };
  return updateConv(p.key, (c) => {
    if (!c.open) return { error: 'accepted' };
    if (!c.messages.some((x) => x.id === id)) return { error: 'which' };
    const next = toggleReaction(c.messages, id, emoji, who.handle);
    return next ? { ...c, messages: next } : { error: 'full' };
  }, s, now);
}

/* Whether you take messages from anybody new. */
export async function setDmOpen(who, on, s = store()) {
  if (!forumReader(who)) return { error: 'claim' };
  return updateDmSet(dmKey(who.handle, who.since), (was) => (was.open === !!on ? null : { ...was, open: !!on }), s);
}

/* Block somebody: into your own record by name, and the conversation between
   you emptied. Nobody is told. */
export async function blockDm(who, handle, s = store(), now = Date.now()) {
  const p = await pairOf(who, handle, s);
  if (p.error === 'closed' || p.error === 'self' || p.error === 'claim') return { error: p.error === 'closed' ? 'which' : p.error };
  if (p.error) return p;
  const k = petKey(p.handle);
  const set = await updateDmSet(p.me, (was) => {
    if (was.blocked.some((b) => b.k === k)) return null;
    if (was.blocked.length >= DM_BLOCKS) return { error: 'full' };
    return { ...was, blocked: [...was.blocked, { k, handle: p.handle }] };
  }, s);
  if (set.error) return set;
  await updateConv(p.key, (c) => (c.messages.length ? emptied() : null), s, now);
  return { blocked: p.handle };
}

export async function unblockDm(who, handle, s = store()) {
  if (!forumReader(who)) return { error: 'claim' };
  const h = cleanHandle(handle);
  if (!h) return { error: 'which' };
  const k = petKey(h);
  return updateDmSet(dmKey(who.handle, who.since), (was) => (was.blocked.some((b) => b.k === k)
    ? { ...was, blocked: was.blocked.filter((b) => b.k !== k) } : null), s);
}

/* Forget me and deleting the username: your switch, your blocks, every
   conversation you are in, for both of you, and the markers. Reports stay on
   the desk for their thirty days. */
export async function forgetDms(handle, since, s = store()) {
  const me = dmKey(handle, since);
  const prefix = DM_MARK + me + '/';
  for (const b of (await s.list({ prefix })).blobs || []) {
    const them = b.key.slice(prefix.length);
    const c = await s.get(pairBlob(me, them), { type: 'json' });
    await s.delete(pairBlob(me, them));
    await dropDmImages(stored(plain(c)).map((m) => m && m.img).filter(Boolean), s);
    await s.delete(markBlob(them, me));
    await s.delete(b.key);
  }
  await s.delete(DM_SET + me);
  return true;
}

/* ── New to you: what you have read, for a claimed username ──────────────

   Ryan's ask and call, 2026-10-20, reversing "no badge, no unread count" for
   a MARK and never a number: World, This room, Your messages and each
   conversation are marked when something has been said there since you last
   read it, and the radio's Unreads lists what is new in World, the rooms you
   follow and your conversations. Ryan chose to keep what you have read ON THE
   SERVER, per claimed username, so reading on one device clears the mark on
   another, over keeping it in each browser.

   WHAT IS KEPT. Under the username's dmKey (reads/), when you last read each
   channel and each conversation, and nothing else: no list of what you read,
   no count, nothing about other people's reading, and an entry older than a
   message lives (LIFE) is dropped on every write, because nothing that old is
   left to be new. Never a room that keeps to itself: reading one is not
   recorded, because a record would be a trace of having been there. Forget me
   and deleting the username delete it. Nobody but its owner is ever sent it.

   HOW NEW IS WORKED OUT. The channels' newest messages are one small map,
   LATEST, a time per channel kept by every transmit, so the radio can be told
   what is new in World and in the room it is on without saying where it is:
   it is sent the whole map, the rooms it may enter and none that keeps to
   itself, as the World room already shows when each channel last spoke. A
   conversation is new when its newest message is the other person's and came
   after you last read it, or when somebody's first message waits for you. */
const READS = 'reads/';
const LATEST = 'channel-latest';
export const READS_ROOMS = 400;                // channels one record keeps a time for at most

function readsDoc(d, now = Date.now()) {
  d = plain(d);
  const keep = (m, ok) => Object.fromEntries(Object.entries(plain(m))
    .filter(([k, t]) => ok(k) && typeof t === 'number' && now - t < LIFE));
  return { ch: keep(d.ch, (k) => !!roomTag(k)), dm: keep(d.dm, (k) => /^[A-Za-z0-9_-]{32}$/.test(k)) };
}

/* A channel has had a new message: its time in LATEST, which never goes
   backwards and keeps nothing past LIFE. */
export async function noteLatest(tag, t, s = store(), now = Date.now()) {
  if (!roomTag(tag) || quietRoom(tag)) return false;
  await updateMap(LATEST, 'latest', (map) => {
    for (const k of Object.keys(map)) if (typeof map[k] !== 'number' || now - map[k] >= LIFE) delete map[k];
    if ((map[tag] || 0) >= t) return false;
    map[tag] = t;
  }, s);
  return true;
}

/* What is new to a claimed username: { latest, read, dms, asking }. latest is
   every channel's newest message time it may hear (World as WORLD_CALL), read
   its own last-read times, dms the handles of conversations with something new
   from the other person, and asking whether a first message waits for it. */
export async function newFor(who, s = store(), now = Date.now()) {
  if (!forumReader(who)) return { error: 'claim' };
  const me = dmKey(who.handle, who.since);
  const r = readsDoc(await s.get(READS + me, { type: 'json' }), now);
  const map = plain((await s.get(LATEST, { type: 'json' }) || {}).latest);
  const latest = {};
  for (const [tag, t] of Object.entries(map)) {
    if (typeof t !== 'number' || now - t >= LIFE || !roomTag(tag) || quietRoom(tag)) continue;
    if (tag !== WORLD_CALL && !roomAllows(who, tag)) continue;
    latest[tag] = t;
  }
  const set = await readDmSet(me, s);
  const prefix = DM_MARK + me + '/';
  const dms = [];
  let asking = false;
  for (const b of (await s.list({ prefix })).blobs || []) {
    const them = b.key.slice(prefix.length);
    const c = convDoc(await s.get(pairBlob(me, them), { type: 'json' }), now);
    const handle = c.people[them];
    if (!c.messages.length || typeof handle !== 'string' || blocks(set, handle)) continue;
    const state = stateOf(c, me);
    if (state === 'asked') continue;
    if (state === 'asking') asking = true;
    const last = c.messages[c.messages.length - 1];
    if (last.by !== me && last.t > (r.dm[them] || 0)) dms.push(handle);
  }
  dms.sort((a, b) => a.localeCompare(b));
  return { latest, read: r.ch, dms, asking };
}

/* You have read a channel (`ch`, a room's tag or WORLD_CALL) or a conversation
   (`dm`, the other person's handle) up to `t`, which never goes past now and
   never back. Never a room that keeps to itself, or one you may not enter. */
export async function markRead(who, what, t, s = store(), now = Date.now()) {
  if (!forumReader(who)) return { error: 'claim' };
  if (typeof t !== 'number' || !isFinite(t)) return { error: 'when' };
  const at = Math.min(Math.floor(t), now);
  let field, key;
  if (what && typeof what.ch === 'string') {
    const tag = roomTag(what.ch);
    if (!tag || quietRoom(tag) || (tag !== WORLD_CALL && !roomAllows(who, tag))) return { error: 'which' };
    field = 'ch'; key = tag;
  } else if (what && typeof what.dm === 'string') {
    const p = await pairOf(who, what.dm, s);
    if (p.error) return { error: 'which' };
    field = 'dm'; key = p.them;
  } else return { error: 'which' };
  const me = dmKey(who.handle, who.since);
  const out = await updateDm(READS + me, (d) => readsDoc(d, now), (was) => {
    if ((was[field][key] || 0) >= at) return null;
    if (field === 'ch' && !(key in was.ch) && Object.keys(was.ch).length >= READS_ROOMS) return { error: 'full' };
    return { ...was, [field]: { ...was[field], [key]: at } };
  }, s);
  return out.error ? out : { read: true };
}

/* Forget me, and deleting the username: the record of what was read. */
export async function forgetReads(handle, since, s = store()) {
  await s.delete(READS + dmKey(handle, since));
  return true;
}

/* ── Reports, the one way a message reaches the moderators ── */

/* Report a message the other person sent you: its words, who sent it and when,
   who reported it and their note, onto the desk. Once per message per
   reporter. Nobody is told. */
export async function reportDm(who, handle, id, note, s = store(), now = Date.now()) {
  if (typeof id !== 'string' || !DM_ID.test(id)) return { error: 'which' };
  const n = note == null ? '' : cleanLines(note, REPORT_NOTE_MAX);
  if (n === null) return { error: 'long' };
  const p = await pairOf(who, handle, s);
  if (p.error) return { error: 'which' };
  const c = convDoc(await s.get(p.key, { type: 'json' }), now);
  const m = c.messages.find((x) => x.id === id);
  if (!m || m.by === p.me) return { error: 'which' };
  const rec = { id: 'k' + randomBytes(8).toString('base64url').slice(0, 10), t: now, by: who.handle, of: m.handle,
    text: m.text, sent: m.t, msg: m.id, note: n };
  // A picture is copied onto the desk first, so no report on it is ever
  // without it; a copy whose report did not go on is deleted at once.
  if (m.img) {
    const got = await s.getWithMetadata(DM_IMG + m.img, { type: 'arrayBuffer' });
    if (got && got.metadata) {
      await s.set(REPORT_IMG + rec.id, got.data, { metadata: { t: now, type: got.metadata.type } });
      rec.img = true;
      rec.alt = m.alt || '';
    }
  }
  const next = await updateDm(REPORTS, (d) => reportsDoc(d, now), (was) => {
    if (was.reports.some((r) => r.msg === m.id && foldHandle(r.by) === foldHandle(who.handle))) return { error: 'again' };
    if (was.reports.length >= REPORT_KEEP) return { error: 'full' };
    return { reports: [...was.reports, rec] };
  }, s);
  if (next.error && rec.img) await s.delete(REPORT_IMG + rec.id);
  return next.error ? next : { reported: rec.id };
}

/* A reported picture, for the base and nobody else, while its report is on
   the desk. */
export async function reportImage(who, id, s = store(), now = Date.now()) {
  if (!who || who.role !== 'base') return null;
  if (typeof id !== 'string' || !REPORT_ID.test(id)) return null;
  if (!reportsDoc(await s.get(REPORTS, { type: 'json' }), now).reports.some((r) => r.id === id && r.img)) return null;
  const got = await s.getWithMetadata(REPORT_IMG + id, { type: 'arrayBuffer' });
  return got && got.metadata ? { data: got.data, type: got.metadata.type } : null;
}

/* The desk's list, newest first, for the base and nobody else. */
export async function readReports(who, s = store(), now = Date.now()) {
  if (!who || who.role !== 'base') return null;
  const d = reportsDoc(await s.get(REPORTS, { type: 'json' }), now);
  return d.reports.slice().reverse().map((r) => ({ id: r.id, t: r.t, by: r.by, of: r.of, text: r.text, sent: r.sent, note: r.note || '',
    ...(r.img ? { img: true, alt: r.alt || '' } : {}) }));
}

/* A moderator closes a report: it is deleted. */
export async function closeReport(who, id, s = store(), now = Date.now()) {
  if (!who || who.role !== 'base') return { error: 'base' };
  if (typeof id !== 'string' || !REPORT_ID.test(id)) return { error: 'which' };
  const out = await updateDm(REPORTS, (d) => reportsDoc(d, now), (was) => (was.reports.some((r) => r.id === id)
    ? { reports: was.reports.filter((r) => r.id !== id) } : { error: 'which' }), s);
  if (!out.error) await s.delete(REPORT_IMG + id);
  return out;
}

/* Hourly: every conversation with nothing left in it, every marker with no
   conversation behind it, and every report past its thirty days. */
export async function sweepDms(s = store(), now = Date.now()) {
  let any = false;
  const live = new Set();
  for (const b of (await s.list({ prefix: DM })).blobs || []) {
    if (convDoc(await s.get(b.key, { type: 'json' }), now).messages.length) { live.add(b.key); continue; }
    await s.delete(b.key);
    any = true;
  }
  for (const b of (await s.list({ prefix: DM_MARK })).blobs || []) {
    const [me, them] = b.key.slice(DM_MARK.length).split('/');
    if (them && live.has(pairBlob(me, them))) continue;
    const d = await s.get(b.key, { type: 'json' });
    if (d && typeof d.t === 'number' && now - d.t < MARK_GRACE) continue;
    await s.delete(b.key);
    any = true;
  }
  const raw = await s.get(REPORTS, { type: 'json' });
  if (raw && reportsDoc(raw, now).reports.length !== (plain(raw).reports || []).length) {
    await updateDm(REPORTS, (d) => reportsDoc(d, now), (was) => was, s);
    any = true;
  }
  // A conversation's picture no live message holds, once past the hour an
  // upload is given to be sent; a reported picture whose report has gone.
  const held = new Map();
  for (const b of (await s.list({ prefix: DM_IMG })).blobs || []) {
    const id = b.key.slice(DM_IMG.length);
    const got = await s.getWithMetadata(b.key, { type: 'arrayBuffer' });
    const meta = (got && got.metadata) || {};
    if (typeof meta.t === 'number' && now - meta.t < IMG_UNSENT) continue;
    if (typeof meta.pair === 'string' && meta.pair.startsWith(DM)) {
      if (!held.has(meta.pair)) held.set(meta.pair, new Set(convDoc(await s.get(meta.pair, { type: 'json' }), now).messages.map((m) => m.img).filter(Boolean)));
      if (held.get(meta.pair).has(id)) continue;
    }
    await s.delete(b.key);
    any = true;
  }
  const onDesk = new Set(reportsDoc(await s.get(REPORTS, { type: 'json' }), now).reports.filter((r) => r.img).map((r) => r.id));
  for (const b of (await s.list({ prefix: REPORT_IMG })).blobs || []) {
    if (onDesk.has(b.key.slice(REPORT_IMG.length))) continue;
    const got = await s.getWithMetadata(b.key, { type: 'arrayBuffer' });
    const t = got && got.metadata && got.metadata.t;
    if (typeof t === 'number' && now - t < IMG_UNSENT) continue;
    await s.delete(b.key);
    any = true;
  }
  return any;
}

/* ── Pictures on the channel ─────────────────────────────────────────── */

/* A PICTURE IS PART OF ITS MESSAGE AND GOES WHEN THE MESSAGE GOES. Ryan,
   2026-09-29: screenshots and photos on the CB, which stay on the channel and
   never go onto the street, so none of the street's rules for published
   photographs apply to them. What does apply is the channel's own promise:
   a picture is deleted the moment its message leaves, whether it was pushed off
   by a newer one, taken off, or swept at its 48 hours, and one that was
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
   (where the GPS lives), XMP, a JPEG's Photoshop block (IPTC, where a photo
   app writes a place name), or a PNG's eXIf/tEXt chunks. WebKit's canvas
   writes an Exif and a Photoshop block of its own, so redraw() in cb.js takes
   both off before a picture leaves the browser. */
export function carriesMetadata(b, kind) {
  const text = Buffer.from(b.subarray(0, Math.min(b.length, 131072))).toString('latin1');
  if (kind === 'image/jpeg') return /\xff\xe1..Exif\x00|\xff\xe1..http:\/\/ns\.adobe\.com\/xap|\xff\xed..Photoshop 3\.0\x00/s.test(text);
  if (kind === 'image/png') return /eXIf|iTXtXML:com\.adobe\.xmp|tEXt/.test(text);
  if (kind === 'image/webp') return /EXIF|XMP /.test(text);
  return true;
}

/* Whether a picture may go, on the channel or in a conversation: { kind } or
   { error }, in words for the sender. One check, so the two cannot differ. */
export function pictureCheck(bytes) {
  if (!bytes || !bytes.length) return { error: 'There was no picture in that.' };
  if (bytes.length > IMG_MAX) return { error: 'That picture is too big to send, even after the radio made it smaller.' };
  const kind = imageKind(bytes);
  if (!kind) return { error: 'That is not a picture the radio can send.' };
  if (carriesMetadata(bytes, kind)) return { error: 'That picture still carries its camera data. Send it through the radio, which takes that off.' };
  return { kind };
}

export async function putImage(who, room, bytes, s = store(), now = Date.now()) {
  const checked = pictureCheck(bytes);
  if (checked.error) return { error: checked.error };
  const kind = checked.kind;
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
   upload is given to be sent. A read never returns a message past its 48
   hours, so its picture is held by nothing and goes on the next sweep. */
export async function sweepImages(s = store(), now = Date.now()) {
  const held = new Set();
  const keys = [KEY, ...((await s.list({ prefix: ROOM_TALK })).blobs || []).map((b) => b.key)];
  for (const key of keys) for (const m of (await readLog(key, s, now)).messages) if (m.img) held.add(m.img);
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
   radio can tune to, and what is said on it goes after 48 hours like every
   other. */
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

export function readRoomTalk(room, s = store(), now = Date.now()) { return readLog(ROOM_TALK + room, s, now); }
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
  /* A room that keeps to itself (QUIET_ROOMS, below) can be locked as well, and
     the cabin behind the door marked E is: Ryan, 2026-10-07, "Restrict the CB in
     the cabin to admins." Its door and its inside take the administrator role
     and nothing else, so its channel, its call, Be seen here and its hosts are
     the administrators' and nobody else's. tools/make-secret-cabin.py holds the
     pages to this, as tools/make-town-hall.py holds the Town Hall's. */
  'the-secret-cabin': ['administrator'],
  'lydtyss': ['administrator'],
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
/* The World room's channel IS the World channel (Ryan, 2026-10-18), so a room
   named for the World call is World here too, and never a second channel. */
export function readTuned(room, s = store()) { return room && room !== WORLD_CALL ? readRoomTalk(room, s) : readChannel(s); }
export function updateTuned(room, change, s = store()) { return room && room !== WORLD_CALL ? updateRoomTalk(room, change, s) : updateChannel(change, s); }

/* Hourly, with the World channel's sweep: everything said on a room's channel
   more than 48 hours ago, and the room's blob once nothing is left in it. */
export async function sweepRoomTalk(s = store(), now = Date.now()) {
  let any = false;
  for (const b of (await s.list({ prefix: ROOM_TALK })).blobs || []) any = (await sweepLog(b.key, s, now)) || any;
  return any;
}

/* ── Calls ─────────────────────────────────────────────────────────────── */

/* Our JaaS App ID. Not a secret: it is in every call's address. The private key
   and its id are, and they live in Netlify's environment, never here. */
export const JAAS_APP = 'vpaas-magic-cookie-7c4c52a95081498db34c04fcdadc50a2';
export const JAAS_HOST = 'https://8x8.vc/';
export const CALL_HOURS = 4;               // a token lets you (re)join for this long
export const callRoom = (tag) => `stimpunks-${tag}`;

/* THE WORLD CALL. Ryan, 2026-10-13: a call for the whole street, joined from
   any room with Join World call on the radio, as the World channel is heard
   from any room. It is a call like a room's in every way, under this name,
   which is why no page may ever be called world.html: make-sitemap.py refuses
   one, and refuses cb.js's copy of this name if it ever differs. Not public:
   a guest with no CB pass gets no token for it (publicCall), and nobody is
   shown who is in it before they join; Who's online names it while somebody
   is (callsOn). */
export const WORLD_CALL = 'world';

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
/* And the YouTube list the film is one of, when the host is playing a list
   (Helen Edgar hosting an album at the Hermitage, 2026-10-20). It is how a
   follower's radio finds that list's own play button and moves along it with
   the host, rather than taking each new film in it for a film of its own. Only
   the shape is checked; a mix (RD…) never arrives, because love-embed.js does
   not give one, each listener's being their own. */
export function cleanList(v) { return typeof v === 'string' && /^[A-Za-z0-9_-]{10,64}$/.test(v) && !/^RD/.test(v) ? v : null; }
/* And how long the film runs, as the host's player reports it, so a radio
   that has to put the film's play button up for somebody (a moderator's video
   pasted into the radio has no button of its own on anybody else's page) can
   say how long before the press, like every play button on the street. */
/* A LIVE VIDEO IS HOSTED TOO (Ryan, 2026-10-17, so people can be told when
   one is being screened). It has no place and no length, so its beacon says
   live instead: at is 0 and length null whatever the radio sent, and a radio
   offers Catch up to get its play button ready, never Follow, because there
   is nothing in a live video to keep in step with. */
export async function hostBeacon(who, room, film, at, playing, s = store(), now = Date.now(), video = null, length = null, live = false, playlist = null) {
  if (!roomAllows(who, room)) return { closed: true };
  live = live === true;
  let held = null;
  const beacons = await updateBeacons((list) => {
    held = null;
    const there = list.find((b) => b.room === room);
    if (there && there.handle !== who.handle && who.role !== 'base') { held = there.handle; return null; }
    return list.filter((b) => b.room !== room)
      .concat({ room, handle: who.handle, base: who.role === 'base', film, video: cleanVideo(video), list: live ? null : cleanList(playlist),
        length: live ? null : cleanAt(length) || null, at: live ? 0 : at, live, playing: !!playing, t: now });
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
  return list.filter((b) => (!who || roomAllows(who, b.room)) && (!quietRoom(b.room) || b.room === tuned)).map((b) => ({ room: b.room, handle: b.handle, base: !!b.base, film: b.film, video: b.video || null, list: b.list || null, length: b.length || null, at: b.at, live: !!b.live, playing: !!b.playing, t: b.t }));
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
    // since: when the username was claimed, which the forums fold into the
    // mark on every post (authorMark), so that a name claimed again after its
    // owner deleted it is a different author. It is never sent anywhere.
    if (kind === 'base') return { role: 'base', handle: on.handle, roles: on.roles, account: true, since: acct.since };
    return { role: 'mobile', handle: acct.handle, roles: new Set(), account: true, since: acct.since };
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

/* Whether a handle is a moderator's. The desk will not reset or delete one,
   or clear its card: a reset code for a moderator's username would let one moderator sign on as
   another, with the other's roles, which is the reason for moving moderators
   onto passwords of their own in the first place. */
export function isMod(handle, mods = readMods()) {
  return !!(mods && mods.has(foldHandle(handle)));
}

/* ── Accounts: a username you claim, with a password of your own ───────── */

/* Ryan's calls, 2026-09-30: a Profile on the CB where you can claim your
   username and set your own password; no email; a recovery code shown once
   when you claim; moderators can reset a password, delete an account or
   clear its profile card, in the Moderators' room. Claiming is optional and only possible while signed
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

/* Delete an account, its pets, its avatars, its chimeras, its jobs, its patches, its profile and its sets, its props and its messages. The username is free again. */
export async function deleteAccount(handle, s = store()) {
  const acct = await readAccount(handle, s);
  if (!acct) return { error: 'That username has not been claimed.' };
  await forgetPets(petKey(handle), s);
  await forgetAvatars(petKey(handle), s);
  await forgetChimeras(petKey(handle), s);
  await forgetJobs(petKey(handle), s);
  await forgetPatches(petKey(handle), s);
  await forgetProfile(petKey(handle), s);
  await forgetProfileSets(petKey(handle), s);
  await forgetTaskViews(petKey(handle), s);
  await forgetProps(petKey(handle), s);
  await forgetDms(acct.handle, acct.since, s);
  await forgetReads(acct.handle, acct.since, s);
  await dropDevicesOf(handle, s);
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
export function cleanBrassBody(v, max = BRASS_BODY_MAX) {
  const t = String(v == null ? '' : v)
    .replace(/\r\n?/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g, ' ')
    .split('\n').map((line) => line.replace(/[  ]+$/, '')).join('\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/^\n+|\n+$/g, '');
  return t.trim() && [...t].length <= max ? t : null;
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
    // An address with nothing after its // (as in "starting with https:// ")
    // stays words; reading it as one threw, and the whole post with it.
    const bare = (c === 'h' || c === 'H') && !/[\w/]$/.test(buf) ? /^https?:\/\/[^\s<>]+/i.exec(src.slice(i)) : null;
    if (bare) {
      const m = bare[0].replace(/[.,;:!?'")\]]+$/, '');
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
function brassBlocks(lines, depth = 0, ctx = null) {
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
      out.push({ t: 'quote', c: depth < 8 ? brassBlocks(body, depth + 1, ctx) : [{ t: 'p', c: brassInline(body.join('\n')) }] });
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
      const items = [], boxes = [];
      const start = ordered ? parseInt(m[2], 10) : 1;
      while (i < lines.length) {
        const it = LIST_ITEM.exec(lines[i]);
        if (!it || /\d/.test(it[2]) !== ordered) break;
        const indent = it[1].length + it[2].length + it[3].length;
        const body = [it[4]];
        // A checkbox, "- [ ]" or "- [x]", where the caller asks for them (tasks): numbered in the order it is met.
        const bx = ctx && /^\[([ xX])\](?: +(.*)|$)/.exec(it[4]);
        if (bx) { body[0] = bx[2] || ''; boxes.push({ n: ctx.boxes.length, on: bx[1] !== ' ', raw: (bx[2] || '').trim() }); ctx.boxes.push((bx[2] || '').trim()); }
        else boxes.push(null);
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
        items.push(depth < 8 ? brassBlocks(body, depth + 1, ctx) : [{ t: 'p', c: brassInline(body.join('\n')) }]);
        while (i < lines.length && !lines[i].trim() && i + 1 < lines.length && LIST_ITEM.test(lines[i + 1])) i++;
      }
      const list = ordered ? { t: 'ol', start, items } : { t: 'ul', items };
      if (boxes.some(Boolean)) list.box = boxes;
      out.push(list);
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !(para.length && isBlockStart(lines[i]))) para.push(lines[i++].trim());
    out.push({ t: 'p', c: brassInline(para.join('\n')) });
  }
  return out;
}

export function parseBrass(body, opts = null) {
  return brassBlocks(String(body || '').split('\n'), 0, opts && opts.boxes ? { boxes: [] } : null);
}

/* A task's checkboxes, two ways: the reader's, in the order they are drawn,
   and a plain scan of the lines, which is what a tick changes. A tick is only
   offered where the two agree, box for box and word for word, so a box can
   never be drawn in one place and ticked in another; where they disagree (a box
   in a code block, an item indented past what the reader takes), the boxes are
   drawn and the description is the way to change them. */
const BOX_LINE = /^((?:[ \t]*>)*[ \t]*(?:[-*+]|\d{1,9}[.)]) +)\[([ xX])\](?= |$)/;
export function taskBoxes(body) {
  const text = String(body || ''), lines = text.split('\n'), ctx = { boxes: [] }, found = [];
  brassBlocks(lines, 0, ctx);
  let fence = null;
  lines.forEach((line, k) => {
    const f = /^(?:[ \t]*>)*[ \t]*(```|~~~)/.exec(line);
    if (f) { fence = fence === null ? f[1] : (fence === f[1] ? null : fence); return; }
    if (fence) return;
    const m = BOX_LINE.exec(line);
    if (m) found.push({ k, at: m[1].length, raw: line.slice(m[1].length + 3).trim() });
  });
  const agree = found.length === ctx.boxes.length && found.every((b, j) => b.raw === ctx.boxes[j]);
  return { agree, lines, found };
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

/* ── The suggestion box ───────────────────────────────────────────────────

   The Sandbox. Ryan's brief, 2026-10-13: in its suggestion box,
   anybody signed on to the CB can post a suggestion, a feature request or a bug
   report, and a moderator marks it done or not doing, with a reply. It is the
   Brass Tacks Board turned round: anybody reads it, anybody signed on writes on
   it, and the moderators answer.

   ONE BLOB HOLDS EVERY SUGGESTION (`suggestions`, newest first), written with
   the boards' conditional write, and SUGGEST_KEEP at most: a full box refuses
   the next one and says so, rather than quietly pushing the oldest out. A
   suggestion is kept until it is taken down, by whoever posted it (the CB's own
   rule for a message, canTakeOff) or by any moderator. There is no other copy.

   THE HANDLE IS ON THE SUGGESTION, PUBLIC, and so is the moderator's on the
   reply, so anybody can see who asked and who answered. The marks beside them
   come from the pass, as on the channel: BASE for a moderator, CLAIMED for a
   claimed username, and nobody can set either on a suggestion themselves.

   THE WORDS ARE THE BOARD'S MARKDOWN, read here once into nodes by parseBrass,
   never into HTML, and built on the page with textContent. No pictures: a bug
   report with a screenshot is a picture of somebody's screen, and that is a
   consent question nobody has asked yet. */
export const SUGGEST_KINDS = ['suggestion', 'feature', 'bug'];
export const SUGGEST_TITLE_MAX = 120;
export const SUGGEST_BODY_MAX = 4000;
export const SUGGEST_REPLY_MAX = 2000;
export const SUGGEST_KEEP = 300;
const SUGGEST = 'suggestions';

function cleanSuggestBody(v, max) {
  const t = cleanBrassBody(v);
  return t && [...t].length <= max ? t : null;
}

/* Every suggestion, newest first. */
export async function readSuggestions(s = store()) {
  const d = await s.get(SUGGEST, { type: 'json' });
  return (d && Array.isArray(d.items)) ? d.items : [];
}

export function shapeSuggestion(p) {
  const out = { id: p.id, kind: p.kind, title: p.title, body: p.body, ast: parseBrass(p.body),
    handle: p.handle, t: p.t, status: p.answer ? p.answer.status : 'open' };
  if (p.base) out.base = true;
  else if (p.claimed) out.claimed = true;
  if (p.answer) {
    out.answer = { status: p.answer.status, body: p.answer.body, ast: parseBrass(p.answer.body),
      handle: p.answer.handle, t: p.answer.t };
  }
  return out;
}

/* Anybody signed on, dropping one in. { item } or { error }. */
export async function addSuggestion(who, f, s = store(), now = Date.now()) {
  if (!who) return { error: 'Sign on to the CB to drop a suggestion in the box.' };
  const kind = f && SUGGEST_KINDS.includes(f.kind) ? f.kind : null;
  if (!kind) return { error: 'Say whether it is a suggestion, a feature request or a bug report.' };
  const title = cleanBrassTitle(f.title);
  if (!title) return { error: `Give it a title, up to ${SUGGEST_TITLE_MAX} characters.` };
  const body = cleanSuggestBody(f.body, SUGGEST_BODY_MAX);
  if (!body) return { error: `Say a bit more about it, up to ${SUGGEST_BODY_MAX} characters.` };
  const item = { id: randomUUID(), kind, title, body, handle: who.handle, t: now };
  if (who.role === 'base') item.base = true;
  else if (who.account) item.claimed = true;
  let full = false;
  await updateList(SUGGEST, 'items', (list) => {
    full = list.length >= SUGGEST_KEEP;
    return full ? null : [item, ...list];
  }, s);
  if (full) return { error: 'The box is full. A moderator has to take some answered ones down before another fits.' };
  return { item };
}

/* A moderator answering: done or not doing, with a reply; or open again,
   which takes the answer off. Answering again replaces the answer. */
export async function answerSuggestion(who, id, f, s = store(), now = Date.now()) {
  if (!who || who.role !== 'base') return { error: 'Only a moderator can answer a suggestion.' };
  const status = f && ['done', 'denied', 'open'].includes(f.status) ? f.status : null;
  if (!status) return { error: 'Mark it done, not doing, or still open.' };
  let reply = null;
  if (status !== 'open') {
    reply = cleanSuggestBody(f.reply, SUGGEST_REPLY_MAX);
    if (!reply) return { error: `Say why, in a reply of up to ${SUGGEST_REPLY_MAX} characters: whoever asked will read it.` };
  }
  let found = false, done = null;
  await updateList(SUGGEST, 'items', (list) => {
    found = false; done = null;
    const k = list.findIndex((p) => p.id === id);
    if (k < 0) return null;
    found = true;
    const next = { ...list[k] };
    if (status === 'open') delete next.answer;
    else next.answer = { status, body: reply, handle: who.handle, t: now };
    done = next;
    const copy = list.slice(); copy[k] = next; return copy;
  }, s);
  if (!found) return { error: 'That suggestion has been taken down.' };
  return { item: done };
}

/* Taking one down: whoever posted it, under canTakeOff's rule, or any moderator. */
export async function removeSuggestion(who, id, s = store()) {
  if (!who) return { error: 'Sign on to the CB to take a suggestion down.' };
  let why = null, gone = false;
  await updateList(SUGGEST, 'items', (list) => {
    why = null; gone = false;
    const p = list.find((x) => x.id === id);
    if (!p) { why = 'That suggestion has already been taken down.'; return null; }
    if (!canTakeOff(who, p)) { why = 'Only whoever posted it, or a moderator, can take it down.'; return null; }
    gone = true;
    return list.filter((x) => x.id !== id);
  }, s);
  return gone ? { removed: true } : { error: why };
}

/* ── The forums ───────────────────────────────────────────────────────────

   Ryan's brief, 2026-10-18: a bulletin board after Discourse, for discussions
   that need to last longer than the CB's two days, in categories after the channels
   of our Stoat and Discord, so that the CB and the forums together can let us
   leave both. Ryan's calls the same day: a topic stays three months after its
   last post unless its category says a week, six months or never; only a
   claimed username can read them; categories can be kept to CB roles for staff
   areas; anybody's messages on a channel can be copied into a topic, under the
   house norm of asking everybody first, and each sender can take their own
   back out; and a link on a line of its own is previewed by this server
   reading the page once, when the post is made.

   ONE BLOB PER TOPIC (`forum/t/<id>`), holding its title, its category and
   every post, and ONE INDEX PER CATEGORY (`forum/c/<slug>`), a list of
   summaries the topic lists are drawn from. Both are written with the boards'
   conditional write. The index is a cache of the topics: the hourly sweep puts
   back a summary whose write was lost and drops one whose topic has gone, so a
   stop between the two writes loses nothing.

   ONLY A CLAIMED USERNAME, AND NOTHING ABOUT WHO READS. Every function here
   refuses a pass that is not a claimed username's (forumReader). Nothing is
   kept about reading: no views, no read positions, no unread counts, nobody
   counted. A category somebody's roles do not reach is never sent to them.

   A TOPIC GOES AT ITS CATEGORY'S KEEP AFTER ITS LAST POST, worked out every
   time it is read (topicLive), so a topic is gone at its date whether or not
   the sweep has got to it, the channel's own rule with months in it. A
   pinned topic is kept while it is pinned, and its clock starts again when it
   is unpinned.

   EVERY POST CARRIES A MARK OF THE CLAIMED USERNAME THAT WROTE IT (authorMark:
   a hash of the folded name and when it was claimed), never sent to anybody.
   It is how only its author edits or takes a post down: a name deleted and
   claimed again by somebody else is a different mark. The handle on the post
   is shown; the mark is not.

   A LINK ON A LINE OF ITS OWN IS PREVIEWED, ONCE, WHEN THE POST IS MADE OR
   EDITED, by safeGet: http or https only, to a public address only (the
   address is checked as it is looked up, every redirect again), a few seconds
   and a few hundred kilobytes at most, and no picture. A page keeps its title,
   description and site name; a YouTube video its title, channel, length and
   whether it may be framed, so it is a press-to-play facade with its runtime
   like every other on the street, or a door; a room on the street keeps only
   its address, and the page draws its name from cb-rooms.json. Nothing is
   fetched when somebody reads a post.

   MESSAGES COPIED FROM THE CB ARE COPIED HERE, FROM THE CHANNEL ITSELF
   (cbTranscript), so the handles, marks, times and words are exactly as sent
   and nobody can quote somebody else into saying anything. Words only. Whoever
   sent a copied message can take it out under canTakeOff, the channel's own
   rule, and a moderator can. Nothing is copied out of a quiet room, and out of
   a private room only into a category no wider than it.

   PICTURES AND FILES, Ryan's call, 2026-10-18, reversing "words only". A
   picture is redrawn in the writer's browser by the radio's one redraw before
   it is sent, which takes off everything a camera wrote into it, GPS first,
   and is refused here if it still carries any of it. A file goes up as it is,
   and only as one of FORUM_FILE_TYPES, checked by its first bytes and not only
   its name: never a picture (which must come as a picture, to lose its
   camera's data), never a script, a web page or an SVG, never a document with
   macros in it. An upload waits under forum-up/ until a post takes it, and is
   swept after a day if none does; a post's own are copied to
   forum-file/<topic>/<id> before the topic is written, and are deleted when
   the post, the topic or the edit lets go of them. They have no public
   address: each is served, with the pass, only to somebody who can read a
   topic a post in which holds it (forumFile), so moving a topic moves who can
   fetch them, and a post taken down takes its files out of reach at once.

   @MENTIONS, Ryan's call, 2026-10-18, reversing "no notifications" for the
   forums. A post keeps the handles it mentions (at): the ones its writer
   picked, and the topic's own people, each only if mentions() finds it in the
   words, so a reader's page can draw them. Nothing else is kept about a
   mention: who has been mentioned where is worked out on every read
   (forumMentions), and a mention notifies only a device that switched on
   When somebody @mentions me and whose pass can read the category now
   (notifyForum, with the notifications).

   A WIKI'S DOCUMENTS ARE EDITED BY ITS ROLES, WHOEVER WROTE THEM. Ryan's
   call, 2026-10-19: support docs as living documents that several people
   keep up to date, in a Wiki category that never expires, where moderators
   and above edit any of them. A document is the post that opens a topic in a
   category whose `wiki` names roles (forumEditor), and those roles edit it and
   its title. Everywhere else, and on every reply in a wiki, only a post's
   author edits it: the channel's rule that putting words in somebody's mouth
   is nobody's. A document edited by anybody says on it who edited it last
   (editedBy), and goes only with its topic, so a reply never becomes one.

   TEAM DOCS, Ryan's ask, 2026-10-20, moving the team's documents out of
   Google Docs: A CATEGORY CAN STAND IN ANOTHER (`parent`), and is its
   parent's in everything but its name, its words and what it holds, which
   tools/make-forum.py writes down from the parent; one marked a shelf holds
   categories and no topics; one filed by `years` has a category for every
   year from its first to this one, made here as each year begins
   (forumCategories); and one marked `templates` holds the topics a new topic
   can start from (forumTemplates). A category's page lists every topic in it
   and under it. A PICTURE CAN STAND IN THE WORDS, where the post writes
   ![what it shows](pic:<id>) for one of its own pictures (placePictures), and
   a wiki's document holds a screenshot for every step of a how-to.

   NOTHING ANYBODY TYPES IS LOGGED, here as everywhere in this file. */
export const FORUM_TITLE_MAX = 120;
export const FORUM_BODY_MAX = 20000;
export const FORUM_DOC_BODY_MAX = 150000; // a wiki's document: a long Google Doc, or a board meeting's minutes with their transcript
export const FORUM_POSTS_MAX = 400;     // posts in one topic; past it, start a new one
export const FORUM_TOPICS_MAX = 2000;   // topics in one category; a full one refuses, it never pushes the oldest out
export const FORUM_PREVIEWS = 5;        // links previewed in one post
export const FORUM_LATEST = 60;         // topics on one page of a list
export const FORUM_SEARCH_MAX = 400;    // topics one search reads, newest first
export const FORUM_KEEPS = ['1 week', '3 months', '6 months', 'never'];
export const FORUM_ATTACH_MAX = 6;      // pictures and files on one post
export const FORUM_DOC_ATTACH_MAX = 30; // on a wiki's document, a how-to with a screenshot for each step
export const FORUM_TEMPLATES_MAX = 60;  // templates one reader is offered
export const FORUM_FILE_MAX = 5000000;  // bytes in a file; a picture is IMG_MAX, after the browser has redrawn it
export const FORUM_NAME_MAX = 120;      // characters of a file's name
export const FORUM_ALT_MAX = 600;       // characters of a picture's description, which is offered and never required
export const FORUM_AT_MAX = 10;         // handles one post keeps as mentioned
const FORUM_CAT = 'forum/c/';
const FORUM_TOPIC = 'forum/t/';
const FORUM_UP = 'forum-up/';           // an upload no post has taken yet
const FORUM_FILE = 'forum-file/';       // forum-file/<topic>/<id>, a post's own
const FORUM_UNSENT = 24 * 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

/* What a file may be, by the end of its name, and what its first bytes must
   say it is. A picture is never one of these: it comes as a picture. */
export const FORUM_FILE_TYPES = {
  pdf: { type: 'application/pdf', is: 'pdf' },
  txt: { type: 'text/plain', is: 'text' },
  md: { type: 'text/markdown', is: 'text' },
  csv: { type: 'text/csv', is: 'text' },
  rtf: { type: 'application/rtf', is: 'rtf' },
  docx: { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', is: 'zip' },
  xlsx: { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', is: 'zip' },
  pptx: { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', is: 'zip' },
  odt: { type: 'application/vnd.oasis.opendocument.text', is: 'zip' },
  ods: { type: 'application/vnd.oasis.opendocument.spreadsheet', is: 'zip' },
  odp: { type: 'application/vnd.oasis.opendocument.presentation', is: 'zip' },
  epub: { type: 'application/epub+zip', is: 'zip' },
};

/* forum:categories:begin -- written by tools/make-forum.py from data/forum.json. Do not hand-edit. */
export const FORUM_DEFAULT_KEEP = "3 months";
export const FORUM_CATEGORIES = [
  {"slug": "announcements", "name": "Announcements", "about": "News from the people who run Stimpunks. Only moderators start a topic here; anybody can reply.", "group": "Information", "keep": "6 months", "see": null, "start": ["moderator"]},
  {"slug": "introductions", "name": "Introductions", "about": "Say hello, if you like, and say as much or as little as you want to. Reading along is a fine way to belong too.", "group": "Information", "keep": "6 months", "see": null, "start": null},
  {"slug": "help-desk", "name": "Help desk", "about": "When something on the street, the CB or the forums does not work, or you cannot find your way.", "group": "Information", "keep": "3 months", "see": null, "start": null},
  {"slug": "wiki", "name": "Wiki", "about": "How to do things on the street, the CB and the forums, one thing to a page. Every page is a living document that our moderators keep up to date, whoever started it. Something wrong or missing? Reply on the page, or ask in the Help desk.", "group": "Information", "keep": "never", "see": null, "start": ["moderator"], "wiki": ["moderator"]},
  {"slug": "watering-hole", "name": "The watering hole", "about": "Chat about anything, share penguin pebbles, pass the time. The CB for the things that need longer than two days, but not much longer.", "group": "Community", "keep": "1 week", "see": null, "start": null},
  {"slug": "coping", "name": "Coping", "about": "For the hard days, and for getting through them together. Say what is going on and be met where you are; nobody has to fix anything, and nobody has to answer. What is said here stays here.", "group": "Community", "keep": "1 week", "see": null, "start": null},
  {"slug": "events", "name": "Events", "about": "What is coming up, and what happened: our calls, campfires, watch-togethers and anything else worth turning up for.", "group": "Community", "keep": "3 months", "see": null, "start": null},
  {"slug": "mutual-aid", "name": "Mutual aid", "about": "To give help and to get it. Nobody owes anybody here.", "group": "Community", "keep": "3 months", "see": null, "start": null},
  {"slug": "show-your-work", "name": "Show your work", "about": "What you are making, writing, learning or fixing, finished or not.", "group": "Community", "keep": "3 months", "see": null, "start": null},
  {"slug": "work-opportunities", "name": "Work opportunities", "about": "Jobs, gigs, calls for contributors and paid chances to do the work.", "group": "Community", "keep": "3 months", "see": null, "start": null},
  {"slug": "discourse", "name": "Discourse", "about": "The news, ideas and arguments of the day, and what they mean for us. Disagree well: nobody has to win, and nobody has to take part.", "group": "Community", "keep": "3 months", "see": null, "start": null},
  {"slug": "pets", "name": "Pets", "about": "Your animals: pictures, stories, worries and questions. Animals adopted from the street's shelters are welcome here too.", "group": "Community", "keep": "3 months", "see": null, "start": null},
  {"slug": "props-and-gratitude", "name": "Props & Gratitude", "about": "Thank somebody out loud for something they did, big or small. Nobody is ranked, and nobody has to be thanked to belong.", "group": "Community", "keep": "3 months", "see": null, "start": null},
  {"slug": "infodumps", "name": "Infodumps", "about": "Tell us everything about the thing you love. Long is welcome.", "group": "Interests", "keep": "3 months", "see": null, "start": null},
  {"slug": "reading-watching-listening", "name": "Reading, watching, listening, playing", "about": "Books, films, shows, music, podcasts and games: what you are into and what you would pass along.", "group": "Interests", "keep": "3 months", "see": null, "start": null},
  {"slug": "education", "name": "Education", "about": "Learning, schooling, unschooling and the places in between, and what they do to the people in them.", "group": "Interests", "keep": "3 months", "see": null, "start": null},
  {"slug": "science-and-making", "name": "Science and making", "about": "Experiments, tinkering, crafts, code and anything built with your hands or your head.", "group": "Interests", "keep": "3 months", "see": null, "start": null},
  {"slug": "nature", "name": "Nature", "about": "Plants, animals, weather, places outdoors, and the ground you are standing on.", "group": "Interests", "keep": "3 months", "see": null, "start": null},
  {"slug": "artificial-intelligence", "name": "Artificial Intelligence", "about": "Learning, making and knowledge gardening with generative AI, and the arguments about it.", "group": "Interests", "keep": "3 months", "see": null, "start": null},
  {"slug": "operations", "name": "Operations", "about": "The work of running Stimpunks, out in the open, with room for anybody who wants to watch and learn.", "group": "Teams", "keep": "3 months", "see": null, "start": null},
  {"slug": "editorial", "name": "Editorial", "about": "What we publish and how: drafts, edits, ideas for pages and the glossary.", "group": "Teams", "keep": "3 months", "see": null, "start": null},
  {"slug": "moderators", "name": "Moderators", "about": "For our moderators: anything about keeping the street and the CB a good place to be.", "group": "Staff", "keep": "6 months", "see": ["moderator"], "start": null},
  {"slug": "team-docs", "name": "Team Docs", "about": "The team’s own documents, which used to live in Google Docs: how we do things, notes, the minutes of our meetings, and the templates they start from. For moderators and above, and every document here is any of them to keep up to date.", "group": "Staff", "keep": "never", "see": ["moderator"], "start": null, "wiki": ["moderator"], "shelf": true},
  {"slug": "field-guide", "name": "Field Guide", "about": "How we do things, one thing to a page, with screenshots in the flow of the words where they help.", "group": "Staff", "keep": "never", "see": ["moderator"], "start": null, "wiki": ["moderator"], "parent": "team-docs"},
  {"slug": "notes", "name": "Notes", "about": "Notes worth keeping: research, drafts, plans and ideas that are not a Field Guide page or a meeting’s minutes.", "group": "Staff", "keep": "never", "see": ["moderator"], "start": null, "wiki": ["moderator"], "parent": "team-docs"},
  {"slug": "meeting-minutes", "name": "Meeting Minutes", "about": "The minutes of our meetings, filed by the year each meeting was held.", "group": "Staff", "keep": "never", "see": ["moderator"], "start": null, "wiki": ["moderator"], "parent": "team-docs", "shelf": true, "years": 2024},
  {"slug": "templates", "name": "Templates", "about": "What new documents start from. Start a topic anywhere you can see this and pick one under Start from a template, which copies its title and words in for you to fill. Editing a template changes what the next topic starts from, never one already started. A pinned topic here is a read-me, not a template.", "group": "Staff", "keep": "never", "see": ["moderator"], "start": null, "wiki": ["moderator"], "parent": "team-docs", "templates": true},
  {"slug": "directors", "name": "Directors", "about": "For our directors, as the Directors' room off the Town Hall is.", "group": "Staff", "keep": "6 months", "see": ["director"], "start": null},
  {"slug": "board", "name": "Board", "about": "For the board, and the directors who join its meetings, as the Board room off the Town Hall is.", "group": "Staff", "keep": "6 months", "see": ["board", "director"], "start": null},
  {"slug": "back-office-operations", "name": "Back Office Operations", "about": "For the directors and the board: the paperwork, systems, filings and contracts that keep Stimpunks running behind the scenes.", "group": "Staff", "keep": "6 months", "see": ["director", "board"], "start": null},
  {"slug": "grantmaking", "name": "Grantmaking", "about": "For the directors and the board: the grants we make, the requests that come in, and how they are decided.", "group": "Staff", "keep": "6 months", "see": ["director", "board"], "start": null},
  {"slug": "finance", "name": "Finance", "about": "For the directors and the board: money in, money out, budgets, banking and the books.", "group": "Staff", "keep": "6 months", "see": ["director", "board"], "start": null},
];
/* forum:categories:end */

const CLAIM = 'The forums are for claimed usernames. Claim yours from Profile on the radio, then come back.';
const GONE = 'That topic has gone, or is not one you can read.';

/* Every category there is now: the listed ones, each followed by the
   subcategory for every year it is filed by (`years`, Meeting Minutes'),
   newest first, from its first year to this one on the street's clock. They
   are made here rather than listed, so a year is there on the first of
   January without anybody adding it, and a year's topics stay found for good.
   A year is its parent's in everything but its name. */
const forumYears = new Map();
export function forumCategories(now = Date.now()) {
  const y = Number(new Intl.DateTimeFormat('en-US', { timeZone: ZONE, year: 'numeric' }).format(new Date(now)));
  if (!forumYears.has(y)) {
    const all = [];
    for (const c of FORUM_CATEGORIES) {
      all.push(c);
      if (!c.years) continue;
      for (let k = y; k >= c.years; k--) {
        const yc = { ...c, slug: `${c.slug}-${k}`, name: String(k), about: `${c.name} from ${k}.`, parent: c.slug, year: k };
        delete yc.years; delete yc.shelf;
        all.push(yc);
      }
    }
    forumYears.clear();
    forumYears.set(y, all);
  }
  return forumYears.get(y);
}
export function forumCat(slug, now = Date.now()) { return forumCategories(now).find((c) => c.slug === slug) || null; }
/* A category and every one under it, at any depth, in the list's order. */
function forumTree(cat, now = Date.now()) {
  const all = forumCategories(now), out = [cat];
  for (const c of all) if (c.parent && out.some((x) => x.slug === c.parent) && !out.includes(c)) out.push(c);
  return out;
}
export function topicId(v) { return typeof v === 'string' && /^t[A-Za-z0-9_-]{12}$/.test(v) ? v : null; }
export function postId(v) { return typeof v === 'string' && /^p[A-Za-z0-9_-]{11}$/.test(v) ? v : null; }
function newTopicId() { return 't' + randomBytes(9).toString('base64url'); }
function newPostId() { return 'p' + randomBytes(8).toString('base64url'); }

/* A claimed username, and nothing else, reads and writes here. */
export function forumReader(who) { return !!(who && who.account && typeof who.since === 'number'); }

/* Whose a post is: the folded name and the moment it was claimed. Never sent. */
export function authorMark(who) {
  return createHash('sha256').update(`forum-author|${foldHandle(who.handle)}|${who.since}`).digest('base64url');
}

/* Who a category is for. `what` is 'see' or 'start'; starting needs seeing.
   roomAllows' rules exactly: null is everybody here, roles are CB_MODS's, an
   administrator goes everywhere a category does not call strict. */
export function forumAllows(who, cat, what = 'see') {
  if (!cat || !forumReader(who)) return false;
  if (what !== 'see' && !forumAllows(who, cat, 'see')) return false;
  const roles = cat[what];
  if (!roles) return true;
  if (who.role !== 'base' || !who.roles) return false;
  if (!cat.strict && who.roles.has('administrator')) return true;
  return roles.some((r) => who.roles.has(r));
}

/* Who edits a wiki's documents, whoever wrote them: the category's `wiki`
   roles, by forumAllows' rules, and nobody at all in a category that names
   none. A document is a topic's first post; every reply stays its writer's. */
export function forumEditor(who, cat) {
  if (!cat || !Array.isArray(cat.wiki) || !cat.wiki.length || !forumAllows(who, cat)) return false;
  if (who.role !== 'base' || !who.roles) return false;
  if (!cat.strict && who.roles.has('administrator')) return true;
  return cat.wiki.some((r) => who.roles.has(r));
}

export function keepOf(cat) { return (cat && FORUM_KEEPS.includes(cat.keep) && cat.keep) || FORUM_DEFAULT_KEEP; }

/* When a topic goes, from the time its clock last started. */
export function goesAt(from, keep) {
  if (keep === 'never') return null;
  if (keep === '1 week') return from + 7 * DAY;
  const m = /^(\d+) months$/.exec(keep);
  const d = new Date(from);
  d.setUTCMonth(d.getUTCMonth() + Number(m ? m[1] : 3));
  return d.getTime();
}
function clockOf(sum) { return Math.max(sum.last || 0, sum.unpinned || 0); }
export function topicGoes(sum, cat) { return sum.pinned ? null : goesAt(clockOf(sum), keepOf(cat)); }
export function topicLive(sum, cat, now = Date.now()) { const g = topicGoes(sum, cat); return g === null || g > now; }

export function cleanForumTitle(v) { const t = tidy(v); return t && [...t].length <= FORUM_TITLE_MAX ? t : null; }
export function cleanForumBody(v, max = FORUM_BODY_MAX) {
  return cleanBrassBody(v, max);
}
/* A picture's description: '' when there is none, null when it is too long. */
export function cleanForumAlt(v) {
  if (v == null || String(v).trim() === '') return '';
  const t = tidy(v);
  return t && [...t].length <= FORUM_ALT_MAX ? t : null;
}

/* ── Pictures and files ── */

/* A file's name as it will be shown and saved: no path, no character a
   computer would read as one, and ending in a kind the forums take. */
export function cleanFileName(v) {
  const t = tidy(String(v == null ? '' : v).replace(/[\\/:*?"<>|]/g, '-')).replace(/^[.\s-]+/, '');
  if (!t || [...t].length > FORUM_NAME_MAX) return null;
  const ext = (/\.([a-z0-9]{1,5})$/i.exec(t) || [])[1];
  return ext && own(FORUM_FILE_TYPES, ext.toLowerCase()) ? t : null;
}

/* Whether a file's first bytes say it is a picture of any kind a camera or a
   phone makes, so that it is refused as a file. */
function picturish(b) {
  if (imageKind(b)) return true;
  const head = Buffer.from(b.subarray(0, 16)).toString('latin1');
  return /^GIF8|^BM|^II\*\0|^MM\0\*|^\0\0\0.ftyp(?:hei|hev|mif|msf|avi)/s.test(head);
}

/* What a file is, checked by its first bytes against the end of its name.
   { type } or { error }. */
export function fileKind(bytes, name) {
  const ext = String(name || '').split('.').pop().toLowerCase();
  const k = own(FORUM_FILE_TYPES, ext) ? FORUM_FILE_TYPES[ext] : null;
  if (!k) return { error: `The forums take ${Object.keys(FORUM_FILE_TYPES).join(', ')} files, and pictures.` };
  if (picturish(bytes)) return { error: 'That is a picture. Add it as a picture, which takes its camera’s data off first.' };
  const buf = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const not = { error: `That file is not the kind of file its name says it is (.${ext}).` };
  if (k.is === 'pdf') {
    if (!buf.subarray(0, 5).equals(Buffer.from('%PDF-'))) return not;
    if (buf.includes('/JavaScript') || buf.includes('/Launch')) return { error: 'That PDF carries a script, or something that starts a program. The forums do not take those.' };
  }
  if (k.is === 'rtf' && !buf.subarray(0, 5).equals(Buffer.from('{\\rtf'))) return not;
  if (k.is === 'zip') {
    if (!(buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 3 && buf[3] === 4)) return not;
    if (buf.includes('vbaProject') || buf.includes('Basic/') || buf.includes('Scripts/')) return { error: 'That document has macros in it. The forums do not take those: save it again without them.' };
  }
  if (k.is === 'text') {
    if (buf.includes(0)) return not;
    try { new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch (e) { return { error: `A .${ext} file is plain text, saved as UTF-8. That one is not.` }; }
  }
  return { type: k.type };
}

/* An upload, before any post holds it. A picture has already been redrawn in
   the writer's browser; a file is whatever they chose, checked. It waits under
   forum-up/, marked with its writer's mark so only they can put it in a post,
   and goes after a day if no post takes it. */
export async function putForumUpload(who, f, bytes, s = store(), now = Date.now()) {
  if (!forumReader(who)) return { error: CLAIM };
  if (!bytes || !bytes.length) return { error: 'There was nothing in that.' };
  let meta;
  if (f && f.kind === 'pic') {
    if (bytes.length > IMG_MAX) return { error: 'That picture is too big, even after your browser made it smaller.' };
    const type = imageKind(bytes);
    if (!type) return { error: 'That is not a picture the forums can show.' };
    if (carriesMetadata(bytes, type)) return { error: 'That picture still carries its camera data. Add it again in the forums, which take that off.' };
    meta = { kind: 'pic', type, size: bytes.length };
  } else if (f && f.kind === 'file') {
    if (bytes.length > FORUM_FILE_MAX) return { error: `A file is ${FORUM_FILE_MAX / 1000000} MB at most.` };
    const name = cleanFileName(f.name);
    if (!name) return { error: `A file's name ends in .${Object.keys(FORUM_FILE_TYPES).join(', .')}, and is ${FORUM_NAME_MAX} characters at most.` };
    const k = fileKind(bytes, name);
    if (k.error) return k;
    meta = { kind: 'file', type: k.type, name, size: bytes.length };
  } else return { error: 'A picture or a file?' };
  const id = randomUUID();
  await s.set(FORUM_UP + id, bytes, { metadata: { ...meta, t: now, by: authorMark(who) } });
  return { id, ...meta };
}

/* The pictures and files a post asks for (`asked`, a list of { id, alt }):
   the ones it already had, kept, and this writer's own uploads. Answers
   { files, fresh } or { error }; fresh is the uploads to copy under the topic. */
async function attachments(who, asked, had, s, most = FORUM_ATTACH_MAX) {
  const list = Array.isArray(asked) ? asked : [];
  if (list.length > most) return { error: `${most === FORUM_ATTACH_MAX ? 'A post' : 'A document'} holds ${most} pictures and files at most.` };
  const mark = authorMark(who);
  const files = [], fresh = [], ids = new Set();
  for (const a of list) {
    const id = imageId(a && a.id);
    if (!id || ids.has(id)) return { error: 'One of those pictures or files is not ready. Take it off and add it again.' };
    ids.add(id);
    const alt = cleanForumAlt(a.alt);
    if (alt === null) return { error: `A picture's description is ${FORUM_ALT_MAX} characters at most.` };
    const old = had.find((x) => x.id === id);
    if (old) {
      const kept = { ...old };
      delete kept.alt;
      if (kept.kind === 'pic' && alt) kept.alt = alt;
      files.push(kept);
      continue;
    }
    const got = await s.getWithMetadata(FORUM_UP + id, { type: 'arrayBuffer' });
    const m = got && got.metadata;
    if (!m || m.by !== mark || (m.kind !== 'pic' && m.kind !== 'file')) {
      return { error: 'One of those pictures or files has gone, or is not yours. Take it off and add it again.' };
    }
    const file = { id, kind: m.kind, type: m.type, size: m.size };
    if (m.kind === 'file') file.name = m.name;
    if (m.kind === 'pic' && alt) file.alt = alt;
    files.push(file);
    fresh.push({ id, data: got.data, meta: { kind: m.kind, type: m.type, size: m.size, ...(m.name ? { name: m.name } : {}) } });
  }
  return { files, fresh };
}
/* How many pictures and files a post may hold: a wiki's document, the post
   that opens one of its topics, holds a screenshot for every step of a how-to
   (Ryan's ask, 2026-10-20, for the Field Guide); every other post, six. */
function attachMost(cat, first) { return cat && cat.wiki && first ? FORUM_DOC_ATTACH_MAX : FORUM_ATTACH_MAX; }
/* And how long its words may be: a wiki's document as long as a long Google
   Doc, so a board meeting's minutes go up whole with their transcript (Ryan's
   call, 2026-10-20, moving Team Docs); every other post, a reply in a wiki
   included, 20,000 characters. */
function bodyMost(cat, first) { return cat && cat.wiki && first ? FORUM_DOC_BODY_MAX : FORUM_BODY_MAX; }
const fileKey = (topic, id) => `${FORUM_FILE}${topic}/${id}`;
async function keepUploads(topic, fresh, s) { for (const x of fresh) await s.set(fileKey(topic, x.id), x.data, { metadata: { ...x.meta, t: Date.now() } }); }
async function doneUploads(fresh, s) { for (const x of fresh) await s.delete(FORUM_UP + x.id); }
async function dropFiles(topic, ids, s) { for (const id of ids) await s.delete(fileKey(topic, id)); }
async function dropTopicFiles(topic, s) {
  for (const b of (await s.list({ prefix: `${FORUM_FILE}${topic}/` })).blobs || []) await s.delete(b.key);
}
const filesOf = (posts) => posts.flatMap((p) => (p.files || []).map((f) => f.id));

/* One picture or file, for a reader who can read the topic a post of which
   holds it now, and for nobody else. { data, file } or null. */
export async function forumFile(who, tid, fid, s = store(), now = Date.now()) {
  if (!forumReader(who)) return null;
  const t = await readTopic(tid, s);
  if (!t) return null;
  const cat = forumCat(t.cat, now);
  if (!forumAllows(who, cat) || !topicLive(summaryOf(t), cat, now)) return null;
  const id = imageId(fid);
  const file = id && t.posts.flatMap((p) => p.files || []).find((x) => x.id === id);
  if (!file) return null;
  const got = await s.getWithMetadata(fileKey(t.id, id), { type: 'arrayBuffer' });
  return got && got.data ? { data: got.data, file } : null;
}

/* The handles a post mentions, for a reader's page to draw: the ones its
   writer picked and the topic's own people, each only if mentions() finds it
   in the words. */
function mentionedIn(body, asked, t) {
  if (!body) return [];
  const pool = (Array.isArray(asked) ? asked.slice(0, 40) : []).map(cleanHandle).filter(Boolean);
  if (t) for (const p of t.posts) { pool.push(p.handle); if (p.cb) for (const m of p.cb.messages) pool.push(m.handle); }
  const out = [], folds = new Set();
  for (const h of pool) {
    const f = foldHandle(h);
    if (folds.has(f) || !mentions(body, h)) continue;
    folds.add(f);
    out.push(h);
    if (out.length >= FORUM_AT_MAX) break;
  }
  return out;
}

/* ── Storing ── */

const topicKey = (id) => FORUM_TOPIC + id;
const catKey = (slug) => FORUM_CAT + slug;

export async function readTopic(id, s = store()) {
  if (!topicId(id)) return null;
  const d = await s.get(topicKey(id), { type: 'json' });
  return d && d.id === id && Array.isArray(d.posts) ? d : null;
}
export async function readForumIndex(slug, s = store()) {
  const d = await s.get(catKey(slug), { type: 'json' });
  return d && Array.isArray(d.topics) ? d.topics : [];
}
function updateForumIndex(slug, change, s) { return updateList(catKey(slug), 'topics', change, s); }

/* A whole document changed with the conditional write. `change` gets it (or
   null when there is none) and answers the next one, null to leave it, or
   false to delete it. Answers what is there afterwards. */
async function updateDoc(key, change, s) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    const next = change(cur.exists ? cur.data : null);
    if (next === null) return cur.exists ? cur.data : null;
    if (next === false) { if (cur.exists) await s.delete(key); return null; }
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, next, opts);
    if (res.modified) return next;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* A summary carries its topic's version, v, which every write moves on, so a
   list never takes an older summary over a newer one when two writes to the
   same topic reach it in the other order. */
function summaryOf(t) {
  const sum = { id: t.id, v: t.v || 0, title: t.title, handle: t.handle, t: t.t, last: t.last, lastBy: t.lastBy };
  if (t.base) sum.base = true;
  if (t.lastBase) sum.lastBase = true;
  if (t.pinned) sum.pinned = true;
  if (t.closed) sum.closed = true;
  if (t.unpinned) sum.unpinned = t.unpinned;
  return sum;
}

/* The topic's summary in its category's list, replacing the one there. */
async function indexTopic(t, s) {
  const sum = summaryOf(t);
  await updateForumIndex(t.cat, (list) => {
    const k = list.findIndex((x) => x.id === sum.id);
    if (k < 0) return [sum, ...list];
    if ((list[k].v || 0) >= sum.v) return null;
    const copy = list.slice(); copy[k] = sum; return copy;
  }, s);
}
async function unindexTopic(slug, id, s) {
  await updateForumIndex(slug, (list) => (list.some((x) => x.id === id) ? list.filter((x) => x.id !== id) : null), s);
}

/* ── What a reader is sent ── */

export function forumCatsFor(who, now = Date.now()) { return forumCategories(now).filter((c) => forumAllows(who, c)); }
/* `parent`: the category it stands in; `shelf`: it holds subcategories and
   no topics of its own; `templates`: its topics are offered as templates. */
function shapeForumCat(c, who) {
  const out = { slug: c.slug, name: c.name, about: c.about, group: c.group, keep: keepOf(c), start: forumAllows(who, c, 'start') && !c.shelf };
  if (c.see) out.staff = true;
  if (c.wiki) out.wiki = true;
  if (c.parent) out.parent = c.parent;
  if (c.shelf) out.shelf = true;
  if (c.templates) out.templates = true;
  return out;
}
export function forumNav(who, now = Date.now()) { return forumCatsFor(who, now).map((c) => shapeForumCat(c, who)); }

function shapeSummary(sum, cat) {
  const out = { id: sum.id, cat: cat.slug, title: sum.title, handle: sum.handle, base: !!sum.base, t: sum.t,
    last: sum.last, lastBy: sum.lastBy, lastBase: !!sum.lastBase, goes: topicGoes(sum, cat) };
  if (sum.pinned) out.pinned = true;
  if (sum.closed) out.closed = true;
  return out;
}
const byLast = (a, b) => b.last - a.last;

/* The live topics of a category and of every one under it that the reader
   may see, each summary shaped with the category it is in. */
async function treeTopics(who, cat, s, now) {
  const cats = forumTree(cat, now).filter((c) => forumAllows(who, c));
  const lists = await Promise.all(cats.map((c) => readForumIndex(c.slug, s)));
  return cats.flatMap((c, i) => lists[i].filter((x) => topicLive(x, c, now)).map((x) => shapeSummary(x, c)));
}
/* The ones directly under a category, for its page and its card. */
function subsOf(who, cat, now) {
  return forumCatsFor(who, now).filter((c) => c.parent === cat.slug).map((c) => shapeForumCat(c, who));
}

/* The front of the forums: every category the reader may see that stands on
   its own, each with what is under it and the three latest topics in it or
   under it. */
export async function forumHome(who, s = store(), now = Date.now()) {
  const cats = forumCatsFor(who, now).filter((c) => !c.parent);
  const trees = await Promise.all(cats.map((c) => treeTopics(who, c, s, now)));
  return cats.map((c, i) => {
    const out = { ...shapeForumCat(c, who), latest: trees[i].sort(byLast).slice(0, 3) };
    const subs = subsOf(who, c, now);
    if (subs.length) out.subs = subs;
    return out;
  });
}

/* Every category the reader may see, its topics together, the latest post
   first. `before` pages back: topics last posted to before that time. */
export async function forumLatest(who, before = null, s = store(), now = Date.now()) {
  const cats = forumCatsFor(who, now);
  const lists = await Promise.all(cats.map((c) => readForumIndex(c.slug, s)));
  let all = [];
  cats.forEach((c, i) => { all = all.concat(lists[i].filter((x) => topicLive(x, c, now)).map((x) => shapeSummary(x, c))); });
  all.sort(byLast);
  if (typeof before === 'number') all = all.filter((x) => x.last < before);
  return { topics: all.slice(0, FORUM_LATEST), more: all.length > FORUM_LATEST };
}

/* One category's topics, and those of every category under it: pinned ones
   first, then the latest post first; and the categories directly under it. */
export async function forumCategory(who, slug, before = null, s = store(), now = Date.now()) {
  const cat = forumCat(slug, now);
  if (!forumAllows(who, cat)) return null;
  const live = await treeTopics(who, cat, s, now);
  // Its own pinned topics first, on the first page only; one pinned in a
  // category under it is in that category's place at the top, not this one's.
  const own = (x) => x.pinned && x.cat === cat.slug;
  const pinned = before == null ? live.filter(own).sort(byLast) : [];
  let rest = live.filter((x) => !own(x)).sort(byLast);
  if (typeof before === 'number') rest = rest.filter((x) => x.last < before);
  const out = { cat: shapeForumCat(cat, who), topics: pinned.concat(rest.slice(0, FORUM_LATEST)), more: rest.length > FORUM_LATEST };
  const subs = subsOf(who, cat, now);
  if (subs.length) out.subs = subs;
  return out;
}

/* A preview stands where its link stood: a paragraph that is one address and
   nothing else, as Discourse does it. */
function loneLink(b) {
  if (!b || b.t !== 'p' || !b.c || b.c.length !== 1) return null;
  const a = b.c[0];
  if (a.t !== 'a' || !a.c || a.c.length !== 1 || a.c[0].t !== 'text') return null;
  return /^https?:\/\/\S+$/i.test(a.c[0].v) && brassHref(a.c[0].v) === a.href ? a.c[0].v : null;
}
export function loneLinks(body) {
  const out = [];
  for (const b of parseBrass(body)) {
    const src = loneLink(b);
    if (src && !out.includes(src)) out.push(src);
    if (out.length >= FORUM_PREVIEWS) break;
  }
  return out;
}
function shapePreview(l) {
  const out = { t: 'preview', kind: l.kind, href: l.href };
  if (l.kind === 'street') out.path = l.path;
  if (l.kind === 'page') { out.title = l.title; out.about = l.about || null; out.site = l.site || null; out.host = l.host || null; }
  if (l.kind === 'video') {
    out.id = l.id; out.title = l.title; out.channel = l.channel || null;
    out.length = typeof l.length === 'number' ? l.length : null; out.live = !!l.live; out.embed = !!l.embed;
  }
  return out;
}
function withPreviews(blocks, links) {
  if (!links || !links.length) return blocks;
  return blocks.map((b) => {
    const src = loneLink(b);
    const l = src && links.find((x) => x.src === src);
    return l ? shapePreview(l) : b;
  });
}

function shapeCopied(cb, who) {
  return { room: cb.room || null, day: cb.day,
    messages: cb.messages.map((m) => {
      const out = { id: m.id, handle: m.handle, base: !!m.base, claimed: !!m.claimed && !m.base, t: m.t,
        blocks: parseBrass(m.text), takeOut: canTakeOff(who, m) };
      if (typeof m.edited === 'number') out.edited = m.edited;
      return out;
    }) };
}

/* A PICTURE IN THE WORDS, Ryan's ask, 2026-10-20, for screenshots in the flow
   of a Field Guide page: `![what it shows](pic:<id>)`, where <id> is one of
   the post's own pictures, stands where it is written, and the post shows it
   there and not again below. The description is the words between the
   brackets, or the picture's own when those are empty. Anything else written
   that way stays the words typed: a picture from anywhere else is never shown,
   and a post can only place what it holds. Read in the nodes parseBrass made,
   as withPreviews reads links, so the one reader of Markdown is unchanged. */
const PIC_REF = /!\[([^\]\n]*)\]\(pic:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\)/g;
export function placePictures(blocks, pics, placed = new Set()) {
  const inline = (ns) => ns.flatMap((n) => {
    if (n.t === 'b' || n.t === 'i' || n.t === 's') return [{ ...n, c: inline(n.c) }];
    if (n.t !== 'text' || !n.v.includes('](pic:')) return [n];
    const out = [];
    let at = 0;
    for (const m of n.v.matchAll(PIC_REF)) {
      if (!pics.has(m[2])) continue;
      if (m.index > at) out.push({ t: 'text', v: n.v.slice(at, m.index) });
      out.push({ t: 'pic', id: m[2], alt: tidy(m[1]) || pics.get(m[2]) || '' });
      placed.add(m[2]);
      at = m.index + m[0].length;
    }
    if (at < n.v.length) out.push({ t: 'text', v: n.v.slice(at) });
    return out;
  });
  const block = (b) => {
    if (b.t === 'p' || b.t === 'h') return { ...b, c: inline(b.c) };
    if (b.t === 'quote') return { ...b, c: b.c.map(block) };
    if (b.t === 'ul' || b.t === 'ol') return { ...b, items: b.items.map((it) => it.map(block)) };
    if (b.t === 'table') return { ...b, head: b.head.map(inline), rows: b.rows.map((r) => r.map(inline)) };
    return b;
  };
  return blocks.map(block);
}
/* A template's words, without the pictures it places: they are its topic's,
   and a new topic starts with none. */
export function withoutPictures(body) {
  return String(body || '').replace(PIC_REF, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

/* `doc`: this post is a wiki's document, which goes only with its topic;
   `editor`: the reader edits the wiki's documents (forumEditor). */
function shapePost(p, who, mark, doc = false, editor = false) {
  const placed = new Set();
  const pics = new Map((p.files || []).filter((f) => f.kind === 'pic').map((f) => [f.id, f.alt || '']));
  const out = { id: p.id, handle: p.handle, base: !!p.base, t: p.t, body: p.body || '',
    blocks: placePictures(withPreviews(parseBrass(p.body || ''), p.links), pics, placed), edit: p.by === mark || (doc && editor),
    takeDown: !doc && (p.by === mark || who.role === 'base') };
  if (doc) out.wiki = true;
  if (typeof p.edited === 'number') out.edited = p.edited;
  // Whoever edited it last, when that is somebody: a document's words are
  // never shown as only its starter's.
  if (p.editedBy) { out.editedBy = p.editedBy; if (p.editedBase) out.editedBase = true; }
  if (p.reply) out.reply = p.reply;
  const rx = shapeReactions(p.reactions);
  if (rx) out.reactions = rx;
  if (p.cb && p.cb.messages && p.cb.messages.length) out.cb = shapeCopied(p.cb, who);
  if (p.files && p.files.length) out.files = p.files.map((f) => shapeFile(f, placed.has(f.id)));
  if (p.at && p.at.length) out.at = p.at.slice();
  return out;
}
/* `placed`: the picture stands in the words, so it is not shown again below. */
function shapeFile(f, placed = false) {
  const out = { id: f.id, kind: f.kind, type: f.type, size: f.size };
  if (f.kind === 'file') out.name = f.name;
  if (f.kind === 'pic' && f.alt) out.alt = f.alt;
  if (placed) out.placed = true;
  return out;
}

function topicAlone(t, mark) { return t.posts.every((p) => p.by === mark); }

export function shapeTopic(t, cat, who) {
  const mark = authorMark(who), mod = who.role === 'base', editor = forumEditor(who, cat), wiki = !!cat.wiki;
  const out = { id: t.id, cat: shapeForumCat(cat, who), title: t.title, handle: t.handle, base: !!t.base, t: t.t, last: t.last,
    goes: topicGoes(summaryOf(t), cat), retitle: t.by === mark || editor, mod,
    takeDown: mod || (t.by === mark && topicAlone(t, mark)),
    reply: !t.closed || mod, full: t.posts.length >= FORUM_POSTS_MAX,
    posts: t.posts.map((p, i) => shapePost(p, who, mark, wiki && i === 0, editor)) };
  if (t.pinned) out.pinned = true;
  if (t.closed) out.closed = true;
  return out;
}

export async function forumTopic(who, id, s = store(), now = Date.now()) {
  const t = await readTopic(id, s);
  if (!t) return null;
  const cat = forumCat(t.cat, now);
  if (!forumAllows(who, cat) || !topicLive(summaryOf(t), cat, now)) return null;
  return shapeTopic(t, cat, who);
}

/* THE TEMPLATES a reader is offered when they start a topic, Ryan's ask,
   2026-10-20, after the team's templates folder in Google Docs: the topics of
   every category marked `templates` that the reader may see, each its title
   and the words of the post that opens it, in the order of their titles. A
   pinned one is the category's read-me and is not offered. Nothing is kept
   about which template anybody used. */
export async function forumTemplates(who, s = store(), now = Date.now()) {
  if (!forumReader(who)) return [];
  const out = [];
  for (const c of forumCatsFor(who, now).filter((x) => x.templates)) {
    const live = (await readForumIndex(c.slug, s)).filter((x) => !x.pinned && topicLive(x, c, now));
    const ts = await Promise.all(live.slice(0, FORUM_TEMPLATES_MAX).map((x) => readTopic(x.id, s)));
    for (const t of ts) {
      const body = t && t.cat === c.slug && t.posts[0] ? withoutPictures(t.posts[0].body) : '';
      if (body) out.push({ id: t.id, cat: c.slug, title: t.title, body });
    }
  }
  return out.sort((a, b) => a.title.localeCompare(b.title)).slice(0, FORUM_TEMPLATES_MAX);
}

/* Searching the titles, the posts and the copied messages of the topics the
   reader may see, newest first. Words are matched folded, all of them. */
export async function searchForum(who, q, s = store(), now = Date.now()) {
  if (!forumReader(who)) return [];
  const words = foldHandle(q).split(' ').filter(Boolean).slice(0, 8);
  if (!words.length || String(q).length > 200) return [];
  const out = [];
  for (const { t, x, c } of await readableTopics(who, s, now)) {
    if (out.length >= 30) break;
    const texts = [{ post: null, handle: t.handle, text: t.title }];
    t.posts.forEach((p) => {
      if (p.body) texts.push({ post: p.id, handle: p.handle, text: p.body });
      if (p.cb) p.cb.messages.forEach((m) => texts.push({ post: p.id, handle: m.handle, text: m.text }));
      for (const f of p.files || []) { const label = f.kind === 'file' ? f.name : f.alt; if (label) texts.push({ post: p.id, handle: p.handle, text: label }); }
    });
    const hay = foldHandle(texts.map((y) => y.text).join(' '));
    if (!words.every((w) => hay.includes(w))) continue;
    const hit = texts.find((y) => y.post && foldHandle(y.text).includes(words[0])) || null;
    const r = shapeSummary(x, c);
    if (hit) r.match = { post: hit.post, handle: hit.handle, words: snippet(hit.text, foldHandle(tidy(hit.text)).indexOf(words[0])) };
    out.push(r);
  }
  return out;
}

/* Every topic the reader may see, the latest post first, read whole: as many
   as one search reads. */
async function readableTopics(who, s, now) {
  const cats = forumCatsFor(who, now);
  const lists = await Promise.all(cats.map((c) => readForumIndex(c.slug, s)));
  let sums = [];
  cats.forEach((c, i) => { sums = sums.concat(lists[i].filter((x) => topicLive(x, c, now)).map((x) => ({ x, c }))); });
  sums.sort((a, b) => b.x.last - a.x.last);
  sums = sums.slice(0, FORUM_SEARCH_MAX);
  const topics = await Promise.all(sums.map(({ x }) => readTopic(x.id, s)));
  return sums.map((y, i) => ({ ...y, t: topics[i] })).filter((y) => y.t && y.t.cat === y.c.slug);
}
function snippet(text, from) {
  const plain = tidy(text);
  const at = Math.max(0, from - 60);
  return (at ? '…' : '') + [...plain].slice(at, at + 180).join('') + (plain.length > at + 180 ? '…' : '');
}

/* Where the reader has been @mentioned, by somebody else, in the topics they
   may see: worked out from the words every time it is asked, the latest
   first, and kept nowhere. */
export async function forumMentions(who, s = store(), now = Date.now()) {
  if (!forumReader(who)) return [];
  const me = foldHandle(who.handle), out = [];
  for (const { t, x, c } of await readableTopics(who, s, now)) {
    if (out.length >= 30) break;
    const texts = [];
    t.posts.forEach((p) => {
      if (p.body && foldHandle(p.handle) !== me) texts.push({ post: p.id, handle: p.handle, text: p.body, t: p.t });
      if (p.cb) p.cb.messages.forEach((m) => { if (foldHandle(m.handle) !== me) texts.push({ post: p.id, handle: m.handle, text: m.text, t: m.t }); });
    });
    const hit = texts.filter((y) => mentions(y.text, who.handle)).sort((a, b) => b.t - a.t)[0];
    if (!hit) continue;
    const r = shapeSummary(x, c);
    r.match = { post: hit.post, handle: hit.handle, words: snippet(hit.text, Math.max(0, foldHandle(tidy(hit.text)).indexOf('@' + me))) };
    out.push(r);
  }
  return out;
}

/* ── Copying from the CB ── */

/* Whether everybody a category is for can already hear a private room, so
   nothing copied out of the room reaches anybody it was not for. */
function narrowerThan(cat, room) {
  if (!cat.see || !cat.see.length) return false;
  if (STRICT_ROOMS.includes(room) && !cat.strict) return false;
  const roomRoles = MOD_ROOMS[room];
  if (roomRoles.includes('moderator')) return true;     // every role on the list is a moderator's
  return cat.see.every((r) => roomRoles.includes(r));
}

/* The messages `from.ids` on the channel `from.room` (World when it names
   none), read off the channel now. Words only: a picture or a sticker stays
   behind, and a message that is only one is skipped. */
export async function cbTranscript(who, from, s = store(), cat = null) {
  if (!forumReader(who)) return { error: CLAIM };
  const room = from && from.room ? roomTag(from.room) : null;
  if (from && from.room && !room) return { error: 'That is not a channel on the street.' };
  if (room && quietRoom(room)) return { error: 'Nothing said in a room that keeps to itself can be copied out of it.' };
  if (room && !roomAllows(who, room)) return { error: 'That is not a channel you can hear.' };
  if (room && modRoom(room) && cat && !narrowerThan(cat, room)) {
    return { error: 'What is said in that room can only go into a category that nobody but the people that room is for can read.' };
  }
  const ids = from && Array.isArray(from.ids) ? from.ids.filter((x) => typeof x === 'string' && x.length <= 64).slice(0, KEEP) : [];
  if (!ids.length) return { error: 'Tick at least one message to take to the forums.' };
  const { messages } = await readTuned(room, s);
  const picked = messages.filter((m) => ids.includes(m.id) && m.text);
  if (!picked.length) return { error: 'None of those messages is on the channel any more, or none of them has words in it.' };
  return { cb: { room, day: today(), messages: picked.map((m) => {
    const c = { id: m.id, handle: m.handle, t: m.t, text: m.text };
    if (m.base) c.base = true; else if (m.claimed) c.claimed = true;
    // Its sender edited it: the copy says so, as the channel does.
    if (typeof m.edited === 'number') c.edited = m.edited;
    return c;
  }) }, short: picked.length < ids.length };
}
export function shapeTranscript(cb, who) { return shapeCopied(cb, who); }

/* ── Writing ── */

function makePost(who, body, links, now, files = [], at = []) {
  const p = { id: newPostId(), handle: who.handle, by: authorMark(who), t: now, body };
  if (who.role === 'base') p.base = true;
  if (links && links.length) p.links = links;
  if (files.length) p.files = files;
  if (at.length) p.at = at;
  return p;
}

/* The previews for a post's lone links, reusing any the post already had. */
async function previewsOf(body, had = [], get = safeGet) {
  const srcs = body ? loneLinks(body) : [];
  const out = await Promise.all(srcs.map((src) => {
    const old = had.find((l) => l.src === src);
    return old ? old : previewFor(src, get).catch(() => null);
  }));
  return out.filter(Boolean);
}

export async function startTopic(who, f, s = store(), now = Date.now(), get = safeGet) {
  if (!forumReader(who)) return { error: CLAIM };
  const cat = forumCat(f && f.cat, now);
  if (!forumAllows(who, cat)) return { error: 'There is no such category.' };
  if (cat.shelf) return { error: `${cat.name} holds its subcategories rather than topics of its own. Start the topic in one of them.` };
  if (!forumAllows(who, cat, 'start')) return { error: `Only moderators start topics in ${cat.name}. You can reply to any of them.` };
  const title = cleanForumTitle(f.title);
  if (!title) return { error: `Give the topic a title, up to ${FORUM_TITLE_MAX} characters.` };
  let cb = null;
  if (f.from) {
    const r = await cbTranscript(who, f.from, s, cat);
    if (r.error) return r;
    cb = r.cb;
  }
  const body = f.body == null || String(f.body).trim() === '' ? '' : cleanForumBody(f.body, bodyMost(cat, true));
  if (body === null) return { error: `${cat.wiki ? 'A page' : 'A post'} is up to ${bodyMost(cat, true)} characters.` };
  const att = await attachments(who, f.files, [], s, attachMost(cat, true));
  if (att.error) return att;
  if (!body && !cb && !att.files.length) return { error: 'Say something to start the topic with, or add a picture or a file.' };
  if ((await readForumIndex(cat.slug, s)).length >= FORUM_TOPICS_MAX) {
    return { error: `${cat.name} is full. A moderator has to take some topics down before another fits.` };
  }
  const post = makePost(who, body, await previewsOf(body, [], get), now, att.files, mentionedIn(body, f.at, null));
  if (cb) post.cb = cb;
  const topic = { id: newTopicId(), v: 1, cat: cat.slug, title, handle: who.handle, by: authorMark(who), t: now, last: now, lastBy: who.handle, posts: [post] };
  if (who.role === 'base') { topic.base = true; topic.lastBase = true; }
  // The files go under the topic before the topic does, so no post ever
  // holds one that is not there; the uploads go only once the topic is.
  await keepUploads(topic.id, att.fresh, s);
  let clash = false;
  await updateDoc(topicKey(topic.id), (cur) => { clash = !!cur; return cur ? null : topic; }, s);
  if (clash) return { error: 'That did not work. Try again.' };
  await doneUploads(att.fresh, s);
  await indexTopic(topic, s);
  return { topic, post };
}

/* The topic `id`, changed by `change(t, cat)`, which answers the next topic,
   null with a reason in why, or false to delete it. Refuses a topic the
   writer cannot see, or that has gone. */
async function changeTopic(who, id, now, s, change) {
  let why = null, gone = false, cat0 = null;
  const next = await updateDoc(topicKey(id), (t) => {
    why = null; gone = false;
    if (!t) { why = GONE; return null; }
    const cat = forumCat(t.cat, now);
    cat0 = t.cat;
    if (!forumAllows(who, cat) || !topicLive(summaryOf(t), cat, now)) { why = GONE; return null; }
    const r = change(structuredClone(t), cat);
    if (r && r.why) { why = r.why; return null; }
    if (r === false) gone = true;
    else if (r) r.v = (t.v || 0) + 1;
    return r;
  }, s);
  if (why) return { error: why };
  if (gone) { await unindexTopic(cat0, id, s); await dropTopicFiles(id, s); return { gone: true }; }
  if (next && next.cat !== cat0) await unindexTopic(cat0, id, s);
  if (next) await indexTopic(next, s);
  return { topic: next };
}

/* The latest post's time and author, after posts have gone. */
function settle(t) {
  if (!t.posts.length) return false;
  const lastPost = t.posts.reduce((a, p) => (p.t >= a.t ? p : a));
  t.last = Math.max(lastPost.t, t.t);
  t.lastBy = lastPost.handle;
  if (lastPost.base) t.lastBase = true; else delete t.lastBase;
  return t;
}

export async function replyTopic(who, id, f, s = store(), now = Date.now(), get = safeGet) {
  if (!forumReader(who)) return { error: CLAIM };
  const raw = f && f.body;
  const body = raw == null || String(raw).trim() === '' ? '' : cleanForumBody(raw);
  if (body === null) return { error: `A reply is up to ${FORUM_BODY_MAX} characters.` };
  // Nothing is written under a topic the writer cannot read.
  const pre = await readTopic(id, s);
  if (!pre || !forumAllows(who, forumCat(pre.cat, now)) || !topicLive(summaryOf(pre), forumCat(pre.cat, now), now)) return { error: GONE };
  const att = await attachments(who, f.files, [], s);
  if (att.error) return att;
  if (!body && !att.files.length) return { error: `A reply is between one and ${FORUM_BODY_MAX} characters, or a picture or a file.` };
  const links = await previewsOf(body, [], get);
  const to = postId(f.reply);
  await keepUploads(id, att.fresh, s);
  let made = null;
  const r = await changeTopic(who, id, now, s, (t) => {
    if (t.closed && who.role !== 'base') return { why: 'This topic is closed, so nobody can reply to it.' };
    if (t.posts.length >= FORUM_POSTS_MAX) return { why: 'This topic is full. Start a new one, and link back to this one if it helps.' };
    made = makePost(who, body, links, now, att.files, mentionedIn(body, f.at, t));
    if (to && t.posts.some((p) => p.id === to)) made.reply = to;
    t.posts.push(made);
    // Never backwards: two replies in the same moment land in either order.
    if (now >= t.last) { t.last = now; t.lastBy = who.handle; }
    if (t.lastBy === who.handle && now >= t.last) { if (who.role === 'base') t.lastBase = true; else delete t.lastBase; }
    return t;
  });
  if (r.error) { await dropFiles(id, att.fresh.map((x) => x.id), s); return r; }
  await doneUploads(att.fresh, s);
  return { post: made, topic: r.topic };
}

/* The author editing their post, and its title if it opens the topic they
   started; or, in a wiki, somebody with its roles editing the document that
   opens a topic, and its title, whoever wrote it (forumEditor), which then
   says who edited it last. An edit does not move the topic's clock. */
export async function editPost(who, id, pid, f, s = store(), now = Date.now(), get = safeGet) {
  if (!forumReader(who)) return { error: CLAIM };
  const raw = f && f.body;
  // Read against the longest a post can be; held to its own once the topic says which it is.
  const body = raw == null || String(raw).trim() === '' ? '' : cleanForumBody(raw, FORUM_DOC_BODY_MAX);
  if (body === null) return { error: `A post is up to ${FORUM_DOC_BODY_MAX} characters.` };
  const title = f && f.title != null ? cleanForumTitle(f.title) : undefined;
  if (title === null) return { error: `A title is between one and ${FORUM_TITLE_MAX} characters.` };
  const pre = await readTopic(id, s);
  const mark = authorMark(who);
  const was = pre && pre.posts.find((p) => p.id === pid);
  const cat = pre && forumCat(pre.cat, now);
  if (!pre || !forumAllows(who, cat) || !topicLive(summaryOf(pre), cat, now)) return { error: GONE };
  if (!was) return { error: 'That post has been taken down.' };
  if (was.by !== mark && !(forumEditor(who, cat) && pre.posts[0] === was)) return { error: 'Only whoever wrote a post can edit it.' };
  const most = bodyMost(cat, pre.posts[0] === was);
  if ([...body].length > most) return { error: `${most === FORUM_BODY_MAX ? 'A post' : 'A page'} is up to ${most} characters.` };
  const links = await previewsOf(body, was.links || [], get);
  // Left out, the post keeps the pictures and files it had; a list is the whole of them.
  const att = await attachments(who, f.files === undefined ? (was.files || []) : f.files, was.files || [], s, attachMost(cat, pre.posts[0] === was));
  if (att.error) return att;
  await keepUploads(id, att.fresh, s);
  let before = '', lost = [], made = null;
  const r = await changeTopic(who, id, now, s, (t, cat) => {
    const k = t.posts.findIndex((p) => p.id === pid);
    if (k < 0) return { why: 'That post has been taken down.' };
    const p = t.posts[k];
    // A wiki's document is the topic's first post, and only that.
    const doc = k === 0 && !!cat.wiki, editor = doc && forumEditor(who, cat);
    if (p.by !== mark && !editor) return { why: 'Only whoever wrote a post can edit it.' };
    if (!body && !(p.cb && p.cb.messages.length) && !att.files.length) return { why: 'A post needs some words, or a picture or a file. To take it down, use Take down instead.' };
    before = p.body || '';
    const keep = new Set(att.files.map((x) => x.id));
    lost = (p.files || []).map((x) => x.id).filter((x) => !keep.has(x));
    p.body = body;
    p.edited = now;
    if (links.length) p.links = links; else delete p.links;
    if (att.files.length) p.files = att.files; else delete p.files;
    const at = mentionedIn(body, f.at, t);
    if (at.length) p.at = at; else delete p.at;
    if (title !== undefined) {
      if (k !== 0 || (t.by !== mark && !editor)) return { why: 'Only whoever started a topic can change its title.' };
      t.title = title;
    }
    if (doc) {
      p.editedBy = who.handle;
      if (who.role === 'base') p.editedBase = true; else delete p.editedBase;
    }
    made = p;
    return t;
  });
  if (r.error) { await dropFiles(id, att.fresh.map((x) => x.id), s); return r; }
  await doneUploads(att.fresh, s);
  const held = new Set(filesOf(r.topic.posts));
  await dropFiles(id, lost.filter((x) => !held.has(x)), s);
  return { topic: r.topic, post: made, before };
}

/* A post taken down by its author or a moderator. The topic stays while
   anything is left in it, and goes when nothing is. */
export async function removePost(who, id, pid, s = store(), now = Date.now()) {
  if (!forumReader(who)) return { error: CLAIM };
  const mark = authorMark(who);
  let lost = [];
  const r = await changeTopic(who, id, now, s, (t, cat) => {
    const p = t.posts.find((x) => x.id === pid);
    if (!p) return { why: 'That post has already been taken down.' };
    if (p.by !== mark && who.role !== 'base') return { why: 'Only whoever wrote a post, or a moderator, can take it down.' };
    // A wiki's document goes only with its topic, or a reply would become it.
    if (cat.wiki && t.posts[0] === p) return { why: 'A wiki page goes only with its topic. Take the whole topic down instead.' };
    lost = (p.files || []).map((x) => x.id);
    t.posts = t.posts.filter((x) => x.id !== pid);
    return settle(t);
  });
  // Its pictures and files go with it, unless another post here holds one.
  if (r.topic) { const held = new Set(filesOf(r.topic.posts)); await dropFiles(id, lost.filter((x) => !held.has(x)), s); }
  return r;
}

/* A copied message taken back out by whoever sent it, or a moderator. */
export async function uncopyMessage(who, id, pid, mid, s = store(), now = Date.now()) {
  if (!forumReader(who)) return { error: CLAIM };
  return changeTopic(who, id, now, s, (t) => {
    const p = t.posts.find((x) => x.id === pid);
    const m = p && p.cb && p.cb.messages.find((x) => x.id === mid);
    if (!m) return { why: 'That message has already been taken out.' };
    if (!canTakeOff(who, m)) return { why: 'Only whoever sent a message, or a moderator, can take it out.' };
    p.cb.messages = p.cb.messages.filter((x) => x.id !== mid);
    if (!p.cb.messages.length) delete p.cb;
    if (!p.body && !p.cb && !(p.files && p.files.length)) t.posts = t.posts.filter((x) => x.id !== pid);
    return settle(t);
  });
}

export async function reactPost(who, id, pid, emoji, s = store(), now = Date.now()) {
  if (!forumReader(who)) return { error: CLAIM };
  if (!reactionOf(emoji)) return { error: 'That is not a reaction the forums can show.' };
  return changeTopic(who, id, now, s, (t) => {
    const next = toggleReaction(t.posts, pid, emoji, who.handle);
    if (!next) return { why: 'That post has been taken down, or has as many different reactions as it can hold.' };
    t.posts = next;
    return t;
  });
}

/* The topic's starter taking it down while nobody else has posted in it, or
   any moderator, any time. Everything in it goes. */
export async function removeTopic(who, id, s = store(), now = Date.now()) {
  if (!forumReader(who)) return { error: CLAIM };
  const mark = authorMark(who);
  return changeTopic(who, id, now, s, (t) => {
    if (who.role === 'base' || (t.by === mark && topicAlone(t, mark))) return false;
    return { why: 'Only a moderator can take down a topic other people have posted in. You can take down your own posts.' };
  });
}

/* A moderator pinning or unpinning, closing or opening, or moving a topic to
   another category. A topic holding messages copied out of a private room
   moves only where everybody could already hear that room. */
export async function moderateTopic(who, id, f, s = store(), now = Date.now()) {
  if (!forumReader(who)) return { error: CLAIM };
  if (who.role !== 'base') return { error: 'Only a moderator can do that.' };
  return changeTopic(who, id, now, s, (t) => {
    if (typeof f.pin === 'boolean') {
      if (f.pin) { t.pinned = true; delete t.unpinned; }
      else if (t.pinned) { delete t.pinned; t.unpinned = now; }
    }
    if (typeof f.close === 'boolean') { if (f.close) t.closed = true; else delete t.closed; }
    if (f.move != null) {
      const to = forumCat(f.move, now);
      if (!forumAllows(who, to)) return { why: 'There is no such category.' };
      if (to.shelf) return { why: `${to.name} holds its subcategories rather than topics of its own. Move it into one of them.` };
      for (const p of t.posts) {
        const room = p.cb && p.cb.room;
        if (room && modRoom(room) && !narrowerThan(to, room)) {
          return { why: `This topic holds messages from a private room, and ${to.name} can be read by people that room is not for.` };
        }
      }
      t.cat = to.slug;
    }
    return t;
  });
}

/* ── The sweep, hourly ──

   Every topic past its date goes, with everything in it. A summary whose
   topic has gone comes off its list, and a topic with no summary (its list's
   write was lost) is put back on its list, or goes if it is past its date. A
   topic whose category is no longer in data/forum.json is shown to nobody and
   goes at the default keep. A topic's pictures and files go with it; an upload
   no post took goes after a day; and a file under a topic that is not there
   (a post that was refused after its files were copied) goes after an hour. */
export async function sweepForum(s = store(), now = Date.now()) {
  const listed = await s.list({ prefix: FORUM_TOPIC });
  const there = new Set((listed.blobs || []).map((b) => b.key.slice(FORUM_TOPIC.length)));
  const indexed = new Set();
  for (const c of forumCategories(now)) {
    const list = await readForumIndex(c.slug, s);
    const drop = new Set();
    for (const x of list) {
      indexed.add(x.id);
      if (!there.has(x.id)) { drop.add(x.id); continue; }
      if (topicLive(x, c, now)) continue;
      // Past its date on the list: read the topic itself, which a reply may
      // have moved since, and delete it only if it is past its date too.
      const t = await readTopic(x.id, s);
      if (t && t.cat === c.slug && topicLive(summaryOf(t), c, now)) { await indexTopic(t, s); continue; }
      if (t && t.cat !== c.slug) { drop.add(x.id); continue; }
      await s.delete(topicKey(x.id));
      await dropTopicFiles(x.id, s);
      drop.add(x.id);
    }
    if (drop.size) await updateForumIndex(c.slug, (l) => (l.some((x) => drop.has(x.id)) ? l.filter((x) => !drop.has(x.id)) : null), s);
  }
  for (const id of there) {
    if (indexed.has(id)) continue;
    const t = await readTopic(id, s);
    if (!t) continue;
    const c = forumCat(t.cat, now);
    if (topicLive(summaryOf(t), c, now)) { if (c) await indexTopic(t, s); }
    else { await s.delete(topicKey(id)); await dropTopicFiles(id, s); }
  }
  await sweepForumFiles(there, s, now);
}

async function blobMeta(s, key) {
  if (typeof s.getMetadata === 'function') { const m = await s.getMetadata(key); return m && m.metadata; }
  const got = await s.getWithMetadata(key, { type: 'arrayBuffer' });
  return got && got.metadata;
}
async function sweepForumFiles(there, s, now) {
  for (const b of (await s.list({ prefix: FORUM_UP })).blobs || []) {
    const m = await blobMeta(s, b.key);
    if (!m || typeof m.t !== 'number' || now - m.t >= FORUM_UNSENT) await s.delete(b.key);
  }
  for (const b of (await s.list({ prefix: FORUM_FILE })).blobs || []) {
    const topic = b.key.slice(FORUM_FILE.length).split('/')[0];
    if (there.has(topic)) continue;
    // A topic being made right now has its files before it is there.
    const m = await blobMeta(s, b.key);
    if (!m || typeof m.t !== 'number' || now - m.t >= 60 * 60 * 1000) await s.delete(b.key);
  }
}

/* ── Previews: reading a page once, safely ── */

/* Whether an address is one on the open internet, and not this machine, a
   private network, or anything else a server must never be talked into
   asking: loopback, private, shared, link-local, multicast, documentation
   and benchmarking ranges, and the IPv6 forms that carry an IPv4 address. */
export function publicAddress(ip) {
  const v = isIP(ip);
  if (v === 4) return publicV4(ip);
  if (v === 6) return publicV6(ip);
  return false;
}
function publicV4(ip) {
  const [a, b, c] = ip.split('.').map(Number);
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return false;
  if (a === 198 && (b === 18 || b === 19)) return false;
  if (a === 198 && b === 51 && c === 100) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  return true;
}
function groups6(ip) {
  let s = String(ip).toLowerCase().replace(/^\[|\]$/g, '').split('%')[0];
  let tail = [];
  const dotted = /^(.*:)(\d+\.\d+\.\d+\.\d+)$/.exec(s);
  if (dotted) {
    if (isIP(dotted[2]) !== 4) return null;
    const q = dotted[2].split('.').map(Number);
    tail = [(q[0] << 8) | q[1], (q[2] << 8) | q[3]];
    s = dotted[1].endsWith('::') ? dotted[1] : dotted[1].slice(0, -1);
  }
  const halves = s.split('::');
  if (halves.length > 2) return null;
  const part = (h) => (h ? h.split(':').map((x) => (/^[0-9a-f]{1,4}$/.test(x) ? parseInt(x, 16) : NaN)) : []);
  const head = part(halves[0]), back = halves.length === 2 ? part(halves[1]) : [];
  const fill = 8 - tail.length - head.length - back.length;
  if (halves.length === 1 ? fill !== 0 : fill < 0) return null;
  const g = head.concat(new Array(halves.length === 2 ? fill : 0).fill(0), back, tail);
  return g.length === 8 && g.every((x) => Number.isInteger(x) && x >= 0 && x <= 0xffff) ? g : null;
}
function publicV6(ip) {
  const g = groups6(ip);
  if (!g) return false;
  const v4 = (hi, lo) => publicV4([hi >> 8, hi & 255, lo >> 8, lo & 255].join('.'));
  if (g.slice(0, 7).every((x) => x === 0)) return false;                       // :: and ::1
  if (g.slice(0, 5).every((x) => x === 0) && g[5] === 0xffff) return v4(g[6], g[7]);   // ::ffff:a.b.c.d
  if (g.slice(0, 6).every((x) => x === 0)) return false;                       // ::a.b.c.d, long gone
  if (g[0] === 0x64 && g[1] === 0xff9b && g.slice(2, 6).every((x) => x === 0)) return v4(g[6], g[7]);
  if (g[0] === 0x2002) return v4(g[1], g[2]);                                  // 6to4
  if ((g[0] & 0xfe00) === 0xfc00) return false;                                // unique local
  if ((g[0] & 0xffc0) === 0xfe80) return false;                                // link-local
  if ((g[0] & 0xff00) === 0xff00) return false;                                // multicast
  if (g[0] === 0x2001 && (g[1] === 0x0db8 || g[1] === 0)) return false;        // documentation, Teredo
  if (g[0] === 0x0100 && g.slice(1, 4).every((x) => x === 0)) return false;    // discard
  return true;
}

/* The address is checked as it is looked up, so a name that points at a
   private address, or is changed to point at one between a check and the
   request, is refused at the moment the connection is made. */
function safeLookup(hostname, options, callback) {
  if (typeof options === 'function') { callback = options; options = {}; }
  dnsLookup(hostname, { all: true, verbatim: true }, (err, addrs) => {
    if (err) return callback(err);
    if (!addrs || !addrs.length || addrs.some((a) => !publicAddress(a.address))) {
      return callback(Object.assign(new Error('not a public address'), { code: 'ENOTFOUND' }));
    }
    if (options && options.all) return callback(null, addrs);
    return callback(null, addrs[0].address, addrs[0].family);
  });
}

const PREVIEW_AGENT = 'stimpunks.world link preview (+https://stimpunks.world/privacy.html#forums)';

/* GET an address, for a preview: http or https on the usual ports, a public
   address, three redirects, five seconds and `max` bytes at most, and only the
   content types asked for. Answers { status, type, text, url }. */
export function safeGet(url, o = {}, hops = 0) {
  const max = o.max || 600000, types = o.types || ['text/html', 'application/xhtml+xml'];
  // One deadline for the address and every redirect after it.
  const deadline = o.deadline || Date.now() + 5000;
  const left = deadline - Date.now();
  if (left <= 0) return Promise.reject(new Error('timeout'));
  return new Promise((resolve, reject) => {
    let u;
    try { u = new URL(url); } catch (e) { reject(new Error('refused')); return; }
    const host = u.hostname.replace(/^\[|\]$/g, '').toLowerCase();
    if (!/^https?:$/.test(u.protocol) || u.username || u.password || (u.port && !['80', '443'].includes(u.port))
      || !host || /(^|\.)(localhost|local|internal|localdomain|lan|home|corp|intranet|test|invalid|example)$/.test(host)
      || (isIP(host) && !publicAddress(host))) { reject(new Error('refused')); return; }
    const req = (u.protocol === 'https:' ? httpsRequest : httpRequest)(u, {
      method: 'GET', lookup: safeLookup, agent: false, timeout: Math.min(4000, left),
      headers: { 'user-agent': PREVIEW_AGENT, accept: types.join(', '), 'accept-language': 'en', 'accept-encoding': 'identity' },
    }, (res) => {
      const code = res.statusCode || 0;
      if (code >= 300 && code < 400 && res.headers.location) {
        res.resume();
        clearTimeout(hard);
        if (hops >= 3) { reject(new Error('too many redirects')); return; }
        let next;
        try { next = new URL(res.headers.location, u).href; } catch (e) { reject(new Error('refused')); return; }
        safeGet(next, { ...o, deadline }, hops + 1).then(resolve, reject);
        return;
      }
      const ctype = String(res.headers['content-type'] || '');
      const type = ctype.split(';')[0].trim().toLowerCase();
      if (code !== 200 || !types.includes(type)) { res.resume(); clearTimeout(hard); resolve({ status: code, type, text: '', url: u.href }); return; }
      const cs = (/charset=["']?([\w-]+)/i.exec(ctype) || [])[1] || 'utf-8';
      const chunks = [];
      let size = 0, done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(hard);
        let text;
        try { text = new TextDecoder(cs, { fatal: false }).decode(Buffer.concat(chunks)); }
        catch (e) { text = Buffer.concat(chunks).toString('utf8'); }
        resolve({ status: code, type, text, url: u.href });
      };
      res.on('data', (c) => {
        if (done) return;
        const room = max - size;
        size += c.length;
        if (c.length >= room) { chunks.push(c.subarray(0, Math.max(0, room))); res.destroy(); finish(); }
        else chunks.push(c);
      });
      res.on('end', finish);
      res.on('error', finish);
    });
    const hard = setTimeout(() => req.destroy(new Error('timeout')), left);
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', (e) => { clearTimeout(hard); reject(e); });
    req.end();
  });
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“',
  mdash: '—', ndash: '–', hellip: '…', middot: '·', copy: '©', reg: '®', trade: '™', bull: '•', laquo: '«', raquo: '»' };
function unentity(s) {
  return String(s || '').replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z]{2,8});/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return n > 0 && n <= 0x10ffff && !(n >= 0xd800 && n <= 0xdfff) ? String.fromCodePoint(n) : '';
    }
    return Object.prototype.hasOwnProperty.call(ENTITIES, e.toLowerCase()) ? ENTITIES[e.toLowerCase()] : m;
  });
}
function clip(s, n) {
  const t = tidy(unentity(String(s || '').replace(/<[^>]*>/g, ' ')));
  if (!t) return '';
  const cs = [...t];
  return cs.length <= n ? t : cs.slice(0, n - 1).join('').replace(/\s+\S*$/, '') + '…';
}

/* A page's title, description and site name, from its head. */
export function metaOf(html) {
  const head = String(html || '').slice(0, 400000);
  const metas = [];
  for (const m of head.matchAll(/<meta\b([^>]*)>/gi)) {
    const at = {};
    for (const a of m[1].matchAll(/([a-zA-Z_:][-\w:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
      at[a[1].toLowerCase()] = a[2] != null ? a[2] : a[3] != null ? a[3] : a[4];
    }
    metas.push(at);
  }
  const pick = (...names) => {
    for (const n of names) {
      const m = metas.find((a) => String(a.property || a.name || '').toLowerCase() === n && a.content);
      if (m) return m.content;
    }
    return '';
  };
  const titleTag = (/<title[^>]*>([\s\S]*?)<\/title>/i.exec(head) || [])[1] || '';
  return {
    title: clip(pick('og:title', 'twitter:title') || titleTag, 200),
    about: clip(pick('og:description', 'twitter:description', 'description'), 300),
    site: clip(pick('og:site_name', 'application-name'), 80),
  };
}

/* The object a page assigns to `name`, cut out of its HTML. */
function jsonAfter(html, name) {
  const at = html.indexOf(name);
  if (at < 0) return null;
  const start = html.indexOf('{', at);
  if (start < 0) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < html.length && i < start + 2000000; i++) {
    const c = html[i];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { try { return JSON.parse(html.slice(start, i + 1)); } catch (e) { return null; } } }
  }
  return null;
}

/* What a YouTube watch page says about its video: the same playabilityStatus
   check-jukebox.py reads, because oEmbed answers for a dead video too. */
export function playerInfo(html) {
  const pr = jsonAfter(String(html || ''), 'ytInitialPlayerResponse');
  if (!pr) return null;
  const ps = pr.playabilityStatus || {}, vd = pr.videoDetails || {};
  const n = parseInt(vd.lengthSeconds, 10);
  return { status: ps.status || null, embed: ps.playableInEmbed === true, title: vd.title || '', channel: vd.author || '',
    length: n > 0 ? n : null, live: !!vd.isLive };
}

export function youtubeId(u) {
  const h = u.hostname.toLowerCase();
  let id = null;
  if (h === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
  else if (/(^|\.)youtube(-nocookie)?\.com$/.test(h)) {
    if (u.pathname === '/watch') id = u.searchParams.get('v');
    else { const m = /^\/(?:shorts|live|embed|v)\/([^/?#]+)/.exec(u.pathname); id = m && m[1]; }
  }
  return cleanVideo(id);
}

/* The preview for one lone link, or null to leave it a plain link. */
export async function previewFor(src, get = safeGet) {
  const href = brassHref(src);
  if (!href) return null;
  let u;
  try { u = new URL(href); } catch (e) { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;
  const host = u.hostname.toLowerCase();
  if (host === 'stimpunks.world' || host === 'www.stimpunks.world') {
    return /^\/(?:[a-z0-9-]+(?:\.html)?)?$/.test(u.pathname) ? { src, href, kind: 'street', path: u.pathname } : null;
  }
  const id = youtubeId(u);
  if (id) {
    const watch = 'https://www.youtube.com/watch?v=' + id;
    let info = null;
    try {
      const r = await get(watch, { max: 1500000, types: ['text/html'] });
      if (r && r.status === 200) info = playerInfo(r.text);
    } catch (e) { info = null; }
    if (info && info.status === 'ERROR') return null;         // gone: a plain link says less that is wrong
    if (!info || !info.title) {
      // A watch page that did not say (a sign-in wall, a consent page): YouTube's
      // oEmbed for the title and channel, and no length, so it is a door.
      try {
        const r = await get('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent(watch), { max: 20000, types: ['application/json'] });
        if (r && r.status === 200) { const j = JSON.parse(r.text); info = { status: null, embed: false, title: j.title || '', channel: j.author_name || '', length: null, live: false }; }
      } catch (e) { /* no preview */ }
    }
    if (!info || !clip(info.title, 200)) return null;
    return { src, href, kind: 'video', id, title: clip(info.title, 200), channel: clip(info.channel, 100) || null,
      length: info.length, live: info.live, embed: info.status === 'OK' && info.embed };
  }
  const r = await get(href, { max: 600000, types: ['text/html', 'application/xhtml+xml'] });
  if (!r || r.status !== 200) return null;
  const m = metaOf(r.text);
  if (!m.title) return null;
  let to = null;
  try { to = new URL(r.url).host; } catch (e) { to = null; }
  return { src, href, kind: 'page', title: m.title, about: m.about || null, site: m.site || null, host: to };
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

/* ── Notifications ───────────────────────────────────────────────────────

   Ryan, 2026-10-18, after several requests and "especially for staff", as
   more chat and operations move onto the street. IT REVERSES "NO ALERTS",
   which the Community Center, the CB guide and the privacy page all said,
   and "closed is off" for notifications only: the radio itself still listens
   only while it is open and in front of you. Ryan's calls the same day: Web
   Push, so a notification reaches a device with the site closed; four things
   that can notify (an @ mention, a message in a room you follow, a call
   starting in a room you follow or the World call, and everything on World),
   each off until switched on, for anybody signed on; and the message's words
   in it, which each device can turn off. A fifth came the same evening: props
   given to a claimed username (notifyProps); and a sixth, a direct message to
   one (notifyDm).

   EVERYTHING, AND WHATEVER IS ADDED LATER (feedback from our community and
   Ryan's call, 2026-10-19, after somebody found new switches off the morning
   after they arrived): one more switch, `all`, which is every kind there is,
   every message on World included, and every kind added after it. So EVERY
   NOTIFIER ASKS wants(), never a switch by name, and check-push.py refuses
   one that does: a kind read directly would stay off for somebody who chose
   everything. It changes neither the rooms a device follows, which stay a
   list, nor whether the words are shown, which is not a kind of notification.

   WHAT IS KEPT is one record per device that switched them on, all in one
   blob (DEVICES), so a message reads one blob to find who to tell: the
   device's push address and the two keys its browser made for it; the handle
   it was switched on as, which kind of pass, and a hash of the pass; and what
   it asked for. NOTHING ABOUT WHAT WAS SENT TO IT IS KEPT, and nothing is
   logged. The address belongs to the browser's own push service (Google's,
   Mozilla's, Apple's or Microsoft's), which carries every notification
   encrypted to the device's keys (RFC 8291), so it cannot read the words,
   though it sees when; an address anywhere else is refused, so this server
   never posts to a place a request chose.

   A DEVICE IS ONLY TOLD WHAT ITS PASS COULD HEAR. The pass is not kept, only
   its hash. Before anything is sent, the pass that device's handle would have
   now is made again, checked against the hash and read by readPass() like any
   other, so a changed password, a claim, a reset, a deletion or somebody taken
   off the moderators' list stops their notifications with nothing to
   remember, and roomAllows() decides every private room, as it does for
   listening. A room that keeps to itself tells only the devices that follow
   it, which needed its address: a mention there tells nobody else, because a
   notification is the room announced outside. Nobody is told about their own
   message. A push service that says a device has gone (404 or 410) has its
   record deleted, and Stop notifications, signing off on that device, Forget
   me and deleting the username delete it too.

   WHO IS IN A CALL IS NOT IN A CALL'S NOTIFICATION, only that one has started
   in that room: who is in a call is shown only to radios seen in its room
   (privacy.html#calls), and a notification would widen that. */
export const PUSH_HOSTS = [/^fcm\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/,
  /^(?:[a-z0-9-]+\.)*push\.apple\.com$/, /^[a-z0-9-]+\.notify\.windows\.com$/];
export const PUSH_DEVICES_MAX = 4000;     // devices on the whole street
export const PUSH_PER_HANDLE = 12;        // devices one handle can have notified
export const PUSH_ROOMS_MAX = 60;         // rooms one device can follow
export const PUSH_WORDS = 180;            // characters of a message in a notification
export const CALL_QUIET = 10 * 60 * 1000; // a room's call tells nobody twice in this long
const DEVICES = 'push-devices';
const CALL_TOLD = 'push-calls';

const unb64 = (v) => Buffer.from(String(v || ''), 'base64url');
export function pushDeviceId(endpoint) {
  return createHash('sha256').update(`stimpunks-push\0${endpoint}`).digest('base64url').slice(0, 27);
}

/* A subscription as the browser made it, checked, or null. */
export function cleanSubscription(sub) {
  if (!sub || typeof sub !== 'object') return null;
  const endpoint = typeof sub.endpoint === 'string' ? sub.endpoint : '';
  if (!endpoint || endpoint.length > 1000) return null;
  let u;
  try { u = new URL(endpoint); } catch (e) { return null; }
  if (u.protocol !== 'https:' || u.username || u.password || u.port || !PUSH_HOSTS.some((re) => re.test(u.hostname))) return null;
  const keys = sub.keys && typeof sub.keys === 'object' ? sub.keys : {};
  const p256dh = unb64(keys.p256dh), auth = unb64(keys.auth);
  if (p256dh.length !== 65 || p256dh[0] !== 4 || auth.length !== 16) return null;
  // The right shape is not enough: a key off the curve can never be sent to.
  try { ECDH.convertKey(p256dh, 'prime256v1'); } catch (e) { return null; }
  return { endpoint, p256dh: b64(p256dh), auth: b64(auth) };
}

/* What a device asked for: a switch per kind and one for every kind, all off
   until switched on, the words, on unless switched off, and the rooms it
   follows. null if it follows too many. */
export const PUSH_KINDS = ['mentions', 'props', 'messages', 'world', 'calls'];
export function cleanWant(w) {
  w = w && typeof w === 'object' && !Array.isArray(w) ? w : {};
  const rooms = Array.isArray(w.rooms) ? [...new Set(w.rooms.map(roomTag).filter(Boolean))] : [];
  if (rooms.length > PUSH_ROOMS_MAX) return null;
  const out = { all: w.all === true };
  for (const k of PUSH_KINDS) out[k] = w[k] === true;
  return { ...out, words: w.words !== false, rooms };
}
/* Whether a device wants this kind: its own switch, or Everything. */
export function wants(w, kind) {
  return !!(w && typeof w === 'object' && (w.all === true || w[kind] === true));
}

/* A pass's parts, which are kept, and its hash; never the pass. */
function passParts(pass) {
  let m = /^cb2\.(acct|base)\.([A-Za-z0-9_-]+)\.(\d{1,9})\.[A-Za-z0-9_-]+$/.exec(String(pass || ''));
  if (m) return { gen: 2, kind: m[1], handle: unb64(m[2]).toString('utf8'), v: Number(m[3]) };
  m = /^cb1\.(mobile|base)\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+$/.exec(String(pass || ''));
  if (m) return { gen: 1, kind: m[1], handle: unb64(m[2]).toString('utf8') };
  return null;
}
const passHash = (pass) => createHash('sha256').update(`stimpunks-push-pass\0${pass}`).digest('base64url');
function passAgain(p) {
  if (!p || typeof p !== 'object' || typeof p.handle !== 'string') return null;
  try {
    if (p.gen === 2) return issueAccountPass(p.handle, p.v, p.kind === 'base' ? 'base' : 'mobile');
    if (p.gen === 1 && (p.kind === 'mobile' || p.kind === 'base')) return issuePass(p.kind, p.handle);
  } catch (e) { /* no password set: nobody's pass is good */ }
  return null;
}
/* Who a device is now, by the street's own rules, or null if its pass is gone. */
async function deviceWho(d, s, mods) {
  const again = passAgain(d && d.pass);
  if (!again || passHash(again) !== d.hash) return null;
  return readPass({ headers: { get: (k) => (String(k).toLowerCase() === 'authorization' ? `Bearer ${again}` : null) } }, mods, s);
}

async function updateMap(key, field, change, s) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    const map = { ...((cur.exists && cur.data && cur.data[field]) || {}) };
    if (change(map) === false) return map;
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, { [field]: map }, opts);
    if (res.modified) return map;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

export async function readDevices(s = store()) {
  const d = await s.get(DEVICES, { type: 'json' });
  return d && d.devices && typeof d.devices === 'object' ? d.devices : {};
}

/* Switch a device's notifications on, or change what it asked for. The pass is
   the one that asked; the device is filed as that handle from now on. */
export async function keepDevice(sub, pass, want, s = store()) {
  const c = cleanSubscription(sub);
  if (!c) return { error: 'address' };
  const w = cleanWant(want);
  if (!w) return { error: 'rooms' };
  const parts = passParts(pass);
  if (!parts) return { error: 'pass' };
  const id = pushDeviceId(c.endpoint);
  const rec = { sub: c, pass: parts, hash: passHash(pass), fold: foldHandle(parts.handle), want: w };
  let error = null;
  await updateMap(DEVICES, 'devices', (devs) => {
    if (!own(devs, id)) {
      if (Object.keys(devs).filter((k) => devs[k].fold === rec.fold).length >= PUSH_PER_HANDLE) { error = 'many'; return false; }
      if (Object.keys(devs).length >= PUSH_DEVICES_MAX) { error = 'full'; return false; }
    }
    devs[id] = rec;
    return true;
  }, s);
  return error ? { error } : { id, want: w };
}

/* What a device asked for, by its address, if it is this handle's. */
export async function readDevice(endpoint, handle, s = store()) {
  const d = (await readDevices(s))[pushDeviceId(String(endpoint || ''))];
  return d && d.fold === foldHandle(handle) ? d.want : null;
}

export async function dropDevice(endpoint, s = store()) {
  const id = pushDeviceId(String(endpoint || ''));
  await updateMap(DEVICES, 'devices', (devs) => { if (!own(devs, id)) return false; delete devs[id]; return true; }, s);
  return true;
}

/* Forget me, and deleting the username: every device switched on as it. */
export async function dropDevicesOf(handle, s = store()) {
  const fold = foldHandle(handle);
  await updateMap(DEVICES, 'devices', (devs) => {
    const ids = Object.keys(devs).filter((k) => devs[k].fold === fold);
    for (const k of ids) delete devs[k];
    return ids.length > 0;
  }, s);
  return true;
}

/* Whether a message names this handle with an @, the way somebody would. */
export function mentions(text, handle) {
  const h = String(handle || '').normalize('NFKC').trim();
  if (!h || !text) return false;
  const esc = h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp(`(^|[^\\p{L}\\p{N}_@])@${esc}(?![\\p{L}\\p{N}_]|:\\d)`, 'iu').test(String(text).normalize('NFKC'));
}

/* THE HANDLES A MESSAGE @MENTIONS, for every radio to draw as names (Ryan's
   ask, 2026-10-19: mentions on the CB, with completions). The sender's radio
   says who it means, the people it offered in its @ list and the ones on the
   channel; this keeps only those mentions() finds in the words, so a message
   can never claim to name somebody it does not, and at most MENTION_MAX of
   them. It is not who gets told: a notification asks mentions() of every
   device's own handle, as it always did. A handle somebody typed by hand and
   nobody offered stays words, which is what it is to every reader. */
export const MENTION_MAX = 10;
export function channelMentions(text, asked) {
  const out = [], folds = new Set();
  if (!text || !Array.isArray(asked)) return out;
  for (const a of asked.slice(0, 60)) {
    const h = typeof a === 'string' ? cleanHandle(a) : null;
    if (!h || folds.has(foldHandle(h)) || !mentions(text, h)) continue;
    folds.add(foldHandle(h));
    out.push(h);
    if (out.length >= MENTION_MAX) break;
  }
  return out;
}

/* ── Sending: RFC 8291's encryption and RFC 8292's VAPID, with node:crypto ── */

function pushKey(raw = process.env.CB_PUSH_KEY) {
  const d = unb64(raw);
  if (d.length !== 32) return null;
  try {
    const e = createECDH('prime256v1');
    e.setPrivateKey(d);
    const pub = e.getPublicKey();
    const key = createPrivateKey({ key: { kty: 'EC', crv: 'P-256', d: b64(d), x: b64(pub.subarray(1, 33)), y: b64(pub.subarray(33)) }, format: 'jwk' });
    return { key, pub: b64(pub) };
  } catch (e) { return null; }
}
/* The street's public key, which a browser needs to subscribe, or null when
   notifications are not set up: then nothing offers them. */
export function pushPublicKey() { const k = pushKey(); return k ? k.pub : null; }
export const pushReady = () => !!pushKey();

/* A notification's body, encrypted to the device's own keys. salt and the
   sender's key can be given, for RFC 8291's worked example in the tests. */
export function encryptPush(payload, sub, { asPrivate, salt } = {}) {
  const ua = unb64(sub.p256dh), authSecret = unb64(sub.auth);
  const ecdh = createECDH('prime256v1');
  if (asPrivate) ecdh.setPrivateKey(asPrivate); else ecdh.generateKeys();
  const asPublic = ecdh.getPublicKey();
  const shared = ecdh.computeSecret(ua);
  const ikm = Buffer.from(hkdfSync('sha256', shared, authSecret, Buffer.concat([Buffer.from('WebPush: info\0'), ua, asPublic]), 32));
  const sl = salt || randomBytes(16);
  const cek = Buffer.from(hkdfSync('sha256', ikm, sl, Buffer.from('Content-Encoding: aes128gcm\0'), 16));
  const nonce = Buffer.from(hkdfSync('sha256', ikm, sl, Buffer.from('Content-Encoding: nonce\0'), 12));
  const c = createCipheriv('aes-128-gcm', cek, nonce);
  const sealed = Buffer.concat([c.update(Buffer.concat([Buffer.from(payload), Buffer.from([2])])), c.final(), c.getAuthTag()]);
  const head = Buffer.alloc(21);
  sl.copy(head, 0);
  head.writeUInt32BE(4096, 16);
  head[20] = asPublic.length;
  return Buffer.concat([head, asPublic, sealed]);
}

export function vapidAuth(endpoint, k, now = Date.now()) {
  const head = b64(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const claims = b64(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(now / 1000) + 3600, sub: 'https://stimpunks.world/privacy.html#notifications' }));
  const sig = cryptoSign('sha256', Buffer.from(`${head}.${claims}`), { key: k.key, dsaEncoding: 'ieee-p1363' });
  return `vapid t=${head}.${claims}.${b64(sig)}, k=${k.pub}`;
}

/* One notification to one device: the push service's answer, or 0 when it
   could not be reached. Never logged. */
export async function sendPush(sub, payload, { ttl = 3600, urgency = 'normal', topic = null } = {}, k = pushKey()) {
  if (!k) return 0;
  const headers = { 'content-encoding': 'aes128gcm', 'content-type': 'application/octet-stream', ttl: String(ttl), urgency,
    authorization: vapidAuth(sub.endpoint, k) };
  if (topic) headers.topic = topic;
  try {
    const r = await fetch(sub.endpoint, { method: 'POST', headers, body: encryptPush(JSON.stringify(payload), sub),
      redirect: 'error', signal: AbortSignal.timeout(8000) });
    return r.status;
  } catch (e) { return 0; }
}

async function deliver(sends, gone, s, send) {
  const answers = await Promise.allSettled(sends.map((x) => send(x.d.sub, x.payload, x.opts)));
  answers.forEach((a, i) => { if (a.status === 'fulfilled' && (a.value === 404 || a.value === 410)) gone.push(sends[i].id); });
  if (gone.length) {
    await updateMap(DEVICES, 'devices', (devs) => {
      let any = false;
      for (const id of gone) if (own(devs, id)) { delete devs[id]; any = true; }
      return any;
    }, s);
  }
  return sends.map((x) => ({ id: x.id, payload: x.payload }));
}
const topicFor = (k) => createHash('sha256').update(`stimpunks-topic\0${k}`).digest('base64url').slice(0, 32);

/* A message has been sent on a channel: tell every device that asked to hear
   it, once each, and none that may not. What a notification carries is what
   the service worker needs to say it: who, where, why, and the words if the
   device wants them. The worker puts a room's name to its tag. */
export function notifyMessage(msg, room, s = store(), mods = readMods(), send = sendPush) {
  return tellDevices(msg, room, null, s, mods, send);
}

/* An edited message tells only the devices it @mentions now and did not
   before (Ryan, 2026-10-18, the forum's rule for an edited post): fixing a
   typo is not news to a room's followers, and a mention added in an edit
   reaches the person it names, once. */
export function notifyEdit(msg, before, room, s = store(), mods = readMods(), send = sendPush) {
  return tellDevices(msg, room, String(before || ''), s, mods, send);
}

async function tellDevices(msg, room, before, s, mods, send) {
  if (send === sendPush && !pushReady()) return [];
  const devs = await readDevices(s);
  const from = foldHandle(msg.handle), quiet = !!(room && quietRoom(room));
  const sends = [], gone = [];
  for (const [id, d] of Object.entries(devs)) {
    if (!d || d.fold === from) continue;
    const w = d.want || {};
    const h = d.pass && d.pass.handle;
    const followed = before === null && (room ? (w.rooms || []).includes(room) : wants(w, 'world'));
    const named = wants(w, 'mentions') && !quiet && mentions(msg.text, h) && !(before && mentions(before, h));
    if (!followed && !named) continue;
    const who = await deviceWho(d, s, mods);
    if (!who) { gone.push(id); continue; }
    if (!roomAllows(who, room)) continue;
    let text = '';
    if (w.words !== false) {
      text = String(msg.text || '').replace(/\s+/g, ' ').trim();
      if ([...text].length > PUSH_WORDS) text = [...text].slice(0, PUSH_WORDS - 1).join('') + '…';
    }
    const what = msg.img ? 'picture' : (msg.sticker || msg.avatar || msg.chimera || msg.patch || msg.jacket) ? 'sticker' : '';
    const payload = { kind: 'message', why: named ? 'mention' : 'channel', handle: msg.handle, room: room || '', text, what, id: msg.id };
    sends.push({ id, d, payload, opts: named ? { urgency: 'high' } : { topic: topicFor(room || 'world') } });
  }
  return deliver(sends, gone, s, send);
}

/* A forum post has @mentioned somebody (Ryan, 2026-10-18): tell each device
   that switched on When somebody @mentions me, whose pass is a claimed
   username's that can read the post's category now, and that the post names
   and, after an edit, did not name before. Never the post's writer. A
   notification says who, which category, and, if the device wants the words,
   the topic's title and the post's first words. */
export async function notifyForum(topic, post, before = '', s = store(), mods = readMods(), send = sendPush) {
  if (send === sendPush && !pushReady()) return [];
  if (!topic || !post || !post.body) return [];
  const cat = forumCat(topic.cat);
  if (!cat) return [];
  const devs = await readDevices(s);
  // A wiki's document says who edited it last, and an edit's mention is theirs.
  const writer = post.editedBy || post.handle;
  const from = foldHandle(writer);
  const sends = [], gone = [];
  for (const [id, d] of Object.entries(devs)) {
    if (!d || d.fold === from || !wants(d.want, 'mentions')) continue;
    const h = d.pass && d.pass.handle;
    if (!mentions(post.body, h) || (before && mentions(before, h))) continue;
    const who = await deviceWho(d, s, mods);
    if (!who) { gone.push(id); continue; }
    if (!forumAllows(who, cat)) continue;
    let text = '', title = '';
    if (d.want.words !== false) {
      text = String(post.body).replace(/\s+/g, ' ').trim();
      if ([...text].length > PUSH_WORDS) text = [...text].slice(0, PUSH_WORDS - 1).join('') + '…';
      title = [...String(topic.title || '')].slice(0, FORUM_TITLE_MAX).join('');
    }
    const payload = { kind: 'forum', why: 'mention', handle: writer, cat: cat.name, title, text, t: topic.id, p: post.id };
    sends.push({ id, d, payload, opts: { urgency: 'high' } });
  }
  return deliver(sends, gone, s, send);
}

/* Somebody has given props (Ryan, 2026-10-18, the follow-up DECISIONS.md
   left open when props shipped): tell each device that switched on When
   somebody gives me props and was switched on as the person they were given
   to, whose pass is still that claimed username's own. Until then a prop
   waited in Profile until its person happened to open it, because nothing on
   the radio lights up or counts. The notification says who wrote it and, if
   the device wants the words, the prop's first words; never how many are
   waiting, and never anything to the writer. A prop waits until its person
   presses Confirm or Reject, so a notification that never arrives loses
   nothing. */
export async function notifyProps(handle, writer, text, s = store(), mods = readMods(), send = sendPush) {
  if (send === sendPush && !pushReady()) return [];
  const to = foldHandle(handle), from = foldHandle(writer);
  if (!to || to === from) return [];
  const devs = await readDevices(s);
  const sends = [], gone = [];
  for (const [id, d] of Object.entries(devs)) {
    if (!d || d.fold !== to || !wants(d.want, 'props')) continue;
    const who = await deviceWho(d, s, mods);
    if (!who) { gone.push(id); continue; }
    if (!who.account || foldHandle(who.handle) !== to) continue;
    let words = '';
    if (d.want.words !== false) {
      words = String(text || '').replace(/\s+/g, ' ').trim();
      if ([...words].length > PUSH_WORDS) words = [...words].slice(0, PUSH_WORDS - 1).join('') + '…';
    }
    sends.push({ id, d, payload: { kind: 'props', handle: String(writer || ''), text: words }, opts: {} });
  }
  return deliver(sends, gone, s, send);
}

/* A direct message has arrived for a claimed username: tell its devices that
   switched on When somebody messages me, and that can still read as that
   username. Who sent it, whether it is a request, whether it is a picture,
   and, if the device wants the words, its first words; never the picture,
   never how many are waiting, and never anything to the sender. A message
   stays on its conversation whether or not this arrives. `said` is its words,
   or the message itself. */
export async function notifyDm(handle, sender, said, asked, s = store(), mods = readMods(), send = sendPush) {
  const text = said && typeof said === 'object' ? said.text : said;
  const picture = !!(said && typeof said === 'object' && said.img);
  const stuck = !!(said && typeof said === 'object' && STICKER_KINDS.some((k) => said[k]));
  if (send === sendPush && !pushReady()) return [];
  const to = foldHandle(handle), from = foldHandle(sender);
  if (!to || to === from) return [];
  const devs = await readDevices(s);
  const sends = [], gone = [];
  for (const [id, d] of Object.entries(devs)) {
    if (!d || d.fold !== to || !wants(d.want, 'messages')) continue;
    const who = await deviceWho(d, s, mods);
    if (!who) { gone.push(id); continue; }
    if (!forumReader(who) || foldHandle(who.handle) !== to) continue;
    let words = '';
    if (d.want.words !== false) {
      words = String(text || '').replace(/\s+/g, ' ').trim();
      if ([...words].length > PUSH_WORDS) words = [...words].slice(0, PUSH_WORDS - 1).join('') + '…';
    }
    const payload = { kind: 'dm', handle: String(sender || ''), asked: !!asked, text: words };
    if (picture) payload.what = 'picture';
    else if (stuck) payload.what = 'sticker';
    sends.push({ id, d, payload, opts: {} });
  }
  return deliver(sends, gone, s, send);
}

/* Somebody has joined a call nobody was in: tell the devices that follow its
   room, or every device that asked about calls for the World call, once in
   CALL_QUIET at most. Never who joined. */
export async function notifyCall(tag, s = store(), mods = readMods(), send = sendPush, now = Date.now()) {
  if (send === sendPush && !pushReady()) return [];
  let fresh = false;
  await updateMap(CALL_TOLD, 'told', (told) => {
    for (const k of Object.keys(told)) if (now - told[k] > CALL_QUIET) delete told[k];
    if (own(told, tag)) return false;
    told[tag] = now;
    fresh = true;
    return true;
  }, s);
  if (!fresh) return [];
  const devs = await readDevices(s);
  const sends = [], gone = [];
  for (const [id, d] of Object.entries(devs)) {
    const w = (d && d.want) || {};
    if (!wants(w, 'calls') || !(tag === WORLD_CALL || (w.rooms || []).includes(tag))) continue;
    const who = await deviceWho(d, s, mods);
    if (!who) { gone.push(id); continue; }
    if (tag !== WORLD_CALL && !roomAllows(who, tag)) continue;
    sends.push({ id, d, payload: { kind: 'call', room: tag }, opts: { ttl: 900, topic: topicFor(`call ${tag}`) } });
  }
  return deliver(sends, gone, s, send);
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

/* ── Taking a message off ─────────────────────────────────────────────────

   Ryan, 2026-10-08: anybody can take their own message off the air, with the
   same Take off the base station has on every message. This is the one place
   that decides whose a message is, and the answer is the handle on it, folded
   the way every handle here is: no record of who sent what is kept for this,
   and none is needed. Two marks narrow it, so that a name nobody holds any more
   cannot reach back to what was said under it:

   · a message marked CLAIMED comes off only for a pass that is that claimed
     username's own. A username deleted at noon and signed on as by somebody
     else with the community password cannot take off what its owner said
     that morning.
   · a message from the base comes off only for the base.

   An unclaimed handle is whatever somebody typed, so anybody signed on as it
   can take off what was said under it, the same as they could have said it.
   The base can take off any message. Clearing a whole channel is the base's
   alone, and is decided in cb-moderate, not here. */
export function canTakeOff(who, m) {
  if (!who || !m) return false;
  if (who.role === 'base') return true;
  if (m.base) return false;
  if (foldHandle(m.handle) !== foldHandle(who.handle)) return false;
  return !m.claimed || !!who.account;
}

/* ── Editing a message ────────────────────────────────────────────────────

   Ryan, 2026-10-18: anybody can edit their own messages on the CB. The words
   are replaced and nothing else is: the handle, the marks, the time it was
   sent, its picture or sticker and its reactions stay as they were, and it
   still goes 48 hours after it was SENT, because onAir reads `t` and an edit
   never touches it. What it adds is `edited`, the time of the latest edit,
   which every radio shows beside the message.

   THE WORDS IT REPLACES ARE NOT KEPT. There is no history of a message,
   here or anywhere: the friendly edit is a list of earlier versions "for
   transparency", which would keep the words somebody chose to take back.
   The mark is what tells everybody it changed.

   ONLY WHOEVER SENT IT, and this is canTakeOff without the base's reach: the
   base can take any message off the air, and putting words in somebody
   else's mouth is not the same power. So the handle must be the sender's,
   folded; a CLAIMED message edits only for that username's own password; and
   a BASE message only for the base, under the same handle. An unclaimed
   handle is whatever somebody typed, so anybody signed on as it can edit
   what was said under it, as they could take it off, and the mark says so. */
export function canEdit(who, m) {
  if (!who || !m) return false;
  if (foldHandle(m.handle) !== foldHandle(who.handle)) return false;
  if (m.base) return who.role === 'base';
  return !m.claimed || !!who.account;
}

/* The next list with message `id`'s words replaced by `text`, or why not:
   'gone', 'not yours', 'bad' (too long, or nothing but spaces) or 'empty'
   (no words left and nothing else in the message, which is Take off's job).
   The same words again change nothing and answer `same`. */
export function editMessage(list, id, text, who, now = Date.now(), asked = null) {
  const i = list.findIndex((m) => m.id === id);
  if (i < 0) return { why: 'gone' };
  const m = list[i];
  if (!canEdit(who, m)) return { why: 'not yours' };
  const words = text == null || String(text).trim() === '' ? '' : cleanMessage(text);
  if (words === null) return { why: 'bad' };
  const more = m.img || m.sticker || m.avatar || m.chimera || m.patch || m.jacket;
  if (!words && !more) return { why: 'empty' };
  if (words === (m.text || '')) return { same: true, list };
  const next = list.slice();
  next[i] = { ...m, text: words, edited: now };
  // Who it @mentions is worked out again from the new words: the names the
  // radio offered now, and the ones it named before, if they are still there.
  const named = channelMentions(words, [...(Array.isArray(asked) ? asked : []), ...(m.at || [])]);
  if (named.length) next[i].at = named; else delete next[i].at;
  return { list: next, before: m.text || '', msg: next[i] };
}

/* ── Reactions ────────────────────────────────────────────────────────────

   Ryan's brief, 2026-09-30: reactions on CB messages. A reaction is one of a
   fixed set, pressed on a message, and pressed again to take it back. It is
   part of its message: it goes when the message goes, 48 hours after it was
   sent at the latest, and taking a message off the air takes its reactions
   with it.

   NOBODY IS COUNTED. A reaction shows WHO reacted, by handle, in alphabetical
   order, and never how many: that is the street's no-headcount rule, the same
   one "Be seen here" keeps, and a number beside a heart is exactly the
   friendly edit it refuses. shape() sends the handles and no count; the radio
   draws the handles. The set is the quick row, each with a name for the
   button's label; Ryan added our community's usual ten the same evening,
   and the hundred points on 2026-10-17.

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
  ['\u{1F4AF}', 'hundred points'],
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
    if (typeof m.edited === 'number') out.edited = m.edited;
    if (Array.isArray(m.at) && m.at.length) out.at = m.at.slice(0, MENTION_MAX);
    if (m.img) { out.img = m.img; out.alt = m.alt || ''; }
    const st = m.sticker && shapeSticker(m.sticker);
    if (st) out.sticker = st;
    const av = m.avatar && shapeAvatarSticker(m.avatar);
    if (av) out.avatar = av;
    const ch = m.chimera && shapeChimeraSticker(m.chimera);
    if (ch) out.chimera = ch;
    const pt = m.patch && shapePatchSticker(m.patch);
    if (pt) out.patch = pt;
    const jk = m.jacket && shapeJacketSticker(m.jacket);
    if (jk) out.jacket = jk;
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

/* ── Tasks ────────────────────────────────────────────────────────────────

   Ryan's brief, 2026-10-20: the team's to-do list, moved here from EspoCRM,
   which costs $45 a month and is not part of the street, built in stages:
   the tasks and their list first, then Kanban and saved filters, recurring
   tasks, and a timeline. data/tasks.json says who reads them and what a
   status, a priority and a tag may be, written in here by tools/make-tasks.py.

   ONLY THE ROLES IN TASK_SEE, AND AN ADMINISTRATOR, on a claimed username
   (tasksAllow). Everybody else is told nothing, not even that there are any.
   A task may be assigned only to somebody who could read it (taskPeople,
   from CB_MODS), and keeps whoever it had when that person leaves the list.

   ONE BLOB HOLDS EVERY TASK (`tasks`), written with the boards' conditional
   write: a team's list is hundreds of tasks, not millions, so a list and its
   filters are worked out from the whole of it, in the browser. A change sends
   only the fields it changes, and they are laid over the task as it is now,
   so two people changing different things at once both keep theirs.

   NUMBERS BESIDE THINGS ARE FINE HERE (Ryan's call, the same day): the street's
   rule against counting does not apply to tasks or to backend tools.

   NOTHING ANYBODY TYPES IS LOGGED, here as everywhere in this file. */
/* tasks:settings:begin -- written by tools/make-tasks.py from data/tasks.json. Do not hand-edit. */
export const TASK_SEE = ["director"];
export const TASK_STATUSES = ["Not Started", "Started", "Completed", "Canceled", "Deferred"];
export const TASK_DONE = ["Completed", "Canceled"];
export const TASK_BOARD_HIDES = ["Canceled"];
export const TASK_REPEATS = {"Weekly": {"days": 7}, "Every 2 Weeks": {"days": 14}, "Monthly": {"months": 1}};
export const TASK_COLOURS = ["blue", "orange", "aqua", "yellow", "magenta", "green", "violet"];
export const TASK_TAG_COLOURS = {"Operations": "blue", "Systems": "blue", "Business Papers": "blue", "Finance": "orange", "Fundraising": "orange", "Outside Grants": "orange", "Grantmaking": "orange", "Community": "aqua", "Connection Requests": "aqua", "Networking/Social": "aqua", "Volunteering": "aqua", "Meetings": "yellow", "Events": "yellow", "Editorial": "magenta", "Learning Center": "magenta", "Resource Research": "magenta", "Shop": "green", "Merch": "green", "Professional Development": "violet", "Coping": "violet", "Time Off": "violet"};
export const TASK_PRIORITIES = ["Low", "Normal", "High", "Urgent"];
export const TASK_DEFAULT_PRIORITY = "Normal";
export const TASK_TAGS = ["Business Papers", "Operations", "Editorial", "Community", "Connection Requests", "Coping", "Events", "Finance", "Fundraising", "Grantmaking", "Learning Center", "Meetings", "Merch", "Monthly", "Networking/Social", "Outside Grants", "Professional Development", "Resource Research", "Shop", "Systems", "Time Off", "Volunteering", "Weekly"];
/* tasks:settings:end */
export const TASK_NAME_MAX = 200;
export const TASK_BODY_MAX = FORUM_BODY_MAX;
const TASKS = 'tasks';
const TASKS_GONE = 'tasks-gone';    // EspoCRM's ids of tasks brought over and deleted here, so a later import leaves them deleted
const NO_TASKS = 'Tasks are for our directors and administrators, on a claimed username.';

/* Who reads and changes tasks: a claimed username on the base pass, holding
   one of TASK_SEE's roles or administrator. */
export function tasksAllow(who) {
  if (!forumReader(who) || who.role !== 'base' || !who.roles) return false;
  return who.roles.has('administrator') || TASK_SEE.some((r) => who.roles.has(r));
}

/* Everybody a task can be assigned to: the handles on CB_MODS that could
   read it, alphabetical. */
export function taskPeople(mods = readMods()) {
  if (!mods) return [];
  return [...mods.values()].filter((m) => m.roles.has('administrator') || TASK_SEE.some((r) => m.roles.has(r)))
    .map((m) => m.handle).sort((a, b) => a.localeCompare(b));
}

export function taskId(v) { return typeof v === 'string' && /^k[A-Za-z0-9_-]{12}$/.test(v) ? v : null; }
const newTaskId = () => 'k' + randomBytes(9).toString('base64url');
const day = (v) => (v == null || v === '' ? null : (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v + 'T00:00:00Z')) ? v : undefined));

export async function readTasks(s = store()) {
  const d = await s.get(TASKS, { type: 'json' });
  return d && Array.isArray(d.tasks) ? d.tasks : [];
}

/* The fields a change asks for, checked: { fields } or { error }. Only the
   fields present are there; `had` is the task as it is, if there is one. */
function taskFields(f, had, people) {
  const out = {};
  const inPeople = (h) => people.some((p) => foldHandle(p) === foldHandle(h)) || (had && (foldHandle(had.who || '') === foldHandle(h) || (had.with || []).some((x) => foldHandle(x) === foldHandle(h))));
  const pick = (h) => people.find((p) => foldHandle(p) === foldHandle(h)) || h;
  if (f.name !== undefined) {
    const n = tidy(f.name);
    if (!n || [...n].length > TASK_NAME_MAX) return { error: `A task's name is between one and ${TASK_NAME_MAX} characters.` };
    out.name = n;
  }
  if (f.status !== undefined) {
    if (!TASK_STATUSES.includes(f.status)) return { error: `A status is one of ${TASK_STATUSES.join(', ')}.` };
    out.status = f.status;
  }
  if (f.priority !== undefined) {
    if (!TASK_PRIORITIES.includes(f.priority)) return { error: `A priority is one of ${TASK_PRIORITIES.join(', ')}.` };
    out.priority = f.priority;
  }
  for (const [k, word] of [['start', 'start'], ['due', 'due date']]) {
    if (f[k] === undefined) continue;
    const d = day(f[k]);
    if (d === undefined) return { error: `A ${word} is a day, as YYYY-MM-DD, or nothing.` };
    out[k] = d;
  }
  if (f.body !== undefined) {
    const b = f.body == null || String(f.body).trim() === '' ? '' : cleanForumBody(f.body, TASK_BODY_MAX);
    if (b === null) return { error: `A task's description is up to ${TASK_BODY_MAX} characters.` };
    out.body = b;
  }
  if (f.who !== undefined) {
    if (f.who == null || f.who === '') out.who = null;
    else if (typeof f.who !== 'string' || !inPeople(f.who)) return { error: 'A task is assigned to somebody who can read tasks, or to nobody.' };
    else out.who = pick(f.who);
  }
  if (f.with !== undefined) {
    if (!Array.isArray(f.with) || f.with.length > 20 || f.with.some((h) => typeof h !== 'string' || !inPeople(h))) return { error: 'Everybody working on a task can read tasks.' };
    out.with = [...new Set(f.with.map(pick))].sort((a, b) => a.localeCompare(b));
  }
  if (f.tags !== undefined) {
    if (!Array.isArray(f.tags) || f.tags.some((t) => !TASK_TAGS.includes(t))) return { error: `A tag is one of ${TASK_TAGS.join(', ')}.` };
    out.tags = TASK_TAGS.filter((t) => f.tags.includes(t));
  }
  return { fields: out };
}

/* A task as a reader is sent it: everything, the description as nodes too
   when `whole`, and only its length otherwise, for the list. */
export function shapeTask(t, whole = false) {
  const out = { id: t.id, name: t.name, status: t.status, priority: t.priority, start: t.start || null, due: t.due || null,
    done: t.done || null, who: t.who || null, with: t.with || [], tags: t.tags || [], t: t.t, by: t.by,
    edited: t.edited || null, editedBy: t.editedBy || null };
  if (t.espo) out.espo = t.espo;
  if (t.recur) { out.recur = t.recur; out.on = t.on; }
  if (whole) {
    out.body = t.body || '';
    out.blocks = parseBrass(t.body || '', { boxes: true });
    out.ticks = taskBoxes(t.body || '').agree;
  } else out.words = [...(t.body || '')].length;
  return out;
}

export async function tasksList(who, s = store()) {
  if (!tasksAllow(who)) return null;
  return (await readTasks(s)).map((t) => shapeTask(t));
}
export async function taskOne(who, id, s = store()) {
  if (!tasksAllow(who)) return null;
  const t = (await readTasks(s)).find((x) => x.id === taskId(id));
  return t ? shapeTask(t, true) : null;
}

/* A task made, or changed: `f.id` names one to change, and `f.espo`, EspoCRM's
   id for a task brought over, changes the one brought over before rather than
   making it twice. Answers { task } or { error }. A task brought over keeps
   when EspoCRM says it was made and finished, and who made it; any other keeps
   now, and the director making it.

   BRINGING TASKS OVER AGAIN, until the cut-over, adds what EspoCRM has made
   since and refreshes what nobody here has changed: an import is not a change
   by anybody, so it never sets `edited`, and the importer leaves alone any
   task that has one. A task brought over and deleted here stays deleted. */
export async function saveTask(who, f, s = store(), now = Date.now(), mods = readMods()) {
  if (!tasksAllow(who)) return { error: NO_TASKS };
  f = f || {};
  const espo = typeof f.espo === 'string' && /^[A-Za-z0-9]{6,40}$/.test(f.espo) ? f.espo : null;
  if (f.espo != null && !espo) return { error: 'That is not an EspoCRM id.' };
  const people = taskPeople(mods);
  if (espo && (await readTaskGone(s)).includes(espo)) return { error: 'That task was brought over and deleted here, so it stays deleted.' };
  let saved = null, why = null;
  await updateList(TASKS, 'tasks', (list) => {
    why = null; saved = null;
    const k = f.id != null ? list.findIndex((x) => x.id === taskId(f.id)) : (espo ? list.findIndex((x) => x.espo === espo) : -1);
    if (f.id != null && k < 0) { why = 'That task has been deleted.'; return null; }
    const had = k >= 0 ? list[k] : null;
    const r = taskFields(f, had, people);
    if (r.error) { why = r.error; return null; }
    const next = had ? { ...had, ...r.fields } : { id: newTaskId(), name: null, status: TASK_STATUSES[0], priority: TASK_DEFAULT_PRIORITY,
      start: null, due: null, body: '', who: null, with: [], tags: [], t: now, by: who.handle, ...r.fields };
    if (!next.name) { why = 'Give the task a name.'; return null; }
    if (espo) next.espo = espo;
    // Finished when it became Completed, and not finished when it stops being.
    if (next.status === 'Completed' && !(had && had.status === 'Completed')) next.done = now;
    if (next.status !== 'Completed') delete next.done;
    if (espo) {
      for (const [key, v] of [['t', f.t], ['done', f.done]]) if (typeof v === 'number' && v > 0 && v <= now) next[key] = v;
      if (typeof f.by === 'string' && cleanHandle(f.by)) next.by = cleanHandle(f.by);
    }
    if (espo) next.synced = now;
    else if (had) { next.edited = now; next.editedBy = who.handle; }
    saved = next;
    const copy = list.slice();
    if (had) copy[k] = next; else copy.push(next);
    return copy;
  }, s);
  if (why) return { error: why };
  return { task: shapeTask(saved, true) };
}

/* A checkbox in a task's description ticked or unticked in place, as EspoCRM's
   could be: box `n`, whose words the page saw were `text`, set to `on`. Only
   that line of the description changes, laid over the description as it is
   now, so two people ticking different boxes at once both keep theirs; if the
   box has moved or its words changed since the page drew it, nothing changes
   and the answer says to look again. A tick is a change, so it says who. */
export async function tickTask(who, id, n, text, on, s = store(), now = Date.now()) {
  if (!tasksAllow(who)) return { error: NO_TASKS };
  if (!Number.isInteger(n) || n < 0 || typeof text !== 'string' || typeof on !== 'boolean') return { error: 'Tick which box?' };
  let saved = null, why = null;
  await updateList(TASKS, 'tasks', (list) => {
    saved = null; why = null;
    const k = list.findIndex((x) => x.id === taskId(id));
    if (k < 0) { why = 'That task has been deleted.'; return null; }
    const b = taskBoxes(list[k].body || '');
    const box = b.agree ? b.found[n] : null;
    if (!box || box.raw !== text.trim()) { why = 'That checkbox has changed since the task was drawn. Look again.'; return null; }
    const line = b.lines[box.k];
    if ((line[box.at + 1] !== ' ') === on) { saved = list[k]; return null; }
    const lines = b.lines.slice();
    lines[box.k] = line.slice(0, box.at) + (on ? '[x]' : '[ ]') + line.slice(box.at + 3);
    saved = { ...list[k], body: lines.join('\n'), edited: now, editedBy: who.handle };
    const copy = list.slice(); copy[k] = saved; return copy;
  }, s);
  if (why) return { error: why };
  return { task: shapeTask(saved, true) };
}

export async function removeTask(who, id, s = store()) {
  if (!tasksAllow(who)) return { error: NO_TASKS };
  let gone = null;
  await updateList(TASKS, 'tasks', (list) => {
    const k = list.findIndex((x) => x.id === taskId(id));
    gone = k >= 0 ? list[k] : null;
    return gone ? list.filter((_, i) => i !== k) : null;
  }, s);
  if (!gone) return { error: 'That task has already been deleted.' };
  if (gone.espo) await updateList(TASKS_GONE, 'ids', (ids) => (ids.includes(gone.espo) ? null : [...ids, gone.espo]), s);
  return { gone: true };
}
async function readTaskGone(s) {
  const d = await s.get(TASKS_GONE, { type: 'json' });
  return d && Array.isArray(d.ids) ? d.ids : [];
}

/* SAVED FILTERS are each reader's own (Ryan's stage two, 2026-10-20): a name
   and the address of a list or a board, the part after the # that holds its
   filters, order and columns, kept under the pet key in one blob,
   task-views/<pet key>, holding each one's id, name and address and nothing
   about when. Nobody else is told what anybody has saved. The browser works
   out how many tasks each one shows, from the list it already has. Forget me
   and deleting the username delete them. */
export const TASK_VIEWS_KEEP = 40;
export const TASK_VIEW_NAME_MAX = 60;
const TASK_VIEW_ADDRESS_MAX = 1000;
const TASK_VIEW_KEYS = new Set(['q', 'status', 'priority', 'tags', 'who', 'due', 'sort', 'dir', 'cols', 'from', 'span']);
const taskViewsBlob = (k) => `task-views/${k}`;
const taskViewId = (v) => (typeof v === 'string' && /^v[A-Za-z0-9_-]{10}$/.test(v) ? v : null);

/* An address a saved filter may hold: #/ for the list, #/board for the board
   or #/timeline for the timeline, and after a ? only the filters tasks.js
   writes, each once, encoded as it encodes them. Anything else is null. */
export function taskAddress(v) {
  if (typeof v !== 'string' || v.length > TASK_VIEW_ADDRESS_MAX) return null;
  const m = /^#\/(board|timeline)?(?:\?([A-Za-z0-9%._~!*'(),&=+-]*))?$/.exec(v);
  if (!m) return null;
  const seen = new Set();
  for (const kv of (m[2] || '').split('&').filter(Boolean)) {
    const [k, ...rest] = kv.split('=');
    if (!TASK_VIEW_KEYS.has(k) || seen.has(k) || !rest.length) return null;
    seen.add(k);
    try { decodeURIComponent(rest.join('=')); } catch (e) { return null; }
  }
  return v;
}

export async function taskViews(who, s = store()) {
  if (!tasksAllow(who)) return null;
  const d = await s.get(taskViewsBlob(petKey(who.handle)), { type: 'json' });
  return d && Array.isArray(d.views) ? d.views : [];
}

/* Save a list's or a board's address under a name, as a new saved filter or
   in place of the one `f.id` names. { views } or { error }. */
export async function saveTaskView(who, f, s = store()) {
  if (!tasksAllow(who)) return { error: NO_TASKS };
  f = f || {};
  const name = cleanUpTo(f.name, TASK_VIEW_NAME_MAX);
  if (!name) return { error: `Name it, in up to ${TASK_VIEW_NAME_MAX} characters.` };
  const address = taskAddress(f.address);
  if (!address) return { error: 'That is not the address of a list or a board of tasks.' };
  const id = f.id != null ? taskViewId(f.id) : null;
  if (f.id != null && !id) return { error: 'That saved filter has been deleted.' };
  let why = null;
  const views = await updateList(taskViewsBlob(petKey(who.handle)), 'views', (list) => {
    why = null;
    const k = id ? list.findIndex((x) => x.id === id) : -1;
    if (id && k < 0) { why = 'That saved filter has been deleted.'; return null; }
    if (list.some((x, i) => i !== k && foldHandle(x.name) === foldHandle(name))) { why = `You already have a saved filter called “${name}”.`; return null; }
    if (k < 0 && list.length >= TASK_VIEWS_KEEP) { why = `You keep up to ${TASK_VIEWS_KEEP} saved filters. Delete one first.`; return null; }
    const copy = list.slice();
    if (k >= 0) copy[k] = { id, name, address };
    else copy.push({ id: 'v' + randomBytes(8).toString('base64url').slice(0, 10), name, address });
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  }, s);
  return why ? { error: why } : { views };
}

export async function removeTaskView(who, id, s = store()) {
  if (!tasksAllow(who)) return { error: NO_TASKS };
  const v = taskViewId(id);
  let had = false;
  const views = await updateList(taskViewsBlob(petKey(who.handle)), 'views', (list) => {
    had = list.some((x) => x.id === v);
    return had ? list.filter((x) => x.id !== v) : null;
  }, s);
  return had ? { views } : { error: 'That saved filter has already been deleted.' };
}

/* Forget me, and deleting the username. */
export async function forgetTaskViews(pk, s = store()) {
  await s.delete(taskViewsBlob(pk));
  return true;
}

/* RECURRING TASKS (Ryan's stage three, 2026-10-20), after EspoCRM's: a task
   that comes round again, weekly, every 2 weeks or monthly (TASK_REPEATS, from
   data/tasks.json). Every one is the team's, like a task, in one blob,
   task-recurs, and each keeps its name, description, who its tasks go to and
   who else is on them, their priority and tags, how often, `next` (the day it
   next makes a task), `day` (a monthly one's day of the month), `startAfter`
   and `dueAfter` (days after that day), `on`, who made it and changed it and
   when, and EspoCRM's id for one brought over.

   ON ITS DAY THE TASK IS MADE BY ITSELF, AS ESPOCRM DID IT: starting startAfter
   days after the day and due dueAfter days after, the name's {week}, {year} and
   {month} filled in from the day, and the day moved on. "Its day" is the
   street's clock, Colorado's (today()), and the making is makeRecurring(), run
   every hour by cb-recur.mjs and whenever a director opens the list, so a task
   is there within the hour after midnight there. A made task keeps `recur` and
   `on`, which recurring task and which day, and makeRecurring never makes one
   that is already there, so two runs at once make it once. Missed days (the
   hourly run stopped) are each made, up to TASK_CATCH_UP; SWITCHED OFF IS OFF:
   switching one on again starts it from its next day still to come, without
   the ones it missed, because a switched-off recurring task was asked to make
   nothing. Deleting one leaves the tasks it made. */
export const TASK_RECURS_KEEP = 200;
export const TASK_AFTER_MAX = 366;          // days after its day a made task may start or be due
const TASK_RECURS = 'task-recurs';
const TASK_CATCH_UP = 12;                   // days one recurring task makes in one run, if runs were missed
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function recurId(v) { return typeof v === 'string' && /^r[A-Za-z0-9_-]{12}$/.test(v) ? v : null; }
const newRecurId = () => 'r' + randomBytes(9).toString('base64url');

// A day as a whole number of days, so no clock change can move one.
const dayNumber = (d) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 86400000;
const dayFrom = (n) => new Date(n * 86400000).toISOString().slice(0, 10);
export function addDays(d, n) { return dayFrom(dayNumber(d) + n); }

/* The ISO week a day is in, and that week's year: a week starts on Monday, and
   week 1 is the one holding the year's first Thursday, so 2027-01-01 is in
   week 53 of 2026. */
export function isoWeek(d) {
  const n = dayNumber(d), monday0 = (new Date(n * 86400000).getUTCDay() + 6) % 7;
  const thursday = n - monday0 + 3;
  const year = new Date(thursday * 86400000).getUTCFullYear();
  return { week: Math.floor((thursday - Date.UTC(year, 0, 1) / 86400000) / 7) + 1, year };
}

/* A recurring task's name on a day: {week} the ISO week, {month} the month's
   name, and {year} the year, which in a name that has {week} in it is that
   week's year, so "Week 53 of 2026" never becomes "Week 53 of 2027". */
export function recurName(template, d) {
  const w = isoWeek(d);
  const year = /\{week\}/.test(template) ? w.year : +d.slice(0, 4);
  return template.replace(/\{week\}/g, String(w.week)).replace(/\{year\}/g, String(year))
    .replace(/\{month\}/g, MONTH_NAMES[+d.slice(5, 7) - 1]);
}

/* The day after `d` that a recurring task comes round on: so many days on, or
   so many months on to its own day of the month (`day`), or the month's last
   day when that month is shorter. */
export function recurAfter(r, d) {
  const step = TASK_REPEATS[r.repeats] || TASK_REPEATS[Object.keys(TASK_REPEATS)[0]];
  if (step.days) return addDays(d, step.days);
  const m0 = +d.slice(5, 7) - 1 + step.months, y = +d.slice(0, 4) + Math.floor(m0 / 12), m = ((m0 % 12) + 12) % 12;
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const day = Math.min(r.day || +d.slice(8, 10), last);
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export async function readRecurs(s = store()) {
  const d = await s.get(TASK_RECURS, { type: 'json' });
  return d && Array.isArray(d.recurs) ? d.recurs : [];
}

/* The task a recurring task makes for a day. Nobody's name is on it as its
   maker: it says which recurring task made it, and for which day. */
function recurTask(r, d, now) {
  return { id: newTaskId(), name: recurName(r.name, d), status: TASK_STATUSES[0], priority: r.priority,
    start: addDays(d, r.startAfter || 0), due: addDays(d, r.dueAfter || 0), body: r.body || '', who: r.who || null,
    with: r.with || [], tags: r.tags || [], t: now, by: null, recur: r.id, on: d };
}

/* Make every task a switched-on recurring task owes, on or before today, and
   move its next day on. { made } is how many tasks were made. Safe to run at
   any moment, any number of times at once: a task already there for that
   recurring task and that day is never made again. */
export async function makeRecurring(s = store(), now = Date.now()) {
  const day = today(new Date(now));
  const due = (await readRecurs(s)).filter((r) => r.on && r.next && r.next <= day);
  if (!due.length) return { made: 0 };
  const want = [];
  for (const r of due) {
    let d = r.next;
    for (let i = 0; i < TASK_CATCH_UP && d <= day; i++) { want.push({ r, d }); d = recurAfter(r, d); }
  }
  let made = 0;
  await updateList(TASKS, 'tasks', (list) => {
    const there = new Set(list.filter((t) => t.recur).map((t) => t.recur + ' ' + t.on));
    const add = want.filter((w) => !there.has(w.r.id + ' ' + w.d)).map((w) => recurTask(w.r, w.d, now));
    made = add.length;
    return add.length ? list.concat(add) : null;
  }, s);
  await updateList(TASK_RECURS, 'recurs', (list) => {
    let moved = false;
    const next = list.map((r) => {
      if (!r.on || !r.next || r.next > day || !due.some((x) => x.id === r.id)) return r;
      let d = r.next;
      while (d <= day) d = recurAfter(r, d);
      moved = true;
      return { ...r, next: d };
    });
    return moved ? next : null;
  }, s);
  return { made };
}

/* A recurring task as a director is shown it, with the next three days it will
   come round on and what each task will be, worked out by the same functions
   that will make them. */
export function shapeRecur(r, whole = false) {
  const out = { id: r.id, name: r.name, priority: r.priority, who: r.who || null, with: r.with || [], tags: r.tags || [],
    repeats: r.repeats, next: r.next, startAfter: r.startAfter || 0, dueAfter: r.dueAfter || 0, on: !!r.on,
    t: r.t, by: r.by, edited: r.edited || null, editedBy: r.editedBy || null };
  if (r.espo) out.espo = r.espo;
  const coming = [];
  for (let d = r.next, i = 0; d && i < 3; i++, d = recurAfter(r, d)) {
    coming.push({ on: d, name: recurName(r.name, d), start: addDays(d, r.startAfter || 0), due: addDays(d, r.dueAfter || 0) });
  }
  out.coming = coming;
  if (whole) { out.body = r.body || ''; out.blocks = parseBrass(r.body || '', { boxes: true }); } else out.words = [...(r.body || '')].length;
  return out;
}

export async function taskRecurs(who, s = store()) {
  if (!tasksAllow(who)) return null;
  return (await readRecurs(s)).map((r) => shapeRecur(r));
}
export async function taskRecur(who, id, s = store()) {
  if (!tasksAllow(who)) return null;
  const r = (await readRecurs(s)).find((x) => x.id === recurId(id));
  return r ? shapeRecur(r, true) : null;
}

/* A recurring task made, or changed, as saveTask does a task: only the fields
   sent change, `espo` brings one over again rather than twice, and one brought
   over arrives switched off, so it makes nothing beside EspoCRM's until somebody
   switches it on. Its next day is a day; switched on, it is today or later. */
export async function saveRecur(who, f, s = store(), now = Date.now(), mods = readMods()) {
  if (!tasksAllow(who)) return { error: NO_TASKS };
  f = f || {};
  const espo = typeof f.espo === 'string' && /^[A-Za-z0-9]{6,40}$/.test(f.espo) ? f.espo : null;
  if (f.espo != null && !espo) return { error: 'That is not an EspoCRM id.' };
  const people = taskPeople(mods);
  if (espo && (await readTaskGone(s)).includes(espo)) return { error: 'That recurring task was brought over and deleted here, so it stays deleted.' };
  const todayIs = today(new Date(now));
  let saved = null, why = null;
  await updateList(TASK_RECURS, 'recurs', (list) => {
    why = null; saved = null;
    const k = f.id != null ? list.findIndex((x) => x.id === recurId(f.id)) : (espo ? list.findIndex((x) => x.espo === espo) : -1);
    if (f.id != null && k < 0) { why = 'That recurring task has been deleted.'; return null; }
    const had = k >= 0 ? list[k] : null;
    if (!had && list.length >= TASK_RECURS_KEEP) { why = `There can be up to ${TASK_RECURS_KEEP} recurring tasks. Delete one first.`; return null; }
    const pick = {};
    for (const key of ['name', 'priority', 'body', 'who', 'with', 'tags']) if (f[key] !== undefined) pick[key] = f[key];
    const r = taskFields(pick, had, people);
    if (r.error) { why = r.error; return null; }
    const out = r.fields;
    if (f.repeats !== undefined) {
      if (!Object.hasOwn(TASK_REPEATS, f.repeats)) { why = `A recurring task comes round ${Object.keys(TASK_REPEATS).join(', ')}.`; return null; }
      out.repeats = f.repeats;
    }
    for (const [key, word] of [['startAfter', 'starts'], ['dueAfter', 'is due']]) {
      if (f[key] === undefined) continue;
      if (!Number.isInteger(f[key]) || f[key] < 0 || f[key] > TASK_AFTER_MAX) { why = `Each task ${word} a whole number of days after its day, from 0 to ${TASK_AFTER_MAX}.`; return null; }
      out[key] = f[key];
    }
    if (f.next !== undefined) {
      const d = day(f.next);
      if (!d) { why = 'Its next day is a day, as YYYY-MM-DD.'; return null; }
      out.next = d;
      out.day = +d.slice(8, 10);
    }
    if (f.on !== undefined) out.on = f.on === true;
    const next = had ? { ...had, ...out } : { id: newRecurId(), name: null, priority: TASK_DEFAULT_PRIORITY, body: '', who: null,
      with: [], tags: [], repeats: Object.keys(TASK_REPEATS)[0], next: null, day: null, startAfter: 0, dueAfter: 0, on: !espo,
      t: now, by: who.handle, ...out };
    if (!next.name) { why = 'Give the recurring task a name.'; return null; }
    if (!next.next) { why = 'Say the next day it makes a task.'; return null; }
    if (next.dueAfter < next.startAfter) { why = 'A task cannot be due before it starts.'; return null; }
    if (next.on && next.next < todayIs) {
      // A day already gone, asked for in so many words, is a mistake; one left behind while switched off is skipped.
      if (f.next !== undefined) { why = 'Switched on, its next day is today or later.'; return null; }
      let d = next.next;
      while (d < todayIs) d = recurAfter(next, d);
      next.next = d;
    }
    if (espo) {
      next.espo = espo;
      if (typeof f.t === 'number' && f.t > 0 && f.t <= now) next.t = f.t;
      if (typeof f.by === 'string' && cleanHandle(f.by)) next.by = cleanHandle(f.by);
      next.synced = now;
    } else if (had) { next.edited = now; next.editedBy = who.handle; }
    saved = next;
    const copy = list.slice();
    if (had) copy[k] = next; else copy.push(next);
    return copy;
  }, s);
  if (why) return { error: why };
  return { recur: shapeRecur(saved, true) };
}

/* Deleting a recurring task makes no more tasks; the ones it made stay. */
export async function removeRecur(who, id, s = store()) {
  if (!tasksAllow(who)) return { error: NO_TASKS };
  let gone = null;
  await updateList(TASK_RECURS, 'recurs', (list) => {
    const k = list.findIndex((x) => x.id === recurId(id));
    gone = k >= 0 ? list[k] : null;
    return gone ? list.filter((_, i) => i !== k) : null;
  }, s);
  if (!gone) return { error: 'That recurring task has already been deleted.' };
  if (gone.espo) await updateList(TASKS_GONE, 'ids', (ids) => (ids.includes(gone.espo) ? null : [...ids, gone.espo]), s);
  return { gone: true };
}

/* ── The office ───────────────────────────────────────────────────────────

   Ryan's brief, 2026-10-20: contacts, grant requests and cases, moved here
   from EspoCRM after its tasks, in stages, so EspoCRM can be switched off.
   Ryan's calls, the same evening:

     · DIRECTORS AND ADMINISTRATORS ONLY (officeAllow, the same people as
       tasks), on a claimed username. Everybody else is told nothing, not even
       that there are any.
     · SEALED AT REST. Every record is encrypted with AES-256-GCM under
       CB_OFFICE_KEY, which only the functions hold (Netlify's environment), so
       the blob store alone shows nothing readable. Without the key the office
       is shut, never open in the clear (officeReady).
     · NOTHING RECORDS WHO READS, as everywhere on the CB. A change says who.
     · stimpunks.org's forms will post here at the cut-over, through a
       secret-keyed intake (stage four).

   These are other people's details, most of whom never signed on to the
   street, so NOTHING HERE IS EVER LOGGED, not even while debugging. */
/* office:settings:begin -- written by tools/make-office.py from data/office.json. Do not hand-edit. */
export const OFFICE_STATUSES = ["Open", "Granted", "Denied"];
export const OFFICE_CURRENCY = "USD";
export const OFFICE_PIPELINES = [{"name": "Mutual Aid", "stages": [{"name": "Received", "status": "Open"}, {"name": "Holding", "status": "Open"}, {"name": "Holding (No Updates)", "status": "Open"}, {"name": "Agreement Sent", "status": "Open"}, {"name": "Granted", "status": "Granted"}, {"name": "Denied", "status": "Denied"}]}, {"name": "Creator Grants", "stages": [{"name": "Received", "status": "Open"}, {"name": "Holding", "status": "Open"}, {"name": "Holding (No Updates)", "status": "Open"}, {"name": "Agreement Sent", "status": "Open"}, {"name": "Granted", "status": "Granted"}, {"name": "Denied", "status": "Denied"}]}];
export const OFFICE_CASES = {"types": ["Connection Request", "Volunteer Application"], "statuses": [{"name": "New", "open": true}, {"name": "Assigned", "open": true}, {"name": "Replied", "open": true}, {"name": "Invited In", "open": true}, {"name": "Collaborating", "open": true}, {"name": "Closed", "open": false}, {"name": "Spam", "open": false}], "priorities": ["Low", "Normal", "High", "Urgent"], "default_priority": "Normal"};
export const OFFICE_INTAKE = {"mutual_aid": {"record": "grant", "prefix": "Aid Request", "pipeline": "Mutual Aid", "amount": 500}, "creator_grant": {"record": "grant", "prefix": "Creator Grant Request", "pipeline": "Creator Grants", "amount": 3000}, "connection": {"record": "case", "prefix": "Connection Request", "type": "Connection Request"}, "volunteer": {"record": "case", "prefix": "Volunteer Application", "type": "Volunteer Application"}};
/* office:settings:end */
const OFFICE_GONE = 'office-gone';     // EspoCRM's ids of records brought over and deleted here, so a later import leaves them deleted
const NO_OFFICE = 'The office is for our directors and administrators, on a claimed username.';

export function officeAllow(who) { return tasksAllow(who); }

/* The key: 32 bytes, as base64url, in CB_OFFICE_KEY. Anything else and the
   office is shut. */
function officeKey() {
  const v = process.env.CB_OFFICE_KEY;
  if (!v) return null;
  try { const k = Buffer.from(v.trim(), 'base64url'); return k.length === 32 ? k : null; } catch (e) { return null; }
}
export function officeReady() { return !!officeKey(); }

/* A record sealed: the JSON encrypted, with a fresh nonce each time and GCM's
   tag, so a sealed blob cannot be read or altered without the key. */
export function seal(obj) {
  const key = officeKey();
  if (!key) throw new Error('shut');
  const iv = randomBytes(12), c = createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([c.update(JSON.stringify(obj), 'utf8'), c.final()]);
  return { sealed: 1, iv: iv.toString('base64url'), tag: c.getAuthTag().toString('base64url'), data: data.toString('base64url') };
}
export function unseal(box) {
  const key = officeKey();
  if (!key) throw new Error('shut');
  if (!box || box.sealed !== 1) throw new Error('unsealed');
  const d = createDecipheriv('aes-256-gcm', key, Buffer.from(box.iv, 'base64url'));
  d.setAuthTag(Buffer.from(box.tag, 'base64url'));
  return JSON.parse(Buffer.concat([d.update(Buffer.from(box.data, 'base64url')), d.final()]).toString('utf8'));
}
async function readSealed(key, s) {
  const d = await s.get(key, { type: 'json' });
  return d ? unseal(d) : null;
}
/* A sealed blob changed with the boards' conditional write: read, open,
   change, seal again, and write only if nobody wrote between. */
async function updateSealed(key, change, s) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    const was = cur.exists && cur.data ? unseal(cur.data) : null;
    const next = change(was);
    if (next === null) return was;
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, seal(next), opts);
    if (res.modified) return next;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}
async function readOfficeGone(s) {
  const d = await s.get(OFFICE_GONE, { type: 'json' });
  return d && Array.isArray(d.ids) ? d.ids : [];
}
const espoIdOf = (v) => (typeof v === 'string' && /^[A-Za-z0-9]{6,40}$/.test(v) ? v : null);

/* CONTACTS (stage one): a person or an organisation we are in touch with. Each
   keeps a first and last name, an email and a phone, whether they have asked
   not to be emailed or called, notes in Markdown, who added it and when, who
   changed it last and when, and EspoCRM's id for one brought over. EspoCRM's
   address and payment fields were empty on every contact, so they are not
   kept. One sealed blob holds every contact: a team's contacts are thousands,
   not millions. */
const CONTACTS = 'office-contacts';
export const CONTACT_NAME_MAX = 80;
export const CONTACT_NOTES_MAX = 20000;
export function contactId(v) { return typeof v === 'string' && /^c[A-Za-z0-9_-]{12}$/.test(v) ? v : null; }
const newContactId = () => 'c' + randomBytes(9).toString('base64url');
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
const PHONE = /^[0-9+().\-\s/x#*ext]{3,40}$/i;

export async function readContacts(s = store()) {
  const d = await readSealed(CONTACTS, s);
  return d && Array.isArray(d.contacts) ? d.contacts : [];
}

function contactFields(f) {
  const out = {};
  for (const k of ['first', 'last']) {
    if (f[k] === undefined) continue;
    const v = f[k] == null ? '' : tidy(f[k]);
    if ([...v].length > CONTACT_NAME_MAX) return { error: `A name is up to ${CONTACT_NAME_MAX} characters.` };
    out[k] = v;
  }
  if (f.email !== undefined) {
    const v = f.email == null ? '' : String(f.email).trim();
    if (v && (v.length > 254 || !EMAIL.test(v))) return { error: 'That is not an email address.' };
    out.email = v;
  }
  if (f.phone !== undefined) {
    const v = f.phone == null ? '' : String(f.phone).trim();
    if (v && !PHONE.test(v)) return { error: 'A phone number is digits, spaces, + ( ) - and an extension, up to 40 characters.' };
    out.phone = v;
  }
  for (const k of ['noEmail', 'noCall']) if (f[k] !== undefined) out[k] = f[k] === true;
  if (f.notes !== undefined) {
    const b = f.notes == null || String(f.notes).trim() === '' ? '' : cleanForumBody(f.notes, CONTACT_NOTES_MAX);
    if (b === null) return { error: `Notes are up to ${CONTACT_NOTES_MAX} characters.` };
    out.notes = b;
  }
  return { fields: out };
}

export function shapeContact(c, whole = false) {
  const out = { id: c.id, name: [c.first, c.last].filter(Boolean).join(' '), first: c.first || '', last: c.last || '',
    email: c.email || '', phone: c.phone || '', noEmail: !!c.noEmail, noCall: !!c.noCall,
    t: c.t, by: c.by || null, edited: c.edited || null, editedBy: c.editedBy || null };
  if (c.espo) out.espo = c.espo;
  if (whole) { out.notes = c.notes || ''; out.blocks = parseBrass(c.notes || '', { boxes: true }); } else out.words = [...(c.notes || '')].length;
  return out;
}

export async function officeContacts(who, s = store()) {
  if (!officeAllow(who)) return null;
  return (await readContacts(s)).map((c) => shapeContact(c));
}
export async function officeContact(who, id, s = store()) {
  if (!officeAllow(who)) return null;
  const c = (await readContacts(s)).find((x) => x.id === contactId(id));
  if (!c) return null;
  const one = new Map([[c.id, c]]);
  const [grants, cases] = await Promise.all([readGrants(s), readCases(s)]);
  const [mail, box] = await Promise.all([readSealed(mailIndexKey(c.id), s), readSealed(MAILBOX, s)]);
  return { ...shapeContact(c, true), grants: grants.filter((g) => g.contact === c.id).map((g) => shapeGrant(g, one)),
    cases: cases.filter((k) => k.contact === c.id).map((k) => shapeCase(k, one)),
    mail: mail && Array.isArray(mail.mail) ? mail.mail : [], mailbox: box && box.address ? box.address : null };
}

/* One contact made or changed in a list already open: only the fields sent
   change; `espo` brings one over again rather than twice, keeping when EspoCRM
   says it was made and by whom; a new one with an email another contact has is
   refused, saying whose, so nobody is entered twice. */
function applyContact(list, f, who, now) {
  const espo = espoIdOf(f.espo);
  const k = f.id != null ? list.findIndex((x) => x.id === contactId(f.id)) : (espo ? list.findIndex((x) => x.espo === espo) : -1);
  if (f.id != null && k < 0) return { error: 'That contact has been deleted.' };
  const had = k >= 0 ? list[k] : null;
  const r = contactFields(f);
  if (r.error) return r;
  const next = had ? { ...had, ...r.fields } : { id: newContactId(), first: '', last: '', email: '', phone: '', noEmail: false, noCall: false,
    notes: '', t: now, by: who.handle, ...r.fields };
  if (!next.first && !next.last) return { error: 'Give the contact a name.' };
  if (!had && !espo && next.email) {
    const twin = list.find((x) => x.email && x.email.toLowerCase() === next.email.toLowerCase());
    if (twin) return { error: `${[twin.first, twin.last].filter(Boolean).join(' ')} is already a contact with that email.` };
  }
  if (espo) {
    next.espo = espo;
    if (typeof f.t === 'number' && f.t > 0 && f.t <= now) next.t = f.t;
    if (typeof f.by === 'string' && tidy(f.by)) next.by = tidy(f.by).slice(0, 40);
    next.synced = now;
  } else if (had) { next.edited = now; next.editedBy = who.handle; }
  const copy = list.slice();
  if (had) copy[k] = next; else copy.push(next);
  return { list: copy, saved: next };
}

export async function saveContact(who, f, s = store(), now = Date.now()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  f = f || {};
  const espo = espoIdOf(f.espo);
  if (f.espo != null && !espo) return { error: 'That is not an EspoCRM id.' };
  if (espo && (await readOfficeGone(s)).includes(espo)) return { error: 'That contact was brought over and deleted here, so it stays deleted.' };
  let saved = null, why = null;
  await updateSealed(CONTACTS, (was) => {
    const r = applyContact(was && Array.isArray(was.contacts) ? was.contacts : [], f, who, now);
    why = r.error || null; saved = r.saved || null;
    return r.error ? null : { contacts: r.list };
  }, s);
  if (why) return { error: why };
  return { contact: shapeContact(saved, true) };
}

/* EspoCRM's contacts brought over in one write, up to IMPORT_MAX at a time,
   which is how thousands arrive without thousands of writes. Safe to run again
   until the cut-over: it adds what EspoCRM has made since and refreshes what
   nobody here has changed, and it leaves alone a contact somebody here has
   changed and one deleted here. Each row is answered by its EspoCRM id. */
export const IMPORT_MAX = 200;
export async function importContacts(who, rows, s = store(), now = Date.now()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  if (!Array.isArray(rows) || !rows.length || rows.length > IMPORT_MAX) return { error: `Between one and ${IMPORT_MAX} contacts at a time.` };
  if (rows.some((r) => !r || !espoIdOf(r.espo) || r.id != null)) return { error: 'Every contact brought over carries its EspoCRM id and nothing of ours.' };
  const gone = new Set(await readOfficeGone(s));
  let told = [];
  await updateSealed(CONTACTS, (was) => {
    let list = was && Array.isArray(was.contacts) ? was.contacts : [];
    told = [];
    for (const row of rows) {
      const espo = espoIdOf(row.espo);
      const there = list.find((x) => x.espo === espo);
      if (gone.has(espo)) { told.push({ espo, kept: 'deleted here' }); continue; }
      if (there && there.edited) { told.push({ espo, kept: 'changed here', id: there.id }); continue; }
      // Somebody already here by their email, from a form while both took entries, is not brought over again.
      const mail = String(row.email || '').trim().toLowerCase();
      const same = !there && mail && list.find((x) => !x.espo && x.email && x.email.toLowerCase() === mail);
      if (same) { told.push({ espo, kept: 'already here', id: same.id }); continue; }
      const r = applyContact(list, row, who, now);
      if (r.error) { told.push({ espo, error: r.error }); continue; }
      list = r.list;
      told.push({ espo, id: r.saved.id, made: !there });
    }
    return told.some((t) => t.id && !t.kept) ? { contacts: list } : null;
  }, s);
  return { told };
}

export async function removeContact(who, id, s = store()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  let gone = null;
  await updateSealed(CONTACTS, (was) => {
    const list = was && Array.isArray(was.contacts) ? was.contacts : [];
    const k = list.findIndex((x) => x.id === contactId(id));
    gone = k >= 0 ? list[k] : null;
    return gone ? { contacts: list.filter((_, i) => i !== k) } : null;
  }, s);
  if (!gone) return { error: 'That contact has already been deleted.' };
  if (gone.espo) await updateList(OFFICE_GONE, 'ids', (ids) => (ids.includes(gone.espo) ? null : [...ids, gone.espo]), s);
  await forgetContactMail(gone.id, s);
  await forgetContactMailings(gone.id, s);
  return { gone: true };
}

/* GRANT REQUESTS (stage two): our Mutual Aid and Creator Grants, as EspoCRM
   kept them. Each is in a pipeline and at a stage of it, and the stage says its
   status (OFFICE_PIPELINES, from data/office.json); its amount in whole dollars;
   the day it was submitted and the day it was decided, which is set when it
   moves to a stage that decides it and cleared when it moves back; the contact
   it is from; the stimpunks.org form entry it came in as; a description in
   Markdown; who added it and when, who changed it last and when; and EspoCRM's
   id for one brought over. EspoCRM's history of stage changes is not brought
   over: a change replaces what was there, as everywhere in the office. One
   sealed blob holds every grant request, beside the contacts'. */
const GRANTS = 'office-grants';
export const GRANT_NAME_MAX = 200;
export const GRANT_BODY_MAX = 40000;
export const GRANT_AMOUNT_MAX = 1000000;
export function grantId(v) { return typeof v === 'string' && /^g[A-Za-z0-9_-]{12}$/.test(v) ? v : null; }
const newGrantId = () => 'g' + randomBytes(9).toString('base64url');
export function pipelineOf(name) { return OFFICE_PIPELINES.find((p) => p.name === name) || null; }
function stageIn(p, name) { return p ? p.stages.find((x) => x.name === name) || null : null; }

export async function readGrants(s = store()) {
  const d = await readSealed(GRANTS, s);
  return d && Array.isArray(d.grants) ? d.grants : [];
}

/* What a change asks for, checked: only the fields sent. The pipeline and the
   stage are checked together, against the record they will be laid over. */
function grantFields(f, had, contacts) {
  const out = {};
  if (f.name !== undefined) {
    const v = f.name == null ? '' : tidy(f.name);
    if (!v) return { error: 'Give the grant request a name.' };
    if ([...v].length > GRANT_NAME_MAX) return { error: `A name is up to ${GRANT_NAME_MAX} characters.` };
    out.name = v;
  }
  const pipeName = f.pipeline !== undefined ? f.pipeline : had ? had.pipeline : OFFICE_PIPELINES[0].name;
  const p = pipelineOf(pipeName);
  if (!p) return { error: 'There is no pipeline by that name.' };
  if (f.pipeline !== undefined) out.pipeline = p.name;
  if (f.stage !== undefined || f.pipeline !== undefined || !had) {
    const want = f.stage !== undefined ? f.stage : had && f.pipeline === undefined ? had.stage : p.stages[0].name;
    const st = stageIn(p, want);
    if (!st) return { error: `${p.name} has no stage called ${want}.` };
    out.stage = st.name;
  }
  if (f.amount !== undefined) {
    const v = f.amount === null || f.amount === '' ? null : Number(f.amount);
    if (v !== null && !(Number.isInteger(v) && v >= 0 && v <= GRANT_AMOUNT_MAX)) return { error: `An amount is whole dollars, up to ${GRANT_AMOUNT_MAX}, or nothing.` };
    out.amount = v;
  }
  for (const [k, word] of [['submitted', 'submitted'], ['closed', 'decided']]) {
    if (f[k] === undefined) continue;
    const d = day(f[k]);
    if (d === undefined) return { error: `The day it was ${word} is a day, as YYYY-MM-DD, or nothing.` };
    out[k] = d;
  }
  if (f.contact !== undefined) {
    if (f.contact === null || f.contact === '') out.contact = null;
    else if (!contacts.some((c) => c.id === contactId(f.contact))) return { error: 'That contact has been deleted.' };
    else out.contact = contactId(f.contact);
  } else if (f.contactEmail !== undefined) {
    const e = String(f.contactEmail || '').trim().toLowerCase();
    if (!e) out.contact = null;
    else {
      const c = contacts.find((x) => x.email && x.email.toLowerCase() === e);
      if (!c) return { error: 'No contact has that email. Add them as a contact first.' };
      out.contact = c.id;
    }
  }
  if (f.form !== undefined) {
    const v = f.form === null || f.form === '' ? null : Number(f.form);
    if (v !== null && !(Number.isInteger(v) && v > 0 && v < 1e9)) return { error: 'A form entry is its number on stimpunks.org, or nothing.' };
    out.form = v;
  }
  if (f.body !== undefined) {
    const b = f.body == null || String(f.body).trim() === '' ? '' : cleanForumBody(f.body, GRANT_BODY_MAX);
    if (b === null) return { error: `A description is up to ${GRANT_BODY_MAX} characters.` };
    out.body = b;
  }
  return { fields: out };
}

/* The status follows the stage, and the day it was decided follows the status:
   set to today when it moves to a deciding stage without one, cleared when it
   moves back to an open stage. */
function settleGrant(g, now) {
  const st = stageIn(pipelineOf(g.pipeline), g.stage);
  const status = st ? st.status : 'Open';
  if (status === 'Open') g.closed = null;
  else if (!g.closed) g.closed = today(new Date(now));
  return g;
}
export function grantStatus(g) {
  const st = stageIn(pipelineOf(g.pipeline), g.stage);
  return st ? st.status : 'Open';
}

export function shapeGrant(g, contacts, whole = false) {
  const c = g.contact ? contacts.get(g.contact) : null;
  const out = { id: g.id, name: g.name, pipeline: g.pipeline, stage: g.stage, status: grantStatus(g), amount: g.amount ?? null,
    submitted: g.submitted || null, closed: g.closed || null, contact: g.contact || null,
    contactName: c ? [c.first, c.last].filter(Boolean).join(' ') : null, contactEmail: c ? c.email || '' : null, contactGone: !!(g.contact && !c),
    form: g.form || null, t: g.t, by: g.by || null, edited: g.edited || null, editedBy: g.editedBy || null };
  if (g.espo) out.espo = g.espo;
  if (whole) { out.body = g.body || ''; out.blocks = parseBrass(g.body || ''); } else out.words = [...(g.body || '')].length;
  return out;
}
const contactMap = (list) => new Map(list.map((c) => [c.id, c]));

export async function officeGrants(who, s = store()) {
  if (!officeAllow(who)) return null;
  const [grants, contacts] = await Promise.all([readGrants(s), readContacts(s)]);
  const m = contactMap(contacts);
  return grants.map((g) => shapeGrant(g, m));
}
export async function officeGrant(who, id, s = store()) {
  if (!officeAllow(who)) return null;
  const g = (await readGrants(s)).find((x) => x.id === grantId(id));
  return g ? shapeGrant(g, contactMap(await readContacts(s)), true) : null;
}

/* One grant request made or changed in a list already open, as applyContact. */
function applyGrant(list, f, who, now, contacts) {
  const espo = espoIdOf(f.espo);
  const k = f.id != null ? list.findIndex((x) => x.id === grantId(f.id)) : (espo ? list.findIndex((x) => x.espo === espo) : -1);
  if (f.id != null && k < 0) return { error: 'That grant request has been deleted.' };
  const had = k >= 0 ? list[k] : null;
  if (!had && f.name === undefined) return { error: 'Give the grant request a name.' };
  const r = grantFields(f, had, contacts);
  if (r.error) return r;
  const next = settleGrant(had ? { ...had, ...r.fields } : { id: newGrantId(), name: '', pipeline: OFFICE_PIPELINES[0].name, stage: OFFICE_PIPELINES[0].stages[0].name,
    amount: null, submitted: null, closed: null, contact: null, form: null, body: '', t: now, by: who.handle, ...r.fields }, now);
  // A decided day sent with the change stands, even on a stage that sets one.
  if (r.fields.closed && grantStatus(next) !== 'Open') next.closed = r.fields.closed;
  if (espo) {
    next.espo = espo;
    if (typeof f.t === 'number' && f.t > 0 && f.t <= now) next.t = f.t;
    if (typeof f.by === 'string' && tidy(f.by)) next.by = tidy(f.by).slice(0, 40);
    next.synced = now;
  } else if (had) { next.edited = now; next.editedBy = who.handle; }
  const copy = list.slice();
  if (had) copy[k] = next; else copy.push(next);
  return { list: copy, saved: next };
}

export async function saveGrant(who, f, s = store(), now = Date.now()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  f = f || {};
  const espo = espoIdOf(f.espo);
  if (f.espo != null && !espo) return { error: 'That is not an EspoCRM id.' };
  if (espo && (await readOfficeGone(s)).includes(espo)) return { error: 'That grant request was brought over and deleted here, so it stays deleted.' };
  const contacts = await readContacts(s);
  let saved = null, why = null;
  await updateSealed(GRANTS, (was) => {
    const r = applyGrant(was && Array.isArray(was.grants) ? was.grants : [], f, who, now, contacts);
    why = r.error || null; saved = r.saved || null;
    return r.error ? null : { grants: r.list };
  }, s);
  if (why) return { error: why };
  return { grant: shapeGrant(saved, contactMap(contacts), true) };
}

/* EspoCRM's grant requests brought over, IMPORT_MAX to a write, as contacts are.
   Each row names its contact by EspoCRM's id for the contact (contactEspo),
   which finds the contact brought over with it. */
export async function importGrants(who, rows, s = store(), now = Date.now()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  if (!Array.isArray(rows) || !rows.length || rows.length > IMPORT_MAX) return { error: `Between one and ${IMPORT_MAX} grant requests at a time.` };
  if (rows.some((r) => !r || !espoIdOf(r.espo) || r.id != null || r.contact != null)) return { error: 'Every grant request brought over carries its EspoCRM id and nothing of ours.' };
  const gone = new Set(await readOfficeGone(s));
  const contacts = await readContacts(s);
  const byEspo = new Map(contacts.filter((c) => c.espo).map((c) => [c.espo, c.id]));
  let told = [];
  await updateSealed(GRANTS, (was) => {
    let list = was && Array.isArray(was.grants) ? was.grants : [];
    told = [];
    for (const row of rows) {
      const espo = espoIdOf(row.espo);
      const there = list.find((x) => x.espo === espo);
      if (gone.has(espo)) { told.push({ espo, kept: 'deleted here' }); continue; }
      if (there && there.edited) { told.push({ espo, kept: 'changed here', id: there.id }); continue; }
      // An entry already here from the form, while both took entries, is not brought over again.
      const twin = !there && row.form != null && list.find((x) => !x.espo && x.form === Number(row.form));
      if (twin) { told.push({ espo, kept: 'already here', id: twin.id }); continue; }
      const f = { ...row };
      delete f.contactEspo;
      if (row.contactEspo != null) {
        const cid = byEspo.get(espoIdOf(row.contactEspo));
        if (!cid) { told.push({ espo, error: 'Its contact has not been brought over.' }); continue; }
        f.contact = cid;
      }
      const r = applyGrant(list, f, who, now, contacts);
      if (r.error) { told.push({ espo, error: r.error }); continue; }
      list = r.list;
      told.push({ espo, id: r.saved.id, made: !there });
    }
    return told.some((t) => t.id && !t.kept) ? { grants: list } : null;
  }, s);
  return { told };
}

export async function removeGrant(who, id, s = store()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  let gone = null;
  await updateSealed(GRANTS, (was) => {
    const list = was && Array.isArray(was.grants) ? was.grants : [];
    const k = list.findIndex((x) => x.id === grantId(id));
    gone = k >= 0 ? list[k] : null;
    return gone ? { grants: list.filter((_, i) => i !== k) } : null;
  }, s);
  if (!gone) return { error: 'That grant request has already been deleted.' };
  if (gone.espo) await updateList(OFFICE_GONE, 'ids', (ids) => (ids.includes(gone.espo) ? null : [...ids, gone.espo]), s);
  return { gone: true };
}

/* CASES (stage three): connection requests and volunteer applications, as
   EspoCRM kept them. Each has EspoCRM's number (a new one takes the next), a
   name, a type and a status (OFFICE_CASES, from data/office.json), a priority,
   the day it was submitted and the day it was closed, the contact it is from,
   the stimpunks.org form entry it came in as, a description in Markdown, who
   added it and when, who changed it last and when, and EspoCRM's id for one
   brought over. A change made here to a status that closes a case sets the day
   it closed, if none is given, and one back to an open status clears it; an
   import keeps EspoCRM's days as they are, because a hundred of its closed
   cases have none and today would be a day nobody closed them. EspoCRM's
   HubSpot ids and its history of status changes are not brought over. */
const CASES = 'office-cases';
export const CASE_NAME_MAX = 200;
export const CASE_BODY_MAX = 40000;
export function caseId(v) { return typeof v === 'string' && /^k[A-Za-z0-9_-]{12}$/.test(v) ? v : null; }
const newCaseId = () => 'k' + randomBytes(9).toString('base64url');
function caseOpen(status) { const st = OFFICE_CASES.statuses.find((x) => x.name === status); return !st || st.open; }

export async function readCases(s = store()) {
  const d = await readSealed(CASES, s);
  return d && Array.isArray(d.cases) ? d.cases : [];
}

function caseFields(f, contacts) {
  const out = {};
  if (f.name !== undefined) {
    const v = f.name == null ? '' : tidy(f.name);
    if (!v) return { error: 'Give the case a name.' };
    if ([...v].length > CASE_NAME_MAX) return { error: `A name is up to ${CASE_NAME_MAX} characters.` };
    out.name = v;
  }
  if (f.type !== undefined) {
    if (!OFFICE_CASES.types.includes(f.type)) return { error: `A case is a ${OFFICE_CASES.types.join(' or a ')}.` };
    out.type = f.type;
  }
  if (f.status !== undefined) {
    if (!OFFICE_CASES.statuses.some((x) => x.name === f.status)) return { error: 'There is no status by that name.' };
    out.status = f.status;
  }
  if (f.priority !== undefined) {
    if (!OFFICE_CASES.priorities.includes(f.priority)) return { error: 'There is no priority by that name.' };
    out.priority = f.priority;
  }
  for (const [k, word] of [['submitted', 'submitted'], ['closed', 'closed']]) {
    if (f[k] === undefined) continue;
    const d = day(f[k]);
    if (d === undefined) return { error: `The day it was ${word} is a day, as YYYY-MM-DD, or nothing.` };
    out[k] = d;
  }
  if (f.contact !== undefined) {
    if (f.contact === null || f.contact === '') out.contact = null;
    else if (!contacts.some((c) => c.id === contactId(f.contact))) return { error: 'That contact has been deleted.' };
    else out.contact = contactId(f.contact);
  } else if (f.contactEmail !== undefined) {
    const e = String(f.contactEmail || '').trim().toLowerCase();
    if (!e) out.contact = null;
    else {
      const c = contacts.find((x) => x.email && x.email.toLowerCase() === e);
      if (!c) return { error: 'No contact has that email. Add them as a contact first.' };
      out.contact = c.id;
    }
  }
  if (f.form !== undefined) {
    const v = f.form === null || f.form === '' ? null : Number(f.form);
    if (v !== null && !(Number.isInteger(v) && v > 0 && v < 1e9)) return { error: 'A form entry is its number on stimpunks.org, or nothing.' };
    out.form = v;
  }
  if (f.number !== undefined) {
    const v = Number(f.number);
    if (!(Number.isInteger(v) && v > 0 && v < 1e9)) return { error: 'A case number is a whole number.' };
    out.number = v;
  }
  if (f.body !== undefined) {
    const b = f.body == null || String(f.body).trim() === '' ? '' : cleanForumBody(f.body, CASE_BODY_MAX);
    if (b === null) return { error: `A description is up to ${CASE_BODY_MAX} characters.` };
    out.body = b;
  }
  return { fields: out };
}

export function shapeCase(k, contacts, whole = false) {
  const c = k.contact ? contacts.get(k.contact) : null;
  const out = { id: k.id, number: k.number, name: k.name, type: k.type, status: k.status, open: caseOpen(k.status), priority: k.priority,
    submitted: k.submitted || null, closed: k.closed || null, contact: k.contact || null,
    contactName: c ? [c.first, c.last].filter(Boolean).join(' ') : null, contactEmail: c ? c.email || '' : null, contactGone: !!(k.contact && !c),
    form: k.form || null, t: k.t, by: k.by || null, edited: k.edited || null, editedBy: k.editedBy || null };
  if (k.espo) out.espo = k.espo;
  if (whole) { out.body = k.body || ''; out.blocks = parseBrass(k.body || ''); } else out.words = [...(k.body || '')].length;
  return out;
}

export async function officeCases(who, s = store()) {
  if (!officeAllow(who)) return null;
  const [cases, contacts] = await Promise.all([readCases(s), readContacts(s)]);
  const m = contactMap(contacts);
  return cases.map((k) => shapeCase(k, m));
}
export async function officeCase(who, id, s = store()) {
  if (!officeAllow(who)) return null;
  const k = (await readCases(s)).find((x) => x.id === caseId(id));
  return k ? shapeCase(k, contactMap(await readContacts(s)), true) : null;
}

/* One case made or changed in a list already open, as applyGrant. `top` is the
   highest number ever given, kept beside the cases, so a number is never given
   twice, even after the newest case is deleted, as EspoCRM's never was. */
const topOf = (was) => Math.max(was && was.top || 0, ...((was && was.cases) || []).map((x) => x.number || 0), 0);
function applyCase(list, f, who, now, contacts, top) {
  const espo = espoIdOf(f.espo);
  const k = f.id != null ? list.findIndex((x) => x.id === caseId(f.id)) : (espo ? list.findIndex((x) => x.espo === espo) : -1);
  if (f.id != null && k < 0) return { error: 'That case has been deleted.' };
  const had = k >= 0 ? list[k] : null;
  if (!had && f.name === undefined) return { error: 'Give the case a name.' };
  if (!espo && f.number !== undefined) return { error: 'A case takes the next number by itself.' };
  const r = caseFields(f, contacts);
  if (r.error) return r;
  if (espo && r.fields.number != null && list.some((x, i) => i !== k && x.number === r.fields.number)) return { error: `Case number ${r.fields.number} is taken.` };
  const next = had ? { ...had, ...r.fields } : { id: newCaseId(), number: top + 1, name: '',
    type: OFFICE_CASES.types[0], status: OFFICE_CASES.statuses[0].name, priority: OFFICE_CASES.default_priority, submitted: null, closed: null,
    contact: null, form: null, body: '', t: now, by: who.handle, ...r.fields };
  if (espo) {
    next.espo = espo;
    if (typeof f.t === 'number' && f.t > 0 && f.t <= now) next.t = f.t;
    if (typeof f.by === 'string' && tidy(f.by)) next.by = tidy(f.by).slice(0, 40);
    next.synced = now;
  } else {
    // Closed, here, sets the day it closed, and open again clears it.
    if (r.fields.status !== undefined && (!had || had.status !== r.fields.status)) {
      if (caseOpen(next.status)) next.closed = null;
      else if (!next.closed) next.closed = today(new Date(now));
    }
    if (had) { next.edited = now; next.editedBy = who.handle; }
  }
  const copy = list.slice();
  if (had) copy[k] = next; else copy.push(next);
  return { list: copy, saved: next };
}

export async function saveCase(who, f, s = store(), now = Date.now()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  f = f || {};
  const espo = espoIdOf(f.espo);
  if (f.espo != null && !espo) return { error: 'That is not an EspoCRM id.' };
  if (espo && (await readOfficeGone(s)).includes(espo)) return { error: 'That case was brought over and deleted here, so it stays deleted.' };
  const contacts = await readContacts(s);
  let saved = null, why = null;
  await updateSealed(CASES, (was) => {
    const top = topOf(was);
    const r = applyCase(was && Array.isArray(was.cases) ? was.cases : [], f, who, now, contacts, top);
    why = r.error || null; saved = r.saved || null;
    return r.error ? null : { cases: r.list, top: Math.max(top, r.saved.number) };
  }, s);
  if (why) return { error: why };
  return { case: shapeCase(saved, contactMap(contacts), true) };
}

/* EspoCRM's cases brought over, as grant requests are, each keeping EspoCRM's
   number and naming its contact by EspoCRM's id for it. */
export async function importCases(who, rows, s = store(), now = Date.now()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  if (!Array.isArray(rows) || !rows.length || rows.length > IMPORT_MAX) return { error: `Between one and ${IMPORT_MAX} cases at a time.` };
  if (rows.some((r) => !r || !espoIdOf(r.espo) || r.id != null || r.contact != null)) return { error: 'Every case brought over carries its EspoCRM id and nothing of ours.' };
  const gone = new Set(await readOfficeGone(s));
  const contacts = await readContacts(s);
  const byEspo = new Map(contacts.filter((c) => c.espo).map((c) => [c.espo, c.id]));
  let told = [];
  await updateSealed(CASES, (was) => {
    let list = was && Array.isArray(was.cases) ? was.cases : [];
    let top = topOf(was);
    told = [];
    for (const row of rows) {
      const espo = espoIdOf(row.espo);
      const there = list.find((x) => x.espo === espo);
      if (gone.has(espo)) { told.push({ espo, kept: 'deleted here' }); continue; }
      if (there && there.edited) { told.push({ espo, kept: 'changed here', id: there.id }); continue; }
      // An entry already here from the form, while both took entries, is not brought over again.
      const twin = !there && row.form != null && list.find((x) => !x.espo && x.form === Number(row.form));
      if (twin) { told.push({ espo, kept: 'already here', id: twin.id }); continue; }
      const f = { ...row };
      delete f.contactEspo;
      if (row.contactEspo != null) {
        const cid = byEspo.get(espoIdOf(row.contactEspo));
        if (!cid) { told.push({ espo, error: 'Its contact has not been brought over.' }); continue; }
        f.contact = cid;
      }
      const r = applyCase(list, f, who, now, contacts, top);
      if (r.error) { told.push({ espo, error: r.error }); continue; }
      list = r.list;
      top = Math.max(top, r.saved.number);
      told.push({ espo, id: r.saved.id, made: !there });
    }
    return told.some((t) => t.id && !t.kept) ? { cases: list, top } : null;
  }, s);
  return { told };
}

export async function removeCase(who, id, s = store()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  let gone = null;
  await updateSealed(CASES, (was) => {
    const list = was && Array.isArray(was.cases) ? was.cases : [];
    const k = list.findIndex((x) => x.id === caseId(id));
    gone = k >= 0 ? list[k] : null;
    return gone ? { cases: list.filter((_, i) => i !== k), top: topOf(was) } : null;
  }, s);
  if (!gone) return { error: 'That case has already been deleted.' };
  if (gone.espo) await updateList(OFFICE_GONE, 'ids', (ids) => (ids.includes(gone.espo) ? null : [...ids, gone.espo]), s);
  return { gone: true };
}

/* THE INTAKE (stage four): stimpunks.org's forms, through the WPForms plugin,
   which used to post to EspoCRM. One submission at a time, from a server and
   never a browser, signed with CB_OFFICE_INTAKE_KEY, which the plugin holds in
   wp-config.php: an HMAC-SHA256 of the timestamp and the body, so the key
   itself never travels and a signature is good for five minutes. It finds the
   contact by email, or adds one (an existing contact keeps their name and takes
   the newest phone number), then makes the grant request or case
   OFFICE_INTAKE says the form makes, at the first stage or status, under the
   name `${prefix} ${entry}: ${their name}`. An entry already in the office is
   never made twice, so the plugin's retries and resends are safe. A field the
   office cannot keep where it belongs (an email or phone it cannot read) goes
   into the description, so nothing sent is lost. Nothing about a submission is
   ever logged, and the answer says only whether a record was made. */
export const INTAKE_BY = 'stimpunks.org form';
export const INTAKE_MAX = 300000;      // characters of a submission's body
const INTAKE_SKEW = 300;               // seconds a signature is good for
const INTAKE_WHO = { handle: INTAKE_BY };

function intakeKey() {
  const v = process.env.CB_OFFICE_INTAKE_KEY;
  return typeof v === 'string' && v.trim().length >= 32 ? v.trim() : null;
}
export function intakeReady() { return !!intakeKey() && officeReady(); }

/* `t=<unix seconds>,v1=<hex HMAC-SHA256 of "t.body">`, as the plugin and the
   mailbox script sign it, under the key each was given. */
function hmacSigned(key, header, raw, now) {
  if (!key || typeof header !== 'string' || typeof raw !== 'string') return false;
  let t = null; const sigs = [];
  for (const part of header.split(',')) {
    const i = part.indexOf('=');
    if (i < 1) continue;
    const k = part.slice(0, i).trim(), v = part.slice(i + 1).trim();
    if (k === 't') t = v; else if (k === 'v1' && /^[0-9a-f]{64}$/.test(v)) sigs.push(v);
  }
  if (!t || !/^\d{9,11}$/.test(t) || !sigs.length) return false;
  if (Math.abs(now / 1000 - Number(t)) > INTAKE_SKEW) return false;
  const want = Buffer.from(createHmac('sha256', key).update(`${t}.${raw}`, 'utf8').digest('hex'));
  return sigs.some((v) => { const got = Buffer.from(v); return got.length === want.length && timingSafeEqual(got, want); });
}
export function intakeSigned(header, raw, now = Date.now()) { return hmacSigned(intakeKey(), header, raw, now); }

/* A description too long for a record is cut short and says so. */
function intakeBody(text, max) {
  const t = String(text || '').trim();
  if ([...t].length <= max) return t;
  return [...t].slice(0, max - 80).join('') + '\n\n(Cut short here: the whole answer is on the form entry.)';
}

export async function officeIntake(sub, s = store(), now = Date.now()) {
  if (!officeReady()) return { error: 'The office is shut.', status: 503 };
  sub = sub && typeof sub === 'object' ? sub : {};
  const kind = typeof sub.type === 'string' && Object.prototype.hasOwnProperty.call(OFFICE_INTAKE, sub.type) ? OFFICE_INTAKE[sub.type] : null;
  if (!kind) return { error: 'The office makes nothing for that form.' };
  const entry = sub.entry == null || sub.entry === '' || sub.entry === 0 ? null : Number(sub.entry);
  if (entry !== null && !(Number.isInteger(entry) && entry > 0 && entry < 1e9)) return { error: 'A form entry is a whole number.' };
  const submitted = day(sub.submitted) || today(new Date(now));
  const extra = [];
  let email = String(sub.email || '').trim().toLowerCase();
  if (email && (email.length > 254 || !EMAIL.test(email))) { extra.push(['Email', email]); email = ''; }
  let phone = String(sub.phone || '').trim();
  if (phone && !PHONE.test(phone)) { extra.push(['Phone', phone]); phone = ''; }
  const first = [...tidy(sub.first)].slice(0, CONTACT_NAME_MAX).join('');
  const last = [...tidy(sub.last)].slice(0, CONTACT_NAME_MAX).join('');
  const display = [...(tidy(sub.name) || [first, last].filter(Boolean).join(' ') || email || 'Unknown')].slice(0, 120).join('');

  // The contact: found by email, or added. A name is needed, so somebody who gave
  // only an email is named by it, as the plugin did in EspoCRM.
  let contact = null;
  if (email) {
    await updateSealed(CONTACTS, (was) => {
      const list = was && Array.isArray(was.contacts) ? was.contacts : [];
      const had = list.find((x) => x.email && x.email.toLowerCase() === email);
      contact = had ? had.id : null;
      if (had && (!phone || had.phone === phone)) return null;
      const f = had ? { id: had.id, phone } : { first, last: first || last ? last : [...email].slice(0, CONTACT_NAME_MAX).join(''), email, phone };
      const r = applyContact(list, f, INTAKE_WHO, now);
      if (r.error) return null;
      contact = r.saved.id;
      return { contacts: r.list };
    }, s);
    if (!contact) extra.push(['Contact', `${display} · ${email}${phone ? ' · ' + phone : ''}`]);
  } else if (phone) extra.push(['Phone', phone]);

  const lines = extra.map(([k, v]) => `**${k}**\n${v}`);
  const name = [...(entry ? `${kind.prefix} ${entry}: ${display}` : `${kind.prefix}: ${display}`)].slice(0, 200).join('');
  const contacts = await readContacts(s);
  let made = false, why = null;
  if (kind.record === 'grant') {
    const body = intakeBody([...lines, sub.message].filter(Boolean).join('\n\n'), GRANT_BODY_MAX);
    await updateSealed(GRANTS, (was) => {
      const list = was && Array.isArray(was.grants) ? was.grants : [];
      made = false; why = null;
      if (entry && list.some((g) => g.form === entry)) return null;
      const r = applyGrant(list, { name, pipeline: kind.pipeline, amount: kind.amount, submitted, contact, form: entry, body }, INTAKE_WHO, now, contacts);
      if (r.error) { why = r.error; return null; }
      made = true;
      return { grants: r.list };
    }, s);
  } else {
    const body = intakeBody([...lines, sub.message].filter(Boolean).join('\n\n'), CASE_BODY_MAX);
    await updateSealed(CASES, (was) => {
      const list = was && Array.isArray(was.cases) ? was.cases : [];
      made = false; why = null;
      if (entry && list.some((k) => k.form === entry)) return null;
      const top = topOf(was);
      const r = applyCase(list, { name, type: kind.type, submitted, contact, form: entry, body }, INTAKE_WHO, now, contacts, top);
      if (r.error) { why = r.error; return null; }
      made = true;
      return { cases: r.list, top: Math.max(top, r.saved.number) };
    }, s);
  }
  if (why) return { error: why };
  return { ok: true, record: kind.record, made };
}

/* EMAIL: the team mailbox's correspondence with our contacts, kept whole (Ryan's
   call, 2026-10-20, over keeping only who, when and the subject). A Google Apps
   Script inside the mailbox (Stimpunks-Work's stimpunks-gmail-office) does the
   sending, under CB_OFFICE_MAIL_KEY, a key of its own, signed as the forms are.
   It first asks for MAIL ADDRESSES: an HMAC of each contact's email under that
   key, so it can tell which emails are with a contact without being handed a
   list of anybody's address, and it sends only those: email with anybody else
   never leaves Gmail. Here each email is matched to its contacts again, and one
   that matches nobody is stored nowhere.

   Each email is a sealed blob of its own (office-mail/<Gmail's message id>),
   holding who it was from and to, when, its subject, its text, the names and
   sizes of its attachments (which stay in Gmail) and which contacts it is
   with; each contact keeps a sealed list of theirs (office-mail-of/<contact>),
   newest first. Deleting an email here deletes it from the office and never
   from Gmail, and keeps its id so it is not sent again; deleting a contact
   deletes their list, and an email with nobody else in the office goes with
   it. The mailbox's own address is kept, sealed, for the links into Gmail. */
const MAILBOX = 'office-mailbox';
const MAIL_GONE = 'office-mail-gone';
const mailKeyOf = (id) => `office-mail/${id}`;
const mailIndexKey = (cid) => `office-mail-of/${cid}`;
export const MAIL_TEXT_MAX = 200000;
export const MAIL_SUBJECT_MAX = 500;
export const MAIL_PEOPLE_MAX = 100;
export const MAIL_FILES_MAX = 50;
export function mailId(v) { return typeof v === 'string' && /^[0-9a-f]{8,32}$/i.test(v) ? v.toLowerCase() : null; }

function mailKey() {
  const v = process.env.CB_OFFICE_MAIL_KEY;
  return typeof v === 'string' && v.trim().length >= 32 ? v.trim() : null;
}
export function mailReady() { return !!mailKey() && officeReady(); }
export function mailSigned(header, raw, now = Date.now()) { return hmacSigned(mailKey(), header, raw, now); }

async function readMailGone(s) {
  const d = await s.get(MAIL_GONE, { type: 'json' });
  return d && Array.isArray(d.ids) ? d.ids : [];
}

/* The address in `Name <address>` or a bare one, lowercased, or null. */
function bareAddress(v) {
  const t = String(v || '').trim();
  const m = /<([^<>\s]+@[^<>\s]+)>\s*$/.exec(t);
  const a = (m ? m[1] : t).trim().toLowerCase();
  return a.length <= 254 && EMAIL.test(a) ? a : null;
}
const mailHash = (address) => createHmac('sha256', mailKey()).update(address, 'utf8').digest('hex');

/* Every contact's address as the mailbox script asks for it: a keyed hash, so
   the answer is no list of anybody's address. */
export async function mailAddresses(s = store()) {
  if (!mailReady()) return null;
  const seen = new Set();
  for (const c of await readContacts(s)) { const a = bareAddress(c.email); if (a) seen.add(mailHash(a)); }
  return [...seen].sort();
}

function cleanPeople(list) {
  return (Array.isArray(list) ? list : []).slice(0, MAIL_PEOPLE_MAX).map((x) => [...tidy(x)].slice(0, 320).join('')).filter(Boolean);
}

/* One email from the mailbox script. Returns { kept, made, contacts } or { error }. */
export async function officeMailIn(m, s = store(), now = Date.now()) {
  if (!officeReady()) return { error: 'The office is shut.', status: 503 };
  m = m && typeof m === 'object' ? m : {};
  const id = mailId(m.id);
  if (!id) return { error: 'An email needs Gmail’s id for it.' };
  const mailbox = bareAddress(m.mailbox);
  if (!mailbox) return { error: 'An email needs the mailbox it is from.' };
  const at = Number(m.at);
  if (!(Number.isFinite(at) && at > 0 && at <= now + 86400000)) return { error: 'An email needs the time it was sent.' };
  if ((await readMailGone(s)).includes(id)) return { kept: false, gone: true };
  const from = [...tidy(m.from)].slice(0, 320).join('');
  const to = cleanPeople(m.to), cc = cleanPeople(m.cc), bcc = cleanPeople(m.bcc);
  const people = new Set([from, ...to, ...cc, ...bcc].map(bareAddress).filter((a) => a && a !== mailbox));
  const contacts = (await readContacts(s)).filter((c) => { const a = bareAddress(c.email); return a && people.has(a); });
  if (!contacts.length) return { kept: false };
  let text = String(m.text == null ? '' : m.text).replace(/\r\n?/g, '\n');
  if ([...text].length > MAIL_TEXT_MAX) text = [...text].slice(0, MAIL_TEXT_MAX - 80).join('') + '\n\n(Cut short here: the whole email is in Gmail.)';
  const record = { id, thread: mailId(m.thread), mailbox, at, from, to, cc, bcc,
    subject: [...tidy(m.subject)].slice(0, MAIL_SUBJECT_MAX).join(''), text,
    files: (Array.isArray(m.files) ? m.files : []).slice(0, MAIL_FILES_MAX).map((f) => ({
      name: [...tidy(f && f.name)].slice(0, 200).join('') || 'attachment', size: Number.isInteger(f && f.size) && f.size >= 0 ? f.size : null })),
    contacts: contacts.map((c) => c.id), t: now };
  // An email kept before somebody on it became a contact gains them, so the
  // email goes only when the last contact it is filed on goes.
  let made = false;
  await updateSealed(mailKeyOf(id), (was) => {
    made = !was;
    if (!was) return record;
    const had = Array.isArray(was.contacts) ? was.contacts : [];
    const more = record.contacts.filter((c) => !had.includes(c));
    return more.length ? { ...was, contacts: [...had, ...more] } : null;
  }, s);
  // Every contact's list, whether or not the email was new, so a send cut off
  // halfway is finished by the next one.
  const out = bareAddress(from) === mailbox;
  for (const c of contacts) {
    await updateSealed(mailIndexKey(c.id), (was) => {
      const list = was && Array.isArray(was.mail) ? was.mail : [];
      if (list.some((x) => x.id === id)) return null;
      const next = [...list, { id, at, subject: record.subject, from, out }].sort((a, b) => b.at - a.at);
      return { mail: next };
    }, s);
  }
  await updateSealed(MAILBOX, (was) => (was && was.address === mailbox ? null : { address: mailbox }), s);
  return { kept: true, made, contacts: contacts.length };
}

/* A person somebody labelled a thread for in Gmail, from the mailbox script:
   found by their address, or added with the name the email gives them and
   nothing else. The script then sends the thread, which files it on them. Only
   ever the address it was given, never the mailbox's own. Returns { made } or
   { error }, and nothing about the contact. */
export const MAIL_BY = 'the team mailbox';
const MAIL_WHO = { handle: MAIL_BY };

/* "Jane Doe", "Doe, Jane", "\"Jane Q. Doe\"" or nothing, as first and last; a
   person with no name is named by their address, as the intake names one. */
function nameFromMail(name, email) {
  const n = [...tidy(name)].join('').replace(/^["'\s]+|["'\s]+$/g, '');
  if (!n || n.includes('@')) return { first: '', last: [...email].slice(0, CONTACT_NAME_MAX).join('') };
  const cut = (v) => [...v.trim()].slice(0, CONTACT_NAME_MAX).join('');
  const parts = n.split(',').map((x) => x.trim());
  // "Doe, Jane" the way Outlook writes it; "Bea Arthur, PhD" and "Foo, Inc." keep their order.
  const suffix = parts.length === 2 && /^(?:inc|llc|ltd|co|jr|sr|ii|iii|iv|phd|md)\.?$/i.test(parts[1]);
  if (parts.length === 2 && parts[0] && !suffix && /^[^\s.]+$/.test(parts[1])) return { first: cut(parts[1]), last: cut(parts[0]) };
  const words = (suffix ? parts[0] : n).replace(/,/g, ' ').split(/\s+/).filter(Boolean);
  return words.length > 1 ? { first: cut(words.slice(0, -1).join(' ')), last: cut(words[words.length - 1]) } : { first: cut(words[0] || n), last: '' };
}

export async function officeMailContact(p, s = store(), now = Date.now()) {
  if (!officeReady()) return { error: 'The office is shut.', status: 503 };
  p = p && typeof p === 'object' ? p : {};
  const mailbox = bareAddress(p.mailbox);
  if (!mailbox) return { error: 'A contact from the mailbox needs the mailbox it is from.' };
  const email = bareAddress(p.email);
  if (!email) return { error: 'That is not an email address.' };
  if (email === mailbox) return { error: 'The mailbox is not a contact.' };
  const { first, last } = nameFromMail(p.name, email);
  let made = false, why = null;
  await updateSealed(CONTACTS, (was) => {
    const list = was && Array.isArray(was.contacts) ? was.contacts : [];
    made = false; why = null;
    if (list.some((x) => x.email && x.email.toLowerCase() === email)) return null;
    const r = applyContact(list, { first, last, email }, MAIL_WHO, now);
    if (r.error) { why = r.error; return null; }
    made = true;
    return { contacts: r.list };
  }, s);
  if (why) return { error: why };
  return { ok: true, made };
}

export async function officeEmail(who, id, s = store()) {
  if (!officeAllow(who)) return null;
  const k = mailId(id);
  const m = k ? await readSealed(mailKeyOf(k), s) : null;
  if (!m) return null;
  const byId = contactMap(await readContacts(s));
  return { id: m.id, thread: m.thread || null, mailbox: m.mailbox, at: m.at, from: m.from, to: m.to, cc: m.cc, bcc: m.bcc,
    subject: m.subject, text: m.text, files: m.files || [], out: bareAddress(m.from) === m.mailbox,
    contacts: (m.contacts || []).map((cid) => byId.get(cid)).filter(Boolean).map((c) => ({ id: c.id, name: [c.first, c.last].filter(Boolean).join(' '), email: c.email })) };
}

/* An email deleted from the office, and never from Gmail; its id is kept so the
   mailbox script does not send it again. */
export async function removeEmail(who, id, s = store()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  const k = mailId(id);
  const m = k ? await readSealed(mailKeyOf(k), s) : null;
  if (!m) return { error: 'That email has already been deleted from the office.' };
  for (const cid of m.contacts || []) {
    await updateSealed(mailIndexKey(cid), (was) => {
      const list = was && Array.isArray(was.mail) ? was.mail : [];
      return list.some((x) => x.id === k) ? { mail: list.filter((x) => x.id !== k) } : null;
    }, s);
  }
  await s.delete(mailKeyOf(k));
  await updateList(MAIL_GONE, 'ids', (ids) => (ids.includes(k) ? null : [...ids, k]), s);
  return { gone: true };
}

/* A contact deleted: their list goes, and so does every email of theirs that is
   with nobody else in the office. */
async function forgetContactMail(cid, s) {
  const idx = await readSealed(mailIndexKey(cid), s);
  for (const x of (idx && idx.mail) || []) {
    let empty = false;
    await updateSealed(mailKeyOf(x.id), (was) => {
      if (!was) return null;
      const rest = (was.contacts || []).filter((c) => c !== cid);
      empty = !rest.length;
      return empty ? null : { ...was, contacts: rest };
    }, s);
    if (empty) await s.delete(mailKeyOf(x.id));
  }
  await s.delete(mailIndexKey(cid));
}

/* MAILINGS: an email from a template to everybody at one stage of a grant
   pipeline, sent from the team mailbox (Ryan's call, 2026-10-20, over drafts
   to read and send by hand). A director writes TEMPLATES here, with fill-ins in
   braces, and an unknown fill-in is refused, so a misspelt one never goes out
   as braces. MAILING PREVIEW fills one email for every grant request at the
   stage and names everybody it leaves out and why: no contact, a contact since
   deleted, no address, or a contact who asked not to be emailed. SEND MAILING
   is given the grant requests the preview showed and the template's stamp, and
   refuses if either has changed since, so what is sent is what was seen. Each
   email goes to one person, never as a group.

   The office sends nothing itself, because that would need a Google login kept
   here. The team mailbox's script asks for the OUTBOX on each run: the only
   time the office gives it anybody's address, and only the addresses of a
   mailing a director has sent. It sends each with the team mailbox's own
   Gmail and says so (MAIL SENT), and the email then keeps only whose and when:
   its address and words go, and the email itself comes back as one of the
   mailbox's, filed on its contact. Stopping a mailing takes back every email
   not yet sent; deleting a contact takes theirs; a mailing with nothing waiting
   can be deleted. Templates and mailings are sealed like everything here. */
const TEMPLATES = 'office-templates';
const MAILINGS = 'office-mailings';
export const TEMPLATE_NAME_MAX = 120;
export const TEMPLATE_SUBJECT_MAX = 200;
export const TEMPLATE_BODY_MAX = 20000;
export const MAILING_MAX = 300;        // emails in one mailing
export const OUTBOX_BATCH = 50;        // emails one ask of the outbox hands over
export const FILL_INS = ['first', 'last', 'name', 'grant', 'amount', 'pipeline', 'stage', 'submitted'];
export function templateId(v) { return typeof v === 'string' && /^t[A-Za-z0-9_-]{12}$/.test(v) ? v : null; }
export function mailingId(v) { return typeof v === 'string' && /^n[A-Za-z0-9_-]{12}$/.test(v) ? v : null; }
export function outboxId(v) { return typeof v === 'string' && /^e[A-Za-z0-9_-]{12}$/.test(v) ? v : null; }
const newTemplateId = () => 't' + randomBytes(9).toString('base64url');
const newMailingId = () => 'n' + randomBytes(9).toString('base64url');
const newOutboxId = () => 'e' + randomBytes(9).toString('base64url');

async function readTemplates(s) { const d = await readSealed(TEMPLATES, s); return d && Array.isArray(d.templates) ? d.templates : []; }
async function readMailings(s) { const d = await readSealed(MAILINGS, s); return d && Array.isArray(d.mailings) ? d.mailings : []; }

/* The fill-ins in a template that the office does not know. */
export function unknownFillIns(text) {
  const out = [];
  for (const m of String(text || '').matchAll(/\{([^{}\n]*)\}/g)) if (!FILL_INS.includes(m[1]) && !out.includes(m[0])) out.push(m[0]);
  return out;
}
function fillIn(text, v) { return String(text).replace(/\{(\w+)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(v, k) ? v[k] : m)); }
function moneyWords(n) { return n == null ? '' : '$' + Number(n).toLocaleString('en-US'); }
function dayWordsOf(d) {
  if (!d) return '';
  try { return new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' }); } catch (e) { return d; }
}

function shapeTemplate(t) {
  return { id: t.id, name: t.name, subject: t.subject, body: t.body, stamp: t.edited || t.t, t: t.t, by: t.by || null, edited: t.edited || null, editedBy: t.editedBy || null };
}
export async function officeTemplates(who, s = store()) {
  if (!officeAllow(who)) return null;
  return (await readTemplates(s)).map(shapeTemplate).sort((a, b) => a.name.localeCompare(b.name));
}
export async function saveTemplate(who, f, s = store(), now = Date.now()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  f = f && typeof f === 'object' ? f : {};
  const name = [...tidy(f.name)].join('');
  const subject = [...tidy(f.subject)].join('');
  const body = cleanBrassBody(f.body, TEMPLATE_BODY_MAX);
  if (!name || [...name].length > TEMPLATE_NAME_MAX) return { error: `A template needs a name, up to ${TEMPLATE_NAME_MAX} characters.` };
  if (!subject || [...subject].length > TEMPLATE_SUBJECT_MAX) return { error: `A template needs a subject, up to ${TEMPLATE_SUBJECT_MAX} characters.` };
  if (!body) return { error: `A template needs words, up to ${TEMPLATE_BODY_MAX} characters.` };
  const unknown = unknownFillIns(subject + '\n' + body);
  if (unknown.length) return { error: `The office has no fill-in called ${unknown.join(', ')}. It knows ${FILL_INS.map((x) => '{' + x + '}').join(', ')}.` };
  let saved = null, why = null;
  await updateSealed(TEMPLATES, (was) => {
    const list = was && Array.isArray(was.templates) ? was.templates : [];
    saved = null; why = null;
    if (f.id != null) {
      const k = list.findIndex((x) => x.id === templateId(f.id));
      if (k < 0) { why = 'That template has been deleted.'; return null; }
      saved = { ...list[k], name, subject, body, edited: now, editedBy: who.handle };
      const copy = list.slice(); copy[k] = saved;
      return { templates: copy };
    }
    if (list.some((x) => x.name.toLowerCase() === name.toLowerCase())) { why = 'There is a template with that name already.'; return null; }
    saved = { id: newTemplateId(), name, subject, body, t: now, by: who.handle };
    return { templates: [...list, saved] };
  }, s);
  if (why) return { error: why };
  return { template: shapeTemplate(saved) };
}
export async function removeTemplate(who, id, s = store()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  let gone = false;
  await updateSealed(TEMPLATES, (was) => {
    const list = was && Array.isArray(was.templates) ? was.templates : [];
    gone = list.some((x) => x.id === templateId(id));
    return gone ? { templates: list.filter((x) => x.id !== templateId(id)) } : null;
  }, s);
  return gone ? { gone: true } : { error: 'That template has already been deleted.' };
}

/* Everybody at one stage of one pipeline: an email for each grant request
   whose contact can be emailed, and the rest with the reason they are left out. */
function stageMail(pipeline, stage, grants, contacts) {
  const byId = contactMap(contacts);
  const emails = [], left = [];
  const here = grants.filter((g) => g.pipeline === pipeline && g.stage === stage)
    .sort((a, b) => String(a.submitted || '').localeCompare(String(b.submitted || '')) || a.name.localeCompare(b.name));
  for (const g of here) {
    const c = g.contact ? byId.get(g.contact) : null;
    const name = c ? [c.first, c.last].filter(Boolean).join(' ') : '';
    const why = !g.contact ? 'it has no contact' : !c ? 'its contact has been deleted' : !c.email ? 'their contact has no email address'
      : c.noEmail ? 'they asked not to be emailed' : null;
    if (why) { left.push({ grant: g.id, grantName: g.name, contact: c ? c.id : null, name: name || null, why }); continue; }
    emails.push({ grant: g.id, grantName: g.name, contact: c.id, name, to: c.email,
      values: { first: c.first || name, last: c.last || '', name, grant: g.name, amount: moneyWords(g.amount), pipeline: g.pipeline, stage: g.stage, submitted: dayWordsOf(g.submitted) } });
  }
  return { emails, left };
}
async function mailingParts(f, s) {
  const pipe = pipelineOf(f && f.pipeline);
  if (!pipe) return { error: 'Which pipeline?' };
  const stage = stageIn(pipe, f.stage);
  if (!stage) return { error: 'Which stage of it?' };
  const tmpl = (await readTemplates(s)).find((x) => x.id === templateId(f.template));
  if (!tmpl) return { error: 'That template has been deleted.' };
  const { emails, left } = stageMail(pipe.name, stage.name, await readGrants(s), await readContacts(s));
  const filled = emails.map((e) => ({ ...e, subject: fillIn(tmpl.subject, e.values), body: fillIn(tmpl.body, e.values) }));
  return { pipe, stage, tmpl, filled, left };
}
export async function previewMailing(who, f, s = store()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  const r = await mailingParts(f, s);
  if (r.error) return r;
  return { template: shapeTemplate(r.tmpl), pipeline: r.pipe.name, stage: r.stage.name,
    emails: r.filled.map((e) => ({ grant: e.grant, grantName: e.grantName, contact: e.contact, name: e.name, to: e.to, subject: e.subject, body: e.body })),
    left: r.left, max: MAILING_MAX };
}
export async function sendMailing(who, f, s = store(), now = Date.now()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  const r = await mailingParts(f, s);
  if (r.error) return r;
  if ((r.tmpl.edited || r.tmpl.t) !== Number(f.stamp)) return { error: 'The template has changed since the preview. Preview it again.' };
  const seen = Array.isArray(f.grants) ? [...f.grants].map(String).sort() : [];
  if (seen.join() !== r.filled.map((e) => e.grant).sort().join()) return { error: 'Who is at that stage has changed since the preview. Preview it again.' };
  if (!r.filled.length) return { error: 'Nobody at that stage can be emailed.' };
  if (r.filled.length > MAILING_MAX) return { error: `A mailing goes to at most ${MAILING_MAX} people.` };
  const mailing = { id: newMailingId(), template: r.tmpl.name, subject: r.tmpl.subject, body: r.tmpl.body, pipeline: r.pipe.name, stage: r.stage.name,
    t: now, by: who.handle, emails: r.filled.map((e) => ({ id: newOutboxId(), grant: e.grant, contact: e.contact, to: e.to, subject: e.subject, body: e.body })) };
  await updateSealed(MAILINGS, (was) => ({ mailings: [...(was && Array.isArray(was.mailings) ? was.mailings : []), mailing] }), s);
  return { mailing: mailing.id, count: mailing.emails.length };
}

/* An email's state: waiting while it still has an address, then sent, not
   sent (Google would not send it) or stopped. */
function outState(e) { return e.sent ? 'sent' : e.failed ? 'failed' : e.stopped ? 'stopped' : 'waiting'; }
function shapeMailing(m, contacts, grants, whole) {
  const counts = { waiting: 0, sent: 0, failed: 0, stopped: 0 };
  for (const e of m.emails) counts[outState(e)]++;
  const out = { id: m.id, template: m.template, pipeline: m.pipeline, stage: m.stage, t: m.t, by: m.by, stopped: m.stopped || null, stoppedBy: m.stoppedBy || null, counts };
  if (whole) {
    out.subject = m.subject; out.body = m.body;
    out.emails = m.emails.map((e) => {
      const c = contacts.get(e.contact), g = grants.get(e.grant);
      return { id: e.id, state: outState(e), when: e.sent || e.failed || e.stopped || null, contact: e.contact, name: c ? [c.first, c.last].filter(Boolean).join(' ') : null,
        grant: e.grant, grantName: g ? g.name : null };
    });
  }
  return out;
}
export async function officeMailings(who, s = store()) {
  if (!officeAllow(who)) return null;
  const contacts = contactMap(await readContacts(s)), grants = new Map((await readGrants(s)).map((g) => [g.id, g]));
  return (await readMailings(s)).map((m) => shapeMailing(m, contacts, grants, false)).sort((a, b) => b.t - a.t);
}
export async function officeMailing(who, id, s = store()) {
  if (!officeAllow(who)) return null;
  const m = (await readMailings(s)).find((x) => x.id === mailingId(id));
  if (!m) return null;
  return shapeMailing(m, contactMap(await readContacts(s)), new Map((await readGrants(s)).map((g) => [g.id, g])), true);
}
/* Every email of a mailing not yet sent is taken back: its address and words go. */
const settled = ({ id, grant, contact, sent, failed, stopped }) => ({ id, grant, contact, ...(sent ? { sent } : {}), ...(failed ? { failed } : {}), ...(stopped ? { stopped } : {}) });
export async function stopMailing(who, id, s = store(), now = Date.now()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  let found = false, took = 0;
  await updateSealed(MAILINGS, (was) => {
    const list = was && Array.isArray(was.mailings) ? was.mailings : [];
    const k = list.findIndex((x) => x.id === mailingId(id));
    found = k >= 0; took = 0;
    if (!found) return null;
    const emails = list[k].emails.map((e) => (outState(e) === 'waiting' ? (took++, settled({ ...e, stopped: now })) : e));
    if (!took) return null;
    const copy = list.slice(); copy[k] = { ...list[k], emails, stopped: now, stoppedBy: who.handle };
    return { mailings: copy };
  }, s);
  return found ? { stopped: took } : { error: 'That mailing has been deleted.' };
}
export async function removeMailing(who, id, s = store()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  let why = 'That mailing has already been deleted.';
  await updateSealed(MAILINGS, (was) => {
    const list = was && Array.isArray(was.mailings) ? was.mailings : [];
    const m = list.find((x) => x.id === mailingId(id));
    if (!m) { why = 'That mailing has already been deleted.'; return null; }
    if (m.emails.some((e) => outState(e) === 'waiting')) { why = 'Some of its emails have not been sent yet. Stop it first.'; return null; }
    why = null;
    return { mailings: list.filter((x) => x !== m) };
  }, s);
  return why ? { error: why } : { gone: true };
}
/* A deleted contact's emails not yet sent are taken back with them. */
async function forgetContactMailings(cid, s) {
  await updateSealed(MAILINGS, (was) => {
    const list = was && Array.isArray(was.mailings) ? was.mailings : [];
    let changed = false;
    const next = list.map((m) => {
      const emails = m.emails.filter((e) => !(e.contact === cid && outState(e) === 'waiting'));
      if (emails.length === m.emails.length) return m;
      changed = true;
      return { ...m, emails };
    });
    return changed ? { mailings: next } : null;
  }, s);
}

/* The mailbox script's half. The outbox: emails waiting, oldest mailing first,
   with their addresses, which is the one time the office hands it any. */
export async function mailOutbox(s = store()) {
  if (!mailReady()) return null;
  const out = [];
  for (const m of (await readMailings(s)).sort((a, b) => a.t - b.t)) {
    for (const e of m.emails) {
      if (outState(e) === 'waiting') out.push({ id: e.id, to: e.to, subject: e.subject, body: e.body });
      if (out.length >= OUTBOX_BATCH) return out;
    }
  }
  return out;
}
/* The script sent one, or Google would not: the email keeps only whose and when. */
export async function mailSentFor(p, s = store(), now = Date.now()) {
  if (!mailReady()) return { error: 'The office is shut.', status: 503 };
  const id = outboxId(p && p.id);
  if (!id) return { error: 'Which email?' };
  const failed = !!(p && p.failed);
  let known = false;
  await updateSealed(MAILINGS, (was) => {
    const list = was && Array.isArray(was.mailings) ? was.mailings : [];
    known = false;
    for (let k = 0; k < list.length; k++) {
      const i = list[k].emails.findIndex((e) => e.id === id);
      if (i < 0) continue;
      known = true;
      const e = list[k].emails[i];
      if (e.sent || e.failed) return null;
      // Sent after it was stopped is still sent: the record says what happened.
      const emails = list[k].emails.slice();
      emails[i] = settled({ ...e, stopped: undefined, ...(failed ? { failed: now } : { sent: now }) });
      const copy = list.slice(); copy[k] = { ...list[k], emails };
      return { mailings: copy };
    }
    return null;
  }, s);
  return { ok: true, known };
}
