/* =============================================================================
   The Seaside Convenience, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round 1 of the rooms you can walk into.

   IT IS THE PROMENADE'S WORLD AND NOBODY ELSE'S (§139): a Victorian public
   convenience of painted cast iron in green and cream tile, standing at the
   end of a promenade under a glass canopy on curly brackets, with the sea past
   the railings down the right. THE LIGHT IS THE ROOM: a bright hazy sky over
   the sea and the glare off the water, so everything is pale and high-key,
   the shadows faint, and nothing lit from inside. It is not the MUD Room's
   Slake (overcast, olive mud, nothing built) and not the Hermitage (a low warm
   sun with a direction). The room's own page stands on an enamel board under
   the canopy, between the arch and the cubicle doors, every one of which is
   for everybody.

   NOTHING MOVES, at any setting: the sea lies still. Every colour is one §139
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

  // The pavilion's front: cream tile in courses, an iron frame, an open arch
  // at each end, a row of cubicle doors with a small free-or-in-use lamp over
  // each, and the glass canopy on its curly brackets across the top.
  function pavilion(w, h, gap) {
    var s = svg(w, h), cx = w / 2, iron = 'var(--sea-iron)', top = 150;
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: h - top, fill: 'var(--sea-cream)' }));
    for (var y = top + 60; y < h; y += 60) s.appendChild(el('rect', { x: 0, y: y, width: w, height: 3, fill: 'var(--sea-sky)' }));
    s.appendChild(el('rect', { x: 0, y: h - 90, width: w, height: 90, fill: iron }));
    [cx - gap / 2 - 420, cx + gap / 2 + 420].forEach(function (ax) {
      s.appendChild(el('path', { fill: 'var(--sea-ink)', d: 'M' + (ax - 120) + ' ' + h + ' V' + (top + 260) + ' A120 120 0 0 1 ' + (ax + 120) + ' ' + (top + 260) + ' V' + h + ' Z' }));
      s.appendChild(el('path', { fill: 'none', stroke: iron, 'stroke-width': 20, d: 'M' + (ax - 120) + ' ' + h + ' V' + (top + 260) + ' A120 120 0 0 1 ' + (ax + 120) + ' ' + (top + 260) + ' V' + h }));
    });
    [[60, cx - gap / 2 - 600], [cx + gap / 2 + 600, w - 60]].forEach(function (run) {
      for (var x = run[0]; x + 140 <= run[1]; x += 170) {
        s.appendChild(el('rect', { x: x, y: top + 220, width: 140, height: h - top - 310, fill: iron }));
        s.appendChild(el('rect', { x: x + 14, y: top + 236, width: 112, height: h - top - 342, fill: 'none', stroke: 'var(--sea-cream)', 'stroke-width': 4 }));
        s.appendChild(el('circle', { cx: x + 70, cy: top + 190, r: 12, fill: 'var(--sea-buoy)' }));
      }
    });
    // The canopy: glass on iron ribs, and a curl of iron under each rib.
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: top, fill: 'var(--sea-sky)' }));
    s.appendChild(el('rect', { x: 0, y: top - 24, width: w, height: 24, fill: iron }));
    for (var r = 40; r < w; r += 220) {
      s.appendChild(el('rect', { x: r, y: 0, width: 10, height: top, fill: iron }));
      s.appendChild(el('path', { fill: 'none', stroke: iron, 'stroke-width': 8, d: 'M' + (r + 5) + ' ' + top + ' q0 70 -60 70 q-30 0 -30 -26 q0 -20 22 -20' }));
    }
    return s;
  }

  // The railings along the front, with the sea past them, the glare low on
  // the water, and a lifebuoy on a post.
  function railings(w, h) {
    var s = svg(w, h), iron = 'var(--sea-iron)';
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h * 0.42, fill: 'var(--sea-sky)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.42, width: w, height: h * 0.58, fill: 'var(--sea-ink-2)' }));
    for (var y = h * 0.46; y < h; y += 26) s.appendChild(el('rect', { x: 0, y: y, width: w, height: 5, fill: 'var(--sea-haze)', opacity: '0.5' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.62, width: w, height: 12, fill: iron }));
    s.appendChild(el('rect', { x: 0, y: h * 0.86, width: w, height: 8, fill: iron }));
    for (var x = 20; x < w; x += 40) s.appendChild(el('rect', { x: x, y: h * 0.62, width: 6, height: h * 0.38, fill: iron }));
    for (x = 120; x < w; x += 720) {
      s.appendChild(el('circle', { cx: x, cy: h * 0.62, r: 46, fill: 'none', stroke: 'var(--sea-buoy)', 'stroke-width': 22 }));
      s.appendChild(el('circle', { cx: x, cy: h * 0.62, r: 46, fill: 'none', stroke: 'var(--sea-cream)', 'stroke-width': 22, 'stroke-dasharray': '24 48' }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['seaside-convenience.html'] = {
    prefix: 'sea-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 2600 + F;                       // where the enamel board stands
      var eye = sh / 2, decor = [];
      var PH = Math.max(sh + 300, 900);

      decor.push(kit.item(pavilion(3600, PH, sw), { x: 0, z: END + 120, w: 3600, h: PH }));
      decor.push(kit.item(railings(END + 1800, 460), { x: 760, z: (END + 1800) / 2 - 200, w: END + 1800, h: 460, turn: kit.RIGHT }));

      var page = kit.screen(kit.page, 'The Seaside Convenience’s own page, on an enamel board under the canopy');
      var board = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'sea-walk-board' });

      var stops = [
        kit.stop({ name: 'on the promenade, with the sea past the railings on your right', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the railings, looking out to sea', spot: { x: 380, z: 1200, yaw: Math.PI / 2 } }),
        kit.stop({ name: 'under the canopy, at the enamel board with the room’s own page on it', spot: { x: 0, z: END - F }, link: page }, board)
      ];

      return {
        cls: 'sea-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on an enamel board under the canopy, at the end of the promenade.',
        bounds: function () { return { x: [-700, 520], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--sea-haze'));
          var line = kit.ink('--sea-sky');
          for (var x = -1800; x <= 760; x += 180) kit.quad(g, x - 3, x + 3, Math.max(near, 0), Math.min(far, END + 120), line);
          for (var z = Math.max(0, Math.ceil(near / 180) * 180); z < Math.min(far, END + 120); z += 180) kit.quad(g, -1800, 760, z, z + 6, line);
          // The canopy's faint blue shadow on the paving in front of the board.
          kit.quad(g, -1800, 760, END - 420, END + 120, kit.ink('--sea-sky'), 0.6);
          // The sea itself, past the railings.
          kit.quad(g, 770, 4000, near, far, kit.ink('--sea-ink-2'));
        }
      };
    }
  };
})();
