/* Your profile, for the CB's Profile (Ryan, 2026-10-17). GET with a pass gives
   it, with whether your username is claimed and the lists it chooses from.
   POST with a pass:
     { profile: { theme, banner, decoration, frame, effect, face, plate,
                  pronouns, bio, links, room, why } }
                                         keeps it, every part checked by
                                         cleanProfile(); one with nothing in
                                         it is cleared instead
     { clear: true }                     clears it, off Who's online first
   and your PROFILE SETS (2026-10-19), each the card's look under a name and
   which avatar is worn, read off the card as it is saved:
     { setSave: name }                   the card as it is, as a new set
     { setWear: id }                     its look on the card, words kept, and
                                         its avatar worn, or none
     { setUpdate: id }                   the card as it is, into that set
     { setRename: id, name }
     { setRemove: id }
   each answered with the card, the sets and the avatar worn, as GET gives.
   Sets are never shown to anybody else.
   Only a claimed username has a profile, because an unclaimed handle is
   anybody's who signs on with it. Whatever is in it is shown to anybody signed
   on to the CB, as privacy.html#profile says. It holds no date. FORGET ME,
   in /cb/pets, and deleting the username clear it too. */
import { readPass, petKey, readProfile, keepProfile, forgetProfile, cleanProfile, PROFILE_KEYS,
  PRONOUNS_MAX, BIO_MAX, PROFILE_LINKS, PROFILE_LINK_MAX, ROOM_WHY_MAX,
  readProfileSets, shapeProfileSet, saveProfileSet, wearProfileSet, refreshProfileSet, renameProfileSet, removeProfileSet,
  PROFILE_SET_NAME_MAX, readAvatars, json, body, sameSite } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };
const LIMITS = { pronouns: PRONOUNS_MAX, bio: BIO_MAX, links: PROFILE_LINKS, link: PROFILE_LINK_MAX, why: ROOM_WHY_MAX, setName: PROFILE_SET_NAME_MAX };
const SET_SAID = {
  name: `A set needs a name, of at most ${PROFILE_SET_NAME_MAX} characters.`,
  taken: 'You already have a set with that name.',
  full: 'You have as many sets as the CB keeps. Delete one and you can save another.',
  which: 'That set is not among yours any more.',
  look: 'That set could not be worn just now. Nothing changed.',
};

/* The card, the sets and the avatar worn, read afresh. */
async function answer(pk, claimed) {
  if (!claimed) return { claimed, profile: null, sets: [], wearing: null };
  const [profile, sets, av] = await Promise.all([readProfile(pk), readProfileSets(pk), readAvatars(pk)]);
  return { claimed, profile, sets: sets.map((x) => shapeProfileSet(x, av.avatars, profile, av.wearing)), wearing: av.wearing };
}

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This tray only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const pk = petKey(who.handle);
  const claimed = !!who.account;
  if (req.method !== 'POST') {
    return json(200, { ...(await answer(pk, claimed)), keys: PROFILE_KEYS, limits: LIMITS }, NOINDEX);
  }
  if (!claimed) return json(403, { error: 'Claim your username first: an unclaimed handle is anybody’s who signs on with it, so nobody can write a profile for it.' });
  const b = (await body(req)) || {};
  try {
    if (b.clear === true) {
      await forgetProfile(pk);
      return json(200, { claimed, profile: null }, NOINDEX);
    }
    const set = b.setSave !== undefined ? await saveProfileSet(pk, b.setSave)
      : b.setWear !== undefined ? await wearProfileSet(pk, b.setWear)
      : b.setUpdate !== undefined ? await refreshProfileSet(pk, b.setUpdate)
      : b.setRename !== undefined ? await renameProfileSet(pk, b.setRename, b.name)
      : b.setRemove !== undefined ? await removeProfileSet(pk, b.setRemove)
      : null;
    if (set) {
      if (set.error) return json(set.error === 'which' ? 404 : 400, { error: SET_SAID[set.error] || SET_SAID.look });
      return json(200, { ...(await answer(pk, claimed)), avatarGone: !!set.avatarGone }, NOINDEX);
    }
    if (b.profile !== undefined) {
      const c = cleanProfile(b.profile);
      if (c.error) return json(400, { error: c.error });
      return json(200, { claimed, profile: await keepProfile(pk, c.profile) }, NOINDEX);
    }
  } catch (e) {
    return json(503, { error: 'That did not work just now. Nothing changed; try again in a moment.' });
  }
  return json(400, { error: 'Keep or clear what?' });
};

export const config = {
  path: '/cb/profile',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
