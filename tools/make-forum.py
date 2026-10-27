#!/usr/bin/env python3
"""Write the forums' categories into the CB, and hold the forums to what they
and privacy.html say.

Ryan's brief and calls, 2026-10-18: a forum after Discourse for discussions
that need to last longer than the CB's two weeks, readable only by claimed usernames,
a keep per category (a week, three months, six months or never, counted from
the last post), categories kept to CB roles for staff areas, messages copied
in from the CB, and links previewed by our server reading the page once. And
later the same day, Ryan's calls reversing "words only" and "no
notifications" for the forums: pictures and files in posts, and @mentions,
which tell a device only through the radio's own When somebody @mentions me.

WHAT IT WRITES: data/forum.json's categories, between the forum:categories
markers in netlify/cb/lib.mjs, which is the only list the server reads. Never
hand-edit between those markers.

WHAT IT REFUSES, because a friendly edit could break each without a test
noticing (netlify/cb/lib.test.mjs tests what the code does):

  · ANYBODY EDITING SOMEBODY ELSE'S POST OUTSIDE A WIKI. Ryan's call,
    2026-10-19: a Wiki category whose documents, the posts that open its
    topics, the roles it names edit whoever wrote them. Everywhere else, and
    on every reply in a wiki, only a post's author edits it, the channel's
    rule that putting words in somebody's mouth is nobody's. The friendly edit
    is to let moderators edit any post; editPost may reach past the author only
    through forumEditor, which refuses a category that names no wiki roles and
    any post but a topic's first. And the name of whoever edited a post last
    is sent with it (editedBy), so a moderator's words are never shown as the
    starter's. A wiki document goes only with its topic, so a reply never
    becomes the document, and a wiki keeps its pages for good.
  · A SUBCATEGORY WIDER THAN ITS CATEGORY. Ryan's ask, 2026-10-20, for Team
    Docs: a category can stand in another (parent), and this writes its
    parent's group, keep, roles, strict and wiki into it and refuses one that
    sets its own, so nobody is ever sent a subcategory of a category they
    cannot read. A shelf (topics: false) holds categories and no topics, and
    startTopic and a move must refuse it; a shelf with nothing on it is
    refused. `years` is the first year a category is filed by, and the server
    makes the rest as each year begins, so no file here changes with the date.
    A category's page reads only the categories under it the reader may see;
    templates are offered only from categories the reader may see, never their
    pinned read-me; and a picture stands in a post's words only if the post
    holds it, placed by placePictures in shapePost, so no picture from
    anywhere else is ever shown. A wiki's page, the post that opens one of
    its topics, may be 150,000 characters, so a long Google Doc or a board
    meeting's minutes with their transcript go up whole (Ryan's call, the same
    day); every other post, a reply in a wiki included, stays at 20,000, and
    only bodyMost decides which.
  · COPING KEPT LONGER THAN A WEEK. Ryan's call, 2026-10-18: Discord keeps that
    channel for ever, which is not what it is for, so here its topics go a week
    after the last post. The friendly edit is to lengthen it to match the others.
  · A CATEGORY THAT IS NOT WHOLE: a slug the server cannot use, two alike, no
    name, about or group, a keep that is not one of the four, roles that are
    not CB_MODS roles, a staff category nobody but an administrator could read.
  · ANYBODY BUT A CLAIMED USERNAME. Every exported forum function that reads or
    writes asks forumReader first, and the function refuses a pass that is not
    a claimed username's before it reads or does anything.
  · THE AUTHOR'S MARK LEAVING THE SERVER. It is how only a post's author edits
    it, and no shape a reader is sent may carry it.
  · A PREVIEW FETCH THAT COULD BE TALKED INTO ASKING THIS MACHINE OR A PRIVATE
    LINK CARDS on the CB (2026-10-24) and the oEmbed both read: words and a
    checked player address, never a picture or a site's own markup, read after
    a message goes out, drawn as elements, a player only love-embed.js's as a
    frame apart (check_cards).
    NETWORK: safeGet must look addresses up through safeLookup, which refuses
    anything publicAddress does not, and must never follow a redirect any other
    way.
  · A TALLY. Nothing about who reads is kept, so the shapes carry no views, no
    read marks and no unread anything, and forum.js puts no number beside
    replies, posts, topics, views, likes, people or members.
  · MARKUP FROM WHAT SOMEBODY TYPED: forum.js builds posts with markdown.js and
    textContent, never innerHTML or its relatives.
  · ANY STORAGE BUT love-forum, and writing love-cb, which only the radio does.
    forum.js talks to /cb/forum and /cb/forum/file, reads /cb-rooms.json, and
    asks /cb/online (the radio's Who's online) for the @ list, and nothing else.
  · A PICTURE WITH ITS CAMERA'S DATA, OR A FILE THAT RUNS. forum.js redraws a
    picture with window.loveRedraw, the radio's one redraw, and draws no canvas
    of its own; it saves a file as application/octet-stream and never opens
    one. The server refuses a picture still carrying camera data, a picture
    sent as a file, and any kind of file but FORUM_FILE_TYPES, which may not
    name a page, a script or an SVG; /cb/forum/file sends a file only to be
    saved, sniffed by nobody, sandboxed, and to no search engine.
  · A PICTURE OR FILE FOR ANYBODY BUT A READER OF ITS TOPIC: forumFile asks
    forumAllows and that a post in the topic holds it, every time.
  · A MENTION TOLD TO SOMEBODY WHO DID NOT ASK OR CANNOT READ IT: notifyForum
    tells only a device that switched on mentions, and only if its pass can
    read the category now. Who was mentioned where is worked out on every read
    and kept nowhere.
  · A COLOUR OF THE FORUMS' OWN. forum.css wears the CB's seven colours and
    nothing else, so every theme's pairs are the ones check-contrast.py
    already holds for the radio.
  · THE RADIO TYPING MESSAGES IN. cb.js only says which messages to take; the
    server copies them off the channel, so nobody can quote somebody into
    saying anything. cb.js must never send to /cb/forum.
  · A CATEGORY'S ROOM ON THE CB LOCKED BY ANYTHING BUT THE CATEGORY. Ryan's
    ask and calls, 2026-10-21: the radio's This room follows the category
    being read, and every category is a room under FORUM_ROOM and its slug,
    heard, seen in and called in by exactly the people who can read it, and a
    subcategory is its top category's room. So roomAllows must hand a
    category's tag to forumAllows and nothing else, forumRoom must refuse a
    subcategory's tag, and the tag's start and the room's name must be the same
    in lib.mjs, cb.js and forum.js. A page, a room of the base's, a quiet room,
    a pebble bowl or a public call named like a category's room is refused,
    because two rooms would share a tag; so is a category whose tag would be
    too long to be a room. A category that says it is `as` one of the Town
    Hall's rooms takes exactly that room's roles and strictness, so the two
    lists cannot drift apart.
  · A TAG THAT COUNTS OR A PAGE BROUGHT IN THAT SPEAKS. Ryan's ask, 2026-10-22,
    moving Notion's Grants table into Grantmaking: tags on a topic, which a
    category's page filters by and lists, never with how many topics carry
    each (forumCategory's tags come from tagsOf, a list of words); and pages
    brought from Notion by importTopic, which only a moderator may use, which
    tells nobody (the function never sends an import to notifyForum), and
    which keeps the page's own time and maker, so a topic says when and by
    whom it was really written. The friendly edits are a number beside each
    tag, and announcing the import "so people know the rounds are here".
  · A POLL THAT COUNTS ANYWHERE ELSE, OR A SEALED BALLOT THAT TELLS. Norah's
    ask, Ryan's calls, 2026-10-22: a topic can open with a poll, a show of
    hands or a sealed ballot, and polls are the one place the forums count,
    reversing the tally rule above for them alone. So a topic's summary says
    only that it has a poll (`poll`, true), shapePoll is the one shape that
    carries a number, and forum.js puts a number beside votes only between its
    poll:begin and poll:end markers, never sorting choices there, so the
    results stay in the poll's own order with no winner marked. A sealed
    ballot keeps who has voted apart from what was picked: sealVote writes the
    tally and the ballots and nothing else, the ballots sorted, and a ballot
    is a hash of the topic and the voter's mark, so it differs in every poll;
    votePoll refuses a second ballot, so a sealed vote is never changed;
    shapePoll returns before reading the tally or counting the ballots while
    the poll is open, so nobody, moderators included, is sent a number before
    it closes; closePoll never opens a sealed ballot again; and forum.js casts
    a sealed vote only after a second press. The friendly edits are a running
    count on a sealed ballot "so people can see the turnout", letting a sealed
    vote be changed by keeping who picked what, results sorted with the winner
    on top, and a list of who has not voted yet. A poll can be added to a
    topic later (Ryan's ask, the same day) by whoever may change its tags,
    and addPoll never puts one over a poll that is there, which would throw
    its votes away.
  · privacy.html without the forums' section and love-forum, and the page
    without its link to them.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import datetime
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "forum.json"
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
FN = ROOT / "netlify" / "functions" / "cb-forum.mjs"
FILES = ROOT / "netlify" / "functions" / "cb-forum-file.mjs"
MIDNIGHT = ROOT / "netlify" / "functions" / "cb-midnight.mjs"
JS = ROOT / "forum.js"
CSS = ROOT / "forum.css"
PAGE = ROOT / "forum.html"
PRIVACY = ROOT / "privacy.html"
CB = ROOT / "cb.js"

KEEPS = ["1 week", "3 months", "6 months", "never"]
AS = {}     # a category's slug, and the Town Hall room it says it is for the same people as
BEGIN = "/* forum:categories:begin -- written by tools/make-forum.py from data/forum.json. Do not hand-edit. */"
END = "/* forum:categories:end */"

problems = []


def code_of(path):
    return code_of_text(path.read_text())
def code_of_text(text):
    c = re.sub(r"/\*.*?\*/", " ", text, flags=re.S)
    return re.sub(r"(?m)^\s*//[^\n]*", " ", c)


def fn(src, name):
    m = re.search(rf"export (?:async )?function {name}\(.*?\n\}}", src, re.S)
    return m.group(0) if m else ""


def roles_of(lib):
    m = re.search(r"export const ROLES = \[([^\]]*)\]", lib)
    return re.findall(r"'([a-z]+)'", m.group(1)) if m else []


def categories(data, roles):
    out = []
    seen = set()
    default = data.get("default_keep")
    if default not in KEEPS or default == "never":
        problems.append(f"{DATA.name}: default_keep is {default!r}; it must be a week or a number of months, one of {KEEPS[:-1]}.")
    by_slug = {}
    year = datetime.date.today().year
    for c in data.get("categories", []):
        slug = c.get("slug", "")
        where = f"{DATA.name}: category {slug or '(no slug)'}"
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug) or len(slug) > 60:
            problems.append(f"{where}: a slug is lower-case words joined by hyphens, sixty characters at most.")
        if slug in seen:
            problems.append(f"{where}: two categories share the slug.")
        seen.add(slug)
        if re.fullmatch(r".+-\d{4}", slug) and slug.rsplit("-", 1)[0] in by_slug and by_slug[slug.rsplit("-", 1)[0]].get("years"):
            problems.append(f"{where}: the server makes that slug for one of {slug.rsplit('-', 1)[0]}'s years.")
        parent = c.get("parent")
        if parent is not None:
            up = by_slug.get(parent)
            if not up:
                problems.append(f"{where}: its parent, {parent!r}, is not a category earlier in the list.")
                continue
            # A subcategory is its parent's in everything but its name, its
            # words and what it holds, so nobody is ever sent a subcategory of
            # a category they cannot read.
            mine = set(c) & {"group", "keep", "see", "start", "strict", "wiki"}
            if mine:
                problems.append(f"{where}: a subcategory takes its parent's {', '.join(sorted(mine))}, and may not set its own.")
            depth = up["_depth"] + 1
            if depth > 2 or (depth == 2 and c.get("years")):
                problems.append(f"{where}: three levels at most, a category, its subcategories and theirs, and a year counts as one.")
            c = {**{k: up[k] for k in ("group", "keep", "see", "start", "strict", "wiki") if k in up}, **c}
        else:
            depth = 0
        if c.get("topics") not in (None, False):
            problems.append(f"{where}: topics is false, for a shelf, or left out.")
        if c.get("templates") not in (None, True):
            problems.append(f"{where}: templates is true, or left out.")
        if c.get("templates") and c.get("topics") is False:
            problems.append(f"{where}: a shelf holds no topics, so it can hold no templates.")
        if c.get("years") is not None and (not isinstance(c.get("years"), int) or isinstance(c.get("years"), bool) or not 2000 <= c["years"] <= year):
            problems.append(f"{where}: years is the first year it is filed by, a year no later than this one.")
        for k in ("name", "about", "group"):
            if not isinstance(c.get(k), str) or not c[k].strip():
                problems.append(f"{where}: it has no {k}.")
        if c.get("keep") not in KEEPS:
            problems.append(f"{where}: keep is {c.get('keep')!r}, not one of {KEEPS}.")
        if slug == "coping" and c.get("keep") != "1 week":
            problems.append(f"{where}: Coping's topics go a week after the last post, Ryan's call; Discord keeping that channel for ever is what the forums are not doing.")
        for k in ("see", "start", "wiki"):
            v = c.get(k)
            if v is None:
                continue
            if not isinstance(v, list) or not v or any(r not in roles for r in v):
                problems.append(f"{where}: {k} must be null or a list of CB_MODS roles ({', '.join(roles)}).")
        if c.get("strict") not in (None, True, False):
            problems.append(f"{where}: strict is true, false, or left out.")
        if c.get("strict") and not c.get("see"):
            problems.append(f"{where}: strict keeps an administrator out of a category that names roles; this one names none.")
        if c.get("wiki") and c.get("keep") != "never":
            problems.append(f"{where}: a wiki keeps its pages for good. An edit does not move a topic's clock, so a page nobody replied to would go.")
        extra = set(c) - {"slug", "name", "about", "group", "keep", "see", "start", "strict", "wiki", "parent", "topics", "years", "templates", "as"}
        if extra:
            problems.append(f"{where}: {', '.join(sorted(extra))} is nothing the forums read.")
        cat = {"slug": slug, "name": c.get("name"), "about": c.get("about"), "group": c.get("group"),
               "keep": c.get("keep"), "see": c.get("see"), "start": c.get("start")}
        if c.get("strict"):
            cat["strict"] = True
        if c.get("wiki"):
            cat["wiki"] = c.get("wiki")
        if parent is not None:
            cat["parent"] = parent
        if c.get("topics") is False:
            cat["shelf"] = True
        if c.get("years"):
            cat["years"] = c.get("years")
        if c.get("templates"):
            cat["templates"] = True
        if c.get("as") is not None:
            AS[slug] = c.get("as")
        out.append(cat)
        by_slug[slug] = {**cat, "_depth": depth}
    for cat in out:
        if cat.get("shelf") and not cat.get("years") and not any(x.get("parent") == cat["slug"] for x in out):
            problems.append(f"{DATA.name}: category {cat['slug']} is a shelf with nothing on it: a shelf holds subcategories or years.")
    if not out:
        problems.append(f"{DATA.name}: no categories.")
    return default, out


def write(lib, default, cats):
    block = (BEGIN + "\n"
             + f"export const FORUM_DEFAULT_KEEP = {json.dumps(default)};\n"
             + "export const FORUM_CATEGORIES = [\n"
             + "".join("  " + json.dumps(c, ensure_ascii=False) + ",\n" for c in cats)
             + "];\n" + END)
    pat = re.compile(re.escape(BEGIN) + r".*?" + re.escape(END), re.S)
    if len(pat.findall(lib)) != 1:
        problems.append(f"{LIB.name}: the forum:categories markers must be there exactly once.")
        return lib
    return pat.sub(lambda m: block, lib)


def check_lib(lib):
    start = lib.find("/* ── The forums ──")
    end = lib.find("/* ── What people type ──")
    sec = lib[start:end] if 0 <= start < end else ""
    if not sec:
        problems.append(f"{LIB.name}: the forums' section is missing.")
        return
    code = re.sub(r"/\*.*?\*/", " ", sec, flags=re.S)
    if "console." in code:
        problems.append(f"{LIB.name}: the forums' section writes to the console. Nothing anybody types is ever logged.")
    for name in ("forumHome", "forumLatest", "forumCategory", "forumTopic", "searchForum", "forumMentions", "cbTranscript",
                 "startTopic", "replyTopic", "editPost", "removePost", "uncopyMessage", "reactPost", "votePoll", "closePoll", "addPoll",
                 "removeTopic", "moderateTopic", "retagTopic", "importTopic", "forumFile", "putForumUpload", "forumTemplates"):
        body = fn(sec, name)
        if not body:
            problems.append(f"{LIB.name}: {name} is missing.")
        elif "forumReader(who)" not in body and "forumAllows(who" not in body and "forumCatsFor(who" not in body:
            problems.append(f"{LIB.name}: {name} no longer asks whether the reader is a claimed username who may see the category.")
    for name in ("startTopic", "replyTopic", "editPost", "removePost", "uncopyMessage", "reactPost", "votePoll", "closePoll", "addPoll", "removeTopic", "moderateTopic", "retagTopic", "importTopic", "putForumUpload"):
        if "if (!forumReader(who)) return { error: CLAIM };" not in fn(sec, name):
            problems.append(f"{LIB.name}: {name} must refuse anybody but a claimed username first.")
    if "who.account && typeof who.since === 'number'" not in fn(sec, "forumReader"):
        problems.append(f"{LIB.name}: forumReader no longer means a claimed username.")
    if "since: acct.since" not in lib:
        problems.append(f"{LIB.name}: readPass no longer gives a claimed pass the moment it was claimed, which every post's mark needs.")
    for name in ("shapePost", "shapeTopic", "shapeSummary", "shapeForumCat", "shapeCopied", "shapePreview", "shapeFile", "shapePoll"):
        m = re.search(rf"function {name}\(.*?\n\}}", sec, re.S)
        body = m.group(0) if m else ""
        if not body:
            problems.append(f"{LIB.name}: {name} is missing.")
            continue
        if re.search(r"\bby\s*:", body):
            problems.append(f"{LIB.name}: {name} sends a post's author mark. It never leaves the server.")
        for word in ("views", "seen", "read", "unread", "count", "total"):
            if re.search(rf"\b{word}\s*:", body):
                problems.append(f"{LIB.name}: {name} sends `{word}`. Nothing about reading is kept, and nothing is counted.")
    m = re.search(r"function summaryOf\(t\) \{.*?\n\}", sec, re.S)
    keys = set(re.findall(r"\b(\w+):", m.group(0))) | set(re.findall(r"sum\.(\w+) =", m.group(0))) if m else set()
    if keys - {"id", "v", "title", "handle", "t", "last", "lastBy", "base", "lastBase", "bot", "lastBot", "pinned", "closed", "unpinned", "tags", "notion", "poll"}:
        problems.append(f"{LIB.name}: a topic's summary holds {sorted(keys)}; it holds what a list shows and nothing else.")
    if m and "poll" in keys and "if (t.poll) sum.poll = true;" not in m.group(0):
        problems.append(f"{LIB.name}: a topic's summary says only that the topic has a poll, never anything about its votes.")
    check_polls(sec)
    check_cards(sec)
    get = fn(sec, "safeGet")
    if "lookup: safeLookup" not in get or "publicAddress(host)" not in get:
        problems.append(f"{LIB.name}: safeGet no longer checks the address it connects to through safeLookup and publicAddress.")
    if "safeGet(next, { ...o, deadline }, hops + 1)" not in get or "hops >= 3" not in get:
        problems.append(f"{LIB.name}: safeGet follows redirects some other way than through itself, three at most.")
    if re.search(r"\bfetch\(", code):
        problems.append(f"{LIB.name}: the forums' section calls fetch(), which follows redirects without checking where they go.")
    look = re.search(r"function safeLookup\(.*?\n\}", sec, re.S)
    if not look or "publicAddress(a.address)" not in look.group(0):
        problems.append(f"{LIB.name}: safeLookup no longer refuses an address publicAddress does not pass.")
    ed = fn(sec, "forumEditor")
    if "Array.isArray(cat.wiki)" not in ed or "forumAllows(who, cat)" not in ed:
        problems.append(f"{LIB.name}: forumEditor no longer refuses a category that names no wiki roles, or somebody who cannot read it.")
    ep = fn(sec, "editPost")
    if ep.count("forumEditor(who, cat)") < 2 or ep.count("p.by !== mark") + ep.count("was.by !== mark") < 2:
        problems.append(f"{LIB.name}: editPost lets somebody but a post's author edit it some other way than forumEditor, checked before and inside the write.")
    if re.search(r"who\.roles|who\.role !== 'base'|\|\|\s*who\.role === 'base'|who\.role === 'base'\s*\|\|", ep):
        problems.append(f"{LIB.name}: editPost asks for a role itself. Only forumEditor, in a wiki, lets anybody edit a post they did not write.")
    if "k === 0" not in ep or "editedBy = who.handle" not in ep:
        problems.append(f"{LIB.name}: editPost must let a wiki's editors edit only a topic's first post, and say on it who edited it last.")
    if "cat.wiki" not in fn(sec, "removePost"):
        problems.append(f"{LIB.name}: removePost lets a wiki document be taken down without its topic, which would make a reply the document.")
    sp = re.search(r"function shapePost\(.*?\n\}", sec, re.S)
    if not sp or "out.editedBy = p.editedBy" not in sp.group(0):
        problems.append(f"{LIB.name}: shapePost no longer says who edited a post last, so a moderator's words could be shown as the starter's.")
    bm = re.search(r"function bodyMost\(.*?\n", sec)
    if not bm or "cat.wiki && first ? FORUM_DOC_BODY_MAX : FORUM_BODY_MAX" not in bm.group(0):
        problems.append(f"{LIB.name}: bodyMost must give the long limit to a wiki's page and nothing else.")
    if "bodyMost(cat, true)" not in fn(sec, "startTopic") or "bodyMost(cat, pre.posts[0] === was)" not in fn(sec, "editPost"):
        problems.append(f"{LIB.name}: starting a topic and editing a post must hold the words to bodyMost, so only a wiki's page is long.")
    if re.search(r"FORUM_DOC_BODY_MAX|bodyMost", fn(sec, "replyTopic")):
        problems.append(f"{LIB.name}: a reply is never a page, so it is never as long as one.")
    if "cat.shelf" not in fn(sec, "startTopic") or "to.shelf" not in fn(sec, "moderateTopic"):
        problems.append(f"{LIB.name}: a shelf holds subcategories and no topics, so starting a topic in one or moving a topic into one must be refused.")
    if "forumTree(cat, now).filter((c) => forumAllows(who, c))" not in sec:
        problems.append(f"{LIB.name}: a category's page lists the topics under it some other way than asking forumAllows of every category it reads.")
    if "forumCatsFor(who, now).filter((x) => x.templates)" not in fn(sec, "forumTemplates") or "!x.pinned" not in fn(sec, "forumTemplates"):
        problems.append(f"{LIB.name}: forumTemplates must offer only the templates the reader may see, and never a templates category's pinned read-me.")
    if "pics.has(m[2])" not in fn(sec, "placePictures") or "placePictures(withPreviews(parseBrass(p.body || '', { refs: true }), p.links), pics, placed)" not in sec:
        problems.append(f"{LIB.name}: a picture in the words must be one of the post's own, placed by placePictures in shapePost; anything else written that way stays words, so no picture from elsewhere is ever shown.")
    it = fn(sec, "importTopic")
    if "if (who.role !== 'base')" not in it or "forumAllows(who, cat, 'start')" not in it:
        problems.append(f"{LIB.name}: importTopic must refuse anybody but a moderator who may start topics in the category.")
    if "notifyForum" in it or "makePost(" in it:
        problems.append(f"{LIB.name}: importTopic tells nobody and makes no post in the importer's name: a page keeps its own time and maker.")
    if "tags: tagsOf(all)" not in fn(sec, "forumCategory") or not re.search(r"function tagsOf\(list\) \{ return \[\.\.\.new Set\(list\.flatMap\(\(x\) => x\.tags \|\| \[\]\)\)\]\.sort\(\); \}", sec):
        problems.append(f"{LIB.name}: a category's tags must be the words its topics carry, from tagsOf, never with how many carry each.")
    if "canTakeOff(who, m)" not in fn(sec, "uncopyMessage"):
        problems.append(f"{LIB.name}: a copied message no longer comes out under the channel's own rule, canTakeOff.")
    if "readTuned(room, s)" not in fn(sec, "cbTranscript") or "quietRoom(room)" not in fn(sec, "cbTranscript"):
        problems.append(f"{LIB.name}: cbTranscript must copy off the channel itself, and never out of a quiet room.")
    # The checks are uploadMeta's, shared with Tasks' pictures and files (2026-10-27).
    up = fn(sec, "putForumUpload")
    meta = re.search(r"\nfunction uploadMeta\(.*?\n\}", sec, re.S)
    meta = meta.group(0) if meta else ""
    if "uploadMeta(" not in up or "carriesMetadata(bytes, type)" not in meta or "fileKind(bytes, name" not in meta:
        problems.append(f"{LIB.name}: putForumUpload no longer refuses a picture still carrying its camera's data, or a file that is not what it says.")
    if "picturish(bytes)" not in fn(sec, "fileKind"):
        problems.append(f"{LIB.name}: fileKind no longer refuses a picture sent as a file, which would keep its camera's data.")
    m = re.search(r"export const FORUM_FILE_TYPES = \{(.*?)\n\};", sec, re.S)
    kinds = re.findall(r"^\s*([a-z0-9]+):", m.group(1), re.M) if m else []
    if not kinds:
        problems.append(f"{LIB.name}: FORUM_FILE_TYPES cannot be read.")
    for bad in ("svg", "html", "htm", "xhtml", "xml", "js", "mjs", "exe", "zip", "docm", "xlsm", "pptm", "heic", "jpg", "jpeg", "png", "gif", "webp"):
        if bad in kinds:
            problems.append(f"{LIB.name}: FORUM_FILE_TYPES takes .{bad}. A page, a script, an archive, a document with macros or a picture is never a forum file.")
    ff = fn(sec, "forumFile")
    if "forumAllows(who, cat)" not in ff or "p.files" not in ff:
        problems.append(f"{LIB.name}: forumFile no longer asks whether the reader can read the topic, and whether a post in it holds the file.")
    nf = fn(lib, "notifyForum")
    # wants(), never the switch by name, so Everything reaches it (check-push.py).
    if "forumAllows(who, cat)" not in nf or "wants(d.want, 'mentions')" not in nf or "deviceWho(d, s, mods)" not in nf:
        problems.append(f"{LIB.name}: notifyForum must tell only a device that asked about mentions, whose pass can read the category now.")
    if "sweepForum" not in MIDNIGHT.read_text():
        problems.append(f"{MIDNIGHT.name}: the hourly sweep no longer sweeps the forums, so a topic past its date would stay stored.")


def check_cards(sec):
    """The CB's link cards (2026-10-24) and the oEmbed they read: words and a
    checked player address, never a picture and never anybody else's markup;
    read after a message goes out; drawn as elements; a player only through
    love-embed.js, as a frame apart."""
    oe = re.search(r"export function oembedOf\(.*?\n\}", sec, re.S)
    ret = re.search(r"\n  return \{(.*?)\n  \};", oe.group(0), re.S) if oe else None
    keys = set(re.findall(r"^\s{4}(\w+)\s*[:,]", ret.group(1) + ",", re.M)) if ret else set()
    if not oe or keys != {"type", "title", "author", "site", "said", "about", "length", "player"}:
        problems.append(f"{LIB.name}: oembedOf answers {sorted(keys)}: words, a runtime and a player's address, and never "
                        "a site's own html or a thumbnail, which no page of ours ever draws.")
    part = re.search(r"/\* OEMBED \(2026-10-24.*?\n// What a reader is sent of a card\.\nfunction shapeChatPreview\(l\) \{.*?\n\}", sec, re.S)
    if not part:
        problems.append(f"{LIB.name}: the oEmbed and link-card part (OEMBED to shapeChatPreview) has gone, so this tool cannot hold it.")
    else:
        code = code_of_text(part.group(0))
        if re.search(r"thumbnail|innerHTML|outerHTML", code):
            problems.append(f"{LIB.name}: the link cards read a thumbnail or keep a site's own markup. A card is words.")
    tx = (ROOT / "netlify/functions/cb-transmit.mjs").read_text()
    if tx.find("unfurlMessage(room, msg.id, text)") < tx.find("notifyMessage(msg"):
        problems.append("cb-transmit.mjs: a message's links must be read after it has gone out, so sending never waits on somebody else's site.")
    cb = code_of(CB)
    draw = re.search(r"Radio\.prototype\.drawUnfurls = .*?\n  function unfurlCard\(l\) \{.*?\n  \}", cb, re.S)
    if not draw:
        problems.append(f"{CB.name}: drawUnfurls and unfurlCard have gone, so this tool cannot hold the link cards.")
    else:
        d = draw.group(0)
        if re.search(r"innerHTML|insertAdjacentHTML|el\('img'|createElement\('img'|new Image|createElement\('iframe'", d):
            problems.append(f"{CB.name}: a link card draws a picture, a frame of its own or markup from a string. A card is "
                            "elements built from words, and a player comes from love-embed.js.")
        if "E.frame(l.id, l.title, null, true)" not in d or not re.search(r"E\.frameUrl\([^;]*, l\.title, true\)", d):
            problems.append(f"{CB.name}: a link card's player must be love-embed.js's, built as a frame apart, so Host this "
                            "film and Follow never hear about a video playing in a message.")
    if 'id="link-cards"' not in PRIVACY.read_text():
        problems.append("privacy.html has no #link-cards saying what our server reads of a link in a CB message.")


def check_polls(sec):
    """The one place the forums count, and a sealed ballot that tells nobody who picked what."""
    def body(name):
        m = re.search(rf"function {name}\(.*?\n\}}", sec, re.S)
        return m.group(0) if m else ""
    shape, seal, vote, close, ballot, add = (body(n) for n in ("shapePoll", "sealVote", "votePoll", "closePoll", "ballotOf", "addPoll"))
    if not all((shape, seal, vote, close, ballot, add)):
        problems.append(f"{LIB.name}: shapePoll, sealVote, votePoll, closePoll, ballotOf and addPoll must all be there.")
        return
    if "if (t.poll) return { why:" not in add or "t.by !== mark && !forumEditor(who, cat) && who.role !== 'base'" not in add:
        problems.append(f"{LIB.name}: addPoll must refuse a topic that has a poll, whose votes it would throw away, and anybody who may not change the topic's tags.")
    gate = shape.find("if (sealedOpen) return out;")
    if "const sealedOpen = !shut;" not in shape or gate < 0 or any(shape.find(x) < gate for x in ("poll.tally", "poll.cast.length")):
        problems.append(f"{LIB.name}: shapePoll must return before it reads a sealed ballot's tally or counts its ballots while the poll is open.")
    wrote = set(re.findall(r"poll\.(\w+)(?:\[[^\]]*\])?\s*=(?!=)", seal))
    if wrote != {"tally", "cast"} or ".sort()" not in seal or re.search(r"cast\s*=.*picks", seal):
        problems.append(f"{LIB.name}: sealVote writes the tally and the sorted ballots and nothing else, so nothing kept says who picked what.")
    if "t.id" not in ballot or "authorMark(who)" not in ballot:
        problems.append(f"{LIB.name}: a ballot is a hash of the topic and the voter's mark, so it differs in every poll.")
    at = vote.find("if (poll.cast.includes(ballot))")
    if at < 0 or at > vote.find("sealVote(") or "if (pollShut(poll, now))" not in vote:
        problems.append(f"{LIB.name}: votePoll must refuse a vote in a closed poll, and a second ballot before it seals one.")
    if "if (poll.kind === 'sealed') return { why:" not in close:
        problems.append(f"{LIB.name}: closePoll must never open a sealed ballot again once its results are out.")


def check_sealed(lib):
    """EVERY TOPIC, LIST, FILE AND UPLOAD SEALED AT REST (Ryan's call, 2026-10-25),
    by name at the store under CB_STAFF_KEY, all categories and not only the
    staff ones, because a moved topic keeps its name. The friendly edits are
    sealing only the staff categories, which leaves a topic moved out of one in
    the clear, and a fallback to the clear "so the forums keep working"."""
    m = re.search(r"const STAFF_SEALED = \[(.*?)\];\n", lib, re.S)
    if not m or "/^forum\\/[ct]\\//" not in m.group(1):
        problems.append(f"{LIB.name}: STAFF_SEALED no longer names every forum topic and category list, so one is written in the clear.")
    b = re.search(r"const STAFF_BYTES = \[(.*?)\];\n", lib, re.S)
    if not b or "forum-file" not in b.group(1) or "forum-up" not in b.group(1):
        problems.append(f"{LIB.name}: STAFF_BYTES no longer names the forums' files and uploads, so one is written in the clear.")
    if "forum" not in (re.search(r"const SEAL_PASS = '([^']*)'", lib) or [None, ""])[1]:
        problems.append(f"{LIB.name}: SEAL_PASS does not cover the forums, so the sweep never seals what came before the key.")
    for f in ("cb-forum", "cb-forum-file"):
        if "if (!staffReady())" not in (ROOT / "netlify" / "functions" / f"{f}.mjs").read_text():
            problems.append(f"netlify/functions/{f}.mjs: it does not shut without the staff key.")
    priv = (ROOT / "privacy.html").read_text()
    i = priv.find('id="forums"')
    sec = priv[i:priv.find("<h2", i + 10)] if i >= 0 else ""
    if "sealed at rest" not in sec or "not end-to-end" not in sec:
        problems.append("privacy.html: the forums section does not say the forums are sealed at rest and not end-to-end.")


def check_function():
    if not FN.exists():
        problems.append(f"{FN.name}: missing.")
        return
    f = code_of(FN)
    gate = f.find("if (!forumReader(who))")
    first = min([i for i in (f.find("view ==="), f.find("b.action ===")) if i >= 0] or [-1])
    if gate < 0 or first < 0 or gate > first:
        problems.append(f"{FN.name}: it must refuse anybody but a claimed username before it reads or does anything.")
    if "'x-robots-tag': 'noindex'" not in f:
        problems.append(f"{FN.name}: its answers must ask search engines not to keep them.")
    m = re.search(r"\[([^\]]*)\]\.includes\(b\.action\)", f)
    if not m or "import" in m.group(1):
        problems.append(f"{FN.name}: a page brought in from Notion tells nobody, so 'import' is never among the actions that notify.")
    if "path: '/cb/forum'" not in f:
        problems.append(f"{FN.name}: it no longer answers at /cb/forum, where forum.js asks.")
    if not FILES.exists():
        problems.append(f"{FILES.name}: missing.")
        return
    g = code_of(FILES)
    gate = g.find("if (!forumReader(who))")
    first = min([i for i in (g.find("forumFile("), g.find("putForumUpload(")) if i >= 0] or [-1])
    if gate < 0 or first < 0 or gate > first:
        problems.append(f"{FILES.name}: it must refuse anybody but a claimed username before it reads or puts up anything.")
    for need, why in (("'application/octet-stream'", "a file is sent as nothing a browser would show"),
                      ("content-disposition", "a file is sent to be saved"),
                      ("'x-content-type-options': 'nosniff'", "nobody may guess a file is a page"),
                      ("sandbox", "nothing in a file may run as a page of ours"),
                      ("x-robots-tag", "no search engine keeps one")):
        if need not in g:
            problems.append(f"{FILES.name}: {need} is gone: {why}.")


def check_js():
    if not JS.exists():
        problems.append(f"{JS.name}: missing.")
        return
    js = code_of(JS)
    for bad in ("innerHTML", "outerHTML", "insertAdjacentHTML", "document.write", "DOMParser", "createContextualFragment"):
        if bad in js:
            problems.append(f"{JS.name}: {bad}. A post is built from nodes with textContent, never as HTML.")
    if "window.loveMarkdown.blocks" not in js:
        problems.append(f"{JS.name}: it builds a post some way other than markdown.js, the street's one builder.")
    if "sessionStorage" in js or "indexedDB" in js:
        problems.append(f"{JS.name}: it stores something outside love-forum.")
    for key in set(re.findall(r"localStorage\.(?:setItem|removeItem)\(\s*([^,)]+)", js)):
        if key.strip() not in ("SEEN", "'love-forum'"):
            problems.append(f"{JS.name}: it writes {key.strip()} into the browser. It keeps love-forum and reads love-cb, and nothing else.")
    if not re.search(r"var SEEN = 'love-forum';", js):
        problems.append(f"{JS.name}: its one key in the browser is love-forum.")
    for url in set(re.findall(r"""['"](/[a-z][^'"?#]*)""", js)):
        if url not in ("/cb/forum", "/cb/forum/file", "/cb/online", "/cb-rooms.json", "/cb.css", "/forum.css", "/cb-themes.js", "/call.js", "/forum.html", "/privacy.html", "/cb-guide.html", "/community-center.html", "/tasks.html", "/office.html"):
            problems.append(f"{JS.name}: it calls {url}. The forums talk to /cb/forum and /cb/forum/file, read the list of rooms and Who's online, and nothing else.")
    if "window.loveRedraw(file)" not in js or re.search(r"getContext\(|toBlob\(|OffscreenCanvas", js):
        problems.append(f"{JS.name}: a picture must be redrawn by window.loveRedraw, the radio's one redraw, and by no canvas of the forums' own.")
    if "type: 'application/octet-stream'" not in js or re.search(r"window\.open\(|\.target\s*=", js):
        problems.append(f"{JS.name}: a file is saved as application/octet-stream and never opened here.")
    for m in re.finditer(r"""\+\s*['"]\s*(replies|reply|posts|post|topics|topic|views|likes|people|members|readers|new)\b""", js):
        problems.append(f"{JS.name}: '{m.group(0).strip()}' looks like a number beside {m.group(1)}. Nothing in the forums is counted.")
    if re.search(r"\bunread\b|\bviews\b|\bview count", js, re.I):
        problems.append(f"{JS.name}: it speaks of views or unread. What is new to you is marked, never counted, and nothing about reading is kept by us.")
    raw = JS.read_text()
    a, b = raw.find("/* poll:begin */"), raw.find("/* poll:end */")
    if a < 0 or b < a or raw.count("/* poll:begin */") != 1:
        problems.append(f"{JS.name}: a topic's poll is drawn between one pair of poll:begin and poll:end markers.")
        return
    inside = re.sub(r"/\*.*?\*/", " ", raw[a:b], flags=re.S)
    outside = code_of_text(raw[:a] + raw[b:])
    for m in re.finditer(r"\bvotes\(|\bpollTally\(|\+\s*['\"]\s*(?:votes?|ballots?)\b", outside):
        problems.append(f"{JS.name}: '{m.group(0)}' outside the poll markers. Polls are the one place the forums count.")
    if ".sort(" in inside:
        problems.append(f"{JS.name}: a poll's choices are sorted. Its results stay in the poll's own order, with no winner marked.")
    if "sure(row, 'Your vote for '" not in inside or "'Cast my vote'" not in inside:
        problems.append(f"{JS.name}: a sealed vote must go only after a second press, because it cannot be taken back.")


def check_css():
    if not CSS.exists():
        problems.append(f"{CSS.name}: missing.")
        return
    css = re.sub(r"/\*.*?\*/", " ", CSS.read_text(), flags=re.S)
    for m in re.finditer(r"#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|(?<![-\w])(?:white|black|red|blue|green|yellow|gray|grey)(?![-\w])", css):
        problems.append(f"{CSS.name}: {m.group(0)}. The forums wear the CB's seven colours, var(--cb-*), and nothing else.")
    for m in re.finditer(r"var\(--([a-z0-9-]+)", css):
        if not m.group(1).startswith("cb-"):
            problems.append(f"{CSS.name}: var(--{m.group(1)}). The forums wear the CB's own tokens and nothing else.")


def check_page():
    if not PAGE.exists():
        problems.append(f"{PAGE.name}: missing.")
        return
    page = PAGE.read_text()
    at = [page.find(f'<script src="{s}" defer></script>') for s in ("markdown.js", "forum.js")]
    if min(at) < 0 or at[0] > at[1]:
        problems.append(f"{PAGE.name}: it must load markdown.js, then forum.js.")
    if 'href="privacy.html#forums"' not in page:
        problems.append(f"{PAGE.name}: the page must link what the forums keep, privacy.html#forums.")
    if re.search(r'data-cb="off"', page):
        problems.append(f"{PAGE.name}: the radio must come here; Take to the forums starts on it.")
    priv = PRIVACY.read_text()
    if 'id="forums"' not in priv or "<code>love-forum</code>" not in priv:
        problems.append(f"{PRIVACY.name}: it has no forums section (id=\"forums\") or does not list love-forum.")
    if 'id="polls"' not in priv or "sealed ballot" not in priv:
        problems.append(f"{PRIVACY.name}: it does not say what a poll keeps (id=\"polls\"), a show of hands and a sealed ballot each.")


def check_cb():
    cb = code_of(CB)
    if "/cb/forum" in cb:
        problems.append(f"{CB.name}: the radio talks to /cb/forum. It only says which messages to take, in the address it opens; the server copies them.")
    if "forum.html#/new?" not in cb:
        problems.append(f"{CB.name}: Take to the forums no longer opens a new topic with the messages ticked.")


def strings_of(lib, name):
    m = re.search(rf"export const {name} = \[([^\]]*)\]", lib)
    return re.findall(r"'([a-z0-9-]+)'", m.group(1)) if m else None


def check_rooms(lib, cats):
    """Every category is a room on the CB, locked by the category alone."""
    prefix = re.search(r"export const FORUM_PAGE = '([a-z]+)';\nexport const FORUM_ROOM = FORUM_PAGE \+ '-';", lib)
    if not prefix:
        problems.append(f"{LIB.name}: FORUM_PAGE and FORUM_ROOM, the forums' own room and the start of every category's, cannot be read.")
        return
    page, room = prefix.group(1), prefix.group(1) + "-"
    allows = fn(lib, "roomAllows")
    if not re.search(r"if \(typeof tag === 'string' && tag\.startsWith\(FORUM_ROOM\)\) \{\s*const cat = forumRoom\(tag\);\s*return !!cat && forumAllows\(who, cat\);\s*\}", allows) \
            or allows.find("FORUM_ROOM") > allows.find("modRoom(tag)"):
        problems.append(f"{LIB.name}: roomAllows must hand a forum category's room to forumAllows, first and with nothing else, so the category's roles are the only list.")
    if "return cat && !cat.parent ? cat : null;" not in fn(lib, "forumRoom"):
        problems.append(f"{LIB.name}: forumRoom must refuse a subcategory's tag: a subcategory is its top category's room.")
    if "!c.parent && forumAllows(who, c)" not in fn(lib, "forumRooms"):
        problems.append(f"{LIB.name}: forumRooms must name only the rooms of top categories the pass may read.")
    name = re.search(r"export function forumRoomName\(cat\) \{ return `([^`$]*)\$\{cat\.name\}`; \}", lib)
    if not name:
        problems.append(f"{LIB.name}: forumRoomName, what a category's room is called, cannot be read.")
        return
    cb, js = code_of(CB), code_of(JS)
    if f"var FORUM_PAGE = '{page}', FORUM_ROOM = FORUM_PAGE + '-';" not in cb:
        problems.append(f"{CB.name}: its FORUM_PAGE and FORUM_ROOM are not lib.mjs's ('{page}', '{room}').")
    if f"var FORUM_ROOM = '{room}', FORUM_ROOM_NAME = '{name.group(1)}';" not in js:
        problems.append(f"{JS.name}: its FORUM_ROOM and FORUM_ROOM_NAME are not lib.mjs's ('{room}', '{name.group(1)}').")
    if "pathOf(catOf(slug))[0]" not in js or "window.dispatchEvent(new CustomEvent('love-forum-room'))" not in js:
        problems.append(f"{JS.name}: placeRadio must name a category the server sent, by its top category, and say love-forum-room when it moves.")
    if "addEventListener('love-forum-room'" not in cb or "data-forum-room" not in cb:
        problems.append(f"{CB.name}: the radio no longer follows the forums from category to category.")
    for html in sorted(ROOT.rglob("*.html")):
        if html.stem.startswith(room) and ".git" not in html.parts:
            problems.append(f"{html.relative_to(ROOT)}: a page named like a forum category's room, whose tag it would share.")
    try:
        listed = json.loads((ROOT / "cb-rooms.json").read_text()).get("rooms", [])
    except (OSError, ValueError):
        listed = None
    if listed is not None and not any(r.get("tag") == page and r.get("path") == f"/{page}.html" for r in listed):
        problems.append(f"cb-rooms.json: the forums are not the room '{page}' at /{page}.html, which every category's room stands under.")
    mods = re.search(r"export const MOD_ROOMS = \{(.*?)\n\};", lib, re.S)
    mod_roles = {k: re.findall(r"'([a-z]+)'", v) for k, v in re.findall(r"^\s*'([a-z0-9-]+)':\s*\[([^\]]*)\]", mods.group(1), re.M)} if mods else {}
    if not mod_roles:
        problems.append(f"{LIB.name}: MOD_ROOMS cannot be read.")
    strict = strings_of(lib, "STRICT_ROOMS") or []
    names = {"MOD_ROOMS": list(mod_roles)}
    for n in ("QUIET_ROOMS", "PEBBLE_ROOMS", "PUBLIC_CALLS", "STRICT_ROOMS"):
        got = strings_of(lib, n)
        if got is None:
            problems.append(f"{LIB.name}: {n} cannot be read.")
        names[n] = got or []
    for n, tags in names.items():
        for t in tags:
            if t.startswith(room):
                problems.append(f"{LIB.name}: {n} names {t}, which is shaped like a forum category's room.")
    for c in cats:
        if len(room + c["slug"]) > 80 - 5:
            problems.append(f"{DATA.name}: category {c['slug']}'s room, {room}{c['slug']}, is too long to be a room on the CB, with a year after it.")
    by = {c["slug"]: c for c in cats}
    for slug, town in AS.items():
        c = by.get(slug, {})
        if town not in mod_roles:
            problems.append(f"{DATA.name}: category {slug} says it is as {town!r}, which is none of MOD_ROOMS.")
            continue
        if sorted(c.get("see") or []) != sorted(mod_roles[town]) or bool(c.get("strict")) != (town in strict):
            problems.append(f"{DATA.name}: category {slug} says it is for the same people as {town}, which takes {mod_roles[town]}"
                            f"{' and is strict' if town in strict else ''}; the category says {c.get('see')}{' and strict' if c.get('strict') else ''}.")


def check_bot(lib):
    """THE WIKI'S BOT (Ryan's choice, 2026-10-26): a signed key for Claude to
    keep the Wiki's and Team Docs' pages up to date. It writes only there, only
    by starting a page or editing one, under its own name marked bot and never
    base, calls no role, tells nobody, and its tool never prints its key."""
    part = re.search(r"/\* THE WIKI'S BOT .*?\nexport async function forumBot\(.*?\n\}\n", lib, re.S)
    if not part:
        problems.append(f"{LIB.name}: the Wiki's bot (THE WIKI'S BOT to forumBot) has gone, so this tool cannot hold it.")
        return
    code = code_of_text(part.group(0))
    tops = re.search(r"FORUM_BOT_TOPS = \[([^\]]*)\]", code)
    if not tops or sorted(re.findall(r"'([^']+)'", tops.group(1))) != ["team-docs", "wiki"]:
        problems.append(f"{LIB.name}: FORUM_BOT_TOPS must be exactly the Wiki and Team Docs. Widening the bot to "
                        "another category is Ryan's call, written on privacy.html#forum-bot first.")
    if "cat.strict" not in code or "cat.shelf" not in code:
        problems.append(f"{LIB.name}: botCat must refuse a strict category and a shelf.")
    body = re.search(r"export async function forumBot\(.*?\n\}", code, re.S).group(0)
    calls = set(re.findall(r"\b(\w+)\(", body)) - {"forumBot", "store", "now", "forumBotWho", "page", "forumCat", "botCat", "readForumIndex", "readTopic",
        "topicLive", "summaryOf", "editPost", "startTopic", "forumCategories", "filter", "map", "slice", "if", "return", "some"}
    if calls:
        problems.append(f"{LIB.name}: forumBot calls {sorted(calls)}. It lists, reads, starts and edits a page, and nothing "
                        "else: no reply, no take down, no notifyForum.")
    if re.search(r"files\s*:|poll\s*:|from\s*:", body):
        problems.append(f"{LIB.name}: forumBot passes files, a poll or a copy from the CB. It writes words only.")
    who = re.search(r"function forumBotWho\(\) \{\s*return \{(.*?)\};", code, re.S)
    if not who or "bot: true" not in who.group(1) or "FORUM_BOT_NAME" not in who.group(1):
        problems.append(f"{LIB.name}: the bot must write as FORUM_BOT_NAME with bot: true.")
    if not re.search(r"\[\.\.\.Object\.values\(FEED_NAMES\), FORUM_BOT_NAME\]", lib):
        problems.append(f"{LIB.name}: botWord must keep FORUM_BOT_NAME from being anybody's username.")
    if not re.search(r"if \(!who \|\| who\.bot\) return \[\];", lib):
        problems.append(f"{LIB.name}: mentionableRoles must give the bot no role to call.")
    if "if (who.bot) p.bot = true; else if (who.role === 'base') p.base = true;" not in lib:
        problems.append(f"{LIB.name}: makePost must mark the bot's post bot, never base.")
    fn = (ROOT / "netlify/functions/cb-forum-bot.mjs").read_text()
    if "forumBotSigned(req.headers.get('x-stimpunks-signature'), raw)" not in fn or "notifyForum" in fn:
        problems.append("cb-forum-bot.mjs: every request must be checked with forumBotSigned before it is read, and the bot tells nobody.")
    tool = (ROOT / "tools/forum-bot.mjs").read_text()
    if re.search(r"console\.(log|error)\([^)]*key\(\)", tool) or "process.argv" in tool and "--key" in tool:
        problems.append("tools/forum-bot.mjs: the bot's key is read from 1Password and never printed or taken as an argument.")
    if 'id="forum-bot"' not in (ROOT / "privacy.html").read_text():
        problems.append("privacy.html: the Wiki's bot needs its section (#forum-bot) saying what its key can read and write.")


def check_tab():
    """THE TAB'S TITLE (2026-10-26): a topic's or a category's name, and only
    "Staff" for a staff category, whose topics can name somebody and would land
    in the browser's history. A search's words never go into it."""
    js = (ROOT / "forum.js").read_text()
    code = code_of_text(js)
    if "function placeTitle(cat, words) { tabTitle(cat && cat.staff ? 'Staff' : words); }" not in code:
        problems.append("forum.js: placeTitle must say only Staff for a staff category's topics and pages.")
    sets = re.findall(r"document\.title\s*=", code)
    if len(sets) != 1 or "function tabTitle(words) { document.title =" not in code:
        problems.append("forum.js: the tab's title is set by tabTitle and nowhere else, so placeTitle's rule cannot be skipped.")
    for m in re.finditer(r"\btabTitle\(([^)]*)\)", code):
        arg = m.group(1)
        if re.search(r"\b(t|c|topic|cat)\.(title|name)\b|\bq\b|\bq\.q\b", arg):
            problems.append(f"forum.js: tabTitle({arg}) puts a name or a search's words in the tab without placeTitle's staff rule.")


def main():
    data = json.loads(DATA.read_text())
    lib = LIB.read_text()
    roles = roles_of(lib)
    if not roles:
        problems.append(f"{LIB.name}: ROLES cannot be read.")
    default, cats = categories(data, roles)
    if not problems:
        new = write(lib, default, cats)
        if new != lib:
            LIB.write_text(new)
            lib = new
    check_lib(lib)
    check_rooms(lib, cats)
    check_function()
    check_js()
    check_css()
    check_page()
    check_cb()
    check_sealed(lib)
    check_bot(lib)
    check_tab()
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1
    print("the forums: the categories written into the CB, claimed usernames only, nothing about reading kept or counted, "
          "a poll's votes the one count and a sealed ballot keeping nobody's pick, "
          "no author's mark sent, previews fetched only from public addresses, copies made by the server, "
          "every category a room on the CB locked by its own roles, and the forums dressed in the CB's own colours.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
