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
#
# THE QUICK PATH, FOR NOTES (Ryan's ask, 2026-10-24, after a one-line change to
# DECISIONS.md waited twelve minutes for the whole street to be rebuilt). When
# every file changed since the last commit is one of NOTES below, this runs only
# the checkers that read those files and stops. It is not a list of checkers kept
# by hand: the readers are found by looking for the file's name in quotes in
# tools/ and netlify/, and if anything that reads one is not a checker, this
# says so and runs everything, because a generator reading a note is a page that
# can change. Today the only reader is check-counts.py, which refuses a note
# saying how many rooms there are. A new file in the tree, or any other change,
# is the full run. `tools/check-all.sh --full` runs everything regardless.
#
# THE TIMINGS. Every step of the full run prints how long it took, and the run
# ends with its total and its slowest steps, so what to make faster next is
# measured rather than guessed. The first measured run (2026-10-24) took 15m 19s,
# nine minutes of it check-gentle, check-focus and check-contrast-live one after
# another; those three now run side by side (a + in STEPS joins them), because
# each only reads and keeps its own probe file and Chrome profile (a profile of
# its own starts Chrome much faster: the three took 177s together with one and
# 275s without). make-og.py draws its cards several at a time inside itself,
# WITHOUT a profile of its own, because a profile changes the height of the
# viewport a card is laid out in, and that moved thirteen cards' prints. perl gives tenths of a second (the bash on a Mac is 3.2, which has no
# clock of its own finer than a second); without perl it counts whole seconds.
set -uo pipefail
cd "$(dirname "$0")/.."

NOTES="DECISIONS.md README.md CLAUDE.md SECURITY.md"

now() { perl -MTime::HiRes=time -e 'printf "%.1f", time' 2>/dev/null || date +%s; }
since() { awk -v a="$1" -v b="$(now)" 'BEGIN { printf "%.1f", b - a }'; }
START=$(now)
TIMES=""

# One step, timed: its heading, the command, how long it took.
step() {
  local name=$1; shift
  printf '\n\033[1m== %s\033[0m\n' "$name"
  local t0 rc dt
  t0=$(now)
  "$@"; rc=$?
  dt=$(since "$t0")
  TIMES="${TIMES}${dt}	${name}
"
  printf '\033[2m   (%ss)\033[0m\n' "$dt"
  return $rc
}

# Steps joined by + run side by side, each into a log of its own, printed in turn
# once all of them are done so their output never interleaves. Each still says
# how long it took on its own; the run's list counts the time they took together.
# Only for steps that read and never write: two writers side by side is a race.
together() {
  local dir t0 name dt rc bad="" names
  names=$(echo "$*" | sed 's/ /, /g')
  dir=$(mktemp -d "${TMPDIR:-/tmp}/check-all.XXXXXX")
  t0=$(now)
  printf '\n\033[1m== %s, side by side\033[0m\n' "$names"
  for name in "$@"; do
    ( s0=$(now); python3 "tools/$name.py" > "$dir/$name.log" 2>&1; rc=$?
      echo "$(since "$s0") $rc" > "$dir/$name.done" ) &
  done
  wait
  for name in "$@"; do
    read -r dt rc < "$dir/$name.done"
    printf '\n\033[1m== %s\033[0m\n' "$name"
    cat "$dir/$name.log"
    printf '\033[2m   (%ss, beside the others)\033[0m\n' "$dt"
    [ "$rc" = 0 ] || bad="$bad $name"
  done
  dt=$(since "$t0")
  printf '\033[2m   (%ss for all of them, side by side)\033[0m\n' "$dt"
  TIMES="${TIMES}${dt}	${names}, side by side
"
  rm -rf "$dir"
  if [ -n "$bad" ]; then
    STOPPED_AT=$(echo $bad | sed 's/ /, /g')
    return 1
  fi
}

# How long the run took, and the steps that took longest.
report() {
  local total
  total=$(awk -v t="$(since "$START")" 'BEGIN { printf "%d", t + .5 }')
  printf '\n\033[1mTook %dm %02ds.\033[0m The slowest steps:\n' $((total / 60)) $((total % 60))
  printf '%s' "$TIMES" | sort -t "$(printf '\t')" -k1,1 -rn | head -12 | awk -F '\t' '{ printf "  %7.1fs  %s\n", $1, $2 }'
}

# ── The quick path ──────────────────────────────────────────────────────────
full=""
[ "${1:-}" = "--full" ] && full=1
changed=$({ git diff --name-only --no-renames HEAD; git ls-files --others --exclude-standard; } | sort -u)
quick=""
if [ -z "$full" ] && [ -n "$changed" ]; then
  quick=1
  while IFS= read -r f; do
    case " $NOTES " in *" $f "*) ;; *) quick=""; break ;; esac
  done <<EOF_CHANGED
$changed
EOF_CHANGED
fi
if [ -n "$quick" ]; then
  readers=""
  for f in $changed; do
    for t in tools/*.py tools/*.mjs tools/*.sh netlify/cb/*.mjs netlify/functions/*.mjs; do
      [ -f "$t" ] && [ "$t" != tools/check-all.sh ] || continue
      grep -qF "\"$f\"" "$t" || grep -qF "'$f'" "$t" || continue
      case "$t" in
        tools/check-*.py) case " $readers " in *" $t "*) ;; *) readers="$readers $t" ;; esac ;;
        *) printf '%s reads %s, and it is not a checker, so this runs everything.\n' "$t" "$f"
           quick=""; break 2 ;;
      esac
    done
  done
fi
if [ -n "$quick" ]; then
  printf '\033[1mOnly notes changed\033[0m (%s), so this runs only what reads them.\n' "$(echo $changed)"
  printf 'Anything else changed would be the full run; tools/check-all.sh --full runs it anyway.\n'
  for t in $readers; do
    if ! step "$(basename "$t" .py)" python3 "$t"; then
      printf '\n\033[1mSTOPPED at %s.\033[0m Fix what it says, then run this again.\n' "$(basename "$t" .py)"
      exit 1
    fi
  done
  [ -n "$readers" ] || printf '\nNothing here reads %s.\n' "$(echo $changed)"
  printf '\n\033[1mEverything that reads them ran and nothing refused\033[0m, in %ss.\n' "$(since "$START")"
  printf 'These files changed; commit them:\n'
  git status --short
  exit 0
fi

STEPS=(
  # Images first: the rooms and the cards reference what this decides.
  make-webp
  # The rooms, each from its own data file.
  make-jukebox make-liner-notes make-chappell make-readings make-polaroids
  make-toys make-chairy make-yells make-soundboard make-yurt-sound make-yurt-yarn make-yurt-cinema make-yurt-myths make-glow-wild make-play-pod make-yurt-stim make-yurt-gallery
  make-pebbles make-neighbours make-latibulum make-jungle make-den make-hermitage make-club make-mopery
  make-sweetgrass make-oracle make-doomscroll make-pebble-board make-guild make-patches
  make-arrivals make-the-source make-garden make-zibaldone make-rabbit-hole make-checkpoint
  make-dead-tired make-community-care make-coping make-pets make-show-your-work make-volunteers make-breaker-breaker make-laughingstock make-picture-house make-samefood
  make-collection make-vital make-open-notebook make-learning-large make-hey-good-cookin make-pekoe make-a-quiet-pint make-brew-and-stew make-mountain-cabin make-natures-contribution make-all-needs-met make-brighter-days make-gentle-help make-all-together-now make-the-dairy make-the-honesty-box make-wide-spread-chaos make-the-run make-truckin-food-court make-the-green make-the-pile make-your-room make-sandbox make-community make-member-map make-dressup make-bodymind make-fancy-dress make-chimera-obscura make-cozies make-mural make-pando make-fridge make-stair make-rescue make-accounts make-brass make-forum make-tasks make-office make-profile
  make-coworking make-town-hall make-live-room make-broadside make-doom-scoop make-library make-dance-punks
  make-small-hours make-repeater make-nothing-for-sale make-covenstead
  make-lagoon make-looming make-sithen make-stay-frosty make-stay-breezy make-mycelium make-big-steep make-glow make-rave make-cooldown make-mud make-secret-cabin make-foundry make-bodymind-break
  # Things that read the rooms, after the rooms.
  make-now-playing make-map make-signoff make-structured make-sitemap make-chat make-world make-heading-ids make-search-index
  make-low-stimulation make-feed make-csp make-agent-files make-og make-icons make-security
  # The checkers, against what was just written.
  check-contrast check-headings check-counts check-ids check-classes
  check-quests check-faces check-print
  # Side by side (a + joins them): each renders every page in Chrome, only
  # reads, and keeps its own probe file and its own Chrome profile.
  check-gentle+check-contrast-live+check-focus
  check-weights check-teleport check-unlisted check-push check-props check-events check-messages check-steps check-links check-roles check-notice check-chat-status check-call-links check-notices check-search check-home
)

# The CB's one invariant, first, because it needs nothing but Node: no write
# that was told it worked is ever missing. See netlify/cb/lib.test.mjs.
if ! step "the CB under load" node --test netlify/cb/lib.test.mjs; then
  printf '\n\033[1mSTOPPED at the CB test.\033[0m A write the CB said worked can go missing.\n'
  report; exit 1
fi

# Every function loads the way Netlify loads it: node --check passes an import
# of a name its module does not export, and on 2026-10-25 that took the radio
# down on the live site. See tools/check-functions-load.mjs.
if ! step "every function loads" node tools/check-functions-load.mjs; then
  printf '\n\033[1mSTOPPED at the functions.\033[0m One would fail to load on Netlify.\n'
  report; exit 1
fi

# The fractal window's one invariant, also Node and nothing else: no room's
# picture flashes at the quickest speed, counted in what it paints. See
# tools/fractal.test.mjs.
if ! step "the fractal window never flashes" node --test tools/fractal.test.mjs; then
  printf '\n\033[1mSTOPPED at the fractal test.\033[0m A room'"'"'s fractal can flash.\n'
  report; exit 1
fi

# Every avatar choice drawn in every pose, and the page's checker and the
# server's agreeing about what a look may hold. Node and nothing else. See
# tools/avatar.test.mjs. It reads the lists make-bodymind.py writes, so it runs
# again after the generators, below, as well as here.
if ! step "every avatar choice is drawn" node --test tools/avatar.test.mjs; then
  printf '\n\033[1mSTOPPED at the avatar test.\033[0m A choice, a garment or a look cannot be drawn, or the page and the CB disagree about one.\n'
  report; exit 1
fi

for s in "${STEPS[@]}"; do
  case "$s" in
    *+*) STOPPED_AT="$s"; together $(echo "$s" | tr '+' ' '); rc=$? ;;
    *) STOPPED_AT="$s"; step "$s" python3 "tools/$s.py"; rc=$? ;;
  esac
  if [ "$rc" != 0 ]; then
    printf '\n\033[1mSTOPPED at %s.\033[0m Fix what it says, then run this again.\n' "$STOPPED_AT"
    printf 'Nothing after it has run, so nothing after it has been checked.\n'
    report; exit 1
  fi
done

# Every chimera the shelf can make, drawn, against the shelf make-chimera-obscura.py
# just wrote into chimera.js. Node and nothing else. See tools/chimera.test.mjs.
if ! step "every chimera is drawn" node --test tools/chimera.test.mjs; then
  printf '\n\033[1mSTOPPED at the chimera test.\033[0m An animal on the shelf cannot be drawn with another, or a chimera holds what it should not.\n'
  report; exit 1
fi

if ! step "every avatar choice is drawn, against the lists just written" node --test tools/avatar.test.mjs; then
  printf '\n\033[1mSTOPPED at the avatar test.\033[0m make-bodymind.py wrote a list avatar.js cannot draw.\n'
  report; exit 1
fi

printf '\n\033[1mEverything ran and nothing refused.\033[0m\n'
report
if [ -n "$(git status --porcelain)" ]; then
  printf 'These files changed; commit them with the change that caused them:\n'
  git status --short
else
  printf 'The tree is clean: every generated file already matched its sources.\n'
fi
