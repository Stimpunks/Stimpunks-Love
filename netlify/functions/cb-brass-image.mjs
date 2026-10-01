/* A picture on the Brass Tacks Board. GET ?id= is the picture, for anybody,
   because the board is for anybody. POST, with a moderator's pass, puts one
   up, already redrawn in their browser, and answers its id; the post that
   carries it is sent afterwards. One no post holds is swept after a day. */
import { readPass, putBrassImage, getBrassImage, json, sameSite, IMG_MAX } from '../cb/lib.mjs';

export default async (req) => {
  const url = new URL(req.url);
  if (req.method === 'GET') {
    const got = await getBrassImage(url.searchParams.get('id'));
    if (!got) return json(404, { error: 'That picture has been taken down with its post.' });
    return new Response(got.data, {
      status: 200,
      headers: { 'content-type': got.meta.type, 'cache-control': 'public, max-age=3600', 'x-content-type-options': 'nosniff' },
    });
  }
  if (!sameSite(req)) return json(403, { error: 'This board only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  if (who.role !== 'base') return json(403, { error: 'Only a moderator can put a picture on the board.' });
  const len = Number(req.headers.get('content-length') || 0);
  if (len > IMG_MAX) return json(413, { error: 'That picture is too big.' });
  let bytes;
  try { bytes = new Uint8Array(await req.arrayBuffer()); } catch (e) { return json(400, { error: 'There was no picture in that.' }); }
  const r = await putBrassImage(who, bytes);
  if (r.error) return json(400, { error: r.error });
  return json(200, { id: r.id });
};

export const config = {
  path: '/cb/brass/image',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
