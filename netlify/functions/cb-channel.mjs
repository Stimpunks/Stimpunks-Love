/* The CB: listening. The radio asks this every few seconds while it is open on
   somebody's screen with the tab in front, and never otherwise. */
import { readPass, readChannel, shape, json } from '../cb/lib.mjs';

export default async (req) => {
  const who = readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const ch = await readChannel();
  return json(200, { day: ch.day, messages: shape(ch.messages) });
};

export const config = {
  path: '/cb/channel',
  method: 'GET',
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
