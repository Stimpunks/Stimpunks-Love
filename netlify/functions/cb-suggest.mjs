/* The suggestion box in The Sandbox. GET, with no pass, is every suggestion,
   newest first, for anybody: the box is read by whoever walks past, like the
   Brass Tacks Board. POST, with a pass:
     { action: 'suggest', kind, title, body, pics, yes }   drop one in (anybody signed on)
     { action: 'answer', id, status, reply, pics, yes }    done, not doing, or still open (a moderator)
     { action: 'remove', id }                   take one down (whoever posted it, or a moderator)
     { action: 'preview', body }                how the words will set
   pics is a list of { id, alt }, pictures already added at /cb/suggestions/image
   (cb-suggest-image.mjs), and yes says the sender has looked at all of them.
   The handle goes on the suggestion and the moderator's on the reply, for
   everybody to see. Nothing a person types is logged. See ../cb/lib.mjs, the
   suggestion box. */
import { readPass, readSuggestions, shapeSuggestion, addSuggestion, answerSuggestion, removeSuggestion,
  parseBrass, cleanBrassBody, json, body, sameSite, SUGGEST_BODY_MAX } from '../cb/lib.mjs';

const items = async () => (await readSuggestions()).map(shapeSuggestion);
// Readable by anybody, and not for search engines: a suggestion is somebody
// asking the street for something, not a page.
const QUIET = { 'x-robots-tag': 'noindex' };

export default async (req) => {
  if (req.method === 'GET') return json(200, { items: await items() }, QUIET);
  if (!sameSite(req)) return json(403, { error: 'This box only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  try {
    if (b.action === 'preview') {
      const text = cleanBrassBody(b.body);
      if (!text || [...text].length > SUGGEST_BODY_MAX) return json(400, { error: `Between one and ${SUGGEST_BODY_MAX} characters.` });
      return json(200, { ast: parseBrass(text) }, QUIET);
    }
    let r;
    if (b.action === 'suggest') r = await addSuggestion(who, b);
    else if (b.action === 'answer') r = await answerSuggestion(who, String(b.id || ''), b);
    else if (b.action === 'remove') r = await removeSuggestion(who, String(b.id || ''));
    else return json(400, { error: 'Do what with it?' });
    if (r.error) return json(400, { error: r.error });
    return json(200, { items: await items(), id: r.item ? r.item.id : null }, QUIET);
  } catch (e) {
    return json(503, { error: 'The box is busy. Try again in a moment. Nothing was changed.' });
  }
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/suggestions',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
