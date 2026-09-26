/* A pebble bowl: reading it. Anybody can, with no pass, the chalkboard's rule,
   because a bowl by a door is seen by whoever comes to the door. What it will
   not do is let the pebbles into a search engine: a week in somebody's room is
   not a permanent record on somebody else's index. */
import { pebbleRoom, readPebbles, shapePebbles, json } from '../cb/lib.mjs';

export default async (req) => {
  const room = pebbleRoom(new URL(req.url).searchParams.get('room'));
  if (!room) return json(404, { error: 'There is no bowl in that room.' });
  const list = await readPebbles(room);
  return json(200, { pebbles: shapePebbles(list) }, { 'x-robots-tag': 'noindex, nofollow, noarchive' });
};

export const config = {
  path: '/cb/pebbles',
  method: 'GET',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
