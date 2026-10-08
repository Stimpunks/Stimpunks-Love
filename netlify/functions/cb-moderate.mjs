/* The CB: taking something off the air before midnight. Anybody signed on can
   take off a message of their own, and the base station any message, on the
   channel the radio is tuned to; canTakeOff in ../cb/lib.mjs decides whose a
   message is. Clearing the whole channel is the base station's alone. */
import { readPass, updateTuned, roomTag, roomAllows, canTakeOff, shape, json, body, sameSite, dropImages, droppedImages } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  const room = b.room == null ? null : roomTag(b.room);
  if (b.room != null && !room) return json(400, { error: 'That is not a room on the street.' });
  // Asked of the base too: a moderator who cannot hear a room's channel
  // cannot take anything off it either.
  if (!roomAllows(who, room)) return json(403, { error: 'This room\'s channel is for the moderators it is for.' });
  const clear = b.clear === true;
  if (clear && who.role !== 'base') return json(403, { error: 'Only the base station can clear the channel.' });
  if (!clear && (typeof b.remove !== 'string' || b.remove.length > 64)) return json(400, { error: 'Which message?' });
  try {
    let seen = [], said = 'off';
    const messages = await updateTuned(room, (list) => {
      seen = list.slice();
      if (clear) return [];
      const m = list.find((x) => x.id === b.remove);
      if (!m) { said = 'gone'; return null; }
      if (!canTakeOff(who, m)) { said = 'not yours'; return null; }
      said = 'off';
      return list.filter((x) => x.id !== b.remove);
    });
    if (said === 'gone') return json(404, { error: 'That message has gone off the air.', messages: shape(messages) });
    if (said === 'not yours') return json(403, { error: 'Only whoever sent a message, or the base station, can take it off.', messages: shape(messages) });
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
