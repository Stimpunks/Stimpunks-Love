/* =============================================================================
   The Reading Room, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   1 of the rooms left on Paper Street.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§114), and this is OURS: a drawing of
   her library in card for Paper Street, in her room's own declared colours and
   nothing else, which changes nothing on her page and is hers to keep or send
   back. Claret walls lit from the FLOOR by a fire at one side, so it is warmest
   at the hearthrug and darkest at the ceiling; a pointed stone fireplace on the
   left wall with the sofa facing it, candles in brass sconces on the walls and
   never along the shelves (the Mopery's are along its shelves, and its walls
   are stone the candles never reach; these are claret because the fire does),
   and her bookcases standing in tall timber arches drawn up to a point down
   the right-hand wall. Her page hangs on the far wall in a timber frame.

   NOTHING MOVES. The fire is drawn, the candles stand still. Every colour is
   one her room declares, by name. It keeps nothing, sends nothing and fetches
   nothing; her page arrives through Paper Street's screen().
   tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var SPINES = ['--rdr-velvet', '--rdr-leather', '--rdr-brass', '--rdr-ink-2', '--rdr-ember', '--tallow', '--rdr-timber'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }
  // A pointed arch's outline, its foot on the bottom edge.
  function pointed(x, w, h, top) {
    var mid = x + w / 2, spring = top + w * 0.7;
    return 'M' + x + ' ' + h + ' V' + spring + ' Q' + x + ' ' + (top + w * 0.15) + ' ' + mid + ' ' + top +
      ' Q' + (x + w) + ' ' + (top + w * 0.15) + ' ' + (x + w) + ' ' + spring + ' V' + h + ' Z';
  }
  // A brass sconce with its candle, standing still.
  function sconce(s, x, y) {
    s.appendChild(el('rect', { x: x - 18, y: y + 40, width: 36, height: 10, fill: 'var(--rdr-brass)' }));
    s.appendChild(el('rect', { x: x - 7, y: y, width: 14, height: 42, fill: 'var(--tallow)' }));
    s.appendChild(el('circle', { cx: x, cy: y - 16, r: 26, fill: 'var(--rdr-flame-2)', 'fill-opacity': '0.16' }));
    s.appendChild(el('ellipse', { cx: x, cy: y - 14, rx: 7, ry: 13, fill: 'var(--rdr-flame-2)' }));
  }

  // A length of claret wall with a bookcase in a tall pointed timber arch,
  // and a sconce either side of it.
  function caseWall(w, h, seed) {
    var s = svg(w, h), aw = w * 0.62, ax = (w - aw) / 2, top = h * 0.12, n = seed;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rdr-wall)' }));
    s.appendChild(el('path', { fill: 'var(--rdr-timber)', d: pointed(ax - 22, aw + 44, h, top - 22) }));
    s.appendChild(el('path', { fill: 'var(--rdr-stone)', d: pointed(ax, aw, h, top) }));
    for (var y = top + aw * 0.7; y + 110 < h - 10; y += 120) {
      for (var x = ax + 8; x < ax + aw - 30; n++) {
        var bw = 16 + (n * 7) % 14, bh = 74 + (n * 11) % 28;
        s.appendChild(el('rect', { x: x, y: y + 110 - bh, width: bw - 3, height: bh, fill: 'var(' + SPINES[n % SPINES.length] + ')' }));
        x += bw;
      }
      s.appendChild(el('rect', { x: ax, y: y + 110, width: aw, height: 10, fill: 'var(--rdr-timber)' }));
    }
    sconce(s, ax - 70, h * 0.36);
    sconce(s, ax + aw + 70, h * 0.36);
    return s;
  }

  // The fireplace: a pointed stone surround, the fire in it, and the mantel
  // with its candles.
  function fireplace(w, h) {
    var s = svg(w, h), ow = w * 0.5, ox = (w - ow) / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rdr-wall)' }));
    s.appendChild(el('path', { fill: 'var(--rdr-stone)', d: pointed(w * 0.1, w * 0.8, h, h * 0.18) }));
    s.appendChild(el('rect', { x: w * 0.06, y: h * 0.44, width: w * 0.88, height: 26, fill: 'var(--rdr-timber)' }));
    sconce(s, w * 0.2, h * 0.44 - 50);
    sconce(s, w * 0.8, h * 0.44 - 50);
    s.appendChild(el('path', { fill: 'var(--rdr-wall)', d: pointed(ox, ow, h, h * 0.52) }));
    var fy = h - 30;
    s.appendChild(el('path', { fill: 'var(--rdr-ember)', d: 'M' + (ox + 30) + ' ' + fy + ' Q' + (w / 2) + ' ' + (h * 0.6) + ' ' + (ox + ow - 30) + ' ' + fy + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--rdr-flame)', d: 'M' + (ox + 60) + ' ' + fy + ' Q' + (w / 2 - 20) + ' ' + (h * 0.66) + ' ' + (w / 2) + ' ' + (h * 0.62) +
      ' Q' + (w / 2 + 30) + ' ' + (h * 0.7) + ' ' + (ox + ow - 60) + ' ' + fy + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--rdr-flame-2)', d: 'M' + (w / 2 - 50) + ' ' + fy + ' Q' + (w / 2) + ' ' + (h * 0.72) + ' ' + (w / 2 + 50) + ' ' + fy + ' Z' }));
    s.appendChild(el('rect', { x: ox + 20, y: fy, width: ow - 40, height: 14, fill: 'var(--rdr-timber)' }));
    return s;
  }

  // The sofa, velvet, its back to you, facing the fire.
  function sofa(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: h * 0.12, width: w, height: h * 0.7, rx: 40, fill: 'var(--rdr-velvet)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w * 0.14, height: h * 0.82, rx: 30, fill: 'var(--rdr-leather)' }));
    s.appendChild(el('rect', { x: w * 0.86, y: 0, width: w * 0.14, height: h * 0.82, rx: 30, fill: 'var(--rdr-leather)' }));
    s.appendChild(el('rect', { x: w * 0.04, y: h * 0.78, width: w * 0.92, height: h * 0.08, fill: 'var(--rdr-flame)', 'fill-opacity': '0.5' }));
    [0.1, 0.9].forEach(function (k) { s.appendChild(el('rect', { x: w * k - 10, y: h * 0.82, width: 20, height: h * 0.18, fill: 'var(--rdr-timber)' })); });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['faery-reading-room.html'] = {
    prefix: 'rdr-walk',
    from: 'faery-yurt.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var END = 2600 + F;                          // the far wall
      var eye = sh / 2;
      var SIDE = 820, WH = Math.max(1000, sh + 420);
      var decor = [];

      // Her bookcases down the right-hand wall, each in its arch.
      var CW = 700;
      for (var z = 300, i = 0; z < END - 200; z += CW, i++) {
        decor.push(kit.item(caseWall(CW, WH, i * 9), { x: SIDE, z: z + CW / 2, w: CW, h: WH, turn: kit.RIGHT }));
      }
      // The left-hand wall, claret, with the fireplace in it halfway down.
      var FZ = 1500;
      [[300, FZ - 450], [FZ + 450, END]].forEach(function (run) {
        var len = run[1] - run[0];
        decor.push(kit.item(caseWall(len, WH, 100 + run[0]), { x: -SIDE, z: run[0] + len / 2, w: len, h: WH, turn: kit.LEFT }));
      });
      var hearth = kit.item(fireplace(900, WH), { x: -SIDE, z: FZ, w: 900, h: WH, turn: kit.LEFT });
      decor.push(hearth);
      decor.push(kit.item(sofa(700, 300), { x: -SIDE + 620, z: FZ, w: 700, h: 300, turn: kit.LEFT }));
      // The far wall, claret, her page hung in the middle of it.
      decor.push(kit.item(caseWall(SIDE * 2 + 40, WH, 7), { x: 0, z: END + 30, w: SIDE * 2 + 40, h: WH }));

      var page = kit.screen(kit.page, 'Helen’s Reading Room’s own page, on the far wall');
      var leaf = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'rdr-walk-wall' });

      var stops = [
        kit.stop({ name: 'through the bookcase door, at the end of her library', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'on the hearthrug, the fire warm on your face', spot: kit.front(hearth, F * 1.1) }, hearth),
        kit.stop({ name: 'among her bookcases, each in its tall pointed arch', spot: { x: SIDE - 640, z: 1200, yaw: Math.PI / 2 } }),
        kit.stop({ name: 'at the far wall, with her own page in a timber frame', spot: { x: 0, z: END - F }, link: page }, leaf)
      ];

      return {
        cls: 'rdr-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Her own page hangs on the far wall, past the fire and the bookcases.',
        bounds: function () { return { x: [-SIDE + 260, SIDE - 260], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--rdr-wall'));
          // Timber boards.
          var seam = kit.ink('--rdr-stone');
          kit.quad(g, -SIDE, SIDE, Math.max(from, 0), Math.min(to, END), kit.ink('--rdr-timber'));
          for (var x = -SIDE; x <= SIDE; x += 110) kit.quad(g, x - 2, x + 2, Math.max(from, 0), Math.min(to, END), seam, 0.7);
          // The hearthrug, and the fire's light across the floor from it,
          // warmest here and nowhere else.
          kit.quad(g, -SIDE + 60, -SIDE + 560, FZ - 360, FZ + 360, kit.ink('--rdr-velvet'));
          kit.oval(g, -SIDE, FZ, 1100, 900, kit.ink('--rdr-flame'), 0.12);
          kit.oval(g, -SIDE, FZ, 650, 550, kit.ink('--rdr-flame'), 0.12);
        }
      };
    }
  };
})();
