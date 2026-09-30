/* The CB: a room's call. A signed-on radio asks for the call of the room it is
   on and gets back the address to frame, carrying a token for that handle and
   that room only; a guest with no pass can ask for one of the public calls
   only, under a name they typed. Nothing about the call is kept here. */
import { readPass, roomTag, roomAllows, publicCall, cleanHandle, callsReady, callToken, callSrc, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  if (!callsReady()) return json(503, { error: 'Calls are not switched on yet.' });
  const b = await body(req);
  const room = roomTag(b && b.room);
  if (!room) return json(400, { error: 'That is not a room on the street.' });
  // Signed on to the CB: your handle, anywhere. Not signed on: a public call
  // only, as a guest, under the name you typed, which is not kept.
  let who = await readPass(req);
  if (!who) {
    if (!publicCall(room)) return json(401, { error: 'signed off' });
    const name = cleanHandle(b && b.name);
    if (!name) return json(400, { error: 'Type the name you want to appear under, up to 24 characters.' });
    who = { role: 'guest', handle: name };
  }
  if (!roomAllows(who, room)) return json(403, { error: 'This room\'s call is for the moderators it is for.' });
  let token = null;
  try { token = callToken(who, room); } catch (e) { token = null; }
  if (!token) return json(503, { error: 'Calls are switched on but the signing key cannot be read. Tell the base.' });
  return json(200, { room, src: callSrc(room, token) });
};

export const config = {
  path: '/cb/call',
  method: 'POST',
  // Tight, because a guest token needs no pass and each new guest who is let
  // in is a monthly user on our bill.
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
