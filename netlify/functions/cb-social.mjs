/* Stimpunks Social's newest posts, for /social before the morning fold
   (2026-11-02). Public: the words, the time and the id of each post the
   office put there, and nothing about who pressed. GET only. See
   ../cb/lib.mjs, social posts. */
import { socialPublic, json } from '../cb/lib.mjs';

export default async (req) => {
  if (req.method !== 'GET') return json(405, { error: 'GET only.' });
  const posts = await socialPublic();
  return json(200, { posts }, { 'x-robots-tag': 'noindex', 'cache-control': 'no-store' });
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/social',
  method: ['GET'],
  rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
