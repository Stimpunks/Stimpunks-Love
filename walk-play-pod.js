/* =============================================================================
   The Play Pod, walked into on Paper Street. Ryan's ask, 2026-11-04: round one
   of the rooms still to be walked into. On Cel Street it opens off the Faery
   Yurt, through the round door under the glowing mushroom; here it is reached
   by its address or the teleporter.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§131), and this is OURS: a drawing of
   her pod for Paper Street, cut out of card in the colours her room declares
   and nothing else. It changes nothing on her page, and it is hers to keep or
   send back.

   THE LAMP IS THE ROOM: one UV tube on the wall over one big round tuff tray,
   and everything in the tray FLUORESCES, so it glows only while the lamp is on,
   and here the lamp is on: the room dark violet, the tube lit, and in the tray
   swirls of foam paint and finger marks in every glow her room declares, a jar
   of tonic water and two glow sticks. A shelf of paints and jars on the
   right-hand wall, and a sheet on a low table for mark making. Nobody is drawn,
   and never a child. Her own page hangs on the left-hand wall, and its own
   lamp switch, which turns the drawing there to daylight and back, is on it.

   NOTHING MOVES. Every colour is one her room declares, by name. It keeps
   nothing, sends nothing and fetches nothing; her page arrives through Paper
   Street's screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var GLOWS = ['var(--ppd-pink)', 'var(--ppd-green)', 'var(--ppd-yellow)', 'var(--ppd-blue)', 'var(--ppd-orange)'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // A wall of the pod: the room's night, with a line where it meets the floor.
  function wall(w, h, tube) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--ppd-night)' }));
    s.appendChild(el('rect', { x: 0, y: h - 10, width: w, height: 10, fill: 'var(--ppd-line)' }));
    if (tube) {
      // THE UV TUBE, lit, in its bracket, and its haze on the wall round it.
      s.appendChild(el('rect', { x: w / 2 - 520, y: h * 0.22 - 60, width: 1040, height: 140, rx: 70, fill: 'var(--ppd-uv)', 'fill-opacity': '0.18' }));
      s.appendChild(el('rect', { x: w / 2 - 440, y: h * 0.22, width: 880, height: 26, rx: 13, fill: 'var(--ppd-uv)' }));
      s.appendChild(el('rect', { x: w / 2 - 460, y: h * 0.22 - 6, width: 30, height: 38, fill: 'var(--ppd-line)' }));
      s.appendChild(el('rect', { x: w / 2 + 430, y: h * 0.22 - 6, width: 30, height: 38, fill: 'var(--ppd-line)' }));
    }
    return s;
  }

  // THE TUFF TRAY on its low stand, seen from a little above: a big round of
  // the tray's dark, everything in it glowing under the lamp.
  function tray(w, h) {
    var s = svg(w, h), cx = w / 2, cy = h * 0.34, rx = w / 2 - 10, ry = h * 0.3;
    s.appendChild(el('rect', { x: cx - rx * 0.7, y: cy, width: 22, height: h - cy, fill: 'var(--ppd-line)' }));
    s.appendChild(el('rect', { x: cx + rx * 0.7 - 22, y: cy, width: 22, height: h - cy, fill: 'var(--ppd-line)' }));
    s.appendChild(el('ellipse', { cx: cx, cy: cy, rx: rx, ry: ry, fill: 'var(--ppd-tray)', stroke: 'var(--ppd-line)', 'stroke-width': 12 }));
    // Swirls of foam paint and finger marks, each in its own glow.
    for (var k = 0; k < 5; k++) {
      var a = k / 5 * Math.PI * 2, px = cx + Math.cos(a) * rx * 0.5, py = cy + Math.sin(a) * ry * 0.5;
      s.appendChild(el('path', { fill: 'none', stroke: GLOWS[k], 'stroke-width': 10, 'stroke-linecap': 'round',
        d: 'M' + (px - 70) + ' ' + py + ' q35 -' + ry * 0.3 + ' 70 0 t70 0' }));
      for (var f = 0; f < 3; f++) s.appendChild(el('ellipse', { cx: px - 30 + f * 30, cy: py + ry * 0.2, rx: 9, ry: 5, fill: GLOWS[(k + 2) % 5] }));
    }
    // The jar of tonic water, glowing blue, and two glow sticks.
    s.appendChild(el('rect', { x: cx - 30, y: cy - 110, width: 60, height: 90, rx: 10, fill: 'var(--ppd-blue)', 'fill-opacity': '0.8' }));
    s.appendChild(el('rect', { x: cx - 34, y: cy - 120, width: 68, height: 16, rx: 4, fill: 'var(--ppd-line)' }));
    s.appendChild(el('path', { d: 'M' + (cx + rx * 0.3) + ' ' + (cy + ry * 0.2) + ' l120 -40', stroke: 'var(--ppd-green)', 'stroke-width': 12, 'stroke-linecap': 'round' }));
    s.appendChild(el('path', { d: 'M' + (cx - rx * 0.55) + ' ' + (cy - ry * 0.1) + ' l100 50', stroke: 'var(--ppd-pink)', 'stroke-width': 12, 'stroke-linecap': 'round' }));
    return s;
  }

  // A shelf of paints and jars, every one glowing under the lamp.
  function shelf(w, h) {
    var s = svg(w, h);
    [0.32, 0.72].forEach(function (k, row) {
      var y = h * k;
      s.appendChild(el('rect', { x: 0, y: y, width: w, height: 16, fill: 'var(--ppd-line)' }));
      for (var x = 40, i = 0; x < w - 80; x += 110, i++) {
        var tall = 60 + ((i + row) % 3) * 30;
        s.appendChild(el('rect', { x: x, y: y - tall, width: 70, height: tall, rx: 10, fill: GLOWS[(i + row * 2) % 5] }));
        s.appendChild(el('rect', { x: x + 6, y: y - tall - 12, width: 58, height: 14, rx: 3, fill: 'var(--ppd-line)' }));
      }
    });
    return s;
  }

  // A low table with a sheet on it for mark making, with marks already on it.
  function markTable(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 20, y: h * 0.3, width: 20, height: h * 0.7, fill: 'var(--ppd-line)' }));
    s.appendChild(el('rect', { x: w - 40, y: h * 0.3, width: 20, height: h * 0.7, fill: 'var(--ppd-line)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.24, width: w, height: 24, fill: 'var(--ppd-line)' }));
    s.appendChild(el('path', { d: 'M' + 30 + ' ' + h * 0.24 + ' L' + 70 + ' ' + 10 + ' H' + (w - 70) + ' L' + (w - 30) + ' ' + h * 0.24 + ' Z', fill: 'var(--ppd-ink-2)' }));
    for (var k = 0; k < 4; k++) {
      s.appendChild(el('path', { fill: 'none', stroke: GLOWS[k + 1], 'stroke-width': 7, 'stroke-linecap': 'round',
        d: 'M' + (100 + k * 70) + ' ' + (h * 0.18) + ' q20 -' + (24 + k * 6) + ' 40 0' }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['play-pod.html'] = {
    prefix: 'ppd-walk',
    build: function (kit) {
      var F = kit.F;
      var sh = kit.H - 24;
      var BACK = 2200, HALF = 1000, WH = Math.max(1100, sh + 520);
      var eye = sh / 2;
      var decor = [];

      decor.push(kit.item(wall(2 * HALF + 200, WH, true), { x: 0, z: BACK, w: 2 * HALF + 200, h: WH }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(wall(BACK + 600, WH), { x: side * HALF, z: BACK / 2 - 300, w: BACK + 600, h: WH, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var tuff = { x: 120, z: BACK - 620, w: 860, h: 420 };
      decor.push(kit.item(tray(860, 420), tuff));
      decor.push(kit.item(shelf(900, 700), { x: HALF - 6, z: 1100, w: 900, h: 700, y: 320, turn: kit.RIGHT }));
      decor.push(kit.item(markTable(560, 300), { x: 560, z: 1000, w: 560, h: 300 }));

      // Her page, on the left-hand wall.
      var PW = Math.min(kit.W - 160, 860), PH = Math.round(PW * 0.62);
      var page = kit.screen(kit.page, 'The Play Pod’s own page, on the left-hand wall');
      var hung = kit.item(page, { x: -HALF + 6, z: 1200, w: PW, h: PH, y: 200, turn: kit.LEFT, cls: 'ppd-walk-page' });

      var stops = [
        kit.stop({ name: 'inside the round door, the lamp on and the tray glowing ahead', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the tuff tray, under the UV tube, everything in it glowing', spot: kit.front(tuff, 1100) }),
        kit.stop({ name: 'at the left-hand wall, with Helen’s own page, its lamp switch on it', spot: kit.front(hung), link: page }, hung)
      ];

      return {
        cls: 'ppd-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The lamp is on. Helen’s own page is on the left-hand wall, with its lamp switch on it.',
        bounds: function () { return { x: [-HALF + 220, HALF - 220], z: [-200, BACK - 600] }; },
        ground: function (g, near, far) {
          kit.quad(g, -5000, 5000, near, far, kit.ink('--ppd-night'));
          // A wipe-clean mat under the tray, and the lamp's haze on the floor
          // round it, which is the only light in here.
          kit.quad(g, -400, 640, BACK - 900, BACK - 300, kit.ink('--ppd-tray'));
          kit.oval(g, 120, BACK - 520, 700, 420, kit.ink('--ppd-uv'), 0.07);
          // A few drips that missed the tray, glowing where they fell.
          var drips = [['--ppd-pink', -250, BACK - 860], ['--ppd-green', 520, BACK - 880], ['--ppd-yellow', 300, BACK - 940]];
          drips.forEach(function (d) { kit.oval(g, d[1], d[2], 14, 9, kit.ink(d[0])); });
        }
      };
    }
  };
})();
