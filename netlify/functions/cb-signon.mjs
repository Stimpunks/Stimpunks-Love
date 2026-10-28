/* The CB: signing on. A username and its own password in, a pass out; a
   moderator's own password gives a base pass. The starter password signs
   nobody on since 2026-10-21: everybody joins by claiming a username, at
   /cb/join. A moderator whose handle is still on the moderators' password is
   answered { claim } with no pass, so the page can send them to claim it. See
   ../cb/lib.mjs for what this may and may not keep. */
import { signOn, issueAccountPass, cleanHandle, rolesOf, secondTicket, secondCheck, webauthnSite, accountAnswer, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  const b = await body(req);
  // THE SECOND STEP (two-step sign-in in lib.mjs): the ticket the password
  // earned, and a code from the app, a backup code or a passkey's answer.
  if (b && typeof b.ticket === 'string') {
    const r = await secondCheck(b.ticket, { code: b.code, assertion: b.assertion }, webauthnSite(req));
    if (r.error) return json(r.locked ? 423 : 401, { error: r.error });
    return json(200, accountAnswer(r.handle, r.v, undefined, r.acct));
  }
  const handle = cleanHandle(b && b.handle);
  if (!handle) return json(400, { error: 'A handle is between one and 24 characters.' });
  const r = await signOn(handle, b && b.password);
  if (r.error) return json(401, { error: r.error });
  if (r.claim) return json(200, { claim: true, mod: !!r.mod, handle: r.handle });
  if (r.second) {
    const second = secondTicket(r.acct, webauthnSite(req));
    if (!second) return json(503, { error: 'Two-step sign-in is switched off just now. Tell Ryan or Helen.' });
    return json(200, { second, handle: r.acct.handle });
  }
  const pass = issueAccountPass(r.handle, r.account, r.role);
  return json(200, { pass, handle: r.handle, base: r.role === 'base', roles: rolesOf(r), claimed: !!r.account, ...(r.twostep ? { twostep: r.twostep } : {}) });
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/signon',
  method: 'POST',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
