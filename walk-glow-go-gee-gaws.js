/* =============================================================================
   Glow Go Gee Gaws, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   1 of the rooms left on Paper Street.

   A SHOP WITH THE LIGHTS OFF, IN EVERY COLOUR GLOW COMES IN (§67), cut out of
   card at level B3 of Arlesglad Caverns. Shelves round a small dark room, and a
   handrail running along the front of every shelf, the one light in here,
   steady and pale. Every toy on the drawn shelves is dark, in the room's unlit
   ink: nothing in the scene lights, fades or glows by itself, because a toy
   here only glows after somebody charges it, and then gives the light back
   until it has none. That is the room's whole kind of light, and the scene
   does not fake it: the toys you can charge are on the room's own page, which
   hangs on the back wall between the shelves, and they glow there.

   NOTHING MOVES and nothing is for sale. Every colour is one §67 declares, by
   name. It keeps nothing, sends nothing and makes no sound; its page arrives
   through Paper Street's screen(). tools/make-paper-street.py holds each of
   those.
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

  // A toy, unlit: a star, a moon, a ball, a bracelet, a stick, a little ghost.
  function toy(s, kind, x, base) {
    var ink = 'var(--gg-unlit)', d;
    if (kind === 0) {
      d = '';
      for (var i = 0; i < 10; i++) {
        var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 11 : 26;
        d += (i ? 'L' : 'M') + (x + Math.cos(a) * r).toFixed(1) + ' ' + (base - 28 + Math.sin(a) * r).toFixed(1) + ' ';
      }
      s.appendChild(el('path', { d: d + 'Z', fill: ink }));
    } else if (kind === 1) {
      s.appendChild(el('path', { fill: ink, d: 'M' + (x + 6) + ' ' + (base - 56) + ' A28 28 0 1 0 ' + (x + 6) + ' ' + base + ' A20 24 0 1 1 ' + (x + 6) + ' ' + (base - 56) + ' Z' }));
    } else if (kind === 2) {
      s.appendChild(el('circle', { cx: x, cy: base - 22, r: 22, fill: ink }));
    } else if (kind === 3) {
      s.appendChild(el('ellipse', { cx: x, cy: base - 12, rx: 26, ry: 12, fill: 'none', stroke: ink, 'stroke-width': 7 }));
    } else if (kind === 4) {
      s.appendChild(el('rect', { x: x - 5, y: base - 64, width: 10, height: 64, rx: 5, fill: ink }));
    } else {
      s.appendChild(el('path', { fill: ink, d: 'M' + (x - 20) + ' ' + base + ' V' + (base - 34) + ' A20 20 0 0 1 ' + (x + 20) + ' ' + (base - 34) + ' V' + base + ' L' + (x + 10) + ' ' + (base - 8) + ' L' + x + ' ' + base + ' L' + (x - 10) + ' ' + (base - 8) + ' Z' }));
    }
  }

  // Shelves of dark toys, the rail along the front of each shelf.
  function shelves(w, h, seed) {
    var s = svg(w, h), n = seed;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--gg-shelf)' }));
    for (var y = 110; y < h - 20; y += 130) {
      for (var x = 50; x < w - 40; x += 70, n++) toy(s, n % 6, x, y);
      s.appendChild(el('rect', { x: 0, y: y, width: w, height: 10, fill: 'var(--gg-shelf-line)' }));
      // The rail: the one light, steady and pale, along the front.
      s.appendChild(el('rect', { x: 0, y: y + 14, width: w, height: 6, rx: 3, fill: 'var(--gg-dim)' }));
    }
    return s;
  }

  // The counter: dark, a rail along its edge too, and a tray of glow sticks
  // that have not been bent.
  function counter(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 30, width: w, height: h - 30, fill: 'var(--gg-shelf)', stroke: 'var(--gg-shelf-line)', 'stroke-width': 6 }));
    s.appendChild(el('rect', { x: 0, y: 40, width: w, height: 6, rx: 3, fill: 'var(--gg-dim)' }));
    for (var x = 40; x < w - 40; x += 26) s.appendChild(el('rect', { x: x, y: 0, width: 10, height: 34, rx: 5, fill: 'var(--gg-unlit)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['glow-go-gee-gaws.html'] = {
    prefix: 'gg-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 900), sh = kit.H - 24;
      var END = 1500 + F;                          // the back wall
      var eye = sh / 2;
      var SIDE = 760, WH = Math.max(900, sh + 360);
      var decor = [];

      [-1, 1].forEach(function (side) {
        decor.push(kit.item(shelves(END + 300, WH, side < 0 ? 0 : 3), { x: side * SIDE, z: (END - 300) / 2, w: END + 300, h: WH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT, near: 0.3 }));
        decor.push(kit.item(shelves(SIDE - sw / 2 - 20, WH, side < 0 ? 1 : 4), { x: side * (sw / 2 + 10 + (SIDE - sw / 2 - 20) / 2), z: END + 20,
          w: SIDE - sw / 2 - 20, h: WH }));
      });
      decor.push(kit.item(shelves(SIDE * 2, WH - sh - 60, 2), { x: 0, z: END + 24, y: sh + 60, w: SIDE * 2, h: WH - sh - 60 }));
      var till = kit.item(counter(460, 280), { x: 540, z: 1450, w: 460, h: 280, turn: -0.6 });
      decor.push(till);

      var page = kit.screen(kit.page, 'Glow Go Gee Gaws’ own page, on the back wall between the shelves');
      var leaf = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'gg-walk-wall' });
      var left = kit.stop({ name: 'at the shelves, every toy on them dark until somebody charges it', spot: { x: -SIDE + 520, z: 900, yaw: -Math.PI / 2 } });

      var stops = [
        kit.stop({ name: 'in the shop with the lights off, the rail’s light along every shelf', spot: { x: 0, z: 0 } }),
        left,
        kit.stop({ name: 'at the counter, a tray of glow sticks nobody has bent', spot: kit.front(till, F * 0.8) }, till),
        kit.stop({ name: 'at the back wall, with the room’s own page on it, where the toys charge', spot: { x: 0, z: END - F }, link: page }, leaf)
      ];

      return {
        cls: 'gg-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page hangs on the back wall between the shelves; the toys you can charge are on it.',
        bounds: function () { return { x: [-SIDE + 300, SIDE - 300], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--gg-dark'));
          var line = kit.ink('--gg-shelf');
          for (var z = Math.max(-300, Math.ceil(from / 160) * 160); z < Math.min(to, END); z += 160) kit.quad(g, -SIDE, SIDE, z, z + 4, line);
          // The rail's light reaches the floor in a thin line under each wall
          // of shelves, and no further.
          [-1, 1].forEach(function (side) { kit.quad(g, side * (SIDE - 40), side * (SIDE - 10), -300, END, kit.ink('--gg-dim'), 0.12); });
        }
      };
    }
  };
})();
