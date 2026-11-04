/* =============================================================================
   The Faery Yurt, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1
   of the rooms left on Paper Street.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§14), and this is OURS: a drawing of
   her yurt in card for Paper Street, in her own declared colours and nothing
   else, which changes nothing on her page and is hers to keep or send back, as
   Cel Street's drawing of it is. Warm on purpose where the field it is pitched
   on is cold: you come in out of the night air. A round tent of canvas over a
   timber lattice, fairy lights strung low under the canvas, one candle's
   light filling it from the middle, the crown's night overhead, and round the
   wall things from her room: her bookcase, her stove with the fly agarics
   round it, and the Alchemist's Arch in amber and amethyst. Her own page hangs
   on the far wall, facing the door. Along the wall either side of the door
   are the ways through, each in her own words off her page: the round
   door into the Play Pod, the Alchemist's Arch to Myths and Legends, the
   glowing mushroom under the Glimmer Window down into Glow Wild Hollow, the
   curtain through to the Cinema, the phonograph through to the Music Room and
   her bookcase through to the Reading Room. The doors are OURS too, drawn
   in her colours, and hers to keep or send back.

   NOTHING MOVES. Her lights twinkle on her page at MAX; here they are lit and
   still at every setting. Every colour is one her room declares, by name. It
   keeps nothing, sends nothing and fetches nothing; her page arrives through
   Paper Street's screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var SPINES = ['--tallow', '--tallow-2', '--ember', '--moonstone-2', '--ivy', '--toadstool', '--candle', '--tallow-3'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // A length of the yurt's wall: canvas over a timber lattice, a band of
  // fairy lights strung along under the roof's edge.
  function wall(w, h) {
    var s = svg(w, h), top = h * 0.3;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--tent)' }));
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: h - top, fill: 'var(--canvas)' }));
    for (var x = -h; x < w + h; x += 90) {
      s.appendChild(el('line', { x1: x, y1: top, x2: x + (h - top), y2: h, stroke: 'var(--timber)', 'stroke-width': 7 }));
      s.appendChild(el('line', { x1: x + (h - top), y1: top, x2: x, y2: h, stroke: 'var(--timber)', 'stroke-width': 7 }));
    }
    s.appendChild(el('rect', { x: 0, y: top - 12, width: w, height: 16, fill: 'var(--timber)' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--tallow-3)', 'stroke-width': 2,
      d: 'M0 ' + (top + 24) + ' Q' + w / 2 + ' ' + (top + 70) + ' ' + w + ' ' + (top + 24) }));
    for (var i = 1; i < 8; i++) {
      var t = i / 8, cy = top + 24 + 4 * t * (1 - t) * 46;
      s.appendChild(el('circle', { cx: t * w, cy: cy, r: 13, fill: 'var(--candle)', 'fill-opacity': '0.22' }));
      s.appendChild(el('circle', { cx: t * w, cy: cy, r: 5, fill: 'var(--candle)' }));
    }
    s.appendChild(el('rect', { x: 0, y: h - 40, width: w, height: 40, fill: 'var(--canvas-2)' }));
    return s;
  }

  // A board on a way through at about the height of your eyes, timber with a
  // tallow groove round it, for her words for where it goes (kit.door letters
  // them over it).
  var BOARD = 130;
  function board(s, w, y) {
    s.appendChild(el('rect', { x: 16, y: y, width: w - 32, height: BOARD, rx: 10, fill: 'var(--timber)' }));
    s.appendChild(el('rect', { x: 26, y: y + 10, width: w - 52, height: BOARD - 20, rx: 6, fill: 'none', stroke: 'var(--tallow-3)', 'stroke-width': 2 }));
  }

  // Her bookcase, the way through to the Reading Room: a timber case, shelf
  // after shelf of spines, its board set in among the shelves.
  var SHELF_BOARD = 330;
  function bookcase(w, h) {
    var s = svg(w, h), n = 0;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, rx: 10, fill: 'var(--timber)' }));
    board(s, w, SHELF_BOARD);
    for (var y = 24; y + 120 <= h - 20; y += 130) {
      if (y + 116 > SHELF_BOARD - 6 && y < SHELF_BOARD + BOARD + 6) { y = SHELF_BOARD + BOARD + 14 - 130; continue; }
      s.appendChild(el('rect', { x: 18, y: y, width: w - 36, height: 116, fill: 'var(--hearth)' }));
      for (var x = 24; x < w - 50; n++) {
        var bw = 18 + (n * 7) % 16, bh = 80 + (n * 13) % 30;
        s.appendChild(el('rect', { x: x, y: y + 116 - bh, width: bw - 3, height: bh, fill: 'var(' + SPINES[n % SPINES.length] + ')' }));
        x += bw;
      }
    }
    return s;
  }

  // Her stove: black iron on its feet, the fire behind its door, and the fly
  // agarics round its foot.
  function stove(w, h) {
    var s = svg(w, h), bx = w * 0.25, bw = w * 0.5, by = h * 0.35;
    s.appendChild(el('rect', { x: w / 2 - 22, y: 0, width: 44, height: by, fill: 'var(--hearth)' }));
    s.appendChild(el('rect', { x: bx, y: by, width: bw, height: h * 0.5, rx: 12, fill: 'var(--hearth)', stroke: 'var(--timber)', 'stroke-width': 6 }));
    s.appendChild(el('rect', { x: bx + bw * 0.2, y: by + h * 0.12, width: bw * 0.6, height: h * 0.24, rx: 10, fill: 'var(--ember)' }));
    s.appendChild(el('rect', { x: bx + bw * 0.28, y: by + h * 0.2, width: bw * 0.44, height: h * 0.12, rx: 6, fill: 'var(--ember-2)' }));
    [0.3, 0.7].forEach(function (k) { s.appendChild(el('rect', { x: w * k - 8, y: by + h * 0.5, width: 16, height: h * 0.15, fill: 'var(--hearth)' })); });
    [[0.08, 0.9], [0.18, 0.95], [0.82, 0.92], [0.93, 0.96]].forEach(function (m) {
      var cx = w * m[0], cy = h * m[1];
      s.appendChild(el('rect', { x: cx - 7, y: cy - 30, width: 14, height: 34, fill: 'var(--tallow)' }));
      s.appendChild(el('path', { fill: 'var(--toadstool)', d: 'M' + (cx - 30) + ' ' + (cy - 26) + ' A30 26 0 0 1 ' + (cx + 30) + ' ' + (cy - 26) + ' Z' }));
      s.appendChild(el('circle', { cx: cx - 10, cy: cy - 38, r: 4, fill: 'var(--tallow)' }));
      s.appendChild(el('circle', { cx: cx + 9, cy: cy - 42, r: 4, fill: 'var(--tallow)' }));
    });
    return s;
  }

  // The Alchemist's Arch: grey stone set with amber and amethyst, the dark of
  // where it goes inside it.
  function arch(w, h) {
    var s = svg(w, h), ow = w * 0.56, ox = (w - ow) / 2, spring = h * 0.36;
    var hole = 'M' + ox + ' ' + h + ' V' + spring + ' A' + ow / 2 + ' ' + ow / 2 + ' 0 0 1 ' + (ox + ow) + ' ' + spring + ' V' + h + ' Z';
    s.appendChild(el('path', { 'fill-rule': 'evenodd', fill: 'var(--rdr-stone)',
      d: 'M0 ' + h + ' V' + (spring - 40) + ' A' + w / 2 + ' ' + w / 2 + ' 0 0 1 ' + w + ' ' + (spring - 40) + ' V' + h + ' Z ' + hole }));
    s.appendChild(el('path', { fill: 'var(--hearth)', d: hole }));
    for (var i = 0; i < 9; i++) {
      var a = Math.PI * (i / 8), r = ow / 2 + (w - ow) / 4;
      s.appendChild(el('circle', { cx: w / 2 - Math.cos(a) * r, cy: spring - Math.sin(a) * r, r: 18,
        fill: i % 2 ? 'var(--myth-amethyst-2)' : 'var(--myth-amber)' }));
    }
    [0.6, 0.8].forEach(function (k) {
      [ox - (w - ow) / 4, ox + ow + (w - ow) / 4].forEach(function (cx, j) {
        s.appendChild(el('circle', { cx: cx, cy: h * k, r: 16, fill: j ? 'var(--myth-amber)' : 'var(--myth-amethyst-2)' }));
      });
    });
    return s;
  }

  // The phonograph on its little table, the way through to the Music Room:
  // a box and its record, the horn flared out to the room, and its board hung
  // on the table's front.
  var TABLE = 400;
  function phonograph(w, h) {
    var s = svg(w, h), ty = TABLE;
    s.appendChild(el('rect', { x: 50, y: ty, width: w - 100, height: 26, rx: 4, fill: 'var(--timber)' }));
    [70, w - 94].forEach(function (x) { s.appendChild(el('rect', { x: x, y: ty, width: 24, height: h - ty, fill: 'var(--timber)' })); });
    board(s, w, ty + 30);
    s.appendChild(el('rect', { x: w * 0.22, y: ty - 90, width: w * 0.42, height: 90, rx: 6, fill: 'var(--canvas-2)', stroke: 'var(--timber)', 'stroke-width': 6 }));
    s.appendChild(el('ellipse', { cx: w * 0.43, cy: ty - 92, rx: 78, ry: 12, fill: 'var(--hearth)' }));
    s.appendChild(el('path', { fill: 'var(--ember-2)', d: 'M' + (w * 0.56) + ' ' + (ty - 96) + ' L' + (w * 0.6) + ' ' + (ty - 170) +
      ' Q' + (w * 0.64) + ' ' + (ty - 250) + ' ' + (w * 0.9) + ' ' + (ty - 300) + ' L' + (w * 0.96) + ' ' + (ty - 170) +
      ' Q' + (w * 0.74) + ' ' + (ty - 160) + ' ' + (w * 0.64) + ' ' + (ty - 96) + ' Z' }));
    s.appendChild(el('ellipse', { cx: w * 0.93, cy: ty - 235, rx: 22, ry: 66, fill: 'var(--ember)' }));
    return s;
  }

  // The curtain, the way through to the Cinema: canvas drawn back either side
  // of a doorway, and her words in the dark beyond it.
  function curtain(w, h) {
    var s = svg(w, h), top = 0, mid = h * 0.62;
    s.appendChild(el('rect', { x: 30, y: top, width: w - 60, height: h - top, fill: 'var(--hearth)' }));
    s.appendChild(el('rect', { x: 10, y: top, width: w - 20, height: 24, fill: 'var(--timber)' }));
    [1, -1].forEach(function (k) {
      var e = k > 0 ? 30 : w - 30, inner = e + k * w * 0.36, tie = e + k * w * 0.1;
      s.appendChild(el('path', { fill: 'var(--ember)', d: 'M' + e + ' ' + (top + 24) + ' L' + inner + ' ' + (top + 24) +
        ' Q' + (tie + k * 20) + ' ' + (mid - 40) + ' ' + tie + ' ' + mid + ' Q' + (tie + k * 30) + ' ' + (mid + 120) + ' ' + (e + k * w * 0.16) + ' ' + h +
        ' L' + e + ' ' + h + ' Z' }));
      for (var f = 1; f < 4; f++) {
        var fx = e + k * f * w * 0.07;
        s.appendChild(el('line', { x1: fx, y1: top + 30, x2: fx + k * 4, y2: h - 10, stroke: 'var(--toadstool)', 'stroke-width': 5 }));
      }
      s.appendChild(el('rect', { x: Math.min(tie, tie - k * 30) - 4, y: mid - 8, width: 38, height: 16, rx: 8, fill: 'var(--candle)' }));
    });
    return s;
  }

  // The round door, the way into the Play Pod: timber round an ember door,
  // her words painted on it, and a candle-bright knob.
  function roundDoor(w, h) {
    var s = svg(w, h), r = w / 2 - 10, cy = h - r;
    s.appendChild(el('circle', { cx: w / 2, cy: cy, r: r, fill: 'var(--timber)' }));
    s.appendChild(el('circle', { cx: w / 2, cy: cy, r: r - 34, fill: 'var(--ember)' }));
    s.appendChild(el('circle', { cx: w / 2, cy: cy, r: r - 50, fill: 'none', stroke: 'var(--ember-2)', 'stroke-width': 4 }));
    s.appendChild(el('circle', { cx: w / 2 + r - 80, cy: cy + 30, r: 14, fill: 'var(--candle)' }));
    s.appendChild(el('rect', { x: 0, y: h - 14, width: w, height: 14, fill: 'var(--timber)' }));
    return s;
  }

  // The Glimmer Window, arched, its sash dark and glimmering, her moon stone
  // on its ledge; and under it on the floor the glowing mushroom, the way
  // down into Glow Wild Hollow, its cap candle-bright and her words on it.
  var CAP = 520;
  function glimmer(w, h) {
    var s = svg(w, h), wx = w * 0.26, ww = w * 0.48, top = 130, sill = 400;
    var shape = function (x, y, ww2, h2) { return 'M' + x + ' ' + (y + h2) + ' V' + (y + ww2 / 2) + ' A' + ww2 / 2 + ' ' + ww2 / 2 + ' 0 0 1 ' + (x + ww2) + ' ' + (y + ww2 / 2) + ' V' + (y + h2) + ' Z'; };
    s.appendChild(el('path', { fill: 'var(--timber)', d: shape(wx, top - 30, ww, sill - top + 30) }));
    s.appendChild(el('path', { fill: 'var(--moonstone)', d: shape(wx + 22, top - 8, ww - 44, sill - top) }));
    s.appendChild(el('rect', { x: w / 2 - 6, y: top, width: 12, height: sill - top, fill: 'var(--timber)' }));
    [[0.3, 0.32], [0.42, 0.5], [0.6, 0.3], [0.7, 0.6], [0.36, 0.72], [0.62, 0.8]].forEach(function (g) {
      s.appendChild(el('circle', { cx: w * g[0], cy: top + (sill - top) * g[1], r: 5, fill: 'var(--moonstone-2)' }));
    });
    s.appendChild(el('rect', { x: wx - 40, y: sill, width: ww + 80, height: 22, fill: 'var(--timber)' }));
    s.appendChild(el('ellipse', { cx: w * 0.66, cy: sill - 12, rx: 30, ry: 14, fill: 'var(--moonstone-2)' }));
    s.appendChild(el('ellipse', { cx: w / 2, cy: h - 14, rx: w * 0.46, ry: 16, fill: 'var(--ivy-2)' }));
    s.appendChild(el('rect', { x: w / 2 - 44, y: CAP + 180, width: 88, height: h - CAP - 194, rx: 20, fill: 'var(--tallow-2)' }));
    s.appendChild(el('ellipse', { cx: w / 2, cy: CAP + 110, rx: w * 0.5 - 10, ry: 150, fill: 'var(--candle)', 'fill-opacity': '0.18' }));
    s.appendChild(el('path', { fill: 'var(--candle)', d: 'M30 ' + (CAP + 200) + ' Q30 ' + CAP + ' ' + w / 2 + ' ' + CAP + ' Q' + (w - 30) + ' ' + CAP + ' ' + (w - 30) + ' ' + (CAP + 200) + ' Z' }));
    s.appendChild(el('rect', { x: 50, y: CAP + 196, width: w - 100, height: 10, rx: 5, fill: 'var(--tallow-2)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['faery-yurt.html'] = {
    prefix: 'yurt-walk',
    from: 'campgrounds.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var eye = sh / 2;
      var R = 1250, C = R + 60;                  // the yurt's radius, and its middle
      var WH = Math.max(1000, sh + 420);
      var N = 14, WW = 2 * R * Math.sin(Math.PI / N) + 40;
      var decor = [];
      var on = function (phi, r) { return { x: r * Math.sin(phi), z: C - r * Math.cos(phi), turn: phi + Math.PI }; };

      // The round wall, open at the door behind you.
      for (var k = 1; k < N; k++) {
        var p = on(k / N * Math.PI * 2, R);
        decor.push(kit.item(wall(WW, WH), { x: p.x, z: p.z, w: WW, h: WH, turn: p.turn }));
      }
      // In along one side of the wall from the door, then in along the other,
      // then the far wall, so the keyboard meets every way through before her
      // page, in the order you would walk past them.
      var stops = [kit.stop({ name: 'just inside the door, out of the night air', spot: { x: 0, z: 0 } })];
      var way = function (page, art, o) {
        var p = on(o.phi, o.r);
        var it = kit.door(page, { art: art, name: o.name, no: o.no, label: 'yurt-walk-way', cls: o.cls,
                                  x: p.x, z: p.z, w: o.w, h: o.h, turn: p.turn });
        decor.push(it);
        stops.push(kit.stop({ name: o.stop, spot: kit.front(it, o.most), link: it.link }, it));
        return it;
      };
      way('play-pod.html', roundDoor(520, 620), { phi: -Math.PI * 0.16, r: R - 40, w: 520, h: 620, cls: 'yurt-walk-pod', most: F * 1.2,
        name: 'Into the Play Pod', stop: 'at the round door in the wall, the way into the Play Pod' });
      way('faery-myths-room.html', arch(640, 860), { phi: -Math.PI * 0.36, r: R - 50, w: 640, h: 860, cls: 'yurt-walk-arch', most: F * 1.2,
        name: 'Through the Alchemist’s Arch', no: 'Myths and Legends', stop: 'at the Alchemist’s Arch, amber and amethyst set in its stone, the way through to Myths and Legends' });
      var st = on(-Math.PI * 0.56, R - 300);
      var fire = kit.item(stove(420, 620), { x: st.x, z: st.z, w: 420, h: 620, turn: st.turn });
      decor.push(fire);
      stops.push(kit.stop({ name: 'by her stove, the fly agarics round its feet', spot: kit.front(fire, F * 1.1) }, fire));
      way('glow-wild-hollow.html', glimmer(600, 900), { phi: -Math.PI * 0.79, r: R - 50, w: 600, h: 900, cls: 'yurt-walk-shroom', most: F * 1.2,
        name: 'Down and into the rhizome', no: 'Glow Wild Hollow', stop: 'by the glowing mushroom under the Glimmer Window, the way down into Glow Wild Hollow' });

      way('faery-cinema-room.html', curtain(560, 900), { phi: Math.PI * 0.37, r: R - 40, w: 560, h: 900, cls: 'yurt-walk-curtain', most: F * 1.2,
        name: 'Through to the Cinema', stop: 'at the curtain drawn back from a doorway, the way through to the Cinema' });
      way('faery-music-room.html', phonograph(460, 760), { phi: Math.PI * 0.58, r: R - 120, w: 460, h: 760, cls: 'yurt-walk-phono', most: F * 1.2,
        name: 'Through to the Music Room', stop: 'at the phonograph on its little table, the way through to the Music Room' });
      way('faery-reading-room.html', bookcase(560, 900), { phi: Math.PI * 0.79, r: R - 60, w: 560, h: 900, cls: 'yurt-walk-books', most: F * 1.2,
        name: 'Through to the Reading Room', stop: 'at her bookcase, the way through to the Reading Room' });

      var page = kit.screen(kit.page, 'Helen’s Faery Yurt’s own page, on the far wall');
      var pp = on(Math.PI, R - 70);
      var leaf = kit.item(page, { x: pp.x, z: pp.z, w: sw, h: sh, turn: pp.turn, cls: 'yurt-walk-wall' });
      stops.push(kit.stop({ name: 'at the far wall, facing the door, with her own page on it', spot: kit.front(leaf), link: page }, leaf));

      return {
        cls: 'yurt-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Her own page hangs on the far wall of the yurt, facing the door.',
        bounds: function () { return { x: [-R + 380, R - 380], z: [0, C + R - 380] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--hearth'));
          kit.oval(g, 0, C, R, R, kit.ink('--canvas-2'));
          // Her rugs, one over another, and the candle's light round the middle.
          kit.oval(g, 0, C, 820, 760, kit.ink('--timber'));
          kit.oval(g, 0, C, 760, 700, kit.ink('--canvas'));
          kit.oval(g, 0, C, 560, 520, kit.ink('--ember'), 0.25);
          kit.oval(g, 0, C, 900, 900, kit.ink('--candle'), 0.08);
          kit.oval(g, 0, C, 520, 520, kit.ink('--candle'), 0.08);
        }
      };
    }
  };
})();
