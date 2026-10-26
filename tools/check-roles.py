#!/usr/bin/env python3
"""Hold the roles kept with the CB to their word.

Ryan's ask and calls, 2026-10-21: the roles become a small system that
administrators provision at the desk in the Moderators' room, CB_MODS in
Netlify's settings shrinks to the break-glass list, and what follows is checked
here rather than remembered:

  · THE BREAK-GLASS LIST WINS AND THE DESK CANNOT TOUCH IT. readMods reads
    CB_MODS first, marks its entries fixed, and a stored entry that folds
    alike never replaces one; setRoles refuses a fixed name.
  · FAIL CLOSED, BOTH WAYS. An unreadable CB_MODS locks everything, as it always
    did. Stored roles that cannot be read leave only the break-glass list, and
    a pass is never swapped for less on the strength of that (partial).
  · EVERY ASYNC READER LOADS FIRST. A function that takes `mods` and can wait
    for them loads the stored roles itself when it is not handed them, so a
    request, a webhook or the hourly run never reads half a list; only a sync
    function may fall back on what this instance last loaded, and those are
    named here.
  · BOARD NEEDS THE BOARD. Board is given or taken only by somebody on the board
    or the break-glass list, because Executive Session is the board without
    staff; nobody is left without an administrator; only administrators change
    anything.
  · WHAT IS KEPT is each name's handle, roles, who changed it last and when,
    and nothing more (Ryan's call). Nothing about it is logged.
  · THE DESK shows the part to administrators only and talks to /cb/roles; the
    server is the lock. The privacy page says where the list lives.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
problems = []
SYNC_OK = {"accountAnswer", "isMod", "notifyMessage", "notifyEdit", "taskPeople"}


def code(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"(?m)^\s*//.*$|(?<=[;{}),])\s*//.*$", "", src)


def fn(src, name):
    m = re.search(rf"(?:export )?(?:async )?function {name}\(.*?\n\}}", src, re.S)
    return m.group(0) if m else ""


src = code(LIB.read_text())

for m in re.finditer(r"(?m)^(export )?(async )?function (\w+)\(([^)]*)\)", src):
    is_async, name, params = bool(m.group(2)), m.group(3), m.group(4)
    if "mods = readMods()" in params:
        if is_async:
            problems.append(f"lib.mjs: {name} is async and takes mods = readMods(). It loads them itself: `mods` and `if (mods === undefined) mods = await loadMods();`.")
        elif name not in SYNC_OK:
            problems.append(f"lib.mjs: {name} reads what this instance last loaded (mods = readMods()). Make it async and load, or add it here with the reason it is always called after a load.")
    elif is_async and m.group(1) and re.search(r"(^|,\s*)mods(\s*,|\s*$)", params):
        # Exported only: an internal helper is always handed the list by an exported caller that loaded it.
        if "if (mods === undefined) mods = await loadMods();" not in fn(src, name):
            problems.append(f"lib.mjs: {name} takes mods and does not load them when it is not handed them.")

rm = fn(src, "readMods")
if "parseMods(process.env.CB_MODS)" not in rm or "if (!fixed) return null;" not in rm or "if (!fixed.has(k)) fixed.set(k, v)" not in rm:
    problems.append("lib.mjs: readMods does not read the break-glass list first, fail closed without it, and keep it over a stored entry.")
if "fixed.partial = !storedRoles.map" not in rm:
    problems.append("lib.mjs: readMods does not say when the stored roles could not be read (partial).")
rp = fn(src, "readPass")
if "!mods.partial" not in rp:
    problems.append("lib.mjs: readPass swaps a pass on a list it could not read whole.")
sr = fn(src, "setRoles")
for need, why in (("rolesEditor(who)", "only administrators change roles"),
                  ("fixed.has(key)", "a break-glass name cannot be changed at the desk"),
                  ("boardEditor(who)", "board is given or taken only by the board or the break-glass list"),
                  ("nobody an administrator", "nobody is left without an administrator")):
    if need not in sr:
        problems.append(f"lib.mjs: setRoles does not hold that {why}.")
kept = re.findall(r"people\[k\] = \{([^}]*)\}", sr)
if not kept or sorted(re.findall(r"(\w+):", kept[0])) != ["by", "handle", "roles", "t"]:
    problems.append("lib.mjs: a stored role keeps something other than its handle, roles, who changed it last and when.")
if "who.roles.has('board') || !!who.fixed" not in src:
    problems.append("lib.mjs: boardEditor is not the board or the break-glass list.")
if re.search(r"console\.", fn(src, "setRoles") + fn(src, "rolesList") + fn(src, "loadMods")):
    problems.append("lib.mjs: the roles are logged.")

f = ROOT / "netlify" / "functions" / "cb-roles.mjs"
fs = code(f.read_text()) if f.exists() else ""
if "if (!rolesEditor(who))" not in fs or "method: 'POST'" not in fs:
    problems.append("cb-roles.mjs: the roles are not for administrators, by POST.")
ch = code((ROOT / "netlify" / "functions" / "cb-channel.mjs").read_text())
if "who.swap" not in ch:
    problems.append("cb-channel.mjs: a radio is not handed its new pass when its roles change.")
cb = code((ROOT / "cb.js").read_text())
if "me.takeSwap(r.body.swap)" not in cb or "sent === me.state.pass" not in cb:
    problems.append("cb.js: the radio does not take the pass it is handed, for the pass it sent.")
dk = code((ROOT / "desk.js").read_text())
if "(me.roles || []).indexOf('administrator') < 0" not in dk or "fetch('/cb/roles'" not in dk:
    problems.append("desk.js: the roles part is not for administrators, or does not talk to /cb/roles.")
page = (ROOT / "town-hall-moderators.html").read_text()
if 'id="md-roles"' not in page or 'id="md-roles-off"' not in page:
    problems.append("town-hall-moderators.html: no roles part on the desk.")
# Sealed at rest under CB_STAFF_KEY by name at the store (2026-10-25), and the
# function shut without the key; the privacy page says so.
_staff = re.search(r"const STAFF_SEALED = \[(.*?)\];\n", LIB.read_text(), re.S)
if not _staff or "/^roles$/" not in _staff.group(1):
    problems.append("lib.mjs: STAFF_SEALED no longer seals the stored roles, so it is written in the clear.")
if "if (!staffReady())" not in (ROOT / "netlify" / "functions" / "cb-roles.mjs").read_text():
    problems.append("netlify/functions/cb-roles.mjs does not shut without the staff key.")
if 'id="roles-sealed"' not in (ROOT / "privacy.html").read_text():
    problems.append("privacy.html has no #roles-sealed saying the stored roles are sealed at rest.")
if 'id="roles"' not in (ROOT / "privacy.html").read_text():
    problems.append("privacy.html: no #roles saying where the roles are kept and who sees them.")

if problems:
    print("REFUSING:")
    for p in problems:
        print("  " + p)
    sys.exit(1)
print("roles: the break-glass list first and unchangeable at the desk, fail closed both ways, every async reader loading first, board for the board, who changed a name last and nothing more")
