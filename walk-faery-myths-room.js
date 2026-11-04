/* =============================================================================
   Myths & Legends, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   1 of the rooms left on Paper Street.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§128), and this is OURS: a drawing of
   her room in card for Paper Street, in the colours her rooms declare and
   nothing else, which changes nothing on her page and is hers to keep or send
   back. It is the Reading Room's house (§114's claret, timber and brass), and
   what keeps it off its neighbours is the LIGHT: it comes THROUGH STONE, amber
   set in the left-hand wall and amethyst in the right, so the floor is warm on
   one side and violet on the other and nothing in the room is a flame. The
   Alchemist's Arch you came through is grey stone set with both, behind you. A
   model of the Stones stands on a plinth, a cauldron on its three legs, the
   Crystal Wheel on the right-hand wall, the old books on the left, and her
   own page on the far wall between two cases.

   ROUND 2 (Ryan's ask, 2026-11-04) drew more of what her page holds: the
   arch as her own drawing of it has it, amethyst crystals up both sides,
   amber stones round the curve and the four elements carved in the keystone;
   the Heel Stone outside the model's circle; her Herbery's herbs drying on a
   rack over the cauldron; a bordered rug; and further in, the Wheel of the
   Year carved on the left-hand wall with her festivals beside it, lifted off
   her page, and her Story or Fact cards on the right, each turning over as it
   does there. You can stand at each, and look back at the arch.

   NOTHING MOVES: the stones glow on her page at MAX, and here they are set and
   still at every setting. Every colour is one her rooms declare, by name. It
   keeps nothing, sends nothing and fetches nothing; her page arrives through
   Paper Street's screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var SPINES = ['--rdr-velvet', '--rdr-leather', '--rdr-brass', '--myth-chalk', '--rdr-ember', '--rdr-ink-2'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // A wall with stones set in it, the light coming through them: amber on the
  // left-hand wall, amethyst on the right.
  function stoneWall(w, h, warm) {
    var s = svg(w, h), a = warm ? 'var(--myth-amber)' : 'var(--myth-amethyst)', b = warm ? 'var(--myth-amber-2)' : 'var(--myth-amethyst-2)';
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rdr-wall)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h * 0.18, fill: 'var(--rdr-stone)' }));
    for (var x = 120, n = 0; x < w - 60; x += 260, n++) {
      var y = h * (0.32 + (n % 3) * 0.12);
      s.appendChild(el('circle', { cx: x, cy: y, r: 60, fill: b, 'fill-opacity': '0.12' }));
      s.appendChild(el('path', { fill: a, d: 'M' + x + ' ' + (y - 34) + ' L' + (x + 22) + ' ' + y + ' L' + x + ' ' + (y + 34) + ' L' + (x - 22) + ' ' + y + ' Z' }));
      s.appendChild(el('path', { fill: b, d: 'M' + x + ' ' + (y - 34) + ' L' + (x + 22) + ' ' + y + ' L' + x + ' ' + y + ' Z' }));
    }
    s.appendChild(el('rect', { x: 0, y: h - 34, width: w, height: 34, fill: 'var(--rdr-timber)' }));
    return s;
  }

  // Old books in a case on the left-hand wall.
  function books(w, h) {
    var s = svg(w, h), n = 3;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, rx: 6, fill: 'var(--rdr-timber)' }));
    for (var y = 20; y + 120 < h; y += 132) {
      s.appendChild(el('rect', { x: 16, y: y, width: w - 32, height: 120, fill: 'var(--rdr-stone)' }));
      for (var x = 22; x < w - 46; n++) {
        var bw = 20 + (n * 5) % 16, bh = 84 + (n * 9) % 30;
        s.appendChild(el('rect', { x: x, y: y + 120 - bh, width: bw - 3, height: bh, fill: 'var(' + SPINES[n % SPINES.length] + ')' }));
        x += bw;
      }
    }
    return s;
  }

  // The model of the Stones on its plinth: uprights and lintels in a ring.
  function stones(w, h) {
    var s = svg(w, h), ph = h * 0.36, top = h - ph;
    s.appendChild(el('rect', { x: w * 0.05, y: top, width: w * 0.9, height: ph, fill: 'var(--rdr-timber)' }));
    s.appendChild(el('rect', { x: 0, y: top - 16, width: w, height: 22, fill: 'var(--rdr-leather)' }));
    var base = top - 16, n = 7;
    // The bank round the circle, and the Heel Stone standing outside it.
    s.appendChild(el('rect', { x: w * 0.02, y: base - 10, width: w * 0.96, height: 10, rx: 5, fill: 'var(--myth-chalk)', 'fill-opacity': '0.55' }));
    s.appendChild(el('path', { fill: 'var(--myth-chalk)', d: 'M' + w * 0.93 + ' ' + base + ' L' + w * 0.935 + ' ' + (base - top * 0.36) +
      ' L' + w * 0.975 + ' ' + (base - top * 0.4) + ' L' + w * 0.985 + ' ' + base + ' Z' }));
    for (var i = 0; i < n; i++) {
      var x = w * 0.04 + i * (w * 0.84 / n), sw = w * 0.84 / n * 0.42, tall = (i % 2 ? 0.48 : 0.58) * top;
      s.appendChild(el('rect', { x: x, y: base - tall, width: sw, height: tall, rx: 4, fill: 'var(--myth-chalk)' }));
      if (i < n - 1 && i % 2 === 0) {
        s.appendChild(el('rect', { x: x - 4, y: base - tall - 26, width: w * 0.84 / n + sw + 8, height: 26, rx: 3, fill: 'var(--myth-chalk)' }));
      }
    }
    return s;
  }

  // The cauldron on its three legs.
  function cauldron(w, h) {
    var s = svg(w, h), cy = h * 0.42;
    s.appendChild(el('path', { fill: 'var(--rdr-stone)', d: 'M' + w * 0.08 + ' ' + cy + ' Q' + w * 0.06 + ' ' + h * 0.92 + ' ' + w / 2 + ' ' + h * 0.88 +
      ' Q' + w * 0.94 + ' ' + h * 0.92 + ' ' + w * 0.92 + ' ' + cy + ' Z' }));
    s.appendChild(el('ellipse', { cx: w / 2, cy: cy, rx: w * 0.42, ry: h * 0.06, fill: 'var(--rdr-wall)', stroke: 'var(--rdr-brass)', 'stroke-width': 6 }));
    [0.22, 0.5, 0.78].forEach(function (k) { s.appendChild(el('rect', { x: w * k - 8, y: h * 0.84, width: 16, height: h * 0.16, fill: 'var(--rdr-stone)' })); });
    return s;
  }

  // The Crystal Wheel: amethyst and amber round a brass rim.
  function wheel(w, h) {
    var s = svg(w, h), cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 12;
    s.appendChild(el('circle', { cx: cx, cy: cy, r: r, fill: 'var(--rdr-panel)', stroke: 'var(--rdr-brass)', 'stroke-width': 10 }));
    for (var i = 0; i < 12; i++) {
      var a = i / 12 * Math.PI * 2;
      s.appendChild(el('line', { x1: cx, y1: cy, x2: cx + Math.cos(a) * r, y2: cy + Math.sin(a) * r, stroke: 'var(--rdr-brass)', 'stroke-width': 3 }));
      s.appendChild(el('circle', { cx: cx + Math.cos(a + 0.26) * r * 0.72, cy: cy + Math.sin(a + 0.26) * r * 0.72, r: r * 0.1,
        fill: i % 2 ? 'var(--myth-amethyst-2)' : 'var(--myth-amber-2)' }));
    }
    s.appendChild(el('circle', { cx: cx, cy: cy, r: r * 0.16, fill: 'var(--myth-amethyst)' }));
    return s;
  }

  // The Alchemist's Arch, as her own drawing of it has it: old grey stone
  // with a brass line round its edge, amethyst crystals up both sides, amber
  // stones round the curve, and the four elements carved in the keystone
  // (fire and water, and air and earth with their bars).
  function arch(w, h) {
    var s = svg(w, h), ow = w * 0.56, ox = (w - ow) / 2, spring = h * 0.38, R = w / 2, cx = w / 2, top = spring - 40;
    var hole = 'M' + ox + ' ' + h + ' V' + spring + ' A' + ow / 2 + ' ' + ow / 2 + ' 0 0 1 ' + (ox + ow) + ' ' + spring + ' V' + h + ' Z';
    var outer = 'M0 ' + h + ' V' + top + ' A' + R + ' ' + R + ' 0 0 1 ' + w + ' ' + top + ' V' + h;
    s.appendChild(el('path', { 'fill-rule': 'evenodd', fill: 'var(--myth-chalk)', d: outer + ' Z ' + hole }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 6, d: outer }));
    var mid = ow / 2 + (w - ow) / 4;
    [25, 50, 72, 108, 130, 155].forEach(function (deg) {
      var a = deg / 180 * Math.PI, x = cx - Math.cos(a) * mid, y = top + 20 - Math.sin(a) * (mid + 10);
      s.appendChild(el('ellipse', { cx: x, cy: y, rx: 22, ry: 18, fill: 'var(--myth-amber)', stroke: 'var(--myth-amber-2)', 'stroke-width': 4 }));
    });
    [-1, 1].forEach(function (side) {
      var x = side < 0 ? (w - ow) / 4 : w - (w - ow) / 4;
      for (var y = h - 60; y > spring - 10; y -= (h - spring) / 5.2) {
        s.appendChild(el('path', { fill: 'var(--myth-amethyst)', stroke: 'var(--myth-amethyst-2)', 'stroke-width': 3,
          d: 'M' + (x - 18) + ' ' + y + ' L' + x + ' ' + (y - 58) + ' L' + (x + 18) + ' ' + y + ' Z' }));
      }
    });
    var ky = top - R + 8, kw = 120;
    s.appendChild(el('path', { fill: 'var(--myth-chalk)', stroke: 'var(--rdr-brass)', 'stroke-width': 4,
      d: 'M' + (cx - kw / 2) + ' ' + ky + ' H' + (cx + kw / 2) + ' L' + (cx + kw * 0.36) + ' ' + (ky + 120) + ' H' + (cx - kw * 0.36) + ' Z' }));
    var g = el('g', { fill: 'none', stroke: 'var(--rdr-wall)', 'stroke-width': 5, 'stroke-linejoin': 'round' });
    [[-24, 34, 1, 0], [24, 34, -1, 0], [-24, 84, 1, 1], [24, 84, -1, 1]].forEach(function (t) {
      var x = cx + t[0], y = ky + t[1], d = t[2] * 16;
      g.appendChild(el('path', { d: 'M' + (x - 14) + ' ' + (y + d) + ' L' + x + ' ' + (y - d) + ' L' + (x + 14) + ' ' + (y + d) + ' Z' +
        (t[3] ? ' M' + (x - 11) + ' ' + y + ' H' + (x + 11) : '') }));
    });
    s.appendChild(g);
    return s;
  }

  // Her Herbery's herbs drying on a rack: lavender, rosemary, rose, bay,
  // elder and thyme, tied in brass to the rail.
  function herbs(w, h) {
    var s = svg(w, h), inks = ['--myth-amethyst-2', '--rdr-leather', '--rdr-velvet', '--rdr-ember', '--myth-chalk', '--rdr-brass'];
    [16, w - 34].forEach(function (x) { s.appendChild(el('rect', { x: x, y: 20, width: 18, height: h - 20, fill: 'var(--rdr-timber)' })); });
    s.appendChild(el('rect', { x: 0, y: 14, width: w, height: 22, rx: 4, fill: 'var(--rdr-timber)' }));
    inks.forEach(function (ink, i) {
      var x = 66 + i * (w - 132) / (inks.length - 1), drop = (i * 7) % 18;
      s.appendChild(el('line', { x1: x, y1: 34, x2: x, y2: 52 + drop, stroke: 'var(--rdr-brass)', 'stroke-width': 3 }));
      s.appendChild(el('rect', { x: x - 7, y: 50 + drop, width: 14, height: 9, rx: 2, fill: 'var(--rdr-brass)' }));
      s.appendChild(el('path', { fill: 'var(' + ink + ')', d: 'M' + (x - 6) + ' ' + (58 + drop) + ' L' + (x - 24) + ' ' + (170 + drop) +
        ' Q' + x + ' ' + (184 + drop) + ' ' + (x + 24) + ' ' + (170 + drop) + ' L' + (x + 6) + ' ' + (58 + drop) + ' Z' }));
    });
    return s;
  }

  // The Wheel of the Year carved in timber, its eight festivals as stones,
  // amber and amethyst in turn, as her drawing has them.
  function year(w, h) {
    var s = svg(w, h), cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 10;
    s.appendChild(el('circle', { cx: cx, cy: cy, r: r, fill: 'var(--rdr-timber)' }));
    s.appendChild(el('circle', { cx: cx, cy: cy, r: r * 0.88, fill: 'var(--rdr-panel)', stroke: 'var(--rdr-brass)', 'stroke-width': 4 }));
    for (var i = 0; i < 8; i++) {
      var a = i / 8 * Math.PI * 2;
      s.appendChild(el('line', { x1: cx, y1: cy, x2: cx + Math.sin(a) * r * 0.86, y2: cy - Math.cos(a) * r * 0.86, stroke: 'var(--rdr-brass)', 'stroke-width': 5 }));
      s.appendChild(el('circle', { cx: cx + Math.sin(a) * r * 0.72, cy: cy - Math.cos(a) * r * 0.72, r: r * 0.1,
        fill: i % 2 ? 'var(--myth-amethyst)' : 'var(--myth-amber)' }));
    }
    s.appendChild(el('circle', { cx: cx, cy: cy, r: r * 0.15, fill: 'var(--rdr-wall)', stroke: 'var(--rdr-brass)', 'stroke-width': 5 }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['faery-myths-room.html'] = {
    prefix: 'myth-walk',
    from: 'faery-yurt.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var END = 3200 + F;
      var eye = sh / 2;
      var SIDE = 900, WH = Math.max(1000, sh + 440);
      var decor = [];

      [-1, 1].forEach(function (side) {
        decor.push(kit.item(stoneWall(END + 400, WH, side < 0), { x: side * SIDE, z: (END - 400) / 2, w: END + 400, h: WH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT, near: 0.3 }));
      });
      decor.push(kit.item(stoneWall(SIDE * 2 + 40, WH, true), { x: 0, z: END + 30, w: SIDE * 2 + 40, h: WH }));
      // The near wall, with the arch you came through in it.
      decor.push(kit.item(stoneWall(SIDE * 2 + 40, WH, false), { x: 0, z: -330, w: SIDE * 2 + 40, h: WH, turn: Math.PI }));
      var gate = kit.item(arch(560, 620), { x: 0, z: -300, w: 560, h: 620, turn: Math.PI });
      decor.push(gate);
      var shelf = kit.item(books(1000, 700), { x: -SIDE + 6, z: 1100, w: 1000, h: 700, turn: kit.LEFT });
      var cw = kit.item(wheel(560, 560), { x: SIDE - 6, z: 1100, w: 560, h: 560, y: 160, turn: kit.RIGHT });
      var henge = kit.item(stones(660, 420), { x: -400, z: 1500, w: 660, h: 420 });
      var rack = kit.item(herbs(460, 620), { x: 330, z: 1960, w: 460, h: 620 });
      var pot = kit.item(cauldron(300, 260), { x: 330, z: 1900, w: 300, h: 260 });
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(books(380, 760), { x: side * (sw / 2 + 260), z: END - 10, w: 380, h: 760 }));
      });
      decor.push(shelf, cw, henge, rack, pot);

      // The page first, because the Wheel of the Year and the cards are lifted
      // off it; then the wheel carved on the left-hand wall beside her
      // festivals, and her Story or Fact cards on the right.
      var page = kit.screen(kit.page, 'Helen’s Myths and Legends’ own page, on the far wall between two cases');
      decor.push(kit.item(year(320, 320), { x: -SIDE + 6, z: 1990, w: 320, h: 320, y: 300, turn: kit.LEFT }));
      var festivals = kit.lift(page, '.myth-wheel', { x: -SIDE + 6, z: 2500, w: 640, y: 40, turn: kit.LEFT, cls: 'myth-walk-lift' });
      var cards = kit.lift(page, '.myth-cards', { x: SIDE - 6, z: 2500, w: 660, y: 40, turn: kit.RIGHT, cls: 'myth-walk-lift' });
      var leaf = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'myth-walk-wall' });
      var onto = function (it, sel) {
        return { focus: function (o) { var b = it.el.querySelector(sel); if (b) b.focus(o); } };
      };

      var stops = [
        kit.stop({ name: 'just through the Alchemist’s Arch, amber on your left and amethyst on your right', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'looking back at the Alchemist’s Arch, the four elements carved in its keystone', spot: { x: 0, z: 1320, yaw: Math.PI } }, gate),
        kit.stop({ name: 'at the model of the Stones on its plinth, the Heel Stone outside the circle', spot: kit.front(henge, F * 0.9) }, henge),
        kit.stop({ name: 'at the Crystal Wheel on the right-hand wall', spot: kit.front(cw, F * 1.1) }, cw),
        kit.stop({ name: 'at the old books on the left-hand wall', spot: kit.front(shelf, F * 1.1) }, shelf),
        kit.stop({ name: 'at the cauldron, with her herbs drying on a rack over it', spot: kit.front(rack, F * 1.2) }, pot),
        kit.stop({ name: 'at the Wheel of the Year on the left-hand wall, with her festivals beside it', spot: kit.front(festivals, F * 1.9) }, festivals),
        kit.stop({ name: 'at her Story or Fact cards on the right-hand wall, to turn them over', spot: kit.front(cards, F * 1.9), link: onto(cards, 'summary') }, cards),
        kit.stop({ name: 'at the far wall, with her own page between two cases', spot: { x: 0, z: END - F }, link: page }, leaf)
      ];

      return {
        cls: 'myth-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Her own page hangs on the far wall between two cases of old books, the Wheel of the Year and her Story or Fact cards on the walls before it.',
        bounds: function () { return { x: [-SIDE + 300, SIDE - 300], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--rdr-stone'));
          kit.quad(g, -SIDE, SIDE, Math.max(from, -400), Math.min(to, END), kit.ink('--rdr-wall'));
          var seam = kit.ink('--rdr-stone');
          for (var z = Math.max(-400, Math.ceil(from / 240) * 240); z < Math.min(to, END); z += 240) kit.quad(g, -SIDE, SIDE, z, z + 5, seam);
          // The light through the stones: warm on the left of the floor,
          // violet on the right, and no flame anywhere.
          kit.quad(g, -SIDE, -100, Math.max(from, -400), Math.min(to, END), kit.ink('--myth-amber'), 0.10);
          kit.quad(g, 100, SIDE, Math.max(from, -400), Math.min(to, END), kit.ink('--myth-amethyst'), 0.14);
          // A velvet rug with a brass border, under the Stones and the cauldron.
          var r0 = Math.max(from, 1200), r1 = Math.min(to, 2300);
          if (r1 > r0) {
            kit.quad(g, -620, 620, r0, r1, kit.ink('--rdr-velvet'), 0.9);
            kit.quad(g, -560, 560, Math.max(r0, 1250), Math.min(r1, 2250), kit.ink('--rdr-brass'), 0.8);
            kit.quad(g, -540, 540, Math.max(r0, 1270), Math.min(r1, 2230), kit.ink('--rdr-panel'), 0.95);
          }
        }
      };
    }
  };
})();
