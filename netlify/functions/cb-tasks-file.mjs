/* Tasks' pictures and files, on a task or a comment under it. Ryan's asks, 2026-10-27.
     POST, by query (uploadRequest in lib.mjs, the one way every place takes them):
       kind=pic | kind=file&name=     one picture, or a file of a part or less
       kind=file&name=&size=&parts=   a bigger file's first part
       up=<id>&part=<n>, up=<id>&done=1   its other parts, then done, when the whole is checked
   with the pass of somebody who reads Tasks: put up for a task or comment
   they are about to attach it to, answering its id. One nothing takes is
   swept after a day. A file is FILE_MAX at most, and no request or answer
   carries more than a part, because Netlify refuses a request over about
   6 MB before any function sees it.
     GET ?t=<task>&f=<id>[&part=<n>]   one held by a task or a comment on it, for a reader of Tasks;
                                     a file in parts comes a part at a time
   There is no public address. A file is always sent to be saved, never shown,
   and a picture only as a picture. Nothing a person sends is logged. */
import { staffReady, readPass, tasksAllow, uploadRequest, fileAnswer, taskFile, json, sameSite, FORUM_FILE_MAX } from '../cb/lib.mjs';

const QUIET = { 'x-robots-tag': 'noindex' };

export default async (req) => {
  // Sealed at rest with CB_STAFF_KEY (lib.mjs): without it, shut rather than written in the clear.
  if (!staffReady()) return json(503, { error: 'Tasks are shut just now. Nothing was read or changed.' });
  if (!sameSite(req)) return json(403, { error: 'Tasks only answer stimpunks.world.' }, QUIET);
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' }, QUIET);
  if (!tasksAllow(who)) return json(403, { error: 'Tasks are for our directors, board members and administrators.' }, QUIET);
  const url = new URL(req.url);
  if (req.method === 'GET') {
    const got = await taskFile(who, url.searchParams.get('t'), url.searchParams.get('f'), undefined, url.searchParams.get('part'));
    if (!got) return json(404, { error: 'That has been taken off, or its task has been deleted.' }, QUIET);
    if (!got.data) return json(400, { error: 'That file comes a part at a time.', parts: got.parts }, QUIET);
    return fileAnswer(got, QUIET);
  }
  const len = Number(req.headers.get('content-length') || 0);
  if (len > FORUM_FILE_MAX) return json(413, { error: 'That is more than one request can carry. Add it again.' }, QUIET);
  let bytes;
  try { bytes = new Uint8Array(await req.arrayBuffer()); } catch (e) { return json(400, { error: 'There was nothing in that.' }, QUIET); }
  try {
    const r = await uploadRequest('task', who, url, bytes);
    return json(r.status, r.body, QUIET);
  } catch (e) {
    return json(503, { error: 'Tasks are busy just now. Try again in a moment.' }, QUIET);
  }
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/tasks/file',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
