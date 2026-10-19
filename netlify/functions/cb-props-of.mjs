/* Somebody else's Props tab, for their profile on the CB: POST /cb/props/of
   with a pass, when you press their name on Who's online or their handle on
   the channel.
     { handle }               reads it
     { handle, give: words }  gives them props, which wait for them to confirm
     { handle, remove: id }   takes one back, if you wrote it; takes one down,
                              if you are the base; or takes one off, if it is
                              your own tab
   Reading needs only a pass. The answer is the props that are up only if they
   have opened their Props tab, which only a claimed username can; for a handle
   that is not claimed it is { shown: false }, the same whether the handle is
   unclaimed or nobody at all. Whatever you wrote for them that is still
   waiting comes back to you, and nobody else's does. Giving props needs a
   claimed username, because a prop carries your name on somebody else's
   profile. Nothing about who asked is kept, and the handle travels in the body
   rather than the address, so it is in no request log. */
import { readPass, shownProps, giveProp, dropProp, cleanHandle, PROP_MAX, json, body, sameSite } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This tray only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  const handle = cleanHandle(b.handle);
  if (!handle) return json(400, { error: 'Whose props?' });
  const tab = async (extra = {}) => json(200, { ...((await shownProps(handle, who)) || { handle, shown: false, waiting: [] }), ...extra }, NOINDEX);
  try {
    if (b.give !== undefined) {
      const r = await giveProp(handle, who, b.give);
      if (r.error === 'claim') return json(403, { error: 'Claim your username first, in Profile on this radio: a prop carries your name on somebody else’s profile, and an unclaimed handle is anybody’s who signs on with it.' });
      if (r.error === 'empty') return json(400, { error: 'Write what you would like to thank them for first.' });
      if (r.error === 'long') return json(400, { error: `A prop is at most ${PROP_MAX} characters.` });
      if (r.error === 'self') return json(400, { error: 'Props are for somebody else. Your own Props tab holds what other people give you.' });
      if (r.error === 'closed') return json(403, { error: `${handle} has not opened their Props tab, so nobody can give them props just now.` });
      if (r.error === 'waiting') return json(409, { error: `You have props waiting for ${handle} to confirm already. Take those back to write them again.` });
      if (r.error === 'full') return json(409, { error: `${handle} has props waiting to read already. Try again another day.` });
      return tab({ given: r.given.id });
    }
    if (typeof b.remove === 'string') {
      const r = await dropProp(handle, who, b.remove);
      if (r.error) return json(404, { error: 'That prop is not there any more, or is not yours to take off.' });
      return tab();
    }
  } catch (e) {
    return json(503, { error: 'That did not work just now. Nothing changed; try again in a moment.' });
  }
  return tab();
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/props/of',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
