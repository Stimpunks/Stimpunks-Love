/* Your chat status, for the radio's Who's around (Ryan's ask, 2026-10-24): one
   of the interaction badges, come say hi, people i know or not right now, or
   none. POST { chat: id | '' } with a pass chooses it and answers { chat }.
   Only a claimed username has one, because an unclaimed handle is anybody's
   who signs on with it. Your own is read back on the radio's ask of
   /cb/unread, and everybody else's travels with Who's online, Be seen here,
   their profile and a conversation with them. Nothing about when it was chosen
   is kept, and nothing about who looked. See setChatStatus in ../cb/lib.mjs. */
import { readPass, forumReader, setChatStatus, petKey, json, body, sameSite } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The CB only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  if (!forumReader(who)) return json(403, { error: 'Claim your username first, under Account on this radio: an unclaimed handle is anybody’s who signs on with it.' }, NOINDEX);
  const b = (await body(req)) || {};
  try {
    const r = await setChatStatus(petKey(who.handle), b.chat);
    if (r.error) return json(400, { error: 'The street does not know that chat status.' }, NOINDEX);
    return json(200, r, NOINDEX);
  } catch (e) {
    return json(503, { error: 'That did not work just now. Nothing changed; try again in a moment.' }, NOINDEX);
  }
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/chat-status',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
