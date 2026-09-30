/* Your account, from the Profile tray on the CB. GET with a pass says whether
   your username is claimed and since when. POST, with a pass:
     { action: 'claim', password }       claim the username you are signed on
                                         as, with the community password, or
                                         move a moderator's handle off the
                                         moderators' password onto one of their
                                         own, with a base pass; the
                                         answer has a new pass and a recovery
                                         code, shown once and kept only as a hash
     { action: 'password', old, password }  change it; every other device is
                                         signed off
     { action: 'delete', password }      delete the account and its pets
   Nothing a person types is ever logged, passwords above all. */
import { readPass, readAccount, claimAccount, changePassword, checkPassword, deleteAccount, accountAnswer,
  shapeAccount, readMods, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This desk only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  if (req.method === 'GET') {
    return json(200, { ...shapeAccount(await readAccount(who.handle)), base: who.role === 'base' });
  }
  const b = (await body(req)) || {};
  try {
    if (b.action === 'claim') {
      if (who.account) return json(400, { error: 'This username is claimed already.' });
      const mods = readMods();
      const r = await claimAccount(who.handle, b.password, undefined, undefined, mods, who.role === 'base');
      if (r.error) return json(409, { error: r.error });
      return json(200, { ...accountAnswer(r.handle, r.v, mods), recovery: r.recovery });
    }
    if (!who.account) return json(400, { error: 'Claim your username first.' });
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
