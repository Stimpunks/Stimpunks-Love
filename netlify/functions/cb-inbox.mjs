/* The radio's Inbox, after Discord's (a request from our community,
   2026-10-29): its Mentions, Bookmarks and Reminders, for a claimed username.
   Unreads is /cb/unread's. A POST with a pass:
     { view: 'mentions' }              { channel, forum }: where you have been
                                       @mentioned, worked out now, kept nowhere
     {} or { view: 'saved' }           { saved, remind }: your bookmarks and
                                       reminders, each read off its channel now
     { save: { room, id }, on }        bookmark a message, or take it off (on
                                       true or false; neither turns it over)
     { remind: { room, id }, due }     remind me about a message at due
     { done: r }                       a reminder done with, or taken back
   room is a room's tag, or world. See the Inbox in ../cb/lib.mjs. */
import { readPass, forumReader, inboxMentions, inboxSaved, bookmark, remindMe, reminderDone, WORLD_CALL, json, body, sameSite } from '../cb/lib.mjs';

// Every answer asks search engines not to index or archive it.
const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };
const SAID = {
  which: 'That message is not on a channel you can hear.',
  gone: 'That message is no longer on the channel.',
  full: 'Your Inbox is full: take off a bookmark or a reminder you are done with first.',
  when: 'A reminder has to be in the future, and within a year.',
};

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  if (!forumReader(who)) return json(403, { error: 'The Inbox is for a claimed username: claim yours under Account on this radio.' }, NOINDEX);
  const b = (await body(req)) || {};
  const room = (w) => (w && w.room === 'world' ? WORLD_CALL : w && w.room);
  try {
    let r;
    if (b.save) r = await bookmark(who, room(b.save), b.save.id, typeof b.on === 'boolean' ? b.on : undefined);
    else if (b.remind) r = await remindMe(who, room(b.remind), b.remind.id, b.due);
    else if (b.done !== undefined) r = await reminderDone(who, b.done);
    else if (b.view === 'mentions') r = await inboxMentions(who);
    else r = await inboxSaved(who);
    if (r && r.error) return json(r.error === 'full' ? 409 : 400, { error: SAID[r.error] || 'Which message?' }, NOINDEX);
    return json(200, r, NOINDEX);
  } catch (e) {
    return json(503, { error: 'busy' }, NOINDEX);
  }
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/inbox',
  method: 'POST',
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
