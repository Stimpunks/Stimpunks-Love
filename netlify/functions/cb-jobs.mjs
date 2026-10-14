/* Your jobs at the Adventurer's Guild, kept in the CB's Profile. GET with a
   pass says whether they are being kept, which, and whether they are shown.
   POST { keep: true, done: [ids] } starts keeping them, with the stamps the
   board already has; POST { done: [ids] } keeps more, and only while keeping is
   on; POST { keep: false } stops, which deletes them and whether they are
   shown; POST { show: true | false } shows them to people on the CB, or not,
   and only a claimed username can. Nothing about when is sent or kept, and a
   handle is not an account: whoever signs on with an unclaimed one has these
   jobs too, and Profile says so. */
import { readPass, petKey, readJobs, keepJobs, forgetJobs, questIds, setJobsShown, jobsShown, json, body, sameSite } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const pk = petKey(who.handle);
  const claimed = !!who.account;
  try {
    if (req.method === 'POST') {
      const b = (await body(req)) || {};
      if (typeof b.show === 'boolean') {
        if (!claimed) return json(403, { error: 'Claim your username first: an unclaimed handle is anybody’s who signs on with it, so it cannot show jobs on anybody’s behalf.' });
        return json(200, { shown: await setJobsShown(who.handle, b.show) }, NOINDEX);
      }
      if (b.keep === false) {
        await forgetJobs(pk);
        return json(200, { keeping: false, jobs: [], shown: false, claimed }, NOINDEX);
      }
      const ids = questIds(b.done === undefined ? [] : b.done);
      if (!ids) return json(400, { error: 'That is not a job on the board.' });
      const jobs = await keepJobs(pk, ids, b.keep === true);
      if (!jobs) return json(409, { error: 'Your jobs are not being kept in your Profile, so nothing was sent to keep.', keeping: false }, NOINDEX);
      return json(200, { keeping: true, jobs, shown: claimed && await jobsShown(who.handle), claimed }, NOINDEX);
    }
    const jobs = await readJobs(pk);
    return json(200, { keeping: !!jobs, jobs: jobs || [], shown: claimed && !!jobs && await jobsShown(who.handle), claimed }, NOINDEX);
  } catch (e) {
    return json(503, { error: 'That did not work just now. Try again in a moment.' });
  }
};

/* Netlify counts the tries per address and never tells us the address. */
export const config = {
  path: '/cb/jobs',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
