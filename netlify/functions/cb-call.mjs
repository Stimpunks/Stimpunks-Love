/* The CB: a room's call. A signed-on radio asks for the call of the room it is
   on and gets back the address to frame, carrying a token for that handle and
   that room only. There are no guests (Ryan's call, 2026-11-01): no pass, no
   call. A conversation's call, { with: handle }, is for the two people in it
   only (dmCallFor). Nothing about the call is kept here. */
import { readPass, roomTag, roomAllows, callsReady, callToken, callSrc, dmReady, dmCallFor, notifyDmCall, forumReader, json, body, sameSite } from '../cb/lib.mjs';

export default async (req, context) => {
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  if (!callsReady()) return json(503, { error: 'Calls are not switched on yet.' });
  const b = await body(req);
  if (b && b.with !== undefined) {
    const who = await readPass(req);
    if (!who) return json(401, { error: 'signed off' });
    if (!forumReader(who)) return json(403, { error: 'A call with somebody is for claimed usernames, at both ends, as messages are.' });
    if (!dmReady()) return json(503, { error: 'Direct messages are shut just now, and so are their calls.' });
    const r = await dmCallFor(who, b.with);
    if (r.error === 'accepted') return json(409, { error: 'A call is for a conversation you have both accepted.' });
    if (r.error) return json(403, { error: 'That call is not one you can join.' });
    let token = null;
    try { token = callToken(who, r.tag, undefined, undefined, { dm: true }); } catch (e) { token = null; }
    if (!token) return json(503, { error: 'Calls are switched on but the signing key cannot be read. Tell the base.' });
    // Rings the other person's devices that asked to be rung (notifyDmCall), after the answer.
    const rung = notifyDmCall(r.handle, who.handle).catch(() => []);
    if (context && typeof context.waitUntil === 'function') context.waitUntil(rung); else await rung;
    return json(200, { room: r.tag, src: callSrc(r.tag, token) });
  }
  const room = roomTag(b && b.room);
  if (!room) return json(400, { error: 'That is not a room on the street.' });
  // Signed on to the CB: your handle, in any room you may go into.
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  if (!roomAllows(who, room)) return json(403, { error: 'This room\'s call is for the moderators it is for.' });
  let token = null;
  try { token = callToken(who, room); } catch (e) { token = null; }
  if (!token) return json(503, { error: 'Calls are switched on but the signing key cannot be read. Tell the base.' });
  return json(200, { room, src: callSrc(room, token) });
};

export const config = {
  path: '/cb/call',
  method: 'POST',
  // Tight, because each person in a call is a monthly user on our bill.
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
