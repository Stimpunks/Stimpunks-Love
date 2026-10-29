/* Your availability, for the radio's Who's around (Ryan's ask, 2026-10-29):
   available, busy, away, do not disturb or out of office, each with a line of
   your own words, or not shown. POST { avail: id | '', note } with a pass
   chooses it and answers { avail, note }. Only a claimed username has one,
   because an unclaimed handle is anybody's who signs on with it. Your own is
   read back on the radio's ask of /cb/unread; everybody else's travels with
   Who's online, Be seen here, their profile, a conversation with them, and
   Tasks' and the office's people. Nothing about when it was chosen is kept,
   and nothing changes it but you. See setAvailability in ../cb/lib.mjs. */
import { readPass, forumReader, setAvailability, petKey, AVAIL_NOTE_MAX, json, body, sameSite } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The CB only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  if (!forumReader(who)) return json(403, { error: 'Claim your username first, under Account on this radio: an unclaimed handle is anybody’s who signs on with it.' }, NOINDEX);
  const b = (await body(req)) || {};
  try {
    const r = await setAvailability(petKey(who.handle), b.avail, b.note);
    if (r.error === 'which') return json(400, { error: 'The street does not know that availability.' }, NOINDEX);
    if (r.error === 'note') return json(400, { error: `Your line is one line of at most ${AVAIL_NOTE_MAX} characters.` }, NOINDEX);
    return json(200, r, NOINDEX);
  } catch (e) {
    return json(503, { error: 'That did not work just now. Nothing changed; try again in a moment.' }, NOINDEX);
  }
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/availability',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
