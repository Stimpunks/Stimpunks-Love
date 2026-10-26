/* Notifications on the CB (Ryan, 2026-10-18): POST /cb/push with a pass.
     { key: true }                  the street's public key, which the browser
                                    needs to subscribe, or null when
                                    notifications are not set up
     { device: sub, want }          switches this device's notifications on,
                                    or changes what it asked for
     { read: endpoint }             what this device asked for, if it is yours
     { test: endpoint }             one notification to this device, to see
     { drop: endpoint }             switches this device's off
   A device is kept as its push address, the two keys its browser made, the
   handle it was switched on as, which kind of pass and a hash of the pass,
   and what it asked for; privacy.html#notifications says so. Nothing sent to
   it is kept or logged. FORGET ME, in /cb/pets, and deleting the username
   switch off every device switched on as that handle. */
import { staffReady, readPass, keepDevice, readDevice, dropDevice, cleanSubscription, pushPublicKey, sendPush,
  PUSH_ROOMS_MAX, PUSH_PER_HANDLE, json, body, sameSite } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  // Sealed at rest with CB_STAFF_KEY (lib.mjs): without it, shut rather than written in the clear.
  if (!staffReady()) return json(503, { error: 'Notifications are shut just now. Nothing was changed.' });
  if (!sameSite(req)) return json(403, { error: 'The CB only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const pass = (req.headers.get('authorization') || '').replace(/^Bearer /, '');
  const b = (await body(req)) || {};
  try {
    if (b.key === true) return json(200, { key: pushPublicKey() }, NOINDEX);
    if (!pushPublicKey()) return json(503, { error: 'Notifications are not set up on the street yet.' });
    if (b.device !== undefined) {
      const r = await keepDevice(b.device, pass, b.want);
      if (r.error === 'address') return json(400, { error: 'This browser’s push service is not one the street sends to.' });
      if (r.error === 'rooms') return json(400, { error: `A device can follow at most ${PUSH_ROOMS_MAX} rooms.` });
      if (r.error === 'many') return json(409, { error: `${who.handle} has notifications on ${PUSH_PER_HANDLE} devices already. Switch one off there first.` });
      if (r.error) return json(503, { error: 'Notifications cannot take another device just now.' });
      return json(200, { want: r.want }, NOINDEX);
    }
    if (typeof b.read === 'string') return json(200, { want: await readDevice(b.read, who.handle) }, NOINDEX);
    if (typeof b.drop === 'string') { await dropDevice(b.drop); return json(200, { want: null }, NOINDEX); }
    if (b.test !== undefined) {
      const sub = cleanSubscription(b.test);
      if (!sub || !(await readDevice(sub.endpoint, who.handle))) return json(404, { error: 'Notifications are not on for this device.' });
      // The push service's answer goes back as a number, so a test that
      // fails says where: 0 is no answer at all.
      const status = await sendPush(sub, { kind: 'test' }, { ttl: 300 });
      return json(200, { sent: status >= 200 && status < 300, status }, NOINDEX);
    }
  } catch (e) {
    return json(503, { error: 'That did not work just now. Nothing changed; try again in a moment.' });
  }
  return json(400, { error: 'Switch on, change, test or switch off what?' });
};

export const config = {
  path: '/cb/push',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
