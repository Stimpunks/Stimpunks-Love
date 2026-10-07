/* Who's online: everybody seen in a room, with the rooms they are in. Ryan,
   2026-10-07. For anybody signed on, seen or not; names only, alphabetical,
   no number, a room the asker may not enter left out, and a room that keeps to
   itself (QUIET_ROOMS) never on it. The rules are in
   whoSeen() in lib.mjs. The radio asks while its Who's online panel is open,
   and its teleporter asks when an @ is typed; nothing records who asked. */
import { readPass, whoSeen, json, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The CB only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  return json(200, { people: await whoSeen(who) });
};

export const config = {
  path: '/cb/online',
  method: 'GET',
  rateLimit: { windowLimit: 40, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
