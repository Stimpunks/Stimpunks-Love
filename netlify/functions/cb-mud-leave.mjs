/* The Slake: no longer being seen. Called when somebody switches it off, hides
   the tab or leaves the page; whatever is not called is shown to nobody thirty
   seconds later anyway. It only needs the visit, which nobody else is shown. */
import { readPass, mudVisit, leaveSlake, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The Slake only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  const visit = mudVisit(b.visit);
  if (!visit) return json(400, { error: 'That is not a visit.' });
  await leaveSlake(visit);
  return json(200, { gone: true });
};

export const config = {
  path: '/cb/mud/leave',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
