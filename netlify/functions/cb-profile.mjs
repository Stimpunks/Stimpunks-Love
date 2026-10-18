/* Your profile, for the CB's Profile (Ryan, 2026-10-17). GET with a pass gives
   it, with whether your username is claimed and the lists it chooses from.
   POST with a pass:
     { profile: { theme, banner, decoration, face, plate, pronouns, bio,
                  links, room, why } }   keeps it, every part checked by
                                         cleanProfile(); one with nothing in
                                         it is cleared instead
     { clear: true }                     clears it, off Who's online first
   Only a claimed username has a profile, because an unclaimed handle is
   anybody's who signs on with it. Whatever is in it is shown to anybody signed
   on to the CB, as privacy.html#profile says. It holds no date. FORGET ME,
   in /cb/pets, and deleting the username clear it too. */
import { readPass, petKey, readProfile, keepProfile, forgetProfile, cleanProfile, PROFILE_KEYS,
  PRONOUNS_MAX, BIO_MAX, PROFILE_LINKS, PROFILE_LINK_MAX, ROOM_WHY_MAX, json, body, sameSite } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };
const LIMITS = { pronouns: PRONOUNS_MAX, bio: BIO_MAX, links: PROFILE_LINKS, link: PROFILE_LINK_MAX, why: ROOM_WHY_MAX };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This tray only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const pk = petKey(who.handle);
  const claimed = !!who.account;
  if (req.method !== 'POST') {
    return json(200, { claimed, profile: claimed ? await readProfile(pk) : null, keys: PROFILE_KEYS, limits: LIMITS }, NOINDEX);
  }
  if (!claimed) return json(403, { error: 'Claim your username first: an unclaimed handle is anybody’s who signs on with it, so nobody can write a profile for it.' });
  const b = (await body(req)) || {};
  try {
    if (b.clear === true) {
      await forgetProfile(pk);
      return json(200, { claimed, profile: null }, NOINDEX);
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
