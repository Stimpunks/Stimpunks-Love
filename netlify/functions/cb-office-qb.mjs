/* The office: the way back from Intuit (Ryan, 2026-10-21). A director or an
   administrator pressed Connect QuickBooks, signed in at Intuit and chose our
   company; Intuit sends them here with a code, the state the office gave them
   and the company's id. qbCallback in ../cb/lib.mjs keeps the tokens sealed
   only if the state is the one kept, unused and fresh, and the books are read
   at once so the dashboard has them. Then back to the office, which says
   whether it worked. Netlify adds the request's query to this address, so
   the office page arrives with Intuit's code (used by then) after a ?, and
   office.js takes it straight back out of the address and its history
   entry. Nothing about the books or the tokens is in any address or log. */
import { qbCallback, officeQuickBooks } from '../cb/lib.mjs';

export default async (req) => {
  const url = new URL(req.url);
  let ok = false;
  try {
    const r = await qbCallback(url.searchParams, url.origin);
    ok = !!r.connected;
    if (ok) await officeQuickBooks().catch(() => null);
  } catch (e) { ok = false; }
  return new Response(null, { status: 303, headers: {
    location: '/office.html#/dashboard/quickbooks/' + (ok ? 'connected' : 'not-connected'),
    'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-robots-tag': 'noindex' } });
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/office/quickbooks',
  method: 'GET',
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
