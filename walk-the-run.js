/* =============================================================================
   The Run, walked into on Paper Street through its gate in the fence. Ryan's
   ask, 2026-11-04: round 1 of the rooms still to be walked into.

   IT IS THE RUN'S WORLD AND NOBODY ELSE'S (§96): a dog park, PAINTED IN A
   DOG'S COLOURS. Dogs see in blues and yellows and cannot tell red from green,
   so everything here is a blue, a yellow or a grey: the grass is the khaki a
   dog sees, the sky is blue, the boards are straw, the roof is slate, and the
   ball is blue, because a dog can find a blue ball on grass. There is no red
   and no green anywhere in it. THE LIGHT IS A BRIGHT DAY WITH CLOUDS GOING
   OVER, each cloud's shadow lying soft-edged on the grass, the trees throwing
   a darker pool each, and every shadow is the grass's own yellow gone darker,
   never blue: a blue shadow is Rescue A Dog's, on snow, and this must never
   look like the shelter the dogs came from.

   NO DOG IS DRAWN HERE. The dogs are the shelter's, read off its own list on
   the room's own page, and they stay there. What is here is the field for
   them: the row of trees, the open grass for fetch, the covered porch at the
   end with rocking chairs, a swing and plush beds, and the room's own page on
   the porch's back wall.

   NOTHING MOVES: the clouds' shadows lie where they fell. Every colour is one
   the room declares, by name. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Paper Street's screen().
   tools/make-paper-street.py holds each of those.
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
  function seeded(n) {
    return function () {
      n = (n + 0x6D2B79F5) | 0;
      var t = Math.imul(n ^ (n >>> 15), 1 | n);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // A shade tree: a bark trunk and a canopy in the khaki-olive a dog sees.
  function tree(r, w, h) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: m - 24, y: h * 0.45, width: 48, height: h * 0.55, fill: 'var(--run-bark)' }));
    for (var i = 0; i < 8; i++) {
      s.appendChild(el('circle', { cx: m + (r() - 0.5) * w * 0.6, cy: h * 0.18 + r() * h * 0.3, r: w * (0.18 + r() * 0.12),
        fill: r() < 0.5 ? 'var(--run-leaf)' : 'var(--run-leaf-2)' }));
    }
    return s;
  }

  // The fence round the Run: posts and rails, straw-grey.
  function fence(w, h) {
    var s = svg(w, h);
    for (var x = 0; x <= w; x += 160) s.appendChild(el('rect', { x: x, y: 0, width: 14, height: h, fill: 'var(--run-fence)' }));
    [h * 0.2, h * 0.6].forEach(function (y) { s.appendChild(el('rect', { x: 0, y: y, width: w, height: 12, fill: 'var(--run-fence)' })); });
    return s;
  }

  // The covered porch at the end: a slate roof, straw boards, rocking chairs
  // with their cushions, a swing on its chains, and plush beds on the boards.
  function porch(w, h, sw, sh) {
    var s = svg(w, h), m = w / 2, floor = h - 60;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 90, fill: 'var(--run-roof)' }));
    [40, w - 70].forEach(function (x) { s.appendChild(el('rect', { x: x, y: 90, width: 30, height: floor - 90, fill: 'var(--run-board)' })); });
    s.appendChild(el('rect', { x: m - sw / 2 - 40, y: floor - sh - 120, width: sw + 80, height: sh + 120, fill: 'var(--run-wall)' }));
    s.appendChild(el('rect', { x: 0, y: floor, width: w, height: 60, fill: 'var(--run-board)' }));
    for (var x = 0; x < w; x += 70) s.appendChild(el('rect', { x: x, y: floor, width: 3, height: 60, fill: 'var(--run-shade)' }));
    // A rocking chair either side of the page, a cushion on each.
    [m - sw / 2 - 260, m + sw / 2 + 110].forEach(function (x, i) {
      s.appendChild(el('rect', { x: x, y: floor - 300, width: 150, height: 180, rx: 12, fill: 'var(--run-chair)' }));
      s.appendChild(el('rect', { x: x - 10, y: floor - 130, width: 170, height: 30, rx: 10, fill: i ? 'var(--run-cushion-2)' : 'var(--run-cushion)' }));
      s.appendChild(el('path', { d: 'M' + (x - 20) + ' ' + (floor - 10) + ' q' + 95 + ' 30 ' + 190 + ' 0', fill: 'none', stroke: 'var(--run-chair)', 'stroke-width': 10 }));
      s.appendChild(el('rect', { x: x + 10, y: floor - 100, width: 10, height: 90, fill: 'var(--run-chair)' }));
      s.appendChild(el('rect', { x: x + 130, y: floor - 100, width: 10, height: 90, fill: 'var(--run-chair)' }));
    });
    // Plush beds on the boards, round and deep.
    [[m - sw / 2 + 60, '--run-cushion'], [m + sw / 2 - 160, '--run-cushion-2']].forEach(function (b) {
      s.appendChild(el('ellipse', { cx: b[0] + 50, cy: floor - 20, rx: 90, ry: 30, fill: 'var(' + b[1] + ')' }));
      s.appendChild(el('ellipse', { cx: b[0] + 50, cy: floor - 26, rx: 60, ry: 16, fill: 'var(--run-paper)' }));
    });
    return s;
  }

  // A swing on the open ground: a frame and a seat on two chains.
  function swing(w, h) {
    var s = svg(w, h);
    s.appendChild(el('path', { d: 'M20 ' + h + ' L' + (w * 0.3) + ' 20 H' + (w * 0.7) + ' L' + (w - 20) + ' ' + h, fill: 'none', stroke: 'var(--run-steel)', 'stroke-width': 14 }));
    [w * 0.42, w * 0.58].forEach(function (x) { s.appendChild(el('rect', { x: x - 3, y: 20, width: 6, height: h * 0.62, fill: 'var(--run-steel)' })); });
    s.appendChild(el('rect', { x: w * 0.38, y: h * 0.64, width: w * 0.24, height: 18, rx: 6, fill: 'var(--run-chair)' }));
    return s;
  }

  // The water bowl, and the blue ball waiting on the grass beside it.
  function bowl(w, h) {
    var s = svg(w, h);
    s.appendChild(el('ellipse', { cx: w * 0.35, cy: h - 30, rx: w * 0.3, ry: 26, fill: 'var(--run-steel)' }));
    s.appendChild(el('ellipse', { cx: w * 0.35, cy: h - 38, rx: w * 0.24, ry: 14, fill: 'var(--run-water)' }));
    s.appendChild(el('circle', { cx: w * 0.82, cy: h - 34, r: 32, fill: 'var(--run-ball)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-run.html'] = {
    prefix: 'run-walk',
    build: function (kit) {
      var F = kit.F, r = seeded(96);
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var END = 3000 + F;                      // the porch at the end of the Run
      var eye = sh / 2 + 120;
      var decor = [], trees = [];

      // The row of trees down the left, for shade.
      for (var z = 500; z < END - 300; z += 520) {
        var tw = 520 + r() * 200, th = 900 + r() * 300;
        var t = kit.item(tree(r, tw, th), { x: -1150 - r() * 200, z: z, w: tw, h: th });
        decor.push(t); trees.push(t);
      }
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(fence(END, 240), { x: side * 1700, z: END / 2, w: END, h: 240, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var swings = kit.item(swing(420, 420), { x: 900, z: 1400, w: 420, h: 420 });
      decor.push(swings);
      var water = kit.item(bowl(300, 120), { x: 260, z: 900, w: 300, h: 120 });
      decor.push(water);
      var PW = sw + 760, PH = sh + 400;
      decor.push(kit.item(porch(PW, PH, sw, sh), { x: 0, z: END + 20, w: PW, h: PH }));

      var page = kit.screen(kit.page, 'The Run’s own page, on the back wall of the covered porch');
      var wall = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: 120, cls: 'run-walk-wall' });

      var stops = [
        kit.stop({ name: 'just through the gate, on the grass', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the water bowl, the blue ball on the grass beside it', spot: kit.front(water, 600) }, water),
        kit.stop({ name: 'out on the open grass for fetch, by the swing', spot: kit.front(swings, 1000) }, swings),
        kit.stop({ name: 'under the porch roof, with the room’s own page on its back wall and the dogs there', spot: { x: 0, z: END - F }, link: page }, wall)
      ];

      return {
        cls: 'run-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The dogs are on the room’s own page, on the porch at the end of the Run.',
        bounds: function () { return { x: [-900, 1300], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--run-grass'));
          // The clouds' shadows, soft-edged and yellow-dark, never blue, and a
          // darker pool under every tree.
          var cloud = kit.ink('--run-shadow');
          [[400, 700, 700, 300], [-300, 1800, 900, 360], [700, 2600, 600, 260]].forEach(function (c) {
            kit.oval(g, c[0], c[1], c[2], c[3], cloud, 0.45);
            kit.oval(g, c[0], c[1], c[2] * 0.8, c[3] * 0.8, cloud, 0.5);
          });
          var shade = kit.ink('--run-shade');
          trees.forEach(function (t) { kit.oval(g, t.x + 60, t.z - 40, t.w * 0.45, 140, shade, 0.7); });
          // The path worn to the porch.
          kit.quad(g, -160, 160, Math.max(from, 0), Math.min(to, END), kit.ink('--run-wall'), 0.5);
        }
      };
    }
  };
})();
