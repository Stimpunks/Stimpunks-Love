/* Count Me In: reading the stair. Anybody can, with no pass, because a
   stairwell's numbers are painted on its walls. The answer is the step we are
   on, the highest step the stair has reached, and where it last went back to
   one, and nothing about who took any step. Search engines are asked not to
   keep it. */
import { readStair, json } from '../cb/lib.mjs';

export default async () => {
  const st = await readStair();
  return json(200, { step: st.step, best: st.best, fell: st.fell }, { 'x-robots-tag': 'noindex, nofollow, noarchive' });
};

export const config = {
  path: '/cb/stair',
  method: 'GET',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
