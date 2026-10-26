/* Tasks: recurring tasks. Runs every hour and makes every task a switched-on
   recurring task owes, on its day by the street's clock (Colorado's), moving
   each one's next day on. Opening the list does the same, so this is what makes
   them when nobody is looking. It makes nothing twice. See ../cb/lib.mjs,
   recurring tasks. */
import { makeRecurring, staffReady } from '../cb/lib.mjs';

export default async () => {
  // Tasks are sealed (CB_STAFF_KEY): without the key nothing is made, rather than written in the clear.
  if (!staffReady()) return;
  await makeRecurring();
};

export const config = { schedule: '@hourly' };
