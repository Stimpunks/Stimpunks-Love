/* The chalkboard: the base station rubbing a note out before its week is up.
   Only a pass issued for the moderators' password can do this, as on the
   channel. */
import { readPass, updateChalk, shapeChalk, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This board only answers stimpunks.world.' });
  const who = readPass(req);
  if (!who || who.role !== 'base') return json(403, { error: 'Only the base station can do that.' });
  const b = (await body(req)) || {};
  if (typeof b.remove !== 'string') return json(400, { error: 'Which note?' });
  try {
    const notes = await updateChalk((list) => list.filter((n) => n.id !== b.remove));
    return json(200, { notes: shapeChalk(notes) });
  } catch (e) {
    return json(503, { error: 'Somebody else has the chalk. Try again in a moment.' });
  }
};

export const config = {
  path: '/cb/chalk/rub',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
