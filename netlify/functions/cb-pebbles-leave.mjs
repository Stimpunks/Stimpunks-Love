/* A pebble bowl: leaving a pebble. Only with a CB pass, which keeps the bowls
   to people who have the community password, the chalkboard's rule. The
   thirty-first pebble in a bowl pushes out the oldest, and each one goes seven
   days after it was left. */
import { randomUUID } from 'node:crypto';
import { readPass, pebbleRoom, updatePebbles, cleanPebble, cleanLink, shapePebbles, json, body, sameSite,
  PEBBLE_MAX, PEBBLE_LINK_MAX } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This bowl only answers stimpunks.world.' });
  const who = readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  const room = pebbleRoom(b.room);
  if (!room) return json(404, { error: 'There is no bowl in that room.' });
  const text = cleanPebble(b.text);
  if (!text) return json(400, { error: `A pebble is between one and ${PEBBLE_MAX} characters of words.` });
  const link = cleanLink(b.link);
  if (link === null) {
    return json(400, { error: `A link is an address starting https://, up to ${PEBBLE_LINK_MAX} characters.` });
  }
  try {
    const list = await updatePebbles(room, (l) => {
      l.push({ id: randomUUID(), handle: who.handle, text, link, t: Date.now(), base: who.role === 'base' });
      return l;
    });
    return json(200, { pebbles: shapePebbles(list) });
  } catch (e) {
    return json(503, { error: 'Somebody else is at the bowl. Try again in a moment.' });
  }
};

export const config = {
  path: '/cb/pebbles/leave',
  method: 'POST',
  rateLimit: { windowLimit: 6, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
