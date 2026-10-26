/* The moderators' desk's calls: POST /cb/mod-calls with a base pass.
     {}               every note of a call waiting, newest first
     { close: id }    close one, which deletes it
   A note is left when somebody who is not a moderator calls @moderator on a
   channel or in a forum post (noteModCall in lib.mjs, Ryan's call,
   2026-10-23): who called, when, where, and the words they called with. It is
   deleted when a moderator closes it, or after thirty days, and nothing says
   who closed it. */
import { staffReady, readPass, readModCalls, closeModCall, MOD_CALL_DAYS, json, body, sameSite } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  // The calls are sealed with CB_STAFF_KEY (lib.mjs): without it, shut.
  if (!staffReady()) return json(503, { error: 'The calls are shut just now. Nothing was read or changed.' });
  if (!sameSite(req)) return json(403, { error: 'The desk only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  if (who.role !== 'base') return json(403, { error: 'The desk is for moderators signed on as the base.' });
  const b = (await body(req)) || {};
  try {
    if (typeof b.close === 'string') {
      const r = await closeModCall(who, b.close);
      if (r.error) return json(404, { error: 'That call is not on the desk any more.' });
    }
    return json(200, { calls: await readModCalls(who), days: MOD_CALL_DAYS }, NOINDEX);
  } catch (e) {
    return json(503, { error: 'That did not work just now. Nothing changed; try again in a moment.' });
  }
};

export const config = {
  path: '/cb/mod-calls',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
