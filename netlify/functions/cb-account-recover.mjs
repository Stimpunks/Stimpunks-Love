/* Getting back into a claimed username without its password: the username,
   its recovery code, a reset code we emailed or a moderator's, and a new
   password. No pass is needed, because the point is that you cannot sign on.
   A wrong code counts as a wrong password, and five lock the username for
   fifteen minutes. The answer is a pass and a NEW recovery code, shown once.

   { action: 'email', handle, email } asks for a reset code by email, and is
   answered the same whether or not that username has that address on it
   (mailResetCode), so it tells nobody anything about anybody's address. */
import { recoverAccount, mailResetCode, accountAnswer, secondTicket, webauthnSite, cleanHandle, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This desk only answers stimpunks.world.' });
  const b = (await body(req)) || {};
  const handle = cleanHandle(b.handle);
  if (!handle) return json(400, { error: 'Which username?' });
  try {
    if (b.action === 'email') {
      const r = await mailResetCode(handle, b.email);
      if (r.off) return json(503, { error: 'Recovery by email is not switched on just now. Your recovery code, or a moderator, is the way back in.' });
      return json(200, { asked: true });
    }
    const r = await recoverAccount(handle, b.code, b.password);
    if (r.error) return json(r.locked ? 423 : 400, { error: r.error });
    // An account with a second step still asks for it: the password changed,
    // and the pass comes after the step (two-step sign-in in lib.mjs).
    if (r.second) return json(200, { recovery: r.recovery, second: secondTicket(r.acct, webauthnSite(req)), handle: r.handle });
    // A moderator who recovers comes back as the base, with the roles the list
    // gives them now.
    return json(200, { ...accountAnswer(r.handle, r.v, undefined, r.acct), recovery: r.recovery });
  } catch (e) {
    return json(503, { error: 'The desk is busy. Try again in a moment. Nothing was changed.' });
  }
};

export const config = {
  path: '/cb/account/recover',
  method: 'POST',
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
