/* The Bough House's falling leaves, Helen Edgar's ask, 2026-10-17: a button
   under the drawing lets the autumn leaves fall from the crown, and the same
   button stops them.

   NOTHING FALLS UNTIL SOMEBODY PRESSES, at any setting: a control the visitor
   holds runs at Gentle too, the Arcade's rule, and the dial does not start it.
   The button ships nowhere: this script writes it, so a page with no script
   shows no button that does nothing. Stopping clears every leaf in the air at
   once, so stopped means still.

   A LEAF DRIFTS; NOTHING FLASHES. Each one falls slowly, swings from side to
   side and turns as it goes, inside the drawing's own <svg>, where a transform
   is part of the picture. One requestAnimationFrame loop moves them all and
   stops when the button does; a hidden tab gets no frames, so nothing falls
   for nobody. Nothing is stored, nothing is sent, and nothing is counted. */
(function () {
  'use strict';
  var svg = document.querySelector('svg.bgh-house__draw');
  if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  var INKS = ['gold', 'amber', 'rust', 'crimson', 'gold', 'amber', 'moss'];
  var MOST = 36;        // leaves in the air at once, at most
  var EVERY = 350;      // milliseconds between one leaf letting go and the next
  var GROUND = 488;     // where a leaf lands, in the drawing's own units

  var layer = document.createElementNS(NS, 'g');
  layer.setAttribute('class', 'bgh-falling');
  svg.appendChild(layer);

  var row = document.createElement('p');
  row.className = 'bgh-fall';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'bgh-fall__btn';
  btn.textContent = 'Let the leaves fall';
  var said = document.createElement('span');
  said.className = 'bgh-fall__said';
  said.setAttribute('role', 'status');
  said.setAttribute('aria-live', 'polite');
  row.appendChild(btn);
  row.appendChild(said);
  var fig = svg.closest('figure') || svg.parentNode;
  fig.parentNode.insertBefore(row, fig.nextSibling);

  var leaves = [], raf = 0, last = 0, since = 0, on = false;

  function say(text) {
    said.textContent = '';
    setTimeout(function () { said.textContent = text; }, 60);
  }

  function letGo() {
    var s = 6 + Math.random() * 5;
    var el = document.createElementNS(NS, 'path');
    el.setAttribute('d', 'M' + (-s) + ' 0 Q0 ' + (-s * 0.62) + ' ' + s + ' 0 Q0 ' + (s * 0.62) + ' ' + (-s) + ' 0 Z');
    el.setAttribute('fill', 'var(--bgh-' + INKS[Math.floor(Math.random() * INKS.length)] + ')');
    layer.appendChild(el);
    leaves.push({
      el: el,
      x: 90 + Math.random() * 460, y: -10 + Math.random() * 120,
      fall: 32 + Math.random() * 24,          // units a second, slowly
      swing: 10 + Math.random() * 16, rate: 0.5 + Math.random() * 0.6,
      turn: (Math.random() < 0.5 ? -1 : 1) * (30 + Math.random() * 50), a: Math.random() * 360,
      t: Math.random() * 6
    });
  }

  function frame(now) {
    var dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    since += dt * 1000;
    if (since >= EVERY && leaves.length < MOST) { since = 0; letGo(); }
    for (var i = leaves.length - 1; i >= 0; i--) {
      var l = leaves[i];
      l.t += dt;
      l.y += l.fall * dt;
      l.a += l.turn * dt;
      var x = l.x + Math.sin(l.t * l.rate * Math.PI * 2) * l.swing;
      l.el.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + l.y.toFixed(1) + ') rotate(' + l.a.toFixed(0) + ')');
      if (l.y > GROUND) { layer.removeChild(l.el); leaves.splice(i, 1); }
    }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    on = true; last = 0; since = EVERY;
    btn.textContent = 'Stop the leaves';
    say('The leaves are falling.');
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    on = false;
    cancelAnimationFrame(raf);
    raf = 0;
    leaves.forEach(function (l) { layer.removeChild(l.el); });
    leaves = [];
    btn.textContent = 'Let the leaves fall';
    say('The leaves have stopped.');
  }

  btn.addEventListener('click', function () { if (on) stop(); else start(); });
})();
