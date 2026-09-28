#!/usr/bin/env python3
"""Bring a room somebody built with their own AI onto the street.

    python3 tools/import-room.py path/to/artifact.html        # check it, write nothing
    python3 tools/import-room.py path/to/artifact.html --go   # and bring it in

WHAT IT IS FOR. Your Room hands out a prompt (your-room.html#with-your-ai) that
somebody gives Claude or another AI. It interviews them, builds the room as one
self-contained page they can keep changing, and ends the file with a comment
headed FOR THE STREET. This reads that comment and the page under it, holds both
to the street's rules, and turns the page into a room here: its own page, its
own section of love.css, its colours in :root, its script, a door on the front
page, its place in the walking order, a fractal recipe, and its credit in the
liner notes. Everything it wrote is between import markers and is replaced
whole when the same person sends a new version, which is what makes iterating
with their AI work: they change the artifact and it is imported again.

THE COMMENT IS READ, NEVER GUESSED AT. It is "Key: value" lines, lists as "- "
lines, and "none" where there is nothing, in exactly the shape the prompt
prints. An unknown key is a refusal rather than a line dropped on the floor, and
everything it claims is checked against the page: the slug against the body
class, the typefaces against what the CSS actually sets, the media against the
buttons, the credits against the typefaces and the AI's own name.

IT REFUSES RATHER THAN FIXES, WITH ONE EXCEPTION. A room that breaks one of the
four things Your Room says we keep is sent back, with every reason at once, and
the fix belongs in the artifact where the person can see it. The exception is
mechanical and loses nothing: a hex colour written out literally that is one of
the room's own declared colours becomes var() of that colour, because that is
what the prompt asked for and the result is identical. A colour that is not one
of its own is refused.

IT MEASURES THE ROOM IT IS ABOUT TO PUBLISH, not the artifact. The assembled
page, with the street's furniture in it and the new love.css under it, is
rendered by check-contrast-live.py's own probe and check-gentle.py's own probe,
imported rather than copied, so there is one probe for each question and this
cannot quietly disagree with the checkers that run after it. Text under the bar,
text standing on a gradient, anything still moving or tilted at Gentle, or words
that differ between Gentle and Regular: refused. What it measured is written to
data/rooms/<slug>.json as the room's pairs, which check-contrast.py reads, so the
pair list records the room the way it records every other room. Those entries
say they were measured by this tool and not chosen by a person, because they
were.

WHAT IT DOES NOT DO, ON PURPOSE, AND WHAT STOPS THE ROOM UNTIL SOMEBODY DOES:
  · THE SHARE CARD. A card design per room is the rule, and a template here is
    the one place it would be most tempting and least visible. make-og.py
    refuses the room until it has a card of its own.
  · THE JOB MARKER. A job and a drawing are somebody's decision. make-guild.py
    refuses the room until it has both, and the quest markers it writes into
    the page are carried over when the room is imported again.
  · CHECKING THE VIDEOS. That needs the network, so it is check-jukebox.py's,
    which reads data/rooms/*.json.
  · FONTS THE STREET DOES NOT HOST YET. Adding a face is its own job (the file
    in fonts/, its @font-face in §1, fonts/_sources.json, pull-foundry.py), and
    this refuses a room that sets one rather than loading it from Google.
  · PHOTOGRAPHS. They go through a consent record first, so a room waiting for
    one is refused until it arrives that way.

The door it writes is a plain one in the room's own colours and faces, which is
a starting point and not a design. The fractal recipe borrows the shape of a
recipe already on the street and draws it in the room's own colours.

A new section goes before the cross-cutting sections at the end of love.css, and
those are renumbered everywhere they are mentioned, which is CLAUDE.md's rule.
"""
import argparse
import hashlib
import html as H
import importlib.util
import json
import re
import subprocess
import sys
from datetime import date
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / "tools"
sys.path.insert(0, str(TOOLS))
import signoff  # noqa: E402  the sign-off, written once

TODAY = date.today().isoformat()
BASE = "https://stimpunks.world"


def load(name):
    """A sibling tool as a module, so its probe is used rather than copied."""
    spec = importlib.util.spec_from_file_location(name.replace("-", "_"), TOOLS / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


# ── The comment ──────────────────────────────────────────────────────────────

KEYS = ["name", "link", "pronouns", "say it", "slug", "prefix", "light", "typefaces",
        "media", "photographs", "words", "built with", "could not do"]
LISTS = {"typefaces", "media"}
NONE = re.compile(r"^(?:none|n/?a|-)\.?$", re.I)
NOTE = re.compile(r"<!--\s*FOR THE STREET\b(.*?)-->", re.S)
KEYLINE = re.compile(r"^([A-Za-z][A-Za-z ]{1,20}):(?:\s+(.*))?$")
SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
RUNTIME = re.compile(r"^\d{1,2}:\d{2}(?::\d{2})?$")
YT_ID = re.compile(r"(?:[?&]v=|youtu\.be/|/embed/|/shorts/|/live/)([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])")


def read_notes(src, problems):
    found = NOTE.findall(src)
    if not found:
        problems.append("There is no FOR THE STREET comment. The prompt asks the AI to put one at the "
                        "top of the file; without it there is nobody to credit and nothing to check "
                        "the page against.")
        return None
    if len(found) > 1:
        problems.append("There are two FOR THE STREET comments. Keep one, so there is one account.")
    notes, key = {}, None
    for raw in found[0].splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith("- "):
            if key not in LISTS:
                problems.append(f"FOR THE STREET: a list item under {key or 'nothing'!r}, which is not a list: {line!r}")
                continue
            notes[key].append(line[2:].strip())
            continue
        m = KEYLINE.match(line)
        if m:
            key = m.group(1).strip().lower()
            if key not in KEYS:
                problems.append(f"FOR THE STREET: unknown key {m.group(1)!r}. The keys are: "
                                + ", ".join(k.capitalize() for k in KEYS) + ".")
                key = None
                continue
            if key in notes:
                problems.append(f"FOR THE STREET: {m.group(1)!r} is given twice.")
            val = (m.group(2) or "").strip()
            if key in LISTS:
                notes[key] = [] if (not val or NONE.match(val)) else [v.strip() for v in val.split(";") if v.strip()]
            else:
                notes[key] = val
            continue
        if key and key not in LISTS:
            notes[key] = (notes[key] + " " + line).strip()
        else:
            problems.append(f"FOR THE STREET: cannot read this line: {line!r}")
    for k in KEYS:
        if k not in notes:
            problems.append(f"FOR THE STREET: no {k.capitalize()!r} line. Write 'none' if there is nothing.")
    for k in KEYS:
        if k not in LISTS and k in notes and NONE.match(notes[k] or "none"):
            notes[k] = None
    for k in ("name", "slug", "prefix", "light", "words", "built with"):
        if k in notes and not notes[k]:
            problems.append(f"FOR THE STREET: {k.capitalize()!r} cannot be none.")
    if notes.get("slug") and not SLUG.match(notes["slug"]):
        problems.append(f"FOR THE STREET: slug {notes['slug']!r} is not lowercase letters and numbers "
                        "with single hyphens.")
    if notes.get("prefix"):
        notes["prefix"] = notes["prefix"].strip().rstrip("-").lower()
        if not re.fullmatch(r"[a-z]{2,4}", notes["prefix"]):
            problems.append(f"FOR THE STREET: prefix {notes['prefix']!r} should be two to four letters.")
    if notes.get("link") and not re.match(r"^https://[^\s\"'<>]+$", notes["link"]):
        problems.append(f"FOR THE STREET: link {notes['link']!r} is not an https:// address.")
    media = []
    for item in notes.get("media", []):
        parts = [p.strip() for p in item.split("|")]
        if len(parts) != 4 or not all(parts):
            problems.append(f"FOR THE STREET: media {item!r} is not 'title | who made it | link | runtime'.")
            continue
        title, who, link, runtime = parts
        m = YT_ID.search(link)
        if not m or "list=" in link:
            problems.append(f"FOR THE STREET: media {title!r} is not a single YouTube video ({link}). "
                            "Only those become players here; link to anything else from the room.")
            continue
        if not RUNTIME.match(runtime):
            problems.append(f"FOR THE STREET: media {title!r} has runtime {runtime!r}; write it like 3:45. "
                            "Every player here says how long it runs before the press.")
            continue
        media.append({"title": title, "who": who, "link": link, "id": m.group(1), "runtime": runtime})
    notes["media"] = media
    if notes.get("photographs"):
        problems.append("FOR THE STREET says photographs are still to come: " + repr(notes["photographs"])
                        + ". A photograph goes through its consent record first (data/polaroids.json); "
                        "bring the room in without the space for it, then add the photograph that way.")
    return notes


# ── The page, as a tree with offsets ─────────────────────────────────────────

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param",
        "source", "track", "wbr"}


class Node:
    def __init__(self, tag, attrs, start, open_end, parent):
        self.tag, self.attrs, self.parent = tag, dict(attrs), parent
        self.attr_list = attrs
        self.start, self.open_end = start, open_end
        self.close_start = self.end = open_end
        self.children = []
        self.selfclose = False

    def walk(self):
        yield self
        for c in self.children:
            yield from c.walk()

    def inside(self, other):
        n = self
        while n:
            if n is other:
                return True
            n = n.parent
        return False


class Tree(HTMLParser):
    def __init__(self, src):
        super().__init__(convert_charrefs=True)
        self.src = src
        self.lines = [0] + [i + 1 for i, ch in enumerate(src) if ch == "\n"]
        self.root = Node("#root", [], 0, 0, None)
        self.root.close_start = self.root.end = len(src)
        self.stack = [self.root]
        self.feed(src)
        self.close()
        while len(self.stack) > 1:
            n = self.stack.pop()
            n.close_start = n.end = len(src)

    def off(self):
        line, col = self.getpos()
        return self.lines[line - 1] + col

    def _add(self, tag, attrs, closed):
        s = self.off()
        raw = self.get_starttag_text()
        n = Node(tag, attrs, s, s + len(raw), self.stack[-1])
        n.selfclose = raw.rstrip().endswith("/>")
        self.stack[-1].children.append(n)
        if not closed and tag not in VOID:
            self.stack.append(n)

    def handle_starttag(self, tag, attrs):
        self._add(tag, attrs, False)

    def handle_startendtag(self, tag, attrs):
        self._add(tag, attrs, True)

    def handle_endtag(self, tag):
        s = self.off()
        e = self.src.index(">", s) + 1
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                while len(self.stack) > i:
                    n = self.stack.pop()
                    if n.tag == tag and len(self.stack) == i:
                        n.close_start, n.end = s, e
                    else:
                        n.close_start = n.end = s
                return


def text_of(src, n):
    inner = src[n.open_end:n.close_start]
    inner = re.sub(r"<script\b.*?</script>|<style\b.*?</style>", " ", inner, flags=re.S | re.I)
    return re.sub(r"\s+", " ", H.unescape(re.sub(r"<[^>]+>", " ", inner))).strip()


def start_tag(tag, attrs, selfclose=False):
    """A start tag written back out. A self-closing one stays self-closing:
    inside <svg>, <circle> without its slash swallows everything after it."""
    out = [tag]
    for k, v in attrs:
        out.append(k if v is None else f'{k}="{H.escape(v, quote=True)}"')
    return "<" + " ".join(out) + ("/>" if selfclose else ">")


# ── Colour ───────────────────────────────────────────────────────────────────

NAMED = set("""aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue
blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan
darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen
darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey
darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite
forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink
indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral
lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen
lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta
maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue
mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin
navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen
paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red
rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue
slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white
whitesmoke yellow yellowgreen""".split())
NAMED_RE = re.compile(r"(?<![\w-])(" + "|".join(sorted(NAMED, key=len, reverse=True)) + r")(?![\w-])", re.I)
HEX_RE = re.compile(r"#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F\w-])")
FUNC_RE = re.compile(r"\b(rgba?|hsla?)\(([^)]*)\)", re.I)
OTHER_FUNC = re.compile(r"\b(color-mix|lab|lch|oklab|oklch|hwb|color)\(", re.I)
NO_COLOUR_PROPS = {"font-family", "font", "content", "grid-template-areas", "animation", "animation-name",
                   "transition", "transition-property", "will-change", "counter-reset",
                   "counter-increment", "quotes", "font-feature-settings", "font-variation-settings"}


def six(h):
    h = h.lower().lstrip("#")
    if len(h) in (3, 4):
        h = "".join(c * 2 for c in h)
    return "#" + h[:6]


def lum(hexstr):
    h = hexstr.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def ratio(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def alpha_of(args):
    parts = [p for p in re.split(r"[\s,/]+", args.strip()) if p]
    if len(parts) < 4:
        return 1.0
    a = parts[3]
    try:
        return float(a[:-1]) / 100 if a.endswith("%") else float(a)
    except ValueError:
        return 1.0


def masked_strings(text):
    """Blank out quoted strings and url(...) so a colour-looking token inside
    one (a font called Gold, an id in url(#xy-glow)) is not read as a colour."""
    text = re.sub(r"url\([^)]*\)", lambda m: " " * len(m.group(0)), text, flags=re.I)
    return re.sub(r"\"[^\"]*\"|'[^']*'", lambda m: " " * len(m.group(0)), text)


def colour_edits(value, palette, where, problems, prop=""):
    """Replacements inside one value that turn literal own-colours into var(),
    and refusals for any other literal solid colour."""
    if prop in NO_COLOUR_PROPS:
        return []
    m = masked_strings(value)
    edits = []
    for h in HEX_RE.finditer(m):
        raw = h.group(1)
        if len(raw) in (4, 8) and int(raw[-2:] if len(raw) == 8 else raw[-1] * 2, 16) < 255:
            continue  # translucent, which the prompt allows for shadows
        hx = six(raw)
        name = palette.get(hx)
        if name:
            edits.append((h.start(), h.end(), f"var({name})"))
        else:
            problems.append(f"{where}: colour {h.group(0)} is not one of the room's own declared colours. "
                            "Declare it once on :root with the prefix and use var().")
    for f in FUNC_RE.finditer(m):
        if alpha_of(f.group(2)) >= 1:
            problems.append(f"{where}: {f.group(0)} is a solid colour written out. Declare it as a hex "
                            "custom property on :root and use var(); rgba() is only for translucent shadows.")
    for f in OTHER_FUNC.finditer(m):
        problems.append(f"{where}: {f.group(1)}() is a colour this street cannot measure. Write it as a hex "
                        "custom property on :root.")
    for n in NAMED_RE.finditer(m):
        problems.append(f"{where}: named colour {n.group(0)!r}. Declare it as a hex custom property on :root "
                        "and use var().")
    return edits


def apply(text, edits):
    for s, e, rep in sorted(edits, key=lambda x: x[0], reverse=True):
        text = text[:s] + rep + text[e:]
    return text


# ── CSS ──────────────────────────────────────────────────────────────────────

GENERIC = {"serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "ui-serif",
           "ui-sans-serif", "ui-monospace", "ui-rounded", "math", "emoji", "fangsong", "inherit",
           "initial", "unset", "revert", "-apple-system", "blinkmacsystemfont", "segoe ui", "roboto",
           "helvetica", "helvetica neue", "arial", "georgia", "times new roman", "times", "courier new",
           "courier", "verdana", "tahoma", "trebuchet ms", "segoe ui emoji", "apple color emoji",
           "noto color emoji", "menlo", "monaco", "consolas", "liberation mono", "sf mono", "palatino",
           "garamond", "book antiqua", "lucida grande", "impact", "cambria", "calibri", "noto sans",
           "ubuntu", "cantarell", "fira sans", "droid sans", "open sans"}


def families(value):
    """The families in a font-family value, or in a font shorthand after its size."""
    v = re.sub(r"/\*.*?\*/", " ", value, flags=re.S).strip()
    if "var(" in v and "'" not in v and '"' not in v:
        return []
    out = []
    for part in re.split(r",(?![^(]*\))", v):
        part = part.strip().strip("'\"").strip()
        if part and part.lower() not in GENERIC and not part.startswith("var("):
            out.append(part)
    return out


def shorthand_families(value):
    m = re.search(r"(?:^|\s)[\d.]+(?:px|em|rem|%|pt|vw|vh|vmin|vmax|ex|ch|q|mm|cm|in)"
                  r"(?:\s*/\s*[\d.]+[a-z%]*)?\s+(.+)$", value.strip(), re.I)
    return families(m.group(1)) if m else []


def mask_css(css):
    """Comments to spaces and string contents to underscores, same length, so
    structure can be read by offset and values taken from the original."""
    out = re.sub(r"/\*.*?\*/", lambda m: " " * len(m.group(0)), css, flags=re.S)
    return re.sub(r"\"[^\"\n]*\"|'[^'\n]*'", lambda m: m.group(0)[0] + "_" * (len(m.group(0)) - 2) + m.group(0)[-1], out)


def match_brace(m, b):
    depth = 0
    for i in range(b, len(m)):
        if m[i] == "{":
            depth += 1
        elif m[i] == "}":
            depth -= 1
            if depth == 0:
                return i
    return -1


def split_depth(text, sep):
    parts, depth, start = [], 0, 0
    for i, ch in enumerate(text):
        if ch in "([":
            depth += 1
        elif ch in ")]":
            depth -= 1
        elif ch == sep and depth == 0:
            parts.append((start, i))
            start = i + 1
    parts.append((start, len(text)))
    return parts


class CSS:
    """One pass over the room's stylesheet: what it declares, what it sets,
    and whether every rule is the room's own."""

    AT_BLOCKS = {"media", "supports", "container"}

    def __init__(self, css, slug, prefix, problems):
        self.css, self.m, self.slug, self.prefix, self.problems = css, mask_css(css), slug, prefix, problems
        self.root = {}            # --name -> value
        self.uses, self.faces, self.keyframes, self.edits = set(), set(), [], []
        self.scope = re.compile(
            r"^(?:html(?:\[[^\]]*\]|:[\w-]+(?:\((?:[^()]|\([^()]*\))*\))?)*\s+(?:>\s*)?)?(?:body)?\.room-"
            + re.escape(slug) + r"(?![\w-])")
        self.palette = {}
        self._pass(collect=True)
        self.palette = {}
        for name, value in self.root.items():
            v = value.strip()
            if HEX_RE.fullmatch(v):
                self.palette.setdefault(six(v), name)
        self._pass(collect=False)
        for name in sorted(self.uses - set(self.root)):
            problems.append(f"CSS: var({name}) is used and never declared on :root. CSS paints nothing "
                            "for an unknown custom property, and nothing says so.")

    def _pass(self, collect):
        self._items(0, len(self.m), nested=False, collect=collect, keyframes=False)

    def _items(self, i, j, nested, collect, keyframes):
        m, k = self.m, i
        while k < j:
            while k < j and m[k] in " \t\r\n":
                k += 1
            if k >= j:
                break
            b, s = m.find("{", k, j), m.find(";", k, j)
            if s != -1 and (b == -1 or s < b):
                stmt = m[k:s].strip()
                if not collect:
                    if stmt.startswith("@import"):
                        if "fonts.googleapis.com" not in self.css[k:s]:
                            self.problems.append(f"CSS: {stmt[:60]} loads a stylesheet from elsewhere.")
                        else:
                            self.edits.append((k, s + 1, ""))
                    elif stmt:
                        self.problems.append(f"CSS: cannot read {stmt[:60]!r}.")
                k = s + 1
                continue
            if b == -1:
                if m[k:j].strip() and not collect:
                    self.problems.append(f"CSS: unfinished rule {m[k:j].strip()[:60]!r}.")
                break
            e = match_brace(m, b)
            if e == -1 or e > j:
                if not collect:
                    self.problems.append("CSS: a { is never closed.")
                break
            prelude = m[k:b].strip()
            if keyframes:
                self._decls(b + 1, e, collect, where=f"@keyframes {prelude}", root=False)
            elif prelude.startswith("@"):
                name = re.match(r"@([\w-]+)", prelude).group(1).lower()
                if name in self.AT_BLOCKS:
                    self._items(b + 1, e, True, collect, False)
                elif name.endswith("keyframes"):
                    kf = prelude.split(None, 1)[1].strip() if " " in prelude else ""
                    if not collect:
                        self.keyframes.append(kf)
                        if not kf.startswith(self.prefix + "-"):
                            self.problems.append(f"CSS: @keyframes {kf!r} does not start with {self.prefix}-. "
                                                 "An animation name is global across the whole street.")
                    self._items(b + 1, e, True, collect, True)
                elif not collect:
                    why = (" The street hosts every typeface itself; name the family and load it from "
                           "Google Fonts for the preview." if name == "font-face" else "")
                    self.problems.append(f"CSS: @{name} is not something the street can bring in.{why}")
            else:
                self._rule(prelude, k, b, e, nested, collect)
            k = e + 1

    def _rule(self, prelude, k, b, e, nested, collect):
        sels = [prelude[s:t].strip() for s, t in split_depth(prelude, ",")]
        if sels == [":root"]:
            if nested and not collect:
                self.problems.append("CSS: :root inside an @media or @supports block. A colour that changes "
                                     "with the screen is a colour the pair list cannot hold.")
            self._decls(b + 1, e, collect, where=":root", root=True)
            if not collect:
                # Its colours move to §2's :root, where check-contrast.py reads
                # them; a second copy here would be every name declared twice.
                self.edits.append((k, e + 1, ""))
            return
        if not collect:
            for sel in sels:
                if not self.scope.match(sel):
                    self.problems.append(f"CSS: selector {sel!r} does not start with .room-{self.slug}. "
                                         "Unscoped, it would restyle every room on the street.")
                    continue
                bare = re.sub(r"\[[^\]]*\]", "", sel)
                for cls in re.findall(r"\.(-?[A-Za-z_][\w-]*)", bare):
                    if cls != f"room-{self.slug}" and not cls.startswith(self.prefix + "-"):
                        self.problems.append(f"CSS: class .{cls} in {sel!r} does not start with "
                                             f"{self.prefix}-.")
        if "{" in self.m[b + 1:e]:
            if not collect:
                self.problems.append(f"CSS: a nested rule inside {prelude[:50]!r}. Write it out flat.")
            return
        self._decls(b + 1, e, collect, where=prelude[:50], root=False)

    def _decls(self, i, j, collect, where, root):
        body_m = self.m[i:j]
        for s, t in split_depth(body_m, ";"):
            chunk = body_m[s:t]
            if not chunk.strip():
                continue
            c = chunk.find(":")
            if c == -1:
                if not collect:
                    self.problems.append(f"CSS: cannot read {chunk.strip()[:50]!r} in {where}.")
                continue
            prop = chunk[:c].strip().lower()
            vs, ve = i + s + c + 1, i + t
            value = self.css[vs:ve]
            value_clean = re.sub(r"/\*.*?\*/", " ", value, flags=re.S).replace("!important", "").strip()
            if root:
                if collect:
                    self.root[prop] = value_clean
                    continue
                if not prop.startswith(f"--{self.prefix}-"):
                    self.problems.append(f"CSS: {prop} on :root. Only the room's own custom properties, "
                                         f"starting --{self.prefix}-, go on :root.")
                if HEX_RE.fullmatch(value_clean):
                    rx = HEX_RE.fullmatch(value_clean).group(1)
                    if len(rx) in (4, 8):
                        self.problems.append(f"CSS: {prop} is a translucent hex. Declare solid colours on "
                                             ":root; write translucency where it is used, as rgba().")
                elif FUNC_RE.search(masked_strings(value_clean)) or NAMED_RE.fullmatch(value_clean):
                    self.problems.append(f"CSS: {prop} is a colour not written as hex. Every colour on "
                                         ":root is a hex, so it can be measured.")
                for q in re.findall(r"\"([^\"]+)\"|'([^']+)'", value_clean):
                    name = (q[0] or q[1]).strip()
                    if name.lower() not in GENERIC:
                        self.faces.add(name)
                self.uses.update(re.findall(r"var\((--[\w-]+)", value_clean))
                continue
            if collect:
                continue
            self.uses.update(re.findall(r"var\((--[\w-]+)", value_clean))
            if prop == "font-family":
                self.faces.update(families(value_clean))
            elif prop == "font":
                self.faces.update(shorthand_families(value_clean))
            for es, ee, rep in colour_edits(value, self.palette, f"CSS {where} {{ {prop} }}",
                                            self.problems, prop):
                self.edits.append((vs + es, vs + ee, rep))

    def edited(self):
        return apply(self.css, self.edits)


# ── JavaScript ───────────────────────────────────────────────────────────────

JS_REFUSE = [
    (r"\bfetch\s*\(", "fetch() sends a request"),
    (r"XMLHttpRequest", "XMLHttpRequest sends a request"),
    (r"\bsendBeacon\b", "sendBeacon sends a request"),
    (r"\bWebSocket\b|\bEventSource\b", "it opens a connection"),
    (r"\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b", "it keeps something in the visitor's browser"),
    (r"document\.cookie", "it sets a cookie"),
    (r"\bgeolocation\b|\bgetUserMedia\b|\bmediaDevices\b", "it asks for the visitor's location, camera or microphone"),
    (r"\beval\s*\(|\bnew\s+Function\b", "it runs code from a string"),
    (r"\bimport\s*\(|\bimportScripts\b|\bnew\s+(?:Shared)?Worker\b", "it loads more code"),
    (r"https?://", "it names an address elsewhere"),
    (r"\bnew\s+Audio\b|\.autoplay\b", "it loads or starts a recording"),
]
# The one address a script may name: the SVG namespace, which createElementNS
# needs and which is a name rather than somewhere a request goes.
JS_NAMESPACES = re.compile(r"https?://www\.w3\.org/(?:2000/svg|1999/xlink|1999/xhtml)")
JS_WATCH = re.compile(r"\brequestAnimationFrame\b|\bsetInterval\b|\.animate\s*\(")


# ── The street's own pieces this writes into ────────────────────────────────

LOVE = ROOT / "love.css"
INDEX = ROOT / "index.html"
SITEMAP = TOOLS / "make-sitemap.py"
LINER = ROOT / "liner-notes.html"
FRACTALS = ROOT / "data" / "fractals.json"
ROOMS = ROOT / "data" / "rooms"
RESERVED_IDS = {"top", "main", "dial-label", "signoff-fx-about"}
FORBID = {"img", "picture", "source", "iframe", "frame", "frameset", "object", "embed", "audio",
          "video", "track", "form", "base", "portal", "applet"}
COLOUR_ATTRS = {"fill", "stroke", "stop-color", "flood-color", "lighting-color", "color", "bgcolor"}

DIAL = """<div style="max-width:400px;margin:34px 0 0;">
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
  </div>"""


def between(text, begin, end):
    i = text.find(begin)
    j = text.find(end, i + 1) if i != -1 else -1
    return (i, j + len(end)) if i != -1 and j != -1 else None


def replace_block(text, begin, end, block):
    span = between(text, begin, end)
    return text[:span[0]] + block + text[span[1]:] if span else None


def prepaint():
    src = (ROOT / "design.html").read_text()
    m = re.search(r"<script>var d=document\.documentElement.*?</script>", src)
    if not m:
        raise SystemExit("REFUSING: could not find the pre-paint snippet in design.html to copy.")
    return m.group(0)


def street_faces():
    css = LOVE.read_text()
    return {m.lower() for m in re.findall(r"@font-face\s*\{[^}]*font-family:\s*'([^']+)'", css)}


# ── The run ──────────────────────────────────────────────────────────────────

def refuse(problems, heading):
    print(f"REFUSING: {heading}\n")
    for p in problems:
        print("  · " + p)
    print("\nThe fix belongs in the artifact, where the person and their AI can see it. "
          "Send the reasons back rather than editing around them here.")
    sys.exit(1)


def main():
    ap = argparse.ArgumentParser(description="Bring a room somebody built with their own AI onto the street.")
    ap.add_argument("artifact", type=Path)
    ap.add_argument("--go", action="store_true", help="write the room; without this, nothing is written")
    args = ap.parse_args()

    src = args.artifact.read_text(encoding="utf-8")
    problems, warnings = [], []
    notes = read_notes(src, problems)
    if not notes or problems:
        refuse(problems, "the FOR THE STREET comment cannot be used as it is.")

    slug, prefix = notes["slug"], notes["prefix"]
    page_name = f"{slug}.html"
    page_path = ROOT / page_name
    data_path = ROOMS / f"{slug}.json"
    again = page_path.exists()
    if again:
        if not data_path.exists() or f"<!-- import:{slug}:begin -->" not in page_path.read_text():
            refuse([f"{page_name} is already on the street and was not brought in by this tool. "
                    "Pick another slug."], "the slug is taken.")
        prior = json.loads(data_path.read_text())
        if prior.get("prefix") != prefix:
            problems.append(f"This room was imported before with prefix {prior.get('prefix')!r} and now says "
                            f"{prefix!r}. Keep the prefix, so the street's names for it stay put.")

    love = LOVE.read_text()
    own_blocks = (r"/\* import:" + re.escape(slug) + r":(\w+):begin\b.*?/\* import:" + re.escape(slug)
                  + r":\1:end \*/")
    love_others = re.sub(own_blocks, "", love, flags=re.S)
    if re.search(rf"--{prefix}-[\w-]+\s*:", love_others) or re.search(rf"\.{prefix}-[\w-]", love_others) \
            or re.search(rf"@keyframes\s+{prefix}-", love_others):
        problems.append(f"Prefix {prefix!r} is already used by another room in love.css. Ask for a different "
                        "two or three letters, and have the AI change every class and colour name to match.")
    if re.search(rf"\.door--{re.escape(slug)}(?![\w-])", love_others):
        problems.append(f"The front page already has a door called door--{slug}. Pick another slug.")

    tree = Tree(src)
    nodes = list(tree.root.walk())
    by = lambda tag: [n for n in nodes if n.tag == tag]  # noqa: E731

    htmls, bodies, mains, h1s = by("html"), by("body"), by("main"), by("h1")
    lang = htmls[0].attrs.get("lang") if htmls else None
    if not lang:
        problems.append("<html> has no lang attribute. A screen reader needs to know which voice to read in.")
    if len(bodies) != 1:
        problems.append("There should be one <body>.")
        refuse(problems, "the page cannot be read.")
    body = bodies[0]
    if (body.attrs.get("class") or "").split() != [f"room-{slug}"]:
        problems.append(f"<body> should carry class=\"room-{slug}\" and nothing else; it has "
                        f"{body.attrs.get('class')!r}.")
    if len(mains) != 1:
        problems.append(f"There should be one <main>; there are {len(mains)}.")
        refuse(problems, "the page cannot be read.")
    main_el = mains[0]
    if len(h1s) != 1 or not h1s[0].inside(main_el):
        problems.append("There should be exactly one <h1>, inside <main>.")
    titles = by("title")
    title = re.sub(r"\s*[—–|-]\s*Stimpunks\.World\s*$", "", text_of(src, titles[0])) if titles else ""
    if not title:
        problems.append("There is no <title>. It is the room's name on its door and in the walking order.")
    elif len(title) > 60:
        problems.append(f"The <title> is {len(title)} characters; the room's name should fit on a door (60).")
    desc = next((n.attrs.get("content", "") for n in by("meta") if n.attrs.get("name") == "description"), "")
    desc = re.sub(r"\s+", " ", desc).strip()
    if not desc:
        problems.append("There is no <meta name=\"description\">. One short sentence saying what the room is.")
    elif len(desc) > 200:
        problems.append(f"The description is {len(desc)} characters. Under 200: it is the door's blurb and "
                        "the share card's line, and a card that does not fit is refused.")

    drop, dial_at, styles, scripts, gfonts = [], None, [], [], set()
    for n in nodes:
        if n.tag == "#root":
            continue
        if "data-preview-only" in n.attrs:
            if not any(n.inside(d) for d in drop):
                drop.append(n)
                if dial_at is None and n.inside(main_el) and n.tag not in ("script", "style"):
                    dial_at = n
            continue
        if any(n.inside(d) for d in drop):
            continue
        if n.tag in FORBID:
            why = {"img": "Draw it as inline SVG or CSS; a photograph comes in through its consent record.",
                   "form": "Nothing on this street submits a form."}.get(
                n.tag, "Nothing plays or loads from elsewhere; a video is a <button data-media>.")
            problems.append(f"<{n.tag}> is not something a room here can hold. {why}")
        if n.tag == "style":
            styles.append(n)
        elif n.tag == "script":
            if n.attrs.get("type") == "application/ld+json":
                drop.append(n)
                continue
            scripts.append(n)
        elif n.tag == "link":
            href, rel = n.attrs.get("href", ""), (n.attrs.get("rel") or "").lower()
            if re.match(r"^https://fonts\.(?:googleapis|gstatic)\.com(?:/|$)", href) and \
                    rel in ("stylesheet", "preconnect"):
                for fam in re.findall(r"family=([^&:;]+)", href):
                    gfonts.add(H.unescape(fam).replace("+", " ").strip())
                drop.append(n)
            elif not n.inside(body):
                drop.append(n) if rel in ("icon", "canonical", "manifest", "apple-touch-icon") else \
                    problems.append(f"<link rel=\"{rel}\" href=\"{href}\"> loads something from elsewhere.")
            else:
                problems.append("A <link> in the body.")

    if len(styles) != 1:
        problems.append(f"There should be one <style> (besides the preview dial's); there are {len(styles)}.")
    if len(scripts) > 1:
        problems.append(f"There should be at most one <script> (besides the preview dial's); there are {len(scripts)}.")
    for sc in scripts:
        if sc.attrs.get("src"):
            problems.append(f"<script src=\"{sc.attrs['src']}\"> loads code from elsewhere.")
        if sc.attrs.get("type") not in (None, "text/javascript"):
            problems.append(f"<script type=\"{sc.attrs.get('type')}\">: plain JavaScript only.")

    # Anything shown outside <main> would never reach the room.
    for c in body.children:
        if c is main_el or c in drop or c in scripts or c in styles:
            continue
        problems.append(f"<{c.tag}> outside <main>. Everything the room shows goes inside <main>.")
    loose = src[body.open_end:body.close_start]
    for c in body.children:
        loose = loose.replace(src[c.start:c.end], "")
    if re.sub(r"<!--.*?-->", "", loose, flags=re.S).strip():
        problems.append("Text outside <main>. Everything the room shows goes inside <main>.")

    css_src = src[styles[0].open_end:styles[0].close_start] if styles else ""
    css = CSS(css_src, slug, prefix, problems)
    palette = css.palette
    if not palette:
        problems.append(f"No colours are declared on :root as --{prefix}- hex custom properties.")

    # The markup: names, colours, handlers, addresses, and the players.
    edits, media_ids, credits_at = [], set(), None
    notes_media = {m["id"]: m for m in notes["media"]}
    for n in main_el.walk():
        if any(n.inside(d) for d in drop) or n.tag in ("script", "style"):
            continue
        new, changed = [], False
        for k, v in n.attr_list:
            v = v if v is not None else None
            lk = k.lower()
            if lk.startswith("on"):
                problems.append(f"<{n.tag} {k}=…>: attach handlers in the script. The street's security "
                                "policy refuses inline handlers, so it would silently never run.")
            if lk in ("href", "xlink:href") and v:
                if v.strip().lower().startswith("javascript:"):
                    problems.append(f"<{n.tag} href=\"javascript:…\"> runs code from a link.")
                elif not re.match(r"^(?:https?://|mailto:|#)", v) and not (ROOT / v.split("#")[0]).exists():
                    problems.append(f"<{n.tag} href=\"{v}\"> points at a page that is not on this street.")
            if lk in ("src", "srcset", "poster", "data") and n.tag != "object":
                problems.append(f"<{n.tag} {k}=\"{v}\"> loads something. Draw it or link to it instead.")
            if lk == "class" and v:
                for tok in v.split():
                    if not tok.startswith(prefix + "-"):
                        problems.append(f"<{n.tag} class=\"{tok}\">: every class starts with {prefix}-.")
            if lk == "id" and v in RESERVED_IDS:
                problems.append(f"id=\"{v}\" belongs to the street's own furniture on every page. Rename it.")
            if lk == "style" and v:
                es = colour_edits(v, palette, f"<{n.tag} style>", problems)
                if es:
                    v, changed = apply(v, es), True
                css.uses.update(re.findall(r"var\((--[\w-]+)", v))
            if lk in COLOUR_ATTRS and v:
                es = colour_edits(v, palette, f"<{n.tag} {k}>", problems)
                if es:
                    v, changed = apply(v, es), True
                css.uses.update(re.findall(r"var\((--[\w-]+)", v))
            new.append((k, v))
        if n is main_el:
            new = [(k, v) for k, v in new if k.lower() != "id"]
            new.insert(0, ("id", "main"))
            changed = True
        if "data-media" in n.attrs:
            link = n.attrs["data-media"] or ""
            m = YT_ID.search(link)
            if n.tag != "button" or not m or "list=" in link:
                problems.append(f"<{n.tag} data-media=\"{link}\">: a player is a <button> holding one YouTube "
                                "video's link.")
            else:
                vid = m.group(1)
                media_ids.add(vid)
                item = notes_media.get(vid)
                label = text_of(src, n)
                if not item:
                    problems.append(f"The button for {vid} is not listed under Media in FOR THE STREET.")
                elif item["runtime"] not in label:
                    problems.append(f"The button for {item['title']!r} does not say how long it runs "
                                    f"({item['runtime']}) before the press: it says {label!r}.")
                else:
                    cls = " ".join(["facade"] + (n.attrs.get("class") or "").split())
                    new = [(k, v) for k, v in new if k.lower() not in ("data-media", "class", "type")]
                    new = [("type", "button"), ("class", cls), ("data-embed-id", vid),
                           ("data-embed-title", f"{item['who']} — {item['title']}")] + new
                    changed = True
        if changed:
            edits.append((n.start, n.open_end, start_tag(n.tag, new, n.selfclose)))
        if credits_at is None and re.fullmatch(r"h[2-6]", n.tag) and "credit" in text_of(src, n).lower():
            credits_at = n
    for vid in sorted(set(notes_media) - media_ids):
        problems.append(f"Media lists {notes_media[vid]['title']!r} and no button in the room plays it.")
    for sym in sorted(css.uses - set(css.root)):
        if f"var({sym})" not in " ".join(problems):
            problems.append(f"var({sym}) is used and never declared on :root.")

    # Typefaces: what the notes say, what the CSS sets, and what the street hosts.
    set_faces = {f.lower(): f for f in css.faces}
    said = {f.lower(): f for f in notes["typefaces"]}
    for f in sorted(set(set_faces) - set(said)):
        problems.append(f"The CSS sets {set_faces[f]!r} and FOR THE STREET does not list it under Typefaces.")
    for f in sorted(set(said) - set(set_faces)):
        problems.append(f"FOR THE STREET lists {said[f]!r} and nothing in the CSS sets it.")
    hosted = street_faces()
    missing = sorted(said[f] for f in said if f not in hosted)
    if missing:
        problems.append("Not hosted on this street yet: " + ", ".join(missing) + ". Adding a face is its own "
                        "job: the woff2 in fonts/, its @font-face in love.css §1, fonts/_sources.json, then "
                        "tools/pull-foundry.py for its designer and licence. Do that first, then import again.")

    # Credits: under a heading, naming every face, every song's maker, and the AI.
    if credits_at is None:
        problems.append("No heading with the word Credits in it. Credit what you did not write.")
    else:
        credits = re.sub(r"\s+", " ", H.unescape(re.sub(r"<[^>]+>", " ",
                         src[credits_at.start:main_el.close_start]))).lower()
        for f in notes["typefaces"]:
            if f.lower() not in credits:
                problems.append(f"The credits do not name the typeface {f!r}.")
        for item in notes["media"]:
            if item["who"].lower() not in credits:
                problems.append(f"The credits do not name {item['who']!r}, who made {item['title']!r}.")
        ai = re.split(r"[\s,(]+", notes["built with"].strip())[0].lower()
        if ai and ai not in credits:
            problems.append(f"The credits do not say the room was built with {notes['built with']!r}. "
                            "A room made with an AI says so, the way design.html says how we use one.")

    js = ""
    if scripts:
        js = src[scripts[0].open_end:scripts[0].close_start].strip()
        js_scan = JS_NAMESPACES.sub("", js)
        for pat, why in JS_REFUSE:
            for m in re.finditer(pat, js_scan, re.M):
                problems.append(f"The script cannot come in: {why} ({m.group(0).strip()!r}). Nothing on "
                                "this street is sent or kept, and nothing plays by itself.")
                break
        if JS_WATCH.search(js) and "intensity" not in js:
            warnings.append("The script animates (requestAnimationFrame, setInterval or animate()) and never "
                            "reads the dial. check-gentle.py cannot see motion a script drives, so a person "
                            "should press through the room at Gentle.")

    if problems:
        refuse(problems, f"{args.artifact.name} is not ready to come onto the street.")

    # ── Assemble ─────────────────────────────────────────────────────────────
    main_edits = [e for e in edits if main_el.open_end <= e[0] < main_el.close_start]
    for d in drop:
        if d.inside(main_el) and d is not main_el:
            main_edits = [e for e in main_edits if not (d.start <= e[0] < d.end)]
            main_edits.append((d.start, d.end, DIAL if d is dial_at else ""))
    inner = apply(src[main_el.open_end:main_el.close_start],
                  [(s - main_el.open_end, e - main_el.open_end, r) for s, e, r in main_edits])
    main_open = next(r for s, e, r in edits if s == main_el.start)
    room_css = css.edited().strip("\n")
    facades = bool(notes["media"])

    old_page = page_path.read_text() if again else ""
    quests = "\n".join(re.findall(r"^[ \t]*<!-- quest:[\w-]+:begin -->.*?<!-- quest:[\w-]+:end -->",
                                  old_page, flags=re.S | re.M))
    # What other generators wrote into the head (make-og.py's card tags,
    # make-structured.py's JSON-LD) is theirs and is carried over, so importing
    # the same artifact twice changes nothing.
    old_card = re.findall(r'^<meta (?:property="og:image[^"]*"|name="twitter:card")[^>]*>$', old_page, re.M)
    old_ld = between(old_page, "<!-- structured-data:begin -->", "<!-- structured-data:end -->")
    old_ld = old_page[old_ld[0]:old_ld[1]].split("\n") if old_ld else \
        ["<!-- structured-data:begin -->", "<!-- structured-data:end -->"]

    fx = json.loads(FRACTALS.read_text())
    clothes, recipe_from = None, None

    def page_text(recipe_rooms, stylesheet="love.css"):
        head = [
            "<!DOCTYPE html>",
            f'<html lang="{H.escape(lang)}">',
            "<head>",
            '<meta charset="utf-8">',
            '<meta name="viewport" content="width=device-width, initial-scale=1">',
            f"<title>{H.escape(title)} — Stimpunks.World</title>",
            f'<meta name="description" content="{H.escape(desc)}">',
            f'<link rel="canonical" href="{BASE}/{page_name}">',
            f'<meta name="color-scheme" content="{clothes["scheme"] if clothes else "dark"}">',
            f'<meta name="theme-color" content="{clothes["ground_hex"] if clothes else "#15121f"}">',
            '<meta property="og:type" content="website">',
            '<meta property="og:site_name" content="Stimpunks.World">',
            f'<meta property="og:title" content="{H.escape(title)} — Stimpunks.World">',
            f'<meta property="og:description" content="{H.escape(desc)}">',
            f'<meta property="og:url" content="{BASE}/{page_name}">',
            *old_card,
            '<link rel="icon" href="favicon.svg" type="image/svg+xml">',
            '<link rel="icon" href="favicon.ico" sizes="32x32">',
            '<link rel="apple-touch-icon" href="apple-touch-icon.png">',
            '<link rel="manifest" href="site.webmanifest">',
            '<link rel="alternate" href="/feed.xml" type="application/rss+xml" title="Stimpunks.World — what changed on the street">',
            f'<link rel="stylesheet" href="{stylesheet}">',
            prepaint(),
            *old_ld,
            "</head>",
            f'<body class="room-{slug}" id="top">',
            f'<a class="skip" href="#main">Skip to {H.escape(title)}</a>',
            "",
            "<!-- Brought onto the street by tools/import-room.py from the artifact "
            f"{H.escape(notes['name'])} sent. Everything between the import markers is theirs and is replaced "
            "whole when they send a new version: change the artifact and import it again, never the lines "
            "between. The quest markers, the sign-off and everything in <head> are the street's. -->",
            main_open,
            '  <a class="backlink" href="index.html">&larr; back to the street</a>',
            f"<!-- import:{slug}:begin -->",
            inner.strip("\n"),
            f"<!-- import:{slug}:end -->",
        ]
        if dial_at is None:
            head.append("  " + DIAL)
        if quests:
            head.append(quests)
        head += [
            "</main>",
            "",
            signoff.block(page=page_name, recipes=recipe_rooms),
            "",
            '<script src="love.js" defer></script>',
        ]
        if facades:
            head.append('<script src="love-embed.js" defer></script>')
        if js:
            head.append(f'<script src="{slug}.js" defer></script>')
        head += ['<script src="quest.js" defer></script>', "</body>", "</html>", ""]
        return "\n".join(head)

    # love.css as it would be, with this room in it.
    def root_block():
        lines = [f"  /* import:{slug}:root:begin */",
                 f"  /* {notes['name']}'s room, {title} -- brought in by tools/import-room.py.",
                 "     Their colours exactly as their artifact declared them, replaced whole on",
                 "     re-import. Measured in data/rooms/" + slug + ".json. */"]
        lines += [f"  {k}: {v};" for k, v in css.root.items()]
        lines.append(f"  /* import:{slug}:root:end */")
        return "\n".join(lines)

    def section_block(number):
        head = f"/* §{number} ── ROOM: {title} (a shopfront on the street) "
        head += "─" * max(3, 80 - len(head))
        say = f" ({notes['pronouns']})" if notes.get("pronouns") else ""
        return "\n".join([
            f"/* import:{slug}:section:begin */",
            head,
            f"   {notes['name'].upper()}'S ROOM{say}, AND NOT OURS TO REDESIGN. Built with",
            f"   {notes['built with']} and brought onto the street by tools/import-room.py from the",
            "   artifact they sent. Everything between the import markers is theirs and is",
            "   replaced whole when they send a new version: change the artifact and import",
            "   it again, never the lines between. Its light, in their words:",
            f"   {notes['light']} */",
            "",
            room_css,
            f"/* import:{slug}:section:end */",
            "",
        ])

    def door_css():
        c = clothes
        return "\n".join([
            f"/* import:{slug}:door:begin -- {title}'s door, in the room's own colours and faces. A plain",
            "   awning, written by tools/import-room.py: a starting point for dressing, not a design. */",
            f".door--{slug} {{ background: var({c['ground']}); border-color: var({c['link']}); }}",
            f".door--{slug} .door__awning {{ background: var({c['heading']}); border-bottom-color: var({c['link']}); }}",
            f".door--{slug} .door__name  {{ font-family: {c['heading_face']}; color: var({c['heading']}); }}",
            f".door--{slug} .door__blurb {{ font-family: {c['text_face']}; color: var({c['text']}); }}",
            f".door--{slug} .door__knock {{ font-family: {c['text_face']}; color: var({c['link']}); }}",
            f"/* import:{slug}:door:end */",
        ])

    def new_love(section_number):
        text = love
        r0 = text.index(":root {")
        r1 = text.index("\n}", r0)
        span = between(text, f"  /* import:{slug}:root:begin */", f"/* import:{slug}:root:end */")
        if span:
            text = text[:span[0]] + root_block() + text[span[1]:]
        else:
            text = text[:r1] + "\n\n" + root_block() + text[r1:]
        span = between(text, f"/* import:{slug}:section:begin */", f"/* import:{slug}:section:end */")
        if span:
            end = span[1] + 1 if text[span[1]:span[1] + 1] == "\n" else span[1]
            text = text[:span[0]] + section_block(section_number) + text[end:]
        else:
            at = re.search(r"^/\* §\d+ ── Small screens", text, re.M).start()
            text = text[:at] + section_block(section_number) + "\n" + text[at:]
        if clothes:
            span = between(text, f"/* import:{slug}:door:begin", f"/* import:{slug}:door:end */")
            if span:
                text = text[:span[0]] + door_css() + text[span[1]:]
            else:
                street = text.index("/* §5 ── ")
                six_at = re.search(r"\n/\* §6 ── ", text).start()
                last = [m.end() for m in re.finditer(r"^\.door--[^\n]*\n", text[street:six_at], re.M)][-1]
                text = text[:street + last] + door_css() + "\n" + text[street + last:]
        return text

    headers = [(int(n), name.strip()) for n, name in re.findall(r"/\* §(\d+) ── ([^\n─]*)", love)]
    small = next((n for n, name in headers if name.startswith("Small screens")), None)
    if small is None:
        raise SystemExit("REFUSING: love.css has no 'Small screens' section to put a new room before.")
    if again:
        m = re.search(r"/\* import:" + re.escape(slug) + r":section:begin \*/\n/\* §(\d+) ── ", love)
        number = int(m.group(1)) if m else None
        if number is None:
            raise SystemExit(f"REFUSING: love.css has no section for {slug} between import markers.")
        shift_from = None
    else:
        number, shift_from = small, small

    def renumber(text):
        """§N for every N from the cross-cutting sections up, one higher."""
        top = max(n for n, _ in headers)
        for n in range(top, shift_from - 1, -1):
            text = re.sub(rf"§{n}(?!\d)", f"§{n + 1}", text)
        return text

    if shift_from is not None:
        love = renumber(love)

    # ── Measure the room as it would ship ────────────────────────────────────
    live, gentle = load("check-contrast-live"), load("check-gentle")
    browser = live.find_browser()
    probe_css = ROOT / f".import-{slug}.css"
    probe_page = ROOT / f".import-{slug}.html"

    recipe_rooms = dict(fx["rooms"])
    recipe_rooms[page_name] = {"kind": "julia", "c": [-0.8, 0.156], "orbit": 0.02, "ground": "--ink",
                               "inks": ["--chalk"]}  # placeholder for the probe; the real one is below

    CLOTHES_JS = """<script>(function(){
  function c(el, p){ return el ? getComputedStyle(el)[p] : null; }
  var b = document.body, h = document.querySelector('main h1'), a = document.querySelector('.backlink');
  var r = {ground: c(b, 'backgroundColor'), text: c(b, 'color'), text_face: c(b, 'fontFamily'),
           heading: c(h, 'color'), heading_face: c(h, 'fontFamily'), link: c(a, 'color')};
  var m = document.createElement('meta'); m.id = 'import-clothes';
  m.setAttribute('content', JSON.stringify(r)); document.head.appendChild(m);
})();</script>"""

    def rgb_hex(s):
        m = re.match(r"rgba?\(([^)]+)\)", s or "")
        if not m:
            return None, 0
        p = [float(x) for x in re.split(r"[\s,/]+", m.group(1).strip()) if x]
        a = p[3] if len(p) > 3 else 1
        return "#" + "".join(f"{round(x):02x}" for x in p[:3]), a

    try:
        probe_css.write_text(new_love(number))
        probe_page.write_text(page_text(recipe_rooms, probe_css.name).replace("</body>", CLOTHES_JS + "\n</body>", 1))
        out = subprocess.run([browser, "--headless=new", "--disable-gpu", "--no-sandbox",
                              "--virtual-time-budget=4000", "--dump-dom", probe_page.as_uri()],
                             capture_output=True, timeout=120).stdout.decode("utf-8", "replace")
        m = re.search(r'<meta id="import-clothes" content="(.*?)">', out, re.S)
        if not m:
            raise SystemExit("REFUSING: the room did not render, so nothing about it could be measured. "
                             "Open the artifact in a browser and look for an error.")
        raw = json.loads(H.unescape(m.group(1)))
        reverse = {hx: name for hx, name in palette.items()}
        clothes, cp = {}, []
        for key, what in (("ground", f".room-{slug} {{ background-color }}"),
                          ("text", f".room-{slug} {{ color }}"),
                          ("heading", "the <h1>'s colour"),
                          ("link", f".room-{slug} a {{ color }}")):
            hx, a = rgb_hex(raw.get(key))
            if not hx or a < 1 or hx not in reverse:
                cp.append(f"{what} renders as {raw.get(key)}, which is not one of the room's own declared "
                          "colours. The street's furniture (the way back, the dial, the sign-off) takes the "
                          "room's ground, text and link colours, so each has to be set with var().")
            else:
                clothes[key] = reverse[hx]
                clothes[key + "_hex"] = hx
        clothes["heading_face"] = raw.get("heading_face") or "inherit"
        clothes["text_face"] = raw.get("text_face") or "inherit"
        if cp:
            refuse(cp, "the room does not decide its own ground, text and link colours.")
        clothes["scheme"] = "dark" if lum(clothes["ground_hex"]) < 0.18 else "light"

        # The fractal recipe: kept if it still draws in declared colours.
        declared_names = set(css.root)
        kept = fx["rooms"].get(page_name)
        if kept and all(c in declared_names for c in [kept.get("ground")] + kept.get("inks", [])):
            recipe = kept
            recipe_from = (prior.get("fractal_from") if again else None)
        else:
            shapes = [(k, v) for k, v in fx["rooms"].items() if isinstance(v, dict) and
                      v.get("kind") in ("julia", "mandel", "phoenix", "orbit", "newton")]
            shapes.sort()
            pick = shapes[int(hashlib.sha256(slug.encode()).hexdigest(), 16) % len(shapes)]
            inks = []
            for name in [clothes["heading"], clothes["link"], clothes["text"]] + list(palette.values()):
                if name != clothes["ground"] and name not in inks:
                    inks.append(name)
            recipe = {k: v for k, v in pick[1].items() if k not in ("ground", "inks")}
            recipe.update({"ground": clothes["ground"], "inks": inks[:4]})
            recipe_from = pick[0]
        recipe_rooms[page_name] = recipe

        probe_css.write_text(new_love(number))
        probe_page.write_text(page_text(recipe_rooms, probe_css.name))

        # Contrast, with check-contrast-live.py's own probe asked to report every
        # piece of text rather than only the failures.
        patches = [
            ("var rows = [], seen = 0, skipped = 0;", "var rows = [], seen = 0, skipped = 0, skips = [];"),
            ("if (!bg) { skipped++; continue; }",
             "if (!bg) { skipped++; skips.push(name(el) + ' \\u201c' + own.replace(/\\s+/g, ' ').trim().slice(0, 44) + '\\u201d'); continue; }"),
            ("if (cr < need - 0.005) {", "if (true) {"),
            ("rows.push({tag: name(el),", "rows.push({ok: cr >= need - 0.005, large: large, "
             "fgc: 'rgb(' + [fg.r, fg.g, fg.b].map(Math.round).join(', ') + ')', tag: name(el),"),
            ("JSON.stringify({seen: seen, woke: woke, skipped: skipped, bad: rows})",
             "JSON.stringify({seen: seen, woke: woke, skipped: skipped, skips: skips, bad: rows})"),
        ]
        js_probe = live.JS
        for a, b in patches:
            if js_probe.count(a) != 1:
                raise SystemExit("REFUSING: check-contrast-live.py's probe has changed shape, so this cannot "
                                 f"ask it for every pair. Update the patch in import-room.py.\n  missing: {a}")
            js_probe = js_probe.replace(a, b)
        live.JS = js_probe
        res = live.probe(browser, probe_page)
        g = gentle.probe(browser, probe_page)
    finally:
        probe_css.unlink(missing_ok=True)
        probe_page.unlink(missing_ok=True)

    mp = []
    for r in res["bad"]:
        if not r["ok"]:
            mp.append(f"{r['ratio']:.2f} (needs {r['need']}) {r['fgc']} on {r['bg']}  {r['tag']}  “{r['text']}”")
    for s in res.get("skips", []):
        mp.append(f"text standing on a gradient or a picture, which cannot be measured: {s}. Put text on "
                  "flat colour.")
    where = g["where"]
    for i, place in enumerate(where):
        loud = max(g["regular"]["rows"][i][0], g["max"]["rows"][i][0])
        gr = g["gentle"]["rows"][i]
        if not place["svg"] and loud > gentle.FLAT and gr[0] > gentle.FLAT:
            mp.append(f"still rotated or skewed at Gentle: {place['tag']} ({gr[1]})")
        if gr[2] != "none" or gr[3] != "none" or gr[4] != "none" or \
                set(gr[5].replace(" ", "").split(",")) - {"0s"}:
            mp.append(f"still moving at Gentle: {place['tag']} animation:{gr[2]} transition:{gr[5]}")
    if g["regular"]["text"] != g["gentle"]["text"]:
        mp.append("the words at Gentle are not the words at Regular. Gentle takes away the wobble, never the words.")
    if mp:
        refuse(mp, "the room, rendered as it would ship, does not keep the street's promises.")

    # The pairs, as measured, for check-contrast.py to hold.
    room_hexes = set(palette)
    pairs, seen = [], set()
    for r in res["bad"]:
        fg, _ = rgb_hex(r["fgc"])
        bg, _ = rgb_hex(r["bg"])
        if not fg or not bg or not ({fg, bg} & room_hexes):
            continue
        key = (fg, bg, bool(r["large"]))
        if key in seen:
            continue
        seen.add(key)
        pairs.append({"ink": fg, "ground": bg, "large": bool(r["large"]),
                      "ratio": round(ratio(fg, bg), 2),
                      "where": f"{r['tag']} “{r['text']}”"})
    used = {p["ink"] for p in pairs} | {p["ground"] for p in pairs}
    ornament = {}
    for hx, name in palette.items():
        if hx not in used:
            ornament[hx] = (f"{title}: {name} carried no text when tools/import-room.py rendered the room on "
                            f"{TODAY}; {ratio(hx, clothes['ground_hex']):.2f} against the room's ground. "
                            "Measured by the import, not chosen by a person.")

    # ── Report ───────────────────────────────────────────────────────────────
    record = {
        "_what": ("A room brought onto the street by tools/import-room.py from an artifact somebody built with "
                  "their own AI. Everything here is read off that artifact's FOR THE STREET comment or "
                  "measured from the room as it renders; nothing is typed. check-contrast.py holds the "
                  "pairs, check-jukebox.py checks the tracks, and re-importing replaces this file whole."),
        "slug": slug, "page": page_name, "title": title, "description": desc,
        "name": notes["name"], "link": notes["link"], "pronouns": notes["pronouns"], "say_it": notes["say it"],
        "prefix": prefix, "light": notes["light"], "typefaces": notes["typefaces"],
        "photographs": None, "words": notes["words"], "built_with": notes["built with"],
        "could_not_do": notes["could not do"],
        "imported": TODAY, "artifact": args.artifact.name,
        "artifact_sha256": hashlib.sha256(src.encode()).hexdigest(),
        "clothes": {k: clothes[k] for k in ("ground", "text", "heading", "link", "heading_face", "text_face")},
        "fractal_from": recipe_from or "kept from the previous import",
        "tracks": [{"id": m["id"], "title": m["title"], "artist": m["who"], "runtime": m["runtime"],
                    "link": m["link"]} for m in notes["media"]],
        "pairs": pairs,
        "ornament": ornament,
    }

    say = "Re-importing" if again else "Bringing in"
    print(f"{say} {title!r} ({page_name}), {notes['name']}'s, built with {notes['built with']}.")
    print(f"  measured {res['seen']} pieces of text: every one clears the bar, {len(pairs)} pairs of the room's "
          f"own colours recorded, {len(ornament)} colour(s) carrying no text.")
    print(f"  Gentle checked across {len(where)} elements: nothing tilted, nothing moving, the same words.")
    for w in warnings:
        print("  WATCH: " + w)
    if notes.get("could not do"):
        print(f"  THEY ASKED FOR SOMETHING THE RULES DID NOT ALLOW: {notes['could not do']}\n"
              "    Talk to them about it; the room came in without it.")

    writes = [page_name, "love.css (its colours in :root, its section, its door)",
              f"data/rooms/{slug}.json", "data/fractals.json (its recipe)"]
    if js:
        writes.insert(1, f"{slug}.js")
    if not again:
        writes += ["index.html (its door, before Your Room's)", "tools/make-sitemap.py (its place in the walking order)",
                   "liner-notes.html (its credit)",
                   f"every mention of §{shift_from} and up, one higher, for the new §{number}"]
    else:
        writes += ["index.html (its door)", "liner-notes.html (its credit)"]

    if not args.go:
        print("\nWould write:\n  " + "\n  ".join(writes))
        print("\nNothing has been written. Run again with --go to bring it in.")
        return

    # ── Write ────────────────────────────────────────────────────────────────
    if shift_from is not None:
        tracked = subprocess.run(["git", "ls-files"], cwd=ROOT, capture_output=True, text=True).stdout.split()
        for rel in tracked:
            p = ROOT / rel
            if rel == "love.css" or rel == "changelog.html" or p.suffix not in (".py", ".js", ".mjs", ".css", ".md",
                                                                                   ".html", ".json", ".sh", ".txt"):
                continue
            try:
                t = p.read_text()
            except (UnicodeDecodeError, FileNotFoundError):
                continue
            if "§" in t:
                t2 = renumber(t)
                if t2 != t:
                    p.write_text(t2)
    LOVE.write_text(new_love(number))

    fx["rooms"][page_name] = recipe
    FRACTALS.write_text(json.dumps(fx, indent=2, ensure_ascii=False) + "\n")
    ROOMS.mkdir(exist_ok=True)
    data_path.write_text(json.dumps(record, indent=2, ensure_ascii=False) + "\n")

    js_path = ROOT / f"{slug}.js"
    if js:
        js_path.write_text(
            f"/* {notes['name']}'s room, {title}: its script, brought onto the street by\n"
            "   tools/import-room.py from the artifact they sent. Replaced whole when they send a\n"
            "   new version, so change the artifact and import it again rather than editing here. */\n"
            + js + "\n")
    elif js_path.exists():
        js_path.unlink()
    page_path.write_text(page_text(recipe_rooms))

    # The door, before Your Room's, which is the empty storefront at the end of the row.
    index = INDEX.read_text()
    door = "\n".join([
        f"    <!-- import:{slug}:door:begin -->",
        f'    <li><a class="door door--{slug}" href="{page_name}">',
        '      <span class="door__awning" aria-hidden="true"></span>',
        '      <span class="door__body">',
        f'        <span><span class="door__name">{H.escape(title)}</span>',
        f'        <span class="door__blurb">{H.escape(desc)}</span></span>',
        '        <span class="door__knock">step inside &rarr;</span>',
        "      </span>",
        "    </a></li>",
        f"    <!-- import:{slug}:door:end -->",
    ])
    swapped = replace_block(index, f"    <!-- import:{slug}:door:begin -->", f"<!-- import:{slug}:door:end -->", door)
    if swapped is None:
        anchor = '    <li><a class="door door--empty" href="your-room.html">'
        if index.count(anchor) != 1:
            raise SystemExit("REFUSING: cannot find Your Room's door on index.html to stand the new door beside.")
        swapped = index.replace(anchor, door + "\n" + anchor)
    INDEX.write_text(swapped)

    if not again:
        sm = SITEMAP.read_text()
        anchor = '         "your-room.html",\n'
        if sm.count(anchor) != 1:
            raise SystemExit("REFUSING: cannot find your-room.html in make-sitemap.py's order.")
        SITEMAP.write_text(sm.replace(anchor, f'         "{page_name}",  # {notes["name"]}\'s, brought in by '
                                              f"tools/import-room.py\n" + anchor))

    who = H.escape(notes["name"])
    if notes.get("link"):
        who = f'<a href="{H.escape(notes["link"], quote=True)}">{who}</a>'
    extra = []
    if notes.get("pronouns"):
        extra.append(H.escape(notes["pronouns"]))
    if notes.get("say it"):
        extra.append("said " + H.escape(notes["say it"]))
    credit = "\n".join([
        f"    <!-- import:{slug}:credit:begin -->",
        f'    <div><dt>{H.escape(title)} &mdash; {H.escape(notes["name"])}</dt><dd><a href="{page_name}">'
        f"{H.escape(title)}</a> is {who}&rsquo;s{(' (' + '; '.join(extra) + ')') if extra else ''}, the design and "
        f"the words. It was built in conversation with {H.escape(notes['built with'])}, an AI, and brought onto "
        f"the street on {TODAY}. What they say about the words: &ldquo;{H.escape(notes['words'])}&rdquo; Its "
        f"light, in their words: &ldquo;{H.escape(notes['light'])}&rdquo; Everything it quotes or borrows is "
        "credited at the foot of the room.</dd></div>",
        f"    <!-- import:{slug}:credit:end -->",
    ])
    liner = LINER.read_text()
    swapped = replace_block(liner, f"    <!-- import:{slug}:credit:begin -->", f"<!-- import:{slug}:credit:end -->", credit)
    if swapped is None:
        at = liner.find('<h2 id="the-rooms">')
        close = liner.find("  </dl>", at)
        if at == -1 or close == -1:
            raise SystemExit("REFUSING: cannot find 'The rooms somebody else designed' in liner-notes.html.")
        swapped = liner[:close] + credit + "\n" + liner[close:]
    LINER.write_text(swapped)

    print("\nWrote:\n  " + "\n  ".join(writes))
    todo = [
        f"A share card. make-og.py refuses room-{slug} until it has a card design of its own, made after the "
        "room: a card per room, never a template.",
        f"A job marker. make-guild.py refuses {page_name} until data/quests.json has a job for it and "
        "make-guild.py a drawing, in the room's own colours. Put the quest markers just before </main>; a "
        "re-import carries them over.",
    ]
    if notes["media"]:
        todo.append("tools/check-jukebox.py, which needs the network, to ask YouTube whether every track "
                    "plays and embeds.")
        todo.append("A line about the room on the Now Playing poster, in data/now-playing.json, in our own "
                    "words: make-now-playing.py refuses a room with something to play that is not on the bill.")
    todo += ["Dress the door on the front page if the plain one does not suit the room (§5, between its "
             "import markers, and it will be rewritten on re-import: move it out of them to keep it).",
             "A changelog entry at the top of changelog.html, crediting them by name and saying the room was "
             "built with an AI.",
             "tools/check-all.sh, then commit and push."]
    print("\nStill to do, by hand, and tools/check-all.sh will stop until the share card, the job marker"
          + (" and the poster line" if notes["media"] else "") + " are done:\n  "
          + "\n  ".join(f"{i}. {t}" for i, t in enumerate(todo, 1)))


if __name__ == "__main__":
    main()
