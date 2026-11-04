/* =============================================================================
   Show Your Work, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1
   of the rooms you can walk into.

   IT IS THE GARAGE'S WORLD AND NOBODY ELSE'S (§124): a garage with the door
   rolled up, the door's drum overhead as you come in off the street. THE LIGHT
   IS THE DAY COMING IN LEVEL FROM BEHIND YOU, and it runs out before the back
   wall: so the concrete is pale by the door and goes to shade, and the back
   wall is in shade with the tool wall on it, every tool hung over its painted
   outline, and above the bench the room's own page, pinned up with masking
   tape like the cards are. Nothing casts a shadow you can see, because the
   light is behind you. There is no roof light, which is the Foundry's, and the
   door never narrows to a gap, which is Dead Tired Society's. Nobody is drawn,
   and no card of anybody's is drawn: the cards are on the page.

   NOTHING MOVES. Every colour is one §124 declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
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

  // The rolled-up door over the doorway: its drum, and the lath ends showing.
  function drum(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, rx: h / 2, fill: 'var(--syw-ink-2)' }));
    for (var y = 14; y < h - 8; y += 16) s.appendChild(el('rect', { x: 20, y: y, width: w - 40, height: 3, fill: 'var(--syw-board)' }));
    return s;
  }

  // The back wall in shade, a tool wall on it: every tool over its painted
  // outline, and a gap where one is out being used.
  function toolWall(w, h) {
    var s = svg(w, h), dim = 'var(--syw-dim)', tool = 'var(--syw-ink-2)';
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--syw-shade)' }));
    s.appendChild(el('rect', { x: 40, y: 40, width: w - 80, height: h - 80, fill: 'var(--syw-board)' }));
    var tools = [
      'M0 0 h18 v120 h-18 Z M-22 -30 h62 v34 h-62 Z',                // hammer
      'M0 0 h12 v150 h-12 Z M-12 150 h36 v14 h-36 Z',                // screwdriver
      'M0 0 l40 0 l-8 160 l-24 0 Z',                                  // saw
      'M0 0 a26 26 0 1 1 0 1 Z M-6 26 h12 v120 h-12 Z',              // spanner
      'M0 0 h70 v24 h-70 Z M26 24 h18 v110 h-18 Z'                   // clamp
    ];
    var x = 120;
    tools.forEach(function (d, i) {
      var g = el('g', {});
      g.appendChild(el('path', { d: d, fill: 'none', stroke: dim, 'stroke-width': 3, 'stroke-dasharray': '6 5' }));
      if (i !== 2) g.appendChild(el('path', { d: d, fill: tool }));
      var at = el('svg', { x: x, y: 110, width: 120, height: 220, viewBox: '-40 -40 120 220', overflow: 'visible' });
      at.appendChild(g);
      s.appendChild(at);
      x += (w - 240) / tools.length;
    });
    return s;
  }

  // The bench under the page: a thick top and a shelf, and a stack of cards
  // not yet turned over on it.
  function bench(w, h) {
    var s = svg(w, h), ink = 'var(--syw-ink)';
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 40, fill: 'var(--syw-ink-2)' }));
    s.appendChild(el('rect', { x: 30, y: 40, width: 30, height: h - 40, fill: ink }));
    s.appendChild(el('rect', { x: w - 60, y: 40, width: 30, height: h - 40, fill: ink }));
    s.appendChild(el('rect', { x: 30, y: h - 90, width: w - 60, height: 22, fill: ink }));
    for (var i = 0; i < 6; i++) s.appendChild(el('rect', { x: w - 360 + i * 3, y: -14 - i * 8, width: 180, height: 10, fill: i % 2 ? 'var(--syw-card)' : 'var(--syw-dim)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['show-your-work.html'] = {
    prefix: 'syw-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 2000 + F;                       // the back wall, where the page is pinned up
      var BENCH = 380, eye = sh / 2 + BENCH + 40, decor = [];
      var WALL = Math.max(sh + BENCH + 300, 1100);

      decor.push(kit.item(drum(2400, 150), { x: 0, z: 180, w: 2400, h: 150, y: WALL - 150 }));
      var tools = kit.item(toolWall(1400, 560), { x: -1050, z: END - 600, w: 1400, h: 560, y: 300, turn: kit.LEFT });
      decor.push(tools);
      decor.push(kit.item(bench(sw + 300, BENCH), { x: 0, z: END - 60, w: sw + 300, h: BENCH }));

      var page = kit.screen(kit.page, 'Show Your Work’s own page, pinned up over the bench');
      var card = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: BENCH + 40, cls: 'syw-walk-card' });

      var stops = [
        kit.stop({ name: 'in the doorway, the street’s daylight behind you', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the tool wall, every tool over its painted outline', spot: kit.front(tools) }, tools),
        kit.stop({ name: 'at the bench, with the room’s own page pinned up over it', spot: { x: 0, z: END - F }, link: page }, card)
      ];

      return {
        cls: 'syw-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is pinned up over the bench at the back, in the shade.',
        bounds: function () { return { x: [-640, 640], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--syw-shade'));
          kit.quad(g, -1200, 1200, 0, END + 40, kit.ink('--syw-board'));
          // The day off the street, level from behind you, running out before
          // the back wall.
          var day = kit.ink('--syw-text');
          for (var k = 0; k < 6; k++) kit.quad(g, -1200, 1200, k * 220, (k + 1) * 220, day, 0.16 - k * 0.025);
          var seam = kit.ink('--syw-shade');
          for (var z = 500; z < END; z += 500) kit.quad(g, -1200, 1200, z, z + 6, seam);
          kit.quad(g, -3, 3, 0, END, seam);
        }
      };
    }
  };
})();
