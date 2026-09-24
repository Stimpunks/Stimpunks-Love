#!/usr/bin/env bash
# install-scheduled-task.sh — the repo copy of arrivals-board-daily's prompt is the source of truth.
#
# The prompt that drives this site's one unattended job lived only in ~/.claude/scheduled-tasks/
# until 2026-09-24: outside this repo, outside git, outside every check. It had already drifted
# (it still called the site stimpunks.love a day after the move to stimpunks.world). Edit the
# repo copy, then install it:
#
#   tools/install-scheduled-task.sh          # report drift, write nothing (exit 2 if it differs)
#   tools/install-scheduled-task.sh --go     # install the repo copy over the live one
#   tools/install-scheduled-task.sh --pull   # adopt a live edit back into the repo
#
# --pull is the escape hatch for an edit made through the scheduled-tasks UI. If you use it often,
# the repo has stopped being the source of truth, and that is the thing to fix.
#
# This installs the PROMPT only. The schedule itself (cron 10 6 * * *) is
# held by the scheduler, not by this file; changing when the task runs is done there.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TASK=arrivals-board-daily
REPO="$ROOT/.claude/scheduled-tasks/$TASK/SKILL.md"
LIVE="$HOME/.claude/scheduled-tasks/$TASK/SKILL.md"
MODE="${1:---check}"

[ -f "$REPO" ] || { echo "ERROR: no $REPO"; exit 1; }
case "$MODE" in --check|--go|--pull) ;; *) echo "usage: $0 [--check|--go|--pull]"; exit 2 ;; esac

if [ ! -f "$LIVE" ]; then
  case "$MODE" in
    --go) mkdir -p "$(dirname "$LIVE")"; cp "$REPO" "$LIVE"
          echo "INSTALL  $TASK — was not present. The prompt is in place, but a task also needs a"
          echo "         schedule, which only the scheduler can create; this file cannot." ;;
    *)    echo "ABSENT   $TASK — not installed on this machine"; exit 2 ;;
  esac
  exit 0
fi

if cmp -s "$REPO" "$LIVE"; then echo "ok       $TASK"; exit 0; fi

case "$MODE" in
  --go)   cp "$REPO" "$LIVE"; echo "UPDATE   $TASK — repo copy installed over the live one" ;;
  --pull) cp "$LIVE" "$REPO"; echo "PULL     $TASK — live copy adopted into the repo; commit it" ;;
  *)      echo "DIFFERS  $TASK"
          # `|| true`: diff exits 1 exactly when there is something to show.
          { diff -u "$REPO" "$LIVE" | sed -n '3,$p' | head -30; } || true
          echo "Run with --go to install the repo copy, or --pull to adopt the live one. Nothing was written."
          exit 2 ;;
esac
