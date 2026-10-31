/* =============================================================================
   The Arcade, walked into on Paper Street. Ryan's call, 2026-10-31: the third
   room you can walk into.

   IT IS THE ARCADE'S WORLD AND NOBODY ELSE'S (§15): a coin-op at midnight. A
   grape carpet with its confetti in it, rows of cabinets built out of hard
   blocks down both sides, every marquee lit and every screen a different black
   from the room. The cabinets share one body, which is what an arcade is and
   the one place on the street where shared chrome is the subject: the worlds
   are the SCREENS, so each game's cabinet is the page's own cabinet front for
   it, lifted off the page with its marquee, its screen and its way in, and
   walking up to one and pressing it takes you into that game. At
   the end of the aisle is the biggest cabinet, and on its screen is the
   Arcade's page itself, full size once you stand at it.

   THE CABINETS' GLOW ON THE CARPET FOLLOWS THE DIAL, AS THE ROOM'S DOES: §3
   hides the Arcade's glow at Gentle, so at Gentle no light lies on this carpet
   either. NOTHING MOVES AND NOTHING MAKES A SOUND: no bulb chases, no attract
   mode plays, because on this street nothing on a playfield moves until
   somebody puts the coin in, and the Arcade never makes a sound at all. It
   keeps nothing, sends nothing and fetches nothing; its page arrives through
   Paper Street's screen(). tools/make-paper-street.py holds each of those, and
   that the page still has the cabinet fronts this lifts.
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
  // A fixed jitter for a place on the carpet, so the confetti never shifts.
  function hash(i, j, k) {
    var n = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(k, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  var CAB_W = 300, CAB_H = 720;

  // What is on a screen: nothing moving, only what the glass shows when the
  // machine is on and nobody has put a coin in.
  function glass(s, x, y, w, h) {
    s.appendChild(el('rect', { x: x, y: y, width: w, height: h, fill: 'var(--crt)' }));
    for (var i = 0; i < 4; i++) s.appendChild(el('rect', { x: x + 16, y: y + 30 + i * 46, width: w - 32 - (i * 23) % 60, height: 6, fill: 'var(--mint)', 'fill-opacity': '0.28' }));
  }

  // A cabinet: one body for every machine, as an arcade's are.
  function cabinet() {
    var w = CAB_W, h = CAB_H, s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cab)' }));
    s.appendChild(el('rect', { x: 10, y: 10, width: w - 20, height: 96, fill: 'var(--carpet)' }));
    for (var b = 0; b < 9; b++) {
      var bx = 26 + b * (w - 52) / 8;
      s.appendChild(el('circle', { cx: bx, cy: 22, r: 5, fill: b % 2 ? 'var(--zap)' : 'var(--coin)' }));
      s.appendChild(el('circle', { cx: bx, cy: 94, r: 5, fill: b % 2 ? 'var(--coin)' : 'var(--zap)' }));
    }
    s.appendChild(el('rect', { x: 34, y: 44, width: w - 68, height: 26, fill: 'var(--coin)' }));
    s.appendChild(el('rect', { x: 24, y: 128, width: w - 48, height: 300, fill: 'var(--carpet)' }));
    glass(s, 36, 140, w - 72, 276);
    s.appendChild(el('path', { d: 'M0 450 H' + w + ' L' + (w - 24) + ' 530 H24 Z', fill: 'var(--carpet)' }));
    s.appendChild(el('circle', { cx: w * 0.28, cy: 482, r: 15, fill: 'var(--zap)' }));
    s.appendChild(el('rect', { x: w * 0.28 - 4, y: 482, width: 8, height: 32, fill: 'var(--tube-2)' }));
    s.appendChild(el('circle', { cx: w * 0.58, cy: 490, r: 12, fill: 'var(--coin)' }));
    s.appendChild(el('circle', { cx: w * 0.74, cy: 490, r: 12, fill: 'var(--mint)' }));
    s.appendChild(el('rect', { x: w / 2 - 50, y: 590, width: 100, height: 92, fill: 'var(--carpet)' }));
    s.appendChild(el('rect', { x: w / 2 - 4, y: 616, width: 8, height: 26, fill: 'var(--coin)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'none', stroke: 'var(--tube-2)', 'stroke-width': 4 }));
    return s;
  }

  // The biggest cabinet, round the screen the Arcade's page is on.
  function bigCabinet(w, h, sw, sh) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cab)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'none', stroke: 'var(--tube-2)', 'stroke-width': 6 }));
    var mTop = 20, mH = h - sh - 70;
    s.appendChild(el('rect', { x: 30, y: mTop, width: w - 60, height: mH, fill: 'var(--carpet)' }));
    for (var b = 0; b < 15; b++) {
      var bx = 50 + b * (w - 100) / 14;
      s.appendChild(el('circle', { cx: bx, cy: mTop + 16, r: 7, fill: b % 2 ? 'var(--zap)' : 'var(--coin)' }));
      s.appendChild(el('circle', { cx: bx, cy: mTop + mH - 16, r: 7, fill: b % 2 ? 'var(--coin)' : 'var(--zap)' }));
    }
    s.appendChild(el('rect', { x: m - (w - 200) / 2, y: mTop + mH / 2 - 18, width: w - 200, height: 36, fill: 'var(--coin)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  // The change machine, against the wall at the end: a coin chute, a slot for
  // notes, nothing in it lit beyond its own panel.
  function changer(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cab)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'none', stroke: 'var(--tube-2)', 'stroke-width': 4 }));
    s.appendChild(el('rect', { x: 20, y: 24, width: w - 40, height: 70, fill: 'var(--carpet)' }));
    s.appendChild(el('rect', { x: 34, y: 44, width: w - 68, height: 30, fill: 'var(--coin)' }));
    s.appendChild(el('rect', { x: w / 2 - 40, y: 150, width: 80, height: 10, fill: 'var(--tube)' }));
    s.appendChild(el('rect', { x: w / 2 - 6, y: 200, width: 12, height: 40, fill: 'var(--coin)' }));
    s.appendChild(el('rect', { x: 30, y: h - 160, width: w - 60, height: 90, fill: 'var(--carpet)' }));
    s.appendChild(el('rect', { x: 46, y: h - 120, width: w - 92, height: 14, fill: 'var(--mint)', 'fill-opacity': '0.4' }));
    return s;
  }

  // A bench against the wall, padded in the carpet's own grape, for waiting a
  // turn or not playing at all.
  function bench(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: h * 0.1, width: w, height: h * 0.42, rx: 12, fill: 'var(--cab)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.5, width: w, height: h * 0.22, rx: 8, fill: 'var(--cab)', stroke: 'var(--tube-2)', 'stroke-width': 3 }));
    s.appendChild(el('rect', { x: 18, y: h * 0.72, width: 14, height: h * 0.28, fill: 'var(--tube-2)' }));
    s.appendChild(el('rect', { x: w - 32, y: h * 0.72, width: 14, height: h * 0.28, fill: 'var(--tube-2)' }));
    return s;
  }

  window.lovePaperRooms['arcade.html'] = {
    prefix: 'arc-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 3600 + F;                       // where the biggest cabinet stands
      var AISLE = 470;                          // from the middle of the aisle to the cabinets along each wall
      var eye = sh / 2;
      var decor = [], cabs = [], stops = [];

      // The page first, because the games' cabinets are lifted off it; it is
      // stood up at the end of the aisle last, so the games come first as you
      // Tab down it.
      var page = kit.screen(kit.page, 'The Arcade’s own page, on the biggest cabinet’s screen');

      stops.push(kit.stop({ name: 'inside the door, on the carpet', spot: { x: 0, z: 0 } }));

      // THE CABINETS STAND ALONG BOTH WALLS, FACING ACROSS THE AISLE, every one
      // the same body, as an arcade's are, with the games' own machines among
      // them where you can walk up to them and turn to face them.
      var gameAt = { 2: [0, -1], 4: [1, 1], 6: [2, -1] }, row = 0;
      for (var z = 600; z < END - F * 1.2; z += CAB_W + 30, row++) {
        [-1, 1].forEach(function (side) {
          var x = side * AISLE, turn = side < 0 ? kit.LEFT : kit.RIGHT;
          var g = gameAt[row] && gameAt[row][1] === side ? gameAt[row][0] : null;
          if (g != null) {
            // A GAME'S CABINET IS THE PAGE'S OWN cabinet front, lifted off it:
            // its marquee, its screen and its way into the game, in the page's
            // own words, so nothing here can call a game what its page does not.
            var it = kit.lift(page, '.cabfront', { n: g, x: x, z: z, w: CAB_W, turn: turn, cls: 'arc-walk-cab' });
            var name = (function (it) {
              return function () {
                var m = it.el.querySelector('.cabfront__marquee');
                return 'at a game’s cabinet' + (m ? ': ' + m.textContent.trim() : '');
              };
            })(it);
            var press = (function (it) {
              return { focus: function (o) { var a = it.el.querySelector('a[href]'); if (a) a.focus(o); } };
            })(it);
            stops.push(kit.stop({ name: name, spot: kit.front(it, AISLE * 2 - 120), link: press }, it));
            cabs.push(it);
          } else {
            var d = kit.item(cabinet(), { x: x, z: z, w: CAB_W, h: CAB_H, turn: turn });
            decor.push(d); cabs.push(d);
          }
        });
      }
      decor.push(kit.item(bench(420, 220), { x: AISLE - 10, z: END - F * 1.5, w: 420, h: 220, turn: kit.RIGHT }));
      decor.push(kit.item(changer(260, 760), { x: -AISLE + 10, z: END - F * 1.5, w: 260, h: 760, turn: kit.LEFT }));

      var bw = sw + 160, bh = sh + 300;
      decor.push(kit.item(bigCabinet(bw, bh, sw, sh), { x: 0, z: END + 30, w: bw, h: bh }));
      var screen = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'arc-walk-screen' });
      stops.push(kit.stop({ name: 'at the biggest cabinet, with the room’s own page on its screen',
        spot: { x: 0, z: END - F }, link: page }, screen));

      return {
        cls: 'arc-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Three of the cabinets along the walls are the games; the Arcade’s own page is on the biggest one, at the end.',
        bounds: function () { return { x: [-AISLE + 60, AISLE - 60], z: [0, END - F] }; },
        ground: function (g, from, to) {
          var cz = (from + to) / 2;
          kit.quad(g, -4000, 4000, from, to, kit.ink('--carpet'));
          // The cabinets' light on the carpet, which the room shows only above
          // Gentle, as its own glow is.
          if (document.documentElement.getAttribute('data-intensity') !== 'gentle') {
            var coin = kit.ink('--coin');
            cabs.forEach(function (c) { kit.oval(g, c.x - Math.sign(c.x) * 140, c.z, 110, 170, coin, 0.07); });
          }
          // The confetti in the carpet, the same every visit.
          var inks = [kit.ink('--coin'), kit.ink('--mint'), kit.ink('--zap')];
          var z0 = Math.max(0, Math.floor((cz - F * 1.5) / 110)), z1 = Math.min(Math.ceil((END + 200) / 110), Math.ceil((cz + F * 7) / 110));
          for (var j = z0; j < z1; j++) {
            for (var i = -11; i <= 11; i++) {
              var h = hash(i, j, 1);
              if (h > 0.55) continue;
              var px = i * 110 + hash(i, j, 2) * 80, pz = j * 110 + hash(i, j, 3) * 80;
              kit.quad(g, px, px + 14, pz, pz + 14, inks[Math.floor(hash(i, j, 4) * 3)]);
            }
          }
        }
      };
    }
  };
})();
