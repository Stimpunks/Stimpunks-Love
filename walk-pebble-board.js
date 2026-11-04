/* =============================================================================
   The Pebble Board, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   one of the rooms still to be walked into.

   IT IS THE BOARD'S WORLD AND NOBODY ELSE'S (§21): TWO PALETTES ON PURPOSE, and
   the seam between them is the whole object. Outside is the street's night,
   all round the edge of the glass; inside is lamplit cork. The case is a long
   piece of painted municipal timber on legs along the pavement, with a little
   pitched roof and one lamp on a bracket that lights the cork and the frame
   and nothing much else, so you walk along it in the dark with its inside
   glowing. It is not the Latibulum (dug, enclosed, no sky) and not the Brass
   Tacks Board (metal on metal, no glass, no cork, no lamp).

   THE FRAME IS THE STREET'S AND THE PAPER IS THE EDITION'S. The case, its
   lamp, its plate and its legs are drawn here and stay. The paper pinned on the
   cork is drawn as blank sheets and pins, because every sheet's words and every
   picture are the edition's and somebody's; the edition itself is the page,
   pinned up at the near end of the case behind the glass, as itself.

   NOTHING MOVES, at any setting. Every colour is one the board declares, by
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
  function hash(i, j) {
    var n = Math.imul(i + 21, 374761393) ^ Math.imul(j + 5, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  // THE CASE: legs, a timber frame with its lamplit top edge, a little pitched
  // roof, cork behind glass, and blank sheets pinned all along it, the
  // edition's place rather than its words. `gap` is where the page is pinned.
  function caseOf(w, h, gap) {
    var s = svg(w, h), roof = 110, legs = 210, cork0 = roof + 40, cork1 = h - legs - 30;
    s.appendChild(el('path', { fill: 'var(--pbframe)', d: 'M-20 ' + roof + ' L40 30 H' + (w - 40) + ' L' + (w + 20) + ' ' + roof + ' Z' }));
    s.appendChild(el('rect', { x: 40, y: 30, width: w - 80, height: 8, fill: 'var(--pbframe-lit)' }));
    [60, w / 2 - 20, w - 100].forEach(function (x) {
      s.appendChild(el('rect', { x: x, y: h - legs - 10, width: 40, height: legs + 10, fill: 'var(--pbframe)' }));
    });
    s.appendChild(el('rect', { x: 0, y: roof, width: w, height: h - legs - roof, fill: 'var(--pbframe)' }));
    s.appendChild(el('rect', { x: 0, y: roof, width: w, height: 6, fill: 'var(--pbframe-lit)' }));
    s.appendChild(el('rect', { x: 28, y: cork0, width: w - 56, height: cork1 - cork0, fill: 'var(--pbcork)' }));
    // The pinned paper, in the edition's paper and card, square to the cork.
    var x = 70, k = 0;
    while (x < w - 200) {
      var sw = 150 + hash(k, 1) * 170, sh2 = 160 + hash(k, 2) * 240;
      if (x + sw > gap[0] - 40 && x < gap[1] + 40) { x = gap[1] + 60; k++; continue; }
      var y = cork0 + 30 + hash(k, 3) * (cork1 - cork0 - sh2 - 60);
      s.appendChild(el('rect', { x: x, y: y, width: sw, height: sh2,
        fill: ['var(--pbpaper)', 'var(--pbcard)', 'var(--pbpaper-deep)'][Math.floor(hash(k, 4) * 3)] }));
      for (var ln = y + 34; ln < y + sh2 - 24; ln += 22) {
        s.appendChild(el('rect', { x: x + 18, y: ln, width: (sw - 36) * (0.5 + hash(k, ln) * 0.5), height: 5, fill: 'var(--pbink-soft)', 'fill-opacity': '0.35' }));
      }
      s.appendChild(el('circle', { cx: x + sw / 2, cy: y + 12, r: 8, fill: 'var(--pbgold)' }));
      x += sw + 40 + hash(k, 5) * 40; k++;
    }
    // The glass: its edge, and one long reflection of the lamp along it.
    s.appendChild(el('rect', { x: 28, y: cork0, width: w - 56, height: cork1 - cork0, fill: 'none', stroke: 'var(--pbframe-lit)', 'stroke-width': 6 }));
    s.appendChild(el('rect', { x: 60, y: cork0 + 18, width: w - 120, height: 4, fill: 'var(--pblamp)', 'fill-opacity': '0.35' }));
    // The plate, in brass, at the middle of the sill.
    s.appendChild(el('rect', { x: w / 2 - 150, y: cork1 + 6, width: 300, height: 22, rx: 3, fill: 'var(--pbplate)' }));
    return s;
  }

  // THE LAMP on its bracket over the roof: an arm, a shade, and the light.
  function lamp(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: w / 2 - 6, y: h - 120, width: 12, height: 120, fill: 'var(--pbframe)' }));
    s.appendChild(el('rect', { x: w / 2 - 6, y: h - 130, width: w / 2 - 20, height: 12, fill: 'var(--pbframe)' }));
    s.appendChild(el('path', { fill: 'var(--pbframe)', d: 'M' + (w - 100) + ' ' + (h - 130) + ' L' + (w - 70) + ' ' + (h - 170) + ' H' + (w - 20) + ' L' + (w + 10) + ' ' + (h - 130) + ' Z' }));
    s.appendChild(el('ellipse', { cx: w - 45, cy: h - 126, rx: 30, ry: 10, fill: 'var(--pblamp)' }));
    s.appendChild(el('circle', { cx: w - 45, cy: h - 110, r: 46, fill: 'var(--pblamp)', 'fill-opacity': '0.14' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['pebble-board.html'] = {
    prefix: 'pb-walk',
    build: function (kit) {
      var F = kit.F;
      var sh = kit.H - 24;
      var eye = sh / 2;
      var CX = -360;                            // the plane of the glass, along the left of the pavement
      var Z0 = 500, CW = 3400, CH = 1050;       // the case: where it starts, how long and how tall
      var PW = Math.min(kit.W - 120, 820), PH = Math.round(PW * 0.62);
      var PZ = Z0 + 120 + PW / 2;               // the page, pinned at the near end
      var decor = [];

      // Seen from the pavement the case's near end is on your left, so in the
      // drawing it runs from the near end (x = 0) to the far one.
      var gapFrom = PZ - Z0 - PW / 2, gap = [gapFrom, gapFrom + PW];
      var theCase = { x: CX - 6, z: Z0 + CW / 2, w: CW, h: CH, turn: kit.LEFT };
      decor.push(kit.item(caseOf(CW, CH, gap), theCase));
      decor.push(kit.item(lamp(400, 300), { x: CX + 140, z: Z0 + CW / 2, w: 400, h: 300, y: CH - 120, turn: kit.LEFT }));

      var page = kit.screen(kit.page, 'The Pebble Board’s own page, pinned at the near end of the case');
      var sheet = kit.item(page, { x: CX, z: PZ, w: PW, h: PH, y: 330, turn: kit.LEFT, cls: 'pb-walk-sheet' });

      var mid = { x: CX, z: Z0 + CW / 2, w: 1100, h: CH, turn: kit.LEFT };
      var stops = [
        kit.stop({ name: 'on the pavement, a little short of the case', spot: { x: 260, z: -700 } }),
        kit.stop({ name: 'at the near end of the case, with the edition’s own page pinned behind the glass', spot: kit.front(sheet), link: page }, sheet),
        kit.stop({ name: 'under the lamp, at the brass plate, the cork glowing behind the glass', spot: kit.front(mid) }),
        kit.stop({ name: 'at the far end of the case, the street’s dark all round it', spot: { x: 0, z: Z0 + CW - 200 } })
      ];

      return {
        cls: 'pb-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 260, z: -700 },
        stops: stops,
        decor: decor,
        arrive: 'The case runs along the pavement on your left, with the edition’s own page pinned at its near end.',
        bounds: function () { return { x: [CX + 200, 700], z: [-900, Z0 + CW] }; },
        ground: function (g, near, far) {
          kit.quad(g, -6000, 6000, near, far, kit.ink('--pbnight'));
          // The kerb, and the paving the lamp barely reaches.
          kit.quad(g, 900, 912, near, far, kit.ink('--pbchalk'), 0.25);
          var seam = kit.ink('--pbframe');
          for (var z = Math.ceil(near / 240) * 240; z < far; z += 240) kit.quad(g, CX, 900, z, z + 4, seam, 0.5);
          // The lamp's light on the pavement under the case, and nowhere else.
          kit.oval(g, CX + 120, Z0 + CW / 2, 260, 1500, kit.ink('--pblamp'), 0.06);
          kit.oval(g, CX + 80, Z0 + CW / 2, 140, 900, kit.ink('--pblamp'), 0.06);
        }
      };
    }
  };
})();
