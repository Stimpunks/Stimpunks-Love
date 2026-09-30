/* The CB: the sweep. Runs every hour and deletes the channel once its day is
   over in Colorado. Hourly rather than once at a fixed time because midnight in
   Denver is 06:00 UTC for half the year and 07:00 for the other half, and a
   daily cron would be an hour late for one of them. A read never returns
   yesterday's messages either way; this is what makes them actually gone.
   The chalkboard's week, and every pebble bowl's, is swept on the same hour,
   and so is the Slake: stale presence, and every place's talk from yesterday.
   So are the rooms' Be seen here records and the calls' lists of who is in them. */
import { sweep, sweepRoomTalk, sweepChalk, sweepPebbles, sweepSlake, sweepBeacons, sweepImages, sweepSeen, sweepCalls } from '../cb/lib.mjs';

export default async () => {
  await sweep();
  await sweepRoomTalk(); // and every room's own channel, the same day's rule
  await sweepChalk();   // and the chalkboard, anything on it past its week
  await sweepPebbles(); // and the pebble bowls, the same
  await sweepSlake();   // and the Slake: nobody left standing, nothing said yesterday
  await sweepBeacons(); // and every host's beacon nobody has heard from
  await sweepImages();  // and every picture no live message holds, after the channels
  await sweepSeen();    // and anybody still marked as seen in a room who has gone quiet
  await sweepCalls();   // and anybody 8x8 never said had left a call, once no token could still hold
};

export const config = { schedule: '@hourly' };
