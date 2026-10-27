/* Tasks' pictures and files. Ryan's ask, 2026-10-27.
     POST ?kind=pic                  a picture, already redrawn in the sender's browser
     POST ?kind=file&name=           a file of TASK_PART or less, as it is, checked by its first bytes
     POST ?kind=file&name=&size=&parts=   a bigger file's first part, TASK_PART exactly
     POST ?up=<id>&part=<n>          its part n, in any order
     POST ?up=<id>&done=1            every part sent: the whole file checked as any file is
   with the pass of somebody who reads Tasks: put up for a task they are about
   to attach it to ({ action: 'attach' } on /cb/tasks), answering its id. One
   no task takes is swept after a day. A file is TASK_FILE_MAX at most, and
   no request or answer carries more than a part, because Netlify refuses a
   request over about 6 MB before any function sees it.
     GET ?t=<task>&f=<id>[&part=<n>] one held by a task or a comment on it, for a reader of Tasks;
                                     a file in parts comes a part at a time
   and for nobody else: there is no public address. A file is always sent to
   be saved, never shown, and a picture only as a picture. Nothing a person
   sends is logged. See ../cb/lib.mjs, tasks. */
import { staffReady, readPass, tasksAllow, putTaskUpload, startTaskParts, putTaskPart, finishTaskParts, taskFile, json, sameSite, FORUM_FILE_MAX } from '../cb/lib.mjs';

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
    if (!got) return json(404, { error: 'That has been taken off its task, or its task has been deleted.' }, QUIET);
    if (!got.data) return json(400, { error: 'That file comes a part at a time.', parts: got.parts }, QUIET);
    const pic = got.file.kind === 'pic';
    const headers = {
      ...QUIET,
      'content-type': pic ? got.file.type : 'application/octet-stream',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      // Even opened on its own, nothing in it can run as a page of ours.
      'content-security-policy': "default-src 'none'; sandbox",
    };
    if (!pic) headers['content-disposition'] = `attachment; filename*=UTF-8''${encodeURIComponent(got.file.name)}`;
    return new Response(got.data, { status: 200, headers });
  }
  const len = Number(req.headers.get('content-length') || 0);
  if (len > FORUM_FILE_MAX) return json(413, { error: `A file is ${FORUM_FILE_MAX / 1000000} MB at most.` }, QUIET);
  let bytes;
  try { bytes = new Uint8Array(await req.arrayBuffer()); } catch (e) { return json(400, { error: 'There was nothing in that.' }, QUIET); }
  try {
    const q = (k) => url.searchParams.get(k);
    let r;
    if (q('up') && q('done')) r = await finishTaskParts(who, q('up'));
    else if (q('up')) r = await putTaskPart(who, q('up'), q('part'), bytes);
    else if (q('parts')) r = await startTaskParts(who, { name: q('name'), size: q('size'), parts: q('parts') }, bytes);
    else r = await putTaskUpload(who, { kind: q('kind'), name: q('name') }, bytes);
    if (r.error) return json(400, { error: r.error }, QUIET);
    const out = { id: r.id };
    for (const k of ['kind', 'type', 'size', 'name', 'parts', 'n']) if (r[k] != null) out[k] = r[k];
    return json(200, out, QUIET);
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
