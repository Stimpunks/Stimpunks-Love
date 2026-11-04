/* =============================================================================
   The Events Room, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round 1 of the rooms that could not yet be walked into.

   IT IS THE ROOM'S OWN WORLD AND SHARES NOTHING WITH THE HOUSE IT OPENS OFF
   (§71): a lighthouse keeper's watch room at dusk, the round room under the
   lantern. Its whitewashed wall stands round you as card panels in a ring,
   going to slate away from the light. The lantern is overhead and out of
   sight: its steady light comes down through the hatch as one column onto the
   chart table, and the floor round the table takes it and nothing else does.
   The ladder goes up into the light, the weight hangs on its chain by the
   wall, one small window shows the sea at dusk, and the room's own page hangs
   on the far curve of the wall, to read and press as itself. Nobody is drawn.

   THE COLUMN IS THE ROOM. If it ever goes, or the wall warms to cream, this has
   become the Mopery with a timetable.

   NOTHING MOVES AT ANY SETTING: a real light turns, and this one is drawn
   standing still, because the room is about a thing you can count on. Every
   colour is one §71 declares, by name. It keeps nothing, sends nothing and
   fetches nothing; its page arrives through Paper Street's screen().
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

  // One panel of the round wall: whitewash gone to slate in the dusk, a band
  // at the foot, and (on one panel) the small window onto the sea.
  function panel(w, h, glass) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--wr-lime)' }));
    s.appendChild(el('rect', { x: 0, y: h - 60, width: w, height: 60, fill: 'var(--wr-rail)' }));
    if (glass) {
      var ww = w * 0.34, wh = ww * 1.2, x = (w - ww) / 2, y = h * 0.34;
      s.appendChild(el('rect', { x: x - 14, y: y - 14, width: ww + 28, height: wh + 28, rx: 10, fill: 'var(--wr-rail)' }));
      s.appendChild(el('rect', { x: x, y: y, width: ww, height: wh * 0.58, fill: 'var(--wr-dusk)' }));
      s.appendChild(el('rect', { x: x, y: y + wh * 0.58, width: ww, height: wh * 0.42, fill: 'var(--wr-sea)' }));
      s.appendChild(el('rect', { x: x + ww / 2 - 4, y: y, width: 8, height: wh, fill: 'var(--wr-rail)' }));
    }
    return s;
  }

  // The chart table, lit from straight above: the chart on it, a course laid
  // in the chart's magenta, brass at the corners.
  function chartTable(w, h) {
    var s = svg(w, h), top = h * 0.36;
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: 30, fill: 'var(--wr-lit)' }));
    s.appendChild(el('path', { fill: 'var(--wr-lit)', d: 'M30 ' + top + ' L60 0 H' + (w - 60) + ' L' + (w - 30) + ' ' + top + ' Z' }));
    for (var x = 110; x < w - 100; x += 90) s.appendChild(el('path', { fill: 'none', stroke: 'var(--wr-glow)', 'stroke-width': 2,
      d: 'M' + x + ' 8 L' + (x - 30 * (x - w / 2) / w) + ' ' + (top - 6) }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--wr-flare)', 'stroke-width': 5,
      d: 'M' + (w * 0.22) + ' ' + (top * 0.8) + ' L' + (w * 0.46) + ' ' + (top * 0.42) + ' L' + (w * 0.74) + ' ' + (top * 0.3) }));
    s.appendChild(el('circle', { cx: w * 0.74, cy: top * 0.3, r: 9, fill: 'none', stroke: 'var(--wr-flare)', 'stroke-width': 4 }));
    s.appendChild(el('rect', { x: 0, y: top + 30, width: w, height: 22, fill: 'var(--wr-ink)' }));
    [0.08, 0.92].forEach(function (k) {
      s.appendChild(el('rect', { x: w * k - 16, y: top + 52, width: 32, height: h - top - 52, fill: 'var(--wr-ink)' }));
      s.appendChild(el('circle', { cx: w * k, cy: top + 40, r: 8, fill: 'var(--wr-brass)' }));
    });
    return s;
  }

  // The column of light down through the hatch, the hatch's rim above it, and
  // the ladder going up into it.
  function column(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: w * 0.18, y: 30, width: w * 0.64, height: h - 30, fill: 'var(--wr-lit)', 'fill-opacity': '0.14' }));
    s.appendChild(el('rect', { x: w * 0.1, y: 0, width: w * 0.8, height: 30, fill: 'var(--wr-rail)' }));
    s.appendChild(el('rect', { x: w * 0.18, y: 22, width: w * 0.64, height: 8, fill: 'var(--wr-lit)' }));
    return s;
  }
  function ladder(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 6, y: 0, width: 12, height: h, fill: 'var(--wr-brass)' }));
    s.appendChild(el('rect', { x: w - 18, y: 0, width: 12, height: h, fill: 'var(--wr-brass)' }));
    for (var y = 50; y < h; y += 90) s.appendChild(el('rect', { x: 6, y: y, width: w - 12, height: 9, fill: 'var(--wr-brass)' }));
    return s;
  }

  // The weight that turns the lens above, hanging still on its chain.
  function weight(w, h) {
    var s = svg(w, h), cx = w / 2;
    for (var y = 0; y < h - 120; y += 22) s.appendChild(el('rect', { x: cx - 5, y: y, width: 10, height: 16, rx: 5, fill: 'none', stroke: 'var(--wr-brass)', 'stroke-width': 3 }));
    s.appendChild(el('rect', { x: cx - 30, y: h - 120, width: 60, height: 120, rx: 8, fill: 'var(--wr-rail)' }));
    s.appendChild(el('rect', { x: cx - 30, y: h - 120, width: 60, height: 10, fill: 'var(--wr-brass)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['cavendish-events.html'] = {
    prefix: 'wr-walk',
    from: 'cavendish-coworking.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var eye = sh / 2;
      var R = 1500, C = 1700;                    // the round room's radius, and its middle
      var END = C + R - 120;                     // where the page hangs, on the far curve
      var WH = Math.max(1300, sh + 700), decor = [];

      // The ring of the wall, panel by panel, each turned to the middle. The
      // one with the window is off to the left of the far curve.
      var N = 14, PW = 2 * R * Math.tan(Math.PI / N) + 4;
      for (var i = 0; i < N; i++) {
        var a = Math.PI * 2 * i / N;
        if (Math.cos(a) > 0.55) continue;        // the curve behind you, where the door is
        decor.push(kit.item(panel(PW, WH, i === 8), { x: R * Math.sin(a), z: C - R * Math.cos(a), w: PW, h: WH, turn: a + Math.PI }));
      }
      var table = kit.item(chartTable(760, 330), { x: 0, z: C, w: 760, h: 330 });
      decor.push(table);
      decor.push(kit.item(column(760, Math.max(900, sh + 400)), { x: 0, z: C + 30, w: 760, h: Math.max(900, sh + 400), y: 330 }));
      decor.push(kit.item(ladder(120, Math.max(1100, sh + 600)), { x: 470, z: C + 140, w: 120, h: Math.max(1100, sh + 600) }));
      decor.push(kit.item(weight(80, 640), { x: -R * 0.82, z: C + R * 0.42, w: 80, h: 640, y: 120, turn: kit.LEFT }));

      var page = kit.screen(kit.page, 'The Events Room’s own page, on the far curve of the wall');
      var hung = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'wr-walk-leaf' });

      var stops = [
        kit.stop({ name: 'up through the floor, at the edge of the watch room', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the chart table, in the column of light from the hatch', spot: kit.front(table) }, table),
        kit.stop({ name: 'by the small window, the sea at dusk outside it', spot: { x: -400, z: END - F, yaw: -0.27 } }),
        kit.stop({ name: 'at the far curve of the wall, with the room’s own page on it', spot: { x: 0, z: END - F }, link: page }, hung)
      ];

      return {
        cls: 'wr-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page hangs on the far curve of the wall, past the chart table in the column of light.',
        bounds: function () { return { x: [-900, 900], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--wr-stone'));
          // Flagstones in rings round the middle of the room.
          [1400, 1100, 800].forEach(function (r) { kit.oval(g, 0, C, r, r, kit.ink('--wr-rail'), 0.5); kit.oval(g, 0, C, r - 12, r - 12, kit.ink('--wr-stone'), 1); });
          // Where the column lands: round the table's feet, and nowhere else.
          kit.oval(g, 0, C + 20, 420, 240, kit.ink('--wr-lit'), 0.18);
        }
      };
    }
  };
})();
