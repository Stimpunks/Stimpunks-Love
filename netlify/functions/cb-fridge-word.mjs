/* The Fridge of Sighs: putting up one word. Only with a CB pass. The pass is
   checked, and all that is kept of whoever holds it is a scrambled mark saying
   the last word was theirs, so they cannot put up the next one; the next word
   replaces it. A word ending in . ! ? or … finishes the sentence, and a
   finished sentence past what the door holds is filed into its month's drawer
   on the way out. */
import { readPass, cleanWord, putWord, fridgeMark, fileFridge, readFridge, shapeLine, shapeSentences, json, body, sameSite,
  FRIDGE_WORD_MAX } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This fridge only answers stimpunks.world.' });
  const who = readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  const b = (await body(req)) || {};
  const word = cleanWord(b.word);
  if (!word) {
    return json(400, { error: `One word, up to ${FRIDGE_WORD_MAX} characters: letters and numbers, an apostrophe or a hyphen inside it, and a mark after it if it wants one.` });
  }
  try {
    const r = await putWord(word, fridgeMark(who.handle));
    if (!r.put) {
      return json(409, { error: 'The last word put up was yours, so the next one is somebody else’s, even when it starts a new sentence.',
        words: shapeLine(r.words), door: shapeSentences(r.door) });
    }
    let { words, door } = r;
    if (r.finished) {
      try { if (await fileFridge()) ({ words, door } = await readFridge()); }
      catch (e) { /* filing is tried again by the next word and by the hourly sweep */ }
    }
    return json(200, { words: shapeLine(words), door: shapeSentences(door), finished: !!r.finished });
  } catch (e) {
    return json(503, { error: 'Somebody else is at the fridge. Try again in a moment.' });
  }
};

export const config = {
  path: '/cb/fridge/word',
  method: 'POST',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
