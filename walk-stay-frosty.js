/* =============================================================================
   Stay Frosty, walked into on Paper Street: the bottom of Arlesglad Caverns.
   Ryan's ask, 2026-11-04: round 1 of the rooms you can walk into.

   IT IS THE ROOM'S OWN WORLD (§63): the bottom of the caverns, where nothing
   changes. A low chamber of wet blue-grey rock, with no lamp in it and no lamp
   anywhere you can see. THE LIGHT IS REFLECTED, IN POINTS: the handrail is up
   the slope behind you, and what reaches the bottom is its reflection in every
   bead of damp on the rock, so the walls, the hanging stone and the floor
   carry many small copies of one light, each a point in the rail's own warm
   white (--cav-rail, the only warm value here, used only where the rail's light
   would land), and the dimmer beads carry none. Never a pool, a wedge or a
   gradient: if a glow ever gathers in here it has become a room with a lamp in
   it. The room's own page is on a flat face of the rock at the far end, and
   the door through to Stay Breezy beside it is shut, as the page says: a plain
   door of the rock's own dark with its name on it in the room's frost, and the
   way in to the hall of fans when you press it.

   NOTHING MOVES, NOTHING MAKES A SOUND and there is nothing to press in the
   scene, at any setting. The temperature is never written in this file; it is
   on the page, which writes it from the one place it lives. Nothing here says
   what the room or the cold does for a body. Every colour is one §63 declares,
   and the rail's, by name. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Paper Street's screen().
   tools/make-paper-street.py holds each of those.
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

  // Beads of damp on a face of rock: most dim, a few carrying the rail's light.
  function beads(s, r, x0, y0, w, h, n) {
    for (var i = 0; i < n; i++) {
      var lit = r() < 0.22;
      s.appendChild(el('circle', { cx: x0 + r() * w, cy: y0 + r() * h, r: lit ? 2.5 + r() * 2 : 2 + r() * 3,
        fill: lit ? 'var(--cav-rail)' : 'var(--fro-bead)' }));
    }
  }

  // A wall of the chamber: rock in ragged courses, darker ledges, beads.
  function rockWall(r, w, h) {
    var s = svg(w, h), d = 'M0 ' + h + ' V' + (h * 0.12);
    for (var x = 0; x <= w; x += 80) d += ' L' + x + ' ' + (h * (0.04 + r() * 0.14));
    d += ' V' + h + ' Z';
    s.appendChild(el('path', { d: d, fill: 'var(--fro-ledge)' }));
    for (var y = h * 0.3; y < h; y += 90 + r() * 80) {
      var ld = 'M0 ' + y;
      for (x = 0; x <= w; x += 120) ld += ' L' + x + ' ' + (y + (r() - 0.5) * 30);
      s.appendChild(el('path', { d: ld, fill: 'none', stroke: 'var(--fro-rock)', 'stroke-width': 10 }));
    }
    beads(s, r, 20, h * 0.2, w - 40, h * 0.75, Math.round(w / 9));
    return s;
  }

  // Stone hanging from the low ceiling, each tip with a bead on it.
  function hanging(r, w, h) {
    var s = svg(w, h), d = 'M0 0 H' + w + ' V30';
    var tips = [];
    for (var x = w; x > 0; x -= 60 + r() * 50) {
      var deep = 60 + r() * (h - 80);
      d += ' L' + (x - 22) + ' ' + deep + ' L' + (x - 44) + ' 30';
      tips.push([x - 22, deep]);
    }
    d += ' L0 30 Z';
    s.appendChild(el('path', { d: d, fill: 'var(--fro-ledge)' }));
    tips.forEach(function (t) {
      s.appendChild(el('circle', { cx: t[0], cy: t[1] + 4, r: 3.5, fill: r() < 0.4 ? 'var(--cav-rail)' : 'var(--fro-bead)' }));
    });
    return s;
  }

  // The end of the chamber: rock round the flat face the page is on.
  function endWall(r, w, h) {
    return rockWall(r, w, h);
  }

  // The shut door through to Stay Breezy, set in the rock beside the page: the
  // rock's own dark in a frame of the damp beads' grey, a handle, and a bead or
  // two of the rail's light on the frame. Its name is lettered on it by
  // kit.door, in the room's frost, where nothing lights it up.
  function door(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 4, y: 4, width: w - 8, height: h - 4, rx: 10, fill: 'var(--fro-rock)', stroke: 'var(--fro-bead)', 'stroke-width': 8 }));
    s.appendChild(el('rect', { x: 22, y: 24, width: w - 44, height: h * 0.5, rx: 6, fill: 'none', stroke: 'var(--fro-ledge)', 'stroke-width': 6 }));
    s.appendChild(el('circle', { cx: w - 34, cy: h * 0.62, r: 9, fill: 'var(--fro-bead)' }));
    s.appendChild(el('circle', { cx: 6, cy: h * 0.3, r: 3, fill: 'var(--cav-rail)' }));
    s.appendChild(el('circle', { cx: w - 6, cy: h * 0.82, r: 3, fill: 'var(--cav-rail)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['stay-frosty.html'] = {
    prefix: 'fro-walk',
    from: 'arlesglad-caverns.html',
    build: function (kit) {
      var r = seeded(63);
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 2000 + F;                       // the flat face of the rock
      var eye = sh / 2, decor = [];
      var CEIL = Math.max(sh + 160, 760);

      [-1, 1].forEach(function (side) {
        decor.push(kit.item(rockWall(r, END + 400, CEIL), { x: side * 760, z: (END + 400) / 2, w: END + 400, h: CEIL, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      for (var z = 300; z < END - 200; z += 420) {
        decor.push(kit.item(hanging(r, 1520, 220), { x: 0, z: z, w: 1520, h: 220, y: CEIL - 220 }));
      }
      var back = kit.item(endWall(r, 2000, CEIL), { x: 0, z: END + 30, w: 2000, h: CEIL });
      decor.push(back);

      // The door beside the page, made first so the keyboard meets it before
      // it goes into the page and its long list of links.
      var through = kit.door('stay-breezy.html', { art: door(220, 460), no: 'Through the door at the back', label: 'fro-walk-way', cls: 'fro-walk-door',
                                                   x: sw / 2 + 126, z: END + 16, w: 220, h: 460 });
      decor.push(through);
      var page = kit.screen(kit.page, 'Stay Frosty’s own page, on a flat face of the rock');
      var face = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'fro-walk-face' });

      var stops = [
        kit.stop({ name: 'at the foot of the slope, the rail’s light behind you', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'in the middle of the chamber, under the hanging stone', spot: { x: 0, z: END * 0.45 } }),
        kit.stop({ name: 'at the door at the back, shut, through to Stay Breezy, the hall of fans', spot: kit.front(through), link: through.link }, through),
        kit.stop({ name: 'at the flat face of the rock, with the room’s own page on it', spot: { x: 0, z: END - F }, link: page }, face)
      ];

      return {
        cls: 'fro-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on a flat face of the rock at the far end, and nothing in here moves.',
        bounds: function () { return { x: [-560, 660], z: [0, END - F * 0.9] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--fro-rock'));
          kit.quad(g, -760, 760, 0, END + 40, kit.ink('--fro-ledge'), 0.6);
          // Beads on the floor too, the rail's light in a few of them.
          var lit = seeded(68), bead = kit.ink('--fro-bead'), rail = kit.ink('--cav-rail');
          for (var q = 0; q < 500; q++) {
            var qx = -740 + lit() * 1480, qz = lit() * (END + 20), on = lit() < 0.12;
            if (qz < near || qz > far) continue;
            kit.oval(g, qx, qz, on ? 6 : 8, on ? 4 : 5, on ? rail : bead, on ? 1 : 0.7);
          }
        }
      };
    }
  };
})();
