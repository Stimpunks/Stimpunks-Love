/* Tasks, the team's to-do list. Every answer needs the pass of a claimed
   username holding one of TASK_SEE's roles, or administrator; everybody else
   is told nothing. GET, with ?view=:
     list                    every task, without its description, and who a task can be assigned to
     task     &id=           one task, its description as words and as nodes
   POST, with the same pass:
     { action: 'save', id?, espo?, name?, status?, priority?, start?, due?, body?, who?, with?, tags? }
         a new task, or a change to the one `id` names; only the fields sent change.
         espo: EspoCRM's id for a task brought over, so bringing it again changes it
         rather than making it twice; with it, t, done and by may say EspoCRM's own.
     { action: 'remove', id }                        a task deleted
     { action: 'preview', body }                     how a description will set
   Nothing a person types is logged. See ../cb/lib.mjs, tasks. */
import { readPass, forumReader, tasksAllow, taskPeople, tasksList, taskOne, saveTask, removeTask, parseBrass,
  cleanForumBody, json, body, sameSite, TASK_STATUSES, TASK_DONE, TASK_PRIORITIES, TASK_DEFAULT_PRIORITY,
  TASK_TAGS, TASK_NAME_MAX, TASK_BODY_MAX } from '../cb/lib.mjs';

// Never for search engines, and never cached anywhere.
const QUIET = { 'x-robots-tag': 'noindex' };
const settings = { statuses: TASK_STATUSES, done: TASK_DONE, priorities: TASK_PRIORITIES, priority: TASK_DEFAULT_PRIORITY,
  tags: TASK_TAGS, nameMax: TASK_NAME_MAX, bodyMax: TASK_BODY_MAX };

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
      if (view === 'list') return json(200, { me, settings, people: taskPeople(), tasks: await tasksList(who) }, QUIET);
      if (view === 'task') {
        const t = await taskOne(who, url.searchParams.get('id'));
        return t ? json(200, { me, settings, people: taskPeople(), task: t }, QUIET) : json(404, { error: 'That task has been deleted.' }, QUIET);
      }
      return json(400, { error: 'Show what?' }, QUIET);
    }
    const b = (await body(req)) || {};
    if (b.action === 'preview') {
      const text = cleanForumBody(b.body, TASK_BODY_MAX);
      if (!text) return json(400, { error: `Between one and ${TASK_BODY_MAX} characters.` }, QUIET);
      return json(200, { blocks: parseBrass(text) }, QUIET);
    }
    if (b.action === 'save') {
      const r = await saveTask(who, b);
      return r.error ? json(400, { error: r.error }, QUIET) : json(200, { task: r.task }, QUIET);
    }
    if (b.action === 'remove') {
      const r = await removeTask(who, String(b.id || ''));
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
