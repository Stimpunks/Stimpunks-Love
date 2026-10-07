/* Be seen in a room, and see who else is, and who is in its call. The radio
   asks this on its own listen, and only while somebody signed on has pressed
   Be seen here, the radio is open and the tab is in front. One call does both
   halves, because they are one act: being seen is what lets you see. A room
   the base keeps answers only the passes it lets in. Being seen also puts you
   on Who's online, for anybody signed on (whoSeen in lib.mjs). */
import { readPass, roomTag, roomAllows, mudVisit, beSeen, inCall, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The CB only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  const room = roomTag(b.room);
  const visit = mudVisit(b.visit);
  if (!room || !visit) return json(400, { error: 'That is not a room on the street.' });
  if (!roomAllows(who, room)) return json(403, { error: 'That room is for the people it is for.' });
  const others = await beSeen(who, room, visit);
  const call = await inCall(room);
  // callHeard: whether 8x8 is telling us at all, so an empty call is never a guess.
  return json(200, { room, others, call, callHeard: !!process.env.CB_JAAS_EVENTS_SECRET });
};

export const config = {
  path: '/cb/here',
  method: 'POST',
  rateLimit: { windowLimit: 40, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
