/* =============================================================================
   Breaker Breaker, walked into on Paper Street. Ryan's call, 2026-11-04: round
   one of the rooms you can walk into, the cab among them.

   IT IS THE CAB'S WORLD AND NOBODY ELSE'S (§125): night on the interstate in a
   convoy, seen from the middle lane. EVERY LIGHT IS A MARKER LAMP, A POINT THAT
   SHOWS WHERE THE EDGE OF SOMETHING IS AND LIGHTS NOTHING ROUND IT, and the
   lamps are the law's colours, not ours: amber along the sides, red at the
   back, three in a row at the middle as high as they will go. So the rigs
   round you are dark shapes drawn dot to dot by their own lamps, the road is
   as dark as the sky, no surface is lit, and the only marks on the road are
   its painted lines. The rig you are following has the room's own page on its
   back doors, outlined in its red lamps, full size once you pull up to it.

   THE REPEATER is the street's other radio and the one to watch: there
   everything is a silhouette against a sky lit from below. Here the sky is as
   dark as the road and nothing has a silhouette; if a glow ever comes up
   behind the convoy, it is this room that moves. NOTHING BLINKS at any
   setting: no hazard, no turn signal, no lamp that pulses. Every colour is one
   §125 declares, by name. It keeps nothing, sends nothing and fetches nothing;
   its page arrives through Paper Street's screen(). tools/make-paper-street.py
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
  function lamp(s, x, y, ink) { s.appendChild(el('circle', { cx: x, cy: y, r: 9, fill: 'var(' + ink + ')' })); }
  // Lamps along a line, dot to dot.
  function run(s, x0, y0, x1, y1, step, ink) {
    var n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
    for (var i = 0; i <= n; i++) lamp(s, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, ink);
  }

  // The back of a trailer: dark, outlined in red at its corners and along its
  // foot, three red lamps in a row at the middle as high as they go. `hole`
  // leaves the doors for the page.
  function trailerBack(w, h, lift) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h - lift, fill: 'var(--bkb-night)' }));
    run(s, 14, 14, 14, h - lift - 14, 70, '--bkb-red');
    run(s, w - 14, 14, w - 14, h - lift - 14, 70, '--bkb-red');
    run(s, 14, h - lift - 14, w - 14, h - lift - 14, 90, '--bkb-red');
    [-40, 0, 40].forEach(function (d) { lamp(s, m + d, 26, '--bkb-red'); });
    [m - w * 0.36, m + w * 0.36].forEach(function (x) { s.appendChild(el('rect', { x: x - 60, y: h - lift, width: 120, height: lift, fill: 'var(--bkb-glass)' })); });
    return s;
  }

  // The side of a rig in the next lane: a long dark shape with amber lamps
  // along its top and its foot.
  function rigSide(w, h) {
    var s = svg(w, h), body = h - 90;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: body, fill: 'var(--bkb-night)' }));
    run(s, 20, 16, w - 20, 16, 120, '--bkb-amber');
    run(s, 20, body - 14, w - 20, body - 14, 120, '--bkb-amber');
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['breaker-breaker.html'] = {
    prefix: 'bkb-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var END = 3000 + F;                       // where the rig ahead has stopped
      var eye = sh / 2, LANE = 1300, LIFT = 120;
      var decor = [];

      decor.push(kit.item(trailerBack(sw + 160, sh + LIFT + 120, LIFT), { x: 0, z: END + 10, w: sw + 160, h: sh + LIFT + 120 }));
      var page = kit.screen(kit.page, 'Breaker Breaker’s own page, on the back doors of the rig ahead');
      var doors = kit.item(page, { x: 0, z: END, y: LIFT, w: sw, h: sh, cls: 'bkb-walk-doors' });

      // The convoy in the lanes either side: each rig's side, turned along
      // the road, and its back, facing you.
      [[-1, 1400], [1, 2400], [-1, 4200], [1, 5600]].forEach(function (r) {
        var x = r[0] * LANE, len = 2400, bh = 900;
        decor.push(kit.item(rigSide(len, bh), { x: x - r[0] * 260, z: r[1] + len / 2, w: len, h: bh, turn: r[0] < 0 ? kit.LEFT : kit.RIGHT }));
        decor.push(kit.item(trailerBack(520, bh, 90), { x: x, z: r[1], w: 520, h: bh }));
      });

      var stops = [
        kit.stop({ name: 'in the middle lane, the convoy’s lamps all round you in the dark', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'alongside a rig in the next lane, its amber lamps down its side', spot: { x: 0, z: 1900 } }),
        kit.stop({ name: 'behind the rig ahead, with the room’s own page on its back doors', spot: kit.front(doors), link: page }, doors)
      ];

      return {
        cls: 'bkb-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Every light out here is a marker lamp. The rig ahead has the room’s own page on its back doors.',
        bounds: function () { return { x: [-420, 420], z: [0, END - F] }; },
        // The road, as dark as the sky, and only its painted lines on it.
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--bkb-glass'));
          var line = kit.ink('--bkb-line');
          [-1, 1].forEach(function (k) {
            kit.quad(g, k * 1950 - 12, k * 1950 + 12, from, to, line);
            for (var z = Math.floor(from / 600) * 600; z < to; z += 600) kit.quad(g, k * 650 - 10, k * 650 + 10, z, z + 300, line);
          });
        }
      };
    }
  };
})();
