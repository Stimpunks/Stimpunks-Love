/* =============================================================================
   The Scalable Feast Ballroom, walked into on Paper Street. Ryan's brief,
   2026-11-06: build it for Cel Street and Paper Street.

   IT IS THE BALLROOM'S WORLD AND NOBODY ELSE'S (§150), cut out of card: a
   hall far longer and far taller than the stage, ivory walls with gilt
   pilasters and tall arched mirrors, chandeliers hanging high down the middle
   on long chains, herringbone parquet underfoot, the long table down the
   middle of the floor, and at each end three canopies, each its own kind in
   its own cloth, each a living room with a sofa or chairs on a rug.

   THE HEIGHT IS THE ROOM. The walls go up far past the top of the stage and
   the chandeliers hang above where you are looking: look up (R) and the hall
   keeps going. The plaques that go down the page's height hang on the right
   wall at their own heights, the ceiling's highest.

   THE LIGHT IS FROM VERY HIGH UP AND THE ONLY SHADE IS THE SHADE YOU GO INTO:
   the hall is ivory and gilt and evenly bright, and the inside of every
   canopy is the pale of its cloth, the hall's light come through it.

   NOTHING MOVES AT ANY SETTING. Every colour is one §150 declares, by name. It
   keeps nothing, sends nothing and fetches nothing; its page arrives through
   Paper Street's screen(). tools/make-paper-street.py holds each of those.
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
  function v(name) { return 'var(--sfb-' + name + ')'; }

  // A long wall of the hall: ivory panelling, a gilt rail over the wainscot,
  // pilasters with gilt capitals, a tall arched mirror in every other bay and
  // the gilt cornice along the top.
  function hallWall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: v('wall') }));
    var bay = 520;
    for (var x = 0, i = 0; x < w; x += bay, i++) {
      if (i % 2 === 1) {
        var mx = x + 70, mw = bay - 140, top = h * 0.32, bot = h - 260;
        s.appendChild(el('path', { d: 'M' + mx + ' ' + bot + ' V' + top + ' A' + (mw / 2) + ' ' + (mw / 2 * 0.8) + ' 0 0 1 ' + (mx + mw) + ' ' + top + ' V' + bot + ' Z',
          fill: v('glass'), stroke: v('gilt'), 'stroke-width': 18 }));
        s.appendChild(el('path', { d: 'M' + (mx + 60) + ' ' + (bot - 40) + ' V' + (top + 40), stroke: v('crystal'), 'stroke-width': 10 }));
      }
      s.appendChild(el('rect', { x: x - 40, y: 0, width: 80, height: h, fill: v('panel') }));
      s.appendChild(el('rect', { x: x - 30, y: 0, width: 8, height: h, fill: v('gilt') }));
      s.appendChild(el('rect', { x: x + 22, y: 0, width: 8, height: h, fill: v('gilt') }));
      s.appendChild(el('rect', { x: x - 56, y: 150, width: 112, height: 60, fill: v('gilt'), stroke: v('gilt-dark'), 'stroke-width': 4 }));
    }
    s.appendChild(el('rect', { x: 0, y: h - 220, width: w, height: 220, fill: v('panel') }));
    for (x = 20; x < w; x += 260) s.appendChild(el('rect', { x: x, y: h - 196, width: 220, height: 160, fill: 'none', stroke: v('gilt'), 'stroke-width': 6 }));
    s.appendChild(el('rect', { x: 0, y: h - 226, width: w, height: 12, fill: v('gilt') }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 120, fill: v('gilt') }));
    for (x = 20; x < w; x += 56) s.appendChild(el('ellipse', { cx: x, cy: 62, rx: 18, ry: 26, fill: v('gilt-hi'), stroke: v('gilt-dark'), 'stroke-width': 3 }));
    s.appendChild(el('rect', { x: 0, y: 112, width: w, height: 10, fill: v('gilt-dark') }));
    return s;
  }

  // The far wall: the same panelling, a pair of tall mirrors either side and
  // the painted sky of the ceiling seen from below at its top edge.
  function farWall(w, h) {
    var s = hallWall(w, h);
    s.appendChild(el('ellipse', { cx: w / 2, cy: 0, rx: w * 0.3, ry: 300, fill: v('sky'), stroke: v('gilt'), 'stroke-width': 26 }));
    [[0.4, 120, 70], [0.56, 80, 110], [0.5, 200, 60]].forEach(function (c) {
      s.appendChild(el('ellipse', { cx: w * c[0], cy: c[1], rx: c[2] * 1.6, ry: c[2] * 0.5, fill: v('cloud') }));
    });
    return s;
  }

  // A chandelier on its chain: a gilt stem and knops, two tiers of arms each
  // ending in a crystal globe, beads swagged between them and drops below.
  function chandelier(w, h) {
    var s = svg(w, h), cx = w / 2, low = h - 260;
    for (var y = 0, k = 0; y < low - 90; y += 22, k++) {
      s.appendChild(el('ellipse', { cx: cx, cy: y + 11, rx: k % 2 ? 5 : 9, ry: 12, fill: 'none', stroke: k % 2 ? v('gilt-dark') : v('gilt'), 'stroke-width': 4 }));
    }
    s.appendChild(el('rect', { x: cx - 8, y: low - 90, width: 16, height: 220, fill: v('gilt'), stroke: v('gilt-dark'), 'stroke-width': 2 }));
    [[low - 70, 20], [low - 10, 30], [low + 70, 34], [low + 130, 24]].forEach(function (kn) {
      s.appendChild(el('ellipse', { cx: cx, cy: kn[0], rx: kn[1], ry: kn[1] * 0.5, fill: v('gilt'), stroke: v('gilt-dark'), 'stroke-width': 2 }));
    });
    [[low + 30, 120, 6, 40], [low + 110, 170, 9, 46]].forEach(function (t) {
      var ty = t[0], reach = t[1], n = t[2], lift = t[3], ends = [];
      for (var i = 0; i < n; i++) {
        var u = i / (n - 1), ex = cx - reach + 2 * reach * u, ey = ty - lift - (1 - Math.abs(2 * u - 1)) * 12;
        ends.push([ex, ey]);
        s.appendChild(el('path', { d: 'M' + cx + ' ' + ty + ' C' + (cx + (ex - cx) / 2) + ' ' + (ty + 24) + ' ' + ex + ' ' + (ty + 12) + ' ' + ex + ' ' + (ey + 14), fill: 'none', stroke: v('gilt'), 'stroke-width': 6, 'stroke-linecap': 'round' }));
        s.appendChild(el('circle', { cx: ex, cy: ey, r: 13, fill: v('crystal'), stroke: v('glass-edge'), 'stroke-width': 2 }));
        s.appendChild(el('path', { d: 'M' + ex + ' ' + (ey + 22) + ' l6 14 l-6 14 l-6 -14 Z', fill: v('crystal'), stroke: v('glass-edge'), 'stroke-width': 1.5 }));
      }
      for (var j = 0; j + 1 < ends.length; j++) {
        for (var b = 1; b < 6; b++) {
          var f = b / 6, bx = ends[j][0] + (ends[j + 1][0] - ends[j][0]) * f, by = ends[j][1] + 24 + 26 * (1 - (2 * f - 1) * (2 * f - 1));
          s.appendChild(el('circle', { cx: bx, cy: by, r: 3.6, fill: v('crystal'), stroke: v('glass-edge'), 'stroke-width': 1 }));
        }
      }
    });
    s.appendChild(el('path', { d: 'M' + cx + ' ' + (low + 150) + ' l10 22 l-10 26 l-10 -26 Z', fill: v('crystal'), stroke: v('glass-edge'), 'stroke-width': 2 }));
    return s;
  }

  // The canopies. Each is its own kind in its own cloth, and the inside, seen
  // through the open front, is the pale of its cloth, with a sofa or chairs on
  // a rug in it.
  function seat(s, x, w, y, wing) {
    s.appendChild(el('rect', { x: x, y: y - (wing ? 110 : 80), width: w, height: wing ? 90 : 60, rx: 18, fill: v('velvet') }));
    s.appendChild(el('rect', { x: x - 10, y: y - 56, width: 26, height: 56, rx: 10, fill: v('velvet') }));
    s.appendChild(el('rect', { x: x + w - 16, y: y - 56, width: 26, height: 56, rx: 10, fill: v('velvet') }));
    s.appendChild(el('rect', { x: x + 10, y: y - 30, width: w - 20, height: 30, rx: 8, fill: v('plush') }));
    s.appendChild(el('circle', { cx: x + 34, cy: y - 50, r: 18, fill: v('cream') }));
    if (w > 160) s.appendChild(el('circle', { cx: x + w - 34, cy: y - 50, r: 18, fill: v('cream') }));
  }
  function rugAt(s, cx, w, y) {
    s.appendChild(el('ellipse', { cx: cx, cy: y + 10, rx: w / 2, ry: 20, fill: v('rug') }));
    s.appendChild(el('ellipse', { cx: cx, cy: y + 10, rx: w / 2 - 16, ry: 13, fill: 'none', stroke: v('rug-2'), 'stroke-width': 5 }));
  }
  function scallops(s, x0, x1, y, cloth) {
    for (var x = x0; x < x1; x += 40) s.appendChild(el('path', { d: 'M' + x + ' ' + y + ' q20 32 40 0 Z', fill: v(cloth) }));
  }
  var TENT = {
    cabana: function (s, w, h) {
      s.appendChild(el('rect', { x: 30, y: 120, width: w - 60, height: h - 120, fill: v('rose-pale') }));
      for (var x = 30, i = 0; x < w - 30; x += 40, i++) s.appendChild(el('rect', { x: x, y: 70, width: 40, height: 60, fill: i % 2 ? v('cream') : v('rose') }));
      scallops(s, 30, w - 30, 130, 'rose');
      [30, w - 30].forEach(function (sx, k) {
        var d = k ? -1 : 1;
        s.appendChild(el('path', { d: 'M' + sx + ' 130 L' + (sx + d * 90) + ' 130 Q' + (sx + d * 20) + ' ' + (h * 0.5) + ' ' + sx + ' ' + h + ' Z', fill: v('rose') }));
      });
      rugAt(s, w / 2, w - 140, h - 40);
      seat(s, 110, w - 220, h - 30);
    },
    pavilion: function (s, w, h) {
      s.appendChild(el('rect', { x: 50, y: 230, width: w - 100, height: h - 230, fill: v('teal-pale') }));
      s.appendChild(el('rect', { x: w / 2 - 8, y: 40, width: 16, height: h - 40, fill: v('gilt') }));
      s.appendChild(el('path', { d: 'M20 240 L' + (w / 2) + ' 40 L' + (w - 20) + ' 240 Z', fill: v('teal') }));
      scallops(s, 20, w - 20, 240, 'teal');
      s.appendChild(el('rect', { x: 20, y: 236, width: w - 40, height: 8, fill: v('gilt') }));
      s.appendChild(el('circle', { cx: w / 2, cy: 34, r: 14, fill: v('gilt'), stroke: v('gilt-dark'), 'stroke-width': 3 }));
      [50, w - 50].forEach(function (sx, k) {
        var d = k ? -1 : 1;
        s.appendChild(el('path', { d: 'M' + sx + ' 244 L' + (sx + d * 70) + ' 244 Q' + (sx + d * 14) + ' ' + (h * 0.66) + ' ' + sx + ' ' + h + ' Z', fill: v('teal') }));
      });
      rugAt(s, w / 2, w - 120, h - 40);
      s.appendChild(el('path', { d: 'M110 ' + (h - 30) + ' q' + (w / 2 - 110) + ' -120 ' + (w - 220) + ' 0 Z', fill: v('velvet') }));
      s.appendChild(el('rect', { x: 110, y: h - 60, width: w - 220, height: 30, rx: 10, fill: v('plush') }));
    },
    'four-poster': function (s, w, h) {
      s.appendChild(el('rect', { x: 40, y: 140, width: w - 80, height: h - 140, fill: v('plum-pale') }));
      [24, w - 40].forEach(function (px) {
        s.appendChild(el('rect', { x: px, y: 40, width: 16, height: h - 40, fill: v('gilt'), stroke: v('gilt-dark'), 'stroke-width': 3 }));
        s.appendChild(el('circle', { cx: px + 8, cy: 34, r: 14, fill: v('gilt') }));
      });
      s.appendChild(el('rect', { x: 10, y: 60, width: w - 20, height: 80, fill: v('plum') }));
      scallops(s, 10, w - 10, 140, 'plum');
      [40, w - 40].forEach(function (sx, k) {
        var d = k ? -1 : 1;
        s.appendChild(el('path', { d: 'M' + sx + ' 144 L' + (sx + d * 70) + ' 144 Q' + (sx + d * 6) + ' ' + (h * 0.5) + ' ' + (sx + d * 34) + ' ' + h + ' L' + sx + ' ' + h + ' Z', fill: v('plum') }));
      });
      rugAt(s, w / 2, w - 160, h - 40);
      seat(s, w / 2 - 120, 150, h - 30, true);
      s.appendChild(el('rect', { x: w / 2 + 50, y: h - 70, width: 110, height: 44, rx: 14, fill: v('plush') }));
    },
    bell: function (s, w, h) {
      s.appendChild(el('path', { d: 'M10 ' + h + ' C20 ' + (h * 0.35) + ' ' + (w / 2 - 60) + ' 60 ' + (w / 2) + ' 30 C' + (w / 2 + 60) + ' 60 ' + (w - 20) + ' ' + (h * 0.35) + ' ' + (w - 10) + ' ' + h + ' Z', fill: v('saffron') }));
      var dw = w * 0.56;
      s.appendChild(el('path', { d: 'M' + (w / 2 - dw / 2) + ' ' + h + ' L' + (w / 2 - dw / 2 + 24) + ' ' + (h * 0.36) + ' Q' + (w / 2) + ' ' + (h * 0.3) + ' ' + (w / 2 + dw / 2 - 24) + ' ' + (h * 0.36) + ' L' + (w / 2 + dw / 2) + ' ' + h + ' Z', fill: v('saffron-pale') }));
      s.appendChild(el('path', { d: 'M' + (w / 2 - dw / 2 + 20) + ' ' + (h * 0.37) + ' Q' + (w / 2) + ' ' + (h * 0.32) + ' ' + (w / 2 + dw / 2 - 20) + ' ' + (h * 0.37), fill: 'none', stroke: v('saffron'), 'stroke-width': 34, 'stroke-linecap': 'round' }));
      ['rose', 'teal', 'plum', 'saffron', 'sage', 'blue'].forEach(function (c, k) {
        s.appendChild(el('ellipse', { cx: w / 2, cy: h - 30, rx: dw / 2 - 20 - k * 14, ry: 22 - k * 3, fill: v(c) }));
      });
      seat(s, w / 2 - dw / 2 + 30, 90, h - 30, true);
      seat(s, w / 2 + dw / 2 - 120, 90, h - 30, true);
    },
    sail: function (s, w, h) {
      s.appendChild(el('rect', { x: 20, y: 120, width: 12, height: h - 120, fill: v('gilt') }));
      s.appendChild(el('rect', { x: w - 32, y: 60, width: 12, height: h - 60, fill: v('gilt') }));
      s.appendChild(el('path', { d: 'M26 120 Q' + (w / 2) + ' 170 ' + (w - 26) + ' 60 L' + (w / 2 + 20) + ' 230 Z', fill: v('sage') }));
      s.appendChild(el('path', { d: 'M26 120 L' + (w / 2 + 20) + ' 230 L' + (w - 26) + ' 60', fill: 'none', stroke: v('cream'), 'stroke-width': 4 }));
      rugAt(s, w / 2, w - 100, h - 40);
      s.appendChild(el('path', { d: 'M80 ' + (h - 30) + ' h' + (w - 200) + ' v-46 q-20 -50 -60 -40 h-' + (w - 300) + ' q-40 0 -40 36 Z', fill: v('velvet') }));
      s.appendChild(el('rect', { x: 100, y: h - 62, width: w - 250, height: 26, rx: 10, fill: v('plush') }));
      s.appendChild(el('ellipse', { cx: w - 110, cy: h - 50, rx: 46, ry: 30, fill: v('plum') }));
    },
    crown: function (s, w, h) {
      s.appendChild(el('path', { d: 'M40 ' + h + ' L70 160 H' + (w - 70) + ' L' + (w - 40) + ' ' + h + ' Z', fill: v('blue-pale') }));
      [0, 1].forEach(function (k) {
        var d = k ? -1 : 1, sx = k ? w - 40 : 40;
        s.appendChild(el('path', { d: 'M' + (w / 2) + ' 120 Q' + (sx + d * 40) + ' 140 ' + (sx - d * 10) + ' 220 Q' + (sx - d * 40) + ' ' + (h * 0.6) + ' ' + (sx - d * 6) + ' ' + h + ' L' + (sx + d * 70) + ' ' + h + ' Q' + (sx + d * 80) + ' ' + (h * 0.55) + ' ' + (sx + d * 70) + ' 330 Q' + (sx + d * 100) + ' 240 ' + (w / 2) + ' 120 Z', fill: v('blue') }));
        s.appendChild(el('circle', { cx: sx + d * 48, cy: 340, r: 12, fill: v('gilt') }));
      });
      s.appendChild(el('path', { d: 'M' + (w / 2 - 80) + ' 120 L' + (w / 2 - 70) + ' 40 L' + (w / 2 - 36) + ' 80 L' + (w / 2) + ' 20 L' + (w / 2 + 36) + ' 80 L' + (w / 2 + 70) + ' 40 L' + (w / 2 + 80) + ' 120 Z', fill: v('gilt'), stroke: v('gilt-dark'), 'stroke-width': 4 }));
      rugAt(s, w / 2, w - 160, h - 40);
      seat(s, w / 2 - 120, 240, h - 30);
    }
  };
  function canopy(kind, w, h) {
    var s = svg(w, h);
    TENT[kind](s, w, h);
    return s;
  }

  // A living room out in the hall: a rug and somewhere to sit.
  function livingRoom(kind, w, h) {
    var s = svg(w, h);
    rugAt(s, w / 2, w - 20, h - 40);
    if (kind === 'borne') {
      s.appendChild(el('path', { d: 'M40 ' + (h - 30) + ' q' + (w / 2 - 40) + ' -100 ' + (w - 80) + ' 0 Z', fill: v('velvet') }));
      s.appendChild(el('rect', { x: w / 2 - 16, y: h - 180, width: 32, height: 100, rx: 12, fill: v('velvet') }));
      s.appendChild(el('circle', { cx: w / 2, cy: h - 186, r: 22, fill: v('plush') }));
    } else if (kind === 'tete') {
      s.appendChild(el('path', { d: 'M40 ' + (h - 30) + ' v-50 q0 -40 40 -40 h' + (w - 160) + ' q40 0 40 30 v60 Z', fill: v('velvet') }));
      s.appendChild(el('path', { d: 'M' + (w / 2 - 10) + ' ' + (h - 110) + ' q-10 50 20 80', fill: 'none', stroke: v('plush'), 'stroke-width': 20, 'stroke-linecap': 'round' }));
    } else {
      seat(s, 50, w - 100, h - 30);
    }
    return s;
  }

  // The long table, side on: a white cloth to the floor, velvet chairs drawn
  // up behind it, gilt plates, crystal and covered dishes. No candles.
  function longTable(w, h) {
    var s = svg(w, h), top = h - 150;
    for (var x = 60; x < w - 40; x += 110) {
      s.appendChild(el('path', { d: 'M' + (x - 30) + ' ' + top + ' V' + (top - 120) + ' q30 -30 60 0 V' + top + ' Z', fill: v('velvet'), stroke: v('gilt'), 'stroke-width': 6 }));
    }
    s.appendChild(el('rect', { x: 0, y: top - 14, width: w, height: 18, fill: v('cream') }));
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: 150, fill: v('cream') }));
    for (x = 0; x < w; x += 40) s.appendChild(el('path', { d: 'M' + x + ' ' + h + ' q20 -16 40 0', fill: v('panel') }));
    for (x = 50; x < w - 30; x += 130) {
      s.appendChild(el('ellipse', { cx: x, cy: top - 18, rx: 34, ry: 10, fill: v('gilt') }));
      s.appendChild(el('path', { d: 'M' + (x - 26) + ' ' + (top - 20) + ' q26 -46 52 0 Z', fill: v('gilt'), stroke: v('gilt-dark'), 'stroke-width': 3 }));
      s.appendChild(el('path', { d: 'M' + (x + 52) + ' ' + (top - 16) + ' v-30 l-10 -16 h20 l-10 16', fill: 'none', stroke: v('glass-edge'), 'stroke-width': 3 }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['scalable-feast-ballroom.html'] = {
    prefix: 'sfb-walk',
    build: function (kit) {
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var HALL = 900, LEN = 6000;
      // The hall is far taller than the stage: look up and it keeps going, and
      // above the top of the walls is the ceiling.
      var eye = sh / 2, WH = Math.max(2000, Math.round(sh * 3.2)), decor = [];

      // The doors are at DOOR, well back from the near canopies, so that coming
      // in you see them and the hall going on past them.
      var DOOR = -1400, SEG = 1560;
      // Each long wall in lengths of three bays: one flat the length of the
      // hall is a layer too big for the browser to draw in 3D, and it draws
      // nothing at all rather than saying so.
      for (var wz = DOOR; wz < LEN + 200; wz += SEG) {
        decor.push(kit.item(hallWall(SEG, WH), { x: -HALL, z: wz + SEG / 2, w: SEG, h: WH, turn: kit.LEFT }));
        decor.push(kit.item(hallWall(SEG, WH), { x: HALL, z: wz + SEG / 2, w: SEG, h: WH, turn: kit.RIGHT }));
      }
      decor.push(kit.item(farWall(2 * HALL + 40, WH), { x: 0, z: LEN + 200, w: 2 * HALL + 40, h: WH }));

      // The chandeliers, hanging high down the middle: their foot is far above
      // the eye, and the chain runs up out of sight.
      var HANG = Math.round(sh * 1.1);
      [1300, 2400, 3500, 4600].forEach(function (z) {
        decor.push(kit.item(chandelier(420, WH - HANG), { x: 0, y: HANG, z: z, w: 420, h: WH - HANG }));
      });

      // The long table down the middle of the floor, side on, its cloth to the
      // floor, seen from either side of it.
      var tbl1 = kit.item(longTable(2200, 420), { x: -90, z: 3300, w: 2200, h: 420, turn: kit.LEFT });
      var tbl2 = kit.item(longTable(2200, 420), { x: 90, z: 3300, w: 2200, h: 420, turn: kit.RIGHT });
      decor.push(tbl1, tbl2);

      // The page, on the left wall just inside the doors, in a gilt frame.
      var page = kit.screen(kit.page, 'The Scalable Feast Ballroom’s own page, on the wall inside the doors');
      var hung = kit.item(page, { x: -HALL + 6, z: DOOR + 700, w: sw, h: sh, turn: kit.LEFT, cls: 'sfb-walk-page' });

      // The canopies: three at the near end and three at the far end, each a
      // living room, and the living rooms out in the hall between them.
      var CH = 980, CW = 640;
      var near = [['cabana', -560, 1500], ['pavilion', 0, 1850], ['four-poster', 560, 1500]];
      var far = [['bell', -560, 5400], ['sail', 0, 5650], ['crown', 560, 5780]];
      var tents = near.concat(far).map(function (t, i) {
        return kit.item(canopy(t[0], CW, CH), { x: t[1], z: t[2], w: CW, h: CH });
      });
      var rooms = [['conversation', -420, 2300], ['tete', 420, 2300], ['settee', -420, 4900], ['borne', 420, 4900]].map(function (r) {
        return kit.item(livingRoom(r[0], 420, 300), { x: r[1], z: r[2], w: 420, h: 300 });
      });
      decor.push.apply(decor, tents);
      decor.push.apply(decor, rooms);

      // The page's own words where they belong: each canopy's card standing in
      // front of it, each living room's card beside it, the floor and the feast
      // at the head of the table, the height's plaques up the right wall.
      var cards = tents.map(function (t, i) {
        return kit.lift(page, '.sfb-tent', { n: i, w: 300, x: t.x, y: 70, z: t.z - 30, cls: 'sfb-walk-card' });
      });
      var roomCards = rooms.map(function (r, i) {
        return kit.lift(page, '.sfb-room', { n: i, w: 300, x: r.x, z: r.z - 60, cls: 'sfb-walk-card' });
      });
      var middle = kit.lift(page, '.sfb-middle', { w: 520, x: 0, z: 2180, cls: 'sfb-walk-card' });
      var why = kit.lift(page, '.sfb-part', { n: 1, w: 640, x: HALL - 6, z: DOOR + 900, turn: kit.RIGHT, cls: 'sfb-walk-card' });
      var LEVELS = [0.86, 0.74, 0.6, 0.46, 0.14];
      var plaques = LEVELS.map(function (f, i) {
        return kit.lift(page, '.sfb-level__said', { n: i, w: 520, x: HALL - 6, z: 3300, y: WH * f, turn: kit.RIGHT, cls: 'sfb-walk-card' });
      });

      var SAID = ['the Striped Cabana', 'the Round Pavilion', 'the Four-Poster', 'the Bell Tent', 'the Sail', 'the Crown'];
      var RSAID = ['round the low table', 'at the tête-à-tête', 'at the long settee', 'at the borne'];
      var stops = [
        kit.stop({ name: 'just inside the doors, the hall going away from you, far longer and taller than the stage', spot: { x: 0, z: DOOR + 200 } }),
        kit.stop({ name: 'at the room’s own page, on the wall inside the doors', spot: kit.front(hung), link: page }, hung),
        kit.stop({ name: 'at why there are tents in a ballroom', spot: kit.front(why) }, why)
      ];
      cards.forEach(function (c, i) { stops.push(kit.stop({ name: 'under ' + SAID[i] + ', at its card', spot: kit.front(c, 900) }, c)); });
      roomCards.forEach(function (c, i) { stops.push(kit.stop({ name: RSAID[i] + ', out in the hall between the canopies', spot: kit.front(c, 900) }, c)); });
      stops.push(
        kit.stop({ name: 'at the head of the long table, the floor and the feast', spot: kit.front(middle) }, middle),
        kit.stop({ name: 'across from the height’s plaques on the right wall: look up to read the highest', spot: kit.front(plaques[4], 1800) }, plaques[4]),
        kit.stop({ name: 'at the far end, the canopies and the crown on the wall', spot: { x: 0, z: 4400 } })
      );
      stops.sort(function (a, b) { return a.z - b.z; });

      return {
        cls: 'sfb-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: DOOR + 200 },
        stops: stops,
        decor: decor,
        arrive: 'The hall goes up far past the top of the stage: look up. Its own page hangs on the wall to your left, just inside the doors.',
        bounds: function () { return { x: [-HALL + 140, HALL - 140], z: [DOOR + 200, LEN - 300] }; },
        ground: function (g, from, to) {
          kit.quad(g, -6000, 6000, from, to, kit.ink('--sfb-oak'));
          // Parquet: blocks laid in alternate directions, pale and dark, with
          // the joints between them, the length of the hall.
          var z0 = Math.max(DOOR, Math.floor(from / 120) * 120), z1 = Math.min(to, LEN + 200);
          for (var z = z0, r = 0; z < z1; z += 120, r++) {
            for (var x = -HALL, c = 0; x < HALL; x += 120, c++) {
              if ((r + c) % 2) kit.quad(g, x, x + 120, z, z + 120, kit.ink('--sfb-oak-3'), 0.6);
            }
            kit.quad(g, -HALL, HALL, z - 2, z + 2, kit.ink('--sfb-oak-2'), 0.6);
          }
        }
      };
    }
  };
})();
