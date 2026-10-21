/* Tasks, the team's to-do list. Every answer needs the pass of a claimed
   username holding one of TASK_SEE's roles, or administrator; everybody else
   is told nothing. GET, with ?view=:
     list                    every task, without its description, who a task can be assigned to,
                             the reader's own saved filters, and every recurring task; any task a
                             recurring task owes is made first
     recur    &id=           one recurring task, its description as words and as nodes, and the tasks it made
     task     &id=           one task, its description as words and as nodes, and its activity, newest first
     inbox                   the reader's own notifications, newest first, how many are unread, and the
                             tasks of theirs due by tomorrow or overdue
     feed     &ids=          up to FEED_PAGE tasks, each whole, with its latest changes: one page of
                             the Feed, whose order and filters the page works out
   POST, with the same pass:
     { action: 'save', id?, espo?, notion?, name?, status?, priority?, start?, due?, body?, who?, with?, tags? }
         a new task, or a change to the one `id` names; only the fields sent change.
         espo: EspoCRM's id for a task brought over, so bringing it again changes it
         rather than making it twice; with it, t, done and by may say EspoCRM's own.
         notion: a Notion page's id, the same for a task brought from Notion, where
         by and done may be null because Notion does not say.
     { action: 'tick', id, n, text, on }             checkbox n in a task's description ticked (on) or
                                                     not; text is the words the page saw beside it
     { action: 'remove', id }                        a task deleted
     { action: 'inbox-read', ids | all: true }       the reader's notifications marked read: those ids, or all
     { action: 'preview', body }                     how a description will set
     { action: 'view-save', id?, name, address }     a saved filter: a name and the #/ or #/board
                                                     address of a list or a board, new or in place of `id`
     { action: 'view-remove', id }                   a saved filter deleted
     { action: 'recur-save', id?, espo?, name?, body?, who?, with?, tags?, priority?, repeats?, next?,
       startAfter?, dueAfter?, on? }                 a recurring task, new or changed; only the fields sent change
     { action: 'recur-remove', id }                  a recurring task deleted; the tasks it made stay
   Nothing a person types is logged. See ../cb/lib.mjs, tasks. */
import { readPass, forumReader, tasksAllow, taskPeople, tasksList, taskOne, saveTask, tickTask, removeTask, taskViews, saveTaskView,
  taskInbox, readTaskInbox, taskActivity, taskFeed, FEED_PAGE,
  removeTaskView, taskRecurs, taskRecur, saveRecur, removeRecur, makeRecurring, parseBrass,
  cleanForumBody, json, body, sameSite, TASK_STATUSES, TASK_DONE, TASK_PRIORITIES, TASK_DEFAULT_PRIORITY,
  TASK_TAGS, TASK_NAME_MAX, TASK_BODY_MAX, TASK_BOARD_HIDES, TASK_VIEW_NAME_MAX, TASK_REPEATS, TASK_AFTER_MAX, TASK_COLOURS, TASK_TAG_COLOURS } from '../cb/lib.mjs';

// Never for search engines, and never cached anywhere.
const QUIET = { 'x-robots-tag': 'noindex' };
const settings = { statuses: TASK_STATUSES, done: TASK_DONE, priorities: TASK_PRIORITIES, priority: TASK_DEFAULT_PRIORITY,
  tags: TASK_TAGS, nameMax: TASK_NAME_MAX, bodyMax: TASK_BODY_MAX, boardHides: TASK_BOARD_HIDES, viewNameMax: TASK_VIEW_NAME_MAX,
  repeats: Object.keys(TASK_REPEATS), afterMax: TASK_AFTER_MAX, colours: TASK_COLOURS, tagColours: TASK_TAG_COLOURS, feedPage: FEED_PAGE };

/* A task a recurring task made says which, while that recurring task is there. */
async function withFrom(who, t) {
  if (t && t.recur) { const r = await taskRecur(who, t.recur); t.from = r ? { id: r.id, name: r.name } : null; }
  return t;
}

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'Tasks only answer stimpunks.world.' }, QUIET);
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' }, QUIET);
  if (!tasksAllow(who)) {
    return json(403, forumReader(who)
      ? { error: 'Tasks are for our directors and administrators.' }
      : { error: 'Tasks are for our directors and administrators, on a claimed username. Claim yours under Account on the radio.', claim: true }, QUIET);
  }
  const me = { handle: who.handle };
  const url = new URL(req.url);
  try {
    if (req.method === 'GET') {
      const view = url.searchParams.get('view') || 'list';
      if (view === 'list') {
        // Whatever a recurring task owes is made before the list is read, so nobody waits for the hour.
        try { await makeRecurring(); } catch (e) { /* the hourly run makes it */ }
        const [tasks, views, recurs, inbox] = await Promise.all([tasksList(who), taskViews(who), taskRecurs(who), taskInbox(who)]);
        return json(200, { me, settings, people: taskPeople(), tasks, views, recurs, unread: inbox.unread }, QUIET);
      }
      if (view === 'recur') {
        const r = await taskRecur(who, url.searchParams.get('id'));
        if (!r) return json(404, { error: 'That recurring task has been deleted.' }, QUIET);
        const made = (await tasksList(who)).filter((t) => t.recur === r.id);
        return json(200, { me, settings, people: taskPeople(), recur: r, made }, QUIET);
      }
      if (view === 'task') {
        const t = await taskOne(who, url.searchParams.get('id'));
        if (t) await withFrom(who, t);
        if (!t) return json(404, { error: 'That task has been deleted.' }, QUIET);
        const [activity, inbox] = await Promise.all([taskActivity(who, t.id), taskInbox(who)]);
        return json(200, { me, settings, people: taskPeople(), task: t, activity, unread: inbox.unread }, QUIET);
      }
      if (view === 'inbox') return json(200, { me, settings, inbox: await taskInbox(who) }, QUIET);
      if (view === 'feed') return json(200, { me, settings, feed: await taskFeed(who, String(url.searchParams.get('ids') || '').split(',')) }, QUIET);
      return json(400, { error: 'Show what?' }, QUIET);
    }
    const b = (await body(req)) || {};
    if (b.action === 'preview') {
      const text = cleanForumBody(b.body, TASK_BODY_MAX);
      if (!text) return json(400, { error: `Between one and ${TASK_BODY_MAX} characters.` }, QUIET);
      return json(200, { blocks: parseBrass(text, { boxes: true }) }, QUIET);
    }
    if (b.action === 'save') {
      const r = await saveTask(who, b);
      return r.error ? json(400, { error: r.error }, QUIET) : json(200, { task: await withFrom(who, r.task) }, QUIET);
    }
    if (b.action === 'tick') {
      const r = await tickTask(who, String(b.id || ''), b.n, b.text, b.on);
      return r.error ? json(400, { error: r.error }, QUIET) : json(200, { task: await withFrom(who, r.task) }, QUIET);
    }
    if (b.action === 'remove') {
      const r = await removeTask(who, String(b.id || ''));
      return r.error ? json(400, { error: r.error }, QUIET) : json(200, { gone: true }, QUIET);
    }
    if (b.action === 'inbox-read') {
      const r = await readTaskInbox(who, b.all === true ? 'all' : b.ids);
      return r.error ? json(400, { error: r.error }, QUIET) : json(200, { unread: r.unread }, QUIET);
    }
    if (b.action === 'view-save') {
      const r = await saveTaskView(who, b);
      return r.error ? json(400, { error: r.error }, QUIET) : json(200, { views: r.views }, QUIET);
    }
    if (b.action === 'view-remove') {
      const r = await removeTaskView(who, String(b.id || ''));
      return r.error ? json(400, { error: r.error }, QUIET) : json(200, { views: r.views }, QUIET);
    }
    if (b.action === 'recur-save') {
      const r = await saveRecur(who, b);
      return r.error ? json(400, { error: r.error }, QUIET) : json(200, { recur: r.recur }, QUIET);
    }
    if (b.action === 'recur-remove') {
      const r = await removeRecur(who, String(b.id || ''));
      return r.error ? json(400, { error: r.error }, QUIET) : json(200, { gone: true }, QUIET);
    }
    return json(400, { error: 'Do what with it?' }, QUIET);
  } catch (e) {
    return json(503, { error: 'Tasks are busy just now. Look again in a moment before trying again.' }, QUIET);
  }
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/tasks',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 240, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
