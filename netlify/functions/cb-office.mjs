/* The office: contacts, grant requests and cases, moved
   here from EspoCRM. Every answer needs the pass of a claimed username holding
   one of TASK_SEE's roles, or administrator; everybody else is told nothing.
   Every record is sealed at rest under CB_OFFICE_KEY; without it the office
   is shut. GET, with ?view=:
     contacts                every contact, without notes
     contact  &id=           one contact, its notes as words and as nodes, and their grant requests and cases
     grants                  every grant request, without its description
     grant    &id=           one grant request, its description as words and as nodes
     cases                   every case, without its description
     case     &id=           one case, its description as words and as nodes
   POST, with the same pass:
     { action: 'contact-save', id?, espo?, first?, last?, email?, phone?, noEmail?, noCall?, notes? }
         a new contact, or a change to the one `id` names; only the fields sent change.
         espo: EspoCRM's id for one brought over, so bringing it again changes it
         rather than making it twice; with it, t and by may say EspoCRM's own.
     { action: 'contact-remove', id }                a contact deleted
     { action: 'contact-import', rows: [...] }       EspoCRM's contacts, up to IMPORT_MAX at
         a time, each with its espo id; one changed or deleted here is left alone
     { action: 'grant-save', id?, espo?, name?, pipeline?, stage?, amount?, submitted?, closed?,
         contact? | contactEmail?, form?, body? }    a new grant request, or a change to one;
         its status follows its stage, and the day it was decided follows its status
     { action: 'grant-remove', id }                  a grant request deleted
     { action: 'grant-import', rows: [...] }         EspoCRM's grant requests, as contacts are
         brought over, each naming its contact by EspoCRM's id (contactEspo)
     { action: 'case-save', id?, espo?, number? (an import's only), name?, type?, status?, priority?,
         submitted?, closed?, contact? | contactEmail?, form?, body? }
         a new case, which takes the next number, or a change to one; a status
         that closes it, set here, sets the day it closed
     { action: 'case-remove', id }                   a case deleted
     { action: 'case-import', rows: [...] }          EspoCRM's cases, each keeping its number
     { action: 'preview', body }                     how notes or a description will set
   Nothing anybody types, and nothing about a contact, is ever logged. See
   ../cb/lib.mjs, the office. */
import { readPass, forumReader, officeAllow, officeReady, officeContacts, officeContact, saveContact, removeContact, importContacts,
  officeGrants, officeGrant, saveGrant, removeGrant, importGrants, officeCases, officeCase, saveCase, removeCase, importCases, parseBrass, cleanForumBody, json, body, sameSite,
  CONTACT_NAME_MAX, CONTACT_NOTES_MAX, GRANT_NAME_MAX, GRANT_BODY_MAX, GRANT_AMOUNT_MAX, OFFICE_PIPELINES, OFFICE_STATUSES,
  OFFICE_CURRENCY, OFFICE_CASES, CASE_NAME_MAX, CASE_BODY_MAX } from '../cb/lib.mjs';

// Never for search engines, and never cached anywhere.
const QUIET = { 'x-robots-tag': 'noindex', 'cache-control': 'no-store' };
const settings = { nameMax: CONTACT_NAME_MAX, notesMax: CONTACT_NOTES_MAX, grantNameMax: GRANT_NAME_MAX, grantBodyMax: GRANT_BODY_MAX,
  amountMax: GRANT_AMOUNT_MAX, pipelines: OFFICE_PIPELINES, statuses: OFFICE_STATUSES, currency: OFFICE_CURRENCY,
  cases: OFFICE_CASES, caseNameMax: CASE_NAME_MAX, caseBodyMax: CASE_BODY_MAX };

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The office only answers stimpunks.world.' }, QUIET);
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' }, QUIET);
  if (!officeAllow(who)) {
    return json(403, forumReader(who)
      ? { error: 'The office is for our directors and administrators.' }
      : { error: 'The office is for our directors and administrators, on a claimed username. Claim yours under Account on the radio.', claim: true }, QUIET);
  }
  if (!officeReady()) return json(503, { error: 'The office is shut: its key is not set, so nothing in it can be opened.' }, QUIET);
  const me = { handle: who.handle };
  const url = new URL(req.url);
  try {
    if (req.method === 'GET') {
      const view = url.searchParams.get('view') || 'contacts';
      if (view === 'contacts') return json(200, { me, settings, contacts: await officeContacts(who) }, QUIET);
      if (view === 'contact') {
        const c = await officeContact(who, url.searchParams.get('id'));
        return c ? json(200, { me, settings, contact: c }, QUIET) : json(404, { error: 'That contact has been deleted.' }, QUIET);
      }
      if (view === 'grants') return json(200, { me, settings, grants: await officeGrants(who) }, QUIET);
      if (view === 'grant') {
        const g = await officeGrant(who, url.searchParams.get('id'));
        return g ? json(200, { me, settings, grant: g }, QUIET) : json(404, { error: 'That grant request has been deleted.' }, QUIET);
      }
      if (view === 'cases') return json(200, { me, settings, cases: await officeCases(who) }, QUIET);
      if (view === 'case') {
        const k = await officeCase(who, url.searchParams.get('id'));
        return k ? json(200, { me, settings, case: k }, QUIET) : json(404, { error: 'That case has been deleted.' }, QUIET);
      }
      return json(400, { error: 'Show what?' }, QUIET);
    }
    const b = (await body(req)) || {};
    if (b.action === 'preview') {
      const text = cleanForumBody(b.body, GRANT_BODY_MAX);
      if (!text) return json(400, { error: `Between one and ${GRANT_BODY_MAX} characters.` }, QUIET);
      return json(200, { blocks: parseBrass(text, { boxes: true }) }, QUIET);
    }
    if (b.action === 'contact-save') {
      const r = await saveContact(who, b);
      return r.error ? json(400, { error: r.error }, QUIET) : json(200, { contact: r.contact }, QUIET);
    }
    if (b.action === 'contact-import') {
      const r = await importContacts(who, b.rows);
      return r.error ? json(400, { error: r.error }, QUIET) : json(200, { told: r.told }, QUIET);
    }
    if (b.action === 'grant-save') {
      const r = await saveGrant(who, b);
      return r.error ? json(400, { error: r.error }, QUIET) : json(200, { grant: r.grant }, QUIET);
    }
    if (b.action === 'grant-import') {
      const r = await importGrants(who, b.rows);
      return r.error ? json(400, { error: r.error }, QUIET) : json(200, { told: r.told }, QUIET);
    }
    if (b.action === 'grant-remove') {
      const r = await removeGrant(who, String(b.id || ''));
      return r.error ? json(400, { error: r.error }, QUIET) : json(200, { gone: true }, QUIET);
    }
    if (b.action === 'case-save') {
      const r = await saveCase(who, b);
      return r.error ? json(400, { error: r.error }, QUIET) : json(200, { case: r.case }, QUIET);
    }
    if (b.action === 'case-import') {
      const r = await importCases(who, b.rows);
      return r.error ? json(400, { error: r.error }, QUIET) : json(200, { told: r.told }, QUIET);
    }
    if (b.action === 'case-remove') {
      const r = await removeCase(who, String(b.id || ''));
      return r.error ? json(400, { error: r.error }, QUIET) : json(200, { gone: true }, QUIET);
    }
    if (b.action === 'contact-remove') {
      const r = await removeContact(who, String(b.id || ''));
      return r.error ? json(400, { error: r.error }, QUIET) : json(200, { gone: true }, QUIET);
    }
    return json(400, { error: 'Do what with it?' }, QUIET);
  } catch (e) {
    return json(503, { error: 'The office is busy just now. Look again in a moment before trying again.' }, QUIET);
  }
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/office',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 240, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
