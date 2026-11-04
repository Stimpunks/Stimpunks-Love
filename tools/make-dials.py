#!/usr/bin/env python3
"""Every room has the dial, and this writes it into the rooms that did not.

WHAT THE DIAL IS. "How loud do you want it?" -- Gentle, Regular and MAX
GLITTER -- in its own clothes on every page (§4's .dial), with love.js filling
in the low-stimulation modes, I need a bodymind break and Walk this room under
it. It is the street's argument made into a control: loudness is a thing the
visitor holds, not a property of the page.

WHY A TOOL. Most rooms carry the dial by hand, placed in their own header the
way the room is laid out, and they keep it so. Ryan, 2026-11-04: "I thought
every room had a dial box. Add them everywhere that lacks one." About forty
pages had none, many of them written whole by their own generators. So this
writes the same dial, between dial:begin and dial:end markers, straight after
the page's header inside <main>, in a .dial-dock that stands it at the right,
and keeps it there after any generator rewrites the page; and it refuses a page
that has neither a dial of its own nor its markers, so a new room cannot open
without one. A room may still move its dial into its own layout by hand: a
page with a hand dial outside the markers is left alone.

WHAT HAS NONE, ON PURPOSE:
  · the call's window, the radio's window and the chat app (tools/windows.py),
    which are windows and the whole screen, not rooms;
  · NO_DIAL, each with its reason: a room whose own published words promise
    there is nothing in it to press.
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import windows  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
BEGIN, END = "<!-- dial:begin -->", "<!-- dial:end -->"
NO_DIAL = {
    "stay-frosty.html": "says on its own page that there is nothing in it to press, and "
                        "tools/make-stay-frosty.py refuses a button there; Ryan's call whether that changes",
}
# Pages whose next thing after the header is wide (a stage, a model), where a
# floating dial would squeeze it: the dial stands above it instead.
STACK = {"cel-street.html", "paper-street.html", "map.html"}
DIAL = """<!-- dial:begin -->
  <div class="dial-dock">
    <div class="dial">
      <p class="dial__label" id="dial-label">HOW LOUD DO YOU WANT IT?</p>
      <div class="dial__row" role="group" aria-labelledby="dial-label">
        <button type="button" class="dial__btn" data-level="gentle"  aria-pressed="false">Gentle</button>
        <button type="button" class="dial__btn" data-level="regular" aria-pressed="false">Regular</button>
        <button type="button" class="dial__btn" data-level="max"     aria-pressed="false">MAX GLITTER</button>
      </div>
      <p class="dial__note" aria-live="polite"></p>
      <p class="dial__fine">Starts wherever your device says. Nothing moves, flashes, or plays until you say so.</p>
    </div>
  </div>
  <!-- dial:end -->"""


def main():
    problems, written, kept = [], 0, 0
    for p in sorted(ROOT.glob("*.html")):
        if windows.no_signoff(p.name) or p.name in NO_DIAL:
            continue
        src = p.read_text()
        dial = DIAL.replace('class="dial-dock"', 'class="dial-dock dial-dock--stack"') if p.name in STACK else DIAL
        if BEGIN in src:
            new = re.sub(re.escape(BEGIN) + r".*?" + re.escape(END), lambda _: dial, src, count=1, flags=re.S)
        elif 'class="dial"' in src:
            kept += 1
            continue
        else:
            main_at = src.find("<main")
            close = src.find("</header>", main_at)
            if main_at < 0 or close < 0:
                problems.append(f"{p.name} has no dial and no header inside its <main> to stand one after. "
                                "Give it a dial in its own layout, or a header.")
                continue
            at = close + len("</header>")
            new = src[:at] + "\n\n  " + dial + src[at:]
        if new != src:
            p.write_text(new)
            written += 1
    for name in NO_DIAL:
        if 'class="dial"' in (ROOT / name).read_text():
            problems.append(f"{name} is in NO_DIAL and has a dial. Take it out of NO_DIAL, on purpose.")
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1
    print(f"dials: every room has one, {kept} placed by their rooms and the rest written here "
          f"({written} rewritten); none in the windows, the chat app, or {', '.join(sorted(NO_DIAL))}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
