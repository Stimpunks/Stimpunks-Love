/* The CB: the base station taking something off the air before midnight.
   Only a pass issued for the moderators' password can do this, on whichever
   channel the base is tuned to. */
import { readPass, updateTuned, roomTag, shape, json, body, sameSite, dropImages, droppedImages } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who || who.role !== 'base') return json(403, { error: 'Only the base station can do that.' });
  const b = (await body(req)) || {};
  const room = b.room == null ? null : roomTag(b.room);
  if (b.room != null && !room) return json(400, { error: 'That is not a room on the street.' });
  try {
    let seen = [];
    const messages = await updateTuned(room, (list) => {
      seen = list.slice();
      if (b.clear === true) return [];
      if (typeof b.remove === 'string') return list.filter((m) => m.id !== b.remove);
      return null;
    });
    // A message taken off the air takes its picture with it.
    await dropImages(droppedImages(seen, messages));
    return json(200, { messages: shape(messages) });
  } catch (e) {
    return json(503, { error: 'The channel is busy. Try again in a moment.' });
  }
};

export const config = {
  path: '/cb/moderate',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
