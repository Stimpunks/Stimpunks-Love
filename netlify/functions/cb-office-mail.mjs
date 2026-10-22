/* The office's way in for the team mailbox: a Google Apps Script inside it
   (Stimpunks-Work's stimpunks-gmail-office) posts here, never a browser. Every
   request is signed with CB_OFFICE_MAIL_KEY, a key of its own
   (x-stimpunks-signature: t=…,v1=…, an HMAC-SHA256 of "t.body"), checked before
   the body is read as anything, and good for five minutes. POST, JSON:
     { action: 'addresses' }   a keyed hash of every contact's email address, so
                               the script sends only email with a contact
     { action: 'email', email: { id, thread, mailbox, at, from, to, cc, bcc,
         subject, text, files } }
                               one email; kept only if it is with a contact, and
                               never twice, and never one deleted from the office
     { action: 'contact', contact: { name, email, mailbox } }
                               the person a thread was labelled for in Gmail,
                               found by their address or added with that name
     { action: 'outbox' }      the emails of mailings a director has sent, waiting to
                               go: the one answer here with anybody's address in it
     { action: 'sent', id, failed? }
                               one of those sent, or Google would not send it
     { action: 'counts', counts: { unread, received, sent, withContacts } }
                               the mailbox's hourly count for the dashboard:
                               numbers only, each pair this week and the one before
     { test: true }            whether the way in is open, and nothing else
   The answer says only whether an email was kept or a contact made. Nothing about an email is
   ever logged. See ../cb/lib.mjs, email. */
import { mailReady, mailSigned, mailAddresses, officeMailIn, officeMailContact, mailOutbox, mailSentFor, officeMailCounts, json } from '../cb/lib.mjs';

// Never for search engines, and never cached anywhere.
const QUIET = { 'x-robots-tag': 'noindex', 'cache-control': 'no-store' };
const MAX = 1500000;   // characters of one request's body: an email's text is kept to 200,000

export default async (req) => {
  if (!mailReady()) return json(503, { error: 'The mailbox’s way in is shut: its key or the office’s key is not set.' }, QUIET);
  const raw = await req.text();
  if (raw.length > MAX) return json(413, { error: 'That is too long.' }, QUIET);
  if (!mailSigned(req.headers.get('x-stimpunks-signature'), raw)) return json(401, { error: 'Not signed with the mailbox’s key, or signed too long ago.' }, QUIET);
  let b;
  try { b = JSON.parse(raw); } catch (e) { return json(400, { error: 'Not JSON.' }, QUIET); }
  if (b && b.test === true) return json(200, { ok: true, open: true }, QUIET);
  try {
    if (b && b.action === 'addresses') return json(200, { addresses: await mailAddresses() }, QUIET);
    if (b && b.action === 'outbox') return json(200, { emails: await mailOutbox() }, QUIET);
    if (b && b.action === 'sent') {
      const r = await mailSentFor(b);
      if (r.error) return json(r.status || 400, { error: r.error }, QUIET);
      return json(200, { ok: true, known: r.known }, QUIET);
    }
    if (b && b.action === 'contact') {
      const r = await officeMailContact(b.contact);
      if (r.error) return json(r.status || 400, { error: r.error }, QUIET);
      return json(200, { ok: true, made: !!r.made }, QUIET);
    }
    if (b && b.action === 'counts') {
      const r = await officeMailCounts(b.counts);
      if (r.error) return json(r.status || 400, { error: r.error }, QUIET);
      return json(200, { ok: true }, QUIET);
    }
    if (b && b.action === 'email') {
      const r = await officeMailIn(b.email);
      if (r.error) return json(r.status || 400, { error: r.error }, QUIET);
      return json(200, { ok: true, kept: r.kept, made: !!r.made }, QUIET);
    }
    return json(400, { error: 'Do what?' }, QUIET);
  } catch (e) {
    return json(503, { error: 'The office is busy just now. Try again in a moment.' }, QUIET);
  }
};

/* Netlify counts the requests per address and never tells us the address. A
   backfill sends one email at a time, paced by the script. */
export const config = {
  path: '/cb/office/mail',
  method: ['POST'],
  rateLimit: { windowLimit: 300, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
