/* A pebble bowl: the base station lifting a pebble out before its week is up.
   Only a pass issued for the moderators' password can do this, as on the
   channel and the chalkboard. */
import { readPass, pebbleRoom, updatePebbles, shapePebbles, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This bowl only answers stimpunks.world.' });
  const who = readPass(req);
  if (!who || who.role !== 'base') return json(403, { error: 'Only the base station can do that.' });
  const b = (await body(req)) || {};
  const room = pebbleRoom(b.room);
  if (!room) return json(404, { error: 'There is no bowl in that room.' });
  if (typeof b.remove !== 'string') return json(400, { error: 'Which pebble?' });
  try {
    const list = await updatePebbles(room, (l) => l.filter((n) => n.id !== b.remove));
    return json(200, { pebbles: shapePebbles(list) });
  } catch (e) {
    return json(503, { error: 'Somebody else is at the bowl. Try again in a moment.' });
  }
};

export const config = {
  path: '/cb/pebbles/lift',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
