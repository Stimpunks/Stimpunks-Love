/* The Inbox's reminders: telling one that has come due. Runs every five
   minutes and tells each person's own devices, once, about each reminder of
   theirs whose time has come, on devices that have not switched When a
   reminder I set comes due off. See ../cb/lib.mjs, tellReminders and
   notifyReminder. */
import { tellReminders } from '../cb/lib.mjs';

export default async () => {
  await tellReminders();
};

export const config = { schedule: '*/5 * * * *' };
