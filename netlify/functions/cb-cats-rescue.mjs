/* Rescue A Cat: rescuing one. Only with a CB pass, and the first press on a
   cat is the one that brings it in; anybody a moment later is told it is
   already safe. The pass is checked and forgotten: the shelter records the cat
   and the name its rescuer gave it, and not who they were. The rescuer's page
   keeps its own list; nothing here does. */
import { readPass, rescueCat, cleanCatName, shapeCat, json, body, sameSite, CAT_NAME_MAX } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This shelter only answers stimpunks.world.' });
  if (!readPass(req)) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  if (typeof b.id !== 'string' || !/^c[0-9a-z]{1,12}$/.test(b.id)) return json(400, { error: 'Which cat?' });
  const name = cleanCatName(b.name);
  if (name === null) return json(400, { error: `A name is up to ${CAT_NAME_MAX} characters.` });
  try {
    const r = await rescueCat(b.id, name);
    if (!r.rescued) {
      return json(409, { error: 'That cat is already safe in the shelter. Somebody got there first.',
        shelter: r.shelter.map(shapeCat) });
    }
    return json(200, { rescued: shapeCat(r.cat), shelter: r.shelter.map(shapeCat) });
  } catch (e) {
    return json(503, { error: 'The shelter door is busy. Try again in a moment.' });
  }
};

export const config = {
  path: '/cb/cats/rescue',
  method: 'POST',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
