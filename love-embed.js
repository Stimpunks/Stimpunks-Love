/* =============================================================================
   The press-to-play facade.

   A <button class="facade"> carrying data-embed-id and data-embed-title is a
   plain button until somebody presses it. NOTHING reaches youtube before that
   press — no iframe, no cookie, no request, no pixel. On press the button is
   replaced by a youtube-nocookie iframe with autoplay, because at that point
   autoplay is the thing the visitor just asked for.

   This is the mechanism behind the room rule "nothing plays until you press
   play". Without it that line is an intention; with it, it is a property of
   the page that can be checked in a network panel.
   ============================================================================= */
(function () {
  'use strict';

  /* THE ONLY PLACE ON THIS SITE THAT BUILDS AN EMBED, and it is exposed rather
     than private for exactly that reason. Three things call it now: the
     press-to-play plate, the Hermitage's television, which retunes between
     channels, and Club Chronic's stage, which frames a playlist rather than a
     video. Those are three mechanisms and they must not become three
     CONTRACTS — two copies of these attributes is one copy that gets a
     referrerpolicy fixed and one that does not, silently, in the
     security-relevant half of this file.

     Both forms return null rather than throwing: a caller handing over rubbish
     gets nothing, which is the same quiet refusal the click handler has always
     given, and is why make-chappell.py, make-hermitage.py and make-club.py all
     refuse a bad id at BUILD time instead of relying on this. A quiet refusal
     at runtime is a button somebody presses and presses. */
  /* THE ORIGINS THIS SITE WILL BUILD A FRAME FOR, and the reason there is a
     list at all. Club Chronic needs to embed a PLAYLIST rather than a video,
     which means a caller handing over a whole URL instead of an eleven-
     character id — and a builder that accepts any URL is a hole, because the
     one thing the id check has always really been doing is refusing to point
     this site's frames at somewhere nobody chose. So the URL form is allowed
     and it is checked against this. Adding an origin here is a decision that
     also has to be made in the Content-Security-Policy; if only one of the two
     is edited the frame is refused by the browser and shows a blank box. */
  var ORIGINS = [
    'https://www.youtube-nocookie.com/',
    'https://open.spotify.com/',
    /* Swaying Sweetgrass's ten seconds of grass: Ryan's own video, already
       published by us on stimpunks.org's Nature entry, framed from where it
       already lives rather than copied onto this site. Third origin, third
       place it is written down -- see _headers and make-sweetgrass.py. */
    'https://videopress.com/'
  ];

  function frameUrl(src, title) {
    if (!src || !ORIGINS.some(function (o) { return src.indexOf(o) === 0; })) return null;
    var el = document.createElement('iframe');
    el.src = src;
    el.title = title || 'Embedded player';
    el.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
    el.setAttribute('allowfullscreen', '');
    el.setAttribute('loading', 'lazy');
    el.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    return el;
  }

  function frame(id, title) {
    if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    var el = frameUrl('https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0', title);
    if (!el) return null;
    el.title = title || 'Embedded video';
    return el;
  }

  window.loveEmbed = { frame: frame, frameUrl: frameUrl };

  function swap(btn) {
    /* Named player, not `frame`: `var frame` here would be hoisted over the
       builder above it and the call on the line before would hit undefined. */
    var player = btn.dataset.embedSrc
      ? frameUrl(btn.dataset.embedSrc, btn.dataset.embedTitle)
      : frame(btn.dataset.embedId, btn.dataset.embedTitle);
    if (!player) return;

    var shell = document.createElement('div');
    shell.className = 'facade';
    shell.style.padding = '0';
    shell.appendChild(player);
    btn.replaceWith(shell);
    player.focus();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.facade');
    if (btn && btn.tagName === 'BUTTON') swap(btn);
  });
})();
