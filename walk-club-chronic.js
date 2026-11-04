/* =============================================================================
   Club Chronic, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1 of
   the rooms that could not yet be walked into.

   IT IS THE CLUB'S WORLD AND NOBODY ELSE'S (§20): a black wall with paper stuck
   to it. A low basement, brick-black walls under flyers pasted down in layers
   going back years, flat and overlapping, photocopies and coloured paper with
   the marker written over the top and staples in the corners. Never the zine
   table's one cut sheet scattered at angles: every sheet here is pasted square
   and flat, and a newer one goes over an older one. A bar by the door, and at
   the far end a small stage, and pasted up on the wall behind it like the
   biggest flyer in the room, the room's own page, to read and press as itself.

   IT DOES NOT STROBE, AT ANY SETTING, and nothing in it moves: the room's own
   rule, because the one obvious light a punk club has can put somebody on the
   floor. There is no stage light. The light is flat and even, the way the
   room's page has no light source at all.

   Every colour is one §20 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Paper Street's screen().
   tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var PAPERS = ['--paste', '--paste-2', '--newsprint', '--paste', '--siren', '--paste-2', '--marker'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }
  // The same wall every visit: a small fixed-seed generator.
  function seeded(n) {
    return function () {
      n = (n + 0x6D2B79F5) | 0;
      var t = Math.imul(n ^ (n >>> 15), 1 | n);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // One flyer, pasted square and flat: its paper, the bill's lines in the
  // grime, the marker over the top of some, and staples in two corners.
  function flyer(s, r, x, y, w, h) {
    var paper = PAPERS[Math.floor(r() * PAPERS.length)];
    s.appendChild(el('rect', { x: x, y: y, width: w, height: h, fill: 'var(' + paper + ')' }));
    s.appendChild(el('rect', { x: x + w * 0.1, y: y + h * 0.1, width: w * 0.8, height: h * 0.18, fill: 'var(--bootblack)' }));
    for (var ly = y + h * 0.38; ly < y + h - 14; ly += 16) s.appendChild(el('rect', { x: x + w * 0.12, y: ly, width: w * (0.4 + r() * 0.4), height: 6, fill: 'var(--grime)' }));
    if (paper !== '--marker' && r() < 0.35) {
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--marker)', 'stroke-width': 7, 'stroke-linecap': 'round',
        d: 'M' + (x + w * 0.15) + ' ' + (y + h * 0.7) + ' L' + (x + w * 0.85) + ' ' + (y + h * 0.5) }));
    }
    s.appendChild(el('rect', { x: x + 6, y: y + 6, width: 12, height: 3, fill: 'var(--staple)' }));
    s.appendChild(el('rect', { x: x + w - 18, y: y + 6, width: 12, height: 3, fill: 'var(--staple)' }));
  }

  // A wall of the club: brick-black, flyers pasted over flyers in layers, the
  // oldest first so every newer one goes over the top.
  function pasteWall(w, h, seed) {
    var s = svg(w, h), r = seeded(seed);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--brick)' }));
    for (var layer = 0; layer < 3; layer++) {
      for (var y = 60 + layer * 30; y < h - 120; y += 150 + r() * 40) {
        for (var x = -40 + r() * 80; x < w; x += 140 + r() * 70) {
          if (r() < 0.25) continue;
          flyer(s, r, x, y, 110 + r() * 60, 140 + r() * 70);
        }
      }
    }
    s.appendChild(el('rect', { x: 0, y: h - 80, width: w, height: 80, fill: 'var(--bootblack)' }));
    return s;
  }

  // The bar by the door: a dark counter, its top rubbed paler, the shelves
  // behind it empty but for a staple gun.
  function bar(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: h * 0.3, width: w, height: h * 0.7, fill: 'var(--brick-2)' }));
    s.appendChild(el('rect', { x: -10, y: h * 0.26, width: w + 20, height: 26, fill: 'var(--grime)' }));
    for (var x = 40; x < w - 40; x += 120) s.appendChild(el('rect', { x: x, y: h * 0.42, width: 8, height: h * 0.5, fill: 'var(--bootblack)' }));
    s.appendChild(el('rect', { x: w * 0.7, y: h * 0.16, width: 70, height: 26, rx: 6, fill: 'var(--staple)' }));
    return s;
  }

  // The stage: a low riser with two amps and a wedge, and nothing lit.
  function stage(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: h - 90, width: w, height: 90, fill: 'var(--grime)' }));
    s.appendChild(el('rect', { x: 0, y: h - 90, width: w, height: 8, fill: 'var(--staple)' }));
    [[40, 210], [w - 250, 210]].forEach(function (a) {
      s.appendChild(el('rect', { x: a[0], y: h - 90 - a[1], width: a[1], height: a[1], fill: 'var(--bootblack)', stroke: 'var(--staple)', 'stroke-width': 4 }));
      s.appendChild(el('circle', { cx: a[0] + a[1] / 2, cy: h - 90 - a[1] / 2, r: a[1] * 0.32, fill: 'var(--brick-2)' }));
    });
    s.appendChild(el('path', { fill: 'var(--bootblack)', d: 'M' + (w / 2 - 90) + ' ' + (h - 90) + ' L' + (w / 2 - 60) + ' ' + (h - 150) + ' H' + (w / 2 + 60) + ' L' + (w / 2 + 90) + ' ' + (h - 90) + ' Z' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['club-chronic.html'] = {
    prefix: 'club-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var END = 2300 + F;                       // where the page is pasted up
      var eye = sh / 2, WIDE = 820;
      var WH = Math.max(1100, sh + 560), decor = [];

      [-1, 1].forEach(function (side) {
        decor.push(kit.item(pasteWall(END + 400, WH, side < 0 ? 20 : 21), { x: side * WIDE, z: (END + 400) / 2 - 200, w: END + 400, h: WH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      decor.push(kit.item(pasteWall(2 * WIDE + 40, WH, 22), { x: 0, z: END + 40, w: 2 * WIDE + 40, h: WH }));
      var counter = kit.item(bar(900, 330), { x: WIDE - 120, z: 700, w: 900, h: 330, turn: kit.RIGHT });
      decor.push(counter);
      decor.push(kit.item(stage(2 * WIDE - 40, 320), { x: 0, z: END - 120, w: 2 * WIDE - 40, h: 320 }));

      var page = kit.screen(kit.page, 'Club Chronic’s own page, pasted up behind the stage');
      var hung = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: 90, cls: 'club-walk-bill' });

      var stops = [
        kit.stop({ name: 'inside the door, the bar on your right', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the bar, flyers on every wall round it', spot: kit.front(counter, 800) }, counter),
        kit.stop({ name: 'in the middle of the floor, nothing lit and nothing flashing', spot: { x: 0, z: (END - F) * 0.5 } }),
        kit.stop({ name: 'at the stage, with the room’s own page pasted up behind it', spot: kit.front(hung), link: page }, hung)
      ];

      return {
        cls: 'club-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is pasted up on the wall behind the stage at the far end.',
        bounds: function () { return { x: [-WIDE + 240, WIDE - 240], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--bootblack'));
          // A floor gone grey where the feet go, and a dropped flyer or two,
          // flat.
          kit.oval(g, 0, (END - F) * 0.6, 560, 900, kit.ink('--grime'), 0.6);
          [[-300, 900, '--paste'], [220, 1500, '--siren'], [-80, 1900, '--newsprint']].forEach(function (p) {
            kit.quad(g, p[0], p[0] + 90, p[1], p[1] + 120, kit.ink(p[2]), 0.85);
          });
        }
      };
    }
  };
})();
