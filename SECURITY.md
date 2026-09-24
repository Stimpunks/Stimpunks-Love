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
[`/.well-known/security.txt`](https://stimpunks.world/.well-known/security.txt),
per RFC 9116.

## What this thing actually is, so you don't waste your time

**[stimpunks.world](https://stimpunks.world/) is a static site with one small
exception, the CB.** Every page is a file Netlify serves as-is: a directory of
HTML files, a stylesheet and a handful of scripts. The tools in `tools/` are
local scripts that write those files; nothing in them runs on a server.

**The exception is the CB**, a chat channel patterned after citizens band
radio, and it is the only server-side code of ours. It is five small Netlify
Functions in [`netlify/functions/`](netlify/functions/) sharing
[`netlify/cb/lib.mjs`](netlify/cb/lib.mjs), storing one JSON blob in Netlify
Blobs: the latest ten messages on the channel, deleted every day at midnight
Colorado time. There are no accounts and no database. Signing on takes a handle
and a password we share with the community and rotate; it hands back a pass,
an HMAC of the handle keyed by the current password, which the browser keeps in
`localStorage` and sends as an `Authorization` header. Changing the password
invalidates every pass at once. A second password makes you the base station,
which can take a message off the channel.

What that shape rules out, and what it does not:

- **No accounts, so no account takeover.** There is nothing registered. A
  shared password is not an identity, and handles are not checked; the CB says
  so on the privacy page and on the counter where people sign on. Impersonating
  a handle is expected. **Getting a message marked BASE without the
  moderators' password is not**, and that is worth a report.
- **No form submits anywhere.** The Content-Security-Policy sets
  `form-action 'none'`. The CB's boxes send with `fetch`, to this site only. The
  Zibaldone's attribution slip composes a block of text onto your own clipboard,
  and the Adventurer's Guild's hand-in box checks a code in the page; neither
  sends anything.
- **No cookies.** The pass travels in a header, never a cookie, so no other
  site can make a browser send it. What `localStorage` holds is listed on
  [the privacy page](https://stimpunks.world/privacy.html): the dial's setting,
  the jobs handed in at the Guild, and, once you have signed on, the CB's
  handle, pass and where you put the radio.
- **Nothing third-party loads until you press it.** `connect-src` is `'self'`:
  the CB's radio fetches from this site's own `/cb/` endpoints and nothing on
  any page can fetch from anywhere else. Every script and typeface is
  self-hosted, and the only other origins the policy names are in `frame-src`,
  for players that are built only after a press: `youtube-nocookie.com`,
  `open.spotify.com`, `videopress.com` and `embed.music.apple.com`.
- **No secrets in the repository.** The CB's two passwords live in Netlify's
  environment as `CB_PASSWORD` and `CB_MOD_PASSWORD`, and never in this repo.

**What is in scope, and is worth telling us about:**

- **Anything in the CB.** Reading or writing the channel without a valid pass,
  forging a pass or the BASE mark, reading what anybody said after midnight
  (Colorado time), getting a stranger's words onto a page as markup rather than
  text, or finding an IP address, handle or message anywhere the privacy page
  says there is none. Password guessing is rate-limited by Netlify per address;
  a way round that limit is in scope, and a report that the password can be
  guessed slowly is not.
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

**Out of scope:** missing headers with no demonstrated impact on the static pages,
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
  [the changelog](https://stimpunks.world/changelog.html), which is where this
  site publishes its own mistakes by date.
- There is no money. We have no bug bounty and we are not going to pretend
  otherwise.

## Please don't

Run scans that degrade the site for readers, or test anything against
`stimpunks.org` or our other sites — those are different systems on different
hosts, and this policy does not cover them.
