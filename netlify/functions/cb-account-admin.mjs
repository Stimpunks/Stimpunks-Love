/* The moderators' desk, in the Moderators' room: the directory of every
   username, and one username looked up by name, to give a reset code, delete,
   clear its profile card, kick, time out, ban, or lift a time out or a ban.
   Only a base pass. The reset code is shown to the moderator once, to pass on
   privately after they have made sure who they are talking to, and is kept
   here only as a hash.

   CLEARING A CARD is Ryan's call, 2026-10-18, for a card that breaks the
   covenant, which until then could only go with the whole username. It takes
   the card and its nameplate and leaves the username and everything else under
   it; nothing is kept about it. Looking a username up says whether it has a
   card, which anybody signed on can already see by opening its profile.

   THE DIRECTORY, KICK, TIME OUT AND BAN are Ryan's ask and call, 2026-10-22,
   after moderators asked for them for safeguarding. The directory reverses
   "there is no list of every account": it is every username, whether it is a
   moderator's, whether it is barred now and the rooms it is seen in by Be seen
   here's rules (accountDirectory in lib.mjs), with how many, for the desk and
   nothing else. A time out and a ban keep until when and nothing more: not
   who, not why (barAccount). */
import { readPass, cleanHandle, readAccount, resetAccount, deleteAccount, clearProfile, readProfile, petKey, shapeAccount, isMod,
  accountDirectory, kickAccount, barAccount, liftBar, shapeBar, BAR_FOR, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This desk only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who || who.role !== 'base') return json(403, { error: 'Only a moderator can do that.' });
  const b = (await body(req)) || {};
  try {
    if (b.action === 'directory') return json(200, await accountDirectory(who));
    const handle = cleanHandle(b.handle);
    if (!handle) return json(400, { error: 'Which username?' });
    if (b.action === 'find') {
      const a = await readAccount(handle);
      return json(200, { ...shapeAccount(a), mod: isMod(handle), card: !!a && !!(await readProfile(petKey(handle))), bar: shapeBar(a) });
    }
    // NOT A MODERATOR'S. A reset code for a moderator's username would let one
    // moderator sign on as another, with the other's roles: the Board room,
    // Executive Session. A moderator gets back in with their own recovery code,
    // or by being taken off the list for a moment (see lib.mjs). The desk
    // leaves a moderator's card alone too, and never kicks, times out or bans
    // one: it leaves their username alone. An administrator takes somebody off
    // the list first, at the roles desk, if it ever comes to that.
    if (isMod(handle)) return json(403, { error: 'That username is a moderator’s. The desk does not reset, delete, clear the card of, kick, time out or ban a moderator’s username: an administrator takes them off the list first, or they ask Ryan or Helen.' });
    if (b.action === 'reset') {
      const r = await resetAccount(handle);
      if (r.error) return json(404, { error: r.error });
      return json(200, { code: r.code, until: r.until });
    }
    if (b.action === 'delete') {
      const r = await deleteAccount(handle);
      if (r.error) return json(404, { error: r.error });
      return json(200, { deleted: true });
    }
    if (b.action === 'clearCard') {
      const r = await clearProfile(handle);
      if (r.error) return json(404, { error: r.error });
      return json(200, { cleared: true, had: r.had });
    }
    if (b.action === 'kick') {
      const r = await kickAccount(handle);
      if (r.error) return json(404, { error: r.error });
      return json(200, { kicked: true });
    }
    if (b.action === 'timeout') {
      const span = Object.prototype.hasOwnProperty.call(BAR_FOR, b.for) ? BAR_FOR[b.for] : null;
      if (!span) return json(400, { error: 'For how long? Ten minutes, an hour, a day or a week.' });
      const r = await barAccount(handle, Date.now() + span);
      if (r.error) return json(404, { error: r.error });
      return json(200, { bar: r.bar });
    }
    if (b.action === 'ban') {
      const r = await barAccount(handle, 0);
      if (r.error) return json(404, { error: r.error });
      return json(200, { bar: r.bar });
    }
    if (b.action === 'lift') {
      const r = await liftBar(handle);
      if (r.error) return json(404, { error: r.error });
      return json(200, { lifted: r.lifted });
    }
    return json(400, { error: 'Do what with it?' });
  } catch (e) {
    return json(503, { error: 'The desk is busy. Try again in a moment. Nothing was changed.' });
  }
};

export const config = {
  path: '/cb/account/admin',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
