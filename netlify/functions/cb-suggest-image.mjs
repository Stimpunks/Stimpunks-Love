/* A picture in the suggestion box in The Sandbox. GET ?id= is the picture, for
   anybody, because the box is for anybody, but only while a suggestion or an
   answer in the box holds it: one added and never dropped in is never shown,
   and one taken down is gone at once. POST, with a pass, adds one, already
   redrawn in the sender's browser, and answers its id; the suggestion or the
   answer that carries it is sent afterwards. One nothing holds is swept after
   a day. Nothing a person sends is logged. See ../cb/lib.mjs, the suggestion
   box. */
import { readPass, putSuggestImage, getSuggestImage, json, sameSite, IMG_MAX } from '../cb/lib.mjs';

// Readable by anybody, and not for search engines, like the box's words.
const QUIET = { 'x-robots-tag': 'noindex' };

export default async (req) => {
  const url = new URL(req.url);
  if (req.method === 'GET') {
    const got = await getSuggestImage(url.searchParams.get('id'));
    if (!got) return json(404, { error: 'That picture is not in the box.' }, QUIET);
    // Kept in the viewer's own browser for ten minutes and in no shared cache,
    // so a picture taken down stops being shown soon after.
    return new Response(got.data, {
      status: 200,
      headers: { 'content-type': got.meta.type, 'cache-control': 'private, max-age=600', 'x-content-type-options': 'nosniff', ...QUIET },
    });
  }
  if (!sameSite(req)) return json(403, { error: 'This box only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const len = Number(req.headers.get('content-length') || 0);
  if (len > IMG_MAX) return json(413, { error: 'That picture is too big.' });
  let bytes;
  try { bytes = new Uint8Array(await req.arrayBuffer()); } catch (e) { return json(400, { error: 'There was no picture in that.' }); }
  const r = await putSuggestImage(who, bytes);
  if (r.error) return json(400, { error: r.error });
  return json(200, { id: r.id }, QUIET);
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/suggestions/image',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
