/* =============================================================================
   The Zine Table, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1
   of the rooms you can walk into, down the rest of the street.

   IT IS THE ZINE TABLE'S WORLD AND NOBODY ELSE'S (§7): photocopier black on
   white paper, and the ransom note's yellow, red and cyan. It is the copy room
   by day, lit like a photocopy, even and hard, with nothing warm in it. The
   zine is ONE SHEET you hold, cut with scissors and scattered at angles, which
   is what keeps it apart from Club Chronic's flyers, pasted down flat in
   layers on a black wall: so here the sheets lie on the table every one at its
   own angle, the cut-out letters, the scissors and the stapler among them,
   with the photocopier and its reams against the wall, and the room's own
   page taped up at the end as one big sheet: the page is the paper.

   THE ANGLES ARE IN THE DRAWING, each sheet's corners worked out once where it
   lies; nothing is turned by the room and nothing moves. Every colour is one
   the room declares, by name. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Paper Street's screen().
   tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var BLOCKS = ['--yellow', '--red', '--cyan', '--ink'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }
  function sized(s, w, h) { s.setAttribute('width', w); s.setAttribute('height', h); return s; }
  function hash(i, j) {
    var n = Math.imul(i + 3, 374761393) ^ Math.imul(j + 19, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  // The corners of a w-by-h shape lying at angle a round (cx, cy), seen from
  // in front and a little above, so its depth is squashed by sq.
  function lying(cx, cy, w, h, a, sq) {
    var c = Math.cos(a), n = Math.sin(a);
    return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(function (p) {
      return [cx + p[0] * c - p[1] * n, cy + (p[0] * n + p[1] * c) * sq];
    });
  }
  function poly(s, pts, fill, stroke) {
    var a = { points: pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '), fill: 'var(' + fill + ')' };
    if (stroke) { a.stroke = 'var(' + stroke + ')'; a['stroke-width'] = 3; }
    s.appendChild(el('polygon', a));
  }

  // The table: a black top seen a little from above, sheets lying on it every
  // one at its own angle, typewriter lines and a ransom block on each, cut-out
  // letters, scissors and a stapler among them; and its front and legs.
  function table(w, h) {
    var s = svg(w, h), top = h * 0.12, front = h * 0.5, sq = 0.38;
    poly(s, [[w * 0.06, top], [w * 0.94, top], [w, front], [0, front]], '--ink');
    for (var i = 0; i < 9; i++) {
      var cx = w * (0.12 + hash(i, 1) * 0.76), cy = top + (front - top) * (0.2 + hash(i, 2) * 0.6), a = (hash(i, 3) - 0.5) * 1.1;
      var sw = 210, sh2 = 280;
      poly(s, lying(cx, cy, sw, sh2, a, sq), '--paper');
      var c = Math.cos(a), n = Math.sin(a);
      var at = function (px, py) { return [cx + px * c - py * n, cy + (px * n + py * c) * sq]; };
      // Typewriter lines down the sheet, and a ransom block at its head.
      for (var l = 0; l < 6; l++) {
        var y = -sh2 / 2 + 70 + l * 30, x0 = -sw / 2 + 24, x1 = sw / 2 - 24 - hash(i, l + 9) * 60;
        poly(s, [at(x0, y), at(x1, y), at(x1, y + 6), at(x0, y + 6)], '--ink');
      }
      poly(s, [at(-80, -118), at(40, -118), at(40, -78), at(-80, -78)], BLOCKS[i % 3]);
    }
    // Cut-out letters, loose on the table, each a block of its own colour.
    for (var j = 0; j < 14; j++) {
      var lx = w * (0.08 + hash(j, 21) * 0.84), ly = top + (front - top) * (0.1 + hash(j, 22) * 0.8);
      poly(s, lying(lx, ly, 46, 56, (hash(j, 23) - 0.5) * 1.4, sq), BLOCKS[j % 4]);
    }
    // The scissors, open, lying where they were put down.
    var sx = w * 0.7, sy = front - 50;
    poly(s, [[sx, sy], [sx + 170, sy - 40], [sx + 174, sy - 30], [sx + 6, sy + 6]], '--ink');
    poly(s, [[sx, sy], [sx + 160, sy + 20], [sx + 158, sy + 30], [sx - 4, sy + 8]], '--ink');
    s.appendChild(el('ellipse', { cx: sx - 34, cy: sy - 12, rx: 30, ry: 16, fill: 'none', stroke: 'var(--red)', 'stroke-width': 8 }));
    s.appendChild(el('ellipse', { cx: sx - 30, cy: sy + 22, rx: 30, ry: 16, fill: 'none', stroke: 'var(--red)', 'stroke-width': 8 }));
    // The stapler.
    poly(s, [[w * 0.2, front - 70], [w * 0.2 + 200, front - 84], [w * 0.2 + 204, front - 52], [w * 0.2, front - 40]], '--red');
    poly(s, [[w * 0.2 - 6, front - 40], [w * 0.2 + 210, front - 52], [w * 0.2 + 210, front - 36], [w * 0.2 - 6, front - 26]], '--ink');
    // The table's front and its legs.
    s.appendChild(el('rect', { x: 0, y: front, width: w, height: 40, fill: 'var(--ink)' }));
    [24, w - 64].forEach(function (x) { s.appendChild(el('rect', { x: x, y: front + 40, width: 40, height: h - front - 40, fill: 'var(--ink)' })); });
    return s;
  }

  // The photocopier against the wall, and its reams stacked beside it.
  function copier(w, h) {
    var s = svg(w, h), cw = w * 0.6;
    s.appendChild(el('rect', { x: 0, y: h * 0.3, width: cw, height: h * 0.7, fill: 'var(--ink)' }));
    s.appendChild(el('rect', { x: -10, y: h * 0.24, width: cw + 20, height: h * 0.08, fill: 'var(--paper)', stroke: 'var(--ink)', 'stroke-width': 6 }));
    s.appendChild(el('rect', { x: cw * 0.1, y: h * 0.38, width: cw * 0.5, height: h * 0.08, fill: 'var(--cyan)' }));
    s.appendChild(el('rect', { x: cw * 0.7, y: h * 0.38, width: cw * 0.16, height: h * 0.08, fill: 'var(--yellow)' }));
    for (var t = 0; t < 3; t++) s.appendChild(el('rect', { x: cw * 0.08, y: h * (0.56 + t * 0.13), width: cw * 0.84, height: h * 0.08, fill: 'var(--paper)' }));
    for (var r = 0; r < 6; r++) {
      var y = h - (r + 1) * 70;
      s.appendChild(el('rect', { x: cw + 40 + (r % 2) * 12, y: y, width: w - cw - 60, height: 66, fill: 'var(--paper)', stroke: 'var(--ink)', 'stroke-width': 4 }));
      s.appendChild(el('rect', { x: cw + 40 + (r % 2) * 12, y: y + 26, width: w - cw - 60, height: 12, fill: 'var(' + (r % 2 ? '--red' : '--cyan') + ')' }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['zine-table.html'] = {
    prefix: 'zine-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var END = 2400 + F;                       // the end wall, where the page is taped up
      var SIDE = 760;
      var eye = sh / 2, k = eye / 520;
      var decor = [];
      var put = function (s, w, h, o) {
        o.w = w * k; o.h = h * k; o.y = (o.y || 0) * k;
        return kit.item(sized(s, o.w, o.h), o);
      };

      var tableIt = put(table(1700, 640), 1700, 640, { x: 120, z: 1500 });
      var copierIt = put(copier(1400, 900), 1400, 900, { x: -SIDE, z: 1100, turn: kit.LEFT });
      decor.push(tableIt, copierIt);

      var page = kit.screen(kit.page, 'The Zine Table’s own page, taped up on the end wall as one big sheet');
      var sheet = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'zine-walk-sheet' });

      var stops = [
        kit.stop({ name: 'inside the door of the copy room, lit like a photocopy', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the photocopier, its reams stacked beside it', spot: kit.front(copierIt, 1300) }, copierIt),
        kit.stop({ name: 'at the table, every sheet on it lying at its own angle', spot: kit.front(tableIt, 1100) }, tableIt),
        kit.stop({ name: 'at the end wall, with the room’s own page taped up as one big sheet', spot: { x: 0, z: END - F }, link: page }, sheet)
      ];

      return {
        cls: 'zine-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The sheets lie on the table at their angles; its own page is taped up on the end wall.',
        bounds: function () { return { x: [-SIDE + 140, SIDE - 140], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--paper'));
          // Photocopier grain, faint lines both ways.
          var ink = kit.ink('--ink');
          for (var x = -2000; x <= 2000; x += 40) kit.quad(g, x, x + 2, from, to, ink, 0.06);
          for (var z = Math.ceil(from / 60) * 60; z < to; z += 60) kit.quad(g, -2000, 2000, z, z + 2, ink, 0.08);
          // A dropped sheet or two on the floor, where nobody has picked them up.
          kit.quad(g, 280, 520, 500, 820, ink, 0.12);
          kit.quad(g, 300, 500, 520, 800, kit.ink('--paper'));
        }
      };
    }
  };
})();
