/* =============================================================================
   The Watering Hole, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round 1 of the rooms that could not yet be walked into.

   IT IS THE ROOM'S OWN WORLD AND SHARES NOTHING WITH THE HOUSE IT OPENS OFF
   (§74): a pan of water in the Namib at noon. The sand is bleached nearly
   white, the dunes stand far off against a sky as pale as the sand, and one
   pool of water lies in the whole view. The animals people have seen at those
   waterholes stand round it in card, each drawn once, an oryx, a springbok and
   an ostrich, and nobody is drawn. The room's own page is on a board left out
   in the sun on the far side of the pool, to read and press as itself.

   THE LIGHT IS THE UNFILTERED MIDDAY SUN, straight overhead and out of sight,
   so every shadow is a dark pool directly under the thing that casts it and
   nowhere else. If a shadow here ever falls to one side, the sun has gone down
   and the room has gone with it. There is no night, no flame, and no blue but
   the water.

   NOTHING MOVES AT ANY SETTING, the heat shimmer included. Every colour is one
   §74 declares, by name. It keeps nothing, sends nothing and fetches nothing;
   its page arrives through Paper Street's screen(). tools/make-paper-street.py
   holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // The dunes, far off, against a sky bleached nearly as pale as the sand.
  function dunes(w, h) {
    var s = svg(w, h), base = h - 10;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--wh-board)' }));
    s.appendChild(el('path', { fill: 'var(--wh-panel)',
      d: 'M0 ' + base + ' L0 ' + (base - 120) + ' Q' + (w * 0.12) + ' ' + (base - 260) + ' ' + (w * 0.24) + ' ' + (base - 140) +
         ' Q' + (w * 0.4) + ' ' + (base - 320) + ' ' + (w * 0.56) + ' ' + (base - 150) + ' Q' + (w * 0.74) + ' ' + (base - 280) + ' ' +
         (w * 0.88) + ' ' + (base - 130) + ' L' + w + ' ' + (base - 170) + ' L' + w + ' ' + base + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--wh-dune)',
      d: 'M0 ' + base + ' L0 ' + (base - 60) + ' Q' + (w * 0.2) + ' ' + (base - 150) + ' ' + (w * 0.36) + ' ' + (base - 70) +
         ' Q' + (w * 0.62) + ' ' + (base - 190) + ' ' + (w * 0.8) + ' ' + (base - 60) + ' L' + w + ' ' + (base - 90) + ' L' + w + ' ' + base + ' Z' }));
    s.appendChild(el('rect', { x: 0, y: base, width: w, height: 10, fill: 'var(--wh-sand)' }));
    return s;
  }

  // An oryx, side on: fawn hide, the dark face mask and the long straight horns.
  function oryx(w, h) {
    var s = svg(w, h);
    s.appendChild(el('ellipse', { cx: w * 0.46, cy: h * 0.48, rx: w * 0.32, ry: h * 0.16, fill: 'var(--wh-fawn)' }));
    [0.24, 0.34, 0.6, 0.7].forEach(function (k) { s.appendChild(el('rect', { x: w * k, y: h * 0.56, width: 12, height: h * 0.44, fill: 'var(--wh-fawn)' })); });
    s.appendChild(el('path', { fill: 'var(--wh-ink)', d: 'M' + (w * 0.2) + ' ' + (h * 0.5) + ' Q' + (w * 0.46) + ' ' + (h * 0.62) + ' ' + (w * 0.74) + ' ' + (h * 0.5) + ' L' + (w * 0.74) + ' ' + (h * 0.56) + ' Q' + (w * 0.46) + ' ' + (h * 0.68) + ' ' + (w * 0.2) + ' ' + (h * 0.56) + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--wh-fawn)', d: 'M' + (w * 0.72) + ' ' + (h * 0.4) + ' L' + (w * 0.84) + ' ' + (h * 0.2) + ' L' + (w * 0.94) + ' ' + (h * 0.26) + ' L' + (w * 0.84) + ' ' + (h * 0.44) + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--wh-ink)', d: 'M' + (w * 0.86) + ' ' + (h * 0.22) + ' L' + (w * 0.95) + ' ' + (h * 0.27) + ' L' + (w * 0.9) + ' ' + (h * 0.32) + ' Z' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--wh-ink)', 'stroke-width': 5, d: 'M' + (w * 0.85) + ' ' + (h * 0.21) + ' L' + (w * 0.7) + ' 2 M' + (w * 0.88) + ' ' + (h * 0.21) + ' L' + (w * 0.76) + ' 0' }));
    s.appendChild(el('path', { fill: 'var(--wh-ink)', d: 'M' + (w * 0.14) + ' ' + (h * 0.44) + ' Q' + (w * 0.04) + ' ' + (h * 0.6) + ' ' + (w * 0.1) + ' ' + (h * 0.7) + ' L' + (w * 0.16) + ' ' + (h * 0.48) + ' Z' }));
    return s;
  }

  // A springbok, smaller, hide in the room's rust with a pale belly.
  function springbok(w, h) {
    var s = svg(w, h);
    s.appendChild(el('ellipse', { cx: w * 0.46, cy: h * 0.5, rx: w * 0.3, ry: h * 0.15, fill: 'var(--wh-hide)' }));
    s.appendChild(el('ellipse', { cx: w * 0.46, cy: h * 0.56, rx: w * 0.26, ry: h * 0.07, fill: 'var(--wh-board)' }));
    [0.26, 0.34, 0.58, 0.66].forEach(function (k) { s.appendChild(el('rect', { x: w * k, y: h * 0.58, width: 8, height: h * 0.42, fill: 'var(--wh-hide)' })); });
    s.appendChild(el('path', { fill: 'var(--wh-hide)', d: 'M' + (w * 0.7) + ' ' + (h * 0.44) + ' L' + (w * 0.8) + ' ' + (h * 0.2) + ' L' + (w * 0.92) + ' ' + (h * 0.24) + ' L' + (w * 0.8) + ' ' + (h * 0.48) + ' Z' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--wh-ink)', 'stroke-width': 4, d: 'M' + (w * 0.81) + ' ' + (h * 0.2) + ' Q' + (w * 0.76) + ' ' + (h * 0.06) + ' ' + (w * 0.82) + ' 4' }));
    return s;
  }

  // An ostrich: a dark body of plumes, long pale legs and neck.
  function ostrich(w, h) {
    var s = svg(w, h);
    s.appendChild(el('ellipse', { cx: w * 0.5, cy: h * 0.46, rx: w * 0.36, ry: h * 0.14, fill: 'var(--wh-ink)' }));
    s.appendChild(el('path', { fill: 'var(--wh-board)', d: 'M' + (w * 0.2) + ' ' + (h * 0.4) + ' L' + (w * 0.06) + ' ' + (h * 0.36) + ' L' + (w * 0.18) + ' ' + (h * 0.48) + ' Z' }));
    s.appendChild(el('rect', { x: w * 0.4, y: h * 0.56, width: 10, height: h * 0.44, fill: 'var(--wh-fawn)' }));
    s.appendChild(el('rect', { x: w * 0.56, y: h * 0.56, width: 10, height: h * 0.44, fill: 'var(--wh-fawn)' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--wh-fawn)', 'stroke-width': 12, d: 'M' + (w * 0.8) + ' ' + (h * 0.42) + ' Q' + (w * 0.86) + ' ' + (h * 0.2) + ' ' + (w * 0.8) + ' ' + (h * 0.06) }));
    s.appendChild(el('ellipse', { cx: w * 0.82, cy: h * 0.05, rx: 18, ry: 12, fill: 'var(--wh-fawn)' }));
    return s;
  }

  // The board the page is on, left out in the sun: posts and a weathered frame.
  function board(w, h, fw, fh) {
    var s = svg(w, h), cx = w / 2;
    [cx - fw / 2 + 40, cx + fw / 2 - 40].forEach(function (x) { s.appendChild(el('rect', { x: x - 14, y: h - 180, width: 28, height: 180, fill: 'var(--wh-dim)' })); });
    s.appendChild(el('rect', { x: cx - fw / 2 - 22, y: h - fh - 200, width: fw + 44, height: fh + 44, fill: 'var(--wh-panel)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['cavendish-watering-hole.html'] = {
    prefix: 'wh-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var END = 2600 + F;                       // where the board stands
      var eye = sh / 2, POOL = 1500;
      var decor = [];

      decor.push(kit.item(dunes(9000, 900), { x: 0, z: 7000, w: 9000, h: 900 }));
      var beasts = [
        { draw: oryx, w: 420, h: 340, x: -700, z: POOL + 100 },
        { draw: springbok, w: 300, h: 240, x: 660, z: POOL - 120 },
        { draw: ostrich, w: 300, h: 480, x: 820, z: POOL + 520 }
      ];
      beasts.forEach(function (b) { decor.push(kit.item(b.draw(b.w, b.h), { x: b.x, z: b.z, w: b.w, h: b.h })); });
      decor.push(kit.item(board(sw + 120, sh + 220, sw, sh), { x: 0, z: END + 10, w: sw + 120, h: sh + 220 }));

      var page = kit.screen(kit.page, 'The Watering Hole’s own page, on a board left out in the sun');
      var hung = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: 178, cls: 'wh-walk-leaf' });

      var stops = [
        kit.stop({ name: 'on the sand, the pan of water ahead in the noon sun', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the edge of the pool, the oryx across it', spot: { x: 0, z: POOL - F * 0.9 } }),
        kit.stop({ name: 'at the board on the far side, with the room’s own page on it', spot: kit.front(hung), link: page }, hung)
      ];

      return {
        cls: 'wh-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on a board on the far side of the pool.',
        bounds: function () { return { x: [-1200, 1200], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -9000, 9000, from, to, kit.ink('--wh-sand'));
          // The pan: dried mud round the water, then the water itself.
          kit.oval(g, 0, POOL, 900, 420, kit.ink('--wh-dune'), 0.6);
          kit.oval(g, 0, POOL, 620, 280, kit.ink('--wh-water'), 1);
          kit.oval(g, -80, POOL - 40, 360, 150, kit.ink('--wh-pool'), 1);
          // Every shadow straight under the thing that casts it, and nowhere else.
          beasts.forEach(function (b) { kit.oval(g, b.x, b.z, b.w * 0.34, 40, kit.ink('--wh-shade'), 0.7); });
          kit.oval(g, 0, END + 10, sw * 0.55, 50, kit.ink('--wh-shade'), 0.6);
        }
      };
    }
  };
})();
