/* =============================================================================
   Words, Bud, Beats, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round 1 of the rooms you can walk into, down the rest of the street.

   IT IS KRISTINA BROOKE'S ROOM AND HER WORLD (§103), and this is OURS: a
   drawing of her room for Paper Street, in the colours her room declares and
   nothing else, which changes nothing on her page and is hers to keep or send
   back. Everything in it comes out of her page's own words and drawings: an
   intimate salon, "low desert dusk through one west window, falling across the
   far wall and throwing every shadow east". So the west window is in the
   left-hand wall, the mesa, the saguaro and the sun going down in it, and on
   its sill the monstera in its clay pot, the stacked books, the glass jar, the
   small brass bell and the succulent; the window's light lies on the floor in
   front of it and on a patch of the far wall, and her own page hangs in that
   patch; the microphone stands on its stand in the corner, decorative, and
   the chair with its wood frame and cotton cushions waits by it. Every shadow
   on the floor falls east, away from the window. Where her page says nothing,
   the room is plain.

   NOTHING MOVES BY ITSELF, and no smoke rises. Every colour is one her room
   declares, by name. It keeps nothing, sends nothing and fetches nothing; her
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
  function sized(s, w, h) { s.setAttribute('width', w); s.setAttribute('height', h); return s; }
  function rect(s, x, y, w, h, fill, rx) { s.appendChild(el('rect', { x: x, y: y, width: w, height: h, rx: rx || 0, fill: 'var(' + fill + ')' })); }

  // The left-hand wall with the west window in it: dusk in three bands, the
  // sun low on the mesa, a saguaro, the wooden frame, and the sill with her
  // things on it.
  function westWall(w, h) {
    var s = svg(w, h), ww = 900, wh = 700, wx = (w - ww) / 2, wy = h - wh - 520;
    rect(s, 0, 0, w, h, '--wbb-dusk');
    rect(s, wx - 40, wy - 40, ww + 80, wh + 80, '--wbb-frame');
    rect(s, wx, wy, ww, wh * 0.4, '--wbb-sky-high');
    rect(s, wx, wy + wh * 0.4, ww, wh * 0.3, '--wbb-sky-mid');
    rect(s, wx, wy + wh * 0.7, ww, wh * 0.3, '--wbb-sky-low');
    s.appendChild(el('circle', { cx: wx + ww * 0.62, cy: wy + wh * 0.78, r: 70, fill: 'var(--wbb-sun)' }));
    s.appendChild(el('path', { d: 'M' + wx + ' ' + (wy + wh) + ' V' + (wy + wh * 0.82) + ' L' + (wx + ww * 0.2) + ' ' + (wy + wh * 0.8) +
      ' L' + (wx + ww * 0.28) + ' ' + (wy + wh * 0.72) + ' H' + (wx + ww * 0.52) + ' L' + (wx + ww * 0.58) + ' ' + (wy + wh * 0.84) +
      ' H' + (wx + ww) + ' V' + (wy + wh) + ' Z', fill: 'var(--wbb-mesa)' }));
    // The saguaro, arms up.
    var sx = wx + ww * 0.82, base = wy + wh;
    rect(s, sx - 16, base - 240, 32, 240, '--wbb-saguaro', 16);
    rect(s, sx - 70, base - 170, 26, 90, '--wbb-saguaro', 13);
    rect(s, sx - 70, base - 104, 70, 24, '--wbb-saguaro', 12);
    rect(s, sx + 44, base - 200, 26, 80, '--wbb-saguaro', 13);
    rect(s, sx, base - 146, 70, 24, '--wbb-saguaro', 12);
    // The frame's bars, and the sill.
    rect(s, wx + ww / 2 - 12, wy, 24, wh, '--wbb-frame');
    rect(s, wx - 70, wy + wh + 30, ww + 140, 40, '--wbb-sill');
    var sill = wy + wh + 30;
    // The monstera in its clay pot, its leaves split.
    s.appendChild(el('path', { d: 'M' + (wx + 40) + ' ' + (sill - 130) + ' H' + (wx + 190) + ' L' + (wx + 170) + ' ' + sill + ' H' + (wx + 60) + ' Z', fill: 'var(--wbb-clay)' }));
    rect(s, wx + 34, sill - 140, 162, 22, '--wbb-clay-dark');
    [[-60, -180], [40, -230], [120, -170], [10, -300]].forEach(function (p, i) {
      var cx = wx + 115 + p[0], cy = sill - 140 + p[1];
      s.appendChild(el('path', { d: 'M' + (wx + 115) + ' ' + (sill - 140) + ' Q' + (cx - 10) + ' ' + (cy + 80) + ' ' + cx + ' ' + cy, fill: 'none', stroke: 'var(--wbb-leaf-dark)', 'stroke-width': 8 }));
      s.appendChild(el('ellipse', { cx: cx, cy: cy, rx: 70, ry: 52, fill: 'var(' + (i % 2 ? '--wbb-leaf-dark' : '--wbb-leaf') + ')' }));
      rect(s, cx - 4, cy - 50, 8, 34, '--wbb-dusk');
    });
    // The stacked books, the glass jar, the small brass bell, the succulent.
    ['--wbb-kraft', '--wbb-sage', '--wbb-rose', '--wbb-cotton'].forEach(function (c, i) { rect(s, wx + 300 + (i % 2) * 14, sill - 34 * (i + 1), 190, 32, c, 3); });
    rect(s, wx + 540, sill - 150, 100, 150, '--wbb-glass', 14);
    rect(s, wx + 548, sill - 166, 84, 22, '--wbb-brass', 6);
    s.appendChild(el('path', { d: 'M' + (wx + 690) + ' ' + sill + ' Q' + (wx + 690) + ' ' + (sill - 90) + ' ' + (wx + 730) + ' ' + (sill - 96) + ' Q' + (wx + 770) + ' ' + (sill - 90) + ' ' + (wx + 770) + ' ' + sill + ' Z', fill: 'var(--wbb-brass)' }));
    s.appendChild(el('path', { d: 'M' + (wx + 820) + ' ' + (sill - 70) + ' H' + (wx + 920) + ' L' + (wx + 908) + ' ' + sill + ' H' + (wx + 832) + ' Z', fill: 'var(--wbb-clay)' }));
    for (var k = -2; k <= 2; k++) s.appendChild(el('ellipse', { cx: wx + 870 + k * 18, cy: sill - 84 - Math.abs(k) * -6, rx: 14, ry: 34, fill: 'var(--wbb-succ)' }));
    rect(s, 0, h - 40, w, 40, '--wbb-rail');
    return s;
  }

  // The far wall: dusk, and the patch the west window lights, slanted, where
  // her page hangs.
  function farWall(w, h, pw, ph) {
    var s = svg(w, h), cx = w / 2;
    rect(s, 0, 0, w, h, '--wbb-dusk');
    s.appendChild(el('path', { d: 'M' + (cx - pw / 2 - 260) + ' ' + (h - 40) + ' L' + (cx - pw / 2 - 120) + ' ' + (h - ph - 220) +
      ' L' + (cx + pw / 2 + 260) + ' ' + (h - ph - 160) + ' L' + (cx + pw / 2 + 380) + ' ' + (h - 40) + ' Z', fill: 'var(--wbb-wall)' }));
    rect(s, 0, h - 40, w, 40, '--wbb-rail');
    return s;
  }

  // The microphone on its stand, there to look at, and the chair beside it:
  // a wood frame, cotton cushions.
  function corner(w, h) {
    var s = svg(w, h), mx = w * 0.78;
    rect(s, mx - 60, h - 18, 120, 18, '--wbb-felt', 9);
    rect(s, mx - 6, h * 0.22, 12, h * 0.78 - 18, '--wbb-felt');
    s.appendChild(el('path', { d: 'M' + mx + ' ' + (h * 0.22) + ' L' + (mx - 70) + ' ' + (h * 0.1), stroke: 'var(--wbb-felt)', 'stroke-width': 12 }));
    rect(s, mx - 104, h * 0.02, 52, 96, '--wbb-groove', 26);
    rect(s, mx - 104, h * 0.02 + 64, 52, 10, '--wbb-brass');
    // The chair.
    var cx = w * 0.06, cw = w * 0.5, seat = h * 0.6;
    rect(s, cx, h * 0.24, 24, h * 0.76, '--wbb-frame');
    rect(s, cx + cw - 24, seat - 40, 24, h - seat + 40, '--wbb-frame');
    rect(s, cx + 24, h * 0.28, cw * 0.86, seat - h * 0.28 - 20, '--wbb-cotton', 22);
    rect(s, cx + 10, seat - 20, cw, 60, '--wbb-cotton', 18);
    rect(s, cx, seat + 40, cw, 22, '--wbb-frame');
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['words-bud-beats.html'] = {
    prefix: 'wbb-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var END = 2400 + F;                       // the far wall
      var SIDE = 820;                           // the west wall is the left-hand one
      var eye = sh / 2, k = eye / 520;
      var decor = [];
      var put = function (s, w, h, o) {
        o.w = w * k; o.h = h * k; o.y = (o.y || 0) * k;
        return kit.item(sized(s, o.w, o.h), o);
      };

      var wallH = Math.max(1400, sh + 700);
      decor.push(kit.item(farWall(3600, wallH, sw, sh), { x: 0, z: END + 20, w: 3600, h: wallH }));
      var WIN = 1500;
      var west = put(westWall(4400, 2000), 4400, 2000, { x: -SIDE, z: WIN, turn: kit.LEFT });
      decor.push(west);
      var cornerIt = put(corner(900, 900), 900, 900, { x: SIDE - 340, z: END - F * 0.9 - 200, turn: kit.RIGHT * 0.35 });
      decor.push(cornerIt);

      var page = kit.screen(kit.page, 'Words, Bud, Beats’ own page, on the far wall where the window’s light falls');
      var patch = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'wbb-walk-patch' });

      var stops = [
        kit.stop({ name: 'inside the door, the west window on your left and the dusk coming through it', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the west window, the sun low on the mesa and her things on the sill', spot: kit.front(west, 1400) }, west),
        kit.stop({ name: 'by the chair, the microphone on its stand in the corner, decorative', spot: kit.front(cornerIt, 900) }, cornerIt),
        kit.stop({ name: 'at the far wall, with her own page where the window’s light falls on it', spot: { x: 0, z: END - F }, link: page }, patch)
      ];

      return {
        cls: 'wbb-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The west window is on your left; her own page is on the far wall, where the window’s light falls.',
        bounds: function () { return { x: [-SIDE + 120, SIDE - 120], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--wbb-ground'));
          var rail = kit.ink('--wbb-rail');
          for (var x = -SIDE; x <= SIDE; x += 120) kit.quad(g, x, x + 4, Math.max(from, 0), Math.min(to, END + 20), rail, 0.9);
          // The window's light on the floor, thrown east across it.
          var mote = kit.ink('--wbb-mote');
          kit.quad(g, -SIDE, -SIDE + 700, WIN - 420, WIN + 420, mote, 0.14);
          // Every shadow falls east: the chair's and the stand's, off to the
          // right of where they stand.
          kit.oval(g, cornerIt.x + 260, cornerIt.z - 40, 260, 90, kit.ink('--wbb-vinyl'), 0.4);
        }
      };
    }
  };
})();
