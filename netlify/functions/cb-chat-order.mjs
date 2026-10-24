/* The chat page's orders by activity (Ryan's ask, 2026-10-24): every room's
   channel the asker can hear, newest message first and most messages first,
   as orders and never as times or counts. channelActivity() in ../cb/lib.mjs
   has the rules. The chat page asks when it opens with one of those orders
   chosen, when somebody chooses one, and when they press Sort again; never as
   messages come in, so nothing moves under anybody's pointer. Nothing is
   stored for it, and nothing records who asked. */
import { readPass, channelActivity, json, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The CB only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  return json(200, await channelActivity(who));
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/chat-order',
  method: 'GET',
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
