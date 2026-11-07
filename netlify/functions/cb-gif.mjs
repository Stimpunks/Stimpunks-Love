/* The CB: GIFs from Gifbox (lib.mjs, "GIFs from Gifbox"). POST { action:
   'search', q, pos } answers a page of Gifbox's featured GIFs, or of a search,
   with each GIF's id, words, size and length and none of Gifbox's addresses.
   GET ?still=<id> answers that GIF's still, fetched here off media.gifbox.me,
   so the picker never talks to Gifbox. POST { action: 'take', id, room } keeps
   a GIF's still and MP4 for the channel it is going to, as /cb/image keeps a
   picture, for /cb/transmit to send. All with the pass; nothing searched for
   is logged or kept. */
import { staffReady, readPass, roomTag, roomAllows, json, body, sameSite, gifsOn, gifSearch, gifPreview, takeGif } from '../cb/lib.mjs';

export default async (req) => {
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const url = new URL(req.url);
  if (req.method === 'GET') {
    const got = await gifPreview(url.searchParams.get('still'));
    if (!got) return json(404, { error: 'That GIF could not be fetched from Gifbox.' });
    return new Response(got.data, {
      status: 200,
      headers: { 'content-type': got.type, 'cache-control': 'private, max-age=86400', 'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex' },
    });
  }
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  const b = await body(req);
  if (!b) return json(400, { error: 'There was nothing in that.' });
  if (!gifsOn()) return json(200, { on: false, results: [], next: '' });
  if (b.action === 'search') {
    const r = await gifSearch(b.q, b.pos);
    if (r.error === 'long') return json(400, { error: 'That search is too long.' });
    if (r.error) return json(502, { error: 'Gifbox did not answer just now. Try again in a moment.' });
    return json(200, { on: true, results: r.results, next: r.next });
  }
  if (b.action === 'take') {
    // A GIF is kept beside the channel's pictures, sealed with CB_STAFF_KEY: without it, shut.
    if (!staffReady()) return json(503, { error: 'Pictures are shut just now. Nothing was read or sent.' });
    const room = b.room == null ? null : roomTag(b.room);
    if (b.room != null && !room) return json(400, { error: 'That is not a room on the street.' });
    if (!roomAllows(who, room)) return json(403, { error: 'This room\'s channel is for the moderators it is for.' });
    const r = await takeGif(who, room, b.id);
    if (r.error) return json(400, { error: r.error });
    return json(200, r);
  }
  return json(400, { error: 'The radio did not ask for anything it knows.' });
};

export const config = {
  path: '/cb/gif',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
