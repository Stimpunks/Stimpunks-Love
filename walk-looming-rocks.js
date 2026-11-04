/* =============================================================================
   Looming Rocks Amphitheatre, walked into on Paper Street. Ryan's ask,
   2026-11-04: round one of the rest of the rooms, each its own world in card.
   On Cel Street it is a turning off the Outskirts; on Paper Street it is
   reached by its address or the teleporter for now.

   IT IS THE VENUE'S WORLD AND NOBODY ELSE'S (§38): an open-air stage at the
   foot of enormous rock faces, after dark. You come in at the top of the rows,
   the rock goes up out of sight on both sides, and at the bottom is the stage
   with the room's own page on it as the set.

   THE LIGHT IS THROWN UPWARD AND NOTHING ELSE ON THE STREET DOES THAT. Floods
   stand on the ground and point up the rock, so a face is brightest at its
   foot and goes dark towards the top, and there is nothing overhead at all.
   What glows is not the lamp: the lamps are violet and the lichen gives back
   cyan-green, which is emission rather than reflection. That green is the
   pair to watch, because the Lagoon's acid is a yellow-green on the same
   road; here it stays cyan. Nothing moves at any setting and no lamp
   flickers. Every colour is one §38 declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
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

  // A rock face: a jagged top far above you, the face lit violet at its foot
  // and going dark as it climbs, with lichen on it glowing back cyan, most of
  // it where the floods reach and less and less higher up.
  function face(r, w, h, floods) {
    var s = svg(w, h), d = 'M0 ' + h + ' L0 ' + (h * 0.1);
    for (var x = 0; x <= w; x += 120) d += ' L' + x + ' ' + (h * (0.02 + r() * 0.12)).toFixed(0);
    d += ' L' + w + ' ' + h + ' Z';
    s.appendChild(el('path', { d: d, fill: 'var(--lr-rock)' }));
    for (var b = 0; b < 6; b++) {
      s.appendChild(el('rect', { x: 0, y: h - (b + 1) * h * 0.07, width: w, height: h * 0.07, fill: 'var(--lr-uv)', 'fill-opacity': (0.36 - b * 0.06).toFixed(2) }));
    }
    floods.forEach(function (fx) {
      s.appendChild(el('path', { d: 'M' + (fx - 30) + ' ' + h + ' L' + (fx - 220) + ' ' + (h * 0.35) + ' L' + (fx + 220) + ' ' + (h * 0.35) + ' L' + (fx + 30) + ' ' + h + ' Z',
        fill: 'var(--lr-uv)', 'fill-opacity': '0.14' }));
    });
    for (var i = 0; i < 90; i++) {
      var ly = h - Math.pow(r(), 3) * h * 0.8, lx = r() * w;
      s.appendChild(el('ellipse', { cx: lx, cy: ly, rx: 10 + r() * 30, ry: 5 + r() * 12, fill: 'var(--lr-lichen)', 'fill-opacity': Math.max(0.15, (ly / h) * 1.4 - 0.4).toFixed(2) }));
    }
    // Cracks down the face, dark.
    for (i = 0; i < 8; i++) {
      var cx = r() * w;
      s.appendChild(el('path', { d: 'M' + cx + ' ' + (h * 0.15) + ' l' + (r() * 60 - 30) + ' ' + (h * 0.25) + ' l' + (r() * 60 - 30) + ' ' + (h * 0.3), fill: 'none', stroke: 'var(--lr-rock)', 'stroke-width': 6 }));
    }
    return s;
  }

  // A flood on the ground, pointed up the rock: a squat box, a violet lens.
  function flood(w, h) {
    var s = svg(w, h);
    s.appendChild(el('path', { d: 'M0 ' + h + ' L' + w * 0.15 + ' ' + h * 0.3 + ' H' + w * 0.85 + ' L' + w + ' ' + h + ' Z', fill: 'var(--lr-face)', stroke: 'var(--lr-dim)', 'stroke-width': 2 }));
    s.appendChild(el('rect', { x: w * 0.2, y: h * 0.18, width: w * 0.6, height: h * 0.2, rx: 6, fill: 'var(--lr-uv)' }));
    return s;
  }

  // The stage at the bottom of the bowl: a deck, its front edge, and the
  // speaker stacks either side of the set.
  function stage(w, h, gap) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: 0, y: h - 90, width: w, height: 90, fill: 'var(--lr-face)' }));
    s.appendChild(el('rect', { x: 0, y: h - 90, width: w, height: 6, fill: 'var(--lr-bone)' }));
    [-1, 1].forEach(function (side) {
      var sx = side < 0 ? m - gap / 2 - 260 : m + gap / 2 + 60;
      s.appendChild(el('rect', { x: sx, y: h - 90 - 420, width: 200, height: 420, fill: 'var(--lr-rock)', stroke: 'var(--lr-dim)', 'stroke-width': 3 }));
      [0.25, 0.62].forEach(function (k) {
        s.appendChild(el('circle', { cx: sx + 100, cy: h - 90 - 420 + 420 * k, r: 60, fill: 'none', stroke: 'var(--lr-dim)', 'stroke-width': 6 }));
      });
    });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['looming-rocks.html'] = {
    prefix: 'looming-walk',
    from: 'the-outskirts.html',
    build: function (kit) {
      var r = seeded(38);
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 3200 + F;                       // the stage
      var SIDE = 1300, eye = sh / 2, RH = sh * 4;
      var decor = [];

      [-1, 1].forEach(function (side) {
        var len = END + 600, fl = [];
        for (var x = 400; x < len; x += 700) fl.push(x);
        decor.push(kit.item(face(r, len, RH, fl), { x: side * SIDE, z: len / 2 - 200, w: len, h: RH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT }));
        fl.forEach(function (fx) {
          var z = (side < 0 ? fx : len - fx) - 200;
          if (z > 200 && z < END - 200) decor.push(kit.item(flood(150, 90), { x: side * (SIDE - 110), z: z, w: 150, h: 90, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
        });
      });
      decor.push(kit.item(face(r, SIDE * 2 + 400, RH, [SIDE * 0.6, SIDE * 1.6]), { x: 0, z: END + 500, w: SIDE * 2 + 400, h: RH }));
      decor.push(kit.item(stage(SIDE * 2, sh + 220, sw), { x: 0, z: END + 20, w: SIDE * 2, h: sh + 220 }));

      var page = kit.screen(kit.page, 'Looming Rocks’ own page, the set on the stage');
      var set = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: 0, cls: 'looming-walk-set' });

      var stops = [
        kit.stop({ name: 'at the top of the rows, the rock going up out of sight on both sides', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the foot of the left-hand face, by a flood, the lichen glowing back cyan', spot: { x: -SIDE + 520, z: 1100, yaw: -kit.LEFT } }),
        kit.stop({ name: 'halfway down the rows, the stage below', spot: { x: 0, z: 1700 } }),
        kit.stop({ name: 'at the stage, with the room’s own page as the set', spot: { x: 0, z: END - F }, link: page }, set)
      ];

      return {
        cls: 'looming-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The stage is at the bottom of the bowl, with its own page on it as the set.',
        bounds: function () { return { x: [-SIDE + 400, SIDE - 400], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -5000, 5000, near, far, kit.ink('--lr-rock'));
          // The rows of the bowl, a step every so often, each step's edge lit
          // a little by the floods along the faces.
          var step = kit.ink('--lr-face');
          for (var z = 200; z < END - F + 200; z += 240) kit.quad(g, -SIDE + 200, SIDE - 200, z, z + 90, step, 0.9);
          var uv = kit.ink('--lr-uv');
          kit.quad(g, -SIDE, -SIDE + 260, Math.max(near, 0), Math.min(far, END), uv, 0.1);
          kit.quad(g, SIDE - 260, SIDE, Math.max(near, 0), Math.min(far, END), uv, 0.1);
        }
      };
    }
  };
})();
