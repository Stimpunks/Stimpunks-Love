/* =============================================================================
   The Reading Room, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   1 of the rooms left on Paper Street, and round 2 the same day ("Do a round 2
   on the subrooms of the yurt").

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§114), and this is OURS: a drawing of
   her library in card for Paper Street, in her room's own declared colours and
   nothing else, which changes nothing on her page and is hers to keep or send
   back. Claret walls lit from the FLOOR by a fire at one side, so it is warmest
   at the hearthrug and darkest at the ceiling; a pointed stone fireplace on the
   left wall with the sofa facing it, candles in brass sconces on the walls and
   never along the shelves (the Mopery's are along its shelves, and its walls
   are stone the candles never reach; these are claret because the fire does),
   and her bookcases standing in tall timber arches drawn up to a point down
   the right-hand wall. Her page hangs on the far wall in a timber frame.

   ROUND 2 BROUGHT MORE OF WHAT HER PAGE SAYS IS IN THE ROOM: her own cases,
   lifted off her page into the arches, every spine a door as it is there; the
   card catalogue, its drawers over a cabinet by the door; the gramophone, its
   switch and its shelf of records, which rack.js, her page's own script, plays
   here as it does there; and, drawn, the chandelier of seven candles, the raven
   on the mantel and on the arches, a candelabra either side of the hearth, the
   logs and firedogs, the sofa's cushions and the book left open on it, the two
   leather armchairs turned to the fire, and the rug with its brass ring.

   NOTHING MOVES. The fire is drawn, the candles stand still; the record on her
   gramophone turns at MAX by her page's own rule, as it does there, and
   nothing else does. Every colour is
   one her room declares, by name. It keeps nothing, sends nothing and fetches
   nothing; her page arrives through Paper Street's screen().
   tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var SPINES = ['--rdr-velvet', '--rdr-leather', '--rdr-brass', '--rdr-ink-2', '--rdr-ember', '--tallow', '--rdr-timber'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }
  // A pointed arch's outline, its foot on the bottom edge.
  function pointed(x, w, h, top) {
    var mid = x + w / 2, spring = top + w * 0.7;
    return 'M' + x + ' ' + h + ' V' + spring + ' Q' + x + ' ' + (top + w * 0.15) + ' ' + mid + ' ' + top +
      ' Q' + (x + w) + ' ' + (top + w * 0.15) + ' ' + (x + w) + ' ' + spring + ' V' + h + ' Z';
  }
  // A candle standing still: wax, a flame, and the small halo round it.
  function candle(s, x, y, tall) {
    var t = tall || 42;
    s.appendChild(el('circle', { cx: x, cy: y - t - 14, r: 24, fill: 'var(--rdr-flame-2)', 'fill-opacity': '0.14' }));
    s.appendChild(el('rect', { x: x - 7, y: y - t, width: 14, height: t, fill: 'var(--rdr-ink)' }));
    s.appendChild(el('ellipse', { cx: x, cy: y - t - 12, rx: 6, ry: 12, fill: 'var(--rdr-flame-2)' }));
    s.appendChild(el('circle', { cx: x, cy: y - t - 8, r: 2.5, fill: 'var(--rdr-flame)' }));
  }
  // A brass sconce with its candle, standing still.
  function sconce(s, x, y) {
    s.appendChild(el('path', { d: 'M' + (x - 22) + ' ' + (y + 30) + ' q0 26 22 26 q22 0 22 -26', fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 5, 'stroke-linecap': 'round' }));
    s.appendChild(el('rect', { x: x - 4, y: y + 54, width: 8, height: 26, fill: 'var(--rdr-brass)' }));
    s.appendChild(el('rect', { x: x - 18, y: y + 40, width: 36, height: 10, rx: 3, fill: 'var(--rdr-brass)' }));
    candle(s, x, y + 42);
  }
  // A raven, as her page draws them: perched, looking along the way it faces.
  function raven(s, x, y, k, dir) {
    var d = dir || -1;
    s.appendChild(el('ellipse', { cx: x, cy: y - 11 * k, rx: 20 * k, ry: 12 * k, fill: 'var(--rdr-stone)' }));
    s.appendChild(el('path', { fill: 'var(--rdr-stone)', d: 'M' + (x - d * 15 * k) + ' ' + (y - 12 * k) + ' L' + (x - d * 40 * k) + ' ' + (y - 4 * k) + ' L' + (x - d * 18 * k) + ' ' + (y - 2 * k) + ' Z' }));
    s.appendChild(el('circle', { cx: x + d * 15 * k, cy: y - 22 * k, r: 9.5 * k, fill: 'var(--rdr-stone)' }));
    s.appendChild(el('path', { fill: 'var(--rdr-panel)', d: 'M' + (x + d * 22 * k) + ' ' + (y - 23 * k) + ' L' + (x + d * 37 * k) + ' ' + (y - 19 * k) + ' L' + (x + d * 22 * k) + ' ' + (y - 18 * k) + ' Z' }));
    s.appendChild(el('circle', { cx: x + d * 17 * k, cy: y - 24 * k, r: 2 * k, fill: 'var(--rdr-brass)' }));
    s.appendChild(el('path', { d: 'M' + (x - 5 * k) + ' ' + y + ' v' + (7 * k) + ' M' + (x + 5 * k) + ' ' + y + ' v' + (7 * k), stroke: 'var(--rdr-panel)', 'stroke-width': 2.5 * k }));
  }
  // The fire's light on a length of wall, warmest low down and towards the
  // hearth: a few soft pools, never under a word.
  function warmth(s, x, y, r, k) {
    [1, 0.66, 0.36].forEach(function (f) {
      s.appendChild(el('ellipse', { cx: x, cy: y, rx: r * f, ry: r * f * 0.8, fill: 'var(--rdr-flame)', 'fill-opacity': String(0.06 * (k || 1)) }));
    });
  }
  // The room's skirting and dado rail, in timber, along the foot of a wall.
  function rails(s, w, h) {
    s.appendChild(el('rect', { x: 0, y: h - 340, width: w, height: 12, fill: 'var(--rdr-timber)' }));
    s.appendChild(el('rect', { x: 0, y: h - 328, width: w, height: 4, fill: 'var(--rdr-panel)' }));
    s.appendChild(el('rect', { x: 0, y: h - 40, width: w, height: 40, fill: 'var(--rdr-timber)' }));
  }

  // A length of claret wall with a bookcase in a tall pointed timber arch, and
  // a sconce either side of it. An arch her own case stands in is left bare
  // (empty), its stone behind the case; the others are filled with spines.
  function caseWall(w, h, seed, o) {
    o = o || {};
    var s = svg(w, h), aw = Math.min(w * 0.62, 440), ax = (w - aw) / 2, top = h * 0.1, n = seed;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rdr-wall)' }));
    if (o.warm) warmth(s, w / 2, h - 60, w * 0.6, 1.2);
    rails(s, w, h);
    s.appendChild(el('path', { fill: 'var(--rdr-timber)', d: pointed(ax - 26, aw + 52, h, top - 26) }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-opacity': '0.35', 'stroke-width': 3, d: pointed(ax - 12, aw + 24, h, top - 12) }));
    s.appendChild(el('path', { fill: 'var(--rdr-stone)', d: pointed(ax, aw, h, top) }));
    if (!o.empty) {
      for (var y = top + aw * 0.7; y + 110 < h - 30; y += 120) {
        for (var x = ax + 8; x < ax + aw - 30; n++) {
          var bw = 16 + (n * 7) % 14, bh = 74 + (n * 11) % 28;
          s.appendChild(el('rect', { x: x, y: y + 110 - bh, width: bw - 3, height: bh, fill: 'var(' + SPINES[n % SPINES.length] + ')' }));
          x += bw;
        }
        s.appendChild(el('rect', { x: ax, y: y + 110, width: aw, height: 10, fill: 'var(--rdr-timber)' }));
      }
    } else {
      // The plinth her case stands on.
      s.appendChild(el('rect', { x: ax - 10, y: h - 44, width: aw + 20, height: 44, fill: 'var(--rdr-timber)' }));
    }
    if (o.raven) raven(s, w / 2, top - 22, 1.4, o.raven);
    sconce(s, ax - 90, h * 0.32);
    sconce(s, ax + aw + 90, h * 0.32);
    return s;
  }

  // The far wall: claret, and two pointed alcoves for her own cases either
  // side of where her page hangs, a sconce over each.
  function farWall(w, h, gap) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rdr-wall)' }));
    rails(s, w, h);
    [-1, 1].forEach(function (side) {
      var cx = m + side * (gap / 2 + (w - gap) / 4), aw = Math.min(300, (w - gap) / 2 - 40), top = h - 1880;
      s.appendChild(el('path', { fill: 'var(--rdr-timber)', d: pointed(cx - aw / 2 - 22, aw + 44, h, top - 22) }));
      s.appendChild(el('path', { fill: 'var(--rdr-stone)', d: pointed(cx - aw / 2, aw, h, top) }));
      s.appendChild(el('rect', { x: cx - aw / 2 - 10, y: h - 44, width: aw + 20, height: 44, fill: 'var(--rdr-timber)' }));
      raven(s, cx, top - 22, 1.4, -side);
      sconce(s, m + side * (gap / 2 - 60), h - 1300);
    });
    return s;
  }

  // A candelabra of three candles, standing on the floor.
  function candelabra(s, x, foot) {
    var top = foot - 300;
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 8, 'stroke-linecap': 'round',
      d: 'M' + x + ' ' + foot + ' V' + top + ' M' + x + ' ' + (top + 70) + ' q-56 -6 -64 -70 M' + x + ' ' + (top + 70) + ' q56 -6 64 -70' }));
    s.appendChild(el('ellipse', { cx: x, cy: foot - 6, rx: 40, ry: 10, fill: 'var(--rdr-brass)' }));
    s.appendChild(el('circle', { cx: x, cy: foot - 150, r: 9, fill: 'var(--rdr-brass)' }));
    [[-64, top], [0, top - 30], [64, top]].forEach(function (c) {
      s.appendChild(el('rect', { x: x + c[0] - 14, y: c[1], width: 28, height: 8, rx: 3, fill: 'var(--rdr-brass)' }));
      candle(s, x + c[0], c[1], 54);
    });
  }

  // The fireplace: a pointed stone surround laid in courses, the fire on its
  // logs between brass firedogs, the mantel with two candles and a raven
  // looking at the flames, and a candelabra standing either side of the hearth.
  function fireplace(w, h) {
    var s = svg(w, h), sx = w * 0.17, sw = w * 0.66, top = h * 0.22, ow = w * 0.4, ox = (w - ow) / 2, otop = h * 0.56;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rdr-wall)' }));
    warmth(s, w / 2, h - 80, w * 0.75, 2.2);
    rails(s, w, h);
    s.appendChild(el('path', { fill: 'var(--rdr-stone)', d: pointed(sx, sw, h, top) }));
    // The stone in courses, and the voussoirs round the opening.
    for (var y = top + sw * 0.7; y < h - 60; y += 64) {
      s.appendChild(el('rect', { x: sx + 4, y: y, width: sw - 8, height: 3, fill: 'var(--rdr-panel)' }));
      for (var x = sx + ((y / 64) % 2 ? 60 : 120); x < sx + sw - 20; x += 120) {
        s.appendChild(el('rect', { x: x, y: y, width: 3, height: 64, fill: 'var(--rdr-panel)' }));
      }
    }
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--rdr-panel)', 'stroke-width': 30, d: pointed(ox - 15, ow + 30, h, otop - 15) }));
    // The mantel, and what stands on it.
    var my = h * 0.48;
    s.appendChild(el('rect', { x: sx - 40, y: my, width: sw + 80, height: 30, fill: 'var(--rdr-timber)' }));
    s.appendChild(el('rect', { x: sx - 30, y: my + 30, width: sw + 60, height: 8, fill: 'var(--rdr-panel)' }));
    [sx + 10, sx + sw - 50].forEach(function (x) { s.appendChild(el('rect', { x: x, y: my + 38, width: 40, height: 40, fill: 'var(--rdr-timber)' })); });
    candle(s, sx + 40, my, 60);
    candle(s, sx + sw - 40, my, 60);
    raven(s, w / 2 + 20, my, 2.2, 1);
    // The opening, the fire's own light inside it, the logs and the fire.
    s.appendChild(el('path', { fill: 'var(--rdr-stone)', d: pointed(ox, ow, h - 40, otop) }));
    s.appendChild(el('ellipse', { cx: w / 2, cy: h - 140, rx: ow * 0.42, ry: 130, fill: 'var(--rdr-flame)', 'fill-opacity': '0.22' }));
    var fy = h - 80;
    s.appendChild(el('path', { fill: 'var(--rdr-ember)', d: 'M' + (ox + 40) + ' ' + fy + ' Q' + (w / 2) + ' ' + (fy - 230) + ' ' + (ox + ow - 40) + ' ' + fy + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--rdr-flame)', d: 'M' + (ox + 70) + ' ' + fy + ' Q' + (w / 2 - 40) + ' ' + (fy - 150) + ' ' + (w / 2 - 6) + ' ' + (fy - 210) +
      ' Q' + (w / 2 + 10) + ' ' + (fy - 120) + ' ' + (w / 2 + 40) + ' ' + (fy - 170) + ' Q' + (w / 2 + 60) + ' ' + (fy - 80) + ' ' + (ox + ow - 70) + ' ' + fy + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--rdr-flame-2)', d: 'M' + (w / 2 - 60) + ' ' + fy + ' Q' + (w / 2 - 20) + ' ' + (fy - 120) + ' ' + w / 2 + ' ' + (fy - 130) +
      ' Q' + (w / 2 + 16) + ' ' + (fy - 60) + ' ' + (w / 2 + 60) + ' ' + fy + ' Z' }));
    s.appendChild(el('path', { stroke: 'var(--rdr-timber)', 'stroke-width': 26, 'stroke-linecap': 'round', d: 'M' + (ox + 50) + ' ' + (fy - 6) + ' L' + (ox + ow - 60) + ' ' + (fy - 34) }));
    s.appendChild(el('path', { stroke: 'var(--rdr-leather)', 'stroke-width': 24, 'stroke-linecap': 'round', d: 'M' + (ox + 60) + ' ' + (fy - 30) + ' L' + (ox + ow - 50) + ' ' + (fy - 4) }));
    [ox + 34, ox + ow - 34].forEach(function (x) {
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 7, 'stroke-linecap': 'round', d: 'M' + x + ' ' + (h - 40) + ' V' + (fy - 60) }));
      s.appendChild(el('circle', { cx: x, cy: fy - 66, r: 10, fill: 'var(--rdr-brass)' }));
    });
    // The hearthstone, the fire's light lying on it.
    s.appendChild(el('rect', { x: sx - 30, y: h - 40, width: sw + 60, height: 40, fill: 'var(--rdr-panel)' }));
    s.appendChild(el('ellipse', { cx: w / 2, cy: h - 20, rx: sw * 0.4, ry: 16, fill: 'var(--rdr-flame)', 'fill-opacity': '0.3' }));
    candelabra(s, w * 0.07, h - 40);
    candelabra(s, w * 0.93, h - 40);
    return s;
  }

  // The chandelier: a brass ring of candles hung from the dark, as on her
  // page, seven candles, one at the heart of it.
  function chandelier(w, h) {
    var s = svg(w, h), m = w / 2, ring = h - 150;
    s.appendChild(el('path', { d: 'M' + m + ' 0 V' + (h - 330), stroke: 'var(--rdr-brass)', 'stroke-width': 6 }));
    s.appendChild(el('circle', { cx: m, cy: h - 318, r: 14, fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 6 }));
    s.appendChild(el('path', { d: 'M' + m + ' ' + (h - 304) + ' V' + (h - 250), stroke: 'var(--rdr-brass)', 'stroke-width': 7 }));
    var cups = [[-0.84, -40], [-0.56, -20], [-0.26, -6], [0.26, -6], [0.56, -20], [0.84, -40]];
    cups.forEach(function (c) {
      var x = m + c[0] * w * 0.46;
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 6, 'stroke-linecap': 'round',
        d: 'M' + m + ' ' + (h - 250) + ' Q' + (m + c[0] * w * 0.3) + ' ' + (h - 250) + ' ' + x + ' ' + (ring + c[1] - 10) }));
    });
    s.appendChild(el('ellipse', { cx: m, cy: ring + 10, rx: w * 0.42, ry: 40, fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 8 }));
    for (var i = 0; i < 9; i++) {
      var t = (i + 0.5) / 9 * Math.PI;
      s.appendChild(el('circle', { cx: m - Math.cos(t) * w * 0.42, cy: ring + 10 + Math.sin(t) * 40 + 24, r: 6, fill: 'var(--rdr-brass)' }));
    }
    cups.concat([[0, -60]]).forEach(function (c) {
      var x = m + c[0] * w * 0.46, y = ring + c[1] - 10;
      s.appendChild(el('rect', { x: x - 16, y: y, width: 32, height: 9, rx: 3, fill: 'var(--rdr-brass)' }));
      candle(s, x, y, 46);
    });
    return s;
  }

  // The sofa, velvet, facing the fire: its cushions, brass and flame, and the
  // book somebody left open on it.
  function sofa(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: w * 0.06, y: 0, width: w * 0.88, height: h * 0.56, rx: 40, fill: 'var(--rdr-velvet)' }));
    for (var i = 1; i < 4; i++) s.appendChild(el('path', { d: 'M' + (w * 0.06 + i * w * 0.22) + ' ' + (h * 0.08) + ' V' + (h * 0.5), stroke: 'var(--rdr-panel)', 'stroke-width': 3, 'stroke-opacity': '0.6' }));
    s.appendChild(el('rect', { x: w * 0.12, y: h * 0.26, width: w * 0.18, height: h * 0.26, rx: 16, fill: 'var(--rdr-brass)' }));
    s.appendChild(el('rect', { x: w * 0.7, y: h * 0.26, width: w * 0.18, height: h * 0.26, rx: 16, fill: 'var(--rdr-flame)' }));
    s.appendChild(el('rect', { x: w * 0.06, y: h * 0.5, width: w * 0.88, height: h * 0.3, rx: 18, fill: 'var(--rdr-velvet)' }));
    s.appendChild(el('path', { d: 'M' + (w * 0.08) + ' ' + (h * 0.62) + ' H' + (w * 0.92), stroke: 'var(--rdr-panel)', 'stroke-width': 3, 'stroke-opacity': '0.7' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.34, width: w * 0.12, height: h * 0.5, rx: 26, fill: 'var(--rdr-velvet)' }));
    s.appendChild(el('rect', { x: w * 0.88, y: h * 0.34, width: w * 0.12, height: h * 0.5, rx: 26, fill: 'var(--rdr-velvet)' }));
    var bx = w * 0.4, by = h * 0.5;
    s.appendChild(el('path', { fill: 'var(--rdr-ink)', d: 'M' + bx + ' ' + by + ' q40 -14 70 0 q30 -14 70 0 v12 q-40 -14 -70 0 q-30 -14 -70 0 Z' }));
    s.appendChild(el('path', { d: 'M' + (bx + 70) + ' ' + (by - 2) + ' v12', stroke: 'var(--rdr-ink-2)', 'stroke-width': 2 }));
    [0.1, 0.9].forEach(function (k) { s.appendChild(el('rect', { x: w * k - 12, y: h * 0.84, width: 24, height: h * 0.16, fill: 'var(--rdr-timber)' })); });
    return s;
  }

  // A leather armchair, as her page draws them.
  function armchair(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: w * 0.12, y: 0, width: w * 0.76, height: h * 0.6, rx: 34, fill: 'var(--rdr-leather)' }));
    for (var i = 1; i < 3; i++) s.appendChild(el('circle', { cx: w * (0.12 + i * 0.25), cy: h * 0.22, r: 5, fill: 'var(--rdr-timber)' }));
    s.appendChild(el('rect', { x: w * 0.06, y: h * 0.5, width: w * 0.88, height: h * 0.32, rx: 20, fill: 'var(--rdr-leather)' }));
    s.appendChild(el('path', { d: 'M' + (w * 0.18) + ' ' + (h * 0.62) + ' H' + (w * 0.82), stroke: 'var(--rdr-timber)', 'stroke-width': 3, 'stroke-opacity': '0.7' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.36, width: w * 0.18, height: h * 0.48, rx: 22, fill: 'var(--rdr-leather)' }));
    s.appendChild(el('rect', { x: w * 0.82, y: h * 0.36, width: w * 0.18, height: h * 0.48, rx: 22, fill: 'var(--rdr-leather)' }));
    [0.14, 0.86].forEach(function (k) { s.appendChild(el('rect', { x: w * k - 10, y: h * 0.84, width: 20, height: h * 0.16, fill: 'var(--rdr-timber)' })); });
    return s;
  }

  // The card catalogue's cabinet, its drawers pulled out above it: timber, a
  // drawer front for each card, a brass pull and a card in its brass holder.
  function catalogue(w, h) {
    var s = svg(w, h), cols = 6, rows = 3, pad = 22, dw = (w - pad * 2) / cols, dh = (h - 90) / rows;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h - 30, fill: 'var(--rdr-timber)' }));
    s.appendChild(el('rect', { x: -12, y: 0, width: w + 24, height: 18, fill: 'var(--rdr-timber)' }));
    s.appendChild(el('rect', { x: 0, y: 18, width: w, height: 4, fill: 'var(--rdr-brass)', 'fill-opacity': '0.5' }));
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var x = pad + c * dw, y = 36 + r * dh;
        s.appendChild(el('rect', { x: x + 4, y: y + 4, width: dw - 8, height: dh - 8, rx: 3, fill: 'var(--rdr-panel)' }));
        s.appendChild(el('rect', { x: x + dw / 2 - 22, y: y + 16, width: 44, height: 22, fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 3 }));
        s.appendChild(el('rect', { x: x + dw / 2 - 18, y: y + 20, width: 36, height: 14, fill: 'var(--rdr-ink-2)' }));
        s.appendChild(el('rect', { x: x + dw / 2 - 16, y: y + dh - 34, width: 32, height: 9, rx: 4, fill: 'var(--rdr-brass)' }));
      }
    }
    s.appendChild(el('rect', { x: 20, y: h - 30, width: 30, height: 30, fill: 'var(--rdr-timber)' }));
    s.appendChild(el('rect', { x: w - 50, y: h - 30, width: 30, height: 30, fill: 'var(--rdr-timber)' }));
    return s;
  }

  // The table the gramophone stands on: timber, two doors, brass handles.
  function table(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: -10, y: 0, width: w + 20, height: 20, fill: 'var(--rdr-timber)' }));
    s.appendChild(el('rect', { x: 10, y: 20, width: w - 20, height: h - 50, fill: 'var(--rdr-timber)' }));
    [0, 1].forEach(function (k) {
      var x = 28 + k * (w - 36) / 2;
      s.appendChild(el('rect', { x: x, y: 40, width: (w - 36) / 2 - 20, height: h - 100, rx: 4, fill: 'var(--rdr-panel)' }));
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-opacity': '0.4', 'stroke-width': 3, d: pointed(x + 20, (w - 36) / 2 - 60, h - 80, 64) }));
      s.appendChild(el('circle', { cx: k ? x + 14 : x + (w - 36) / 2 - 34, cy: h / 2, r: 7, fill: 'var(--rdr-brass)' }));
    });
    s.appendChild(el('rect', { x: 18, y: h - 30, width: 24, height: 30, fill: 'var(--rdr-timber)' }));
    s.appendChild(el('rect', { x: w - 42, y: h - 30, width: 24, height: 30, fill: 'var(--rdr-timber)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['faery-reading-room.html'] = {
    prefix: 'rdr-walk',
    from: 'faery-yurt.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var END = 3300 + F;                          // the far wall
      // A grown-up's eye, so her cases, lifted at the size her page sets them,
      // stand the height bookcases do round you.
      var eye = 440;
      var SIDE = 1100, WH = Math.max(1700, sh + 700);
      var FZ = 1500, GZ = 2750, RZ = 3500;         // the fire, the gramophone, the records
      var decor = [];
      var onto = function (it, sel) {
        return { focus: function (o) { var b = it.el.querySelector(sel); if (b) b.focus(o); } };
      };
      var near = function (it) { return kit.front(it, F * 1.6); };

      // Her page first, so her own things can be lifted off it.
      var page = kit.screen(kit.page, 'Helen’s Reading Room’s own page, on the far wall');

      // HER CASES, lifted off her page, one in each arch down the right-hand
      // wall and one either side of her page; the rest of the arches hold the
      // spines drawn in her inks.
      var RIGHT_CASES = [[3, 'Old Classics'], [5, 'Myth & Otherworlds'], [6, 'Liberation & Rest'], [7, 'Neurodivergence'], [10, 'Art']];
      var walls = [], cases = [];
      var CW = 700;
      for (var z = 300, i = 0; z < END - 200; z += CW, i++) {
        var c = RIGHT_CASES[i];
        walls.push(kit.item(caseWall(CW, WH, i * 9, { empty: !!c, raven: i % 2 ? -1 : 0, warm: Math.abs(z + CW / 2 - FZ) < 900 }),
          { x: SIDE, z: z + CW / 2, w: CW, h: WH, turn: kit.RIGHT }));
        if (c) cases.push({ z: z + CW / 2, n: c[0], label: c[1] });
      }
      // The left-hand wall, claret, the fireplace in it, the catalogue by the
      // door and the gramophone's corner past the fire.
      [[0, FZ - 550], [FZ + 550, END]].forEach(function (run) {
        var len = run[1] - run[0];
        walls.push(kit.item(caseWall(len, WH, 100 + run[0], { empty: true, warm: true }), { x: -SIDE, z: run[0] + len / 2, w: len, h: WH, turn: kit.LEFT }));
      });
      // The far wall, her page hung in the middle of it.
      walls.push(kit.item(farWall(SIDE * 2 + 40, WH + 500, sw), { x: 0, z: END + 30, w: SIDE * 2 + 40, h: WH + 500 }));
      decor = decor.concat(walls);

      // The card catalogue, by the door: a cabinet, and her drawers over it.
      var cab = kit.item(catalogue(760, 560), { x: -SIDE + 40, z: 400, w: 760, h: 560, turn: kit.LEFT });
      decor.push(cab);
      var cat = kit.lift(page, '.rdr-cat', { x: -SIDE + 30, y: 590, z: 400, w: 720, turn: kit.LEFT, cls: 'rdr-walk-cat' });

      var lifted = cases.map(function (c) {
        return kit.lift(page, '.yurt-case', { n: c.n, x: SIDE - 30, y: 44, z: c.z, w: 236, turn: kit.RIGHT, cls: 'rdr-walk-case' });
      });

      // THE HEARTH: the fireplace, the rug before it, the sofa facing it and
      // a leather armchair either side of the rug, turned to the fire.
      var hearth = kit.item(fireplace(1100, WH), { x: -SIDE, z: FZ, w: 1100, h: WH, turn: kit.LEFT });
      decor.push(hearth);
      var settee = kit.item(sofa(900, 460), { x: -720, z: FZ - 620, w: 900, h: 460, turn: -2.4 });
      decor.push(settee);
      var chairs = [[-760, FZ + 560, -0.55], [-440, FZ + 720, -0.74]].map(function (c) {
        var it = kit.item(armchair(460, 430), { x: c[0], z: c[1], w: 460, h: 430, turn: c[2] });
        decor.push(it);
        return it;
      });
      // The chandelier, hung over the hearthrug from the dark above.
      var chand = kit.item(chandelier(560, 760), { x: -480, y: 560, z: FZ + 120, w: 560, h: 760 });
      decor.push(chand);

      // THE GRAMOPHONE'S CORNER, past the fire: its table, the switch on it
      // (a player, once pressed, opens down over the table), her page's own
      // gramophone over that, and her shelf of records by it.
      var tbl = kit.item(table(640, 470), { x: -SIDE + 40, z: GZ, w: 640, h: 470, turn: kit.LEFT });
      decor.push(tbl);
      var record = kit.lift(page, '.rdr-record', { x: -SIDE + 30, y: 650, z: GZ, w: 620, turn: kit.LEFT, cls: 'rdr-walk-record' });
      var deck = kit.lift(page, '.rdr-deck', { x: -SIDE + 30, y: 490, z: GZ, w: 620, turn: kit.LEFT, cls: 'rdr-walk-deck' });
      var lps = kit.lift(page, '.rdr-rack', { x: -SIDE + 30, y: 120, z: RZ, w: 640, turn: kit.LEFT, cls: 'rdr-walk-lps' });
      kit.wire(page, 'rack.js');

      // Her own two cases on the far wall, either side of her page.
      var farCases = [[8, 'Helen’s Shelf', -1], [0, 'Poetry', 1]].map(function (c) {
        var it = kit.lift(page, '.yurt-case', { n: c[0], x: c[2] * (sw / 2 + (SIDE * 2 + 40 - sw) / 4), y: 44, z: END + 10, w: 236, cls: 'rdr-walk-case' });
        it.label = c[1];
        return it;
      });
      var leaf = kit.item(page, { x: 0, y: eye - sh / 2, z: END, w: sw, h: sh, cls: 'rdr-walk-wall' });

      var caseStop = function (it, label, spot) {
        var name = label === 'Helen’s Shelf' ? 'at Helen’s Shelf, what she has written and what has cited or carried it, every spine a door'
          : 'at her ' + label + ' case, in its tall pointed arch, every spine a door';
        return kit.stop({ name: name, spot: spot || near(it), link: onto(it, 'a[href]') }, it);
      };
      var stops = [
        kit.stop({ name: 'through the bookcase door, at the end of her library', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'behind the sofa, looking past it into the fire', spot: { x: -60, z: 0, yaw: -0.74 } }, settee),
        kit.stop({ name: 'at the card catalogue, a drawer for each case and a card for each author', spot: near(cat), link: onto(cat, 'summary') }, cat),
        kit.stop({ name: 'where the chandelier hangs over the hearthrug, its seven candles standing still', spot: { x: 200, z: FZ - 1100, yaw: -0.51 } }, chand),
        caseStop(lifted[0], cases[0].label),
        caseStop(lifted[1], cases[1].label),
        kit.stop({ name: 'on the hearthrug, the fire warm on your face', spot: { x: -60, z: FZ, yaw: -Math.PI / 2 } }, hearth),
        caseStop(lifted[2], cases[2].label),
        kit.stop({ name: 'at the gramophone, with its switch', spot: { x: -SIDE + 30 + 1400, z: GZ, yaw: -Math.PI / 2 }, link: onto(deck, 'button') }, deck),
        kit.stop({ name: 'behind the two leather armchairs turned to the fire', spot: { x: -84, z: FZ + 1660, yaw: -2.59 } }, chairs[0]),
        caseStop(lifted[3], cases[3].label),
        kit.stop({ name: 'at the shelf of records by the gramophone', spot: near(lps), link: onto(lps, 'button, a[href]') }, lps)
      ];
      if (lifted[4]) stops.push(caseStop(lifted[4], cases[4].label));
      stops.push(caseStop(farCases[0], farCases[0].label, { x: -560, z: END - 1300 }));
      stops.push(kit.stop({ name: 'at the far wall, with her own page in a timber frame', spot: { x: 0, z: END - F }, link: page }, leaf));
      stops.push(caseStop(farCases[1], farCases[1].label, { x: 560, z: END - 1300 }));

      return {
        cls: 'rdr-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor.concat([record]),
        arrive: 'Her own page hangs on the far wall, past the fire, the gramophone and her bookcases.',
        bounds: function () { return { x: [-SIDE + 260, SIDE - 260], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--rdr-wall'));
          // Timber boards, laid long, their ends staggered.
          var seam = kit.ink('--rdr-stone'), lo = Math.max(from, 0), hi = Math.min(to, END + 40);
          kit.quad(g, -SIDE, SIDE, lo, hi, kit.ink('--rdr-timber'));
          for (var x = -SIDE; x <= SIDE; x += 110) kit.quad(g, x - 2, x + 2, lo, hi, seam, 0.7);
          for (var bx = -SIDE, k = 0; bx < SIDE; bx += 110, k++) {
            for (var bz = (k % 3) * 300; bz < END; bz += 900) if (bz > lo && bz < hi) kit.quad(g, bx, bx + 110, bz, bz + 4, seam, 0.5);
          }
          // The fire's light across the floor from the hearth, warmest here
          // and nowhere else, and the hearthrug with its brass ring.
          kit.oval(g, -SIDE, FZ, 1300, 1100, kit.ink('--rdr-flame'), 0.1);
          kit.oval(g, -SIDE, FZ, 800, 700, kit.ink('--rdr-flame'), 0.12);
          kit.oval(g, -SIDE + 480, FZ, 420, 660, kit.ink('--rdr-brass'), 0.8);
          kit.oval(g, -SIDE + 480, FZ, 400, 636, kit.ink('--rdr-velvet'));
          kit.oval(g, -SIDE + 480, FZ, 330, 540, kit.ink('--rdr-brass'), 0.5);
          kit.oval(g, -SIDE + 480, FZ, 322, 528, kit.ink('--rdr-velvet'));
          // A rug under the gramophone's corner, and one by the catalogue.
          kit.quad(g, -SIDE + 40, -SIDE + 480, GZ - 380, RZ + 380, kit.ink('--rdr-panel'), 0.9);
          kit.quad(g, -SIDE + 60, -SIDE + 460, GZ - 360, RZ + 360, kit.ink('--rdr-velvet'), 0.5);
        }
      };
    }
  };
})();
