/* The CB: listening. The radio asks this every few seconds while it is open on
   somebody's screen with the tab in front, and never otherwise. The answer
   carries every host's beacon on the street, and the time here, so the radio
   can find the one for its own room without telling us which room that is. */
import { readPass, readChannel, readBeacons, shape, shapeBeacons, json } from '../cb/lib.mjs';

export default async (req) => {
  const who = readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const [ch, beacons] = await Promise.all([readChannel(), readBeacons()]);
  return json(200, { day: ch.day, messages: shape(ch.messages), beacons: shapeBeacons(beacons), now: Date.now() });
};

export const config = {
  path: '/cb/channel',
  method: 'GET',
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
