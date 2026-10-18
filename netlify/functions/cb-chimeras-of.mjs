/* Somebody else's chimeras, for their profile on the CB: POST /cb/chimeras/of
   { handle }, with a pass, when you press their name on Who's online or their
   handle on the channel. The answer is their chimeras only if they have
   switched on Show my chimeras on the CB, which only a claimed username can;
   for a handle that is not claimed it is { shown: false }, the same whether
   the handle is unclaimed or nobody at all, and it never says whether somebody
   has chimeras they have not shown. Nothing about who asked is kept, and the
   handle travels in the body rather than the address, so it is in no request
   log. */
import { readPass, shownChimeras, cleanHandle, json, body, sameSite } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This tray only answers stimpunks.world.' });
  if (!(await readPass(req))) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  const handle = cleanHandle(b.handle);
  if (!handle) return json(400, { error: 'Whose chimeras?' });
  const got = await shownChimeras(handle);
  return json(200, got || { handle, shown: false }, NOINDEX);
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/chimeras/of',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
