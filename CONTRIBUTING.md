<!-- Written by tools/make-sandbox.py from data/sandbox.json, the same steps The Sandbox
     shows at https://stimpunks.world/sandbox.html#sbs-dig. Edit the data file and run the tool, never this. -->

# Build the street with us

**Every room on this street is a file in one public repository**, and so is every tool that builds and checks them. If you would rather fix a thing than describe it, you can. **Your own copy is a sandbox too**: nothing you break there reaches the street until Ryan Boren or Helen Edgar merge it.

Most of the street is built with Claude, Anthropic’s AI, and it can help you too. It reads the street’s rules, in [CLAUDE.md](CLAUDE.md), before it changes anything. You do not need to be a programmer. You do need some spoons, a GitHub account, and a computer you can install things on. Take the steps at whatever pace suits you; nobody is waiting.

The same steps are on the street, in [The Sandbox](https://stimpunks.world/sandbox.html#sbs-dig), beside its [suggestion box](https://stimpunks.world/sandbox.html#suggestion-box): anybody signed on to the CB can drop a suggestion, a feature request or a bug report in it, and our moderators answer.

## 1. What you need

A Mac, a Linux computer, or Windows with [WSL](https://learn.microsoft.com/windows/wsl/install): the street’s tools are Bash and Python scripts, so on Windows we run them inside Linux. A [GitHub account](https://github.com/signup). And these, which the setup script in a moment checks for you:

- Git, and Python 3.
- Node.js 22 or newer.
- Google Chrome or Chromium. Every check looks at the pages through it, the way a visitor’s browser does.
- GitHub’s own [gh](https://cli.github.com/), for making your copy and sending a change back. The GitHub website does both too.

Only for particular jobs, and the script says when: `cwebp` and `ffmpeg` for new photographs and recordings, and Pillow for the Collection Collection.

## 2. Make your own copy

Your copy is called a fork. With gh, these make it and put it on your computer, with the street’s own copy named `upstream` so you can keep up with it:

```bash
gh auth login
gh repo fork Stimpunks/Stimpunks-Love --clone
cd Stimpunks-Love
```

Without gh: press **Fork** on [the repository](https://github.com/Stimpunks/Stimpunks-Love), then `git clone` your fork’s address and `cd` into it.

## 3. Check your computer

```bash
tools/setup.sh
```

It checks for everything above, installs the one library the CB needs with npm, and says in plain words what is missing and how to get it. It installs nothing else and never asks for your password. Run it again whenever you like.

## 4. Hook up Claude

Claude Code is Claude working in a folder of code: it reads the files, runs the tools and makes changes, and asks before anything it is not sure of. It needs a Claude Pro, Max, Team or Enterprise plan, or an Anthropic Console account; the free plan does not include it. Install it, then start it in your copy:

```bash
curl -fsSL https://claude.ai/install.sh | bash
claude
```

Other ways to install it, Windows included, are in [Anthropic’s setup guide](https://code.claude.com/docs/en/setup). Or use the **Code** tab of [the Claude desktop app](https://code.claude.com/docs/en/desktop-quickstart) and choose your copy’s folder: it shows you the street as you change it. Either way, Claude reads [CLAUDE.md](CLAUDE.md) first: the street’s rules, and how a change from your own copy comes in.

## 5. See the street on your own computer

```bash
npx -y serve . -l 8919
```

Then open `http://localhost:8919` in your browser. There is no build step: every page is a file, served as it is.

**The CB does not run there**, so the radio says it has no signal and the suggestion box says it cannot be read. To try the CB too, see [Running the CB yourself](CONTRIBUTING.md#running-the-cb-yourself).

## 6. Make your change, on a branch of its own

```bash
git switch -c a-short-name-for-your-change
```

Then ask Claude for what you want, in your own words. Small is good. **Every room is its own world, on purpose**, and a change that makes two rooms look more alike is probably the wrong change: CLAUDE.md says why, at length. Some things are somebody’s to decide, like Helen’s Faery Yurt or Norah’s sand here. If Claude says a change is somebody else’s call, ask in your pull request rather than making it.

## 7. Check everything

```bash
tools/check-all.sh
```

It runs every generator and every checker in the one order that works, and stops at the first refusal. It looks at every page at every setting of the dial, so it takes a while. **When a tool refuses, fix what it says; never loosen the tool.** Files it changes are generated files catching up with your change, and they go in with it.

Then add a line at the top of [changelog.html](changelog.html) saying what you changed, with your name on it if you want it there.

## 8. Send it back

Look at what you are sending first, then send it:

```bash
git status
git add -A
git commit -m "What you changed, in a sentence"
git push -u origin HEAD
gh pr create --repo Stimpunks/Stimpunks-Love
```

That opens a pull request: your change, with a note saying what it is and why. Ryan Boren or Helen Edgar reads it, and may ask a question or ask for something to change. **Merging publishes it**: stimpunks.world is rebuilt from the repository within a minute or two.

**What you send is under the street’s licence**, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), like everything here. Photographs and recordings of anybody’s voice are not, and need that person’s own yes on record first, so talk to us before sending one. A security problem goes privately: see [SECURITY.md](SECURITY.md).

## 9. Keep up with the street

The street changes by itself every morning, when the Feed and the racks refill, so a copy a few days old is behind. This catches yours up:

```bash
git fetch upstream
git merge upstream/main
tools/check-all.sh
```

**If the merge says a generated file conflicts**, like `feed.xml`, `sitemap.xml`, `llms.txt`, a share card in `og/`, or anything between `:begin` and `:end` markers, do not fix it by hand. Take either side, finish the merge, and run `tools/check-all.sh`, which writes it again from its sources.

## Running the CB yourself

The CB is the street’s only server-side code: Netlify Functions in `netlify/functions/`, all sharing `netlify/cb/lib.mjs`. They run on your computer under Netlify’s own tool, with passwords you make up, which work nowhere else. Put them in a file called `.env` at the top of your copy, which git ignores:

```
CB_PASSWORD=a-community-password-you-made-up
CB_MOD_PASSWORD=a-moderator-password-you-made-up
CB_MODS='{"YourHandle":[]}'
```

```bash
npx -y netlify-cli dev --offline --port 8888
```

Then open `http://localhost:8888`. `--offline` keeps Netlify’s tool to your own computer, and in the Claude desktop app the same server is `cb-local` in `.claude/launch.json`. Sign on at the Community Center with any handle and the first password, or as YourHandle with the second, to be a moderator. Everything the CB keeps is kept in `.netlify/` on your computer, and nothing reaches the street’s own CB. Calls need keys from 8x8, so the radio shows no call button, and that is fine.

The board in the suggestion box and these steps are the street’s, written by Stimpunks with Claude and filled in by `tools/make-sandbox.py`. Everything else in this room is Norah’s.
