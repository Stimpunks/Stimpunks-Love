/* The Fridge of Sighs: reading the door. Anybody can, with no pass, because a
   fridge door is read by whoever comes into the kitchen. The answer is the line
   being built, the newest finished sentences, and which months' drawers have
   any in them; ?drawer=YYYY-MM answers with that drawer instead. Nothing in
   either says who put up any word, and the mark that keeps "never two in a row"
   is never sent. Search engines are asked not to keep it. */
import { readFridge, readDrawer, drawers, shapeLine, shapeSentences, json } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  const month = new URL(req.url).searchParams.get('drawer');
  if (month !== null) {
    if (!/^\d{4}-\d{2}$/.test(month)) return json(400, { error: 'A drawer is a month, like 2026-09.' });
    return json(200, { month, sentences: shapeSentences(await readDrawer(month)) }, NOINDEX);
  }
  const [door, months] = await Promise.all([readFridge(), drawers()]);
  return json(200, { words: shapeLine(door.words), door: shapeSentences(door.door), drawers: months }, NOINDEX);
};

export const config = {
  path: '/cb/fridge',
  method: 'GET',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
