/* The Faery Yurt's wish bottle, Helen Edgar's ask, 2026-11-09: write a wish,
   cork it, and it goes nowhere. The words never leave this function: they are
   not sent, not stored, not read into anything, and the box is emptied the
   moment the cork goes in, so the wish is read once, by you. The bottle shows
   a rolled paper and a cork afterwards, and the words under it say what
   happened. Nothing moves at any setting; the cork and the paper simply
   appear. The box ships hidden, because with no script it would be a box that
   does nothing. */
(function () {
  'use strict';
  var box = document.querySelector('[data-yurt-wish]');
  if (!box) return;
  var make = box.querySelector('[data-yurt-wish-make]');
  var words = box.querySelector('.yurt-wish__words');
  var cork = box.querySelector('[data-yurt-wish-cork]');
  var said = box.querySelector('[data-yurt-wish-said]');
  var art = box.querySelector('.yurt-wish__art');
  if (!make || !words || !cork || !said) return;
  make.hidden = false;
  cork.addEventListener('click', function () {
    var had = words.value.trim().length > 0;
    words.value = '';
    if (art) art.classList.add('is-corked');
    said.textContent = had
      ? 'Corked. It went nowhere, which is where wishes go. Only you read it.'
      : 'Corked, with nothing in it. An empty bottle is a wish too.';
    words.focus();
  });
})();
