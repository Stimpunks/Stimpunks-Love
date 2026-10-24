#!/usr/bin/env python3
"""Build the patches for the battle jacket: patches.js's list, each room's patch,
the list the CB server checks against, and their credits.

Ryan's brief, 2026-10-14: collect patches for your battle jacket, store them and
show them in your Profile, send them as stickers on the CB. Some lie about the
street; some are on a counter in a shop. Different sizes, shapes and designs,
every one sewn onto the same jacket.

ONE DRAWING, ONE FUNCTION. data/patches.json says what every patch is made of;
this writes that into patches.js, then RUNS patches.js under Node to get each
room's markup, so a patch in its room, on a jacket and on a sticker is the same
string out of the same function. Two renderers of one drawing is one drawing
that gets fixed in one of them.

WHAT IT REFUSES, and why each one is here:

  · A PATCH WITH NO WORDS FOR WHAT IT SHOWS. In its room it is an image, and
    its `alt` is all a screen reader is told. A patch is our design and not a
    person, so we describe it; nothing here describes anybody.

  · LETTERING UNDER 4.5:1 AGAINST THE PATCH IT IS STITCHED ON. Plural Mural's
    rule for painted words: lettering is decoration in WCAG's terms and the
    first thing anybody reads. Every colour is read out of love.css by name.

  · A COLOUR love.css DOES NOT DECLARE, OR A FACE IT DOES NOT. A patch is drawn
    in its own room's inks and lettered in its own room's face; a var() that
    names nothing paints nothing, which is the dead var() Covenstead's repaint
    left behind.

  · WORDS THAT GO OFF THE PATCH. Every line has a textLength, and the line has
    to fit inside the patch at that length.

  · TWO PATCHES ALIKE, A PATCH WITH NO ROOM, A ROOM WITH NO PLACE FOR ITS PATCH,
    OR A PLACE FOR A PATCH THAT IS NOT IN THE DATA. make-latibulum.py's rule: a
    generator that writes nothing and exits 0 is how two surfaces drift apart.

  · A PRICE, A COUNT OR A RARITY. Nothing on this street is for sale but what
    is in the honesty box, so a patch in a shop is free to take and says so;
    and a patch is not limited, rare, numbered or part of a set to complete,
    because a collection that tells you how much of it you are missing is a
    tally, the pebbling cabinet's refusal arriving on a jacket.

  · patches.js DOING MORE THAN IT SAYS. It reads love-cb and never writes it,
    sends to /cb/patches and nowhere else, through one fetch, and writes no
    markup from anything but its own list. And the server keeps WHICH patches,
    sorted, and nothing about when.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import html
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "patches.json"
JS = ROOT / "patches.js"
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
CSS = ROOT / "love.css"
CREDITS = ROOT / "liner-notes.html"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"

HOW = {
    "scattered": ("Pick it up", "pick it up"),
    "shop": ("Take one", "take one"),
}
NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|cannot|does not|won't|"
            r"will not|is not|are not|isn't|aren't|nobody|nor)")
VOCAB = (r"\$\d|\bprices?\b|\bcosts?\b|\bbuy\b|\bbought\b|\bsells?\b|\bsold\b|\bfor sale\b|\bpay\b|\bpaid\b|"
         r"\brare\b|\brarer\b|\brarest\b|\brarity\b|\blimited\b|\bexclusive\b|\bnumbered\b|\bcollect them all\b|"
         r"\bcomplete (?:the|your) (?:set|jacket|collection)\b|\bscores?\b|\bpoints?\b|\bunlock\w*|\bearn\w*")
PATH_D = re.compile(r"[MmLlHhVvCcSsQqTtAaZz0-9 .,\-]+")

problems = []


def refuse(msg):
    problems.append(msg)


def lum(hexstr):
    h = hexstr.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    def ch(v):
        v = int(v, 16) / 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = ch(h[0:2]), ch(h[2:4]), ch(h[4:6])
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def e(s):
    return html.escape(str(s), quote=True)


def swap(text, begin, end, block, where):
    if begin not in text or end not in text:
        refuse(f"{where} has no {begin} ... {end}, so there is nowhere to write.")
        return text
    return re.sub(re.escape(begin) + r".*?" + re.escape(end), lambda m: begin + block + end, text, flags=re.S)


def main():
    css = CSS.read_text()
    colours = {}
    for name, hexv in re.findall(r"(--[a-z0-9-]+):\s*(#[0-9A-Fa-f]{3,8})\b", css):
        colours.setdefault(name, hexv)
    faces = {}
    for block in re.findall(r"@font-face\s*\{[^}]*\}", css):
        fam = re.search(r"font-family:\s*'([^']+)'", block)
        wt = re.search(r"font-weight:\s*(\d+)", block)
        sty = re.search(r"font-style:\s*(\w+)", block)
        if fam and wt and (not sty or sty.group(1) == "normal"):
            faces.setdefault(fam.group(1), set()).add(int(wt.group(1)))

    def hexof(c, where):
        if c is None:
            return None
        if re.fullmatch(r"#[0-9A-Fa-f]{6}", c):
            return c
        if c in colours:
            return colours[c]
        refuse(f"{where}: {c!r} is not a colour love.css declares, and a var() naming nothing paints nothing.")
        return None

    d = json.loads(DATA.read_text())
    patches = d["patches"]
    seen, sigs = set(), {}
    for p in patches:
        pid = p.get("id", "?")
        where = f"patch {pid!r}"
        if not re.fullmatch(r"[a-z0-9-]+", pid) or pid in seen:
            refuse(f"{where}: id is not a marker-safe name, or is used twice.")
        seen.add(pid)
        for f in ("name", "page", "room", "spot", "says", "alt", "ground"):
            if not str(p.get(f, "")).strip():
                refuse(f"{where}: no `{f}`.")
        if p.get("how") not in HOW:
            refuse(f"{where}: how {p.get('how')!r} is neither scattered nor shop.")
        if not (ROOT / p.get("page", "")).exists():
            refuse(f"{where}: {p.get('page')!r} is not on disk.")
        w, h = p.get("w", 0), p.get("h", 0)
        if not (40 <= w <= 300 and 40 <= h <= 200):
            refuse(f"{where}: {w} by {h} millimetres is not the size of a patch you could sew on a jacket.")
        ground = hexof(p.get("ground"), where)
        if p.get("how") == "shop" and "free to take" not in p.get("spot", ""):
            refuse(f"{where}: a patch in a shop says it is free to take, because nothing here is for sale.")
        for f in ("name", "spot", "says", "alt"):
            text = str(p.get(f, ""))
            if re.search(r"\d", text):
                refuse(f"{where}: {f} has a number in it. Nothing about a patch is counted.")
            for m in re.finditer(VOCAB, text, re.I):
                window = text[max(0, m.start() - 48):m.end()]
                if not re.search(rf"\b{NEGATION}\b", window, re.I):
                    refuse(f"{where}: {f} says {m.group(0)!r}. A patch has no price, no rarity and no set to complete.")
        if "link" in p:
            words, href = p["link"]
            if words not in p["says"]:
                refuse(f"{where}: the link's words {words!r} are not in what it says.")
            if not re.fullmatch(r"https://stimpunks\.org/[a-z0-9/_-]+/", href):
                refuse(f"{where}: the link {href!r} is not one of our own pages with its trailing slash.")
            elif MIRROR.exists():
                url_found = any(f'url: "{href}"' in t.read_text(errors="ignore")
                                for t in MIRROR.rglob("*.md") if href.rstrip("/").rsplit("/", 1)[-1] in t.name)
                if not url_found:
                    refuse(f"{where}: {href} is not a page in the Knowledge System mirror.")
        texts = 0
        for it in p.get("draw", []):
            if it[0] == "path":
                if len(it) != 5 or not PATH_D.fullmatch(it[1]):
                    refuse(f"{where}: a path that is not d, fill, stroke and width, or not a path.")
                    continue
                hexof(it[2], where)
                hexof(it[3], where)
            elif it[0] == "text":
                texts += 1
                if len(it) != 8:
                    refuse(f"{where}: a line of text that is not x, y, size, face, fill, words and length.")
                    continue
                _, x, y, size, face, fill, words, length = it
                if face not in faces:
                    refuse(f"{where}: {face!r} is not a face love.css declares.")
                fh = hexof(fill, where)
                if fh and ground:
                    r = ratio(fh, ground)
                    if r < 4.5:
                        refuse(f"{where}: {words!r} measures {r:.2f}:1 against the patch it is stitched on. "
                               "Lettering is the first thing anybody reads, so it is held to 4.5.")
                if x - length / 2 < 2 or x + length / 2 > w - 2 or y - size * 0.75 < 1 or y > h - 1:
                    refuse(f"{where}: {words!r} runs off the patch.")
            else:
                refuse(f"{where}: {it[0]!r} is neither a path nor a line of text.")
        if not texts:
            refuse(f"{where}: no lettering. Every patch on this street says something.")
        sig = json.dumps(p.get("draw"))
        if sig in sigs:
            refuse(f"{where}: draws exactly what {sigs[sig]!r} draws.")
        sigs[sig] = pid

    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1

    # The list patches.js draws from, every text with the weight its face has.
    def weight(face):
        ws = faces[face]
        return 400 if 400 in ws else min(ws)
    data = {"patches": [{
        "id": p["id"], "name": p["name"], "room": p["room"], "page": p["page"], "spot": p["spot"],
        "how": p["how"], "alt": p["alt"], "w": p["w"], "h": p["h"],
        "draw": [it if it[0] == "path" else it + [weight(it[4])] for it in p["draw"]],
    } for p in patches]}
    js = JS.read_text()
    js = swap(js, "/* patches:data:begin */", "/* patches:data:end */",
              "\n  var DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n  ",
              JS.name)
    JS.write_text(js)

    lib = LIB.read_text()
    lib = swap(lib, "/* patch:ids:begin */", "/* patch:ids:end */",
               "\nexport const PATCH_IDS = " + json.dumps([p["id"] for p in patches]) + ";\n", LIB.name)
    LIB.write_text(lib)

    # Every room's markup out of patches.js itself.
    node = subprocess.run(
        ["node", "-e", "require(process.argv[1]); const P = globalThis.lovePatches;"
         "process.stdout.write(JSON.stringify(Object.fromEntries(P.list.map(p => [p.id, P.svg(p.id, { label: true })]))));",
         str(JS)], capture_output=True, text=True)
    if node.returncode != 0:
        print("REFUSING: patches.js would not run under Node:\n" + node.stderr)
        return 1
    drawn = json.loads(node.stdout)

    marked = {}
    for page in sorted(ROOT.glob("*.html")):
        for pid in re.findall(r"<!-- patch:([a-z0-9-]+):begin -->", page.read_text()):
            marked.setdefault(pid, []).append(page.name)
    for pid, pages in marked.items():
        if pid not in seen:
            refuse(f"{', '.join(pages)} has a place for a patch {pid!r} that is not in the data.")
        elif len(pages) > 1:
            refuse(f"patch {pid!r} has a place in more than one room: {', '.join(pages)}.")

    for p in patches:
        page = ROOT / p["page"]
        if marked.get(p["id"]) != [p["page"]]:
            refuse(f"patch {p['id']!r}: {p['page']} has no place for it between patch:{p['id']} markers.")
            continue
        btn, verb = HOW[p["how"]]
        says = e(p["says"])
        if "link" in p:
            says = says.replace(e(p["link"][0]), f'<a href="{e(p["link"][1])}">{e(p["link"][0])}</a>', 1)
        block = "\n".join([
            "",
            f'  <figure class="patch patch--{p["how"]}" data-patch="{p["id"]}" id="patch-{p["id"]}">',
            f'    {drawn[p["id"]]}',
            f'    <figcaption class="patch__words">',
            f'      <p class="patch__name"><b>A patch: {e(p["name"])}.</b> {e(p["spot"])}</p>',
            f'      <p class="patch__says">{says}</p>',
            f'      <p class="patch__how">Signed on to the CB, {verb} and it goes on the battle jacket in your Profile, '
            f'sewn on with every other patch on the street, whatever its shape.</p>',
            f'      <p class="patch__go" hidden><button type="button" class="patch__take">{btn}</button></p>',
            f'      <p class="patch__said" role="status"></p>',
            f'    </figcaption>',
            f'  </figure>',
            "  "])
        page.write_text(swap(page.read_text(), f"<!-- patch:{p['id']}:begin -->",
                             f"<!-- patch:{p['id']}:end -->", block, page.name))

    # The credits.
    creds = "\n".join([
        "",
        "  <p><b>The patches.</b> Every patch for the battle jacket is ours, drawn for this street by "
        "<code>tools/make-patches.py</code> out of <code>data/patches.json</code> and lettered in its own "
        "room&rsquo;s face, so each typeface is the one already credited for that room above. "
        "<b>Lone wolfing</b>, on the Cave&rsquo;s patch, is "
        '<a href="https://stimpunks.org/2023/06/18/lone-wolfing-the-joys-of-autistic-solitude/">Betsy '
        "Selvam&rsquo;s</a> word for being alone well, and <b>Kindness Is Punk</b>, on Club Chronic&rsquo;s, "
        'is from our own <a href="https://stimpunks.org/philosophy/rules-of-punk/">Rules of Punk</a>. '
        "<b>A future with dirt behind our ears</b>, on Brighter Days&rsquo; Solarpunk patch, is after Adam "
        "Flynn&rsquo;s "
        '<a href="https://hieroglyph.asu.edu/2014/09/solarpunk-notes-toward-a-manifesto/">&ldquo;Solarpunk: '
        "Notes toward a manifesto&rdquo;</a> (Project Hieroglyph, 2014): &ldquo;Solarpunk is a future with a "
        "human face and dirt behind its ears.&rdquo; Our glossary credits the line to a video; Star "
        "Stuff&rsquo;s Shared Air zine traced it to Flynn, and the line was read in his piece for this patch. A battle "
        "jacket is a punk and metal tradition that belongs to nobody, and nothing of anybody else&rsquo;s "
        "patches is copied here.</p>",
        "  "])
    CREDITS.write_text(swap(CREDITS.read_text(), "<!-- patches:credits:begin -->",
                            "<!-- patches:credits:end -->", creds, CREDITS.name))

    # What patches.js does, read rather than trusted.
    src = re.sub(r"/\*.*?\*/", " ", js, flags=re.S)
    src = re.sub(r"(?m)^\s*//.*$", " ", src)
    for m in re.finditer(r"localStorage\.(\w+)\(\s*([^,)]+)", src):
        if m.group(1) != "getItem" or m.group(2).strip() != "PASS_KEY":
            refuse(f"patches.js {m.group(1)}s {m.group(2).strip()}. It reads love-cb and nothing else, and writes nothing.")
    if "var PASS_KEY = 'love-cb';" not in src or "var PATCHES = '/cb/patches';" not in src:
        refuse("patches.js no longer names love-cb and /cb/patches as the two things it touches.")
    if src.count("fetch(") != 1 or "fetch(PATCHES," not in src:
        refuse("patches.js sends somewhere other than /cb/patches, or not through its one call().")
    if re.search(r"innerHTML|outerHTML|insertAdjacentHTML|document\.write|sessionStorage|indexedDB|"
                 r"document\.cookie|sendBeacon|WebSocket|EventSource|XMLHttpRequest", src):
        refuse("patches.js writes markup from a string, or keeps or sends something some other way.")
    lib = LIB.read_text()
    tp = re.search(r"export async function takePatch\(.*?\n\}", lib, re.S)
    if not tp or "s.setJSON(key, { patches: next }" not in tp.group(0) or re.search(r"\bnow\b|Date|\bt:", tp.group(0)):
        refuse("lib.mjs: takePatch keeps something other than which patches. It keeps nothing about when.")
    da = re.search(r"export async function deleteAccount\(.*?\n\}", lib, re.S)
    if not da or "await forgetPatches(petKey(handle), s);" not in da.group(0):
        refuse("lib.mjs: deleting a username no longer deletes the patches kept under it.")
    if "forgetPatches(pk)" not in (ROOT / "netlify" / "functions" / "cb-pets.mjs").read_text():
        refuse("cb-pets.mjs: Forget me no longer forgets the battle jacket.")
    love = (ROOT / "love.js").read_text()
    if "'/patches.js'" not in love:
        refuse("love.js no longer loads patches.js on a page with a patch in it, so no patch can be picked up.")

    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1
    print(f"patches: every patch drawn by patches.js, written into its room, lettered at 4.5:1 or more, "
          f"and listed for the CB.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
