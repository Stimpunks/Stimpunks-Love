/* =============================================================================
   The laptop in the Solarpunk Hermitage's cave.

   It frames stimpunks.love — this site, inside a room on this site. Nothing
   third-party is involved, so this is not the press-to-play facade's problem
   (see love-embed.js) and it still waits to be pressed, for different reasons:
   a whole copy of the street loading itself into a room would mean a second
   intensity dial applying underneath the first, every font served twice, and a
   screen reader walking the entire site again for somebody who came in to read
   a book. Consent is the jukebox's reason; this one is about not handing
   anybody a page with two of everything on it.

   AND IT REFUSES TO NEST. A laptop showing the street is a laptop you can walk
   back down into this room with, which puts a laptop inside a laptop, and the
   third one is not a joke any more — it is a page that will not stop loading
   and an accessibility tree nobody can get out of. So a hermitage that finds
   itself already inside a frame does not offer the laptop at all; it says so
   instead. That check has to be here rather than in the markup, because a page
   cannot know at write time which copy of itself it will turn out to be.

   The CSP had to change for any of this to work: frame-ancestors was 'none',
   which stops this site being framed by ANYBODY including itself. It is 'self'
   now, and X-Frame-Options is SAMEORIGIN to match. Clickjacking protection
   against every other origin is unchanged. See _headers and tools/make-csp.py.
   ============================================================================= */
(function () {
  'use strict';

  var wake = document.getElementById('laptop-wake');
  if (!wake) return;

  var nested = window.self !== window.top;

  if (nested) {
    var lid = wake.parentNode;
    var said = document.createElement('p');
    said.className = 'laptop__wake';
    said.style.cursor = 'default';
    said.innerHTML = '<b>One screen is enough</b>' +
      '<span>You are already looking at this room through a laptop. ' +
      'Opening another one inside it is a corridor rather than a joke.</span>';
    lid.replaceChild(said, wake);
    return;
  }

  wake.addEventListener('click', function () {
    var frame = document.createElement('iframe');
    frame.src = 'index.html';
    frame.className = 'laptop__screen';
    frame.title = 'stimpunks.love, open on the laptop in the cave';
    frame.setAttribute('loading', 'lazy');
    wake.replaceWith(frame);
    frame.focus();
  });
})();
