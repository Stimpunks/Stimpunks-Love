/* The chalkboard: reading it. Anybody can, with no pass, because a board on the
   pavement is read by whoever walks past -- Ryan's call, 2026-09-25, and the
   board says so above the box you write in. What it will not do is let the
   notes into a search engine: a week on a street is not a permanent record on
   somebody else's index. */
import { readChalk, shapeChalk, json } from '../cb/lib.mjs';

export default async () => {
  const notes = await readChalk();
  return json(200, { notes: shapeChalk(notes) }, { 'x-robots-tag': 'noindex, nofollow, noarchive' });
};

export const config = {
  path: '/cb/chalk',
  method: 'GET',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
