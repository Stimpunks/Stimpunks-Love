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
   on the far wall, facing the door. The ways through on her page (the Reading
   Room, the Music Room, the Cinema, Myths and Legends, Glow Wild Hollow, the
   Play Pod) are her page's to offer; the scene adds no way between rooms.

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

  // Her bookcase: a timber case, shelf after shelf of spines.
  function bookcase(w, h) {
    var s = svg(w, h), n = 0;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, rx: 10, fill: 'var(--timber)' }));
    for (var y = 24; y + 120 <= h - 20; y += 130) {
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

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['faery-yurt.html'] = {
    prefix: 'yurt-walk',
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
      var b = on(Math.PI * 0.72, R - 60);
      var books = kit.item(bookcase(560, 820), { x: b.x, z: b.z, w: 560, h: 820, turn: b.turn });
      var a = on(-Math.PI * 0.72, R - 50);
      var gate = kit.item(arch(640, 860), { x: a.x, z: a.z, w: 640, h: 860, turn: a.turn });
      var st = on(-Math.PI * 0.4, R - 300);
      var fire = kit.item(stove(420, 620), { x: st.x, z: st.z, w: 420, h: 620, turn: st.turn });
      decor.push(books, gate, fire);

      var page = kit.screen(kit.page, 'Helen’s Faery Yurt’s own page, on the far wall');
      var pp = on(Math.PI, R - 70);
      var leaf = kit.item(page, { x: pp.x, z: pp.z, w: sw, h: sh, turn: pp.turn, cls: 'yurt-walk-wall' });

      var stops = [
        kit.stop({ name: 'just inside the door, out of the night air', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'by her stove, the fly agarics round its feet', spot: kit.front(fire, F * 1.1) }, fire),
        kit.stop({ name: 'at her bookcase', spot: kit.front(books, F * 1.2) }, books),
        kit.stop({ name: 'at the Alchemist’s Arch, amber and amethyst set in its stone', spot: kit.front(gate, F * 1.2) }, gate),
        kit.stop({ name: 'at the far wall, facing the door, with her own page on it', spot: kit.front(leaf), link: page }, leaf)
      ];

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
