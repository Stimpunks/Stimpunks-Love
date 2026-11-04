/* =============================================================================
   The Solarpunk Hermitage, walked into on Paper Street: pitch 03 on the
   campgrounds. Ryan's ask, 2026-11-04: round 1 of the rooms you can walk into.

   IT IS THE HERMITAGE'S WORLD AND NOBODY ELSE'S (§19), and the first DAYLIT
   room on the street: you walk out of the field's cold dusk into full morning,
   the sun low in the east (on your right), so every shadow falls long and
   sideways off it, to the west. The cabin stands on its wheels in the turf
   with its roof full of panels catching the sun, its aerial up, three
   sunflowers by the door and a rain butt at the corner, and the room's own
   page is in its big window, which is how you see in. A solar cabin that read
   as night would be an argument against itself, so nothing here is dark but
   the shadows.

   NOTHING MOVES by itself. Every colour is one §19 declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Paper
   Street's screen(). tools/make-paper-street.py holds each of those.
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

  // The cabin on its wheels: cedar boards, a roof pitched under a full rack of
  // panels, an aerial, the door, and the big window left open for the page.
  function cabin(w, h, ww, wh, sill) {
    var s = svg(w, h), cx = w / 2, eave = 260, base = h - 110;
    s.appendChild(el('rect', { x: 40, y: eave, width: w - 80, height: base - eave, fill: 'var(--cedar)' }));
    for (var y = eave + 40; y < base; y += 44) s.appendChild(el('rect', { x: 40, y: y, width: w - 80, height: 4, fill: 'var(--bakelite-2)' }));
    s.appendChild(el('path', { fill: 'var(--bakelite)', d: 'M0 ' + (eave + 20) + ' L' + cx + ' 40 L' + w + ' ' + (eave + 20) + ' Z' }));
    // The panels, catching the morning: a grid of dark cells, each lit along
    // its top edge.
    for (var px = 80; px < w - 180; px += 150) {
      var py = 40 + (eave - 40) * Math.abs(px + 70 - cx) / cx;
      s.appendChild(el('rect', { x: px, y: py + 6, width: 136, height: 70, fill: 'var(--furrow)', stroke: 'var(--noon)', 'stroke-width': 3 }));
      s.appendChild(el('rect', { x: px, y: py + 6, width: 136, height: 8, fill: 'var(--gilt)' }));
    }
    s.appendChild(el('path', { d: 'M' + (cx + 260) + ' 120 V0 M' + (cx + 220) + ' 30 H' + (cx + 300) + ' M' + (cx + 236) + ' 60 H' + (cx + 284), stroke: 'var(--bakelite)', 'stroke-width': 6 }));
    // The big window's frame, round the page's place.
    s.appendChild(el('rect', { x: cx - ww / 2 - 26, y: h - sill - wh - 26, width: ww + 52, height: wh + 52, fill: 'var(--noon-2)' }));
    // The door, at the left.
    s.appendChild(el('rect', { x: 110, y: base - 330, width: 150, height: 330, fill: 'var(--sprout-2)' }));
    s.appendChild(el('circle', { cx: 236, cy: base - 160, r: 9, fill: 'var(--gilt)' }));
    // The chassis and its wheels.
    s.appendChild(el('rect', { x: 20, y: base, width: w - 40, height: 30, fill: 'var(--bakelite)' }));
    [180, 330, w - 330, w - 180].forEach(function (x) {
      s.appendChild(el('circle', { cx: x, cy: h - 50, r: 50, fill: 'var(--bakelite)' }));
      s.appendChild(el('circle', { cx: x, cy: h - 50, r: 20, fill: 'var(--bakelite-2)' }));
    });
    return s;
  }

  // A sunflower, its face turned east to the morning.
  function sunflower(w, h) {
    var s = svg(w, h), cx = w / 2, cy = w / 2;
    s.appendChild(el('rect', { x: cx - 5, y: cy, width: 10, height: h - cy, fill: 'var(--sprout)' }));
    s.appendChild(el('ellipse', { cx: cx - 30, cy: h * 0.6, rx: 30, ry: 14, fill: 'var(--turf)' }));
    s.appendChild(el('ellipse', { cx: cx + 30, cy: h * 0.75, rx: 30, ry: 14, fill: 'var(--turf)' }));
    for (var i = 0; i < 16; i++) {
      var a = i / 16 * Math.PI * 2;
      s.appendChild(el('circle', { cx: cx + Math.cos(a) * w * 0.32, cy: cy + Math.sin(a) * w * 0.32, r: w * 0.13, fill: 'var(--yellow)' }));
    }
    s.appendChild(el('circle', { cx: cx, cy: cy, r: w * 0.24, fill: 'var(--bloom)' }));
    return s;
  }

  // The rain butt at the corner, under its downpipe.
  function butt(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 30, width: w, height: h - 30, rx: 20, fill: 'var(--sprout-2)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.4, width: w, height: 10, fill: 'var(--furrow)' }));
    s.appendChild(el('rect', { x: w / 2 - 10, y: 0, width: 20, height: 40, fill: 'var(--bakelite-2)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['solarpunk-hermitage.html'] = {
    prefix: 'hermit-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 2300 + F;                       // the cabin's front
      var SILL = 240, eye = sh / 2 + SILL, decor = [];
      var CH = sh + SILL + 560 + 110;

      decor.push(kit.item(cabin(sw + 1100, CH, sw, sh, SILL), { x: 0, z: END + 20, w: sw + 1100, h: CH }));
      var flowers = [];
      [-1, 0, 1].forEach(function (k) {
        var f = kit.item(sunflower(160, 560 + k * 60), { x: -sw / 2 - 330 + k * 120, z: END - 120 - k * 30, w: 160, h: 560 + k * 60 });
        decor.push(f); flowers.push(f);
      });
      decor.push(kit.item(butt(160, 260), { x: sw / 2 + 480, z: END - 60, w: 160, h: 260 }));

      var page = kit.screen(kit.page, 'The Solarpunk Hermitage’s own page, in the cabin’s big window');
      var win = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: SILL, cls: 'hermit-walk-window' });

      var stops = [
        kit.stop({ name: 'at the edge of the pitch, in full morning sun', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'by the sunflowers at the cabin’s door, their faces to the sun', spot: kit.front(flowers[1], 1200) }, flowers[1]),
        kit.stop({ name: 'at the cabin’s big window, with the room’s own page in it', spot: { x: 0, z: END - F }, link: page }, win)
      ];

      return {
        cls: 'hermit-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is in the cabin’s big window, across the turf in the morning sun.',
        bounds: function () { return { x: [-900, 900], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--turf'));
          // A path mown to the door.
          kit.quad(g, -sw / 2 - 420, -sw / 2 - 180, 0, END, kit.ink('--noon-2'), 0.5);
          // Long shadows off the low sun in the east, falling west.
          var dark = kit.ink('--furrow-2');
          kit.quad(g, -(sw + 1100) / 2 - 1400, -(sw + 1100) / 2 + 200, END - 60, END + 160, dark, 0.5);
          kit.quad(g, -sw / 2 - 900, -sw / 2 - 260, END - 170, END - 110, dark, 0.45);
          kit.quad(g, sw / 2 - 40, sw / 2 + 420, END - 90, END - 30, dark, 0.45);
          // A bed of seedlings by the butt.
          var sprout = kit.ink('--sprout');
          for (var i = 0; i < 5; i++) for (var j = 0; j < 3; j++) kit.oval(g, sw / 2 + 200 + i * 60, END - 520 + j * 70, 18, 12, sprout, 0.9);
        }
      };
    }
  };
})();
