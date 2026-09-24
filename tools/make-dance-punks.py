#!/usr/bin/env python3
"""Build Dance, Punks' channels, and the credits.

ONE DATA FILE, ONE TOOL, TWO SURFACES -- the contract make-chappell.py,
make-club.py, make-lagoon.py, make-looming.py and the rest keep. The headset's
channels go into dance-punks.html; the same three opening songs go into
liner-notes.html as credits, so the two cannot come to disagree.

WHAT IT REFUSES, and why each one is here:

  - A RUNTIME ON THE CRATE OR ON ANY CHANNEL. The crate is a playlist we keep
    adding to, so a length is wrong next week and authoritative-looking
    meanwhile -- make-club.py's half of the runtime rule, which is the same
    promise as the other half: say what somebody is pressing before they press
    it, and never say a number that will quietly stop being true.

  - A CHANNEL WHOSE COLOUR IS THE ONLY THING TELLING IT APART. Every channel
    must carry a number and a name, and the three inks must be at least 1.5:1
    apart in brightness from EACH OTHER, so they are three different headsets
    in greyscale and to anybody who does not see those hues as different. The
    obvious three are red, green and blue, which is the classic colour-blind
    failure; the bar is ours rather than a standard's, and the room prints it.
    Each ink is also held to 4.5:1 on the tarmac, because the channel's name
    is set in it. The values are READ OUT OF love.css's :root, never copied
    into the data file -- a second copy of a colour is a pair nobody measures.

  - A CHANNEL WITH NO RULE IN THE STYLESHEET. `dp-channel--<name>` has to exist
    in §43 or the headset band would render in whatever it inherited, which is
    make-mopery.py's spine-colour refusal.

  - ANY ANIMATION IN THE ROOM'S OWN SECTION. Nothing on the runway moves on its
    own at any dial setting, and the headsets glow steadily: a dancefloor is the
    room on this road most likely to grow a pulse, a chase or a strobe, and
    Club Chronic already settled that a light which can put somebody on the
    floor has no business at a party. The sweep reads §43 for @keyframes and
    `animation` and refuses either -- a flat ban, because there is no version
    of a flashing headset this room wants.

  - THE WORD SHUFFLE, EXCEPT TO REFUSE IT. The embed cannot shuffle (measured in
    Club Chronic), and three starting points in one crate is not three DJs
    either. The room says what the player does; this keeps it saying that.
    Negation window, so "it is not shuffle" survives.

  - AN ID THAT IS NOT A YOUTUBE ID, A CRATE THAT IS NOT A PLAYLIST ID, TWO
    CHANNELS OPENING ON THE SAME SONG, AN OPENING SONG WITH NO ARTIST OR NO
    CHANNEL. love-embed.js returns quietly on rubbish, and none of this music
    is ours.

  - AN HTML ENTITY IN ANY FIELD, AND A FIELD SHAPED LIKE VERSE. The first
    because every field is escaped on the way out and `&mdash;` would arrive as
    seven characters (data/toys.json). The second because nothing musical is
    hosted here, and a room made of a playlist is where somebody pastes in a
    chorus they love -- make-lagoon.py's rule.

IF THIS REFUSES: fix the cause. Do not loosen the tool.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/dance-punks.json"
ROOM = ROOT / "dance-punks.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"

YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
PL = re.compile(r"^PL[A-Za-z0-9_-]{10,40}$")
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
RUNTIME_KEYS = {"runs", "runtime", "length", "duration", "spoken"}

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|nor)")
SHUFFLE_RE = re.compile(r"\bshuffl\w*", re.I)
SHUFFLE_OK = re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?\bshuffl\w*", re.I)

TARMAC_VAR = "--dp-tarmac"
BODY_BAR = 4.5
APART = 1.5

problems = []


def refuse(msg):
    problems.append(msg)


def luminance(hexa):
    h = hexa.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def ratio(a, b):
    x, y = sorted((luminance(a), luminance(b)), reverse=True)
    return (x + 0.05) / (y + 0.05)


def palette(css):
    """Every --dp- colour declared in :root, read rather than copied."""
    root = css[css.index(":root {"):]
    root = root[:root.index("\n}")]
    return dict(re.findall(r"(--dp-[a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})", root))


def section(css):
    start = css.index("/* §43 ── ROOM: Dance, Punks")
    end = css.index("/* §44 ", start)
    # COMMENTS STRIPPED BEFORE ANYTHING IS READ. The section's own header says
    # "@keyframes or an animation" while explaining this refusal, and the first
    # run refused the paragraph that describes it.
    return re.sub(r"/\*.*?\*/", "", css[start:end], flags=re.S)


def verse_shaped(s):
    lines = [l for l in s.split("\n") if l.strip()]
    return len(lines) >= 3 and all(len(l) < 60 for l in lines)


def walk(obj, path=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k.startswith("_"):
                continue
            if k in RUNTIME_KEYS:
                refuse(f"{path}.{k}: a runtime. The crate is a playlist we keep adding to, and "
                       "a length on it, or on a channel that plays on through it, is wrong next "
                       "week and authoritative meanwhile.")
            walk(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            walk(v, f"{path}[{i}]")
    elif isinstance(obj, str):
        if ENTITY.search(obj):
            refuse(f"{path}: an HTML entity. Write the character; this field is escaped on "
                   "the way out and the entity would arrive as literal text.")
        if verse_shaped(obj):
            refuse(f"{path}: shaped like verse. Nothing musical is hosted here, and that "
                   "includes the words.")


def e(s):
    return html.escape(s, quote=True)


def swap(src, marker, body, where):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if src.count(begin) != 1 or src.count(end) != 1:
        raise SystemExit(f"REFUSING: {where} needs exactly one {marker} marker pair. A "
                         "generator that writes nothing and exits 0 is how two surfaces drift.")
    return re.sub(re.escape(begin) + r".*?" + re.escape(end),
                  lambda _: f"{begin}\n{body}\n    {end}", src, count=1, flags=re.S)


def main():
    data = json.loads(DATA.read_text())
    css = CSS.read_text()
    inks = palette(css)
    sec = section(css)
    walk(data)

    crate = data["crate"]
    if not PL.match(crate.get("id", "")):
        refuse(f"crate: {crate.get('id')!r} is not a YouTube playlist id.")

    tarmac = inks.get(TARMAC_VAR)
    if not tarmac:
        refuse(f"{TARMAC_VAR} is not declared in :root, and every channel is measured on it.")

    chans = data["channels"]
    # THE ROOM'S OWN COPY SAYS THREE, in the subtitle the share card lifts, in
    # the lede and in the rules, because a silent disco's three channels are the
    # shape of the thing rather than a total that grows. A fourth row here would
    # leave every one of those sentences false and nothing else would notice --
    # the Jungle Room's hand-typed count in a disguise. So a different number is
    # refused until somebody rewrites the sentences with it.
    if len(chans) != 3:
        refuse(f"{len(chans)} channels. dance-punks.html says three in its own words, in "
               "several places; change those sentences first, then this number.")
    seen_ids, seen_n = set(), set()
    lum = []
    for c in chans:
        where = f"channel {c.get('n')}"
        if not c.get("name") or not isinstance(c.get("n"), int):
            refuse(f"{where}: no number or no name. Colour is never the only thing telling a "
                   "headset apart.")
            continue
        if c["n"] in seen_n:
            refuse(f"{where}: the number is used twice.")
        seen_n.add(c["n"])
        o = c.get("opens", {})
        if not YT.match(o.get("id", "")):
            refuse(f"{where}: {o.get('id')!r} is not a YouTube id; love-embed.js would refuse "
                   "it quietly and the headset would never play.")
        if o.get("id") in seen_ids:
            refuse(f"{where}: opens on the same song as another channel.")
        seen_ids.add(o.get("id"))
        for k in ("title", "artist", "channel"):
            if not o.get(k):
                refuse(f"{where}: its opening song has no {k}. None of this music is ours.")
        ink = inks.get(c.get("ink", ""))
        if not ink:
            refuse(f"{where}: {c.get('ink')!r} is not a --dp- colour in :root.")
            continue
        if tarmac and ratio(ink, tarmac) < BODY_BAR:
            refuse(f"{where}: {c['ink']} {ink} is {ratio(ink, tarmac):.2f} on the tarmac, under "
                   f"{BODY_BAR}. The channel's name is set in it.")
        slug = c["name"].lower()
        if not re.search(rf"\.dp-channel--{slug}\b", sec):
            refuse(f"{where}: §43 has no .dp-channel--{slug} rule, so its band would render in "
                   "whatever it inherited.")
        lum.append((c["name"], c["ink"], ink))

    for i in range(len(lum)):
        for j in range(i + 1, len(lum)):
            r = ratio(lum[i][2], lum[j][2])
            if r < APART:
                refuse(f"{lum[i][0]} and {lum[j][0]} are {r:.2f}:1 apart in brightness, under "
                       f"{APART}. In greyscale they would be the same headset.")

    if re.search(r"@keyframes|\banimation\s*:", sec):
        refuse("§43 animates something. Nothing on the runway moves on its own at any "
               "setting, and the headsets glow steadily or not at all.")

    room = ROOM.read_text()
    text = html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<(script|style)\b.*?</\1>", "", room,
                                                          flags=re.S)))
    for sentence in re.split(r"(?<=[.!?])\s+", text):
        if SHUFFLE_RE.search(sentence) and not SHUFFLE_OK.search(sentence):
            refuse(f"the room says shuffle and does not refuse it: {sentence.strip()[:120]!r}")

    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1

    pl = crate["id"]
    rows = []
    for c in sorted(chans, key=lambda c: c["n"]):
        o = c["opens"]
        slug = c["name"].lower()
        away = f"https://www.youtube.com/watch?v={o['id']}&amp;list={pl}"
        rows.append(
            f'      <li class="dp-channel dp-channel--{slug}">\n'
            f'        <p class="dp-channel__no">CH {c["n"]} &middot; '
            f'<span class="dp-channel__name">{e(c["name"])}</span></p>\n'
            f'        <p class="dp-channel__opens">Opens on <b>{e(o["title"])}</b> by '
            f'{e(o["artist"])}, and plays on through the crate from there.</p>\n'
            f'        <p class="dp-channel__about">{e(c["about"])}</p>\n'
            f'        <p class="dp-channel__go"><button type="button" class="dp-tune" '
            f'data-n="{c["n"]}" data-name="{e(c["name"])}" data-slug="{slug}" '
            f'data-id="{o["id"]}" data-title="{e(o["title"])}" data-artist="{e(o["artist"])}" '
            f'hidden>Tune the headset to {e(c["name"])}</button> '
            f'<a class="dp-channel__away" href="{away}">or open channel {c["n"]} on YouTube '
            f'&rarr;</a></p>\n'
            f'      </li>')
    ROOM.write_text(swap(room, "dp-channels", "\n".join(rows), ROOM.name))

    notes = NOTES.read_text()
    credits = [
        f'      <tr><td>Channel {c["n"]}, {e(c["name"])}</td><td>{e(c["opens"]["title"])}</td>'
        f'<td><strong>{e(c["opens"]["artist"])}</strong></td><td>{e(c["opens"]["channel"])}</td></tr>'
        for c in sorted(chans, key=lambda c: c["n"])]
    NOTES.write_text(swap(notes, "dance-punks-credits", "\n".join(credits), NOTES.name))

    print(f"dance, punks: {len(chans)} channels written into {ROOM.name} and "
          f"{NOTES.name}; every ink measured on the tarmac and against every other.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
