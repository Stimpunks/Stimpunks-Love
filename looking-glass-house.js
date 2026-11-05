/* Looking-Glass House (love.css §148). Three things on the mantelpiece and a
   pawn on the board, each answering a press and nothing else: it keeps
   nothing, sends nothing, writes no markup from a string and runs on no timer
   (make-looking-glass-house.py reads this file for exactly that). With scripts
   off the board is the list of squares under it, the book reads the right way
   round and the clock's answer is a <details>. */
(function () {
  'use strict';

  /* THE BOARD. Alice goes up the queen's file, the second square to the
     eighth; each list item under the board is a square, and the pawn stands
     on the one she is on. The pawn moves by its SVG transform attribute, a
     translate, which is part of the picture. */
  var board = document.querySelector('[data-lgh-board]');
  var pawn = board && board.querySelector('[data-lgh-pawn]');
  var crown = board && board.querySelector('[data-lgh-crown]');
  var squares = Array.prototype.slice.call(document.querySelectorAll('[data-lgh-square]'));
  var controls = document.querySelector('[data-lgh-controls]');
  var move = document.querySelector('[data-lgh-move]');
  var again = document.querySelector('[data-lgh-again]');
  var now = document.querySelector('[data-lgh-now]');
  var at = 2;

  function place(say) {
    pawn.setAttribute('transform', 'translate(140 ' + (340 - at * 40) + ')');
    if (at === 8) { crown.removeAttribute('hidden'); } else { crown.setAttribute('hidden', ''); }
    squares.forEach(function (li) {
      if (Number(li.getAttribute('data-lgh-square')) === at) { li.setAttribute('aria-current', 'step'); }
      else { li.removeAttribute('aria-current'); }
    });
    move.disabled = at === 8;
    var here = squares.filter(function (li) { return Number(li.getAttribute('data-lgh-square')) === at; })[0];
    if (say && here) {
      now.textContent = here.querySelector('.lgh-square__where').textContent + '. ' +
        here.querySelector('.lgh-square__ours').textContent;
    }
  }

  if (board && pawn && crown && move && again && controls && squares.length) {
    controls.hidden = false;
    place(false);
    now.textContent = 'Alice is a White Pawn on the second square.';
    move.addEventListener('click', function () {
      if (at < 8) { at += 1; place(true); }
      if (at === 8) { again.focus(); }
    });
    again.addEventListener('click', function () {
      at = 2;
      place(true);
      move.focus();
    });
  }

  /* THE LOOKING-GLASS BOOK. The verse is the real words, the right way round
     in the markup, and only drawn back to front; holding it up to the glass
     draws it the right way round again. */
  var book = document.querySelector('[data-lgh-book]');
  var hold = document.querySelector('[data-lgh-hold]');
  if (book && hold) {
    book.setAttribute('data-backwards', '');
    hold.hidden = false;
    hold.addEventListener('click', function () {
      var held = book.hasAttribute('data-backwards');
      if (held) { book.removeAttribute('data-backwards'); } else { book.setAttribute('data-backwards', ''); }
      hold.setAttribute('aria-pressed', held ? 'true' : 'false');
      hold.textContent = held ? 'Take it away from the glass' : 'Hold it up to the glass';
    });
  }

  /* THE WRITING GLASS. What you write comes back from the other side of the
     glass, and goes nowhere else. */
  var write = document.querySelector('[data-lgh-write]');
  var written = document.querySelector('[data-lgh-written]');
  if (write && written) {
    write.addEventListener('input', function () {
      written.textContent = write.value || 'Looking-glass';
    });
  }
})();
