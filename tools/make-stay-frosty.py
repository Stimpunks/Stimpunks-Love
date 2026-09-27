#!/usr/bin/env python3
"""Write Stay Frosty's temperature everywhere it is stated, and hold the room to its rules.

Stay Frosty is level B5 of Arlesglad Caverns: the bottom, and the one room down
there whose temperature never moves. The number is the National Park Service's
measurement of Carlsbad Cavern's lowest point, and it lives ONCE, in
data/stay-frosty.json. This tool writes it into every marker pair that states
it -- the room's thermometer and sentences, the room's plate on the caverns'
lift panel, and Ryan's own sentence in Stay Breezy, the room behind this one -- because a number said in two rooms and typed in both will one day
disagree with itself, and nothing else would notice. That is the sentence-in-
another-room problem with a thermometer in it.

WHAT IT REFUSES:

  · A TEMPERATURE THAT DOES NOT CONVERT. The Celsius figure is stored beside the
    Fahrenheit one because the Park Service prints both, and a pair that does not
    agree with arithmetic is a typo in one of them.
  · ANY OTHER TEMPERATURE IN THE ROOM. Outside the markers, stay-frosty.html may
    not state a degree at all. A second number in a room whose one claim is that
    the number never changes is the room contradicting itself.
  · A BUTTON, A PLAYER, A FRAME, A SCRIPT OF ITS OWN. "There is nothing to press"
    and "nothing in the room makes a sound" are sentences on the page. The guild's
    marker is the one exception and is cut out before looking, because its
    hand-in box is the guild's and not the room's.
  · MOTION IN ITS SECTION OF love.css. No animation, no transition, no keyframes,
    no transform: "nothing moves, at any setting" is on the page, and the one way
    to keep a sentence like that true is to refuse the property rather than trust
    the dial to reset it.
  · THE RADIO. The room's <body> carries data-cb="off", the Healing Checkpoint's
    mechanism, because a radio that squelches when a station keys up is a sound
    in a room that says it has none.
  · A PURPOSE. The vocabulary of rest as an investment -- the checkpoint's list,
    taken over as it is -- and the vocabulary of cold as a treatment, which is
    the version of that mistake this room would make: cold plunges, ice baths,
    cryotherapy, biohacking, resets, boosts. And the vocabulary of medical claims.
    Swept over the room's own words with the checkpoint's negation window, so the
    room can still say what it is not.
  · A TALLY OR A CLOCK. The checkpoint's tally list, plus a timer and a
    countdown: a room whose promise is that nothing changes cannot count
    anything down.

IT NEEDS NOTHING BUT THE FILES, so it is in the pre-deploy sequence.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/stay-frosty.json"
ROOM = ROOT / "stay-frosty.html"
CAVERNS = ROOT / "arlesglad-caverns.html"
BREEZY = ROOT / "stay-breezy.html"
CSS = ROOT / "love.css"
SECTION = "Stay Frosty"

data = json.loads(DATA.read_text())
t = data["temperature"]
problems = []

if round((t["f"] - 32) * 5 / 9) != t["c"]:
    problems.append(f"data/stay-frosty.json says {t['f']}F and {t['c']}C, and those are not the same "
                    "temperature. Read both off the source again.")
for key in ("where", "measured_by", "source", "read", "says"):
    if not t.get(key):
        problems.append(f"data/stay-frosty.json's temperature has no {key}. A number with no source "
                        "is the fabrication this site argues against, in the format most likely "
                        "to be believed.")
if str(t["f"]) not in t.get("says", ""):
    problems.append("the quoted line from the source does not contain the number it is quoted for.")

# ── The vocabularies, the checkpoint's taken over rather than rewritten ─────
INSTRUMENTAL = (r"earn(?:s|ed|ing)?|deserv(?:e|es|ed|ing)|recharg(?:e|es|ed|ing)|"
                r"productivity|productive|bounce back|back to work|"
                r"so (?:you|we|they) can|in order to|optimi[sz]|"
                r"work(?:ing)? better|perform better|refuel|fuel up|earn(?:ed)? (?:it|rest)")
# COLD AS A TREATMENT. The mistake this room is shaped to make: a cool, quiet
# room on the internet is always selling what the cold will do for you.
COLD = (r"cold plunges?|plunge|ice baths?|cryo\w*|biohack\w*|reset(?:s|ting)?|"
        r"boost\w*|invigorat\w*|metaboli\w*|brown fat|inflammation|"
        r"heal(?:s|ing|ed)?|cures?|cured|treatments?|therap\w*|symptoms?|"
        r"calm(?:s|ing)? (?:your|the) nervous system|regulat(?:e|es|ing) your")
TALLY = (r"scores?|scored|scoring|\d+\s*points?|points?\s+(?:for|per|each|awarded|"
         r"earned|available)|streaks?|leaderboards?|high[- ]score|xp\b|levels? up|"
         r"badges?|achievements?|tall(?:y|ies)|tallied|progress bar|completion rate|"
         r"timers?|countdowns?|visits? (?:today|this week)|minutes? (?:spent|left)")
NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|declin\w+)")


def sweep(text, where):
    for name, pat in (("says what the room is for", INSTRUMENTAL),
                      ("sells the cold as a treatment", COLD),
                      ("counts or times something", TALLY)):
        found = re.compile(rf"\b(?:{pat})", re.I)
        ok = re.compile(rf"\b{NEGATION}\b[^.]{{0,60}}?\b(?:{pat})", re.I)
        for m in found.finditer(text):
            window = text[max(0, m.start() - 70):m.end()]
            if ok.search(window):
                continue
            problems.append(f"{where}: {m.group(0)!r} {name}. See the data file's _not_instrumental; "
                            "rewrite the sentence rather than softening the word.")


def visible(src):
    """The room's own words: the main element, with the guild's marker cut out
    (its words are the guild's, from data/quests.json) and every tag and comment
    stripped."""
    m = re.search(r"<main\b.*?</main>", src, re.S)
    body = m.group(0) if m else ""
    body = re.sub(r"<!-- quest:[^:]+:begin -->.*?<!-- quest:[^:]+:end -->", " ", body, flags=re.S)
    body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)
    body = re.sub(r"<(script|style|svg)\b.*?</\1>", " ", body, flags=re.S)
    body = re.sub(r"<[^>]+>", " ", body)
    return re.sub(r"\s+", " ", html.unescape(body))


# ── Writing ──────────────────────────────────────────────────────────────────
deg = f"{t['f']}&deg;F ({t['c']}&deg;C)"
short = f"{t['f']}&deg;F ({t['c']}&deg;C), all year"
measured = (f"{html.escape(t['measured_by'][0].upper() + t['measured_by'][1:], quote=False)}&rsquo;s "
            f"<a href=\"{t['source']}\">own words</a> for {html.escape(t['where'], quote=False)} are that "
            f"&ldquo;{html.escape(t['says'], quote=False)}&rdquo;.")
dial = "\n".join([
    '  <div class="fro-dial">',
    '    <p class="fro-dial__read">'
    f'<span class="fro-dial__f">{t["f"]}&deg;F</span>'
    f'<span class="fro-dial__c">{t["c"]}&deg;C</span></p>',
    f'    <p class="fro-dial__says">All year, at the bottom. It said this before you came in and it will '
    f'say it after you leave. Read off {html.escape(t["measured_by"], quote=False)}&rsquo;s '
    f'<a href="{t["source"]}">weather page for Carlsbad Caverns</a> on {t["read"]}.</p>',
    "  </div>",
])

# "f" is the bare Fahrenheit figure, for Ryan's own sentence in Stay Breezy,
# the room behind this one: he said "a 68F room", and a quotation takes the
# number as he said it rather than with a Celsius figure he did not say.
BLOCKS = {"temp": deg, "short": short, "measured": measured, "dial": dial, "f": f"{t['f']}&deg;F"}


def fill(path, required):
    src = path.read_text()
    seen = set()

    def swap(m):
        seen.add(m.group(1))
        body = BLOCKS[m.group(1)]
        if m.group(1) == "dial":
            return f"<!-- frosty:dial:begin -->\n{body}\n  <!-- frosty:dial:end -->"
        return f"<!-- frosty:{m.group(1)}:begin -->{body}<!-- frosty:{m.group(1)}:end -->"

    out = re.sub(r"<!-- frosty:(\w+):begin -->.*?<!-- frosty:\1:end -->", swap, src, flags=re.S)
    unknown = seen - set(BLOCKS)
    if unknown:
        problems.append(f"{path.name} has frosty markers for {sorted(unknown)}, which this tool does not write.")
    missing = set(required) - seen
    if missing:
        problems.append(f"{path.name} has lost its frosty:{'/'.join(sorted(missing))} markers, so the "
                        "temperature there would be typed by hand. Put them back.")
    return src, out


room_src, room_out = fill(ROOM, ("dial", "temp", "measured"))
cav_src, cav_out = fill(CAVERNS, ("short",))
bz_src, bz_out = fill(BREEZY, ("f",))

# ── Refusing ─────────────────────────────────────────────────────────────────
# The room's own <main> only: the card's alt text in <head> carries the reading
# too, and make-og.py writes it out of the same data file.
main = re.search(r"<main\b.*?</main>", room_out, re.S)
stripped = re.sub(r"<!-- frosty:(\w+):begin -->.*?<!-- frosty:\1:end -->", " ",
                  main.group(0) if main else room_out, flags=re.S)
for m in re.finditer(r"\d+\s*(?:&deg;|°|º)\s*[FC]\b", stripped):
    problems.append(f"stay-frosty.html states {m.group(0)!r} outside the markers. The room has one "
                    "temperature, written from the data file; a second is the room contradicting itself.")

room_only = re.sub(r"<!-- quest:[^:]+:begin -->.*?<!-- quest:[^:]+:end -->", " ", room_out, flags=re.S)
for pat, what in ((r"<button\b", "a button"), (r"<audio\b|<video\b", "a player"),
                  (r"<iframe\b|data-embed-src", "a frame"), (r"\bsetInterval\b|\bsetTimeout\b", "a timer")):
    if re.search(pat, room_only):
        problems.append(f"stay-frosty.html has {what}. The room says there is nothing to press and "
                        "nothing that plays, and it has to stay true.")
scripts = set(re.findall(r'<script src="([^"]+)"', room_out))
if scripts - {"love.js", "quest.js"}:
    problems.append(f"stay-frosty.html loads {sorted(scripts - {'love.js', 'quest.js'})}. The room has no "
                    "script of its own, because it does nothing.")
if not re.search(r'<body[^>]*\bdata-cb="off"', room_out):
    problems.append('stay-frosty.html\'s <body> has lost data-cb="off", so the CB would follow people '
                    "down and squelch in a room that says nothing in it makes a sound.")

css = CSS.read_text()
sec = re.search(rf"/\* §\d+ ── ROOM: {SECTION}.*?(?=/\* §\d+ ── )", css, re.S)
if not sec:
    problems.append(f"love.css has no section headed 'ROOM: {SECTION}', so its motion cannot be checked.")
else:
    rules = re.sub(r"/\*.*?\*/", " ", sec.group(0), flags=re.S)
    for prop in ("animation", "transition", "@keyframes", "transform"):
        if re.search(rf"(?<![\w-]){re.escape(prop)}\b", rules):
            problems.append(f"love.css's Stay Frosty section uses {prop}. Nothing in that room moves, at "
                            "any setting, and it says so.")

sweep(visible(room_out), "stay-frosty.html")

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))

for path, before, after in ((ROOM, room_src, room_out), (CAVERNS, cav_src, cav_out),
                            (BREEZY, bz_src, bz_out)):
    if after != before:
        path.write_text(after)
print(f"stay frosty: {t['f']}F ({t['c']}C) from {t['measured_by']}, written into the room and its plate; "
      "nothing to press, nothing moves, nothing is for anything")
