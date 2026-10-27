/* =============================================================================
   The CB — what every one of its functions shares.

   THE ONLY SERVER-SIDE CODE ON THIS SITE, and it is small on purpose. Everything
   else on stimpunks.world is a file Netlify serves as-is; this is the one place
   a request is answered by a program, and privacy.html says in plain words what
   it keeps. Every promise on that page is enforced here or in the functions
   beside it, so read that page before changing anything in this directory.

     · A HUNDRED MESSAGES AT MOST, EACH GONE TWO WEEKS AFTER IT WAS SENT, UNLESS
       THE DESK SETS A CHANNEL OTHERWISE. Ryan, 2026-10-25, after requests for
       more back history; fifty for 48 hours from 2026-10-18 ("Since we have
       people in timezones all over the world"), and ten gone at midnight in
       Colorado before that, which was the middle of somebody's afternoon. The
       whole channel is one JSON blob holding the latest messages, as many as
       its rule keeps. A read leaves out every message past its time,
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
       is the channel's own blob shape, under the rule for every channel. There
       is no list of everybody out there and no count of them, anywhere, and the
       places a visit has been are replaced rather than added to.
     · EVERY ROOM HAS A CHANNEL OF ITS OWN, BESIDE THE WORLD ONE. Ryan,
       2026-09-28: the radio tunes to World, the channel it always had, or to
       the room it is in, and a room's channel is the World channel's shape
       exactly, under its own rule from the desk, in a blob
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
       8x8 does not count one person twice, moderator only for the base (and
       for every account in the three public calls, below), and recording and
       transcription only for the base, who is who starts them.
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
       SINCE 2026-10-24 ANYBODY WITH AN ACCOUNT WALKS STRAIGHT IN, AS A
       MODERATOR. Ryan's call: only guests knock. 8x8 lets nobody but a
       moderator past the lobby (no claim in the token, no setting in the
       webhook), so in those three calls every account is a moderator, and
       can let guests in, mute or remove people, end the meeting for
       everybody and switch the lobby off; recording and transcription stay
       the base's. Every other room's call is unchanged.
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
     · EVENTS ARE SCHEDULED BY ANYBODY SIGNED ON, AND NAME WHO IS INTERESTED
       AND NEVER HOW MANY. Ryan's calls, 2026-10-23, after Discord's Scheduled
       Events: an event in a room's channel is seen by whoever may go into the
       room, one on World by everybody signed on; its maker or a moderator
       changes or cancels it; one that does not repeat is gone when it ends.
       See the events section below.
     · A PASS IS CHECKED AND NOT KEPT. It is an HMAC of the handle keyed by the
       current password, so changing the password in Netlify's environment and
       redeploying signs everybody off at once, and there is no list of passes
       anywhere to go stale or leak.
   ============================================================================= */
import { createHmac, createHash, createSign, createPrivateKey, createPublicKey, timingSafeEqual, randomUUID, randomBytes, scryptSync,
  createECDH, ECDH, createCipheriv, createDecipheriv, hkdfSync, sign as cryptoSign, verify as cryptoVerify } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { lookup as dnsLookup } from 'node:dns';
import { isIP } from 'node:net';
import { project } from './world.mjs';

export const KEEP = 100;            // messages on a channel at once, unless the desk says otherwise (Ryan, 2026-10-25; fifty from 2026-10-18, ten before)
export const LIFE_DAYS = 14;        // how long a message stays, unless the desk says otherwise (Ryan, 2026-10-25; 48 hours from 2026-10-18)
export const LIFE = LIFE_DAYS * 24 * 60 * 60 * 1000;
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
  return sealingStore(getStore({ name: 'cb', consistency: 'strong' }));
}

/* SEALED BY NAME (Ryan's call, 2026-10-25, Tasks first, the staff forums to
   follow). Every blob whose name is in STAFF_SEALED is sealed at rest under
   CB_STAFF_KEY, a key of its own, never the office's or the direct messages'
   (32 bytes as base64url, in Netlify and nowhere else), by the store itself:
   store() hands every caller sealingStore, which seals a JSON write to such a
   name and opens a read, so no code that reads or writes Tasks has to remember
   to. AES-256-GCM, a fresh nonce each time, and the blob's own name as
   associated data, so a sealed blob cannot be read under another name. NOT
   END-TO-END: the server opens them for whoever may read Tasks. Without the
   key Tasks are shut (staffReady), never written in the clear; a blob from
   before the key is read as it is and sealed on its next write or by the
   hourly sweep (sealStaffLeftovers). Since the same day, also every push
   device (a delivery address works like a password for sending that device
   notifications) and the stored roles (who holds which role is not ours to
   publish); without the key, the roles fall back to the break-glass list
   alone, which loadMods already does for roles it cannot read. A new staff store is a name added here,
   and its blobs must be JSON, because a sealed blob is. Losing the key loses
   what it sealed, so Ryan keeps a copy of it. */
const STAFF_SEALED = [/^tasks$/, /^task-recurs$/, /^task-templates$/, /^task-(?:comments|activity|inbox|views)\//,
  /^forum\/[ct]\//, /^mod-calls$/, /^push-devices$/, /^roles$/];
/* Names whose blobs are bytes, not JSON: a forum post's files and the uploads
   waiting for a post (2026-10-25). Sealed whole, SST1 and the nonce and tag
   before them. EVERY forum topic, list and file, not only the staff
   categories': a topic's name does not say its category, and a topic moved out
   of a staff category keeps its name, so sealing by category would leave a
   moved one in the clear. */
const STAFF_BYTES = [/^forum-file\//, /^forum-up\//, /^img\//];
/* AND EVERY STAFF ROOM'S CHANNEL (the same day): a room's log is named by its
   room, so lockedRoom picks out exactly the base's rooms and the categories
   with roles. Every channel picture is sealed (img/ above), because a
   picture's name does not say its room. A room that stops being a staff room
   keeps its sealed log readable: sealingStore opens anything sealed with the
   staff key whatever its name, and decides by name only when writing. */
export const staffSealed = (key) => typeof key === 'string'
  && (STAFF_SEALED.some((r) => r.test(key)) || (key.startsWith(ROOM_TALK) && !!lockedRoom(key.slice(ROOM_TALK.length))));
export const staffBytes = (key) => typeof key === 'string' && STAFF_BYTES.some((r) => r.test(key));
function staffCipherKey() {
  const v = process.env.CB_STAFF_KEY;
  if (!v) return null;
  try { const k = Buffer.from(v.trim(), 'base64url'); return k.length === 32 ? k : null; } catch (e) { return null; }
}
export function staffReady() { return !!staffCipherKey(); }
/* A staff room's channel without the key: shut, never written in the clear. */
export function staffShut(room) { return !!room && !!lockedRoom(room) && !staffReady(); }
/* JSON sealed under `key` with its blob's `name` as associated data, marked
   with whose key it is (`tag`). The direct messages' sealing uses it too. */
function sealJsonWith(key, tag, name, obj) {
  if (!key) throw new Error('shut');
  const iv = randomBytes(12), c = createCipheriv('aes-256-gcm', key, iv);
  c.setAAD(Buffer.from(name, 'utf8'));
  const data = Buffer.concat([c.update(JSON.stringify(obj), 'utf8'), c.final()]);
  return { sealed: 1, k: tag, iv: iv.toString('base64url'), tag: c.getAuthTag().toString('base64url'), data: data.toString('base64url') };
}
function openJsonWith(key, tag, name, d) {
  if (!d || d.sealed !== 1 || d.k !== tag) return d;
  if (!key) throw new Error('shut');
  const c = createDecipheriv('aes-256-gcm', key, Buffer.from(d.iv, 'base64url'));
  c.setAAD(Buffer.from(name, 'utf8'));
  c.setAuthTag(Buffer.from(d.tag, 'base64url'));
  return JSON.parse(Buffer.concat([c.update(Buffer.from(d.data, 'base64url')), c.final()]).toString('utf8'));
}
const isSealedStaff = (d) => !!d && d.sealed === 1 && d.k === 'staff';
/* Bytes sealed under `key` with their blob's `name` as associated data:
   `magic` (four letters saying whose key), the nonce, the tag, the bytes. */
const toBuf = (v) => (Buffer.isBuffer(v) ? v : v instanceof ArrayBuffer ? Buffer.from(v) : Buffer.from(v.buffer, v.byteOffset, v.byteLength));
const toArrayBuffer = (b) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
const bytesSealedAs = (magic, v) => { if (v == null) return false; const b = toBuf(v); return b.length > 32 && b.subarray(0, 4).toString('latin1') === magic; };
function sealBytesWith(key, magic, name, bytes) {
  if (!key) throw new Error('shut');
  const iv = randomBytes(12), c = createCipheriv('aes-256-gcm', key, iv);
  c.setAAD(Buffer.from(name, 'utf8'));
  const data = Buffer.concat([c.update(toBuf(bytes)), c.final()]);
  return toArrayBuffer(Buffer.concat([Buffer.from(magic, 'latin1'), iv, c.getAuthTag(), data]));
}
function openBytesWith(key, magic, name, bytes) {
  if (!bytesSealedAs(magic, bytes)) return bytes;
  if (!key) throw new Error('shut');
  const b = toBuf(bytes);
  const c = createDecipheriv('aes-256-gcm', key, b.subarray(4, 16));
  c.setAAD(Buffer.from(name, 'utf8'));
  c.setAuthTag(b.subarray(16, 32));
  return toArrayBuffer(Buffer.concat([c.update(b.subarray(32)), c.final()]));
}
const openStaffBytes = (key, d) => (d == null ? d : openBytesWith(staffCipherKey(), 'SST1', key, d));
/* The store, sealing every name STAFF_SEALED lists. `raw` is the store as it
   is, for the sweep that seals what came before the key. */
export function sealingStore(s) {
  if (!s || s.sealing) return s;
  return new Proxy(s, {
    get(t, p) {
      if (p === 'sealing') return true;
      if (p === 'raw') return t;
      if (p === 'get') return async (key, o) => opened(key, o, await t.get(key, o));
      if (p === 'getWithMetadata') return async (key, o) => {
        const g = await t.getWithMetadata(key, o);
        return g ? { ...g, data: opened(key, o, g.data) } : g;
      };
      if (p === 'setJSON') return async (key, v, o) => {
        if (staffBytes(key)) throw new Error('a sealed file is written with set');
        return t.setJSON(key, staffSealed(key) ? sealJsonWith(staffCipherKey(), 'staff', key, v) : v, o);
      };
      if (p === 'set') return async (key, v, o) => {
        if (staffSealed(key)) throw new Error('a sealed blob is written with setJSON');
        return t.set(key, staffBytes(key) ? sealBytesWith(staffCipherKey(), 'SST1', key, v) : v, o);
      };
      const v = t[p];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
}
/* What a read hands back: anything sealed with the staff key opened, under its
   own name, whether or not the name is sealed now; a sealed name's file read
   only as bytes. */
function opened(key, o, d) {
  if (isSealedStaff(d)) return openJsonWith(staffCipherKey(), 'staff', key, d);
  if (staffBytes(key)) { bytesRead(key, o); return openStaffBytes(key, d); }
  if (o && o.type === 'arrayBuffer' && bytesSealedAs('SST1', d)) return openStaffBytes(key, d);
  return d;
}
/* A sealed file is read whole, as bytes, or not at all. */
function bytesRead(key, o) { if (!o || o.type !== 'arrayBuffer') throw new Error(`a sealed file is read as an arrayBuffer: ${key}`); }

/* Hourly: every staff blob written before the key, sealed now with the same
   conditional write as any other change. Once a whole pass finds nothing left
   in the clear it writes SEAL_PASS and stops looking, because with the key
   nothing is ever written in the clear again (and without it the staff stores
   are shut). A name added to STAFF_SEALED or STAFF_BYTES needs SEAL_PASS
   moved on, so the sweep looks again. */
const SEAL_PASS = 'tasks+forum+rooms+devices+roles-1';
const SEAL_MARK = 'staff-sealed';
export async function sealStaffLeftovers(s = store()) {
  s = sealingStore(s);
  if (!staffReady()) return false;
  const mark = await s.raw.get(SEAL_MARK, { type: 'json' });
  if (mark && mark.pass === SEAL_PASS) return false;
  const keys = ['tasks', 'task-recurs', 'task-templates'];
  keys.push('mod-calls', 'push-devices', 'roles');
  for (const prefix of ['task-comments/', 'task-activity/', 'task-inbox/', 'task-views/', 'forum/t/', 'forum/c/', ROOM_TALK]) {
    for (const b of (await s.list({ prefix })).blobs || []) keys.push(b.key);
  }
  let any = false;
  // A file: its bytes and metadata written again, sealed, under its own name.
  for (const prefix of ['forum-file/', 'forum-up/', 'img/']) {
    for (const b of (await s.list({ prefix })).blobs || []) {
      const raw = await s.raw.getWithMetadata(b.key, { type: 'arrayBuffer' });
      if (!raw || bytesSealedAs('SST1', raw.data)) continue;
      await s.set(b.key, raw.data, { metadata: raw.metadata || {} });
      any = true;
    }
  }
  for (const key of keys.filter(staffSealed)) {
    const raw = await s.raw.get(key, { type: 'json' });
    if (!raw || isSealedStaff(raw)) continue;
    for (let attempt = 0; attempt < 12; attempt++) {
      const cur = await versioned(s, key);
      if (!cur.exists) break;
      const res = await s.setJSON(key, cur.data, { onlyIfMatch: cur.etag });
      if (res.modified) { any = true; break; }
      await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
    }
  }
  // Nothing left: say so, and the next hour does not look.
  if (!any) {
    const cur = await versioned(s, SEAL_MARK);
    await s.setJSON(SEAL_MARK, { pass: SEAL_PASS }, cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true });
  }
  return any;
}

/* The channel as it stands: no message past its time, whether or not the
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

/* A MESSAGE IS ON ITS CHANNEL FOR TWO WEEKS FROM WHEN IT WAS SENT (LIFE),
   worked out on every read and every write, so it is gone at its time whether
   or not the hourly sweep has got to it: the chalkboard's rule. Ryan,
   2026-10-25, after requests for more to scroll back through, the Pets channel
   above all; 48 hours from 2026-10-18, and the latest ten cleared at midnight
   before that.

   EVERYTHING IS KEPT FOR THE PROMISE IT WAS SENT UNDER, and never a minute
   longer for a change made after it was sent. What was sent before LIFE_FROM
   went at midnight in Colorado; what was sent before LONG_FROM goes at its
   48 hours. Each is the first midnight after Ryan's call, so a message sent
   the day the privacy page still said the shorter time keeps it. Every message
   either applies to is gone by then, so its test can come out any time after
   (LIFE_FROM's after 2026-10-19, LONG_FROM's after 2026-10-28) without
   changing what anybody sees. */
const LIFE_FROM = Date.UTC(2026, 9, 19, 6, 0);   // 2026-10-19 00:00 in Colorado
const LONG_FROM = Date.UTC(2026, 9, 26, 6, 0);   // 2026-10-26 00:00 in Colorado
const SHORT_LIFE = 48 * 60 * 60 * 1000;
/* `life` is how long its channel keeps a message NOW, in milliseconds, 0 for
   good. A message stamped when it was sent (stampLog, below) is kept for the
   shorter of its stamp and that: a longer setting reaches only what is sent
   after it, and a shorter one reaches everything at once. */
export function onAir(m, now = Date.now(), life = LIFE) {
  if (!m || typeof m.t !== 'number') return false;
  const cap = life === 0 ? Infinity : life;
  if (typeof m.life === 'number') return now - m.t < Math.min(m.life === 0 ? Infinity : m.life, cap);
  if (m.t < LIFE_FROM) return today(new Date(m.t)) === today(new Date(now));
  return now - m.t < Math.min(m.t < LONG_FROM ? SHORT_LIFE : LIFE, cap);
}
function stored(data) { return data && Array.isArray(data.messages) ? data.messages : []; }

/* ── How many messages each channel keeps, and for how long ──────────────
   PROVISIONED AT THE DESK IN THE MODERATORS' ROOM (Ryan's ask and calls,
   2026-10-25): an administrator sets, for World, for any room's channel, for
   every channel not set otherwise, and for direct messages, how many messages
   it keeps (KEEP_CHOICES) and for how long (LIFE_CHOICES, in days, 0 for
   good). One blob, `channel-rules`: each entry its keep, its days, who changed
   it last and when, and nothing more, the roles' arrangement. Without the
   blob, or for a channel it does not name, KEEP and LIFE_DAYS decide.

   A MESSAGE IS STAMPED WITH ITS CHANNEL'S TIME WHEN IT IS SENT (`life`, by
   stampLog and stampConv), so a longer setting never keeps anybody's words a
   minute longer than the channel promised when they were said; onAir() keeps
   a message for the shorter of its stamp and its channel's time now, so a
   shorter setting reaches everything at once. A shorter keep trims at once
   too, on every read. The Slake's places follow the setting for every
   channel; direct messages only their own.

   AGREED: a log whose everybody agreed to their messages from before the
   stamp being kept as long as the channel now keeps them. Pets, 2026-10-25:
   Ryan and Norah, the only two who had written there, both said yes. Nothing
   else is in it, and nothing goes in it without everybody who wrote there
   saying yes. */
export const KEEP_CHOICES = [50, 100, 200, 500, 1000];
export const LIFE_CHOICES = [1, 2, 7, 14, 30, 90, 365, 0];
export const WINDOW = 100;                // messages a listen sends at first; Earlier messages asks for more
const RULES = 'channel-rules';
const RULES_FRESH = 30 * 1000;
const RULE_ALL = 'every';                 // every channel not set otherwise, and the Slake
const RULE_DM = 'dm';                     // direct messages
const AGREED = new Set(['room-talk-pets']);
const rulesSeen = new WeakMap();          // per store: { at, rooms }

function cleanRule(r) {
  if (!r || typeof r !== 'object') return null;
  if (!KEEP_CHOICES.includes(r.keep) || !LIFE_CHOICES.includes(r.days)) return null;
  const out = { keep: r.keep, days: r.days };
  if (typeof r.by === 'string') out.by = r.by;
  if (typeof r.t === 'number') out.t = r.t;
  return out;
}
function rulesDoc(d) {
  const rooms = {};
  const src = d && typeof d === 'object' && d.rooms && typeof d.rooms === 'object' ? d.rooms : {};
  for (const [k, v] of Object.entries(src)) { const r = cleanRule(v); if (r && ruleName(k)) rooms[k] = r; }
  return { rooms };
}
/* A name the rules can hold: World, every, dm, or a room's tag. */
function ruleName(k) { return k === 'world' || k === RULE_ALL || k === RULE_DM || !!roomTag(k); }
/* The rules as this instance last read them, at most RULES_FRESH old. */
export async function loadRules(s = store(), now = Date.now()) {
  const seen = rulesSeen.get(s);
  if (seen && now - seen.at < RULES_FRESH) return seen.rooms;
  let rooms = {};
  try { rooms = rulesDoc(await s.get(RULES, { type: 'json' })).rooms; } catch (e) { rooms = seen ? seen.rooms : {}; }
  rulesSeen.set(s, { at: now, rooms });
  return rooms;
}
function ruleNameOf(key) {
  if (key === KEY) return 'world';
  if (key.startsWith(ROOM_TALK)) return key.slice(ROOM_TALK.length);
  return RULE_ALL;
}
/* A channel's rule: keep, days, and life in milliseconds (0 for good). */
function ruleFrom(rooms, name) {
  const r = rooms[name] || (name === RULE_DM ? null : rooms[RULE_ALL]) || { keep: KEEP, days: LIFE_DAYS };
  return { keep: r.keep, days: r.days, life: r.days === 0 ? 0 : r.days * 24 * 60 * 60 * 1000 };
}
export async function ruleOf(name, s = store()) { return ruleFrom(await loadRules(s), name); }
const ruleOfKey = async (key, s) => ruleFrom(await loadRules(s), ruleNameOf(key));
/* What a channel's rule says to a radio: never who set it. */
export const shapeRule = (r) => ({ keep: r.keep, days: r.days });

/* On air in this log, under this rule. */
function liveIn(key, m, now, rule) {
  if (AGREED.has(key) && m && typeof m.life !== 'number' && typeof m.t === 'number' && m.t >= LIFE_FROM) m = { ...m, life: 0 };
  return onAir(m, now, rule.life);
}
const liveOf = (key, list, now, rule) => list.filter((m) => liveIn(key, m, now, rule)).slice(-rule.keep);
/* Every message new to this write takes its channel's time now. */
function stampNew(before, next, rule) {
  const had = new Set(before.map((m) => m && m.id));
  return next.map((m) => (m && !had.has(m.id) && typeof m.life !== 'number' ? { ...m, life: rule.life } : m));
}

/* What a change no longer lets a channel keep is deleted at once, not at the
   next write or the hourly sweep: otherwise fewer and then more again would
   bring back messages the desk had been told were gone. */
async function trimFor(name, s) {
  if (name === RULE_DM) return sweepDms(s);
  if (name === 'world' || name === RULE_ALL) await sweepLog(KEY, s);
  if (name === RULE_ALL) return sweepRoomTalk(s);
  if (name !== 'world') return sweepLog(ROOM_TALK + name, s);
}

/* The desk's view: every entry, with who changed it last, and the defaults. */
export function rulesEditor(who) { return rolesEditor(who); }
export async function rulesList(who, s = store()) {
  if (!rulesEditor(who)) return { error: 'Channels are set by administrators.' };
  const rooms = rulesDoc(await s.get(RULES, { type: 'json' })).rooms;
  rulesSeen.set(s, { at: Date.now(), rooms });
  return { rules: rooms, defaults: { keep: KEEP, days: LIFE_DAYS }, keeps: KEEP_CHOICES, days: LIFE_CHOICES };
}
/* Set one entry, or with `clear` take it back to what it follows. */
export async function setRule(who, name, rule, s = store(), now = Date.now(), clear = false) {
  if (!rulesEditor(who)) return { error: 'Channels are set by administrators.' };
  if (typeof name !== 'string' || !ruleName(name) || quietRoom(name)) return { error: 'That is not a channel the desk can set.' };
  const r = clear ? null : cleanRule({ keep: Number(rule && rule.keep), days: Number(rule && rule.days) });
  if (!clear && !r) return { error: 'Choose how many messages and for how long from the lists.' };
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, RULES);
    const rooms = rulesDoc(cur.exists ? cur.data : null).rooms;
    if (clear) delete rooms[name];
    else rooms[name] = { ...r, by: who.handle, t: now };
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(RULES, { rooms }, opts);
    if (res.modified) {
      rulesSeen.set(s, { at: now, rooms });
      await trimFor(name, s);
      return { rules: rooms, defaults: { keep: KEEP, days: LIFE_DAYS }, keeps: KEEP_CHOICES, days: LIFE_CHOICES };
    }
    await new Promise((x) => setTimeout(x, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* The latest messages in one blob, as many as its rule keeps: the channel,
   each room's, and each place on the Slake. Written once so a place cannot
   drift from the channel's rules about how long a message stays or how a
   write that loses a race tries again. */
async function readLog(key, s, now = Date.now()) {
  const [data, rule] = await Promise.all([s.get(key, { type: 'json' }), ruleOfKey(key, s)]);
  return { messages: liveOf(key, stored(data), now, rule), rule };
}

async function updateLog(key, change, s) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    const now = Date.now();
    const rule = await ruleOfKey(key, s);
    const live = cur.exists ? liveOf(key, stored(cur.data), now, rule) : [];
    const next = change(live.slice());
    if (next === null) return live;
    const body = { messages: stampNew(live, next, rule).slice(-rule.keep) };
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, body, opts);
    if (res.modified) return body.messages;
    // Somebody else got there first. Wait a moment, a different moment for
    // each of us, and read again.
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* Hourly: take every message past its two weeks out of one log, with the same
   conditional write a message goes out with, and delete the log once nothing
   in it is left. */
async function sweepLog(key, s, now = Date.now()) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    if (!cur.exists) return false;
    const all = stored(cur.data);
    const live = liveOf(key, all, now, await ruleOfKey(key, s));
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
   in it instead of two weeks. */
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
async function updateList(key, field, change, s, tries = 12) {
  for (let attempt = 0; attempt < tries; attempt++) {
    const cur = await versioned(s, key);
    const list = ((cur.exists && cur.data && cur.data[field]) || []).slice();
    const was = linksBefore(key, list);
    const next = change(list);
    if (next === null) return list;
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, { [field]: next }, opts);
    if (res.modified) { await linksAfter(key, was, next, s); return next; }
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
  if (releaseKind(kind)) {
    await updateList(outBlob(kind), 'out', (list) => {
      const i = list.findIndex(mineOut(pk, id));
      if (i < 0 || list[i].pet.name === name) return null;
      const next = list.slice();
      next[i] = { ...list[i], pet: { ...list[i].pet, name } };
      return next;
    }, s);
  }
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
  await callAllHome(pk, s);
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
  if (releaseKind(kind)) {
    await updateList(outBlob(kind), 'out', (list) => (list.some((e) => e.pet.id === id && e.pet.name)
      ? list.map((e) => (e.pet.id === id ? { ...e, pet: { ...e.pet, name: '' } } : e)) : null), s);
  }
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

/* ── Pets let out at the café and the Run ────────────────────────────────

   Ryan's ask, 2026-10-23: let your adopted dogs out on the dog park and your
   adopted cats into the cat café. A pet can go out at the room for its kind
   (RELEASE_ROOMS: cats at Pekoe and Purrs, dogs on the Run, and a small animal
   nowhere yet) and be there among the shelter's animals, for anybody who opens
   the room, until its person calls it home. It stays theirs the whole time:
   nothing changes in their pets or on the forever list.

   THE ROOM SAYS A PET HAS A HOME AND NEVER WHOSE. One blob per kind (`out-cat`,
   `out-dog`) holds, for each pet out, in the order they went out, a copy of
   what it looks like and is called and the pet key it came from, and nothing
   about when. The pet key never leaves the server (shapeOut): the room needs
   no pass to open, like the shelter's own list, and a pet's name is already
   on the forever list. A copy rather than a pointer, so opening a room reads
   one blob and not everybody's pets; renaming a pet and the base taking a
   name off change the copy as well.

   THERE IS ALWAYS SOMEWHERE TO SIT. Each room is built with a place for every
   animal the shelter can hold and three to spare (make-pekoe.py,
   make-the-run.py), so the shelter's animals and the pets let out share
   SHELTER_KEEP between them: letting one out is refused while the room is
   full, and if the shelter fills up afterwards the pets let out last wait at
   the gate (outIn) until there is room. An animal waiting for a home is never
   the one left outside. RELEASE_EACH keeps a room from being one person's.

   Calling a pet home, Forget me and deleting the username take it out. */
export const RELEASE_ROOMS = { cat: 'pekoe-and-purrs.html', dog: 'the-run.html' };
export const RELEASE_EACH = 3;
const outBlob = (kind) => `out-${kind}`;
export function releaseKind(k) { return Object.prototype.hasOwnProperty.call(RELEASE_ROOMS, k) ? k : null; }
const isKind = (a, kind) => !!(a && typeof a.id === 'string' && a.id[0] === KINDS[kind].prefix);
const mineOut = (pk, id) => (e) => e.by === pk && e.pet.id === id;

export async function readOut(kind, s = store()) {
  const d = await s.get(outBlob(kind), { type: 'json' });
  return ((d && d.out) || []).filter((e) => e && typeof e.by === 'string' && isKind(e.pet, kind));
}

/* Let one of your own pets out. { out: true }, or { why } when it is not one
   of yours ('mine'), RELEASE_EACH of yours are out already ('each'), or the
   room has no space ('full'). Out already is out: nothing changes. */
export async function letOut(kind, pk, id, s = store()) {
  const pet = (await readPets(pk, s)).find((a) => a.id === id && isKind(a, kind));
  if (!pet) return { why: 'mine' };
  const inShelter = (await readShelter(kind, s)).shelter.length;
  let why = null;
  await updateList(outBlob(kind), 'out', (list) => {
    why = null;
    if (list.some(mineOut(pk, id))) return null;
    if (list.filter((e) => e.by === pk).length >= RELEASE_EACH) { why = 'each'; return null; }
    if (inShelter + list.length >= SHELTER_KEEP) { why = 'full'; return null; }
    return [...list, { by: pk, pet: { id: pet.id, kind, coat: pet.coat, mark: pet.mark, place: pet.place, mood: pet.mood, name: pet.name || '' } }];
  }, s);
  return why ? { why } : { out: true };
}

/* Call one of your pets home. Home already is home. */
export async function callHome(kind, pk, id, s = store()) {
  await updateList(outBlob(kind), 'out', (list) => (list.some(mineOut(pk, id)) ? list.filter((e) => !mineOut(pk, id)(e)) : null), s);
  return true;
}

/* Everything of one person's out, in every room: Forget me and deleting the
   username, through forgetPets. */
async function callAllHome(pk, s) {
  for (const kind of Object.keys(RELEASE_ROOMS)) {
    await updateList(outBlob(kind), 'out', (list) => (list.some((e) => e.by === pk) ? list.filter((e) => e.by !== pk) : null), s);
  }
}

/* What the room is shown: the pets out, as many as there is space for beside
   the shelter's animals, the first out first. Never whose. */
export function shapeOut(pet) {
  const out = shapeAnimal(pet);
  out.name = typeof pet.name === 'string' ? pet.name : '';
  out.out = true;
  return out;
}
export async function outIn(kind, inShelter, s = store()) {
  if (!releaseKind(kind)) return [];
  const space = Math.max(0, SHELTER_KEEP - inShelter);
  return (await readOut(kind, s)).slice(0, space).map((e) => shapeOut(e.pet));
}

/* Your own pets of a kind, for the room's tray: each says whether it is out,
   and whether it is waiting at the gate for space. No dates. */
export async function releaseTray(kind, pk, s = store()) {
  const list = await readOut(kind, s);
  const space = Math.max(0, SHELTER_KEEP - (await readShelter(kind, s)).shelter.length);
  return (await readPets(pk, s)).filter((a) => isKind(a, kind)).map((a) => {
    const out = shapeAnimal(a);
    delete out.at; delete out.t;
    const i = list.findIndex(mineOut(pk, a.id));
    out.out = i >= 0;
    if (i >= space) out.gate = true;
    return out;
  });
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
export const CHIMERA = {"slots":["body","head","ears","mouth","arms","feet","tail","back","colours","markings"],"defaults":{"arms":"body","feet":"body"},"animals":["armadillo","axolotl","badger","bat","bear","beaver","camel","capybara","cat","chameleon","chicken","crow","dog","dolphin","elephant","fox","frog","highlandcow","hippo","jellyfish","koi","lion","meerkat","mouse","narwhal","octopus","opossum","otter","owl","panda","parrot","peacock","penguin","pig","platypus","porcupine","possum","rabbit","raccoon","raven","rhino","roadrunner","snake","squirrel","swan","tiger","turkey","turtle","zebra"],"backs":["armadillo","bat","camel","chameleon","chicken","crow","highlandcow","lion","owl","parrot","peacock","porcupine","raven","roadrunner","swan","turkey","turtle","zebra"]};
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
export const QUEST_IDS = ["street-chalk", "map-pin", "pony-sequin", "chappell-rhinestone", "club-pin", "zine-staple", "zine2-clip", "quantum-fringe", "enid-sticker", "polaroids-pin", "play-block", "arcade-token", "quill-feather", "otter-clam", "pebbling-stone", "burrow-door", "jungle-leaf", "den-spindle", "mopery-card", "oracle-lozenge", "doom-foxing", "feed-splitflap", "src-rim", "your-room-keys", "board-clip", "camp-peg", "yurt-tallow", "reading-bookmark", "music-moth", "cinema-ticket", "myths-amber", "hollow-glowworm", "meadow-firefly", "hermitage-sunflower", "bns-spoon", "bgh-acorn", "mtn-carabiner", "ncx-stile", "anm-feather", "bds-chiltepin", "ghc-leaf", "atn-egg", "dry-churn", "hbx-coin", "wsc-seed", "liner-colophon", "garden-label", "zibaldone-nib", "hole-cuts", "checkpoint-pillow", "foundry-sort", "danny-drain", "outskirts-reflector", "lagoon-speaker", "sithen-thorn", "covenstead-kettle", "dead-tired-doorstop", "laughingstock-setlist", "picture-house-earmuffs", "samefood-divider", "collection-tag", "vital-sprig", "looming-flood", "dance-punks-glowstick", "small-hours-crayon", "repeater-qsl", "nothing-for-sale-torch", "caverns-rail", "glow-star", "rave-earplug", "cool-cap", "bigsteep-carboy", "mycelium-block", "frosty-thermometer", "breezy-ribbon", "community-letter", "world-dewdrop", "th-gavel", "fb-flake", "dr-key", "bd-lamp", "md-fuse", "es-note", "dressup-feather", "chm-lenscap", "cmc-spare", "cop-packet", "pts-tag", "booth-strip", "fancy-wing", "now-playing-brush", "mural-lid", "lib-slip", "lsp-string", "ook-peel", "cavendish-marker", "live-room-tape", "broadside-sheet", "doom-scoop-scoop", "mud-welly", "pando-leaf", "fridge-magnet", "stair-lift", "cats-torch", "dogs-lead", "smalls-hay", "onb-washi", "ll-dibber", "hgc-ladle", "pkp-mouse", "aqp-mat", "brass-tack", "wr-mantle", "op-tag", "ed-loupe", "wh-feather", "cf-marshmallow", "cv-icicle", "nh-honey", "wbb-carrot", "sb-fork", "run-ball", "tks-boat", "grn-leaf", "pil-tape", "syw-blank", "vol-bobbin", "bkb-mic"];
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
export const PATCH_IDS = ["stimpunks-world", "pink-pony-peep", "wand-and-rabbit", "interdependence", "kindness-is-punk", "plant-powered", "intermittently-social-lone-wolf", "solarpunk", "synapse-of-the-soil"];
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

/* ── A crystal pouch ─────────────────────────────────────────────────────────

   Helen Edgar's ask, 2026-10-26: take a crystal with you from the Crystal Wheel
   in Myths & Legends, behind her Faery Yurt, and have it in your Profile.

   THE POUCH IS THE EIGHTH THING THE STREET KEEPS UNDER A PERSON, after pets,
   avatars, jobs, patches, profile cards, chimeras and props, and only when
   somebody presses a crystal's own Take it with you. It is the battle jacket's
   arrangement exactly: filed under `petKey`, holding WHICH CRYSTALS, SORTED, AND
   NOTHING ABOUT WHEN, every id checked against CRYSTAL_IDS, which
   tools/make-yurt-myths.py writes out of data/yurt-myths.json. NOTHING COUNTS
   WHO HAS A CRYSTAL. A crystal can be put back, and nothing remembers it was
   there. Forget me and deleting the username empty it; SHOWING IT needs a
   claimed username, the pets' rule and for their reason. */
/* crystal:ids:begin */
export const CRYSTAL_IDS = ["amethyst", "citrine", "garnet", "moonstone", "labradorite", "lapis-lazuli", "turquoise", "rose-quartz", "clear-quartz", "smoky-quartz", "obsidian", "tigers-eye"];
/* crystal:ids:end */
const crystalsBlob = (k) => `crystals/${k}`;
const crystalsShownBlob = (k) => `crshown/${k}`;

export function crystalId(v) { return typeof v === 'string' && CRYSTAL_IDS.includes(v) ? v : null; }

export async function readCrystals(pk, s = store()) {
  const d = await s.get(crystalsBlob(pk), { type: 'json' });
  return ((d && Array.isArray(d.crystals)) ? d.crystals : []).filter((id) => CRYSTAL_IDS.includes(id)).sort();
}

/* Put one crystal in the pouch (`put` true) or take it back out (`put` false).
   { changed, crystals }: changed is false when it was already in, or already
   out. */
export async function pouchCrystal(pk, id, put, s = store()) {
  const key = crystalsBlob(pk);
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    const had = ((cur.exists && cur.data && Array.isArray(cur.data.crystals)) ? cur.data.crystals : []).filter((x) => CRYSTAL_IDS.includes(x));
    if (had.includes(id) === put) return { changed: false, crystals: [...had].sort() };
    const next = (put ? [...had, id] : had.filter((x) => x !== id)).sort();
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, { crystals: next }, opts);
    if (res.modified) return { changed: true, crystals: next };
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* Forget me, and deleting the username: the switch that shows it first,
   then the pouch. */
export async function forgetCrystals(pk, s = store()) {
  await s.delete(crystalsShownBlob(pk));
  await s.delete(crystalsBlob(pk));
  return true;
}

export async function setCrystalsShown(handle, on, s = store(), now = Date.now()) {
  const k = crystalsShownBlob(petKey(handle));
  if (!on) { await s.delete(k); return false; }
  const cur = await versioned(s, k);
  if (!cur.exists) await s.setJSON(k, { since: now }, { onlyIfNew: true });
  return true;
}

export async function crystalsShown(handle, s = store()) {
  if (!(await readAccount(handle, s))) return false;
  const d = await s.get(crystalsShownBlob(petKey(handle)), { type: 'json' });
  return !!(d && typeof d.since === 'number');
}

/* Somebody's crystal pouch, as a person on the CB is shown it: { handle,
   crystals } when it is shown, and null otherwise, whatever the reason. */
export async function shownCrystals(handle, s = store()) {
  if (!(await crystalsShown(handle, s))) return null;
  const acct = await readAccount(handle, s);
  return { handle: acct.handle, crystals: await readCrystals(petKey(handle), s) };
}

/* ── A herb basket ───────────────────────────────────────────────────────────

   Helen Edgar's ask, 2026-10-26: gather herbs in the Herbery in Myths &
   Legends and keep them in a basket in your Profile, the way the crystal pouch
   works; tipping them into the cauldron happens on the page and sends nothing.

   THE BASKET IS THE NINTH THING THE STREET KEEPS UNDER A PERSON, and it is the
   pouch's arrangement exactly: filed under `petKey`, holding WHICH HERBS,
   SORTED, AND NOTHING ABOUT WHEN, every id checked against HERB_IDS, which
   tools/make-yurt-myths.py writes out of data/yurt-myths.json. NOTHING COUNTS
   WHO HAS A HERB, and the brews a basket could make are worked out on the page
   and kept nowhere. A herb can be put back, and nothing remembers it was
   there. Forget me and deleting the username empty it; SHOWING IT needs a
   claimed username. */
/* herb:ids:begin */
export const HERB_IDS = ["rosemary", "thyme", "mint", "basil", "bay", "lavender", "rose", "elder", "yarrow", "hawthorn"];
/* herb:ids:end */
const herbsBlob = (k) => `herbs/${k}`;
const herbsShownBlob = (k) => `hbshown/${k}`;

export function herbId(v) { return typeof v === 'string' && HERB_IDS.includes(v) ? v : null; }

export async function readHerbs(pk, s = store()) {
  const d = await s.get(herbsBlob(pk), { type: 'json' });
  return ((d && Array.isArray(d.herbs)) ? d.herbs : []).filter((id) => HERB_IDS.includes(id)).sort();
}

/* Put one herb in the basket (`put` true) or take it back out (`put` false).
   { changed, herbs }: changed is false when it was already in, or already
   out. */
export async function basketHerb(pk, id, put, s = store()) {
  const key = herbsBlob(pk);
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    const had = ((cur.exists && cur.data && Array.isArray(cur.data.herbs)) ? cur.data.herbs : []).filter((x) => HERB_IDS.includes(x));
    if (had.includes(id) === put) return { changed: false, herbs: [...had].sort() };
    const next = (put ? [...had, id] : had.filter((x) => x !== id)).sort();
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, { herbs: next }, opts);
    if (res.modified) return { changed: true, herbs: next };
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* Forget me, and deleting the username: the switch that shows it first,
   then the basket. */
export async function forgetHerbs(pk, s = store()) {
  await s.delete(herbsShownBlob(pk));
  await s.delete(herbsBlob(pk));
  return true;
}

export async function setHerbsShown(handle, on, s = store(), now = Date.now()) {
  const k = herbsShownBlob(petKey(handle));
  if (!on) { await s.delete(k); return false; }
  const cur = await versioned(s, k);
  if (!cur.exists) await s.setJSON(k, { since: now }, { onlyIfNew: true });
  return true;
}

export async function herbsShown(handle, s = store()) {
  if (!(await readAccount(handle, s))) return false;
  const d = await s.get(herbsShownBlob(petKey(handle)), { type: 'json' });
  return !!(d && typeof d.since === 'number');
}

/* Somebody's herb basket, as a person on the CB is shown it: { handle, herbs }
   when it is shown, and null otherwise, whatever the reason. */
export async function shownHerbs(handle, s = store()) {
  if (!(await herbsShown(handle, s))) return null;
  const acct = await readAccount(handle, s);
  return { handle: acct.handle, herbs: await readHerbs(petKey(handle), s) };
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
   deleting the username (clearProfile, Ryan's call, 2026-10-18).

   A TAGLINE AND THE COMMUNITY DIRECTORY (Ryan's ask, 2026-10-23). A tagline is
   one line of the person's own, under their name on the card. The directory,
   on directory.html, lists everybody who switched on Show my profile in the
   community directory, `listed` on the card, off until switched on: their
   username, nameplate, tagline and pronouns, copied to one blob the way the
   nameplate is, and taken out of it FIRST when the profile goes, so Clear my
   card, a moderator clearing it, Forget me and deleting the username all take
   somebody out of it. It is shown to anybody signed on to the CB, in
   alphabetical order, and it says how many people are in it nowhere: the
   friendly edits are a count at the top, a "joined" date beside a name and a
   switch that starts on, and each is refused by tools/make-profile.py. */
/* profile:keys:begin */
export const PROFILE_KEYS = {"themes":["amber","day","high","soldark","sollight","warmlight","cooldark","plantgreen","redlight","green","red","teal","biophilic","starstuff","lcars","glitter","solarpunk","biomech","greeble","cyborg","unicorn","wabi","lagoon","kelp","fairy","cloud","zelda","microchip","ascii","sml","digdug","deviant","hp49g","mario","cube","pipboy","gameboy","ti82","louise","paula","shop","mansn","w","termites","greenroom","sarah","crashers","inquisition","metroid","megaman","fable","skyrim","doom","portal","witcher","gta","loz","mordor"],"banners":["soldark","sollight","biophilic","starstuff","lcars","glitter","solarpunk","biomech","greeble","cyborg","unicorn","wabi","zelda","microchip","ascii","sml","digdug","deviant","hp49g","mario","cube","pipboy","gameboy","ti82","louise","paula","shop","mansn","w","termites","greenroom","sarah","crashers","inquisition","metroid","megaman","fable","skyrim","doom","portal","witcher","gta","loz","kelp","fairy","cloud","lagoon","mordor"],"decorations":["wreath","vines","stars","sparkles","mushrooms","leaves","hearts","gears","bubbles","snow","flames","moons","notes","paws","halo","circuit","butterflies","crystals","lanterns","otterring","cloudcars"],"frames":["briar","ivy","brass","lights","stitches","film","circuit","crystals","garland","starry","gate","fronds","portholes"],"effects":["butterflies","fireflies","petals","leaves","snow","bubbles","sparkles","shooting","notes","hearts","lagoon","otters","fairy","wolf","starward","dolphins","autumn","cloudcity"],"faces":["Atkinson Hyperlegible","Abril Fatface","Amarante","Anton","B612","Bagel Fat One","Bowlby One SC","Bungee","Bungee Shade","Caveat","Chakra Petch","Cherry Bomb One","Cinzel","Courier Prime","Della Respira","Doto","DynaPuff","Eczar","Exo 2","Forum","Fraunces","Fredoka","Gloria Hallelujah","Gravitas One","Inter","JetBrains Mono","Jost","Leckerli One","Libre Franklin","Lilita One","Limelight","Macondo","Marcellus SC","Martian Mono","Michroma","Monoton","Oxanium","Permanent Marker","Playfair Display","Press Start 2P","Righteous","Rubik Dirt","Rye","Sansita","Shrikhand","Sour Gummy","Space Mono","Syncopate","Titan One","Unbounded","VT323","Yanone Kaffeesatz","Yellowtail"]};
/* profile:keys:end */
export const PRONOUNS_MAX = 40;
export const TAGLINE_MAX = 100;
export const BIO_MAX = 500;
export const PROFILE_LINKS = 5;
export const PROFILE_LINK_MAX = 300;
export const ROOM_WHY_MAX = 200;
export const PROFILE_REACHES = ['private', 'public'];
const profileBlob = (k) => `profile/${k}`;
const PLATES = 'profiles-plates';
const DIRECTORY = 'profiles-directory';

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
  const tagline = cleanUpTo(p.tagline, TAGLINE_MAX);
  if (tagline === null) return { error: `A tagline is one line of at most ${TAGLINE_MAX} characters.` };
  out.tagline = tagline;
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
  // A forum category's room is named only to the category's readers, and a
  // profile is shown to everybody signed on: the forums themselves can be it.
  if (room && room.startsWith(FORUM_ROOM)) return { error: 'A category in the forums cannot be named on a profile. The forums themselves can.' };
  out.room = room;
  const why = cleanUpTo(p.why, ROOM_WHY_MAX);
  if (why === null) return { error: `Why it is your favourite is at most ${ROOM_WHY_MAX} characters.` };
  out.why = room ? why : '';
  // In the community directory only when the person said yes in as many words.
  out.listed = p.listed === true;
  /* WHO MAY OPEN THE CARD (Helen Edgar's question, Ryan's call, 2026-10-26):
     '' is the community, anybody signed on, as every card was before and as
     every card still is until its owner chooses; 'private' is its owner alone,
     which takes the nameplate off Who's online and the card out of the
     directory; 'public' is anybody with its link, on profile.html. */
  const reach = p.reach == null || p.reach === '' ? '' : (PROFILE_REACHES.includes(p.reach) ? p.reach : null);
  if (reach === null) return { error: 'A card is private, for the community, or open to the public.' };
  out.reach = reach;
  if (reach === 'private') out.listed = false;
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

async function updateDirectory(change, s) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, DIRECTORY);
    const people = { ...((cur.exists && cur.data && cur.data.people) || {}) };
    if (change(people) === false) return people;
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(DIRECTORY, { people }, opts);
    if (res.modified) return people;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* One person's line in the directory, checked on the way in and on the way
   out: exactly their username, nameplate, tagline and pronouns, or null. A line
   filed under somebody else's pet key is nobody's. */
function directoryLine(k, e) {
  if (!e || typeof e !== 'object') return null;
  const handle = cleanHandle(e.handle);
  if (!handle || handle !== e.handle || petKey(handle) !== k) return null;
  const plate = inList(PROFILE_KEYS.banners, e.plate);
  const tagline = cleanUpTo(e.tagline, TAGLINE_MAX);
  const pronouns = cleanUpTo(e.pronouns, PRONOUNS_MAX);
  return { handle, plate: plate || '', tagline: tagline || '', pronouns: pronouns || '' };
}

/* In the directory, or taken out of it. A card that says listed is copied in
   under the username the caller signed on as; one wearing a set, which is
   saved without a username, keeps the one already there, and is not listed
   from nothing. */
async function showInDirectory(pk, p, handle, s) {
  return updateDirectory((people) => {
    if (!p || !p.listed) { if (!own(people, pk)) return false; delete people[pk]; return true; }
    const name = handle || (own(people, pk) && people[pk] && people[pk].handle);
    const line = name ? directoryLine(pk, { handle: name, plate: p.plate, tagline: p.tagline, pronouns: p.pronouns }) : null;
    if (!line) return false;
    if (own(people, pk) && JSON.stringify(people[pk]) === JSON.stringify(line)) return false;
    people[pk] = line;
    return true;
  }, s);
}

/* Keep a profile, already checked by cleanProfile. The caller has checked the
   username is claimed, and says what it is, for the directory. One with
   nothing in it is forgotten instead. */
export async function keepProfile(pk, p, s = store(), handle = null) {
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
  await showPlate(pk, p.reach === 'private' ? '' : (p.plate || ''), s);
  await showInDirectory(pk, p, handle, s);
  return p;
}

/* Clearing it, a moderator clearing it, Forget me and deleting the username:
   off Who's online and out of the directory first, then the record. */
export async function forgetProfile(pk, s = store()) {
  await showPlate(pk, '', s);
  await showInDirectory(pk, null, null, s);
  await s.delete(profileBlob(pk));
  return true;
}

/* THE COMMUNITY DIRECTORY as anybody signed on is shown it: everybody in it,
   alphabetical, each with their username, BASE if they are a moderator,
   nameplate, tagline, pronouns and the avatar they wear; and whether the asker
   is in it. No number, and nothing about when anybody joined or was last
   seen. */
export async function communityDirectory(who, s = store(), mods) {
  if (mods === undefined) mods = await loadMods();
  const d = await s.get(DIRECTORY, { type: 'json' });
  const listed = (d && d.people && typeof d.people === 'object') ? d.people : {};
  const people = [];
  for (const k of Object.keys(listed)) {
    const line = directoryLine(k, listed[k]);
    if (line) people.push({ ...line, base: !!(mods && mods.has(foldHandle(line.handle))), claimed: true });
  }
  people.sort((x, y) => x.handle.localeCompare(y.handle));
  const worn = await withAvatars(people, s);
  return {
    people: worn.map(({ claimed, ...rest }) => rest),
    listed: !!(who && who.handle && own(listed, petKey(who.handle)) && directoryLine(petKey(who.handle), listed[petKey(who.handle)])),
  };
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
   null for a handle that is not claimed, whatever the reason. A private card
   is shown to its owner, the handle `asker` names, and to nobody else, who is
   told { handle, profile: null, private: true }. */
export async function shownProfile(handle, s = store(), asker = null) {
  const acct = await readAccount(handle, s);
  if (!acct) return null;
  const profile = await readProfile(petKey(handle), s);
  if (profile && profile.reach === 'private' && !(asker && foldHandle(asker) === foldHandle(acct.handle))) {
    return { handle: acct.handle, profile: null, private: true };
  }
  return { handle: acct.handle, profile };
}

/* A PROFILE'S OWN PAGE, profile.html#<username> (Helen Edgar's question, Ryan's
   calls, 2026-10-26): one answer with everything the page draws, for `who`, a
   pass read by readPass, or null for somebody signed off.
     · Signed off, it answers only for a card its owner opened to the public,
       and null for every other handle, whatever the reason: private, for the
       community, no card, not claimed or nobody at all. So the page cannot
       tell anybody which usernames exist.
     · Signed on, it answers as the radio's profile does: the card, unless it
       is private and not yours, then the avatar worn and each tab its owner
       shows on the CB, and BASE from the moderators' list.
     · NEVER PROPS, A CHAT STATUS OR A WAY TO MESSAGE THEM, which are the
       community's and stay on the radio: a prop carries somebody else's words,
       and a status and a conversation are between people signed on.
   The card goes without `listed`, and with `reach` only to its owner. Nothing
   about who asked is kept. */
export async function profilePage(handle, who, s = store(), mods) {
  const acct = await readAccount(handle, s);
  if (!acct) return null;
  const name = acct.handle, pk = petKey(name);
  const mine = !!(who && foldHandle(who.handle) === foldHandle(name));
  const card = await readProfile(pk, s);
  const reach = (card && card.reach) || '';
  if (!who && reach !== 'public') return null;
  const [av, pets, jobs, patches, chimeras, crystals, herbs] = await Promise.all([
    shownAvatars(name, s), shownPets(name, s), shownJobs(name, s), shownPatches(name, s),
    shownChimeras(name, s), shownCrystals(name, s), shownHerbs(name, s)]);
  let profile = null;
  if (card && (reach !== 'private' || mine)) {
    const { listed, reach: r, ...rest } = card;
    profile = mine ? { ...rest, reach: r } : rest;
  }
  // The bio read once, here, into nodes markdown.js builds: a page with no
  // radio has no Markdown reader of its own, and should never need one.
  const bio = profile && profile.bio ? parseBrass(profile.bio) : null;
  const out = {
    handle: name, mine, profile, bio, private: reach === 'private' && !mine,
    wearing: av ? av.wearing : null,
    avatars: av && av.shown ? av.avatars : null,
    pets: pets ? pets.pets : null,
    jobs: jobs ? jobs.jobs : null,
    patches: patches ? patches.patches : null,
    chimeras: chimeras && chimeras.shown ? chimeras.chimeras : null,
    crystals: crystals ? crystals.crystals : null,
    herbs: herbs ? herbs.herbs : null,
  };
  if (who) {
    if (mods === undefined) mods = await loadMods();
    out.base = !!(mods && mods.has(foldHandle(name)));
  }
  return out;
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
export async function wearProfileSet(pk, id, s = store(), handle = null) {
  if (!setId(id)) return { error: 'which' };
  const set = (await readProfileSets(pk, s)).find((x) => x.id === id);
  if (!set) return { error: 'which' };
  const c = cleanProfile({ ...((await readProfile(pk, s)) || {}), ...cardLook(set.look) });
  if (c.error) return { error: 'look' };
  const profile = await keepProfile(pk, c.profile, s, handle);
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
   everything said at a place more than two weeks ago. */
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

/* ── Chat status ─────────────────────────────────────────────────────────

   Ryan's ask, 2026-10-24: Discord has Online, Idle, Do Not Disturb and
   Invisible, and Be seen here is already Online and Invisible, a room at a
   time. What nothing said was whether somebody wants to be talked to: even
   seen, they may not be chatty. So a CHAT STATUS, after the interaction
   badges, the colour communication badges Autism Network International
   started at the first Autreat (Jim Sinclair, 1996), in the words and shapes
   of the Cavendish Space Project's interaction cards, which are CC0: come say
   hi, a green circle; people i know, a yellow triangle; not right now, a red
   square. It is shown beside a claimed name on Who's online and to the people
   seen in the same room, on the person's profile, and in a conversation with
   them, so it can be checked before anybody writes.

   IT IS A SIGN AND NOT A LOCK: nothing refuses a message because of it. The
   cards say why: somebody showing not right now may still come to you, and
   you can answer when they do.

   IT IS NOBODY'S UNTIL THEY CHOOSE ONE: there is no default, and somebody who
   has not chosen is shown as nothing at all, never as green. It is one blob,
   chat-status, holding each claimed person's pet key and their badge and
   nothing about when it was chosen or how often it changed; choosing none
   takes them out of it. Nothing changes it but its person: no idle worked out
   from a quiet keyboard and no time it runs out, which are the friendly edits,
   and each would publish something about somebody's attention that they never
   chose to show. Forget me and deleting the username take it out. */
export const CHAT_STATUSES = ['come-say-hi', 'people-i-know', 'not-right-now'];
const CHAT = 'chat-status';

/* A badge's id as sent, '' for none, or null for one the street does not know. */
export function cleanChatStatus(v) {
  if (v === '' || v == null) return '';
  return typeof v === 'string' && CHAT_STATUSES.includes(v) ? v : null;
}

async function updateChat(change, s) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, CHAT);
    const status = { ...((cur.exists && cur.data && cur.data.status) || {}) };
    if (change(status) === false) return status;
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(CHAT, { status }, opts);
    if (res.modified) return status;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* Choose a badge, or none. The caller has checked the username is claimed;
   this does not know who is asking. { chat } or { error: 'which' }. */
export async function setChatStatus(pk, v, s = store()) {
  const chat = cleanChatStatus(v);
  if (chat === null) return { error: 'which' };
  await updateChat((all) => {
    if (!chat) { if (!own(all, pk)) return false; delete all[pk]; return true; }
    if (all[pk] === chat) return false;
    all[pk] = chat;
    return true;
  }, s);
  return { chat };
}

async function readChat(s) {
  const d = await s.get(CHAT, { type: 'json' });
  return (d && d.status && typeof d.status === 'object') ? d.status : {};
}

/* One person's badge, or '' for none. */
export async function chatStatusOf(pk, s = store()) {
  const all = await readChat(s);
  return own(all, pk) ? (cleanChatStatus(all[pk]) || '') : '';
}

/* Who's online and the people seen in a room, with the badge each claimed
   person chose. Nothing is added beside an unclaimed name, whatever the blob
   holds, and nothing beside somebody who chose none. */
export async function withChatStatus(people, s = store()) {
  if (!people.some((p) => p.claimed)) return people;
  const all = await readChat(s);
  return people.map((p) => {
    if (!p.claimed) return p;
    const k = petKey(p.handle);
    const chat = own(all, k) ? cleanChatStatus(all[k]) : null;
    return chat ? { ...p, chat } : p;
  });
}

/* Forget me, and deleting the username. */
export async function forgetChatStatus(pk, s = store()) {
  await setChatStatus(pk, '', s);
  return true;
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
   which is never more than two weeks ago, and never its words: the one thing this shows that was not shown before,
   and privacy.html#world says so. The World channel's latest is the World
   room's, because its channel is World. A forum category's room is The
   forums' line in the directory (2026-10-21), which lists pages: whoever is
   seen in a category the asker may read, its call and its latest message are
   The forums', and a category the asker may not read adds nothing. */
export async function worldIndex(who, s = store(), now = Date.now()) {
  const rooms = new Map();
  const at = (tag) => {
    if (forumRoom(tag)) tag = FORUM_PAGE;
    let r = rooms.get(tag); if (!r) rooms.set(tag, r = { people: new Map(), call: new Set(), last: 0 }); return r;
  };
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

/* THE CHAT PAGE'S ORDERS BY ACTIVITY (Ryan's ask, 2026-10-24): every room's
   channel the asker can hear, in two orders, newest message first (recent) and
   most messages on the channel first (active), worked out from the channels
   themselves when the chat page asks, and kept nowhere. Only what a listener
   could read off the channels: a room that keeps to itself is never in it, a
   room the asker may not enter is left out, and World is no room's channel.
   The street's own bot (the Feed's and the Source's arrivals, runFeedBot) is
   nobody talking, so its messages count for neither order. Orders only, never
   a time or a count: the page puts the channels in order and says nothing
   about how busy any of them is. */
export async function channelActivity(who, s = store(), now = Date.now()) {
  const rows = [];
  for (const b of (await s.list({ prefix: ROOM_TALK })).blobs || []) {
    const tag = b.key.slice(ROOM_TALK.length);
    if (!roomTag(tag) || tag === WORLD_CALL || quietRoom(tag) || !roomAllows(who, tag)) continue;
    const said = (await readRoomTalk(tag, s, now)).messages.filter((m) => !m.feed && typeof m.t === 'number');
    if (said.length) rows.push({ tag, last: Math.max(...said.map((m) => m.t)), n: said.length });
  }
  const recent = rows.slice().sort((a, b) => b.last - a.last || a.tag.localeCompare(b.tag)).map((r) => r.tag);
  const active = rows.slice().sort((a, b) => b.n - a.n || b.last - a.last || a.tag.localeCompare(b.tag)).map((r) => r.tag);
  return { recent, active };
}

/* SEARCH, AFTER DISCORD'S (Ryan's ask, 2026-10-27). The chat page searches
   every channel the asker can hear, World and every room's, for words and
   Discord's filters: from:, mentions:, has:, in:, before:, after:, during:
   and author-type:. The rules are a listen's, because a result is only a
   message the asker could already scroll back to:
     · NEVER A ROOM THAT KEEPS TO ITSELF, whose tag is its address, even for
       somebody who may enter it; a search lists results by room.
     · NEVER A ROOM THE ASKER MAY NOT ENTER (roomAllows), and never a staff
       room's channel while it is shut (staffShut), so nothing sealed is opened
       for a search that could not be opened for a listen.
     · WORKED OUT FROM THE CHANNELS WHEN ASKED AND KEPT NOWHERE: the words go in
       a POST's body, never an address, and nothing records who searched for
       what. tools/check-search.py refuses a console call, a store write or a
       GET in it.
     · HOW MANY MATCHED, AND NOTHING ELSE COUNTED (Ryan's call, 2026-10-27, the
       same day, reversing the radio's "never counts" for this one answer, as
       Discord says it): `total`, the messages that match on the channels the
       asker can hear, beside SEARCH_PAGE of them at a time. Never how many on
       any one channel, from any one person, or anything about the rooms or
       the people. `back` is how far from the newest a result sits on its
       channel, only so a jump can ask for enough of the channel to reach it.
   `q` is what the page sends: words, and the filters already read out of
   them, each refused or trimmed here rather than trusted. Dates are times,
   worked out on the page in the reader's own day. */
export const SEARCH_PAGE = 25;      // results one answer holds
export const SEARCH_WORDS = 200;    // characters of words one search may hold
const SEARCH_TERMS = 10, SEARCH_NAMES = 10, SEARCH_IN = 60, SEARCH_PAGES = 40;
export const SEARCH_HAS = ['link', 'picture', 'sticker', 'card'];
const SEARCH_BY = ['any', 'person', 'bot'];
const searchFold = (v) => String(v == null ? '' : v).normalize('NFKC').toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
// The words as terms: a "quoted phrase" is one term, everything else a word.
export function searchTerms(words) {
  const w = searchFold(words).slice(0, SEARCH_WORDS), out = [];
  for (const m of w.matchAll(/"([^"]+)"|(\S+)/g)) {
    const t = (m[1] || m[2] || '').replace(/\s+/g, ' ').trim();
    if (t && !out.includes(t)) out.push(t);
    if (out.length >= SEARCH_TERMS) break;
  }
  return out;
}
export function cleanSearch(q) {
  if (!q || typeof q !== 'object' || Array.isArray(q)) return null;
  const list = (v, most, keep) => (Array.isArray(v) ? [...new Set(v.map(keep).filter(Boolean))].slice(0, most) : []);
  const time = (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null);
  const out = {
    terms: searchTerms(typeof q.words === 'string' ? q.words : ''),
    from: list(q.from, SEARCH_NAMES, (h) => (typeof h === 'string' && h.length <= 60 ? foldHandle(h) : null)),
    mentions: list(q.mentions, SEARCH_NAMES, (h) => (typeof h === 'string' && h.length <= 60 ? foldHandle(h) : null)),
    has: list(q.has, SEARCH_HAS.length, (h) => (SEARCH_HAS.includes(h) ? h : null)),
    in: list(q.in, SEARCH_IN, (t) => roomTag(t)),
    after: time(q.after),
    before: time(q.before),
    by: SEARCH_BY.includes(q.by) ? q.by : 'any',
    order: q.order === 'old' ? 'old' : 'new',
    page: Number.isInteger(q.page) && q.page >= 0 && q.page < SEARCH_PAGES ? q.page : 0,
  };
  const asked = out.terms.length || out.from.length || out.mentions.length || out.has.length || out.in.length || out.after || out.before || out.by !== 'any';
  return asked ? out : null;
}
// Everything a search's words are looked for in: the words, a picture's
// description, and an arrival's site and title.
function searchText(m) {
  const parts = [m.text || '', m.alt || ''];
  if (m.feed && typeof m.feed === 'object') parts.push(m.feed.site || '', m.feed.title || '');
  return searchFold(parts.join('\n'));
}
const STICKERS = ['sticker', 'avatar', 'chimera', 'patch', 'jacket'];
export function searchMatches(m, q) {
  if (!m || typeof m.t !== 'number') return false;
  if (q.after && m.t < q.after) return false;
  if (q.before && m.t >= q.before) return false;
  if (q.by === 'bot' && !m.feed) return false;
  if (q.by === 'person' && m.feed) return false;
  if (q.from.length && !q.from.includes(foldHandle(m.handle))) return false;
  if (q.mentions.length) {
    const at = (Array.isArray(m.at) ? m.at : []).map(foldHandle).concat(keptRoles(m.roles));
    if (!q.mentions.some((h) => at.includes(h))) return false;
  }
  for (const h of q.has) {
    const ok = h === 'picture' ? !!m.img
      : h === 'sticker' ? STICKERS.some((k) => m[k])
      : h === 'card' ? Array.isArray(m.links) && m.links.length > 0
      : /https?:\/\/|stimpunks\.world\//i.test(m.text || '') || (Array.isArray(m.links) && m.links.length > 0) || !!m.feed;
    if (!ok) return false;
  }
  if (q.terms.length) {
    const text = searchText(m);
    if (!q.terms.every((t) => text.includes(t))) return false;
  }
  return true;
}
export async function searchChannels(who, q, s = store(), now = Date.now()) {
  if (!q) return { results: [], more: false };
  const tags = [WORLD_CALL];
  for (const b of (await s.list({ prefix: ROOM_TALK })).blobs || []) tags.push(b.key.slice(ROOM_TALK.length));
  const found = [];
  for (const tag of [...new Set(tags)]) {
    const world = tag === WORLD_CALL;
    if (!world && (!roomTag(tag) || quietRoom(tag) || !roomAllows(who, tag) || staffShut(tag))) continue;
    if (q.in.length && !q.in.includes(tag)) continue;
    const said = (world ? await readChannel(s, now) : await readRoomTalk(tag, s, now)).messages;
    said.forEach((m, i) => { if (searchMatches(m, q)) found.push({ tag, m, back: said.length - 1 - i }); });
  }
  found.sort((a, b) => (q.order === 'old' ? a.m.t - b.m.t : b.m.t - a.m.t) || a.tag.localeCompare(b.tag));
  const from = q.page * SEARCH_PAGE, page = found.slice(from, from + SEARCH_PAGE);
  return {
    results: page.map((r) => ({ room: r.tag, back: r.back, message: shape([r.m])[0] })),
    total: found.length,
    more: found.length > from + SEARCH_PAGE && q.page + 1 < SEARCH_PAGES,
  };
}

/* MY OWN ORDER FOR THE CHAT PAGE'S CHANNELS (Ryan's call, 2026-10-24: kept on
   the server, under the claimed username, so it follows somebody from one
   device to another; privacy.html#chat-order was written first). One blob per
   person, chat-order/<pet key>, holding which channels, in which order, under
   which group, and NOTHING ABOUT WHEN. A group is a tag group's key (tag-<the
   tag>) or More rooms (more), the chat page's own keys; a channel is a room's
   tag, and never one that keeps to itself, whose tag is its address. Claimed
   usernames only (forumReader), because an unclaimed handle is anybody's who
   signs on with it. Shown to nobody else, a moderator included, and nothing
   records who arranged what. Forget me and deleting the username delete it. */
export const CHAT_ORDER_GROUPS = 80;   // groups one order holds
export const CHAT_ORDER_EACH = 400;    // channels in one group
const chatOrderBlob = (k) => `chat-order/${k}`;
const CHAT_GROUP = /^(?:tag-[a-z0-9]+(?:-[a-z0-9]+)*|more)$/;
export function cleanChatOrder(v) {
  const out = {};
  if (!v || typeof v !== 'object' || Array.isArray(v)) return out;
  for (const [g, list] of Object.entries(v)) {
    if (Object.keys(out).length >= CHAT_ORDER_GROUPS) break;
    if (g.length > 60 || !CHAT_GROUP.test(g) || !Array.isArray(list)) continue;
    const seen = new Set(), tags = [];
    for (const t of list) {
      const tag = roomTag(t);
      if (!tag || quietRoom(tag) || seen.has(tag)) continue;
      seen.add(tag);
      tags.push(tag);
      if (tags.length >= CHAT_ORDER_EACH) break;
    }
    if (tags.length) out[g] = tags;
  }
  return out;
}
export async function readChatOrder(who, s = store()) {
  if (!forumReader(who)) return null;
  const d = await s.get(chatOrderBlob(petKey(who.handle)), { type: 'json' });
  return cleanChatOrder(d && d.groups);
}
// The whole order, each time: arranging one group sends every group.
export async function keepChatOrder(who, groups, s = store()) {
  if (!forumReader(who)) return { error: 'claimed' };
  const clean = cleanChatOrder(groups);
  const empty = !Object.keys(clean).length;
  await updateDoc(chatOrderBlob(petKey(who.handle)), () => (empty ? false : { groups: clean }), s);
  return { groups: clean };
}
/* Forget me, and deleting the username. */
export async function forgetChatOrder(pk, s = store()) {
  await s.delete(chatOrderBlob(pk));
  return true;
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

   EVERY MESSAGE GOES TWO WEEKS AFTER IT WAS SENT, the channel's onAir(),
   checked on every read, so one sent before LONG_FROM keeps its 48 hours, and
   as many in a conversation as the rule for direct messages keeps. A conversation with nothing left in it is
   no conversation: who talked to whom is not kept a minute past the last
   message between them, so the next message after a quiet two weeks asks
   again. The hourly sweep deletes what is left.

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
export const DM_KEEP = KEEP;                   // messages in one conversation at once, unless the desk says otherwise
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

/* SEALED AT REST (Ryan's call, 2026-10-25): every conversation, every picture
   sent in one, each person's switch and blocks, and the reports copied from
   them with their pictures, sealed with CB_DM_KEY, a key of their own and
   never the office's (32 bytes as base64url, in Netlify and nowhere else).
   AES-256-GCM, a fresh nonce each time, and the blob's own name as associated
   data, so a sealed blob cannot be read, altered or moved under another name
   without the key. NOT END-TO-END: the server opens them to show the two people
   in a conversation (and a report to the desk), and privacy.html#messages says
   so in those words. WITHOUT THE KEY DIRECT MESSAGES ARE SHUT (dmReady), never
   written in the clear. A blob written before the key was read as it is and
   sealed the next time it is written; the hourly sweep seals what is left.
   Losing the key loses every conversation, so Ryan keeps a copy of it. */
function dmCipherKey() {
  const v = process.env.CB_DM_KEY;
  if (!v) return null;
  try { const k = Buffer.from(v.trim(), 'base64url'); return k.length === 32 ? k : null; } catch (e) { return null; }
}
export function dmReady() { return !!dmCipherKey(); }
function sealDm(name, obj) { return sealJsonWith(dmCipherKey(), 'dm', name, obj); }
const isSealedDm = (d) => !!d && d.sealed === 1 && d.k === 'dm';
function openDm(name, d) { return openJsonWith(dmCipherKey(), 'dm', name, d); }
async function getDm(name, s) { return openDm(name, await s.get(name, { type: 'json' })); }
/* A picture's bytes: SDM1, the nonce, the tag, then the sealed bytes. */
const bytesSealed = (v) => bytesSealedAs('SDM1', v);
function sealDmBytes(name, bytes) { return sealBytesWith(dmCipherKey(), 'SDM1', name, bytes); }
function openDmBytes(name, bytes) { return openBytesWith(dmCipherKey(), 'SDM1', name, bytes); }

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

/* A conversation as it stands now: no message past its time, and one with
   nothing left in it is nobody's. */
function convDoc(d, now = Date.now(), rule = ruleFrom({}, RULE_DM)) {
  d = plain(d);
  const messages = stored(d).filter((m) => onAir(m, now, rule.life)).slice(-rule.keep);
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
async function updateDm(key, norm, change, s, sealed = false) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, key);
    const was = norm(cur.exists ? (sealed ? openDm(key, cur.data) : cur.data) : null);
    const next = change(was);
    if (next === null) return was;
    if (next.error) return next;
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, sealed ? sealDm(key, next) : next, opts);
    if (res.modified) return next;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

export async function readDmSet(me, s = store()) { return dmSetDoc(await getDm(DM_SET + me, s)); }
const updateDmSet = (me, change, s) => updateDm(DM_SET + me, dmSetDoc, change, s, true);
const blocks = (set, handle) => set.blocked.some((b) => b.k === petKey(handle));

/* Every write to a conversation goes through here, and a picture its write
   let go of (taken back, pushed off, emptied) is deleted as soon as the write
   has landed. One past its two weeks is held by nothing and goes in the sweep. */
async function updateConv(key, change, s, now) {
  let before = null, after = null;
  const rule = await ruleOf(RULE_DM, s);
  const out = await updateDm(key, (d) => convDoc(d, now, rule), (was) => {
    const next = change(was);
    if (!next || next.error) return next;
    before = was;
    after = { people: next.people, from: next.from, open: next.open === true, messages: stampNew(was.messages, next.messages, rule).slice(-rule.keep) };
    return after;
  }, s, true);
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
  if (replyTo(m.re)) out.re = m.re;
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
   'picture' (no such picture of yours for this conversation), 'reply' (the
   message it answers, `re`, is not in this conversation now). */
export async function sendDm(who, handle, said, s = store(), now = Date.now()) {
  if (!forumReader(who)) return { error: 'claim' };
  const pic = said && typeof said === 'object' ? said : null;
  const words = cleanLines(pic ? pic.text : said, MESSAGE_MAX);
  if (words === null) return { error: 'long' };
  const re = pic && pic.re != null ? replyTo(pic.re) : null;
  if (pic && pic.re != null && !re) return { error: 'reply' };
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
  const was = convDoc(await getDm(p.key, s), now, await ruleOf(RULE_DM, s));
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
  if (re) m.re = re;
  if (img) { m.img = img; m.alt = cleanAlt(pic.alt); }
  if (stick) Object.assign(m, stick);
  let asked = false, accepted = false;
  const next = await updateConv(p.key, (c) => {
    asked = false; accepted = false;
    // A reply answers a message in this conversation, there now.
    if (re && !c.messages.some((x) => x.id === re)) return { error: 'reply' };
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
  if (!convDoc(await getDm(p.key, s), now, await ruleOf(RULE_DM, s)).open) return { error: 'accepted' };
  const k = pictureCheck(bytes);
  if (k.error) return { error: 'bad', why: k.error };
  const id = randomUUID();
  await s.set(DM_IMG + id, sealDmBytes(DM_IMG + id, bytes), { metadata: { by: p.me, pair: p.key, t: now, type: k.kind } });
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
  const c = convDoc(await getDm(meta.pair, s), now, await ruleOf(RULE_DM, s));
  if (!c.messages.some((m) => m.img === id)) return null;
  return { data: openDmBytes(DM_IMG + id, got.data), type: meta.type };
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
  const c = convDoc(await getDm(p.key, s), now, await ruleOf(RULE_DM, s));
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
    const c = convDoc(await getDm(pairBlob(me, them), s), now, await ruleOf(RULE_DM, s));
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
   `edited` set, the old words kept nowhere, and still gone two weeks after it
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
    let c = null;
    try { c = await getDm(pairBlob(me, them), s); } catch (e) { c = null; }
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

/* MESSAGES A DAY, FOR THE OFFICE'S DASHBOARD (Ryan, 2026-10-21: messages per
   day, no names). Every message sent on a channel adds one to its day, by the
   street's clock, in one of three numbers: World, the rooms, and the rooms
   only some can hear (lockedRoom: MOD_ROOMS, and a forum category with roles,
   since 2026-10-21). No name, no room, no words and no time
   is kept, so a room that keeps to itself is counted with the others of its
   kind and never named. Direct messages and the Slake are not counted. A day
   older than DAY_COUNTS_DAYS goes on the next write. Only the office's
   dashboard reads it. */
const DAY_COUNTS = 'channel-days';
export const DAY_COUNTS_DAYS = 400;
export const DAY_KINDS = ['world', 'rooms', 'mods'];
const isDay = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);
export async function countMessage(tag, s = store(), now = Date.now()) {
  // A forum category with roles counts with the base's rooms: only some may hear it.
  const kind = !tag || tag === WORLD_CALL ? 'world' : (lockedRoom(tag) ? 'mods' : 'rooms');
  const day = today(new Date(now)), oldest = dayBefore(day, DAY_COUNTS_DAYS - 1);
  await updateMap(DAY_COUNTS, 'days', (map) => {
    for (const d of Object.keys(map)) if (!isDay(d) || d < oldest) delete map[d];
    const c = plain(map[day]);
    map[day] = Object.fromEntries(DAY_KINDS.map((k) => [k, (Number.isInteger(c[k]) ? c[k] : 0) + (k === kind ? 1 : 0)]));
  }, s);
  return kind;
}
export async function readDayCounts(s = store()) {
  return plain((await s.get(DAY_COUNTS, { type: 'json' }) || {}).days);
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
    const c = convDoc(await getDm(pairBlob(me, them), s), now, await ruleOf(RULE_DM, s));
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
  const c = convDoc(await getDm(p.key, s), now, await ruleOf(RULE_DM, s));
  const m = c.messages.find((x) => x.id === id);
  if (!m || m.by === p.me) return { error: 'which' };
  const rec = { id: 'k' + randomBytes(8).toString('base64url').slice(0, 10), t: now, by: who.handle, of: m.handle,
    text: m.text, sent: m.t, msg: m.id, note: n };
  // A picture is copied onto the desk first, so no report on it is ever
  // without it; a copy whose report did not go on is deleted at once.
  if (m.img) {
    const got = await s.getWithMetadata(DM_IMG + m.img, { type: 'arrayBuffer' });
    if (got && got.metadata) {
      await s.set(REPORT_IMG + rec.id, sealDmBytes(REPORT_IMG + rec.id, openDmBytes(DM_IMG + m.img, got.data)), { metadata: { t: now, type: got.metadata.type } });
      rec.img = true;
      rec.alt = m.alt || '';
    }
  }
  const next = await updateDm(REPORTS, (d) => reportsDoc(d, now), (was) => {
    if (was.reports.some((r) => r.msg === m.id && foldHandle(r.by) === foldHandle(who.handle))) return { error: 'again' };
    if (was.reports.length >= REPORT_KEEP) return { error: 'full' };
    return { reports: [...was.reports, rec] };
  }, s, true);
  if (next.error && rec.img) await s.delete(REPORT_IMG + rec.id);
  return next.error ? next : { reported: rec.id };
}

/* A reported picture, for the base and nobody else, while its report is on
   the desk. */
export async function reportImage(who, id, s = store(), now = Date.now()) {
  if (!who || who.role !== 'base') return null;
  if (typeof id !== 'string' || !REPORT_ID.test(id)) return null;
  if (!reportsDoc(await getDm(REPORTS, s), now).reports.some((r) => r.id === id && r.img)) return null;
  const got = await s.getWithMetadata(REPORT_IMG + id, { type: 'arrayBuffer' });
  return got && got.metadata ? { data: openDmBytes(REPORT_IMG + id, got.data), type: got.metadata.type } : null;
}

/* The desk's list, newest first, for the base and nobody else. */
export async function readReports(who, s = store(), now = Date.now()) {
  if (!who || who.role !== 'base') return null;
  const d = reportsDoc(await getDm(REPORTS, s), now);
  return d.reports.slice().reverse().map((r) => ({ id: r.id, t: r.t, by: r.by, of: r.of, text: r.text, sent: r.sent, note: r.note || '',
    ...(r.img ? { img: true, alt: r.alt || '' } : {}) }));
}

/* A moderator closes a report: it is deleted. */
export async function closeReport(who, id, s = store(), now = Date.now()) {
  if (!who || who.role !== 'base') return { error: 'base' };
  if (typeof id !== 'string' || !REPORT_ID.test(id)) return { error: 'which' };
  const out = await updateDm(REPORTS, (d) => reportsDoc(d, now), (was) => (was.reports.some((r) => r.id === id)
    ? { reports: was.reports.filter((r) => r.id !== id) } : { error: 'which' }), s, true);
  if (!out.error) await s.delete(REPORT_IMG + id);
  return out;
}

/* ── A member's call for a moderator, a note on the desk ──

   Ryan's call, 2026-10-23, the day role mentions came: when somebody who is not
   a moderator calls @moderator, on a channel or in a forum post, a note goes on
   the desk in the Moderators' room, so a call made while no moderator was
   listening is still there to be answered. A note is who called, when, where
   (a channel's room, or the forum topic and post) and the words they called
   with, as they were then; only a call the server kept (roleMentions), and an
   edit only when it newly calls. NEVER FROM A ROOM THAT KEEPS TO ITSELF, which
   tells nobody, and never from a room or a category only some people may go
   into, which a member cannot be in anyway. Base only, like the reports: a
   moderator closes one, which deletes it, and one nobody closes goes after
   MOD_CALL_DAYS. It stays if the caller takes the message off or deletes their
   username, as a report does, because it was said to the moderators. Nothing
   records who closed it. MOD_CALL_KEEP at most: past that, the oldest goes. The
   friendly edits are a note for a moderator's own call (they can talk among
   themselves), a note of who answered a call, and keeping a call past its
   thirty days "in case it matters later", which is a record of who needed
   help, kept against them. */
export const MOD_CALL_KEEP = 200;
export const MOD_CALL_DAYS = 30;
export const MOD_CALL_TEXT = 2000;
export const MOD_CALL_ID = /^c[A-Za-z0-9_-]{10}$/;
const MOD_CALLS = 'mod-calls';
const MOD_CALL_LIFE = MOD_CALL_DAYS * 24 * 60 * 60 * 1000;
function modCallsDoc(d, now = Date.now()) {
  const list = Array.isArray(plain(d).calls) ? plain(d).calls : [];
  return { calls: list.filter((c) => c && typeof c.t === 'number' && now - c.t < MOD_CALL_LIFE) };
}

/* A message (with `where` { room }, null for World) or a post (with `where`
   { topic }) that may call the moderators: a note on the desk if it is a
   member's call, and newly so after an edit (`before`, the words it replaced). */
export async function noteModCall(who, item, where, before = '', s = store(), now = Date.now()) {
  if (!who || who.role === 'base' || !item || !where) return null;
  if (!keptRoles(item.roles).includes('moderator') || (before && atName(before, 'moderator'))) return null;
  let at;
  if (where.topic) {
    const cat = forumCat(where.topic.cat, now);
    if (!cat || (cat.see && cat.see.length)) return null;
    at = { topic: where.topic.id, post: item.id, cat: cat.name, title: [...String(where.topic.title || '')].slice(0, FORUM_TITLE_MAX).join('') };
  } else {
    const room = where.room || null;
    if (room && (quietRoom(room) || lockedRoom(room))) return null;
    at = { room: room || '' };
  }
  const words = String(item.text != null ? item.text : item.body || '');
  const rec = { id: 'c' + randomBytes(8).toString('base64url').slice(0, 10), t: now, by: who.handle, msg: item.id,
    text: [...words].length > MOD_CALL_TEXT ? [...words].slice(0, MOD_CALL_TEXT - 1).join('') + '…' : words, ...at };
  const next = await updateDm(MOD_CALLS, (d) => modCallsDoc(d, now), (was) => {
    if (was.calls.some((c) => c.msg === item.id)) return null;
    return { calls: [...was.calls, rec].slice(-MOD_CALL_KEEP) };
  }, s);
  return next.calls && next.calls.some((c) => c.id === rec.id) ? rec.id : null;
}

/* Where a note's call was made, for the desk to link: a room's channel, World,
   or a forum post. */
function modCallPlace(c) {
  if (c.topic) return { name: `the forums: ${c.cat}, “${c.title}”`, path: `/forum.html#/t/${c.topic}/${c.post}` };
  if (!c.room) return { name: 'World', path: '/world.html' };
  const f = forumPlace(c.room);
  return f || { name: `#${c.room}`, path: `/${c.room}.html` };
}

/* The desk's notes, newest first, for the base and nobody else. */
export async function readModCalls(who, s = store(), now = Date.now()) {
  if (!who || who.role !== 'base') return null;
  return modCallsDoc(await s.get(MOD_CALLS, { type: 'json' }), now).calls.slice().reverse()
    .map((c) => ({ id: c.id, t: c.t, by: c.by, text: c.text, place: modCallPlace(c) }));
}

/* A moderator closes a note: it is deleted, and nothing says who closed it. */
export async function closeModCall(who, id, s = store(), now = Date.now()) {
  if (!who || who.role !== 'base') return { error: 'base' };
  if (typeof id !== 'string' || !MOD_CALL_ID.test(id)) return { error: 'which' };
  return updateDm(MOD_CALLS, (d) => modCallsDoc(d, now), (was) => (was.calls.some((c) => c.id === id)
    ? { calls: was.calls.filter((c) => c.id !== id) } : { error: 'which' }), s);
}

/* Hourly: every conversation with nothing left in it, every marker with no
   conversation behind it, every report past its thirty days, and every note
   of a call for a moderator past its own. */
export async function sweepDms(s = store(), now = Date.now()) {
  let any = false;
  const live = new Set();
  const rule = await ruleOf(RULE_DM, s);
  for (const b of (await s.list({ prefix: DM })).blobs || []) {
    const raw = await s.get(b.key, { type: 'json' });
    if (convDoc(openDm(b.key, raw), now, rule).messages.length) {
      live.add(b.key);
      // Written before the key: sealed now.
      if (!isSealedDm(raw)) { await updateDm(b.key, (d) => convDoc(d, now, rule), (was) => was, s, true); any = true; }
      continue;
    }
    await s.delete(b.key);
    any = true;
  }
  for (const b of (await s.list({ prefix: DM_SET })).blobs || []) {
    if (isSealedDm(await s.get(b.key, { type: 'json' }))) continue;
    await updateDm(b.key, dmSetDoc, (was) => was, s, true);
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
  const reps = openDm(REPORTS, raw);
  if (raw && (!isSealedDm(raw) || reportsDoc(reps, now).reports.length !== (plain(reps).reports || []).length)) {
    await updateDm(REPORTS, (d) => reportsDoc(d, now), (was) => was, s, true);
    any = true;
  }
  const calls = await s.get(MOD_CALLS, { type: 'json' });
  if (calls && modCallsDoc(calls, now).calls.length !== (plain(calls).calls || []).length) {
    await updateDm(MOD_CALLS, (d) => modCallsDoc(d, now), (was) => was, s);
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
      if (!held.has(meta.pair)) held.set(meta.pair, new Set(convDoc(await getDm(meta.pair, s), now, await ruleOf(RULE_DM, s)).messages.map((m) => m.img).filter(Boolean)));
      if (held.get(meta.pair).has(id)) {
        if (!bytesSealed(got.data)) { await s.set(b.key, sealDmBytes(b.key, got.data), { metadata: meta }); any = true; }
        continue;
      }
    }
    await s.delete(b.key);
    any = true;
  }
  const onDesk = new Set(reportsDoc(await getDm(REPORTS, s), now).reports.filter((r) => r.img).map((r) => r.id));
  for (const b of (await s.list({ prefix: REPORT_IMG })).blobs || []) {
    const got = await s.getWithMetadata(b.key, { type: 'arrayBuffer' });
    if (onDesk.has(b.key.slice(REPORT_IMG.length))) {
      if (got && !bytesSealed(got.data)) { await s.set(b.key, sealDmBytes(b.key, got.data), { metadata: got.metadata || {} }); any = true; }
      continue;
    }
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
   by a newer one, taken off, or swept at its two weeks, and one that was
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
   radio can tune to, and what is said on it goes after two weeks like every
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
  /* THE OFFICE'S AND TASKS' CHANNELS ARE THEIR READERS'. Ryan's ask,
     2026-10-26: The Office and Tasks under Staff on the chat page. Their
     rooms take TASK_SEE's roles (officeAllow is tasksAllow), so the people who
     can open the pages are the only people who hear their channels, and the
     administrator key opens both. tools/make-tasks.py holds these two lines
     to TASK_SEE and the pages to data-cb="mods", as make-town-hall.py holds
     the Town Hall's. */
  'office': ['director', 'board'],
  'tasks': ['director', 'board'],
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

/* EVERY FORUM CATEGORY IS A ROOM OF ITS OWN, AND ITS READERS ARE ITS ONLY LIST.
   Ryan's ask and calls, 2026-10-21: the radio's This room follows the category
   being read in the forums, so a category's page and a topic in it tune to
   that category's channel, and a category is a room in every way, its channel,
   Be seen here, its call, Follow this room, Unreads, notifications and hosting
   a film, all under one tag: FORUM_ROOM and its slug (forum-coping). The
   forums' home, Latest, Mentions and Search stay The forums' own (forum).

   WHO HEARS ONE IS WHO READS THE CATEGORY, by forumAllows(): a claimed username,
   and the category's own roles out of data/forum.json, which make-forum.py
   writes into this file. So there is no second list to disagree with the
   first, and every function that asks roomAllows() locks a private category's
   channel, call, hosts and people exactly as the forums lock its topics.

   A SUBCATEGORY IS ITS PARENT'S IN EVERYTHING BUT ITS NAME, so it has no
   channel of its own: all of Team Docs is one room. Its tag, and a tag naming
   no category at all, is a room nobody may enter, rather than a channel
   anybody could open beside the real one. tools/make-forum.py refuses a page
   whose filename would be a category's tag, and a MOD_ROOMS or QUIET_ROOMS
   name shaped like one. */
export const FORUM_PAGE = 'forum';
export const FORUM_ROOM = FORUM_PAGE + '-';
export function forumRoom(tag, now = Date.now()) {
  if (typeof tag !== 'string' || !tag.startsWith(FORUM_ROOM)) return null;
  const cat = forumCat(tag.slice(FORUM_ROOM.length), now);
  return cat && !cat.parent ? cat : null;
}
// What a category's room is called on the radio, and where it is.
export function forumRoomName(cat) { return `The forums: ${cat.name}`; }
export function forumPlace(tag) {
  const cat = forumRoom(tag);
  return cat ? { name: forumRoomName(cat), path: `/forum.html#/c/${cat.slug}` } : null;
}
/* Every category's room a pass may enter, for the radio to name them by: they
   are not in cb-rooms.json, which is public, and a category somebody cannot
   read is never named to them. In the forums' order. */
/* `locked` says the category has roles, so the chat page can list its room
   under Staff; it is only ever told to somebody who may read it already. */
export function forumRooms(who, now = Date.now()) {
  return forumCategories(now).filter((c) => !c.parent && forumAllows(who, c))
    .map((c) => ({ tag: FORUM_ROOM + c.slug, name: forumRoomName(c), path: `/forum.html#/c/${c.slug}`, about: c.about,
      ...(c.see && c.see.length ? { locked: true } : {}) }));
}
// The room a category's topics are read in: its own, or its top category's.
export function forumRoomOf(slug, now = Date.now()) {
  let cat = forumCat(slug, now);
  while (cat && cat.parent) cat = forumCat(cat.parent, now);
  return cat ? FORUM_ROOM + cat.slug : null;
}
/* A room only some people may enter: one of the base's, or a category with
   roles, as { roles, strict }. For counting and for copying out of a room. */
export function lockedRoom(tag) {
  if (modRoom(tag)) return { roles: MOD_ROOMS[tag], strict: STRICT_ROOMS.includes(tag) };
  const cat = forumRoom(tag);
  return cat && cat.see && cat.see.length ? { roles: cat.see, strict: !!cat.strict } : null;
}
export function roomAllows(who, tag) {
  if (typeof tag === 'string' && tag.startsWith(FORUM_ROOM)) {
    const cat = forumRoom(tag);
    return !!cat && forumAllows(who, cat);
  }
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
   more than two weeks ago, and the room's blob once nothing is left in it. */
export async function sweepRoomTalk(s = store(), now = Date.now()) {
  let any = false;
  for (const b of (await s.list({ prefix: ROOM_TALK })).blobs || []) any = (await sweepLog(b.key, s, now)) || any;
  return any;
}

/* ── The feed bot: what arrives, said on The Feed's and The Source's channels ──

   Ryan's ask, 2026-10-23: the CB channels for The Feed and The Source hear
   each item as it comes in, the way a feed bot does on Discord. Every quarter
   of an hour (cb-feed-bot.mjs) this reads every wire on The Feed's boards and
   every spring on The Source's terraces, from the server, where no browser's
   CORS rule applies, and says each new item on that room's channel as a
   message from the room itself, which every radio marks BOT.

   WHAT IT READS is written into this file by the rooms' own generators,
   make-arrivals.py and make-the-source.py, out of the same data files their
   boards are drawn from, between the feed-bot markers below. Never hand-edit
   them: a wire added to a board is a wire on its channel at the next build.

   A MESSAGE FROM IT IS AN ITEM'S NAME, ITS SITE, WHERE IT GOES AND WHEN, and for
   a commit its short id and who made it: a board's row, and never the words of
   the thing itself, which is The Feed's rule about the contents of the train.
   It is on its channel for two weeks like every message, it can be reacted to
   and replied to, the base can take it off, and nobody can edit it.

   IT NEVER PUSHES A PERSON'S MESSAGE OFF. A channel keeps KEEP messages and the
   bot keeps at most FEED_KEEP of its own on one; when a channel is full, its
   own oldest go first (keepBot). People talking about what arrived are the
   point of the room, and a busy morning of commits must not take that away.

   WHAT IS NEW is an item whose id the wire did not carry the last time it was
   read, from the last two weeks, and not a morning timer's commit (SOURCE_SKIP,
   the same pattern The Source's terraces leave off). THE FIRST TIME IT READS A
   WIRE IT SAYS NOTHING and remembers what is there, so a new wire never floods
   its room with its history; a wire whose every id has changed at once with
   nothing newer than before is a feed rewritten, not a burst, and is
   remembered again in silence; and at most FEED_RUN items from one wire are
   said in one reading, the newest, because the rest are on the board.

   ONE READING AT A TIME, AND NOTHING SAID TWICE. What it read is written with
   the boards' conditional write BEFORE anything is said, so a second reading
   that started alongside finds the version gone and says nothing. A wire that
   does not answer this time is left as it was and read again next time.

   WHO IS TOLD (notifyWire, in Notifications): a device that follows that room
   by its name, and never one that follows it only by following every room,
   which is for people's talk; a phone that pressed Follow every room did not
   ask for every commit to the street. Nothing it says is counted in the
   office's messages a day (countMessage), which are people's. */
export const FEED_BOT = 'feed-bot';
export const FEED_KEEP = 30;      // the bot's own messages on one channel at once, at most
export const FEED_RUN = 8;        // items from one wire said in one reading, at most
export const FEED_SEEN = 80;      // ids remembered for one wire
// This street's own feed.xml carries every changelog entry there has ever been,
// past 800 KB on the day this was written and growing, so the ceiling is far
// above it: a feed over it is skipped, every time, with nothing said.
const FEED_BYTES = 16 * 1024 * 1024;
const FEED_UA = 'Stimpunks.World feed bot (+https://stimpunks.world/the-source.html)';
/* Each room's bot, by its tag. Its name is nobody's username (botWord). */
export const FEED_NAMES = { 'the-feed': 'The Feed', 'the-source': 'The Source' };

/* feed-bot:the-feed:begin -- written by tools/make-arrivals.py from data/arrivals.json. Do not hand-edit. */
const FEED_WIRES = [
  {"id": "stimpunks", "site": "Stimpunks Foundation", "host": "stimpunks.org", "feed": "https://stimpunks.org/feed/"},
  {"id": "starstuff", "site": "Star Stuff", "host": "starstuff.earth", "feed": "https://starstuff.earth/feed.xml"},
  {"id": "queering", "site": "Queering.Earth", "host": "queering.earth", "feed": "https://queering.earth/feed.xml"},
  {"id": "cavendish", "site": "Cavendish Space", "host": "cavendish.space", "feed": "https://cavendish.space/feed.xml"},
  {"id": "pebbling", "site": "Penguin Pebbling", "host": "penguinpebbling.app", "feed": "https://penguinpebbling.app/feed.xml"},
  {"id": "whysheet", "site": "The Why Sheet Press", "host": "whysheet.press", "feed": "https://whysheet.press/feed.xml"},
  {"id": "love", "site": "Stimpunks.World", "host": "stimpunks.world", "feed": "https://stimpunks.world/feed.xml"},
  {"id": "brass", "site": "The Brass Tacks Board", "host": "stimpunks.world", "feed": "https://stimpunks.world/brass-tacks.xml"},
  {"id": "monotropic", "site": "Map of Monotropic Experiences", "host": "monotropicmap.org", "feed": "https://monotropicmap.org/feed.xml"},
];
/* feed-bot:the-feed:end */
/* feed-bot:the-source:begin -- written by tools/make-the-source.py from data/the-source.json. Do not hand-edit. */
const SOURCE_SPRINGS = [
  {"id": "starstuff", "site": "Star Stuff", "repo": "Stimpunks/Star-Stuff", "feed": "https://github.com/Stimpunks/Star-Stuff/commits/main.atom"},
  {"id": "queering", "site": "Queering.Earth", "repo": "Stimpunks/Queering-Earth", "feed": "https://github.com/Stimpunks/Queering-Earth/commits/main.atom"},
  {"id": "cavendish", "site": "Cavendish Space", "repo": "Stimpunks/Cavendish-Cards", "feed": "https://github.com/Stimpunks/Cavendish-Cards/commits/main.atom"},
  {"id": "pebbling", "site": "Penguin Pebbling", "repo": "Stimpunks/Penguin-Pebbling", "feed": "https://github.com/Stimpunks/Penguin-Pebbling/commits/main.atom"},
  {"id": "monotropic", "site": "Map of Monotropic Experiences", "repo": "Stimpunks/Monotropic-Map", "feed": "https://github.com/Stimpunks/Monotropic-Map/commits/main.atom"},
  {"id": "whysheet", "site": "The Why Sheet Press", "repo": "Stimpunks/Why-Sheets", "feed": "https://github.com/Stimpunks/Why-Sheets/commits.atom"},
  {"id": "love", "site": "Stimpunks.World", "repo": "Stimpunks/Stimpunks-Love", "feed": "https://github.com/Stimpunks/Stimpunks-Love/commits/main.atom"},
  {"id": "garden", "site": "Knowledge Garden Starter", "repo": "Stimpunks/knowledge-garden-starter", "feed": "https://github.com/Stimpunks/knowledge-garden-starter/commits/main.atom"},
];
const SOURCE_SKIP = new RegExp("^daily [a-z ]+$");
/* feed-bot:the-source:end */

export function feedRooms() {
  return {
    'the-feed': FEED_WIRES.map((w) => ({ ...w, kind: 'rss' })),
    'the-source': SOURCE_SPRINGS.map((w) => ({ ...w, kind: 'atom' })),
  };
}
export function sourceSkips(title) { return SOURCE_SKIP.test(String(title || '')); }
export function botWord(h) {
  const f = foldHandle(h);
  return !!f && [...Object.values(FEED_NAMES), FORUM_BOT_NAME].some((n) => foldHandle(n) === f);
}

/* Reading a feed: RSS 2.0 for The Feed's wires and GitHub's Atom for The
   Source's springs, the two shapes the pullers read, and nothing else. A
   field's words come out of CDATA as they are, or with the XML's own
   entities undone once. */
const XML_ENT = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" };
function unxml(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
    }
    const k = e.toLowerCase();
    return Object.prototype.hasOwnProperty.call(XML_ENT, k) ? XML_ENT[k] : m;
  });
}
function xmlInner(block, tag) {
  const m = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i').exec(block);
  if (!m) return '';
  const c = /^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/.exec(m[1]);
  return c ? c[1] : unxml(m[1]);
}
const oneLine = (s, most) => [...String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()].slice(0, most).join('');
function sameHost(url, host) {
  try {
    const u = new URL(url);
    const h = u.hostname.toLowerCase().replace(/^www\./, ''), want = String(host).toLowerCase().replace(/^www\./, '');
    return u.protocol === 'https:' && (h === want || h.endsWith('.' + want));
  } catch (e) { return false; }
}
// The names a commit's message gives in Co-Authored-By lines, never an address.
function coAuthors(content, first) {
  const text = unxml(String(content || '').replace(/<[^>]*>/g, ''));
  const out = [];
  for (const m of text.matchAll(/^\s*Co-Authored-By:\s*(.+?)\s*(?:<[^>]*>)?\s*$/gim)) {
    const name = oneLine(m[1], 60);
    if (name && name.toLowerCase() !== String(first || '').toLowerCase() && !out.includes(name)) out.push(name);
  }
  return out.slice(0, 5);
}
export function readWireXml(xml, w) {
  const out = [];
  if (w.kind === 'atom') {
    const commit = new RegExp(`^https://github\\.com/${w.repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/commit/([0-9a-f]{40})$`);
    for (const [, block] of String(xml).matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)) {
      const id = oneLine(xmlInner(block, 'id'), 200), title = oneLine(xmlInner(block, 'title'), 300);
      const href = (/<link\b(?=[^>]*\brel="alternate")[^>]*\bhref="([^"]+)"/i.exec(block) || [])[1] || '';
      const url = unxml(href), when = Date.parse(xmlInner(block, 'updated'));
      const m = commit.exec(url);
      if (!id || !title || !m || !Number.isFinite(when)) continue;
      // GitHub names an author only when the address a commit was made with is
      // an account's; otherwise it sends the ADDRESS, which is never read here.
      const author = oneLine(xmlInner(/<author\b[^>]*>([\s\S]*?)<\/author>/i.exec(block)?.[1] || '', 'name'), 60);
      const by = (author ? [author] : []).concat(coAuthors(xmlInner(block, 'content'), author));
      out.push({ id, title, url, when, sha: m[1].slice(0, 7), by, anon: !author });
    }
  } else {
    for (const [, block] of String(xml).matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
      const title = oneLine(xmlInner(block, 'title'), 300), url = oneLine(xmlInner(block, 'link'), 500);
      const id = oneLine(xmlInner(block, 'guid'), 500) || url, when = Date.parse(xmlInner(block, 'pubDate'));
      if (!id || !title || !sameHost(url, w.host) || !Number.isFinite(when)) continue;
      out.push({ id, title, url, when });
    }
  }
  // Newest first whatever order the feed keeps, so what is remembered of a
  // long feed is its newest FEED_SEEN, and never its oldest.
  return out.sort((a, b) => b.when - a.when);
}

async function readWire(w, prior, get) {
  const headers = { 'user-agent': FEED_UA,
    accept: w.kind === 'atom' ? 'application/atom+xml' : 'application/rss+xml, application/xml, text/xml' };
  if (prior && prior.etag) headers['if-none-match'] = prior.etag;
  if (prior && prior.modified) headers['if-modified-since'] = prior.modified;
  try {
    const r = await get(w.feed, { headers, redirect: 'follow', signal: AbortSignal.timeout(8000) });
    if (r.status === 304 && prior) return { same: true };
    if (r.status !== 200) return null;
    const text = await r.text();
    if (text.length > FEED_BYTES) return null;
    return { items: readWireXml(text, w), etag: r.headers.get('etag') || null, modified: r.headers.get('last-modified') || null };
  } catch (e) { return null; }
}

/* A channel with the bot's own messages trimmed: at most FEED_KEEP of them,
   and when the channel is over its keep, the bot's oldest go before anybody's. */
export function keepBot(list, keep = KEEP) {
  const out = list.slice();
  const bots = () => out.reduce((n, m) => n + (m.feed ? 1 : 0), 0);
  while (bots() > FEED_KEEP) out.splice(out.findIndex((m) => m.feed), 1);
  while (out.length > keep && out.some((m) => m.feed)) out.splice(out.findIndex((m) => m.feed), 1);
  return out;
}

function feedMessage(room, w, x, t) {
  const feed = { site: w.site, title: x.title, url: x.url, when: x.when };
  if (x.sha) { feed.sha = x.sha; feed.by = x.by || []; if (x.anon) feed.anon = true; }
  return { id: randomUUID(), handle: FEED_NAMES[room], text: `${w.site}: ${x.title}`, t, base: false, claimed: false, feed };
}

/* What a radio is sent of one: each part checked again, so a message can say
   it came off a wire only in this shape. */
export function shapeFeed(f) {
  if (!f || typeof f !== 'object') return null;
  const s = (v, most) => (typeof v === 'string' && v && [...v].length <= most ? v : null);
  const site = s(f.site, 80), title = s(f.title, 300), url = s(f.url, 500);
  if (!site || !title || !url || !/^https:\/\//.test(url) || typeof f.when !== 'number') return null;
  const out = { site, title, url, when: f.when };
  if (typeof f.sha === 'string' && /^[0-9a-f]{7}$/.test(f.sha)) {
    out.sha = f.sha;
    out.by = Array.isArray(f.by) ? f.by.filter((b) => s(b, 60)).slice(0, 5) : [];
    // GitHub named nobody as its author: said before anybody the message credits.
    if (f.anon === true) out.anon = true;
  }
  return out;
}

export async function runFeedBot(s = store(), get = fetch, now = Date.now(), notify = notifyWire) {
  const jobs = [];
  for (const [room, wires] of Object.entries(feedRooms())) for (const w of wires) jobs.push({ room, w, key: `${room}/${w.id}` });
  const cur = await versioned(s, FEED_BOT);
  const was = (cur.exists && cur.data && cur.data.wires) || {};
  const got = await Promise.all(jobs.map((j) => readWire(j.w, was[j.key], get)));
  const next = {}, say = {};
  jobs.forEach(({ room, w, key }, i) => {
    const prior = was[key], g = got[i];
    if (!g || g.same) { if (prior) next[key] = prior; return; }
    const items = g.items, seen = new Set((prior && prior.seen) || []);
    const times = items.map((x) => x.when);
    next[key] = {
      seen: [...new Set(items.map((x) => x.id).concat((prior && prior.seen) || []))].slice(0, FEED_SEEN),
      newest: Math.max((prior && prior.newest) || 0, ...times, 0),
      etag: g.etag, modified: g.modified,
    };
    if (!prior || !Array.isArray(prior.seen)) return;           // the first reading: remember, say nothing
    if (items.length && items.every((x) => !seen.has(x.id)) && Math.min(...times) <= (prior.newest || 0)) return;
    const fresh = items.filter((x) => !seen.has(x.id) && now - x.when < LIFE
      && !(w.kind === 'atom' && sourceSkips(x.title)));
    if (!fresh.length) return;
    fresh.sort((a, b) => a.when - b.when);
    (say[room] = say[room] || []).push(...fresh.slice(-FEED_RUN).map((x) => ({ w, x })));
  });
  if (!Object.keys(say).length && JSON.stringify(next) === JSON.stringify(was)) return { said: 0 };
  const res = await s.setJSON(FEED_BOT, { wires: next }, cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true });
  if (!res.modified) return { said: 0, busy: true };
  let said = 0;
  for (const [room, list] of Object.entries(say)) {
    list.sort((a, b) => a.x.when - b.x.when);
    const msgs = list.map(({ w, x }, i) => feedMessage(room, w, x, now + i));
    const keep = (await ruleOf(room, s)).keep;
    await updateRoomTalk(room, (log) => keepBot(log.concat(msgs), keep), s);
    await noteLatest(room, msgs[msgs.length - 1].t, s).catch(() => false);
    for (const m of msgs) await notify(m, room, s).catch(() => []);
    said += msgs.length;
  }
  return { said };
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
   on (callSettings), which only guests wait in, because every account joins
   these as a moderator (callToken). Add a room here and it is open to the
   world, and every account moderates it. */
export const PUBLIC_CALLS = ['cavendish-events', 'cavendish-operations', 'cavendish-editorial'];
export function publicCall(tag) { return PUBLIC_CALLS.includes(tag) ? tag : null; }

/* JaaS's SETTINGS_PROVISIONING webhook: asked before every meeting, with the
   meeting's "AppID/roomName". A public call starts with the lobby on and every
   non-moderator knocking, which there means every guest; every other call
   starts without one, because only people signed on to the CB can get into
   those at all. */
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
  // THE LOBBY IS FOR GUESTS. Ryan's call, 2026-10-24: anybody with an account
  // comes straight into the public calls, and 8x8 lets only a moderator past
  // its lobby, so in those three every account is one. It moderates, and no
  // more: recording and transcription stay the base's.
  const moderator = base || (!!publicCall(tag) && who.role !== 'guest' && who.account === true);
  const t = Math.floor(now / 1000);
  const header = { alg: 'RS256', typ: 'JWT', kid: key.kid };
  const payload = {
    aud: 'jitsi', iss: 'chat', sub: JAAS_APP, room: callRoom(tag),
    iat: t, nbf: t - 10, exp: t + CALL_HOURS * 3600,
    context: {
      user: {
        id: createHash('sha256').update(`stimpunks-call\0${who.role}\0${who.handle}`).digest('base64url').slice(0, 22),
        name: who.handle,
        moderator: moderator ? 'true' : 'false',
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
   one, each with roles. It lived in Netlify's environment as CB_MODS, never in
   the repo, because who holds which role is not ours to publish, as one JSON
   object from handle to roles.

   SINCE 2026-10-21 CB_MODS IS ONLY THE BREAK-GLASS LIST (Ryan's call: Ryan
   and Helen), and everybody else's roles are kept with the CB (`roles`, below)
   and changed by administrators at the desk in the Moderators' room. The two
   are read together (readMods): a break-glass entry is `fixed`, cannot be
   changed or removed from the desk, and wins over a stored one that folds
   alike. If CB_MODS cannot be read, nothing works, as before; if the stored
   roles cannot be read, only the break-glass list does. CB_MODS's shape:

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

/* The roles everybody holds now: the break-glass list and the stored roles as
   this instance last read them (loadMods, at most MODS_FRESH ago). Given a
   string, only that string, read as CB_MODS is (the tests' way, and the
   break-glass list's). A stored role that has not been loaded is not there,
   which can only ever leave somebody with less than they hold. */
export function readMods(raw) {
  if (raw !== undefined) return parseMods(raw);
  const fixed = parseMods(process.env.CB_MODS);
  if (!fixed) return null;
  for (const v of fixed.values()) v.fixed = true;
  if (storedRoles.map) for (const [k, v] of storedRoles.map) if (!fixed.has(k)) fixed.set(k, v);
  // partial: the stored roles could not be read, so a pass is not swapped for less on the strength of it.
  fixed.partial = !storedRoles.map;
  return fixed;
}
function parseMods(raw) {
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

/* Signing on. A claimed username signs on with its own password and nothing
   else. The answer is a role and the roles, or a sentence saying why not.

   EVERY USERNAME IS CLAIMED NOW. Ryan's calls, 2026-10-21: the starter
   password became invites, everybody joins by claiming a username with a
   password of their own, and the starter password was retired the same day,
   so it signs nobody on. A moderator whose handle is still on the moderators'
   password is answered { claim } and no pass: they claim it first, on the
   joining page, with the moderators' password (joinAccount). */
export const STARTER_GONE = 'The starter password has been retired. You join the CB with an invite now: a link or a code from a moderator, or from the Stimpunks Community page when you join our community.';
export async function signOn(handle, password, mods, s = store(), now = Date.now()) {
  if (mods === undefined) mods = await loadMods();
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
    return { claim: true, mod: true, handle: m.handle };
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
    // Timed out or banned: said only now, after the right password, so the
    // front desk tells nobody else that a username is barred. A time out that
    // has ended is taken off the account here, so it is not kept past its time.
    if (barredNow(acct, now)) return { error: barWords(acct.bar, now), barred: true };
    if (acct.bar) await liftBar(handle, s, now);
    // Its roles still come from the moderators' list, read now, never from the
    // account: taking somebody off the list leaves them an ordinary claimed
    // username with the same password.
    // A SECOND STEP, if the account has one: no pass yet, a ticket for it.
    if (hasSecond(acct)) return { second: true, acct };
    const on = mods && mods.get(foldHandle(handle));
    if (on && staffNeedsSecond(acct, now)) return { role: 'mobile', handle: acct.handle, roles: new Set(), account: r.v, twostep: 'needed' };
    if (on) return { role: 'base', handle: on.handle, roles: on.roles, account: r.v };
    return { role: 'mobile', handle: acct.handle, roles: new Set(), account: r.v };
  }
  const all = secretFor('mobile');
  if (all && same(password, all)) return { error: STARTER_GONE };
  if (mods && mods.has(foldHandle(handle))) {
    return { error: 'That username is a moderator\'s, and has not been claimed yet. Its moderator claims it on the joining page, with the moderators\' password.' };
  }
  return { error: 'Nobody has claimed that username, so there is no password to sign on with. New here? You join the CB with an invite.' };
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
   community password, so changing it still signs everybody off.

   A PASS FROM A SHARED PASSWORD (cb1) IS GOOD FOR ONE THING NOW: claiming the
   username it is on (Ryan, 2026-10-21, "They must claim a username to retain
   access"). Only /cb/account asks for it, with { unclaimed: true }; to every
   other function it is no pass, and the radio says why and offers the claim. */
export async function readPass(req, mods, s = store(), { unclaimed = false, now = Date.now() } = {}) {
  if (mods === undefined) mods = await loadMods();
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
    const acct = await readAccount(handle, s);
    if (!acct || acct.v !== v) return null;
    // A username a moderator has timed out or banned has no pass that works
    // while it holds (barredNow, below): this is the one check that keeps it
    // off every part of the CB.
    if (barredNow(acct)) return null;
    // since: when the username was claimed, which the forums fold into the
    // mark on every post (authorMark), so that a name claimed again after its
    // owner deleted it is a different author. It is never sent anywhere.
    // STAFF NEED A SECOND STEP FROM TWOFA_FROM (two-step sign-in, below): without
    // one, a staff pass is read as an ordinary member's, with nothing to swap to
    // until it is set up, and `twostep` says so to the radio.
    if (on && staffNeedsSecond(acct, now)) return { role: 'mobile', handle: acct.handle, roles: new Set(), account: true, since: acct.since, twostep: 'needed' };
    if (kind === 'base' && on) return { role: 'base', handle: on.handle, roles: on.roles, account: true, since: acct.since, fixed: !!on.fixed, ...(hasSecond(acct) ? {} : { twostep: 'soon' }) };
    // A pass of the other kind from the one the list says, because somebody was
    // given a role or had one taken away at the desk (2026-10-21): an ordinary
    // username's, never more, and the pass it should hold now, which the radio
    // takes from its next listen (swap), so nobody has to sign off and on. It is
    // what signing on again with their own password would give them.
    const member = { role: 'mobile', handle: acct.handle, roles: new Set(), account: true, since: acct.since };
    if ((kind === 'base' || on) && mods && !mods.partial) member.swap = accountAnswer(acct.handle, v, mods, acct, now);
    return member;
  }
  const m = /^Bearer (cb1)\.(mobile|base)\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/.exec(h);
  if (!m || !unclaimed) return null;
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

/* Whether a request carries a pass from a shared password (cb1), which is
   good only for claiming now. The channel and Be seen here answer one 403
   rather than 401, so a radio still running the code from before 2026-10-21
   goes on saying "no signal" rather than forgetting its pass: that pass is
   the one thing that lets its person claim their username once the page is
   reloaded, with the starter password retired. */
export function sharedPass(req) { return /^Bearer cb1\./.test((req && req.headers && req.headers.get('authorization')) || ''); }

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
export function accountAnswer(handle, v, mods = readMods(), acct = null, now = Date.now()) {
  const on = mods && mods.get(foldHandle(handle));
  // A staff username with no second step after TWOFA_FROM answers as a member,
  // and says what would bring its roles back (two-step sign-in, below).
  if (on && acct && staffNeedsSecond(acct, now)) return { pass: issueAccountPass(handle, v), handle, base: false, roles: [], claimed: true, twostep: 'needed' };
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

/* ── Roles kept with the CB, changed at the desk ─────────────────────────

   Ryan's ask and calls, 2026-10-21: the roles become a small system that
   administrators provision in the Moderators' room. One blob, `roles`, holds
   each person's username, roles, and who changed them last and when (Ryan's
   call: that much, and no history). It is read by loadMods at most every
   MODS_FRESH per function instance, so a change reaches every request within
   that; the instance that made it has it at once.

   WHAT THE DESK CANNOT DO. Change or remove a break-glass entry (CB_MODS).
   Leave nobody an administrator. And give or take away board, unless whoever
   is at the desk is on the board or the break-glass list (Ryan's call):
   Executive Session is the board without staff, and an administrator who
   could make themselves board would walk into it. Roles are only ROLES; a new
   kind of role is still a change to the code. Nothing here is ever logged. */
const ROLES_KEY = 'roles';
export const MODS_FRESH = 30 * 1000;
export const ROLES_GIVEN = ['board', 'director', 'administrator'];   // moderator is being on the list
let storedRoles = { map: null, at: 0 };

/* The stored roles, read: a Map like CB_MODS's, empty when there are none,
   or null when what is there cannot be trusted, which leaves the break-glass
   list alone. */
function parseStoredRoles(d) {
  if (!d) return new Map();
  if (typeof d !== 'object' || !d.people || typeof d.people !== 'object' || Array.isArray(d.people)) return null;
  const map = new Map();
  for (const [key, e] of Object.entries(d.people)) {
    if (!e || typeof e.handle !== 'string' || cleanHandle(e.handle) !== e.handle || foldHandle(e.handle) !== key) return null;
    if (!Array.isArray(e.roles) || !e.roles.every((r) => ROLES_GIVEN.includes(r))) return null;
    map.set(key, { handle: e.handle, roles: new Set(['moderator', ...e.roles]), by: typeof e.by === 'string' ? e.by : null, t: typeof e.t === 'number' ? e.t : null });
  }
  return map;
}
/* The roles as they stand: the stored ones read again if this instance has
   not read them for MODS_FRESH. `s`, the tests' store, is always read. */
export async function loadMods(s = null, now = Date.now()) {
  if (!s && storedRoles.at && now - storedRoles.at < MODS_FRESH) return readMods();
  let map = null;
  try { map = parseStoredRoles(await (s || store()).get(ROLES_KEY, { type: 'json' })); } catch (e) { map = null; }
  storedRoles = { map, at: now };
  return readMods();
}
/* Forget what was loaded, for the tests, which share one module. */
export function unloadMods() { storedRoles = { map: null, at: 0 }; }

export function rolesEditor(who) { return !!who && who.role === 'base' && !!who.roles && who.roles.has('administrator'); }
const boardEditor = (who) => who.roles.has('board') || !!who.fixed;

/* Everybody with a role, for an administrator at the desk: the break-glass
   list (fixed) and the stored roles, read afresh, each with whether their
   username has been claimed, alphabetical. */
export async function rolesList(who, s = store()) {
  if (!rolesEditor(who)) return null;
  const fixed = parseMods(process.env.CB_MODS);
  const stored = parseStoredRoles(await s.get(ROLES_KEY, { type: 'json' }));
  if (!fixed || !stored) return { error: 'The list of roles cannot be read just now, so nothing can be changed. Tell Ryan or Helen.' };
  const people = [];
  for (const [, v] of fixed) people.push({ handle: v.handle, roles: [...v.roles].filter((r) => r !== 'moderator').sort(), fixed: true });
  for (const [k, v] of stored) if (!fixed.has(k)) people.push({ handle: v.handle, roles: [...v.roles].filter((r) => r !== 'moderator').sort(), by: v.by, t: v.t });
  const claimed = await Promise.all(people.map((x) => readAccount(x.handle, s)));
  people.forEach((x, i) => { x.claimed = !!claimed[i]; });
  // mayBoard: whether this administrator may give or take away board, for the page to say so.
  return { people: people.sort((a, b) => foldHandle(a.handle).localeCompare(foldHandle(b.handle))), mayBoard: boardEditor(who) };
}

/* Somebody given roles, or their roles changed (roles: any of ROLES_GIVEN;
   none leaves them a moderator), or with `remove`, taken off the list. */
export async function setRoles(who, handle, roles, s = store(), now = Date.now(), remove = false) {
  if (!rolesEditor(who)) return { error: 'Roles are changed by administrators.' };
  const h = cleanHandle(handle);
  if (!h) return { error: 'That is not a username.' };
  const want = remove ? [] : (Array.isArray(roles) ? roles : []);
  if (!want.every((r) => ROLES_GIVEN.includes(r))) return { error: `A role is one of ${ROLES_GIVEN.join(', ')}; being on the list makes somebody a moderator.` };
  const fixed = parseMods(process.env.CB_MODS);
  if (!fixed) return { error: 'The list of roles cannot be read just now, so nothing can be changed. Tell Ryan or Helen.' };
  const key = foldHandle(h);
  if (fixed.has(key)) return { error: `${fixed.get(key).handle} is on the break-glass list in Netlify's settings, which the desk cannot change.` };
  const acct = await readAccount(h, s);
  const spelling = acct ? acct.handle : h;
  let why = null;
  const next = await updateDoc(ROLES_KEY, (d) => {
    why = null;
    const map = parseStoredRoles(d);
    if (!map) { why = 'The list of roles cannot be read just now, so nothing can be changed. Tell Ryan or Helen.'; return null; }
    const had = map.get(key);
    if (remove && !had) { why = `${h} is not on the list.`; return null; }
    const before = had ? had.roles.has('board') : false, after = !remove && want.includes('board');
    if (before !== after && !boardEditor(who)) { why = 'Only somebody on the board, or on the break-glass list, can give or take away board.'; return null; }
    if (remove) map.delete(key);
    else map.set(key, { handle: had ? had.handle : spelling, roles: new Set(['moderator', ...want]), by: who.handle, t: now });
    const admins = [...fixed.values(), ...[...map].filter(([k]) => !fixed.has(k)).map(([, v]) => v)].filter((v) => v.roles.has('administrator')).length;
    if (!admins) { why = 'That would leave nobody an administrator.'; return null; }
    const people = {};
    for (const [k, v] of map) people[k] = { handle: v.handle, roles: [...v.roles].filter((r) => r !== 'moderator').sort(), by: v.by || null, t: v.t || null };
    return { people };
  }, s);
  if (why) return { error: why };
  storedRoles = { map: parseStoredRoles(next), at: now };
  return rolesList(who, s);
}

/* ── Accounts: a username you claim, with a password of your own ───────── */

/* Ryan's calls, 2026-09-30: a Profile on the CB where you can claim your
   username and set your own password; no email; a recovery code shown once
   when you claim; moderators can reset a password, delete an account or
   clear its profile card, in the Moderators' room. Claiming was optional
   then, and only possible while signed on with the community password.

   SINCE 2026-10-21 EVERYBODY CLAIMS, AND AN EMAIL ADDRESS IS OPTIONAL. Ryan's
   calls that day: the starter password became invites (below), everybody on
   the CB joins by claiming a username, a pass from a shared password is good
   only for claiming (readPass), and an account may keep an email address for
   one thing, sending its owner a reset code they ask for (mailResetCode).
   That reverses "no email". The address is sealed with the office's key, read
   by nobody but the code that sends the reset, and goes with the account.

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
   version, and a count of wrong passwords with the time it is locked until;
   only if its owner gave one, an email address, sealed; and only while a
   moderator has timed it out or banned it, until when (bar, below). No other
   name, nothing about what anybody does. It is filed under acctKey, a plain
   hash of the folded username, so the store's keys do not list usernames. The
   moderators' desk reads every record for its directory (accountDirectory,
   Ryan's call of 2026-10-22, below), and nothing else does.

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

// A role's word is not a username (ROLE_ANYBODY, under Notifications).
const ROLE_WORD = 'That is the name of a role on the CB: @moderator, @director, @board and @administrator call everybody who holds one, so nobody can have it as a username. Pick another.';
// Nor is a room's feed bot's name (botWord, under Room channels).
const BOT_WORD = 'That is a name the street\u2019s own bots write under (The Feed\u2019s and The Source\u2019s arrivals, and the Wiki\u2019s bot), so nobody can have it as a username. Pick another.';

/* Claim `handle` with `password`, and an email address for recovery if one
   is given. The first claim wins; a handle on the moderators' list cannot be
   claimed. Answers { v, recovery } with the code to be shown once, or
   { error }. */
export async function claimAccount(handle, password, s = store(), now = Date.now(), mods, asBase = false, email = null) {
  if (mods === undefined) mods = await loadMods();
  if (!asBase && mods && mods.has(foldHandle(handle))) return { error: 'That handle is a moderator\'s, and only they can move it onto a password of their own.' };
  if (roleWord(handle)) return { error: ROLE_WORD };
  if (botWord(handle)) return { error: BOT_WORD };
  const pw = ownPassword(password);
  if (!pw) return { error: `A password is between ${ACCT_PW_MIN} and ${ACCT_PW_MAX} characters, and not the community or the moderators' password. A few words you will remember is fine.` };
  const box = await recoveryBox(email);
  if (box && box.error) return box;
  const recovery = makeCode();
  const ps = salt(), rs = salt();
  const body = { handle, hash: scrypt(pw, ps), salt: ps, rhash: scrypt(cleanCode(recovery), rs), rsalt: rs,
    since: now, v: 1, fails: 0, lockUntil: 0, ...(box ? { email: box.sealed } : {}) };
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
  const byMail = acct.mailed && acct.mailed.until > now && matches(c, acct.mailed.salt, acct.mailed.hash);
  const byCode = matches(c, acct.rsalt, acct.rhash);
  if (!byReset && !byMail && !byCode) {
    const after = await updateAccount(handle, (a) => {
      const fails = (a.lockUntil > now ? 0 : a.fails || 0) + 1;
      return fails >= ACCT_TRIES ? { ...a, fails: 0, lockUntil: now + ACCT_LOCK } : { ...a, fails };
    }, s);
    return after && after.lockUntil > now ? { error: 'That is not its code, and it is locked for fifteen minutes now.', locked: true } : { error: 'That is not its recovery code, a reset code we emailed you, or one a moderator gave you.' };
  }
  if (barredNow(acct, now)) return { error: barWords(acct.bar, now), barred: true };
  const pw = ownPassword(password);
  if (!pw) return { error: `A password is between ${ACCT_PW_MIN} and ${ACCT_PW_MAX} characters, and not one of the shared ones.` };
  const recovery = makeCode();
  const ps = salt(), rs = salt();
  const next = await updateAccount(handle, (a) => {
    const n = { ...a, hash: scrypt(pw, ps), salt: ps, rhash: scrypt(cleanCode(recovery), rs), rsalt: rs, v: a.v + 1, fails: 0, lockUntil: 0 };
    delete n.reset;
    delete n.mailed;
    // A moderator's reset code takes the second step off: it is the way back
    // for somebody who has lost every step, and the moderator made sure who
    // they were talking to. A recovery code or an emailed one does not.
    if (byReset && !byCode && !byMail) delete n.mfa;
    return n;
  }, s);
  if (!next) return { error: 'That username has not been claimed.' };
  return { v: next.v, recovery, handle: next.handle, acct: next, second: hasSecond(next) };
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

/* Delete an account, its pets, its avatars, its chimeras, its jobs, its patches, its crystals, its herbs, its profile and its sets, its own order for the chat page, its props, its chat status, its events and its messages. The username is free again. */
export async function deleteAccount(handle, s = store()) {
  const acct = await readAccount(handle, s);
  if (!acct) return { error: 'That username has not been claimed.' };
  await forgetPets(petKey(handle), s);
  await forgetAvatars(petKey(handle), s);
  await forgetChimeras(petKey(handle), s);
  await forgetJobs(petKey(handle), s);
  await forgetPatches(petKey(handle), s);
  await forgetCrystals(petKey(handle), s);
  await forgetHerbs(petKey(handle), s);
  await forgetProfile(petKey(handle), s);
  await forgetProfileSets(petKey(handle), s);
  await forgetChatOrder(petKey(handle), s);
  await forgetTaskViews(petKey(handle), s);
  await forgetOfficeLayout(petKey(handle), s);
  await forgetTaskInbox(petKey(handle), s);
  await forgetNotices(petKey(handle), s);
  await forgetProps(petKey(handle), s);
  await forgetChatStatus(petKey(handle), s);
  await forgetEvents(acct.handle, acct.since, s);
  await forgetDms(acct.handle, acct.since, s);
  await forgetReads(acct.handle, acct.since, s);
  await dropDevicesOf(handle, s);
  await s.delete(acctBlob(handle));
  return { deleted: true };
}

/* What a person, or a moderator looking them up, is told about an account:
   whether it is claimed, as what, and since when. Never a hash. */
export function shapeAccount(a) { return a ? { claimed: true, handle: a.handle, since: a.since } : { claimed: false }; }

/* ── Two-step sign-in ─────────────────────────────────────────────────────

   Ryan's ask and calls, 2026-10-26: a second step after the password, by an
   authenticator app (TOTP, RFC 6238) or a passkey (WebAuthn), required for
   everybody on the moderators' list from TWOFA_FROM and offered to everybody
   else. A staff username without it after that date is read as an ordinary
   member's (readPass), with nothing shut, until they set it up: nobody is
   shut out of the community for it. The week before, the radio says so.

   WHAT IS KEPT, on the account record as `mfa` and nowhere else: the
   authenticator app's secret, sealed with the staff key under its own name
   (so the account blob alone does not give it away), and the last thirty
   seconds' step a code was used in, so a code works once; each passkey's
   credential id, public key, algorithm, signature counter and the name its
   owner gave it; and the backup codes, each a salted hash, each good once.
   Nothing about when. Adding or taking off a step moves the account's
   version, which signs every other device off, and answers this device a new
   pass.

   SIGNING ON IS STATELESS: a right password on an account with a second step
   answers `second`, a ticket good for five minutes (handle, version, a random
   challenge, signed with a key made from the community password), and the
   step is checked against the ticket. Wrong codes count as wrong passwords
   and lock the account the same way. A recovery code or an emailed reset code
   changes the password and still asks for the second step; a moderator's
   reset code takes the second step off, because a moderator who gave one has
   made sure who they were talking to and it is the way back for somebody who
   has lost every step. Without the staff key no authenticator app can be set
   up or used (its secret cannot be opened), and passkeys and backup codes
   still work. */
export const TWOFA_FROM = Date.UTC(2026, 10, 2, 7, 0);   // 2026-11-02 00:00 in Colorado: staff need a second step from here
export const TOTP_STEP = 30;
export const TICKET_FOR = 5 * 60 * 1000;
export const PASSKEYS_MAX = 10;
export const BACKUP_CODES = 10;
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const ISSUER = 'Stimpunks.World';

export function hasSecond(acct) {
  const m = acct && acct.mfa;
  return !!(m && (m.totp || (Array.isArray(m.keys) && m.keys.length)));
}
/* Whether a staff username is held back for want of a second step now. */
export function staffNeedsSecond(acct, now = Date.now()) { return now >= TWOFA_FROM && !hasSecond(acct); }

export function base32(buf) {
  let bits = 0, value = 0, out = '';
  for (const byte of buf) {
    value = (value << 8) | byte; bits += 8;
    while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}
export function unbase32(s) {
  const clean = String(s).toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0, value = 0;
  const out = [];
  for (const ch of clean) {
    value = (value << 5) | B32.indexOf(ch); bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}
/* RFC 6238's code for a secret at a step: six digits, HMAC-SHA1. */
export function totpAt(secret, step) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(step));
  const h = createHmac('sha1', secret).update(msg).digest();
  const o = h[h.length - 1] & 15;
  const n = ((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1000000).padStart(6, '0');
}
/* The step a code is good at, one step either side of now, or null. */
function totpStep(secret, code, now) {
  const c = String(code == null ? '' : code).replace(/\D/g, '');
  if (c.length !== 6) return null;
  const at = Math.floor(now / 1000 / TOTP_STEP);
  for (const st of [at, at - 1, at + 1]) {
    const want = Buffer.from(totpAt(secret, st)), got = Buffer.from(c);
    if (timingSafeEqual(want, got)) return st;
  }
  return null;
}
const totpName = (handle) => `acct-totp/${acctKey(handle)}`;
function totpSecretOf(acct) {
  const box = acct && acct.mfa && acct.mfa.totp;
  if (!box) return null;
  const k = staffCipherKey();
  if (!k) return null;
  try { return unbase32(openJsonWith(k, 'staff', totpName(acct.handle), box).s); } catch (e) { return null; }
}

/* A signed, short-lived token: what it carries, and when it ends. */
function ticketKey() {
  const s = secretFor('mobile');
  return s ? createHash('sha256').update(`stimpunks-2fa|${s}`).digest() : null;
}
function makeTicket(kind, data, now) {
  const k = ticketKey();
  if (!k) return null;
  const body = Buffer.from(JSON.stringify({ k: kind, ...data, exp: now + TICKET_FOR })).toString('base64url');
  return `${body}.${createHmac('sha256', k).update(body).digest('base64url')}`;
}
function readTicket(kind, t, now) {
  const k = ticketKey();
  if (!k || typeof t !== 'string' || t.length > 4000) return null;
  const [body, sig] = t.split('.');
  if (!body || !sig) return null;
  const want = Buffer.from(createHmac('sha256', k).update(body).digest('base64url')), got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  let d;
  try { d = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')); } catch (e) { return null; }
  return d && d.k === kind && typeof d.exp === 'number' && d.exp > now ? d : null;
}

/* What the person and the page are told about their steps: never a secret,
   never a public key. */
export function shapeSecond(acct, now = Date.now(), staff = false) {
  const m = (acct && acct.mfa) || {};
  return {
    app: !!m.totp,
    passkeys: (m.keys || []).map((x) => ({ id: x.id, name: x.name })),
    codesLeft: (m.codes || []).length,
    appReady: staffReady(),
    ...(staff ? { staff: true, from: TWOFA_FROM, needed: staffNeedsSecond(acct, now) } : {}),
  };
}

/* ── Backup codes ── */
function backupCode() {
  const b = randomBytes(12);
  let out = '';
  for (let i = 0; i < 12; i++) out += CODE_ALPHABET[b[i] % CODE_ALPHABET.length];
  return out.match(/.{4}/g).join('-');
}
const codeHash = (csalt, c) => createHash('sha256').update(`${csalt}|${cleanCode(c)}`).digest('base64url');
function freshCodes() {
  const csalt = salt();
  const codes = Array.from({ length: BACKUP_CODES }, backupCode);
  return { csalt, codes, hashes: codes.map((c) => codeHash(csalt, c)) };
}

/* ── WebAuthn: the little of CBOR a passkey speaks ── */
function cbor(buf, at = 0) {
  const b = buf[at], major = b >> 5, info = b & 31;
  let n = info, p = at + 1;
  if (info === 24) { n = buf[p]; p += 1; }
  else if (info === 25) { n = buf.readUInt16BE(p); p += 2; }
  else if (info === 26) { n = buf.readUInt32BE(p); p += 4; }
  else if (info === 27) { n = Number(buf.readBigUInt64BE(p)); p += 8; }
  else if (info > 27) throw new Error('cbor');
  if (major === 0) return [n, p];
  if (major === 1) return [-1 - n, p];
  if (major === 2) return [buf.subarray(p, p + n), p + n];
  if (major === 3) return [buf.subarray(p, p + n).toString('utf8'), p + n];
  if (major === 4) { const a = []; for (let i = 0; i < n; i++) { const [v, q] = cbor(buf, p); a.push(v); p = q; } return [a, p]; }
  if (major === 5) { const m = new Map(); for (let i = 0; i < n; i++) { const [k, q] = cbor(buf, p); const [v, r] = cbor(buf, q); m.set(k, v); p = r; } return [m, p]; }
  if (major === 7) return [info === 20 ? false : info === 21 ? true : null, p];
  throw new Error('cbor');
}
/* A COSE public key as a JWK node:crypto reads, and its algorithm. */
function coseKey(m) {
  const kty = m.get(1), alg = m.get(3);
  const u = (x) => Buffer.from(x).toString('base64url');
  if (kty === 2 && alg === -7 && m.get(-1) === 1) return { alg, jwk: { kty: 'EC', crv: 'P-256', x: u(m.get(-2)), y: u(m.get(-3)) } };
  if (kty === 1 && alg === -8 && m.get(-1) === 6) return { alg, jwk: { kty: 'OKP', crv: 'Ed25519', x: u(m.get(-2)) } };
  if (kty === 3 && alg === -257) return { alg, jwk: { kty: 'RSA', n: u(m.get(-1)), e: u(m.get(-2)) } };
  return null;
}
function authData(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 37) return null;
  const out = { rpIdHash: buf.subarray(0, 32), flags: buf[32], count: buf.readUInt32BE(33) };
  if (out.flags & 0x40) {
    const len = buf.readUInt16BE(53);
    out.credId = buf.subarray(55, 55 + len);
    const [key] = cbor(buf, 55 + len);
    out.key = key;
  }
  return out;
}
const fromB64 = (s) => { try { return typeof s === 'string' && s.length < 20000 ? Buffer.from(s, 'base64url') : null; } catch (e) { return null; } };
/* The page's origin and the relying party's id, from the request's own
   Origin header, which sameSite has already held to this site's host. */
export function webauthnSite(req) {
  try { const o = new URL(req.headers.get('origin')); return { origin: o.origin, rpId: o.hostname }; } catch (e) { return null; }
}
function clientData(b64, type, challenge, site) {
  const raw = fromB64(b64);
  if (!raw) return null;
  let d;
  try { d = JSON.parse(raw.toString('utf8')); } catch (e) { return null; }
  if (!d || d.type !== type || d.challenge !== challenge || d.origin !== site.origin) return null;
  return raw;
}

/* ── Setting up a step, signed on ── */
async function readSigned(who, s) {
  if (!who || !who.account) return null;
  return readAccount(who.handle, s);
}
/* The authenticator app: a fresh secret, to be confirmed with a code from it. */
export async function totpStart(who, s = store(), now = Date.now()) {
  const acct = await readSigned(who, s);
  if (!acct) return { error: 'Claim your username first.' };
  const k = staffCipherKey();
  if (!k) return { error: 'An authenticator app cannot be set up just now. A passkey can.' };
  const secret = base32(randomBytes(20));
  const setup = makeTicket('totp-setup', { h: acct.handle, v: acct.v, box: sealJsonWith(k, 'staff', `totp-setup/${acctKey(acct.handle)}`, { s: secret }) }, now);
  if (!setup) return { error: 'Two-step sign-in is switched off just now.' };
  const label = encodeURIComponent(`${ISSUER}:${acct.handle}`);
  return { setup, secret, uri: `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(ISSUER)}&algorithm=SHA1&digits=6&period=${TOTP_STEP}` };
}
/* A step added: the version moves, the backup codes are made if this is the
   first step, and this device is answered a new pass. */
async function addStep(acct, change, s, now) {
  let codes = null;
  const next = await updateAccount(acct.handle, (a) => {
    if (a.v !== acct.v) return null;
    const m = { keys: [], codes: [], ...(a.mfa || {}) };
    const first = !hasSecond(a);
    const r = change(m);
    if (!r) return null;
    if (first || !m.codes.length) { const f = freshCodes(); m.codes = f.hashes; m.csalt = f.csalt; codes = f.codes; }
    return { ...a, mfa: m, v: a.v + 1, fails: 0, lockUntil: 0 };
  }, s);
  if (!next || next.v === acct.v) return { error: 'Your account changed while you were doing that. Start again.' };
  return { v: next.v, codes, acct: next };
}
export async function totpConfirm(who, setup, code, s = store(), now = Date.now()) {
  const acct = await readSigned(who, s);
  if (!acct) return { error: 'Claim your username first.' };
  const t = readTicket('totp-setup', setup, now);
  if (!t || t.h !== acct.handle || t.v !== acct.v) return { error: 'That set-up has run out. Start again.' };
  const k = staffCipherKey();
  if (!k) return { error: 'An authenticator app cannot be set up just now. A passkey can.' };
  let secret;
  try { secret = openJsonWith(k, 'staff', `totp-setup/${acctKey(acct.handle)}`, t.box).s; } catch (e) { return { error: 'That set-up has run out. Start again.' }; }
  const st = totpStep(unbase32(secret), code, now);
  if (st === null) return { error: 'That is not the code your app shows. Check its clock is right, and type the six digits it shows now.' };
  return addStep(acct, (m) => { m.totp = sealJsonWith(k, 'staff', totpName(acct.handle), { s: secret }); m.last = st; return m; }, s, now);
}
/* A passkey: the options the browser makes one with. */
export async function passkeyStart(who, site, s = store(), now = Date.now()) {
  const acct = await readSigned(who, s);
  if (!acct) return { error: 'Claim your username first.' };
  if (!site) return { error: 'That did not come from this site.' };
  if (((acct.mfa && acct.mfa.keys) || []).length >= PASSKEYS_MAX) return { error: `You have ${PASSKEYS_MAX} passkeys already. Take one off first.` };
  const ch = randomBytes(32).toString('base64url');
  const setup = makeTicket('key-setup', { h: acct.handle, v: acct.v, ch }, now);
  if (!setup) return { error: 'Two-step sign-in is switched off just now.' };
  return {
    setup,
    options: {
      challenge: ch,
      rp: { id: site.rpId, name: ISSUER },
      user: { id: acctKey(acct.handle), name: acct.handle, displayName: acct.handle },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -8 }, { type: 'public-key', alg: -257 }],
      timeout: TICKET_FOR,
      attestation: 'none',
      authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
      excludeCredentials: ((acct.mfa && acct.mfa.keys) || []).map((x) => ({ type: 'public-key', id: x.id })),
    },
  };
}
export async function passkeyAdd(who, setup, cred, name, site, s = store(), now = Date.now()) {
  const acct = await readSigned(who, s);
  if (!acct) return { error: 'Claim your username first.' };
  const t = readTicket('key-setup', setup, now);
  if (!t || t.h !== acct.handle || t.v !== acct.v || !site) return { error: 'That set-up has run out. Start again.' };
  const c = cred && typeof cred === 'object' ? cred : {};
  if (!clientData(c.clientDataJSON, 'webauthn.create', t.ch, site)) return { error: 'That passkey was not made for this site. Start again.' };
  let att;
  try { [att] = cbor(fromB64(c.attestationObject) || Buffer.alloc(0)); } catch (e) { att = null; }
  const ad = att instanceof Map ? authData(att.get('authData')) : null;
  if (!ad || !ad.credId || !(ad.flags & 0x01) || !ad.rpIdHash.equals(createHash('sha256').update(site.rpId).digest())) return { error: 'That passkey could not be read. Start again.' };
  const key = ad.key instanceof Map ? coseKey(ad.key) : null;
  if (!key) return { error: 'That kind of passkey is not one the CB can check. Try another device or an authenticator app.' };
  try { createPublicKey({ key: key.jwk, format: 'jwk' }); } catch (e) { return { error: 'That passkey could not be read. Start again.' }; }
  const id = ad.credId.toString('base64url');
  const label = tidy(typeof name === 'string' ? name : '').slice(0, 40) || 'Passkey';
  return addStep(acct, (m) => {
    if (m.keys.some((x) => x.id === id) || m.keys.length >= PASSKEYS_MAX) return null;
    m.keys = [...m.keys, { id, jwk: key.jwk, alg: key.alg, n: ad.count, name: label }];
    return m;
  }, s, now);
}
/* A step taken off, or new backup codes, with the password again. */
export async function secondRemove(who, password, what, s = store(), now = Date.now()) {
  const acct = await readSigned(who, s);
  if (!acct) return { error: 'Claim your username first.' };
  const ok = await checkPassword(acct.handle, password, s, now);
  if (ok.error) return ok;
  const next = await updateAccount(acct.handle, (a) => {
    const m = { keys: [], codes: [], ...(a.mfa || {}) };
    if (what === 'app') { if (!m.totp) return null; delete m.totp; delete m.last; }
    else if (what === 'all') { return { ...a, mfa: undefined, v: a.v + 1 }; }
    else { const k = m.keys.filter((x) => x.id !== what); if (k.length === m.keys.length) return null; m.keys = k; }
    if (!m.totp && !m.keys.length) return { ...a, mfa: undefined, v: a.v + 1 };
    return { ...a, mfa: m, v: a.v + 1 };
  }, s);
  if (!next || next.v === acct.v) return { error: 'That step is not on your account.' };
  return { v: next.v, acct: next };
}
export async function secondCodes(who, password, s = store(), now = Date.now()) {
  const acct = await readSigned(who, s);
  if (!acct) return { error: 'Claim your username first.' };
  if (!hasSecond(acct)) return { error: 'Set up an authenticator app or a passkey first.' };
  const ok = await checkPassword(acct.handle, password, s, now);
  if (ok.error) return ok;
  const f = freshCodes();
  const next = await updateAccount(acct.handle, (a) => (hasSecond(a) ? { ...a, mfa: { ...a.mfa, codes: f.hashes, csalt: f.csalt } } : null), s);
  return next && next.mfa ? { codes: f.codes } : { error: 'Set up an authenticator app or a passkey first.' };
}

/* ── The second step at sign-on ── */
/* After the right password or recovery code: a ticket, and what the page
   may ask for. The passkeys' ids are sent so the browser offers the right one;
   they name a credential, not a person. */
export function secondTicket(acct, site, now = Date.now()) {
  const ch = randomBytes(32).toString('base64url');
  const ticket = makeTicket('second', { h: acct.handle, v: acct.v, ch }, now);
  if (!ticket) return null;
  const keys = (acct.mfa && acct.mfa.keys) || [];
  return {
    ticket,
    app: !!(acct.mfa && acct.mfa.totp) && staffReady(),
    codes: !!(acct.mfa && acct.mfa.codes && acct.mfa.codes.length),
    passkey: keys.length && site ? { challenge: ch, rpId: site.rpId, timeout: TICKET_FOR, userVerification: 'preferred', allowCredentials: keys.map((x) => ({ type: 'public-key', id: x.id })) } : null,
  };
}
/* The step checked: { handle, v } and the account, or { error }. A wrong one
   counts as a wrong password. */
export async function secondCheck(ticket, f, site, s = store(), now = Date.now()) {
  const t = readTicket('second', ticket, now);
  if (!t) return { error: 'That sign-on has run out. Start again with your password.' };
  const acct = await readAccount(t.h, s);
  if (!acct || acct.v !== t.v) return { error: 'That sign-on has run out. Start again with your password.' };
  if (acct.lockUntil > now) return { error: 'That username is locked for a few minutes after too many wrong tries. Try again soon, or ask a moderator.', locked: true };
  const m = acct.mfa || {};
  const ff = f && typeof f === 'object' ? f : {};
  let change = null;
  if (typeof ff.code === 'string' && /^\s*\d{3}\s?\d{3}\s*$/.test(ff.code)) {
    if (!m.totp) return { error: 'This username has no authenticator app set up. Use a passkey or a backup code.' };
    const secret = totpSecretOf(acct);
    const st = secret ? totpStep(secret, ff.code, now) : null;
    if (st !== null && st > (m.last || 0)) change = (a) => ({ ...a, mfa: { ...a.mfa, last: st }, fails: 0 });
  } else if (typeof ff.code === 'string' && Array.isArray(m.codes) && m.codes.length) {
    const h = codeHash(m.csalt, ff.code);
    if (m.codes.includes(h)) change = (a) => ({ ...a, mfa: { ...a.mfa, codes: a.mfa.codes.filter((x) => x !== h) }, fails: 0 });
  } else if (ff.assertion && site && Array.isArray(m.keys)) {
    const a = ff.assertion;
    const key = m.keys.find((x) => x.id === a.id);
    const cd = key && clientData(a.clientDataJSON, 'webauthn.get', t.ch, site);
    const adRaw = cd && fromB64(a.authenticatorData);
    const ad = adRaw && authData(adRaw);
    const sig = fromB64(a.signature);
    if (key && cd && ad && sig && (ad.flags & 0x01) && ad.rpIdHash.equals(createHash('sha256').update(site.rpId).digest())) {
      const data = Buffer.concat([adRaw, createHash('sha256').update(cd).digest()]);
      let ok = false;
      try {
        const pk = createPublicKey({ key: key.jwk, format: 'jwk' });
        ok = key.alg === -8 ? cryptoVerify(null, data, pk, sig) : cryptoVerify('sha256', data, pk, sig);
      } catch (e) { ok = false; }
      const counted = !(key.n > 0 || ad.count > 0) || ad.count > key.n;
      if (ok && counted) change = (x) => ({ ...x, mfa: { ...x.mfa, keys: x.mfa.keys.map((k) => (k.id === key.id ? { ...k, n: ad.count } : k)) }, fails: 0 });
    }
  }
  if (!change) {
    const after = await updateAccount(acct.handle, (a) => {
      const fails = (a.lockUntil > now ? 0 : a.fails || 0) + 1;
      return fails >= ACCT_TRIES ? { ...a, fails: 0, lockUntil: now + ACCT_LOCK } : { ...a, fails };
    }, s);
    return after && after.lockUntil > now ? { error: 'That was not it, and that was the last try for now: it is locked for fifteen minutes.', locked: true } : { error: 'That was not it. Try again, or use another step.' };
  }
  if (barredNow(acct, now)) return { error: barWords(acct.bar, now), barred: true };
  const next = await updateAccount(acct.handle, (a) => (a.v === acct.v ? change(a) : null), s);
  if (!next || next.v !== acct.v) return { error: 'That sign-on has run out. Start again with your password.' };
  return { handle: next.handle, v: next.v, acct: next };
}

/* ── Kick, time out, ban: the desk's three ways to keep somebody off ─────

   Ryan's ask, 2026-10-22, after moderators asked for it for safeguarding: a
   moderator can sign a username off everywhere (kick), keep it off the CB for
   a while (time out), or keep it off until a moderator lifts it (ban), as well
   as give it a reset code or delete it.

   ALL THREE MOVE THE VERSION, as a reset does, so every device signed on as it
   is signed off at once and its notifications stop until it switches them on
   again. A kicked username signs straight back on with its own password.

   A TIME OUT AND A BAN ARE ONE FIELD, `bar`, which holds `until` (a time, or 0
   for until a moderator lifts it) AND NOTHING ELSE: not who barred it, not
   why, not when. The friendly edit is a note of who banned whom and why "so the
   next moderator knows"; it is a record of moderation kept against a person,
   which privacy.html#accounts says is not kept, and is Ryan's call first.
   While it holds, readPass refuses every pass for the username, and signOn and
   recoverAccount say so only AFTER the right password or code, so nobody else
   can learn at the front desk that a username is barred. A time out that has
   ended is taken off the next time the username signs on.

   A TIME OUT IS NOT DISCORD'S, where somebody timed out can still read: here
   the username is off the CB altogether for its time, reading included,
   because one check in readPass then holds it everywhere, and a time out that
   still let somebody read would need every function that writes to ask. A ban
   holds the NAME, not the person: with another invite they could join under
   another, and the desk says so. The desk does none of the three to a
   moderator's username, for the reason it does not reset one (isMod). */
export const BAR_FOR = { '10m': 10 * 60 * 1000, '1h': 60 * 60 * 1000, '1d': 24 * 60 * 60 * 1000, '1w': 7 * 24 * 60 * 60 * 1000 };

export function barredNow(acct, now = Date.now()) {
  const b = acct && acct.bar;
  return !!b && (b.until === 0 || b.until > now);
}

/* What the desk is told about a bar that holds now: when it ends, or 0. */
export function shapeBar(acct, now = Date.now()) {
  return barredNow(acct, now) ? { until: acct.bar.until } : null;
}

/* What the person is told, after their right password: how much longer, in
   words that need no time zone, because the server does not know theirs. */
export function barWords(bar, now = Date.now()) {
  if (!bar || bar.until === 0) return 'A moderator has banned this username, so it cannot sign on to the CB. If you think that is a mistake, reach us privately at stimpunks.org/contact.';
  const left = Math.max(0, bar.until - now);
  const mins = Math.ceil(left / 60000), hours = Math.ceil(left / 3600000), days = Math.ceil(left / 86400000);
  const span = mins < 90 ? `${mins} more minute${mins === 1 ? '' : 's'}`
    : hours < 48 ? `${hours} more hours` : `${days} more days`;
  return `A moderator has timed this username out, so it cannot sign on to the CB for ${span}. If you think that is a mistake, reach us privately at stimpunks.org/contact.`;
}

export async function kickAccount(handle, s = store()) {
  const next = await updateAccount(handle, (a) => ({ ...a, v: a.v + 1 }), s);
  return next ? { kicked: true } : { error: 'That username has not been claimed.' };
}

/* Time out (until a time) or ban (until 0). */
export async function barAccount(handle, until, s = store()) {
  if (!(until === 0 || (Number.isFinite(until) && until > 0))) return { error: 'For how long?' };
  const next = await updateAccount(handle, (a) => ({ ...a, v: a.v + 1, bar: { until } }), s);
  return next ? { bar: { until } } : { error: 'That username has not been claimed.' };
}

/* Take a bar off: a moderator lifting it, or signing on once a time out has
   ended (with `now`, which leaves a bar that still holds alone). */
export async function liftBar(handle, s = store(), now = null) {
  let had = false;
  const next = await updateAccount(handle, (a) => {
    if (!a.bar || (now !== null && barredNow(a, now))) return null;
    had = true;
    const n = { ...a };
    delete n.bar;
    return n;
  }, s);
  return next ? { lifted: had } : { error: 'That username has not been claimed.' };
}

/* ── The moderators' directory ────────────────────────────────────────

   Ryan's ask and call, 2026-10-22, REVERSING "there is no list of everybody,
   for moderators or anybody": moderators asked for it for safeguarding, and
   what they should know is what they could tell at a glance if we were all in
   one room together, the way Discord lists everybody on a server. So the
   moderators' desk, and nothing else, lists every username, how many there
   are, and who is seen in a room now.

   EACH NAME IS ITS HANDLE, AND ONLY WHAT THE DESK ALREADY HAD: whether it is a
   moderator's, whether it is timed out or banned now, and the rooms it is seen
   in, which come from whoSeen with the moderator's own pass, so only somebody
   who pressed Be seen here is seen, a room that keeps to itself is never named,
   and somebody seen only there is not seen here. Never when a username was
   claimed: "member since" is the ranking the profile cards refuse, and in a
   room you could not tell. Never an email address, a role beyond moderator, or
   anything else from the record. Nothing is kept for it, and nothing records
   who looked. The counts are for moderators only: Ryan's call is that the
   street's rule against counting people is about its public surfaces. */
export async function accountDirectory(who, s = store(), now = Date.now(), mods) {
  if (mods === undefined) mods = await loadMods();
  const keys = ((await s.list({ prefix: 'acct/' })).blobs || []).map((b) => b.key);
  const accts = [];
  for (let i = 0; i < keys.length; i += 16) {
    const got = await Promise.all(keys.slice(i, i + 16).map((k) => s.get(k, { type: 'json' }).catch(() => null)));
    for (const a of got) if (a && typeof a.hash === 'string' && typeof a.handle === 'string') accts.push(a);
  }
  const seenIn = new Map();
  for (const p of await whoSeen(who, s, now)) seenIn.set(foldHandle(p.handle), p.rooms);
  const people = accts.map((a) => {
    const k = foldHandle(a.handle), bar = shapeBar(a, now);
    return { handle: a.handle, mod: !!(mods && mods.has(k)), bar, rooms: seenIn.get(k) || [] };
  }).sort((x, y) => x.handle.localeCompare(y.handle));
  return { people, count: people.length, seen: people.filter((p) => p.rooms.length).length };
}

/* What a radio is told about its own pass: which of the rooms that need a role
   it may go into, so the page can keep quiet in the others. */
export function rolesOf(who) { return who && who.roles ? [...who.roles].sort() : []; }

/* ── An email address for recovery, if you give one ───────────────────────

   Ryan's call, 2026-10-21: an account may keep one email address, for one
   thing: sending its owner a reset code when they ask for one at the front
   desk. It is never shown to anybody else, moderators included, never used
   for anything else, and goes with the account.

   IT GOES OUT THROUGH THE TEAM MAILBOX (Ryan's choice the same day, over a
   mail service of its own and over moderators sending codes by hand): the
   office's outbox hands the mailbox's script each reset email with the
   mailings', the script sends it from the mailbox within ten minutes, and the
   office forgets it once the script says it went. So recovery by email works
   only while the office's key and the mailbox's key are both set (emailOn),
   the address is sealed with the office's key, and the email the mailbox sent
   is never filed in the office, even when its address is a contact's
   (officeMailIn). What the mailbox keeps is its Sent folder, which is why the
   code works for an hour and not a day.

   ASKING NEVER SAYS WHETHER IT WORKED. The front desk answers the same
   sentence whether the username has that address on it, a different one, or
   none, so nobody can use it to learn somebody's address or whether they gave
   one. One reset email a quarter of an hour, per username. */
export const ACCT_MAIL_FOR = 60 * 60 * 1000;
export const ACCT_MAIL_GAP = 15 * 60 * 1000;
export const ACCT_MAIL_SUBJECT = 'Your Stimpunks.World reset code';
const ACCT_OUTBOX = 'acct-outbox';

export function emailOn() { return mailReady(); }

/* An address as somebody typed it, trimmed and lowercased, or null. */
export function cleanAddress(v) {
  const a = String(v == null ? '' : v).trim().toLowerCase();
  return a && a.length <= 254 && EMAIL.test(a) ? a : null;
}

/* What claiming or changing an address keeps: null for none, the sealed
   address, or { error }. */
async function recoveryBox(email) {
  if (email == null || String(email).trim() === '') return null;
  const to = cleanAddress(email);
  if (!to) return { error: 'That does not look like an email address. Leave it empty if you would rather not give one.' };
  if (!emailOn()) return { error: 'Recovery by email is not switched on yet, so leave the email address empty for now. Your recovery code is the way back in.' };
  return { sealed: seal({ email: to }) };
}

/* The address an account keeps, for its owner's own Account and for sending
   the reset, and nobody else. */
export function accountEmail(a) {
  if (!a || !a.email) return null;
  try { return unseal(a.email).email || null; } catch (e) { return null; }
}

/* Set, change or take off the address, with the account's password. A new
   address cancels any reset code already emailed to the old one. */
export async function setAccountEmail(handle, password, email, s = store(), now = Date.now()) {
  const ok = await checkPassword(handle, password, s, now);
  if (ok.error) return ok;
  const box = await recoveryBox(email);
  if (box && box.error) return box;
  const next = await updateAccount(handle, (a) => {
    const n = { ...a };
    if (box) n.email = box.sealed; else delete n.email;
    delete n.mailed;
    return n;
  }, s);
  return next ? { email: accountEmail(next) } : { error: 'That username has not been claimed.' };
}

export function resetMailText(handle, code) {
  return [
    `Somebody asked for a reset code for the username ${handle} on the CB at Stimpunks.World, with this email address.`,
    '',
    `The reset code: ${code}`,
    '',
    'It works for an hour, at the front desk in the Community Center, under "Forgotten your password?", where you choose a new password with it:',
    'https://stimpunks.world/community-center.html#cb-signon-desk',
    '',
    'If it was not you, there is nothing to do: your password has not changed, and the code stops working in an hour.',
    '',
    'Stimpunks.World',
  ].join('\n');
}

/* "Email me a reset code": made and put in the outbox only when the username
   has exactly that address on it and none was sent in the last quarter of an
   hour. The answer is the same either way. A code by email does not sign
   anybody off until it is used, so asking for one cannot be used to throw
   somebody off the CB. */
export async function mailResetCode(handle, email, s = store(), now = Date.now()) {
  if (!emailOn()) return { off: true };
  const want = cleanAddress(email);
  const acct = want ? await readAccount(handle, s) : null;
  const had = accountEmail(acct);
  if (!had || had !== want) return {};
  if (acct.mailed && acct.mailed.t > now - ACCT_MAIL_GAP) return {};
  const code = makeCode(), rs = salt();
  const next = await updateAccount(handle, (a) => ({ ...a, mailed: { hash: scrypt(cleanCode(code), rs), salt: rs, until: now + ACCT_MAIL_FOR, t: now } }), s);
  if (!next) return {};
  await updateSealed(ACCT_OUTBOX, (was) => {
    const list = (was && Array.isArray(was.emails) ? was.emails : []).filter((e) => e.until > now);
    return { emails: [...list, { id: newOutboxId(), to: had, subject: ACCT_MAIL_SUBJECT, body: resetMailText(acct.handle, code), until: now + ACCT_MAIL_FOR }].slice(-OUTBOX_BATCH) };
  }, s);
  return {};
}

async function readAcctOutbox(s, now) {
  const d = await readSealed(ACCT_OUTBOX, s);
  return (d && Array.isArray(d.emails) ? d.emails : []).filter((e) => e.until > now);
}

/* ── Invites ───────────────────────────────────────────────────────────────

   Ryan's brief, 2026-10-21: the starter password becomes an invite code
   system. A moderator makes an invite at the desk in the Moderators' room and
   shares its link, join.html#invite=<code>, which opens the joining page with
   the code filled in; there a newcomer chooses their username and a password
   of their own, and is on the CB with a claimed username from their first
   minute. The link carries the code after the #, so it never reaches a server
   as an address.

   AN INVITE IS A CODE, A NOTE, WHO MADE IT AND WHEN, WHEN IT RUNS OUT AND HOW
   MANY TIMES IT MAY BE USED, AND HOW MANY TIMES IT HAS BEEN. Numbers are fine
   at the desk (Ryan's call of 2026-10-20 about backend tools). What is never
   kept is who joined with which invite: an invite counts its uses, and the
   usernames made with it are not written down anywhere, because a list of who
   came in through whose invite is a register of our community by sponsor.
   The friendly edit is "invited by" on a profile, Discord's; it is that list.

   ONE BLOB HOLDS THEM ALL (`invites`), written with the boards' conditional
   write. A use is RESERVED before the username is claimed and given back if
   the claim fails, so fifteen people at an invite with one use left cannot
   all get in. Deleting an invite stops it at once; the usernames made with it
   stay. An invite that ran out leaves the list a month later.

   A MODERATOR'S USERNAME NEEDS NO INVITE, AND NO INVITE IS ENOUGH FOR ONE
   (Ryan's brief): it is claimed only with the moderators' password, which is
   what proves whose it is. */
export const INVITE_KEEP = 100;
export const INVITE_NOTE_MAX = 80;
export const INVITE_USES = [1, 5, 10, 25, 50, 100, 0];   // 0: no limit
export const INVITE_DAYS = [1, 7, 30, 0];                // 0: never runs out
export const INVITE_LINK = 'https://stimpunks.world/join.html#invite=';
/* The invite a director makes from the office, writing to one person with a
   template that has {invite} in it (writeInvite, Ryan's ask, 2026-10-23): it
   works once, runs out in thirty days, and its note says nothing about whom. */
export const OFFICE_INVITE = { note: 'Made in the office, for one person', most: 1, days: 30 };
const INVITE_DROP = 30 * 24 * 60 * 60 * 1000;
const INVITES = 'invites';
const DAY_MS = 24 * 60 * 60 * 1000;

export function inviteId(v) { return typeof v === 'string' && /^i[A-Za-z0-9_-]{8}$/.test(v) ? v : null; }
export function makeInviteCode(bytes) { return makeCode(bytes).slice(0, 14); }

function inviteState(inv, now) {
  if (inv.until && inv.until <= now) return 'ended';
  if (inv.most && inv.used >= inv.most) return 'used';
  return 'open';
}
/* When an invite stopped working, if it has, for dropping it a month later:
   when it ran out of time or was used for the last time, whichever was first. */
function inviteEnded(inv, now) {
  const t = Math.min(inv.until || Infinity, inv.full || Infinity);
  return t <= now ? t : null;
}

export async function readInvites(s = store()) {
  const d = await s.get(INVITES, { type: 'json' });
  return d && Array.isArray(d.invites) ? d.invites : [];
}

async function updateInvites(change, s) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cur = await versioned(s, INVITES);
    const list = cur.exists && cur.data && Array.isArray(cur.data.invites) ? cur.data.invites : [];
    const next = change(list.slice());
    if (next === null) return list;
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(INVITES, { invites: next }, opts);
    if (res.modified) return next;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error('busy');
}

/* What the desk is told about one: everything but nothing about who used it. */
export function shapeInvite(inv, now = Date.now()) {
  return { id: inv.id, code: inv.code, note: inv.note || '', by: inv.by, made: inv.made, until: inv.until || null,
    most: inv.most || null, used: inv.used || 0, state: inviteState(inv, now) };
}

export async function listInvites(who, s = store(), now = Date.now()) {
  if (!who || who.role !== 'base') return { error: 'Only a moderator can see the invites.' };
  return { invites: (await readInvites(s)).slice().sort((a, b) => b.made - a.made).map((i) => shapeInvite(i, now)) };
}

export async function makeInvite(who, { note, most, days } = {}, s = store(), now = Date.now(), bytes) {
  if (!who || who.role !== 'base') return { error: 'Only a moderator can make an invite.' };
  const n = note == null ? '' : tidy(note);
  if ([...n].length > INVITE_NOTE_MAX) return { error: `A note is up to ${INVITE_NOTE_MAX} characters.` };
  const uses = Number(most), span = Number(days);
  if (!INVITE_USES.includes(uses)) return { error: 'How many times may it be used?' };
  if (!INVITE_DAYS.includes(span)) return { error: 'When does it run out?' };
  const inv = { id: 'i' + randomBytes(6).toString('base64url'), code: makeInviteCode(bytes), note: n, by: who.handle,
    made: now, until: span ? now + span * DAY_MS : 0, most: uses, used: 0 };
  let full = false;
  await updateInvites((list) => {
    full = false;
    const kept = list.filter((i) => { const e = inviteEnded(i, now); return !(e && e <= now - INVITE_DROP); });
    if (kept.length >= INVITE_KEEP) { full = true; return null; }
    return [...kept, inv];
  }, s);
  if (full) return { error: `There are ${INVITE_KEEP} invites already. Delete some that are finished with first.` };
  return { invite: shapeInvite(inv, now) };
}

export async function deleteInvite(who, id, s = store()) {
  if (!who || who.role !== 'base') return { error: 'Only a moderator can delete an invite.' };
  const k = inviteId(id);
  if (!k) return { error: 'Which invite?' };
  let had = false;
  await updateInvites((list) => {
    had = list.some((i) => i.id === k);
    return had ? list.filter((i) => i.id !== k) : null;
  }, s);
  return had ? { gone: true } : { error: 'That invite has already been deleted.' };
}

function findInvite(list, code) {
  const c = cleanCode(code);
  if (c.length !== 12) return null;
  return list.find((i) => same(cleanCode(i.code), c)) || null;
}
function inviteWhy(inv, now) {
  if (!inv) return 'That is not an invite code we know. Check it against the link or the message it came in, or ask whoever gave it to you.';
  const st = inviteState(inv, now);
  if (st === 'ended') return 'That invite has run out of time. Ask whoever gave it to you for another.';
  if (st === 'used') return 'That invite has been used as many times as it was made for. Ask whoever gave it to you for another.';
  return null;
}

/* Whether a code works, for the joining page before anybody types more. */
export async function checkInvite(code, s = store(), now = Date.now()) {
  const inv = findInvite(await readInvites(s), code);
  const why = inviteWhy(inv, now);
  return why ? { ok: false, why } : { ok: true, until: inv.until || null };
}

/* Take one use of an invite, or say why not. */
async function useInvite(code, s, now) {
  let why = null, id = null;
  await updateInvites((list) => {
    why = null; id = null;
    const inv = findInvite(list, code);
    why = inviteWhy(inv, now);
    if (why) return null;
    id = inv.id;
    const used = (inv.used || 0) + 1;
    return list.map((i) => (i.id === inv.id ? { ...i, used, ...(i.most && used >= i.most ? { full: now } : {}) } : i));
  }, s);
  return why ? { error: why } : { id };
}
async function giveBackInvite(id, s) {
  await updateInvites((list) => {
    if (!list.some((i) => i.id === id)) return null;
    return list.map((i) => {
      if (i.id !== id) return i;
      const n = { ...i, used: Math.max(0, (i.used || 0) - 1) };
      delete n.full;
      return n;
    });
  }, s);
}

/* What the joining page may know about a username before it is claimed:
   whether it is free, and whether it is a moderator's, so the page can ask for
   the moderators' password. Both are already plain on the CB. */
export async function checkHandle(handle, mods, s = store()) {
  if (mods === undefined) mods = await loadMods();
  const h = cleanHandle(handle);
  if (!h) return { ok: false, why: `A username is between one and ${HANDLE_MAX} characters.` };
  if (roleWord(h)) return { ok: false, taken: true, why: ROLE_WORD };
  if (botWord(h)) return { ok: false, taken: true, why: BOT_WORD };
  const m = mods && mods.get(foldHandle(h));
  if (await readAccount(m ? m.handle : h, s)) return { ok: false, taken: true, mod: !!m, why: 'That username has been claimed already. Pick another.' };
  return { ok: true, mod: !!m, handle: m ? m.handle : h };
}

/* JOINING: an invite (or, for a moderator's username, the moderators'
   password), a username, a password of your own, and an email address if you
   want one for recovery. The answer is what signing on answers, and the
   recovery code, shown once. */
export async function joinAccount({ invite, handle, modPassword, password, email } = {}, mods, s = store(), now = Date.now()) {
  if (mods === undefined) mods = await loadMods();
  const h = cleanHandle(handle);
  if (!h) return { error: `A username is between one and ${HANDLE_MAX} characters.` };
  if (roleWord(h)) return { error: ROLE_WORD, taken: true };
  if (botWord(h)) return { error: BOT_WORD, taken: true };
  // FAIL CLOSED: with no readable list, a moderator's username cannot be told
  // from anybody's, and an invite could claim one.
  if (!mods) return { error: 'Joining is switched off until the moderators\' list can be read, so that nobody claims a moderator\'s username by mistake. Tell Ryan or Helen.' };
  const m = mods.get(foldHandle(h));
  if (m) {
    const mod = secretFor('base');
    if (!mod || !same(modPassword == null ? '' : modPassword, mod)) {
      return { error: 'That username is on the moderators\' list, so it is claimed only with the moderators\' password as well. Type that too, or pick another username.', mod: true };
    }
  }
  const name = m ? m.handle : h;
  if (await readAccount(name, s)) return { error: 'That username has been claimed already. Pick another.', taken: true };
  // Checked before an invite's use is taken, so a password or an address
  // somebody needs to fix costs nobody a use.
  if (!ownPassword(password)) return { error: `A password of your own is between ${ACCT_PW_MIN} and ${ACCT_PW_MAX} characters. A few words you will remember is fine.` };
  const box = await recoveryBox(email);
  if (box && box.error) return box;
  let used = null;
  if (!m) {
    used = await useInvite(invite, s, now);
    if (used.error) return { error: used.error, invite: true };
  }
  const c = await claimAccount(name, password, s, now, mods, !!m, email);
  if (c.error) {
    if (used) await giveBackInvite(used.id, s);
    return c;
  }
  return { ...accountAnswer(c.handle, c.v, mods), recovery: c.recovery };
}

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

/* Inline Markdown into nodes: text, b, i, s, code, a, br, and, where the
   caller asks (ctx.refs), ref: a link to a task, a topic or a record of the
   office, [[task:<id>]], which a page draws with the name its reader may see. */
function brassInline(src, depth = 0, ctx = null) {
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
    if (c === '[' && src[i + 1] === '[' && ctx && ctx.refs) {
      const r = LINK_AT.exec(src.slice(i));
      if (r && LINK_KINDS[r[1]].ok(r[2])) { push({ t: 'ref', kind: r[1], id: r[2] }); i += r[0].length; continue; }
    }
    if (c === '[' && depth < 4) {
      const close = matchBracket(src, i);
      if (close > 0 && src[close + 1] === '(') {
        const pe = src.indexOf(')', close + 2);
        if (pe > 0) {
          const target = src.slice(close + 2, pe).trim().replace(/\s+"[^"]*"$/, '');
          const href = brassHref(target.replace(/^<(.*)>$/, '$1'));
          if (href) { push({ t: 'a', href, c: brassInline(src.slice(i + 1, close), depth + 1, ctx) }); i = pe + 1; continue; }
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
        if (j > 0) { push({ t: kind, c: brassInline(src.slice(i + delim.length, j), depth + 1, ctx) }); i = j + delim.length; continue; }
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
      out.push({ t: 'h', level: m[1].length, c: brassInline(m[2] || '', 0, ctx) });
      i++; continue;
    }
    if (/^ {0,3}([-*_])( *\1){2,} *$/.test(line)) { out.push({ t: 'hr' }); i++; continue; }
    if (/^ {0,3}>/.test(line)) {
      const body = [];
      while (i < lines.length && (/^ {0,3}>/.test(lines[i]) || (lines[i].trim() && !isBlockStart(lines[i]) && body.length && body[body.length - 1].trim()))) {
        body.push(lines[i].replace(/^ {0,3}> ?/, ''));
        i++;
      }
      out.push({ t: 'quote', c: depth < 8 ? brassBlocks(body, depth + 1, ctx) : [{ t: 'p', c: brassInline(body.join('\n'), 0, ctx) }] });
      continue;
    }
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const head = tableCells(line);
      const align = tableCells(lines[i + 1]).map((c) => (/^:-+:$/.test(c) ? 'center' : /-+:$/.test(c) ? 'right' : /^:-+/.test(c) ? 'left' : ''));
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim() && lines[i].includes('|')) rows.push(tableCells(lines[i++]));
      out.push({ t: 'table', align: head.map((_, k) => align[k] || ''),
        head: head.map((c) => brassInline(c, 0, ctx)), rows: rows.map((r) => head.map((_, k) => brassInline(r[k] || '', 0, ctx))) });
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
        const bx = ctx && ctx.boxes && /^\[([ xX])\](?: +(.*)|$)/.exec(it[4]);
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
        items.push(depth < 8 ? brassBlocks(body, depth + 1, ctx) : [{ t: 'p', c: brassInline(body.join('\n'), 0, ctx) }]);
        while (i < lines.length && !lines[i].trim() && i + 1 < lines.length && LIST_ITEM.test(lines[i + 1])) i++;
      }
      const list = ordered ? { t: 'ol', start, items } : { t: 'ul', items };
      if (boxes.some(Boolean)) list.box = boxes;
      out.push(list);
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !(para.length && isBlockStart(lines[i]))) para.push(lines[i++].trim());
    out.push({ t: 'p', c: brassInline(para.join('\n'), 0, ctx) });
  }
  return out;
}

/* opts: { boxes } for a task's checkboxes, { refs } for links to tasks,
   topics and the office's records, which every page with them names per reader. */
export function parseBrass(body, opts = null) {
  const ctx = opts && (opts.boxes || opts.refs) ? { boxes: opts.boxes ? [] : null, refs: !!opts.refs } : null;
  return brassBlocks(String(body || '').split('\n'), 0, ctx);
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

/* ── The notice ──────────────────────────────────────────────────────────────

   Ryan's ask, 2026-10-23: a public notice along the top of the street's front
   page, the Community Center, the forums and the office's dashboard, put up
   from the desk in the Moderators' room, with sparkle and a fanfare at MAX
   GLITTER (notice.js and notice.css draw it). The Brass Tacks Board is where
   notices are kept; this is one line for everybody, at the top, for as long as
   a moderator leaves it up.

   ONE NOTICE AT A TIME, IN ONE BLOB (`notice`): its words, and which moderator
   put it up or took it down last and when, which only the desk is told. A new
   one replaces the old, and nothing is archived. Every page is sent the words
   and nothing else (shapeNotice), with an id worked out from the words alone.

   A VISITOR CAN PUT IT AWAY (Ryan's call, the same day), and their browser
   keeps the notice's id under love-notice until a new notice goes up. The id
   is a hash of the words, so it needs nothing stored here and says nothing
   about who or when; changing even a letter makes a new notice, which shows
   again to everybody who put the old one away.

   ONE LINE OF MARKDOWN, READ HERE ONCE by parseBrass, the board's reader:
   bold, italic, code and links, and never a heading, a list, a quote or a
   table, because a banner is a sentence or two and the pages draw it as one
   paragraph on the readout. NOTICE_MAX counts the Markdown too.

   THE FIRST NOTICE CAME WITH THE SITE (NOTICE_FIRST, Ryan's words). It is what
   the pages are told while the blob does not exist, so it was up the moment
   this shipped, with nobody signing on to put it there. Changing it or taking
   it down at the desk writes the blob, and from then on the blob is the
   notice: taking one down writes that there is none rather than deleting, so
   the first notice never comes back by itself. */
export const NOTICE_MAX = 280;
export const NOTICE_SHAPE = `A notice is one line of up to ${NOTICE_MAX} characters, Markdown included: words, **bold**, *italic* and [links](https://example.org/), with no heading, list or quote.`;
const NOTICE = 'notice';
export const NOTICE_FIRST = Object.freeze({ text: 'Our own Rando Calrissian launches [Cloud Services](https://randocloud.cloud/).', by: null, t: null });

export function cleanNotice(v) {
  const t = cleanBrassBody(v, NOTICE_MAX);
  if (!t || t.includes('\n')) return null;
  const ast = parseBrass(t);
  return ast.length === 1 && ast[0].t === 'p' ? t : null;
}

function noticeUp(d) { return !!(d && typeof d.text === 'string' && d.text); }

/* The notice as kept: { text, by, t }, text null when none is up. */
export async function readNotice(s = store()) {
  const d = await s.get(NOTICE, { type: 'json' });
  if (!d || typeof d !== 'object') return NOTICE_FIRST;
  return { text: noticeUp(d) ? d.text : null, by: typeof d.by === 'string' ? d.by : null, t: typeof d.t === 'number' ? d.t : null };
}

/* The id a browser keeps when somebody puts a notice away: the words' hash. */
export function noticeId(text) { return createHash('sha256').update(String(text)).digest('hex').slice(0, 16); }

/* What every page is told: the words, read into nodes, their id, and nothing about who. */
export function shapeNotice(d) {
  return noticeUp(d) ? { id: noticeId(d.text), text: d.text, ast: parseBrass(d.text) } : null;
}

/* A moderator putting a notice up, replacing the one up now. { notice } or { error }. */
export async function setNotice(who, text, s = store(), now = Date.now()) {
  if (!who || who.role !== 'base') return { error: 'Only a moderator can put up the notice.' };
  const t = cleanNotice(text);
  if (!t) return { error: NOTICE_SHAPE };
  const next = { text: t, by: who.handle, t: now };
  await updateDoc(NOTICE, () => next, s);
  return { notice: next };
}

/* A moderator taking it down. { cleared } or { error }. */
export async function clearNotice(who, s = store(), now = Date.now()) {
  if (!who || who.role !== 'base') return { error: 'Only a moderator can take the notice down.' };
  let was = false;
  await updateDoc(NOTICE, (cur) => {
    was = noticeUp(cur || NOTICE_FIRST);
    return was ? { text: null, by: who.handle, t: now } : null;
  }, s);
  return was ? { cleared: true } : { error: 'There is no notice up.' };
}

/* ── The suggestion box ───────────────────────────────────────────────────

   The Sandbox. Ryan's brief, 2026-10-13: in its suggestion box,
   anybody signed on to the CB can post a suggestion, a feature request or a bug
   report, and a moderator marks it done or not doing, with a reply. It is the
   Brass Tacks Board turned round: anybody reads it, anybody signed on writes on
   it, and the moderators answer.

   EVERY SUGGESTION HAS A THREAD OF REPLIES (Ryan's ask, 2026-10-25), from our
   moderators and from whoever dropped it in, as many as it takes, up to
   SUGGEST_REPLIES: who may reply is canTakeOff's rule on the suggestion, which
   is exactly those two. Only a moderator's reply can mark it done, not doing
   or open again, and THE STATUS IS NEVER KEPT APART FROM THE REPLIES: it is
   the newest reply that marked it, or open, worked out on every read, so
   taking that reply down takes its mark with it and nothing can say done
   without the reply that says why. A reply is edited only by whoever wrote it
   (canEdit) and taken down by them or any moderator (canTakeOff). Until then a
   suggestion had one answer, which a new one replaced; threadOf() reads an old
   one as the first reply, and the next write keeps it that way.

   ONE BLOB HOLDS EVERY SUGGESTION (`suggestions`, newest first), written with
   the boards' conditional write, and SUGGEST_KEEP at most: a full box refuses
   the next one and says so, rather than quietly pushing the oldest out. A
   suggestion is kept until it is taken down, by whoever posted it (the CB's own
   rule for a message, canTakeOff) or by any moderator. There is no other copy.

   THE HANDLE IS ON THE SUGGESTION, PUBLIC, and so is every reply's, so anybody
   can see who asked and who answered.

   ME TOO SAYS A SUGGESTION AFFECTS YOU TOO, AND IT IS NOT A VOTE (Ryan's ask,
   2026-10-25: most suggestion software offers upvoting, and this box will not
   be a vote or a count). It is the reactions' rule: a Me too names who,
   alphabetically, and never says how many, so the box shows people a
   suggestion reaches, not a score. Anybody signed on presses it, and presses
   it again to take it back; whoever dropped it in has no Me too, because it is
   theirs already. Nothing sorts by it and nothing adds it up: the friendly
   edits are a number beside it and an order by it, and either makes the box
   the league table it refuses. The marks beside them
   come from the pass, as on the channel: BASE for a moderator, CLAIMED for a
   claimed username, and nobody can set either on a suggestion themselves.

   THE WORDS ARE THE BOARD'S MARKDOWN, read here once into nodes by parseBrass,
   never into HTML, and built on the page with textContent.

   A SUGGESTION AND A REPLY CAN EACH CARRY PICTURES (Ryan's call, 2026-10-25,
   reversing words only, so a bug can come with its screenshot). The board's
   pipeline with one difference: anybody signed on adds them, not only a
   moderator. Each is redrawn in the sender's browser (window.loveRedraw in
   cb.js) and refused here if it still carries camera data; each needs a
   description; and the form asks the sender to say they have looked at all of
   it, because a screenshot is a picture of somebody's screen, other people's
   messages included. An upload waits under suggest-img/, marked with its
   sender's mark so nobody else can put it in the box, and is served to anybody
   ONLY WHILE A SUGGESTION OR A REPLY HOLDS IT, so a picture added and never
   dropped in is never public, and one taken down stops being served at once.
   It goes when what holds it goes; one nothing holds is swept after a day. */
export const SUGGEST_KINDS = ['suggestion', 'feature', 'bug'];
export const SUGGEST_TITLE_MAX = 120;
export const SUGGEST_BODY_MAX = 4000;
export const SUGGEST_REPLY_MAX = 2000;
export const SUGGEST_KEEP = 300;
export const SUGGEST_REPLIES = 50;       // replies under one suggestion
export const SUGGEST_METOO = 300;        // handles a Me too can hold
export const SUGGEST_STATUSES = ['open', 'done', 'denied'];
export const SUGGEST_PICS = 4;           // pictures on a suggestion, and on a reply
export const SUGGEST_ALT_MAX = 600;      // characters of a picture's description, which is needed
const SUGGEST = 'suggestions';
const SUGGEST_IMG = 'suggest-img/';
const SUGGEST_IMG_UNSENT = 24 * 60 * 60 * 1000;

function cleanSuggestBody(v, max) {
  const t = cleanBrassBody(v);
  return t && [...t].length <= max ? t : null;
}

/* Every suggestion, newest first. */
export async function readSuggestions(s = store()) {
  const d = await s.get(SUGGEST, { type: 'json' });
  return (d && Array.isArray(d.items)) ? d.items : [];
}

const shapePics = (list) => list.map((x) => ({ id: x.id, alt: x.alt }));

/* A suggestion's replies, oldest first. One from before the thread had a
   single answer from a moderator, which is read as its first reply. */
function threadOf(p) {
  if (Array.isArray(p.replies)) return p.replies;
  if (!p.answer) return [];
  const a = p.answer;
  const r = { id: 'a' + p.id, body: a.body, handle: a.handle, t: a.t, base: true };
  if (a.status === 'done' || a.status === 'denied') r.status = a.status;
  if (Array.isArray(a.pics) && a.pics.length) r.pics = a.pics;
  return [r];
}
function threaded(p, replies) {
  const next = { ...p, replies };
  delete next.answer;
  return next;
}
/* Where it stands: the newest reply that marked it, or open. */
export function suggestStatus(replies) {
  for (let i = replies.length - 1; i >= 0; i--) if (replies[i].status) return replies[i].status;
  return 'open';
}
function replyId(v) { return typeof v === 'string' && /^a?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v) ? v : null; }

export function shapeSuggestion(p) {
  const replies = threadOf(p);
  const out = { id: p.id, kind: p.kind, title: p.title, body: p.body, ast: parseBrass(p.body),
    handle: p.handle, t: p.t, status: suggestStatus(replies) };
  if (p.base) out.base = true;
  else if (p.claimed) out.claimed = true;
  if (Array.isArray(p.pics) && p.pics.length) out.pics = shapePics(p.pics);
  // Who says it affects them too, alphabetically. Names, never how many.
  if (Array.isArray(p.metoo) && p.metoo.length) out.metoo = [...p.metoo].sort((a, b) => foldHandle(a).localeCompare(foldHandle(b)));
  out.replies = replies.map((r) => {
    const o = { id: r.id, body: r.body, ast: parseBrass(r.body), handle: r.handle, t: r.t };
    if (r.base) o.base = true;
    else if (r.claimed) o.claimed = true;
    if (r.status) o.status = r.status;
    if (typeof r.edited === 'number') o.edited = r.edited;
    if (Array.isArray(r.pics) && r.pics.length) o.pics = shapePics(r.pics);
    return o;
  });
  return out;
}

/* Every picture a suggestion holds, its replies' included. */
function suggestionPics(p) {
  return [...(p.pics || []), ...threadOf(p).flatMap((r) => r.pics || [])].map((x) => x.id);
}

/* Whose an upload is: the folded name and when it was claimed. Never sent. */
function suggestMark(who) {
  return createHash('sha256').update(`suggest-pic|${foldHandle(who.handle)}|${who.since || ''}`).digest('base64url');
}

/* The pictures a suggestion or a reply asks for (a list of { id, alt }):
   the ones it already had, kept, and this sender's own uploads. { pics, fresh }
   or { error }; fresh is the ids that were not there before, which the write
   checks nothing else in the box holds. */
async function suggestPics(who, f, had, s) {
  const asked = Array.isArray(f && f.pics) ? f.pics : [];
  if (!asked.length) return { pics: [], fresh: [] };
  if (asked.length > SUGGEST_PICS) return { error: `Up to ${SUGGEST_PICS} pictures go with each one.` };
  const mark = suggestMark(who);
  const pics = [], fresh = [], ids = new Set();
  for (const a of asked) {
    const id = imageId(a && a.id);
    if (!id || ids.has(id)) return { error: 'One of those pictures is not ready. Take it off and add it again.' };
    ids.add(id);
    const t = tidy(a.alt);
    const alt = t && [...t].length <= SUGGEST_ALT_MAX ? t : null;
    if (!alt) return { error: `Say what every picture shows, in up to ${SUGGEST_ALT_MAX} characters: anybody reading the box with a screen reader hears that in its place.` };
    if (!had.includes(id)) {
      const got = await s.getWithMetadata(SUGGEST_IMG + id, { type: 'arrayBuffer' });
      if (!got || !got.metadata || got.metadata.by !== mark) return { error: 'One of those pictures is not ready. Take it off and add it again.' };
      fresh.push(id);
    }
    pics.push({ id, alt });
  }
  if (f.yes !== true) return { error: 'Say that you have looked at all of every picture, and that nothing in it is private: it goes in the box for anybody to see.' };
  return { pics, fresh };
}

/* Whether any suggestion but `except` already holds one of these ids. */
function heldElsewhere(list, ids, except) {
  if (!ids.length) return false;
  const want = new Set(ids);
  return list.some((p) => p.id !== except && suggestionPics(p).some((id) => want.has(id)));
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
  const got = await suggestPics(who, f, [], s);
  if (got.error) return got;
  const item = { id: randomUUID(), kind, title, body, handle: who.handle, t: now };
  if (who.role === 'base') item.base = true;
  else if (who.account) item.claimed = true;
  if (got.pics.length) item.pics = got.pics;
  let full = false, taken = false;
  await updateList(SUGGEST, 'items', (list) => {
    full = list.length >= SUGGEST_KEEP;
    taken = heldElsewhere(list, got.fresh, item.id);
    return full || taken ? null : [item, ...list];
  }, s);
  if (taken) return { error: 'One of those pictures is already in the box. Add it again.' };
  if (full) return { error: 'The box is full. A moderator has to take some answered ones down before another fits.' };
  return { item };
}

/* A reply, from a moderator or whoever dropped it in (canTakeOff on the
   suggestion), always with words. A moderator's can mark it done, not doing
   or open again; a mark that is where it stands already is left off.
   { item, reply } or { error }. */
export async function replySuggestion(who, id, f, s = store(), now = Date.now()) {
  if (!who) return { error: 'Sign on to the CB to reply.' };
  const body = cleanSuggestBody(f && f.body, SUGGEST_REPLY_MAX);
  if (!body) return { error: `Say something, in a reply of up to ${SUGGEST_REPLY_MAX} characters.` };
  let mark = null;
  if (f.status != null && f.status !== '') {
    if (!SUGGEST_STATUSES.includes(f.status)) return { error: 'Mark it done, not doing, or open.' };
    if (who.role !== 'base') return { error: 'Only a moderator can mark it done, not doing or open.' };
    mark = f.status;
  }
  const was = (await readSuggestions(s)).find((p) => p.id === id);
  if (!was) return { error: 'That suggestion has been taken down.' };
  if (!canTakeOff(who, was)) return { error: 'Only whoever dropped it in, or a moderator, can reply to it.' };
  const got = await suggestPics(who, f, [], s);
  if (got.error) return got;
  const reply = { id: randomUUID(), body, handle: who.handle, t: now };
  if (who.role === 'base') reply.base = true;
  else if (who.account) reply.claimed = true;
  if (got.pics.length) reply.pics = got.pics;
  let why = null, done = null;
  await updateList(SUGGEST, 'items', (list) => {
    why = null; done = null;
    const k = list.findIndex((p) => p.id === id);
    if (k < 0) { why = 'That suggestion has been taken down.'; return null; }
    if (!canTakeOff(who, list[k])) { why = 'Only whoever dropped it in, or a moderator, can reply to it.'; return null; }
    const thread = threadOf(list[k]);
    if (thread.length >= SUGGEST_REPLIES) { why = `A suggestion holds ${SUGGEST_REPLIES} replies. Drop a new one in to go on.`; return null; }
    if (heldElsewhere(list, got.fresh, null)) { why = 'One of those pictures is already in the box. Add it again.'; return null; }
    const r = { ...reply };
    if (mark && mark !== suggestStatus(thread)) r.status = mark;
    done = threaded(list[k], [...thread, r]);
    const copy = list.slice(); copy[k] = done; return copy;
  }, s);
  if (why) return { error: why };
  return { item: done, reply: done.replies[done.replies.length - 1] };
}

/* Whoever wrote a reply, changing its words and its pictures (canEdit: a
   moderator's reply is not another moderator's to rewrite). A mark it made
   stays: that is something that happened. A picture let go of is deleted. */
export async function editSuggestionReply(who, id, rid, f, s = store(), now = Date.now()) {
  if (!who) return { error: 'Sign on to the CB to edit a reply.' };
  rid = replyId(rid);
  const body = cleanSuggestBody(f && f.body, SUGGEST_REPLY_MAX);
  if (!body) return { error: `Say something, in a reply of up to ${SUGGEST_REPLY_MAX} characters.` };
  const was = (await readSuggestions(s)).find((p) => p.id === id);
  const old = was && threadOf(was).find((r) => r.id === rid);
  if (!old) return { error: 'That reply has been taken down.' };
  if (!canEdit(who, old)) return { error: 'Only whoever wrote a reply can edit it.' };
  const got = await suggestPics(who, f, (old.pics || []).map((x) => x.id), s);
  if (got.error) return got;
  let why = null, done = null, dropped = [];
  await updateList(SUGGEST, 'items', (list) => {
    why = null; done = null; dropped = [];
    const k = list.findIndex((p) => p.id === id);
    const thread = k < 0 ? [] : threadOf(list[k]);
    const j = thread.findIndex((r) => r.id === rid);
    if (j < 0) { why = 'That reply has been taken down.'; return null; }
    if (!canEdit(who, thread[j])) { why = 'Only whoever wrote a reply can edit it.'; return null; }
    const had = (thread[j].pics || []).map((x) => x.id);
    // A picture kept from the reply as it was read must still be on it.
    if (got.pics.some((x) => !got.fresh.includes(x.id) && !had.includes(x.id))) { why = 'The reply changed while you were writing. Look at it again.'; return null; }
    if (heldElsewhere(list, got.fresh, null)) { why = 'One of those pictures is already in the box. Add it again.'; return null; }
    const r = { ...thread[j], body, edited: now };
    delete r.pics;
    if (got.pics.length) r.pics = got.pics;
    const keep = new Set(got.pics.map((x) => x.id));
    dropped = had.filter((x) => !keep.has(x));
    const replies = thread.slice(); replies[j] = r;
    done = threaded(list[k], replies);
    const copy = list.slice(); copy[k] = done; return copy;
  }, s);
  if (why) return { error: why };
  for (const x of dropped) await s.delete(SUGGEST_IMG + x);
  return { item: done };
}

/* Taking a reply down: whoever wrote it, or any moderator (canTakeOff). A mark
   it made goes with it, and where it stands is the reply before's again. */
export async function removeSuggestionReply(who, id, rid, s = store()) {
  if (!who) return { error: 'Sign on to the CB to take a reply down.' };
  rid = replyId(rid);
  let why = null, gone = null;
  await updateList(SUGGEST, 'items', (list) => {
    why = null; gone = null;
    const k = list.findIndex((p) => p.id === id);
    const thread = k < 0 ? [] : threadOf(list[k]);
    const r = thread.find((x) => x.id === rid);
    if (!r) { why = 'That reply has already been taken down.'; return null; }
    if (!canTakeOff(who, r)) { why = 'Only whoever wrote it, or a moderator, can take a reply down.'; return null; }
    gone = r;
    const copy = list.slice(); copy[k] = threaded(list[k], thread.filter((x) => x.id !== rid)); return copy;
  }, s);
  if (!gone) return { error: why };
  for (const x of (gone.pics || []).map((y) => y.id)) await s.delete(SUGGEST_IMG + x);
  return { removed: true };
}

/* Taking one down: whoever posted it, under canTakeOff's rule, or any moderator. */
export async function removeSuggestion(who, id, s = store()) {
  if (!who) return { error: 'Sign on to the CB to take a suggestion down.' };
  let why = null, gone = null;
  await updateList(SUGGEST, 'items', (list) => {
    why = null; gone = null;
    const p = list.find((x) => x.id === id);
    if (!p) { why = 'That suggestion has already been taken down.'; return null; }
    if (!canTakeOff(who, p)) { why = 'Only whoever posted it, or a moderator, can take it down.'; return null; }
    gone = p;
    return list.filter((x) => x.id !== id);
  }, s);
  if (!gone) return { error: why };
  for (const x of suggestionPics(gone)) await s.delete(SUGGEST_IMG + x);
  return { removed: true };
}

/* Me too: anybody signed on but whoever dropped it in, on if it was off and off
   if it was on, by the folded handle, as a reaction is. { on } or { error }. */
export async function meTooSuggestion(who, id, s = store()) {
  if (!who) return { error: 'Sign on to the CB to say this affects you too.' };
  let why = null, on = null;
  await updateList(SUGGEST, 'items', (list) => {
    why = null; on = null;
    const k = list.findIndex((p) => p.id === id);
    if (k < 0) { why = 'That suggestion has been taken down.'; return null; }
    if (foldHandle(list[k].handle) === foldHandle(who.handle)) { why = 'It is yours already, so it says it affects you.'; return null; }
    const names = (list[k].metoo || []).slice();
    const at = names.findIndex((h) => foldHandle(h) === foldHandle(who.handle));
    if (at >= 0) { names.splice(at, 1); on = false; }
    else {
      if (names.length >= SUGGEST_METOO) { why = 'No more names fit on this one. Reply to it instead, if you can.'; return null; }
      names.push(who.handle); on = true;
    }
    const next = { ...list[k] };
    if (names.length) next.metoo = names; else delete next.metoo;
    const copy = list.slice(); copy[k] = next; return copy;
  }, s);
  return why ? { error: why } : { on };
}

/* Anybody signed on, adding a picture, already redrawn in their browser. It
   waits, marked as theirs and shown to nobody, until a suggestion or an answer
   of theirs takes it. { id } or { error }. */
export async function putSuggestImage(who, bytes, s = store(), now = Date.now()) {
  if (!who) return { error: 'Sign on to the CB to put a picture in the box.' };
  if (!bytes || !bytes.length) return { error: 'There was no picture in that.' };
  if (bytes.length > IMG_MAX) return { error: 'That picture is too big, even after your browser made it smaller.' };
  const kind = imageKind(bytes);
  if (!kind) return { error: 'That is not a picture the box can show.' };
  if (carriesMetadata(bytes, kind)) return { error: 'That picture still carries its camera data. Add it again in the box, which takes that off.' };
  const id = randomUUID();
  await s.set(SUGGEST_IMG + id, bytes, { metadata: { t: now, type: kind, by: suggestMark(who) } });
  return { id };
}

/* A picture, for anybody, but only while something in the box holds it. */
export async function getSuggestImage(id, s = store()) {
  if (!imageId(id)) return null;
  if (!(await readSuggestions(s)).some((p) => suggestionPics(p).includes(id))) return null;
  const got = await s.getWithMetadata(SUGGEST_IMG + id, { type: 'arrayBuffer' });
  if (!got || !got.metadata) return null;
  return { data: got.data, meta: { type: got.metadata.type } };
}

/* Hourly: every picture nothing in the box holds, once a day has passed since
   it was added. */
export async function sweepSuggestImages(s = store(), now = Date.now()) {
  const held = new Set((await readSuggestions(s)).flatMap(suggestionPics));
  for (const b of (await s.list({ prefix: SUGGEST_IMG })).blobs || []) {
    if (held.has(b.key.slice(SUGGEST_IMG.length))) continue;
    const got = await s.getWithMetadata(b.key, { type: 'arrayBuffer' });
    const t = got && got.metadata && got.metadata.t;
    if (typeof t === 'number' && now - t < SUGGEST_IMG_UNSENT) continue;
    await s.delete(b.key);
  }
}

/* ── Events ───────────────────────────────────────────────────────────────

   Ryan's ask and calls, 2026-10-23, after Discord's Scheduled Events: anybody
   signed on schedules an event in a room they can go into, on World, or at a
   link off the street; its maker or any moderator changes it or cancels it;
   anybody who can see it says they are interested. AN EVENT NAMES WHO IS
   INTERESTED, ALPHABETICAL, AND NEVER HOW MANY, the reactions' rule (a
   reaction names who and never says how many), where Discord prints "12
   Interested" on every event. Two notifications, each off until a device
   switches it on: an event you are interested in starting, and a new event
   on World or in a room you follow. An event can repeat, every week, every
   other week, every month on the same weekday, or every weekday, and keeps
   to its maker's own clock across a change of summer time, so a coworking
   hour at seven in Colorado is at seven in Colorado in December too.

   EVERY EVENT IS IN A CHANNEL, World or a room, and the channel decides who
   sees it: roomAllows(), as for listening, so an event in the board room is
   the board's and an event in a forum category's room is that category's
   readers'. NEVER A ROOM THAT KEEPS TO ITSELF: an event is announced outside
   its room, in a list and a notification, which would name the address the
   room exists not to have. Where in the channel it happens is the room's call
   (the World call, on World), the room itself (on World, its channel), or a
   link off the street.

   ONE BLOB HOLDS EVERY EVENT (`events`), the Brass Tacks Board's arrangement,
   with the conditional write. An event is its id, its title, its words, the
   channel and where in it, the link if it is off the street, when it first
   starts as its maker's clock reads it and in which time zone, how long it
   runs, how it repeats, the starts of any times it has been cancelled, its
   maker's handle and whether they were the base, the mark of the claimed
   username that made it (authorMark, the forums', so a name deleted and
   claimed again is somebody else), and who is interested, each a handle and
   that mark. THE MARK NEVER LEAVES THE SERVER. Nothing else about when: not
   when it was made or changed, and not when anybody said they were
   interested. An event that does not repeat is shown to nobody once it ends
   and leaves the blob with the hourly sweep; a repeating one stays until its
   maker or a moderator cancels it. Forget me and deleting the username delete
   the events somebody made and take them off every list of the interested.

   A TIME IS SAID IN EACH READER'S OWN CLOCK by the radio; this answers instants
   (milliseconds since 1970), and the maker's date and time and zone only so
   that a change starts from what they typed. */
export const EVENT_TITLE_MAX = 100;
export const EVENT_ABOUT_MAX = MESSAGE_MAX;      // an event's words are a message's, Markdown and all
export const EVENTS_MAX = 300;                   // events on the street at once
export const EVENTS_PER = 20;                    // events one username has scheduled at once
export const EVENT_KEEN_MAX = 500;               // people interested in one event
export const EVENT_MINS_MIN = 5;                 // the shortest an event runs, in minutes
export const EVENT_MINS_MAX = 24 * 60;           // and the longest: a day
export const EVENT_AHEAD = 366 * 24 * 60 * 60 * 1000;   // an event first starts within the coming year
export const EVENT_REPEATS = ['', 'weekly', 'fortnightly', 'monthly', 'weekdays'];
export const EVENT_AT = ['call', 'here', 'away'];
export const EVENT_SKIPS = 20;                   // single times of a repeating event cancelled at once
export const EVENT_SOON = 5 * 60 * 1000;         // a start is told up to five minutes before it
export const EVENT_LATE = 15 * 60 * 1000;        // and up to fifteen after, if a run was missed
const EVENTS = 'events';
const EVENTS_TOLD = 'events-told';
const newEventId = () => 'e' + randomBytes(9).toString('base64url');
export function eventId(v) { return typeof v === 'string' && /^e[A-Za-z0-9_-]{12}$/.test(v) ? v : null; }

/* A time zone as the maker's browser names it, if this server knows it too. */
export function cleanZone(z) {
  if (typeof z !== 'string' || z.length > 64 || !/^[A-Za-z][A-Za-z0-9_+-]*(?:\/[A-Za-z0-9_+-]+){0,2}$/.test(z)) return null;
  try { return new Intl.DateTimeFormat('en-US', { timeZone: z }).resolvedOptions().timeZone; } catch (e) { return null; }
}

/* What a clock in `zone` reads at instant `t`: the date, the time and the
   day of the week (0 for Sunday). */
const ZONE_FMT = new Map();
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export function zoneParts(t, zone) {
  let f = ZONE_FMT.get(zone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', weekday: 'short',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
    ZONE_FMT.set(zone, f);
  }
  const p = {};
  for (const x of f.formatToParts(new Date(t))) p[x.type] = x.value;
  return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour % 24, mi: +p.minute, s: +p.second, dow: WEEKDAYS.indexOf(p.weekday) };
}
function zoneOffset(t, zone) {
  const p = zoneParts(t, zone);
  return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - Math.floor(t / 1000) * 1000;
}

/* The instant a clock in `zone` reads this date and time. In the hour a clock
   goes forward, a time that never happens is taken an hour on; in the hour it
   goes back, it is the first of the two. */
export function wallToUtc(y, mo, d, h, mi, zone) {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  let t = guess - zoneOffset(guess, zone);
  const o = zoneOffset(t, zone);
  if (guess - o !== t && zoneOffset(guess - o, zone) === o) t = guess - o;
  return t;
}

// Calendar dates as whole days since 1970, for counting days between dates.
const dayNo = (y, mo, d) => Math.round(Date.UTC(y, mo - 1, d) / DAY);
function fromDayNo(n) {
  const x = new Date(n * DAY);
  return { y: x.getUTCFullYear(), mo: x.getUTCMonth() + 1, d: x.getUTCDate(), dow: x.getUTCDay() };
}
/* Which of its weekday a date is in its month: the first to the fourth, or 5
   for the last, which is what a fifth always is. */
export function nthOf(d) { return Math.min(5, Math.ceil(d / 7)); }
function nthDay(y, mo, dow, n) {
  if (n === 5) {
    const last = new Date(Date.UTC(y, mo, 0));
    return last.getUTCDate() - ((last.getUTCDay() - dow + 7) % 7);
  }
  return 1 + ((dow - new Date(Date.UTC(y, mo - 1, 1)).getUTCDay() + 7) % 7) + (n - 1) * 7;
}

/* EVERY START OF AN EVENT that has not ended by `from`, the one going on at
   `from` included, up to `n` of them, in order. A repeating event's times are
   its first start's time of day on its maker's clock, on every date its rule
   gives, and never before its first start; a time cancelled is left out. */
export function eventStarts(ev, from, n = 1) {
  const len = ev.mins * 60000, skip = new Set(ev.skip || []), out = [];
  if (!ev.repeat) {
    if (ev.start + len > from && !skip.has(ev.start)) out.push(ev.start);
    return out;
  }
  const w = zoneParts(ev.start, ev.zone);
  const take = (date) => {
    const t = wallToUtc(date.y, date.mo, date.d, w.h, w.mi, ev.zone);
    if (t >= ev.start && t + len > from && !skip.has(t)) out.push(t);
    return out.length >= n;
  };
  const day0 = dayNo(w.y, w.mo, w.d);
  // Two days back from `from` covers every zone and an event a day long.
  const back = Math.max(day0, Math.floor(from / DAY) - 2);
  if (ev.repeat === 'weekly' || ev.repeat === 'fortnightly') {
    const step = ev.repeat === 'weekly' ? 7 : 14;
    for (let k = Math.floor((back - day0) / step), i = 0; i < 60; k++, i++) if (take(fromDayNo(day0 + k * step))) break;
  } else if (ev.repeat === 'weekdays') {
    for (let dn = back, i = 0; i < 120; dn++, i++) { const x = fromDayNo(dn); if (x.dow >= 1 && x.dow <= 5 && take(x)) break; }
  } else if (ev.repeat === 'monthly') {
    const nth = nthOf(w.d), b = fromDayNo(back);
    let y = b.y, mo = b.mo - 1;
    if (mo < 1) { mo = 12; y--; }
    if (y < w.y || (y === w.y && mo < w.mo)) { y = w.y; mo = w.mo; }
    for (let i = 0; i < 60; i++) {
      if (take({ y, mo, d: nthDay(y, mo, w.dow, nth) })) break;
      if (++mo > 12) { mo = 1; y++; }
    }
  }
  return out;
}

/* Who sees an event: a claimed username that may go into its channel. */
export function seesEvent(who, ev) {
  if (!forumReader(who) || !ev) return false;
  if (ev.room === WORLD_CALL) return true;
  return !!roomTag(ev.room) && !quietRoom(ev.room) && roomAllows(who, ev.room);
}
/* Who changes one: whoever made it, by the mark of their claimed username,
   or any moderator who can see it. */
export function mayChangeEvent(who, ev) {
  if (!seesEvent(who, ev)) return false;
  return who.role === 'base' || authorMark(who) === ev.by;
}

/* A link off the street, as an event's place: http or https, a dotted host, no
   name or password in it. Anything else is no place. */
export function cleanEventLink(v) {
  const s = String(v == null ? '' : v).trim();
  if (!s || s.length > 500 || /\s/.test(s)) return null;
  let u;
  try { u = new URL(s); } catch (e) { return null; }
  if (!/^https?:$/.test(u.protocol) || u.username || u.password || !/\./.test(u.hostname)) return null;
  return u.href;
}

/* What somebody sent for an event, checked: { ev } with exactly the parts an
   event is made of from what was typed, or { error } in words to show them. */
export function cleanEvent(b, who, now = Date.now()) {
  b = b && typeof b === 'object' ? b : {};
  const title = tidy(b.title);
  if (!title) return { error: 'An event needs a title.' };
  if ([...title].length > EVENT_TITLE_MAX) return { error: `A title is at most ${EVENT_TITLE_MAX} characters.` };
  let about = '';
  if (b.about != null && String(b.about).trim() !== '') {
    about = cleanMessage(b.about);
    if (!about) return { error: `What it is about is at most ${EVENT_ABOUT_MAX} characters.` };
  }
  const room = b.room === WORLD_CALL ? WORLD_CALL : roomTag(b.room);
  if (!room) return { error: 'Choose World or a room for it.' };
  if (room !== WORLD_CALL && quietRoom(room)) return { error: 'A room that keeps to itself has no events: an event is announced outside it.' };
  if (room !== WORLD_CALL && !roomAllows(who, room)) return { error: 'You can only schedule an event in a room you can go into.' };
  const at = EVENT_AT.includes(b.at) ? b.at : null;
  if (!at) return { error: 'Choose where it happens: in the call, in the room, or off the street.' };
  const away = at === 'away' ? cleanEventLink(b.away) : null;
  if (at === 'away' && !away) return { error: 'An event off the street needs its link, starting https://.' };
  const zone = cleanZone(b.zone);
  if (!zone) return { error: 'Your browser did not say which time zone it is in.' };
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(b.date || ''));
  const tm = /^(\d{2}):(\d{2})$/.exec(String(b.time || ''));
  if (!dm || !tm) return { error: 'An event needs a date and a time to start.' };
  const [y, mo, d, h, mi] = [+dm[1], +dm[2], +dm[3], +tm[1], +tm[2]];
  const check = new Date(Date.UTC(y, mo - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d || h > 23 || mi > 59) {
    return { error: 'That is not a date and time a clock can read.' };
  }
  const mins = Number(b.mins);
  if (!Number.isInteger(mins) || mins < EVENT_MINS_MIN || mins > EVENT_MINS_MAX) {
    return { error: `An event runs between ${EVENT_MINS_MIN} minutes and a day.` };
  }
  const repeat = EVENT_REPEATS.includes(b.repeat || '') ? (b.repeat || '') : null;
  if (repeat === null) return { error: 'That is not a way an event repeats.' };
  const start = wallToUtc(y, mo, d, h, mi, zone);
  if (repeat === 'weekdays') {
    const dow = zoneParts(start, zone).dow;
    if (dow === 0 || dow === 6) return { error: 'An event every weekday starts on a weekday.' };
  }
  if (start + mins * 60000 <= now) return { error: 'That time has already been and gone.' };
  if (start > now + EVENT_AHEAD) return { error: 'An event starts within the coming year.' };
  const ev = { title, about, room, at, start, mins, zone, repeat };
  if (away) ev.away = away;
  return { ev };
}

export async function readEvents(s = store()) {
  const d = await s.get(EVENTS, { type: 'json' });
  return d && Array.isArray(d.events) ? d.events : [];
}

/* An event as a reader is sent it, at its next time (the one going on now, if
   it is), or null once it has none. Who is interested is their handles,
   alphabetical, once each, and NEVER HOW MANY: the radio draws the names and
   nothing counts them. `mine` says whether the reader is among them and `may`
   whether they can change it. The mark is never sent. */
export function shapeEvent(ev, who, now = Date.now()) {
  const starts = eventStarts(ev, now, 4);
  if (!starts.length) return null;
  const start = starts[0], wall = zoneParts(start, ev.zone);
  const mark = forumReader(who) ? authorMark(who) : null;
  const pad = (v) => String(v).padStart(2, '0');
  const names = [...new Map((ev.keen || []).map((k) => [foldHandle(k.handle), k.handle])).values()]
    .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  const out = { id: ev.id, title: ev.title, about: ev.about || '', room: ev.room, at: ev.at,
    start, end: start + ev.mins * 60000, on: start <= now, then: starts.slice(1),
    mins: ev.mins, zone: ev.zone, repeat: ev.repeat || '',
    wall: { date: `${wall.y}-${pad(wall.mo)}-${pad(wall.d)}`, time: `${pad(wall.h)}:${pad(wall.mi)}`, dow: wall.dow, nth: nthOf(wall.d) },
    handle: ev.handle, keen: names, mine: !!mark && (ev.keen || []).some((k) => k.by === mark), may: mayChangeEvent(who, ev) };
  if (ev.base) out.base = true;
  if (ev.away) out.away = ev.away;
  if (forumRoom(ev.room)) out.place = forumPlace(ev.room);
  return out;
}

/* The rooms with a lock on them, for the radio's list of where an event can
   be: every room of the base's that is not one that keeps to itself (those
   are in no public list, and their tags are on the Town Hall's own pages), and
   which of them this pass may go into. A forum category's room the radio is
   told about only if its pass may read it, so none is here. */
export function eventRooms(who) {
  const locked = Object.keys(MOD_ROOMS).filter((t) => !quietRoom(t));
  return { locked, may: locked.filter((t) => roomAllows(who, t)) };
}

/* Every event a reader can see, the soonest first. */
export async function eventsFor(who, s = store(), now = Date.now()) {
  return (await readEvents(s)).filter((e) => seesEvent(who, e)).map((e) => shapeEvent(e, who, now)).filter(Boolean)
    .sort((a, b) => a.start - b.start || a.title.localeCompare(b.title));
}

// The events still to come or going on, which is all a write keeps.
const liveEvents = (list, now) => list.filter((e) => eventStarts(e, now).length);

/* Schedule one. Its maker is interested in it from the start, as on Discord. */
export async function makeEvent(who, b, s = store(), now = Date.now()) {
  if (!forumReader(who)) return { error: 'Only a claimed username schedules events.' };
  const c = cleanEvent(b, who, now);
  if (c.error) return c;
  const mark = authorMark(who);
  const ev = { id: newEventId(), ...c.ev, handle: who.handle, by: mark, keen: [{ handle: who.handle, by: mark }] };
  if (who.role === 'base') ev.base = true;
  let error = null;
  await updateList(EVENTS, 'events', (list) => {
    error = null;
    const live = liveEvents(list, now);
    if (live.length >= EVENTS_MAX) { error = 'The street has as many events as it holds just now. Try again once one has been.'; return null; }
    if (live.filter((e) => e.by === mark).length >= EVENTS_PER) { error = `You have ${EVENTS_PER} events scheduled, which is as many as one person can at once.`; return null; }
    return [...live, ev];
  }, s);
  return error ? { error } : { event: ev };
}

/* Change one: everything that was typed, and nothing of who made it or who is
   interested. A change to when it starts, its time zone or how it repeats
   brings back any single time that was cancelled. */
export async function editEvent(who, id, b, s = store(), now = Date.now()) {
  if (!eventId(id)) return { error: 'That event is not there any more.' };
  const c = cleanEvent(b, who, now);
  if (c.error) return c;
  let error = null, event = null;
  await updateList(EVENTS, 'events', (list) => {
    error = null;
    const i = list.findIndex((e) => e.id === id);
    if (i < 0 || !eventStarts(list[i], now).length || !seesEvent(who, list[i])) { error = 'That event is not there any more.'; return null; }
    if (!mayChangeEvent(who, list[i])) { error = 'Only whoever scheduled it, or a moderator, can change it.'; return null; }
    const was = list[i];
    const next = { ...was, ...c.ev };
    if (!c.ev.away) delete next.away;
    if (was.start !== next.start || was.zone !== next.zone || was.repeat !== next.repeat) delete next.skip;
    event = next;
    const copy = list.slice();
    copy[i] = next;
    return copy;
  }, s);
  return error ? { error } : { event };
}

/* Cancel it, every time it would have happened. */
export async function removeEvent(who, id, s = store(), now = Date.now()) {
  let error = 'That event is not there any more.';
  await updateList(EVENTS, 'events', (list) => {
    error = 'That event is not there any more.';
    const ev = list.find((e) => e.id === id);
    if (!ev || !seesEvent(who, ev)) return null;
    if (!mayChangeEvent(who, ev)) { error = 'Only whoever scheduled it, or a moderator, can cancel it.'; return null; }
    error = null;
    return list.filter((e) => e.id !== id);
  }, s);
  return error ? { error } : { removed: true };
}

/* Cancel one time a repeating event would have happened, `at`, which must be
   one of its next few. The rest go on. */
export async function skipEvent(who, id, at, s = store(), now = Date.now()) {
  let error = 'That event is not there any more.';
  await updateList(EVENTS, 'events', (list) => {
    error = 'That event is not there any more.';
    const i = list.findIndex((e) => e.id === id);
    if (i < 0 || !seesEvent(who, list[i])) return null;
    const ev = list[i];
    if (!mayChangeEvent(who, ev)) { error = 'Only whoever scheduled it, or a moderator, can cancel it.'; return null; }
    if (!ev.repeat) { error = 'It happens once, so cancel the event.'; return null; }
    if (!eventStarts(ev, now, 8).includes(at)) { error = 'That is not one of its next times.'; return null; }
    const kept = (ev.skip || []).filter((t) => t + ev.mins * 60000 > now);
    if (kept.length >= EVENT_SKIPS) { error = `At most ${EVENT_SKIPS} of its times can be cancelled at once.`; return null; }
    error = null;
    const copy = list.slice();
    copy[i] = { ...ev, skip: [...kept, at].sort((a, b) => a - b) };
    return copy;
  }, s);
  return error ? { error } : { skipped: at };
}

/* Say you are interested, or take it back. Your handle on its list, and the
   mark that says it is you; nothing about when. */
export async function keenEvent(who, id, on, s = store(), now = Date.now()) {
  if (!forumReader(who)) return { error: 'Only a claimed username can say it is interested.' };
  const mark = authorMark(who);
  let error = 'That event is not there any more.';
  await updateList(EVENTS, 'events', (list) => {
    error = 'That event is not there any more.';
    const i = list.findIndex((e) => e.id === id);
    if (i < 0 || !eventStarts(list[i], now).length || !seesEvent(who, list[i])) return null;
    const ev = list[i], keen = ev.keen || [], has = keen.some((k) => k.by === mark);
    error = null;
    if (!!on === has) return null;
    if (on && keen.length >= EVENT_KEEN_MAX) { error = 'That event has as many people interested as it can list.'; return null; }
    const copy = list.slice();
    copy[i] = { ...ev, keen: on ? [...keen, { handle: who.handle, by: mark }] : keen.filter((k) => k.by !== mark) };
    return copy;
  }, s);
  return error ? { error } : { keen: !!on };
}

/* Hourly: every event with no time left goes, and so does what was told
   more than a day ago. */
export async function sweepEvents(s = store(), now = Date.now()) {
  await updateList(EVENTS, 'events', (list) => {
    const keep = liveEvents(list, now);
    return keep.length === list.length ? null : keep;
  }, s);
  await updateMap(EVENTS_TOLD, 'told', (told) => {
    let any = false;
    for (const k of Object.keys(told)) if (now - told[k] > DAY) { delete told[k]; any = true; }
    return any;
  }, s);
}

/* FORGET ME, and deleting the username: the events they scheduled go, and
   they come off every list of the interested. */
export async function forgetEvents(handle, since, s = store()) {
  const mark = authorMark({ handle, since });
  await updateList(EVENTS, 'events', (list) => {
    let any = false;
    const next = [];
    for (const e of list) {
      if (e.by === mark) { any = true; continue; }
      if ((e.keen || []).some((k) => k.by === mark)) { any = true; next.push({ ...e, keen: e.keen.filter((k) => k.by !== mark) }); }
      else next.push(e);
    }
    return any ? next : null;
  }, s);
}

/* Every five minutes (cb-events-start): each time an event starts in the
   next five minutes, or started in the last fifteen and was missed, told
   once to the devices that asked. Which times have been told is a map of the
   event's id and that start to when it was told, kept a day. */
export async function tellEventsStarting(s = store(), mods, send = sendPush, now = Date.now()) {
  const due = [];
  for (const e of await readEvents(s)) {
    for (const t of eventStarts(e, now - EVENT_LATE, 3)) if (t > now - EVENT_LATE && t <= now + EVENT_SOON) due.push([e, t]);
  }
  if (!due.length) return [];
  const fresh = [];
  await updateMap(EVENTS_TOLD, 'told', (told) => {
    fresh.length = 0;
    for (const k of Object.keys(told)) if (now - told[k] > DAY) delete told[k];
    for (const [e, t] of due) {
      const k = `${e.id}@${t}`;
      if (!own(told, k)) { told[k] = now; fresh.push([e, t]); }
    }
    return fresh.length > 0;
  }, s);
  const out = [];
  for (const [e, t] of fresh) out.push(...await notifyEventStart(e, t, s, mods, send));
  return out;
}

/* ── The forums ───────────────────────────────────────────────────────────

   Ryan's brief, 2026-10-18: a bulletin board after Discourse, for discussions
   that need to last longer than the CB's two weeks, in categories after the channels
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
export const FORUM_TAGS_MAX = 5;        // tags on one topic
export const FORUM_TAG_MAX = 30;        // characters in one tag
export const POLL_KINDS = ['hands', 'sealed']; // a show of hands, or a sealed ballot
export const POLL_CHOICES_MAX = 20;     // choices in one poll
export const POLL_CHOICE_MAX = 200;     // characters in one choice
export const POLL_Q_MAX = 300;          // characters in a poll's question
export const POLL_AHEAD = 366 * 24 * 60 * 60 * 1000; // how far ahead a poll can be set to close
const FORUM_CAT = 'forum/c/';
const FORUM_GONE = 'forum-gone';        // Notion's ids of pages brought over and taken down here, so a later import leaves them down
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
  {"slug": "watering-hole", "name": "The watering hole", "about": "Chat about anything, share penguin pebbles, pass the time. Topics here go a week after their last post.", "group": "Community", "keep": "1 week", "see": null, "start": null},
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
  {"slug": "back-office-operations", "name": "Back Office Operations", "about": "For our moderators, the directors and the board: the paperwork, systems, filings and contracts that keep Stimpunks running behind the scenes.", "group": "Staff", "keep": "6 months", "see": ["moderator"], "start": null},
  {"slug": "grantmaking", "name": "Grantmaking", "about": "For the directors and the board: the grants we make, the requests that come in, and how they are decided. Every grant round is a topic tagged grant-round, kept for good. Start one from the Grant Round template, and any director or board member can add their name to its Approvals.", "group": "Staff", "keep": "never", "see": ["director", "board"], "start": null, "wiki": ["director", "board"]},
  {"slug": "finance", "name": "Finance", "about": "For the directors and the board: money in, money out, budgets, banking and the books.", "group": "Staff", "keep": "6 months", "see": ["director", "board"], "start": null},
];
/* forum:categories:end */

const CLAIM = 'The forums are for claimed usernames. Claim yours under Account on the radio, then come back.';
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

/* TAGS (Ryan's ask, 2026-10-22, so the grant rounds brought from Notion's
   Grants table can be found together in Grantmaking): up to FORUM_TAGS_MAX on
   a topic, each in lower case, letters, digits and hyphens, a space typed as a
   hyphen. Whoever may change a topic's title changes its tags, and so does a
   moderator. A category's page filters by one and says which tags its topics
   carry, never how many. A tag is one word or more joined, never a sentence,
   so the list stays a way to find things rather than a second place to post. */
export function cleanForumTag(v) {
  if (typeof v !== 'string') return null;
  const t = v.normalize('NFKC').toLowerCase().trim().replace(/^#/, '').replace(/[\s_]+/g, '-');
  return t.length <= FORUM_TAG_MAX && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t) ? t : null;
}
export function cleanForumTags(v) {
  if (v == null) return [];
  if (!Array.isArray(v)) return null;
  const out = [];
  for (const x of v) {
    const t = cleanForumTag(x);
    if (!t) return null;
    if (!out.includes(t)) out.push(t);
  }
  return out.length <= FORUM_TAGS_MAX ? out.sort() : null;
}
const TAGS_WHY = `Up to ${FORUM_TAGS_MAX} tags, each up to ${FORUM_TAG_MAX} letters, numbers and hyphens, like grant-round.`;
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
    const was = linksBefore(key, cur.exists ? cur.data : null);
    const next = change(cur.exists ? cur.data : null);
    if (next === null) return cur.exists ? cur.data : null;
    if (next === false) { if (cur.exists) { await s.delete(key); await linksAfter(key, was, null, s); } return null; }
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, next, opts);
    if (res.modified) { await linksAfter(key, was, next, s); return next; }
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
  if (t.bot) sum.bot = true;
  if (t.lastBot) sum.lastBot = true;
  if (t.pinned) sum.pinned = true;
  if (t.closed) sum.closed = true;
  if (t.unpinned) sum.unpinned = t.unpinned;
  if (t.tags && t.tags.length) sum.tags = t.tags.slice();
  // Which Notion page it was brought from, so bringing it again finds it; never sent.
  if (t.notion) sum.notion = t.notion;
  // That it opens with a poll, so a list can say so; nothing about the votes.
  if (t.poll) sum.poll = true;
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
/* A CATEGORY'S LIST IS A CACHE AND THE TOPIC IS THE RECORD (2026-10-25). A
   change that has landed in its topic is never reported as failed because the
   list behind it was busy: that told a voter "busy" with their vote counted,
   and could have told somebody their reply failed when it had gone up, so
   they posted it twice. A busy list instead leaves forum-stale/<slug>, and the
   hourly sweep brings every topic on that list up to date (sweepForum). Any
   other error is still an error. */
const FORUM_STALE = 'forum-stale/';
async function listQuietly(slug, write, s) {
  try { await write(); } catch (e) {
    if (!e || e.message !== 'busy') throw e;
    try { await s.setJSON(FORUM_STALE + slug, { t: Date.now() }, { onlyIfNew: true }); } catch (x) { /* marked already, or the sweep finds it missing */ }
  }
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
  if (sum.bot) out.bot = true;
  if (sum.lastBot) out.lastBot = true;
  if (sum.pinned) out.pinned = true;
  if (sum.closed) out.closed = true;
  if (sum.tags && sum.tags.length) out.tags = sum.tags.slice();
  if (sum.poll) out.poll = true;
  return out;
}
const byLast = (a, b) => b.last - a.last;
/* The tags a list's topics carry, in order, and never how many carry each. */
function tagsOf(list) { return [...new Set(list.flatMap((x) => x.tags || []))].sort(); }

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
   first, then the latest post first; and the categories directly under it.
   `tag`: only the topics that carry it; `tags` says which tags its topics
   carry, whichever is picked, so the page can offer the others. */
export async function forumCategory(who, slug, before = null, s = store(), now = Date.now(), tag = null) {
  const cat = forumCat(slug, now);
  if (!forumAllows(who, cat)) return null;
  const all = await treeTopics(who, cat, s, now);
  const picked = tag == null || tag === '' ? null : cleanForumTag(tag);
  const live = tag == null || tag === '' ? all : all.filter((x) => picked && (x.tags || []).includes(picked));
  // Its own pinned topics first, on the first page only; one pinned in a
  // category under it is in that category's place at the top, not this one's.
  const own = (x) => x.pinned && x.cat === cat.slug;
  const pinned = before == null ? live.filter(own).sort(byLast) : [];
  let rest = live.filter((x) => !own(x)).sort(byLast);
  if (typeof before === 'number') rest = rest.filter((x) => x.last < before);
  const out = { cat: shapeForumCat(cat, who), topics: pinned.concat(rest.slice(0, FORUM_LATEST)), more: rest.length > FORUM_LATEST, tags: tagsOf(all) };
  if (picked) out.tag = picked;
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
  // A Vimeo video the CB plays in place is a card in the forums, which play YouTube's alone.
  if (l.kind === 'player') {
    out.kind = 'page'; out.title = l.title; out.about = null; out.site = l.site || null;
    try { out.host = new URL(l.href).host; } catch (e) { out.host = null; }
  }
  if (l.kind === 'video') {
    out.id = l.id; out.title = l.title; out.channel = l.channel || null;
    out.length = typeof l.length === 'number' ? l.length : null; out.live = !!l.live;
    out.embed = l.embed === true ? true : l.embed === false ? false : null;
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
        blocks: parseBrass(m.text, { refs: true }), takeOut: canTakeOff(who, m) };
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
    blocks: placePictures(withPreviews(parseBrass(p.body || '', { refs: true }), p.links), pics, placed), edit: p.by === mark || (doc && editor),
    takeDown: !doc && (p.by === mark || who.role === 'base') };
  if (doc) out.wiki = true;
  if (typeof p.edited === 'number') out.edited = p.edited;
  // Whoever edited it last, when that is somebody: a document's words are
  // never shown as only its starter's.
  if (p.editedBy) { out.editedBy = p.editedBy; if (p.editedBase) out.editedBase = true; if (p.editedBot) out.editedBot = true; }
  if (p.bot) out.bot = true;
  if (p.reply) out.reply = p.reply;
  // Brought from Notion: the page it came from, so a reader can see it was written there, at its time.
  if (p.notion) out.notion = p.notion;
  const rx = shapeReactions(p.reactions);
  if (rx) out.reactions = rx;
  if (p.cb && p.cb.messages && p.cb.messages.length) out.cb = shapeCopied(p.cb, who);
  if (p.files && p.files.length) out.files = p.files.map((f) => shapeFile(f, placed.has(f.id)));
  if (p.at && p.at.length) out.at = p.at.slice();
  const roles = keptRoles(p.roles);
  if (roles.length) out.roles = roles;
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

export function shapeTopic(t, cat, who, now = Date.now()) {
  const mark = authorMark(who), mod = who.role === 'base', editor = forumEditor(who, cat), wiki = !!cat.wiki;
  const out = { id: t.id, cat: shapeForumCat(cat, who), title: t.title, handle: t.handle, base: !!t.base, bot: !!t.bot, t: t.t, last: t.last,
    goes: topicGoes(summaryOf(t), cat), retitle: t.by === mark || editor, retag: t.by === mark || editor || mod, tags: (t.tags || []).slice(), mod,
    takeDown: mod || (t.by === mark && topicAlone(t, mark)),
    reply: !t.closed || mod, full: t.posts.length >= FORUM_POSTS_MAX,
    posts: t.posts.map((p, i) => shapePost(p, who, mark, wiki && i === 0, editor)) };
  if (t.pinned) out.pinned = true;
  if (t.closed) out.closed = true;
  if (t.poll) out.poll = shapePoll(t, who, mark, now);
  // A poll can be added to a topic that has none by whoever may change its tags.
  else if (!t.closed && (t.by === mark || editor || mod)) out.addPoll = true;
  return out;
}

export async function forumTopic(who, id, s = store(), now = Date.now()) {
  const t = await readTopic(id, s);
  if (!t) return null;
  const cat = forumCat(t.cat, now);
  if (!forumAllows(who, cat) || !topicLive(summaryOf(t), cat, now)) return null;
  return shapeTopic(t, cat, who, now);
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
      // A template's tags come with it, so every grant round started from one is tagged alike.
      if (body) out.push({ id: t.id, cat: c.slug, title: t.title, body, tags: (t.tags || []).slice() });
    }
  }
  return out.sort((a, b) => a.title.localeCompare(b.title)).slice(0, FORUM_TEMPLATES_MAX);
}

/* WHO THE @ LIST OFFERS, beyond a topic's own people and Who's online
   (Ryan's report, 2026-10-22: a new topic, or one nobody else had posted in,
   offered nobody). Everybody who started or last posted in a topic the reader
   can read, which the reader can see already on Latest; and, for a reader of
   Tasks, everybody Tasks can assign, whom Tasks shows them already. Never a
   list of every username, which does not exist, and never a count. */
export const FORUM_PEOPLE_MAX = 500;
export async function forumPeople(who, s = store(), now = Date.now()) {
  if (!forumReader(who)) return [];
  const cats = forumCatsFor(who, now);
  const lists = await Promise.all(cats.map((c) => readForumIndex(c.slug, s)));
  const out = new Map();
  const add = (h) => { if (typeof h === 'string' && cleanHandle(h) === h && !out.has(foldHandle(h))) out.set(foldHandle(h), h); };
  cats.forEach((c, i) => lists[i].filter((x) => topicLive(x, c, now)).sort((a, b) => b.last - a.last).forEach((x) => { add(x.handle); add(x.lastBy); }));
  if (tasksAllow(who)) taskPeople().forEach(add);
  out.delete(foldHandle(who.handle));
  return [...out.values()].slice(0, FORUM_PEOPLE_MAX).sort((a, b) => foldHandle(a).localeCompare(foldHandle(b)));
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
    if (t.tags && t.tags.length) texts.push({ post: null, handle: t.handle, text: t.tags.join(' ') });
    // A poll's question and choices; never its votes.
    if (t.poll) texts.push({ post: null, handle: t.handle, text: [t.poll.q || '', ...t.poll.choices.map((c) => c.text)].join(' ') });
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

/* The first role kept with a post that the reader holds, if any. */
function calledAs(roles, who) {
  if (!who || who.role !== 'base' || !who.roles) return null;
  return keptRoles(roles).find((r) => who.roles.has(r)) || null;
}

/* Where the reader has been @mentioned, by somebody else, in the topics they
   may see, by name or as a role they hold: worked out from the words every
   time it is asked, the latest first, and kept nowhere. */
export async function forumMentions(who, s = store(), now = Date.now()) {
  if (!forumReader(who)) return [];
  const me = foldHandle(who.handle), out = [];
  for (const { t, x, c } of await readableTopics(who, s, now)) {
    if (out.length >= 30) break;
    const texts = [];
    t.posts.forEach((p) => {
      if (p.body && foldHandle(p.handle) !== me) texts.push({ post: p.id, handle: p.handle, text: p.body, t: p.t, roles: p.roles });
      if (p.cb) p.cb.messages.forEach((m) => { if (foldHandle(m.handle) !== me) texts.push({ post: p.id, handle: m.handle, text: m.text, t: m.t }); });
    });
    // By name, or as a role the reader holds that the post calls (roleMentions kept it).
    const hit = texts.filter((y) => mentions(y.text, who.handle) || !!calledAs(y.roles, who)).sort((a, b) => b.t - a.t)[0];
    if (!hit) continue;
    const r = shapeSummary(x, c);
    const as = mentions(hit.text, who.handle) ? me : calledAs(hit.roles, who);
    r.match = { post: hit.post, handle: hit.handle, words: snippet(hit.text, Math.max(0, foldHandle(tidy(hit.text)).indexOf('@' + as))) };
    out.push(r);
  }
  return out;
}

/* ── Copying from the CB ── */

/* Whether everybody a category is for can already hear a private room, so
   nothing copied out of the room reaches anybody it was not for. A private
   category's own channel is a private room too (lockedRoom), and its messages
   can always go back into the category itself. */
function narrowerThan(cat, room) {
  const lock = lockedRoom(room);
  if (!lock) return true;
  if (forumRoom(room) && forumRoomOf(cat.slug) === room) return true;
  if (!cat.see || !cat.see.length) return false;
  if (lock.strict && !cat.strict) return false;
  if (lock.roles.includes('moderator')) return true;     // every role on the list is a moderator's
  return cat.see.every((r) => lock.roles.includes(r));
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
  if (room && lockedRoom(room) && cat && !narrowerThan(cat, room)) {
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
  if (who.bot) p.bot = true; else if (who.role === 'base') p.base = true;
  if (links && links.length) p.links = links;
  if (files.length) p.files = files;
  if (at.length) p.at = at;
  // The roles it calls, which only the writer's own pass decides (roleMentions).
  const roles = roleMentions(body, who);
  if (roles.length) p.roles = roles;
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
  const tags = cleanForumTags(f.tags);
  if (tags === null) return { error: TAGS_WHY };
  let cb = null;
  if (f.from) {
    const r = await cbTranscript(who, f.from, s, cat);
    if (r.error) return r;
    cb = r.cb;
  }
  const body = f.body == null || String(f.body).trim() === '' ? '' : cleanForumBody(f.body, bodyMost(cat, true));
  if (body === null) return { error: `${cat.wiki ? 'A page' : 'A post'} is up to ${bodyMost(cat, true)} characters.` };
  const poll = f.poll == null ? null : cleanPoll(f.poll, now);
  if (poll && poll.error) return poll;
  const att = await attachments(who, f.files, [], s, attachMost(cat, true));
  if (att.error) return att;
  if (!body && !cb && !att.files.length && !poll) return { error: 'Say something to start the topic with, or add a picture, a file or a poll.' };
  if ((await readForumIndex(cat.slug, s)).length >= FORUM_TOPICS_MAX) {
    return { error: `${cat.name} is full. A moderator has to take some topics down before another fits.` };
  }
  const post = makePost(who, body, await previewsOf(body, [], get), now, att.files, mentionedIn(body, f.at, null));
  if (cb) post.cb = cb;
  const topic = { id: newTopicId(), v: 1, cat: cat.slug, title, handle: who.handle, by: authorMark(who), t: now, last: now, lastBy: who.handle, posts: [post] };
  if (who.bot) { topic.bot = true; topic.lastBot = true; } else if (who.role === 'base') { topic.base = true; topic.lastBase = true; }
  if (tags.length) topic.tags = tags;
  if (poll) topic.poll = { ...poll.poll, by: authorMark(who), handle: who.handle };
  // The files go under the topic before the topic does, so no post ever
  // holds one that is not there; the uploads go only once the topic is.
  await keepUploads(topic.id, att.fresh, s);
  let clash = false;
  await updateDoc(topicKey(topic.id), (cur) => { clash = !!cur; return cur ? null : topic; }, s);
  if (clash) return { error: 'That did not work. Try again.' };
  await doneUploads(att.fresh, s);
  await listQuietly(topic.cat, () => indexTopic(topic, s), s);
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
  if (gone) { await listQuietly(cat0, () => unindexTopic(cat0, id, s), s); await dropTopicFiles(id, s); return { gone: true }; }
  if (next && next.cat !== cat0) await listQuietly(cat0, () => unindexTopic(cat0, id, s), s);
  if (next) await listQuietly(next.cat, () => indexTopic(next, s), s);
  return { topic: next };
}

/* The latest post's time and author, after posts have gone. */
function settle(t) {
  if (!t.posts.length) return false;
  const lastPost = t.posts.reduce((a, p) => (p.t >= a.t ? p : a));
  t.last = Math.max(lastPost.t, t.t);
  t.lastBy = lastPost.handle;
  if (lastPost.base) t.lastBase = true; else delete t.lastBase;
  if (lastPost.bot) t.lastBot = true; else delete t.lastBot;
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
    if (t.lastBy === who.handle && now >= t.last) { if (who.role === 'base') t.lastBase = true; else delete t.lastBase; delete t.lastBot; }
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
    // The roles are worked out again by whoever is editing: a wiki's editor calls only the roles they may.
    const roles = roleMentions(body, who);
    if (roles.length) p.roles = roles; else delete p.roles;
    if (title !== undefined) {
      if (k !== 0 || (t.by !== mark && !editor)) return { why: 'Only whoever started a topic can change its title.' };
      t.title = title;
    }
    if (doc) {
      p.editedBy = who.handle;
      if (who.role === 'base' && !who.bot) p.editedBase = true; else delete p.editedBase;
      if (who.bot) p.editedBot = true; else delete p.editedBot;
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

/* POLLS, Norah's ask, Ryan's calls, 2026-10-22: a topic can open with a poll,
   of one of two kinds, chosen by whoever starts it and never changed after.

   A SHOW OF HANDS keeps who picked what (each hand its voter's mark, handle
   and picks) and shows everybody who can read the topic the names under each
   choice, as the votes come in. A hand can be changed or taken back while the
   poll is open.

   A SEALED BALLOT keeps who has voted apart from what was picked: a tally for
   each choice, and the ballots cast, each a hash of the topic and the voter's
   mark, sorted, so nothing kept says what anybody picked or in what order
   they voted. So a sealed vote cannot be changed or taken back, because we
   could not find it to take off. Nobody, moderators included, is sent any of
   its numbers until it closes, by its date or by its starter or a moderator,
   because a number moving just after somebody says "I voted" tells what they
   picked. And it stays closed: votes after the results were out would tell by
   subtraction who picked what.

   Polls are the one place the forums count, Ryan's call: how many picked each
   choice, in the poll's own order, never sorted by it and with no winner
   marked. A vote moves nothing else: not the topic's clock, and nobody is
   told.

   A POLL CAN BE ADDED TO A TOPIC LATER (Ryan's ask, the same day, for a round
   in Grantmaking), by whoever may change the topic's tags: its starter, in a
   wiki the wiki's editors, or a moderator. Never over a poll that is there,
   which would throw its votes away, and never to a closed topic, which takes
   no votes. It keeps who added it (its mark, never sent, and its handle), and
   they can close it as well as the topic's starter and a moderator. Adding
   one is not a post, so it moves nothing either. */
export function cleanPoll(v, now = Date.now()) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return { error: 'That is not a poll the forums can hold.' };
  if (!POLL_KINDS.includes(v.kind)) return { error: 'A poll is a show of hands or a sealed ballot.' };
  const q = tidy(typeof v.q === 'string' ? v.q : '');
  if ([...q].length > POLL_Q_MAX) return { error: `A poll's question is up to ${POLL_Q_MAX} characters.` };
  const texts = (Array.isArray(v.choices) ? v.choices : []).map((x) => tidy(typeof x === 'string' ? x : '')).filter(Boolean);
  if (texts.length < 2 || texts.length > POLL_CHOICES_MAX) return { error: `A poll has between 2 and ${POLL_CHOICES_MAX} choices, one to a line.` };
  if (texts.some((x) => [...x].length > POLL_CHOICE_MAX)) return { error: `A choice is up to ${POLL_CHOICE_MAX} characters.` };
  if (new Set(texts.map(foldHandle)).size !== texts.length) return { error: 'Two of the choices are the same.' };
  const poll = { kind: v.kind, q, choices: texts.map((text, i) => ({ id: 'c' + (i + 1), text })), many: v.many === true };
  if (v.closes != null && v.closes !== '') {
    const at = Number(v.closes);
    if (!Number.isFinite(at) || at <= now || at > now + POLL_AHEAD) return { error: 'A poll closes some time in the coming year, or leave the date empty and close it yourself.' };
    poll.closes = Math.floor(at);
  }
  if (poll.kind === 'hands') poll.hands = [];
  else { poll.tally = {}; poll.cast = []; }
  return { poll };
}
/* Closed by hand, or past its date. */
function pollShut(poll, now) { return typeof poll.shut === 'number' || (typeof poll.closes === 'number' && poll.closes <= now); }
/* A sealed ballot's one trace of its voter, different in every poll. */
function ballotOf(t, who) { return createHash('sha256').update(`forum-poll|${t.id}|${authorMark(who)}`).digest('base64url'); }
/* A sealed vote: one more on each choice picked, and the ballot among the
   others, sorted. Nothing else is written, and the picks are not kept. */
function sealVote(poll, ballot, picks) {
  for (const c of picks) poll.tally[c] = (poll.tally[c] || 0) + 1;
  poll.cast = [...poll.cast, ballot].sort();
}

/* What a reader is sent about a poll. Never a voter's mark or a ballot; a
   sealed ballot's numbers only once it is shut. */
function shapePoll(t, who, mark, now) {
  const poll = t.poll;
  const shut = pollShut(poll, now);
  const may = poll.by === mark || t.by === mark || who.role === 'base';
  const out = { kind: poll.kind, q: poll.q || '', handle: poll.handle || t.handle, many: !!poll.many, shut, close: !shut && may,
    reopen: shut && poll.kind === 'hands' && may, choices: poll.choices.map((c) => ({ id: c.id, text: c.text })) };
  if (typeof poll.closes === 'number') out.closes = poll.closes;
  if (typeof poll.shut === 'number') out.shutAt = poll.shut;
  if (poll.kind === 'hands') {
    const hand = poll.hands.find((h) => h.by === mark);
    out.mine = hand ? hand.picks.slice() : [];
    out.n = poll.hands.length;
    out.choices.forEach((c) => {
      c.who = poll.hands.filter((h) => h.picks.includes(c.id)).map((h) => h.handle).sort((a, b) => a.localeCompare(b));
      c.n = c.who.length;
    });
    return out;
  }
  out.voted = poll.cast.includes(ballotOf(t, who));
  const sealedOpen = !shut;
  if (sealedOpen) return out;
  out.n = poll.cast.length;
  out.choices.forEach((c) => { c.n = poll.tally[c.id] || 0; });
  return out;
}

/* A vote, by anybody who can read the topic, while the poll and the topic are
   open. `picks` are choice ids; an empty list takes a hand back. */
export async function votePoll(who, id, picks, s = store(), now = Date.now()) {
  if (!forumReader(who)) return { error: CLAIM };
  if (!Array.isArray(picks) || picks.length > POLL_CHOICES_MAX) return { error: 'Pick a choice first.' };
  const asked = [...new Set(picks.filter((x) => typeof x === 'string'))];
  const mark = authorMark(who);
  return changeTopic(who, id, now, s, (t) => {
    const poll = t.poll;
    if (!poll) return { why: 'This topic has no poll.' };
    if (pollShut(poll, now)) return { why: 'This poll has closed.' };
    if (t.closed) return { why: 'This topic is closed, so its poll takes no more votes.' };
    if (asked.some((x) => !poll.choices.some((c) => c.id === x))) return { why: 'One of those choices is not in this poll any more. Reload the topic.' };
    if (!poll.many && asked.length > 1) return { why: 'This poll takes one choice.' };
    const ids = poll.choices.map((c) => c.id).filter((c) => asked.includes(c));
    if (poll.kind === 'hands') {
      const rest = poll.hands.filter((h) => h.by !== mark);
      if (!ids.length && rest.length === poll.hands.length) return null;
      poll.hands = ids.length ? [...rest, { by: mark, handle: who.handle, picks: ids }] : rest;
      return t;
    }
    if (!ids.length) return { why: 'Pick a choice first.' };
    const ballot = ballotOf(t, who);
    if (poll.cast.includes(ballot)) return { why: 'You have already voted in this poll. A sealed vote cannot be changed, because nothing we keep says what you picked.' };
    sealVote(poll, ballot, ids);
    return t;
  });
}

/* A poll put on a topic that has none, by whoever may change its tags. */
export async function addPoll(who, id, f, s = store(), now = Date.now()) {
  if (!forumReader(who)) return { error: CLAIM };
  const poll = cleanPoll(f, now);
  if (poll.error) return poll;
  const mark = authorMark(who);
  return changeTopic(who, id, now, s, (t, cat) => {
    if (t.by !== mark && !forumEditor(who, cat) && who.role !== 'base') return { why: 'Only whoever started a topic, or a moderator, can add a poll to it.' };
    if (t.poll) return { why: 'This topic has a poll already, and its votes stay with it.' };
    if (t.closed) return { why: 'This topic is closed, so a poll in it could take no votes.' };
    t.poll = { ...poll.poll, by: mark, handle: who.handle };
    return t;
  });
}

/* Whoever added the poll, whoever started the topic, or a moderator, closing
   it, or opening a show of hands again. A sealed ballot, once its results are
   out, stays shut. */
export async function closePoll(who, id, open = false, s = store(), now = Date.now()) {
  if (!forumReader(who)) return { error: CLAIM };
  const mark = authorMark(who);
  return changeTopic(who, id, now, s, (t) => {
    const poll = t.poll;
    if (!poll) return { why: 'This topic has no poll.' };
    if (poll.by !== mark && t.by !== mark && who.role !== 'base') return { why: 'Only whoever added the poll, whoever started the topic, or a moderator, can close it.' };
    if (!open) {
      if (pollShut(poll, now)) return null;
      poll.shut = now;
      return t;
    }
    if (poll.kind === 'sealed') return { why: 'A sealed ballot stays closed once its results are out, because votes after them would tell who picked what.' };
    if (!pollShut(poll, now)) return null;
    delete poll.shut;
    if (typeof poll.closes === 'number' && poll.closes <= now) delete poll.closes;
    return t;
  });
}

/* The topic's starter taking it down while nobody else has posted in it, or
   any moderator, any time. Everything in it goes. */
export async function removeTopic(who, id, s = store(), now = Date.now()) {
  if (!forumReader(who)) return { error: CLAIM };
  const mark = authorMark(who);
  let from = null;
  const r = await changeTopic(who, id, now, s, (t) => {
    from = t.notion || null;
    if (who.role === 'base' || (t.by === mark && topicAlone(t, mark))) return false;
    return { why: 'Only a moderator can take down a topic other people have posted in. You can take down your own posts.' };
  });
  // One brought from Notion and taken down here stays down when pages are brought again.
  if (r.gone && from) await updateList(FORUM_GONE, 'ids', (ids) => (ids.includes(from) ? null : [...ids, from]), s);
  return r;
}
async function readForumGone(s) {
  const d = await s.get(FORUM_GONE, { type: 'json' });
  return d && Array.isArray(d.ids) ? d.ids : [];
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
        if (room && lockedRoom(room) && !narrowerThan(to, room)) {
          return { why: `This topic holds messages from a private room, and ${to.name} can be read by people that room is not for.` };
        }
      }
      t.cat = to.slug;
    }
    return t;
  });
}

/* A topic's tags, changed by whoever may change its title (its starter, or in
   a wiki the wiki's editors), or by a moderator. Neither its posts nor its
   clock move. */
export async function retagTopic(who, id, f, s = store(), now = Date.now()) {
  if (!forumReader(who)) return { error: CLAIM };
  const tags = cleanForumTags(f && f.tags);
  if (tags === null) return { error: TAGS_WHY };
  const mark = authorMark(who);
  return changeTopic(who, id, now, s, (t, cat) => {
    if (t.by !== mark && !forumEditor(who, cat) && who.role !== 'base') return { why: 'Only whoever started a topic, or a moderator, can change its tags.' };
    if ((t.tags || []).join(' ') === tags.join(' ')) return null;
    if (tags.length) t.tags = tags; else delete t.tags;
    return t;
  });
}

/* PAGES BROUGHT FROM NOTION (Ryan's ask, 2026-10-22, for the rounds in
   Notion's Grants table): a page brought in as a topic whose one post is the
   page, kept with Notion's id for it, so bringing it again changes that topic
   rather than starting a second, leaves alone one whose post was edited here,
   and leaves one taken down here down (its id goes in FORUM_GONE). It keeps
   the time the page was made, as the topic's and its post's, and who made it,
   as the CB username the importer names; its mark is that username's as it is
   claimed now, so they can edit it here, and none when it is not claimed, when
   only a wiki's editors can. A moderator who may start topics in the category
   brings it, and refuses a page the category would let go of at once because
   it is older than the category keeps topics. An import is nobody's news: it
   tells nobody, and a post that says it came from Notion is shown that way. */
/* THE WIKI'S BOT (Ryan's choice, 2026-10-26: "a posting key for a Claude
   username", so Claude can keep the Wiki's pages up to date from a session).
   It is a request signed with CB_FORUM_BOT_KEY (x-stimpunks-signature, the
   intake's shape: an HMAC-SHA256 of "t.body", good for five minutes), sent by
   tools/forum-bot.mjs, which reads the key out of 1Password and never prints
   it. It is nobody's pass and signs nobody on. What it may do is narrow, and
   tools/make-forum.py holds every part:
     · only in the Wiki and in Team Docs and every category under it (botCat,
       FORUM_BOT_TOPS; Ryan's ask, the same day: "I need help with Team Docs
       too"), so never Grantmaking, the Directors', the Board's or Executive
       Session. In Team Docs that means the key reads staff documents as well
       as writing them, which privacy.html#forum-bot says;
     · list that category's topics, read a topic's page (its first post), start
       a topic there, and edit a page, and nothing else: no replies, no take
       downs, no pictures or files, no polls, no moving, no pinning;
     · always under FORUM_BOT_NAME, a name nobody can claim (botWord), marked
       `bot` on the topic and the post and never `base`, so the page says BOT;
     · it calls no role (mentionableRoles) and tells nobody: nothing here calls
       notifyForum, so an @mention in its words rings no device. */
export const FORUM_BOT_NAME = 'Claude';
export const FORUM_BOT_MAX = 300000;
function forumBotKey() {
  const v = process.env.CB_FORUM_BOT_KEY;
  return typeof v === 'string' && v.trim().length >= 32 ? v.trim() : null;
}
export function forumBotReady() { return !!forumBotKey() && staffReady(); }
export function forumBotSigned(header, raw, now = Date.now()) { return hmacSigned(forumBotKey(), header, raw, now); }
function forumBotWho() {
  return { role: 'base', handle: FORUM_BOT_NAME, roles: new Set(['moderator']), account: true, since: 0, bot: true };
}
export const FORUM_BOT_TOPS = ['wiki', 'team-docs'];
export function botCat(cat, now = Date.now()) {
  if (!cat || !Array.isArray(cat.wiki) || !cat.wiki.length || cat.shelf || cat.strict) return false;
  let top = cat;
  for (let i = 0; top && top.parent && i < 8; i++) top = forumCat(top.parent, now);
  return !!top && !top.parent && FORUM_BOT_TOPS.includes(top.slug);
}
export async function forumBot(b, s = store(), now = Date.now(), get = safeGet) {
  const act = b && b.action;
  const who = forumBotWho();
  const page = (t) => ({ id: t.id, cat: t.cat, title: t.title, body: (t.posts[0] && t.posts[0].body) || '', tags: (t.tags || []).slice(),
    by: t.handle, edited: (t.posts[0] && t.posts[0].edited) || null, editedBy: (t.posts[0] && t.posts[0].editedBy) || null });
  if (act === 'cats') {
    return { cats: forumCategories(now).filter((c) => botCat(c, now)).map((c) => ({ slug: c.slug, name: c.name, parent: c.parent || null })) };
  }
  if (act === 'list') {
    const cat = forumCat(b.cat, now);
    if (!botCat(cat, now)) return { error: 'The bot writes only in the Wiki and Team Docs.' };
    const list = await readForumIndex(cat.slug, s);
    return { topics: list.map((x) => ({ id: x.id, title: x.title, by: x.handle, last: x.last })) };
  }
  if (act === 'read' || act === 'edit') {
    const t = typeof b.id === 'string' ? await readTopic(b.id, s) : null;
    const cat = t && forumCat(t.cat, now);
    if (!t || !botCat(cat, now) || !topicLive(summaryOf(t), cat, now)) return { error: 'There is no such page where the bot writes.' };
    if (act === 'read') return { page: page(t) };
    if (!t.posts[0]) return { error: 'That page has no first post to edit.' };
    const f = { body: b.body, at: [] };
    if (b.title != null) f.title = b.title;
    const r = await editPost(who, t.id, t.posts[0].id, f, s, now, get);
    if (r.error) return r;
    return { page: page(r.topic) };
  }
  if (act === 'start') {
    const cat = forumCat(b.cat, now);
    if (!botCat(cat, now)) return { error: 'The bot writes only in the Wiki and Team Docs.' };
    const r = await startTopic(who, { cat: cat.slug, title: b.title, body: b.body, tags: b.tags, at: [] }, s, now, get);
    if (r.error) return r;
    return { page: page(r.topic) };
  }
  return { error: 'The bot can list categories and pages, read, start and edit, and nothing else.' };
}

export async function importTopic(who, f, s = store(), now = Date.now()) {
  if (!forumReader(who)) return { error: CLAIM };
  if (who.role !== 'base') return { error: 'Only a moderator brings pages in from Notion.' };
  f = f || {};
  const notion = typeof f.notion === 'string' && /^[0-9a-f]{32}$/.test(f.notion) ? f.notion : null;
  if (!notion) return { error: 'That is not a Notion page id.' };
  const cat = forumCat(f.cat, now);
  if (!forumAllows(who, cat)) return { error: 'There is no such category.' };
  if (cat.shelf || !forumAllows(who, cat, 'start')) return { error: `You cannot start topics in ${cat.name}.` };
  const title = cleanForumTitle(f.title);
  if (!title) return { error: `A title is between one and ${FORUM_TITLE_MAX} characters.` };
  const body = cleanForumBody(f.body, bodyMost(cat, true));
  if (!body) return { error: `${cat.wiki ? 'A page' : 'A post'} is between one and ${bodyMost(cat, true)} characters.` };
  const tags = cleanForumTags(f.tags);
  if (tags === null) return { error: TAGS_WHY };
  const at = typeof f.t === 'number' && f.t > 0 && f.t <= now ? f.t : null;
  if (!at) return { error: 'Say when the page was made, no later than now.' };
  if (!topicLive({ last: at }, cat, now)) return { error: `${cat.name} keeps a topic ${keepOf(cat)} after its last post, so a page made then would go at once.` };
  const named = cleanHandle(f.by);
  if (!named) return { error: 'Say who made it, as their username.' };
  if ((await readForumGone(s)).includes(notion)) return { error: 'That page was brought over and taken down here, so it stays down.' };
  const acct = await readAccount(named, s);
  const handle = acct ? acct.handle : named;
  const mark = acct && acct.since ? authorMark({ handle: acct.handle, since: acct.since }) : null;
  const mine = (o) => { if (mark) o.by = mark; else delete o.by; return o; };
  // Brought before: in whichever category it is in now.
  let found = null;
  for (const c of forumCatsFor(who, now)) {
    const x = (await readForumIndex(c.slug, s)).find((y) => y.notion === notion);
    if (x) { found = x.id; break; }
  }
  if (found) {
    let state = 'changed';
    const r = await changeTopic(who, found, now, s, (t) => {
      const p = t.posts[0];
      if (!p || p.notion !== notion || t.notion !== notion) { state = 'changed here'; return null; }
      if (p.edited) { state = 'edited here'; return null; }
      if (t.title === title && p.body === body && p.t === at && t.t === at && p.handle === handle
        && (t.tags || []).join(' ') === tags.join(' ') && (p.by || null) === mark) { state = 'the same'; return null; }
      state = 'changed';
      t.title = title; t.t = at; t.handle = handle; mine(t);
      p.body = body; p.t = at; p.handle = handle; mine(p);
      if (tags.length) t.tags = tags; else delete t.tags;
      return settle(t);
    });
    if (r.error) return r;
    return { topic: r.topic, made: false, state };
  }
  if ((await readForumIndex(cat.slug, s)).length >= FORUM_TOPICS_MAX) {
    return { error: `${cat.name} is full. A moderator has to take some topics down before another fits.` };
  }
  const post = mine({ id: newPostId(), handle, t: at, body, notion });
  const topic = mine({ id: newTopicId(), v: 1, cat: cat.slug, title, handle, t: at, last: at, lastBy: handle, posts: [post], notion });
  if (tags.length) topic.tags = tags;
  let clash = false;
  await updateDoc(topicKey(topic.id), (cur) => { clash = !!cur; return cur ? null : topic; }, s);
  if (clash) return { error: 'That did not work. Try again.' };
  await listQuietly(topic.cat, () => indexTopic(topic, s), s);
  return { topic, made: true, state: 'made' };
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
  const stale = new Set(((await s.list({ prefix: FORUM_STALE })).blobs || []).map((b) => b.key.slice(FORUM_STALE.length)));
  for (const c of forumCategories(now)) {
    // A list a busy write left behind: every live topic on it brought up to date.
    if (stale.has(c.slug)) {
      for (const x of await readForumIndex(c.slug, s)) {
        if (!there.has(x.id)) continue;
        const t = await readTopic(x.id, s);
        if (t && t.cat === c.slug && (t.v || 0) !== (x.v || 0)) await indexTopic(t, s);
      }
      await s.delete(FORUM_STALE + c.slug);
    }
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
      await dropLinksFrom(`post:${x.id}/`, false, s);
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
    else { await s.delete(topicKey(id)); await dropTopicFiles(id, s); await dropLinksFrom(`post:${id}/`, false, s); }
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

/* YOUTUBE'S DATA API, for a video's length and whether it may play here
   (2026-10-24, when the CB's first link cards on the live site came out as
   doors: from Netlify's servers YouTube's watch page answers with its "confirm
   you're not a bot" wall, which carries no length, and the embed page answers
   a server with a configuration error, while the same code read both videos
   at once from a home connection). The Data API is YouTube's own answer to a
   server: videos.list, one unit of the day's quota a call, with the key in
   CB_YOUTUBE_KEY in Netlify and nowhere else, sent only to googleapis.com and
   never to a page. It is asked FIRST when the key is there, and the watch page
   and oEmbed are still asked after it, so with no key nothing changes. Only
   the video's id is sent. Live is said to be live; upcoming, private, not yet
   processed, not embeddable or age-restricted (which plays only for somebody
   signed in to YouTube, the third permission the Lagoon found) is a door. */
function youtubeKey() {
  const k = String(process.env.CB_YOUTUBE_KEY || '').trim();
  return /^[A-Za-z0-9_-]{20,80}$/.test(k) ? k : null;
}
// "PT5M24S" -> 324; anything else -> null.
export function isoSeconds(d) {
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(String(d || ''));
  if (!m || !(m[1] || m[2] || m[3] || m[4])) return null;
  const n = ((+m[1] || 0) * 24 + (+m[2] || 0)) * 3600 + (+m[3] || 0) * 60 + (+m[4] || 0);
  return n > 0 ? n : null;
}
// What videos.list says, in playerInfo's shape, or null when it said nothing.
export function videoFromApi(j) {
  if (!j || !Array.isArray(j.items)) return null;
  const v = j.items[0];
  if (!v) return { status: 'ERROR', embed: false, title: '', channel: '', length: null, live: false };   // gone or private
  const sn = v.snippet || {}, cd = v.contentDetails || {}, st = v.status || {};
  const live = sn.liveBroadcastContent === 'live';
  const ok = st.privacyStatus !== 'private' && st.uploadStatus === 'processed' && sn.liveBroadcastContent !== 'upcoming'
    && !(cd.contentRating && cd.contentRating.ytRating === 'ytAgeRestricted');
  return { status: ok ? 'OK' : 'UNPLAYABLE', embed: ok && st.embeddable === true, title: sn.title || '', channel: sn.channelTitle || '',
    length: live ? null : isoSeconds(cd.duration), live };
}
async function youtubeApi(id, get) {
  const key = youtubeKey();
  if (!key) return null;
  try {
    const r = await get('https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status&id=' + id + '&key=' + encodeURIComponent(key),
      { max: 60000, types: ['application/json'] });
    return r && r.status === 200 ? videoFromApi(JSON.parse(r.text)) : null;
  } catch (e) { return null; }
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

/* OEMBED (2026-10-24, for the CB's link cards, and the forums' previews with
   them). oEmbed is a site saying, as JSON, what a link is: its title, who made
   it, the site's name, and for a video how long it runs. It is read for WORDS
   AND NOTHING ELSE. Its `html` is somebody else's markup, usually their script
   (a post on X, Bluesky or Instagram is a blockquote and a script tag), and it
   is NEVER put on a page of ours: this site's policy refuses any script but its
   own, and markup from a stranger's server is the one thing the CB never draws.
   Out of that markup only two things are read, as text: the words of the post
   it quotes (its first paragraph, tags stripped), and the address of a player
   in it, which becomes a press-to-play player only on a host love-embed.js's
   ORIGINS already frames and only with its runtime (Vimeo's, for now); every
   other player is a door. Its `thumbnail_url` is never read: no picture is
   fetched from anywhere, the forums' rule. A site's own endpoint is used for
   the sites whose pages say little to a server (X, Bluesky) and the ones the
   CB plays or names (Vimeo, TikTok, Spotify, SoundCloud); any other site is
   asked only if its page names its own endpoint, the way oEmbed says a page
   should, and that address goes through safeGet like every other. */
const OEMBED_AT = [
  [/^(?:www\.|mobile\.)?(?:twitter|x)\.com$/, 'https://publish.twitter.com/oembed?omit_script=1&dnt=true&url='],
  [/^bsky\.app$/, 'https://embed.bsky.app/oembed?url='],
  [/^(?:www\.)?vimeo\.com$/, 'https://vimeo.com/api/oembed.json?url='],
  [/^(?:www\.|m\.)?tiktok\.com$/, 'https://www.tiktok.com/oembed?url='],
  [/^open\.spotify\.com$/, 'https://open.spotify.com/oembed?url='],
  [/^(?:www\.|m\.)?soundcloud\.com$/, 'https://soundcloud.com/oembed?format=json&url='],
];
const OEMBED_TYPES = ['application/json', 'application/json+oembed', 'text/json', 'text/javascript', 'text/plain'];
// The address of the page's own oEmbed endpoint, if it names one.
export function oembedLink(html, base) {
  const head = String(html || '').slice(0, 400000);
  for (const m of head.matchAll(/<link\b([^>]*)>/gi)) {
    const at = m[1];
    if (!/type\s*=\s*["']?application\/json\+oembed/i.test(at) || !/rel\s*=\s*["']?alternate/i.test(at)) continue;
    const h = /href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/i.exec(at);
    if (!h) continue;
    try { return new URL(unentity(h[1] || h[2] || h[3]), base).href; } catch (e) { return null; }
  }
  return null;
}
// What an oEmbed answer says, as words, and a player's address if it has one.
export function oembedOf(j) {
  if (!j || typeof j !== 'object' || Array.isArray(j)) return null;
  const html = typeof j.html === 'string' ? j.html.slice(0, 20000) : '';
  const p = /<p\b[^>]*>([\s\S]*?)<\/p>/i.exec(html);
  const fr = /<iframe\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i.exec(html);
  const n = Number(j.duration);
  return {
    type: typeof j.type === 'string' ? j.type : '',
    title: clip(j.title, 200),
    author: clip(j.author_name, 100),
    site: clip(j.provider_name, 80),
    said: p ? clip(p[1].replace(/<br\s*\/?>/gi, ' '), 300) : '',
    about: clip(j.description, 300),
    length: Number.isFinite(n) && n > 0 && n < 86400 ? Math.round(n) : null,
    player: fr ? unentity(fr[1]) : (typeof j.iframe_url === 'string' ? j.iframe_url : ''),
  };
}
async function oembedGet(url, get) {
  try {
    const r = await get(url, { max: 60000, types: OEMBED_TYPES });
    if (!r || r.status !== 200) return null;
    return oembedOf(JSON.parse(r.text));
  } catch (e) { return null; }
}
/* A Vimeo player, from the address in Vimeo's own oEmbed: player.vimeo.com,
   /video/ and its number, and the unlisted hash if it has one, nothing more. */
function vimeoPlayer(src) {
  let u;
  try { u = new URL(src); } catch (e) { return null; }
  const m = /^\/video\/(\d{1,12})$/.exec(u.pathname);
  if (u.protocol !== 'https:' || u.hostname !== 'player.vimeo.com' || !m) return null;
  const h = u.searchParams.get('h');
  return 'https://player.vimeo.com/video/' + m[1] + (h && /^[0-9a-f]{6,20}$/.test(h) ? '?h=' + h : '');
}
// A card from an oEmbed answer, a player only where the CB can play it.
function oembedPreview(src, href, o, host) {
  if (!o) return null;
  const vimeo = o.type === 'video' ? vimeoPlayer(o.player) : null;
  if (vimeo && o.title) {
    return { src, href, kind: 'player', site: o.site || 'Vimeo', src_player: vimeo, title: o.title, author: o.author || null, length: o.length };
  }
  const title = o.title || o.author;
  if (!title) return null;
  return { src, href, kind: 'page', title, about: o.said || o.about || null, site: o.site || null, host,
    author: o.title && o.author ? o.author : null };
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
    // YouTube's Data API first, when there is a key; the watch page if it said nothing.
    let info = await youtubeApi(id, get);
    if (!info) {
      try {
        const r = await get(watch, { max: 1500000, types: ['text/html'] });
        if (r && r.status === 200) info = playerInfo(r.text);
      } catch (e) { info = null; }
    }
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
    /* Whether it may play here: yes or no when YouTube said (its Data API, or
       its watch page), and null when only oEmbed answered, which says neither.
       A video whose length is not known still plays (Ryan's call, 2026-10-24:
       the player shows its length the moment it starts); only a no is a door. */
    const embed = info.status === 'OK' ? !!info.embed : info.status == null ? null : false;
    return { src, href, kind: 'video', id, title: clip(info.title, 200), channel: clip(info.channel, 100) || null,
      length: info.length, live: info.live, embed };
  }
  // A site whose own oEmbed endpoint is known is asked first.
  const at = OEMBED_AT.find(([re]) => re.test(host));
  if (at) {
    const known = oembedPreview(src, href, await oembedGet(at[1] + encodeURIComponent(href), get), u.host);
    if (known) return known;
  }
  const r = await get(href, { max: 600000, types: ['text/html', 'application/xhtml+xml'] });
  if (!r || r.status !== 200) return null;
  const m = metaOf(r.text);
  let to = null;
  try { to = new URL(r.url).host; } catch (e) { to = null; }
  // A page that names its own oEmbed endpoint says what it is there, too.
  const named = !at && oembedLink(r.text, r.url);
  const o = named ? await oembedGet(named, get) : null;
  if (o) {
    const p = oembedPreview(src, href, o, to);
    if (p && p.kind === 'player') return p;
    if (p && !m.title) return p;
    if (p) return { src, href, kind: 'page', title: m.title, about: m.about || p.about || null, site: m.site || p.site || null, host: to, author: p.author || null };
  }
  if (!m.title) return null;
  return { src, href, kind: 'page', title: m.title, about: m.about || null, site: m.site || null, host: to };
}

/* ── Link cards on the CB ──────────────────────────────────────────────────

   A request from our community, Ryan's ask, 2026-10-24: a link in a message
   on the CB unfurls into a card, and a video plays in place, as on Discord.
   It is the forums' previews, for a message: OUR SERVER READS EACH LINK ONCE,
   after the message has gone out (cb-transmit, through waitUntil, so sending
   never waits on a stranger's site), with previewFor and safeGet, and keeps
   what it read with the message, so it goes when the message goes. Nobody
   reading the channel fetches anything from anybody until they press play:
   the site sees Netlify, never a reader. A card is words (a title, who made
   it, the site's name, a description or the post it quotes) and NEVER A
   PICTURE, and a player is YouTube's or Vimeo's, built by love-embed.js on
   the press like every other on the street, with its runtime on the button;
   anything else that plays is a door. A player's button says how long it runs
   when that could be found out, and plays anyway when it could not (Ryan's
   call, 2026-10-24: the player shows the length as soon as it starts); only
   a video YouTube says cannot play elsewhere is a door. The links read are the bare ones, at
   most CHAT_PREVIEWS of them: not one with its own words ([words](address)),
   not one in code, not one on the street (a room is already a link), and not
   one written in angle brackets, <https://…>, which is how somebody says
   "do not unfurl this", as on Discord. */
export const CHAT_PREVIEWS = 3;
export function chatLinks(text) {
  const t = String(text || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`\n]*`/g, ' ')
    .replace(/\[[^\]\n]*\]\([^)\s]*\)/g, ' ')
    .replace(/<https?:\/\/[^\s>]+>/gi, ' ');
  const out = [];
  for (const m of t.matchAll(/https?:\/\/[^\s<>]+/gi)) {
    let src = m[0];
    // Trailing punctuation is the sentence's, and a closing bracket is the
    // link's only if it closes one the link opened.
    for (;;) {
      const last = src.slice(-1);
      if (/[.,!?;:'"*_~]/.test(last)) { src = src.slice(0, -1); continue; }
      if (last === ')' && (src.match(/\(/g) || []).length < (src.match(/\)/g) || []).length) { src = src.slice(0, -1); continue; }
      break;
    }
    let u;
    try { u = new URL(src); } catch (e) { continue; }
    if (/^(?:www\.)?stimpunks\.world$/i.test(u.hostname)) continue;
    if (!out.includes(src)) out.push(src);
    if (out.length >= CHAT_PREVIEWS) break;
  }
  return out;
}
// The cards for a message's words, reusing any it already had for the same link.
export async function chatPreviews(text, had = [], get = safeGet) {
  const out = await Promise.all(chatLinks(text).map((src) => {
    const old = (had || []).find((l) => l && l.src === src);
    return old || previewFor(src, get).catch(() => null);
  }));
  return out.filter((l) => l && (l.kind === 'page' || l.kind === 'video' || l.kind === 'player'));
}
/* After a message has gone out, or been edited: its cards, written onto it
   only if its words are still the words they were read for. */
export async function unfurlMessage(room, id, text, had = [], s = store(), get = safeGet) {
  const links = await chatPreviews(text, had, get);
  const same = (a, b) => JSON.stringify(a || []) === JSON.stringify(b || []);
  await updateTuned(room, (list) => {
    const i = list.findIndex((m) => m.id === id);
    if (i < 0 || (list[i].text || '') !== text || same(list[i].links, links)) return null;
    const next = list.slice();
    next[i] = { ...list[i] };
    if (links.length) next[i].links = links; else delete next[i].links;
    return next;
  }, s);
  return links;
}
// What a reader is sent of a card.
function shapeChatPreview(l) {
  if (!l || typeof l !== 'object' || typeof l.href !== 'string') return null;
  const str = (v) => (typeof v === 'string' && v ? v : null);
  if (l.kind === 'video' && cleanVideo(l.id)) {
    return { kind: 'video', href: l.href, id: l.id, title: str(l.title) || '', channel: str(l.channel),
      length: typeof l.length === 'number' ? l.length : null, live: !!l.live, embed: l.embed === true ? true : l.embed === false ? false : null };
  }
  if (l.kind === 'player' && vimeoPlayer(l.src_player)) {
    return { kind: 'player', href: l.href, src: l.src_player, site: str(l.site), title: str(l.title) || '', author: str(l.author),
      length: typeof l.length === 'number' ? l.length : null };
  }
  if (l.kind === 'page' && str(l.title)) {
    return { kind: 'page', href: l.href, title: l.title, about: str(l.about), site: str(l.site), author: str(l.author), host: str(l.host) };
  }
  return null;
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
   one (notifyDm). Two more on 2026-10-23, with events (Ryan's ask, after
   Discord's Scheduled Events): an event you are interested in starting
   (notifyEventStart), and a new event on World or in a room you follow
   (notifyEventNew).

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
   until switched on, the words, on unless switched off, the rooms it follows,
   and whether it follows every room. null if it follows too many. */
export const PUSH_KINDS = ['mentions', 'replies', 'props', 'messages', 'world', 'calls', 'tasks', 'events', 'scheduled', 'suggestions', 'answered'];
export function cleanWant(w) {
  w = w && typeof w === 'object' && !Array.isArray(w) ? w : {};
  const rooms = Array.isArray(w.rooms) ? [...new Set(w.rooms.map(roomTag).filter(Boolean))] : [];
  if (rooms.length > PUSH_ROOMS_MAX) return null;
  const out = { all: w.all === true };
  for (const k of PUSH_KINDS) out[k] = w[k] === true;
  return { ...out, words: w.words !== false, rooms, everyRoom: w.everyRoom === true };
}
/* Whether a device wants this kind: its own switch, or Everything. */
export function wants(w, kind) {
  return !!(w && typeof w === 'object' && (w.all === true || w[kind] === true));
}
/* Whether a device follows this room: on its list, or following every room
   (Norah's ask, 2026-10-21), which takes in rooms that open later and is not
   a kind, so Everything leaves it as it is. Every room is never a room that
   keeps to itself: only a device that followed that one by its address is
   told about it. Whether its pass may go in is roomAllows()'s, as ever. */
export function followsRoom(w, room) {
  if (!w || typeof w !== 'object' || !room) return false;
  return (Array.isArray(w.rooms) && w.rooms.includes(room)) || (w.everyRoom === true && !quietRoom(room));
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

/* Whether words name this with an @, the way somebody would. */
function atName(text, name) {
  const h = String(name || '').normalize('NFKC').trim();
  if (!h || !text) return false;
  const esc = h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp(`(^|[^\\p{L}\\p{N}_@])@${esc}(?![\\p{L}\\p{N}_]|:\\d)`, 'iu').test(String(text).normalize('NFKC'));
}
/* Whether a message names this handle with an @. A role's name is never a
   person's (roleWord), so @board is the board and nobody's handle. */
export function mentions(text, handle) {
  return !roleWord(handle) && atName(text, handle);
}

/* ROLE MENTIONS. Ryan's ask, 2026-10-23: @moderator, @director, @board and
   @administrator, which tell everybody who holds that role, the way @mods does
   on Discord. A role is named by its own word in ROLES, singular, and nothing
   else: @moderators stays words.

   WHO MAY CALL WHICH ROLE is ROLE_ANYBODY's, and Ryan's call the same day:
   anybody with a claimed username may call @moderator, because calling the moderators is how somebody asks
   for help; @director, @board and @administrator are for the base, every
   role on the list, so the people who run things are not a number anybody can
   ring. The server keeps on a message or a post only the roles its sender may
   call and its words name (roleMentions), as it keeps only the handles the
   words name, so a mention is never drawn as calling a role that nobody was
   told about.

   WHO IS TOLD is everybody holding the role, on their devices that asked to
   hear When somebody @mentions me, whose pass may go where the words were
   said (roomAllows, forumAllows), and never in a room that keeps to itself,
   exactly as a mention of their handle. NOBODY IS EVER TOLD WHO HOLDS A
   ROLE: not the sender, not the radio, not the @ list. The friendly edits are
   the role's people in the @ list "so you know who you are calling" and a
   count of who was told; who holds which role is not ours to publish.

   A ROLE'S WORD IS NOBODY'S USERNAME: checkHandle, joinAccount and
   claimAccount refuse one (roleWord), so @board can only ever be the board. */
export const ROLE_ANYBODY = ['moderator'];
export function roleWord(h) { return ROLES.includes(foldHandle(h)); }
export function mentionableRoles(who) {
  if (!who || who.bot) return [];
  if (who.role === 'base') return ROLES.slice().sort();
  return who.account ? ROLE_ANYBODY.slice() : [];
}
export function roleMentions(text, who) {
  return text ? mentionableRoles(who).filter((r) => atName(text, r)) : [];
}
// The roles a message kept, as they may be shown: only ROLES, each once.
function keptRoles(list) {
  return Array.isArray(list) ? ROLES.slice().sort().filter((r) => list.includes(r)) : [];
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
  // Kept after it is sent, and never in its way: a busy archive loses one entry, never the notification.
  await fileNotices(sends, answers, s).catch(() => null);
  return sends.map((x) => ({ id: x.id, payload: x.payload }));
}

/* ── YOUR PAST NOTIFICATIONS (Ryan's ask, 2026-10-25) ─────────────────────
   "Desktop notifications come and go. Tasks saves my task notifications for
   30 days. I want that for all notifications." Every notification one of
   your devices is sent is also kept for you, once however many of your
   devices it went to, under notices/<pet key>, and you.html shows them.

   IT KEEPS NO WORDS. What a device was sent carries a message's first words,
   a topic's title or a task's name if the device wanted the words; the
   archive keeps what it was, why, who from, where and which, and when, and
   drops every field that holds words (NOTICE_WORDS). Copying them would keep
   a message's words past its two weeks and past Take off, which is the copy
   the street refuses a reply's quote and a comment's notification.

   THE WORDS ARE READ AGAIN WHEN YOU LOOK (noticeArchive), from wherever they
   still are and only where your pass can still read them: a message on its
   channel while it is on the air, a post in the forums, a task's name, a
   suggestion's or an event's title. Direct messages and props never: they
   have their own places, and a page listing them would be a second copy.

   Only a notification actually delivered (the push service answered 2xx) is
   kept, so the device switches decide what is in it, and only for a claimed
   username's pass. Marked seen when you look, never counted to you. Nobody
   else is shown it, a moderator included. Clear my past notifications,
   Forget me and deleting the username delete it. The friendly edits are
   keeping the words "so the archive reads well when the message has gone", an
   unread count, and filing everything that would have notified you even
   with no device switched on, which is a record of everything said about you
   that nobody asked to be kept. tools/check-notices.py holds it. */
export const NOTICE_KEEP = 500;
export const NOTICE_DAYS = 30;
const NOTICE_TRIES = 40;
const NOTICE_WORDS = ['text', 'title', 'name', 'box'];
const noticeBlob = (pk) => `notices/${pk}`;

// What a notification was, without a word of what it said.
export function noticeOf(payload) {
  const out = {};
  for (const [k, v] of Object.entries(payload || {})) if (!NOTICE_WORDS.includes(k)) out[k] = v;
  return out;
}

async function fileNotices(sends, answers, s, now = Date.now()) {
  const by = new Map();
  sends.forEach((x, i) => {
    const a = answers[i], p = x.d && x.d.pass;
    if (!a || a.status !== 'fulfilled' || !(a.value >= 200 && a.value < 300)) return;
    if (!p || p.gen !== 2 || typeof p.handle !== 'string' || !x.payload || x.payload.kind === 'test') return;
    const pk = petKey(p.handle), d = noticeOf(x.payload);
    if (!by.has(pk)) by.set(pk, new Map());
    by.get(pk).set(JSON.stringify(d), d);
  });
  const since = now - NOTICE_DAYS * 86400000;
  for (const [pk, kept] of by) {
    const add = [...kept.values()].map((d) => ({ n: 'n' + randomBytes(9).toString('base64url'), sent: now, seen: false, d }));
    // A person's list is the one blob many notifications can race for at once, as a task inbox is.
    await updateList(noticeBlob(pk), 'items', (list) => [...add, ...list.filter((x) => x.sent >= since)].slice(0, NOTICE_KEEP), s, NOTICE_TRIES);
  }
}

const noticeCut = (t) => {
  const w = linkWords(t).replace(/\s+/g, ' ').trim();
  return [...w].length > PUSH_WORDS ? [...w].slice(0, PUSH_WORDS - 1).join('') + '\u2026' : w;
};

/* Your past notifications, newest first, each with its words read again from
   wherever they still are (above), and `fresh` on the ones you had not seen,
   which this look marks seen. */
export async function noticeArchive(who, s = store(), now = Date.now()) {
  if (!forumReader(who)) return null;
  const since = now - NOTICE_DAYS * 86400000;
  let items = [];
  await updateList(noticeBlob(petKey(who.handle)), 'items', (list) => {
    items = list.filter((x) => x && x.sent >= since && x.d && typeof x.d === 'object');
    const next = items.map((x) => (x.seen ? x : { ...x, seen: true }));
    return items.length !== list.length || items.some((x) => !x.seen) ? next : null;
  }, s);
  const logs = new Map(), topics = new Map();
  let tasks = null, box = null, evs = null;
  const out = [];
  for (const x of items) {
    const d = { ...x.d };
    try {
      if (d.kind === 'message' && typeof d.id === 'string') {
        const room = typeof d.room === 'string' && d.room ? d.room : '';
        if (!room || roomAllows(who, room)) {
          if (!logs.has(room)) logs.set(room, readTuned(room || null, s).then((l) => l.messages, () => []));
          const m = (await logs.get(room)).find((y) => y.id === d.id);
          if (m && m.text) d.text = noticeCut(m.text);
        } else delete d.place;
      } else if (d.kind === 'forum' && typeof d.t === 'string') {
        if (!topics.has(d.t)) topics.set(d.t, readTopic(d.t, s).catch(() => null));
        const topic = await topics.get(d.t), cat = topic && forumCat(topic.cat, now);
        if (cat && forumAllows(who, cat)) {
          d.title = [...String(topic.title || '')].slice(0, FORUM_TITLE_MAX).join('');
          const post = topic.posts.find((y) => y.id === d.p);
          if (post && post.body) d.text = noticeCut(post.body);
        } else delete d.cat;
      } else if (d.kind === 'task' && typeof d.task === 'string' && d.task && tasksAllow(who)) {
        if (!tasks) tasks = readTasks(s).catch(() => []);
        const t = (await tasks).find((y) => y.id === d.task);
        if (t && t.name) d.name = [...String(t.name)].slice(0, PUSH_WORDS).join('');
      } else if (d.kind === 'suggestion' && typeof d.id === 'string') {
        if (!box) box = readSuggestions(s).catch(() => []);
        const it = (await box).find((y) => y.id === d.id);
        if (it && it.title) d.title = [...String(it.title)].slice(0, PUSH_WORDS).join('');
      } else if (d.kind === 'event' && typeof d.id === 'string') {
        if (!evs) evs = readEvents(s).catch(() => []);
        const ev = (await evs).find((y) => y.id === d.id);
        if (ev && seesEvent(who, ev) && ev.title) d.title = [...String(ev.title)].slice(0, PUSH_WORDS).join('');
      }
    } catch (e) { /* the words stay unread, and the notification is still there */ }
    out.push({ n: x.n, sent: x.sent, fresh: !x.seen, d });
  }
  return out;
}

/* Clear my past notifications, Forget me and deleting the username. */
export async function forgetNotices(pk, s = store()) {
  await s.delete(noticeBlob(pk));
  return true;
}
const topicFor = (k) => createHash('sha256').update(`stimpunks-topic\0${k}`).digest('base64url').slice(0, 32);

/* A message has been sent on a channel: tell every device that asked to hear
   it, once each, and none that may not. What a notification carries is what
   the service worker needs to say it: who, where, why, and the words if the
   device wants them. The worker puts a room's name to its tag.

   A reply also tells whoever sent the message it answers (`to`, found on
   the channel by transmit and never kept), on their devices with When
   somebody replies to me on (Ryan's ask, 2026-10-21): only a device that is
   that message's sender by canEdit's rule, so a claimed message's reply
   reaches only that username's own password, never a room that keeps to
   itself, and never anybody about their own message. */
export function notifyMessage(msg, room, s = store(), mods = readMods(), send = sendPush, to = null) {
  return tellDevices(msg, room, null, s, mods, send, to);
}

/* An edited message tells only the devices it @mentions now and did not
   before (Ryan, 2026-10-18, the forum's rule for an edited post): fixing a
   typo is not news to a room's followers, and a mention added in an edit
   reaches the person it names, once. */
export function notifyEdit(msg, before, room, s = store(), mods = readMods(), send = sendPush) {
  return tellDevices(msg, room, String(before || ''), s, mods, send);
}

async function tellDevices(msg, room, before, s, mods, send, to = null) {
  if (send === sendPush && !pushReady()) return [];
  const devs = await readDevices(s);
  const from = foldHandle(msg.handle), quiet = !!(room && quietRoom(room));
  // The roles it calls that it did not call before an edit (ROLE_ANYBODY).
  const called = quiet ? [] : keptRoles(msg.roles).filter((r) => !(before && atName(before, r)));
  const sends = [], gone = [];
  for (const [id, d] of Object.entries(devs)) {
    if (!d || d.fold === from) continue;
    const w = d.want || {};
    const h = d.pass && d.pass.handle;
    const followed = before === null && (room ? followsRoom(w, room) : wants(w, 'world'));
    const named = wants(w, 'mentions') && !quiet && mentions(msg.text, h) && !(before && mentions(before, h));
    let answered = before === null && !!to && wants(w, 'replies') && !quiet && d.fold === foldHandle(to.handle);
    // Only a moderator's pass can hold a role, so no other device is read for one.
    let role = called.length && wants(w, 'mentions') && d.pass && d.pass.kind === 'base' ? called : null;
    if (!followed && !named && !answered && !role) continue;
    const who = await deviceWho(d, s, mods);
    if (!who) { gone.push(id); continue; }
    if (!roomAllows(who, room)) continue;
    // The message answered is this device's only if it is its sender's, the
    // way an edit would be (canEdit): a name somebody else holds now is not.
    if (answered && !canEdit(who, to)) answered = false;
    // A role it calls is this device's only if its pass holds that role now.
    if (role) role = role.find((r) => who.role === 'base' && who.roles && who.roles.has(r)) || null;
    if (!followed && !named && !answered && !role) continue;
    let text = '';
    if (w.words !== false) {
      text = linkWords(msg.text).replace(/\s+/g, ' ').trim();
      if ([...text].length > PUSH_WORDS) text = [...text].slice(0, PUSH_WORDS - 1).join('') + '…';
    }
    const what = msg.img ? 'picture' : (msg.sticker || msg.avatar || msg.chimera || msg.patch || msg.jacket) ? 'sticker' : '';
    const why = answered ? 'reply' : named || role ? 'mention' : 'channel';
    const payload = { kind: 'message', why, handle: msg.handle, room: room || '', text, what, id: msg.id };
    // Called as a role and not by name: which role, so the notification can say so.
    if (why === 'mention' && !named) payload.as = role;
    // A forum category's room is in no public list, so it says its own name.
    if (forumRoom(room)) payload.place = forumPlace(room);
    sends.push({ id, d, payload, opts: why !== 'channel' ? { urgency: 'high' } : { topic: topicFor(room || 'world') } });
  }
  return deliver(sends, gone, s, send);
}

/* A room's feed bot has said a new arrival (runFeedBot, under Room channels):
   tell each device that follows that room BY ITS NAME. A device following
   every room is not told, because that switch is for people's talk and a
   phone that pressed it did not ask for every commit to the street; so the
   want is asked through followsRoom() with every room taken out of it. The
   words are the item's site and name, if the device wants words. */
export async function notifyWire(msg, room, s = store(), mods, send = sendPush) {
  if (mods === undefined) mods = await loadMods();
  if (send === sendPush && !pushReady()) return [];
  if (!msg || !msg.feed || !room) return [];
  const devs = await readDevices(s);
  const sends = [], gone = [];
  for (const [id, d] of Object.entries(devs)) {
    if (!d || !followsRoom({ ...(d.want || {}), everyRoom: false }, room)) continue;
    const who = await deviceWho(d, s, mods);
    if (!who) { gone.push(id); continue; }
    if (!roomAllows(who, room)) continue;
    let text = '';
    if ((d.want || {}).words !== false) {
      text = String(msg.text || '').replace(/\s+/g, ' ').trim();
      if ([...text].length > PUSH_WORDS) text = [...text].slice(0, PUSH_WORDS - 1).join('') + '…';
    }
    const payload = { kind: 'message', why: 'channel', handle: msg.handle, room, text, what: '', id: msg.id };
    sends.push({ id, d, payload, opts: { topic: topicFor(room) } });
  }
  return deliver(sends, gone, s, send);
}

/* A forum post has @mentioned somebody (Ryan, 2026-10-18): tell each device
   that switched on When somebody @mentions me, whose pass is a claimed
   username's that can read the post's category now, and that the post names
   and, after an edit, did not name before. Never the post's writer. A
   notification says who, which category, and, if the device wants the words,
   the topic's title and the post's first words. */
export async function notifyForum(topic, post, before = '', s = store(), mods, send = sendPush) {
  if (mods === undefined) mods = await loadMods();
  if (send === sendPush && !pushReady()) return [];
  if (!topic || !post || !post.body) return [];
  const cat = forumCat(topic.cat);
  if (!cat) return [];
  const devs = await readDevices(s);
  // A wiki's document says who edited it last, and an edit's mention is theirs.
  const writer = post.editedBy || post.handle;
  const from = foldHandle(writer);
  // The roles it calls that it did not call before an edit (ROLE_ANYBODY).
  const called = keptRoles(post.roles).filter((r) => !(before && atName(before, r)));
  const sends = [], gone = [];
  for (const [id, d] of Object.entries(devs)) {
    if (!d || d.fold === from || !wants(d.want, 'mentions')) continue;
    const h = d.pass && d.pass.handle;
    const named = mentions(post.body, h) && !(before && mentions(before, h));
    let role = called.length && d.pass && d.pass.kind === 'base' ? called : null;
    if (!named && !role) continue;
    const who = await deviceWho(d, s, mods);
    if (!who) { gone.push(id); continue; }
    if (!forumAllows(who, cat)) continue;
    if (role) role = role.find((r) => who.role === 'base' && who.roles && who.roles.has(r)) || null;
    if (!named && !role) continue;
    let text = '', title = '';
    if (d.want.words !== false) {
      text = linkWords(post.body).replace(/\s+/g, ' ').trim();
      if ([...text].length > PUSH_WORDS) text = [...text].slice(0, PUSH_WORDS - 1).join('') + '…';
      title = [...String(topic.title || '')].slice(0, FORUM_TITLE_MAX).join('');
    }
    const payload = { kind: 'forum', why: 'mention', handle: writer, cat: cat.name, title, text, t: topic.id, p: post.id };
    if (!named) payload.as = role;
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
export async function notifyProps(handle, writer, text, s = store(), mods, send = sendPush) {
  if (mods === undefined) mods = await loadMods();
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
      words = linkWords(text).replace(/\s+/g, ' ').trim();
      if ([...words].length > PUSH_WORDS) words = [...words].slice(0, PUSH_WORDS - 1).join('') + '…';
    }
    sends.push({ id, d, payload: { kind: 'props', handle: String(writer || ''), text: words }, opts: {} });
  }
  return deliver(sends, gone, s, send);
}

/* Something new in the suggestion box in The Sandbox (Ryan's ask, and Norah's,
   2026-10-25: until then nobody was told, so a suggestion waited until somebody
   happened to look). Each is a switch of its own, off until switched on:

   · `suggestions`, offered only to a moderator's pass: a suggestion dropped
     in, or a reply from whoever dropped it in, tells every moderator's device
     that switched it on, so the people who can act on it, administrators
     first, know without watching the box. Which moderators is each one's own
     choice, by switching it on.
   · `answered`: a moderator's reply tells whoever dropped it in, on devices
     switched on as them, under canTakeOff's rule for whose it is.

   Never the person who wrote it, never how many are waiting, and the title and
   words only where a device wants the words. The box is public, so nothing
   here is a secret; the words switch is for somebody reading over a shoulder.
   The suggestion stays in the box whether or not this arrives. */
export async function notifySuggestion(item, reply, s = store(), mods, send = sendPush) {
  if (mods === undefined) mods = await loadMods();
  if (send === sendPush && !pushReady()) return [];
  if (!item || !item.id) return [];
  const writer = reply ? reply.handle : item.handle;
  const from = foldHandle(writer), asker = foldHandle(item.handle);
  // Whoever asked, dropping it in or replying, tells the moderators; anybody
  // else who can reply is a moderator, and tells whoever asked.
  const toMods = !reply || from === asker;
  const kind = toMods ? 'suggestions' : 'answered';
  const cut = (v) => {
    const w = linkWords(v).replace(/\s+/g, ' ').trim();
    return [...w].length > PUSH_WORDS ? [...w].slice(0, PUSH_WORDS - 1).join('') + '…' : w;
  };
  const devs = await readDevices(s);
  const sends = [], gone = [];
  for (const [id, d] of Object.entries(devs)) {
    if (!d || d.fold === from || !wants(d.want, kind)) continue;
    if (!toMods && d.fold !== asker) continue;
    const who = await deviceWho(d, s, mods);
    if (!who) { gone.push(id); continue; }
    if (foldHandle(who.handle) === from) continue;
    if (toMods ? who.role !== 'base' : (foldHandle(who.handle) !== asker || !canTakeOff(who, item))) continue;
    const payload = { kind: 'suggestion', to: toMods ? 'mods' : 'asker', handle: String(writer || ''), id: item.id, made: !reply, title: '', text: '' };
    if (reply && reply.status) payload.mark = reply.status;
    if (d.want.words !== false) {
      payload.title = [...String(item.title || '')].slice(0, PUSH_WORDS).join('');
      payload.text = cut(reply ? reply.body : item.body);
    }
    sends.push({ id, d, payload, opts: {} });
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
export async function notifyDm(handle, sender, said, asked, s = store(), mods, send = sendPush) {
  if (mods === undefined) mods = await loadMods();
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
      words = linkWords(text).replace(/\s+/g, ' ').trim();
      if ([...words].length > PUSH_WORDS) words = [...words].slice(0, PUSH_WORDS - 1).join('') + '…';
    }
    const payload = { kind: 'dm', handle: String(sender || ''), asked: !!asked, text: words };
    if (picture) payload.what = 'picture';
    else if (stuck) payload.what = 'sticker';
    sends.push({ id, d, payload, opts: {} });
  }
  return deliver(sends, gone, s, send);
}

/* Something has gone into somebody's notifications in Tasks (Ryan, 2026-10-21:
   a switch beside the CB's, off until switched on): tell the devices switched
   on as that claimed username that asked for tasks, and that can still read
   tasks (tasksAllow, from the pass as it would be now). Who did it, why it is
   theirs, and what kind of change; the task's name and a ticked box's words
   only if the device wants the words; the task's id, so pressing it opens the
   task. Never what changed in a description, never how many are unread, and
   never anything to the person who made the change, who is never in anybody's
   list for it. The notification is in their list whether or not this arrives. */
export async function notifyTask(handle, item, s = store(), mods, send = sendPush) {
  if (mods === undefined) mods = await loadMods();
  if (send === sendPush && !pushReady()) return [];
  const to = foldHandle(handle);
  if (!to || !item || (item.by && foldHandle(item.by) === to)) return [];
  const devs = await readDevices(s);
  const sends = [], gone = [];
  for (const [id, d] of Object.entries(devs)) {
    if (!d || d.fold !== to || !wants(d.want, 'tasks')) continue;
    const who = await deviceWho(d, s, mods);
    if (!who) { gone.push(id); continue; }
    if (!tasksAllow(who) || foldHandle(who.handle) !== to) continue;
    const payload = { kind: 'task', why: item.why, did: item.kind, handle: item.by || '', task: item.kind === 'deleted' || !item.task ? '' : item.task, name: '', box: '' };
    // An office comment says what it is on and its id, and nothing sealed: no name.
    if (item.rec) { payload.rec = item.rec; payload.what = item.what; }
    if (d.want.words !== false) {
      payload.name = [...String(item.name || '')].slice(0, PUSH_WORDS).join('');
      if (item.box) payload.box = [...String(item.box.text || '')].slice(0, PUSH_WORDS).join('');
    }
    // A comment is told as that it was made and on which task, never its words.
    if (item.comment) payload.comment = item.comment;
    sends.push({ id, d, payload, opts: { urgency: item.why === 'yours' || item.why === 'commented' ? 'normal' : 'high' } });
  }
  return deliver(sends, gone, s, send);
}

/* Somebody has joined a call nobody was in: tell the devices that follow its
   room, every room included, or every device that asked about calls for the
   World call, once in CALL_QUIET at most. Never who joined. */
export async function notifyCall(tag, s = store(), mods, send = sendPush, now = Date.now()) {
  if (mods === undefined) mods = await loadMods();
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
    if (!wants(w, 'calls') || !(tag === WORLD_CALL || followsRoom(w, tag))) continue;
    const who = await deviceWho(d, s, mods);
    if (!who) { gone.push(id); continue; }
    if (tag !== WORLD_CALL && !roomAllows(who, tag)) continue;
    const payload = { kind: 'call', room: tag };
    if (forumRoom(tag)) payload.place = forumPlace(tag);
    sends.push({ id, d, payload, opts: { ttl: 900, topic: topicFor(`call ${tag}`) } });
  }
  return deliver(sends, gone, s, send);
}

/* An event is starting (Ryan's ask, 2026-10-23, after Discord's Scheduled
   Events): tell the devices that asked about events they are interested in,
   switched on as somebody on its list of the interested, by the mark of their
   claimed username, whose pass can still see it. Its title only if the device
   wants the words, its channel, and when; never who else is interested, and
   never how many. Each start is told once, by tellEventsStarting. */
export async function notifyEventStart(ev, at, s = store(), mods, send = sendPush) {
  if (mods === undefined) mods = await loadMods();
  if (send === sendPush && !pushReady()) return [];
  const keen = new Set((ev && ev.keen || []).map((k) => k.by));
  if (!keen.size) return [];
  const devs = await readDevices(s);
  const sends = [], gone = [];
  for (const [id, d] of Object.entries(devs)) {
    if (!d || !wants(d.want, 'events')) continue;
    const who = await deviceWho(d, s, mods);
    if (!who) { gone.push(id); continue; }
    if (!forumReader(who) || !keen.has(authorMark(who)) || !seesEvent(who, ev)) continue;
    sends.push({ id, d, payload: eventPayload(ev, 'start', at, d.want), opts: { urgency: 'high', ttl: 1800, topic: topicFor(`event ${ev.id}`) } });
  }
  return deliver(sends, gone, s, send);
}

/* A new event has been scheduled: tell the devices that asked about new
   events, on World, which is everybody's channel, or in a room they follow
   (followsRoom, so never a room that keeps to itself, which has no events
   anyway). Never its maker. Who made it, its title only if the device wants
   the words, its channel, and when it first starts. */
export async function notifyEventNew(ev, s = store(), mods, send = sendPush) {
  if (mods === undefined) mods = await loadMods();
  if (send === sendPush && !pushReady()) return [];
  if (!ev || !ev.start) return [];
  const devs = await readDevices(s);
  const from = foldHandle(ev.handle);
  const sends = [], gone = [];
  for (const [id, d] of Object.entries(devs)) {
    if (!d || d.fold === from || !wants(d.want, 'scheduled')) continue;
    if (ev.room !== WORLD_CALL && !followsRoom(d.want, ev.room)) continue;
    const who = await deviceWho(d, s, mods);
    if (!who) { gone.push(id); continue; }
    if (!forumReader(who) || authorMark(who) === ev.by || !seesEvent(who, ev)) continue;
    sends.push({ id, d, payload: eventPayload(ev, 'new', ev.start, d.want), opts: { topic: topicFor(`event ${ev.id}`) } });
  }
  return deliver(sends, gone, s, send);
}

function eventPayload(ev, why, at, want) {
  const p = { kind: 'event', why, id: ev.id, room: ev.room, at, title: '' };
  if (want && want.words !== false) p.title = [...String(ev.title || '')].slice(0, PUSH_WORDS).join('');
  if (why === 'new') p.handle = ev.handle;
  if (forumRoom(ev.room)) p.place = forumPlace(ev.room);
  return p;
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
  // What a room's feed bot said is nobody's, so only the base takes it off.
  if (m.base || m.feed) return false;
  if (foldHandle(m.handle) !== foldHandle(who.handle)) return false;
  return !m.claimed || !!who.account;
}

/* ── Editing a message ────────────────────────────────────────────────────

   Ryan, 2026-10-18: anybody can edit their own messages on the CB. The words
   are replaced and nothing else is: the handle, the marks, the time it was
   sent, its picture or sticker and its reactions stay as they were, and it
   still goes two weeks after it was SENT, because onAir reads `t` and an edit
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
  if (!who || !m || m.feed) return false;
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
  // A card whose link is no longer in the words goes at once; a new link's
  // card comes after (unfurlMessage, from cb-edit).
  if (Array.isArray(m.links)) {
    const still = chatLinks(words);
    const kept = m.links.filter((l) => l && still.includes(l.src));
    if (kept.length) next[i].links = kept; else delete next[i].links;
  }
  // Who it @mentions is worked out again from the new words: the names the
  // radio offered now, and the ones it named before, if they are still there.
  const named = channelMentions(words, [...(Array.isArray(asked) ? asked : []), ...(m.at || [])]);
  if (named.length) next[i].at = named; else delete next[i].at;
  // And the roles it calls, which only the sender's own pass decides (roleMentions).
  const roles = roleMentions(words, who);
  if (roles.length) next[i].roles = roles; else delete next[i].roles;
  return { list: next, before: m.text || '', msg: next[i] };
}

/* ── Replies ──────────────────────────────────────────────────────────────

   Ryan's ask, 2026-10-21: a reply on the CB, the way chat has one. A message
   may answer another on the same channel, or in the same conversation, and
   says which by `re`, the other message's id, AND NOTHING ELSE OF IT: not its
   words, not its sender. Every radio draws the quote out of what is on the
   channel now, so an edit to the message answered changes the quote, taking it
   off takes the quote with it, and when its two weeks are up the reply says it
   answered a message no longer on the channel. The friendly edit is a copy of
   the words "so the quote survives", which would keep words past the message
   they were said in, and past somebody taking them back.

   The message answered must be on the channel when the reply is sent, and in
   the same log (replyTo is only the shape; transmit and sendDm look for it).
   Editing a reply keeps `re`, because an edit changes only the words. */
export function replyTo(id) {
  return typeof id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(id) ? id : null;
}

/* ── Reactions ────────────────────────────────────────────────────────────

   Ryan's brief, 2026-09-30: reactions on CB messages. A reaction is one of a
   fixed set, pressed on a message, and pressed again to take it back. It is
   part of its message: it goes when the message goes, two weeks after it was
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
    const roles = keptRoles(m.roles);
    if (roles.length) out.roles = roles;
    if (replyTo(m.re)) out.re = m.re;
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
    // Said by a room's feed bot (above), which every radio marks BOT.
    const fd = m.feed && shapeFeed(m.feed);
    if (fd) out.feed = fd;
    // The cards its links unfurled into (unfurlMessage).
    const links = Array.isArray(m.links) ? m.links.map(shapeChatPreview).filter(Boolean) : [];
    if (links.length) out.links = links;
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
export const TASK_SEE = ["director", "board"];
export const TASK_STATUSES = ["Not Started", "Started", "Completed", "Canceled", "Deferred"];
export const TASK_DONE = ["Completed", "Canceled"];
export const TASK_BOARD_HIDES = ["Canceled"];
export const TASK_REPEATS = {"Weekly": {"days": 7}, "Every 2 Weeks": {"days": 14}, "Monthly": {"months": 1}};
export const TASK_COLOURS = ["blue", "orange", "aqua", "yellow", "magenta", "green", "violet"];
export const TASK_TAG_COLOURS = {"Operations": "blue", "Systems": "blue", "Business Papers": "blue", "Finance": "orange", "Fundraising": "orange", "Outside Grants": "orange", "Grantmaking": "orange", "Community": "aqua", "Connection Requests": "aqua", "Networking/Social": "aqua", "Volunteering": "aqua", "Meetings": "yellow", "Events": "yellow", "Editorial": "magenta", "Learning Center": "magenta", "Resource Research": "magenta", "Shop": "green", "Merch": "green", "Professional Development": "violet", "Coping": "violet", "Time Off": "violet"};
export const TASK_STATUS_COLOURS = {"Not Started": "gray", "Started": "blue", "Completed": "green", "Canceled": "brown", "Deferred": "yellow"};
export const TASK_PRIORITIES = ["Low", "Normal", "High", "Urgent"];
export const TASK_DEFAULT_PRIORITY = "Normal";
export const TASK_TAGS = ["Business Papers", "Operations", "Editorial", "Community", "Connection Requests", "Coping", "Events", "Finance", "Fundraising", "Grantmaking", "Learning Center", "Meetings", "Merch", "Monthly", "Networking/Social", "Outside Grants", "Professional Development", "Resource Research", "Shop", "Systems", "Time Off", "Volunteering", "Weekly"];
export const TASK_FILL_INS = ["name", "contact", "case", "grant"];
export const TASK_TEMPLATE_SEED = [{"id": "pJoinOnboard1", "name": "Onboard {name} into Community", "priority": "Normal", "tags": ["Community"], "who": null, "with": [], "startAfter": 0, "dueAfter": null, "body": "Their join request: {case}\nTheir contact: {contact}\n\nKeep their details out of this task: they are on their join request and their contact in the office.\n\n- [ ] Look over their join request, and the contact it found or added in the office.\n- [ ] Email them the “Stimpunks Community Membership Confirmation invite” template, with Write to them on their join request: Make their invite puts a one-use CB invite in it.\n- [ ] Add them to the mailing lists they asked for: Add them to Givebutter’s lists, on their join request.\n- [ ] Add them to the member map, if they gave a city: Put it on the member map, on their join request.\n- [ ] Add them to the Members page, if they asked: Check the Members page, then Add them to the Members page, on their join request.\n- [ ] Add their organization to the Organizations page, if they asked: Check the Organizations page, then Add it to the Organizations page, on their join request.\n- [ ] Close their join request in the office."}];
/* tasks:settings:end */
export const TASK_NAME_MAX = 200;
export const TASK_BODY_MAX = FORUM_BODY_MAX;
const TASKS = 'tasks';
const TASKS_GONE = 'tasks-gone';    // EspoCRM's or Notion's ids of tasks brought over and deleted here, so a later import leaves them deleted
const NO_TASKS = 'Tasks are for our directors, board members and administrators, on a claimed username.';

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
    edited: t.edited || null, editedBy: t.editedBy || null, talk: t.talk || null };
  if (t.espo) out.espo = t.espo;
  if (t.notion) out.notion = t.notion;
  if (t.recur) { out.recur = t.recur; out.on = t.on; }
  if (t.tpl) out.tpl = t.tpl;
  if (whole) {
    out.body = t.body || '';
    out.blocks = parseBrass(t.body || '', { boxes: true, refs: true });
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
   task that has one. A task brought over and deleted here stays deleted.

   `f.notion`, a Notion page's id, does the same for a task brought from
   Notion's Tasks (Ryan, 2026-10-21). Notion says when a page was made and not
   who made it or when it was finished, so `by: null` and `done: null` say
   nobody knows rather than naming the importer and today. */
export async function saveTask(who, f, s = store(), now = Date.now(), mods) {
  if (!tasksAllow(who)) return { error: NO_TASKS };
  if (mods === undefined) mods = await loadMods();
  f = f || {};
  const espo = typeof f.espo === 'string' && /^[A-Za-z0-9]{6,40}$/.test(f.espo) ? f.espo : null;
  if (f.espo != null && !espo) return { error: 'That is not an EspoCRM id.' };
  const notion = typeof f.notion === 'string' && /^[0-9a-f]{32}$/.test(f.notion) ? f.notion : null;
  if (f.notion != null && !notion) return { error: 'That is not a Notion page id.' };
  if (espo && notion) return { error: 'A task is brought over from EspoCRM or from Notion, not both.' };
  const from = espo || notion;
  const people = taskPeople(mods);
  if (from && (await readTaskGone(s)).includes(from)) return { error: 'That task was brought over and deleted here, so it stays deleted.' };
  let saved = null, why = null, before = null;
  await updateList(TASKS, 'tasks', (list) => {
    why = null; saved = null;
    const k = f.id != null ? list.findIndex((x) => x.id === taskId(f.id))
      : (espo ? list.findIndex((x) => x.espo === espo) : notion ? list.findIndex((x) => x.notion === notion) : -1);
    if (f.id != null && k < 0) { why = 'That task has been deleted.'; return null; }
    const had = k >= 0 ? list[k] : null;
    before = had;
    const r = taskFields(f, had, people);
    if (r.error) { why = r.error; return null; }
    const next = had ? { ...had, ...r.fields } : { id: newTaskId(), name: null, status: TASK_STATUSES[0], priority: TASK_DEFAULT_PRIORITY,
      start: null, due: null, body: '', who: null, with: [], tags: [], t: now, by: who.handle, ...r.fields };
    if (!next.name) { why = 'Give the task a name.'; return null; }
    // Made from a template by hand: which one, for the task's page to say.
    if (!had && !from && taskTplId(f.tpl)) next.tpl = taskTplId(f.tpl);
    if (espo) next.espo = espo;
    if (notion) next.notion = notion;
    // Finished when it became Completed, and not finished when it stops being.
    if (next.status === 'Completed' && !(had && had.status === 'Completed')) next.done = now;
    if (next.status !== 'Completed') delete next.done;
    if (from) {
      for (const [key, v] of [['t', f.t], ['done', f.done]]) if (typeof v === 'number' && v > 0 && v <= now) next[key] = v;
      if (typeof f.by === 'string' && cleanHandle(f.by)) next.by = cleanHandle(f.by);
      // Where the other place does not say, nobody here knows: not the importer, and not today.
      if (notion && f.by === null) next.by = null;
      if (notion && f.done === null) delete next.done;
    }
    if (from) next.synced = now;
    else if (had) { next.edited = now; next.editedBy = who.handle; }
    saved = next;
    const copy = list.slice();
    if (had) copy[k] = next; else copy.push(next);
    return copy;
  }, s);
  if (why) return { error: why };
  // An import is nobody's change, so it is in nobody's activity or list.
  if (!from) await noteTask(before ? 'changed' : 'made', who.handle, before, saved, s, now, mods).catch(() => null);
  return { task: shapeTask(saved, true) };
}

/* A checkbox in a task's description ticked or unticked in place, as EspoCRM's
   could be: box `n`, whose words the page saw were `text`, set to `on`. Only
   that line of the description changes, laid over the description as it is
   now, so two people ticking different boxes at once both keep theirs; if the
   box has moved or its words changed since the page drew it, nothing changes
   and the answer says to look again. A tick is a change, so it says who. */
export async function tickTask(who, id, n, text, on, s = store(), now = Date.now(), mods) {
  if (!tasksAllow(who)) return { error: NO_TASKS };
  if (mods === undefined) mods = await loadMods();
  if (!Number.isInteger(n) || n < 0 || typeof text !== 'string' || typeof on !== 'boolean') return { error: 'Tick which box?' };
  let saved = null, why = null, before = null;
  await updateList(TASKS, 'tasks', (list) => {
    saved = null; why = null;
    const k = list.findIndex((x) => x.id === taskId(id));
    if (k < 0) { why = 'That task has been deleted.'; return null; }
    before = list[k];
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
  if (saved !== before) await noteTask('ticked', who.handle, before, saved, s, now, mods, { box: text.trim(), on }).catch(() => null);
  return { task: shapeTask(saved, true) };
}

export async function removeTask(who, id, s = store(), now = Date.now(), mods) {
  if (!tasksAllow(who)) return { error: NO_TASKS };
  if (mods === undefined) mods = await loadMods();
  let gone = null;
  await updateList(TASKS, 'tasks', (list) => {
    const k = list.findIndex((x) => x.id === taskId(id));
    gone = k >= 0 ? list[k] : null;
    return gone ? list.filter((_, i) => i !== k) : null;
  }, s);
  if (!gone) return { error: 'That task has already been deleted.' };
  const was = gone.espo || gone.notion;
  if (was) await updateList(TASKS_GONE, 'ids', (ids) => (ids.includes(was) ? null : [...ids, was]), s);
  // Its comments go with it, as its activity does.
  await s.delete(taskCommentsBlob(gone.id));
  await dropLinksFrom(`taskc:${gone.id}/`, false, s);
  await noteTask('deleted', who.handle, gone, null, s, now, mods).catch(() => null);
  return { gone: true };
}
async function readTaskGone(s) {
  const d = await s.get(TASKS_GONE, { type: 'json' });
  return d && Array.isArray(d.ids) ? d.ids : [];
}

/* ACTIVITY AND NOTIFICATIONS (Ryan's ask, 2026-10-21, after EspoCRM's stream
   and notifications and Notion's inbox). Every change a person makes to a task
   is an event: who, when, which task (its id, and its name then), and what
   changed, each field from what to what. A description's edit is said without
   its words, and a tick with the words of the box ticked. A task a recurring
   task makes is an event under nobody's name; an import from EspoCRM is
   nobody's change and makes none.

   A task's events are its activity, kept beside it in task-activity/<task id>,
   newest first and TASK_ACTIVITY_KEEP at most, shown on its page and deleted
   with it.

   Each event also goes into the notification list of everybody it concerns
   but the person who made it: whoever the task is assigned to and whoever is
   on it, before and after the change, so being taken off a task is news; whoever
   made it; and anybody the change newly @mentions in its description. Only
   somebody taskPeople still names is told. A list is task-inbox/<pet key>, each
   entry the event, why it is there (`why`: assigned, added, removed, mentioned
   or yours) and whether it has been read; TASK_INBOX_KEEP at most and none older
   than TASK_INBOX_DAYS. Nobody else is told what is in anybody's list. Forget me
   and deleting the username delete it. It says how many are unread, which is
   fine here (tasks are a backend tool). Nothing is sent anywhere else. */
export const TASK_ACTIVITY_KEEP = 200;
export const TASK_INBOX_KEEP = 200;
export const TASK_INBOX_DAYS = 30;
const TASK_INBOX_TRIES = 40;
const TASK_FIELDS = ['name', 'status', 'priority', 'start', 'due', 'who', 'with', 'tags'];
const TASK_WHY = ['assigned', 'added', 'removed', 'mentioned', 'yours', 'commented'];
const taskActivityBlob = (id) => `task-activity/${id}`;
const taskInboxBlob = (pk) => `task-inbox/${pk}`;
const sameList = (a, b) => JSON.stringify(a || []) === JSON.stringify(b || []);

/* What a change changed, field by field: a description only that it changed. */
export function taskChanges(had, next) {
  const out = [];
  for (const k of TASK_FIELDS) {
    const a = had[k] === undefined ? null : had[k], b = next[k] === undefined ? null : next[k];
    if (Array.isArray(a) || Array.isArray(b) ? !sameList(a, b) : a !== b) out.push({ field: k, from: a, to: b });
  }
  if ((had.body || '') !== (next.body || '')) out.push({ field: 'body' });
  return out;
}

/* Who an event concerns, and why, leaving out whoever made it. A comment
   concerns everybody on the task, whoever made it, anybody who commented on
   it before, and anybody it newly @mentions; an edited comment concerns only
   the people it newly @mentions, as an edited forum post does. A role it
   newly calls (@board, say) mentions everybody on Tasks who holds it: every
   reader of Tasks and the office is the base, so any of them may call any
   role (mentionableRoles), and nobody is told who else holds it. */
function taskConcerns(kind, by, had, next, people, extra = {}, mods = null) {
  const live = (h) => (h ? people.find((p) => foldHandle(p) === foldHandle(h)) : null);
  const onIt = (t) => (t ? [t.who, ...(t.with || [])].filter(Boolean) : []);
  const has = (list, h) => list.some((x) => foldHandle(x) === foldHandle(h));
  const out = new Map();
  const add = (h, why) => {
    const p = live(h);
    if (!p || (by && foldHandle(p) === foldHandle(by))) return;
    const was = out.get(foldHandle(p));
    if (!was || TASK_WHY.indexOf(why) < TASK_WHY.indexOf(was[1])) out.set(foldHandle(p), [p, why]);
  };
  const before = onIt(had), after = onIt(next), task = next || had;
  const holds = (p, said, was) => {
    const m = mods && mods.get(foldHandle(p));
    return !!m && ROLES.some((r) => m.roles.has(r) && atName(said, r) && !atName(was, r));
  };
  if (kind === 'commented') {
    const said = extra.comment ? extra.comment.body : '', was = extra.was || '';
    for (const p of people) if ((mentions(said, p) && !mentions(was, p)) || holds(p, said, was)) add(p, 'mentioned');
    if (extra.edit) return [...out.values()];
    for (const h of after) add(h, 'yours');
    if (task.by) add(task.by, 'yours');
    for (const h of extra.earlier || []) add(h, 'commented');
    return [...out.values()];
  }
  if (kind === 'deleted') { for (const h of before) add(h, 'yours'); }
  else {
    for (const h of after) add(h, has(before, h) ? 'yours' : (foldHandle(next.who || '') === foldHandle(h) ? 'assigned' : 'added'));
    for (const h of before) if (!has(after, h)) add(h, 'removed');
    for (const p of people) {
      const said = next.body || '', was = (had && had.body) || '';
      if ((mentions(said, p) && !mentions(was, p)) || holds(p, said, was)) add(p, 'mentioned');
    }
  }
  if (task.by) add(task.by, 'yours');
  return [...out.values()];
}

async function noteTask(kind, by, had, next, s, now, mods, extra = {}) {
  const task = next || had;
  const changes = kind === 'changed' ? taskChanges(had, next) : [];
  if (!task || (kind === 'changed' && !changes.length)) return;
  const ev = { id: 'e' + randomBytes(9).toString('base64url'), t: now, by: by || null, task: task.id, name: task.name, kind, changes };
  if (kind === 'ticked') ev.box = { text: String(extra.box || '').slice(0, 200), on: !!extra.on };
  // A comment's event names the comment and never keeps its words: they are the comment's, and go with it.
  if (kind === 'commented') ev.comment = extra.comment.id;
  if (kind === 'deleted') await s.delete(taskActivityBlob(task.id));
  // An edited comment is not a change to the task, so it is in nobody's activity; it only tells whoever it newly @mentions.
  else if (!extra.edit) await updateList(taskActivityBlob(task.id), 'events', (list) => [ev, ...list].slice(0, TASK_ACTIVITY_KEEP), s);
  await tellTaskPeople(ev, taskConcerns(kind, by, had, next, taskPeople(mods), extra, mods), s, now, mods, extra.send);
}

/* Each person an event concerns gets it in their Notifications, and then their
   devices are told. */
async function tellTaskPeople(ev, told, s, now, mods, send) {
  const since = now - TASK_INBOX_DAYS * 86400000;
  for (const [h, why] of told) {
    // A person's list is the one blob many changes can race for at once, so it waits longer than most for its turn.
    await updateList(taskInboxBlob(petKey(h)), 'items',
      (list) => [{ ...ev, why, read: false }, ...list.filter((x) => x.t >= since)].slice(0, TASK_INBOX_KEEP), s, TASK_INBOX_TRIES);
    // Their devices are told only once it is in their list (notifyTask, the tasks switch).
    await notifyTask(h, { ...ev, why }, s, mods, send || sendPush).catch(() => null);
  }
}

/* AN OFFICE COMMENT'S NOTIFICATIONS go in the same Notifications as a task's
   (Ryan's ask, 2026-10-21, comments in the office), because the office's
   readers are Tasks' readers and one list is the place to look. The office is
   sealed and this list is not, so an entry names the record only by its id
   and what it is, never its name, and never the comment's words. It concerns
   whoever added the record, anybody who commented on it before, and anybody
   the comment @mentions; an edit, only anybody it newly @mentions. */
export async function noteOfficeComment(what, rec, by, comment, extra, s = store(), now = Date.now(), mods) {
  if (mods === undefined) mods = await loadMods();
  const ev = { id: 'e' + randomBytes(9).toString('base64url'), t: now, by, kind: 'office', what, rec, comment: comment.id };
  const record = { who: null, with: [], by: extra.maker || null };
  const told = taskConcerns('commented', by, record, record, taskPeople(mods), { comment, was: extra.was, edit: extra.edit, earlier: extra.earlier }, mods);
  await tellTaskPeople(ev, told, s, now, mods, extra.send);
}

/* A reader's own list, newest first, with how many are unread, and the tasks
   of theirs due by tomorrow or overdue, worked out from the tasks now. */
export async function taskInbox(who, s = store(), now = Date.now()) {
  if (!tasksAllow(who)) return null;
  const since = now - TASK_INBOX_DAYS * 86400000;
  const d = await s.get(taskInboxBlob(petKey(who.handle)), { type: 'json' });
  const items = (d && Array.isArray(d.items) ? d.items : []).filter((x) => x.t >= since);
  const todayIs = today(new Date(now)), tomorrow = addDays(todayIs, 1);
  const mine = (t) => [t.who, ...(t.with || [])].some((h) => h && foldHandle(h) === foldHandle(who.handle));
  const due = (await readTasks(s)).filter((t) => mine(t) && t.due && t.due <= tomorrow && !TASK_DONE.includes(t.status))
    .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0)).map((t) => ({ id: t.id, name: t.name, due: t.due, status: t.status }));
  return { items, unread: items.filter((x) => !x.read).length, due, today: todayIs };
}

/* Entries marked read: those `ids` name, or every one. */
export async function readTaskInbox(who, ids, s = store()) {
  if (!tasksAllow(who)) return { error: NO_TASKS };
  const all = ids === 'all';
  if (!all && (!Array.isArray(ids) || ids.length > TASK_INBOX_KEEP || ids.some((x) => typeof x !== 'string'))) return { error: 'Mark which as read?' };
  let unread = 0;
  await updateList(taskInboxBlob(petKey(who.handle)), 'items', (list) => {
    let moved = false;
    const next = list.map((x) => { if (!x.read && (all || ids.includes(x.id))) { moved = true; return { ...x, read: true }; } return x; });
    unread = next.filter((x) => !x.read).length;
    return moved ? next : null;
  }, s);
  return { unread };
}

/* A task's own activity, newest first. */
export async function taskActivity(who, id, s = store()) {
  if (!tasksAllow(who)) return null;
  const t = taskId(id);
  if (!t) return [];
  const d = await s.get(taskActivityBlob(t), { type: 'json' });
  return d && Array.isArray(d.events) ? d.events : [];
}

/* THE FEED (Ryan's ask, 2026-10-21, after Notion's Feed view): tasks as cards,
   newest activity first, each with its description to read and tick, and what
   happened to it last. The page orders and filters the list it already has
   and asks for one page of cards at a time, so the feed costs one read of the
   tasks and one of each card's activity, and keeps nothing: it is worked out
   from what Tasks already keeps. */
export const FEED_PAGE = 20;
const FEED_ACTS = 3;
const FEED_COMMENTS = 2;
export async function taskFeed(who, ids, s = store()) {
  if (!tasksAllow(who)) return null;
  const want = [...new Set((Array.isArray(ids) ? ids : []).map(taskId).filter(Boolean))].slice(0, FEED_PAGE);
  if (!want.length) return [];
  const all = await readTasks(s);
  const found = want.map((id) => all.find((t) => t.id === id)).filter(Boolean);
  return Promise.all(found.map(async (t) => {
    const [d, c] = await Promise.all([s.get(taskActivityBlob(t.id), { type: 'json' }), s.get(taskCommentsBlob(t.id), { type: 'json' })]);
    const said = c && Array.isArray(c.comments) ? c.comments : [];
    return { task: shapeTask(t, true), acts: d && Array.isArray(d.events) ? d.events.slice(0, FEED_ACTS) : [],
      comments: said.slice(-FEED_COMMENTS).map((x) => shapeComment(x, who)), said: said.length };
  }));
}

export async function forgetTaskInbox(pk, s = store()) {
  await s.delete(taskInboxBlob(pk));
  return true;
}

/* COMMENTS (Ryan's ask, 2026-10-21, after EspoCRM's stream posts and Notion's
   comments): a conversation under a task, in task-comments/<task id>, oldest
   first, each its words in Markdown, who wrote it, when, and when it was last
   edited. A comment is kept with its writer's authorMark, the forums' hash of
   the folded username and when it was claimed, which never leaves the server:
   only the person who wrote one edits it, and a name deleted and claimed again
   by somebody else cannot reach the old owner's comments. Whoever wrote one, or
   an administrator, deletes it. A comment goes in the task's activity and the
   notifications of the people it concerns as that it was made, never its
   words; editing one tells only anybody it newly @mentions. The task keeps
   `talk`, when it was last commented on, so the Feed can put it first; a
   comment is not a change to the task, so it sets no `edited`. Comments stay
   when a username is deleted, as the tasks do: they are the organisation's
   work, with the username on them as words. They go with their task. */
export const TASK_COMMENT_MAX = 5000;
export const TASK_COMMENTS_KEEP = 500;
const taskCommentsBlob = (id) => `task-comments/${id}`;
export function commentId(v) { return typeof v === 'string' && /^m[A-Za-z0-9_-]{12}$/.test(v) ? v : null; }
const newCommentId = () => 'm' + randomBytes(9).toString('base64url');

function shapeComment(c, who) {
  const out = { id: c.id, by: c.by, t: c.t, edited: c.edited || null, body: c.body, blocks: parseBrass(c.body, { refs: true }),
    mine: !!who && !!who.since && !!c.mark && c.mark === authorMark(who) };
  // One brought from Notion says so, and never sends Notion's id for it.
  if (c.notion) out.from = 'notion';
  return out;
}

export async function taskComments(who, id, s = store()) {
  if (!tasksAllow(who)) return null;
  const t = taskId(id);
  if (!t) return [];
  const d = await s.get(taskCommentsBlob(t), { type: 'json' });
  return (d && Array.isArray(d.comments) ? d.comments : []).map((c) => shapeComment(c, who));
}

export async function commentTask(who, id, text, s = store(), now = Date.now(), mods) {
  if (!tasksAllow(who)) return { error: NO_TASKS };
  if (mods === undefined) mods = await loadMods();
  const tid = taskId(id);
  const words = cleanForumBody(text, TASK_COMMENT_MAX);
  if (!words) return { error: `A comment is between one and ${TASK_COMMENT_MAX} characters.` };
  const task = tid ? (await readTasks(s)).find((x) => x.id === tid) : null;
  if (!task) return { error: 'That task has been deleted.' };
  const c = { id: newCommentId(), by: who.handle, mark: authorMark(who), t: now, body: words };
  let full = false, earlier = [];
  await updateList(taskCommentsBlob(tid), 'comments', (list) => {
    full = list.length >= TASK_COMMENTS_KEEP;
    earlier = list.map((x) => x.by);
    return full ? null : [...list, c];
  }, s);
  if (full) return { error: `This task has ${TASK_COMMENTS_KEEP} comments, as many as it keeps. Delete one, or carry on in a new task.` };
  // When it was last talked about, for the Feed. A task deleted meanwhile takes the comment with it.
  let gone = false;
  await updateList(TASKS, 'tasks', (list) => {
    const k = list.findIndex((x) => x.id === tid);
    gone = k < 0;
    if (gone || (list[k].talk || 0) >= now) return null;
    const copy = list.slice(); copy[k] = { ...list[k], talk: now }; return copy;
  }, s);
  if (gone) { await s.delete(taskCommentsBlob(tid)); await dropLinksFrom(`taskc:${tid}/`, false, s); return { error: 'That task has been deleted.' }; }
  await noteTask('commented', who.handle, task, task, s, now, mods, { comment: c, earlier }).catch(() => null);
  return { comment: shapeComment(c, who) };
}

export async function editTaskComment(who, id, cid, text, s = store(), now = Date.now(), mods) {
  if (!tasksAllow(who)) return { error: NO_TASKS };
  if (mods === undefined) mods = await loadMods();
  const tid = taskId(id), k0 = commentId(cid);
  if (!tid || !k0) return { error: 'Edit which comment?' };
  const words = cleanForumBody(text, TASK_COMMENT_MAX);
  if (!words) return { error: `A comment is between one and ${TASK_COMMENT_MAX} characters.` };
  let saved = null, was = null, why = null;
  await updateList(taskCommentsBlob(tid), 'comments', (list) => {
    saved = null; was = null; why = null;
    const k = list.findIndex((x) => x.id === k0);
    if (k < 0) { why = 'That comment has been deleted.'; return null; }
    if (list[k].mark !== authorMark(who)) { why = 'Only whoever wrote a comment can change it.'; return null; }
    if (list[k].body === words) { saved = list[k]; return null; }
    was = list[k].body;
    saved = { ...list[k], body: words, edited: now };
    const copy = list.slice(); copy[k] = saved; return copy;
  }, s);
  if (why) return { error: why };
  const task = was != null ? (await readTasks(s)).find((x) => x.id === tid) : null;
  if (task) await noteTask('commented', who.handle, task, task, s, now, mods, { comment: saved, was, edit: true }).catch(() => null);
  return { comment: shapeComment(saved, who) };
}

export async function removeTaskComment(who, id, cid, s = store()) {
  if (!tasksAllow(who)) return { error: NO_TASKS };
  const tid = taskId(id), k0 = commentId(cid);
  if (!tid || !k0) return { error: 'Delete which comment?' };
  let why = null, gone = null;
  await updateList(taskCommentsBlob(tid), 'comments', (list) => {
    why = null; gone = null;
    const k = list.findIndex((x) => x.id === k0);
    if (k < 0) { why = 'That comment has already been deleted.'; return null; }
    if (list[k].mark !== authorMark(who) && !who.roles.has('administrator')) { why = 'Only whoever wrote a comment, or an administrator, can delete it.'; return null; }
    gone = list[k];
    return list.filter((_, i) => i !== k);
  }, s);
  if (why) return { error: why };
  // One brought from Notion and deleted here stays deleted when comments are brought again.
  if (gone && gone.notion) await updateList(TASKS_GONE, 'ids', (ids) => (ids.includes(gone.notion) ? null : [...ids, gone.notion]), s);
  return { gone: true };
}

/* COMMENTS BROUGHT FROM NOTION (Ryan's ask, 2026-10-21): a comment on a task's
   page in Notion's Tasks, kept as a comment here with Notion's id for it, so
   bringing them again changes one rather than adding it twice, leaves alone one
   edited here, and leaves deleted one deleted here (its id goes in TASKS_GONE,
   beside the tasks'). It keeps who wrote it, as the CB username the importer
   names, and when, and sits among the task's comments by that time. Its mark
   is that username's as it is claimed now, so its writer can edit or delete it
   here; a username not claimed gives it none, and then only an administrator
   can. An import is nobody's change: it is in no activity and tells nobody. */
export async function importTaskComment(who, f, s = store(), now = Date.now()) {
  if (!tasksAllow(who)) return { error: NO_TASKS };
  f = f || {};
  const notion = typeof f.notion === 'string' && /^[0-9a-f]{32}$/.test(f.notion) ? f.notion : null;
  if (!notion) return { error: 'That is not a Notion comment id.' };
  const words = cleanForumBody(f.body, TASK_COMMENT_MAX);
  if (!words) return { error: `A comment is between one and ${TASK_COMMENT_MAX} characters.` };
  const t = typeof f.t === 'number' && f.t > 0 && f.t <= now ? f.t : null;
  if (!t) return { error: 'Say when it was written, no later than now.' };
  const by = cleanHandle(f.by);
  if (!by) return { error: 'Say who wrote it, as their username.' };
  if ((await readTaskGone(s)).includes(notion)) return { error: 'That comment was brought over and deleted here, so it stays deleted.' };
  const tid = taskId(f.id);
  const task = tid ? (await readTasks(s)).find((x) => x.id === tid) : null;
  if (!task) return { error: 'That task has been deleted.' };
  const acct = await readAccount(by, s);
  const mark = acct && acct.since ? authorMark({ handle: acct.handle, since: acct.since }) : null;
  let saved = null, made = false, full = false;
  await updateList(taskCommentsBlob(tid), 'comments', (list) => {
    saved = null; made = false; full = false;
    const k = list.findIndex((x) => x.notion === notion);
    if (k >= 0) {
      const had = list[k];
      // Changed here, or the same as it was: left as it is.
      if (had.edited || (had.body === words && had.by === by && had.t === t)) { saved = had; return null; }
      saved = { ...had, body: words, by, t, mark: had.mark || mark };
      const copy = list.slice(); copy[k] = saved;
      return copy.sort((a, b) => a.t - b.t);
    }
    if (list.length >= TASK_COMMENTS_KEEP) { full = true; return null; }
    made = true;
    saved = { id: newCommentId(), by, mark, t, body: words, notion };
    return [...list, saved].sort((a, b) => a.t - b.t);
  }, s);
  if (full) return { error: `This task has ${TASK_COMMENTS_KEEP} comments, as many as it keeps.` };
  // When it was last talked about, for the Feed: an old comment never makes a task look newer than it is.
  await updateList(TASKS, 'tasks', (list) => {
    const k = list.findIndex((x) => x.id === tid);
    if (k < 0 || (list[k].talk || 0) >= t) return null;
    const copy = list.slice(); copy[k] = { ...list[k], talk: t }; return copy;
  }, s);
  return { comment: shapeComment(saved, who), made };
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
const TASK_VIEW_KEYS = new Set(['q', 'status', 'priority', 'tags', 'who', 'due', 'sort', 'dir', 'cols', 'group', 'from', 'span']);
const taskViewsBlob = (k) => `task-views/${k}`;
const taskViewId = (v) => (typeof v === 'string' && /^v[A-Za-z0-9_-]{10}$/.test(v) ? v : null);

/* An address a saved filter may hold: #/ for the list, #/board for the board,
   #/timeline for the timeline or #/feed for the feed, and after a ? only the
   filters tasks.js writes, each once, encoded as it encodes them (group, the
   list's Group by, since 2026-10-21). Anything else is null. */
export function taskAddress(v) {
  if (typeof v !== 'string' || v.length > TASK_VIEW_ADDRESS_MAX) return null;
  const m = /^#\/(board|timeline|feed)?(?:\?([A-Za-z0-9%._~!*'(),&=+-]*))?$/.exec(v);
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
export async function makeRecurring(s = store(), now = Date.now(), mods) {
  if (mods === undefined) mods = await loadMods();
  const day = today(new Date(now));
  const due = (await readRecurs(s)).filter((r) => r.on && r.next && r.next <= day);
  if (!due.length) return { made: 0 };
  const want = [];
  for (const r of due) {
    let d = r.next;
    for (let i = 0; i < TASK_CATCH_UP && d <= day; i++) { want.push({ r, d }); d = recurAfter(r, d); }
  }
  let made = 0, added = [];
  await updateList(TASKS, 'tasks', (list) => {
    const there = new Set(list.filter((t) => t.recur).map((t) => t.recur + ' ' + t.on));
    const add = want.filter((w) => !there.has(w.r.id + ' ' + w.d)).map((w) => recurTask(w.r, w.d, now));
    made = add.length; added = add;
    return add.length ? list.concat(add) : null;
  }, s);
  // Each task a recurring task made is news to whoever it goes to, under nobody's name.
  for (const t of added) await noteTask('recurred', null, null, t, s, now, mods).catch(() => null);
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
  if (whole) { out.body = r.body || ''; out.blocks = parseBrass(r.body || '', { boxes: true, refs: true }); } else out.words = [...(r.body || '')].length;
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
export async function saveRecur(who, f, s = store(), now = Date.now(), mods) {
  if (!tasksAllow(who)) return { error: NO_TASKS };
  if (mods === undefined) mods = await loadMods();
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

/* TEMPLATES (Ryan's ask, 2026-10-22, to make onboarding a new community
   member less manual): a task to start from, as a forum template is a topic
   to start from. Every one is the team's, in one blob, task-templates, and
   keeps a name, a description, who its tasks go to and who else is on them,
   their priority and tags, `startAfter` and `dueAfter` (days after the day a
   task is made from it, or null for no day), who made it and changed it and
   when.

   A NAME OR A DESCRIPTION CAN HOLD FILL-INS, TASK_FILL_INS from data/tasks.json:
   {name}, somebody's name, and {contact}, {case} and {grant}, links to their
   records in the office. Making a task from a template by hand puts those in
   the form for the director to replace (tasks.js refuses to save one still
   there); the office's intake fills them itself (makeFromTemplate), because a
   form says who and makes the records. A link fill-in goes in the description
   and never the name, because a name is plain words.

   THE TEMPLATES TASKS STARTS WITH are TASK_TEMPLATE_SEED, written from
   data/tasks.json, each with a fixed id so data/office.json's intake can name
   one. They are read only while the blob does not exist: once anybody saves a
   template, the blob is the list, so a seeded template changed or deleted in
   Tasks stays as it was left. A task made from a template keeps `tpl`, which
   one. Deleting a template leaves the tasks made from it. */
export const TASK_TEMPLATES_KEEP = 200;
const TASK_TEMPLATES = 'task-templates';
export function taskTplId(v) { return typeof v === 'string' && /^p[A-Za-z0-9_-]{12}$/.test(v) ? v : null; }
const newTaskTplId = () => 'p' + randomBytes(9).toString('base64url');
const TASK_FILL_LINK = { contact: 'contact', case: 'case', grant: 'grant' };

/* The fill-ins in some words that tasks do not know, each once. */
export function unknownTaskFills(text) {
  const out = [];
  for (const m of String(text || '').matchAll(/\{(\w+)\}/g)) if (!TASK_FILL_INS.includes(m[1]) && !out.includes(m[0])) out.push(m[0]);
  return out;
}

export async function readTaskTpls(s = store()) {
  const d = await s.get(TASK_TEMPLATES, { type: 'json' });
  if (!d) return TASK_TEMPLATE_SEED.map((x) => ({ ...x, t: 0, by: null }));
  return Array.isArray(d.templates) ? d.templates : [];
}
async function updateTaskTpls(change, s) {
  let out = null;
  await updateDoc(TASK_TEMPLATES, (cur) => {
    const list = cur && Array.isArray(cur.templates) ? cur.templates.slice() : TASK_TEMPLATE_SEED.map((x) => ({ ...x, t: 0, by: null }));
    const next = change(list);
    out = next;
    return next === null ? null : { templates: next };
  }, s);
  return out;
}

export function shapeTaskTpl(p, whole = false) {
  const out = { id: p.id, name: p.name, priority: p.priority, who: p.who || null, with: p.with || [], tags: p.tags || [],
    startAfter: p.startAfter == null ? null : p.startAfter, dueAfter: p.dueAfter == null ? null : p.dueAfter,
    t: p.t || null, by: p.by || null, edited: p.edited || null, editedBy: p.editedBy || null };
  if (whole) { out.body = p.body || ''; out.blocks = parseBrass(p.body || '', { boxes: true, refs: true }); } else out.words = [...(p.body || '')].length;
  return out;
}

export async function taskTemplates(who, s = store()) {
  if (!tasksAllow(who)) return null;
  return (await readTaskTpls(s)).map((p) => shapeTaskTpl(p)).sort((a, b) => a.name.localeCompare(b.name));
}
export async function taskTemplate(who, id, s = store()) {
  if (!tasksAllow(who)) return null;
  const p = (await readTaskTpls(s)).find((x) => x.id === taskTplId(id));
  return p ? shapeTaskTpl(p, true) : null;
}

/* A template made, or changed, as saveRecur does a recurring task: only the
   fields sent change. Its name is checked as a task's is, with room for what
   {name} becomes. */
export async function saveTaskTemplate(who, f, s = store(), now = Date.now(), mods) {
  if (!tasksAllow(who)) return { error: NO_TASKS };
  if (mods === undefined) mods = await loadMods();
  f = f || {};
  const people = taskPeople(mods);
  let saved = null, why = null;
  await updateTaskTpls((list) => {
    why = null; saved = null;
    const k = f.id != null ? list.findIndex((x) => x.id === taskTplId(f.id)) : -1;
    if (f.id != null && k < 0) { why = 'That template has been deleted.'; return null; }
    const had = k >= 0 ? list[k] : null;
    if (!had && list.length >= TASK_TEMPLATES_KEEP) { why = `There can be up to ${TASK_TEMPLATES_KEEP} templates. Delete one first.`; return null; }
    const pick = {};
    for (const key of ['name', 'priority', 'body', 'who', 'with', 'tags']) if (f[key] !== undefined) pick[key] = f[key];
    const r = taskFields(pick, had, people);
    if (r.error) { why = r.error; return null; }
    const out = r.fields;
    for (const [key, word] of [['startAfter', 'starts'], ['dueAfter', 'is due']]) {
      if (f[key] === undefined) continue;
      if (f[key] === null || f[key] === '') { out[key] = null; continue; }
      if (!Number.isInteger(f[key]) || f[key] < 0 || f[key] > TASK_AFTER_MAX) { why = `Each task ${word} a whole number of days after it is made, from 0 to ${TASK_AFTER_MAX}, or on no day.`; return null; }
      out[key] = f[key];
    }
    const next = had ? { ...had, ...out } : { id: newTaskTplId(), name: null, priority: TASK_DEFAULT_PRIORITY, body: '', who: null,
      with: [], tags: [], startAfter: null, dueAfter: null, t: now, by: who.handle, ...out };
    if (!next.name) { why = 'Give the template a name.'; return null; }
    if (next.startAfter != null && next.dueAfter != null && next.dueAfter < next.startAfter) { why = 'A task cannot be due before it starts.'; return null; }
    const unknown = unknownTaskFills(next.name + '\n' + next.body);
    if (unknown.length) { why = `Tasks have no fill-in called ${unknown.join(', ')}. They know ${TASK_FILL_INS.map((x) => '{' + x + '}').join(', ')}.`; return null; }
    const linked = Object.keys(TASK_FILL_LINK).filter((x) => next.name.includes('{' + x + '}'));
    if (linked.length) { why = `${linked.map((x) => '{' + x + '}').join(' and ')} is a link, so it goes in the description, not the name.`; return null; }
    if (had) { next.edited = now; next.editedBy = who.handle; }
    saved = next;
    const copy = list.slice();
    if (had) copy[k] = next; else copy.push(next);
    return copy;
  }, s);
  if (why) return { error: why };
  return { template: shapeTaskTpl(saved, true) };
}

/* Deleting a template makes no more tasks from it; the ones made stay. */
export async function removeTaskTemplate(who, id, s = store()) {
  if (!tasksAllow(who)) return { error: NO_TASKS };
  let gone = false;
  await updateTaskTpls((list) => {
    gone = list.some((x) => x.id === taskTplId(id));
    return gone ? list.filter((x) => x.id !== taskTplId(id)) : null;
  }, s);
  if (!gone) return { error: 'That template has already been deleted.' };
  return { gone: true };
}

/* A task made from a template by the office's intake, never by a page: its
   fill-ins filled from `fill` ({ name, contact, case, grant }, the last three
   ids), starting and due so many days after `day`, under nobody's name, as a
   recurring task's task is, keeping which template made it. A fill-in with
   nothing to fill it says so in words rather than staying a fill-in. Answers
   the task, or null when there is no such template. */
async function makeFromTemplate(id, fill, day0, s, now, mods) {
  const p = (await readTaskTpls(s)).find((x) => x.id === taskTplId(id));
  if (!p) return null;
  const words = { name: [...tidy(fill.name || '')].slice(0, 120).join('') || 'somebody' };
  for (const [k, kind] of Object.entries(TASK_FILL_LINK)) {
    const ok = fill[k] && LINK_KINDS[kind].ok(fill[k]);
    words[k] = ok ? `[[${kind}:${fill[k]}]]` : `(no ${LINK_KINDS[kind].words.replace(/^an? /, '')})`;
  }
  const filled = (text) => String(text || '').replace(/\{(\w+)\}/g, (m, k) => (Object.hasOwn(words, k) ? words[k] : m));
  const task = { id: newTaskId(), name: [...filled(p.name).replace(/\s+/g, ' ').trim()].slice(0, TASK_NAME_MAX).join(''),
    status: TASK_STATUSES[0], priority: p.priority || TASK_DEFAULT_PRIORITY,
    start: p.startAfter == null ? null : addDays(day0, p.startAfter), due: p.dueAfter == null ? null : addDays(day0, p.dueAfter),
    body: [...filled(p.body)].slice(0, TASK_BODY_MAX).join(''), who: p.who || null, with: p.with || [], tags: p.tags || [],
    t: now, by: null, tpl: p.id };
  // Who it goes to is checked again, so a template naming somebody no longer on the list makes a task for nobody.
  const people = taskPeople(mods);
  const live = (h) => people.find((x) => foldHandle(x) === foldHandle(h)) || null;
  task.who = task.who ? live(task.who) : null;
  task.with = task.with.map(live).filter(Boolean);
  await updateList(TASKS, 'tasks', (list) => list.concat([task]), s);
  await noteTask('formed', null, null, task, s, now, mods).catch(() => null);
  return task;
}

/* ── The member map ─────────────────────────────────────────────────────

   Beside the office and not in it: its pins are public, so they are not sealed,
   and only which join request a pin came from is, on the case. */

/* THE MEMBER MAP (Ryan's brief, 2026-10-22: "Let's move the member map off of
   Google into S.W"). The map of where our community is, which was a Google My
   Maps map embedded on stimpunks.org's Individuals page, hangs on the
   Community Center's wall now, and stimpunks.org shows the same map as an
   image served from here (/cb/member-map.svg). The Join form asks for a city
   "to be added to our member map", and says a name will not be on it.

   A PIN IS A PLACE, ONE FOR EACH MEMBER WHO GAVE ONE, AND THE MAP SAYS HOW MANY
   ARE IN EACH PLACE (Ryan's call, the same evening, over one pin per place with
   no numbers: "We like knowing how many folks are in each place"; the Mission
   says the street counts people here). One blob, member-map, holds the pins,
   each an id, a place's name, its country, a latitude and a longitude, and for
   the pins brought from Google its key there; nothing about anybody. What
   anybody is shown (memberMap) is every place once, with how many pins are
   there, never an id. Which join request a pin came from is kept on the case,
   sealed (`pin`), so taking somebody off the map takes theirs; deleting the case
   takes it too. The pins brought from Google belong to no case, and a director
   takes one of those off a place by hand (mapTakeOne).

   A PLACE IS LOOKED UP ON OPENSTREETMAP, FROM THE SERVER, AT A DIRECTOR'S PRESS
   (mapFind): the words of the place, and nothing else, go to Nominatim, which
   answers with places to choose from; nothing reaches OpenStreetMap from a
   visitor's browser. A place within MAP_NEAR_KM of one already on the map joins
   it, its name and point the same, so a city is one place with how many are
   there rather than a cluster of nearly-the-same points. Only the office's
   readers put pins on the map or take them off. */
export const MEMBER_MAP_MAX = 5000;
export const MAP_NEAR_KM = 25;
export const MAP_IMPORT_MAX = 500;
const MEMBER_MAP = 'member-map';
const MAP_SEARCH = 'https://nominatim.openstreetmap.org/search';
const MAP_AGENT = 'Stimpunks.World office (https://stimpunks.world/privacy.html#member-map)';
const PLACE_MAX = 80;
export function pinId(v) { return typeof v === 'string' && /^w[A-Za-z0-9_-]{12}$/.test(v) ? v : null; }
const newPinId = () => 'w' + randomBytes(9).toString('base64url');
const mapWords = (v, max = PLACE_MAX) => { const t = tidy(v == null ? '' : String(v)); return t ? [...t].slice(0, max).join('') : ''; };
const mapCoord = (v, lim) => { const n = Number(v); return v !== null && v !== '' && Number.isFinite(n) && Math.abs(n) <= lim ? Math.round(n * 10000) / 10000 : null; };
const placeKey = (p) => `${p.lat.toFixed(4)},${p.lon.toFixed(4)}`;
function kmApart(a, b) {
  const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export async function readMemberMap(s = store()) {
  const d = await s.get(MEMBER_MAP, { type: 'json' });
  return d && Array.isArray(d.pins) ? d.pins : [];
}

/* Every place once, with how many pins are there. */
export function groupPins(pins) {
  const by = new Map();
  for (const p of pins) {
    const k = placeKey(p);
    const g = by.get(k) || { place: p.place, country: p.country || '', lat: p.lat, lon: p.lon, n: 0 };
    g.n++;
    by.set(k, g);
  }
  return [...by.values()];
}
function nearestPlace(places, at) {
  let best = null;
  for (const g of places) { const d = kmApart(g, at); if (d <= MAP_NEAR_KM && (!best || d < best.d)) best = { g, d }; }
  return best;
}

/* What anybody is shown, on the wall and in the image: every place, where it
   is on the map, and how many of us are there; each country and how many; and
   how many in all. */
export async function memberMap(s = store()) {
  const places = groupPins(await readMemberMap(s)).map((g) => ({ ...g, ...project(g.lat, g.lon) }))
    .sort((a, b) => (a.country || '').localeCompare(b.country || '') || a.place.localeCompare(b.place));
  const countries = new Map();
  for (const p of places) countries.set(p.country, (countries.get(p.country) || 0) + p.n);
  return { places, countries: [...countries].map(([country, n]) => ({ country, n })), total: places.reduce((a, p) => a + p.n, 0) };
}
async function dropPin(id, s) {
  await updateList(MEMBER_MAP, 'pins', (list) => (list.some((x) => x.id === id) ? list.filter((x) => x.id !== id) : null), s);
}

/* The places Nominatim finds for some words, each with the place on the map
   near it, if there is one, which a pin there would join. */
export async function mapFind(who, q, s = store(), fetchFn = fetch) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  const words = mapWords(q, 200);
  if (!words) return { error: 'Find which place?' };
  const url = `${MAP_SEARCH}?format=jsonv2&addressdetails=1&limit=5&accept-language=en&q=${encodeURIComponent(words)}`;
  let list;
  try {
    const r = await fetchFn(url, { headers: { 'user-agent': MAP_AGENT, accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) return { error: 'OpenStreetMap did not answer just now. Try again in a moment.' };
    list = await r.json();
  } catch (e) { return { error: 'OpenStreetMap could not be reached just now. Try again in a moment.' }; }
  const places = groupPins(await readMemberMap(s));
  const found = (Array.isArray(list) ? list : []).map((x) => {
    const lat = mapCoord(x && x.lat, 90), lon = mapCoord(x && x.lon, 180);
    if (lat == null || lon == null) return null;
    const a = (x.address && typeof x.address === 'object') ? x.address : {};
    const place = mapWords(x.name || a.city || a.town || a.village || a.hamlet || a.municipality || a.county || a.state || a.country);
    if (!place) return null;
    const near = nearestPlace(places, { lat, lon });
    return { label: mapWords(x.display_name, 300), place, country: mapWords(a.country), lat, lon,
      near: near ? { place: near.g.place, country: near.g.country, lat: near.g.lat, lon: near.g.lon, n: near.g.n, km: Math.round(near.d) } : null };
  }).filter(Boolean);
  return { found };
}

/* A case's member on the map: the place chosen, joining the place on the map
   near it unless `join` is false, in place of any pin the case had. */
export async function mapPut(who, id, f, s = store(), now = Date.now()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  f = f && typeof f === 'object' ? f : {};
  const kid = caseId(id);
  const lat = mapCoord(f.lat, 90), lon = mapCoord(f.lon, 180), place = mapWords(f.place), country = mapWords(f.country);
  if (lat == null || lon == null || !place) return { error: 'Put which place on the map?' };
  const k = (await readCases(s)).find((x) => x.id === kid);
  if (!k) return { error: 'That case has been deleted.' };
  const pin = newPinId();
  let saved = null, why = null;
  await updateList(MEMBER_MAP, 'pins', (list) => {
    why = null; saved = null;
    const rest = k.pin ? list.filter((x) => x.id !== k.pin) : list;
    if (rest.length >= MEMBER_MAP_MAX) { why = `The map holds up to ${MEMBER_MAP_MAX} pins.`; return null; }
    let at = { place, country, lat, lon };
    const near = f.join === false ? null : nearestPlace(groupPins(rest), at);
    if (near) at = { place: near.g.place, country: near.g.country, lat: near.g.lat, lon: near.g.lon };
    saved = { id: pin, ...at };
    return [...rest, saved];
  }, s);
  if (why) return { error: why };
  let gone = false, old = null;
  await updateSealed(CASES, (was) => {
    const list = was && Array.isArray(was.cases) ? was.cases : [];
    const i = list.findIndex((x) => x.id === kid);
    gone = i < 0;
    if (gone) return null;
    old = list[i].pin && list[i].pin !== k.pin ? list[i].pin : null;
    const copy = list.slice();
    copy[i] = { ...list[i], pin, edited: now, editedBy: who.handle };
    return { cases: copy, top: topOf(was) };
  }, s);
  if (gone) { await dropPin(pin, s); return { error: 'That case has been deleted.' }; }
  if (old) await dropPin(old, s);
  const n = groupPins(await readMemberMap(s)).find((g) => placeKey(g) === placeKey(saved));
  return { pin: { place: saved.place, country: saved.country, n: n ? n.n : 1 } };
}

/* A case's member taken off the map. */
export async function mapTake(who, id, s = store(), now = Date.now()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  const kid = caseId(id);
  let had = null;
  await updateSealed(CASES, (was) => {
    const list = was && Array.isArray(was.cases) ? was.cases : [];
    const i = list.findIndex((x) => x.id === kid);
    had = i >= 0 ? list[i].pin || null : null;
    if (!had) return null;
    const copy = list.slice();
    const { pin, ...rest } = list[i];
    copy[i] = { ...rest, edited: now, editedBy: who.handle };
    return { cases: copy, top: topOf(was) };
  }, s);
  if (!had) return { error: 'They are not on the member map.' };
  await dropPin(had, s);
  return { gone: true };
}

/* One pin that belongs to no case (one brought from Google) taken off a place,
   for somebody who asks to come off and has no join request here. */
export async function mapTakeOne(who, f, s = store()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  const lat = mapCoord(f && f.lat, 90), lon = mapCoord(f && f.lon, 180);
  if (lat == null || lon == null) return { error: 'Take one off which place?' };
  const held = new Set((await readCases(s)).map((k) => k.pin).filter(Boolean));
  const key = placeKey({ lat, lon });
  let took = false;
  await updateList(MEMBER_MAP, 'pins', (list) => {
    const i = list.findIndex((x) => placeKey(x) === key && !held.has(x.id));
    took = i >= 0;
    return took ? list.filter((_, j) => j !== i) : null;
  }, s);
  return took ? { gone: true } : { error: 'Every pin at that place belongs to a join request: take it off there.' };
}

/* The pins brought from Google My Maps, once: each a key (where it was in
   Google's list), a place, a country and a point. Bringing them again adds
   only the keys not already here, so it can be run again safely. */
export async function importMap(who, rows, s = store()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  if (!Array.isArray(rows) || !rows.length || rows.length > MAP_IMPORT_MAX) return { error: `Between one and ${MAP_IMPORT_MAX} pins at a time.` };
  const clean = [];
  for (const r of rows) {
    const key = typeof (r && r.key) === 'string' && /^google-[0-9]{1,5}$/.test(r.key) ? r.key : null;
    const lat = mapCoord(r && r.lat, 90), lon = mapCoord(r && r.lon, 180), place = mapWords(r && r.place), country = mapWords(r && r.country);
    if (!key || lat == null || lon == null || !place) return { error: 'Each pin is a key, a place, a country and a point.' };
    clean.push({ key, place, country, lat, lon });
  }
  let added = 0;
  await updateList(MEMBER_MAP, 'pins', (list) => {
    const have = new Set(list.map((x) => x.key).filter(Boolean));
    const add = [];
    for (const r of clean) {
      if (have.has(r.key)) continue;
      have.add(r.key);
      // Google kept one city twice a hair apart now and then: a pin with the same name near a place joins it.
      const near = nearestPlace(groupPins(list.concat(add)).filter((g) => g.place.toLowerCase() === r.place.toLowerCase()), r);
      const at = near ? { place: near.g.place, country: near.g.country, lat: near.g.lat, lon: near.g.lon } : { place: r.place, country: r.country, lat: r.lat, lon: r.lon };
      const saved = { id: newPinId(), key: r.key, from: 'google', place: at.place, country: at.country, lat: at.lat, lon: at.lon };
      add.push(saved);
    }
    added = add.length;
    if (list.length + add.length > MEMBER_MAP_MAX) { added = 0; return null; }
    return add.length ? list.concat(add) : null;
  }, s);
  return { added };
}

/* The office's view of the map: every place with how many are there, and how
   many of those belong to no join request (brought from Google), which is how
   many can be taken off there by hand. */
export async function officeMemberMap(who, s = store()) {
  if (!officeAllow(who)) return null;
  const [pins, cases] = await Promise.all([readMemberMap(s), readCases(s)]);
  const held = new Set(cases.map((k) => k.pin).filter(Boolean));
  const loose = new Map();
  for (const p of pins) if (!held.has(p.id)) loose.set(placeKey(p), (loose.get(placeKey(p)) || 0) + 1);
  return groupPins(pins).map((g) => ({ ...g, loose: loose.get(placeKey(g)) || 0 }))
    .sort((a, b) => (a.country || '').localeCompare(b.country || '') || a.place.localeCompare(b.place));
}

/* Where a case's member is on the map, for its page: the place, and how many
   are there. */
export async function casePin(who, k, s = store()) {
  if (!officeAllow(who)) return null;
  if (!k || !k.pin) return null;
  const pins = await readMemberMap(s);
  const p = pins.find((x) => x.id === k.pin);
  if (!p) return null;
  return { place: p.place, country: p.country, n: pins.filter((x) => placeKey(x) === placeKey(p)).length };
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
export const OFFICE_CASES = {"types": ["Connection Request", "Volunteer Application", "Join Request"], "statuses": [{"name": "New", "open": true}, {"name": "Assigned", "open": true}, {"name": "Replied", "open": true}, {"name": "Closed", "open": false}, {"name": "Spam", "open": false}], "priorities": ["Low", "Normal", "High", "Urgent"], "default_priority": "Normal"};
export const OFFICE_INTAKE = {"mutual_aid": {"record": "grant", "form": "Request Aid", "prefix": "Aid Request", "pipeline": "Mutual Aid", "amount": 500}, "creator_grant": {"record": "grant", "form": "Request Creator Grant", "prefix": "Creator Grant Request", "pipeline": "Creator Grants", "amount": 3000}, "connection": {"record": "case", "form": "Connect", "prefix": "Connection Request", "type": "Connection Request"}, "volunteer": {"record": "case", "form": "Volunteer", "prefix": "Volunteer Application", "type": "Volunteer Application"}, "community": {"record": "case", "form": "Join Our Community", "prefix": "Join Request", "type": "Join Request", "task": "pJoinOnboard1", "lists": [{"asks": "Would you like to be added to our Members Only mailing list?", "tag": "Members"}, {"asks": "Would you like to be added to our Monthly Newsletter mailing list?", "tag": "Newsletter Mailing List"}], "members": {"page": 85372, "address": "https://stimpunks.org/community/individuals/", "name": "Name for the Members page (optional)", "words": "Profile text for the Members page (optional)", "link": "Website or Blog"}, "organizations": {"page": 85410, "address": "https://stimpunks.org/community/organizations/", "name": "Organization Name", "words": "Profile text for the Organizations page", "link": "Organization Website or Blog", "logo": "Organization Logo", "grounds": [["custom-color-2", "pale teal"], ["custom-color-4", "pale green"], ["custom-color-5", "pale yellow"], ["custom-color-6", "pale peach"], ["custom-color-7", "pale lavender"], ["custom-color-8", "pale pink"]]}}};
export const OFFICE_DASHBOARD = {"active_cap": 100};
/* office:settings:end */
const OFFICE_GONE = 'office-gone';     // EspoCRM's ids of records brought over and deleted here, so a later import leaves them deleted
const NO_OFFICE = 'The office is for our directors, board members and administrators, on a claimed username.';

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
    const linked = linksBefore(key, was);
    const next = change(was);
    if (next === null) return was;
    const opts = cur.exists ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const res = await s.setJSON(key, seal(next), opts);
    if (res.modified) { await linksAfter(key, linked, next, s); return next; }
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
    t: c.t, by: c.by || null, edited: c.edited || null, editedBy: c.editedBy || null, talk: c.talk || null };
  if (c.espo) out.espo = c.espo;
  if (whole) { out.notes = c.notes || ''; out.blocks = parseBrass(c.notes || '', { boxes: true, refs: true }); } else out.words = [...(c.notes || '')].length;
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
  const [grants, cases, templates] = await Promise.all([readGrants(s), readCases(s), readTemplates(s)]);
  const [mail, box] = await Promise.all([readSealed(mailIndexKey(c.id), s), readSealed(MAILBOX, s)]);
  const theirs = grants.filter((g) => g.contact === c.id);
  return { ...shapeContact(c, true), grants: theirs.map((g) => shapeGrant(g, one)),
    cases: cases.filter((k) => k.contact === c.id).map((k) => shapeCase(k, one)),
    mail: mail && Array.isArray(mail.mail) ? mail.mail : [], mailbox: box && box.address ? box.address : null,
    writes: contactWrites(c, theirs, templates) };
}

/* WRITE TO THEM IN GMAIL, WITH A TEMPLATE (Ryan's ask, 2026-10-22): every
   mailing template filled in for one contact, as a mailing fills it for each
   person, so the contact's page can open Gmail's compose window with the
   subject and words ready and a director reads them there before sending. A
   grant request's fill-ins come from their newest grant request; a template
   whose fill-ins nothing here can fill says which, and is not filled. The
   office still sends nothing itself.
   A TEMPLATE WITH {invite} IN IT is filled with everything else and left
   waiting (Ryan's ask, 2026-10-23): writeInvite, on a director's press, makes
   one invite that works once (OFFICE_INVITE) and fills its link in, so an
   invite is made only when somebody is really being written to, never when a
   page is looked at. Each press makes a new one; nothing writes down whom an
   invite was for, on the invite, the contact or the join request, the invites'
   rule that nothing records who came in through which. */
const GRANT_FILLS = ['grant', 'amount', 'pipeline', 'stage', 'submitted'];
function contactWrites(c, grants, templates) {
  const name = [c.first, c.last].filter(Boolean).join(' ');
  const g = grants.slice().sort((a, b) => String(b.submitted || '').localeCompare(String(a.submitted || '')) || (b.t || 0) - (a.t || 0))[0] || null;
  const values = { first: c.first || name, last: c.last || '', name };
  if (g) Object.assign(values, { grant: g.name, amount: moneyWords(g.amount), pipeline: g.pipeline, stage: g.stage, submitted: dayWordsOf(g.submitted) });
  return templates.map((t) => {
    const used = [...new Set([...String(t.subject + '\n' + t.body).matchAll(/\{(\w+)\}/g)].map((m) => m[1]))];
    const missing = used.filter((k) => GRANT_FILLS.includes(k) && !g).map((k) => '{' + k + '}');
    const out = { id: t.id, name: t.name, missing, invite: used.includes('invite') };
    if (!missing.length) { out.subject = fillIn(t.subject, values); out.body = fillIn(t.body, values); }
    if (g && used.some((k) => GRANT_FILLS.includes(k))) out.from = g.name;
    return out;
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export async function writeInvite(who, id, tid, s = store(), now = Date.now()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  const c = (await readContacts(s)).find((x) => x.id === contactId(id));
  if (!c) return { error: 'That contact has been deleted.' };
  if (!c.email) return { error: 'They have no email address to write to.' };
  const tmpl = (await readTemplates(s)).find((x) => x.id === templateId(tid));
  if (!tmpl) return { error: 'That template has been deleted.' };
  const [w] = contactWrites(c, (await readGrants(s)).filter((g) => g.contact === c.id), [tmpl]);
  if (!w.invite) return { error: 'That template has no {invite} in it, so it needs no invite made.' };
  if (w.missing.length) return { error: 'It needs a grant request for ' + w.missing.join(', ') + ' first.' };
  const made = await makeInvite(who, OFFICE_INVITE, s, now);
  if (made.error) return { error: made.error };
  const link = { invite: INVITE_LINK + made.invite.code };
  return { subject: fillIn(w.subject, link), body: fillIn(w.body, link), until: made.invite.until };
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
  await dropOfficeComments(gone.id, s);
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
    form: g.form || null, t: g.t, by: g.by || null, edited: g.edited || null, editedBy: g.editedBy || null, talk: g.talk || null };
  if (g.espo) out.espo = g.espo;
  if (whole) { out.body = g.body || ''; out.blocks = parseBrass(g.body || '', { refs: true }); } else out.words = [...(g.body || '')].length;
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
  await dropOfficeComments(gone.id, s);
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
    form: k.form || null, t: k.t, by: k.by || null, edited: k.edited || null, editedBy: k.editedBy || null, talk: k.talk || null };
  if (k.espo) out.espo = k.espo;
  if (whole) { out.body = k.body || ''; out.blocks = parseBrass(k.body || '', { refs: true }); } else out.words = [...(k.body || '')].length;
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
  // Where its member is on the member map, if they are.
  if (!k) return null;
  const contacts = await readContacts(s);
  const c = k.contact ? contacts.find((x) => x.id === k.contact) : null;
  // Write to them in Gmail, as their contact's page has it, so a join request can be answered from itself.
  let write = null;
  if (c) {
    const [grants, templates, box] = await Promise.all([readGrants(s), readTemplates(s), readSealed(MAILBOX, s)]);
    write = { id: c.id, email: c.email || '', noEmail: !!c.noEmail, mailbox: box && box.address ? box.address : null,
      writes: contactWrites(c, grants.filter((g) => g.contact === c.id), templates) };
  }
  // And, for a join request, which of our mailing lists they asked for, and whether they have been sent to Givebutter.
  // And whether they asked to be on the Members page, and are.
  return { ...shapeCase(k, contactMap(contacts), true), map: await casePin(who, k, s), lists: caseLists(k), listing: caseListing(k, c), org: caseOrg(k), write };
}

/* THE OFFICE'S FEED (Ryan's ask, 2026-10-21, after Notion's Feed view, as
   Tasks' is): grant requests, cases and contacts as cards, newest first, each
   whole so its description or notes can be read there. The page orders and
   filters the lists it already has and asks for one page of cards at a time
   by their ids, which say what each is; this reads the sealed records once
   and keeps nothing. */
export const OFFICE_FEED_PAGE = 20;
export async function officeFeed(who, ids, s = store()) {
  if (!officeAllow(who)) return null;
  const want = [...new Set((Array.isArray(ids) ? ids : []).filter((v) => grantId(v) || caseId(v) || contactId(v)))].slice(0, OFFICE_FEED_PAGE);
  if (!want.length) return [];
  const [grants, cases, contacts] = await Promise.all([readGrants(s), readCases(s), readContacts(s)]);
  const m = contactMap(contacts);
  const cards = want.map((id) => {
    if (grantId(id)) { const g = grants.find((x) => x.id === id); return g ? { kind: 'grant', grant: shapeGrant(g, m, true) } : null; }
    if (caseId(id)) { const k = cases.find((x) => x.id === id); return k ? { kind: 'case', case: shapeCase(k, m, true) } : null; }
    const c = m.get(id);
    return c ? { kind: 'contact', contact: shapeContact(c, true) } : null;
  }).filter(Boolean);
  // Each card's latest comments and how many there are, as a task's card has.
  return Promise.all(cards.map(async (x) => {
    const d = await readSealed(officeCommentsKey(x[x.kind].id), s);
    const said = d && Array.isArray(d.comments) ? d.comments : [];
    return { ...x, comments: said.slice(-FEED_COMMENTS).map((c) => shapeComment(c, who)), said: said.length };
  }));
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
  await dropOfficeComments(gone.id, s);
  // Its pin goes with it: nothing would know whose it was any more.
  if (gone.pin) await dropPin(gone.pin, s);
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

export async function officeIntake(sub, s = store(), now = Date.now(), mods) {
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

  // A form type that names a task template makes a task from it too, once its record is made; one whose
  // template has been deleted from Tasks says so on the record, rather than making nothing in silence.
  const tpl = kind.task ? (await readTaskTpls(s)).find((x) => x.id === kind.task) || null : null;
  if (kind.task && !tpl) extra.push(['Task', `No task was made for this: Tasks no longer has the template this form's tasks are made from (${kind.task}). Make one by hand, or a template, in Tasks.`]);
  const lines = extra.map(([k, v]) => `**${k}**\n${v}`);
  const name = [...(entry ? `${kind.prefix} ${entry}: ${display}` : `${kind.prefix}: ${display}`)].slice(0, 200).join('');
  const contacts = await readContacts(s);
  let made = false, why = null, rec = null;
  if (kind.record === 'grant') {
    const body = intakeBody([...lines, sub.message].filter(Boolean).join('\n\n'), GRANT_BODY_MAX);
    await updateSealed(GRANTS, (was) => {
      const list = was && Array.isArray(was.grants) ? was.grants : [];
      made = false; why = null;
      if (entry && list.some((g) => g.form === entry)) return null;
      const r = applyGrant(list, { name, pipeline: kind.pipeline, amount: kind.amount, submitted, contact, form: entry, body }, INTAKE_WHO, now, contacts);
      if (r.error) { why = r.error; return null; }
      made = true; rec = r.saved.id;
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
      made = true; rec = r.saved.id;
      return { cases: r.list, top: Math.max(top, r.saved.number) };
    }, s);
  }
  if (why) return { error: why };
  // The task links the record the form made and the contact, so each of those lists it under Linked from;
  // it is made only with the record, so a retry or a resend makes neither twice.
  let task = null;
  if (made && tpl) {
    if (mods === undefined) mods = await loadMods();
    task = await makeFromTemplate(tpl.id, { name: display, contact, [kind.record]: rec }, submitted, s, now, mods);
  }
  return { ok: true, record: kind.record, made, task: !!task };
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
  // A reset code the mailbox sent for somebody's username is theirs, not the
  // office's, even when the address it went to is a contact's.
  if (bareAddress(from) === mailbox && [...tidy(m.subject)].join('') === ACCT_MAIL_SUBJECT) return { kept: false };
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
  const saved = await updateSealed(mailKeyOf(id), (was) => {
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
  await noteRecentMail({ id, at, subject: saved.subject, out, contacts: saved.contacts }, s);
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
  await dropOfficeComments('email-' + k, s);
  await dropRecentMail([k], null, s);
  await updateList(MAIL_GONE, 'ids', (ids) => (ids.includes(k) ? null : [...ids, k]), s);
  return { gone: true };
}

/* A contact deleted: their list goes, and so does every email of theirs that is
   with nobody else in the office. */
async function forgetContactMail(cid, s) {
  const idx = await readSealed(mailIndexKey(cid), s);
  const gone = [];
  for (const x of (idx && idx.mail) || []) {
    let empty = false;
    await updateSealed(mailKeyOf(x.id), (was) => {
      if (!was) return null;
      const rest = (was.contacts || []).filter((c) => c !== cid);
      empty = !rest.length;
      return empty ? null : { ...was, contacts: rest };
    }, s);
    if (empty) { await s.delete(mailKeyOf(x.id)); await dropOfficeComments('email-' + x.id, s); gone.push(x.id); }
  }
  await dropRecentMail(gone, cid, s);
  await s.delete(mailIndexKey(cid));
}

/* THE NEWEST EMAIL AND THE MAILBOX'S COUNTS, for the dashboard (Ryan's ask,
   2026-10-22). Until then the office kept no list of recent mail, only each
   contact's own, which is why email is not in the feed; MAIL_RECENT reverses
   that for the dashboard alone. It is a sealed list of the MAIL_RECENT_KEEP
   newest emails filed, by when each was sent: Gmail's id, when, its subject,
   whether the team sent it, and the contacts it is filed on, never an address
   or a word of its text. Every email filed, deleted here or let go with a
   contact changes it, and one deleted leaves the list shorter until the next
   arrives. A backfill of older mail leaves it alone.

   MAIL_COUNTS is what the mailbox's script counts once an hour
   (officeMailCounts): unread conversations in the inbox, and the emails that
   came in and went out, and how many of those were with a contact, in the
   seven days before it counted and the seven before that. Numbers only, kept
   whole and replaced by the next count: nothing about anybody leaves Gmail for
   them. A count the script could not finish is sent as null and shown as not
   counted, never as a smaller number. */
const MAIL_RECENT = 'office-mail-recent';
export const MAIL_RECENT_KEEP = 20;
export const MAIL_RECENT_SHOWN = 6;
const MAIL_COUNTS = 'office-mailbox-counts';
export const MAIL_COUNT_MAX = 10000000;

async function noteRecentMail(entry, s) {
  await updateSealed(MAIL_RECENT, (was) => {
    const list = was && Array.isArray(was.mail) ? was.mail : [];
    const had = list.find((x) => x.id === entry.id);
    if (had && had.contacts.join() === entry.contacts.join()) return null;
    if (!had && list.length >= MAIL_RECENT_KEEP && entry.at <= list[list.length - 1].at) return null;
    return { mail: [entry, ...list.filter((x) => x.id !== entry.id)].sort((a, b) => b.at - a.at).slice(0, MAIL_RECENT_KEEP) };
  }, s);
}

/* Emails gone from the office leave the list, and a contact let go leaves the
   ones that stay. */
async function dropRecentMail(ids, cid, s) {
  await updateSealed(MAIL_RECENT, (was) => {
    const list = was && Array.isArray(was.mail) ? was.mail : [];
    const next = list.filter((x) => !ids.includes(x.id))
      .map((x) => (cid && x.contacts.includes(cid) ? { ...x, contacts: x.contacts.filter((c) => c !== cid) } : x));
    return JSON.stringify(next) === JSON.stringify(list) ? null : { mail: next };
  }, s);
}

/* The email filed before the list existed was on no list but its contacts',
   so the newest of those are put on it, merged with what it holds, whose
   entries are never older than the ones read here. The dashboard does this
   when the list is missing, and the office does it each night as a repair.
   Returns the list. */
const MAIL_INDEX = 'office-mail-of/';
export async function seedRecentMail(s = store()) {
  if (!officeReady()) return null;
  const { blobs } = await s.list({ prefix: MAIL_INDEX });
  // Keyed by Gmail's id, which is hex, so no id can be an object's own name.
  const byId = Object.create(null);
  for (let i = 0; i < blobs.length; i += 25) {
    const part = await Promise.all(blobs.slice(i, i + 25).map(async (b) => [b.key.slice(MAIL_INDEX.length), await readSealed(b.key, s)]));
    for (const [cid, idx] of part) {
      for (const x of (idx && idx.mail) || []) {
        const had = byId[x.id];
        if (had) { if (!had.contacts.includes(cid)) had.contacts.push(cid); }
        else byId[x.id] = { id: x.id, at: x.at, subject: x.subject, out: !!x.out, contacts: [cid] };
      }
    }
  }
  const saved = await updateSealed(MAIL_RECENT, (was) => {
    const list = was && Array.isArray(was.mail) ? was.mail : [];
    const all = { ...byId };
    for (const x of list) all[x.id] = x;
    const next = Object.values(all).sort((a, b) => b.at - a.at).slice(0, MAIL_RECENT_KEEP);
    return JSON.stringify(next) === JSON.stringify(list) ? null : { mail: next };
  }, s);
  return saved || { mail: [] };
}

const mailCount = (n) => (Number.isInteger(n) && n >= 0 && n <= MAIL_COUNT_MAX ? n : null);
const mailPair = (v) => (Array.isArray(v) && v.length === 2 && v.every((n) => mailCount(n) !== null) ? [v[0], v[1]] : null);

/* The mailbox script's hourly count. Returns { ok } or { error }. */
export async function officeMailCounts(c, s = store(), now = Date.now()) {
  if (!officeReady()) return { error: 'The office is shut.', status: 503 };
  c = c && typeof c === 'object' ? c : {};
  const counts = { unread: mailCount(c.unread), received: mailPair(c.received), sent: mailPair(c.sent), withContacts: mailPair(c.withContacts) };
  if (Object.values(counts).every((v) => v === null)) return { error: 'Those are not counts.' };
  await updateSealed(MAIL_COUNTS, () => ({ read: now, counts }), s);
  return { ok: true };
}

/* MAILINGS: an email from a template to everybody at one stage of a grant
   pipeline, sent from the team mailbox (Ryan's call, 2026-10-20, over drafts
   to read and send by hand). A director writes TEMPLATES here, with fill-ins in
   braces, and an unknown fill-in is refused, so a misspelt one never goes out
   as braces. MAILING PREVIEW fills one email for every grant request at the
   stage and names everybody it leaves out and why: no contact, a contact since
   deleted, no address, or a contact who asked not to be emailed. A stage holds
   everybody who ever reached it, so a mailing can be narrowed to the requests
   SUBMITTED SINCE a day (on or after it); one with no submitted day is then
   left out and named, and the preview says how many earlier ones it passed
   over. SEND MAILING
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
export const FILL_INS = ['first', 'last', 'name', 'grant', 'amount', 'pipeline', 'stage', 'submitted', 'invite'];
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
  if (!gone) return { error: 'That template has already been deleted.' };
  await dropOfficeComments(templateId(id), s);
  return { gone: true };
}
/* One template, for its own page. */
export async function officeTemplate(who, id, s = store()) {
  if (!officeAllow(who)) return null;
  const t = (await readTemplates(s)).find((x) => x.id === templateId(id));
  return t ? shapeTemplate(t) : null;
}

/* Everybody at one stage of one pipeline: an email for each grant request
   whose contact can be emailed, and the rest with the reason they are left out. */
function stageMail(pipeline, stage, grants, contacts, since = null) {
  const byId = contactMap(contacts);
  const emails = [], left = [];
  let before = 0;
  const here = grants.filter((g) => g.pipeline === pipeline && g.stage === stage)
    .sort((a, b) => String(a.submitted || '').localeCompare(String(b.submitted || '')) || a.name.localeCompare(b.name));
  for (const g of here) {
    if (since && g.submitted && g.submitted < since) { before++; continue; }
    const c = g.contact ? byId.get(g.contact) : null;
    const name = c ? [c.first, c.last].filter(Boolean).join(' ') : '';
    const why = since && !g.submitted ? 'it has no submitted day' : !g.contact ? 'it has no contact' : !c ? 'its contact has been deleted'
      : !c.email ? 'their contact has no email address' : c.noEmail ? 'they asked not to be emailed' : null;
    if (why) { left.push({ grant: g.id, grantName: g.name, contact: c ? c.id : null, name: name || null, why }); continue; }
    emails.push({ grant: g.id, grantName: g.name, contact: c.id, name, to: c.email,
      values: { first: c.first || name, last: c.last || '', name, grant: g.name, amount: moneyWords(g.amount), pipeline: g.pipeline, stage: g.stage, submitted: dayWordsOf(g.submitted) } });
  }
  return { emails, left, before };
}
async function mailingParts(f, s) {
  const pipe = pipelineOf(f && f.pipeline);
  if (!pipe) return { error: 'Which pipeline?' };
  const stage = stageIn(pipe, f.stage);
  if (!stage) return { error: 'Which stage of it?' };
  const since = day(f.since);
  if (since === undefined) return { error: 'Submitted since is a day, as 2026-01-01.' };
  const tmpl = (await readTemplates(s)).find((x) => x.id === templateId(f.template));
  if (!tmpl) return { error: 'That template has been deleted.' };
  // An invite is made for one person at a time, when a director writes to them (writeInvite).
  if (/\{invite\}/.test(tmpl.subject + '\n' + tmpl.body)) return { error: 'That template has {invite} in it, which is made for one person when you write to them from their contact or join request. A mailing cannot make one for everybody.' };
  const { emails, left, before } = stageMail(pipe.name, stage.name, await readGrants(s), await readContacts(s), since);
  const filled = emails.map((e) => ({ ...e, subject: fillIn(tmpl.subject, e.values), body: fillIn(tmpl.body, e.values) }));
  return { pipe, stage, since, tmpl, filled, left, before };
}
export async function previewMailing(who, f, s = store()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  const r = await mailingParts(f, s);
  if (r.error) return r;
  return { template: shapeTemplate(r.tmpl), pipeline: r.pipe.name, stage: r.stage.name, since: r.since, before: r.before,
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
    ...(r.since ? { since: r.since } : {}), t: now, by: who.handle, emails: r.filled.map((e) => ({ id: newOutboxId(), grant: e.grant, contact: e.contact, to: e.to, subject: e.subject, body: e.body })) };
  await updateSealed(MAILINGS, (was) => ({ mailings: [...(was && Array.isArray(was.mailings) ? was.mailings : []), mailing] }), s);
  return { mailing: mailing.id, count: mailing.emails.length };
}

/* An email's state: waiting while it still has an address, then sent, not
   sent (Google would not send it) or stopped. */
function outState(e) { return e.sent ? 'sent' : e.failed ? 'failed' : e.stopped ? 'stopped' : 'waiting'; }
function shapeMailing(m, contacts, grants, whole) {
  const counts = { waiting: 0, sent: 0, failed: 0, stopped: 0 };
  for (const e of m.emails) counts[outState(e)]++;
  const out = { id: m.id, template: m.template, pipeline: m.pipeline, stage: m.stage, since: m.since || null, t: m.t, by: m.by,
    stopped: m.stopped || null, stoppedBy: m.stoppedBy || null, counts };
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
  if (why) return { error: why };
  await dropOfficeComments(mailingId(id), s);
  return { gone: true };
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

/* COMMENTS IN THE OFFICE (Ryan's ask, 2026-10-21: "pretty much everything in
   the office should allow comments"): on a contact, a grant request, a case, a
   mailing, a template or an email filed from the team mailbox (the last two the
   same evening), kept as a task's are (commentTask), except that they are sealed
   like everything else here, one sealed blob of them for each record,
   office-comments/<record id>, and a record has no activity to put them in.
   The writer's authorMark is sealed with the comment and never leaves the
   server: only the writer edits a comment, and the writer or an administrator
   deletes one. Who is told goes in Tasks' Notifications, naming the record
   only by its id (noteOfficeComment). A comment on a contact, a grant request
   or a case sets the record's `talk`, so the Feed can put it first; it is not
   a change to the record, so it sets no `edited`. A record's comments go with
   it, and they stay when a username is deleted, as the records do. */
export const OFFICE_COMMENT_MAX = TASK_COMMENT_MAX;
export const OFFICE_COMMENTS_KEEP = TASK_COMMENTS_KEEP;
const officeCommentsKey = (id) => `office-comments/${id}`;
/* A record's comments deleted with it, and their links with them. */
async function dropOfficeComments(id, s) { await s.delete(officeCommentsKey(id)); await dropLinksFrom(`officec:${id}/`, true, s); }
/* What a comment can be on, told apart by its id: which sealed blob holds it,
   and whether the Feed shows it. An email's id is Gmail's, which says nothing
   about what it is, so its comments go by `email-` and the Gmail id. */
function commentable(id) {
  if (contactId(id)) return { what: 'contact', key: CONTACTS, field: 'contacts', id, talk: true };
  if (grantId(id)) return { what: 'grant', key: GRANTS, field: 'grants', id, talk: true };
  if (caseId(id)) return { what: 'case', key: CASES, field: 'cases', id, talk: true };
  if (mailingId(id)) return { what: 'mailing', key: MAILINGS, field: 'mailings', id, talk: false };
  if (templateId(id)) return { what: 'template', key: TEMPLATES, field: 'templates', id, talk: false };
  const mail = typeof id === 'string' && id.startsWith('email-') ? mailId(id.slice(6)) : null;
  if (mail) return { what: 'email', mail, id: 'email-' + mail, talk: false };
  return null;
}
/* The record a comment is on, as it is now, or nothing when it has gone. */
async function commentedOn(r, s) {
  if (r.mail) return readSealed(mailKeyOf(r.mail), s);
  const held = await readSealed(r.key, s);
  return held && Array.isArray(held[r.field]) ? held[r.field].find((x) => x.id === r.id) || null : null;
}
const NO_RECORD = 'That has been deleted from the office.';

export async function officeComments(who, id, s = store()) {
  if (!officeAllow(who)) return null;
  const r = commentable(id);
  if (!r) return [];
  const d = await readSealed(officeCommentsKey(r.id), s);
  return (d && Array.isArray(d.comments) ? d.comments : []).map((c) => shapeComment(c, who));
}

export async function commentOffice(who, id, text, s = store(), now = Date.now(), mods) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  if (mods === undefined) mods = await loadMods();
  const r = commentable(id);
  const words = cleanForumBody(text, OFFICE_COMMENT_MAX);
  if (!words) return { error: `A comment is between one and ${OFFICE_COMMENT_MAX} characters.` };
  const rec = r ? await commentedOn(r, s) : null;
  if (!rec) return { error: NO_RECORD };
  const c = { id: newCommentId(), by: who.handle, mark: authorMark(who), t: now, body: words };
  let full = false, earlier = [];
  await updateSealed(officeCommentsKey(r.id), (was) => {
    const list = was && Array.isArray(was.comments) ? was.comments : [];
    full = list.length >= OFFICE_COMMENTS_KEEP;
    earlier = list.map((x) => x.by);
    return full ? null : { comments: [...list, c] };
  }, s);
  if (full) return { error: `This has ${OFFICE_COMMENTS_KEEP} comments, as many as it keeps. Delete one first.` };
  // A record deleted meanwhile takes the comment with it.
  let gone = !(await commentedOn(r, s));
  // When it was last talked about, for the Feed.
  if (!gone && r.talk) await updateSealed(r.key, (was) => {
    const list = was && Array.isArray(was[r.field]) ? was[r.field] : [];
    const k = list.findIndex((x) => x.id === r.id);
    gone = k < 0;
    if (gone || (list[k].talk || 0) >= now) return null;
    const copy = list.slice(); copy[k] = { ...list[k], talk: now };
    return { ...was, [r.field]: copy };
  }, s);
  if (gone) { await dropOfficeComments(r.id, s); return { error: NO_RECORD }; }
  await noteOfficeComment(r.what, r.id, who.handle, c, { maker: rec.by, earlier }, s, now, mods).catch(() => null);
  return { comment: shapeComment(c, who) };
}

export async function editOfficeComment(who, id, cid, text, s = store(), now = Date.now(), mods) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  if (mods === undefined) mods = await loadMods();
  const r = commentable(id), k0 = commentId(cid);
  if (!r || !k0) return { error: 'Edit which comment?' };
  const words = cleanForumBody(text, OFFICE_COMMENT_MAX);
  if (!words) return { error: `A comment is between one and ${OFFICE_COMMENT_MAX} characters.` };
  let saved = null, was = null, why = null;
  await updateSealed(officeCommentsKey(r.id), (held) => {
    saved = null; was = null; why = null;
    const list = held && Array.isArray(held.comments) ? held.comments : [];
    const k = list.findIndex((x) => x.id === k0);
    if (k < 0) { why = 'That comment has been deleted.'; return null; }
    if (list[k].mark !== authorMark(who)) { why = 'Only whoever wrote a comment can change it.'; return null; }
    if (list[k].body === words) { saved = list[k]; return null; }
    was = list[k].body;
    saved = { ...list[k], body: words, edited: now };
    const copy = list.slice(); copy[k] = saved;
    return { comments: copy };
  }, s);
  if (why) return { error: why };
  if (was != null) await noteOfficeComment(r.what, r.id, who.handle, saved, { was, edit: true }, s, now, mods).catch(() => null);
  return { comment: shapeComment(saved, who) };
}

export async function removeOfficeComment(who, id, cid, s = store()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  const r = commentable(id), k0 = commentId(cid);
  if (!r || !k0) return { error: 'Delete which comment?' };
  let why = null;
  await updateSealed(officeCommentsKey(r.id), (held) => {
    why = null;
    const list = held && Array.isArray(held.comments) ? held.comments : [];
    const k = list.findIndex((x) => x.id === k0);
    if (k < 0) { why = 'That comment has already been deleted.'; return null; }
    if (list[k].mark !== authorMark(who) && !who.roles.has('administrator')) { why = 'Only whoever wrote a comment, or an administrator, can delete it.'; return null; }
    return { comments: list.filter((_, i) => i !== k) };
  }, s);
  return why ? { error: why } : { gone: true };
}

/* The mailbox script's half. The outbox: emails waiting, oldest mailing first,
   with their addresses, which is the one time the office hands it any. The
   reset codes somebody asked for by email come first (mailResetCode), each
   only while its code still works. */
export async function mailOutbox(s = store(), now = Date.now()) {
  if (!mailReady()) return null;
  const out = (await readAcctOutbox(s, now)).slice(0, OUTBOX_BATCH).map((e) => ({ id: e.id, to: e.to, subject: e.subject, body: e.body }));
  if (out.length >= OUTBOX_BATCH) return out;
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
  // A reset code's email, sent or not, is forgotten: nothing of it is kept.
  let reset = false;
  await updateSealed(ACCT_OUTBOX, (was) => {
    const list = was && Array.isArray(was.emails) ? was.emails : [];
    reset = list.some((e) => e.id === id);
    return reset ? { emails: list.filter((e) => e.id !== id && e.until > now) } : null;
  }, s);
  if (reset) return { ok: true, known: true };
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

/* THE DASHBOARD: the office's figures, worked out from the records every time
   it is opened, so it never disagrees with them (Ryan's brief, 2026-10-21). It
   holds EspoCRM's four reports: the open grant requests submitted this year,
   each pipeline against OFFICE_DASHBOARD.active_cap, every open case by status, the open
   grant requests by stage, and this year's grant requests by month. Beside them
   what came in this week and the week before, the tasks open, overdue and due
   soon, mailings, and the newest grant requests, cases and tasks, and the forum
   topics posted to last that the reader may read, from the forums' own Latest
   (forumLatest), so a category the reader cannot see is never in it. Weeks are the
   last seven days by the street's clock, and the one before. The sentences are
   built on the page from these numbers and nothing else.

   FORM ENTRIES (Ryan's ask, 2026-10-23: the latest WPForms entries from
   stimpunks.org on the dashboard) are the grant requests and cases that carry a
   WPForms entry number, the highest first, which is the order stimpunks.org's
   forms took them in, whether they came through the intake or EspoCRM's import.
   Each is named by its form (`form` in OFFICE_INTAKE): the type whose prefix and
   entry number begin its name, as the intake and EspoCRM's plugin named it, or
   else the type that makes its pipeline or case type. Beside them, how many came
   from each form this week and the week before. An entry from a form the office
   takes nothing from, or spam, never came here, so the numbers skip. */
export const NIGHTS_SHOWN = 90;
export const CB_DAYS_SHOWN = 30;
export const FORM_ENTRIES_SHOWN = 8;
const dayBefore = (d, n) => new Date(Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10) - n)).toISOString().slice(0, 10);
export async function officeDashboard(who, s = store(), now = Date.now()) {
  if (!officeAllow(who)) return null;
  const day = today(new Date(now)), year = day.slice(0, 4);
  const weekFrom = dayBefore(day, 6), lastFrom = dayBefore(day, 13);
  const dayOfT = (t) => today(new Date(t));
  const inWeek = (d) => d && d >= weekFrom && d <= day;
  const inLast = (d) => d && d >= lastFrom && d < weekFrom;
  const [grants, cases, tasks, mailings, contacts] = await Promise.all([readGrants(s), readCases(s), readTasks(s), readMailings(s), readContacts(s)]);
  const byId = contactMap(contacts);
  const nameOf = (cid) => { const c = cid ? byId.get(cid) : null; return c ? [c.first, c.last].filter(Boolean).join(' ') : null; };

  const status = (g) => grantStatus(g);
  const open = grants.filter((g) => status(g) === 'Open');
  const came = (x) => x.submitted || dayOfT(x.t);
  const active = open.filter((g) => String(g.submitted || '').startsWith(year));
  const months = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`).filter((m) => m <= day.slice(0, 7));
  const g = {
    open: open.length, openSum: open.reduce((t, x) => t + (x.amount || 0), 0),
    active: { cap: OFFICE_DASHBOARD.active_cap, count: active.length,
      byPipeline: OFFICE_PIPELINES.map((p) => ({ pipeline: p.name, count: active.filter((x) => x.pipeline === p.name).length, cap: OFFICE_DASHBOARD.active_cap })) },
    stages: OFFICE_PIPELINES.map((p) => ({ pipeline: p.name,
      stages: p.stages.filter((st) => st.status === 'Open').map((st) => {
        const here = open.filter((x) => x.pipeline === p.name && x.stage === st.name);
        return { stage: st.name, count: here.length, sum: here.reduce((t, x) => t + (x.amount || 0), 0) };
      }) })),
    months: months.map((m) => ({ month: m, counts: OFFICE_PIPELINES.map((p) => grants.filter((x) => x.pipeline === p.name && String(x.submitted || '').startsWith(m)).length) })),
    pipelines: OFFICE_PIPELINES.map((p) => p.name),
    week: { now: grants.filter((x) => inWeek(came(x))).length, before: grants.filter((x) => inLast(came(x))).length },
    decided: {
      granted: grants.filter((x) => status(x) === 'Granted' && String(x.closed || '').startsWith(year)).length,
      grantedSum: grants.filter((x) => status(x) === 'Granted' && String(x.closed || '').startsWith(year)).reduce((t, x) => t + (x.amount || 0), 0),
      denied: grants.filter((x) => status(x) === 'Denied' && String(x.closed || '').startsWith(year)).length },
  };
  const openCases = cases.filter((k) => caseOpen(k.status));
  const k = {
    open: openCases.length,
    byStatus: OFFICE_CASES.statuses.filter((st) => st.open).map((st) => ({ status: st.name, count: openCases.filter((x) => x.status === st.name).length })),
    byType: OFFICE_CASES.types.map((ty) => ({ type: ty, count: openCases.filter((x) => x.type === ty).length })),
    week: { now: cases.filter((x) => inWeek(came(x))).length, before: cases.filter((x) => inLast(came(x))).length },
  };
  const live = tasks.filter((x) => !TASK_DONE.includes(x.status));
  const soon = dayBefore(day, -7);
  const people = [...new Set(live.map((x) => x.who).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const t = {
    open: live.length, overdue: live.filter((x) => x.due && x.due < day).length, dueSoon: live.filter((x) => x.due && x.due >= day && x.due <= soon).length,
    week: { now: tasks.filter((x) => inWeek(dayOfT(x.t))).length, before: tasks.filter((x) => inLast(dayOfT(x.t))).length },
    byPerson: people.map((p) => ({ who: p, open: live.filter((x) => x.who === p).length, overdue: live.filter((x) => x.who === p && x.due && x.due < day).length })),
    unassigned: live.filter((x) => !x.who).length,
  };
  const m = {
    waiting: mailings.reduce((n, x) => n + x.emails.filter((e) => outState(e) === 'waiting').length, 0),
    sentWeek: mailings.reduce((n, x) => n + x.emails.filter((e) => e.sent && inWeek(dayOfT(e.sent))).length, 0),
  };
  // The nightly lines, the last NIGHTS_SHOWN of them, and the CB's messages a
  // day for the last month, both kept as they happened rather than worked out.
  const [nightsDoc, perDay] = await Promise.all([readSealed(OFFICE_NIGHTS, s), readDayCounts(s)]);
  const shownFrom = dayBefore(day, NIGHTS_SHOWN - 1);
  const nights = Object.entries((nightsDoc && nightsDoc.nights) || {}).filter(([d]) => isDay(d) && d >= shownFrom && d <= day).sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([d, x]) => ({ day: d, grants: OFFICE_PIPELINES.map((p) => (x.grants && x.grants[p.name]) || 0), cases: x.cases || 0, tasks: x.tasks || 0, overdue: x.overdue || 0 }));
  const firstNight = Object.keys((nightsDoc && nightsDoc.nights) || {}).filter(isDay).sort()[0] || null;
  const cbDays = Array.from({ length: CB_DAYS_SHOWN }, (_, i) => dayBefore(day, CB_DAYS_SHOWN - 1 - i))
    .map((d) => ({ day: d, counts: DAY_KINDS.map((kind) => { const n = plain(perDay[d])[kind]; return Number.isInteger(n) ? n : 0; }) }));
  const sumOf = (from, to) => Object.entries(perDay).filter(([d]) => d >= from && d <= to).reduce((n, [, c]) => n + DAY_KINDS.reduce((a, kind) => a + (Number.isInteger(plain(c)[kind]) ? plain(c)[kind] : 0), 0), 0);
  const cb = { days: cbDays, week: { now: sumOf(weekFrom, day), before: sumOf(lastFrom, dayBefore(weekFrom, 1)) }, since: Object.keys(perDay).filter(isDay).sort()[0] || null };
  const newest = (list, n) => list.slice().sort((a, b) => (b.t || 0) - (a.t || 0)).slice(0, n);
  // A grant request or a case by the day it was submitted, or added when it has none, the latest first: when it
  // was added can be years after it was submitted, for one brought over from EspoCRM in a batch (Ryan's report,
  // 2026-10-22: 2023's requests at the top of Newest).
  const cameFirst = (list, n) => list.slice().sort((a, b) => (came(a) < came(b) ? 1 : came(a) > came(b) ? -1 : (b.t || 0) - (a.t || 0))).slice(0, n);
  const intakes = Object.values(OFFICE_INTAKE);
  const formOf = (rec, x) => {
    const v = intakes.find((y) => y.record === rec && String(x.name || '').startsWith(`${y.prefix} ${x.form}:`))
      || intakes.find((y) => y.record === rec && (rec === 'grant' ? y.pipeline === x.pipeline : y.type === x.type));
    return v ? v.form : null;
  };
  const entries = [...grants.map((x) => ['grant', x]), ...cases.map((x) => ['case', x])]
    .filter(([, x]) => Number.isInteger(x.form) && x.form > 0)
    .map(([rec, x]) => ({ rec, x, form: formOf(rec, x) }))
    .sort((a, b) => b.x.form - a.x.form);
  const forms = { week: intakes.map((v) => ({ form: v.form,
    now: entries.filter((e) => e.form === v.form && inWeek(came(e.x))).length,
    before: entries.filter((e) => e.form === v.form && inLast(came(e.x))).length })) };
  const [quickbooks, givebutter, latest, recentKept, mailCounts, layout] = await Promise.all([qbStatus(who, s), gbStatus(who, s), forumLatest(who, null, s, now),
    readSealed(MAIL_RECENT, s), readSealed(MAIL_COUNTS, s), officeLayout(who, s)]);
  // Newest leaves out what is closed (a request granted or denied, a case closed, a task
  // completed or canceled), and so does Form entries, by its record (2026-10-27).
  const stillOpen = ({ rec, x }) => (rec === 'grant' ? status(x) === 'Open' : caseOpen(x.status));
  const recentMail = recentKept || await seedRecentMail(s);
  // A topic's category by its path, as the forums name it: Team Docs › Notes.
  const catPath = (slug) => { const names = []; for (let c = forumCat(slug, now); c; c = c.parent ? forumCat(c.parent, now) : null) names.unshift(c.name); return names.join(' › '); };
  return { asOf: now, day, year, weekFrom, grants: g, cases: k, tasks: t, mailings: m, forms, nights, firstNight, cb, quickbooks, givebutter, layout,
    mailbox: { ready: mailReady(), counted: mailCounts ? { read: mailCounts.read, counts: mailCounts.counts } : null },
    recent: {
      forms: entries.filter(stillOpen).slice(0, FORM_ENTRIES_SHOWN).map(({ rec, x, form }) => ({ entry: x.form, form, record: rec, id: x.id, name: x.name,
        number: rec === 'case' ? x.number : null, submitted: x.submitted || null, contactName: nameOf(x.contact) })),
      mail: ((recentMail && recentMail.mail) || []).slice(0, MAIL_RECENT_SHOWN).map((x) => ({ id: x.id, at: x.at, subject: x.subject, out: !!x.out,
        contacts: x.contacts.map(nameOf).filter(Boolean) })),
      grants: cameFirst(open, 5).map((x) => ({ id: x.id, name: x.name, pipeline: x.pipeline, stage: x.stage, amount: x.amount ?? null, submitted: x.submitted || null, contactName: nameOf(x.contact) })),
      cases: cameFirst(openCases, 5).map((x) => ({ id: x.id, number: x.number, name: x.name, type: x.type, status: x.status, submitted: x.submitted || null })),
      tasks: newest(live, 5).map((x) => ({ id: x.id, name: x.name, who: x.who || null, due: x.due || null, status: x.status })),
      forum: latest.topics.slice(0, 5).map((x) => ({ id: x.id, title: x.title, cat: catPath(x.cat), last: x.last, lastBy: x.lastBy })),
    } };
}

/* EACH READER'S DASHBOARD (requests to Ryan, 2026-10-27): the order of its
   sections and of the boxes in Newest, and which of them are hidden, kept for
   each reader under their pet key in office-dash/<pet key>, sealed like every
   record, holding those four lists of keys and nothing about when. It follows a
   claimed username from one device to another, and nobody else is shown it.
   A key it does not know is dropped and one it lacks goes on the end, so a
   section added later appears for everybody, after theirs. Put it back as it
   was deletes it, and so do Forget me and deleting the username. */
export const DASH_SECTIONS = ['newest', 'people', 'stands', 'charts', 'connected'];
export const DASH_BOXES = ['grants', 'cases', 'mail', 'tasks', 'forum', 'forms'];
const officeDashBlob = (k) => `office-dash/${k}`;
function dashList(v, keys, whole) {
  const seen = (Array.isArray(v) ? v : []).filter((x, i, a) => keys.includes(x) && a.indexOf(x) === i);
  return whole ? seen.concat(keys.filter((x) => !seen.includes(x))) : seen;
}
export function cleanOfficeLayout(v) {
  v = v && typeof v === 'object' ? v : {};
  return { sections: dashList(v.sections, DASH_SECTIONS, true), hide: dashList(v.hide, DASH_SECTIONS),
    boxes: dashList(v.boxes, DASH_BOXES, true), hideBoxes: dashList(v.hideBoxes, DASH_BOXES) };
}
export async function officeLayout(who, s = store()) {
  if (!officeAllow(who)) return null;
  return cleanOfficeLayout(await readSealed(officeDashBlob(petKey(who.handle)), s));
}
export async function keepOfficeLayout(who, v, s = store()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  if (!officeReady()) return { error: 'The office is shut.', status: 503 };
  const layout = cleanOfficeLayout(v);
  await updateSealed(officeDashBlob(petKey(who.handle)), () => layout, s);
  return { layout };
}
export async function resetOfficeLayout(who, s = store()) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  await s.delete(officeDashBlob(petKey(who.handle)));
  return { layout: cleanOfficeLayout(null) };
}
/* Forget me, and deleting the username. */
export async function forgetOfficeLayout(pk, s = store()) {
  await s.delete(officeDashBlob(pk));
  return true;
}

/* EACH NIGHT, WHAT WAS OPEN (Ryan, 2026-10-21: update the dashboard daily for
   the things that are not worked out when it is opened). Everything else on
   the dashboard comes from the records each time, but a record keeps no
   history of its stages, so how many were open on a night long gone cannot be
   worked out later. officeNightly, from cb-office-daily.mjs late each evening
   in Colorado, keeps one line a night: how many grant requests were open in
   each pipeline and how many of those were submitted that year, how many cases
   and tasks were open, and how many tasks were overdue. Counts only, sealed
   like every record, for OFFICE_NIGHTS_KEEP nights; the same night run again
   replaces its line. */
const OFFICE_NIGHTS = 'office-nights';
export const OFFICE_NIGHTS_KEEP = 400;
export async function officeNightly(s = store(), now = Date.now()) {
  if (!officeReady()) return { error: 'shut' };
  const day = today(new Date(now)), year = day.slice(0, 4), oldest = dayBefore(day, OFFICE_NIGHTS_KEEP - 1);
  const [grants, cases, tasks] = await Promise.all([readGrants(s), readCases(s), readTasks(s)]);
  const open = grants.filter((g) => grantStatus(g) === 'Open');
  const live = tasks.filter((x) => !TASK_DONE.includes(x.status));
  const line = {
    grants: Object.fromEntries(OFFICE_PIPELINES.map((p) => [p.name, open.filter((g) => g.pipeline === p.name).length])),
    active: Object.fromEntries(OFFICE_PIPELINES.map((p) => [p.name, open.filter((g) => g.pipeline === p.name && String(g.submitted || '').startsWith(year)).length])),
    cases: cases.filter((k) => caseOpen(k.status)).length,
    tasks: live.length,
    overdue: live.filter((x) => x.due && x.due < day).length,
  };
  await updateSealed(OFFICE_NIGHTS, (was) => {
    const nights = Object.fromEntries(Object.entries((was && was.nights) || {}).filter(([d]) => isDay(d) && d >= oldest));
    nights[day] = line;
    return { nights };
  }, s);
  return { day, line };
}

/* THE REPORTS: EspoCRM's nine, as its Reports section held them (Ryan's list,
   2026-10-21), worked out from the records each time, like the dashboard,
   which shares four of them. By year means the year a request or case was
   submitted, and an award's year is the year it was decided. Grantees is
   every granted request with its contact, for the office's own readers. */
export async function officeReports(who, s = store(), now = Date.now()) {
  if (!officeAllow(who)) return null;
  const dash = await officeDashboard(who, s, now);
  const [grants, cases, contacts] = await Promise.all([readGrants(s), readCases(s), readContacts(s)]);
  const byId = contactMap(contacts);
  const yearOf = (d) => (d ? String(d).slice(0, 4) : null);
  const years = (list, pick) => [...new Set(list.map(pick).filter(Boolean))].sort();
  const pipes = OFFICE_PIPELINES.map((p) => p.name);
  const gYears = years(grants, (x) => yearOf(x.submitted));
  const granted = grants.filter((x) => grantStatus(x) === 'Granted');
  const aYears = years(granted, (x) => yearOf(x.closed));
  const kYears = years(cases, (x) => yearOf(x.submitted));
  return { asOf: dash.asOf, year: dash.year, pipelines: pipes, caseTypes: OFFICE_CASES.types,
    active: dash.grants.active, months: dash.grants.months, openStages: dash.grants.stages, openCases: dash.cases,
    byYear: gYears.map((y) => ({ year: y, counts: pipes.map((p) => grants.filter((x) => x.pipeline === p && yearOf(x.submitted) === y).length),
      sums: pipes.map((p) => grants.filter((x) => x.pipeline === p && yearOf(x.submitted) === y).reduce((t, x) => t + (x.amount || 0), 0)) })),
    noSubmitted: grants.filter((x) => !x.submitted).length,
    awarded: aYears.map((y) => ({ year: y, counts: pipes.map((p) => granted.filter((x) => x.pipeline === p && yearOf(x.closed) === y).length),
      sums: pipes.map((p) => granted.filter((x) => x.pipeline === p && yearOf(x.closed) === y).reduce((t, x) => t + (x.amount || 0), 0)) })),
    grantedUndated: granted.filter((x) => !x.closed).length,
    grantees: granted.slice().sort((a, b) => String(b.closed || '').localeCompare(String(a.closed || '')) || a.name.localeCompare(b.name))
      .map((x) => { const c = x.contact ? byId.get(x.contact) : null; return { id: x.id, name: x.name, pipeline: x.pipeline, amount: x.amount ?? null, closed: x.closed || null,
        contact: c ? c.id : null, contactName: c ? [c.first, c.last].filter(Boolean).join(' ') : null }; }),
    casesByStatus: OFFICE_CASES.statuses.map((st) => ({ status: st.name, open: st.open, count: cases.filter((x) => x.status === st.name).length })),
    casesByYear: kYears.map((y) => ({ year: y, counts: OFFICE_CASES.types.map((ty) => cases.filter((x) => x.type === ty && yearOf(x.submitted) === y).length) })),
  };
}

/* QUICKBOOKS (Ryan, 2026-10-21: connect the office to QuickBooks, with an
   Intuit app of ours and a daily pull). The app's id and secret are
   CB_QB_CLIENT_ID and CB_QB_CLIENT_SECRET in Netlify; without both, or without
   the office's key, nothing here runs. The office only READS our books: it
   asks Intuit for nothing but QB_SCOPE and sends nothing back but the tokens'
   own refresh and revoke.

   CONNECTING. A director or an administrator presses Connect in the office.
   qbConnect keeps a state, sealed, with who asked and when, for QB_STATE_FOR,
   and hands back Intuit's address with it; Intuit sends them back to
   QB_CALLBACK with a code and the company's id, and qbCallback, finding the
   same state not yet used, trades the code for tokens and keeps them sealed in
   QB with the company's id, who connected and when. The state is used once.
   The tokens never leave the server, are never in an answer and are never
   logged; qbStatus says only whether the office is connected, since when and
   by whom, and when the books were last read. Disconnect revokes them at
   Intuit and deletes them.

   READING. officeQuickBooks, each night from cb-office-daily.mjs and on a
   director's press, refreshes the access token, keeping whatever refresh
   token Intuit hands back, since Intuit may replace it; reads the last QB_DAYS
   days of money in (deposits, payments and sales receipts) and this year's
   profit and loss by month; and keeps that, sealed, in QB_BOOKS, replacing
   what was there. Each transaction keeps its kind, Intuit's id, its day, its
   amount, who it was from as QuickBooks names them, and the account it went
   to: no memo, no address, no email. A deposit line that moves a payment or a
   receipt already listed is not counted again. The report is read by its
   groups' names, never by row position, and a value Intuit leaves empty is
   nothing, not a fault. */
export const QB_SCOPE = 'com.intuit.quickbooks.accounting';
const QB_AUTH = 'https://appcenter.intuit.com/connect/oauth2';
const QB_TOKEN = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
const QB_REVOKE = 'https://developer.api.intuit.com/v2/oauth2/tokens/revoke';
const QB_API = 'https://quickbooks.api.intuit.com/v3/company/';
const QB_MINOR = 75;
export const QB_DAYS = 30;
export const QB_CALLBACK = '/cb/office/quickbooks';
const QB_STATE = 'office-qb-state', QB = 'office-qb', QB_BOOKS = 'office-qb-books';
const QB_STATE_FOR = 10 * 60 * 1000;
const QB_KINDS = { Deposit: 'Deposit', Payment: 'Payment', SalesReceipt: 'Sales receipt' };

function qbClient() {
  const id = process.env.CB_QB_CLIENT_ID, secret = process.env.CB_QB_CLIENT_SECRET;
  return id && secret ? { id: id.trim(), secret: secret.trim() } : null;
}
export function qbReady() { return !!qbClient() && officeReady(); }
const qbBasic = (c) => 'Basic ' + Buffer.from(c.id + ':' + c.secret).toString('base64');
const qbHash = (state) => createHash('sha256').update(String(state)).digest('base64url');

/* Connect: a state for Intuit to hand back, and Intuit's address with it. */
export async function qbConnect(who, origin, s = store(), now = Date.now()) {
  if (!officeAllow(who)) return { error: 'office' };
  const c = qbClient();
  if (!c || !officeReady()) return { error: 'not-set-up' };
  const state = randomBytes(24).toString('base64url');
  await updateSealed(QB_STATE, () => ({ hash: qbHash(state), by: who.handle, t: now }), s);
  const q = new URLSearchParams({ client_id: c.id, response_type: 'code', scope: QB_SCOPE, redirect_uri: origin + QB_CALLBACK, state });
  return { go: QB_AUTH + '?' + q };
}

async function qbTokens(c, form, fetchFn) {
  const r = await fetchFn(QB_TOKEN, { method: 'POST', headers: { authorization: qbBasic(c), accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(form).toString() });
  if (!r.ok) return null;
  const t = await r.json().catch(() => null);
  return t && typeof t.access_token === 'string' && typeof t.refresh_token === 'string' ? t : null;
}
const keepTokens = (t, now) => ({ access: t.access_token, accessUntil: now + (Number(t.expires_in) || 3600) * 1000,
  refresh: t.refresh_token, refreshUntil: now + (Number(t.x_refresh_token_expires_in) || 100 * 86400) * 1000 });

/* Intuit sends the person back here. The state must be the one kept, unused
   and fresh; it goes whatever happens next. */
export async function qbCallback(params, origin, s = store(), now = Date.now(), fetchFn = fetch) {
  const c = qbClient();
  if (!c || !officeReady()) return { error: 'not-set-up' };
  const state = String(params.get('state') || ''), code = String(params.get('code') || ''), realm = String(params.get('realmId') || '');
  let kept = null;
  await updateSealed(QB_STATE, (was) => { kept = was; return was ? { gone: true } : null; }, s);
  if (!kept || kept.gone || !state || kept.hash !== qbHash(state) || now - kept.t > QB_STATE_FOR) return { error: 'state' };
  if (params.get('error')) return { error: 'refused' };
  if (!code || !/^\d{1,40}$/.test(realm)) return { error: 'code' };
  const t = await qbTokens(c, { grant_type: 'authorization_code', code, redirect_uri: origin + QB_CALLBACK }, fetchFn);
  if (!t) return { error: 'code' };
  await updateSealed(QB, () => ({ realm, ...keepTokens(t, now), by: kept.by, t: now }), s);
  return { connected: true };
}

/* Whether the office is connected, and the books as last read, for the page:
   never a token, never the company's id. */
export async function qbStatus(who, s = store()) {
  if (!officeAllow(who)) return null;
  const [q, books] = await Promise.all([readSealed(QB, s), readSealed(QB_BOOKS, s)]);
  return { ready: qbReady(), connected: !!(q && q.refresh), by: q ? q.by : null, since: q ? q.t : null,
    stale: !!(q && q.refreshUntil && q.refreshUntil < Date.now()), books: books || null };
}

export async function qbDisconnect(who, s = store(), fetchFn = fetch) {
  if (!officeAllow(who)) return { error: 'office' };
  const c = qbClient(), q = await readSealed(QB, s);
  if (c && q && q.refresh) {
    await fetchFn(QB_REVOKE, { method: 'POST', headers: { authorization: qbBasic(c), accept: 'application/json', 'content-type': 'application/json' }, body: JSON.stringify({ token: q.refresh }) }).catch(() => null);
  }
  await s.delete(QB);
  await s.delete(QB_BOOKS);
  return { gone: true };
}

/* A fresh access token, refreshed when it has under five minutes left. */
async function qbAccess(c, s, now, fetchFn) {
  const q = await readSealed(QB, s);
  if (!q || !q.refresh) return { error: 'not-connected' };
  if (q.access && q.accessUntil - now > 5 * 60 * 1000) return { q };
  const t = await qbTokens(c, { grant_type: 'refresh_token', refresh_token: q.refresh }, fetchFn);
  if (!t) return { error: 'refresh' };
  const next = { ...q, ...keepTokens(t, now) };
  await updateSealed(QB, (was) => (was && was.realm === q.realm ? { ...was, ...keepTokens(t, now) } : null), s);
  return { q: next };
}

const qbMoney = (v) => { const n = Number(v); return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0; };
const qbDay = (v) => (typeof v === 'string' && isDay(v) ? v : null);
const qbName = (ref) => (ref && typeof ref.name === 'string' && ref.name.trim() ? ref.name.trim().slice(0, 200) : null);

/* Money in, one row a transaction: a deposit counts only its lines that move
   nothing already listed (no LinkedTxn). */
export function qbMoneyIn(resp) {
  const out = [];
  for (const [entity, kind] of Object.entries(QB_KINDS)) {
    for (const x of (resp && resp[entity]) || []) {
      const day = qbDay(x.TxnDate);
      if (!day || x.Id == null) continue;
      let amount = qbMoney(x.TotalAmt), from = qbName(x.CustomerRef), moved = 0;
      if (entity === 'Deposit') {
        const lines = Array.isArray(x.Line) ? x.Line : [];
        const own = lines.filter((l) => !(Array.isArray(l.LinkedTxn) && l.LinkedTxn.length));
        moved = qbMoney(lines.reduce((n, l) => n + qbMoney(l.Amount), 0) - own.reduce((n, l) => n + qbMoney(l.Amount), 0));
        amount = qbMoney(own.reduce((n, l) => n + qbMoney(l.Amount), 0));
        from = own.map((l) => qbName(l.DepositLineDetail && l.DepositLineDetail.Entity)).find(Boolean) || null;
      }
      out.push({ kind, id: String(x.Id), day, amount, moved, from, account: qbName(x.DepositToAccountRef) });
    }
  }
  return out.sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0));
}

/* This year's profit and loss by month, by its groups' names. */
export function qbProfitLoss(report) {
  const cols = ((report && report.Columns && report.Columns.Column) || []).map((c) => String(c.ColTitle || ''));
  const months = cols.slice(1).filter((t) => t && !/^total$/i.test(t));
  const rows = (report && report.Rows && report.Rows.Row) || [];
  const find = (name) => rows.find((r) => r && r.group === name);
  const sums = (row) => (row && row.Summary && Array.isArray(row.Summary.ColData) ? row.Summary.ColData.slice(1, 1 + months.length).map((d) => qbMoney(d && d.value)) : months.map(() => 0));
  const income = sums(find('Income')), expense = sums(find('Expenses')), net = sums(find('NetIncome'));
  const inc = find('Income');
  const accounts = ((inc && inc.Rows && inc.Rows.Row) || []).map((r) => {
    const cd = (r.ColData || (r.Header && r.Header.ColData) || []);
    const total = r.Summary && r.Summary.ColData ? r.Summary.ColData.at(-1) : cd.at(-1);
    return { account: String((cd[0] && cd[0].value) || '').slice(0, 200), total: qbMoney(total && total.value) };
  }).filter((x) => x.account);
  return { months: months.map((m, i) => ({ month: m, income: income[i] || 0, expense: expense[i] || 0, net: net[i] || 0 })), accounts };
}

async function qbGet(q, path, fetchFn) {
  const r = await fetchFn(QB_API + q.realm + path + (path.includes('?') ? '&' : '?') + 'minorversion=' + QB_MINOR, { headers: { authorization: 'Bearer ' + q.access, accept: 'application/json' } });
  if (!r.ok) return null;
  return r.json().catch(() => null);
}

/* Read the books and keep what was read. */
export async function officeQuickBooks(s = store(), now = Date.now(), fetchFn = fetch) {
  const c = qbClient();
  if (!c || !officeReady()) return { error: 'not-set-up' };
  const a = await qbAccess(c, s, now, fetchFn);
  if (a.error) return a;
  const day = today(new Date(now)), from = dayBefore(day, QB_DAYS - 1), year = day.slice(0, 4);
  const money = {};
  for (const entity of Object.keys(QB_KINDS)) {
    const got = await qbGet(a.q, '/query?query=' + encodeURIComponent(`select * from ${entity} where TxnDate >= '${from}' maxresults 1000`), fetchFn);
    if (!got || !got.QueryResponse) return { error: 'read' };
    money[entity] = got.QueryResponse[entity] || [];
  }
  const pl = await qbGet(a.q, '/reports/ProfitAndLoss?' + new URLSearchParams({ start_date: year + '-01-01', end_date: day, summarize_column_by: 'Month' }), fetchFn);
  if (!pl) return { error: 'read' };
  const books = { read: now, day, from, moneyIn: qbMoneyIn(money), year, profitLoss: qbProfitLoss(pl) };
  await updateSealed(QB_BOOKS, () => books, s);
  return { read: now, count: books.moneyIn.length };
}

/* GIVEBUTTER (Ryan, 2026-10-21: add Givebutter to the dashboard). Our giving
   platform, read with an API key of ours, CB_GIVEBUTTER_KEY in Netlify, and
   written to in ONE way only, gbJoin below, on a director's press (Ryan,
   2026-10-23, reversing "never written"). Otherwise the office only asks
   GB_API for lists. Each night from
   cb-office-daily.mjs, and on Read Givebutter now, officeGivebutter reads the
   last GB_MONTHS months of gifts, every recurring plan and every campaign, and
   keeps, sealed in GB_BOOKS and replacing the last read: for each gift its
   id, day, amount, what reached us after fees, its campaign, whether it was
   recurring and whether it went through; for each plan its status, how often
   and how much; and for each campaign its title, goal, what it has raised and
   how many have given. **No donor is named, emailed or addressed**: a donor
   can give to Givebutter anonymously, the API does not say which gifts were,
   and the dashboard needs nobody's name to count. Every page is asked of
   GB_API by number with the same filters, never by following a link an
   answer gives, and a list longer than GB_PAGES pages is refused rather than
   half read. */
export const GB_MONTHS = 12;
const GB_API = 'https://api.givebutter.com/v1/';
const GB_BOOKS = 'office-givebutter';
const GB_PAGES = 50;
// A contact Givebutter says it made longer ago than this was there before the press (clocks drift).
const GB_FRESH = 10 * 60 * 1000;
const GB_A_MONTH = { weekly: 52 / 12, monthly: 1, quarterly: 1 / 3, yearly: 1 / 12, annually: 1 / 12 };

function gbKey() {
  const k = process.env.CB_GIVEBUTTER_KEY;
  return k && k.trim() ? k.trim() : null;
}
export function gbReady() { return !!gbKey() && officeReady(); }

async function gbList(path, key, fetchFn) {
  // Each page is asked for by number, with the same filters, never by following a link the answer gives.
  const out = [];
  for (let page = 1; page <= GB_PAGES; page++) {
    const r = await fetchFn(GB_API + path + (path.includes('?') ? '&' : '?') + 'page=' + page, { headers: { authorization: 'Bearer ' + key, accept: 'application/json' } });
    if (!r.ok) return null;
    const b = await r.json().catch(() => null);
    if (!b || !Array.isArray(b.data)) return null;
    out.push(...b.data);
    const last = b.meta && Number.isInteger(b.meta.last_page) ? b.meta.last_page : null;
    if (!b.data.length || (last != null ? page >= last : !(b.links && b.links.next))) return out;
  }
  return null;
}

const gbYes = (v) => v === true || v === 1 || v === 'true' || v === '1';
const gbText = (v) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 200) : null);

/* A gift as the office keeps it: never who gave it. */
export function gbGift(x) {
  const at = x && typeof x.transacted_at === 'string' ? Date.parse(x.transacted_at) : NaN;
  if (!x || x.id == null || !Number.isFinite(at)) return null;
  return { id: String(x.id), day: today(new Date(at)), amount: qbMoney(x.amount), payout: qbMoney(x.payout),
    campaign: gbText(x.campaign_title), recurring: x.plan_id != null || gbYes(x.is_recurring),
    ok: x.status === 'succeeded' && !x.refunded_at };
}
export function gbPlan(p) {
  return { status: gbText(p && p.status) || 'unknown', frequency: gbText(p && p.frequency) || 'unknown', amount: qbMoney(p && p.amount) };
}
export function gbCampaign(c) {
  if (!c || !gbText(c.title)) return null;
  const goal = Number(c.goal);
  return { title: gbText(c.title), goal: Number.isFinite(goal) && goal > 0 ? qbMoney(goal) : null, raised: qbMoney(c.raised),
    donors: Number.isInteger(c.donors) && c.donors >= 0 ? c.donors : 0, active: c.status === 'active' };
}
/* What the active plans give in a month, from how often each gives. */
export function gbMonthly(plans) {
  const live = plans.filter((p) => p.status === 'active');
  return { active: live.length, aMonth: qbMoney(live.reduce((n, p) => n + p.amount * (GB_A_MONTH[p.frequency] || 0), 0)),
    unknown: live.filter((p) => !GB_A_MONTH[p.frequency]).length, pastDue: plans.filter((p) => /past_due/.test(p.status)).length };
}

/* The first day of the month n months before day's. */
const monthsBefore = (day, n) => { const d = new Date(Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1 - n, 1)); return d.toISOString().slice(0, 10); };

export async function officeGivebutter(s = store(), now = Date.now(), fetchFn = fetch) {
  const key = gbKey();
  if (!key || !officeReady()) return { error: 'not-set-up' };
  const day = today(new Date(now)), from = monthsBefore(day, GB_MONTHS - 1);
  // Asked from two days early, since Givebutter's clock is not Colorado's; the day decides.
  const after = new Date(Date.parse(from + 'T00:00:00Z') - 2 * 86400000).toISOString();
  const [gifts, plans, campaigns] = await Promise.all([
    gbList('transactions?' + new URLSearchParams({ transactedAfter: after, per_page: '100' }), key, fetchFn),
    gbList('plans?per_page=100', key, fetchFn),
    gbList('campaigns?per_page=100', key, fetchFn),
  ]);
  if (!gifts || !plans || !campaigns) return { error: 'read' };
  const books = { read: now, day, from,
    gifts: gifts.map(gbGift).filter((g) => g && g.day >= from && g.day <= day).sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0)),
    plans: plans.map(gbPlan), campaigns: campaigns.map(gbCampaign).filter(Boolean) };
  await updateSealed(GB_BOOKS, () => books, s);
  return { read: now, count: books.gifts.length };
}

/* Whether Givebutter is set up, and what the office last read. */
export async function gbStatus(who, s = store()) {
  if (!officeAllow(who)) return null;
  const books = await readSealed(GB_BOOKS, s);
  return { ready: gbReady(), books: books ? { ...books, monthly: gbMonthly(books.plans || []) } : null };
}

/* THE ONE WRITE: OUR MAILING LISTS, FROM A JOIN REQUEST (Ryan, 2026-10-23:
   "a director's press sends the name, email and the lists they said yes to",
   reversing "never written", with privacy.html#givebutter-lists said first).
   A form type in OFFICE_INTAKE that names `lists` says which of its questions
   asks for which of our lists, and the tag Givebutter keeps that list under.
   caseLists reads a join request's own answers to those questions, as the
   intake wrote them into its body, and gbJoin, on a director's press and
   nowhere else (never when a form arrives), sends Givebutter exactly four
   things: their first and last name and their email address off their
   contact, the tags of the lists they said yes to, and that they want our
   emails. Nothing else of the join request goes, and nothing about who
   pressed. Givebutter's POST /v1/contacts matches somebody already there by
   email and ADDS the tags it is given, removing none (its Contact Tags page),
   so a second press changes nothing there. The join request keeps which tags
   were sent and when, sealed, and nothing of Givebutter's answer, which is read
   only for when its contact was made, to tell the director who pressed whether
   Givebutter had them already. */
function joinKind(k) {
  return Object.values(OFFICE_INTAKE).find((v) => v.record === 'case' && v.type === k.type && Array.isArray(v.lists)) || null;
}
/* An answer the intake wrote into a body as **question** and then the answer on the next line. */
function formAnswer(body, label) {
  const b = String(body || ''), at = b.indexOf('**' + label + '**\n');
  return at < 0 ? '' : b.slice(at + label.length + 5).split('\n')[0].trim();
}
export function caseLists(k) {
  const kind = k && joinKind(k);
  if (!kind) return null;
  return { lists: kind.lists.map((l) => ({ tag: l.tag, yes: /^yes$/i.test(formAnswer(k.body, l.asks)) })),
    sent: k.gb && Array.isArray(k.gb.tags) ? { tags: k.gb.tags.slice(), t: k.gb.t || null } : null, ready: gbReady() };
}
export async function gbJoin(who, id, s = store(), now = Date.now(), fetchFn = fetch) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  const key = gbKey();
  if (!key || !officeReady()) return { error: 'Givebutter is not set up for the office yet.' };
  const kid = caseId(id);
  const k = (await readCases(s)).find((x) => x.id === kid);
  if (!k) return { error: 'That case has been deleted.' };
  const asked = caseLists(k);
  if (!asked) return { error: 'Only a join request can add somebody to our mailing lists.' };
  const tags = asked.lists.filter((l) => l.yes).map((l) => l.tag);
  if (!tags.length) return { error: 'They did not ask to join any of our mailing lists on the Join form.' };
  const c = k.contact ? (await readContacts(s)).find((x) => x.id === k.contact) : null;
  if (!c) return { error: 'This join request has no contact, so there is no name or email to send.' };
  if (!c.email) return { error: 'Their contact has no email address to send.' };
  if (c.noEmail) return { error: 'Their contact says not to email them. Ask them before adding them to a list.' };
  // Givebutter keeps a contact by a first and a last name, or by an email address with no name
  // (its help center's partial contacts), and one name alone is neither. The Join form files a
  // one-word name as a last name alone, and a contact who gave no name is named by their
  // address, so the names go as a pair or not at all.
  const named = !!(c.first && c.last) && !/@/.test(c.first + c.last);
  // The address goes as primary_email, a string. Givebutter's reference gives `emails` as a list
  // of strings, and its server answered 422, "The emails.0 must be an array" (2026-10-25): it
  // wants each one as { type, value }, which the reference shows only in what it sends back.
  const r = await fetchFn(GB_API + 'contacts', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + key, accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({ ...(named ? { first_name: c.first, last_name: c.last } : {}), primary_email: c.email, tags, email_subscription: true }),
  }).catch(() => null);
  if (!r || !r.ok) return { error: 'Givebutter did not take it' + (r ? ` (it answered ${r.status}${await gbRefusal(r)})` : '') + '. Nothing was sent to the lists.' };
  // Givebutter answers a match with the contact it already had, so its age says which happened.
  const back = await r.json().catch(() => null);
  const made = back && typeof back.created_at === 'string' ? Date.parse(back.created_at) : NaN;
  const already = Number.isFinite(made) ? made < now - GB_FRESH : null;
  let gone = false;
  await updateSealed(CASES, (was) => {
    const list = was && Array.isArray(was.cases) ? was.cases : [];
    const i = list.findIndex((x) => x.id === kid);
    gone = i < 0;
    if (gone) return null;
    const copy = list.slice();
    copy[i] = { ...list[i], gb: { tags, t: now }, edited: now, editedBy: who.handle };
    return { cases: copy, top: topOf(was) };
  }, s);
  return { sent: { tags, t: now }, named, already, gone };
}
/* What Givebutter said was wrong, in its own words, for the director who pressed and nobody
   else: never kept and never logged. A 422's errors name each field and its rule. */
async function gbRefusal(r) {
  const b = await r.json().catch(() => null);
  const said = b && b.errors && typeof b.errors === 'object'
    ? Object.values(b.errors).flat().filter((x) => typeof x === 'string')
    : b && typeof b.message === 'string' ? [b.message] : [];
  const words = [...said.join(' ').replace(/\s+/g, ' ').trim()];
  return words.length ? ': ' + (words.length > 300 ? words.slice(0, 299).join('') + '…' : words.join('')) : '';
}

/* OUR MEMBERS PAGE, FROM A JOIN REQUEST (Ryan's ask, 2026-10-23: "Add to the
   Members page on the join request, previewed and editable, written to
   stimpunks.org with an application password", with privacy.html#members-page
   said first). stimpunks.org's Individuals page lists our members in one
   WordPress list block, a line each: the name in bold, linked to their website
   if they gave one, then a dash and their words. A form type in OFFICE_INTAKE
   that names `members` says which page, and which of its questions ask for the
   words and the link; caseListing reads the join request's own answers, and the
   office page shows the line as it will appear, for a director to tidy.
   listingLook, on a press, reads the page and says where the line will go and
   whether somebody by that name is on it already. listingAdd, on a second press
   and nowhere else (never when a form arrives), reads it again, refuses if it
   has changed since the look (WordPress takes no conditional write, so this
   leaves a second or two between the read and the write), and writes the page
   back with that one line added at the end of the list and every other byte as
   it was. Nothing of the join request goes but the line, and nothing about who
   pressed. The office writes as one WordPress user of WP_SITE, with an
   application password in Netlify (CB_WP_USER, CB_WP_APP_PASSWORD) read once,
   in wpAuth, and asks WP_SITE for that one page and that user's own
   capabilities and nothing else. A user who cannot save unfiltered HTML is
   refused, because WordPress would strip the rest of the page as it saved it.
   WordPress keeps the page as it was as a revision. The join request keeps when
   they were added, sealed, and nothing of WordPress's answer. */
const WP_SITE = 'https://stimpunks.org';
export const LISTING_MAX = { name: 100, link: 300, words: 5000 };

function wpAuth() {
  const u = process.env.CB_WP_USER, p = process.env.CB_WP_APP_PASSWORD;
  return u && u.trim() && p && p.trim() ? 'Basic ' + Buffer.from(u.trim() + ':' + p.trim(), 'utf8').toString('base64') : null;
}
export function listingReady() { return !!wpAuth() && officeReady(); }

function listingKind(k) {
  return Object.values(OFFICE_INTAKE).find((v) => v.record === 'case' && v.type === k.type && v.members) || null;
}
const flat = (v) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim();
const foldName = (v) => flat(v).normalize('NFKC').toLowerCase().replace(/[‘’]/g, "'");
/* A long answer: everything after **question** up to the next question, or the form entry's link. */
function formWords(body, label) {
  const b = String(body || ''), at = b.indexOf('**' + label + '**\n');
  if (at < 0) return '';
  const rest = b.slice(at + label.length + 5), end = rest.search(/\n\n(?:\*\*[^\n]+\*\*\n|Form entry: )/);
  return (end < 0 ? rest : rest.slice(0, end)).trim();
}
/* A web address as the line links it, '' for none, or null for words that are not one. */
export function listingLink(v) {
  let t = flat(v);
  if (!t) return '';
  if (!/^[a-z][a-z0-9+.-]*:/i.test(t)) t = 'https://' + t.replace(/^\/+/, '');
  let u;
  try { u = new URL(t); } catch { return null; }
  if (!/^https?:$/.test(u.protocol) || u.username || u.password || !/\.[a-z]{2,}$/i.test(u.hostname)) return null;
  return u.href.length <= LISTING_MAX.link ? u.href : null;
}
const htmlText = (v) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const htmlAttr = (v) => htmlText(v).replace(/"/g, '&quot;');
/* The line as the page holds it, built from words alone, so nothing typed becomes markup. */
export function listingLine(f) {
  f = f && typeof f === 'object' ? f : {};
  const name = flat(f.name), words = flat(f.words), link = listingLink(f.link);
  if (!name) return { error: 'A line on the Members page needs a name.' };
  if ([...name].length > LISTING_MAX.name) return { error: `A name is up to ${LISTING_MAX.name} characters.` };
  if (/\S+@\S+\.\S+/.test(name)) return { error: 'That name looks like an email address, which goes on no public page. Give the name or pseudonym they go by.' };
  if ([...words].length > LISTING_MAX.words) return { error: `Their words are up to ${LISTING_MAX.words} characters.` };
  if (link === null) return { error: 'That link is not a web address. Leave it empty, or give one like https://example.com.' };
  const who = link ? `<a href="${htmlAttr(link)}"><strong>${htmlText(name)}</strong></a>` : `<strong>${htmlText(name)}</strong>`;
  return { name, link, words, html: `<li>${who}${words ? ' - ' + htmlText(words) : ''}</li>` };
}
/* What a join request asked for on the Members page, and whether it is there yet. */
export function caseListing(k, c) {
  const kind = k && listingKind(k);
  if (!kind) return null;
  const m = kind.members, full = String(k.name || '');
  const own = full.startsWith(kind.prefix) ? full.slice(kind.prefix.length).match(/^(?: \d+)?: (.+)$/) : null;
  // The name they asked to be shown by, once the form asks it, or else the one they gave the form.
  let name = flat(formAnswer(k.body, m.name)) || flat(own ? own[1] : c ? [c.first, c.last].filter(Boolean).join(' ') : '');
  // The intake names somebody who gave no name by their email, which goes on no public page.
  if (/@/.test(name) || name === 'Unknown') name = '';
  const words = flat(formWords(k.body, m.words)), link = flat(formAnswer(k.body, m.link));
  return { gave: { name, link, words }, asked: !!(words || link), address: m.address,
    added: k.listed && k.listed.t ? { t: k.listed.t } : null, ready: listingReady(), max: LISTING_MAX };
}
/* The page's one list of members: where a line goes in, and the names already on it. */
const WP_LIST = /<!-- wp:list(?= )/;
const WP_LIST_END = '</ul>\n<!-- /wp:list -->';
function plainHtml(h) {
  return flat(String(h).replace(/<[^>]*>/g, '').replace(/&nbsp;|&#160;/g, ' ').replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&quot;/g, '"').replace(/&#0*39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
}
export function membersList(raw) {
  const opens = (raw.match(new RegExp(WP_LIST.source, 'g')) || []).length, ends = raw.split('<!-- /wp:list -->').length - 1;
  const start = raw.search(WP_LIST), at = raw.indexOf(WP_LIST_END);
  if (opens !== 1 || ends !== 1 || start < 0 || at < start) return { error: 'The Members page no longer has its one list of members as the office expects, so nothing was changed. Add them on stimpunks.org.' };
  const names = [...raw.slice(start, at).matchAll(/<li>([\s\S]*?)<\/li>/g)]
    .map((x) => { const b = x[1].match(/<strong>([\s\S]*?)<\/strong>/); return b ? plainHtml(b[1]) : ''; }).filter(Boolean);
  return { at, names };
}
async function wpAsk(path, auth, fetchFn, init = {}) {
  const r = await fetchFn(WP_SITE + path, { ...init, headers: { authorization: auth, accept: 'application/json', ...(init.headers || {}) } }).catch(() => null);
  if (!r) return { error: 'stimpunks.org could not be reached just now. Nothing was changed.' };
  if (r.status === 401) return { error: 'stimpunks.org did not take the office’s application password (it answered 401). CB_WP_USER and CB_WP_APP_PASSWORD in Netlify need a look. Nothing was changed.' };
  if (!r.ok) return { error: `stimpunks.org answered ${r.status}. Nothing was changed.` };
  const b = await r.json().catch(() => null);
  return b && typeof b === 'object' ? { b } : { error: 'stimpunks.org’s answer could not be read. Nothing was changed.' };
}
async function wpCanSave(auth, fetchFn, upload = false) {
  const a = await wpAsk('/wp-json/wp/v2/users/me?context=edit&_fields=capabilities', auth, fetchFn);
  if (a.error) return a;
  const cap = a.b.capabilities || {};
  if (upload && cap.upload_files !== true) return { error: 'The WordPress user the office writes as cannot put a logo in the media library. It needs to be an Editor or an Administrator on stimpunks.org.' };
  if (cap.edit_pages !== true || cap.edit_published_pages !== true || cap.edit_others_pages !== true) return { error: 'The WordPress user the office writes as cannot change that page. It needs to be an Editor or an Administrator on stimpunks.org.' };
  if (cap.unfiltered_html !== true) return { error: 'The WordPress user the office writes as cannot save the page without WordPress stripping parts of it, so nothing was changed. It needs to be an Editor or an Administrator on stimpunks.org.' };
  return {};
}
async function wpPage(page, auth, fetchFn) {
  const a = await wpAsk(`/wp-json/wp/v2/pages/${page}?context=edit&_fields=content,modified_gmt`, auth, fetchFn);
  if (a.error) return a;
  const raw = a.b.content && typeof a.b.content.raw === 'string' ? a.b.content.raw : null;
  if (raw === null || typeof a.b.modified_gmt !== 'string') return { error: 'stimpunks.org did not send the Members page as it is kept. Nothing was changed.' };
  return { raw, modified: a.b.modified_gmt };
}
async function listingCase(id, s) {
  const kid = caseId(id);
  const k = (await readCases(s)).find((x) => x.id === kid);
  if (!k) return { error: 'That case has been deleted.' };
  const kind = listingKind(k), asked = caseListing(k, null);
  if (!kind || !asked) return { error: 'Only a join request can add somebody to the Members page.' };
  if (asked.added) return { error: 'They are on the Members page already, from this join request. Changing their line is done on stimpunks.org.' };
  if (!asked.asked) return { error: 'They did not fill in the Members page part of the Join form, so they have not asked to be on it.' };
  return { k, kid, page: kind.members.page, address: kind.members.address };
}
/* Where the line would go, read from the page as it is now, on a press. */
export async function listingLook(who, id, name, s = store(), fetchFn = fetch) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  const auth = wpAuth();
  if (!auth || !officeReady()) return { error: 'Adding to the Members page is not set up for the office yet.' };
  const got = await listingCase(id, s);
  if (got.error) return got;
  const can = await wpCanSave(auth, fetchFn);
  if (can.error) return can;
  const pg = await wpPage(got.page, auth, fetchFn);
  if (pg.error) return pg;
  const list = membersList(pg.raw);
  if (list.error) return list;
  return { modified: pg.modified, after: list.names[list.names.length - 1] || null, there: !!flat(name) && list.names.some((x) => foldName(x) === foldName(name)) };
}
/* The one write: that line, at the end of the page's list, on a director's second press. */
export async function listingAdd(who, id, f, s = store(), now = Date.now(), fetchFn = fetch) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  const auth = wpAuth();
  if (!auth || !officeReady()) return { error: 'Adding to the Members page is not set up for the office yet.' };
  f = f && typeof f === 'object' ? f : {};
  const line = listingLine(f);
  if (line.error) return line;
  if (typeof f.modified !== 'string' || !f.modified) return { error: 'Check the Members page first, so you can see where the line goes.' };
  const got = await listingCase(id, s);
  if (got.error) return got;
  const can = await wpCanSave(auth, fetchFn);
  if (can.error) return can;
  const pg = await wpPage(got.page, auth, fetchFn);
  if (pg.error) return pg;
  const list = membersList(pg.raw);
  if (list.error) return list;
  if (pg.modified !== f.modified) return { error: 'The Members page has changed since you checked it, so nothing was added. Look at where the line goes now, then add it.',
    changed: { modified: pg.modified, after: list.names[list.names.length - 1] || null, there: list.names.some((x) => foldName(x) === foldName(line.name)) } };
  if (list.names.some((x) => foldName(x) === foldName(line.name))) return { error: `Somebody called ${line.name} is on the Members page already, so nothing was added. If they are somebody else, give the line a name that tells them apart.` };
  const next = pg.raw.slice(0, list.at) + '\n\n<!-- wp:list-item -->\n' + line.html + '\n<!-- /wp:list-item -->' + pg.raw.slice(list.at);
  const put = await wpAsk(`/wp-json/wp/v2/pages/${got.page}?context=edit&_fields=content`, auth, fetchFn, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content: next }),
  });
  if (put.error) return { error: put.error.replace('Nothing was changed.', 'Nothing was added to the Members page.') };
  const kept = put.b.content && put.b.content.raw === next;
  let gone = false;
  await updateSealed(CASES, (was) => {
    const list2 = was && Array.isArray(was.cases) ? was.cases : [];
    const i = list2.findIndex((x) => x.id === got.kid);
    gone = i < 0;
    if (gone) return null;
    const copy = list2.slice();
    copy[i] = { ...list2[i], listed: { t: now }, edited: now, editedBy: who.handle };
    return { cases: copy, top: topOf(was) };
  }, s);
  return { added: { t: now }, address: got.address, kept, gone };
}

/* OUR ORGANIZATIONS PAGE, FROM A JOIN REQUEST (Ryan's ask, 2026-10-23: "on the
   join request, previewed and editable, with the logo they uploaded copied into
   the media library", with privacy.html#organizations-page said first).
   stimpunks.org's Organizations page holds one rounded, coloured group block for
   each organization: a logo if there is one, then the name linked to its website,
   a dash and its words. A form type in OFFICE_INTAKE that names `organizations`
   says which page, which of the Join form's questions ask for the words, the
   website and the logo, and the grounds an entry may stand on. The form asks no
   name, so a director types it. orgLook, on a press, reads the page, says whose
   entry this one goes after, which ground the page has used least lately, and
   whether the name or the website is on it already, and fetches the logos the
   form kept (WPForms' own uploads on WP_SITE, ORG_LOGO, never anywhere else),
   each with its camera data taken off (bareImage), so the director can see one
   and say what it shows; it keeps nothing. orgAdd, on a second press and nowhere
   else, reads the page again, refuses it if it has changed since the look or the
   name is on it, fetches the chosen logo again and takes its camera data off
   again rather than trusting anything the page sends, puts it in stimpunks.org's
   media library, and writes the page back with one group block added after its
   last organization and every other byte as it was. It writes as listingAdd's
   user, through wpAsk. The join request keeps when, sealed. */
export const ORG_MAX = { name: 120, link: 300, words: 5000, alt: ALT_MAX, logo: 3000000 };
const ORG_LOGO = /^https:\/\/stimpunks\.org\/wp-content\/uploads\/wpforms\/\d+-[0-9a-f]{32}\/[^/?#\s"<>]+$/;
const ORG_EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
const ORG_STYLE = '{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}},"border":{"radius":{"topLeft":"33px","topRight":"33px","bottomLeft":"33px","bottomRight":"33px"}}}';
const ORG_CSS = 'border-top-left-radius:33px;border-top-right-radius:33px;border-bottom-left-radius:33px;border-bottom-right-radius:33px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)';

function orgKind(k) {
  return Object.values(OFFICE_INTAKE).find((v) => v.record === 'case' && v.type === k.type && v.organizations) || null;
}
/* Words in paragraphs: a blank line between two starts a new one, and any other run of space is one space. */
const orgParas = (v) => String(v == null ? '' : v).split(/\n[ \t]*\n/).map(flat).filter(Boolean);

/* What a join request asked for on the Organizations page, and whether it is there yet. */
export function caseOrg(k) {
  const kind = k && orgKind(k);
  if (!kind) return null;
  const o = kind.organizations;
  const words = orgParas(formWords(k.body, o.words)).join('\n\n'), link = flat(formAnswer(k.body, o.link));
  const logos = formWords(k.body, o.logo).split(/\s+/).filter((u) => ORG_LOGO.test(u)).slice(0, 2);
  // Its name, once the form asks it; until then a director types it.
  let name = flat(formAnswer(k.body, o.name));
  if (/@/.test(name)) name = '';
  return { gave: { name, words, link, logos: logos.length }, asked: !!(words || link || logos.length), address: o.address,
    grounds: o.grounds.map(([key, words]) => ({ key, words })), added: k.orgListed && k.orgListed.t ? { t: k.orgListed.t } : null,
    ready: listingReady(), max: ORG_MAX };
}

/* The entry as a director has it: { name, link, paras, ground, logo, alt } or { error }. */
export function orgFields(f, grounds, logos) {
  f = f && typeof f === 'object' ? f : {};
  const name = flat(f.name), link = listingLink(f.link), paras = orgParas(f.words), alt = flat(f.alt);
  if (!name) return { error: 'An organization on the page needs a name. The Join form does not ask for one, so take it from their words or their website.' };
  if ([...name].length > ORG_MAX.name) return { error: `A name is up to ${ORG_MAX.name} characters.` };
  if (/\S+@\S+\.\S+/.test(name)) return { error: 'That name looks like an email address, which goes on no public page.' };
  if ([...paras.join('')].length > ORG_MAX.words) return { error: `Their words are up to ${ORG_MAX.words} characters.` };
  if (link === null) return { error: 'That link is not a web address. Leave it empty, or give one like https://example.org.' };
  const ground = grounds.find((g) => g[0] === f.ground);
  if (!ground) return { error: 'Choose one of the grounds the page’s organizations stand on.' };
  let logo = null;
  if (f.logo !== null && f.logo !== undefined && f.logo !== '') {
    logo = Number(f.logo);
    if (!Number.isInteger(logo) || logo < 0 || logo >= logos) return { error: 'That is not one of the logos they sent.' };
    if (!alt) return { error: 'Say in words what the logo shows, for anybody who cannot see it.' };
    if ([...alt].length > ORG_MAX.alt) return { error: `What the logo shows is up to ${ORG_MAX.alt} characters.` };
  }
  return { name, link, paras, ground: ground[0], logo, alt: logo === null ? '' : alt };
}

/* The entry as the page holds it, in the page's own group block, built from words alone. */
export function orgHtml(x, media) {
  const who = x.link ? `<a href="${htmlAttr(x.link)}">${htmlText(x.name)}</a>` : htmlText(x.name);
  const ps = (x.paras.length ? x.paras : ['']).map((p, i) => `<!-- wp:paragraph -->\n<p>${i ? htmlText(p) : who + (p ? ' - ' + htmlText(p) : '')}</p>\n<!-- /wp:paragraph -->`);
  const img = media ? `<!-- wp:image {"id":${media.id},"width":"200px","height":"auto","sizeSlug":"full","linkDestination":"none","align":"center"} -->\n`
    + `<figure class="wp-block-image aligncenter size-full is-resized"><img src="${htmlAttr(media.src)}" alt="${htmlAttr(x.alt)}" class="wp-image-${media.id}" style="width:200px;height:auto"/></figure>\n<!-- /wp:image -->\n\n` : '';
  return `<!-- wp:group {"style":${ORG_STYLE},"backgroundColor":"${x.ground}","layout":{"type":"constrained"}} -->\n`
    + `<div class="wp-block-group has-${x.ground}-background-color has-background" style="${ORG_CSS}">${img}${ps.join('\n\n')}</div>\n<!-- /wp:group -->`;
}

/* The page's organizations: where an entry goes in, the grounds in order, the last one's name, and the names and websites on it. */
const ORG_BLOCK = /<!-- wp:(?:group|columns) \{[^\n]*?"backgroundColor":"(custom-color-\d+)"[^\n]*\} -->/g;
export function orgsList(raw) {
  const g = raw.lastIndexOf('<!-- /wp:group -->'), c = raw.lastIndexOf('<!-- /wp:columns -->');
  const at = Math.max(g < 0 ? -1 : g + '<!-- /wp:group -->'.length, c < 0 ? -1 : c + '<!-- /wp:columns -->'.length);
  const blocks = [...raw.matchAll(ORG_BLOCK)];
  const rest = at < 0 ? raw : raw.slice(at).replace(/<!-- wp:paragraph -->\s*<p><\/p>\s*<!-- \/wp:paragraph -->/g, '');
  if (at < 0 || !blocks.length || rest.trim() || blocks[blocks.length - 1].index > at) return { error: 'The Organizations page no longer ends with its organizations as the office expects, so nothing was changed. Add it on stimpunks.org.' };
  const p = raw.slice(blocks[blocks.length - 1].index, at).match(/<p>([\s\S]*?)<\/p>/);
  const hosts = [...raw.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => { try { return new URL(m[1].replace(/&amp;/g, '&')).hostname.replace(/^www\./, ''); } catch { return ''; } })
    .filter((h) => h && h !== 'stimpunks.org');
  return { at, grounds: blocks.map((m) => m[1]), after: p ? plainHtml(p[1]).split(' - ')[0].slice(0, 80) || null : null,
    names: [...raw.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)].map((m) => plainHtml(m[1])).filter(Boolean), hosts };
}
/* The ground the page has used least lately, so no two entries side by side match. */
function freshGround(grounds, used) {
  let best = null, at = Infinity;
  for (const [key] of grounds) { const i = used.lastIndexOf(key); if (i < at) { best = key; at = i; } }
  return best;
}
const hostOf = (link) => { try { return new URL(link).hostname.replace(/^www\./, ''); } catch { return ''; } };

/* A picture with everything a camera or a phone writes into it taken off: JPEG
   segments other than those the picture needs to be drawn, PNG chunks other than
   those it is drawn from, and WebP's EXIF and XMP chunks. Null when it cannot be
   read; carriesMetadata checks what comes out. */
export function bareImage(bytes, kind) {
  const b = Buffer.from(bytes);
  if (kind === 'image/jpeg') {
    const out = [b.subarray(0, 2)];
    let i = 2;
    while (i + 2 <= b.length) {
      if (b[i] !== 0xff) return null;
      const m = b[i + 1];
      if (m === 0xff) { i++; continue; }
      if (m === 0xda) { out.push(b.subarray(i)); return Buffer.concat(out); }
      if (m === 0x01 || (m >= 0xd0 && m <= 0xd8)) { out.push(b.subarray(i, i + 2)); i += 2; continue; }
      if (m === 0xd9 || i + 4 > b.length) return null;
      const end = i + 2 + b.readUInt16BE(i + 2);
      if (end > b.length || end < i + 4) return null;
      // APP1 (Exif, XMP), APP13 (Photoshop, IPTC), the other APPn and comments go; APP0, ICC (APP2) and Adobe (APP14) stay.
      if (!((m >= 0xe1 && m <= 0xef && m !== 0xe2 && m !== 0xee) || m === 0xfe)) out.push(b.subarray(i, end));
      i = end;
    }
    return null;
  }
  if (kind === 'image/png') {
    const keep = new Set(['IHDR', 'PLTE', 'IDAT', 'IEND', 'tRNS', 'gAMA', 'cHRM', 'sRGB', 'iCCP', 'sBIT', 'bKGD', 'pHYs', 'acTL', 'fcTL', 'fdAT']);
    const out = [b.subarray(0, 8)];
    let i = 8;
    while (i + 12 <= b.length) {
      const type = b.toString('latin1', i + 4, i + 8), end = i + 12 + b.readUInt32BE(i);
      if (end > b.length) return null;
      if (keep.has(type)) out.push(b.subarray(i, end));
      if (type === 'IEND') return Buffer.concat(out);
      i = end;
    }
    return null;
  }
  if (kind === 'image/webp') {
    const out = [];
    let i = 12;
    while (i + 8 <= b.length) {
      const type = b.toString('latin1', i, i + 4), len = b.readUInt32LE(i + 4);
      if (i + 8 + len > b.length) return null;
      const end = Math.min(b.length, i + 8 + len + (len & 1));
      if (type !== 'EXIF' && type !== 'XMP ') {
        const chunk = Buffer.from(b.subarray(i, end));
        if (type === 'VP8X' && chunk.length > 8) chunk[8] &= ~0x0c;
        out.push(chunk);
      }
      i = end;
    }
    const body = Buffer.concat(out), head = Buffer.alloc(12);
    head.write('RIFF', 0, 'latin1'); head.writeUInt32LE(body.length + 4, 4); head.write('WEBP', 8, 'latin1');
    return Buffer.concat([head, body]);
  }
  return null;
}
/* A logo the Join form kept, fetched from WP_SITE's WPForms uploads and nowhere else, with its camera data off. */
async function orgLogo(url, fetchFn) {
  if (!ORG_LOGO.test(url)) return { error: 'That logo is not one the Join form kept on stimpunks.org.' };
  const big = `Their logo is over ${Math.round(ORG_MAX.logo / 1e6)} MB, so it is added by hand on stimpunks.org.`;
  const r = await fetchFn(url, { redirect: 'error' }).catch(() => null);
  if (!r || !r.ok) return { error: `stimpunks.org did not send their logo${r ? ` (it answered ${r.status})` : ''}.` };
  const said = Number(r.headers && typeof r.headers.get === 'function' ? r.headers.get('content-length') : NaN);
  if (said > ORG_MAX.logo) return { error: big };
  const bytes = Buffer.from(await r.arrayBuffer());
  if (bytes.length > ORG_MAX.logo) return { error: big };
  const kind = imageKind(bytes);
  if (!kind) return { error: 'Their logo is not a PNG, JPEG or WebP picture, so it is added by hand on stimpunks.org.' };
  const bare = bareImage(bytes, kind);
  if (!bare || carriesMetadata(bare, kind)) return { error: 'Their logo’s camera data could not be taken off, so it is added by hand on stimpunks.org.' };
  return { bytes: bare, kind };
}
async function orgCase(id, s) {
  const kid = caseId(id);
  const k = (await readCases(s)).find((x) => x.id === kid);
  if (!k) return { error: 'That case has been deleted.' };
  const kind = orgKind(k), asked = caseOrg(k);
  if (!kind || !asked) return { error: 'Only a join request can add an organization to the Organizations page.' };
  if (asked.added) return { error: 'Their organization is on the Organizations page already, from this join request. Changing it is done on stimpunks.org.' };
  if (!asked.asked) return { error: 'They did not fill in the Organizations page part of the Join form, so they have not asked for their organization to be on it.' };
  const o = kind.organizations;
  return { k, kid, page: o.page, address: o.address, grounds: o.grounds,
    logos: formWords(k.body, o.logo).split(/\s+/).filter((u) => ORG_LOGO.test(u)).slice(0, 2) };
}
/* Where the entry would go, and their logos to look at, read on a press. */
export async function orgLook(who, id, name, link, s = store(), fetchFn = fetch) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  const auth = wpAuth();
  if (!auth || !officeReady()) return { error: 'Adding to the Organizations page is not set up for the office yet.' };
  const got = await orgCase(id, s);
  if (got.error) return got;
  const can = await wpCanSave(auth, fetchFn, got.logos.length > 0);
  if (can.error) return can;
  const pg = await wpPage(got.page, auth, fetchFn);
  if (pg.error) return pg;
  const list = orgsList(pg.raw);
  if (list.error) return list;
  const logos = [];
  for (const u of got.logos) {
    const l = await orgLogo(u, fetchFn);
    logos.push(l.error ? { error: l.error } : { kind: l.kind, data: l.bytes.toString('base64') });
  }
  const host = hostOf(listingLink(link) || '');
  return { modified: pg.modified, after: list.after, ground: freshGround(got.grounds, list.grounds),
    there: !!flat(name) && list.names.some((x) => foldName(x) === foldName(name)), hostThere: !!host && list.hosts.includes(host), logos };
}
/* The one write: the logo into the media library, then the entry after the page's last organization, on a director's second press. */
export async function orgAdd(who, id, f, s = store(), now = Date.now(), fetchFn = fetch) {
  if (!officeAllow(who)) return { error: NO_OFFICE };
  const auth = wpAuth();
  if (!auth || !officeReady()) return { error: 'Adding to the Organizations page is not set up for the office yet.' };
  f = f && typeof f === 'object' ? f : {};
  const got = await orgCase(id, s);
  if (got.error) return got;
  const x = orgFields(f, got.grounds, got.logos.length);
  if (x.error) return x;
  if (typeof f.modified !== 'string' || !f.modified) return { error: 'Check the Organizations page first, so you can see where the entry goes.' };
  const can = await wpCanSave(auth, fetchFn, x.logo !== null);
  if (can.error) return can;
  const pg = await wpPage(got.page, auth, fetchFn);
  if (pg.error) return pg;
  const list = orgsList(pg.raw);
  if (list.error) return list;
  if (pg.modified !== f.modified) return { error: 'The Organizations page has changed since you checked it, so nothing was added. Look at where the entry goes now, then add it.',
    changed: { modified: pg.modified, after: list.after, ground: freshGround(got.grounds, list.grounds), there: list.names.some((n) => foldName(n) === foldName(x.name)) } };
  if (list.names.some((n) => foldName(n) === foldName(x.name))) return { error: `Something called ${x.name} is on the Organizations page already, so nothing was added. If it is another organization, give the entry a name that tells them apart.` };
  let media = null;
  if (x.logo !== null) {
    const logo = await orgLogo(got.logos[x.logo], fetchFn);
    if (logo.error) return { error: logo.error + ' Nothing was added. Choose no logo to add the entry without it.' };
    const slug = x.name.normalize('NFKD').replace(/[^\w\s-]/g, '').trim().toLowerCase().replace(/[\s_-]+/g, '-').slice(0, 60) || 'organization';
    const up = await wpAsk(`/wp-json/wp/v2/media?${new URLSearchParams({ title: x.name + ' logo', alt_text: x.alt })}`, auth, fetchFn, {
      method: 'POST', headers: { 'content-type': logo.kind, 'content-disposition': `attachment; filename="${slug}-logo.${ORG_EXT[logo.kind]}"` }, body: logo.bytes,
    });
    if (up.error) return { error: up.error.replace('Nothing was changed.', 'Their logo did not go into the media library, and nothing was added.') };
    if (!Number.isInteger(up.b.id) || up.b.id < 1 || typeof up.b.source_url !== 'string' || !up.b.source_url.startsWith(WP_SITE + '/wp-content/uploads/') || /["<>\s]/.test(up.b.source_url))
      return { error: 'stimpunks.org took their logo but did not say where it put it, so nothing was added to the page. Look in its media library.' };
    media = { id: up.b.id, src: up.b.source_url };
  }
  const next = pg.raw.slice(0, list.at) + '\n\n' + orgHtml(x, media) + pg.raw.slice(list.at);
  const put = await wpAsk(`/wp-json/wp/v2/pages/${got.page}?context=edit&_fields=content`, auth, fetchFn, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content: next }),
  });
  if (put.error) return { error: put.error.replace('Nothing was changed.', media ? `Their logo is in the media library (number ${media.id}), but nothing was added to the Organizations page.` : 'Nothing was added to the Organizations page.') };
  const kept = put.b.content && put.b.content.raw === next;
  let gone = false;
  await updateSealed(CASES, (was) => {
    const list2 = was && Array.isArray(was.cases) ? was.cases : [];
    const i = list2.findIndex((y) => y.id === got.kid);
    gone = i < 0;
    if (gone) return null;
    const copy = list2.slice();
    copy[i] = { ...list2[i], orgListed: { t: now }, edited: now, editedBy: who.handle };
    return { cases: copy, top: topOf(was) };
  }, s);
  return { added: { t: now }, address: got.address, kept, gone, logo: !!media };
}

/* ── Links and backlinks ───────────────────────────────────────────────────

   Ryan's ask, 2026-10-21, after Notion's links and backlinks: typing [[ in
   any box that takes words (a task, a comment, a forum post, a record in the
   office, a message on the CB) finds a task, a forum topic, a grant request,
   a case or a contact, and puts a link to it in the words; and every one of
   those says, under Linked from, where it is linked from.

   A LINK IS A TOKEN, [[task:<id>]], AND NEVER A NAME (Ryan's call, the same
   day). The name is filled in when the words are read, by the server, for
   the reader (nameRefs, resolveLinks), so a task linked from a public topic
   shows its name to the directors who can open it and "a task you can't open"
   to everybody else, and no copy, search or feed of the words carries it.
   A reader who could not open a kind is never told whether one exists.

   BACKLINKS COME FROM WHAT KEEPS, NEVER FROM CHATS (Ryan's call): a task, a
   task's comment, a forum post, a contact's notes, a grant request, a case
   and an office comment. A message on the channel or between two people can
   hold a link, and leaves no trace of it here, because the CB promises its
   words two weeks. The index is which source links to which, and when it last
   changed: `backlinks` for tasks, their comments and the forums, and
   `office-backlinks`, sealed like everything else in the office, for the
   office's records and comments. It is kept by the store writers themselves
   (linksAfter, called from updateList, updateDoc and updateSealed with what a
   source said before and after), so no write path can forget it, and a source
   deleted outside them is dropped by dropLinksFrom. What a reader is shown of
   it is only what they could open (backlinksTo). Nothing is counted. */
export const LINK_KINDS = {
  task: { ok: (v) => taskId(v), words: 'a task', href: (id) => `/tasks.html#/t/${id}` },
  topic: { ok: (v) => topicId(v), words: 'a forum topic', href: (id) => `/forum.html#/t/${id}` },
  grant: { ok: (v) => grantId(v), words: 'a grant request', href: (id) => `/office.html#/g/${id}` },
  case: { ok: (v) => caseId(v), words: 'a case', href: (id) => `/office.html#/k/${id}` },
  contact: { ok: (v) => contactId(v), words: 'a contact', href: (id) => `/office.html#/c/${id}` },
};
const LINK_AT = /^\[\[(task|topic|grant|case|contact):([A-Za-z0-9_-]{13})\]\]/;
const LINK_ALL = /\[\[(task|topic|grant|case|contact):([A-Za-z0-9_-]{13})\]\]/g;
export const LINKS_MAX = 50;        // the links one source keeps in the index, and names one answer fills
export const LINK_FIND_EACH = 6;    // results of each kind the [[ menu is offered
export const BACKLINKS_MAX = 40;    // sources shown under Linked from, the latest changed first
const BACKLINKS = 'backlinks';
const OFFICE_BACKLINKS = 'office-backlinks';

const linkKey = (kind, id) => `${kind}:${id}`;
function linkOk(key) {
  const m = /^(task|topic|grant|case|contact):([A-Za-z0-9_-]{13})$/.exec(String(key || ''));
  return !!m && !!LINK_KINDS[m[1]].ok(m[2]);
}

/* The links in some words, as kind:id, in the order they come, each once. A
   token inside code is code, as the reader draws it, so it links nowhere. */
export function linksIn(text) {
  const plain = String(text || '')
    .replace(/^ {0,3}(```|~~~)[^\n]*\n[\s\S]*?(?:\n {0,3}\1[^\n]*(?=\n|$)|$)/gm, ' ')
    .replace(/(`+)[^`][\s\S]*?\1/g, ' ');
  const out = [];
  for (const m of plain.matchAll(LINK_ALL)) {
    const k = linkKey(m[1], m[2]);
    if (LINK_KINDS[m[1]].ok(m[2]) && !out.includes(k)) out.push(k);
    if (out.length >= LINKS_MAX) break;
  }
  return out;
}

/* A link in words that go somewhere nobody's pass is asked, a notification's:
   what it is, never its name. */
export function linkWords(text) { return String(text || '').replace(LINK_ALL, (m, k) => LINK_KINDS[k].words); }

/* What each link is to this reader: { name, href } for one they can open,
   { gone } for one of a kind they can open that is not there any more, and
   { shut } for everything else, whether or not it exists. */
export async function resolveLinks(who, keys, s = store(), now = Date.now()) {
  const want = [...new Set(keys || [])].filter(linkOk).slice(0, LINKS_MAX);
  const out = {};
  const ids = (kind) => want.filter((k) => k.startsWith(kind + ':')).map((k) => k.slice(kind.length + 1));
  const shut = (kind) => ids(kind).forEach((id) => { out[linkKey(kind, id)] = { shut: true }; });
  const put = (kind, id, name) => { out[linkKey(kind, id)] = name ? { name, href: LINK_KINDS[kind].href(id) } : { gone: true }; };
  if (ids('task').length) {
    if (!tasksAllow(who)) shut('task');
    else { const m = new Map((await readTasks(s)).map((t) => [t.id, t])); ids('task').forEach((id) => put('task', id, m.get(id) && m.get(id).name)); }
  }
  if (ids('topic').length) {
    if (!forumReader(who)) shut('topic');
    else {
      const ts = await Promise.all(ids('topic').map((id) => readTopic(id, s)));
      ids('topic').forEach((id, i) => {
        const t = ts[i], cat = t && forumCat(t.cat, now);
        if (t && !forumAllows(who, cat)) out[linkKey('topic', id)] = { shut: true };
        else put('topic', id, t && topicLive(summaryOf(t), cat, now) ? t.title : null);
      });
    }
  }
  const office = ['grant', 'case', 'contact'].filter((k) => ids(k).length);
  if (office.length) {
    if (!officeAllow(who) || !officeReady()) office.forEach(shut);
    else {
      const [grants, cases, contacts] = await Promise.all([
        ids('grant').length ? readGrants(s) : [], ids('case').length ? readCases(s) : [], ids('contact').length ? readContacts(s) : []]);
      const find = (list, id) => list.find((x) => x.id === id);
      ids('grant').forEach((id) => { const g = find(grants, id); put('grant', id, g && g.name); });
      ids('case').forEach((id) => { const k = find(cases, id); put('case', id, k && `#${k.number} ${k.name}`); });
      ids('contact').forEach((id) => { const c = find(contacts, id); put('contact', id, c && contactName(c)); });
    }
  }
  return out;
}
const contactName = (c) => [c.first, c.last].filter(Boolean).join(' ') || c.email || 'A contact with no name';

/* Every link in an answer named for its reader, wherever in it the words are.
   Every function that answers with words from a source calls it last. */
export async function nameRefs(x, who, s = store(), now = Date.now()) {
  const nodes = [];
  (function walk(v, d) {
    if (!v || typeof v !== 'object' || d > 60) return;
    if (Array.isArray(v)) { for (const y of v) walk(y, d + 1); return; }
    if (v.t === 'ref' && typeof v.kind === 'string' && typeof v.id === 'string') { nodes.push(v); return; }
    for (const k of Object.keys(v)) walk(v[k], d + 1);
  })(x, 0);
  if (!nodes.length) return x;
  const names = await resolveLinks(who, nodes.map((n) => linkKey(n.kind, n.id)), s, now);
  for (const n of nodes) {
    delete n.name; delete n.href; delete n.gone; delete n.shut;
    Object.assign(n, names[linkKey(n.kind, n.id)] || { shut: true });
  }
  return x;
}

/* What the [[ menu offers for some words: the tasks, forum topics, grant
   requests, cases and contacts this reader can open whose names hold every
   word, the latest changed first, a few of each. With no words, the latest.
   Asked by POST, so what was typed is never in an address. */
export async function findLinks(who, q, s = store(), now = Date.now()) {
  if (!forumReader(who) || String(q || '').length > 120) return [];
  const words = foldHandle(q || '').split(' ').filter(Boolean).slice(0, 6);
  const hit = (name) => { const f = foldHandle(name || ''); return words.every((w) => f.includes(w)); };
  const latest = (a, b) => (b.edited || b.t || 0) - (a.edited || a.t || 0);
  const out = [];
  if (tasksAllow(who)) {
    (await readTasks(s)).filter((t) => hit(t.name)).sort(latest).slice(0, LINK_FIND_EACH)
      .forEach((t) => out.push({ kind: 'task', id: t.id, name: t.name, about: t.status + (t.who ? ', ' + t.who : '') }));
  }
  const cats = forumCatsFor(who, now);
  const lists = await Promise.all(cats.map((c) => readForumIndex(c.slug, s)));
  const tops = [];
  cats.forEach((c, i) => lists[i].forEach((x) => { if (topicLive(x, c, now) && hit(x.title)) tops.push({ x, c }); }));
  tops.sort((a, b) => b.x.last - a.x.last).slice(0, LINK_FIND_EACH)
    .forEach(({ x, c }) => out.push({ kind: 'topic', id: x.id, name: x.title, about: c.name }));
  if (officeAllow(who) && officeReady()) {
    const [grants, cases, contacts] = await Promise.all([readGrants(s), readCases(s), readContacts(s)]);
    grants.filter((g) => hit(g.name)).sort(latest).slice(0, LINK_FIND_EACH)
      .forEach((g) => out.push({ kind: 'grant', id: g.id, name: g.name, about: g.pipeline + ', ' + g.stage }));
    cases.filter((k) => hit(`#${k.number} ${k.name}`)).sort(latest).slice(0, LINK_FIND_EACH)
      .forEach((k) => out.push({ kind: 'case', id: k.id, name: `#${k.number} ${k.name}`, about: k.type + ', ' + k.status }));
    contacts.filter((c) => hit(contactName(c) + ' ' + (c.email || ''))).sort(latest).slice(0, LINK_FIND_EACH)
      .forEach((c) => out.push({ kind: 'contact', id: c.id, name: contactName(c), about: c.email || 'A contact' }));
  }
  return out;
}

/* THE INDEX. Each store that holds a source names its sources and their
   words; a source is kind:record, or kind:record/part for a comment or a post. */
const TASK_COMMENTS_AT = 'task-comments/';
const OFFICE_COMMENTS_AT = 'office-comments/';
function linkStore(key) {
  if (key === TASKS || key.startsWith(TASK_COMMENTS_AT) || key.startsWith(FORUM_TOPIC)) return 'plain';
  if (key === CONTACTS || key === GRANTS || key === CASES || key.startsWith(OFFICE_COMMENTS_AT)) return 'sealed';
  return null;
}
function sourcesOf(key, v) {
  const out = new Map();
  if (!v) return out;
  const each = (list, f) => { if (Array.isArray(list)) for (const x of list) if (x && x.id) f(x); };
  if (key === TASKS) each(v, (t) => out.set('task:' + t.id, t.body || ''));
  else if (key.startsWith(TASK_COMMENTS_AT)) { const tid = key.slice(TASK_COMMENTS_AT.length); each(v, (c) => out.set(`taskc:${tid}/${c.id}`, c.body || '')); }
  else if (key.startsWith(FORUM_TOPIC)) each(v.posts, (p) => out.set(`post:${v.id}/${p.id}`, p.body || ''));
  else if (key === CONTACTS) each(v.contacts, (c) => out.set('contact:' + c.id, c.notes || ''));
  else if (key === GRANTS) each(v.grants, (g) => out.set('grant:' + g.id, g.body || ''));
  else if (key === CASES) each(v.cases, (k) => out.set('case:' + k.id, k.body || ''));
  else if (key.startsWith(OFFICE_COMMENTS_AT)) { const rid = key.slice(OFFICE_COMMENTS_AT.length); each(v.comments, (c) => out.set(`officec:${rid}/${c.id}`, c.body || '')); }
  return out;
}
/* What a store's sources said before a write, taken before the write's own
   change can touch the objects, or null for a store that holds none. */
function linksBefore(key, v) { return linkStore(key) ? sourcesOf(key, v) : null; }
async function linksAfter(key, was, after, s) {
  if (!was) return;
  const now = sourcesOf(key, after), changes = new Map();
  for (const [src, text] of now) if (was.get(src) !== text) changes.set(src, linksIn(text));
  for (const src of was.keys()) if (!now.has(src)) changes.set(src, []);
  for (const [src, to] of changes) if (!to.length && !linksIn(was.get(src) || '').length) changes.delete(src);
  if (changes.size) await setLinksFrom(changes, linkStore(key) === 'sealed', s);
}
async function setLinksFrom(changes, sealed, s, when = Date.now()) {
  const change = (d) => {
    const from = { ...((d && d.from) || {}) };
    let moved = false;
    for (const [src, to] of changes) {
      const had = from[src];
      if (!to.length) { if (had) { delete from[src]; moved = true; } }
      else if (!had || had.to.join(' ') !== to.join(' ')) { from[src] = { to, t: when }; moved = true; }
    }
    return moved ? { from } : null;
  };
  // A backlink that could not be written catches up when its source is next written.
  try { if (sealed) { if (officeReady()) await updateSealed(OFFICE_BACKLINKS, change, s); } else await updateDoc(BACKLINKS, change, s); }
  catch (e) { /* busy */ }
}
/* Every source under a record or a topic, gone with it outside the store writers. */
export async function dropLinksFrom(prefix, sealed, s = store()) {
  const change = (d) => {
    const from = { ...((d && d.from) || {}) };
    const drop = Object.keys(from).filter((k) => k.startsWith(prefix));
    drop.forEach((k) => delete from[k]);
    return drop.length ? { from } : null;
  };
  try { if (sealed) { if (officeReady()) await updateSealed(OFFICE_BACKLINKS, change, s); } else await updateDoc(BACKLINKS, change, s); }
  catch (e) { /* busy */ }
}

/* LINKED FROM: every source that links to kind:id which this reader could
   open, the latest changed first, never the record itself or its own parts. */
export async function backlinksTo(who, kind, id, s = store(), now = Date.now()) {
  if (!LINK_KINDS[kind] || !LINK_KINDS[kind].ok(id)) return [];
  const key = linkKey(kind, id);
  const plain = await s.get(BACKLINKS, { type: 'json' });
  let from = Object.entries((plain && plain.from) || {});
  if (officeAllow(who) && officeReady()) { const d = await readSealed(OFFICE_BACKLINKS, s); from = from.concat(Object.entries((d && d.from) || {})); }
  const self = (src) => {
    const [k, rest] = [src.slice(0, src.indexOf(':')), src.slice(src.indexOf(':') + 1)];
    const rec = rest.split('/')[0];
    return rec === id && ((kind === 'task' && (k === 'task' || k === 'taskc')) || (kind === 'topic' && k === 'post')
      || (['grant', 'case', 'contact'].includes(kind) && (k === kind || k === 'officec')));
  };
  const hits = from.filter(([src, v]) => v && Array.isArray(v.to) && v.to.includes(key) && !self(src))
    .sort((a, b) => (b[1].t || 0) - (a[1].t || 0));
  if (!hits.length) return [];
  const need = (k) => hits.some(([src]) => src.startsWith(k + ':'));
  const tasks = tasksAllow(who) && (need('task') || need('taskc')) ? new Map((await readTasks(s)).map((t) => [t.id, t])) : null;
  const officeOn = officeAllow(who) && officeReady() && (need('grant') || need('case') || need('contact') || need('officec'));
  const [grants, cases, contacts] = officeOn ? await Promise.all([readGrants(s), readCases(s), readContacts(s)]) : [[], [], []];
  const topics = new Map();
  for (const [src] of hits) if (src.startsWith('post:')) topics.set(src.slice(5).split('/')[0], null);
  await Promise.all([...topics.keys()].map(async (tid) => { topics.set(tid, await readTopic(tid, s)); }));
  const recName = (rid) => {
    const g = grants.find((x) => x.id === rid); if (g) return { what: 'grant', name: g.name, at: 'g' };
    const k = cases.find((x) => x.id === rid); if (k) return { what: 'case', name: `#${k.number} ${k.name}`, at: 'k' };
    const c = contacts.find((x) => x.id === rid); if (c) return { what: 'contact', name: contactName(c), at: 'c' };
    return null;
  };
  const out = [];
  for (const [src, v] of hits) {
    if (out.length >= BACKLINKS_MAX) break;
    const k = src.slice(0, src.indexOf(':')), [rid, part] = src.slice(k.length + 1).split('/');
    if (k === 'task' || k === 'taskc') {
      const t = tasks && tasks.get(rid);
      if (t) out.push({ from: k === 'task' ? 'task' : 'comment', on: 'task', name: t.name, href: `/tasks.html#/t/${rid}` + (part ? `/c/${part}` : ''), t: v.t });
    } else if (k === 'post') {
      const t = topics.get(rid), cat = t && forumCat(t.cat, now);
      const p = t && t.posts.find((x) => x.id === part);
      if (p && forumAllows(who, cat) && topicLive(summaryOf(t), cat, now)) {
        out.push({ from: p === t.posts[0] ? 'topic' : 'post', on: 'topic', name: t.title, about: cat.name, href: `/forum.html#/t/${rid}/${part}`, t: v.t });
      }
    } else if (officeOn && (k === 'grant' || k === 'case' || k === 'contact')) {
      const r = recName(rid);
      if (r && r.what === k) out.push({ from: k, on: k, name: r.name, href: `/office.html#/${r.at}/${rid}`, t: v.t });
    } else if (officeOn && k === 'officec') {
      const r = recName(rid), c = !r && commentable(rid);
      if (r) out.push({ from: 'comment', on: r.what, name: r.name, href: `/office.html#/${r.at}/${rid}/c/${part}`, t: v.t });
      else if (c) {
        const at = { mailing: 'mailings/' + rid, template: 'templates/' + rid, email: 'm/' + c.mail }[c.what];
        if (at) out.push({ from: 'comment', on: c.what, name: null, href: `/office.html#/${at}/c/${part}`, t: v.t });
      }
    }
  }
  return out;
}
