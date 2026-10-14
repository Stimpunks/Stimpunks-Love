/* Your battle jacket, for the CB's Profile and for a patch in a room. GET with
   a pass lists the patches sewn on it and whether it is shown; POST
   { take: id } takes one patch, once, the press on a room's Pick it up or Take
   one; POST { show: true | false } shows the jacket to people on the CB, or
   not, and only a claimed username can. Which patches is all that is kept:
   nothing about when, and nothing about who else has one. A handle is not an
   account: whoever signs on with an unclaimed one has this jacket too, and
   Profile says so. Forget me, in /cb/pets, takes it away. */
import { readPass, petKey, patchId, readPatches, takePatch, setPatchesShown, patchesShown, json, body, sameSite } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const pk = petKey(who.handle);
  const claimed = !!who.account;
  try {
    if (req.method === 'POST') {
      const b = (await body(req)) || {};
      if (typeof b.show === 'boolean') {
        if (!claimed) return json(403, { error: 'Claim your username first: an unclaimed handle is anybody’s who signs on with it, so it cannot show a jacket on anybody’s behalf.' });
        return json(200, { shown: await setPatchesShown(who.handle, b.show) }, NOINDEX);
      }
      const id = patchId(b.take);
      if (!id) return json(400, { error: 'That is not a patch on this street.' });
      const r = await takePatch(pk, id);
      return json(200, { taken: r.taken, patches: r.patches }, NOINDEX);
    }
    const patches = await readPatches(pk);
    return json(200, { patches, shown: claimed && await patchesShown(who.handle), claimed }, NOINDEX);
  } catch (e) {
    return json(503, { error: 'That did not work just now. Try again in a moment.' });
  }
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/patches',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
