/* =============================================================================
   Rescue Small Animals, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round one of the rooms still to be walked into.

   IT IS RESCUE SMALL ANIMALS' WORLD AND NOBODY ELSE'S (§89): under the
   floorboards of the shop. THE LIGHT IS THE DAY THROUGH THE CRACKS BETWEEN THE
   BOARDS, AND IT ONLY SHOWS WHERE IT LANDS: overhead the boards are dark on
   their joists, with a thin line of day wherever a crack crosses one, and
   below, the light lies on the dust as long pale strips, parallel, from above,
   and is never drawn in the air. Nobody holds it, which keeps it off Rescue A
   Cat's torch next door; it is many lines rather than one wedge, which keeps it
   off Dead Tired Society; there is no lamp and no brown, which keeps it off the
   Latibulum; it is lines rather than points, which keeps it off Stay Frosty;
   and it is nothing like Rescue A Dog's sun on snow.

   THE PLACES ARE THE PAGE'S OWN: the hatch you came down through, lit square
   above the ladder; the strips on the dust; the hutches along the wall with
   their doors open and straw in them; and a handful of hay lying in a strip,
   which is the room's job marker. THERE IS NO ANIMAL IN THE SCENE. The animals
   are the shelter's, read when the page opens, and the page stands on a board
   in a strip, where rescuing and adopting work as they do on the page, because
   shelter.js talks to the CB and is never run here. Nothing is written on the
   hutches: no name, no number, nothing about who rescued anybody.

   NOTHING MOVES. Every colour is one Rescue Small Animals declares, by name.
   It keeps nothing, sends nothing and fetches nothing; its page arrives through
   Paper Street's screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var STRIPS = [-640, -300, 60, 420];        // where the cracks overhead let the day down

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // A joist across the space overhead, the boards' dark, and a sliver of day
  // above it wherever a crack between the boards crosses it.
  function joist(w, h, cracks) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: h * 0.3, width: w, height: h * 0.7, fill: 'var(--rsa-dust)' }));
    cracks.forEach(function (x) { s.appendChild(el('rect', { x: x - 3, y: 0, width: 6, height: h * 0.3, fill: 'var(--rsa-crack)' })); });
    return s;
  }

  // A wall of the space: the foundations' dark, with hutches along it if
  // asked, their doors standing open and straw inside.
  function wall(w, h, hutches) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rsa-board)' }));
    s.appendChild(el('rect', { x: 0, y: h - 30, width: w, height: 30, fill: 'var(--rsa-dust)' }));
    if (hutches) {
      for (var x = 160; x < w - 400; x += 420) {
        var hw = 340, hh = 240, y = h - 30 - hh;
        s.appendChild(el('rect', { x: x, y: y, width: hw, height: hh, fill: 'var(--rsa-dust)', stroke: 'var(--rsa-dim)', 'stroke-width': 10 }));
        s.appendChild(el('rect', { x: x + 14, y: y + hh - 50, width: hw - 28, height: 36, fill: 'var(--rsa-link)', 'fill-opacity': '0.6' }));
        // Its door, open against the wall beside it.
        s.appendChild(el('rect', { x: x + hw + 6, y: y + 10, width: 50, height: hh - 20, fill: 'none', stroke: 'var(--rsa-dim)', 'stroke-width': 8 }));
        for (var gx = x + hw + 16; gx < x + hw + 56; gx += 12) s.appendChild(el('rect', { x: gx, y: y + 10, width: 3, height: hh - 20, fill: 'var(--rsa-dim)' }));
      }
    }
    return s;
  }

  // THE HATCH you came down through: a lit square overhead, and the ladder.
  function hatch(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 120, fill: 'var(--rsa-lit)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 120, fill: 'none', stroke: 'var(--rsa-board)', 'stroke-width': 16 }));
    s.appendChild(el('rect', { x: w * 0.25, y: 110, width: 16, height: h - 110, fill: 'var(--rsa-dim)' }));
    s.appendChild(el('rect', { x: w * 0.75 - 16, y: 110, width: 16, height: h - 110, fill: 'var(--rsa-dim)' }));
    for (var y = 180; y < h; y += 110) s.appendChild(el('rect', { x: w * 0.25, y: y, width: w * 0.5, height: 12, fill: 'var(--rsa-dim)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['rescue-small-animals.html'] = {
    prefix: 'rsa-walk',
    build: function (kit) {
      var F = kit.F;
      var sh = kit.H - 24;
      var eye = sh / 2;
      var HALF = 1000, BACK = 3000, LOW = 760;             // the boards are this far over the dust
      var decor = [];

      var cracks = STRIPS.map(function (x) { return x + HALF + 100; });
      for (var z = 500; z < BACK; z += 520) decor.push(kit.item(joist(2 * HALF + 200, 90, cracks), { x: 0, z: z, w: 2 * HALF + 200, h: 90, y: LOW }));
      decor.push(kit.item(wall(2 * HALF + 200, LOW + 220), { x: 0, z: BACK, w: 2 * HALF + 200, h: LOW + 220 }));
      decor.push(kit.item(wall(BACK + 600, LOW + 220, false), { x: -HALF, z: BACK / 2 - 300, w: BACK + 600, h: LOW + 220, turn: kit.LEFT }));
      decor.push(kit.item(wall(BACK + 600, LOW + 220, true), { x: HALF, z: BACK / 2 - 300, w: BACK + 600, h: LOW + 220, turn: kit.RIGHT }));
      decor.push(kit.item(hatch(300, LOW + 120), { x: -420, z: 200, w: 300, h: LOW + 120 }));

      // The page, on a board standing in a strip of the day.
      var PW = Math.min(kit.W - 160, 800), PH = Math.round(PW * 0.62);
      var page = kit.screen(kit.page, 'Rescue Small Animals’ own page, on a board standing in a strip of light');
      var board = kit.item(page, { x: STRIPS[1] + 40, z: 1600, w: PW, h: PH, y: 60, cls: 'rsa-walk-board' });

      var hutchRow = { x: HALF, z: 1500, w: 1600, h: 300, turn: kit.RIGHT };
      var stops = [
        kit.stop({ name: 'at the foot of the ladder, under the hatch you came down through', spot: { x: 120, z: -100 } }),
        kit.stop({ name: 'at the board in a strip of the day, with the shelter’s own page, where the animals are', spot: kit.front(board), link: page }, board),
        kit.stop({ name: 'along the hutches, their doors open and straw in them', spot: kit.front(hutchRow, 1300) })
      ];

      return {
        cls: 'rsa-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 120, z: -100 },
        stops: stops,
        decor: decor,
        arrive: 'The day comes through the cracks in strips. The shelter’s own page stands on a board in one.',
        bounds: function () { return { x: [-HALF + 200, HALF - 200], z: [-300, BACK - 600] }; },
        ground: function (g, near, far) {
          kit.quad(g, -6000, 6000, near, far, kit.ink('--rsa-dust'));
          // THE STRIPS, long and pale and parallel, where the cracks overhead
          // let the day down onto the dust.
          var lit = kit.ink('--rsa-lit');
          STRIPS.forEach(function (x) { kit.quad(g, x - 14, x + 14, Math.max(near, -600), Math.min(far, BACK), lit, 0.55); });
          // The hatch's square of day at the foot of the ladder.
          kit.quad(g, -570, -270, 40, 240, lit, 0.4);
          // A handful of hay lying in a strip: the room's job marker.
          kit.oval(g, STRIPS[2], 900, 60, 26, kit.ink('--rsa-link'), 0.9);
        }
      };
    }
  };
})();
