/* My own order for the chat page's channels (Ryan's call, 2026-10-24): kept
   under the claimed username so it follows somebody across devices. GET asks
   for it; POST keeps the whole of it, { groups: { <group>: [<tag>, ...] } }.
   readChatOrder and keepChatOrder in ../cb/lib.mjs have the rules: which
   channels, in which order, under which group, and nothing about when; never
   a room that keeps to itself; shown to nobody else. privacy.html#chat-order
   says so. */
import { readPass, readChatOrder, keepChatOrder, forumReader, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The CB only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  if (!forumReader(who)) return json(403, { error: 'Your own order is kept for a claimed username.' });
  if (req.method === 'GET') return json(200, { groups: await readChatOrder(who) });
  const b = await body(req);
  if (!b || typeof b !== 'object') return json(400, { error: 'That order could not be read.' });
  return json(200, await keepChatOrder(who, b.groups));
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/chat-arrange',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
