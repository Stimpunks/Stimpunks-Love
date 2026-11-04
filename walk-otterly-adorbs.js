/* =============================================================================
   Otterly Adorbs, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   one of the rest of the rooms, each its own world in card. On Cel Street it
   is reached through its cabinet in the Arcade; on Paper Street it is reached
   by its address or the teleporter for now.

   IT IS THE ARCADE'S BODY AND THIS MACHINE'S SCREEN (§15). The grape carpet
   with its confetti, the marquee bulbs and the cabinet build are the
   Arcade's, because an arcade is machines with one body and different things
   behind the glass, and that is the one place on the street where shared
   chrome is the subject. The world is the screen: a kelp bay, a different
   dark from the room round it. So the otter's cabinet stands alone at the end
   of the carpet with the bay painted down both its sides, kelp standing up out
   of the shoal to the sky and the shingle at its foot, and on its screen is
   the room's own page, the game itself, played as on the page.

   FLOATING FILLS NOTHING, and nothing in this scene says otherwise: no meter,
   no score, no otter ranked against another. NOTHING MOVES AND NOTHING MAKES A
   SOUND: the bulbs are lit and still, and nothing on the screen moves until
   START is pressed on the page. Every colour is one the Arcade declares, by
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
  function hash(i, j, k) {
    var n = Math.imul(i + 15, 374761393) ^ Math.imul(j + 6, 668265263) ^ Math.imul(k + 2, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  // The cabinet round the screen: the Arcade's body, its marquee lit and still.
  function cabinet(w, h, sh) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cab)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'none', stroke: 'var(--tube-2)', 'stroke-width': 6 }));
    var mH = h - sh - 70;
    s.appendChild(el('rect', { x: 30, y: 20, width: w - 60, height: mH, fill: 'var(--carpet)' }));
    for (var b = 0; b < 15; b++) {
      var bx = 50 + b * (w - 100) / 14;
      s.appendChild(el('circle', { cx: bx, cy: 36, r: 7, fill: b % 2 ? 'var(--zap)' : 'var(--coin)' }));
      s.appendChild(el('circle', { cx: bx, cy: 20 + mH - 16, r: 7, fill: b % 2 ? 'var(--coin)' : 'var(--zap)' }));
    }
    // The marquee's art is the bay's: a strip of sea under a strip of sky.
    s.appendChild(el('rect', { x: 70, y: 56, width: w - 140, height: (mH - 72) / 2, fill: 'var(--sky)' }));
    s.appendChild(el('rect', { x: 70, y: 56 + (mH - 72) / 2, width: w - 140, height: (mH - 72) / 2, fill: 'var(--sea)' }));
    return s;
  }

  // A side of the cabinet, painted with the bay: the sky at the top, the sea,
  // the dark of the bay, kelp standing up out of the shoal, shingle and
  // cobbles at the foot.
  function sideArt(w, h, seed) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cab)' }));
    var m = 24, top = 80;
    s.appendChild(el('rect', { x: m, y: top, width: w - 2 * m, height: h - top - m, fill: 'var(--bay)' }));
    s.appendChild(el('rect', { x: m, y: top, width: w - 2 * m, height: 70, fill: 'var(--sky)' }));
    s.appendChild(el('rect', { x: m, y: top + 70, width: w - 2 * m, height: 50, fill: 'var(--sea)' }));
    s.appendChild(el('rect', { x: m, y: h - m - 160, width: w - 2 * m, height: 160, fill: 'var(--shoal)' }));
    for (var k = 0; k < 7; k++) {
      var x = m + 30 + hash(k, seed, 1) * (w - 2 * m - 60), tall = 220 + hash(k, seed, 2) * (h - top - 360);
      var d = 'M' + x + ' ' + (h - m - 60);
      for (var y = h - m - 60; y > h - m - 60 - tall; y -= 50) d += ' Q' + (x + (y % 100 ? 22 : -22)) + ' ' + (y - 25) + ' ' + x + ' ' + (y - 50);
      s.appendChild(el('path', { d: d, fill: 'none', stroke: 'var(--kelp-2)', 'stroke-width': 9, 'stroke-linecap': 'round' }));
      s.appendChild(el('ellipse', { cx: x + 14, cy: h - m - 60 - tall * 0.5, rx: 14, ry: 6, fill: 'var(--kelp-2)' }));
    }
    for (k = 0; k < 18; k++) {
      s.appendChild(el('ellipse', { cx: m + hash(k, seed, 3) * (w - 2 * m), cy: h - m - 30 - hash(k, seed, 4) * 40, rx: 14 + hash(k, seed, 5) * 14, ry: 8, fill: k % 3 ? 'var(--shingle)' : 'var(--cobble)' }));
    }
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'none', stroke: 'var(--tube-2)', 'stroke-width': 6 }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['otterly-adorbs.html'] = {
    prefix: 'otter-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 2200 + F;                       // the otter's cabinet
      var eye = sh / 2;
      var decor = [];

      var bw = sw + 160, bh = sh + 300;
      decor.push(kit.item(cabinet(bw, bh, sh), { x: 0, z: END + 30, w: bw, h: bh }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(sideArt(700, bh, side + 3), { x: side * (bw / 2 + 2), z: END - 320, w: 700, h: bh,
          turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var art = decor[1];

      var page = kit.screen(kit.page, 'Otterly Adorbs’ own page, on the cabinet’s screen');
      var screen = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'otter-walk-screen' });

      var stops = [
        kit.stop({ name: 'on the carpet, the otter’s cabinet at the end with the bay painted down its sides', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the cabinet’s side, the kelp bay painted on it', spot: kit.front(art, 1100) }),
        kit.stop({ name: 'at the cabinet, with the room’s own page on its screen: the game, which nothing moves on until START', spot: { x: 0, z: END - F }, link: page }, screen)
      ];

      return {
        cls: 'otter-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The otter’s cabinet stands at the end of the carpet; its own page is on the screen.',
        bounds: function () { return { x: [-1200, 1200], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--carpet'));
          // The confetti in the Arcade's carpet, the same every visit.
          var inks = [kit.ink('--coin'), kit.ink('--mint'), kit.ink('--zap')];
          for (var j = Math.max(0, Math.floor(near / 110)); j < Math.min(Math.ceil(far / 110), Math.ceil((END + 200) / 110)); j++) {
            for (var i = -14; i <= 14; i++) {
              if (hash(i, j, 1) > 0.5) continue;
              var px = i * 110 + hash(i, j, 2) * 80, pz = j * 110 + hash(i, j, 3) * 80;
              kit.quad(g, px, px + 14, pz, pz + 14, inks[Math.floor(hash(i, j, 4) * 3)]);
            }
          }
          // The screen's glow on the carpet, above Gentle only, as the
          // Arcade's own glow is.
          if (document.documentElement.getAttribute('data-intensity') !== 'gentle') kit.oval(g, 0, END - 300, 700, 400, kit.ink('--mint'), 0.06);
        }
      };
    }
  };
})();
