/* =============================================================================
   The Cave, walked into on Paper Street. Ryan's call, 2026-11-04: round one of
   the rooms you can walk into, the Cave behind Cavendish Coworking's door
   among them.

   IT IS THE CAVE'S WORLD AND NOBODY ELSE'S (§76): inside the ice, the Quiet
   Room, for quiet co-presence with no spoken chat; a cave is David Thornburg's
   name for the place you go to be alone with a thought. THE LIGHT IS IN THE
   WALLS: there is no lamp, no opening and no source you could point at. The
   day outside comes in through the ice itself, so the walls glow deep blue
   where the ice is thick and brighter where it thins, and a crack shows as a
   line of near-white. You walk in along the tunnel to a ledge in the ice
   wall at the end, which holds the room's own page, full size once you stand
   at it.

   Stay Frosty is the collapse to watch: dark wet rock lit by glints of a rail.
   Nothing glows there, and here the walls are the light. It shares nothing
   with the house it is behind, green Georgian daylight and shut doors. Nothing
   moves. Every colour is one §76 declares, by name. It keeps nothing, sends
   nothing and fetches nothing; its page arrives through Paper Street's
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

  // A wall of ice: deep blue where it is thick, patches where it thins and the
  // day comes through brighter, and cracks of near-white, the same every
  // visit. `hole` is where a ledge is cut into it for the page.
  function ice(w, h, seed, hole) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cv-deep)' }));
    for (var k = seed; k < seed + w / 60; k++) {
      var cx = (k * 197) % w, cy = (k * 89) % h;
      s.appendChild(el('ellipse', { cx: cx, cy: cy, rx: 120 + (k * 41) % 200, ry: 80 + (k * 23) % 160, fill: 'var(--cv-thin)', 'fill-opacity': '0.3' }));
      if (k % 3 === 0) s.appendChild(el('ellipse', { cx: cx + 30, cy: cy - 10, rx: 50 + (k * 7) % 60, ry: 36, fill: 'var(--cv-glow)', 'fill-opacity': '0.5' }));
    }
    for (k = seed; k < seed + w / 300; k++) {
      var x = (k * 263) % w, y = (k * 151) % (h * 0.6);
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--cv-crack)', 'stroke-width': 4,
        d: 'M' + x + ' ' + y + ' l' + (30 + k % 5 * 12) + ' ' + (80 + k % 3 * 30) + ' l' + (-40 + k % 4 * 18) + ' ' + (70 + k % 2 * 50) + ' l' + (20 + k % 3 * 10) + ' 60' }));
    }
    if (hole) {
      s.appendChild(el('rect', { x: hole[0], y: hole[1], width: hole[2], height: hole[3], rx: 30, fill: 'var(--cv-shelf)' }));
      s.appendChild(el('rect', { x: hole[0] - 20, y: hole[1] + hole[3] - 16, width: hole[2] + 40, height: 30, rx: 10, fill: 'var(--cv-seam)' }));
    }
    return s;
  }

  // A pillar of ice standing in the tunnel, glowing up its middle where it is
  // thinnest.
  function pillar(w, h) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('path', { fill: 'var(--cv-seam)', d: 'M' + (m - w * 0.3) + ' ' + h + ' Q' + (m - w * 0.5) + ' ' + (h / 2) + ' ' + (m - w * 0.2) + ' 0 H' + (m + w * 0.2) + ' Q' + (m + w * 0.5) + ' ' + (h / 2) + ' ' + (m + w * 0.3) + ' ' + h + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--cv-thin)', d: 'M' + (m - w * 0.12) + ' ' + h + ' Q' + (m - w * 0.2) + ' ' + (h / 2) + ' ' + (m - w * 0.06) + ' 0 H' + (m + w * 0.06) + ' Q' + (m + w * 0.2) + ' ' + (h / 2) + ' ' + (m + w * 0.12) + ' ' + h + ' Z' }));
    s.appendChild(el('rect', { x: m - 3, y: h * 0.1, width: 6, height: h * 0.5, fill: 'var(--cv-crack)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['cavendish-cave.html'] = {
    prefix: 'cv-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var END = 2800 + F;                       // where the ledge is cut into the ice
      var eye = sh / 2, SIDE = 640;
      var decor = [];
      var WH = sh + 700, EW = 3400;

      decor.push(kit.item(ice(EW, WH, 3, [EW / 2 - sw / 2 - 40, WH - sh - 40, sw + 80, sh + 40]), { x: 0, z: END + 30, w: EW, h: WH }));
      var page = kit.screen(kit.page, 'The Cave’s own page, on a ledge in the ice wall');
      var ledge = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'cv-walk-ledge' });
      var len = END + 30;
      [-1, 1].forEach(function (k) {
        decor.push(kit.item(ice(len, WH, k < 0 ? 11 : 29), { x: k * SIDE, z: len / 2, w: len, h: WH, turn: k < 0 ? kit.LEFT : kit.RIGHT }));
      });
      decor.push(kit.item(pillar(240, 900), { x: -360, z: 1500, w: 240, h: 900 }));
      decor.push(kit.item(pillar(200, 820), { x: 400, z: 2200, w: 200, h: 820 }));

      var stops = [
        kit.stop({ name: 'at the mouth of the tunnel, the ice glowing all round you', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'deep in the ice, where the walls thin and glow brighter', spot: { x: 0, z: (END - F) * 0.55 } }),
        kit.stop({ name: 'at the ledge in the ice wall, with the Cave’s own page on it', spot: { x: 0, z: END - F }, link: page }, ledge)
      ];

      return {
        cls: 'cv-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The light in here comes through the ice itself. The Cave’s own page is on a ledge in the ice wall at the end.',
        bounds: function () { return { x: [-SIDE + 240, SIDE - 240], z: [0, END - F] }; },
        // A floor of ice, its seams, and the walls' glow along its edges.
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--cv-shelf'));
          var seam = kit.ink('--cv-seam'), z0 = Math.max(from, 0), z1 = Math.min(to, END + 30);
          for (var z = Math.ceil(z0 / 300) * 300; z < z1; z += 300) kit.quad(g, -SIDE, SIDE, z, z + 8, seam);
          kit.quad(g, -SIDE, -SIDE + 180, z0, z1, kit.ink('--cv-thin'), 0.4);
          kit.quad(g, SIDE - 180, SIDE, z0, z1, kit.ink('--cv-thin'), 0.4);
        }
      };
    }
  };
})();
