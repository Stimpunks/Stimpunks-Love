/* =============================================================================
   The Operations Room, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round 1 of the rooms that could not yet be walked into.

   IT IS THE OPERATIONS ROOM'S WORLD AND SHARES NOTHING WITH THE HOUSE IT OPENS
   OFF (§72): down the steps, a building's plant room with no window in it,
   near-black concrete, and every main painted the colour of what it carries,
   so anybody can tell which is which without opening anything. Air blue along
   the left-hand wall, gas yellow along the right, water green across under the
   ceiling with the lamp hung from it, and the fire main red up the far wall
   beside the room's own page. A brass tag on every valve, a tank in the
   corner, and the log on its clipboard by the door.

   THE LIGHT IS ONE CAGED LAMP ON A HOOK, AND ITS CAGE IS IN EVERY SHADOW: the
   bars of its guard throw a fan of hard lines across the concrete floor from
   the point under the bulb. The stripes are on the floor only; the page on the
   wall stands on its own ground, so no bar's shadow ever crosses a word. If the
   pipes ever lose their colours, the room has lost its argument.

   NOTHING MOVES AT ANY SETTING, the lamp included: a swinging bulb is a shadow
   moving across everything in the room. Every colour is one §72 declares, by
   name. It keeps nothing, sends nothing and fetches nothing; its page arrives
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

  // A valve on a main, with its brass tag hanging off it.
  function valve(s, x, y, r) {
    s.appendChild(el('circle', { cx: x, cy: y - r - 26, r: 22, fill: 'none', stroke: 'var(--op-steel)', 'stroke-width': 8 }));
    s.appendChild(el('rect', { x: x - 5, y: y - r - 26, width: 10, height: 26, fill: 'var(--op-steel)' }));
    s.appendChild(el('rect', { x: x + 16, y: y + r + 8, width: 34, height: 22, rx: 3, fill: 'var(--op-brass)' }));
    s.appendChild(el('rect', { x: x + 6, y: y + r - 2, width: 3, height: 14, fill: 'var(--op-brass)' }));
  }

  // A wall of the plant room: bare wall, a painted band at its foot, and one
  // main running its length in its service colour, valved and tagged.
  function wall(w, h, main, lift) {
    var s = svg(w, h), y = h - lift, r = 26;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--op-wall)' }));
    s.appendChild(el('rect', { x: 0, y: h - 90, width: w, height: 90, fill: 'var(--op-steel)' }));
    if (main) {
      s.appendChild(el('rect', { x: 0, y: y - r, width: w, height: r * 2, fill: 'var(' + main + ')' }));
      for (var x = 80; x < w; x += 420) {
        s.appendChild(el('rect', { x: x, y: y - r - 8, width: 22, height: r * 2 + 16, fill: 'var(--op-steel)' }));
      }
      for (x = 300; x < w - 100; x += 840) valve(s, x, y, r);
    }
    return s;
  }

  // The far wall, with the fire main up it beside the page's place.
  function farWall(w, h, fw) {
    var s = wall(w, h, null, 0), mx = w / 2 + fw / 2 + 120;
    s.appendChild(el('rect', { x: mx - 30, y: 0, width: 60, height: h - 90, fill: 'var(--op-red)' }));
    valve(s, mx, h * 0.55, 30);
    s.appendChild(el('rect', { x: w / 2 - fw / 2 - 24, y: h - 90 - 40, width: fw + 48, height: 30, fill: 'var(--op-concrete)' }));
    return s;
  }

  // The water main across under the ceiling, and the work lamp hanging from
  // it in its wire guard, lit and still.
  function mainAndLamp(w, h) {
    var s = svg(w, h), cx = w / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 56, fill: 'var(--op-green)' }));
    for (var x = 60; x < w; x += 300) s.appendChild(el('rect', { x: x, y: -8, width: 20, height: 72, fill: 'var(--op-steel)' }));
    s.appendChild(el('rect', { x: cx - 3, y: 56, width: 6, height: h - 170, fill: 'var(--op-steel)' }));
    s.appendChild(el('circle', { cx: cx, cy: h - 70, r: 34, fill: 'var(--op-lamp)' }));
    for (var k = -2; k <= 2; k++) s.appendChild(el('rect', { x: cx + k * 18 - 2, y: h - 120, width: 4, height: 100, fill: 'var(--op-steel)' }));
    s.appendChild(el('rect', { x: cx - 46, y: h - 120, width: 92, height: 8, rx: 4, fill: 'var(--op-steel)' }));
    s.appendChild(el('rect', { x: cx - 46, y: h - 28, width: 92, height: 8, rx: 4, fill: 'var(--op-steel)' }));
    return s;
  }

  // The log on its clipboard by the door: a sheet and its ruled lines.
  function clipboard(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 10, width: w, height: h - 10, rx: 8, fill: 'var(--op-brass)' }));
    s.appendChild(el('rect', { x: 16, y: 34, width: w - 32, height: h - 50, fill: 'var(--op-sheet)' }));
    for (var y = 70; y < h - 30; y += 22) s.appendChild(el('rect', { x: 30, y: y, width: w - 60, height: 3, fill: 'var(--op-ink)' }));
    s.appendChild(el('rect', { x: w / 2 - 40, y: 0, width: 80, height: 28, rx: 6, fill: 'var(--op-steel)' }));
    return s;
  }

  // The tank in the corner.
  function tank(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 40, width: w, height: h - 40, rx: w / 2, fill: 'var(--op-steel)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.4, width: w, height: 12, fill: 'var(--op-wall)' }));
    s.appendChild(el('circle', { cx: w / 2, cy: h * 0.62, r: 30, fill: 'var(--op-sheet)', stroke: 'var(--op-ink)', 'stroke-width': 4 }));
    s.appendChild(el('rect', { x: w / 2 - 2, y: h * 0.62 - 24, width: 4, height: 24, fill: 'var(--op-red)' }));
    s.appendChild(el('rect', { x: w / 2 - 15, y: 0, width: 30, height: 50, fill: 'var(--op-blue)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['cavendish-operations.html'] = {
    prefix: 'op-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var END = 2400 + F;                       // where the page hangs
      var eye = sh / 2, WIDE = 900, LAMP = 1300;
      var WH = Math.max(1200, sh + 600), decor = [];

      decor.push(kit.item(wall(END + 400, WH, '--op-blue', 470), { x: -WIDE, z: (END + 400) / 2 - 200, w: END + 400, h: WH, turn: kit.LEFT }));
      decor.push(kit.item(wall(END + 400, WH, '--op-yellow', 380), { x: WIDE, z: (END + 400) / 2 - 200, w: END + 400, h: WH, turn: kit.RIGHT }));
      decor.push(kit.item(farWall(2 * WIDE + 40, WH, sw), { x: 0, z: END + 40, w: 2 * WIDE + 40, h: WH }));
      var lampH = 400;
      decor.push(kit.item(mainAndLamp(2 * WIDE, lampH), { x: 0, z: LAMP, w: 2 * WIDE, h: lampH, y: eye + 10 }));
      decor.push(kit.item(tank(260, 460), { x: WIDE - 200, z: END - 260, w: 260, h: 460 }));
      var log = kit.item(clipboard(220, 300), { x: -WIDE + 4, z: 360, w: 220, h: 300, y: 220, turn: kit.LEFT });
      decor.push(log);

      var page = kit.screen(kit.page, 'The Operations Room’s own page, on the far wall beside the fire main');
      var hung = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'op-walk-leaf' });

      var stops = [
        kit.stop({ name: 'at the foot of the steps, by the log on its clipboard', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'under the caged lamp, its bars in every shadow', spot: { x: 0, z: LAMP - F * 0.4 } }),
        kit.stop({ name: 'at the far wall, with the fire main and the room’s own page', spot: { x: 0, z: END - F }, link: page }, hung)
      ];

      return {
        cls: 'op-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on the far wall beside the red fire main, past the caged lamp.',
        bounds: function () { return { x: [-WIDE + 300, WIDE - 300], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--op-wall'));
          // The lamp's guard in every shadow: a grid of hard lines across the
          // floor, close under the bulb and opening out the further they fall.
          var shade = kit.ink('--op-concrete'), z0 = Math.max(from, 0), z1 = Math.min(to, END + 40);
          for (var k = 1; k < 16; k++) {
            var d = 70 * Math.pow(k, 1.35), t = 4 + k * 1.5;
            [-1, 1].forEach(function (side) {
              kit.quad(g, side * d - t, side * d + t, z0, z1, shade, 0.95);
              var z = LAMP + side * d;
              if (z > z0 && z < z1) kit.quad(g, -WIDE, WIDE, z - t, z + t, shade, 0.95);
            });
          }
          kit.oval(g, 0, LAMP, 220, 160, kit.ink('--op-lamp'), 0.1);
        }
      };
    }
  };
})();
