/* Joining the CB, from the joining page (join.html): an invite, a username, a
   password of your own, and an email address for recovery if you want one.
   Ryan's brief, 2026-10-21. No pass is needed, because joining is how you get
   one. POST, JSON:
     { action: 'check', invite?, handle? }   whether an invite works, and
                                             whether a username is free and is
                                             a moderator's, before anybody types
                                             a password; and whether recovery by
                                             email is switched on
     { action: 'join', invite, handle, password, email?, modPassword? }
                                             claim the username; a moderator's
                                             takes the moderators' password and
                                             no invite. The answer is a pass and
                                             a recovery code, shown once
   Nothing is kept about who joined with which invite, and nothing a person
   types is ever logged. See ../cb/lib.mjs, invites. */
import { checkInvite, checkHandle, joinAccount, emailOn, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This desk only answers stimpunks.world.' });
  const b = (await body(req)) || {};
  try {
    if (b.action === 'check') {
      const out = { emailOn: emailOn() };
      if (b.invite) out.invite = await checkInvite(b.invite);
      if (b.handle) out.handle = await checkHandle(b.handle);
      return json(200, out);
    }
    if (b.action === 'join') {
      const r = await joinAccount(b);
      if (r.error) return json(400, { error: r.error, mod: !!r.mod, taken: !!r.taken, invite: !!r.invite });
      return json(200, r);
    }
    return json(400, { error: 'Do what?' });
  } catch (e) {
    return json(503, { error: 'The desk is busy. Try again in a moment. Nothing was claimed.' });
  }
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/join',
  method: 'POST',
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
