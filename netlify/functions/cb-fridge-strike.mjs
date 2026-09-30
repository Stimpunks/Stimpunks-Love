/* The Fridge of Sighs: the base station taking a word off the line, or a
   finished sentence off the door or out of a drawer. Only a pass issued for the
   moderators' password can do this, as on the chalkboard. */
import { readPass, strikeWord, strikeSentence, readFridge, shapeLine, shapeSentences, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This fridge only answers stimpunks.world.' });
  const who = readPass(req);
  if (!who || who.role !== 'base') return json(403, { error: 'Only the base station can do that.' });
  const b = (await body(req)) || {};
  try {
    if (Number.isInteger(b.word)) {
      const r = await strikeWord(b.word);
      return json(200, { words: shapeLine(r.words), door: shapeSentences(r.door) });
    }
    if (typeof b.sentence === 'string') {
      const hit = await strikeSentence(b.sentence);
      const r = await readFridge();
      return json(hit ? 200 : 404, { words: shapeLine(r.words), door: shapeSentences(r.door), struck: hit });
    }
    return json(400, { error: 'Which word, or which sentence?' });
  } catch (e) {
    return json(503, { error: 'Somebody else is at the fridge. Try again in a moment.' });
  }
};

export const config = {
  path: '/cb/fridge/strike',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
