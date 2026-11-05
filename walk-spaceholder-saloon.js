/* =============================================================================
   The Spaceholder Saloon, walked into on Paper Street. Ryan's ask, 2026-11-05:
   every new room onto Cel Street and Paper Street.

   IT IS NORAH'S ROOM AND HER WORLD (§146), brought in from Your Room by
   tools/import-room.py, and this scene is OURS: a drawing of her saloon in
   card, in the colours her room declares (the import:spaceholder-saloon block
   in love.css's :root) and nothing else. It changes nothing on her page and is
   hers to keep or send back; a change to how it looks is hers to ask for.

   It is drawn from her page's own drawing and words and nothing more. The far
   wall is planks with her stone fireplace in it, a low fire, and the two old
   oil lamps burning on the wooden mantle, their light round them on the wall;
   her page hangs on the left wall. In front of the hearth, each a flat of
   its own: the rocking chair closest to the fire with its red quilted
   cushion, green pillow and quilt over its back, the table for one beside it,
   the big table with chairs that do not match, and the porch swing hung from
   the rafters by the hearth with its cushion, pillows and blanket. By the
   door, the row of hooks on the left wall, and her menu board lifted off her
   page onto the right wall, in her own words.

   NOTHING MOVES: her fire breathes and her chair rocks only at MAX on her page,
   and a flat of card does neither. It keeps nothing, sends nothing and fetches
   nothing; her page arrives through Paper Street's screen().
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
  function hash(i, j) {
    var n = Math.imul(i + 13, 374761393) ^ Math.imul(j + 29, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  // Upright planks in her wall brown, a dark seam between each, a nail top
  // and bottom.
  function planks(s, w, h, seed) {
    var bw = 120;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--ss-wall)' }));
    for (var i = 0, x = 0; x < w; i++, x += bw) {
      if (hash(i, seed) < 0.35) s.appendChild(el('rect', { x: x, y: 0, width: bw, height: h, fill: 'var(--ss-plank)' }));
      s.appendChild(el('rect', { x: x, y: 0, width: 6, height: h, fill: 'var(--ss-seam)' }));
      [40, h - 40].forEach(function (y) { s.appendChild(el('circle', { cx: x + bw / 2, cy: y, r: 5, fill: 'var(--ss-seam)' })); });
    }
  }

  // The far wall: planks, the stone fireplace in the middle with its low
  // fire, the mantle and the two oil lamps burning on it, their light on the
  // wall round them.
  function farWall(w, h) {
    var s = svg(w, h), cx = w / 2, FW = 900, OW = 520, OH = 420, MANT = h - 780;
    planks(s, w, h, 1);
    // The lamplight and firelight on the wall, as her drawing has it.
    [[cx - 300, MANT - 120, 420], [cx + 300, MANT - 120, 420], [cx, h - 300, 560]].forEach(function (g) {
      for (var k = 0; k < 4; k++) s.appendChild(el('circle', { cx: g[0], cy: g[1], r: g[2] * (1 - k * 0.22), fill: 'var(--ss-flame)', 'fill-opacity': '0.07' }));
    });
    s.appendChild(el('rect', { x: cx - FW / 2, y: 0, width: FW, height: h, fill: 'var(--ss-stone)' }));
    for (var i = 0; i < 6; i++) for (var j = 0; j < 14; j++) {
      if (hash(i, j) < 0.62) continue;
      var sx = cx - FW / 2 + 30 + i * 140 + (j % 2) * 50, sy = 40 + j * 110;
      if (sy > MANT - 40 && sy < MANT + 60) continue;
      if (Math.abs(sx + 55 - cx) < OW / 2 + 40 && sy > h - OH - 120) continue;
      s.appendChild(el('rect', { x: sx, y: sy, width: 110, height: 66, fill: 'var(--ss-stone-dark)' }));
    }
    // The firebox, arched, soot black.
    s.appendChild(el('path', { fill: 'var(--ss-soot)', d: 'M' + (cx - OW / 2) + ' ' + h + ' V' + (h - OH + 120) + ' Q' + cx + ' ' + (h - OH - 90) + ' ' + (cx + OW / 2) + ' ' + (h - OH + 120) + ' V' + h + ' Z' }));
    // The logs and the low fire on them.
    s.appendChild(el('rect', { x: cx - 190, y: h - 70, width: 380, height: 46, rx: 23, fill: 'var(--ss-rootbeer)' }));
    s.appendChild(el('rect', { x: cx - 150, y: h - 110, width: 300, height: 42, rx: 21, fill: 'var(--ss-rootbeer)' }));
    s.appendChild(el('path', { fill: 'var(--ss-ember)', d: 'M' + (cx - 170) + ' ' + (h - 100) + ' Q' + (cx - 140) + ' ' + (h - 260) + ' ' + (cx - 70) + ' ' + (h - 210) + ' Q' + (cx - 60) + ' ' + (h - 350) + ' ' + cx + ' ' + (h - 280) + ' Q' + (cx + 60) + ' ' + (h - 380) + ' ' + (cx + 80) + ' ' + (h - 230) + ' Q' + (cx + 140) + ' ' + (h - 270) + ' ' + (cx + 170) + ' ' + (h - 100) + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--ss-flame)', d: 'M' + (cx - 110) + ' ' + (h - 100) + ' Q' + (cx - 90) + ' ' + (h - 210) + ' ' + (cx - 40) + ' ' + (h - 180) + ' Q' + (cx - 20) + ' ' + (h - 270) + ' ' + (cx + 20) + ' ' + (h - 220) + ' Q' + (cx + 60) + ' ' + (h - 290) + ' ' + (cx + 70) + ' ' + (h - 180) + ' Q' + (cx + 110) + ' ' + (h - 200) + ' ' + (cx + 110) + ' ' + (h - 100) + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--ss-flame-core)', d: 'M' + (cx - 50) + ' ' + (h - 100) + ' Q' + (cx - 30) + ' ' + (h - 170) + ' ' + cx + ' ' + (h - 150) + ' Q' + (cx + 30) + ' ' + (h - 200) + ' ' + (cx + 50) + ' ' + (h - 100) + ' Z' }));
    // The mantle.
    s.appendChild(el('rect', { x: cx - FW / 2 - 90, y: MANT, width: FW + 180, height: 56, rx: 6, fill: 'var(--ss-rootbeer)' }));
    [-1, 1].forEach(function (k) { s.appendChild(el('rect', { x: cx + k * (FW / 2 - 40) - 30, y: MANT + 56, width: 60, height: 110, fill: 'var(--ss-rootbeer)' })); });
    // The two old oil lamps: a brass foot, a brass font, a glass chimney and
    // a flame inside it.
    [cx - 300, cx + 300].forEach(function (lx) {
      var b = MANT;
      s.appendChild(el('ellipse', { cx: lx, cy: b - 10, rx: 70, ry: 18, fill: 'var(--ss-brass)' }));
      s.appendChild(el('rect', { x: lx - 26, y: b - 86, width: 52, height: 78, fill: 'var(--ss-brass)' }));
      s.appendChild(el('ellipse', { cx: lx, cy: b - 110, rx: 64, ry: 42, fill: 'var(--ss-brass)' }));
      s.appendChild(el('path', { fill: 'var(--ss-flame-core)', 'fill-opacity': '0.22', stroke: 'var(--ss-brass)', 'stroke-width': 6,
        d: 'M' + (lx - 26) + ' ' + (b - 150) + ' Q' + (lx - 46) + ' ' + (b - 210) + ' ' + (lx - 22) + ' ' + (b - 268) + ' L' + (lx + 22) + ' ' + (b - 268) + ' Q' + (lx + 46) + ' ' + (b - 210) + ' ' + (lx + 26) + ' ' + (b - 150) + ' Z' }));
      s.appendChild(el('path', { fill: 'var(--ss-flame)', d: 'M' + lx + ' ' + (b - 160) + ' Q' + (lx - 22) + ' ' + (b - 190) + ' ' + lx + ' ' + (b - 232) + ' Q' + (lx + 22) + ' ' + (b - 190) + ' ' + lx + ' ' + (b - 160) + ' Z' }));
    });
    return s;
  }

  function sideWall(w, h, seed) { var s = svg(w, h); planks(s, w, h, seed); return s; }

  // The rocking chair, side on, as her drawing has it: rockers, a red quilted
  // cushion, a green pillow and a quilt over its back.
  function rocker(w, h) {
    var s = svg(w, h);
    s.appendChild(el('path', { d: 'M20 ' + (h - 40) + ' Q' + (w / 2) + ' ' + (h + 10) + ' ' + (w - 20) + ' ' + (h - 50), fill: 'none', stroke: 'var(--ss-oak-dark)', 'stroke-width': 22, 'stroke-linecap': 'round' }));
    s.appendChild(el('path', { fill: 'var(--ss-oak-dark)', d: 'M110 ' + (h - 170) + ' L128 ' + (h - 170) + ' L120 ' + (h - 20) + ' L100 ' + (h - 22) + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--ss-oak)', d: 'M300 ' + (h - 170) + ' L318 ' + (h - 170) + ' L330 ' + (h - 18) + ' L312 ' + (h - 18) + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--ss-oak-dark)', d: 'M96 ' + (h - 162) + ' L118 ' + (h - 172) + ' L62 30 L40 38 Z' }));
    s.appendChild(el('circle', { cx: 50, cy: 30, r: 16, fill: 'var(--ss-oak)' }));
    s.appendChild(el('path', { fill: 'var(--ss-quilt)', d: 'M24 50 Q62 18 100 56 L114 260 Q80 292 48 272 Z' }));
    [100, 160, 220].forEach(function (y) { s.appendChild(el('path', { d: 'M36 ' + y + ' L104 ' + (y + 12), stroke: 'var(--ss-wool)', 'stroke-width': 5, 'stroke-dasharray': '10 7', fill: 'none' })); });
    s.appendChild(el('path', { fill: 'var(--ss-quilt-alt)', d: 'M118 ' + (h - 200) + ' Q90 ' + (h - 270) + ' 118 ' + (h - 330) + ' Q170 ' + (h - 324) + ' 182 ' + (h - 262) + ' Q182 ' + (h - 206) + ' 136 ' + (h - 192) + ' Z' }));
    s.appendChild(el('rect', { x: 100, y: h - 182, width: 240, height: 28, rx: 10, fill: 'var(--ss-oak)' }));
    s.appendChild(el('rect', { x: 118, y: h - 222, width: 210, height: 44, rx: 20, fill: 'var(--ss-quilt)' }));
    [160, 205, 250, 295].forEach(function (x) { s.appendChild(el('path', { d: 'M' + x + ' ' + (h - 216) + ' V' + (h - 184), stroke: 'var(--ss-wool)', 'stroke-width': 5, 'stroke-dasharray': '8 6' })); });
    s.appendChild(el('rect', { x: 92, y: h - 302, width: 252, height: 22, rx: 11, fill: 'var(--ss-oak)' }));
    s.appendChild(el('rect', { x: 312, y: h - 290, width: 20, height: 110, fill: 'var(--ss-oak)' }));
    return s;
  }

  // The table for one: a round top on one leg.
  function tableForOne(w, h) {
    var s = svg(w, h);
    s.appendChild(el('ellipse', { cx: w / 2, cy: 26, rx: w / 2 - 6, ry: 22, fill: 'var(--ss-rootbeer)' }));
    s.appendChild(el('rect', { x: w / 2 - 14, y: 40, width: 28, height: h - 60, fill: 'var(--ss-rootbeer)' }));
    s.appendChild(el('rect', { x: w / 2 - 60, y: h - 22, width: 120, height: 20, rx: 8, fill: 'var(--ss-rootbeer)' }));
    return s;
  }

  // The big table, room for everybody, chairs that do not match, and the
  // covered bowl of pretzels with its lid on.
  function bigTable(w, h) {
    var s = svg(w, h), top = h - 300;
    function chair(x, ink, back) {
      s.appendChild(el('rect', { x: x, y: h - 150, width: 130, height: 18, fill: ink }));
      [x + 6, x + 110].forEach(function (lx) { s.appendChild(el('rect', { x: lx, y: h - 132, width: 14, height: 132, fill: ink })); });
      if (back) {
        s.appendChild(el('rect', { x: x + 6, y: h - 330, width: 14, height: 190, fill: ink }));
        s.appendChild(el('rect', { x: x + 110, y: h - 330, width: 14, height: 190, fill: ink }));
        for (var k = 0; k < 3; k++) s.appendChild(el('rect', { x: x + 6, y: h - 320 + k * 50, width: 118, height: 14, fill: ink }));
      }
    }
    chair(40, 'var(--ss-oak)', true);
    chair(w - 170, 'var(--ss-oak-dark)', true);
    s.appendChild(el('rect', { x: 120, y: top, width: w - 240, height: 34, rx: 6, fill: 'var(--ss-rootbeer)' }));
    [150, w - 180].forEach(function (lx) { s.appendChild(el('rect', { x: lx, y: top + 34, width: 30, height: h - top - 34, fill: 'var(--ss-rootbeer)' })); });
    chair(w / 2 - 65, 'var(--ss-oak)', false);
    // The covered bowl, the scoop beside it, and a brown bottle.
    s.appendChild(el('path', { fill: 'var(--ss-oak)', d: 'M' + (w / 2 - 230) + ' ' + top + ' Q' + (w / 2 - 160) + ' ' + (top + 2) + ' ' + (w / 2 - 90) + ' ' + top + ' Q' + (w / 2 - 100) + ' ' + (top - 50) + ' ' + (w / 2 - 160) + ' ' + (top - 50) + ' Q' + (w / 2 - 220) + ' ' + (top - 50) + ' ' + (w / 2 - 230) + ' ' + top + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--ss-brass)', d: 'M' + (w / 2 - 236) + ' ' + (top - 46) + ' Q' + (w / 2 - 160) + ' ' + (top - 130) + ' ' + (w / 2 - 84) + ' ' + (top - 46) + ' Z' }));
    s.appendChild(el('circle', { cx: w / 2 - 160, cy: top - 96, r: 10, fill: 'var(--ss-brass)' }));
    s.appendChild(el('rect', { x: w / 2 - 70, y: top - 8, width: 70, height: 10, rx: 5, fill: 'var(--ss-brass)' }));
    s.appendChild(el('path', { fill: 'var(--ss-rootbeer)', stroke: 'var(--ss-oak-dark)', 'stroke-width': 4, d: 'M' + (w / 2 + 120) + ' ' + top + ' V' + (top - 70) + ' Q' + (w / 2 + 120) + ' ' + (top - 90) + ' ' + (w / 2 + 132) + ' ' + (top - 100) + ' V' + (top - 128) + ' H' + (w / 2 + 148) + ' V' + (top - 100) + ' Q' + (w / 2 + 160) + ' ' + (top - 90) + ' ' + (w / 2 + 160) + ' ' + (top - 70) + ' V' + top + ' Z' }));
    return s;
  }

  // The porch swing hung from the rafters on two ropes, with a cushion, two
  // pillows and a blanket over its front.
  function swing(w, h) {
    var s = svg(w, h), seat = h - 220;
    [60, w - 60].forEach(function (x) { s.appendChild(el('path', { d: 'M' + x + ' 0 V' + seat, stroke: 'var(--ss-brass)', 'stroke-width': 8 })); });
    s.appendChild(el('rect', { x: 50, y: seat - 170, width: w - 100, height: 170, fill: 'var(--ss-oak-dark)' }));
    for (var x = 90; x < w - 80; x += 46) s.appendChild(el('rect', { x: x, y: seat - 162, width: 14, height: 150, fill: 'var(--ss-oak)' }));
    s.appendChild(el('rect', { x: 40, y: seat - 190, width: w - 80, height: 26, rx: 10, fill: 'var(--ss-oak)' }));
    s.appendChild(el('path', { fill: 'var(--ss-quilt-alt)', d: 'M80 ' + (seat + 2) + ' Q66 ' + (seat - 70) + ' 120 ' + (seat - 90) + ' Q172 ' + (seat - 80) + ' 164 ' + (seat + 2) + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--ss-quilt)', d: 'M' + (w - 170) + ' ' + (seat + 2) + ' Q' + (w - 178) + ' ' + (seat - 82) + ' ' + (w - 122) + ' ' + (seat - 88) + ' Q' + (w - 70) + ' ' + (seat - 72) + ' ' + (w - 78) + ' ' + (seat + 2) + ' Z' }));
    s.appendChild(el('rect', { x: 50, y: seat - 6, width: w - 100, height: 38, rx: 18, fill: 'var(--ss-quilt)' }));
    s.appendChild(el('rect', { x: 30, y: seat + 30, width: w - 60, height: 34, rx: 8, fill: 'var(--ss-oak)' }));
    [30, w - 50].forEach(function (lx) { s.appendChild(el('rect', { x: lx, y: seat + 60, width: 20, height: 60, fill: 'var(--ss-oak-dark)' })); });
    s.appendChild(el('path', { fill: 'var(--ss-quilt-alt)', d: 'M' + (w / 2 - 70) + ' ' + (seat + 30) + ' H' + (w / 2 + 70) + ' L' + (w / 2 + 60) + ' ' + (seat + 190) + ' Q' + (w / 2) + ' ' + (seat + 214) + ' ' + (w / 2 - 60) + ' ' + (seat + 190) + ' Z' }));
    [seat + 90, seat + 150].forEach(function (y) { s.appendChild(el('path', { d: 'M' + (w / 2 - 62) + ' ' + y + ' H' + (w / 2 + 62), stroke: 'var(--ss-wool)', 'stroke-width': 5, 'stroke-dasharray': '10 7' })); });
    return s;
  }

  // The row of hooks by the swinging doors.
  function hooks(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 30, width: w, height: 60, rx: 10, fill: 'var(--ss-rootbeer)' }));
    for (var x = w / 8; x < w; x += w / 4) {
      s.appendChild(el('path', { d: 'M' + x + ' 90 V170 Q' + x + ' 220 ' + (x + 50) + ' 212', fill: 'none', stroke: 'var(--ss-brass)', 'stroke-width': 16, 'stroke-linecap': 'round' }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['spaceholder-saloon.html'] = {
    prefix: 'ss-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var eye = sh / 2, END = 2600 + F, SIDE = 1700;
      var WH = sh + 900, WW = SIDE * 2 + 60, BZ = 2100;
      var decor = [];
      var page = kit.screen(kit.page, 'The Spaceholder Saloon’s own page, on the left wall');

      decor.push(kit.item(farWall(WW, WH), { x: 0, z: END + 30, w: WW, h: WH }));
      var board = kit.item(page, { x: -SIDE + 20, z: BZ, w: sw, h: sh, turn: kit.LEFT, cls: 'ss-walk-board' });
      [-1, 1].forEach(function (k) {
        decor.push(kit.item(sideWall(END + 30, WH, k + 3), { x: k * SIDE, z: (END + 30) / 2, w: END + 30, h: WH, turn: k < 0 ? kit.LEFT : kit.RIGHT }));
      });

      var chair = kit.item(rocker(440, 600), { x: -760, z: END - 640, w: 440, h: 600 });
      var one = kit.item(tableForOne(240, 330), { x: -330, z: END - 760, w: 240, h: 330 });
      var hung = kit.item(swing(620, WH - 120), { x: 1100, z: END - 420, w: 620, h: WH - 120 });
      var big = kit.item(bigTable(1000, 560), { x: 760, z: 2050, w: 1000, h: 560 });
      var pegs = kit.item(hooks(820, 240), { x: -SIDE, z: 800, y: 420, w: 820, h: 240, turn: kit.LEFT });
      var menu = kit.lift(page, '.ss-board', { x: SIDE, z: 900, y: 120, w: 640, turn: kit.RIGHT });
      decor.push(chair, one, hung, big, pegs);

      var stops = [
        kit.stop({ name: 'inside the swinging doors, the fire at the far end', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'by the fire, the two oil lamps burning on the mantle', spot: { x: 0, z: END - F * 1.5 } }),
        kit.stop({ name: 'at the rocking chair, closest to the fire', spot: kit.front(chair, 1100) }, chair),
        kit.stop({ name: 'at the table for one', spot: kit.front(one, 900) }, one),
        kit.stop({ name: 'at the swing hung from the rafters by the hearth', spot: kit.front(hung, 1500) }, hung),
        kit.stop({ name: 'at the big table, room for everybody', spot: kit.front(big, 1300) }, big),
        kit.stop({ name: 'at the row of hooks by the swinging doors', spot: kit.front(pegs, SIDE + 400) }, pegs),
        kit.stop({ name: 'at the menu board by the door', spot: kit.front(menu, SIDE + 300) }, menu),
        kit.stop({ name: 'at the left wall, with the saloon’s own page', spot: kit.front(board), link: page }, board)
      ];
      return {
        cls: 'ss-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Lamplight from the mantle, firelight from the hearth; the saloon’s own page hangs on the left wall.',
        bounds: function () { return { x: [-SIDE + 300, SIDE - 300], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--ss-floor'));
          var seam = kit.ink('--ss-seam'), z0 = Math.max(from, 0), z1 = Math.min(to, END + 30);
          for (var x = -SIDE; x <= SIDE; x += 150) kit.quad(g, x - 3, x + 3, z0, z1, seam);
          for (var z = Math.ceil(z0 / 600) * 600; z < z1; z += 600) {
            for (x = -SIDE + ((z / 600) % 2) * 75; x < SIDE; x += 300) kit.quad(g, x, x + 150, z, z + 5, seam);
          }
          // The hearthstone, and the firelight lying on the boards in front of it.
          kit.quad(g, -560, 560, Math.max(from, END - 260), Math.min(to, END + 30), kit.ink('--ss-stone-dark'));
          kit.oval(g, 0, END - 300, 1100, 700, kit.ink('--ss-flame'), 0.12);
        }
      };
    }
  };
})();
