#!/usr/bin/env bash
#
# Fill The Doom Scoop's cabinet with this morning's edition and put it on the
# live site. tools/daily-arrivals.sh's twin, and a twin rather than a second
# half of that script on purpose: a news channel failing to answer must not
# leave The Feed's board unset, and a sibling site's feed failing must not leave
# the cabinet unfilled. Each timer's refusal stays its own.
#
# WHAT IT DOES, in order, stopping at the first refusal:
#   1. refuses unless the tree is on main and the files it owns are clean
#   2. pull-doom-scoop.py   — reads every source's feed and each new video's
#                             watch page (the only step that needs network)
#   3. make-doom-scoop.py   — fills the cabinet from what was read
#   4. make-now-playing.py  — the poster column names what the cabinet puts on
#                             first, read off the room's published page, so it
#                             moves every morning with the cabinet
#   5. the fast offline checkers, as a gate on committing a broken page
#   6. commits ONLY its own paths, and pushes
#
# IT COMMITS ITS OWN PATHS AND NOTHING ELSE, for daily-arrivals.sh's reason: a
# timer that commits whatever happens to be dirty will one day catch an
# interactive session's half-finished work and land it under a message that
# says nothing. If anything else is dirty this says so and leaves it alone.
#
# A PUSH FAILURE IS NOT FATAL. The commit stays local and the next run or the
# next session pushes it. Never rebased, never retried.
#
# EXIT CODES:  0 committed, or a clean no-op   2 a guard refused, nothing written
#              1 an error
#
set -uo pipefail

REPO="/Users/ryan/Documents/GitHub/Stimpunks-Love"
OWNED=("data/doom-scoop.json" "the-doom-scoop.html" "now-playing.html")
cd "$REPO" || { echo "error: cannot cd to $REPO"; exit 1; }

refuse() { echo "REFUSED: $*"; exit 2; }

# ── 1. Is it safe to write here at all? ──────────────────────────────────────
branch="$(git rev-parse --abbrev-ref HEAD)"
[ "$branch" = "main" ] || refuse "on branch '$branch', not main. Nothing written."

dirty_owned="$(git status --porcelain -- "${OWNED[@]}")"
[ -z "$dirty_owned" ] || refuse $'the cabinet'"'"$'s own files are already modified — a session is\n         mid-edit on them. Nothing written.\n'"$dirty_owned"

# ── 2, 3 & 4. Read the feeds, fill the cabinet, re-print the poster ──────────
# pull-doom-scoop.py reads EVERY feed before it writes anything, so a refusal
# part-way leaves yesterday's cabinet standing rather than half-filling it.
python3 tools/pull-doom-scoop.py || refuse "a feed did not answer, or answered with something this does not parse.
         Yesterday's cabinet is still standing. See the output above."
python3 tools/make-doom-scoop.py || refuse "the cabinet would not fill from what was read."
python3 tools/make-now-playing.py >/dev/null || refuse "the poster column would not print after the cabinet was filled."

# ── 5. The gate ──────────────────────────────────────────────────────────────
# Fast, offline, and every one of them reads the published HTML. The ones that
# need a browser are not here, for daily-arrivals.sh's reason: nothing a morning's
# headlines can do moves a colour, a tilt or a share card.
for check in check-ids check-classes check-counts check-headings check-contrast; do
  python3 "tools/$check.py" >/dev/null 2>&1 || refuse "tools/$check.py failed after the cabinet was filled.
         The working tree has an unpublished cabinet in it — look before you commit.
         Re-run it by hand to see what it says."
done

# ── 6. Commit and push, or say plainly that nothing changed ──────────────────
if [ -z "$(git status --porcelain -- "${OWNED[@]}")" ]; then
  echo "no change: every feed read the same scoops it had. Nothing committed."
  exit 0
fi

rows="$(python3 - <<'PY'
import json
d = json.load(open("data/doom-scoop.json"))
live = [s for s in d["scoops"] if s["state"] in ("screen", "door") and s["edition"] <= d["newest"]]
print(f"{len(live)} scoops on the page, newest morning {d['newest']}, filled {d['set']}")
PY
)"

# THE SUBJECT IS FIXED AND MACHINE-SHAPED ON PURPOSE, daily-arrivals.sh's
# reason: the Knowledge System's update-logs-daily writes Ryan's changelog out of
# this repository's commits and skips the subjects its AUTOMATED pattern names.
# That pattern must name this one too, or a cabinet refill lands in the
# changelog every morning. Change it only together with that pattern.
git add -- "${OWNED[@]}"
git commit --quiet -m "daily doom scoop edition" -m "$rows

Written by tools/daily-scoop.sh on a timer. Nothing here is a decision: the
cabinet is a snapshot of the sources' own feeds and this is the snapshot being
retaken. See the-doom-scoop.html and DECISIONS.md." \
  || { echo "error: commit failed"; exit 1; }

echo "committed: $rows"

if git push --quiet 2>/dev/null; then
  echo "pushed. The live cabinet is this morning's."
else
  echo "push FAILED — the commit is saved locally and the live cabinet is still yesterday's."
  echo "Not retried and not rebased; a session should look at it."
fi

stray="$(git status --porcelain | grep -v -F -e "data/doom-scoop.json" -e "the-doom-scoop.html" -e "now-playing.html" | wc -l | tr -d ' ')"
[ "$stray" != "0" ] && echo "note: $stray path(s) dirty outside this script's scope, left untouched."

exit 0
