/* The Faery Yurt's art gallery, Helen's ask, 2026-10-15: press a painting on
   the wall and it comes off the wall into a gilt frame. Each painting has its
   own <dialog> in the markup (tools/make-yurt-gallery.py writes it), and all
   this does is wire the press to it: Escape closes it, the browser's own
   behaviour for a modal dialog; a click on the dark round the frame closes it;
   the keyboard goes back to the picture it came from. With scripts off the
   press opens the scan itself, which is what the link says it does.

   Nothing moves at any setting, nothing is stored, nothing is sent, and
   nothing is fetched that the wall had not already fetched: the frame shows
   the same file the wall does. */
(function () {
  'use strict';
  if (!('HTMLDialogElement' in window)) return;
  document.querySelectorAll('[data-art-open]').forEach(function (open) {
    var frame = open.parentNode.querySelector('dialog');
    if (!frame || typeof frame.showModal !== 'function') return;
    var close = frame.querySelector('[data-art-close]');
    open.addEventListener('click', function (e) {
      e.preventDefault();
      frame.showModal();
      if (close) close.focus();
    });
    if (close) close.addEventListener('click', function () { frame.close(); });
    frame.addEventListener('click', function (e) {
      // The dialog's own box is the frame; a click outside it lands on the
      // dialog element itself, which is the backdrop.
      if (e.target === frame) frame.close();
    });
    frame.addEventListener('close', function () { open.focus(); });
  });
})();
