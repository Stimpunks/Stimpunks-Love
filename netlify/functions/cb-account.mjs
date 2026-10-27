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
   Two-step sign-in (lib.mjs), each answering a new pass for this device, and
   backup codes shown once when the first step goes on:
     { action: 'app-start' }              a secret for an authenticator app
     { action: 'app-confirm', setup, code }   it goes on, with a code from the app
     { action: 'key-start' }              the options a browser makes a passkey with
     { action: 'key-add', setup, cred, name }  it goes on
     { action: 'second-off', password, what }  'app', a passkey's id, or 'all'
     { action: 'second-codes', password }      new backup codes, the old ones gone
   Nothing a person types is ever logged, passwords and addresses above all. */
import { readPass, readAccount, claimAccount, changePassword, checkPassword, deleteAccount, accountAnswer,
  shapeSecond, totpStart, totpConfirm, passkeyStart, passkeyAdd, secondRemove, secondCodes, webauthnSite,
  shapeAccount, accountEmail, setAccountEmail, emailOn, readMods, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This desk only answers stimpunks.world.' });
  const who = await readPass(req, undefined, undefined, { unclaimed: true });
  if (!who) return json(401, { error: 'signed off' });
  if (req.method === 'GET') {
    const a = await readAccount(who.handle);
    const staff = who.role === 'base' || who.twostep === 'needed';
    return json(200, { ...shapeAccount(a), base: who.role === 'base', email: who.account ? accountEmail(a) : null, emailOn: emailOn(),
      ...(a ? { second: shapeSecond(a, Date.now(), staff) } : {}) });
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
    // Two-step sign-in: each change answers this device a new pass, because it
    // moved the account's version and signed every other device off.
    const stepped = (r) => json(200, { ...accountAnswer(who.handle, r.v, undefined, r.acct), second: shapeSecond(r.acct, Date.now(), true), ...(r.codes ? { codes: r.codes } : {}) });
    if (b.action === 'app-start') {
      const r = await totpStart(who);
      return r.error ? json(400, r) : json(200, r);
    }
    if (b.action === 'app-confirm') {
      const r = await totpConfirm(who, b.setup, b.code);
      return r.error ? json(400, r) : stepped(r);
    }
    if (b.action === 'key-start') {
      const r = await passkeyStart(who, webauthnSite(req));
      return r.error ? json(400, r) : json(200, r);
    }
    if (b.action === 'key-add') {
      const r = await passkeyAdd(who, b.setup, b.cred, b.name, webauthnSite(req));
      return r.error ? json(400, r) : stepped(r);
    }
    if (b.action === 'second-off') {
      const r = await secondRemove(who, b.password, typeof b.what === 'string' ? b.what : '');
      return r.error ? json(r.locked ? 423 : 400, r) : stepped(r);
    }
    if (b.action === 'second-codes') {
      const r = await secondCodes(who, b.password);
      return r.error ? json(r.locked ? 423 : 400, r) : json(200, r);
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
