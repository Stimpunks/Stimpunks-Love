/* The CB: our own emoji (lib.mjs, "Custom emoji"). GET ?img=<id> answers an
   emoji's picture to anybody, because a message's picture of it cannot carry
   a pass. GET with the pass answers the list, each emoji's id and name, and
   whether it is the asker's to take down. POST ?name=<name>&yes=1 with the
   picture, already redrawn by the radio, adds one; POST { remove: id } takes
   one down, for whoever added it or a moderator. */
import { readPass, json, body, sameSite, emojiList, addEmoji, removeEmoji, getEmojiImage, EMOJI_BYTES } from '../cb/lib.mjs';

export default async (req) => {
  const url = new URL(req.url);
  if (req.method === 'GET' && url.searchParams.has('img')) {
    const got = await getEmojiImage(url.searchParams.get('img'));
    if (!got) return new Response('That emoji has gone.', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8', 'x-robots-tag': 'noindex' } });
    return new Response(got.data, {
      status: 200,
      headers: { 'content-type': got.type, 'cache-control': 'public, max-age=3600', 'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex' },
    });
  }
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  if (req.method === 'GET') return json(200, { emoji: await emojiList(who) });
  if (!sameSite(req)) return json(403, { error: 'This radio only answers stimpunks.world.' });
  if ((req.headers.get('content-type') || '').startsWith('application/json')) {
    const b = await body(req);
    if (!b || b.remove == null) return json(400, { error: 'The radio did not ask for anything it knows.' });
    const r = await removeEmoji(who, b.remove);
    return r.error ? json(400, r) : json(200, { ...r, emoji: await emojiList(who) });
  }
  if (Number(req.headers.get('content-length') || 0) > EMOJI_BYTES) return json(413, { error: 'That picture is too big for an emoji.' });
  let bytes;
  try { bytes = new Uint8Array(await req.arrayBuffer()); } catch (e) { return json(400, { error: 'There was no picture in that.' }); }
  const r = await addEmoji(who, url.searchParams.get('name'), bytes, url.searchParams.get('yes') === '1');
  return r.error ? json(400, r) : json(200, { ...r, emoji: await emojiList(who) });
};

export const config = {
  path: '/cb/emoji',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
