/* The moderators' desk's reported messages: POST /cb/dm/reports with a base
   pass.
     {}               every report waiting, newest first
     { close: id }    close one, which deletes it, and its picture's copy
     { picture: id }  a reported picture, shown when a moderator presses for it
   A report is the one way a direct message reaches the moderators: one of the
   two people in a conversation copied a message the other sent them here, with
   an optional note. Nothing else about any conversation is ever shown to
   anybody but the two people in it, and no moderator can read one. A report is
   deleted when a moderator closes it, or after thirty days. */
import { readPass, readReports, closeReport, reportImage, REPORT_DAYS, json, body, sameSite } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The desk only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  if (who.role !== 'base') return json(403, { error: 'The desk is for moderators signed on as the base.' });
  const b = (await body(req)) || {};
  try {
    if (typeof b.picture === 'string') {
      const got = await reportImage(who, b.picture);
      if (!got) return json(404, { error: 'That picture is not on the desk any more.' }, NOINDEX);
      return new Response(got.data, {
        status: 200,
        headers: { 'content-type': got.type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...NOINDEX },
      });
    }
    if (typeof b.close === 'string') {
      const r = await closeReport(who, b.close);
      if (r.error) return json(404, { error: 'That report is not on the desk any more.' });
    }
    return json(200, { reports: await readReports(who), days: REPORT_DAYS }, NOINDEX);
  } catch (e) {
    return json(503, { error: 'That did not work just now. Nothing changed; try again in a moment.' });
  }
};

export const config = {
  path: '/cb/dm/reports',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
