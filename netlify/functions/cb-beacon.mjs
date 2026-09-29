/* The CB: a host's beacon. Somebody hosting the film in a room says where it
   has got to, or stops. The radio sends this from inside its own listen, so it
   only ever goes while the radio is open and the tab is in front. */
import { readPass, hostBeacon, stopBeacon, shapeBeacons, beaconRoom, cleanFilm, cleanAt, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  const who = readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = await body(req);
  const room = beaconRoom(b && b.room);
  if (!room) return json(400, { error: 'That is not a room on the street.' });
  try {
    if (b.off) return json(200, { beacons: shapeBeacons(await stopBeacon(who, room), who), now: Date.now() });
    const film = cleanFilm(b.film), at = cleanAt(b.at);
    if (!film || at === null) return json(400, { error: 'A beacon needs the film and a place in it.' });
    const r = await hostBeacon(who, room, film, at, !!b.playing);
    if (r.closed) return json(403, { error: 'Hosting in this room is for the moderators it is for.' });
    if (r.held) return json(409, { error: `${r.held} is already hosting this room. Ask them, or the base, if you want to take over.` });
    return json(200, { beacons: shapeBeacons(r.beacons, who), now: Date.now() });
  } catch (e) {
    return json(503, { error: 'The channel is busy. Try again in a moment.' });
  }
};

export const config = {
  path: '/cb/beacon',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
