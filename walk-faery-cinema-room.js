/* =============================================================================
   The Cinema, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1 of
   the rooms left on Paper Street.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§121), and this is OURS: a drawing
   of her picture palace in card for Paper Street, in the colours her room
   wears (the Reading Room's, §114, at her ask) and nothing else, which changes
   nothing on her page and is hers to keep or send back. The house lights are
   down. The light comes over your head from the projection box at the back,
   one still band of it above the seats onto the silver screen in its gilt
   arch, with the velvet curtains drawn back; and on the screen is her room's
   own page. That beam is what keeps it off her other rooms (a fire from the
   floor, candles at a window) and off the Lightbulb Picture House, where the
   house lights stay up and there is no beam. Rows of velvet seats either side
   of an aisle, and along both walls her reels on their rails, in rows and
   never in a bookcase, as she asked.

   NOTHING MOVES: the projector does not flicker and its reels do not turn.
   Every colour is one her room declares, by name. It keeps nothing, sends
   nothing and fetches nothing; her page arrives through Paper Street's
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

  // The proscenium: a gilt arch round the screen, the velvet curtains drawn
  // back to either side of it, on the dark of the end wall.
  function proscenium(w, h, sw, sh, sy) {
    var s = svg(w, h), sx = (w - sw) / 2, top = h - sy - sh - 140;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rdr-wall)' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 28,
      d: 'M' + (sx - 120) + ' ' + h + ' V' + (top + 160) + ' Q' + (w / 2) + ' ' + (top - 120) + ' ' + (sx + sw + 120) + ' ' + (top + 160) + ' V' + h }));
    [-1, 1].forEach(function (side) {
      var edge = side < 0 ? sx - 100 : sx + sw + 100, out = side < 0 ? sx - 320 : sx + sw + 320;
      s.appendChild(el('path', { fill: 'var(--rdr-velvet)',
        d: 'M' + edge + ' ' + (top + 140) + ' Q' + (edge + side * 40) + ' ' + (h * 0.55) + ' ' + (edge + side * 120) + ' ' + h +
           ' H' + out + ' V' + (top + 140) + ' Z' }));
      for (var k = 1; k < 4; k++) {
        var fx = edge + side * k * 55;
        s.appendChild(el('line', { x1: fx, y1: top + 160, x2: fx + side * 30, y2: h, stroke: 'var(--rdr-wall)', 'stroke-width': 5, 'stroke-opacity': '0.6' }));
      }
      s.appendChild(el('rect', { x: Math.min(edge, out), y: h * 0.6, width: 220, height: 20, rx: 10, fill: 'var(--rdr-brass)' }));
    });
    s.appendChild(el('rect', { x: sx - 30, y: h - sy + 6, width: sw + 60, height: sy - 6, fill: 'var(--rdr-timber)' }));
    return s;
  }

  // A side wall of the house, dark, a timber dado along it.
  function plain(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rdr-stone)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.3, width: w, height: h * 0.7, fill: 'var(--rdr-wall)' }));
    s.appendChild(el('rect', { x: 0, y: h - 40, width: w, height: 40, fill: 'var(--rdr-timber)' }));
    return s;
  }

  // A row of velvet seats, seen from behind, the brass number plates on
  // their backs.
  function seats(w, h) {
    var s = svg(w, h), n = Math.floor(w / 110);
    for (var i = 0; i < n; i++) {
      var x = i * (w / n) + 6, sw = w / n - 12;
      s.appendChild(el('rect', { x: x, y: 0, width: sw, height: h * 0.8, rx: 26, fill: 'var(--rdr-velvet)' }));
      s.appendChild(el('rect', { x: x + sw / 2 - 12, y: h * 0.18, width: 24, height: 12, rx: 3, fill: 'var(--rdr-brass)' }));
    }
    s.appendChild(el('rect', { x: 0, y: h * 0.8, width: w, height: h * 0.2, fill: 'var(--rdr-timber)' }));
    return s;
  }

  // Her reels on a rail along the wall: two rows, each reel a brass rim, spokes
  // and a hub, none of them turning.
  function reels(w, h) {
    var s = svg(w, h), r = 70;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rdr-wall)' }));
    [h * 0.32, h * 0.72].forEach(function (cy) {
      s.appendChild(el('rect', { x: 0, y: cy + r + 4, width: w, height: 14, fill: 'var(--rdr-brass)' }));
      for (var cx = r + 30; cx < w - r; cx += r * 2 + 40) {
        s.appendChild(el('circle', { cx: cx, cy: cy, r: r, fill: 'var(--rdr-panel)', stroke: 'var(--rdr-brass)', 'stroke-width': 8 }));
        [[0, 1], [0.87, -0.5], [-0.87, -0.5]].forEach(function (d) {
          s.appendChild(el('circle', { cx: cx + d[0] * r * 0.52, cy: cy + d[1] * r * 0.52, r: r * 0.24, fill: 'var(--rdr-wall)' }));
        });
        s.appendChild(el('circle', { cx: cx, cy: cy, r: 12, fill: 'var(--rdr-brass)' }));
      }
    });
    return s;
  }

  // The projector's beam, still, above the seats: a faint band the width of
  // the screen, going up from it into the dark.
  function beam(w, h) {
    var s = svg(w, h);
    [[0, 0.05], [0.12, 0.05], [0.26, 0.05]].forEach(function (b) {
      s.appendChild(el('rect', { x: w * b[0], y: 0, width: w * (1 - 2 * b[0]), height: h, fill: 'var(--rdr-ink)', 'fill-opacity': String(b[1]) }));
    });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['faery-cinema-room.html'] = {
    prefix: 'cin-walk',
    from: 'faery-yurt.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 2800 + F;                          // the screen
      var eye = sh / 2 + 60;
      var SY = 120;                                // the screen stands on a low stage
      var SIDE = 1100, WH = Math.max(1100, sh + 560);
      var decor = [];

      decor.push(kit.item(proscenium(SIDE * 2 + 40, WH, sw, sh, SY), { x: 0, z: END + 20, w: SIDE * 2 + 40, h: WH }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(plain(END + 400, WH), { x: side * SIDE, z: (END - 400) / 2, w: END + 400, h: WH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT, near: 0.3 }));
      });
      // Her reels on their rails, along both walls at the back of the house.
      var left = kit.item(reels(1500, WH * 0.6), { x: -SIDE + 6, z: 900, w: 1500, h: WH * 0.6, y: 100, turn: kit.LEFT });
      decor.push(left, kit.item(reels(1500, WH * 0.6), { x: SIDE - 6, z: 900, w: 1500, h: WH * 0.6, y: 100, turn: kit.RIGHT }));
      // Rows of seats either side of the aisle, from halfway down to the front.
      for (var z = 1250; z < END - F * 0.9; z += 380) {
        [-1, 1].forEach(function (side) {
          decor.push(kit.item(seats(720, 200), { x: side * 520, z: z, w: 720, h: 200 }));
        });
      }
      decor.push(kit.item(beam(sw * 0.6, 900), { x: 0, z: END * 0.55, w: sw * 0.6, h: 900, y: eye + 120 }));

      var page = kit.screen(kit.page, 'Helen’s Cinema’s own page, up on the silver screen');
      var screenIt = kit.item(page, { x: 0, z: END, y: SY, w: sw, h: sh, cls: 'cin-walk-screen' });

      var stops = [
        kit.stop({ name: 'at the back of the house, under the projector’s beam', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at her reels on their rail along the wall', spot: kit.front(left, F * 1.1) }, left),
        kit.stop({ name: 'in the aisle between the rows of velvet seats', spot: { x: 0, z: 1500 } }),
        kit.stop({ name: 'in the front row, with her own page up on the silver screen', spot: { x: 0, z: END - F }, link: page }, screenIt)
      ];

      return {
        cls: 'cin-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Her own page is up on the silver screen at the far end, under the beam.',
        bounds: function (cam) {
          var x = cam && cam.z > 700 ? 120 : SIDE - 300;
          return { x: [-x, x], z: [0, END - F] };
        },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--rdr-stone'));
          // The carpet down the aisle and across the back, velvet with a brass
          // edge, and the dark under the seats.
          kit.quad(g, -SIDE, SIDE, Math.max(from, -300), 700, kit.ink('--rdr-wall'));
          kit.quad(g, -150, 150, 0, END, kit.ink('--rdr-brass'), 0.6);
          kit.quad(g, -136, 136, 0, END, kit.ink('--rdr-velvet'));
        }
      };
    }
  };
})();
