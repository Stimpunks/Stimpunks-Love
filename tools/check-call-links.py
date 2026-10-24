#!/usr/bin/env python3
"""Hold the rule that following a link does not hang up your call.

Ryan's ask, 2026-10-24: every room is a page, and a page that goes takes its
call with it, so following a #tag on the channel hung up the call you were in.
Ryan's choice, from two ways of fixing it, was both of these:

  · WHILE A CALL IS UP IN THE PAGE, ANYTHING IN THE RADIO THAT WOULD LEAVE THE
    PAGE OPENS IN A NEW TAB, AND SAYS SO. Links in the radio (the channel, a
    conversation, a profile, Who's online, Unreads), the teleporter and Take
    to the forums all go through callUp and leavesPage in cb.js, and the guest
    bar's teleporter does the same for a guest in a public room's call. With
    no call up they walk you as they always have: the friendly edit is a new
    tab for every link, which piles up tabs, each with its own radio, for
    everybody who was never in a call.
  · EVERY OTHER WAY OFF THE PAGE ASKS LEAVE SITE? FIRST, while a call is up:
    call.js listens for beforeunload only between a call opening in a page and
    its leaving, never in the call's own window, and nothing else on the street
    listens for it, because a page that does is kept out of the browser's
    back-forward cache.

WHAT IT REFUSES: any of those wires cut, a location.href in cb.js that does not
ask callUp first, a new tab opened while no call is up, the radio not saying
where a link went, and a beforeunload anywhere but call.js.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
problems = []


def refuse(msg):
    problems.append(msg)


def uncomment(s):
    return re.sub(r"(?m)^\s*//.*$", "", re.sub(r"/\*.*?\*/", "", s, flags=re.S))


def fn(src, name, where):
    m = re.search(r"function " + re.escape(name) + r"\(.*?\n  \}", src, re.S)
    if not m:
        refuse(f"{where} has no {name}, which keeps a call up when a link is followed.")
        return ""
    return m.group(0)


def main():
    call = uncomment((ROOT / "call.js").read_text())
    cb = uncomment((ROOT / "cb.js").read_text())
    guest = uncomment((ROOT / "guest.js").read_text())

    # Leave site?, in call.js and only while a call is up in a page.
    guarding = fn(call, "guarding", "call.js")
    if "window.addEventListener('beforeunload', guard)" not in guarding or "window.removeEventListener('beforeunload', guard)" not in guarding:
        refuse("call.js's guarding no longer adds and takes away the Leave site? listener.")
    if call.count("beforeunload") != 2:
        refuse("call.js listens for beforeunload somewhere besides guarding: it is listened for only while a call is up.")
    if "guarding(false);" not in fn(call, "leave", "call.js"):
        refuse("Leaving a call no longer stops asking Leave site?, so the page would ask after the call is gone.")
    if "if (!opts.whole) guarding(true);" not in call:
        refuse("call.js no longer asks Leave site? when a call opens in a page, or asks it in the call's own window too.")
    for f in sorted(ROOT.glob("*.js")):
        if f.name != "call.js" and "beforeunload" in uncomment(f.read_text()):
            refuse(f"{f.name} listens for beforeunload: only a call asks Leave site?, so a page is not kept out of the back-forward cache for nothing.")

    # The radio: a new tab only while a call is up, and only for a link that leaves.
    for name in ("callUp", "leavesPage", "newTab", "goPage", "goStreet"):
        fn(cb, name, "cb.js")
    go = fn(cb, "goPage", "cb.js")
    if "if (callUp() && leavesPage(href)) return newTab(href) ? 'tab' : 'kept';" not in go:
        refuse("goPage goes without asking whether a call is up and the page would go.")
    if "if (!inWindow()) return goPage(href);" not in fn(cb, "goStreet", "cb.js"):
        refuse("goStreet leaves this page without going through goPage.")
    if "if (w && callUp(w) && leavesPage(href, w))" not in fn(cb, "goStreet", "cb.js"):
        refuse("From the radio's own window, goStreet takes away the page a call is up in.")
    sets = re.findall(r"(?<![\w.])location\.href\s*=", cb)
    if len(sets) != 1 or "location.href = href;" not in go:
        refuse("cb.js sets location.href somewhere besides goPage, which is a way off the page that does not ask about the call.")
    if not re.search(r"root\.addEventListener\('click', function \(e\) \{\s*if \(!callUp\(\)\) return;", cb):
        refuse("The radio's links no longer open in a new tab while a call is up, or do it while none is.")
    if "if (!leavesPage(a.href)) return;" not in cb:
        refuse("The radio sends a link that stays on the page to a new tab.")
    if cb.count("window.open(href, '_blank')") != 2:
        refuse("cb.js opens a page in a new tab somewhere besides newTab and the radio window's way back to the street.")
    if "Radio.prototype.tabTold = function (how, near)" not in cb:
        refuse("cb.js has no tabTold, which says where a link the call kept went.")
    if "opened in a new tab, so your call stays up" not in (ROOT / "cb.js").read_text() or "would not open a new tab" not in (ROOT / "cb.js").read_text():
        refuse("The radio no longer says a link opened in a new tab for the call, or that the browser would not open one.")
    for needle, what in (("me.tabTold(newTab(a.href) ? 'tab' : 'kept', a);", "a link in the radio"),
                         ("this.tabTold(goStreet(room.path), null);", "the teleporter"),
                         ("me.tabTold(goPage('/forum.html#/new?from='", "Take to the forums"),
                         ("me.tabTold(goStreet(u.href), a);", "the radio's own window")):
        if needle not in cb:
            refuse(f"{what} no longer goes through the call's rule and says where it went.")

    # The guest bar's teleporter, for a guest in a public room's call.
    g = re.search(r"function go\(room\) \{.*?\n    \}", guest, re.S)
    g = g.group(0) if g else ""
    # Its first version only looked for the words isOpen(), and passed a go() that never asked them.
    if "if (call && u && (u.pathname !== location.pathname || u.search !== location.search))" not in g \
            or "window.loveCall.isOpen()" not in g or "window.open(u.href, '_blank')" not in g or "tpSaid.textContent" not in g:
        refuse("The guest bar's teleporter takes away a page a call is up in, or no longer says where it went.")

    for doc, anchor in (("cb-guide.html", 'id="call-links"'),):
        if anchor not in (ROOT / doc).read_text():
            refuse(f"{doc} has no section on links during a call ({anchor}).")

    if problems:
        print("REFUSING: following a link could hang up somebody's call.\n")
        for p in problems:
            print("  ·", p)
        sys.exit(1)
    print("A call stays up when a link is followed: the radio opens a new tab while one is up and says so, and every other way off asks first.")


if __name__ == "__main__":
    main()
