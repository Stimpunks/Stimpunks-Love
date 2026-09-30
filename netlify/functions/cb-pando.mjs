/* Pando Calrissian's tree: reading it, and the fence beside it. Anybody can,
   with no pass, the chalkboard's rule, because a tree on a hillside is seen by
   whoever walks up the hill. The answer is the number of waterings, when the
   last one soaks in, the notes on the fence, and the server's clock, so the
   page can say how long the ground has left to soak without trusting the
   visitor's clock. Nothing in it says who watered. Search engines are asked
   not to keep it. */
import { readTree, readFence, shapeChalk, json, PANDO_SOAK } from '../cb/lib.mjs';

export default async () => {
  const [tree, notes] = await Promise.all([readTree(), readFence()]);
  return json(200, { water: tree.water, wet: tree.wet, soak: PANDO_SOAK, now: Date.now(), notes: shapeChalk(notes) },
    { 'x-robots-tag': 'noindex, nofollow, noarchive' });
};

export const config = {
  path: '/cb/pando',
  method: 'GET',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
