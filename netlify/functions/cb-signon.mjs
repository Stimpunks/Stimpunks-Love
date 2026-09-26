/* The CB: signing on. A handle and the shared password in, a pass out.
   See ../cb/lib.mjs for what this may and may not keep, which is nothing. */
import { roleFor, issuePass, cleanHandle, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  const b = await body(req);
  const handle = cleanHandle(b && b.handle);
  if (!handle) return json(400, { error: 'A handle is between one and 24 characters.' });
  const role = roleFor(b && b.password);
  if (!role) return json(401, { error: 'That is not the community password.' });
  return json(200, { pass: issuePass(role, handle), handle, base: role === 'base' });
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/signon',
  method: 'POST',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
