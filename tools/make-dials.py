#!/usr/bin/env python3
"""Every room has the dial, and this stands it where the room's words run beside it.

WHAT THE DIAL IS. "How loud do you want it?" -- Gentle, Regular and MAX
GLITTER -- in its own clothes on every page (§4's .dial), with love.js filling
in the low-stimulation modes, I need a bodymind break and Walk this room under
it. It is the street's argument made into a control: loudness is a thing the
visitor holds, not a property of the page.

WHY A TOOL. Ryan, 2026-11-04: "I thought every room had a dial box. Add them
everywhere that lacks one." Then, the same day: "The glitter dial pushes things
down pretty far and creates a chunk of vertical whitespace on several pages.
It's at the end of some pages and the beginning of others." Most rooms carried
it in a narrow box at the foot of the page on a row of its own, and the rooms
that had none got it on a row of its own after the header. So this writes every
such dial between dial:begin and dial:end markers in a .dial-dock, which floats
at the right on a wide screen (§4), and stands the dock in the SLOT that
tools/place-dials.mjs measured for the page in data/dials.json: the place where
the room's words run beside it and nothing with a ground runs under it. A page
it has not measured gets the dock straight after its header.

  · A room's own words on its dial (a dial__fine of its own) are kept: the dial
    already on the page is what moves, never a fresh copy over it.
  · A dial a room placed in its own layout, outside the markers and outside the
    old foot box, is left exactly where it is.
  · It refuses a page with no dial and no header to stand one after, so a new
    room cannot open without one.

A SLOT, counted the same way here and in tools/place-dials.mjs: walking
<main>'s top-level nodes, each element not inside a generator's
name:begin/name:end markers, and each begin marker, is a slot, and a run of
plain comments just before one belongs to it; straight after a top-level
<section>, <div> or <article> slot come the slots inside it, counted the same
way one level down. The dial's own markers are skipped. One more slot is the
end of <main>. Indices shift when a room gains a
section; run place-dials.mjs again after changing a room's layout.

WHAT HAS NONE, ON PURPOSE:
  · the call's window, the radio's window and the chat app (tools/windows.py),
    which are windows and the whole screen, not rooms;
  · NO_DIAL, each with its reason: a room whose own published words give one.
"""
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import windows  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
PLACES = ROOT / "data" / "dials.json"
BEGIN, END = "<!-- dial:begin -->", "<!-- dial:end -->"
# Stay Frosty was here until Ryan's call of 2026-11-04 ("Add it there too"): its
# page now says the dial is the only thing in it to press. A page goes in this
# list only with a reason its own published words give.
NO_DIAL = {}
# The old foot box every room was built with.
FOOT = re.compile(r'\n*  <div style="max-width:400px;margin-top:34px;">\n    (<div class="dial">.*?\n    </div>)\n  </div>\n?', re.S)
DIAL = """<div class="dial">
      <p class="dial__label" id="dial-label">HOW LOUD DO YOU WANT IT?</p>
      <div class="dial__row" role="group" aria-labelledby="dial-label">
        <button type="button" class="dial__btn" data-level="gentle"  aria-pressed="false">Gentle</button>
        <button type="button" class="dial__btn" data-level="regular" aria-pressed="false">Regular</button>
        <button type="button" class="dial__btn" data-level="max"     aria-pressed="false">MAX GLITTER</button>
      </div>
      <p class="dial__note" aria-live="polite"></p>
      <p class="dial__fine">Starts wherever your device says. Nothing moves, flashes, or plays until you say so.</p>
    </div>"""
MARK = re.compile(r"^\s*([\w.-]+(?::[\w.-]+)*):(begin|end)\s*$")
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}


def dock(dial):
    return f'{BEGIN}\n  <div class="dial-dock">\n    {dial}\n  </div>\n  {END}'


class Slots(HTMLParser):
    """The offsets of <main>'s slots, as tools/place-dials.mjs counts them."""

    CONT = {"section", "div", "article"}

    def __init__(self, src):
        super().__init__(convert_charrefs=False)
        self.lines = [0]
        for ln in src.splitlines(keepends=True):
            self.lines.append(self.lines[-1] + len(ln))
        self.depth, self.inmain = 0, False
        # region state at each level walked: <main>'s children, and a container's
        self.state = {0: [0, None], 1: [0, None]}
        self.inside = False   # walking the children of a top-level container slot
        self.slots, self.end = [], None
        self.feed(src)

    def at(self):
        line, col = self.getpos()
        return self.lines[line - 1] + col

    def level(self):
        if self.depth == 0:
            return 0
        if self.depth == 1 and self.inside:
            return 1
        return None

    def element(self, tag, void):
        lv = self.level()
        if lv is not None:
            st = self.state[lv]
            slot = not st[0]
            if slot:
                self.slots.append(st[1] if st[1] is not None else self.at())
            st[1] = None
            if lv == 0:
                self.inside = slot and tag in self.CONT and not void
                self.state[1] = [0, None]
        if not void:
            self.depth += 1

    def handle_starttag(self, tag, attrs):
        if not self.inmain:
            if tag == "main":
                self.inmain, self.depth = True, 0
            return
        self.element(tag, tag in VOID)

    def handle_startendtag(self, tag, attrs):
        if self.inmain:
            self.element(tag, True)

    def handle_endtag(self, tag):
        if not self.inmain or tag in VOID:
            return
        if self.depth == 0 and tag == "main":
            self.end, self.inmain = self.at(), False
            return
        self.depth = max(0, self.depth - 1)
        if self.depth == 0:
            self.inside = False

    def handle_comment(self, data):
        if not self.inmain:
            return
        lv = self.level()
        if lv is None:
            return
        st = self.state[lv]
        m = MARK.match(data)
        if m and m.group(1) == "dial":
            return
        if m and m.group(2) == "begin":
            if not st[0]:
                self.slots.append(st[1] if st[1] is not None else self.at())
            st[1], st[0] = None, st[0] + 1
        elif m:
            st[1], st[0] = None, max(0, st[0] - 1)
        elif not st[0] and st[1] is None:
            st[1] = self.at()


def main():
    places = json.loads(PLACES.read_text()).get("at", {}) if PLACES.exists() else {}
    problems, written, kept, moved = [], 0, 0, 0
    for p in sorted(ROOT.glob("*.html")):
        if windows.no_signoff(p.name) or p.name in NO_DIAL:
            continue
        src = p.read_text()
        if BEGIN in src:
            # exactly what the insertion below writes: the block on lines of its
            # own and one blank line after it
            block = re.search(r"^[ \t]*" + re.escape(BEGIN) + r".*?" + re.escape(END) + r"[ \t]*\n\n?", src, re.S | re.M)
            inner = re.search(r'<div class="dial">.*</div>(?=\s*</div>\s*' + re.escape(END) + ")", block.group(0), re.S)
            dial = inner.group(0) if inner else DIAL
            body = src[:block.start()] + src[block.end():]
        elif FOOT.search(src):
            m = FOOT.search(src)
            dial, body = m.group(1), src[:m.start()] + "\n" + src[m.end():]
            moved += 1
        elif 'class="dial"' in src:
            kept += 1
            continue
        else:
            dial, body = DIAL, src
        sl = Slots(body)
        slot = places.get(p.name)
        if slot is not None and 0 <= slot <= len(sl.slots) and sl.end is not None:
            at = sl.slots[slot] if slot < len(sl.slots) else sl.end
        else:
            main_at = body.find("<main")
            close = body.find("</header>", main_at)
            if main_at < 0 or close < 0:
                problems.append(f"{p.name} has no dial and no header inside its <main> to stand one after. "
                                "Give it a dial in its own layout, or a header.")
                continue
            at = close + len("</header>")
        # stand the dock on a line of its own, indented like the room's top level
        line_start = body.rfind("\n", 0, at) + 1
        if body[line_start:at].strip() == "":
            at = line_start
            new = body[:at] + "  " + dock(dial) + "\n\n" + body[at:]
        else:
            # The newline that ended the header's line is already there; the dock
            # brings its own, so one is taken off, or every run adds a blank line.
            rest = body[at:]
            rest = rest[1:] if rest.startswith("\n") else rest.lstrip(" ")
            new = body[:at] + "\n  " + dock(dial) + "\n\n" + rest
        if new != src:
            p.write_text(new)
            written += 1
    for name in NO_DIAL:
        if 'class="dial"' in (ROOT / name).read_text():
            problems.append(f"{name} is in NO_DIAL and has a dial. Take it out of NO_DIAL, on purpose.")
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1
    print(f"dials: every room has one, {kept} placed in their rooms' own layouts and the rest docked "
          f"where data/dials.json measured them ({written} rewritten, {moved} out of the old foot box); "
          "none in the windows or the chat app" + (f", or {', '.join(sorted(NO_DIAL))}" if NO_DIAL else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
