/* The World room's index: every room with somebody seen in it, a call going, or
   a message on its channel today, for anybody signed on. Ryan, 2026-10-18. The
   rules are worldIndex()'s in ../cb/lib.mjs: names by whoSeen's rules, a call
   as on or off and never who, the latest message's time and never its words,
   and the most-active order without the numbers it was worked out from. Nothing
   is stored for it, and nothing records who asked. The World room asks while it
   is open and in front, every half minute. */
import { readPass, worldIndex, json, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The CB only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  // Whether 8x8 is telling us who is in calls at all, so no call is never a guess.
  const callHeard = !!process.env.CB_JAAS_EVENTS_SECRET;
  return json(200, { ...(await worldIndex(who)), callHeard, now: Date.now() });
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/world',
  method: 'GET',
  rateLimit: { windowLimit: 40, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
