/* =============================================================================
   Pekoe and Purrs, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   one of the rooms still to be walked into.

   IT IS PEKOE AND PURRS' WORLD AND NOBODY ELSE'S (§94): a cat café on a coral
   wall, lit by A WINDOW AT EVERY HEIGHT, EACH CUT TO THE SIZE OF A CAT: one at
   the floor for watching feet go by, round ones high up, a square in the middle
   of the wall, an arch, and every one lays a small square of day on the wall
   down and to the right of it, because the sun is up and to the left. Rescue A
   Cat, where every cat in here came from, is the dark, a torch and eyes; this
   is day, lit all over. Covenstead pours tea in daylight too, one window and
   mismatched china: here EVERY CUP AND POT IS THE SAME TEAL MUG.

   NO CAT IS DRAWN. The café keeps no cats of its own: the cats are the
   shelter's, read fresh every time the room's own page opens, and they roam
   there, on the page on the right-hand wall, because the scripts that do that
   talk to the CB and are never run here. What is cut out of card is everything
   that waits for them: the cat tree, the shelves up the wall, a knitted toy on
   the floor, and tables laid with the teal mug.

   NOTHING MOVES and nothing tilts. Everything is outlined in the room's ink.
   Every colour is one Pekoe and Purrs declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var INK = { stroke: 'var(--pkp-ink)', 'stroke-width': 6 };

  function el(name, attrs, inked) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (inked) for (k in INK) e.setAttribute(k, INK[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // A window cut to a cat's size, and the square of day it lays on the wall
  // down and to the right of it.
  function catWindow(s, kind, x, y, size) {
    s.appendChild(el('rect', { x: x + size * 0.45, y: y + size * 0.55, width: size, height: size, fill: 'var(--pkp-day)' }));
    var glass = { fill: 'var(--pkp-sky)' };
    if (kind === 'round') s.appendChild(el('circle', Object.assign({ cx: x + size / 2, cy: y + size / 2, r: size / 2 }, glass), true));
    else if (kind === 'arch') s.appendChild(el('path', Object.assign({ d: 'M' + x + ' ' + (y + size) + ' V' + (y + size / 2) + ' A' + size / 2 + ' ' + size / 2 + ' 0 0 1 ' + (x + size) + ' ' + (y + size / 2) + ' V' + (y + size) + ' Z' }, glass), true));
    else if (kind === 'slot') s.appendChild(el('rect', Object.assign({ x: x, y: y + size * 0.35, width: size * 1.6, height: size * 0.3, rx: 10 }, glass), true));
    else s.appendChild(el('rect', Object.assign({ x: x, y: y, width: size, height: size }, glass), true));
  }

  // The back wall: coral, with a window at every height.
  function backWall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--pkp-wall)' }));
    catWindow(s, 'square', w * 0.08, h - 230, 170);           // at the floor, for watching feet
    catWindow(s, 'round', w * 0.22, h * 0.18, 150);
    catWindow(s, 'arch', w * 0.66, h * 0.42, 180);
    catWindow(s, 'round', w * 0.84, h * 0.12, 120);
    catWindow(s, 'slot', w * 0.38, 40, 140);                  // under the eaves
    catWindow(s, 'square', w * 0.86, h - 260, 150);
    s.appendChild(el('rect', { x: 0, y: h - 40, width: w, height: 40, fill: 'var(--pkp-shade)' }));
    return s;
  }

  // The cat tree: a sisal post, birch platforms, a box with a round door.
  function catTree(w, h) {
    var s = svg(w, h), cx = w / 2;
    s.appendChild(el('rect', { x: cx - 26, y: 60, width: 52, height: h - 60, fill: 'var(--pkp-sisal)' }, true));
    [[0.12, 0.9], [0.42, 0.7], [0.7, 0.8]].forEach(function (p, i) {
      var pw = w * p[1];
      s.appendChild(el('rect', { x: i % 2 ? cx - pw * 0.15 : cx - pw * 0.85, y: h * p[0], width: pw, height: 34, rx: 8, fill: 'var(--pkp-birch)' }, true));
    });
    s.appendChild(el('rect', { x: cx - w * 0.38, y: h - 220, width: w * 0.76, height: 220, fill: 'var(--pkp-birch)' }, true));
    s.appendChild(el('circle', { cx: cx, cy: h - 110, r: 60, fill: 'var(--pkp-shade)' }, true));
    s.appendChild(el('rect', { x: cx - w * 0.45, y: h - 24, width: w * 0.9, height: 24, fill: 'var(--pkp-sisal)' }, true));
    return s;
  }

  // A café table laid with the teal mug, the same mug at every table.
  function table(w, h) {
    var s = svg(w, h), cx = w / 2;
    s.appendChild(el('rect', { x: cx - 14, y: 120, width: 28, height: h - 140, fill: 'var(--pkp-ink)' }));
    s.appendChild(el('rect', { x: cx - 90, y: h - 22, width: 180, height: 22, rx: 8, fill: 'var(--pkp-ink)' }));
    s.appendChild(el('ellipse', { cx: cx, cy: 120, rx: w / 2 - 6, ry: 26, fill: 'var(--pkp-card)' }, true));
    // The mug: a teal body, a handle, and its deeper rim.
    s.appendChild(el('rect', { x: cx - 30, y: 46, width: 60, height: 70, rx: 8, fill: 'var(--pkp-mug)' }, true));
    s.appendChild(el('path', { d: 'M' + (cx + 30) + ' 62 q30 0 30 22 t-30 22', fill: 'none', stroke: 'var(--pkp-mug-deep)', 'stroke-width': 12 }));
    s.appendChild(el('rect', { x: cx - 30, y: 46, width: 60, height: 12, fill: 'var(--pkp-mug-deep)' }));
    // A tea sandwich on its plate beside it, crusts on.
    s.appendChild(el('path', { d: 'M' + (cx - 120) + ' 112 l60 -40 l60 40 z', fill: 'var(--pkp-bread)' }, true));
    return s;
  }

  // Shelves up a wall, for climbing, and a hammock slung under the top one.
  function shelves(w, h) {
    var s = svg(w, h);
    for (var k = 0; k < 4; k++) {
      var x = (k % 2) * w * 0.45, y = h - 220 - k * (h - 260) / 3;
      s.appendChild(el('rect', { x: x, y: y, width: w * 0.55, height: 30, rx: 6, fill: 'var(--pkp-birch)' }, true));
    }
    s.appendChild(el('path', { d: 'M' + w * 0.1 + ' ' + (h * 0.18) + ' Q' + w * 0.3 + ' ' + (h * 0.32) + ' ' + w * 0.5 + ' ' + (h * 0.18),
      fill: 'none', stroke: 'var(--pkp-knit)', 'stroke-width': 26 }));
    return s;
  }

  // A knitted toy on the floor, a ball of the knit with a tail of yarn.
  function toy(w, h) {
    var s = svg(w, h);
    s.appendChild(el('circle', { cx: w * 0.35, cy: h - w * 0.32, r: w * 0.3, fill: 'var(--pkp-knit)' }, true));
    s.appendChild(el('path', { d: 'M' + w * 0.6 + ' ' + (h - w * 0.3) + ' q' + w * 0.2 + ' -' + w * 0.2 + ' ' + w * 0.36 + ' 0', fill: 'none', stroke: 'var(--pkp-salmon)', 'stroke-width': 8 }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['pekoe-and-purrs.html'] = {
    prefix: 'pkp-walk',
    build: function (kit) {
      var F = kit.F;
      var sh = kit.H - 24;
      var END = 2600, SIDE = 900;
      var eye = sh / 2;
      var decor = [];
      var WH = Math.max(1100, sh + 500);

      decor.push(kit.item(backWall(2 * SIDE + 200, WH), { x: 0, z: END, w: 2 * SIDE + 200, h: WH }));
      [-1, 1].forEach(function (side) {
        var s = svg(END + 600, WH);
        s.appendChild(el('rect', { x: 0, y: 0, width: END + 600, height: WH, fill: 'var(--pkp-wall)' }));
        catWindow(s, side < 0 ? 'round' : 'square', END * 0.2, WH * 0.2, 140);
        s.appendChild(el('rect', { x: 0, y: WH - 40, width: END + 600, height: 40, fill: 'var(--pkp-shade)' }));
        decor.push(kit.item(s, { x: side * SIDE, z: END / 2 - 300, w: END + 600, h: WH, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      decor.push(kit.item(shelves(900, WH - 100), { x: -SIDE + 4, z: END - 700, w: 900, h: WH - 100, turn: kit.LEFT }));
      decor.push(kit.item(catTree(420, 980), { x: -520, z: END - 300, w: 420, h: 980 }));
      [[-300, 1150], [320, 1500], [-80, 1950]].forEach(function (t) {
        decor.push(kit.item(table(300, 300), { x: t[0], z: t[1], w: 300, h: 300 }));
      });
      decor.push(kit.item(toy(140, 120), { x: 260, z: 1000, w: 140, h: 120 }));

      // The page on the right-hand wall, where the cats are.
      var PW = Math.min(kit.W - 120, 900), PH = Math.round(PW * 0.6);
      var page = kit.screen(kit.page, 'Pekoe and Purrs’ own page, on the right-hand wall');
      var wallPage = kit.item(page, { x: SIDE - 4, z: 1500, w: PW, h: PH, y: 160, turn: kit.RIGHT, cls: 'pkp-walk-page' });

      var tree = { x: -520, z: END - 300, w: 420, h: 980 };
      var stops = [
        kit.stop({ name: 'inside the door, the coral wall full of windows ahead', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at a table, with the teal mug every table has', spot: { x: -140, z: 1150 - F * 0.75 } }),
        kit.stop({ name: 'at the cat tree, under the windows at every height', spot: kit.front(tree) }),
        kit.stop({ name: 'at the right-hand wall, with the café’s own page, where the cats are', spot: kit.front(wallPage), link: page }, wallPage)
      ];

      return {
        cls: 'pkp-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The cats are the shelter’s, and they are on the café’s own page, on the right-hand wall.',
        bounds: function () { return { x: [-SIDE + 260, SIDE - 260], z: [-200, END - 500] }; },
        ground: function (g, near, far) {
          kit.quad(g, -5000, 5000, near, far, kit.ink('--pkp-floor'));
          // Boards running down the room.
          var seam = kit.ink('--pkp-shade');
          for (var x = -SIDE; x <= SIDE; x += 140) kit.quad(g, x - 3, x + 3, Math.max(near, -400), Math.min(far, END), seam);
          // The windows' squares of day, lying down and to the right of them.
          var day = kit.ink('--pkp-day');
          [[-600, END - 160], [600, END - 170], [-SIDE + 200, 1900], [SIDE - 260, 600]].forEach(function (p) {
            kit.quad(g, p[0], p[0] + 200, p[1] - 220, p[1], day, 0.5);
          });
          // A sisal rug under the tables.
          kit.quad(g, -500, 500, 700, 2100, kit.ink('--pkp-sisal'), 0.35);
        }
      };
    }
  };
})();
