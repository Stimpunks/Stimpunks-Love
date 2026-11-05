/* The basket of fidgets in Luis's Burrow (Helen Edgar's ask, 2026-11-05: "a
   basket of fidget stress toys to squeeze and play with"). Press a toy and it
   says what it did ON THE TOY YOU PRESSED, the Playhouse's rule: the answer is
   where the hand is, and the one live region at the foot of the basket says
   the same sentence once for a screen reader. The words are identical at every
   setting; only the squash is motion, and it is a scale inside the toy's own
   drawing, gated below Gentle by love.css. NOTHING IS COUNTED, nothing is
   stored, nothing is sent and nothing makes a sound: a basket of fidgets is
   exactly the shape of thing that grows a press counter, and it does not. */
(function () {
  'use strict';
  var says = document.getElementById('lbw-says');
  var toys = document.querySelectorAll('.lbw-toy__btn');
  if (!says || !toys.length) return;
  var last = null;
  toys.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var said = btn.closest('.lbw-toy').querySelector('.lbw-toy__said');
      if (last && last !== said) { last.hidden = true; last.textContent = ''; }
      said.textContent = btn.getAttribute('data-said');
      said.hidden = false;
      last = said;
      // A repeat is only announced if the region changes, so clear it first.
      says.textContent = '';
      setTimeout(function () { says.textContent = btn.getAttribute('data-said'); }, 20);
      btn.classList.remove('is-squashed');
      void btn.offsetWidth;
      btn.classList.add('is-squashed');
    });
    btn.addEventListener('animationend', function () { btn.classList.remove('is-squashed'); });
  });
})();
