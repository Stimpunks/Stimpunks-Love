/* =============================================================================
   NeuroHome, walked into on Paper Street. Ryan's ask, 2026-11-04: round one
   of the rest of the rooms, each its own world in card.

   IT IS ISHA SNOW'S ROOM AND THEIR WORLD, and this scene is OURS: a drawing of
   their room for Paper Street, in the colours their room declares (the
   import:neurohome block in love.css's :root) and nothing else. It changes
   nothing on their page and is theirs to keep or send back; a change to how
   it looks is theirs to ask for.

   It is drawn from their own words and nothing more: "Come in. The light is
   coming through the firs and bouncing off the river, and there are candles
   going in every room." So the front window down the left looks out through
   firs onto the river, pale with the light off it, and candles stand lit on
   the sill, steady; a bookshelf stands on the right with its spines in their
   four spine colours; a desk with an old wooden radio on it; and at the far
   end, where their art hangs, the room's own page. The floor is wood, because
   their house has no carpet. Where their page says nothing, the room is left
   plain.

   THEIR PHOTOGRAPHS ARE NOT IN THE SCENE: the collages on their walls are
   photographs under consent records that name the pages they are on, so they
   are seen only on the room's own page. NOTHING MOVES: the candles do not
   flicker. It keeps nothing, sends nothing and fetches nothing; their page
   arrives through Paper Street's screen(). tools/make-paper-street.py holds
   each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var SPINES = ['var(--nh-spine1)', 'var(--nh-spine2)', 'var(--nh-spine3)', 'var(--nh-spine4)'];

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

  // A candle, steady: wax, a flame, and its little halo.
  function candle(s, x, base) {
    s.appendChild(el('rect', { x: x - 9, y: base - 54, width: 18, height: 54, fill: 'var(--nh-wax)', stroke: 'var(--nh-soft)', 'stroke-width': 1.5 }));
    s.appendChild(el('circle', { cx: x, cy: base - 70, r: 22, fill: 'var(--nh-flame)', 'fill-opacity': '0.18' }));
    s.appendChild(el('ellipse', { cx: x, cy: base - 68, rx: 6, ry: 12, fill: 'var(--nh-flame)' }));
  }

  // The front window: the wall it is in, and through it the firs, the far
  // bank and the river, pale with the light coming off it, with candles going
  // along the sill.
  function frontWindow(r, w, h) {
    var s = svg(w, h), top = h * 0.16, bot = h * 0.7;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--nh-hall)' }));
    s.appendChild(el('rect', { x: 60, y: top, width: w - 120, height: bot - top, fill: 'var(--nh-sky)' }));
    s.appendChild(el('rect', { x: 60, y: top + (bot - top) * 0.5, width: w - 120, height: (bot - top) * 0.2, fill: 'var(--nh-far)' }));
    s.appendChild(el('rect', { x: 60, y: top + (bot - top) * 0.62, width: w - 120, height: (bot - top) * 0.38, fill: 'var(--nh-river)' }));
    for (var g = 0; g < 9; g++) s.appendChild(el('rect', { x: 80 + r() * (w - 200), y: top + (bot - top) * (0.68 + r() * 0.26), width: 40 + r() * 80, height: 4, fill: 'var(--nh-glint)' }));
    for (var x = 90; x < w - 90; x += 110 + r() * 60) {
      var fh = (bot - top) * (0.5 + r() * 0.35), base = top + (bot - top) * 0.66;
      s.appendChild(el('path', { d: 'M' + x + ' ' + (base - fh) + ' L' + (x + 46) + ' ' + base + ' H' + (x - 46) + ' Z', fill: r() < 0.5 ? 'var(--nh-fir)' : 'var(--nh-fir2)' }));
    }
    for (x = 60; x <= w - 60; x += (w - 120) / 4) s.appendChild(el('rect', { x: x - 8, y: top, width: 16, height: bot - top, fill: 'var(--nh-wood)' }));
    s.appendChild(el('rect', { x: 50, y: top - 10, width: w - 100, height: 14, fill: 'var(--nh-wood)' }));
    s.appendChild(el('rect', { x: 40, y: bot, width: w - 80, height: 22, fill: 'var(--nh-wood)' }));
    for (x = 140; x < w - 120; x += 260) candle(s, x, bot);
    return s;
  }

  // The bookshelf: wood, shelf after shelf of spines in their four colours,
  // and a candle on the top.
  function bookshelf(r, w, h) {
    var s = svg(w, h), top = 110;
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: h - top, fill: 'var(--nh-darkwood)' }));
    for (var y = top + 16; y + 140 <= h - 10; y += 150) {
      for (var x = 18; x < w - 34;) {
        var bw = 16 + Math.floor(r() * 16), bh = 100 + Math.floor(r() * 30);
        s.appendChild(el('rect', { x: x, y: y + 130 - bh, width: bw - 2, height: bh, fill: SPINES[Math.floor(r() * 4)] }));
        x += bw;
      }
      s.appendChild(el('rect', { x: 10, y: y + 130, width: w - 20, height: 10, fill: 'var(--nh-wood)' }));
    }
    candle(s, w * 0.3, top);
    candle(s, w * 0.72, top);
    return s;
  }

  // The desk, and the old wooden radio on it with its dial and grille.
  function desk(w, h) {
    var s = svg(w, h), top = h - 150;
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: 18, fill: 'var(--nh-wood)' }));
    s.appendChild(el('rect', { x: 14, y: top + 18, width: 16, height: 132, fill: 'var(--nh-darkwood)' }));
    s.appendChild(el('rect', { x: w - 30, y: top + 18, width: 16, height: 132, fill: 'var(--nh-darkwood)' }));
    var rx = w * 0.18, rw = 220, rh = 170;
    s.appendChild(el('path', { d: 'M' + rx + ' ' + top + ' V' + (top - rh + 60) + ' Q' + rx + ' ' + (top - rh) + ' ' + (rx + rw / 2) + ' ' + (top - rh) + ' Q' + (rx + rw) + ' ' + (top - rh) + ' ' + (rx + rw) + ' ' + (top - rh + 60) + ' V' + top + ' Z', fill: 'var(--nh-wood)', stroke: 'var(--nh-darkwood)', 'stroke-width': 4 }));
    for (var k = 0; k < 6; k++) s.appendChild(el('rect', { x: rx + 30 + k * 28, y: top - rh + 50, width: 10, height: 70, rx: 5, fill: 'var(--nh-darkwood)' }));
    s.appendChild(el('rect', { x: rx + 30, y: top - 40, width: rw - 60, height: 20, rx: 4, fill: 'var(--nh-comb)' }));
    candle(s, w * 0.75, top);
    return s;
  }

  // The far wall, plain, its skirting in their wood: where their page says
  // nothing, the room is left plain.
  function farWall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--nh-shade)' }));
    s.appendChild(el('rect', { x: 0, y: h - 40, width: w, height: 40, fill: 'var(--nh-wood)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['neurohome.html'] = {
    prefix: 'nh-walk',
    build: function (kit) {
      var r = seeded(83);
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 2600 + F;                       // the far wall, where the art hangs
      var SIDE = 860, eye = sh / 2, WH = sh + 340;
      var decor = [];

      decor.push(kit.item(frontWindow(r, END + 200, WH), { x: -SIDE, z: (END + 200) / 2, w: END + 200, h: WH, turn: kit.LEFT }));
      decor.push(kit.item(farWall(SIDE * 2 + 200, WH), { x: 0, z: END + 40, w: SIDE * 2 + 200, h: WH }));
      var shelf = kit.item(bookshelf(r, 900, WH - 60), { x: SIDE, z: 1000, w: 900, h: WH - 60, turn: kit.RIGHT });
      var table = kit.item(desk(760, 330), { x: SIDE - 20, z: 2200, w: 760, h: 330, turn: kit.RIGHT });
      decor.push(shelf, table);

      var page = kit.screen(kit.page, 'NeuroHome’s own page, on the far wall where the art hangs');
      var wall = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'nh-walk-wall' });

      var stops = [
        kit.stop({ name: 'inside the door: the light coming through the firs and off the river, candles going', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the front window, the river through the firs and candles along the sill', spot: { x: -SIDE + 520, z: 1300, yaw: -kit.LEFT } }),
        kit.stop({ name: 'at the bookshelf, a candle going on the top of it', spot: { x: SIDE - 520, z: 1000, yaw: -kit.RIGHT } }),
        kit.stop({ name: 'at the desk, with the old wooden radio on it', spot: { x: SIDE - 480, z: 2200, yaw: -kit.RIGHT } }),
        kit.stop({ name: 'at the far wall where the art hangs, with the room’s own page', spot: { x: 0, z: END - F }, link: page }, wall)
      ];

      return {
        cls: 'nh-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page hangs on the far wall, where the art hangs.',
        bounds: function () { return { x: [-SIDE + 360, SIDE - 360], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--nh-wood'));
          // Floorboards, and the light off the river lying in from the window.
          var seam = kit.ink('--nh-darkwood');
          for (var x = -SIDE; x <= SIDE; x += 120) kit.quad(g, x - 3, x + 3, Math.max(0, near), Math.min(far, END), seam);
          kit.quad(g, -SIDE, -SIDE + 600, Math.max(0, near), Math.min(far, END), kit.ink('--nh-sun'), 0.22);
        }
      };
    }
  };
})();
