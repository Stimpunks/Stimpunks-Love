/* The community directory, for directory.html (Ryan's ask, 2026-10-23): GET
   /cb/directory with a pass gives { people, listed }: everybody who switched
   on Show my profile in the community directory on their profile card,
   alphabetical, each with their username, BASE if they are a moderator,
   nameplate, tagline, pronouns and the avatar they wear, and whether the asker
   is in it. Anybody signed on to the CB may ask, and nobody else. Nothing
   about who asked is kept, and the answer has no number in it.
   communityDirectory in netlify/cb/lib.mjs; privacy.html#community-directory. */
import { readPass, communityDirectory, json, sameSite } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The directory only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  try {
    return json(200, await communityDirectory(who), NOINDEX);
  } catch (e) {
    return json(503, { error: 'The directory could not be read just now. Try again in a moment.' });
  }
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/directory',
  method: 'GET',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
