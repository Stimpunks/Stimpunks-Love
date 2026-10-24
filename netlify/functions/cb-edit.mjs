/* The CB: editing a message of your own (Ryan, 2026-10-18). POST { id, text,
   room? } with a pass replaces that message's words on the channel the radio
   is tuned to, and marks it edited. Only whoever sent it: canEdit in
   ../cb/lib.mjs decides, and says why the base cannot edit anybody else's.
   The words it replaces are not kept anywhere. An edit tells only somebody it
   newly @mentions (notifyEdit), after the message is on the channel. A card
   whose link has gone goes with the edit, and a new link's card comes after
   it (unfurlMessage), as a new message's does. */
import { readPass, updateTuned, roomTag, roomAllows, editMessage, shape, json, body, sameSite, MESSAGE_MAX, notifyEdit, noteModCall, chatLinks, unfurlMessage } from '../cb/lib.mjs';

export default async (req, context) => {
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  const room = b.room == null ? null : roomTag(b.room);
  if (b.room != null && !room) return json(400, { error: 'That is not a room on the street.' });
  if (!roomAllows(who, room)) return json(403, { error: 'This room\'s channel is for the moderators it is for.' });
  if (typeof b.id !== 'string' || b.id.length > 64) return json(400, { error: 'Which message?' });
  if (b.text != null && typeof b.text !== 'string') return json(400, { error: 'A message is words.' });
  try {
    let got = null;
    const messages = await updateTuned(room, (list) => {
      got = editMessage(list, b.id, b.text, who, Date.now(), b.at);
      return got.list && !got.same ? got.list : null;
    });
    if (got.why === 'gone') return json(404, { error: 'That message has gone off the air.', messages: shape(messages) });
    if (got.why === 'not yours') return json(403, { error: 'Only whoever sent a message can edit it.', messages: shape(messages) });
    if (got.why === 'bad') return json(400, { error: `A message is between one and ${MESSAGE_MAX} characters.` });
    if (got.why === 'empty') return json(400, { error: 'A message needs some words, or a picture or a sticker. To take it off the air, use Take off instead.' });
    if (got.msg) {
      // An edit that newly calls the moderators, from a member, leaves a note on the desk (noteModCall).
      await noteModCall(who, got.msg, { room }, got.before).catch(() => null);
      const told = notifyEdit(got.msg, got.before, room).catch(() => []);
      if (context && typeof context.waitUntil === 'function') context.waitUntil(told); else await told;
      // A link new in the words gets its card after, as a new message's does.
      const had = got.msg.links || [];
      if (got.msg.text && chatLinks(got.msg.text).some((src) => !had.some((l) => l && l.src === src))) {
        const cards = unfurlMessage(room, got.msg.id, got.msg.text, had).catch(() => []);
        if (context && typeof context.waitUntil === 'function') context.waitUntil(cards); else await cards;
      }
    }
    return json(200, { messages: shape(messages), same: !!got.same });
  } catch (e) {
    return json(503, { error: 'The channel is busy. Try again in a moment.' });
  }
};

/* Netlify counts the presses per address and never tells us the address. */
export const config = {
  path: '/cb/edit',
  method: 'POST',
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
