/* Somebody else's profile on the CB: POST /cb/profile/of { handle }, with a
   pass, when you press their name on Who's online or their handle on the
   channel. The answer is { handle, profile } for a claimed username, with
   profile null when there is nothing in it, and { handle, profile: null } for
   a handle that is not claimed, the same whether it is unclaimed or nobody at
   all. Nothing about who asked is kept, and the handle travels in the body
   rather than the address, so it is in no request log. */
import { readPass, shownProfile, cleanHandle, json, body, sameSite } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This tray only answers stimpunks.world.' });
  if (!(await readPass(req))) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  const handle = cleanHandle(b.handle);
  if (!handle) return json(400, { error: 'Whose profile?' });
  const got = await shownProfile(handle);
  return json(200, got || { handle, profile: null }, NOINDEX);
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/profile/of',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
