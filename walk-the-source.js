/* =============================================================================
   The Source, walked up on Paper Street. Ryan's ask, 2026-11-04: round 1 of the
   rooms still to be walked into. On Cel Street it opens off The Feed; here it
   is reached by its address or the teleporter for now.

   IT IS THE SOURCE'S WORLD AND NOBODY ELSE'S (§123): white travertine terraces
   under a warm spring, every one of them laid down by the water that runs over
   it, a thin skin of stone at a time. THE LIGHT IS A HIGH SUN ON WHITE STONE,
   and the stone is brighter than the sky: every rim throws a hard scalloped
   shadow straight down onto the face below it, and the pools are lit by the
   white rock round them. The water is milky with stone, so the sun makes no
   bright lines in it.

   IT SHARES ITS SUBJECT WITH ITS PARENT, THE FEED, AND NOTHING ELSE: that is a
   dark hall at night, indoors, a machine, square and ruled. Here it is noon
   outdoors and NOTHING IS STRAIGHT: no rule, no square corner on a pool, and
   no terrace lined up with the one above it, so each is drawn by hand and
   each steps to one side or the other. If a ruled line or a dark ground ever
   appears here, it has become the concourse with a view. The room's own page
   stands in the top pool, by the spring, with its corners worn round.

   NOTHING MOVES, at any setting: the water always is moving, and the stone it
   leaves never is, and the stone is what is drawn. Every colour is one the
   room declares, by name. It keeps nothing, sends nothing and fetches
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

  // A scalloped edge from x0 to x1 at y: a run of shallow arcs, never a line,
  // kept as its points so the same edge can be drawn again lower down.
  function scallops(r, x0, x1, y, depth) {
    var pts = [], x = x0;
    while (x < x1) {
      var nx = Math.min(x + 50 + r() * 60, x1);
      pts.push([x, nx, y + depth * (0.6 + r() * 0.8)]);
      x = nx;
    }
    return { y: y, pts: pts };
  }
  // The edge as a path, dropped by `down`; backwards, it runs right to left.
  function edge(e, down, back) {
    var p = back ? e.pts.slice().reverse() : e.pts, y = e.y + down;
    var d = back ? 'L' + p[0][1] + ' ' + y : 'M' + p[0][0] + ' ' + y;
    p.forEach(function (q) { d += ' Q' + ((q[0] + q[1]) / 2) + ' ' + (q[2] + down) + ' ' + (back ? q[0] : q[1]) + ' ' + y; });
    return d;
  }

  // One terrace: the milky pool on top, its scalloped lip, the hard scalloped
  // shadow straight down the face under it, and the drips of stone below.
  function terrace(r, w, h) {
    var s = svg(w, h), lip = 70, e = scallops(r, 0, w, lip, 50);
    s.appendChild(el('path', { d: 'M30 ' + (lip + 10) + ' Q' + (w / 2) + ' ' + (lip - 70) + ' ' + (w - 30) + ' ' + (lip + 10) + ' Z', fill: 'var(--src-pool)' }));
    s.appendChild(el('path', { d: 'M90 ' + lip + ' Q' + (w / 2) + ' ' + (lip - 44) + ' ' + (w - 90) + ' ' + lip + ' Z', fill: 'var(--src-deep)', 'fill-opacity': '0.5' }));
    s.appendChild(el('path', { d: edge(e, 0) + ' V' + h + ' H0 Z', fill: 'var(--src-stone)' }));
    s.appendChild(el('path', { d: edge(e, 0) + ' ' + edge(e, 46, true) + ' Z', fill: 'var(--src-shade)' }));
    s.appendChild(el('path', { d: edge(e, 0), fill: 'none', stroke: 'var(--src-lip)', 'stroke-width': 12, 'stroke-linecap': 'round' }));
    for (var x = 30; x < w - 30; x += 40 + r() * 50) {
      var len = 40 + r() * (h - lip - 120);
      s.appendChild(el('path', { d: 'M' + x + ' ' + (lip + 80) + ' q' + ((r() - 0.5) * 16) + ' ' + (len / 2) + ' 0 ' + len, fill: 'none', stroke: 'var(--src-shade)', 'stroke-width': 6 + r() * 6, 'stroke-linecap': 'round' }));
    }
    if (r() < 0.6) s.appendChild(el('path', { d: 'M' + (w * 0.7) + ' ' + (lip + 60) + ' q20 80 -6 ' + (h - lip - 90), fill: 'none', stroke: 'var(--src-iron)', 'stroke-width': 10, 'stroke-opacity': '0.5', 'stroke-linecap': 'round' }));
    return s;
  }

  // The spring at the top of the hill: the rock it comes out of, rust round the
  // vent, and the page's place on the white stone face below it.
  function spring(r, w, h, sw, sh) {
    var s = svg(w, h), m = w / 2, top = h - sh - 160;
    s.appendChild(el('path', { d: 'M0 ' + h + ' V' + (top + 40) + ' Q' + (m * 0.5) + ' ' + (top - 40) + ' ' + m + ' ' + (top - 60) + ' Q' + (m * 1.5) + ' ' + (top - 40) + ' ' + w + ' ' + (top + 40) + ' V' + h + ' Z', fill: 'var(--src-stone)' }));
    s.appendChild(el('ellipse', { cx: m, cy: top - 20, rx: 120, ry: 34, fill: 'var(--src-rust)', 'fill-opacity': '0.6' }));
    s.appendChild(el('ellipse', { cx: m, cy: top - 22, rx: 70, ry: 18, fill: 'var(--src-pool)' }));
    var e = scallops(r, 0, w, top + 40, 40);
    s.appendChild(el('path', { d: edge(e, 0) + ' ' + edge(e, 40, true) + ' Z', fill: 'var(--src-shade)' }));
    s.appendChild(el('path', { d: edge(e, 0), fill: 'none', stroke: 'var(--src-lip)', 'stroke-width': 12, 'stroke-linecap': 'round' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-source.html'] = {
    prefix: 'src-walk',
    build: function (kit) {
      var F = kit.F, r = seeded(123);
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var END = 3000 + F;                      // the spring and the page at the top of the hill
      var eye = sh / 2 + 70;
      var decor = [], pools = [];

      // Terraces up both sides of the path, each stepping its own way, and
      // each one higher than the one before it.
      [[-1, 700, 260], [1, 1100, 330], [-1, 1600, 420], [1, 2100, 500], [-1, 2600, 600]].forEach(function (t, i) {
        var tw = 900 + r() * 400;
        var it = kit.item(terrace(r, tw, t[2]), { x: t[0] * (520 + tw / 2 + r() * 120), z: t[1], w: tw, h: t[2] });
        decor.push(it); pools.push(it);
      });
      var SW = sw + 1400, SH = sh + 360;
      decor.push(kit.item(spring(r, SW, SH, sw, sh), { x: 0, z: END + 20, w: SW, h: SH }));

      var page = kit.screen(kit.page, 'The Source’s own page, on the white stone under the spring');
      var face = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: 70, cls: 'src-walk-face' });

      var stops = [
        kit.stop({ name: 'at the foot of the hill, the white terraces stepping up ahead', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'beside a terrace, its pool milky with stone and its lip throwing a scalloped shadow down the face', spot: kit.front(pools[1], 1100) }, pools[1]),
        kit.stop({ name: 'halfway up, with the pools stepping away on either side', spot: { x: 0, z: 1700 } }),
        kit.stop({ name: 'at the top, by the spring, with the room’s own page on the stone', spot: { x: 0, z: END - F }, link: page }, face)
      ];

      return {
        cls: 'src-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The terraces step up the hill to the spring; the room’s own page is on the stone under it.',
        bounds: function () { return { x: [-520, 520], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--src-stone'));
          // Little pools along the path, and the scalloped shadows of their rims:
          // each a round pool and a crescent of shade under its lip, never a line.
          var pool = kit.ink('--src-pool'), shade = kit.ink('--src-shade'), deep = kit.ink('--src-deep');
          [[-200, 500, 180], [240, 1000, 220], [-260, 1500, 160], [180, 2000, 240], [-120, 2500, 200], [220, 2900, 170]].forEach(function (p) {
            kit.oval(g, p[0], p[1] - 30, p[2] + 30, p[2] * 0.45 + 24, shade, 1);
            kit.oval(g, p[0], p[1], p[2], p[2] * 0.45, pool, 1);
            kit.oval(g, p[0] + 10, p[1] + 10, p[2] * 0.6, p[2] * 0.25, deep, 0.35);
          });
        }
      };
    }
  };
})();
