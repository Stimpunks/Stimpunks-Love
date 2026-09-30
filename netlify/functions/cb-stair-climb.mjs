/* Count Me In: taking a step, by number or by the lift. Only with a CB pass.
   The pass is checked, and all that is kept of whoever holds it is the
   fridge's scrambled mark saying the last step was theirs, replaced by the
   next. { n: 12 } puts a number; { lift: true } rides the lift up one, which
   the server works out, so it can never be the wrong number. A wrong number
   sends the stair back to one, and the answer names nobody, because nothing
   here knows anybody's name. */
import { readPass, cleanStep, climb, fridgeMark, json, body, sameSite, STAIR_MAX } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This stair only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  const n = b.lift === true ? 'lift' : cleanStep(b.n);
  if (n === null) return json(400, { error: `A step is a whole number from 1 to ${STAIR_MAX}, in figures.` });
  try {
    const r = await climb(n, fridgeMark(who.handle));
    const out = { step: r.step, best: r.best, fell: r.fell || null };
    if (r.took) return json(200, { ...out, took: true });
    if (r.why === 'wrong') return json(200, { ...out, took: false, wrong: true, wanted: r.wanted });
    if (r.why === 'beaten') return json(409, { ...out, error: `That step is already taken: the stair is on ${r.step} now. Yours does not send anybody back.` });
    return json(409, { ...out, error: 'The last step was yours, so the next one is somebody else’s. The lift waits for them too.' });
  } catch (e) {
    return json(503, { error: 'Somebody else is on that step. Try again in a moment.' });
  }
};

export const config = {
  path: '/cb/stair/climb',
  method: 'POST',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
