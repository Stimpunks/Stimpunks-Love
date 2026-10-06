#!/usr/bin/env python3
"""Build Big Steep Fermentables' racks of house styles from data/big-steep.json.

Big Steep is level B1 of Arlesglad Caverns: a brewery and cellar for wine, beer
and kombucha, Ryan's brief, 2026-09-26 -- "try our house styles". This writes
the house styles into the room, and holds the room to the rules the brief was
given in DECISIONS.md, every one of which is about the people who do not drink.

WHAT IT REFUSES:

  · A POUR THAT DOES NOT SAY HOW STRONG IT IS. The runtime rule for a drink:
    that number is what lets somebody decide, so it comes before the pour.
  · A HOUSE STYLE WITHOUT AN ALCOHOL-FREE POUR, OR ONE THAT PUTS IT SECOND. The
    alcohol-free pour comes first and at the same size, Dead Tired Society's
    rule about passing, because many of us do not drink and a cellar that listed
    that pour second would be telling them they are the afterthought. An
    alcohol-free pour is at most 0.05%, and the room says what that means.
  · A KOMBUCHA WITH A FIXED STRENGTH. It is fermented, the trace varies from
    batch to batch, so its fermented pour gives a ceiling and says it varies,
    and its alcohol-free pour is the tea not fermented, which is the only
    honest way to have none.
  · PRESSURE, AND THE VOCABULARY THAT MAKES NOT DRINKING SOUND LESSER. Rounds,
    one more, drinking games, being drunk as the fun part; "mocktail" and
    "virgin" and "just a soft drink", which each describe an alcohol-free drink
    as an imitation of the real one.
  · A HEALTH CLAIM. Probiotics, gut health, antioxidants, detox, a hangover cure:
    kombucha in particular is sold on its body, and a drink here is a drink.
  · A COUNT: no tally of pours, rounds or units.
  · AN AMBIENCE VIDEO WITHOUT A RUNTIME, OR WITH AN ID THAT IS NOT ONE. The
    street's oldest promise, for three ten-hour cellars that are somebody
    else's. Their titles are quoted as written and cut out of the sweep,
    because they are their uploaders' words.
  · WOOD, in the room's own words about the cellar: the vessels are glass and
    steel, which is what keeps the room off the brown rooms.

Every refusal of vocabulary uses the checkpoint's negation window, so the room
can say what it will not do. Top-level underscore keys are the record of why
and are skipped. IT NEEDS NOTHING BUT THE FILES.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/big-steep.json"
ROOM = ROOT / "big-steep-fermentables.html"
KINDS = {"beer", "wine", "kombucha"}
GLOWS = {"amber", "straw", "garnet", "stout", "haze", "hibiscus"}
FREE = 0.05

# "rounds?" ON ITS OWN refused A Quiet Pint on that room's first run, 2026-10-05:
# half its tables are round, and its tool walks "round every column". Narrowed to
# the round somebody buys, not excepted, which is check-counts.py's first-run
# lesson again; A Quiet Pint reads this list out of this file.
PRESSURE = (r"drink up|one more|another round|next round|"
            r"(?:buy|buys|bought|buying|stand|stands|stood|standing|get|gets|getting|whose|my|your) "
            r"(?:a |the |this |next )?rounds?\b|rounds? of (?:drinks|pints|shots)|bottoms up|down (?:it|in one)|chug\w*|"
            r"shots?\b|pre-?drink\w*|drinking games?|lightweight|don't be boring|"
            r"get(?:ting)? drunk|drunk|wasted|hammered|smashed|plastered|tipsy|buzzed|"
            r"mocktails?|virgin|just a soft drink|only a soft drink|designated driver")
HEALTH = (r"probiotic\w*|boost\w*|energi[sz]\w*|gut\b|gut health|antioxidant\w*|resveratrol|detox\w*|good for you|healthy|healthier|"
          r"immun\w+|heal(?:s|ing|ed)?|cures?|hangover|hair of the dog|medicin\w+|therap\w*|wellness|superfoods?")
TALLY = r"streaks?|leaderboards?|badges?|tall(?:y|ies)|units? (?:drunk|a week|counted)|how many (?:you|pours)"
WOOD = r"oak|barrels?|casks?|wooden|timber|wood\b"
NEGATION = (r"(?:no|not|nothing|never|neither|none|nor|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|declin\w+)")
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,8}|#\d{2,5}|#x[0-9A-Fa-f]{2,5});")

problems = []


def sweep(text, where):
    for label, pat in (("presses somebody to drink, or makes not drinking sound lesser", PRESSURE),
                       ("makes a health claim", HEALTH), ("counts something", TALLY),
                       ("puts wood in a cellar of glass and steel", WOOD)):
        found = re.compile(rf"\b(?:{pat})", re.I)
        ok = re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{pat})", re.I)
        for m in found.finditer(text):
            window = text[max(0, m.start() - 80):m.end()]
            if ok.search(window):
                continue
            problems.append(f"{where}: {m.group(0)!r} {label}. See the data file's reasons; rewrite the "
                            "sentence rather than softening the word.")


data = json.loads(DATA.read_text())
styles = data["styles"]
for st in styles:
    where = f"style {st.get('id')!r}"
    for key in ("id", "name", "kind", "glow", "what", "pours"):
        if not st.get(key):
            problems.append(f"{where} has no {key}.")
    if st.get("kind") not in KINDS:
        problems.append(f"{where} is a {st.get('kind')!r}; the cellar makes {sorted(KINDS)}.")
    if st.get("glow") not in GLOWS:
        problems.append(f"{where}'s glow is {st.get('glow')!r}; the room's are {sorted(GLOWS)}.")
    pours = st.get("pours", [])
    if len(pours) != 2:
        problems.append(f"{where} has {len(pours)} pours; every house style has exactly two, "
                        "alcohol-free first and then the other.")
    for i, p in enumerate(pours):
        pw = f"{where} pour {i + 1}"
        for key in ("label", "strength", "how"):
            if not p.get(key):
                problems.append(f"{pw} has no {key}. Every pour says how strong it is before the pour.")
        if "abv" not in p and "abv_max" not in p:
            problems.append(f"{pw} gives no number for its strength.")
    if pours:
        first = pours[0]
        if first.get("label") != "Alcohol-free" or first.get("abv", 1) > FREE or "abv_max" in first:
            problems.append(f"{where}'s first pour is not alcohol-free (at most {FREE}%). The alcohol-free "
                            "pour comes first, the same size, in every house style.")
    if st.get("kind") == "kombucha" and len(pours) == 2:
        second = pours[1]
        if "abv" in second or not second.get("varies") or "abv_max" not in second:
            problems.append(f"{where} gives its fermented pour a fixed strength. Kombucha's trace varies from "
                            "batch to batch; give the most it can be, and say it varies.")
        if pours[0].get("abv") != 0:
            problems.append(f"{where}'s alcohol-free pour is not the tea unfermented. That is the only honest "
                            "way to have none.")
    for key, value in st.items():
        if isinstance(value, str):
            sweep(value, f"{where} ({key})")
            if ENTITY.search(value):
                problems.append(f"{where} ({key}): an HTML entity. Write the character.")
    for i, p in enumerate(pours):
        for key, value in p.items():
            if isinstance(value, str):
                sweep(value, f"{where} pour {i + 1} ({key})")

VID = re.compile(r"^[A-Za-z0-9_-]{11}$")
RUNTIME = re.compile(r"^(?:\d+:)?[0-5]?\d:[0-5]\d$")
for a in data.get("ambience", []):
    where = f"ambience {a.get('id')!r}"
    if not VID.match(a.get("id", "")):
        problems.append(f"{where} is not a YouTube id; the button would never become a video.")
    if not RUNTIME.match(str(a.get("runtime", ""))):
        problems.append(f"{where} has no runtime. It says how long it runs before the press.")
    for key in ("title", "channel"):
        if not a.get(key):
            problems.append(f"{where} has no {key}.")
    # A YOUTUBE MIX is a list YouTube builds on the fly, starting from this
    # video: its id is RD followed by the video's own. Anything else is a mix of
    # something else, and the label would be describing the wrong list.
    if "mix" in a and a["mix"] != "RD" + a.get("id", ""):
        problems.append(f"{where}'s mix is {a['mix']!r}; a YouTube mix of this video is RD{a.get('id')}.")
if data.get("ambience") and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", data.get("ambience_read", "")):
    problems.append("the ambience videos have no date they were read on.")

# Refuse on the data before writing anything: a pour with no strength must stop
# the build with its reason, not crash half way through drawing the card.
if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))

esc = lambda s: html.escape(s, quote=False)
KIND_WORD = {"beer": "Beer", "wine": "Wine", "kombucha": "Kombucha"}


def vessel(st):
    """A glass vessel with the cellar's light coming through it from behind: a
    bottle for wine, a carboy for beer and kombucha. aria-hidden; the words say
    what the drink is."""
    if st["kind"] == "wine":
        shape = '<path d="M26 6 H34 V20 Q44 26 44 40 V74 Q44 78 40 78 H20 Q16 78 16 74 V40 Q16 26 26 20 Z"/>'
    else:
        shape = ('<path d="M24 4 H36 V10 H34 V16 Q50 22 50 42 V70 Q50 78 42 78 H18 Q10 78 10 70 V42 '
                 'Q10 22 26 16 V10 H24 Z"/>')
    return (f'<svg class="bs-vessel bs-vessel--{st["glow"]}" viewBox="0 0 60 82" aria-hidden="true" '
            f'focusable="false"><g class="bs-glass">{shape}</g></svg>')


def card(st):
    rows = []
    for p in st["pours"]:
        cls = "bs-pour bs-pour--free" if p is st["pours"][0] else "bs-pour"
        rows.append(f'        <li class="{cls}"><span class="bs-pour__label">{esc(p["label"])}</span>'
                    f'<span class="bs-pour__strength">{esc(p["strength"])}</span>'
                    f'<span class="bs-pour__how">{esc(p["how"])}</span></li>')
    return "\n".join([
        f'    <li class="bs-style" id="style-{st["id"]}">',
        f'      {vessel(st)}',
        '      <div class="bs-style__words">',
        f'        <p class="bs-kind">{KIND_WORD[st["kind"]]}</p>',
        f'        <h3>{esc(st["name"])}</h3>',
        f'        <p>{esc(st["what"])}</p>',
        f'        <ul class="bs-pours" aria-label="The two pours of {esc(st["name"])}, and how strong each is">',
        *rows,
        "        </ul>",
        "      </div>",
        "    </li>",
    ])


block = "\n".join(['  <ul class="bs-racks">', *[card(st) for st in styles], "  </ul>"])
att = lambda s: html.escape(s, quote=True)
amb = ['  <ul class="bs-ambience">']
for a in data.get("ambience", []):
    if a.get("mix"):
        # THE MIX PLAYS ON PAST THE FIRST VIDEO, so the label gives that
        # video's runtime and then says the rest has none and is unchecked.
        embed = (f'data-embed-src="https://www.youtube-nocookie.com/embed/{a["id"]}?list={a["mix"]}"')
        label = f'Put it on &mdash; {a["runtime"]}, then YouTube&rsquo;s own mix until you stop it'
        note = (f'{esc(a["channel"])} &middot; {a["runtime"]}, and then a mix YouTube picks as it goes. '
                'Nobody here has checked what the mix plays after the first video.')
    else:
        embed = f'data-embed-id="{a["id"]}"'
        label = f'Put it on &mdash; {a["runtime"]}'
        note = f'{esc(a["channel"])} &middot; {a["runtime"]}'
    amb += ['    <li class="bs-amb">',
            f'      <h3 class="bs-amb__title">{esc(a["title"])}</h3>',
            f'      <p class="bs-amb__who">{note}</p>',
            f'      <button type="button" class="facade" {embed} '
            f'data-embed-title="{att(a["channel"])} &mdash; {att(a["title"])}">',
            f'        {label}',
            '        <span class="facade__play">&#9654; PRESS PLAY</span>',
            '      </button>',
            '    </li>']
amb.append("  </ul>")
amb_block = "\n".join(amb)
src = ROOM.read_text()
if "<!-- bigsteep:styles:begin -->" not in src:
    problems.append("big-steep-fermentables.html has lost its bigsteep:styles markers.")
out = re.sub(r"<!-- bigsteep:styles:begin -->.*?<!-- bigsteep:styles:end -->",
             lambda _: f"<!-- bigsteep:styles:begin -->\n{block}\n  <!-- bigsteep:styles:end -->", src, flags=re.S)
if data.get("ambience"):
    if "<!-- bigsteep:ambience:begin -->" not in out:
        problems.append("big-steep-fermentables.html has lost its bigsteep:ambience markers.")
    out = re.sub(r"<!-- bigsteep:ambience:begin -->.*?<!-- bigsteep:ambience:end -->",
                 lambda _: f"<!-- bigsteep:ambience:begin -->\n{amb_block}\n  <!-- bigsteep:ambience:end -->", out, flags=re.S)

main = re.search(r"<main\b.*?</main>", out, re.S)
text = main.group(0) if main else ""
text = re.sub(r"<!-- quest:[^:]+:begin -->.*?<!-- quest:[^:]+:end -->", " ", text, flags=re.S)
# THE AMBIENCE TITLES ARE THEIR UPLOADERS' WORDS, quoted as written, and cut out
# before the room's own voice is swept; the sentences of ours around them are not.
text = re.sub(r"<!-- bigsteep:ambience:begin -->.*?<!-- bigsteep:ambience:end -->", " ", text, flags=re.S)
text = re.sub(r"<!--.*?-->|<(svg|script|style)\b.*?</\1>", " ", text, flags=re.S)
text = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", text)))
sweep(text, "big-steep-fermentables.html")

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))
if out != src:
    ROOM.write_text(out)
print("big steep: the house styles written from data/big-steep.json; every pour says how strong it is "
      "before the pour, and the alcohol-free one comes first in every style")
