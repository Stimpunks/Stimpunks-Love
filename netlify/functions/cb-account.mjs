/* Your account, from Account on the CB. GET with a pass says whether your
   username is claimed and since when, the email address it keeps for
   recovery if it keeps one (to you and nobody else), and whether recovery by
   email is switched on. POST, with a pass:
     { action: 'claim', password, email? }  claim the username a pass from a
                                         shared password is on: the community
                                         one's, or a moderator's on the
                                         moderators' password. The one thing
                                         such a pass is still good for (Ryan,
                                         2026-10-21). The answer has a new pass
                                         and a recovery code, shown once and
                                         kept only as a hash
     { action: 'password', old, password }  change it; every other device is
                                         signed off
     { action: 'email', password, email }   set, change or take off (empty)
                                         the address for recovery
     { action: 'delete', password }      delete the account and its pets
   Nothing a person types is ever logged, passwords and addresses above all. */
import { readPass, readAccount, claimAccount, changePassword, checkPassword, deleteAccount, accountAnswer,
  shapeAccount, accountEmail, setAccountEmail, emailOn, readMods, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This desk only answers stimpunks.world.' });
  const who = await readPass(req, undefined, undefined, { unclaimed: true });
  if (!who) return json(401, { error: 'signed off' });
  if (req.method === 'GET') {
    const a = await readAccount(who.handle);
    return json(200, { ...shapeAccount(a), base: who.role === 'base', email: who.account ? accountEmail(a) : null, emailOn: emailOn() });
  }
  const b = (await body(req)) || {};
  try {
    if (b.action === 'claim') {
      if (who.account) return json(400, { error: 'This username is claimed already.' });
      const mods = readMods();
      const r = await claimAccount(who.handle, b.password, undefined, undefined, mods, who.role === 'base', b.email);
      if (r.error) return json(409, { error: r.error });
      return json(200, { ...accountAnswer(r.handle, r.v, mods), recovery: r.recovery });
    }
    if (!who.account) return json(400, { error: 'Claim your username first.' });
    if (b.action === 'email') {
      const r = await setAccountEmail(who.handle, b.password, b.email);
      if (r.error) return json(r.locked ? 423 : 400, { error: r.error });
      return json(200, { email: r.email });
    }
    if (b.action === 'password') {
      const r = await changePassword(who.handle, b.old, b.password);
      if (r.error) return json(r.locked ? 423 : 400, { error: r.error });
      return json(200, accountAnswer(who.handle, r.v));
    }
    if (b.action === 'delete') {
      const ok = await checkPassword(who.handle, b.password);
      if (ok.error) return json(ok.locked ? 423 : 400, { error: ok.error });
      await deleteAccount(who.handle);
      return json(200, { deleted: true });
    }
    return json(400, { error: 'Do what with it?' });
  } catch (e) {
    return json(503, { error: 'The desk is busy. Try again in a moment. Nothing was changed.' });
  }
};

export const config = {
  path: '/cb/account',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
