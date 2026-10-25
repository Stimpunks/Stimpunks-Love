/* Your past notifications (Ryan's ask, 2026-10-25), for a claimed username.
   A POST with a pass:
     {}               { notices }: what your devices were told in the last
                      30 days, newest first, each with its words read again
                      from wherever they still are, and `fresh` on the ones
                      you had not seen, which this marks seen
     { clear: true }  deletes the whole of it
   you.html asks when it opens and from inside listen() while it is in front
   of you, and nowhere else. Nothing here is counted, and nobody but you is
   ever sent your list. See noticeArchive in ../cb/lib.mjs. */
import { readPass, forumReader, noticeArchive, forgetNotices, petKey, json, body, sameSite } from '../cb/lib.mjs';

// Every answer asks search engines not to index or archive it.
const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  if (!forumReader(who)) return json(403, { error: 'Claim your username, under Account on this radio, and your past notifications are kept for you.' }, NOINDEX);
  const b = (await body(req)) || {};
  try {
    if (b.clear === true) {
      await forgetNotices(petKey(who.handle));
      return json(200, { notices: [] }, NOINDEX);
    }
    return json(200, { notices: await noticeArchive(who) }, NOINDEX);
  } catch (e) {
    return json(503, { error: 'busy' }, NOINDEX);
  }
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/notices',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
