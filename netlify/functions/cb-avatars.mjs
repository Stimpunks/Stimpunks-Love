/* Your avatars, for the CB's Profile, the Bodymind Booth and the Dopamine
   Dress-Up Den. GET with a pass lists them, with which one is worn on the CB.
   POST with a pass:
     { keep: look, name, about }        keeps a new one
     { edit: id, look?, name?, about? } changes one
     { remove: id }                     deletes one, off the CB first if worn
     { wear: id | null }                wears one on the CB, or none, and only
                                        a claimed username can
   A look is only ever a list of choices, checked by cleanLook() against the
   keys tools/make-bodymind.py writes into lib.mjs; nothing a picture could be
   is ever taken. A handle is not an account, so whoever signs on with an
   unclaimed one has these avatars; Profile says so. FORGET ME is /cb/pets,
   which deletes these too. */
import { readPass, petKey, readAvatars, keepAvatar, editAvatar, removeAvatar, wearAvatar, shapeAvatar,
  cleanAvatarName, cleanAvatarAbout, AVATAR_KEEP, AVATAR_NAME_MAX, AVATAR_ABOUT_MAX, json, body, sameSite } from '../cb/lib.mjs';

// Every answer asks search engines not to index or archive it, as
// privacy.html#avatars says.
const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };
const answer = (r, claimed, extra = {}) =>
  json(200, { avatars: r.avatars.map(shapeAvatar), wearing: r.wearing, claimed, keep: AVATAR_KEEP, ...extra }, NOINDEX);

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This tray only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const pk = petKey(who.handle);
  const claimed = !!who.account;
  if (req.method !== 'POST') return answer(await readAvatars(pk), claimed);
  const b = (await body(req)) || {};
  const name = b.name === undefined ? undefined : cleanAvatarName(b.name);
  const about = b.about === undefined ? undefined : cleanAvatarAbout(b.about);
  if (name === null) return json(400, { error: `A name is at most ${AVATAR_NAME_MAX} characters.` });
  if (about === null) return json(400, { error: `What you write about it is at most ${AVATAR_ABOUT_MAX} characters.` });
  try {
    if (b.keep !== undefined) {
      const r = await keepAvatar(pk, { look: b.keep, name: name || '', about: about || '' });
      if (r.error === 'full') return json(409, { error: `Profile keeps ${AVATAR_KEEP} avatars at once. Delete one there to keep this.` });
      if (r.error) return json(400, { error: 'That look has something in it the street does not know.' });
      return answer(r, claimed, { kept: shapeAvatar(r.kept) });
    }
    if (typeof b.edit === 'string') {
      const r = await editAvatar(pk, b.edit, { look: b.look, name, about });
      if (r.error === 'look') return json(400, { error: 'That look has something in it the street does not know.' });
      if (r.error) return json(404, { error: 'That avatar is not one of yours any more.' });
      return answer(r, claimed);
    }
    if (typeof b.remove === 'string') {
      const r = await removeAvatar(pk, b.remove);
      if (r.error) return json(404, { error: 'That avatar is not one of yours any more.' });
      return answer(await readAvatars(pk), claimed);
    }
    if (b.wear !== undefined) {
      if (!claimed) return json(403, { error: 'Claim your username first: an unclaimed handle is anybody’s who signs on with it, so anybody could dress it.' });
      const r = await wearAvatar(pk, b.wear === null ? null : b.wear);
      if (r.error) return json(404, { error: 'That avatar is not one of yours any more.' });
      return answer(r, claimed);
    }
  } catch (e) {
    return json(503, { error: 'That did not work just now. Nothing changed; try again in a moment.' });
  }
  return json(400, { error: 'Keep, change, delete or wear what?' });
};

export const config = {
  path: '/cb/avatars',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
