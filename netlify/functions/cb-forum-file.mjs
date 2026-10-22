/* The forums' pictures and files. Ryan's call, 2026-10-18.
     POST ?kind=pic                  a picture, already redrawn in the writer's browser
     POST ?kind=file&name=           a file, as it is, checked by its first bytes
   with a claimed username's pass: put up for a post the writer is about to
   make, answering its id. One no post takes is swept after a day.
     GET ?t=<topic>&f=<id>           one held by a post in a topic the reader can read
   with the pass, and for nobody else: there is no public address. A file is
   always sent to be saved, never shown, and a picture only as a picture.
   Nothing a person sends is logged. See ../cb/lib.mjs, the forums. */
import { readPass, forumReader, putForumUpload, forumFile, json, sameSite, FORUM_FILE_MAX } from '../cb/lib.mjs';

const QUIET = { 'x-robots-tag': 'noindex' };
const CLAIM = 'The forums are for claimed usernames. Claim yours under Account on the radio, then come back.';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The forums only answer stimpunks.world.' }, QUIET);
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' }, QUIET);
  if (!forumReader(who)) return json(403, { error: CLAIM, claim: true }, QUIET);
  const url = new URL(req.url);
  if (req.method === 'GET') {
    const got = await forumFile(who, url.searchParams.get('t'), url.searchParams.get('f'));
    if (!got) return json(404, { error: 'That has gone with its post, or is not one you can read.' }, QUIET);
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
    const r = await putForumUpload(who, { kind: url.searchParams.get('kind'), name: url.searchParams.get('name') }, bytes);
    if (r.error) return json(400, { error: r.error }, QUIET);
    const out = { id: r.id, kind: r.kind, type: r.type, size: r.size };
    if (r.name) out.name = r.name;
    return json(200, out, QUIET);
  } catch (e) {
    return json(503, { error: 'The forums are busy just now. Try again in a moment.' }, QUIET);
  }
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/forum/file',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
