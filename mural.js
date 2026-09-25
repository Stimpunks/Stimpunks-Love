/* =============================================================================
   Plural Mural: turning the wall over.

   THE WALL TURNS OVER BY ITSELF AT MAX GLITTER AND NOWHERE ELSE. The dial is
   read on every tick rather than once, because somebody can turn it while they
   are standing here: turn it down to Regular and the wall stops where it is.
   At Gentle and Regular the only thing that changes the mural is a press, and
   the dissolve is a CSS transition, which §3 takes away at Gentle, so there it
   is a swap.

   NOTHING IS STORED. Which mural is up and whether it is held live in this
   script and are gone when the page is. Nothing is sent anywhere either.

   IT SPEAKS ONLY WHEN SOMEBODY PRESSED SOMETHING. A wall that announced itself
   to a screen reader every three minutes would be the loudest thing on the
   street for the one reader who cannot see it change, so the turn-by-itself
   path updates the words on the page and says nothing out loud.
   ============================================================================= */
(function () {
  'use strict';

  var stage = document.getElementById('pm-stage');
  if (!stage) return;
  var murals = Array.prototype.slice.call(stage.querySelectorAll('.pm-mural'));
  if (!murals.length) return;
  var items = Array.prototype.slice.call(document.querySelectorAll('.pm-item'));
  var title = document.getElementById('pm-now-title');
  var shows = document.getElementById('pm-now-shows');
  var says = document.getElementById('pm-says');
  var prev = document.getElementById('pm-prev');
  var next = document.getElementById('pm-next');
  var hold = document.getElementById('pm-hold');

  var EVERY = 3 * 60 * 1000;   /* the page says three minutes; change both or neither */
  var at = 0;
  var held = false;

  function wrap(i) { return (i % murals.length + murals.length) % murals.length; }
  function name(i) { return murals[wrap(i)].getAttribute('data-title'); }

  function show(i, spoken) {
    at = wrap(i);
    murals.forEach(function (m, j) { m.classList.toggle('pm-mural--up', j === at); });
    items.forEach(function (li, j) {
      var on = j === at;
      li.classList.toggle('pm-item--up', on);
      if (on) li.setAttribute('aria-current', 'true'); else li.removeAttribute('aria-current');
      var now = li.querySelector('.pm-item__now');
      if (now) now.hidden = !on;
    });
    title.textContent = name(at);
    shows.textContent = murals[at].getAttribute('data-shows');
    prev.textContent = '← Back to ' + name(at - 1);
    next.textContent = 'Turn it over to ' + name(at + 1) + ' →';
    if (spoken) {
      /* Cleared and set again on the next tick, so putting up the mural that is
         already up is still a change a live region will announce. */
      says.textContent = '';
      window.setTimeout(function () {
        says.textContent = 'On the wall now: ' + name(at) + '. ' + murals[at].getAttribute('data-shows');
      }, 60);
    }
  }

  prev.addEventListener('click', function () { show(at - 1, true); });
  next.addEventListener('click', function () { show(at + 1, true); });
  hold.addEventListener('click', function () {
    held = !held;
    hold.setAttribute('aria-pressed', held ? 'true' : 'false');
    hold.textContent = held ? 'Let it turn over again' : 'Keep this one up';
    says.textContent = '';
    window.setTimeout(function () {
      says.textContent = held ? 'Holding ' + name(at) + ' on the wall.' : 'The wall will turn over again at MAX GLITTER.';
    }, 60);
  });
  Array.prototype.forEach.call(document.querySelectorAll('.pm-put'), function (btn) {
    btn.hidden = false;
    btn.addEventListener('click', function () {
      show(Number(btn.getAttribute('data-n')), true);
      stage.scrollIntoView({ block: 'nearest' });
    });
  });

  window.setInterval(function () {
    if (held) return;
    if (document.documentElement.getAttribute('data-intensity') !== 'max') return;
    if (document.visibilityState !== 'visible') return;
    show(at + 1, false);
  }, EVERY);

  document.getElementById('pm-controls').hidden = false;
  show(0, false);
})();
