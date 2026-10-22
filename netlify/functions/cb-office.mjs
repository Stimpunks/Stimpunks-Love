/* The office: contacts, grant requests and cases, moved
   here from EspoCRM. Every answer needs the pass of a claimed username holding
   one of TASK_SEE's roles, or administrator; everybody else is told nothing.
   Every record is sealed at rest under CB_OFFICE_KEY; without it the office
   is shut. GET, with ?view=:
     contacts                every contact, without notes
     contact  &id=           one contact, its notes as words and as nodes, their grant requests and cases,
                             their emails (who, when, subject), newest first, and its comments, oldest first
     email    &id=           one email, whole, as the team mailbox's script sent it, and its comments
     grants                  every grant request, without its description
     grant    &id=           one grant request, its description as words and as nodes, and its comments
     cases                   every case, without its description
     case     &id=           one case, its description as words and as nodes, and its comments
     feed     &ids=          up to OFFICE_FEED_PAGE grant requests, cases and contacts by their ids, each
                             whole, with its latest comments and how many it has: one page of the Feed,
                             whose order and filters the page works out
     dashboard               the office's figures, worked out now: EspoCRM's four reports, this week
                             and last, tasks, mailings, and the newest grant requests, cases and tasks
     reports                 EspoCRM's nine reports, worked out now: by stage, month and year, awards,
                             grantees, and cases by status and year
     templates               every mailing template
     template &id=           one template, and its comments
     mailings                every mailing, newest first, with how many of its emails are where
     mailing  &id=           one mailing, its template's words, every email's state, and its comments
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
     { action: 'template-save', id?, name, subject, body }
         a mailing's template, or a change to one; an unknown {fill-in} is refused
     { action: 'template-remove', id }               a template deleted
     { action: 'mailing-preview', pipeline, stage, template, since? }
         every email a mailing to that stage would send, filled in, and who it leaves out and why;
         with since (a day), only the requests submitted on or after it
     { action: 'mailing-send', pipeline, stage, template, since?, stamp, grants }
         the mailing the preview showed, queued for the team mailbox to send; refused
         if the template or who is at the stage has changed since
     { action: 'mailing-stop', id }                  every email of it not yet sent, taken back
     { action: 'mailing-remove', id }                a mailing with nothing waiting, deleted
     { action: 'mail-remove', id }                   an email deleted from the office, never from
         Gmail, and never taken in again
     { action: 'qb-connect' }                        Intuit's address to connect the office to
         QuickBooks, with a state kept for the way back (/cb/office/quickbooks)
     { action: 'qb-read' }                           the books read now, as each night
     { action: 'gb-read' }                           Givebutter read now, as each night
     { action: 'qb-disconnect' }                     the office's permission revoked at Intuit, and
         what it last read deleted
     { action: 'comment', id, body }                 a comment on the contact, grant request, case, mailing or template
         `id` names, or on an email, whose id is `email-` and its Gmail id
     { action: 'comment-edit', id, c, body }         comment c changed, by whoever wrote it
     { action: 'comment-remove', id, c }             comment c deleted, by whoever wrote it or an administrator
     { action: 'preview', body, comment? }           how notes or a description, or with comment: true a comment, will set
     { action: 'links', q }                          what [[ offers for q: tasks, topics and the office's records
                                                     the reader can open (findLinks), by POST so q is in no address
   Nothing anybody types, and nothing about a contact, is ever logged. See
   ../cb/lib.mjs, the office. */
import { readPass, forumReader, officeAllow, officeReady, officeContacts, officeContact, saveContact, removeContact, importContacts,
  officeGrants, officeGrant, saveGrant, removeGrant, importGrants, officeCases, officeCase, saveCase, removeCase, importCases, officeFeed, OFFICE_FEED_PAGE,
  officeEmail, removeEmail, officeTemplates, saveTemplate, removeTemplate, previewMailing, sendMailing, officeMailings, officeMailing,
  stopMailing, removeMailing, officeTemplate, officeComments, commentOffice, editOfficeComment, removeOfficeComment, OFFICE_COMMENT_MAX, officeDashboard, officeReports, qbConnect, qbDisconnect, officeQuickBooks, officeGivebutter, FILL_INS, TEMPLATE_NAME_MAX, TEMPLATE_SUBJECT_MAX, TEMPLATE_BODY_MAX, MAILING_MAX,
  parseBrass, cleanForumBody, json, body, sameSite, nameRefs, findLinks, backlinksTo, taskPeople,
  CONTACT_NAME_MAX, CONTACT_NOTES_MAX, GRANT_NAME_MAX, GRANT_BODY_MAX, GRANT_AMOUNT_MAX, OFFICE_PIPELINES, OFFICE_STATUSES,
  OFFICE_CURRENCY, OFFICE_CASES, CASE_NAME_MAX, CASE_BODY_MAX } from '../cb/lib.mjs';

// Never for search engines, and never cached anywhere.
const QUIET = { 'x-robots-tag': 'noindex', 'cache-control': 'no-store' };
const settings = { nameMax: CONTACT_NAME_MAX, notesMax: CONTACT_NOTES_MAX, grantNameMax: GRANT_NAME_MAX, grantBodyMax: GRANT_BODY_MAX,
  amountMax: GRANT_AMOUNT_MAX, pipelines: OFFICE_PIPELINES, statuses: OFFICE_STATUSES, currency: OFFICE_CURRENCY,
  cases: OFFICE_CASES, caseNameMax: CASE_NAME_MAX, caseBodyMax: CASE_BODY_MAX, fillIns: FILL_INS, templateNameMax: TEMPLATE_NAME_MAX,
  templateSubjectMax: TEMPLATE_SUBJECT_MAX, templateBodyMax: TEMPLATE_BODY_MAX, mailingMax: MAILING_MAX, feedPage: OFFICE_FEED_PAGE,
  commentMax: OFFICE_COMMENT_MAX };

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
  // An administrator may delete anybody's comment, so the page offers it.
  // people: who a comment can @mention, the office's own readers, for the page's @ list and drawing.
  const me = { handle: who.handle, admin: who.roles.has('administrator'), people: taskPeople() };
  // Every answer's links to tasks, topics and the office named for this reader, last.
  const answer = async (code, b, h) => json(code, await nameRefs(b, who), h);
  const url = new URL(req.url);
  try {
    if (req.method === 'GET') {
      const view = url.searchParams.get('view') || 'contacts';
      if (view === 'contacts') return answer(200, { me, settings, contacts: await officeContacts(who) }, QUIET);
      if (view === 'contact') {
        const c = await officeContact(who, url.searchParams.get('id'));
        return c ? answer(200, { me, settings, contact: c, comments: await officeComments(who, c.id), backlinks: await backlinksTo(who, 'contact', c.id) }, QUIET) : json(404, { error: 'That contact has been deleted.' }, QUIET);
      }
      if (view === 'grants') return answer(200, { me, settings, grants: await officeGrants(who) }, QUIET);
      if (view === 'grant') {
        const g = await officeGrant(who, url.searchParams.get('id'));
        return g ? answer(200, { me, settings, grant: g, comments: await officeComments(who, g.id), backlinks: await backlinksTo(who, 'grant', g.id) }, QUIET) : json(404, { error: 'That grant request has been deleted.' }, QUIET);
      }
      if (view === 'email') {
        const m = await officeEmail(who, url.searchParams.get('id'));
        return m ? answer(200, { me, settings, email: m, comments: await officeComments(who, 'email-' + m.id) }, QUIET) : json(404, { error: 'That email has been deleted from the office.' }, QUIET);
      }
      if (view === 'cases') return answer(200, { me, settings, cases: await officeCases(who) }, QUIET);
      if (view === 'feed') return answer(200, { me, settings, feed: await officeFeed(who, String(url.searchParams.get('ids') || '').split(',')) }, QUIET);
      if (view === 'case') {
        const k = await officeCase(who, url.searchParams.get('id'));
        return k ? answer(200, { me, settings, case: k, comments: await officeComments(who, k.id), backlinks: await backlinksTo(who, 'case', k.id) }, QUIET) : json(404, { error: 'That case has been deleted.' }, QUIET);
      }
      if (view === 'dashboard') return answer(200, { me, settings, dashboard: await officeDashboard(who) }, QUIET);
      if (view === 'reports') return answer(200, { me, settings, reports: await officeReports(who) }, QUIET);
      if (view === 'templates') return answer(200, { me, settings, templates: await officeTemplates(who) }, QUIET);
      if (view === 'template') {
        const t = await officeTemplate(who, url.searchParams.get('id'));
        return t ? answer(200, { me, settings, template: t, comments: await officeComments(who, t.id) }, QUIET) : json(404, { error: 'That template has been deleted.' }, QUIET);
      }
      if (view === 'mailings') return answer(200, { me, settings, mailings: await officeMailings(who) }, QUIET);
      if (view === 'mailing') {
        const m = await officeMailing(who, url.searchParams.get('id'));
        return m ? answer(200, { me, settings, mailing: m, comments: await officeComments(who, m.id) }, QUIET) : json(404, { error: 'That mailing has been deleted.' }, QUIET);
      }
      return json(400, { error: 'Show what?' }, QUIET);
    }
    const b = (await body(req)) || {};
    if (b.action === 'preview') {
      // A comment sets as a comment does: shorter, and its [ ] are words rather than boxes.
      const most = b.comment === true ? OFFICE_COMMENT_MAX : GRANT_BODY_MAX;
      const text = cleanForumBody(b.body, most);
      if (!text) return json(400, { error: `Between one and ${most} characters.` }, QUIET);
      return answer(200, { blocks: b.comment === true ? parseBrass(text, { refs: true }) : parseBrass(text, { boxes: true, refs: true }) }, QUIET);
    }
    if (b.action === 'links') return answer(200, { found: await findLinks(who, typeof b.q === 'string' ? b.q : '') }, QUIET);
    if (b.action === 'comment') {
      const r = await commentOffice(who, String(b.id || ''), b.body);
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, { comment: r.comment }, QUIET);
    }
    if (b.action === 'comment-edit') {
      const r = await editOfficeComment(who, String(b.id || ''), String(b.c || ''), b.body);
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, { comment: r.comment }, QUIET);
    }
    if (b.action === 'comment-remove') {
      const r = await removeOfficeComment(who, String(b.id || ''), String(b.c || ''));
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, { gone: true }, QUIET);
    }
    if (b.action === 'contact-save') {
      const r = await saveContact(who, b);
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, { contact: r.contact }, QUIET);
    }
    if (b.action === 'contact-import') {
      const r = await importContacts(who, b.rows);
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, { told: r.told }, QUIET);
    }
    if (b.action === 'grant-save') {
      const r = await saveGrant(who, b);
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, { grant: r.grant }, QUIET);
    }
    if (b.action === 'grant-import') {
      const r = await importGrants(who, b.rows);
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, { told: r.told }, QUIET);
    }
    if (b.action === 'grant-remove') {
      const r = await removeGrant(who, String(b.id || ''));
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, { gone: true }, QUIET);
    }
    if (b.action === 'mail-remove') {
      const r = await removeEmail(who, String(b.id || ''));
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, { gone: true }, QUIET);
    }
    if (b.action === 'case-save') {
      const r = await saveCase(who, b);
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, { case: r.case }, QUIET);
    }
    if (b.action === 'case-import') {
      const r = await importCases(who, b.rows);
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, { told: r.told }, QUIET);
    }
    if (b.action === 'case-remove') {
      const r = await removeCase(who, String(b.id || ''));
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, { gone: true }, QUIET);
    }
    if (b.action === 'template-save') {
      const r = await saveTemplate(who, b);
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, { template: r.template }, QUIET);
    }
    if (b.action === 'template-remove') {
      const r = await removeTemplate(who, String(b.id || ''));
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, { gone: true }, QUIET);
    }
    if (b.action === 'mailing-preview') {
      const r = await previewMailing(who, b);
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, r, QUIET);
    }
    if (b.action === 'mailing-send') {
      const r = await sendMailing(who, b);
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, r, QUIET);
    }
    if (b.action === 'mailing-stop') {
      const r = await stopMailing(who, String(b.id || ''));
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, r, QUIET);
    }
    if (b.action === 'mailing-remove') {
      const r = await removeMailing(who, String(b.id || ''));
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, { gone: true }, QUIET);
    }
    if (b.action === 'qb-connect') {
      const r = await qbConnect(who, url.origin);
      if (r.error === 'not-set-up') return json(503, { error: 'QuickBooks is not set up: our Intuit app’s id and secret are not in Netlify’s settings.' }, QUIET);
      return r.error ? json(400, { error: 'That could not start.' }, QUIET) : answer(200, { go: r.go }, QUIET);
    }
    if (b.action === 'qb-read') {
      const r = await officeQuickBooks();
      if (r.error === 'not-connected') return json(400, { error: 'The office is not connected to QuickBooks.' }, QUIET);
      if (r.error === 'refresh') return json(400, { error: 'Intuit would not renew the office’s permission. Disconnect, then connect again.' }, QUIET);
      return r.error ? json(502, { error: 'QuickBooks did not answer just now. What the office last read is still here.' }, QUIET) : answer(200, { read: r.read }, QUIET);
    }
    if (b.action === 'gb-read') {
      const r = await officeGivebutter();
      if (r.error === 'not-set-up') return json(503, { error: 'Givebutter is not set up: our API key is not in Netlify’s settings.' }, QUIET);
      return r.error ? json(502, { error: 'Givebutter did not answer just now. What the office last read is still here.' }, QUIET) : answer(200, { read: r.read }, QUIET);
    }
    if (b.action === 'qb-disconnect') {
      const r = await qbDisconnect(who);
      return r.error ? json(400, { error: 'That did not disconnect.' }, QUIET) : answer(200, { gone: true }, QUIET);
    }
    if (b.action === 'contact-remove') {
      const r = await removeContact(who, String(b.id || ''));
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, { gone: true }, QUIET);
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
