/* =============================================================================
   The Foundry, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1 of
   the rooms left on Paper Street.

   IT IS THE FOUNDRY'S WORLD AND NOBODY ELSE'S (§32): a type foundry, a grey
   iron workshop under a dirty sawtooth roof, cut out of card. THE GREY IS THE
   SEPARATION: no black in it and no white, the colour of the metal, halfway
   between the street's night rooms and its paper rooms. THE LIGHT IS NORTH
   LIGHT: the roof's glazing faces away from the sun, so the light comes down
   flat, cool and from overhead, nothing has a lit face, and each thing has its
   small shadow straight beneath it. There is no furnace and no flame. BRASS IS
   THE ONLY WARM VALUE, and it is a metal rather than a light: the pulls on the
   type cases down both walls. THE ONLY PALE THING IN THE ROOM IS ONE PROOF,
   lying on the bench. The room's own page stands on an iron easel at the end,
   where the bench's words are set.

   Nothing here describes a typeface. NOTHING MOVES. Every colour is one the
   Foundry declares, by name. It keeps nothing, sends nothing and fetches
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

  // The end wall under the sawtooth roof: each tooth's glazing faces north,
  // dirty, and the grey wall under it.
  function endWall(w, h) {
    var s = svg(w, h), tooth = 300, top = h * 0.22;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--fo-floor)' }));
    for (var x = 0; x < w; x += tooth) {
      s.appendChild(el('path', { fill: 'var(--fo-roof)', d: 'M' + x + ' ' + top + ' L' + x + ' 0 L' + (x + tooth) + ' ' + top + ' Z' }));
      s.appendChild(el('path', { fill: 'var(--fo-oil)', d: 'M' + (x + 10) + ' ' + (top - 8) + ' L' + (x + 10) + ' 24 L' + (x + 120) + ' ' + (top * 0.45) + ' L' + (x + 120) + ' ' + (top - 8) + ' Z' }));
    }
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: 18, fill: 'var(--fo-bench)' }));
    s.appendChild(el('rect', { x: 0, y: h - 30, width: w, height: 30, fill: 'var(--fo-bench)' }));
    return s;
  }

  // A side wall: grey iron, the sawtooth's line along its top.
  function sideWall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--fo-floor)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h * 0.22, fill: 'var(--fo-roof)' }));
    for (var x = 0; x < w; x += 300) s.appendChild(el('rect', { x: x, y: 0, width: 14, height: h, fill: 'var(--fo-bench)' }));
    return s;
  }

  // A type case cabinet: shallow drawers stacked, a brass pull on each.
  function cases(w, h) {
    var s = svg(w, h), dh = 46;
    for (var x = 0; x < w; x += 260) {
      s.appendChild(el('rect', { x: x + 6, y: 0, width: 248, height: h, fill: 'var(--fo-bench)' }));
      for (var y = 14; y + dh < h - 20; y += dh + 6) {
        s.appendChild(el('rect', { x: x + 18, y: y, width: 224, height: dh, fill: 'var(--fo-floor)' }));
        s.appendChild(el('rect', { x: x + 112, y: y + dh / 2 - 5, width: 36, height: 10, rx: 4, fill: 'var(--fo-brass)' }));
      }
    }
    return s;
  }

  // The bench, iron, with the one proof lying on it and a forme of lead type.
  function bench(w, h) {
    var s = svg(w, h), top = h * 0.4;
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: 30, fill: 'var(--fo-bench)' }));
    [0.04, 0.48, 0.92].forEach(function (k) { s.appendChild(el('rect', { x: w * k - 12, y: top + 30, width: 24, height: h - top - 30, fill: 'var(--fo-bench)' })); });
    s.appendChild(el('rect', { x: 0, y: h * 0.82, width: w, height: 14, fill: 'var(--fo-bench)' }));
    // The proof, lying flat: a cool pale sheet, its lines set.
    s.appendChild(el('path', { fill: 'var(--fo-paper)', d: 'M' + w * 0.18 + ' ' + top + ' L' + w * 0.24 + ' ' + (top - 50) + ' H' + w * 0.52 + ' L' + w * 0.48 + ' ' + top + ' Z' }));
    for (var i = 0; i < 4; i++) s.appendChild(el('rect', { x: w * 0.25 + i * 3, y: top - 40 + i * 10, width: w * 0.2, height: 4, fill: 'var(--fo-ink)' }));
    // A forme of type, lead, in its chase.
    s.appendChild(el('rect', { x: w * 0.62, y: top - 26, width: w * 0.22, height: 26, fill: 'var(--fo-lead)', stroke: 'var(--fo-bench)', 'stroke-width': 4 }));
    for (var x = w * 0.63; x < w * 0.83; x += 10) s.appendChild(el('rect', { x: x, y: top - 22, width: 6, height: 18, fill: 'var(--fo-oil)' }));
    return s;
  }

  // The iron easel the page stands on.
  function easel(w, h) {
    var s = svg(w, h);
    [0.08, 0.92].forEach(function (k) { s.appendChild(el('rect', { x: w * k - 14, y: 0, width: 28, height: h, fill: 'var(--fo-bench)' })); });
    s.appendChild(el('rect', { x: 0, y: h * 0.86, width: w, height: 24, fill: 'var(--fo-bench)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['foundry.html'] = {
    prefix: 'fo-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var END = 2500 + F;                          // the easel
      var eye = sh / 2 + 40;
      var LIFT = 120;                              // the page stands this far up, on the easel
      var SIDE = 1000, WH = Math.max(1100, sh + 520);
      var decor = [];

      decor.push(kit.item(endWall(SIDE * 2 + 40, WH), { x: 0, z: END + 200, w: SIDE * 2 + 40, h: WH }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(sideWall(END + 600, WH), { x: side * SIDE, z: (END - 400) / 2, w: END + 600, h: WH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT, near: 0.3 }));
        decor.push(kit.item(cases(1560, 640), { x: side * (SIDE - 10), z: 1200, w: 1560, h: 640,
          turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var table = kit.item(bench(900, 360), { x: 380, z: 1500, w: 900, h: 360 });
      decor.push(table);
      decor.push(kit.item(easel(sw + 80, LIFT + sh + 60), { x: 0, z: END + 10, w: sw + 80, h: LIFT + sh + 60 }));

      var page = kit.screen(kit.page, 'The Foundry’s own page, on the iron easel at the end');
      var leaf = kit.item(page, { x: 0, z: END, y: LIFT, w: sw, h: sh, cls: 'fo-walk-page' });

      var stops = [
        kit.stop({ name: 'inside the workshop, under the sawtooth roof', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the type cases, a brass pull on every drawer', spot: { x: -SIDE + 560, z: 1200, yaw: -Math.PI / 2 } }),
        kit.stop({ name: 'at the bench, the one proof lying on it', spot: kit.front(table, F * 0.8) }, table),
        kit.stop({ name: 'at the iron easel, with the room’s own page on it', spot: { x: 0, z: END - F }, link: page }, leaf)
      ];

      return {
        cls: 'fo-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page stands on an iron easel at the end of the workshop.',
        bounds: function () { return { x: [-SIDE + 400, SIDE - 400], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--fo-floor'));
          var bench = kit.ink('--fo-bench');
          for (var z = Math.max(-600, Math.ceil(from / 400) * 400); z < Math.min(to, END + 200); z += 400) kit.quad(g, -SIDE, SIDE, z, z + 6, bench, 0.6);
          // Each thing's small hard shadow, straight beneath it.
          kit.quad(g, 380 - 470, 380 + 470, 1490, 1520, bench);
          kit.quad(g, -sw / 2 - 40, sw / 2 + 40, END - 10, END + 30, bench);
          [-1, 1].forEach(function (side) { kit.quad(g, side * (SIDE - 60), side * (SIDE - 10), 400, 2000, bench); });
        }
      };
    }
  };
})();
