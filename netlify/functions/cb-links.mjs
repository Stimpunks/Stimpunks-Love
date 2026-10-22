/* The radio's links (Ryan's ask, 2026-10-21, after Notion's): a message on the
   channel or between two people can hold [[task:<id>]], [[topic:<id>]] and
   the office's [[grant:…]], [[case:…]] and [[contact:…]], and the radio asks
   here what each one is to its reader, since a message is drawn in the
   browser. A claimed username's pass. POST:
     { action: 'find', q }        what the [[ menu offers for q (findLinks), the latest first
     { action: 'names', refs }    for each kind:id, { name, href }, { gone } or { shut } (resolveLinks)
   What somebody may open is asked of their pass every time, so a task's name
   reaches only directors, board members and administrators, and everybody else is told only
   that it is one they can't open. A chat leaves no backlink: nothing is kept
   here. Nothing a person types is logged. See ../cb/lib.mjs, links. */
import { readPass, forumReader, findLinks, resolveLinks, LINKS_MAX, json, body, sameSite } from '../cb/lib.mjs';

const QUIET = { 'x-robots-tag': 'noindex', 'cache-control': 'no-store' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The CB only answers stimpunks.world.' }, QUIET);
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' }, QUIET);
  if (!forumReader(who)) return json(403, { error: 'Links are for claimed usernames.' }, QUIET);
  const b = (await body(req)) || {};
  try {
    if (b.action === 'find') return json(200, { found: await findLinks(who, typeof b.q === 'string' ? b.q : '') }, QUIET);
    if (b.action === 'names') {
      const refs = Array.isArray(b.refs) ? b.refs.filter((r) => typeof r === 'string').slice(0, LINKS_MAX) : [];
      return json(200, { names: await resolveLinks(who, refs) }, QUIET);
    }
    return json(400, { error: 'Do what with it?' }, QUIET);
  } catch (e) {
    return json(503, { error: 'busy' }, QUIET);
  }
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/links',
  method: 'POST',
  rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
