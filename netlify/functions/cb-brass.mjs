/* The Brass Tacks Board. GET, with no pass, is every post, newest first, for
   anybody: a board of notices hides nothing. POST, with a moderator's pass:
     { action: 'post', title, body, img?, alt?, yes? }   put a post up
     { action: 'edit', id, title, body, img?, alt?, yes? } change your own post
     { action: 'remove', id }                             take any post down
     { action: 'preview', body }                          how the words will set
   The moderator's username goes on the post, for everybody to see. Nothing a
   person types is logged. See ../cb/lib.mjs, the Brass Tacks Board. */
import { readPass, readBrass, shapeBrass, addBrass, editBrass, removeBrass, parseBrass, cleanBrassBody,
  json, body, sameSite, BRASS_BODY_MAX } from '../cb/lib.mjs';

export default async (req) => {
  if (req.method === 'GET') return json(200, { posts: (await readBrass()).map(shapeBrass) });
  if (!sameSite(req)) return json(403, { error: 'This board only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  if (who.role !== 'base') return json(403, { error: 'Only a moderator can post on the board.' });
  const b = (await body(req)) || {};
  try {
    if (b.action === 'preview') {
      const text = cleanBrassBody(b.body);
      if (!text) return json(400, { error: `A post is between one and ${BRASS_BODY_MAX} characters.` });
      return json(200, { ast: parseBrass(text) });
    }
    let r;
    if (b.action === 'post') r = await addBrass(who, b);
    else if (b.action === 'edit') r = await editBrass(who, String(b.id || ''), b);
    else if (b.action === 'remove') r = await removeBrass(who, String(b.id || ''));
    else return json(400, { error: 'Do what with it?' });
    if (r.error) return json(400, { error: r.error });
    return json(200, { posts: (await readBrass()).map(shapeBrass), id: r.post ? r.post.id : null });
  } catch (e) {
    return json(503, { error: 'The board is busy. Try again in a moment. Nothing was changed.' });
  }
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/brass',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
