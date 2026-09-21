/* =============================================================================
   The Doomscroll's reader.

   A NATIVE <dialog> AND showModal(), the same decision pebble-board.js and
   mopery.js made: the focus trap, Escape, the inert background, the backdrop
   and returning focus to the button all belong to the browser.

   THE DIALOG IS A CLONE OF THE POEM THAT IS ALREADY ON THE PAGE. Every text
   and every provenance line is in the document exactly once, under the button
   that opens it, [hidden]. So with this file switched off the <noscript> in
   the head unhides all of them, takes the buttons away, and the room becomes
   more itself rather than less: a very long scroll that you keep going down.

   NOTHING HERE IS EXCERPTED AND NOTHING IS TRUNCATED FOR THE POPUP. A feed
   that hands you the worst line of something is precisely the thing this room
   is a joke about, so the dialog scrolls rather than cutting a long poem short.
   ============================================================================= */
(function () {
  'use strict';

  var box = document.getElementById('dsc-full');
  if (!box || typeof box.showModal !== 'function') return;
  var body = document.getElementById('dsc-full-body');
  if (!body) return;

  function open(btn) {
    var poem = document.getElementById(btn.dataset.poem);
    if (!poem) return;
    var copy = poem.cloneNode(true);
    copy.removeAttribute('id');
    copy.removeAttribute('hidden');
    copy.classList.remove('dsc-body');
    body.replaceChildren(copy);
    box.showModal();
    /* Long poems open at the top rather than wherever the last one was left. */
    var inner = box.querySelector('.dsc-full__inner');
    if (inner) inner.scrollTop = 0;
  }

  document.addEventListener('click', function (e) {
    var more = e.target.closest('.dsc-more');
    if (more) { open(more); return; }
    if (e.target.closest('.dsc-close')) { box.close(); return; }
    /* A click on the backdrop closes it. The backdrop is not an element, so the
       event arrives on the dialog itself; anything inside stops here. Without
       the bounds test, clicking a stanza would close the poem. */
    if (e.target === box) {
      var r = box.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right &&
                   e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) box.close();
    }
  });

  /* Escape, explicitly. See the note in pebble-board.js: <dialog> is supposed
     to do this itself and was observed not to under automation, and the cost of
     being wrong the other way is a modal a keyboard user cannot get out of. */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && box.open) box.close();
  });

  box.addEventListener('close', function () { body.replaceChildren(); });
})();
