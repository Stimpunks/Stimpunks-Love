/* =============================================================================
   The Feed, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1 of the
   rooms you can walk into.

   IT IS THE FEED'S WORLD AND NOBODY ELSE'S (§27): a dark station concourse
   under girders, with split-flap arrivals boards standing on legs down both
   sides of the hall. It is a MACHINE, not a document: every board is lit from
   inside, through a mask, so its rows have a hard edge and the enamel between
   them stays dead, and each throws its own pool of light on the floor in front
   of it. THE FURNITURE IS DARKER THAN THE ROOM: a board's carcass is the
   darkest thing in the hall. Every object stands on the floor and is
   separated from every other by a shadow; nothing lies flat. That is what
   keeps this off the Adventurer's Guild, which is pale, lit from nowhere and
   has no depth. The boards here are drawn and carry no words; the arrivals
   themselves, each with the minute its wire was read, are on the room's own
   page, which stands on the last board at the far end of the concourse.

   THE FLAPS DO NOT FLIP: nothing in the hall moves and the boards make no
   noise. Nothing is ranked and nothing is added up. Every colour is one §27
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Paper Street's screen(). tools/make-paper-street.py
   holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function seeded(n) {
    return function () {
      n = (n + 0x6D2B79F5) | 0;
      var t = Math.imul(n ^ (n >>> 15), 1 | n);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // A split-flap board on its legs: the dark carcass, a nameboard, and rows of
  // flaps lit through the mask, each flap split by its fold. No letters: the
  // arrivals are the page's, and a drawing of words nobody wrote would be a
  // board saying something that never arrived.
  function board(r, w, h) {
    var s = svg(w, h), body = h * 0.68, legs = h - body;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: body, fill: 'var(--fd-enamel)', stroke: 'var(--fd-girder)', 'stroke-width': 6 }));
    s.appendChild(el('rect', { x: 30, y: 24, width: w - 60, height: 40, fill: 'var(--fd-flap)' }));
    s.appendChild(el('rect', { x: 30, y: 60, width: w - 60, height: 4, fill: 'var(--fd-amber)' }));
    for (var y = 90; y + 40 < body - 20; y += 52) {
      var cols = Math.floor((w - 60) / 26);
      for (var c = 0; c < cols; c++) {
        if (r() < 0.22) continue;
        var x = 30 + c * 26;
        s.appendChild(el('rect', { x: x, y: y, width: 22, height: 40, fill: 'var(--fd-flap)' }));
        s.appendChild(el('rect', { x: x, y: y + 20, width: 22, height: 20, fill: 'var(--fd-flap-lo)' }));
        s.appendChild(el('rect', { x: x, y: y + 19, width: 22, height: 2, fill: 'var(--fd-fold)' }));
        if (r() < 0.55) s.appendChild(el('rect', { x: x + 6, y: y + 8, width: 10, height: 24, fill: r() < 0.85 ? 'var(--fd-lamp)' : 'var(--fd-signal)' }));
      }
    }
    s.appendChild(el('rect', { x: w * 0.12, y: body, width: 16, height: legs, fill: 'var(--fd-girder)' }));
    s.appendChild(el('rect', { x: w * 0.88 - 16, y: body, width: 16, height: legs, fill: 'var(--fd-girder)' }));
    return s;
  }

  // The girders overhead, crossing the hall.
  function girder(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 18, fill: 'var(--fd-girder)' }));
    s.appendChild(el('rect', { x: 0, y: h - 18, width: w, height: 18, fill: 'var(--fd-girder)' }));
    for (var x = 0; x < w; x += 120) {
      s.appendChild(el('path', { d: 'M' + x + ' 18 L' + (x + 60) + ' ' + (h - 18) + ' L' + (x + 120) + ' 18', fill: 'none', stroke: 'var(--fd-girder)', 'stroke-width': 8 }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-feed.html'] = {
    prefix: 'feed-walk',
    build: function (kit) {
      var r = seeded(27);
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 3000 + F;                       // the far end of the concourse
      var eye = sh / 2, decor = [], pools = [];
      var LEGS = 220;

      var boards = [];
      for (var z = 600; z < END - F * 1.2; z += 620) {
        [-1, 1].forEach(function (side) {
          var b = kit.item(board(r, 520, 700), { x: side * 620, z: z, w: 520, h: 700, turn: side < 0 ? kit.LEFT : kit.RIGHT });
          decor.push(b); boards.push(b);
          pools.push([side * 460, z]);
        });
      }
      for (z = 400; z < END + 400; z += 700) {
        decor.push(kit.item(girder(2400, 120), { x: 0, z: z, w: 2400, h: 120, y: Math.max(sh + LEGS + 360, 1100) }));
      }

      var page = kit.screen(kit.page, 'The Feed’s own page, on the last board at the far end of the concourse');
      var plate = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: LEGS, cls: 'feed-walk-board' });
      // The last board's legs, under the page.
      var legs = svg(sw, LEGS);
      legs.appendChild(el('rect', { x: sw * 0.1, y: 0, width: 20, height: LEGS, fill: 'var(--fd-girder)' }));
      legs.appendChild(el('rect', { x: sw * 0.9 - 20, y: 0, width: 20, height: LEGS, fill: 'var(--fd-girder)' }));
      decor.push(kit.item(legs, { x: 0, z: END + 4, w: sw, h: LEGS }));

      var stops = [
        kit.stop({ name: 'at the head of the concourse, the boards standing down both sides', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'between the boards, in the light one throws on the floor', spot: kit.front(boards[2], 900) }, boards[2]),
        kit.stop({ name: 'at the far end, with the room’s own page on the last board', spot: { x: 0, z: END - F }, link: page }, plate)
      ];

      return {
        cls: 'feed-walk',
        eye: eye + LEGS,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on the last board, at the far end of the concourse.',
        bounds: function () { return { x: [-380, 380], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--fd-hall'));
          // Each board's own pool of light on the floor in front of it, hard
          // edged, and the shadow behind it.
          pools.forEach(function (p) {
            kit.quad(g, p[0] - 120, p[0] + 120, p[1] - 240, p[1] + 240, kit.ink('--fd-lamp'), 0.1);
            kit.quad(g, p[0] + Math.sign(p[0]) * 160, p[0] + Math.sign(p[0]) * 300, p[1] - 260, p[1] + 260, kit.ink('--fd-enamel'), 0.8);
          });
          kit.quad(g, -sw / 2, sw / 2, END - 300, END, kit.ink('--fd-lamp'), 0.08);
          var line = kit.ink('--fd-enamel');
          for (var zz = Math.max(0, Math.ceil(near / 300) * 300); zz < Math.min(far, END + 200); zz += 300) kit.quad(g, -1400, 1400, zz, zz + 4, line);
        }
      };
    }
  };
})();
