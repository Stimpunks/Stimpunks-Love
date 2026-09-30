/* Somebody else's pets, for the CB: POST /cb/pets/of { handle }, with a pass,
   when you press their handle on the channel. The answer is their pets only if
   they have made them public, which only a claimed username can; otherwise it
   is { shown: false }, the same whether the handle is unclaimed, not shown or
   nobody at all. Nothing about who asked is kept, and the handle travels in
   the body rather than the address, so it is in no request log. */
import { readPass, shownPets, cleanHandle, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This tray only answers stimpunks.world.' });
  if (!(await readPass(req))) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  const handle = cleanHandle(b.handle);
  if (!handle) return json(400, { error: 'Whose pets?' });
  const got = await shownPets(handle);
  return got ? json(200, { shown: true, handle: got.handle, pets: got.pets }) : json(200, { shown: false, handle });
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/pets/of',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
