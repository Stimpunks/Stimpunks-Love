#!/usr/bin/env python3
"""Fill the street's two spaces in The Sandbox, write CONTRIBUTING.md, and hold
the suggestion box to what it says.

    python3 tools/make-sandbox.py

WHAT IT IS FOR. The Sandbox is somebody's own room, brought in by
tools/import-room.py and not ours to redesign, and its maker is named in its
credits only, at their ask: nothing this writes names them. Ryan's brief, 2026-10-13, put two things of the
street's into it: a suggestion box that works, where anybody signed on to the CB
drops in a suggestion, a feature request or a bug report and a moderator answers
it, and the steps for getting the street's code onto your own computer with
Claude and sending a change back. The room's artifact holds a space for each
(data-street="suggestions", data-street="contribute"); this writes what goes in
them, between street:<name> markers, out of data/sandbox.json, and writes
CONTRIBUTING.md from the very same steps, so the page and the repository can
never tell anybody two different ways in.

IT REFUSES, RATHER THAN WRITING SOMETHING THAT WOULD BE UNTRUE:
  · a space missing from the page. The room's next version might leave one out,
    and then the box and the steps are nowhere; the fix is a word with its maker,
    or a decision about where they go instead, never this tool guessing.
  · markup in the words beyond **bold**, `code` and [links], a site: page or
    anchor that does not exist, a repo: file that does not exist, and a tools/
    command naming a script that is not there.
  · NOTHING ANYBODY TYPES BECOMES MARKUP. suggest.js and markdown.js build what
    is in the box with createElement and textContent: no innerHTML, outerHTML,
    insertAdjacentHTML, document.write, DOMParser or createContextualFragment in
    either. The friendly edit is "just use innerHTML for the Markdown", and that
    is a script on a page anybody reads, written by anybody with the community
    password.
  · suggest.js storing anything, or asking anywhere but /cb/suggestions and
    /cb/suggestions/image; and markdown.js asking anywhere at all.
  · A PICTURE IN THE BOX (Ryan's call, 2026-10-25, reversing words only) going
    any way but the CB's one redraw: suggest.js drawing on a canvas of its own;
    the server taking one from somebody signed off, one still carrying camera
    data, one with no description, one nobody said they had looked at, or
    somebody else's upload; a picture shown while nothing in the box holds it;
    one outliving what held it; its answer leaving out noindex; or the privacy
    page losing the section that says all of that.
  · the server's rules going soft: anybody signed on drops one in; only
    whoever dropped it in and our moderators reply (canTakeOff on the
    suggestion), every reply has words, and only a moderator's marks it; WHERE
    IT STANDS IS WORKED OUT FROM THE REPLIES, never kept apart, so no mark is
    left without the reply that made it; a reply is edited by whoever wrote it
    (canEdit) and taken down by them or a moderator (canTakeOff); and taking a
    suggestion down goes through canTakeOff, the CB's own rule for a message.
  · ME TOO BECOMING A VOTE (Ryan's ask, 2026-10-25): it names who, never how
    many. The server sends names, alphabetically, and the box is never sorted
    by them; suggest.js never reads how long the list is; and whoever dropped
    it in cannot say Me too to their own.
  · ITS NOTIFICATIONS GOING WIDER (2026-10-25): what is new in the box tells
    only a moderator's pass that switched it on, a moderator's reply tells only
    whoever asked, neither tells whoever wrote it, and the box's function still
    sends them once a suggestion or a reply is in.
  · the page's write section not shipping hidden, its scripts out of order, or
    the link to privacy.html#suggestions going nowhere.
  · the street's CSS for the box using any colour that is not the room's own: a
    convention wears the room's ink, never a new look laid over the room.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import html as H
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/sandbox.json"
LOVE = ROOT / "love.css"
CONTRIB = ROOT / "CONTRIBUTING.md"
JS = ROOT / "suggest.js"
MD = ROOT / "markdown.js"
LIB = ROOT / "netlify/cb/lib.mjs"
FN = ROOT / "netlify/functions/cb-suggest.mjs"
FN_IMG = ROOT / "netlify/functions/cb-suggest-image.mjs"
SWEEP = ROOT / "netlify/functions/cb-midnight.mjs"
PRIVACY = ROOT / "privacy.html"
SITE = "https://stimpunks.world/"

problems = []
data = json.loads(DATA.read_text())
PAGE = ROOT / data["page"]
REPO = data["repo"].rstrip("/")
pages = {}


def page_ids(name):
    if name not in pages:
        p = ROOT / name
        pages[name] = set(re.findall(r'\bid="([^"]+)"', p.read_text())) if p.exists() else None
    return pages[name]


# ── The three marks ──────────────────────────────────────────────────────────

LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")
BOLD = re.compile(r"\*\*(.+?)\*\*")
CODE = re.compile(r"`([^`]+)`")


def check(s, where):
    rest = CODE.sub("", s)
    rest = LINK.sub(lambda m: m.group(1), rest)
    rest = BOLD.sub(lambda m: m.group(1), rest)
    if re.search(r"[<>*`\[\]]|&\w+;", rest):
        problems.append(f"{where}: markup this tool does not write: {s[:80]!r}. Three marks only: "
                        "**bold**, `code` and [words](where).")
    for _, href in LINK.findall(s):
        target(href, where)


def target(href, where):
    if href.startswith("https://"):
        return
    if href.startswith("#"):
        return  # checked once the blocks are written, against the room
    if href.startswith("site:"):
        name, _, anchor = href[5:].partition("#")
        ids = page_ids(name)
        if ids is None:
            problems.append(f"{where}: {name} is not a page on the street.")
        elif anchor and anchor not in ids:
            problems.append(f"{where}: {name} has no id=\"{anchor}\" to link to.")
        return
    if href.startswith("repo:"):
        name = href[5:].partition("#")[0]
        if name != CONTRIB.name and not (ROOT / name).exists():
            problems.append(f"{where}: {name} is not a file in the repository.")
        return
    problems.append(f"{where}: [..]({href}) goes nowhere this tool knows: https://, #id, site: or repo:.")


def href_for(href, md):
    if href.startswith("site:"):
        rest = href[5:]
        return SITE + rest if md else rest
    if href.startswith("repo:"):
        rest = href[5:]
        return rest if md else f"{REPO}/blob/main/{rest}"
    if href.startswith("#") and md:
        return SITE + data["page"] + href
    return href


def html_of(s):
    out, i = [], 0
    for m in re.finditer(r"`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)", s):
        out.append(_html_text(s[i:m.start()]))
        if m.group(1) is not None:
            out.append(f"<code>{H.escape(m.group(1), quote=False)}</code>")
        else:
            words = _html_text(m.group(2))
            href = H.escape(href_for(m.group(3), False), quote=True)
            out.append(f'<a href="{href}">{words}</a>')
        i = m.end()
    out.append(_html_text(s[i:]))
    return "".join(out)


def _html_text(s):
    s = H.escape(s, quote=False)
    return BOLD.sub(lambda m: f"<strong>{m.group(1)}</strong>", s)


def md_of(s):
    return LINK.sub(lambda m: f"[{m.group(1)}]({href_for(m.group(2), True)})", s)


def walk(items, where):
    for k, it in enumerate(items):
        if isinstance(it, dict):
            if set(it) != {"list"} or not isinstance(it["list"], list):
                problems.append(f"{where}[{k}]: a paragraph is a string and a list is {{\"list\": [...]}}.")
                continue
            for j, li in enumerate(it["list"]):
                check(li, f"{where}[{k}].list[{j}]")
        else:
            check(it, f"{where}[{k}]")


def paras_html(items, indent):
    pad = " " * indent
    out = []
    for it in items:
        if isinstance(it, dict):
            out.append(f"{pad}<ul>")
            out += [f"{pad}  <li>{html_of(li)}</li>" for li in it["list"]]
            out.append(f"{pad}</ul>")
        else:
            out.append(f"{pad}<p>{html_of(it)}</p>")
    return out


def paras_md(items):
    out = []
    for it in items:
        if isinstance(it, dict):
            out += [f"- {md_of(li)}" for li in it["list"]] + [""]
        else:
            out += [md_of(it), ""]
    return out


# ── Check the words ──────────────────────────────────────────────────────────

board, contrib = data["board"], data["contribute"]
walk(board["how"], "board.how")
for key in ("signon", "noscript"):
    check(board[key], f"board.{key}")
walk(contrib["intro"], "contribute.intro")
seen = set()
for st in contrib["steps"]:
    sid = st.get("id", "?")
    if sid in seen or not re.fullmatch(r"[a-z]+", sid):
        problems.append(f"step {sid!r}: an id is lowercase letters, and one per step.")
    seen.add(sid)
    if not st.get("title"):
        problems.append(f"step {sid!r}: no title.")
    for part in ("words", "after"):
        walk(st.get(part, []), f"step {sid}.{part}")
    for c in st.get("commands", []):
        for script in re.findall(r"\btools/[\w.-]+", c):
            if not (ROOT / script).exists():
                problems.append(f"step {sid!r}: `{c}` runs {script}, which is not in the repository.")
walk(contrib["cb"]["words"], "contribute.cb.words")
walk(contrib["cb"]["after"], "contribute.cb.after")
check(contrib["fine"], "contribute.fine")
if not (ROOT / "tools/setup.sh").exists() or not (ROOT / "tools/setup.sh").stat().st_mode & 0o111:
    problems.append("tools/setup.sh is missing or not executable, and the steps tell everybody to run it.")
if ".env" not in (ROOT / ".gitignore").read_text().split():
    problems.append(".gitignore does not ignore .env, and the steps tell people to put passwords in it.")


# ── The board, in the suggestion box ─────────────────────────────────────────

def board_block():
    p = "      "
    out = [f'{p}<div class="sbs-board" id="suggestion-box">',
           f'{p}  <h3 class="sbs-list-h" id="suggest-how-h">{H.escape(board["how_h"])}</h3>']
    out += paras_html(board["how"], 8)
    out += [
        f'{p}  <div class="sbs-write" id="suggest-write" hidden>',
        f'{p}    <p class="sbs-signed">{H.escape(board["signed"])} <b id="suggest-who"></b>{H.escape(board["signed_after"])}</p>',
        f'{p}    <p><button type="button" class="sbs-btn" id="suggest-new">Drop one in</button></p>',
        f'{p}  </div>',
        f'{p}  <p class="sbs-signon" id="suggest-signon" hidden>{html_of(board["signon"])}</p>',
        f'{p}  <p class="sbs-said" id="suggest-said" role="status"></p>',
        f'{p}  <h3 class="sbs-list-h" id="suggest-list-h">In the box</h3>',
        f'{p}  <div class="sbs-filter" id="suggest-filter" role="group" aria-label="What to show" hidden>',
    ]
    for key, words in (("all", "Everything"), ("open", "Open"), ("done", "Done"), ("denied", "Not doing")):
        out.append(f'{p}    <button type="button" class="sbs-btn sbs-btn--small" data-show="{key}" '
                   f'aria-pressed="{"true" if key == "all" else "false"}">{words}</button>')
    out += [
        f'{p}  </div>',
        f'{p}  <p class="sbs-state" id="suggest-state">{html_of(board["noscript"])}</p>',
        f'{p}  <div class="sbs-items" id="suggest-items" hidden></div>',
        f'{p}</div>',
    ]
    return "\n".join(out)


def cmd_html(lines, indent):
    """What to type, on the room's screen. Focusable, because a long line scrolls
    sideways and a keyboard has to be able to scroll it; unnamed, because a
    <pre> takes no name, and its words are its name."""
    pad = " " * indent
    code = "\n".join(H.escape(c, quote=False) for c in lines)
    return f'{pad}<pre class="sbs-cmd" tabindex="0"><code>{code}</code></pre>'


def contribute_block():
    out = [f'  <h2 class="sbs-dig-h" id="sbs-dig">{H.escape(contrib["heading"])}</h2>']
    out += paras_html(contrib["intro"], 2)
    out.append('  <ol class="sbs-steps">')
    for st in contrib["steps"]:
        out.append(f'    <li class="sbs-step" id="sbs-step-{st["id"]}">')
        out.append(f'      <h3>{H.escape(st["title"])}</h3>')
        out += paras_html(st.get("words", []), 6)
        if st.get("commands"):
            out.append(cmd_html(st["commands"], 6))
        out += paras_html(st.get("after", []), 6)
        out.append("    </li>")
    out.append("  </ol>")
    out.append(f'  <p class="sbs-fine">{html_of(contrib["fine"])}</p>')
    return "\n".join(out)


def contributing_md():
    c = contrib
    out = [
        "<!-- Written by tools/make-sandbox.py from data/sandbox.json, the same steps The Sandbox",
        f"     shows at {SITE}{data['page']}#sbs-dig. Edit the data file and run the tool, never this. -->",
        "",
        f"# {c['heading']}",
        "",
    ]
    out += paras_md(c["intro"])
    out += [f"The same steps are on the street, in [The Sandbox]({SITE}{data['page']}#sbs-dig), beside "
            f"its [suggestion box]({SITE}{data['page']}#suggestion-box): anybody signed on to the CB can "
            "drop a suggestion, a feature request or a bug report in it, and our moderators answer.", ""]
    for n, st in enumerate(c["steps"], 1):
        out += [f"## {n}. {st['title']}", ""]
        out += paras_md(st.get("words", []))
        if st.get("commands"):
            out += ["```bash", *st["commands"], "```", ""]
        out += paras_md(st.get("after", []))
    out += [f"## {c['cb']['heading']}", ""]
    out += paras_md(c["cb"]["words"])
    out += ["```", *c["cb"]["file"], "```", ""]
    out += ["```bash", *c["cb"]["commands"], "```", ""]
    out += paras_md(c["cb"]["after"])
    out += [md_of(c["fine"]), ""]
    return "\n".join(out)


# ── Hold the promises the page makes ─────────────────────────────────────────

def code_of(path):
    c = re.sub(r"/\*.*?\*/", " ", path.read_text(), flags=re.S)
    return re.sub(r"(?m)^\s*//[^\n]*", " ", c)


def fn(src, name):
    m = re.search(rf"export (?:async )?function {name}\(.*?\n\}}", src, re.S)
    return m.group(0) if m else ""


js, md = code_of(JS), code_of(MD)
for name, src in (("suggest.js", js), ("markdown.js", md)):
    for bad in ("innerHTML", "outerHTML", "insertAdjacentHTML", "document.write", "DOMParser",
                "createContextualFragment"):
        if bad in src:
            problems.append(f"{name}: {bad}. What is in the box is built from nodes with textContent, never as HTML.")
    if re.search(r"localStorage\.(?:setItem|removeItem|clear)|sessionStorage|indexedDB|document\.cookie", src):
        problems.append(f"{name}: it stores something. suggest.js reads love-cb and nothing else, and "
                        "markdown.js reads nothing.")
if re.search(r"\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource", md):
    problems.append("markdown.js: it asks somewhere for something. It builds nodes and nothing else.")
for url in set(re.findall(r"""['"](/[a-z][^'"?#]*)""", js)):
    if url not in ("/cb/suggestions", "/cb/suggestions/image"):
        problems.append(f"suggest.js: it calls {url}. The box talks to its own functions and nothing else.")
if re.search(r"getContext|toBlob|createImageBitmap|OffscreenCanvas|convertToBlob", js):
    problems.append("suggest.js: it draws a picture itself. Every picture goes through window.loveRedraw, the CB's "
                    "one redraw, because two copies of what takes a camera's GPS off is one that gets fixed and one "
                    "that does not.")
if "window.loveRedraw(" not in js:
    problems.append("suggest.js: a picture no longer goes through window.loveRedraw before it is sent.")
if "window.loveMarkdown.blocks" not in js:
    problems.append("suggest.js: it builds the box's words some way other than markdown.js.")

lib = LIB.read_text()
if "if (!who) return" not in fn(lib, "addSuggestion"):
    problems.append("lib.mjs: addSuggestion no longer refuses somebody who is not signed on.")
reply_fn, edit_fn, down_fn = fn(lib, "replySuggestion"), fn(lib, "editSuggestionReply"), fn(lib, "removeSuggestionReply")
if "canTakeOff(who, was)" not in reply_fn or "canTakeOff(who, list[k])" not in reply_fn:
    problems.append("lib.mjs: replySuggestion lets somebody reply who neither dropped it in nor is a moderator.")
if "if (who.role !== 'base') return" not in reply_fn:
    problems.append("lib.mjs: replySuggestion lets somebody but a moderator mark a suggestion.")
if "if (!body) return" not in reply_fn or "if (!body) return" not in edit_fn:
    problems.append("lib.mjs: a reply can go in, or be edited down, with no words, so a mark could have no reply saying why.")
if "if (!canEdit(who, old)) return" not in edit_fn or "if (!canEdit(who, thread[j]))" not in edit_fn:
    problems.append("lib.mjs: editSuggestionReply no longer asks canEdit, so somebody could rewrite another's reply.")
if "canTakeOff(who, r)" not in down_fn:
    problems.append("lib.mjs: removeSuggestionReply no longer asks canTakeOff, the CB's one rule for taking a thing down.")
if "status: suggestStatus(replies)" not in fn(lib, "shapeSuggestion") or re.search(r"\b(?:item|next|done)\.status\s*=", reply_fn + fn(lib, "addSuggestion")):
    problems.append("lib.mjs: where a suggestion stands is kept apart from its replies, not worked out from them.")
shape = fn(lib, "shapeSuggestion")
if "out.metoo = [...p.metoo].sort(" not in shape or re.search(r"metoo\.length\s*[;,)}]", shape.replace("p.metoo.length) out.metoo", "")):
    problems.append("lib.mjs: Me too is not sent as names alone, alphabetically. It names who, never how many.")
if "foldHandle(list[k].handle) === foldHandle(who.handle)" not in fn(lib, "meTooSuggestion"):
    problems.append("lib.mjs: whoever dropped a suggestion in can say Me too to their own.")
if re.search(r"metoo\.length|metoo\)\.length|\.sort\([^)]*metoo", js):
    problems.append("suggest.js: it reads how many said Me too, or sorts by it. Me too names who, never how many.")
note = re.search(r"export async function notifySuggestion\(.*?\n\}", lib, re.S)
note = note.group(0) if note else ""
if ("toMods ? who.role !== 'base'" not in note or "!canTakeOff(who, item)" not in note
        or "d.fold === from" not in note or "!wants(d.want, kind)" not in note):
    problems.append("lib.mjs: notifySuggestion tells somebody it should not: what is new goes only to a moderator's pass, "
                    "a moderator's reply only to whoever asked, nothing to whoever wrote it, and only on a switch.")
if "notifySuggestion(r.item" not in code_of(FN):
    problems.append("cb-suggest.mjs: nothing tells anybody about a new suggestion or reply any more.")
if re.search(r"\.sort\(", code_of(FN)):
    problems.append("cb-suggest.mjs: it sorts the box. It is newest first, and nothing in it is ranked.")
if "canTakeOff(who, p)" not in fn(lib, "removeSuggestion"):
    problems.append("lib.mjs: removeSuggestion no longer asks canTakeOff, the CB's one rule for taking a thing down.")
if "who.role === 'base'" not in fn(lib, "addSuggestion") or "who.account" not in fn(lib, "addSuggestion"):
    problems.append("lib.mjs: the BASE and CLAIMED marks on a suggestion must come from the pass.")
f = code_of(FN)
read_at = f.find("await readPass(req)")
act_at = min([i for i in (f.find("b.action === 'preview'"), f.find("b.action === 'suggest'")) if i >= 0] or [-1])
if read_at < 0 or act_at < 0 or read_at > act_at or "sameSite(req)" not in f:
    problems.append("cb-suggest.mjs: it must check the site and the pass before it does anything a POST asks.")
if "'x-robots-tag': 'noindex'" not in f:
    problems.append("cb-suggest.mjs: what is in the box is not for search engines, and the answer no longer says so.")
privacy = PRIVACY.read_text()
if 'id="suggestions"' not in privacy:
    problems.append("privacy.html: no section with id=\"suggestions\", which the box links for what it keeps.")
if 'id="suggestion-pictures"' not in privacy:
    problems.append("privacy.html: no id=\"suggestion-pictures\", which says what a picture in the box is and how long it stays.")

put, get, pics = fn(lib, "putSuggestImage"), fn(lib, "getSuggestImage"), re.search(r"async function suggestPics\(.*?\n\}", lib, re.S)
pics = pics.group(0) if pics else ""
if "if (!who) return" not in put or "carriesMetadata(bytes, kind)" not in put or "imageKind(bytes)" not in put:
    problems.append("lib.mjs: putSuggestImage takes a picture from somebody signed off, or one still carrying camera data.")
if "by: suggestMark(who)" not in put or "got.metadata.by !== mark" not in pics:
    problems.append("lib.mjs: an upload is no longer marked as its sender's, so somebody else could put it in the box.")
if "if (!alt) return" not in pics or "f.yes !== true" not in pics:
    problems.append("lib.mjs: a picture goes in the box with no description, or with nobody saying they looked at all of it.")
if "suggestionPics(p).includes(id)" not in get:
    problems.append("lib.mjs: getSuggestImage shows a picture nothing in the box holds.")
if any("SUGGEST_IMG + x" not in fn(lib, f) for f in ("removeSuggestion", "editSuggestionReply", "removeSuggestionReply")):
    problems.append("lib.mjs: a picture outlives the suggestion or the reply that let go of it.")
if "sweepSuggestImages()" not in SWEEP.read_text():
    problems.append("cb-midnight.mjs: nothing sweeps a picture added to the box and never dropped in.")
g = code_of(FN_IMG)
put_at, pass_at = g.find("putSuggestImage(who"), g.find("await readPass(req)")
if pass_at < 0 or put_at < 0 or pass_at > put_at or "sameSite(req)" not in g:
    problems.append("cb-suggest-image.mjs: it must check the site and the pass before it takes a picture.")
if "'x-robots-tag': 'noindex'" not in g:
    problems.append("cb-suggest-image.mjs: a picture in the box is not for search engines, and the answer no longer says so.")
if "public" in re.findall(r"'cache-control': '([^']*)'", g + "'cache-control': ''")[0]:
    problems.append("cb-suggest-image.mjs: a picture may sit in a shared cache, where taking it down does not reach.")

css = LOVE.read_text()
m = re.search(r"/\* street:sandbox:board:begin \*/(.*?)/\* street:sandbox:board:end \*/", css, re.S)
if not m:
    problems.append("love.css: no /* street:sandbox:board:begin */ block, which dresses the box and the steps.")
else:
    body = re.sub(r"/\*.*?\*/", " ", m.group(1), flags=re.S)
    for lit in re.findall(r"#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl)a?\([^)]*\)", body):
        if not re.match(r"rgba\(", lit):
            problems.append(f"love.css: the street's block for the box writes the colour {lit}. It wears "
                            "the room's own ink: var(--sb-...) only.")
    for v in set(re.findall(r"var\((--[\w-]+)", body)):
        if not v.startswith("--sb-"):
            problems.append(f"love.css: the street's block for the box uses var({v}), which is not the room's.")
    if not re.search(r"/\* import:sandbox:section:end \*/\s*/\* street:sandbox:board:begin \*/", css):
        problems.append("love.css: the street's block for the box belongs straight after the room's own "
                        "section, inside §'s reach and outside its import markers.")

if problems:
    print("REFUSING:\n  " + "\n  ".join(problems))
    sys.exit(1)

# ── Write ────────────────────────────────────────────────────────────────────

page = PAGE.read_text()
for name, block in (("suggestions", board_block()), ("contribute", contribute_block())):
    a, b = f"<!-- street:{name}:begin -->", f"<!-- street:{name}:end -->"
    i, j = page.find(a), page.find(b)
    if i < 0 or j < i:
        print(f"REFUSING: {data['page']} has no space for the street's {name} (data-street=\"{name}\", "
              "with its markers). The room's maker decides where it goes: if their new version left it out, "
              "talk to them, rather than putting it somewhere they did not.")
        sys.exit(1)
    page = page[:i + len(a)] + "\n" + block + "\n" + page[j:]

ids = set(re.findall(r'\bid="([^"]+)"', page))
for a in set(re.findall(r'href="#([^"]+)"', page)):
    if a not in ids:
        problems.append(f"{data['page']}: a link to #{a}, which nothing on the page is.")
order = [page.find(f'<script src="{s}" defer></script>') for s in ("markdown.js", "suggest.js")]
if min(order) < 0 or order[0] > order[1]:
    problems.append(f"{data['page']}: it must load markdown.js, then suggest.js.")
for hid in ("suggest-write", "suggest-signon", "suggest-filter", "suggest-items"):
    if not re.search(rf'id="{hid}"[^>]*\bhidden\b', page):
        problems.append(f"{data['page']}: #{hid} must ship hidden, so a page with no script shows no dead control.")
if problems:
    print("REFUSING:\n  " + "\n  ".join(problems))
    sys.exit(1)

if PAGE.read_text() != page:
    PAGE.write_text(page)
contributing = contributing_md()
if not CONTRIB.exists() or CONTRIB.read_text() != contributing:
    CONTRIB.write_text(contributing)
print(f"the sandbox: the box and the steps in {data['page']}, and CONTRIBUTING.md from the same steps; "
      "the box built from nodes and never HTML, anybody signed on writes, only moderators answer, always "
      "with a reply, nothing is taken down but by its poster or a moderator, and a picture goes in only redrawn, "
      "described and looked at, and is shown only while the box holds it; whoever asked and our moderators reply, "
      "only a moderator marks it, and Me too names who and never how many.")
