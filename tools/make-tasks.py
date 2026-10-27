#!/usr/bin/env python3
"""Write tasks' settings into the CB, and hold tasks to what they and
privacy.html say.

Ryan's brief, 2026-10-20: the team's to-do list, moved here from EspoCRM in
stages (the tasks and their list first, then a board and saved filters,
then recurring tasks, then a timeline), for directors, board members and administrators
only.

WHAT IT WRITES: data/tasks.json's roles, statuses, priorities, tags, fill-ins
and the templates Tasks starts with,
between the tasks:settings markers in netlify/cb/lib.mjs, which is the only
copy the server reads. Never hand-edit between those markers.

WHAT IT REFUSES, because a friendly edit could break each without a test
noticing (netlify/cb/lib.test.mjs tests what the code does):

  · ANYBODY BUT TASK_SEE'S ROLES AND AN ADMINISTRATOR. Every exported task
    function asks tasksAllow first, and the function refuses everybody else
    before it reads or does anything. A task's people come from CB_MODS.
  · A LIST THAT IS NOT WHOLE: roles that are not CB_MODS roles, a status,
    priority or tag twice, done statuses that are not statuses, a default
    priority that is not a priority.
  · MARKUP FROM WHAT SOMEBODY TYPED: tasks.js builds a description with
    markdown.js and textContent, never innerHTML or its relatives.
  · ANYTHING KEPT IN THE BROWSER. privacy.html says tasks keep nothing there:
    a list's filters and order live in the page's address. tasks.js reads
    love-cb for the pass and writes nothing.
  · ANY PLACE BUT /cb/tasks: tasks.js talks to it and to nothing else.
  · A COLOUR OF ITS OWN. tasks.css wears the CB's seven colours, as the forums
    do, so every theme's pairs are ones check-contrast.py already holds.
  · A RECURRING TASK'S TASK MADE UNDER SOMEBODY'S NAME, without where it came
    from, or twice for one day; one brought from EspoCRM arriving switched on
    beside EspoCRM's own; and cb-recur.mjs not running every hour.
  · A TEMPLATE THAT IS NOT WHOLE: one Tasks starts with that has no fixed id,
    a fill-in tasks do not know, a link fill-in in a name, or a person named in
    the data; and a task the office's intake makes from a template under
    somebody's name, without which template, or from anywhere but the intake.
  · A TICK THAT CAN LAND ON ANOTHER BOX: tickTask changes a box only where the
    reader and a scan of the lines agree, and only when its words are the ones
    the page saw.
  · A SAVED FILTER KEPT WITH MORE THAN ITS ID, NAME AND ADDRESS, or left
    behind when its person uses Forget me or deletes the username.
  · A TIMELINE CHANGE ONLY A MOUSE CAN MAKE (Ryan's ask, 2026-10-27). A bar's
    grips stretch and shrink it by dragging, and its menu opens on a
    right-click; so every bar must also have its ⋯ button opening the same
    menu, Shift+F10 and the ContextMenu key must open it, its Days must hold
    the grips' changes a day at a time, it must be the ARIA menu pattern, and
    tasks.css must never hide the button. The friendly edit is dropping the ⋯
    "because right-click works", which leaves out a keyboard, a screen reader
    and a phone, as dragging alone would on the board.
  · privacy.html without its tasks section, and the page without its link to it.
  · ANYTHING OF TASKS WRITTEN IN THE CLEAR (Ryan's call, 2026-10-25): every
    Tasks blob is sealed by name at the store (STAFF_SEALED, sealingStore,
    under CB_STAFF_KEY, a key of its own read only by staffCipherKey), store()
    hands every caller the sealing store and nothing else calls getStore, the
    Tasks functions shut without the key, the hourly sweep seals what came
    before it, and privacy.html#tasks says sealed at rest and not end-to-end.
    The friendly edit is a fallback to the clear "so Tasks keep working".
  · THE OFFICE'S OR TASKS' CHANNEL WIDER OR NARROWER THAN THEIR PAGES. Both are
    rooms on the CB, listed under Staff on the chat page (Ryan's ask,
    2026-10-26), so MOD_ROOMS in lib.mjs must give each exactly TASK_SEE's
    roles (officeAllow is tasksAllow), neither may be strict, and each page
    must say data-cb="mods" with those roles, as a Town Hall room does.

NUMBERS ARE FINE HERE. Ryan's call, 2026-10-20: the street's rule against
numbers beside things does not apply to tasks or to backend tools, so this
checks for no tally, and the list counts what it shows.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "tasks.json"
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
FN = ROOT / "netlify" / "functions" / "cb-tasks.mjs"
JS = ROOT / "tasks.js"
CSS = ROOT / "tasks.css"
PAGE = ROOT / "tasks.html"
PRIVACY = ROOT / "privacy.html"

BEGIN = "/* tasks:settings:begin -- written by tools/make-tasks.py from data/tasks.json. Do not hand-edit. */"
END = "/* tasks:settings:end */"

problems = []


def code_of(path):
    c = re.sub(r"/\*.*?\*/", " ", path.read_text(), flags=re.S)
    return re.sub(r"(?m)^\s*//[^\n]*", " ", c)


def fn(src, name):
    m = re.search(rf"export (?:async )?function {name}\(.*?\n\}}", src, re.S)
    return m.group(0) if m else ""


def settings(data, roles):
    see = data.get("see")
    if not isinstance(see, list) or not see or any(r not in roles for r in see):
        problems.append(f"{DATA.name}: see is a list of CB_MODS roles ({', '.join(roles)}).")
    for k in ("statuses", "priorities", "tags"):
        v = data.get(k)
        if not isinstance(v, list) or not v or any(not isinstance(x, str) or not x.strip() for x in v) or len(set(v)) != len(v):
            problems.append(f"{DATA.name}: {k} is a list of words, each once.")
    done = data.get("done")
    if not isinstance(done, list) or not done or any(x not in (data.get("statuses") or []) for x in done):
        problems.append(f"{DATA.name}: done is a list of statuses.")
    if (data.get("statuses") or [None])[0] in (done or []):
        problems.append(f"{DATA.name}: a new task takes the first status, so the first cannot be one that is done.")
    colours = data.get("colours")
    if not isinstance(colours, list) or not colours or len(set(colours)) != len(colours) or len(colours) > 8:
        problems.append(f"{DATA.name}: colours is a list of up to eight colours, each once: past eight, nobody can tell them apart.")
    tc = data.get("tag_colours")
    if not isinstance(tc, dict) or any(t not in (data.get("tags") or []) or c not in (colours or []) for t, c in tc.items()):
        problems.append(f"{DATA.name}: tag_colours gives a tag one of the colours, and names only tags there are.")
    sc = data.get("status_colours")
    if not isinstance(sc, dict) or sorted(sc) != sorted(data.get("statuses") or []) or any(not re.fullmatch(r"[a-z]+", c) for c in sc.values()):
        problems.append(f"{DATA.name}: status_colours gives every status a colour, by name, and names only statuses there are.")
    # STARTED IS NOTION'S LIGHT BLUE (Ryan, 2026-10-21): Norah and Chelsea key off
    # it, from Notion's In progress. The friendly edit is a tidier palette.
    elif "Started" in sc and sc["Started"] != "blue":
        problems.append(f"{DATA.name}: Started is {sc['Started']}; it is blue, Notion's light blue for In progress, which Norah and Chelsea key off.")
    hides = data.get("board_hides")
    if not isinstance(hides, list) or any(x not in (data.get("statuses") or []) for x in hides) or len(hides) >= len(data.get("statuses") or []):
        problems.append(f"{DATA.name}: board_hides is a list of statuses, and leaves a board at least one.")
    reps = data.get("repeats")
    if not isinstance(reps, dict) or not reps or any(
            not isinstance(k, str) or not k.strip() or not isinstance(v, dict) or len(v) != 1
            or next(iter(v)) not in ("days", "months") or not isinstance(next(iter(v.values())), int)
            or not 1 <= next(iter(v.values())) <= (366 if "days" in v else 24) for k, v in reps.items()):
        problems.append(f"{DATA.name}: repeats names each way a task can come round, as a number of days (1 to 366) or months (1 to 24).")
    if data.get("default_priority") not in (data.get("priorities") or []):
        problems.append(f"{DATA.name}: default_priority is one of the priorities.")
    templates(data)


LINK_FILLS = ("contact", "case", "grant")


def templates(data):
    """The templates Tasks starts with: whole, each with a fixed id, and every
    fill-in one tasks know, a link fill-in only in a description."""
    fills = data.get("fill_ins")
    if not isinstance(fills, list) or "name" not in fills or any(not re.fullmatch(r"[a-z]+", str(x)) for x in fills) or len(set(fills)) != len(fills):
        problems.append(f"{DATA.name}: fill_ins is a list of lower-case words, each once, with name among them.")
        fills = fills if isinstance(fills, list) else []
    if any(x not in fills for x in LINK_FILLS):
        problems.append(f"{DATA.name}: fill_ins must hold {', '.join(LINK_FILLS)}, which the office's intake fills with links to the records a form makes.")
    tpls = data.get("templates")
    if not isinstance(tpls, list):
        problems.append(f"{DATA.name}: templates is a list (it may be empty).")
        return
    ids = []
    for t in tpls:
        tid = t.get("id") if isinstance(t, dict) else None
        if not isinstance(tid, str) or not re.fullmatch(r"p[A-Za-z0-9_-]{12}", tid):
            problems.append(f"{DATA.name}: every template has an id of p and twelve letters, digits, _ or -, so the office can name it.")
            continue
        ids.append(tid)
        if set(t) != {"id", "name", "priority", "tags", "who", "with", "startAfter", "dueAfter", "body"}:
            problems.append(f"{DATA.name}: template {tid} holds id, name, priority, tags, who, with, startAfter, dueAfter and body, and nothing else.")
        if not isinstance(t.get("name"), str) or not t["name"].strip() or len(t["name"]) > 200:
            problems.append(f"{DATA.name}: template {tid} needs a name.")
        if t.get("priority") not in (data.get("priorities") or []):
            problems.append(f"{DATA.name}: template {tid}'s priority is one of the priorities.")
        if not isinstance(t.get("tags"), list) or any(x not in (data.get("tags") or []) for x in t["tags"]):
            problems.append(f"{DATA.name}: template {tid}'s tags are tags there are.")
        # Nobody is named here: who a template's tasks go to is set in Tasks, where the list of people is.
        if t.get("who") is not None or t.get("with") != []:
            problems.append(f"{DATA.name}: template {tid} names somebody. Who its tasks go to is chosen in Tasks, from the people who can read them.")
        for k in ("startAfter", "dueAfter"):
            v = t.get(k)
            if v is not None and (not isinstance(v, int) or isinstance(v, bool) or not 0 <= v <= 366):
                problems.append(f"{DATA.name}: template {tid}'s {k} is a whole number of days from 0 to 366, or null.")
        if not isinstance(t.get("body"), str):
            problems.append(f"{DATA.name}: template {tid}'s body is words.")
            continue
        for m in re.finditer(r"\{(\w+)\}", t.get("name", "") + "\n" + t["body"]):
            if m.group(1) not in fills:
                problems.append(f"{DATA.name}: template {tid} has the fill-in {m.group(0)}, which tasks do not know.")
        for x in LINK_FILLS:
            if "{" + x + "}" in t.get("name", ""):
                problems.append(f"{DATA.name}: template {tid}'s name has {{{x}}}, a link, which goes in the description.")
    if len(set(ids)) != len(ids):
        problems.append(f"{DATA.name}: two templates share an id.")


def write(lib, data):
    j = lambda v: json.dumps(v, ensure_ascii=False)
    block = (BEGIN + "\n"
             + f"export const TASK_SEE = {j(data['see'])};\n"
             + f"export const TASK_STATUSES = {j(data['statuses'])};\n"
             + f"export const TASK_DONE = {j(data['done'])};\n"
             + f"export const TASK_BOARD_HIDES = {j(data['board_hides'])};\n"
             + f"export const TASK_REPEATS = {j(data['repeats'])};\n"
             + f"export const TASK_COLOURS = {j(data['colours'])};\n"
             + f"export const TASK_TAG_COLOURS = {j(data['tag_colours'])};\n"
             + f"export const TASK_STATUS_COLOURS = {j(data['status_colours'])};\n"
             + f"export const TASK_PRIORITIES = {j(data['priorities'])};\n"
             + f"export const TASK_DEFAULT_PRIORITY = {j(data['default_priority'])};\n"
             + f"export const TASK_TAGS = {j(data['tags'])};\n"
             + f"export const TASK_FILL_INS = {j(data['fill_ins'])};\n"
             + f"export const TASK_TEMPLATE_SEED = {j(data['templates'])};\n"
             + END)
    pat = re.compile(re.escape(BEGIN) + r".*?" + re.escape(END), re.S)
    if len(pat.findall(lib)) != 1:
        problems.append(f"{LIB.name}: the tasks:settings markers must be there exactly once.")
        return lib
    return pat.sub(lambda m: block, lib)


def check_lib(lib):
    start = lib.find("/* ── Tasks ──")
    sec = lib[start:] if start >= 0 else ""
    if not sec:
        problems.append(f"{LIB.name}: the tasks section is missing.")
        return
    code = re.sub(r"/\*.*?\*/", " ", sec, flags=re.S)
    if "console." in code:
        problems.append(f"{LIB.name}: the tasks section writes to the console. Nothing anybody types is ever logged.")
    for name in ("tasksList", "taskOne", "saveTask", "removeTask", "taskViews", "saveTaskView", "removeTaskView",
                 "taskRecurs", "taskRecur", "saveRecur", "removeRecur", "tickTask", "taskInbox", "readTaskInbox", "taskActivity", "taskFeed",
                 "taskComments", "commentTask", "editTaskComment", "removeTaskComment", "importTaskComment",
                 "taskTemplates", "taskTemplate", "saveTaskTemplate", "removeTaskTemplate"):
        body = fn(sec, name)
        first = re.search(r"\{\n\s*(.*)", body)
        if not body:
            problems.append(f"{LIB.name}: {name} is missing.")
        elif not first or "if (!tasksAllow(who))" not in first.group(1):
            problems.append(f"{LIB.name}: {name} must refuse anybody tasksAllow does not let in, before it reads or does anything.")
    # The feed is worked out from what Tasks keeps, and keeps nothing of its own.
    if re.search(r"\bupdate(?:List|Map|Sealed)\(|\.set(?:JSON)?\(|\.delete\(", fn(sec, "taskFeed")):
        problems.append(f"{LIB.name}: taskFeed writes something. The feed is worked out from what Tasks keeps and keeps nothing.")
    allow = fn(sec, "tasksAllow")
    if "forumReader(who)" not in allow or "who.role !== 'base'" not in allow or "TASK_SEE" not in allow:
        problems.append(f"{LIB.name}: tasksAllow no longer means a claimed username on the base pass holding one of TASK_SEE's roles.")
    if "TASK_SEE" not in fn(sec, "taskPeople"):
        problems.append(f"{LIB.name}: taskPeople must be everybody who could read tasks, and nobody else.")
    # A recurring task's task is made under nobody's name, says where it came from, and is never made twice.
    rt = re.search(r"function recurTask\(.*?\n\}", sec, re.S)
    if not rt or "by: null" not in rt.group(0) or "recur: r.id" not in rt.group(0) or "on: d" not in rt.group(0):
        problems.append(f"{LIB.name}: a recurring task's task is made under nobody's name and keeps which recurring task and which day made it.")
    # A task the intake makes from a template is made under nobody's name, keeps which template, and is
    # never a page's to ask for: makeFromTemplate is not exported, and the office's intake is its one caller.
    mf = (re.search(r"async function makeFromTemplate\(.*?\n\}", sec, re.S) or [""])[0]
    if not mf or "by: null" not in mf or "tpl: p.id" not in mf or "noteTask('formed', null," not in mf:
        problems.append(f"{LIB.name}: a task made from a template by the intake is made under nobody's name, keeps which template, and is news as one a form made (makeFromTemplate).")
    if re.search(r"export\s+async\s+function\s+makeFromTemplate", lib) or len(re.findall(r"\bmakeFromTemplate\(", lib)) != 2:
        problems.append(f"{LIB.name}: makeFromTemplate is the office's intake's alone: not exported, and called from officeIntake only.")
    if "if (!d) return TASK_TEMPLATE_SEED" not in fn(sec, "readTaskTpls"):
        problems.append(f"{LIB.name}: the seeded templates are read only while task-templates does not exist (readTaskTpls).")
    mk = fn(sec, "makeRecurring")
    if "there.has(" not in mk or "today(" not in mk:
        problems.append(f"{LIB.name}: makeRecurring must skip a task already made for that day, and count days on the street's clock.")
    tk = fn(sec, "tickTask")
    if "b.agree ? b.found[n] : null" not in tk or "box.raw !== text.trim()" not in tk:
        problems.append(f"{LIB.name}: tickTask must tick only a box the reader and the lines agree on, and only when its words are the ones the page saw.")
    sr = fn(sec, "saveRecur")
    if "on: !espo" not in sr:
        problems.append(f"{LIB.name}: a recurring task brought from EspoCRM must arrive switched off, so it makes nothing beside EspoCRM's.")
    # Saved filters are kept under the person and go with them.
    if "s.delete(taskViewsBlob(pk))" not in fn(sec, "forgetTaskViews"):
        problems.append(f"{LIB.name}: forgetTaskViews no longer deletes somebody's saved filters.")
    da = re.search(r"export async function deleteAccount\(.*?\n\}", lib, re.S)
    if not da or "await forgetTaskViews(petKey(handle), s);" not in da.group(0):
        problems.append(f"{LIB.name}: deleting a username must delete its saved filters (forgetTaskViews).")
    if "forgetTaskViews(pk)" not in (ROOT / "netlify/functions/cb-pets.mjs").read_text():
        problems.append("cb-pets.mjs: Forget me must delete somebody's saved filters (forgetTaskViews).")
    # Activity and notifications: an event says who, when, which task, what kind and what changed, a
    # description without its words; nobody is told of their own change, an import is nobody's, only
    # somebody who could read tasks is told, and each person's list goes with them.
    nt = (re.search(r"async function noteTask\(.*?\n\}", sec, re.S) or [""])[0]
    ev = re.search(r"const ev = \{(.*?)\};", nt)
    evkeys = {part.split(":")[0].strip() for part in re.split(r",\s*", ev.group(1))} if ev else set()
    if evkeys != {"id", "t", "by", "task", "name", "kind", "changes"}:
        problems.append(f"{LIB.name}: an event keeps who, when, which task, its kind and what changed, and nothing else.")
    tell = (re.search(r"async function tellTaskPeople\(.*?\n\}", sec, re.S) or [""])[0]
    if "{ ...ev, why, read: false }" not in tell or "tellTaskPeople(ev, taskConcerns(kind, by, had, next, taskPeople(mods), extra, mods)" not in nt:
        problems.append(f"{LIB.name}: a notification is the event, why it is there and whether it is read, for somebody who could read tasks.")
    # An office comment's notification names the record by its id and what it is, never its name or the comment's words.
    noc = fn(sec, "noteOfficeComment")
    oev = re.search(r"const ev = \{(.*?)\};", noc)
    okeys = {part.split(":")[0].strip() for part in re.split(r",\s*", oev.group(1))} if oev else set()
    if okeys != {"id", "t", "by", "kind", "what", "rec", "comment"} or "comment: comment.id" not in noc:
        problems.append(f"{LIB.name}: an office comment's notification keeps who, when, what it is on, its id and the comment's id, and nothing sealed.")
    if "tellTaskPeople(ev, told," not in noc or "taskPeople(mods)" not in noc:
        problems.append(f"{LIB.name}: an office comment tells only people who could read tasks, through the one list (noteOfficeComment).")
    # Comments: kept with their writer's mark, which never leaves the server; edited only by their writer;
    # deleted by their writer or an administrator; told and kept in the activity as that one was made,
    # never their words; and gone with their task.
    if "if (kind === 'commented') ev.comment = extra.comment.id;" not in nt or re.search(r"ev\.\w+ = [^;]*\.body", nt):
        problems.append(f"{LIB.name}: a comment's event names the comment and never keeps its words.")
    ct = fn(sec, "commentTask")
    if "const c = { id: newCommentId(), by: who.handle, mark: authorMark(who), t: now, body: words };" not in ct:
        problems.append(f"{LIB.name}: a comment is kept as its id, its writer, the writer's mark, when, and its words, and nothing else.")
    sc = (re.search(r"function shapeComment\(.*?\n\}", sec, re.S) or [""])[0]
    if "mark:" in sc or "c.mark ===" not in sc:
        problems.append(f"{LIB.name}: shapeComment sends a comment's mark, or no longer works out whose it is from it. The mark never leaves the server.")
    if "list[k].mark !== authorMark(who)) { why" not in fn(sec, "editTaskComment"):
        problems.append(f"{LIB.name}: only whoever wrote a comment edits it (editTaskComment).")
    if "list[k].mark !== authorMark(who) && !who.roles.has('administrator')" not in fn(sec, "removeTaskComment"):
        problems.append(f"{LIB.name}: only whoever wrote a comment, or an administrator, deletes it (removeTaskComment).")
    if "await s.delete(taskCommentsBlob(gone.id));" not in fn(sec, "removeTask"):
        problems.append(f"{LIB.name}: a deleted task's comments must go with it (removeTask).")
    # A comment brought from Notion is nobody's change: it tells nobody, keeps Notion's id only on the server,
    # and stays deleted once deleted here.
    itc = fn(sec, "importTaskComment")
    if re.search(r"noteTask\(|tellTaskPeople\(|notifyTask\(", itc) or "saved = { id: newCommentId(), by, mark, t, body: words, notion };" not in itc:
        problems.append(f"{LIB.name}: a comment brought from Notion is kept as its id, writer, mark, time, words and Notion's id, and tells nobody (importTaskComment).")
    if "readTaskGone(s)).includes(notion)" not in itc or "if (gone && gone.notion) await updateList(TASKS_GONE" not in fn(sec, "removeTaskComment"):
        problems.append(f"{LIB.name}: a comment brought from Notion and deleted here must stay deleted.")
    if "notion:" in sc or "out.notion" in sc:
        problems.append(f"{LIB.name}: shapeComment sends Notion's id for a comment. It says only that one came from Notion.")
    if "payload.comment = item.comment;" not in fn(lib, "notifyTask") or re.search(r"comment\.body|\.body\b", fn(lib, "notifyTask")):
        problems.append(f"{LIB.name}: notifyTask tells a device which comment and never its words.")
    if "out.push({ field: 'body' })" not in fn(sec, "taskChanges"):
        problems.append(f"{LIB.name}: a description's change is kept without its words.")
    tc = (re.search(r"function taskConcerns\(.*?\n\}", sec, re.S) or [""])[0]
    if "(by && foldHandle(p) === foldHandle(by))" not in tc:
        problems.append(f"{LIB.name}: nobody is told of their own change (taskConcerns).")
    st = fn(sec, "saveTask")
    if "if (!from) await noteTask(" not in st or "const from = espo || notion;" not in st:
        problems.append(f"{LIB.name}: an import from EspoCRM or Notion is nobody's change, and must make no event.")
    if "const was = gone.espo || gone.notion;" not in fn(sec, "removeTask"):
        problems.append(f"{LIB.name}: a task brought from EspoCRM or Notion and deleted here must stay deleted (removeTask).")
    # Push: a device is told only once the notification is in its person's list, only with the tasks
    # switch, only while it can read tasks, and never about its own change.
    ntf = fn(lib, "notifyTask")
    if "wants(d.want, 'tasks')" not in ntf or "tasksAllow(who)" not in ntf or "foldHandle(item.by) === to" not in ntf:
        problems.append(f"{LIB.name}: notifyTask tells a device only with the tasks switch on, while it can read tasks, and never its own change.")
    if "await notifyTask(h, { ...ev, why }" not in tell or tell.find("await notifyTask(") < tell.find("taskInboxBlob(petKey(h))"):
        problems.append(f"{LIB.name}: a device is told only after the notification is in its person's list (tellTaskPeople).")
    if "s.delete(taskInboxBlob(pk))" not in fn(sec, "forgetTaskInbox"):
        problems.append(f"{LIB.name}: forgetTaskInbox no longer deletes somebody's notifications.")
    if not da or "await forgetTaskInbox(petKey(handle), s);" not in da.group(0):
        problems.append(f"{LIB.name}: deleting a username must delete its notifications (forgetTaskInbox).")
    if "forgetTaskInbox(pk)" not in (ROOT / "netlify/functions/cb-pets.mjs").read_text():
        problems.append("cb-pets.mjs: Forget me must delete somebody's notifications (forgetTaskInbox).")
    kept = re.findall(r"copy(?:\[k\] = |\.push\()\{(.*?)\}\)?;", fn(sec, "saveTaskView"))
    keys = [sorted(k.split(":")[0].strip() for k in re.sub(r"\([^()]*\)", "", rec).split(",")) for rec in kept]
    if len(kept) != 2 or any(k != ["address", "id", "name"] for k in keys):
        problems.append(f"{LIB.name}: a saved filter holds its id, name and address, and nothing else, nothing about when included.")


def check_function():
    if not FN.exists():
        problems.append(f"{FN.name}: missing.")
        return
    f = code_of(FN)
    gate = f.find("if (!tasksAllow(who))")
    first = min([i for i in (f.find("view ==="), f.find("b.action ===")) if i >= 0] or [-1])
    if gate < 0 or first < 0 or gate > first:
        problems.append(f"{FN.name}: it must refuse anybody tasksAllow does not let in before it reads or does anything.")
    if "'x-robots-tag': 'noindex'" not in f:
        problems.append(f"{FN.name}: its answers must ask search engines not to keep them.")
    if "path: '/cb/tasks'" not in f:
        problems.append(f"{FN.name}: it no longer answers at /cb/tasks, where tasks.js asks.")


def check_recur():
    f = ROOT / "netlify" / "functions" / "cb-recur.mjs"
    if not f.exists():
        problems.append("cb-recur.mjs: missing. Recurring tasks are made by it every hour.")
        return
    code = code_of(f)
    if "makeRecurring()" not in code or "schedule: '@hourly'" not in code:
        problems.append("cb-recur.mjs: it must run makeRecurring every hour.")
    if re.search(r"export default async \(req", code):
        problems.append("cb-recur.mjs: it is a scheduled function and answers nobody.")


def check_js():
    if not JS.exists():
        problems.append(f"{JS.name}: missing.")
        return
    js = code_of(JS)
    for bad in ("innerHTML", "outerHTML", "insertAdjacentHTML", "document.write", "DOMParser", "createContextualFragment"):
        if bad in js:
            problems.append(f"{JS.name}: {bad}. A task is built from nodes with textContent, never as HTML.")
    if "window.loveMarkdown.blocks" not in js:
        problems.append(f"{JS.name}: it builds a description some way other than markdown.js, the street's one builder.")
    if re.search(r"localStorage\.(?:setItem|removeItem|clear)|sessionStorage|indexedDB", js):
        problems.append(f"{JS.name}: it keeps something in the browser. privacy.html says tasks keep nothing there.")
    # Pages it links to are on the list beside the one thing it calls; the office
    # and the forums are one press away in the bar (Ryan, 2026-10-21).
    for url in set(re.findall(r"""['"](/[a-z][^'"?#]*)""", js)):
        if url not in ("/cb/tasks", "/cb/tasks/file", "/cb.css", "/tasks.css", "/privacy.html", "/cb-guide.html", "/community-center.html", "/tasks.html", "/office.html", "/forum.html"):
            problems.append(f"{JS.name}: it calls {url}. Tasks talk to /cb/tasks, and /cb/tasks/file for pictures and files, and nothing else.")


def check_timeline():
    """The timeline's grips and right-click menu have a way in for everybody."""
    js = code_of(JS)
    css = CSS.read_text() if CSS.exists() else ""
    need = {
        "tk-tl__grip": "the grips that stretch and shrink a bar",
        "'tk-tl__menu'": "the ⋯ button on every bar, which opens its menu without a right-click",
        "'aria-haspopup', 'menu'": "the ⋯ button saying it opens a menu",
        "'contextmenu'": "the right-click opening the bar's menu",
        "e.key === 'ContextMenu'": "the ContextMenu key opening the bar's menu",
        "e.key === 'F10' && e.shiftKey": "Shift+F10 opening the bar's menu",
        "'menuitem'": "the ARIA menu pattern's items",
        "'menuitemradio'": "the ARIA menu pattern's choices",
        "label: 'Days', sub: daysMenu": "Days in the bar's menu",
    }
    for text, what in need.items():
        if text not in js:
            problems.append(f"{JS.name}: no {what} ({text!r}). The timeline's changes must be reachable without a mouse.")
    for label in ("Start a day earlier", "Start a day later", "Due a day earlier", "Due a day later"):
        if f"'{label}'" not in js:
            problems.append(f"{JS.name}: Days has no '{label}'. A grip's change must be in the menu too, a day at a time.")
    for m in re.finditer(r"([^{}]*tk-tl__menu[^{}]*)\{([^}]*)\}", css):
        if re.search(r"display\s*:\s*none|visibility\s*:\s*hidden", m.group(2)):
            problems.append(f"{CSS.name}: it hides the timeline's ⋯ button ({m.group(1).strip()}). Fade it, never take it away.")


def check_comments_js():
    """comments.js draws the comments for Tasks and the office: from nodes, never
    HTML; through markdown.js; asking only through the page's own function; and
    keeping nothing in the browser."""
    f = ROOT / "comments.js"
    if not f.exists():
        problems.append("comments.js: missing. Tasks and the office draw their comments with it.")
        return
    js = code_of(f)
    for bad in ("innerHTML", "outerHTML", "insertAdjacentHTML", "document.write", "DOMParser", "createContextualFragment"):
        if bad in js:
            problems.append(f"comments.js: {bad}. A comment is built from nodes with textContent, never as HTML.")
    if "window.loveMarkdown.blocks" not in js:
        problems.append("comments.js: it builds a comment some way other than markdown.js, the street's one builder.")
    if re.search(r"localStorage|sessionStorage|indexedDB", js):
        problems.append("comments.js: it keeps something in the browser. privacy.html says neither Tasks nor the office keep anything there.")
    if re.search(r"\bfetch\(|XMLHttpRequest|EventSource|WebSocket|sendBeacon", js):
        problems.append("comments.js: it talks to a server itself. It asks only through the page's own function (o.ask).")
    if re.search(r"--cb-|#[0-9a-fA-F]{3,8}\b|style\.", js):
        problems.append("comments.js: it sets a colour or a style. Each page dresses its comments in its own stylesheet.")


def check_preview_js():
    """preview.js shows a task's, a grant request's or a case's preview on hover
    or focus (Norah's ask, 2026-10-21), and keeps WCAG 1.4.13: Escape puts it
    away, nothing on it can be pressed or reached, it is aria-hidden because
    the record's page has all of it, and a touch shows nothing. Built from the
    page's own drawing; asking only through the page's own read; keeping
    nothing in the browser; setting no colour, only where it stands."""
    f = ROOT / "preview.js"
    if not f.exists():
        problems.append("preview.js: missing. Tasks and the office show their previews with it.")
        return
    js = code_of(f)
    for bad in ("innerHTML", "outerHTML", "insertAdjacentHTML", "document.write", "DOMParser", "createContextualFragment"):
        if bad in js:
            problems.append(f"preview.js: {bad}. A preview is built from nodes, never as HTML.")
    if re.search(r"localStorage|sessionStorage|indexedDB", js):
        problems.append("preview.js: it keeps something in the browser. privacy.html says neither Tasks nor the office keep anything there.")
    if re.search(r"\bfetch\(|XMLHttpRequest|EventSource|WebSocket|sendBeacon", js):
        problems.append("preview.js: it talks to a server itself. It reads only through the page's own read(id).")
    if re.search(r"--cb-|#[0-9a-fA-F]{3,8}\b", js) or set(re.findall(r"\.style\.(\w+)", js)) - {"left", "top"}:
        problems.append("preview.js: it sets a colour or a style beyond where the card stands. Each page dresses its preview in its own stylesheet.")
    if "setAttribute('aria-hidden', 'true')" not in js:
        problems.append("preview.js: the card is not aria-hidden. Its record's page has all of it, and a screen reader would hear a description at every row.")
    if "'Escape'" not in js:
        problems.append("preview.js: Escape does not put it away. WCAG 1.4.13 asks that content on hover or focus can be dismissed without moving.")
    if "pointerType === 'touch'" not in js:
        problems.append("preview.js: a touch shows a preview. A tap opens the record.")
    if not re.search(r"querySelectorAll\('a'\)", js) or "disabled = true" not in js:
        problems.append("preview.js: what markdown.js builds to be pressed stays pressable on the card. Nothing on a preview can be pressed or reached.")


def check_colours(data):
    """Every tag colour is declared in love.css for light and dark themes, and
    tasks.css dresses it in both, so a tag never shows a colour nobody chose."""
    root = (ROOT / "love.css").read_text()
    css = CSS.read_text() if CSS.exists() else ""
    for c in data.get("colours") or []:
        for name in (f"--cb-task-{c}", f"--cb-task-{c}-dark"):
            if not re.search(rf"{re.escape(name)}\s*:\s*#[0-9a-fA-F]{{6}}", root):
                problems.append(f"love.css: {name} is not declared. Every tag colour has a light and a dark step.")
        if not re.search(rf"\.tk-c--{c}\s*\{{[^}}]*var\(--cb-task-{c}\)", css) or not re.search(rf"\.tk-c--{c}\s*\{{[^}}]*var\(--cb-task-{c}-dark\)", css):
            problems.append(f"{CSS.name}: .tk-c--{c} is not dressed for light and dark themes.")
    # A status's colour: its fill and its ink declared in love.css, and tasks.css
    # dressing .tk-s--<colour> in both.
    for c in sorted(set((data.get("status_colours") or {}).values())):
        for name in (f"--cb-status-{c}", f"--cb-status-{c}-ink", f"--cb-status-{c}-dot"):
            if not re.search(rf"{re.escape(name)}\s*:\s*#[0-9a-fA-F]{{6}}", root):
                problems.append(f"love.css: {name} is not declared. Every status colour has a fill, an ink and a dot.")
        if not re.search(rf"\.tk-s--{c}\s*\{{[^}}]*var\(--cb-status-{c}\)[^}}]*var\(--cb-status-{c}-ink\)", css):
            problems.append(f"{CSS.name}: .tk-s--{c} does not wear --cb-status-{c} and its ink.")


def check_css():
    if not CSS.exists():
        problems.append(f"{CSS.name}: missing.")
        return
    css = re.sub(r"/\*.*?\*/", " ", CSS.read_text(), flags=re.S)
    for m in re.finditer(r"#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|(?<![-\w])(?:white|black|red|blue|green|yellow|gray|grey)(?![-\w])", css):
        problems.append(f"{CSS.name}: {m.group(0)}. Tasks wear the CB's seven colours, var(--cb-*), and nothing else.")
    for m in re.finditer(r"var\(--([a-z0-9-]+)", css):
        if not m.group(1).startswith("cb-"):
            problems.append(f"{CSS.name}: var(--{m.group(1)}). Tasks wear the CB's own tokens and nothing else.")


def check_page():
    if not PAGE.exists():
        problems.append(f"{PAGE.name}: missing.")
        return
    page = PAGE.read_text()
    at = [page.find(f'<script src="{s}" defer></script>') for s in ("markdown.js", "links.js", "attach.js", "comments.js", "preview.js", "tasks.js")]
    if min(at) < 0 or at != sorted(at):
        problems.append(f"{PAGE.name}: it must load markdown.js, then links.js, then attach.js, then comments.js, then preview.js, then tasks.js.")
    if 'href="privacy.html#tasks"' not in page:
        problems.append(f"{PAGE.name}: the page must link what tasks keep, privacy.html#tasks.")
    if 'id="tasks"' not in PRIVACY.read_text():
        problems.append(f"{PRIVACY.name}: it has no tasks section (id=\"tasks\").")


def check_sealed(lib):
    names = ["/^tasks$/", "/^task-recurs$/", "/^task-templates$/", "comments", "activity", "inbox", "views"]
    m = re.search(r"const STAFF_SEALED = \[(.*?)\];\n", lib, re.S)
    if not m or not all(n in m.group(1) for n in names):
        problems.append("lib.mjs: STAFF_SEALED no longer names every Tasks store, so one is written in the clear.")
    if "return sealingStore(getStore(" not in fn(lib, "store") or lib.count("getStore(") != 1:
        problems.append("lib.mjs: something gets the store without the sealing store, so Tasks could be written in the clear.")
    key_fn = re.search(r"\nfunction staffCipherKey\(\) \{.*?\n\}", lib, re.S)
    key_fn = key_fn.group(0) if key_fn else ""
    if lib.count("process.env.CB_STAFF_KEY") != 1 or "process.env.CB_STAFF_KEY" not in key_fn:
        problems.append("lib.mjs: CB_STAFF_KEY is read somewhere other than staffCipherKey.")
    if "CB_OFFICE_KEY" in key_fn or "CB_DM_KEY" in key_fn:
        problems.append("lib.mjs: Tasks are sealed with another store's key, not a key of their own.")
    for f in ("cb-tasks", "cb-recur"):
        if "if (!staffReady())" not in (ROOT / "netlify" / "functions" / f"{f}.mjs").read_text():
            problems.append(f"netlify/functions/{f}.mjs: it does not shut without the staff key.")
    if "sealStaffLeftovers()" not in (ROOT / "netlify" / "functions" / "cb-midnight.mjs").read_text():
        problems.append("cb-midnight.mjs: the hourly sweep no longer seals Tasks written before the key.")
    priv = PRIVACY.read_text()
    i = priv.find('id="tasks"')
    sec = priv[i:priv.find("<h2", i + 10)] if i >= 0 else ""
    if "sealed at rest" not in sec or "not end-to-end" not in sec:
        problems.append(f"{PRIVACY.name}: the tasks section does not say Tasks are sealed at rest and not end-to-end.")


def check_files(lib):
    """Pictures and files on a task (2026-10-27): the forums' rules, sealed,
    no public address, gone with their task, and never named in an activity."""
    m = re.search(r"const STAFF_BYTES = \[(.*?)\];", lib, re.S)
    if not m or "task-file" not in m.group(1) or "task-up" not in m.group(1):
        problems.append(f"{LIB.name}: STAFF_BYTES no longer names task-file/ and task-up/, so a task's pictures and files could be written in the clear.")
    if "putUploadTo(TP" not in fn(lib, "putTaskUpload") or "uploadMeta(" not in fn(lib, "putUploadTo"):
        problems.append(f"{LIB.name}: putTaskUpload checks an upload some way other than putUploadTo and uploadMeta, the one layer every place uses: camera data, file kinds by their first bytes, macros.")
    if "dropOwner(TP" not in fn(lib, "removeTask"):
        problems.append(f"{LIB.name}: removeTask leaves a deleted task's pictures and files behind.")
    if "tasksAllow(who)" not in fn(lib, "taskFile"):
        problems.append(f"{LIB.name}: taskFile serves a task's file without asking tasksAllow.")
    ch = fn(lib, "taskChanges")
    files = ch[ch.find("field: 'files'") - 200:] if "field: 'files'" in ch else ""
    if not files or re.search(r"\.name|\.alt", files):
        problems.append(f"{LIB.name}: taskChanges must say how many pictures and files went on or came off, and never their names or descriptions: privacy.html#task-files says so.")
    f = ROOT / "netlify" / "functions" / "cb-tasks-file.mjs"
    code = code_of(f) if f.exists() else ""
    for need, why in (("if (!staffReady())", "it does not shut without the staff key"),
                      ("if (!tasksAllow(who))", "it does not refuse everybody tasksAllow does not let in"),
                      ("'x-robots-tag': 'noindex'", "its answers do not ask search engines not to keep them"),
                      ("fileAnswer(got", "a file is not answered by fileAnswer, the one answer every place gives: saved, never shown, sandboxed"),
                      ("path: '/cb/tasks/file'", "it no longer answers at /cb/tasks/file, where tasks.js asks")):
        if need not in code:
            problems.append(f"netlify/functions/cb-tasks-file.mjs: {why}.")
    if "sweepTaskFiles()" not in (ROOT / "netlify" / "functions" / "cb-midnight.mjs").read_text():
        problems.append("cb-midnight.mjs: the hourly sweep no longer takes task uploads nobody attached.")
    # attach.js draws them for the task and its comments: one file, never a copy in each.
    att = ROOT / "attach.js"
    a = code_of(att) if att.exists() else ""
    if "window.loveRedraw(" not in a or "getContext" in a:
        problems.append("attach.js: a picture must go through the radio's one redraw, window.loveRedraw, which takes off its camera data, and attach.js must draw on no canvas of its own.")
    for bad in ("innerHTML", "outerHTML", "insertAdjacentHTML", "localStorage", "sessionStorage", "indexedDB", "fetch("):
        # A bare fetch( is a request; o.fetch(f) is the page's own way, handed in.
        if (re.search(r"(?<![.\w])fetch\(", a) if bad == "fetch(" else bad in a):
            problems.append(f"attach.js: {bad}. It builds from nodes, keeps nothing in the browser, and talks to no server of its own: the page hands it its way of asking.")
    js = code_of(JS)
    if "window.loveAttach.section(" not in js or "getContext" in js or "loveRedraw(" in js:
        problems.append(f"{JS.name}: a task's pictures and files are drawn and taken by attach.js, not by tasks.js, which draws on no canvas of its own.")
    c = code_of(ROOT / "comments.js")
    if "window.loveAttach.tray(" not in c or "window.loveAttach.shown(" not in c:
        problems.append("comments.js: a comment's pictures and files must be attach.js's tray and lists, the task's own, never a copy.")
    for name in ("attachTask", "commentTask", "editTaskComment"):
        if "checkUploads(TP" not in fn(lib, name):
            problems.append(f"{LIB.name}: {name} takes pictures and files some way other than checkUploads, the one layer every place uses.")
    # A big file in parts (2026-10-27): Netlify refuses a request over about 6 MB, so no part may near it,
    # and the whole is checked as any file is before anything can attach it.
    m = re.search(r"export const FILE_PART = (\d+);", lib)
    if not m or int(m.group(1)) > 5000000:
        problems.append(f"{LIB.name}: FILE_PART must be 5 MB or less: Netlify refuses a request over about 6 MB before any function sees it.")
    if "uploadMeta(" not in fn(lib, "finishUploadParts"):
        problems.append(f"{LIB.name}: finishUploadParts must check the whole file with uploadMeta, the same checks as any file, before it can be attached.")
    held = re.search(r"\nasync function readHeld\(.*?\n\}", lib, re.S)
    if "readHeld(TP" not in fn(lib, "taskFile") or not held or "partKey(key, n)" not in held.group(0):
        problems.append(f"{LIB.name}: taskFile must send a file in parts a part at a time (readHeld), never whole, which could be bigger than an answer may be.")
    if "function send(o)" not in a or "o.part" not in a:
        problems.append("attach.js: a file bigger than a part must go up a part at a time (send).")
    if "dropHeld(TP" not in fn(lib, "removeTaskComment"):
        problems.append(f"{LIB.name}: removeTaskComment leaves a deleted comment's pictures and files behind.")
    if 'id="task-files"' not in PRIVACY.read_text():
        problems.append(f"{PRIVACY.name}: the tasks section does not say what a task keeps of its pictures and files (id=\"task-files\").")


def check_rooms(lib, data):
    m = re.search(r"export const MOD_ROOMS = \{(.*?)\n\};", lib, re.S)
    mods = {k: re.findall(r"'([a-z]+)'", v) for k, v in re.findall(r"^\s*'([a-z0-9-]+)':\s*\[([^\]]*)\]", m.group(1), re.M)} if m else {}
    st = re.search(r"export const STRICT_ROOMS = \[([^\]]*)\]", lib)
    strict = re.findall(r"'([a-z0-9-]+)'", st.group(1)) if st else []
    see = sorted(data.get("see") or [])
    for tag, page in (("tasks", PAGE), ("office", ROOT / "office.html")):
        if sorted(mods.get(tag) or []) != see:
            problems.append(f"{LIB.name}: MOD_ROOMS gives {tag} {mods.get(tag)!r}; it takes TASK_SEE's roles, {see}, so its channel is for the people who can open the page.")
        if tag in strict:
            problems.append(f"{LIB.name}: {tag} is in STRICT_ROOMS, and an administrator can open the page, so the key opens its channel too.")
        body = re.search(r"<body[^>]*>", page.read_text()) if page.exists() else None
        b = body.group(0) if body else ""
        role = re.search(r'data-cb-role="([^"]*)"', b)
        if 'data-cb="mods"' not in b or not role or sorted(role.group(1).split()) != see or "data-cb-strict" in b:
            problems.append(f"{page.name}: its <body> must say data-cb=\"mods\" data-cb-role=\"{' '.join(data.get('see') or [])}\", "
                            "so the radio comes there only for the people its channel is for.")


def main():
    data = json.loads(DATA.read_text())
    lib = LIB.read_text()
    m = re.search(r"export const ROLES = \[([^\]]*)\]", lib)
    roles = re.findall(r"'([a-z]+)'", m.group(1)) if m else []
    settings(data, roles)
    if not problems:
        new = write(lib, data)
        if new != lib:
            LIB.write_text(new)
            lib = new
    check_lib(lib)
    check_function()
    check_colours(data)
    check_recur()
    check_js()
    check_timeline()
    check_comments_js()
    check_preview_js()
    check_css()
    check_page()
    check_rooms(lib, data)
    check_sealed(lib)
    check_files(lib)
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1
    print("tasks: the settings written into the CB, directors, board members and administrators only, nothing kept in the browser, "
          "descriptions built from nodes, and tasks dressed in the CB's own colours.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
