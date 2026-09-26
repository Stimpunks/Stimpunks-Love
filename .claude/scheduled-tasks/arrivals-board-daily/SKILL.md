---
name: arrivals-board-daily
description: Daily re-set of The Feed's arrivals board and The Doom Scoop's cabinet on stimpunks.world — re-reads the feeds, redraws both rooms, commits each room's own paths and pushes
---

Re-set the arrivals board in The Feed on stimpunks.world, so the room is this morning's rather than last week's.

Project root: /Users/ryan/Documents/GitHub/Stimpunks-Love (the repository kept the Stimpunks-Love name when the site moved to stimpunks.world on 2026-09-23; the path is correct)

RUN EXACTLY THESE TWO, in this order, and nothing else:

    bash /Users/ryan/Documents/GitHub/Stimpunks-Love/tools/daily-arrivals.sh
    bash /Users/ryan/Documents/GitHub/Stimpunks-Love/tools/daily-scoop.sh

Run the second whatever the first returned. They are separate scripts on purpose: a sibling site's feed failing must not leave The Doom Scoop unfilled, and a news channel failing must not leave The Feed's board unset. Everything below about daily-arrivals.sh is true of daily-scoop.sh as well, with its own paths (data/doom-scoop.json, the-doom-scoop.html and now-playing.html), its own fixed commit subject ("daily doom scoop edition") and its own refusals: it reads YouTube's own feeds for the sources Ryan chose and each new video's watch page, and takes a few minutes. Do not hand-edit data/doom-scoop.json, drop a source that failed, or add one.

It takes under a minute. Do not run the steps by hand, do not run `pull-arrivals.py` or `make-arrivals.py` yourself, and do not commit or push anything yourself — the script exists because the order matters, because each stage gates the next, and because it commits exactly two paths and a headless run that improvises will one day commit something nobody read.

WHAT THE SCRIPT DOES: refuses unless the tree is on main and the board's own two files are clean; reads every sibling site's RSS feed into data/arrivals.json; redraws the-feed.html from it; runs the five fast offline checkers as a gate; then commits ONLY data/arrivals.json and the-feed.html and pushes. Netlify deploys from the push.

WHY THIS TASK EXISTS AT ALL. That room cannot read those feeds from the page — not one of those hosts sends an Access-Control-Allow-Origin header, and the ways round it are a proxy we do not run and a third-party reader we would be handing visitors to without asking. So the board is a snapshot set by a machine somebody switched on, and it says on its own face the minute it was set. The older that minute gets, the more the page is a museum of a feed. This timer is what keeps the sentence honest. It is not what makes it true — the room is honest either way, because it says when it was set.

EXIT CODES, and what each means for your report:
  0  committed and pushed, OR a clean no-op because every wire read the same rows it already had. Both are success. Report which.
  2  a guard refused and NOTHING was committed. Report the refusal verbatim and STOP.
  1  an error. Report verbatim and stop.

ON A REFUSAL (exit 2), DO NOT ROUTE AROUND IT. A refusal is the system working:
  - If a feed did not answer, or answered with something the puller does not parse, yesterday's board is still standing and that is the correct outcome. Do not hand-edit data/arrivals.json, do not drop the wire that failed, and do not teach the tool a new feed format on a timer — a sibling changing format is news for a person, and the refusal is how the news arrives.
  - If the board's own files were already modified, a session is mid-edit on them. Leave them alone.
  - If a checker failed after the board was drawn, the working tree has an unpublished board in it. Say so and stop; do not commit it and do not revert it.
  - Never force-push, never rebase, never `git pull` to clear a rejected push. If the push failed, the script has already said so — the commit is saved locally, the live board is still yesterday's, and a session will sort it out. A timer resolving conflicts unattended is a timer nobody is watching.

DO NOT DO ANYTHING ELSE. In particular: no changelog entry — changelog.html records what changed about the site, and a timer having fired is not that; no feed.xml, no sitemap.xml, no share cards; and none of the four checkers that need a browser. Nothing about re-reading a feed can move a colour, a tilt or a card, and a twenty-minute Chrome run every morning is a task somebody turns off.

ONE KNOWN INTERACTION, now handled. The Knowledge System's update-logs-daily reads this repository's commits every morning and writes Ryan's weekly changelog out of them. This task's commit subject is the fixed string "daily arrivals board reset" — machinery, not work — and since 2026-09-24 that tool's AUTOMATED skip list covers sibling repos and names this exact subject, so a board reset never reaches the changelog. That makes the subject load-bearing: it is set in tools/daily-arrivals.sh, and it must not change unless the skip list changes with it. Do not edit either.

THIS PROMPT IS TRACKED in the Stimpunks-Love repository at .claude/scheduled-tasks/arrivals-board-daily/SKILL.md, and the repo copy is the source of truth; tools/install-scheduled-task.sh installs it here and reports drift. Do not edit this installed copy to change the task.

REPORT, in two or three plain sentences for each script:
  - Committed and pushed, a clean no-op, or refused — and if refused, the refusal verbatim.
  - The wire and row counts and the minute the board was set, from the script's own output.
  - Anything the script flagged: a failed push, or paths left dirty outside its scope.
Do not paste the whole output.