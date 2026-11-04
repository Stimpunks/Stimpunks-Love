/* =============================================================================
   Widdershins, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1 of
   the rooms you can walk into, down the rest of the street.

   A CROOKED CITY WITH THE MORNING HALFWAY ACROSS IT (§135). You come out on a
   cobbled quay on the night side of a river too thick to drown in, and across
   it the city stands on the far bank as one long flat of card: crooked houses
   built on top of each other, a thin tower, and a clacks tower with its
   shutters. Morning is slow on the Disc, so it is caught halfway: the city is
   cut twice, at night and lit, and the lit one is clipped to one side of a
   slanting line, plaster pale and tiles red past it and everything this side
   of it still night, the sky split the same way. That line is the only light
   in the room. A compass on a post in the night half has its widdershins arm
   pointing into the morning, and the stops go along the quay right to left:
   widdershins.

   EVERY WORD IS ON THE NIGHT SIDE. The room's own page stands on a board on
   the quay with the night half of the city behind it, and none of it is in
   the morning. OOOK IS THE ONE TO WATCH: the Disc from out in the dark. This is
   on the ground, in a city, and it never draws the Disc, a turtle or an
   elephant; nobody is in the city, the windows are dark because nobody has lit
   a lamp, and there is no map, crest or character of anybody's, only crooked
   roofs anybody might draw.

   NOTHING MOVES: the morning stays halfway. Every colour is one §135
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
  function sized(s, w, h) { s.setAttribute('width', w); s.setAttribute('height', h); return s; }
  // The same city every visit: a small fixed-seed generator.
  function seeded(n) {
    return function () {
      n = (n + 0x6D2B79F5) | 0;
      var t = Math.imul(n ^ (n >>> 15), 1 | n);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // The city across the river, cut twice from one plan, the night half and the
  // lit half; edge is where the morning crosses the bank, and it leans back
  // over the city by slant for every unit of height.
  function city(w, h, edge, slant) {
    var s = svg(w, h), r = seeded(135), houses = [];
    var bank = h - 90;
    for (var x = -40; x < w; ) {
      var hw = 120 + r() * 180, hh = 260 + r() * 420, lean = (r() - 0.5) * 50;
      houses.push({ x: x, w: hw, h: hh, lean: lean, roof: 60 + r() * 120, up: r() < 0.45 ? 80 + r() * 160 : 0, win: Math.floor(r() * 3) + 1 });
      x += hw * (0.7 + r() * 0.25);
    }
    var tower = w * 0.28, clacks = w * 0.66;
    function cut(sky, wall, roof) {
      var g = el('g', {});
      g.appendChild(el('rect', { x: 0, y: 0, width: w, height: bank, fill: 'var(' + sky + ')' }));
      // The thin tower far off, and the clacks tower with its shutters.
      g.appendChild(el('path', { d: 'M' + (tower - 30) + ' ' + bank + ' L' + (tower - 16) + ' ' + (bank - 1500) + ' L' + tower + ' ' + (bank - 1620) + ' L' + (tower + 16) + ' ' + (bank - 1500) + ' L' + (tower + 30) + ' ' + bank + ' Z', fill: 'var(' + wall + ')' }));
      g.appendChild(el('rect', { x: clacks - 18, y: bank - 1200, width: 36, height: 1200, fill: 'var(' + roof + ')' }));
      for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) {
        g.appendChild(el('rect', { x: clacks - 66 + i * 46, y: bank - 1330 + j * 46, width: 36, height: 36, fill: 'var(' + (((i + j) % 2) ? wall : '--wds-window') + ')' }));
      }
      houses.forEach(function (o) {
        var b = bank, t = b - o.h - o.up;
        var d = 'M' + o.x + ' ' + b + ' L' + (o.x + o.lean) + ' ' + t + ' L' + (o.x + o.w + o.lean) + ' ' + t + ' L' + (o.x + o.w) + ' ' + b + ' Z';
        g.appendChild(el('path', { d: d, fill: 'var(' + wall + ')' }));
        g.appendChild(el('path', { d: 'M' + (o.x + o.lean - 14) + ' ' + t + ' L' + (o.x + o.w * 0.45 + o.lean * 1.4) + ' ' + (t - o.roof) + ' L' + (o.x + o.w + o.lean + 14) + ' ' + t + ' Z', fill: 'var(' + roof + ')' }));
        for (var k = 0; k < o.win; k++) {
          g.appendChild(el('rect', { x: o.x + o.lean * 0.5 + 24 + k * (o.w - 48) / o.win, y: t + 50 + (k % 2) * 60, width: 26, height: 40, fill: 'var(--wds-window)' }));
        }
      });
      // The far bank, where the city's feet are in the river.
      g.appendChild(el('rect', { x: 0, y: bank, width: w, height: h - bank, fill: 'var(' + (sky === '--wds-sky-day' ? '--wds-ankh-crust-day' : '--wds-ankh-crust') + ')' }));
      return g;
    }
    s.appendChild(cut('--wds-sky-night', '--wds-wall-night', '--wds-roof-night'));
    var clip = el('clipPath', { id: 'wdsw-morning' });
    var top = edge - slant * h;
    clip.appendChild(el('path', { d: 'M' + edge + ' ' + h + ' L' + top + ' 0 H' + w + ' V' + h + ' Z' }));
    s.appendChild(clip);
    var day = cut('--wds-sky-day', '--wds-wall-day', '--wds-roof-day');
    day.setAttribute('clip-path', 'url(#wdsw-morning)');
    s.appendChild(day);
    // The morning's edge itself, a hard line from the bank up the sky.
    s.appendChild(el('path', { d: 'M' + edge + ' ' + h + ' L' + top + ' 0', stroke: 'var(--wds-edge)', 'stroke-width': 10 }));
    return s;
  }

  // The river wall along the quay: stone in courses, nothing lit on it.
  function riverWall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--wds-slab)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 18, fill: 'var(--wds-line)' }));
    for (var y = 18; y < h; y += 46) {
      s.appendChild(el('rect', { x: 0, y: y, width: w, height: 3, fill: 'var(--wds-line)' }));
      for (var x = (y / 46) % 2 ? 0 : 70; x < w; x += 140) s.appendChild(el('rect', { x: x, y: y, width: 3, height: 46, fill: 'var(--wds-line)' }));
    }
    return s;
  }

  // The compass on its post, in the night half, its widdershins arm the long
  // one in the dawn's colour, pointing into the morning.
  function compass(w, h) {
    var s = svg(w, h), cx = w / 2, cy = w / 2, r = w / 2 - 20;
    s.appendChild(el('rect', { x: cx - 10, y: cy, width: 20, height: h - cy, fill: 'var(--wds-line)' }));
    s.appendChild(el('circle', { cx: cx, cy: cy, r: r, fill: 'var(--wds-slab)', stroke: 'var(--wds-brass)', 'stroke-width': 12 }));
    [[0, -1], [0, 1], [-1, 0]].forEach(function (d) {
      s.appendChild(el('path', { d: 'M' + (cx - d[1] * 12) + ' ' + (cy + d[0] * 12) + ' L' + (cx + d[0] * r * 0.7) + ' ' + (cy + d[1] * r * 0.7) + ' L' + (cx + d[1] * 12) + ' ' + (cy - d[0] * 12) + ' Z', fill: 'var(--wds-brass)' }));
    });
    s.appendChild(el('path', { d: 'M' + cx + ' ' + (cy - 16) + ' L' + (cx + r * 0.95) + ' ' + cy + ' L' + cx + ' ' + (cy + 16) + ' Z', fill: 'var(--wds-dawn)' }));
    s.appendChild(el('circle', { cx: cx, cy: cy, r: 12, fill: 'var(--wds-ink)' }));
    return s;
  }

  // A mooring post at the river wall, iron gone the colour of the night.
  function bollard(w, h) {
    var s = svg(w, h);
    s.appendChild(el('path', { d: 'M' + (w * 0.2) + ' ' + h + ' V' + (h * 0.3) + ' Q' + (w / 2) + ' 0 ' + (w * 0.8) + ' ' + (h * 0.3) + ' V' + h + ' Z', fill: 'var(--wds-line)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.32, width: w, height: h * 0.1, fill: 'var(--wds-slab)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['widdershins.html'] = {
    prefix: 'wds-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var eye = sh / 2, k = eye / 520;
      var QUAY = 1500;                          // where the quay meets the river
      var FAR = 3800;                           // the far bank, where the city stands
      var EDGE = 1600;                          // where the morning crosses the far bank
      var CW = 7600, CH = 2600;
      var BOARD = -760;                         // the page's board, on the night side
      var decor = [];
      var put = function (s, w, h, o) {
        o.w = w * k; o.h = h * k; o.y = (o.y || 0) * k;
        return kit.item(sized(s, o.w, o.h), o);
      };

      // The city flat is big, because it is far: its edge is where it is in the
      // world, so the drawing's edge sits at EDGE across the bank.
      var cs = 1;
      decor.push(kit.item(sized(city(CW, CH, CW / 2 + EDGE / cs, 0.32), CW * cs, CH * cs), { x: 0, z: FAR, w: CW * cs, h: CH * cs, near: 0.2 }));
      var wall = sized(riverWall(6000, 150), 6000, 150 * k);
      wall.setAttribute('preserveAspectRatio', 'none');
      decor.push(kit.item(wall, { x: 0, z: QUAY, w: 6000, h: 150 * k }));
      [-2200, -300, 1300, 2400].forEach(function (x) { decor.push(put(bollard(90, 150), 90, 150, { x: x, z: QUAY - 60 })); });
      var compassIt = put(compass(360, 1100), 360, 1100, { x: -1700, z: QUAY - 260 });
      decor.push(compassIt);

      var page = kit.screen(kit.page, 'Widdershins’ own page, on a board on the quay, on the night side');
      var board = kit.item(page, { x: BOARD, z: QUAY - 300, w: sw, h: sh, cls: 'wds-walk-board' });

      var stops = [
        kit.stop({ name: 'on the quay, the city across the river and the morning halfway across it', spot: { x: 1100, z: 0 } }),
        kit.stop({ name: 'at the river wall, the morning’s edge straight across the water', spot: { x: EDGE, z: QUAY - F * 0.8 } }),
        kit.stop({ name: 'at the board on the quay, with the room’s own page on the night side', spot: { x: BOARD, z: QUAY - 300 - F }, link: page }, board),
        kit.stop({ name: 'under the compass, its widdershins arm pointing into the morning', spot: kit.front(compassIt, 1000) }, compassIt)
      ];

      return {
        cls: 'wds-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 1100, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on a board along the quay to your left, on the night side; the stops go right to left, widdershins.',
        bounds: function () { return { x: [-2400, 2400], z: [0, QUAY - 300 - F * 0.5] }; },
        ground: function (g, from, to) {
          // The quay: cobbles, night all the way to the river wall.
          kit.quad(g, -6000, 6000, from, to, kit.ink('--wds-slab'));
          var line = kit.ink('--wds-line');
          for (var z = Math.max(0, Math.ceil(from / 60) * 60); z < Math.min(to, QUAY); z += 60) {
            kit.quad(g, -3000, 3000, z, z + 3, line, 0.7);
            for (var x = -3000 + ((z / 60) % 2) * 45; x < 3000; x += 90) kit.quad(g, x, x + 3, z, z + 60, line, 0.7);
          }
          // The river, too thick to drown in, with its crust; past the morning's
          // edge it is lit too, and only out on the water.
          if (to > QUAY) {
            kit.quad(g, -6000, 6000, Math.max(from, QUAY), to, kit.ink('--wds-ankh'));
            for (var i = 0; i < 70; i++) {
              var cx = -4000 + ((i * 2971) % 8000), cz = QUAY + 300 + ((i * 1777) % (FAR - QUAY - 400));
              if (cz < from || cz > to) continue;
              var lit = cx > EDGE + (FAR - cz) * 0.18;
              kit.oval(g, cx, cz, 180, 50, kit.ink(lit ? '--wds-ankh-crust-day' : '--wds-ankh-crust'), 1);
            }
            kit.quad(g, EDGE + 40, 6000, Math.max(from, FAR - 900), Math.min(to, FAR), kit.ink('--wds-ankh-day'), 0.85);
          }
        }
      };
    }
  };
})();
