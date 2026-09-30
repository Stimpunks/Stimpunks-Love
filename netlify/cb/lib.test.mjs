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
import { rescueCat, readCats, catAt, catGap, cleanCatName, CAT_COATS, CAT_MARKS, CAT_PLACES, CAT_MOODS,
  rescueAnimal, readShelter, animalAt, adoptAnimal, finishAdoptions, readPets, forgetPets, readAdopted, adoptedMonths,
  petKey, unnameAnimal, SHELTER_KEEP, KINDS, DOG_COATS, DOG_MARKS,
  climb, readStair, cleanStep, putWord, readFridge, fileFridge, readDrawer, drawers, fridgeMark, strikeSentence, cleanWord, monthOf, FRIDGE_DOOR, FRIDGE_WORDS,
  updateChalk, readChalk, updateFence, readFence, waterTree, readTree, PANDO_SOAK, updatePebbles, readPebbles, cleanLink, PEBBLE_ROOMS,
  updateChannel, readChannel, updateTalk, readTalk, beHere, leaveSlake, seenAt, sweepSlake,
  MUD_PLACES, MUD_FRESH, KEEP, today,
  hostBeacon, stopBeacon, readBeacons, sweepBeacons, beaconRoom, cleanAt, BEACON_FRESH,
  updateRoomTalk, readRoomTalk, readTuned, updateTuned, sweepRoomTalk, roomTag,
  callToken, callSrc, callsReady, tidyPem, JAAS_APP, CALL_HOURS,
  PUBLIC_CALLS, publicCall, callSettings, MOD_ROOMS, STRICT_ROOMS, roomAllows, shapeBeacons,
  ROLES, foldHandle, readMods, signOn, issuePass, readPass, rolesOf,
  renamePet, shapeAnimal, SMALL_SPECIES, SMALL_COATS, SMALL_MARKS, animalNoun, ANIMAL_ID, setShown, isShown, shownPets, stickerOf, shapeSticker, issueAccountPass, accountAnswer, isMod, claimAccount, checkPassword, changePassword, recoverAccount, resetAccount, deleteAccount,
  readAccount, acctKey, cleanCode, ACCT_TRIES, ACCT_LOCK, ACCT_RESET_FOR,
  imageKind, carriesMetadata, putImage, getImage, droppedImages, sweepImages, shape, IMG_MAX,
  cleanMessage, MESSAGE_MAX, cleanText,
  cleanVideo, beSeen, unseen, sweepSeen, ROOM_FRESH, jaasSigned, callEventRoom, callEvent, inCall, sweepCalls } from './lib.mjs';
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
      return { data: structuredClone(b.value), etag: etagOnRead ? b.etag : undefined, metadata: b.metadata };
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
    // THE ONLY UNCONDITIONAL WRITES ALLOWED are a presence record (on the
    // Slake, in a room, or in a call) and a picture on the channel, because each
    // of those keys belongs to one visit, one person in a call or one upload and
    // nobody else writes it. Anything else fails.
    async set(key, value, opts = {}) {
      await tick();
      if (!/^(mud-here|room-here|call-in|call-left|img)\//.test(key)) throw new Error('an unconditional write outside presence: ' + key);
      blobs.set(key, { value, etag: `e${++n}`, metadata: opts.metadata });
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

  test(`Pando Calrissian's fence, fifteen at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const { worked, missing, failed } = await fifteen(updateFence, readFence, s);
    assert.deepEqual(missing, [], 'a note that was told it went up is not on the fence');
    for (const f of failed) assert.equal(f.reason.message, 'busy');
    if (etagOnRead) assert.equal(worked.length, 15);
  });

  // THE TREE'S INVARIANT IS A NUMBER: every watering told it poured is in the
  // count, and nothing else is. Raced with the soak switched off, because with
  // the real soak fourteen of fifteen are told the ground is wet, which is the
  // rule working and would hide a lost write. OFF, NOT ZERO: its first run used
  // zero, and a waterer whose clock was read a moment before somebody else's
  // write saw the ground wet by a millisecond and was rightly told to wait.
  test(`Pando Calrissian's tree, fifteen waterings at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const told = await Promise.allSettled(Array.from({ length: 15 }, () => waterTree(s, Date.now(), -Infinity)));
    const poured = told.filter((r) => r.status === 'fulfilled' && r.value.poured).length;
    for (const f of told.filter((r) => r.status === 'rejected')) assert.equal(f.reason.message, 'busy');
    assert.equal((await readTree(s)).water, poured, 'a watering told it poured is not in the count, or one nobody was told about is');
    if (etagOnRead) assert.equal(poured, 15);
  });
}

// THE FRIDGE'S INVARIANT: every word told it went up is on the line or in the
// sentence it finished, and every finished sentence is on the door or in a
// drawer, exactly once.
for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`the Fridge of Sighs, fifteen words at once from fifteen people, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => putWord(`w${i}`, `m${i}`, s)));
    const put = told.map((r, i) => (r.status === 'fulfilled' && r.value.put ? `w${i}` : null)).filter(Boolean);
    for (const f of told.filter((r) => r.status === 'rejected')) assert.equal(f.reason.message, 'busy');
    const { words } = await readFridge(s);
    const missing = put.filter((w) => !words.includes(w));
    assert.deepEqual(missing, [], 'a word that was told it went up is not on the line');
    assert.equal(words.length, put.length, 'a word nobody was told about is on the line');
  });
}

test('nobody puts up two words in a row, and anybody else can', async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.equal((await putWord('The', 'ada', s)).put, true);
  const again = await putWord('fridge', 'ada', s);
  assert.equal(again.put, false);
  assert.equal(again.why, 'yours');
  assert.equal((await putWord('hums.', 'bex', s)).put, true);
  assert.equal((await putWord('Again', 'ada', s)).put, true);
});

test('a word ending in a stop finishes the sentence, and so does the longest line', async () => {
  const s = memoryStore({ etagOnRead: true });
  await putWord('Sighs', 'a', s);
  const r = await putWord('everywhere!', 'b', s);
  assert.equal(r.finished.text, 'Sighs everywhere!');
  assert.deepEqual((await readFridge(s)).words, []);
  for (let i = 0; i < FRIDGE_WORDS; i++) await putWord('and', `p${i % 2}`, s);
  const { words, door } = await readFridge(s);
  assert.deepEqual(words, []);
  assert.equal(door.at(-1).text.split(' ').length, FRIDGE_WORDS);
});

test('the fridge keeps words and sentences and one mark, and never a handle', async () => {
  const s = memoryStore({ etagOnRead: true });
  await putWord('hello.', fridgeMark('Ada', 'k'), s);
  const kept = await s.get('fridge');
  assert.deepEqual(Object.keys(kept).sort(), ['door', 'last', 'words']);
  assert.ok(!JSON.stringify(kept).toLowerCase().includes('ada'));
  assert.deepEqual(Object.keys(kept.door[0]).sort(), ['id', 't', 'text']);
  assert.equal(fridgeMark(' ADA ', 'k'), fridgeMark('ada', 'k'), 'one person is one mark however they type their handle');
  assert.notEqual(fridgeMark('Ada', 'k'), fridgeMark('Ada', 'another password'));
});

test('filing moves the oldest into their month\'s drawer, once, and loses nothing', async () => {
  const s = memoryStore({ etagOnRead: true });
  const t0 = Date.UTC(2026, 8, 15, 18);
  for (let i = 0; i < FRIDGE_DOOR + 5; i++) await putWord(`s${i}.`, `m${i}`, s, t0 + i * 1000);
  await fileFridge(s);
  // Half a filing: the copy is in the drawer and the door was never cleared.
  // Put the filed ones back on the door, as a filing stopped after its first
  // step would leave them, and file again.
  const filed = await readDrawer(monthOf(t0), s);
  const cur = await s.getWithMetadata('fridge');
  await s.setJSON('fridge', { ...cur.data, door: [...filed, ...cur.data.door] }, { onlyIfMatch: cur.etag });
  await fileFridge(s);
  const { door } = await readFridge(s);
  assert.equal(door.length, FRIDGE_DOOR);
  const month = monthOf(t0);
  assert.deepEqual(await drawers(s), [month]);
  const drawn = await readDrawer(month, s);
  assert.equal(drawn.length, 5, 'a sentence was filed twice, or not at all');
  const all = new Set([...drawn, ...door].map((n) => n.text));
  assert.equal(all.size, FRIDGE_DOOR + 5);
  assert.equal(await strikeSentence(drawn[0].id, s), true);
  assert.equal((await readDrawer(month, s)).length, 4);
});

test('a word is one word', () => {
  for (const ok of ['hello', "don't", 'well-known', 'sighs.', '\u201cWhy', 'caf\u00e9', 'ok?!']) assert.ok(cleanWord(ok), ok);
  for (const no of ['two words', '<b>', '!!!', '', 'x'.repeat(25), 'a<script>']) assert.equal(cleanWord(no), null, no);
});

// THE STAIR'S INVARIANT: fifteen people who all see the same step and all put
// the next number are all right, so exactly one takes it and nobody sends the
// stair back to one; and fifteen riding the lift at once all get up, one step
// each, in some order.
for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`Count Me In, fifteen people putting the same next number, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => climb(1, `m${i}`, s)));
    for (const f of told.filter((r) => r.status === 'rejected')) assert.equal(f.reason.message, 'busy');
    const got = told.filter((r) => r.status === 'fulfilled').map((r) => r.value);
    assert.equal(got.filter((r) => r.took).length, 1, 'more or fewer than one took step one');
    assert.equal(got.filter((r) => r.why === 'wrong').length, 0, 'a number somebody beat you to sent the stair back');
    assert.equal((await readStair(s)).step, 1);
  });
  test(`Count Me In, fifteen people riding the lift at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => climb('lift', `m${i}`, s)));
    for (const f of told.filter((r) => r.status === 'rejected')) assert.equal(f.reason.message, 'busy');
    const up = told.filter((r) => r.status === 'fulfilled' && r.value.took).length;
    assert.equal((await readStair(s)).step, up, 'a ride told it went up is not on the stair, or one nobody was told about is');
    if (etagOnRead) assert.equal(up, 15);
  });
}

test('a wrong number sends the stair back to one, keeps the highest step, and names nobody', async () => {
  const s = memoryStore({ etagOnRead: true });
  for (let i = 1; i <= 5; i++) assert.equal((await climb(i, `p${i % 2}`, s)).took, true);
  const r = await climb(9, 'p0', s, 777);
  assert.equal(r.why, 'wrong');
  assert.equal(r.wanted, 6);
  const st = await readStair(s);
  assert.deepEqual(st, { step: 0, best: 5, fell: { at: 5, t: 777 } });
  assert.deepEqual(Object.keys(await s.get('stair')).sort(), ['best', 'fell', 'last', 'step']);
  assert.equal((await climb('lift', 'p1', s)).step, 1);
  assert.equal((await readStair(s)).best, 5, 'the highest step went down');
});

test('a number behind the stair is somebody behind, not somebody wrong', async () => {
  const s = memoryStore({ etagOnRead: true });
  for (let i = 1; i <= 4; i++) await climb(i, `p${i % 2}`, s);
  assert.equal((await climb(2, 'late', s)).why, 'beaten');
  assert.equal((await readStair(s)).step, 4, 'a page that was behind sent the stair back');
  assert.equal((await climb(6, 'late', s)).why, 'wrong', 'skipping ahead is still a wrong number');
});

test('nobody takes two steps in a row, by number or by lift', async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.equal((await climb('lift', 'ada', s)).took, true);
  assert.equal((await climb(2, 'ada', s)).why, 'yours');
  assert.equal((await climb('lift', 'ada', s)).why, 'yours');
  assert.equal((await readStair(s)).step, 1);
  assert.equal((await climb(2, 'bex', s)).took, true);
});

test('a step is a whole number in figures', () => {
  for (const ok of ['1', '12', ' 7 ', '9999999']) assert.ok(cleanStep(ok), ok);
  for (const no of ['0', '-1', '1.5', 'twelve', '10000000', '', '1e3', '12a']) assert.equal(cleanStep(no), null, no);
});

// THE SHELTER'S INVARIANT: however many press at once, one cat is rescued
// once, into the shelter, and everybody else is told it is already safe.
for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`Rescue A Cat, fifteen people pressing for one cat, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const { waiting } = await readCats(s, 1000);
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => rescueCat(waiting.id, `Name${i}`, s, 1000)));
    for (const f of told.filter((r) => r.status === 'rejected')) assert.equal(f.reason.message, 'busy');
    const got = told.filter((r) => r.status === 'fulfilled').map((r) => r.value);
    assert.equal(got.filter((r) => r.rescued).length, 1, 'more or fewer than one person rescued the cat');
    const { shelter } = await readCats(s, 1000);
    assert.equal(shelter.length, 1, 'the cat is in the shelter twice, or not at all');
  });
}

test('a cat is the same cat on every page, and the next one is not out yet', async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.deepEqual(catAt(12345), catAt(12345));
  const first = (await readCats(s, 50)).waiting;
  assert.ok(first, 'there is no cat waiting when the shelter opens');
  const r = await rescueCat(first.id, 'Mo', s, 100, () => 60000);
  assert.equal(r.rescued, true);
  assert.equal((await readCats(s, 100 + 59999)).waiting, null);
  const next = (await readCats(s, 100 + 60000)).waiting;
  assert.ok(next);
  assert.equal((await rescueCat(first.id, '', s, 100 + 60000)).rescued, false, 'an old cat was rescued twice');
});

test('the shelter keeps looks, a name and a time, never a rescuer, and holds animals until adopted', async () => {
  const s = memoryStore({ etagOnRead: true });
  const c = (await readCats(s, 10)).waiting;
  await rescueCat(c.id, 'Biscuit', s, 10, () => 1);
  const kept = await s.get('cats');
  assert.deepEqual(Object.keys(kept).sort(), ['due', 'leaving', 'shelter']);
  assert.deepEqual(Object.keys(kept.shelter[0]).sort(), ['coat', 'id', 'kind', 'mark', 'mood', 'name', 'place', 't']);
  assert.equal((await readCats(s, 10 + 365 * 86400e3)).shelter.length, 1, 'an animal left the shelter without being adopted');
  let t = 20;
  while ((await readShelter('cat', s, t)).shelter.length < SHELTER_KEEP) {
    const w = (await readShelter('cat', s, t)).waiting;
    await rescueAnimal('cat', w.id, '', s, t, () => 1); t += 2;
  }
  const w = (await readShelter('cat', s, t)).waiting;
  assert.equal((await rescueAnimal('cat', w.id, '', s, t, () => 1)).why, 'full', 'a full shelter took another');
});

// ADOPTION'S INVARIANT: fifteen people pressing Adopt on one animal at once
// give it to exactly one, who has it once, and it is on the forever list once.
for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`adoption, fifteen people for one animal, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const w = (await readShelter('dog', s, 5)).waiting;
    await rescueAnimal('dog', w.id, 'Pip', s, 5, () => 1);
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => adoptAnimal('dog', w.id, `pk${i}`, s, 9)));
    for (const f of told.filter((r) => r.status === 'rejected')) assert.equal(f.reason.message, 'busy');
    const won = told.map((r, i) => (r.status === 'fulfilled' && r.value.adopted ? i : null)).filter((i) => i !== null);
    assert.equal(won.length, 1, 'more or fewer than one person adopted the dog');
    for (let i = 0; i < 15; i++) assert.equal((await readPets(`pk${i}`, s)).length, i === won[0] ? 1 : 0);
    const months = await adoptedMonths('dog', s);
    assert.equal(months.length, 1);
    assert.equal((await readAdopted('dog', months[0], s)).length, 1, 'the dog is on the forever list twice, or not at all');
    assert.equal((await readShelter('dog', s, 9)).shelter.length, 0);
  });
}

test('an adoption stopped halfway is finished once, and Forget Me leaves the animal adopted', async () => {
  const s = memoryStore({ etagOnRead: true });
  const w = (await readShelter('cat', s, 5)).waiting;
  await rescueAnimal('cat', w.id, 'Mo', s, 5, () => 1);
  // Half an adoption: the shelter has moved it to leaving, and nothing else happened.
  const cur = await s.getWithMetadata('cats');
  const going = { ...cur.data.shelter[0], at: 9 };
  await s.setJSON('cats', { due: cur.data.due, shelter: [], leaving: [{ animal: going, to: 'pkA' }] }, { onlyIfMatch: cur.etag });
  await finishAdoptions('cat', s);
  // And stopped again later: copied into the pets and the forever list, and
  // never cleared from leaving. Finishing again must not copy it twice.
  const again = await s.getWithMetadata('cats');
  await s.setJSON('cats', { ...again.data, leaving: [{ animal: going, to: 'pkA' }] }, { onlyIfMatch: again.etag });
  await finishAdoptions('cat', s);
  assert.equal((await readPets('pkA', s)).length, 1, 'a pet was copied twice');
  const m = (await adoptedMonths('cat', s))[0];
  assert.equal((await readAdopted('cat', m, s)).length, 1);
  assert.deepEqual((await s.get('cats')).leaving, []);
  await forgetPets('pkA', s);
  assert.equal((await readPets('pkA', s)).length, 0, 'Forget Me left the pets');
  assert.equal((await readAdopted('cat', m, s)).length, 1, 'Forget Me took the animal off the forever list');
  assert.ok(!JSON.stringify(await readAdopted('cat', m, s)).includes('pkA'), 'the forever list knows who adopted');
});

test('pets are filed under a scrambled handle, the same however it is typed, and not the handle', () => {
  assert.equal(petKey(' ADA '), petKey('ada'));
  assert.notEqual(petKey('Ada'), petKey('Bex'));
  assert.ok(!petKey('Ada').toLowerCase().includes('ada'));
});

test('the base station takes a name off everywhere it is', async () => {
  const s = memoryStore({ etagOnRead: true });
  const w = (await readShelter('cat', s, 5)).waiting;
  await rescueAnimal('cat', w.id, 'Rude', s, 5, () => 1);
  await adoptAnimal('cat', w.id, 'pkZ', s, 7);
  await unnameAnimal('cat', w.id, s);
  assert.equal((await readPets('pkZ', s))[0].name, '');
  const m = (await adoptedMonths('cat', s))[0];
  assert.equal((await readAdopted('cat', m, s))[0].name, '');
});

test('a pet is renamed in its person\'s pets and on the forever list, keeping the name it came in under', async () => {
  const s = memoryStore({ etagOnRead: true });
  const w = (await readShelter('dog', s, 5)).waiting;
  await rescueAnimal('dog', w.id, 'Sprackles', s, 5, () => 1);
  assert.ok((await renamePet('pkY', w.id, 'Mo', s)).error, 'a dog still in the shelter was renamed');
  await adoptAnimal('dog', w.id, 'pkY', s, 7);
  assert.ok((await renamePet('pkX', w.id, 'Mo', s)).error, 'somebody else renamed my dog');
  const r = await renamePet('pkY', w.id, 'Mo', s);
  assert.equal(r.pet.name, 'Mo'); assert.equal(r.pet.first, 'Sprackles');
  await renamePet('pkY', w.id, 'Mo Mo', s);
  const pet = (await readPets('pkY', s))[0];
  assert.equal(pet.name, 'Mo Mo'); assert.equal(pet.first, 'Sprackles', 'a second rename wrote over the name it came in under');
  const m = (await adoptedMonths('dog', s))[0];
  const listed = (await readAdopted('dog', m, s))[0];
  assert.equal(listed.name, 'Mo Mo'); assert.equal(listed.first, 'Sprackles');
  assert.equal(shapeAnimal(listed).first, 'Sprackles');
  assert.ok(!JSON.stringify(await readAdopted('dog', m, s)).includes('pkY'), 'the forever list knows who renamed');
  // Stopped between the two writes: the list is behind, and pressing it again finishes it.
  const cur = await s.getWithMetadata(`adopted-dog-${m}`);
  await s.setJSON(`adopted-dog-${m}`, { animals: [{ ...listed, name: 'Mo' }] }, { onlyIfMatch: cur.etag });
  await renamePet('pkY', w.id, 'Mo Mo', s);
  assert.equal((await readAdopted('dog', m, s))[0].name, 'Mo Mo', 'pressing the same rename again did not finish it');
  // The base taking the name off takes every name off, the first one too.
  await unnameAnimal('dog', w.id, s);
  assert.equal((await readPets('pkY', s))[0].name, '');
  assert.equal(shapeAnimal((await readAdopted('dog', m, s))[0]).first, undefined, 'the name it came in under outlived taking the names off');
});

test('your pets are shown only when a claimed username says so, and a sticker is only ever your own pet', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const w = (await readShelter('cat', s, 5)).waiting;
  await rescueAnimal('cat', w.id, 'Mo', s, 5, () => 1);
  await adoptAnimal('cat', w.id, petKey('Ada'), s, 7);
  // Unclaimed: nothing is shown, even with the switch somehow on.
  await setShown('Ada', true, s, 8);
  assert.equal(await shownPets('Ada', s), null, 'an unclaimed handle showed its pets');
  await claimAccount('Ada', 'a long enough phrase', s, 9, null);
  const shown = await shownPets('ada', s);
  assert.equal(shown.handle, 'Ada'); assert.equal(shown.pets[0].name, 'Mo');
  assert.equal(shown.pets[0].at, undefined, 'the public view says when they were adopted');
  assert.equal(shown.pets[0].t, undefined);
  await setShown('Ada', true, s, 10);
  assert.equal(await isShown('Ada', s), true, 'a second switch-on switched it off');
  await setShown('Ada', false, s);
  assert.equal(await shownPets('Ada', s), null, 'switched off and still shown');
  assert.equal(await shownPets('Nobody', s), null);
  // Stickers: your own pet, by the server's lookup, with nothing pointing back.
  assert.equal(await stickerOf('Bex', w.id, s), null, 'a sticker of somebody else\'s pet');
  const w2 = (await readShelter('cat', s, 20)).waiting;
  await rescueAnimal('cat', w2.id, 'Pip', s, 20, () => 1);
  await adoptAnimal('cat', w2.id, petKey('Bex'), s, 21);
  assert.equal(await stickerOf('Ada', w2.id, s), null, 'Ada sent a sticker of Bex\'s cat');
  assert.equal((await stickerOf('Bex', w2.id, s)).name, 'Pip');
  assert.equal(await stickerOf('Ada', 'not-an-id', s), null);
  const st = await stickerOf('Ada', w.id, s);
  assert.deepEqual(Object.keys(st).sort(), ['coat', 'kind', 'mark', 'name']);
  const drawn = shape([{ id: 'm', handle: 'Ada', text: '', t: 1, sticker: st }])[0].sticker;
  assert.equal(drawn.name, 'Mo'); assert.ok(drawn.words.coat);
  assert.equal(shapeSticker({ kind: 'cat', coat: 'plaid', mark: 'socks', name: 'x' }), null, 'a coat nobody can draw');
  // Deleting the account takes the switch with it, so a reclaimed name is not shown.
  await setShown('Ada', true, s, 11);
  await deleteAccount('Ada', s);
  await claimAccount('Ada', 'somebody else here', s, 12, null);
  assert.equal(await shownPets('Ada', s), null, 'the switch outlived the account it belonged to');
}));

test('small animals: every species as likely as any other, only in coats it comes in, and a word for each', async () => {
  const species = new Map(), coats = new Map();
  for (let i = 0; i < 9000; i++) {
    const a = animalAt('small', i * 7919);
    assert.ok(ANIMAL_ID.test(a.id) && a.id.startsWith('s'));
    coats.set(a.coat, (coats.get(a.coat) || 0) + 1);
    const sp = a.coat.split('-')[0];
    species.set(sp, (species.get(sp) || 0) + 1);
  }
  assert.equal(coats.size, SMALL_COATS.length);
  assert.equal(species.size, SMALL_SPECIES.length);
  for (const [k, n] of species) assert.ok(n > 9000 / SMALL_SPECIES.length * 0.8, `${k} is rarer than the others`);
  // Three coats a species, so the species are level.
  for (const [sp] of SMALL_SPECIES) assert.equal(SMALL_COATS.filter((c) => c[0].startsWith(sp + '-')).length, 3, sp);
  // "a" goes in front of every coat word.
  for (const [, w] of SMALL_COATS) assert.ok(!/^[aeiou]/i.test(w), `"a ${w}"`);
  assert.equal(animalNoun('small', 'guineapig-black'), 'guinea pig');
  assert.equal(animalNoun('dog', 'golden'), 'dog');
  // Rescue, adopt and a sticker all take one.
  const s = memoryStore({ etagOnRead: true });
  const w = (await readShelter('small', s, 5)).waiting;
  await rescueAnimal('small', w.id, 'Pip', s, 5, () => 1);
  await adoptAnimal('small', w.id, petKey('Ada'), s, 7);
  const pet = (await readPets(petKey('Ada'), s))[0];
  assert.equal(shapeAnimal(pet).words.noun, SMALL_SPECIES.find((x) => x[0] === pet.coat.split('-')[0])[1]);
  const st = shape([{ id: 'm', handle: 'Ada', text: '', t: 1, sticker: await stickerOf('Ada', w.id, s) }])[0].sticker;
  assert.equal(st.name, 'Pip'); assert.ok(st.words.noun);
  assert.equal((await readAdopted('small', (await adoptedMonths('small', s))[0], s)).length, 1);
});

test('dogs are not cats', () => {
  assert.notEqual(animalAt('dog', 1).id, animalAt('cat', 1).id);
  assert.ok(DOG_COATS.length && DOG_MARKS.length && KINDS.dog.looks.length === 4);
});

test('every look is as likely as any other, and the gap is random within its bounds', () => {
  const seen = { coat: new Map(), mark: new Map() };
  for (let i = 0; i < 6000; i++) {
    const c = catAt(i * 7919);
    seen.coat.set(c.coat, (seen.coat.get(c.coat) || 0) + 1);
    seen.mark.set(c.mark, (seen.mark.get(c.mark) || 0) + 1);
  }
  assert.equal(seen.coat.size, CAT_COATS.length);
  assert.equal(seen.mark.size, CAT_MARKS.length);
  for (const [k, n] of seen.coat) assert.ok(n > 6000 / CAT_COATS.length * 0.7, `${k} is rarer than the others`);
  for (const u of [0, 0.5, 0.999999]) { const g = catGap(u); assert.ok(g >= 4 * 60000 && g <= 3 * 3600000); }
  assert.ok(CAT_PLACES.length && CAT_MOODS.length);
  assert.equal(cleanCatName('  Sir Pounce  '), 'Sir Pounce');
  assert.equal(cleanCatName('x'.repeat(25)), null);
  assert.equal(cleanCatName(''), '');
});

test('the ground soaks for a minute for everybody, and the count only goes up', async () => {
  const s = memoryStore({ etagOnRead: true });
  const t = 1_000_000;
  assert.equal((await readTree(s)).water, 0);
  assert.equal((await waterTree(s, t)).poured, true);
  const wet = await waterTree(s, t + 1000);
  assert.equal(wet.poured, false);
  assert.equal(wet.soaks, PANDO_SOAK - 1000);
  assert.equal((await readTree(s)).water, 1);
  assert.equal((await waterTree(s, t + PANDO_SOAK)).poured, true);
  assert.equal((await readTree(s)).water, 2);
});

test('the tree keeps a number and a time, and nothing about who watered it', async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.equal((await waterTree(s, 1_000_000)).poured, true);
  const kept = await s.get('pando');
  assert.deepEqual(Object.keys(kept).sort(), ['water', 'wet']);
});

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
  const guest = open(callToken({ role: 'guest', handle: 'Visitor' }, PUBLIC_CALLS[0], Date.now(), key)).body.context;
  for (const who of [mobile, base, guest]) assert.equal(who.features['file-upload'], true, 'everybody in a call can share a file');
  assert.equal(guest.features.recording, false, 'sharing a file is not recording');
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

test('sign-on: the MOD password only for a listed handle, the community one never for a listed handle', async () => {
  const S = memoryStore({ etagOnRead: true });
  const was = [process.env.CB_PASSWORD, process.env.CB_MOD_PASSWORD];
  process.env.CB_PASSWORD = 'community-pw'; process.env.CB_MOD_PASSWORD = 'moderators-pw';
  try {
    const mods = readMods('{"Ryan":["administrator"],"Helen":["director"]}');
    const r = (await signOn('ryan', 'moderators-pw', mods, S));
    assert.equal(r.role, 'base'); assert.equal(r.handle, 'Ryan', 'the list\'s spelling of the handle');
    assert.ok(r.roles.has('administrator') && r.roles.has('moderator'));
    assert.ok((await signOn('Somebody', 'moderators-pw', mods, S)).error, 'not on the list');
    assert.ok((await signOn('Ryan ', 'community-pw', mods, S)).error, 'a moderator\'s handle is reserved');
    assert.ok((await signOn('HELEN', 'community-pw', mods, S)).error);
    assert.equal((await signOn('Ada', 'community-pw', mods, S)).role, 'mobile');
    assert.ok((await signOn('Ryan', 'moderators-pw', null, S)).error, 'no readable list, no MOD sign-on');
    assert.equal((await signOn('Ada', 'community-pw', null, S)).role, 'mobile', 'the community CB goes on');
    assert.ok((await signOn('Ada', 'wrong', mods, S)).error);
    assert.deepEqual(rolesOf(r), ['administrator', 'moderator']);
  } finally {
    for (const [k, v] of [['CB_PASSWORD', was[0]], ['CB_MOD_PASSWORD', was[1]]]) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
  }
});

test('a pass is read against the list every time: roles follow it, and a removal or a reservation takes effect at once', async () => {
  const S = memoryStore({ etagOnRead: true });
  const was = [process.env.CB_PASSWORD, process.env.CB_MOD_PASSWORD];
  process.env.CB_PASSWORD = 'community-pw'; process.env.CB_MOD_PASSWORD = 'moderators-pw';
  const req = (pass) => ({ headers: { get: (k) => (k === 'authorization' ? 'Bearer ' + pass : null) } });
  try {
    const basePass = issuePass('base', 'Helen'), comPass = issuePass('mobile', 'Ada');
    const before = readMods('{"Helen":["director"]}'), after = readMods('{"Helen":["director","board"]}');
    assert.deepEqual(rolesOf((await readPass(req(basePass), before, S))), ['director', 'moderator']);
    assert.deepEqual(rolesOf((await readPass(req(basePass), after, S))), ['board', 'director', 'moderator'], 'a new role, no new pass');
    assert.equal((await readPass(req(basePass), readMods('{"Ryan":["administrator"]}'), S)), null, 'taken off the list');
    assert.equal((await readPass(req(basePass), null, S)), null, 'no readable list, no base pass');
    assert.equal((await readPass(req(comPass), before, S)).role, 'mobile');
    assert.equal((await readPass(req(comPass), readMods('{"Ada":[]}'), S)), null, 'a community pass for a handle now reserved');
    assert.equal((await readPass(req(comPass), null, S)).role, 'mobile');
  } finally {
    for (const [k, v] of [['CB_PASSWORD', was[0]], ['CB_MOD_PASSWORD', was[1]]]) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
  }
});

// ACCOUNTS. A claimed username signs on with its own password and nothing
// else, a change or a reset signs every device off, and deleting it deletes
// its pets.
async function withPasswords(fn) {
  const was = [process.env.CB_PASSWORD, process.env.CB_MOD_PASSWORD];
  process.env.CB_PASSWORD = 'community-pw'; process.env.CB_MOD_PASSWORD = 'moderators-pw';
  try { await fn(); } finally {
    for (const [k, v] of [['CB_PASSWORD', was[0]], ['CB_MOD_PASSWORD', was[1]]]) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
  }
}
const reqWith = (pass) => ({ headers: { get: (k) => (k === 'authorization' ? 'Bearer ' + pass : null) } });

test('a claimed username signs on with its own password, and the community password stops working for it', () => withPasswords(async () => {
  const S = memoryStore({ etagOnRead: true });
  const oldPass = issuePass('mobile', 'Ada');
  assert.equal((await readPass(reqWith(oldPass), null, S)).role, 'mobile');
  const c = await claimAccount('Ada', 'a long enough phrase', S, 1000, null);
  assert.equal(c.v, 1); assert.match(c.recovery, /^[A-Z2-9]{4}(-[A-Z2-9]{4}){3}$/);
  assert.equal(await readPass(reqWith(oldPass), null, S), null, 'a community pass for a claimed username still works');
  assert.ok((await signOn('ada', 'community-pw', null, S)).error, 'the community password signed on as a claimed username');
  const r = await signOn('ADA', 'a long enough phrase', null, S);
  assert.equal(r.handle, 'Ada'); assert.equal(r.account, 1);
  const who = await readPass(reqWith(issueAccountPass('Ada', 1)), null, S);
  assert.equal(who.handle, 'Ada'); assert.equal(who.role, 'mobile'); assert.equal(who.account, true);
  assert.ok((await claimAccount('ada', 'another phrase here', S, 1000, null)).error, 'claimed twice');
}));

test('fifteen people claiming one username at once: one does', async () => {
  const S = memoryStore({ etagOnRead: true });
  const got = await Promise.all(Array.from({ length: 15 }, (_, i) => claimAccount('Bex', `password number ${i}`, S, 5, null)));
  assert.equal(got.filter((r) => !r.error).length, 1);
});

test('five wrong passwords lock it for a while, and the right one does not get in until then', () => withPasswords(async () => {
  const S = memoryStore({ etagOnRead: true });
  await claimAccount('Cal', 'correct horse battery', S, 0, null);
  for (let i = 0; i < ACCT_TRIES; i++) assert.ok((await checkPassword('Cal', 'wrong guess', S, 100 + i)).error);
  const locked = await checkPassword('Cal', 'correct horse battery', S, 200);
  assert.ok(locked.locked, 'the right password got in while locked');
  assert.equal((await checkPassword('Cal', 'correct horse battery', S, 200 + ACCT_LOCK)).v, 1);
}));

test('changing the password, recovering or a moderator\'s reset signs every device off', () => withPasswords(async () => {
  const S = memoryStore({ etagOnRead: true });
  const c = await claimAccount('Dee', 'first password here', S, 0, null);
  const p1 = issueAccountPass('Dee', 1);
  const ch = await changePassword('Dee', 'first password here', 'second password here', S, 10);
  assert.equal(ch.v, 2);
  assert.equal(await readPass(reqWith(p1), null, S), null, 'an old device stayed signed on after a change');
  assert.ok((await changePassword('Dee', 'first password here', 'x'.repeat(9), S, 20)).error, 'the old password still works');
  const rec = await recoverAccount('Dee', c.recovery.toLowerCase(), 'third password here', S, 30);
  assert.equal(rec.v, 3); assert.notEqual(rec.recovery, c.recovery);
  assert.ok((await recoverAccount('Dee', c.recovery, 'fourth password', S, 40)).error, 'a recovery code worked twice');
  const reset = await resetAccount('Dee', S, 50);
  assert.equal(await readPass(reqWith(issueAccountPass('Dee', 3)), null, S), null, 'a reset left somebody signed on');
  assert.ok((await recoverAccount('Dee', reset.code, 'after the reset', S, 50 + ACCT_RESET_FOR)).error, 'a reset code worked after its day');
  const reset2 = await resetAccount('Dee', S, 60);
  const back = await recoverAccount('Dee', reset2.code, 'after the reset', S, 70);
  assert.ok(back.v > 4);
  assert.equal((await signOn('Dee', 'after the reset', null, S)).account, back.v);
}));

test('deleting an account deletes its pets and frees the username; the store never holds a password or a handle as its key', () => withPasswords(async () => {
  const S = memoryStore({ etagOnRead: true });
  await claimAccount('Eve', 'eve has a phrase', S, 0, null);
  const w = (await readShelter('cat', S, 5)).waiting;
  await rescueAnimal('cat', w.id, 'Tig', S, 5, () => 1);
  await adoptAnimal('cat', w.id, petKey('Eve'), S, 6);
  assert.equal((await readPets(petKey('Eve'), S)).length, 1);
  const raw = JSON.stringify(await S.get(`acct/${acctKey('Eve')}`));
  assert.ok(!raw.includes('eve has a phrase'), 'a password in the store');
  assert.ok(!acctKey('Eve').toLowerCase().includes('eve'));
  assert.deepEqual(Object.keys(JSON.parse(raw)).sort(), ['fails', 'handle', 'hash', 'lockUntil', 'rhash', 'rsalt', 'salt', 'since', 'v']);
  assert.equal((await deleteAccount('Eve', S)).deleted, true);
  assert.equal(await readAccount('Eve', S), null);
  assert.equal((await readPets(petKey('Eve'), S)).length, 0, 'the pets outlived the account');
  assert.equal(await readPass(reqWith(issueAccountPass('Eve', 1)), null, S), null);
  assert.equal((await signOn('Eve', 'community-pw', null, S)).role, 'mobile', 'the username is not free again');
  const m = (await adoptedMonths('cat', S))[0];
  assert.equal((await readAdopted('cat', m, S)).length, 1, 'deleting an account took an animal off the forever list');
}));

test('a moderator\'s handle is claimed only by the moderator, from a base pass', async () => {
  const S = memoryStore({ etagOnRead: true });
  assert.ok((await claimAccount('Juniper', 'juniper has a phrase', S, 0, readMods('{"Juniper":["director"]}'))).error,
    'somebody on the community password claimed a moderator\'s handle');
  assert.equal(cleanCode(' abcd-efgh '), 'ABCDEFGH');
});

// MODERATORS ON THEIR OWN PASSWORDS. The names and roles here are made up:
// who holds which role is not ours to publish, in a test or anywhere.
test('a moderator moves onto their own password: it gives the base with the list\'s roles, and the shared one stops', () => withPasswords(async () => {
  const S = memoryStore({ etagOnRead: true });
  const mods = readMods('{"Juniper":["board"],"Quill":[]}');
  const shared = await signOn('juniper', 'moderators-pw', mods, S);
  assert.equal(shared.role, 'base');
  const oldBase = issuePass('base', shared.handle);
  assert.equal((await readPass(reqWith(oldBase), mods, S)).role, 'base');
  assert.ok((await claimAccount('Juniper', 'moderators-pw', S, 0, mods, true)).error, 'the shared password taken as a personal one');
  assert.ok((await claimAccount('Juniper', 'community-pw', S, 0, mods, true)).error, 'the community password taken as a personal one');
  const c = await claimAccount('Juniper', 'juniper has a phrase', S, 0, mods, true);
  assert.equal(c.v, 1);
  assert.equal(await readPass(reqWith(oldBase), mods, S), null, 'the shared password\'s pass outlived the move');
  assert.ok((await signOn('Juniper', 'moderators-pw', mods, S)).error, 'the shared password still signs on as a moderator who moved');
  assert.ok((await signOn('Juniper', 'community-pw', mods, S)).error);
  const own = await signOn('JUNIPER', 'juniper has a phrase', mods, S);
  assert.equal(own.role, 'base'); assert.equal(own.handle, 'Juniper'); assert.equal(own.account, 1);
  assert.deepEqual(rolesOf(own), ['board', 'moderator']);
  const mine = issueAccountPass('Juniper', 1, 'base');
  assert.match(mine, /^cb2\.base\./);
  const who = await readPass(reqWith(mine), mods, S);
  assert.equal(who.role, 'base'); assert.equal(who.account, true); assert.deepEqual(rolesOf(who), ['board', 'moderator']);
  assert.equal(await readPass(reqWith(issueAccountPass('Juniper', 1)), mods, S), null, 'an ordinary pass for a moderator\'s username');
  // A base pass is signed with the moderators' password: a community-signed
  // forgery with the base label is refused.
  const forged = mine.replace(/\.[A-Za-z0-9_-]+$/, '.' + issueAccountPass('Juniper', 1).split('.').pop());
  assert.equal(await readPass(reqWith(forged), mods, S), null, 'a cb2.base pass signed with the community password');
  // Quill is still on the shared password, and nothing about Juniper moved them.
  assert.equal((await signOn('Quill', 'moderators-pw', mods, S)).role, 'base');
  // A change of password signs the moderator off everywhere, as anybody's does.
  const ch = await changePassword('Juniper', 'juniper has a phrase', 'a newer phrase too', S, 0);
  assert.equal(ch.v, 2);
  assert.equal(await readPass(reqWith(mine), mods, S), null);
  assert.equal((await readPass(reqWith(issueAccountPass('Juniper', 2, 'base')), mods, S)).role, 'base');
  // Off the list, the same account is an ordinary claimed username with the same
  // password, and the base pass is refused.
  const off = readMods('{"Quill":[]}');
  assert.equal(await readPass(reqWith(issueAccountPass('Juniper', 2, 'base')), off, S), null, 'a base pass outlived being taken off the list');
  const plain = await signOn('Juniper', 'a newer phrase too', off, S);
  assert.equal(plain.role, 'mobile'); assert.equal(plain.account, 2);
  // An unreadable list gives nobody the base, a moderator on their own password included.
  assert.equal(await readPass(reqWith(issueAccountPass('Juniper', 2, 'base')), null, S), null);
  // Deleting it puts the handle back on the shared password.
  await deleteAccount('Juniper', S);
  assert.equal((await signOn('Juniper', 'moderators-pw', mods, S)).role, 'base');
}));

test('the desk leaves a moderator\'s username alone, and the answer after a claim says base', () => withPasswords(async () => {
  const mods = readMods('{"Juniper":["board"]}');
  assert.equal(isMod('JUNIPER ', mods), true); assert.equal(isMod('Ada', mods), false); assert.equal(isMod('Juniper', null), false);
  const a = accountAnswer('juniper', 3, mods);
  assert.equal(a.base, true); assert.equal(a.handle, 'Juniper'); assert.deepEqual(a.roles, ['board', 'moderator']); assert.match(a.pass, /^cb2\.base\./);
  const b = accountAnswer('Ada', 3, mods);
  assert.equal(b.base, false); assert.match(b.pass, /^cb2\.acct\./);
}));

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

/* ── Pictures on the channel ── */

const jpeg = (...rest) => new Uint8Array([0xff, 0xd8, 0xff, 0xdb, 0, 0, 0, 0, 0, 0, 0, 0, ...rest]);
const exifJpeg = () => new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0x12, 0x34, ...Buffer.from('Exif\0\0'), 0, 0, 0, 0]);

test('a picture is a real image with nothing from the camera left in it', async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.equal(imageKind(jpeg()), 'image/jpeg');
  assert.equal(imageKind(new Uint8Array(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'))), null, 'an SVG can carry script');
  assert.equal(carriesMetadata(jpeg(), 'image/jpeg'), false);
  assert.equal(carriesMetadata(exifJpeg(), 'image/jpeg'), true, 'Exif is where the GPS lives');
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...Buffer.from('....tEXtComment'), 0]);
  assert.equal(carriesMetadata(png, 'image/png'), true);
  assert.ok((await putImage(ada, null, exifJpeg(), s)).error);
  assert.ok((await putImage(ada, null, new Uint8Array(IMG_MAX + 1).fill(0xff), s)).error, 'too big');
  const ok = await putImage(ada, 'town-hall-board', jpeg(), s);
  assert.ok(ok.id);
  const got = await getImage(ok.id, s);
  assert.equal(got.meta.handle, 'Ada'); assert.equal(got.meta.room, 'town-hall-board', 'bound to its room');
  assert.equal(await getImage('../channel', s), null);
});

test('a picture goes when its message goes, and an unsent one within the hour', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  const held = (await putImage(ada, null, jpeg(), s, now)).id;
  const pushed = (await putImage(ada, null, jpeg(), s, now)).id;
  const unsentNew = (await putImage(ada, null, jpeg(), s, now)).id;
  const unsentOld = (await putImage(ada, null, jpeg(), s, now - 2 * 60 * 60 * 1000)).id;
  const before = [{ id: 'a', img: pushed }, { id: 'b', img: held }, { id: 'c' }];
  assert.deepEqual(droppedImages(before, before.slice(1)), [pushed], 'the eleventh pushes the oldest off, picture and all');
  await updateTuned(null, (list) => { list.push({ id: 'b', handle: 'Ada', text: '', t: now, img: held }); return list; }, s);
  await sweepImages(s, now);
  const left = s.keys().filter((k) => k.startsWith('img/')).map((k) => k.slice(4)).sort();
  assert.deepEqual(left, [held, pushed, unsentNew].sort(), 'held stays, a fresh upload waits, an old unsent one goes');
  assert.deepEqual(shape([{ id: 'b', handle: 'Ada', t: now, img: held, alt: 'A cat' }])[0], { id: 'b', handle: 'Ada', text: '', t: now, base: false, claimed: false, img: held, alt: 'A cat' });
});

test('a claimed username is marked on the channel, and only by the server', () => {
  const [plain, claimed, base, both] = shape([
    { id: 'a', handle: 'Ada', text: 'hi', t: 1 },
    { id: 'b', handle: 'Bo', text: 'hi', t: 2, claimed: true },
    { id: 'c', handle: 'Cy', text: 'hi', t: 3, base: true },
    { id: 'd', handle: 'Di', text: 'hi', t: 4, base: true, claimed: true },
  ]);
  assert.equal(plain.claimed, false, 'an unclaimed handle carries no mark');
  assert.equal(claimed.claimed, true, 'a claimed one carries CLAIMED');
  assert.equal(base.claimed, false);
  assert.equal(both.claimed, false, 'BASE is the only mark a moderator wears');
});

test('a CB message keeps its lines and is refused past its length', () => {
  assert.equal(cleanMessage('- one\r\n- two\n\n\n\nthree  '), '- one\n- two\n\nthree', 'lines kept, at most one blank line, no trailing spaces');
  assert.equal(cleanMessage('```\n\tcode\n```'), '```\n    code\n```', 'a tab becomes spaces');
  assert.equal(cleanMessage('a\u0007b\u202ec'), 'a b c', 'control and direction characters go');
  assert.equal(cleanMessage('\n\n  \n'), null, 'nothing but space is nothing');
  assert.equal(cleanMessage('x'.repeat(MESSAGE_MAX)).length, MESSAGE_MAX);
  assert.equal(cleanMessage('x'.repeat(MESSAGE_MAX + 1)), null);
  assert.equal(cleanText('a\nb'), 'a b', 'the Slake and the boards stay one line');
  assert.equal(cleanMessage('<b>not html</b>'), '<b>not html</b>', 'kept as words; the radio never renders it as markup');
});

/* ── Be seen here, in a room, and who is in its call ──────────────────── */

test('two people seen in one room see each other; a room is not the Slake', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  await beSeen(ada, 'the-den', V('a'), s, now);
  assert.deepEqual(await beSeen(bex, 'the-den', V('b'), s, now + 1), [{ handle: 'Ada', base: false }]);
  assert.deepEqual(await beSeen({ role: 'base', handle: 'Cy' }, 'the-mopery', V('c'), s, now + 2), []);
  assert.deepEqual(await beHere(ada, 'hide', V('d'), s, now + 3), [], 'the Slake does not see the rooms');
});

test('a visit is seen in one room at a time, goes at once, and the sweep takes the stale', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  await beSeen(ada, 'the-den', V('a'), s, now);
  await beSeen(ada, 'the-mopery', V('a'), s, now + 1);
  const mine = s.keys().filter((k) => k.includes(V('a')));
  assert.equal(mine.length, 1);
  assert.ok(mine[0].startsWith('room-here/the-mopery/'));
  assert.deepEqual(await beSeen(bex, 'the-mopery', V('b'), s, now + ROOM_FRESH + 1), [], 'shown after its thirty seconds');
  await beSeen(ada, 'the-den', V('a'), s, now + 2);
  await unseen(V('a'), s);
  assert.deepEqual(await beSeen(bex, 'the-den', V('b'), s, now + 3), []);
  await sweepSeen(s, now + 10 * ROOM_FRESH);
  assert.equal(s.keys().filter((k) => k.startsWith('room-here/')).length, 0);
});

test("8x8's own worked example signs, and anything else does not", () => {
  const raw = '{"eventType":"PARTICIPANT_JOINED","sessionId":"9a441d60-ceaf-4eba-b0a8-a7d940a76e1b","timestamp":1632490058278,"fqn":"vpaas-magic-cookie-96f0941768964ab380ed0fbada7a502f/sampleappromanticshiftsstripas","idempotencyKey":"9e9e7420-562d-4659-8e22-44b9b22aaa49","customerId":"96f0941768964ab380ed0fbada7a502f","appId":"vpaas-magic-cookie-96f0941768964ab380ed0fbada7a502f","data":{"avatar":"","name":"Test User","id":"auth0|5f903d7a77f3b4006eb8e67d","participantJid":"fc1ea14a-9bca-4218-a563-8c627e803d56@8x8.vc","moderator":true,"email":"test.user@company.com"}}';
  const secret = 'whsec_9635df66714a4cf088ee9d0979dd3bf6';
  const head = 't=1632490060,v1=xlzqEojlh4qb21sQpXYsWgyK8x9HVpz+RQldsv18rV0=';
  const then = 1632490060 * 1000;
  assert.equal(jaasSigned(head, raw, secret, then), true);
  assert.equal(jaasSigned(head, raw, secret, then + 10 * 60 * 1000), false, 'ten minutes late');
  assert.equal(jaasSigned(head, raw + ' ', secret, then), false, 'a body that changed');
  assert.equal(jaasSigned(head, raw, secret.slice(6), then), false, 'the secret without its whsec_');
  assert.equal(jaasSigned('t=1632490060,v0=xlzqEojlh4qb21sQpXYsWgyK8x9HVpz+RQldsv18rV0=', raw, secret, then), false, 'only v1 counts');
  assert.equal(jaasSigned(null, raw, secret, then), false);
  assert.equal(jaasSigned(head, raw, '', then), false, 'no secret, nothing believed');
});

test('an 8x8 event is only about one of our rooms', () => {
  assert.equal(callEventRoom(`${JAAS_APP}/stimpunks-the-den`), 'the-den');
  assert.equal(callEventRoom('vpaas-magic-cookie-other/stimpunks-the-den'), null);
  assert.equal(callEventRoom(`${JAAS_APP}/somebody-else`), null);
  assert.equal(callEventRoom(`${JAAS_APP}/stimpunks-../x`), null);
});

const ev = (type, name, id, at, extra = {}) => ({ eventType: type, fqn: `${JAAS_APP}/stimpunks-the-den`, timestamp: at,
  data: { name, participantId: id, email: 'never@kept.example', ...extra } });

test('who is in a call: names once, alphabetical, no email, gone on leaving and on closing', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  await callEvent(ev('PARTICIPANT_JOINED', 'Sam', 'p1', now), s, now);
  await callEvent(ev('PARTICIPANT_JOINED', 'Ada', 'p2', now + 1, { moderator: 'true' }), s, now);
  await callEvent(ev('PARTICIPANT_JOINED', 'Sam', 'p3', now + 2), s, now);
  assert.deepEqual(await inCall('the-den', s, now + 3), [{ name: 'Ada', base: true }, { name: 'Sam', base: false }]);
  assert.ok(!s.keys().some((k) => /never|kept|p1|p2/.test(k)), 'no email and no raw id in any key');
  await callEvent(ev('PARTICIPANT_LEFT', 'Ada', 'p2', now + 4), s, now);
  assert.deepEqual((await inCall('the-den', s, now + 5)).map((p) => p.name), ['Sam']);
  assert.deepEqual(await inCall('the-mopery', s, now + 5), [], 'another room\'s call is its own');
  await callEvent({ eventType: 'ROOM_DESTROYED', fqn: `${JAAS_APP}/stimpunks-the-den`, timestamp: now + 6, data: {} }, s, now);
  assert.deepEqual(await inCall('the-den', s, now + 7), []);
});

test('a leaving that arrives before its joining wins, and the sweep takes what 8x8 never closed', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  await callEvent(ev('PARTICIPANT_LEFT', 'Bex', 'p9', now + 10), s, now);
  assert.equal(await callEvent(ev('PARTICIPANT_JOINED', 'Bex', 'p9', now), s, now), 'already left');
  assert.deepEqual(await inCall('the-den', s, now + 11), []);
  await callEvent(ev('PARTICIPANT_JOINED', 'Cy', 'p8', now), s, now);
  const later = now + (CALL_HOURS + 2) * 3600 * 1000;
  assert.deepEqual(await inCall('the-den', s, later), [], 'older than a token can be');
  await sweepCalls(s, later);
  assert.equal(s.keys().filter((k) => k.startsWith('call-in/') || k.startsWith('call-left/')).length, 0);
  assert.equal(await callEvent({ eventType: 'PARTICIPANT_JOINED', fqn: 'elsewhere/stimpunks-x', data: { participantId: 'q' } }, s, now), 'not ours');
});

test('a beacon carries the video by its id, and nothing that is not one', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  const r = await hostBeacon(ada, 'the-den', 'Winter Forest Campfire', 90, true, s, now, 'dQw4w9WgXcQ');
  assert.equal(shapeBeacons(r.beacons)[0].video, 'dQw4w9WgXcQ');
  const t = await hostBeacon(ada, 'the-den', 'Winter Forest Campfire', 95, true, s, now + 1, 'javascript:x');
  assert.equal(shapeBeacons(t.beacons)[0].video, null);
  assert.equal(cleanVideo('dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(cleanVideo('too-short'), null);
});
