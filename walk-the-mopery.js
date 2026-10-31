/* =============================================================================
   The Mopery, walked into on Paper Street. Ryan's call, 2026-10-31: the second
   room you can walk into, chosen for being the Jungle Room's opposite.

   IT IS THE MOPERY'S WORLD AND NOBODY ELSE'S (§22): a library somebody has been
   let into after everybody has gone home. Blue-black stone all the way to the
   skirting, bookcases down both sides of the aisle, and a candle on top of
   every case whose light goes about a foot and stops: so each flame has a halo
   the width of a hand and lights nothing round it, and there is no warm pool
   on the flagstones anywhere. If light from these candles ever reaches the
   floor or a wall, this has become the yurt with a bigger bookshelf. The only
   other light is cold, through the tall windows at the end of the aisle, and
   in front of them, on a lectern, is the Mopery's page itself in a gilt edge,
   which you read and press as the page, full size once you stand at it.

   Every spine is one of §22's nine measured spine colours, by name, and every
   other colour is one the room declares. NOTHING MOVES: the room's sign swings
   at MAX on its page, which is on the lectern with its own dial, and no flame
   in here flickers at any setting. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Paper Street's screen(), the one way a
   room's page arrives. tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var SPINES = ['--mop-oxblood', '--mop-sugar', '--mop-inkspine', '--mop-graphite', '--mop-tar',
                '--mop-wine', '--mop-vellum', '--mop-dust', '--mop-moss'];

  // The same shelves every visit: a small fixed-seed generator.
  function seeded(n) {
    return function () {
      n = (n + 0x6D2B79F5) | 0;
      var t = Math.imul(n ^ (n >>> 15), 1 | n);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // A candle stood on the top of a case: wax, a flame, and a halo the width of
  // a hand. Nothing round it is lit.
  function candle(s, x, top) {
    s.appendChild(el('rect', { x: x - 11, y: top - 70, width: 22, height: 70, fill: 'var(--mop-wax)' }));
    s.appendChild(el('circle', { cx: x, cy: top - 92, r: 34, fill: 'var(--mop-flame)', 'fill-opacity': '0.16' }));
    s.appendChild(el('ellipse', { cx: x, cy: top - 90, rx: 9, ry: 17, fill: 'var(--mop-flame)' }));
  }

  // A bookcase: a frame of dark wood, shelf after shelf of spines, candles on
  // top. Down an aisle each case hides the top of the one beyond it everywhere
  // but along the edge nearest the aisle, so that is where the candles stand.
  function bookcase(r, w, h, side) {
    var top = 130, s = svg(w, h + top);
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: h, fill: 'var(--mop-shelf)' }));
    var shelf = 150, inset = 16;
    for (var y = top + inset; y + shelf <= top + h - inset; y += shelf) {
      var x = inset;
      while (x < w - inset - 14) {
        var bw = 14 + Math.floor(r() * 18);
        if (x + bw > w - inset) break;
        var bh = shelf - 26 - Math.floor(r() * 28);
        if (r() < 0.06) { x += bw; continue; }       // a gap where somebody has a book out
        s.appendChild(el('rect', { x: x, y: y + shelf - 8 - bh, width: bw - 2, height: bh,
          fill: 'var(' + SPINES[Math.floor(r() * SPINES.length)] + ')' }));
        x += bw;
      }
      s.appendChild(el('rect', { x: inset - 4, y: y + shelf - 8, width: w - 2 * inset + 8, height: 8, fill: 'var(--mop-rule)' }));
    }
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: h, fill: 'none', stroke: 'var(--mop-stone)', 'stroke-width': 12 }));
    var inner = side < 0 ? w - 36 : 36, step = side < 0 ? -64 : 64;
    candle(s, inner, top);
    candle(s, inner + step, top);
    if (r() < 0.5) candle(s, inner + step * 2, top);
    return s;
  }

  // The end wall: stone, and two tall windows the cold comes down through.
  function endWall(w, h, gap) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--mop-stone)' }));
    [-1, 1].forEach(function (side) {
      var cx = m + side * (gap / 2 + 170), ww = 220, top = h * 0.18, bot = h - 40;
      s.appendChild(el('path', { fill: 'var(--mop-rule)',
        d: 'M' + (cx - ww / 2) + ' ' + bot + ' V' + (top + ww / 2) + ' A' + (ww / 2) + ' ' + (ww / 2) + ' 0 0 1 ' + (cx + ww / 2) + ' ' + (top + ww / 2) + ' V' + bot + ' Z' }));
      for (var k = 1; k < 3; k++) {
        s.appendChild(el('rect', { x: cx - ww / 2 + k * ww / 3 - 3, y: top + 20, width: 6, height: bot - top - 20, fill: 'var(--mop-deep)' }));
      }
      for (var y = top + ww / 2 + 80; y < bot; y += 140) {
        s.appendChild(el('rect', { x: cx - ww / 2, y: y, width: ww, height: 6, fill: 'var(--mop-deep)' }));
      }
    });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-mopery.html'] = {
    prefix: 'mop-walk',
    build: function (kit) {
      var r = seeded(22);
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 3000 + F;                       // where the lectern stands
      var clear = function (x, z, w) { return z < END - F * 1.1 || Math.abs(x) - w / 2 > sw / 2 + 30; };
      var decor = [];
      var CH = Math.max(900, sh + 220);         // well over your head, their tops and candles in view down the aisle

      for (var z = 400; z < END + 200; z += 420) {
        [-1, 1].forEach(function (side) {
          var w = 480 + Math.floor(r() * 120), x = side * (270 + w / 2);
          if (clear(x, z, w)) decor.push(kit.item(bookcase(r, w, CH, side), { x: x, z: z, w: w, h: CH + 130 }));
        });
      }
      decor.push(kit.item(endWall(3200, CH + 400, sw), { x: 0, z: END + 260, w: 3200, h: CH + 400 }));

      // The page, on the lectern, in a gilt edge.
      var page = kit.screen(kit.page, 'The Mopery’s own page, on the lectern');
      var leaf = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'mop-walk-leaf' });

      var stops = [
        kit.stop({ name: 'inside the door, at the end of the stacks', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'between the stacks, halfway along', spot: { x: 0, z: (END - F) * 0.5 } }),
        kit.stop({ name: 'at the lectern, with the room’s own page open on it', spot: { x: 0, z: END - F }, link: page }, leaf)
      ];

      return {
        cls: 'mop-walk',
        eye: sh / 2,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is open on the lectern at the end of the stacks.',
        bounds: function () { return { x: [-240, 240], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--mop-night'));
          // Flagstones, cold all the way down: no candle's light reaches them.
          var line = kit.ink('--mop-stone');
          for (var x = -240; x <= 240; x += 160) kit.quad(g, x - 2, x + 2, Math.max(near, 0), Math.min(far, END + 260), line);
          for (var zz = Math.max(0, Math.ceil(near / 220) * 220); zz < Math.min(far, END + 260); zz += 220) kit.quad(g, -240, 240, zz, zz + 4, line);
        }
      };
    }
  };
})();
