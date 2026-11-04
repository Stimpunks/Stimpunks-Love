/* =============================================================================
   Mycelium Munchies, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round one of the rest of the rooms, each its own world in card. On Cel
   Street it is a level of Arlesglad Caverns; on Paper Street it is reached by
   its address or the teleporter for now.

   IT IS THE MUSHROOM FARM'S WORLD AND NOBODY ELSE'S (§65): the growing rooms
   with a restaurant at the end of them. You come in between the farm's
   shelves, standing in the dark, the mushrooms on them in their own colours,
   and walk through to the pass: a steel counter with plates set on it, heat
   lamps low over them, and behind it, on the kitchen wall, the room's own
   page.

   THE ONLY LIGHT IS THE HEAT LAMPS, deep red, electric and not a flame, over
   the pass; nothing else glows and the farm behind stands in the dark. There
   is no wood (that is the Den and the Latibulum's), and nothing here is a
   field guide: the mushrooms are drawn as they grow on these shelves and are
   named nowhere in the scene. The kitchen composes every dish; there is
   nothing to build (that is Vital Plant Living). Nothing moves and the lamps
   do not flicker. Every colour is one §65 declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var CAPS = ['var(--myc-gold)', 'var(--myc-pink)', 'var(--myc-blue)', 'var(--myc-grey)', 'var(--myc-tan)', 'var(--myc-cream)'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }
  function seeded(n) {
    return function () {
      n = (n + 0x6D2B79F5) | 0;
      var t = Math.imul(n ^ (n >>> 15), 1 | n);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // A cluster of caps on a block of substrate: one kind to a block, as a
  // farm grows them.
  function cluster(s, r, x, base, ink) {
    s.appendChild(el('rect', { x: x - 40, y: base - 60, width: 80, height: 60, rx: 8, fill: 'var(--myc-pass)' }));
    for (var i = 0; i < 6; i++) {
      var cx = x - 30 + r() * 60, cy = base - 60 - r() * 30, rx = 10 + r() * 14;
      s.appendChild(el('rect', { x: cx - 3, y: cy, width: 6, height: base - 60 - cy + 4, fill: 'var(--myc-cream)' }));
      s.appendChild(el('path', { d: 'M' + (cx - rx) + ' ' + cy + ' A' + rx + ' ' + (rx * 0.7) + ' 0 0 1 ' + (cx + rx) + ' ' + cy + ' Z', fill: ink }));
    }
  }

  // A rack in the growing room: steel shelves, a block on each with its caps.
  function rack(r, w, h) {
    var s = svg(w, h), shelf = 190;
    for (var y = 120; y < h; y += shelf) {
      s.appendChild(el('rect', { x: 0, y: y, width: w, height: 10, fill: 'var(--myc-shelf)' }));
      for (var x = 70; x < w - 50; x += 130 + r() * 40) {
        if (r() < 0.15) continue;
        cluster(s, r, x, y, CAPS[Math.floor(r() * CAPS.length)]);
      }
    }
    s.appendChild(el('rect', { x: 0, y: 0, width: 12, height: h, fill: 'var(--myc-shelf)' }));
    s.appendChild(el('rect', { x: w - 12, y: 0, width: 12, height: h, fill: 'var(--myc-shelf)' }));
    return s;
  }

  // The pass: a steel counter, plates on it, and the heat lamps hung low over
  // it, red. The kitchen wall behind is where the page hangs.
  function pass(w, h, gap) {
    var s = svg(w, h), m = w / 2, top = h - 160;
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: 160, fill: 'var(--myc-steel)' }));
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: 10, fill: 'var(--myc-grey)' }));
    [-1, 1].forEach(function (side) {
      for (var k = 0; k < 3; k++) {
        var px = side < 0 ? m - gap / 2 - 120 - k * 220 : m + gap / 2 + 120 + k * 220;
        s.appendChild(el('ellipse', { cx: px, cy: top - 6, rx: 80, ry: 14, fill: 'var(--myc-cream)' }));
        s.appendChild(el('path', { d: 'M' + (px - 30) + ' ' + (top - 12) + ' A30 20 0 0 1 ' + (px + 30) + ' ' + (top - 12) + ' Z', fill: CAPS[(k * 2 + (side < 0 ? 0 : 1)) % 5] }));
        s.appendChild(el('ellipse', { cx: px, cy: top - 80, rx: 120, ry: 70, fill: 'var(--myc-lamp)', 'fill-opacity': '0.16' }));
        s.appendChild(el('rect', { x: px - 2, y: 0, width: 4, height: top - 190, fill: 'var(--myc-grey)' }));
        s.appendChild(el('path', { d: 'M' + (px - 50) + ' ' + (top - 150) + ' L' + (px - 24) + ' ' + (top - 192) + ' H' + (px + 24) + ' L' + (px + 50) + ' ' + (top - 150) + ' Z', fill: 'var(--myc-steel)', stroke: 'var(--myc-grey)', 'stroke-width': 3 }));
        s.appendChild(el('ellipse', { cx: px, cy: top - 150, rx: 40, ry: 8, fill: 'var(--myc-lamp)' }));
      }
    });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['mycelium-munchies.html'] = {
    prefix: 'myc-walk',
    from: 'arlesglad-caverns.html',
    build: function (kit) {
      var r = seeded(65);
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 3000 + F;                       // the pass
      var AISLE = 420, eye = sh / 2, RH = sh + 300;
      var decor = [];

      for (var z = 300; z < END - F - 200; z += 640) {
        [-1, 1].forEach(function (side) {
          decor.push(kit.item(rack(r, 600, RH), { x: side * AISLE, z: z + 300, w: 600, h: RH, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
        });
      }
      decor.push(kit.item(pass(AISLE * 2 + 1800, sh + 260, sw), { x: 0, z: END + 20, w: AISLE * 2 + 1800, h: sh + 260 }));

      var page = kit.screen(kit.page, 'Mycelium Munchies’ own page, on the kitchen wall behind the pass');
      var wall = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'myc-walk-wall' });

      var stops = [
        kit.stop({ name: 'in the growing rooms, the farm’s shelves standing in the dark either side', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at a rack, its blocks putting up caps in every colour the farm grows', spot: { x: -AISLE + 380, z: 1260, yaw: -kit.LEFT } }),
        kit.stop({ name: 'at the pass, under the heat lamps, with the room’s own page on the kitchen wall', spot: { x: 0, z: END - F }, link: page }, wall)
      ];

      return {
        cls: 'myc-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Through the growing rooms to the pass; its own page is on the kitchen wall behind it, under the heat lamps.',
        bounds: function () { return { x: [-AISLE + 200, AISLE - 200], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--myc-dark'));
          // A drain down the middle of the growing rooms, and the lamps' red
          // lying on the floor at the pass and nowhere else.
          kit.quad(g, -14, 14, 0, END - F, kit.ink('--myc-shelf'));
          kit.oval(g, 0, END - 200, 1100, 360, kit.ink('--myc-lamp'), 0.12);
        }
      };
    }
  };
})();
