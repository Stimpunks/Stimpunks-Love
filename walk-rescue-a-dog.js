/* =============================================================================
   Rescue A Dog, walked into on Paper Street. Ryan's ask, 2026-11-04: round one
   of the rooms still to be walked into.

   IT IS RESCUE A DOG'S WORLD AND NOBODY ELSE'S (§88): the park the morning
   after snow. THE LIGHT IS A LOW WINTER SUN ON SNOW, AND THE SHADOWS ARE BLUE:
   the sun stands just over the far edge of the park, on the backcloth, and
   everything cut out of card here throws a long shadow on the snow towards
   you, and a shadow on snow is lit only by the sky, so it is the sky's blue.
   The ground is brighter than the sky. No torch, no eyeshine and no night,
   which keeps it off Rescue A Cat next door; the shadows are cold and never
   warm, which keeps it off the Hermitage's low sun; and everything casts
   something, which keeps it off the 404's fog.

   THE PLACES ARE THE PAGE'S OWN: the gate you come in by, with the red lead
   dropped in the snow by it and prints going off from it, which is the room's
   job marker; a bench, the bus shelter, the frozen pond, bare trees, and the
   kennels with their doors open and nothing on them. THERE IS NO DOG IN THE
   SCENE. The dogs are the shelter's, read when the page opens, and the page is
   on the noticeboard by the path, where rescuing and adopting work as they do
   on the page, because shelter.js talks to the CB and is never run here. No
   name, no number and nothing about who rescued anybody. You follow the prints.

   NOTHING MOVES. Every colour is one Rescue A Dog declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Paper
   Street's screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var WOOD = 'var(--rad-stripe)';

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // The low sun just over the far edge of the park, and the line of the far
  // trees under it.
  function farEdge(w, h) {
    var s = svg(w, h);
    s.appendChild(el('circle', { cx: w * 0.5 - 120, cy: h - 150, r: 120, fill: 'var(--rad-sun)' }));
    s.appendChild(el('rect', { x: 0, y: h - 120, width: w, height: 120, fill: 'var(--rad-dim)' }));
    for (var x = 0; x < w; x += 140) {
      s.appendChild(el('path', { fill: 'var(--rad-dim)', d: 'M' + x + ' ' + (h - 110) + ' L' + (x + 60) + ' ' + (h - 240 - (x % 280 ? 0 : 60)) + ' L' + (x + 120) + ' ' + (h - 110) + ' Z' }));
    }
    s.appendChild(el('rect', { x: 0, y: h - 30, width: w, height: 30, fill: 'var(--rad-snow)' }));
    return s;
  }

  // A bare tree: a trunk and branches in the wood's dark, snow along the tops.
  function tree(w, h) {
    var s = svg(w, h), cx = w / 2;
    s.appendChild(el('rect', { x: cx - 16, y: h * 0.3, width: 32, height: h * 0.7, fill: WOOD }));
    [[-1, 0.42, 0.3], [1, 0.32, 0.36], [-1, 0.2, 0.26], [1, 0.12, 0.2]].forEach(function (b) {
      s.appendChild(el('path', { d: 'M' + cx + ' ' + h * (b[1] + 0.12) + ' L' + (cx + b[0] * w * b[2]) + ' ' + h * b[1], stroke: WOOD, 'stroke-width': 14, 'stroke-linecap': 'round' }));
    });
    s.appendChild(el('path', { d: 'M' + cx + ' ' + h * 0.3 + ' L' + cx + ' ' + h * 0.04, stroke: WOOD, 'stroke-width': 18, 'stroke-linecap': 'round' }));
    return s;
  }

  // The gate in the park railings, standing open.
  function gate(w, h) {
    var s = svg(w, h);
    [0, w - 30].forEach(function (x) { s.appendChild(el('rect', { x: x, y: 0, width: 30, height: h, fill: WOOD })); });
    for (var x = 50; x < w * 0.35; x += 40) s.appendChild(el('rect', { x: x, y: h * 0.25, width: 10, height: h * 0.75, fill: WOOD }));
    s.appendChild(el('rect', { x: 30, y: h * 0.3, width: w * 0.32, height: 12, fill: WOOD }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 10, fill: 'var(--rad-snow)' }));
    return s;
  }

  // A bench with snow along its seat and back.
  function bench(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: h * 0.1, width: w, height: h * 0.18, fill: WOOD }));
    s.appendChild(el('rect', { x: 0, y: h * 0.5, width: w, height: h * 0.14, fill: WOOD }));
    s.appendChild(el('rect', { x: 0, y: h * 0.42, width: w, height: h * 0.08, fill: 'var(--rad-snow)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.04, width: w, height: h * 0.06, fill: 'var(--rad-snow)' }));
    [0.08, 0.88].forEach(function (t) { s.appendChild(el('rect', { x: w * t, y: h * 0.28, width: w * 0.04, height: h * 0.72, fill: WOOD })); });
    return s;
  }

  // The bus shelter: a frame, a roof with snow on it, and its glass.
  function shelter(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 20, y: 40, width: w - 40, height: h - 60, fill: 'var(--rad-sky)', 'fill-opacity': '0.6' }));
    [10, w - 30].forEach(function (x) { s.appendChild(el('rect', { x: x, y: 30, width: 20, height: h - 30, fill: 'var(--rad-ink)' })); });
    s.appendChild(el('rect', { x: 0, y: 20, width: w, height: 24, fill: 'var(--rad-ink)' }));
    s.appendChild(el('rect', { x: 0, y: 6, width: w, height: 16, fill: 'var(--rad-snow)' }));
    s.appendChild(el('rect', { x: 60, y: h - 140, width: w - 120, height: 20, fill: 'var(--rad-ink)' }));
    return s;
  }

  // The kennels, a row of wooden huts with their doors open and nothing on
  // them: no name, no number.
  function kennels(w, h) {
    var s = svg(w, h), kw = w / 3;
    for (var k = 0; k < 3; k++) {
      var x = k * kw;
      s.appendChild(el('path', { fill: WOOD, d: 'M' + (x + 10) + ' ' + h + ' V' + h * 0.4 + ' L' + (x + kw / 2) + ' ' + h * 0.08 + ' L' + (x + kw - 10) + ' ' + h * 0.4 + ' V' + h + ' Z' }));
      s.appendChild(el('path', { fill: 'var(--rad-snow)', d: 'M' + x + ' ' + h * 0.42 + ' L' + (x + kw / 2) + ' ' + h * 0.04 + ' L' + (x + kw) + ' ' + h * 0.42 + ' L' + (x + kw / 2) + ' ' + h * 0.14 + ' Z' }));
      s.appendChild(el('path', { fill: 'var(--rad-ink)', d: 'M' + (x + kw * 0.3) + ' ' + h + ' V' + h * 0.6 + ' A' + kw * 0.2 + ' ' + kw * 0.2 + ' 0 0 1 ' + (x + kw * 0.7) + ' ' + h * 0.6 + ' V' + h + ' Z' }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['rescue-a-dog.html'] = {
    prefix: 'rad-walk',
    build: function (kit) {
      var F = kit.F;
      var sh = kit.H - 24;
      var eye = sh / 2;
      var FAR = 6000;
      var decor = [], casts = [];
      var put = function (node, o, len) { decor.push(kit.item(node, o)); casts.push([o.x, o.z, o.w, len]); };

      decor.push(kit.item(farEdge(14000, 600), { x: 0, z: FAR, w: 14000, h: 600 }));
      put(gate(420, 320), { x: -360, z: 300, w: 420, h: 320 }, 700);
      [[-1300, 1200, 900], [1100, 900, 1100], [1700, 2600, 1000], [-1600, 3000, 1200], [600, 3600, 900], [-500, 4200, 1100]].forEach(function (t) {
        put(tree(380, t[2]), { x: t[0], z: t[1], w: 380, h: t[2] }, t[2] * 1.4);
      });
      put(bench(460, 200), { x: 700, z: 1700, w: 460, h: 200, turn: -0.3 }, 400);
      put(shelter(620, 560), { x: -900, z: 2200, w: 620, h: 560, turn: 0.4 }, 900);
      put(kennels(780, 300), { x: 760, z: 3000, w: 780, h: 300 }, 520);

      // The page, on the noticeboard by the path, on its two posts.
      var PW = Math.min(kit.W - 160, 820), PH = Math.round(PW * 0.62);
      var page = kit.screen(kit.page, 'Rescue A Dog’s own page, on the noticeboard by the path');
      var board = kit.item(page, { x: -760, z: 1700, w: PW, h: PH, y: 150, turn: 0.5, cls: 'rad-walk-board' });
      casts.push([-760, 1700, PW, 700]);

      var bench0 = { x: 700, z: 1700, w: 460, h: 200, turn: -0.3 };
      var stops = [
        kit.stop({ name: 'at the gate, by the red lead dropped in the snow, the prints going off from it', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the noticeboard by the path, with the shelter’s own page, where the dogs are', spot: kit.front(board), link: page }, board),
        kit.stop({ name: 'by the bench, its shadow long and blue on the snow towards you', spot: kit.front(bench0, 900) }),
        kit.stop({ name: 'by the frozen pond, the low sun over the far edge of the park', spot: { x: 0, z: 2700 } })
      ];

      return {
        cls: 'rad-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'There are prints in the snow. The shelter’s own page is on the noticeboard by the path.',
        bounds: function () { return { x: [-1400, 1400], z: [-300, FAR - 2200] }; },
        ground: function (g, near, far) {
          kit.quad(g, -9000, 9000, near, far, kit.ink('--rad-snow'));
          var shade = kit.ink('--rad-shade'), track = kit.ink('--rad-track');
          // The path, trodden, up the middle of the park.
          kit.quad(g, -110, 110, Math.max(near, -400), Math.min(far, FAR - 400), shade, 0.35);
          // THE FROZEN POND.
          kit.oval(g, 120, 3300, 560, 260, track, 0.6);
          kit.oval(g, 120, 3300, 520, 230, kit.ink('--rad-card'));
          // EVERY SHADOW IS LONG AND BLUE AND FALLS TOWARDS YOU, away from the
          // sun at the far edge.
          casts.forEach(function (c) { kit.quad(g, c[0] - c[2] * 0.3, c[0] + c[2] * 0.3, c[1] - c[3], c[1], shade, 0.7); });
          // The red lead dropped by the gate, and the prints going off from it.
          kit.quad(g, -160, -60, 120, 132, kit.ink('--rad-link'));
          kit.quad(g, -70, -58, 132, 200, kit.ink('--rad-link'));
          for (var k = 0; k < 40; k++) {
            var z = 220 + k * 70, x = -40 + Math.sin(k / 3) * 120 + (k % 2 ? 22 : -22);
            kit.oval(g, x, z, 12, 16, track, 0.8);
          }
        }
      };
    }
  };
})();
