/* The CB: signing on. A handle and a password in, a pass out: the community
   password for anybody whose handle is neither a moderator's nor claimed, the
   moderators' password only for a handle on CB_MODS that has not moved onto a
   password of its own, and a claimed username's own password for that
   username and nothing else. A moderator's own password gives a base pass. See ../cb/lib.mjs for what
   this may and may not keep. */
import { signOn, issuePass, issueAccountPass, cleanHandle, rolesOf, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  const b = await body(req);
  const handle = cleanHandle(b && b.handle);
  if (!handle) return json(400, { error: 'A handle is between one and 24 characters.' });
  const r = await signOn(handle, b && b.password);
  if (r.error) return json(401, { error: r.error });
  const pass = r.account ? issueAccountPass(r.handle, r.account, r.role) : issuePass(r.role, r.handle);
  return json(200, { pass, handle: r.handle, base: r.role === 'base', roles: rolesOf(r), claimed: !!r.account });
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/signon',
  method: 'POST',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
