/* =============================================================================
   Learning Large, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   one of the rest of the rooms, each its own world in card.

   IT IS THE GLASSHOUSE'S WORLD AND NOBODY ELSE'S (§92): a glasshouse at night
   with every grow lamp on. Benches of seed trays run down both sides under
   bars of the old red and blue diodes, the panes either side have gone to
   mirror in the dark and show the lamps back, and at the far end, on the
   propagation bench, is the room's own page on the bench's screen.

   THE LIGHT IS A SPIKY ONE: two narrow spikes of colour, red and blue, landing
   together as magenta. So NOTHING IN HERE IS GREEN, the seedlings included,
   which under this light have no green to give back and are drawn as dark
   leaves with the light's rim on them. Where a thing blocks one diode and not
   its neighbour its shadow comes out red on one side and blue on the other,
   and that split is only ever in a shadow, never on a word. Nothing is drawn
   as the machine and nobody is drawn at all. Nothing moves at any setting.
   Every colour is one §92 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Paper Street's screen().
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
  function hash(i, j, k) {
    var n = Math.imul(i + 92, 374761393) ^ Math.imul(j + 4, 668265263) ^ Math.imul(k + 1, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  // A side of the glasshouse: panes in glazing bars, gone to mirror at night,
  // so what is in them is the lamps, shown back.
  function glazing(w, h, seed) {
    var s = svg(w, h), pane = 220;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--ll-glass)' }));
    for (var x = 0; x < w; x += pane) {
      for (var k = 0; k < 3; k++) {
        var lx = x + 40 + hash(x, seed, k) * (pane - 80), ly = 60 + k * 70 + hash(x, seed, k + 9) * 30;
        s.appendChild(el('rect', { x: lx - 30, y: ly, width: 60, height: 6, fill: 'var(--ll-lamp)', 'fill-opacity': '0.45' }));
      }
      s.appendChild(el('rect', { x: x, y: 0, width: 10, height: h, fill: 'var(--ll-bar)' }));
    }
    for (var y = 0; y < h; y += 180) s.appendChild(el('rect', { x: 0, y: y, width: w, height: 8, fill: 'var(--ll-bar)' }));
    return s;
  }

  // A bench of seed trays: a slatted top on legs, trays on it, and in every
  // tray seedlings drawn dark, each with the lamp's rim and a split shadow,
  // red on one side and blue on the other.
  function bench(w, h, seed) {
    var s = svg(w, h), top = h - 150;
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: 16, fill: 'var(--ll-bar)' }));
    for (var lx = 20; lx < w; lx += (w - 40) / 3) s.appendChild(el('rect', { x: lx, y: top + 16, width: 12, height: 134, fill: 'var(--ll-bar)' }));
    for (var tx = 16; tx + 200 < w; tx += 220) {
      s.appendChild(el('rect', { x: tx, y: top - 26, width: 200, height: 26, fill: 'var(--ll-tray)', stroke: 'var(--ll-bar)', 'stroke-width': 3 }));
      for (var c = 0; c < 5; c++) {
        var cx = tx + 22 + c * 39, tall = 30 + hash(tx, c, seed) * 40, base = top - 26;
        s.appendChild(el('ellipse', { cx: cx - 7, cy: base, rx: 10, ry: 3, fill: 'var(--ll-red)', 'fill-opacity': '0.5' }));
        s.appendChild(el('ellipse', { cx: cx + 7, cy: base, rx: 10, ry: 3, fill: 'var(--ll-blue)', 'fill-opacity': '0.5' }));
        s.appendChild(el('rect', { x: cx - 2, y: base - tall, width: 4, height: tall, fill: 'var(--ll-leaf)' }));
        s.appendChild(el('ellipse', { cx: cx - 9, cy: base - tall, rx: 10, ry: 5, fill: 'var(--ll-leaf)', stroke: 'var(--ll-rim)', 'stroke-width': 1.5 }));
        s.appendChild(el('ellipse', { cx: cx + 9, cy: base - tall - 3, rx: 10, ry: 5, fill: 'var(--ll-leaf)', stroke: 'var(--ll-rim)', 'stroke-width': 1.5 }));
      }
    }
    return s;
  }

  // A lamp bar hung over a bench: red diodes and blue, one after another.
  function lamp(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: w * 0.2, y: 0, width: 3, height: h - 24, fill: 'var(--ll-bar)' }));
    s.appendChild(el('rect', { x: w * 0.8, y: 0, width: 3, height: h - 24, fill: 'var(--ll-bar)' }));
    s.appendChild(el('rect', { x: 0, y: h - 24, width: w, height: 24, rx: 4, fill: 'var(--ll-bar)' }));
    for (var x = 12, i = 0; x < w - 8; x += 18, i++) s.appendChild(el('circle', { cx: x, cy: h - 8, r: 5, fill: i % 2 ? 'var(--ll-blue)' : 'var(--ll-red)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['learning-large.html'] = {
    prefix: 'glasshouse-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 3200 + F;                       // the propagation bench
      var SIDE = 760, eye = sh / 2, GH = sh + 460;
      var decor = [];

      [-1, 1].forEach(function (side) {
        decor.push(kit.item(glazing(END + 400, GH, side + 2), { x: side * (SIDE + 140), z: (END + 400) / 2, w: END + 400, h: GH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT }));
        decor.push(kit.item(bench(END - F - 300, 300, side + 5), { x: side * SIDE, z: (END - F) / 2 + 200, w: END - F - 300, h: 300,
          turn: side < 0 ? kit.LEFT : kit.RIGHT }));
        for (var z = 700; z < END - F - 300; z += 700) {
          decor.push(kit.item(lamp(520, 200), { x: side * (SIDE - 20), z: z, w: 520, h: 200, y: eye + 140,
            turn: side < 0 ? kit.LEFT : kit.RIGHT }));
        }
      });
      decor.push(kit.item(glazing(SIDE * 2 + 600, GH, 9), { x: 0, z: END + 60, w: SIDE * 2 + 600, h: GH }));
      // The propagation bench behind the screen, its trays either side of it.
      decor.push(kit.item(bench(sw + 640, 300, 11), { x: 0, z: END + 10, w: sw + 640, h: 300 }));

      var page = kit.screen(kit.page, 'Learning Large’s own page, on the propagation bench’s screen');
      var screen = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'glasshouse-walk-screen' });

      var stops = [
        kit.stop({ name: 'inside the door, with the lamps on all down both benches', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'between the benches, under the red and blue lamps', spot: { x: 0, z: 1400 } }),
        kit.stop({ name: 'at the left-hand bench, its seedlings dark under the lamps, their shadows split red and blue', spot: { x: -SIDE + 420, z: 2000, yaw: -kit.LEFT } }),
        kit.stop({ name: 'at the propagation bench, with the room’s own page on its screen', spot: { x: 0, z: END - F }, link: page }, screen)
      ];

      return {
        cls: 'glasshouse-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on the propagation bench’s screen at the far end, under the lamps.',
        bounds: function () { return { x: [-SIDE + 300, SIDE - 300], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--ll-night'));
          // The lamps' magenta on the path, and the slatted floor.
          var lampInk = kit.ink('--ll-lamp');
          for (var z = 700; z < END - F; z += 700) {
            kit.oval(g, -SIDE + 200, z, 260, 360, lampInk, 0.12);
            kit.oval(g, SIDE - 200, z, 260, 360, lampInk, 0.12);
          }
          var bar = kit.ink('--ll-bar');
          for (var zz = Math.max(0, Math.ceil(near / 180) * 180); zz < Math.min(far, END); zz += 180) kit.quad(g, -SIDE, SIDE, zz, zz + 6, bar);
        }
      };
    }
  };
})();
