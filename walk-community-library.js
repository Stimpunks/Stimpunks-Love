/* =============================================================================
   The Community Library, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round 1 of the rooms that could not yet be walked into.

   IT IS THE LIBRARY'S WORLD AND NOBODY ELSE'S (§55): a public reading room at
   eleven in the morning. Oak shelving runs round the walls to head height, and
   above it the windows are set high, arched in stone, with the sky in every
   one of them; the daylight comes in from up there and washes every wall, so
   nothing in the room is in the dark. Reading tables stand down the middle,
   and at the far end, in the plaster wall over the front desk, hangs the room's
   own page, to read and press as itself. The Librarian is not drawn, in here
   or anywhere else.

   THERE IS NO FLAME ANYWHERE and the desk lamp is not even drawn: a candle in
   here would make it the Mopery at lunchtime, and it is this room that would
   move. THE ONLY RIOT IS THE SPINES, which carry no word, in the colours the
   room declares; everything else is plaster, stone and oak.

   NOTHING MOVES. Every colour is one §55 declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var SPINES = ['--cl-stamp', '--cl-sky', '--cl-ink', '--cl-card', '--cl-stone', '--cl-ink-2', '--cl-oak'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }
  function seeded(n) {
    return function () {
      n = (n + 0x6D2B79F5) | 0;
      var t = Math.imul(n ^ (n >>> 15), 1 | n);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // A long wall of the reading room: oak shelving to head height, full of
  // spines in the room's colours, and above it the high arched windows in
  // stone with the sky in each one, on plain plaster.
  function wall(r, w, h, shelfH) {
    var s = svg(w, h), base = h - shelfH;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cl-wall)' }));
    for (var x = 160; x < w - 200; x += 420) {
      var ww = 220, wt = base - 520, wb = base - 70;
      s.appendChild(el('path', { fill: 'var(--cl-stone)', d: 'M' + (x - 24) + ' ' + wb + ' V' + (wt + ww / 2) + ' A' + (ww / 2 + 24) + ' ' + (ww / 2 + 24) + ' 0 0 1 ' + (x + ww + 24) + ' ' + (wt + ww / 2) + ' V' + wb + ' Z' }));
      s.appendChild(el('path', { fill: 'var(--cl-sky)', d: 'M' + x + ' ' + (wb - 20) + ' V' + (wt + ww / 2) + ' A' + (ww / 2) + ' ' + (ww / 2) + ' 0 0 1 ' + (x + ww) + ' ' + (wt + ww / 2) + ' V' + (wb - 20) + ' Z' }));
      s.appendChild(el('rect', { x: x + ww / 2 - 4, y: wt + 20, width: 8, height: wb - wt - 40, fill: 'var(--cl-stone)' }));
    }
    s.appendChild(el('rect', { x: 0, y: base, width: w, height: shelfH, fill: 'var(--cl-oak)' }));
    var row = 120;
    for (var y = base + 16; y + row <= h - 10; y += row) {
      for (var bx = 14; bx < w - 30;) {
        var bw = 12 + Math.floor(r() * 16), bh = row - 24 - Math.floor(r() * 26);
        if (r() > 0.05) s.appendChild(el('rect', { x: bx, y: y + row - 10 - bh, width: bw - 2, height: bh, fill: 'var(' + SPINES[Math.floor(r() * SPINES.length)] + ')' }));
        bx += bw;
        if (r() < 0.012) bx += 40;
      }
      s.appendChild(el('rect', { x: 0, y: y + row - 10, width: w, height: 10, fill: 'var(--cl-oak)' }));
    }
    return s;
  }

  // A reading table: oak top, oak legs, and somebody's books left on it.
  function table(r, w, h) {
    var s = svg(w, h), top = h * 0.4;
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: 22, fill: 'var(--cl-oak)' }));
    [0.05, 0.95].forEach(function (k) { s.appendChild(el('rect', { x: w * k - 10, y: top + 22, width: 20, height: h - top - 22, fill: 'var(--cl-oak)' })); });
    for (var i = 0, x = w * 0.2; i < 3; i++, x += w * 0.08) {
      s.appendChild(el('rect', { x: x, y: top - 14 * (i + 1), width: 110 - i * 10, height: 14, fill: 'var(' + SPINES[Math.floor(r() * SPINES.length)] + ')' }));
    }
    s.appendChild(el('rect', { x: w * 0.6, y: top - 10, width: 130, height: 10, fill: 'var(--cl-card)', stroke: 'var(--cl-stone)', 'stroke-width': 2 }));
    return s;
  }

  // The end wall: plaster, the front desk in oak under the page's place, the
  // stamp on it in its date-due purple.
  function endWall(w, h, fw, fh) {
    var s = svg(w, h), cx = w / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cl-wall)' }));
    s.appendChild(el('rect', { x: cx - fw / 2 - 18, y: h - fh - 170 - 18, width: fw + 36, height: fh + 36, fill: 'var(--cl-stone)' }));
    s.appendChild(el('rect', { x: cx - fw / 2 - 80, y: h - 150, width: fw + 160, height: 150, fill: 'var(--cl-oak)' }));
    s.appendChild(el('rect', { x: cx - fw / 2 - 90, y: h - 160, width: fw + 180, height: 18, fill: 'var(--cl-oak)' }));
    s.appendChild(el('rect', { x: cx + fw / 2 - 60, y: h - 196, width: 36, height: 36, rx: 6, fill: 'var(--cl-stamp)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['community-library.html'] = {
    prefix: 'cl-walk',
    build: function (kit) {
      var r = seeded(55);
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var END = 3200 + F, WIDE = 1000;
      var eye = sh / 2, WH = Math.max(1300, sh + 760), SHELF = Math.min(eye * 2, 560), decor = [];

      [-1, 1].forEach(function (side) {
        decor.push(kit.item(wall(r, END + 300, WH, SHELF), { x: side * WIDE, z: (END + 300) / 2 - 200, w: END + 300, h: WH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      decor.push(kit.item(endWall(2 * WIDE + 40, WH, sw, sh), { x: 0, z: END + 40, w: 2 * WIDE + 40, h: WH }));
      var tables = [];
      for (var z = 900; z < END - F * 1.4; z += 900) {
        [-1, 1].forEach(function (side) {
          var t = kit.item(table(r, 640, 260), { x: side * 520, z: z, w: 640, h: 260 });
          decor.push(t); tables.push(t);
        });
      }

      var page = kit.screen(kit.page, 'The Community Library’s own page, on the wall over the front desk');
      var hung = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: 170, cls: 'cl-walk-leaf' });

      var stops = [
        kit.stop({ name: 'inside the door, the sky in every high window', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'between the reading tables, the shelves on both walls', spot: { x: 0, z: 1300 } }),
        kit.stop({ name: 'at the shelves on the left, the spines carrying no word', spot: { x: -WIDE + 520, z: 2000, yaw: -kit.LEFT } }),
        kit.stop({ name: 'at the front desk, with the room’s own page over it', spot: kit.front(hung), link: page }, hung)
      ];

      return {
        cls: 'cl-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on the wall over the front desk, at the far end of the reading room.',
        bounds: function () { return { x: [-WIDE + 300, WIDE - 300], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--cl-stone'));
          // Stone flags, and the day from the high windows lying evenly over
          // all of it: no patch, no pool.
          var seam = kit.ink('--cl-wall');
          for (var x = -WIDE; x <= WIDE; x += 200) kit.quad(g, x - 2, x + 2, Math.max(from, -200), Math.min(to, END + 40), seam);
          for (var zz = Math.max(0, Math.ceil(from / 200) * 200); zz < Math.min(to, END + 40); zz += 200) kit.quad(g, -WIDE, WIDE, zz - 2, zz + 2, seam);
        }
      };
    }
  };
})();
