/* The Slake: the base station taking something said in a place off the air
   before midnight. Only a pass issued for the moderators' password. */
import { readPass, mudPlace, updateTalk, shape, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The Slake only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who || who.role !== 'base') return json(403, { error: 'Only the base station can do that.' });
  const b = (await body(req)) || {};
  const place = mudPlace(b.place);
  if (!place) return json(400, { error: 'That is not a place on the Slake.' });
  try {
    const messages = await updateTalk(place, (list) => {
      if (b.clear === true) return [];
      if (typeof b.remove === 'string') return list.filter((m) => m.id !== b.remove);
      return null;
    });
    return json(200, { place, messages: shape(messages) });
  } catch (e) {
    return json(503, { error: 'That place is busy. Try again in a moment.' });
  }
};

export const config = {
  path: '/cb/mud/moderate',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
