/* Your pets, for the CB's Profile. GET with a pass lists them; POST
   { forget: true } with a pass is FORGET ME: it deletes everything the street
   keeps under that handle, which is the pets and nothing else, and the animals
   stay on the forever list, which never knew who adopted them. A handle is not
   an account, so whoever signs on with it has these pets; the tray says so. */
import { readPass, readPets, forgetPets, petKey, shapeAnimal, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This tray only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const pk = petKey(who.handle);
  if (req.method === 'POST') {
    const b = (await body(req)) || {};
    if (b.forget !== true) return json(400, { error: 'Forget what?' });
    try { await forgetPets(pk); return json(200, { forgotten: true, pets: [] }); }
    catch (e) { return json(503, { error: 'That did not work just now. Nothing was forgotten; try again in a moment.' }); }
  }
  return json(200, { pets: (await readPets(pk)).map(shapeAnimal) });
};

export const config = {
  path: '/cb/pets',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
