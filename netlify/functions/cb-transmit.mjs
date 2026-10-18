/* The CB: keying up. One message onto the channel the radio is tuned to, the
   World's or a room's; the fifty-first pushes the oldest off, and takes
   its picture with it. A message may be words, a picture sent first to
   /cb/image, or both; or a sticker of one of the sender's own pets, own
   avatars, own chimeras or own patches, or of the sender's own battle jacket, with words
   or without. And it tells the devices that asked to hear it (Ryan,
   2026-10-18, notifyMessage in lib.mjs), after the message is on the
   channel, so a slow push service never holds the radio up. */
import { randomUUID } from 'node:crypto';
import { readPass, updateTuned, roomTag, roomAllows, cleanMessage, cleanAlt, shape, json, body, sameSite, MESSAGE_MAX,
  imageId, getImage, dropImages, droppedImages, stickerOf, avatarSticker, chimeraSticker, patchSticker, jacketSticker, notifyMessage } from '../cb/lib.mjs';

export default async (req, context) => {
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  const who = await readPass(req);
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
  // A sticker is one of this handle's own pets, found here, never described
  // by the request.
  let sticker = null;
  if (b.sticker != null) {
    if (img) return json(400, { error: 'A message is a picture or a sticker, not both.' });
    sticker = await stickerOf(who.handle, b.sticker);
    if (!sticker) return json(400, { error: 'That is not one of your pets.' });
  }
  // An avatar sticker is one of this handle's own avatars, found the same way.
  let avatar = null;
  if (b.avatar != null) {
    if (img || sticker) return json(400, { error: 'A message is one picture or one sticker, not two.' });
    avatar = await avatarSticker(who.handle, b.avatar);
    if (!avatar) return json(400, { error: 'That is not one of your avatars.' });
  }
  // A chimera sticker is one of this handle's own chimeras, found the same way.
  let chimera = null;
  if (b.chimera != null) {
    if (img || sticker || avatar) return json(400, { error: 'A message is one picture or one sticker, not two.' });
    chimera = await chimeraSticker(who.handle, b.chimera);
    if (!chimera) return json(400, { error: 'That is not one of your chimeras.' });
  }
  // A patch sticker is one of this handle's own patches, found the same way.
  let patch = null;
  if (b.patch != null) {
    if (img || sticker || avatar || chimera) return json(400, { error: 'A message is one picture or one sticker, not two.' });
    patch = await patchSticker(who.handle, b.patch);
    if (!patch) return json(400, { error: 'That patch is not on your battle jacket.' });
  }
  // A jacket sticker is this handle's own battle jacket, as it is now.
  let jacket = null;
  if (b.jacket != null) {
    if (img || sticker || avatar || chimera || patch) return json(400, { error: 'A message is one picture or one sticker, not two.' });
    jacket = await jacketSticker(who.handle);
    if (!jacket) return json(400, { error: 'Nothing is sewn on your battle jacket yet.' });
  }
  const text = b.text == null || b.text === '' ? '' : cleanMessage(b.text);
  if (text === null || (!text && !img && !sticker && !avatar && !chimera && !patch && !jacket)) return json(400, { error: `A message is between one and ${MESSAGE_MAX} characters, or a picture, or a sticker.` });
  // CLAIMED is read off the pass, like BASE, and never off the request: a
  // message says it came from a claimed username only because readPass found
  // that username's own account behind the pass that sent it.
  const msg = { id: randomUUID(), handle: who.handle, text, t: Date.now(), base: who.role === 'base', claimed: !!who.account };
  if (img) { msg.img = img; msg.alt = cleanAlt(b.alt); }
  if (sticker) msg.sticker = sticker;
  if (avatar) msg.avatar = avatar;
  if (chimera) msg.chimera = chimera;
  if (patch) msg.patch = patch;
  if (jacket) msg.jacket = jacket;
  try {
    let seen = [];
    const messages = await updateTuned(room, (list) => {
      list.push(msg);
      seen = list.slice();
      return list;
    });
    await dropImages(droppedImages(seen, messages));
    const told = notifyMessage(msg, room).catch(() => []);
    if (context && typeof context.waitUntil === 'function') context.waitUntil(told); else await told;
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
