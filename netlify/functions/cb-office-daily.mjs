/* The office, each night: what was open (officeNightly in ../cb/lib.mjs), kept
   late in the evening in Colorado so a night's line is how the day ended, and
   then our QuickBooks books read (officeQuickBooks), if the office is
   connected, and Givebutter (officeGivebutter), if its key is set. Netlify keeps the schedule in UTC: 05:50 is 23:50 in Colorado's
   summer and 22:50 in its winter. It answers nobody, and one failing never
   stops the other. */
import { officeNightly, officeQuickBooks, officeGivebutter } from '../cb/lib.mjs';

export default async () => {
  await officeNightly().catch(() => null);
  await officeQuickBooks().catch(() => null);
  await officeGivebutter().catch(() => null);
};

export const config = { schedule: '50 5 * * *' };
