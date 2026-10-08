#!/usr/bin/env python3
"""Build Hey, Good Cookin' out of data/hey-good-cookin.json and
data/hey-good-cookin-month.json: the hall, Ryan's welcome, the placards and
their rules, the shelf at the start of the line, every station and every dish,
the hot line's week, the line from a chair, the classes and the temperatures
they cook to, the teaching screen, the rack, and the room's credits in the
liner notes.

WHAT THE ROOM IS. A community kitchen. Ryan Boren's brief, 2026-10-04: come if
you are hungry for food or for knowledge, nobody is turned away, you do not
have to pay and you do not have to volunteer; cafeteria-style self-service
with sit-down restaurant-style seating, and the communication badge placards
on every table; an omnivorous menu with plenty of vegan and vegetarian
options; wheelchair access at the service line and the seating; some cooking
classes; and a rack of the last month from cooking channels he listed. His
words are in the room word for word: the welcome, the placards and the rules.

NOBODY OWES ANYTHING HERE, AND THE TOOL REFUSES THE VOCABULARY THAT SAYS
OTHERWISE. Nothing For Sale's rule, in the one room on the street that feeds
people: no pay it forward, no give back, no donation jar, no pay what you can,
no earning a meal; and nobody is sorted, so no needy, no less fortunate, no
deserving, no the homeless; and nobody is asked for anything at the door, so
no proof, no ID, no sign-in, no register, no referral. The friendly edits are
a jar by the trays and a volunteer rota on the wall, and both would make a
free meal into a transaction with the payment deferred.

EVERY DISH SAYS WHAT IS IN IT, AND THE ALLERGEN LINE IS WORKED OUT FROM THE
INGREDIENTS RATHER THAN TYPED BESIDE THEM. The runtime rule for a kitchen: a
dish card that says what is in it before you take it. The FDA's nine major
allergens and gluten are read out of each dish's ingredients with one list of
words, so the line saying "contains wheat" cannot forget what the line saying
"breadcrumbs" said. A vegan dish with anything from an animal in it is
refused; so is a vegetarian dish with meat, fish, a stock made from either,
gelatin or parmesan (made with calf rennet); so is a meat dish that does not
say which animal, or names one its ingredients do not have, or has one it does
not name. Every meat dish naming its animal is what lets somebody who keeps
halal or kosher, or eats no pork, choose, in a kitchen that claims neither.

PLENTY OF VEGAN AND VEGETARIAN, AND THE VEGAN PAN IS FIRST. More than half the
line is vegan or vegetarian, every station has a vegan dish, and on the hot
line's week the vegan pan is first every day and the same size as the others:
Big Steep Fermentables' rule for its alcohol-free pour, so nobody vegan
reaches past meat to get to dinner and the vegan dish is never the side.

NOTHING ON THE BOARD IS A VERDICT ON FOOD OR ON A BODY. Healthy, guilt-free,
clean, junk, cheat, indulgent, superfood, detox, calories: refused in our
voice, with the negation window, so the room can still say it has no calorie
counts. And nothing sorts eaters: picky, fussy, clean your plate. Samefood
Cafe's rule and Vital Plant Living's, arriving where the friendly edit is a
calorie count on every card.

THE CLASSES SAY HOW LONG BEFORE YOU START, WHAT THEY ARE LIKE, AND THAT THEY
CAN BE DONE SITTING DOWN. Hands-on time and time in all, the runtime rule for a
recipe; what it sounds, smells and feels like, the Picture House's content line
for a kitchen; and a seated line for every class, because the teaching counter
is built to the same numbers as the tables. A class that cooks anything from an
animal must name the safe temperature that covers it, off FoodSafety.gov's
chart, and the tool works out which from the class's own words. Nothing is
graded, no register, no certificate.

THE PLACARDS ARE THE ONLY GREEN, YELLOW AND RED IN THE ROOM. On a table a
colour means something, so nothing else in here may borrow one: the tool reads
every --hgc- colour in :root and every literal colour in this room's section of
love.css and refuses a green, yellow, orange or red that is not one of the three
placards, and refuses the placards' colours anywhere but a rule about a
placard, or a placard in the drawing. And colour is never alone: every placard
carries its shape and its word, the ones on our Interaction Badges page.

THE DRAWING KEEPS THE HOUSE RULES. The hall's tables and the placards on them
come from the data, and the tool refuses a red placard on a large table and a
red placard on a 4-top while any 2-top stands empty, which are Ryan's rules;
the drawing that shows them cannot break them.

THE NAME PLAYS ON A SONG TITLE AND THE ROOM CARRIES NOTHING ELSE OF THE SONG.
Hank Williams's Hey, Good Lookin' (1951). The words that come next in it are a
lyric, and this street sets no lyric it does not hold permission for, so the
tool refuses them anywhere on the page. The friendly edit is finishing the
joke.

THE RACK, out of data/hey-good-cookin-month.json, is Learning Large's rack in a
kitchen, and the reasons are that room's, The Open Notebook's and the kitchen
telly's: tools/pull-cookin-month.py reads each channel's own feeds on the
morning timer in tools/daily-cookin.sh, which runs this with --month so that
only the rack is rewritten. It refuses a video older than the month, a row
carrying a description, a thumbnail or a count, a screen with no runtime, a
door with no reason, an id twice, and a channel not in the list. THE TITLES ARE
THE CHANNELS' AND ARE NOT SWEPT: a cooking channel will call a dish healthy or
a cheat meal, which is theirs to say, beside the house rules of ours that the
room prints.

THE TEACHING SCREEN IS ONE SCREEN FOR THE WHOLE RACK, with nothing of its own on
it: it ships hidden and rack.js unhides it, the Doom Scoop's empty screen. A
short goes up upright, because its second button carries data-rack-shape="tall".

THE PAGE HAS NOWHERE TO TYPE AND NO SCRIPT OF ITS OWN: love.js, love-embed.js,
rack.js and quest.js, and nothing that reaches the network by itself. A
community kitchen that took your name at the door would be a different place.

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
DATA = ROOT / "data/hey-good-cookin.json"
MONTHLY = ROOT / "data/hey-good-cookin-month.json"
PAGE = ROOT / "hey-good-cookin.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"

YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
CHANNEL = re.compile(r"^UC[A-Za-z0-9_-]{22}$")
HERE = ZoneInfo("America/Denver")
MONTH = 30           # days kept; tools/pull-cookin-month.py holds the same number
SCREEN = ("hgc", "the teaching screen")
SECTION = 93         # love.css's section for this room
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
DIETS = {"vegan", "vegetarian", "meat", "fish"}
SHAPES = {"circle", "triangle", "square"}
PLACARD_KEYS = ("go", "ask", "alone")

LOG_KEYS = {"id", "source", "form", "title", "published", "state", "why", "runs", "channel"}
LOG_STATES = {"screen", "door", "pending", "gone"}
DOOR_WHY = {"no embedding": "Its channel has switched off showing it on other sites, so it plays on YouTube and not in here.",
            "age-gated": "YouTube shows it only to signed-in adults, so it plays there and not in here."}
DISH_KEYS = {"name", "diet", "what", "animal", "note"}
CLASS_KEYS = {"key", "title", "makes", "hands", "total", "senses", "needs", "ingredients", "steps", "swap", "safe"}

# ── What is in a dish ────────────────────────────────────────────────────────
# PHRASES are read first and stand for what they really are, so "oat milk" is
# not milk, "peanut butter" is not butter, and "egg noodles" are both. Then
# each allergen's words. Every list is ours and short, and the tool refuses a
# dish rather than guess when the two disagree.
PHRASES = [
    (r"oat milk", "oats"), (r"soy milk", "soy"), (r"peanut butter", "peanuts"),
    (r"egg noodles", "eggs wheat"), (r"rice noodles", "rice"), (r"corn tortillas", "corn"),
    (r"soy sauce", "soy wheat"), (r"soy lecithin", "soy"), (r"black salt", "salt"),
    (r"buttermilk", "milk"), (r"sour cream", "milk"), (r"rice flour", "rice"),
    (r"sesame oil", "sesame"), (r"sweet potato(?:es)?", "tuber"), (r"eggplants?", "aubergine"),
    # Pekoe and Purrs' tea sandwiches and Brew and Stew's soups and breads read
    # this same engine (make-pekoe.py, make-brew-and-stew.py), so the kitchens
    # cannot disagree about what is in a word. An eggless mayonnaise has no egg
    # in it, a cashew cream cheese is cashews, an oat cream is oats, and
    # buckwheat flour has no wheat in it, whatever the word flour says.
    (r"eggless mayonnaise", "eggless dressing"), (r"cashew cream cheese", "cashews"),
    (r"oat cream", "oats"), (r"buckwheat flour", "buckwheat"),
    # The Truck Stop's dog treats and its bánh mì board (make-truckin-food-court.py)
    # read this engine too: oat flour is oats, whatever the word flour says.
    (r"oat flour", "oats"),
]
ALLERGENS = [
    ("milk", r"butter|milk|cream|cheese|cheddar|mozzarella|ricotta|feta|parmesan|yogh?urt|ghee|whey|paneer|custard"),
    ("eggs", r"eggs?|mayonnaise|mayo|aioli|meringue|custard"),
    ("fish", r"fish|salmon|cod|tuna|anchov\w*|pollock|tilapia|catfish|trout|haddock|worcestershire"),
    ("crustacean shellfish", r"shrimp|prawns?|crab|lobster|crawfish|crayfish|langoustines?"),
    ("tree nuts", r"almonds?|walnuts?|pecans?|cashews?|pistachios?|hazelnuts?|macadamias?|pine nuts|brazil nuts"),
    ("peanuts", r"peanuts?"),
    ("wheat", r"wheat|flour|bread|breadcrumbs|buns?|toast|pasta|spaghetti|macaroni|ziti|lasagne|noodles|"
              r"couscous|bulgur|farro|seitan|panko|croutons|filo|pastry|tortillas?|pita|naan|crackers?|"
              r"cakes?|cookies?|biscuits?|udon|ramen|baguettes?"),
    ("soy", r"soy|soya|soybeans?|tofu|tempeh|edamame|miso|tamari"),
    ("sesame", r"sesame|tahini|hummus"),
]
GLUTEN = r"barley|rye"
MEAT = [("beef", r"beef|veal"), ("pork", r"pork|ham|bacon|lard|chorizo|pepperoni|prosciutto|salami"),
        ("chicken", r"chicken"), ("turkey", r"turkey"), ("lamb", r"lamb|mutton"), ("goat", r"goat"),
        ("duck", r"duck"), ("venison", r"venison")]
NOT_VEGETARIAN = r"gelatine?|parmesan|bone broth"
ANIMAL_MADE = r"honey"


def norm(what):
    t = " " + what.lower().replace("’", "'") + " "
    for pat, stand in PHRASES:
        t = re.sub(rf"\b{pat}\b", f" {stand} ", t)
    return t


def allergens(what):
    t = norm(what)
    out = [name for name, pat in ALLERGENS if re.search(rf"\b(?:{pat})\b", t)]
    gluten = "wheat" in out or bool(re.search(rf"\b(?:{GLUTEN})\b", t))
    return out, gluten


def animals(what):
    t = norm(what)
    return [name for name, pat in MEAT if re.search(rf"\b(?:{pat})\b", t)]


# ── The house's voice ────────────────────────────────────────────────────────

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|can't|does not|doesn't|do not|don't|won't|will not|is not|are not|isn't|"
            r"aren't|nobody|nor|declin\w+)")
DIET = (r"healthy|unhealthy|healthier|guilt[- ]free|guilty pleasures?|clean eating|junk food|"
        r"cheat (?:days?|meals?)|indulgen\w+|sinful|naughty|superfoods?|detox\w*|calories?|kcal|"
        r"macros|low[- ](?:fat|carb|cal)\w*|skinny|good for you|bad for you|nutritious|"
        r"empty calories")
OWED = (r"pay it forward|give back|giving back|suggested donations?|pay what you can|donations?|"
        r"donate|earn|earns|earned|earning|owe|owes|owed|owing|in return|repay\w*|"
        r"volunteer shifts?|work for (?:your|their|a) (?:food|meal|dinner|lunch)")
SORT = (r"needy|less fortunate|deserving|undeserving|handouts?|charity cases?|the homeless|"
        r"the poor|food[- ]insecure|low[- ]income|beggars?")
MEANS = (r"proof of (?:income|address|need|anything)|ID required|show (?:your |an )?ID|"
         r"sign[- ]in sheets?|sign in|registration|register(?:ed)?|eligib\w+|qualify|qualifies|"
         r"referrals?|means[- ]test\w*|vouchers?")
TALLY = (r"meals served|headcount|footfall|\d[\d,]* (?:meals|people|visitors|guests|diners)|"
         r"tall(?:y|ies)|leaderboards?|streaks?|scores?|scored|ranked|rankings?|most popular")
OTHER = r"authentic|exotic|ethnic"
PICKY = r"picky|fussy|clean (?:your |the )?plate|one more bite|just try (?:it|a bite)"
GRADE = (r"grades?|graded|grading|certificates?|certified|certification|"
         r"pass(?:es|ed)? the class|quiz\w*|homework|attendance")
VOCAB = [
    (DIET, "a verdict on food or on a body. Food is food in here: no calorie counts, no healthy, no "
           "guilt, no cheating, nothing about what a dish does to anybody."),
    (OWED, "something owed. You do not have to pay and you do not have to volunteer, Ryan's words: no "
           "jar, no pay what you can, nothing earned and nothing paid back. Nothing For Sale's rule."),
    (SORT, "sorting the people who eat here. Anybody hungry comes in, and nobody is a category."),
    (MEANS, "asking somebody for something at the door. Nobody is turned away and nobody is asked "
            "who they are."),
    (TALLY, "a count of who came or how many were fed. Nobody is counted here."),
    (OTHER, "othering somebody's food, Vital Plant Living's refusal: a dish is called what it is."),
    (PICKY, "sorting eaters, Samefood Cafe's refusal: nobody here is picky, and nobody is told to "
            "finish anything."),
    (GRADE, "marking a class. Nothing in the teaching kitchen is graded, tested or certified."),
]
# The words that come next in the song the name plays on. Refused with no
# negation window: they are a lyric whatever sentence they are in.
LYRIC = r"got\s+cookin"

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
            if re.search(rf"\b{NEGATION}\b", m.group(0), re.I):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")
    if re.search(LYRIC, text, re.I):
        refuse(f"{where}: the words after the song's title are on the page. They are a lyric, and "
               "this street sets no lyric it does not hold permission for.")


def listify(names):
    names = list(names)
    return names[0] if len(names) == 1 else ", ".join(names[:-1]) + " and " + names[-1]


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


# ── The checks on the room's own data ────────────────────────────────────────

def check_dish(d, where):
    name = d.get("name") or "?"
    extra = set(d) - DISH_KEYS
    if extra:
        refuse(f"{where}: {name!r} carries {sorted(extra)}. A dish is a name, a diet, what is in it, "
               "its animal if it has one, and a note.")
    for f in ("name", "diet", "what"):
        if not (d.get(f) or "").strip():
            refuse(f"{where}: {name!r} has no {f}. Every dish says what is in it before you take it.")
    diet, what = d.get("diet"), d.get("what") or ""
    if diet not in DIETS:
        refuse(f"{where}: {name!r} is {diet!r}, which is not vegan, vegetarian, meat or fish.")
        return
    t = norm(what)
    has, _ = allergens(what)
    meats = animals(what)
    fishy = "fish" in has or "crustacean shellfish" in has
    if diet == "vegan":
        bad = [a for a in ("milk", "eggs", "fish", "crustacean shellfish") if a in has]
        if meats or bad or re.search(rf"\b(?:{NOT_VEGETARIAN}|{ANIMAL_MADE})\b", t):
            refuse(f"{where}: {name!r} is marked vegan and has {', '.join(meats + bad) or 'something from an animal'} "
                   "in it. Vegan in here is vegan all the way down, stock and all.")
    if diet == "vegetarian":
        if meats or fishy or re.search(rf"\b(?:{NOT_VEGETARIAN})\b", t):
            refuse(f"{where}: {name!r} is marked vegetarian and has meat, fish, gelatin or parmesan in it "
                   "(parmesan is made with calf rennet).")
    if diet == "meat":
        named = [a.strip() for a in re.split(r",| and ", d.get("animal") or "") if a.strip()]
        if not named:
            refuse(f"{where}: {name!r} has meat in it and does not say which animal. Somebody who eats no "
                   "pork, or keeps halal or kosher, chooses by that word.")
        if not meats:
            refuse(f"{where}: {name!r} is marked meat and its ingredients name no meat.")
        if sorted(set(named)) != sorted(set(meats)):
            refuse(f"{where}: {name!r} names {named} and its ingredients have {meats}. The two must agree.")
    elif d.get("animal"):
        refuse(f"{where}: {name!r} names an animal and is not marked meat.")
    if diet == "fish":
        if not fishy:
            refuse(f"{where}: {name!r} is marked fish and its ingredients name no fish.")
        if meats:
            refuse(f"{where}: {name!r} is marked fish and has {meats} in it too; mark it meat.")


def check_data(d):
    w = d.get("welcome") or []
    if len(w) != 2 or not all(isinstance(p, str) and p.strip() for p in w):
        refuse("data/hey-good-cookin.json's welcome is not Ryan's two paragraphs.")
    if not any("[communication badge placards]" in p for p in w):
        refuse("the welcome has lost its link to the badge maker; Ryan's brief linked those words.")
    if not (d.get("badges_url") or "").startswith("https://cavendish.space/"):
        refuse("the badge link does not go to Cavendish Cards, where Ryan's brief pointed it.")

    pl = d.get("placards") or []
    if [p.get("key") for p in pl] != list(PLACARD_KEYS):
        refuse(f"the placards are {[p.get('key') for p in pl]}; they are green, yellow and red, in that order.")
    if len({p.get("shape") for p in pl}) != len(pl) or not {p.get("shape") for p in pl} <= SHAPES:
        refuse("every placard carries its own shape (circle, triangle, square), because colour is never "
               "the only channel here.")
    for p in pl:
        for f in ("colour", "shape", "ink", "says"):
            if not (p.get(f) or "").strip():
                refuse(f"the {p.get('key')!r} placard has no {f}.")
        if p.get("ink") != f"--hgc-{p.get('key')}":
            refuse(f"the {p.get('key')!r} placard's ink is {p.get('ink')!r}; it is --hgc-{p.get('key')}.")
    if len(d.get("rules") or []) != 3:
        refuse("the placard rules are Ryan's three.")

    hall = d.get("hall") or []
    if not hall:
        refuse("the hall has no tables.")
    keys = {p.get("key") for p in pl} | {None}
    two_free = any(t.get("seats") == 2 and t.get("placard") is None for t in hall)
    for i, t in enumerate(hall):
        if t.get("seats") not in (2, 4, 8):
            refuse(f"table {i + 1} in the hall seats {t.get('seats')}; the hall has 2-tops, 4-tops and "
                   "large tables of eight.")
        if t.get("placard") not in keys:
            refuse(f"table {i + 1} has a placard {t.get('placard')!r} that is not one of the three.")
        if t.get("placard") == "alone" and t.get("seats") == 8:
            refuse(f"table {i + 1} is a large table with a red placard on it. Ryan's rule: please don't "
                   "red placard a large table. The drawing keeps the house rules too.")
        if t.get("placard") == "alone" and t.get("seats") == 4 and two_free:
            refuse(f"table {i + 1} is a 4-top with a red placard while a 2-top stands empty. Ryan's rule: "
                   "fill the 2-top tables first.")
    if not any(t.get("placard") is None for t in hall):
        refuse("every table in the drawing has a placard on it, so the drawing never shows the rule about "
               "picking one up at the station.")

    if not d.get("shelf"):
        refuse("the shelf at the start of the line is empty.")

    every = []
    stations = d.get("stations") or []
    for st in stations:
        dishes = st.get("dishes") or []
        if not (st.get("key") and st.get("name") and dishes):
            refuse(f"the station {st.get('name')!r} has no key, no name or no dishes.")
        if not any(x.get("diet") == "vegan" for x in dishes):
            refuse(f"the station {st.get('name')!r} has nothing vegan on it. Every station does.")
        for x in dishes:
            check_dish(x, st.get("name"))
        every += dishes
    week = d.get("week") or []
    if [w.get("day") for w in week] != DAYS:
        refuse(f"the week is {[w.get('day') for w in week]}; it is the seven days, Monday first.")
    for w in week:
        pans = w.get("pans") or []
        if len(pans) != 3:
            refuse(f"{w.get('day')} has {len(pans)} pans on the hot line; it has three.")
        if pans and pans[0].get("diet") != "vegan":
            refuse(f"{w.get('day')}'s first pan is {pans[0].get('name')!r}, which is not vegan. The vegan pan "
                   "is first every day, Big Steep's rule for its alcohol-free pour.")
        for x in pans:
            check_dish(x, w.get("day"))
        every += pans
    names = [x.get("name") for x in every]
    dup = sorted({n for n in names if names.count(n) > 1})
    if dup:
        refuse(f"dishes with one name on two cards: {dup}")
    plants = sum(x.get("diet") in ("vegan", "vegetarian") for x in every)
    if plants * 2 <= len(every):
        refuse("vegan and vegetarian dishes are not more than half the line. The brief was plenty.")

    ada = d.get("ada") or {}
    for a in d.get("access") or []:
        secs = a.get("sections") or []
        if not secs:
            refuse(f"an access line names no section of the standard: {a.get('say', '')[:60]!r}")
        for sec in secs:
            if sec not in (ada.get("sections") or {}):
                refuse(f"an access line names section {sec!r}, which is not in `ada`.")
        if not re.search(r"\d+ inches \(\d+ (?:and \d+ )?mm\)|\d+ and \d+ inches \(\d+ and \d+ mm\)|one seat in twenty",
                         a.get("say") or ""):
            refuse(f"an access line has no measurement in it: {a.get('say', '')[:60]!r}")
    if not d.get("access"):
        refuse("the line from a chair says nothing.")

    temps = {t.get("key"): t for t in d.get("temps") or []}
    for c in d.get("classes") or []:
        k = c.get("key")
        extra = set(c) - CLASS_KEYS
        if extra:
            refuse(f"the class {k!r} carries {sorted(extra)}.")
        for f in ("title", "makes", "hands", "total", "senses", "needs", "ingredients"):
            if not (c.get(f) or "").strip():
                refuse(f"the class {k!r} has no {f}. Every class says how long, what it is like and what "
                       "it needs before anybody starts.")
        if not c.get("steps"):
            refuse(f"the class {k!r} has no steps.")
        words = norm(" ".join([c.get("ingredients") or "", " ".join(c.get("steps") or []), c.get("swap") or ""]))
        need = set()
        for t in temps.values():
            if any(re.search(rf"\b{re.escape(w)}\b", words) for w in t.get("for") or []):
                need.add(t["key"])
        if "eggs" in need and "egg-dishes" in need:
            need.discard("eggs")
        safe = set(c.get("safe") or [])
        for s in safe - set(temps):
            refuse(f"the class {k!r} names the temperature {s!r}, which is not in `temps`.")
        for s in sorted(need - safe):
            refuse(f"the class {k!r} cooks something {temps[s]['food'].lower()!r} covers and does not name "
                   f"that temperature ({s}). FoodSafety.gov's number goes with every class that needs one.")
    if not d.get("classes"):
        refuse("the teaching kitchen has no classes.")
    for f in ("foodsafety", "fda", "ada", "song", "badges"):
        if not d.get(f):
            refuse(f"data/hey-good-cookin.json has no `{f}` source.")


# ── The hall ─────────────────────────────────────────────────────────────────
# A hall with every pot on, on a cold day, seen from inside: the windows along
# the back fogged from end to end by the line's steam, with a clear run down the
# glass wherever a drop has slid, and the day showing sharp through the runs.
# The line on the left, heated from underneath, its steam going up into the
# glass; the tables on the right, each with one place that has no chair in it;
# the placard station at the far end. No food is drawn: it is under the lids.

W, H = 1000, 380
WIN_TOP, WIN_BOT = 22, 196
PANES = 7
# Each pane's runs: (across, where the drop started, where it stopped), in the
# pane's own units, so the runs are irregular and do not line up into bars.
RUNS = [
    [(0.22, 0.10, 1.0), (0.61, 0.38, 0.84), (0.83, 0.55, 1.0)],
    [(0.15, 0.30, 0.71), (0.48, 0.05, 1.0)],
    [(0.34, 0.22, 1.0), (0.70, 0.46, 0.93), (0.88, 0.12, 0.40)],
    [(0.27, 0.51, 1.0), (0.58, 0.18, 0.66)],
    [(0.12, 0.08, 0.58), (0.44, 0.33, 1.0), (0.79, 0.60, 1.0)],
    [(0.36, 0.14, 0.89), (0.66, 0.42, 1.0)],
    [(0.20, 0.36, 1.0), (0.52, 0.09, 0.47), (0.81, 0.27, 1.0)],
]
FLOOR = 330
TOP_Y = 284
WIDTH = {2: 54, 4: 80, 8: 136}
CHAIR = 22           # a chair and the room beside it, on each table's left
GAP = 10             # between one table's end and the next table's chair
TABLES_X = 292       # the first table's top, after its chair; the line ends at 270
STATION_X = 942


def placard_tent(cx, base, key, shape, size=1.0):
    w, h = 13 * size, 22 * size
    tent = (f'<path d="M{cx - w:.1f} {base} L{cx - w * .66:.1f} {base - h:.1f} H{cx + w * .66:.1f} '
            f'L{cx + w:.1f} {base} Z" fill="var(--hgc-{key})" stroke="var(--hgc-ink)" stroke-width="1.2" '
            'stroke-linejoin="round"/>')
    gy = base - h * .48
    mark = "var(--hgc-ink)" if key == "ask" else "var(--hgc-card)"
    r = 4.2 * size
    if shape == "circle":
        g = f'<circle cx="{cx:.1f}" cy="{gy:.1f}" r="{r:.1f}" fill="{mark}"/>'
    elif shape == "triangle":
        g = (f'<path d="M{cx:.1f} {gy - r * 1.05:.1f} L{cx + r * 1.1:.1f} {gy + r * .8:.1f} '
             f'H{cx - r * 1.1:.1f} Z" fill="{mark}"/>')
    else:
        g = f'<rect x="{cx - r:.1f}" y="{gy - r:.1f}" width="{r * 2:.1f}" height="{r * 2:.1f}" fill="{mark}"/>'
    return f'<g data-placard="{key}">{tent}{g}</g>'


def chair(x):
    # Side view: a seat, its legs, and a back on the side away from the table.
    return (f'<path d="M{x} {FLOOR} V302 H{x + 16} V{FLOOR} M{x} 302 V270" fill="none" '
            'stroke="var(--hgc-frame)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>')


def hall_svg(d):
    shapes = {p["key"]: p["shape"] for p in d["placards"]}
    s = [f'  <svg class="hgc-hall" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">',
         f'<rect width="{W}" height="{H}" rx="18" fill="var(--hgc-wall)"/>']
    # The windows, fogged, and the runs.
    pane_w = (W - 48 - (PANES - 1) * 14) / PANES
    for i in range(PANES):
        x0 = 24 + i * (pane_w + 14)
        s.append(f'<rect x="{x0:.1f}" y="{WIN_TOP}" width="{pane_w:.1f}" height="{WIN_BOT - WIN_TOP}" '
                 'rx="3" fill="var(--hgc-fog)" stroke="var(--hgc-frame)" stroke-width="4"/>')
        for (ax, a, b) in RUNS[i]:
            x = x0 + 6 + ax * (pane_w - 12)
            y0 = WIN_TOP + 4 + a * (WIN_BOT - WIN_TOP - 8)
            y1 = WIN_TOP + 4 + b * (WIN_BOT - WIN_TOP - 8)
            s.append(f'<path d="M{x:.1f} {y0:.1f} C{x - 1.5:.1f} {(y0 + y1) / 2:.1f} {x + 1.5:.1f} '
                     f'{(y0 + y1) / 2:.1f} {x:.1f} {y1:.1f}" stroke="var(--hgc-day)" stroke-width="3.4" '
                     'stroke-linecap="round" fill="none"/>')
            if b < 1.0:
                s.append(f'<circle cx="{x:.1f}" cy="{y1 + 1:.1f}" r="3.6" fill="var(--hgc-day)"/>')
        s.append(f'<rect x="{x0 - 4:.1f}" y="{WIN_BOT}" width="{pane_w + 8:.1f}" height="8" rx="2" '
                 'fill="var(--hgc-steel)"/>')
    # The floor.
    s.append(f'<rect y="{FLOOR}" width="{W}" height="{H - FLOOR}" fill="var(--hgc-floor)"/>')
    s.append(f'<path d="M0 {FLOOR} H{W}" stroke="var(--hgc-frame)" stroke-width="2"/>')
    # The steam, from the kettle and the pans, up into the glass.
    for (x, lean) in ((70, -1), (122, 1), (174, -1), (222, 1), (240, -1)):
        s.append(f'<path d="M{x} 250 C{x + 18 * lean} 222 {x - 16 * lean} 196 {x + 8 * lean} 166 '
                 f'S{x - 10 * lean} 118 {x + 12 * lean} 92" stroke="var(--hgc-card)" stroke-width="9" '
                 'stroke-linecap="round" fill="none" opacity=".72"/>')
    # The line: a sneeze guard, the counter and its pans, the kettle, the tray
    # slide lower down at the height of a seat.
    s.append('<rect x="40" y="212" width="160" height="6" rx="2" fill="var(--hgc-frame)"/>')
    s.append('<path d="M46 218 L56 254 H184 L194 218 Z" fill="var(--hgc-fog)" opacity=".55"/>')
    s.append('<rect x="30" y="262" width="232" height="68" rx="3" fill="var(--hgc-steel)" '
             'stroke="var(--hgc-frame)" stroke-width="2"/>')
    for x in (70, 122, 174):
        s.append(f'<path d="M{x - 24} 262 Q{x - 24} 246 {x} 246 Q{x + 24} 246 {x + 24} 262 Z" '
                 'fill="var(--hgc-steel)" stroke="var(--hgc-frame)" stroke-width="2"/>')
        s.append(f'<path d="M{x - 5} 246 V241 H{x + 5} V246" fill="none" stroke="var(--hgc-frame)" '
                 'stroke-width="2"/>')
    s.append('<rect x="206" y="222" width="50" height="40" rx="5" fill="var(--hgc-enamel)" '
             'stroke="var(--hgc-ink)" stroke-width="1.6"/>')
    s.append('<rect x="202" y="218" width="58" height="7" rx="3" fill="var(--hgc-enamel)" '
             'stroke="var(--hgc-ink)" stroke-width="1.6"/>')
    for (fx, fy) in ((216, 234), (232, 242), (246, 231), (222, 252), (242, 254), (212, 246)):
        s.append(f'<circle cx="{fx}" cy="{fy}" r="1.6" fill="var(--hgc-fleck)"/>')
    s.append('<rect x="22" y="290" width="248" height="7" rx="2" fill="var(--hgc-frame)"/>')
    # The tables.
    x = TABLES_X
    for t in d["hall"]:
        wdt = WIDTH[t["seats"]]
        extra = max(0, t["seats"] - 2)
        for k in range(extra):
            bx = x + (k + 1) * wdt / (extra + 1) - 9
            s.append(f'<rect x="{bx:.1f}" y="266" width="18" height="18" rx="2" fill="none" '
                     'stroke="var(--hgc-frame)" stroke-width="3"/>')
        s.append(chair(x - CHAIR))
        s.append(f'<rect x="{x}" y="{TOP_Y}" width="{wdt}" height="9" rx="2" fill="var(--hgc-card)" '
                 'stroke="var(--hgc-frame)" stroke-width="2"/>')
        s.append(f'<rect x="{x + 6}" y="{TOP_Y + 9}" width="5" height="{FLOOR - TOP_Y - 9}" fill="var(--hgc-frame)"/>')
        s.append(f'<rect x="{x + wdt - 11}" y="{TOP_Y + 9}" width="5" height="{FLOOR - TOP_Y - 9}" '
                 'fill="var(--hgc-frame)"/>')
        if t["placard"]:
            s.append(placard_tent(x + wdt / 2, TOP_Y, t["placard"], shapes[t["placard"]]))
        x += wdt + GAP + CHAIR
    if x - GAP - CHAIR > STATION_X - 8:
        raise SystemExit(f"REFUSING: the tables in data/hey-good-cookin.json run to {x - GAP - CHAIR}, past the "
                         f"placard station at {STATION_X}. Fewer tables, or narrower ones; the drawing must not "
                         "put a table under the station.")
    # The placard station, at the front.
    sx = STATION_X
    s.append(f'<rect x="{sx}" y="250" width="50" height="6" rx="2" fill="var(--hgc-frame)"/>')
    s.append(f'<rect x="{sx + 22}" y="256" width="6" height="{FLOOR - 256}" fill="var(--hgc-frame)"/>')
    s.append(f'<rect x="{sx + 10}" y="{FLOOR - 4}" width="30" height="4" fill="var(--hgc-frame)"/>')
    for j, key in enumerate(PLACARD_KEYS):
        s.append(placard_tent(sx + 9 + j * 16, 250, key, shapes[key], 0.62))
    s.append('</svg>')
    return "".join(s)


# ── The words ────────────────────────────────────────────────────────────────

def welcome(d):
    out = []
    for p in d["welcome"]:
        body = esc(p).replace("[communication badge placards]",
                              f'<a href="{attr(d["badges_url"])}">communication badge placards</a>')
        out.append(f'    <p>{body}</p>')
    out.append('    <p class="hgc-said">&mdash; Ryan Boren, for the kitchen</p>')
    return "\n".join(out)


def placard_svg(key, shape):
    mark = "hgc-placard__mark"
    if shape == "circle":
        g = '<circle cx="20" cy="20" r="13"/>'
    elif shape == "triangle":
        g = '<path d="M20 5 L35 33 H5 Z"/>'
    else:
        g = '<rect x="7" y="7" width="26" height="26"/>'
    return f'<svg class="{mark}" viewBox="0 0 40 40" aria-hidden="true" focusable="false">{g}</svg>'


def placards(d):
    out = ['    <ul class="hgc-placards">']
    for p in d["placards"]:
        out.append(f'      <li class="hgc-placard hgc-placard--{p["key"]}">\n'
                   f'        {placard_svg(p["key"], p["shape"])}\n'
                   f'        <p class="hgc-placard__colour">{esc(p["colour"])} <span class="hgc-placard__shape">'
                   f'&middot; {esc(p["shape"])}</span></p>\n'
                   f'        <p class="hgc-placard__says">{esc(p["says"])}</p>\n'
                   '      </li>')
    out.append('    </ul>')
    return "\n".join(out)


def rules(d):
    return "\n".join(['    <ol class="hgc-rules">'] +
                     [f'      <li>{esc(r)}</li>' for r in d["rules"]] + ['    </ol>'])


def shelf(d):
    return "\n".join(['    <ul class="hgc-shelf">'] +
                     [f'      <li>{esc(x)}</li>' for x in d["shelf"]] + ['    </ul>'])


def mark(x):
    if x["diet"] == "vegan":
        return '<span class="hgc-mark hgc-mark--vegan">Vegan</span>'
    if x["diet"] == "vegetarian":
        return '<span class="hgc-mark hgc-mark--veg">Vegetarian</span>'
    if x["diet"] == "fish":
        return '<span class="hgc-mark hgc-mark--animal">Fish</span>'
    return f'<span class="hgc-mark hgc-mark--animal">{esc(x["animal"][:1].upper() + x["animal"][1:])}</span>'


def contains(x):
    """Said both ways round, because somebody with coeliac disease is reading
    for gluten and somebody with an allergy for one of the nine, and each
    should find their answer without working it out from the other's."""
    has, gluten = allergens(x["what"])
    if not has and not gluten:
        return "None of the nine, and no gluten."
    if not has:
        return "Contains gluten. None of the nine."
    if not gluten:
        return "Contains " + listify(has) + ". No gluten."
    return "Contains " + listify(list(has) + ["gluten"]) + "."


def dish_card(x):
    note = f'\n          <p class="hgc-dish__note">{esc(x["note"])}</p>' if x.get("note") else ""
    return (f'        <li class="hgc-dish">\n'
            f'          <p class="hgc-dish__name">{esc(x["name"])}</p>\n'
            f'          <p class="hgc-dish__marks">{mark(x)}</p>\n'
            f'          <p class="hgc-dish__what"><span class="sr">In it: </span>{esc(x["what"])}</p>\n'
            f'          <p class="hgc-dish__has">{contains(x)}</p>{note}\n'
            '        </li>')


def line(d):
    out = []
    for st in d["stations"]:
        out.append(f'    <section class="hgc-station" aria-labelledby="hgc-st-{st["key"]}-h">')
        out.append(f'      <h3 id="hgc-st-{st["key"]}-h">{esc(st["name"])}</h3>')
        if st.get("note"):
            out.append(f'      <p class="hgc-station__note">{esc(st["note"])}</p>')
        out.append('      <ul class="hgc-dishes">')
        out += [dish_card(x) for x in st["dishes"]]
        out += ['      </ul>', '    </section>']
    return "\n".join(out)


def week(d):
    out = ['    <div class="hgc-week">']
    for w in d["week"]:
        k = w["day"].lower()
        out.append(f'    <section class="hgc-day" aria-labelledby="hgc-day-{k}-h">')
        out.append(f'      <h4 id="hgc-day-{k}-h" class="hgc-day__name">{esc(w["day"])}</h4>')
        out.append('      <ol class="hgc-dishes hgc-dishes--pans">')
        out += [dish_card(x) for x in w["pans"]]
        out += ['      </ol>', '    </section>']
    out.append('    </div>')
    return "\n".join(out)


def none_of(d):
    every = [x for st in d["stations"] for x in st["dishes"]] + [x for w in d["week"] for x in w["pans"]]
    seen = set()
    for x in every:
        seen |= set(allergens(x["what"])[0])
    absent = [name for name, _ in ALLERGENS if name not in seen]
    if not absent:
        return ('    <p class="hgc-none-of">Every one of the nine is in something on the line, so read the card '
                'every time.</p>')
    return (f'    <p class="hgc-none-of">Nothing on the line has {listify(absent)} in it.</p>')


def access(d):
    ada = d["ada"]
    out = ['    <ul class="hgc-access">']
    for a in d["access"]:
        links = ", ".join(f'<a class="hgc-access__src" href="{attr(ada["url"])}#ada-{sec}">ADA {sec}</a>'
                          for sec in a["sections"])
        out.append(f'      <li>{esc(a["say"])} {links}</li>')
    out.append('    </ul>')
    return "\n".join(out)


def temp_line(t):
    if t.get("f"):
        s = f'{t["f"]}&deg;F ({t["c"]}&deg;C)'
        if t.get("rest"):
            s += f', then rest {esc(t["rest"])}'
        if t.get("or"):
            s += f', {esc(t["or"])}'
        return s
    return esc(t["or"][:1].upper() + t["or"][1:])


def temps_table(d):
    fs = d["foodsafety"]
    out = ['    <table class="hgc-temps">',
           f'      <caption>The temperatures the kitchen cooks to, off <a href="{attr(fs["url"])}">'
           f'{esc(fs["by"])}&rsquo;s chart</a></caption>',
           '      <thead><tr><th scope="col">What</th><th scope="col">Inside, at the thickest part</th></tr></thead>',
           '      <tbody>']
    out += [f'        <tr><th scope="row">{esc(t["food"])}</th><td>{temp_line(t)}</td></tr>' for t in d["temps"]]
    out += ['      </tbody>', '    </table>']
    return "\n".join(out)


def classes(d):
    temps = {t["key"]: t for t in d["temps"]}
    out = []
    for c in d["classes"]:
        k = c["key"]
        out.append(f'    <article class="hgc-class" aria-labelledby="hgc-class-{k}-h">')
        out.append(f'      <h3 id="hgc-class-{k}-h">{esc(c["title"])}</h3>')
        out.append(f'      <p class="hgc-class__makes">{esc(c["makes"])}</p>')
        out.append('      <dl class="hgc-class__facts">')
        out.append(f'        <div><dt>Hands on</dt><dd>{esc(c["hands"])}</dd></div>')
        out.append(f'        <div><dt>In all</dt><dd>{esc(c["total"])}</dd></div>')
        out.append('        <div><dt>Sitting down</dt><dd>All of it. The teaching counter is at table height, with '
                   'room under it for knees and a wheelchair.</dd></div>')
        out.append(f'        <div><dt>What it is like</dt><dd>{esc(c["senses"])}</dd></div>')
        out.append('      </dl>')
        out.append(f'      <p class="hgc-class__needs"><b>You need:</b> {esc(c["needs"])}</p>')
        out.append(f'      <p class="hgc-class__needs"><b>What goes in:</b> {esc(c["ingredients"])}</p>')
        out.append('      <ol class="hgc-class__steps">')
        out += [f'        <li>{esc(s)}</li>' for s in c["steps"]]
        out.append('      </ol>')
        if c.get("swap"):
            out.append(f'      <p class="hgc-class__swap"><b>Another way:</b> {esc(c["swap"])}</p>')
        if c.get("safe"):
            bits = [f'{esc(temps[s]["food"])}: {temp_line(temps[s])}' for s in c["safe"]]
            out.append(f'      <p class="hgc-class__safe"><b>Safe temperatures,</b> from '
                       f'<a href="{attr(d["foodsafety"]["url"])}">FoodSafety.gov</a>: {"; ".join(bits)}.</p>')
        out.append('    </article>')
    return "\n".join(out)


# ── The teaching screen and the rack ─────────────────────────────────────────

def teaching_screen():
    return "\n".join([
        f'    <div class="hgc-screen" data-rack-screen="{SCREEN[0]}" tabindex="-1" hidden>',
        '      <p class="hgc-screen__idle"><span><b>The teaching screen.</b> Nothing is on it. Any video on the '
        'rack can go up here with the button under it, and nothing loads until you press one.</span></p>',
        '    </div>',
        f'    <p class="hgc-screen__now" data-rack-now="{SCREEN[0]}" tabindex="-1" hidden></p>',
        f'    <p class="hgc-screen__back" hidden><button type="button" class="hgc-back" '
        f'data-rack-back="{SCREEN[0]}">Take it off the teaching screen</button></p>'])


def card(v, sub):
    tall = v["form"] == "short"
    runs = v.get("runs")
    head = (f'          <li class="hgc-card{" hgc-card--short" if tall else ""}"'
            f'{" data-rack-card" if v["state"] == "screen" else ""}>\n'
            f'            <p class="hgc-card__title">{esc(v["title"])}</p>\n'
            f'            <p class="hgc-card__by">{sub}</p>\n')
    full = f'{attr(v["title"])}, on YouTube via {attr(v["channel"])}'
    if v["state"] == "screen":
        body = (f'            <button type="button" class="facade" data-embed-id="{v["id"]}" '
                f'data-embed-title="{full}">\n'
                f'              Play &mdash; {esc(spoken(runs))}\n'
                f'              <span class="facade__play">&#9654; PRESS PLAY</span>\n'
                f'            </button>\n'
                f'            <button type="button" class="hgc-card__up" hidden data-rack-to="{SCREEN[0]}" '
                f'data-rack-name="{SCREEN[1]}" '
                f'data-rack-src="https://www.youtube-nocookie.com/embed/{v["id"]}?autoplay=1&amp;rel=0" '
                f'data-rack-title="{full}, on {SCREEN[1]}" '
                f'data-rack-film="{attr(v["title"])}" data-rack-runtime="{clock(runs)}"'
                + (' data-rack-shape="tall"' if tall else "") +
                f'>Put it on {SCREEN[1]} &mdash; {esc(spoken(runs))}</button>\n')
    else:
        how = f" &mdash; {esc(spoken(runs))}" if runs else ""
        body = (f'            <a class="hgc-card__door" href="https://www.youtube.com/watch?v={v["id"]}">'
                f'Watch on YouTube{how} &rarr;</a>\n'
                f'            <p class="hgc-card__why">{esc(DOOR_WHY[v["why"]])}</p>\n')
    return head + body + '          </li>'


def card_list(rows, label, render):
    """Videos, then shorts, each in its own list: a short's card is tall, and a
    row of mixed cards stretches the long ones to match it."""
    out = []
    for form in ("long", "short"):
        mine = [v for v in rows if v["form"] == form]
        if mine:
            out.append(f'        <ul class="hgc-cards{" hgc-cards--short" if form == "short" else ""}" '
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
        refuse("data/hey-good-cookin-month.json lists no channels, so the rack would be a heading over "
               "nothing.")
    if not r.get("set"):
        refuse("data/hey-good-cookin-month.json has no `set` time. Run tools/pull-cookin-month.py; the "
               "room prints when the rack was filled.")
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


def month(r):
    when = set_time(r)
    start = when - timedelta(days=MONTH)
    t = when.astimezone(HERE)
    at = f"{t.strftime('%I').lstrip('0')}:{t.strftime('%M')} {t.strftime('%p').lower()}"
    live = [v for v in r["log"] if v["state"] in ("screen", "door")]
    out = [f'    <p class="hgc-rack__set">The rack was last filled at <b>{at} on {esc(day(when))}</b>, '
           f'Mountain time, with what each channel put up since {esc(day(start))}. Anything on it can '
           'go up on the teaching screen.</p>',
           '    <details class="hgc-racked" open>',
           '      <summary>A month of their videos, newest first under each channel</summary>']
    quiet = []
    for s in r["sources"]:
        mine = sorted((v for v in live if v["source"] == s["slug"]),
                      key=lambda v: (v["published"], v["id"]), reverse=True)
        if s["slug"] not in r.get("covered", {}):
            # A CHANNEL ADDED SINCE THE LAST FILL has never been read, so the
            # gap line below ("the last time it was read") would describe a
            # reading that never happened. The puller writes a channel's
            # coverage and its videos together, so one without the other is
            # this state and no other.
            out += [f'      <section class="hgc-chan" aria-label="{attr(s["name"])}">',
                    f'        <h3 class="hgc-chan__name"><a href="{attr(s["url"])}">{esc(s["name"])}</a></h3>',
                    '        <p class="hgc-chan__none">This channel was added after the rack was last filled. '
                    'Its month arrives with the next fill.</p>',
                    '      </section>']
            continue
        cov = r.get("covered", {}).get(s["slug"], {})
        # A MINUTE OF SLACK, The Open Notebook's: `set` is kept to the minute
        # and the puller's coverage to the second.
        gaps = [f for f in ("long", "short")
                if not covered(cov.get(f, []), start + timedelta(minutes=1), when)]
        if not mine and not gaps:
            quiet.append(s["name"])
            continue
        block = [f'      <section class="hgc-chan" aria-label="{attr(s["name"])}">',
                 f'        <h3 class="hgc-chan__name"><a href="{attr(s["url"])}">{esc(s["name"])}</a></h3>']
        if gaps:
            what = {"long": "videos", "short": "shorts"}
            block.append(f'        <p class="hgc-chan__gap">Its {" and ".join(what[f] for f in gaps)} feed did not '
                         'reach back a whole month the last time it was read, so some of its month may be '
                         'missing here. It fills in as the mornings go by.</p>')
        if not mine:
            block.append('        <p class="hgc-chan__none">Nothing from this channel in what the feeds reached.</p>')

        def render(v):
            runs = v.get("runs")
            sub = esc(day(utc(v["published"]))) + (f" &middot; {clock(runs)}" if runs else "")
            return card(v, sub)

        block += card_list(mine, s["name"], render)
        block.append('      </section>')
        out += block
    if quiet:
        out.append(f'      <p class="hgc-rack__quiet">Nothing from {listify(esc(q) for q in quiet)} this month.</p>')
    out.append('    </details>')
    return "\n".join(out)


# ── The liner notes ──────────────────────────────────────────────────────────

def liner_sources(d):
    fs, fda, ada, song, b = d["foodsafety"], d["fda"], d["ada"], d["song"], d["badges"]
    rows = [
        ("The safe temperatures every hot dish and class is cooked to",
         f'<a href="{attr(fs["url"])}">{esc(fs["title"])}</a>, {esc(fs["by"])}, last reviewed {esc(fs["reviewed"])}, '
         f'read {esc(fs["read"])} in a browser'),
        ("The nine major food allergens every dish card names",
         f'<a href="{attr(fda["url"])}">{esc(fda["title"])}</a>, {esc(fda["by"])}, read {esc(fda["read"])}'),
        ("Every measurement of the line and the tables",
         f'<a href="{attr(ada["url"])}">{esc(ada["title"])}</a>, {esc(ada["by"])}, read {esc(ada["read"])}'),
        ("The placards, their colours and their shapes",
         f'Interaction badges, first developed by {esc(b["first"])}, as our <a href="{attr(b["field_guide"])}">'
         f'{esc(b["field_guide_title"])}</a> page says, and as <a href="{attr(d["badges_url"])}">Cavendish Cards&rsquo; '
         'badge maker</a> prints them'),
        ("The name",
         f'A play on <a href="{attr(song["url"])}"><i>{esc(song["title"])}</i></a>, {esc(song["by"])}, {song["year"]}; '
         'nothing else of the song is in the room'),
    ]
    return "\n".join(f'      <tr><td>{w}</td><td>{s}</td></tr>' for w, s in rows)


def liner_month(r):
    return "\n".join(f'      <tr><td><a href="{attr(s["url"])}">{esc(s["name"])}</a></td>'
                     f'<td>its videos and its shorts, the latest month of each</td></tr>'
                     for s in r["sources"])


# ── The palette, and the page as written ─────────────────────────────────────

def section_css():
    css = CSS.read_text()
    m = re.search(rf"/\* §{SECTION} ── ROOM: Hey, Good Cookin.*?(?=/\* §{SECTION + 1} ──)", css, re.S)
    return css, m


def placards_only():
    css, m = section_css()
    root = dict(re.findall(r"(--hgc-[\w-]+):\s*(#[0-9A-Fa-f]{6})", css))
    if not root:
        refuse("love.css declares no --hgc- colours, so there is no palette to hold.")
    if not m:
        refuse(f"love.css has no §{SECTION} for Hey, Good Cookin', so there is nothing to check.")
        return
    reserved = {root.get(f"--hgc-{k}", "").lower() for k in PLACARD_KEYS}
    body = re.sub(r"/\*.*?\*/", " ", m.group(0), flags=re.S)
    lit = re.findall(r"#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b", body)
    for name, h in list(root.items()) + [("a literal in the section", x) for x in lit]:
        x = h.lstrip("#")
        if len(x) == 3:
            x = "".join(c * 2 for c in x)
        r_, g_, b_ = (int(x[i:i + 2], 16) / 255 for i in (0, 2, 4))
        hue, light, sat = colorsys.rgb_to_hls(r_, g_, b_)
        deg = hue * 360
        warm = deg <= 18 or deg >= 340 or 30 <= deg <= 68 or 72 <= deg <= 170
        if sat > 0.25 and 0.08 < light < 0.92 and warm and ("#" + x).lower() not in reserved:
            refuse(f"{name} ({h}) is a green, yellow, orange or red that is not a placard (hue {round(deg)}). "
                   "On a table a colour means a placard, so nothing else in the room may wear one.")
    # The placards' own colours, only on a placard. Comments are blanked first,
    # so a sentence about a placard's colour is not read as a rule using it.
    bare = re.sub(r"/\*.*?\*/", lambda c: " " * len(c.group(0)), css, flags=re.S)
    for mm in re.finditer(r"var\(--hgc-(go|ask|alone)\)", bare):
        rule_start = bare.rfind("}", 0, mm.start())
        selector = bare[rule_start + 1:bare.find("{", rule_start + 1)]
        if "placard" not in selector:
            refuse(f"--hgc-{mm.group(1)} is used by {selector.strip()[:70]!r}. A placard's colour goes on a "
                   "placard and nowhere else.")
    page = PAGE.read_text()
    rest = re.sub(r'<g data-placard="(?:go|ask|alone)">.*?</g>', " ", page, flags=re.S)
    if re.search(r"var\(--hgc-(?:go|ask|alone)\)", rest):
        refuse("a placard's colour is on the page outside a placard.")


def sweep_page():
    src = PAGE.read_text()
    body = src[src.index("<main"):src.index("</main>")]
    for marker in ("hgc:month", "hgc:hall"):
        body = re.sub(rf"<!-- {marker}:begin -->.*?<!-- {marker}:end -->", " ", body, flags=re.S)
    body = re.sub(r"<!-- quest:[\w-]+:begin -->.*?<!-- quest:[\w-]+:end -->", " ", body, flags=re.S)
    body = re.sub(r"<blockquote.*?</blockquote>", " ", body, flags=re.S)
    body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)
    sweep(body, PAGE.name)
    rack = re.search(r"<!-- hgc:month:begin -->.*?<!-- hgc:month:end -->", src, re.S)
    if re.search(LYRIC, re.sub(r"<[^>]+>", " ", src.replace(rack.group(0), " ") if rack else src), re.I):
        refuse("the words after the song's title are somewhere on the page, in its head or its markup.")
    for name, tag in (("a form", r"<form\b"), ("an input", r"<input\b"), ("a textarea", r"<textarea\b"),
                      ("a select", r"<select\b"), ("something editable", r"contenteditable")):
        if re.search(tag, body, re.I):
            refuse(f"the room has {name} in it. Nobody gives their name at this door, and there is nowhere "
                   "in here to type one.")
    scripts = re.findall(r'<script src="([^"]+)"', src)
    if sorted(scripts) != sorted(["love.js", "love-embed.js", "rack.js", "quest.js"]):
        refuse(f"the room loads {scripts}. It loads love.js, love-embed.js, rack.js and quest.js and "
               "nothing else.")
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
        swap(PAGE, "hgc:month", month(r), "")
        live = [v for v in r["log"] if v["state"] in ("screen", "door")]
        print(f"hey good cookin: the rack, filled {r['set']}, "
              f"{sum(v['state'] == 'screen' for v in live)} screens and "
              f"{sum(v['state'] == 'door' for v in live)} doors")
        return
    d = json.loads(DATA.read_text())
    check_data(d)
    for p in d.get("welcome") or []:
        sweep(p, "the welcome")
    placards_only()
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)
    swap(PAGE, "hgc:hall", hall_svg(d), "")
    swap(PAGE, "hgc:welcome", welcome(d), "")
    swap(PAGE, "hgc:placards", placards(d), "")
    swap(PAGE, "hgc:rules", rules(d), "")
    swap(PAGE, "hgc:shelf", shelf(d), "")
    swap(PAGE, "hgc:line", line(d), "")
    swap(PAGE, "hgc:week", week(d), "")
    swap(PAGE, "hgc:none-of", none_of(d), "")
    swap(PAGE, "hgc:access", access(d), "")
    swap(PAGE, "hgc:classes", classes(d), "")
    swap(PAGE, "hgc:temps", temps_table(d), "")
    swap(PAGE, "hgc:screen", teaching_screen(), "")
    swap(PAGE, "hgc:month", month(r), "")
    swap(NOTES, "cookin-sources", liner_sources(d), "      ")
    swap(NOTES, "cookin-month-credits", liner_month(r), "      ")
    sweep_page()
    placards_only()
    if problems:
        print("REFUSING (the page as written):\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    print("hey good cookin: the hall, the welcome, the placards, the line, the week, the line from a "
          "chair, the classes, the temperatures, the teaching screen and the rack written")


if __name__ == "__main__":
    main()
