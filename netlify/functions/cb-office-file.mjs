/* The office's pictures and files: on a contact, a grant request or a case,
   and on any comment in the office. Ryan's ask, 2026-10-27, "uniformly across
   the office", the same way Tasks and the forums take them.
     POST, by query (uploadRequest in lib.mjs, the one way every place takes them):
       kind=pic | kind=file&name=     one picture, or a file of a part or less
       kind=file&name=&size=&parts=   a bigger file's first part
       up=<id>&part=<n>, up=<id>&done=1   its other parts, then done, when the whole is checked
   with the pass of somebody the office lets in: put up for a record or a
   comment they are about to attach it to, answering its id. One nothing
   takes is swept after a day.
     GET ?r=<record>&f=<id>[&part=<n>]   one held by that record or a comment on it,
                                     a file in parts a part at a time
   Sealed with the office's own key, and shut without it. There is no public
   address. A file is always sent to be saved, never shown, and a picture only
   as a picture. Nothing a person sends, and nothing about anybody in the
   office, is logged. */
import { officeReady, readPass, officeAllow, uploadRequest, fileAnswer, officeFile, json, sameSite, FORUM_FILE_MAX } from '../cb/lib.mjs';

const QUIET = { 'x-robots-tag': 'noindex' };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The office only answers stimpunks.world.' }, QUIET);
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' }, QUIET);
  if (!officeAllow(who)) return json(403, { error: 'The office is for our directors, board members and administrators.' }, QUIET);
  // Sealed at rest with CB_OFFICE_KEY: without it, shut rather than written in the clear.
  if (!officeReady()) return json(503, { error: 'The office is shut: its key is not set, so nothing in it can be opened.' }, QUIET);
  const url = new URL(req.url);
  if (req.method === 'GET') {
    const got = await officeFile(who, url.searchParams.get('r'), url.searchParams.get('f'), undefined, url.searchParams.get('part'));
    if (!got) return json(404, { error: 'That has been taken off, or what held it has been deleted.' }, QUIET);
    if (!got.data) return json(400, { error: 'That file comes a part at a time.', parts: got.parts }, QUIET);
    return fileAnswer(got, QUIET);
  }
  const len = Number(req.headers.get('content-length') || 0);
  if (len > FORUM_FILE_MAX) return json(413, { error: 'That is more than one request can carry. Add it again.' }, QUIET);
  let bytes;
  try { bytes = new Uint8Array(await req.arrayBuffer()); } catch (e) { return json(400, { error: 'There was nothing in that.' }, QUIET); }
  try {
    const r = await uploadRequest('office', who, url, bytes);
    return json(r.status, r.body, QUIET);
  } catch (e) {
    return json(503, { error: 'The office is busy just now. Try again in a moment.' }, QUIET);
  }
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/office/file',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
