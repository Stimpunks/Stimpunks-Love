/* The CB: listening. The radio asks this every few seconds while it is open on
   somebody's screen with the tab in front, and never otherwise. It hears the
   World channel, or a room's when it names one. The answer
   carries every host's beacon on the street, and the time here, so the radio
   can find the one for its own room without telling us which room that is. */
import { readPass, readTuned, readBeacons, roomTag, roomAllows, rolesOf, shape, shapeBeacons, callsReady, json } from '../cb/lib.mjs';

export default async (req) => {
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  // ?room=<tag> only while the radio is tuned to a room; World sends nothing.
  const asked = new URL(req.url).searchParams.get('room');
  const room = asked === null ? null : roomTag(asked);
  if (asked !== null && !room) return json(400, { error: 'That is not a room on the street.' });
  if (!roomAllows(who, room)) return json(403, { error: 'This room\'s channel is for the moderators it is for.', roles: rolesOf(who) });
  const [ch, beacons] = await Promise.all([readTuned(room), readBeacons()]);
  return json(200, { day: ch.day, room: room || null, messages: shape(ch.messages), beacons: shapeBeacons(beacons, who), now: Date.now(), calls: callsReady(), roles: rolesOf(who) });
};

export const config = {
  path: '/cb/channel',
  method: 'GET',
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
