#!/usr/bin/env python3
"""Give every section heading on the street an id, once, so somebody can link to it.

Ryan's ask, 2026-10-24: a link to a particular heading, to send people straight
to the part of a room or a document that matters. love.js puts a mark beside
every heading that has an id (§4's .hlink); this tool is what makes sure the
headings people would want to link to have one.

AN ID IS WRITTEN ONCE AND NEVER CHANGED. It is made from the heading's words
the first time this runs over it, and from then on it is markup like any other.
Reword the heading later and the id stays, because somebody may already have
sent a link to it, and a link that quietly stops landing is the thing this tool
exists to prevent. Never re-slug an id that is there, here or by hand.

WHICH HEADINGS. Every h2, h3 and h4 inside <main> that is a section's heading:
not one inside a card (an <li>, <article> or <figure>), where the heading is a
video's or a dish's title, not inside a <summary>, where a link would be a
control inside a control, and not inside a drawing, <noscript> or <template>.

NOT THE MORNING'S REGIONS. A room generator that check-all.sh runs writes its
headings before this does, so an id put on one of them is put back on every run
and nothing changes. The morning timers (tools/daily-*.sh) rewrite their regions
without this tool, so an id put there would be taken off every morning and put
back every evening. Those regions are make-search-index.py's DAILY, read out of
that file rather than copied. A heading in one of them gets its id from its own
generator, or none.

A GENERATOR'S h2 WITH NO ID IS REFUSED, in any region but the morning's: a
section of a room that nobody can link to is the gap this tool closes, and the
generator that writes the heading is the place to give it an id that lasts,
from its data, not from its words.

AND IT HOLDS THE MARK TO WHAT IT PROMISES, in love.css, love.js, forum.css and
forum.js: no colour of its own (it is the heading's ink, or it is a pair nobody
measured); shown to the keyboard and always where nothing can hover; the #
generated rather than typed, so a script reading a heading's words (glow.js
names a tile by its h3) never reads it; the heading named by its own words
(aria-label), or every heading is "Who we are Copy a link" to a screen reader;
and the forums' links to a heading carrying a hash of its words and never the
words, because the forums' addresses hold ids and nothing anybody wrote.

IF THIS REFUSES: give the heading an id in the generator that writes it, or
put back what the mark promises.
"""
import ast
import html
import re
import sys
import unicodedata
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HEADS = {"h2", "h3", "h4"}
CARDS = {"li", "article", "figure"}
NEVER = {"summary", "svg", "noscript", "template", "button", "a", "label"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "param", "source", "track", "wbr"}
MARKER = re.compile(r"<!--\s*([\w:./<>-]+?):(begin|end)\s*-->")
LONGEST = 64


def daily_regions():
    """make-search-index.py's DAILY, read without running that script."""
    src = (ROOT / "tools" / "make-search-index.py").read_text()
    for node in ast.parse(src).body:
        if isinstance(node, ast.Assign) and any(getattr(t, "id", "") == "DAILY" for t in node.targets):
            return ast.literal_eval(node.value)
    sys.exit("make-heading-ids: make-search-index.py has no DAILY list to read.")


def reserved_ids():
    """Ids the stylesheet or a script names, which a new heading must not take."""
    names = set()
    css = (ROOT / "love.css").read_text()
    for m in re.finditer(r"#([A-Za-z][\w-]*)", re.sub(r"/\*.*?\*/", "", css, flags=re.S)):
        word = m.group(1)
        if not re.fullmatch(r"[0-9a-fA-F]{3,8}", word):
            names.add(word)
    for js in ROOT.glob("*.js"):
        text = js.read_text()
        names.update(re.findall(r"getElementById\(\s*['\"]([\w-]+)['\"]", text))
        names.update(re.findall(r"['\"]#([A-Za-z][\w-]*)['\"]", text))
    return names


def slug(words):
    text = html.unescape(re.sub(r"<[^>]+>", " ", words))
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = text.lower().replace("&", " and ")
    text = re.sub(r"['’‘`]", "", text)
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    if len(text) > LONGEST:
        text = text[:LONGEST].rsplit("-", 1)[0]
    if text and text[0].isdigit():
        text = "s-" + text
    return text or "section"


class Heads(HTMLParser):
    """Every h2–h4 start tag in <main>: where it is, what it is inside, its words."""

    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.stack, self.found, self.cur, self.main = [], [], None, False

    def handle_starttag(self, tag, attrs):
        if tag in VOID:
            return
        if tag == "main":
            self.main = True
        if self.cur:
            self.cur["words"] += " "  # a tag inside a heading parts its words
        if self.main and tag in HEADS and not self.cur:
            self.cur = {"tag": tag, "pos": self.getpos(), "attrs": dict(attrs),
                        "inside": {t for t in self.stack}, "words": ""}
        self.stack.append(tag)

    def handle_endtag(self, tag):
        if self.cur:
            self.cur["words"] += " "
        if self.cur and tag == self.cur["tag"]:
            self.found.append(self.cur)
            self.cur = None
        if tag in self.stack:
            while self.stack and self.stack.pop() != tag:
                pass
        if tag == "main":
            self.main = False

    def handle_data(self, data):
        if self.cur:
            self.cur["words"] += data

    def handle_entityref(self, name):
        self.handle_data(f"&{name};")

    def handle_charref(self, name):
        self.handle_data(f"&#{name};")


def regions(src):
    """(start, end, name) of every generated region, and which are the morning's."""
    out, open_ = [], {}
    for m in MARKER.finditer(src):
        if m.group(2) == "begin":
            open_[m.group(1)] = m.end()
        elif m.group(1) in open_:
            out.append((open_.pop(m.group(1)), m.start(), m.group(1)))
    return out


def rules(css, cls):
    """Every declaration block whose selector names .cls, joined."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    return " ".join(m.group(2) for m in re.finditer(r"([^{}]*)\{([^{}]*)\}", css)
                    if re.search(rf"\.{cls}\b", m.group(1)))


def mark_promises():
    bad = []
    for sheet, cls in (("love.css", "hlink"), ("forum.css", "fm-hlink")):
        css = (ROOT / sheet).read_text()
        body = rules(css, cls)
        if not body:
            bad.append(f"{sheet}: no .{cls} rules")
            continue
        for prop in re.findall(r"(?:^|;|\s)((?:background-)?color|border-color|fill|stroke|outline-color)\s*:\s*([^;!]+)", body):
            if prop[1].strip() not in ("inherit", "currentColor", "none"):
                bad.append(f"{sheet}: .{cls} sets {prop[0]}: {prop[1].strip()} -- the mark is the heading's own ink")
        if not re.search(rf"\.{cls}::before\s*\{{\s*content:\s*'#'", css):
            bad.append(f"{sheet}: the # is not .{cls}::before's content -- typed into the link, it is in the heading's words")
        if not re.search(rf"\.{cls}:focus\b", css):
            bad.append(f"{sheet}: .{cls} is not shown when it has the keyboard")
        if not re.search(rf"@media \(hover: none\)\s*\{{\s*\.{cls}\s*\{{\s*opacity:\s*1", css):
            bad.append(f"{sheet}: .{cls} is not always shown where nothing can hover")
    love = (ROOT / "love.js").read_text()
    part = love[love.find("function sectionLinks"):love.find("function go()")]
    if "setAttribute('aria-label', name)" not in part:
        bad.append("love.js: sectionLinks no longer names the heading by its own words")
    if re.search(r"\ba\.(textContent|innerText|innerHTML)\s*=", part):
        bad.append("love.js: sectionLinks writes words into the mark")
    forum = (ROOT / "forum.js").read_text()
    part = forum[forum.find("function headLinks"):forum.find("function postOf")]
    if "setAttribute('aria-label', words)" not in part:
        bad.append("forum.js: headLinks no longer names the heading by its own words")
    href = re.search(r"a\.href\s*=\s*([^;]+);", part)
    if not href or "words" in href.group(1) or "key" not in href.group(1):
        bad.append("forum.js: a link to a heading in a post must carry headKey's hash, never the words")
    return bad


def main():
    broken = mark_promises()
    if broken:
        for line in broken:
            print("REFUSING  " + line)
        return 1
    daily = set(daily_regions())
    reserved = reserved_ids()
    changed, refused, given = [], [], 0
    for page in sorted(ROOT.glob("*.html")):
        src = page.read_text()
        if 'rel="canonical"' not in src:
            continue  # 404.html answers at every address; nothing there to link to
        lines = [0] + [m.end() for m in re.finditer("\n", src)]  # as HTMLParser counts lines
        reader = Heads()
        reader.feed(src)
        spans = regions(src)
        taken = set(re.findall(r'\bid="([^"]+)"', src)) | reserved
        inserts = []
        for h in reader.found:
            if "id" in h["attrs"] or h["inside"] & NEVER or h["inside"] & CARDS:
                continue
            at = lines[h["pos"][0] - 1] + h["pos"][1]
            inside = [name for a, b, name in spans if a <= at < b]
            if any(name in daily for name in inside):
                continue
            if inside and h["tag"] == "h2" and not any(n.startswith("import:") for n in inside):
                refused.append(f"{page.name}: <h2> “{html.unescape(h['words']).strip()[:50]}” "
                               f"in {inside[-1]}:begin has no id")
                continue
            base = slug(h["words"])
            name, n = base, 2
            while name in taken:
                name, n = f"{base}-{n}", n + 1
            taken.add(name)
            inserts.append((at + 1 + len(h["tag"]), name))
        if inserts:
            for at, name in sorted(inserts, reverse=True):
                src = src[:at] + f' id="{name}"' + src[at:]
            page.write_text(src)
            changed.append(page.name)
            given += len(inserts)
    for line in refused:
        print("REFUSING  " + line)
    if refused:
        print("\nGive the heading an id in the generator that writes it, from its data,\n"
              "so a link to that section lasts when its words change.")
        return 1
    if changed:
        print(f"Gave {given} section heading{'s' if given != 1 else ''} an id on: {', '.join(changed)}")
    else:
        print("Every section heading already has an id.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
