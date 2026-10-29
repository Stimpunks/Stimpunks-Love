/* Who's online: everybody seen in a room, with the rooms they are in. Ryan,
   2026-10-07. For anybody signed on, seen or not; names only, alphabetical,
   no number, a room the asker may not enter left out, and a room that keeps to
   itself (QUIET_ROOMS) never on it. The rules are in
   whoSeen() in lib.mjs. The radio asks while its Who's online panel is open,
   and its teleporter asks when an @ is typed; nothing records who asked.

   And every room whose call has somebody in it (Ryan, 2026-10-13): the rooms
   only, by callsOn()'s rules, which are whoSeen's. callHeard says whether 8x8
   is telling us at all, so an empty list of calls is never a guess.

   And the avatar each claimed person wears on the CB (Ryan, 2026-10-14), out
   of one blob, beside a claimed name only, by withAvatars()'s rules, and the
   nameplate each chose on their profile (2026-10-17), the same way, by
   withPlates()'s, and the chat status each chose (2026-10-24), by
   withChatStatus()'s, and the availability each chose (2026-10-29), by
   withAvailability()'s. */
import { readPass, whoSeen, withAvatars, withPlates, withChatStatus, withAvailability, callsOn, json, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The CB only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const heard = !!process.env.CB_JAAS_EVENTS_SECRET;
  return json(200, { people: await withAvailability(await withChatStatus(await withPlates(await withAvatars(await whoSeen(who))))), calls: heard ? await callsOn(who) : [], callHeard: heard });
};

export const config = {
  path: '/cb/online',
  method: 'GET',
  rateLimit: { windowLimit: 40, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
