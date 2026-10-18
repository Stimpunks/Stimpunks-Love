#!/usr/bin/env python3
"""Write the forums' categories into the CB, and hold the forums to what they
and privacy.html say.

Ryan's brief and calls, 2026-10-18: a forum after Discourse for discussions
that need to last longer than the CB's day, readable only by claimed usernames,
a keep per category (a week, three months, six months or never, counted from
the last post), categories kept to CB roles for staff areas, messages copied
in from the CB, and links previewed by our server reading the page once.

WHAT IT WRITES: data/forum.json's categories, between the forum:categories
markers in netlify/cb/lib.mjs, which is the only list the server reads. Never
hand-edit between those markers.

WHAT IT REFUSES, because a friendly edit could break each without a test
noticing (netlify/cb/lib.test.mjs tests what the code does):

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
    NETWORK: safeGet must look addresses up through safeLookup, which refuses
    anything publicAddress does not, and must never follow a redirect any other
    way.
  · A TALLY. Nothing about who reads is kept, so the shapes carry no views, no
    read marks and no unread anything, and forum.js puts no number beside
    replies, posts, topics, views, likes, people or members.
  · MARKUP FROM WHAT SOMEBODY TYPED: forum.js builds posts with markdown.js and
    textContent, never innerHTML or its relatives.
  · ANY STORAGE BUT love-forum, and writing love-cb, which only the radio does.
    forum.js talks to /cb/forum and reads /cb-rooms.json, and nothing else.
  · A COLOUR OF THE FORUMS' OWN. forum.css wears the CB's seven colours and
    nothing else, so every theme's pairs are the ones check-contrast.py
    already holds for the radio.
  · THE RADIO TYPING MESSAGES IN. cb.js only says which messages to take; the
    server copies them off the channel, so nobody can quote somebody into
    saying anything. cb.js must never send to /cb/forum.
  · privacy.html without the forums' section and love-forum, and the page
    without its link to them.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "forum.json"
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
FN = ROOT / "netlify" / "functions" / "cb-forum.mjs"
MIDNIGHT = ROOT / "netlify" / "functions" / "cb-midnight.mjs"
JS = ROOT / "forum.js"
CSS = ROOT / "forum.css"
PAGE = ROOT / "forum.html"
PRIVACY = ROOT / "privacy.html"
CB = ROOT / "cb.js"

KEEPS = ["1 week", "3 months", "6 months", "never"]
BEGIN = "/* forum:categories:begin -- written by tools/make-forum.py from data/forum.json. Do not hand-edit. */"
END = "/* forum:categories:end */"

problems = []


def code_of(path):
    c = re.sub(r"/\*.*?\*/", " ", path.read_text(), flags=re.S)
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
    for c in data.get("categories", []):
        slug = c.get("slug", "")
        where = f"{DATA.name}: category {slug or '(no slug)'}"
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug) or len(slug) > 60:
            problems.append(f"{where}: a slug is lower-case words joined by hyphens, sixty characters at most.")
        if slug in seen:
            problems.append(f"{where}: two categories share the slug.")
        seen.add(slug)
        for k in ("name", "about", "group"):
            if not isinstance(c.get(k), str) or not c[k].strip():
                problems.append(f"{where}: it has no {k}.")
        if c.get("keep") not in KEEPS:
            problems.append(f"{where}: keep is {c.get('keep')!r}, not one of {KEEPS}.")
        if slug == "coping" and c.get("keep") != "1 week":
            problems.append(f"{where}: Coping's topics go a week after the last post, Ryan's call; Discord keeping that channel for ever is what the forums are not doing.")
        for k in ("see", "start"):
            v = c.get(k)
            if v is None:
                continue
            if not isinstance(v, list) or not v or any(r not in roles for r in v):
                problems.append(f"{where}: {k} must be null or a list of CB_MODS roles ({', '.join(roles)}).")
        if c.get("strict") not in (None, True, False):
            problems.append(f"{where}: strict is true, false, or left out.")
        if c.get("strict") and not c.get("see"):
            problems.append(f"{where}: strict keeps an administrator out of a category that names roles; this one names none.")
        extra = set(c) - {"slug", "name", "about", "group", "keep", "see", "start", "strict"}
        if extra:
            problems.append(f"{where}: {', '.join(sorted(extra))} is nothing the forums read.")
        cat = {"slug": slug, "name": c.get("name"), "about": c.get("about"), "group": c.get("group"),
               "keep": c.get("keep"), "see": c.get("see"), "start": c.get("start")}
        if c.get("strict"):
            cat["strict"] = True
        out.append(cat)
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
    for name in ("forumHome", "forumLatest", "forumCategory", "forumTopic", "searchForum", "cbTranscript",
                 "startTopic", "replyTopic", "editPost", "removePost", "uncopyMessage", "reactPost",
                 "removeTopic", "moderateTopic"):
        body = fn(sec, name)
        if not body:
            problems.append(f"{LIB.name}: {name} is missing.")
        elif "forumReader(who)" not in body and "forumAllows(who" not in body and "forumCatsFor(who)" not in body:
            problems.append(f"{LIB.name}: {name} no longer asks whether the reader is a claimed username who may see the category.")
    for name in ("startTopic", "replyTopic", "editPost", "removePost", "uncopyMessage", "reactPost", "removeTopic", "moderateTopic"):
        if "if (!forumReader(who)) return { error: CLAIM };" not in fn(sec, name):
            problems.append(f"{LIB.name}: {name} must refuse anybody but a claimed username first.")
    if "who.account && typeof who.since === 'number'" not in fn(sec, "forumReader"):
        problems.append(f"{LIB.name}: forumReader no longer means a claimed username.")
    if "since: acct.since" not in lib:
        problems.append(f"{LIB.name}: readPass no longer gives a claimed pass the moment it was claimed, which every post's mark needs.")
    for name in ("shapePost", "shapeTopic", "shapeSummary", "shapeForumCat", "shapeCopied", "shapePreview"):
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
    if keys - {"id", "v", "title", "handle", "t", "last", "lastBy", "base", "lastBase", "pinned", "closed", "unpinned"}:
        problems.append(f"{LIB.name}: a topic's summary holds {sorted(keys)}; it holds what a list shows and nothing else.")
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
    if "canTakeOff(who, m)" not in fn(sec, "uncopyMessage"):
        problems.append(f"{LIB.name}: a copied message no longer comes out under the channel's own rule, canTakeOff.")
    if "readTuned(room, s)" not in fn(sec, "cbTranscript") or "quietRoom(room)" not in fn(sec, "cbTranscript"):
        problems.append(f"{LIB.name}: cbTranscript must copy off the channel itself, and never out of a quiet room.")
    if "sweepForum" not in MIDNIGHT.read_text():
        problems.append(f"{MIDNIGHT.name}: the hourly sweep no longer sweeps the forums, so a topic past its date would stay stored.")


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
    if "path: '/cb/forum'" not in f:
        problems.append(f"{FN.name}: it no longer answers at /cb/forum, where forum.js asks.")


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
        if url not in ("/cb/forum", "/cb-rooms.json", "/cb.css", "/forum.css", "/cb-themes.js", "/call.js", "/forum.html", "/privacy.html", "/cb-guide.html", "/community-center.html"):
            problems.append(f"{JS.name}: it calls {url}. The forums talk to /cb/forum and read the list of rooms, and nothing else.")
    for m in re.finditer(r"""\+\s*['"]\s*(replies|reply|posts|post|topics|topic|views|likes|people|members|readers|new)\b""", js):
        problems.append(f"{JS.name}: '{m.group(0).strip()}' looks like a number beside {m.group(1)}. Nothing in the forums is counted.")
    if re.search(r"\bunread\b|\bviews\b|\bview count", js, re.I):
        problems.append(f"{JS.name}: it speaks of views or unread. What is new to you is marked, never counted, and nothing about reading is kept by us.")


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


def check_cb():
    cb = code_of(CB)
    if "/cb/forum" in cb:
        problems.append(f"{CB.name}: the radio talks to /cb/forum. It only says which messages to take, in the address it opens; the server copies them.")
    if "forum.html#/new?" not in cb:
        problems.append(f"{CB.name}: Take to the forums no longer opens a new topic with the messages ticked.")


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
    check_function()
    check_js()
    check_css()
    check_page()
    check_cb()
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1
    print("the forums: the categories written into the CB, claimed usernames only, nothing about reading kept or counted, "
          "no author's mark sent, previews fetched only from public addresses, copies made by the server, "
          "and the forums dressed in the CB's own colours.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
