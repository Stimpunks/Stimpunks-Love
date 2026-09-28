#!/usr/bin/env python3
"""Build the Cooldown Room's vending machine, and its credits.

ONE DATA FILE, ONE TOOL: data/cooldown-room.json becomes every slot on the
glass in cooldown-room.html and the list in liner-notes.html.

WHAT IT REFUSES, and each is a sentence the room says:

  - A SNACK THAT DOES NOT SAY WHAT IS IN IT AND HOW IT FEELS. The runtime rule,
    arriving at a vending machine: the room says every slot tells you before you
    press. What it is made of is the whole list, so somebody avoiding something
    can see it; how it feels is texture, temperature and strength.

  - A PRICE, A COST, OR ANYTHING OWED. The room says everything is free and the
    machine does not ask. Nothing For Sale's rule, on a machine built to take
    coins. "Pay it forward" is refused with the rest, because it turns a gift
    into a debt owed to somebody else instead.

  - A VERDICT ON FOOD. Healthy, junk, guilty, clean, cheat, earned, deserve,
    calories, and anything a snack is supposed to do for a body -- energy, fuel,
    recharge, boost, refuel -- in the data and in the room's own words, with a
    negation window so the room can say it will not. A cooldown room beside a
    rave is exactly where that talk arrives as a kindness.

  - A MAKER WHO IS A BRAND. Every maker is a local of this road, invented for
    this machine; a trade name would be the room borrowing somebody real's
    reputation. A maker is somebody's name, or a group, and where they are.

  - A SLOT THAT IS NOT ON THE MACHINE, OR ONE USED TWICE. Rows A to C, columns
    1 to 4, which is what the glass has room for.

  - A SCRIPT THAT KEEPS OR SENDS ANYTHING, or makes a sound. The room says
    nothing is counted, nothing is kept and nothing makes a sound.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/cooldown-room.json"
ROOM = ROOT / "cooldown-room.html"
NOTES = ROOT / "liner-notes.html"
JS = ROOT / "cooldown.js"

SLOT = re.compile(r"^[A-C][1-4]$")
WRAPS = {"mint", "coral", "lilac", "butter", "sky", "rose"}
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
PRICE = re.compile(r"[$£€¥]\s?\d|\b\d+\s?(?:p|c|cents?|pence|dollars?|pounds?|euros?)\b|"
                   r"\b(?:price[ds]?|priced|costs?|pay|paid|payment|charge[ds]?|owe[ds]?|debt|"
                   r"pay it forward)\b"
                   # A coin is only money here when it goes INTO something. The
                   # first run refused Cucumber Coins, which are sliced, and the
                   # pattern was narrowed rather than the snack renamed.
                   r"|\b(?:insert|put in|drop in|feed it)\s+(?:a\s+|your\s+)?(?:coins?|tokens?)\b", re.I)
VERDICT = re.compile(r"\b(?:healthy|healthier|unhealthy|junk|guilt(?:y|-free)|clean eating|cheat|"
                     r"earn(?:ed|s)?|deserve[ds]?|treat yourself|calories?|kcal|nutritious|"
                     r"superfoods?|energy|refuel|recharge[ds]?|boosts?|detox|good for you|"
                     # FUEL ONLY AS SOMETHING A BODY TAKES ON. Its first run
                     # refused "the hut by the fuel pumps", which is a place on
                     # an airstrip road, and the pattern was narrowed.
                     r"fuel(?:s|led|ing)?\s+(?:you|your|up|the body|yourself)|"
                     r"bad for you|electrolytes?)\b", re.I)
BRAND = re.compile(r"(?:™|®|\b(?:Inc|Ltd|LLC|Co\.|Corp)\b)")
NEGATED = re.compile(r"\b(?:not|no|nothing|never|nor|without|nobody|none)\b[^.;:]*$", re.I)
KEEPS = re.compile(r"localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|"
                   r"sendBeacon|WebSocket|AudioContext|new Audio\b|\.play\(")


def esc(s):
    return html.escape(s, quote=False)


def attr(s):
    return html.escape(s, quote=True)


def plain(s):
    s = re.sub(r"<script.*?</script>|<style.*?</style>|<!--.*?-->", " ", s, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


def swap(page, marker, block, indent=""):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    src = page.read_text()
    if begin not in src or end not in src:
        raise SystemExit(f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to write.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda m: begin + "\n" + block + "\n" + indent + end, src, flags=re.S))


def sweep(text, where, bad):
    for pat, why in ((PRICE, "a price, a cost or something owed, and everything in here is free"),
                     (VERDICT, "a verdict on food, or something a snack is supposed to do for a body")):
        for m in pat.finditer(text):
            if NEGATED.search(text[max(0, m.start() - 60):m.start()]):
                continue
            bad.append(f"{where} says {m.group(0)!r}, which is {why}.")


def check(d, page, js):
    bad = []
    snacks = d.get("snacks") or []
    if not snacks:
        bad.append("the machine is empty, and the room says it does not run out.")
    seen = set()
    for s in snacks:
        n = (s.get("name") or "").strip() or "<unnamed>"
        slot = s.get("slot") or ""
        if not SLOT.match(slot):
            bad.append(f"{n!r} is in slot {slot!r}, and the glass has rows A to C and columns 1 to 4.")
        if slot in seen:
            bad.append(f"slot {slot} holds two snacks.")
        seen.add(slot)
        for k in ("name", "maker", "where", "in", "feels"):
            v = (s.get(k) or "").strip()
            if not v:
                bad.append(f"{n!r} has no {k!r}. Every slot says what is in it, who made it and how it "
                           "feels, before the press.")
            if ENTITY.search(v):
                bad.append(f"{n!r}'s {k} has an HTML entity in it; everything is escaped on the way in.")
        if s.get("wrap") not in WRAPS:
            bad.append(f"{n!r}'s wrapper is {s.get('wrap')!r}, which is not one of the room's colours.")
        if BRAND.search(s.get("maker", "") + " " + s.get("where", "")):
            bad.append(f"{n!r}'s maker reads as a business name. Every maker is a local of this road.")
        sweep(" ".join(str(s.get(k, "")) for k in ("name", "in", "feels", "where")), f"{n!r}", bad)
    said = plain(re.sub(r"<!-- cool-slots:begin -->.*?<!-- cool-slots:end -->", " ", page, flags=re.S))
    sweep(said, "the room", bad)
    if "everything is free" not in said.lower():
        bad.append("the room no longer says everything is free.")
    if KEEPS.search(js):
        bad.append(f"cooldown.js uses {KEEPS.search(js).group(0)!r}. The room says nothing is kept, "
                   "nothing is sent and nothing makes a sound.")
    return bad


def slots(snacks):
    out = []
    for s in sorted(snacks, key=lambda x: x["slot"]):
        out.append(
            f'        <li class="cool-slot-wrap"><button type="button" class="cool-slot cool-slot--{s["wrap"]}"'
            f' data-slot="{s["slot"]}" data-name="{attr(s["name"])}" data-maker="{attr(s["maker"])}">\n'
            f'          <span class="cool-slot__code">{s["slot"]}</span>\n'
            f'          <span class="cool-slot__name">{esc(s["name"])}</span>\n'
            f'          <span class="cool-slot__who">{esc(s["maker"])}, {esc(s["where"])}</span>\n'
            f'          <span class="cool-slot__feels">{esc(s["feels"])}</span>\n'
            f'          <span class="cool-slot__in"><b>In it:</b> {esc(s["in"])}</span>\n'
            f'          <span class="cool-slot__drop" aria-hidden="true" hidden>In the tray, free.</span>\n'
            '        </button></li>')
    return "\n".join(out)


def credits(snacks):
    return "\n".join(
        f'      <tr><td>{s["slot"]}</td><td><strong>{esc(s["name"])}</strong></td>'
        f'<td>{esc(s["maker"])}, {esc(s["where"])}</td><td>{esc(s["in"])}</td></tr>'
        for s in sorted(snacks, key=lambda x: x["slot"]))


def main():
    d = json.loads(DATA.read_text())
    bad = check(d, ROOM.read_text(), JS.read_text())
    if bad:
        print("REFUSING to build the Cooldown Room:")
        for b in bad:
            print("  - " + b)
        return 1
    swap(ROOM, "cool-slots", slots(d["snacks"]), "        ")
    swap(NOTES, "cool-credits", credits(d["snacks"]), "      ")
    print(f"cooldown room: {len(d['snacks'])} slots on the glass, every one saying what is in it and "
          "how it feels, and nothing priced.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
