/* =============================================================================
   Pink Pony Club, walked into on Paper Street. Ryan's call, 2026-10-31: the
   fourth room you can walk into, and the first door on the street.

   IT IS THE DANCEFLOOR'S WORLD AND NOBODY ELSE'S (§6): flat hot pink with
   nothing on the walls because there are no walls, cream for everything that
   catches the light, the room's own plum for everything that does not, and a
   mirrorball. The floor is lit tiles in the room's pink and cream with plum
   grout; the ball hangs over the middle of it; the decks stand on a table to
   one side, the page's own, lifted onto it, to put on where they stand; and at
   the far end, between two speakers, is the jukebox's cream
   tray with the room's own page in it, full size once you stand at it.

   THE BALL DOES NOT TURN, AND ITS LIGHT ON THE FLOOR FOLLOWS THE DIAL: the
   room's own glow is hidden at Gentle, so at Gentle no glint lies on this
   floor either. Nothing moves and nothing plays: the jukebox plays only when
   somebody presses a song on the page in the tray. Every colour is one the room
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
  // A fixed number for a place on the floor, so nothing shifts between visits.
  function hash(i, j, k) {
    var n = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(k, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  // The mirrorball on its line: facets of cream and the ball's darker pink,
  // still at every setting.
  function mirrorball(w, h) {
    var s = svg(w, h), r = w / 2 - 6, cx = w / 2, cy = h - r - 6, f = 22;
    s.appendChild(el('rect', { x: cx - 2, y: 0, width: 4, height: cy - r, fill: 'var(--cream)' }));
    for (var y = cy - r; y < cy + r; y += f) {
      for (var x = cx - r; x < cx + r; x += f) {
        var dx = x + f / 2 - cx, dy = y + f / 2 - cy;
        if (dx * dx + dy * dy > (r - 6) * (r - 6)) continue;
        var odd = (Math.round((x - cx) / f) + Math.round((y - cy) / f)) % 2;
        s.appendChild(el('rect', { x: x + 1, y: y + 1, width: f - 2, height: f - 2, fill: odd ? 'var(--pony-ball)' : 'var(--cream)' }));
      }
    }
    s.appendChild(el('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: 'var(--cream)', 'stroke-width': 8 }));
    return s;
  }

  // The table the decks stand on. The decks themselves are the page's own,
  // lifted onto it, so they are not drawn here.
  function table(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--pony-ink)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 10, fill: 'var(--cream)' }));
    return s;
  }

  // A speaker stack: plum boxes, cream cones.
  function speaker(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--pony-ink)' }));
    [0.25, 0.62].forEach(function (k) {
      s.appendChild(el('circle', { cx: w / 2, cy: h * k, r: w * 0.32, fill: 'none', stroke: 'var(--cream)', 'stroke-width': 8 }));
      s.appendChild(el('circle', { cx: w / 2, cy: h * k, r: w * 0.1, fill: 'var(--cream)' }));
    });
    s.appendChild(el('circle', { cx: w / 2, cy: h * 0.88, r: w * 0.08, fill: 'var(--hot)' }));
    return s;
  }

  // A banquette along the side of the floor: a plum back, a cream seat, for
  // sitting one out.
  function banquette(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h * 0.62, rx: 26, fill: 'var(--pony-ink)' }));
    for (var x = 40; x < w - 40; x += 120) s.appendChild(el('rect', { x: x, y: 18, width: 6, height: h * 0.44, fill: 'var(--hot)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.56, width: w, height: h * 0.26, rx: 14, fill: 'var(--cream)' }));
    s.appendChild(el('rect', { x: 10, y: h * 0.82, width: w - 20, height: h * 0.18, fill: 'var(--pony-ink)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['pink-pony-club.html'] = {
    prefix: 'pony-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 2800 + F;                       // where the jukebox stands
      var eye = sh / 2, TILE = 220;
      var decor = [];

      var ball = kit.item(mirrorball(320, 900), { x: 0, z: 1700, w: 320, h: 900, y: eye + 160 });
      decor.push(ball);
      decor.push(kit.item(table(560, 200), { x: 560, z: 1200, w: 560, h: 200 }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(speaker(240, 560), { x: side * (sw / 2 + 170), z: END + 20, w: 240, h: 560 }));
      });
      // Banquettes down both sides of the floor, facing it.
      [[-1, 700], [-1, 2000], [1, 2100], [1, 300]].forEach(function (b) {
        decor.push(kit.item(banquette(900, 280), { x: b[0] * 900, z: b[1] + 450, w: 900, h: 280, turn: b[0] < 0 ? kit.LEFT : kit.RIGHT }));
      });

      var page = kit.screen(kit.page, 'Pink Pony Club’s own page, in the jukebox’s tray');
      var tray = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'pony-walk-tray' });

      // THE DECKS ARE THE PAGE'S OWN, lifted onto the table: two whole
      // playlists to put on and leave running, which play where they stand.
      var decks = kit.lift(page, '.decks', { x: 560, z: 1195, y: 200, w: 520, cls: 'pony-walk-decks' });
      var at = function (it) { return kit.front(it); };
      var first = { focus: function (o) { var b = decks.el.querySelector('button.facade'); if (b) b.focus(o); } };

      var stops = [
        kit.stop({ name: 'at the edge of the dancefloor', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the decks, with two whole playlists to put on', spot: at(decks), link: first }, decks),
        kit.stop({ name: 'under the mirrorball', spot: { x: 0, z: 1700 - F * 0.5 } }),
        kit.stop({ name: 'at the jukebox, with the room’s own page in its tray', spot: { x: 0, z: END - F }, link: page }, tray)
      ];

      return {
        cls: 'pony-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is in the jukebox’s tray at the far end of the floor.',
        bounds: function () { return { x: [-820, 820], z: [0, END - F] }; },
        ground: function (g, from, to) {
          var cz = (from + to) / 2;
          kit.quad(g, -4000, 4000, from, to, kit.ink('--hot'));
          var cream = kit.ink('--cream'), plum = kit.ink('--pony-ink');
          var j0 = Math.max(0, Math.floor((cz - F * 1.5) / TILE)), j1 = Math.min(Math.ceil((END + 300) / TILE), Math.ceil((cz + F * 8) / TILE));
          // Lit tiles, here and there across the floor, the same every visit.
          for (var j = j0; j < j1; j++) {
            for (var i = -5; i < 5; i++) {
              if ((i + j) % 2 === 0 && hash(i, j, 1) < 0.5) kit.quad(g, i * TILE, (i + 1) * TILE, j * TILE, (j + 1) * TILE, cream, 0.2);
            }
          }
          // The grout between the tiles.
          for (i = -5; i <= 5; i++) kit.quad(g, i * TILE - 3, i * TILE + 3, j0 * TILE, j1 * TILE, plum);
          for (j = j0; j <= j1; j++) kit.quad(g, -5 * TILE, 5 * TILE, j * TILE - 3, j * TILE + 3, plum);
          // The ball's glints on the floor, shown above Gentle only, as the
          // room's own glow is.
          if (document.documentElement.getAttribute('data-intensity') !== 'gentle') {
            for (var k = 0; k < 40; k++) {
              var gx = -1000 + hash(k, 7, 2) * 2000, gz = 1700 - 1000 + hash(k, 7, 3) * 2000;
              kit.oval(g, gx, gz, 22, 12, cream, 0.6);
            }
          }
        }
      };
    }
  };
})();
