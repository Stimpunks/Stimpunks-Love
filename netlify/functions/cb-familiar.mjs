/* Bringing your familiar into the rooms you are seen in (Ryan, 2026-10-19:
   let other people see what chimeras are in the room). GET with a pass says
   whether yours is out. POST with a pass:
     { out: { parts, name, sayings } }   brings it out, or changes it
     { out: null }                       takes it in
   Only a claimed username brings one out, because an unclaimed handle is
   anybody's who signs on with it. What is kept is its parts, its name and its
   sayings, in familiars-out under the pet key, and nothing about when; it is
   shown only to people seen in the same room as its person (/cb/here), and
   Forget me, deleting the username and this, with null, take it out. The
   radio sends it; familiar.js, which keeps it in the browser, sends nothing. */
import { readPass, petKey, cleanFamiliar, showFamiliar, familiarOut, json, body, sameSite } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  if (req.method !== 'POST') return json(200, { out: !!who.account && await familiarOut(who.handle), claimed: !!who.account }, NOINDEX);
  const b = (await body(req)) || {};
  if (!('out' in b)) return json(400, { error: 'Bring it out or take it in?' });
  try {
    if (b.out === null) {
      await showFamiliar(petKey(who.handle), null);
      return json(200, { out: false, claimed: !!who.account }, NOINDEX);
    }
    if (!who.account) return json(403, { error: 'Claim your username first: an unclaimed handle is anybody\u2019s who signs on with it, so it cannot bring a familiar out on anybody\u2019s behalf.' });
    const f = cleanFamiliar(b.out);
    if (!f) return json(400, { error: 'That familiar has a part, a name or a saying in it the street does not take.' });
    await showFamiliar(petKey(who.handle), f);
    return json(200, { out: true, claimed: true }, NOINDEX);
  } catch (e) {
    return json(503, { error: 'That did not work just now. Nothing changed; try again in a moment.' });
  }
};

export const config = {
  path: '/cb/familiar',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
