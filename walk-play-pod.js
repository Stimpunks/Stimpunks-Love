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
   Here the lamp stays on, because nothing in this scene could follow the
   switch, and a room that went on glowing with the lamp off would not be hers.

   ROUND TWO (Ryan's ask, 2026-11-04) drew more of what her page has in it, and
   nothing it does not: the tube's haze, the tray's lit rim, puffs of foam paint
   and trails of finger marks, a galaxy jar; a stool beside the tray with tonic
   water poured full, half and a quarter, the glow fading jar by jar, and glow
   sticks in a warm glass and a cold one; a lava lamp, oil and water, galaxy
   jars, glow nail varnish and a UV torch on the shelf; plain white paper,
   highlighters and shaving-cream sensory bags on the table; a big sheet taped
   to the back wall with giant brushes and a spray bottle under it; a messy
   play mat with oobleck, sponges in a tub of water, pom-poms and pegs and cups
   of oats; and her film for the pod, lifted off her page onto the right-hand
   wall, where it plays as it does there. Four more places to stand.

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
  function add(s, name, attrs) { var e = el(name, attrs); s.appendChild(e); return e; }
  // A few dabs heaped together: a puff of foam paint where a hand let go.
  function puff(s, x, y, r, ink) {
    [[-0.7, 0.2, 0.8], [0.6, 0.25, 0.75], [0, -0.3, 1], [-0.1, 0.45, 0.6]].forEach(function (d) {
      add(s, 'ellipse', { cx: x + d[0] * r, cy: y + d[1] * r, rx: r * d[2], ry: r * d[2] * 0.62, fill: ink });
    });
  }
  // A jar, its lid, and whatever is in it filling it to a height.
  function jar(s, x, base, w, h, fill, opacity) {
    add(s, 'rect', { x: x, y: base - h, width: w, height: h, rx: 8, fill: fill, 'fill-opacity': opacity == null ? 1 : opacity });
    add(s, 'rect', { x: x - 3, y: base - h - 12, width: w + 6, height: 14, rx: 3, fill: 'var(--ppd-line)' });
  }

  // A wall of the pod: the room's night, with a skirting where it meets the
  // floor, and on the far wall the tube, lit, in its bracket, with its haze.
  function wall(w, h, tube) {
    var s = svg(w, h);
    add(s, 'rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--ppd-night)' });
    add(s, 'rect', { x: 0, y: h - 26, width: w, height: 26, fill: 'var(--ppd-tray)' });
    add(s, 'rect', { x: 0, y: h - 10, width: w, height: 10, fill: 'var(--ppd-line)' });
    if (tube) {
      var ty = h * 0.22;
      // Rings of haze, each smaller and brighter, so it has no edge to point at.
      [[640, 200, 0.06], [540, 150, 0.07], [460, 100, 0.09], [420, 56, 0.12]].forEach(function (r) {
        add(s, 'ellipse', { cx: w / 2, cy: ty + 13, rx: r[0], ry: r[1], fill: 'var(--ppd-uv)', 'fill-opacity': r[2] });
      });
      add(s, 'rect', { x: w / 2 - 470, y: ty - 10, width: 940, height: 46, rx: 8, fill: 'var(--ppd-line)' });
      add(s, 'rect', { x: w / 2 - 440, y: ty, width: 880, height: 26, rx: 13, fill: 'var(--ppd-uv)' });
      add(s, 'rect', { x: w / 2 - 420, y: ty + 5, width: 840, height: 6, rx: 3, fill: 'var(--ppd-ink-2)', 'fill-opacity': 0.5 });
      add(s, 'rect', { x: w / 2 - 6, y: ty + 36, width: 12, height: 60, fill: 'var(--ppd-line)' });
      add(s, 'rect', { x: w / 2 - 30, y: ty + 90, width: 60, height: 30, rx: 6, fill: 'var(--ppd-line)' });
    }
    return s;
  }

  // THE TUFF TRAY on its low stand, seen from a little above: a big round of
  // the tray's dark, its rim catching the lamp, everything in it glowing.
  function tray(w, h) {
    var s = svg(w, h), cx = w / 2, cy = h * 0.34, rx = w / 2 - 10, ry = h * 0.3;
    [[-0.78, 1], [0.78, 1], [-0.42, 0.7], [0.42, 0.7]].forEach(function (l) {
      add(s, 'rect', { x: cx + rx * l[0] - 11, y: cy + ry * 0.3, width: 22, height: h - cy - ry * 0.3, fill: 'var(--ppd-line)', 'fill-opacity': l[1] });
    });
    add(s, 'ellipse', { cx: cx, cy: cy + 14, rx: rx, ry: ry, fill: 'var(--ppd-line)' });
    add(s, 'ellipse', { cx: cx, cy: cy, rx: rx, ry: ry, fill: 'var(--ppd-tray)', stroke: 'var(--ppd-uv)', 'stroke-width': 6 });
    add(s, 'ellipse', { cx: cx, cy: cy + 4, rx: rx - 26, ry: ry - 14, fill: 'var(--ppd-night)' });
    // Swirls of foam paint and finger marks, each in its own glow.
    for (var k = 0; k < 5; k++) {
      var a = k / 5 * Math.PI * 2, px = cx + Math.cos(a) * rx * 0.52, py = cy + 4 + Math.sin(a) * ry * 0.5;
      add(s, 'path', { fill: 'none', stroke: GLOWS[k], 'stroke-width': 10, 'stroke-linecap': 'round',
        d: 'M' + (px - 70) + ' ' + py + ' q35 -' + ry * 0.3 + ' 70 0 t70 0' });
      for (var f = 0; f < 4; f++) add(s, 'ellipse', { cx: px - 45 + f * 30, cy: py + ry * 0.2 + Math.sin(f) * 4, rx: 7, ry: 4, fill: GLOWS[(k + 2) % 5] });
    }
    // Puffs of foam paint.
    puff(s, cx - rx * 0.25, cy + ry * 0.15, 16, 'var(--ppd-pink)');
    puff(s, cx + rx * 0.2, cy - ry * 0.35, 14, 'var(--ppd-green)');
    puff(s, cx + rx * 0.62, cy + ry * 0.25, 12, 'var(--ppd-yellow)');
    // The jar of tonic water, glowing blue, a galaxy jar, and two glow sticks.
    add(s, 'ellipse', { cx: cx, cy: cy - 60, rx: 70, ry: 60, fill: 'var(--ppd-blue)', 'fill-opacity': 0.12 });
    jar(s, cx - 30, cy - 20, 60, 90, 'var(--ppd-blue)', 0.85);
    jar(s, cx - rx * 0.5 - 24, cy - 6, 48, 80, 'var(--ppd-tray)');
    for (var g = 0; g < 7; g++) add(s, 'circle', { cx: cx - rx * 0.5 - 16 + (g * 37) % 34, cy: cy - 16 - (g * 23) % 66, r: 3, fill: 'var(--ppd-yellow)' });
    add(s, 'path', { d: 'M' + (cx + rx * 0.3) + ' ' + (cy + ry * 0.2) + ' l120 -40', stroke: 'var(--ppd-green)', 'stroke-width': 12, 'stroke-linecap': 'round' });
    add(s, 'path', { d: 'M' + (cx - rx * 0.62) + ' ' + (cy + ry * 0.05) + ' l100 50', stroke: 'var(--ppd-orange)', 'stroke-width': 12, 'stroke-linecap': 'round' });
    return s;
  }

  // A STOOL BY THE TRAY: tonic water poured full, half with water and a
  // quarter, the glow fading jar by jar; and glow sticks in a glass of warm
  // water and a glass of cold.
  function stool(w, h) {
    var s = svg(w, h), top = h * 0.5;
    add(s, 'rect', { x: 30, y: top, width: 20, height: h - top, fill: 'var(--ppd-line)' });
    add(s, 'rect', { x: w - 50, y: top, width: 20, height: h - top, fill: 'var(--ppd-line)' });
    add(s, 'rect', { x: 10, y: top, width: w - 20, height: 20, rx: 4, fill: 'var(--ppd-line)' });
    [1, 0.55, 0.28].forEach(function (a, i) {
      var gx = 26 + i * 62;
      add(s, 'rect', { x: gx, y: top - 92, width: 46, height: 92, rx: 6, fill: 'var(--ppd-line)', 'fill-opacity': 0.55 });
      add(s, 'rect', { x: gx + 4, y: top - 74, width: 38, height: 72, rx: 4, fill: 'var(--ppd-blue)', 'fill-opacity': a });
    });
    [[230, 1, -10], [300, 0.4, 12]].forEach(function (g) {
      add(s, 'rect', { x: g[0], y: top - 96, width: 56, height: 96, rx: 6, fill: 'var(--ppd-line)', 'fill-opacity': 0.55 });
      add(s, 'path', { d: 'M' + (g[0] + 28 + g[2]) + ' ' + (top - 116) + ' L' + (g[0] + 28 - g[2]) + ' ' + (top - 8), stroke: 'var(--ppd-green)', 'stroke-opacity': g[1], 'stroke-width': 10, 'stroke-linecap': 'round' });
    });
    return s;
  }

  // A shelf of paints and jars, every one glowing under the lamp: galaxy jars,
  // a lava lamp and a jar of oil and water above; paint pots, glow nail
  // varnish and a UV torch below.
  function shelf(w, h) {
    var s = svg(w, h), up = h * 0.4, low = h * 0.84;
    [up, low].forEach(function (y) {
      add(s, 'rect', { x: 0, y: y, width: w, height: 18, fill: 'var(--ppd-line)' });
      add(s, 'rect', { x: 30, y: y + 18, width: 14, height: 40, fill: 'var(--ppd-line)' });
      add(s, 'rect', { x: w - 44, y: y + 18, width: 14, height: 40, fill: 'var(--ppd-line)' });
    });
    // Galaxy jars: cotton wool and water and glowing paint in layers.
    [40, 140].forEach(function (x, j) {
      ['var(--ppd-blue)', 'var(--ppd-uv)', j ? 'var(--ppd-green)' : 'var(--ppd-pink)'].forEach(function (ink, k) {
        add(s, 'rect', { x: x, y: up - 40 - k * 40, width: 76, height: 40, fill: ink, 'fill-opacity': 0.75 });
      });
      add(s, 'rect', { x: x - 3, y: up - 134, width: 82, height: 14, rx: 3, fill: 'var(--ppd-line)' });
      for (var d = 0; d < 6; d++) add(s, 'circle', { cx: x + 10 + (d * 29) % 58, cy: up - 14 - (d * 41) % 100, r: 3, fill: 'var(--ppd-yellow)' });
    });
    // A glowing lava lamp in a jar, blobs rising through it.
    add(s, 'path', { d: 'M260 ' + up + ' l12 -30 h52 l12 30 Z', fill: 'var(--ppd-line)' });
    add(s, 'rect', { x: 274, y: up - 210, width: 48, height: 180, rx: 14, fill: 'var(--ppd-orange)', 'fill-opacity': 0.4 });
    [[298, 50, 18], [290, 100, 13], [306, 140, 15], [296, 185, 9]].forEach(function (b) {
      add(s, 'ellipse', { cx: b[0], cy: up - b[1], rx: b[2], ry: b[2] * 1.15, fill: 'var(--ppd-pink)' });
    });
    add(s, 'path', { d: 'M270 ' + (up - 210) + ' l8 -22 h40 l8 22 Z', fill: 'var(--ppd-line)' });
    // Oil that glows, floating on water, and never mixing.
    add(s, 'rect', { x: 380, y: up - 70, width: 80, height: 70, fill: 'var(--ppd-blue)', 'fill-opacity': 0.75 });
    add(s, 'rect', { x: 380, y: up - 116, width: 80, height: 46, fill: 'var(--ppd-yellow)' });
    add(s, 'rect', { x: 377, y: up - 130, width: 86, height: 14, rx: 3, fill: 'var(--ppd-line)' });
    for (var x = 520, i = 0; x < w - 90; x += 110, i++) jar(s, x, up, 70, 70 + (i % 2) * 34, GLOWS[(i + 3) % 5]);
    // Paint pots, glow nail varnish and a UV torch on the lower shelf.
    for (var p = 0; p < 3; p++) jar(s, 40 + p * 110, low, 74, 70 + (p % 3) * 26, GLOWS[p]);
    for (var n = 0; n < 5; n++) {
      add(s, 'rect', { x: 400 + n * 46, y: low - 34, width: 28, height: 34, rx: 6, fill: GLOWS[(n + 2) % 5] });
      add(s, 'rect', { x: 408 + n * 46, y: low - 58, width: 12, height: 26, rx: 3, fill: 'var(--ppd-line)' });
    }
    add(s, 'rect', { x: 660, y: low - 34, width: 150, height: 34, rx: 14, fill: 'var(--ppd-line)' });
    add(s, 'rect', { x: 800, y: low - 40, width: 24, height: 46, rx: 6, fill: 'var(--ppd-line)' });
    add(s, 'ellipse', { cx: 822, cy: low - 17, rx: 6, ry: 16, fill: 'var(--ppd-uv)' });
    return s;
  }

  // A low table for mark making: plain white paper, which glows too, with
  // marks on it; a pot of highlighters; and shaving-cream sensory bags, each
  // with a finger's line drawn through it.
  function markTable(w, h) {
    var s = svg(w, h), top = h * 0.36;
    add(s, 'rect', { x: 20, y: top, width: 20, height: h - top, fill: 'var(--ppd-line)' });
    add(s, 'rect', { x: w - 40, y: top, width: 20, height: h - top, fill: 'var(--ppd-line)' });
    add(s, 'rect', { x: 0, y: top, width: w, height: 24, fill: 'var(--ppd-line)' });
    add(s, 'path', { d: 'M30 ' + top + ' L60 ' + (top - 90) + ' H' + (w * 0.58) + ' L' + (w * 0.6) + ' ' + top + ' Z', fill: 'var(--ppd-ink)' });
    [[1, 0], [3, 22], [0, 44]].forEach(function (m) {
      add(s, 'path', { fill: 'none', stroke: GLOWS[m[0]], 'stroke-width': 7, 'stroke-linecap': 'round',
        d: 'M' + (80 + m[1]) + ' ' + (top - 30 - m[1]) + ' q40 -' + (24 + m[1] / 2) + ' 80 0 t80 0' });
    });
    [[w * 0.64, 'var(--ppd-pink)'], [w * 0.78, 'var(--ppd-green)']].forEach(function (b) {
      add(s, 'path', { d: 'M' + b[0] + ' ' + top + ' l10 -40 h70 l6 40 Z', fill: b[1], 'fill-opacity': 0.85 });
      add(s, 'path', { d: 'M' + (b[0] + 18) + ' ' + (top - 26) + ' q20 22 44 -4', fill: 'none', stroke: 'var(--ppd-night)', 'stroke-width': 4, 'stroke-linecap': 'round' });
    });
    add(s, 'rect', { x: w - 90, y: top - 46, width: 44, height: 46, rx: 6, fill: 'var(--ppd-tray)' });
    [-12, -4, 4, 12].forEach(function (d, i) {
      add(s, 'path', { d: 'M' + (w - 68 + d) + ' ' + (top - 40) + ' l' + d + ' -44', stroke: GLOWS[i], 'stroke-width': 8, 'stroke-linecap': 'round' });
    });
    return s;
  }

  // A big sheet of white paper taped to the back wall, for marks made big with
  // giant brushes.
  function bigSheet(w, h) {
    var s = svg(w, h);
    add(s, 'rect', { x: 10, y: 10, width: w - 20, height: h - 20, fill: 'var(--ppd-ink)' });
    [[0, 0], [w - 70, 0], [0, h - 34], [w - 70, h - 34]].forEach(function (t) {
      add(s, 'rect', { x: t[0], y: t[1], width: 70, height: 34, fill: 'var(--ppd-ink-2)' });
    });
    add(s, 'path', { fill: 'none', stroke: 'var(--ppd-pink)', 'stroke-width': 26, 'stroke-linecap': 'round', d: 'M60 120 q90 -90 180 0 t180 0' });
    add(s, 'path', { fill: 'none', stroke: 'var(--ppd-green)', 'stroke-width': 22, 'stroke-linecap': 'round', d: 'M70 280 q110 70 220 0 t200 10' });
    add(s, 'path', { fill: 'none', stroke: 'var(--ppd-orange)', 'stroke-width': 16, 'stroke-linecap': 'round', d: 'M320 60 L270 330' });
    [[110, 210, 'var(--ppd-yellow)'], [430, 210, 'var(--ppd-blue)'], [200, 350, 'var(--ppd-pink)']].forEach(function (d) {
      add(s, 'circle', { cx: d[0], cy: d[1], r: 18, fill: d[2] });
    });
    return s;
  }

  // The giant brushes in their pot, and a spray bottle, on the floor under it.
  function brushes(w, h) {
    var s = svg(w, h);
    [[-30, 'var(--ppd-yellow)'], [0, 'var(--ppd-blue)'], [28, 'var(--ppd-pink)']].forEach(function (b) {
      var x = 110 + b[0];
      add(s, 'path', { d: 'M110 ' + (h - 40) + ' L' + (x + b[0] * 0.8) + ' 70', stroke: 'var(--ppd-line)', 'stroke-width': 10, 'stroke-linecap': 'round' });
      add(s, 'rect', { x: x + b[0] * 0.8 - 22, y: 20, width: 44, height: 56, rx: 10, fill: b[1] });
    });
    add(s, 'path', { d: 'M60 ' + (h - 120) + ' H160 L150 ' + h + ' H70 Z', fill: 'var(--ppd-line)' });
    add(s, 'rect', { x: 210, y: h - 110, width: 56, height: 110, rx: 14, fill: 'var(--ppd-blue)', 'fill-opacity': 0.6 });
    add(s, 'rect', { x: 222, y: h - 150, width: 32, height: 44, rx: 4, fill: 'var(--ppd-line)' });
    add(s, 'rect', { x: 200, y: h - 150, width: 28, height: 12, rx: 3, fill: 'var(--ppd-line)' });
    return s;
  }

  // A messy play mat: oobleck in a bowl with a spoon, sponges in a tub of
  // water, a basket of pom-poms with pegs on its rim, and cups of oats.
  function messyMat(w, h) {
    var s = svg(w, h), base = h - 30;
    add(s, 'path', { d: 'M40 ' + (base - 40) + ' H' + (w - 40) + ' L' + w + ' ' + h + ' H0 Z', fill: 'var(--ppd-tray)' });
    add(s, 'path', { d: 'M40 ' + (base - 40) + ' q60 70 160 0 Z', fill: 'var(--ppd-line)' });
    add(s, 'path', { d: 'M40 ' + (base - 40) + ' H200', stroke: 'var(--ppd-ink-2)', 'stroke-width': 10, 'stroke-linecap': 'round' });
    add(s, 'path', { d: 'M150 ' + (base - 40) + ' L210 ' + (base - 110), stroke: 'var(--ppd-line)', 'stroke-width': 8, 'stroke-linecap': 'round' });
    add(s, 'path', { d: 'M230 ' + (base - 60) + ' h170 l-14 60 h-142 Z', fill: 'var(--ppd-line)' });
    add(s, 'rect', { x: 236, y: base - 66, width: 158, height: 12, rx: 6, fill: 'var(--ppd-blue)', 'fill-opacity': 0.5 });
    [[250, 'var(--ppd-yellow)'], [288, 'var(--ppd-pink)'], [326, 'var(--ppd-green)'], [356, 'var(--ppd-orange)']].forEach(function (sp, i) {
      add(s, 'rect', { x: sp[0], y: base - 84 + (i % 2) * 6, width: 34, height: 22, rx: 4, fill: sp[1] });
    });
    add(s, 'path', { d: 'M430 ' + (base - 70) + ' h120 l-12 70 h-96 Z', fill: 'var(--ppd-line)' });
    for (var p = 0; p < 9; p++) add(s, 'circle', { cx: 446 + (p * 37) % 92, cy: base - 76 - (p * 17) % 26, r: 14, fill: GLOWS[p % 5] });
    [446, 490, 530].forEach(function (x, i) { add(s, 'rect', { x: x, y: base - 82, width: 8, height: 26, rx: 2, fill: GLOWS[(i + 3) % 5] }); });
    [[580, 34], [622, 28], [656, 22]].forEach(function (c) {
      add(s, 'path', { d: 'M' + c[0] + ' ' + (base - c[1]) + ' h' + c[1] * 1.3 + ' l-4 ' + c[1] + ' h-' + (c[1] * 1.3 - 8) + ' Z', fill: 'var(--ppd-line)' });
      add(s, 'rect', { x: c[0], y: base - c[1] - 6, width: c[1] * 1.3, height: 8, rx: 3, fill: 'var(--ppd-ink-2)' });
    });
    return s;
  }

  // A bracket on the wall for her film to stand on.
  function bracket(w, h) {
    var s = svg(w, h);
    add(s, 'rect', { x: 0, y: 0, width: w, height: 22, rx: 4, fill: 'var(--ppd-line)' });
    add(s, 'path', { d: 'M30 22 L30 ' + h + ' L80 22 Z', fill: 'var(--ppd-line)' });
    add(s, 'path', { d: 'M' + (w - 30) + ' 22 L' + (w - 30) + ' ' + h + ' L' + (w - 80) + ' 22 Z', fill: 'var(--ppd-line)' });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['play-pod.html'] = {
    prefix: 'ppd-walk',
    from: 'faery-yurt.html',
    build: function (kit) {
      var sh = kit.H - 24;
      var BACK = 2200, HALF = 1000, WH = Math.max(1100, sh + 520);
      var eye = sh / 2;
      var decor = [];
      var onto = function (it, sel) {
        return { focus: function (o) { var b = it.el.querySelector(sel); if (b) b.focus(o); } };
      };

      decor.push(kit.item(wall(2 * HALF + 200, WH, true), { x: 0, z: BACK, w: 2 * HALF + 200, h: WH }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(wall(BACK + 600, WH), { x: side * HALF, z: BACK / 2 - 300, w: BACK + 600, h: WH, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      // The big sheet on the back wall, left of the tray, and its brushes.
      var sheet = { x: -640, z: BACK - 8, w: 560, h: 420, y: 240 };
      decor.push(kit.item(bigSheet(560, 420), sheet));
      decor.push(kit.item(brushes(300, 300), { x: -560, z: BACK - 90, w: 300, h: 300 }));
      var tuff = { x: 120, z: BACK - 620, w: 860, h: 420 };
      decor.push(kit.item(tray(860, 420), tuff));
      var stoolAt = { x: 720, z: BACK - 760, w: 380, h: 260 };
      decor.push(kit.item(stool(380, 260), stoolAt));
      var shelfAt = kit.item(shelf(900, 700), { x: HALF - 6, z: 1150, w: 900, h: 700, y: 130, turn: kit.RIGHT });
      decor.push(shelfAt);
      var mat = { x: 560, z: 900, w: 720, h: 230 };
      decor.push(kit.item(messyMat(720, 230), mat));
      var table = { x: -560, z: 640, w: 700, h: 300 };
      decor.push(kit.item(markTable(700, 300), table));

      // Her film for the pod, lifted off her page onto a bracket on the
      // right-hand wall: it plays here as it does there, and nothing of
      // YouTube's arrives until it is pressed. The button that puts it on her
      // page's own screen works only there, so it is left behind.
      decor.push(kit.item(bracket(380, 70), { x: HALF - 6, z: 300, w: 380, h: 70, y: 110, turn: kit.RIGHT }));
      var page = kit.screen(kit.page, 'The Play Pod’s own page, on the left-hand wall');
      var film = kit.lift(page, '.ppd-vid', { x: HALF - 8, z: 300, y: 180, w: 340, turn: kit.RIGHT, cls: 'ppd-walk-film', drop: '.ppd-vid__up' });
      // Her page, on the left-hand wall.
      var PW = Math.min(kit.W - 160, 860), PH = Math.round(PW * 0.62);
      var hung = kit.item(page, { x: -HALF + 6, z: 1300, w: PW, h: PH, y: 200, turn: kit.LEFT, cls: 'ppd-walk-page' });

      var stops = [
        kit.stop({ name: 'inside the round door, the lamp on and the tray glowing ahead', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the right-hand wall, with her film for the pod, the glowing lava lamp', spot: kit.front(film), link: onto(film, 'button') }, film),
        kit.stop({ name: 'at the low table, for mark making, on plain white paper that glows too', spot: kit.front(table, 900) }),
        kit.stop({ name: 'at the messy play mat: oobleck, sponges in water, pom-poms and oats', spot: kit.front(mat, 900) }),
        kit.stop({ name: 'at the shelf of paints and jars, a lava lamp and galaxy jars among them', spot: kit.front(shelfAt) }),
        kit.stop({ name: 'at the tuff tray, under the UV tube, everything in it glowing', spot: kit.front(tuff, 1100) }),
        kit.stop({ name: 'at the stool by the tray: tonic water fading jar by jar, and glow sticks in warm water and in cold', spot: kit.front(stoolAt, 800) }),
        kit.stop({ name: 'at the big sheet on the back wall, with the giant brushes', spot: kit.front(sheet) }),
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
          // round it, which is the only light in here, in rings.
          kit.quad(g, -400, 640, BACK - 900, BACK - 300, kit.ink('--ppd-tray'));
          [[760, 460, 0.04], [600, 360, 0.05], [440, 260, 0.06]].forEach(function (r) {
            kit.oval(g, 120, BACK - 520, r[0], r[1], kit.ink('--ppd-uv'), r[2]);
          });
          // A drop cloth under the sheet on the back wall.
          kit.quad(g, -940, -340, BACK - 260, BACK - 20, kit.ink('--ppd-tray'));
          // A few drips that missed the tray, glowing where they fell, and
          // finger marks trailing off the drop cloth.
          var drips = [['--ppd-pink', -250, BACK - 860], ['--ppd-green', 520, BACK - 880], ['--ppd-yellow', 300, BACK - 940],
                       ['--ppd-orange', -480, BACK - 300], ['--ppd-blue', -700, BACK - 330], ['--ppd-pink', 760, BACK - 1000]];
          drips.forEach(function (d) { kit.oval(g, d[1], d[2], 14, 9, kit.ink(d[0])); });
          for (var f = 0; f < 5; f++) kit.oval(g, -620 + f * 34, BACK - 300 - f * 22, 8, 5, kit.ink('--ppd-yellow'));
        }
      };
    }
  };
})();
