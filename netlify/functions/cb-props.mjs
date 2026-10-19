/* Your own props, for the CB's Profile. GET with a pass lists what is waiting
   for you and what is up on your Props tab, newest first. POST with a pass:
     { confirm: id }          puts a waiting prop on your Props tab
     { reject: id }           deletes a waiting prop, and nobody is told
     { remove: id }           takes a prop off your Props tab and deletes it
     { show: true | false }   opens your Props tab, or shuts it
   Only a claimed username has a Props tab: an unclaimed handle is anybody's who
   signs on with it, so nobody could confirm props on its behalf. Nothing about
   when is kept, and nothing is counted. FORGET ME is /cb/pets, which deletes
   these too. Giving somebody props is /cb/props/of. */
import { readPass, petKey, readProps, ownProps, confirmProp, rejectProp, dropProp, setPropsOpen,
  PROPS_KEEP, PROPS_WAITING, PROP_MAX, json, body, sameSite } from '../cb/lib.mjs';

// Every answer asks search engines not to index or archive it, as
// privacy.html#props says.
const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };
const answer = (d, who, extra = {}) =>
  json(200, { claimed: !!who.account, ...(who.account ? ownProps(d) : { open: false, waiting: [], props: [] }),
    keep: PROPS_KEEP, waitMax: PROPS_WAITING, max: PROP_MAX, ...extra }, NOINDEX);

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This tray only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const pk = petKey(who.handle);
  if (req.method !== 'POST') return answer(who.account ? await readProps(pk) : null, who);
  if (!who.account) return json(403, { error: 'Claim your username first: an unclaimed handle is anybody’s who signs on with it, so nobody could confirm props on its behalf.' });
  const b = (await body(req)) || {};
  try {
    if (typeof b.confirm === 'string') {
      const r = await confirmProp(pk, b.confirm);
      if (r.error === 'full') return json(409, { error: `Your Props tab holds ${PROPS_KEEP} at once. Take one off it to confirm this.` });
      if (r.error) return json(404, { error: 'That prop is not waiting any more.' });
      return answer(r, who);
    }
    if (typeof b.reject === 'string') {
      const r = await rejectProp(pk, b.reject);
      if (r.error) return json(404, { error: 'That prop is not waiting any more.' });
      return answer(r, who);
    }
    if (typeof b.remove === 'string') {
      const r = await dropProp(who.handle, who, b.remove);
      if (r.error) return json(404, { error: 'That prop is not on your Props tab any more.' });
      return answer(r, who);
    }
    if (typeof b.show === 'boolean') {
      return answer(await setPropsOpen(pk, b.show), who);
    }
  } catch (e) {
    return json(503, { error: 'That did not work just now. Nothing changed; try again in a moment.' });
  }
  return json(400, { error: 'Confirm, reject, take off or show what?' });
};

export const config = {
  path: '/cb/props',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
