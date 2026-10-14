/* Somebody else's avatars, for their profile on the CB: POST /cb/avatars/of
   { handle }, with a pass, when you press their name on Who's online or their
   handle on the channel. The answer is the avatar they wear, if they wear one,
   and the rest only if they have switched on Show my avatars on the CB, which
   only a claimed username can; for a handle that is not claimed it is
   { wearing: null, shown: false }, the same whether the handle is unclaimed or
   nobody at all. Nothing about who asked is kept, and the handle travels in
   the body rather than the address, so it is in no request log. */
import { readPass, shownAvatars, cleanHandle, json, body, sameSite } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This tray only answers stimpunks.world.' });
  if (!(await readPass(req))) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  const handle = cleanHandle(b.handle);
  if (!handle) return json(400, { error: 'Whose avatars?' });
  const got = await shownAvatars(handle);
  return json(200, got || { handle, wearing: null, shown: false }, NOINDEX);
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/avatars/of',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
