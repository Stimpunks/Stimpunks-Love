/* The Brass Tacks Board's own feed, /brass-tacks.xml: every post as RSS, built
   from the same nodes the board is, every word escaped. Ryan's call,
   2026-09-30: posts reach feed readers the way the changelog does. */
import { readBrass, brassFeed } from '../cb/lib.mjs';

export default async () => new Response(brassFeed(await readBrass()), {
  status: 200,
  headers: { 'content-type': 'application/rss+xml; charset=utf-8', 'cache-control': 'public, max-age=300', 'x-content-type-options': 'nosniff' },
});

export const config = {
  path: '/brass-tacks.xml',
  method: 'GET',
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
