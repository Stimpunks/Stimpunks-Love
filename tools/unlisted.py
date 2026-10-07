"""Rooms you have to know the address of.

WHAT THEY ARE. Ryan's brief, 2026-10-07: easter egg rooms that are not listed in
the changelog, the feeds, the sitemap, the teleporter, or anywhere -- "you have
to know the URL to get to them." So a page can say, on its own <body>, that it
is unlisted:

    <body class="..." data-unlisted>

and every tool that lists pages asks this file rather than keeping a list of its
own. THE PAGE SAYS SO ITSELF, AND THERE IS NO LIST, on purpose: this site
publishes its whole root (publish = "." in netlify.toml), so a list of unlisted
rooms in data/ would be one public file naming every one of them.

WHAT IT REVERSES. make-sitemap.py used to refuse any page not in its walking
order, with the reason that "a page nobody can find from the sitemap is
unpublished with extra steps", and DECISIONS.md said the same twice: the Den is
an easter egg and is still in the sitemap, and the zine table's issues cannot be
published unlisted. Ryan's call reverses that for pages that carry the mark, and
only for them. Every other page is still refused if it is not in the order.

WHAT IT DOES NOT REVERSE. The Den's rule was never really about the sitemap. It
was that on a Disabled people's site a secret only a sighted mouse user can find
is not a secret, it is an exclusion. An address is the same address for
everybody who has been told it, whatever they read with and however they move,
so an unlisted room keeps that rule: everything in it is reachable by keyboard
and by screen reader, and nothing in it is hidden by being small or faint.

WHAT UNLISTED MEANS, EXACTLY. No page on the street links to it, and it is in no
listing anybody or anything follows: not sitemap.xml, llms.txt, cb-rooms.json
(so not the teleporter, the #tags or the search), search-index.json, feed.xml,
the changelog, the map, the guild's board, Now Playing, the Foundry or the liner
notes. It carries noindex. tools/check-unlisted.py holds all of that.

WHAT IT DOES NOT MEAN. It is not secret. The repository is public on GitHub and
the site serves its own source, so the page's file, its share card, its data and
the tools that build it are all there for anybody who reads them. Unlisted is a
door with no path to it, not a lock.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BODY = re.compile(r"<body\b[^>]*>")
MARK = re.compile(r"\sdata-unlisted(?:[\s>=]|$)")
NOINDEX = re.compile(r'<meta name="robots" content="noindex[^"]*">')


def is_unlisted(src):
    """True when this page's own <body> says it is unlisted."""
    m = BODY.search(src)
    return bool(m and MARK.search(m.group(0)))


def pages(root=ROOT):
    """Every unlisted page, by filename, read off the pages themselves."""
    return sorted(p.name for p in root.glob("*.html") if is_unlisted(p.read_text()))
