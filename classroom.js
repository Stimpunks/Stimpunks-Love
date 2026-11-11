/* Cavendish Primary Classroom: the settings under the drawing.

   Each button sets one attribute on the drawing (the lamps, the blinds, the
   fan, the cave's lights) and says what it did on the strip under the
   buttons, where the hand is. love.css's §152 shows and hides the drawing's
   parts from those attributes; nothing moves, at any setting.

   It keeps nothing, sends nothing and runs on no clock: the room is as it
   ships every time the page opens. The settings ship hidden, so a page with no
   script shows no dead control. */
(function () {
  'use strict';
  var room = document.querySelector('[data-cpc-room]');
  var set = document.querySelector('[data-cpc-set]');
  if (!room || !set) return;
  var said = set.querySelector('[data-cpc-said]');
  var buttons = set.querySelectorAll('[data-cpc-key]');

  function press(btn) {
    var key = btn.getAttribute('data-cpc-key');
    room.setAttribute('data-' + key, btn.getAttribute('data-cpc-to'));
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].getAttribute('data-cpc-key') === key) {
        buttons[i].setAttribute('aria-pressed', buttons[i] === btn ? 'true' : 'false');
      }
    }
    if (said) {
      // Cleared first, so a press that says the same thing twice is still heard.
      said.textContent = '';
      var words = btn.getAttribute('data-cpc-says') || '';
      setTimeout(function () { said.textContent = words; }, 0);
    }
  }

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () { press(this); });
  }
  set.hidden = false;
})();
