/* =============================================================================
   The Doomscroll, walked into on Paper Street: the small room off the Mopery's
   library. Ryan's ask, 2026-11-04: round 1 of the rooms you can walk into.

   IT IS THE SCROLL'S WORLD AND SHARES NOTHING WITH THE LIBRARY IT IS OFF (§24):
   you come up out of the dark and somebody hands you a paper. A small dark
   room, and a dark reading desk you can see the edges of, its top sloped like
   a clerk's, and on it one unbroken roll of foxed newsprint, warm and grey,
   never white: still rolled at the head of the slope, unrolled down it towards
   you, and curled over the front edge at its foot. The unrolled part is the
   room's own page. Nothing is cut, nothing lies at an angle on it, and the
   paper is the brightest thing in the room. The light is plain and from above,
   and there is no flame: candles are the library's.

   THE ZINE TABLE IS THE COLLISION: that is a photocopy cut up and scattered;
   this is one roll, uncut, on a desk. NOTHING MOVES. Every colour is one §24
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

  // The roll still rolled, across the head of the desk.
  function roll(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, rx: h / 2, fill: 'var(--dsc-paper-2)' }));
    s.appendChild(el('rect', { x: 20, y: h * 0.62, width: w - 40, height: 4, fill: 'var(--dsc-rule)' }));
    s.appendChild(el('ellipse', { cx: 20, cy: h / 2, rx: 18, ry: h / 2 - 2, fill: 'var(--dsc-paper)', stroke: 'var(--dsc-rule)', 'stroke-width': 3 }));
    s.appendChild(el('ellipse', { cx: 20, cy: h / 2, rx: 6, ry: h * 0.16, fill: 'var(--dsc-rule)' }));
    return s;
  }

  // The desk under the paper: dark wood, its sloped top's front edge with the
  // roll curled over it, and its legs.
  function desk(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 70, fill: 'var(--dsc-ink-2)' }));
    s.appendChild(el('path', { d: 'M60 0 H' + (w - 60) + ' V36 Q' + (w / 2) + ' 52 60 36 Z', fill: 'var(--dsc-paper)' }));
    s.appendChild(el('rect', { x: 40, y: 70, width: 40, height: h - 70, fill: 'var(--dsc-ink-2)' }));
    s.appendChild(el('rect', { x: w - 80, y: 70, width: 40, height: h - 70, fill: 'var(--dsc-ink-2)' }));
    s.appendChild(el('rect', { x: 40, y: h - 80, width: w - 80, height: 18, fill: 'var(--dsc-ink-2)' }));
    return s;
  }

  // A wall of the small room: dark, with the faint line of a dado.
  function wall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--dsc-desk)' }));
    s.appendChild(el('rect', { x: 0, y: h - 300, width: w, height: 8, fill: 'var(--dsc-ink-2)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-doomscroll.html'] = {
    prefix: 'dsc-walk',
    from: 'the-mopery.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 900), sh = kit.H - 24;
      var END = 1300 + F;                       // the desk
      var DESK = 320, HALF = 760, eye = sh / 2 + DESK, decor = [];
      var WALL = sh + DESK + 400;

      [-1, 1].forEach(function (side) {
        decor.push(kit.item(wall(END + 400, WALL), { x: side * HALF, z: (END + 400) / 2 - 100, w: END + 400, h: WALL, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      decor.push(kit.item(wall(HALF * 2 + 100, WALL), { x: 0, z: END + 200, w: HALF * 2 + 100, h: WALL }));
      decor.push(kit.item(desk(sw + 160, DESK), { x: 0, z: END - 40, w: sw + 160, h: DESK }));
      decor.push(kit.item(roll(sw + 80, 90), { x: 0, z: END + 20, w: sw + 80, h: 90, y: DESK + sh - 10 }));

      var page = kit.screen(kit.page, 'The Doomscroll’s own page, the roll unrolled down the desk');
      var paper = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: DESK, cls: 'dsc-walk-roll' });

      var stops = [
        kit.stop({ name: 'in the doorway, up out of the dark', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the reading desk, with the room’s own page unrolled down it', spot: { x: 0, z: END - F }, link: page }, paper)
      ];

      return {
        cls: 'dsc-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is the roll on the reading desk, unrolled towards you.',
        bounds: function () { return { x: [-420, 420], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--dsc-ink'));
          var board = kit.ink('--dsc-desk');
          for (var x = -HALF; x <= HALF; x += 140) kit.quad(g, x - 3, x + 3, Math.max(0, near), Math.min(far, END + 200), board);
          // The plain light from above, on the floor round the desk.
          kit.oval(g, 0, END - 200, sw * 0.7, 420, kit.ink('--dsc-paper'), 0.08);
        }
      };
    }
  };
})();
