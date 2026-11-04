/* =============================================================================
   Oook, walked into on Paper Street. Ryan's ask, 2026-11-04: round one of the
   rest of the rooms, each its own world in card. On Cel Street it is behind
   L-Space, at the far end of the string; on Paper Street it is reached by its
   address or the teleporter for now.

   IT IS A ROOM IN SOMEBODY'S COLOURS AND NOBODY ELSE'S (§57), and that
   somebody is an orangutan: the dark is the rust of his coat, and the words
   and links are cream and banana. It is NOT a library interior, which is how it
   stays off the Mopery: it is the world the Librarian looks after the books
   of, out in the dark. So you come out of the gap at the end of the string
   into space, the room's own page standing by the way you came, and out in
   front of you is a disc on four elephants on a turtle, cut out of card and
   standing small against the dark, with its own little sun off to one side.

   EVERYTHING IN THE DRAWING HAS ONE LIT SIDE, the side toward that sun. Nobody
   is drawn, and the Librarian least of all. It is rust and not brown, outdoors
   in space with no flame in it, which is what keeps it off the brown rooms.
   The Disc does not turn and the sun does not go round: nothing moves at any
   setting. Terry Pratchett's world, credited on the room's page; Discworld is
   a trade mark and the page's credits say so. Every colour is one §57
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Paper Street's screen(). tools/make-paper-street.py
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
  function hash(i, j, k) {
    var n = Math.imul(i + 57, 374761393) ^ Math.imul(j + 8, 668265263) ^ Math.imul(k + 3, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  // Stars, cream and few, out in every direction.
  function stars(w, h, seed) {
    var s = svg(w, h);
    for (var i = 0; i < 80; i++) {
      s.appendChild(el('circle', { cx: hash(i, seed, 1) * w, cy: hash(i, seed, 2) * h, r: 1.5 + hash(i, seed, 3) * 3, fill: hash(i, seed, 4) < 0.7 ? 'var(--ook-dim)' : 'var(--ook-cream)' }));
    }
    return s;
  }

  // An elephant standing on the shell with the Disc on its back, side on:
  // body, legs, a trunk, and its lit edge toward the sun on the left.
  function elephant(s, x, y, k) {
    var bw = 120 * k, bh = 70 * k;
    for (var l = 0; l < 4; l++) s.appendChild(el('rect', { x: x - bw * 0.4 + l * bw * 0.24, y: y + bh * 0.2, width: bw * 0.14, height: bh * 0.8, fill: 'var(--ook-ginger)' }));
    s.appendChild(el('ellipse', { cx: x, cy: y, rx: bw / 2, ry: bh / 2, fill: 'var(--ook-ginger)' }));
    s.appendChild(el('path', { d: 'M' + (x - bw * 0.45) + ' ' + (y - bh * 0.1) + ' q' + (-bw * 0.2) + ' ' + (bh * 0.3) + ' ' + (-bw * 0.12) + ' ' + (bh * 0.9), fill: 'none', stroke: 'var(--ook-ginger)', 'stroke-width': 10 * k }));
    s.appendChild(el('path', { d: 'M' + (x - bw / 2) + ' ' + y + ' A' + bw / 2 + ' ' + bh / 2 + ' 0 0 1 ' + x + ' ' + (y - bh / 2), fill: 'none', stroke: 'var(--ook-dim)', 'stroke-width': 4 }));
  }

  // The world: the turtle swimming, four elephants on its shell, the Disc on
  // their backs with the sea going over its rim, and its little sun off to the
  // left, so every lit edge is on the left.
  function world(w, h) {
    var s = svg(w, h), cx = w * 0.55, cy = h * 0.62;
    s.appendChild(el('circle', { cx: w * 0.1, cy: h * 0.28, r: 60, fill: 'var(--ook-sun)', 'fill-opacity': '0.18' }));
    s.appendChild(el('circle', { cx: w * 0.1, cy: h * 0.28, r: 24, fill: 'var(--ook-sun)' }));
    // The turtle: flippers, head, and the shell's dome with its plates.
    s.appendChild(el('ellipse', { cx: cx - w * 0.28, cy: cy + h * 0.1, rx: 90, ry: 28, fill: 'var(--ook-shell)' }));
    s.appendChild(el('ellipse', { cx: cx + w * 0.28, cy: cy + h * 0.12, rx: 100, ry: 30, fill: 'var(--ook-shell)' }));
    s.appendChild(el('ellipse', { cx: cx - w * 0.36, cy: cy + h * 0.02, rx: 70, ry: 46, fill: 'var(--ook-shell)' }));
    s.appendChild(el('circle', { cx: cx - w * 0.38, cy: cy - 6, r: 6, fill: 'var(--ook-coat)' }));
    s.appendChild(el('path', { d: 'M' + (cx - w * 0.3) + ' ' + (cy + 40) + ' A' + w * 0.3 + ' ' + h * 0.22 + ' 0 0 1 ' + (cx + w * 0.3) + ' ' + (cy + 40) + ' Z', fill: 'var(--ook-shell)' }));
    s.appendChild(el('path', { d: 'M' + (cx - w * 0.3) + ' ' + (cy + 40) + ' A' + w * 0.3 + ' ' + h * 0.22 + ' 0 0 1 ' + cx + ' ' + (cy + 40 - h * 0.22), fill: 'none', stroke: 'var(--ook-ginger)', 'stroke-width': 10 }));
    for (var p = -2; p <= 2; p++) s.appendChild(el('path', { d: 'M' + (cx + p * w * 0.1) + ' ' + (cy + 40) + ' L' + (cx + p * w * 0.07) + ' ' + (cy - h * 0.12), fill: 'none', stroke: 'var(--ook-coat)', 'stroke-width': 4 }));
    // The four elephants on the shell.
    [-0.2, -0.07, 0.07, 0.2].forEach(function (k, i) { elephant(s, cx + k * w, cy - h * 0.2 - (i % 3 === 0 ? 0 : 10), 0.9); });
    // The Disc on their backs: its underside, the land, the rim's sea.
    var dy = cy - h * 0.34;
    s.appendChild(el('ellipse', { cx: cx, cy: dy + 14, rx: w * 0.36, ry: 34, fill: 'var(--ook-shell)' }));
    s.appendChild(el('ellipse', { cx: cx, cy: dy, rx: w * 0.36, ry: 30, fill: 'var(--ook-dim)' }));
    s.appendChild(el('ellipse', { cx: cx, cy: dy, rx: w * 0.36, ry: 30, fill: 'none', stroke: 'var(--ook-banana)', 'stroke-width': 6 }));
    s.appendChild(el('path', { d: 'M' + (cx - 30) + ' ' + dy + ' L' + cx + ' ' + (dy - 70) + ' L' + (cx + 30) + ' ' + dy + ' Z', fill: 'var(--ook-cream)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['oook.html'] = {
    prefix: 'oook-walk',
    from: 'l-space.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 820), sh = kit.H - 24;
      var WORLD = 3800, eye = sh / 2;
      var decor = [];

      decor.push(kit.item(stars(9000, 3000, 1), { x: 0, z: WORLD + 2400, w: 9000, h: 3000 }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(stars(6000, 2400, side + 5), { x: side * 3200, z: 2000, w: 6000, h: 2400, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var disc = kit.item(world(1800, 1100), { x: 200, z: WORLD, w: 1800, h: 1100, y: 80 });
      decor.push(disc);

      var page = kit.screen(kit.page, 'Oook’s own page, standing beside the way you came in');
      var sign = kit.item(page, { x: -sw / 2 - 320, z: 1500, w: sw, h: sh, cls: 'oook-walk-sign' });

      var stops = [
        kit.stop({ name: 'out of the gap at the end of the string, in the dark, the Disc far off in front of you', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'beside the way you came in, with the room’s own page standing there', spot: { x: sign.x, z: 1500 - F }, link: page }, sign),
        kit.stop({ name: 'near the Disc: four elephants on a turtle, its little sun off to one side', spot: { x: 200, z: WORLD - 1500 } })
      ];

      return {
        cls: 'oook-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The Disc is out in the dark in front of you; its own page stands beside the way you came in.',
        bounds: function () { return { x: [-1600, 1600], z: [0, WORLD - 1300] }; },
        ground: function (g, near, far) {
          kit.quad(g, -8000, 8000, near, far, kit.ink('--ook-coat'));
          // Nothing underfoot but more of the dark, and its stars.
          var dim = kit.ink('--ook-dim');
          for (var i = 0; i < 300; i++) {
            var sx = -6000 + hash(i, 2, 1) * 12000, sz = hash(i, 2, 2) * (WORLD + 2000);
            if (sz < near || sz > far) continue;
            kit.oval(g, sx, sz, 5 + hash(i, 2, 3) * 6, 3 + hash(i, 2, 4) * 3, dim, 0.6);
          }
        }
      };
    }
  };
})();
