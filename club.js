/* =============================================================================
   Club Chronic's stage: drop the needle somewhere in the playlist.

   THE EMBED CANNOT SHUFFLE, AND THIS IS NOT SHUFFLE. Measured on 2026-09-22
   against the live playlist, framed from a served page so the referrer was
   real: shuffle=1 is inert, and so is index= on both the videoseries and the
   listType=playlist form -- all of them opened on the same track, checked with
   muted autoplay rather than by looking at the poster. The only lever YouTube
   still answers to is /embed/<VIDEO_ID>?list=<PLAYLIST>, which moves the
   STARTING POINT and then plays on in order from there. So that is what this
   does, and the room says that is what it does. A page that called this
   shuffle would be describing a feature the player does not have.

   WHY IT IS HERE RATHER THAN IN love-embed.js. That file is the only thing on
   this site that builds a frame, and it stays that way -- this does not build
   anything. It rewrites the button's data-embed-src BEFORE the press reaches
   the document, and love-embed.js then does exactly what it has always done
   with exactly the attributes it has always read. Putting a playlist's
   curation into the shared builder would be one room's idea leaking into every
   other room's mechanism.

   THE ORDER IS THE WHOLE TRICK AND IT IS NOT AN ACCIDENT: this listener is on
   the BUTTON and love-embed.js's is on the document, so this one runs at the
   target and that one runs on the way up. Move this to the document and it
   becomes a race decided by which script tag loads first.

   IT FAILS BACK TO THE TOP OF THE LIST, never to nothing. A missing list, a
   malformed id or a frame that is not the shape this expects leaves the button
   exactly as it was, and the press plays the playlist from its first track --
   which is what this room did before and is a perfectly good outcome. The one
   thing it must not do is hand love-embed.js a URL it will quietly refuse,
   because that is a button somebody presses and presses.
   ============================================================================= */
(function () {
  'use strict';

  var YT = /^[A-Za-z0-9_-]{11}$/;
  var SERIES = '/embed/videoseries?';

  function pick(btn) {
    var base = btn.getAttribute('data-embed-src') || '';
    var ids = (btn.getAttribute('data-embed-starts') || '').split(' ');
    if (base.indexOf(SERIES) === -1) return;

    ids = ids.filter(function (id) { return YT.test(id); });
    if (!ids.length) return;

    var id = ids[Math.floor(Math.random() * ids.length)];
    btn.setAttribute('data-embed-src', base.replace(SERIES, '/embed/' + id + '?'));
  }

  function arm() {
    var decks = document.querySelectorAll('button.facade[data-embed-starts]');
    Array.prototype.forEach.call(decks, function (btn) {
      btn.addEventListener('click', function () { pick(btn); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arm);
  } else {
    arm();
  }
})();
