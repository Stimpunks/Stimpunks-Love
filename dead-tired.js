/* Dead Tired Society's talking piece, and nothing else.

   THE PARAGRAPH ABOVE IT IS TRUE WITHOUT THIS FILE. Passing is a whole turn
   whether or not anybody presses a button, so the piece ships `hidden` and is
   switched on here: a page with no JavaScript must show no dead control, and in
   a room for people who have nothing left, a button that does nothing would be
   the worst possible joke. §2's [hidden] guard carries !important, which is the
   only reason that holds against the room's own display rules.

   IT SENDS NOTHING ANYWHERE AND KEEPS NOTHING. No form action, no endpoint, no
   fetch, no storage of any kind. What somebody types into the box stays in the
   box until they put it down, and putting it down empties it. zibaldone.js and
   checkpoint.js made that decision first; this room keeps it for their reason,
   and for one of its own: a society that remembered what you said to it would
   be keeping exactly the kind of record this room says it does not.

   PASSING IS NOT A LESSER BUTTON. It is first, it is the same size, and what it
   says back is not a consolation. A talking piece that made passing feel like
   failing to speak would be the thing peer support exists to undo.

   THE READOUT IS ON THE PIECE YOU PRESSED, which is the Playhouse's lesson: a
   control whose only answer lands somewhere off the screen looks broken to the
   person pressing it. It is the room's one live region, so it also carries the
   answer for anybody not looking -- and it clears and sets itself back when the
   same sentence is due twice, because an aria-live region does not announce
   text it already holds and passing twice is an ordinary thing to do. love.js
   carries the same fix and does not export it, so it is repeated here rather
   than approximated. */
(function () {
  'use strict';

  var piece = document.querySelector('.dts-piece');
  if (!piece) return;
  var said = piece.querySelector('.dts-piece__said');
  var say = document.getElementById('dts-say');
  var box = document.getElementById('dts-say-box');
  var open = piece.querySelector('[data-turn="say"]');
  if (!said || !say || !box || !open) return;

  function answer(text) {
    if (said.textContent === text) {
      said.textContent = '';
      window.setTimeout(function () { said.textContent = text; }, 60);
    } else {
      said.textContent = text;
    }
  }

  function close() {
    box.value = '';
    say.hidden = true;
    open.setAttribute('aria-expanded', 'false');
  }

  piece.hidden = false;

  piece.addEventListener('click', function (e) {
    var b = e.target.closest('[data-turn]');
    if (!b) return;
    var turn = b.getAttribute('data-turn');

    if (turn === 'pass') {
      close();
      answer('Passed. That was your turn, all of it, and the piece has gone on round.');
    } else if (turn === 'say') {
      if (say.hidden) {
        say.hidden = false;
        open.setAttribute('aria-expanded', 'true');
        said.textContent = '';
        box.focus();
      } else {
        close();
        answer('Closed. Nothing in it was kept.');
      }
    } else if (turn === 'down') {
      var empty = !box.value.replace(/\s+/g, '');
      close();
      open.focus();
      answer(empty
        ? 'Put down. There was nothing in it, which is allowed too.'
        : 'Put down. It has gone nowhere, nothing kept it, and nobody read it.');
    }
  });
})();
