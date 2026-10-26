/* Somebody else's herb basket, for their profile on the CB: POST
   /cb/herbs/of { handle }, with a pass, when you press their handle on the
   channel or their name on Who's online. The answer is which herbs are in
   it, only if they have chosen to show it, which only a claimed username can;
   otherwise it is { shown: false }, the same whether the handle is unclaimed,
   not shown, holding nothing or nobody at all. Nothing about who asked is
   kept, and the handle travels in the body rather than the address, so it is
   in no request log. */
import { readPass, shownHerbs, cleanHandle, json, body, sameSite } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This only answers stimpunks.world.' });
  if (!(await readPass(req))) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  const handle = cleanHandle(b.handle);
  if (!handle) return json(400, { error: 'Whose basket?' });
  const got = await shownHerbs(handle);
  return got ? json(200, { shown: true, handle: got.handle, herbs: got.herbs }, NOINDEX) : json(200, { shown: false, handle }, NOINDEX);
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/herbs/of',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
