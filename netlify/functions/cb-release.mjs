/* Your own pets at Pekoe and Purrs and on the Run. GET ?kind=cat or dog with a
   pass lists your pets of that kind, each saying whether it is out and whether
   it is waiting at the gate; POST { kind, id, out: true } lets one of them out
   and { kind, id, out: false } calls it home. Only your own pets, found under
   your pet key, never named by the request. The room's list, which anybody
   reads through /cb/shelter, says a pet out has a home and never whose. */
import { releaseKind, ANIMAL_ID, readPass, petKey, letOut, callHome, releaseTray, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const pk = petKey(who.handle);
  if (req.method === 'POST') {
    const b = (await body(req)) || {};
    const kind = releaseKind(b.kind);
    if (!kind || typeof b.id !== 'string' || !ANIMAL_ID.test(b.id) || typeof b.out !== 'boolean') {
      return json(400, { error: 'Which pet, and out or home?' });
    }
    try {
      if (b.out) {
        const r = await letOut(kind, pk, b.id);
        if (r.why) return json(r.why === 'mine' ? 404 : 409, { why: r.why, pets: await releaseTray(kind, pk) });
      } else {
        await callHome(kind, pk, b.id);
      }
      return json(200, { pets: await releaseTray(kind, pk) });
    } catch (e) { return json(503, { error: 'That did not work just now. Nothing changed.' }); }
  }
  const kind = releaseKind(new URL(req.url).searchParams.get('kind'));
  if (!kind) return json(404, { error: 'There is nowhere to let that out.' });
  return json(200, { pets: await releaseTray(kind, pk) }, { 'x-robots-tag': 'noindex, nofollow, noarchive' });
};

export const config = {
  path: '/cb/release',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
