/* The forums. Every answer needs a claimed username's pass, and a category the
   pass's roles do not reach is never in any answer. GET, with ?view=:
     home                    every category the reader may see, with its latest topics
     latest   &before=       every topic in them, the latest post first
     cat      &c= &before= &tag=   one category's topics, pinned ones first; tag: only those carrying it
     topic    &t=            one topic, every post in it
     search   &q=            topics whose title or posts hold every word
     mentions                topics where somebody else has @mentioned you, worked out now
     people                  who the @ list offers: whoever started or last posted in a topic you can read,
                             and for Tasks' readers everybody Tasks can assign (forumPeople)
     templates               what a new topic can start from: the templates you may read
     cb       &room= &ids=   the messages that would be copied off a channel
   POST, with the same pass:
     { action: 'start', cat, title, body, tags?, from?, files?, at?, poll? }   a new topic; from: { room, ids } copies messages off the CB;
                                                     poll: { kind: 'hands' or 'sealed', q?, choices, many?, closes? } (cleanPoll)
     { action: 'reply', t, body, reply?, files?, at? }          a reply, to the topic or to one post in it
     { action: 'edit', t, p, body, title?, files?, at? }        your own post, and the title if you started it
       files: [{ id, alt? }], uploads from /cb/forum/file, and the post's own; at: the handles picked to @mention
     { action: 'remove', t, p }                      your own post, or any for a moderator
     { action: 'removeTopic', t }                    your topic while nobody else has posted, or any for a moderator
     { action: 'uncopy', t, p, m }                   a message of yours copied in from the CB, back out
     { action: 'react', t, p, emoji }                a reaction on, or off again
     { action: 'moderate', t, pin?, close?, move? }  a moderator pinning, closing or moving a topic
     { action: 'tag', t, tags }                      a topic's tags, by its starter, a wiki's editors or a moderator
     { action: 'vote', t, picks }                    a vote in the topic's poll; [] takes a show of hands' vote back
     { action: 'poll', t, open? }                    its starter or a moderator closing the poll, or opening a show of hands again
     { action: 'import', notion, cat, title, body, t, by, tags? }   a moderator bringing a page in from Notion,
                                                     at the time it was made and under the username that made it
                                                     (importTopic); it tells nobody
     { action: 'preview', body, pics? }              how the words will set; pics: the composer's pictures, placed where the words say
     { action: 'links', q }                          what [[ offers for q: the topics, and for staff the tasks and
                                                     the office's records, the reader can open (findLinks), by POST
   A post that @mentions somebody tells their devices, if they asked
   (notifyForum). Nothing a person types is logged. See ../cb/lib.mjs, the forums. */
import { readPass, forumReader, tasksAllow, officeAllow, nameRefs, findLinks, backlinksTo, forumPeople, forumNav, forumHome, forumLatest, forumCategory, forumTopic, searchForum, forumMentions,
  cbTranscript, shapeTranscript, startTopic, replyTopic, editPost, removePost, removeTopic, uncopyMessage,
  reactPost, votePoll, closePoll, moderateTopic, retagTopic, importTopic, notifyForum, parseBrass, cleanForumBody, json, body, sameSite, FORUM_BODY_MAX, REACTIONS,
  FORUM_ATTACH_MAX, FORUM_DOC_ATTACH_MAX, FORUM_DOC_BODY_MAX, FORUM_FILE_MAX, FORUM_FILE_TYPES, POLL_CHOICES_MAX, POLL_CHOICE_MAX, POLL_Q_MAX, forumTemplates, placePictures, imageId } from '../cb/lib.mjs';

// Never for search engines, and never cached anywhere: the forums are for
// claimed usernames, and a cached answer is a copy.
const QUIET = { 'x-robots-tag': 'noindex' };
const CLAIM = 'The forums are for claimed usernames. Claim yours under Account on the radio, then come back.';

// The quick row of reactions, so the page keeps no copy of the list.
const quick = REACTIONS.map(([emoji, name]) => ({ emoji, name }));
// What a post may carry, so the page keeps no copy of these either.
const takes = { most: FORUM_ATTACH_MAX, docMost: FORUM_DOC_ATTACH_MAX, body: FORUM_BODY_MAX, docBody: FORUM_DOC_BODY_MAX,
  fileMax: FORUM_FILE_MAX, kinds: Object.keys(FORUM_FILE_TYPES), choices: POLL_CHOICES_MAX, choice: POLL_CHOICE_MAX, q: POLL_Q_MAX };
const num = (v) => (v != null && /^\d{1,15}$/.test(v) ? Number(v) : null);

export default async (req, context) => {
  if (!sameSite(req)) return json(403, { error: 'The forums only answer stimpunks.world.' }, QUIET);
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' }, QUIET);
  if (!forumReader(who)) return json(403, { error: CLAIM, claim: true }, QUIET);
  // tasks and office say whether the bar offers them, a press away for the people who can open them.
  const me = { handle: who.handle, mod: who.role === 'base', tasks: tasksAllow(who), office: officeAllow(who) };
  // Every answer's links to tasks, topics and the office named for this reader, last.
  const answer = async (code, b, h) => json(code, await nameRefs(b, who), h);
  const cats = forumNav(who);
  const url = new URL(req.url);
  try {
    if (req.method === 'GET') {
      const view = url.searchParams.get('view') || 'home';
      if (view === 'home') return answer(200, { me, cats, takes, home: await forumHome(who) }, QUIET);
      if (view === 'latest') return answer(200, { me, cats, ...(await forumLatest(who, num(url.searchParams.get('before')))) }, QUIET);
      if (view === 'people') return answer(200, { people: await forumPeople(who) }, QUIET);
      if (view === 'cat') {
        const r = await forumCategory(who, url.searchParams.get('c'), num(url.searchParams.get('before')), undefined, undefined, url.searchParams.get('tag'));
        return r ? answer(200, { me, cats, ...r }, QUIET) : json(404, { me, cats, error: 'There is no such category.' }, QUIET);
      }
      if (view === 'topic') {
        const t = await forumTopic(who, url.searchParams.get('t'));
        return t ? answer(200, { me, cats, topic: t, quick, takes, backlinks: await backlinksTo(who, 'topic', t.id) }, QUIET) : json(404, { me, cats, error: 'That topic has gone, or is not one you can read.' }, QUIET);
      }
      if (view === 'search') return answer(200, { me, cats, results: await searchForum(who, url.searchParams.get('q') || '') }, QUIET);
      if (view === 'mentions') return answer(200, { me, cats, results: await forumMentions(who) }, QUIET);
      if (view === 'templates') return answer(200, { me, cats, templates: await forumTemplates(who) }, QUIET);
      if (view === 'cb') {
        const ids = String(url.searchParams.get('ids') || '').split(',').filter(Boolean);
        const r = await cbTranscript(who, { room: url.searchParams.get('room') || null, ids });
        if (r.error) return json(400, { me, cats, error: r.error }, QUIET);
        return answer(200, { me, cats, cb: shapeTranscript(r.cb, who), short: r.short }, QUIET);
      }
      return json(400, { error: 'Show what?' }, QUIET);
    }
    const b = (await body(req)) || {};
    if (b.action === 'preview') {
      // A preview sets words and keeps nothing, so it takes as many as a wiki page can hold.
      const text = cleanForumBody(b.body, FORUM_DOC_BODY_MAX);
      if (!text) return json(400, { error: `Between one and ${FORUM_DOC_BODY_MAX} characters.` }, QUIET);
      const pics = new Map((Array.isArray(b.pics) ? b.pics : []).slice(0, FORUM_DOC_ATTACH_MAX).map(imageId).filter(Boolean).map((id) => [id, '']));
      return answer(200, { blocks: placePictures(parseBrass(text, { refs: true }), pics) }, QUIET);
    }
    if (b.action === 'links') return answer(200, { found: await findLinks(who, typeof b.q === 'string' ? b.q : '') }, QUIET);
    let r;
    const t = String(b.t || ''), p = String(b.p || '');
    if (b.action === 'start') r = await startTopic(who, b);
    else if (b.action === 'reply') r = await replyTopic(who, t, b);
    else if (b.action === 'edit') r = await editPost(who, t, p, b);
    else if (b.action === 'remove') r = await removePost(who, t, p);
    else if (b.action === 'removeTopic') r = await removeTopic(who, t);
    else if (b.action === 'uncopy') r = await uncopyMessage(who, t, p, String(b.m || ''));
    else if (b.action === 'react') r = await reactPost(who, t, p, b.emoji);
    else if (b.action === 'moderate') r = await moderateTopic(who, t, b);
    else if (b.action === 'tag') r = await retagTopic(who, t, b);
    else if (b.action === 'vote') r = await votePoll(who, t, b.picks);
    else if (b.action === 'poll') r = await closePoll(who, t, b.open === true);
    else if (b.action === 'import') {
      r = await importTopic(who, b);
      // What happened, for the importer, which reads no topic back and tells nobody.
      return r.error ? json(400, { error: r.error }, QUIET) : answer(200, { id: r.topic.id, made: r.made, state: r.state }, QUIET);
    }
    else return json(400, { error: 'Do what with it?' }, QUIET);
    if (r.error) return json(400, { error: r.error }, QUIET);
    if (r.gone) return answer(200, { me, cats, gone: true }, QUIET);
    if (r.post && r.topic && ['start', 'reply', 'edit'].includes(b.action)) {
      const told = notifyForum(r.topic, r.post, r.before || '').catch(() => []);
      if (context && typeof context.waitUntil === 'function') context.waitUntil(told); else await told;
    }
    const id = r.topic ? r.topic.id : t;
    const topic = await forumTopic(who, id);
    return answer(200, { me, cats, topic, quick, takes, post: r.post && b.action !== 'edit' ? r.post.id : null, gone: !topic }, QUIET);
  } catch (e) {
    return json(503, { error: 'The forums are busy just now. Look again in a moment before trying again.' }, QUIET);
  }
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/forum',
  method: ['GET', 'POST'],
  rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
