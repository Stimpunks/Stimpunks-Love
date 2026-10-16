/* The Faery Yurt's wood stove, Helen's ask, 2026-10-16: pop a log from the
   basket on the fire and the fire burns brighter. A button under the stove
   does it, and so does pressing a log in the basket; the button is the way in
   for a keyboard or a screen reader, because the drawing is aria-hidden.

   Each press lifts one log out of the basket and into the stove's window, and
   the flame grows, its heart lights and the glow on the floor warms. When the
   basket is empty the button fills it again and the fire settles back down.
   The log flies across at Regular and MAX and simply moves at Gentle, because
   Gentle takes away the motion and never the words; the fire is brighter at
   every setting, because the press is the asking. Nothing flashes.

   It says what happened in words, under the button, and never how many logs
   are left: nobody is counting. It stores nothing and sends nothing, so the
   basket is full again next time. */
(function () {
  'use strict';
  var art = document.querySelector('svg.yurt-stove');
  if (!art) return;
  var logs = Array.prototype.slice.call(art.querySelectorAll('.yurt-stove__log'));
  var flame = art.querySelector('.yurt-stove__flame');
  var heart = art.querySelector('.yurt-stove__heart');
  var glow = art.querySelector('.yurt-stove__glow');
  var floor = art.querySelector('.yurt-stove__floor');
  if (!logs.length || !flame) return;
  var FULL = logs.length, burning = 0, busy = false;
  var FIRE = { x: 195, y: 152 };           // the middle of the stove's window

  var row = document.createElement('p');
  row.className = 'yurt-stove__do';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'yurt-magic__btn';
  var says = document.createElement('span');
  says.className = 'yurt-stove__says';
  says.setAttribute('aria-live', 'polite');
  row.appendChild(btn);
  row.appendChild(says);
  art.parentNode.parentNode.insertBefore(row, art.parentNode.nextSibling);

  function gentle() { return document.documentElement.getAttribute('data-intensity') === 'gentle'; }
  function left() { return logs.filter(function (g) { return !g.hasAttribute('data-burnt'); }); }

  // The fire at a level from none on to the whole basket on.
  function light(level) {
    var k = level / FULL;
    flame.setAttribute('transform', 'translate(195 178) scale(' + (1 + 0.18 * k) + ' ' + (1 + 0.75 * k) + ') translate(-195 -178)');
    if (heart) heart.setAttribute('fill-opacity', (0.9 * k).toFixed(2));
    if (glow) glow.setAttribute('fill-opacity', (0.32 * k).toFixed(2));
    if (floor) floor.setAttribute('fill-opacity', (0.16 + 0.34 * k).toFixed(2));
  }

  function label() {
    btn.textContent = left().length ? 'Pop a log on the fire' : 'Fill the log basket again';
  }

  function burn(g) {
    if (busy || !g || g.hasAttribute('data-burnt')) return;
    busy = true;
    var x = +g.getAttribute('data-x'), y = +g.getAttribute('data-y');
    var done = function () {
      g.setAttribute('data-burnt', '');
      g.setAttribute('visibility', 'hidden');
      g.removeAttribute('transform');
      burning += 1;
      light(burning);
      busy = false;
      label();
      says.textContent = left().length
        ? 'A log goes on the fire, and it burns brighter. Warm yourself up.'
        : 'The last log is on, and the fire is roaring. The basket is empty.';
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

  function refill() {
    logs.forEach(function (g) { g.removeAttribute('data-burnt'); g.removeAttribute('visibility'); });
    burning = 0;
    light(0);
    label();
    says.textContent = 'The basket is full again, and the fire settles back down.';
  }

  btn.addEventListener('click', function () {
    var l = left();
    if (l.length) burn(l[l.length - 1]); else refill();
  });
  logs.forEach(function (g) {
    g.style.cursor = 'pointer';
    g.addEventListener('click', function () { burn(g); });
  });
  label();
})();
