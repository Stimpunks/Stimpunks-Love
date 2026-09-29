/* The CB: signing on. A handle and a password in, a pass out: the community
   password for anybody whose handle is not a moderator's, the moderators'
   password only for a handle on CB_MODS. See ../cb/lib.mjs for what this may
   and may not keep, which is nothing. */
import { signOn, issuePass, cleanHandle, rolesOf, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  const b = await body(req);
  const handle = cleanHandle(b && b.handle);
  if (!handle) return json(400, { error: 'A handle is between one and 24 characters.' });
  const r = signOn(handle, b && b.password);
  if (r.error) return json(401, { error: r.error });
  return json(200, { pass: issuePass(r.role, r.handle), handle: r.handle, base: r.role === 'base', roles: rolesOf(r) });
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/signon',
  method: 'POST',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
