/* The suggestion box in The Sandbox. GET, with no pass, is every suggestion,
   newest first, for anybody: the box is read by whoever walks past, like the
   Brass Tacks Board. POST, with a pass:
     { action: 'suggest', kind, title, body, pics, yes }   drop one in (anybody signed on)
     { action: 'reply', id, body, status, pics, yes }      reply (whoever posted it, or a moderator;
                                                            only a moderator's status marks it)
     { action: 'edit-reply', id, reply, body, pics, yes }  change a reply (whoever wrote it)
     { action: 'remove-reply', id, reply }      take a reply down (whoever wrote it, or a moderator)
     { action: 'metoo', id }                    say it affects you too, or take that back (anybody
                                                signed on but whoever posted it)
     { action: 'remove', id }                   take one down (whoever posted it, or a moderator)
     { action: 'preview', body }                how the words will set
   pics is a list of { id, alt }, pictures already added at /cb/suggestions/image
   (cb-suggest-image.mjs), and yes says the sender has looked at all of them.
   The handle goes on the suggestion and on every reply, for everybody to see.
   A new suggestion, or a reply from whoever asked, tells the moderators who
   switched that on, and a moderator's reply tells whoever asked
   (notifySuggestion), after it is in the box, so a slow push service never
   holds up the answer. Nothing a person types is logged. See ../cb/lib.mjs, the
   suggestion box. */
import { readPass, readSuggestions, shapeSuggestion, addSuggestion, replySuggestion, editSuggestionReply,
  removeSuggestionReply, meTooSuggestion, removeSuggestion, notifySuggestion,
  parseBrass, cleanBrassBody, json, body, sameSite, SUGGEST_BODY_MAX } from '../cb/lib.mjs';

const items = async () => (await readSuggestions()).map(shapeSuggestion);
// Readable by anybody, and not for search engines: a suggestion is somebody
// asking the street for something, not a page.
const QUIET = { 'x-robots-tag': 'noindex' };

export default async (req, context) => {
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
    else if (b.action === 'reply') r = await replySuggestion(who, String(b.id || ''), b);
    else if (b.action === 'edit-reply') r = await editSuggestionReply(who, String(b.id || ''), b.reply, b);
    else if (b.action === 'remove-reply') r = await removeSuggestionReply(who, String(b.id || ''), b.reply);
    // A page from before the thread, still open somewhere.
    else if (b.action === 'answer') return json(400, { error: 'The box has changed: every suggestion has replies now. Reload the page.' });
    else if (b.action === 'metoo') r = await meTooSuggestion(who, String(b.id || ''));
    else if (b.action === 'remove') r = await removeSuggestion(who, String(b.id || ''));
    else return json(400, { error: 'Do what with it?' });
    if (r.error) return json(400, { error: r.error });
    if (b.action === 'suggest' || b.action === 'reply') {
      const told = notifySuggestion(r.item, r.reply || null).catch(() => []);
      if (context && typeof context.waitUntil === 'function') context.waitUntil(told); else await told;
    }
    return json(200, { items: await items(), id: r.item ? r.item.id : null, reply: r.reply ? r.reply.id : null, on: r.on }, QUIET);
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
