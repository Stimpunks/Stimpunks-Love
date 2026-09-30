/* A shelter: adopting an animal. Only with a CB pass. The first to press gets
   it; it leaves the shelter, goes onto the forever list (which never says who
   adopted it), and into the adopter's pets, filed under a scrambled form of
   their handle so they follow them to any device. Ryan's call, 2026-09-30:
   this is the one thing the street keeps under a person, and Forget Me in the
   Profile deletes it. */
import { ANIMAL_ID, readPass, animalKind, adoptAnimal, petKey, shapeAnimal, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This shelter only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  const kind = animalKind(b.kind);
  if (!kind) return json(404, { error: 'There is no shelter for that.' });
  if (typeof b.id !== 'string' || !ANIMAL_ID.test(b.id)) return json(400, { error: 'Which animal?' });
  try {
    const r = await adoptAnimal(kind, b.id, petKey(who.handle));
    const shelter = r.shelter.map(shapeAnimal);
    if (r.adopted) return json(200, { adopted: shapeAnimal(r.animal), shelter });
    return json(409, { shelter, error: 'Somebody else adopted that one first. They have a home.' });
  } catch (e) {
    return json(503, { error: 'The shelter door is busy. Try again in a moment.' });
  }
};

export const config = {
  path: '/cb/shelter/adopt',
  method: 'POST',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
