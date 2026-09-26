#!/usr/bin/env python3
"""Write the pebble bowl into every hosted room, out of data/pebbles.json.

HELEN EDGAR'S IDEA, 2026-09-26, on a visit to the Solarpunk Hermitage to watch a
film: somewhere by the door for a visitor to leave a pebble, and a basket of the
host's own for a visitor to take one from. Pebbling is what penguins do and what
Stimpunks has a glossary entry and a whole arcade cabinet about: a small thing
you found and thought somebody would like, given on nobody's clock.

TWO HALVES, AND ONLY ONE OF THEM IS OURS TO WRITE. The basket is the host's, in
the data file, and this tool prints it. The bowl is what visitors leave, kept by
the CB beside the chalkboard for seven days and read by pebbles.js; this tool
prints the empty bowl, the box to leave one in, and the rules.

WHAT IT REFUSES:

  - A ROOM THE SERVER DOES NOT KNOW, OR ONE IT KNOWS THAT HAS NO BOWL.
    netlify/cb/lib.mjs's PEBBLE_ROOMS names the rooms the server keeps a bowl
    for, and this reads that array rather than keeping a copy of it: a bowl on a
    page the server refuses is a box that swallows what somebody typed, and a
    hand-kept second list is the _headers trap again.

  - A BASKET ITEM WITH NO TITLE, NOWHERE TO GO, OR NO LINE OF THE HOST'S OWN.
    A pebble is a thing somebody chose for somebody, and the line is the choosing.

  - A BASKET FILLED BY ANYBODY BUT ITS HOST. There is no way for a tool to know
    who wrote an item, so the rule lives in the data file and in CLAUDE.md, and
    the tool does the part it can: an empty basket prints that it is waiting for
    its host, so nobody fills it by guessing what the host likes.

  - A COUNT, A SCORE OR A TRADE, in the host's lines or the room's copy. No
    number of pebbles, no most-taken, no "give one to get one": the pebbling
    cabinet's refusal of a tally, and its difference between pebbling and
    trading, which is that the neighbours bring you things whether or not you
    have ever given them anything.

  - A LOOK THAT IS NOT THE ROOM'S OWN. A room may give its basket a drawing
    of its own ("look" in the data file, a class dressed in that room's
    section); the Faery Yurt's is a wicker basket, Helen's ask, 2026-09-26. The
    class is the room's, so check-classes.py holds it to one section like any
    other name, and a basket with no look is the plain list.

  - A PAGE THAT DOES NOT LOAD pebbles.js, which would print a bowl that can
    never be read and a box that can never send.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/pebbles.json"
LIB = ROOT / "netlify/cb/lib.mjs"

TALLY = re.compile(
    r"\b(?:\d+\s+(?:pebbles?|stones?|visitors?|people|times)|most[- ](?:taken|left|popular)"
    r"|leaderboard|score|streak|in exchange|give one to get|trade)\b", re.I)


def rooms_on_server():
    m = re.search(r"export const PEBBLE_ROOMS = \[([^\]]*)\];", LIB.read_text())
    if not m:
        raise SystemExit("REFUSING: netlify/cb/lib.mjs has no PEBBLE_ROOMS array to read.")
    return re.findall(r"'([a-z0-9-]+)'", m.group(1))


def esc(s):
    return html.escape(s, quote=False)


def bowl(room, r):
    host = esc(r["host"])
    out = [
        f'  <section class="pebbles{(" " + r["wrap"]) if r.get("wrap") else ""}" id="pebbles" '
        f'data-room="{room}" aria-labelledby="pebbles-h">',
        '    <h2 id="pebbles-h">Pebbles by the door</h2>',
        '    <p class="pebbles__intro">Penguins bring each other pebbles, and so do we: '
        'a small thing somebody found and thought somebody else would like, given on nobody&rsquo;s '
        f'clock. There is a basket here of things {host} has put out for anybody to take, and a bowl '
        f'for leaving one of your own. {r["idea"]}; what pebbling is, and whose word it is, is in '
        '<a href="https://stimpunks.org/glossary/penguin-pebbling/">our glossary</a> and in '
        '<a href="penguin-pebbling.html">the Arcade&rsquo;s pebbling cabinet</a>.</p>',
        '    <h3 id="pebbles-take-h">The basket: take one</h3>',
    ]
    if r["basket"]:
        look = (" " + r["look"]) if r.get("look") else ""
        out.append(f'    <ul class="pebbles__basket{look}" aria-labelledby="pebbles-take-h">')
        for item in r["basket"]:
            out += ['      <li class="pebbles__stone">',
                    f'        <a href="{html.escape(item["href"], quote=True)}">{item["title"]}</a>',
                    f'        <p>{item["why"]}</p>',
                    '      </li>']
        out.append('    </ul>')
    else:
        out.append(f'    <p class="pebbles__empty">The basket is empty until {host} fills it.</p>')
    out += [
        '    <h3 id="pebbles-leave-h">The bowl: leave one</h3>',
        '    <p class="pebbles__state" id="pebbles-state">The bowl needs scripts to read it.</p>',
        '    <ol class="pebbles__left" id="pebbles-left" aria-labelledby="pebbles-leave-h" hidden></ol>',
        '    <div class="pebbles__write" id="pebbles-write" hidden>',
        '      <form class="pebbles__form" id="pebbles-form">',
        '        <p class="pebbles__public" id="pebbles-public"><strong>Anybody who comes to this door '
        'can see what is in the bowl</strong>, signed on to the CB or not, for seven days.</p>',
        '        <label class="pebbles__lab" for="pebbles-text">A pebble, left as <b id="pebbles-as"></b>: '
        'what it is, in your words</label>',
        '        <textarea class="pebbles__text" id="pebbles-text" rows="2" maxlength="200" '
        'aria-describedby="pebbles-public"></textarea>',
        '        <label class="pebbles__lab" for="pebbles-link">Where it is, if it is somewhere else '
        '(you can leave this empty)</label>',
        '        <input class="pebbles__link" id="pebbles-link" type="url" inputmode="url" maxlength="300" '
        'autocomplete="off" spellcheck="false">',
        '        <span class="pebbles__row"><button type="submit" class="pebbles__go">Leave it</button></span>',
        '        <p class="pebbles__said" id="pebbles-said" role="status"></p>',
        '      </form>',
        '    </div>',
        '    <p class="pebbles__signon" id="pebbles-signon" hidden>Leaving a pebble takes a CB handle and '
        'the community password: <a href="community-center.html">sign on at the Community Center</a>, '
        'then come back. Taking one takes nothing.</p>',
        '    <ul class="pebbles__rules">',
        '      <li><strong>Anybody can see the bowl, and only people signed on to the CB can leave a '
        'pebble in it.</strong> A handle is whatever somebody typed, so a name in the bowl is not '
        'proof of who left it.</li>',
        '      <li><strong>A pebble goes seven days after it is left</strong>, and a full bowl lets its '
        'oldest go to make room. The base station can lift one out sooner, and so can we if you ask: '
        '<a href="privacy.html#the-pebble-bowls">what the bowls keep</a>.</li>',
        '      <li><strong>A link shows its whole address</strong>, so what you read is where it goes.</li>',
        '      <li><strong>Nothing here is counted</strong>: not what was taken, not what was left, and '
        'not who came to the door. Leaving a pebble is the only footprint there is, and nobody has '
        'to leave one.</li>',
        '    </ul>',
        '  </section>',
    ]
    return "\n".join(out)


def swap(page, block):
    begin, end = "<!-- pebbles:begin -->", "<!-- pebbles:end -->"
    src = page.read_text()
    if begin not in src or end not in src:
        raise SystemExit(f"REFUSING: {page.name} has no pebbles markers, so there is nowhere to "
                         "put the bowl. Add them on purpose.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda m: begin + "\n" + block + "\n  " + end, src, flags=re.S))


def main():
    d = json.loads(DATA.read_text())
    server = rooms_on_server()
    bad = []
    rooms = d.get("rooms") or {}
    for room in sorted(set(server) - set(rooms)):
        bad.append(f"{room}: the server keeps a bowl for it and data/pebbles.json has no room for it.")
    for room in sorted(set(rooms) - set(server)):
        bad.append(f"{room}: no bowl on the server. Add it to PEBBLE_ROOMS in netlify/cb/lib.mjs, "
                   "or take it out of here.")
    for room, r in rooms.items():
        page = ROOT / r.get("page", "")
        if not r.get("page") or not page.exists():
            bad.append(f"{room}: no page {r.get('page')!r}.")
            continue
        if not r.get("host"):
            bad.append(f"{room}: no host. The basket is somebody's.")
        if not r.get("idea"):
            bad.append(f"{room}: no line saying whose idea the bowl was. Helen's, and it says so in "
                       "every room it is in, in that room's own words.")
        if '<script src="pebbles.js" defer></script>' not in page.read_text():
            bad.append(f"{room}: {page.name} does not load pebbles.js, so its bowl could never be read.")
        for i, item in enumerate(r.get("basket") or []):
            for k in ("title", "href", "why"):
                if not item.get(k):
                    bad.append(f"{room} basket item {i + 1}: no {k}.")
            href = item.get("href", "")
            if href and not re.match(r"^(?:https://|[a-z0-9-]+\.html(?:#[\w-]+)?$)", href):
                bad.append(f"{room} basket item {i + 1}: {href!r} is not an https address or a page here.")
            for k in ("title", "why"):
                if TALLY.search(item.get(k, "")):
                    bad.append(f"{room} basket item {i + 1}: {TALLY.search(item[k]).group(0)!r}. "
                               "Nothing here is counted, scored or traded.")
    if bad:
        print("REFUSING to put out the pebble bowls:")
        for b in bad:
            print("  - " + b)
        return 1
    for room, r in rooms.items():
        block = bowl(room, r)
        if TALLY.search(re.sub(r"<[^>]+>", "", block)):
            print(f"REFUSING: the bowl's own copy says {TALLY.search(block).group(0)!r}.")
            return 1
        swap(ROOT / r["page"], block)
    filled = [r["host"] for r in rooms.values() if r["basket"]]
    print("pebbles: a bowl by the door in " + ", ".join(r["page"] for r in rooms.values())
          + (f"; baskets filled by {', '.join(filled)}" if filled else "; every basket waiting for its host"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
