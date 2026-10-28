/* How long each category of the forums keeps a topic, at the desk in the
   Moderators' room (Ryan's ask, 2026-10-28, after the channels'). A base pass
   holding the administrator role, POST:
     { action: 'list' }                   every category, what data/forum.json keeps it for, and what the desk set
     { action: 'set', slug, keep }        keep: one of FORUM_KEEPS
     { action: 'clear', slug }            back to data/forum.json's
   A longer keep reaches only what is posted after it; a shorter one reaches
   every topic at once. Wikis and Coping are not the desk's. Nothing is
   logged. See ../cb/lib.mjs, how long each category keeps a topic. */
import { readPass, rulesEditor, forumRulesList, setForumRule, staffReady, json, body, sameSite } from '../cb/lib.mjs';

const QUIET = { 'x-robots-tag': 'noindex', 'cache-control': 'no-store' };

export default async (req) => {
  // The forums are sealed at rest, and the sweep a shorter keep runs reads them.
  if (!staffReady()) return json(503, { error: 'The forums are shut just now. Nothing was changed.' }, QUIET);
  if (!sameSite(req)) return json(403, { error: 'The CB only answers stimpunks.world.' }, QUIET);
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' }, QUIET);
  if (!rulesEditor(who)) return json(403, { error: 'The forums’ keeps are set by administrators.' }, QUIET);
  const b = (await body(req)) || {};
  try {
    if (b.action === 'list') return json(200, await forumRulesList(who), QUIET);
    if (b.action === 'set' || b.action === 'clear') {
      const r = await setForumRule(who, typeof b.slug === 'string' ? b.slug : '', b.keep, undefined, undefined, b.action === 'clear');
      return r.error ? json(400, r, QUIET) : json(200, r, QUIET);
    }
    return json(400, { error: 'Do what with it?' }, QUIET);
  } catch (e) {
    return json(503, { error: 'The forums are busy just now. Look again in a moment.' }, QUIET);
  }
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/forum-rules',
  method: 'POST',
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
