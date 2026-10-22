#!/usr/bin/env python3
"""Hold links and backlinks to their word.

Ryan's ask, 2026-10-21, after Notion's links and backlinks: [[ in any box that
takes words finds a task, a forum topic, a grant request, a case or a contact,
and every one of those says where it is linked from. Ryan's calls, the same
day, and what this checks of them:

  · A LINK IS A TOKEN, NEVER A NAME. The [[ menu (links.js) puts
    [[kind:id]] in the words and nothing else, so no copy, search, feed or
    notification of the words carries the name of something its reader could
    not open.
  · THE NAME IS FILLED IN FOR EACH READER, BY THE SERVER. resolveLinks asks
    tasksAllow for a task, forumAllows for a topic and officeAllow for the
    office's records, and every function that answers with words from a source
    (Tasks, the office, the forums) answers through nameRefs, so there is no
    way to answer with words and skip it. The radio's names come from
    /cb/links, by POST, under the same rules.
  · CHATS LEAVE NO BACKLINK. The index is kept by the store writers, and only
    the stores of tasks, their comments, the forums' topics, and the office's
    contacts, grant requests, cases and comments are sources. A channel, a
    room's talk or a conversation between two people is never one.
  · THE OFFICE'S SOURCES ARE SEALED, in office-backlinks, never in the plain
    index, and a reader is shown only the sources they could open.
  · WHAT IS TYPED IS NEVER IN AN ADDRESS: the menu asks by POST.
  · NOTHING IS KEPT IN THE BROWSER, and nothing is built from a string.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
FUNCS = ROOT / "netlify" / "functions"
problems = []


def code(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"(?m)^\s*//.*$|(?<=[;{}),])\s*//.*$", "", src)


def fn(src, name):
    m = re.search(rf"(?:export )?(?:async )?function {name}\(.*?\n\}}", src, re.S)
    return m.group(0) if m else ""


def check_lib():
    src = code(LIB.read_text())
    res = fn(src, "resolveLinks")
    if not res:
        problems.append("lib.mjs: no resolveLinks, the one place a link is named for its reader.")
    else:
        for kind, gate in (("task", "tasksAllow(who)"), ("topic", "forumAllows(who, cat)"), ("grant", "officeAllow(who)")):
            if gate not in res:
                problems.append(f"lib.mjs: resolveLinks names a {kind} without asking {gate}.")
        if "shut" not in res:
            problems.append("lib.mjs: resolveLinks never says a link is one the reader can't open.")
    if "export async function nameRefs(" not in src:
        problems.append("lib.mjs: no nameRefs, which every answer with words goes through.")
    store = fn(src, "linkStore")
    for k in ("TASKS", "TASK_COMMENTS_AT", "FORUM_TOPIC", "CONTACTS", "GRANTS", "CASES", "OFFICE_COMMENTS_AT"):
        if k not in store:
            problems.append(f"lib.mjs: linkStore does not keep backlinks from {k}.")
    if re.search(r"channel|room-talk|roomTalk|ROOM_TALK|\bdm|DM_|conv|mud", store, re.I):
        problems.append("lib.mjs: linkStore keeps backlinks from a chat. Chats leave no backlink (Ryan's call, 2026-10-21).")
    sealed = re.search(r"if \(key === CONTACTS \|\| key === GRANTS \|\| key === CASES \|\| key\.startsWith\(OFFICE_COMMENTS_AT\)\) return 'sealed';", store)
    if not sealed:
        problems.append("lib.mjs: the office's records and comments are not the sealed index's sources.")
    for writer in ("updateList", "updateDoc", "updateSealed"):
        body = fn(src, writer)
        if "linksBefore(" not in body or "linksAfter(" not in body:
            problems.append(f"lib.mjs: {writer} does not keep backlinks. The store writers keep them, so no write path forgets.")
    back = fn(src, "backlinksTo")
    for gate in ("tasksAllow(who)", "forumAllows(who, cat)", "officeAllow(who)"):
        if gate not in back:
            problems.append(f"lib.mjs: backlinksTo shows a source without asking {gate}.")
    if "readSealed(OFFICE_BACKLINKS" not in back:
        problems.append("lib.mjs: backlinksTo does not read the office's sources from the sealed index.")
    words = fn(src, "linkWords")
    if "LINK_KINDS[k].words" not in words:
        problems.append("lib.mjs: a notification shows a link some other way than what it is.")
    for p in ("shapePost", "shapeComment", "shapeCopied"):
        if "refs: true" not in fn(src, p):
            problems.append(f"lib.mjs: {p} reads its words without links.")


def check_functions():
    for name in ("cb-tasks", "cb-office", "cb-forum"):
        f = FUNCS / f"{name}.mjs"
        src = code(f.read_text())
        m = re.search(r"const answer = async \(code, b, h\) => json\(code, await nameRefs\(b, who\), h\);", src)
        if not m:
            problems.append(f"{name}.mjs: no answer() through nameRefs.")
            continue
        if "json(200, " in src[m.end():]:
            problems.append(f"{name}.mjs: it answers json(200, …) after answer(), past nameRefs.")
        if "action === 'links'" not in src or "findLinks(" not in src:
            problems.append(f"{name}.mjs: no 'links' action for the [[ menu, by POST.")
        for parse in re.findall(r"parseBrass\(text[^)]*\)", src):
            if "refs: true" not in parse:
                problems.append(f"{name}.mjs: a preview reads words without links: {parse}.")
    f = FUNCS / "cb-links.mjs"
    src = code(f.read_text()) if f.exists() else ""
    if "method: 'POST'" not in src or "resolveLinks(" not in src or "forumReader(who)" not in src:
        problems.append("cb-links.mjs: the radio's names and menu are not a claimed username's, by POST, through resolveLinks.")


def check_pages():
    links = code((ROOT / "links.js").read_text())
    for bad in ("innerHTML", "outerHTML", "insertAdjacentHTML", "document.write", "DOMParser"):
        if bad in links:
            problems.append(f"links.js: {bad}. The menu is built from nodes.")
    if re.search(r"localStorage|sessionStorage|indexedDB|\bfetch\(|XMLHttpRequest|sendBeacon", links):
        problems.append("links.js: it keeps something or talks to a server itself. It asks through the page's own o.ask.")
    if "put: function (x) { return '[[' + x.kind + ':' + x.id + ']] '; }" not in links:
        problems.append("links.js: a pick puts something other than [[kind:id]] in the words. A link never carries a name.")
    if "put: function (h) { return '@' + h + ' '; }" not in links or "fold(h) !== fold(o.me)" not in links:
        problems.append("links.js: the @ list puts something other than @ and a name, or offers you yourself.")
    if "window.loveRadioPeek(who, btn, null)" not in links:
        problems.append("links.js: a mention does not open the person's profile on the radio.")
    for page in ("tasks.js", "office.js", "forum.js"):
        if "window.loveLinks.mentions(" not in code((ROOT / page).read_text()):
            problems.append(f"{page}: it does not draw @mentions with links.js.")
    # THE FORMATTING TOOLBAR (2026-10-22): the box stays plain text, nothing is built from a string or kept or sent,
    # a link is only ever an address a link may go to, and every page with a Markdown box loads it.
    fm = code((ROOT / "format.js").read_text()) if (ROOT / "format.js").exists() else ""
    for bad in ("innerHTML", "outerHTML", "insertAdjacentHTML", "contenteditable", "contentEditable", "DOMParser"):
        if bad in fm:
            problems.append(f"format.js: {bad}. The box stays a plain text box, and nothing is built from a string.")
    if re.search(r"localStorage|sessionStorage|indexedDB|\bfetch\(|XMLHttpRequest|sendBeacon", fm):
        problems.append("format.js: it keeps something or talks to a server.")
    if "execCommand('insertText'" not in fm or "setAttribute('role', 'toolbar')" not in fm:
        problems.append("format.js: it is not a toolbar, or its changes do not go through the browser's own undo.")
    if "if (!to) {" not in fm:
        problems.append("format.js: a link is made without asking whether its address is one a link may go to.")
    for page, app in (("tasks.html", "tasks.js"), ("office.html", "office.js"), ("forum.html", "forum.js")):
        html = (ROOT / page).read_text()
        at = [html.find(f'<script src="{x}" defer></script>') for x in ("format.js", app)]
        if min(at) < 0 or at != sorted(at):
            problems.append(f"{page}: it must load format.js before {app}.")
    md = code((ROOT / "markdown.js").read_text())
    if "n.t === 'ref'" not in md:
        problems.append("markdown.js: it does not draw a link to a task, a topic or a record.")
    cb = code((ROOT / "cb.js").read_text())
    if "call('/cb/links', { body: { action: 'names'" not in cb or "call('/cb/links', { body: { action: 'find'" not in cb:
        problems.append("cb.js: the radio's links are not asked of /cb/links by POST.")
    for page, app in (("tasks.html", "tasks.js"), ("office.html", "office.js"), ("forum.html", "forum.js")):
        html = (ROOT / page).read_text()
        at = [html.find(f'<script src="{s}" defer></script>') for s in ("markdown.js", "links.js", app)]
        if min(at) < 0 or at != sorted(at):
            problems.append(f"{page}: it must load markdown.js, then links.js, then {app}.")
    priv = (ROOT / "privacy.html").read_text()
    if 'id="links"' not in priv:
        problems.append("privacy.html: no #links, saying what the backlinks index keeps and that chats leave none.")


check_lib()
check_functions()
check_pages()
if problems:
    print("REFUSING:")
    for p in problems:
        print("  " + p)
    sys.exit(1)
print("links: a token in the words and never a name, named for each reader by the server, the [[ menu by POST, backlinks kept by the store writers, never from a chat, the office's sealed")
