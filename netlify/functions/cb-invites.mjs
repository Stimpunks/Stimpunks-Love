/* Invites, at the desk in the Moderators' room. Only a base pass. Ryan's
   brief, 2026-10-21: moderators make and delete invite codes, and share their
   links. POST, JSON:
     {}                                  every invite, newest first
     { make: { note, most, days } }      a new one: a note saying what it is
                                         for, how many times it may be used (0
                                         is no limit) and how many days it lasts
                                         (0 is until it is deleted)
     { delete: id }                      stop one working, at once
   An invite counts its uses and never who used it. See ../cb/lib.mjs, invites. */
import { readPass, listInvites, makeInvite, deleteInvite, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This desk only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who || who.role !== 'base') return json(403, { error: 'Only a moderator can do that.' });
  const b = (await body(req)) || {};
  try {
    let made = null;
    if (b.make) {
      const r = await makeInvite(who, b.make);
      if (r.error) return json(400, { error: r.error });
      made = r.invite.id;
    } else if (b.delete) {
      const r = await deleteInvite(who, b.delete);
      if (r.error) return json(404, { error: r.error });
    }
    return json(200, { ...(await listInvites(who)), made });
  } catch (e) {
    return json(503, { error: 'The desk is busy. Try again in a moment. Nothing was changed.' });
  }
};

export const config = {
  path: '/cb/invites',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
