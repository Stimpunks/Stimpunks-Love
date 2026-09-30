/* Pando Calrissian's fence: the base station taking a note down before its
   week is up, as on the chalkboard. Nothing takes a watering back: the count
   is the tree's, and it only goes up. */
import { readPass, updateFence, shapeChalk, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This fence only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who || who.role !== 'base') return json(403, { error: 'Only the base station can do that.' });
  const b = (await body(req)) || {};
  if (typeof b.remove !== 'string') return json(400, { error: 'Which note?' });
  try {
    const notes = await updateFence((list) => list.filter((n) => n.id !== b.remove));
    return json(200, { notes: shapeChalk(notes) });
  } catch (e) {
    return json(503, { error: 'Somebody else is at the fence. Try again in a moment.' });
  }
};

export const config = {
  path: '/cb/pando/rub',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
