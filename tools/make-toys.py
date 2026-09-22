#!/usr/bin/env python3
"""Build the Playhouse's toys out of data/toys.json.

FOUR HAND-WRITTEN TOYS WAS FINE AND TEN IS NOT, which is the whole reason this
file exists. Every toy is three things in three places that are nowhere near
each other: a tile in playhouse.html, a handler in love.js, a fill in love.css.
Hand-kept, that is the shape make-soundboard.py was written for a day earlier --
a control that looks finished in the file you are editing and does nothing in
the one you are not. So this reads all three and refuses.

A TOY IS NOT AN EXPLAINER. Each one is a real idea out of our own glossary
wearing a costume; the tile does the thing and a line under it names the idea
and links it. Nothing teaches, quizzes, or asks a visitor to show they have
understood. That line is also why the links had to be fixed first: they sit on
the blue ground, where this room's inherited yellow measured 3.88.

WHAT IT REFUSES, and why each one is here:

  · A TOY WITH NO HANDLER IN love.js. A tile that does nothing is not an error
    anywhere -- it is a button somebody presses and presses, in the room whose
    entire premise is that everything is a button. make-chappell.py's typo that
    never becomes a video, arriving a third time.

  · A TOY WHOSE FILL HAS NO RULE IN love.css, and TWO TOYS SHARING A FILL. Ten
    tiles, ten colours, none repeated -- which is this street's rule about
    rooms, holding at the size of one object because it is the only thing
    keeping a wall of ten boxes from reading as a grid of one box.

  · A CREDIT THAT IS NOT ON THE FACE OF THE TILE. Damian Milton's name on the
    telephone, Christine Miserandino's on the spoon drawer. A credit recorded in
    a data file and not in the copy is a credit nobody reads, and this site
    keeps attribution loud precisely because it dropped the other three habits.

  · A `wears` WITH NO LINK, OR A LINK THAT IS NOT OURS. The idea line is the
    only claim a toy makes about where it came from; an unlinked claim is a
    thing somebody would have to take on trust. The slugs themselves are
    checked against the Knowledge System mirror by hand before they get here --
    a 301 on stimpunks.org is a failure rather than a pass, so a live fetch
    would cheerfully confirm a page that does not exist.

  · THE VOCABULARY OF SCORING. A wall of ten toys is the next thing after a job
    board to grow a counter, and the stim box already says "nobody is counting"
    as a joke about counting. Checked with the negation rule rather than a flat
    ban, because the sentences that REFUSE a tally have to stay sayable.

IT CARRIES TWO PAYLOADS IT DOES NOT OWN. Chairy's sayings are written by
make-chairy.py out of data/chairy.json, and the yell button's recordings by
make-yells.py out of data/yells.json. This lifts those attributes off the
published page and puts them back untouched. A generator that silently empties
another generator's output is the _headers trap with two tools in it instead of
one -- and both of those tools refuse outright if their attribute is missing, so
the failure would be loud in one direction and silent in the other. This is the
silent direction, closed.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "playhouse.html"
CSS = ROOT / "love.css"
JS = ROOT / "love.js"
DATA = ROOT / "data/toys.json"

OURS = "https://stimpunks.org/"

# make-guild.py's pattern, and its reasoning: a point is only a point when it is
# being awarded or counted, so that "nothing here is scored" passes and "your
# score" does not.
SCORE_NOUNS = (r"(?:scores?|scored|scoring|streaks?|high scores?|leaderboards?|"
               r"progress bars?|percentages?|tall(?:y|ies)|tallied)")
NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|"
            r"refusing|cannot|does not|won't|will not|is not|are not|isn't|"
            r"aren't|nobody)")
SCORE = re.compile(rf"\b{SCORE_NOUNS}", re.I)

# Named or numeric, both of which arrive from somebody pasting out of an editor.
ENTITY = re.compile(r"&(?:[A-Za-z][A-Za-z0-9]{1,10}|#\d{2,5}|#x[0-9A-Fa-f]{2,5});")
SCORE_OK = re.compile(rf"\b{NEGATION}\b[^.]{{0,40}}?\b{SCORE_NOUNS}", re.I)

# The toy's own content, and the attribute it rides on. Written out rather than
# derived, so adding a field to the data is a decision here as well as there.
CARRIES = {
    "terms":     ("data-terms", "pipe"),
    "empty":     ("data-empty", "text"),
    "says":      ("data-says", "text"),
    "sentences": ("data-sentences", "json"),
    "said":      ("data-said", "text"),
    "quiet":     ("data-quiet", "text"),
    "dumps":     ("data-dumps", "json"),
    "calls":     ("data-calls", "json"),
}


def e(s):
    return html.escape(str(s), quote=True)


def carried(src, toy_id, attr):
    """What the published page already holds for an attribute another tool owns."""
    m = re.search(rf'data-toy="{toy_id}"[^>]*?{attr}="([^"]*)"', src, re.S)
    return m.group(1) if m else None


def main():
    data = json.loads(DATA.read_text())
    toys = data.get("toys", [])
    if not toys:
        raise SystemExit("REFUSING: data/toys.json has no toys in it.")

    css, js, src = CSS.read_text(), JS.read_text(), PAGE.read_text()
    handlers = set(re.findall(r"toy\('([a-z]+)'", js))
    notes = set(re.findall(r"note\('([a-z]+)'", js))
    sayings = len(json.loads((ROOT / "data/chairy.json").read_text()).get("sayings", []))

    problems, seen_id, seen_key, seen_name = [], {}, {}, {}

    for i, t in enumerate(toys):
        tid = t.get("id", "")
        where = f"toy {tid!r}" if tid else f"toy {i + 1}"

        for key in ("id", "name", "key", "what"):
            if not str(t.get(key, "")).strip():
                problems.append(f"{where} is missing its {key!r}.")
        if not tid:
            continue

        for field, bag, what in ((tid, seen_id, "id"), (t.get("key"), seen_key, "fill"),
                                 (t.get("name"), seen_name, "name")):
            if field in bag:
                problems.append(
                    f"{where} and {bag[field]!r} share the {what} {field!r}."
                    + (" Ten tiles want ten colours; two the same turns a wall of"
                       " toys into a grid of one toy." if what == "fill" else ""))
            bag[field] = tid

        blurb = t.get("what", "")
        if SCORE.search(blurb) and not SCORE_OK.search(blurb):
            problems.append(
                f"{where} talks about scoring. Nothing in this room is counted — the "
                "stim box says so as a joke and the joke does not survive a second "
                "toy repeating it with a straight face.")

        credit = t.get("credit")
        if credit and credit not in blurb:
            problems.append(
                f"{where} credits {credit!r} in the data and not on the face of the "
                "tile. A credit nobody reads is not a credit.")

        if bool(t.get("wears")) != bool(t.get("url")):
            problems.append(
                f"{where} has a {'wears' if t.get('wears') else 'url'} and not the "
                "other. The idea line is one claim and one link, or it is neither.")
        if t.get("url") and not t["url"].startswith(OURS):
            problems.append(
                f"{where} points its idea line at {t['url']!r}, which is not one of "
                "our own pages.")

        if tid not in handlers:
            problems.append(
                f"{where} has no toy('{tid}') in love.js, so pressing it would do "
                "nothing at all — in the room whose whole premise is that everything "
                "is a button.")
        # EVERY TOY MAKES A NOISE. Ryan, 2026-09-21: in a room where most
        # things answer out loud, the ones that do not read as broken rather
        # than as quiet -- six of these shipped silent for an hour and that is
        # exactly how they felt. A missing noise is not an error anywhere, it
        # is a button that seems not to have worked.
        if tid not in notes:
            problems.append(
                f"{where} has no note('{tid}') in love.js, so it would press "
                "silently in a room where nine other things answer out loud — "
                "which reads as broken rather than as quiet.")
        if t.get("key") and f".toy--{t['key']}" not in css:
            problems.append(
                f"{where} asks for the fill {t['key']!r}, which has no .toy--{t['key']} "
                "rule in love.css.")
        # AN ENTITY IS RIGHT IN THE BLURB AND WRONG IN A PAYLOAD, and nothing
        # about the data file shows which is which. `what` is written into the
        # markup as HTML, so &mdash; there is an em dash. Everything in CARRIES
        # becomes a data- attribute that love.js writes with textContent, so
        # &ldquo; there arrives on the page as five literal characters -- which
        # is how the spoon drawer shipped its first draft, looking correct in
        # the file and like a markup leak in the room.
        for field in CARRIES:
            if field in t and ENTITY.search(json.dumps(t[field], ensure_ascii=False)):
                problems.append(
                    f"{where} has an HTML entity in {field!r}, which is a data "
                    "attribute the script writes with textContent — it would show "
                    "on the page as the entity itself. Use the character.")

        if t.get("shape") not in (None, "one", "pair"):
            problems.append(f"{where} has the shape {t['shape']!r}, which this tool "
                            "cannot draw.")
        if t.get("shape") == "pair" and len(t.get("ends", [])) != 2:
            problems.append(f"{where} is a pair and does not have two ends on it.")

    if problems:
        raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))

    # ── The tiles ────────────────────────────────────────────────────────────
    out, kept = [], []
    for t in toys:
        pair = t.get("shape") == "pair"
        tag = "div" if pair else "button"
        cls = f"toy toy--{t['key']}" + (" toy--pair" if pair else "")
        attrs = [f'class="{cls}"', f'data-toy="{t["id"]}"']
        if not pair:
            attrs.insert(0, 'type="button"')

        for field, (attr, how) in CARRIES.items():
            if field not in t:
                continue
            v = t[field]
            if how == "pipe":
                v = "|".join(v)
            elif how == "json":
                v = json.dumps(v, ensure_ascii=False)
            attrs.append(f'{attr}="{e(v)}"')

        # The two attributes another tool owns, lifted off the published page and
        # put back exactly as found. A first run has nothing to lift and says so.
        if t.get("payload"):
            was = carried(src, t["id"], t["payload"])
            if was is None:
                kept.append(f"{t['id']}:{t['payload']} was not on the page — run its own "
                            f"tool after this one")
                was = ""
            else:
                kept.append(f"{t['id']}:{t['payload']}")
            attrs.append(f'{t["payload"]}="{was}"')

        blurb = t["what"].replace("{chairy}", num_word(sayings))
        bits = [f'    <li>',
                f'      <{tag} ' + " ".join(attrs) + ">",
                f'        <strong>{t["name"]}</strong>',
                f'        <span class="toy__what">{blurb}</span>']
        if pair:
            ends = "".join(
                f'<button type="button" class="handset" data-end="{n}">{e(lab)}</button>'
                for n, lab in enumerate(t["ends"]))
            bits.append(f'        <span class="handsets">{ends}</span>')
        # THE ANSWER COMES BACK ON THE TILE YOU PRESSED. The room's live region
        # is at the top of the page and is off the screen by the time anybody is
        # pressing anything, so a toy looked broken to the person who asked for
        # it -- Ryan, 2026-09-21, and he built the room. It is aria-hidden
        # because #playhouse-says is still the one live region and announcing
        # the same sentence twice is worse than announcing it once. It ships
        # hidden, so a page with no JavaScript shows no empty box.
        bits.append('        <span class="toy__said" aria-hidden="true" hidden></span>')
        bits.append(f"      </{tag}>")
        if t.get("wears"):
            bits.append(f'      <p class="toy__idea">Wearing '
                        f'<a href="{e(t["url"])}">{t["wears"]}</a></p>')
        bits.append("    </li>")
        out.append("\n".join(bits))

    block = ('  <ul class="toys" style="flex:1 1 520px;">\n'
             + "\n".join(out) + "\n  </ul>")

    begin, end = "<!-- toys:begin -->", "<!-- toys:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {PAGE.name} has no {begin} / {end} markers, so there is nowhere\n"
            "to write. Put them back rather than letting this tool go quiet — a\n"
            "generator that writes nothing and exits 0 is how two surfaces drift apart.")
    PAGE.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda m: begin + "\n" + block + "\n  " + end,
                           src, flags=re.S))

    pairs = sum(1 for t in toys if t.get("shape") == "pair")
    ideas = sum(1 for t in toys if t.get("wears"))
    print(f"toys: {len(toys)} tiles, {len(toys) + pairs} controls, {len(toys)} fills none "
          f"alike, {ideas} wearing a named idea")
    for k in kept:
        print(f"      carried across: {k}")


ONES = ("zero one two three four five six seven eight nine ten eleven twelve "
        "thirteen fourteen fifteen sixteen seventeen eighteen nineteen").split()
TENS = ("- - twenty thirty forty fifty sixty seventy eighty ninety").split()


def num_word(n):
    """Chairy's blurb says how many things she says, and that number is a count
    of real data rather than a claim about the size of the street -- so it is
    generated out of data/chairy.json rather than typed. It was typed until
    2026-09-21 and had been right by luck since the day the sayings stopped
    being five."""
    if n < 20:
        return ONES[n]
    if n < 100:
        t, o = divmod(n, 10)
        return TENS[t] + (f"-{ONES[o]}" if o else "")
    return str(n)


if __name__ == "__main__":
    main()
