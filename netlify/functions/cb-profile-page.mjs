/* A profile's own page, profile.html#<username> (Helen Edgar's question, Ryan's
   calls, 2026-10-26): POST /cb/profile/page { handle }, with a pass or without
   one. Without one, it answers only for a card its owner opened to the public,
   and { handle, open: false } for every other handle, whatever the reason, so
   nobody signed off can tell which usernames exist. With a pass it answers as
   the radio's profile does. Never props, a chat status or a way to message
   them: those are the community's, on the radio. profilePage in
   netlify/cb/lib.mjs; privacy.html#public-profiles. Nothing about who asked
   is kept, and the handle travels in the body rather than the address, so it
   is in no request log. */
import { readPass, profilePage, cleanHandle, json, body, sameSite } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This page only answers stimpunks.world.' });
  // A pass that no longer reads is somebody signed off, and is answered so.
  const who = await readPass(req);
  const b = (await body(req)) || {};
  const handle = cleanHandle(b.handle);
  if (!handle) return json(400, { error: 'Whose profile?' });
  try {
    const got = await profilePage(handle, who || null);
    return json(200, got ? { open: true, signedOn: !!who, ...got } : { handle, open: false, signedOn: !!who }, NOINDEX);
  } catch (e) {
    return json(503, { error: 'That profile could not be read just now. Try again in a moment.' });
  }
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/profile/page',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
