#!/usr/bin/env bash
# Every generator and every checker, in the one order that works, stopping at the
# first refusal. Run it before every commit, from anywhere in the repository:
#
#     tools/check-all.sh
#
# WHY THIS EXISTS. Two people commit to this street now -- Ryan and Helen Edgar,
# 2026-09-26 -- and the README's list of sixty-odd commands had already fallen
# behind the tools/ directory by five (Covenstead, the Lagoon, Looming Rocks,
# Sithen and check-weights.py were missing), which is a list somebody else's
# Claude would have followed faithfully. A list in prose is a list that drifts;
# this is the list, and it is run rather than read.
#
# THE ORDER IS LOAD-BEARING. Images are converted before anything reads them;
# the rooms are built before the things that read the rooms (Now Playing reads
# every room's published page, the sign-off and the structured data read every
# head, the share cards photograph every page); the checkers run last, against
# what the generators wrote. Running a checker before its generator passes
# against yesterday's page.
#
# WHAT IT LEAVES OUT, ON PURPOSE: the tools that need the network
# (check-jukebox.py, pull-arrivals.py, pull-foundry.py, pull-club.py), because a
# gate that fails on a train is a gate people learn to skip, and the ones you run
# by hand for a reason (intake-collection.py, daily-arrivals.sh). The README says
# when each of those is wanted.
#
# ON A CLEAN TREE IT CHANGES NOTHING. Every generator here rewrites its output
# from its sources, so if `git status` shows a change afterwards, either a source
# changed and the generated files are catching up -- commit them together -- or a
# generated file was edited by hand and has just been put back. Never hand-edit a
# generated line; edit its source and run this.
#
# When a tool refuses, fix the cause. Do not loosen the tool, and do not skip it.
set -uo pipefail
cd "$(dirname "$0")/.."

STEPS=(
  # Images first: the rooms and the cards reference what this decides.
  make-webp
  # The rooms, each from its own data file.
  make-jukebox make-liner-notes make-chappell make-readings make-polaroids
  make-toys make-chairy make-yells make-soundboard make-yurt-sound
  make-pebbles make-latibulum make-jungle make-den make-hermitage make-club make-mopery
  make-sweetgrass make-oracle make-doomscroll make-pebble-board make-guild
  make-arrivals make-garden make-zibaldone make-rabbit-hole make-checkpoint
  make-dead-tired make-laughingstock make-picture-house make-samefood
  make-collection make-vital make-community make-dressup make-mural
  make-coworking make-live-room make-broadside make-doom-scoop make-library make-dance-punks
  make-small-hours make-repeater make-nothing-for-sale make-covenstead
  make-lagoon make-looming make-sithen make-foundry
  # Things that read the rooms, after the rooms.
  make-now-playing make-map make-signoff make-structured make-sitemap
  make-feed make-csp make-agent-files make-og make-icons make-security
  # The checkers, against what was just written.
  check-contrast check-headings check-counts check-ids check-classes
  check-quests check-faces check-print check-gentle check-contrast-live
  check-focus check-weights
)

# The CB's one invariant, first, because it needs nothing but Node: no write
# that was told it worked is ever missing. See netlify/cb/lib.test.mjs.
printf '\n\033[1m== the CB under load\033[0m\n'
if ! node --test netlify/cb/lib.test.mjs; then
  printf '\n\033[1mSTOPPED at the CB test.\033[0m A write the CB said worked can go missing.\n'
  exit 1
fi

for s in "${STEPS[@]}"; do
  printf '\n\033[1m== %s\033[0m\n' "$s"
  if ! python3 "tools/$s.py"; then
    printf '\n\033[1mSTOPPED at %s.\033[0m Fix what it says, then run this again.\n' "$s"
    printf 'Nothing after it has run, so nothing after it has been checked.\n'
    exit 1
  fi
done

printf '\n\033[1mEverything ran and nothing refused.\033[0m\n'
if [ -n "$(git status --porcelain)" ]; then
  printf 'These files changed; commit them with the change that caused them:\n'
  git status --short
else
  printf 'The tree is clean: every generated file already matched its sources.\n'
fi
