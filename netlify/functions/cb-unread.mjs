/* What is new to you on the CB, for a claimed username (Ryan, 2026-10-20). A
   POST with a pass:
     {}                          { latest, read, dms, asking }: every channel's
                                 newest message time you may hear, when you
                                 last read each, the conversations with
                                 something new from the other person, and
                                 whether a first message waits for you
     { read: { ch: tag }, t }    you have read that channel (a room's tag, or
                                 world) up to t
     { read: { dm: handle }, t } you have read that conversation up to t
   The radio asks from inside listen() and nowhere else, and only while it is
   open. Marks, never numbers: nothing here is counted, and nobody but you is
   ever sent what you have read. See newFor and markRead in ../cb/lib.mjs.
   The {} answer also carries your own chat status, `chat` (2026-10-24), so a
   badge chosen on another device reaches this radio by its next ask without a
   request of its own; it is chosen at /cb/chat-status. And `due` (2026-10-29),
   whether a reminder of yours has come due, so the Inbox can be marked: yes or
   no, never how many. */
import { readPass, forumReader, newFor, markRead, chatStatusOf, remindersDue, petKey, json, body, sameSite } from '../cb/lib.mjs';

// Every answer asks search engines not to index or archive it.
const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  if (!forumReader(who)) return json(403, { error: 'Claim your username, under Account on this radio, and the radio marks what is new to you.' }, NOINDEX);
  const b = (await body(req)) || {};
  try {
    if (b.read !== undefined) {
      const r = await markRead(who, b.read, b.t);
      if (r.error === 'full') return json(409, { error: 'full' }, NOINDEX);
      if (r.error) return json(400, { error: 'Which channel or conversation?' }, NOINDEX);
      return json(200, { read: true }, NOINDEX);
    }
    return json(200, { ...(await newFor(who)), chat: await chatStatusOf(petKey(who.handle)), due: await remindersDue(who) }, NOINDEX);
  } catch (e) {
    return json(503, { error: 'busy' }, NOINDEX);
  }
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/unread',
  method: 'POST',
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
