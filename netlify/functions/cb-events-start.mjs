/* Events: telling a start. Runs every five minutes and tells each device that
   asked about an event it is interested in when that event is about to start,
   up to five minutes before, or up to fifteen after if a run was missed, and
   each start once. Only the devices that switched on When an event I'm
   interested in starts, as somebody on that event's list. See ../cb/lib.mjs,
   tellEventsStarting and notifyEventStart. */
import { tellEventsStarting } from '../cb/lib.mjs';

export default async () => {
  await tellEventsStarting();
};

export const config = { schedule: '*/5 * * * *' };
