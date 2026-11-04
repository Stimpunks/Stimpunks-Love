/* =============================================================================
   The Garden, walked into on Paper Street, through its gate halfway down the
   street. Ryan's ask, 2026-11-04: round 1 of the rooms you can walk into.

   IT IS THE ROOM'S OWN WORLD AND SHARES NOTHING WITH THE STREET (§28). The
   street is night, shopfronts and signs; this is midday, the sun straight
   overhead and come down through leaves, so every pale surface is tinted
   green and every shadow is small, hard and directly under the thing that
   made it. The leaf shadow on the path is painted, --gd-dapple, the way §28
   paints it, and the palest thing here is not the ground: the limewashed board
   the room's own page is on is brighter than the path, carried by its edge and
   the hard shadow under it.

   THE BEDS ARE THE PAGE'S. How many sites there are is the page's to say, so
   the border down the left is one long raised bed with plants in it and no
   count, each plant starting at the top of the soil: NOTHING GREEN GOES BELOW
   THE SOIL LINE, the page's own rule. HELEN'S BOUNDARY IS IVY AND STARS, NEVER
   A FENCE: the right of the path runs out in winding ivy on the ground, with
   no post, rail or panel anywhere in it, and glimmers in it that light
   nothing. Past it is the garden next door, which is Helen's and not ours:
   none of it is drawn, and nothing past the ivy casts a shadow. The garden
   spider is an orb weaver in its web at the far end, beside the board.

   NOTHING MOVES AT ANY SETTING, the leaf shadow included. Every colour is one
   §28 declares, by name. It keeps nothing, sends nothing and fetches nothing;
   its page arrives through Paper Street's screen(). tools/make-paper-street.py
   holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function seeded(n) {
    return function () {
      n = (n + 0x6D2B79F5) | 0;
      var t = Math.imul(n ^ (n >>> 15), 1 | n);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // The raised bed: a limewashed plank along the front, soil above it, and
  // plants growing up off the soil line and never below it.
  function bed(r, w, h) {
    var s = svg(w, h), plank = h - 90, soil = plank - 30;
    s.appendChild(el('rect', { x: 0, y: soil, width: w, height: 34, fill: 'var(--gd-loam)' }));
    for (var i = 0; i < Math.round(w / 110); i++) {
      var x = 40 + r() * (w - 80), top = soil - 90 - r() * (soil - 140);
      s.appendChild(el('path', { d: 'M' + x + ' ' + soil + ' Q' + (x + (r() - 0.5) * 40) + ' ' + ((soil + top) / 2) + ' ' + x + ' ' + top, fill: 'none', stroke: 'var(--gd-leaf)', 'stroke-width': 6 }));
      for (var y = top + 20; y < soil - 16; y += 46) {
        [-1, 1].forEach(function (k) {
          s.appendChild(el('ellipse', { cx: x + k * 22, cy: y, rx: 22, ry: 10, fill: r() < 0.5 ? 'var(--gd-leaf)' : 'var(--gd-leaf-2)' }));
        });
      }
      if (r() < 0.4) s.appendChild(el('circle', { cx: x, cy: top - 6, r: 12, fill: 'var(--gd-bloom)' }));
    }
    s.appendChild(el('rect', { x: 0, y: plank, width: w, height: 90, fill: 'var(--gd-board)', stroke: 'var(--gd-edge)', 'stroke-width': 6 }));
    return s;
  }

  // The orb weaver in its web, between two canes at the far end.
  function web(w, h) {
    var s = svg(w, h), cx = w / 2, cy = h * 0.4, R = Math.min(w, h) * 0.38;
    s.appendChild(el('rect', { x: 10, y: 0, width: 10, height: h, fill: 'var(--gd-loam-2)' }));
    s.appendChild(el('rect', { x: w - 20, y: 0, width: 10, height: h, fill: 'var(--gd-loam-2)' }));
    for (var i = 0; i < 16; i++) {
      var a = i / 16 * Math.PI * 2;
      s.appendChild(el('line', { x1: cx, y1: cy, x2: cx + Math.cos(a) * R, y2: cy + Math.sin(a) * R, stroke: 'var(--gd-loam-2)', 'stroke-width': 1.5 }));
    }
    for (var k = 1; k <= 7; k++) s.appendChild(el('circle', { cx: cx, cy: cy, r: R * k / 7, fill: 'none', stroke: 'var(--gd-loam-2)', 'stroke-width': 1.2 }));
    s.appendChild(el('ellipse', { cx: cx, cy: cy + 8, rx: 10, ry: 14, fill: 'var(--gd-loam)' }));
    s.appendChild(el('circle', { cx: cx, cy: cy - 10, r: 6, fill: 'var(--gd-loam)' }));
    for (k = 0; k < 4; k++) {
      [-1, 1].forEach(function (d) {
        s.appendChild(el('path', { d: 'M' + cx + ' ' + (cy + k * 5) + ' l' + d * 18 + ' ' + (-10 + k * 8) + ' l' + d * 8 + ' 10', fill: 'none', stroke: 'var(--gd-loam)', 'stroke-width': 2 }));
      });
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-garden.html'] = {
    prefix: 'gd-walk',
    build: function (kit) {
      var r = seeded(28);
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 2800 + F;                       // the limewashed board
      var eye = sh / 2, decor = [];
      var IVY = 520;                            // where the ivy starts, right of the path

      var border = kit.item(bed(r, END - 300, 520), { x: -560, z: (END - 300) / 2 + 100, w: END - 300, h: 520, turn: kit.LEFT });
      decor.push(border);
      var spider = kit.item(web(360, 520), { x: sw / 2 + 260, z: END - 40, w: 360, h: 520, y: 40 });
      decor.push(spider);

      var page = kit.screen(kit.page, 'The Garden’s own page, on a limewashed board at the end of the path');
      var board = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: 30, cls: 'gd-walk-board' });

      var stops = [
        kit.stop({ name: 'just inside the gate, the sun straight overhead', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the border, a raised bed growing up off its soil', spot: kit.front(border, 900) }, border),
        kit.stop({ name: 'at the ivy, where what we can see of the garden ends', spot: { x: 260, z: END * 0.45, yaw: Math.PI / 2 } }),
        kit.stop({ name: 'at the limewashed board, with the room’s own page on it and the spider beside it', spot: { x: 0, z: END - F }, link: page }, board)
      ];

      return {
        cls: 'gd-walk',
        eye: eye + 30,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on a limewashed board at the end of the path, past the border.',
        bounds: function () { return { x: [-340, 340], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--gd-day'));
          // The path, with the leaf shadow painted on it.
          kit.quad(g, -360, 360, 0, END + 40, kit.ink('--gd-edge'), 0.35);
          var lit = seeded(82), dapple = kit.ink('--gd-dapple');
          for (var q = 0; q < 220; q++) {
            var qx = -340 + lit() * 680, qz = lit() * END;
            if (qz < near || qz > far) continue;
            kit.oval(g, qx, qz, 30 + lit() * 50, 18 + lit() * 30, dapple, 0.9);
          }
          // Hard, small shadows straight under the bed's plank and the board.
          kit.quad(g, -560, -530, 100, END - 200, kit.ink('--gd-loam'), 0.35);
          kit.quad(g, -sw / 2, sw / 2, END - 30, END + 20, kit.ink('--gd-loam'), 0.35);
          // The ivy, winding on the ground to the right, and glimmers in it.
          // No post, no rail, no panel; and nothing past it casts a shadow.
          var ivy = seeded(22), leaf = kit.ink('--gd-leaf'), leaf2 = kit.ink('--gd-leaf-2'), star = kit.ink('--gd-board');
          for (var i = 0; i < 900; i++) {
            var t = ivy() * END, wob = Math.sin(t / 180) * 80 + Math.sin(t / 61) * 30;
            var ix = IVY + wob + ivy() * 220;
            if (t < near || t > far) continue;
            kit.oval(g, ix, t, 16 + ivy() * 10, 10 + ivy() * 6, ivy() < 0.6 ? leaf : leaf2, 0.95);
          }
          for (i = 0; i < 60; i++) {
            var sz = ivy() * END, sx = IVY + 40 + ivy() * 400;
            if (sz >= near && sz <= far) kit.oval(g, sx, sz, 7, 7, star, 1);
          }
        }
      };
    }
  };
})();
