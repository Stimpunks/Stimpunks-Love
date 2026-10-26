/* Your crystal pouch, for the CB's Profile and for the Crystal Wheel in Myths
   & Legends. GET with a pass lists the crystals in it and whether it is shown;
   POST { take: id } puts one in, the press on a card's Take it with you;
   POST { back: id } puts one back; POST { show: true | false } shows the pouch
   to people on the CB, or not, and only a claimed username can. Which
   crystals is all that is kept: nothing about when, and nothing about who else
   has one. Forget me, in /cb/pets, empties it. */
import { readPass, petKey, crystalId, readCrystals, pouchCrystal, setCrystalsShown, crystalsShown, json, body, sameSite } from '../cb/lib.mjs';

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
        if (!claimed) return json(403, { error: 'Claim your username first: an unclaimed handle is anybody’s who signs on with it, so it cannot show a pouch on anybody’s behalf.' });
        return json(200, { shown: await setCrystalsShown(who.handle, b.show) }, NOINDEX);
      }
      const put = b.take !== undefined;
      const id = crystalId(put ? b.take : b.back);
      if (!id) return json(400, { error: 'That is not a crystal on the wheel.' });
      const r = await pouchCrystal(pk, id, put);
      return json(200, { changed: r.changed, crystals: r.crystals }, NOINDEX);
    }
    const crystals = await readCrystals(pk);
    return json(200, { crystals, shown: claimed && await crystalsShown(who.handle), claimed }, NOINDEX);
  } catch (e) {
    return json(503, { error: 'That did not work just now. Try again in a moment.' });
  }
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/crystals',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
