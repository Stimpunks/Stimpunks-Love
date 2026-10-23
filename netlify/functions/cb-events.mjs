/* Events on the CB (Ryan's ask and calls, 2026-10-23, after Discord's
   Scheduled Events). POST only, with a claimed username's pass:
     {}                                            every event you can see, the soonest first
     { action: 'make', title, about, room, at, away?, date, time, zone, mins, repeat }
                                                   schedule one; you are interested in it from the start
     { action: 'edit', id, …the same }             change one you made, or any, as a moderator
     { action: 'remove', id }                      cancel it, every time it would happen
     { action: 'skip', id, at }                    cancel one time a repeating event would happen
     { action: 'keen', id, on }                    say you are interested, or take it back
   Every answer is the list again, so the radio draws what is true now. An
   event in a room is seen by whoever may go into the room, one on World by
   everybody signed on. Who is interested is names and never how many. Nothing
   a person types is logged. See ../cb/lib.mjs, events, and privacy.html#events. */
import { readPass, forumReader, loadMods, eventsFor, eventRooms, makeEvent, editEvent, removeEvent, skipEvent, keenEvent, notifyEventNew,
  eventId, json, body, sameSite } from '../cb/lib.mjs';

// Every answer asks search engines not to index or archive it, as privacy.html#events says.
const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'Events only answer stimpunks.world.' });
  const mods = await loadMods();
  const who = await readPass(req, mods);
  if (!who) return json(401, { error: 'signed off' });
  if (!forumReader(who)) return json(403, { error: 'Events are for a claimed username.' });
  const b = (await body(req)) || {};
  try {
    let r = null;
    const id = eventId(b.id);
    if (!b.action || b.action === 'list') r = {};
    else if (b.action === 'make') r = await makeEvent(who, b);
    else if (b.action === 'edit') r = await editEvent(who, id, b);
    else if (b.action === 'remove') r = await removeEvent(who, id);
    else if (b.action === 'skip') r = await skipEvent(who, id, Number(b.at));
    else if (b.action === 'keen') r = await keenEvent(who, id, b.on === true);
    else return json(400, { error: 'Do what with it?' }, NOINDEX);
    if (r.error) return json(400, { error: r.error, events: await eventsFor(who), me: eventRooms(who), now: Date.now() }, NOINDEX);
    // A new event tells the devices that asked, before the answer goes, so the
    // function is not stopped halfway through telling them.
    if (b.action === 'make' && r.event) { try { await notifyEventNew(r.event, undefined, mods); } catch (e) { /* the event is up whether or not anybody was told */ } }
    return json(200, { events: await eventsFor(who), me: eventRooms(who), id: r.event ? r.event.id : null, now: Date.now() }, NOINDEX);
  } catch (e) {
    return json(503, { error: 'Events are busy. Try again in a moment. Nothing was changed.' }, NOINDEX);
  }
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/events',
  method: ['POST'],
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
