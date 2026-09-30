/* Everybody ever adopted from a shelter, for good, a month to a page, and
   never who adopted them. Anybody can read it. ?kind=cat or dog, and ?month=
   YYYY-MM for one month; without a month, the months there are and the newest
   one's animals. Search engines are asked not to keep it. */
import { animalKind, readAdopted, adoptedMonths, shapeAnimal, json } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  const q = new URL(req.url).searchParams;
  const kind = animalKind(q.get('kind'));
  if (!kind) return json(404, { error: 'There is no shelter for that.' });
  const months = await adoptedMonths(kind);
  let month = q.get('month');
  if (month !== null && !/^\d{4}-\d{2}$/.test(month)) return json(400, { error: 'A month is like 2026-09.' });
  if (month === null) month = months[months.length - 1] || null;
  const animals = month ? await readAdopted(kind, month) : [];
  return json(200, { months, month, animals: animals.map(shapeAnimal) }, NOINDEX);
};

export const config = {
  path: '/cb/adopted',
  method: 'GET',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
