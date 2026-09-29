/* The CB's one invariant under load: NO WRITE TOLD IT WORKED IS MISSING.

   Run it with:  node --test netlify/cb/lib.test.mjs

   CLAUDE.md has said since the chalkboard shipped that anybody touching
   versioned(), updateChannel or the boards' write must run "the fifteen-at-once
   test" again, and until 2026-09-26 that test lived in nobody's repository.
   Here it is, for the chalkboard and every pebble bowl, which share one write.

   NOT AGAINST NETLIFY'S LOCAL EMULATOR, ON PURPOSE. Its conditional write is
   not atomic, so a race test against it proves nothing either way. This store
   is: a check-and-write happens in one step, the way the real service's does.
   It is run twice, because the real code has two ways of reading a version:
   with an etag on the read (production), and without one (the emulator), where
   versioned() takes the etag off a listing on both sides of the read. With no
   etag on reads, some of the fifteen may be told "busy" -- that is allowed. A
   write that was told it worked and is not there is not. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { updateChalk, readChalk, updatePebbles, readPebbles, cleanLink, PEBBLE_ROOMS,
  updateChannel, readChannel, updateTalk, readTalk, beHere, leaveSlake, seenAt, sweepSlake,
  MUD_PLACES, MUD_FRESH, KEEP, today,
  hostBeacon, stopBeacon, readBeacons, sweepBeacons, beaconRoom, cleanAt, BEACON_FRESH,
  updateRoomTalk, readRoomTalk, readTuned, updateTuned, sweepRoomTalk, roomTag,
  callToken, callSrc, callsReady, tidyPem, JAAS_APP, CALL_HOURS,
  PUBLIC_CALLS, publicCall, callSettings, MOD_ROOMS, STRICT_ROOMS, roomAllows, shapeBeacons,
  ROLES, foldHandle, readMods, signOn, issuePass, readPass, rolesOf } from './lib.mjs';
import { generateKeyPairSync, createVerify } from 'node:crypto';

function memoryStore({ etagOnRead }) {
  const blobs = new Map();          // key -> { value, etag }
  let n = 0;
  const tick = () => new Promise((r) => setTimeout(r, Math.random() * 4));
  return {
    async getWithMetadata(key) {
      await tick();
      const b = blobs.get(key);
      if (!b) return null;
      return { data: structuredClone(b.value), etag: etagOnRead ? b.etag : undefined };
    },
    async get(key) {
      await tick();
      const b = blobs.get(key);
      return b ? structuredClone(b.value) : null;
    },
    async list({ prefix }) {
      await tick();
      return { blobs: [...blobs].filter(([k]) => k.startsWith(prefix)).map(([key, b]) => ({ key, etag: b.etag })) };
    },
    // THE ONE UNCONDITIONAL WRITE ALLOWED is a presence record on the Slake,
    // because each of those keys belongs to one visit and nobody else writes it.
    // Anything else written this way fails the test.
    async set(key, value) {
      await tick();
      if (!key.startsWith('mud-here/')) throw new Error('an unconditional write outside presence: ' + key);
      blobs.set(key, { value, etag: `e${++n}` });
      return { modified: true };
    },
    async delete(key) { await tick(); blobs.delete(key); },
    keys() { return [...blobs.keys()]; },
    async setJSON(key, value, opts = {}) {
      await tick();
      // Atomic from here: no await between the check and the write.
      const b = blobs.get(key);
      if (opts.onlyIfNew && b) return { modified: false };
      if (opts.onlyIfMatch !== undefined && (!b || b.etag !== opts.onlyIfMatch)) return { modified: false };
      if (!opts.onlyIfNew && opts.onlyIfMatch === undefined) {
        throw new Error('an unconditional write: the code must never do this');
      }
      blobs.set(key, { value: structuredClone(value), etag: `e${++n}` });
      return { modified: true };
    },
  };
}

async function fifteen(write, read, s, n = 15) {
  const told = await Promise.allSettled(
    Array.from({ length: n }, (_, i) => write((list) => { list.push({ id: `w${i}`, t: Date.now() }); return list; }, s)));
  const worked = told.map((r, i) => (r.status === 'fulfilled' ? `w${i}` : null)).filter(Boolean);
  const kept = new Set((await read(s)).map((n) => n.id));
  const missing = worked.filter((id) => !kept.has(id));
  return { worked, missing, failed: told.filter((r) => r.status === 'rejected') };
}

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';

  test(`the chalkboard, fifteen at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const { worked, missing, failed } = await fifteen(updateChalk, readChalk, s);
    assert.deepEqual(missing, [], 'a note that was told it went up is not on the board');
    for (const f of failed) assert.equal(f.reason.message, 'busy');
    if (etagOnRead) assert.equal(worked.length, 15);
  });

  test(`a pebble bowl, fifteen at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const room = PEBBLE_ROOMS[0];
    const { worked, missing, failed } = await fifteen(
      (change, st) => updatePebbles(room, change, st), (st) => readPebbles(room, st), s);
    assert.deepEqual(missing, [], 'a pebble that was told it was left is not in the bowl');
    for (const f of failed) assert.equal(f.reason.message, 'busy');
    if (etagOnRead) assert.equal(worked.length, 15);
  });
}

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  const log = (read) => async (st) => (await read(st)).messages;
  // TEN AT ONCE FOR A LOG, not fifteen: a channel keeps ten, so an eleventh
  // pushing the first off is the rule working, not a lost write. Its first run
  // raced fifteen and reported the five it had pushed off as missing.

  test(`the radio's channel, fifteen at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const { missing, failed } = await fifteen(updateChannel, log(readChannel), s, KEEP);
    assert.deepEqual(missing, [], 'a message that was told it went out is not on the channel');
    for (const f of failed) assert.equal(f.reason.message, 'busy');
  });

  test(`a place on the Slake, fifteen at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const place = MUD_PLACES[0];
    const { worked, missing, failed } = await fifteen(
      (change, st) => updateTalk(place, change, st), log((st) => readTalk(place, st)), s, KEEP);
    assert.deepEqual(missing, [], 'something that was told it was said is not in the place');
    for (const f of failed) assert.equal(f.reason.message, 'busy');
    if (etagOnRead) assert.equal(worked.length, KEEP);
  });
}

const ada = { role: 'mobile', handle: 'Ada' };
const bex = { role: 'mobile', handle: 'Bex' };
const V = (c) => c.repeat(24);

test('two people seen in one place see each other, and nobody else sees either', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  await beHere(ada, 'hide', V('a'), s, now);
  const seenByBex = await beHere(bex, 'hide', V('b'), s, now + 1);
  assert.deepEqual(seenByBex, [{ handle: 'Ada', base: false }]);
  assert.deepEqual(await beHere(ada, 'hide', V('a'), s, now + 2), [{ handle: 'Bex', base: false }]);
  assert.deepEqual(await beHere({ role: 'mobile', handle: 'Cy' }, 'creek', V('c'), s, now + 3), []);
});

test('moving leaves no trail: a visit has one record, wherever it is', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  for (const [i, place] of ['mud-room', 'sea-wall', 'hide', 'reedbed'].entries()) {
    await beHere(ada, place, V('a'), s, now + i);
  }
  const mine = s.keys().filter((k) => k.includes(V('a')));
  assert.equal(mine.length, 1);
  assert.ok(mine[0].startsWith('mud-here/reedbed/'));
});

test('a record past its thirty seconds is shown to nobody, and a stale one is deleted', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  await beHere(ada, 'hide', V('a'), s, now);
  assert.deepEqual(await beHere(bex, 'hide', V('b'), s, now + MUD_FRESH), []);
  await beHere(bex, 'hide', V('b'), s, now + 3 * 60 * 1000);
  assert.equal(s.keys().filter((k) => k.includes(V('a'))).length, 0, 'two minutes stale and still kept');
});

test('one handle in two tabs is one person, and nothing about them is counted', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  await beHere(ada, 'hide', V('a'), s, now);
  await beHere(ada, 'hide', V('d'), s, now);
  const got = await beHere(bex, 'hide', V('b'), s, now + 1);
  assert.deepEqual(got, [{ handle: 'Ada', base: false }]);
  assert.ok(Array.isArray(got), 'the answer is a list of handles and nothing else');
});

test('leaving is immediate, and only somebody seen in a place can speak there', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  await beHere(ada, 'hide', V('a'), s, now);
  assert.equal(await seenAt('hide', V('a'), s, now + 1), true);
  assert.equal(await seenAt('creek', V('a'), s, now + 1), false);
  await leaveSlake(V('a'), s);
  assert.equal(await seenAt('hide', V('a'), s, now + 1), false);
  assert.deepEqual(await beHere(bex, 'hide', V('b'), s, now + 2), []);
});

test('the sweep takes stale presence and yesterday\'s talk, and leaves today\'s', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  await beHere(ada, 'hide', V('a'), s, now - MUD_FRESH - 1);
  await updateTalk('hide', (l) => [...l, { id: 'today', t: now }], s);
  await s.setJSON('mud-talk-creek', { day: '2000-01-01', messages: [{ id: 'old' }] }, { onlyIfNew: true });
  await sweepSlake(s, now);
  assert.equal(s.keys().filter((k) => k.startsWith('mud-here/')).length, 0);
  assert.ok(!s.keys().includes('mud-talk-creek'));
  assert.deepEqual((await readTalk('hide', s)).messages.map((m) => m.id), ['today']);
  assert.equal((await readTalk('hide', s)).day, today());
});

test('the bowls are separate, and neither is the chalkboard', async () => {
  const s = memoryStore({ etagOnRead: true });
  const [a, b] = PEBBLE_ROOMS;
  await updatePebbles(a, (l) => [...l, { id: 'in-a', t: Date.now() }], s);
  await updateChalk((l) => [...l, { id: 'on-chalk', t: Date.now() }], s);
  assert.deepEqual((await readPebbles(a, s)).map((n) => n.id), ['in-a']);
  assert.deepEqual((await readPebbles(b, s)).map((n) => n.id), []);
  assert.deepEqual((await readChalk(s)).map((n) => n.id), ['on-chalk']);
});

test('a pebble older than a week is gone on the next read', async () => {
  const s = memoryStore({ etagOnRead: true });
  const room = PEBBLE_ROOMS[0];
  await updatePebbles(room, () => [{ id: 'old', t: Date.now() - 8 * 86400000 }, { id: 'new', t: Date.now() }], s);
  assert.deepEqual((await readPebbles(room, s)).map((n) => n.id), ['new']);
});

test('a link is an http or https address and nothing else', () => {
  assert.equal(cleanLink(''), '');
  assert.equal(cleanLink('https://stimpunks.world/the-den.html'), 'https://stimpunks.world/the-den.html');
  assert.equal(cleanLink('javascript:alert(1)'), null);
  assert.equal(cleanLink('data:text/html,hi'), null);
  assert.equal(cleanLink('https://user:pw@example.org/'), null);
  assert.equal(cleanLink('not a link'), null);
  assert.equal(cleanLink('https://example.org/' + 'x'.repeat(400)), null);
});

/* ── The beacons ── */

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';

  test(`fifteen hosts in fifteen rooms at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) =>
      hostBeacon({ role: 'mobile', handle: `h${i}` }, `room-${i}`, 'A film', i, true, s)));
    const worked = told.map((r, i) => (r.status === 'fulfilled' && r.value.beacons ? `room-${i}` : null)).filter(Boolean);
    const kept = new Set((await readBeacons(s)).map((b) => b.room));
    assert.deepEqual(worked.filter((r) => !kept.has(r)), [], 'a beacon that was told it went up is not there');
    for (const r of told) if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
    if (etagOnRead) assert.equal(worked.length, 15);
  });
}

test('one host per room: somebody else is refused, the same handle keeps it, the base takes over', async () => {
  const s = memoryStore({ etagOnRead: true });
  const base = { role: 'base', handle: 'Base' };
  assert.ok((await hostBeacon(ada, 'lightbulb-picture-house', 'Film A', 10, true, s)).beacons);
  assert.equal((await hostBeacon(bex, 'lightbulb-picture-house', 'Film B', 20, true, s)).held, 'Ada');
  const again = await hostBeacon(ada, 'lightbulb-picture-house', 'Film A', 30, false, s);
  assert.deepEqual(again.beacons.map((b) => [b.handle, b.at, b.playing]), [['Ada', 30, false]], 'an update replaces, it does not add');
  assert.ok((await hostBeacon(bex, 'the-den', 'Film C', 5, true, s)).beacons, 'another room is free');
  assert.ok((await hostBeacon(base, 'lightbulb-picture-house', 'Film D', 0, true, s)).beacons);
  const here = (await readBeacons(s)).filter((b) => b.room === 'lightbulb-picture-house');
  assert.deepEqual(here.map((b) => b.handle), ['Base']);
});

test('only the host or the base stops a beacon', async () => {
  const s = memoryStore({ etagOnRead: true });
  await hostBeacon(ada, 'the-den', 'Film', 1, true, s);
  await stopBeacon(bex, 'the-den', s);
  assert.equal((await readBeacons(s)).length, 1, 'somebody else cannot stop it');
  await stopBeacon(ada, 'the-den', s);
  assert.equal((await readBeacons(s)).length, 0);
  await hostBeacon(ada, 'the-den', 'Film', 1, true, s);
  await stopBeacon({ role: 'base', handle: 'Base' }, 'the-den', s);
  assert.equal((await readBeacons(s)).length, 0, 'the base can');
});

test('a beacon nobody has heard from is shown to nobody, frees its room, and is swept', async () => {
  const s = memoryStore({ etagOnRead: true });
  const then = Date.now() - BEACON_FRESH - 1;
  await hostBeacon(ada, 'the-den', 'Film', 1, true, s, then);
  assert.equal((await readBeacons(s)).length, 0);
  assert.ok((await hostBeacon(bex, 'lightbulb-picture-house', 'Film', 1, true, s, then)).beacons);
  assert.equal(await sweepBeacons(s), true);
  assert.deepEqual((await s.get('beacons')).beacons, []);
  assert.ok((await hostBeacon(bex, 'the-den', 'Film', 1, true, s)).beacons, 'a quiet host does not keep the room');
});

test('a beacon names a room by its tag and a place by seconds, and nothing else', () => {
  assert.equal(beaconRoom('the-den'), 'the-den');
  for (const bad of ['The-Den', '../x', 'a b', '', 'x'.repeat(81), 7]) assert.equal(beaconRoom(bad), null);
  assert.equal(cleanAt(12.34), 12.3);
  for (const bad of [-1, 86401, NaN, Infinity, '12']) assert.equal(cleanAt(bad), null);
});

/* ── Room channels ── */

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`a room's channel, ten at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const { missing, failed } = await fifteen(
      (change, st) => updateRoomTalk('the-den', change, st), async (st) => (await readRoomTalk('the-den', st)).messages, s, KEEP);
    assert.deepEqual(missing, [], 'a message that was told it went out is not on the room\'s channel');
    for (const f of failed) assert.equal(f.reason.message, 'busy');
  });
}

test('a room hears only its own channel, and World hears neither room', async () => {
  const s = memoryStore({ etagOnRead: true });
  const say = (id) => (list) => { list.push({ id, t: Date.now() }); return list; };
  await updateTuned(null, say('world'), s);
  await updateTuned('the-den', say('den'), s);
  await updateTuned('faery-yurt', say('yurt'), s);
  const ids = async (room) => (await readTuned(room, s)).messages.map((m) => m.id);
  assert.deepEqual(await ids(null), ['world']);
  assert.deepEqual(await ids('the-den'), ['den']);
  assert.deepEqual(await ids('faery-yurt'), ['yurt']);
});

test('a room channel from yesterday is not heard and is swept; today\'s stays', async () => {
  const s = memoryStore({ etagOnRead: true });
  await s.setJSON('room-talk-the-den', { day: '2000-01-01', messages: [{ id: 'old', t: 1 }] }, { onlyIfNew: true });
  await updateRoomTalk('faery-yurt', (list) => { list.push({ id: 'new', t: Date.now() }); return list; }, s);
  assert.deepEqual((await readRoomTalk('the-den', s)).messages, [], 'yesterday is not returned before the sweep');
  assert.equal(await sweepRoomTalk(s), true);
  assert.deepEqual(s.keys().filter((k) => k.startsWith('room-talk-')), ['room-talk-faery-yurt']);
  assert.equal(roomTag('../channel'), null);
});

/* ── Calls ── */

const pair = generateKeyPairSync('rsa', { modulusLength: 2048 });
const key = { kid: `${JAAS_APP}/test`, pem: pair.privateKey.export({ type: 'pkcs8', format: 'pem' }) };
const open = (tok) => {
  const [h, p, sig] = tok.split('.');
  const ok = createVerify('RSA-SHA256').update(`${h}.${p}`).verify(pair.publicKey, Buffer.from(sig, 'base64url'));
  return { ok, header: JSON.parse(Buffer.from(h, 'base64url')), body: JSON.parse(Buffer.from(p, 'base64url')) };
};

test('a call token is signed, names one room, and lasts its hours', () => {
  const now = Date.UTC(2026, 8, 28, 20, 0, 0);
  const t = open(callToken(ada, 'the-den', now, key));
  assert.equal(t.ok, true, 'the signature verifies with the public half');
  assert.deepEqual(t.header, { alg: 'RS256', typ: 'JWT', kid: key.kid });
  assert.equal(t.body.aud, 'jitsi'); assert.equal(t.body.iss, 'chat'); assert.equal(t.body.sub, JAAS_APP);
  assert.equal(t.body.room, 'stimpunks-the-den', 'one room, never *');
  assert.equal(t.body.exp - t.body.iat, CALL_HOURS * 3600);
  assert.equal(t.body.context.user.name, 'Ada');
});

test('only the base moderates, records or transcribes; nobody streams or dials out', () => {
  const who = (role) => open(callToken({ role, handle: 'Same' }, 'the-den', Date.now(), key)).body.context;
  const mobile = who('mobile'), base = who('base');
  assert.equal(mobile.user.moderator, 'false'); assert.equal(base.user.moderator, 'true');
  assert.equal(mobile.features.recording, false); assert.equal(base.features.recording, true);
  assert.equal(mobile.features.transcription, false); assert.equal(base.features.transcription, true);
  for (const f of ['livestreaming', 'outbound-call', 'inbound-call', 'sip-outbound-call', 'sip-inbound-call']) {
    assert.equal(mobile.features[f], false); assert.equal(base.features[f], false);
  }
  assert.notEqual(mobile.user.id, base.user.id, 'the same handle as base is a different person to 8x8');
  assert.equal(who('mobile').user.id, mobile.user.id, 'the same person is one id every time');
});

test('no key, no calls; and the address arrives muted on the pre-join screen', () => {
  const was = [process.env.CB_JAAS_KID, process.env.CB_JAAS_KEY];
  delete process.env.CB_JAAS_KID; delete process.env.CB_JAAS_KEY;
  assert.equal(callsReady(), false);
  assert.equal(callToken(ada, 'the-den'), null);
  process.env.CB_JAAS_KID = 'somebody-elses/1'; process.env.CB_JAAS_KEY = key.pem;
  assert.equal(callsReady(), false, 'a key for another App ID is refused');
  for (const [k, v] of [['CB_JAAS_KID', was[0]], ['CB_JAAS_KEY', was[1]]]) {
    if (v === undefined) delete process.env[k]; else process.env[k] = v;
  }
  const src = callSrc('the-den', 'TOKEN');
  assert.ok(src.startsWith(`https://8x8.vc/${JAAS_APP}/stimpunks-the-den?jwt=TOKEN#`));
  for (const c of ['startWithAudioMuted=true', 'startWithVideoMuted=true', 'prejoinConfig.enabled=true', 'disableInviteFunctions=true',
    'analytics.disabled=true', 'gravatar.disabled=true', 'giphy.enabled=false'])
    assert.ok(src.includes('config.' + c), c);
  // Jitsi's shared video is !disableThirdPartyRequests and nothing else.
  assert.ok(!src.includes('disableThirdPartyRequests'), 'shared video needs this off');
});

test('a key pasted with its line breaks turned to spaces, or to \\n, still signs', () => {
  const flat = key.pem.trim().split('\n').join(' ');           // what Netlify's box made of the real one
  const escaped = key.pem.trim().split('\n').join('\\n');
  for (const raw of [flat, escaped, key.pem]) {
    const t = open(callToken(ada, 'the-den', Date.now(), { kid: key.kid, pem: tidyPem(raw) }));
    assert.equal(t.ok, true);
  }
  const was = [process.env.CB_JAAS_KID, process.env.CB_JAAS_KEY];
  process.env.CB_JAAS_KID = key.kid; process.env.CB_JAAS_KEY = flat;
  assert.equal(callsReady(), true, 'the flattened key is read');
  process.env.CB_JAAS_KEY = '-----BEGIN PRIVATE KEY----- not a key -----END PRIVATE KEY-----';
  assert.equal(callsReady(), false, 'a key that cannot be read switches calls off');
  for (const [k, v] of [['CB_JAAS_KID', was[0]], ['CB_JAAS_KEY', was[1]]]) {
    if (v === undefined) delete process.env[k]; else process.env[k] = v;
  }
});

test('a guest gets a token for a public call only, and never as a moderator', () => {
  const guest = { role: 'guest', handle: 'Visitor' };
  for (const room of PUBLIC_CALLS) {
    const t = open(callToken(guest, room, Date.now(), key));
    assert.equal(t.ok, true);
    assert.equal(t.body.room, 'stimpunks-' + room);
    assert.equal(t.body.context.user.moderator, 'false');
    assert.equal(t.body.context.features.recording, false);
    assert.equal(t.body.context.features.transcription, false);
  }
  assert.equal(callToken(guest, 'the-den', Date.now(), key), null, 'not a room of the CB\'s');
  assert.equal(publicCall('the-den'), null);
  const base = open(callToken({ role: 'base', handle: 'Mod' }, PUBLIC_CALLS[0], Date.now(), key)).body.context.user;
  assert.equal(base.moderator, 'true', 'the base moderates the public calls too');
});

test('the settings webhook puts a lobby on the public calls and only them', () => {
  for (const room of PUBLIC_CALLS)
    assert.deepEqual(callSettings(`${JAAS_APP}/stimpunks-${room}`), { lobbyEnabled: true, lobbyType: 'WAIT_FOR_APPROVAL' });
  assert.deepEqual(callSettings(`${JAAS_APP}/stimpunks-the-den`), { lobbyEnabled: false });
  assert.deepEqual(callSettings(`somebody-else/stimpunks-${PUBLIC_CALLS[0]}`), { lobbyEnabled: false }, 'another App ID');
  for (const bad of [undefined, '', 'nonsense', `${JAAS_APP}/${PUBLIC_CALLS[0]}`]) assert.deepEqual(callSettings(bad), { lobbyEnabled: false });
});

/* ── The Town Hall's private rooms, and the mods' list ── */

const admin = { role: 'base', handle: 'Ryan', roles: new Set(['moderator', 'administrator', 'board', 'director']) };
const director = { role: 'base', handle: 'Chelsea', roles: new Set(['moderator', 'director']) };
const boardie = { role: 'base', handle: 'Becky', roles: new Set(['moderator', 'board']) };
const plainMod = { role: 'base', handle: 'Sam', roles: new Set(['moderator']) };
const rooms = Object.keys(MOD_ROOMS);

test('each private room takes its own role, an administrator takes them all, and nobody else takes any', async () => {
  assert.ok(rooms.length > 0);
  const want = { 'town-hall-directors': ['Ryan', 'Chelsea'], 'town-hall-board': ['Ryan', 'Chelsea', 'Becky'],
    'town-hall-moderators': ['Ryan', 'Chelsea', 'Becky', 'Sam'], 'town-hall-executive-session': ['Ryan', 'Becky'] };
  for (const room of rooms) {
    const who = [admin, director, boardie, plainMod].filter((w) => roomAllows(w, room)).map((w) => w.handle);
    assert.deepEqual(who, want[room], room);
    assert.equal(roomAllows(ada, room), false, 'a community pass is not enough');
    assert.equal(roomAllows({ role: 'base', handle: 'Old' }, room), false, 'a base pass with no roles read is not enough');
    assert.equal(roomAllows(null, room), false);
    assert.equal(publicCall(room), null, 'no private room is a public call');
    assert.equal(callToken(ada, room, Date.now(), key), null);
  }
  assert.equal(open(callToken(director, 'town-hall-board', Date.now(), key)).body.room, 'stimpunks-town-hall-board', 'directors join board meetings');
  assert.equal(callToken(boardie, 'town-hall-directors', Date.now(), key), null, 'a board member has no directors\' call');
  assert.equal(callToken(plainMod, 'town-hall-board', Date.now(), key), null, 'nor does a moderator with neither role');
  assert.equal(open(callToken(boardie, 'town-hall-board', Date.now(), key)).body.room, 'stimpunks-town-hall-board');
  assert.equal(roomAllows(ada, null), true, 'World is everybody\'s');
  assert.equal(roomAllows(ada, 'the-den'), true);
});

test('a private room\'s hosting and beacons follow the same roles', async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.equal((await hostBeacon(boardie, 'town-hall-directors', 'Minutes', 1, true, s)).closed, true);
  await hostBeacon(director, 'town-hall-directors', 'Minutes', 1, true, s);
  await hostBeacon(ada, 'the-den', 'Film', 1, true, s);
  const all = await readBeacons(s);
  assert.deepEqual(shapeBeacons(all, ada).map((b) => b.room), ['the-den'], 'the street does not hear the directors are hosting');
  assert.deepEqual(shapeBeacons(all, boardie).map((b) => b.room), ['the-den'], 'nor does a board member who is not a director');
  assert.deepEqual(shapeBeacons(all, admin).map((b) => b.room).sort(), ['the-den', 'town-hall-directors']);
});

test('the mods\' list: moderator implied, handles folded, and anything odd means no list at all', () => {
  const m = readMods('{"Ryan":["administrator","board","director"],"Helen":["administrator","director"],"Sam":[]}');
  assert.deepEqual([...m.get('ryan').roles].sort(), ['administrator', 'board', 'director', 'moderator']);
  assert.deepEqual([...m.get('sam').roles], ['moderator']);
  assert.equal(m.get(foldHandle('  RYAN ')).handle, 'Ryan');
  assert.equal(foldHandle('Ｒｙａｎ'), 'ryan', 'full-width letters fold too');
  for (const bad of [undefined, '', 'not json', '[]', '{}', '{"Ryan":"director"}', '{"Ryan":["direktor"]}',
    '{"Ryan":["director"],"ryan":["board"]}', '{"":["board"]}', '{"' + 'x'.repeat(30) + '":[]}']) {
    assert.equal(readMods(bad), null, String(bad));
  }
  assert.deepEqual(ROLES.slice().sort(), ['administrator', 'board', 'director', 'moderator']);
});

test('sign-on: the MOD password only for a listed handle, the community one never for a listed handle', () => {
  const was = [process.env.CB_PASSWORD, process.env.CB_MOD_PASSWORD];
  process.env.CB_PASSWORD = 'community-pw'; process.env.CB_MOD_PASSWORD = 'moderators-pw';
  try {
    const mods = readMods('{"Ryan":["administrator"],"Helen":["director"]}');
    const r = signOn('ryan', 'moderators-pw', mods);
    assert.equal(r.role, 'base'); assert.equal(r.handle, 'Ryan', 'the list\'s spelling of the handle');
    assert.ok(r.roles.has('administrator') && r.roles.has('moderator'));
    assert.ok(signOn('Somebody', 'moderators-pw', mods).error, 'not on the list');
    assert.ok(signOn('Ryan ', 'community-pw', mods).error, 'a moderator\'s handle is reserved');
    assert.ok(signOn('HELEN', 'community-pw', mods).error);
    assert.equal(signOn('Ada', 'community-pw', mods).role, 'mobile');
    assert.ok(signOn('Ryan', 'moderators-pw', null).error, 'no readable list, no MOD sign-on');
    assert.equal(signOn('Ada', 'community-pw', null).role, 'mobile', 'the community CB goes on');
    assert.ok(signOn('Ada', 'wrong', mods).error);
    assert.deepEqual(rolesOf(r), ['administrator', 'moderator']);
  } finally {
    for (const [k, v] of [['CB_PASSWORD', was[0]], ['CB_MOD_PASSWORD', was[1]]]) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
  }
});

test('a pass is read against the list every time: roles follow it, and a removal or a reservation takes effect at once', () => {
  const was = [process.env.CB_PASSWORD, process.env.CB_MOD_PASSWORD];
  process.env.CB_PASSWORD = 'community-pw'; process.env.CB_MOD_PASSWORD = 'moderators-pw';
  const req = (pass) => ({ headers: { get: (k) => (k === 'authorization' ? 'Bearer ' + pass : null) } });
  try {
    const basePass = issuePass('base', 'Helen'), comPass = issuePass('mobile', 'Ada');
    const before = readMods('{"Helen":["director"]}'), after = readMods('{"Helen":["director","board"]}');
    assert.deepEqual(rolesOf(readPass(req(basePass), before)), ['director', 'moderator']);
    assert.deepEqual(rolesOf(readPass(req(basePass), after)), ['board', 'director', 'moderator'], 'a new role, no new pass');
    assert.equal(readPass(req(basePass), readMods('{"Ryan":["administrator"]}')), null, 'taken off the list');
    assert.equal(readPass(req(basePass), null), null, 'no readable list, no base pass');
    assert.equal(readPass(req(comPass), before).role, 'mobile');
    assert.equal(readPass(req(comPass), readMods('{"Ada":[]}')), null, 'a community pass for a handle now reserved');
    assert.equal(readPass(req(comPass), null).role, 'mobile');
  } finally {
    for (const [k, v] of [['CB_PASSWORD', was[0]], ['CB_MOD_PASSWORD', was[1]]]) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
  }
});

test('executive session is the board role and nothing else: the administrator key does not open it', () => {
  const adminOnly = { role: 'base', handle: 'Helen', roles: new Set(['moderator', 'administrator', 'director']) };
  const boardAdmin = { role: 'base', handle: 'Ryan', roles: new Set(['moderator', 'administrator', 'board']) };
  assert.deepEqual(STRICT_ROOMS, ['town-hall-executive-session']);
  for (const room of STRICT_ROOMS) {
    assert.equal(roomAllows(adminOnly, room), false, 'an administrator not on the board');
    assert.equal(roomAllows(director, room), false, 'directors do not join executive session');
    assert.equal(roomAllows(boardAdmin, room), true, 'the board role, whatever else');
    assert.equal(roomAllows(boardie, room), true);
    assert.equal(callToken(adminOnly, room, Date.now(), key), null);
  }
  assert.equal(roomAllows(adminOnly, 'town-hall-board'), true, 'everywhere else, the administrator key still works');
});
