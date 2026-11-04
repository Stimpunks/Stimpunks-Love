/* =============================================================================
   L-Space, walked into on Paper Street. Ryan's ask, 2026-11-04: round one of
   the rest of the rooms, each its own world in card. On Cel Street it opens off
   the Community Library; on Paper Street it is reached by its address or the
   teleporter for now.

   IT IS THE SPACE BETWEEN THE SHELVES AND NOBODY ELSE'S (§56): the shelving of
   every library at once, with enough weight in the middle that every line
   bends towards the well. So the cases standing either side of you are cut
   with their shelves sagging and their sides bowed in, every spine leaning off
   a curve, and underfoot there is no floor, only the diagram of the
   curvature: rings closing in on the well, darker the nearer they get. Nothing
   in here is straight but the string. It is tied where you come in, runs along
   the way through, and leaves at the far end, where the room's own page hangs
   in a frame the colour of the string.

   NOTHING IS LIT AND NOTHING CASTS A SHADOW, because there is nothing straight
   to hang a lamp from; there is no candle (that is the Mopery) and nothing
   falls (that is the Rabbit Hole's shaft). The warp does not move at any
   setting. Every colour is one §56 declares, by name. It keeps nothing, sends
   nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var SPINES = ['var(--lsp-bone)', 'var(--lsp-dim)', 'var(--lsp-shelf)'];

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

  // A point on a shelf that sags towards the middle by `sag`, and which way is
  // up from it there.
  function onShelf(x0, x1, y, sag, t) {
    var x = x0 + (x1 - x0) * t, dy = sag * 4 * t * (1 - t);
    var slope = sag * 4 * (1 - 2 * t) / (x1 - x0);
    var len = Math.sqrt(1 + slope * slope);
    return { x: x, y: y + dy, nx: slope / len, ny: -1 / len };
  }

  // A case with the weight of the well in it: its sides bowed in, its shelves
  // sagging, and every spine stood up off the curve it rests on.
  function bentCase(r, w, h) {
    var s = svg(w, h), bow = w * 0.08;
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--lsp-shelf)', 'stroke-width': 12,
      d: 'M10 0 Q' + (10 + bow) + ' ' + h / 2 + ' 10 ' + h + ' M' + (w - 10) + ' 0 Q' + (w - 10 - bow) + ' ' + h / 2 + ' ' + (w - 10) + ' ' + h }));
    var shelf = 150;
    for (var y = shelf; y < h; y += shelf) {
      var sag = 30 + (1 - Math.abs(y - h / 2) / (h / 2)) * 40;
      for (var t = 0.04; t < 0.96; t += 0.022 + r() * 0.02) {
        if (r() < 0.07) continue;                  // a gap where a book is out somewhere else
        var p = onShelf(20, w - 20, y, sag, t), tall = shelf - 34 - r() * 30;
        s.appendChild(el('line', { x1: p.x.toFixed(1), y1: p.y.toFixed(1), x2: (p.x + p.nx * tall).toFixed(1), y2: (p.y + p.ny * tall).toFixed(1),
          stroke: SPINES[Math.floor(r() * 3)], 'stroke-width': 9 + Math.floor(r() * 7) }));
      }
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--lsp-dim)', 'stroke-width': 6,
        d: 'M20 ' + y + ' Q' + w / 2 + ' ' + (y + sag * 2) + ' ' + (w - 20) + ' ' + y }));
    }
    return s;
  }

  // Where the string is tied: a post, and the knot.
  function post(w, h) {
    var s = svg(w, h);
    s.appendChild(el('path', { d: 'M' + (w / 2 - 8) + ' ' + h + ' Q' + (w / 2 + 6) + ' ' + h / 2 + ' ' + (w / 2 - 4) + ' 0', fill: 'none', stroke: 'var(--lsp-shelf)', 'stroke-width': 16 }));
    s.appendChild(el('circle', { cx: w / 2, cy: h * 0.62, r: 12, fill: 'var(--lsp-string)' }));
    s.appendChild(el('path', { d: 'M' + w / 2 + ' ' + h * 0.62 + ' Q' + (w * 0.8) + ' ' + h * 0.8 + ' ' + w + ' ' + h, fill: 'none', stroke: 'var(--lsp-string)', 'stroke-width': 4 }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['l-space.html'] = {
    prefix: 'lspace-walk',
    build: function (kit) {
      var r = seeded(56);
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 3400 + F;                       // where the string leaves
      var WELL = 1900;                          // the deepest point of the curve
      var eye = sh / 2, CH = sh + 380;
      var decor = [];

      // The cases stand either side, nearer the middle the nearer they are to
      // the well, as if the way through were being drawn in.
      for (var z = 500; z < END - F * 1.2; z += 560) {
        var pull = 1 - Math.min(1, Math.abs(z - WELL) / 1800);
        [-1, 1].forEach(function (side) {
          decor.push(kit.item(bentCase(r, 540, CH), { x: side * (560 - pull * 150), z: z + 270, w: 540, h: CH,
            turn: side < 0 ? kit.LEFT : kit.RIGHT }));
        });
      }
      decor.push(kit.item(post(120, 420), { x: -90, z: 260, w: 120, h: 420 }));

      var page = kit.screen(kit.page, 'L-Space’s own page, where the string leaves');
      var leaf = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'lspace-walk-leaf' });

      var stops = [
        kit.stop({ name: 'where the string is tied, at the way in', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'between the cases, where the shelves start to bend', spot: { x: 0, z: WELL - 900 } }),
        kit.stop({ name: 'over the well, where every line bends in towards you', spot: { x: 0, z: WELL } }),
        kit.stop({ name: 'where the string leaves, with the room’s own page', spot: { x: 0, z: END - F }, link: page }, leaf)
      ];

      return {
        cls: 'lspace-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Follow the string: its own page is where it leaves, at the far end.',
        bounds: function () { return { x: [-260, 260], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -5000, 5000, near, far, kit.ink('--lsp-void'));
          // The curvature, drawn as rings closing in on the well.
          var shelf = kit.ink('--lsp-shelf'), well = kit.ink('--lsp-well');
          for (var k = 9; k >= 1; k--) {
            kit.oval(g, 0, WELL, k * 260, k * 200, shelf, 0.16);
            kit.oval(g, 0, WELL, k * 260 - 16, k * 200 - 12, k < 4 ? well : kit.ink('--lsp-void'), 1);
          }
          // The string, the one straight thing, from the post to the page.
          kit.quad(g, -4, 4, 300, END, kit.ink('--lsp-string'));
        }
      };
    }
  };
})();
