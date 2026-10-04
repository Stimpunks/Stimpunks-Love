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
radio, and it is the only server-side code of ours. It is a set of Netlify
Functions in [`netlify/functions/`](netlify/functions/), every one sharing
[`netlify/cb/lib.mjs`](netlify/cb/lib.mjs), and they keep their state as JSON in
one Netlify Blobs store. There is no database. What the store holds, and for how
long, is on [the privacy page](https://stimpunks.world/privacy.html): the latest
ten messages on each channel (the World channel, and one per room), deleted at
midnight Colorado time; pictures sent on a channel, deleted with their message;
the chalkboard and the pebble bowls, a week; the Brass Tacks Board, until a
moderator takes a post down; a few shared games that keep a count or finished
sentences with no names in them; and the pets somebody adopted, filed under a
hash of their handle. An hourly scheduled function sweeps whatever has expired.

Signing on takes a handle and a password we share with the community and
rotate; it hands back a pass, an HMAC keyed by the current password, which the
browser keeps in `localStorage` and sends as an `Authorization` header.
Changing the password invalidates every pass at once. A handle can also be
**claimed** with a password of its own, and then the shared password is refused
for it. Moderators sign on as the base station with a second password, or with
a claimed username of their own, and their roles come from a list in Netlify's
environment that is read on every request. A room's voice and video call is
8x8's Jitsi as a Service, reached only with a token the CB signs.

What that shape rules out, and what it does not:

- **Accounts are optional and hold almost nothing.** An unclaimed handle is not
  checked: impersonating one is expected, and the CB says so on the privacy page
  and at the front desk where people sign on. A claimed username is an account,
  and all it is is the name, a scrypt hash of its password and of a recovery
  code shown once, a version, and a lock that holds for fifteen minutes after
  five wrong passwords. There is no email, and no list of accounts for anybody,
  moderators included. **Signing on as a claimed username without its password
  or recovery code, getting a message marked BASE or CLAIMED that should not be,
  or reaching a Town Hall room your roles do not open, is worth a report.**
- **No form submits anywhere.** The Content-Security-Policy sets
  `form-action 'none'`. The CB's boxes send with `fetch`, to this site only. The
  Zibaldone's attribution slip composes a block of text onto your own clipboard,
  and the Adventurer's Guild's hand-in box checks a code in the page; neither
  sends anything.
- **No cookies.** The pass travels in a header, never a cookie, so no other
  site can make a browser send it. What `localStorage` holds is listed on
  [the privacy page](https://stimpunks.world/privacy.html): the dial's setting,
  the jobs handed in at the Guild, the animals you rescued, Stay Breezy's usual
  fans, whether the guest radio's panel was left open, and, once you have signed
  on, the CB's handle, pass and where you put the radio.
- **Nothing third-party loads until you press it.** `connect-src` is `'self'`:
  the CB's radio fetches from this site's own `/cb/` endpoints and nothing on
  any page can fetch from anywhere else. Every script and typeface is
  self-hosted, and the only other origins the policy names are for players
  that are built only after a press: in `frame-src`, `youtube-nocookie.com`,
  `open.spotify.com`, `videopress.com`, `embed.music.apple.com`, and `8x8.vc` for
  a room's call; in `media-src`, one band's own upload folder, for The Small
  Hours' jukebox. `blob:` is in `img-src` and `frame-src` and admits no origin:
  it is how the CB shows a picture it fetched with the pass, and how a call's
  shared file is saved. **The call is the only thing given the camera, the
  microphone or a shared screen**: `Permissions-Policy` delegates the three to
  `8x8.vc` and to nothing else, this site included, and `tools/make-csp.py`
  refuses the header otherwise. A call needs a token our `/cb/call` signs for one
  signed-on handle and one room, or a guest token, never a moderator's, for one
  of the rooms whose calls are public.
- **No secrets in the repository.** Everything the CB needs lives in Netlify's
  environment, never in this repo: the two passwords (`CB_PASSWORD`,
  `CB_MOD_PASSWORD`), the list of who holds which role (`CB_MODS`), the JaaS
  signing key (`CB_JAAS_KID`, `CB_JAAS_KEY`) and the secrets that check 8x8's
  webhooks (`CB_JAAS_EVENTS_SECRET`, `CB_JAAS_HOOK_SECRET`). Getting a call token
  without a pass, for a room it was not asked for, or with moderator rights
  without them, is worth a report.

**What is in scope, and is worth telling us about:**

- **Anything in the CB.** Reading or writing a channel without a valid pass,
  forging a pass or the BASE or CLAIMED mark, reading a Town Hall room's channel,
  call or host beacon without the role it takes, reading what anybody said after
  midnight (Colorado time), resetting or deleting a username without being a
  moderator, fetching a channel's picture without a pass or finding one that
  still carries its location, getting 8x8's webhooks to accept a request without
  a good signature, getting a stranger's words onto a page (or into
  `/brass-tacks.xml`) as markup rather than text, or finding an IP address,
  handle or message anywhere the privacy page says there is none. Password
  guessing is rate-limited by Netlify per address, and a claimed username locks
  after five wrong tries; a way round either is in scope, and a report that a
  password can be guessed slowly is not.
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
