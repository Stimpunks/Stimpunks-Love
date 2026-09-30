/* Rescue A Cat: the base station taking a name off a cat in the shelter, when
   the name should not be on show. The cat stays where it is. */
import { readPass, unnameCat, shapeCat, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This shelter only answers stimpunks.world.' });
  const who = readPass(req);
  if (!who || who.role !== 'base') return json(403, { error: 'Only the base station can do that.' });
  const b = (await body(req)) || {};
  if (typeof b.id !== 'string') return json(400, { error: 'Which cat?' });
  try {
    const shelter = await unnameCat(b.id);
    return json(200, { shelter: shelter.map(shapeCat) });
  } catch (e) {
    return json(503, { error: 'The shelter door is busy. Try again in a moment.' });
  }
};

export const config = {
  path: '/cb/cats/unname',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
