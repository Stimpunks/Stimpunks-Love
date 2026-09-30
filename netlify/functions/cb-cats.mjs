/* Rescue A Cat: looking. Anybody can, with no pass. The answer is the cat
   waiting out on the street, if there is one, and the cats in the shelter this
   week, each with its looks, its name and when it came in, and nothing about
   who rescued it. When the next cat is due is not in it: cats turn up at
   random, and a page that knew would be a page that could camp. Search engines
   are asked not to keep it. */
import { readCats, shapeCat, json } from '../cb/lib.mjs';

export default async () => {
  const { waiting, shelter } = await readCats();
  return json(200, { waiting: waiting ? shapeCat(waiting) : null, shelter: shelter.map(shapeCat) },
    { 'x-robots-tag': 'noindex, nofollow, noarchive' });
};

export const config = {
  path: '/cb/cats',
  method: 'GET',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
