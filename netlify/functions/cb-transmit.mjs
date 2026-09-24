/* The CB: keying up. One message onto the channel; the eleventh pushes the
   oldest off. */
import { randomUUID } from 'node:crypto';
import { readPass, updateChannel, cleanText, shape, json, body, sameSite, TEXT_MAX } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  const who = readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = await body(req);
  const text = cleanText(b && b.text);
  if (!text) return json(400, { error: `A message is between one and ${TEXT_MAX} characters.` });
  try {
    const messages = await updateChannel((list) => {
      list.push({ id: randomUUID(), handle: who.handle, text, t: Date.now(), base: who.role === 'base' });
      return list;
    });
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
