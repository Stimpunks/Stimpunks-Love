/* =============================================================================
   World, walked into on Paper Street, past the Garden on the garden spider's
   web. Ryan's ask, 2026-11-04: round 1 of the rooms you can walk into, down
   the rest of the street.

   WEBS CONNECTING GARDENS AROUND THE WORLD (§119). There is no ground here:
   the floor is the same deep sky as everything behind, and you walk along the
   air between webs strung on both sides, each an orb of silk tied at its
   corners to a garden hanging in the air, every room on the street a garden on
   it. At the end the biggest web hangs across the way, the garden spider at
   its hub, drawn in this room's inks and saying nothing (in the Garden it is
   the careful guide to /ask/), and under the hub, hung from its threads on a
   panel, is the room's own page.

   THE LIGHT IS THE DAWN, ALWAYS ARRIVING SOMEWHERE IN THE WORLD, and it comes
   in level from the left, so it lights the silk along its length on that side
   and has not reached the other: the webs on the left are lit thread by
   thread and the ones on the right are still the dark silk, and on the big web
   the light gets halfway. Dew on a thread is the thread's, catching what the
   thread catches. If this room ever gets a ground or a midday, it has become
   the Garden at a different hour.

   NOTHING MOVES, and nothing is counted. Every colour is one §119 declares, by
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
  function sized(s, w, h) { s.setAttribute('width', w); s.setAttribute('height', h); return s; }

  // A garden hanging in the air where a web is tied: a tuft of leaves and a
  // few flowers, nothing under it.
  function garden(s, x, y, r) {
    [[-1, 0.2], [0, -0.3], [1, 0.1], [-0.5, -0.6], [0.6, -0.5]].forEach(function (p, i) {
      s.appendChild(el('ellipse', { cx: x + p[0] * r * 0.6, cy: y + p[1] * r * 0.6, rx: r * 0.45, ry: r * 0.3, fill: 'var(' + (i % 2 ? '--www-moss' : '--www-leaf') + ')' }));
    });
    [[-0.3, -0.5], [0.4, -0.2], [0, 0.1]].forEach(function (p) {
      s.appendChild(el('circle', { cx: x + p[0] * r, cy: y + p[1] * r, r: r * 0.1, fill: 'var(--www-visited)' }));
    });
  }

  // An orb web: spokes from the hub to the frame, the sticky spiral round and
  // round, tied at its corners to gardens. lit(x) says whether the dawn has
  // reached that part of it yet.
  function web(w, h, hub, lit, spider) {
    var s = svg(w, h), cx = hub[0], cy = hub[1];
    var corners = [[w * 0.06, h * 0.08], [w * 0.94, h * 0.12], [w * 0.92, h * 0.9], [w * 0.08, h * 0.86]];
    function silk(x0, y0, x1, y1, width) {
      var on = lit((x0 + x1) / 2);
      s.appendChild(el('path', { d: 'M' + x0 + ' ' + y0 + ' L' + x1 + ' ' + y1, stroke: 'var(' + (on ? '--www-glint' : '--www-thread') + ')', 'stroke-width': width }));
    }
    // The frame lines between the corners, and the spokes out to it.
    corners.forEach(function (c, i) { var d = corners[(i + 1) % 4]; silk(c[0], c[1], d[0], d[1], 5); });
    var spokes = 22, ends = [];
    for (var i = 0; i < spokes; i++) {
      var a = i / spokes * Math.PI * 2, dx = Math.cos(a), dy = Math.sin(a), t = 1e9;
      // Out to the frame: the nearest of the four frame lines along this way.
      corners.forEach(function (c, j) {
        var d = corners[(j + 1) % 4], ex = d[0] - c[0], ey = d[1] - c[1];
        var den = dx * ey - dy * ex;
        if (Math.abs(den) < 1e-6) return;
        var u = ((c[0] - cx) * ey - (c[1] - cy) * ex) / den, v = ((c[0] - cx) * dy - (c[1] - cy) * dx) / den;
        if (u > 0 && v >= 0 && v <= 1) t = Math.min(t, u);
      });
      ends.push([cx + dx * t, cy + dy * t]);
      silk(cx, cy, cx + dx * t, cy + dy * t, 3);
    }
    // The spiral, a ring at a time, and a bead of dew here and there on it.
    for (var ring = 1; ring < 16; ring++) {
      var k = ring / 16;
      for (var j = 0; j < spokes; j++) {
        var p = ends[j], q = ends[(j + 1) % spokes];
        var x0 = cx + (p[0] - cx) * k, y0 = cy + (p[1] - cy) * k, x1 = cx + (q[0] - cx) * (k + 1 / 16 / spokes), y1 = cy + (q[1] - cy) * (k + 1 / 16 / spokes);
        silk(x0, y0, x1, y1, 2);
        if ((ring * 7 + j * 3) % 11 === 0) {
          s.appendChild(el('circle', { cx: x0, cy: y0, r: 6, fill: 'var(' + (lit(x0) ? '--www-bead' : '--www-dim') + ')' }));
        }
      }
    }
    corners.forEach(function (c) { garden(s, c[0], c[1], Math.min(w, h) * 0.09); });
    if (spider) {
      // The garden spider at the hub, in this room's inks: eight legs, a
      // body, and nothing said.
      for (var l = 0; l < 8; l++) {
        var side = l < 4 ? -1 : 1, n = l % 4, ang = (-0.9 + n * 0.55);
        var kx = cx + side * Math.cos(ang) * 70, ky = cy + Math.sin(ang) * 70;
        s.appendChild(el('path', { d: 'M' + cx + ' ' + cy + ' L' + kx + ' ' + (ky - 30) + ' L' + (cx + side * Math.cos(ang) * 130) + ' ' + (cy + Math.sin(ang) * 130 + 20), fill: 'none', stroke: 'var(--www-dim)', 'stroke-width': 8 }));
      }
      s.appendChild(el('ellipse', { cx: cx, cy: cy + 46, rx: 40, ry: 56, fill: 'var(--www-body)', stroke: 'var(--www-dim)', 'stroke-width': 6 }));
      s.appendChild(el('circle', { cx: cx, cy: cy - 12, r: 26, fill: 'var(--www-body)', stroke: 'var(--www-dim)', 'stroke-width': 6 }));
      s.appendChild(el('path', { d: 'M' + (cx - 16) + ' ' + (cy + 30) + ' L' + cx + ' ' + (cy + 52) + ' L' + (cx + 16) + ' ' + (cy + 30), fill: 'none', stroke: 'var(--www-dawn)', 'stroke-width': 4 }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['world.html'] = {
    prefix: 'www-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var END = 2800 + F;                       // where the biggest web hangs
      var eye = sh / 2, k = eye / 520, GAP = 620;
      var decor = [];
      var put = function (s, w, h, o) {
        o.w = w * k; o.h = h * k; o.y = (o.y || 0) * k;
        return kit.item(sized(s, o.w, o.h), o);
      };
      var all = function () { return true; }, none = function () { return false; };

      // Webs down both sides of the way, the left ones lit by the dawn and the
      // right ones not yet.
      [[-1, 900], [1, 1300], [-1, 2300], [1, 2700]].forEach(function (p) {
        decor.push(put(web(1500, 1400, [760, 640], p[0] < 0 ? all : none), 1500, 1400,
          { x: p[0] * GAP, z: p[1], y: 120, turn: p[0] < 0 ? kit.LEFT : kit.RIGHT }));
      });
      // The biggest web across the end, the spider at its hub over the page,
      // and the dawn halfway across it.
      var bw = 3600, bh = 2400, hubY = 2400 - (sh / k + 360);
      decor.push(put(web(bw, bh, [bw / 2, Math.max(260, hubY)], function (x) { return x < bw * 0.48; }, true), bw, bh, { x: 0, z: END + 40 }));

      var page = kit.screen(kit.page, 'The World room’s own page, hung from the biggest web');
      var panel = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'www-walk-panel' });

      var stops = [
        kit.stop({ name: 'at the edge of the webs, the dawn coming in level from your left', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'between the webs, the left ones lit along every thread and the right ones still dark', spot: { x: 0, z: 1800 - F * 0.4 } }),
        kit.stop({ name: 'under the garden spider at the hub, with the room’s own page hung from its web', spot: { x: 0, z: END - F }, link: page }, panel)
      ];

      return {
        cls: 'www-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'There is no ground; the way runs between webs to the biggest one, with its own page hung under the spider.',
        bounds: function () { return { x: [-GAP + 160, GAP - 160], z: [0, END - F] }; },
        // No ground: the floor is the same sky as everything behind it.
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--www-sky'));
        }
      };
    }
  };
})();
