/* A shelter: rescuing an animal. Only with a CB pass, and the first press on
   an animal brings it in; anybody a moment later is told it is already safe.
   The pass is checked and forgotten: the shelter keeps the animal and the name
   its rescuer gave it, not who they were. */
import { readPass, animalKind, rescueAnimal, cleanAnimalName, shapeAnimal, json, body, sameSite, ANIMAL_NAME_MAX } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This shelter only answers stimpunks.world.' });
  if (!readPass(req)) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  const kind = animalKind(b.kind);
  if (!kind) return json(404, { error: 'There is no shelter for that.' });
  if (typeof b.id !== 'string' || !/^[cd][0-9a-z]{1,12}$/.test(b.id)) return json(400, { error: 'Which animal?' });
  const name = cleanAnimalName(b.name);
  if (name === null) return json(400, { error: `A name is up to ${ANIMAL_NAME_MAX} characters.` });
  try {
    const r = await rescueAnimal(kind, b.id, name);
    const shelter = r.shelter.map(shapeAnimal);
    if (r.rescued) return json(200, { rescued: shapeAnimal(r.animal), shelter });
    if (r.why === 'full') {
      return json(409, { full: true, shelter, error: 'The shelter is full. Somebody has to adopt before another can come in, so this one waits outside for now.' });
    }
    return json(409, { shelter, error: 'That one is already safe in the shelter. Somebody got there first.' });
  } catch (e) {
    return json(503, { error: 'The shelter door is busy. Try again in a moment.' });
  }
};

export const config = {
  path: '/cb/shelter/rescue',
  method: 'POST',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
