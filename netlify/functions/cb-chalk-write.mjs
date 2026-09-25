/* The chalkboard: writing on it. Only with a CB pass, which is what keeps the
   board to people who have the password. The thirty-first note rubs out the
   oldest; each one is rubbed out anyway seven days after it went up. */
import { randomUUID } from 'node:crypto';
import { readPass, updateChalk, cleanChalk, shapeChalk, json, body, sameSite, CHALK_MAX } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This board only answers stimpunks.world.' });
  const who = readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = await body(req);
  const text = cleanChalk(b && b.text);
  if (!text) return json(400, { error: `A note is between one and ${CHALK_MAX} characters.` });
  try {
    const notes = await updateChalk((list) => {
      list.push({ id: randomUUID(), handle: who.handle, text, t: Date.now(), base: who.role === 'base' });
      return list;
    });
    return json(200, { notes: shapeChalk(notes) });
  } catch (e) {
    return json(503, { error: 'Somebody else has the chalk. Try again in a moment.' });
  }
};

export const config = {
  path: '/cb/chalk/write',
  method: 'POST',
  rateLimit: { windowLimit: 6, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
