/* The CB: the base station taking something off the air before midnight.
   Only a pass issued for the moderators' password can do this. */
import { readPass, updateChannel, shape, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  const who = readPass(req);
  if (!who || who.role !== 'base') return json(403, { error: 'Only the base station can do that.' });
  const b = (await body(req)) || {};
  try {
    const messages = await updateChannel((list) => {
      if (b.clear === true) return [];
      if (typeof b.remove === 'string') return list.filter((m) => m.id !== b.remove);
      return null;
    });
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
