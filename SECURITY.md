# Security Policy

## How to report

**Use GitHub's private vulnerability reporting:**
[**Open a draft advisory**](https://github.com/Stimpunks/Stimpunks-Love/security/advisories/new).

That channel is private until we publish it, which is what you want and what an
issue on this repository is not — issues here are world-readable the moment you
open one. If you would rather not use GitHub at all, reach us through
[stimpunks.org](https://stimpunks.org/contact/) and say only that you have a
security report; we will find a private route back to you before you send details.

This policy is also published as
[`/.well-known/security.txt`](https://stimpunks.love/.well-known/security.txt),
per RFC 9116.

## What this thing actually is, so you don't waste your time

**[stimpunks.love](https://stimpunks.love/) is a static site.** There is no
application server, no database, no accounts, no login, no session and no
server-side code of ours anywhere. It is a directory of HTML files, a stylesheet
and a handful of scripts, served by Netlify. The tools in `tools/` are local
scripts that write those files; nothing in them runs on a server.

That shape rules out most of what a report usually concerns:

- **No authentication, so no auth bypass.** There is nothing to log in to.
- **No form submits anywhere.** The Content-Security-Policy sets
  `form-action 'none'`. The Zibaldone's attribution slip composes a block of text
  onto your own clipboard, and the Adventurer's Guild's hand-in box checks a code
  in the page; neither sends anything.
- **No cookies.** Two keys in `localStorage`, both yours and both on your device
  only: `love-intensity`, the setting you chose on the loudness dial, and
  `love-quests`, the list of jobs you handed in at the Guild, which has a button
  that forgets it.
- **Nothing third-party loads until you press it.** `connect-src` is `'none'`,
  every script and typeface is self-hosted, and the only other origins the
  policy names are in `frame-src`, for players that are built only after a
  press: `youtube-nocookie.com`, `open.spotify.com`, `videopress.com` and
  `embed.music.apple.com`.
- **No secrets in the repository**, because there is nowhere to put one.

**What is in scope, and is worth telling us about:**

- **Anything that makes a page contact a third party before somebody presses
  play.** "Nothing plays until you press play" is printed on the site, so a
  request that leaves on load is a false statement on a published page as well
  as a privacy leak, and it is the report we most want.
- Anything that lets a third party change what a reader sees — a header
  misconfiguration in [`_headers`](_headers), a way around `frame-ancestors`
  (it is `'self'`, deliberately, and nothing wider), or a redirect in
  [`_redirects`](_redirects) that can be made to send readers somewhere we did
  not intend.
- **Script running that should not.** `script-src` is `'self'` plus one sha256
  hash, for the snippet every page runs before first paint. If any other inline
  script executes, tell us.
- Cross-site scripting through content: the pages are generated from JSON files
  in `data/`, and a value that breaks out of its template matters.
- A supply-chain problem in a file we serve — the typefaces in
  [`fonts/`](fonts/), the audio in `audio/`, the images.

**Out of scope:** missing headers with no demonstrated impact on a static site,
scanner output with no working proof, and anything about Netlify's, GitHub's or
an embedded player's own infrastructure — report those to them.

**In scope and already known:** `style-src` permits inline CSS. That is
deliberate and documented in [`_headers`](_headers): the rooms carry hundreds of
inline `style` attributes, and CSP hashes do not cover attributes. A *working*
demonstration of harm through it is worth sending; a scanner line reporting that
`unsafe-inline` is present is not news.

## What you can expect from us

**We are a small nonprofit and we are honest about our capacity.** Stimpunks'
own contact page says we cannot usually move at the speed of emergencies, and
that we sometimes take a week or two off for self-care. So:

- We will acknowledge a report when we see it. If a week passes with no reply,
  send it again — that is us missing it, not ignoring you.
- We will tell you what we found and what we changed.
- **We will publish the fix, and credit you if you want credit**, in
  [the changelog](https://stimpunks.love/changelog.html), which is where this
  site publishes its own mistakes by date.
- There is no money. We have no bug bounty and we are not going to pretend
  otherwise.

## Please don't

Run scans that degrade the site for readers, or test anything against
`stimpunks.org` or our other sites — those are different systems on different
hosts, and this policy does not cover them.
