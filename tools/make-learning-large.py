#!/usr/bin/env python3
"""Build Learning Large out of data/learning-large.json and
data/learning-large-month.json: the glasshouse, the two spectra, every
quotation, a model's peaks and troughs, the practices, the propagation bench,
the sowing log, the bench screen, the rack, and the room's credits in the liner
notes.

WHAT THE ROOM IS. A glasshouse at night with every grow lamp on. Ryan Boren's
brief, 2026-10-03: a room about learning, making and knowledge gardening with
generative AI, with the emphasis on our spiky profiles and how they can
complement each other, pulling its material from our AI hub, and a rack with
the latest month from AI channels he listed. The tagline is his: Models are
spiky. Humans are too. Learning, making, and knowledge gardening, together.

EVERY QUOTATION IS WORDS ON ONE OF OUR PAGES, looked for word for word in the
Knowledge System mirror's copy of that page on every build. The Town Hall's
rule about a page somebody else keeps: when our page changes, re-copy the
quotation, never loosen the check. Without the mirror it says it could not
check and carries on. It also refuses a quotation over the data file's cap, one
with no marker in the page or a marker with no quotation, a quotation shaped
like verse, somebody else's words without the work they come from, and a
stimpunks.org address without its trailing slash.

THE PRACTICES AND THE PROPAGATION BENCH are our Competency Networks page's
practices and our AI Collaboration page's diagram, word for word and in their
order, looked for in the mirror the same way.

A MODEL'S PEAKS AND TROUGHS are ours, and each one names the page of ours that
says it. A line with no page is refused: the room claims nothing about any
model that our pages do not already say.

THE SOWING LOG is this street's own, out of its changelog: every entry names
the changelog entry where it was written up, and the words it has. A missing id
or missing words is refused, and it is fixed here, never in the changelog.

THE RACK, out of data/learning-large-month.json, is The Open Notebook's monthly
log in a glasshouse, and the reasons are that room's and the kitchen telly's:
tools/pull-large-month.py reads each channel's own feeds on the morning timer in
tools/daily-large.sh, which runs this with --month so that only the rack is
rewritten. It refuses a video older than the month, a row carrying a
description, a thumbnail or a count, a screen with no runtime, a door with no
reason, an id twice, and a channel not in the list. THE TITLES ARE THE
CHANNELS' AND ARE NOT SWEPT: some of them call a model a genius or an employee,
or sell it as a way to get rich quick, which is theirs to say, beside the
guardrails of ours that the room prints.

THE BENCH SCREEN IS ONE SCREEN FOR THE WHOLE RACK, with nothing of its own on
it: it ships hidden and rack.js unhides it, the Doom Scoop's empty screen. A
short goes up upright, because its second button carries data-rack-shape="tall".

OUR OWN SENTENCES ARE SWEPT, with make-vital.py's negation window so the room
can still say what it refuses, for three vocabularies:

  - A MODEL GIVEN A MIND. "The model understands", "the AI knows", "your AI
    friend". Our AI Collaboration page names anthropomorphisation as one of the
    two biggest guardrails, and an AI room is where a friendly sentence would
    break it first. A model writes, drafts, predicts and gets things wrong; it
    does not think, know, understand, feel, want or care, in our voice.
  - THE SALES PITCH. Superpower, magic, revolutionary, game-changer, 10x,
    supercharge, effortless. Our hub says not neutral, not magic, and
    "superpower" is also the word the autism-as-superpower framing uses on
    Autistic people, which is two reasons.
  - A TALLY. Nothing in here is counted or ranked, the sowing log least of all.

The quotations, the rack, the sowing log's changelog words and the job marker
are cut out first.

THE PAGE HAS NOWHERE TO TYPE AND NO SCRIPT OF ITS OWN, and that is the room's
first refusal rather than an accident: How this site is made says nothing a
visitor does here is sent to an AI, and an AI room is the one most likely to
grow a chat box. It refuses a form, an input, a textarea, a select or anything
editable outside the job marker, and any script but love.js, love-embed.js,
rack.js and quest.js. It refuses the sparkles, robot and brain emoji anywhere
outside the rack, because a model drawn as a sparkle, a robot or a brain is
the anthropomorphising this room is careful about, in picture form.

THERE IS NO GREEN IN THIS ROOM, AND THAT IS PHYSICS. The lamps are the old red
and blue kind, so they give a leaf the two colours it takes in and none of the
green it turns away, and under them a leaf has nothing green to give back. The
tool reads every --ll- colour in love.css's :root and every literal colour in
§92 and refuses a green one, the Lightbulb Picture House's palette check for
this room's own reason. The friendly edit is "make the seedlings green, they
are plants"; under this light they are not.

THE DRAWINGS ARE MADE HERE, from one function each, so the seedlings' heights,
the lamps and the shadows come out of numbers rather than by hand, and nothing
in them moves at any setting.

It writes nothing if anything is refused. Run it after editing either data
file, then make-og.py, because the share card lifts the drawing off the page.
"""
import colorsys
import html
import json
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/learning-large.json"
MONTHLY = ROOT / "data/learning-large-month.json"
PAGE = ROOT / "learning-large.html"
NOTES = ROOT / "liner-notes.html"
CHANGELOG = ROOT / "changelog.html"
DESIGN = ROOT / "design.html"
CSS = ROOT / "love.css"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"

YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
CHANNEL = re.compile(r"^UC[A-Za-z0-9_-]{22}$")
HERE = ZoneInfo("America/Denver")
MONTH = 30           # days kept; tools/pull-large-month.py holds the same number
SCREEN = ("ll", "the bench screen")
SECTION = 92         # love.css's section for this room

LOG_KEYS = {"id", "source", "form", "title", "published", "state", "why", "runs", "channel"}
LOG_STATES = {"screen", "door", "pending", "gone"}
DOOR_WHY = {"no embedding": "Its channel has switched off showing it on other sites, so it plays on YouTube and not in here.",
            "age-gated": "YouTube shows it only to signed-in adults, so it plays there and not in here."}
QUOTE_KEYS = {"key", "page", "said", "by", "work", "work_url", "via", "after", "after_url", "own_voice"}

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|can't|does not|doesn't|do not|don't|won't|will not|is not|are not|isn't|"
            r"aren't|nobody|nor|declin\w+)")
# A MODEL GIVEN A MIND. The subject is narrow on purpose, words that only ever
# name a model, so "people know" and "you understand" go through; "it" is not
# here, because it names everything.
MIND = (r"(?:the |a |an |your |our |any )?(?:models?|AI|LLMs?|language models?|chatbots?|"
        r"assistants?|Claude|machines?)\s+(?:\w+\s+){0,2}?"
        r"(?:thinks?|thought|understands?|understood|knows?|knew|feels?|felt|wants?|wanted|"
        r"believes?|cares?|loves?|means? it)")
MATE = (r"(?:AI|model|chatbot|assistant|Claude)\s+(?:friends?|companions?|buddy|buddies|"
        r"teammates?|colleagues?|co-?workers?|employees?|interns?)")
HYPE = (r"superpowers?|magic(?:al)?|revolution(?:ary|i[sz]e\w*)|game[- ]chang\w+|10x|"
        r"supercharg\w+|effortless\w*|unlock(?:s|ed|ing)? your|genius")
TALLY = (r"scores?|scored|scoring|streaks?|leaderboards?|tall(?:y|ies)|tallied|"
         r"most popular|ranked|rankings?|top (?:\d+|three|five|ten)")
VOCAB = [
    (MIND, "a model given a mind. Our AI Collaboration page names anthropomorphisation as one of "
           "its two biggest guardrails: in our voice a model writes, drafts, predicts and gets "
           "things wrong, and it does not think, know, understand, feel, want or care."),
    (MATE, "a model given a job title or a friendship. It is a tool, which is the whole of what "
           "the guardrail asks."),
    (HYPE, "the sales pitch. Our hub says not neutral, not magic, and superpower is also the word "
           "the autism-as-superpower framing uses on Autistic people."),
    (TALLY, "nothing in here is counted or ranked, and the sowing log least of all: it is a log "
            "of how things get caught, not of whose mistakes they were."),
]
MASCOTS = {"✨": "the sparkles emoji", "\U0001F916": "the robot emoji", "\U0001F9E0": "the brain emoji"}

problems = []


def refuse(msg):
    problems.append(msg)


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


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


def sweep(text, where):
    text = re.sub(r"<[^>]+>", " ", str(text))
    text = html.unescape(text)
    for pat, why in VOCAB:
        for m in re.finditer(rf"\b(?:{pat})\b", text, re.I):
            window = text[max(0, m.start() - 80):m.end()]
            if re.search(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{pat})", window, re.I):
                continue
            # A model DOES not think: the negation can sit inside the match.
            if re.search(rf"\b{NEGATION}\b", m.group(0), re.I):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")


def utc(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)


def clock(n):
    h, rest = divmod(int(n), 3600)
    m, sec = divmod(rest, 60)
    return f"{h}:{m:02d}:{sec:02d}" if h else f"{m}:{sec:02d}"


def spoken(n):
    n = int(n)
    if n < 60:
        return f"{n} second{'s' if n != 1 else ''}"
    h, m = divmod(round(n / 60), 60)
    if h:
        return f"{h} hr {m} min" if m else f"{h} hr"
    return f"{m} min"


def day(dt):
    t = dt.astimezone(HERE)
    return f"{t.strftime('%A')} {t.day} {t.strftime('%B')}"


# ── The mirror ───────────────────────────────────────────────────────────────

def plain(md):
    """The mirror's markdown as words: images out, links to their words,
    emphasis marks out, whitespace folded. Read the same way on both sides, so
    a quotation is compared as words and never as markup."""
    t = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", md)
    t = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", t)
    t = re.sub(r"\*+", "", t)
    t = t.replace("`", "")
    return re.sub(r"\s+", " ", t)


_read = {}


def mirror(d, key):
    """The page's words, or None if the mirror is not on this machine."""
    if key not in _read:
        f = MIRROR / d["pages"][key]["file"]
        _read[key] = plain(f.read_text()) if f.exists() else None
    return _read[key]


def check_pages(d):
    for k, p in (d.get("pages") or {}).items():
        for f in ("title", "url", "file"):
            if not (p.get(f) or "").strip():
                refuse(f"the page {k!r} has no {f}.")
        u = p.get("url", "")
        if u.startswith("https://stimpunks.org/") and not u.endswith("/"):
            refuse(f"{u} has no trailing slash, and stimpunks.org answers that with a redirect, "
                   "which there counts as a failure.")
        if MIRROR.exists() and not (MIRROR / p.get("file", "")).exists():
            refuse(f"the mirror has no {p.get('file')} for {p.get('title')!r}. Re-read the page; "
                   "do not quote it from memory.")
    if not MIRROR.exists():
        print("make-learning-large: the Knowledge System mirror is not on this machine, so the "
              "quotations were not checked against our pages. They were last time it was.")


def found(d, key, words, what):
    src = mirror(d, key)
    if src is None:
        return
    if plain(words) not in src:
        refuse(f"{what} {words[:60]!r} is not on {d['pages'][key]['title']!r} as the mirror has it. "
               "Re-copy it from the page; do not loosen this.")


# ── The quotations ───────────────────────────────────────────────────────────

def check_quotes(d):
    pages = d.get("pages") or {}
    cap = d.get("cap")
    if not isinstance(cap, int) or cap <= 0:
        refuse("data/learning-large.json has no `cap` on how long a quotation may be.")
        cap = 0
    seen = set()
    page = PAGE.read_text()
    for q in d.get("quotes") or []:
        k = q.get("key")
        extra = set(q) - QUOTE_KEYS
        if extra:
            refuse(f"the quotation {k!r} carries {sorted(extra)}. See _quotes.")
        if not k or k in seen:
            refuse(f"the quotation {k!r} has no key, or a key another one has.")
        seen.add(k)
        if q.get("page") not in pages:
            refuse(f"the quotation {k!r} names the page {q.get('page')!r}, which is not in `pages`.")
            continue
        said = q.get("said") or ""
        if not said.strip():
            refuse(f"the quotation {k!r} has no words.")
        if cap and len(said.split()) > cap:
            refuse(f"the quotation {k!r} runs to {len(said.split())} words, over the cap of {cap}. "
                   "Point at the page instead of carrying it.")
        lines = [ln for ln in said.split("\n") if ln.strip()]
        if len(lines) > 2:
            refuse(f"the quotation {k!r} is shaped like verse. Nothing in here sets a lyric.")
        if q.get("by") and not q.get("own_voice") and not (q.get("work") and q.get("work_url")):
            refuse(f"the quotation {k!r} is {q['by']}'s and does not say which work it is from.")
        if q.get("after") and not q.get("after_url"):
            refuse(f"the quotation {k!r} is after {q['after']} and does not link them.")
        found(d, q["page"], said, f"the quotation {k!r},")
        if f"<!-- ll:quote:{k}:begin -->" not in page:
            refuse(f"the quotation {k!r} has no ll:quote:{k} markers in the page, so it would be "
                   "checked and never shown.")
    for m in re.findall(r"<!-- ll:quote:([\w-]+):begin -->", page):
        if m not in seen:
            refuse(f"the page has ll:quote:{m} markers and the data has no quotation {m!r}.")


def quote_html(q, d):
    p = d["pages"][q["page"]]
    ours = f'<a href="{attr(p["url"])}">{esc(p["title"])}</a>'
    if q.get("own_voice"):
        cite = f'{esc(q["by"])}, in his own voice, on {ours}'
    elif q.get("by"):
        work = f'<a href="{attr(q["work_url"])}"><i>{esc(q["work"])}</i></a>'
        via = f'{esc(q["via"])} ' if q.get("via") else ""
        # A title that ends a sentence of its own ends this one: "useful., as
        # quoted" is two stops in a row, so the credit starts again after it.
        joint = " As" if q["work"].rstrip()[-1:] in ".!?" else ", as"
        cite = (f'{esc(q["by"])}, {via}{work}{joint} quoted on our page {ours}, and read there rather '
                'than in the original')
    elif q.get("after"):
        cite = f'Our page {ours}, after <a href="{attr(q["after_url"])}">{esc(q["after"])}</a>'
    else:
        cite = f'Our page {ours}'
    return (f'    <figure class="ll-quote">\n'
            f'      <blockquote><p>{esc(q["said"])}</p></blockquote>\n'
            f'      <figcaption>&mdash; {cite}</figcaption>\n'
            f'    </figure>')


# ── Peaks and troughs, the practices, the bench ──────────────────────────────

def page_link(d, key):
    if key == "street":
        return '<a href="design.html#ai">How this site is made</a>'
    p = d["pages"][key]
    return f'<a href="{attr(p["url"])}">{esc(p["title"])}</a>'


def check_profile(d):
    for side in ("peaks", "troughs"):
        rows = d.get(side) or []
        if not rows:
            refuse(f"data/learning-large.json has no {side}.")
        for r in rows:
            if not (r.get("say") or "").strip():
                refuse(f"a line in {side} has no words.")
            if r.get("page") != "street" and r.get("page") not in (d.get("pages") or {}):
                refuse(f"{side}: {r.get('say', '')[:50]!r} names no page of ours. The room claims "
                       "nothing about any model that our pages do not already say.")


def profile(d):
    out = []
    for side, head, cls in (("peaks", "Where a model is strong", "peaks"),
                            ("troughs", "Where it is weak", "troughs")):
        out += [f'    <section class="ll-profile ll-profile--{cls}" aria-labelledby="ll-{cls}-h">',
                f'      <h4 id="ll-{cls}-h" class="ll-profile__name">{head}</h4>',
                '      <ul class="ll-profile__list">']
        out += [f'        <li>{esc(r["say"])} <span class="ll-profile__src">({page_link(d, r["page"])})</span></li>'
                for r in d[side]]
        out += ['      </ul>', '    </section>']
    return "\n".join(out)


def check_practices(d):
    pr = d.get("practices") or {}
    if pr.get("page") not in (d.get("pages") or {}):
        refuse("the practices name no page of ours.")
        return
    found(d, pr["page"], pr.get("heading", ""), "the practices' heading")
    for it in pr.get("items") or []:
        found(d, pr["page"], it, "the practice")
    if not pr.get("items"):
        refuse("data/learning-large.json lists no practices.")


def practices(d):
    pr = d["practices"]
    p = d["pages"][pr["page"]]
    out = ['    <ol class="ll-practices">']
    out += [f'      <li>{esc(i)}</li>' for i in pr["items"]]
    out += ['    </ol>',
            f'    <p class="ll-cite">&mdash; The first sentence of each, word for word, from &ldquo;{esc(pr["heading"])}&rdquo; '
            f'on our page <a href="{attr(p["url"])}">{esc(p["title"])}</a>, where each one goes on.</p>']
    return "\n".join(out)


def check_diagram(d):
    dg = d.get("diagram") or {}
    if dg.get("page") not in (d.get("pages") or {}):
        refuse("the propagation bench names no page of ours.")
        return
    stages = dg.get("stages") or {}
    steps = dg.get("steps") or []
    if not steps:
        refuse("the propagation bench has no steps.")
    for s in steps:
        if s.get("stage") not in stages:
            refuse(f"the step {s.get('step')!r} is at a stage {s.get('stage')!r} the bench does not have.")
        found(d, dg["page"], s.get("step", ""), "the step")
    order = [s.get("stage") for s in steps]
    if order and [k for i, k in enumerate(order) if i == 0 or k != order[i - 1]] != list(stages):
        refuse("the propagation bench's stages are not each in one run, in the order `stages` lists "
               "them. AI is in the middle of the process, not at the beginning or end.")
    # IN ORDER, each looked for after the one before it: the words of a step
    # also turn up in the page's prose ("conversations" does, well before the
    # diagram), so finding each one anywhere and comparing positions answers a
    # question about the prose and not about the diagram.
    src = mirror(d, dg["page"])
    if src is not None:
        at = src.find(steps[0]["step"]) if steps else -1
        for s in steps[1:]:
            if at < 0:
                break
            at = src.find(s["step"], at + 1)
        if at < 0:
            refuse("the propagation bench's steps are not in the order our page has them.")


def diagram(d):
    dg = d["diagram"]
    p = d["pages"][dg["page"]]
    out = ['    <ol class="ll-bench">']
    for key, label in dg["stages"].items():
        mine = [s for s in dg["steps"] if s["stage"] == key]
        out.append(f'      <li class="ll-bench__stage ll-bench__stage--{key}">')
        out.append(f'        <p class="ll-bench__where">{esc(label)}</p>')
        out.append('        <ol class="ll-bench__steps">')
        out += [f'          <li>{esc(s["step"])}</li>' for s in mine]
        out.append('        </ol>')
        out.append('      </li>')
    out += ['    </ol>',
            f'    <p class="ll-cite">&mdash; Every step word for word and in its order, from the diagram on our page '
            f'<a href="{attr(p["url"])}">{esc(p["title"])}</a>. Which part of the glasshouse each one '
            'happens in is ours, and follows that page&rsquo;s own sentence about it.</p>']
    return "\n".join(out)


# ── The sowing log ───────────────────────────────────────────────────────────

def changelog_entries():
    src = CHANGELOG.read_text()
    out = {}
    for m in re.finditer(r'<h2 id="([^"]+)">(.*?)</h2>(.*?)(?=<h2 id="|</main>)', src, re.S):
        out[m.group(1)] = (m.group(2), re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", m.group(3)))))
    return out


def check_log(d):
    entries = changelog_entries()
    seen = set()
    for e in d.get("log") or []:
        t = e.get("title") or e.get("entry")
        for f in ("entry", "title", "came", "caught", "now"):
            if not (e.get(f) or "").strip():
                refuse(f"the sowing log's {t!r} has no {f}.")
        if e.get("entry") in seen:
            refuse(f"the sowing log names {e.get('entry')} twice.")
        seen.add(e.get("entry"))
        if e.get("entry") not in entries:
            refuse(f"the sowing log's {t!r} names {e.get('entry')!r}, which changelog.html has no "
                   "entry for. Fix it here; the changelog is never edited to agree.")
            continue
        body = re.sub(r"\s+", " ", entries[e["entry"]][1])
        if not e.get("holds"):
            refuse(f"the sowing log's {t!r} holds no words of its entry, so nothing checks it.")
        for h in e.get("holds") or []:
            if h not in body:
                refuse(f"the sowing log's {t!r}: its entry no longer says {h!r}. Fix it here; the "
                       "changelog is never edited to agree.")
    if not d.get("log"):
        refuse("the sowing log is empty.")
    st = d.get("street") or {}
    words = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", DESIGN.read_text())))
    if not st.get("said") or st["said"] not in words:
        refuse("How this site is made no longer says what the sowing log stands on. Re-read it and "
               "re-copy the sentence.")


def entry_date(eid):
    dt = datetime.strptime(eid[:10], "%Y-%m-%d")
    return f"{dt.day} {dt.strftime('%B')}"


def sowing_log(d):
    out = ['    <figure class="ll-quote">',
           f'      <blockquote><p>{esc(d["street"]["said"])}</p></blockquote>',
           f'      <figcaption>&mdash; <a href="{attr(d["street"]["page"])}">How this site is made</a>, '
           'this street&rsquo;s own account of how it is built</figcaption>',
           '    </figure>',
           '    <ol class="ll-log">']
    for e in sorted(d["log"], key=lambda e: e["entry"]):
        out += ['      <li class="ll-log__row">',
                f'        <p class="ll-log__label"><span class="ll-log__date">{esc(entry_date(e["entry"]))}</span> '
                f'<span class="ll-log__title">{esc(e["title"])}</span></p>',
                '        <dl class="ll-log__parts">',
                f'          <div><dt>What came up</dt><dd>{esc(e["came"])}</dd></div>',
                f'          <div><dt>Who or what noticed</dt><dd>{esc(e["caught"])}</dd></div>',
                f'          <div><dt>What holds it now</dt><dd>{esc(e["now"])}</dd></div>',
                '        </dl>',
                f'        <p class="ll-log__go"><a href="changelog.html#{attr(e["entry"])}">The day it was written up</a></p>',
                '      </li>']
    out.append('    </ol>')
    return "\n".join(out)


# ── The glasshouse, drawn ────────────────────────────────────────────────────
# The roof glass is dark, because it is night outside, and it shows the lamps
# back rather than the sky: a lit room behind glass at night turns the glass
# into a mirror. Under the roof, one lamp bar of red and blue diodes on chains,
# its light falling on a shelf of seed trays. The seedlings come up at
# different heights, which is the room's whole subject as a picture, and every
# one is a dark silhouette rimmed by the lamp: under red and blue light a leaf
# has no green to give back. Each tray throws two shadows, a red one and a blue
# one, because the two colours come from diodes side by side: where the blue is
# blocked you see red, and the other way round.

GH_W, GH_H = 1000, 340
EAVE = 112
LAMP_Y = 150
SHELF_Y = 296
TRAYS = [(78, 338), (382, 642), (686, 946)]
HEIGHTS = [34, 58, 22, 71, 40, 15, 63, 49, 27,
           66, 19, 52, 38, 74, 30, 45, 12, 60,
           25, 69, 43, 17, 56, 36, 77, 21, 50]


def seedling(x, top, h):
    y = top - h
    s = [f'<path d="M{x} {top} V{y}" stroke="var(--ll-leaf)" stroke-width="3.2" stroke-linecap="round"/>']
    for sgn in (-1, 1):
        a = x + sgn * 6
        b = x + sgn * 15
        c = x + sgn * 18
        d2 = x + sgn * 12
        e = x + sgn * 5
        leaf = (f"M{x} {y} C{a} {y - 9} {b} {y - 8} {c} {y - 3} "
                f"C{d2} {y + 1} {e} {y + 1} {x} {y} Z")
        rim = f"M{x} {y} C{a} {y - 9} {b} {y - 8} {c} {y - 3}"
        s.append(f'<path d="{leaf}" fill="var(--ll-leaf)"/>')
        s.append(f'<path d="{rim}" fill="none" stroke="var(--ll-rim)" stroke-width="1.3" stroke-linecap="round"/>')
    return "".join(s)


def glasshouse_svg():
    s = [f'  <svg class="ll-glasshouse" viewBox="0 0 {GH_W} {GH_H}" aria-hidden="true" focusable="false">',
         '<defs><linearGradient id="ll-glow" x1="0" y1="0" x2="0" y2="1">'
         '<stop offset="0" stop-color="var(--ll-lamp)" stop-opacity=".62"/>'
         '<stop offset="1" stop-color="var(--ll-lamp)" stop-opacity="0"/></linearGradient></defs>',
         f'<rect width="{GH_W}" height="{GH_H}" rx="18" fill="var(--ll-night)"/>',
         f'<rect width="{GH_W}" height="{EAVE}" rx="18" fill="var(--ll-glass)"/>']
    # The roof's panes, each showing the lamp bar back as a streak.
    for x in range(0, GH_W, 100):
        s.append(f'<path d="M{x + 18} 36 H{x + 82}" stroke="var(--ll-lamp)" stroke-width="3" '
                 'stroke-linecap="round" opacity=".5"/>')
        s.append(f'<path d="M{x + 30} 74 H{x + 70}" stroke="var(--ll-lamp)" stroke-width="2" '
                 'stroke-linecap="round" opacity=".32"/>')
    for x in range(100, GH_W, 100):
        s.append(f'<path d="M{x} 0 V{EAVE}" stroke="var(--ll-bar)" stroke-width="5"/>')
    s.append(f'<rect y="{EAVE - 6}" width="{GH_W}" height="10" fill="var(--ll-bar)"/>')
    # The lamp on its chains, and its light on the shelf.
    for x in (150, 850):
        s.append(f'<path d="M{x} {EAVE + 4} V{LAMP_Y}" stroke="var(--ll-bar)" stroke-width="2" '
                 'stroke-dasharray="3 3"/>')
    s.append(f'<path d="M60 {LAMP_Y + 16} H940 L1000 {SHELF_Y + 4} H0 Z" fill="url(#ll-glow)"/>')
    s.append(f'<rect x="60" y="{LAMP_Y}" width="880" height="14" rx="4" fill="var(--ll-bar)"/>')
    for i, x in enumerate(range(72, 932, 14)):
        ink = "--ll-red" if i % 2 == 0 else "--ll-blue"
        s.append(f'<circle cx="{x}" cy="{LAMP_Y + 16}" r="2.6" fill="var({ink})"/>')
    # The trays, each with its two shadows, and the seedlings in them.
    top = SHELF_Y - 28
    for (a, b) in TRAYS:
        s.append(f'<rect x="{a - 5}" y="{top + 6}" width="{b - a}" height="28" rx="3" fill="var(--ll-red)" opacity=".7"/>')
        s.append(f'<rect x="{a + 5}" y="{top + 6}" width="{b - a}" height="28" rx="3" fill="var(--ll-blue)" opacity=".7"/>')
    i = 0
    for (a, b) in TRAYS:
        for k in range(9):
            x = a + 18 + k * ((b - a - 36) / 8)
            s.append(seedling(round(x, 1), top, HEIGHTS[i]))
            i += 1
        s.append(f'<rect x="{a}" y="{top}" width="{b - a}" height="28" rx="3" fill="var(--ll-tray)"/>')
        s.append(f'<path d="M{a + 2} {top + 1} H{b - 2}" stroke="var(--ll-rim)" stroke-width="2"/>')
    s.append(f'<rect x="20" y="{SHELF_Y}" width="{GH_W - 40}" height="8" rx="2" fill="var(--ll-bar)"/>')
    s.append('</svg>')
    return "".join(s)


# ── The two spectra ──────────────────────────────────────────────────────────
# What the lamp gives and what a leaf takes in, drawn by eye from the shape of
# the thing rather than plotted from any measurement, and the page says so. The
# axis runs from blue on the left to red on the right, and the word green is
# written in the trough, in the plain ink of the page: in here, green is the
# part of the light nobody has.

SP_W, SP_H = 640, 236
BASE = 186


def spike(cx, w, h):
    return (f"M{cx - w * 3} {BASE} C{cx - w} {BASE} {cx - w * .6} {BASE - h} {cx} {BASE - h} "
            f"C{cx + w * .6} {BASE - h} {cx + w} {BASE} {cx + w * 3} {BASE} Z")


def spectrum_svg():
    leaf = (f"M40 {BASE - 40} C80 {BASE - 120} 140 {BASE - 140} 170 {BASE - 118} "
            f"C210 {BASE - 88} 240 {BASE - 26} 320 {BASE - 18} "
            f"C390 {BASE - 12} 420 {BASE - 60} 470 {BASE - 104} "
            f"C500 {BASE - 128} 530 {BASE - 96} 560 {BASE - 30} L600 {BASE - 8}")
    return "".join([
        f'  <svg class="ll-spectrum" viewBox="0 0 {SP_W} {SP_H}" aria-hidden="true" focusable="false">',
        f'<rect width="{SP_W}" height="{SP_H}" rx="12" fill="var(--ll-tray)"/>',
        f'<path d="{spike(160, 14, 150)}" fill="var(--ll-blue)"/>',
        f'<path d="{spike(482, 14, 150)}" fill="var(--ll-red)"/>',
        f'<path d="{leaf}" fill="none" stroke="var(--ll-text)" stroke-width="3" stroke-dasharray="9 7" stroke-linecap="round"/>',
        f'<path d="M30 {BASE} H610" stroke="var(--ll-dim)" stroke-width="2"/>',
        f'<text class="ll-spectrum__axis" x="160" y="{BASE + 32}" text-anchor="middle">blue</text>',
        f'<text class="ll-spectrum__axis" x="320" y="{BASE + 32}" text-anchor="middle">green</text>',
        f'<text class="ll-spectrum__axis" x="482" y="{BASE + 32}" text-anchor="middle">red</text>',
        '<text class="ll-spectrum__key" x="196" y="40">the lamp: two spikes</text>',
        '<text class="ll-spectrum__key" x="236" y="112">a leaf: two humps</text>',
        '</svg>'])


# ── The bench screen and the rack ────────────────────────────────────────────

def bench_screen():
    return "\n".join([
        f'    <div class="ll-screen" data-rack-screen="{SCREEN[0]}" tabindex="-1" hidden>',
        '      <p class="ll-screen__idle"><span><b>The bench screen.</b> Nothing is on it. Any video on the rack '
        'can go up here with the button under it, and nothing loads until you press one.</span></p>',
        '    </div>',
        f'    <p class="ll-screen__now" data-rack-now="{SCREEN[0]}" tabindex="-1" hidden></p>',
        f'    <p class="ll-screen__back" hidden><button type="button" class="ll-back" '
        f'data-rack-back="{SCREEN[0]}">Take it off the bench screen</button></p>'])


def card(v, sub):
    tall = v["form"] == "short"
    runs = v.get("runs")
    head = (f'          <li class="ll-card{" ll-card--short" if tall else ""}"'
            f'{" data-rack-card" if v["state"] == "screen" else ""}>\n'
            f'            <p class="ll-card__title">{esc(v["title"])}</p>\n'
            f'            <p class="ll-card__by">{sub}</p>\n')
    full = f'{attr(v["title"])}, on YouTube via {attr(v["channel"])}'
    if v["state"] == "screen":
        body = (f'            <button type="button" class="facade" data-embed-id="{v["id"]}" '
                f'data-embed-title="{full}">\n'
                f'              Play &mdash; {esc(spoken(runs))}\n'
                f'              <span class="facade__play">&#9654; PRESS PLAY</span>\n'
                f'            </button>\n'
                f'            <button type="button" class="ll-card__up" hidden data-rack-to="{SCREEN[0]}" '
                f'data-rack-name="{SCREEN[1]}" '
                f'data-rack-src="https://www.youtube-nocookie.com/embed/{v["id"]}?autoplay=1&amp;rel=0" '
                f'data-rack-title="{full}, on {SCREEN[1]}" '
                f'data-rack-film="{attr(v["title"])}" data-rack-runtime="{clock(runs)}"'
                + (' data-rack-shape="tall"' if tall else "") +
                f'>Put it on {SCREEN[1]} &mdash; {esc(spoken(runs))}</button>\n')
    else:
        how = f" &mdash; {esc(spoken(runs))}" if runs else ""
        body = (f'            <a class="ll-card__door" href="https://www.youtube.com/watch?v={v["id"]}">'
                f'Watch on YouTube{how} &rarr;</a>\n'
                f'            <p class="ll-card__why">{esc(DOOR_WHY[v["why"]])}</p>\n')
    return head + body + '          </li>'


def card_list(rows, label, render):
    """Videos, then shorts, each in its own list: a short's card is tall, and a
    row of mixed cards stretches the long ones to match it."""
    out = []
    for form in ("long", "short"):
        mine = [v for v in rows if v["form"] == form]
        if mine:
            out.append(f'        <ul class="ll-cards{" ll-cards--short" if form == "short" else ""}" '
                       f'aria-label="{attr(label)}, {"shorts" if form == "short" else "videos"}">')
            out += [render(v) for v in mine]
            out.append('        </ul>')
    return out


def set_time(r):
    return datetime.strptime(r["set"], "%Y-%m-%dT%H:%MZ").replace(tzinfo=timezone.utc)


def check_month(r):
    srcs = {}
    for s in r.get("sources") or []:
        for f in ("slug", "name", "url", "channel_id"):
            if not (s.get(f) or "").strip():
                refuse(f"a channel on the rack has no {f}: {s}")
        if not (s.get("url") or "").startswith("https://www.youtube.com/@"):
            refuse(f"{s.get('name')!r}'s address is not a YouTube channel's own page.")
        if not CHANNEL.match(s.get("channel_id") or ""):
            refuse(f"{s.get('name')!r} has {s.get('channel_id')!r}, which is not a channel id.")
        if s.get("slug") in srcs:
            refuse(f"the channel {s['slug']!r} is listed twice.")
        srcs[s.get("slug")] = s
    if not srcs:
        refuse("data/learning-large-month.json lists no channels, so the rack would be a heading "
               "over nothing.")
    if not r.get("set"):
        refuse("data/learning-large-month.json has no `set` time. Run tools/pull-large-month.py; "
               "the room prints when the rack was filled.")
        return
    oldest = set_time(r) - timedelta(days=MONTH, minutes=1)
    seen = set()
    for v in r.get("log") or []:
        t = (v.get("title") or "")[:40] or v.get("id")
        extra = set(v) - LOG_KEYS
        if extra:
            refuse(f"the rack's {t!r} carries {sorted(extra)}. A video is an id, a title, a channel, "
                   "a time and a length; nothing is read to you and nothing is counted.")
        if not YT.match(v.get("id") or ""):
            refuse(f"the rack's {t!r} has {v.get('id')!r}, which is not a YouTube id.")
        if v.get("source") not in srcs:
            refuse(f"the rack's {t!r} is from {v.get('source')!r}, which is not one of the channels.")
        if v.get("form") not in ("long", "short"):
            refuse(f"the rack's {t!r} does not say whether it is long-form or a short.")
        if v.get("state") not in LOG_STATES:
            refuse(f"the rack's {t!r} is in the state {v.get('state')!r}, which this does not know.")
        if not v.get("published") or utc(v["published"]) < oldest:
            refuse(f"the rack's {t!r} was published {v.get('published')}, more than a month before "
                   "the rack was filled. The older ones go off the end; this is not an archive.")
        if v.get("state") in ("screen", "door"):
            if v["id"] in seen:
                refuse(f"{v['id']} is on the rack twice.")
            seen.add(v["id"])
            if not (v.get("title") or "").strip():
                refuse(f"{v['id']} on the rack has no title.")
            if not (v.get("channel") or "").strip():
                refuse(f"the rack's {t!r} does not say whose channel it is on.")
        if v.get("state") == "screen" and not (isinstance(v.get("runs"), int) and v["runs"] > 0):
            refuse(f"the rack's {t!r} is a screen with no runtime. Every press in here says how "
                   "long before the press.")
        if v.get("state") == "door" and v.get("why") not in DOOR_WHY:
            refuse(f"the rack's {t!r} is a door with no reason this knows ({v.get('why')!r}), and a "
                   "door that does not say why looks like a broken screen.")


def covered(spans, a, b):
    return any(utc(x) <= a and utc(y) >= b for x, y in spans)


def listify(names):
    names = [esc(n) for n in names]
    return names[0] if len(names) == 1 else ", ".join(names[:-1]) + " and " + names[-1]


def month(r):
    when = set_time(r)
    start = when - timedelta(days=MONTH)
    t = when.astimezone(HERE)
    at = f"{t.strftime('%I').lstrip('0')}:{t.strftime('%M')} {t.strftime('%p').lower()}"
    live = [v for v in r["log"] if v["state"] in ("screen", "door")]
    out = [f'    <p class="ll-rack__set">The rack was last filled at <b>{at} on {esc(day(when))}</b>, '
           f'Mountain time, with what each channel put up since {esc(day(start))}. Anything on it can '
           'go up on the bench screen.</p>',
           '    <details class="ll-racked" open>',
           '      <summary>A month of their videos, newest first under each channel</summary>']
    quiet = []
    for s in r["sources"]:
        mine = sorted((v for v in live if v["source"] == s["slug"]),
                      key=lambda v: (v["published"], v["id"]), reverse=True)
        cov = r.get("covered", {}).get(s["slug"], {})
        # A MINUTE OF SLACK, The Open Notebook's: `set` is kept to the minute
        # and the puller's coverage to the second.
        gaps = [f for f in ("long", "short")
                if not covered(cov.get(f, []), start + timedelta(minutes=1), when)]
        if not mine and not gaps:
            quiet.append(s["name"])
            continue
        block = [f'      <section class="ll-chan" aria-label="{attr(s["name"])}">',
                 f'        <h3 class="ll-chan__name"><a href="{attr(s["url"])}">{esc(s["name"])}</a></h3>']
        if gaps:
            what = {"long": "videos", "short": "shorts"}
            block.append(f'        <p class="ll-chan__gap">Its {" and ".join(what[f] for f in gaps)} feed did not '
                         'reach back a whole month the last time it was read, so some of its month may be '
                         'missing here. It fills in as the mornings go by.</p>')
        if not mine:
            block.append('        <p class="ll-chan__none">Nothing from this channel in what the feeds reached.</p>')

        def render(v):
            runs = v.get("runs")
            sub = esc(day(utc(v["published"]))) + (f" &middot; {clock(runs)}" if runs else "")
            return card(v, sub)

        block += card_list(mine, s["name"], render)
        block.append('      </section>')
        out += block
    if quiet:
        out.append(f'      <p class="ll-rack__quiet">Nothing from {listify(quiet)} this month.</p>')
    out.append('    </details>')
    return "\n".join(out)


# ── The liner notes ──────────────────────────────────────────────────────────

def liner_quotes(d):
    rows = []
    for q in d["quotes"]:
        p = d["pages"][q["page"]]
        whose = esc(q["by"]) if q.get("by") else "ours"
        rows.append(f'      <tr><td>{esc(q["said"])}</td><td>{whose}</td>'
                    f'<td><a href="{attr(p["url"])}">{esc(p["title"])}</a></td></tr>')
    return "\n".join(rows)


def liner_month(r):
    return "\n".join(f'      <tr><td><a href="{attr(s["url"])}">{esc(s["name"])}</a></td>'
                     f'<td>its videos and its shorts, the latest month of each</td></tr>'
                     for s in r["sources"])


# ── The page as written, and the palette ─────────────────────────────────────

def no_green():
    css = CSS.read_text()
    root = re.findall(r"--ll-[\w-]+:\s*(#[0-9A-Fa-f]{6})", css)
    m = re.search(rf"/\* §{SECTION} ── ROOM: Learning Large.*?(?=/\* §{SECTION + 1} ──)", css, re.S)
    if not root:
        refuse("love.css declares no --ll- colours, so there is no palette to hold.")
    if not m:
        refuse(f"love.css has no §{SECTION} for Learning Large, so there is nothing to check.")
        lit = []
    else:
        body = re.sub(r"/\*.*?\*/", " ", m.group(0), flags=re.S)
        lit = re.findall(r"#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b", body)
    for h in root + lit:
        x = h.lstrip("#")
        if len(x) == 3:
            x = "".join(c * 2 for c in x)
        r, g, b = (int(x[i:i + 2], 16) / 255 for i in (0, 2, 4))
        hue, light, sat = colorsys.rgb_to_hls(r, g, b)
        if sat > 0.12 and 70 <= hue * 360 <= 170 and 0.06 < light < 0.97:
            refuse(f"{h} in Learning Large is green (hue {round(hue * 360)}). There is no green in this "
                   "room's light: the lamps give a leaf red and blue, and a leaf has nothing green to "
                   "give back under them.")


def sweep_page():
    src = PAGE.read_text()
    body = src[src.index("<main"):src.index("</main>")]
    rack = re.search(r"<!-- ll:month:begin -->.*?<!-- ll:month:end -->", body, re.S)
    for marker in ("ll:month", "ll:glasshouse", "ll:spectrum", "ll:practices", "ll:diagram", "ll:log"):
        body = re.sub(rf"<!-- {marker}:begin -->.*?<!-- {marker}:end -->", " ", body, flags=re.S)
    body = re.sub(r"<!-- ll:quote:[\w-]+:begin -->.*?<!-- ll:quote:[\w-]+:end -->", " ", body, flags=re.S)
    body = re.sub(r"<!-- quest:[\w-]+:begin -->.*?<!-- quest:[\w-]+:end -->", " ", body, flags=re.S)
    body = re.sub(r"<blockquote.*?</blockquote>", " ", body, flags=re.S)
    body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)
    sweep(body, PAGE.name)
    head = src[:src.index("<main")]
    for ch, name in MASCOTS.items():
        rest = src.replace(rack.group(0), " ") if rack else src
        if ch in rest:
            refuse(f"{name} is on the page outside the rack. A model drawn as a sparkle, a robot or a "
                   "brain is the anthropomorphising this room is careful about, in picture form.")
    for name, tag in (("a form", r"<form\b"), ("an input", r"<input\b"), ("a textarea", r"<textarea\b"),
                      ("a select", r"<select\b"), ("something editable", r"contenteditable")):
        if re.search(tag, body, re.I):
            refuse(f"the room has {name} in it. Nothing you do here is sent to an AI, as How this site "
                   "is made says, and an AI room is the one most likely to grow a chat box.")
    scripts = re.findall(r'<script src="([^"]+)"', src)
    if sorted(scripts) != sorted(["love.js", "love-embed.js", "rack.js", "quest.js"]):
        refuse(f"the room loads {scripts}. It loads love.js, love-embed.js, rack.js and quest.js "
               "and nothing else: a script of its own would be the first thing in here that could "
               "send something somewhere.")
    if re.search(r"\bfetch\(|XMLHttpRequest|EventSource|WebSocket", src):
        refuse("the page asks the network for something by itself. Nothing in here reaches anywhere "
               "until somebody presses play.")
    ids = re.findall(r'\bid="([^"]+)"', src)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        refuse(f"ids with two owners on the page: {', '.join(dup)}")


def main():
    r = json.loads(MONTHLY.read_text())
    check_month(r)
    if "--month" in sys.argv[1:]:
        # THE MORNING TIMER'S PATH: the rack and nothing else, so a session's
        # edit to the rest of the page or to the liner notes is never touched by
        # a machine refilling the rack.
        if problems:
            print("REFUSING:\n  " + "\n  ".join(problems))
            sys.exit(1)
        swap(PAGE, "ll:month", month(r), "")
        live = [v for v in r["log"] if v["state"] in ("screen", "door")]
        print(f"learning large: the rack, filled {r['set']}, "
              f"{sum(v['state'] == 'screen' for v in live)} screens and "
              f"{sum(v['state'] == 'door' for v in live)} doors")
        return
    d = json.loads(DATA.read_text())
    check_pages(d)
    check_quotes(d)
    check_profile(d)
    check_practices(d)
    check_diagram(d)
    check_log(d)
    no_green()
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)
    swap(PAGE, "ll:glasshouse", glasshouse_svg(), "")
    swap(PAGE, "ll:spectrum", spectrum_svg(), "")
    for q in d["quotes"]:
        swap(PAGE, f"ll:quote:{q['key']}", quote_html(q, d), "    ")
    swap(PAGE, "ll:profile", profile(d), "")
    swap(PAGE, "ll:practices", practices(d), "")
    swap(PAGE, "ll:diagram", diagram(d), "")
    swap(PAGE, "ll:log", sowing_log(d), "")
    swap(PAGE, "ll:screen", bench_screen(), "")
    swap(PAGE, "ll:month", month(r), "")
    swap(NOTES, "large-quotes", liner_quotes(d), "      ")
    swap(NOTES, "large-month-credits", liner_month(r), "      ")
    sweep_page()
    if problems:
        print("REFUSING (the page as written):\n  " + "\n  ".join(problems))
        sys.exit(1)
    print("learning large: the glasshouse, the spectra, the quotations, the practices, the bench, "
          "the sowing log, the bench screen and the rack written")


if __name__ == "__main__":
    main()
