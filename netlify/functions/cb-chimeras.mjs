/* Your chimeras, for the CB's Profile and Chimera Obscura. GET with a pass
   lists them. POST with a pass:
     { keep: parts, name, sayings? }  keeps a new one
     { edit: id, parts?, name?, sayings? }  changes one
     { remove: id }                   deletes one
     { show: true | false }           shows them in your profile on the CB,
                                      or not, and only a claimed username can
   A chimera is only ever a list of choices, checked by cleanChimera() against
   the keys tools/make-chimera-obscura.py writes into lib.mjs; nothing a
   picture could be is ever taken, and nothing about when. A handle is not an
   account, so whoever signs on with an unclaimed one has these chimeras;
   Profile says so. FORGET ME is /cb/pets, which deletes these too. */
import { readPass, petKey, readChimeras, keepChimera, editChimera, removeChimera, shapeChimera, setChimerasShown, chimerasShown,
  cleanChimeraName, cleanChimeraSayings, CHIMERA_KEEP, CHIMERA_NAME_MAX, CHIMERA_SAYINGS, CHIMERA_SAYING_MAX,
  json, body, sameSite } from '../cb/lib.mjs';

// Every answer asks search engines not to index or archive it, as
// privacy.html#chimeras says.
const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };
const answer = async (r, who, extra = {}) =>
  json(200, { chimeras: r.chimeras.map(shapeChimera), claimed: !!who.account,
    shown: !!who.account && await chimerasShown(who.handle), keep: CHIMERA_KEEP,
    sayingsMax: CHIMERA_SAYINGS, sayingMax: CHIMERA_SAYING_MAX, ...extra }, NOINDEX);

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This tray only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const pk = petKey(who.handle);
  if (req.method !== 'POST') return answer(await readChimeras(pk), who);
  const b = (await body(req)) || {};
  const name = b.name === undefined ? undefined : cleanChimeraName(b.name);
  if (name === null) return json(400, { error: `A name is at most ${CHIMERA_NAME_MAX} characters.` });
  const sayings = b.sayings === undefined ? undefined : cleanChimeraSayings(b.sayings);
  if (sayings === null) return json(400, { error: `A chimera has at most ${CHIMERA_SAYINGS} sayings, each at most ${CHIMERA_SAYING_MAX} characters.` });
  try {
    if (b.keep !== undefined) {
      const r = await keepChimera(pk, { parts: b.keep, name: name || '', sayings: sayings || [] });
      if (r.error === 'full') return json(409, { error: `Profile keeps ${CHIMERA_KEEP} chimeras at once. Delete one there to keep this.` });
      if (r.error) return json(400, { error: 'That chimera has a part in it the shelf does not know.' });
      return await answer(r, who, { kept: shapeChimera(r.kept) });
    }
    if (typeof b.edit === 'string') {
      const r = await editChimera(pk, b.edit, { parts: b.parts, name, sayings });
      if (r.error === 'parts') return json(400, { error: 'That chimera has a part in it the shelf does not know.' });
      if (r.error) return json(404, { error: 'That chimera is not one of yours any more.' });
      return await answer(r, who);
    }
    if (typeof b.remove === 'string') {
      const r = await removeChimera(pk, b.remove);
      if (r.error) return json(404, { error: 'That chimera is not one of yours any more.' });
      return await answer(r, who);
    }
    if (typeof b.show === 'boolean') {
      if (!who.account) return json(403, { error: 'Claim your username first: an unclaimed handle is anybody’s who signs on with it, so it cannot show chimeras on anybody’s behalf.' });
      await setChimerasShown(who.handle, b.show);
      return await answer(await readChimeras(pk), who);
    }
  } catch (e) {
    return json(503, { error: 'That did not work just now. Nothing changed; try again in a moment.' });
  }
  return json(400, { error: 'Keep, change, delete or show what?' });
};

export const config = {
  path: '/cb/chimeras',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
