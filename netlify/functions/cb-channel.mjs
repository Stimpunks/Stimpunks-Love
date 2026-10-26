/* The CB: listening. The radio asks this every few seconds while it is open on
   somebody's screen with the tab in front, and never otherwise. It hears the
   World channel, or a room's when it names one. The answer
   carries every host's beacon on the street, and the time here, so the radio
   can find the one for its own room without telling us which room that is,
   except a room that keeps to itself (QUIET_ROOMS in lib.mjs), whose host is
   heard only by a radio tuned to that room. A radio whose person was given a
   role or had one taken away at the desk is handed the pass they hold now
   (swap: readPass), which it keeps in place of the old one.

   IT SENDS THE LATEST WINDOW AND SAYS WHEN NOTHING HAS CHANGED (2026-10-25,
   when a channel's keep became the desk's to set, up to a thousand): ?n= asks
   for more than the latest WINDOW, in steps of WINDOW, which Earlier messages
   on the radio asks for; `older` says there is more before what was sent; and
   `v` is a hash of what would be sent, so a radio that sends back the `v` it
   has is told `same` and sent no messages. `rule` is how many messages this
   channel keeps and for how long, which the radio says under the channel. */
import { createHash } from 'node:crypto';
import { staffShut, readPass, sharedPass, readTuned, readBeacons, roomTag, roomAllows, rolesOf, mentionableRoles, shape, shapeRule, shapeBeacons, callsReady, WINDOW, json } from '../cb/lib.mjs';

export default async (req) => {
  const who = await readPass(req);
  if (!who) return sharedPass(req) ? json(403, { error: 'claim your username first' }) : json(401, { error: 'signed off' });
  // ?room=<tag> only while the radio is tuned to a room; World sends nothing.
  const q = new URL(req.url).searchParams;
  const asked = q.get('room');
  const room = asked === null ? null : roomTag(asked);
  if (asked !== null && !room) return json(400, { error: 'That is not a room on the street.' });
  const swap = who.swap ? { swap: who.swap } : {};
  if (!roomAllows(who, room)) return json(403, { error: 'This room\'s channel is for the moderators it is for.', roles: rolesOf(who), ...swap });
  // A staff room's channel is sealed with CB_STAFF_KEY (lib.mjs): without it, shut.
  if (staffShut(room)) return json(503, { error: 'This room\'s channel is shut just now. Nothing was read or sent.' });
  const [ch, beacons] = await Promise.all([readTuned(room), readBeacons()]);
  const n = Math.max(WINDOW, Math.min(ch.rule.keep, Math.ceil((Number(q.get('n')) || WINDOW) / WINDOW) * WINDOW));
  const messages = shape(ch.messages.slice(-n));
  const rule = shapeRule(ch.rule), older = ch.messages.length > n;
  const v = createHash('sha256').update(JSON.stringify([messages, rule, older])).digest('base64url').slice(0, 22);
  const said = q.get('v') === v ? { same: true } : { messages };
  return json(200, { room: room || null, ...said, v, older, rule, beacons: shapeBeacons(beacons, who, room), now: Date.now(), calls: callsReady(), roles: rolesOf(who), mention: mentionableRoles(who), ...swap });
};

export const config = {
  path: '/cb/channel',
  method: 'GET',
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
