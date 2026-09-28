/* Your Room's copy button, and nothing else.

   THE PROMPT WORKS WITHOUT THIS FILE. It is plain text in a <pre> on the page,
   so with scripts off it reads and selects by hand. All this adds is the
   convenience, which is why the button ships `hidden` and is switched on here:
   a page with no JavaScript shows no dead control. §2's [hidden] guard carries
   !important, which is what holds that against any display rule.

   IT SENDS NOTHING ANYWHERE. No fetch, no storage: the button puts the prompt
   on the visitor's own clipboard, and where it goes after that is theirs to
   decide. The page says so above the prompt.

   THE ANSWER IS BESIDE THE BUTTON, where the hand is (the Playhouse's lesson),
   and #yr-says carries it for a screen reader. Pressing twice is ordinary, and
   a live region does not announce text it already holds, so a repeat is
   cleared and set back on the next tick -- checkpoint.js's reason, repeated
   here rather than approximated. */
(function () {
  'use strict';

  var says = document.getElementById('yr-says');
  var button = document.querySelector('.yr-prompt__copy');
  if (!says || !button) return;
  var pre = document.getElementById(button.getAttribute('data-copy'));
  var local = button.parentNode.querySelector('.yr-prompt__said');
  if (!pre) return;
  button.hidden = false;

  function announce(text) {
    if (local) { local.textContent = text; local.hidden = false; }
    if (says.textContent === text) {
      says.textContent = '';
      window.setTimeout(function () { says.textContent = text; }, 60);
    } else {
      says.textContent = text;
    }
  }

  button.addEventListener('click', function () {
    function byHand() {
      var range = document.createRange();
      range.selectNodeContents(pre);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      announce('Could not reach the clipboard. The prompt is selected, so copy it from there.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pre.textContent).then(function () {
        announce('Copied. Paste it into a new chat with your AI.');
      }, byHand);
    } else {
      byHand();
    }
  });
})();
