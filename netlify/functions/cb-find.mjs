/* Find somebody by name: which rooms a claimed username is findable in now.
   Helen Edgar's ask, 2026-10-07, under Ryan's rules the same day, all of them
   in findSeen() in lib.mjs: only somebody seen and findable can ask, only a
   claimed username can be found, one exact name and never a list, and a room
   the asker may not enter is left out. A POST, so the name is never in an
   address, and nothing records who looked for whom. */
import { readPass, mudVisit, findSeen, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The CB only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  const visit = mudVisit(b.visit);
  if (!visit || typeof b.name !== 'string') return json(400, { error: 'Type a name after the @.' });
  const r = await findSeen(who, visit, b.name);
  if (r.refused) return json(403, { error: r.refused });
  return json(200, r);
};

export const config = {
  path: '/cb/find',
  method: 'POST',
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
