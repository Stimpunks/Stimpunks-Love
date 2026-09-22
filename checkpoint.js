/* The Healing Checkpoint's copy buttons, and nothing else.

   THE SLIPS WORK WITHOUT THIS FILE. Each one is a <details> holding its own
   text, written into the page by tools/make-checkpoint.py, so with scripts off
   the whole set opens, reads and selects by hand. All this adds is the
   convenience -- which is why every button it touches ships `hidden` and is
   switched on here: a page with no JavaScript must show no dead control, and in
   the one room on this street whose entire subject is not being asked for
   anything, a button that does nothing would be the worst possible joke. §2's
   [hidden] guard carries !important, which is the only reason that holds
   against a room's own display rules.

   IT SENDS NOTHING ANYWHERE. No form action, no endpoint, no fetch, no storage:
   the button puts the slip on your own clipboard and the person decides where
   it goes. zibaldone.js made that decision first and this room keeps it, for
   the same reason -- collecting what our community says to a server nobody told
   them about is the consent this street spends a mechanism protecting.

   THE READOUT IS ON THE SLIP YOU PRESSED. The Playhouse answered into one live
   region at the top of its page, which is off the screen by the time anybody
   has scrolled to the controls; Ryan pressed the buttons he had just asked for
   and thought they were broken, and every check anybody ran was reading the DOM
   rather than the viewport. So the visible answer is inside the slip, and the
   room's single live region carries it for anybody who is not looking. Only one
   slip holds an answer at a time, so it always reads as THIS slip replying.

   AND IT SAYS THE SAME THING TWICE ON PURPOSE. Pressing copy twice is an
   ordinary thing to do, and an aria-live region does not announce text it
   already holds -- so the second press would be silent for the one reader who
   most needs to hear it while looking perfectly correct on screen. love.js
   carries the clear-and-set-back fix and does not export it, so it is repeated
   here rather than approximated. */
(function () {
  'use strict';

  var says = document.getElementById('checkpoint-says');
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.hc-slip__copy'));
  if (!says || !buttons.length) return;

  var readouts = Array.prototype.slice.call(document.querySelectorAll('.hc-slip__said'));

  function announce(local, text) {
    readouts.forEach(function (r) { r.textContent = ''; r.hidden = true; });
    if (local) { local.textContent = text; local.hidden = false; }
    if (says.textContent === text) {
      says.textContent = '';
      window.setTimeout(function () { says.textContent = text; }, 60);
    } else {
      says.textContent = text;
    }
  }

  buttons.forEach(function (button) {
    var panel = button.parentNode;
    var pre = document.getElementById(button.getAttribute('data-copy'));
    var local = panel.querySelector('.hc-slip__said');
    if (!pre) return;
    button.hidden = false;

    button.addEventListener('click', function () {
      var text = pre.textContent;

      function byHand() {
        /* Selecting the slip means somebody can finish the job with one
           keystroke, which is a better failure than a button that did nothing
           and said nothing. */
        var range = document.createRange();
        range.selectNodeContents(pre);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        announce(local, 'Could not reach the clipboard. The slip above is selected — copy it from there.');
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          announce(local, 'Copied. Send it to whoever is waiting, or do not.');
        }, byHand);
      } else {
        byHand();
      }
    });
  });
})();
