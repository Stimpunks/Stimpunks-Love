/* =============================================================================
   The Pebble Board's lightbox.

   Artwork and photographs are pinned at 250px because that is what a scrap on
   a corkboard looks like, and 250px is not a size you can actually see a
   watercolour spread at. Pressing one opens it at the size of the window.

   IT IS A NATIVE <dialog> AND showModal(), NOT A DIV PRETENDING. The browser
   then owns the focus trap, Escape, the backdrop, making the rest of the page
   inert, and returning focus to the thing that opened it -- five behaviours
   that a hand-rolled overlay gets wrong one at a time, usually the last two,
   and always on the site least able to afford it. Nothing here re-implements
   any of them; the only reason this file exists is to move the picture and its
   words into the dialog before it opens.

   THE DESCRIPTION IS SHOWN, NOT JUST ANNOUNCED. The picture inside carries
   alt="" and the words sit under it as real text, so the description reaches
   everybody rather than only the people using a screen reader -- and nobody
   hears it twice. The card's own title and credit come with it, because a
   picture at full size with no idea whose it is would undo the one careful
   habit this street kept.

   NOTHING IS FETCHED ON OPEN. The dialog points at the same local file the
   card is already showing, so there is no second request and no third-party
   anything -- the same promise the press-to-play plate makes, arriving at the
   pictures. There is no zoomed "original": what you get is the file we
   published, at the size of your window.

   WITHOUT THIS SCRIPT the cards still show their pictures and every link still
   works. The zoom button is built by make-pebble-board.py and does nothing on
   its own, which is the right way round: a page that needs JavaScript to show
   a photograph is a page that does not show a photograph.
   ============================================================================= */
(function () {
  'use strict';

  var box = document.getElementById('pb-lightbox');
  if (!box || typeof box.showModal !== 'function') return;

  var img = document.getElementById('pb-lightbox-img');
  var title = document.getElementById('pb-lightbox-title');
  var credit = document.getElementById('pb-lightbox-credit');
  var desc = document.getElementById('pb-lightbox-desc');

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.pb-zoom');
    if (btn) {
      img.src = btn.dataset.full;
      img.alt = '';
      title.textContent = btn.dataset.title || '';
      credit.textContent = btn.dataset.credit || '';
      desc.textContent = btn.dataset.desc || '';
      box.showModal();
      return;
    }
    /* A CLICK ON THE BACKDROP CLOSES IT. The backdrop is not an element, so the
       event arrives on the dialog itself; anything inside stops here. Without
       the bounds test, clicking the picture would close the picture. */
    if (e.target === box) {
      var r = box.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right &&
                   e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) box.close();
    }
    if (e.target.closest('.pb-lightbox__shut')) box.close();
  });

  /* ESCAPE, EXPLICITLY, ALTHOUGH <dialog> IS SUPPOSED TO DO THIS ITSELF.
     Verified on 2026-09-21: with the lightbox open and focus inside it, a real
     Escape keydown arrives on the button, is not defaultPrevented, and the
     dialog stays open. That was in the embedded browser this was built in, and
     it may well be an artifact of how that browser injects keys rather than
     something a reader would ever hit -- Chrome's close-request is driven by a
     signal above the key event, which automation does not always produce.

     It goes in anyway. The cost is four lines and a close() that is a no-op
     when the browser already handled it; the cost of being wrong the other way
     is a modal a keyboard user cannot get out of, on a site whose whole
     argument is access. "It should work" is not the standard here -- and this
     also covers browsers whose <dialog> predates the close-watcher. */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && box.open) box.close();
  });

  /* Drop the file on close so a long session does not keep every picture on
     the board decoded in memory, and so the next open cannot flash the
     previous one while the new file loads. */
  box.addEventListener('close', function () {
    img.removeAttribute('src');
  });
})();
