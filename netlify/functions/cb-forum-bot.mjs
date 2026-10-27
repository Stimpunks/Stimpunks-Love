/* The Wiki's bot: Claude keeping the Wiki's pages up to date from a session,
   through tools/forum-bot.mjs, never through a browser. Every request is signed
   with CB_FORUM_BOT_KEY (x-stimpunks-signature: t=…,v1=…, an HMAC-SHA256 of
   "t.body", the office intake's shape), checked before the body is read as
   anything, and good for five minutes. POST, JSON:
     { action: 'cats' }                            where the bot may write
     { action: 'list', cat }                       the topics in one of those
     { action: 'read', id }                        a page: its title and words
     { action: 'start', cat, title, body, tags? }  a new page
     { action: 'edit', id, body, title? }          a page's words, and its title
     { test: true }                                whether the bot is open
   Only in the Wiki and in Team Docs, always under its own name
   marked BOT, and telling nobody. See ../cb/lib.mjs, the Wiki's bot. */
import { forumBotReady, forumBotSigned, forumBot, json, FORUM_BOT_MAX } from '../cb/lib.mjs';

// Never for search engines, and never cached anywhere.
const QUIET = { 'x-robots-tag': 'noindex', 'cache-control': 'no-store' };

export default async (req) => {
  if (!forumBotReady()) return json(503, { error: 'The bot is shut: its key or the staff key is not set.' }, QUIET);
  const raw = await req.text();
  if (raw.length > FORUM_BOT_MAX) return json(413, { error: 'That is too long.' }, QUIET);
  if (!forumBotSigned(req.headers.get('x-stimpunks-signature'), raw)) return json(401, { error: 'Not signed with the bot’s key, or signed too long ago.' }, QUIET);
  let b;
  try { b = JSON.parse(raw); } catch (e) { return json(400, { error: 'Not JSON.' }, QUIET); }
  if (b && b.test === true) return json(200, { ok: true, open: true }, QUIET);
  try {
    const r = await forumBot(b);
    if (r.error) return json(400, { error: r.error }, QUIET);
    return json(200, { ok: true, ...r }, QUIET);
  } catch (e) {
    return json(503, { error: 'The forums are busy just now. Try again in a moment.' }, QUIET);
  }
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/forum/bot',
  method: ['POST'],
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
