/* =============================================================================
   The Cooldown Room's vending machine.

   A press drops a snack into the tray and says what it was, in words, in three
   places: on the slot you pressed (where the hand is -- the Playhouse's rule,
   because a readout at the side of a machine is off the screen on a phone),
   in the readout beside the glass, and once, out loud, in the live region.

   IT STORES NOTHING AND SENDS NOTHING. There is no count of what anybody took
   and no memory of it between visits: the tray is empty every time you come
   in. make-cooldown.py refuses this file if that ever stops being true.
   Nothing moves and nothing makes a sound, at any setting.
   ============================================================================= */
(function () {
  'use strict';
  var slots = [].slice.call(document.querySelectorAll('.cool-slot'));
  if (!slots.length) return;
  var readout = document.getElementById('cool-readout');
  var tray = document.getElementById('cool-tray');
  var said = document.getElementById('cool-said');

  /* The same sentence twice in a row still has to be heard, so the region is
     cleared and set on the next tick: love.js's speak() for the same reason. */
  function say(text) {
    said.textContent = '';
    window.setTimeout(function () { said.textContent = text; }, 30);
  }

  slots.forEach(function (b) {
    b.addEventListener('click', function () {
      slots.forEach(function (o) {
        var d = o.querySelector('.cool-slot__drop');
        if (d) d.hidden = o !== b;
      });
      var name = b.dataset.name, who = b.dataset.maker;
      readout.textContent = b.dataset.slot + ': ' + name + ', from ' + who + '. It is in the tray, and it is free.';
      tray.textContent = name + '.';
      say(name + ' dropped into the tray. Free, from ' + who + '.');
    });
  });
})();
