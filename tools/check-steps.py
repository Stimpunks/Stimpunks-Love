#!/usr/bin/env python3
"""Hold going back one step, in tasks, the office and the forums, to its word.

Norah's ask, put by Ryan on 2026-10-21: a back button that goes back one step,
not all the way to the street or the room, and remembers how far down the view
was. steps.js does it for all three apps, and what it promises is checked here
rather than remembered:

  · IT KEEPS A NUMBER AND AN ADDRESS, NEVER A WORD. The tab's history holds,
    beside each address it already has, a key, how far down the view was and
    the address of the view before; clean() is the only thing that writes
    loveStep, and it writes exactly those. A title, a name or a link's words
    would put somebody's details into the browser's history, which the office
    refuses even for a search.
  · IT STORES AND SENDS NOTHING ELSE. No storage, no cookie, no request.
  · NOTHING SCROLLS SMOOTHLY. The dial exists so nothing moves the view unasked,
    and a jump back to where you were is a jump.
  · EVERY APP GOES THROUGH IT. Each one makes its steps, arrives at the start of
    every route and lands once the view has drawn, and never writes the history
    itself: a replaceState with no step in it drops the step, and Back from the
    next view has nowhere to put you.
  · EVERY PAGE LOADS IT FIRST, before the app's own script.
  · THE PRIVACY PAGE SAYS SO, under each app's own section.

And the same between pages (Ryan's ask, 2026-10-24): a room's way back
(.backlink) and any link to the whole street go back through the tab's own
history to the last time you were on that page, which the browser opens where
you left it. wayBack() in love.js does it, and it is held here because it is
this file's promise arriving between pages:

  · IT KEEPS AND SENDS NOTHING, and moves nothing itself: the browser's own
    history and the browser's own way of putting a page back where it was.
    No storage, no request, no scroll, no history written.
  · IT GOES BACK, it never goes forward: traverseTo an entry already there.
  · ONLY A PLAIN PRESS ON A WAY BACK: a room's .backlink, or a link to the
    whole street from another page. A door is never taken back, and a new
    tab, a link to a part of the street and a link on its own page are left
    alone.
  · EVERY PAGE RUNS IT, from love.js's go().
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STEPS = ROOT / "steps.js"
APPS = [("tasks", "tasks"), ("office", "office"), ("forum", "forums")]
problems = []


def code(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"(?m)^\s*//.*$|(?<=[;{}),])\s*//.*$", "", src)


def check_steps():
    if not STEPS.exists():
        problems.append("steps.js: missing.")
        return
    js = code(STEPS.read_text())
    for pat, why in [
        (r"localStorage|sessionStorage|indexedDB|document\.cookie|caches\.", "it keeps nothing in the browser but the step in the tab's history"),
        (r"\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource", "it sends nothing anywhere"),
        (r"smooth", "nothing scrolls smoothly: going back is a jump"),
        (r"pushState", "it never adds a step to the history: a link or a press does"),
    ]:
        for m in re.finditer(pat, js):
            problems.append(f"steps.js: {m.group(0)}. {why[0].upper() + why[1:]}.")
    clean = re.search(r"function clean\(st\) \{(.*?)\n    \}", js, re.S)
    if not clean:
        problems.append("steps.js: no clean(st), the one thing that says what a step holds.")
    else:
        body = clean.group(1)
        fields = re.findall(r"\b(\w+):", body)
        if sorted(set(fields)) != ["back", "hash", "key", "y"]:
            problems.append(f"steps.js: clean() writes {sorted(set(fields))}. A step is a key, how far down and the address behind, and never a word.")
    sets = re.findall(r"loveStep\s*=\s*([^;]+);", js)
    if sets != ["clean(st)"]:
        problems.append(f"steps.js: loveStep is set from {sets}. Only clean(st) writes it.")
    for m in re.finditer(r"history\.replaceState\(([^,]+),", js):
        if m.group(1).strip() not in ("n", "history.state"):
            problems.append(f"steps.js: replaceState({m.group(1).strip()}, …). It writes the cleaned step, or leaves the state as it is.")


def check_apps():
    priv = (ROOT / "privacy.html").read_text()
    for name, section in APPS:
        page = (ROOT / f"{name}.html").read_text()
        at = [page.find(f'<script src="{s}" defer></script>') for s in ("steps.js", f"{name}.js")]
        if min(at) < 0 or at[0] > at[1]:
            problems.append(f"{name}.html: it must load steps.js, then {name}.js.")
        js = code((ROOT / f"{name}.js").read_text())
        for need, why in [
            (r"window\.loveSteps\(\{", "makes no steps"),
            (r"function route\(\) \{\s*step\.arrive\(\);", "does not arrive at the start of route()"),
            (r"step\.land\(done\);", "does not land once the view has drawn"),
        ]:
            if not re.search(need, js):
                problems.append(f"{name}.js: {why}, so going back cannot put anybody where they were.")
        for m in re.finditer(r"history\.(replaceState|pushState)\(", js):
            problems.append(f"{name}.js: history.{m.group(1)}. Filters go into the address by step.replace(), which keeps the step.")
        if "scrollRestoration" in js:
            problems.append(f"{name}.js: scrollRestoration. steps.js puts the place back.")
        part = re.search(r'<h2 id="%s">.*?(?=<h2 )' % section, priv, re.S)
        if not part or "how far down that view you were" not in part.group(0):
            problems.append(f"privacy.html#{section}: it must say the tab's history keeps how far down each view was.")


def check_way_back():
    love = code((ROOT / "love.js").read_text())
    m = re.search(r"\n  function wayBack\(\) \{\n(.*?)\n  \}\n", love, re.S)
    if not m:
        problems.append("love.js: no wayBack(), so a way back opens its page at the top.")
        return
    body = m.group(1)
    for pat, why in [
        (r"localStorage|sessionStorage|indexedDB|document\.cookie|caches\.", "it keeps nothing: the place is in the browser's own history"),
        (r"\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource", "it sends nothing anywhere"),
        (r"scrollTo|scrollBy|scrollIntoView|scrollTop|smooth", "it moves nothing itself: the browser puts the page back where it was"),
        (r"pushState|replaceState|navigation\.navigate|\.navigate\(|\.back\(|\.forward\(", "it only goes back to a visit already in the history, by traverseTo"),
    ]:
        for x in re.finditer(pat, body):
            problems.append(f"love.js wayBack(): {x.group(0)}. {why[0].upper() + why[1:]}.")
    for need, why in [
        (r"nav\.traverseTo\(visit\.key\)", "does not go back to the last visit to the page"),
        (r"if \(to === page\(location\.pathname\)\) return;", "takes over a link on its own page"),
        (r"if \(!a\.classList\.contains\('backlink'\) && \(to !== '/' \|\| u\.hash\)\) return;", "takes over a link that is not a way back: a door goes forward, and a link to a part of the street goes there"),
        (r"ev\.defaultPrevented \|\| ev\.button \|\| ev\.metaKey \|\| ev\.ctrlKey \|\| ev\.shiftKey \|\| ev\.altKey", "takes over a press that opens a new tab or that a page already answered"),
        (r"e\.index >= here\.index", "could go forward"),
    ]:
        if not re.search(need, body):
            problems.append(f"love.js wayBack(): {why}.")
    go = re.search(r"function go\(\) \{([^}]*)\}", love)
    if not go or "wayBack();" not in go.group(1):
        problems.append("love.js: go() does not run wayBack(), so no way back puts anybody where they were.")


def main():
    check_steps()
    check_apps()
    check_way_back()
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)
    print("going back: a number and an address in the tab's history, nothing else kept or sent, every app through steps.js, and every way back through the tab's own history")


if __name__ == "__main__":
    main()
