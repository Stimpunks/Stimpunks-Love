"""The JSON-LD at the head of every page, built from that page's own head.

WHAT IT SAYS, AND ONLY WHAT THE PAGE ALREADY SAYS. Structured data is read by
search engines and by agents as ground truth -- the facts a machine will quote
without checking -- and the one rule every guide to it agrees on is that it
must mirror what the page states. So nothing here is typed per page: the name
is the page's <title>, the description is its meta description, the address is
its canonical. A room renamed in its own head is renamed here on the next run,
and there is nowhere for the two to disagree.

THE SHAPE, and why each part is there:
  · a WebSite node for stimpunks.love and an Organization node for Stimpunks
    Foundation on EVERY page, not only the front one. A graph that refers to an
    @id it does not define is valid, but a reader that fetched one page cannot
    resolve it; two short nodes make every page self-contained.
  · the Organization's @id is https://stimpunks.org/#org -- the same one
    starstuff.earth uses -- so that two of our sites describe one publisher
    rather than two publishers who happen to share a name.
  · the licence is on the WEBSITE, not on each page. CC BY-SA 4.0 covers the
    text and the design; the photographs of people are excluded from it on
    purpose (polaroids.html says why), and the embedded media belong to the
    people who made them. A licence stamped on every WebPage would be a claim
    about a portrait that the site specifically does not make.
  · a page type from a short list, where a more specific type is TRUE: the page
    about the street's name is an AboutPage; the pages that are lists of other
    things are CollectionPages. Everything else is a WebPage. No Article, no
    dates -- this site has no per-page published date to report honestly, and
    sitemap.xml's lastmod is the day the sitemap was built, not the day a room
    changed.

A page with no canonical has no address to describe -- that is 404.html -- and
gets nothing, deliberately.
"""
import html
import json
import re

SITE = "https://stimpunks.love/"
WEBSITE_ID = SITE + "#website"
ORG = {
    "@type": "Organization",
    "@id": "https://stimpunks.org/#org",
    "name": "Stimpunks Foundation",
    "url": "https://stimpunks.org/",
}
LICENCE = "https://creativecommons.org/licenses/by-sa/4.0/"

TYPES = {
    "danny-the-street.html": "AboutPage",
    "liner-notes.html": "CollectionPage",
    "changelog.html": "CollectionPage",
    "pebble-board.html": "CollectionPage",
}
BEGIN, END = "<!-- structured-data:begin -->", "<!-- structured-data:end -->"


def _field(src, pat):
    m = re.search(pat, src, re.S)
    return html.unescape(m.group(1)).strip() if m else ""


def graph(src, name):
    canon = _field(src, r'<link rel="canonical" href="([^"]+)"')
    if not canon:
        return None
    title = _field(src, r"<title>(.*?)</title>")
    desc = _field(src, r'<meta name="description" content="([^"]*)"')
    if not (title and desc):
        raise SystemExit(f"REFUSING: {name} has a canonical but no title or description to "
                         "describe it with. Structured data mirrors the head; it cannot "
                         "invent what the head leaves out.")
    front = _field(open_front(), r'<meta name="description" content="([^"]*)"') if name != "index.html" else desc
    website = {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        "name": "Stimpunks.Love",
        "url": SITE,
        "description": front,
        "inLanguage": "en",
        "publisher": {"@id": ORG["@id"]},
        "license": LICENCE,
    }
    page = {
        "@type": TYPES.get(name, "WebPage"),
        "@id": canon + "#webpage",
        "url": canon,
        "name": title,
        "description": desc,
        "inLanguage": "en",
        "isPartOf": {"@id": WEBSITE_ID},
        "publisher": {"@id": ORG["@id"]},
    }
    return {"@context": "https://schema.org", "@graph": [website, ORG, page]}


_FRONT = None


def open_front():
    """The front page's description, which is the website's."""
    global _FRONT
    if _FRONT is None:
        from pathlib import Path
        _FRONT = (Path(__file__).resolve().parent.parent / "index.html").read_text()
    return _FRONT


def block(src, name):
    g = graph(src, name)
    if g is None:
        return None
    # "</" cannot appear inside a <script>, so it is escaped the way JSON allows.
    body = json.dumps(g, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    return f'{BEGIN}\n<script type="application/ld+json">{body}</script>\n{END}'


def apply(src, name):
    """Return the page with its structured data written in, or removed if the
    page has no canonical to describe."""
    b = block(src, name)
    pattern = re.escape(BEGIN) + r".*?" + re.escape(END) + r"\n?"
    if BEGIN in src:
        return re.sub(pattern, (b + "\n") if b else "", src, count=1, flags=re.S)
    if b is None:
        return src
    if src.count("</head>") != 1:
        raise SystemExit(f"REFUSING: {name} does not have exactly one </head>.")
    return src.replace("</head>", b + "\n</head>", 1)
