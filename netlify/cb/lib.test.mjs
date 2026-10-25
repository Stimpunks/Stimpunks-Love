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
  RELEASE_EACH, letOut, callHome, readOut, outIn, releaseTray, shapeOut,
  climb, readStair, cleanStep, putWord, readFridge, fileFridge, readDrawer, drawers, fridgeMark, strikeSentence, cleanWord, monthOf, FRIDGE_DOOR, FRIDGE_WORDS,
  updateChalk, readChalk, updateFence, readFence, waterTree, readTree, PANDO_SOAK, updatePebbles, readPebbles, cleanLink, PEBBLE_ROOMS,
  updateChannel, readChannel, updateTalk, readTalk, beHere, leaveSlake, seenAt, sweepSlake,
  MUD_PLACES, MUD_FRESH, KEEP, LIFE, onAir, sweep,
  hostBeacon, stopBeacon, readBeacons, sweepBeacons, beaconRoom, cleanAt, BEACON_FRESH,
  updateRoomTalk, readRoomTalk, readTuned, updateTuned, sweepRoomTalk, roomTag,
  callToken, callSrc, callsReady, tidyPem, JAAS_APP, CALL_HOURS,
  PUBLIC_CALLS, publicCall, callSettings, WORLD_CALL, MOD_ROOMS, STRICT_ROOMS, roomAllows, shapeBeacons, QUIET_ROOMS, quietRoom,
  ROLES, foldHandle, readMods, signOn, issuePass, readPass, rolesOf, STARTER_GONE, checkHandle, checkInvite, joinAccount,
  makeInvite, listInvites, deleteInvite, readInvites, INVITE_USES, INVITE_DAYS, INVITE_KEEP, makeInviteCode,
  emailOn, cleanAddress, accountEmail, setAccountEmail, mailResetCode, ACCT_MAIL_FOR, ACCT_MAIL_GAP, ACCT_MAIL_SUBJECT,
  renamePet, shapeAnimal, parseBrass, brassHtml, brassHref, brassFeed, readBrass, shapeBrass, addBrass, editBrass, removeBrass, putBrassImage, getBrassImage, sweepBrassImages,
  readNotice, shapeNotice, setNotice, clearNotice, cleanNotice, noticeId, NOTICE_FIRST, NOTICE_MAX,
  readSuggestions, shapeSuggestion, addSuggestion, replySuggestion, editSuggestionReply, removeSuggestionReply, meTooSuggestion, removeSuggestion, SUGGEST_KEEP, SUGGEST_BODY_MAX, putSuggestImage, getSuggestImage, sweepSuggestImages, SUGGEST_PICS, REACTIONS, reactionOf, toggleReaction, canTakeOff, canEdit, editMessage, channelMentions, MENTION_MAX, SMALL_SPECIES, SMALL_COATS, SMALL_MARKS, animalNoun, ANIMAL_ID, setShown, isShown, shownPets, stickerOf, shapeSticker, issueAccountPass, accountAnswer, isMod, claimAccount, checkPassword, changePassword, recoverAccount, resetAccount, deleteAccount,
  readAccount, acctKey, cleanCode, ACCT_TRIES, ACCT_LOCK, ACCT_RESET_FOR,
  kickAccount, barAccount, liftBar, barredNow, barWords, shapeBar, accountDirectory, BAR_FOR,
  imageKind, carriesMetadata, putImage, getImage, droppedImages, sweepImages, shape, IMG_MAX,
  cleanMessage, MESSAGE_MAX, cleanText,
  cleanLook, readAvatars, keepAvatar, editAvatar, removeAvatar, wearAvatar, forgetAvatars, withAvatars, avatarSticker, shapeAvatarSticker, AVATAR, AVATAR_KEEP,
  setAvatarsShown, avatarsShown, shownAvatars,
  CHIMERA, CHIMERA_KEEP, cleanChimera, readChimeras, keepChimera, editChimera, removeChimera, forgetChimeras, setChimerasShown, chimerasShown, shownChimeras, chimeraSticker, shapeChimeraSticker, shape as shapeMessages,
  CHIMERA_SAYINGS, CHIMERA_SAYING_MAX, cleanChimeraSayings, cleanFamiliar, showFamiliar, familiarOut, withFamiliars, shapeChimera,
  QUEST_IDS, questIds, readJobs, keepJobs, forgetJobs, setJobsShown, jobsShown, shownJobs,
  PATCH_IDS, patchId, readPatches, takePatch, forgetPatches, setPatchesShown, patchesShown, shownPatches, patchSticker, shapePatchSticker, jacketSticker, shapeJacketSticker,
  cleanVideo, beSeen, unseen, sweepSeen, whoSeen, ROOM_FRESH, jaasSigned, callEventRoom, callEvent, inCall, callsOn, sweepCalls,
  PROFILE_KEYS, cleanProfile, cleanProfileLink, cleanBio, readProfile, keepProfile, forgetProfile, clearProfile, shownProfile, withPlates, BIO_MAX, PROFILE_LINKS,
  TAGLINE_MAX, communityDirectory,
  CHAT_STATUSES, cleanChatStatus, setChatStatus, chatStatusOf, withChatStatus, forgetChatStatus,
  PROP_MAX, PROPS_KEEP, PROPS_WAITING, cleanProp, readProps, giveProp, confirmProp, rejectProp, dropProp, setPropsOpen, forgetProps, ownProps, shownProps } from './lib.mjs';
import { generateKeyPairSync, createVerify, createECDH, randomBytes as rnd, verify as cryptoVerify, createPublicKey, createHmac } from 'node:crypto';
import { encryptPush, vapidAuth, pushPublicKey, cleanSubscription, cleanWant, keepDevice, readDevices, readDevice, dropDevice, dropDevicesOf,
  mentions, notifyMessage, notifyEdit, notifyCall, pushDeviceId, PUSH_PER_HANDLE, CALL_QUIET, followsRoom } from './lib.mjs';
import { readWireXml, runFeedBot, keepBot, feedRooms, FEED_KEEP, FEED_RUN, FEED_NAMES, botWord, shapeFeed } from './lib.mjs';
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
      if (!/^(mud-here|room-here|call-in|call-left|img|brass-img|suggest-img|forum-up|forum-file|dm-img|dm-report-img)\//.test(key)) throw new Error('an unconditional write outside presence: ' + key);
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

test('a message keeps the handles it @mentions only if its words name them', () => {
  assert.deepEqual(channelMentions('hi @Ada and @Bo Peep, see you', ['Ada', 'Bo Peep', 'Cy', 'ada']), ['Ada', 'Bo Peep'],
    'a handle the words never name was kept, or one was kept twice');
  assert.deepEqual(channelMentions('back at @34:12', ['34']), [], 'a place in a film was read as a mention');
  assert.deepEqual(channelMentions('mail ada@example.org', ['example']), [], 'an email address was read as a mention');
  assert.deepEqual(channelMentions('@Ada', 'Ada'), [], 'something that is not a list was read as one');
  assert.deepEqual(channelMentions('@Ada', [{ toString() { return 'Ada'; } }, 7]), [], 'something that is not a handle was kept');
  const many = Array.from({ length: 20 }, (_, i) => `p${i}`);
  assert.equal(channelMentions(many.map((h) => '@' + h).join(' '), many).length, MENTION_MAX, 'a message kept more mentions than it may');
  assert.deepEqual(shape([{ id: 'a', handle: 'Ada', text: '@Bo', t: 1, at: ['Bo'] }])[0].at, ['Bo'], 'the radio is not told who a message mentions');
  assert.equal(shape([{ id: 'a', handle: 'Ada', text: 'hi', t: 1 }])[0].at, undefined);
  const asAda = { role: 'mobile', handle: 'Ada', roles: new Set() };
  const list = [{ id: 'a', handle: 'Ada', text: 'hi @Bo', t: 1, at: ['Bo'] }];
  assert.deepEqual(editMessage(list, 'a', 'hi @Bo and @Cy', asAda, 2, ['Cy']).list[0].at, ['Cy', 'Bo'], 'an edit lost a mention it still makes');
  assert.equal('at' in editMessage(list, 'a', 'hi there', asAda, 2).list[0], false, 'an edit kept a mention its words no longer make');
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

// THE NOTICE.
test('the notice: the first one is up until a moderator changes it, and only a moderator does', async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.equal((await readNotice(s)).text, NOTICE_FIRST.text, 'the first notice is not up before anybody has touched it');
  const pub = shapeNotice(await readNotice(s));
  assert.deepEqual(Object.keys(pub).sort(), ['ast', 'id', 'text'], 'a page is told more than the words and their id');
  assert.equal(pub.id, noticeId(NOTICE_FIRST.text));
  assert.match(pub.id, /^[0-9a-f]{16}$/);
  assert.equal(pub.ast.length, 1); assert.equal(pub.ast[0].t, 'p');
  assert.ok(pub.ast[0].c.some((n) => n.t === 'a' && n.href === 'https://randocloud.cloud/'), 'the first notice lost its link');
  assert.ok((await setNotice(ANY, 'Hello', s)).error, 'somebody who is not a moderator put a notice up');
  assert.ok((await clearNotice(ANY, s)).error, 'somebody who is not a moderator took the notice down');
  for (const bad of ['', '   ', '# A heading', '- a list', '> a quote', 'two\nlines', 'x'.repeat(NOTICE_MAX + 1)]) {
    assert.ok((await setNotice(MOD, bad, s)).error, 'a notice that is not one line went up: ' + JSON.stringify(bad.slice(0, 20)));
  }
  assert.equal((await readNotice(s)).text, NOTICE_FIRST.text, 'a refused notice changed the one up');
  const { notice } = await setNotice(MOD, 'Gathering on **Sunday**.', s, 30);
  assert.equal(notice.by, 'Juniper'); assert.equal(notice.t, 30);
  assert.equal(shapeNotice(await readNotice(s)).ast[0].c[1].t, 'b');
  assert.notEqual(shapeNotice(await readNotice(s)).id, pub.id, 'a new notice kept the old one\'s id, so it would stay put away');
  await setNotice(MOD2, 'Gathering on **Sunday**.', s, 35);
  assert.equal(shapeNotice(await readNotice(s)).id, noticeId('Gathering on **Sunday**.'), 'the same words put up again by somebody else changed the id');
  assert.equal((await clearNotice(MOD2, s, 40)).cleared, true, 'another moderator could not take it down');
  const down = await readNotice(s);
  assert.equal(down.text, null); assert.equal(down.by, 'Quill'); assert.equal(shapeNotice(down), null);
  assert.ok((await clearNotice(MOD, s)).error, 'a notice that was not up was taken down');
  assert.ok(cleanNotice('One line, with [a link](/map.html).'), 'a link on the street was refused');
});

test('the notice: taking the first one down keeps it down', async () => {
  const s = memoryStore({ etagOnRead: false });
  assert.equal((await clearNotice(MOD, s, 5)).cleared, true);
  assert.equal(shapeNotice(await readNotice(s)), null, 'the first notice came back after it was taken down');
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

test('the suggestion box: whoever asked and any moderator reply, as often as it takes, and only a moderator marks it', async () => {
  const s = memoryStore({ etagOnRead: true });
  const BO = { ...ANY, handle: 'Bo' };
  const { item } = await addSuggestion(ANY, { kind: 'feature', title: 'A kite', body: 'Please.' }, s);
  const shown = async () => shapeSuggestion((await readSuggestions(s))[0]);
  assert.ok((await replySuggestion(null, item.id, { body: 'x' }, s)).error, 'somebody signed off replied');
  assert.ok((await replySuggestion(BO, item.id, { body: 'Me too' }, s)).error, 'somebody who is neither the asker nor a moderator replied');
  assert.ok((await replySuggestion(MOD, item.id, { body: ' ' }, s)).error, 'a reply with nothing in it');
  assert.ok((await replySuggestion(MOD, item.id, { body: 'x', status: 'maybe' }, s)).error, 'a mark that is not one of the three');
  assert.ok((await replySuggestion(ANY, item.id, { body: 'Done, surely', status: 'done' }, s)).error, 'whoever asked marked it');
  assert.ok((await replySuggestion(MOD, 'gone', { body: 'x' }, s)).error, 'a reply to nothing');
  await replySuggestion(MOD, item.id, { body: 'Which **colour**?' }, s, 50);
  await replySuggestion({ ...ANY, handle: ' ada ' }, item.id, { body: 'Red, please.' }, s, 60);
  let r = await shown();
  assert.equal(r.status, 'open', 'a reply with no mark closed it');
  assert.deepEqual(r.replies.map((x) => [x.handle, x.t, x.body, !!x.base]), [['Juniper', 50, 'Which **colour**?', true], [' ada ', 60, 'Red, please.', false]], 'the thread is not both replies, oldest first');
  assert.equal(r.replies[0].ast[0].c[1].t, 'b');
  const { reply: marked } = await replySuggestion(MOD2, item.id, { body: 'Up now.', status: 'done' }, s, 70);
  r = await shown();
  assert.deepEqual([r.status, r.replies[2].status], ['done', 'done'], 'a moderator could not mark it done');
  await replySuggestion(ANY, item.id, { body: 'Thank you!' }, s, 80);
  assert.equal((await shown()).status, 'done', 'a reply after the mark changed where it stands');
  await replySuggestion(MOD, item.id, { body: 'Still done.', status: 'done' }, s, 90);
  assert.equal((await shown()).replies[4].status, undefined, 'a mark that changed nothing was kept');
  // Taking the reply that marked it down takes the mark with it.
  assert.ok((await removeSuggestionReply(ANY, item.id, marked.id, s)).error, 'whoever asked took a moderator\'s reply down');
  assert.equal((await removeSuggestionReply(MOD, item.id, marked.id, s)).removed, true);
  assert.equal((await shown()).status, 'open', 'the mark outlived the reply that made it');
  await replySuggestion(MOD, item.id, { body: 'Not this year.', status: 'denied' }, s, 100);
  await replySuggestion(MOD, item.id, { body: 'Opened again.', status: 'open' }, s, 110);
  assert.equal((await shown()).status, 'open', 'opening it again did not open it');
});

test('the suggestion box: a reply is edited only by whoever wrote it, and taken down by them or a moderator', async () => {
  const s = memoryStore({ etagOnRead: true });
  const { item } = await addSuggestion(ANY, { kind: 'bug', title: 'The kite', body: 'It will not fly.' }, s);
  const { reply: mine } = await replySuggestion(ANY, item.id, { body: 'In Firefox.' }, s, 10);
  const { reply: mods } = await replySuggestion(MOD, item.id, { body: 'Fixed.', status: 'done' }, s, 20);
  assert.ok((await editSuggestionReply(MOD, item.id, mine.id, { body: 'Chrome.' }, s)).error, 'a moderator rewrote somebody\'s reply');
  assert.ok((await editSuggestionReply(MOD2, item.id, mods.id, { body: 'Not fixed.' }, s)).error, 'one moderator rewrote another\'s reply');
  assert.ok((await editSuggestionReply(ANY, item.id, mine.id, { body: '  ' }, s)).error, 'a reply edited down to nothing');
  await editSuggestionReply(ANY, item.id, mine.id, { body: 'In Firefox 140.' }, s, 30);
  await editSuggestionReply(MOD, item.id, mods.id, { body: 'Fixed, really.' }, s, 40);
  const r = shapeSuggestion((await readSuggestions(s))[0]);
  assert.deepEqual(r.replies.map((x) => [x.body, x.edited]), [['In Firefox 140.', 30], ['Fixed, really.', 40]]);
  assert.equal(r.status, 'done', 'editing a reply took its mark off');
  assert.ok((await removeSuggestionReply({ ...ANY, handle: 'Bo' }, item.id, mine.id, s)).error, 'somebody else took a reply down');
  assert.equal((await removeSuggestionReply(ANY, item.id, mine.id, s)).removed, true, 'whoever wrote it could not take it down');
  assert.ok((await removeSuggestionReply(ANY, item.id, mine.id, s)).error, 'taken down twice');
});

test('the suggestion box: an answer from before the thread is its first reply', async () => {
  const s = memoryStore({ etagOnRead: true });
  const item = { id: '0b5e3c1a-1111-4222-8333-444455556666', kind: 'bug', title: 'Old', body: 'From before.', handle: 'Ada', t: 1,
    answer: { status: 'denied', body: 'Not yet.', handle: 'Juniper', t: 5 } };
  await s.setJSON('suggestions', { items: [item] }, { onlyIfNew: true });
  let r = shapeSuggestion((await readSuggestions(s))[0]);
  assert.deepEqual([r.status, r.replies.length, r.replies[0].body, r.replies[0].status, r.replies[0].base], ['denied', 1, 'Not yet.', 'denied', true]);
  await replySuggestion(ANY, item.id, { body: 'Please?' }, s, 6);
  const raw = (await readSuggestions(s))[0];
  assert.equal(raw.answer, undefined, 'the old answer was kept beside the thread');
  r = shapeSuggestion(raw);
  assert.deepEqual(r.replies.map((x) => x.body), ['Not yet.', 'Please?']);
  assert.equal((await editSuggestionReply(MOD, item.id, r.replies[0].id, { body: 'Not this year.' }, s)).item.replies[0].body, 'Not this year.', 'the old answer could not be edited as a reply');
});

test('the suggestion box: Me too names who it affects, never how many, and takes back', async () => {
  const s = memoryStore({ etagOnRead: true });
  const { item } = await addSuggestion(ANY, { kind: 'feature', title: 'Ramps', body: 'Everywhere.' }, s);
  assert.ok((await meTooSuggestion(null, item.id, s)).error, 'somebody signed off said me too');
  assert.ok((await meTooSuggestion(ANY, item.id, s)).error, 'whoever asked said me too');
  assert.ok((await meTooSuggestion(MOD, 'gone', s)).error, 'me too on nothing');
  assert.equal((await meTooSuggestion({ ...ANY, handle: 'Zed' }, item.id, s)).on, true);
  assert.equal((await meTooSuggestion({ ...ANY, handle: 'bo' }, item.id, s)).on, true);
  assert.equal((await meTooSuggestion(MOD, item.id, s)).on, true);
  let r = shapeSuggestion((await readSuggestions(s))[0]);
  assert.deepEqual(r.metoo, ['bo', 'Juniper', 'Zed'], 'Me too is not by name, alphabetically');
  assert.ok(!Object.values(r).some((v) => typeof v === 'number' && v === 3), 'Me too sent a count');
  assert.equal((await meTooSuggestion({ ...ANY, handle: ' BO ' }, item.id, s)).on, false, 'pressing again did not take it back');
  r = shapeSuggestion((await readSuggestions(s))[0]);
  assert.deepEqual(r.metoo, ['Juniper', 'Zed']);
  await meTooSuggestion({ ...ANY, handle: 'Zed' }, item.id, s); await meTooSuggestion(MOD, item.id, s);
  assert.equal(shapeSuggestion((await readSuggestions(s))[0]).metoo, undefined, 'an empty Me too was sent');
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

test('the suggestion box: a picture is redrawn, described, looked at, and shown only while the box holds it', async () => {
  const s = memoryStore({ etagOnRead: true });
  const raw = async (id) => s.get('suggest-img/' + id, { type: 'arrayBuffer' });
  assert.ok((await putSuggestImage(null, jpeg(), s)).error, 'somebody signed off added a picture');
  const withExif = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x10]), Buffer.from('Exif\u0000\u0000'), Buffer.alloc(64)]);
  assert.ok((await putSuggestImage(ANY, new Uint8Array(withExif), s)).error, 'a picture still carrying camera data went in');
  assert.ok((await putSuggestImage(ANY, new Uint8Array(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')), s)).error, 'an SVG went in');
  const { id } = await putSuggestImage(ANY, jpeg(), s, 0);
  assert.equal(await getSuggestImage(id, s), null, 'a picture nothing in the box holds was shown');
  const ask = (pics, more) => ({ kind: 'bug', title: 'The castle', body: 'It fell.', pics, ...more });
  assert.ok((await addSuggestion(ANY, ask([{ id }]), s)).error, 'a picture with no description');
  assert.ok((await addSuggestion(ANY, ask([{ id, alt: 'The castle, fallen' }]), s)).error, 'a picture nobody said they had looked at');
  assert.ok((await addSuggestion({ ...ANY, handle: 'Bo' }, ask([{ id, alt: 'x' }], { yes: true }), s)).error, 'somebody put somebody else\'s picture in the box');
  const many = [];
  for (let i = 0; i <= SUGGEST_PICS; i++) many.push({ id: (await putSuggestImage(ANY, jpeg(), s, 0)).id, alt: 'x' });
  assert.ok((await addSuggestion(ANY, ask(many, { yes: true }), s)).error, 'more pictures than a suggestion holds');
  const { item } = await addSuggestion(ANY, ask([{ id, alt: 'The castle, fallen' }], { yes: true }), s);
  assert.deepEqual(shapeSuggestion((await readSuggestions(s))[0]).pics, [{ id, alt: 'The castle, fallen' }]);
  assert.ok(await getSuggestImage(id, s), 'a picture in the box was not shown');
  assert.ok((await addSuggestion(ANY, ask([{ id, alt: 'Again' }], { yes: true }), s)).error, 'one picture went in the box twice');
  // A reply carries pictures too, and lets go of them when it is edited or taken down.
  const { id: a1 } = await putSuggestImage(MOD, jpeg(), s, 0);
  assert.ok((await replySuggestion(MOD, item.id, { body: 'Fixed.', pics: [{ id: a1, alt: 'Standing' }] }, s)).error, 'a reply\'s picture nobody said they had looked at');
  assert.ok((await replySuggestion(MOD2, item.id, { body: 'Fixed.', pics: [{ id: a1, alt: 'Standing' }], yes: true }, s)).error, 'a moderator put another moderator\'s upload in');
  const { reply } = await replySuggestion(MOD, item.id, { body: 'Fixed.', pics: [{ id: a1, alt: 'Standing' }], yes: true }, s);
  assert.deepEqual(shapeSuggestion((await readSuggestions(s))[0]).replies[0].pics, [{ id: a1, alt: 'Standing' }]);
  assert.ok(await getSuggestImage(a1, s), 'a reply\'s picture was not shown');
  const { id: a2 } = await putSuggestImage(MOD, jpeg(), s, 0);
  await editSuggestionReply(MOD, item.id, reply.id, { body: 'Fixed again.', pics: [{ id: a1, alt: 'Standing up' }, { id: a2, alt: 'Closer' }], yes: true }, s);
  assert.deepEqual(shapeSuggestion((await readSuggestions(s))[0]).replies[0].pics.map((x) => x.alt), ['Standing up', 'Closer'], 'a kept picture was not kept');
  await editSuggestionReply(MOD, item.id, reply.id, { body: 'Just words.', pics: [{ id: a2, alt: 'Closer' }], yes: true }, s);
  assert.equal(await raw(a1), null, 'a picture outlived the edit that let go of it');
  await removeSuggestionReply(MOD, item.id, reply.id, s);
  assert.equal(await raw(a2), null, 'a picture outlived the reply taken down');
  assert.ok(await getSuggestImage(id, s), 'taking a reply down took the suggestion\'s own picture');
  const { id: a3 } = await putSuggestImage(ANY, jpeg(), s, 0);
  await replySuggestion(ANY, item.id, { body: 'Here it is again.', pics: [{ id: a3, alt: 'Fallen again' }], yes: true }, s);
  await removeSuggestion(ANY, item.id, s);
  assert.equal(await getSuggestImage(id, s), null, 'a picture was shown after its suggestion was taken down');
  assert.equal(await raw(id), null, 'a picture outlived its suggestion');
  assert.equal(await raw(a3), null, 'a reply\'s picture outlived its suggestion');
  // An upload nothing takes is swept after its day, and never before.
  const { id: stray } = await putSuggestImage(ANY, jpeg(), s, 0);
  await sweepSuggestImages(s, 1000);
  assert.ok(await raw(stray), 'an upload was swept before its day was up');
  await sweepSuggestImages(s, 2 * 24 * 60 * 60 * 1000);
  assert.equal(await raw(stray), null, 'an upload nothing holds was never swept');
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
  // A sentence's id is random and can spell anything, so the handle is looked for everywhere but there.
  assert.ok(!JSON.stringify({ ...kept, door: kept.door.map(({ id, ...rest }) => rest) }).toLowerCase().includes('ada'));
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

/* PETS LET OUT AT THE CAFÉ AND THE RUN. Only your own pet goes out; the room
   is told it has a home and never whose; three of yours at a time; the
   shelter's animals and the pets out share SHELTER_KEEP, and the ones out last
   wait at the gate when the shelter fills; renaming, the base taking a name
   off, calling home, Forget me and deleting the username all reach the copy. */
async function adoptMany(kind, pks, s, t0 = 5) {
  let t = t0;
  const ids = [];
  for (const pk of pks) {
    const w = (await readShelter(kind, s, t)).waiting;
    await rescueAnimal(kind, w.id, `N${ids.length}`, s, t, () => 1);
    await adoptAnimal(kind, w.id, pk, s, t + 1);
    ids.push(w.id);
    t += 2;
  }
  return { ids, t };
}

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`pets let out fifteen at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const pks = Array.from({ length: 15 }, (_, i) => `pk${i}`);
    const { ids } = await adoptMany('dog', pks, s);
    const told = await Promise.allSettled(pks.map((pk, i) => letOut('dog', pk, ids[i], s)));
    const out = await readOut('dog', s);
    told.forEach((r, i) => { if (r.status === 'fulfilled' && r.value.out) assert.ok(out.some((e) => e.by === pks[i] && e.pet.id === ids[i]), 'a pet told it was out is not there'); });
    for (const r of told) if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
    assert.equal(new Set(out.map((e) => e.pet.id)).size, out.length, 'a pet is out twice');
    if (etagOnRead) assert.equal(out.length, 15);
  });
}

test('only your own pet goes out, the room never says whose, and calling home, Forget me and deleting the username bring it in', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const ada = petKey('Ada'), bex = petKey('Bex');
  const { ids: [cat] } = await adoptMany('cat', [ada], s);
  const { ids: [dog], t } = await adoptMany('dog', [ada], s, 50);
  assert.equal((await letOut('cat', bex, cat, s)).why, 'mine', 'somebody let out a cat that is not theirs');
  assert.equal((await letOut('dog', ada, cat, s)).why, 'mine', 'a cat went out on the Run');
  assert.deepEqual(await letOut('cat', ada, cat, s), { out: true });
  assert.deepEqual(await letOut('cat', ada, cat, s), { out: true }, 'letting out a cat already out did not say so');
  assert.equal((await readOut('cat', s)).length, 1, 'a cat went out twice');
  // The room is shown the cat, its name and its looks, and never whose.
  const shown = await outIn('cat', 0, s);
  assert.equal(shown.length, 1); assert.equal(shown[0].name, 'N0'); assert.equal(shown[0].out, true);
  assert.ok(!JSON.stringify(shown).includes(ada), 'the room is told whose the cat is');
  assert.equal(shown[0].t, undefined); assert.equal(shown[0].at, undefined, 'the room is told when the cat came or was adopted');
  assert.deepEqual(Object.keys((await readOut('cat', s))[0].pet).sort(), ['coat', 'id', 'kind', 'mark', 'mood', 'name', 'place'], 'the copy keeps something more');
  assert.deepEqual(Object.keys((await readOut('cat', s))[0]).sort(), ['by', 'pet']);
  assert.equal(shapeOut({ ...(await readOut('cat', s))[0].pet, by: ada }).by, undefined);
  // A rename and the base taking a name off reach the copy.
  await renamePet(ada, cat, 'Moth', s);
  assert.equal((await outIn('cat', 0, s))[0].name, 'Moth', 'a rename did not reach the café');
  await unnameAnimal('cat', cat, s);
  assert.equal((await outIn('cat', 0, s))[0].name, '', 'the base took a name off and the café kept it');
  // The tray says which of yours are out; another person's tray says nothing of them.
  assert.equal((await releaseTray('cat', ada, s))[0].out, true);
  assert.equal((await releaseTray('cat', bex, s)).length, 0);
  await callHome('cat', ada, cat, s);
  assert.equal((await readOut('cat', s)).length, 0, 'called home and still out');
  await callHome('cat', ada, cat, s);
  // Forget me calls every pet home, in every room.
  await letOut('cat', ada, cat, s); await letOut('dog', ada, dog, s);
  await forgetPets(ada, s);
  assert.equal((await readOut('cat', s)).length + (await readOut('dog', s)).length, 0, 'Forget me left a pet out');
  // And so does deleting the username.
  const again = await adoptMany('dog', [petKey('Cy')], s, t + 10);
  await claimAccount('Cy', 'a long enough phrase', s, t + 20, null);
  await letOut('dog', petKey('Cy'), again.ids[0], s);
  await deleteAccount('Cy', s);
  assert.equal((await readOut('dog', s)).length, 0, 'a deleted username left a dog out');
}));

test('three of yours at a time, and the shelter and the pets out share its places, the newest out waiting at the gate', async () => {
  const s = memoryStore({ etagOnRead: true });
  const many = Array.from({ length: RELEASE_EACH + 1 }, () => 'pkA');
  const { ids, t } = await adoptMany('dog', many, s);
  for (const id of ids.slice(0, RELEASE_EACH)) assert.deepEqual(await letOut('dog', 'pkA', id, s), { out: true });
  assert.equal((await letOut('dog', 'pkA', ids[RELEASE_EACH], s)).why, 'each', 'one person let out more than RELEASE_EACH');
  // Fill the shelter until the room is full, and the next one out is refused.
  let now = t;
  while ((await readShelter('dog', s, now)).shelter.length + RELEASE_EACH < SHELTER_KEEP) {
    const w = (await readShelter('dog', s, now)).waiting;
    await rescueAnimal('dog', w.id, '', s, now, () => 1);
    now += 2;
  }
  const b = await adoptMany('dog', ['pkB'], s, now);
  assert.equal((await letOut('dog', 'pkB', b.ids[0], s)).why, 'full', 'a pet went out into a full room');
  await callHome('dog', 'pkA', ids[0], s);
  assert.deepEqual(await letOut('dog', 'pkB', b.ids[0], s), { out: true }, 'a place came free and nobody could use it');
  // The shelter takes in one more: the last pet out waits at the gate, and the
  // shelter's animals are never the ones left outside.
  const w = (await readShelter('dog', s, b.t)).waiting;
  assert.equal((await rescueAnimal('dog', w.id, '', s, b.t, () => 1)).rescued, true, 'the pets out kept an animal waiting outside the shelter');
  const inShelter = (await readShelter('dog', s, b.t + 1)).shelter.length;
  const room = await outIn('dog', inShelter, s);
  assert.equal(inShelter + room.length, SHELTER_KEEP, 'the room holds more animals than it has places for');
  assert.deepEqual(room.map((a) => a.id), ids.slice(1, RELEASE_EACH), 'the first out were not the ones in the room');
  const tray = await releaseTray('dog', 'pkB', s);
  assert.equal(tray[0].out, true); assert.equal(tray[0].gate, true, 'the tray does not say the pet is waiting at the gate');
  assert.equal((await releaseTray('dog', 'pkA', s)).filter((a) => a.gate).length, 0);
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
  for (const b of all) assert.deepEqual(Object.keys(b).sort(), ['at', 'base', 'film', 'handle', 'length', 'list', 'live', 'playing', 'room', 't', 'video']);
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

/* A film in a YouTube list says which list, so a follower's radio can move
   along it with the host (2026-10-20). Only a list id's shape is kept: never a
   mix, which is each listener's own, never anything else, and never on a live
   beacon, which has no place in anything to keep in step with. */
test('a beacon keeps the list its film is in, and nothing shaped otherwise', async () => {
  const s = memoryStore({ etagOnRead: true });
  const album = 'OLAK5uy_ngX5UfQV3KBXD2cBpUFU1i4haE6dihe1Q';
  const cyd = { role: 'mobile', handle: 'Cyd' }, dee = { role: 'mobile', handle: 'Dee' };
  await hostBeacon(ada, 'solarpunk-hermitage', 'Dedicated To You', 12, true, s, Date.now(), 'MP_NqRR2Nzo', 332, false, album);
  await hostBeacon(bex, 'the-den', 'A film', 30, true, s, Date.now(), 'dQw4w9WgXcQ', 212, false, 'RDdQw4w9WgXcQ');
  await hostBeacon(cyd, 'club-chronic', 'A song', 3, true, s, Date.now(), null, null, false, 'not a list id!');
  await hostBeacon(dee, 'the-jungle-room', 'A live cam', 0, true, s, Date.now(), 'dQw4w9WgXcQ', null, true, album);
  const all = shapeBeacons(await readBeacons(s)), of = (r) => all.find((b) => b.room === r).list;
  assert.equal(of('solarpunk-hermitage'), album);
  assert.equal(of('the-den'), null, 'a mix is not kept');
  assert.equal(of('club-chronic'), null, 'anything not shaped like a list id is not kept');
  assert.equal(of('the-jungle-room'), null, 'a live beacon keeps no list');
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

test('only the base moderates a room\'s call, records or transcribes; nobody streams or dials out', () => {
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

/* Ryan's call, 2026-10-24: in the public calls only guests knock. 8x8 lets
   nobody but a moderator past the lobby, so every account is one there, and
   only there, and gets no recording or transcription for it. */
test('every account moderates the public calls, and only those, so only guests wait in the lobby', () => {
  const member = { role: 'mobile', handle: 'Ada', roles: new Set(), account: true };
  for (const room of PUBLIC_CALLS) {
    const c = open(callToken(member, room, Date.now(), key)).body.context;
    assert.equal(c.user.moderator, 'true', `${room}: an account walks straight in`);
    assert.equal(c.features.recording, false, 'moderating is not recording');
    assert.equal(c.features.transcription, false, 'or transcribing');
  }
  for (const room of ['the-den', WORLD_CALL])
    assert.equal(open(callToken(member, room, Date.now(), key)).body.context.user.moderator, 'false', `${room}: still the base's to moderate`);
  const noAccount = { role: 'mobile', handle: 'Ada', roles: new Set() };
  assert.equal(open(callToken(noAccount, PUBLIC_CALLS[0], Date.now(), key)).body.context.user.moderator, 'false', 'no account, no moderator');
  const guest = { role: 'guest', handle: 'Ada', account: true };
  assert.equal(open(callToken(guest, PUBLIC_CALLS[0], Date.now(), key)).body.context.user.moderator, 'false', 'a guest knocks, whatever it carries');
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

test('sign-on: a claimed username\'s own password only; the starter password is retired, and the MOD password sends a moderator to claim', async () => {
  const S = memoryStore({ etagOnRead: true });
  const was = [process.env.CB_PASSWORD, process.env.CB_MOD_PASSWORD];
  process.env.CB_PASSWORD = 'community-pw'; process.env.CB_MOD_PASSWORD = 'moderators-pw';
  try {
    const mods = readMods('{"Ryan":["administrator"],"Helen":["director"]}');
    const r = (await signOn('ryan', 'moderators-pw', mods, S));
    assert.deepEqual(r, { claim: true, mod: true, handle: 'Ryan' }, 'a moderator on the shared password was given a pass rather than sent to claim');
    assert.ok((await signOn('Somebody', 'moderators-pw', mods, S)).error, 'not on the list');
    assert.equal((await signOn('Ryan ', 'community-pw', mods, S)).error, STARTER_GONE);
    assert.equal((await signOn('Ada', 'community-pw', mods, S)).error, STARTER_GONE, 'the starter password still signs somebody on');
    assert.equal((await signOn('Ada', 'community-pw', null, S)).error, STARTER_GONE);
    assert.ok((await signOn('Ryan', 'moderators-pw', null, S)).error, 'no readable list, no MOD sign-on');
    assert.ok((await signOn('Ada', 'wrong', mods, S)).error);
    assert.ok(!(await signOn('Ada', 'wrong', mods, S)).claim);
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
    // A pass from a shared password is read only for claiming the username it is on.
    const U = { unclaimed: true };
    const basePass = issuePass('base', 'Helen'), comPass = issuePass('mobile', 'Ada');
    const before = readMods('{"Helen":["director"]}'), after = readMods('{"Helen":["director","board"]}');
    assert.deepEqual(rolesOf((await readPass(req(basePass), before, S, U))), ['director', 'moderator']);
    assert.deepEqual(rolesOf((await readPass(req(basePass), after, S, U))), ['board', 'director', 'moderator'], 'a new role, no new pass');
    assert.equal((await readPass(req(basePass), readMods('{"Ryan":["administrator"]}'), S, U)), null, 'taken off the list');
    assert.equal((await readPass(req(basePass), null, S, U)), null, 'no readable list, no base pass');
    assert.equal((await readPass(req(comPass), before, S, U)).role, 'mobile');
    assert.equal((await readPass(req(comPass), readMods('{"Ada":[]}'), S, U)), null, 'a community pass for a handle now reserved');
    assert.equal((await readPass(req(comPass), null, S, U)).role, 'mobile');
    assert.equal(await readPass(req(comPass), before, S), null, 'a pass from the starter password opened something other than claiming');
    assert.equal(await readPass(req(basePass), before, S), null, 'a pass from the moderators\' password opened something other than claiming');
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
// EVERYBODY HAS CLAIMED A USERNAME since 2026-10-21, so a pass in a test is a
// claimed username's: a pass from a shared password is good only for claiming.
async function claimedPassFor(handle, s, role = 'mobile') {
  await claimAccount(handle, `${handle} has a long phrase`, s, 1, null, role === 'base');
  return issueAccountPass(handle, 1, role);
}

test('a claimed username signs on with its own password, and the community password stops working for it', () => withPasswords(async () => {
  const S = memoryStore({ etagOnRead: true });
  const oldPass = issuePass('mobile', 'Ada');
  assert.equal((await readPass(reqWith(oldPass), null, S, { unclaimed: true })).role, 'mobile');
  const c = await claimAccount('Ada', 'a long enough phrase', S, 1000, null);
  assert.equal(c.v, 1); assert.match(c.recovery, /^[A-Z2-9]{4}(-[A-Z2-9]{4}){3}$/);
  assert.equal(await readPass(reqWith(oldPass), null, S, { unclaimed: true }), null, 'a community pass for a claimed username still works');
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
  assert.equal((await checkHandle('Eve', readMods(''), S)).ok, true, 'the username is not free again');
  const m = (await adoptedMonths('cat', S))[0];
  assert.equal((await readAdopted('cat', m, S)).length, 1, 'deleting an account took an animal off the forever list');
}));

// KICK, TIME OUT, BAN (2026-10-22). Each signs every device off; a time out
// and a ban hold in readPass, and the front desk says so only after the right
// password, so nobody else learns a username is barred.
test('kick signs every device off and they sign straight back on', () => withPasswords(async () => {
  const S = memoryStore({ etagOnRead: true });
  await claimAccount('Fen', 'fen has a phrase', S, 0, null);
  assert.ok(await readPass(reqWith(issueAccountPass('Fen', 1)), null, S));
  assert.equal((await kickAccount('Fen', S)).kicked, true);
  assert.equal(await readPass(reqWith(issueAccountPass('Fen', 1)), null, S), null, 'a kicked device stayed signed on');
  const back = await signOn('Fen', 'fen has a phrase', null, S, 10);
  assert.equal(back.account, 2);
  assert.ok(await readPass(reqWith(issueAccountPass('Fen', 2)), null, S));
  assert.ok((await kickAccount('Nobody', S)).error);
}));

test('a time out keeps a username off until it ends, says so only after the right password, and keeps nothing after', () => withPasswords(async () => {
  const S = memoryStore({ etagOnRead: true });
  const c = await claimAccount('Gil', 'gil has a phrase', S, 0, null);
  // readPass reads the clock, so the time out is an hour from now.
  const T = Date.now(), until = T + BAR_FOR['1h'];
  assert.deepEqual((await barAccount('Gil', until, S)).bar, { until });
  const raw = JSON.parse(JSON.stringify(await S.get(`acct/${acctKey('Gil')}`)));
  assert.deepEqual(raw.bar, { until }, 'a bar kept something beside until when');
  assert.equal(await readPass(reqWith(issueAccountPass('Gil', 1)), null, S), null, 'a device stayed on through a time out');
  assert.equal(await readPass(reqWith(issueAccountPass('Gil', 2)), null, S), null, 'a pass worked while timed out');
  const wrong = await signOn('Gil', 'not the phrase', null, S, T + 2000);
  assert.ok(wrong.error && !wrong.barred && !/moderator/.test(wrong.error), 'a wrong password learned the username is timed out');
  const right = await signOn('Gil', 'gil has a phrase', null, S, T + 2000);
  assert.ok(right.barred && /timed this username out/.test(right.error) && /more minute/.test(right.error));
  assert.ok((await recoverAccount('Gil', c.recovery, 'a new phrase here', S, T + 2000)).barred, 'recovery got round a time out');
  assert.ok(!(await recoverAccount('Gil', 'WRONG-CODE-HERE-0000', 'a new phrase here', S, T + 2001)).barred, 'a wrong code learned the username is timed out');
  assert.equal(barredNow(await readAccount('Gil', S), until), false);
  const after = await signOn('Gil', 'gil has a phrase', null, S, until + 1);
  assert.equal(after.account, 2);
  assert.equal((await readAccount('Gil', S)).bar, undefined, 'a time out that had ended was kept');
  assert.ok(await readPass(reqWith(issueAccountPass('Gil', 2)), null, S));
  assert.match(barWords({ until: 0 }), /banned/);
  assert.match(barWords({ until: 3 * 86400000 }, 0), /3 more days/);
  assert.match(barWords({ until: 3 * 3600000 }, 0), /3 more hours/);
}));

test('a ban holds until a moderator lifts it, and lifting takes nothing else away', () => withPasswords(async () => {
  const S = memoryStore({ etagOnRead: true });
  await claimAccount('Hob', 'hob has a phrase', S, 0, null);
  await barAccount('Hob', 0, S);
  assert.ok((await signOn('Hob', 'hob has a phrase', null, S, 10 ** 13)).barred, 'a ban ran out by itself');
  assert.deepEqual(shapeBar(await readAccount('Hob', S)), { until: 0 });
  assert.ok((await claimAccount('Hob', 'somebody else here', S, 5, null)).error, 'somebody claimed a banned name');
  assert.ok((await barAccount('Hob', -5, S)).error, 'a bar that ended before it began');
  assert.equal((await liftBar('Hob', S)).lifted, true);
  assert.equal((await liftBar('Hob', S)).lifted, false);
  const back = await signOn('Hob', 'hob has a phrase', null, S, 20);
  assert.equal(back.account, 2, 'lifting a ban changed the password or the version');
}));

test('the moderators\' directory: every username, how many, and who is seen by Be seen here\'s rules, and nothing else', () => withPasswords(async () => {
  const S = memoryStore({ etagOnRead: true });
  const mods = readMods('{"Iris":[]}');
  for (const h of ['Zed', 'amy', 'Bo']) await claimAccount(h, h + ' has a long phrase', S, 0, mods);
  await claimAccount('Iris', 'iris has a phrase', S, 0, mods, true, null);
  await barAccount('Bo', 0, S);
  const now = 10 ** 12;
  const mod = { role: 'base', handle: 'Iris', roles: new Set(['moderator']), account: true };
  await beSeen({ role: 'mobile', handle: 'Zed', account: true, roles: new Set() }, 'the-den', 'visit-zed-0001', S, now);
  await beSeen({ role: 'mobile', handle: 'amy', account: true, roles: new Set() }, QUIET_ROOMS[0], 'visit-amy-0001', S, now);
  const d = await accountDirectory(mod, S, now + 5, mods);
  assert.deepEqual(d.people.map((p) => p.handle), ['amy', 'Bo', 'Iris', 'Zed']);
  assert.equal(d.count, 4);
  for (const p of d.people) assert.deepEqual(Object.keys(p).sort(), ['bar', 'handle', 'mod', 'rooms'], 'a name carried more than the desk needs');
  const by = Object.fromEntries(d.people.map((p) => [p.handle, p]));
  assert.deepEqual(by.Zed.rooms, ['the-den']);
  assert.deepEqual(by.Bo.bar, { until: 0 });
  assert.equal(by.Iris.mod, true);
  assert.equal(by.Zed.mod, false);
  assert.deepEqual(by.amy.rooms, [], 'somebody seen only in a quiet room was shown as seen');
  assert.equal(d.seen, 1);
  assert.ok(!JSON.stringify(d).includes('since') && !JSON.stringify(d).includes('hash'));
  assert.deepEqual((await accountDirectory(mod, S, now + ROOM_FRESH + 10, mods)).seen, 0, 'somebody stayed seen past their last check');
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
  assert.equal(shared.claim, true); assert.equal(shared.handle, 'Juniper');
  // A pass from the moderators' password, from before 2026-10-21, opens claiming.
  const oldBase = issuePass('base', shared.handle);
  assert.equal((await readPass(reqWith(oldBase), mods, S, { unclaimed: true })).role, 'base');
  assert.ok((await claimAccount('Juniper', 'moderators-pw', S, 0, mods, true)).error, 'the shared password taken as a personal one');
  assert.ok((await claimAccount('Juniper', 'community-pw', S, 0, mods, true)).error, 'the community password taken as a personal one');
  const c = await claimAccount('Juniper', 'juniper has a phrase', S, 0, mods, true);
  assert.equal(c.v, 1);
  assert.equal(await readPass(reqWith(oldBase), mods, S, { unclaimed: true }), null, 'the shared password\'s pass outlived the move');
  assert.ok((await signOn('Juniper', 'moderators-pw', mods, S)).error, 'the shared password still signs on as a moderator who moved');
  assert.ok((await signOn('Juniper', 'community-pw', mods, S)).error);
  const own = await signOn('JUNIPER', 'juniper has a phrase', mods, S);
  assert.equal(own.role, 'base'); assert.equal(own.handle, 'Juniper'); assert.equal(own.account, 1);
  assert.deepEqual(rolesOf(own), ['board', 'moderator']);
  const mine = issueAccountPass('Juniper', 1, 'base');
  assert.match(mine, /^cb2\.base\./);
  const who = await readPass(reqWith(mine), mods, S);
  assert.equal(who.role, 'base'); assert.equal(who.account, true); assert.deepEqual(rolesOf(who), ['board', 'moderator']);
  // An ordinary pass for a moderator's username (they were given a role at the
  // desk) opens no more than an ordinary username, and hands over the pass
  // signing on again would give them (2026-10-21).
  const asPlain = await readPass(reqWith(issueAccountPass('Juniper', 1)), mods, S);
  assert.equal(asPlain.role, 'mobile', 'an ordinary pass for a moderator\'s username opened the base');
  assert.equal(asPlain.roles.size, 0);
  assert.equal(asPlain.swap.base, true); assert.match(asPlain.swap.pass, /^cb2\.base\./);
  assert.equal((await readPass(reqWith(asPlain.swap.pass), mods, S)).role, 'base');
  assert.equal((await readPass(reqWith(issueAccountPass('Juniper', 1)), null, S)).swap, undefined, 'a pass was swapped with no list to swap it by');
  // A base pass is signed with the moderators' password: a community-signed
  // forgery with the base label is refused.
  const forged = mine.replace(/\.[A-Za-z0-9_-]+$/, '.' + issueAccountPass('Juniper', 1).split('.').pop());
  assert.equal(await readPass(reqWith(forged), mods, S), null, 'a cb2.base pass signed with the community password');
  // Quill is still on the shared password, and nothing about Juniper moved them.
  assert.equal((await signOn('Quill', 'moderators-pw', mods, S)).claim, true);
  // A change of password signs the moderator off everywhere, as anybody's does.
  const ch = await changePassword('Juniper', 'juniper has a phrase', 'a newer phrase too', S, 0);
  assert.equal(ch.v, 2);
  assert.equal(await readPass(reqWith(mine), mods, S), null);
  assert.equal((await readPass(reqWith(issueAccountPass('Juniper', 2, 'base')), mods, S)).role, 'base');
  // Off the list, the same account is an ordinary claimed username with the same
  // password.
  const off = readMods('{"Quill":[]}');
  // Taken off the list, a base pass opens no more than an ordinary username, and hands over that pass.
  const offList = await readPass(reqWith(issueAccountPass('Juniper', 2, 'base')), off, S);
  assert.equal(offList.role, 'mobile', 'a base pass outlived being taken off the list');
  assert.equal(offList.swap.base, false); assert.match(offList.swap.pass, /^cb2\.acct\./);
  const plain = await signOn('Juniper', 'a newer phrase too', off, S);
  assert.equal(plain.role, 'mobile'); assert.equal(plain.account, 2);
  // An unreadable list gives nobody the base, a moderator on their own password
  // included, and swaps no pass on the strength of it.
  const blind = await readPass(reqWith(issueAccountPass('Juniper', 2, 'base')), null, S);
  assert.equal(blind.role, 'mobile'); assert.equal(blind.swap, undefined);
  // Deleting it puts the handle back on the shared password, to be claimed again.
  await deleteAccount('Juniper', S);
  assert.equal((await signOn('Juniper', 'moderators-pw', mods, S)).claim, true);
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

test('a chimera\'s sayings are its maker\'s, a few short lines, and kept only when there are some', () => withPasswords(async () => {
  assert.deepEqual(cleanChimeraSayings(undefined), []);
  assert.deepEqual(cleanChimeraSayings(['  Hello  there ', '', 'Hello there', 'Bye']), ['Hello there', 'Bye'], 'blank and repeated lines kept');
  assert.equal(cleanChimeraSayings('hello'), null);
  assert.equal(cleanChimeraSayings([1]), null);
  assert.equal(cleanChimeraSayings(['x'.repeat(CHIMERA_SAYING_MAX + 1)]), null, 'a saying past its length');
  assert.equal(cleanChimeraSayings(Array.from({ length: CHIMERA_SAYINGS + 1 }, (_, i) => `s${i}`)), null, 'too many sayings');
  const s = memoryStore({ etagOnRead: true });
  const pk = petKey('Ada');
  const a = (await keepChimera(pk, { parts: partsOf(), name: 'Otto', sayings: ['Hello'] }, s)).kept;
  assert.deepEqual(a.sayings, ['Hello']);
  assert.equal((await keepChimera(pk, { parts: partsOf(), sayings: ['x'.repeat(200)] }, s)).error, 'sayings');
  await editChimera(pk, a.id, { sayings: ['One', 'Two'] }, s);
  assert.deepEqual(shapeChimera((await readChimeras(pk, s)).chimeras[0]).sayings, ['One', 'Two']);
  await editChimera(pk, a.id, { sayings: [] }, s);
  assert.deepEqual(Object.keys((await readChimeras(pk, s)).chimeras[0]).sort(), ['id', 'name', 'parts'], 'emptied sayings left a key behind');
  assert.equal((await editChimera(pk, a.id, { sayings: 'x' }, s)).error, 'sayings');
  const st = await chimeraSticker('Ada', a.id, s);
  assert.deepEqual(Object.keys(st).sort(), ['name', 'parts'], 'a sticker carries sayings');
}));

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`familiars brought out fifteen at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const fam = (i) => ({ parts: partsOf(), name: `n${i}`, sayings: [] });
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => showFamiliar(`pk${i}`, fam(i), s)));
    const out = (await s.get('familiars-out', { type: 'json' })).out;
    told.forEach((r, i) => { if (r.status === 'fulfilled') assert.ok(out[`pk${i}`], 'a familiar told it was out is not there'); });
    for (const r of told) if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
    if (etagOnRead) assert.equal(Object.keys(out).length, 15);
  });
}

test('a familiar is seen beside a claimed name only, and Forget me and deleting the username take it in', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.equal(cleanFamiliar({ parts: { body: 'unicorn' }, name: 'x' }), null);
  assert.equal(cleanFamiliar({ parts: partsOf(), name: 'x'.repeat(40) }), null, 'a name past its length');
  assert.equal(cleanFamiliar({ parts: partsOf(), name: 'Otto', sayings: ['x'.repeat(200)] }), null, 'a saying past its length');
  const f = cleanFamiliar({ parts: partsOf(), name: 'Otto', sayings: ['Hello'], extra: 'dropped' });
  assert.deepEqual(Object.keys(f).sort(), ['name', 'parts', 'sayings'], 'a familiar kept something more');
  await claimAccount('Ada', 'a long enough phrase', s, 9, null);
  const pk = petKey('Ada');
  const people = [{ handle: 'Ada', claimed: true }, { handle: 'Bex', claimed: false }];
  assert.equal((await withFamiliars(people, s))[0].familiar, undefined, 'seen before it was brought out');
  await showFamiliar(pk, f, s);
  assert.equal(await familiarOut('Ada', s), true);
  let seen = await withFamiliars(people, s);
  assert.deepEqual(seen[0].familiar, f);
  assert.equal(seen[1].familiar, undefined);
  assert.equal((await withFamiliars([{ handle: 'Ada', claimed: false }], s))[0].familiar, undefined, 'an unclaimed name brought a familiar');
  await showFamiliar(pk, null, s);
  assert.equal((await withFamiliars(people, s))[0].familiar, undefined, 'taken in and still seen');
  await showFamiliar(pk, f, s);
  await forgetChimeras(pk, s);
  assert.equal((await withFamiliars(people, s))[0].familiar, undefined, 'forgotten and still seen');
  await showFamiliar(pk, f, s);
  await deleteAccount('Ada', s);
  assert.equal(await familiarOut('Ada', s), false, 'a deleted username still has a familiar out');
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
  plate: PROFILE_KEYS.banners[1], pronouns: 'they/them', tagline: 'Otters, lichen and long walks.', bio: 'Line one.\n\nLine two.', links: ['https://example.org/me'],
  room: 'the-den', why: 'the carpet', ...over,
});

test('a profile holds only choices from the lists and words within their limits', () => {
  const ok = cleanProfile(fullProfile());
  assert.ok(ok.profile, ok.error);
  assert.deepEqual(Object.keys(ok.profile).sort(), ['banner', 'bio', 'decoration', 'effect', 'face', 'frame', 'links', 'listed', 'plate', 'pronouns', 'room', 'tagline', 'theme', 'why'].sort());
  assert.equal(ok.profile.listed, false, 'a card was in the directory without being asked');
  assert.equal(cleanProfile(fullProfile({ listed: 'yes' })).profile.listed, false, 'anything but true put a card in the directory');
  assert.equal(cleanProfile(fullProfile({ tagline: '  Two\nlines  ' })).profile.tagline, 'Two lines', 'a tagline kept a line break');
  assert.ok(cleanProfile(fullProfile({ tagline: 'x'.repeat(TAGLINE_MAX + 1) })).error, 'a tagline over its limit');
  assert.ok(cleanProfile({ tagline: 'Only a tagline.' }).profile.tagline, 'a card with only a tagline');
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


/* ── Chat status ─────────────────────────────────────────────────────── */

test('a chat status is one of the three badges or none, nobody has one until they choose, and the record holds nothing about when', async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.deepEqual(CHAT_STATUSES, ['come-say-hi', 'people-i-know', 'not-right-now']);
  for (const v of ['', null, undefined]) assert.equal(cleanChatStatus(v), '');
  for (const v of ['green', 'online', 'idle', 'dnd', 'invisible', 'COME-SAY-HI', 1, {}, ['come-say-hi']]) assert.equal(cleanChatStatus(v), null, `${JSON.stringify(v)} was taken`);
  const pk = petKey('Ada');
  assert.equal(await chatStatusOf(pk, s), '', 'somebody who never chose had a status');
  assert.deepEqual(await setChatStatus(pk, 'idle', s), { error: 'which' });
  assert.equal(s.keys().length, 0, 'a refused status wrote something');
  assert.deepEqual(await setChatStatus(pk, 'people-i-know', s), { chat: 'people-i-know' });
  assert.equal(await chatStatusOf(pk, s), 'people-i-know');
  const raw = await s.get('chat-status', { type: 'json' });
  assert.deepEqual(raw, { status: { [pk]: 'people-i-know' } }, 'the record holds something besides the badge');
  const people = [{ handle: 'Ada', claimed: true, rooms: [] }, { handle: 'Bex', claimed: true, rooms: [] }];
  let shown = await withChatStatus(people, s);
  assert.equal(shown[0].chat, 'people-i-know');
  assert.equal('chat' in shown[1], false, 'somebody who chose none was shown as something');
  assert.equal('chat' in (await withChatStatus([{ handle: 'Ada', claimed: false, rooms: [] }], s))[0], false, 'an unclaimed name wore a chat status');
  await setChatStatus(pk, '', s);
  assert.deepEqual(await s.get('chat-status', { type: 'json' }), { status: {} }, 'choosing none left them in the record');
  await setChatStatus(pk, 'not-right-now', s);
  await forgetChatStatus(pk, s);
  assert.equal(await chatStatusOf(pk, s), '', 'Forget me left the chat status');
});

test('deleting a username takes its chat status with it', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  await claimAccount('Ada', 'a long enough phrase', s, 9, null);
  await setChatStatus(petKey('Ada'), 'come-say-hi', s);
  await deleteAccount('Ada', s);
  assert.equal(await chatStatusOf(petKey('Ada'), s), '', 'a deleted username kept its chat status');
}));

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`fifteen chat statuses chosen at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const names = Array.from({ length: 15 }, (_, i) => `P${i}`);
    const pick = (i) => CHAT_STATUSES[i % CHAT_STATUSES.length];
    const told = await Promise.allSettled(names.map((n, i) => setChatStatus(petKey(n), pick(i), s)));
    const shown = await withChatStatus(names.map((handle) => ({ handle, claimed: true, rooms: [] })), s);
    names.forEach((n, i) => {
      if (told[i].status === 'fulfilled') assert.equal(shown[i].chat, pick(i), `${n} was told their status was kept and it is not shown`);
      else assert.equal(told[i].reason.message, 'busy');
    });
    if (etagOnRead) assert.equal(told.filter((r) => r.status === 'fulfilled').length, 15);
  });
}


/* ── The community directory ─────────────────────────────────────────── */

test('the directory lists only cards that say so, under their own usernames, alphabetical, with no number', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const mods = readMods('{"Ryan":["administrator"]}');
  const p = cleanProfile(fullProfile()).profile;
  const on = cleanProfile(fullProfile({ listed: true })).profile;
  for (const n of ['zed', 'Ada', 'Ryan', 'Bex']) await claimAccount(n, 'a long enough phrase', s, 9, null);
  await keepProfile(petKey('Bex'), p, s, 'Bex');
  assert.deepEqual((await communityDirectory({ handle: 'Bex' }, s, mods)).people, [], 'a card that did not say so was listed');
  for (const n of ['zed', 'Ada', 'Ryan']) await keepProfile(petKey(n), on, s, n);
  let got = await communityDirectory({ handle: 'Bex' }, s, mods);
  assert.deepEqual(got.people.map((x) => x.handle), ['Ada', 'Ryan', 'zed'], 'not in alphabetical order');
  assert.equal(got.listed, false);
  assert.equal((await communityDirectory({ handle: 'ada' }, s, mods)).listed, true);
  assert.deepEqual(Object.keys(got).sort(), ['listed', 'people'], 'the directory answered with something besides its people');
  assert.deepEqual(Object.keys(got.people[0]).sort(), ['base', 'handle', 'plate', 'pronouns', 'tagline'], 'a line held something besides what the card shows');
  assert.equal(got.people[0].tagline, on.tagline);
  assert.equal(got.people[0].plate, on.plate);
  assert.equal(got.people[1].base, true, 'a moderator was not marked BASE');
  assert.equal(got.people[0].base, false);
  const raw = await s.get('profiles-directory', { type: 'json' });
  assert.deepEqual(Object.keys(raw), ['people']);
  for (const line of Object.values(raw.people)) assert.deepEqual(Object.keys(line).sort(), ['handle', 'plate', 'pronouns', 'tagline'], 'the directory kept something besides the line');

  // The worn avatar comes along, as on Who's online.
  const av = (await keepAvatar(petKey('Ada'), { look: lookOf(), name: 'Saloon' }, s)).kept;
  await wearAvatar(petKey('Ada'), av.id, s);
  assert.ok((await communityDirectory(null, s, mods)).people[0].avatar, 'the avatar worn was not shown');

  // A change to the card changes the line; wearing a set keeps it listed.
  await keepProfile(petKey('Ada'), { ...on, tagline: 'Changed.', plate: '' }, s, 'Ada');
  got = await communityDirectory(null, s, mods);
  assert.equal(got.people[0].tagline, 'Changed.');
  assert.equal(got.people[0].plate, '', 'a nameplate taken off is still in the directory');
  await keepProfile(petKey('Ada'), { ...on, plate: PROFILE_KEYS.banners[2] }, s);
  assert.equal((await communityDirectory(null, s, mods)).people[0].plate, PROFILE_KEYS.banners[2], 'a card saved without a username lost its line');

  // Switching it off, clearing the card, Forget me and deleting the username all take somebody out.
  await keepProfile(petKey('zed'), { ...on, listed: false }, s, 'zed');
  assert.deepEqual((await communityDirectory(null, s, mods)).people.map((x) => x.handle), ['Ada', 'Ryan'], 'switched off and still listed');
  assert.equal((await readProfile(petKey('zed'), s)).tagline, on.tagline, 'switching it off cleared the card');
  await clearProfile('Ryan', s);
  assert.deepEqual((await communityDirectory(null, s, mods)).people.map((x) => x.handle), ['Ada'], 'a cleared card is still listed');
  await keepProfile(petKey('Ryan'), on, s, 'Ryan');
  await forgetProfile(petKey('Ryan'), s);
  assert.deepEqual((await communityDirectory(null, s, mods)).people.map((x) => x.handle), ['Ada'], 'Forget me left somebody listed');
  await deleteAccount('Ada', s);
  assert.deepEqual((await communityDirectory(null, s, mods)).people, [], 'a deleted username is still listed');

  // A card saved without a username is never listed from nothing, and a line filed under somebody else's key is nobody's.
  await keepProfile(petKey('Bex'), on, s);
  assert.deepEqual((await communityDirectory(null, s, mods)).people, [], 'listed with no username');
  const cur = await s.getWithMetadata('profiles-directory');
  await s.setJSON('profiles-directory', { people: { ...cur.data.people, [petKey('Bex')]: { handle: 'zed', plate: '', tagline: 'not mine', pronouns: '' } } }, { onlyIfMatch: cur.etag });
  assert.deepEqual((await communityDirectory(null, s, mods)).people, [], 'a line under another person’s key was shown');
}));

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`fifteen people listed in the directory at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const names = Array.from({ length: 15 }, (_, i) => `P${i}`);
    const on = cleanProfile(fullProfile({ listed: true })).profile;
    const told = await Promise.allSettled(names.map((n) => keepProfile(petKey(n), on, s, n)));
    const worked = names.filter((_, i) => told[i].status === 'fulfilled');
    const shown = (await communityDirectory(null, s, null)).people.map((x) => x.handle);
    assert.deepEqual(worked.filter((n) => !shown.includes(n)), [], 'somebody told they were listed is not in the directory');
    for (const r of told) if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
    if (etagOnRead) assert.equal(worked.length, 15);
  });
}

/* ── Profile sets ─────────────────────────────────────────────────────── */
import { PROFILE_SETS_KEEP, PROFILE_SET_NAME_MAX, cardLook, readProfileSets, shapeProfileSet, saveProfileSet, wearProfileSet,
  refreshProfileSet, renameProfileSet, removeProfileSet, forgetProfileSets } from './lib.mjs';

test('a profile set is the card\'s look and the avatar worn, and wearing it keeps the card\'s words', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const pk = petKey('Ada');
  await claimAccount('Ada', 'a long enough phrase', s, 9, null);
  const otter = (await keepAvatar(pk, { look: lookOf(), name: 'Ottie' }, s)).kept;
  await wearAvatar(pk, otter.id, s);
  const otters = cleanProfile(fullProfile({ theme: 'kelp', effect: 'otters', bio: 'Otters first.' })).profile;
  await keepProfile(pk, otters, s);
  const a = await saveProfileSet(pk, 'Otters', s);
  assert.ok(a.kept, a.error);
  assert.deepEqual(Object.keys(a.kept).sort(), ['avatar', 'id', 'look', 'name'], 'a set holds something besides its look, its avatar and its name');
  assert.deepEqual(a.kept.look, cardLook(otters));
  assert.equal(a.kept.look.bio, undefined, 'a set took the card\'s words');
  assert.equal(a.kept.avatar, otter.id);
  assert.equal((await saveProfileSet(pk, '  otters ', s)).error, 'taken', 'two sets with one name');
  assert.equal((await saveProfileSet(pk, '', s)).error, 'name', 'a set with no name');
  assert.equal((await saveProfileSet(pk, 'x'.repeat(PROFILE_SET_NAME_MAX + 1), s)).error, 'name');

  // A second look, with no avatar worn, and the words changed since.
  await wearAvatar(pk, null, s);
  await keepProfile(pk, cleanProfile(fullProfile({ theme: 'fairy', effect: 'fairy', bio: 'Faeries now.', pronouns: 'she/they' })).profile, s);
  const b = (await saveProfileSet(pk, 'Fairy Lights', s)).kept;
  assert.equal(b.avatar, null);

  const w = await wearProfileSet(pk, a.kept.id, s);
  assert.equal(w.avatarGone, false);
  const card = await readProfile(pk, s);
  assert.equal(card.theme, 'kelp'); assert.equal(card.effect, 'otters');
  assert.equal(card.bio, 'Faeries now.', 'wearing a set put old words back');
  assert.equal(card.pronouns, 'she/they', 'wearing a set changed the pronouns');
  assert.equal((await readAvatars(pk, s)).wearing, otter.id, 'wearing a set did not wear its avatar');
  await wearProfileSet(pk, b.id, s);
  assert.equal((await readAvatars(pk, s)).wearing, null, 'a set with no avatar left one worn');
  assert.equal((await readProfile(pk, s)).theme, 'fairy');

  // Updating a set takes the card as it is, and keeps its name and place.
  await keepProfile(pk, { ...(await readProfile(pk, s)), frame: PROFILE_KEYS.frames[1] }, s);
  const up = await refreshProfileSet(pk, b.id, s);
  assert.deepEqual(up.sets.map((x) => x.name), ['Otters', 'Fairy Lights']);
  assert.equal(up.sets[1].look.frame, PROFILE_KEYS.frames[1]);
  assert.equal((await renameProfileSet(pk, b.id, 'OTTERS', s)).error, 'taken');
  assert.equal((await renameProfileSet(pk, b.id, 'Halloween', s)).sets[1].name, 'Halloween');
  assert.equal((await refreshProfileSet(pk, 'lnot-a-set!', s)).error, 'which');
  assert.equal((await wearProfileSet(pk, 'l' + 'x'.repeat(10), s)).error, 'which');

  // An avatar deleted since leaves the one worn as it is, and says so.
  const pumpkin = (await keepAvatar(pk, { look: lookOf(), name: 'Pumpkin' }, s)).kept;
  await wearAvatar(pk, pumpkin.id, s);
  await removeAvatar(pk, otter.id, s);
  const gone = await wearProfileSet(pk, a.kept.id, s);
  assert.equal(gone.avatarGone, true);
  assert.equal((await readAvatars(pk, s)).wearing, pumpkin.id, 'a set whose avatar was deleted took the worn one off');
  assert.equal(shapeProfileSet((await readProfileSets(pk, s))[0], (await readAvatars(pk, s)).avatars).avatarGone, true);
  const [gOtters, gHallow] = await readProfileSets(pk, s);
  const av2 = await readAvatars(pk, s), card2 = await readProfile(pk, s);
  assert.equal(shapeProfileSet(gOtters, av2.avatars, card2, av2.wearing).on, false, 'a set whose avatar is gone is on the card');
  await wearProfileSet(pk, gHallow.id, s);
  const av3 = await readAvatars(pk, s), card3 = await readProfile(pk, s);
  assert.deepEqual((await readProfileSets(pk, s)).map((x) => shapeProfileSet(x, av3.avatars, card3, av3.wearing).on), [false, true], 'the set just worn is not the one on the card');

  // A drawing gone from the street is no choice, so an old set still wears.
  assert.equal(cardLook({ theme: 'gone-theme', effect: 'otters' }).theme, '');
  const raw = await s.get(`profile-sets/${pk}`, { type: 'json' });
  assert.deepEqual(Object.keys(raw), ['sets']);
  for (const x of raw.sets) assert.deepEqual(Object.keys(x).sort(), ['avatar', 'id', 'look', 'name'], 'a set kept a time, or anything else');

  // Clearing the card leaves the sets; Forget me and deleting the username do not.
  await clearProfile('Ada', s);
  assert.equal((await readProfileSets(pk, s)).length, 2, 'clearing a card took the sets');
  assert.equal((await removeProfileSet(pk, b.id, s)).sets.length, 1);
  await forgetProfileSets(pk, s);
  assert.deepEqual(await readProfileSets(pk, s), [], 'Forget me left the sets');
  await saveProfileSet(pk, 'Again', s);
  await deleteAccount('Ada', s);
  assert.deepEqual(await readProfileSets(pk, s), [], 'a deleted username kept its sets');
}));

test('a full shelf of sets refuses the next one and pushes nothing out', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const pk = petKey('Ada');
  for (let i = 0; i < PROFILE_SETS_KEEP; i++) assert.ok((await saveProfileSet(pk, `Set ${i}`, s)).kept);
  assert.equal((await saveProfileSet(pk, 'One more', s)).error, 'full');
  assert.equal((await readProfileSets(pk, s))[0].name, 'Set 0');
}));

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`fifteen sets saved at once from fifteen tabs, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const pk = petKey('Ada');
    const names = Array.from({ length: 15 }, (_, i) => `Mood ${i}`);
    const told = await Promise.allSettled(names.map((n) => saveProfileSet(pk, n, s)));
    const worked = names.filter((_, i) => told[i].status === 'fulfilled' && told[i].value.kept);
    const kept = (await readProfileSets(pk, s)).map((x) => x.name);
    assert.deepEqual(worked.filter((n) => !kept.includes(n)), [], 'a set that was told it was saved is missing');
    for (const r of told) if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
    if (etagOnRead) assert.equal(worked.length, 15);
  });
}

/* ── The forums ──────────────────────────────────────────────────────────── */
import { FORUM_CATEGORIES, forumCat, forumAllows, forumNav, forumHome, forumLatest, forumCategory, forumTopic, readTopic,
  readForumIndex, searchForum, cbTranscript, startTopic, replyTopic, editPost, removePost, removeTopic, uncopyMessage,
  reactPost, moderateTopic, sweepForum, goesAt, publicAddress, previewFor, metaOf, playerInfo, loneLinks, authorMark, forumEditor,
  retagTopic, importTopic, cleanForumTags } from './lib.mjs';

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

test('tags are set when a topic starts, changed by its starter or a moderator, filter a category, and are never counted', async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.deepEqual(cleanForumTags(['Grant Round', '#grant-round', 'aid']), ['aid', 'grant-round']);
  assert.equal(cleanForumTags(['not a tag!']), null);
  assert.equal(cleanForumTags(['a', 'b', 'c', 'd', 'e', 'f']), null);
  assert.match((await startTopic(BO, { cat: 'infodumps', title: 'Owls', body: 'Hoo.', tags: ['what?'] }, s, T0, NO_NET)).error, /Up to 5 tags/);
  const t = (await startTopic(BO, { cat: 'infodumps', title: 'Owls', body: 'Hoo.', tags: ['Night Birds', 'owls'] }, s, T0, NO_NET)).topic;
  assert.deepEqual(t.tags, ['night-birds', 'owls']);
  const u = (await startTopic(ADA, { cat: 'infodumps', title: 'Moths', body: 'Flutter.' }, s, T0 + 1, NO_NET)).topic;
  const all = await forumCategory(ADA, 'infodumps', null, s, T0 + 2);
  assert.deepEqual(all.tags, ['night-birds', 'owls'], 'a category did not say which tags its topics carry, or said it some other way');
  assert.deepEqual(all.topics.map((x) => x.id).sort(), [t.id, u.id].sort());
  const owls = await forumCategory(ADA, 'infodumps', null, s, T0 + 2, 'owls');
  assert.deepEqual(owls.topics.map((x) => x.id), [t.id]);
  assert.equal(owls.tag, 'owls');
  assert.deepEqual(owls.tags, all.tags, 'filtering by a tag hid the other tags');
  assert.deepEqual(owls.topics[0].tags, ['night-birds', 'owls']);
  assert.deepEqual((await forumCategory(ADA, 'infodumps', null, s, T0 + 2, 'bats')).topics, []);
  assert.equal(JSON.stringify(all).includes('notion'), false);
  assert.equal((await searchForum(ADA, 'night-birds', s, T0 + 2))[0].id, t.id, 'a search did not find a topic by its tag');
  assert.match((await retagTopic(ADA, t.id, { tags: ['mine'] }, s, T0 + 3)).error, /Only whoever started/);
  assert.equal((await forumTopic(ADA, t.id, s, T0 + 3)).retag, false);
  assert.equal((await forumTopic(FMOD, t.id, s, T0 + 3)).retag, true, 'a moderator was not offered the tags');
  assert.ok((await retagTopic(FMOD, t.id, { tags: ['owls'] }, s, T0 + 3)).topic);
  const after = await forumTopic(BO, t.id, s, T0 + 4);
  assert.deepEqual([after.tags, after.last, after.posts[0].edited], [['owls'], T0, undefined], 'retagging moved the clock or marked the post edited');
  assert.ok((await retagTopic(BO, t.id, { tags: [] }, s, T0 + 5)).topic, 'a starter could not take their tags off');
  assert.deepEqual((await forumCategory(ADA, 'infodumps', null, s, T0 + 6)).tags, []);
});

test('a page brought from Notion keeps its time and its maker, comes again as the same topic, and stays down once taken down', async () => {
  const s = memoryStore({ etagOnRead: true });
  await claimAccount('Ada', 'a long enough phrase', s, 9, null);
  const ADA_C = fw('Ada', 9), DIR = fw('Di', 700, ['director']);
  const page = '0123456789abcdef0123456789abcdef', made = Date.UTC(2024, 9, 16, 14, 50);
  const f = { notion: page, cat: 'grantmaking', title: 'October 2024 Aid Grant Round', body: '- **Approvals:** Ada', t: made, by: 'ada', tags: ['grant-round'] };
  assert.match((await importTopic(ADA_C, f, s, T0)).error, /Only a moderator/);
  assert.match((await importTopic(FBOARD, { ...f, cat: 'directors' }, s, T0)).error, /no such category/);
  assert.match((await importTopic(DIR, { ...f, t: T0 + 1 }, s, T0)).error, /no later than now/);
  assert.match((await importTopic(DIR, { ...f, cat: 'directors' }, s, T0)).error, /would go at once/, 'a page older than its category keeps topics was brought in to go at once');
  const r = await importTopic(DIR, f, s, T0);
  assert.deepEqual([r.made, r.state], [true, 'made']);
  const t = await forumTopic(DIR, r.topic.id, s, T0 + 1);
  assert.deepEqual([t.t, t.last, t.handle, t.posts[0].handle, t.posts[0].t, t.posts[0].notion, t.tags], [made, made, 'Ada', 'Ada', made, page, ['grant-round']]);
  assert.equal(t.posts[0].base, false);
  assert.equal(JSON.stringify(t).includes(authorMark(ADA_C)), false, 'an author\'s mark was sent');
  // Its maker's username edits it, under the mark of their claim.
  assert.equal((await forumTopic(fw('Ada', 9, ['director']), t.id, s, T0 + 1)).posts[0].edit, true, 'the page\'s maker could not edit it');
  assert.equal((await importTopic(DIR, f, s, T0 + 2)).state, 'the same');
  const r2 = await importTopic(DIR, { ...f, body: '- **Approvals:** Ada, Di' }, s, T0 + 3);
  assert.deepEqual([r2.made, r2.state, r2.topic.id], [false, 'changed', r.topic.id]);
  assert.equal((await readForumIndex('grantmaking', s)).length, 1, 'bringing a page again started a second topic');
  assert.equal((await readTopic(r.topic.id, s)).posts[0].body, '- **Approvals:** Ada, Di');
  // Edited here, it is left as it is.
  assert.ok((await editPost(DIR, t.id, t.posts[0].id, { body: '- **Approvals:** Ada, Di, Bea' }, s, T0 + 4, NO_NET)).topic, 'a director could not add their name in Grantmaking');
  assert.equal((await importTopic(DIR, f, s, T0 + 5)).state, 'edited here');
  assert.equal((await readTopic(r.topic.id, s)).posts[0].body, '- **Approvals:** Ada, Di, Bea');
  // Taken down here, it stays down.
  assert.ok((await removeTopic(DIR, r.topic.id, s, T0 + 6)).gone);
  assert.match((await importTopic(DIR, f, s, T0 + 7)).error, /stays down/);
  assert.equal((await readForumIndex('grantmaking', s)).length, 0);
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
  // Ryan's call, 2026-10-24: a video nobody could measure plays all the same
  // (its player shows the length), so only oEmbed's answer is no word either way.
  assert.deepEqual([door.title, door.length, door.embed], ['Walled', null, null], 'a video behind the wall was taken for one that cannot play here');
  assert.deepEqual(loneLinks('Look:\n\nhttps://a.example/x\n\nand https://b.example/y inline\n\n> https://c.example/z'), ['https://a.example/x']);
  const t = await startTopic(ADA, { cat: 'nature', title: 'Links', body: 'https://stimpunks.world/the-den.html' }, memoryStore({ etagOnRead: true }), T0, NO_NET);
  assert.equal(t.topic.posts[0].links[0].kind, 'street');
  assert.equal(metaOf('<title>a</title>').title, 'a');
  assert.equal(playerInfo('nothing here'), null);
});

/* ── Link cards on the CB ────────────────────────────────────────────────── */
import { chatLinks, unfurlMessage, oembedOf, oembedLink } from './lib.mjs';

test('the CB reads its bare links once, for words, and plays only YouTube and Vimeo, never a picture or a stranger\'s markup', async () => {
  // Which links: bare ones, three at most, not in code, not with their own words, not <in brackets>, not the street.
  assert.deepEqual(chatLinks('see https://example.org/a, and (https://en.wikipedia.org/wiki/Spoon_(tool)) too!'),
    ['https://example.org/a', 'https://en.wikipedia.org/wiki/Spoon_(tool)']);
  assert.deepEqual(chatLinks('`https://code.example` [words](https://words.example) <https://quiet.example> https://stimpunks.world/the-den'), []);
  assert.equal(chatLinks('https://a.example/1 https://a.example/2 https://a.example/3 https://a.example/4').length, 3);
  assert.equal(oembedLink('<link rel="alternate" type="application/json+oembed" href="/oembed?u=1&amp;f=json">', 'https://ex.example/p'),
    'https://ex.example/oembed?u=1&f=json');
  const tweet = { type: 'rich', author_name: 'jack', provider_name: 'X',
    html: '<blockquote class="twitter-tweet"><p lang="en">just setting up my <b>twttr</b></p>&mdash; jack</blockquote><script src="https://platform.twitter.com/widgets.js"></script>',
    thumbnail_url: 'https://pbs.example/pic.jpg' };
  const o = oembedOf(tweet);
  assert.equal(o.said, 'just setting up my twttr');
  assert.equal(JSON.stringify(o).includes('script') || JSON.stringify(o).includes('pic.jpg'), false, 'a stranger\'s markup or picture was kept');
  const pages = {
    ['https://publish.twitter.com/oembed?omit_script=1&dnt=true&url=' + encodeURIComponent('https://x.com/jack/status/20')]: ['application/json', JSON.stringify(tweet)],
    ['https://vimeo.com/api/oembed.json?url=' + encodeURIComponent('https://vimeo.com/1084537')]: ['application/json', JSON.stringify({ type: 'video', title: 'Big Buck Bunny', author_name: 'Blender', provider_name: 'Vimeo', duration: 597,
      html: '<iframe src="https://player.vimeo.com/video/1084537?app_id=122963&evil=1"></iframe>', thumbnail_url: 'https://i.vimeocdn.example/x.jpg' })],
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ': ['text/html', '<script>var ytInitialPlayerResponse = {"playabilityStatus":{"status":"OK","playableInEmbed":true},"videoDetails":{"title":"A song","author":"A channel","lengthSeconds":"213","isLive":false}};</script>'],
    'https://ex.example/post': ['text/html', '<head><meta property="og:site_name" content="Example"><title>A post</title><link rel="alternate" type="application/json+oembed" href="https://ex.example/oembed"></head>'],
    'https://ex.example/oembed': ['application/json', JSON.stringify({ type: 'rich', author_name: 'Somebody', html: '<p>the words</p>' })],
  };
  const get = async (url) => { const p = pages[url]; return p ? { status: 200, type: p[0], text: p[1], url } : { status: 404, type: '', text: '', url }; };
  const s = memoryStore({ etagOnRead: true });
  const text = 'look https://x.com/jack/status/20 https://vimeo.com/1084537 https://youtu.be/dQw4w9WgXcQ';
  await updateRoomTalk('the-den', (l) => [...l, { id: 'm1', handle: 'Ada', text, t: Date.now() }], s);
  await unfurlMessage('the-den', 'm1', text, [], s, get);
  const [m] = shape((await readRoomTalk('the-den', s)).messages);
  assert.deepEqual(m.links.map((l) => l.kind), ['page', 'player', 'video']);
  assert.equal(m.links[0].about, 'just setting up my twttr');
  assert.equal(m.links[0].title, 'jack');
  assert.equal(m.links[1].src, 'https://player.vimeo.com/video/1084537', 'a Vimeo player kept more than its number');
  assert.equal(m.links[1].length, 597);
  assert.equal(m.links[2].id, 'dQw4w9WgXcQ');
  assert.equal(m.links[2].length, 213);
  const raw = JSON.stringify(m);
  assert.equal(/thumbnail|\.jpg|<iframe|<script|blockquote/.test(raw), false, 'a picture or somebody else\'s markup reached the radio');
  // A page that names its own oEmbed endpoint is read through it too.
  const p = await unfurlMessage('the-den', 'm2', 'https://ex.example/post', [], s, get);
  assert.equal(p.length, 1);
  assert.equal(p[0].about, 'the words');
  // Words changed since: nothing is written over them.
  await updateRoomTalk('the-den', (l) => l.map((x) => (x.id === 'm1' ? { ...x, text: 'changed' } : x)), s);
  await unfurlMessage('the-den', 'm1', text, [], s, get);
  assert.equal((await readRoomTalk('the-den', s)).messages[0].text, 'changed');
  // An edit that takes a link out takes its card at once.
  const list = [{ id: 'e1', handle: 'Ada', text, t: 1, links: [{ src: 'https://x.com/jack/status/20', href: 'https://x.com/jack/status/20', kind: 'page', title: 'jack' }] }];
  const ed = editMessage(list, 'e1', 'no link now', { role: 'mobile', handle: 'Ada', roles: new Set() });
  assert.equal(ed.msg.links, undefined, 'an edit kept the card of a link it took out');
});

import { isoSeconds, videoFromApi } from './lib.mjs';

test('with a key, YouTube\'s Data API says how long a video runs and whether it may play here, and the key goes nowhere else', async () => {
  assert.equal(isoSeconds('PT5M24S'), 324);
  assert.equal(isoSeconds('PT1H2M3S'), 3723);
  assert.equal(isoSeconds('P0D'), null);
  const item = (over) => ({ items: [{ snippet: { title: 'All Hail Open Doors', channelTitle: 'Swamburger - Topic', liveBroadcastContent: 'none', ...(over.snippet || {}) },
    contentDetails: { duration: 'PT5M24S', ...(over.contentDetails || {}) }, status: { privacyStatus: 'public', uploadStatus: 'processed', embeddable: true, ...(over.status || {}) } }] });
  assert.deepEqual(videoFromApi(item({})), { status: 'OK', embed: true, title: 'All Hail Open Doors', channel: 'Swamburger - Topic', length: 324, live: false });
  assert.equal(videoFromApi(item({ contentDetails: { contentRating: { ytRating: 'ytAgeRestricted' } } })).embed, false, 'an age-restricted video was given a player');
  assert.equal(videoFromApi(item({ status: { embeddable: false } })).embed, false);
  assert.equal(videoFromApi(item({ snippet: { liveBroadcastContent: 'upcoming' } })).embed, false, 'a video not yet live was given a player');
  assert.deepEqual([videoFromApi(item({ snippet: { liveBroadcastContent: 'live' } })).live, videoFromApi(item({ snippet: { liveBroadcastContent: 'live' } })).length], [true, null]);
  assert.equal(videoFromApi({ items: [] }).status, 'ERROR');
  const KEY = 'AIzaFakeKeyForTheTestsOnly_123456789';
  const asked = [];
  // The watch page answers with the bot wall, as it does to Netlify's servers.
  const get = async (url) => {
    asked.push(url);
    if (url.startsWith('https://www.googleapis.com/youtube/v3/videos?')) return { status: 200, type: 'application/json', text: JSON.stringify(item({})), url };
    if (url.startsWith('https://www.youtube.com/watch')) return { status: 200, type: 'text/html', text: '<script>var ytInitialPlayerResponse = {"playabilityStatus":{"status":"LOGIN_REQUIRED","reason":"Sign in to confirm you are not a bot"}};</script>', url };
    if (url.startsWith('https://www.youtube.com/oembed')) return { status: 200, type: 'application/json', text: JSON.stringify({ title: 'All Hail Open Doors', author_name: 'Swamburger - Topic' }), url };
    return { status: 404, type: '', text: '', url };
  };
  const was = process.env.CB_YOUTUBE_KEY;
  try {
    delete process.env.CB_YOUTUBE_KEY;
    const door = await previewFor('https://youtu.be/2eew0eCg3qg?si=x', get);
    // With no key and the bot wall, only oEmbed answers: no length, and no word
    // either way on embedding, so it plays and its player shows the length.
    assert.deepEqual([door.kind, door.length, door.embed], ['video', null, null]);
    assert.equal(shape([{ id: 'x', handle: 'A', text: '', t: 1, links: [door] }])[0].links[0].embed, null, 'not known became a no on its way to the radio');
    process.env.CB_YOUTUBE_KEY = KEY;
    asked.length = 0;
    const p = await previewFor('https://youtu.be/2eew0eCg3qg?si=x', get);
    assert.deepEqual([p.kind, p.length, p.embed, p.title], ['video', 324, true, 'All Hail Open Doors']);
    assert.equal(asked.length, 1, 'with a key and an answer, nothing but the API was asked');
    assert.ok(asked[0].includes('id=2eew0eCg3qg&'), 'something besides the video\'s id was sent to the API');
    assert.equal(JSON.stringify(p).includes(KEY), false, 'the key went into a card');
  } finally {
    if (was === undefined) delete process.env.CB_YOUTUBE_KEY; else process.env.CB_YOUTUBE_KEY = was;
  }
});

/* ── My own order for the chat page ───────────────────────────────────────── */
import { readChatOrder, keepChatOrder, cleanChatOrder } from './lib.mjs';

test('my own order is kept for a claimed username alone, groups and channels and nothing else, never a quiet room, and goes with the username', async () => {
  const s = memoryStore({ etagOnRead: true });
  const cy = { role: 'mobile', handle: 'Cy', since: 20, account: true, roles: new Set() };
  const anybody = { role: 'mobile', handle: 'Cy', roles: new Set() };
  assert.deepEqual(await keepChatOrder(anybody, { 'tag-music': ['the-den'] }, s), { error: 'claimed' });
  assert.equal(await readChatOrder(anybody, s), null, 'an unclaimed handle was given somebody\'s order');
  const kept = await keepChatOrder(cy, {
    'tag-music': ['the-den', 'club-chronic', 'the-den', 'the-secret-cabin', 'Not A Tag', 7],
    more: ['the-sandbox'],
    'tag-': ['the-den'], __proto__: ['the-den'], constructor: ['the-den'], when: Date.now(),
  }, s);
  assert.deepEqual(kept.groups, { 'tag-music': ['the-den', 'club-chronic'], more: ['the-sandbox'] });
  assert.deepEqual(await readChatOrder(cy, s), kept.groups);
  const raw = JSON.stringify(await s.get('chat-order/' + petKey('Cy'), { type: 'json' }));
  assert.deepEqual(Object.keys(JSON.parse(raw)), ['groups'], 'my own order was kept with something besides its groups');
  assert.equal(/\d{6,}/.test(raw), false, 'a time was kept with my own order');
  assert.deepEqual(cleanChatOrder(null), {});
  // An order with nothing in it is no order: the blob goes.
  await keepChatOrder(cy, {}, s);
  assert.equal(await s.get('chat-order/' + petKey('Cy'), { type: 'json' }), null);
  // Deleting the username deletes it.
  await keepChatOrder(cy, { 'tag-pets': ['the-run'] }, s);
  await claimAccount('Cy', 'a long enough phrase', s, 20, null);
  await deleteAccount('Cy', s);
  assert.equal(await s.get('chat-order/' + petKey('Cy'), { type: 'json' }), null, 'a deleted username left its own order');
});

/* ── The chat page's orders by activity ─────────────────────────────────── */
import { channelActivity } from './lib.mjs';

test('the chat page is sent two orders by activity, without a time or a count, and never a quiet or a private room or the bot', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  const mob = { role: 'mobile', handle: 'Zed', roles: new Set() };
  const board = { role: 'base', handle: 'Bea', roles: new Set(['moderator', 'board']) };
  const say = (tag, n, newest, extra = {}) => updateRoomTalk(tag, (l) => [...l, ...Array.from({ length: n }, (_, i) => ({ id: tag + i, handle: 'Ada', text: 'hi', t: newest - i * 1000, ...extra }))], s);
  await say('the-den', 1, now - 1000);          // newest, one message
  await say('the-garden', 3, now - 60000);      // most messages
  await say('the-mopery', 2, now - 30000);
  await say('the-feed', 9, now - 500, { feed: { wire: 'x' } });   // the bot alone
  await say('the-secret-cabin', 5, now - 100);  // a room that keeps to itself
  await say('town-hall-board', 5, now - 200);   // a private room
  await updateChannel((l) => [...l, { id: 'w1', handle: 'Hal', text: 'hello', t: now - 50 }], s);
  const r = await channelActivity(mob, s, now);
  assert.deepEqual(r.recent, ['the-den', 'the-mopery', 'the-garden']);
  assert.deepEqual(r.active, ['the-garden', 'the-mopery', 'the-den']);
  assert.deepEqual(Object.keys(r).sort(), ['active', 'recent'], 'something but the two orders left');
  const raw = JSON.stringify(r);
  assert.equal(/\d/.test(raw), false, 'a time or a count left with the orders');
  assert.ok((await channelActivity(board, s, now)).recent.includes('town-hall-board'), 'the board could not see its own room');
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
  // Node drops a private key's leading zero bytes, about one key in 250, and a
  // key that is not 32 bytes is refused: that made this test fail now and then
  // (2026-10-23). A key in CB_PUSH_KEY is always 32 bytes, so the test makes one.
  const e = createECDH('prime256v1');
  do e.generateKeys(); while (e.getPrivateKey().length !== 32);
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
  const offCurve = rnd(65); offCurve[0] = 4;
  assert.equal(cleanSubscription({ ...d, keys: { ...d.keys, p256dh: offCurve.toString('base64url') } }), null, 'a key that is not a point');
  assert.equal(cleanSubscription({ ...d, keys: { ...d.keys, p256dh: rnd(64).toString('base64url') } }), null, 'a key the wrong size');
  assert.deepEqual(cleanWant({}), { all: false, mentions: false, replies: false, props: false, messages: false, world: false, calls: false, tasks: false, events: false, scheduled: false, suggestions: false, answered: false, words: true, rooms: [], everyRoom: false }, 'something started on');
  assert.equal(cleanWant({ everyRoom: 'yes' }).everyRoom, false, 'every room is on only when it is true');
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
  const bex = await claimedPassFor('Bex', s), cy = await claimedPassFor('Cy', s), ada = await claimedPassFor('Ada', s);
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
  await keepDevice(bexDev, await claimedPassFor('Bex', s, 'base'), { mentions: true }, s);
  await keepDevice(cyDev, await claimedPassFor('Cy', s, 'base'), { rooms: [room] }, s);
  const sent = [];
  await notifyMessage({ id: 'q', handle: 'Ada', text: 'hush @bex', t: 1 }, room, s, mods, async (sub) => { sent.push(sub.endpoint); return 201; });
  assert.deepEqual(sent, [cyDev.endpoint], 'a room that keeps to itself was announced to somebody who does not follow it');
}));

test('following every room tells a device about every room its pass can go into, and never one that keeps to itself', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const mods = readMods('{"Cy":["administrator"]}');
  const bexDev = aDevice(), cyDev = aDevice(), dovDev = aDevice();
  await keepDevice(bexDev, await claimedPassFor('Bex', s), { everyRoom: true, calls: true }, s);
  await keepDevice(cyDev, await claimedPassFor('Cy', s, 'base'), { everyRoom: true, rooms: [QUIET_ROOMS[1]] }, s);
  await keepDevice(dovDev, await claimedPassFor('Dov', s), { all: true }, s);
  const sent = [];
  const send = async (sub, payload) => { sent.push({ to: sub.endpoint, payload }); return 201; };
  const to = (d) => sent.filter((x) => x.to === d.endpoint).map((x) => x.payload.room);
  for (const room of ['the-den', 'a-room-that-opens-next-year', 'town-hall-moderators', QUIET_ROOMS[0], QUIET_ROOMS[1]]) {
    await notifyMessage({ id: 'm-' + room, handle: 'Ada', text: 'hello', t: 1 }, room, s, mods, send);
  }
  assert.deepEqual(to(bexDev), ['the-den', 'a-room-that-opens-next-year'], 'every room missed a room, told a private one, or announced a quiet one');
  assert.deepEqual(to(cyDev), ['the-den', 'a-room-that-opens-next-year', 'town-hall-moderators', QUIET_ROOMS[1]], 'every room and a room followed by name did not add up');
  assert.deepEqual(to(dovDev), [], 'Everything followed every room, which it leaves as it is');
  assert.ok(!followsRoom({ everyRoom: true }, null), 'World is its own switch, not a room');
  sent.length = 0;
  await notifyCall('the-den', s, mods, send, Date.now());
  assert.deepEqual(sent.map((x) => x.to), [bexDev.endpoint], 'a call in any room missed somebody following every room with calls on');
}));

test('an edited message tells only somebody it newly @mentions, never the channel\'s followers again', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const bexDev = aDevice(), cyDev = aDevice(), dovDev = aDevice();
  await keepDevice(bexDev, await claimedPassFor('Bex', s), { mentions: true }, s);
  await keepDevice(cyDev, await claimedPassFor('Cy', s), { world: true, rooms: ['the-den'] }, s);
  await keepDevice(dovDev, await claimedPassFor('Dov', s), { mentions: true }, s);
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
  await keepDevice(dev3, await claimedPassFor('Cy', s), { world: true }, s);
  await dropDevicesOf('cy', s);
  assert.deepEqual(Object.keys(await readDevices(s)), [], 'Forget me left a device');
  await keepDevice(dev3, await claimedPassFor('Cy', s), { world: true }, s);
  await dropDevice(dev3.endpoint, s);
  assert.deepEqual(Object.keys(await readDevices(s)), []);
}));

test('a device the push service says has gone is forgotten, and a handle has only so many', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const a = aDevice(), b = aDevice();
  await keepDevice(a, await claimedPassFor('Bex', s), { world: true }, s);
  await keepDevice(b, await claimedPassFor('Cy', s), { world: true }, s);
  await notifyMessage({ id: 'x', handle: 'Ada', text: 'hi', t: 1 }, null, s, readMods(''), async (sub) => (sub.endpoint === a.endpoint ? 410 : 201));
  assert.deepEqual(Object.keys(await readDevices(s)), [pushDeviceId(b.endpoint)]);
  for (let i = 0; i < PUSH_PER_HANDLE - 1; i++) assert.ok((await keepDevice(aDevice(), await claimedPassFor('Cy', s), {}, s)).id);
  assert.equal((await keepDevice(aDevice(), await claimedPassFor('Cy', s), {}, s)).error, 'many');
  assert.ok((await keepDevice(b, await claimedPassFor('Cy', s), { calls: true }, s)).id, 'changing a device already kept was refused');
  assert.equal((await keepDevice(aDevice('example.org'), await claimedPassFor('Dee', s), {}, s)).error, 'address');
  assert.equal((await keepDevice(aDevice(), 'not a pass', {}, s)).error, 'pass');
}));

test('a call that starts tells who follows its room, never who joined, and not twice in a while', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.UTC(2026, 9, 18, 15);
  const evt = (type, name, pid, t, room = 'the-den') => ({ eventType: type, fqn: `${JAAS_APP}/stimpunks-${room}`, timestamp: t, data: { name, participantId: pid } });
  assert.equal(await callEvent(evt('PARTICIPANT_JOINED', 'Sam', 'p1', now), s, now), 'started');
  assert.equal(await callEvent(evt('PARTICIPANT_JOINED', 'Ada', 'p2', now + 1), s, now), 'joined');
  const den = aDevice(), all = aDevice(), off = aDevice();
  await keepDevice(den, await claimedPassFor('Bex', s), { calls: true, rooms: ['the-den'] }, s);
  await keepDevice(all, await claimedPassFor('Cy', s), { calls: true }, s);
  await keepDevice(off, await claimedPassFor('Dee', s), { rooms: ['the-den'] }, s);
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
  await keepDevice(off, await claimedPassFor('Dee', s), { calls: true, rooms: ['town-hall-moderators'] }, s);
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

/* ── Team Docs: subcategories, years, templates and pictures in the words ── */
import { forumCategories, forumTemplates, placePictures, withoutPictures, FORUM_DOC_ATTACH_MAX, FORUM_DOC_BODY_MAX, FORUM_BODY_MAX } from './lib.mjs';

test('Team Docs is for moderators, a subcategory is its parent\'s in everything, and a shelf holds no topics', async () => {
  const s = memoryStore({ etagOnRead: true });
  const docs = ['team-docs', 'field-guide', 'notes', 'meeting-minutes', 'templates', 'meeting-minutes-2026'];
  for (const slug of docs) {
    assert.ok(!forumNav(ADA).some((c) => c.slug === slug), `${slug} was sent to a claimed username with no role`);
    assert.ok(forumNav(FMOD).some((c) => c.slug === slug), `${slug} was not sent to a moderator`);
  }
  for (const c of forumCategories(T0).filter((x) => x.parent)) {
    const up = forumCat(c.parent, T0);
    for (const k of ['see', 'start', 'strict', 'wiki', 'keep', 'group']) assert.deepEqual(c[k], up[k], `${c.slug}'s ${k} is not its parent's`);
  }
  const nav = forumNav(FMOD);
  const at = (slug) => nav.find((c) => c.slug === slug);
  assert.deepEqual([at('team-docs').shelf, at('team-docs').start, at('field-guide').start, at('field-guide').wiki], [true, false, true, true]);
  assert.match((await startTopic(FMOD, { cat: 'team-docs', title: 'Loose', body: 'Words.' }, s, T0, NO_NET)).error, /holds its subcategories/);
  assert.match((await startTopic(FMOD, { cat: 'meeting-minutes', title: 'Loose', body: 'Words.' }, s, T0, NO_NET)).error, /holds its subcategories/);
  const min = (await startTopic(FMOD, { cat: 'meeting-minutes-2025', title: 'Board Meeting Minutes for 12/02/2025', body: 'Present: everybody.' }, s, T0, NO_NET)).topic;
  const page = (await startTopic(FMOD, { cat: 'field-guide', title: 'Claiming a username', body: 'Open Account.' }, s, T0 + 1, NO_NET)).topic;
  assert.equal(await forumTopic(ADA, min.id, s, T0 + 2), null, 'minutes were read by somebody with no role');
  assert.equal(await forumCategory(ADA, 'team-docs', null, s, T0 + 2), null);
  // A category's page lists the topics under it, and the categories directly in it.
  const shelf = await forumCategory(FMOD, 'team-docs', null, s, T0 + 2);
  assert.deepEqual(shelf.subs.map((c) => c.slug), ['field-guide', 'notes', 'meeting-minutes', 'templates']);
  assert.deepEqual(shelf.topics.map((x) => [x.id, x.cat]), [[page.id, 'field-guide'], [min.id, 'meeting-minutes-2025']]);
  assert.deepEqual((await forumCategory(FMOD, 'meeting-minutes', null, s, T0 + 2)).subs.map((c) => c.name), ['2026', '2025', '2024']);
  // The front lists Team Docs once, with what is in it, and its latest from under it.
  const home = await forumHome(FMOD, s, T0 + 2);
  assert.ok(!home.some((c) => c.parent), 'a subcategory stood on the front by itself');
  const card = home.find((c) => c.slug === 'team-docs');
  assert.deepEqual([card.subs.length, card.latest[0].id], [4, page.id]);
  // Moved, never onto a shelf; and its pages are any moderator's to keep up.
  assert.match((await moderateTopic(FMOD, min.id, { move: 'team-docs' }, s, T0 + 3)).error, /holds its subcategories/);
  assert.ok((await moderateTopic(FMOD, page.id, { move: 'notes' }, s, T0 + 3)).topic);
  assert.ok((await editPost(fw('Mo', 600, []), min.id, min.posts[0].id, { body: 'Present: everybody but Bo.' }, s, T0 + 4, NO_NET)).topic, 'another moderator could not keep the minutes up to date');
  assert.ok(await forumTopic(FMOD, min.id, s, T0 + DAYS(4000)), 'minutes went');
});

test('Meeting Minutes has a year for every year from its first to this one, on the street\'s clock, and keeps them', () => {
  const years = (now) => forumCategories(now).filter((c) => c.parent === 'meeting-minutes').map((c) => c.slug);
  assert.deepEqual(years(T0), ['meeting-minutes-2026', 'meeting-minutes-2025', 'meeting-minutes-2024']);
  // 03:00 on the first of January in London is still New Year's Eve in Colorado.
  assert.equal(years(Date.UTC(2027, 0, 1, 3)).includes('meeting-minutes-2027'), false);
  assert.deepEqual(years(Date.UTC(2027, 0, 1, 12)).slice(0, 2), ['meeting-minutes-2027', 'meeting-minutes-2026']);
  assert.ok(forumCat('meeting-minutes-2024', Date.UTC(2030, 5, 1)), 'an old year stopped being found');
  assert.equal(forumCat('meeting-minutes-2027', T0), null, 'a year was there before it began');
});

test('templates are offered to the people who can read them, without their pictures or their read-me', async () => {
  const s = memoryStore({ etagOnRead: true });
  const pic = await putForumUpload(FMOD, { kind: 'pic' }, JPEG(), s, T0);
  const tpl = (await startTopic(FMOD, { cat: 'templates', title: 'Weekly Operations Meeting for Week xx',
    body: `## Agenda\n\n![The board](pic:${pic.id})\n\n- One`, files: [{ id: pic.id }], tags: ['operations'] }, s, T0, NO_NET)).topic;
  const readme = (await startTopic(FMOD, { cat: 'templates', title: 'Read Me: Using These Templates', body: 'Pick one.' }, s, T0 + 1, NO_NET)).topic;
  await moderateTopic(FMOD, readme.id, { pin: true }, s, T0 + 2);
  await startTopic(FMOD, { cat: 'field-guide', title: 'Not a template', body: 'Words.' }, s, T0 + 3, NO_NET);
  assert.deepEqual(await forumTemplates(FMOD, s, T0 + 4), [{ id: tpl.id, cat: 'templates', title: 'Weekly Operations Meeting for Week xx', body: '## Agenda\n\n- One', tags: ['operations'] }]);
  assert.deepEqual(await forumTemplates(ADA, s, T0 + 4), [], 'a template was offered to somebody who cannot read it');
  assert.equal(withoutPictures(`a ![x](pic:${pic.id}) b`), 'a  b');
});

test('a picture stands in the words only where its post holds it, and is not shown again below them', async () => {
  const s = memoryStore({ etagOnRead: true });
  const one = await putForumUpload(FMOD, { kind: 'pic' }, JPEG(), s, T0);
  const two = await putForumUpload(FMOD, { kind: 'pic' }, JPEG(), s, T0);
  const loose = await putForumUpload(FMOD, { kind: 'pic' }, JPEG(), s, T0);
  const elsewhere = '00000000-0000-4000-8000-000000000000';
  const body = `Step one.\n\n![The radio](pic:${one.id})\n\n| Step | Picture |\n|---|---|\n| two | ![](pic:${two.id}) |\n\n![A stranger's](pic:${elsewhere})`;
  const t = (await startTopic(FMOD, { cat: 'field-guide', title: 'A how-to', body, files: [{ id: one.id }, { id: two.id, alt: 'The Account part' }, { id: loose.id }] }, s, T0, NO_NET)).topic;
  const p = (await forumTopic(FMOD, t.id, s, T0)).posts[0];
  const pics = JSON.stringify(p.blocks).match(/"t":"pic","id":"[^"]+","alt":"[^"]*"/g);
  assert.deepEqual(pics, [`"t":"pic","id":"${one.id}","alt":"The radio"`, `"t":"pic","id":"${two.id}","alt":"The Account part"`]);
  assert.ok(JSON.stringify(p.blocks).includes(`![A stranger's](pic:${elsewhere})`), 'a picture the post does not hold was shown, or its words went');
  assert.deepEqual(p.files.map((f) => !!f.placed), [true, true, false]);
  // Nothing is placed by a page that does not ask: the board and the box read Markdown as before.
  assert.equal(JSON.stringify(parseBrass(body)).includes('"t":"pic"'), false);
  assert.equal(JSON.stringify(placePictures(parseBrass(body), new Map())).includes('"t":"pic"'), false);
});

test('a wiki\'s document holds a screenshot for every step, and every other post a few', async () => {
  const s = memoryStore({ etagOnRead: true });
  const up = async (n) => { const out = []; for (let i = 0; i < n; i++) out.push({ id: (await putForumUpload(FMOD, { kind: 'pic' }, JPEG(), s, T0)).id }); return out; };
  const many = await up(FORUM_ATTACH_MAX + 4);
  const t = await startTopic(FMOD, { cat: 'field-guide', title: 'Twelve steps', body: 'Steps.', files: many }, s, T0, NO_NET);
  assert.ok(t.topic, t.error);
  assert.match((await replyTopic(FMOD, t.topic.id, { body: 'More', files: await up(FORUM_ATTACH_MAX + 1) }, s, T0 + 1, NO_NET)).error, /A post holds/);
  assert.match((await startTopic(FMOD, { cat: 'moderators', title: 'Lots', body: 'x', files: await up(FORUM_ATTACH_MAX + 1) }, s, T0 + 2, NO_NET)).error, /A post holds/);
  assert.match((await startTopic(FMOD, { cat: 'notes', title: 'Too many', body: 'x', files: Array.from({ length: FORUM_DOC_ATTACH_MAX + 1 }, () => many[0]) }, s, T0 + 3, NO_NET)).error, /A document holds/);
});

test('a wiki\'s page is as long as a long document, and every other post stays short', async () => {
  const s = memoryStore({ etagOnRead: true });
  const words = (n) => ('Minutes. '.repeat(Math.ceil(n / 9))).slice(0, n);
  const page = await startTopic(FMOD, { cat: 'meeting-minutes-2026', title: 'September 29 board meeting', body: words(100358) }, s, T0, NO_NET);
  assert.ok(page.topic, page.error);
  const p0 = page.topic.posts[0].id;
  assert.match((await startTopic(FMOD, { cat: 'notes', title: 'Too long even for a page', body: words(FORUM_DOC_BODY_MAX + 1) }, s, T0, NO_NET)).error, /A page is up to 150000/);
  assert.match((await startTopic(FMOD, { cat: 'moderators', title: 'Long', body: words(FORUM_BODY_MAX + 1) }, s, T0, NO_NET)).error, /A post is up to 20000/);
  assert.match((await replyTopic(FMOD, page.topic.id, { body: words(FORUM_BODY_MAX + 1) }, s, T0 + 1, NO_NET)).error, /up to 20000/, 'a reply in a wiki was as long as a page');
  const reply = (await replyTopic(FMOD, page.topic.id, { body: 'Seconded.' }, s, T0 + 2, NO_NET)).post;
  assert.ok((await editPost(fw('Mo', 600, []), page.topic.id, p0, { body: words(120000) }, s, T0 + 3, NO_NET)).topic, 'another moderator could not keep a long page up to date');
  assert.match((await editPost(FMOD, page.topic.id, reply.id, { body: words(FORUM_BODY_MAX + 1) }, s, T0 + 4, NO_NET)).error, /A post is up to 20000/);
  assert.match((await editPost(FMOD, page.topic.id, p0, { body: words(FORUM_DOC_BODY_MAX + 1) }, s, T0 + 5, NO_NET)).error, /up to 150000/);
  assert.equal((await forumTopic(ADA, page.topic.id, s, T0 + 6)), null, 'a long page went to somebody who cannot read Team Docs');
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

import { putDmImage, getDmImage, reportImage } from './lib.mjs';
import { reactDm } from './lib.mjs';

test('a conversation takes stickers and reactions only once accepted, the channel\'s way', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const [ada, bex] = await twoPeople(s);
  await setDmOpen(bex, true, s);
  const av = (await keepAvatar(petKey('Ada'), { look: lookOf(), name: 'Saloon' }, s)).kept;
  // A request is words only: no sticker, and nothing to react to yet.
  assert.equal((await sendDm(ada, 'Bex', { text: '', avatar: av.id }, s)).error, 'accepted', 'a sticker went before there was a conversation');
  const first = (await sendDm(ada, 'Bex', 'hello', s)).sent;
  assert.equal((await sendDm(ada, 'Bex', { text: '', avatar: av.id }, s)).error, 'accepted', 'a sticker went with a request waiting');
  assert.equal((await reactDm(bex, 'Ada', first.id, '\u2764\uFE0F', s)).error, 'accepted', 'somebody reacted to a request instead of answering it');
  await acceptDm(bex, 'Ada', s);
  // Only one's own, one at a time.
  assert.equal((await sendDm(bex, 'Ada', { text: '', avatar: av.id }, s)).error, 'sticker', 'somebody sent a sticker of another person\'s avatar');
  assert.equal((await sendDm(ada, 'Bex', { text: '', avatar: av.id, jacket: true }, s)).error, 'one', 'a message carried two stickers');
  const st = (await sendDm(ada, 'Bex', { text: '', avatar: av.id }, s)).sent;
  assert.equal(st.avatar.name, 'Saloon', 'the sticker was not copied when it went');
  let b = await readDmWith(bex, 'Ada', s);
  const shown = b.messages.find((m) => m.id === st.id);
  assert.ok(shown.avatar && shown.avatar.look, 'the other person was not shown the sticker');
  assert.equal(shown.by, undefined, 'a sender’s key left the server');
  // A reaction names who, never how many, and the second press takes it back.
  const heart = REACTIONS[0][0];
  await reactDm(bex, 'Ada', first.id, heart, s);
  await reactDm(ada, 'Bex', first.id, heart, s);
  b = await readDmWith(bex, 'Ada', s);
  assert.deepEqual(b.messages[0].reactions, [{ emoji: heart, name: REACTIONS[0][1], who: ['Ada', 'Bex'] }]);
  await reactDm(bex, 'Ada', first.id, heart, s);
  assert.deepEqual((await readDmWith(ada, 'Bex', s)).messages[0].reactions[0].who, ['Ada'], 'a reaction did not come back off');
  assert.equal((await reactDm(ada, 'Bex', first.id, 'not an emoji', s)).error, 'emoji');
  assert.equal((await reactDm(ada, 'Bex', 'dnothere000', heart, s)).error, 'which');
  // An edit keeps them; a sticker's message may be left with no words.
  await editDm(ada, 'Bex', first.id, 'hello again', s);
  assert.equal((await readDmWith(ada, 'Bex', s)).messages[0].reactions[0].who[0], 'Ada', 'an edit lost the reactions');
  assert.equal((await editDm(ada, 'Bex', st.id, '', s)).error, undefined, 'a sticker could not lose its words');
}));
test('a conversation takes a picture only once accepted, shows it only to the two, and loses it with its message', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const [ada, bex] = await twoPeople(s);
  await setDmOpen(bex, true, s);
  // A request is words only: nobody's first contact with you is a picture.
  assert.equal((await putDmImage(ada, 'Bex', jpeg(), s)).error, 'accepted', 'a picture went before there was a conversation');
  await sendDm(ada, 'Bex', 'Hi, may I send you a screenshot?', s);
  assert.equal((await putDmImage(ada, 'Bex', jpeg(), s)).error, 'accepted', 'a picture went with a request still waiting');
  assert.equal((await putDmImage(bex, 'Ada', jpeg(), s)).error, 'accepted', 'a picture went back before the request was accepted');
  await acceptDm(bex, 'Ada', s);
  assert.equal((await putDmImage(ada, 'Bex', exifJpeg(), s)).error, 'bad', 'a picture still carrying camera data was taken');
  const id = (await putDmImage(ada, 'Bex', jpeg(), s)).id;
  assert.ok(id);
  assert.ok(s.keys().includes('dm-img/' + id) && !s.keys().includes('img/' + id), 'a conversation\u2019s picture is where the channel\u2019s sweep looks');
  // Only a picture of yours, put up for this conversation, goes in it.
  await claimAccount('Cy', 'a long enough phrase', s, 33, null);
  const cy = person('Cy', 33);
  await setDmOpen(cy, true, s);
  await sendDm(bex, 'Cy', 'hello', s);
  await acceptDm(cy, 'Bex', s);
  const cys = (await putDmImage(cy, 'Bex', jpeg(), s)).id;
  assert.equal((await sendDm(ada, 'Bex', { text: '', img: cys }, s)).error, 'picture', 'somebody else\u2019s picture went into a conversation');
  assert.equal((await sendDm(bex, 'Cy', { text: '', img: id }, s)).error, 'picture', 'a picture went into a conversation it was not for');
  const sent = (await sendDm(ada, 'Bex', { text: '', img: id, alt: 'The sandbox, not loading' }, s)).sent;
  assert.ok(sent);
  const seen = (await readDmWith(bex, 'Ada', s)).messages.at(-1);
  assert.equal(seen.img, id);
  assert.equal(seen.alt, 'The sandbox, not loading');
  assert.equal(seen.text, '');
  assert.ok(await getDmImage(bex, id, s), 'the other person could not see it');
  assert.ok(await getDmImage(ada, id, s), 'its sender could not see it');
  assert.equal(await getDmImage(cy, id, s), null, 'somebody outside the conversation fetched its picture');
  await claimAccount('Mo', 'a long enough phrase', s, 44, null);
  const mo = { role: 'base', handle: 'Mo', roles: new Set(['moderator']), account: true, since: 44 };
  assert.equal(await getDmImage(mo, id, s), null, 'a moderator fetched a picture out of a conversation');
  // Words only on a picture's message may be edited away; it is still the picture.
  assert.ok(!(await editDm(ada, 'Bex', sent.id, 'look at this', s)).error);
  assert.ok(!(await editDm(ada, 'Bex', sent.id, '', s)).error, 'a picture\u2019s words could not be edited away');
  // Reported: a copy onto the desk, for the base only, kept when the message goes.
  await reportDm(bex, 'Ada', sent.id, '', s);
  const desk = await readReports(mo, s);
  assert.equal(desk[0].img, true);
  assert.equal(desk[0].alt, 'The sandbox, not loading');
  assert.ok(await reportImage(mo, desk[0].id, s));
  assert.equal(await reportImage(bex, desk[0].id, s), null, 'somebody who is not a moderator saw a reported picture');
  await takeDm(ada, 'Bex', sent.id, s);
  assert.equal(await getDmImage(bex, id, s), null, 'a picture taken back could still be fetched');
  assert.ok(!s.keys().includes('dm-img/' + id), 'a picture outlived its message');
  assert.ok(await reportImage(mo, desk[0].id, s), 'taking a message back took its picture off the desk');
  await closeReport(mo, desk[0].id, s);
  assert.deepEqual(s.keys().filter((k) => k.startsWith('dm-report-img/')), [], 'closing a report left its picture');
  // The sweep: a picture past its message's 48 hours, and one never sent.
  const t0 = Date.now();
  const late = (await putDmImage(ada, 'Bex', jpeg(), s, t0)).id;
  await sendDm(ada, 'Bex', { text: 'later', img: late }, s, t0);
  const unsent = (await putDmImage(ada, 'Bex', jpeg(), s, t0)).id;
  await sweepDms(s, t0 + 1000);
  assert.ok(s.keys().includes('dm-img/' + late) && s.keys().includes('dm-img/' + unsent), 'the sweep took a picture still held, or one just put up');
  await sweepDms(s, t0 + LIFE + 1);
  assert.ok(!s.keys().includes('dm-img/' + late), 'the sweep left a picture whose message had gone');
  assert.ok(!s.keys().includes('dm-img/' + unsent), 'the sweep left a picture nobody sent');
  // Forget me, and blocking, take every picture in the conversations with them.
  await sendDm(ada, 'Bex', 'again', s);
  await acceptDm(bex, 'Ada', s);
  await sendDm(ada, 'Bex', { text: '', img: (await putDmImage(ada, 'Bex', jpeg(), s)).id }, s);
  await blockDm(bex, 'Ada', s);
  assert.deepEqual(s.keys().filter((k) => k.startsWith('dm-img/') && k !== 'dm-img/' + cys), [], 'a block left a picture behind');
  await sendDm(cy, 'Bex', { text: '', img: cys }, s);
  await forgetDms('Cy', 33, s);
  assert.deepEqual(s.keys().filter((k) => k.startsWith('dm-img/')), [], 'Forget me left a picture behind');
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

import { wants, PUSH_KINDS } from './lib.mjs';
test('Everything tells a device about every kind there is, World included, and a kind added later', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  await claimAccount('Bex', 'a long enough phrase', s, 22, null);
  const acct = await readAccount('Bex', s);
  const every = aDevice(), quiet = aDevice(), one = aDevice();
  await keepDevice(every, issueAccountPass('Bex', acct.v), { all: true }, s);
  await keepDevice(quiet, issueAccountPass('Bex', acct.v), { all: true, words: false }, s);
  await keepDevice(one, issueAccountPass('Bex', acct.v), { props: true }, s);
  const sent = [];
  const send = async (sub, payload) => { sent.push({ to: sub.endpoint, payload }); return 201; };
  await notifyMessage({ id: 'w1', handle: 'Ada', text: 'morning, World', t: 1 }, null, s, readMods(''), send);
  await notifyMessage({ id: 'w2', handle: 'Ada', text: 'in the den @bex', t: 1 }, 'the-den', s, readMods(''), send);
  await notifyMessage({ id: 'w3', handle: 'Ada', text: 'in the den, nobody named', t: 1 }, 'the-den', s, readMods(''), send);
  await notifyDm('Bex', 'Ada', 'Hello there', true, s, readMods(''), send);
  await notifyProps('Bex', 'Ada', 'Thank you', s, readMods(''), send);
  await notifyCall(WORLD_CALL, s, readMods(''), send, Date.now());
  const kinds = (d) => sent.filter((x) => x.to === d.endpoint).map((x) => x.payload.kind + (x.payload.why ? ' ' + x.payload.why : ''));
  assert.deepEqual(kinds(every), ['message channel', 'message mention', 'dm', 'props', 'call'],
    'Everything missed a kind, or followed a room nobody followed');
  assert.deepEqual(kinds(one), ['props'], 'one switch told a device about the others');
  assert.ok(sent.filter((x) => x.to === quiet.endpoint).every((x) => !x.payload.text), 'Everything showed the words to a device that switched them off');
  // A kind that does not exist yet is on for Everything and off for everybody else.
  assert.ok(wants(cleanWant({ all: true }), 'a-kind-added-next-year'));
  assert.ok(!wants(cleanWant({ props: true }), 'a-kind-added-next-year'));
  for (const k of PUSH_KINDS) assert.ok(wants(cleanWant({ all: true }), k), k);
  assert.deepEqual(cleanWant({ all: true }).rooms, [], 'Everything followed rooms');
  assert.equal(cleanWant({ all: true }).words, true, 'Everything changed the words switch');
}));


import { noteLatest, newFor, markRead, forgetReads } from './lib.mjs';

test('what is new to a claimed username is a mark worked out from what it read, and never counted', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const [ada, bex] = await twoPeople(s);
  const now = Date.now();
  assert.equal((await newFor({ role: 'mobile', handle: 'Cy', roles: new Set() }, s)).error, 'claim', 'an unclaimed handle was told what is new to it');
  await noteLatest(WORLD_CALL, now - 5000, s, now);
  await noteLatest('the-den', now - 4000, s, now);
  assert.equal(await noteLatest(QUIET_ROOMS[0], now - 3000, s, now), false, 'a room that keeps to itself was put on the map');
  await noteLatest('the-den', now - 9000, s, now);
  let n = await newFor(ada, s, now);
  assert.deepEqual(Object.keys(n).sort(), ['asking', 'dms', 'latest', 'read'], 'the answer carried more than marks need');
  assert.equal(n.latest[WORLD_CALL], now - 5000);
  assert.equal(n.latest['the-den'], now - 4000, 'the newest time went backwards');
  assert.equal(n.latest[QUIET_ROOMS[0]], undefined);
  assert.deepEqual(n.read, {});
  // Reading World up to its newest message clears it, and never goes back.
  await markRead(ada, { ch: WORLD_CALL }, now - 5000, s, now);
  await markRead(ada, { ch: WORLD_CALL }, now - 60000, s, now);
  n = await newFor(ada, s, now);
  assert.equal(n.read[WORLD_CALL], now - 5000, 'reading went backwards');
  assert.equal((await newFor(bex, s, now)).read[WORLD_CALL], undefined, 'one person was told what another read');
  assert.equal((await markRead(ada, { ch: QUIET_ROOMS[0] }, now, s, now)).error, 'which', 'reading a room that keeps to itself was recorded');
  assert.equal((await markRead(ada, { ch: 'town-hall-board' }, now, s, now)).error, 'which', 'reading a room the username may not enter was recorded');
  assert.equal((await markRead(ada, { ch: 'the-den' }, now + 99999, s, now)).read, true);
  assert.equal((await newFor(ada, s, now)).read['the-den'], now, 'a read time was kept from the future');
  // A conversation is new when the other person spoke last, after you read it.
  await setDmOpen(bex, true, s);
  await sendDm(ada, 'Bex', 'hello', s, now - 3000);
  n = await newFor(bex, s, now);
  assert.equal(n.asking, true, 'a first message waiting was not marked');
  assert.deepEqual(n.dms, ['Ada']);
  assert.deepEqual((await newFor(ada, s, now)).dms, [], 'the asker was marked new by their own message');
  await sendDm(bex, 'Ada', 'hi back', s, now - 2000);
  assert.deepEqual((await newFor(bex, s, now)).dms, [], 'answering left the conversation marked new');
  assert.deepEqual((await newFor(ada, s, now)).dms, ['Bex']);
  await markRead(ada, { dm: 'Bex' }, now - 2000, s, now);
  assert.deepEqual((await newFor(ada, s, now)).dms, [], 'reading a conversation did not clear it');
  // Forgetting deletes the record.
  await forgetReads('Ada', 11, s);
  assert.deepEqual((await newFor(ada, s, now)).read, {}, 'Forget me left what was read');
}));

for (const etagOnRead of [true, false]) {
  test(`fifteen channels noting a new message at once, ${etagOnRead ? 'with' : 'without'} an etag on reads: none told it went is missing`, async () => {
    const s = memoryStore({ etagOnRead });
    const now = Date.now();
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => noteLatest(`room-${i}`, now - i, s, now)));
    const map = (await s.get('channel-latest', { type: 'json' })).latest;
    told.forEach((r, i) => { if (r.status === 'fulfilled') assert.equal(map[`room-${i}`], now - i, `room-${i} was told it went and is missing`); });
  });
}

/* ── Tasks ─────────────────────────────────────────────────────────────── */
import { tasksAllow, taskPeople, tasksList, taskOne, saveTask, removeTask, readTasks, taskViews, saveTaskView, removeTaskView,
  forgetTaskViews, taskAddress, TASK_VIEWS_KEEP, TASK_STATUSES, TASK_TAGS, taskRecurs, taskRecur, saveRecur, removeRecur,
  makeRecurring, readRecurs, isoWeek, recurName, recurAfter, tickTask, taskBoxes, officeAllow, officeReady, seal, unseal,
  readContacts, officeContacts, officeContact, saveContact, removeContact, importContacts,
  readGrants, officeGrants, officeGrant, saveGrant, removeGrant, importGrants, OFFICE_PIPELINES,
  readCases, officeCases, officeCase, saveCase, removeCase, importCases, intakeSigned, intakeReady, officeIntake, INTAKE_BY,
  mailSigned, mailReady, mailAddresses, officeMailIn, officeMailContact, MAIL_BY, officeEmail, removeEmail, officeMailCounts, MAIL_RECENT_KEEP, MAIL_RECENT_SHOWN, seedRecentMail, FORM_ENTRIES_SHOWN,
  officeDashboard, officeReports, officeTemplates, saveTemplate, removeTemplate, previewMailing, sendMailing, officeMailings, officeMailing, stopMailing, removeMailing,
  mailOutbox, mailSentFor, unknownFillIns, countMessage, readDayCounts, DAY_COUNTS_DAYS, officeNightly, OFFICE_NIGHTS_KEEP,
  qbConnect, qbCallback, qbStatus, qbDisconnect, officeQuickBooks, QB_SCOPE, officeGivebutter, gbStatus, gbJoin, caseLists, writeInvite, OFFICE_INVITE, INVITE_LINK, caseListing, listingLine, listingLook, listingAdd, membersList, LISTING_MAX, caseOrg, orgFields, orgHtml, orgsList, orgLook, orgAdd, bareImage,
  taskInbox, readTaskInbox, taskActivity, forgetTaskInbox, taskChanges, TASK_INBOX_DAYS, notifyTask,
  taskFeed, FEED_PAGE, officeFeed, OFFICE_FEED_PAGE, taskComments, commentTask, editTaskComment, removeTaskComment,
  TASK_COMMENT_MAX, TASK_COMMENTS_KEEP, officeComments, commentOffice, editOfficeComment, removeOfficeComment, officeTemplate, importTaskComment,
  taskTemplates, taskTemplate, saveTaskTemplate, removeTaskTemplate, readTaskTpls, TASK_TEMPLATE_SEED,
  memberMap, readMemberMap, mapFind, mapPut, mapTake, mapTakeOne, importMap, officeMemberMap, MAP_NEAR_KM } from './lib.mjs';

const TMODS = readMods('{"Ryan":["administrator","director"],"Chelsea":["director"],"Norah":["director"],"Sam":[]}');
const TRYAN = fw('Ryan', 300, ['administrator', 'director']), TCHELSEA = fw('Chelsea', 700, ['director']);
const TSAM = fw('Sam', 800, []), TADMIN = fw('Al', 500, ['administrator']);

test('tasks are for directors, board members and administrators on a claimed username, and nobody else is told a thing', async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.ok(tasksAllow(TCHELSEA) && tasksAllow(TRYAN) && tasksAllow(TADMIN));
  for (const who of [ADA, TSAM, { role: 'base', handle: 'Chelsea', roles: new Set(['moderator', 'director']) }]) {
    assert.equal(tasksAllow(who), false, `${who.handle} was let into tasks`);
    assert.equal(await tasksList(who, s), null);
    assert.match((await saveTask(who, { name: 'Sneak' }, s, T0, TMODS)).error, /directors, board members and administrators/);
  }
  assert.deepEqual(taskPeople(TMODS), ['Chelsea', 'Norah', 'Ryan'], 'somebody who cannot read tasks could be assigned one');
  assert.deepEqual(await readTasks(s), [], 'a refused save wrote something');
});

test('a task keeps what it is given, checks every field, and a change touches only what it names', async () => {
  const s = memoryStore({ etagOnRead: true });
  const made = await saveTask(TCHELSEA, { name: '  Pay Employee Invoices ', priority: 'High', due: '2026-10-24', who: 'norah', with: ['Ryan', 'chelsea'], tags: ['Weekly', 'Finance'], body: 'Pay **every** invoice.' }, s, T0, TMODS);
  assert.ok(made.task, made.error);
  const t = made.task;
  assert.deepEqual([t.name, t.status, t.priority, t.due, t.who, t.with, t.tags, t.by, t.t], ['Pay Employee Invoices', TASK_STATUSES[0], 'High', '2026-10-24', 'Norah', ['Chelsea', 'Ryan'], ['Finance', 'Weekly'], 'Chelsea', T0]);
  assert.equal(t.blocks[0].t, 'p');
  for (const [f, why] of [[{ status: 'Done-ish' }, /status/], [{ priority: 'Meh' }, /priority/], [{ due: '2026-13-40' }, /day/], [{ tags: ['Nope'] }, /tag/], [{ who: 'Sam' }, /assigned/], [{ name: '' }, /name/], [{ with: ['Sam'] }, /working/]]) {
    assert.match((await saveTask(TRYAN, { id: t.id, ...f }, s, T0 + 1, TMODS)).error, why);
  }
  // Two people changing different things both keep theirs.
  await Promise.all([saveTask(TRYAN, { id: t.id, status: 'Started' }, s, T0 + 2, TMODS), saveTask(TCHELSEA, { id: t.id, tags: ['Finance'] }, s, T0 + 2, TMODS)]);
  let now = await taskOne(TRYAN, t.id, s);
  assert.deepEqual([now.status, now.tags, now.priority, now.who], ['Started', ['Finance'], 'High', 'Norah']);
  assert.ok(now.editedBy && now.edited === T0 + 2);
  // Finished when it becomes Completed, and not when it stops being.
  now = (await saveTask(TRYAN, { id: t.id, status: 'Completed' }, s, T0 + 3, TMODS)).task;
  assert.equal(now.done, T0 + 3);
  now = (await saveTask(TRYAN, { id: t.id, status: 'Started' }, s, T0 + 4, TMODS)).task;
  assert.equal(now.done, null);
  // Somebody who leaves the list keeps the tasks they had.
  const fewer = readMods('{"Ryan":["administrator","director"],"Chelsea":["director"]}');
  assert.ok((await saveTask(TRYAN, { id: t.id, name: 'Pay invoices', who: 'Norah' }, s, T0 + 5, fewer)).task, 'a change failed because the task kept somebody who left');
  assert.match((await saveTask(TRYAN, { name: 'New', who: 'Norah' }, s, T0 + 6, fewer)).error, /assigned/);
  const list = await tasksList(TRYAN, s);
  assert.equal(list[0].body, undefined, 'the list sent a description');
  assert.equal(list[0].words, 'Pay **every** invoice.'.length);
  assert.ok((await removeTask(TRYAN, t.id, s)).gone);
  assert.match((await removeTask(TRYAN, t.id, s)).error, /already been deleted/);
});

test('a task brought from EspoCRM again changes the one already brought, and keeps EspoCRM\'s dates', async () => {
  const s = memoryStore({ etagOnRead: true });
  const f = { espo: '6ad749d56d3dcd58d', name: 'Categorize New Receipts', status: 'Completed', start: '2026-10-20', due: '2026-10-20', who: 'Norah', tags: ['Finance', 'Weekly'], t: T0 - DAYS(3), done: T0 - DAYS(2), by: 'Ryan' };
  const one = (await saveTask(TRYAN, f, s, T0, TMODS)).task;
  const two = (await saveTask(TRYAN, { ...f, status: 'Started' }, s, T0 + 1, TMODS)).task;
  assert.equal(one.id, two.id, 'bringing a task again made it twice');
  assert.equal((await readTasks(s)).length, 1);
  assert.deepEqual([one.t, one.done, one.by], [T0 - DAYS(3), T0 - DAYS(2), 'Ryan']);
  // Without EspoCRM's id nobody can backdate a task or put it in somebody else's name.
  const mine = (await saveTask(TCHELSEA, { name: 'Mine', t: T0 - DAYS(99), by: 'Ryan' }, s, T0 + 2, TMODS)).task;
  assert.deepEqual([mine.t, mine.by], [T0 + 2, 'Chelsea']);
  assert.match((await saveTask(TRYAN, { espo: 'not an id!', name: 'x' }, s, T0, TMODS)).error, /EspoCRM/);
  // Bringing it over again is nobody's change, so a task nobody here has changed can be refreshed.
  assert.equal(two.edited, null, 'an import counted as somebody changing the task');
  // Changed here, it is ours; deleted here, it stays deleted.
  await saveTask(TCHELSEA, { id: one.id, priority: 'High' }, s, T0 + 3, TMODS);
  assert.equal((await taskOne(TRYAN, one.id, s)).editedBy, 'Chelsea');
  assert.ok((await removeTask(TRYAN, one.id, s)).gone);
  assert.match((await saveTask(TRYAN, f, s, T0 + 4, TMODS)).error, /stays deleted/);
  assert.equal((await readTasks(s)).some((t) => t.espo === f.espo), false, 'a task deleted here came back');
});

test('a task brought from Notion again changes the one already brought, names nobody as its maker, and stays deleted', async () => {
  const s = memoryStore({ etagOnRead: true });
  const f = { notion: '3f8857154e5380e3932aece93bc66a2e', name: 'Start Selection Process', status: 'Completed', start: '2026-10-13', due: '2026-10-27',
    who: 'Chelsea', with: ['Norah'], tags: ['Grantmaking'], t: T0 - DAYS(8), by: null, done: null };
  const one = (await saveTask(TRYAN, f, s, T0, TMODS)).task;
  const two = (await saveTask(TRYAN, { ...f, status: 'Started' }, s, T0 + 1, TMODS)).task;
  assert.equal(one.id, two.id, 'bringing a task from Notion again made it twice');
  assert.equal((await readTasks(s)).length, 1);
  assert.deepEqual([one.t, one.by, one.done, one.notion, one.espo], [T0 - DAYS(8), null, null, f.notion, undefined], 'Notion does not say who made it or when it was finished, and the task said otherwise');
  assert.equal(two.edited, null, 'an import from Notion counted as somebody changing the task');
  assert.equal((await taskActivity(TRYAN, one.id, s)).length, 0, 'an import from Notion made activity');
  assert.match((await saveTask(TRYAN, { notion: 'not-a-page', name: 'x' }, s, T0, TMODS)).error, /Notion/);
  assert.match((await saveTask(TRYAN, { notion: f.notion, espo: 'abc123def456', name: 'x' }, s, T0, TMODS)).error, /not both/);
  // Without Notion's id, nobody's name cannot be taken off a task.
  const mine = (await saveTask(TCHELSEA, { name: 'Mine', by: null, done: null }, s, T0 + 2, TMODS)).task;
  assert.equal(mine.by, 'Chelsea');
  // A Notion id and an EspoCRM id never find each other's task.
  assert.notEqual((await saveTask(TRYAN, { espo: '3f8857154e5380e3', name: 'Other' }, s, T0 + 3, TMODS)).task.id, one.id);
  assert.ok((await removeTask(TRYAN, one.id, s)).gone);
  assert.match((await saveTask(TRYAN, f, s, T0 + 4, TMODS)).error, /stays deleted/);
  assert.equal((await readTasks(s)).some((t) => t.notion === f.notion), false, 'a task from Notion deleted here came back');
});

for (const etagOnRead of [true, false]) {
  test(`tasks, fifteen saved at once, ${etagOnRead ? 'with' : 'with no'} etag on reads: none told it was saved is missing`, async () => {
    const s = memoryStore({ etagOnRead });
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => saveTask(TCHELSEA, { name: `Task ${i}`, tags: [TASK_TAGS[0]] }, s, T0 + i, TMODS)));
    const ok = told.filter((r) => r.status === 'fulfilled' && r.value.task).map((r) => r.value.task.id);
    const kept = new Set((await readTasks(s)).map((t) => t.id));
    assert.deepEqual(ok.filter((id) => !kept.has(id)), [], 'a task told it was saved is missing');
    for (const r of told) if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
    if (etagOnRead) assert.equal(ok.length, 15);
  });
}

test('saved filters are each reader\'s own, hold a name and an address and nothing else, and go with them', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  for (const who of [TSAM, fw('Chelsea', 700)]) {
    assert.equal(await taskViews(who, s), null, `${who.handle} could read saved filters`);
    assert.match((await saveTaskView(who, { name: 'x', address: '#/' }, s)).error, /directors, board members and administrators/);
  }
  // Only an address tasks.js writes.
  for (const a of ['#/', '#/board', '#/timeline', '#/feed', '#/feed?who=all', '#/?who=all&group=whose', '#/timeline?span=28&from=2026-11-02&who=%40me', '#/?status=Started,Deferred&who=%40me&sort=due&dir=desc', '#/board?cols=who&tags=Networking%2FSocial'])
    assert.equal(taskAddress(a), a, `${a} was refused`);
  for (const a of ['', '#/t/kabc', '#/timelines', '#/recurring', 'https://example.com/#/', '#/?evil=1', '#/?q=a&q=b', '#/?q', '#/?q=%E0%A4%A', '#/board?q=<b>', '#/' + '?q=' + 'a'.repeat(1000), 42, null])
    assert.equal(taskAddress(a), null, `${a} was taken as an address`);
  let r = await saveTaskView(TCHELSEA, { name: ' Mine, overdue ', address: '#/?who=%40me&due=overdue' }, s);
  assert.deepEqual(r.views.map((v) => Object.keys(v).sort()), [['address', 'id', 'name']], 'a saved filter holds more than its id, name and address');
  const id = r.views[0].id;
  assert.equal(r.views[0].name, 'Mine, overdue');
  assert.match((await saveTaskView(TCHELSEA, { name: 'mine,  OVERDUE', address: '#/board' }, s)).error, /already have/);
  assert.match((await saveTaskView(TCHELSEA, { name: '', address: '#/board' }, s)).error, /Name it/);
  assert.match((await saveTaskView(TCHELSEA, { name: 'Bad', address: '#/?nope=1' }, s)).error, /not the address/);
  // In place of one already saved, keeping its id; and in name order.
  r = await saveTaskView(TCHELSEA, { id, name: 'Mine, overdue', address: '#/board?who=%40me&due=overdue' }, s);
  assert.deepEqual(r.views.map((v) => [v.id, v.address]), [[id, '#/board?who=%40me&due=overdue']]);
  r = await saveTaskView(TCHELSEA, { name: 'Aardvark', address: '#/' }, s);
  assert.deepEqual(r.views.map((v) => v.name), ['Aardvark', 'Mine, overdue']);
  // Nobody else sees them.
  assert.deepEqual(await taskViews(TRYAN, s), []);
  assert.match((await removeTaskView(TRYAN, id, s)).error, /already been deleted/);
  assert.match((await saveTaskView(TRYAN, { id, name: 'Took it', address: '#/' }, s)).error, /deleted/);
  assert.equal((await taskViews(TCHELSEA, s)).length, 2, 'somebody else changed a saved filter');
  // A cap, and deleting.
  for (let i = (await taskViews(TCHELSEA, s)).length; i < TASK_VIEWS_KEEP; i++) await saveTaskView(TCHELSEA, { name: `F${i}`, address: '#/' }, s);
  assert.match((await saveTaskView(TCHELSEA, { name: 'One more', address: '#/' }, s)).error, /up to/);
  assert.ok((await removeTaskView(TCHELSEA, id, s)).views.every((v) => v.id !== id));
  // Forget me, and deleting the username.
  await forgetTaskViews(petKey('Chelsea'), s);
  assert.deepEqual(await taskViews(TCHELSEA, s), [], 'Forget me left saved filters');
  await saveTaskView(TCHELSEA, { name: 'Again', address: '#/' }, s);
  await claimAccount('Chelsea', 'a long enough phrase', s, 9, null);
  assert.equal((await deleteAccount('Chelsea', s)).deleted, true);
  assert.deepEqual(await taskViews(TCHELSEA, s), [], 'a deleted username kept its saved filters');
}));

for (const etagOnRead of [true, false]) {
  test(`saved filters, fifteen at once, ${etagOnRead ? 'with' : 'with no'} etag on reads: none told it was saved is missing`, async () => {
    const s = memoryStore({ etagOnRead });
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => saveTaskView(TCHELSEA, { name: `View ${i}`, address: '#/board' }, s)));
    const kept = new Set((await taskViews(TCHELSEA, s)).map((v) => v.name));
    for (const [i, r] of told.entries()) if (r.status === 'fulfilled' && r.value.views) assert.ok(kept.has(`View ${i}`), `View ${i} was told it was saved and is missing`);
    for (const r of told) if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
    if (etagOnRead) assert.equal(kept.size, 15);
  });
}

test('a recurring task names its ISO week, keeps its day of the month, and counts days whatever the clocks do', () => {
  for (const [d, week, year] of [['2026-10-15', 42, 2026], ['2026-10-20', 43, 2026], ['2026-10-27', 44, 2026], ['2026-12-28', 53, 2026],
    ['2027-01-01', 53, 2026], ['2027-01-03', 53, 2026], ['2027-01-04', 1, 2027], ['2025-12-29', 1, 2026]]) {
    assert.deepEqual(isoWeek(d), { week, year }, d);
  }
  assert.equal(recurName('Week in Review for Week {week} of {year}', '2027-01-01'), 'Week in Review for Week 53 of 2026');
  assert.equal(recurName('{month} {year} payout', '2027-01-01'), 'January 2027 payout', 'a name with no week took the week’s year');
  assert.equal(recurName('Pay Employee Invoices', '2026-10-24'), 'Pay Employee Invoices');
  const monthly = { repeats: 'Monthly', day: 31 };
  assert.deepEqual([recurAfter(monthly, '2026-01-31'), recurAfter(monthly, '2026-02-28'), recurAfter(monthly, '2026-04-30'), recurAfter({ repeats: 'Monthly', day: 29 }, '2028-01-29')],
    ['2026-02-28', '2026-03-31', '2026-05-31', '2028-02-29'], 'a monthly task lost its day of the month');
  assert.equal(recurAfter({ repeats: 'Monthly', day: 25 }, '2026-12-25'), '2027-01-25');
  assert.equal(recurAfter({ repeats: 'Weekly' }, '2026-10-31'), '2026-11-07', 'a week across the clocks going back was not seven days');
  assert.equal(recurAfter({ repeats: 'Every 2 Weeks' }, '2026-10-27'), '2026-11-10');
});

// 01:00 and 23:00 in Colorado (MDT, UTC-6) on the days named.
const DENVER = (d, h) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10), h + 6);

test('a recurring task makes its task on its day in Colorado, once, and moves its day on', async () => {
  const s = memoryStore({ etagOnRead: true });
  for (const who of [TSAM, fw('Chelsea', 700)]) {
    assert.equal(await taskRecurs(who, s), null, `${who.handle} could read recurring tasks`);
    assert.match((await saveRecur(who, { name: 'x', next: '2026-10-27' }, s, T0, TMODS)).error, /directors, board members and administrators/);
  }
  const made = await saveRecur(TRYAN, { name: 'Weekly Operations Meeting for Week {week} of {year}', repeats: 'Weekly', next: '2026-10-27',
    dueAfter: 3, who: 'ryan', with: ['Chelsea'], tags: ['Operations', 'Weekly'], body: 'Add the agenda.' }, s, T0, TMODS);
  assert.ok(made.recur, made.error);
  const r = made.recur;
  assert.deepEqual([r.on, r.who, r.with, r.startAfter, r.dueAfter, r.by], [true, 'Ryan', ['Chelsea'], 0, 3, 'Ryan']);
  assert.deepEqual(r.coming.map((c) => [c.on, c.name, c.due]), [['2026-10-27', 'Weekly Operations Meeting for Week 44 of 2026', '2026-10-30'],
    ['2026-11-03', 'Weekly Operations Meeting for Week 45 of 2026', '2026-11-06'], ['2026-11-10', 'Weekly Operations Meeting for Week 46 of 2026', '2026-11-13']]);
  for (const [f, why] of [[{ repeats: 'Daily' }, /comes round/], [{ dueAfter: -1 }, /whole number/], [{ startAfter: 1.5 }, /whole number/],
    [{ startAfter: 5 }, /before it starts/], [{ next: '2026-10-01' }, /today or later/], [{ next: 'soon' }, /YYYY-MM-DD/], [{ who: 'Sam' }, /assigned/], [{ name: '' }, /name/]]) {
    assert.match((await saveRecur(TRYAN, { id: r.id, ...f }, s, T0 + 1, TMODS)).error, why);
  }
  // 23:00 the night before in Colorado is already the day in UTC, and nothing is made.
  assert.equal((await makeRecurring(s, DENVER('2026-10-26', 23))).made, 0, 'a task was made before its day in Colorado');
  assert.equal((await makeRecurring(s, DENVER('2026-10-27', 1))).made, 1);
  assert.equal((await makeRecurring(s, DENVER('2026-10-27', 2))).made, 0, 'a second run made the task again');
  const tasks = await readTasks(s);
  assert.equal(tasks.length, 1);
  const t = tasks[0];
  assert.deepEqual([t.name, t.status, t.start, t.due, t.who, t.with, t.tags, t.by, t.recur, t.on, t.body],
    ['Weekly Operations Meeting for Week 44 of 2026', TASK_STATUSES[0], '2026-10-27', '2026-10-30', 'Ryan', ['Chelsea'], ['Operations', 'Weekly'], null, r.id, '2026-10-27', 'Add the agenda.']);
  assert.equal((await readRecurs(s))[0].next, '2026-11-03');
  // A made task changed keeps where it came from.
  assert.equal((await saveTask(TCHELSEA, { id: t.id, status: 'Started' }, s, T0 + 9, TMODS)).task.recur, r.id);
  // Missed runs are made, each for its own day.
  assert.equal((await makeRecurring(s, DENVER('2026-11-17', 1))).made, 3);
  assert.deepEqual((await readTasks(s)).filter((x) => x.recur).map((x) => x.on).sort(), ['2026-10-27', '2026-11-03', '2026-11-10', '2026-11-17']);
  assert.equal((await readRecurs(s))[0].next, '2026-11-24');
  // Switched off makes nothing; switched on again starts from its next day still to come, without the ones missed.
  await saveRecur(TCHELSEA, { id: r.id, on: false }, s, DENVER('2026-11-18', 9), TMODS);
  assert.equal((await makeRecurring(s, DENVER('2026-12-02', 1))).made, 0, 'a switched-off recurring task made a task');
  const back = await saveRecur(TCHELSEA, { id: r.id, on: true }, s, DENVER('2026-12-02', 9), TMODS);
  assert.deepEqual([back.recur.on, back.recur.next, back.recur.editedBy], [true, '2026-12-08', 'Chelsea']);
  assert.equal((await makeRecurring(s, DENVER('2026-12-02', 10))).made, 0, 'switching on made the days it missed');
  // Deleting it makes no more and leaves what it made.
  assert.ok((await removeRecur(TRYAN, r.id, s)).gone);
  assert.equal((await makeRecurring(s, DENVER('2026-12-09', 1))).made, 0);
  assert.equal((await readTasks(s)).filter((x) => x.recur === r.id).length, 4, 'deleting a recurring task took its tasks');
  assert.match((await removeRecur(TRYAN, r.id, s)).error, /already/);
  assert.equal(await taskRecur(TRYAN, r.id, s), null);
});

test('a monthly recurring task starts and is due days after its day, and keeps its day of the month', async () => {
  const s = memoryStore({ etagOnRead: true });
  const r = (await saveRecur(TRYAN, { name: 'Chase Auto Pay On 23rd', repeats: 'Monthly', next: '2026-11-10', startAfter: 10, dueAfter: 13, who: 'Chelsea' }, s, T0, TMODS)).recur;
  assert.equal((await makeRecurring(s, DENVER('2026-11-10', 1))).made, 1);
  const t = (await readTasks(s))[0];
  assert.deepEqual([t.start, t.due], ['2026-11-20', '2026-11-23']);
  assert.equal((await readRecurs(s))[0].next, '2026-12-10');
  assert.equal(r.coming[2].on, '2027-01-10');
});

test('a recurring task brought from EspoCRM arrives switched off, comes again rather than twice, and stays deleted', async () => {
  const s = memoryStore({ etagOnRead: true });
  const f = { espo: '6ac0762551485e8a3', name: 'Submit Weekly Invoice', repeats: 'Weekly', next: '2026-10-23', who: 'Norah', with: ['Chelsea', 'Norah'], tags: ['Finance'], t: T0 - DAYS(17), by: 'Ryan' };
  const one = (await saveRecur(TRYAN, f, s, T0, TMODS)).recur;
  assert.deepEqual([one.on, one.espo, one.t, one.by, one.edited], [false, f.espo, T0 - DAYS(17), 'Ryan', null]);
  assert.equal((await makeRecurring(s, DENVER('2026-10-23', 1))).made, 0, 'a recurring task brought over made a task beside EspoCRM’s');
  const two = (await saveRecur(TRYAN, { ...f, next: '2026-10-30' }, s, T0 + 1, TMODS)).recur;
  assert.deepEqual([two.id, two.next, (await readRecurs(s)).length], [one.id, '2026-10-30', 1]);
  assert.match((await saveRecur(TRYAN, { espo: 'not an id!', name: 'x', next: '2026-10-30' }, s, T0, TMODS)).error, /EspoCRM/);
  assert.ok((await removeRecur(TRYAN, one.id, s)).gone);
  assert.match((await saveRecur(TRYAN, f, s, T0 + 2, TMODS)).error, /stays deleted/);
});

for (const etagOnRead of [true, false]) {
  test(`recurring tasks, fifteen runs at once, ${etagOnRead ? 'with' : 'with no'} etag on reads: each day's task made once`, async () => {
    const s = memoryStore({ etagOnRead });
    await saveRecur(TRYAN, { name: 'Week in Review for Week {week} of {year}', next: '2026-10-23', dueAfter: 3, who: 'Ryan' }, s, T0, TMODS);
    await saveRecur(TRYAN, { name: 'Pay Employee Invoices', next: '2026-10-24', who: 'Chelsea' }, s, T0, TMODS);
    const told = await Promise.allSettled(Array.from({ length: 15 }, () => makeRecurring(s, DENVER('2026-10-24', 1))));
    for (const r of told) if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
    if (etagOnRead) assert.ok(told.every((r) => r.status === 'fulfilled'));
    await makeRecurring(s, DENVER('2026-10-24', 2));
    const tasks = await readTasks(s);
    assert.deepEqual(tasks.map((t) => t.recur + ' ' + t.on).sort(), [...new Set(tasks.map((t) => t.recur + ' ' + t.on))].sort(), 'a day’s task was made twice');
    assert.equal(tasks.length, 2);
    assert.deepEqual((await readRecurs(s)).map((r) => r.next).sort(), ['2026-10-30', '2026-10-31']);
  });
}

test('a box in a task’s description ticks in place, one line, and only the box the page saw', async () => {
  const s = memoryStore({ etagOnRead: true });
  const body = 'Paid:\n\n- [ ] Chelsea **Adams**\n- [x] Norah\n  - [ ] nested\n> - [ ] quoted\n\n```\n- [ ] in code\n```\n1. [ ] numbered';
  const t = (await saveTask(TRYAN, { name: 'Pay Employee Invoices', body }, s, T0, TMODS)).task;
  assert.equal(t.ticks, true);
  assert.deepEqual(t.blocks.find((b) => b.box).box.map((b) => b && [b.n, b.on, b.raw]), [[0, false, 'Chelsea **Adams**'], [1, true, 'Norah']]);
  assert.match((await tickTask(TSAM, t.id, 0, 'Chelsea **Adams**', true, s, T0 + 1)).error, /directors, board members and administrators/);
  let r = await tickTask(TCHELSEA, t.id, 0, 'Chelsea **Adams**', true, s, T0 + 2);
  assert.ok(r.task, r.error);
  assert.equal(r.task.body, body.replace('- [ ] Chelsea', '- [x] Chelsea'), 'a tick changed more than its own box');
  assert.deepEqual([r.task.edited, r.task.editedBy], [T0 + 2, 'Chelsea']);
  r = await tickTask(TRYAN, t.id, 1, 'Norah', false, s, T0 + 3);
  assert.equal(r.task.body.split('\n')[3], '- [ ] Norah');
  for (const [n, text] of [[3, 'quoted'], [4, 'numbered'], [2, 'nested']]) assert.ok((await tickTask(TRYAN, t.id, n, text, true, s, T0 + 4)).task);
  const now = (await readTasks(s))[0].body;
  assert.ok(now.includes('> - [x] quoted') && now.includes('1. [x] numbered') && now.includes('  - [x] nested') && now.includes('- [ ] in code'), 'a box in a code block was counted, or one was missed');
  // Ticking what is already ticked changes nothing and says nobody changed it.
  const before = (await readTasks(s))[0];
  assert.equal((await tickTask(TCHELSEA, t.id, 4, 'numbered', true, s, T0 + 5)).task.edited, before.edited);
  // The wrong words, or a box that is not there, change nothing.
  for (const [n, text] of [[0, 'Norah'], [9, 'nothing'], [-1, 'x'], [1.5, 'Norah']]) assert.ok((await tickTask(TRYAN, t.id, n, text, true, s, T0 + 6)).error);
  assert.equal((await readTasks(s))[0].body, before.body);
  assert.match((await tickTask(TRYAN, 'knotatask000', 0, 'x', true, s)).error, /deleted/);
});

test('a description whose boxes the reader and the lines disagree on is drawn, and not ticked', async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.equal(taskBoxes('    - [ ] indented past a list').agree, false);
  const t = (await saveTask(TRYAN, { name: 'Odd', body: '    - [ ] indented past a list' }, s, T0, TMODS)).task;
  assert.equal(t.ticks, false);
  assert.match((await tickTask(TRYAN, t.id, 0, 'indented past a list', true, s, T0 + 1)).error, /changed/);
  assert.equal((await readTasks(s))[0].body, '    - [ ] indented past a list');
  // Anywhere else the reader draws no boxes at all.
  assert.deepEqual(parseBrass('- [ ] a')[0].items[0][0].c, [{ t: 'text', v: '[ ] a' }]);
});

for (const etagOnRead of [true, false]) {
  test(`fifteen boxes ticked at once, ${etagOnRead ? 'with' : 'with no'} etag on reads: every tick told it worked is kept`, async () => {
    const s = memoryStore({ etagOnRead });
    const body = Array.from({ length: 15 }, (_, i) => `- [ ] Box ${i}`).join('\n');
    const t = (await saveTask(TRYAN, { name: 'Many', body }, s, T0, TMODS)).task;
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => tickTask(TCHELSEA, t.id, i, `Box ${i}`, true, s, T0 + i)));
    const lines = (await readTasks(s))[0].body.split('\n');
    told.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value.task) assert.equal(lines[i], `- [x] Box ${i}`, `box ${i} was told it was ticked and is not`);
      else if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
    });
    if (etagOnRead) assert.ok(lines.every((l) => l.startsWith('- [x]')));
  });
}

// A throwaway key for the office's tests, made fresh each run.
const OFFICE_TEST_KEY = rnd(32).toString('base64url');
async function withOfficeKey(key, fn) {
  const was = process.env.CB_OFFICE_KEY;
  if (key == null) delete process.env.CB_OFFICE_KEY; else process.env.CB_OFFICE_KEY = key;
  try { return await fn(); } finally { if (was == null) delete process.env.CB_OFFICE_KEY; else process.env.CB_OFFICE_KEY = was; }
}

/* A sealed blob holds only its sealed fields, and none of the words in its
   ciphertext. Only words of four or more bytes are looked for: a shorter one can
   turn up by chance in random bytes, and the first draft of these tests failed
   now and then on "Bo" found in the base64. */
function assertSealed(blob, words) {
  assert.deepEqual(Object.keys(blob).sort(), ['data', 'iv', 'sealed', 'tag']);
  const bytes = Buffer.from(blob.data, 'base64url');
  for (const w of words) {
    assert.ok(Buffer.byteLength(w) >= 4, `${w} is too short to look for`);
    assert.ok(!bytes.includes(Buffer.from(w)) && !JSON.stringify(blob).includes(w), `the store holds ${w} in the clear`);
  }
}

test('the office seals what it keeps, and without its key it is shut, never open in the clear', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  assert.equal(officeReady(), true);
  const box = seal({ hello: 'Lovelace', n: 1 });
  assert.deepEqual(Object.keys(box).sort(), ['data', 'iv', 'sealed', 'tag']);
  assertSealed(box, ['Lovelace']);
  assert.deepEqual(unseal(box), { hello: 'Lovelace', n: 1 });
  assert.notEqual(seal({ a: 1 }).iv, seal({ a: 1 }).iv, 'two seals shared a nonce');
  const bent = { ...box, data: box.data.slice(0, -2) + (box.data.endsWith('A') ? 'BB' : 'AA') };
  assert.throws(() => unseal(bent), 'a tampered record opened');
  assert.throws(() => unseal({ contacts: [] }), 'an unsealed blob was read as if sealed');
  await withOfficeKey(rnd(32).toString('base64url'), async () => assert.throws(() => unseal(box), 'another key opened a record'));
  await withOfficeKey(null, async () => {
    assert.equal(officeReady(), false);
    assert.throws(() => seal({ a: 1 }), /shut/);
  });
  await withOfficeKey('too-short', async () => assert.equal(officeReady(), false));
}));

test('contacts are for directors, board members and administrators, sealed in the store, and a change touches only what it names', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  for (const who of [TSAM, fw('Chelsea', 700)]) {
    assert.equal(officeAllow(who), false);
    assert.equal(await officeContacts(who, s), null);
    assert.match((await saveContact(who, { first: 'Sneak' }, s, T0)).error, /directors, board members and administrators/);
  }
  const made = await saveContact(TCHELSEA, { first: ' Ada ', last: 'Lovelace', email: 'ada@example.org', phone: '+1 (555) 010-2030', notes: 'Met at **camp**.' }, s, T0);
  assert.ok(made.contact, made.error);
  const c = made.contact;
  assert.deepEqual([c.name, c.email, c.phone, c.noEmail, c.by, c.t], ['Ada Lovelace', 'ada@example.org', '+1 (555) 010-2030', false, 'Chelsea', T0]);
  // The store holds no word of it in the clear.
  assertSealed(await s.get('office-contacts', { type: 'json' }), ['Lovelace', 'ada@example.org', '010-2030', 'camp']);
  for (const [f, why] of [[{ email: 'not an email' }, /email/], [{ phone: 'call me maybe' }, /phone/], [{ first: '', last: '' }, /name/], [{ first: 'x'.repeat(81) }, /up to/]]) {
    assert.match((await saveContact(TRYAN, { id: c.id, ...f }, s, T0 + 1)).error, why);
  }
  assert.match((await saveContact(TRYAN, { first: 'Another', email: 'ADA@example.org' }, s, T0 + 2)).error, /Ada Lovelace is already a contact/);
  await Promise.all([saveContact(TRYAN, { id: c.id, noEmail: true }, s, T0 + 3), saveContact(TCHELSEA, { id: c.id, phone: '' }, s, T0 + 3)]);
  const both = await officeContact(TRYAN, c.id, s);
  assert.deepEqual([both.noEmail, both.phone, both.first, both.notes], [true, '', 'Ada', 'Met at **camp**.'], 'two changes at once lost one');
  assert.ok(both.edited && both.editedBy);
  assert.equal((await officeContacts(TRYAN, s))[0].words, 'Met at **camp**.'.length);
  assert.ok((await removeContact(TRYAN, c.id, s)).gone);
  assert.match((await removeContact(TRYAN, c.id, s)).error, /already/);
  assert.equal(await officeContact(TRYAN, c.id, s), null);
}));

test('a contact brought from EspoCRM comes again rather than twice, and stays deleted', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const f = { espo: '6ac7f4da71b684145', first: 'Bo', last: 'Peep', email: 'bo@example.org', t: T0 - DAYS(30), by: 'stimpunks.org form' };
  const one = (await saveContact(TRYAN, f, s, T0)).contact;
  assert.deepEqual([one.t, one.by, one.edited, one.espo], [T0 - DAYS(30), 'stimpunks.org form', null, f.espo]);
  const two = (await saveContact(TRYAN, { ...f, phone: '555 0100' }, s, T0 + 1)).contact;
  assert.deepEqual([two.id, two.phone, (await readContacts(s)).length], [one.id, '555 0100', 1]);
  assert.match((await saveContact(TRYAN, { espo: 'not an id!', first: 'x' }, s, T0)).error, /EspoCRM/);
  assert.ok((await removeContact(TRYAN, one.id, s)).gone);
  assert.match((await saveContact(TRYAN, f, s, T0 + 2)).error, /stays deleted/);
  assert.equal((await readContacts(s)).length, 0);
}));

for (const etagOnRead of [true, false]) {
  test(`contacts, fifteen saved at once, ${etagOnRead ? 'with' : 'with no'} etag on reads: none told it was saved is missing`, () => withOfficeKey(OFFICE_TEST_KEY, async () => {
    const s = memoryStore({ etagOnRead });
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => saveContact(TCHELSEA, { first: `Person ${i}`, email: `p${i}@example.org` }, s, T0 + i)));
    const ok = told.filter((r) => r.status === 'fulfilled' && r.value.contact).map((r) => r.value.contact.id);
    const kept = new Set((await readContacts(s)).map((c) => c.id));
    assert.deepEqual(ok.filter((id) => !kept.has(id)), [], 'a contact told it was saved is missing');
    for (const r of told) if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
    if (etagOnRead) assert.equal(ok.length, 15);
  }));
}

test('EspoCRM contacts arrive many to a write, and one changed or deleted here is left as it is', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const row = (i, extra = {}) => ({ espo: `68dd0000000000${String(i).padStart(3, '0')}`, last: `Person${i}`, email: `p${i}@example.org`, t: T0 - DAYS(5), by: 'Ryan', ...extra });
  assert.match((await importContacts(TSAM, [row(1)], s, T0)).error, /directors, board members and administrators/);
  assert.match((await importContacts(TRYAN, [], s, T0)).error, /Between one/);
  assert.match((await importContacts(TRYAN, Array.from({ length: 201 }, (_, i) => row(i)), s, T0)).error, /Between one/);
  assert.match((await importContacts(TRYAN, [{ ...row(1), id: 'cAAAAAAAAAAAA' }], s, T0)).error, /EspoCRM id and nothing of ours/);
  const first = await importContacts(TRYAN, [row(1), row(2), row(3), row(4, { email: 'not an email' })], s, T0);
  assert.deepEqual(first.told.map((t) => [t.made, !!t.error]), [[true, false], [true, false], [true, false], [undefined, true]]);
  assert.equal((await readContacts(s)).length, 3);
  const [one, two] = first.told;
  await saveContact(TCHELSEA, { id: one.id, phone: '555 0101' }, s, T0 + 1);
  await removeContact(TRYAN, two.id, s);
  const again = await importContacts(TRYAN, [row(1, { last: 'Renamed' }), row(2), row(3, { phone: '555 0303' }), row(5)], s, T0 + 2);
  assert.deepEqual(again.told.map((t) => t.kept || (t.made ? 'made' : 'refreshed')), ['changed here', 'deleted here', 'refreshed', 'made']);
  const now = await readContacts(s);
  assert.deepEqual(now.map((c) => c.last).sort(), ['Person1', 'Person3', 'Person5']);
  assert.equal(now.find((c) => c.last === 'Person1').phone, '555 0101', 'an import overwrote a change made here');
  assert.equal(now.find((c) => c.last === 'Person3').phone, '555 0303');
  const quiet = await importContacts(TRYAN, [row(1)], s, T0 + 3);
  assert.equal(quiet.told[0].kept, 'changed here');
}));

test('a grant request moves through its pipeline, its status follows the stage, and the day it was decided follows the status', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const ada = (await saveContact(TCHELSEA, { first: 'Ada', last: 'Lovelace', email: 'ada@example.org' }, s, T0)).contact;
  for (const who of [TSAM, fw('Chelsea', 700)]) {
    assert.equal(await officeGrants(who, s), null);
    assert.match((await saveGrant(who, { name: 'Sneak' }, s, T0)).error, /directors, board members and administrators/);
  }
  assert.match((await saveGrant(TRYAN, { pipeline: 'Mutual Aid' }, s, T0)).error, /name/);
  const g = (await saveGrant(TRYAN, { name: 'Mutual Aid Grant Request 1: Ada', contactEmail: 'ADA@example.org', amount: 500, submitted: '2026-10-01', body: 'Rent, **please**.' }, s, T0)).grant;
  assert.deepEqual([g.pipeline, g.stage, g.status, g.closed, g.contact, g.contactName, g.amount], ['Mutual Aid', 'Received', 'Open', null, ada.id, 'Ada Lovelace', 500]);
  assertSealed(await s.get('office-grants', { type: 'json' }), ['Mutual Aid Grant Request', 'Rent, **please**', 'Mutual']);
  for (const [f, why] of [[{ stage: 'Nope' }, /no stage called Nope/], [{ pipeline: 'Nope' }, /no pipeline/], [{ amount: 12.5 }, /whole dollars/],
    [{ amount: -1 }, /whole dollars/], [{ submitted: '1 Oct' }, /YYYY-MM-DD/], [{ contactEmail: 'nobody@example.org' }, /Add them as a contact first/], [{ form: 'x' }, /form entry/]]) {
    assert.match((await saveGrant(TRYAN, { id: g.id, ...f }, s, T0 + 1)).error, why);
  }
  const granted = (await saveGrant(TRYAN, { id: g.id, stage: 'Granted' }, s, Date.UTC(2026, 9, 21, 18))).grant;
  assert.deepEqual([granted.status, granted.closed, granted.editedBy], ['Granted', '2026-10-21', 'Ryan']);
  const back = (await saveGrant(TRYAN, { id: g.id, stage: 'Holding' }, s, T0 + 3)).grant;
  assert.deepEqual([back.status, back.closed], ['Open', null]);
  const moved = (await saveGrant(TRYAN, { id: g.id, pipeline: 'Creator Grants' }, s, T0 + 4)).grant;
  assert.deepEqual([moved.pipeline, moved.stage], ['Creator Grants', OFFICE_PIPELINES[1].stages[0].name], 'a move to another pipeline starts at its first stage');
  const denied = (await saveGrant(TRYAN, { id: g.id, stage: 'Denied', closed: '2026-09-30' }, s, T0 + 5)).grant;
  assert.deepEqual([denied.status, denied.closed], ['Denied', '2026-09-30']);
  // Two changes at once both stay.
  await Promise.all([saveGrant(TRYAN, { id: g.id, amount: 3000 }, s, T0 + 6), saveGrant(TCHELSEA, { id: g.id, form: 4242 }, s, T0 + 6)]);
  const both = await officeGrant(TRYAN, g.id, s);
  assert.deepEqual([both.amount, both.form, both.body], [3000, 4242, 'Rent, **please**.']);
  assert.equal((await officeContact(TRYAN, ada.id, s)).grants[0].id, g.id, 'a contact lists their grant requests');
  await removeContact(TRYAN, ada.id, s);
  const orphan = await officeGrant(TRYAN, g.id, s);
  assert.deepEqual([orphan.contactGone, orphan.contactName], [true, null]);
  assert.ok((await removeGrant(TRYAN, g.id, s)).gone);
  assert.match((await removeGrant(TRYAN, g.id, s)).error, /already/);
}));

test('EspoCRM grant requests arrive with their contacts found by EspoCRM id, and one changed or deleted here is left as it is', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  await importContacts(TRYAN, [{ espo: '68dd00000000000c1', last: 'One', email: 'one@example.org' }], s, T0);
  const row = (i, extra = {}) => ({ espo: `68dd0000000000g${String(i).padStart(2, '0')}`, name: `Grant ${i}`, pipeline: 'Mutual Aid', stage: 'Denied', closed: '2025-01-02',
    amount: 500, submitted: '2025-01-01', contactEspo: '68dd00000000000c1', form: 100 + i, body: `Form Link: https://stimpunks.org/?entry=${i}`, t: T0 - DAYS(9), by: 'Ryan', ...extra });
  assert.match((await importGrants(TRYAN, [{ ...row(1), contact: 'cAAAAAAAAAAAA' }], s, T0)).error, /nothing of ours/);
  const first = await importGrants(TRYAN, [row(1), row(2), row(3, { contactEspo: '68dd0000000000nope' }), row(4, { stage: 'Nope' })], s, T0);
  assert.deepEqual(first.told.map((t) => t.error ? 'refused' : 'made'), ['made', 'made', 'refused', 'refused']);
  const [one, two] = first.told;
  const g1 = await officeGrant(TRYAN, one.id, s);
  assert.deepEqual([g1.status, g1.closed, g1.contactName, g1.t, g1.by, g1.edited], ['Denied', '2025-01-02', 'One', T0 - DAYS(9), 'Ryan', null]);
  await saveGrant(TCHELSEA, { id: one.id, amount: 600 }, s, T0 + 1);
  await removeGrant(TRYAN, two.id, s);
  const again = await importGrants(TRYAN, [row(1, { amount: 1 }), row(2), row(5)], s, T0 + 2);
  assert.deepEqual(again.told.map((t) => t.kept || (t.made ? 'made' : 'refreshed')), ['changed here', 'deleted here', 'made']);
  assert.equal((await officeGrant(TRYAN, one.id, s)).amount, 600, 'an import overwrote a change made here');
  assert.equal((await readGrants(s)).length, 2);
}));

for (const etagOnRead of [true, false]) {
  test(`grant requests, fifteen saved at once, ${etagOnRead ? 'with' : 'with no'} etag on reads: none told it was saved is missing`, () => withOfficeKey(OFFICE_TEST_KEY, async () => {
    const s = memoryStore({ etagOnRead });
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => saveGrant(TCHELSEA, { name: `Request ${i}` }, s, T0 + i)));
    const ok = told.filter((r) => r.status === 'fulfilled' && r.value.grant).map((r) => r.value.grant.id);
    const kept = new Set((await readGrants(s)).map((g) => g.id));
    assert.deepEqual(ok.filter((id) => !kept.has(id)), [], 'a grant request told it was saved is missing');
    for (const r of told) if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
    if (etagOnRead) assert.equal(ok.length, 15);
  }));
}

test('a case takes the next number, closing it here sets the day it closed, and its contact lists it', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const bo = (await saveContact(TCHELSEA, { first: 'Bo', last: 'Peep', email: 'bo@example.org' }, s, T0)).contact;
  for (const who of [TSAM, fw('Chelsea', 700)]) {
    assert.equal(await officeCases(who, s), null);
    assert.match((await saveCase(who, { name: 'Sneak' }, s, T0)).error, /directors, board members and administrators/);
  }
  const one = (await saveCase(TRYAN, { name: 'Connection Request: Bo', contactEmail: 'bo@example.org', body: 'Wants to **join**.' }, s, T0)).case;
  assert.deepEqual([one.number, one.type, one.status, one.open, one.priority, one.closed, one.contactName], [1, 'Connection Request', 'New', true, 'Normal', null, 'Bo Peep']);
  assertSealed(await s.get('office-cases', { type: 'json' }), ['Connection Request: Bo', 'join', 'Connection']);
  const two = (await saveCase(TRYAN, { name: 'Volunteer', type: 'Volunteer Application' }, s, T0 + 1)).case;
  assert.equal(two.number, 2);
  for (const [f, why] of [[{ type: 'Nope' }, /Connection Request or a Volunteer Application/], [{ status: 'Nope' }, /no status/], [{ priority: 'Nope' }, /no priority/],
    [{ number: 9 }, /next number by itself/], [{ closed: 'soon' }, /YYYY-MM-DD/], [{ contactEmail: 'nobody@example.org' }, /contact first/]]) {
    assert.match((await saveCase(TRYAN, { id: one.id, ...f }, s, T0 + 2)).error, why);
  }
  const closed = (await saveCase(TRYAN, { id: one.id, status: 'Closed' }, s, Date.UTC(2026, 9, 21, 18))).case;
  assert.deepEqual([closed.open, closed.closed, closed.editedBy], [false, '2026-10-21', 'Ryan']);
  const spam = (await saveCase(TRYAN, { id: one.id, status: 'Spam' }, s, Date.UTC(2026, 9, 22, 18))).case;
  assert.equal(spam.closed, '2026-10-21', 'a closed case kept the day it closed when it moved to another closing status');
  const reopened = (await saveCase(TRYAN, { id: one.id, status: 'Replied' }, s, T0 + 3)).case;
  assert.deepEqual([reopened.open, reopened.closed], [true, null]);
  await Promise.all([saveCase(TRYAN, { id: one.id, priority: 'High' }, s, T0 + 4), saveCase(TCHELSEA, { id: one.id, form: 77 }, s, T0 + 4)]);
  const both = await officeCase(TRYAN, one.id, s);
  assert.deepEqual([both.priority, both.form, both.body], ['High', 77, 'Wants to **join**.']);
  assert.equal((await officeContact(TRYAN, bo.id, s)).cases[0].id, one.id, 'a contact lists their cases');
  assert.ok((await removeCase(TRYAN, one.id, s)).gone);
  assert.match((await removeCase(TRYAN, one.id, s)).error, /already/);
  assert.equal((await saveCase(TRYAN, { name: 'Three' }, s, T0 + 5)).case.number, 3, 'a number is never used twice, even after a delete of the highest but one');
  const four = (await saveCase(TRYAN, { name: 'Four' }, s, T0 + 6)).case;
  await removeCase(TRYAN, four.id, s);
  assert.equal((await saveCase(TRYAN, { name: 'Five' }, s, T0 + 7)).case.number, 5, 'the newest case deleted gave its number away again');
}));

test('EspoCRM cases keep their numbers and their days as they were, and one changed or deleted here is left as it is', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  await importContacts(TRYAN, [{ espo: '68dd00000000000c1', last: 'One', email: 'one@example.org' }], s, T0);
  const row = (i, extra = {}) => ({ espo: `68dd0000000000k${String(i).padStart(2, '0')}`, number: i, name: `Case ${i}`, type: 'Connection Request',
    status: 'Closed', closed: null, priority: 'Normal', submitted: '2025-01-01', contactEspo: '68dd00000000000c1', form: 200 + i, body: '', t: T0 - DAYS(9), by: 'Ryan', ...extra });
  const first = await importCases(TRYAN, [row(5), row(9, { closed: '2025-02-02' }), row(12, { number: 5 }), row(13, { type: 'Nope' })], s, T0);
  assert.deepEqual(first.told.map((t) => t.error ? 'refused' : 'made'), ['made', 'made', 'refused', 'refused']);
  const k5 = await officeCase(TRYAN, first.told[0].id, s);
  assert.deepEqual([k5.number, k5.closed, k5.open, k5.contactName, k5.edited], [5, null, false, 'One', null], 'an import set a day EspoCRM did not have');
  assert.equal((await saveCase(TRYAN, { name: 'Next' }, s, T0 + 1)).case.number, 10, 'a new case takes the number after the highest brought over');
  await saveCase(TCHELSEA, { id: first.told[0].id, priority: 'High' }, s, T0 + 2);
  await removeCase(TRYAN, first.told[1].id, s);
  const again = await importCases(TRYAN, [row(5, { priority: 'Low' }), row(9), row(14)], s, T0 + 3);
  assert.deepEqual(again.told.map((t) => t.kept || (t.made ? 'made' : 'refreshed')), ['changed here', 'deleted here', 'made']);
  assert.equal((await officeCase(TRYAN, first.told[0].id, s)).priority, 'High');
}));

for (const etagOnRead of [true, false]) {
  test(`cases, fifteen saved at once, ${etagOnRead ? 'with' : 'with no'} etag on reads: none told it was saved is missing, and no number twice`, () => withOfficeKey(OFFICE_TEST_KEY, async () => {
    const s = memoryStore({ etagOnRead });
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => saveCase(TCHELSEA, { name: `Case ${i}` }, s, T0 + i)));
    const ok = told.filter((r) => r.status === 'fulfilled' && r.value.case).map((r) => r.value.case.id);
    const kept = await readCases(s);
    assert.deepEqual(ok.filter((id) => !kept.some((k) => k.id === id)), [], 'a case told it was saved is missing');
    assert.equal(new Set(kept.map((k) => k.number)).size, kept.length, 'two cases share a number');
    for (const r of told) if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
    if (etagOnRead) assert.equal(ok.length, 15);
  }));
}

const INTAKE_TEST_KEY = rnd(24).toString('hex');
async function withIntakeKey(key, fn) {
  const was = process.env.CB_OFFICE_INTAKE_KEY;
  if (key == null) delete process.env.CB_OFFICE_INTAKE_KEY; else process.env.CB_OFFICE_INTAKE_KEY = key;
  try { return await fn(); } finally { if (was == null) delete process.env.CB_OFFICE_INTAKE_KEY; else process.env.CB_OFFICE_INTAKE_KEY = was; }
}
const signIntake = (raw, t = Math.floor(T0 / 1000), key = INTAKE_TEST_KEY) => `t=${t},v1=${createHmac('sha256', key).update(`${t}.${raw}`, 'utf8').digest('hex')}`;

test('the intake reads only what is signed with its key, recently, and is shut without the key', () => withOfficeKey(OFFICE_TEST_KEY, () => withIntakeKey(INTAKE_TEST_KEY, async () => {
  const raw = JSON.stringify({ type: 'connection', email: 'x@example.org' });
  assert.equal(intakeReady(), true);
  assert.equal(intakeSigned(signIntake(raw), raw, T0), true);
  assert.equal(intakeSigned(signIntake(raw), raw + ' ', T0), false, 'a changed body passed');
  assert.equal(intakeSigned(signIntake(raw, Math.floor(T0 / 1000) - 301), raw, T0), false, 'an old signature passed');
  assert.equal(intakeSigned(signIntake(raw, undefined, 'another-key-another-key-another-key'), raw, T0), false, 'another key passed');
  assert.equal(intakeSigned('', raw, T0), false);
  assert.equal(intakeSigned(`t=${Math.floor(T0 / 1000)},v1=nothex`, raw, T0), false);
  await withIntakeKey('short', async () => { assert.equal(intakeReady(), false); assert.equal(intakeSigned(signIntake(raw, undefined, 'short'), raw, T0), false); });
  await withIntakeKey(null, async () => assert.equal(intakeReady(), false));
  await withOfficeKey(null, async () => assert.equal(intakeReady(), false));
})));

test('a form entry finds or adds its contact by email, makes its record once, and keeps what it cannot place', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const jane = { type: 'mutual_aid', entry: 101, submitted: '2026-10-01', email: 'Jane@Example.com', first: 'Jane', last: 'Doe', name: 'Jane Q Doe', phone: '(555) 555-0100',
    message: '**What do you need?**\nRent help.\n\nForm entry: https://stimpunks.org/wp-admin/admin.php?page=wpforms-entries&view=details&entry_id=101' };
  assert.deepEqual(await officeIntake(jane, s, T0), { ok: true, record: 'grant', made: true, task: false });
  const [c] = await readContacts(s);
  assert.deepEqual([c.first, c.last, c.email, c.phone, c.by], ['Jane', 'Doe', 'jane@example.com', '(555) 555-0100', INTAKE_BY]);
  const [g] = await readGrants(s);
  assert.deepEqual([g.name, g.pipeline, g.stage, g.amount, g.submitted, g.form, g.contact, g.by], ['Aid Request 101: Jane Q Doe', 'Mutual Aid', 'Received', 500, '2026-10-01', 101, c.id, INTAKE_BY]);
  assert.match(g.body, /Rent help\./);
  assert.deepEqual(await officeIntake(jane, s, T0 + 1), { ok: true, record: 'grant', made: false, task: false }, 'a resend made a second record');
  assert.equal((await readGrants(s)).length, 1);
  // The same person again, on another form: name kept, the newest phone taken.
  assert.deepEqual(await officeIntake({ type: 'connection', entry: 102, email: 'JANE@example.com', first: 'Janie', last: 'Doe', phone: '555-0199', message: 'Hello' }, s, T0 + 2),
    { ok: true, record: 'case', made: true, task: false });
  const contacts = await readContacts(s);
  assert.deepEqual([contacts.length, contacts[0].first, contacts[0].phone, contacts[0].editedBy], [1, 'Jane', '555-0199', INTAKE_BY]);
  const [k] = await readCases(s);
  assert.deepEqual([k.name, k.type, k.status, k.number, k.form, k.contact], ['Connection Request 102: Janie Doe', 'Connection Request', 'New', 1, 102, contacts[0].id]);
  // A phone the office cannot read goes in the description; an email-only person is named by their email.
  await officeIntake({ type: 'creator_grant', entry: 103, email: 'mary@example.com', name: 'Mary Ann Smith', first: 'Mary Ann', last: 'Smith', phone: 'call me on Tuesdays' }, s, T0 + 3);
  const mary = (await readContacts(s)).find((x) => x.email === 'mary@example.com');
  const g3 = (await readGrants(s)).find((x) => x.form === 103);
  assert.deepEqual([mary.phone, g3.amount, g3.pipeline], ['', 3000, 'Creator Grants']);
  assert.match(g3.body, /\*\*Phone\*\*\ncall me on Tuesdays/);
  await officeIntake({ type: 'volunteer', entry: 104, email: 'solo@example.com' }, s, T0 + 4);
  const solo = (await readContacts(s)).find((x) => x.email === 'solo@example.com');
  assert.deepEqual([solo.first, solo.last], ['', 'solo@example.com']);
  assert.equal((await readCases(s)).find((x) => x.form === 104).name, 'Volunteer Application 104: solo@example.com');
  // No email at all: no contact, and nothing lost.
  await officeIntake({ type: 'connection', entry: 105, name: 'No Mail', email: 'not an email', phone: '555-0123' }, s, T0 + 5);
  const k5 = (await readCases(s)).find((x) => x.form === 105);
  assert.deepEqual([k5.contact, /\*\*Email\*\*\nnot an email/.test(k5.body), /\*\*Phone\*\*\n555-0123/.test(k5.body)], [null, true, true]);
  // An entry brought over from EspoCRM is found by its form entry and not made again.
  await importGrants(TRYAN, [{ espo: '68dd0000000000g77', name: 'Old', pipeline: 'Mutual Aid', stage: 'Denied', closed: '2025-01-01', form: 777, body: '' }], s, T0 + 6);
  assert.deepEqual(await officeIntake({ type: 'mutual_aid', entry: 777, email: 'jane@example.com' }, s, T0 + 7), { ok: true, record: 'grant', made: false, task: false });
  // A very long answer is cut short and says so.
  await officeIntake({ type: 'connection', entry: 106, email: 'long@example.com', message: 'x'.repeat(50000) }, s, T0 + 8);
  assert.match((await readCases(s)).find((x) => x.form === 106).body, /Cut short here/);
  for (const bad of [{ type: 'nope' }, { type: '__proto__' }, { type: 'connection', entry: 'abc' }, null]) assert.ok((await officeIntake(bad, s, T0)).error);
  await withOfficeKey(null, async () => assert.equal((await officeIntake(jane, s, T0)).status, 503));
}));

test('templates: Tasks starts with the seeded ones, a save makes the blob the list, fill-ins are checked, and only task readers see them', async () => {
  const s = memoryStore({ etagOnRead: true });
  const seeded = await taskTemplates(TCHELSEA, s);
  assert.deepEqual(seeded.map((x) => x.id), TASK_TEMPLATE_SEED.map((x) => x.id).sort());
  assert.equal(await taskTemplates(TSAM, s), null);
  assert.ok((await saveTaskTemplate(TSAM, { name: 'Nope' }, s, T0, TMODS)).error);
  // A fill-in tasks do not know, and a link fill-in in a name, are refused.
  assert.match((await saveTaskTemplate(TCHELSEA, { name: 'Hello {person}' }, s, T0, TMODS)).error, /no fill-in called \{person\}/);
  assert.match((await saveTaskTemplate(TCHELSEA, { name: 'About {contact}' }, s, T0, TMODS)).error, /goes in the description/);
  assert.match((await saveTaskTemplate(TCHELSEA, { name: 'Late', startAfter: 5, dueAfter: 2 }, s, T0, TMODS)).error, /due before it starts/);
  const made = await saveTaskTemplate(TCHELSEA, { name: 'Welcome {name}', body: 'See {contact}', who: 'Norah', tags: ['Community'], dueAfter: 7 }, s, T0, TMODS);
  assert.equal(made.template.by, 'Chelsea');
  assert.deepEqual([made.template.startAfter, made.template.dueAfter], [null, 7]);
  // The first save kept the seeded ones beside it; deleting a seeded one keeps it deleted.
  assert.equal((await readTaskTpls(s)).length, TASK_TEMPLATE_SEED.length + 1);
  assert.deepEqual(await removeTaskTemplate(TCHELSEA, TASK_TEMPLATE_SEED[0].id, s), { gone: true });
  assert.equal((await readTaskTpls(s)).some((x) => x.id === TASK_TEMPLATE_SEED[0].id), false, 'a deleted seeded template came back');
  const changed = await saveTaskTemplate(TRYAN, { id: made.template.id, priority: 'High' }, s, T0 + 1, TMODS);
  assert.deepEqual([changed.template.priority, changed.template.name, changed.template.editedBy], ['High', 'Welcome {name}', 'Ryan']);
  assert.equal((await taskTemplate(TCHELSEA, made.template.id, s)).body, 'See {contact}');
  // A task made from one by hand keeps which.
  const t = await saveTask(TCHELSEA, { name: 'Welcome Jo', tpl: made.template.id }, s, T0 + 2, TMODS);
  assert.equal(t.task.tpl, made.template.id);
});

test('the Join form makes a Join Request case and an onboarding task from its template, linking both, once', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const join = { type: 'community', entry: 900, submitted: '2026-10-22', email: 'kit@example.org', name: 'Kit', message: '**Tell us a bit about yourself**\nHello.' };
  assert.deepEqual(await officeIntake(join, s, T0, TMODS), { ok: true, record: 'case', made: true, task: true });
  const [k] = await readCases(s);
  const [c] = await readContacts(s);
  assert.deepEqual([k.type, k.name, k.contact], ['Join Request', 'Join Request 900: Kit', c.id]);
  const [t] = await readTasks(s);
  assert.deepEqual([t.name, t.by, t.tpl, t.start, t.due, t.tags], ['Onboard Kit into Community', null, 'pJoinOnboard1', '2026-10-22', null, ['Community']]);
  assert.ok(t.body.includes(`[[case:${k.id}]]`) && t.body.includes(`[[contact:${c.id}]]`), 'the task does not link the case and the contact');
  assert.ok(!t.body.includes('kit@example.org'), 'the task carries their email');
  // A resend makes neither twice.
  assert.deepEqual(await officeIntake(join, s, T0 + 1, TMODS), { ok: true, record: 'case', made: false, task: false });
  assert.equal((await readTasks(s)).length, 1);
  // With its template deleted from Tasks, the case says so and no task is made.
  await removeTaskTemplate(TCHELSEA, 'pJoinOnboard1', s);
  assert.deepEqual(await officeIntake({ ...join, entry: 901, email: 'lee@example.org', name: 'Lee' }, s, T0 + 2, TMODS), { ok: true, record: 'case', made: true, task: false });
  assert.match((await readCases(s)).find((x) => x.form === 901).body, /No task was made for this/);
  assert.equal((await readTasks(s)).length, 1);
}));

test('the member map: places and how many, no names, one place for a city, and only the office puts pins on it or takes them off', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  // The pins brought from Google, once each by key.
  const rows = [{ key: 'google-1', place: 'Austin', country: 'United States', lat: 30.267153, lon: -97.7430608 },
    { key: 'google-2', place: 'Austin', country: 'United States', lat: 30.267153, lon: -97.7430608 },
    { key: 'google-3', place: 'Leeds', country: 'United Kingdom', lat: 53.8008, lon: -1.5491 }];
  assert.deepEqual(await importMap(TRYAN, rows, s), { added: 3 });
  assert.deepEqual(await importMap(TRYAN, rows, s), { added: 0 }, 'bringing them again doubled them');
  assert.ok((await importMap(TSAM, rows, s)).error);
  let m = await memberMap(s);
  assert.deepEqual(m.places.map((p) => [p.place, p.country, p.n]), [['Leeds', 'United Kingdom', 1], ['Austin', 'United States', 2]]);
  assert.deepEqual([m.total, m.countries], [3, [{ country: 'United Kingdom', n: 1 }, { country: 'United States', n: 2 }]]);
  assert.ok(m.places.every((p) => p.x > 0 && p.x < 1000 && p.y > 0), 'a place has no point on the map');
  assert.ok(!JSON.stringify(m).includes('google-') && !m.places.some((p) => 'id' in p), 'what anybody is shown carries an id or a key');
  // A join request's member, put on at a place a few km from Austin, joins Austin.
  await officeIntake({ type: 'community', entry: 950, email: 'pat@example.org', name: 'Pat', message: '**City**\nAustin\n\n**Country**\nUS' }, s, T0, TMODS);
  const k = (await readCases(s)).find((x) => x.form === 950);
  assert.ok((await mapPut(TSAM, k.id, { place: 'Austin', country: 'United States', lat: 30.2711, lon: -97.7437 }, s)).error);
  const put = await mapPut(TRYAN, k.id, { place: 'Austin', country: 'United States', lat: 30.2711, lon: -97.7437 }, s, T0 + 1);
  assert.deepEqual(put.pin, { place: 'Austin', country: 'United States', n: 3 });
  assert.equal((await officeCase(TRYAN, k.id, s)).map.n, 3);
  const pins = await readMemberMap(s);
  assert.equal(new Set(pins.map((p) => `${p.lat},${p.lon}`)).size, 2, 'Austin became two places');
  assert.ok(pins.every((p) => !('contact' in p) && !('case' in p) && !('email' in p)), 'a pin knows whose it is');
  // A place of its own when asked; moving replaces the pin rather than adding one.
  await mapPut(TRYAN, k.id, { place: 'Round Rock', country: 'United States', lat: 30.5083, lon: -97.6789, join: false }, s, T0 + 2);
  m = await memberMap(s);
  assert.deepEqual([m.total, m.places.find((p) => p.place === 'Austin').n, m.places.find((p) => p.place === 'Round Rock').n], [4, 2, 1]);
  // Taken off: their pin goes, Austin stays for the others.
  assert.deepEqual(await mapTake(TRYAN, k.id, s, T0 + 3), { gone: true });
  assert.equal((await memberMap(s)).total, 3);
  assert.ok((await mapTake(TRYAN, k.id, s)).error);
  // One of Google's taken off a place by hand, never a join request's.
  await mapPut(TRYAN, k.id, { place: 'Leeds', country: 'United Kingdom', lat: 53.8, lon: -1.55 }, s, T0 + 4);
  assert.deepEqual((await officeMemberMap(TRYAN, s)).find((p) => p.place === 'Leeds'), { place: 'Leeds', country: 'United Kingdom', lat: 53.8008, lon: -1.5491, n: 2, loose: 1 });
  assert.deepEqual(await mapTakeOne(TRYAN, { lat: 53.8008, lon: -1.5491 }, s), { gone: true });
  assert.ok((await mapTakeOne(TRYAN, { lat: 53.8008, lon: -1.5491 }, s)).error, 'a join request\'s pin was taken off by hand');
  // Deleting the case takes its pin.
  await removeCase(TRYAN, k.id, s);
  assert.deepEqual((await memberMap(s)).places.map((p) => [p.place, p.n]), [['Austin', 2]]);
  assert.equal(await officeMemberMap(TSAM, s), null);
}));

test('looking a place up sends only its words to OpenStreetMap, and says which place on the map it would join', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  await importMap(TRYAN, [{ key: 'google-1', place: 'Austin', country: 'United States', lat: 30.267153, lon: -97.7430608 }], s);
  let asked = null, opts = null;
  const fake = async (url, o) => { asked = url; opts = o; return { ok: true, json: async () => [
    { lat: '30.2711286', lon: '-97.7436995', name: 'Austin', display_name: 'Austin, Travis County, Texas, United States', address: { city: 'Austin', country: 'United States' } },
    { lat: '43.6666', lon: '-92.9746', name: 'Austin', display_name: 'Austin, Mower County, Minnesota, United States', address: { city: 'Austin', country: 'United States' } },
    { lat: 'nonsense', lon: '1' }] }; };
  const r = await mapFind(TRYAN, 'Austin, Texas', s, fake);
  assert.ok(asked.startsWith('https://nominatim.openstreetmap.org/search?') && asked.endsWith('&q=Austin%2C%20Texas'));
  assert.match(opts.headers['user-agent'], /Stimpunks\.World/);
  assert.equal(r.found.length, 2);
  assert.deepEqual([r.found[0].near.place, r.found[0].near.n, r.found[1].near], ['Austin', 1, null]);
  assert.ok(r.found[0].near.km < MAP_NEAR_KM);
  assert.ok((await mapFind(TSAM, 'Austin', s, fake)).error);
  assert.ok((await mapFind(TRYAN, '  ', s, fake)).error);
  assert.match((await mapFind(TRYAN, 'Austin', s, async () => ({ ok: false }))).error, /OpenStreetMap/);
}));

test('fifteen form entries at once, one person: one contact and fifteen cases, none lost and no number twice; the same entry fifteen times makes one', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => officeIntake({ type: 'connection', entry: 500 + i, email: 'same@example.org', first: 'Same' }, s, T0 + i)));
  const ok = told.filter((r) => r.status === 'fulfilled' && r.value.made).length;
  const cases = await readCases(s);
  assert.equal(cases.length, ok, 'a case told it was made is missing');
  assert.equal(new Set(cases.map((k) => k.number)).size, cases.length);
  assert.equal((await readContacts(s)).filter((c) => c.email === 'same@example.org').length, 1, 'one person became two contacts');
  const again = await Promise.allSettled(Array.from({ length: 15 }, () => officeIntake({ type: 'mutual_aid', entry: 900, email: 'same@example.org' }, s, T0 + 99)));
  assert.equal(again.filter((r) => r.status === 'fulfilled' && r.value.made).length, 1);
  assert.equal((await readGrants(s)).filter((g) => g.form === 900).length, 1, 'one entry made two grant requests');
}));

test('a final import from EspoCRM leaves alone what the form already brought here', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  await officeIntake({ type: 'mutual_aid', entry: 4001, email: 'both@example.org', first: 'Both', last: 'Ways' }, s, T0);
  await officeIntake({ type: 'connection', entry: 4002, email: 'both@example.org' }, s, T0 + 1);
  const c = await importContacts(TRYAN, [{ espo: '68dd0000000000b01', first: 'Both', last: 'Ways', email: 'BOTH@example.org' }], s, T0 + 2);
  assert.equal(c.told[0].kept, 'already here');
  assert.equal((await readContacts(s)).length, 1, 'the same person became two contacts');
  const g = await importGrants(TRYAN, [{ espo: '68dd0000000000b02', name: 'Aid Request 4001: Both Ways', pipeline: 'Mutual Aid', stage: 'Received', form: 4001 }], s, T0 + 3);
  const k = await importCases(TRYAN, [{ espo: '68dd0000000000b03', number: 9, name: 'Connection Request 4002', type: 'Connection Request', status: 'New', form: 4002 }], s, T0 + 4);
  assert.deepEqual([g.told[0].kept, k.told[0].kept], ['already here', 'already here']);
  assert.deepEqual([(await readGrants(s)).length, (await readCases(s)).length], [1, 1], 'one form entry became two records');
}));

const MAIL_TEST_KEY = rnd(24).toString('hex');
async function withMailKey(key, fn) {
  const was = process.env.CB_OFFICE_MAIL_KEY;
  if (key == null) delete process.env.CB_OFFICE_MAIL_KEY; else process.env.CB_OFFICE_MAIL_KEY = key;
  try { return await fn(); } finally { if (was == null) delete process.env.CB_OFFICE_MAIL_KEY; else process.env.CB_OFFICE_MAIL_KEY = was; }
}
const mailFrom = (i, extra = {}) => ({ id: (0x18f0000 + i).toString(16).padStart(16, '0'), thread: (0x18e0000 + i).toString(16).padStart(16, '0'), mailbox: 'Team <team@example.org>', at: T0 - i * 60000,
  from: 'Ada Lovelace <ADA@example.org>', to: ['team@example.org'], cc: [], bcc: [], subject: `About the grant ${i}`, text: `Hello, here is message ${i}.\r\nThanks`, files: [{ name: 'receipt.pdf', size: 1234 }], ...extra });

test('the mailbox’s way in has its own key, and the forms’ key does not open it', () => withOfficeKey(OFFICE_TEST_KEY, () => withMailKey(MAIL_TEST_KEY, () => withIntakeKey(INTAKE_TEST_KEY, async () => {
  const raw = JSON.stringify({ action: 'addresses' });
  assert.equal(mailReady(), true);
  assert.equal(mailSigned(signIntake(raw, undefined, MAIL_TEST_KEY), raw, T0), true);
  assert.equal(mailSigned(signIntake(raw, undefined, INTAKE_TEST_KEY), raw, T0), false, 'the forms’ key opened the mailbox’s way in');
  assert.equal(intakeSigned(signIntake(raw, undefined, MAIL_TEST_KEY), raw, T0), false, 'the mailbox’s key opened the forms’ way in');
  await withMailKey(null, async () => assert.equal(mailReady(), false));
}))));

test('an email with a contact is kept whole, sealed, on that contact, once; one with nobody is kept nowhere', () => withOfficeKey(OFFICE_TEST_KEY, () => withMailKey(MAIL_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const ada = (await saveContact(TRYAN, { first: 'Ada', last: 'Lovelace', email: 'ada@example.org' }, s, T0)).contact;
  const bo = (await saveContact(TRYAN, { first: 'Bo', last: 'Peep', email: 'bo@example.org' }, s, T0)).contact;
  const hashes = await mailAddresses(s);
  assert.deepEqual(hashes, ['ada@example.org', 'bo@example.org'].map((a) => createHmac('sha256', MAIL_TEST_KEY).update(a).digest('hex')).sort());
  assert.ok(!JSON.stringify(hashes).includes('example.org'), 'addresses went out bare');
  assert.deepEqual(await officeMailIn(mailFrom(1, { from: 'Stranger <stranger@example.net>' }), s, T0), { kept: false });
  assert.equal(await s.get('office-mail/' + mailFrom(1).id, { type: 'json' }), null, 'an email with nobody here was stored');
  assert.deepEqual(await officeMailIn(mailFrom(2), s, T0), { kept: true, made: true, contacts: 1 });
  assert.deepEqual(await officeMailIn(mailFrom(2), s, T0 + 1), { kept: true, made: false, contacts: 1 }, 'an email sent twice was made twice');
  assertSealed(await s.get('office-mail/' + mailFrom(2).id, { type: 'json' }), ['Lovelace', 'ada@example.org', 'About the grant', 'message 2', 'receipt.pdf']);
  // One the team sent, to two contacts at once, with Bo copied.
  await officeMailIn(mailFrom(3, { from: 'team@example.org', to: ['Ada <ada@example.org>'], cc: ['bo@example.org'], subject: 'Re: About the grant' }), s, T0 + 2);
  const c = await officeContact(TRYAN, ada.id, s);
  assert.deepEqual(c.mail.map((x) => [x.subject, x.out]), [['About the grant 2', false], ['Re: About the grant', true]]);
  assert.deepEqual(c.mail.map((x) => x.id), [mailFrom(2).id, mailFrom(3).id], 'a contact’s emails are not newest first');
  assert.equal(c.mailbox, 'team@example.org');
  assert.deepEqual((await officeContact(TRYAN, bo.id, s)).mail.map((x) => x.id), [mailFrom(3).id]);
  const e = await officeEmail(TRYAN, mailFrom(2).id, s);
  assert.deepEqual([e.text, e.files[0].name, e.out, e.contacts.map((x) => x.name)], ['Hello, here is message 2.\nThanks', 'receipt.pdf', false, ['Ada Lovelace']]);
  assert.equal(await officeEmail(TSAM, mailFrom(2).id, s), null, 'somebody outside the office read an email');
  assert.match((await removeEmail(TSAM, mailFrom(2).id, s)).error, /directors, board members and administrators/);
  // Deleted here, and never taken back in.
  assert.ok((await removeEmail(TRYAN, mailFrom(2).id, s)).gone);
  assert.deepEqual(await officeMailIn(mailFrom(2), s, T0 + 3), { kept: false, gone: true });
  assert.deepEqual((await officeContact(TRYAN, ada.id, s)).mail.map((x) => x.id), [mailFrom(3).id]);
  // Bo deleted: the shared email stays on Ada; one with only Bo goes.
  await officeMailIn(mailFrom(4, { from: 'bo@example.org' }), s, T0 + 4);
  await removeContact(TRYAN, bo.id, s);
  assert.equal(await s.get('office-mail/' + mailFrom(4).id, { type: 'json' }), null, 'an email with only a deleted contact stayed');
  assert.deepEqual((await officeEmail(TRYAN, mailFrom(3).id, s)).contacts.map((x) => x.name), ['Ada Lovelace']);
  assert.equal(await s.get('office-mail-of/' + bo.id, { type: 'json' }), null);
  for (const bad of [{ ...mailFrom(5), id: 'not hex!' }, { ...mailFrom(5), mailbox: 'nobody' }, { ...mailFrom(5), at: 'soon' }, null]) assert.ok((await officeMailIn(bad, s, T0)).error);
  const long = await officeMailIn(mailFrom(6, { text: 'x'.repeat(250000) }), s, T0 + 5);
  assert.equal(long.kept, true);
  assert.match((await officeEmail(TRYAN, mailFrom(6).id, s)).text, /Cut short here/);
})));

test('a labelled thread’s person is found by address or added with the email’s name, and nothing else', () => withOfficeKey(OFFICE_TEST_KEY, () => withMailKey(MAIL_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  await saveContact(TRYAN, { first: 'Ada', last: 'Lovelace', email: 'ada@example.org' }, s, T0);
  const box = 'Team <team@example.org>';
  assert.deepEqual(await officeMailContact({ name: 'Jane Q. Doe', email: 'Jane <JANE@example.net>', mailbox: box }, s, T0 + 1), { ok: true, made: true });
  assert.deepEqual(await officeMailContact({ name: 'Jane', email: 'jane@example.net', mailbox: box }, s, T0 + 2), { ok: true, made: false }, 'one person became two contacts');
  assert.deepEqual(await officeMailContact({ name: 'A. Lovelace', email: 'ADA@example.org', mailbox: box }, s, T0 + 3), { ok: true, made: false });
  const names = [['Doe, Cy', 'cy@example.net', 'Cy', 'Doe'], ['"Bea Arthur, PhD"', 'bea@example.net', 'Bea', 'Arthur'],
    ['Foo, Inc.', 'foo@example.net', 'Foo', ''], ['Prince', 'prince@example.net', 'Prince', ''], ['', 'dee@example.net', '', 'dee@example.net'],
    ['dee2@example.net', 'dee2@example.net', '', 'dee2@example.net']];
  for (const [name, email] of names) await officeMailContact({ name, email, mailbox: box }, s, T0 + 4);
  const all = await readContacts(s);
  for (const [name, email, first, last] of names) {
    const c = all.find((x) => x.email === email);
    assert.deepEqual([c.first, c.last], [first, last], `${JSON.stringify(name)} was named wrongly`);
  }
  const jane = all.find((c) => c.email === 'jane@example.net');
  assert.deepEqual([jane.first, jane.last, jane.by, jane.phone, jane.notes], ['Jane Q.', 'Doe', MAIL_BY, '', '']);
  assert.equal(all.find((c) => c.email === 'ada@example.org').first, 'Ada', 'a contact already here was renamed from an email');
  assertSealed(await s.get('office-contacts', { type: 'json' }), ['Jane', 'example.net']);
  for (const bad of [{ email: 'team@example.org', mailbox: box }, { email: 'nobody', mailbox: box }, { email: 'x@example.net' }, null]) {
    assert.ok((await officeMailContact(bad, s, T0)).error, JSON.stringify(bad));
  }
  await withOfficeKey(null, async () => assert.equal((await officeMailContact({ email: 'x@example.net', mailbox: box }, s, T0)).status, 503));
})));

test('an email kept before somebody on it was a contact is theirs too once they are, and stays while either is', () => withOfficeKey(OFFICE_TEST_KEY, () => withMailKey(MAIL_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const ada = (await saveContact(TRYAN, { first: 'Ada', last: 'Lovelace', email: 'ada@example.org' }, s, T0)).contact;
  const both = mailFrom(7, { from: 'Cy Doe <cy@example.net>', to: ['team@example.org'], cc: ['ada@example.org'] });
  await officeMailIn(both, s, T0 + 1);
  await officeMailContact({ name: 'Cy Doe', email: 'cy@example.net', mailbox: 'team@example.org' }, s, T0 + 2);
  assert.deepEqual(await officeMailIn(both, s, T0 + 3), { kept: true, made: false, contacts: 2 });
  const cy = (await readContacts(s)).find((c) => c.email === 'cy@example.net');
  assert.deepEqual((await officeContact(TRYAN, cy.id, s)).mail.map((x) => x.id), [both.id]);
  assert.deepEqual((await officeEmail(TRYAN, both.id, s)).contacts.map((x) => x.name).sort(), ['Ada Lovelace', 'Cy Doe']);
  await removeContact(TRYAN, ada.id, s);
  assert.ok(await officeEmail(TRYAN, both.id, s), 'an email Cy is on went with Ada');
  assert.deepEqual((await officeContact(TRYAN, cy.id, s)).mail.map((x) => x.id), [both.id]);
})));

test('the dashboard’s newest email is a sealed list of the latest filed, which forgets what the office lets go', () => withOfficeKey(OFFICE_TEST_KEY, () => withMailKey(MAIL_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const ada = (await saveContact(TRYAN, { first: 'Ada', last: 'Lovelace', email: 'ada@example.org' }, s, T0)).contact;
  const bo = (await saveContact(TRYAN, { first: 'Bo', last: 'Peep', email: 'bo@example.org' }, s, T0)).contact;
  assert.deepEqual((await officeDashboard(TRYAN, s, T0)).recent.mail, []);
  // Filed oldest first, as a backfill would: the list keeps the newest by when each was sent.
  for (let i = 25; i >= 1; i--) await officeMailIn(mailFrom(i), s, T0);
  const raw = await s.get('office-mail-recent', { type: 'json' });
  assertSealed(raw, ['About the grant', 'Lovelace']);
  const list = unseal(raw).mail;
  assert.deepEqual(list.map((x) => x.id), Array.from({ length: MAIL_RECENT_KEEP }, (_, i) => mailFrom(i + 1).id));
  for (const x of list) assert.deepEqual(Object.keys(x).sort(), ['at', 'contacts', 'id', 'out', 'subject'], 'the list keeps more than privacy.html#office says');
  // An older email arriving late leaves a full list alone.
  await officeMailIn(mailFrom(40), s, T0);
  assert.ok(!unseal(await s.get('office-mail-recent', { type: 'json' })).mail.some((x) => x.id === mailFrom(40).id));
  let d = await officeDashboard(TRYAN, s, T0);
  assert.equal(d.recent.mail.length, MAIL_RECENT_SHOWN);
  assert.deepEqual([d.recent.mail[0].subject, d.recent.mail[0].out, d.recent.mail[0].contacts], ['About the grant 1', false, ['Ada Lovelace']]);
  assert.ok(!JSON.stringify(d.recent.mail).includes('@'), 'an address reached the dashboard');
  // One the team sent to Ada and Bo, then one to Bo alone; deleting Bo takes his own and leaves the shared one on Ada.
  await officeMailIn(mailFrom(0, { at: T0 + 2000, from: 'team@example.org', to: ['ada@example.org', 'bo@example.org'], subject: 'To you both' }), s, T0);
  await officeMailIn(mailFrom(-1, { at: T0 + 3000, from: 'bo@example.org', subject: 'Only Bo' }), s, T0);
  d = await officeDashboard(TRYAN, s, T0);
  assert.deepEqual(d.recent.mail.slice(0, 2).map((x) => [x.subject, x.out, x.contacts]), [['Only Bo', false, ['Bo Peep']], ['To you both', true, ['Ada Lovelace', 'Bo Peep']]]);
  await removeContact(TRYAN, bo.id, s);
  d = await officeDashboard(TRYAN, s, T0);
  assert.deepEqual(d.recent.mail[0].contacts, ['Ada Lovelace']);
  assert.equal(d.recent.mail[0].subject, 'To you both');
  assert.ok(!unseal(await s.get('office-mail-recent', { type: 'json' })).mail.some((x) => x.contacts.includes(bo.id)), 'a deleted contact stayed on the list');
  // Deleted from the office: off the list too.
  await removeEmail(TRYAN, mailFrom(0).id, s);
  assert.equal((await officeDashboard(TRYAN, s, T0)).recent.mail[0].subject, 'About the grant 1');
})));

test('email filed before the list existed is put on it from its contacts’ own lists, and a repair keeps what is newer', () => withOfficeKey(OFFICE_TEST_KEY, () => withMailKey(MAIL_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  await saveContact(TRYAN, { first: 'Ada', last: 'Lovelace', email: 'ada@example.org' }, s, T0);
  await saveContact(TRYAN, { first: 'Bo', last: 'Peep', email: 'bo@example.org' }, s, T0);
  for (let i = 30; i >= 1; i--) await officeMailIn(mailFrom(i, i === 2 ? { from: 'team@example.org', to: ['ada@example.org', 'bo@example.org'], subject: 'To you both' } : {}), s, T0);
  // As it was the morning the list arrived: every email on its contacts' lists and none on the dashboard's.
  await s.delete('office-mail-recent');
  const d = await officeDashboard(TRYAN, s, T0);
  assert.deepEqual(d.recent.mail.map((x) => x.id), Array.from({ length: MAIL_RECENT_SHOWN }, (_, i) => mailFrom(i + 1).id));
  assert.deepEqual([d.recent.mail[1].subject, d.recent.mail[1].out, d.recent.mail[1].contacts.slice().sort()], ['To you both', true, ['Ada Lovelace', 'Bo Peep']]);
  const raw = await s.get('office-mail-recent', { type: 'json' });
  assertSealed(raw, ['About the grant', 'Lovelace']);
  const list = unseal(raw).mail;
  assert.equal(list.length, MAIL_RECENT_KEEP);
  for (const x of list) assert.deepEqual(Object.keys(x).sort(), ['at', 'contacts', 'id', 'out', 'subject'], 'the seed kept more than privacy.html#office says');
  // A repair over a list that has moved on keeps the newer entries and adds nothing twice.
  await officeMailIn(mailFrom(-5, { at: T0 + 5000, subject: 'Newest' }), s, T0);
  const again = (await seedRecentMail(s)).mail;
  assert.equal(again[0].subject, 'Newest');
  assert.equal(new Set(again.map((x) => x.id)).size, again.length, 'an email went on the list twice');
  assert.equal(again.length, MAIL_RECENT_KEEP);
  await withOfficeKey(null, async () => assert.equal(await seedRecentMail(s), null));
})));

test('the dashboard’s form entries are the records with an entry number, the highest first, each named by its form', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const before = new Date(T0 - 10 * 864e5).toISOString().slice(0, 10);
  await officeIntake({ type: 'mutual_aid', entry: 101, submitted: before, email: 'jane@example.com', first: 'Jane', last: 'Doe' }, s, T0);
  await officeIntake({ type: 'volunteer', entry: 104, email: 'solo@example.com' }, s, T0 + 1);
  await officeIntake({ type: 'connection', entry: 103, name: 'No Mail' }, s, T0 + 2);
  await officeIntake({ type: 'creator_grant', entry: 102, email: 'mary@example.com', first: 'Mary', last: 'Smith' }, s, T0 + 3);
  // A case made by hand has no entry and is not one.
  await saveCase(TRYAN, { name: 'By hand', type: 'Connection Request' }, s, T0 + 4);
  // Renamed, a case is named by its type; moved to another pipeline, a grant request still by its name.
  const k = (await readCases(s)).find((x) => x.form === 103);
  await saveCase(TRYAN, { id: k.id, name: 'Somebody' }, s, T0 + 5);
  const g = (await readGrants(s)).find((x) => x.form === 102);
  await saveGrant(TRYAN, { id: g.id, pipeline: 'Mutual Aid' }, s, T0 + 6);
  const d = await officeDashboard(TRYAN, s, T0 + 7);
  assert.deepEqual(d.recent.forms.map((x) => [x.entry, x.form, x.record]),
    [[104, 'Volunteer', 'case'], [103, 'Connect', 'case'], [102, 'Request Creator Grant', 'grant'], [101, 'Request Aid', 'grant']]);
  assert.deepEqual([d.recent.forms[0].contactName, d.recent.forms[1].contactName, d.recent.forms[3].contactName], ['solo@example.com', null, 'Jane Doe']);
  assert.equal(d.recent.forms[0].number, (await readCases(s)).find((x) => x.form === 104).number);
  assert.equal(d.recent.forms[2].number, null);
  assert.deepEqual(d.forms.week.map((w) => [w.form, w.now, w.before]),
    [['Request Aid', 0, 1], ['Request Creator Grant', 1, 0], ['Connect', 1, 0], ['Volunteer', 1, 0], ['Join Our Community', 0, 0]]);
  for (let i = 0; i < FORM_ENTRIES_SHOWN; i++) await officeIntake({ type: 'connection', entry: 200 + i, name: `More ${i}` }, s, T0 + 10 + i);
  const more = (await officeDashboard(TRYAN, s, T0 + 30)).recent.forms;
  assert.equal(more.length, FORM_ENTRIES_SHOWN);
  assert.equal(more[0].entry, 200 + FORM_ENTRIES_SHOWN - 1);
}));

test('the mailbox’s counts are numbers only, sealed, replaced by the next, and a count not finished is not a number', () => withOfficeKey(OFFICE_TEST_KEY, () => withMailKey(MAIL_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  let d = await officeDashboard(TRYAN, s, T0);
  assert.deepEqual(d.mailbox, { ready: true, counted: null });
  assert.deepEqual(await officeMailCounts({ unread: 3, received: [10, 8], sent: [4, 5], withContacts: [6, 7] }, s, T0), { ok: true });
  assertSealed(await s.get('office-mailbox-counts', { type: 'json' }), ['unread', 'received']);
  d = await officeDashboard(TRYAN, s, T0 + 1);
  assert.deepEqual(d.mailbox.counted, { read: T0, counts: { unread: 3, received: [10, 8], sent: [4, 5], withContacts: [6, 7] } });
  // Anything that is not a whole number, or a pair that is not two, is not counted, and words are not kept.
  assert.deepEqual(await officeMailCounts({ unread: 2, received: [1], sent: [1.5, 2], withContacts: ['a', 1], from: 'ada@example.org' }, s, T0 + 2), { ok: true });
  assert.deepEqual((await officeDashboard(TRYAN, s, T0 + 3)).mailbox.counted, { read: T0 + 2, counts: { unread: 2, received: null, sent: null, withContacts: null } });
  for (const bad of [null, {}, { unread: -1 }, { unread: 'lots', received: 'x' }]) assert.ok((await officeMailCounts(bad, s, T0)).error, JSON.stringify(bad));
  await withOfficeKey(null, async () => assert.equal((await officeMailCounts({ unread: 1 }, s, T0)).status, 503));
  await withMailKey(null, async () => assert.equal((await officeDashboard(TRYAN, s, T0)).mailbox.ready, false));
})));

test('the dashboard works its figures out from the records: EspoCRM’s four reports, this week and last, and tasks', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const ada = (await saveContact(TRYAN, { first: 'Ada', last: 'Lovelace', email: 'ada@example.org' }, s, T0)).contact;
  const MA = { pipeline: 'Mutual Aid', contact: ada.id, amount: 500 };
  for (const f of [{ name: 'A', stage: 'Received', submitted: '2026-10-15' }, { name: 'B', stage: 'Holding', submitted: '2026-10-08' }, { name: 'C', stage: 'Holding', submitted: '2025-12-01' },
    { name: 'D', stage: 'Granted', submitted: '2026-03-01', closed: '2026-03-02' }, { name: 'E', stage: 'Denied', submitted: '2026-04-01', closed: '2026-04-01' }]) {
    assert.ok((await saveGrant(TRYAN, { ...MA, ...f }, s, T0)).grant, f.name);
  }
  await saveGrant(TRYAN, { name: 'F', pipeline: 'Creator Grants', stage: 'Received', contact: ada.id, amount: 3000, submitted: '2026-10-16' }, s, T0);
  await saveCase(TRYAN, { name: 'Connection Request: Ada', submitted: '2026-10-17', contact: ada.id }, s, T0);
  await saveCase(TRYAN, { name: 'Old one', submitted: '2026-01-02', status: 'Closed' }, s, T0);
  await saveTask(TCHELSEA, { name: 'Late', due: '2026-10-10', who: 'norah' }, s, T0, TMODS);
  await saveTask(TCHELSEA, { name: 'Soon', due: '2026-10-20', who: 'norah' }, s, T0, TMODS);
  await saveTask(TCHELSEA, { name: 'Done', due: '2026-10-01', status: 'Completed' }, s, T0, TMODS);
  assert.equal(await officeDashboard(TSAM, s, T0), null);
  const d = await officeDashboard(TRYAN, s, T0);
  assert.deepEqual([d.day, d.weekFrom, d.year], ['2026-10-18', '2026-10-12', '2026']);
  const g = d.grants;
  assert.deepEqual([g.open, g.openSum], [4, 4500]);
  assert.deepEqual([g.active.cap, g.active.count, g.active.byPipeline.map((x) => [x.count, x.cap])], [100, 3, [[2, 100], [1, 100]]]);
  assert.deepEqual(g.stages[0].stages.map((x) => [x.stage, x.count, x.sum]), [['Received', 1, 500], ['Holding', 2, 1000], ['Holding (No Updates)', 0, 0], ['Agreement Sent', 0, 0]]);
  assert.equal(g.months.length, 10, 'months after this one were drawn');
  assert.deepEqual([g.months[2].counts, g.months[3].counts, g.months[9].counts], [[1, 0], [1, 0], [2, 1]]);
  assert.deepEqual(g.week, { now: 2, before: 1 });
  assert.deepEqual(g.decided, { granted: 1, grantedSum: 500, denied: 1 });
  assert.deepEqual([d.cases.open, d.cases.byStatus.find((x) => x.status === 'New').count, d.cases.week.now], [1, 1, 1]);
  assert.ok(!d.cases.byStatus.some((x) => /Invited In|Collaborating/.test(x.status)), 'a retired status is back');
  assert.deepEqual([d.tasks.open, d.tasks.overdue, d.tasks.dueSoon, d.tasks.week.now], [2, 1, 1, 3]);
  assert.deepEqual(d.tasks.byPerson, [{ who: 'Norah', open: 2, overdue: 1 }]);
  assert.deepEqual(d.recent.grants.map((x) => x.contactName), Array(5).fill('Ada Lovelace'));
  // The forum topics posted to last, from the forums' own Latest, with the path to each one's category.
  assert.deepEqual(d.recent.forum, []);
  const kettle = (await startTopic(TCHELSEA, { cat: 'help-desk', title: 'Where is the kettle?', body: 'x' }, s, T0 + 1, NO_NET)).topic;
  await startTopic(TRYAN, { cat: 'notes', title: 'Board notes', body: 'x' }, s, T0 + 2, NO_NET);
  await replyTopic(TRYAN, kettle.id, { body: 'Under the stairs.' }, s, T0 + 3, NO_NET);
  assert.deepEqual((await officeDashboard(TRYAN, s, T0 + 4)).recent.forum.map((x) => [x.title, x.cat, x.lastBy, x.last]),
    [['Where is the kettle?', 'Help desk', 'Ryan', T0 + 3], ['Board notes', 'Team Docs › Notes', 'Ryan', T0 + 2]]);
  // EspoCRM's other five reports, from the same records.
  assert.equal(await officeReports(TSAM, s, T0), null);
  const r = await officeReports(TRYAN, s, T0);
  assert.deepEqual(r.byYear.map((x) => [x.year, x.counts, x.sums]), [['2025', [1, 0], [500, 0]], ['2026', [4, 1], [2000, 3000]]]);
  assert.deepEqual(r.awarded.map((x) => [x.year, x.counts, x.sums]), [['2026', [1, 0], [500, 0]]]);
  assert.deepEqual(r.grantees.map((x) => [x.name, x.contactName, x.closed, x.amount]), [['D', 'Ada Lovelace', '2026-03-02', 500]]);
  assert.deepEqual(r.casesByStatus.map((x) => [x.status, x.count]), [['New', 1], ['Assigned', 0], ['Replied', 0], ['Closed', 1], ['Spam', 0]]);
  assert.deepEqual(r.casesByYear.map((x) => [x.year, x.counts]), [['2026', [2, 0, 0]]]);
  assert.equal(r.noSubmitted, 0);
}));

test('the CB counts messages a day in three numbers and keeps no name, no room and no words', async () => {
  const s = memoryStore({ etagOnRead: true });
  const day = Date.parse('2026-10-18T18:00:00Z');
  assert.equal(await countMessage(null, s, day), 'world');
  assert.equal(await countMessage(WORLD_CALL, s, day), 'world');
  assert.equal(await countMessage('the-den', s, day), 'rooms');
  assert.equal(await countMessage('the-secret-cabin', s, day), 'mods', 'a locked room that keeps to itself was not counted with the locked rooms');
  assert.equal(await countMessage('town-hall-board', s, day), 'mods');
  assert.deepEqual(await readDayCounts(s), { '2026-10-18': { world: 2, rooms: 1, mods: 2 } });
  assert.doesNotMatch(JSON.stringify(await s.get('channel-days', { type: 'json' })), /den|cabin|town-hall|world-call|stimpunks-world/, 'a room was named in the counts');
  // A day past DAY_COUNTS_DAYS goes on the next write.
  await countMessage(null, s, day + DAY_COUNTS_DAYS * 86400000);
  assert.deepEqual(Object.keys(await readDayCounts(s)), [new Date(day + DAY_COUNTS_DAYS * 86400000).toISOString().slice(0, 10)]);
});

for (const etagOnRead of [true, false]) {
  test(`fifteen messages counted at once, ${etagOnRead ? 'with' : 'without'} an etag on reads: none told it was counted is missing`, async () => {
    const s = memoryStore({ etagOnRead });
    const now = Date.parse('2026-10-18T18:00:00Z');
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => countMessage(i % 3 ? 'the-den' : null, s, now)));
    const c = (await readDayCounts(s))['2026-10-18'];
    const counted = told.filter((r) => r.status === 'fulfilled').map((r) => r.value);
    assert.equal(c.world + c.rooms + c.mods, counted.length, 'a message told it was counted is missing, or one was counted twice');
    assert.equal(c.world, counted.filter((k) => k === 'world').length);
  });
}

test('each night the office keeps what was open, sealed, one line a night, and the dashboard shows the lines and the CB’s days', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const ada = (await saveContact(TRYAN, { first: 'Ada', last: 'Lovelace', email: 'ada@example.org' }, s, T0)).contact;
  await saveGrant(TRYAN, { name: 'A', pipeline: 'Mutual Aid', stage: 'Holding', contact: ada.id, submitted: '2026-10-15' }, s, T0);
  await saveGrant(TRYAN, { name: 'B', pipeline: 'Mutual Aid', stage: 'Holding', contact: ada.id, submitted: '2025-10-15' }, s, T0);
  await saveGrant(TRYAN, { name: 'C', pipeline: 'Creator Grants', stage: 'Granted', contact: ada.id, submitted: '2026-10-15', closed: '2026-10-16' }, s, T0);
  await saveCase(TRYAN, { name: 'Connection Request: Ada', submitted: '2026-10-17', contact: ada.id }, s, T0);
  await saveTask(TCHELSEA, { name: 'Late', due: '2026-10-10', who: 'norah' }, s, T0, TMODS);
  const night = Date.parse('2026-10-18T05:50:00Z');   // 23:50 the night before, in Colorado
  assert.deepEqual(await officeNightly(s, night), { day: '2026-10-17', line: { grants: { 'Mutual Aid': 2, 'Creator Grants': 0 }, active: { 'Mutual Aid': 1, 'Creator Grants': 0 }, cases: 1, tasks: 1, overdue: 1 } });
  assertSealed(await s.get('office-nights', { type: 'json' }), ['Mutual Aid', 'overdue']);
  await saveCase(TRYAN, { name: 'Volunteer Application: Ada', submitted: '2026-10-17', contact: ada.id }, s, T0);
  await officeNightly(s, night + 60000);
  await officeNightly(s, night + 86400000);
  // An old night goes.
  await officeNightly(s, night - OFFICE_NIGHTS_KEEP * 86400000);
  await officeNightly(s, night + 2 * 86400000);
  await countMessage(null, s, T0);
  await countMessage('the-den', s, T0);
  const d = await officeDashboard(TRYAN, s, T0);
  assert.deepEqual(d.nights.map((x) => [x.day, x.grants, x.cases]), [['2026-10-17', [2, 0], 2], ['2026-10-18', [2, 0], 2]], 'the same night run again added a line, or a night was lost');
  assert.equal(d.firstNight, '2026-10-17', 'a night older than OFFICE_NIGHTS_KEEP was kept');
  assert.equal(d.cb.days.length, 30);
  assert.deepEqual(d.cb.days.at(-1), { day: '2026-10-18', counts: [1, 1, 0] });
  assert.deepEqual(d.cb.week, { now: 2, before: 0 });
  await withOfficeKey(null, async () => assert.equal((await officeNightly(s, night)).error, 'shut'));
}));

const DEAR = { name: 'Holding note', subject: 'About {grant}', body: 'Dear {first},\n\nYour {amount} request is at {stage} in {pipeline}, sent {submitted}.\n\nStimpunks' };

test('a contact\'s page has every mailing template filled in for them, and says which need a grant request they have not made', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  await saveTemplate(TRYAN, { name: 'Welcome', subject: 'Welcome, {first}', body: 'Dear {name},\nYou are in.' }, s, T0);
  await saveTemplate(TRYAN, { name: 'Granted', subject: 'Your {grant}', body: '{amount} is on its way.' }, s, T0);
  const kit = (await saveContact(TRYAN, { first: 'Kit', last: 'Lee', email: 'kit@example.org' }, s, T0)).contact;
  let w = (await officeContact(TRYAN, kit.id, s)).writes;
  assert.deepEqual(w.map((x) => [x.name, x.subject || null, x.missing]), [['Granted', null, ['{grant}', '{amount}']], ['Welcome', 'Welcome, Kit', []]]);
  assert.equal(w[1].body, 'Dear Kit Lee,\nYou are in.');
  await saveGrant(TRYAN, { name: 'Aid Request 7: Kit Lee', pipeline: 'Mutual Aid', amount: 500, submitted: '2026-10-01', contact: kit.id }, s, T0 + 1);
  w = (await officeContact(TRYAN, kit.id, s)).writes;
  assert.deepEqual([w[0].subject, w[0].body, w[0].missing, w[0].from], ['Your Aid Request 7: Kit Lee', '$500 is on its way.', [], 'Aid Request 7: Kit Lee']);
  assert.equal(await officeContact(TSAM, kit.id, s), null);
}));

test('{invite}: a director\'s press makes one invite that works once, fills its link in, and nothing writes down whom it was for', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const tpl = (await saveTemplate(TRYAN, { name: 'Membership Confirmation', subject: 'Welcome, {first}', body: 'Dear {name},\nJoin the CB here: {invite}\nStimpunks' }, s, T0)).template;
  const plain = (await saveTemplate(TRYAN, { name: 'Welcome', subject: 'Welcome, {first}', body: 'Dear {name},\nYou are in.' }, s, T0)).template;
  await officeIntake({ type: 'community', entry: 970, email: 'robin@example.org', name: 'Robin Hood', first: 'Robin', last: 'Hood', message: '**City**\nSherwood' }, s, T0, TMODS);
  const k = (await readCases(s)).find((x) => x.form === 970);
  // The page is told the template waits for an invite, and is not given one.
  const page = await officeCase(TRYAN, k.id, s);
  const w = page.write.writes.find((x) => x.id === tpl.id);
  assert.deepEqual([w.invite, w.subject, w.body], [true, 'Welcome, Robin', 'Dear Robin Hood,\nJoin the CB here: {invite}\nStimpunks']);
  assert.equal(page.write.writes.find((x) => x.id === plain.id).invite, false);
  assert.equal(page.write.id, k.contact);
  assert.equal((await readInvites(s)).length, 0, 'looking at the page made an invite');
  const before = [JSON.stringify(await s.get('office-contacts', { type: 'json' })), JSON.stringify(await s.get('office-cases', { type: 'json' }))];
  assert.ok((await writeInvite(TSAM, k.contact, tpl.id, s, T0 + 1)).error, 'somebody the office does not let in made an invite');
  assert.ok((await writeInvite(TRYAN, k.contact, plain.id, s, T0 + 1)).error, 'a template with no {invite} made one');
  assert.equal((await readInvites(s)).length, 0);
  const r = await writeInvite(TRYAN, k.contact, tpl.id, s, T0 + 2);
  const invs = await readInvites(s);
  assert.equal(invs.length, 1);
  const inv = invs[0];
  assert.deepEqual([inv.most, inv.until, inv.note, inv.by, inv.used], [1, T0 + 2 + 30 * 86400000, OFFICE_INVITE.note, 'Ryan', 0]);
  assert.equal(r.subject, 'Welcome, Robin');
  assert.equal(r.body, 'Dear Robin Hood,\nJoin the CB here: ' + INVITE_LINK + inv.code + '\nStimpunks');
  assert.ok(!/Robin|robin/.test(JSON.stringify(invs)), 'the invite says whom it was for');
  assert.deepEqual([JSON.stringify(await s.get('office-contacts', { type: 'json' })), JSON.stringify(await s.get('office-cases', { type: 'json' }))], before,
    'making an invite wrote something onto the contact or the join request');
  // Each press makes a new one.
  await writeInvite(TRYAN, k.contact, tpl.id, s, T0 + 3);
  assert.equal((await readInvites(s)).length, 2);
  // A mailing cannot make one for everybody.
  assert.match((await previewMailing(TRYAN, { pipeline: 'Mutual Aid', stage: (await import('./lib.mjs')).OFFICE_PIPELINES[0].stages[0].name, template: tpl.id }, s)).error, /\{invite\}/);
}));

test('a mailing template refuses a fill-in the office does not know', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.match((await saveTemplate(TRYAN, { ...DEAR, body: 'Dear {frist},' }, s, T0)).error, /\{frist\}/);
  assert.match((await saveTemplate(TRYAN, { ...DEAR, subject: 'About {grant name}' }, s, T0)).error, /\{grant name\}/);
  assert.deepEqual(unknownFillIns('Hi {first} {first} {x} {} {{y}}'), ['{x}', '{}', '{y}']);
  const t = (await saveTemplate(TRYAN, DEAR, s, T0)).template;
  assert.equal(t.stamp, T0);
  assert.match((await saveTemplate(TRYAN, { ...DEAR, name: 'holding NOTE' }, s, T0)).error, /already/);
  const t2 = (await saveTemplate(TRYAN, { ...DEAR, id: t.id, subject: 'Your {grant}' }, s, T0 + 5)).template;
  assert.deepEqual([t2.id, t2.subject, t2.stamp, t2.editedBy], [t.id, 'Your {grant}', T0 + 5, 'Ryan']);
  assertSealed(await s.get('office-templates', { type: 'json' }), ['Dear {first}', 'Holding note']);
  assert.match((await saveTemplate(TSAM, DEAR, s, T0)).error, /directors, board members and administrators/);
  assert.equal(await officeTemplates(TSAM, s), null);
  assert.deepEqual((await officeTemplates(TRYAN, s)).map((x) => x.name), ['Holding note']);
  assert.ok((await removeTemplate(TRYAN, t.id, s)).gone);
  assert.deepEqual(await officeTemplates(TRYAN, s), []);
}));

async function stageFixture(s) {
  const c = {};
  for (const [k, f] of [['ada', { first: 'Ada', last: 'Lovelace', email: 'ada@example.org' }], ['bo', { first: 'Bo', last: 'Peep', email: 'bo@example.org', noEmail: true }],
    ['cy', { first: 'Cy', last: 'Doe' }], ['dee', { first: 'Dee', last: 'Gone', email: 'dee@example.org' }]]) c[k] = (await saveContact(TRYAN, f, s, T0)).contact;
  const g = {};
  const at = { pipeline: 'Mutual Aid', stage: 'Holding' };
  g.ada = (await saveGrant(TRYAN, { ...at, name: 'Aid Request 1: Ada', contact: c.ada.id, amount: 500, submitted: '2026-10-01' }, s, T0)).grant;
  g.bo = (await saveGrant(TRYAN, { ...at, name: 'Aid Request 2: Bo', contact: c.bo.id, submitted: '2026-10-02' }, s, T0)).grant;
  g.cy = (await saveGrant(TRYAN, { ...at, name: 'Aid Request 3: Cy', contact: c.cy.id, submitted: '2026-10-03' }, s, T0)).grant;
  g.none = (await saveGrant(TRYAN, { ...at, name: 'Aid Request 4: nobody', submitted: '2026-10-04' }, s, T0)).grant;
  g.dee = (await saveGrant(TRYAN, { ...at, name: 'Aid Request 5: Dee', contact: c.dee.id, submitted: '2026-10-05' }, s, T0)).grant;
  g.other = (await saveGrant(TRYAN, { pipeline: 'Mutual Aid', stage: 'Received', name: 'Aid Request 6: Ada again', contact: c.ada.id }, s, T0)).grant;
  await removeContact(TRYAN, c.dee.id, s);
  const t = (await saveTemplate(TRYAN, DEAR, s, T0)).template;
  return { c, g, t, at };
}

test('a mailing previews everybody at a stage, leaves out who cannot be emailed, and sends only what was seen', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const { c, g, t, at } = await stageFixture(s);
  for (const [k, v] of Object.values(g).map((x) => [x.name, !!x.id])) assert.ok(v, k + ' was not made');
  const p = await previewMailing(TRYAN, { ...at, template: t.id }, s);
  assert.deepEqual(p.emails.map((e) => [e.name, e.to, e.subject]), [['Ada Lovelace', 'ada@example.org', 'About Aid Request 1: Ada']]);
  assert.equal(p.emails[0].body, 'Dear Ada,\n\nYour $500 request is at Holding in Mutual Aid, sent October 1, 2026.\n\nStimpunks');
  assert.deepEqual(p.left.map((x) => [x.grantName, x.why]), [['Aid Request 2: Bo', 'they asked not to be emailed'], ['Aid Request 3: Cy', 'their contact has no email address'],
    ['Aid Request 4: nobody', 'it has no contact'], ['Aid Request 5: Dee', 'its contact has been deleted']]);
  assert.match((await previewMailing(TSAM, { ...at, template: t.id }, s)).error, /directors, board members and administrators/);
  assert.match((await previewMailing(TRYAN, { pipeline: 'Mutual Aid', stage: 'Nowhere', template: t.id }, s)).error, /stage/);
  const send = { ...at, template: t.id, stamp: t.stamp, grants: [g.ada.id] };
  assert.match((await sendMailing(TRYAN, { ...send, stamp: t.stamp - 1 }, s, T0 + 1)).error, /template has changed/);
  assert.match((await sendMailing(TRYAN, { ...send, grants: [g.ada.id, g.bo.id] }, s, T0 + 1)).error, /has changed since the preview/);
  assert.match((await sendMailing(TSAM, send, s, T0 + 1)).error, /directors, board members and administrators/);
  const r = await sendMailing(TRYAN, send, s, T0 + 2);
  assert.equal(r.count, 1);
  assertSealed(await s.get('office-mailings', { type: 'json' }), ['ada@example.org', 'Dear Ada', 'Aid Request 1']);
  const list = await officeMailings(TRYAN, s);
  assert.deepEqual(list.map((m) => [m.template, m.stage, m.by, m.counts]), [['Holding note', 'Holding', 'Ryan', { waiting: 1, sent: 0, failed: 0, stopped: 0 }]]);
  const m = await officeMailing(TRYAN, r.mailing, s);
  assert.deepEqual(m.emails.map((e) => [e.state, e.name, e.grantName]), [['waiting', 'Ada Lovelace', 'Aid Request 1: Ada']]);
  assert.equal(m.subject, 'About {grant}');
  assert.equal(await officeMailing(TSAM, r.mailing, s), null);
  // Once the template changes, the preview it was sent from no longer stands.
  const t2 = (await saveTemplate(TRYAN, { ...DEAR, id: t.id, body: 'Hello {first}.' }, s, T0 + 3)).template;
  assert.match((await sendMailing(TRYAN, send, s, T0 + 4)).error, /template has changed/);
  assert.ok((await sendMailing(TRYAN, { ...send, stamp: t2.stamp }, s, T0 + 4)).mailing);
}));

test('a mailing narrowed to requests submitted since a day leaves the earlier ones out, and the send must agree', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const { c, g, t, at } = await stageFixture(s);
  const old = (await saveGrant(TRYAN, { ...at, name: 'Aid Request 0: Ada last year', contact: c.ada.id, submitted: '2025-06-01' }, s, T0)).grant;
  const undated = (await saveGrant(TRYAN, { ...at, name: 'Aid Request 7: Ada undated', contact: c.ada.id }, s, T0)).grant;
  const all = await previewMailing(TRYAN, { ...at, template: t.id }, s);
  assert.deepEqual([all.since, all.before], [null, 0]);
  assert.deepEqual(all.emails.map((e) => e.grantName).sort(), ['Aid Request 0: Ada last year', 'Aid Request 1: Ada', 'Aid Request 7: Ada undated']);
  const p = await previewMailing(TRYAN, { ...at, template: t.id, since: '2026-01-01' }, s);
  assert.deepEqual([p.since, p.before], ['2026-01-01', 1]);
  assert.deepEqual(p.emails.map((e) => e.grantName), ['Aid Request 1: Ada']);
  assert.deepEqual(p.left.filter((x) => x.grant === undated.id).map((x) => x.why), ['it has no submitted day']);
  assert.ok(!p.left.some((x) => x.grant === old.id), 'an earlier request was named as left out');
  for (const bad of ['2026-13-01', 'yesterday', '2026-1-1']) assert.match((await previewMailing(TRYAN, { ...at, template: t.id, since: bad }, s)).error, /Submitted since is a day/);
  const send = { ...at, template: t.id, stamp: t.stamp, since: '2026-01-01', grants: [g.ada.id] };
  assert.match((await sendMailing(TRYAN, { ...send, since: null }, s, T0 + 1)).error, /has changed since the preview/, 'a send that dropped the day went to everybody');
  const r = await sendMailing(TRYAN, send, s, T0 + 2);
  assert.equal(r.count, 1);
  assert.equal((await officeMailing(TRYAN, r.mailing, s)).since, '2026-01-01');
  assert.deepEqual((await officeMailings(TRYAN, s)).map((m) => m.since), ['2026-01-01']);
}));

test('the outbox hands the script only waiting emails, and one sent keeps only whose and when', () => withOfficeKey(OFFICE_TEST_KEY, () => withMailKey(MAIL_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const { c, g, t, at } = await stageFixture(s);
  const send = { ...at, template: t.id, stamp: t.stamp, grants: [g.ada.id] };
  const one = (await sendMailing(TRYAN, send, s, T0 + 1)).mailing;
  const box = await mailOutbox(s);
  assert.deepEqual(box.map((e) => [e.to, e.subject]), [['ada@example.org', 'About Aid Request 1: Ada']]);
  assert.deepEqual(Object.keys(box[0]).sort(), ['body', 'id', 'subject', 'to']);
  assert.deepEqual(await mailSentFor({ id: box[0].id }, s, T0 + 2), { ok: true, known: true });
  assert.deepEqual(await mailSentFor({ id: box[0].id, failed: true }, s, T0 + 3), { ok: true, known: true }, 'a second word on one email');
  assert.deepEqual(await mailOutbox(s), []);
  const sealed = unseal(await s.get('office-mailings', { type: 'json' }));
  assert.deepEqual(sealed.mailings[0].emails[0], { id: box[0].id, grant: g.ada.id, contact: c.ada.id, sent: T0 + 2 }, 'a sent email kept more than whose and when');
  assert.deepEqual((await officeMailing(TRYAN, one, s)).emails.map((e) => [e.state, e.when]), [['sent', T0 + 2]]);
  assert.deepEqual(await mailSentFor({ id: 'e' + 'x'.repeat(12) }, s), { ok: true, known: false });
  assert.ok((await mailSentFor({ id: 'nope' }, s)).error);
  // Google would not send one: it is not sent again.
  const two = (await sendMailing(TRYAN, send, s, T0 + 4)).mailing;
  await mailSentFor({ id: (await mailOutbox(s))[0].id, failed: true }, s, T0 + 5);
  assert.deepEqual((await officeMailing(TRYAN, two, s)).counts, { waiting: 0, sent: 0, failed: 1, stopped: 0 });
  // Stopping takes back what is waiting; a mailing with something waiting is not deleted.
  const three = (await sendMailing(TRYAN, send, s, T0 + 6)).mailing;
  assert.match((await removeMailing(TRYAN, three, s)).error, /Stop it first/);
  assert.deepEqual(await stopMailing(TRYAN, three, s, T0 + 7), { stopped: 1 });
  assert.deepEqual(await mailOutbox(s), []);
  assert.ok(!JSON.stringify(unseal(await s.get('office-mailings', { type: 'json' }))).includes('ada@example.org'), 'a stopped email kept its address');
  assert.ok((await removeMailing(TRYAN, three, s)).gone);
  // A contact deleted takes their waiting emails with them.
  const four = (await sendMailing(TRYAN, send, s, T0 + 8)).mailing;
  await removeContact(TRYAN, c.ada.id, s);
  assert.deepEqual(await mailOutbox(s), []);
  assert.deepEqual((await officeMailing(TRYAN, four, s)).emails, []);
  await withMailKey(null, async () => {
    assert.equal(await mailOutbox(s), null);
    assert.equal((await mailSentFor({ id: 'e' + 'x'.repeat(12) }, s)).status, 503);
  });
})));

test('fifteen sent at once: every one recorded as sent', () => withOfficeKey(OFFICE_TEST_KEY, () => withMailKey(MAIL_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const ids = [];
  for (let i = 0; i < 15; i++) {
    const c = (await saveContact(TRYAN, { first: 'P' + i, last: 'Person', email: `p${i}@example.org` }, s, T0)).contact;
    ids.push((await saveGrant(TRYAN, { pipeline: 'Mutual Aid', stage: 'Holding', name: `Aid ${i}`, contact: c.id }, s, T0)).grant.id);
  }
  const t = (await saveTemplate(TRYAN, DEAR, s, T0)).template;
  const m = (await sendMailing(TRYAN, { pipeline: 'Mutual Aid', stage: 'Holding', template: t.id, stamp: t.stamp, grants: ids }, s, T0 + 1)).mailing;
  const box = await mailOutbox(s);
  assert.equal(box.length, 15);
  await Promise.allSettled(box.map((e, i) => mailSentFor({ id: e.id }, s, T0 + 2 + i)));
  assert.deepEqual((await officeMailing(TRYAN, m, s)).counts, { waiting: 0, sent: 15, failed: 0, stopped: 0 }, 'a sent email went unrecorded');
})));

test('fifteen emails to one contact at once: every one kept on their list', () => withOfficeKey(OFFICE_TEST_KEY, () => withMailKey(MAIL_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const ada = (await saveContact(TRYAN, { first: 'Ada', last: 'Lovelace', email: 'ada@example.org' }, s, T0)).contact;
  const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => officeMailIn(mailFrom(100 + i), s, T0 + i)));
  const kept = told.filter((r) => r.status === 'fulfilled' && r.value.kept).length;
  assert.equal((await officeContact(TRYAN, ada.id, s)).mail.length, kept, 'an email told it was kept is missing from its contact');
  assert.equal(kept, 15);
  assert.equal(unseal(await s.get('office-mail-recent', { type: 'json' })).mail.length, 15, 'an email told it was kept is missing from the dashboard’s newest');
})));

/* QuickBooks against a fake Intuit: the tokens endpoint, the query and report
   endpoints and the revoke endpoint, each checking what it is sent. */
async function withQbApp(on, fn) {
  const was = [process.env.CB_QB_CLIENT_ID, process.env.CB_QB_CLIENT_SECRET];
  if (on) { process.env.CB_QB_CLIENT_ID = 'app-id'; process.env.CB_QB_CLIENT_SECRET = 'app-secret-words'; }
  else { delete process.env.CB_QB_CLIENT_ID; delete process.env.CB_QB_CLIENT_SECRET; }
  try { return await fn(); } finally {
    if (was[0] == null) delete process.env.CB_QB_CLIENT_ID; else process.env.CB_QB_CLIENT_ID = was[0];
    if (was[1] == null) delete process.env.CB_QB_CLIENT_SECRET; else process.env.CB_QB_CLIENT_SECRET = was[1];
  }
}
const QB_PL = { Columns: { Column: [{ ColTitle: '' }, { ColTitle: 'Jan 2026' }, { ColTitle: 'Feb 2026' }, { ColTitle: 'Total' }] },
  Rows: { Row: [
    { type: 'Section', group: 'Expenses', Summary: { ColData: [{ value: 'Total Expenses' }, { value: '40.00' }, { value: '10' }, { value: '50' }] } },
    { type: 'Section', group: 'Income', Header: { ColData: [{ value: 'Income' }, { value: '' }, { value: '' }, { value: '' }] },
      Rows: { Row: [{ type: 'Data', ColData: [{ value: 'Donations' }, { value: '100.00' }, { value: '' }, { value: '100.00' }] }] },
      Summary: { ColData: [{ value: 'Total Income' }, { value: '100.00' }, { value: '' }, { value: '100.00' }] } },
    { type: 'Section', group: 'NetIncome', Summary: { ColData: [{ value: 'Net Income' }, { value: '60.00' }, { value: '-10.00' }, { value: '50.00' }] } }] } };
function fakeIntuit(seen) {
  const res = (body, ok = true) => ({ ok, status: ok ? 200 : 400, json: async () => body });
  return async (url, opts = {}) => {
    const u = new URL(url);
    seen.push(u.origin + u.pathname);
    if (u.href === 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer') {
      assert.equal(opts.headers.authorization, 'Basic ' + Buffer.from('app-id:app-secret-words').toString('base64'));
      const f = new URLSearchParams(opts.body);
      if (f.get('grant_type') === 'authorization_code' && f.get('code') === 'the-code' && f.get('redirect_uri') === 'https://stimpunks.world/cb/office/quickbooks') {
        return res({ access_token: 'access-one', refresh_token: 'refresh-one', expires_in: 3600, x_refresh_token_expires_in: 8640000 });
      }
      if (f.get('grant_type') === 'refresh_token' && f.get('refresh_token') === 'refresh-one') {
        return res({ access_token: 'access-two', refresh_token: 'refresh-two', expires_in: 3600, x_refresh_token_expires_in: 8640000 });
      }
      return res({ error: 'invalid_grant' }, false);
    }
    if (u.origin === 'https://quickbooks.api.intuit.com') {
      assert.equal(opts.headers.authorization, 'Bearer access-two', 'the books were read without a fresh token');
      assert.equal(u.searchParams.get('minorversion'), '75');
      if (u.pathname === '/v3/company/9130354700000001/query') {
        const q = u.searchParams.get('query');
        assert.match(q, /where TxnDate >= '2026-09-19'/);
        if (/from Deposit/.test(q)) return res({ QueryResponse: { Deposit: [
          { Id: '7', TxnDate: '2026-10-17', TotalAmt: 150, DepositToAccountRef: { name: 'Checking' }, PrivateNote: 'a memo nobody keeps',
            Line: [{ Amount: 100, LinkedTxn: [{ TxnId: '5', TxnType: 'Payment' }] }, { Amount: 50, DepositLineDetail: { Entity: { name: 'Givebutter' } } }] }] } });
        if (/from Payment/.test(q)) return res({ QueryResponse: { Payment: [{ Id: '5', TxnDate: '2026-10-15', TotalAmt: 100, CustomerRef: { name: 'Ada Lovelace' }, DepositToAccountRef: { name: 'Undeposited Funds' } }] } });
        if (/from SalesReceipt/.test(q)) return res({ QueryResponse: {} });
      }
      if (u.pathname === '/v3/company/9130354700000001/reports/ProfitAndLoss') {
        assert.deepEqual([u.searchParams.get('start_date'), u.searchParams.get('end_date'), u.searchParams.get('summarize_column_by')], ['2026-01-01', '2026-10-18', 'Month']);
        return res(QB_PL);
      }
    }
    if (u.href === 'https://developer.api.intuit.com/v2/oauth2/tokens/revoke') {
      assert.equal(JSON.parse(opts.body).token, 'refresh-two', 'the refresh token Intuit last gave was not the one revoked');
      return res({});
    }
    return res({}, false);
  };
}

test('QuickBooks: a state works once and only fresh, the tokens are sealed and never sent, and the books are read as money in and profit and loss', () => withOfficeKey(OFFICE_TEST_KEY, () => withQbApp(true, async () => {
  const s = memoryStore({ etagOnRead: true });
  const seen = [], fake = fakeIntuit(seen), site = 'https://stimpunks.world';
  assert.equal((await qbConnect(TSAM, site, s, T0)).error, 'office');
  const back = (go, extra = {}) => { const st = new URL(go).searchParams.get('state'); return new URLSearchParams({ code: 'the-code', state: st, realmId: '9130354700000001', ...extra }); };
  let go = (await qbConnect(TRYAN, site, s, T0)).go;
  const q = new URL(go).searchParams;
  assert.equal(new URL(go).origin + new URL(go).pathname, 'https://appcenter.intuit.com/connect/oauth2');
  assert.deepEqual([q.get('client_id'), q.get('response_type'), q.get('scope'), q.get('redirect_uri')], ['app-id', 'code', QB_SCOPE, site + '/cb/office/quickbooks']);
  // A state too old is refused, and so is a wrong one.
  assert.equal((await qbCallback(back(go), site, s, T0 + 11 * 60 * 1000, fake)).error, 'state');
  go = (await qbConnect(TRYAN, site, s, T0)).go;
  assert.equal((await qbCallback(back(go, { state: 'not-the-state' }), site, s, T0 + 1000, fake)).error, 'state');
  go = (await qbConnect(TRYAN, site, s, T0)).go;
  assert.equal((await qbCallback(back(go, { realmId: '../../x' }), site, s, T0 + 1000, fake)).error, 'code');
  go = (await qbConnect(TRYAN, site, s, T0)).go;
  assert.deepEqual(await qbCallback(back(go), site, s, T0 + 1000, fake), { connected: true });
  assert.equal((await qbCallback(back(go), site, s, T0 + 2000, fake)).error, 'state', 'a state worked twice');
  assertSealed(await s.get('office-qb', { type: 'json' }), ['access-one', 'refresh-one', '9130354700000001']);
  // Read two hours on: the access token is refreshed and Intuit's new refresh token kept.
  const read = await officeQuickBooks(s, T0 + 2 * 3600 * 1000, fake);
  assert.equal(read.count, 2);
  const st = await qbStatus(TRYAN, s);
  assert.deepEqual([st.ready, st.connected, st.by], [true, true, 'Ryan']);
  assert.deepEqual(st.books.moneyIn, [
    { kind: 'Deposit', id: '7', day: '2026-10-17', amount: 50, moved: 100, from: 'Givebutter', account: 'Checking' },
    { kind: 'Payment', id: '5', day: '2026-10-15', amount: 100, moved: 0, from: 'Ada Lovelace', account: 'Undeposited Funds' }]);
  assert.deepEqual(st.books.profitLoss, { months: [{ month: 'Jan 2026', income: 100, expense: 40, net: 60 }, { month: 'Feb 2026', income: 0, expense: 10, net: -10 }],
    accounts: [{ account: 'Donations', total: 100 }] });
  const said = JSON.stringify(st);
  for (const w of ['access-two', 'refresh-two', '9130354700000001', 'a memo nobody keeps']) assert.ok(!said.includes(w), `the page was sent ${w}`);
  assertSealed(await s.get('office-qb', { type: 'json' }), ['access-two', 'refresh-two']);
  assertSealed(await s.get('office-qb-books', { type: 'json' }), ['Givebutter', 'Ada Lovelace']);
  assert.equal(await qbStatus(TSAM, s), null);
  assert.equal((await qbDisconnect(TSAM, s, fake)).error, 'office');
  assert.ok((await qbDisconnect(TRYAN, s, fake)).gone);
  assert.ok(seen.includes('https://developer.api.intuit.com/v2/oauth2/tokens/revoke'));
  const after = await qbStatus(TRYAN, s);
  assert.deepEqual([after.connected, after.books], [false, null]);
  assert.equal((await officeQuickBooks(s, T0, fake)).error, 'not-connected');
  assert.ok(seen.every((x) => /^https:\/\/(oauth\.platform\.intuit\.com|quickbooks\.api\.intuit\.com|developer\.api\.intuit\.com)\//.test(x)), 'the office asked somewhere other than Intuit');
})));

test('QuickBooks: without our Intuit app in the settings, or without the office key, nothing runs', () => withOfficeKey(OFFICE_TEST_KEY, () => withQbApp(false, async () => {
  const s = memoryStore({ etagOnRead: true });
  assert.equal((await qbConnect(TRYAN, 'https://stimpunks.world', s, T0)).error, 'not-set-up');
  assert.equal((await officeQuickBooks(s, T0, fakeIntuit([]))).error, 'not-set-up');
  assert.equal((await qbStatus(TRYAN, s)).ready, false);
  await withQbApp(true, () => withOfficeKey(null, async () => assert.equal((await qbConnect(TRYAN, 'https://stimpunks.world', s, T0)).error, 'not-set-up')));
})));

/* Givebutter against a fake of its API: two pages of gifts, plans and
   campaigns, each request checked for the key and the filter, and every gift
   carrying the donor's name, email and address, which must never be kept. */
async function withGbKey(key, fn) {
  const was = process.env.CB_GIVEBUTTER_KEY;
  if (key == null) delete process.env.CB_GIVEBUTTER_KEY; else process.env.CB_GIVEBUTTER_KEY = key;
  try { return await fn(); } finally { if (was == null) delete process.env.CB_GIVEBUTTER_KEY; else process.env.CB_GIVEBUTTER_KEY = was; }
}
function fakeGivebutter(seen, o = {}) {
  const res = (body, ok = true) => ({ ok, status: ok ? 200 : 401, json: async () => body });
  const who = { first_name: 'Ada', last_name: 'Lovelace', email: 'ada@example.org', phone: '5125550100', address: { address_1: '1 Byron Lane' }, giving_space: { name: 'Ada Lovelace', message: 'For the street' } };
  const gift = (id, at, amount, extra = {}) => ({ id, number: 'TX' + id, transacted_at: at, amount, payout: amount - 1, campaign_title: 'Build a Counterculture of Care', status: 'succeeded', plan_id: null, is_recurring: false, refunded_at: null, ...who, ...extra });
  const pages = {
    'transactions?page=1': { data: [gift(1, '2026-10-17T15:00:00Z', 25), gift(2, '2026-10-02T15:00:00Z', 10, { plan_id: 77, is_recurring: true }), gift(3, '2026-10-10T15:00:00Z', 50, { status: 'failed' })],
      links: { next: 'https://elsewhere.example/v1/transactions?page=2' }, meta: { current_page: 1, last_page: o.endless ? 999 : 2 } },
    'transactions?page=2': { data: [gift(4, '2026-09-10T15:00:00Z', 15), gift(5, '2026-09-01T15:00:00Z', 40, { refunded_at: '2026-09-02T00:00:00Z' }), gift(6, '2025-09-15T15:00:00Z', 99)], links: { next: null }, meta: { current_page: 2, last_page: o.endless ? 999 : 2 } },
    plans: { data: [{ id: 77, status: 'active', frequency: 'monthly', amount: '10.00', ...who }, { id: 78, status: 'active', frequency: 'yearly', amount: '120.00' },
      { id: 79, status: 'cancelled', frequency: 'monthly', amount: '15.00' }, { id: 80, status: 'past_due_failed', frequency: 'monthly', amount: '50.00' }], links: { next: null }, meta: { last_page: 1 } },
    campaigns: { data: [{ id: 317854, title: 'Build a Counterculture of Care', goal: 10000, raised: 5962, donors: 67, status: 'active' }, { id: 1, title: 'General Donations', goal: null, raised: 0, donors: 0, status: 'active' }], links: { next: null }, meta: { last_page: 1 } },
  };
  return async (url, opts = {}) => {
    const u = new URL(url);
    seen.push({ host: u.origin, path: u.pathname, method: opts.method || 'GET' });
    assert.equal(opts.headers.authorization, 'Bearer gb-test-key', 'a request to Givebutter without the key');
    if (u.origin !== 'https://api.givebutter.com') return res({}, false);
    if (u.pathname === '/v1/transactions') {
      assert.match(u.searchParams.get('transactedAfter') || '', /^2025-10-30T/, 'a page of gifts asked without the day it starts from');
      const n = +u.searchParams.get('page');
      return res(pages['transactions?page=' + (o.endless ? 1 + (n % 2) : n)]);
    }
    if (u.pathname === '/v1/plans') return res(pages.plans);
    if (u.pathname === '/v1/campaigns') return res(pages.campaigns);
    return res({}, false);
  };
}

test('Givebutter: read with our key, every page followed on its own host, and no donor named, emailed or addressed', () => withOfficeKey(OFFICE_TEST_KEY, () => withGbKey('gb-test-key', async () => {
  const s = memoryStore({ etagOnRead: true });
  const seen = [];
  const now = Date.parse('2026-10-18T18:00:00Z');
  assert.deepEqual(await officeGivebutter(s, now, fakeGivebutter(seen)), { read: now, count: 5 });
  assert.ok(seen.every((x) => x.host === 'https://api.givebutter.com' && x.method === 'GET'), 'the office asked somewhere else, or wrote');
  assert.equal(seen.filter((x) => x.path === '/v1/transactions').length, 2, 'the second page of gifts was not followed');
  const blob = await s.get('office-givebutter', { type: 'json' });
  assertSealed(blob, ['Lovelace', 'example.org', 'Byron', '5125550100', 'For the street']);
  const st = await gbStatus(TRYAN, s);
  assert.equal(st.ready, true);
  const b = st.books;
  assert.deepEqual([b.day, b.from], ['2026-10-18', '2025-11-01']);
  assert.deepEqual(b.gifts.map((g) => [g.id, g.day, g.amount, g.payout, g.recurring, g.ok]),
    [['1', '2026-10-17', 25, 24, false, true], ['3', '2026-10-10', 50, 49, false, false], ['2', '2026-10-02', 10, 9, true, true], ['4', '2026-09-10', 15, 14, false, true], ['5', '2026-09-01', 40, 39, false, false]],
    'a gift was read wrongly, or one from before the year was kept');
  for (const g of b.gifts) assert.deepEqual(Object.keys(g).sort(), ['amount', 'campaign', 'day', 'id', 'ok', 'payout', 'recurring'], 'a gift keeps more than the office says it does');
  const said = JSON.stringify(st);
  for (const w of ['Ada', 'Lovelace', 'example.org', 'Byron', '5125550100', 'For the street']) assert.ok(!said.includes(w), `the dashboard was sent ${w}`);
  assert.deepEqual(b.monthly, { active: 2, aMonth: 20, unknown: 0, pastDue: 1 });
  assert.deepEqual(b.campaigns.map((c) => [c.title, c.goal, c.raised, c.donors]), [['Build a Counterculture of Care', 10000, 5962, 67], ['General Donations', null, 0, 0]]);
  assert.equal(await gbStatus(TSAM, s), null);
  // A list that never ends is refused rather than half read, and what was read before stays.
  const endless = [];
  assert.equal((await officeGivebutter(s, now + 1000, fakeGivebutter(endless, { endless: true }))).error, 'read');
  assert.equal(endless.filter((x) => x.path === '/v1/transactions').length, 50, 'the office did not stop at GB_PAGES');
  assert.equal((await gbStatus(TRYAN, s)).books.read, now);
})));

test('Givebutter: without the key, or without the office key, nothing is asked', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const seen = [];
  await withGbKey(null, async () => {
    assert.equal((await officeGivebutter(s, Date.now(), fakeGivebutter(seen))).error, 'not-set-up');
    assert.deepEqual(await gbStatus(TRYAN, s), { ready: false, books: null });
  });
  await withGbKey('gb-test-key', () => withOfficeKey(null, async () => assert.equal((await officeGivebutter(s, Date.now(), fakeGivebutter(seen))).error, 'not-set-up')));
  assert.equal(seen.length, 0, 'Givebutter was asked without a key');
}));

test('Givebutter: a director\'s press sends a join request\'s name, email and the lists they said yes to, and nothing else', () => withOfficeKey(OFFICE_TEST_KEY, () => withGbKey('gb-test-key', async () => {
  const s = memoryStore({ etagOnRead: true });
  const asks = (m, n) => `**Tell us a bit about yourself and why you would like to join our community.**\nI like otters, and my phone is 5125550100.\n\n`
    + `**Would you like to be added to our Members Only mailing list?**\n${m}\n\n**Would you like to be added to our Monthly Newsletter mailing list?**\n${n}\n\n**City**\nAustin`;
  await officeIntake({ type: 'community', entry: 960, email: 'robin@example.org', name: 'Robin Hood', first: 'Robin', last: 'Hood', message: asks('Yes', 'No') }, s, T0, TMODS);
  await officeIntake({ type: 'community', entry: 961, email: 'sam@example.org', name: 'Sam', message: asks('No', 'No') }, s, T0 + 1, TMODS);
  await officeIntake({ type: 'connection', entry: 962, email: 'lou@example.org', name: 'Lou', message: asks('Yes', 'Yes') }, s, T0 + 2);
  const cases = await readCases(s);
  const k = cases.find((x) => x.form === 960), none = cases.find((x) => x.form === 961), conn = cases.find((x) => x.form === 962);
  assert.deepEqual(caseLists(k).lists, [{ tag: 'Members', yes: true }, { tag: 'Newsletter Mailing List', yes: false }]);
  assert.equal(caseLists(conn), null, 'a case that is not a join request offered our lists');
  const sent = [];
  let ok = true, made = new Date(T0 + 5).toISOString();
  const fake = async (url, opts = {}) => {
    sent.push({ url, method: opts.method || 'GET', auth: opts.headers && opts.headers.authorization, body: opts.body ? JSON.parse(opts.body) : null });
    return { ok, status: ok ? 200 : 422, json: async () => (ok ? { id: 1, first_name: 'Robin', created_at: made }
      : { message: 'The given data was invalid.', errors: { first_name: ['The first name field is required when last name is present.'] } }) };
  };
  assert.ok((await gbJoin(TSAM, k.id, s, T0 + 3, fake)).error, 'somebody the office does not let in sent a join request to Givebutter');
  assert.ok((await gbJoin(TRYAN, none.id, s, T0 + 3, fake)).error, 'a join request that said no to every list was sent');
  assert.ok((await gbJoin(TRYAN, conn.id, s, T0 + 3, fake)).error, 'a case that is not a join request was sent');
  await withGbKey(null, async () => assert.ok((await gbJoin(TRYAN, k.id, s, T0 + 3, fake)).error, 'sent without the key'));
  assert.equal(sent.length, 0, 'Givebutter was asked when nothing should have been sent');
  // Givebutter refusing changes nothing on the join request.
  ok = false;
  assert.match((await gbJoin(TRYAN, k.id, s, T0 + 4, fake)).error, /422: The first name field is required when last name is present\./, 'Givebutter\'s own reason was not passed on');
  assert.equal((await officeCase(TRYAN, k.id, s)).lists.sent, null, 'a refused send was kept as sent');
  ok = true;
  const r = await gbJoin(TRYAN, k.id, s, T0 + 5, fake);
  assert.deepEqual(r.sent, { tags: ['Members'], t: T0 + 5 });
  assert.equal(r.named, true);
  assert.equal(r.already, false, 'a contact Givebutter made on the press was called already there');
  const last = sent[sent.length - 1];
  assert.deepEqual([last.url, last.method, last.auth], ['https://api.givebutter.com/v1/contacts', 'POST', 'Bearer gb-test-key']);
  assert.deepEqual(last.body, { first_name: 'Robin', last_name: 'Hood', primary_email: 'robin@example.org', tags: ['Members'], email_subscription: true },
    'Givebutter was sent more, or other, than a name, an email, the lists said yes to and wanting our emails');
  const said = JSON.stringify(sent);
  for (const w of ['otters', '5125550100', 'Austin', 'Newsletter', 'Ryan']) assert.ok(!said.includes(w), `Givebutter was sent ${w}`);
  // The join request keeps which lists were sent and when, sealed, and its page says so.
  assertSealed(await s.get('office-cases', { type: 'json' }), ['Robin', 'Members']);
  assert.deepEqual((await officeCase(TRYAN, k.id, s)).lists, { lists: [{ tag: 'Members', yes: true }, { tag: 'Newsletter Mailing List', yes: false }], sent: { tags: ['Members'], t: T0 + 5 }, ready: true });
  // One name alone, which the Join form files as a last name, and no name, which names a contact by
  // their address: Givebutter keeps a contact by both names or by an email with none, so neither name goes.
  await officeIntake({ type: 'community', entry: 963, email: 'jo@example.org', name: 'Jo', first: '', last: 'Jo', message: asks('Yes', 'Yes') }, s, T0 + 6, TMODS);
  await officeIntake({ type: 'community', entry: 964, email: 'kim@example.org', message: asks('Yes', 'No') }, s, T0 + 7, TMODS);
  // Somebody added to Givebutter by hand the day before: Givebutter answers with that contact.
  made = new Date(T0 + 8 - 86400000).toISOString();
  for (const [entry, email, tags] of [[963, 'jo@example.org', ['Members', 'Newsletter Mailing List']], [964, 'kim@example.org', ['Members']]]) {
    const one = (await readCases(s)).find((x) => x.form === entry);
    const r1 = await gbJoin(TRYAN, one.id, s, T0 + 8, fake);
    assert.equal(r1.named, false, `entry ${entry} was sent as named`);
    assert.equal(r1.already, true, `entry ${entry}: a contact Givebutter already had was not called already there`);
    assert.deepEqual(sent[sent.length - 1].body, { primary_email: email, tags, email_subscription: true }, `entry ${entry} sent a name Givebutter would refuse alone`);
  }
})));

/* ── The Members page, from a join request ───────────────────────────────── */
async function withWpKey(user, pass, fn) {
  const was = [process.env.CB_WP_USER, process.env.CB_WP_APP_PASSWORD];
  if (user == null) delete process.env.CB_WP_USER; else process.env.CB_WP_USER = user;
  if (pass == null) delete process.env.CB_WP_APP_PASSWORD; else process.env.CB_WP_APP_PASSWORD = pass;
  try { return await fn(); } finally {
    if (was[0] == null) delete process.env.CB_WP_USER; else process.env.CB_WP_USER = was[0];
    if (was[1] == null) delete process.env.CB_WP_APP_PASSWORD; else process.env.CB_WP_APP_PASSWORD = was[1];
  }
}
const WP_PAGE = '<!-- wp:paragraph -->\n<p>Want to be listed?&nbsp;<a href="https://stimpunks.org/community/join/">Join our community.</a></p>\n<!-- /wp:paragraph -->\n\n'
  + '<!-- wp:list -->\n<ul class="wp-block-list"><!-- wp:list-item -->\n<li><a href="https://stimpunks.org/about/"><strong>Ryan Boren</strong></a> - Ryan helped start WordPress.</li>\n<!-- /wp:list-item -->\n\n'
  + '<!-- wp:list-item -->\n<li><strong>Red</strong> - A mama with 3 teens &amp; 2 doggos.</li>\n<!-- /wp:list-item --></ul>\n<!-- /wp:list -->\n\n'
  + '<!-- wp:heading {"anchor":"h-member-map"} -->\n<h2 id="h-member-map" class="wp-block-heading">Member Map</h2>\n<!-- /wp:heading -->';
function fakeWordPress(o = {}) {
  const wp = { raw: o.raw || WP_PAGE, modified: '2026-10-23T06:33:23', sent: [], caps: o.caps || { edit_pages: true, edit_published_pages: true, edit_others_pages: true, unfiltered_html: true } };
  wp.fetch = async (url, opts = {}) => {
    const u = new URL(url), method = opts.method || 'GET';
    wp.sent.push({ url, method, auth: opts.headers && opts.headers.authorization, body: opts.body || null });
    const res = (body, status = 200) => ({ ok: status < 300, status, json: async () => body });
    if (o.status) return res({}, o.status);
    if (u.pathname === '/wp-json/wp/v2/users/me' && method === 'GET') return res({ capabilities: wp.caps });
    if (u.pathname === '/wp-json/wp/v2/pages/85372' && method === 'GET') return res({ content: { raw: wp.raw }, modified_gmt: wp.modified });
    if (u.pathname === '/wp-json/wp/v2/pages/85372' && method === 'POST') {
      wp.raw = JSON.parse(opts.body).content + (o.alters ? '\n' : ''); wp.modified = '2026-10-23T09:00:00';
      return res({ content: { raw: wp.raw } });
    }
    return res({}, 404);
  };
  return wp;
}

test('the Members page: a line is built from words alone, and a link is only ever to the web', () => {
  const l = listingLine({ name: '  Robin   <img src=x onerror=alert(1)> ', link: 'robin.example.org/about', words: 'Otters &\nkelp <!-- /wp:list --> forever' });
  assert.equal(l.html, '<li><a href="https://robin.example.org/about"><strong>Robin &lt;img src=x onerror=alert(1)&gt;</strong></a> - Otters &amp; kelp &lt;!-- /wp:list --&gt; forever</li>');
  assert.equal(listingLine({ name: 'Sam' }).html, '<li><strong>Sam</strong></li>', 'a line with no link or words is the name alone');
  assert.equal(listingLine({ name: 'Lou', link: 'https://lou.example.org/"><script>' }).html.includes('"><script>'), false, 'a link broke out of its attribute');
  for (const bad of ['javascript:alert(1)', 'data:text/html,hi', 'ftp://lou.example.org/', 'https://me:pw@lou.example.org/', 'not a site', 'localhost'])
    assert.ok(listingLine({ name: 'Lou', link: bad }).error, `${bad} became a link`);
  assert.ok(listingLine({ name: 'lou@example.org' }).error, 'an email address went on the page as a name');
  assert.ok(listingLine({ name: '' }).error, 'a line with no name');
  assert.ok(listingLine({ name: 'Lou', words: 'x'.repeat(LISTING_MAX.words + 1) }).error, 'words over the limit');
  const two = WP_PAGE + '\n\n<!-- wp:list -->\n<ul class="wp-block-list"><!-- wp:list-item -->\n<li>Another</li>\n<!-- /wp:list-item --></ul>\n<!-- /wp:list -->';
  assert.ok(membersList(two).error, 'a page with two lists was written into');
  assert.deepEqual(membersList(WP_PAGE).names, ['Ryan Boren', 'Red']);
});

test('the Members page: a director looks, tidies and adds one line, and nothing else of the join request goes', () => withOfficeKey(OFFICE_TEST_KEY, () => withWpKey('office', 'abcd efgh ijkl mnop', async () => {
  const s = memoryStore({ etagOnRead: true });
  const form = (words, link) => `**Tell us a bit about yourself and why you would like to join our community.**\nI like otters, and my phone is 5125550100.\n\n`
    + `**Would you like to be added to our Members Only mailing list?**\nNo\n\n**City**\nAustin`
    + (words ? `\n\n**Profile text for the Members page (optional)**\n${words}` : '') + (link ? `\n\n**Website or Blog**\n${link}` : '')
    + `\n\n**Profile text for the Organizations page**\nWe run a kelp co-op.\n\n**Organization Website or Blog**\nhttps://kelp.example.org`;
  await officeIntake({ type: 'community', entry: 970, email: 'robin@example.org', name: 'Robin Hood', first: 'Robin', last: 'Hood', message: form('I keep otters.\n\nAnd kelp.', 'robin.example.org') }, s, T0, TMODS);
  await officeIntake({ type: 'community', entry: 971, email: 'sam@example.org', name: 'Sam', message: form('', '') }, s, T0 + 1, TMODS);
  await officeIntake({ type: 'community', entry: 972, email: 'red@example.org', name: 'Red', message: form('Saucy.', '') }, s, T0 + 2, TMODS);
  await officeIntake({ type: 'connection', entry: 973, email: 'lou@example.org', name: 'Lou', message: form('Hi.', '') }, s, T0 + 3);
  const cases = await readCases(s);
  const k = cases.find((x) => x.form === 970), none = cases.find((x) => x.form === 971), red = cases.find((x) => x.form === 972), conn = cases.find((x) => x.form === 973);
  assert.deepEqual(caseListing(k).gave, { name: 'Robin Hood', link: 'robin.example.org', words: 'I keep otters. And kelp.' },
    'the line was read from somewhere other than the Members page part of the form');
  assert.equal(caseListing(none).asked, false, 'a join request that left the Members page part empty asked to be on it');
  assert.equal(caseListing(conn), null, 'a case that is not a join request offered the Members page');
  assert.equal((await officeCase(TRYAN, k.id, s)).listing.ready, true);

  const wp = fakeWordPress();
  assert.ok((await listingLook(TSAM, k.id, 'Robin Hood', s, wp.fetch)).error, 'somebody the office does not let in read the page');
  assert.ok((await listingAdd(TSAM, k.id, { name: 'Robin Hood', modified: wp.modified }, s, T0 + 4, wp.fetch)).error, 'somebody the office does not let in wrote the page');
  assert.ok((await listingLook(TRYAN, none.id, 'Sam', s, wp.fetch)).error, 'a join request that did not ask was looked at');
  assert.ok((await listingLook(TRYAN, conn.id, 'Lou', s, wp.fetch)).error, 'a case that is not a join request was looked at');
  await withWpKey(null, null, async () => assert.ok((await listingLook(TRYAN, k.id, 'Robin Hood', s, wp.fetch)).error, 'looked without the key'));
  assert.equal(wp.sent.length, 0, 'stimpunks.org was asked when nothing should have been');

  const look = await listingLook(TRYAN, k.id, 'Robin Hood', s, wp.fetch);
  assert.deepEqual(look, { modified: '2026-10-23T06:33:23', after: 'Red', there: false });
  assert.equal((await listingLook(TRYAN, red.id, ' red ', s, wp.fetch)).there, true, 'somebody already on the page was not noticed');
  assert.ok(wp.sent.every((x) => x.method === 'GET'), 'looking changed something');
  assert.equal(wp.sent[0].auth, 'Basic ' + Buffer.from('office:abcd efgh ijkl mnop').toString('base64'));
  assert.ok(wp.sent.every((x) => x.url.startsWith('https://stimpunks.org/wp-json/wp/v2/')), 'the office asked somewhere other than stimpunks.org');

  const line = { name: 'Robin Hood', link: 'https://robin.example.org/', words: 'I keep otters and kelp.' };
  assert.ok((await listingAdd(TRYAN, k.id, line, s, T0 + 5, wp.fetch)).error, 'added without a look');
  assert.ok((await listingAdd(TRYAN, red.id, { name: 'Red', words: 'Saucy.', modified: look.modified }, s, T0 + 5, wp.fetch)).error, 'a second Red went on the page');
  const stale = await listingAdd(TRYAN, k.id, { ...line, modified: '2026-10-22T00:00:00' }, s, T0 + 5, wp.fetch);
  assert.ok(stale.error && stale.changed && stale.changed.after === 'Red', 'a page changed since the look was written');
  const weak = fakeWordPress({ caps: { edit_pages: true, edit_published_pages: true, edit_others_pages: true, unfiltered_html: false } });
  assert.match((await listingAdd(TRYAN, k.id, { ...line, modified: look.modified }, s, T0 + 5, weak.fetch)).error, /stripping/);
  assert.ok((await listingAdd(TRYAN, k.id, { ...line, modified: look.modified }, s, T0 + 5, fakeWordPress({ status: 401 }).fetch)).error.includes('401'));
  assert.ok(wp.sent.every((x) => x.method === 'GET') && weak.sent.every((x) => x.method === 'GET'), 'a refused add wrote to the page');
  assert.equal((await officeCase(TRYAN, k.id, s)).listing.added, null, 'a refused add was kept as added');

  const r = await listingAdd(TRYAN, k.id, { ...line, modified: look.modified }, s, T0 + 6, wp.fetch);
  assert.deepEqual(r, { added: { t: T0 + 6 }, address: 'https://stimpunks.org/community/individuals/', kept: true, gone: false });
  const posts = wp.sent.filter((x) => x.method === 'POST');
  assert.equal(posts.length, 1);
  assert.equal(posts[0].url, 'https://stimpunks.org/wp-json/wp/v2/pages/85372?context=edit&_fields=content');
  const put = JSON.parse(posts[0].body);
  assert.deepEqual(Object.keys(put), ['content'], 'more than the page\'s content was sent');
  const end = WP_PAGE.indexOf('</ul>\n<!-- /wp:list -->');
  assert.equal(put.content, WP_PAGE.slice(0, end) + '\n\n<!-- wp:list-item -->\n<li><a href="https://robin.example.org/"><strong>Robin Hood</strong></a> - I keep otters and kelp.</li>\n<!-- /wp:list-item -->' + WP_PAGE.slice(end),
    'the page was changed anywhere but by that one line at the end of its list');
  for (const w of ['robin@example.org', 'Austin', '5125550100', 'like otters', 'kelp co-op', 'Ryan,']) assert.ok(!posts[0].body.includes(w), `stimpunks.org was sent ${w}`);
  assertSealed(await s.get('office-cases', { type: 'json' }), ['Robin', 'otters']);
  assert.deepEqual((await officeCase(TRYAN, k.id, s)).listing.added, { t: T0 + 6 });
  const again = await listingAdd(TRYAN, k.id, { ...line, modified: wp.modified }, s, T0 + 7, wp.fetch);
  assert.match(again.error, /already/, 'a join request already on the page was added again');
  assert.equal(wp.sent.filter((x) => x.method === 'POST').length, 1);
  // WordPress changing what it saves is said, and the line is still kept as added.
  const red2 = fakeWordPress({ alters: true });
  const look2 = await listingLook(TRYAN, red.id, 'Red Two', s, red2.fetch);
  assert.equal((await listingAdd(TRYAN, red.id, { name: 'Red Two', words: 'Saucy.', modified: look2.modified }, s, T0 + 8, red2.fetch)).kept, false);
})));

/* ── The Organizations page, from a join request ─────────────────────────── */
const pngChunk = (type, data) => { const d = Buffer.from(data), h = Buffer.alloc(8); h.writeUInt32BE(d.length, 0); h.write(type, 4, 'latin1'); return Buffer.concat([h, d, Buffer.alloc(4)]); };
const TEST_PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), pngChunk('IHDR', Buffer.alloc(13, 1)),
  pngChunk('tEXt', 'GPS\x0040.7,-74.0'), pngChunk('eXIf', 'MM\x00*camera'), pngChunk('IDAT', 'pixels'), pngChunk('IEND', '')]);
const jpegSeg = (m, data) => { const d = Buffer.from(data, 'latin1'), h = Buffer.from([0xff, m, 0, 0]); h.writeUInt16BE(d.length + 2, 2); return Buffer.concat([h, d]); };
const TEST_JPEG = Buffer.concat([Buffer.from([0xff, 0xd8]), jpegSeg(0xe0, 'JFIF\x00\x01\x02'), jpegSeg(0xe1, 'Exif\x00\x00GPS 40.7'), jpegSeg(0xe1, 'http://ns.adobe.com/xap/1.0/\x00<x/>'),
  jpegSeg(0xed, 'Photoshop 3.0\x00IPTC city'), jpegSeg(0xfe, 'a comment'), jpegSeg(0xdb, 'quant'), Buffer.from([0xff, 0xda, 0, 2]), Buffer.from('scan\xff\x00data', 'latin1'), Buffer.from([0xff, 0xd9])]);
const webpChunk = (type, data) => { const d = Buffer.from(data, 'latin1'), h = Buffer.alloc(8); h.write(type, 0, 'latin1'); h.writeUInt32LE(d.length, 4); return Buffer.concat([h, d, d.length & 1 ? Buffer.alloc(1) : Buffer.alloc(0)]); };
const webpOf = (...chunks) => { const body = Buffer.concat([Buffer.from('WEBP'), ...chunks]), h = Buffer.alloc(8); h.write('RIFF', 0, 'latin1'); h.writeUInt32LE(body.length, 4); return Buffer.concat([h, body]); };
const TEST_WEBP = webpOf(webpChunk('VP8X', '\x0c\x00\x00\x00\x01\x00\x00\x01\x00\x00'), webpChunk('VP8 ', 'frame'), webpChunk('EXIF', 'GPS 40.7'), webpChunk('XMP ', '<x/>'));
const ORG_PAGE = '<!-- wp:paragraph -->\n<p>If your organization belongs in this web, tell us why when you&nbsp;<a href="https://stimpunks.org/community/join/">fill out the join form</a>.</p>\n<!-- /wp:paragraph -->\n\n'
  + '<!-- wp:group {"style":{},"backgroundColor":"custom-color-6","layout":{"type":"constrained"}} -->\n<div class="wp-block-group has-custom-color-6-background-color has-background"><!-- wp:paragraph -->\n<p><a href="https://www.autisticrealms.com/">Autistic Realms</a> - Helen’s.</p>\n<!-- /wp:paragraph --></div>\n<!-- /wp:group -->\n\n'
  + '<!-- wp:group {"style":{},"backgroundColor":"custom-color-2","layout":{"type":"constrained"}} -->\n<div class="wp-block-group has-custom-color-2-background-color has-background"><!-- wp:paragraph -->\n<p><a href="https://www.wearelewisham.com/organisations/stimmusicarts/">Stim Music Arts</a> - A collective &amp; a label.</p>\n<!-- /wp:paragraph --></div>\n<!-- /wp:group -->\n\n'
  + '<!-- wp:paragraph -->\n<p></p>\n<!-- /wp:paragraph -->';
const LOGO_AT = 'https://stimpunks.org/wp-content/uploads/wpforms/85366-0123456789abcdef0123456789abcdef/';
function fakeOrgPress(o = {}) {
  const wp = { raw: o.raw || ORG_PAGE, modified: '2026-10-23T06:00:00', sent: [], logos: o.logos || { 'kelp-logo-aa.png': TEST_PNG, 'kelp-photo-bb.jpg': TEST_JPEG },
    caps: o.caps || { edit_pages: true, edit_published_pages: true, edit_others_pages: true, unfiltered_html: true, upload_files: true } };
  wp.fetch = async (url, opts = {}) => {
    const u = new URL(url), method = opts.method || 'GET';
    wp.sent.push({ url, method, auth: opts.headers && opts.headers.authorization, headers: opts.headers || {}, body: opts.body || null, redirect: opts.redirect });
    const res = (body, status = 200) => ({ ok: status < 300, status, headers: { get: () => null }, json: async () => body });
    if (url.startsWith(LOGO_AT)) {
      const b = wp.logos[url.slice(LOGO_AT.length)];
      return b ? { ok: true, status: 200, headers: { get: (h) => (h === 'content-length' ? String(b.length) : null) }, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.length) } : res({}, 404);
    }
    if (u.pathname === '/wp-json/wp/v2/users/me') return res({ capabilities: wp.caps });
    if (u.pathname === '/wp-json/wp/v2/pages/85410' && method === 'GET') return res({ content: { raw: wp.raw }, modified_gmt: wp.modified });
    if (u.pathname === '/wp-json/wp/v2/pages/85410' && method === 'POST') { wp.raw = JSON.parse(opts.body).content; wp.modified = '2026-10-23T09:00:00'; return res({ content: { raw: wp.raw } }); }
    if (u.pathname === '/wp-json/wp/v2/media' && method === 'POST') return res({ id: 4242, source_url: 'https://stimpunks.org/wp-content/uploads/2026/10/kelp-co-op-logo.png' }, 201);
    return res({}, 404);
  };
  return wp;
}

test('the Organizations page: a logo goes nowhere with its camera data still on it', () => {
  for (const [kind, b] of [['image/png', TEST_PNG], ['image/jpeg', TEST_JPEG], ['image/webp', TEST_WEBP]]) {
    assert.equal(carriesMetadata(b, kind), true, `the ${kind} made for the test carries nothing to take off`);
    const bare = bareImage(b, kind);
    assert.ok(bare && !carriesMetadata(bare, kind), `${kind} kept its camera data`);
    assert.equal(imageKind(bare), kind, `${kind} stopped being one`);
    for (const w of ['GPS', 'IPTC', 'comment', 'camera']) assert.ok(!bare.toString('latin1').includes(w), `${kind} kept ${w}`);
  }
  assert.ok(bareImage(TEST_PNG, 'image/png').includes(Buffer.from('pixels')), 'the PNG lost its picture');
  assert.ok(bareImage(TEST_JPEG, 'image/jpeg').toString('latin1').includes('JFIF') && bareImage(TEST_JPEG, 'image/jpeg').toString('latin1').includes('scan'), 'the JPEG lost what it is drawn from');
  const w = bareImage(TEST_WEBP, 'image/webp');
  assert.equal(w[20] & 0x0c, 0, 'the WebP still says it has Exif or XMP');
  assert.equal(w.readUInt32LE(4), w.length - 8, 'the WebP’s size is wrong');
  assert.equal(bareImage(TEST_JPEG.subarray(0, 30), 'image/jpeg'), null, 'a cut-off JPEG was taken as a picture');
});

test('the Organizations page: an entry is built from words alone, on one of the page’s grounds', () => {
  const G = [['custom-color-2', 'pale teal'], ['custom-color-7', 'pale lavender']];
  assert.ok(orgFields({ name: '', ground: 'custom-color-2' }, G, 0).error, 'an entry with no name');
  assert.ok(orgFields({ name: 'Kelp', ground: 'custom-color-3' }, G, 0).error, 'a ground that is not one of the page’s');
  assert.ok(orgFields({ name: 'Kelp', ground: 'custom-color-2"},"x":{"' }, G, 0).error, 'a ground that would break out of the block’s attributes');
  assert.ok(orgFields({ name: 'Kelp', ground: 'custom-color-2', logo: 0 }, G, 1).error, 'a logo with no words for what it shows');
  assert.ok(orgFields({ name: 'Kelp', ground: 'custom-color-2', logo: 1, alt: 'A frond' }, G, 1).error, 'a logo they did not send');
  assert.ok(orgFields({ name: 'Kelp', ground: 'custom-color-2', link: 'javascript:alert(1)' }, G, 0).error, 'a script became a link');
  const x = orgFields({ name: 'Kelp <b>Co-op</b>', link: 'kelp.example.org', words: 'We farm & share.\n\nAll <!-- /wp:group --> welcome.', ground: 'custom-color-7', logo: 0, alt: 'A "frond"' }, G, 1);
  assert.equal(orgHtml(x, { id: 9, src: 'https://stimpunks.org/wp-content/uploads/2026/10/kelp.png' }),
    '<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}},"border":{"radius":{"topLeft":"33px","topRight":"33px","bottomLeft":"33px","bottomRight":"33px"}}},"backgroundColor":"custom-color-7","layout":{"type":"constrained"}} -->\n'
    + '<div class="wp-block-group has-custom-color-7-background-color has-background" style="border-top-left-radius:33px;border-top-right-radius:33px;border-bottom-left-radius:33px;border-bottom-right-radius:33px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">'
    + '<!-- wp:image {"id":9,"width":"200px","height":"auto","sizeSlug":"full","linkDestination":"none","align":"center"} -->\n<figure class="wp-block-image aligncenter size-full is-resized"><img src="https://stimpunks.org/wp-content/uploads/2026/10/kelp.png" alt="A &quot;frond&quot;" class="wp-image-9" style="width:200px;height:auto"/></figure>\n<!-- /wp:image -->\n\n'
    + '<!-- wp:paragraph -->\n<p><a href="https://kelp.example.org/">Kelp &lt;b&gt;Co-op&lt;/b&gt;</a> - We farm &amp; share.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:paragraph -->\n<p>All &lt;!-- /wp:group --&gt; welcome.</p>\n<!-- /wp:paragraph --></div>\n<!-- /wp:group -->');
  const list = orgsList(ORG_PAGE);
  assert.deepEqual([list.grounds, list.after], [['custom-color-6', 'custom-color-2'], 'Stim Music Arts']);
  assert.ok(list.hosts.includes('autisticrealms.com') && !list.hosts.includes('stimpunks.org'));
  assert.ok(orgsList(ORG_PAGE + '\n\n<!-- wp:paragraph -->\n<p>Want to be listed?</p>\n<!-- /wp:paragraph -->').error, 'a page that no longer ends with its organizations was written into');
});

test('the Organizations page: a director looks, names, tidies and adds one entry and its logo, and nothing else of the join request goes', () => withOfficeKey(OFFICE_TEST_KEY, () => withWpKey('office', 'abcd efgh ijkl mnop', async () => {
  const s = memoryStore({ etagOnRead: true });
  const form = (org) => `**Tell us a bit about yourself and why you would like to join our community.**\nI like otters, and my phone is 5125550100.\n\n**City**\nAustin\n\n`
    + `**Profile text for the Members page (optional)**\nI keep otters.\n\n${org}`;
  const ours = `**Profile text for the Organizations page**\nWe farm kelp\nfor everybody.\n\nAnd we share it.\n\n**Organization Website or Blog**\nkelp.example.org\n\n`
    + `**Organization Logo**\n${LOGO_AT}kelp-logo-aa.png\nhttps://evil.example/wp-content/uploads/wpforms/85366-0123456789abcdef0123456789abcdef/x.png\n${LOGO_AT}kelp-photo-bb.jpg`;
  await officeIntake({ type: 'community', entry: 980, email: 'robin@example.org', name: 'Robin Hood', message: form(ours) }, s, T0, TMODS);
  await officeIntake({ type: 'community', entry: 981, email: 'sam@example.org', name: 'Sam', message: form('') }, s, T0 + 1, TMODS);
  await officeIntake({ type: 'community', entry: 982, email: 'dee@example.org', name: 'Dee', message: form(`**Organization Name**\nStim Music Arts\n\n**Profile text for the Organizations page**\nA collective.`) }, s, T0 + 2, TMODS);
  const cases = await readCases(s);
  const k = cases.find((x) => x.form === 980), none = cases.find((x) => x.form === 981), dee = cases.find((x) => x.form === 982);
  assert.deepEqual(caseOrg(k).gave, { name: '', words: 'We farm kelp for everybody.\n\nAnd we share it.', link: 'kelp.example.org', logos: 2 },
    'the entry was read from somewhere other than the Organizations page part of the form, or a logo from elsewhere was counted');
  assert.equal(caseOrg(dee).gave.name, 'Stim Music Arts', 'the organization’s name the form asked for was not used');
  assert.equal(caseOrg(none).asked, false);
  assert.ok((await officeCase(TRYAN, k.id, s)).org.ready);

  const wp = fakeOrgPress();
  assert.ok((await orgLook(TSAM, k.id, 'Kelp Co-op', '', s, wp.fetch)).error, 'somebody the office does not let in read the page');
  assert.ok((await orgAdd(TSAM, k.id, { name: 'Kelp Co-op', ground: 'custom-color-7', modified: wp.modified }, s, T0 + 3, wp.fetch)).error);
  assert.ok((await orgLook(TRYAN, none.id, 'Sam', '', s, wp.fetch)).error, 'a join request that did not ask was looked at');
  assert.equal(wp.sent.length, 0);

  const look = await orgLook(TRYAN, k.id, 'Kelp Co-op', 'kelp.example.org', s, wp.fetch);
  assert.deepEqual([look.modified, look.after, look.ground, look.there, look.hostThere], ['2026-10-23T06:00:00', 'Stim Music Arts', 'custom-color-4', false, false]);
  assert.equal(look.logos.length, 2);
  assert.deepEqual(look.logos.map((x) => x.kind), ['image/png', 'image/jpeg']);
  for (const l of look.logos) assert.ok(!carriesMetadata(Buffer.from(l.data, 'base64'), l.kind), 'a logo came to the page with its camera data on');
  assert.ok(wp.sent.every((x) => x.method === 'GET'), 'looking changed something');
  assert.ok(!wp.sent.some((x) => x.url.includes('evil.example')), 'a logo was fetched from somewhere other than stimpunks.org');
  const logoAsks = wp.sent.filter((x) => x.url.startsWith(LOGO_AT));
  assert.ok(logoAsks.length === 2 && logoAsks.every((x) => x.redirect === 'error' && !x.auth), 'a logo was fetched following redirects, or with the application password');
  assert.equal((await orgLook(TRYAN, dee.id, 'Stim Music Arts', '', s, wp.fetch)).there, true, 'an organization already on the page was not noticed');

  const entry = { name: 'Kelp Co-op', link: 'kelp.example.org', words: 'We farm kelp for everybody.\n\nAnd we share it.', ground: 'custom-color-4', logo: 0, alt: 'A green frond in a circle' };
  const stale = await orgAdd(TRYAN, k.id, { ...entry, modified: '2026-10-01T00:00:00' }, s, T0 + 4, wp.fetch);
  assert.ok(stale.error && stale.changed && stale.changed.after === 'Stim Music Arts', 'a page changed since the look was written');
  assert.ok((await orgAdd(TRYAN, dee.id, { name: 'Stim Music Arts', ground: 'custom-color-4', modified: look.modified }, s, T0 + 4, wp.fetch)).error, 'a second Stim Music Arts went on the page');
  const weak = fakeOrgPress({ caps: { edit_pages: true, edit_published_pages: true, edit_others_pages: true, unfiltered_html: true, upload_files: false } });
  assert.match((await orgAdd(TRYAN, k.id, { ...entry, modified: look.modified }, s, T0 + 4, weak.fetch)).error, /media library/);
  assert.ok(wp.sent.every((x) => x.method === 'GET') && weak.sent.every((x) => x.method === 'GET'), 'a refused add wrote something');

  const r = await orgAdd(TRYAN, k.id, { ...entry, modified: look.modified }, s, T0 + 5, wp.fetch);
  assert.deepEqual(r, { added: { t: T0 + 5 }, address: 'https://stimpunks.org/community/organizations/', kept: true, gone: false, logo: true });
  const posts = wp.sent.filter((x) => x.method === 'POST');
  assert.equal(posts.length, 2, 'more or fewer than the logo and the page were written');
  const [media, page] = posts;
  assert.ok(media.url.startsWith('https://stimpunks.org/wp-json/wp/v2/media?'));
  assert.deepEqual([new URL(media.url).searchParams.get('title'), new URL(media.url).searchParams.get('alt_text')], ['Kelp Co-op logo', 'A green frond in a circle']);
  assert.deepEqual([media.headers['content-type'], media.headers['content-disposition']], ['image/png', 'attachment; filename="kelp-co-op-logo.png"']);
  assert.ok(!carriesMetadata(media.body, 'image/png') && !Buffer.from(media.body).toString('latin1').includes('GPS'), 'the logo went into the media library with its camera data on');
  assert.equal(page.url, 'https://stimpunks.org/wp-json/wp/v2/pages/85410?context=edit&_fields=content');
  const put = JSON.parse(page.body);
  assert.deepEqual(Object.keys(put), ['content']);
  const end = ORG_PAGE.lastIndexOf('<!-- /wp:group -->') + '<!-- /wp:group -->'.length;
  const want = orgHtml(orgFields(entry, [['custom-color-4', 'pale green']], 2), { id: 4242, src: 'https://stimpunks.org/wp-content/uploads/2026/10/kelp-co-op-logo.png' });
  assert.equal(put.content, ORG_PAGE.slice(0, end) + '\n\n' + want + ORG_PAGE.slice(end), 'the page was changed anywhere but by one entry after its last organization');
  for (const w of ['robin@example.org', 'Austin', '5125550100', 'like otters', 'keep otters', 'Robin', 'Ryan,']) assert.ok(!posts.some((x) => String(x.url + x.body).includes(w)), `stimpunks.org was sent ${w}`);
  assert.deepEqual((await officeCase(TRYAN, k.id, s)).org.added, { t: T0 + 5 });
  assertSealed(await s.get('office-cases', { type: 'json' }), ['Robin', 'kelp']);
  assert.match((await orgAdd(TRYAN, k.id, { ...entry, modified: wp.modified }, s, T0 + 6, wp.fetch)).error, /already/, 'an organization already added was added again');
  // Without a logo, nothing goes into the media library.
  const plain = fakeOrgPress();
  const look2 = await orgLook(TRYAN, dee.id, 'Stim Sounds', '', s, plain.fetch);
  assert.ok((await orgAdd(TRYAN, dee.id, { name: 'Stim Sounds', words: 'A collective.', ground: look2.ground, logo: null, modified: look2.modified }, s, T0 + 7, plain.fetch)).added);
  assert.ok(!plain.sent.some((x) => x.url.includes('/media')), 'the media library was written with no logo chosen');
})));

/* ── Tasks: activity and notifications ───────────────────────────────────── */
const TNORAH = fw('Norah', 900, ['director']);
const kinds = async (who, s, now) => (await taskInbox(who, s, now)).items.map((x) => [x.kind, x.why, x.by]);

test('a task change is its activity, and news to whoever it concerns but whoever made it', async () => {
  const s = memoryStore({ etagOnRead: true });
  const t0 = DENVER('2026-10-21', 9);
  const made = (await saveTask(TCHELSEA, { name: 'Fix the shelf', who: 'norah', with: ['Ryan'], due: '2026-10-22' }, s, t0, TMODS)).task;
  assert.deepEqual(await kinds(TNORAH, s, t0), [['made', 'assigned', 'Chelsea']]);
  assert.deepEqual(await kinds(TRYAN, s, t0), [['made', 'added', 'Chelsea']]);
  assert.deepEqual(await kinds(TCHELSEA, s, t0), [], 'the person who made the change was told about it');
  // Norah starts it: news to the person who made it and to Ryan, not to Norah.
  await saveTask(TNORAH, { id: made.id, status: 'Started' }, s, t0 + 1, TMODS);
  const c = (await taskInbox(TCHELSEA, s, t0 + 1)).items[0];
  assert.deepEqual([c.kind, c.why, c.by, c.changes], ['changed', 'yours', 'Norah', [{ field: 'status', from: 'Not Started', to: 'Started' }]]);
  assert.equal((await kinds(TNORAH, s, t0 + 1)).length, 1, 'Norah was told about her own change');
  // A save that changes nothing is nobody's news.
  await saveTask(TNORAH, { id: made.id, status: 'Started' }, s, t0 + 2, TMODS);
  assert.equal((await kinds(TCHELSEA, s, t0 + 2)).length, 1);
  // A description that newly mentions Ryan tells him so, without its words; mentioning him again does not.
  await saveTask(TCHELSEA, { id: made.id, body: '@Ryan please bring the drill\n\n- [ ] buy screws' }, s, t0 + 3, TMODS);
  const m = (await taskInbox(TRYAN, s, t0 + 3)).items[0];
  assert.deepEqual([m.why, m.changes], ['mentioned', [{ field: 'body' }]]);
  assert.ok(!JSON.stringify(await s.get('task-inbox/' + petKey('Ryan'), { type: 'json' })).includes('drill'), 'a description\'s words went into a list');
  await saveTask(TCHELSEA, { id: made.id, body: '@Ryan please bring the big drill\n\n- [ ] buy screws' }, s, t0 + 4, TMODS);
  assert.equal((await taskInbox(TRYAN, s, t0 + 4)).items[0].why, 'yours', 'a mention already there was news again');
  // Taken off it is news to the person taken off.
  await saveTask(TCHELSEA, { id: made.id, with: [] }, s, t0 + 5, TMODS);
  assert.deepEqual((await kinds(TRYAN, s, t0 + 5))[0], ['changed', 'removed', 'Chelsea']);
  // A tick says which box.
  await tickTask(TNORAH, made.id, 0, 'buy screws', true, s, t0 + 6, TMODS);
  const tk = (await taskInbox(TCHELSEA, s, t0 + 6)).items[0];
  assert.deepEqual([tk.kind, tk.box], ['ticked', { text: 'buy screws', on: true }]);
  // The activity is every change, newest first.
  assert.deepEqual((await taskActivity(TRYAN, made.id, s)).map((e) => e.kind), ['ticked', 'changed', 'changed', 'changed', 'changed', 'made'], 'a save that changed nothing made an event, or one was lost');
  assert.equal(await taskActivity(TSAM, made.id, s), null);
  // An import from EspoCRM is nobody's change.
  const before = (await kinds(TNORAH, s, t0 + 7)).length;
  await saveTask(TRYAN, { espo: 'abc123def456', name: 'Brought over', who: 'Norah' }, s, t0 + 7, TMODS);
  assert.equal((await kinds(TNORAH, s, t0 + 7)).length, before, 'an import was news');
  // Due: Norah's task due tomorrow, worked out now.
  assert.deepEqual((await taskInbox(TNORAH, s, t0 + 8)).due.map((d) => [d.name, d.due]), [['Fix the shelf', '2026-10-22']]);
  // Deleting tells whoever was on it, and the activity goes with the task.
  await removeTask(TCHELSEA, made.id, s, t0 + 9, TMODS);
  assert.deepEqual((await kinds(TNORAH, s, t0 + 9))[0], ['deleted', 'yours', 'Chelsea']);
  assert.equal(await s.get('task-activity/' + made.id, { type: 'json' }), null, 'a deleted task kept its activity');
  // Reading: one, then every one; nobody but its owner reads a list.
  const n = await taskInbox(TNORAH, s, t0 + 9);
  assert.ok(n.unread > 1);
  assert.equal((await readTaskInbox(TNORAH, [n.items[0].id], s)).unread, n.unread - 1);
  assert.equal((await readTaskInbox(TNORAH, 'all', s)).unread, 0);
  assert.equal(await taskInbox(TSAM, s, t0), null);
  assert.ok((await readTaskInbox(TSAM, 'all', s)).error);
  // A month on, the list is empty; Forget me deletes it.
  assert.deepEqual((await taskInbox(TNORAH, s, t0 + (TASK_INBOX_DAYS + 1) * 86400000)).items, []);
  await forgetTaskInbox(petKey('Ryan'), s);
  assert.deepEqual((await taskInbox(TRYAN, s, t0 + 9)).items, []);
});

test('a task a recurring task makes is news to whoever it goes to, under nobody\'s name', async () => {
  const s = memoryStore({ etagOnRead: true });
  await saveRecur(TRYAN, { name: 'Weekly check-in', repeats: 'Weekly', next: '2026-10-27', who: 'Norah' }, s, T0, TMODS);
  assert.equal((await makeRecurring(s, DENVER('2026-10-27', 1), TMODS)).made, 1);
  const it = (await taskInbox(TNORAH, s, DENVER('2026-10-27', 2))).items;
  assert.deepEqual(it.map((x) => [x.kind, x.why, x.by, x.name]), [['recurred', 'assigned', null, 'Weekly check-in']]);
});

test('taskChanges says what changed, field by field, and a description only that it did', () => {
  const had = { name: 'A', status: 'Not Started', priority: 'Normal', start: null, due: null, who: 'Norah', with: ['Ryan'], tags: [], body: 'x' };
  assert.deepEqual(taskChanges(had, { ...had }), []);
  assert.deepEqual(taskChanges(had, { ...had, due: '2026-10-30', with: [], tags: ['Finance'], body: 'y' }),
    [{ field: 'due', from: null, to: '2026-10-30' }, { field: 'with', from: ['Ryan'], to: [] }, { field: 'tags', from: [], to: ['Finance'] }, { field: 'body' }]);
});

for (const etagOnRead of [true, false]) {
  test(`fifteen tasks assigned to one person at once, ${etagOnRead ? 'with' : 'without'} an etag on reads: none told it worked is missing from their list`, async () => {
    const s = memoryStore({ etagOnRead });
    const now = DENVER('2026-10-21', 9);
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => saveTask(TCHELSEA, { name: 'Task ' + i, who: 'Norah' }, s, now, TMODS)));
    const made = told.filter((r) => r.status === 'fulfilled' && r.value.task).map((r) => r.value.task.id);
    const kept = new Set((await taskInbox(TNORAH, s, now)).items.map((x) => x.task));
    assert.deepEqual(made.filter((id) => !kept.has(id)), [], 'a task made and assigned is missing from the list');
  });
}

test('something new in Notifications tells only its person\'s devices with the tasks switch on, while they can read tasks, and never the person who did it', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const mods = readMods('{"Norah":["director"],"Chelsea":["director"],"Sam":[]}');
  await claimAccount('Norah', 'norah has a phrase', s, 0, mods, true);
  await claimAccount('Sam', 'sam has a phrase too', s, 0, mods, true);
  const norah = issueAccountPass('Norah', 1, 'base'), sam = issueAccountPass('Sam', 1, 'base');
  const on = aDevice(), quiet = aDevice(), off = aDevice(), every = aDevice(), notDirector = aDevice(), ordinary = aDevice();
  await keepDevice(on, norah, { tasks: true }, s);
  await keepDevice(quiet, norah, { tasks: true, words: false }, s);
  await keepDevice(off, norah, { mentions: true, props: true }, s);
  await keepDevice(every, norah, { all: true }, s);
  await keepDevice(notDirector, sam, { tasks: true }, s);
  await keepDevice(ordinary, issueAccountPass('Norah', 1), { tasks: true }, s);
  assert.equal(cleanWant({}).tasks, false, 'tasks were on before anybody switched them on');
  const sent = [];
  const send = async (sub, payload) => { sent.push({ to: sub.endpoint, payload }); return 201; };
  const to = (d) => sent.filter((x) => x.to === d.endpoint).map((x) => x.payload);
  const item = { id: 'eAAAAAAAAAAAA', t: 1, by: 'Chelsea', task: 'kAAAAAAAAAAAA', name: 'Fix the shelf', kind: 'made', changes: [], why: 'assigned' };
  await notifyTask('norah', item, s, mods, send);
  assert.deepEqual(to(on), [{ kind: 'task', why: 'assigned', did: 'made', handle: 'Chelsea', task: 'kAAAAAAAAAAAA', name: 'Fix the shelf', box: '' }]);
  assert.deepEqual(to(quiet), [{ kind: 'task', why: 'assigned', did: 'made', handle: 'Chelsea', task: 'kAAAAAAAAAAAA', name: '', box: '' }], 'the task\'s name went to a device that turned the words off');
  assert.equal(to(every).length, 1, 'Everything did not include tasks');
  assert.equal(to(off).length, 0, 'a device that never switched tasks on was told');
  assert.equal(to(ordinary).length, 0, 'a pass that cannot read tasks was told about one');
  sent.length = 0;
  await notifyTask('Sam', { ...item, why: 'yours' }, s, mods, send);
  assert.equal(to(notDirector).length, 0, 'somebody who cannot read tasks was told about one');
  await notifyTask('Norah', { ...item, by: 'Norah' }, s, mods, send);
  assert.equal(sent.length, 0, 'somebody was told about their own change');
  // A deleted task says which kind, and has no task to open.
  await notifyTask('Norah', { ...item, kind: 'deleted', why: 'yours' }, s, mods, send);
  assert.equal(to(on)[0].task, '', 'a deleted task\'s notification still points at it');
  // Through a real change: Chelsea assigns a task to Norah and her device is told, once.
  sent.length = 0;
  const made = (await saveTask(fw('Chelsea', 700, ['director']), { name: 'Order screws', who: 'Norah' }, s, Date.now(), mods)).task;
  assert.ok(made);
  // saveTask tells devices through sendPush, which needs CB_PUSH_KEY; with none set it sends nothing and the list still has it.
  assert.equal((await taskInbox(fw('Norah', 0, ['director']), s)).items[0].task, made.id);
}));

/* ── Every forum category is a room on the CB (Ryan's calls, 2026-10-21) ──

   The radio's This room follows the category being read, and a category's
   room is for exactly the people who can read the category: a claimed
   username, with the category's own roles. A subcategory is its top
   category's room. Broken on purpose both ways when it was written: with the
   lock taking everybody in, the staff categories' cases fail; with it taking
   nobody, the readers' cases fail. */
import { FORUM_PAGE, FORUM_ROOM, forumRoom, forumRoomOf, forumRooms, forumPlace, lockedRoom } from './lib.mjs';

const FDIR = fw('Dee', 600, ['director']);
const TYPED = { role: 'mobile', handle: 'Cy', roles: new Set() };
const SHARED_BASE = { role: 'base', handle: 'Sam', roles: new Set(['moderator', 'board']) };
const roomOfCat = (slug) => FORUM_ROOM + slug;

test('a forum category\'s room lets in exactly who can read the category, and a subcategory has none of its own', () => {
  const tops = FORUM_CATEGORIES.filter((c) => !c.parent);
  assert.ok(tops.some((c) => c.see) && tops.some((c) => !c.see), 'there are no staff and public categories to test');
  for (const c of tops) {
    for (const who of [TYPED, SHARED_BASE, ADA, BO, FMOD, FBOARD, FDIR, FADMIN]) {
      assert.equal(roomAllows(who, roomOfCat(c.slug)), forumAllows(who, forumCat(c.slug)), `${who.handle} in ${c.slug}'s room`);
    }
  }
  assert.equal(roomAllows(ADA, 'forum-coping'), true, 'a claimed username was kept out of a public category\'s room');
  assert.equal(roomAllows(TYPED, 'forum-coping'), false, 'an unclaimed handle heard a category it cannot read');
  assert.equal(roomAllows(SHARED_BASE, 'forum-board'), false, 'a moderator on the shared password heard a category it cannot read');
  assert.equal(roomAllows(ADA, 'forum-board'), false, 'a claimed username with no role heard the board');
  assert.equal(roomAllows(FBOARD, 'forum-board'), true);
  assert.equal(roomAllows(FDIR, 'forum-board'), true, 'directors join the board');
  assert.equal(roomAllows(FBOARD, 'forum-directors'), false, 'the board heard the directors');
  assert.equal(roomAllows(FMOD, 'forum-team-docs'), true);
  assert.equal(roomAllows(FMOD, 'forum-finance'), false, 'a moderator heard Finance');
  assert.equal(roomAllows(FADMIN, 'forum-finance'), true, 'an administrator goes where a category is not strict');
  assert.equal(roomAllows(null, 'forum-coping'), false);
  for (const sub of ['forum-field-guide', 'forum-notes', 'forum-meeting-minutes', 'forum-meeting-minutes-2025', 'forum-templates', 'forum-nonsense']) {
    assert.equal(forumRoom(sub), null, `${sub} was a room`);
    assert.equal(roomAllows(FADMIN, sub), false, `${sub} let somebody in beside its top category's room`);
  }
  assert.equal(roomAllows(TYPED, FORUM_PAGE), true, 'The forums\' own room is everybody\'s, as every page\'s is');
  assert.equal(forumRoomOf('meeting-minutes-2025'), 'forum-team-docs');
  assert.equal(forumRoomOf('field-guide'), 'forum-team-docs');
  assert.equal(forumRoomOf('coping'), 'forum-coping');
  assert.equal(forumRoomOf('no-such-category'), null);
  assert.deepEqual(forumPlace('forum-coping'), { name: 'The forums: Coping', path: '/forum.html#/c/coping' });
  assert.equal(forumPlace('forum-field-guide'), null);
  assert.deepEqual(lockedRoom('forum-coping'), null);
  assert.deepEqual(lockedRoom('forum-finance'), { roles: forumCat('finance').see, strict: false });
  assert.deepEqual(lockedRoom('town-hall-executive-session'), { roles: ['board'], strict: true });
});

test('a pass is named only the categories\' rooms it may enter', () => {
  assert.deepEqual(forumRooms(TYPED), [], 'an unclaimed handle was named categories');
  assert.deepEqual(forumRooms(SHARED_BASE), []);
  const tags = (who) => forumRooms(who).map((r) => r.tag);
  for (const who of [ADA, FMOD, FBOARD, FDIR, FADMIN]) {
    for (const r of forumRooms(who)) {
      assert.ok(roomAllows(who, r.tag), `${who.handle} was named ${r.tag}, which they may not enter`);
      assert.equal(r.path, '/forum.html#/c/' + r.tag.slice(FORUM_ROOM.length));
      assert.ok(r.name.startsWith('The forums: '));
      // The chat page lists a locked category under Staff, and only a locked one.
      assert.equal(r.locked === true, lockedRoom(r.tag) !== null, `${r.tag} said the wrong thing about being locked`);
    }
    assert.ok(!tags(who).some((t) => forumRoom(t) === null), 'a subcategory was named as a room');
  }
  assert.ok(tags(ADA).includes('forum-coping') && !tags(ADA).includes('forum-board') && !tags(ADA).includes('forum-team-docs'));
  assert.ok(tags(FBOARD).includes('forum-board') && !tags(FBOARD).includes('forum-directors'));
});

test('a private category\'s room keeps its hosts, its people, its call, its news and its counts to its readers', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  assert.equal((await hostBeacon(ADA, 'forum-board', 'Minutes', 1, true, s)).closed, true, 'somebody hosted in the board\'s room who cannot read the board');
  await hostBeacon(FBOARD, 'forum-board', 'Minutes', 1, true, s);
  await hostBeacon(BO, 'forum-coping', 'A film', 1, true, s);
  const all = await readBeacons(s);
  assert.deepEqual(shapeBeacons(all, ADA).map((b) => b.room), ['forum-coping'], 'the board\'s film was news to somebody who cannot read the board');
  assert.deepEqual(shapeBeacons(all, FBOARD).map((b) => b.room).sort(), ['forum-board', 'forum-coping']);
  assert.deepEqual(shapeBeacons(all, TYPED).map((b) => b.room), [], 'an unclaimed handle heard a category\'s film');

  await beSeen(FBOARD, 'forum-board', 'visitBBBBBBBBBBBBBBBBBBBBB', s, now - 1000);
  await beSeen(BO, 'forum-coping', 'visitCCCCCCCCCCCCCCCCCCCCC', s, now - 1000);
  assert.deepEqual((await whoSeen(ADA, s, now)).map((p) => [p.handle, p.rooms]), [['Bo', ['forum-coping']]], 'somebody seen in the board\'s room was shown outside it');
  assert.deepEqual((await whoSeen(FDIR, s, now)).map((p) => p.handle), ['Bea', 'Bo']);
  assert.deepEqual((await whoSeen(TYPED, s, now)).map((p) => p.handle), [], 'an unclaimed handle saw who is in a category');

  const b64n = (n) => Buffer.from(n).toString('base64url');
  await s.set(`call-in/forum-board/${b64n('pid-Bea')}.${now - 2000}.p.${b64n('Bea')}`, '');
  assert.deepEqual(await callsOn(ADA, s, now), [], 'the board\'s call was named to somebody who cannot read the board');
  assert.deepEqual(await callsOn(FBOARD, s, now), ['forum-board']);
  assert.equal(callToken(ADA, 'forum-board', now, key), null, 'somebody had a token for the board\'s call who cannot read the board');
  assert.equal(callToken(TYPED, 'forum-coping', now, key), null, 'an unclaimed handle had a token for a category\'s call');
  assert.equal(open(callToken(FDIR, 'forum-board', now, key)).body.room, 'stimpunks-forum-board');
  assert.equal(open(callToken(ADA, 'forum-coping', now, key)).body.room, 'stimpunks-forum-coping');

  // The World room lists pages, so a category's room is The forums' line there.
  const ix = Object.fromEntries((await worldIndex(ADA, s, now)).rooms.map((x) => [x.tag, x]));
  assert.deepEqual(ix[FORUM_PAGE].people.map((p) => p.handle), ['Bo'], 'The forums\' line did not take in a category, or took in one the asker cannot read');
  assert.equal(ix[FORUM_PAGE].call, false, 'the board\'s call showed on The forums\' line to somebody who cannot read the board');
  assert.ok(!Object.keys(ix).some((t) => t.startsWith(FORUM_ROOM)), 'a category\'s room had a line of its own in the World room');
  const bix = Object.fromEntries((await worldIndex(FBOARD, s, now)).rooms.map((x) => [x.tag, x]));
  assert.deepEqual(bix[FORUM_PAGE].people.map((p) => p.handle), ['Bea', 'Bo']);
  assert.equal(bix[FORUM_PAGE].call, true);

  await noteLatest('forum-board', now - 500, s, now);
  await noteLatest('forum-coping', now - 400, s, now);
  assert.deepEqual(Object.keys((await newFor(ADA, s, now)).latest).sort(), ['forum-coping'], 'the board\'s channel was news to somebody who cannot read the board');
  assert.deepEqual(Object.keys((await newFor(FBOARD, s, now)).latest).sort(), ['forum-board', 'forum-coping']);

  assert.equal(await countMessage('forum-finance', s, now), 'mods', 'a staff category\'s message was counted with the open rooms');
  assert.equal(await countMessage('forum-coping', s, now), 'rooms');
  assert.match(cleanProfile({ room: 'forum-coping' }).error || '', /cannot be named on a profile/, 'a category\'s room could be a favourite, shown to everybody');
});

test('what is said in a private category\'s room goes only into the category, or one no wider', async () => {
  const s = memoryStore({ etagOnRead: true });
  const now = Date.now();
  await updateRoomTalk('forum-board', (l) => [...l, { id: 'b1', handle: 'Bea', text: 'board talk', t: now, base: true }], s);
  await updateRoomTalk('forum-coping', (l) => [...l, { id: 'c1', handle: 'Bo', text: 'a hard day', t: now }], s);
  assert.match((await cbTranscript(ADA, { room: 'forum-board', ids: ['b1'] }, s)).error, /not a channel you can hear/);
  assert.match((await startTopic(FBOARD, { cat: 'events', title: 'Leak', from: { room: 'forum-board', ids: ['b1'] } }, s, T0, NO_NET)).error, /only go into a category/);
  const kept = (await startTopic(FBOARD, { cat: 'board', title: 'Minutes', from: { room: 'forum-board', ids: ['b1'] } }, s, T0, NO_NET)).topic;
  assert.ok(kept, 'the board\'s room could not go into the board\'s own category');
  assert.match((await moderateTopic(FADMIN, kept.id, { move: 'events' }, s, T0)).error, /private room/);
  assert.ok((await startTopic(BO, { cat: 'events', title: 'From Coping', from: { room: 'forum-coping', ids: ['c1'] } }, s, T0, NO_NET)).topic,
    'a public category\'s room could not go into another public category');
});

test('a category\'s room tells only the devices whose pass can read the category, and says its own name', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const mods = readMods('{"Bea":["board"]}');
  await claimAccount('Bea', 'bea has a phrase', s, 0, mods, true);
  await claimAccount('Ada', 'ada has a phrase too', s, 0, mods, true);
  const bea = issueAccountPass('Bea', 1, 'base'), ada = issueAccountPass('Ada', 1), cy = issuePass('mobile', 'Cy');
  const beaDev = aDevice(), adaDev = aDevice(), cyDev = aDevice();
  for (const [d, p] of [[beaDev, bea], [adaDev, ada], [cyDev, cy]]) await keepDevice(d, p, { calls: true, rooms: ['forum-board', 'forum-coping'] }, s);
  const sent = [];
  const send = async (sub, payload) => { sent.push({ to: sub.endpoint, payload }); return 201; };
  const to = (d) => sent.filter((x) => x.to === d.endpoint);
  await notifyMessage({ id: 'm1', handle: 'Dee', text: 'budget', t: 1 }, 'forum-board', s, mods, send);
  assert.equal(to(adaDev).length + to(cyDev).length, 0, 'the board\'s room told a device whose pass cannot read the board');
  assert.deepEqual(to(beaDev)[0].payload.place, { name: 'The forums: Board', path: '/forum.html#/c/board' });
  sent.length = 0;
  await notifyMessage({ id: 'm2', handle: 'Dee', text: 'hello', t: 2 }, 'forum-coping', s, mods, send);
  assert.deepEqual(sent.map((x) => x.to).sort(), [adaDev.endpoint, beaDev.endpoint].sort(), 'a public category\'s room told an unclaimed handle, or kept a reader out');
  sent.length = 0;
  await notifyCall('forum-board', s, mods, send);
  assert.deepEqual(sent.map((x) => x.to), [beaDev.endpoint], 'the board\'s call was news to somebody who cannot read the board');
  assert.deepEqual(sent[0].payload, { kind: 'call', room: 'forum-board', place: { name: 'The forums: Board', path: '/forum.html#/c/board' } });
}));

/* ── Replies (Ryan's ask, 2026-10-21) ── */
import { replyTo } from './lib.mjs';

test('a reply names the message it answers by id and keeps nothing else of it', () => {
  assert.equal(replyTo('2f1c7a9e-1b2c-4d5e-8f90-1234567890ab'), '2f1c7a9e-1b2c-4d5e-8f90-1234567890ab');
  assert.equal(replyTo('dAbC_123-xy'), 'dAbC_123-xy');
  for (const bad of ['', 'two words', '<b>', 'x'.repeat(65), 7, null, {}]) assert.equal(replyTo(bad), null, `took ${JSON.stringify(bad)}`);
  const list = [{ id: 'o', handle: 'Bex', text: 'the den at 3?', t: 1 }, { id: 'r', handle: 'Ada', text: 'yes', t: 2, re: 'o' }];
  const out = shape(list);
  assert.equal(out[1].re, 'o');
  assert.deepEqual(Object.keys(out[1]).sort(), ['base', 'claimed', 'handle', 'id', 're', 't', 'text'], 'a reply carried something of the message it answers');
  assert.equal(shape([{ ...list[1], re: '<script>' }])[0].re, undefined, 'a reply passed on a link that is no id');
  const ed = editMessage(list, 'r', 'yes, at 3', { handle: 'Ada', role: 'mobile', roles: new Set() }, 5);
  assert.equal(ed.msg.re, 'o', 'an edit lost what the message answers');
});

test('a reply tells whoever sent the message it answers, behind its own switch, and only them', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const bexDev = aDevice(), cyDev = aDevice(), dovDev = aDevice(), adaDev = aDevice();
  await keepDevice(bexDev, await claimedPassFor('Bex', s), { replies: true, rooms: ['the-den'] }, s);
  await keepDevice(cyDev, await claimedPassFor('Cy', s), { mentions: true }, s);
  await keepDevice(dovDev, await claimedPassFor('Dov', s), { all: true }, s);
  await keepDevice(adaDev, await claimedPassFor('Ada', s), { replies: true }, s);
  const sent = [];
  const send = async (sub, payload, opts) => { sent.push({ to: sub.endpoint, payload, opts }); return 201; };
  const to = (d) => sent.filter((x) => x.to === d.endpoint);
  const reply = { id: 'r1', handle: 'Ada', text: 'yes, see you there', t: 2, re: 'o1' };

  await notifyMessage(reply, 'the-den', s, readMods(''), send, { id: 'o1', handle: 'Bex', text: 'the den at 3?', t: 1 });
  assert.equal(to(bexDev).length, 1, 'the person answered was not told, or told twice');
  assert.equal(to(bexDev)[0].payload.why, 'reply', 'a reply to somebody who follows the room read as the channel');
  assert.equal(to(bexDev)[0].opts.urgency, 'high');
  assert.equal(to(adaDev).length, 0, 'Ada was told about her own reply');
  assert.equal(to(cyDev).length + to(dovDev).length, 0, 'a reply told somebody it does not answer');

  sent.length = 0;
  // In a room nobody here follows: Everything hears every message on World.
  await notifyMessage({ ...reply, id: 'r2' }, 'the-garden', s, readMods(''), send, { id: 'o2', handle: 'Cy', text: 'hi', t: 1 });
  assert.equal(sent.length, 0, 'a reply told somebody who switched replies off');
  await notifyMessage({ ...reply, id: 'r3' }, 'the-garden', s, readMods(''), send, { id: 'o3', handle: 'Dov', text: 'hi', t: 1 });
  assert.deepEqual(sent.map((x) => [x.to, x.payload.why]), [[dovDev.endpoint, 'reply']], 'Everything missed a reply');

  // The base's message: a pass that is not the base's is not its sender, though the name is the same.
  sent.length = 0;
  await notifyMessage({ ...reply, id: 'r4' }, 'the-garden', s, readMods(''), send, { id: 'o4', handle: 'Bex', text: 'hi', t: 1, base: true });
  assert.equal(sent.length, 0, 'a reply to the base\'s message reached somebody signed on as that name without the base');
  // A room that keeps to itself announces nothing outside it, a reply included.
  const mods = readMods('{"Bex":["administrator"]}');
  const baseDev = aDevice();
  await keepDevice(baseDev, issuePass('base', 'Bex'), { replies: true }, s);
  await notifyMessage({ ...reply, id: 'r5' }, QUIET_ROOMS[0], s, mods, send, { id: 'o5', handle: 'Bex', text: 'hi', t: 1, base: true });
  assert.equal(sent.length, 0, 'a reply announced a room that keeps to itself');
  // An edit never tells anybody about a reply again.
  await notifyEdit({ ...reply, id: 'r6', text: 'yes, see you at 3' }, 'yes, see you there', null, s, readMods(''), send);
  assert.equal(sent.length, 0);
}));

test('a reply in a conversation answers a message in it, there now', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const [ada, bex] = await twoPeople(s);
  await setDmOpen(bex, true, s);
  const first = (await sendDm(ada, 'Bex', 'hello', s)).sent;
  const r = await sendDm(bex, 'Ada', { text: 'hi there', re: first.id }, s);
  assert.equal(r.sent.re, first.id, 'a reply in a conversation lost what it answers');
  assert.ok(r.accepted, 'answering a first message with a reply did not accept it');
  assert.equal((await readDmWith(ada, 'Bex', s)).messages[1].re, first.id);
  assert.equal((await sendDm(ada, 'Bex', { text: 'and?', re: 'dNoSuchOne1' }, s)).error, 'reply', 'a reply went to a message that is not there');
  assert.equal((await sendDm(ada, 'Bex', { text: 'and?', re: 'not an id' }, s)).error, 'reply');
  assert.equal((await readDmWith(ada, 'Bex', s)).messages.length, 2, 'a refused reply was kept');
}));

/* The feeds hand back the cards a page asks for, whole, and nothing to anybody who cannot read them. */
test('Tasks\' feed: the cards asked for, whole, with their latest changes, and only for somebody who reads tasks', async () => {
  const s = memoryStore({ etagOnRead: true });
  const a = (await saveTask(TCHELSEA, { name: 'Fix the shelf', who: 'Norah', body: '- [ ] buy screws\n- [ ] drill' }, s, T0, TMODS)).task;
  const b = (await saveTask(TCHELSEA, { name: 'Send the minutes', who: 'Ryan' }, s, T0 + 1, TMODS)).task;
  for (const [i, st] of ['Started', 'Deferred', 'Started', 'Completed'].entries()) await saveTask(TRYAN, { id: a.id, status: st }, s, T0 + 2 + i, TMODS);
  assert.equal(await taskFeed(TSAM, [a.id], s), null, 'somebody who cannot read tasks was sent a card');
  const feed = await taskFeed(TRYAN, [b.id, a.id, 'k-not-a-task!', a.id, 'kAAAAAAAAAAAA'], s);
  assert.deepEqual(feed.map((x) => x.task.id), [b.id, a.id], 'the cards came back out of the order asked, twice, or with one that is not a task');
  assert.equal(feed[1].task.blocks.length > 0 && feed[1].task.ticks, true, 'a card came back without its description to read and tick');
  assert.deepEqual(feed[1].acts.map((e) => e.changes.map((c) => c.to)), [['Completed'], ['Started'], ['Deferred']], 'the latest changes on a card are not the newest three, newest first');
  assert.deepEqual(feed[0].acts.map((e) => [e.kind, e.by]), [['made', 'Chelsea']], 'a card that was only made does not say who made it');
  assert.deepEqual(await taskFeed(TRYAN, [], s), []);
  const many = [];
  for (let i = 0; i < FEED_PAGE + 5; i++) many.push((await saveTask(TRYAN, { name: 'Task ' + i }, s, T0 + 10 + i, TMODS)).task.id);
  assert.equal((await taskFeed(TRYAN, many, s)).length, FEED_PAGE, 'a page of the feed held more than FEED_PAGE cards');
});

/* ── Comments on tasks (Ryan's ask, 2026-10-21) ──

   A comment is its words, who wrote it and when, kept under its task with the
   writer's mark, which never leaves the server. Only its writer edits it; its
   writer or an administrator deletes it; it goes with its task. Broken on
   purpose when it was written: with the mark check taken out of the edit, the
   second claim of Chelsea's name edited the first one's comment; with the
   comment's words put in the event, the notification carried them. */
test('a comment on a task: its writer edits it, its writer or an administrator deletes it, and it goes with the task', async () => {
  const s = memoryStore({ etagOnRead: true });
  const t = (await saveTask(TRYAN, { name: 'Fix the shelf', who: 'Norah' }, s, T0, TMODS)).task;
  assert.deepEqual(await commentTask(TSAM, t.id, 'Hello', s, T0 + 1, TMODS), { error: 'Tasks are for our directors, board members and administrators, on a claimed username.' });
  assert.equal(await taskComments(TSAM, t.id, s), null, 'somebody who cannot read tasks was sent its comments');
  assert.ok((await commentTask(TCHELSEA, t.id, '', s, T0 + 1, TMODS)).error, 'an empty comment was kept');
  assert.ok((await commentTask(TCHELSEA, t.id, 'x'.repeat(TASK_COMMENT_MAX + 1), s, T0 + 1, TMODS)).error, 'a comment over the limit was kept');
  assert.ok((await commentTask(TCHELSEA, 'kAAAAAAAAAAAA', 'Hello', s, T0 + 1, TMODS)).error, 'a comment was kept on a task that is not there');
  const c = (await commentTask(TCHELSEA, t.id, 'The **screws** are in the drawer.', s, T0 + 5, TMODS)).comment;
  assert.deepEqual(Object.keys(c).sort(), ['blocks', 'body', 'by', 'edited', 'id', 'mine', 't'], 'a comment was sent with more than its words, writer and times');
  assert.equal(c.mine, true);
  const seen = await taskComments(TRYAN, t.id, s);
  assert.equal(seen.length, 1);
  assert.equal(seen[0].mine, false, 'somebody else\'s comment was offered to Ryan as his own');
  assert.ok(!JSON.stringify(seen).includes('mark'), 'a comment\'s mark left the server');
  // The task knows when it was last talked about, and a comment is not a change to it.
  const after = (await readTasks(s)).find((x) => x.id === t.id);
  assert.equal(after.talk, T0 + 5, 'the task does not say when it was last commented on');
  assert.equal(after.edited, undefined, 'a comment counted as a change to the task');
  // Only its writer edits it: not Ryan, an administrator, and not the next person to claim Chelsea's name.
  assert.ok((await editTaskComment(TRYAN, t.id, c.id, 'Changed.', s, T0 + 6, TMODS)).error, 'somebody else edited a comment');
  assert.ok((await editTaskComment(fw('Chelsea', 999, ['director']), t.id, c.id, 'Changed.', s, T0 + 6, TMODS)).error, 'a name claimed again edited its old owner\'s comment');
  const ed = (await editTaskComment(TCHELSEA, t.id, c.id, 'The screws are in the **top** drawer.', s, T0 + 7, TMODS)).comment;
  assert.equal(ed.body, 'The screws are in the **top** drawer.');
  assert.equal(ed.edited, T0 + 7);
  assert.equal(ed.t, T0 + 5, 'an edit changed when the comment was written');
  // Its writer or an administrator deletes it; another director does not.
  const d = (await commentTask(TCHELSEA, t.id, 'A second thought.', s, T0 + 8, TMODS)).comment;
  assert.ok((await removeTaskComment(TNORAH, t.id, c.id, s)).error, 'a director deleted somebody else\'s comment');
  assert.deepEqual(await removeTaskComment(TRYAN, t.id, c.id, s), { gone: true }, 'an administrator could not delete a comment');
  assert.deepEqual(await removeTaskComment(TCHELSEA, t.id, d.id, s), { gone: true });
  assert.ok((await removeTaskComment(TCHELSEA, t.id, d.id, s)).error, 'a comment was deleted twice');
  assert.deepEqual(await taskComments(TRYAN, t.id, s), []);
  // The feed carries the latest comments and how many there are.
  for (let i = 0; i < 3; i++) await commentTask(TNORAH, t.id, 'Note ' + i, s, T0 + 20 + i, TMODS);
  const card = (await taskFeed(TRYAN, [t.id], s))[0];
  assert.deepEqual(card.comments.map((x) => x.body), ['Note 1', 'Note 2'], 'a card\'s comments are not the latest, oldest first');
  assert.equal(card.said, 3);
  // A deleted task takes its comments with it.
  await removeTask(TRYAN, t.id, s, T0 + 30, TMODS);
  assert.equal(await s.get(`task-comments/${t.id}`, { type: 'json' }), null, 'a deleted task\'s comments were left behind');
});

/* Comments brought from Notion keep Notion's id, their writer and their time,
   sit among a task's comments by that time, are mended by bringing them again
   and never doubled, stay deleted once deleted here, and tell nobody. Their
   mark is their writer's claimed username, so they can edit them here. */
test('a comment brought from Notion is its writer\'s, by its time, brought once, kept deleted, and tells nobody', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  await claimAccount('Chelsea', 'chelsea has a phrase', s, 700, TMODS, true);
  const t = (await saveTask(TRYAN, { name: 'Figure out the books', who: 'Norah' }, s, T0, TMODS)).task;
  const here = (await commentTask(TNORAH, t.id, 'Said here.', s, T0 + 50, TMODS)).comment;
  const N1 = 'a'.repeat(32), N2 = 'b'.repeat(32), N3 = 'c'.repeat(32);
  const bring = (f) => importTaskComment(TRYAN, { id: t.id, ...f }, s, T0 + 100);
  assert.ok((await importTaskComment(TSAM, { id: t.id, notion: N1, by: 'Chelsea', t: T0 + 10, body: 'x' }, s, T0 + 100)).error);
  assert.ok((await bring({ notion: 'not-an-id', by: 'Chelsea', t: T0 + 10, body: 'x' })).error, 'a comment with no Notion id was brought');
  assert.ok((await bring({ notion: N1, by: 'Chelsea', t: T0 + 1000, body: 'x' })).error, 'a comment from the future was brought');
  assert.ok((await bring({ notion: N1, t: T0 + 10, body: 'x' })).error, 'a comment with nobody\'s name was brought');
  const a = await bring({ notion: N1, by: 'Chelsea', t: T0 + 10, body: 'Tiffany is working on this.' });
  assert.equal(a.made, true);
  assert.equal(a.comment.from, 'notion');
  assert.equal(a.comment.mine, false, 'Ryan, who brought it, was told it was his');
  assert.ok(!JSON.stringify(a.comment).includes(N1), 'Notion\'s id for a comment was sent to the page');
  await bring({ notion: N2, by: 'Norah', t: T0 + 20, body: 'YNAB can help.' });
  // Brought again: the same comment, mended, never twice.
  const again = await bring({ notion: N1, by: 'Chelsea', t: T0 + 10, body: 'Tiffany is working on this. Follow up as needed.' });
  assert.equal(again.made, false);
  const seen = await taskComments(TCHELSEA, t.id, s);
  assert.deepEqual(seen.map((c) => c.body), ['Tiffany is working on this. Follow up as needed.', 'YNAB can help.', 'Said here.'], 'brought comments do not sit among the task\'s comments by their time, or one was doubled');
  // Its writer, claimed, may edit it; one edited here is left alone when brought again.
  assert.equal(seen[0].mine, true, 'the writer of a brought comment was not told it was theirs');
  assert.equal(seen[1].mine, false, 'a comment by a username nobody has claimed was given to somebody');
  await editTaskComment(TCHELSEA, t.id, seen[0].id, 'Tiffany finished it.', s, T0 + 200, TMODS);
  await bring({ notion: N1, by: 'Chelsea', t: T0 + 10, body: 'Tiffany is working on this.' });
  assert.equal((await taskComments(TRYAN, t.id, s))[0].body, 'Tiffany finished it.', 'bringing a comment again wrote over an edit made here');
  // One nobody claimed is deleted only by an administrator, and then stays deleted.
  assert.ok((await removeTaskComment(TNORAH, t.id, seen[1].id, s)).error, 'a director deleted a brought comment that was not theirs');
  assert.deepEqual(await removeTaskComment(TRYAN, t.id, seen[1].id, s), { gone: true });
  assert.ok((await bring({ notion: N2, by: 'Norah', t: T0 + 20, body: 'YNAB can help.' })).error, 'a brought comment deleted here came back');
  // Nobody is told, and nothing goes in the activity.
  await bring({ notion: N3, by: 'Chelsea', t: T0 + 30, body: '@Norah, look at this.' });
  assert.deepEqual((await taskInbox(TNORAH, s, T0 + 300)).items.filter((x) => x.kind === 'commented').map((x) => x.by), [], 'a brought comment told somebody');
  assert.ok((await taskActivity(TRYAN, t.id, s)).every((e) => e.kind !== 'commented' || e.by === 'Norah'), 'a brought comment went into the activity');
  // An old comment never makes the task look newer than it is.
  assert.equal((await readTasks(s)).find((x) => x.id === t.id).talk, T0 + 50);
  assert.ok(here);
}));

test('a comment tells the people on the task, whoever made it, anybody who commented before and anybody it @mentions, and never its words', async () => {
  const s = memoryStore({ etagOnRead: true });
  const TSARA = fw('Sara', 950, ['director']);
  const mods = readMods('{"Ryan":["administrator","director"],"Chelsea":["director"],"Norah":["director"],"Sara":["director"],"Sam":[]}');
  const t = (await saveTask(TCHELSEA, { name: 'Fix the shelf', who: 'Norah' }, s, T0, mods)).task;
  await commentTask(TRYAN, t.id, 'I can bring a drill.', s, T0 + 1, mods);
  const inbox = async (who) => (await taskInbox(who, s, T0 + 100)).items.filter((x) => x.kind === 'commented');
  assert.deepEqual((await inbox(TNORAH)).map((x) => [x.by, x.why]), [['Ryan', 'yours']], 'whoever the task is assigned to was not told');
  assert.deepEqual((await inbox(TCHELSEA)).map((x) => [x.by, x.why]), [['Ryan', 'yours']], 'whoever made the task was not told');
  assert.deepEqual(await inbox(TRYAN), [], 'somebody was told about their own comment');
  // The next comment tells Ryan, who commented before, and @Sara, who is on nothing, and nobody @Sam, who cannot read tasks.
  const c2 = (await commentTask(TNORAH, t.id, 'Thanks @Ryan. @Sara, could you check? @Sam', s, T0 + 2, mods)).comment;
  assert.deepEqual((await inbox(TRYAN)).map((x) => x.why), ['mentioned'], 'a mention did not outrank having commented');
  assert.deepEqual((await inbox(TSARA)).map((x) => x.why), ['mentioned']);
  assert.deepEqual((await taskInbox(TSAM, s, T0 + 100)), null);
  const ev = (await inbox(TSARA))[0];
  assert.equal(ev.comment, c2.id, 'the notification does not say which comment');
  assert.ok(!JSON.stringify(ev).includes('could you check'), 'a comment\'s words went into a notification');
  // A third, by Chelsea, tells Ryan as somebody who commented before.
  await commentTask(TCHELSEA, t.id, 'On my way.', s, T0 + 3, mods);
  assert.deepEqual((await inbox(TRYAN)).map((x) => x.why), ['commented', 'mentioned']);
  // An edit tells only whoever it newly @mentions, and is in nobody's activity.
  const acts = (await taskActivity(TRYAN, t.id, s)).filter((e) => e.kind === 'commented').length;
  await editTaskComment(TNORAH, t.id, c2.id, 'Thanks @Ryan. @Sara, could you check? @Chelsea too.', s, T0 + 4, mods);
  assert.deepEqual((await inbox(TCHELSEA)).map((x) => x.why), ['mentioned', 'yours', 'yours'], 'an edit did not tell somebody it newly mentioned, once');
  assert.equal((await inbox(TSARA)).length, 1, 'an edit told somebody it had already mentioned');
  assert.equal((await taskActivity(TRYAN, t.id, s)).filter((e) => e.kind === 'commented').length, acts, 'an edited comment went into the activity');
  assert.ok((await taskActivity(TRYAN, t.id, s)).every((e) => !('body' in e)), 'a comment\'s words went into the activity');
});

/* Comments in the office are a task's comments, sealed: on a contact, a grant
   request, a case or a mailing, told in Tasks' Notifications by the record's
   id and what it is, never its name. Broken on purpose when it was written:
   with the comment's words put in the notification, the test caught it there. */
test('a comment in the office is sealed, its writer edits it, its writer or an administrator deletes it, and it goes with its record', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const c = (await saveContact(TRYAN, { first: 'Ada', last: 'Lovelace', email: 'ada@example.org' }, s, T0)).contact;
  const g = (await saveGrant(TRYAN, { name: 'Mutual Aid Grant Request 1: Ada', contactEmail: 'ada@example.org', amount: 500 }, s, T0 + 1)).grant;
  const k = (await saveCase(TRYAN, { name: 'Connection Request: Ada', contactEmail: 'ada@example.org' }, s, T0 + 2)).case;
  assert.equal(await officeComments(TSAM, g.id, s), null, 'somebody who cannot open the office was sent its comments');
  assert.ok((await commentOffice(TSAM, g.id, 'Hello', s, T0 + 3, TMODS)).error);
  assert.ok((await commentOffice(TCHELSEA, 'gAAAAAAAAAAAA', 'Hello', s, T0 + 3, TMODS)).error, 'a comment was kept on a grant request that is not there');
  assert.ok((await commentOffice(TCHELSEA, 'tAAAAAAAAAAAA', 'Hello', s, T0 + 3, TMODS)).error, 'a comment was kept on something that takes none');
  assert.ok((await commentOffice(TCHELSEA, g.id, 'x'.repeat(TASK_COMMENT_MAX + 1), s, T0 + 3, TMODS)).error, 'a comment over the limit was kept');
  const said = (await commentOffice(TCHELSEA, g.id, 'Rent is due on the **first**.', s, T0 + 5, TMODS)).comment;
  assert.equal(said.mine, true);
  // Sealed where it is kept: the words are nowhere in the blob.
  const raw = JSON.stringify(await s.get(`office-comments/${g.id}`, { type: 'json' }));
  assert.ok(raw && !raw.includes('Rent is due') && !raw.includes('Chelsea'), 'an office comment was kept unsealed');
  const seen = await officeComments(TRYAN, g.id, s);
  assert.equal(seen.length, 1);
  assert.equal(seen[0].mine, false);
  assert.ok(!JSON.stringify(seen).includes('mark'), 'a comment\'s mark left the server');
  const after = (await officeGrant(TRYAN, g.id, s));
  assert.equal(after.talk, T0 + 5, 'the grant request does not say when it was last commented on');
  assert.equal(after.edited, null, 'a comment counted as a change to the grant request');
  // Only its writer edits it, and the writer or an administrator deletes it.
  assert.ok((await editOfficeComment(TRYAN, g.id, said.id, 'Changed.', s, T0 + 6, TMODS)).error, 'somebody else edited a comment');
  assert.ok((await editOfficeComment(fw('Chelsea', 999, ['director']), g.id, said.id, 'Changed.', s, T0 + 6, TMODS)).error, 'a name claimed again edited its old owner\'s comment');
  assert.equal((await editOfficeComment(TCHELSEA, g.id, said.id, 'Rent is due on the 1st.', s, T0 + 7, TMODS)).comment.edited, T0 + 7);
  assert.ok((await removeOfficeComment(TNORAH, g.id, said.id, s)).error, 'a director deleted somebody else\'s comment');
  assert.deepEqual(await removeOfficeComment(TRYAN, g.id, said.id, s), { gone: true }, 'an administrator could not delete a comment');
  // Contacts and cases take comments too, and the feed carries the latest.
  await commentOffice(TNORAH, c.id, 'Met at the fair.', s, T0 + 8, TMODS);
  for (let i = 0; i < 3; i++) await commentOffice(TNORAH, k.id, 'Note ' + i, s, T0 + 10 + i, TMODS);
  const feed = await officeFeed(TRYAN, [k.id, c.id], s);
  assert.deepEqual(feed.map((x) => [x.kind, x.said, x.comments.map((y) => y.body)]), [['case', 3, ['Note 1', 'Note 2']], ['contact', 1, ['Met at the fair.']]]);
  // Deleting a record takes its comments.
  await removeCase(TRYAN, k.id, s);
  assert.equal(await s.get(`office-comments/${k.id}`, { type: 'json' }), null, 'a deleted case\'s comments were left behind');
  await removeContact(TRYAN, c.id, s);
  assert.equal(await s.get(`office-comments/${c.id}`, { type: 'json' }), null, 'a deleted contact\'s comments were left behind');
}));

test('a template and a filed email take comments too, an email by email- and its Gmail id, and each takes them when it goes', () => withOfficeKey(OFFICE_TEST_KEY, () => withMailKey(MAIL_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const ada = (await saveContact(TRYAN, { first: 'Ada', last: 'Lovelace', email: 'ada@example.org' }, s, T0)).contact;
  const t = (await saveTemplate(TCHELSEA, { name: 'Welcome', subject: 'Hello {first}', body: 'Hello {first}.' }, s, T0)).template;
  assert.equal(await officeTemplate(TSAM, t.id, s), null, 'somebody who cannot open the office was sent a template');
  assert.equal((await officeTemplate(TRYAN, t.id, s)).name, 'Welcome');
  const tc = (await commentOffice(TRYAN, t.id, 'Shorter, @Chelsea?', s, T0 + 1, TMODS)).comment;
  assert.ok(tc, 'a template took no comment');
  assert.deepEqual((await taskInbox(TCHELSEA, s, T0 + 100)).items.filter((x) => x.kind === 'office').map((x) => [x.what, x.rec, x.why]), [['template', t.id, 'mentioned']]);
  await removeTemplate(TRYAN, t.id, s);
  assert.equal(await s.get(`office-comments/${t.id}`, { type: 'json' }), null, 'a deleted template\'s comments were left behind');
  // An email, by email- and its Gmail id; the bare Gmail id names nothing a comment can be on.
  await officeMailIn(mailFrom(1), s, T0);
  const gid = mailFrom(1).id;
  assert.ok((await commentOffice(TRYAN, gid, 'Hello', s, T0 + 2, TMODS)).error, 'a bare Gmail id was taken for something');
  assert.ok((await commentOffice(TRYAN, 'email-ffffffffffffffff', 'Hello', s, T0 + 2, TMODS)).error, 'a comment was kept on an email that is not there');
  const ec = (await commentOffice(TRYAN, 'email-' + gid, 'I replied, @Norah.', s, T0 + 3, TMODS)).comment;
  assert.ok(ec, 'an email took no comment');
  assert.deepEqual((await officeComments(TCHELSEA, 'email-' + gid, s)).map((x) => x.body), ['I replied, @Norah.']);
  const told = (await taskInbox(TNORAH, s, T0 + 100)).items.filter((x) => x.kind === 'office');
  assert.deepEqual(told.map((x) => [x.what, x.rec]), [['email', 'email-' + gid]]);
  assert.ok(!JSON.stringify(told).includes('About the grant'), 'an email\'s subject went into a notification');
  await removeEmail(TRYAN, gid, s);
  assert.equal(await s.get(`office-comments/email-${gid}`, { type: 'json' }), null, 'a deleted email\'s comments were left behind');
  // An email that goes with its only contact takes its comments with it too.
  await officeMailIn(mailFrom(2), s, T0);
  const g2 = mailFrom(2).id;
  await commentOffice(TRYAN, 'email-' + g2, 'Filed.', s, T0 + 4, TMODS);
  await removeContact(TRYAN, ada.id, s);
  assert.equal(await s.get(`office-comments/email-${g2}`, { type: 'json' }), null, 'an email that went with its contact left its comments behind');
})));

test('a comment in the office tells whoever added the record, anybody who commented before and anybody it @mentions, in Tasks\' Notifications, naming nothing sealed', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const g = (await saveGrant(TRYAN, { name: 'Creator Grant Request 7: Grace Hopper', amount: 3000 }, s, T0)).grant;
  await commentOffice(TCHELSEA, g.id, 'Looks good to me.', s, T0 + 1, TMODS);
  const inbox = async (who) => (await taskInbox(who, s, T0 + 100)).items.filter((x) => x.kind === 'office');
  assert.deepEqual((await inbox(TRYAN)).map((x) => [x.by, x.why, x.what, x.rec]), [['Chelsea', 'yours', 'grant', g.id]], 'whoever added the record was not told');
  assert.deepEqual(await inbox(TCHELSEA), [], 'somebody was told about their own comment');
  assert.deepEqual(await inbox(TNORAH), [], 'somebody it does not concern was told');
  await commentOffice(TNORAH, g.id, '@Chelsea, can you send the agreement?', s, T0 + 2, TMODS);
  assert.deepEqual((await inbox(TCHELSEA)).map((x) => x.why), ['mentioned']);
  assert.deepEqual((await inbox(TRYAN)).map((x) => x.why), ['yours', 'yours']);
  const all = JSON.stringify((await taskInbox(TRYAN, s, T0 + 100)).items);
  assert.ok(!all.includes('Grace') && !all.includes('Looks good'), 'a notification carried a record\'s name or a comment\'s words out of the office\'s seal');
}));

test('the office\'s feed: grant requests, cases and contacts by their ids, whole, and only for directors, board members and administrators', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const c = (await saveContact(TRYAN, { first: 'Ada', last: 'Lovelace', email: 'ada@example.org', notes: 'Met at the **fair**.' }, s, T0)).contact;
  const g = (await saveGrant(TRYAN, { name: 'Mutual Aid Grant Request 1: Ada', contactEmail: 'ada@example.org', amount: 500, body: 'Rent, **please**.' }, s, T0 + 1)).grant;
  const k = (await saveCase(TRYAN, { name: 'Connection Request: Ada', contactEmail: 'ada@example.org', body: 'Wants to **join**.' }, s, T0 + 2)).case;
  for (const who of [TSAM, fw('Chelsea', 700)]) assert.equal(await officeFeed(who, [g.id], s), null, 'somebody who cannot open the office was sent a card');
  const feed = await officeFeed(TRYAN, [k.id, 'nonsense', g.id, c.id, g.id, 'gAAAAAAAAAAAA'], s);
  assert.deepEqual(feed.map((x) => x.kind), ['case', 'grant', 'contact'], 'the cards came back out of order, twice, or with one that is nothing');
  assert.equal(feed[0].case.id, k.id);
  assert.equal(feed[1].grant.contactName, 'Ada Lovelace');
  for (const [x, key] of [[feed[0].case, 'blocks'], [feed[1].grant, 'blocks'], [feed[2].contact, 'blocks']]) assert.ok(x[key] && x[key].length, 'a card came back without its words to read');
  assert.deepEqual(await officeFeed(TRYAN, [], s), []);
  const many = [];
  for (let i = 0; i < OFFICE_FEED_PAGE + 3; i++) many.push((await saveContact(TRYAN, { first: 'P' + i, email: `p${i}@example.org` }, s, T0 + 10 + i)).contact.id);
  assert.equal((await officeFeed(TRYAN, many, s)).length, OFFICE_FEED_PAGE, 'a page of the office\'s feed held more than OFFICE_FEED_PAGE cards');
}));

// INVITES AND JOINING (Ryan's brief, 2026-10-21). The names and roles here are
// made up: who holds which role is not ours to publish, in a test or anywhere.
const IMOD = { handle: 'Juniper', role: 'base', roles: new Set(['moderator']), account: true };
const IADA = { handle: 'Ada', role: 'mobile', roles: new Set(), account: true };

test('an invite is made and deleted only at the desk, and counts its uses and never who used them', () => withPasswords(async () => {
  const S = memoryStore({ etagOnRead: true });
  const mods = readMods('{"Juniper":[]}');
  assert.ok((await makeInvite(IADA, { most: 1, days: 7 }, S, 0)).error, 'somebody who is not a moderator made an invite');
  assert.ok((await makeInvite(IMOD, { most: 3, days: 7 }, S, 0)).error, 'an invite took a number of uses the desk does not offer');
  assert.ok((await makeInvite(IMOD, { most: 1, days: 2 }, S, 0)).error, 'an invite took a number of days the desk does not offer');
  const { invite } = await makeInvite(IMOD, { note: '  for the  garden club  ', most: 5, days: 7 }, S, 0);
  assert.match(invite.code, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  assert.equal(invite.note, 'for the garden club'); assert.equal(invite.by, 'Juniper'); assert.equal(invite.state, 'open');
  assert.deepEqual((await checkInvite(invite.code.toLowerCase().replace(/-/g, ' '), S, 1)), { ok: true, until: 7 * 86400000 });
  const j = await joinAccount({ invite: invite.code, handle: 'Bex', password: 'bex has a long phrase' }, mods, S, 2);
  assert.match(j.pass, /^cb2\.acct\./); assert.equal(j.handle, 'Bex'); assert.match(j.recovery, /^[A-Z2-9]{4}(-[A-Z2-9]{4}){3}$/);
  const raw = JSON.stringify(await S.get('invites', { type: 'json' }));
  assert.ok(!raw.toLowerCase().includes('bex'), 'the invite kept who joined with it');
  const [one] = (await listInvites(IMOD, S, 3)).invites;
  assert.equal(one.used, 1);
  assert.deepEqual(Object.keys(one).sort(), ['by', 'code', 'id', 'made', 'most', 'note', 'state', 'until', 'used']);
  assert.ok((await listInvites(IADA, S)).error, 'somebody who is not a moderator read the invites');
  assert.ok((await deleteInvite(IADA, one.id, S)).error);
  assert.equal((await deleteInvite(IMOD, one.id, S)).gone, true);
  assert.equal((await checkInvite(invite.code, S, 4)).ok, false, 'a deleted invite still works');
  assert.ok((await joinAccount({ invite: invite.code, handle: 'Cy', password: 'cy has a long phrase' }, mods, S, 5)).error);
  assert.ok(await readAccount('Bex', S), 'deleting the invite took the username made with it');
}));

test('an invite runs out of time and of uses, and a refused join costs it nothing', () => withPasswords(async () => {
  const S = memoryStore({ etagOnRead: true });
  const mods = readMods('{"Juniper":[]}');
  const once = (await makeInvite(IMOD, { most: 1, days: 1 }, S, 0)).invite;
  // Refused for its password, its address and a name taken: no use taken.
  await claimAccount('Taken', 'taken has a phrase', S, 0, null);
  assert.ok((await joinAccount({ invite: once.code, handle: 'Dee', password: 'short' }, mods, S, 1)).error);
  assert.ok((await joinAccount({ invite: once.code, handle: 'Dee', password: 'community-pw' }, mods, S, 1)).error, 'the starter password taken as somebody\'s own');
  assert.ok((await joinAccount({ invite: once.code, handle: 'Dee', password: 'dee has a long phrase', email: 'not an address' }, mods, S, 1)).error);
  assert.equal((await joinAccount({ invite: once.code, handle: 'taken', password: 'dee has a long phrase' }, mods, S, 1)).taken, true);
  assert.equal((await readInvites(S))[0].used, 0, 'a refused join used the invite');
  assert.ok((await joinAccount({ invite: once.code, handle: 'Dee', password: 'dee has a long phrase' }, mods, S, 2)).pass);
  assert.match((await joinAccount({ invite: once.code, handle: 'Eli', password: 'eli has a long phrase' }, mods, S, 3)).error, /used as many times/);
  assert.equal((await listInvites(IMOD, S, 3)).invites[0].state, 'used');
  const day = (await makeInvite(IMOD, { most: 0, days: 1 }, S, 0)).invite;
  assert.match((await joinAccount({ invite: day.code, handle: 'Eli', password: 'eli has a long phrase' }, mods, S, 86400000)).error, /run out of time/);
  assert.match((await joinAccount({ invite: 'ABCD-EFGH-JKLM', handle: 'Eli', password: 'eli has a long phrase' }, mods, S, 1)).error, /not an invite code/);
  assert.ok((await joinAccount({ handle: 'Eli', password: 'eli has a long phrase' }, mods, S, 1)).error, 'joined with no invite');
  // A month after it stopped, an invite leaves the list when the next one is made.
  await makeInvite(IMOD, { most: 0, days: 0 }, S, 86400000 * 32);
  assert.deepEqual((await readInvites(S)).map((i) => i.most), [0], 'finished invites stayed past their month');
  const never = (await readInvites(S))[0];
  assert.equal(never.until, 0); assert.equal((await checkInvite(never.code, S, 86400000 * 9999)).ok, true);
}));

test('fifteen people at an invite with five uses: five get in, and one name goes to one person', () => withPasswords(async () => {
  const S = memoryStore({ etagOnRead: true });
  const mods = readMods('{"Juniper":[]}');
  const five = (await makeInvite(IMOD, { most: 5, days: 7 }, S, 0)).invite;
  const got = await Promise.all(Array.from({ length: 15 }, (_, i) => joinAccount({ invite: five.code, handle: `P${i}`, password: `person number ${i}` }, mods, S, 1)));
  assert.equal(got.filter((r) => r.pass).length, 5, 'an invite let in more than it was made for, or fewer');
  assert.equal((await readInvites(S))[0].used, 5);
  const any = (await makeInvite(IMOD, { most: 0, days: 0 }, S, 0)).invite;
  const one = await Promise.all(Array.from({ length: 15 }, (_, i) => joinAccount({ invite: any.code, handle: 'Wren', password: `password number ${i}` }, mods, S, 1)));
  assert.equal(one.filter((r) => r.pass).length, 1);
  assert.equal((await readInvites(S)).find((i) => i.id === any.id).used, 1, 'a join that lost the name kept its use');
}));

test('a moderator\'s username is claimed only with the moderators\' password, which needs no invite', () => withPasswords(async () => {
  const S = memoryStore({ etagOnRead: true });
  const mods = readMods('{"Juniper":["board"]}');
  const inv = (await makeInvite(IMOD, { most: 0, days: 0 }, S, 0)).invite;
  assert.deepEqual(await checkHandle('juniper ', mods, S), { ok: true, mod: true, handle: 'Juniper' });
  assert.equal((await joinAccount({ invite: inv.code, handle: 'juniper', password: 'juniper has a phrase' }, mods, S, 1)).mod, true, 'an invite was enough for a moderator\'s username');
  assert.ok((await joinAccount({ handle: 'Juniper', modPassword: 'community-pw', password: 'juniper has a phrase' }, mods, S, 1)).error);
  assert.ok((await joinAccount({ handle: 'Juniper', modPassword: 'moderators-pw', password: 'moderators-pw' }, mods, S, 1)).error, 'the shared password taken as a moderator\'s own');
  assert.ok((await joinAccount({ handle: 'Juniper', modPassword: 'moderators-pw', password: 'juniper has a phrase' }, null, S, 1)).error, 'no readable list, and somebody joined');
  const j = await joinAccount({ handle: 'JUNIPER', modPassword: 'moderators-pw', password: 'juniper has a phrase' }, mods, S, 1);
  assert.match(j.pass, /^cb2\.base\./); assert.equal(j.handle, 'Juniper'); assert.deepEqual(j.roles, ['board', 'moderator']);
  assert.equal((await readInvites(S))[0].used, 0, 'a moderator used an invite');
  assert.equal((await checkHandle('Juniper', mods, S)).taken, true);
  assert.equal((await signOn('Juniper', 'juniper has a phrase', mods, S)).role, 'base');
}));

test('an email address is kept sealed, only when recovery by email is on, and only its owner changes it', () => withPasswords(() => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const S = memoryStore({ etagOnRead: true });
  const mods = readMods('{"Juniper":[]}');
  const inv = (await makeInvite(IMOD, { most: 0, days: 0 }, S, 0)).invite;
  await withMailKey(null, async () => {
    assert.equal(emailOn(), false);
    assert.match((await joinAccount({ invite: inv.code, handle: 'Fay', password: 'fay has a long phrase', email: 'fay@example.org' }, mods, S, 1)).error, /not switched on/);
    assert.deepEqual(await mailResetCode('Fay', 'fay@example.org', S, 1), { off: true });
  });
  await withMailKey(MAIL_TEST_KEY, async () => {
    assert.equal(cleanAddress('  Fay@Example.ORG '), 'fay@example.org');
    assert.equal(cleanAddress('fay at example'), null);
    assert.ok((await joinAccount({ invite: inv.code, handle: 'Fay', password: 'fay has a long phrase', email: ' Fay@Example.org ' }, mods, S, 1)).pass);
    const raw = JSON.stringify(await S.get(`acct/${acctKey('Fay')}`, { type: 'json' }));
    assert.ok(!raw.includes('example.org'), 'an address kept in the clear');
    assert.equal(accountEmail(await readAccount('Fay', S)), 'fay@example.org');
    assert.ok((await setAccountEmail('Fay', 'the wrong password', 'fay@example.net', S, 2)).error, 'an address changed without the password');
    assert.equal((await setAccountEmail('Fay', 'fay has a long phrase', 'fay@example.net', S, 2)).email, 'fay@example.net');
    assert.equal((await setAccountEmail('Fay', 'fay has a long phrase', '', S, 3)).email, null);
    assert.equal(accountEmail(await readAccount('Fay', S)), null);
    assert.ok(!('email' in (await readAccount('Fay', S))), 'taking the address off left something of it');
  });
})));

test('a reset code by email goes only to the address on the username, says the same either way, and keeps nothing once sent', () => withPasswords(() => withOfficeKey(OFFICE_TEST_KEY, () => withMailKey(MAIL_TEST_KEY, async () => {
  const S = memoryStore({ etagOnRead: true });
  await claimAccount('Gus', 'gus has a long phrase', S, 0, null, false, 'gus@example.org');
  await claimAccount('Hal', 'hal has a long phrase', S, 0, null);
  const T = 1000;
  assert.deepEqual(await mailResetCode('Gus', 'someone@example.org', S, T), {});
  assert.deepEqual(await mailResetCode('Hal', 'hal@example.org', S, T), {});
  assert.deepEqual(await mailResetCode('Nobody', 'gus@example.org', S, T), {});
  assert.deepEqual(await mailOutbox(S, T), [], 'an email went where it should not');
  assert.deepEqual(await mailResetCode('gus', 'GUS@example.org', S, T), {});
  const box = await mailOutbox(S, T + 1);
  assert.equal(box.length, 1); assert.equal(box[0].to, 'gus@example.org'); assert.equal(box[0].subject, ACCT_MAIL_SUBJECT);
  const code = /The reset code: ([A-Z2-9-]+)/.exec(box[0].body)[1];
  // Asking again within the quarter hour sends nothing more, and asking signs nobody off.
  await mailResetCode('Gus', 'gus@example.org', S, T + ACCT_MAIL_GAP - 1);
  assert.equal((await mailOutbox(S, T + 2)).length, 1);
  assert.equal((await signOn('Gus', 'gus has a long phrase', null, S, T + 3)).account, 1, 'asking for a code by email signed the username off');
  // Sent: the outbox forgets it, and the email the mailbox sent is not filed in the office.
  assert.deepEqual(await mailSentFor({ id: box[0].id }, S, T + 4), { ok: true, known: true });
  assert.deepEqual(await mailOutbox(S, T + 4), []);
  assert.ok(!JSON.stringify(unseal(await S.get('acct-outbox', { type: 'json' }))).includes('gus@'), 'a sent reset email was kept');
  // Even when the address is a contact's in the office.
  assert.ok((await saveContact(TRYAN, { first: 'Gus', email: 'gus@example.org' }, S, T)).contact);
  const filed = await officeMailIn({ id: 'abcdef12', mailbox: 'team@example.org', at: T, from: 'Stimpunks <team@example.org>', to: ['gus@example.org'], subject: ACCT_MAIL_SUBJECT, text: box[0].body }, S, T + 5);
  assert.equal(filed.kept, false, 'the office filed somebody\'s reset code');
  assert.equal((await officeMailIn({ id: 'abcdef13', mailbox: 'team@example.org', at: T, from: 'Stimpunks <team@example.org>', to: ['gus@example.org'], subject: 'Hello', text: 'hi' }, S, T + 5)).kept, true);
  // The code works for an hour, once, and moves the version.
  assert.ok((await recoverAccount('Gus', code, 'gus has a new phrase', S, T + ACCT_MAIL_FOR + 1)).error, 'a code by email worked past its hour');
  await mailResetCode('Gus', 'gus@example.org', S, T + ACCT_MAIL_GAP + 1);
  const code2 = /The reset code: ([A-Z2-9-]+)/.exec((await mailOutbox(S, T + ACCT_MAIL_GAP + 2))[0].body)[1];
  const back = await recoverAccount('Gus', code2.toLowerCase(), 'gus has a new phrase', S, T + ACCT_MAIL_GAP + 3);
  assert.equal(back.v, 2);
  assert.ok((await recoverAccount('Gus', code2, 'and another phrase', S, T + ACCT_MAIL_GAP + 4)).error, 'a code by email worked twice');
  // One nobody sent in its hour is never handed to the script.
  await mailResetCode('Gus', 'gus@example.org', S, T + ACCT_MAIL_GAP * 3);
  assert.deepEqual(await mailOutbox(S, T + ACCT_MAIL_GAP * 3 + ACCT_MAIL_FOR), []);
}))));

/* LINKS, after Notion's (2026-10-21): a token in the words, named for each
   reader by the server, and backlinks kept by the store writers themselves. */
import { linksIn, resolveLinks, nameRefs, findLinks, backlinksTo } from './lib.mjs';

test('a link is a token in the words, named for each reader, and a member is never told a name', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const t = (await saveTask(TCHELSEA, { name: 'Quarterly receipts' }, s, T0, TMODS)).task;
  const g = (await saveGrant(TRYAN, { name: 'Mutual aid for rent', amount: 250 }, s, T0)).grant;
  const top = (await startTopic(ADA, { cat: 'help-desk', title: 'How do I link?', body: `See [[task:${t.id}]] and [[grant:${g.id}]].` }, s, T0, NO_NET)).topic;
  assert.deepEqual(parseBrass(`a [[task:${t.id}]] b`, { refs: true })[0].c[1], { t: 'ref', kind: 'task', id: t.id });
  assert.equal(parseBrass(`a [[task:${t.id}]]`)[0].c[0].v, `a [[task:${t.id}]]`, 'a page that names no links drew one');
  assert.deepEqual(linksIn(`x [[task:${t.id}]] \`[[grant:${g.id}]]\` [[task:${t.id}]] [[task:nope]]\n\`\`\`\n[[grant:${g.id}]]\n\`\`\``), ['task:' + t.id], 'code linked, or a link counted twice');
  const asAda = await nameRefs(await forumTopic(ADA, top.id, s, T0), ADA, s, T0);
  assert.deepEqual(asAda.posts[0].blocks[0].c.filter((n) => n.t === 'ref').map((n) => [n.kind, n.shut, n.name]), [['task', true, undefined], ['grant', true, undefined]]);
  assert.ok(!/Quarterly|Mutual aid/.test(JSON.stringify(asAda)), 'a member was told a name');
  const asCh = await nameRefs(await forumTopic(TCHELSEA, top.id, s, T0), TCHELSEA, s, T0);
  assert.deepEqual(asCh.posts[0].blocks[0].c.filter((n) => n.t === 'ref').map((n) => n.name), ['Quarterly receipts', 'Mutual aid for rent']);
  await removeTask(TRYAN, t.id, s);
  const names = await resolveLinks(TCHELSEA, ['task:' + t.id, 'topic:' + top.id, 'grant:not-an-id'], s, T0);
  assert.deepEqual(names['task:' + t.id], { gone: true });
  assert.equal(names['topic:' + top.id].name, 'How do I link?');
  assert.equal(names['grant:not-an-id'], undefined);
  assert.deepEqual((await resolveLinks(ADA, ['task:' + t.id], s, T0))['task:' + t.id], { shut: true }, 'a member learned a task was deleted');
  // Without the office's key a grant request is shut, never named from anywhere else.
  await withOfficeKey(null, async () => assert.deepEqual((await resolveLinks(TCHELSEA, ['grant:' + g.id], s, T0))['grant:' + g.id], { shut: true }));
  // The [[ menu offers only what the reader could open.
  assert.deepEqual((await findLinks(ADA, 'rent', s, T0)).map((x) => x.kind), []);
  assert.deepEqual((await findLinks(ADA, 'link', s, T0)).map((x) => [x.kind, x.name]), [['topic', 'How do I link?']]);
  assert.deepEqual((await findLinks(TCHELSEA, 'rent', s, T0)).map((x) => [x.kind, x.name]), [['grant', 'Mutual aid for rent']]);
}));

test('backlinks follow every write and delete, come from what keeps, and show only what the reader could open', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  const t = (await saveTask(TCHELSEA, { name: 'Pay invoices', body: `Myself: [[task:x]]` }, s, T0, TMODS)).task;
  await saveTask(TCHELSEA, { id: t.id, body: `Myself: [[task:${t.id}]]` }, s, T0 + 1, TMODS);
  const t2 = (await saveTask(TCHELSEA, { name: 'Before that', body: `After [[task:${t.id}]].` }, s, T0 + 2, TMODS)).task;
  assert.ok((await commentTask(TCHELSEA, t2.id, `And [[task:${t.id}]]`, s, T0 + 3, TMODS)).comment);
  const pub = (await startTopic(ADA, { cat: 'help-desk', title: 'Invoices', body: `[[task:${t.id}]] please` }, s, T0 + 4, NO_NET)).topic;
  const priv = (await startTopic(TCHELSEA, { cat: 'directors', title: 'Between us', body: `[[task:${t.id}]]` }, s, T0 + 5, NO_NET)).topic;
  const g = (await saveGrant(TRYAN, { name: 'A grant', body: `Paid from [[task:${t.id}]]` }, s, T0 + 6)).grant;
  const from = async (who) => (await backlinksTo(who, 'task', t.id, s, T0 + 7)).map((b) => [b.from, b.name]);
  assert.deepEqual(await from(TCHELSEA), [['grant', 'A grant'], ['topic', 'Between us'], ['topic', 'Invoices'], ['comment', 'Before that'], ['task', 'Before that']], 'not every source, in order, or the task itself');
  assert.deepEqual(await from(ADA), [['topic', 'Invoices']], 'a member saw a source they could not open');
  // The topic's backlinks: a member sees none, because a task is not theirs to open.
  await saveTask(TCHELSEA, { id: t2.id, body: `See [[topic:${pub.id}]]` }, s, T0 + 8, TMODS);
  assert.deepEqual((await backlinksTo(ADA, 'topic', pub.id, s, T0 + 9)), []);
  assert.deepEqual((await backlinksTo(TCHELSEA, 'topic', pub.id, s, T0 + 9)).map((b) => b.from), ['task']);
  // The office's sources are sealed, and never in the plain index.
  const plain = await s.get('backlinks', { type: 'json' });
  assert.ok(Object.keys(plain.from).every((k) => /^(task|taskc|post):/.test(k)), 'an office source was kept in the clear');
  assertSealed(await s.get('office-backlinks', { type: 'json' }), ['grant:' + g.id]);
  // An edit takes a link away, and a delete takes its sources away.
  assert.deepEqual((await from(TCHELSEA)).map((x) => x[0]), ['grant', 'topic', 'topic', 'comment'], 'the edited task still linked');
  await removeTask(TRYAN, t2.id, s);
  await removeTopic(ADA, pub.id, s, T0 + 10);
  await saveGrant(TRYAN, { id: g.id, body: 'Paid.' }, s, T0 + 11);
  assert.deepEqual(await from(TCHELSEA), [['topic', 'Between us']]);
  assert.ok(Object.keys((await s.get('backlinks', { type: 'json' })).from).every((k) => !k.includes(t2.id) && !k.includes(pub.id)), 'a deleted source stayed in the index');
}));

/* ROLES KEPT WITH THE CB (2026-10-21): CB_MODS is only the break-glass list,
   everybody else's roles are stored and changed at the desk by administrators,
   and board is given or taken only by the board or the break-glass list.
   Placeholder names only: who holds which role is not ours to publish. */
import { loadMods, unloadMods, rolesList, setRoles, rolesEditor, MODS_FRESH } from './lib.mjs';

async function withBreakGlass(list, fn) {
  const was = process.env.CB_MODS;
  if (list == null) delete process.env.CB_MODS; else process.env.CB_MODS = list;
  unloadMods();
  try { await withPasswords(fn); } finally {
    unloadMods();
    if (was === undefined) delete process.env.CB_MODS; else process.env.CB_MODS = was;
  }
}
const desk = (handle, roles, fixed = false) => ({ role: 'base', handle, roles: new Set(['moderator', ...roles]), account: true, since: 1, fixed });

test('the break-glass list and the stored roles are read together, and the break-glass list wins', () => withBreakGlass('{"Juniper":["administrator","board"],"Quill":["administrator"]}', async () => {
  const s = memoryStore({ etagOnRead: true });
  const glass = desk('Juniper', ['administrator', 'board'], true);
  assert.ok(rolesEditor(glass) && !rolesEditor(desk('Ada', ['director'])) && !rolesEditor({ role: 'mobile', handle: 'Ada', roles: new Set() }));
  assert.ok((await setRoles(glass, 'Ada', ['director'], s, T0)).people);
  assert.equal(readMods().get('ada').roles.has('director'), true, 'the instance that made a change did not have it at once');
  unloadMods();
  assert.equal(readMods().has('ada'), false, 'a stored role was there without being loaded');
  assert.equal(readMods().partial, true);
  await loadMods(s, T0);
  const all = readMods();
  assert.deepEqual([...all.get('ada').roles].sort(), ['director', 'moderator']);
  assert.equal(all.get('juniper').fixed, true); assert.equal(!!all.get('ada').fixed, false); assert.equal(all.partial, false);
  // A stored entry that folds like a break-glass one never overrides it, and the desk refuses to make one.
  assert.match((await setRoles(glass, 'quill', [], s, T0)).error, /break-glass/);
  const s2 = memoryStore({ etagOnRead: true });
  await s2.setJSON('roles', { people: { quill: { handle: 'Quill', roles: [], by: 'x', t: 1 }, ada: { handle: 'Ada', roles: ['director'], by: 'Juniper', t: T0 } } }, { onlyIfNew: true });
  await loadMods(s2, T0);
  assert.equal(readMods().get('quill').roles.has('administrator'), true, 'a stored entry overrode the break-glass list');
  // Stored roles that cannot be trusted leave only the break-glass list.
  const s3 = memoryStore({ etagOnRead: true });
  await s3.setJSON('roles', { people: { ada: { handle: 'Ada', roles: ['emperor'] } } }, { onlyIfNew: true });
  await loadMods(s3, T0);
  assert.equal(readMods().has('ada'), false); assert.equal(readMods().partial, true); assert.ok(readMods().has('juniper'));
  // An unreadable break-glass list locks everything, as an unreadable CB_MODS always did.
  process.env.CB_MODS = '{not json';
  assert.equal(readMods(), null);
}));

test('the desk is for administrators, keeps who changed a name last and nothing more, and board needs the board', () => withBreakGlass('{"Juniper":["administrator","board"]}', async () => {
  const s = memoryStore({ etagOnRead: true });
  const glass = desk('Juniper', ['administrator', 'board'], true);
  const admin = desk('Quill', ['administrator']);
  const boardAdmin = desk('Bo', ['administrator', 'board']);
  assert.match((await setRoles(desk('Ada', ['director']), 'Bo', [], s, T0)).error, /administrators/);
  assert.equal(await rolesList(desk('Ada', ['director']), s), null);
  await setRoles(glass, 'Quill', ['administrator'], s, T0);
  await claimAccount('Bo', 'bo has a long phrase', s, T0);
  const made = await setRoles(admin, 'bo', ['director'], s, T0 + 1);
  const bo = made.people.find((x) => x.handle === 'Bo');
  assert.deepEqual([bo.roles, bo.by, bo.t, bo.claimed], [['director'], 'Quill', T0 + 1, true], 'not the claimed spelling, or not who changed it and when');
  const kept = (await s.get('roles', { type: 'json' })).people;
  assert.deepEqual(Object.keys(kept.bo).sort(), ['by', 'handle', 'roles', 't'], 'the roles keep more than who changed them last and when');
  // An administrator who is not on the board cannot give board, or take it away.
  assert.match((await setRoles(admin, 'Bo', ['director', 'board'], s, T0 + 2)).error, /board/);
  assert.ok((await setRoles(glass, 'Bo', ['administrator', 'board'], s, T0 + 3)).people, 'the break-glass list could not give board');
  assert.match((await setRoles(admin, 'Bo', ['administrator'], s, T0 + 4)).error, /board/);
  assert.match((await setRoles(admin, 'Bo', [], s, T0 + 4, true)).error, /board/, 'board went with taking somebody off the list');
  assert.ok((await setRoles(boardAdmin, 'Bo', ['administrator'], s, T0 + 5)).people, 'the board could not take board away');
  assert.match((await setRoles(admin, 'Bo', ['emperor'], s, T0)).error, /role is one of/);
  assert.match((await setRoles(admin, 'Nobody', [], s, T0, true)).error, /not on the list/);
  assert.ok((await setRoles(admin, 'Bo', [], s, T0 + 6, true)).people.every((x) => x.handle !== 'Bo'));
  assert.equal((await rolesList(admin, s)).mayBoard, false);
  assert.equal((await rolesList(glass, s)).mayBoard, true);
}));

test('nobody is left without an administrator', () => withBreakGlass('{"Juniper":["director"]}', async () => {
  const s = memoryStore({ etagOnRead: true });
  await s.setJSON('roles', { people: { quill: { handle: 'Quill', roles: ['administrator'], by: 'x', t: 1 } } }, { onlyIfNew: true });
  const quill = desk('Quill', ['administrator']);
  assert.match((await setRoles(quill, 'Quill', [], s, T0)).error, /nobody an administrator/);
  assert.match((await setRoles(quill, 'Quill', [], s, T0, true)).error, /nobody an administrator/);
  assert.ok((await setRoles(quill, 'Ada', ['administrator'], s, T0)).people);
  assert.ok((await setRoles(quill, 'Quill', [], s, T0 + 1)).people, 'with another administrator, one could not step down');
}));

test('fifteen administrators changing fifteen names at once lose nothing', () => withBreakGlass('{"Juniper":["administrator","board"]}', async () => {
  for (const etagOnRead of [true, false]) {
    const s = memoryStore({ etagOnRead });
    const glass = desk('Juniper', ['administrator', 'board'], true);
    const results = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => setRoles(glass, `p${i}`, ['director'], s, T0)));
    const said = results.filter((r) => r.status === 'fulfilled' && r.value.people).length;
    const kept = Object.keys((await s.get('roles', { type: 'json' })).people);
    results.forEach((r, i) => { if (r.status === 'fulfilled' && r.value.people) assert.ok(kept.includes(`p${i}`), `p${i} was told it worked and is not there`); });
    if (etagOnRead) assert.equal(said, 15);
  }
}));

test('the board opens Tasks and the office, as directors and administrators do (2026-10-22)', () => {
  const boardOnly = fw('Bea', 900, ['board']);
  assert.equal(tasksAllow(boardOnly), true, 'a board member could not open Tasks');
  assert.equal(officeAllow(boardOnly), true, 'a board member could not open the office');
  assert.equal(tasksAllow(fw('Mo', 901, [])), false, 'a moderator with no other role opened Tasks');
  assert.ok(taskPeople(readMods('{"Bea":["board"],"Mo":[]}')).includes('Bea'), 'a board member cannot be given a task');
  assert.ok(!taskPeople(readMods('{"Bea":["board"],"Mo":[]}')).includes('Mo'));
});

test('the forums\' @ list offers whoever started or last posted in a topic the reader can read, and nobody else', async () => {
  const { forumPeople } = await import('./lib.mjs');
  const s = memoryStore({ etagOnRead: true });
  const t = (await startTopic(ADA, { cat: 'help-desk', title: 'Hi', body: 'x' }, s, T0, NO_NET)).topic;
  await replyTopic(BO, t.id, { body: 'Hello' }, s, T0 + 1, NO_NET);
  const dir = fw('Dee', 300, ['director']);
  await startTopic(dir, { cat: 'directors', title: 'Ours', body: 'y' }, s, T0 + 2, NO_NET);
  assert.deepEqual(await forumPeople(ADA, s, T0 + 3), ['Bo'], 'not the topic\'s people, or Ada offered herself');
  assert.ok((await forumPeople(dir, s, T0 + 3)).includes('Ada'));
  assert.ok(!(await forumPeople(BO, s, T0 + 3)).includes('Dee'), 'somebody who only posted in a staff category was offered to somebody who cannot read it');
  assert.deepEqual(await forumPeople({ role: 'mobile', handle: 'Typed', roles: new Set() }, s, T0 + 3), [], 'an unclaimed handle was told anybody');
});

test('the dashboard\'s newest grant requests and cases are the latest submitted, not the latest added (2026-10-22)', () => withOfficeKey(OFFICE_TEST_KEY, async () => {
  const s = memoryStore({ etagOnRead: true });
  // Brought over in a batch after the new ones: added later, submitted years before.
  await saveGrant(TRYAN, { name: 'This week', pipeline: 'Mutual Aid', stage: 'Received', submitted: '2026-10-15' }, s, T0);
  await saveGrant(TRYAN, { name: 'No day given', pipeline: 'Mutual Aid', stage: 'Received' }, s, T0 - 86400000 * 30);
  await saveGrant(TRYAN, { name: 'From 2023', pipeline: 'Mutual Aid', stage: 'Granted', submitted: '2023-02-18', closed: '2023-02-20' }, s, T0 + 10);
  await saveCase(TRYAN, { name: 'New case', submitted: '2026-10-17' }, s, T0);
  await saveCase(TRYAN, { name: 'Old case', submitted: '2023-01-02' }, s, T0 + 10);
  const d = await officeDashboard(TRYAN, s, T0 + 20);
  assert.deepEqual(d.recent.grants.map((x) => x.name), ['This week', 'No day given', 'From 2023'], 'the latest added came first, not the latest submitted');
  assert.deepEqual(d.recent.cases.map((x) => x.name), ['New case', 'Old case']);
}));

/* ── Polls in the forums ── */
import { cleanPoll, votePoll, closePoll, addPoll, POLL_CHOICES_MAX } from './lib.mjs';

const POLL = (kind, extra = {}) => ({ kind, q: 'Which day?', choices: ['Monday', 'Tuesday', 'Wednesday'], ...extra });

test('a poll is a show of hands or a sealed ballot, with two to twenty choices and a closing date in the coming year', () => {
  assert.match(cleanPoll({ kind: 'secret', choices: ['a', 'b'] }, T0).error, /show of hands or a sealed ballot/);
  assert.match(cleanPoll({ kind: 'hands', choices: ['a'] }, T0).error, /between 2/);
  assert.match(cleanPoll({ kind: 'hands', choices: Array.from({ length: POLL_CHOICES_MAX + 1 }, (_, i) => `c${i}`) }, T0).error, /between 2/);
  assert.match(cleanPoll({ kind: 'hands', choices: ['Tea', ' tea '] }, T0).error, /the same/);
  assert.match(cleanPoll({ kind: 'sealed', choices: ['a', 'b'], closes: T0 - 1 }, T0).error, /coming year/);
  assert.match(cleanPoll({ kind: 'sealed', choices: ['a', 'b'], closes: T0 + DAYS(400) }, T0).error, /coming year/);
  const { poll } = cleanPoll({ kind: 'sealed', choices: ['a', '', 'b'], closes: T0 + DAYS(3), many: 'yes' }, T0);
  assert.deepEqual(poll.choices.map((c) => c.text), ['a', 'b']);
  assert.equal(poll.many, false, 'anything but true made a poll take several choices');
  assert.deepEqual(Object.keys(poll).sort(), ['cast', 'choices', 'closes', 'kind', 'many', 'q', 'tally']);
});

test('a show of hands names who picked what, takes changes and takes back, and its starter closes and opens it', async () => {
  const s = memoryStore({ etagOnRead: true });
  const t = (await startTopic(ADA, { cat: 'infodumps', title: 'Meetup', poll: POLL('hands') }, s, T0, NO_NET)).topic;
  assert.ok(t, 'a topic with a poll and no words could not be started');
  assert.equal((await readForumIndex('infodumps', s)).find((x) => x.id === t.id).poll, true, 'the list does not say the topic has a poll');
  await votePoll(BO, t.id, ['c2'], s, T0 + 1);
  await votePoll(ADA, t.id, ['c2'], s, T0 + 2);
  let seen = (await forumTopic(fw('Cy', 700), t.id, s, T0 + 3)).poll;
  assert.deepEqual(seen.choices[1].who, ['Ada', 'Bo'], 'the names under a choice are not everybody who picked it, alphabetically');
  assert.equal(seen.choices[1].n, 2);
  assert.deepEqual(seen.mine, []);
  assert.equal(seen.close, false, 'somebody who did not start the topic was offered to close its poll');
  assert.ok(!JSON.stringify(seen).includes(authorMark(BO)), 'a voter\'s mark was sent');
  assert.match((await votePoll(BO, t.id, ['c1', 'c3'], s, T0 + 4)).error, /one choice/);
  assert.match((await votePoll(BO, t.id, ['c9'], s, T0 + 4)).error, /not in this poll/);
  await votePoll(BO, t.id, ['c3'], s, T0 + 5);
  seen = (await forumTopic(BO, t.id, s, T0 + 6)).poll;
  assert.deepEqual(seen.mine, ['c3']);
  assert.deepEqual(seen.choices[1].who, ['Ada'], 'a changed vote stayed under its old choice');
  await votePoll(BO, t.id, [], s, T0 + 7);
  assert.equal((await forumTopic(BO, t.id, s, T0 + 8)).poll.n, 1, 'a vote taken back was still counted');
  assert.match((await closePoll(BO, t.id, false, s, T0 + 9)).error, /Only whoever added the poll/);
  await closePoll(ADA, t.id, false, s, T0 + 9);
  assert.match((await votePoll(BO, t.id, ['c1'], s, T0 + 10)).error, /closed/);
  assert.deepEqual((await forumTopic(BO, t.id, s, T0 + 10)).poll.choices[1].who, ['Ada'], 'a closed show of hands stopped naming who picked what');
  await closePoll(ADA, t.id, true, s, T0 + 11);
  assert.ok((await votePoll(BO, t.id, ['c1'], s, T0 + 12)).topic, 'a show of hands opened again took no vote');
  await moderateTopic(FMOD, t.id, { close: true }, s, T0 + 13);
  assert.match((await votePoll(BO, t.id, ['c2'], s, T0 + 14)).error, /topic is closed/);
  assert.equal((await readTopic(t.id, s)).last, T0, 'a vote moved the topic\'s clock');
});

test('a sealed ballot keeps nothing that says who picked what, shows nobody a number until it closes, and stays closed', async () => {
  const s = memoryStore({ etagOnRead: true });
  const t = (await startTopic(BO, { cat: 'infodumps', title: 'Vote', body: 'Pick one.', poll: POLL('sealed', { many: true, closes: T0 + DAYS(2) }) }, s, T0, NO_NET)).topic;
  await votePoll(ADA, t.id, ['c1', 'c3'], s, T0 + 1);
  await votePoll(fw('Cy', 700), t.id, ['c3'], s, T0 + 2);
  assert.match((await votePoll(ADA, t.id, ['c2'], s, T0 + 3)).error, /already voted/, 'a sealed vote was cast twice');
  assert.match((await votePoll(fw('Di', 800), t.id, [], s, T0 + 3)).error, /Pick a choice/);
  for (const reader of [ADA, BO, FMOD]) {
    const seen = (await forumTopic(reader, t.id, s, T0 + 4)).poll;
    assert.equal(seen.n, undefined, 'how many have voted in an open sealed ballot was sent');
    assert.ok(seen.choices.every((c) => c.n === undefined && c.who === undefined), 'an open sealed ballot\'s numbers were sent');
  }
  assert.equal((await forumTopic(ADA, t.id, s, T0 + 4)).poll.voted, true);
  assert.equal((await forumTopic(BO, t.id, s, T0 + 4)).poll.voted, false);
  const kept = (await readTopic(t.id, s)).poll;
  const stored = JSON.stringify(kept);
  // A name is looked for in the words the poll keeps and never in its hashes: a ballot and `by` are base64url, and
  // one in thirty runs or so a random hash spelled "Cy" or "Ada" and failed this test with nothing kept.
  const words = [];
  (function walk(v, key) {
    if (typeof v === 'string') { if (key !== 'by' && key !== 'cast') words.push(v); }
    else if (Array.isArray(v)) v.forEach((x) => walk(x, key));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { words.push(k); walk(x, k); }
  })(kept);
  for (const x of ['Ada', 'Cy']) assert.ok(!words.some((w) => w.includes(x)), `a sealed ballot kept ${x}`);
  for (const x of [authorMark(ADA), authorMark(fw('Cy', 700))]) assert.ok(!stored.includes(x), `a sealed ballot kept ${x}`);
  assert.ok(kept.cast.every((b) => /^[A-Za-z0-9_-]{43}$/.test(b)), 'a sealed ballot kept a ballot that is not a hash');
  assert.deepEqual(Object.keys(kept).sort(), ['by', 'cast', 'choices', 'closes', 'handle', 'kind', 'many', 'q', 'tally']);
  assert.equal(kept.by, authorMark(BO), 'a sealed ballot keeps who added it and nothing else about anybody');
  assert.deepEqual(kept.cast, kept.cast.slice().sort(), 'the ballots are kept in the order they were cast');
  const shut = (await forumTopic(ADA, t.id, s, T0 + DAYS(2))).poll;
  assert.equal(shut.shut, true, 'a sealed ballot past its date did not close');
  assert.deepEqual(shut.choices.map((c) => c.n), [1, 0, 2]);
  assert.equal(shut.n, 2);
  assert.match((await votePoll(fw('Di', 800), t.id, ['c2'], s, T0 + DAYS(2))).error, /closed/);
  assert.match((await closePoll(BO, t.id, true, s, T0 + DAYS(2))).error, /stays closed/, 'a sealed ballot was opened again after its results were out');
});

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  for (const kind of ['hands', 'sealed']) {
    test(`fifteen votes in one ${kind === 'hands' ? 'show of hands' : 'sealed ballot'} at once, ${how}`, async () => {
      const s = memoryStore({ etagOnRead });
      const t = (await startTopic(ADA, { cat: 'help-desk', title: 'Busy', poll: POLL(kind) }, s, T0, NO_NET)).topic;
      const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => votePoll(fw(`V${i}`, i + 1), t.id, [`c${(i % 3) + 1}`], s, T0 + i)));
      const worked = told.filter((r) => r.status === 'fulfilled' && r.value.topic).length;
      for (const r of told) if (r.status === 'rejected') assert.equal(r.reason.message, 'busy');
      const poll = (await readTopic(t.id, s)).poll;
      if (kind === 'hands') assert.equal(poll.hands.length, worked, 'a vote that was told it counted is not in the show of hands');
      else {
        assert.equal(poll.cast.length, worked, 'a ballot that was told it counted is not among the ballots');
        assert.equal(Object.values(poll.tally).reduce((a, b) => a + b, 0), worked, 'the tally and the ballots disagree');
      }
      if (etagOnRead) assert.equal(worked, 15);
    });
  }
}

test('a poll can be added to a topic later by whoever may change its tags, never over one, and they can close it', async () => {
  const s = memoryStore({ etagOnRead: true });
  const FDIR = fw('Di', 600, ['director']);
  const t = (await startTopic(FBOARD, { cat: 'grantmaking', title: 'Round 9', body: 'Applicants.' }, s, T0, NO_NET)).topic;
  assert.equal((await forumTopic(FBOARD, t.id, s, T0)).addPoll, true, 'the starter was not offered to add a poll');
  assert.equal((await forumTopic(FDIR, t.id, s, T0)).addPoll, true, 'a wiki editor was not offered to add a poll');
  const other = (await startTopic(ADA, { cat: 'infodumps', title: 'Moths', body: 'Flutter.' }, s, T0, NO_NET)).topic;
  assert.equal((await forumTopic(BO, other.id, s, T0)).addPoll, undefined, 'somebody who may not change the tags was offered to add a poll');
  assert.match((await addPoll(BO, other.id, POLL('hands'), s, T0)).error, /Only whoever started/);
  assert.match((await addPoll(FDIR, t.id, { kind: 'hands', choices: ['Yes'] }, s, T0)).error, /between 2/);
  const r = await addPoll(FDIR, t.id, POLL('sealed'), s, T0 + 1);
  assert.equal(r.topic.poll.handle, 'Di');
  assert.equal((await readTopic(t.id, s)).last, T0, 'adding a poll moved the topic\'s clock');
  await votePoll(FBOARD, t.id, ['c1'], s, T0 + 2);
  assert.match((await addPoll(FADMIN, t.id, POLL('hands'), s, T0 + 3)).error, /poll already/, 'a poll was put over one with votes in it');
  assert.equal((await readTopic(t.id, s)).poll.cast.length, 1, 'adding a poll threw away the votes of the one there');
  const seen = (await forumTopic(FDIR, t.id, s, T0 + 4));
  assert.equal(seen.poll.close, true, 'whoever added a poll could not close it');
  assert.equal(seen.addPoll, undefined, 'a topic with a poll offered another');
  assert.ok(!JSON.stringify(seen).includes(authorMark(FDIR)), 'who added the poll was sent as their mark');
  await moderateTopic(FMOD, other.id, { close: true }, s, T0 + 5);
  assert.match((await addPoll(FMOD, other.id, POLL('hands'), s, T0 + 6)).error, /closed/);
});

test('a search finds a poll by its choices, and never by its votes', async () => {
  const s = memoryStore({ etagOnRead: true });
  const t = (await startTopic(ADA, { cat: 'infodumps', title: 'Snacks', poll: { kind: 'hands', choices: ['Crisps', 'Grapes'] } }, s, T0, NO_NET)).topic;
  await votePoll(BO, t.id, ['c1'], s, T0 + 1);
  assert.ok((await searchForum(ADA, 'grapes', s, T0 + 2)).some((x) => x.id === t.id), 'a poll\'s choices are not searched');
  assert.ok(!(await searchForum(ADA, 'bo', s, T0 + 2)).some((x) => x.id === t.id), 'a search found a topic by who voted in it');
});

/* ── Events ───────────────────────────────────────────────────────────────
   Ryan's ask and calls, 2026-10-23, after Discord's Scheduled Events: anybody
   signed on schedules one, its maker or a moderator changes it, an event names
   who is interested and never how many, a repeating one keeps to its maker's
   clock across summer time, and two notifications, each off until switched
   on. */
import { cleanEvent, eventStarts, wallToUtc, zoneParts, nthOf, cleanZone, cleanEventLink, seesEvent, mayChangeEvent, shapeEvent, eventsFor,
  makeEvent, editEvent, removeEvent, skipEvent, keenEvent, readEvents, sweepEvents, forgetEvents, tellEventsStarting,
  notifyEventStart, notifyEventNew, eventId, EVENTS_PER, EVENT_KEEN_MAX, EVENT_SOON } from './lib.mjs';

const DEN = 'America/Denver';
const evAt = (date, time, extra = {}) => ({ title: 'Coworking hour', room: 'world', at: 'call', date, time, zone: DEN, mins: 60, repeat: '', ...extra });
const NOW = Date.UTC(2026, 9, 23, 12, 0);   // 2026-10-23, 06:00 in Colorado

test('a clock time becomes the right instant, across the hours summer time skips and repeats', () => {
  // 19:00 in Colorado is 01:00 the next day in summer and 02:00 in winter.
  assert.equal(wallToUtc(2026, 10, 29, 19, 0, DEN), Date.UTC(2026, 9, 30, 1, 0));
  assert.equal(wallToUtc(2026, 11, 5, 19, 0, DEN), Date.UTC(2026, 10, 6, 2, 0));
  // 02:30 on 8 March 2026 never happens there: it is taken an hour on, at 03:30.
  const gap = wallToUtc(2026, 3, 8, 2, 30, DEN);
  assert.deepEqual([zoneParts(gap, DEN).h, zoneParts(gap, DEN).mi], [3, 30]);
  // 01:30 on 1 November 2026 happens twice: the first.
  assert.equal(wallToUtc(2026, 11, 1, 1, 30, DEN), Date.UTC(2026, 10, 1, 7, 30));
  assert.equal(cleanZone('America/Denver'), DEN);
  assert.equal(cleanZone('Mars/Olympus'), null);
  assert.equal(cleanZone('<script>'), null);
  assert.deepEqual([nthOf(1), nthOf(7), nthOf(8), nthOf(22), nthOf(29)], [1, 1, 2, 4, 5]);
});

test('a repeating event keeps to its maker\'s clock, every week, fortnight, month and weekday', () => {
  const at = (t) => { const p = zoneParts(t, DEN); return `${p.y}-${p.mo}-${p.d} ${p.h}:${String(p.mi).padStart(2, '0')} ${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][p.dow]}`; };
  // Made on 1 October, so a first start before today is allowed.
  const make = (date, repeat) => cleanEvent(evAt(date, '19:00', { repeat }), null, Date.UTC(2026, 9, 1)).ev;
  // Weekly from Thursday 29 October: still 19:00 after the clocks go back on 1 November.
  assert.deepEqual(eventStarts(make('2026-10-29', 'weekly'), NOW, 3).map(at), ['2026-10-29 19:00 Th', '2026-11-5 19:00 Th', '2026-11-12 19:00 Th']);
  assert.deepEqual(eventStarts(make('2026-10-29', 'fortnightly'), NOW, 3).map(at), ['2026-10-29 19:00 Th', '2026-11-12 19:00 Th', '2026-11-26 19:00 Th']);
  // The fourth Thursday of October, then of every month after it.
  assert.deepEqual(eventStarts(make('2026-10-22', 'monthly'), NOW, 3).map(at), ['2026-11-26 19:00 Th', '2026-12-24 19:00 Th', '2027-1-28 19:00 Th']);
  // The last Friday, which is what a fifth one always is.
  assert.deepEqual(eventStarts(make('2026-10-30', 'monthly'), NOW, 3).map(at), ['2026-10-30 19:00 Fr', '2026-11-27 19:00 Fr', '2026-12-25 19:00 Fr']);
  // Every weekday from a Friday: Monday comes next, never the weekend.
  assert.deepEqual(eventStarts(make('2026-10-23', 'weekdays'), NOW, 3).map(at), ['2026-10-23 19:00 Fr', '2026-10-26 19:00 Mo', '2026-10-27 19:00 Tu']);
  assert.match(cleanEvent(evAt('2026-10-24', '19:00', { repeat: 'weekdays' }), null, NOW).error, /weekday/);
  // Long after it began, the next one is found without walking every week since.
  const old = make('2026-10-29', 'weekly');
  assert.equal(at(eventStarts(old, Date.UTC(2031, 0, 1), 1)[0]), '2031-1-2 19:00 Th');
  // The one going on now is the first, until it ends.
  const going = make('2026-10-29', 'weekly');
  assert.equal(eventStarts(going, Date.UTC(2026, 9, 30, 1, 30), 1)[0], Date.UTC(2026, 9, 30, 1, 0));
  assert.equal(eventStarts(going, Date.UTC(2026, 9, 30, 2, 0), 1)[0], Date.UTC(2026, 10, 6, 2, 0));
  // A time cancelled is left out, and the rest go on.
  const skipped = { ...going, skip: [Date.UTC(2026, 10, 6, 2, 0)] };
  assert.deepEqual(eventStarts(skipped, NOW, 2).map(at), ['2026-10-29 19:00 Th', '2026-11-12 19:00 Th']);
  // One that happens once is gone once it ends.
  const once = make('2026-10-29', '');
  assert.equal(eventStarts(once, Date.UTC(2026, 9, 30, 2, 0)).length, 0);
});

test('what is typed for an event is checked, and a room that keeps to itself has none', () => withPasswords(() => {
  const ada = writer('Ada');
  assert.ok(cleanEvent(evAt('2026-10-29', '19:00'), ada, NOW).ev);
  assert.match(cleanEvent(evAt('2026-10-29', '19:00', { title: '  ' }), ada, NOW).error, /title/);
  assert.match(cleanEvent(evAt('2026-10-29', '19:00', { room: QUIET_ROOMS[0] }), ada, NOW).error, /keeps to itself/);
  assert.match(cleanEvent(evAt('2026-10-29', '19:00', { room: 'town-hall-board' }), ada, NOW).error, /go into/);
  const board = { role: 'base', handle: 'Bo', roles: new Set(['board']), account: true, since: 3 };
  assert.ok(cleanEvent(evAt('2026-10-29', '19:00', { room: 'town-hall-board' }), board, NOW).ev);
  assert.match(cleanEvent(evAt('2026-10-29', '19:00', { at: 'away' }), ada, NOW).error, /link/);
  assert.equal(cleanEvent(evAt('2026-10-29', '19:00', { at: 'away', away: 'https://example.org/meet' }), ada, NOW).ev.away, 'https://example.org/meet');
  assert.equal(cleanEventLink('javascript:alert(1)'), null);
  assert.equal(cleanEventLink('https://name:pw@example.org/'), null);
  assert.match(cleanEvent(evAt('2026-10-22', '19:00'), ada, NOW).error, /been and gone/);
  assert.match(cleanEvent(evAt('2028-10-22', '19:00'), ada, NOW).error, /coming year/);
  assert.match(cleanEvent(evAt('2026-02-30', '19:00'), ada, NOW).error, /clock can read/);
  assert.match(cleanEvent(evAt('2026-10-29', '19:00', { mins: 3 }), ada, NOW).error, /between/);
  assert.match(cleanEvent(evAt('2026-10-29', '19:00', { zone: 'Nowhere/At_All' }), ada, NOW).error, /time zone/);
  assert.match(cleanEvent(evAt('2026-10-29', '19:00', { repeat: 'hourly' }), ada, NOW).error, /repeats/);
  // A forum category's room takes its readers, and a subcategory's tag is no room.
  assert.ok(seesEvent(ada, { room: 'world' }));
  assert.equal(seesEvent({ role: 'mobile', handle: 'Cy', roles: new Set() }, { room: 'world' }), false, 'an unclaimed handle saw an event');
}));

test('anybody claimed schedules one, sees only what their pass may, and the mark never leaves', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const ada = writer('Ada', 1), bex = writer('Bex', 2), mo = writer('Mo', 4, 'base');
  const board = { role: 'base', handle: 'Bo', roles: new Set(['board']), account: true, since: 5 };
  assert.match((await makeEvent({ role: 'mobile', handle: 'Cy', roles: new Set() }, evAt('2026-10-29', '19:00'), s, NOW)).error, /claimed/);
  const one = await makeEvent(ada, evAt('2026-10-29', '19:00', { about: 'Bring a **project**.' }), s, NOW);
  assert.ok(eventId(one.event.id));
  const priv = await makeEvent(board, evAt('2026-10-30', '18:00', { room: 'town-hall-board', title: 'Board meeting' }), s, NOW);
  assert.ok(priv.event.base, 'a moderator\'s event was not marked as theirs');
  const seen = await eventsFor(bex, s, NOW);
  assert.deepEqual(seen.map((e) => e.title), ['Coworking hour'], 'somebody saw an event in a room they cannot go into');
  assert.deepEqual((await eventsFor(board, s, NOW)).map((e) => e.title), ['Coworking hour', 'Board meeting']);
  const e = seen[0];
  assert.deepEqual(e.keen, ['Ada'], 'its maker was not interested in it from the start');
  for (const k of ['by', 'skip', 'count', 'n']) assert.equal(e[k], undefined, `an event was sent its ${k}`);
  assert.equal(JSON.stringify(seen).includes((await readEvents(s))[0].by), false, 'the maker\'s mark left the server');
  assert.equal(e.may, false, 'somebody else could change it');
  assert.equal((await eventsFor(ada, s, NOW))[0].may, true);
  assert.equal((await eventsFor(mo, s, NOW))[0].may, true, 'a moderator could not change it');
  assert.deepEqual(e.wall, { date: '2026-10-29', time: '19:00', dow: 4, nth: 5 });
  // Only its maker or a moderator changes or cancels it.
  assert.match((await editEvent(bex, e.id, evAt('2026-10-29', '20:00'), s, NOW)).error, /Only whoever/);
  assert.match((await removeEvent(bex, e.id, s, NOW)).error, /Only whoever/);
  const ch = await editEvent(mo, e.id, evAt('2026-10-29', '20:00', { title: 'Coworking, later' }), s, NOW);
  assert.equal(ch.event.handle, 'Ada', 'a moderator\'s change made the event theirs');
  assert.deepEqual(ch.event.keen.map((k) => k.handle), ['Ada'], 'a change lost who is interested');
  // A name deleted and claimed again is somebody else, and cannot change it.
  assert.match((await editEvent(writer('Ada', 99), e.id, evAt('2026-10-29', '20:00'), s, NOW)).error, /Only whoever/);
  assert.match((await skipEvent(ada, e.id, ch.event.start, s, NOW)).error, /happens once/);
  assert.deepEqual(await removeEvent(ada, e.id, s, NOW), { removed: true });
  assert.deepEqual((await eventsFor(ada, s, NOW)).map((x) => x.title), []);
  // Twenty at once each, and no more.
  for (let i = 0; i < EVENTS_PER; i++) assert.ok((await makeEvent(bex, evAt('2026-11-02', '10:00', { title: `Mine ${i}` }), s, NOW)).event);
  assert.match((await makeEvent(bex, evAt('2026-11-02', '10:00'), s, NOW)).error, /as many as one person/);
}));

test('interested is names, alphabetical, once each, and never a number; a name claimed again is not on it', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const { event } = await makeEvent(writer('Zed', 1), evAt('2026-10-29', '19:00'), s, NOW);
  for (const [h, n] of [['bex', 2], ['Ada', 3], ['cy', 4]]) assert.deepEqual(await keenEvent(writer(h, n), event.id, true, s, NOW), { keen: true });
  assert.deepEqual(await keenEvent(writer('Ada', 3), event.id, true, s, NOW), { keen: true }, 'saying it twice was not the same as once');
  let e = (await eventsFor(writer('Ada', 3), s, NOW))[0];
  assert.deepEqual(e.keen, ['Ada', 'bex', 'cy', 'Zed']);
  assert.equal(e.mine, true);
  assert.equal((await eventsFor(writer('Ada', 77), s, NOW))[0].mine, false, 'a name claimed again counted as interested');
  assert.deepEqual(await keenEvent(writer('Ada', 3), event.id, false, s, NOW), { keen: false });
  e = (await eventsFor(writer('Ada', 3), s, NOW))[0];
  assert.deepEqual(e.keen, ['bex', 'cy', 'Zed']);
  assert.equal(Object.values(e).some((v) => v === 3 || v === 4), false, 'an event carried a number of people');
  assert.match((await keenEvent(writer('Bo', 9), 'e' + 'x'.repeat(12), true, s, NOW)).error, /not there/);
}));

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`fifteen people saying they are interested at once, ${how}: none told it worked is missing`, () => withPasswords(async () => {
    const s = memoryStore({ etagOnRead });
    const { event } = await makeEvent(writer('Host', 1), evAt('2026-10-29', '19:00'), s, NOW);
    const told = await Promise.allSettled(Array.from({ length: 15 }, (_, i) => keenEvent(writer(`P${i}`, i + 10), event.id, true, s, NOW)));
    const ok = told.map((r, i) => (r.status === 'fulfilled' && r.value.keen ? `P${i}` : null)).filter(Boolean);
    const names = (await readEvents(s))[0].keen.map((k) => k.handle);
    for (const h of ok) assert.ok(names.includes(h), `${h} was told it worked and is not on the list`);
    if (etagOnRead) assert.equal(ok.length, 15);
  }));
}

test('a time cancelled is one of the next ones, and a change to when brings cancelled times back', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const ada = writer('Ada', 1);
  const { event } = await makeEvent(ada, evAt('2026-10-29', '19:00', { repeat: 'weekly' }), s, NOW);
  const next = eventStarts(event, NOW, 3);
  assert.match((await skipEvent(ada, event.id, next[0] + 1, s, NOW)).error, /next times/);
  assert.deepEqual(await skipEvent(ada, event.id, next[1], s, NOW), { skipped: next[1] });
  let e = (await eventsFor(ada, s, NOW))[0];
  assert.deepEqual([e.start, e.then[0]], [next[0], next[2]], 'a cancelled time was still shown');
  await editEvent(ada, event.id, evAt('2026-10-29', '19:00', { repeat: 'weekly', title: 'Renamed' }), s, NOW);
  assert.deepEqual((await readEvents(s))[0].skip, [next[1]], 'renaming it brought a cancelled time back');
  await editEvent(ada, event.id, evAt('2026-10-29', '19:30', { repeat: 'weekly' }), s, NOW);
  assert.equal((await readEvents(s))[0].skip, undefined, 'a cancelled time outlived a change to when it starts');
}));

test('the sweep takes events that have been and gone, and Forget me takes yours and you off every list', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const ada = writer('Ada', 1), bex = writer('Bex', 2);
  await makeEvent(ada, evAt('2026-10-23', '07:00'), s, NOW);
  await makeEvent(ada, evAt('2026-10-29', '19:00', { repeat: 'weekly', title: 'Weekly' }), s, NOW);
  const { event } = await makeEvent(bex, evAt('2026-10-30', '19:00', { title: 'Bex\'s' }), s, NOW);
  await keenEvent(ada, event.id, true, s, NOW);
  await sweepEvents(s, Date.UTC(2026, 9, 23, 15, 0));
  assert.deepEqual((await readEvents(s)).map((e) => e.title).sort(), ['Bex\'s', 'Weekly'], 'the sweep took the wrong events');
  await forgetEvents('ada', 1, s);
  const left = await readEvents(s);
  assert.deepEqual(left.map((e) => e.title), ['Bex\'s'], 'Forget me left an event its person made');
  assert.deepEqual(left[0].keen.map((k) => k.handle), ['Bex'], 'Forget me left its person on a list of the interested');
  await forgetEvents('Bex', 99, s);
  assert.equal((await readEvents(s)).length, 1, 'a name claimed again forgot its old owner\'s event');
}));

test('a start tells only the interested who asked, once, and a new event tells World\'s and a room\'s followers but not its maker', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const passOf = async (h) => { await claimAccount(h, `${h} has a long phrase`, s, 1, null); const a = await readAccount(h, s); return [issueAccountPass(h, a.v), a.since]; };
  const [adaPass, adaSince] = await passOf('Ada');
  const [bexPass, bexSince] = await passOf('Bex');
  const [cyPass] = await passOf('Cy');
  const ada = writer('Ada', adaSince), bex = writer('Bex', bexSince);
  const aOn = aDevice(), aQuiet = aDevice(), bOn = aDevice(), cNew = aDevice(), cRoom = aDevice(), bOff = aDevice();
  await keepDevice(aOn, adaPass, { events: true, scheduled: true }, s);
  await keepDevice(aQuiet, adaPass, { events: true, words: false }, s);
  await keepDevice(bOn, bexPass, { all: true }, s);
  await keepDevice(cNew, cyPass, { scheduled: true }, s);
  await keepDevice(cRoom, cyPass, { scheduled: true, rooms: ['the-den'] }, s);
  await keepDevice(bOff, bexPass, { mentions: true }, s);
  assert.equal(cleanWant({}).events, false, 'events notified before anybody switched them on');
  assert.equal(cleanWant({}).scheduled, false);
  const sent = [];
  const send = async (sub, payload) => { sent.push({ to: sub.endpoint, payload }); return 201; };
  const to = (d) => sent.filter((x) => x.to === d.endpoint).map((x) => x.payload);

  const world = (await makeEvent(ada, evAt('2026-10-29', '19:00'), s, NOW)).event;
  await notifyEventNew(world, s, readMods(''), send);
  assert.equal(to(aOn).length, 0, 'the maker was told about their own event');
  assert.deepEqual(to(cNew), [{ kind: 'event', why: 'new', id: world.id, room: 'world', at: world.start, title: 'Coworking hour', handle: 'Ada' }]);
  assert.equal(to(bOn).length, 1, 'Everything missed a new event on World');
  assert.equal(to(bOff).length, 0, 'a device that never asked was told');

  sent.length = 0;
  const den = (await makeEvent(bex, evAt('2026-10-30', '20:00', { room: 'the-den', title: 'Records' }), s, NOW)).event;
  await notifyEventNew(den, s, readMods(''), send);
  assert.equal(to(cRoom).length, 1, 'a follower of the room was not told');
  assert.equal(to(cNew).length, 0, 'somebody who does not follow the room was told about an event in it');
  assert.equal(to(aOn).length, 0, 'a new event in a room told somebody who does not follow it');

  // Ada is interested in her own; Bex says so too. Five minutes before it starts, both are told, once.
  sent.length = 0;
  await keenEvent(bex, world.id, true, s, NOW);
  const near = world.start - EVENT_SOON + 1000;
  await tellEventsStarting(s, readMods(''), send, Date.UTC(2026, 9, 29, 12, 0));
  assert.equal(sent.length, 0, 'a start was told hours early');
  await tellEventsStarting(s, readMods(''), send, near);
  await tellEventsStarting(s, readMods(''), send, near + 60000);
  assert.deepEqual(to(aOn), [{ kind: 'event', why: 'start', id: world.id, room: 'world', at: world.start, title: 'Coworking hour' }]);
  assert.deepEqual(to(aQuiet), [{ kind: 'event', why: 'start', id: world.id, room: 'world', at: world.start, title: '' }], 'the words went to a device that turned them off');
  assert.equal(to(bOn).length, 1, 'somebody interested, with Everything on, was not told once');
  assert.equal(to(cNew).length, 0, 'somebody not interested was told it started');
  assert.equal(JSON.stringify(sent).includes('keen'), false, 'a notification carried who is interested');

  // A device whose name was claimed again is not its old owner on any list.
  sent.length = 0;
  await notifyEventStart(world, world.start, s, readMods(''), send);
  await deleteAccount('Bex', s);
  sent.length = 0;
  await notifyEventStart(world, world.start, s, readMods(''), send);
  assert.equal(to(bOn).length, 0, 'a deleted username was still told');
}));

/* ── Role mentions ─────────────────────────────────────────────────────── */
import { roleMentions, mentionableRoles, roleWord, ROLE_ANYBODY } from './lib.mjs';

test('a role is called by its own word, only by somebody who may call it, and is nobody\'s username', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const member = fw('Ada', 100), base = fw('Mo', 300, []);
  assert.deepEqual(ROLE_ANYBODY, ['moderator'], 'who may call which role changed without this test');
  assert.deepEqual(mentionableRoles(member), ['moderator']);
  assert.deepEqual(mentionableRoles(base), ['administrator', 'board', 'director', 'moderator']);
  assert.deepEqual(mentionableRoles({ role: 'mobile', handle: 'Cy', roles: new Set() }), [], 'a username nobody has claimed could call a role');
  assert.deepEqual(roleMentions('@moderator please, and @board, @director, @administrator', member), ['moderator'], 'a member called a role that is the base\'s');
  assert.deepEqual(roleMentions('@Board and @MODERATOR', base), ['board', 'moderator']);
  assert.deepEqual(roleMentions('@moderators, mods@board.example, @boardroom, the board', base), [], 'something that is not a role\'s word called one');
  assert.ok(roleWord(' Moderator ') && !roleWord('Mod'));
  assert.ok(!mentions('hi @board', 'Board'), 'a role\'s word was read as somebody\'s handle');
  // A role's word is no username, however it is written.
  for (const h of ['board', 'Moderator', ' DIRECTOR ']) {
    assert.equal((await checkHandle(h, readMods(''), s)).ok, false, `${h} was free to claim`);
    assert.match((await claimAccount(h, 'a long enough phrase', s, 1, null)).error, /role/);
  }
  assert.match((await joinAccount({ invite: 'nothing', handle: 'Administrator', password: 'a long enough phrase' }, readMods('{"Mo":[]}'), s)).error, /role/);
  // An edit works the roles out again from its own sender's pass.
  const list = [{ id: 'a', handle: 'Ada', text: 'hi', t: 1, claimed: true }, { id: 'b', handle: 'Mo', text: 'hi', t: 1, base: true }];
  const AdaPass = { role: 'mobile', handle: 'Ada', account: 1, roles: new Set() }, MoPass = { role: 'base', handle: 'Mo', account: 1, roles: new Set(['moderator']) };
  assert.deepEqual(editMessage(list, 'a', '@board @moderator', AdaPass).msg.roles, ['moderator']);
  assert.deepEqual(editMessage(list, 'b', '@board @moderator', MoPass).msg.roles, ['board', 'moderator']);
  assert.equal(editMessage(list, 'b', 'never mind', MoPass).msg.roles, undefined, 'a role no longer called was kept');
  assert.deepEqual(shapeMessages([{ id: 'c', handle: 'Mo', text: '@board', t: 1, roles: ['board', 'nobody', 'board'] }])[0].roles, ['board'], 'a role that is no role was shown');
}));

test('a role called tells every device whose pass holds it and may hear the room, and nobody who sent it', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const mods = readMods('{"Bex":["board"],"Cy":[],"Dee":["director"],"Ada":[]}');
  const bexDev = aDevice(), cyDev = aDevice(), deeDev = aDevice(), eveDev = aDevice(), adaDev = aDevice();
  await keepDevice(bexDev, await claimedPassFor('Bex', s, 'base'), { mentions: true }, s);
  await keepDevice(cyDev, await claimedPassFor('Cy', s, 'base'), { mentions: true }, s);
  await keepDevice(deeDev, await claimedPassFor('Dee', s, 'base'), { world: true }, s);
  await keepDevice(eveDev, await claimedPassFor('Eve', s), { mentions: true }, s);
  await keepDevice(adaDev, await claimedPassFor('Ada', s, 'base'), { mentions: true }, s);
  const sent = [];
  const send = async (sub, payload) => { sent.push({ to: sub.endpoint, payload }); return 201; };
  const told = () => sent.filter((x) => x.payload.why === 'mention').map((x) => [x.to, x.payload.as]).sort();
  const from = (text, roles, extra = {}) => ({ id: 'm' + sent.length, handle: 'Ada', text, t: 1, ...(roles ? { roles } : {}), ...extra });

  await notifyMessage(from('@moderator could somebody look at this?', ['moderator']), null, s, mods, send);
  assert.deepEqual(told(), [[bexDev.endpoint, 'moderator'], [cyDev.endpoint, 'moderator']].sort(), 'calling the moderators missed one, or told somebody who is not one or did not ask');
  assert.ok(!sent.some((x) => x.to === adaDev.endpoint), 'the sender was told about their own call');
  sent.length = 0;
  await notifyMessage(from('@board, the minutes', ['board']), null, s, mods, send);
  assert.deepEqual(told(), [[bexDev.endpoint, 'board']]);
  // Words the server did not keep as a role call nobody.
  sent.length = 0;
  await notifyMessage(from('@board, the minutes'), null, s, mods, send);
  assert.deepEqual(told(), [], 'a role\'s word nobody may call told somebody');
  // A locked room tells only the holders who may go in; a quiet room tells nobody.
  sent.length = 0;
  await notifyMessage(from('@moderator', ['moderator']), 'town-hall-board', s, mods, send);
  assert.deepEqual(told(), [[bexDev.endpoint, 'moderator']], 'a moderator who cannot go into the board room was told what was said there');
  sent.length = 0;
  await notifyMessage(from('@moderator', ['moderator']), QUIET_ROOMS[0], s, readMods('{"Bex":["administrator"],"Cy":["administrator"],"Ada":["administrator"]}'), send);
  assert.deepEqual(told(), [], 'a room that keeps to itself was announced by a role call');
  // Called by name and as a role at once, it is the name.
  sent.length = 0;
  await notifyMessage(from('@Bex and @board', ['board']), null, s, mods, send);
  assert.deepEqual(told(), [[bexDev.endpoint, undefined]]);
  // An edit tells only the roles it newly calls.
  sent.length = 0;
  await notifyEdit(from('@board and now @moderator', ['board', 'moderator']), '@board', null, s, mods, send);
  assert.deepEqual(told(), [[bexDev.endpoint, 'moderator'], [cyDev.endpoint, 'moderator']].sort());
  // Taken off the list, a role is no longer theirs to be called by.
  sent.length = 0;
  await notifyMessage(from('@board', ['board']), null, s, readMods('{"Cy":[],"Ada":[]}'), send);
  assert.deepEqual(told(), [], 'somebody no longer on the board was told the board was called');
}));

test('a post keeps the roles its writer may call, a holder is told and finds it under Mentions, and a reader of the category only', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const mods = readMods('{"Bex":["board"],"Cy":[]}');
  const bexDev = aDevice(), cyDev = aDevice();
  await keepDevice(bexDev, await claimedPassFor('Bex', s, 'base'), { mentions: true }, s);
  await keepDevice(cyDev, await claimedPassFor('Cy', s, 'base'), { mentions: true }, s);
  const sent = [];
  const send = async (sub, payload) => { sent.push({ to: sub.endpoint, payload }); return 201; };
  const t = (await startTopic(ADA, { cat: 'nature', title: 'Moss', body: '@moderator and @board, is this all right?' }, s, T0, NO_NET)).topic;
  assert.deepEqual(t.posts[0].roles, ['moderator'], 'a member\'s post called a role that is the base\'s');
  const r = (await replyTopic(FMOD, t.id, { body: 'Asking @board as well.' }, s, T0 + 1, NO_NET)).post;
  assert.deepEqual(r.roles, ['board']);
  await notifyForum(t, t.posts[0], '', s, mods, send);
  assert.deepEqual(sent.map((x) => [x.to, x.payload.as]).sort(), [[bexDev.endpoint, 'moderator'], [cyDev.endpoint, 'moderator']].sort());
  sent.length = 0;
  await notifyForum(t, t.posts[0], '@moderator', s, mods, send);
  assert.equal(sent.length, 0, 'an edit called a role again that it had already called');
  const secret = (await startTopic(FBOARD, { cat: 'grantmaking', title: 'A request', body: '@moderator, a look?' }, s, T0, NO_NET)).topic;
  await notifyForum(secret, secret.posts[0], '', s, mods, send);
  assert.deepEqual(sent.map((x) => x.to), [bexDev.endpoint], 'a moderator who cannot read the category was told what was posted in it');
  const BEX = fw('Bex', 1, ['board']);
  const found = await forumMentions(BEX, s, T0 + 2);
  assert.ok(found.some((x) => x.id === t.id && x.match.handle === 'Ryan' && /@board/.test(x.match.words)), 'a role Bex holds, called in a post, was not under Mentions');
  assert.ok(!(await forumMentions(fw('Cy', 1), s, T0 + 2)).length, 'somebody who holds no role found a role call under Mentions');
}));

test('a role called in a task or a comment tells everybody on Tasks who holds it, and only them', async () => {
  const s = memoryStore({ etagOnRead: true });
  const mods = readMods('{"Ryan":["administrator","director"],"Chelsea":["director"],"Norah":["director"],"Bea":["board"],"Sam":[]}');
  const TBEA = fw('Bea', 400, ['board']);
  const inbox = async (who) => (await taskInbox(who, s, T0 + 100)).items.map((x) => [x.kind, x.why]);
  const t = (await saveTask(TCHELSEA, { name: 'The budget', who: 'Chelsea', body: '@board, this needs a vote' }, s, T0, mods)).task;
  assert.deepEqual(await inbox(TBEA), [['made', 'mentioned']], 'the board was not told a task called it');
  assert.deepEqual(await inbox(TNORAH), [], 'a director was told a task called the board');
  await commentTask(TRYAN, t.id, 'And @director, please.', s, T0 + 1, mods);
  assert.deepEqual((await inbox(TNORAH))[0], ['commented', 'mentioned']);
  assert.deepEqual((await inbox(TBEA))[0], ['made', 'mentioned'], 'a comment calling the directors told the board');
});

import { noteModCall, readModCalls, closeModCall, MOD_CALL_KEEP, MOD_CALL_DAYS } from './lib.mjs';

test('a member\'s call for a moderator leaves a note on the desk, once, never from a moderator, a quiet room or a locked one', async () => {
  const s = memoryStore({ etagOnRead: true });
  const member = { role: 'mobile', handle: 'Ada', account: 1, roles: new Set() };
  const mod = { role: 'base', handle: 'Mo', account: 1, roles: new Set(['moderator']) };
  const call = (id, text, roles = ['moderator']) => ({ id, handle: 'Ada', text, t: T0, roles });
  assert.ok(await noteModCall(member, call('m1', '@moderator somebody is being cruel in here'), { room: 'the-den' }, '', s, T0));
  assert.equal(await noteModCall(member, call('m1', '@moderator somebody is being cruel in here'), { room: 'the-den' }, '', s, T0 + 1), null, 'one message left two notes');
  assert.equal(await noteModCall(mod, { ...call('m2', '@moderator a hand?'), handle: 'Mo' }, { room: null }, '', s, T0), null, 'a moderator\'s own call left a note');
  assert.equal(await noteModCall(member, call('m3', '@moderator', []), { room: null }, '', s, T0), null, 'words the server did not keep as a call left a note');
  assert.equal(await noteModCall(member, call('m4', '@moderator'), { room: QUIET_ROOMS[0] }, '', s, T0), null, 'a room that keeps to itself was named on the desk');
  assert.equal(await noteModCall(member, call('m5', '@moderator'), { room: 'town-hall-board' }, '', s, T0), null);
  assert.equal(await noteModCall(member, call('m6', '@moderator again'), { room: null }, '@moderator', s, T0), null, 'an edit that called already left a note');
  assert.ok(await noteModCall(member, call('m7', 'now @moderator'), { room: null }, 'now', s, T0 + 2), 'an edit that newly called left no note');
  const t = (await startTopic(ADA, { cat: 'nature', title: 'Moss', body: '@moderator, is this post all right?' }, s, T0, NO_NET)).topic;
  assert.ok(await noteModCall(ADA, t.posts[0], { topic: t }, '', s, T0 + 3));
  const secret = (await startTopic(FBOARD, { cat: 'grantmaking', title: 'A request', body: '@moderator' }, s, T0, NO_NET)).topic;
  assert.equal(await noteModCall({ ...ADA }, { ...secret.posts[0], roles: ['moderator'] }, { topic: secret }, '', s, T0 + 4), null, 'a category only some may read was named on the desk');

  assert.equal(await readModCalls(member, s, T0 + 5), null, 'somebody who is not a moderator read the desk');
  const calls = await readModCalls(mod, s, T0 + 5);
  assert.deepEqual(calls.map((c) => [c.by, c.place.name, c.place.path]), [
    ['Ada', 'the forums: Nature, “Moss”', `/forum.html#/t/${t.id}/${t.posts[0].id}`],
    ['Ada', 'World', '/world.html'],
    ['Ada', '#the-den', '/the-den.html']]);
  assert.equal(calls[2].text, '@moderator somebody is being cruel in here');
  assert.deepEqual(Object.keys(calls[0]).sort(), ['by', 'id', 'place', 't', 'text'], 'a note carries more than who, when, where and the words');
  assert.ok((await closeModCall(member, calls[0].id, s, T0 + 6)).error, 'somebody who is not a moderator closed a note');
  assert.ok(!(await closeModCall(mod, calls[0].id, s, T0 + 6)).error);
  assert.equal((await readModCalls(mod, s, T0 + 7)).length, 2);
  // Thirty days on, a note nobody closed is gone, and the sweep deletes it.
  const later = T0 + MOD_CALL_DAYS * 24 * 60 * 60 * 1000 + 10;
  assert.equal((await readModCalls(mod, s, later)).length, 0, 'a note outlived its thirty days');
  await sweepDms(s, later);
  assert.equal((await s.get('mod-calls', { type: 'json' })).calls.length, 0, 'the sweep left an old note behind');
  // A full desk keeps the newest.
  for (let i = 0; i < MOD_CALL_KEEP + 3; i++) await noteModCall(member, call('n' + i, '@moderator ' + i), { room: null }, '', s, later + i);
  const full = await readModCalls(mod, s, later + MOD_CALL_KEEP + 5);
  assert.equal(full.length, MOD_CALL_KEEP);
  assert.equal(full[0].text, '@moderator ' + (MOD_CALL_KEEP + 2), 'the newest call was the one dropped');
});

/* ── The feed bot ─────────────────────────────────────────────────────────
   Ryan's ask, 2026-10-23: The Feed's and The Source's channels hear each new
   item as it comes in. The invariant here is the CB's own, said for a bot:
   NOTHING IS SAID TWICE, even with fifteen readings at once; nothing is said
   the first time a wire is read; and a person's message is never pushed off
   the channel by one of the bot's. */
const RSS = (items) => `<?xml version="1.0"?><rss version="2.0"><channel><title>x</title>${items.map((i) =>
  `<item><title>${i.title}</title><link>${i.link}</link><guid>${i.guid || i.link}</guid>${i.t ? `<pubDate>${new Date(i.t).toUTCString()}</pubDate>` : ''}</item>`).join('')}</channel></rss>`;
const ATOM = (repo, entries) => `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">${entries.map((e) =>
  `<entry><id>tag:github.com,2008:Grit::Commit/${e.sha}</id><link type="text/html" rel="alternate" href="https://github.com/${e.repo || repo}/commit/${e.sha}"/>` +
  `<title>\n        ${e.title}\n    </title><updated>${new Date(e.t).toISOString()}</updated>` +
  `<author><name>${e.by || ''}</name>${e.by ? '' : '<email>somebody@example.org</email>'}</author>` +
  `<content type="html">&lt;pre&gt;${e.title}\n\nWhy, at length.\n\nCo-Authored-By: Claude Opus 5.5 &amp;lt;noreply@anthropic.com&amp;gt;&lt;/pre&gt;</content></entry>`).join('')}</feed>`;
function fakeGet(feeds) {
  return async (url) => {
    const body = feeds[url];
    if (!body) return { status: 404, headers: { get: () => null }, text: async () => '' };
    return { status: 200, headers: { get: () => null }, text: async () => body() };
  };
}
const sha = (c) => c.repeat(40);

test('a wire is read for a name, an address and a time, and only on its own host or in its own repository', () => {
  const w = feedRooms()['the-feed'][0], sp = feedRooms()['the-source'][0];
  const T = Date.UTC(2026, 9, 23, 12);
  const items = readWireXml(RSS([
    { title: '<![CDATA[Tea & toast]]>', link: `https://${w.host}/tea/`, t: T },
    { title: 'Fish &amp; chips', link: `https://www.${w.host}/fish/`, t: T - 1000 },
    { title: 'Somewhere else', link: 'https://elsewhere.example/x', t: T },
    { title: 'No time', link: `https://${w.host}/when/` },
  ]), w);
  assert.deepEqual(items.map((x) => x.title), ['Tea & toast', 'Fish & chips'], 'an off-host or undated item was read, or an entity left in');
  const commits = readWireXml(ATOM(sp.repo, [
    { sha: sha('a'), title: 'A change', by: 'ryanboren', t: T },
    { sha: sha('b'), title: 'Made where GitHub names nobody', t: T - 5000 },
    { sha: sha('c'), title: 'Somebody else\'s', by: 'x', t: T, repo: 'Elsewhere/Thing' },
  ]), sp);
  assert.deepEqual(commits.map((x) => [x.title, x.sha, x.by, x.anon]), [
    ['A change', 'aaaaaaa', ['ryanboren', 'Claude Opus 5.5'], false],
    ['Made where GitHub names nobody', 'bbbbbbb', ['Claude Opus 5.5'], true]], 'a commit was misread, or one from another repository kept');
  assert.ok(!JSON.stringify(commits).includes('@'), 'an address was read');
});

for (const etagOnRead of [true, false]) {
  const how = etagOnRead ? 'with an etag on reads' : 'with no etag on reads';
  test(`the feed bot says nothing at first, then each new item once, fifteen readings at once, ${how}`, async () => {
    const s = memoryStore({ etagOnRead });
    const T = Date.UTC(2026, 9, 23, 12), MIN = 60 * 1000;
    const w = feedRooms()['the-feed'][0], sp = feedRooms()['the-source'][0];
    let rss = [{ title: 'Old', link: `https://${w.host}/old/`, t: T - 60 * MIN }];
    let atom = [{ sha: sha('a'), title: 'First', by: 'ryanboren', t: T - 60 * MIN }];
    const get = fakeGet({ [w.feed]: () => RSS(rss), [sp.feed]: () => ATOM(sp.repo, atom) });
    const told = [];
    const notify = async (m, room) => { told.push([room, m.feed.title]); return []; };
    assert.equal((await runFeedBot(s, get, T, notify)).said, 0, 'the first reading said what was already there');
    assert.deepEqual((await readRoomTalk('the-feed', s, T)).messages, []);

    rss = [{ title: 'Newest', link: `https://${w.host}/newest/`, t: T + 2 * MIN },
      { title: 'Newer', link: `https://${w.host}/newer/`, t: T + MIN },
      { title: 'Too old to say', link: `https://${w.host}/ancient/`, t: T - LIFE - MIN }, ...rss];
    atom = [{ sha: sha('c'), title: 'A real change', t: T + 3 * MIN },
      { sha: sha('b'), title: 'daily arrivals board reset', by: 'ryanboren', t: T + MIN }, ...atom];
    await Promise.allSettled(Array.from({ length: 15 }, () => runFeedBot(s, get, T + 5 * MIN, notify)));
    const said = (await readRoomTalk('the-feed', s, T + 6 * MIN)).messages;
    assert.deepEqual(said.map((m) => m.feed.title), ['Newer', 'Newest'], 'an item was said twice, out of order, or not at all');
    assert.ok(said.every((m) => m.handle === FEED_NAMES['the-feed'] && !m.base && !m.claimed));
    const source = (await readRoomTalk('the-source', s, T + 6 * MIN)).messages;
    assert.deepEqual(source.map((m) => m.feed.title), ['A real change'], 'a morning timer\'s commit was said');
    assert.equal(source[0].handle, FEED_NAMES['the-source']);
    assert.deepEqual([source[0].feed.anon, source[0].feed.by], [true, ['Claude Opus 5.5']]);
    assert.equal(told.length, 3, 'somebody was told twice, or not told');
    assert.equal((await runFeedBot(s, get, T + 20 * MIN, notify)).said, 0, 'a second reading said it again');

    // A feed whose every id changed at once with nothing newer is a feed
    // rewritten, and is remembered in silence; a burst of new ones is said,
    // the newest FEED_RUN of them.
    rss = rss.map((i) => ({ ...i, guid: 'renamed-' + i.link }));
    assert.equal((await runFeedBot(s, get, T + 30 * MIN, notify)).said, 0, 'a rewritten feed was said all over again');
    rss = Array.from({ length: FEED_RUN + 4 }, (_, i) => ({ title: 'Burst ' + i, link: `https://${w.host}/b${i}/`, t: T + (40 + i) * MIN }));
    await runFeedBot(s, get, T + 60 * MIN, notify);
    const burst = (await readRoomTalk('the-feed', s, T + 61 * MIN)).messages.filter((m) => /^Burst/.test(m.feed.title));
    assert.equal(burst.length, FEED_RUN);
    assert.equal(burst[burst.length - 1].feed.title, 'Burst ' + (FEED_RUN + 3), 'the burst said its oldest rather than its newest');
  });
}

test('the feed bot never pushes a person off its channel', () => {
  const person = (i) => ({ id: 'p' + i, handle: 'Ada', text: 'hi', t: i });
  const bot = (i) => ({ id: 'b' + i, handle: 'The Feed', text: 'x', t: i, feed: { site: 's', title: 't', url: 'https://s/', when: i } });
  const log = keepBot([...Array.from({ length: 30 }, (_, i) => person(i)), ...Array.from({ length: 40 }, (_, i) => bot(100 + i))]);
  assert.equal(log.filter((m) => !m.feed).length, 30, 'a person\'s message went');
  assert.ok(log.length <= KEEP && log.filter((m) => m.feed).length <= FEED_KEEP);
  assert.equal(log[log.length - 1].id, 'b139', 'the newest arrival was the one dropped');
  const full = keepBot([...Array.from({ length: KEEP }, (_, i) => person(i)), bot(999)]);
  assert.deepEqual(full.map((m) => m.id), Array.from({ length: KEEP }, (_, i) => 'p' + i), 'an arrival pushed a person off a full channel');
});

test('what a feed bot says is nobody\'s: no username takes its name, nobody edits it, and only the base takes it off', async () => {
  for (const n of Object.values(FEED_NAMES)) {
    assert.ok(botWord(n) && botWord(` ${n.toUpperCase()} `));
    assert.equal((await checkHandle(n, readMods(''), memoryStore({ etagOnRead: true }))).ok, false, `${n} could be claimed`);
  }
  assert.equal(botWord('Ada'), false);
  const m = { id: 'x', handle: 'The Source', text: 'Star Stuff: a change', t: 1,
    feed: { site: 'Star Stuff', title: 'a change', url: 'https://github.com/Stimpunks/Star-Stuff/commit/' + sha('a'), when: 1, sha: 'aaaaaaa', by: ['ryanboren'] } };
  assert.equal(canEdit({ handle: 'The Source', role: 'base', account: true }, m), false);
  assert.equal(canTakeOff({ handle: 'The Source', role: 'mobile', account: true }, m), false);
  assert.equal(canTakeOff({ handle: 'Ryan', role: 'base' }, m), true);
  assert.deepEqual(shapeMessages([m])[0].feed, m.feed);
  assert.equal(shapeMessages([{ ...m, feed: { ...m.feed, url: 'javascript:alert(1)' } }])[0].feed, undefined, 'a feed message took an address that is not https');
  assert.equal(shapeFeed({ ...m.feed, by: ['ryanboren', 7, 'x'.repeat(99)] }).by.length, 1);
});

import { notifySuggestion } from './lib.mjs';

test('the suggestion box tells moderators who switched it on about what is new, whoever asked about a moderator\'s reply, and never the writer', () => withPasswords(async () => {
  const s = memoryStore({ etagOnRead: true });
  const mods = readMods('{"Ryan":["administrator"],"Juniper":[]}');
  for (const h of ['Ryan', 'Juniper', 'Ada', 'Bex']) await claimAccount(h, h.toLowerCase() + ' has a long phrase', s, 0, mods, true);
  const ryan = aDevice(), juniper = aDevice(), juniperOff = aDevice(), ada = aDevice(), adaQuiet = aDevice(), adaOff = aDevice(), bex = aDevice(), every = aDevice(), ryanPlain = aDevice();
  await keepDevice(ryan, issueAccountPass('Ryan', 1, 'base'), { suggestions: true }, s);
  await keepDevice(juniper, issueAccountPass('Juniper', 1, 'base'), { suggestions: true, answered: true }, s);
  await keepDevice(juniperOff, issueAccountPass('Juniper', 1, 'base'), { mentions: true }, s);
  await keepDevice(ada, issueAccountPass('Ada', 1), { answered: true }, s);
  await keepDevice(adaQuiet, issueAccountPass('Ada', 1), { answered: true, words: false }, s);
  await keepDevice(adaOff, issueAccountPass('Ada', 1), { suggestions: true }, s);
  await keepDevice(bex, issueAccountPass('Bex', 1), { suggestions: true, answered: true }, s);
  await keepDevice(every, issueAccountPass('Bex', 1), { all: true }, s);
  // Ryan's own username without the moderators' pass is not a moderator's device.
  await keepDevice(ryanPlain, issueAccountPass('Ryan', 1), { suggestions: true }, s);
  assert.equal(cleanWant({}).suggestions, false, 'the box was on before anybody switched it on');
  assert.equal(cleanWant({}).answered, false, 'answers were on before anybody switched them on');
  const sent = [];
  const send = async (sub, payload) => { sent.push({ to: sub.endpoint, payload }); return 201; };
  const to = (d) => sent.filter((x) => x.to === d.endpoint).map((x) => x.payload);

  const ASK = { role: 'mobile', handle: 'Ada', roles: new Set(), account: true, since: 0 };
  const JUN = { role: 'base', handle: 'Juniper', roles: new Set(['moderator']), account: true, since: 0 };
  const { item } = await addSuggestion(ASK, { kind: 'bug', title: 'Ramps', body: 'On   every\ndoor.' }, s);
  await notifySuggestion(item, null, s, mods, send);
  assert.deepEqual(to(ryan), [{ kind: 'suggestion', to: 'mods', handle: 'Ada', id: item.id, made: true, title: 'Ramps', text: 'On every door.' }], 'a new suggestion was not said to a moderator, or said with more');
  assert.equal(to(juniper).length, 1);
  assert.equal(to(juniperOff).length, 0, 'a moderator who never switched the box on was told');
  assert.equal(to(adaOff).length + to(ada).length, 0, 'whoever dropped it in was told about their own suggestion');
  assert.equal(to(bex).length + to(every).length, 0, 'somebody who is not a moderator was told what is new in the box');
  assert.equal(to(ryanPlain).length, 0, 'a moderator\'s username without the moderators\' pass was told');

  sent.length = 0;
  const mod = await replySuggestion(JUN, item.id, { body: 'Fixed.', status: 'done' }, s);
  await notifySuggestion(mod.item, mod.reply, s, mods, send);
  assert.deepEqual(to(ada), [{ kind: 'suggestion', to: 'asker', handle: 'Juniper', id: item.id, made: false, title: 'Ramps', text: 'Fixed.', mark: 'done' }], 'whoever asked was not told about a moderator\'s reply');
  assert.deepEqual(to(adaQuiet), [{ kind: 'suggestion', to: 'asker', handle: 'Juniper', id: item.id, made: false, title: '', text: '', mark: 'done' }], 'the words went to a device that turned them off');
  assert.equal(to(ryan).length + to(juniper).length, 0, 'a moderator\'s reply told the moderators, or the moderator who wrote it');
  assert.equal(to(bex).length, 0, 'somebody else was told about a moderator\'s reply');

  sent.length = 0;
  const back = await replySuggestion(ASK, item.id, { body: 'Thank you!' }, s);
  await notifySuggestion(back.item, back.reply, s, mods, send);
  assert.deepEqual(to(ryan).map((x) => [x.to, x.made, x.text]), [['mods', false, 'Thank you!']], 'a reply from whoever asked did not tell the moderators');
  assert.equal(to(ada).length + to(adaQuiet).length, 0, 'whoever asked was told about their own reply');

  // A moderator's own suggestion: other moderators are told, and its writer never.
  sent.length = 0;
  const own = await addSuggestion(JUN, { kind: 'feature', title: 'Kites', body: 'Please.' }, s);
  await notifySuggestion(own.item, null, s, mods, send);
  assert.equal(to(ryan).length, 1); assert.equal(to(juniper).length, 0, 'a moderator was told about their own suggestion');
}));
