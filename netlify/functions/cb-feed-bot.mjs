/* The feed bot: every quarter of an hour, read every wire on The Feed's boards
   and every spring on The Source's terraces, and say each new item on that
   room's CB channel, once, as a message from the room. Followers of the room
   by name are told. Nothing is said the first time a wire is read. See
   ../cb/lib.mjs, The feed bot. */
import { runFeedBot } from '../cb/lib.mjs';

export default async () => {
  await runFeedBot();
};

export const config = { schedule: '*/15 * * * *' };
