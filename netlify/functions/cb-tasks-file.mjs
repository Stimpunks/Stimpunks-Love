/* Tasks' pictures and files. Ryan's ask, 2026-10-27.
     POST ?kind=pic                  a picture, already redrawn in the sender's browser
     POST ?kind=file&name=           a file, as it is, checked by its first bytes
   with the pass of somebody who reads Tasks: put up for a task they are about
   to attach it to ({ action: 'attach' } on /cb/tasks), answering its id. One
   no task takes is swept after a day.
     GET ?t=<task>&f=<id>            one held by a task, for a reader of Tasks
   and for nobody else: there is no public address. A file is always sent to
   be saved, never shown, and a picture only as a picture. Nothing a person
   sends is logged. See ../cb/lib.mjs, tasks. */
import { staffReady, readPass, tasksAllow, putTaskUpload, taskFile, json, sameSite, FORUM_FILE_MAX } from '../cb/lib.mjs';

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
    const got = await taskFile(who, url.searchParams.get('t'), url.searchParams.get('f'));
    if (!got) return json(404, { error: 'That has been taken off its task, or its task has been deleted.' }, QUIET);
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
    const r = await putTaskUpload(who, { kind: url.searchParams.get('kind'), name: url.searchParams.get('name') }, bytes);
    if (r.error) return json(400, { error: r.error }, QUIET);
    const out = { id: r.id, kind: r.kind, type: r.type, size: r.size };
    if (r.name) out.name = r.name;
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
