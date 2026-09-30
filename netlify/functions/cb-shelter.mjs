/* A shelter, Rescue A Cat's or Rescue A Dog's: looking. Anybody can, with no
   pass. ?kind=cat or dog. The answer is the animal waiting out on the street,
   if there is one, the shelter's animals, whether it is full, and nothing about
   who rescued any of them. When the next animal is due is not in it: they turn
   up at random, and a page that knew could camp. Search engines are asked not
   to keep it. */
import { animalKind, readShelter, shapeAnimal, json } from '../cb/lib.mjs';

export default async (req) => {
  const kind = animalKind(new URL(req.url).searchParams.get('kind'));
  if (!kind) return json(404, { error: 'There is no shelter for that.' });
  const { waiting, shelter, full } = await readShelter(kind);
  return json(200, { waiting: waiting ? shapeAnimal(waiting) : null, shelter: shelter.map(shapeAnimal), full },
    { 'x-robots-tag': 'noindex, nofollow, noarchive' });
};

export const config = {
  path: '/cb/shelter',
  method: 'GET',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
