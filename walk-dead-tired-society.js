/* =============================================================================
   Dead Tired Society, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round 1 of the rooms left on Paper Street.

   IT IS THE SOCIETY'S WORLD AND NOBODY ELSE'S (§40): a room somebody has
   borrowed after hours, cut out of card, with the big lights off and the door
   on the left left ajar. THE ONLY LIGHT IS THE CORRIDOR'S, through the gap, and
   it lies across the floor as one hard wedge that NOBODY IS SITTING IN: the
   chairs stand in a loose circle further in, clear of it, the folding tables
   are stacked against the wall, the coats hang on the pegs by the door, and
   the room's own page hangs on the far wall in the shade. --dts-hall is drawn
   on the floor and in the gap of the door and carries nothing; no word in
   here stands in it, because masking is performing under a light and this is
   the room where nothing has to. The tubes in the corridor are steady.

   It is not the Mopery, which the name invites: no candle, no book, no stone,
   nothing old. It is not the Latibulum either, a burrow you are alone in, brown
   and lamplit: this is a plum room with chairs for several. Nobody is drawn.

   NOTHING MOVES. Every colour is one §40 declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
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

  // A stacking chair: a moulded seat and back on four thin legs.
  function chair(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: w * 0.14, y: 0, width: w * 0.72, height: h * 0.46, rx: 18, fill: 'var(--dts-edge)' }));
    s.appendChild(el('rect', { x: w * 0.2, y: h * 0.06, width: w * 0.6, height: h * 0.32, rx: 12, fill: 'var(--dts-deep)', 'fill-opacity': '0.35' }));
    s.appendChild(el('rect', { x: w * 0.08, y: h * 0.5, width: w * 0.84, height: h * 0.1, rx: 6, fill: 'var(--dts-edge)' }));
    [0.12, 0.28, 0.72, 0.88].forEach(function (k) {
      s.appendChild(el('rect', { x: w * k - 3, y: h * 0.58, width: 6, height: h * 0.42, fill: 'var(--dts-dim)' }));
    });
    return s;
  }

  // Folding tables, folded and stacked on their edges against the wall.
  function tables(w, h) {
    var s = svg(w, h);
    for (var i = 0; i < 4; i++) {
      s.appendChild(el('rect', { x: i * 26, y: i * 10, width: w - 90, height: h - i * 10, rx: 4,
        fill: 'var(--dts-deep)', stroke: 'var(--dts-edge)', 'stroke-width': 6 }));
    }
    return s;
  }

  // The pegs by the door, with coats and a bag on them.
  function pegs(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 30, width: w, height: 22, fill: 'var(--dts-edge)' }));
    for (var x = 60, n = 0; x < w - 40; x += 150, n++) {
      s.appendChild(el('rect', { x: x - 6, y: 52, width: 12, height: 26, fill: 'var(--dts-dim)' }));
      s.appendChild(el('path', { fill: 'var(--dts-deep)', stroke: 'var(--dts-edge)', 'stroke-width': 4,
        d: 'M' + (x - 14) + ' 74 L' + (x - 58) + ' ' + (n % 2 ? h * 0.62 : h - 10) + ' H' + (x + 58) + ' L' + (x + 14) + ' 74 Z' }));
    }
    s.appendChild(el('rect', { x: w - 110, y: h * 0.52, width: 84, height: 110, rx: 14, fill: 'var(--dts-edge)' }));
    return s;
  }

  // The door you came in by, left ajar: the corridor's light in the gap.
  function door(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--dts-deep)' }));
    s.appendChild(el('rect', { x: w * 0.12, y: 20, width: w * 0.1, height: h - 20, fill: 'var(--dts-hall)' }));
    s.appendChild(el('rect', { x: w * 0.22, y: 20, width: w * 0.7, height: h - 20, fill: 'var(--dts-room)', stroke: 'var(--dts-edge)', 'stroke-width': 6 }));
    s.appendChild(el('circle', { cx: w * 0.82, cy: h * 0.55, r: 9, fill: 'var(--dts-dim)' }));
    return s;
  }

  // The far wall: the room's plum, ceiling panels dark above it.
  function farWall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--dts-room)' }));
    for (var x = 0; x < w; x += 240) s.appendChild(el('rect', { x: x + 6, y: 0, width: 228, height: 90, fill: 'var(--dts-deep)' }));
    s.appendChild(el('rect', { x: 0, y: h - 30, width: w, height: 30, fill: 'var(--dts-deep)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['dead-tired-society.html'] = {
    prefix: 'dts-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var END = 2300 + F;                         // the far wall
      var eye = sh / 2;
      var decor = [];
      var SIDE = 760;                             // the side walls
      var DZ = 1250;                              // where the door is, on the left wall
      var WH = Math.max(900, sh + 300);

      // The two side walls, plain plum, a dark skirting along their feet.
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(farWall(END + 300, WH), { x: side * SIDE, z: (END - 300) / 2, w: END + 300, h: WH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      // The door you came in by, on the left wall, left ajar.
      var DH = Math.max(700, sh + 120);
      decor.push(kit.item(door(460, DH), { x: -SIDE + 4, z: DZ, w: 460, h: DH, turn: kit.LEFT }));
      // The pegs by the door, nearer you on the same wall.
      var hooks = kit.item(pegs(700, 420), { x: -SIDE + 6, z: 560, w: 700, h: 420, y: 140, turn: kit.LEFT });
      decor.push(hooks);
      // The circle of chairs, on the right and further in, clear of the wedge,
      // with a gap where you come into it.
      var CX = 380, CZ = 2150, R = 300;
      for (var k = 1; k < 8; k++) {
        var phi = k / 8 * Math.PI * 2;
        decor.push(kit.item(chair(150, 220), { x: CX + R * Math.sin(phi), z: CZ - R * Math.cos(phi), w: 150, h: 220, turn: phi + Math.PI }));
      }
      decor.push(kit.item(tables(560, 340), { x: SIDE - 10, z: 1100, w: 560, h: 340, turn: kit.RIGHT }));
      decor.push(kit.item(farWall(SIDE * 2 + 40, WH), { x: 0, z: END + 30, w: SIDE * 2 + 40, h: WH }));

      var page = kit.screen(kit.page, 'Dead Tired Society’s own page, on the far wall, in the shade');
      var wall = kit.item(page, { x: -160, z: END, w: sw, h: sh, cls: 'dts-walk-wall' });

      var stops = [
        kit.stop({ name: 'inside the room, out of the corridor’s light', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the pegs by the door, coats and a bag on them', spot: kit.front(hooks, F * 0.9) }, hooks),
        kit.stop({ name: 'by the circle of chairs, one of them empty for you', spot: { x: CX - 100, z: CZ - R - F * 0.6 } }),
        kit.stop({ name: 'at the far wall, in the shade, with the room’s own page on it', spot: { x: -160, z: END - F }, link: page }, wall)
      ];

      return {
        cls: 'dts-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page hangs on the far wall, in the shade, past the light from the door.',
        bounds: function () { return { x: [-SIDE + 200, SIDE - 200], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--dts-room'));
          // Carpet tiles, the room's own dark between them.
          var line = kit.ink('--dts-deep');
          for (var x = -SIDE; x <= SIDE; x += 200) kit.quad(g, x - 2, x + 2, Math.max(from, -300), Math.min(to, END), line);
          for (var z = Math.max(-300, Math.ceil(from / 200) * 200); z < Math.min(to, END); z += 200) kit.quad(g, -SIDE, SIDE, z, z + 4, line);
          // THE WEDGE: the corridor's light through the gap in the door, across
          // the floor from the left wall, widening and hard-edged, with nobody
          // in it. Laid in narrow strips so its edges are straight.
          var hall = kit.ink('--dts-hall');
          for (var xx = -SIDE; xx < 200; xx += 8) {
            var half = 24 + (xx + SIDE) * 0.4;
            kit.quad(g, xx, xx + 8, DZ - half, DZ + half, hall, 0.32);
          }
        }
      };
    }
  };
})();
