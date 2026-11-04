/* =============================================================================
   The Dopamine Dress-Up Den, walked into on Paper Street. Ryan's ask,
   2026-11-04: round 1 of the rooms left on Paper Street.

   IT IS THE DRESS-UP DEN'S WORLD AND NOBODY ELSE'S (§52), Helen Edgar's idea:
   a boutique cut out of card, with a lavender wall, rails of clothes down both
   sides, and a wooden valet stand in the middle of the floor. THE LIGHT IS SUN
   TAKEN APART BY A CRYSTAL: it comes in at the front window, behind you as you
   walk in, mostly white, which is what lets every cloth on the rails look like
   itself; the rest the crystal hanging in the window throws on the walls as
   small rainbows, each one flat where it lands, never pooled and never an even
   wash. Pattern is the subject, so the clothes on the rails are printed, and
   nothing is cut open (Vital Plant Living is the section); the wall stays cool
   lavender (warmed towards pink, it would be Covenstead with a clothes rail).
   The shop's own page hangs on the back wall.

   THE WAY IN IS THE CURTAINED DOORWAY on the back wall, right of the page, as
   the shop's own page draws it: a wooden arch hung with a curtain in folds of
   plum and violet, drawn back a little at the middle so the light through it
   shows, and a board over it with Fantasy Fancy Dress on it. Pressing it goes
   through.

   NOBODY'S BODY IS DRAWN HERE. No figure, no mannequin, no skin, no size: the
   clothes hang on the rails and on the valet stand, which is a knob, two bars
   and a base, and whoever wears them is you.

   NOTHING MOVES: the crystal does not turn and the rainbows stay where they
   land. Every colour is one §52 declares, by name. It keeps nothing, sends
   nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var SPECTRUM = ['--dd-sp-1', '--dd-sp-2', '--dd-sp-3', '--dd-sp-4', '--dd-sp-5', '--dd-sp-6'];
  var CLOTH = ['--dd-f-tomato', '--dd-f-turquoise', '--dd-f-marigold', '--dd-f-violet', '--dd-f-lime', '--dd-f-hotpink',
               '--dd-f-indigo', '--dd-f-black', '--dd-f-sky', '--dd-f-plum', '--dd-f-mint', '--dd-f-coral', '--dd-f-teal', '--dd-f-gold'];
  var FIGURE = ['--dd-f-cream', '--dd-f-black', '--dd-f-gold', '--dd-f-silver'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }
  // A small rainbow where the crystal throws one: flat bands, side by side.
  function rainbow(s, x, y, w) {
    SPECTRUM.forEach(function (name, i) {
      s.appendChild(el('rect', { x: x + i * w / 6, y: y, width: w / 6, height: w * 0.35, fill: 'var(' + name + ')', 'fill-opacity': '0.7' }));
    });
  }

  // A lavender wall, with the crystal's rainbows on it where they land.
  function wall(w, h, seed) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--dd-wall)' }));
    s.appendChild(el('rect', { x: 0, y: h - 26, width: w, height: 26, fill: 'var(--dd-wood)' }));
    for (var i = 0; i < Math.floor(w / 380); i++) {
      var k = (seed + i * 37) % 100 / 100;
      rainbow(s, 120 + i * 380 + k * 140, h * (0.12 + k * 0.22), 70 + k * 40);
    }
    return s;
  }

  // A rail of clothes, every one printed, hung on hangers.
  function rail(w, h, seed) {
    var s = svg(w, h), top = 40, n = seed;
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: 10, fill: 'var(--dd-wood)' }));
    [0, w - 12].forEach(function (x) { s.appendChild(el('rect', { x: x, y: top, width: 12, height: h - top, fill: 'var(--dd-wood)' })); });
    for (var x = 60; x < w - 50; x += 95, n++) {
      var cloth = 'var(' + CLOTH[n % CLOTH.length] + ')', fig = 'var(' + FIGURE[n % FIGURE.length] + ')';
      var long = top + 40 + (n % 3 === 0 ? h * 0.66 : n % 3 === 1 ? h * 0.42 : h * 0.3);
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--dd-ink-2)', 'stroke-width': 3, d: 'M' + x + ' ' + (top + 5) + ' q0 -18 12 -18' }));
      s.appendChild(el('path', { fill: cloth, stroke: 'var(--dd-ink)', 'stroke-width': 2,
        d: 'M' + (x - 36) + ' ' + (top + 30) + ' L' + x + ' ' + (top + 12) + ' L' + (x + 36) + ' ' + (top + 30) + ' L' + (x + 42) + ' ' + long + ' H' + (x - 42) + ' Z' }));
      // Its print: stripes, dots or checks, never flat.
      var kind = n % 3;
      for (var y = top + 40; y < long - 10; y += 26) {
        if (kind === 0) s.appendChild(el('rect', { x: x - 38, y: y, width: 76, height: 8, fill: fig }));
        else if (kind === 1) { s.appendChild(el('circle', { cx: x - 18, cy: y + 6, r: 5, fill: fig })); s.appendChild(el('circle', { cx: x + 14, cy: y + 18, r: 5, fill: fig })); }
        else { s.appendChild(el('rect', { x: x - 30, y: y, width: 14, height: 13, fill: fig })); s.appendChild(el('rect', { x: x + 2, y: y + 13, width: 14, height: 13, fill: fig })); }
      }
    }
    return s;
  }

  // The valet stand: a knob, two bars and a base, with a look on it.
  function stand(w, h) {
    var s = svg(w, h), cx = w / 2;
    s.appendChild(el('circle', { cx: cx, cy: 26, r: 22, fill: 'var(--dd-wood)' }));
    s.appendChild(el('rect', { x: cx - 8, y: 40, width: 16, height: h - 70, fill: 'var(--dd-wood)' }));
    s.appendChild(el('rect', { x: cx - w * 0.36, y: 70, width: w * 0.72, height: 16, rx: 8, fill: 'var(--dd-wood)' }));
    s.appendChild(el('rect', { x: cx - w * 0.28, y: h * 0.52, width: w * 0.56, height: 14, rx: 7, fill: 'var(--dd-wood)' }));
    s.appendChild(el('rect', { x: cx - w * 0.3, y: h - 30, width: w * 0.6, height: 30, rx: 12, fill: 'var(--dd-wood)' }));
    // A haori over the top bar, fisherman pants over the lower.
    s.appendChild(el('path', { fill: 'var(--dd-f-turquoise)', stroke: 'var(--dd-ink)', 'stroke-width': 3,
      d: 'M' + (cx - w * 0.4) + ' 80 H' + (cx + w * 0.4) + ' L' + (cx + w * 0.34) + ' ' + h * 0.44 + ' H' + (cx - w * 0.34) + ' Z' }));
    for (var y = 100; y < h * 0.42; y += 30) s.appendChild(el('circle', { cx: cx + ((y / 30) % 2 ? -30 : 30), cy: y, r: 7, fill: 'var(--dd-f-gold)' }));
    s.appendChild(el('path', { fill: 'var(--dd-f-hotpink)', stroke: 'var(--dd-ink)', 'stroke-width': 3,
      d: 'M' + (cx - w * 0.3) + ' ' + h * 0.53 + ' H' + (cx + w * 0.3) + ' L' + (cx + w * 0.26) + ' ' + h * 0.82 + ' H' + (cx - w * 0.26) + ' Z' }));
    for (var x = cx - w * 0.26; x < cx + w * 0.26; x += 22) s.appendChild(el('rect', { x: x, y: h * 0.54, width: 8, height: h * 0.27, fill: 'var(--dd-f-indigo)' }));
    return s;
  }

  // The front window behind you, the crystal hanging in it.
  function frontWindow(w, h) {
    var s = svg(w, h), cx = w / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--dd-wall)' }));
    s.appendChild(el('rect', { x: w * 0.12, y: h * 0.12, width: w * 0.76, height: h * 0.66, fill: 'var(--dd-glass)', stroke: 'var(--dd-wood)', 'stroke-width': 16 }));
    s.appendChild(el('line', { x1: cx, y1: h * 0.12, x2: cx, y2: h * 0.3, stroke: 'var(--dd-ink-2)', 'stroke-width': 3 }));
    s.appendChild(el('path', { fill: 'var(--dd-panel)', stroke: 'var(--dd-ink-2)', 'stroke-width': 4,
      d: 'M' + cx + ' ' + h * 0.3 + ' L' + (cx + 26) + ' ' + h * 0.36 + ' L' + cx + ' ' + h * 0.46 + ' L' + (cx - 26) + ' ' + h * 0.36 + ' Z' }));
    rainbow(s, cx + 60, h * 0.5, 80);
    return s;
  }

  // The curtained doorway through to Fantasy Fancy Dress: a board over a
  // wooden arch, the curtain in plum and violet folds, drawn back a little at
  // the middle so the light through it shows, and a rainbow on the wall by it.
  function curtain(w, h) {
    var s = svg(w, h), m = w / 2, spring = 210, r = (w - 76) / 2;
    s.appendChild(el('rect', { x: 20, y: 0, width: w - 40, height: 84, rx: 10, fill: 'var(--dd-panel)', stroke: 'var(--dd-wood)', 'stroke-width': 6 }));
    s.appendChild(el('path', { fill: 'var(--dd-wood)', d: 'M24 ' + h + ' V' + spring + ' A' + (r + 14) + ' ' + (r + 14) + ' 0 0 1 ' + (w - 24) + ' ' + spring + ' V' + h + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--dd-f-plum)', d: 'M38 ' + (h - 10) + ' V' + spring + ' A' + r + ' ' + r + ' 0 0 1 ' + (w - 38) + ' ' + spring + ' V' + (h - 10) + ' Z' }));
    for (var f = 0, fw = (w - 76) / 10; f < 10; f += 2) {
      s.appendChild(el('rect', { x: 38 + f * fw, y: spring, width: fw, height: h - 10 - spring, fill: 'var(--dd-f-violet)' }));
    }
    s.appendChild(el('path', { fill: 'var(--dd-glass)', d: 'M' + (m - 22) + ' ' + (h - 10) + ' Q' + (m - 6) + ' ' + (spring + 60) + ' ' + m + ' ' + (spring - 4) + ' Q' + (m + 6) + ' ' + (spring + 60) + ' ' + (m + 22) + ' ' + (h - 10) + ' Z' }));
    s.appendChild(el('rect', { x: 34, y: spring - 6, width: w - 68, height: 8, rx: 4, fill: 'var(--dd-ink)' }));
    s.appendChild(el('rect', { x: 14, y: h - 12, width: w - 28, height: 12, rx: 3, fill: 'var(--dd-wood)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['dopamine-dress-up-den.html'] = {
    prefix: 'dd-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var END = 2100 + F;                          // the back wall
      var eye = sh / 2;
      var SIDE = 900, WH = Math.max(1000, sh + 420);
      var decor = [];

      decor.push(kit.item(wall(SIDE * 2 + 40, WH, 11), { x: 0, z: END + 30, w: SIDE * 2 + 40, h: WH }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(wall(END + 400, WH, side < 0 ? 3 : 61), { x: side * SIDE, z: (END - 400) / 2, w: END + 400, h: WH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT, near: 0.3 }));
        decor.push(kit.item(rail(1500, 640, side < 0 ? 0 : 7), { x: side * (SIDE - 30), z: 1100, w: 1500, h: 640,
          turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      decor.push(kit.item(frontWindow(SIDE * 2 + 40, WH), { x: 0, z: -340, w: SIDE * 2 + 40, h: WH, turn: Math.PI }));
      var valet = kit.item(stand(340, 520), { x: -300, z: 1300, w: 340, h: 520 });
      decor.push(valet);

      // The curtained doorway on the back wall right of the page, made before
      // the page so the keyboard reaches it without going through every link
      // on the page first.
      var through = kit.door('fantasy-fancy-dress.html', { art: curtain(320, 580), no: 'THROUGH THE CURTAIN', label: 'dd-walk-board', cls: 'dd-walk-curtain',
                                                          x: Math.max(sw / 2 + 230, 640), z: END + 10, w: 320, h: 580 });
      decor.push(through);
      var page = kit.screen(kit.page, 'The Dopamine Dress-Up Den’s own page, on the back wall');
      var leaf = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'dd-walk-wall' });

      var stops = [
        kit.stop({ name: 'inside the front window, the sun behind you and the rails either side', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the valet stand in the middle of the floor, a look on it', spot: kit.front(valet, F * 0.9) }, valet),
        kit.stop({ name: 'at the rails on the left, every cloth printed', spot: { x: -SIDE + 520, z: 1100, yaw: -Math.PI / 2 } }),
        kit.stop({ name: 'at the curtain at the back, the way through to Fantasy Fancy Dress', spot: kit.front(through), link: through.link }, through),
        kit.stop({ name: 'at the back wall, with the shop’s own page on it', spot: { x: 0, z: END - F }, link: page }, leaf)
      ];

      return {
        cls: 'dd-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page hangs on the back wall, past the valet stand.',
        bounds: function () { return { x: [-SIDE + 380, SIDE - 380], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--dd-wall'));
          kit.quad(g, -SIDE, SIDE, Math.max(from, -340), Math.min(to, END), kit.ink('--dd-panel'));
          var seam = kit.ink('--dd-wall');
          for (var x = -SIDE; x <= SIDE; x += 140) kit.quad(g, x - 2, x + 2, Math.max(from, -340), Math.min(to, END), seam);
          // The sun through the front window, white, and the crystal's few
          // rainbows on the floor, flat where they land.
          kit.quad(g, -560, 560, -300, 700, kit.ink('--dd-glass'));
          [[-300, 520], [380, 900], [-120, 1700]].forEach(function (p) {
            SPECTRUM.forEach(function (name, i) { kit.quad(g, p[0] + i * 20, p[0] + i * 20 + 20, p[1], p[1] + 46, kit.ink(name), 0.7); });
          });
        }
      };
    }
  };
})();
