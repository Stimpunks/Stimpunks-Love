/* The Faery Yurt's wood stove, Helen's ask, 2026-10-16: pop a log from the
   basket on the fire and the fire burns brighter, and get more logs when the
   basket runs out. Two buttons under the stove do it, and pressing a log in
   the basket puts that log on; the buttons are the way in for a keyboard or a
   screen reader, because the drawing is aria-hidden.

   Each log lifts out of the basket and into the stove's window, and the fire
   grows: a taller flame, its heart lit, a warm glow spreading round the stove
   (Helen's ask, the same day) and onto the floor. Getting more logs fills the
   basket and leaves the fire as it is. The log flies across at Regular and
   MAX and simply moves at Gentle, because Gentle takes away the motion and
   never the words; the fire is brighter at every setting, because the press
   is the asking. Nothing flickers and nothing flashes: the glow changes only
   when somebody presses.

   It says what happened in words, under the buttons, and never how many logs
   are left: nobody is counting. It stores nothing and sends nothing, so the
   basket is full and the fire low again next time. */
(function () {
  'use strict';
  var art = document.querySelector('svg.yurt-stove');
  if (!art) return;
  var logs = Array.prototype.slice.call(art.querySelectorAll('.yurt-stove__log'));
  var flame = art.querySelector('.yurt-stove__flame');
  var heart = art.querySelector('.yurt-stove__heart');
  var glow = art.querySelector('.yurt-stove__glow');
  var halo = art.querySelector('.yurt-stove__halo');
  var floor = art.querySelector('.yurt-stove__floor');
  if (!logs.length || !flame) return;
  var FULL = logs.length, burning = 0, busy = false;
  var FIRE = { x: 195, y: 152 };           // the middle of the stove's window

  var row = document.createElement('p');
  row.className = 'yurt-stove__do';
  function button(words) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'yurt-magic__btn';
    b.textContent = words;
    row.appendChild(b);
    return b;
  }
  var pop = button('Pop a log on the fire');
  var more = button('Get more logs');
  var says = document.createElement('span');
  says.className = 'yurt-stove__says';
  says.setAttribute('aria-live', 'polite');
  row.appendChild(says);
  art.parentNode.parentNode.insertBefore(row, art.parentNode.nextSibling);

  function gentle() { return document.documentElement.getAttribute('data-intensity') === 'gentle'; }
  function left() { return logs.filter(function (g) { return !g.hasAttribute('data-burnt'); }); }

  // The fire at a level from none on to a whole basket on; it goes no higher.
  function light(level) {
    var k = Math.min(level, FULL) / FULL;
    flame.setAttribute('transform', 'translate(195 178) scale(' + (1 + 0.18 * k) + ' ' + (1 + 0.75 * k) + ') translate(-195 -178)');
    if (heart) heart.setAttribute('fill-opacity', (0.9 * k).toFixed(2));
    if (glow) glow.setAttribute('fill-opacity', (0.32 * k).toFixed(2));
    if (halo) {
      halo.setAttribute('opacity', (0.3 + 0.7 * k).toFixed(2));
      halo.setAttribute('transform', 'translate(195 150) scale(' + (1 + 0.35 * k) + ') translate(-195 -150)');
    }
    if (floor) floor.setAttribute('fill-opacity', (0.16 + 0.34 * k).toFixed(2));
  }

  function burn(g) {
    if (busy) return;
    if (!g) { says.textContent = 'The basket is empty. Get more logs to keep the fire going.'; return; }
    if (g.hasAttribute('data-burnt')) return;
    busy = true;
    var x = +g.getAttribute('data-x'), y = +g.getAttribute('data-y');
    var done = function () {
      g.setAttribute('data-burnt', '');
      g.setAttribute('visibility', 'hidden');
      g.removeAttribute('transform');
      var roaring = burning >= FULL;
      burning += 1;
      light(burning);
      busy = false;
      says.textContent = roaring
        ? 'Another log goes on, and the fire glows as warm as it can.'
        : left().length
          ? 'A log goes on the fire, and it glows brighter. Warm yourself up.'
          : 'The last log in the basket is on, and the fire is glowing. Get more logs whenever you like.';
    };
    if (gentle() || !window.requestAnimationFrame) { done(); return; }
    var t0 = null, MS = 650, dx = FIRE.x - x, dy = FIRE.y - y, landed = false;
    function land() { if (!landed) { landed = true; done(); } }
    function step(t) {
      if (landed) return;
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / MS), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      var lift = -60 * Math.sin(Math.PI * p);           // up and over, into the window
      var s = 1 - 0.45 * e;
      g.setAttribute('transform', 'translate(' + (dx * e) + ' ' + (dy * e + lift) + ') translate(' + x + ' ' + y + ') scale(' + s + ') translate(' + (-x) + ' ' + (-y) + ')');
      if (p < 1) window.requestAnimationFrame(step); else land();
    }
    window.requestAnimationFrame(step);
    // A tab the browser is not drawing gets no frames, so the log lands anyway.
    setTimeout(land, MS + 150);
  }

  // More logs fill the basket; the fire keeps burning as it was.
  function restock() {
    if (busy) return;
    if (left().length === FULL) { says.textContent = 'The basket is already full of logs.'; return; }
    logs.forEach(function (g) { g.removeAttribute('data-burnt'); g.removeAttribute('visibility'); });
    says.textContent = 'You bring in an armful of logs, and the basket is full again.';
  }

  pop.addEventListener('click', function () { var l = left(); burn(l[l.length - 1]); });
  more.addEventListener('click', restock);
  logs.forEach(function (g) {
    g.style.cursor = 'pointer';
    g.addEventListener('click', function () { burn(g); });
  });
  light(0);
})();
