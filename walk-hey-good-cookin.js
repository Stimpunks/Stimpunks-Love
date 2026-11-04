/* =============================================================================
   Hey, Good Cookin', walked into on Paper Street. Ryan's ask, 2026-11-04: round
   one of the rest of the rooms, each its own world in card.

   IT IS THE COMMUNITY KITCHEN'S WORLD AND NOBODY ELSE'S (§93): a hall where
   nobody is turned away, cut out of card. Down the left is the long window,
   fogged from end to end by the steam off the line, with the clear runs where
   a drop has gone down the glass, which is the only sharp light in here. Down
   the right is the line itself, steel, heated from underneath in hot water,
   with the speckled enamel soup kettle the room takes its blue from. Tables
   stand in the middle, a placard on each table somebody is at, and at the far
   end the room's own page hangs on the wall in an enamel frame.

   THE PLACARDS ARE THE ONLY GREEN, YELLOW AND RED IN HERE, each carrying its
   shape (a circle, a triangle, a square), and the stops beside them say in
   words what each one asks. The red one is on a two-top and never on the long
   table, as in the room. There is no lamp over the food and nothing moves at
   any setting, the steam included: the fog is drawn and stays. Every colour is
   one the room declares, by name. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Paper Street's screen().
   tools/make-paper-street.py holds each of those.
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
  function hash(i, j, k) {
    var n = Math.imul(i + 17, 374761393) ^ Math.imul(j + 2, 668265263) ^ Math.imul(k + 9, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  // The long window, fogged from end to end, with the runs down it where the
  // day shows through clear.
  function window_(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--hgc-wall)' }));
    var top = h * 0.2, bot = h * 0.86;
    s.appendChild(el('rect', { x: 20, y: top, width: w - 40, height: bot - top, fill: 'var(--hgc-fog)' }));
    for (var i = 0; i < 26; i++) {
      var x = 40 + hash(i, 1, 1) * (w - 80), y0 = top + hash(i, 1, 2) * (bot - top) * 0.4, len = 80 + hash(i, 1, 3) * (bot - y0 - 80);
      var d = 'M' + x.toFixed(1) + ' ' + y0.toFixed(1);
      for (var y = y0 + 30; y < y0 + len; y += 30) d += ' L' + (x + (hash(i, y, 4) - 0.5) * 8).toFixed(1) + ' ' + y.toFixed(1);
      s.appendChild(el('path', { d: d, fill: 'none', stroke: 'var(--hgc-day)', 'stroke-width': 5, 'stroke-linecap': 'round' }));
    }
    for (var m = 20; m <= w - 20; m += (w - 40) / 5) s.appendChild(el('rect', { x: m - 6, y: top, width: 12, height: bot - top, fill: 'var(--hgc-frame)' }));
    s.appendChild(el('rect', { x: 14, y: top - 6, width: w - 28, height: 12, fill: 'var(--hgc-frame)' }));
    s.appendChild(el('rect', { x: 14, y: bot - 6, width: w - 28, height: 16, fill: 'var(--hgc-frame)' }));
    return s;
  }

  // The line: a steel counter with its wells of hot water, pans sunk in them,
  // and the enamel soup kettle at the end of it.
  function line(w, h) {
    var s = svg(w, h), top = h * 0.46;
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: h - top, fill: 'var(--hgc-steel)' }));
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: 14, fill: 'var(--hgc-frame)' }));
    s.appendChild(el('rect', { x: 0, y: h - 26, width: w, height: 26, fill: 'var(--hgc-frame)' }));
    for (var x = 30; x < w - 260; x += 170) {
      s.appendChild(el('rect', { x: x, y: top + 34, width: 140, height: 70, rx: 6, fill: 'var(--hgc-frame)' }));
      s.appendChild(el('rect', { x: x + 12, y: top + 44, width: 116, height: 20, fill: 'var(--hgc-card)' }));
    }
    // The sneeze guard's rail, over the wells, clear.
    s.appendChild(el('rect', { x: 10, y: top - 120, width: w - 300, height: 8, fill: 'var(--hgc-frame)' }));
    for (x = 10; x < w - 290; x += 340) s.appendChild(el('rect', { x: x, y: top - 120, width: 8, height: 120, fill: 'var(--hgc-frame)' }));
    // The soup kettle, speckled.
    var kx = w - 150, ky = top - 210;
    s.appendChild(el('rect', { x: kx - 100, y: ky, width: 200, height: 210, rx: 40, fill: 'var(--hgc-enamel)' }));
    s.appendChild(el('rect', { x: kx - 110, y: ky - 18, width: 220, height: 26, rx: 12, fill: 'var(--hgc-enamel-deep)' }));
    for (var k = 0; k < 40; k++) s.appendChild(el('circle', { cx: kx - 90 + hash(k, 7, 1) * 180, cy: ky + 20 + hash(k, 7, 2) * 180, r: 2 + hash(k, 7, 3) * 2, fill: 'var(--hgc-fleck)' }));
    return s;
  }

  // A table, seen from the aisle: its top, its legs, chairs tucked in, and on
  // it a placard tent when somebody is sat there.
  function table(w, h, kind) {
    var s = svg(w, h), top = h - 150;
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: 18, rx: 4, fill: 'var(--hgc-card)', stroke: 'var(--hgc-frame)', 'stroke-width': 3 }));
    s.appendChild(el('rect', { x: 20, y: top + 18, width: 12, height: 132, fill: 'var(--hgc-frame)' }));
    s.appendChild(el('rect', { x: w - 32, y: top + 18, width: 12, height: 132, fill: 'var(--hgc-frame)' }));
    for (var c = 60; c < w - 60; c += 170) {
      s.appendChild(el('rect', { x: c, y: top + 40, width: 90, height: 14, fill: 'var(--hgc-enamel)' }));
      s.appendChild(el('rect', { x: c + 6, y: top + 54, width: 8, height: 96, fill: 'var(--hgc-enamel-deep)' }));
      s.appendChild(el('rect', { x: c + 76, y: top + 54, width: 8, height: 96, fill: 'var(--hgc-enamel-deep)' }));
    }
    if (kind) {
      var px = w / 2, py = top - 6, ink = 'var(--hgc-' + kind + ')';
      s.appendChild(el('path', { d: 'M' + (px - 60) + ' ' + py + ' L' + px + ' ' + (py - 100) + ' L' + (px + 60) + ' ' + py + ' Z', fill: 'var(--hgc-card)', stroke: 'var(--hgc-ink)', 'stroke-width': 3 }));
      if (kind === 'go') s.appendChild(el('circle', { cx: px, cy: py - 36, r: 20, fill: ink }));
      if (kind === 'ask') s.appendChild(el('path', { d: 'M' + (px - 22) + ' ' + (py - 18) + ' L' + px + ' ' + (py - 60) + ' L' + (px + 22) + ' ' + (py - 18) + ' Z', fill: ink }));
      if (kind === 'alone') s.appendChild(el('rect', { x: px - 18, y: py - 54, width: 36, height: 36, fill: ink }));
    }
    return s;
  }

  // The far wall, in the enamel's blue, round the frame the page hangs in.
  function farWall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--hgc-wall)' }));
    s.appendChild(el('rect', { x: 0, y: h - 140, width: w, height: 140, fill: 'var(--hgc-enamel)' }));
    s.appendChild(el('rect', { x: 0, y: h - 146, width: w, height: 8, fill: 'var(--hgc-enamel-deep)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['hey-good-cookin.html'] = {
    prefix: 'cookin-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 3200 + F;                       // where the far wall stands
      var SIDE = 820;                           // from the middle to the window, and to the line
      var eye = sh / 2, WH = sh + 340;
      var decor = [];

      decor.push(kit.item(window_(END + 200, WH), { x: -SIDE, z: (END + 200) / 2, w: END + 200, h: WH, turn: kit.LEFT }));
      decor.push(kit.item(line(END - F - 200, 520), { x: SIDE, z: (END - F) / 2 + 300, w: END - F - 200, h: 520, turn: kit.RIGHT }));
      decor.push(kit.item(farWall(SIDE * 2 + 400, WH), { x: 0, z: END + 40, w: SIDE * 2 + 400, h: WH }));

      // The tables down the middle: the long one with a green placard, a
      // two-top by the window with the red one, a four-top with the yellow,
      // and one nobody is at yet.
      var long = kit.item(table(760, 260, 'go'), { x: -120, z: 1200, w: 760, h: 260 });
      var two = kit.item(table(340, 260, 'alone'), { x: -560, z: 1900, w: 340, h: 260 });
      var four = kit.item(table(500, 260, 'ask'), { x: 240, z: 2350, w: 500, h: 260 });
      decor.push(long, two, four, kit.item(table(500, 260, null), { x: -300, z: 2900, w: 500, h: 260 }));

      var page = kit.screen(kit.page, 'Hey, Good Cookin’’s own page, on the far wall in an enamel frame');
      var board = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'cookin-walk-board' });

      var stops = [
        kit.stop({ name: 'inside the door, where the placards are picked up', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the long table with a green placard on it: sit wherever there’s a space', spot: { x: long.x, z: long.z - 480 } }),
        kit.stop({ name: 'at the two-top by the window with a red placard on it: please don’t sit here', spot: { x: two.x + 120, z: two.z - 420 } }),
        kit.stop({ name: 'at the four-top with a yellow placard on it: if you know somebody sat there, you can ask to join', spot: { x: four.x, z: four.z - 440 } }),
        kit.stop({ name: 'at the line, where the food is kept hot in water from underneath', spot: { x: SIDE - 360, z: 1600, yaw: -Math.PI / 2 } }),
        kit.stop({ name: 'at the far wall, with the room’s own page in an enamel frame', spot: { x: 0, z: END - F }, link: page }, board)
      ];

      return {
        cls: 'cookin-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page hangs on the far wall, past the tables.',
        bounds: function () { return { x: [-SIDE + 200, SIDE - 200], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--hgc-floor'));
          // The day through the fog, soft along the window side, no edge to it.
          kit.quad(g, -SIDE, -SIDE + 500, Math.max(near, 0), Math.min(far, END), kit.ink('--hgc-fog'), 0.5);
          // Flecks in the floor, the same every visit.
          var fleck = kit.ink('--hgc-frame');
          for (var i = 0; i < 500; i++) {
            var fx = -SIDE + hash(i, 3, 1) * SIDE * 2, fz = hash(i, 3, 2) * END;
            if (fz < near || fz > far) continue;
            kit.oval(g, fx, fz, 5, 3, fleck, 0.5);
          }
        }
      };
    }
  };
})();
