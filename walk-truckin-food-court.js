/* =============================================================================
   Truckin' Food Court, walked into on Paper Street through its gate in the
   fence. Ryan's ask, 2026-11-04: round 1 of the rooms still to be walked into.

   IT IS THE TRUCK STOP'S WORLD AND NOBODY ELSE'S (§97): an outdoor food court
   in the middle of the day, food trucks parked down both sides of a lot of pale
   concrete, and a covered porch of tables across the far end. THE LIGHT COMES
   THROUGH THE AWNINGS: every truck has its awning out over its hatch, its own
   colour in stripes with the canvas, and the sun through the canvas lays those
   stripes on the ground in front of it. Everywhere between the trucks the lot
   is plain sun, so ALL THE COLOUR AT THE TRUCK STOP IS UNDER AN AWNING. Each
   awning's two colours are the ones the room's own data gives that truck, and
   no two trucks share them.

   THE STREET HAS NO OTHER STRIPES OF LIGHT, and these stay a colour each with
   no dark between them: white bars would be the Community Center's old blind
   put back up. Nothing is priced, because nothing here is for sale. The room's
   own page is on the board under the porch roof, on paper, with no stripe
   under its words.

   NOTHING TILTS AND NOTHING MOVES: the trucks are parked. Every colour is one
   the room declares, by name. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Paper Street's screen().
   tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  // Each truck's awning, as data/truckin-food-court.json gives it.
  var TRUCKS = [
    ['tacos', '--tks-marigold'], ['banh-mi', '--tks-jade'], ['ramen', '--tks-vermilion'],
    ['treats', '--tks-sky'], ['cooler', '--tks-plum']
  ];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // A truck side on, its hatch open and its awning out: the awning's stripes
  // in its own colour and the canvas, and the same stripes lying across the
  // counter under it. Nothing is written on it here; its board is the page's.
  function truck(w, h, ink) {
    var s = svg(w, h), body = 110, floor = h - 70;
    s.appendChild(el('rect', { x: 0, y: body, width: w, height: floor - body, rx: 26, fill: 'var(--tks-white)' }));
    s.appendChild(el('rect', { x: w * 0.06, y: body + 30, width: w * 0.16, height: 120, rx: 14, fill: 'var(--tks-day)' }));
    var hx0 = w * 0.3, hx1 = w * 0.92, hy = body + 70;
    s.appendChild(el('rect', { x: hx0, y: hy, width: hx1 - hx0, height: 190, fill: 'var(--tks-kitchen)' }));
    // The awning out over the hatch.
    var n = 10, sw = (hx1 - hx0 + 60) / n;
    for (var i = 0; i < n; i++) {
      s.appendChild(el('path', { d: 'M' + (hx0 - 30 + i * sw) + ' ' + (body + 10) + ' h' + sw + ' l' + (sw * 0.1) + ' 70 h' + (-sw) + ' Z',
        fill: i % 2 ? 'var(--tks-canvas)' : 'var(' + ink + ')' }));
    }
    // The counter, with the awning's stripes lying on it.
    s.appendChild(el('rect', { x: hx0 - 10, y: hy + 190, width: hx1 - hx0 + 20, height: 26, fill: 'var(--tks-steel)' }));
    for (i = 0; i < n; i++) {
      s.appendChild(el('rect', { x: hx0 - 10 + i * (hx1 - hx0 + 20) / n, y: hy + 190, width: (hx1 - hx0 + 20) / n, height: 26, fill: i % 2 ? 'var(--tks-canvas)' : 'var(' + ink + ')', 'fill-opacity': '0.6' }));
    }
    [w * 0.18, w * 0.78].forEach(function (x) {
      s.appendChild(el('circle', { cx: x, cy: floor, r: 56, fill: 'var(--tks-roof)' }));
      s.appendChild(el('circle', { cx: x, cy: floor, r: 24, fill: 'var(--tks-steel)' }));
    });
    return s;
  }

  // The covered porch across the end: a roof, posts, tables and benches in
  // plank, and the board under the roof that the page is on.
  function porch(w, h, sw, sh) {
    var s = svg(w, h), m = w / 2, floor = h;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 80, fill: 'var(--tks-roof)' }));
    for (var x = 30; x < w; x += (w - 60) / 4) s.appendChild(el('rect', { x: x - 14, y: 80, width: 28, height: floor - 80, fill: 'var(--tks-plank)' }));
    s.appendChild(el('rect', { x: m - sw / 2 - 30, y: floor - sh - 140, width: sw + 60, height: sh + 60, fill: 'var(--tks-fence)' }));
    [m - sw / 2 - 360, m + sw / 2 + 60].forEach(function (x) {
      s.appendChild(el('rect', { x: x, y: floor - 160, width: 300, height: 24, fill: 'var(--tks-plank)' }));
      s.appendChild(el('rect', { x: x + 30, y: floor - 136, width: 18, height: 136, fill: 'var(--tks-plank)' }));
      s.appendChild(el('rect', { x: x + 252, y: floor - 136, width: 18, height: 136, fill: 'var(--tks-plank)' }));
      s.appendChild(el('rect', { x: x - 20, y: floor - 90, width: 340, height: 16, fill: 'var(--tks-plank)' }));
    });
    return s;
  }

  // The trees past the fence.
  function trees(w, h) {
    var s = svg(w, h);
    for (var x = 60; x < w; x += 170) s.appendChild(el('circle', { cx: x, cy: h * 0.5 + (x % 3) * 20, r: 110, fill: 'var(--tks-trees)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['truckin-food-court.html'] = {
    prefix: 'tks-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 900), sh = kit.H - 24;
      var END = 3000 + F;                      // the porch across the far end
      var AISLE = 760;                         // from the middle of the lot to the trucks' hatches
      var eye = sh / 2 + 110;
      var decor = [], parked = [];

      var TW = 900, TH = 560;
      TRUCKS.forEach(function (t, i) {
        var side = i % 2 ? 1 : -1, z = 700 + i * 520;
        var it = kit.item(truck(TW, TH, t[1]), { x: side * AISLE, z: z, w: TW, h: TH, turn: side < 0 ? kit.LEFT : kit.RIGHT });
        it.ink = t[1];
        decor.push(it); parked.push(it);
      });
      decor.push(kit.item(trees(4000, 700), { x: 0, z: END + 900, w: 4000, h: 700 }));
      var PW = sw + 900, PH = sh + 340;
      decor.push(kit.item(porch(PW, PH, sw, sh), { x: 0, z: END + 20, w: PW, h: PH }));

      var page = kit.screen(kit.page, 'Truckin’ Food Court’s own page, on the board under the porch roof');
      var board = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: 110, cls: 'tks-walk-board' });

      var stops = [
        kit.stop({ name: 'just through the gate, on the lot in plain sun', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the first truck’s hatch, its awning’s stripes lying on the ground in front', spot: kit.front(parked[0], 1000) }, parked[0]),
        kit.stop({ name: 'at the ramen truck, under its own awning', spot: kit.front(parked[2], 1000) }, parked[2]),
        kit.stop({ name: 'under the porch roof, with the room’s own page on the board', spot: { x: 0, z: END - F }, link: page }, board)
      ];

      return {
        cls: 'tks-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Trucks down both sides, and the room’s own page on the board under the porch roof at the end.',
        bounds: function () { return { x: [-AISLE + 160, AISLE - 160], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--tks-lot'));
          // The light under each awning on the ground in front of its truck:
          // its own colour in stripes with the canvas's, and nothing dark
          // between them. Everywhere else, plain sun on concrete.
          var canvas = kit.ink('--tks-canvas');
          parked.forEach(function (t) {
            var x0 = t.x < 0 ? t.x : t.x - 260, ink = kit.ink(t.ink);
            for (var k = 0; k < 10; k++) {
              var z0 = t.z - TW / 2 + 150 + k * 60;
              kit.quad(g, x0, x0 + 260, z0, z0 + 60, k % 2 ? canvas : ink, 0.45);
            }
          });
          // The expansion joints in the concrete.
          var joint = kit.ink('--tks-fence');
          for (var z = 400; z < END; z += 400) kit.quad(g, -AISLE, AISLE, z - 2, z + 2, joint, 0.35);
        }
      };
    }
  };
})();
