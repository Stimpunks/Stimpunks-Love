/* =============================================================================
   Nothing For Sale, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   one of the rest of the rooms, each its own world in card. On Cel Street it
   is a turning off the Outskirts; on Paper Street it is reached by its address
   or the teleporter for now.

   IT IS THE FREE MARKET'S WORLD AND NOBODY ELSE'S (§46): a lay-by at night
   with a ring of parked cars round it, every one with its headlights left on
   and pointed at the middle, and a ring of tables inside that with things laid
   out on them to take. You come in between two of the cars; the room's own
   page stands on the far table, across the ring.

   THE ROAD'S OWN LIGHT, TURNED INWARD: the same kind of lamp from everybody at
   once, so nothing has a back, and every table throws as many shadows across
   the gravel as there are cars, hard, each a slightly different colour of
   dark. If the shadows ever go, this has become the 404's fog with tables in
   it. Some lamps are old halogen, some are LED, one pair are fog lamps, because
   everybody brought what they had. NOTHING IN THE RING MOVES, and no beam
   sweeps, because a headlight that swept would be a car leaving. Every colour
   is one §46 declares, by name. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Paper Street's screen().
   tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var LAMPS = ['var(--nfs-halogen)', 'var(--nfs-led)', 'var(--nfs-halogen)', 'var(--nfs-fog)', 'var(--nfs-led)', 'var(--nfs-halogen)', 'var(--nfs-led)'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // A car seen from in front, parked, its lamps on and pointing at you.
  function car(w, h, lamp) {
    var s = svg(w, h);
    s.appendChild(el('path', { d: 'M' + w * 0.18 + ' ' + h * 0.42 + ' L' + w * 0.28 + ' ' + h * 0.08 + ' H' + w * 0.72 + ' L' + w * 0.82 + ' ' + h * 0.42 + ' Z', fill: 'var(--nfs-car)', stroke: 'var(--nfs-lit)', 'stroke-width': 3 }));
    s.appendChild(el('path', { d: 'M' + w * 0.25 + ' ' + h * 0.4 + ' L' + w * 0.32 + ' ' + h * 0.14 + ' H' + w * 0.68 + ' L' + w * 0.75 + ' ' + h * 0.4 + ' Z', fill: 'var(--nfs-shadow)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.42, width: w, height: h * 0.42, rx: 18, fill: 'var(--nfs-car)', stroke: 'var(--nfs-lit)', 'stroke-width': 3 }));
    s.appendChild(el('rect', { x: w * 0.06, y: h * 0.84, width: w * 0.16, height: h * 0.16, fill: 'var(--nfs-shadow)' }));
    s.appendChild(el('rect', { x: w * 0.78, y: h * 0.84, width: w * 0.16, height: h * 0.16, fill: 'var(--nfs-shadow)' }));
    [0.16, 0.84].forEach(function (k) {
      s.appendChild(el('circle', { cx: w * k, cy: h * 0.58, r: h * 0.2, fill: lamp, 'fill-opacity': '0.18' }));
      s.appendChild(el('ellipse', { cx: w * k, cy: h * 0.58, rx: w * 0.07, ry: h * 0.07, fill: lamp }));
    });
    s.appendChild(el('rect', { x: w * 0.36, y: h * 0.56, width: w * 0.28, height: h * 0.1, fill: 'var(--nfs-shadow)' }));
    return s;
  }

  // A table with things on it to take, lit on every side so nothing on it
  // has a back.
  function table(w, h, n) {
    var s = svg(w, h), top = h - 130;
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: 14, fill: 'var(--nfs-table)', stroke: 'var(--nfs-dim)', 'stroke-width': 2 }));
    s.appendChild(el('rect', { x: 16, y: top + 14, width: 10, height: 116, fill: 'var(--nfs-table)' }));
    s.appendChild(el('rect', { x: w - 26, y: top + 14, width: 10, height: 116, fill: 'var(--nfs-table)' }));
    for (var i = 0; i < 4; i++) {
      var x = 30 + i * (w - 60) / 4, kind = (n + i) % 3;
      if (kind === 0) s.appendChild(el('rect', { x: x, y: top - 50, width: 60, height: 50, fill: 'var(--nfs-pale)' }));
      if (kind === 1) s.appendChild(el('rect', { x: x + 8, y: top - 24, width: 52, height: 24, fill: 'var(--nfs-text)' }));
      if (kind === 2) s.appendChild(el('path', { d: 'M' + x + ' ' + top + ' L' + (x + 30) + ' ' + (top - 60) + ' L' + (x + 60) + ' ' + top + ' Z', fill: 'var(--nfs-dim)' }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['nothing-for-sale.html'] = {
    prefix: 'nfs-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 900), sh = kit.H - 24;
      var C = 2000, CARS = 2000, TABLES = 900;  // the middle of the ring, and how far out
      var eye = sh / 2;
      var decor = [], cars = [], tables = [];

      // The cars, all round but the gap you came in by, each facing the middle.
      for (var a = -150; a <= 150; a += 30) {
        var f = a * Math.PI / 180;
        var c = kit.item(car(520, 300, LAMPS[(a / 30 + 5) % LAMPS.length]), { x: Math.sin(f) * CARS, z: C + Math.cos(f) * CARS, w: 520, h: 300, turn: -f });
        decor.push(c); cars.push(c);
      }
      // The tables, an inner ring, every one facing the middle too.
      for (var t = -150; t <= 150; t += 50) {
        var g = t * Math.PI / 180;
        if (Math.abs(t) < 20) continue;          // the far table is where the page stands
        var tb = kit.item(table(420, 200, tables.length), { x: Math.sin(g) * TABLES, z: C + Math.cos(g) * TABLES, w: 420, h: 200, turn: -g });
        decor.push(tb); tables.push(tb);
      }
      var far = kit.item(table(sw + 80, 200, 2), { x: 0, z: C + TABLES + 30, w: sw + 80, h: 200 });
      decor.push(far); tables.push(far);

      var page = kit.screen(kit.page, 'Nothing For Sale’s own page, standing on the far table');
      var sign = kit.item(page, { x: 0, z: C + TABLES, w: sw, h: sh, y: 70, cls: 'nfs-walk-sign' });

      var stops = [
        kit.stop({ name: 'between two cars, at the gap in the ring', spot: { x: 0, z: C - CARS - 200 } }),
        kit.stop({ name: 'in the middle of the ring, lit from every side at once', spot: { x: 0, z: C - 200 } }),
        kit.stop({ name: 'at a table on the left, everything on it free to take', spot: kit.front(tables[1], 700) }),
        kit.stop({ name: 'at the far table, with the room’s own page standing on it', spot: { x: 0, z: C + TABLES - F }, link: page }, sign)
      ];

      return {
        cls: 'nfs-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: C - CARS - 200 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page stands on the far table, across the ring of tables, in everybody’s headlights.',
        bounds: function () { return { x: [-TABLES, TABLES], z: [C - CARS - 300, C + TABLES - F] }; },
        ground: function (g, near, far2) {
          kit.quad(g, -6000, 6000, near, far2, kit.ink('--nfs-gravel'));
          kit.oval(g, 0, C, CARS, CARS, kit.ink('--nfs-lit'), 0.9);
          // Every table throws a shadow away from every car: hard, several
          // to a table, drawn as a run of dark across the gravel.
          var shadow = kit.ink('--nfs-shadow'), table2 = kit.ink('--nfs-table');
          tables.forEach(function (tb) {
            cars.forEach(function (cr, i) {
              var dx = tb.x - cr.x, dz = tb.z - cr.z, len = Math.sqrt(dx * dx + dz * dz);
              if (len > CARS * 1.6 || i % 2) return;
              for (var k = 1; k <= 5; k++) kit.oval(g, tb.x + dx / len * k * 60, tb.z + dz / len * k * 60, 70, 40, i % 4 ? shadow : table2, 0.35);
            });
          });
        }
      };
    }
  };
})();
