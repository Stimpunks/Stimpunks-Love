/* =============================================================================
   Samefood Cafe, walked into on Paper Street. Ryan's ask, 2026-11-04: round one
   of the rooms still to be walked into.

   IT IS SAMEFOOD CAFE'S WORLD AND NOBODY ELSE'S (§47): a café under ONE EVEN
   LIGHT straight overhead that is the same at every hour, so every shadow lies
   straight under the thing that made it, a soft ring on the floor under every
   table and nowhere else. Lilac-grey laminate, pale walls, no blue anywhere.

   EVERY PLATE IS THE SAME PLATE. One mould, one colour, everywhere in the room,
   every table laid the same way with the same plate, the same mug and the same
   spoon: COVENSTEAD INVERTED, one door along, where nobody's cup is anybody
   else's. If a plate here ever differs from another, it has become Covenstead
   with a menu.

   NOTHING ON A DIVIDED PLATE OR IN A RAMEKIN TOUCHES ANYTHING ELSE. The table in
   the window is laid as the page's own window is: pesto pasta in the big well,
   nooch popcorn and cheese in wells of their own, the peanut butter in a small
   well, a mug of coffee, the apple slices in a ramekin and Ronan's ketchup in
   another, every food well inside its own well with room round it. Nothing on a
   table is turned: everything stands square. Nobody is drawn, and nothing
   passes a verdict on food. The regulars' trays, the menu and the house rules
   are the page's, which hangs on the back wall.

   NOTHING MOVES and nothing makes a sound. Every colour is one the room
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Paper Street's screen(). tools/make-paper-street.py
   holds each of those.
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

  // A café table on its pedestal, its top seen from a little above: laminate
  // with a rim, and on it the house's plate, mug and spoon, square and apart.
  function table(w, h, laid) {
    var s = svg(w, h), cx = w / 2, ty = h * 0.34, rx = w / 2 - 8, ry = h * 0.2;
    s.appendChild(el('rect', { x: cx - 16, y: ty, width: 32, height: h - ty - 16, fill: 'var(--sf-rim)' }));
    s.appendChild(el('rect', { x: cx - 90, y: h - 18, width: 180, height: 18, rx: 6, fill: 'var(--sf-rim)' }));
    s.appendChild(el('ellipse', { cx: cx, cy: ty + 10, rx: rx, ry: ry, fill: 'var(--sf-rim)' }));
    s.appendChild(el('ellipse', { cx: cx, cy: ty, rx: rx, ry: ry, fill: 'var(--sf-table)' }));
    if (laid) laid(s, cx, ty, rx, ry);
    else {
      plate(s, cx - rx * 0.2, ty, rx * 0.42, ry * 0.5);
      mug(s, cx + rx * 0.5, ty - ry * 0.3, 'var(--sf-plate)');
      s.appendChild(el('rect', { x: cx + rx * 0.3, y: ty + ry * 0.35, width: rx * 0.35, height: 8, rx: 4, fill: 'var(--sf-rim)' }));
    }
    return s;
  }
  // The house's plate: one mould, one colour, everywhere.
  function plate(s, x, y, rx, ry) {
    s.appendChild(el('ellipse', { cx: x, cy: y, rx: rx, ry: ry, fill: 'var(--sf-plate)', stroke: 'var(--sf-rim)', 'stroke-width': 4 }));
    s.appendChild(el('ellipse', { cx: x, cy: y, rx: rx * 0.72, ry: ry * 0.72, fill: 'var(--sf-well)' }));
  }
  // The house's mug, standing square; what is in it shows at its brim.
  function mug(s, x, y, brim) {
    s.appendChild(el('rect', { x: x - 26, y: y - 60, width: 52, height: 60, rx: 6, fill: 'var(--sf-plate)', stroke: 'var(--sf-rim)', 'stroke-width': 4 }));
    s.appendChild(el('ellipse', { cx: x, cy: y - 60, rx: 22, ry: 6, fill: brim }));
    s.appendChild(el('path', { d: 'M' + (x + 26) + ' ' + (y - 46) + ' q22 0 22 16 t-22 16', fill: 'none', stroke: 'var(--sf-rim)', 'stroke-width': 6 }));
  }

  // THE TABLE IN THE WINDOW, laid as the page's own window is: the divided
  // plate with every food in its own well and room round it, two ramekins and
  // the coffee, nothing touching anything else.
  function windowTable(s, cx, ty, rx, ry) {
    var px = cx - rx * 0.15, prx = rx * 0.55, pry = ry * 0.7;
    s.appendChild(el('ellipse', { cx: px, cy: ty, rx: prx, ry: pry, fill: 'var(--sf-plate)', stroke: 'var(--sf-rim)', 'stroke-width': 4 }));
    var wells = [[-0.35, 0.12, 0.42, 0.42, '--sf-pesto'], [0.4, -0.35, 0.26, 0.22, '--sf-pop'], [0.42, 0.32, 0.24, 0.24, '--sf-cheese'], [0.0, -0.5, 0.14, 0.16, '--sf-nut']];
    wells.forEach(function (w) {
      var x = px + w[0] * prx, y = ty + w[1] * pry;
      s.appendChild(el('ellipse', { cx: x, cy: y, rx: w[2] * prx, ry: w[3] * pry, fill: 'var(--sf-well)' }));
      s.appendChild(el('ellipse', { cx: x, cy: y, rx: w[2] * prx * 0.55, ry: w[3] * pry * 0.5, fill: 'var(' + w[4] + ')' }));
    });
    // The ramekins, on the left: apple slices in one, the ketchup in the other.
    [['--sf-apple', -0.82, -0.25], ['--sf-ketchup', -0.82, 0.38]].forEach(function (r) {
      var x = cx + r[1] * rx, y = ty + r[2] * ry;
      s.appendChild(el('ellipse', { cx: x, cy: y, rx: 34, ry: 15, fill: 'var(--sf-plate)', stroke: 'var(--sf-rim)', 'stroke-width': 4 }));
      s.appendChild(el('ellipse', { cx: x, cy: y, rx: 18, ry: 7, fill: 'var(' + r[0] + ')' }));
    });
    mug(s, cx + rx * 0.72, ty + ry * 0.1, 'var(--sf-coffee)');
  }

  // A wall: pale, a rim at the foot, and on the left one a wide window with
  // the even day in it.
  function wall(w, h, win) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--sf-well)' }));
    s.appendChild(el('rect', { x: 0, y: h - 24, width: w, height: 24, fill: 'var(--sf-rim)' }));
    if (win) {
      s.appendChild(el('rect', { x: win[0], y: h - 900, width: win[1], height: 560, fill: 'var(--sf-plate)', stroke: 'var(--sf-rim)', 'stroke-width': 14 }));
      s.appendChild(el('rect', { x: win[0] + win[1] / 2 - 6, y: h - 900, width: 12, height: 560, fill: 'var(--sf-rim)' }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['samefood-cafe.html'] = {
    prefix: 'sf-walk',
    build: function (kit) {
      var F = kit.F;
      var sh = kit.H - 24;
      var eye = sh / 2;
      var HALF = 1100, BACK = 2800, WH = Math.max(1000, sh + 480);
      var decor = [], tables = [];

      decor.push(kit.item(wall(2 * HALF + 200, WH), { x: 0, z: BACK, w: 2 * HALF + 200, h: WH }));
      decor.push(kit.item(wall(BACK + 600, WH, [900, 1300]), { x: -HALF, z: BACK / 2 - 300, w: BACK + 600, h: WH, turn: kit.LEFT }));
      decor.push(kit.item(wall(BACK + 600, WH), { x: HALF, z: BACK / 2 - 300, w: BACK + 600, h: WH, turn: kit.RIGHT }));

      // The tables, in rows, all square to the room and all laid the same.
      [[380, 1150], [760, 1750], [300, 2250], [-120, 1850]].forEach(function (t) {
        var o = { x: t[0], z: t[1], w: 360, h: 300 };
        decor.push(kit.item(table(360, 300), o)); tables.push(o);
      });
      var win = { x: -HALF + 380, z: 1100, w: 520, h: 360 };
      decor.push(kit.item(table(520, 360, windowTable), win)); tables.push(win);

      // The page, on the back wall.
      var PW = Math.min(kit.W - 160, 880), PH = Math.round(PW * 0.6);
      var page = kit.screen(kit.page, 'Samefood Cafe’s own page, on the back wall');
      var hung = kit.item(page, { x: 0, z: BACK - 6, w: PW, h: PH, y: 200, cls: 'sf-walk-page' });

      var stops = [
        kit.stop({ name: 'inside the door, every table laid the same way under the one even light', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the table in the window, every food on it in its own well', spot: kit.front(win, 700) }),
        kit.stop({ name: 'at the back wall, with the café’s own page, where the regulars’ trays are', spot: { x: 0, z: BACK - F }, link: page }, hung)
      ];

      return {
        cls: 'sf-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Every table is laid the same way. The café’s own page is on the back wall.',
        bounds: function () { return { x: [-HALF + 300, HALF - 300], z: [-200, BACK - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -6000, 6000, near, far, kit.ink('--sf-shade'));
          // Every shadow lies straight under the thing that made it.
          var rim = kit.ink('--sf-rim');
          tables.forEach(function (t) { kit.oval(g, t.x, t.z, t.w * 0.5, t.w * 0.28, rim, 0.45); });
        }
      };
    }
  };
})();
