"""The pages that are windows, not rooms.

A WINDOW IS A PAGE OF OURS THAT OPENS IN A BROWSER WINDOW OF ITS OWN TO HOLD ONE
THING. The first is call-window.html (Ryan, 2026-10-13): Pop out on a call moves
the call into it, and it stays open while somebody goes from room to room in the
window they came from, which is the only way a call can follow anybody here,
because every room is a page and a page that goes takes its call with it. The
second is cb-window.html (Ryan, 2026-10-19), which Pop out on the radio moves the
radio into, for the same reason.

It is the radio's furniture in a window, not a place on the street, so the tools
that hold every page to the street's rules for a PLACE name it here and leave it
out, each saying why where it does, the way 404.html is named and never skipped
by pattern:

  · make-sitemap.py  no sitemap entry, no line in llms.txt, no room in
                     cb-rooms.json, so the teleporter, #tags and the search never
                     offer it: there is nothing in it until a call is popped out.
  · make-og.py       no share card: nobody shares a call window, and a card for
                     an empty one would unfurl a page that shows nothing.
  · make-guild.py    no job marker, because nothing is ever found in it.
  · make-signoff.py  no sign-off: every link in one would take the window, and
                     the call in it, somewhere else.
  · fractals.py      no fractal recipe, because the fractal window's switch is
                     in the sign-off it does not have.

Everything else holds it as it holds any page: one h1, no stray inline script,
ids, classes, contrast as it renders, focus rings, Gentle. It has no canonical,
so make-structured.py writes it no structured data, as with the 404.

Adding a window is a line here and a reason in each of those tools. A room is
never a window: a place goes in make-sitemap.py's ORDER.
"""

WINDOWS = {"call-window.html", "cb-window.html"}


def is_window(name):
    return name in WINDOWS
