#!/usr/bin/env bash
#
# Fold what the office posted to Stimpunks Social into the repository, and put
# /social as built from it on the live site (2026-11-02). The other morning
# timers' twin, and a twin rather than a part of any of them, for their reason:
# one failing must not leave another behind.
#
# WHAT IT DOES, in order, stopping at the first refusal:
#   1. refuses unless the tree is on main and the files it owns are clean
#   2. pull-social.py   — reads the live /cb/social and adds every post the data
#                         does not have yet (the only step that needs network)
#   3. make-social.py   — rebuilds social.html's posts and social.xml
#   4. the fast offline checkers, as a gate on committing a broken page
#   5. commits ONLY its own paths, and pushes
#
# A post is on /social from the moment the office posts it, from the server;
# this only makes it part of the page as built, and of the feed. Nothing here
# is a decision: the words are the ones somebody posted.
#
# EXIT CODES:  0 committed, or a clean no-op   2 a guard refused, nothing written
#              1 an error
#
set -uo pipefail

REPO="/Users/ryan/Documents/GitHub/Stimpunks-Love"
OWNED=("data/social.json" "social.html" "social.xml")
cd "$REPO" || { echo "error: cannot cd to $REPO"; exit 1; }

refuse() { echo "REFUSED: $*"; exit 2; }

# ── 1. Is it safe to write here at all? ──────────────────────────────────────
branch="$(git rev-parse --abbrev-ref HEAD)"
[ "$branch" = "main" ] || refuse "on branch '$branch', not main. Nothing written."

dirty_owned="$(git status --porcelain -- "${OWNED[@]}")"
[ -z "$dirty_owned" ] || refuse $'/social'"'"$'s own files are already modified — a session is\n         mid-edit on them. Nothing written.\n'"$dirty_owned"

# ── 2 & 3. Fold, rebuild ──────────────────────────────────────────────────
python3 tools/pull-social.py || refuse "the site did not answer, or answered with something this does not read.
         The page as built yesterday is still standing. See the output above."
python3 tools/make-social.py || refuse "the page would not build from what was folded in."

# ── 4. The gate ──────────────────────────────────────────────────────────────
# Fast, offline, and every one of them reads the published HTML. The ones that
# need a browser are not here, for daily-arrivals.sh's reason.
for check in check-ids check-classes check-counts check-headings check-contrast; do
  python3 "tools/$check.py" >/dev/null 2>&1 || refuse "tools/$check.py failed after /social was rebuilt.
         The working tree has an unpublished /social in it — look before you commit.
         Re-run it by hand to see what it says."
done

# ── 5. Commit and push, or say plainly that nothing changed ──────────────────
if [ -z "$(git status --porcelain -- "${OWNED[@]}")" ]; then
  echo "no change: nothing new was posted to Stimpunks Social. Nothing committed."
  exit 0
fi

rows="folded into data/social.json"

# THE SUBJECT IS FIXED AND MACHINE-SHAPED ON PURPOSE, daily-arrivals.sh's
# reason: update-logs-daily skips the subjects its AUTOMATED pattern names.
git add -- "${OWNED[@]}"
git commit --quiet -m "daily social fold" -m "$rows

Written by tools/daily-social.sh on a timer. Nothing here is a decision:
the posts are the ones the office already put on /social." \
  || { echo "error: commit failed"; exit 1; }

echo "committed: $rows"

if git push --quiet 2>/dev/null; then
  echo "pushed. /social is built from this morning's data."
else
  echo "push FAILED — the commit is saved locally; /social still shows the posts from the server."
  echo "Not retried and not rebased; a session should look at it."
fi

stray="$(git status --porcelain | grep -v -F -e "data/social.json" -e "social.html" -e "social.xml" | wc -l | tr -d ' ')"
[ "$stray" != "0" ] && echo "note: $stray path(s) dirty outside this script's scope, left untouched."

exit 0
