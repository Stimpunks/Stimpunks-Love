#!/usr/bin/env python3
"""Build Rebellion Rave Room's big screen, and the credits -- and hold the rig
to what the room promises about it.

ONE DATA FILE, ONE TOOL, TWO SURFACES: data/rebellion-rave.json becomes the
channel list in rebellion-rave-room.html and the credits in liner-notes.html,
the contract make-looming.py and the rest keep.

THIS IS THE ONE ROOM ON THE STREET WITH A STROBE IN IT, Ryan's brief of
2026-09-27, which relaxes the rule Club Chronic set and every room since has
repeated. The relaxation is an OPT-IN and nothing else, so what this tool holds
is the opt-in:

  - THE WARNING COMES BEFORE THE SWITCH. The strobe warning must be on the page
    and must come before the rig in the document, which is the order a screen
    reader, a keyboard and a scrolling eye all meet them in. A warning below the
    thing it warns about is a warning read afterwards.

  - THE RIG SHIPS HIDDEN. With scripts off there must be no switch that does
    nothing, and with scripts on rave.js is the only thing that shows it.

  - THE KNOB STOPS AT ELEVEN AND STARTS AT FOUR. MAX_RATE in rave.js, the
    range's max in the markup and the page's "from one to eleven a second" must
    agree, and no higher than eleven: the Epilepsy Society puts the flashes most
    likely to trigger a seizure at 16 to 25 a second. The knob's starting value
    is four, the most the UK Health and Safety Executive recommends for a club,
    which the warning says.

  - THE FLASH IS WHITE. --rr-strobe must have no hue in it. A saturated red
    flash is the one WCAG 2.3.1 treats as worst of all, and a coloured strobe is
    the friendly edit most likely to arrive, because it looks better.

  - NOTHING IS REMEMBERED AND NOTHING STARTS BY ITSELF. rave.js is refused if it
    stores anything, if it sets a timer rather than waiting for a press, or if
    it loses any of the ways out: Escape, the tab going hidden, the page going.
    A strobe that resumed when somebody came back to the tab, or that was on
    because it was on last time, would be one nobody asked for this time.

  - NO CLAIM OF SAFETY AND NO CLAIM OF TREATMENT, in the room's own voice. Not
    "seizure-safe", "epilepsy-friendly", "safe for photosensitive" -- no rate is
    -- and not "therapeutic", "brainwave", "entrainment", "neurofeedback",
    "heals": the room links a flicker device and repeats nothing its maker says
    flicker does. Negation window, so the room can say that it will not.

  - THE FESTIVAL LIGHTING SENTENCE. Every channel is festival footage with its
    own strobes in it, which the rig cannot reach; the page must say so beside
    the screen, before the press.

And for the screen, what make-looming.py and make-club.py hold between them:

  - A MIX IS ONE VIDEO AND THEN YOUTUBE'S LIST, whose id is RD followed by that
    video's own (Big Steep's rule), and it needs a runtime -- the first video's,
    which is the part of it anybody here measured.
  - A PLAYLIST HAS NO RUNTIME, and the tool refuses one, because a list
    somebody keeps adding to has none that stays true. It carries its position 1
    as `opens`, because that entry decides whether the list embeds at all.
  - AN ID THAT IS NOT AN ID, a channel nobody named, or a note with an HTML
    entity in it. And no ranking in OUR words: the titles are the channels'
    and are quoted as written ("Best Stage 2026"), so they are not swept.
"""
import colorsys
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/rebellion-rave.json"
ROOM = ROOT / "rebellion-rave-room.html"
NOTES = ROOT / "liner-notes.html"
JS = ROOT / "rave.js"
CSS = ROOT / "love.css"

YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
PL = re.compile(r"^PL[A-Za-z0-9_-]{16,40}$")
CLOCK = re.compile(r"^\d+:[0-5]\d(?::[0-5]\d)?$")
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
RANKING = re.compile(r"\b(?:best|greatest|essential|definitive|top\s+\d+|countdown|ranked|"
                     r"number\s+one|biggest)\b", re.I)
SAFE = re.compile(r"\b(?:seizure[- ]safe|epilepsy[- ]friendly|safe\s+for\s+(?:people\s+with\s+)?"
                  r"(?:epilep\w*|photosensitiv\w*)|photosensitive[- ]safe|harmless|"
                  r"therapeutic|therap(?:y|ies)|brainwaves?|entrain\w*|neurofeedback|heals?|"
                  r"healing|treats?\s+(?:anxiety|adhd|autism|depression)|rewires?)\b", re.I)
NEGATED = re.compile(r"\b(?:not|no|nothing|never|nor|without|nobody|none|any)\b[^.;:]*$", re.I)
STORES = re.compile(r"localStorage|sessionStorage|indexedDB|document\.cookie")
TIMER = re.compile(r"\bset(?:Interval|Timeout)\s*\(\s*function\s*\(\)\s*\{[^}]*\b(?:run|tick|strobeOn\s*=\s*true)")
MAX_ALLOWED = 11
START_AT = 4
LIST_SAYS = "her playlist, in her order, until it ends or you stop it"


def esc(s):
    return html.escape(s, quote=False)


def attr(s):
    return html.escape(s, quote=True)


def plain(s):
    s = re.sub(r"<script.*?</script>|<style.*?</style>|<!--.*?-->", " ", s, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


def swap(page, marker, block, indent=""):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    src = page.read_text()
    if begin not in src or end not in src:
        raise SystemExit(f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to write.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda m: begin + "\n" + block + "\n" + indent + end, src, flags=re.S))


def label(c):
    if c["kind"] == "playlist":
        return LIST_SAYS
    return f'{c["spoken"]}, then YouTube’s own mix until you stop it'


def check_data(d):
    bad = []
    chans = d.get("screens") or []
    if not chans:
        bad.append("data/rebellion-rave.json has no screens, and the big screen is made of them.")
    seen = set()
    for c in chans:
        t = (c.get("title") or "").strip() or "<untitled>"
        if not (c.get("channel") or "").strip():
            bad.append(f"{t!r} names no channel. None of this is ours.")
        note = (c.get("note") or "").strip()
        if not note:
            bad.append(f"{t!r} has no note written for this room.")
        for field in ("title", "channel", "note"):
            if ENTITY.search(c.get(field) or ""):
                bad.append(f"{t!r}'s {field} has an HTML entity in it; everything is escaped on the way in.")
        # The channel's own name is the channel's words, like the title: "Best
        # Stage Tomorrowland" is what it calls itself, and the first run refused
        # the note for naming it. Narrowed by taking the name out, not excepted.
        m = RANKING.search(note.replace(c.get("channel") or "\0", " "))
        if m:
            bad.append(f"{t!r}'s note says {m.group(0)!r}. The channel list is an order, not a verdict; "
                       "the titles are the channels' words and may, our notes may not.")
        kind = c.get("kind")
        if kind == "mix":
            vid = c.get("id") or ""
            if not YT.match(vid):
                bad.append(f"{t!r} has {vid!r}, which is not a YouTube id.")
            if c.get("mix") != "RD" + vid:
                bad.append(f"{t!r}'s mix is {c.get('mix')!r}; a YouTube mix of this video is RD{vid}, and "
                           "a label describing the wrong list is the broken thing.")
            if not CLOCK.match(c.get("runs") or ""):
                bad.append(f"{t!r} has no runtime that is a clock. Every press here says how long "
                           "before the press, and a mix's first video has one.")
            if not (c.get("spoken") or "").strip():
                bad.append(f"{t!r} has no spoken runtime, which is what somebody decides with.")
            key = vid
        elif kind == "playlist":
            if not PL.match(c.get("list") or ""):
                bad.append(f"{t!r} has {c.get('list')!r}, which is not a playlist id.")
            if c.get("runs") or c.get("spoken"):
                bad.append(f"{t!r} is a playlist and has a runtime. A list somebody keeps has none that "
                           "stays true: today's total is wrong next week and authoritative meanwhile.")
            o = c.get("opens") or {}
            if not YT.match(o.get("id") or "") or not o.get("title"):
                bad.append(f"{t!r} does not say which video it opens on. Position 1 decides whether the "
                           "whole list embeds, which is Queercore's lesson.")
            key = c.get("list")
        else:
            bad.append(f"{t!r} is a {kind!r}; a channel here is a mix or a playlist.")
            key = t
        if key in seen:
            bad.append(f"{key} is on the screen twice.")
        seen.add(key)
    return bad


def check_rig(page, js, css):
    bad = []
    warn = page.find('id="rr-warning"')
    rig = page.find('id="rr-rig"')
    if warn < 0:
        bad.append("the strobe warning (id=\"rr-warning\") is not on the page. The room relaxes the "
                   "street's rule about flashing on the condition that it says so first.")
    if rig < 0:
        bad.append("the rig (id=\"rr-rig\") is not on the page, so there is nothing for rave.js to run.")
    if warn >= 0 and rig >= 0 and warn > rig:
        bad.append("the strobe warning comes after the rig in the document. A warning below the switch "
                   "is a warning read afterwards.")
    tag = re.search(r'<div\b[^>]*id="rr-rig"[^>]*>', page)
    if tag and not re.search(r"\bhidden\b", tag.group(0)):
        bad.append("the rig does not ship hidden, so a page with scripts off would show switches that "
                   "do nothing. rave.js unhides it.")
    rng = re.search(r'<input\b[^>]*id="rr-rate"[^>]*>', page)
    mx = re.search(r"var MAX_RATE\s*=\s*(\d+)", js)
    if not rng or not mx:
        bad.append("the strobe's knob or rave.js's MAX_RATE is missing, so nothing here can say how "
                   "fast the rig goes.")
    else:
        a = dict(re.findall(r'([a-z-]+)="([^"]*)"', rng.group(0)))
        top, js_top = int(a.get("max", "0")), int(mx.group(1))
        if top != js_top:
            bad.append(f"the knob goes to {top} and rave.js to {js_top}. They say the same thing or "
                       "neither is true.")
        if max(top, js_top) > MAX_ALLOWED:
            bad.append(f"the strobe goes past {MAX_ALLOWED}. It goes to eleven and stops there; faster "
                       "is into the rates the Epilepsy Society calls the likeliest to trigger a seizure.")
        if int(a.get("value", "0")) != START_AT:
            bad.append(f"the knob starts at {a.get('value')}, and the warning says it starts at four, "
                       "the Health and Safety Executive's limit for a club.")
    if "from one to eleven a second" not in plain(page):
        bad.append("the warning no longer says the strobe runs \"from one to eleven a second\".")
    m = re.search(r"--rr-strobe:\s*(#[0-9A-Fa-f]{6})", css)
    if not m:
        bad.append("love.css declares no --rr-strobe, so nothing says what colour the flash is.")
    else:
        r, g, b = (int(m.group(1)[i:i + 2], 16) / 255 for i in (1, 3, 5))
        _, light, sat = colorsys.rgb_to_hls(r, g, b)
        if sat > 0.08 or light < 0.9:
            bad.append(f"--rr-strobe is {m.group(1)}, which is not white. A coloured flash is worse "
                       "than a white one, and a saturated red one is the worst of all.")
    if STORES.search(js):
        bad.append("rave.js stores something. Nothing on the rig is remembered: it is off every time "
                   "anybody comes in, and it cannot be on because it was on last time.")
    if TIMER.search(js):
        bad.append("rave.js starts the rig from a timer. Nothing here runs except from a press.")
    for need, why in (("'Escape'", "Escape"), ("visibilitychange", "the tab going hidden"),
                      ("pagehide", "leaving the page")):
        if need not in js:
            bad.append(f"rave.js no longer stops everything on {why}.")
    if not re.search(r"strobeB\.addEventListener\('click'.{0,300}?confirmP\.hidden\s*=\s*false", js, re.S):
        bad.append("the strobe switch no longer asks first. It takes two presses, and the second is an "
                   "answer to a question that names the rate.")
    for pat in (r"\bstrobeOn\s*=\s*true", r"\blasersOn\s*=\s*true"):
        for m_ in re.finditer(pat, js):
            head = js[max(0, m_.start() - 400):m_.start()]
            if "addEventListener('click'" not in head:
                bad.append(f"rave.js sets {m_.group(0).split('=')[0].strip()} outside a click handler.")
    said = plain(re.sub(r'<ul class="rr-channels">.*?</ul>', " ", page, flags=re.S))
    for m_ in SAFE.finditer(said):
        if not NEGATED.search(said[max(0, m_.start() - 60):m_.start()]):
            bad.append(f"the room says {m_.group(0)!r}. No rate of flashing is safe for somebody "
                       "photosensitive, and nothing here treats anything.")
    if "the rig’s limits do not reach inside somebody else’s video" not in plain(page).replace("'", "’"):
        bad.append("the screen no longer says that the films have their own lighting in them and the "
                   "rig's limits do not reach inside somebody else's video.")
    return bad


def channels(chans):
    out = []
    for i, c in enumerate(chans, 1):
        lab = label(c)
        if c["kind"] == "playlist":
            data = f'data-kind="playlist" data-list="{attr(c["list"])}"'
            by = (f'{esc(c["channel"])}&rsquo;s playlist &middot; opens on '
                  f'&ldquo;{esc(c["opens"]["title"])}&rdquo;, {esc(c["opens"]["runs"])}')
            runs = ""
        else:
            data = (f'data-kind="mix" data-id="{attr(c["id"])}" data-runs="{attr(c["runs"])}" '
                    f'data-spoken="{attr(c["spoken"])}"')
            by = f'{esc(c["channel"])} &middot; {esc(c["runs"])}, then YouTube&rsquo;s mix'
            runs = ""
        out.append(
            f'      <li class="rr-chan" data-ch="{i}" {data}\n'
            f'          data-title="{attr(c["title"])}" data-label="{attr(lab)}">\n'
            f'        <p class="rr-chan__no">CH {i:02d}</p>\n'
            f'        <h3>{esc(c["title"])}</h3>\n'
            f'        <p class="rr-chan__by">{by}{runs}</p>\n'
            f'        <p>{esc(c["note"])}</p>\n'
            f'        <button type="button" class="rr-tuneto" data-ch="{i}">Put it on the big screen '
            f'&middot; {esc(lab)}</button>\n'
            '      </li>')
    return "\n".join(out)


WORDS = {1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight",
         9: "nine", 10: "ten", 11: "eleven", 12: "twelve"}


def summary(chans):
    n = len(chans)
    return (f"The channel list &mdash; {WORDS.get(n, n)} channel{'' if n == 1 else 's'}, "
            "every one of them festival footage")


def count_line(chans):
    mixes = sum(1 for c in chans if c["kind"] == "mix")
    lists = len(chans) - mixes
    parts = []
    if mixes:
        parts.append(f"{WORDS.get(mixes, mixes)} film{'' if mixes == 1 else 's'} that play on into "
                     "YouTube&rsquo;s own mix")
    if lists:
        parts.append(f"{WORDS.get(lists, lists)} playlist{'' if lists == 1 else 's'} somebody keeps")
    return ("On the shared screen over the floor: " + " and ".join(parts) + ".")


def credit_rows(chans):
    rows = []
    for c in chans:
        if c["kind"] == "playlist":
            url, runs = f'https://www.youtube.com/playlist?list={esc(c["list"])}', "a playlist"
        else:
            url, runs = f'https://www.youtube.com/watch?v={esc(c["id"])}', f'{esc(c["runs"])}, then a mix'
        rows.append(f'      <tr><td><strong>{esc(c["channel"])}</strong></td><td>{esc(c["title"])}</td>'
                    f'<td>{runs}</td><td><a href="{url}">watch</a></td></tr>')
    return "\n".join(rows)


def main():
    d = json.loads(DATA.read_text())
    bad = check_data(d)
    bad += check_rig(ROOM.read_text(), JS.read_text(), CSS.read_text())
    if bad:
        print("REFUSING to build Rebellion Rave Room:")
        for b in bad:
            print("  - " + b)
        return 1
    chans = d["screens"]
    swap(ROOM, "rave-screens", channels(chans), "      ")
    swap(ROOM, "rave-summary", summary(chans), "    ")
    swap(ROOM, "rave-count", count_line(chans), "  ")
    swap(NOTES, "rave-credits", credit_rows(chans), "      ")
    print(f"rebellion rave room: {len(chans)} channels on the big screen, the warning above the "
          "rig, the knob at four and stopping at eleven, and nothing remembered.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
