# Decisions — Stimpunks.Love

Settled choices and open ones, each with the reasoning, so the same question is not re-litigated in three weeks. Hand-authored. One line per paragraph.

----

## Open

**There is no feed.** `index.html` briefly linked `/feed.xml` and the link was removed rather than the file invented. A changelog site probably wants one; a hand-maintained RSS file drifts the first week nobody remembers it. If we add one it should be generated from `changelog.html` by a tool, the way the sitemap is.

**The audio room is named and empty.** Hear Queer Here promises "the glossary read aloud, in our own voices" and does not deliver it. It is listed in the changelog under *Not built yet* rather than quietly omitted, because a room that says what it is missing is more use than one that pretends. Open question: whose voices, how many terms, and whether it is worth the recording time.

**The polaroids in Enid's Room are grey rectangles.** They are placeholders for community photos uploaded with consent. Until there are photos they should stay obviously empty rather than be filled with stock images, which would be the one thing this site cannot do.

**Nobody has claimed Your Room.** The sixth storefront has terms, a route in, and no tenant. Open until somebody takes the keys — and it should stay visibly empty rather than be filled by us, because an empty room we decorate ourselves is scenery, which is the exact thing `your-room.html` says it is not.

----

## Settled

**No single design system, 2026-09-19, Ryan's call.** The brief asked for "a bold and unique design unlike our other sites", and the first answer offered was a set of themes to choose between. That was the wrong shape: picking a winner would have produced another consistently-styled site, just louder. What makes this site structurally unlike the others is that it has *no* shared look — the street is the system and the rooms contradict each other. All six ship. Recorded because the instinct to unify will return, and because it is correct everywhere else.

**Attribution stays; the rest of "careful" goes.** Ryan listed attribution among the disciplines to drop. It was kept over that objection and he agreed: the other three are aesthetic habits, and attribution is a licence. The compromise is that credits are *loud* rather than hidden — margin scrawls, a liner-notes page — so keeping them costs the site nothing in attitude. A direct consequence: Pink Pony Club reproduces no Chappell Roan lyric. The room is the vibe, and the song keeps its own words.

**Contrast is not negotiable; palette discipline is.** These were conflated in the brief and they are separable. Clashing colours are the point; illegible ones are an accident. `tools/check-contrast.py` enforces WCAG 1.4.3 across 65 pairs and caught two real failures on its first run, both of which would have shipped.

**The dial defaults from the device and can be turned UP.** The alternative — capping intensity at whatever `prefers-reduced-motion` asks for — treats a media query as more authoritative than the person using the browser. It is not. The OS setting is the *starting* position; an explicit choice always wins, in both directions. This is the design's central argument and the reason accessibility here is a feature rather than a tax.

**Gentle hides nothing.** No content sits behind an intensity level. A reduced mode that drops material is a worse site wearing a politer name, and on a site by Disabled people for Disabled people it would be the ordinary insult rendered in CSS.

**No autoplay, enforced rather than promised.** Every embed is a press-to-play facade that makes no request until pressed. The Playhouse's noises are synthesised through Web Audio, which cannot start without a user gesture — the platform enforces the consent model rather than us intending it. Verified in a browser on 2026-09-19: zero iframes and zero YouTube requests on load.

**Twelve typefaces, self-hosted.** 322 KB across 16 woff2 files, all OFL, all under `fonts/` with their origins recorded in `fonts/_sources.json`. Reading a page here makes no third-party request, which is the same rule queering.earth and starstuff.earth follow. `@font-face` is lazy, so a room downloads only the faces it sets.

**Hand-authored HTML, four generators.** The pages are the artifact and are committed as written; only the jukebox list, its credits table, the sitemap/llms.txt pair and the CSP hash are generated. This follows queering.earth's split — hand-write the pages, generate the derived things — and avoids the failure where somebody hand-edits an HTML file that a build step then overwrites.

**Both jukebox surfaces read one file.** `data/jukebox.json` feeds the dancefloor and the credits page through two tools, so they cannot disagree about who made what. A credits page that contradicts the room it credits is worse than no credits page.

**The domain went live 2026-09-19, and the netlify.app rule came on the same day.** stimpunks.love resolves on Netlify DNS with www and http both 301ing to the apex. The two lines in `_redirects` that send `stimpunks-love.netlify.app` to the custom domain were uncommented only after checking that the apex answered 200 — before that they would have pointed the one working hostname at one that did not exist. The site is deployed from GitHub on a read-only Netlify deploy key plus a push webhook, the same wiring as every sibling; neither is created by `createSiteInTeam`, so both had to be added by hand and the first push after launch silently did not deploy until the webhook existed.

**The changelog is a page, not a file.** Ryan's rule, 2026-09-15: all of our sites publish a changelog. This one is `changelog.html` and it lists what is *not* built alongside what is.
