/* The CB: keying up. One message onto the channel the radio is tuned to, the
   World's or a room's; the eleventh pushes the oldest off, and takes its
   picture with it. A message may be words, a picture sent first to
   /cb/image, or both. */
import { randomUUID } from 'node:crypto';
import { readPass, updateTuned, roomTag, roomAllows, cleanText, cleanAlt, shape, json, body, sameSite, TEXT_MAX,
  imageId, getImage, dropImages, droppedImages } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  const who = readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = await body(req);
  if (!b) return json(400, { error: 'There was nothing in that.' });
  const room = b.room == null ? null : roomTag(b.room);
  if (b.room != null && !room) return json(400, { error: 'That is not a room on the street.' });
  if (!roomAllows(who, room)) return json(403, { error: 'This room\'s channel is for the moderators it is for.' });
  // A picture must be one this handle sent, for this channel, a moment ago.
  let img = null;
  if (b.img != null) {
    img = imageId(b.img);
    const got = img && await getImage(img);
    if (!got || got.meta.handle !== who.handle || (got.meta.room || '') !== (room || '')) {
      return json(400, { error: 'That picture is not ready to send. Pick it again.' });
    }
  }
  const text = b.text == null || b.text === '' ? '' : cleanText(b.text);
  if (text === null || (!text && !img)) return json(400, { error: `A message is between one and ${TEXT_MAX} characters, or a picture.` });
  const msg = { id: randomUUID(), handle: who.handle, text, t: Date.now(), base: who.role === 'base' };
  if (img) { msg.img = img; msg.alt = cleanAlt(b.alt); }
  try {
    let seen = [];
    const messages = await updateTuned(room, (list) => {
      list.push(msg);
      seen = list.slice();
      return list;
    });
    await dropImages(droppedImages(seen, messages));
    return json(200, { messages: shape(messages) });
  } catch (e) {
    return json(503, { error: 'The channel is busy. Try again in a moment.' });
  }
};

export const config = {
  path: '/cb/transmit',
  method: 'POST',
  rateLimit: { windowLimit: 12, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
