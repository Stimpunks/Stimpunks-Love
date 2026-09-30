/* A shelter: the base station taking a name off an animal, wherever the
   animal is: the shelter, the forever list, anybody's pets. The animal stays. */
import { readPass, animalKind, unnameAnimal, shapeAnimal, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This shelter only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who || who.role !== 'base') return json(403, { error: 'Only the base station can do that.' });
  const b = (await body(req)) || {};
  const kind = animalKind(b.kind);
  if (!kind || typeof b.id !== 'string') return json(400, { error: 'Which animal?' });
  try {
    const shelter = await unnameAnimal(kind, b.id);
    return json(200, { shelter: shelter.map(shapeAnimal) });
  } catch (e) {
    return json(503, { error: 'The shelter door is busy. Try again in a moment.' });
  }
};

export const config = {
  path: '/cb/shelter/unname',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
