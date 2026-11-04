/* =============================================================================
   Chimera Obscura, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1
   of the rooms that could not yet be walked into.

   IT IS A CAMERA OBSCURA (§120): a room painted matte black inside, so that
   the only light in it comes down through one lens in the roof and lands on a
   round white table, and the chimera is the picture it makes there. Here the
   lens hangs overhead in its brass ring, the table lies low under it with a
   rail round it, its top lit and falling off to its edge before
   the rim, and the bench where a chimera is made stands by the wall, its boxes
   dark. The room's own page hangs on the black wall beyond the table, with
   the bench and the picture on it, to make a chimera as on the page.

   THE EDITORIAL ROOM is the one to watch, a dark room round one lit white
   surface too: there the light comes up through the table, flat and even to
   its edge. Here it comes down, and the rim stays dark. No shaft of light is
   drawn in the air, which is the Rabbit Hole's, and nothing of the Bodymind
   Booth's or the Dress-Up Den's is here.

   NOTHING MOVES and nothing makes a sound. Becky Hicks's chimeras hang on the
   page's wall, where she said yes to them, and are neither lifted nor drawn
   here. Every colour is one §120 declares, by name. It keeps nothing, sends
   nothing and fetches nothing; its page arrives through Paper Street's
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

  // The lens in the roof: a brass ring round a disc of glass, seen from below.
  function lens(w, h) {
    var s = svg(w, h), cx = w / 2, cy = h / 2;
    s.appendChild(el('ellipse', { cx: cx, cy: cy, rx: w / 2 - 4, ry: h / 2 - 4, fill: 'var(--chm-rail)' }));
    s.appendChild(el('ellipse', { cx: cx, cy: cy, rx: w / 2 - 20, ry: h / 2 - 14, fill: 'none', stroke: 'var(--chm-brass)', 'stroke-width': 10 }));
    s.appendChild(el('ellipse', { cx: cx, cy: cy, rx: w / 2 - 44, ry: h / 2 - 30, fill: 'var(--chm-table)' }));
    return s;
  }

  // The rail round the table, so nobody walks into the picture: brass, on
  // posts. The table itself is low, its white top on the floor of the scene.
  function rail(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 14, rx: 7, fill: 'var(--chm-brass)' }));
    for (var x = 20; x < w; x += (w - 40) / 6) s.appendChild(el('rect', { x: x - 6, y: 10, width: 12, height: h - 10, fill: 'var(--chm-rail)' }));
    return s;
  }

  // The bench by the wall: dark boxes, each with a line round it, where a
  // chimera is made from the parts.
  function bench(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: h * 0.4, width: w, height: 24, fill: 'var(--chm-line)' }));
    for (var x = 20; x < w - 160; x += 190) {
      s.appendChild(el('rect', { x: x, y: h * 0.4 - 120, width: 160, height: 120, fill: 'var(--chm-panel)', stroke: 'var(--chm-line)', 'stroke-width': 4 }));
      s.appendChild(el('rect', { x: x + 20, y: h * 0.4 - 96, width: 120, height: 12, fill: 'var(--chm-brass)' }));
    }
    [0.04, 0.96].forEach(function (k) { s.appendChild(el('rect', { x: w * k - 12, y: h * 0.4 + 24, width: 24, height: h * 0.6 - 24, fill: 'var(--chm-line)' })); });
    return s;
  }

  // The black wall the page hangs on.
  function wall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--chm-room)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['chimera-obscura.html'] = {
    prefix: 'chm-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var END = 2700 + F;                       // where the page hangs
      var eye = sh / 2, TABLE = 1500, TR = 520;
      var WH = Math.max(1300, sh + 700), decor = [];

      decor.push(kit.item(wall(4000, WH), { x: 0, z: END + 30, w: 4000, h: WH }));
      decor.push(kit.item(lens(560, 200), { x: 0, z: TABLE, w: 560, h: 200, y: Math.max(eye * 2 + 120, 640) }));
      decor.push(kit.item(rail(2 * TR + 260, 150), { x: 0, z: TABLE - TR - 60, w: 2 * TR + 260, h: 150 }));
      var bn = kit.item(bench(1000, 420), { x: -1150, z: TABLE + 200, w: 1000, h: 420, turn: kit.LEFT });
      decor.push(bn);

      var page = kit.screen(kit.page, 'Chimera Obscura’s own page, on the black wall past the table');
      var hung = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'chm-walk-leaf' });

      var stops = [
        kit.stop({ name: 'inside the door, the room black but for the table', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the rail round the round white table, under the lens', spot: { x: 0, z: TABLE - TR - 420 } }),
        kit.stop({ name: 'at the bench by the wall, where a chimera is made', spot: kit.front(bn, 900) }, bn),
        kit.stop({ name: 'at the black wall, with the room’s own page on it', spot: { x: 0, z: END - F }, link: page }, hung)
      ];

      return {
        cls: 'chm-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on the black wall beyond the round white table.',
        bounds: function () { return { x: [-1100, 1100], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--chm-room'));
          // The table's top, where the lens's light lands: white in the middle,
          // falling off to its edge, and dark at the rim.
          kit.oval(g, 0, TABLE, TR + 30, TR * 0.9 + 30, kit.ink('--chm-plinth'), 1);
          kit.oval(g, 0, TABLE, TR, TR * 0.9, kit.ink('--chm-line'), 1);
          kit.oval(g, 0, TABLE, TR * 0.86, TR * 0.78, kit.ink('--chm-edge'), 1);
          kit.oval(g, 0, TABLE, TR * 0.68, TR * 0.6, kit.ink('--chm-table'), 1);
        }
      };
    }
  };
})();
