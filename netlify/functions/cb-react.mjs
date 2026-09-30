/* The CB: a reaction on a message. POST { id, emoji, room? } with a pass
   presses that reaction on that message as you, or takes yours back if it was
   there. It is part of the message and goes with it. See ../cb/lib.mjs for why
   a reaction names who and never says how many. */
import { readPass, updateTuned, roomTag, roomAllows, reactionOf, toggleReaction, shape, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  const room = b.room == null ? null : roomTag(b.room);
  if (b.room != null && !room) return json(400, { error: 'That is not a room on the street.' });
  if (!roomAllows(who, room)) return json(403, { error: 'This room\'s channel is for the moderators it is for.' });
  if (typeof b.id !== 'string' || b.id.length > 64) return json(400, { error: 'Which message?' });
  if (!reactionOf(b.emoji)) return json(400, { error: 'That is not one of the reactions.' });
  try {
    let found = true;
    const messages = await updateTuned(room, (list) => {
      const next = toggleReaction(list, b.id, b.emoji, who.handle);
      if (!next) { found = false; return null; }
      return next;
    });
    if (!found) return json(404, { error: 'That message has gone off the air.', messages: shape(messages) });
    return json(200, { messages: shape(messages) });
  } catch (e) {
    return json(503, { error: 'The channel is busy. Try again in a moment.' });
  }
};

/* Netlify counts the presses per address and never tells us the address. */
export const config = {
  path: '/cb/react',
  method: 'POST',
  rateLimit: { windowLimit: 40, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
