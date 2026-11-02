/* The office: the way back from Threads and from Facebook (2026-11-02). A
   director pressed Connect on the Posts page and signed in there; the network
   sends them here with a code and the state the office gave them. metaCallback
   in ../cb/lib.mjs keeps the token sealed only if the state is the one kept,
   unused and fresh, and only for our own Threads account or our own Page. Then
   back to the Posts page, which says how it went. Nothing about the token is
   in any address or log. */
import { metaCallback } from '../cb/lib.mjs';

export default async (req) => {
  const url = new URL(req.url);
  const network = url.pathname.endsWith('/threads') ? 'threads' : 'facebook';
  let said = 'not-connected';
  try {
    const r = await metaCallback(network, url.searchParams, url.origin);
    // Only which step it stopped at goes in the address, never anything Meta sent.
    said = r.connected ? 'connected' : ['account', 'page', 'no-pages', 'no-pages-granted', 'pages-error', 'state', 'no-state', 'refused', 'code', 'long', 'not-set-up'].includes(r.error) ? r.error : 'not-connected';
  } catch (e) { said = 'not-connected'; }
  return new Response(null, { status: 303, headers: {
    location: '/office.html#/posts/meta/' + network + '/' + said,
    'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-robots-tag': 'noindex' } });
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: ['/cb/office/threads', '/cb/office/facebook'],
  method: 'GET',
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
