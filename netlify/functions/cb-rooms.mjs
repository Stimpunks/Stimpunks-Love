/* The rooms a pass may enter that the street's public list does not name: the
   forums' categories (Ryan's calls, 2026-10-21), each a room on the CB under
   forum-<slug>, named only to the people who can read the category, so they
   are kept out of /cb-rooms.json, which anybody can fetch. A claimed username
   is told the rooms of every category it may read, by forumRooms() in lib.mjs;
   anybody else is told none. The radio asks once a page, while it is on, to
   name these rooms in #tags, the teleporter, Who's online and Unreads. Nothing
   records who asked. */
import { readPass, forumRooms, json, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The CB only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  return json(200, { rooms: forumRooms(who) }, { 'x-robots-tag': 'noindex' });
};

export const config = {
  path: '/cb/rooms',
  method: 'GET',
  rateLimit: { windowLimit: 40, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
