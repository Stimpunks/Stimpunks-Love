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
  MUD_PLACES, MUD_FRESH, KEEP, LIFE, onAir, sweep,
  hostBeacon, stopBeacon, readBeacons, sweepBeacons, beaconRoom, cleanAt, BEACON_FRESH,
  updateRoomTalk, readRoomTalk, readTuned, updateTuned, sweepRoomTalk, roomTag,
  callToken, callSrc, callsReady, tidyPem, JAAS_APP, CALL_HOURS,
  PUBLIC_CALLS, publicCall, callSettings, WORLD_CALL, MOD_ROOMS, STRICT_ROOMS, roomAllows, shapeBeacons, QUIET_ROOMS, quietRoom,
  ROLES, foldHandle, readMods, signOn, issuePass, readPass, rolesOf,
  renamePet, shapeAnimal, parseBrass, brassHtml, brassHref, brassFeed, readBrass, shapeBrass, addBrass, editBrass, removeBrass, putBrassImage, getBrassImage, sweepBrassImages,
  readSuggestions, shapeSuggestion, addSuggestion, answerSuggestion, removeSuggestion, SUGGEST_KEEP, SUGGEST_BODY_MAX, REACTIONS, reactionOf, toggleReaction, canTakeOff, canEdit, editMessage, SMALL_SPECIES, SMALL_COATS, SMALL_MARKS, animalNoun, ANIMAL_ID, setShown, isShown, shownPets, stickerOf, shapeSticker, issueAccountPass, accountAnswer, isMod, claimAccount, checkPassword, changePassword, recoverAccount, resetAccount, deleteAccount,
  readAccount, acctKey, cleanCode, ACCT_TRIES, ACCT_LOCK, ACCT_RESET_FOR,
  imageKind, carriesMetadata, putImage, getImage, droppedImages, sweepImages, shape, IMG_MAX,
  cleanMessage, MESSAGE_MAX, cleanText,
  cleanLook, readAvatars, keepAvatar, editAvatar, removeAvatar, wearAvatar, forgetAvatars, withAvatars, avatarSticker, shapeAvatarSticker, AVATAR, AVATAR_KEEP,
  setAvatarsShown, avatarsShown, shownAvatars,
  CHIMERA, CHIMERA_KEEP, cleanChimera, readChimeras, keepChimera, editChimera, removeChimera, forgetChimeras, setChimerasShown, chimerasShown, shownChimeras, chimeraSticker, shapeChimeraSticker, shape as shapeMessages,
  QUEST_IDS, questIds, readJobs, keepJobs, forgetJobs, setJobsShown, jobsShown, shownJobs,
  PATCH_IDS, patchId, readPatches, takePatch, forgetPatches, setPatchesShown, patchesShown, shownPatches, patchSticker, shapePatchSticker, jacketSticker, shapeJacketSticker,
  cleanVideo, beSeen, unseen, sweepSeen, whoSeen, ROOM_FRESH, jaasSigned, callEventRoom, callEvent, inCall, callsOn, sweepCalls,
  PROFILE_KEYS, cleanProfile, cleanProfileLink, cleanBio, readProfile, keepProfile, forgetProfile, clearProfile, shownProfile, withPlates, BIO_MAX, PROFILE_LINKS,
  PROP_MAX, PROPS_KEEP, PROPS_WAITING, cleanProp, readProps, giveProp, confirmProp, rejectProp, dropProp, setPropsOpen, forgetProps, ownProps, shownProps } from './lib.mjs';
import { generateKeyPairSync, createVerify, createECDH, randomBytes as rnd, verify as cryptoVerify, createPublicKey } from 'node:crypto';
import { encryptPush, vapidAuth, pushPublicKey, cleanSubscription, cleanWant, keepDevice, readDevices, readDevice, dropDevice, dropDevicesOf,
  mentions, notifyMessage, notifyEdit, notifyCall, pushDeviceId, PUSH_PER_HANDLE, CALL_QUIET } from './lib.mjs';
import { dmKey, sendDm, readDmWith, listDms, acceptDm, rejectDm, takeDm, editDm, setDmOpen, blockDm, unblockDm, forgetDms,
  reportDm, readReports, closeReport, sweepDms, shapeDm, notifyDm, readDmSet, DM_KEEP, DM_WITH, REPORT_DAYS } from './lib.mjs';

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
      // A picture's or a forum upload's key is a fresh random id, so writing it can race nothing.
      if (!/^(mud-here|room-here|call-in|call-left|img|brass-img|forum-up|forum-file)\//.test(key)) throw new Error('an unconditional write outside presence: ' + key);
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

for (const etagOnRead of [true, false]) {
  test(`fifteen people reacting to one message at once, ${etagOnRead ? 'with' : 'without'} an etag on reads: none told it worked is missing`, async () => {
    const s = memoryStore({ etagOnRead });
    await updateChannel((list) => [...list, { id: 'm1', handle: 'Ada', text: 'hello', t: Date.now() }], s);
    const heart = REACTIONS[0][0];
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) =>
      updateChannel((list) => toggleReaction(list, 'm1', heart, `p${i}`), s)));
    const worked = told.map((r, i) => (r.status === 'fulfilled' ? `p${i}` : null)).filter(Boolean);
    for (const f of told.filter((r) => r.status === 'rejected')) assert.equal(f.reason.message, 'busy');
    const [m] = shape((await readChannel(s)).messages);
    const who = (m.reactions || []).find((x) => x.emoji === heart)?.who || [];
    assert.deepEqual(worked.filter((h) => !who.includes(h)), [], 'a reaction that was told it worked is missing');
    assert.equal(who.length, worked.length, 'a reaction nobody was told about is there');
  });
}

test('the radio offers exactly the reactions the server takes', async () => {
  const { readFileSync } = await import('node:fs');
  const src = readFileSync(new URL('../../cb.js', import.meta.url), 'utf8');
  const block = /var REACTIONS = \[([\s\S]*?)\];/.exec(src);
  assert.ok(block, 'cb.js has no REACTIONS list');
  const offered = [...block[1].matchAll(/\['((?:\\u\{?[0-9A-Fa-f]+\}?)+)', '([^']+)'\]/g)]
    .map((m) => [JSON.parse('"' + m[1].replace(/\\u\{([0-9A-Fa-f]+)\}/g, (_, h) => String.fromCodePoint(parseInt(h, 16)).split('').map((c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('')) + '"'), m[2]]);
  assert.deepEqual(offered, REACTIONS, 'the radio and the server disagree about the reactions');
});

test('a reaction is pressed and pressed again, names who and never says how many', () => {
  const heart = REACTIONS[0][0], eyes = REACTIONS.find((x) => x[1] === 'eyes')[0];
  let list = [{ id: 'm1', handle: 'Ada', text: 'hi', t: 1 }, { id: 'm2', handle: 'Bo', text: 'yo', t: 2 }];
  list = toggleReaction(list, 'm1', heart, 'Zed');
  list = toggleReaction(list, 'm1', heart, 'Ada');
  list = toggleReaction(list, 'm1', eyes, 'Bo');
  const [one, two] = shape(list);
  assert.deepEqual(one.reactions.map((x) => x.emoji), [heart, eyes], 'reactions out of the set\'s order');
  assert.deepEqual(one.reactions[0].who, ['Ada', 'Zed'], 'names not in alphabetical order');
  for (const x of one.reactions) assert.deepEqual(Object.keys(x).sort(), ['emoji', 'name', 'who'], 'a reaction carries a count or more');
  assert.equal(two.reactions, undefined);
  // Pressed again, in any case of the handle, it comes off; the last one off takes the reaction with it.
  list = toggleReaction(list, 'm1', heart, 'ZED');
  list = toggleReaction(list, 'm1', eyes, 'bo');
  assert.deepEqual(shape(list)[0].reactions.map((x) => x.who), [['Ada']]);
  list = toggleReaction(list, 'm1', heart, 'Ada');
  assert.equal(shape(list)[0].reactions, undefined);
  assert.equal(list[0].reactions, undefined, 'an empty reactions object left on the message');
  // Any one emoji, and only one emoji: skin tones, flags, joined sequences and
  // keycaps are one each; words, markup, two emoji and bare digits are not.
  for (const e of ['\u{1F419}', '\u{1F44D}\u{1F3FD}', '\u{1F1EC}\u{1F1E7}', '\u{1F3F3}\uFE0F\u200D\u{1F308}', '1\uFE0F\u20E3', '\u{1FAC2}'])
    assert.equal(reactionOf(e), e, `refused ${JSON.stringify(e)}`);
  for (const e of ['hi', '\u{1F600}\u{1F600}', '<b>', '#', '9', '', ' \u{1F419}', '\u{1F419}x'])
    assert.equal(reactionOf(e), null, `took ${JSON.stringify(e)}`);
  let other = toggleReaction([{ id: 'o', handle: 'Ada', text: 'x', t: 1 }], 'o', '\u{1F419}', 'Bo');
  other = toggleReaction(other, 'o', heart, 'Cy');
  const shown = shape(other)[0].reactions;
  assert.deepEqual(shown.map((x) => x.emoji), [heart, '\u{1F419}'], 'the quick row does not come first');
  assert.equal(shown[1].name, '\u{1F419}', 'another emoji is named as itself');
  // A message holds so many different reactions and no more; one already there can still be pressed.
  let full = [{ id: 'f', handle: 'Ada', text: 'x', t: 1 }];
  const many = ['\u{1F34E}', '\u{1F34F}', '\u{1F350}', '\u{1F351}', '\u{1F352}', '\u{1F353}', '\u{1F354}', '\u{1F355}', '\u{1F356}', '\u{1F357}',
    '\u{1F358}', '\u{1F359}', '\u{1F35A}', '\u{1F35B}', '\u{1F35C}', '\u{1F35D}', '\u{1F35E}', '\u{1F35F}', '\u{1F360}', '\u{1F361}',
    '\u{1F362}', '\u{1F363}', '\u{1F364}', '\u{1F365}'];
  for (const e of many) full = toggleReaction(full, 'f', e, 'Bo');
  assert.equal(toggleReaction(full, 'f', '\u{1F366}', 'Bo'), null, 'a message took one reaction too many');
  assert.ok(toggleReaction(full, 'f', many[0], 'Cy'), 'a reaction already there could not be pressed');
  // Only the set, and only a message that is there.
  assert.equal(reactionOf('<script>'), null);
  assert.equal(toggleReaction(list, 'm1', 'nope', 'Ada'), null);
  assert.equal(toggleReaction(list, 'gone', heart, 'Ada'), null);
});

test('anybody takes off their own message, a claimed one only with its password, and the base any', () => {
  const ada = { id: 'a', handle: 'Ada', text: 'hi', t: 1 };
  const adaClaimed = { id: 'c', handle: 'Ada', text: 'hi', t: 2, claimed: true };
  const fromBase = { id: 'b', handle: 'Juniper', text: 'hi', t: 3, base: true, claimed: true };
  const asAda = { role: 'mobile', handle: 'Ada', roles: new Set() };
  const asAdaClaimed = { role: 'mobile', handle: 'Ada', roles: new Set(), account: true };
  const base = { role: 'base', handle: 'Juniper', roles: new Set(['moderator']) };
  assert.equal(canTakeOff(asAda, ada), true, 'a sender could not take off their own message');
  assert.equal(canTakeOff({ ...asAda, handle: ' ADA ' }, ada), true, 'the handle was not folded');
  assert.equal(canTakeOff({ ...asAda, handle: 'Bo' }, ada), false, 'somebody took off another person\'s message');
  // CLAIMED says the message came from whoever holds that username's password,
  // so only that password takes it off; a deleted username taken up again with
  // the community password cannot reach back to what its owner said.
  assert.equal(canTakeOff(asAda, adaClaimed), false, 'a CLAIMED message came off for the community password');
  assert.equal(canTakeOff(asAdaClaimed, adaClaimed), true, 'a claimed username could not take off its own message');
  assert.equal(canTakeOff(asAdaClaimed, ada), true, 'claiming a username lost what was said under it before');
  // A message from the base comes off only for the base, which takes off anything.
  assert.equal(canTakeOff({ role: 'mobile', handle: 'Juniper', roles: new Set(), account: true }, fromBase), false, 'a BASE message came off for somebody not the base');
  for (const m of [ada, adaClaimed, fromBase]) assert.equal(canTakeOff(base, m), true, 'the base could not take a message off');
  assert.equal(canTakeOff(null, ada), false);
  assert.equal(canTakeOff(asAda, null), false);
});

test('only whoever sent a message edits it, the base no one else\'s, and an edit changes the words and nothing else', () => {
  const ada = { id: 'a', handle: 'Ada', text: 'hi', t: 1 };
  const adaClaimed = { id: 'c', handle: 'Ada', text: 'hi', t: 2, claimed: true };
  const fromBase = { id: 'b', handle: 'Juniper', text: 'hi', t: 3, base: true, claimed: true };
  const asAda = { role: 'mobile', handle: 'Ada', roles: new Set() };
  const asAdaClaimed = { role: 'mobile', handle: 'Ada', roles: new Set(), account: true };
  const base = { role: 'base', handle: 'Juniper', roles: new Set(['moderator']) };
  assert.equal(canEdit(asAda, ada), true, 'a sender could not edit their own message');
  assert.equal(canEdit({ ...asAda, handle: ' ADA ' }, ada), true, 'the handle was not folded');
  assert.equal(canEdit({ ...asAda, handle: 'Bo' }, ada), false, 'somebody edited another person\'s message');
  assert.equal(canEdit(asAda, adaClaimed), false, 'a CLAIMED message was edited with the community password');
  assert.equal(canEdit(asAdaClaimed, adaClaimed), true, 'a claimed username could not edit its own message');
  // The base takes any message off the air, and edits only its own.
  assert.equal(canEdit(base, ada), false, 'the base put words in somebody else\'s mouth');
  assert.equal(canEdit(base, fromBase), true, 'the base could not edit its own message');
  assert.equal(canEdit({ role: 'mobile', handle: 'Juniper', roles: new Set(), account: true }, fromBase), false, 'a BASE message was edited by somebody not the base');
  assert.equal(canEdit(null, ada), false);
  assert.equal(canEdit(asAda, null), false);

  const heart = REACTIONS[0][0];
  const pic = '00000000-0000-4000-8000-000000000000';
  const list = [
    { id: 'a', handle: 'Ada', text: 'helo', t: 1000, claimed: false, reactions: { [heart]: ['Bo'] } },
    { id: 'p', handle: 'Ada', text: 'look', t: 2000, img: pic, alt: 'a moth' },
    { id: 'o', handle: 'Bo', text: 'yo', t: 3000 }];
  const r = editMessage(list, 'a', 'hello\r\n\n\n\nthere  ', asAda, 5000);
  const m = r.list[0];
  assert.equal(m.text, 'hello\n\nthere', 'an edit was not tidied the way a message is');
  assert.equal(m.edited, 5000);
  assert.equal(m.t, 1000, 'an edit moved when the message was sent, and so when it goes');
  assert.deepEqual(m.reactions, list[0].reactions, 'an edit lost the reactions');
  assert.equal(r.before, 'helo');
  assert.equal(list[0].text, 'helo', 'an edit changed the list it was given');
  assert.deepEqual(Object.keys(m).sort(), ['claimed', 'edited', 'handle', 'id', 'reactions', 't', 'text'], 'an edit kept something more than the words');
  assert.equal(shape(r.list)[0].edited, 5000, 'the radio is not told a message was edited');
  assert.equal(shape(list)[0].edited, undefined);
  assert.equal(editMessage(list, 'a', 'helo', asAda).same, true, 'the same words again changed something');
  assert.equal(editMessage(list, 'a', '   ', asAda).why, 'empty', 'a message was edited down to nothing');
  const bare = editMessage(list, 'p', '', asAda, 6000).list[1];
  assert.equal(bare.text, '', 'a picture could not lose its words');
  assert.equal(bare.img, pic, 'an edit lost the picture');
  assert.equal(bare.alt, 'a moth', 'an edit lost the picture\'s description');
  assert.equal(editMessage(list, 'a', 'x'.repeat(MESSAGE_MAX + 1), asAda).why, 'bad');
  assert.equal(editMessage(list, 'o', 'mine now', asAda).why, 'not yours');
  assert.equal(editMessage(list, 'gone', 'hi', asAda).why, 'gone');
});

for (const etagOnRead of [true, false]) {
  test(`fifteen people editing their own messages at once, ${etagOnRead ? 'with' : 'without'} an etag on reads: none told it worked is missing`, async () => {
    const s = memoryStore({ etagOnRead });
    const now = Date.now();
    await updateChannel((list) => [...list, ...Array.from({ length: 15 }, (_, i) => ({ id: `m${i}`, handle: `p${i}`, text: 'before', t: now }))], s);
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) =>
      updateChannel((list) => editMessage(list, `m${i}`, `after ${i}`, { role: 'mobile', handle: `p${i}`, roles: new Set() }).list || null, s)));
    const worked = told.map((r, i) => (r.status === 'fulfilled' ? i : null)).filter((i) => i !== null);
    for (const f of told.filter((r) => r.status === 'rejected')) assert.equal(f.reason.message, 'busy');
    const { messages } = await readChannel(s);
    assert.deepEqual(worked.filter((i) => messages.find((m) => m.id === `m${i}`).text !== `after ${i}`), [], 'an edit that was told it worked is missing');
    assert.equal(messages.filter((m) => m.edited).length, worked.length, 'an edit nobody was told about is there');
  });
}

// THE BRASS TACKS BOARD.
const MOD = { role: 'base', handle: 'Juniper', roles: new Set(['moderator']) };
const MOD2 = { role: 'base', handle: 'Quill', roles: new Set(['moderator']) };
const ANY = { role: 'mobile', handle: 'Ada', roles: new Set() };

test('the board: only a moderator posts, the author edits, any moderator takes a post down', async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.ok((await addBrass(ANY, { title: 'Hi', body: 'x' }, s)).error, 'somebody who is not a moderator posted');
  const { post } = await addBrass(MOD, { title: 'Gathering on Sunday', body: 'Come **along**.' }, s, 10);
  assert.equal(post.handle, 'Juniper');
  const shown = shapeBrass((await readBrass(s))[0]);
  assert.equal(shown.title, 'Gathering on Sunday'); assert.equal(shown.handle, 'Juniper');
  assert.equal(shown.ast[0].c[1].t, 'b');
  assert.ok((await editBrass(MOD2, post.id, { title: 'Mine now', body: 'y' }, s)).error, 'a moderator edited somebody else\'s post');
  const ed = await editBrass(MOD, post.id, { title: 'Gathering on Sunday, 3pm', body: 'Come along.' }, s, 20);
  assert.equal(ed.post.edited, 20);
  assert.ok((await removeBrass(ANY, post.id, s)).error);
  assert.equal((await removeBrass(MOD2, post.id, s)).removed, true, 'another moderator could not take it down');
  assert.deepEqual(await readBrass(s), []);
  assert.ok((await addBrass(MOD, { title: '', body: 'x' }, s)).error, 'a post with no title');
  assert.ok((await addBrass(MOD, { title: 't', body: '   ' }, s)).error, 'a post with nothing in it');
});

test('the board: a picture is redrawn, described, said yes to, and goes with its post', async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.ok((await putBrassImage(ANY, jpeg(), s)).error, 'somebody who is not a moderator put a picture up');
  const withExif = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x10]), Buffer.from('Exif\u0000\u0000'), Buffer.alloc(64)]);
  assert.ok((await putBrassImage(MOD, new Uint8Array(withExif), s)).error, 'a picture still carrying camera data went up');
  const { id } = await putBrassImage(MOD, jpeg(), s, 0);
  assert.ok((await addBrass(MOD, { title: 't', body: 'b', img: id }, s)).error, 'a picture with no description');
  assert.ok((await addBrass(MOD, { title: 't', body: 'b', img: id, alt: 'A cake' }, s)).error, 'a picture nobody said yes to');
  const { post } = await addBrass(MOD, { title: 't', body: 'b', img: id, alt: 'A cake', yes: true }, s);
  assert.equal(shapeBrass((await readBrass(s))[0]).alt, 'A cake');
  const { id: id2 } = await putBrassImage(MOD, jpeg(), s, 0);
  await editBrass(MOD, post.id, { title: 't', body: 'b', img: id2, alt: 'A bigger cake', yes: true }, s);
  assert.equal(await getBrassImage(id, s), null, 'the old picture outlived the edit that replaced it');
  await removeBrass(MOD2, post.id, s);
  assert.equal(await getBrassImage(id2, s), null, 'the picture outlived its post');
  const { id: stray } = await putBrassImage(MOD, jpeg(), s, 0);
  await sweepBrassImages(s, 1000);
  assert.ok(await getBrassImage(stray, s), 'an upload was swept before its day was up');
  await sweepBrassImages(s, 2 * 24 * 60 * 60 * 1000);
  assert.equal(await getBrassImage(stray, s), null, 'an upload no post holds was never swept');
});

test('the board reads Markdown into nodes, never HTML, and links only where links may go', () => {
  const nodes = parseBrass('Hi <script>alert(1)</script> [x](javascript:alert(1)) [y](//evil.example) [z](data:text/html,1) <img src=x onerror=alert(1)>');
  const flat = JSON.stringify(nodes);
  assert.ok(!flat.includes('"t":"a"'), 'a link was made from an address that may not be one');
  const html = brassHtml(nodes);
  assert.ok(!/<script|<img/i.test(html), 'markup typed into a post reached the feed as markup');
  assert.ok(html.includes('&lt;script&gt;') && html.includes('&lt;img'), 'what was typed did not reach the feed as words');
  // A picture from somewhere else is never fetched: it is a link to it, with a "!" in front.
  const pic = parseBrass('![a cake](https://elsewhere.example/p.png)')[0].c;
  assert.deepEqual(pic.map((n) => n.t), ['text', 'a']);
  assert.ok(!brassHtml(parseBrass('![a cake](https://elsewhere.example/p.png)')).includes('<img'));
  assert.equal(brassHref('https://stimpunks.org/x/'), 'https://stimpunks.org/x/');
  assert.equal(brassHref('/the-den.html'), '/the-den.html');
  assert.equal(brassHref('#post-1'), '#post-1');
  assert.equal(brassHref('mailto:hello@example.org'), 'mailto:hello@example.org');
  for (const bad of ['javascript:alert(1)', 'JavaScript:x', 'data:x', '//evil.example', 'https://a:b@evil.example', 'vbscript:x'])
    assert.equal(brassHref(bad), null, bad);
  // An address with nothing after its // is words, and must not throw (it took the whole post with it).
  for (const v of ['starting with https:// becomes a link', 'https://', 'see http://<b>', 'HTTPS://\n']) {
    assert.ok(parseBrass(v).length, `parseBrass threw or lost ${JSON.stringify(v)}`);
  }
  assert.equal(JSON.stringify(parseBrass('starting with https:// is words')).includes('"t":"a"'), false);
  assert.equal(parseBrass('go to https://example.com/x.')[0].c[1].href, 'https://example.com/x');
  const all = parseBrass('# H\n\n- a\n- b\n\n1. c\n\n> q\n\n```\ncode <b>\n```\n\n---\n\n| a | b |\n|---|---|\n| 1 | 2 |');
  assert.deepEqual(all.map((n) => n.t), ['h', 'ul', 'ol', 'quote', 'code', 'hr', 'table']);
  assert.ok(brassHtml(all).includes('code &lt;b&gt;'));
});

test('the board\'s feed escapes every word and names the moderator', () => {
  const xml = brassFeed([{ id: 'p1', title: 'Tea & <cake>', body: '**Sunday** [the den](/the-den.html)', handle: 'Juniper', t: 0 }]);
  assert.ok(xml.includes('<title>Tea &amp; &lt;cake&gt;</title>'));
  assert.ok(xml.includes('&lt;strong&gt;Sunday&lt;/strong&gt;'));
  assert.ok(xml.includes('https://stimpunks.world/the-den.html'), 'a path on the street was not made absolute in the feed');
  assert.ok(xml.includes('<dc:creator>Juniper</dc:creator>'));
});

for (const etagOnRead of [true, false]) {
  test(`fifteen moderators posting at once, ${etagOnRead ? 'with' : 'without'} an etag on reads: no post told it went up is missing`, async () => {
    const s = memoryStore({ etagOnRead });
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) =>
      addBrass({ role: 'base', handle: `m${i}`, roles: new Set() }, { title: `t${i}`, body: 'b' }, s)));
    const up = told.filter((r) => r.status === 'fulfilled' && r.value.post).map((r) => r.value.post.id);
    for (const f of told.filter((r) => r.status === 'rejected')) assert.equal(f.reason.message, 'busy');
    const ids = (await readBrass(s)).map((p) => p.id);
    assert.deepEqual(up.filter((id) => !ids.includes(id)), [], 'a post told it went up is missing');
    assert.equal(ids.length, up.length);
  });
}

// THE SUGGESTION BOX, in The Sandbox: the board turned round.
test('the suggestion box: anybody signed on drops one in, with the marks their pass gives', async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.ok((await addSuggestion(null, { kind: 'bug', title: 't', body: 'b' }, s)).error, 'somebody signed off dropped one in');
  assert.ok((await addSuggestion(ANY, { kind: 'wish', title: 't', body: 'b' }, s)).error, 'a kind that is not one of the three');
  assert.ok((await addSuggestion(ANY, { kind: 'bug', title: '', body: 'b' }, s)).error, 'one with no title');
  assert.ok((await addSuggestion(ANY, { kind: 'bug', title: 't', body: '  ' }, s)).error, 'one with nothing in it');
  assert.ok((await addSuggestion(ANY, { kind: 'bug', title: 't', body: 'x'.repeat(SUGGEST_BODY_MAX + 1) }, s)).error, 'one too long');
  const { item } = await addSuggestion(ANY, { kind: 'bug', title: 'The castle', body: 'It **burned**.', base: true, claimed: true }, s, 10);
  await addSuggestion({ ...ANY, handle: 'Bo', account: true }, { kind: 'feature', title: 'A kite', body: 'Please.' }, s, 20);
  await addSuggestion(MOD, { kind: 'suggestion', title: 'A spade', body: 'A bigger one.' }, s, 30);
  const shown = (await readSuggestions(s)).map(shapeSuggestion);
  assert.deepEqual(shown.map((x) => x.title), ['A spade', 'A kite', 'The castle'], 'not newest first');
  const [spade, kite, castle] = shown;
  assert.equal(castle.id, item.id); assert.equal(castle.handle, 'Ada'); assert.equal(castle.status, 'open');
  assert.ok(!castle.base && !castle.claimed, 'a mark was taken from what was sent rather than from the pass');
  assert.equal(kite.claimed, true); assert.ok(!kite.base);
  assert.equal(spade.base, true); assert.ok(!spade.claimed, 'BASE and CLAIMED on one suggestion');
  assert.equal(castle.ast[0].c[1].t, 'b', 'the words were not read into nodes');
});

test('the suggestion box: only a moderator answers, always with a reply, and can open it again', async () => {
  const s = memoryStore({ etagOnRead: true });
  const { item } = await addSuggestion(ANY, { kind: 'feature', title: 'A kite', body: 'Please.' }, s);
  assert.ok((await answerSuggestion(ANY, item.id, { status: 'done', reply: 'Mine' }, s)).error, 'somebody who is not a moderator answered');
  assert.ok((await answerSuggestion(MOD, item.id, { status: 'denied' }, s)).error, 'not doing it, with no reason given');
  assert.ok((await answerSuggestion(MOD, item.id, { status: 'done', reply: ' ' }, s)).error, 'done, with an empty reply');
  assert.ok((await answerSuggestion(MOD, item.id, { status: 'maybe', reply: 'x' }, s)).error, 'a status that is not one of the three');
  assert.ok((await answerSuggestion(MOD, 'gone', { status: 'done', reply: 'x' }, s)).error, 'an answer to nothing');
  await answerSuggestion(MOD, item.id, { status: 'denied', reply: 'Not **yet**.' }, s, 50);
  let shown = shapeSuggestion((await readSuggestions(s))[0]);
  assert.equal(shown.status, 'denied');
  assert.deepEqual([shown.answer.handle, shown.answer.t, shown.answer.body], ['Juniper', 50, 'Not **yet**.']);
  assert.equal(shown.answer.ast[0].c[1].t, 'b');
  await answerSuggestion(MOD2, item.id, { status: 'done', reply: 'Up now.' }, s, 60);
  shown = shapeSuggestion((await readSuggestions(s))[0]);
  assert.deepEqual([shown.status, shown.answer.handle], ['done', 'Quill'], 'answering again did not replace the answer');
  await answerSuggestion(MOD, item.id, { status: 'open' }, s);
  shown = shapeSuggestion((await readSuggestions(s))[0]);
  assert.equal(shown.status, 'open'); assert.equal(shown.answer, undefined, 'opening it again left the old answer on');
});

test('the suggestion box: whoever posted it takes it down, a claimed one only with its password, and any moderator any', async () => {
  const s = memoryStore({ etagOnRead: true });
  const asAdaClaimed = { ...ANY, account: true };
  const { item: plain } = await addSuggestion(ANY, { kind: 'bug', title: 'a', body: 'b' }, s);
  const { item: claimed } = await addSuggestion(asAdaClaimed, { kind: 'bug', title: 'c', body: 'd' }, s);
  const { item: other } = await addSuggestion({ ...ANY, handle: 'Bo' }, { kind: 'bug', title: 'e', body: 'f' }, s);
  assert.ok((await removeSuggestion(null, plain.id, s)).error);
  assert.ok((await removeSuggestion(ANY, other.id, s)).error, 'somebody took down somebody else\'s suggestion');
  assert.ok((await removeSuggestion(ANY, claimed.id, s)).error, 'a CLAIMED suggestion came down for the community password');
  assert.equal((await removeSuggestion({ ...ANY, handle: ' ada ' }, plain.id, s)).removed, true, 'its own poster could not take it down');
  assert.equal((await removeSuggestion(asAdaClaimed, claimed.id, s)).removed, true);
  assert.equal((await removeSuggestion(MOD, other.id, s)).removed, true, 'a moderator could not take one down');
  assert.deepEqual(await readSuggestions(s), []);
  assert.ok((await removeSuggestion(MOD, other.id, s)).error, 'taken down twice');
});

test('the suggestion box: a full box refuses the next one and pushes nothing out', async () => {
  const s = memoryStore({ etagOnRead: true });
  for (let i = 0; i < SUGGEST_KEEP; i++) await addSuggestion(ANY, { kind: 'bug', title: `t${i}`, body: 'b' }, s, i);
  const r = await addSuggestion(ANY, { kind: 'bug', title: 'one more', body: 'b' }, s);
  assert.ok(r.error, 'a full box took another');
  const kept = await readSuggestions(s);
  assert.equal(kept.length, SUGGEST_KEEP); assert.equal(kept[kept.length - 1].title, 't0', 'the oldest was pushed out');
});

for (const etagOnRead of [true, false]) {
  test(`fifteen people dropping suggestions in at once, ${etagOnRead ? 'with' : 'without'} an etag on reads: none told it went in is missing`, async () => {
    const s = memoryStore({ etagOnRead });
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) =>
      addSuggestion({ role: 'mobile', handle: `p${i}`, roles: new Set() }, { kind: 'suggestion', title: `t${i}`, body: 'b' }, s)));
    const went = told.filter((r) => r.status === 'fulfilled' && r.value.item).map((r) => r.value.item.id);
    for (const f of told.filter((r) => r.status === 'rejected')) assert.equal(f.reason.message, 'busy');
    const ids = (await readSuggestions(s)).map((p) => p.id);
    assert.deepEqual(went.filter((id) => !ids.includes(id)), [], 'a suggestion told it went in is missing');
    assert.equal(ids.length, went.length);
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
  // NEVER MORE AT ONCE THAN A LOG KEEPS: while a channel kept ten, an
  // eleventh pushing the first off was the rule working, not a lost write, and
  // the first run here raced fifteen and reported the five it had pushed off as
  // missing. A channel keeps fifty since 2026-10-18, so it races fifteen, like
  // the boards.
  const AT_ONCE = Math.min(15, KEEP);

  test(`the radio's channel, fifteen at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const { missing, failed } = await fifteen(updateChannel, log(readChannel), s, AT_ONCE);
    assert.deepEqual(missing, [], 'a message that was told it went out is not on the channel');
    for (const f of failed) assert.equal(f.reason.message, 'busy');
  });

  test(`a place on the Slake, fifteen at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const place = MUD_PLACES[0];
    const { worked, missing, failed } = await fifteen(
      (change, st) => updateTalk(place, change, st), log((st) => readTalk(place, st)), s, AT_ONCE);
    assert.deepEqual(missing, [], 'something that was told it was said is not in the place');
    for (const f of failed) assert.equal(f.reason.message, 'busy');
    if (etagOnRead) assert.equal(worked.length, AT_ONCE);
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

test('the sweep takes stale presence and talk past its 48 hours, and leaves the rest', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  await beHere(ada, 'hide', V('a'), s, now - MUD_FRESH - 1);
  await updateTalk('hide', (l) => [...l, { id: 'today', t: now }], s);
  await s.setJSON('mud-talk-creek', { day: '2000-01-01', messages: [{ id: 'old' }] }, { onlyIfNew: true });
  await sweepSlake(s, now);
  assert.equal(s.keys().filter((k) => k.startsWith('mud-here/')).length, 0);
  assert.ok(!s.keys().includes('mud-talk-creek'));
  assert.deepEqual((await readTalk('hide', s)).messages.map((m) => m.id), ['today']);
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

/* A moderator's pasted video has no button on anybody else's page, so a radio
   puts one up only for a beacon the SERVER says is the base's, and says how
   long it runs from the beacon. Neither is the request's to claim. */
test('a beacon\'s base mark comes from the pass, and its length is checked', async () => {
  const s = memoryStore({ etagOnRead: true });
  const base = { role: 'base', handle: 'Base' };
  await hostBeacon(ada, 'the-den', 'Film', 1, true, s, Date.now(), 'dQw4w9WgXcQ', 212.4);
  await hostBeacon(base, 'lightbulb-picture-house', 'Film', 1, true, s, Date.now(), 'not an id', 'long');
  const all = shapeBeacons(await readBeacons(s));
  const den = all.find((b) => b.room === 'the-den'), lph = all.find((b) => b.room === 'lightbulb-picture-house');
  assert.deepEqual([den.base, den.video, den.length], [false, 'dQw4w9WgXcQ', 212.4]);
  assert.deepEqual([lph.base, lph.video, lph.length], [true, null, null]);
  for (const b of all) assert.deepEqual(Object.keys(b).sort(), ['at', 'base', 'film', 'handle', 'length', 'live', 'playing', 'room', 't', 'video']);
  assert.deepEqual(all.map((b) => b.live), [false, false], 'a beacon is not live unless it says so');
});

/* A live video has no place and no length: whatever a radio sends for either,
   its beacon says live, at 0, with no length. And live is only ever true. */
test('a live beacon keeps no place and no length', async () => {
  const s = memoryStore({ etagOnRead: true });
  await hostBeacon(ada, 'the-jungle-room', 'A live cam', 812.5, true, s, Date.now(), 'dQw4w9WgXcQ', 4000, true);
  await hostBeacon(bex, 'the-den', 'A film', 30, true, s, Date.now(), null, null, 'yes');
  const all = shapeBeacons(await readBeacons(s));
  const cam = all.find((b) => b.room === 'the-jungle-room'), den = all.find((b) => b.room === 'the-den');
  assert.deepEqual([cam.live, cam.at, cam.length, cam.video, cam.playing], [true, 0, null, 'dQw4w9WgXcQ', true]);
  assert.deepEqual([den.live, den.at], [false, 30], 'only true makes a beacon live');
  const again = await hostBeacon(ada, 'the-jungle-room', 'A film now', 12, false, s);
  assert.equal(again.beacons.find((b) => b.room === 'the-jungle-room').live, false, 'a host who moves off a live video is not live any more');
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
  test(`a room's channel, fifteen at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const { missing, failed } = await fifteen(
      (change, st) => updateRoomTalk('the-den', change, st), async (st) => (await readRoomTalk('the-den', st)).messages, s, Math.min(15, KEEP));
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

test('a room channel with nothing left on air is not heard and is swept; one with something stays', async () => {
  const s = memoryStore({ etagOnRead: true });
  await s.setJSON('room-talk-the-den', { day: '2000-01-01', messages: [{ id: 'old', t: 1 }] }, { onlyIfNew: true });
  await updateRoomTalk('faery-yurt', (list) => { list.push({ id: 'new', t: Date.now() }); return list; }, s);
  assert.deepEqual((await readRoomTalk('the-den', s)).messages, [], 'a message past its time is not returned before the sweep');
  assert.equal(await sweepRoomTalk(s), true);
  assert.deepEqual(s.keys().filter((k) => k.startsWith('room-talk-')), ['room-talk-faery-yurt']);
  assert.equal(roomTag('../channel'), null);
});

/* ── How long a message stays ── */

// 2026-10-19 00:00 in Colorado: what was sent before it keeps the promise it
// was sent under, gone at that midnight; what was sent after it stays 48 hours.
const CHANGE = Date.UTC(2026, 9, 19, 6, 0);

test('a message stays 48 hours from when it was sent, and one sent before the change goes at its midnight', () => {
  const after = CHANGE + 3 * 60 * 60 * 1000;
  assert.equal(onAir({ t: after }, after + LIFE - 1), true, 'a message is on air until its 48 hours are up');
  assert.equal(onAir({ t: after }, after + LIFE), false, 'and not a moment after');
  assert.equal(onAir({ t: after }, after + 30 * 60 * 60 * 1000), true, 'midnight in Colorado no longer clears it');
  const evening = CHANGE - 60 * 60 * 1000;   // 23:00 on 2026-10-18, in Colorado
  assert.equal(onAir({ t: evening }, CHANGE - 1), true, 'sent before the change, it is there until midnight');
  assert.equal(onAir({ t: evening }, CHANGE), false, 'and gone at midnight, as it was promised when it was sent');
  assert.equal(onAir({ id: 'no-time' }, after), false, 'a message with no time is on nobody\'s channel');
});

test('a channel keeps fifty, and the fifty-first pushes the oldest off', async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.equal(KEEP, 50);
  assert.equal(LIFE, 48 * 60 * 60 * 1000);
  for (let i = 0; i <= KEEP; i++) await updateChannel((l) => [...l, { id: `m${i}`, t: Date.now() }], s);
  const ids = (await readChannel(s)).messages.map((m) => m.id);
  assert.equal(ids.length, KEEP);
  assert.equal(ids[0], 'm1', 'the oldest went');
  assert.equal(ids[ids.length - 1], `m${KEEP}`);
});

test('the sweep takes what is past its 48 hours out of a channel and keeps the rest', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = CHANGE + 5 * 24 * 60 * 60 * 1000;
  const hour = 60 * 60 * 1000;
  await s.setJSON('channel', { messages: [{ id: 'old', t: now - LIFE - hour }, { id: 'night', t: now - 30 * hour }, { id: 'new', t: now - hour }] }, { onlyIfNew: true });
  assert.deepEqual((await readChannel(s, now)).messages.map((m) => m.id), ['night', 'new'], 'what is past its time is not heard before the sweep');
  assert.equal(await sweep(s, now), true);
  assert.deepEqual((await s.get('channel')).messages.map((m) => m.id), ['night', 'new'], 'the sweep took it out of the blob');
  assert.equal(await sweep(s, now), false, 'and has nothing more to do');
  assert.equal(await sweep(s, now + LIFE), true);
  assert.ok(!s.keys().includes('channel'), 'a channel with nothing left on air is deleted');
  await s.setJSON('room-talk-the-den', { messages: [{ id: 'old', t: now - LIFE }, { id: 'new', t: now - hour }] }, { onlyIfNew: true });
  assert.equal(await sweepRoomTalk(s, now), true);
  assert.deepEqual((await readRoomTalk('the-den', s, now)).messages.map((m) => m.id), ['new'], 'a room\'s channel keeps the same 48 hours');
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

/* The World call: Ryan, 2026-10-13. A call like a room's, under one name, for
   anybody signed on and never for a guest. */
test('the World call is one call for anybody signed on, and never a guest\'s', async () => {
  assert.equal(WORLD_CALL, 'world');
  const t = open(callToken(ada, WORLD_CALL, Date.now(), key));
  assert.equal(t.ok, true);
  assert.equal(t.body.room, 'stimpunks-world', 'one room, never *');
  assert.equal(callToken({ role: 'guest', handle: 'Visitor' }, WORLD_CALL, Date.now(), key), null, 'no guest token for it');
  assert.equal(callEventRoom(`${JAAS_APP}/stimpunks-world`), WORLD_CALL, '8x8 telling us who is in it is believed');
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  await callEvent({ eventType: 'PARTICIPANT_JOINED', fqn: `${JAAS_APP}/stimpunks-world`, timestamp: now,
    data: { name: 'Ada', participantId: 'w1' } }, s, now);
  assert.deepEqual(await callsOn(bex, s, now + 1), [WORLD_CALL], 'Who\'s online names it for anybody signed on');
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
    'town-hall-moderators': ['Ryan', 'Chelsea', 'Becky', 'Sam'], 'town-hall-executive-session': ['Ryan', 'Becky'],
    // The cabin behind the door marked E: administrators, and no other role.
    'the-secret-cabin': ['Ryan'], 'lydtyss': ['Ryan'] };
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

test('the cabin is the administrators\' on the CB, and stays quiet even to them outside it', async () => {
  const s = memoryStore({ etagOnRead: true });
  for (const who of [ada, plainMod, director, boardie]) {
    assert.equal((await hostBeacon(who, 'lydtyss', 'A record', 1, true, s)).closed, true, `${who.handle} cannot host there`);
  }
  await hostBeacon(admin, 'lydtyss', 'A record', 1, true, s);
  const all = await readBeacons(s);
  assert.deepEqual(shapeBeacons(all, admin, 'lydtyss').map((b) => b.room), ['lydtyss'], 'an administrator tuned in there hears it');
  assert.deepEqual(shapeBeacons(all, admin).map((b) => b.room), [], 'and not from anywhere else: the room still keeps to itself');
  assert.deepEqual(shapeBeacons(all, plainMod, 'lydtyss').map((b) => b.room), [], 'a moderator who is not an administrator hears nothing of it');
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
  assert.equal(carriesMetadata(new Uint8Array([0xff, 0xd8, 0xff, 0xed, 0x00, 0x38, ...Buffer.from('Photoshop 3.0\0'), 0, 0]), 'image/jpeg'), true, 'IPTC can name a place');
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
  assert.deepEqual(droppedImages(before, before.slice(1)), [pushed], 'a message pushed off takes its picture with it');
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
  assert.deepEqual(await beSeen(bex, 'the-den', V('b'), s, now + 1), [{ handle: 'Ada', base: false, claimed: false }]);
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

/* Who's online: Ryan, 2026-10-07. */
const claimed = (h) => ({ role: 'mobile', handle: h, roles: new Set(), account: true });

test("who's online is everybody seen, in alphabetical order, with their rooms, for anybody signed on", async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  await beSeen(claimed('Ryan'), 'the-den', V('r'), s, now);
  await beSeen(claimed('Ryan'), 'the-mopery', V('q'), s, now);
  await beSeen(bex, 'the-garden', V('b'), s, now);
  await beSeen({ role: 'mobile', handle: 'Ryan' }, 'the-garden', V('x'), s, now);
  assert.deepEqual(await whoSeen(ada, s, now + 1), [
    { handle: 'Bex', base: false, claimed: false, rooms: ['the-garden'] },
    { handle: 'Ryan', base: false, claimed: true, rooms: ['the-den', 'the-mopery'] },
    { handle: 'Ryan', base: false, claimed: false, rooms: ['the-garden'] },
  ], 'one row per handle, two tabs are two rooms, and a claimed name is marked apart from an unclaimed one');
  assert.deepEqual(await whoSeen(ada, s, now + ROOM_FRESH + 1), [], 'shown after its thirty seconds');
});

test("who's online leaves out a room the asker may not enter, and the claimed mark comes from the pass", async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  const board = { role: 'base', handle: 'Cy', roles: new Set(['moderator', 'board']), account: true };
  await beSeen(board, 'town-hall-board', V('c'), s, now);
  await beSeen(board, 'the-den', V('d'), s, now);
  await beSeen({ role: 'base', handle: 'Dee', roles: new Set(['moderator', 'board']) }, 'town-hall-board', V('e'), s, now);
  assert.deepEqual(await whoSeen(ada, s, now + 1), [{ handle: 'Cy', base: true, claimed: true, rooms: ['the-den'] }],
    'the board room is not named to somebody it is not for, and somebody seen only there is not listed');
  assert.deepEqual((await whoSeen(board, s, now + 1)).map((p) => [p.handle, p.rooms]),
    [['Cy', ['the-den', 'town-hall-board']], ['Dee', ['town-hall-board']]]);
  assert.equal((await whoSeen(board, s, now + 1))[1].claimed, false, 'the MOD password is not a claimed username');
});

/* A room that keeps to itself: Ryan, 2026-10-07, "in room only, nothing
   announced outside". Broken on purpose first: without the tuned filter the
   World listen heard the cabin's host, and without the quiet check Who's
   online listed the cabin. */
test('a room that keeps to itself is heard only inside it, and is never on who\'s online', async () => {
  assert.ok(QUIET_ROOMS.length && QUIET_ROOMS.every((t) => quietRoom(t) === t), 'every quiet room is one');
  const quiet = QUIET_ROOMS[0];
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  // Hosted by an administrator, because the cabin is theirs on the CB (MOD_ROOMS),
  // and heard by one: what is tested here is where it is heard, not who may.
  const keyholder = { role: 'base', handle: 'Ryan', roles: new Set(['moderator', 'administrator']) };
  await hostBeacon(keyholder, quiet, 'Film', 1, true, s, now);
  await hostBeacon(bex, 'the-den', 'Film', 1, true, s, now);
  const list = await readBeacons(s, now + 1);
  const rooms = (tuned) => shapeBeacons(list, keyholder, tuned).map((b) => b.room).sort();
  assert.deepEqual(rooms(null), ['the-den'], 'a radio tuned to World does not hear the quiet room\'s host');
  assert.deepEqual(rooms('the-den'), ['the-den'], 'nor does a radio tuned to another room');
  assert.deepEqual(rooms(quiet), [quiet, 'the-den'].sort(), 'a radio tuned to the quiet room hears its host');
  await beSeen(claimed('Ryan'), quiet, V('r'), s, now);
  await beSeen(claimed('Ryan'), 'the-den', V('q'), s, now);
  await beSeen(bex, quiet, V('b'), s, now);
  assert.deepEqual((await whoSeen(ada, s, now + 1)).map((p) => [p.handle, p.rooms]), [['Ryan', ['the-den']]],
    'the quiet room is named to nobody, and somebody seen only there is on nobody\'s list');
  assert.deepEqual((await whoSeen(claimed('Ryan'), s, now + 1)).map((p) => [p.handle, p.rooms]), [['Ryan', ['the-den']]],
    'not even to somebody seen in it: who is there is the room\'s own Be seen here');
});

test('a claimed record parses, and so do an old one with no mark and one from the first day', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  const b = (h) => Buffer.from(h).toString('base64url');
  await s.set(`room-here/the-den/${V('o')}.${now}.mobile.${b('Old')}`, '');
  await s.set(`room-here/the-den/${V('f')}.${now}.mobile.find.${b('First')}`, '');
  assert.deepEqual((await whoSeen(ada, s, now + 1)).map((p) => [p.handle, p.claimed]), [['First', true], ['Old', false]]);
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

/* Every call with somebody in it, on Who's online: Ryan, 2026-10-13. The
   room and nothing else, under whoSeen's rules. Broken on purpose first:
   without roomAllows the board room's call was named to everybody, and
   without quietRoom the cabin's was. */
test("who's online names every room whose call has somebody in it, and only the room", async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  const in_ = (tag, name, id, at = now) => callEvent({ eventType: 'PARTICIPANT_JOINED', fqn: `${JAAS_APP}/stimpunks-${tag}`,
    timestamp: at, data: { name, participantId: id } }, s, now);
  await in_('the-den', 'Sam', 'c1');
  await in_('the-den', 'Ada', 'c2');
  await in_('cavendish-events', 'A guest', 'c3');
  await in_('town-hall-board', 'Cy', 'c4');
  await in_(QUIET_ROOMS[0], 'Ryan', 'c5');
  assert.deepEqual(await callsOn(ada, s, now + 1), ['cavendish-events', 'the-den'],
    'each room once, alphabetical, no names and no number; the board room and the quiet room left out');
  const board = { role: 'base', handle: 'Cy', roles: new Set(['moderator', 'board']) };
  assert.deepEqual(await callsOn(board, s, now + 1), ['cavendish-events', 'the-den', 'town-hall-board'],
    'the board room is named to the people it is for');
  const keyholder = { role: 'base', handle: 'Ryan', roles: new Set(['moderator', 'administrator']) };
  assert.ok(!(await callsOn(keyholder, s, now + 1)).includes(QUIET_ROOMS[0]), 'a quiet room is named to nobody, not even its keyholders');
  await callEvent({ eventType: 'PARTICIPANT_LEFT', fqn: `${JAAS_APP}/stimpunks-cavendish-events`, timestamp: now + 2,
    data: { participantId: 'c3' } }, s, now);
  assert.deepEqual(await callsOn(ada, s, now + 3), ['the-den'], 'a call nobody is left in is not named');
  assert.deepEqual(await callsOn(ada, s, now + (CALL_HOURS + 2) * 3600 * 1000), [], 'older than a token can be');
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

/* ── Avatars ───────────────────────────────────────────────────────────────
   A look is a list of choices and nothing else; keeping, changing, deleting
   and wearing one lose nothing under the race every other write here runs; the
   one worn on the CB is shown beside a claimed name only, and Forget Me and
   deleting the username take it off first. */
const bodyOf = () => Object.fromEntries(Object.entries(AVATAR.body).map(([k, v]) => [k, AVATAR.multi.includes(k) ? [] : v[0]]));
const lookOf = (wear = {}) => ({ base: 'bodymind', body: bodyOf(), wear });

test('a look holds only what the lists hold', () => {
  assert.ok(cleanLook(lookOf({ head: ['beanie', 'solid', 'black'] })));
  assert.ok(cleanLook({ base: 'stand', wear: { top: ['tee', 'stripes', 'rainbow'] } }));
  assert.equal(cleanLook({ base: 'doll', wear: {} }), null);
  assert.equal(cleanLook({ ...lookOf(), body: { ...bodyOf(), skin: 'peach' } }), null);
  assert.equal(cleanLook(lookOf({ head: ['haori', 'solid', 'black'] })), null, 'a jacket on a head');
  assert.equal(cleanLook(lookOf({ cape: ['cape', 'solid', 'black'] })), null, 'a slot the stand has not got');
  assert.equal(cleanLook({ base: 'stand', wear: JSON.parse('{"__proto__":["a","b","c"]}') }), null);
  assert.equal(cleanLook({ base: 'stand', wear: { top: ['tee', 'constructor', 'black'] } }), null);
  assert.equal(cleanLook({ ...lookOf(), body: { ...bodyOf(), pose: 'wheelchair', hands: 'cane' } }), null, 'a cane leaning on nothing');
  const extra = cleanLook({ ...lookOf(), picture: 'data:image/png;base64,AAAA', body: { ...bodyOf(), photo: 'x' } });
  assert.equal(extra.picture, undefined, 'a picture rode along on a look');
  assert.equal(extra.body.photo, undefined);
});

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`avatars kept fifteen at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => keepAvatar('pkA', { look: lookOf(), name: `n${i}` }, s, i)));
    const worked = told.filter((r) => r.status === 'fulfilled' && r.value.kept).map((r) => r.value.kept.id);
    const kept = new Set((await readAvatars('pkA', s)).avatars.map((a) => a.id));
    assert.deepEqual(worked.filter((id) => !kept.has(id)), [], 'an avatar that was told it was kept is not there');
    for (const r of told) if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
    if (etagOnRead) assert.equal(worked.length, 15);
  });
}

test('keeping stops at the limit, and changing, wearing and deleting one move what Who\'s online shows', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  for (let i = 0; i < AVATAR_KEEP; i++) await keepAvatar('pkB', { look: lookOf() }, s, i);
  assert.equal((await keepAvatar('pkB', { look: lookOf() }, s)).error, 'full');
  assert.equal((await keepAvatar('pkC', { look: { base: 'doll' } }, s)).error, 'look');
  await claimAccount('Ada', 'a long enough phrase', s, 9, null);
  const pk = petKey('Ada');
  const a = (await keepAvatar(pk, { look: lookOf({ top: ['tee', 'solid', 'black'] }), name: 'Saloon', about: 'in a hat' }, s)).kept;
  const b = (await keepAvatar(pk, { look: { base: 'stand', wear: {} } }, s)).kept;
  const people = [{ handle: 'Ada', claimed: true, rooms: [] }, { handle: 'Bex', claimed: false, rooms: [] }];
  assert.equal((await withAvatars(people, s))[0].avatar, undefined, 'shown before it was worn');
  await wearAvatar(pk, a.id, s);
  let shown = await withAvatars(people, s);
  assert.deepEqual(shown[0].avatar, { look: a.look, about: 'in a hat' });
  assert.equal(shown[1].avatar, undefined);
  // The same handle unclaimed is never shown, whatever the blob holds.
  assert.equal((await withAvatars([{ handle: 'Ada', claimed: false, rooms: [] }], s))[0].avatar, undefined, 'an unclaimed name wore an avatar');
  await editAvatar(pk, a.id, { look: lookOf({ top: ['gown', 'sequins', 'violet-gold'] }), about: 'in a gown' }, s);
  shown = await withAvatars(people, s);
  assert.equal(shown[0].avatar.look.wear.top[0], 'gown', 'a change to the worn one did not reach Who\'s online');
  assert.equal(shown[0].avatar.about, 'in a gown');
  await wearAvatar(pk, b.id, s);
  assert.equal((await withAvatars(people, s))[0].avatar.look.base, 'stand');
  await removeAvatar(pk, b.id, s);
  assert.equal((await withAvatars(people, s))[0].avatar, undefined, 'a deleted avatar is still worn');
  assert.equal((await readAvatars(pk, s)).wearing, null);
  await wearAvatar(pk, a.id, s);
  await wearAvatar(pk, null, s);
  assert.equal((await withAvatars(people, s))[0].avatar, undefined, 'taken off and still shown');
  await wearAvatar(pk, a.id, s);
  await forgetAvatars(pk, s);
  assert.equal((await withAvatars(people, s))[0].avatar, undefined, 'forgotten and still shown');
  assert.deepEqual((await readAvatars(pk, s)).avatars, []);
  const c = (await keepAvatar(pk, { look: lookOf() }, s)).kept;
  await wearAvatar(pk, c.id, s);
  await deleteAccount('Ada', s);
  assert.equal((await withAvatars(people, s))[0].avatar, undefined, 'a deleted username still wears its avatar');
  assert.deepEqual((await readAvatars(pk, s)).avatars, [], 'a deleted username kept its avatars');
}));

test('an avatar sticker is only ever your own avatar, and carries nothing but the look and its words', async () => {
  const s = memoryStore({ etagOnRead: true });
  const a = (await keepAvatar(petKey('Ada'), { look: lookOf(), name: 'Me', about: 'as I am' }, s)).kept;
  assert.equal(await avatarSticker('Bex', a.id, s), null, 'a sticker of somebody else\'s avatar');
  const st = await avatarSticker('Ada', a.id, s);
  assert.deepEqual(Object.keys(st).sort(), ['about', 'look', 'name']);
  assert.ok(shapeAvatarSticker(st));
  assert.equal(shapeAvatarSticker({ look: { base: 'doll' }, name: 'x' }), null);
});

test('a profile shows the avatar worn, first, and the rest only when a claimed username says so', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const pk = petKey('Ada');
  const a = (await keepAvatar(pk, { look: lookOf({ top: ['tee', 'solid', 'black'] }), name: 'Saloon', about: 'in a hat' }, s, 1)).kept;
  const b = (await keepAvatar(pk, { look: { base: 'stand', wear: {} }, name: 'Bare', about: 'the stand' }, s, 2)).kept;
  await wearAvatar(pk, a.id, s);
  // Unclaimed: nothing, the same answer as nobody at all, even with the switch somehow on.
  await setAvatarsShown('Ada', true, s, 3);
  assert.equal(await shownAvatars('Ada', s), null, 'an unclaimed handle showed its avatars');
  assert.equal(await shownAvatars('Nobody', s), null);
  await claimAccount('Ada', 'a long enough phrase', s, 9, null);
  await setAvatarsShown('Ada', false, s);
  let got = await shownAvatars('ada', s);
  assert.equal(got.handle, 'Ada');
  assert.deepEqual(got.wearing, { look: a.look, about: 'in a hat' });
  assert.equal(got.shown, false);
  assert.equal(got.avatars, undefined, 'the rest were shown with the switch off');
  await setAvatarsShown('Ada', true, s, 10);
  assert.equal(await avatarsShown('Ada', s), true);
  got = await shownAvatars('Ada', s);
  assert.deepEqual(got.avatars.map((x) => [x.name, x.worn]), [['Saloon', true], ['Bare', false]], 'the worn one is not first');
  assert.equal(got.avatars[0].id, undefined, 'a profile carries an id');
  assert.equal(got.avatars[0].t, undefined, 'a profile carries a date');
  await forgetAvatars(pk, s);
  assert.equal(await avatarsShown('Ada', s), false, 'Forget me left the switch on');
  got = await shownAvatars('Ada', s);
  assert.equal(got.wearing, null);
  await setAvatarsShown('Ada', true, s, 11);
  await deleteAccount('Ada', s);
  assert.equal(await shownAvatars('Ada', s), null, 'a deleted username still has a profile');
}));

/* ── Chimeras kept from Chimera Obscura ─────────────────────────────────────
   A list of choices and a name, never a picture and nothing about when; the
   avatars' arrangement, under the same scrambled handle. */
const partsOf = (over = {}) => {
  const p = Object.fromEntries(CHIMERA.slots.map((k) => [k, k === 'back' ? 'none' : CHIMERA.animals[0]]));
  return { ...p, ...over };
};

test('a chimera holds exactly its parts, each an animal on the shelf', () => {
  assert.ok(cleanChimera(partsOf()));
  assert.equal(cleanChimera(null), null);
  assert.equal(cleanChimera([]), null);
  assert.equal(cleanChimera({ ...partsOf(), picture: 'data:image/png;base64,AAAA' }), null, 'a picture rode along');
  for (const k of CHIMERA.slots) {
    const less = partsOf(); delete less[k];
    // Arms and feet became parts after chimeras were kept, so a chimera
    // without them takes its body's.
    if (CHIMERA.defaults[k]) assert.deepEqual(cleanChimera(less), partsOf(), `no ${k} should take the ${CHIMERA.defaults[k]}'s`);
    else assert.equal(cleanChimera(less), null, `no ${k}`);
    assert.equal(cleanChimera(partsOf({ [k]: 'unicorn' })), null, `a ${k} the shelf does not have`);
  }
  const kept = partsOf({ body: CHIMERA.animals[1] }); delete kept.arms; delete kept.feet;
  const back = cleanChimera(kept);
  assert.equal(back.arms, CHIMERA.animals[1]); assert.equal(back.feet, CHIMERA.animals[1]);
  const noBack = CHIMERA.animals.find((x) => !CHIMERA.backs.includes(x));
  if (noBack) assert.equal(cleanChimera(partsOf({ back: noBack })), null, 'a back from an animal that has none');
  assert.equal(cleanChimera(partsOf({ body: 'none' })), null);
  assert.equal(cleanChimera(JSON.parse('{"__proto__": {"body": "bear"}}')), null);
  assert.equal(cleanChimera(Object.create(partsOf())), null, 'inherited parts');
});

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`chimeras kept fifteen at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => keepChimera('pkA', { parts: partsOf(), name: `n${i}` }, s)));
    const worked = told.filter((r) => r.status === 'fulfilled' && r.value.kept).map((r) => r.value.kept.id);
    const kept = new Set((await readChimeras('pkA', s)).chimeras.map((c) => c.id));
    assert.deepEqual(worked.filter((id) => !kept.has(id)), [], 'a chimera that was told it was kept is not there');
    for (const r of told) if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
    if (etagOnRead) assert.equal(worked.length, 15);
  });
}

test('keeping chimeras stops at the limit; renaming, deleting, Forget me and deleting the username work', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  for (let i = 0; i < CHIMERA_KEEP; i++) await keepChimera('pkB', { parts: partsOf() }, s);
  assert.equal((await keepChimera('pkB', { parts: partsOf() }, s)).error, 'full');
  assert.equal((await keepChimera('pkC', { parts: { body: 'unicorn' } }, s)).error, 'parts');
  await claimAccount('Ada', 'a long enough phrase', s, 9, null);
  const pk = petKey('Ada');
  const a = (await keepChimera(pk, { parts: partsOf(), name: 'Otto' }, s)).kept;
  assert.deepEqual(Object.keys(a).sort(), ['id', 'name', 'parts'], 'a chimera kept something more than its parts and name');
  await editChimera(pk, a.id, { name: 'Ottilie' }, s);
  assert.equal((await readChimeras(pk, s)).chimeras[0].name, 'Ottilie');
  assert.equal((await editChimera(pk, a.id, { parts: { body: 'unicorn' } }, s)).error, 'parts');
  assert.equal((await editChimera(pk, 'hNOTANIDxyz', { name: 'x' }, s)).error, 'which');
  const b = (await keepChimera(pk, { parts: partsOf() }, s)).kept;
  await removeChimera(pk, b.id, s);
  assert.deepEqual((await readChimeras(pk, s)).chimeras.map((c) => c.id), [a.id]);
  await setChimerasShown('Ada', true, s, 10);
  await forgetChimeras(pk, s);
  assert.deepEqual((await readChimeras(pk, s)).chimeras, []);
  assert.equal(await chimerasShown('Ada', s), false, 'Forget me left the switch on');
  await keepChimera(pk, { parts: partsOf() }, s);
  await deleteAccount('Ada', s);
  assert.deepEqual((await readChimeras(pk, s)).chimeras, [], 'a deleted username kept its chimeras');
}));

test('a chimera sticker is only ever your own chimera, and carries nothing but its parts and name', async () => {
  const s = memoryStore({ etagOnRead: true });
  const a = (await keepChimera(petKey('Ada'), { parts: partsOf(), name: 'Otto' }, s)).kept;
  assert.equal(await chimeraSticker('Bex', a.id, s), null, 'a sticker of somebody else\'s chimera');
  const st = await chimeraSticker('Ada', a.id, s);
  assert.deepEqual(Object.keys(st).sort(), ['name', 'parts']);
  assert.ok(shapeChimeraSticker(st));
  assert.equal(shapeChimeraSticker({ parts: { body: 'unicorn' }, name: 'x' }), null);
  const out = shapeMessages([{ id: 'm1', handle: 'Ada', text: '', t: 1, chimera: st }])[0];
  assert.deepEqual(out.chimera, { parts: st.parts, name: 'Otto' }, 'the channel dropped a chimera sticker');
});

test('a profile shows chimeras only when a claimed username says so, and never their ids', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const pk = petKey('Ada');
  await keepChimera(pk, { parts: partsOf(), name: 'Otto' }, s);
  await keepChimera(pk, { parts: partsOf(), name: 'Bea' }, s);
  await setChimerasShown('Ada', true, s, 3);
  assert.equal(await shownChimeras('Ada', s), null, 'an unclaimed handle showed its chimeras');
  assert.equal(await shownChimeras('Nobody', s), null);
  await claimAccount('Ada', 'a long enough phrase', s, 9, null);
  await setChimerasShown('Ada', false, s);
  let got = await shownChimeras('ada', s);
  assert.equal(got.handle, 'Ada');
  assert.equal(got.shown, false);
  assert.equal(got.chimeras, undefined, 'shown with the switch off');
  await setChimerasShown('Ada', true, s, 10);
  got = await shownChimeras('Ada', s);
  assert.deepEqual(got.chimeras.map((c) => c.name), ['Bea', 'Otto'], 'not newest first');
  assert.equal(got.chimeras[0].id, undefined, 'a profile carries an id');
  await deleteAccount('Ada', s);
  assert.equal(await shownChimeras('Ada', s), null, 'a deleted username still shows chimeras');
}));

/* ── Props ────────────────────────────────────────────────────────────────
   Nothing goes up until its person confirms it; only a claimed username gives
   or keeps props; one waiting from each writer; nothing about when and nothing
   counted; the writer's mark never leaves the server; and gone with Forget me
   and with the username. */
const writer = (handle, since = 1, role = 'mobile') => ({ role, handle, roles: new Set(), account: true, since });

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`fifteen people giving one person props at once, ${how}: none told it worked is missing`, () => withPasswords(async () => {
    const s = memoryStore({ etagOnRead });
    await claimAccount('Ada', 'a long enough phrase', s, 9, null);
    await setPropsOpen(petKey('Ada'), true, s);
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => giveProp('Ada', writer(`W${i}`, i + 1), `Thank you, ${i}.`, s)));
    const worked = told.filter((r) => r.status === 'fulfilled' && r.value.given).map((r) => r.value.given.id);
    const kept = new Set((await readProps(petKey('Ada'), s)).waiting.map((p) => p.id));
    assert.deepEqual(worked.filter((id) => !kept.has(id)), [], 'a prop that was told it was given is not there');
    for (const r of told) if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
    if (etagOnRead) assert.equal(worked.length, 15);
  }));
}

test('props wait for their person, only a claimed username gives them, and nothing about when is kept', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.equal((await giveProp('Ada', writer('Bex'), 'Thanks!', s)).error, 'closed', 'props given to a handle nobody has claimed');
  await claimAccount('Ada', 'a long enough phrase', s, 9, null);
  assert.equal((await giveProp('Ada', writer('Bex'), 'Thanks!', s)).error, 'closed', 'props given while the tab is shut');
  const pk = petKey('Ada');
  await setPropsOpen(pk, true, s);
  assert.equal((await giveProp('Ada', { role: 'mobile', handle: 'Bex', roles: new Set() }, 'Thanks!', s)).error, 'claim', 'an unclaimed handle gave props');
  assert.equal((await giveProp('Ada', { role: 'base', handle: 'Mo', roles: new Set() }, 'Thanks!', s)).error, 'claim', 'the shared moderators’ password gave props');
  assert.equal((await giveProp('Ada', writer('Bex'), '   \n ', s)).error, 'empty');
  assert.equal((await giveProp('Ada', writer('Bex'), 'x'.repeat(PROP_MAX + 1), s)).error, 'long');
  assert.equal((await giveProp('ada', writer('ADA'), 'Me!', s)).error, 'self');
  assert.equal(cleanProp('one\r\ntwo\n\n\n\nthree  '), 'one\ntwo\n\nthree', 'a prop lost its lines');
  const g = await giveProp('ada', writer('Bex'), 'Thank you for the spoons.', s);
  assert.equal(g.handle, 'Ada');
  assert.deepEqual(Object.keys(g.given).sort(), ['by', 'handle', 'id', 'text'], 'a prop kept something more than its words, its writer and an id');
  assert.equal((await giveProp('Ada', writer('Bex'), 'And again.', s)).error, 'waiting', 'two props from one writer waiting at once');
  const base = await giveProp('Ada', writer('Mo', 4, 'base'), 'Thanks from the desk.', s);
  assert.equal(base.given.base, true);
  for (let i = 2; i < PROPS_WAITING; i++) await giveProp('Ada', writer(`W${i}`, 100 + i), 'Thanks.', s);
  assert.equal((await giveProp('Ada', writer('Late', 999), 'Thanks.', s)).error, 'full');
  const d = await readProps(pk, s);
  assert.equal(d.waiting.length, PROPS_WAITING);
  assert.deepEqual(d.props, [], 'a prop went up before its person confirmed it');
  // What anybody else sees: nothing waiting but their own, and never a mark.
  let seen = await shownProps('Ada', writer('Cy', 7), s);
  assert.deepEqual(seen.props, [], 'something showed before it was confirmed');
  assert.deepEqual(seen.waiting, [], 'somebody saw props they did not write');
  assert.equal(seen.yours, undefined, 'somebody else was told whether anything is waiting');
  seen = await shownProps('Ada', writer('Bex'), s);
  assert.deepEqual(seen.waiting.map((p) => p.text), ['Thank you for the spoons.']);
  assert.equal(seen.waiting[0].mine, true);
  assert.equal(seen.waiting[0].by, undefined, 'the writer’s mark left the server');
  assert.equal((await shownProps('Ada', writer('Ada', 9), s)).yours, true, 'its person was not told something is waiting');
  // Confirm and reject.
  assert.equal((await confirmProp(pk, 'rNOTANIDxyz', s)).error, 'which');
  await confirmProp(pk, g.given.id, s);
  await rejectProp(pk, base.given.id, s);
  const after = await readProps(pk, s);
  assert.deepEqual(after.props.map((p) => p.id), [g.given.id]);
  assert.ok(!after.waiting.some((p) => p.id === g.given.id || p.id === base.given.id), 'a confirmed or rejected prop is still waiting');
  seen = await shownProps('Ada', { role: 'mobile', handle: 'Anon', roles: new Set() }, s);
  assert.deepEqual(seen.props, [{ id: g.given.id, text: 'Thank you for the spoons.', handle: 'Bex', base: false, claimed: true }]);
  assert.deepEqual(seen.waiting, []);
  const own = ownProps(after);
  assert.equal(own.props[0].by, undefined, 'its own person was sent a writer’s mark');
  assert.ok(!JSON.stringify(after).match(/"t"|time|when|since|count/), 'the record keeps a time or a count');
  // Shut, the tab shows nothing, and keeps what was confirmed for when it opens.
  await setPropsOpen(pk, false, s);
  seen = await shownProps('Ada', writer('Cy', 7), s);
  assert.equal(seen.shown, false);
  assert.equal(seen.props, undefined, 'a shut tab showed its props');
  await setPropsOpen(pk, true, s);
  assert.equal((await shownProps('Ada', writer('Cy', 7), s)).props.length, 1, 'opening the tab again lost what was confirmed');
}));

test('a prop comes off for its person, its writer and the base, and for nobody else', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  await claimAccount('Ada', 'a long enough phrase', s, 9, null);
  const pk = petKey('Ada');
  await setPropsOpen(pk, true, s);
  const give = async (who, text) => (await giveProp('Ada', who, text, s)).given.id;
  const a = await give(writer('Bex', 2), 'one');
  const b = await give(writer('Cy', 3), 'two');
  const c = await give(writer('Di', 4), 'three');
  for (const id of [a, b, c]) await confirmProp(pk, id, s);
  const w = await give(writer('Bex', 2), 'four, waiting');
  assert.ok((await dropProp('Ada', writer('Eve', 5), a, s)).error, 'a stranger took a prop down');
  assert.ok((await dropProp('Ada', writer('Bex', 77), a, s)).error, 'a name claimed again by somebody else took its old owner’s prop back');
  assert.ok((await dropProp('Ada', { role: 'mobile', handle: 'Bex', roles: new Set() }, a, s)).error, 'an unclaimed handle took a claimed writer’s prop back');
  assert.ok((await dropProp('Ada', writer('Mo', 6, 'base'), w, s)).error, 'the base reached a prop that is waiting');
  assert.ok((await dropProp('Ada', writer('Ada', 9), w, s)).error, 'its person took a waiting prop off rather than rejecting it');
  assert.ok(!(await dropProp('Ada', writer('Bex', 2), w, s)).error, 'its writer could not take a waiting prop back');
  assert.ok(!(await dropProp('Ada', writer('Bex', 2), a, s)).error, 'its writer could not take a prop back');
  assert.ok(!(await dropProp('Ada', writer('Mo', 6, 'base'), b, s)).error, 'the base could not take a prop down');
  assert.ok(!(await dropProp('ada', writer('ADA', 9), c, s)).error, 'its person could not take a prop off');
  const d = await readProps(pk, s);
  assert.deepEqual([d.props, d.waiting], [[], []]);
}));

test('a full Props tab refuses to confirm, and Forget me and deleting the username delete props', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  await claimAccount('Ada', 'a long enough phrase', s, 9, null);
  const pk = petKey('Ada');
  await setPropsOpen(pk, true, s);
  for (let i = 0; i < PROPS_KEEP; i++) {
    const id = (await giveProp('Ada', writer(`W${i}`, i + 10), 'Thanks.', s)).given.id;
    await confirmProp(pk, id, s);
  }
  const extra = (await giveProp('Ada', writer('Late', 5), 'Thanks.', s)).given.id;
  assert.equal((await confirmProp(pk, extra, s)).error, 'full');
  assert.ok((await readProps(pk, s)).waiting.some((p) => p.id === extra), 'a refused confirmation lost the prop');
  await forgetProps(pk, s);
  assert.deepEqual(await readProps(pk, s), { open: false, waiting: [], props: [] }, 'Forget me left props');
  await setPropsOpen(pk, true, s);
  await giveProp('Ada', writer('Bex', 2), 'Thanks.', s);
  await deleteAccount('Ada', s);
  assert.deepEqual(await readProps(pk, s), { open: false, waiting: [], props: [] }, 'a deleted username kept its props');
  assert.equal(await shownProps('Ada', writer('Bex', 2), s), null, 'a deleted username still has a Props tab');
}));

/* ── Jobs kept from the Adventurer's Guild ──────────────────────────────────
   Which jobs and nothing about when; never more than what is on the board;
   kept only once keeping has started; shown only on a claimed username that
   says so; and gone with Forget me's half and with the username. */
test('a Profile can only hold jobs that are on the board', () => {
  assert.ok(QUEST_IDS.length >= 15, 'make-guild.py has not written the jobs into lib.mjs');
  assert.deepEqual(questIds([QUEST_IDS[0], QUEST_IDS[0]]), [QUEST_IDS[0]]);
  assert.equal(questIds(['no-such-job']), null);
  assert.equal(questIds(['__proto__']), null);
  assert.equal(questIds('street-chalk'), null);
  assert.equal(questIds([{ id: QUEST_IDS[0] }]), null);
});

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`jobs kept fifteen at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    await keepJobs('pkJ', [], true, s);
    const ids = QUEST_IDS.slice(0, 15);
    const told = await Promise.allSettled(ids.map((id) => keepJobs('pkJ', [id], false, s)));
    const kept = new Set(await readJobs('pkJ', s));
    told.forEach((r, i) => {
      if (r.status === 'fulfilled') assert.ok(kept.has(ids[i]), `${ids[i]} was told it was kept and is not there`);
      else assert.equal(r.reason.message, 'busy');
    });
    if (etagOnRead) assert.equal(kept.size, 15);
  });
}

test('jobs are kept only once keeping has started, sorted, with nothing about when', async () => {
  const s = memoryStore({ etagOnRead: true });
  const [a, b, c] = QUEST_IDS;
  assert.equal(await keepJobs('pkK', [a], false, s), null, 'kept without being switched on');
  assert.equal(await readJobs('pkK', s), null);
  assert.deepEqual(await keepJobs('pkK', [c, a], true, s), [a, c].sort());
  assert.deepEqual(await keepJobs('pkK', [b], false, s), [a, b, c].sort());
  const raw = await s.get('jobs/pkK', { type: 'json' });
  assert.deepEqual(Object.keys(raw), ['jobs'], 'the record holds something besides which jobs');
  await forgetJobs('pkK', s);
  assert.equal(await readJobs('pkK', s), null);
  assert.equal(await keepJobs('pkK', [a], false, s), null, 'a job kept after keeping was switched off');
});

test('jobs are shown only on a claimed username that says so, and go with it', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const pk = petKey('Ada');
  await keepJobs(pk, [QUEST_IDS[0]], true, s);
  await setJobsShown('Ada', true, s, 1);
  assert.equal(await shownJobs('Ada', s), null, 'an unclaimed handle showed its jobs');
  await claimAccount('Ada', 'a long enough phrase', s, 9, null);
  assert.deepEqual(await shownJobs('ada', s), { handle: 'Ada', jobs: [QUEST_IDS[0]] });
  await setJobsShown('Ada', false, s);
  assert.equal(await shownJobs('Ada', s), null, 'shown with the switch off');
  await setJobsShown('Ada', true, s, 2);
  await forgetJobs(pk, s);
  assert.equal(await jobsShown('Ada', s), false, 'stopping keeping left the switch on');
  await keepJobs(pk, [QUEST_IDS[1]], true, s);
  await setJobsShown('Ada', true, s, 3);
  await deleteAccount('Ada', s);
  assert.equal(await readJobs(pk, s), null, 'a deleted username kept its jobs');
  assert.equal(await s.get(`jobshown/${pk}`, { type: 'json' }), null, 'a deleted username left its switch');
}));

/* ── Patches for the battle jacket ───────────────────────────────────────────
   Which patches and nothing about when; only patches on the street; each
   taken once; shown only on a claimed username that says so; a sticker only
   of your own; and gone with Forget me's half and with the username. */
test('a jacket can only hold patches that are on the street', () => {
  assert.ok(PATCH_IDS.length >= 2, 'make-patches.py has not written the patches into lib.mjs');
  assert.equal(patchId(PATCH_IDS[0]), PATCH_IDS[0]);
  assert.equal(patchId('no-such-patch'), null);
  assert.equal(patchId('__proto__'), null);
  assert.equal(patchId(['x']), null);
});

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`patches taken all at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const ids = Array.from({ length: 15 }, (_, i) => PATCH_IDS[i % PATCH_IDS.length]);
    const told = await Promise.allSettled(ids.map((id) => takePatch('pkP', id, s)));
    const on = new Set(await readPatches('pkP', s));
    told.forEach((r, i) => {
      if (r.status === 'fulfilled') assert.ok(on.has(ids[i]), `${ids[i]} was told it was taken and is not on the jacket`);
      else assert.equal(r.reason.message, 'busy');
    });
    if (etagOnRead) {
      assert.equal(on.size, PATCH_IDS.length);
      assert.equal(told.filter((r) => r.value && r.value.taken).length, PATCH_IDS.length, 'a patch was taken twice');
    }
  });
}

test('a jacket keeps which patches, sorted, and nothing about when', async () => {
  const s = memoryStore({ etagOnRead: true });
  const [a, b] = PATCH_IDS;
  assert.deepEqual((await takePatch('pkQ', b, s)).taken, true);
  assert.deepEqual((await takePatch('pkQ', a, s)).patches, [a, b].sort());
  assert.equal((await takePatch('pkQ', a, s)).taken, false, 'the same patch taken twice');
  const raw = await s.get('patches/pkQ', { type: 'json' });
  assert.deepEqual(Object.keys(raw), ['patches'], 'the record holds something besides which patches');
  await forgetPatches('pkQ', s);
  assert.deepEqual(await readPatches('pkQ', s), []);
});

test('a jacket is shown only on a claimed username that says so, and a sticker is only your own patch', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const pk = petKey('Ada');
  await takePatch(pk, PATCH_IDS[0], s);
  assert.deepEqual(await patchSticker('Ada', PATCH_IDS[0], s), { patch: PATCH_IDS[0] });
  assert.equal(await patchSticker('Ada', PATCH_IDS[1], s), null, 'a sticker of a patch not on the jacket');
  assert.equal(await patchSticker('Bex', PATCH_IDS[0], s), null, 'a sticker of somebody else\'s patch');
  assert.deepEqual(shapePatchSticker({ patch: PATCH_IDS[0], extra: 'x' }), { patch: PATCH_IDS[0] });
  assert.equal(shapePatchSticker({ patch: 'nope' }), null);
  assert.equal(await jacketSticker('Bex', s), null, 'a sticker of a jacket with nothing sewn on');
  assert.deepEqual(await jacketSticker('Ada', s), { patches: [PATCH_IDS[0]] });
  await takePatch(petKey('Cy'), PATCH_IDS[0], s);
  const sent = await jacketSticker('Cy', s);
  await takePatch(petKey('Cy'), PATCH_IDS[1], s);
  assert.deepEqual(sent, { patches: [PATCH_IDS[0]] }, 'a jacket already sent changed when a patch was taken');
  assert.deepEqual(shapeJacketSticker({ patches: [PATCH_IDS[1], 'nope', PATCH_IDS[0], PATCH_IDS[1]], who: 'Ada' }),
    { patches: [PATCH_IDS[0], PATCH_IDS[1]].sort() });
  assert.equal(shapeJacketSticker({ patches: ['nope'] }), null);
  assert.equal(shapeJacketSticker({ patches: 'x' }), null);
  await setPatchesShown('Ada', true, s, 1);
  assert.equal(await shownPatches('Ada', s), null, 'an unclaimed handle showed its jacket');
  await claimAccount('Ada', 'a long enough phrase', s, 9, null);
  assert.deepEqual(await shownPatches('ada', s), { handle: 'Ada', patches: [PATCH_IDS[0]] });
  await setPatchesShown('Ada', false, s);
  assert.equal(await shownPatches('Ada', s), null, 'shown with the switch off');
  await setPatchesShown('Ada', true, s, 2);
  await forgetPatches(pk, s);
  assert.equal(await patchesShown('Ada', s), false, 'Forget me left the switch on');
  await takePatch(pk, PATCH_IDS[1], s);
  await setPatchesShown('Ada', true, s, 3);
  await deleteAccount('Ada', s);
  assert.deepEqual(await readPatches(pk, s), [], 'a deleted username kept its patches');
  assert.equal(await s.get(`patchshown/${pk}`, { type: 'json' }), null, 'a deleted username left its switch');
}));

/* ── Profiles ─────────────────────────────────────────────────────────── */

const fullProfile = (over = {}) => ({
  theme: 'lcars', banner: PROFILE_KEYS.banners[0], decoration: PROFILE_KEYS.decorations[0],
  frame: PROFILE_KEYS.frames[0], effect: PROFILE_KEYS.effects[0], face: PROFILE_KEYS.faces[1],
  plate: PROFILE_KEYS.banners[1], pronouns: 'they/them', bio: 'Line one.\n\nLine two.', links: ['https://example.org/me'],
  room: 'the-den', why: 'the carpet', ...over,
});

test('a profile holds only choices from the lists and words within their limits', () => {
  const ok = cleanProfile(fullProfile());
  assert.ok(ok.profile, ok.error);
  assert.deepEqual(Object.keys(ok.profile).sort(), ['banner', 'bio', 'decoration', 'effect', 'face', 'frame', 'links', 'plate', 'pronouns', 'room', 'theme', 'why'].sort());
  assert.ok(PROFILE_KEYS.frames.length && PROFILE_KEYS.effects.length, 'make-profile.py wrote no frames or no effects');
  assert.ok(cleanProfile(fullProfile({ frame: 'barbed-wire' })).error, 'a frame with no drawing');
  assert.ok(cleanProfile(fullProfile({ effect: 'strobe' })).error, 'an effect with no drawing');
  assert.ok(cleanProfile(fullProfile({ frame: PROFILE_KEYS.effects[0] })).error, 'an effect taken as a frame');
  assert.ok(cleanProfile({ frame: PROFILE_KEYS.frames[0] }).profile.frame, 'a card with only a frame');
  assert.equal(cleanProfile(fullProfile({ frame: '', effect: null })).profile.frame, '');
  assert.ok(cleanProfile(fullProfile({ theme: 'nope' })).error, 'a theme the radio has not got');
  assert.ok(cleanProfile(fullProfile({ theme: 'auto' })).error, 'Match my device is a rule, not a theme');
  assert.ok(cleanProfile(fullProfile({ banner: 'amber' })).error, 'a banner with no drawing');
  assert.ok(cleanProfile(fullProfile({ decoration: 'skull' })).error);
  assert.ok(cleanProfile(fullProfile({ face: 'Comic Sans MS' })).error, 'a face the street does not declare');
  assert.ok(cleanProfile(fullProfile({ room: QUIET_ROOMS[0] })).error, 'a quiet room named on a profile');
  assert.ok(cleanProfile(fullProfile({ room: 'Not A Tag' })).error);
  assert.ok(cleanProfile(fullProfile({ bio: 'x'.repeat(BIO_MAX + 1) })).error);
  assert.ok(cleanProfile(fullProfile({ links: Array.from({ length: PROFILE_LINKS + 1 }, (_, i) => `https://e${i}.org`) })).error);
  assert.ok(cleanProfile(fullProfile({ links: 'https://example.org' })).error, 'links that are not a list');
  assert.ok(cleanProfile({ ...fullProfile(), __proto__: { theme: 'x' } }).profile);
  for (const bad of ['javascript:alert(1)', 'https://stimpunks.world@elsewhere.example', 'https://localhost/x', 'ftp://example.org', 'example.org']) {
    assert.equal(cleanProfileLink(bad), null, `${bad} was taken as a link`);
  }
  assert.equal(cleanProfileLink('  https://example.org/a b  '), 'https://example.org/a b', 'a link is kept as typed');
  assert.deepEqual(cleanProfile(fullProfile({ links: ['https://a.org', '', 'https://a.org'] })).profile.links, ['https://a.org'], 'a link twice, or an empty one');
  assert.equal(cleanProfile(fullProfile({ room: '', why: 'because' })).profile.why, '', 'a why with no room');
  assert.equal(cleanBio('a\n\n\n\nb'), 'a\n\nb');
  assert.equal(cleanBio('   '), '');
  assert.equal(cleanProfile({ extra: 'x', since: 1 }).profile.since, undefined, 'a date rode along on a profile');
});

test('a profile is shown on a claimed username only, holds no date, and goes with Forget me and the username', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const pk = petKey('Ada');
  const p = cleanProfile(fullProfile()).profile;
  await keepProfile(pk, p, s);
  assert.equal(await shownProfile('Ada', s), null, 'an unclaimed handle showed a profile');
  assert.equal(await shownProfile('Nobody', s), null);
  await claimAccount('Ada', 'a long enough phrase', s, 9, null);
  const got = await shownProfile('ada', s);
  assert.equal(got.handle, 'Ada');
  assert.deepEqual(got.profile, p);
  const raw = await s.get(`profile/${pk}`, { type: 'json' });
  assert.deepEqual(Object.keys(raw).sort(), Object.keys(p).sort(), 'the record holds something besides the choices and words');
  const people = [{ handle: 'Ada', claimed: true, rooms: [] }, { handle: 'Bex', claimed: false, rooms: [] }];
  let shown = await withPlates(people, s);
  assert.equal(shown[0].plate, p.plate);
  assert.equal(shown[1].plate, undefined);
  assert.equal((await withPlates([{ handle: 'Ada', claimed: false, rooms: [] }], s))[0].plate, undefined, 'an unclaimed name wore a nameplate');
  await keepProfile(pk, { ...p, plate: '' }, s);
  assert.equal((await withPlates(people, s))[0].plate, undefined, 'a nameplate taken off is still shown');
  assert.equal(await keepProfile(pk, cleanProfile({}).profile, s), null);
  assert.equal(await readProfile(pk, s), null, 'an empty profile was kept');
  assert.deepEqual(await shownProfile('Ada', s), { handle: 'Ada', profile: null });
  await keepProfile(pk, p, s);
  await forgetProfile(pk, s);
  assert.equal(await readProfile(pk, s), null, 'Forget me left the profile');
  assert.equal((await withPlates(people, s))[0].plate, undefined, 'Forget me left the nameplate');
  await keepProfile(pk, p, s);
  await deleteAccount('Ada', s);
  assert.equal(await readProfile(pk, s), null, 'a deleted username kept its profile');
  assert.equal((await withPlates(people, s))[0].plate, undefined, 'a deleted username kept its nameplate');
}));

test('a moderator clears one card, keeps nothing about it, and leaves the username and everything under it', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const pk = petKey('Ada');
  const p = cleanProfile(fullProfile()).profile;
  assert.equal((await clearProfile('Ada', s)).error, 'That username has not been claimed.', 'an unclaimed handle had a card to clear');
  await claimAccount('Ada', 'a long enough phrase', s, 9, null);
  const worn = (await keepAvatar(pk, { look: lookOf(), name: 'Saloon' }, s)).kept;
  await wearAvatar(pk, worn.id, s);
  await keepProfile(pk, p, s);
  const people = [{ handle: 'Ada', claimed: true, rooms: [] }];
  assert.equal((await withPlates(people, s))[0].plate, p.plate);
  const account = await readAccount('Ada', s);
  const keys = s.keys().filter((k) => k !== `profile/${pk}`).sort();
  assert.deepEqual(await clearProfile('ada', s), { cleared: true, had: true });
  assert.equal(await readProfile(pk, s), null, 'the card is still there');
  assert.equal((await withPlates(people, s))[0].plate, undefined, 'the nameplate is still on Who\'s online');
  assert.deepEqual(await shownProfile('Ada', s), { handle: 'Ada', profile: null });
  assert.deepEqual(await readAccount('Ada', s), account, 'clearing a card changed the username, or signed it off');
  assert.equal((await readAvatars(pk, s)).wearing, worn.id, 'clearing a card took the avatar off');
  assert.deepEqual(s.keys().sort(), keys, 'clearing a card wrote something, or deleted something besides the card');
  assert.deepEqual(await clearProfile('Ada', s), { cleared: true, had: false });
  await keepProfile(pk, p, s);
  assert.deepEqual((await shownProfile('Ada', s)).profile, p, 'a cleared username could not fill in a new card');
}));

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`fifteen nameplates kept at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const names = Array.from({ length: 15 }, (_, i) => `P${i}`);
    const p = cleanProfile(fullProfile()).profile;
    const told = await Promise.allSettled(names.map((n) => keepProfile(petKey(n), p, s)));
    const worked = names.filter((_, i) => told[i].status === 'fulfilled');
    const shown = await withPlates(names.map((handle) => ({ handle, claimed: true, rooms: [] })), s);
    assert.deepEqual(worked.filter((n) => !shown.find((x) => x.handle === n).plate), [], 'a nameplate that was told it was kept is not on Who\'s online');
    for (const r of told) if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
    if (etagOnRead) assert.equal(worked.length, 15);
  });
}

/* ── The forums ──────────────────────────────────────────────────────────── */
import { FORUM_CATEGORIES, forumCat, forumAllows, forumNav, forumHome, forumLatest, forumCategory, forumTopic, readTopic,
  readForumIndex, searchForum, cbTranscript, startTopic, replyTopic, editPost, removePost, removeTopic, uncopyMessage,
  reactPost, moderateTopic, sweepForum, goesAt, publicAddress, previewFor, metaOf, playerInfo, loneLinks, authorMark, forumEditor } from './lib.mjs';

const fw = (handle, since, roles = null) => ({ role: roles ? 'base' : 'mobile', handle, since, account: true,
  roles: new Set(roles ? ['moderator', ...roles] : []) });
const ADA = fw('Ada', 100), ADA_AGAIN = fw('Ada', 900), BO = fw('Bo', 200);
const FMOD = fw('Ryan', 300, []), FBOARD = fw('Bea', 400, ['board']), FADMIN = fw('Al', 500, ['administrator']);
const NO_NET = async () => { throw new Error('the network was asked'); };
const DAYS = (n) => n * 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 9, 18, 12);

test('only a claimed username reads or writes the forums, and a staff category is sent to nobody else', async () => {
  const s = memoryStore({ etagOnRead: true });
  const typed = { role: 'mobile', handle: 'Cy', roles: new Set() };
  const sharedBase = { role: 'base', handle: 'Ryan', roles: new Set(['moderator']) };
  assert.deepEqual(forumNav(typed), [], 'an unclaimed handle was shown categories');
  assert.deepEqual(forumNav(sharedBase), [], 'a moderator on the shared password was shown categories');
  assert.match((await startTopic(typed, { cat: 'help-desk', title: 'Hi', body: 'x' }, s, T0, NO_NET)).error, /claimed usernames/);
  const staff = FORUM_CATEGORIES.filter((c) => c.see).map((c) => c.slug);
  assert.ok(staff.length, 'there are no staff categories to test');
  for (const slug of staff) assert.ok(!forumNav(ADA).some((c) => c.slug === slug), `${slug} was sent to a claimed username with no role`);
  assert.ok(forumNav(FBOARD).some((c) => c.slug === 'board') && !forumNav(FBOARD).some((c) => c.slug === 'directors'));
  assert.ok(staff.every((slug) => forumNav(FADMIN).some((c) => c.slug === slug)), 'an administrator could not see a staff category');
  assert.equal((await startTopic(ADA, { cat: 'board', title: 'Hi', body: 'x' }, s, T0, NO_NET)).error, 'There is no such category.');
  assert.match((await startTopic(ADA, { cat: 'announcements', title: 'Hi', body: 'x' }, s, T0, NO_NET)).error, /Only moderators start/);
  const made = (await startTopic(FMOD, { cat: 'announcements', title: 'Hello', body: 'Welcome.' }, s, T0, NO_NET)).topic;
  assert.ok(made, 'a moderator could not start an announcement');
  assert.ok(await replyTopic(ADA, made.id, { body: 'Thank you.' }, s, T0 + 1, NO_NET).then((r) => r.post), 'anybody could not reply to an announcement');
  const secret = (await startTopic(FBOARD, { cat: 'board', title: 'Budget', body: 'Numbers.' }, s, T0, NO_NET)).topic;
  assert.equal(await forumTopic(ADA, secret.id, s, T0), null, 'a board topic was read by somebody not on the board');
  assert.equal((await forumLatest(ADA, null, s, T0)).topics.some((x) => x.id === secret.id), false);
  assert.equal((await searchForum(ADA, 'budget', s, T0)).length, 0, 'a search found a topic in a category the reader cannot see');
  assert.equal((await replyTopic(ADA, secret.id, { body: 'Peek' }, s, T0, NO_NET)).error, 'That topic has gone, or is not one you can read.');
});

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`fifteen replies to one topic at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const t = (await startTopic(ADA, { cat: 'help-desk', title: 'Busy', body: 'Start.' }, s, T0, NO_NET)).topic;
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => replyTopic(fw(`R${i}`, i + 1), t.id, { body: `reply ${i}` }, s, T0 + i, NO_NET)));
    const worked = told.map((r, i) => (r.status === 'fulfilled' && r.value.post ? `reply ${i}` : null)).filter(Boolean);
    const kept = new Set((await readTopic(t.id, s)).posts.map((p) => p.body));
    assert.deepEqual(worked.filter((b) => !kept.has(b)), [], 'a reply that was told it went up is not in the topic');
    for (const r of told) if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
    if (etagOnRead) assert.equal(worked.length, 15);
    const sum = (await readForumIndex('help-desk', s)).find((x) => x.id === t.id);
    assert.equal(sum.last, Math.max(...(await readTopic(t.id, s)).posts.map((p) => p.t)), 'the list does not have the latest post\'s time');
  });
}

test('a topic goes at its keep after its last post, a pin keeps it, and the sweep takes everything in it', async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.equal(goesAt(Date.UTC(2026, 0, 31), '1 week'), Date.UTC(2026, 1, 7));
  assert.equal(goesAt(Date.UTC(2026, 9, 18), '3 months'), Date.UTC(2027, 0, 18));
  assert.equal(goesAt(T0, 'never'), null);
  const t = (await startTopic(ADA, { cat: 'watering-hole', title: 'Week', body: 'Hi.' }, s, T0, NO_NET)).topic;
  assert.ok(await forumTopic(BO, t.id, s, T0 + DAYS(6)));
  assert.equal(await forumTopic(BO, t.id, s, T0 + DAYS(8)), null, 'a week-long topic outlived its week');
  assert.match((await replyTopic(BO, t.id, { body: 'late' }, s, T0 + DAYS(8), NO_NET)).error, /gone/);
  await replyTopic(BO, t.id, { body: 'still here' }, s, T0 + DAYS(6), NO_NET);
  assert.ok(await forumTopic(BO, t.id, s, T0 + DAYS(12)), 'a reply did not start the clock again');
  await moderateTopic(FMOD, t.id, { pin: true }, s, T0 + DAYS(12));
  assert.ok(await forumTopic(BO, t.id, s, T0 + DAYS(200)), 'a pinned topic went');
  assert.equal((await forumTopic(BO, t.id, s, T0 + DAYS(200))).goes, null);
  await moderateTopic(FMOD, t.id, { pin: false }, s, T0 + DAYS(200));
  assert.ok(await forumTopic(BO, t.id, s, T0 + DAYS(205)), 'unpinning did not start the clock again');
  await sweepForum(s, T0 + DAYS(206));
  assert.ok(await readTopic(t.id, s), 'the sweep took a topic before its date');
  await sweepForum(s, T0 + DAYS(300));
  assert.equal(await readTopic(t.id, s), null, 'the sweep left a topic past its date');
  assert.deepEqual(await readForumIndex('watering-hole', s), [], 'the sweep left its summary on the list');
  assert.deepEqual(s.keys().filter((k) => k.startsWith('forum/t/')), []);
});

test('the sweep puts back a topic whose list lost it, and drops a summary whose topic has gone', async () => {
  const s = memoryStore({ etagOnRead: true });
  const t = (await startTopic(ADA, { cat: 'nature', title: 'Moss', body: 'Green.' }, s, T0, NO_NET)).topic;
  const t2 = (await startTopic(ADA, { cat: 'nature', title: 'Lichen', body: 'Grey.' }, s, T0, NO_NET)).topic;
  await s.setJSON('forum/c/nature', { topics: (await readForumIndex('nature', s)).filter((x) => x.id !== t.id) }, { onlyIfMatch: (await s.getWithMetadata('forum/c/nature')).etag });
  await s.delete('forum/t/' + t2.id);
  await sweepForum(s, T0 + DAYS(1));
  const ids = (await readForumIndex('nature', s)).map((x) => x.id);
  assert.deepEqual(ids, [t.id], 'the list is not what is in the store');
});

test('only a post\'s author edits it, and a name claimed again after it was deleted is somebody else', async () => {
  const s = memoryStore({ etagOnRead: true });
  const t = (await startTopic(ADA, { cat: 'infodumps', title: 'Moths', body: 'Moths are great.' }, s, T0, NO_NET)).topic;
  const pid = t.posts[0].id;
  assert.ok((await editPost(ADA, t.id, pid, { body: 'Moths are wonderful.', title: 'Moths!' }, s, T0 + 5, NO_NET)).topic);
  const after = await forumTopic(BO, t.id, s, T0 + 6);
  assert.equal(after.title, 'Moths!');
  assert.equal(after.posts[0].edited, T0 + 5);
  assert.equal(after.last, T0, 'an edit moved the topic\'s clock');
  assert.match((await editPost(ADA_AGAIN, t.id, pid, { body: 'Mine now' }, s, T0 + 7, NO_NET)).error, /Only whoever wrote/);
  assert.match((await removePost(ADA_AGAIN, t.id, pid, s, T0 + 7)).error, /Only whoever wrote/);
  assert.match((await editPost(FMOD, t.id, pid, { body: 'Edited by a mod' }, s, T0 + 7, NO_NET)).error, /Only whoever wrote/);
  assert.equal((await forumTopic(ADA_AGAIN, t.id, s, T0 + 7)).posts[0].edit, false);
  const raw = JSON.stringify(await forumTopic(ADA, t.id, s, T0 + 7));
  assert.ok(!raw.includes(authorMark(ADA)), 'an author\'s mark was sent');
  await replyTopic(BO, t.id, { body: 'Agreed.' }, s, T0 + 8, NO_NET);
  assert.match((await removeTopic(ADA, t.id, s, T0 + 9)).error, /Only a moderator can take down a topic other people have posted in/);
  assert.ok((await removePost(ADA, t.id, pid, s, T0 + 9)).topic, 'an author could not take down their own post');
  const left = await forumTopic(BO, t.id, s, T0 + 10);
  assert.equal(left.posts.length, 1);
  assert.equal(left.title, 'Moths!', 'the topic lost its title with its first post');
  assert.ok((await removeTopic(FMOD, t.id, s, T0 + 11)).gone);
  assert.equal(await readTopic(t.id, s), null);
  const mine = (await startTopic(BO, { cat: 'infodumps', title: 'Owls', body: 'Hoo.' }, s, T0, NO_NET)).topic;
  assert.ok((await removeTopic(BO, mine.id, s, T0 + 1)).gone, 'a starter alone in their topic could not take it down');
});

test('a wiki\'s documents are edited by its roles whoever wrote them, its replies only by their writers, and the last editor is named', async () => {
  const s = memoryStore({ etagOnRead: true });
  const wiki = FORUM_CATEGORIES.find((c) => c.wiki);
  assert.ok(wiki && wiki.keep === 'never', 'there is no wiki category kept for good');
  assert.equal(forumEditor(FMOD, forumCat('infodumps')), false, 'a moderator edits documents in a category with no wiki roles');
  assert.equal(forumEditor(ADA, wiki), false, 'a claimed username with no role edits a wiki');
  assert.match((await startTopic(ADA, { cat: wiki.slug, title: 'How to', body: 'Steps.' }, s, T0, NO_NET)).error, /Only moderators start/);
  const t = (await startTopic(FMOD, { cat: wiki.slug, title: 'Changing your password', body: 'Open Profile.' }, s, T0, NO_NET)).topic;
  const doc = t.posts[0].id;
  const reply = (await replyTopic(ADA, t.id, { body: 'Thanks, this helped.' }, s, T0 + 1, NO_NET)).post;
  const asAda = await forumTopic(ADA, t.id, s, T0 + 2);
  assert.equal(asAda.posts[0].wiki, true);
  assert.equal(asAda.posts[0].edit, false, 'somebody with no role was offered the edit of a wiki page');
  assert.equal(asAda.posts[0].takeDown, false, 'a wiki page could be taken down without its topic');
  assert.match((await editPost(ADA, t.id, doc, { body: 'Mine now' }, s, T0 + 3, NO_NET)).error, /Only whoever wrote/);
  // Another moderator edits the page and its title, and is named on it.
  const OTHER = fw('Mo', 600, []);
  assert.equal((await forumTopic(OTHER, t.id, s, T0 + 3)).retitle, true);
  assert.ok((await editPost(OTHER, t.id, doc, { body: 'Open **Profile** on the radio.', title: 'Your password' }, s, T0 + 4, NO_NET)).topic);
  const after = await forumTopic(ADA, t.id, s, T0 + 5);
  assert.equal(after.title, 'Your password');
  assert.deepEqual([after.posts[0].handle, after.posts[0].editedBy, after.posts[0].editedBase, after.posts[0].edited], ['Ryan', 'Mo', true, T0 + 4]);
  assert.equal(after.last, T0 + 1, 'an edit moved the page\'s clock');
  // A reply stays its writer's, in a wiki too.
  assert.match((await editPost(OTHER, t.id, reply.id, { body: 'Words Ada never said' }, s, T0 + 6, NO_NET)).error, /Only whoever wrote/);
  assert.ok((await editPost(ADA, t.id, reply.id, { body: 'Thanks, this really helped.' }, s, T0 + 6, NO_NET)).topic);
  assert.equal((await forumTopic(ADA, t.id, s, T0 + 7)).posts[1].editedBy, undefined, 'a reply edited by its writer named an editor');
  // The page goes only with its topic, so a reply never becomes the page.
  assert.match((await removePost(FMOD, t.id, doc, s, T0 + 8)).error, /goes only with its topic/);
  assert.ok((await removePost(OTHER, t.id, reply.id, s, T0 + 8)).topic, 'a moderator could not take a reply down');
  assert.equal(await forumTopic(ADA, t.id, s, T0 + DAYS(4000)) !== null, true, 'a wiki page went');
  // Moved out of the wiki, the page is its starter's post again, still naming its last editor.
  await moderateTopic(FMOD, t.id, { move: 'help-desk' }, s, T0 + 9);
  const moved = await forumTopic(OTHER, t.id, s, T0 + 10);
  assert.equal(moved.posts[0].edit, false, 'a moderator kept the edit of a post outside the wiki');
  assert.equal(moved.posts[0].editedBy, 'Mo');
  assert.equal(JSON.stringify(moved).includes(authorMark(FMOD)), false, 'an author\'s mark was sent');
});

test('messages are copied off the channel exactly as sent, and only their sender or a moderator takes one out', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  await updateChannel((l) => [...l,
    { id: 'm1', handle: 'Ada', text: 'Shall we keep this?', t: now - 3000, claimed: true },
    { id: 'm2', handle: 'Cy', text: 'Yes **please**', t: now - 2000, edited: now - 1500 },
    { id: 'm3', handle: 'Ryan', text: 'Fine by me', t: now - 1000, base: true },
    { id: 'm4', handle: 'Bo', t: now - 500, img: '00000000-0000-4000-8000-000000000000' }], s);
  const r = await cbTranscript(BO, { room: null, ids: ['m1', 'm2', 'm4', 'nope'] }, s);
  assert.deepEqual(r.cb.messages.map((m) => [m.id, m.handle, m.text, !!m.claimed, !!m.base]),
    [['m1', 'Ada', 'Shall we keep this?', true, false], ['m2', 'Cy', 'Yes **please**', false, false]]);
  assert.equal(r.short, true, 'a ticked message that is not copied went unsaid');
  assert.match((await cbTranscript(BO, { room: null, ids: ['nope'] }, s)).error, /None of those messages/);
  const made = (await startTopic(BO, { cat: 'watering-hole', title: 'Keep', from: { room: null, ids: ['m1', 'm2', 'm3'] } }, s, T0, NO_NET)).topic;
  const pid = made.posts[0].id;
  assert.equal(made.posts[0].body, '', 'a topic from the CB needs no words of the copier\'s own');
  const copies = (await forumTopic(BO, made.id, s, T0)).posts[0].cb.messages;
  assert.equal(copies.find((m) => m.id === 'm2').edited, now - 1500, 'a copy of an edited message does not say it was edited');
  assert.equal(copies.find((m) => m.id === 'm1').edited, undefined);
  assert.match((await uncopyMessage(BO, made.id, pid, 'm1', s, T0)).error, /Only whoever sent/);
  assert.match((await uncopyMessage(ADA_AGAIN, made.id, pid, 'm3', s, T0)).error, /Only whoever sent/);
  assert.ok((await uncopyMessage(ADA, made.id, pid, 'm1', s, T0)).topic, 'the sender could not take their message out');
  assert.ok((await uncopyMessage(FMOD, made.id, pid, 'm2', s, T0)).topic);
  const shown = await forumTopic(BO, made.id, s, T0);
  assert.deepEqual(shown.posts[0].cb.messages.map((m) => m.id), ['m3']);
  assert.equal(shown.posts[0].cb.messages[0].takeOut, false, 'somebody else was offered Take out');
  await uncopyMessage(FMOD, made.id, pid, 'm3', s, T0);
  assert.ok((await forumTopic(BO, made.id, s, T0)) === null, 'a topic with nothing left in it stayed');
  await updateRoomTalk('the-secret-cabin', (l) => [...l, { id: 'q1', handle: 'Al', text: 'hush', t: now }], s);
  assert.match((await cbTranscript(FADMIN, { room: 'the-secret-cabin', ids: ['q1'] }, s)).error, /keeps to itself/);
  await updateRoomTalk('town-hall-board', (l) => [...l, { id: 'b1', handle: 'Bea', text: 'board talk', t: now, base: true }], s);
  assert.match((await cbTranscript(ADA, { room: 'town-hall-board', ids: ['b1'] }, s)).error, /not a channel you can hear/);
  assert.match((await startTopic(FBOARD, { cat: 'events', title: 'Leak', from: { room: 'town-hall-board', ids: ['b1'] } }, s, T0, NO_NET)).error, /only go into a category/);
  const kept = (await startTopic(FBOARD, { cat: 'board', title: 'Minutes', from: { room: 'town-hall-board', ids: ['b1'] } }, s, T0, NO_NET)).topic;
  assert.ok(kept, 'board talk could not go into the board\'s own category');
  assert.match((await moderateTopic(FADMIN, kept.id, { move: 'events' }, s, T0)).error, /private room/);
  await updateRoomTalk('town-hall-moderators', (l) => [...l, { id: 'd1', handle: 'Ryan', text: 'mods', t: now, base: true }], s);
  assert.ok((await startTopic(FBOARD, { cat: 'board', title: 'From mods', from: { room: 'town-hall-moderators', ids: ['d1'] } }, s, T0, NO_NET)).topic,
    'what every moderator can hear could not go where only some of them read');
});

test('reactions name who and never say how many, and moderators pin, close and move', async () => {
  const s = memoryStore({ etagOnRead: true });
  const t = (await startTopic(ADA, { cat: 'nature', title: 'Frogs', body: 'Ribbit.' }, s, T0, NO_NET)).topic;
  const pid = t.posts[0].id;
  await reactPost(BO, t.id, pid, '❤️', s, T0);
  await reactPost(ADA, t.id, pid, '❤️', s, T0);
  const rx = (await forumTopic(BO, t.id, s, T0)).posts[0].reactions;
  assert.deepEqual(rx, [{ emoji: '❤️', name: 'heart', who: ['Ada', 'Bo'] }]);
  assert.match((await reactPost(BO, t.id, pid, 'nice', s, T0)).error, /not a reaction/);
  assert.match((await moderateTopic(BO, t.id, { close: true }, s, T0)).error, /Only a moderator/);
  await moderateTopic(FMOD, t.id, { close: true }, s, T0);
  assert.match((await replyTopic(BO, t.id, { body: 'hi' }, s, T0, NO_NET)).error, /closed/);
  assert.ok((await replyTopic(FMOD, t.id, { body: 'closing note' }, s, T0, NO_NET)).post, 'a moderator could not reply to a closed topic');
  await moderateTopic(FMOD, t.id, { move: 'science-and-making' }, s, T0);
  assert.deepEqual((await readForumIndex('nature', s)).map((x) => x.id), []);
  assert.deepEqual((await readForumIndex('science-and-making', s)).map((x) => x.id), [t.id]);
  assert.equal((await forumCategory(BO, 'science-and-making', null, s, T0)).topics[0].closed, true);
  assert.equal((await searchForum(BO, 'ribbit', s, T0))[0].id, t.id, 'a search did not find a word in a post');
  assert.equal(JSON.stringify(await forumHome(BO, s, T0)).match(/"(?:views|count|total|unread)"/), null);
});

test('a preview is fetched only from a public address, and a room on the street is never fetched', async () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '224.0.0.1',
    '::1', '::', 'fe80::1', 'fd00::1', '::ffff:127.0.0.1', '::ffff:10.0.0.1', '64:ff9b::a00:1', '2002:a00:1::', 'ff02::1', '2001:db8::1', 'localhost', 'not an ip']) {
    assert.equal(publicAddress(ip), false, `${ip} passed as public`);
  }
  for (const ip of ['1.1.1.1', '93.184.216.34', '2606:4700:4700::1111', '::ffff:1.1.1.1']) assert.equal(publicAddress(ip), true, `${ip} refused`);
  assert.deepEqual(await previewFor('https://stimpunks.world/the-den.html', NO_NET), { src: 'https://stimpunks.world/the-den.html', href: 'https://stimpunks.world/the-den.html', kind: 'street', path: '/the-den.html' });
  const page = await previewFor('https://example.org/a', async (u) => ({ status: 200, type: 'text/html', url: u,
    text: '<html><head><title>Plain &amp; title</title><meta property="og:title" content="The &ldquo;real&rdquo; title"><meta name="description" content="About it."><meta content="Example" property="og:site_name"></head>' }));
  assert.deepEqual([page.kind, page.title, page.about, page.site], ['page', 'The “real” title', 'About it.', 'Example']);
  const pr = { playabilityStatus: { status: 'OK', playableInEmbed: true }, videoDetails: { title: 'Owls {at} night', author: 'Birds', lengthSeconds: '754', isLive: false } };
  const vid = await previewFor('https://youtu.be/dQw4w9WgXcQ', async (u) => ({ status: 200, type: 'text/html', url: u,
    text: `<script>var ytInitialPlayerResponse = ${JSON.stringify(pr)};var x = {"a":1};</script>` }));
  assert.deepEqual([vid.kind, vid.id, vid.title, vid.channel, vid.length, vid.embed], ['video', 'dQw4w9WgXcQ', 'Owls {at} night', 'Birds', 754, true]);
  const door = await previewFor('https://www.youtube.com/watch?v=dQw4w9WgXcQ', async (u) => (u.includes('oembed')
    ? { status: 200, type: 'application/json', url: u, text: '{"title":"Walled","author_name":"Somebody"}' }
    : { status: 200, type: 'text/html', url: u, text: '<p>Sign in to confirm you are not a bot</p>' }));
  assert.deepEqual([door.title, door.length, door.embed], ['Walled', null, false], 'a video nobody could measure was offered as a player');
  assert.deepEqual(loneLinks('Look:\n\nhttps://a.example/x\n\nand https://b.example/y inline\n\n> https://c.example/z'), ['https://a.example/x']);
  const t = await startTopic(ADA, { cat: 'nature', title: 'Links', body: 'https://stimpunks.world/the-den.html' }, memoryStore({ etagOnRead: true }), T0, NO_NET);
  assert.equal(t.topic.posts[0].links[0].kind, 'street');
  assert.equal(metaOf('<title>a</title>').title, 'a');
  assert.equal(playerInfo('nothing here'), null);
});

/* ── The World room's index ──────────────────────────────────────────────── */
import { worldIndex } from './lib.mjs';

test('the World index names who is where, says a call is on and never who, and sends the busiest order without numbers', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  const mob = (handle) => ({ role: 'mobile', handle, roles: new Set() });
  const board = { role: 'base', handle: 'Bea', roles: new Set(['moderator', 'board']) };
  const b64n = (n) => Buffer.from(n).toString('base64url');
  await beSeen(mob('Ada'), 'the-den', 'visitAAAAAAAAAAAAAAAAAAAAA', s, now - 1000);
  await beSeen(mob('Bo'), 'the-den', 'visitBBBBBBBBBBBBBBBBBBBBB', s, now - 1000);
  await beSeen(mob('Cy'), 'the-garden', 'visitCCCCCCCCCCCCCCCCCCCCC', s, now - 1000);
  await beSeen(mob('Dee'), 'the-secret-cabin', 'visitDDDDDDDDDDDDDDDDDDDDD', s, now - 1000);
  await beSeen(board, 'town-hall-board', 'visitEEEEEEEEEEEEEEEEEEEEE', s, now - 1000);
  for (const [tag, name] of [['the-garden', 'Cy'], ['the-garden', 'Eve'], ['the-garden', 'Fay'], ['world', 'Gus']]) {
    await s.set(`call-in/${tag}/${b64n('pid-' + name)}.${now - 2000}.p.${b64n(name)}`, '');
  }
  await updateChannel((l) => [...l, { id: 'w1', handle: 'Hal', text: 'hello world', t: now - 5000 }], s);
  await updateRoomTalk('the-mopery', (l) => [...l, { id: 'r1', handle: 'Ivy', text: 'quiet in here', t: now - 9000 }], s);
  const r = await worldIndex(mob('Zed'), s, now);
  const by = Object.fromEntries(r.rooms.map((x) => [x.tag, x]));
  assert.deepEqual(by['the-den'].people.map((p) => p.handle), ['Ada', 'Bo']);
  assert.equal(by['the-den'].call, false);
  assert.equal(by['the-garden'].call, true);
  assert.equal(by.world.call, true, 'the World call is the World room\'s call');
  assert.equal(by.world.last >= now - 5000, true, 'the World channel\'s message is the World room\'s activity');
  assert.equal(by['the-mopery'].last, now - 9000);
  assert.deepEqual(by['the-mopery'].people, []);
  assert.equal(by['the-secret-cabin'], undefined, 'a room that keeps to itself was in the index');
  assert.equal(by['town-hall-board'], undefined, 'a private room was shown to somebody it is not for');
  assert.ok((await worldIndex(board, s, now)).rooms.some((x) => x.tag === 'town-hall-board'), 'the board could not see its own room');
  assert.deepEqual(r.busiest, ['the-garden', 'the-den', 'world'], 'Cy, Eve and Fay, then Ada and Bo, then Gus: Cy seen and in the call is one person');
  const raw = JSON.stringify(r);
  assert.equal(/"(n|count|total|busy|how_many)"\s*:/.test(raw), false, 'a number left with the order');
  assert.equal(raw.includes('Eve') || raw.includes('Gus'), false, 'who is in a call was named');
  assert.equal(raw.includes('hello world'), false, 'a message\'s words left the channel');
  const later = await worldIndex(mob('Zed'), s, now + 60 * 1000);
  assert.equal(later.rooms.find((x) => x.tag === 'the-den'), undefined, 'somebody no longer seen was still shown');
});

test('the World room\'s channel is the World channel, never a second one', async () => {
  const s = memoryStore({ etagOnRead: true });
  await updateTuned('world', (l) => [...l, { id: 'x', handle: 'Ada', text: 'hi', t: Date.now() }], s);
  assert.deepEqual((await readChannel(s)).messages.map((m) => m.id), ['x']);
  assert.deepEqual((await readTuned('world', s)).messages.map((m) => m.id), ['x']);
  assert.equal(s.keys().some((k) => k.startsWith('room-talk-world')), false);
});

/* ── Notifications ─────────────────────────────────────────────────────── */

test('a notification is encrypted exactly as RFC 8291\'s worked example says', () => {
  const u = (x) => Buffer.from(x, 'base64url');
  const sub = { p256dh: 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4', auth: 'BTBZMqHH6r4Tts7J_aSIgg' };
  const out = encryptPush('When I grow up, I want to be a watermelon', sub,
    { asPrivate: u('yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw'), salt: u('DGv6ra1nlYgDCS1FRnbzlw') });
  assert.equal(out.toString('base64url'), 'DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN');
});

test('the VAPID header is ES256, signed by the street\'s key, for the push service it goes to, for an hour', () => {
  const was = process.env.CB_PUSH_KEY;
  const e = createECDH('prime256v1'); e.generateKeys();
  process.env.CB_PUSH_KEY = e.getPrivateKey().toString('base64url');
  try {
    const pub = pushPublicKey();
    assert.equal(pub, e.getPublicKey().toString('base64url'));
    const now = Date.UTC(2026, 9, 18);
    const k = { key: null, pub };
    const auth = (() => {
      // the key the function makes for itself, through the module
      const h = vapidAuth('https://fcm.googleapis.com/fcm/send/abc', { key: createPrivKey(e), pub }, now);
      return h;
    })();
    const m = /^vapid t=([^.]+)\.([^.]+)\.([^,]+), k=(.+)$/.exec(auth);
    assert.ok(m, auth);
    assert.equal(m[4], pub);
    const claims = JSON.parse(Buffer.from(m[2], 'base64url'));
    assert.equal(claims.aud, 'https://fcm.googleapis.com');
    assert.equal(claims.exp, now / 1000 + 3600);
    assert.match(claims.sub, /^https:\/\/stimpunks\.world\//);
    const raw = e.getPublicKey();
    const jwk = { kty: 'EC', crv: 'P-256', x: raw.subarray(1, 33).toString('base64url'), y: raw.subarray(33).toString('base64url') };
    assert.ok(cryptoVerify('sha256', Buffer.from(`${m[1]}.${m[2]}`), { key: createPublicKey({ key: jwk, format: 'jwk' }), dsaEncoding: 'ieee-p1363' }, Buffer.from(m[3], 'base64url')));
    void k;
  } finally { if (was === undefined) delete process.env.CB_PUSH_KEY; else process.env.CB_PUSH_KEY = was; }
  process.env.CB_PUSH_KEY = 'too-short';
  try { assert.equal(pushPublicKey(), null, 'a bad key switched notifications on'); } finally { if (was === undefined) delete process.env.CB_PUSH_KEY; else process.env.CB_PUSH_KEY = was; }
});
function createPrivKey(e) {
  const pub = e.getPublicKey();
  return createPrivateKeyJwk({ kty: 'EC', crv: 'P-256', d: e.getPrivateKey().toString('base64url'), x: pub.subarray(1, 33).toString('base64url'), y: pub.subarray(33).toString('base64url') });
}
import { createPrivateKey as createPrivateKeyRaw } from 'node:crypto';
function createPrivateKeyJwk(jwk) { return createPrivateKeyRaw({ key: jwk, format: 'jwk' }); }

let devN = 0;
function aDevice(host = 'fcm.googleapis.com') {
  const e = createECDH('prime256v1'); e.generateKeys();
  return { endpoint: `https://${host}/fcm/send/dev${++devN}`, keys: { p256dh: e.getPublicKey().toString('base64url'), auth: rnd(16).toString('base64url') } };
}

test('only a real push service\'s address, with keys the right size, is kept', () => {
  assert.ok(cleanSubscription(aDevice()));
  assert.ok(cleanSubscription(aDevice('web.push.apple.com')));
  assert.ok(cleanSubscription(aDevice('updates.push.services.mozilla.com')));
  assert.ok(cleanSubscription(aDevice('wns2-par02p.notify.windows.com')));
  for (const host of ['example.org', 'fcm.googleapis.com.evil.example', 'stimpunks.world', 'push.apple.com.example']) {
    assert.equal(cleanSubscription(aDevice(host)), null, `${host} was taken as a push service`);
  }
  const d = aDevice();
  assert.equal(cleanSubscription({ ...d, endpoint: d.endpoint.replace('https:', 'http:') }), null);
  assert.equal(cleanSubscription({ ...d, endpoint: d.endpoint.replace('.com/', '.com:8443/') }), null, 'a port');
  assert.equal(cleanSubscription({ ...d, keys: { ...d.keys, auth: rnd(8).toString('base64url') } }), null);
  assert.equal(cleanSubscription({ ...d, keys: { ...d.keys, p256dh: rnd(65).toString('base64url') } }), null, 'a key that is not a point');
  assert.deepEqual(cleanWant({}), { mentions: false, props: false, messages: false, world: false, calls: false, words: true, rooms: [] }, 'something started on');
  assert.equal(cleanWant({ rooms: Array.from({ length: 61 }, (_, i) => `room-${i}`) }), null);
  assert.deepEqual(cleanWant({ rooms: ['the-den', 'The Den', 'the-den'] }).rooms, ['the-den']);
});

test('an @ mention is the handle with an @ before it and nothing joined on after', () => {
  assert.ok(mentions('hi @Bex!', 'Bex'));
  assert.ok(mentions('@bex', 'Bex'));
  assert.ok(mentions('thanks @Ryan Boren, see you', 'Ryan Boren'));
  assert.ok(!mentions('hi @Bexley', 'Bex'));
  assert.ok(!mentions('me@bex.example', 'Bex'), 'an email address');
  assert.ok(!mentions('hi Bex', 'Bex'));
  assert.ok(!mentions('see @34:12', '34'), 'a stamp is not a handle');
});

test('a message tells the devices that asked, as their pass now allows, and nobody about their own', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const bex = issuePass('mobile', 'Bex'), cy = issuePass('mobile', 'Cy'), ada = issuePass('mobile', 'Ada');
  const bexDev = aDevice(), cyDev = aDevice(), adaDev = aDevice();
  await keepDevice(bexDev, bex, { mentions: true }, s);
  await keepDevice(cyDev, cy, { world: true, words: false, rooms: ['the-den', 'town-hall-moderators'] }, s);
  await keepDevice(adaDev, ada, { world: true, mentions: true }, s);
  const sent = [];
  const send = async (sub, payload) => { sent.push({ to: sub.endpoint, payload }); return 201; };
  const msg = (handle, text, extra = {}) => ({ id: `m${sent.length}${handle}`, handle, text, t: 1, ...extra });

  await notifyMessage(msg('Ada', 'hello @bex, the call is at 3'), null, s, readMods(''), send);
  const to = (d) => sent.filter((x) => x.to === d.endpoint);
  assert.equal(to(adaDev).length, 0, 'Ada was told about her own message');
  assert.equal(to(bexDev)[0].payload.why, 'mention');
  assert.equal(to(bexDev)[0].payload.text, 'hello @bex, the call is at 3');
  assert.equal(to(cyDev)[0].payload.why, 'channel');
  assert.equal(to(cyDev)[0].payload.text, '', 'the words went to a device that turned them off');
  assert.deepEqual(Object.keys(to(cyDev)[0].payload).sort(), ['handle', 'id', 'kind', 'room', 'text', 'what', 'why']);

  sent.length = 0;
  await notifyMessage(msg('Ada', 'quiet in here @bex'), 'town-hall-moderators', s, readMods(''), send);
  assert.equal(sent.length, 0, 'a private room told somebody who cannot hear it');
  await notifyMessage(msg('Ada', 'in the den @bex'), 'the-den', s, readMods(''), send);
  assert.deepEqual(sent.map((x) => [x.to, x.payload.why]).sort(), [[bexDev.endpoint, 'mention'], [cyDev.endpoint, 'channel']].sort());

  // A changed community password signs everybody off, notifications included.
  sent.length = 0;
  process.env.CB_PASSWORD = 'a-new-community-password';
  await notifyMessage(msg('Dee', 'hello @bex'), null, s, readMods(''), send);
  assert.equal(sent.length, 0, 'a device was told after its password changed');
  assert.deepEqual(Object.keys(await readDevices(s)), [], 'devices whose pass has gone are still kept');
}));

test('a room that keeps to itself tells only the devices that follow it, never a mention elsewhere', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const room = QUIET_ROOMS[0];
  // Locked as well as quiet, so the people in it are administrators here.
  const mods = readMods('{"Bex":["administrator"],"Cy":["administrator"],"Ada":["administrator"]}');
  const bexDev = aDevice(), cyDev = aDevice();
  await keepDevice(bexDev, issuePass('base', 'Bex'), { mentions: true }, s);
  await keepDevice(cyDev, issuePass('base', 'Cy'), { rooms: [room] }, s);
  const sent = [];
  await notifyMessage({ id: 'q', handle: 'Ada', text: 'hush @bex', t: 1 }, room, s, mods, async (sub) => { sent.push(sub.endpoint); return 201; });
  assert.deepEqual(sent, [cyDev.endpoint], 'a room that keeps to itself was announced to somebody who does not follow it');
}));

test('an edited message tells only somebody it newly @mentions, never the channel\'s followers again', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const bexDev = aDevice(), cyDev = aDevice(), dovDev = aDevice();
  await keepDevice(bexDev, issuePass('mobile', 'Bex'), { mentions: true }, s);
  await keepDevice(cyDev, issuePass('mobile', 'Cy'), { world: true, rooms: ['the-den'] }, s);
  await keepDevice(dovDev, issuePass('mobile', 'Dov'), { mentions: true }, s);
  const sent = [];
  const send = async (sub, payload) => { sent.push({ to: sub.endpoint, payload }); return 201; };
  const msg = { id: 'e', handle: 'Ada', text: 'see you there @bex and @dov', t: 1, edited: 2 };
  await notifyEdit(msg, 'see you there @bex', null, s, readMods(''), send);
  assert.deepEqual(sent.map((x) => [x.to, x.payload.why]), [[dovDev.endpoint, 'mention']], 'an edit told somebody already named, or the followers again');
  sent.length = 0;
  await notifyEdit({ ...msg, text: 'see you there' }, 'see you ther', 'the-den', s, readMods(''), send);
  assert.equal(sent.length, 0, 'fixing a typo was news to a room\'s followers');
}));

test('a claimed username\'s devices stop at a password change, and go with the username', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  await claimAccount('Ada', 'a long enough phrase', s, 9, null);
  const acct = await readAccount('Ada', s);
  const dev = aDevice();
  await keepDevice(dev, issueAccountPass('Ada', acct.v), { world: true }, s);
  const sent = [];
  const send = async (sub, payload) => { sent.push(payload); return 201; };
  await notifyMessage({ id: 'x', handle: 'Bex', text: 'hi', t: 1 }, null, s, readMods(''), send);
  assert.equal(sent.length, 1);
  assert.deepEqual(await readDevice(dev.endpoint, 'ada', s), cleanWant({ world: true }));
  assert.equal(await readDevice(dev.endpoint, 'Bex', s), null, 'somebody else read a device');
  await changePassword('Ada', 'a long enough phrase', 'another long phrase', s);
  await notifyMessage({ id: 'y', handle: 'Bex', text: 'hi', t: 1 }, null, s, readMods(''), send);
  assert.equal(sent.length, 1, 'a device was told after its username\'s password changed');
  const dev2 = aDevice();
  await keepDevice(dev2, issueAccountPass('Ada', (await readAccount('Ada', s)).v), { world: true }, s);
  await deleteAccount('Ada', s);
  assert.deepEqual(Object.keys(await readDevices(s)), [], 'a deleted username left a device');
  const dev3 = aDevice();
  await keepDevice(dev3, issuePass('mobile', 'Cy'), { world: true }, s);
  await dropDevicesOf('cy', s);
  assert.deepEqual(Object.keys(await readDevices(s)), [], 'Forget me left a device');
  await keepDevice(dev3, issuePass('mobile', 'Cy'), { world: true }, s);
  await dropDevice(dev3.endpoint, s);
  assert.deepEqual(Object.keys(await readDevices(s)), []);
}));

test('a device the push service says has gone is forgotten, and a handle has only so many', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const a = aDevice(), b = aDevice();
  await keepDevice(a, issuePass('mobile', 'Bex'), { world: true }, s);
  await keepDevice(b, issuePass('mobile', 'Cy'), { world: true }, s);
  await notifyMessage({ id: 'x', handle: 'Ada', text: 'hi', t: 1 }, null, s, readMods(''), async (sub) => (sub.endpoint === a.endpoint ? 410 : 201));
  assert.deepEqual(Object.keys(await readDevices(s)), [pushDeviceId(b.endpoint)]);
  for (let i = 0; i < PUSH_PER_HANDLE - 1; i++) assert.ok((await keepDevice(aDevice(), issuePass('mobile', 'Cy'), {}, s)).id);
  assert.equal((await keepDevice(aDevice(), issuePass('mobile', 'Cy'), {}, s)).error, 'many');
  assert.ok((await keepDevice(b, issuePass('mobile', 'Cy'), { calls: true }, s)).id, 'changing a device already kept was refused');
  assert.equal((await keepDevice(aDevice('example.org'), issuePass('mobile', 'Dee'), {}, s)).error, 'address');
  assert.equal((await keepDevice(aDevice(), 'not a pass', {}, s)).error, 'pass');
}));

test('a call that starts tells who follows its room, never who joined, and not twice in a while', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.UTC(2026, 9, 18, 15);
  const evt = (type, name, pid, t, room = 'the-den') => ({ eventType: type, fqn: `${JAAS_APP}/stimpunks-${room}`, timestamp: t, data: { name, participantId: pid } });
  assert.equal(await callEvent(evt('PARTICIPANT_JOINED', 'Sam', 'p1', now), s, now), 'started');
  assert.equal(await callEvent(evt('PARTICIPANT_JOINED', 'Ada', 'p2', now + 1), s, now), 'joined');
  const den = aDevice(), all = aDevice(), off = aDevice();
  await keepDevice(den, issuePass('mobile', 'Bex'), { calls: true, rooms: ['the-den'] }, s);
  await keepDevice(all, issuePass('mobile', 'Cy'), { calls: true }, s);
  await keepDevice(off, issuePass('mobile', 'Dee'), { rooms: ['the-den'] }, s);
  const sent = [];
  const send = async (sub, payload) => { sent.push([sub.endpoint, payload]); return 201; };
  await notifyCall('the-den', s, readMods(''), send, now);
  assert.deepEqual(sent, [[den.endpoint, { kind: 'call', room: 'the-den' }]], 'a call told the wrong devices, or said who');
  await notifyCall('the-den', s, readMods(''), send, now + CALL_QUIET - 1);
  assert.equal(sent.length, 1, 'the same call told them twice');
  await notifyCall('the-den', s, readMods(''), send, now + CALL_QUIET + 1);
  assert.equal(sent.length, 2);
  sent.length = 0;
  await notifyCall(WORLD_CALL, s, readMods(''), send, now);
  assert.deepEqual(sent.map((x) => x[0]).sort(), [den.endpoint, all.endpoint].sort());
  sent.length = 0;
  await keepDevice(off, issuePass('mobile', 'Dee'), { calls: true, rooms: ['town-hall-moderators'] }, s);
  await notifyCall('town-hall-moderators', s, readMods(''), send, now);
  assert.equal(sent.length, 0, 'a private room\'s call told somebody who may not go in');
}));

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`fifteen devices switched on at once, ${how}`, () => withPasswords(async () => {
    const s = memoryStore({ etagOnRead });
    const subs = Array.from({ length: 15 }, () => aDevice());
    const told = await Promise.allSettled(subs.map((d, i) => keepDevice(d, issuePass('mobile', `P${i}`), { world: true }, s)));
    const kept = await readDevices(s);
    const worked = subs.filter((_, i) => told[i].status === 'fulfilled' && told[i].value.id);
    assert.deepEqual(worked.filter((d) => !kept[pushDeviceId(d.endpoint)]), [], 'a device told it was switched on is not kept');
    for (const r of told) if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
    if (etagOnRead) assert.equal(worked.length, 15);
  }));
}

/* ── The forums' pictures, files and @mentions ─────────────────────────── */
import { putForumUpload, forumFile, forumMentions, fileKind, cleanFileName, notifyForum, FORUM_ATTACH_MAX } from './lib.mjs';

const JPEG = () => Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16]), Buffer.from('JFIF\0'), rnd(200)]);
const EXIF = () => Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe1, 0, 40]), Buffer.from('Exif\0\0'), rnd(200)]);
const PDF = (extra = '') => Buffer.from(`%PDF-1.7\n1 0 obj << /Type /Catalog >> endobj ${extra}\n%%EOF`);
const ZIP = (inside = 'word/document.xml') => Buffer.concat([Buffer.from([0x50, 0x4b, 3, 4]), Buffer.from(inside), rnd(64)]);

test('a picture comes without its camera data, and a file only as one of the kinds the forums take', async () => {
  const s = memoryStore({ etagOnRead: true });
  const typed = { role: 'mobile', handle: 'Cy', roles: new Set() };
  assert.match((await putForumUpload(typed, { kind: 'pic' }, JPEG(), s, T0)).error, /claimed usernames/);
  assert.match((await putForumUpload(ADA, { kind: 'pic' }, EXIF(), s, T0)).error, /camera data/);
  assert.ok((await putForumUpload(ADA, { kind: 'pic' }, JPEG(), s, T0)).id);
  assert.match((await putForumUpload(ADA, { kind: 'file', name: 'photo.pdf' }, JPEG(), s, T0)).error, /That is a picture/, 'a photo went up as a file, camera data and all');
  assert.ok((await putForumUpload(ADA, { kind: 'file', name: 'notes.pdf' }, PDF(), s, T0)).id);
  assert.match((await putForumUpload(ADA, { kind: 'file', name: 'run.pdf' }, PDF('/JavaScript (app.alert(1))'), s, T0)).error, /script/);
  assert.match((await putForumUpload(ADA, { kind: 'file', name: 'page.html' }, Buffer.from('<script>x</script>'), s, T0)).error, /name ends in/);
  assert.match((await putForumUpload(ADA, { kind: 'file', name: 'drawing.svg' }, Buffer.from('<svg/>'), s, T0)).error, /name ends in/);
  assert.match((await putForumUpload(ADA, { kind: 'file', name: 'macro.docx' }, ZIP('word/vbaProject.bin'), s, T0)).error, /macros/);
  assert.ok((await putForumUpload(ADA, { kind: 'file', name: 'plain.docx' }, ZIP(), s, T0)).id);
  assert.match(fileKind(Buffer.from('not a pdf at all'), 'x.pdf').error, /not the kind of file/);
  assert.match(fileKind(Buffer.from([0x68, 0, 0x69]), 'x.txt').error, /not the kind/);
  assert.match(fileKind(Buffer.from([0xc3, 0x28]), 'x.txt').error, /UTF-8/);
  assert.equal(cleanFileName('../../etc/passwd.txt'), 'etc-passwd.txt');
  assert.equal(cleanFileName('report.exe'), null);
  assert.equal(cleanFileName('.txt'), null);
});

test('a post\'s pictures and files are its writer\'s own, read only where the topic is, and go with the post', async () => {
  const s = memoryStore({ etagOnRead: true });
  const pic = await putForumUpload(ADA, { kind: 'pic' }, JPEG(), s, T0);
  const doc = await putForumUpload(ADA, { kind: 'file', name: 'Minutes.pdf' }, PDF(), s, T0);
  const bos = await putForumUpload(BO, { kind: 'pic' }, JPEG(), s, T0);
  assert.match((await startTopic(ADA, { cat: 'pets', title: 'Theirs', files: [{ id: bos.id }] }, s, T0, NO_NET)).error, /not yours/, 'somebody else\'s upload went into a post');
  assert.match((await startTopic(ADA, { cat: 'pets', title: 'Many', files: Array.from({ length: FORUM_ATTACH_MAX + 1 }, () => ({ id: pic.id })) }, s, T0, NO_NET)).error, /at most/);
  const r = await startTopic(ADA, { cat: 'pets', title: 'My cat', files: [{ id: pic.id, alt: 'A grey cat asleep in a box' }, { id: doc.id }] }, s, T0, NO_NET);
  assert.ok(r.topic, r.error);
  const t = r.topic;
  assert.equal(s.keys().some((k) => k === `forum-up/${pic.id}`), false, 'the upload stayed waiting once a post took it');
  const shown = await forumTopic(BO, t.id, s, T0);
  assert.deepEqual(shown.posts[0].files.map((f) => [f.kind, f.name || f.alt]), [['pic', 'A grey cat asleep in a box'], ['file', 'Minutes.pdf']]);
  assert.ok(!JSON.stringify(shown).includes(authorMark(ADA)), 'an upload carried its writer\'s mark to a reader');
  assert.ok(await forumFile(BO, t.id, pic.id, s, T0), 'a reader could not see a picture in a topic they can read');
  assert.equal(await forumFile(BO, t.id, bos.id, s, T0), null, 'a file no post holds was served');
  assert.equal(await forumFile(BO, 'tAAAAAAAAAAAA', pic.id, s, T0), null);
  // Moved to where Bo cannot read, its files go out of Bo's reach with it.
  await moderateTopic(FADMIN, t.id, { move: 'finance' }, s, T0);
  assert.equal(await forumFile(BO, t.id, pic.id, s, T0), null, 'a file was served out of a category the reader cannot see');
  assert.ok(await forumFile(FADMIN, t.id, pic.id, s, T0));
  await moderateTopic(FADMIN, t.id, { move: 'pets' }, s, T0);
  // An edit that lets one go deletes it; one left out of the edit is kept.
  await editPost(ADA, t.id, t.posts[0].id, { body: 'Just the cat.' }, s, T0 + 1, NO_NET);
  assert.ok(s.keys().includes(`forum-file/${t.id}/${doc.id}`), 'an edit that did not mention the files dropped them');
  await editPost(ADA, t.id, t.posts[0].id, { body: 'Just the cat.', files: [{ id: pic.id }] }, s, T0 + 2, NO_NET);
  assert.equal(s.keys().includes(`forum-file/${t.id}/${doc.id}`), false, 'a file the post let go of is still stored');
  assert.equal((await forumTopic(BO, t.id, s, T0)).posts[0].files[0].alt, undefined, 'a description taken off stayed');
  // A reply on a closed topic is refused, and its upload is still waiting.
  const late = await putForumUpload(BO, { kind: 'pic' }, JPEG(), s, T0);
  await moderateTopic(FMOD, t.id, { close: true }, s, T0);
  assert.match((await replyTopic(BO, t.id, { files: [{ id: late.id }] }, s, T0 + 3, NO_NET)).error, /closed/);
  assert.ok(s.keys().includes(`forum-up/${late.id}`) && !s.keys().includes(`forum-file/${t.id}/${late.id}`), 'a refused reply lost its upload or left a copy');
  await moderateTopic(FMOD, t.id, { close: false }, s, T0);
  const reply = await replyTopic(BO, t.id, { files: [{ id: late.id }] }, s, T0 + 4, NO_NET);
  assert.ok(reply.post, 'a reply that is only a picture was refused');
  await removePost(BO, t.id, reply.post.id, s, T0 + 5);
  assert.equal(s.keys().includes(`forum-file/${t.id}/${late.id}`), false, 'a post taken down left its picture stored');
  assert.equal(await forumFile(ADA, t.id, late.id, s, T0), null);
  // The topic goes, and everything under it.
  await removeTopic(FMOD, t.id, s, T0 + 6);
  assert.deepEqual(s.keys().filter((k) => k.startsWith('forum-file/')), [], 'a topic taken down left its files');
  // An upload no post took goes after a day; one under no topic, after an hour.
  const stray = await putForumUpload(ADA, { kind: 'pic' }, JPEG(), s, T0);
  await s.set(`forum-file/tZZZZZZZZZZZZ/${stray.id}`, JPEG(), { metadata: { t: T0 } });
  await sweepForum(s, T0 + 30 * 60 * 1000);
  assert.ok(s.keys().includes(`forum-up/${stray.id}`) && s.keys().includes(`forum-file/tZZZZZZZZZZZZ/${stray.id}`), 'the sweep was early');
  await sweepForum(s, T0 + DAYS(1) + 1);
  assert.deepEqual(s.keys().filter((k) => k.startsWith('forum-up/') || k.startsWith('forum-file/')), [], 'the sweep left an upload nobody posted');
});

test('a post keeps who it @mentions, the reader finds where they were mentioned, and a device is told only what its pass can read', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  await claimAccount('Bex', 'a long enough phrase', s, 9, null);
  const BEX = fw('Bex', 9);
  const dev = aDevice();
  await keepDevice(dev, issueAccountPass('Bex', (await readAccount('Bex', s)).v), { mentions: true }, s);
  const sent = [];
  const send = async (sub, payload) => { sent.push(payload); return 201; };
  const t = (await startTopic(ADA, { cat: 'nature', title: 'Moss', body: 'Moss for @Bex, and for @Nobody here', at: ['Bex', 'Nobody here', 'Cy'] }, s, T0, NO_NET)).topic;
  assert.deepEqual(t.posts[0].at, ['Bex', 'Nobody here'], 'a handle the words do not mention was kept, or one they do was not');
  const reply = await replyTopic(BO, t.id, { body: 'Thanks @ada!' }, s, T0 + 1, NO_NET);
  assert.deepEqual(reply.post.at, ['Ada'], 'a topic\'s own people were not found mentioned');
  await notifyForum(t, t.posts[0], '', s, readMods(''), send);
  assert.equal(sent.length, 1);
  assert.deepEqual([sent[0].kind, sent[0].why, sent[0].handle, sent[0].t, sent[0].cat, sent[0].title], ['forum', 'mention', 'Ada', t.id, 'Nature', 'Moss']);
  sent.length = 0;
  await notifyForum(t, { ...t.posts[0], body: 'Moss for @Bex, edited' }, t.posts[0].body, s, readMods(''), send);
  assert.equal(sent.length, 0, 'an edit told somebody again about a mention they had already had');
  const secret = (await startTopic(FBOARD, { cat: 'grantmaking', title: 'A request', body: '@Bex asked about this' }, s, T0, NO_NET)).topic;
  await notifyForum(secret, secret.posts[0], '', s, readMods(''), send);
  assert.equal(sent.length, 0, 'a mention in a category Bex cannot read told Bex');
  await notifyForum(t, { ...t.posts[0], body: 'Moss, and @Bex too', editedBy: 'Mo' }, 'Moss', s, readMods(''), send);
  assert.equal(sent.length === 1 && sent[0].handle, 'Mo', 'a wiki page\'s new mention was put in its starter\'s mouth');
  sent.length = 0;
  await notifyForum(t, { ...t.posts[0], handle: 'Bex', body: 'me, @Bex' }, '', s, readMods(''), send);
  assert.equal(sent.length, 0, 'somebody was told about their own post');
  const found = await forumMentions(BEX, s, T0 + 2);
  assert.deepEqual(found.map((x) => [x.id, x.match.handle]), [[t.id, 'Ada']], 'where Bex was mentioned was not found, or a hidden one was');
  assert.match(found[0].match.words, /@Bex/);
  assert.deepEqual((await forumMentions(ADA, s, T0 + 2)).map((x) => x.match.handle), ['Bo']);
}));

import { notifyProps, PUSH_WORDS } from './lib.mjs';

test('props given tell only their person, with the switch on, as the claimed username, and never the writer', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  // A device switched on as Ada before she claimed the name: her pass then is
  // no pass now, so it is dropped rather than told.
  const before = aDevice();
  await keepDevice(before, issuePass('mobile', 'Ada'), { props: true }, s);
  await claimAccount('Ada', 'a long enough phrase', s, 9, null);
  await setPropsOpen(petKey('Ada'), true, s);
  const pass = issueAccountPass('Ada', (await readAccount('Ada', s)).v);
  const on = aDevice(), quiet = aDevice(), off = aDevice(), bex = aDevice();
  await keepDevice(on, pass, { props: true }, s);
  await keepDevice(quiet, pass, { props: true, words: false }, s);
  await keepDevice(off, pass, { mentions: true, world: true }, s);
  await keepDevice(bex, issuePass('mobile', 'Bex'), { props: true, mentions: true, world: true }, s);
  assert.equal(cleanWant({}).props, false, 'props were on before anybody switched them on');
  const sent = [];
  const send = async (sub, payload) => { sent.push({ to: sub.endpoint, payload }); return 201; };
  const to = (d) => sent.filter((x) => x.to === d.endpoint).map((x) => x.payload);

  const g = await giveProp('ada', writer('Bex'), 'Thank you   for the\nspoons.', s);
  await notifyProps(g.handle, 'Bex', g.given.text, s, readMods(''), send);
  assert.deepEqual(to(on), [{ kind: 'props', handle: 'Bex', text: 'Thank you for the spoons.' }], 'the prop was not said, or said with more than who and the words');
  assert.deepEqual(to(quiet), [{ kind: 'props', handle: 'Bex', text: '' }], 'the words went to a device that turned them off');
  assert.equal(to(off).length, 0, 'a device that never switched props on was told');
  assert.equal(to(bex).length, 0, 'the writer was told about the props they gave');
  assert.equal(to(before).length, 0, 'a pass from before the name was claimed was told');
  assert.ok(!(pushDeviceId(before.endpoint) in await readDevices(s)), 'a device whose pass has gone is still kept');

  sent.length = 0;
  await notifyProps('Ada', 'ADA', 'Me!', s, readMods(''), send);
  assert.equal(sent.length, 0, 'somebody was told about props from themselves');
  await notifyProps('Bex', 'Cy', 'For Bex.', s, readMods(''), send);
  assert.equal(sent.length, 0, 'props for a handle nobody has claimed told the device switched on as it');
  await notifyProps('Ada', 'Cy', 'x'.repeat(PUSH_WORDS + 40), s, readMods(''), send);
  assert.equal([...to(on)[0].text].length, PUSH_WORDS, 'the words were not cut to the notification\'s length');

  sent.length = 0;
  await changePassword('Ada', 'a long enough phrase', 'another long phrase', s);
  await notifyProps('Ada', 'Cy', 'After the change.', s, readMods(''), send);
  assert.equal(sent.length, 0, 'a device was told after its username\'s password changed');
}));

/* ── Direct messages ──────────────────────────────────────────────────────
   Claimed usernames only, at both ends; nobody new until switched on; the
   first message waits; a block refuses both ways and says nothing; every
   message gone 48 hours after it was sent; a moderator reads only what was
   reported to them; nothing counted and the sender's key never sent; gone with
   Forget me and with the username, and a name claimed again is somebody
   else. */
const person = (handle, since, role = 'mobile') => ({ role, handle, roles: new Set(), account: true, since });
async function twoPeople(s) {
  await claimAccount('Ada', 'a long enough phrase', s, 11, null);
  await claimAccount('Bex', 'a long enough phrase', s, 22, null);
  return [person('Ada', 11), person('Bex', 22)];
}

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`fifteen messages into one conversation at once, from both ends, ${how}: none told it went is missing`, () => withPasswords(async () => {
    const s = memoryStore({ etagOnRead });
    const [ada, bex] = await twoPeople(s);
    await setDmOpen(bex, true, s);
    await sendDm(ada, 'Bex', 'hello', s);
    await acceptDm(bex, 'Ada', s);
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) =>
      sendDm(i % 2 ? ada : bex, i % 2 ? 'Bex' : 'Ada', `number ${i}`, s)));
    const worked = told.filter((r) => r.status === 'fulfilled' && r.value.sent).map((r) => r.value.sent.id);
    const kept = new Set((await readDmWith(ada, 'Bex', s)).messages.map((m) => m.id));
    assert.deepEqual(worked.filter((id) => !kept.has(id)), [], 'a message told it went is not in the conversation');
    for (const r of told) if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
    if (etagOnRead) assert.equal(worked.length, 15);
  }));
}

test('messages are for claimed usernames, start only when switched on, and the first one waits', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const [ada, bex] = await twoPeople(s);
  assert.equal((await sendDm({ role: 'mobile', handle: 'Cy', roles: new Set() }, 'Bex', 'hi', s)).error, 'claim', 'an unclaimed handle sent a message');
  assert.equal((await sendDm({ role: 'base', handle: 'Mo', roles: new Set() }, 'Bex', 'hi', s)).error, 'claim', 'the shared moderators’ password sent a message');
  assert.equal((await sendDm(ada, 'Nobody', 'hi', s)).error, 'closed', 'a handle nobody claimed answered differently');
  assert.equal((await sendDm(ada, 'Bex', 'hi', s)).error, 'closed', 'a message went to somebody who had not switched messages on');
  assert.equal((await sendDm(ada, 'ada', 'hi', s)).error, 'self');
  assert.equal((await sendDm(ada, 'Bex', '  \n ', s)).error, 'empty');
  assert.equal((await sendDm(ada, 'Bex', 'x'.repeat(MESSAGE_MAX + 1), s)).error, 'long');
  assert.equal((await readDmWith(ada, 'Bex', s)).can, 'closed');
  await setDmOpen(bex, true, s);
  assert.equal((await readDmWith(ada, 'bex', s)).can, 'yes');
  const first = await sendDm(ada, 'bex', 'Hello, can I ask about the zine?', s);
  assert.equal(first.asked, true);
  assert.equal(first.handle, 'Bex');
  assert.deepEqual(Object.keys(first.sent).sort(), ['by', 'handle', 'id', 't', 'text'], 'a message kept more than its words, its sender and when');
  assert.equal((await sendDm(ada, 'Bex', 'And another thing.', s)).error, 'waiting', 'a second message while the first was waiting');
  let a = await readDmWith(ada, 'Bex', s), b = await readDmWith(bex, 'Ada', s);
  assert.equal(a.state, 'asked'); assert.equal(a.can, 'waiting');
  assert.equal(b.state, 'asking'); assert.equal(b.can, 'yes');
  assert.equal(a.messages[0].mine, true); assert.equal(b.messages[0].mine, undefined);
  for (const m of [...a.messages, ...b.messages]) assert.equal(m.by, undefined, 'a sender’s key left the server');
  // Somebody else sees nothing of it.
  await claimAccount('Cy', 'a long enough phrase', s, 33, null);
  const cy = person('Cy', 33);
  assert.deepEqual((await readDmWith(cy, 'Bex', s)).messages, []);
  assert.deepEqual((await listDms(cy, s)).conversations, []);
  const list = (await listDms(bex, s)).conversations;
  assert.deepEqual(list.map((c) => [c.handle, c.state, c.text]), [['Ada', 'asking', 'Hello, can I ask about the zine?']]);
  assert.equal((await listDms(ada, s)).conversations[0].text, undefined, 'the asker was sent their own request as a preview');
  // Rejected: emptied, and the asker's list simply loses it.
  await rejectDm(bex, 'Ada', s);
  assert.deepEqual((await listDms(ada, s)).conversations, [], 'a rejected request was still there');
  assert.equal((await readDmWith(ada, 'Bex', s)).state, 'new');
  // Asked again and answered, which accepts it.
  await sendDm(ada, 'Bex', 'Sorry to ask again.', s);
  const reply = await sendDm(bex, 'Ada', 'No trouble, go on.', s);
  assert.equal(reply.accepted, true);
  assert.equal((await readDmWith(ada, 'Bex', s)).state, 'open');
  // A conversation going goes on after the switch goes off.
  await setDmOpen(bex, false, s);
  assert.ok((await sendDm(ada, 'Bex', 'Thanks!', s)).sent, 'switching off cut a conversation already going');
  assert.equal((await sendDm(cy, 'Bex', 'hi', s)).error, 'closed', 'somebody new reached a switched-off person');
}));

test('only your own message comes back or changes, and a moderator cannot reach in', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const [ada, bex] = await twoPeople(s);
  await setDmOpen(bex, true, s);
  const one = (await sendDm(ada, 'Bex', 'first', s)).sent.id;
  await acceptDm(bex, 'Ada', s);
  const two = (await sendDm(bex, 'Ada', 'second', s)).sent.id;
  assert.equal((await takeDm(ada, 'Bex', two, s)).error, 'which', 'somebody took back a message they did not send');
  assert.equal((await editDm(ada, 'Bex', two, 'changed', s)).error, 'which', 'somebody edited a message they did not send');
  const at = Date.now() + 1000;
  await editDm(ada, 'Bex', one, 'first, better', s, at);
  const after = (await readDmWith(bex, 'Ada', s)).messages;
  assert.equal(after[0].text, 'first, better'); assert.equal(after[0].edited, at);
  const mo = { role: 'base', handle: 'Mo', roles: new Set(['moderator']) };
  assert.equal((await takeDm(mo, 'Bex', two, s)).error, 'which', 'the shared moderators’ pass took a message off');
  await claimAccount('Mo', 'a long enough phrase', s, 44, null);
  assert.equal((await takeDm({ ...mo, account: true, since: 44 }, 'Bex', two, s)).error, 'which', 'a moderator took a message off somebody else’s conversation');
  assert.deepEqual((await readDmWith({ ...mo, account: true, since: 44 }, 'Bex', s)).messages, [], 'a moderator read somebody else’s conversation');
  await takeDm(ada, 'Bex', one, s);
  await takeDm(bex, 'Ada', two, s);
  assert.deepEqual((await listDms(ada, s)).conversations, [], 'a conversation with nothing in it was still listed');
}));

test('a block refuses both ways, says nothing, empties the conversation and holds if the name is claimed again', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const [ada, bex] = await twoPeople(s);
  await setDmOpen(bex, true, s);
  await sendDm(ada, 'Bex', 'hi', s);
  await acceptDm(bex, 'Ada', s);
  assert.deepEqual(await blockDm(bex, 'ada', s), { blocked: 'Ada' });
  assert.deepEqual((await listDms(ada, s)).conversations, [], 'a block left the conversation');
  assert.equal((await sendDm(ada, 'Bex', 'hello?', s)).error, 'closed', 'somebody blocked was told something other than closed');
  assert.equal((await readDmWith(ada, 'Bex', s)).can, 'closed');
  assert.equal((await sendDm(bex, 'Ada', 'hi', s)).error, 'blocked');
  assert.deepEqual((await listDms(bex, s)).blocked, ['Ada']);
  assert.deepEqual((await listDms(ada, s)).blocked, [], 'somebody was shown who blocked them');
  await deleteAccount('Ada', s);
  await claimAccount('ADA', 'a long enough phrase', s, 55, null);
  assert.equal((await sendDm(person('ADA', 55), 'Bex', 'hi again', s)).error, 'closed', 'deleting and claiming the name again got round a block');
  await unblockDm(bex, 'Ada', s);
  assert.ok((await sendDm(person('ADA', 55), 'Bex', 'hi again', s)).sent);
}));

test('every message goes 48 hours after it was sent, and the conversation with it', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const [ada, bex] = await twoPeople(s);
  await setDmOpen(bex, true, s);
  const t0 = Date.now();
  await sendDm(ada, 'Bex', 'hi', s, t0);
  assert.equal((await readDmWith(bex, 'Ada', s, t0 + LIFE - 1)).messages.length, 1);
  assert.equal((await readDmWith(bex, 'Ada', s, t0 + LIFE)).messages.length, 0, 'a message outlived its 48 hours');
  assert.deepEqual((await listDms(bex, s, t0 + LIFE)).conversations, []);
  await sweepDms(s, t0 + LIFE + 2 * 60 * 60 * 1000);
  assert.deepEqual(s.keys().filter((k) => k.startsWith('dm/') || k.startsWith('dm-with/')), [], 'the sweep left a conversation or a marker behind');
  // Fifty at most.
  await sendDm(ada, 'Bex', 'again', s);
  await acceptDm(bex, 'Ada', s);
  for (let i = 0; i < DM_KEEP + 5; i++) await sendDm(ada, 'Bex', `n${i}`, s);
  assert.equal((await readDmWith(ada, 'Bex', s)).messages.length, DM_KEEP);
}));

test('a report copies one message the other person sent onto the desk, for moderators only', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const [ada, bex] = await twoPeople(s);
  await setDmOpen(bex, true, s);
  const mine = (await sendDm(ada, 'Bex', 'something unkind', s)).sent.id;
  assert.equal((await reportDm(ada, 'Bex', mine, '', s)).error, 'which', 'somebody reported their own message');
  const r = await reportDm(bex, 'Ada', mine, 'Not the first time.', s);
  assert.ok(r.reported);
  assert.equal((await reportDm(bex, 'Ada', mine, '', s)).error, 'again');
  assert.equal(await readReports(bex, s), null, 'somebody who is not a moderator read the desk');
  const mo = { role: 'base', handle: 'Mo', roles: new Set(['moderator']) };
  const desk = await readReports(mo, s);
  assert.deepEqual(desk.map((x) => [x.by, x.of, x.text, x.note]), [['Bex', 'Ada', 'something unkind', 'Not the first time.']]);
  // It stays when the person reported deletes their username, and goes when closed.
  await deleteAccount('Ada', s);
  assert.equal((await readReports(mo, s)).length, 1, 'deleting a username took a report about it off the desk');
  assert.equal((await closeReport(bex, desk[0].id, s)).error, 'base');
  await closeReport(mo, desk[0].id, s);
  assert.deepEqual(await readReports(mo, s), []);
  // And after thirty days by itself.
  await claimAccount('Ada', 'a long enough phrase', s, 66, null);
  const ada2 = person('Ada', 66);
  const id = (await sendDm(ada2, 'Bex', 'hi', s)).sent.id;
  await reportDm(bex, 'Ada', id, '', s);
  assert.equal((await readReports(mo, s, Date.now() + REPORT_DAYS * 24 * 60 * 60 * 1000)).length, 0, 'a report outlived its thirty days');
}));

test('Forget me and deleting the username delete every conversation, and a name claimed again is somebody else', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const [ada, bex] = await twoPeople(s);
  await setDmOpen(ada, true, s);
  await setDmOpen(bex, true, s);
  await sendDm(ada, 'Bex', 'hi', s);
  await forgetDms('Ada', 11, s);
  assert.deepEqual((await listDms(bex, s)).conversations, [], 'Forget me left a conversation with the other person');
  assert.equal((await readDmSet(dmKey('Ada', 11), s)).open, false, 'Forget me left the switch on');
  assert.deepEqual(s.keys().filter((k) => k.startsWith('dm') && k !== 'dm-set/' + dmKey('Bex', 22)), [], 'Forget me left something behind');
  await setDmOpen(ada, true, s);
  assert.ok((await sendDm(bex, 'Ada', 'are you there?', s)).sent);
  assert.equal((await listDms(bex, s)).conversations.length, 1);
  await deleteAccount('Ada', s);
  assert.deepEqual((await listDms(bex, s)).conversations, [], 'deleting the username left a conversation');
  // The same name claimed by somebody new reaches nothing of the old one's.
  await sendDm(ada, 'Bex', 'kept?', s).catch(() => null);
  await claimAccount('Ada', 'a long enough phrase', s, 77, null);
  assert.notEqual(dmKey('Ada', 77), dmKey('Ada', 11));
  assert.deepEqual((await listDms(person('Ada', 77), s)).conversations, [], 'a name claimed again found its old owner’s messages');
}));

test('a message tells only the devices switched on for messages, as that claimed username', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  await claimAccount('Bex', 'a long enough phrase', s, 22, null);
  const acct = await readAccount('Bex', s);
  const on = aDevice(), off = aDevice(), quiet = aDevice();
  await keepDevice(on, issueAccountPass('Bex', acct.v), { messages: true }, s);
  await keepDevice(off, issueAccountPass('Bex', acct.v), { mentions: true }, s);
  await keepDevice(quiet, issueAccountPass('Bex', acct.v), { messages: true, words: false }, s);
  const sent = [];
  const send = async (sub, payload) => { sent.push({ to: sub.endpoint, payload }); return 201; };
  await notifyDm('Bex', 'Ada', 'Hello there', true, s, readMods(''), send);
  assert.deepEqual(sent.map((x) => x.to).sort(), [on.endpoint, quiet.endpoint].sort());
  const told = (to) => sent.find((x) => x.to === to.endpoint).payload;
  assert.deepEqual(told(on), { kind: 'dm', handle: 'Ada', asked: true, text: 'Hello there' });
  assert.equal(told(quiet).text, '', 'a device that switched the words off was sent them');
  sent.length = 0;
  await notifyDm('Bex', 'bex', 'to myself', false, s, readMods(''), send);
  assert.equal(sent.length, 0, 'somebody was told about their own message');
}));

