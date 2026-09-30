/* Pando Calrissian's tree: watering it. Only with a CB pass, the chalkboard's
   rule, and the pass is checked and then forgotten: nothing about who poured
   is written anywhere, because the tree counts water and never waterers. If
   the ground is still soaking from anybody's last watering, the answer says so
   and how long, and the number does not move. */
import { readPass, waterTree, json, sameSite, PANDO_SOAK } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This tree only answers stimpunks.world.' });
  if (!(await readPass(req))) return json(401, { error: 'signed off' });
  try {
    const r = await waterTree();
    return json(200, { water: r.tree.water, wet: r.tree.wet, poured: r.poured, soaks: r.soaks || 0, soak: PANDO_SOAK, now: Date.now() });
  } catch (e) {
    return json(503, { error: 'Somebody else has the can. Try again in a moment.' });
  }
};

export const config = {
  path: '/cb/pando/water',
  method: 'POST',
  rateLimit: { windowLimit: 6, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
