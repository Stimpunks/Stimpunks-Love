/* =============================================================================
   The Zibaldone, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1
   of the rooms you can walk into, down the rest of the street.

   IT IS THE ZIBALDONE'S WORLD AND NOBODY ELSE'S (§29): a commonplace book left
   open on a desk, and you are small enough to stand in it. You walk up the
   gutter, the fold between the verso and the recto, laid paper written into by
   hand on either side, and the book lies on the walnut desk running off into
   the dark. The one lamp stands on the desk to the LEFT, at desk height, so
   the light rakes across the pages from the left: the verso is the brighter
   page, and every slip tipped in along the pages throws its shadow down and
   to the right, away from it. At the head of the book the room's own page is
   tipped in as one big leaf, taped at its corners, its shadow down and right
   like the rest.

   THE ROOMS ONE EDIT AWAY are held off by the book. THE
   MOPERY is a cold stone building with printed books on shelves; there is no
   building here, only a desk under a lamp, and nothing printed: the marks on
   the pages are a hand's. THE DOOMSCROLL is one grey roll with no fold; this
   has a gutter you walk along, and the paper is warm. THE ZINE TABLE is a
   photocopy in a hundred copies; this is one copy, nothing cut out of it.

   NOTHING MOVES, and the slips stand as the kit turns them, at the angle the
   hand left them. Every colour is one §29 declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var NIBS = ['--zb-oak', '--zb-iron', '--zb-aniline', '--zb-rubric'];

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
    var n = Math.imul(i + 11, 374761393) ^ Math.imul(j + 29, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  // A slip tipped in: laid paper with lines of a hand on it, tape at the top.
  function slip(w, h, nib, seed) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--zb-laid)' }));
    for (var y = 70, i = 0; y < h - 40; y += 34, i++) {
      var len = w * (0.5 + hash(seed, i) * 0.38);
      s.appendChild(el('path', { d: 'M30 ' + y + ' q' + len / 4 + ' -6 ' + len / 2 + ' 0 t' + len / 2 + ' 0', fill: 'none', stroke: 'var(' + nib + ')', 'stroke-width': 4, 'stroke-linecap': 'round' }));
    }
    s.appendChild(el('rect', { x: w * 0.3, y: -6, width: w * 0.4, height: 34, fill: 'var(--zb-tape)' }));
    return s;
  }

  // The lamp on the desk to the left, at desk height: a weighted foot, an arm,
  // and a shade turned towards the book with the bulb lit inside it.
  function lamp(w, h) {
    var s = svg(w, h);
    s.appendChild(el('ellipse', { cx: w * 0.3, cy: h - 30, rx: w * 0.24, ry: 30, fill: 'var(--zb-iron)' }));
    s.appendChild(el('path', { d: 'M' + (w * 0.3) + ' ' + (h - 40) + ' L' + (w * 0.22) + ' ' + (h * 0.45) + ' L' + (w * 0.6) + ' ' + (h * 0.22), fill: 'none', stroke: 'var(--zb-iron)', 'stroke-width': 26, 'stroke-linejoin': 'round' }));
    s.appendChild(el('path', { d: 'M' + (w * 0.5) + ' ' + (h * 0.08) + ' L' + (w * 0.98) + ' ' + (h * 0.3) + ' L' + (w * 0.86) + ' ' + (h * 0.5) + ' Z', fill: 'var(--zb-iron)' }));
    s.appendChild(el('ellipse', { cx: w * 0.9, cy: h * 0.42, rx: 40, ry: 70, fill: 'var(--zb-laid)' }));
    return s;
  }

  // An inkwell on the desk beyond the recto, the iron-gall ink in it.
  function inkwell(w, h) {
    var s = svg(w, h);
    s.appendChild(el('path', { d: 'M' + (w * 0.1) + ' ' + h + ' L' + (w * 0.18) + ' ' + (h * 0.3) + ' H' + (w * 0.82) + ' L' + (w * 0.9) + ' ' + h + ' Z', fill: 'var(--zb-iron)' }));
    s.appendChild(el('rect', { x: w * 0.32, y: h * 0.1, width: w * 0.36, height: h * 0.22, fill: 'var(--zb-desk-2)' }));
    s.appendChild(el('ellipse', { cx: w * 0.5, cy: h * 0.1, rx: w * 0.18, ry: 10, fill: 'var(--zb-iron)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['zibaldone.html'] = {
    prefix: 'zb-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var END = 2700 + F;                       // the head of the book, where the page is tipped in
      var PAGE = 1500;                          // how wide each page of the book is from the gutter
      var eye = sh / 2, k = eye / 520;
      var decor = [], slips = [];
      var put = function (s, w, h, o) {
        o.w = w * k; o.h = h * k; o.y = (o.y || 0) * k;
        return kit.item(sized(s, o.w, o.h), o);
      };

      // Slips tipped in along both pages, each at the angle the hand left it.
      [[-700, 900, 0.3], [560, 1300, -0.25], [-520, 2000, -0.15], [760, 2300, 0.35], [-900, 2700, 0.2]].forEach(function (p, i) {
        var it = put(slip(420, 560, NIBS[i % NIBS.length], i), 420, 560, { x: p[0], z: p[1], turn: p[2] });
        decor.push(it); slips.push(it);
      });
      var lampIt = put(lamp(900, 1100), 900, 1100, { x: -PAGE - 700, z: 1700, turn: kit.LEFT * 0.4 });
      decor.push(lampIt);
      decor.push(put(inkwell(360, 380), 360, 380, { x: PAGE + 420, z: END - 300 }));

      var page = kit.screen(kit.page, 'The Zibaldone’s own page, tipped in at the head of the book');
      var leaf = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'zb-walk-leaf' });

      var stops = [
        kit.stop({ name: 'at the foot of the book, in the gutter between the verso and the recto', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'up the gutter, the lamp’s light raking in across the verso from your left', spot: { x: 0, z: 1500 - F * 0.4 } }),
        kit.stop({ name: 'at the edge of the verso, facing the lamp on the desk', spot: kit.front(lampIt, 1300) }, lampIt),
        kit.stop({ name: 'at the head of the book, with the room’s own page tipped in, taped at its corners', spot: { x: 0, z: END - F }, link: page }, leaf)
      ];

      return {
        cls: 'zb-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'You are standing in the gutter of the open book; its own page is tipped in at the head of it.',
        bounds: function () { return { x: [-PAGE + 100, PAGE - 100], z: [0, END - F] }; },
        ground: function (g, from, to) {
          // The walnut desk, across the grain, and the book lying on it.
          kit.quad(g, -6000, 6000, from, to, kit.ink('--zb-desk'));
          for (var gz = Math.ceil(from / 90) * 90; gz < to; gz += 90) kit.quad(g, -6000, 6000, gz, gz + 6, kit.ink('--zb-desk-2'), 0.6);
          var z0 = Math.max(from, -300), z1 = Math.min(to, END + 260);
          if (z1 <= z0) return;
          kit.quad(g, -PAGE, 0, z0, z1, kit.ink('--zb-laid'));
          kit.quad(g, 0, PAGE, z0, z1, kit.ink('--zb-laid-2'));
          // The fold: darker into the gutter, and lighter on the verso's side.
          kit.quad(g, -90, 0, z0, z1, kit.ink('--zb-gutter'), 0.5);
          kit.quad(g, 0, 70, z0, z1, kit.ink('--zb-gutter'), 0.8);
          // A hand across both pages, line after line, in the room's four inks.
          for (var j = Math.ceil(z0 / 70); j * 70 < z1; j++) {
            [-1, 1].forEach(function (side) {
              var len = PAGE * (0.5 + hash(j, side + 3) * 0.35), x0 = side < 0 ? -PAGE + 140 : 160;
              kit.quad(g, x0, x0 + len, j * 70, j * 70 + 6, kit.ink(NIBS[Math.floor(hash(j, side) * 4)]), 0.7);
            });
          }
          // Every slip throws its shadow down and to the right, away from the lamp.
          slips.forEach(function (it) { kit.quad(g, it.x - it.w * 0.2, it.x + it.w * 0.8, it.z - 20, it.z + 180, kit.ink('--zb-oak'), 0.18); });
          // A pencil left lying across the recto.
          kit.quad(g, 300, 1100, 1700, 1724, kit.ink('--zb-pencil'));
          kit.quad(g, 1100, 1150, 1700, 1724, kit.ink('--zb-tape'));
        }
      };
    }
  };
})();
