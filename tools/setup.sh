#!/usr/bin/env bash
# Check that this computer has what the street's tools need, and install the
# one library the CB needs. Run it from anywhere in your copy of the repository:
#
#     tools/setup.sh
#
# WHO IT IS FOR. Anybody who wants to build on the street, from The Sandbox's
# steps or CONTRIBUTING.md, which both say to run this first. Ryan's brief,
# 2026-10-13: the page should bootstrap contributors into cloning the
# repository, hooking up Claude and installing the tools' dependencies.
#
# WHAT IT DOES AND DOES NOT DO. It looks for each thing, says in plain words what
# is there and what is missing, and how to get what is missing on this kind of
# computer. THE ONLY THING IT INSTALLS is the CB's one library, with npm, into
# node_modules/ in this folder, and then it runs the CB's own tests to show the
# install worked. It never installs anything else, never uses sudo and never asks
# for a password: what goes on somebody's computer is theirs to decide, and the
# line it prints is all they need to do it.
#
# THE LIST IS CLAUDE.md's "What a machine needs", as something run rather than
# read. Chrome is looked for where every tool here looks for it, in the same
# order, so "found" here means found by them. Node is held to 22 because that is
# what the street is built on and what The Sandbox's steps say; Python to 3.9,
# because every tool runs on the 3.9 a Mac ships with.
set -uo pipefail
cd "$(dirname "$0")/.."

os=$(uname -s)
need=0
bold=$'\033[1m'; plain=$'\033[0m'
yes() { printf '  %s✓%s %s\n' "$bold" "$plain" "$1"; }
no()  { printf '  %s✗%s %s\n      %s\n' "$bold" "$plain" "$1" "$2"; need=1; }
may() { printf '  %s–%s %s\n      %s\n' "$bold" "$plain" "$1" "$2"; }

# How to get a thing on this computer: Homebrew on a Mac that has it, apt on
# Debian and Ubuntu (which is what WSL usually is), and the maker's page
# otherwise, so the line printed is always one that works here.
get() {
  local brew="$1" apt="$2" page="$3"
  if [ "$os" = "Darwin" ] && [ -n "$brew" ] && { [ "${brew%% *}" != "brew" ] || command -v brew >/dev/null 2>&1; }; then
    echo "Get it with: $brew"
  elif [ "$os" = "Linux" ] && [ -n "$apt" ] && command -v apt-get >/dev/null 2>&1; then echo "Get it with: $apt"
  else echo "Get it from $page"; fi
}

printf '\n%sWhat the street'"'"'s tools need%s\n' "$bold" "$plain"

if command -v git >/dev/null 2>&1; then yes "Git ($(git --version | awk '{print $3}'))"
else no "Git" "$(get 'xcode-select --install' 'sudo apt install git' 'https://git-scm.com/downloads')"; fi

if command -v python3 >/dev/null 2>&1 && python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 9) else 1)'; then
  yes "Python $(python3 -c 'import platform; print(platform.python_version())')"
else
  no "Python 3.9 or newer" "$(get 'brew install python' 'sudo apt install python3' 'https://www.python.org/downloads/')"
fi

node_ok=0
if command -v node >/dev/null 2>&1; then
  major=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)
  if [ "$major" -ge 22 ] 2>/dev/null; then yes "Node.js $(node --version)"; node_ok=1
  else no "Node.js 22 or newer (this computer has $(node --version))" "$(get 'brew install node' '' 'https://nodejs.org/en/download')"; fi
else
  no "Node.js 22 or newer" "$(get 'brew install node' '' 'https://nodejs.org/en/download')"
fi
if [ "$node_ok" = 1 ] && ! command -v npm >/dev/null 2>&1; then
  no "npm, which comes with Node.js" "Install Node.js again from https://nodejs.org/en/download"; node_ok=0
fi

# Exactly where the tools look, in their order (tools/check-contrast-live.py's
# CANDIDATES, and the same in every tool that renders a page).
chrome=""
for c in "${CHECK_CONTRAST_BROWSER:-}" "${CHECK_GENTLE_BROWSER:-}" "${CHECK_PRINT_BROWSER:-}" \
         "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
         "/Applications/Chromium.app/Contents/MacOS/Chromium" \
         "$(command -v google-chrome-stable 2>/dev/null)" "$(command -v chromium 2>/dev/null)" \
         "$(command -v chrome 2>/dev/null)"; do
  if [ -n "$c" ] && [ -e "$c" ]; then chrome="$c"; break; fi
done
if [ -n "$chrome" ]; then
  yes "Chrome, at $chrome"
else
  other=""
  for c in google-chrome chromium-browser; do
    if command -v "$c" >/dev/null 2>&1; then other=$(command -v "$c"); break; fi
  done
  if [ -n "$other" ]; then
    v="CHECK_CONTRAST_BROWSER CHECK_GENTLE_BROWSER CHECK_PRINT_BROWSER CHECK_FOCUS_BROWSER CHECK_WEIGHTS_BROWSER MAKE_OG_BROWSER"
    line=""; for n in $v; do line="$line$n=\"$other\" "; done
    no "Chrome, where the tools look for it" "There is one at $other. Point every tool at it: export ${line% }"
  else
    no "Google Chrome or Chromium" "$(get 'brew install --cask google-chrome' 'sudo apt install chromium' 'https://www.google.com/chrome/')"
  fi
fi

printf '\n%sOnly for particular jobs%s\n' "$bold" "$plain"
if command -v gh >/dev/null 2>&1; then yes "GitHub's gh, for making your copy and sending a change back"
else may "GitHub's gh, for making your copy and sending a change back. The GitHub website does both too." "$(get 'brew install gh' 'sudo apt install gh' 'https://cli.github.com/')"; fi
if command -v claude >/dev/null 2>&1; then yes "Claude Code"
else may "Claude Code" "Get it with: curl -fsSL https://claude.ai/install.sh | bash  (other ways: https://code.claude.com/docs/en/setup)"; fi
if command -v cwebp >/dev/null 2>&1; then yes "cwebp, for a new photograph"
else may "cwebp, needed only when a new photograph arrives" "$(get 'brew install webp' 'sudo apt install webp' 'https://developers.google.com/speed/webp/download')"; fi
if command -v ffmpeg >/dev/null 2>&1 && command -v ffprobe >/dev/null 2>&1; then yes "ffmpeg and ffprobe, for a new recording"
else may "ffmpeg and ffprobe, needed only when a new recording arrives" "$(get 'brew install ffmpeg' 'sudo apt install ffmpeg' 'https://ffmpeg.org/download.html')"; fi
if command -v python3 >/dev/null 2>&1 && python3 -c 'import PIL' >/dev/null 2>&1; then yes "Pillow, for the Collection Collection"
else may "Pillow, needed only for the Collection Collection's photographs" "Get it with: python3 -m pip install --user Pillow"; fi

printf '\n%sThe CB'"'"'s one library%s\n' "$bold" "$plain"
if [ "$node_ok" = 1 ]; then
  if npm ci --no-audit --no-fund --no-update-notifier --loglevel=error >/dev/null 2>&1; then
    yes "installed into node_modules/ with npm"
    if node --test netlify/cb/lib.test.mjs >/dev/null 2>&1; then yes "the CB's own tests pass on this computer"
    else no "the CB's own tests" "Run node --test netlify/cb/lib.test.mjs to see what failed."; fi
  else
    no "the CB's library" "npm ci did not work. Run it yourself to see why: npm ci"
  fi
else
  may "not installed yet" "It needs Node.js first. Run this again once Node.js is here."
fi

echo
if [ "$need" = 0 ]; then
  printf '%sReady.%s Start Claude here with: claude\n' "$bold" "$plain"
  printf 'See the street with: npx -y serve . -l 8919   and check everything with: tools/check-all.sh\n'
else
  printf '%sSomething above is missing.%s Get it, then run tools/setup.sh again.\n' "$bold" "$plain"
fi
exit "$need"
