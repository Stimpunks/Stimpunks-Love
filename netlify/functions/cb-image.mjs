/* The CB: a picture. POST sends one, already redrawn by the radio in the
   sender's browser, for the channel it is tuned to, and answers with its id;
   the message that carries it is sent afterwards by /cb/transmit. GET fetches
   one, with the pass, for anybody who can hear the channel it was sent on.
   Nothing about a picture is kept but the picture, whose handle sent it, which
   room it was for and when, and it goes when its message goes. */
import { readPass, roomTag, roomAllows, putImage, getImage, imageId, json, sameSite, IMG_MAX } from '../cb/lib.mjs';

export default async (req) => {
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const url = new URL(req.url);
  if (req.method === 'GET') {
    const got = await getImage(url.searchParams.get('id'));
    if (!got) return json(404, { error: 'That picture has gone with its message.' });
    if (!roomAllows(who, got.meta.room || null)) return json(403, { error: 'That picture is for the moderators its room is for.' });
    return new Response(got.data, {
      status: 200,
      headers: { 'content-type': got.meta.type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex' },
    });
  }
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  const asked = url.searchParams.get('room');
  const room = asked === null ? null : roomTag(asked);
  if (asked !== null && !room) return json(400, { error: 'That is not a room on the street.' });
  if (!roomAllows(who, room)) return json(403, { error: 'This room\'s channel is for the moderators it is for.' });
  const len = Number(req.headers.get('content-length') || 0);
  if (len > IMG_MAX) return json(413, { error: 'That picture is too big to send.' });
  let bytes;
  try { bytes = new Uint8Array(await req.arrayBuffer()); } catch (e) { return json(400, { error: 'There was no picture in that.' }); }
  const r = await putImage(who, room, bytes);
  if (r.error) return json(400, { error: r.error });
  return json(200, { id: r.id });
};

export const config = {
  path: '/cb/image',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
