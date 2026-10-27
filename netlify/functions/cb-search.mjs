/* The chat page's search, after Discord's (Ryan's ask, 2026-10-27): every
   channel the asker can hear, for words and filters. searchChannels() in
   ../cb/lib.mjs has the rules. A POST, so the words are in the body and never
   in an address; nothing is stored for it, and nothing records who searched
   for what. */
import { readPass, sharedPass, body, cleanSearch, searchChannels, json, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The CB only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return sharedPass(req) ? json(403, { error: 'claim your username first' }) : json(401, { error: 'signed off' });
  const q = cleanSearch(await body(req));
  if (!q) return json(400, { error: 'Search for some words, or choose a filter.' });
  return json(200, await searchChannels(who, q));
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/search',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
