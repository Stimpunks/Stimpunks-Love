/* The Slake: being seen at a place, and seeing who else is. The MUD Room asks
   this every few seconds, and only while somebody signed on to the CB has
   chosen to be seen and has the tab in front. One call does both halves,
   because they are one act: being seen is what lets you see, and anybody
   answering this is visible to the people it tells them about. */
import { readPass, mudPlace, mudVisit, beHere, readTalk, shape, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The Slake only answers stimpunks.world.' });
  const who = readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  const place = mudPlace(b.place);
  const visit = mudVisit(b.visit);
  if (!place || !visit) return json(400, { error: 'That is not a place on the Slake.' });
  const others = await beHere(who, place, visit);
  const talk = await readTalk(place);
  return json(200, { place, others, day: talk.day, messages: shape(talk.messages) });
};

export const config = {
  path: '/cb/mud/here',
  method: 'POST',
  rateLimit: { windowLimit: 40, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
