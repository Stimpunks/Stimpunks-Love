/* How many messages each channel keeps, and for how long, at the desk in the
   Moderators' room (Ryan's ask and calls, 2026-10-25). A base pass holding
   the administrator role, POST:
     { action: 'list' }                         every channel set, with who changed it last, and the defaults
     { action: 'set', name, keep, days }        name: world, every, dm, or a room's tag; days 0 is for good
     { action: 'clear', name }                  back to what it follows
   A longer time reaches only messages sent after it; a shorter one, and a
   smaller keep, reach everything at once. Nothing is logged. See
   ../cb/lib.mjs, how many messages each channel keeps. */
import { readPass, rulesEditor, rulesList, setRule, json, body, sameSite } from '../cb/lib.mjs';

const QUIET = { 'x-robots-tag': 'noindex', 'cache-control': 'no-store' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The CB only answers stimpunks.world.' }, QUIET);
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' }, QUIET);
  if (!rulesEditor(who)) return json(403, { error: 'Channels are set by administrators.' }, QUIET);
  const b = (await body(req)) || {};
  try {
    if (b.action === 'list') return json(200, await rulesList(who), QUIET);
    if (b.action === 'set' || b.action === 'clear') {
      const r = await setRule(who, typeof b.name === 'string' ? b.name : '', { keep: b.keep, days: b.days }, undefined, undefined, b.action === 'clear');
      return r.error ? json(400, r, QUIET) : json(200, r, QUIET);
    }
    return json(400, { error: 'Do what with it?' }, QUIET);
  } catch (e) {
    return json(503, { error: 'The channels are busy just now. Look again in a moment.' }, QUIET);
  }
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/channel-rules',
  method: 'POST',
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
