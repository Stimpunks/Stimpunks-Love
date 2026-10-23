/* The notice along the top of the street's front page, the Community Center,
   the forums and the office's dashboard. GET, with no pass, is the notice up
   now, for anybody: { notice: { text, ast } }, or { notice: null } when there
   is none, and nothing about who put it up. POST, with a moderator's pass,
   from the desk in the Moderators' room:
     { action: 'look' }            the notice, and who put it up or took it down last, and when
     { action: 'preview', text }   how the words will set
     { action: 'set', text }       put it up, replacing the one up now
     { action: 'clear' }           take it down
   Nothing a person types is logged. See ../cb/lib.mjs, the notice. */
import { readPass, readNotice, shapeNotice, setNotice, clearNotice, cleanNotice, parseBrass,
  json, body, sameSite, NOTICE_SHAPE } from '../cb/lib.mjs';

function forDesk(d) { return { notice: shapeNotice(d), by: d.by, t: d.t }; }

export default async (req) => {
  if (req.method === 'GET') return json(200, { notice: shapeNotice(await readNotice()) });
  if (!sameSite(req)) return json(403, { error: 'The notice only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  if (who.role !== 'base') return json(403, { error: 'Only a moderator can put up the notice.' });
  const b = (await body(req)) || {};
  try {
    if (b.action === 'look') return json(200, forDesk(await readNotice()));
    if (b.action === 'preview') {
      const text = cleanNotice(b.text);
      if (!text) return json(400, { error: NOTICE_SHAPE });
      return json(200, { notice: { text, ast: parseBrass(text) } });
    }
    let r;
    if (b.action === 'set') r = await setNotice(who, b.text);
    else if (b.action === 'clear') r = await clearNotice(who);
    else return json(400, { error: 'Do what with it?' });
    if (r.error) return json(400, { error: r.error });
    return json(200, forDesk(await readNotice()));
  } catch (e) {
    return json(503, { error: 'The notice is busy. Try again in a moment. Nothing was changed.' });
  }
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/notice',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
