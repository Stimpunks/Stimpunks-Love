/* =============================================================================
   Volunteers, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1 of
   the rooms you can walk into, down the rest of the street.

   A CLOTH ON THE LOOM, HALF WOVEN (§130). The loom stands in the middle of a
   plain room with its back to the one window, so you come in on the weaver's
   side and the day comes towards you through the bare warp. The warp is our
   values, one undyed thread the same from one end of the cloth to the other;
   the weft is what each person brings, a band of its own dye, two rows to a
   band, and in every row the warp goes over the weft at every other thread
   and at the others in the next, so no band is drawn without the warp
   crossing it. The bands are the page's own, in its order; no two of one dye
   touch and there is no rainbow in them. The shuttle lies on the newest row
   where somebody put it down; it does not fly.

   THE LIGHT COMES THROUGH THE BARE WARP, AND ONLY IN THE DRAWING: it lies in
   stripes on the floor in front of the loom, and nowhere near a word. The
   room's own page hangs on the back wall to one side of the window, on flat
   undyed linen in a wooden frame, with nothing striped or lit behind it (the
   Community Center's rule). There is no form here: the volunteer form is on
   stimpunks.org, linked from the page's own words.

   NOTHING MOVES, AT ANY SETTING. Every colour is one §130 declares, by name.
   It keeps nothing, sends nothing and fetches nothing; its page arrives
   through Paper Street's screen(). tools/make-paper-street.py holds each of
   those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  // The page's bands, newest row first under the bare warp, as it draws them.
  var BANDS = ['--vol-madder', '--vol-woad', '--vol-weld', '--vol-cochineal', '--vol-lichen', '--vol-walnut', '--vol-indigo',
               '--vol-onion', '--vol-logwood', '--vol-weld', '--vol-madder', '--vol-lichen', '--vol-woad', '--vol-onion'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }
  function sized(s, w, h) { s.setAttribute('width', w); s.setAttribute('height', h); return s; }
  function rect(s, x, y, w, h, fill) { s.appendChild(el('rect', { x: x, y: y, width: w, height: h, fill: 'var(' + fill + ')' })); }

  // The loom, seen from the weaver's side: two posts and a beam of wood, the
  // warp strung from the top beam to the cloth beam, the cloth woven up to
  // halfway, and above it the bare warp with the day behind it.
  function loom(w, h) {
    var s = svg(w, h), post = 46, top = 40, beam = 54, foot = h - 120;
    var x0 = post + 30, x1 = w - post - 30, clothTop = top + beam + (foot - top - beam) * 0.46;
    rect(s, 0, top, post, h - top, '--vol-wood');
    rect(s, w - post, top, post, h - top, '--vol-wood');
    rect(s, -20, top, w + 40, beam, '--vol-wood');
    rect(s, 0, foot, w, 60, '--vol-wood');
    [[post / 2, top + beam / 2], [w - post / 2, top + beam / 2], [post / 2, foot + 30], [w - post / 2, foot + 30]].forEach(function (p) {
      s.appendChild(el('circle', { cx: p[0], cy: p[1], r: 10, fill: 'var(--vol-knot)' }));
    });
    var n = 44, step = (x1 - x0) / n, rowH = 14;
    // The cloth, a band of each dye, two rows to a band, from the cloth beam up.
    var rows = BANDS.length * 2, y = foot;
    for (var r = 0; r < rows && y - rowH >= clothTop; r++) {
      var dye = BANDS[BANDS.length - 1 - Math.floor(r / 2)];
      y -= rowH;
      rect(s, x0, y, x1 - x0, rowH, dye);
      // Over at every other thread, and at the others in the next row.
      for (var i = r % 2; i < n; i += 2) rect(s, x0 + i * step + step * 0.22, y + 1, step * 0.56, rowH - 2, '--vol-warp');
    }
    // The bare warp above the newest row, straight up to the beam.
    for (var j = 0; j < n; j++) rect(s, x0 + j * step + step * 0.3, top + beam, step * 0.4, y - top - beam, '--vol-warp');
    // The shuttle, put down on the newest row, its bobbin wound in the warp's
    // own undyed thread.
    var sy = y - 34;
    s.appendChild(el('path', { d: 'M' + (w * 0.3) + ' ' + (sy + 16) + ' Q' + (w * 0.42) + ' ' + sy + ' ' + (w * 0.54) + ' ' + (sy + 16) + ' Q' + (w * 0.42) + ' ' + (sy + 32) + ' ' + (w * 0.3) + ' ' + (sy + 16) + ' Z', fill: 'var(--vol-wood)' }));
    rect(s, w * 0.39, sy + 10, w * 0.06, 12, '--vol-warp');
    return s;
  }

  // The back wall: plain plaster, the one window, the day in it. The light is
  // only ever the window's, here and on the floor in front of the loom.
  function backWall(w, h, win, ww, wh) {
    var s = svg(w, h);
    rect(s, 0, 0, w, h, '--vol-wall');
    var wx = w / 2 + win - ww / 2, wy = h - wh - 260;
    rect(s, wx - 24, wy - 24, ww + 48, wh + 48, '--vol-wood');
    rect(s, wx, wy, ww, wh, '--vol-sky');
    rect(s, wx + ww * 0.08, wy + wh * 0.08, ww * 0.84, wh * 0.84, '--vol-day');
    rect(s, wx + ww / 2 - 9, wy, 18, wh, '--vol-wood');
    rect(s, wx, wy + wh / 2 - 9, ww, 18, '--vol-wood');
    rect(s, wx - 40, wy + wh + 24, ww + 80, 26, '--vol-wood');
    rect(s, 0, h - 30, w, 30, '--vol-thread');
    return s;
  }

  // A basket of skeins by the loom, each its own dye, wound and waiting.
  function basket(w, h) {
    var s = svg(w, h), skeins = ['--vol-woad', '--vol-weld', '--vol-madder', '--vol-lichen', '--vol-logwood'];
    skeins.forEach(function (d, i) {
      s.appendChild(el('ellipse', { cx: w * (0.18 + i * 0.16), cy: h * 0.42 - (i % 2) * 26, rx: w * 0.12, ry: h * 0.2, fill: 'var(' + d + ')' }));
    });
    s.appendChild(el('path', { d: 'M0 ' + (h * 0.42) + ' H' + w + ' L' + (w * 0.88) + ' ' + h + ' H' + (w * 0.12) + ' Z', fill: 'var(--vol-thread)' }));
    for (var y = h * 0.5; y < h; y += 26) rect(s, w * 0.06, y, w * 0.88, 6, '--vol-wood');
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['volunteers.html'] = {
    prefix: 'vol-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var END = 2600 + F;                       // the back wall
      var LOOM = 1500;                          // where the loom stands, in the middle of the room
      var eye = sh / 2, k = eye / 520;
      var WIN = -700;                           // the window, behind the loom
      var PAGE = 760;                           // the page, on the wall to the window's right
      var decor = [];
      var put = function (s, w, h, o) {
        o.w = w * k; o.h = h * k; o.y = (o.y || 0) * k;
        return kit.item(sized(s, o.w, o.h), o);
      };

      var wallH = Math.max(1500, sh + 800);
      decor.push(kit.item(backWall(4200, wallH, WIN, 900, 1100), { x: 0, z: END + 30, w: 4200, h: wallH }));
      var loomIt = put(loom(1500, 1250), 1500, 1250, { x: WIN, z: LOOM });
      decor.push(loomIt);
      decor.push(put(basket(420, 260), 420, 260, { x: WIN + 620 * k + 260, z: LOOM - 120 }));

      var page = kit.screen(kit.page, 'The Volunteers room’s own page, on linen on the back wall');
      var linen = kit.item(page, { x: PAGE, z: END, w: sw, h: sh, cls: 'vol-walk-linen' });

      var stops = [
        kit.stop({ name: 'inside the door, the loom in front of you with its back to the window', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the loom, on the weaver’s side, the day coming through the bare warp', spot: kit.front(loomIt, LOOM - 300) }, loomIt),
        kit.stop({ name: 'at the back wall, with the room’s own page on undyed linen', spot: { x: PAGE, z: END - F }, link: page }, linen)
      ];

      return {
        cls: 'vol-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The loom stands in front of the window; its own page is on linen on the back wall, to the window’s right.',
        bounds: function () { return { x: [-1000, PAGE + 100], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--vol-linen'));
          // Boards, the long way, scored in the thread's colour.
          var seam = kit.ink('--vol-thread');
          for (var x = -2400; x < 2400; x += 150) kit.quad(g, x, x + 3, Math.max(from, 0), Math.min(to, END + 30), seam, 0.5);
          // The day through the bare warp, in stripes on the floor in front of
          // the loom, and nowhere near a word.
          var day = kit.ink('--vol-day');
          var lw = 1500 * k;
          for (var s = -lw / 2 + 60 * k; s < lw / 2 - 60 * k; s += 34 * k) kit.quad(g, WIN + s, WIN + s + 12 * k, LOOM - 760, LOOM - 20, day, 0.8);
        }
      };
    }
  };
})();
