#!/usr/bin/env bash
#
# Re-set The Feed's arrivals board and put it on the live site. The single
# command tools/daily-arrivals.sh exists for is a TIMER, which is why it is one
# script rather than a list of steps in a prompt: a headless run that improvises
# is a headless run that commits something nobody read.
#
# WHAT IT DOES, in order, stopping at the first refusal:
#   1. refuses unless the tree is on main and the two files it owns are clean
#   2. pull-arrivals.py   — reads every feed (the only step that needs network)
#   3. make-arrivals.py   — draws the board from what was read
#   4. the fast offline checkers, as a gate on committing a broken page
#   5. commits ONLY data/arrivals.json and the-feed.html, and pushes
#
# IT COMMITS TWO PATHS AND NOTHING ELSE. That is notes-backup-daily's lesson in
# the Knowledge System, learned the hard way over there: a timer that commits
# whatever happens to be dirty will one day catch an interactive session's
# half-finished work and land it under a message that says nothing. If anything
# else is dirty this says so and leaves it alone.
#
# A PUSH FAILURE IS NOT FATAL. The commit stays local and the next run or the
# next session pushes it. A timer that starts rebasing unattended to "get
# today's board out" is a timer resolving conflicts nobody is watching.
#
# EXIT CODES:  0 committed, or a clean no-op   2 a guard refused, nothing written
#              1 an error
#
set -uo pipefail

REPO="/Users/ryan/Documents/GitHub/Stimpunks-Love"
OWNED=("data/arrivals.json" "the-feed.html")
cd "$REPO" || { echo "error: cannot cd to $REPO"; exit 1; }

refuse() { echo "REFUSED: $*"; exit 2; }

# ── 1. Is it safe to write here at all? ──────────────────────────────────────
branch="$(git rev-parse --abbrev-ref HEAD)"
[ "$branch" = "main" ] || refuse "on branch '$branch', not main. Nothing written."

dirty_owned="$(git status --porcelain -- "${OWNED[@]}")"
[ -z "$dirty_owned" ] || refuse $'the board'"'"$'s own files are already modified — a session is\n         mid-edit on them. Nothing written.\n'"$dirty_owned"

# ── 2 & 3. Read the feeds, then draw the board ───────────────────────────────
# pull-arrivals.py writes the data file only after EVERY wire has been read, so
# a refusal part-way leaves yesterday's board standing rather than half-setting
# a new one. That is the behaviour this step is relying on.
python3 tools/pull-arrivals.py || refuse "a feed did not answer, or answered with something this does not parse.
         Yesterday's board is still standing. See the output above."
python3 tools/make-arrivals.py || refuse "the board would not draw from what was read."

# ── 4. The gate ──────────────────────────────────────────────────────────────
# Fast, offline, and every one of them reads the published HTML. The four that
# need a browser are not here: nothing about a re-pull can move a colour, a tilt
# or a share card, and a timer that took twenty minutes of Chrome every morning
# would be a timer somebody turns off.
for check in check-ids check-classes check-counts check-quests check-contrast; do
  python3 "tools/$check.py" >/dev/null 2>&1 || refuse "tools/$check.py failed after the board was drawn.
         The working tree has an unpublished board in it — look before you commit.
         Re-run it by hand to see what it says."
done

# ── 5. Commit and push, or say plainly that nothing changed ──────────────────
if [ -z "$(git status --porcelain -- "${OWNED[@]}")" ]; then
  echo "no change: every wire read the same rows it had. Nothing committed."
  exit 0
fi

rows="$(python3 - <<'PY'
import json
d = json.load(open("data/arrivals.json"))
print(f"{len(d['wires'])} wires, {sum(len(w['items']) for w in d['wires'])} rows, set {d['set']}")
PY
)"

# THE SUBJECT IS FIXED AND MACHINE-SHAPED ON PURPOSE. The Knowledge System's
# update-logs-daily reads this repository's commits every morning and writes
# Ryan's changelog out of them; a routine board reset appearing there daily
# would be noise in a document that exists to record what actually changed. That
# tool's AUTOMATED pattern ("daily notes backup", "weekly snapshot") covered only
# its own repo until 2026-09-24; it now covers the sibling repos too and names
# this exact subject, so the reset is filtered out before anyone reads it. That
# makes the subject LOAD-BEARING: reword it and a board reset lands in the
# changelog every morning again. Change it only together with the AUTOMATED
# pattern in the Knowledge System's .claude/skills/update-logs/update_logs.py.
# The detail that varies lives in the body.
git add -- "${OWNED[@]}"
git commit --quiet -m "daily arrivals board reset" -m "$rows

Written by tools/daily-arrivals.sh on a timer. Nothing here is a decision:
the board is a snapshot of eight feeds and this is the snapshot being retaken.
See the-feed.html and DECISIONS.md for why it cannot read them live." \
  || { echo "error: commit failed"; exit 1; }

echo "committed: $rows"

if git push --quiet 2>/dev/null; then
  echo "pushed. The live board is this morning's."
else
  echo "push FAILED — the commit is saved locally and the live board is still yesterday's."
  echo "Not retried and not rebased; a session should look at it."
fi

stray="$(git status --porcelain | grep -v -F -e "data/arrivals.json" -e "the-feed.html" | wc -l | tr -d ' ')"
[ "$stray" != "0" ] && echo "note: $stray path(s) dirty outside this script's scope, left untouched."

exit 0
