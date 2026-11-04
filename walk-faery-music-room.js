/* =============================================================================
   The Music Room, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1
   of the rooms left on Paper Street.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§115), and this is OURS: a drawing of
   her music room in card for Paper Street, in the colours her room wears (the
   Reading Room's, §114, at her ask) and nothing else, which changes nothing on
   her page and is hers to keep or send back. The Reading Room's house one door
   along, kept off it by the LIGHT: there is no fire here, only candles on two
   standing candelabra, and the tall pointed window at the end is open on the
   night, a crescent moon and bare branches in it, so the room is darkest at
   the ceiling and at the window and nothing on the floor is warm but a
   candle's width round each stand. The phonograph stands in front of the
   window with a chair in the dark facing it; her record case stands in its
   arch on the left-hand wall, the sleeves in it; her page hangs on the right.

   ROUND 2 (Ryan's ask, the same day) drew more of what her page already has
   in it, and nothing it does not: the chandelier of seven candles over the
   rug, the candles in brass sconces along the far wall with a raven at each
   end of the row and a third on the sill looking in, the cello leaning in one
   corner and the harp in the other, the rug with its brass ring, a cobweb in
   each top corner, the window's tracery as she drew it, the phonograph's horn
   as the flower of petals her page draws, and her records as LP sleeves with
   the discs showing over their tops. The phonograph's deck, off her page, now
   stands on the left-hand wall by the window and plays her playlists here as
   it does there; nothing reaches YouTube until a press. New places to stand:
   at the deck, in the chair, under the chandelier, by the cello, by the harp.

   NOTHING MOVES: the record does not turn, the candles stand still. Every
   colour is one her room declares, by name. It keeps nothing, sends nothing
   and fetches nothing; her page arrives through Paper Street's screen().
   tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var SLEEVES = ['--rdr-velvet', '--rdr-leather', '--rdr-ember', '--rdr-brass', '--rdr-ink-2', '--rdr-flame'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }
  function add(s, name, attrs) { s.appendChild(el(name, attrs)); }
  function pointed(x, w, h, top) {
    var mid = x + w / 2, spring = top + w * 0.7;
    return 'M' + x + ' ' + h + ' V' + spring + ' Q' + x + ' ' + (top + w * 0.15) + ' ' + mid + ' ' + top +
      ' Q' + (x + w) + ' ' + (top + w * 0.15) + ' ' + (x + w) + ' ' + spring + ' V' + h + ' Z';
  }
  // A candle as her page draws them: cream wax, a flame, and a halo no wider
  // than a hand. Nothing round it is lit, and it stands still.
  function candle(s, x, foot, h, r) {
    r = r || 8;
    add(s, 'circle', { cx: x, cy: foot - h - r * 2.6, r: r * 3.2, fill: 'var(--rdr-flame-2)', 'fill-opacity': '0.14' });
    add(s, 'rect', { x: x - r, y: foot - h, width: r * 2, height: h, fill: 'var(--rdr-ink)' });
    add(s, 'path', { fill: 'var(--rdr-flame-2)', d: 'M' + x + ' ' + (foot - h - r * 4) + ' q' + r * 1.3 + ' ' + r * 2 + ' 0 ' + r * 3.6 + ' q' + (-r * 1.3) + ' ' + (-r * 1.7) + ' 0 ' + (-r * 3.6) + ' Z' });
    add(s, 'circle', { cx: x, cy: foot - h - r * 1.6, r: r * 0.45, fill: 'var(--rdr-flame)' });
  }
  // A raven, perched and looking into the room, as on her page: in the
  // darkest colour her room has, a brass eye. k is its size, facing -1 or 1.
  function raven(s, x, foot, k, face) {
    var f = face || 1;
    add(s, 'ellipse', { cx: x, cy: foot - 5 * k, rx: 9 * k, ry: 5.5 * k, fill: 'var(--rdr-stone)' });
    add(s, 'path', { fill: 'var(--rdr-stone)', d: 'M' + (x - 7 * k * f) + ' ' + (foot - 5 * k) + ' L' + (x - 18 * k * f) + ' ' + (foot - 2 * k) + ' L' + (x - 8 * k * f) + ' ' + (foot - k) + ' Z' });
    add(s, 'circle', { cx: x + 7 * k * f, cy: foot - 10 * k, r: 4.2 * k, fill: 'var(--rdr-stone)' });
    add(s, 'path', { fill: 'var(--rdr-panel)', d: 'M' + (x + 10.5 * k * f) + ' ' + (foot - 10 * k) + ' L' + (x + 17 * k * f) + ' ' + (foot - 8.5 * k) + ' L' + (x + 10.5 * k * f) + ' ' + (foot - 8 * k) + ' Z' });
    add(s, 'circle', { cx: x + 8 * k * f, cy: foot - 10.6 * k, r: 0.9 * k, fill: 'var(--rdr-brass)' });
    add(s, 'path', { stroke: 'var(--rdr-panel)', 'stroke-width': 1.2 * k, d: 'M' + (x - 2 * k) + ' ' + foot + ' v' + 3 * k + ' M' + (x + 3 * k) + ' ' + foot + ' v' + 3 * k });
  }
  // A cobweb in a top corner, its threads in her dimmer cream, faint.
  function cobweb(s, x, y, k, f) {
    var g = el('g', { fill: 'none', stroke: 'var(--rdr-ink-2)', 'stroke-width': 1.6, 'stroke-opacity': '0.38', 'stroke-linecap': 'round' });
    var X = function (u) { return x + u * k * f; }, Y = function (u) { return y + u * k; };
    g.appendChild(el('path', { d: 'M' + X(0) + ' ' + Y(0) + ' L' + X(44) + ' ' + Y(10) + ' M' + X(0) + ' ' + Y(0) + ' L' + X(36) + ' ' + Y(24) + ' M' + X(0) + ' ' + Y(0) + ' L' + X(22) + ' ' + Y(34) + ' M' + X(0) + ' ' + Y(0) + ' L' + X(8) + ' ' + Y(40) }));
    g.appendChild(el('path', { d: 'M' + X(10) + ' ' + Y(2) + ' Q' + X(10) + ' ' + Y(7) + ' ' + X(8) + ' ' + Y(9) + ' Q' + X(5) + ' ' + Y(11) + ' ' + X(2) + ' ' + Y(10) +
      ' M' + X(22) + ' ' + Y(5) + ' Q' + X(20) + ' ' + Y(14) + ' ' + X(16) + ' ' + Y(18) + ' Q' + X(11) + ' ' + Y(22) + ' ' + X(4) + ' ' + Y(20) +
      ' M' + X(34) + ' ' + Y(8) + ' Q' + X(30) + ' ' + Y(22) + ' ' + X(24) + ' ' + Y(27) + ' Q' + X(17) + ' ' + Y(32) + ' ' + X(6) + ' ' + Y(30) }));
    s.appendChild(g);
  }
  // Panelling below a dado rail: her timber framing panels of the wall.
  function dado(s, w, top, foot) {
    add(s, 'rect', { x: 0, y: top, width: w, height: foot - top, fill: 'var(--rdr-panel)' });
    for (var x = 30; x + 150 < w; x += 190) add(s, 'rect', { x: x, y: top + 34, width: 150, height: foot - top - 70, fill: 'var(--rdr-wall)', stroke: 'var(--rdr-timber)', 'stroke-width': 8 });
    add(s, 'rect', { x: 0, y: top - 8, width: w, height: 18, fill: 'var(--rdr-timber)' });
    add(s, 'rect', { x: 0, y: foot, width: w, height: 30, fill: 'var(--rdr-timber)' });
  }

  // The far wall with the tall pointed window open on the night: a crescent
  // moon and bare branches, her tracery, a raven on the sill, and the
  // candles in their sconces along the wall with a raven at each end.
  function windowWall(w, h) {
    var s = svg(w, h), ww = 520, wx = (w - ww) / 2, top = h * 0.08, bot = h * 0.8, wh = bot - top;
    add(s, 'rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rdr-wall)' });
    add(s, 'rect', { x: 0, y: 0, width: w, height: h * 0.16, fill: 'var(--rdr-stone)' });
    dado(s, w, h * 0.78, h - 30);
    add(s, 'path', { fill: 'var(--rdr-timber)', d: pointed(wx - 26, ww + 52, bot + 26, top - 26) });
    add(s, 'path', { fill: 'var(--rdr-stone)', d: pointed(wx, ww, bot, top) });
    var mx = wx + ww * 0.7, my = top + ww * 0.5;
    add(s, 'circle', { cx: mx, cy: my, r: 46, fill: 'var(--rdr-flame-2)' });
    add(s, 'circle', { cx: mx - 20, cy: my - 12, r: 42, fill: 'var(--rdr-stone)' });
    [[wx, bot - 80, wx + ww * 0.4, bot - 260, wx + ww * 0.3, top + ww * 0.9, 10],
     [wx + ww, bot - 140, wx + ww * 0.6, bot - 320, wx + ww * 0.75, bot - 470, 10],
     [wx + ww * 0.4, bot - 260, wx + ww * 0.55, bot - 380, wx + ww * 0.5, bot - 520, 8],
     [wx + ww * 0.35, bot - 150, wx + ww * 0.25, bot - 200, wx + ww * 0.12, bot - 230, 5],
     [wx + ww * 0.66, bot - 300, wx + ww * 0.8, bot - 330, wx + ww * 0.92, bot - 300, 5],
     [wx + ww * 0.52, bot - 450, wx + ww * 0.4, bot - 500, wx + ww * 0.36, bot - 560, 4]].forEach(function (b) {
      add(s, 'path', { fill: 'none', stroke: 'var(--rdr-timber)', 'stroke-width': b[6], 'stroke-linecap': 'round',
        d: 'M' + b[0] + ' ' + b[1] + ' Q' + b[2] + ' ' + b[3] + ' ' + b[4] + ' ' + b[5] });
    });
    // Her tracery: a mullion, two transoms and an inner pointed arch.
    var tr = el('g', { fill: 'none', stroke: 'var(--rdr-timber)', 'stroke-width': 14 });
    tr.appendChild(el('path', { d: 'M' + (wx + ww / 2) + ' ' + (top + ww * 0.1) + ' V' + bot + ' M' + wx + ' ' + (top + wh * 0.53) + ' H' + (wx + ww) + ' M' + wx + ' ' + (top + wh * 0.77) + ' H' + (wx + ww) }));
    tr.appendChild(el('path', { 'stroke-width': 10, d: 'M' + (wx + ww * 0.25) + ' ' + (top + wh * 0.53) + ' Q' + (wx + ww * 0.25) + ' ' + (top + wh * 0.3) + ' ' + (wx + ww / 2) + ' ' + (top + wh * 0.21) +
      ' Q' + (wx + ww * 0.75) + ' ' + (top + wh * 0.3) + ' ' + (wx + ww * 0.75) + ' ' + (top + wh * 0.53) }));
    s.appendChild(tr);
    add(s, 'rect', { x: wx - 40, y: bot, width: ww + 80, height: 24, fill: 'var(--rdr-timber)' });
    raven(s, wx + ww * 0.3, bot + 2, 4.4, 1);
    // The sconces, two either side of the window, and a raven on a bracket
    // at each end of the row.
    var sy = h * 0.42;
    [wx - 420, wx - 300, wx + ww + 300, wx + ww + 420].forEach(function (x) {
      add(s, 'path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 9, 'stroke-linecap': 'round', d: 'M' + (x - 30) + ' ' + (sy - 30) + ' q0 30 30 30 q30 0 30 -30' });
      add(s, 'rect', { x: x - 6, y: sy - 4, width: 12, height: 40, fill: 'var(--rdr-brass)' });
      add(s, 'circle', { cx: x, cy: sy + 40, r: 10, fill: 'var(--rdr-brass)' });
      candle(s, x, sy - 30, 70, 9);
    });
    [[wx - 560, -1], [wx + ww + 560, 1]].forEach(function (p) {
      add(s, 'path', { fill: 'var(--rdr-brass)', d: 'M' + (p[0] - 50) + ' ' + (sy + 4) + ' h100 v10 h-46 v34 h-8 v-34 h-46 Z' });
      raven(s, p[0], sy + 3, 4.6, -p[1]);
    });
    cobweb(s, 0, h * 0.16, 7, 1);
    cobweb(s, w, h * 0.16, 7, -1);
    return s;
  }

  // A side wall, claret, darkest at the ceiling, a picture rail and a dado of
  // timber panels.
  function plainWall(w, h) {
    var s = svg(w, h);
    add(s, 'rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rdr-stone)' });
    add(s, 'rect', { x: 0, y: h * 0.25, width: w, height: h * 0.75, fill: 'var(--rdr-wall)' });
    add(s, 'rect', { x: 0, y: h * 0.25, width: w, height: 12, fill: 'var(--rdr-timber)' });
    dado(s, w, h * 0.72, h - 30);
    return s;
  }

  // A standing candelabrum as her page draws it: a brass foot and stem with
  // knops on it, two curved arms, three candles in drip pans; still.
  function candelabrum(w, h) {
    var s = svg(w, h), cx = w / 2, arm = h * 0.3;
    add(s, 'path', { fill: 'var(--rdr-brass)', d: 'M' + (cx - 70) + ' ' + h + ' Q' + (cx - 60) + ' ' + (h - 30) + ' ' + (cx - 12) + ' ' + (h - 44) + ' H' + (cx + 12) + ' Q' + (cx + 60) + ' ' + (h - 30) + ' ' + (cx + 70) + ' ' + h + ' Z' });
    add(s, 'rect', { x: cx - 7, y: arm, width: 14, height: h - arm - 40, fill: 'var(--rdr-brass)' });
    [0.55, 0.78].forEach(function (k) { add(s, 'ellipse', { cx: cx, cy: h * k, rx: 18, ry: 12, fill: 'var(--rdr-brass)' }); });
    add(s, 'ellipse', { cx: cx, cy: arm + 30, rx: 14, ry: 9, fill: 'var(--rdr-brass)' });
    add(s, 'path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 11, 'stroke-linecap': 'round',
      d: 'M' + cx + ' ' + (arm + 36) + ' Q' + (cx - w * 0.38) + ' ' + (arm + 30) + ' ' + (cx - w * 0.38) + ' ' + (arm - 10) +
         ' M' + cx + ' ' + (arm + 36) + ' Q' + (cx + w * 0.38) + ' ' + (arm + 30) + ' ' + (cx + w * 0.38) + ' ' + (arm - 10) });
    [[-0.38, arm - 10], [0, arm - 30], [0.38, arm - 10]].forEach(function (c) {
      var x = cx + c[0] * w;
      add(s, 'rect', { x: x - 22, y: c[1], width: 44, height: 9, rx: 4, fill: 'var(--rdr-brass)' });
      candle(s, x, c[1], c[0] ? 80 : 96, 10);
    });
    return s;
  }

  // The phonograph on its cabinet, its horn opening like the flower of
  // petals her page draws, brass and flame by turns round a dark throat;
  // a record on the turntable, the arm, a crank, and two records leaning on
  // the cabinet with their discs showing.
  function phonograph(w, h) {
    var s = svg(w, h), cy = h * 0.62, hx = w * 0.56, hy = h * 0.3, R = w * 0.36;
    add(s, 'rect', { x: w * 0.16, y: cy, width: w * 0.68, height: h - cy - 22, rx: 8, fill: 'var(--rdr-timber)' });
    add(s, 'rect', { x: w * 0.23, y: cy + 34, width: w * 0.54, height: (h - cy) * 0.48, rx: 6, fill: 'var(--rdr-panel)', stroke: 'var(--rdr-brass)', 'stroke-width': 3 });
    [0.2, 0.76].forEach(function (k) { add(s, 'rect', { x: w * k, y: h - 24, width: 18, height: 24, fill: 'var(--rdr-timber)' }); });
    add(s, 'path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 6, 'stroke-linecap': 'round', d: 'M' + w * 0.84 + ' ' + (cy + 50) + ' h22 v40 h16' });
    add(s, 'rect', { x: w * 0.18, y: cy - 30, width: w * 0.64, height: 34, rx: 6, fill: 'var(--rdr-leather)' });
    add(s, 'ellipse', { cx: w * 0.42, cy: cy - 32, rx: w * 0.22, ry: 10, fill: 'var(--rdr-stone)' });
    add(s, 'ellipse', { cx: w * 0.42, cy: cy - 32, rx: w * 0.06, ry: 4, fill: 'var(--rdr-ember)' });
    // The neck of the horn, up out of the back of the cabinet to its throat.
    add(s, 'path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 14, 'stroke-linecap': 'round', d: 'M' + w * 0.68 + ' ' + (cy - 30) + ' Q' + w * 0.72 + ' ' + (hy + R * 0.9) + ' ' + hx + ' ' + (hy + R * 0.25) });
    add(s, 'path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 5, 'stroke-linecap': 'round', d: 'M' + w * 0.68 + ' ' + (cy - 30) + ' L' + w * 0.5 + ' ' + (cy - 36) });
    var N = 12;
    for (var i = 0; i < N; i++) {
      var a0 = i / N * Math.PI * 2, a1 = (i + 1) / N * Math.PI * 2, am = (a0 + a1) / 2;
      var p0 = [hx + R * Math.cos(a0), hy + R * 0.92 * Math.sin(a0)], p1 = [hx + R * Math.cos(a1), hy + R * 0.92 * Math.sin(a1)];
      var bulge = [hx + R * 1.16 * Math.cos(am), hy + R * 1.08 * Math.sin(am)];
      add(s, 'path', { fill: i % 2 ? 'var(--rdr-flame)' : 'var(--rdr-brass)', stroke: 'var(--rdr-timber)', 'stroke-width': 2,
        d: 'M' + hx + ' ' + hy + ' L' + p0[0] + ' ' + p0[1] + ' Q' + bulge[0] + ' ' + bulge[1] + ' ' + p1[0] + ' ' + p1[1] + ' Z' });
    }
    add(s, 'circle', { cx: hx, cy: hy, r: R * 0.34, fill: 'var(--rdr-timber)', 'fill-opacity': '0.7' });
    add(s, 'circle', { cx: hx, cy: hy, r: R * 0.12, fill: 'var(--rdr-stone)' });
    // Two records leaning on its foot, in her sleeves' colours.
    [['--rdr-velvet', w * 0.02], ['--rdr-ember', w * 0.1]].forEach(function (r) {
      add(s, 'circle', { cx: r[1] + 46, cy: h - 92, r: 40, fill: 'var(--rdr-stone)' });
      add(s, 'circle', { cx: r[1] + 46, cy: h - 92, r: 10, fill: 'var(--rdr-ember)' });
      add(s, 'rect', { x: r[1], y: h - 88, width: 92, height: 88, rx: 2, fill: 'var(' + r[0] + ')' });
    });
    return s;
  }

  // A wing chair in the dark facing the phonograph, its back to you, velvet,
  // with a row of brass studs and four short legs.
  function chair(w, h) {
    var s = svg(w, h);
    add(s, 'path', { fill: 'var(--rdr-velvet)', d: 'M' + w * 0.1 + ' ' + h * 0.7 + ' V' + h * 0.2 + ' Q' + w / 2 + ' ' + (-h * 0.06) + ' ' + w * 0.9 + ' ' + h * 0.2 + ' V' + h * 0.7 + ' Z' });
    [[0, 1], [w, -1]].forEach(function (wg) {
      add(s, 'path', { fill: 'var(--rdr-velvet)', stroke: 'var(--rdr-stone)', 'stroke-width': 3, d: 'M' + (wg[0] + wg[1] * w * 0.12) + ' ' + h * 0.7 + ' V' + h * 0.28 + ' Q' + wg[0] + ' ' + h * 0.24 + ' ' + wg[0] + ' ' + h * 0.4 + ' V' + h * 0.62 + ' Z' });
    });
    for (var t = 0; t < 3; t++) for (var u = 0; u < 3; u++) add(s, 'circle', { cx: w * (0.32 + u * 0.18), cy: h * (0.22 + t * 0.14), r: 3, fill: 'var(--rdr-stone)' });
    add(s, 'rect', { x: 0, y: h * 0.5, width: w, height: h * 0.26, rx: 20, fill: 'var(--rdr-leather)' });
    for (var b = 0; b < 9; b++) add(s, 'circle', { cx: w * 0.1 + b * w * 0.1, cy: h * 0.55, r: 4, fill: 'var(--rdr-brass)' });
    [0.12, 0.88].forEach(function (k) { add(s, 'rect', { x: w * k - 8, y: h * 0.76, width: 16, height: h * 0.24, fill: 'var(--rdr-timber)' }); });
    return s;
  }

  // The chandelier as her page draws it: a chain, a hub, arms curving down to
  // a brass ring, six candles round it and the seventh in the middle, and
  // brass drops under it. Hung, and still.
  function chandelier(w, h) {
    var s = svg(w, h), cx = w / 2, ry = h * 0.72, rx = w * 0.4, rr = 26, hub = h * 0.5;
    add(s, 'path', { stroke: 'var(--rdr-brass)', 'stroke-width': 5, d: 'M' + cx + ' 0 V' + (hub - 30) });
    add(s, 'circle', { cx: cx, cy: hub - 34, r: 10, fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 5 });
    add(s, 'ellipse', { cx: cx, cy: hub, rx: 14, ry: 20, fill: 'var(--rdr-brass)' });
    var spots = [];
    for (var i = 0; i < 6; i++) {
      var a = Math.PI * (0.08 + i * 0.168);
      spots.push([cx - rx * Math.cos(a), ry + rr * Math.sin(a)]);
    }
    add(s, 'ellipse', { cx: cx, cy: ry, rx: rx, ry: rr, fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 7 });
    spots.forEach(function (p) {
      add(s, 'path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 6, 'stroke-linecap': 'round', d: 'M' + cx + ' ' + (hub + 14) + ' Q' + (cx + (p[0] - cx) * 0.7) + ' ' + (hub + 16) + ' ' + p[0] + ' ' + (p[1] - 4) });
    });
    for (var d = 0; d < 7; d++) {
      var da = Math.PI * (0.1 + d * 0.133);
      add(s, 'circle', { cx: cx - rx * 0.92 * Math.cos(da), cy: ry + rr * 0.92 * Math.sin(da) + 22, r: 5, fill: 'var(--rdr-brass)' });
    }
    spots.forEach(function (p) {
      add(s, 'rect', { x: p[0] - 16, y: p[1] - 6, width: 32, height: 8, rx: 3, fill: 'var(--rdr-brass)' });
      candle(s, p[0], p[1] - 6, 52, 7);
    });
    add(s, 'rect', { x: cx - 16, y: hub - 12, width: 32, height: 8, rx: 3, fill: 'var(--rdr-brass)' });
    candle(s, cx, hub - 12, 44, 7);
    return s;
  }

  // The cello leaning on the left-hand wall, as her page draws it: the
  // outline is hers, worked out leaning, the top towards the wall.
  function cello(w, h) {
    var s = svg(w, h), k = h / 126, lean = 0.2;
    var P = function (x, y) { return [(w * 0.35 + k * (x - 30) - lean * k * (164 - y)).toFixed(1), (k * (y - 40)).toFixed(1)].join(' '); };
    add(s, 'path', { fill: 'none', stroke: 'var(--rdr-timber)', 'stroke-width': 4 * k, 'stroke-linecap': 'round', d: 'M' + P(30, 46) + ' L' + P(30, 94) });
    add(s, 'path', { fill: 'var(--rdr-timber)', d: 'M' + P(30, 40) + ' Q' + P(24, 42) + ' ' + P(25, 48) + ' Q' + P(28, 51) + ' ' + P(30, 48) + ' Z' });
    add(s, 'path', { fill: 'var(--rdr-leather)', stroke: 'var(--rdr-timber)', 'stroke-width': 1.6 * k,
      d: 'M' + P(30, 90) + ' Q' + P(8, 90) + ' ' + P(8, 110) + ' Q' + P(8, 120) + ' ' + P(16, 122) + ' Q' + P(6, 130) + ' ' + P(8, 144) +
         ' Q' + P(10, 156) + ' ' + P(30, 156) + ' Q' + P(50, 156) + ' ' + P(52, 144) + ' Q' + P(54, 130) + ' ' + P(44, 122) +
         ' Q' + P(52, 120) + ' ' + P(52, 110) + ' Q' + P(52, 90) + ' ' + P(30, 90) + ' Z' });
    add(s, 'path', { stroke: 'var(--rdr-brass)', 'stroke-width': 0.8 * k, 'stroke-opacity': '0.7', d: 'M' + P(27, 60) + ' L' + P(27, 150) + ' M' + P(33, 60) + ' L' + P(33, 150) });
    add(s, 'path', { fill: 'none', stroke: 'var(--rdr-stone)', 'stroke-width': 1.2 * k, d: 'M' + P(18, 118) + ' Q' + P(22, 124) + ' ' + P(18, 130) + ' M' + P(42, 118) + ' Q' + P(38, 124) + ' ' + P(42, 130) });
    add(s, 'path', { stroke: 'var(--rdr-stone)', 'stroke-width': 2 * k, d: 'M' + P(30, 156) + ' L' + P(30, 164) });
    add(s, 'path', { stroke: 'var(--rdr-brass)', 'stroke-width': 1.4 * k, d: 'M' + P(24, 128) + ' L' + P(36, 128) });
    return s;
  }

  // The harp in the other corner, as her page draws it: an arched timber
  // frame, brass strings, a timber base.
  function harp(w, h) {
    var s = svg(w, h), k = h / 108;
    var X = function (x) { return ((x - 16) * k).toFixed(1); }, Y = function (y) { return ((y - 40) * k).toFixed(1); };
    add(s, 'path', { fill: 'var(--rdr-timber)', d: 'M' + X(22) + ' ' + Y(146) + ' V' + Y(62) + ' Q' + X(22) + ' ' + Y(40) + ' ' + X(44) + ' ' + Y(40) + ' Q' + X(66) + ' ' + Y(40) + ' ' + X(68) + ' ' + Y(70) + ' L' + X(68) + ' ' + Y(146) + ' Z' });
    add(s, 'path', { fill: 'var(--rdr-wall)', d: 'M' + X(30) + ' ' + Y(146) + ' V' + Y(66) + ' Q' + X(30) + ' ' + Y(48) + ' ' + X(44) + ' ' + Y(48) + ' Q' + X(60) + ' ' + Y(48) + ' ' + X(60) + ' ' + Y(72) + ' L' + X(60) + ' ' + Y(146) + ' Z' });
    [[34, 62], [38, 56], [42, 51], [46, 49], [50, 51], [54, 56], [58, 63]].forEach(function (st) {
      add(s, 'path', { stroke: 'var(--rdr-brass)', 'stroke-width': 0.9 * k, 'stroke-opacity': '0.8', d: 'M' + X(st[0]) + ' ' + Y(146) + ' V' + Y(st[1]) });
    });
    add(s, 'path', { stroke: 'var(--rdr-timber)', 'stroke-width': 5 * k, 'stroke-linecap': 'round', d: 'M' + X(18) + ' ' + Y(146) + ' H' + X(72) });
    return s;
  }

  // The record case in its arch, every song a record in its sleeve, standing
  // on its plank, the disc showing over the top of the sleeve.
  function recordCase(w, h) {
    var s = svg(w, h), n = 0, top = h * 0.12, L = w * 0.1, Rr = w * 0.9;
    add(s, 'rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rdr-wall)' });
    add(s, 'path', { fill: 'var(--rdr-timber)', d: pointed(L - 24, Rr - L + 48, h, top - 24) });
    add(s, 'path', { fill: 'var(--rdr-stone)', d: pointed(L, Rr - L, h, top) });
    add(s, 'circle', { cx: w / 2, cy: top - 30, r: 12, fill: 'var(--rdr-brass)' });
    var SL = 96, GAP = 14, foot = h - 70;
    add(s, 'rect', { x: L, y: foot, width: Rr - L, height: 70, fill: 'var(--rdr-timber)' });
    add(s, 'rect', { x: L + 30, y: foot + 16, width: Rr - L - 60, height: 38, fill: 'var(--rdr-panel)', stroke: 'var(--rdr-brass)', 'stroke-width': 3 });
    for (var y = top + (Rr - L) * 0.32; y + SL + 54 <= foot; y += SL + 64) {
      // Up in the point of the arch there is less room: as many as fit.
      var spring = top + (Rr - L) * 0.7, room = Rr - L - 20;
      if (y - 30 < spring) room = (Rr - L) * Math.sqrt(Math.max(0, (y - 30 - top) / (spring - top))) - 40;
      var row = Math.max(0, Math.floor((room + GAP) / (SL + GAP))), x0 = L + (Rr - L - row * (SL + GAP) + GAP) / 2;
      if (!row) continue;
      for (var c = 0; c < row; c++, n++) {
        var x = x0 + c * (SL + GAP);
        add(s, 'circle', { cx: x + SL / 2, cy: y + 30, r: SL * 0.42, fill: 'var(--rdr-timber)' });
        add(s, 'circle', { cx: x + SL / 2, cy: y + 30, r: SL * 0.12, fill: n % 3 ? 'var(--rdr-ember)' : 'var(--rdr-flame)' });
        add(s, 'rect', { x: x, y: y + 40, width: SL, height: SL, rx: 2, fill: 'var(' + SLEEVES[n % SLEEVES.length] + ')' });
        add(s, 'rect', { x: x + 10, y: y + SL + 12, width: SL * 0.6, height: 6, fill: 'var(--rdr-stone)', 'fill-opacity': '0.5' });
      }
      add(s, 'rect', { x: x0 - 16, y: y + 40 + SL, width: row * (SL + GAP) - GAP + 32, height: 14, fill: 'var(--rdr-timber)' });
    }
    return s;
  }

  // The shelf the deck stands on: her timber, on brass brackets.
  function deckShelf(w, h) {
    var s = svg(w, h);
    add(s, 'rect', { x: 0, y: 0, width: w, height: 18, rx: 3, fill: 'var(--rdr-timber)' });
    [0.12, 0.88].forEach(function (k) {
      add(s, 'path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 8, 'stroke-linecap': 'round', d: 'M' + w * k + ' 18 V' + (h - 10) + ' M' + w * k + ' ' + (h * 0.7) + ' Q' + (w * k + (k < 0.5 ? 40 : -40)) + ' ' + h * 0.5 + ' ' + (w * k + (k < 0.5 ? 60 : -60)) + ' 20' });
    });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['faery-music-room.html'] = {
    prefix: 'mus-walk',
    from: 'faery-yurt.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var END = 2300 + F;                          // the window wall
      var eye = sh / 2;
      var SIDE = 900, WH = Math.max(1100, sh + 500);
      var decor = [];

      decor.push(kit.item(windowWall(SIDE * 2 + 40, WH), { x: 0, z: END + 20, w: SIDE * 2 + 40, h: WH }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(plainWall(END + 400, WH), { x: side * SIDE, z: (END - 400) / 2, w: END + 400, h: WH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT, near: 0.3 }));
      });
      var phono = kit.item(phonograph(440, 560), { x: 0, z: END - 300, w: 440, h: 560 });
      decor.push(phono);
      var cel = kit.item(cello(200, 380), { x: -SIDE + 150, z: END - 170, w: 200, h: 380 });
      var hrp = kit.item(harp(300, 460), { x: SIDE - 190, z: END - 640, w: 300, h: 460 });
      decor.push(cel, hrp);
      var seat = kit.item(chair(260, 300), { x: -300, z: END - 1250, w: 260, h: 300 });
      decor.push(seat);
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(candelabrum(240, 620), { x: side * 400, z: END - 460, w: 240, h: 620 }));
      });
      var CHY = eye + 200;
      var lights = kit.item(chandelier(560, 420), { x: 0, y: CHY, z: END - 1250, w: 560, h: 420 });
      decor.push(lights);
      var records = kit.item(recordCase(900, WH * 0.85), { x: -SIDE + 6, z: 1300, w: 900, h: WH * 0.85, turn: kit.LEFT });
      decor.push(records);

      var page = kit.screen(kit.page, 'Helen’s Music Room’s own page, on the right-hand wall');
      // The phonograph's deck, off her page, on a shelf on the left-hand wall
      // by the window: her playlists, each saying it runs until you stop it.
      var DZ = END - 820;
      decor.push(kit.item(deckShelf(600, 150), { x: -SIDE + 8, z: DZ, w: 600, h: 150, y: 24, turn: kit.LEFT }));
      var deck = kit.lift(page, '.mus-deck', { x: -SIDE + 10, y: 136, z: DZ, w: 540, turn: kit.LEFT, cls: 'mus-walk-deck' });
      var leaf = kit.item(page, { x: SIDE - 8, z: 1300, w: sw, h: sh, turn: kit.RIGHT, cls: 'mus-walk-wall' });
      var onto = function (it, sel) { return { focus: function (o) { var b = it.el.querySelector(sel); if (b) b.focus(o); } }; };

      var stops = [
        kit.stop({ name: 'through the door by the phonograph, the window ahead open on the night', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'on the rug, the chandelier and its seven candles ahead over the chair', spot: { x: 160, z: END - 1250 - F * 1.6 } }, lights),
        kit.stop({ name: 'at her record case, the sleeves standing in it', spot: kit.front(records, F * 1.2) }, records),
        kit.stop({ name: 'in the chair in the dark, facing the phonograph and the window', spot: { x: -300, z: END - 1250 } }),
        kit.stop({ name: 'at the phonograph in front of the window, between the candles', spot: { x: 0, z: END - 300 - F * 1.1 } }, phono),
        kit.stop({ name: 'by the harp, standing on the right by the window', spot: { x: SIDE - 320, z: END - 640 - F * 1.05, yaw: 0.1 } }, hrp),
        kit.stop({ name: 'by the cello, leaning in the corner on the left', spot: { x: -SIDE + 300, z: END - 170 - F * 1.2, yaw: -0.12 } }, cel),
        kit.stop({ name: 'at the phonograph’s deck by the window, with her playlists on it', spot: kit.front(deck), link: onto(deck, 'button') }, deck),
        kit.stop({ name: 'at the right-hand wall, with her own page on it', spot: kit.front(leaf), link: page }, leaf)
      ];

      return {
        cls: 'mus-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Her own page hangs on the right-hand wall, the phonograph’s deck on the left by the window, and the phonograph stands at the window at the end.',
        bounds: function () { return { x: [-SIDE + 300, SIDE - 300], z: [0, END - 700] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--rdr-stone'));
          kit.quad(g, -SIDE, SIDE, Math.max(from, -400), Math.min(to, END), kit.ink('--rdr-timber'));
          var seam = kit.ink('--rdr-stone');
          for (var z = Math.max(-400, Math.ceil(from / 120) * 120); z < Math.min(to, END); z += 120) kit.quad(g, -SIDE, SIDE, z, z + 4, seam, 0.6);
          for (var x = -SIDE + 150; x < SIDE; x += 300) kit.quad(g, x, x + 3, Math.max(from, -400), Math.min(to, END), seam, 0.35);
          // A candle's width of light round each stand, and nothing more.
          [-1, 1].forEach(function (side) { kit.oval(g, side * 400, END - 460, 240, 190, kit.ink('--rdr-flame-2'), 0.10); });
          // Her rug, velvet with a brass ring woven into it, under the chair
          // and the chandelier, and the chandelier's light faint on it.
          kit.oval(g, -40, END - 1250, 560, 520, kit.ink('--rdr-velvet'), 0.85);
          kit.oval(g, -40, END - 1250, 470, 430, kit.ink('--rdr-brass'), 0.5);
          kit.oval(g, -40, END - 1250, 455, 415, kit.ink('--rdr-velvet'), 1);
          kit.oval(g, 0, END - 1250, 300, 260, kit.ink('--rdr-flame-2'), 0.05);
        }
      };
    }
  };
})();
