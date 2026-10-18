#!/usr/bin/env python3
"""Build The Emergent Future Worlds Meets Mountain Man's big screen, its rack,
its wall and window of photographs, and its credits, from data/mountain-cabin.json.

WHAT THE ROOM IS. Helen Edgar's relay of David's brief, 2026-10-18: a log cabin
on a mountain with a lake through the windows, the windows opening onto his
photographs; a fire inside; a lounge of high-back sofas, armchairs and a corner
sofa; warm and cosy meets smart-home modern, LED strips that change colour, a
big screen and speakers; his YouTube on the screen (Future Mountain Man, on
NeuroHub Community's own channel); an oil diffuser; one switch for all of it;
one wolf inside and the pack outside under a full moon, with a button to hear
them; coffee on the stove and lots of cups; crisps, lots of sweets and Skittles.
And, the same morning: off the main campsite at the top of the mountain over the
Campgrounds, eco-friendly like Ryan's Solarpunk Hermitage, on geothermal energy,
a thermal hot spring outside the cabin, a cable car up to it so that Ryan, Helen
and Jess can visit, and wolves outside. He works with Helen and Ryan and knows
Jess and others in the Stimpunks community: Helen's line, and the credit names
him David, the name she gave. mountain-man.js drives what moves after a press:
the one switch, the lights, the fire, the wisps, the howl and the window.

ONE DATA FILE, ONE TOOL, TWO SURFACES, make-yells.py's contract: this writes the
screen and its rack between the mtn:screen markers, the wall between mtn:wall,
and the credits between cabin-sources in liner-notes.html. Do not hand-edit
between them.

THE BIG SCREEN IS A PLAYLIST AND THE RACK IS ITS MIRROR, rack.js's pattern and
make-club.py's pair of rules: every video on the rack carries a runtime, said
before either press (here, or up on the big screen), and the playlist carries
none, because it is David's list and he can add to it, and a total here would
be wrong the next time he did. The playlist's FIRST entry is on the rack and
has to be the first in the file, because the first entry is what decides whether
the whole playlist embeds at all (Queercore's lesson on the dancefloor). The
titles are the channels' own and are not swept.

THE WALL IS DAVID'S PHOTOGRAPHS AND NOTHING ELSE GOES ON IT. Every one is a
record in data/polaroids.json (on_wall false, elsewhere naming this page) and a
file in photos/, which tools/make-polaroids.py holds to the polaroid wall's
promises for every photograph on the street: alt text, consent, no metadata, no
filter, withdrawal by deletion. This tool refuses an id with no record, a record
that does not name this page, and a file that is not there. With no photograph
yet, the wall holds its frames and says so; it never fills them from anywhere.

WHAT IT REFUSES IN THE ROOM'S OWN VOICE, with the negation window, so the room
can still say what it has none of:

  - A MOVING LIGHT BEFORE A PRESS, OR A FLASH AFTER ONE: §118 may hold no
    keyframe, animation or transition, because the fire, the wisps and the
    colour drift are mountain-man.js's and run only once the switch is pressed;
    and that script keeps nothing, sends nothing, asks for no microphone and
    howls no louder than MAX_GAIN, which this refuses above 0.2.
  - THE VOCABULARY OF CONQUEST AND ACHIEVEMENT. A summit is exactly where it
    arrives: conquered, peak performance, pushing through, earning the view. The
    track up is long and slow with a bench at every turn, so that everybody gets
    up, and the view is not a prize for anything.
  - A HOT SPRING SOLD AS A CURE, OR A SCENT SOLD AS ONE. Mineral water, healing
    waters, good for your joints, a spa, a detox, a remedy: Stay Frosty's rule,
    warm. The spring is water, the oils on the diffuser's shelf (Helen's list:
    lavender, chamomile, tea tree, orange blossom, chocolate, marshmallow,
    cupcakes) are smells, and the room says nothing about what any of them does
    for a body. Every oil in the script's SCENTS is named on the page.
  - INSPIRATION, BRAVERY AND OVERCOMING: Laughingstock's rule, in a room with
    somebody's name on the door.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import html
import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / "tools"
DATA = ROOT / "data/mountain-cabin.json"
POLAROIDS = ROOT / "data/polaroids.json"
PAGE = ROOT / "the-mountain-cabin.html"
NOTES = ROOT / "liner-notes.html"
SCRIPT = ROOT / "mountain-man.js"
CSS = ROOT / "love.css"
SECTION = 118
SCREEN = ("big", "the big screen")
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December"]
PHOTO_SUFFIXES = (".jpg", ".jpeg", ".png", ".webp")

problems = []


def refuse(msg):
    problems.append(msg)


def tool(name):
    spec = importlib.util.spec_from_file_location(name.replace("-", "_"), TOOLS / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


hgc = tool("make-hey-good-cookin")
NEGATION = hgc.NEGATION


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


def day(iso):
    y, m, dd = (int(x) for x in iso.split("-"))
    return f"{dd} {MONTHS[m - 1]} {y}"


def swap(page, marker, block, indent=""):
    src = page.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to write.\n"
            "Put them back rather than letting this tool go quiet -- a generator that\n"
            "writes nothing and exits 0 is how two surfaces drift apart.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda _m: begin + "\n" + block + "\n" + indent + end,
                           src, flags=re.S))


# ── The voice ────────────────────────────────────────────────────────────────

VOCAB = [
    (r"conquer(?:s|ed|ing)?|conquests?|peak performance|summit fever|personal bests?|"
     r"push(?:ed|es|ing)? (?:yourself|through|past|harder)|no pain,? no gain|hustl(?:e|ed|ing)|"
     r"crush(?:ed|ing)? it|man up|toughen up|earn(?:s|ed|ing)? (?:the|your|a) (?:view|rest|place|seat)|"
     r"bag(?:s|ged|ging)? (?:a |the )?(?:peak|summit)",
     "the vocabulary of conquest: the track up is slow with a bench at every turn, and the view is "
     "not a prize"),
    (r"\bspas?\b|wellness|detox(?:ing|es)?|healing waters?|therapeutic|cures?|cured|remedy|remedies|"
     r"good for (?:your|the) (?:skin|joints|circulation|nerves|back|body)|mineral waters?",
     "the hot spring sold as a cure (Stay Frosty's rule, warm): it is water, and nothing it does "
     "for a body is claimed here"),
    (r"inspir(?:ing|ational)|an inspiration|brave|courageous|overcom(?:e|es|ing)",
     "Laughingstock's rule, in a room with somebody's name on the door"),
    (r"big bad wol(?:f|ves)|savage|ferocious|bloodthirsty|man-?eat\w*|vicious|prowl(?:s|ed|ing)?",
     "the wolves are the mountain's and are not drawn as a threat for atmosphere (All Needs Met's rule "
     "for the wild neighbours)"),
    (r"\b(?:canis|lupus)\b", "a Latin name: the herbarium's rule, and nothing out here is a field guide"),
]


def sweep(text, where):
    text = html.unescape(re.sub(r"<[^>]+>", " ", str(text)))
    for pat, why in VOCAB:
        for m in re.finditer(rf"(?<!\w)(?:{pat})(?!\w)", text, re.I):
            window = text[max(0, m.start() - 80):m.end()]
            if re.search(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{pat})", window, re.I):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")


# ── The checks on the room's own data ────────────────────────────────────────

VIDEO_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
LIST_ID = re.compile(r"^PL[A-Za-z0-9_-]{11,32}$")
CHANNEL_ID = re.compile(r"^UC[A-Za-z0-9_-]{22}$")
RUNTIME = re.compile(r"^(?:\d{1,2}:)?[0-5]?\d:[0-5]\d$")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def check_data(d):
    if not DATE.match(d.get("_checked", "")):
        refuse("_checked is not a date; the room prints the day the playlist was read.")
    pl = d.get("playlist") or {}
    if not LIST_ID.match(pl.get("list", "")):
        refuse(f"the playlist id {pl.get('list')!r} is not a playlist id.")
    if "runtime" in pl:
        refuse("the playlist carries a runtime. It is David's list and he can add to it, so a total "
               "here would be wrong the next time he did. Every VIDEO carries one; the list never does.")
    for f in ("title", "by", "channel_url", "opens", "note"):
        if not str(pl.get(f, "")).strip():
            refuse(f"the playlist has no {f}.")
    sweep(pl.get("note", ""), "the playlist's note")
    if pl.get("title") != d.get("title_playlist", pl.get("title")):
        refuse("the playlist's title disagrees with itself.")
    vids = d.get("videos") or []
    if not vids:
        refuse("no videos on the rack. The rack mirrors the playlist, and a playlist with nothing "
               "on it is not one to put on a screen.")
    seen = set()
    for i, v in enumerate(vids):
        where = f"video {i + 1} ({v.get('id')})"
        if not VIDEO_ID.match(v.get("id", "")):
            refuse(f"{where}: not a YouTube id. love-embed.js would build nothing and say nothing.")
        if v.get("id") in seen:
            refuse(f"{where}: on the rack twice.")
        seen.add(v.get("id"))
        for f in ("title", "channel"):
            if not str(v.get(f, "")).strip():
                refuse(f"{where}: no {f}.")
        if not CHANNEL_ID.match(v.get("channel_id", "")):
            refuse(f"{where}: no channel id, so the credits cannot link the channel.")
        if not RUNTIME.match(str(v.get("runtime", ""))):
            refuse(f"{where}: no runtime. Every press-to-play control on this street says how long "
                   "before the press.")
        if not DATE.match(v.get("published", "")):
            refuse(f"{where}: no publication date.")
        if "note" in v:
            sweep(v["note"], f"{where}'s note")
    if vids and pl.get("opens") != vids[0].get("id"):
        refuse(f"the playlist opens on {pl.get('opens')!r} and the rack's first row is "
               f"{vids[0].get('id')!r}. The first entry decides whether the whole playlist embeds, "
               "so it is the first row of the rack, read off the playlist and not remembered.")
    ph = d.get("photos") or {}
    for f in ("where", "when"):
        if not str(ph.get(f, "")).strip():
            refuse(f"photos: no {f}.")
    records = {p["id"]: p for p in json.loads(POLAROIDS.read_text()).get("photos", [])
               if isinstance(p, dict) and "id" in p}
    for pid in ph.get("ids") or []:
        rec = records.get(pid)
        if not rec:
            refuse(f"photo {pid!r} has no record in data/polaroids.json. A photograph goes up only "
                   "with its record: alt text, whose it is, consent and when.")
            continue
        if rec.get("on_wall", True) or PAGE.name not in (rec.get("elsewhere") or []):
            refuse(f"photo {pid!r}'s record does not say it hangs on {PAGE.name} (on_wall false, "
                   "elsewhere naming the page).")
        if not any((ROOT / "photos" / f"{pid}{s}").exists() for s in PHOTO_SUFFIXES):
            refuse(f"photo {pid!r} has a record and no file in photos/.")
    cg = d.get("congress") or {}
    for f in ("short", "name", "theme", "city", "dates", "url", "read"):
        if not str(cg.get(f, "")).strip():
            refuse(f"congress: no {f}; the wall says where the photographs were taken and where that was read.")
    dv = d.get("david") or {}
    for f in ("name", "role", "site", "read"):
        if not str(dv.get(f, "")).strip():
            refuse(f"david: no {f}.")
    if not dv.get("site", "").startswith("https://"):
        refuse("david: the site is not an https address.")


# ── The big screen and its rack ──────────────────────────────────────────────

def screen_block(d):
    sid, sname = SCREEN
    pl = d["playlist"]
    lid = attr(pl["list"])
    out = [
        '    <div class="efw-plate" data-efw-plate>',
        f'    <div class="efw-screen" data-rack-screen="{sid}" data-rack-off="The whole playlist is off until you put it back.">',
        f'      <button type="button" class="facade" data-embed-src="https://www.youtube-nocookie.com/embed/videoseries?list={lid}&amp;autoplay=1" data-embed-title="{attr(pl["title"])}, David&rsquo;s playlist on YouTube">',
        f'        Put on <i>{esc(pl["title"])}</i> &mdash; the whole playlist, in David&rsquo;s order, and it runs until you stop it',
        '        <span class="facade__play">&#9654; PRESS PLAY</span>',
        '      </button>',
        '    </div>',
        f'    <p class="efw-screen__now" data-rack-now="{sid}" tabindex="-1" hidden></p>',
        f'    <p class="efw-screen__back" hidden><button type="button" class="efw-btn" data-rack-back="{sid}">Take it off and put the whole playlist back</button></p>',
        f'    <p class="efw-screen__credit"><a href="https://www.youtube.com/playlist?list={lid}">{esc(pl["title"])}</a>, on YouTube, by <a href="{attr(pl["channel_url"])}">{esc(pl["by"])}</a>. {esc(pl["note"])}</p>',
        '    </div>',
        '    <details class="efw-rack" open>',
        '      <summary class="efw-rack__sum">What is on it, one press each</summary>',
        '      <ul class="efw-rows">',
    ]
    for v in d["videos"]:
        t, c, r = esc(v["title"]), esc(v["channel"]), v["runtime"]
        out += [
            '        <li class="efw-row" data-rack-card>',
            f'          <h3 class="efw-row__title">{t}</h3>',
            f'          <p class="efw-row__by">{c} &middot; {day(v["published"])} &middot; {r}</p>',
            f'          <button type="button" class="facade" data-embed-id="{v["id"]}" data-embed-title="{attr(v["channel"])} &mdash; {attr(v["title"])}">',
            f'            Play it here &mdash; {r}',
            '            <span class="facade__play">&#9654; PRESS PLAY</span>',
            '          </button>',
            f'          <button type="button" class="efw-btn mtn-row__up" hidden data-rack-to="{sid}" data-rack-name="{sname}" '
            f'data-rack-src="https://www.youtube-nocookie.com/embed/{v["id"]}?autoplay=1&amp;rel=0" '
            f'data-rack-title="{attr(v["channel"])} &mdash; {attr(v["title"])}, on {sname}" data-rack-film="{attr(v["title"])}" '
            f'data-rack-runtime="{r}">Put it on {sname} &mdash; {r}</button>',
            '        </li>']
    out += [
        '      </ul>',
        f'      <p class="efw-from">Read off the playlist on {esc(day(d["_checked"]))}, in its own order. The playlist is David&rsquo;s and he can add to it, so the whole thing can run on past this rack, which catches up when somebody reads the playlist again.</p>',
        '    </details>']
    return "\n".join(out)


# ── The wall ─────────────────────────────────────────────────────────────────

def wall_block(d):
    ph, cg = d["photos"], d["congress"]
    records = {p["id"]: p for p in json.loads(POLAROIDS.read_text()).get("photos", [])
               if isinstance(p, dict) and "id" in p}
    out = [
        f'    <p class="efw-wall__where">Every photograph on this wall is David&rsquo;s own, taken on {esc(ph["where"])}, '
        f'in {esc(ph["when"])}, at the {esc(cg["short"])} congress in {esc(cg["city"])}, {esc(cg["dates"])}: '
        f'{esc(cg["short"])} is {esc(cg["name"])}, and that year&rsquo;s congress was called '
        f'<i>{esc(cg["theme"])}</i>. Read off <a href="{attr(cg["url"])}">isps.org</a> on {esc(cg["read"])}.</p>']
    ids = ph.get("ids") or []
    if not ids:
        out += [
            '    <p class="efw-wall__wait">None of them is here yet. A photograph goes up only once it has arrived with its record, which is <a href="polaroids.html">the polaroid wall&rsquo;s</a> rule and holds in every room on the street; until then the window opens onto a note saying it is waiting for David&rsquo;s pictures, and nothing from anywhere else stands in for them.</p>']
        return "\n".join(out)
    out.append('    <div class="efw-wall">')
    for pid in ids:
        rec = records[pid]
        file = next(f"{pid}{s}" for s in PHOTO_SUFFIXES if (ROOT / "photos" / f"{pid}{s}").exists())
        cap = rec.get("caption") or ""
        out += [
            '      <figure class="efw-photo">',
            f'        <img class="photo" src="photos/{file}" alt="{attr(rec["alt"])}" loading="lazy" decoding="async">',
            f'        <figcaption>{esc(cap)}</figcaption>' if cap else '        <figcaption class="sr">A photograph of David&rsquo;s.</figcaption>',
            '      </figure>']
    out.append('    </div>')
    return "\n".join(out)


def gallery_block(d):
    """What the window opens onto: every photograph on the wall, one at a time
    to scroll through, or the note that it is waiting."""
    ph = d["photos"]
    records = {p["id"]: p for p in json.loads(POLAROIDS.read_text()).get("photos", [])
               if isinstance(p, dict) and "id" in p}
    ids = ph.get("ids") or []
    if not ids:
        return ('    <p class="efw-gallery__wait">The window is waiting for David&rsquo;s pictures. When his photographs of '
                f'{esc(ph["where"])} are here with their records, they will open here, one at a time; nothing else '
                'will be put in the window in the meantime.</p>')
    out = ['    <div class="efw-gallery__scroll">']
    for pid in ids:
        rec = records[pid]
        file = next(f"{pid}{s}" for s in PHOTO_SUFFIXES if (ROOT / "photos" / f"{pid}{s}").exists())
        cap = rec.get("caption") or ""
        out += ['      <figure class="efw-gallery__photo">',
                f'        <img class="photo" src="photos/{file}" alt="{attr(rec["alt"])}" loading="lazy" decoding="async">',
                f'        <figcaption>{esc(cap)}</figcaption>' if cap else '        <figcaption class="sr">A photograph of David&rsquo;s.</figcaption>',
                '      </figure>']
    out.append('    </div>')
    return "\n".join(out)


# ── The credits ──────────────────────────────────────────────────────────────

def liner_sources(d):
    pl, cg, dv, ph = d["playlist"], d["congress"], d["david"], d["photos"]
    chans = []
    for v in d["videos"]:
        link = f'<a href="https://www.youtube.com/channel/{v["channel_id"]}">{esc(v["channel"])}</a>'
        if link not in chans:
            chans.append(link)
    rows = [
        ("Who David is and what he makes",
         f'<a href="{attr(dv["site"])}">{esc(dv["site"].replace("https://", ""))}</a>, his own page, read {esc(dv["read"])}, which '
         f'lists what he makes and names him {esc(dv["role"])}. That he works with Helen Edgar and Ryan Boren and knows Jess '
         f'and others in the Stimpunks community is Helen&rsquo;s own line, passed on with the brief, and so is the name he is '
         f'credited by here'),
        ("The howl", 'Made in the browser with its own oscillators by <code>mountain-man.js</code> when the button is '
                     'pressed: three voices, one after another, about five seconds. No recording of any wolf, nothing fetched, '
                     'nothing hosted'),
        ("The rainbow sweets", 'Skittles, David&rsquo;s favourite, which the room names once; Skittles is a trade mark of '
                               'Mars Wrigley, which is not affiliated with Stimpunks'),
        ("The playlist on the big screen",
         f'<a href="https://www.youtube.com/playlist?list={attr(pl["list"])}">{esc(pl["title"])}</a>, by '
         f'<a href="{attr(pl["channel_url"])}">{esc(pl["by"])}</a> on YouTube, read off its own page {esc(d["_checked"])}, '
         f'put on whole in its own order and never given a runtime'),
        ("Every video on the rack",
         "Its title, channel and length, read off its own watch page on YouTube the same day, each on its own channel: "
         + (", ".join(chans[:-1]) + " and " + chans[-1] if len(chans) > 1 else chans[0])
         + ". None of them is affiliated with Stimpunks, and nothing of theirs is hosted here"),
        ("Where the photographs were taken",
         f'The {esc(cg["short"])} congress, <i>{esc(cg["theme"])}</i>, {esc(cg["city"])}, {esc(cg["dates"])}, read off '
         f'<a href="{attr(cg["url"])}">isps.org</a> {esc(cg["read"])}; that they are from {esc(ph["where"])} is Helen&rsquo;s line with the brief'),
        ("The photographs",
         (f'David&rsquo;s own, each with its record in <code>data/polaroids.json</code>, excluded from the site&rsquo;s licence like every photograph here'
          if ph.get("ids") else
          'David&rsquo;s own, and none is up yet: the frames wait on the wall, and each photograph goes up with its record in '
          '<code>data/polaroids.json</code>, excluded from the site&rsquo;s licence like every photograph here')),
    ]
    return "\n".join(f'      <tr><td>{w}</td><td>{src}</td></tr>' for w, src in rows)


# ── The page as written ──────────────────────────────────────────────────────

def check_page():
    src = PAGE.read_text()
    for want, why in (('src="love-embed.js"', "it does not load love-embed.js, so every press would do nothing"),
                      ('src="rack.js"', "it does not load rack.js, so nothing could go up on the big screen"),
                      ('src="quest.js"', "it does not load quest.js"),
                      ('src="mountain-man.js"', "it does not load mountain-man.js, so the switch, the lights, the howl and the window would do nothing"),
                      ('data-efw-plate', "the big screen's plate is not inside the thing the one switch puts away"),
                      ('data-efw-window', "the window in the drawing is not marked as the way to the photographs"),
                      ('data-efw-gallery', "it has no window to open onto the photographs"),
                      ('href="campgrounds.html"', "it has no way back down to the campgrounds"),
                      ('data-rack-screen="big"', "it has no big screen for the rack to put a video on"),
                      ('class="neighbours"', "it has no neighbours line (tools/make-neighbours.py writes it)")):
        if want not in src:
            refuse(f"{PAGE.name}: {why}.")
    plain = re.sub(r"<script\b.*?</script>", " ", src, flags=re.S)
    plain = re.sub(r"<!--.*?-->", " ", plain, flags=re.S)
    plain = re.sub(r"<blockquote\b.*?</blockquote>", " ", plain, flags=re.S)
    plain = re.sub(r"[“].*?[”]", " ", plain, flags=re.S)
    # The rack's titles and bylines are the channels' words, and the playlist's
    # title is David's; none of them is ours to sweep.
    plain = re.sub(r'<(h3|p) class="efw-row__(?:title|by)">.*?</\1>', " ", plain, flags=re.S)
    plain = re.sub(r"data-embed-title=\"[^\"]*\"|data-rack-(?:title|film)=\"[^\"]*\"", " ", plain)
    sweep(plain, PAGE.name)
    camp = (ROOT / "campgrounds.html").read_text()
    if f'href="{PAGE.name}"' not in camp:
        refuse("campgrounds.html has no sign for the summit, so nobody on the field can find the way up.")
    js = re.sub(r"/\*.*?\*/", " ", SCRIPT.read_text(), flags=re.S)
    js = re.sub(r"(?m)^\s*//[^\n]*", " ", js)
    if re.search(r"localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource", js):
        refuse(f"{SCRIPT.name} stores or sends something. The switch remembers nothing and the howl reaches nobody.")
    if re.search(r"getUserMedia|getDisplayMedia|MediaRecorder", js):
        refuse(f"{SCRIPT.name} asks for a microphone, a camera or the screen.")
    m = re.search(r"MAX_GAIN\s*=\s*([0-9.]+)", js)
    if not m or float(m.group(1)) > 0.2:
        refuse(f"{SCRIPT.name}: MAX_GAIN is missing or over 0.2, the Repeater's ceiling.")
    if "innerHTML" in js:
        refuse(f"{SCRIPT.name} writes markup from a string.")
    # Every oil on the diffuser's shelf is named on the page, in the room's
    # own words, so the words and the button cannot disagree about what is in.
    m = re.search(r"SCENTS\s*=\s*\[([^\]]*)\]", js)
    scents = re.findall(r"'([^']+)'", m.group(1)) if m else []
    if not scents:
        refuse(f"{SCRIPT.name} has no SCENTS list for the diffuser.")
    for sc in scents:
        if sc not in plain:
            refuse(f"{PAGE.name} never names {sc!r}, which is on the diffuser's shelf in {SCRIPT.name}.")


def section_css():
    css = CSS.read_text()
    m = re.search(rf"/\* §{SECTION} ── THE SUMMIT: The Emergent Future Worlds Meets Mountain Man.*?(?=/\* §\d+ ── )", css, re.S)
    if not m:
        refuse(f"love.css has no §{SECTION} for The Emergent Future Worlds Meets Mountain Man, followed by another section.")
        return
    body = re.sub(r"/\*.*?\*/", " ", m.group(0), flags=re.S)
    if re.search(r"#[0-9a-fA-F]{3,6}\b|rgba?\(", body):
        refuse(f"love.css §{SECTION} has a literal colour in it; the room's colours are --efw- custom properties.")
    if re.search(r"@keyframes|animation\s*:|transition\s*:", body):
        refuse(f"love.css §{SECTION} animates something. Nothing in the cabin moves before a press, and what moves after one is mountain-man.js's.")
    if re.search(r"transform\s*:\s*(?:rotate|skew)", body):
        refuse(f"love.css §{SECTION} tilts something.")


def main():
    d = json.loads(DATA.read_text())
    check_data(d)
    for k in ("_what", "_source", "_drift"):
        sweep(d.get(k, ""), f"{DATA.name} {k}")
    if problems:
        print("REFUSING:\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    swap(PAGE, "mtn:screen", screen_block(d), "    ")
    swap(PAGE, "mtn:wall", wall_block(d), "    ")
    swap(PAGE, "mtn:gallery", gallery_block(d), "    ")
    swap(NOTES, "cabin-sources", liner_sources(d), "      ")
    check_page()
    section_css()
    if problems:
        print("REFUSING (the page as written):\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    up = len(d["photos"].get("ids") or [])
    print("mountain man: the big screen, its rack, the wall and the window"
          f"{' (waiting for the photographs)' if not up else ''} and the credits written; no cure, "
          "no conquest, no wolf drawn as a threat, and the playlist carries no runtime")


if __name__ == "__main__":
    main()
