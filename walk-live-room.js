/* =============================================================================
   The Live Room, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   one of the rest of the rooms, each its own world in card.

   IT IS THE STUDIO'S WORLD AND NOBODY ELSE'S (§59), SEEN FROM THE CONTROL
   ROOM. You come in at the back of a dim room kept dark so the engineer can
   see through the window: the desk on one side, its channel strips each with
   a strip of masking tape across the top, the outboard rack on the other, and
   at the far end the studio glass. Beyond it the live room is lit bright and
   even for the cameras, and the room's own page is in the glass.

   THE LIGHT ARRIVES THROUGH TWO PANES, so everything lit in there is drawn
   twice, the second time faint and lower; it is the only doubled light on the
   street. One red lamp over the window, lit and steady, which does not flash
   at any setting. The desk's own lights are tiny and light nothing. There is
   no wood and no carpet (that is the Den), and nobody is drawn in the live
   room. Nothing moves. Every colour is one §59 declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Paper
   Street's screen(). tools/make-paper-street.py holds each of those.
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

  // What stands in the live room, empty: two mic stands and an amp. Drawn
  // once at full strength and once again, faint and lower, for the second pane.
  function liveThings(s, x0, y0, w, h, faint) {
    var o = faint ? { dy: 22, a: '0.28' } : { dy: 0, a: '1' };
    var g = el('g', { 'fill-opacity': o.a, 'stroke-opacity': o.a });
    [0.18, 0.82].forEach(function (k) {
      var mx = x0 + w * k, base = y0 + h + o.dy;
      g.appendChild(el('rect', { x: mx - 3, y: base - h * 0.62, width: 6, height: h * 0.62, fill: 'var(--lvr-live)' }));
      g.appendChild(el('rect', { x: mx - 10, y: base - h * 0.68, width: 20, height: 34, rx: 10, fill: 'var(--lvr-live)' }));
      g.appendChild(el('path', { d: 'M' + (mx - 34) + ' ' + base + ' L' + mx + ' ' + (base - 20) + ' L' + (mx + 34) + ' ' + base, fill: 'none', stroke: 'var(--lvr-live)', 'stroke-width': 5 }));
    });
    g.appendChild(el('rect', { x: x0 + w * 0.36, y: y0 + h * 0.62 + o.dy, width: w * 0.28, height: h * 0.38, fill: 'var(--lvr-live)' }));
    s.appendChild(g);
  }

  // The window wall: dark, the opening in it, the live room's pale through
  // the glass with its things doubled either side of the page, and the red
  // lamp over it, steady.
  function windowWall(w, h, gap, gh) {
    var s = svg(w, h), m = w / 2, top = h - gh - 40, ww = gap + 700;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--lvr-face)' }));
    s.appendChild(el('rect', { x: m - ww / 2 - 20, y: top - 20, width: ww + 40, height: gh + 40, fill: 'var(--lvr-well)' }));
    s.appendChild(el('rect', { x: m - ww / 2, y: top, width: ww, height: gh, fill: 'var(--lvr-glass)' }));
    [-1, 1].forEach(function (side) {
      var x0 = side < 0 ? m - ww / 2 + 30 : m + gap / 2 + 30;
      liveThings(s, x0, top + gh * 0.3, 290, gh * 0.55, false);
      liveThings(s, x0, top + gh * 0.3, 290, gh * 0.55, true);
    });
    // The second pane's own edge, faint and lower, the way the glass doubles.
    s.appendChild(el('rect', { x: m - ww / 2 + 8, y: top + 18, width: ww - 16, height: gh - 10, fill: 'none', stroke: 'var(--lvr-panel)', 'stroke-width': 3, 'stroke-opacity': '0.5' }));
    s.appendChild(el('circle', { cx: m, cy: top - 70, r: 40, fill: 'var(--lvr-lamp)', 'fill-opacity': '0.18' }));
    s.appendChild(el('rect', { x: m - 60, y: top - 88, width: 120, height: 36, rx: 8, fill: 'var(--lvr-lamp)' }));
    return s;
  }

  // The desk: channel strips side by side, a strip of masking tape across the
  // top of each, knobs down it in the caps' grey, a fader at the foot, and a
  // light no bigger than a grain of rice.
  function desk(w, h) {
    var s = svg(w, h), strip = 70;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--lvr-well)' }));
    for (var x = 10; x + strip <= w - 10; x += strip + 6) {
      s.appendChild(el('rect', { x: x, y: 10, width: strip, height: h - 20, fill: 'var(--lvr-face)', stroke: 'var(--lvr-cap)', 'stroke-width': 2 }));
      s.appendChild(el('rect', { x: x + 4, y: 16, width: strip - 8, height: 22, fill: 'var(--lvr-tape)' }));
      s.appendChild(el('path', { d: 'M' + (x + 12) + ' 28 q8 -6 16 0 t16 0', fill: 'none', stroke: 'var(--lvr-marker)', 'stroke-width': 3 }));
      for (var k = 0; k < 4; k++) s.appendChild(el('circle', { cx: x + strip / 2, cy: 62 + k * 34, r: 11, fill: 'var(--lvr-cap)' }));
      s.appendChild(el('rect', { x: x + strip / 2 - 3, y: h - 110, width: 6, height: 80, fill: 'var(--lvr-well)' }));
      s.appendChild(el('rect', { x: x + strip / 2 - 14, y: h - 80 + (x % 3) * 12, width: 28, height: 16, fill: 'var(--lvr-cap)' }));
      s.appendChild(el('circle', { cx: x + strip - 10, cy: 48, r: 3, fill: 'var(--lvr-meter)' }));
    }
    return s;
  }

  // The outboard rack: units one over another, each with its knobs and one
  // small meter.
  function rack(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--lvr-well)' }));
    for (var y = 20; y + 60 < h; y += 72) {
      s.appendChild(el('rect', { x: 16, y: y, width: w - 32, height: 60, fill: 'var(--lvr-face)', stroke: 'var(--lvr-cap)', 'stroke-width': 2 }));
      for (var x = 40; x < w - 120; x += 46) s.appendChild(el('circle', { cx: x, cy: y + 30, r: 10, fill: 'var(--lvr-cap)' }));
      s.appendChild(el('rect', { x: w - 100, y: y + 18, width: 60, height: 24, fill: 'var(--lvr-room)', stroke: 'var(--lvr-cap)', 'stroke-width': 2 }));
      s.appendChild(el('rect', { x: w - 94, y: y + 26, width: 18 + (y % 30), height: 8, fill: 'var(--lvr-meter)' }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['live-room.html'] = {
    prefix: 'lvr-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 2400 + F;                       // the studio glass
      var SIDE = 900, eye = sh / 2, WH = sh + 380;
      var decor = [];

      decor.push(kit.item(windowWall(SIDE * 2 + 800, WH, sw, sh), { x: 0, z: END + 30, w: SIDE * 2 + 800, h: WH }));
      var board = kit.item(desk(1100, 300), { x: -SIDE + 40, z: 1400, w: 1100, h: 300, turn: kit.LEFT });
      decor.push(board, kit.item(rack(620, 700), { x: SIDE - 40, z: 1500, w: 620, h: 700, turn: kit.RIGHT }));

      var page = kit.screen(kit.page, 'The Live Room’s own page, in the studio glass');
      var glass = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'lvr-walk-glass' });

      var stops = [
        kit.stop({ name: 'at the back of the control room, kept dim so you can see through the glass', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the desk, its channel strips each with a strip of masking tape across the top', spot: { x: -SIDE + 520, z: 1400, yaw: -kit.LEFT } }),
        kit.stop({ name: 'at the outboard rack, its meters tiny and lighting nothing', spot: { x: SIDE - 480, z: 1500, yaw: -kit.RIGHT } }),
        kit.stop({ name: 'at the studio glass, with the room’s own page in it and the red lamp over it, steady', spot: { x: 0, z: END - F }, link: page }, glass)
      ];

      return {
        cls: 'lvr-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is in the studio glass at the far end, under the red lamp.',
        bounds: function () { return { x: [-SIDE + 480, SIDE - 440], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--lvr-room'));
          // The floor tiles, and the live room's light lying in at the glass.
          var line = kit.ink('--lvr-well');
          for (var x = -SIDE; x <= SIDE; x += 200) kit.quad(g, x - 2, x + 2, Math.max(near, 0), Math.min(far, END), line);
          for (var z = Math.max(0, Math.ceil(near / 200) * 200); z < Math.min(far, END); z += 200) kit.quad(g, -SIDE, SIDE, z, z + 4, line);
          kit.quad(g, -sw / 2 - 300, sw / 2 + 300, END - 500, END, kit.ink('--lvr-glass'), 0.06);
        }
      };
    }
  };
})();
