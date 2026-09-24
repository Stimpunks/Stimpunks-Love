"""The sign-off line at the foot of every page, written in one place.

WHAT IT IS AND WHAT IT IS NOT. Every page ends with the same short line of links
-- back to the top, the liner notes, Your Room, the changelog, the privacy page,
the feed, whose street this is -- because a visitor looking for how to leave,
who made this, or what happens to them should find it in the same place
wherever they are. That is the spec's "consistent help", and a privacy page is
supposed to be reachable from every page, not only from the front door.

IT IS NOT THE STREET'S FOOTER. The front page ends on the pavement: chalk,
Rock Salt, the street's own yellow. That look stays on the street. The Guild's
section of love.css records why -- a shared footer "would be the one piece of
the street's own look reaching into a world" -- and this is built to the letter
of that: the sign-off brings no colour, no typeface and no ground of its own.
It is set in whatever the room it lands in already uses, like the job markers,
so it reads as the room signing off rather than the street turning up. The
front page keeps its pavement, and only the links inside it come from here.

BACK TO TOP IS A PLAIN LINK TO THE BODY. <body id="top"> makes the body the
fragment's target, so following it jumps to the top AND moves the keyboard's
starting point there: the next Tab lands on the skip link rather than on
whatever follows the sign-off. No smooth scroll, and nothing scripted -- a
jump is the same at every dial setting, and the dial exists so that nothing on
this site moves somebody's view that they did not ask to move.

WHERE AM I? IS THE ONE LINK THAT IS DIFFERENT ON EVERY PAGE, AND IT IS STILL
WRITTEN HERE ONCE. It goes to the model on map.html with the page's own name as
the fragment -- map.html#at-the-mopery -- and every place on the model carries
that id, so the map opens scrolled to where you were with a flag on it saying
so. That is :target and nothing else: no script, no referrer, nothing stored,
and a page that is not on the model is a refusal in make-map.py before it can be
a dead fragment here. 404.html has no address of its own, so its link is to the
model without one.

THE LIST IS HERE ONCE. make-signoff.py writes it into every page; make-foundry.py
builds its whole page from a template and calls the same function, so a rebuild
of the Foundry cannot quietly drop it.
"""
import html

LINKS = [
    ("liner-notes.html", "Liner notes"),
    ("your-room.html", "Your Room"),
    ("changelog.html", "Changelog"),
    ("privacy.html", "Privacy"),
    ("feed.xml", "Feed"),
]
BEGIN, END = "<!-- signoff:begin -->", "<!-- signoff:end -->"


def where(page=None, absolute=False):
    """The Where am I? link for one page: the model, opened at that page."""
    pre = "/" if absolute else ""
    frag = f"#at-{page[:-5]}" if page and not absolute else ""
    return f'<a href="{pre}map.html{frag}">Where am I?</a>'


def links(absolute=False, page=None):
    """The shared links as one run of HTML. `absolute` for 404.html, which is
    served at whatever address somebody mistyped, so its paths start with a
    slash; `page` is the file the line is going into, for Where am I?"""
    pre = "/" if absolute else ""
    return " &middot; ".join(
        [where(page, absolute)] +
        [f'<a href="{pre}{href}">{html.escape(text)}</a>' for href, text in LINKS])


def block(absolute=False, page=None):
    """The whole sign-off, between its markers. A <footer> directly in <body>,
    so it is the page's contentinfo landmark and a screen reader can jump to it."""
    return (
        f"{BEGIN}\n"
        '<footer class="signoff">\n'
        f'  <p class="signoff__line"><a href="#top">Back to top<span aria-hidden="true"> &uarr;</span></a>'
        f" &middot; {links(absolute, page)} &middot; "
        'A <a href="https://stimpunks.org/">Stimpunks Foundation</a> street.</p>\n'
        "</footer>\n"
        f"{END}"
    )
