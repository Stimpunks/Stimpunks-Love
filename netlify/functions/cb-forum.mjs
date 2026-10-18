/* The forums. Every answer needs a claimed username's pass, and a category the
   pass's roles do not reach is never in any answer. GET, with ?view=:
     home                    every category the reader may see, with its latest topics
     latest   &before=       every topic in them, the latest post first
     cat      &c= &before=   one category's topics, pinned ones first
     topic    &t=            one topic, every post in it
     search   &q=            topics whose title or posts hold every word
     cb       &room= &ids=   the messages that would be copied off a channel
   POST, with the same pass:
     { action: 'start', cat, title, body, from? }    a new topic; from: { room, ids } copies messages off the CB
     { action: 'reply', t, body, reply? }            a reply, to the topic or to one post in it
     { action: 'edit', t, p, body, title? }          your own post, and the title if you started it
     { action: 'remove', t, p }                      your own post, or any for a moderator
     { action: 'removeTopic', t }                    your topic while nobody else has posted, or any for a moderator
     { action: 'uncopy', t, p, m }                   a message of yours copied in from the CB, back out
     { action: 'react', t, p, emoji }                a reaction on, or off again
     { action: 'moderate', t, pin?, close?, move? }  a moderator pinning, closing or moving a topic
     { action: 'preview', body }                     how the words will set
   Nothing a person types is logged. See ../cb/lib.mjs, the forums. */
import { readPass, forumReader, forumNav, forumHome, forumLatest, forumCategory, forumTopic, searchForum,
  cbTranscript, shapeTranscript, startTopic, replyTopic, editPost, removePost, removeTopic, uncopyMessage,
  reactPost, moderateTopic, parseBrass, cleanForumBody, json, body, sameSite, FORUM_BODY_MAX, REACTIONS } from '../cb/lib.mjs';

// Never for search engines, and never cached anywhere: the forums are for
// claimed usernames, and a cached answer is a copy.
const QUIET = { 'x-robots-tag': 'noindex' };
const CLAIM = 'The forums are for claimed usernames. Claim yours from Profile on the radio, then come back.';

// The quick row of reactions, so the page keeps no copy of the list.
const quick = REACTIONS.map(([emoji, name]) => ({ emoji, name }));
const num = (v) => (v != null && /^\d{1,15}$/.test(v) ? Number(v) : null);

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'The forums only answer stimpunks.world.' }, QUIET);
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' }, QUIET);
  if (!forumReader(who)) return json(403, { error: CLAIM, claim: true }, QUIET);
  const me = { handle: who.handle, mod: who.role === 'base' };
  const cats = forumNav(who);
  const url = new URL(req.url);
  try {
    if (req.method === 'GET') {
      const view = url.searchParams.get('view') || 'home';
      if (view === 'home') return json(200, { me, cats, home: await forumHome(who) }, QUIET);
      if (view === 'latest') return json(200, { me, cats, ...(await forumLatest(who, num(url.searchParams.get('before')))) }, QUIET);
      if (view === 'cat') {
        const r = await forumCategory(who, url.searchParams.get('c'), num(url.searchParams.get('before')));
        return r ? json(200, { me, cats, ...r }, QUIET) : json(404, { me, cats, error: 'There is no such category.' }, QUIET);
      }
      if (view === 'topic') {
        const t = await forumTopic(who, url.searchParams.get('t'));
        return t ? json(200, { me, cats, topic: t, quick }, QUIET) : json(404, { me, cats, error: 'That topic has gone, or is not one you can read.' }, QUIET);
      }
      if (view === 'search') return json(200, { me, cats, results: await searchForum(who, url.searchParams.get('q') || '') }, QUIET);
      if (view === 'cb') {
        const ids = String(url.searchParams.get('ids') || '').split(',').filter(Boolean);
        const r = await cbTranscript(who, { room: url.searchParams.get('room') || null, ids });
        if (r.error) return json(400, { me, cats, error: r.error }, QUIET);
        return json(200, { me, cats, cb: shapeTranscript(r.cb, who), short: r.short }, QUIET);
      }
      return json(400, { error: 'Show what?' }, QUIET);
    }
    const b = (await body(req)) || {};
    if (b.action === 'preview') {
      const text = cleanForumBody(b.body);
      if (!text) return json(400, { error: `Between one and ${FORUM_BODY_MAX} characters.` }, QUIET);
      return json(200, { blocks: parseBrass(text) }, QUIET);
    }
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
    else return json(400, { error: 'Do what with it?' }, QUIET);
    if (r.error) return json(400, { error: r.error }, QUIET);
    if (r.gone) return json(200, { me, cats, gone: true }, QUIET);
    const id = r.topic ? r.topic.id : t;
    const topic = await forumTopic(who, id);
    return json(200, { me, cats, topic, quick, post: r.post ? r.post.id : null, gone: !topic }, QUIET);
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
