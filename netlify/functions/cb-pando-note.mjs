/* Pando Calrissian's fence: leaving a note on it. Only with a CB pass. The
   chalkboard's rules exactly: thirty notes, each gone seven days after it was
   written, and the thirty-first takes the oldest down. A note is the only
   place a name goes near the tree, and only because somebody wrote it. */
import { randomUUID } from 'node:crypto';
import { readPass, updateFence, cleanFence, shapeChalk, json, body, sameSite, PANDO_MAX } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This fence only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = await body(req);
  const text = cleanFence(b && b.text);
  if (!text) return json(400, { error: `A note is between one and ${PANDO_MAX} characters.` });
  try {
    const notes = await updateFence((list) => {
      list.push({ id: randomUUID(), handle: who.handle, text, t: Date.now(), base: who.role === 'base' });
      return list;
    });
    return json(200, { notes: shapeChalk(notes) });
  } catch (e) {
    return json(503, { error: 'Somebody else is at the fence. Try again in a moment.' });
  }
};

export const config = {
  path: '/cb/pando/note',
  method: 'POST',
  rateLimit: { windowLimit: 6, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
