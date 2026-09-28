/* The CB: a room's call. A signed-on radio asks for the call of the room it is
   on and gets back the address to frame, carrying a token for that handle and
   that room only. Nothing about the call is kept here. */
import { readPass, roomTag, callsReady, callToken, callSrc, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  const who = readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  if (!callsReady()) return json(503, { error: 'Calls are not switched on yet.' });
  const b = await body(req);
  const room = roomTag(b && b.room);
  if (!room) return json(400, { error: 'That is not a room on the street.' });
  return json(200, { room, src: callSrc(room, callToken(who, room)) });
};

export const config = {
  path: '/cb/call',
  method: 'POST',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
