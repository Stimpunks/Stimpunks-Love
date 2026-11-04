/* =============================================================================
   Stay Breezy, walked into on Paper Street: the hall of fans behind Stay
   Frosty. Ryan's ask, 2026-11-04: round 1 of the rooms you can walk into.

   IT IS STAY FROSTY'S OPPOSITE ON PURPOSE (§64), and the scene keeps it so.
   Frosty is dark, cool and wet, lit by reflections in points, with nothing to
   press and no sound. This is a pale, warm, dry hall full of fans: ceiling
   fans down the middle, each with its lamp hung UNDER its hub, so the blades
   never pass between you and the light, and floor fans in their cages standing
   along both walls. Each lamp lays a warm pool on the floor straight under it.
   The room's own page stands on a card at the end of the hall, and every fan
   that sounds is on it, switched on only by a press, exactly as on the page.

   THE SCENE DRAWS EVERY FAN STILL, at every setting: nothing here turns and
   nothing hums. No fan is named for who made it, and none is for sleep, focus
   or anything else. Every colour is one §64 declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Paper
   Street's screen(). tools/make-paper-street.py holds each of those.
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

  // A ceiling fan seen from across the hall: a rod down from the ceiling, the
  // hub, two blades out flat either side, and the lamp hung under the hub.
  function ceilingFan(w, h) {
    var s = svg(w, h), cx = w / 2, hub = h * 0.5;
    s.appendChild(el('rect', { x: cx - 5, y: 0, width: 10, height: hub, fill: 'var(--bz-cage)' }));
    s.appendChild(el('path', { fill: 'var(--bz-blade)', d: 'M' + (cx - 30) + ' ' + (hub - 6) + ' L20 ' + (hub - 18) + ' Q6 ' + hub + ' 20 ' + (hub + 14) + ' L' + (cx - 30) + ' ' + (hub + 8) + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--bz-blade)', d: 'M' + (cx + 30) + ' ' + (hub - 6) + ' L' + (w - 20) + ' ' + (hub - 18) + ' Q' + (w - 6) + ' ' + hub + ' ' + (w - 20) + ' ' + (hub + 14) + ' L' + (cx + 30) + ' ' + (hub + 8) + ' Z' }));
    s.appendChild(el('ellipse', { cx: cx, cy: hub, rx: 44, ry: 22, fill: 'var(--bz-ink-2)' }));
    s.appendChild(el('rect', { x: cx - 3, y: hub + 20, width: 6, height: 40, fill: 'var(--bz-cage)' }));
    s.appendChild(el('path', { fill: 'var(--bz-lamp)', d: 'M' + (cx - 40) + ' ' + (hub + 60) + ' H' + (cx + 40) + ' L' + (cx + 26) + ' ' + (hub + 110) + ' H' + (cx - 26) + ' Z' }));
    return s;
  }

  // A floor fan on its stand: a round cage, the blades still behind the wires,
  // and a ribbon tied to the front of the cage, hanging.
  function floorFan(w, h) {
    var s = svg(w, h), cx = w / 2, r = w / 2 - 8, cy = r + 8;
    for (var i = 0; i < 3; i++) {
      var a = i / 3 * Math.PI * 2 - Math.PI / 2;
      s.appendChild(el('ellipse', { cx: cx + Math.cos(a) * r * 0.45, cy: cy + Math.sin(a) * r * 0.45, rx: r * 0.42, ry: r * 0.24, fill: 'var(--bz-blade)' }));
    }
    s.appendChild(el('circle', { cx: cx, cy: cy, r: r * 0.16, fill: 'var(--bz-ink-2)' }));
    s.appendChild(el('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: 'var(--bz-cage)', 'stroke-width': 8 }));
    for (var k = 0; k < 12; k++) {
      var b = k / 12 * Math.PI * 2;
      s.appendChild(el('line', { x1: cx, y1: cy, x2: cx + Math.cos(b) * r, y2: cy + Math.sin(b) * r, stroke: 'var(--bz-cage)', 'stroke-width': 2 }));
    }
    s.appendChild(el('path', { d: 'M' + cx + ' ' + (cy + r * 0.16) + ' q-10 60 6 120', fill: 'none', stroke: 'var(--bz-ribbon)', 'stroke-width': 6 }));
    s.appendChild(el('rect', { x: cx - 8, y: cy + r, width: 16, height: h - cy - r - 20, fill: 'var(--bz-cage)' }));
    s.appendChild(el('ellipse', { cx: cx, cy: h - 14, rx: w * 0.36, ry: 14, fill: 'var(--bz-ink-2)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['stay-breezy.html'] = {
    prefix: 'bz-walk',
    from: 'stay-frosty.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 2600 + F;                       // the card at the end of the hall
      var eye = sh / 2, decor = [], under = [];
      var CEIL = Math.max(sh + 260, 820);

      for (var z = 700; z < END - 300; z += 700) {
        decor.push(kit.item(ceilingFan(640, 320), { x: 0, z: z, w: 640, h: 320, y: CEIL - 320 }));
        under.push(z);
      }
      var fans = [];
      for (z = 500; z < END - 200; z += 560) {
        [-1, 1].forEach(function (side) {
          var f = kit.item(floorFan(240, 520), { x: side * 640, z: z, w: 240, h: 520, turn: side < 0 ? kit.LEFT : kit.RIGHT });
          decor.push(f); fans.push(f);
        });
      }

      var page = kit.screen(kit.page, 'Stay Breezy’s own page, on a card at the end of the hall');
      var card = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'bz-walk-card' });

      var stops = [
        kit.stop({ name: 'at the way in from Stay Frosty, where the air starts to move', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'under the ceiling fans, in the pool of a lamp hung under one', spot: { x: 0, z: under[1] - 200 } }),
        kit.stop({ name: 'by the floor fans along the wall, each still in its cage', spot: kit.front(fans[2], 900) }, fans[2]),
        kit.stop({ name: 'at the end of the hall, with the room’s own page on its card', spot: { x: 0, z: END - F }, link: page }, card)
      ];

      return {
        cls: 'bz-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on a card at the end of the hall, and nothing in here sounds until you press it.',
        bounds: function () { return { x: [-480, 480], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--bz-wall'));
          var seam = kit.ink('--bz-on');
          for (var x = -760; x <= 760; x += 190) kit.quad(g, x - 3, x + 3, Math.max(0, near), Math.min(far, END + 40), seam);
          // The lamps' pools on the floor, straight under each fan.
          under.forEach(function (uz) {
            kit.oval(g, 0, uz, 360, 240, kit.ink('--bz-lamp'), 0.35);
            kit.oval(g, 0, uz, 200, 130, kit.ink('--bz-lamp'), 0.3);
          });
        }
      };
    }
  };
})();
