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

  function swap(btn) {
    var id = btn.dataset.embedId;
    var title = btn.dataset.embedTitle || 'Embedded video';
    if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return;

    var frame = document.createElement('iframe');
    frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
    frame.title = title;
    frame.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.setAttribute('allowfullscreen', '');
    frame.setAttribute('loading', 'lazy');
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

    var shell = document.createElement('div');
    shell.className = 'facade';
    shell.style.padding = '0';
    shell.appendChild(frame);
    btn.replaceWith(shell);
    frame.focus();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.facade');
    if (btn && btn.tagName === 'BUTTON') swap(btn);
  });
})();
