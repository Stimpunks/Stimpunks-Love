/* =============================================================================
   All Needs Met Wildlife Sanctuary, walked into on Paper Street. Ryan's call,
   2026-11-04: round one of the rooms you can walk into, the sanctuary among
   them.

   IT IS THE SANCTUARY'S WORLD AND NOBODY ELSE'S (§105): the keepers' night
   round, seen through a viewer that sees warmth, because a torch wakes
   everybody. THE LIGHT IS NOT LIGHT: every resident is white with their own
   warmth, a soft halo round each, and the night is black. NOTHING HERE HAS A
   HUE, because heat has none: every ink is one of §105's greys, by name, and
   there is no torch, no lamp and no moon. Nothing reflects; the bodies
   themselves are the light. No crosshair is drawn, because the instrument a
   crosshair belongs to is a scope.

   You come in at the gate and walk the track past the pond, where Duke is on
   the water, Mabel's wallow and Otis on his high perch, to the keepers' hut,
   where Juniper keeps to the bale by the barn door and the sanctuary's own
   page is on the screen in the hut's doorway, full size once you stand at it.
   Nobody is counted. Nothing moves; it keeps nothing, sends nothing and
   fetches nothing; its page arrives through Paper Street's screen().
   tools/make-paper-street.py holds each of those.
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
  // A warm body, made of a few shapes: first the halo of its warmth round all
  // of them, then the body itself, white.
  function warm(s, parts, r) {
    parts.forEach(function (p) {
      var a = {};
      for (var k in p[1]) a[k] = p[1][k];
      a.fill = 'none'; a.stroke = 'var(--anm-halo)'; a['stroke-width'] = r; a['stroke-opacity'] = '0.3'; a['stroke-linejoin'] = 'round';
      s.appendChild(el(p[0], a));
    });
    parts.forEach(function (p) {
      var a = { fill: 'var(--anm-body)' };
      for (var k in p[1]) a[k] = p[1][k];
      s.appendChild(el(p[0], a));
    });
  }
  function E(cx, cy, rx, ry) { return ['ellipse', { cx: cx, cy: cy, rx: rx, ry: ry }]; }
  function R(x, y, w, h) { return ['rect', { x: x, y: y, width: w, height: h, rx: Math.min(w, h) / 2 }]; }
  function P(d) { return ['path', { d: d }]; }

  // Juniper, a goat on her three legs, by the bale she likes.
  function goat(x, base) {
    return [E(x, base - 130, 110, 56), R(x - 80, base - 100, 22, 100), R(x + 60, base - 100, 22, 100), R(x + 20, base - 100, 22, 100),
            P('M' + (x + 80) + ' ' + (base - 160) + ' l50 -80 l40 0 l10 40 l-40 60 z'), E(x + 150, base - 238, 36, 26),
            P('M' + (x + 140) + ' ' + (base - 258) + ' q-10 -50 -50 -60 q30 30 30 64 z'), R(x - 124, base - 170, 30, 16)];
  }

  // The keepers' hut, cooler than anybody in it, so it reads as greys; its
  // doorway is where the screen stands, and the bale by the door has Juniper
  // beside it.
  function hut(w, h, dw, dh) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('path', { fill: 'var(--anm-roof)', d: 'M0 ' + (h * 0.3) + ' L' + m + ' 0 L' + w + ' ' + (h * 0.3) + ' Z' }));
    s.appendChild(el('rect', { x: 40, y: h * 0.3, width: w - 80, height: h * 0.7, fill: 'var(--anm-wall)' }));
    s.appendChild(el('rect', { x: m - dw / 2 - 20, y: h - dh - 20, width: dw + 40, height: dh + 20, fill: 'var(--anm-case)' }));
    var bx = m + dw / 2 + 120;
    s.appendChild(el('rect', { x: bx, y: h - 150, width: 260, height: 150, fill: 'var(--anm-reed)' }));
    warm(s, goat(bx + 480, h), 30);
    return s;
  }

  // The pond, cooler than the night round it, with reeds, and Duke on it.
  function pond(w, h) {
    var s = svg(w, h);
    for (var x = 20; x < w; x += 46) {
      s.appendChild(el('rect', { x: x, y: h * 0.2 + (x * 37 % 90), width: 8, height: h, fill: 'var(--anm-reed)' }));
    }
    var dx = w * 0.5, dy = h - 50;
    warm(s, [E(dx, dy, 90, 40), E(dx + 80, dy - 70, 30, 28), P('M' + (dx + 104) + ' ' + (dy - 76) + ' l46 8 l-44 14 z'), R(dx + 66, dy - 60, 26, 50)], 24);
    return s;
  }

  // Mabel at her wallow: a big warm body low on the ground.
  function wallow(w, h) {
    var s = svg(w, h), x = w * 0.42, y = h - 70;
    s.appendChild(el('ellipse', { cx: w / 2, cy: h - 30, rx: w / 2 - 10, ry: 30, fill: 'var(--anm-water)' }));
    warm(s, [E(x, y - 40, 170, 80), E(x + 170, y - 60, 60, 52), E(x + 226, y - 50, 22, 18),
             P('M' + (x + 140) + ' ' + (y - 100) + ' l20 -50 l30 40 z'), R(x - 120, y + 10, 34, 50), R(x + 90, y + 10, 34, 50)], 28);
    return s;
  }

  // Otis on his high perch: a post, a crossbar, and the owl.
  function perch(w, h) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: m - 12, y: 180, width: 24, height: h - 180, fill: 'var(--anm-trees)' }));
    s.appendChild(el('rect', { x: m - 70, y: 180, width: 140, height: 18, fill: 'var(--anm-trees)' }));
    warm(s, [E(m, 120, 46, 64), E(m, 50, 38, 34), P('M' + (m - 36) + ' 34 l-6 -36 l26 22 z'), P('M' + (m + 36) + ' 34 l6 -36 l-26 22 z')], 22);
    return s;
  }

  // The trees round the sanctuary, cooler than anybody, and the fence wire.
  function treeline(w, h) {
    var s = svg(w, h);
    for (var x = 0, k = 0; x < w; x += 140, k++) {
      var top = 40 + (k * 53) % 160;
      s.appendChild(el('path', { fill: 'var(--anm-trees)', d: 'M' + (x - 30) + ' ' + h + ' L' + (x + 70) + ' ' + top + ' L' + (x + 170) + ' ' + h + ' Z' }));
    }
    [h - 150, h - 90].forEach(function (y) { s.appendChild(el('rect', { x: 0, y: y, width: w, height: 4, fill: 'var(--anm-wire)' })); });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['all-needs-met.html'] = {
    prefix: 'anm-walk',
    from: 'natures-contribution.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var END = 3200 + F;                       // where the hut's doorway is
      var eye = sh / 2;
      var decor = [];

      decor.push(kit.item(treeline(5200, 700), { x: 0, z: END + 900, w: 5200, h: 700 }));
      var HW = 3000, HH = Math.max(sh + 500, 1100);
      decor.push(kit.item(hut(HW, HH, sw, sh), { x: 0, z: END + 30, w: HW, h: HH }));
      var page = kit.screen(kit.page, 'The sanctuary’s own page, on the screen in the keepers’ hut');
      var screen = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'anm-walk-screen' });

      var water = kit.item(pond(900, 300), { x: -760, z: 1400, w: 900, h: 300, turn: kit.LEFT });
      decor.push(water);
      decor.push(kit.item(wallow(560, 300), { x: 760, z: 1900, w: 560, h: 300 }));
      var owl = kit.item(perch(240, 900), { x: -620, z: 2500, w: 240, h: 900 });
      decor.push(owl);

      var stops = [
        kit.stop({ name: 'at the gate, at the start of the keepers’ round', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'by the pond, where Duke is warm on the cold water', spot: kit.front(water, 900) }, water),
        kit.stop({ name: 'under Otis’s high perch', spot: { x: -380, z: 2500 - F * 0.9 } }),
        kit.stop({ name: 'at the keepers’ hut, with the sanctuary’s own page on its screen', spot: { x: 0, z: END - F }, link: page }, screen)
      ];

      return {
        cls: 'anm-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Everybody here is white with their own warmth. The sanctuary’s own page is on the screen in the keepers’ hut at the end of the track.',
        bounds: function () { return { x: [-520, 520], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--anm-ground'));
          kit.quad(g, -4000, 4000, Math.max(from, END + 200), to, kit.ink('--anm-ground-far'));
          // The track, worn a shade cooler than the grass either side.
          kit.quad(g, -170, 170, Math.max(from, 0), Math.min(to, END), kit.ink('--anm-ground-far'));
          // The pond itself, cold, and the wallow's mud.
          kit.oval(g, -900, 1400, 420, 300, kit.ink('--anm-water'));
          kit.oval(g, 900, 1900, 260, 160, kit.ink('--anm-water'));
        }
      };
    }
  };
})();
