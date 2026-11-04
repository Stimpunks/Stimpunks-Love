/* =============================================================================
   The Sandbox, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1 of
   the rooms you can walk into.

   IT IS SOMEBODY'S OWN ROOM (§112), brought in by tools/import-room.py, and
   this scene is OURS: a drawing of The Sandbox in card, in the colours the room
   declares (its --sb- colours, by name) and nothing else, changing nothing on
   its page, and its maker's to keep or send back. Its light is the room's own
   words: a laptop left open in the sand at dusk, its screen the only light in
   the playground. So the playground is dusk all round, its frames stand dark
   against it, the sandpit has a timber edge, and the one light is the laptop's
   screen, which is the room's own page, glowing a little onto the sand in
   front of it.

   NOTHING MOVES: the swings hang still. Every colour is one §112 declares, by
   name. It keeps nothing, sends nothing and fetches nothing; its page arrives
   through Paper Street's screen(). tools/make-paper-street.py holds each of
   those.
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

  // A swing frame, dark against the dusk: an A at each end, a bar, two seats.
  function swings(w, h) {
    var s = svg(w, h), m = 'var(--sb-metal)';
    [[30, w * 0.18], [w - 30, w * 0.82]].forEach(function (p) {
      s.appendChild(el('path', { d: 'M' + (p[0] - 50) + ' ' + h + ' L' + p[1] + ' 20 L' + (p[0] + 50) + ' ' + h, fill: 'none', stroke: m, 'stroke-width': 14 }));
    });
    s.appendChild(el('rect', { x: w * 0.18 - 10, y: 12, width: w * 0.64 + 20, height: 16, fill: m }));
    [0.36, 0.64].forEach(function (k) {
      var x = w * k;
      s.appendChild(el('path', { d: 'M' + (x - 34) + ' 28 V' + (h - 120) + ' M' + (x + 34) + ' 28 V' + (h - 120), stroke: 'var(--sb-muted)', 'stroke-width': 4 }));
      s.appendChild(el('rect', { x: x - 44, y: h - 124, width: 88, height: 14, rx: 6, fill: 'var(--sb-ink)' }));
    });
    return s;
  }

  // A sandcastle, patted out of the damp sand: a keep, two towers, a bucket's
  // ring of crenels, and the bucket and spade left beside it.
  function castle(w, h) {
    var s = svg(w, h), sand = 'var(--sb-sand)', deep = 'var(--sb-sanddeep)';
    s.appendChild(el('path', { fill: sand, d: 'M20 ' + h + ' L40 ' + (h - 120) + ' H' + (w - 160) + ' L' + (w - 140) + ' ' + h + ' Z' }));
    [[40, 150], [w - 230, 150], [w / 2 - 110, 220]].forEach(function (t) {
      s.appendChild(el('rect', { x: t[0], y: h - t[1], width: 90, height: t[1], fill: sand }));
      for (var i = 0; i < 3; i++) s.appendChild(el('rect', { x: t[0] + i * 32, y: h - t[1] - 18, width: 22, height: 20, fill: sand }));
      s.appendChild(el('rect', { x: t[0] + 34, y: h - t[1] * 0.55, width: 22, height: 34, rx: 11, fill: deep }));
    });
    s.appendChild(el('path', { fill: 'var(--sb-ember)', d: 'M' + (w - 120) + ' ' + h + ' L' + (w - 130) + ' ' + (h - 90) + ' H' + (w - 40) + ' L' + (w - 50) + ' ' + h + ' Z' }));
    s.appendChild(el('rect', { x: w - 132, y: h - 98, width: 94, height: 10, rx: 4, fill: 'var(--sb-emberdeep)' }));
    s.appendChild(el('path', { d: 'M' + (w - 20) + ' ' + h + ' L' + (w - 4) + ' ' + (h - 130), stroke: 'var(--sb-emberdeep)', 'stroke-width': 8 }));
    return s;
  }

  // The laptop's base, lying in the sand under its lid; the lid is the page.
  function base(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, rx: 10, fill: 'var(--sb-ink)' }));
    s.appendChild(el('rect', { x: w * 0.38, y: h * 0.42, width: w * 0.24, height: h * 0.3, rx: 6, fill: 'var(--sb-muted)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['sandbox.html'] = {
    prefix: 'sb-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 2400 + F;                        // where the laptop stands open
      var PIT = [-900, 900, 300, END + 260];     // the sandpit's edges
      var eye = sh / 2, decor = [];

      decor.push(kit.item(swings(1300, 760), { x: -1500, z: 1500, w: 1300, h: 760, turn: kit.LEFT }));
      decor.push(kit.item(swings(1300, 760), { x: 1700, z: END + 900, w: 1300, h: 760 }));
      var fort = kit.item(castle(620, 260), { x: 420, z: 1300, w: 620, h: 260 });
      decor.push(fort);
      decor.push(kit.item(base(sw + 60, 70), { x: 0, z: END - 40, w: sw + 60, h: 70 }));

      var page = kit.screen(kit.page, 'The Sandbox’s own page, on the laptop’s screen');
      var lid = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: 60, cls: 'sb-walk-screen' });

      var stops = [
        kit.stop({ name: 'at the edge of the sandpit, at dusk', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'by the sandcastle, with a bucket and spade left beside it', spot: kit.front(fort) }, fort),
        kit.stop({ name: 'at the laptop open in the sand, with the room’s own page on its screen', spot: { x: 0, z: END - F }, link: page }, lid)
      ];

      return {
        cls: 'sb-walk',
        eye: eye + 60,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on the laptop’s screen, open in the sand at the far side of the pit.',
        bounds: function () { return { x: [-800, 800], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--sb-sanddeep'));
          kit.quad(g, PIT[0], PIT[1], PIT[2], PIT[3], kit.ink('--sb-sand'));
          var deep = kit.ink('--sb-sanddeep');
          kit.quad(g, PIT[0] - 30, PIT[1] + 30, PIT[2] - 30, PIT[2], deep);
          kit.quad(g, PIT[0] - 30, PIT[0], PIT[2], PIT[3], deep);
          kit.quad(g, PIT[1], PIT[1] + 30, PIT[2], PIT[3], deep);
          kit.quad(g, PIT[0] - 30, PIT[1] + 30, PIT[3], PIT[3] + 30, deep);
          // The screen's light on the sand in front of it, the only light here.
          kit.oval(g, 0, END - 260, sw * 0.7, 360, kit.ink('--sb-glow'), 0.14);
          kit.oval(g, 0, END - 160, sw * 0.45, 200, kit.ink('--sb-glow'), 0.12);
        }
      };
    }
  };
})();
