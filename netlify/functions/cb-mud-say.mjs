/* The Slake: saying something in the place you are, to whoever else is seen
   there. The place's own channel, on the radio's rules: ten messages, gone at
   midnight in Colorado. Only a visit that is seen at that place may speak. */
import { randomUUID } from 'node:crypto';
import { readPass, mudPlace, mudVisit, seenAt, updateTalk, cleanText, shape, json, body, sameSite, TEXT_MAX }
  from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The Slake only answers stimpunks.world.' });
  const who = readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  const place = mudPlace(b.place);
  const visit = mudVisit(b.visit);
  if (!place || !visit) return json(400, { error: 'That is not a place on the Slake.' });
  const text = cleanText(b.text);
  if (!text) return json(400, { error: `Something to say is between one and ${TEXT_MAX} characters.` });
  if (!(await seenAt(place, visit))) {
    return json(409, { error: 'Nobody can hear you there unless you are seen there. Choose to be seen, then say it again.' });
  }
  try {
    const messages = await updateTalk(place, (list) => {
      list.push({ id: randomUUID(), handle: who.handle, text, t: Date.now(), base: who.role === 'base' });
      return list;
    });
    return json(200, { place, messages: shape(messages) });
  } catch (e) {
    return json(503, { error: 'Too many people are talking at once. Say it again in a moment.' });
  }
};

export const config = {
  path: '/cb/mud/say',
  method: 'POST',
  rateLimit: { windowLimit: 12, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
