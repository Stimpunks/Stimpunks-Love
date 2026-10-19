#!/usr/bin/env python3
"""Hold the CB's props to what privacy.html#props promises.

Ryan, 2026-10-18, after the forums' Props & Gratitude category: a Props tab in
every profile, where anybody signed on reads the props somebody has been given
and anybody with a claimed username writes them one, each waiting for its person
to Confirm or Reject it, and a switch that opens the tab, like the other tabs'.
The server is the Props part of netlify/cb/lib.mjs, /cb/props (your own) and
/cb/props/of (somebody's); the radio's half is in cb.js.

WHAT IT REFUSES, and why each one is here:

  · A TIME IN THE PROPS PART OF lib.mjs. Nothing about when a prop was written,
    confirmed or taken off is kept: a list of dates beside thank-yous is a
    record of somebody's days, and a profile says nothing about when (Ryan's
    call for profile cards, which props live beside).
  · A PROP KEPT WITH ANYTHING BUT ITS WORDS, ITS WRITER, THE MARK AND AN ID, and
    the mark sent anywhere. The mark (authorMark, the forums') is how a name
    deleted and claimed again cannot take back what its owner wrote; it is
    never part of an answer, so shapeProp must not spread a prop or name `by`.
  · A WRITER WHO IS NOT A CLAIMED USERNAME, and a prop that goes up without its
    person confirming it. giveProp asks forumReader first and writes only to
    the waiting list; only confirmProp moves one onto the tab; shownProps shows
    the tab only while it is open.
  · FORGET ME OR DELETING THE USERNAME LEAVING PROPS BEHIND.
  · A COUNT in the radio's props code: no "how many props", no number on the
    tab and none beside Waiting for you. The friendly edit is a count on the
    tab, which is the headcount the street refuses, wearing a thank-you.
  · A props function that logs anything, and a privacy page or CB guide with no
    section on props: nothing is kept under a person that the page does not say.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
CB = ROOT / "cb.js"
FUNCS = [ROOT / "netlify" / "functions" / n for n in ("cb-props.mjs", "cb-props-of.mjs")]

problems = []


def refuse(msg):
    problems.append(msg)


def uncomment(s):
    return re.sub(r"(?m)^\s*//.*$", "", re.sub(r"/\*.*?\*/", "", s, flags=re.S))


def fn(src, name):
    m = re.search(r"export (?:async )?function " + re.escape(name) + r"\(.*?\n\}", src, re.S)
    if not m:
        refuse(f"lib.mjs has no {name}, which Props needs.")
        return ""
    return m.group(0)


def main():
    lib = LIB.read_text()
    if "/* ── Props" not in lib:
        raise SystemExit("REFUSING: lib.mjs has no Props part (/* ── Props). Put it back rather than letting this tool go quiet.")
    part = lib[lib.index("/* ── Props"):lib.index("/* ── The Slake")]
    code = uncomment(part)
    m = re.search(r"Date\.now|\bnow\b|\bsince\b|\bt:\s|\bwhen\b|new Date", code)
    if m:
        refuse(f"the Props part of lib.mjs has {m.group(0)!r}: a prop keeps its words and its writer and nothing about when.")

    give = fn(lib, "giveProp")
    if "if (!forumReader(who)) return { error: 'claim' };" not in give:
        refuse("giveProp no longer refuses a writer whose username is not claimed, first.")
    rec = re.search(r"const rec = (\{[^}]*\});", give)
    keys = sorted(re.findall(r"[{,]\s*(\w+)\s*(?=[:,}])", rec.group(1))) if rec else []
    if keys != ["by", "handle", "id", "text"]:
        refuse(f"a prop is kept with {keys}; it is exactly its id, its words, its writer's handle and the mark (by), "
               "and whether they were the base, set after.")
    if "authorMark(who)" not in give:
        refuse("giveProp no longer marks a prop with the claimed username that wrote it.")
    if re.search(r"props:\s*\[", give) or "waiting: [...was.waiting, rec]" not in give:
        refuse("giveProp writes somewhere other than the waiting list. Nothing goes up until its person confirms it.")
    if re.search(r"props:\s*\[", re.sub(r"export async function confirmProp\(.*?\n\}", "", code, flags=re.S)):
        refuse("something other than confirmProp puts a prop on a Props tab.")
    shape = fn(lib, "shapeProp")
    if re.search(r"\bby\s*:|\.\.\.\s*p\b", shape):
        refuse("shapeProp sends the writer's mark, or spreads the whole prop into an answer. The mark never leaves the server.")
    shown = fn(lib, "shownProps")
    if "if (d.open) out.props" not in shown:
        refuse("shownProps shows a Props tab that is shut.")
    if "p.by === mark" not in shown:
        refuse("shownProps shows somebody props waiting that they did not write.")

    da = re.search(r"export async function deleteAccount\(.*?\n\}", lib, re.S)
    if not da or "await forgetProps(petKey(handle), s);" not in da.group(0):
        refuse("deleteAccount in lib.mjs no longer deletes a username's props.")
    if "forgetProps(pk)" not in (ROOT / "netlify/functions/cb-pets.mjs").read_text():
        refuse("Forget me (cb-pets.mjs) no longer deletes props.")
    for f in FUNCS:
        if not f.exists():
            refuse(f"{f.name} is missing.")
            continue
        if re.search(r"\bconsole\.", f.read_text()):
            refuse(f"{f.name} logs something, and nothing a person sends is ever logged.")
        if "noindex" not in f.read_text():
            refuse(f"{f.name} no longer asks search engines not to index its answers.")

    cb = CB.read_text()
    blocks = []
    for begin, end in (("Radio.prototype.peekProps", "/* The avatars in somebody's profile"),
                       ("/* ── Your props ─", "/* ── Your chimeras ─")):
        if begin not in cb or end not in cb:
            refuse(f"cb.js has lost {begin!r}, where the radio's props are drawn.")
            continue
        blocks.append(cb[cb.index(begin):cb.index(end, cb.index(begin))])
    radio = uncomment("\n".join(blocks))
    m = re.search(r"\.length\s*\+|\+\s*[\w.]+\.length\b|\bcount\b|\btotal\b|\bhow many\b|\bnumber of\b", radio, re.I)
    if m:
        refuse(f"cb.js's props code has {m.group(0)!r}. Nothing counts props: nobody is shown how many anybody has, "
               "or has waiting.")
    if re.search(r"innerHTML|outerHTML|insertAdjacentHTML", radio):
        refuse("cb.js writes a prop as markup from a string. A prop's words are drawn into elements by md().")

    for page, what in (("privacy.html", "privacy page"), ("cb-guide.html", "CB guide")):
        if 'id="props"' not in (ROOT / page).read_text():
            refuse(f"the {what} ({page}) has no section on props (id=\"props\").")

    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)
    print("props: kept with their words and writer and nothing about when, up only once confirmed, never counted")


if __name__ == "__main__":
    main()
