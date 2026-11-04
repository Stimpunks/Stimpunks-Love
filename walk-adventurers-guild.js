/* =============================================================================
   The Adventurer's Guild, walked into on Paper Street. Ryan's call, 2026-11-04:
   round one of the rooms you can walk into, the guild among them.

   IT IS THE GUILD'S WORLD AND NOBODY ELSE'S (§26): the one tidy room on the
   street, where somebody has come in and FILED EVERYTHING. A hall of manila
   ruled into squares, the job board down the left wall in ruled rows with a
   class in the margin and a stamp where a job is done, the filing cabinets
   down the right, and at the far end the counter, nobody behind it, with the
   guild's own page posted square on the wall over it, which you read and press
   as the page, full size once you stand at it.

   THE RULES ARE THE ROOM'S NEGATIVE ONES. No light source: it is lit like a
   photocopy, evenly, from nowhere, so nothing in here casts anything and no
   pool lies on the floor. No gradient, no shadow, no rounded corner, nothing
   tilted and nothing overlapping: every drawing here is rectangles square to
   each other, and things along the walls are only turned to face across the
   hall. If anything in here grows a soft edge, the sheet has become a place.
   Nothing moves; every colour is one §26 declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var CLASSES = ['I', 'II', 'III'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }
  function box(s, x, y, w, h, fill, stroke, sw) {
    s.appendChild(el('rect', { x: x, y: y, width: w, height: h, fill: fill || 'none', stroke: stroke || 'none', 'stroke-width': sw || 0 }));
  }

  // The job board: a ruled sheet the length of the wall, a column for the
  // class in the margin, rows of ruled lines, and a square stamp where a job
  // is done. The same board every visit.
  function board(w, h) {
    var s = svg(w, h), row = 120, margin = 110;
    box(s, 0, 0, w, h, 'var(--gu-paper)', 'var(--gu-ink)', 8);
    box(s, 0, 0, w, 90, 'var(--gu-ink)');
    for (var x = 40; x < w - 200; x += 260) box(s, x, 34, 180, 22, 'var(--gu-paper)');
    var k = 0;
    for (var y = 90; y + row <= h - 10; y += row, k++) {
      box(s, 0, y, w, 4, 'var(--gu-rule)');
      box(s, margin, y, 4, row, 'var(--gu-rule)');
      // The class in the margin, as bars: one, two or three.
      for (var c = 0; c <= k % CLASSES.length; c++) box(s, 26 + c * 22, y + 34, 12, row - 68, 'var(--gu-ink-2)');
      box(s, margin + 30, y + 30, w * 0.42, 16, 'var(--gu-ink)');
      box(s, margin + 30, y + 64, w * 0.3, 12, 'var(--gu-ink-2)');
      box(s, margin + 30, y + 88, w * 0.36, 12, 'var(--gu-ink-2)');
      if (k % 3 === 1) {
        box(s, w - 220, y + 22, 160, row - 44, 'none', 'var(--gu-stamp)', 8);
        box(s, w - 196, y + 50, 112, 12, 'var(--gu-stamp)');
      }
    }
    return s;
  }

  // A filing cabinet: drawers in the guild's file blue, a paper label on each.
  function cabinet(w, h) {
    var s = svg(w, h), dh = (h - 20) / 4;
    box(s, 0, 0, w, h, 'var(--gu-file)');
    for (var i = 0; i < 4; i++) {
      var y = 10 + i * dh;
      box(s, 14, y + 6, w - 28, dh - 12, 'none', 'var(--gu-ink)', 6);
      box(s, w / 2 - 50, y + 26, 100, 40, 'var(--gu-paper)');
      box(s, w / 2 - 60, y + dh - 46, 120, 12, 'var(--gu-paper-2)');
    }
    return s;
  }

  // The end wall and the counter under the page, nobody behind it.
  function endWall(w, h, gap, ph) {
    var s = svg(w, h), m = w / 2;
    box(s, 0, 0, w, h, 'var(--gu-paper-2)');
    for (var x = 0; x < w; x += 160) box(s, x, 0, 3, h, 'var(--gu-rule)');
    box(s, m - gap / 2 - 24, h - ph - 24, gap + 48, ph + 24, 'var(--gu-ink)');
    box(s, 0, h - 40, w, 40, 'var(--gu-ink-2)');
    return s;
  }
  function counter(w, h) {
    var s = svg(w, h);
    box(s, 0, 0, w, 30, 'var(--gu-ink)');
    box(s, 20, 30, w - 40, h - 30, 'var(--gu-paper)', 'var(--gu-ink)', 8);
    for (var x = 20 + (w - 40) / 4; x < w - 30; x += (w - 40) / 4) box(s, x, 30, 6, h - 30, 'var(--gu-rule)');
    box(s, 60, 60, 120, 60, 'var(--gu-stamp)');
    box(s, 100, 120, 40, 40, 'var(--gu-ink)');
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['adventurers-guild.html'] = {
    prefix: 'gu-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var END = 3000 + F;                       // where the page is posted
      var eye = sh / 2, SIDE = 620;
      var decor = [];
      var LIFT = 300;                           // the page is posted over the counter

      decor.push(kit.item(endWall(3600, sh + LIFT + 400, sw, sh + LIFT), { x: 0, z: END + 30, w: 3600, h: sh + LIFT + 400 }));
      var page = kit.screen(kit.page, 'The Adventurer’s Guild’s own page, posted over the counter');
      var posted = kit.item(page, { x: 0, z: END, y: LIFT, w: sw, h: sh, cls: 'gu-walk-sheet' });
      decor.push(kit.item(counter(sw, LIFT - 20), { x: 0, z: END - 160, w: sw, h: LIFT - 20 }));

      var BW = 2200;
      var jobs = kit.item(board(BW, 760), { x: -SIDE, z: 600 + BW / 2, y: 120, w: BW, h: 760, turn: kit.LEFT });
      decor.push(jobs);
      for (var z = 700; z < END - F * 1.2; z += 420) {
        decor.push(kit.item(cabinet(380, 640), { x: SIDE, z: z + 190, w: 380, h: 640, turn: kit.RIGHT }));
      }

      var stops = [
        kit.stop({ name: 'inside the door, where everything has been filed', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the job board, every job in its ruled row', spot: kit.front(jobs, SIDE + 380) }, jobs),
        kit.stop({ name: 'at the counter, nobody behind it, the room’s own page posted over it', spot: kit.front(posted), link: page }, posted)
      ];

      return {
        cls: 'gu-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The job board is down the left wall; the guild’s own page is posted over the counter at the end.',
        bounds: function () { return { x: [-SIDE + 260, SIDE - 260], z: [0, END - F] }; },
        // The floor is the sheet's own paper, ruled square, and nothing on it
        // casts anything.
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--gu-paper-2'));
          var rule = kit.ink('--gu-rule');
          var z0 = Math.max(0, from), z1 = Math.min(to, END + 40);
          for (var x = -1800; x <= 1800; x += 200) kit.quad(g, x - 3, x + 3, z0, z1, rule);
          for (var z = Math.ceil(z0 / 200) * 200; z < z1; z += 200) kit.quad(g, -1800, 1800, z - 3, z + 3, rule);
        }
      };
    }
  };
})();
