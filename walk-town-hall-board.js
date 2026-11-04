/* =============================================================================
   The Board room, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1
   of the rooms still to be walked into. On Cel Street it opens off the Town
   Hall; here it is reached by its address or the teleporter for now.

   IT IS THE BOARD ROOM'S WORLD AND NOBODY ELSE'S (§80): ONE LONG TABLE WITH THE
   SAME LAMP AT EVERY SEAT. No light overhead and none at the head of the
   table: every place has the same small shaded lamp and the same pool of light
   in front of it, down both sides, and the room is dark around them. That is
   the argument, drawn: a board is a table where every seat counts the same, so
   every lamp here is drawn by the one function, at the one size, in the one
   colour, and no lamp may grow a colour or a size of its own.

   THE COLLECTION COLLECTION is the other room of many lamps, and there no two
   may be alike; here none may differ. The Directors' room next door has no
   lamp at all. The head of the table is left dark, and the room's own page,
   which says who is on the board, hangs on the long wall halfway down, so no
   seat is nearer to it for being at the head.

   NOTHING MOVES AT ANY SETTING. Every colour is one the room declares, by
   name. It keeps nothing, sends nothing and fetches nothing; its page arrives
   through Paper Street's screen(). tools/make-paper-street.py holds each of
   those.
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

  var LAMP_W = 140, LAMP_H = 200;
  // The lamp at every seat: one drawing, one size, one colour, everywhere.
  function lamp() {
    var s = svg(LAMP_W, LAMP_H), m = LAMP_W / 2;
    s.appendChild(el('ellipse', { cx: m, cy: LAMP_H - 10, rx: 44, ry: 10, fill: 'var(--bd-brass)' }));
    s.appendChild(el('rect', { x: m - 5, y: 70, width: 10, height: LAMP_H - 80, fill: 'var(--bd-brass)' }));
    s.appendChild(el('path', { d: 'M' + (m - 30) + ' 10 H' + (m + 30) + ' L' + (m + 60) + ' 80 H' + (m - 60) + ' Z', fill: 'var(--bd-shade)' }));
    s.appendChild(el('ellipse', { cx: m, cy: 82, rx: 58, ry: 8, fill: 'var(--bd-pool)' }));
    return s;
  }

  // A chair drawn up to the table, its back to you or to the wall.
  function chair(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 10, y: 0, width: w - 20, height: h * 0.6, rx: 16, fill: 'var(--bd-edge)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.6, width: w, height: 28, rx: 8, fill: 'var(--bd-edge)' }));
    s.appendChild(el('rect', { x: 14, y: h * 0.6 + 28, width: 14, height: h * 0.4 - 28, fill: 'var(--bd-edge)' }));
    s.appendChild(el('rect', { x: w - 28, y: h * 0.6 + 28, width: 14, height: h * 0.4 - 28, fill: 'var(--bd-edge)' }));
    return s;
  }

  // The long wall, dark, a rail along it, round the page halfway down.
  function longWall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--bd-room)' }));
    s.appendChild(el('rect', { x: 0, y: h - 300, width: w, height: 10, fill: 'var(--bd-edge)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['town-hall-board.html'] = {
    prefix: 'bd-walk',
    from: 'town-hall.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 900), sh = kit.H - 24;
      var T0 = 700, T1 = 3300, HALF = 230;     // the table's foot, its head, half its width
      var SIDE = 1700;                         // from the middle to each long wall
      var eye = sh / 2 + 60;
      var decor = [], seats = [];

      for (var z = T0 + 200; z < T1 - 100; z += 400) {
        [-1, 1].forEach(function (side) {
          seats.push(z);
          decor.push(kit.item(lamp(), { x: side * (HALF - 60), z: z, w: LAMP_W, h: LAMP_H }));
          decor.push(kit.item(chair(170, 300), { x: side * (HALF + 150), z: z, w: 170, h: 300, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
        });
      }
      var WH = sh + 500, LONG = T1 + 800;
      decor.push(kit.item(longWall(LONG, WH), { x: -SIDE, z: LONG / 2, w: LONG, h: WH, turn: kit.LEFT }));
      decor.push(kit.item(longWall(LONG, WH), { x: SIDE, z: LONG / 2, w: LONG, h: WH, turn: kit.RIGHT }));
      decor.push(kit.item(longWall(SIDE * 2 + 40, WH), { x: 0, z: LONG, w: SIDE * 2 + 40, h: WH }));

      var page = kit.screen(kit.page, 'The Board room’s own page, on the long wall halfway down the table');
      var MID = (T0 + T1) / 2;
      var wall = kit.item(page, { x: SIDE - 10, z: MID, w: sw, h: sh, y: 60, turn: kit.RIGHT, cls: 'bd-walk-wall' });

      var stops = [
        kit.stop({ name: 'at the foot of the long table, a lamp lit at every seat', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'beside a seat halfway down, the same lamp and the same pool as every other', spot: { x: -HALF - 400, z: MID - 600 } }),
        kit.stop({ name: 'at the long wall halfway down, with the room’s own page on it', spot: kit.front(wall), link: page }, wall),
        kit.stop({ name: 'at the head of the table, which has no lamp of its own', spot: { x: 0, z: T1 - F * 0.4 } })
      ];

      return {
        cls: 'bd-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The same lamp is lit at every seat. The room’s own page is on the long wall halfway down.',
        bounds: function () { return { x: [-SIDE + 160, SIDE - 160], z: [0, T1] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--bd-room'));
          // The table, seen from above as you walk it, and the same pool of
          // light on it at every seat, down both sides.
          kit.quad(g, -HALF, HALF, Math.max(from, T0), Math.min(to, T1), kit.ink('--bd-table'));
          kit.quad(g, -HALF - 6, -HALF, Math.max(from, T0), Math.min(to, T1), kit.ink('--bd-edge'));
          kit.quad(g, HALF, HALF + 6, Math.max(from, T0), Math.min(to, T1), kit.ink('--bd-edge'));
          var pool = kit.ink('--bd-pool');
          seats.forEach(function (z, i) { kit.oval(g, (i % 2 ? 1 : -1) * (HALF - 90), z - 60, 90, 60, pool, 0.35); });
        }
      };
    }
  };
})();
