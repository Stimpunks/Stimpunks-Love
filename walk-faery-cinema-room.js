/* =============================================================================
   The Cinema, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1 of
   the rooms left on Paper Street, and round 2 the same day.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§121), and this is OURS: a drawing
   of her picture palace in card for Paper Street, in the colours her room
   wears (the Reading Room's, §114, at her ask) and nothing else, which changes
   nothing on her page and is hers to keep or send back. The house lights are
   down. The light comes over your head from the projection box at the back,
   one still band of it above the seats onto the silver screen in its gilt
   arch, with the velvet curtains drawn back; and on the screen is her room's
   own page. That beam is what keeps it off her other rooms (a fire from the
   floor, candles at a window) and off the Lightbulb Picture House, where the
   house lights stay up and there is no beam. Rows of velvet seats either side
   of an aisle, and along both walls her reels on their rails, in rows and
   never in a bookcase, as she asked.

   ROUND 2 PUT HER OWN THINGS IN IT, off her page: every shelf of reels is
   lifted onto a rail along the walls, and her screen into the gilt arch, and
   rack.js, her page's own script, puts a reel up on that screen here as it
   does there (nothing reaches YouTube until a press); her page itself hangs
   in a gilt frame by the door you came in by. And more of what her drawing
   has: the projection box over that door with its two reels and its window,
   the beam drawn the length of the house, the film strip along the top of the
   walls and across the door, a candle in a brass sconce between the rails,
   the fringed pelmet, the tasselled tie-backs and the stage's step.

   NOTHING MOVES: the projector does not flicker, its reels do not turn and the
   candles stand still. Every colour is one her room declares, by name. It
   keeps nothing, sends nothing and fetches nothing; her page arrives through
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

  // Her film strip, as it runs across the top of her page: sprocket holes
  // along both edges and the frames between them, edged in brass.
  function strip(s, x, y, w, h) {
    s.appendChild(el('rect', { x: x, y: y, width: w, height: h, fill: 'var(--rdr-stone)' }));
    var hole = h * 0.16, step = hole * 3;
    for (var hx = x + hole; hx < x + w - hole; hx += step) {
      [y + h * 0.08, y + h - h * 0.08 - hole * 0.75].forEach(function (hy) {
        s.appendChild(el('rect', { x: hx, y: hy, width: hole, height: hole * 0.75, rx: hole * 0.15, fill: 'var(--rdr-ink-2)', 'fill-opacity': '0.55' }));
      });
    }
    var fh = h * 0.56, fw = fh * 3.6;
    for (var fx = x + h * 0.12; fx + fw < x + w; fx += fw + h * 0.16) {
      s.appendChild(el('rect', { x: fx, y: y + (h - fh) / 2, width: fw, height: fh, fill: 'var(--rdr-panel)', stroke: 'var(--rdr-brass)', 'stroke-width': Math.max(1, h * 0.03), 'stroke-opacity': '0.35' }));
    }
  }

  // A candle in a brass sconce, standing still, its glow soft on the wall
  // round it and going nowhere.
  function candleIn(s, cx, cy, k) {
    s.appendChild(el('circle', { cx: cx, cy: cy - 40 * k, r: 120 * k, fill: 'var(--rdr-flame-2)', 'fill-opacity': '0.05' }));
    s.appendChild(el('circle', { cx: cx, cy: cy - 40 * k, r: 60 * k, fill: 'var(--rdr-flame-2)', 'fill-opacity': '0.08' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 7 * k, 'stroke-linecap': 'round',
      d: 'M' + (cx - 34 * k) + ' ' + (cy - 30 * k) + ' q0 ' + 40 * k + ' ' + 34 * k + ' ' + 40 * k + ' h' + 4 * k }));
    s.appendChild(el('rect', { x: cx - 44 * k, y: cy - 46 * k, width: 16 * k, height: 32 * k, rx: 4 * k, fill: 'var(--rdr-brass)' }));
    s.appendChild(el('ellipse', { cx: cx, cy: cy + 10 * k, rx: 26 * k, ry: 7 * k, fill: 'var(--rdr-brass)' }));
    s.appendChild(el('rect', { x: cx - 9 * k, y: cy - 58 * k, width: 18 * k, height: 64 * k, fill: 'var(--rdr-ink)' }));
    s.appendChild(el('path', { fill: 'var(--rdr-flame-2)',
      d: 'M' + cx + ' ' + (cy - 92 * k) + ' q' + 10 * k + ' ' + 15 * k + ' 0 ' + 29 * k + ' q' + (-10 * k) + ' ' + (-14 * k) + ' 0 ' + (-29 * k) + ' Z' }));
    s.appendChild(el('circle', { cx: cx, cy: cy - 74 * k, r: 3.5 * k, fill: 'var(--rdr-flame)' }));
  }

  // The proscenium: a gilt arch round the screen, with a finer line inside it,
  // the velvet curtains drawn back to either side under a fringed pelmet and
  // held with tasselled brass tie-backs, the stage and its step, and her film
  // strip across the wall above it all, on the dark of the end wall.
  function proscenium(w, h, sw, sh, sy) {
    var s = svg(w, h), sx = (w - sw) / 2, top = h - sy - sh - 140, mid = w / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rdr-wall)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: Math.max(0, top - 240), fill: 'var(--rdr-stone)' }));
    strip(s, 0, Math.max(10, top - 230), w, 60);
    // The arch, and a finer one inside it.
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 28,
      d: 'M' + (sx - 120) + ' ' + h + ' V' + (top + 160) + ' Q' + mid + ' ' + (top - 120) + ' ' + (sx + sw + 120) + ' ' + (top + 160) + ' V' + h }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 6, 'stroke-opacity': '0.6',
      d: 'M' + (sx - 80) + ' ' + h + ' V' + (top + 170) + ' Q' + mid + ' ' + (top - 70) + ' ' + (sx + sw + 80) + ' ' + (top + 170) + ' V' + h }));
    [-1, 1].forEach(function (side) {
      var edge = side < 0 ? sx - 100 : sx + sw + 100, out = side < 0 ? sx - 320 : sx + sw + 320;
      var tie = h * 0.6;
      // Gathered in at the tie-back, falling full below it.
      s.appendChild(el('path', { fill: 'var(--rdr-velvet)',
        d: 'M' + edge + ' ' + (top + 140) + ' Q' + (edge + side * 70) + ' ' + (tie - 30) + ' ' + (edge + side * 150) + ' ' + tie +
           ' Q' + (edge + side * 60) + ' ' + (tie + 120) + ' ' + (edge + side * 90) + ' ' + h +
           ' H' + out + ' V' + (top + 140) + ' Z' }));
      for (var k = 1; k < 5; k++) {
        var fx = edge + side * (k * 44 + 20);
        s.appendChild(el('path', { fill: 'none', stroke: 'var(--rdr-wall)', 'stroke-width': 5, 'stroke-opacity': '0.55',
          d: 'M' + fx + ' ' + (top + 160) + ' Q' + (fx + side * 30) + ' ' + (tie - 20) + ' ' + (fx + side * 60) + ' ' + tie +
             ' Q' + (fx + side * 20) + ' ' + (tie + 140) + ' ' + (fx + side * 40) + ' ' + h }));
      }
      var tx = edge + side * 150;
      s.appendChild(el('rect', { x: Math.min(tx, out), y: tie - 10, width: Math.abs(out - tx), height: 20, rx: 10, fill: 'var(--rdr-brass)' }));
      s.appendChild(el('circle', { cx: tx, cy: tie, r: 16, fill: 'var(--rdr-brass)' }));
      s.appendChild(el('path', { fill: 'var(--rdr-brass)', d: 'M' + (tx - 12) + ' ' + (tie + 70) + ' L' + tx + ' ' + (tie + 12) + ' L' + (tx + 12) + ' ' + (tie + 70) + ' Z' }));
      s.appendChild(el('line', { x1: tx - 12, y1: tie + 70, x2: tx + 12, y2: tie + 70, stroke: 'var(--rdr-brass)', 'stroke-width': 4, 'stroke-dasharray': '2 3' }));
    });
    // The pelmet, velvet, swagged across the top of the arch, with its fringe.
    var pl = sx - 330, pr = sx + sw + 330, pt = top + 110;
    s.appendChild(el('path', { fill: 'var(--rdr-velvet)',
      d: 'M' + pl + ' ' + pt + ' Q' + mid + ' ' + (pt - 40) + ' ' + pr + ' ' + pt + ' V' + (pt + 70) +
         ' Q' + (mid + (pr - mid) / 2) + ' ' + (pt + 120) + ' ' + mid + ' ' + (pt + 95) +
         ' Q' + (mid - (mid - pl) / 2) + ' ' + (pt + 120) + ' ' + pl + ' ' + (pt + 70) + ' Z' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 10, 'stroke-dasharray': '4 7',
      d: 'M' + pl + ' ' + (pt + 74) + ' Q' + (mid + (pr - mid) / 2) + ' ' + (pt + 126) + ' ' + mid + ' ' + (pt + 101) +
         ' M' + pr + ' ' + (pt + 74) + ' Q' + (mid - (mid - pl) / 2) + ' ' + (pt + 126) + ' ' + mid + ' ' + (pt + 101) }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--rdr-wall)', 'stroke-width': 4, 'stroke-opacity': '0.5',
      d: 'M' + (pl + 120) + ' ' + (pt + 6) + ' Q' + (pl + 200) + ' ' + (pt + 60) + ' ' + (pl + 180) + ' ' + (pt + 88) +
         ' M' + (pr - 120) + ' ' + (pt + 6) + ' Q' + (pr - 200) + ' ' + (pt + 60) + ' ' + (pr - 180) + ' ' + (pt + 88) }));
    // The stage, its brass nosing, and the step down in front of it.
    s.appendChild(el('rect', { x: sx - 140, y: h - sy + 6, width: sw + 280, height: sy - 6, fill: 'var(--rdr-timber)' }));
    s.appendChild(el('rect', { x: sx - 140, y: h - sy + 6, width: sw + 280, height: 6, fill: 'var(--rdr-brass)', 'fill-opacity': '0.8' }));
    s.appendChild(el('rect', { x: sx - 60, y: h - sy * 0.45, width: sw + 120, height: sy * 0.45, fill: 'var(--rdr-timber)' }));
    s.appendChild(el('rect', { x: sx - 60, y: h - sy * 0.45, width: sw + 120, height: 4, fill: 'var(--rdr-brass)', 'fill-opacity': '0.6' }));
    return s;
  }

  // A side wall of the house: the dark above, her film strip running along
  // the top, the wall, and a timber dado with a brass rail along it, the rail
  // the reels hang over.
  function plain(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rdr-stone)' }));
    s.appendChild(el('rect', { x: 0, y: h - 1040, width: w, height: 1040, fill: 'var(--rdr-wall)' }));
    strip(s, 0, h - 1060, w, 54);
    s.appendChild(el('rect', { x: 0, y: h - 110, width: w, height: 110, fill: 'var(--rdr-timber)' }));
    s.appendChild(el('rect', { x: 0, y: h - 118, width: w, height: 12, fill: 'var(--rdr-brass)', 'fill-opacity': '0.85' }));
    for (var x = 60; x < w; x += 240) s.appendChild(el('rect', { x: x, y: h - 92, width: 180, height: 74, fill: 'none', stroke: 'var(--rdr-stone)', 'stroke-width': 3, 'stroke-opacity': '0.6' }));
    return s;
  }

  // A sconce on the wall between two rails.
  function sconce(w, h) {
    var s = svg(w, h);
    candleIn(s, w / 2, h - 40, 1.4);
    return s;
  }

  // The back wall, seen when you turn round: the old-style cinema door you
  // came in by, with her film strip across it, and over it the projection box,
  // its window lit, the projector in it with its two reels standing still.
  function backWall(w, h, boxY) {
    var s = svg(w, h), mid = w / 2, dw = 300, dh = 460, dy = h - dh;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rdr-stone)' }));
    s.appendChild(el('rect', { x: 0, y: h - 1040, width: w, height: 1040, fill: 'var(--rdr-wall)' }));
    strip(s, 0, h - 1060, w, 54);
    s.appendChild(el('rect', { x: 0, y: h - 110, width: w, height: 110, fill: 'var(--rdr-timber)' }));
    s.appendChild(el('rect', { x: 0, y: h - 118, width: w, height: 12, fill: 'var(--rdr-brass)', 'fill-opacity': '0.85' }));
    // The door: two leaves of timber in a brass frame, the strip across both.
    s.appendChild(el('rect', { x: mid - dw / 2 - 18, y: dy - 18, width: dw + 36, height: dh + 18, fill: 'var(--rdr-brass)' }));
    s.appendChild(el('rect', { x: mid - dw / 2, y: dy, width: dw, height: dh, fill: 'var(--rdr-timber)' }));
    s.appendChild(el('line', { x1: mid, y1: dy, x2: mid, y2: h, stroke: 'var(--rdr-stone)', 'stroke-width': 4 }));
    [-1, 1].forEach(function (side) {
      var lx = mid + side * dw / 4;
      s.appendChild(el('circle', { cx: lx, cy: dy + 90, r: 34, fill: 'var(--rdr-panel)', stroke: 'var(--rdr-brass)', 'stroke-width': 6 }));
      s.appendChild(el('rect', { x: mid + side * 18 - (side < 0 ? 14 : 0), y: dy + dh * 0.55, width: 14, height: 70, rx: 4, fill: 'var(--rdr-brass)' }));
    });
    strip(s, mid - dw / 2, dy + dh * 0.32, dw, 44);
    // The projection box, high over the door, and its lit window.
    var bw = 360, bh = 220, by = h - boxY - bh / 2;
    s.appendChild(el('circle', { cx: mid, cy: by + bh / 2, r: 260, fill: 'var(--rdr-flame-2)', 'fill-opacity': '0.05' }));
    s.appendChild(el('rect', { x: mid - bw / 2, y: by, width: bw, height: bh, rx: 6, fill: 'var(--rdr-stone)', stroke: 'var(--rdr-timber)', 'stroke-width': 10 }));
    s.appendChild(el('rect', { x: mid - bw / 2 + 36, y: by + 36, width: bw - 72, height: bh - 72, rx: 4, fill: 'var(--rdr-panel)' }));
    s.appendChild(el('rect', { x: mid - 80, y: by + bh - 92, width: 160, height: 46, rx: 6, fill: 'var(--rdr-timber)' }));
    s.appendChild(el('circle', { cx: mid, cy: by + bh - 69, r: 16, fill: 'var(--rdr-flame-2)', 'fill-opacity': '0.9' }));
    [-58, 58].forEach(function (dx) {
      var cx = mid + dx, cy = by + bh - 130;
      s.appendChild(el('circle', { cx: cx, cy: cy, r: 40, fill: 'var(--rdr-ink-2)' }));
      s.appendChild(el('circle', { cx: cx, cy: cy, r: 9, fill: 'var(--rdr-stone)' }));
      s.appendChild(el('path', { stroke: 'var(--rdr-stone)', 'stroke-width': 7, fill: 'none',
        d: 'M' + cx + ' ' + (cy - 32) + ' V' + (cy - 16) + ' M' + cx + ' ' + (cy + 16) + ' V' + (cy + 32) + ' M' + (cx - 32) + ' ' + cy + ' H' + (cx - 16) + ' M' + (cx + 16) + ' ' + cy + ' H' + (cx + 32) }));
    });
    return s;
  }

  // A row of velvet seats, seen from behind: brass along the tops of their
  // backs as in her drawing, the number plates, and timber arms between.
  function seats(w, h) {
    var s = svg(w, h), n = Math.floor(w / 110);
    for (var i = 0; i < n; i++) {
      var x = i * (w / n) + 6, sw = w / n - 12;
      s.appendChild(el('rect', { x: x, y: 0, width: sw, height: h * 0.8, rx: 26, fill: 'var(--rdr-velvet)' }));
      s.appendChild(el('rect', { x: x + 6, y: h * 0.42, width: sw - 12, height: h * 0.38, rx: 18, fill: 'var(--rdr-wall)', 'fill-opacity': '0.3' }));
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 4, 'stroke-opacity': '0.6',
        d: 'M' + (x + 14) + ' ' + 8 + ' H' + (x + sw - 14) }));
      s.appendChild(el('rect', { x: x + sw / 2 - 12, y: h * 0.18, width: 24, height: 12, rx: 3, fill: 'var(--rdr-brass)' }));
      if (i) s.appendChild(el('rect', { x: x - 10, y: h * 0.5, width: 8, height: h * 0.3, rx: 3, fill: 'var(--rdr-timber)' }));
    }
    s.appendChild(el('rect', { x: 0, y: h * 0.8, width: w, height: h * 0.2, fill: 'var(--rdr-timber)' }));
    return s;
  }

  // One slice of the projector's beam where it crosses the house: still, faint,
  // in her beam's colour. Slice after slice down the hall, wider and lower as
  // they near the screen, they are the beam.
  function beamSlice(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, rx: Math.min(w, h) * 0.2, fill: 'var(--rdr-flame-2)', 'fill-opacity': '0.028' }));
    s.appendChild(el('rect', { x: w * 0.18, y: h * 0.18, width: w * 0.64, height: h * 0.64, rx: Math.min(w, h) * 0.15, fill: 'var(--rdr-flame-2)', 'fill-opacity': '0.022' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['faery-cinema-room.html'] = {
    prefix: 'cin-walk',
    from: 'faery-yurt.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = Math.round((sw - 34) * 9 / 16 + 34), vh = kit.H - 24;
      var END = 5400 + F;                          // the screen
      var eye = vh / 2 + 60;
      var SY = 120;                                // the screen stands on a low stage
      var SIDE = 1500, WH = Math.max(1300, vh + 760);
      var BACK = -260, BOXY = 640;            // the back wall, and the box's window on it
      var RW = 700, RY = 140;                      // a rail of reels: its width, and how high it hangs
      var RAILS = [900, 1820, 2740, 3660, 4580];   // where along each wall
      var decor = [];
      var onto = function (it, sel) {
        return { focus: function (o) { var b = it.el.querySelector(sel); if (b) b.focus(o); } };
      };

      decor.push(kit.item(proscenium(SIDE * 2 + 40, WH, sw, sh, SY), { x: 0, z: END + 20, w: SIDE * 2 + 40, h: WH }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(plain(END - BACK + 60, WH), { x: side * SIDE, z: (END + BACK) / 2, w: END - BACK + 60, h: WH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT, near: 0.3 }));
      });
      decor.push(kit.item(backWall(SIDE * 2 + 40, WH, BOXY), { x: 0, z: BACK, w: SIDE * 2 + 40, h: WH, turn: Math.PI }));
      // A candle in its sconce between every two rails, on both walls.
      [-1, 1].forEach(function (side) {
        for (var k = 0; k <= RAILS.length; k++) {
          var cz = k ? RAILS[k - 1] + RW / 2 + 110 : RAILS[0] - RW / 2 - 110;
          decor.push(kit.item(sconce(220, 260), { x: side * (SIDE - 4), z: cz, w: 220, h: 260, y: RY + 470, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
        }
      });
      // Rows of seats either side of the aisle, from past the first rails to
      // the front.
      for (var z = 1500; z < END - F * 1.1; z += 420) {
        [-1, 1].forEach(function (side) {
          decor.push(kit.item(seats(720, 200), { x: side * 520, z: z, w: 720, h: 200 }));
        });
      }
      // The beam, slice by slice, from the box's window down the house.
      for (var bz = 1150; bz < END - F * 1.8; bz += 480) {
        var t = (bz - BACK) / (END - BACK), bw = 160 + (sw * 0.96 - 160) * t, bh = bw * 0.58;
        var cy = BOXY + (SY + sh / 2 - BOXY) * t;
        decor.push(kit.item(beamSlice(bw, bh), { x: 0, z: bz, w: bw, h: bh, y: cy - bh / 2 }));
      }

      // Her page, made first because everything else is lifted off it, and
      // hung last, in a gilt frame by the door you came in by: the keyboard
      // meets her rails in the order you walk past them, then the screen, and
      // her whole page after them, as it does in the room on Cel Street.
      var page = kit.screen(kit.page, 'Helen’s Cinema’s own page, in a frame by the door');
      // Her reels draw themselves out of a symbol on her page, so it comes too.
      kit.lift(page, '.cin-defs', { x: 0, z: BACK + 20, y: 0, w: 10 });
      var rails = [];
      RAILS.forEach(function (rz, k) {
        [-1, 1].forEach(function (side) {
          rails.push(kit.lift(page, '.cin-shelf', { n: k * 2 + (side < 0 ? 0 : 1), x: side * (SIDE - 8), z: rz, y: RY, w: RW,
            cls: 'cin-walk-rail', turn: side < 0 ? kit.LEFT : kit.RIGHT }));
        });
      });
      var glass = kit.lift(page, '.cin-screen', { x: 0, z: END, y: SY, w: sw, cls: 'cin-walk-silver' });
      var now = kit.lift(page, '.cin-screen__now', { x: 0, z: END - 60, y: 48, w: Math.min(sw, 760), cls: 'cin-walk-line' });
      // The way to take it off, beside the stage; placed with the rest.
      decor.push(kit.lift(page, '.cin-screen__back', { x: sw / 2 + 210, z: END - 70, y: 6, w: 340, cls: 'cin-walk-line' }));
      var frame = kit.item(page, { x: 560, z: BACK + 30, y: 130, w: 640, h: 440, turn: Math.PI, cls: 'cin-walk-screen' });
      kit.wire(page, 'rack.js');

      var shelfName = function (it, side) {
        return function () {
          var t = it.el.querySelector('.cin-shelf__name');
          return 'at the ' + side + '-hand wall, the rail of reels' + (t ? ': ' + t.textContent.replace(/\s+/g, ' ').trim() : '');
        };
      };
      var stops = [
        kit.stop({ name: 'at the back of the house, under the projector’s beam', spot: { x: 0, z: 0 } })
      ];
      rails.forEach(function (it, k) {
        stops.push(kit.stop({ name: shelfName(it, k % 2 ? 'right' : 'left'), spot: kit.front(it, 820), link: onto(it, 'button:not([hidden])') }, it));
        if (k === 3) stops.push(kit.stop({ name: 'in the aisle between the rows of velvet seats, under the beam', spot: { x: 0, z: 2600 } }));
      });
      stops.push(kit.stop({ name: 'in the front row, under the silver screen in its gilt arch', spot: { x: 0, z: END - F * 1.6 }, link: onto(glass, '[data-rack-screen]') }, glass));
      // A reel put up on the screen sends the keyboard to the line saying what
      // is showing, on the stage under it, so that line stands you there too.
      stops.push(kit.stop({ name: 'in the front row, where it says what is up on the screen', spot: { x: 0, z: END - F * 1.6 } }, now));
      // Turned round, far enough back to see the door, the box over it and
      // her page beside it all at once.
      stops.push(kit.stop({ name: 'turned round to the door you came in by, under the projection box, with her room’s own page in a frame beside it',
        spot: { x: 280, z: 1250, yaw: -Math.PI }, link: page }, frame));

      return {
        cls: 'cin-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Her reels are on their rails along both walls, and any of them goes up on the silver screen at the far end; her own page hangs in a frame by the door behind you.',
        bounds: function () {
          return { x: [-(SIDE - 300), SIDE - 300], z: [0, END - F] };
        },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--rdr-stone'));
          // The carpet: velvet with a brass edge down the middle aisle and both
          // side aisles, across the back, and in front of the stage; the dark
          // under the seats between.
          kit.quad(g, -SIDE, SIDE, Math.max(from, BACK), 1200, kit.ink('--rdr-wall'));
          kit.quad(g, -SIDE, SIDE, END - F * 1.05, END, kit.ink('--rdr-wall'));
          [0, -1190, 1190].forEach(function (cx) {
            var hw = cx ? 280 : 150;
            kit.quad(g, cx - hw, cx + hw, BACK, END, kit.ink('--rdr-brass'), 0.55);
            kit.quad(g, cx - hw + 14, cx + hw - 14, BACK, END, kit.ink('--rdr-velvet'));
          });
          // Step lights low along the aisles, so the floor can be found.
          for (var sz = 1500; sz < END - F; sz += 840) {
            [-1, 1].forEach(function (s) { kit.oval(g, s * 900, sz, 26, 18, kit.ink('--rdr-flame-2'), 0.8); kit.oval(g, s * 900, sz, 90, 60, kit.ink('--rdr-flame-2'), 0.1); });
          }
        }
      };
    }
  };
})();
