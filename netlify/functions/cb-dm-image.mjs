/* Direct messages: a picture. POST sends one, already redrawn by the radio in
   the sender's browser, for the conversation with the handle in the X-CB-With
   header (encoded, as encodeURIComponent writes it), and answers with its id;
   the message that carries it is sent afterwards by /cb/dm. A handle travels
   in a header, never the address, so it is in no request log, the rule /cb/dm
   keeps with its body. GET fetches one, with the pass, for either of the two
   people in its conversation while a message there holds it, and for nobody
   else. Only an accepted conversation takes a picture: a request is words
   only. Nothing about a picture is kept but the picture, whose it is, which
   conversation it is for and when, and it goes when its message goes. */
import { readPass, forumReader, putDmImage, getDmImage, cleanHandle, json, sameSite, IMG_MAX } from '../cb/lib.mjs';

const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };

export default async (req) => {
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  if (!forumReader(who)) return json(403, { error: 'Claim your username first: messages are for claimed usernames only.' });
  const url = new URL(req.url);
  if (req.method === 'GET') {
    const got = await getDmImage(who, url.searchParams.get('id'));
    if (!got) return json(404, { error: 'That picture has gone with its message.' }, NOINDEX);
    return new Response(got.data, {
      status: 200,
      headers: { 'content-type': got.type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...NOINDEX },
    });
  }
  if (!sameSite(req)) return json(403, { error: 'Messages only answer stimpunks.world.' });
  let asked = '';
  try { asked = decodeURIComponent(req.headers.get('x-cb-with') || ''); } catch (e) { asked = ''; }
  const handle = cleanHandle(asked);
  if (!handle) return json(400, { error: 'Who is the picture for?' });
  const len = Number(req.headers.get('content-length') || 0);
  if (len > IMG_MAX) return json(413, { error: 'That picture is too big to send.' });
  let bytes;
  try { bytes = new Uint8Array(await req.arrayBuffer()); } catch (e) { return json(400, { error: 'There was no picture in that.' }); }
  try {
    const r = await putDmImage(who, handle, bytes);
    if (r.error === 'accepted') return json(409, { error: `A picture can go once ${handle} has accepted the conversation. A first message is words only.` });
    if (r.error === 'blocked') return json(403, { error: `You have blocked ${handle}. Unblock them, under Messages, to write to them.` });
    if (r.error === 'closed') return json(403, { error: `${handle} is not taking messages from you just now.` });
    if (r.error === 'bad') return json(400, { error: r.why });
    if (r.error) return json(400, { error: 'That picture did not go.' });
    return json(200, { id: r.id }, NOINDEX);
  } catch (e) {
    return json(503, { error: 'That did not work just now. Nothing was sent; try again in a moment.' });
  }
};

export const config = {
  path: '/cb/dm/image',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
