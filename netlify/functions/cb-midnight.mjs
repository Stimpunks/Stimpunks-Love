/* The CB: the sweep. Runs every hour and deletes the channel once its day is
   over in Colorado. Hourly rather than once at a fixed time because midnight in
   Denver is 06:00 UTC for half the year and 07:00 for the other half, and a
   daily cron would be an hour late for one of them. A read never returns
   yesterday's messages either way; this is what makes them actually gone.
   The chalkboard's week, and every pebble bowl's, is swept on the same hour. */
import { sweep, sweepChalk, sweepPebbles } from '../cb/lib.mjs';

export default async () => {
  await sweep();
  await sweepChalk();   // and the chalkboard, anything on it past its week
  await sweepPebbles(); // and the pebble bowls, the same
};

export const config = { schedule: '@hourly' };
