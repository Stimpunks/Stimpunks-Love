/* Your avatar in a 3D room on Cel Street (Helen Edgar's ask, 2026-11-07).
   POST with a pass:
     { at: { room, spot } }   stand at that place in that room, or move there
     { at: null }             go: out on the street, or switched off
   Only a claimed username stands anywhere, because an unclaimed handle is
   anybody's who signs on with it. What is kept is which room and which of its
   places (an index, never a position), in cel-folk under the pet key, and
   nothing about when; each move replaces the last. It is shown only to people
   seen in the same room as its person (/cb/here), with the avatar they wear.
   The radio sends it; cel-street.js, which knows where you stand, sends
   nothing itself. privacy.html#cel-folk says so. */
import { readPass, petKey, roomAllows, cleanCelSpot, showCelFolk, json, body, sameSite } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  if (!('at' in b)) return json(400, { error: 'Stand somewhere, or go?' });
  try {
    if (b.at === null) {
      await showCelFolk(petKey(who.handle), null);
      return json(200, { at: null }, NOINDEX);
    }
    if (!who.account) return json(403, { error: 'Claim your username first: an unclaimed handle is anybody’s who signs on with it.' });
    const at = cleanCelSpot(b.at);
    if (!at) return json(400, { error: 'That is not a place in a room on the street.' });
    if (!roomAllows(who, at.room)) return json(403, { error: 'That room is for the people it is for.' });
    await showCelFolk(petKey(who.handle), at);
    return json(200, { at }, NOINDEX);
  } catch (e) {
    return json(503, { error: 'That did not work just now. Nothing changed; try again in a moment.' });
  }
};

export const config = {
  path: '/cb/cel',
  method: 'POST',
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
