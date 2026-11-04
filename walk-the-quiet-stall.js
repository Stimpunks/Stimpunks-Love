/* =============================================================================
   The Quiet Stall, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1
   of the rooms still to be walked into.

   IT IS THE QUIET STALL'S WORLD AND NOBODY ELSE'S (§140): a public restroom on
   the street, for everybody, free. Felt on the walls, cork on the floor, every
   corner rounded, and the light from coves hidden along the tops of the walls,
   so the band at the top of every wall is the brightest thing here and the
   light comes down off it low and even, from nowhere you can see. THERE IS NO
   BULB, NO TUBE AND NO WINDOW IN ANY DRAWING HERE: the moment one appears, the
   light has become the Cooldown Room's or Stay Breezy's, and this room moves.

   Down one wall the stalls, every one of them private and every one built to
   the same width, a little panel on each door saying in its colour whether it
   is free; down the other the basins with a Step 'n Wash under them that
   slides out, a changing table, and a felt bench with a folded blanket. The
   room's own page, which says how it does everything it carries, hangs at the
   end on flat wool, never on the light. The Step 'n Wash is its maker's trade
   mark, as the page says.

   NOTHING MOVES AND NOTHING HUMS, at any setting. Every colour is one the room
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

  // A felt wall, its cove band along the top: the lit ceiling's edge, and the
  // light falling off it down the felt in soft steps.
  function feltWall(s, w, h) {
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--qst-felt)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 70, fill: 'var(--qst-cove)' }));
    s.appendChild(el('rect', { x: 0, y: 70, width: w, height: 60, fill: 'var(--qst-wool)', 'fill-opacity': '0.25' }));
    s.appendChild(el('rect', { x: 0, y: 130, width: w, height: 80, fill: 'var(--qst-wool)', 'fill-opacity': '0.1' }));
  }

  // The stalls' wall: rounded doors, every one the same, each with its panel.
  function stalls(w, h, n) {
    var s = svg(w, h);
    feltWall(s, w, h);
    var dw = (w - 60) / n;
    for (var i = 0; i < n; i++) {
      var x = 30 + i * dw + 14, top = h - 620;
      s.appendChild(el('rect', { x: x, y: top, width: dw - 28, height: 620, rx: 40, fill: 'var(--qst-plum)' }));
      s.appendChild(el('rect', { x: x + 18, y: top + 18, width: dw - 64, height: 584, rx: 30, fill: 'none', stroke: 'var(--qst-ink-2)', 'stroke-width': 4 }));
      // The availability panel, in words on the page and in its colour here.
      s.appendChild(el('rect', { x: x + (dw - 28) / 2 - 50, y: top + 120, width: 100, height: 40, rx: 20, fill: i === 1 ? 'var(--qst-busy)' : 'var(--qst-free)' }));
      s.appendChild(el('circle', { cx: x + dw - 70, cy: top + 340, r: 12, fill: 'var(--qst-cork-dark)' }));
    }
    return s;
  }

  // The other wall: basins at two heights with a Step 'n Wash under the lower
  // one, the changing table, and a felt bench with a folded blanket.
  function basins(w, h) {
    var s = svg(w, h), floor = h;
    feltWall(s, w, h);
    [[160, 330], [460, 230]].forEach(function (b) {
      s.appendChild(el('rect', { x: b[0] - 120, y: floor - b[1] - 20, width: 240, height: 40, rx: 20, fill: 'var(--qst-wool)' }));
      s.appendChild(el('rect', { x: b[0] - 10, y: floor - b[1] - 70, width: 20, height: 50, rx: 8, fill: 'var(--qst-dim)' }));
    });
    s.appendChild(el('rect', { x: 380, y: floor - 70, width: 160, height: 46, rx: 14, fill: 'var(--qst-cork)' }));
    s.appendChild(el('rect', { x: 400, y: floor - 24, width: 120, height: 24, rx: 6, fill: 'var(--qst-cork-dark)' }));
    s.appendChild(el('rect', { x: 680, y: floor - 420, width: 380, height: 40, rx: 20, fill: 'var(--qst-wool)' }));
    s.appendChild(el('rect', { x: 690, y: floor - 380, width: 360, height: 26, rx: 12, fill: 'var(--qst-dim)' }));
    s.appendChild(el('rect', { x: 1200, y: floor - 220, width: 520, height: 60, rx: 30, fill: 'var(--qst-shade)' }));
    s.appendChild(el('rect', { x: 1200, y: floor - 360, width: 520, height: 150, rx: 40, fill: 'var(--qst-ink-2)' }));
    s.appendChild(el('rect', { x: 1260, y: floor - 250, width: 220, height: 40, rx: 14, fill: 'var(--qst-blanket)' }));
    s.appendChild(el('rect', { x: 1230, y: floor - 160, width: 30, height: 160, rx: 10, fill: 'var(--qst-shade)' }));
    s.appendChild(el('rect', { x: 1660, y: floor - 160, width: 30, height: 160, rx: 10, fill: 'var(--qst-shade)' }));
    return s;
  }

  // The end wall, felt with its cove, round the wool the page hangs on.
  function endWall(w, h) {
    var s = svg(w, h);
    feltWall(s, w, h);
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-quiet-stall.html'] = {
    prefix: 'qst-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var END = 2300 + F;                      // the end wall
      var SIDE = 760;                          // from the middle to each wall
      var eye = sh / 2 + 50;
      var WH = sh + 320;
      var decor = [];

      var LONG = END - 200;
      var doors = kit.item(stalls(LONG, WH, 5), { x: SIDE, z: 200 + LONG / 2, w: LONG, h: WH, turn: kit.RIGHT });
      var wash = kit.item(basins(LONG, WH), { x: -SIDE, z: 200 + LONG / 2, w: LONG, h: WH, turn: kit.LEFT });
      decor.push(doors, wash);
      decor.push(kit.item(endWall(SIDE * 2 + 40, WH), { x: 0, z: END + 20, w: SIDE * 2 + 40, h: WH }));

      var page = kit.screen(kit.page, 'The Quiet Stall’s own page, on the wool at the end of the room');
      var wool = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: 50, cls: 'qst-walk-wool' });

      var stops = [
        kit.stop({ name: 'inside the door, the light coming down soft off the ceiling', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'across from the basins and the changing table, a Step ’n Wash under the lower basin', spot: { x: SIDE - 250, z: 200 + 900, yaw: kit.LEFT * -1 } }),
        kit.stop({ name: 'across from the stalls, every one private and every one the same, each door saying whether it is free', spot: { x: -SIDE + 250, z: 200 + LONG * 0.5, yaw: kit.LEFT } }),
        kit.stop({ name: 'at the end of the room, with its own page on the wool', spot: { x: 0, z: END - F }, link: page }, wool)
      ];

      return {
        cls: 'qst-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Stalls down one wall, basins down the other, and the room’s own page on the wool at the end.',
        bounds: function () { return { x: [-SIDE + 200, SIDE - 200], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--qst-shade'));
          kit.quad(g, -SIDE, SIDE, Math.max(from, 0), Math.min(to, END + 30), kit.ink('--qst-cork'));
          // Cork tiles, the seams a shade darker.
          var seam = kit.ink('--qst-cork-dark');
          for (var x = -SIDE; x <= SIDE; x += 190) kit.quad(g, x - 2, x + 2, Math.max(from, 0), Math.min(to, END + 30), seam, 0.6);
          for (var z = 0; z < END; z += 190) kit.quad(g, -SIDE, SIDE, z - 2, z + 2, seam, 0.6);
        }
      };
    }
  };
})();
