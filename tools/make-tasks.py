#!/usr/bin/env python3
"""Write tasks' settings into the CB, and hold tasks to what they and
privacy.html say.

Ryan's brief, 2026-10-20: the team's to-do list, moved here from EspoCRM in
stages (the tasks and their list first, then a board and saved filters,
then recurring tasks; a timeline to follow), for directors and administrators
only.

WHAT IT WRITES: data/tasks.json's roles, statuses, priorities and tags,
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
  · A SAVED FILTER KEPT WITH MORE THAN ITS ID, NAME AND ADDRESS, or left
    behind when its person uses Forget me or deletes the username.
  · privacy.html without its tasks section, and the page without its link to it.

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


def write(lib, data):
    j = lambda v: json.dumps(v, ensure_ascii=False)
    block = (BEGIN + "\n"
             + f"export const TASK_SEE = {j(data['see'])};\n"
             + f"export const TASK_STATUSES = {j(data['statuses'])};\n"
             + f"export const TASK_DONE = {j(data['done'])};\n"
             + f"export const TASK_BOARD_HIDES = {j(data['board_hides'])};\n"
             + f"export const TASK_REPEATS = {j(data['repeats'])};\n"
             + f"export const TASK_PRIORITIES = {j(data['priorities'])};\n"
             + f"export const TASK_DEFAULT_PRIORITY = {j(data['default_priority'])};\n"
             + f"export const TASK_TAGS = {j(data['tags'])};\n"
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
                 "taskRecurs", "taskRecur", "saveRecur", "removeRecur"):
        body = fn(sec, name)
        first = re.search(r"\{\n\s*(.*)", body)
        if not body:
            problems.append(f"{LIB.name}: {name} is missing.")
        elif not first or "if (!tasksAllow(who))" not in first.group(1):
            problems.append(f"{LIB.name}: {name} must refuse anybody tasksAllow does not let in, before it reads or does anything.")
    allow = fn(sec, "tasksAllow")
    if "forumReader(who)" not in allow or "who.role !== 'base'" not in allow or "TASK_SEE" not in allow:
        problems.append(f"{LIB.name}: tasksAllow no longer means a claimed username on the base pass holding one of TASK_SEE's roles.")
    if "TASK_SEE" not in fn(sec, "taskPeople"):
        problems.append(f"{LIB.name}: taskPeople must be everybody who could read tasks, and nobody else.")
    # A recurring task's task is made under nobody's name, says where it came from, and is never made twice.
    rt = re.search(r"function recurTask\(.*?\n\}", sec, re.S)
    if not rt or "by: null" not in rt.group(0) or "recur: r.id" not in rt.group(0) or "on: d" not in rt.group(0):
        problems.append(f"{LIB.name}: a recurring task's task is made under nobody's name and keeps which recurring task and which day made it.")
    mk = fn(sec, "makeRecurring")
    if "there.has(" not in mk or "today(" not in mk:
        problems.append(f"{LIB.name}: makeRecurring must skip a task already made for that day, and count days on the street's clock.")
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
    for url in set(re.findall(r"""['"](/[a-z][^'"?#]*)""", js)):
        if url not in ("/cb/tasks", "/cb.css", "/tasks.css", "/privacy.html", "/cb-guide.html", "/community-center.html", "/tasks.html"):
            problems.append(f"{JS.name}: it calls {url}. Tasks talk to /cb/tasks and nothing else.")


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
    at = [page.find(f'<script src="{s}" defer></script>') for s in ("markdown.js", "tasks.js")]
    if min(at) < 0 or at[0] > at[1]:
        problems.append(f"{PAGE.name}: it must load markdown.js, then tasks.js.")
    if 'href="privacy.html#tasks"' not in page:
        problems.append(f"{PAGE.name}: the page must link what tasks keep, privacy.html#tasks.")
    if 'id="tasks"' not in PRIVACY.read_text():
        problems.append(f"{PRIVACY.name}: it has no tasks section (id=\"tasks\").")


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
    check_recur()
    check_js()
    check_css()
    check_page()
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1
    print("tasks: the settings written into the CB, directors and administrators only, nothing kept in the browser, "
          "descriptions built from nodes, and tasks dressed in the CB's own colours.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
