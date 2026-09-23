#!/usr/bin/env python3
"""Build foundry.html: the specimen bench, the specimen list and the room's notes.

WHAT THIS ROOM IS. A type foundry: a grey iron workshop lit through a dirty
sawtooth roof, with a bench in it where you set any text on this street in any
face on this street and pull a proof. It is the one room here whose CONTENT is
the typefaces rather than a room that happens to use one.

IT TOUCHES NO NETWORK. Everything it knows about a typeface comes out of
data/foundry-faces.json, which tools/pull-foundry.py wrote from each family's
own record in github.com/google/fonts. pull-arrivals.py and make-arrivals.py,
for pull-arrivals.py's reason, and DO NOT MERGE THEM.

────────────────────────────────────────────────────────────────────────────────
WHAT IT REFUSES, AND WHY EACH ONE IS A REAL FAILURE RATHER THAN A TIDINESS

· A FACE WITH NO RECORD, and a record with no face. This room sets other
  people's letters at size as its whole subject, which makes it the place an
  uncredited typeface would be least visible and most wrong. make-og.py refuses
  a page it has no card for; this refuses a face it has no designer for.

· A FACE WITH NO LINE SAYING WHICH ROOM SETS IT -- and a line whose claim the
  stylesheet does not support. The claim is ours and is written in
  data/foundry.json, and love.css is what decides whether it is true. A derived
  version of this got it wrong on its first run: the street letters each door in
  that room's own face, so the last section to mention a family is often §5.

· A WEIGHT OR AN ITALIC THAT RENDERS THE SAME DRAWINGS AS THE ROMAN -- which
  is NOT the same question as whether the bytes differ, and this room answered
  the wrong one for as long as it has been open. Several families here are
  variable fonts, so ONE file is declared against two or three weights, and the
  browser instances that file's own weight axis: identical bytes, different
  outlines. Grouping the variants by sha therefore threw away a bold that works
  -- measured out of one file at 64px, Cinzel's 700 lays down 68% more ink than
  its 400, Space Grotesk's 41%, Nunito's 39% -- and offered one weight where the
  street holds several. The room offers every weight love.css declares, and
  tools/check-weights.py renders the picker and refuses two that come out the
  same, which is the check the sha was standing in for. Do not put the sha back:
  it is a fact about the file and never was a fact about the drawings.

· AN INK AND PAPER PAIR UNDER 4.5:1. This is the one room on the street where a
  visitor picks the colour of the text, which is either the place contrast
  quietly stops being ours to keep or the place it becomes a thing you can watch
  being kept. Every pair prints its own measured ratio on its own control.

· A SAMPLE WHOSE TEXT IS NOT ON THE PAGE IT CLAIMS. Two of the passages are
  written out in data/foundry.json and both are checked word for word against
  the room they came from, so this page cannot end up quoting a sentence its
  neighbour has since rewritten. The other two are not stored here at all: they
  are read out of data/mopery.json and data/zibaldone.json when this runs.

· AN HTML ENTITY IN ANYTHING THAT BECOMES A data- ATTRIBUTE. data/toys.json's
  lesson: the blurb is written into the markup as HTML and an entity there is
  the character, but a payload love.js writes with textContent arrives on the
  page as five literal characters.

· A COUNT OF THE FACES. check-counts.py holds that line for the rooms; this is
  the room most likely to want to boast about how many typefaces it holds.

────────────────────────────────────────────────────────────────────────────────
THE MOPERY'S NOOK IS NEXT DOOR AND IS NOT THIS. That room sets one poem in one
face, as a nook inside a library, and its picker's list is hand-kept markup --
so adding a family to fonts/ used to falsify its claim to hold every typeface on
the street with nothing anywhere saying so. check-faces.py is the tool for that
now, and this room links to the nook rather than pretending to replace it.
"""
import hashlib
import html
import json
import re
import sys
from pathlib import Path
from string import Template

ROOT = Path(__file__).resolve().parent.parent
FACES = ROOT / "data/foundry-faces.json"
ROOM = ROOT / "data/foundry.json"
CSS = ROOT / "love.css"
OUT = ROOT / "foundry.html"

BAR = 4.5                             # WCAG AA for body text, and this room's floor
ENTITY = re.compile(r"&[a-zA-Z]+;|&#\d+;")
COUNTED = re.compile(r"\b(?:two|three|four|five|six|seven|eight|nine|ten|"
                     r"eleven|twelve|thirteen|fourteen|fifteen|twenty|thirty|"
                     r"forty|fifty|sixty|\d+)\s+(?:type)?faces?\b", re.I)

# The order the specimen list stands in. The record's own classification, so
# this room is not quietly re-sorting somebody else's typeface into a category
# we preferred. Anything the record classifies as something else stops the run.
GROUPS = ["Serif", "Sans Serif", "Display", "Handwriting", "Monospace"]

# The face the bench is standing in when you walk up to it, which is this
# room's own, and the state make-foundry.py renders into the page so that a
# reader with no JavaScript finds a proof on the bench rather than a blank
# sheet under a row of controls that do nothing.
OPENS_AT = "stardos-stencil"

fail = []


def refuse(msg):
    fail.append(msg)


def weights_of(w):
    """Every weight a record's entry stands for, as a list.

    fonts/_sources.json writes this two ways and both mean one thing. A file
    that carries a RANGE is recorded once with the range on it -- Cinzel is
    "400 700" on one file -- and a file declared separately at each weight gets
    an entry each, which is how Space Grotesk is written. The browser does not
    care which: it reads love.css, and each declaration instances that file's
    own weight axis. So a range expands rather than collapsing to its lightest
    end, which is what this returned until the bench was found offering one
    weight for families the street sets at two."""
    return [int(x) for x in str(w).split()]


def esc(s):
    return html.escape(s, quote=False)


def attr(s):
    return html.escape(s, quote=True)


# ── What love.css actually sets ──────────────────────────────────────────────
def sections_setting():
    """{family: {section numbers that set it}} read out of love.css with the
    comments stripped, so a family NAMED in a section's prose does not count as
    a family that section sets. §1 is the @font-face block and is skipped: it
    declares every face and sets none of them."""
    css = CSS.read_text()
    code, i = [], 0
    while True:
        j = css.find("/*", i)
        if j < 0:
            code.append(css[i:])
            break
        k = css.find("*/", j) + 2
        code.append(css[i:j])
        code.append(" " * (k - j))      # keep offsets, so section lookup still lines up
        i = k
    code = "".join(code)

    marks = [(m.start(), int(m.group(1)))
             for m in re.finditer(r"/\* §(\d+) ── ", css)]

    def section_at(pos):
        cur = None
        for start, n in marks:
            if start <= pos:
                cur = n
            else:
                break
        return cur

    # ANY quoted string outside §1, not just one after `font-family:`. The first
    # draft asked for the property by name and reported Space Grotesk as a face
    # nothing on the street uses -- it is set once, on --sans in §2, and every
    # room reaches it through that variable. A checker that cries wolf about the
    # body face of the whole site is a checker nobody runs twice.
    out = {}
    for m in re.finditer(r"'([^'\n]+)'", code):
        n = section_at(m.start())
        if n in (None, 1):
            continue
        out.setdefault(m.group(1), set()).add(n)
    return out


# ── The samples ──────────────────────────────────────────────────────────────
def pull(sample):
    """Where a sample lives in another room's data file, read it from there.
    One copy on the street, so the two rooms cannot come to disagree."""
    tag = sample["pull"]
    if tag == "mopery-raven-1":
        raven = json.loads((ROOT / "data/mopery.json").read_text())["raven"]
        lines = [l["t"] for l in raven["stanzas"][0]]
        return "\n".join(lines), None
    if tag.startswith("zibaldone:"):
        slug = tag.split(":", 1)[1]
        zib = json.loads((ROOT / "data/zibaldone.json").read_text())
        for e in zib["entries"]:
            if e["slug"] == slug:
                slip = f'{e["who"]}, {e["work"]}'
                if e.get("translator"):
                    slip += f', translated by {e["translator"]}'
                return e["quote"], slip
        refuse(f"sample {sample['id']}: data/zibaldone.json has no entry {slug!r}")
        return "", None
    refuse(f"sample {sample['id']}: no way to pull {tag!r}")
    return "", None


def samples(room):
    out = []
    for s in room["samples"]:
        slip = None
        if s.get("pull"):
            text, slip = pull(s)
        else:
            text = s["text"]
            if s.get("verbatim"):
                page = (ROOT / s["page"]).read_text()
                flat = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", page)))
                if re.sub(r"\s+", " ", text) not in flat:
                    refuse(f"sample {s['id']}: this text is not on {s['page']} any more.\n"
                           f"    It is published there and copied here, and the copy has "
                           f"to match or one of the two rooms is misquoting the other.")
        if ENTITY.search(text):
            refuse(f"sample {s['id']}: an HTML entity in text that becomes a data- "
                   f"attribute. love.js writes those with textContent, so it will "
                   f"arrive on the page as literal characters. Write the character.")
        out.append(dict(s, text=text, slip=slip))
    return out


# ── The faces ────────────────────────────────────────────────────────────────
def build_faces(faces, room, sets):
    """One entry per family, with only the variants that are really different."""
    out = []
    for slug in sorted(faces, key=lambda s: faces[s]["family"].lower()):
        rec, line = faces[slug], room["faces"].get(slug)
        if not line:
            refuse(f"{rec['family']}: no line in data/foundry.json saying which room "
                   f"sets it. Every face in fonts/ is somebody's and lives somewhere.")
            continue
        if rec["category"] not in GROUPS:
            refuse(f"{rec['family']}: its record classifies it as {rec['category']!r}, "
                   f"which this room has no shelf for. Add the shelf; do not "
                   f"re-file somebody else's typeface under one we preferred.")
        claimed = set(line["sections"])
        actual = sets.get(rec["family"], set())
        if not actual:
            refuse(f"{rec['family']}: love.css declares it and no section sets it. "
                   f"A face nothing on the street uses is weight in fonts/ rather "
                   f"than a face on the street.")
        elif not claimed & actual:
            refuse(f"{rec['family']}: data/foundry.json says it belongs to "
                   f"§{', §'.join(map(str, sorted(claimed)))} and love.css sets it in "
                   f"§{', §'.join(map(str, sorted(actual)))}.")

        # Every weight and style the record carries, expanded. This used to
        # group by sha and keep the lightest of each group, on the reasoning
        # that a second name for one file is not a second weight -- true about
        # the file, false about the letters, because a variable font's axis is
        # instanced per declaration. check-weights.py measures the outcome.
        real, seen = [], set()
        for v in rec["variants"]:
            for w in weights_of(v["weight"]):
                if (w, v["style"]) in seen:
                    continue
                seen.add((w, v["style"]))
                real.append({"weight": w, "style": v["style"], "file": v["file"]})
        real.sort(key=lambda v: (v["style"] == "italic", v["weight"]))
        romans = [v for v in real if v["style"] == "normal"]
        italics = [v for v in real if v["style"] == "italic"]
        if not romans:
            refuse(f"{rec['family']}: no upright file, so the bench has nothing to "
                   f"open it in.")
            continue
        out.append({
            "slug": slug, "family": rec["family"], "category": rec["category"],
            "designer": rec["designer"], "licence": rec["licence"],
            "licence_url": rec["licence_url"], "repository": rec["repository"],
            "where": line["where"], "page": line["page"],
            "weights": [str(v["weight"]) for v in romans],
            "italic": str(italics[0]["weight"]) if italics else None,
            # more offerings than files means one file is carrying several of
            # them on its own axis, which is what the shelf note says out loud
            "files": len({v["file"] for v in real}),
            "offers": len(real),
        })
    return out


# ── The page ─────────────────────────────────────────────────────────────────
def face_options(built):
    rows = []
    for g in GROUPS:
        inside = [f for f in built if f["category"] == g]
        if not inside:
            continue
        rows.append(f'          <optgroup label="{attr(g)}">')
        for f in inside:
            sel = " selected" if f["slug"] == OPENS_AT else ""
            rows.append(
                f'            <option value="{attr(f["slug"])}"'
                f' data-family="{attr(f["family"])}"'
                f' data-weights="{attr(",".join(f["weights"]))}"'
                f' data-italic="{attr(f["italic"] or "")}"'
                f' data-designer="{attr(f["designer"])}"'
                f' data-licence="{attr(f["licence"])}"'
                f'{sel}>{esc(f["family"])} &mdash; {esc(f["designer"])}</option>')
        rows.append("          </optgroup>")
    return "\n".join(rows)


def sample_options(sams):
    rows = []
    for s in sams:
        rows.append(
            f'            <option value="{attr(s["id"])}"'
            f' data-text="{attr(s["text"])}">{esc(s["label"])}</option>')
    return "\n".join(rows)


def ink_controls(inks):
    rows = []
    for i, ink in enumerate(inks):
        rows.append(f"""          <label class="fo-ink">
            <input type="radio" name="fo-ink" value="{attr(ink["id"])}"
                   data-ink="{attr(ink["ink"])}" data-paper="{attr(ink["paper"])}"{" checked" if i == 0 else ""}>
            <span class="fo-ink__chip" aria-hidden="true" style="background:{attr(ink["paper"])};color:{attr(ink["ink"])};">Aa</span>
            <span class="fo-ink__name">{esc(ink["label"])}</span>
            <span class="fo-ink__ratio">{ink["ratio"]:.2f}:1</span>
          </label>""")
    return "\n".join(rows)


def slider(cid, label, spec, hint):
    return f"""          <div class="fo-knob">
            <label for="{cid}">{esc(label)}</label>
            <input type="range" id="{cid}" min="{spec['min']}" max="{spec['max']}"
                   step="{spec['step']}" value="{spec['default']}">
            <output for="{cid}" id="{cid}-out">{spec['default']}{esc(spec['unit'])}</output>
            <p class="fo-knob__fine">{esc(hint)}</p>
          </div>"""


def specimen_list(built):
    out = []
    for g in GROUPS:
        inside = [f for f in built if f["category"] == g]
        if not inside:
            continue
        out.append(f'      <h3 class="fo-shelf">{esc(g)}</h3>')
        out.append('      <ul class="fo-sorts">')
        for f in inside:
            where = esc(f["where"])
            if f["page"]:
                where = f'<a href="{attr(f["page"])}">{where}</a>'
            extra = ""
            if f["offers"] > f["files"]:
                extra = ('<span class="fo-sort__vf">one file, declared against more '
                         'than one weight</span>')
            out.append(f"""        <li class="fo-sort">
          <p class="fo-sort__show" style="font-family:'{attr(f["family"])}';" lang="en">{esc(f["family"])}</p>
          <p class="fo-sort__who">{esc(f["designer"])}</p>
          <p class="fo-sort__meta"><a href="{attr(f["licence_url"])}">{esc(f["licence"])}</a> &middot; sets {where}{extra}</p>
        </li>""")
        out.append("      </ul>")
    return "\n".join(out)


def main():
    faces = json.loads(FACES.read_text())["faces"]
    room = json.loads(ROOM.read_text())
    sets = sections_setting()

    for ink in room["inks"]:
        if ink["ratio"] < BAR:
            refuse(f"ink {ink['id']}: {ink['ratio']:.2f}:1 is under {BAR}:1. This is the "
                   f"one room where the visitor picks the colour of the text, which "
                   f"makes it the one room where an unreadable pair would be OUR doing "
                   f"and theirs at once. Change the colour, not this line.")

    sams = samples(room)
    built = build_faces(faces, room, sets)

    if fail:
        print("REFUSING:\n  " + "\n  ".join(fail), file=sys.stderr)
        return 1

    opening = next((f for f in built if f["slug"] == OPENS_AT), None)
    if not opening:
        refuse(f"the bench opens at {OPENS_AT!r} and there is no such face.")
        print("REFUSING:\n  " + "\n  ".join(fail), file=sys.stderr)
        return 1
    first = sams[0]

    # THE JOB MARKER IS CARRIED ACROSS A REBUILD. This room is generated whole
    # from a template rather than swapped into a hand-written page, which makes
    # it the one room where re-running its own tool could quietly delete the
    # quest the guild posted into it -- and the guild's board would go on
    # offering a job whose marker no longer exists. So the block between the
    # markers is lifted out of the published page and put back. If it is not
    # there yet, an empty pair of markers goes in for tools/make-guild.py to
    # find, which is the shape swap() refuses to render into when it is missing.
    posted = [q["id"] for q in json.loads((ROOT / "data/quests.json").read_text())["quests"]
              if q["page"] == OUT.name]
    if not posted:
        refuse("the guild has no job posted in this room. Every room on this street "
               "carries a marker, so a new one refuses to ship without one.")
        print("REFUSING:\n  " + "\n  ".join(fail), file=sys.stderr)
        return 1
    quest = ""
    if OUT.exists():
        m = re.search(r"<!-- quest:[a-z-]+:begin -->.*?<!-- quest:[a-z-]+:end -->",
                      OUT.read_text(), re.S)
        if m:
            quest = "  " + m.group(0) + "\n"
    if not quest:
        # An empty pair for make-guild.py to write into. It refuses a page with no
        # markers rather than going quiet, which is the right way round: a
        # generator that writes nothing and exits 0 is how two surfaces drift.
        quest = (f"  <!-- quest:{posted[0]}:begin -->\n"
                 f"  <!-- quest:{posted[0]}:end -->\n")

    page = TEMPLATE.substitute(
        quest=quest,
        prepaint=prepaint(),
        faces=face_options(built),
        weights="".join(
            f'<option value="{w}">{w}'
            f'{" &mdash; the only weight this site holds" if len(opening["weights"]) == 1 else ""}'
            f'</option>' for w in opening["weights"]),
        prooftext=esc(first["text"]),
        proofstyle=(f"font-family:'{opening['family']}',serif;"
                    f"font-weight:{opening['weights'][0]};"
                    f"font-size:{room['room']['sizes']['default']}px;"
                    f"line-height:{room['room']['leading']['default']};"
                    f"max-width:{room['room']['measure']['default']}ch"),
        colophon=esc(f"{opening['family']} \u00b7 drawn by {opening['designer']} \u00b7 "
                     f"{opening['licence']} \u2014 set at "
                     f"{room['room']['sizes']['default']}px, "
                     f"{room['room']['leading']['default']}, "
                     f"{room['room']['tracking']['default']}em, "
                     f"{room['room']['measure']['default']}ch. "
                     f"Self-hosted from stimpunks.love; the typeface is not ours."),
        samples=sample_options(sams),
        inks=ink_controls(room["inks"]),
        size=slider("fo-size", "Size", room["room"]["sizes"],
                    "A foundry sold type by the size it was cast at. This one is "
                    "pixels, and it is the only setting here that changes what you "
                    "can read rather than how it looks."),
        leading=slider("fo-leading", "Leading", room["room"]["leading"],
                       "The strips of lead a compositor slid between the lines. "
                       "Multiples of the size, so it stays right when you change it."),
        tracking=slider("fo-tracking", "Tracking", room["room"]["tracking"],
                        "Space added to every letter at once. Metal type could only "
                        "ever have more; this can have a little less."),
        measure=slider("fo-measure", "Measure", room["room"]["measure"],
                       "How wide the column is, in characters. The oldest setting "
                       "here and the one that does most of the work."),
        samples_notes="\n".join(
            f'        <li><b>{esc(s["label"])}</b>{"" if not s.get("room") else " &mdash; " + esc(s["room"])}. '
            f'{esc(s["note"])}'
            f'{"" if not s.get("slip") else " <i>" + esc(s["slip"]) + "</i>."}</li>'
            for s in sams),
        specimens=specimen_list(built),
    )

    for m in COUNTED.finditer(re.sub(r"<[^>]+>", " ", page)):
        refuse(f"the page says {m.group(0)!r}. Nothing on this street states a total "
               f"of anything that grows, and this is the room that most wants to.")
    if fail:
        print("REFUSING:\n  " + "\n  ".join(fail), file=sys.stderr)
        return 1

    OUT.write_text(page)
    print(f"foundry: {len(built)} faces on the shelves, {len(sams)} passages, "
          f"{len(room['inks'])} inks, written to {OUT.name}")
    return 0


def prepaint():
    """The dial's pre-paint snippet, READ OFF THE FRONT PAGE rather than kept here.

    This file used to hold its own copy, and a copy is a second place the snippet
    has to be fixed. When the snippet's storage fallback was corrected on
    2026-09-23 every page got the new one and this template still had the old
    one, so the next run would have put it back on the Foundry -- and make-csp.py
    would have refused two snippets, which is the loud outcome, but only if
    somebody ran it before deploying. Reading it removes the second copy.
    """
    m = re.search(r"<script>[^<]*</script>", (ROOT / "index.html").read_text())
    if not m or "data-intensity" not in m.group(0):
        raise SystemExit("REFUSING: index.html has no pre-paint snippet to copy. Every page "
                         "runs the same one; fix the front page, do not type one in here.")
    return m.group(0)


TEMPLATE = Template(r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Foundry &mdash; Stimpunks.Love</title>
<meta name="description" content="A type foundry on the street: a grey iron workshop where you can set your own words, or words out of The Playhouse, The Mopery and The Zibaldone, in any typeface this site holds. Size, leading, tracking, measure, weight, a real italic or a machine slant, four measured inks, and a proof you can print with the designer's name on it.">
<link rel="canonical" href="https://stimpunks.love/foundry.html">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#3F4548">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Stimpunks.Love">
<meta property="og:title" content="The Foundry &mdash; Stimpunks.Love">
<meta property="og:description" content="A grey iron workshop under a dirty roof. Set any words on this street in any face on this street, pull a proof, and print it with the designer's name on it.">
<meta property="og:url" content="https://stimpunks.love/foundry.html">
<meta property="og:image" content="https://stimpunks.love/og/foundry.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<!-- og:image:alt is make-og.py's line: it builds the card and writes the alt to
     match it. This copy is here only so a freshly generated page is never without
     one, and it is kept in step by hand -- a stale copy here silently reverts a
     correct alt every time this tool runs, which is how it drifted before. -->
<meta property="og:image:alt" content="An iron-grey card lit flatly from above, as if through a dirty workshop roof. On the left, a drawing of a compositor’s galley holding three pieces of metal type standing on their feet, each with a nick cut across the shank and its letter mirrored the way cast type is, with one proof sheet lying under them. On the right, small brass capitals reading cast, proofed, and credited, then “The Foundry” in a heavy stencil face in bone, the strokes bridged where a stencil holds itself together. Under it in brass: Every typeface on this street, and the name of whoever drew it. Then, smaller: A grey iron workshop under a dirty roof. Set any words on this street in any face on this street, pull a proof, and print it with the designer&#x27;s name on it. Along the foot, in grey capitals: nothing here is counted, stimpunks.love.">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<link rel="alternate" href="/feed.xml" type="application/rss+xml" title="Stimpunks.Love &mdash; what changed on the street">
<link rel="preload" href="fonts/stardos-stencil-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="love.css">
<!-- The dial's default, applied BEFORE first paint. Deferred to love.js it would
     flash the loud version at somebody whose device asked for the quiet one. A
     stored choice wins over the media query, including a choice to turn it UP. -->
$prepaint
</head>
<body class="room-foundry">
<a class="skip" href="#main">Skip to the bench</a>

<!-- THE NORTH LIGHT, AND IT IS NOT THE DIAL'S. Workshops were built with the
     glazing facing away from the sun so the work would have no glare on it:
     flat, cool, directionless daylight falling straight down. It is where the
     light in this room comes from rather than an effect applied to it, so like
     the Healing Checkpoint's pool it is on at every setting. It carries no text
     and it does not move. -->
<div class="fo-light" aria-hidden="true"></div>

<!-- The dust standing in that light, which IS decoration and is therefore
     `.glow`: §3 switches it off at Gentle for every room on the street. It
     drifts. It does not flash, blink or pulse -- Club Chronic's rule. -->
<div class="glow" aria-hidden="true"></div>

<main id="main" class="fo-shop">

  <div class="fo-topline">
    <a class="backlink" href="index.html">&larr; back to the street</a>
    <p class="fo-topline__note">a shopfront on the street &middot; open, and noisy</p>
  </div>

  <header class="fo-plate">
    <!-- OURS. A compositor's galley seen from slightly above: three sorts
         standing on their feet with the nick cut across the shank, and a pulled
         proof lying under them. Drawn in the room's own inks by name, so it
         cannot drift from the palette around it, and flat -- nothing in this
         room has a lit face, because the light is overhead and diffuse. -->
    <svg class="fo-galley" viewBox="0 0 120 92" role="img" aria-labelledby="fo-galley-t">
      <title id="fo-galley-t">A compositor&rsquo;s galley: three pieces of metal type standing on their feet with a nick cut across each shank, their letters mirrored and reading right to left the way cast type does, and a pulled proof sheet lying under them.</title>
      <rect x="6" y="58" width="108" height="28" fill="var(--fo-paper)"/>
      <path d="M14 66 H70 M14 72 H96 M14 78 H58" stroke="var(--fo-ink)" stroke-width="2.4" stroke-linecap="round"/>
      <g fill="var(--fo-lead)" stroke="var(--fo-bench)" stroke-width="2">
        <rect x="14" y="10" width="26" height="50"/>
        <rect x="47" y="16" width="26" height="44"/>
        <rect x="80" y="6" width="26" height="54"/>
      </g>
      <path d="M14 46 H40 M47 46 H73 M80 46 H106" stroke="var(--fo-bench)" stroke-width="3.4"/>
      <!-- THE LETTERS ARE MIRRORED AND READ RIGHT TO LEFT, because that is what
           a line standing in a galley actually looks like: type is cut in
           reverse so that it prints the right way round, and a compositor
           reads it backwards all day. Drawing it the readable way round would
           have been the nicer picture and the wrong object. The mirror is a
           transform INSIDE an <svg>, which is part of the drawing rather than
           decoration applied to the page -- check-gentle.py's own narrow
           carve-out, and the same one the otter's angled poses use. -->
      <g fill="var(--fo-bone)" transform="translate(120,0) scale(-1,1)">
        <path d="M21 20 h12 v5 h-4 v14 h-4 v-14 h-4 Z"/>
        <path d="M54 26 h5 v13 h6 v5 h-11 Z"/>
        <path d="M87 16 h11 v5 h-6 v4 h5 v5 h-5 v9 h-5 Z"/>
      </g>
    </svg>
    <div class="fo-plate__words">
      <p class="fo-plate__eyebrow">Cast, proofed, and credited</p>
      <h1>The Foundry</h1>
      <p class="fo-plate__line">Every typeface on this street, and the name of whoever drew it.</p>
    </div>
  </header>

  <section class="fo-lede">
    <p><b>This is a workshop rather than a shop.</b> It is grey because iron is grey, it is lit through a dirty roof because that is how a workshop was lit before anybody could afford to light one properly, and there is nowhere in it to sit down. Every other room on this street uses a typeface. This is the room where the typefaces are the thing in the window.</p>
    <p>Put your own words on the bench, or take a passage out of <a href="playhouse.html">The Playhouse</a>, <a href="the-mopery.html">The Mopery</a> or <a href="zibaldone.html">The Zibaldone</a>, and set it in anything the street owns. Change the size, the leading, the tracking and the measure. Take a weight, a real italic, or the machine slant that is not one. Then pull a proof and print it, with the name of the person who drew the letters on the bottom of the page.</p>
  </section>

  <!-- ── THE BENCH ─────────────────────────────────────────────────────────
       No <form> and no action: nothing here is submitted anywhere, there is
       nothing to submit it to, and every control changes the proof in place.
       The Zibaldone's slip made the same call for the same reason. -->
  <section class="fo-bench" aria-labelledby="fo-bench-h">
    <h2 id="fo-bench-h">The bench</h2>
    <noscript><p class="fo-off">The bench needs JavaScript and yours is off, so these controls will not move the proof. <b>The cases at the foot of this page do not need it</b> &mdash; every face this site holds is down there, set in itself, with the person who drew it, the licence it travels under and the room that sets it. The proof below is standing in the face and at the size the bench opens at.</p></noscript>

    <div class="fo-set fo-set--copy">
      <div class="fo-pick">
        <label for="fo-sample">What to set</label>
        <select id="fo-sample">
${samples}
          <option value="own">Your own words</option>
        </select>
      </div>
      <div class="fo-pick fo-pick--own">
        <label for="fo-own">Your own words</label>
        <textarea id="fo-own" rows="3" spellcheck="true" placeholder="Type anything. It stays in this page."></textarea>
        <p class="fo-pick__fine">Typing here moves the picker above to <i>your own words</i>. Nothing you type is stored, sent or remembered, and reloading the page empties it.</p>
      </div>
    </div>

    <div class="fo-set fo-set--face">
      <div class="fo-pick">
        <label for="fo-face">The face</label>
        <select id="fo-face">
${faces}
        </select>
        <p class="fo-pick__fine">Grouped the way each family&rsquo;s own record groups it, not the way we would have. Choosing one is what downloads it: nothing here is fetched until you ask for it.</p>
      </div>
      <div class="fo-pick">
        <label for="fo-weight">Weight</label>
        <select id="fo-weight">${weights}</select>
        <p class="fo-pick__fine">Every weight this street declares for this face. Several of these families are one file with a weight axis inside it, declared against two or three weights &mdash; the same bytes, genuinely different drawings &mdash; and this picker used to drop those, because it asked whether the bytes differed instead of whether the letters did. A weight that came out the same drawings as the regular would be a control that does nothing, so the offered weights are rendered and measured rather than assumed.</p>
      </div>
      <div class="fo-pick">
        <label for="fo-slant">Upright, italic or slanted</label>
        <select id="fo-slant">
          <option value="normal" selected>Roman &mdash; upright, as drawn</option>
          <option value="italic">Italic &mdash; a different set of drawings</option>
          <option value="oblique">Machine slant &mdash; the roman pushed over</option>
        </select>
        <p class="fo-pick__fine" id="fo-slant-fine">An italic is not a leaning roman: it is a second alphabet, drawn separately, often with different letters in it altogether. Where this site holds no italic file the option says so and the machine slant is what is left &mdash; which is honest, and is what a phototypesetter did.</p>
      </div>
      <div class="fo-pick">
        <label for="fo-case">Case</label>
        <select id="fo-case">
          <option value="none" selected>As typed</option>
          <option value="uppercase">Capitals</option>
          <option value="lowercase">Lower case</option>
        </select>
      </div>
    </div>

    <div class="fo-set fo-set--knobs">
${size}
${leading}
${tracking}
${measure}
    </div>

    <fieldset class="fo-set fo-set--inks">
      <legend>Ink and paper</legend>
      <p class="fo-inks__fine">Four pairs, and the measured contrast ratio of each one is printed on it. There is no colour picker in here: this is the one room on the street where somebody else chooses the colour of the text, which makes it the one room where an unreadable pair would be ours and theirs at once. Everything offered clears the bar for body text at any size.</p>
${inks}
    </fieldset>

    <div class="fo-set fo-set--do">
      <button type="button" class="fo-print" id="fo-print">Print this proof</button>
      <button type="button" class="fo-reset" id="fo-reset">Put the bench back</button>
      <p class="fo-do__fine">Printing sends the proof and nothing else &mdash; not this bench, not the street, not the shelves below. It comes out black on white whatever is on the screen, because paper colour is a screen decision and a printer would spend your toner on it, and it carries a colophon saying what it is set in and who drew that.</p>
    </div>

    <p class="fo-said" id="fo-said" role="status" aria-live="polite"></p>
  </section>

  <!-- The proof. It is what prints; everything else on the page is @media print
       hidden. lang is left alone on purpose: setting somebody's own words to a
       language we guessed would be a worse lie than saying nothing. -->
  <section class="fo-pulled" aria-labelledby="fo-pulled-h">
    <h2 id="fo-pulled-h" class="fo-pulled__h">The proof</h2>
    <div class="fo-proof" id="fo-proof"><p id="fo-proof-text" style="${proofstyle}">${prooftext}</p></div>
    <p class="fo-colophon" id="fo-colophon">${colophon}</p>
  </section>

  <section class="fo-notes">
    <h2>What is on the bench, and where it came from</h2>
    <p>Four passages and a proof of the characters. Every one of them is either ours and already published on this street, or out of copyright and already checked in another room&rsquo;s data file &mdash; and the two that are written out in this room&rsquo;s own data are <b>checked word for word against the page they came from</b> every time this room is built, so it cannot end up quoting a neighbour that has since been rewritten. The other two are not stored here at all; they are read out of <a href="the-mopery.html">The Mopery</a>&rsquo;s and <a href="zibaldone.html">The Zibaldone</a>&rsquo;s own files when the page is made.</p>
    <ul class="fo-from">
${samples_notes}
    </ul>
    <p>A specimen room needs something to set, and the friendly edit that will arrive here is somebody quietly adding a paragraph of a book because the bench looked bare. That is <a href="the-feed.html">The Feed</a>&rsquo;s refused summary field wearing a type sample. The bench is for your words; ours are here so it is not empty when you arrive.</p>

    <h2>Why this room is set in a stencil</h2>
    <p>Every other world on this street chose a display face for how it sounds. This one chose one for what it <i>is</i>. A stencil letter is <b>a hole rather than a mark</b> &mdash; a shape cut out of a sheet of metal so that it can be used again and again and come out the same every time &mdash; which is the whole idea of type, arriving about four hundred years early and in the wrong material. It is also what actually gets painted on a workshop&rsquo;s crates and machinery, which is the other reason it is over the door.</p>
    <p>The bridges you can see holding the middle of an <b>o</b> in place are not a decorative flourish. Without them the counter &mdash; the enclosed space inside a letter &mdash; would fall out of the sheet, and there is no way round that in a stencil. Nobody drawing type in metal or on a screen has that problem, which is why nothing else here looks like this.</p>

    <h2>Why nothing here describes a typeface</h2>
    <p>There is no sentence beside any face saying what it looks like, what it is good for or what century it is pretending to be from, and that is a refusal rather than an omission. Writing a line of appreciation for every family on this street would mean inventing type history at scale, in the one format most likely to be believed &mdash; which is the same reason <a href="solarpunk-hermitage.html">the herbarium two rooms over</a> refuses to name a pressed plant to species. What this room can say truthfully is <b>who drew it</b>, <b>what licence it travels under</b> and <b>which room here sets it</b>, and all three are read off records rather than remembered. The specimen is the description.</p>

    <h2>An italic is not a slant</h2>
    <p>A real italic is a second alphabet. It was cut separately, it has different letters in it &mdash; look at a single-storey <i>a</i>, or at the way an <i>f</i> descends &mdash; and it was never made by leaning the roman over. A machine slant is exactly that leaning: the upright letters pushed sideways by a machine that has no idea what they are. Both are offered here and both are labelled, because the difference is the kind of thing this room exists to show you rather than to tell you.</p>
    <p>Where this site holds no italic file, the italic option says so and stops being offered. An italic control on a family with no italic is not an error anywhere: the browser answers by inventing one, nothing looks broken, and the room has quietly told you a lie about somebody&rsquo;s typeface. And <b>the slant is a font setting and never a transform</b> &mdash; <code>check-gentle.py</code> reads rotation and skew out of the computed matrix and cannot be asked to take this room&rsquo;s word for the difference between a tilted page and a slanted letter.</p>

    <h2>Every face here is self-hosted, and none of it is ours</h2>
    <p>Reading any page on this street makes no request to anybody&rsquo;s font service. The files are in this repository, subsetted to Latin, and a face is downloaded only when something actually sets it &mdash; which in this room means <b>when you pick it</b>. Nobody who never opens the picker pays for a single one.</p>
    <p>None of these typefaces belongs to Stimpunks. Every one of them is somebody&rsquo;s work, released under a licence that asks to be named, and the name beside each face here is <b>verbatim from that family&rsquo;s own record</b> rather than typed from memory &mdash; including where the record credits a studio rather than a person, and including where it disagrees with the fuller credit in our <a href="liner-notes.html">liner notes</a>. Most are under the SIL Open Font License; a few are under the Apache License 2.0, and the shelves below say which is which face by face, because &ldquo;they are all OFL&rdquo; is the sort of thing a site says once and stops checking.</p>

    <h2>Nothing here is counted</h2>
    <p>Not the faces, not the proofs pulled, not the sizes tried. This is the room on the street most likely to want to boast about how much type it holds, and a number in the window would be out of date the next time somebody adds a face and wrong in a way nobody would notice. There is also no favourite, no most popular and no ranking of one designer&rsquo;s work against another&rsquo;s.</p>

    <h2>The nook next door is not this room</h2>
    <p><a href="the-mopery.html">The Mopery</a> has a reading nook where <i>The Raven</i> can be set in any face on the street, and it stays exactly as it is. That is one poem in one face inside a library, where borrowing all of them is the joke. This is a bench where any words go into any face at any size in any ink and come out on paper. The two rooms have one list between them and <code>tools/check-faces.py</code> now makes sure of it &mdash; before that tool existed, adding a typeface to this site quietly made the library&rsquo;s claim to hold every one of them false, with nothing anywhere saying so.</p>
  </section>

  <div class="fo-desk">
    <div class="fo-desk__half">
      <h2>Who made these letters</h2>
      <p class="fo-note">Everybody named on the shelves below, and nobody here. The family name, the designer, the licence and the classification of every face on this street are read out of that family&rsquo;s own record in <a href="https://github.com/google/fonts">github.com/google/fonts</a> by <code>tools/pull-foundry.py</code> and are not typed by us. This room itself sets <b>Stardos Stencil</b> and <b>Work Sans</b>, both under the SIL Open Font License, credited with everything else in the <a href="liner-notes.html">liner notes</a>.</p>
      <p class="fo-note"><a href="index.html">The street</a> &middot; <a href="the-mopery.html">The Mopery</a> &middot; <a href="liner-notes.html">Liner notes</a> &middot; <a href="changelog.html">Changelog</a> &middot; A <a href="https://stimpunks.org/">Stimpunks Foundation</a> street.</p>
    </div>
    <div class="fo-desk__half">
      <div class="dial">
        <p class="dial__label" id="dial-label">HOW LOUD DO YOU WANT IT?</p>
        <div class="dial__row" role="group" aria-labelledby="dial-label">
          <button type="button" class="dial__btn" data-level="gentle"  aria-pressed="false">Gentle</button>
          <button type="button" class="dial__btn" data-level="regular" aria-pressed="false">Regular</button>
          <button type="button" class="dial__btn" data-level="max"     aria-pressed="false">MAX GLITTER</button>
        </div>
        <p class="dial__note" aria-live="polite"></p>
        <p class="dial__fine">Starts wherever your device says. In here it moves the dust in the light and nothing else &mdash; the daylight through the roof is on at every setting, because it is the room rather than an effect. Nothing in this room flashes at any setting, and the bench does exactly the same thing at all three.</p>
      </div>
    </div>
  </div>

  <section class="fo-cases" aria-labelledby="fo-cases-h">
    <h2 id="fo-cases-h">The cases</h2>
    <p class="fo-cases__fine">Every face this site holds, on the shelf it is filed under in its own record, set in itself, with the person or studio who drew it, the licence it travels under, and the room on this street that sets it.</p>
${specimens}
  </section>

${quest}
</main>

<script src="love.js" defer></script>
<script src="foundry.js" defer></script>
<script src="quest.js" defer></script>
</body>
</html>
""")

if __name__ == "__main__":
    sys.exit(main())
