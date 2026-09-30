/* Your pets, for the CB's Profile. GET with a pass lists them; POST
   { rename: id, name } renames one of them, in your pets and on the forever
   list; POST { show: true | false } makes them public to people on the CB,
   or not, and only a claimed username can; POST { forget: true } with a pass
   is FORGET ME: it deletes everything the street
   keeps under that handle, which is the pets and nothing else, and the animals
   stay on the forever list, which never knew who adopted them. A handle is not
   an account, so whoever signs on with it has these pets; the tray says so. */
import { readPass, readPets, forgetPets, renamePet, setShown, isShown, petKey, shapeAnimal, cleanAnimalName, ANIMAL_NAME_MAX, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This tray only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const pk = petKey(who.handle);
  if (req.method === 'POST') {
    const b = (await body(req)) || {};
    if (typeof b.show === 'boolean') {
      if (!who.account) return json(403, { error: 'Claim your username first: an unclaimed handle is anybody\u2019s who signs on with it, so it cannot show pets on anybody\u2019s behalf.' });
      let shown;
      try { shown = await setShown(who.handle, b.show); }
      catch (e) { return json(503, { error: 'That did not work just now. Nothing changed.' }); }
      return json(200, { shown });
    }
    if (typeof b.rename === 'string') {
      if (!/^[cd][0-9a-z]{1,12}$/.test(b.rename)) return json(400, { error: 'Which pet?' });
      const name = cleanAnimalName(b.name);
      if (!name) return json(400, { error: `A name is between one and ${ANIMAL_NAME_MAX} characters.` });
      try {
        const r = await renamePet(pk, b.rename, name);
        if (r.error) return json(404, { error: r.error });
        return json(200, { renamed: shapeAnimal(r.pet), pets: (await readPets(pk)).map(shapeAnimal) });
      } catch (e) { return json(503, { error: 'That did not work just now. Try again in a moment; pressing it again finishes it.' }); }
    }
    if (b.forget !== true) return json(400, { error: 'Forget what?' });
    try { await forgetPets(pk); return json(200, { forgotten: true, pets: [] }); }
    catch (e) { return json(503, { error: 'That did not work just now. Nothing was forgotten; try again in a moment.' }); }
  }
  const pets = (await readPets(pk)).map(shapeAnimal);
  const shown = !!who.account && await isShown(who.handle);
  return json(200, { pets, shown, claimed: !!who.account });
};

export const config = {
  path: '/cb/pets',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
