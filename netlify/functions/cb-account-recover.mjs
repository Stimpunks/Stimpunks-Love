/* Getting back into a claimed username without its password: the username,
   its recovery code or a moderator's reset code, and a new password. No pass
   is needed, because the point is that you cannot sign on. A wrong code counts
   as a wrong password, and five lock the username for fifteen minutes. The
   answer is a pass and a NEW recovery code, shown once. */
import { recoverAccount, accountAnswer, cleanHandle, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This desk only answers stimpunks.world.' });
  const b = (await body(req)) || {};
  const handle = cleanHandle(b.handle);
  if (!handle) return json(400, { error: 'Which username?' });
  try {
    const r = await recoverAccount(handle, b.code, b.password);
    if (r.error) return json(r.locked ? 423 : 400, { error: r.error });
    // A moderator who recovers comes back as the base, with the roles the list
    // gives them now.
    return json(200, { ...accountAnswer(r.handle, r.v), recovery: r.recovery });
  } catch (e) {
    return json(503, { error: 'The desk is busy. Try again in a moment. Nothing was changed.' });
  }
};

export const config = {
  path: '/cb/account/recover',
  method: 'POST',
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
