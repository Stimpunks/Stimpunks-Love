/* The CB: the sweep. Runs every hour and takes every message past its 48
   hours off the World channel, keeping the rest. Its name is older than that:
   until 2026-10-18 it deleted the channel at midnight in Colorado. A read
   never returns a message past its two weeks either way; this is what makes
   them actually gone.
   The chalkboard's week, every pebble bowl's and Pando Calrissian's fence's
   are swept on the same hour (the tree's own count never is),
   and so is the Slake: stale presence, and what was said at every place past
   its two weeks.
   So are the rooms' Be seen here records and the calls' lists of who is in them,
   and the forums: every topic past its category's keep, and everything in it,
   and direct messages: each past its two weeks, a conversation once nothing is
   left in it, and a report on the moderators' desk past its thirty days.
   And every event with no time left to happen in, which a read never shows
   anyway, and the record of which starts were told, after a day.
   And every Tasks blob written before the staff key, sealed. */
import { sweep, sweepRoomTalk, sweepChalk, sweepPebbles, sweepFence, fileFridge, finishAllAdoptions, sweepSlake, sweepBeacons, sweepImages, sweepSeen, sweepCalls, sweepBrassImages, sweepSuggestImages, sweepForum, sweepTaskFiles, sweepOfficeFiles, sweepDms, sweepEvents, sealStaffLeftovers } from '../cb/lib.mjs';

export default async () => {
  await sweep();
  await sweepRoomTalk(); // and every room's own channel, the same two weeks
  await sweepChalk();   // and the chalkboard, anything on it past its week
  await sweepPebbles(); // and the pebble bowls, the same
  await sweepFence();   // and Pando Calrissian's fence, the same; the tree's count is never swept
  await fileFridge();   // and the Fridge of Sighs: anything left past the door goes into its drawer, never away
  await finishAllAdoptions(); // and any adoption stopped halfway: into its person's pets and the forever list
  await sweepSlake();   // and the Slake: nobody left standing, nothing said past its two weeks
  await sweepBeacons(); // and every host's beacon nobody has heard from
  await sweepImages();  // and every picture no live message holds, after the channels
  await sweepBrassImages();  // and every board picture no post holds, a day after it was put up
  await sweepSuggestImages(); // and every picture nothing in the suggestion box holds, a day after it was added
  await sweepSeen();    // and anybody still marked as seen in a room who has gone quiet
  await sweepCalls();   // and anybody 8x8 never said had left a call, once no token could still hold
  await sweepForum();   // and every forum topic past its category's keep, with everything in it
  await sweepTaskFiles(); // and every task upload no task took within a day, and any file its task let go of
  await sweepOfficeFiles(); // and the office's the same, only with its key
  await sweepDms();     // and every direct message past its two weeks, its conversation once empty, and old reports
  await sweepEvents();  // and every event that has been and gone, and which starts were told, after a day
  await sealStaffLeftovers(); // and every Tasks blob written before the staff key, sealed now
};

export const config = { schedule: '@hourly' };
