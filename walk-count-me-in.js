/* =============================================================================
   Count Me In, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1 of
   the rooms that could not yet be walked into.

   IT IS COUNT ME IN'S WORLD AND NOBODY ELSE'S (§86): through a fire door, the
   stairwell of a public building, going up and never stopping. The first
   flight rises away from you in card, riser after riser, concrete treads with
   white paint on every nosing, to a landing with its lamp; eau de nil walls
   over a dark gloss dado with a painted line between; and on the far wall the
   flights go on up and up, A LAMP ON EVERY LANDING, so it never gets darker
   however far up you look. That keeps it off the Rabbit Hole (a shaft going
   down, darker the further in) and off Arlesglad Caverns (a way down into
   rock, lit only by a handrail).

   THE CHAIRLIFT IS PART OF THE STAIR. Its rail runs up the wall of the flight
   in the stair's own dark green, and its chair is parked at the foot, drawn as
   fully as the stair is, its seat in the nosing's white, its call button the
   same size as anything else on the wall. The room's own page hangs on the
   left-hand wall by the foot of the stair, where the climbing is done, by
   number or by the lift, to read and press as itself. No landing carries a
   number: the step the
   stair is on is the page's to say, and nobody is counted here.

   NOTHING MOVES: the chair does not ride by itself. Every colour is one §86
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Paper Street's screen(). tools/make-paper-street.py
   holds each of those.
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

  // A wall of the stairwell: eau de nil over the dark gloss dado, with the
  // painted line between.
  function paint(s, w, h, dado) {
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cmi-wall)' }));
    s.appendChild(el('rect', { x: 0, y: h - dado, width: w, height: dado, fill: 'var(--cmi-dado)' }));
    s.appendChild(el('rect', { x: 0, y: h - dado - 8, width: w, height: 8, fill: 'var(--cmi-line)' }));
  }

  // One riser of the flight, its tread's nosing painted white along its top.
  function riser(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cmi-tread)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 8, fill: 'var(--cmi-nosing)' }));
    return s;
  }

  // The far wall: the flights going on up, zigzagging, a lamp on every landing
  // and the lift's rail running up beside every flight.
  function flights(w, h, n) {
    var s = svg(w, h), fh = h / n;
    paint(s, w, h, 0);
    for (var i = 0; i < n; i++) {
      var y0 = h - i * fh, y1 = y0 - fh, l = w * 0.18, r = w * 0.82;
      var from = i % 2 ? r : l, to = i % 2 ? l : r;
      s.appendChild(el('path', { fill: 'var(--cmi-dado)', d: 'M' + from + ' ' + y0 + ' L' + to + ' ' + (y1 + 30) + ' V' + (y1 + 70) + ' L' + from + ' ' + (y0 + 40) + ' Z' }));
      for (var k = 0; k <= 10; k++) {
        var x = from + (to - from) * k / 10, y = y0 + (y1 + 30 - y0) * k / 10;
        s.appendChild(el('rect', { x: Math.min(x, x + (to - from) / 10), y: y - 4, width: Math.abs(to - from) / 10, height: 5, fill: 'var(--cmi-nosing)' }));
      }
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--cmi-dado)', 'stroke-width': 6, d: 'M' + from + ' ' + (y0 - 60) + ' L' + to + ' ' + (y1 - 30) }));
      s.appendChild(el('rect', { x: to - 40 * (to > from ? 0 : 1) - (to > from ? 0 : 0), y: y1 + 26, width: 40, height: 8, fill: 'var(--cmi-nosing)' }));
      s.appendChild(el('circle', { cx: to + (to > from ? 30 : -30), cy: y1 - 20, r: 26, fill: 'var(--cmi-lamp)' }));
      s.appendChild(el('circle', { cx: to + (to > from ? 30 : -30), cy: y1 - 20, r: 26, fill: 'none', stroke: 'var(--cmi-dado)', 'stroke-width': 4 }));
    }
    return s;
  }

  // The side wall along the first flight, with the lift's rail rising up it
  // and the chair parked at its foot, and its call button by the bottom step.
  // A wall on the right is seen from inside the stairwell, so its drawing runs
  // from the far end at its left edge to the door at its right: the foot is
  // measured from the right edge, and the rail climbs to the left.
  function liftWall(w, h, rise, run, foot) {
    var s = svg(w, h), f = w - foot;
    paint(s, w, h, 220);
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--cmi-dado)', 'stroke-width': 16,
      d: 'M' + (f + 140) + ' ' + (h - 300) + ' H' + f + ' L' + (f - run) + ' ' + (h - 300 - rise) + ' H' + 40 }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--cmi-nosing)', 'stroke-width': 4,
      d: 'M' + f + ' ' + (h - 308) + ' L' + (f - run) + ' ' + (h - 308 - rise) }));
    var cx = f + 80, cy = h - 300;
    s.appendChild(el('rect', { x: cx - 60, y: cy - 30, width: 120, height: 60, rx: 10, fill: 'var(--cmi-dado)' }));
    s.appendChild(el('rect', { x: cx + 44, y: cy - 200, width: 26, height: 180, rx: 10, fill: 'var(--cmi-dado)' }));
    s.appendChild(el('rect', { x: cx - 80, y: cy - 50, width: 150, height: 30, rx: 10, fill: 'var(--cmi-nosing)' }));
    s.appendChild(el('rect', { x: cx + 44, y: cy - 200, width: 26, height: 150, rx: 10, fill: 'var(--cmi-nosing)' }));
    s.appendChild(el('rect', { x: cx - 74, y: cy - 110, width: 14, height: 70, rx: 6, fill: 'var(--cmi-dado)' }));
    s.appendChild(el('rect', { x: cx - 80, y: cy + 60, width: 140, height: 14, rx: 4, fill: 'var(--cmi-dado)' }));
    s.appendChild(el('rect', { x: cx + 10, y: cy + 30, width: 10, height: 30, fill: 'var(--cmi-dado)' }));
    s.appendChild(el('rect', { x: f + 214, y: h - 420, width: 46, height: 46, rx: 8, fill: 'var(--cmi-nosing)', stroke: 'var(--cmi-dado)', 'stroke-width': 4 }));
    s.appendChild(el('circle', { cx: f + 237, cy: h - 397, r: 12, fill: 'var(--cmi-link)' }));
    return s;
  }

  // A lamp on the landing, lit the same as every other.
  function lamp(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: w / 2 - 3, y: 0, width: 6, height: h - w / 2, fill: 'var(--cmi-dado)' }));
    s.appendChild(el('circle', { cx: w / 2, cy: h - w / 2, r: w / 2 - 4, fill: 'var(--cmi-lamp)', stroke: 'var(--cmi-dado)', 'stroke-width': 6 }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['count-me-in.html'] = {
    prefix: 'cmi-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 900), sh = kit.H - 24;
      var eye = sh / 2, WIDE = 760, FOOT = 1400;     // where the first flight starts
      var STEPS = 12, RISE = 40, TREAD = 70, FW = 900;
      var WH = Math.max(1400, sh + 900), decor = [];

      // The first flight, riser after riser, rising away from you to its landing.
      for (var i = 0; i < STEPS; i++) {
        decor.push(kit.item(riser(FW, RISE), { x: WIDE - FW / 2 - 40, z: FOOT + i * TREAD, w: FW, h: RISE, y: i * RISE }));
      }
      var LANDING = FOOT + STEPS * TREAD;
      decor.push(kit.item(riser(FW, STEPS * RISE), { x: WIDE - FW / 2 - 40, z: LANDING + 500, w: FW, h: STEPS * RISE }));
      decor.push(kit.item(lamp(80, 260), { x: WIDE - FW / 2 - 40, z: LANDING + 300, w: 80, h: 260, y: STEPS * RISE + 340 }));
      decor.push(kit.item(liftWall(LANDING + 500, WH, STEPS * RISE, STEPS * TREAD, FOOT), { x: WIDE, z: (LANDING + 500) / 2, w: LANDING + 500, h: WH, turn: kit.RIGHT }));
      decor.push(kit.item(flights(2 * WIDE + 40, WH * 1.6, 4), { x: 0, z: LANDING + 560, w: 2 * WIDE + 40, h: WH * 1.6 }));
      var LW = LANDING + 500, lw = svg(LW, WH);
      paint(lw, LW, WH, 220);
      decor.push(kit.item(lw, { x: -WIDE, z: LW / 2, w: LW, h: WH, turn: kit.LEFT }));

      var page = kit.screen(kit.page, 'Count Me In’s own page, on the wall at the foot of the stair');
      var hung = kit.item(page, { x: -WIDE + 6, z: FOOT - 520, w: sw, h: sh, y: 40, turn: kit.LEFT, cls: 'cmi-walk-leaf' });

      var stops = [
        kit.stop({ name: 'through the fire door, the stair going up ahead of you', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the foot of the stairs, by the chairlift parked there', spot: { x: 200, z: FOOT - 500, yaw: 0.6 } }),
        kit.stop({ name: 'at the wall by the foot of the stair, with the room’s own page on it', spot: kit.front(hung), link: page }, hung)
      ];

      return {
        cls: 'cmi-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on the left-hand wall, by the foot of the stair.',
        bounds: function () { return { x: [-WIDE + 240, WIDE - 240], z: [0, FOOT - 300] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--cmi-tread'));
          // Concrete, and the white painted line along the foot of the flight.
          kit.quad(g, WIDE - FW - 40, WIDE - 40, FOOT - 30, FOOT - 10, kit.ink('--cmi-nosing'));
        }
      };
    }
  };
})();
