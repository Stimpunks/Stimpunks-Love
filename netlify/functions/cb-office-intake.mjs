/* The office's intake: stimpunks.org's forms, posted one entry at a time by the
   WPForms plugin on stimpunks.org's server, never by a browser. Every request
   is signed with CB_OFFICE_INTAKE_KEY (x-stimpunks-signature: t=…,v1=…, an
   HMAC-SHA256 of "t.body"), checked before the body is read as anything, and
   good for five minutes. POST, JSON:
     { type, entry?, submitted?, email?, first?, last?, name?, phone?, message? }
         type: one of OFFICE_INTAKE's (mutual_aid, creator_grant, connection,
         volunteer); the office makes that form's grant request or case, and
         finds or adds the contact by email. An entry already in the office is
         never made twice.
     { test: true }    whether the intake is open, and nothing else
   The answer says only whether a record was made. Nothing about a submission
   is ever logged. See ../cb/lib.mjs, the intake. */
import { intakeReady, intakeSigned, officeIntake, json, INTAKE_MAX } from '../cb/lib.mjs';

// Never for search engines, and never cached anywhere.
const QUIET = { 'x-robots-tag': 'noindex', 'cache-control': 'no-store' };

export default async (req) => {
  if (!intakeReady()) return json(503, { error: 'The intake is shut: its key or the office’s key is not set.' }, QUIET);
  const raw = await req.text();
  if (raw.length > INTAKE_MAX) return json(413, { error: 'That submission is too long.' }, QUIET);
  if (!intakeSigned(req.headers.get('x-stimpunks-signature'), raw)) return json(401, { error: 'Not signed with the intake’s key, or signed too long ago.' }, QUIET);
  let b;
  try { b = JSON.parse(raw); } catch (e) { return json(400, { error: 'Not JSON.' }, QUIET); }
  if (b && b.test === true) return json(200, { ok: true, open: true }, QUIET);
  try {
    const r = await officeIntake(b);
    if (r.error) return json(r.status || 400, { error: r.error }, QUIET);
    return json(200, { ok: true, record: r.record, made: r.made }, QUIET);
  } catch (e) {
    return json(503, { error: 'The office is busy just now. Try again in a moment.' }, QUIET);
  }
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/office/intake',
  method: ['POST'],
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
