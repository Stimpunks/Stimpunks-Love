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
     THIS ARRAY IS THE SINGLE SOURCE OF TRUTH FOR WHICH ORIGINS THIS SITE WILL
     FRAME. make-csp.py reads it to build frame-src in _headers, and
     make-sweetgrass.py reads it to refuse a bad URL at build time; neither
     keeps a copy. Adding a service is one edit here and a re-run of
     make-csp.py -- and do not hand-edit the header, because that line is
     generated and a hand edit to it is put back on the next run, silently,
     which is exactly how videopress shipped working locally and refused
     live. */
  var ORIGINS = [
    'https://www.youtube-nocookie.com/',
    'https://open.spotify.com/',
    /* Swaying Sweetgrass's ten seconds of grass: Ryan's own video, already
       published by us on stimpunks.org's Nature entry, framed from where it
       already lives rather than copied onto this site. Third origin, third
       origin, and the one place it is written down -- make-csp.py and
       make-sweetgrass.py both read the array above. */
    'https://videopress.com/',
    /* Club Chronic's Apple Music deck. FOURTH ORIGIN, AND THE FIRST ONE WHERE
       THE SERVICE SAYS BOTH THINGS OUT LOUD: music.apple.com sends
       X-Frame-Options: DENY *and* frame-ancestors 'none', and
       embed.music.apple.com omits frame-ancestors entirely. Same company, two
       hosts, opposite permissions -- which is "playing is not the same
       permission as embedding" stated by the vendor rather than discovered by
       us. The page a person browses is the one that refuses; the embed host is
       the one to frame. */
    'https://embed.music.apple.com/'
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

  /* THE ORIGINS THIS SITE WILL PLAY AUDIO FROM, and the same argument as the
     frame list above, one element over. A recording streamed from somebody
     else's server is still not hosted here -- "nothing musical is hosted here"
     stays true -- but it is a request to a third party, so it waits for the
     press like every frame does, and it is checked against this list like
     every frame is. make-csp.py reads THIS array for media-src exactly as it
     reads ORIGINS for frame-src, and make-small-hours.py reads it to refuse a
     track from anywhere else at build time. Adding a source is one edit here
     and a re-run of make-csp.py.

     Josephmooon's own site, where the band keeps both albums. The Small Hours'
     jukebox plays them from there, because Stimpunks helped produce them and
     the band's own shelf is where they belong. */
  var AUDIO_ORIGINS = [
    'https://josephmooon.wordpress.com/wp-content/uploads/'
  ];

  /* ONE RECORDING AT A TIME. A jukebox that let two songs play over each other
     because somebody pressed a second button would be the loud room this
     street keeps refusing, arriving through a click. Any audio this file built
     pauses the others when it starts. */
  function audio(src, title) {
    if (!src || !AUDIO_ORIGINS.some(function (o) { return src.indexOf(o) === 0; })) return null;
    var el = document.createElement('audio');
    el.src = src;
    el.controls = true;
    el.autoplay = true;
    el.preload = 'auto';
    el.setAttribute('aria-label', title || 'Recording');
    el.setAttribute('data-love-audio', '');
    el.addEventListener('play', function () {
      var all = document.querySelectorAll('audio[data-love-audio]');
      Array.prototype.forEach.call(all, function (other) {
        if (other !== el && !other.paused) other.pause();
      });
    });
    return el;
  }

  window.loveEmbed = { frame: frame, frameUrl: frameUrl, audio: audio };

  function swap(btn) {
    /* Named player, not `frame`: `var frame` here would be hoisted over the
       builder above it and the call on the line before would hit undefined. */
    var isAudio = !!btn.dataset.audioSrc;
    var player = isAudio
      ? audio(btn.dataset.audioSrc, btn.dataset.embedTitle)
      : btn.dataset.embedSrc
        ? frameUrl(btn.dataset.embedSrc, btn.dataset.embedTitle)
        : frame(btn.dataset.embedId, btn.dataset.embedTitle);
    if (!player) return;

    var shell = document.createElement('div');
    /* An audio player is a strip, not a screen, so its shell says so: the
       class is set HERE because the button's own classes do not survive the
       press (the Sweetgrass lesson), and §4 gives .facade--audio no 16:9. */
    shell.className = isAudio ? 'facade facade--audio' : 'facade';
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
