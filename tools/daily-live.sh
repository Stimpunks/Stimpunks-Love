#!/usr/bin/env bash
#
# Refill the month under the Live Room's desk with the latest month off each
# studio's own channel and put it on the live site. tools/daily-sanctuary.sh's
# twin, and a twin rather than a part of anything else on purpose: one studio's
# channel failing to answer must not leave the sanctuary's rack, the farm's or
# any other room's behind, and the other way round. Each timer's refusal stays
# its own.
#
# WHAT IT DOES, in order, stopping at the first refusal:
#   1. refuses unless the tree is on main and the files it owns are clean
#   2. pull-live-month.py           — reads both of every studio channel's feeds,
#                                     its list page where a feed does not reach back
#                                     to what is covered, and each new video's watch
#                                     page (the only step that needs network)
#   3. make-live-room.py --month    — redraws the month and nothing else on the page
#   4. the fast offline checkers, as a gate on committing a broken page
#   5. commits ONLY its own paths, and pushes
#
# IT COMMITS ITS OWN PATHS AND NOTHING ELSE, for daily-arrivals.sh's reason: a
# timer that commits whatever happens to be dirty will one day catch an
# interactive session's half-finished work and land it under a message that
# says nothing. If anything else is dirty this says so and leaves it alone.
# now-playing.html is NOT one of them: the room's line on the poster is the
# first strip on the desk, which a person patched in, and the month is under
# the desk, so a refill never moves it.
#
# A PUSH FAILURE IS NOT FATAL. The commit stays local and the next run or the
# next session pushes it. Never rebased, never retried.
#
# EXIT CODES:  0 committed, or a clean no-op   2 a guard refused, nothing written
#              1 an error
#
set -uo pipefail

REPO="/Users/ryan/Documents/GitHub/Stimpunks-Love"
OWNED=("data/live-room-month.json" "live-room.html")
cd "$REPO" || { echo "error: cannot cd to $REPO"; exit 1; }

refuse() { echo "REFUSED: $*"; exit 2; }

# ── 1. Is it safe to write here at all? ──────────────────────────────────────
branch="$(git rev-parse --abbrev-ref HEAD)"
[ "$branch" = "main" ] || refuse "on branch '$branch', not main. Nothing written."

dirty_owned="$(git status --porcelain -- "${OWNED[@]}")"
[ -z "$dirty_owned" ] || refuse $'the month'"'"$'s own files are already modified — a session is\n         mid-edit on them. Nothing written.\n'"$dirty_owned"

# ── 2 & 3. Read the feeds, refill the month ──────────────────────────────────
# pull-live-month.py reads EVERY feed before it writes anything, so a refusal
# part-way leaves yesterday's month standing rather than half-filling it.
python3 tools/pull-live-month.py || refuse "a feed did not answer, or answered with something this does not parse.
         Yesterday's month is still standing. See the output above."
python3 tools/make-live-room.py --month || refuse "the month would not fill from what was read."

# ── 4. The gate ──────────────────────────────────────────────────────────────
# Fast, offline, and every one of them reads the published HTML. The ones that
# need a browser are not here, for daily-arrivals.sh's reason.
for check in check-ids check-classes check-counts check-headings check-contrast; do
  python3 "tools/$check.py" >/dev/null 2>&1 || refuse "tools/$check.py failed after the month was filled.
         The working tree has an unpublished month in it — look before you commit.
         Re-run it by hand to see what it says."
done

# ── 5. Commit and push, or say plainly that nothing changed ──────────────────
if [ -z "$(git status --porcelain -- "${OWNED[@]}")" ]; then
  echo "no change: every feed read the same videos it had. Nothing committed."
  exit 0
fi

rows="$(python3 - <<'PY'
import json
d = json.load(open("data/live-room-month.json"))
live = [v for v in d["log"] if v["state"] in ("screen", "door")]
print(f"{len(live)} videos under the desk from {len(d['sources'])} studio channels, filled {d['set']}")
PY
)"

# THE SUBJECT IS FIXED AND MACHINE-SHAPED ON PURPOSE, daily-arrivals.sh's
# reason: the Knowledge System's update-logs-daily writes Ryan's changelog out of
# this repository's commits and skips the subjects its AUTOMATED pattern names.
# That pattern names this one too, or a month's refill lands in the changelog
# every morning. Change it only together with that pattern.
git add -- "${OWNED[@]}"
git commit --quiet -m "daily live room refill" -m "$rows

Written by tools/daily-live.sh on a timer. Nothing here is a decision: the
month is a snapshot of the studios' own channels and this is the snapshot
being retaken. See live-room.html and DECISIONS.md." \
  || { echo "error: commit failed"; exit 1; }

echo "committed: $rows"

if git push --quiet 2>/dev/null; then
  echo "pushed. The live month is this morning's."
else
  echo "push FAILED — the commit is saved locally and the live month is still yesterday's."
  echo "Not retried and not rebased; a session should look at it."
fi

stray="$(git status --porcelain | grep -v -F -e "data/live-room-month.json" -e "live-room.html" | wc -l | tr -d ' ')"
[ "$stray" != "0" ] && echo "note: $stray path(s) dirty outside this script's scope, left untouched."

exit 0
