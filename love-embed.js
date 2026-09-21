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

  /* THE ONLY PLACE ON THIS SITE THAT BUILDS A YOUTUBE IFRAME, and it is exposed
     rather than private for exactly that reason. The Hermitage's campfire has a
     shared television that retunes between channels, which is a different
     mechanism from a plate that becomes a player once — but it must not be a
     different CONTRACT. Two copies of these attributes is one copy that gets a
     referrerpolicy fixed and one that does not, silently, in the security-
     relevant half of this file. So there is one builder and two callers.

     It validates the id and returns null rather than throwing: a caller handing
     it rubbish gets nothing, the same quiet refusal the click handler has always
     given, which is why make-chappell.py and make-hermitage.py refuse a bad id
     at build time instead of relying on this. */
  function frame(id, title) {
    if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    var el = document.createElement('iframe');
    el.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
    el.title = title || 'Embedded video';
    el.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
    el.setAttribute('allowfullscreen', '');
    el.setAttribute('loading', 'lazy');
    el.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    return el;
  }

  window.loveEmbed = { frame: frame };

  function swap(btn) {
    /* Named player, not `frame`: `var frame` here would be hoisted over the
       builder above it and the call on the line before would hit undefined. */
    var player = frame(btn.dataset.embedId, btn.dataset.embedTitle);
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
