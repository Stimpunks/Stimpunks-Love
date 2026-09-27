/* =============================================================================
   The toys in Glow Go Gee Gaws.

   A TOY STARTS DARK, IS CHARGED BY BEING HELD UP TO THE RAIL, AND GIVES THE
   LIGHT BACK. This file only moves a tile between three states -- dark, lit,
   fading -- and writes what state it is in, in words, on the tile. love.css §67
   draws each state; the fade itself is a CSS transition of the toy's own
   `--gg-fade` seconds, set from the data file by make-glow.py.

   GENTLE STAYS LIT AND THEN GOES DARK IN ONE STEP. §3 takes transitions away at
   Gentle, so a fade would otherwise be an instant blackout the moment it began.
   Here the toy stays at full glow for its time and then goes dark at once, and
   the words on the tile are identical at every setting: Gentle takes away the
   wobble, never the words. The dial is read on every press, not once.

   THE GLOW STICK IS BENT ONCE AND STAYS LIT UNTIL THE PAGE GOES. It is
   chemistry, not stored light.

   NOTHING IS STORED, SENT OR SOUNDED. make-glow.py refuses a request, storage
   or audio anywhere in this file. The one live region is #gg-says, and it only
   speaks when somebody presses something: a room full of toys announcing
   themselves as they go dark would be the page talking over the person in it.
   ============================================================================= */
(function () {
  'use strict';

  var says = document.getElementById('gg-says');
  var allBox = document.getElementById('gg-all');
  var allBtn = document.getElementById('gg-all-btn');
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.gg-toy'));
  if (!says || !tiles.length) return;
  var timers = new Map();

  function say(text) {
    if (says.textContent === text) {
      says.textContent = '';
      window.setTimeout(function () { says.textContent = text; }, 60);
    } else {
      says.textContent = text;
    }
  }
  function gentle() { return document.documentElement.getAttribute('data-intensity') === 'gentle'; }
  function name(tile) { return tile.querySelector('h3').textContent.toLowerCase(); }
  function words(tile, text) { tile.querySelector('.gg-toy__said').textContent = text; }

  function charge(tile) {
    if (tile.getAttribute('data-kind') === 'chemical') {
      if (tile.classList.contains('is-lit')) return 'already';
      tile.classList.add('is-lit');
      words(tile, 'Bent, and glowing. It will until you leave.');
      return 'bent';
    }
    var secs = parseFloat(tile.getAttribute('data-fade')) || 10;
    (timers.get(tile) || []).forEach(window.clearTimeout);
    tile.classList.remove('is-fading');
    tile.style.setProperty('--gg-fade', secs + 's');
    tile.classList.add('is-lit');
    words(tile, 'Glowing, full of the light it just took in.');
    var t = [];
    if (!gentle()) {
      t.push(window.setTimeout(function () {
        tile.classList.add('is-fading');
        words(tile, 'Fading, giving the light back.');
      }, 80));
    }
    t.push(window.setTimeout(function () {
      tile.classList.remove('is-lit', 'is-fading');
      words(tile, 'Dark again. It has given back all the light it took in.');
      timers.delete(tile);
    }, secs * 1000 + 100));
    timers.set(tile, t);
    return 'charged';
  }

  tiles.forEach(function (tile) {
    var btn = tile.querySelector('.gg-hold');
    btn.addEventListener('click', function () {
      var r = charge(tile);
      if (r === 'already') say('The glow stick is already glowing. A glow stick only goes once.');
      else if (r === 'bent') say('You bend the glow stick. It glows green, and it will until you leave.');
      else say('The ' + name(tile) + ' is glowing. It lasts about ' + tile.getAttribute('data-fade') + ' seconds down here.');
    });
    tile.querySelector('.gg-toy__do').hidden = false;
  });

  if (allBtn) {
    allBtn.addEventListener('click', function () {
      tiles.forEach(function (tile) {
        if (tile.getAttribute('data-kind') !== 'chemical') charge(tile);
      });
      say('Everything that stores light is glowing. Red and orange go first, and green lasts longest.');
    });
    allBox.hidden = false;
  }
})();
