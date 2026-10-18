/* JaaS's participant webhook: 8x8 tells us who joins and leaves each call, and
   when a call opens and closes, so a radio seen in a room can say who is in
   its call before anybody joins. Registered in the JaaS console under Webhooks
   for PARTICIPANT_JOINED, PARTICIPANT_LEFT, ROOM_CREATED and ROOM_DESTROYED;
   its secret, whsec_ and all, is CB_JAAS_EVENTS_SECRET in Netlify. Without the
   secret, or without a good X-Jaas-Signature, nothing is believed. Nothing is
   logged: an event names somebody, and names are not written into any log.
   A call that starts tells the devices that asked (Ryan, 2026-10-18,
   notifyCall in lib.mjs): that it has started, and never who joined. */
import { jaasSigned, callEvent, callEventRoom, notifyCall, json } from '../cb/lib.mjs';

export default async (req, context) => {
  const secret = process.env.CB_JAAS_EVENTS_SECRET;
  if (!secret) return json(503, { error: 'not set up' });
  const raw = await req.text();
  if (!jaasSigned(req.headers.get('x-jaas-signature'), raw, secret)) return json(401, { error: 'no' });
  let ev;
  try { ev = JSON.parse(raw); } catch (e) { return json(400, { error: 'not json' }); }
  if ((await callEvent(ev)) === 'started') {
    const told = notifyCall(callEventRoom(ev.fqn)).catch(() => []);
    if (context && typeof context.waitUntil === 'function') context.waitUntil(told); else await told;
  }
  return json(200, { ok: true });
};

export const config = {
  path: '/cb/call-events',
  method: 'POST',
  rateLimit: { windowLimit: 600, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
