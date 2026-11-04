/* =============================================================================
   The Emergent Future Worlds Meets Mountain Man, walked into on Paper Street.
   Ryan's ask, 2026-11-04: round 1 of the rooms still to be walked into. On Cel
   Street it opens off the campgrounds' post; here it is reached by its address
   or the teleporter for now.

   IT IS DAVID'S WORLD AND NOBODY ELSE'S (§118): David Gray-Hammond's log cabin
   at the top of the mountain, at night, warm and cosy meets smart-home modern.
   This card version of it is ours, drawn from his brief as Helen Edgar relayed
   it and from the room's own colours, and it is his to keep or send back.

   THE LIGHT IS THE VISITOR'S TO CHOOSE, and here it is the cabin's teal, the
   colour the strips start in: a strip along the top of the walls and under the
   big screen. The fire is behind the glass of a modern stove and is one warm
   thing in a cool room, like the coffee; it lights nothing. So THE GROUND IS
   NOT BROWN: the floor is the blue-charcoal of a smart home at night with a rug
   on it, and the only brown is the logs. If this floor ever warms, it has
   become the yurt with a lake, which the brief said it must not be.

   AND THE COLD HALF IS THE WINDOW: the whole back wall is glass, and through it
   a lake under a full moon, the mountain's shoulder, the hot spring's steam on
   the warm ground, and the pack lying round it. One wolf is asleep on the rug
   by the stove. Nobody counts, feeds or names them. The room's own page is on
   the big screen, where his playlist and the one switch are.

   NOTHING MOVES, at any setting: the strips' colour is the page's to change,
   after a press, on the page. Every colour is one the room declares, by name.
   It keeps nothing, sends nothing and fetches nothing; its page arrives through
   Paper Street's screen(). tools/make-paper-street.py holds each of those.
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

  // A wolf lying down, seen side on: a long body, a head on the paws.
  function wolf(s, x, y, k, ink) {
    s.appendChild(el('ellipse', { cx: x, cy: y, rx: 60 * k, ry: 20 * k, fill: ink }));
    s.appendChild(el('ellipse', { cx: x + 62 * k, cy: y + 4 * k, rx: 20 * k, ry: 14 * k, fill: ink }));
    s.appendChild(el('path', { d: 'M' + (x + 54 * k) + ' ' + (y - 6 * k) + ' l6 ' + (-18 * k) + ' l8 ' + (14 * k) + ' Z', fill: ink }));
    s.appendChild(el('path', { d: 'M' + (x - 58 * k) + ' ' + y + ' q' + (-40 * k) + ' ' + (4 * k) + ' ' + (-50 * k) + ' ' + (18 * k), fill: 'none', stroke: ink, 'stroke-width': 10 * k }));
  }

  // The back wall, all glass: the lake under a full moon, the ridge, the hot
  // spring steaming, the pack on the warm ground round it, and the strip of
  // light along the top of the wall, in the cabin's teal.
  function glassWall(w, h, gap, tall) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--efw-sky)' }));
    s.appendChild(el('circle', { cx: w * 0.72, cy: h * 0.2, r: 70, fill: 'var(--efw-moon)' }));
    s.appendChild(el('path', { d: 'M0 ' + (h * 0.52) + ' L' + (w * 0.22) + ' ' + (h * 0.3) + ' L' + (w * 0.4) + ' ' + (h * 0.46) + ' L' + (w * 0.6) + ' ' + (h * 0.28) + ' L' + w + ' ' + (h * 0.5) + ' V' + (h * 0.6) + ' H0 Z', fill: 'var(--efw-ridge)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.58, width: w, height: h * 0.14, fill: 'var(--efw-lake)' }));
    s.appendChild(el('rect', { x: w * 0.71, y: h * 0.6, width: 20, height: h * 0.1, fill: 'var(--efw-moon)', 'fill-opacity': '0.5' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.72, width: w, height: h * 0.28, fill: 'var(--efw-ridge)' }));
    // The spring, its steam, and the pack lying round it.
    s.appendChild(el('ellipse', { cx: w * 0.72, cy: h * 0.8, rx: 120, ry: 26, fill: 'var(--efw-lake)' }));
    [0, 1, 2].forEach(function (i) { s.appendChild(el('ellipse', { cx: w * 0.72 - 60 + i * 60, cy: h * 0.74 - i * 18, rx: 30, ry: 44, fill: 'var(--efw-moon)', 'fill-opacity': '0.16' })); });
    wolf(s, w * 0.655, h * 0.84, 0.7, 'var(--efw-wolf)');
    wolf(s, w * 0.775, h * 0.86, 0.6, 'var(--efw-wolf)');
    wolf(s, w * 0.7, h * 0.9, 0.65, 'var(--efw-wolf)');
    // The frame: iron mullions, the gap the screen stands in, and the strip.
    for (var x = 0; x <= w; x += w / 6) s.appendChild(el('rect', { x: x - 8, y: 0, width: 16, height: h, fill: 'var(--efw-iron)' }));
    s.appendChild(el('rect', { x: m - gap / 2 - 30, y: h - tall - 110, width: gap + 60, height: tall + 110, fill: 'var(--efw-iron)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 30, fill: 'var(--efw-log-2)' }));
    s.appendChild(el('rect', { x: 0, y: 30, width: w, height: 10, fill: 'var(--efw-led-1)' }));
    s.appendChild(el('rect', { x: m - gap / 2 - 30, y: h - 34, width: gap + 60, height: 10, fill: 'var(--efw-led-1)' }));
    return s;
  }

  // A log wall down the side of the cabin, with the strip along its top.
  function logs(w, h) {
    var s = svg(w, h);
    for (var y = 0; y < h; y += 70) {
      s.appendChild(el('rect', { x: 0, y: y, width: w, height: 70, rx: 30, fill: (y / 70) % 2 ? 'var(--efw-log)' : 'var(--efw-log-2)' }));
    }
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 12, fill: 'var(--efw-led-1)' }));
    return s;
  }

  // The stove: modern, iron, the fire behind its glass, the coffee on top.
  function stove(w, h) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: m - 18, y: 0, width: 36, height: h * 0.3, fill: 'var(--efw-iron-2)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.3, width: w, height: h * 0.7, rx: 14, fill: 'var(--efw-iron)' }));
    s.appendChild(el('rect', { x: 30, y: h * 0.42, width: w - 60, height: h * 0.4, rx: 8, fill: 'var(--efw-screen)' }));
    s.appendChild(el('path', { d: 'M' + (m - 60) + ' ' + (h * 0.8) + ' q30 -70 40 -110 q16 50 30 30 q10 40 50 80 Z', fill: 'var(--efw-flame)' }));
    s.appendChild(el('path', { d: 'M' + (m - 30) + ' ' + (h * 0.8) + ' q20 -40 26 -60 q12 30 34 60 Z', fill: 'var(--efw-heart)' }));
    s.appendChild(el('rect', { x: 40, y: h * 0.8, width: w - 80, height: 10, fill: 'var(--efw-ember)' }));
    s.appendChild(el('path', { d: 'M' + (w - 110) + ' ' + (h * 0.3) + ' v-46 h50 v46 Z', fill: 'var(--efw-iron-2)' }));
    s.appendChild(el('rect', { x: w - 60, y: h * 0.3 - 36, width: 18, height: 8, fill: 'var(--efw-iron-2)' }));
    return s;
  }

  // A high-back sofa in velvet, bright cushions on it.
  function sofa(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h * 0.7, rx: 30, fill: 'var(--efw-velvet-2)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.5, width: w, height: h * 0.32, rx: 18, fill: 'var(--efw-velvet)' }));
    [0.2, 0.5, 0.8].forEach(function (k, i) {
      s.appendChild(el('rect', { x: w * k - 50, y: h * 0.28, width: 100, height: 90, rx: 22, fill: i === 1 ? 'var(--efw-led-1)' : 'var(--efw-cushion)' }));
    });
    s.appendChild(el('rect', { x: 20, y: h * 0.82, width: 20, height: h * 0.18, fill: 'var(--efw-wood)' }));
    s.appendChild(el('rect', { x: w - 40, y: h * 0.82, width: 20, height: h * 0.18, fill: 'var(--efw-wood)' }));
    return s;
  }

  // The low table: cups, a bowl of crisps, the rainbow sweets.
  function table(w, h) {
    var s = svg(w, h);
    var sweets = ['--efw-rb-red', '--efw-rb-orange', '--efw-rb-yellow', '--efw-rb-green', '--efw-rb-blue', '--efw-rb-indigo', '--efw-rb-violet'];
    [60, 130, 200].forEach(function (x) {
      s.appendChild(el('rect', { x: x, y: 20, width: 44, height: 50, rx: 6, fill: 'var(--efw-cup)' }));
    });
    s.appendChild(el('ellipse', { cx: w * 0.62, cy: 66, rx: 70, ry: 16, fill: 'var(--efw-cushion)' }));
    sweets.forEach(function (c, i) { s.appendChild(el('circle', { cx: w * 0.82 + (i % 4) * 16, cy: 54 + Math.floor(i / 4) * 14, r: 7, fill: 'var(' + c + ')' })); });
    s.appendChild(el('rect', { x: 0, y: 70, width: w, height: 22, fill: 'var(--efw-wood)' }));
    s.appendChild(el('rect', { x: 24, y: 92, width: 18, height: h - 92, fill: 'var(--efw-wood)' }));
    s.appendChild(el('rect', { x: w - 42, y: 92, width: 18, height: h - 92, fill: 'var(--efw-wood)' }));
    return s;
  }

  // The one wolf inside, asleep on the rug by the stove.
  function sleeper(w, h) {
    var s = svg(w, h);
    wolf(s, w * 0.45, h * 0.7, 1.6, 'var(--efw-wolf)');
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-mountain-cabin.html'] = {
    prefix: 'efw-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 2800 + F;                      // the glass wall and the big screen
      var WIDE = 900;                          // from the middle to each log wall
      var eye = sh / 2 + 40;
      var decor = [];

      var GW = 3000, GH = Math.max(1500, sh + 700);
      decor.push(kit.item(glassWall(GW, GH, sw, sh), { x: 0, z: END + 20, w: GW, h: GH }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(logs(END - 300, GH), { x: side * WIDE, z: 300 + (END - 300) / 2, w: END - 300, h: GH, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var fire = kit.item(stove(380, 620), { x: -WIDE + 260, z: END - 700, w: 380, h: 620 });
      decor.push(fire);
      decor.push(kit.item(sleeper(420, 160), { x: -WIDE + 300, z: END - 980, w: 420, h: 160 }));
      var lounge = kit.item(sofa(900, 360), { x: WIDE - 120, z: 1500, w: 900, h: 360, turn: kit.RIGHT });
      decor.push(lounge);
      decor.push(kit.item(table(420, 200), { x: 200, z: 1400, w: 420, h: 200 }));

      var page = kit.screen(kit.page, 'The cabin’s own page, on the big screen in front of the window');
      var screen = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: 40, cls: 'efw-walk-screen' });

      var stops = [
        kit.stop({ name: 'inside the cabin door, the window wall ahead and the moon in it', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'by the stove, its fire behind the glass, and the one wolf asleep on the rug', spot: kit.front(fire, 900) }, fire),
        kit.stop({ name: 'at the high-back sofa along the wall', spot: kit.front(lounge, 1100) }, lounge),
        kit.stop({ name: 'at the big screen in front of the window, with the room’s own page on it', spot: { x: 0, z: END - F }, link: page }, screen)
      ];

      return {
        cls: 'efw-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The whole back wall is window. The cabin’s own page is on the big screen in front of it.',
        bounds: function () { return { x: [-WIDE + 160, WIDE - 160], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--efw-night'));
          kit.quad(g, -WIDE, WIDE, Math.max(from, 0), Math.min(to, END + 30), kit.ink('--efw-panel'));
          var seam = kit.ink('--efw-iron');
          for (var x = -WIDE; x < WIDE; x += 120) kit.quad(g, x, x + 4, Math.max(from, 0), Math.min(to, END + 30), seam, 0.7);
          kit.oval(g, 0, 1600, 620, 420, kit.ink('--efw-rug'), 1);
          kit.oval(g, 0, 1600, 520, 330, kit.ink('--efw-velvet-2'), 1);
          kit.oval(g, -WIDE + 300, END - 980, 360, 200, kit.ink('--efw-rug'), 1);
          // The teal of the strips, lying faintly along the foot of each wall.
          var led = kit.ink('--efw-led-1');
          kit.quad(g, -WIDE, -WIDE + 60, Math.max(from, 300), Math.min(to, END), led, 0.1);
          kit.quad(g, WIDE - 60, WIDE, Math.max(from, 300), Math.min(to, END), led, 0.1);
        }
      };
    }
  };
})();
