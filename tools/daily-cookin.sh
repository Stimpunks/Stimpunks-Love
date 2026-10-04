#!/usr/bin/env bash
#
# Refill the rack in Hey, Good Cookin' with the last month of the cooking
# channels' videos and put it on the live site. tools/daily-large.sh's twin, and
# a twin rather than a sixth half of anything on purpose: a cooking channel
# failing to answer must not leave Learning Large's rack, The Open Notebook's
# log, Vital Plant Living's telly, The Doom Scoop or The Feed behind, and the
# other way round. Each timer's refusal stays its own.
#
# WHAT IT DOES, in order, stopping at the first refusal:
#   1. refuses unless the tree is on main and the files it owns are clean
#   2. pull-cookin-month.py         — reads both of every channel's feeds and each
#                                     new video's watch page (the only step that
#                                     needs network)
#   3. make-hey-good-cookin.py --month — redraws the rack and nothing else on the page
#   4. make-now-playing.py          — the poster column names what the rack puts on
#                                     first, which is the newest of the first
#                                     channel's videos and so moves with the rack
#   5. the fast offline checkers, as a gate on committing a broken page
#   6. commits ONLY its own paths, and pushes
#
# IT COMMITS ITS OWN PATHS AND NOTHING ELSE, for daily-arrivals.sh's reason: a
# timer that commits whatever happens to be dirty will one day catch an
# interactive session's half-finished work and land it under a message that
# says nothing. If anything else is dirty this says so and leaves it alone.
# now-playing.html IS one of them, daily-scoop.sh's reason: the room has nothing
# to press but the rack, so the poster's line for it is the rack's first video,
# and that changes whenever the first channel puts something up. The scoop's
# timer and Learning Large's run before this one and reprint the poster too;
# this one reprints it again after its own rack has moved, so the poster ends
# the morning agreeing with every room whose line on it moves.
#
# A PUSH FAILURE IS NOT FATAL. The commit stays local and the next run or the
# next session pushes it. Never rebased, never retried.
#
# EXIT CODES:  0 committed, or a clean no-op   2 a guard refused, nothing written
#              1 an error
#
set -uo pipefail

REPO="/Users/ryan/Documents/GitHub/Stimpunks-Love"
OWNED=("data/hey-good-cookin-month.json" "hey-good-cookin.html" "now-playing.html")
cd "$REPO" || { echo "error: cannot cd to $REPO"; exit 1; }

refuse() { echo "REFUSED: $*"; exit 2; }

# ── 1. Is it safe to write here at all? ──────────────────────────────────────
branch="$(git rev-parse --abbrev-ref HEAD)"
[ "$branch" = "main" ] || refuse "on branch '$branch', not main. Nothing written."

dirty_owned="$(git status --porcelain -- "${OWNED[@]}")"
[ -z "$dirty_owned" ] || refuse $'the rack'"'"$'s own files are already modified — a session is\n         mid-edit on them. Nothing written.\n'"$dirty_owned"

# ── 2, 3 & 4. Read the feeds, refill the rack, reprint the poster ───────────
# pull-cookin-month.py reads EVERY feed before it writes anything, so a refusal
# part-way leaves yesterday's rack standing rather than half-filling it.
python3 tools/pull-cookin-month.py || refuse "a feed did not answer, or answered with something this does not parse.
         Yesterday's rack is still standing. See the output above."
python3 tools/make-hey-good-cookin.py --month || refuse "the rack would not fill from what was read."
python3 tools/make-now-playing.py >/dev/null || refuse "the poster column would not print after the rack was filled."

# ── 5. The gate ──────────────────────────────────────────────────────────────
# Fast, offline, and every one of them reads the published HTML. The ones that
# need a browser are not here, for daily-arrivals.sh's reason.
for check in check-ids check-classes check-counts check-headings check-contrast; do
  python3 "tools/$check.py" >/dev/null 2>&1 || refuse "tools/$check.py failed after the rack was filled.
         The working tree has an unpublished rack in it — look before you commit.
         Re-run it by hand to see what it says."
done

# ── 6. Commit and push, or say plainly that nothing changed ──────────────────
if [ -z "$(git status --porcelain -- "${OWNED[@]}")" ]; then
  echo "no change: every feed read the same videos it had. Nothing committed."
  exit 0
fi

rows="$(python3 - <<'PY'
import json
d = json.load(open("data/hey-good-cookin-month.json"))
live = [v for v in d["log"] if v["state"] in ("screen", "door")]
print(f"{len(live)} videos on the rack from {len(d['sources'])} channels, filled {d['set']}")
PY
)"

# THE SUBJECT IS FIXED AND MACHINE-SHAPED ON PURPOSE, daily-arrivals.sh's
# reason: the Knowledge System's update-logs-daily writes Ryan's changelog out of
# this repository's commits and skips the subjects its AUTOMATED pattern names.
# That pattern names this one too, or a rack refill lands in the changelog
# every morning. Change it only together with that pattern.
git add -- "${OWNED[@]}"
git commit --quiet -m "daily good cookin refill" -m "$rows

Written by tools/daily-cookin.sh on a timer. Nothing here is a decision: the
rack is a snapshot of the channels' own feeds and this is the snapshot being
retaken. See hey-good-cookin.html and DECISIONS.md." \
  || { echo "error: commit failed"; exit 1; }

echo "committed: $rows"

if git push --quiet 2>/dev/null; then
  echo "pushed. The live rack is this morning's."
else
  echo "push FAILED — the commit is saved locally and the live rack is still yesterday's."
  echo "Not retried and not rebased; a session should look at it."
fi

stray="$(git status --porcelain | grep -v -F -e "data/hey-good-cookin-month.json" -e "hey-good-cookin.html" -e "now-playing.html" | wc -l | tr -d ' ')"
[ "$stray" != "0" ] && echo "note: $stray path(s) dirty outside this script's scope, left untouched."

exit 0
