/* =============================================================================
   The Aerial Arbour, walked into on Paper Street: pitch 06 on the campgrounds,
   Rowena's. Ryan's ask, 2026-11-05.

   THIS SCENE IS OURS, DRAWN FROM ROWENA'S OWN WORDS AND HER ROOM'S OWN
   COLOURS, AND IT IS HERS TO KEEP OR SEND BACK; it changes nothing on her
   page, and a change to how it looks is hers to ask for.

   IT IS THE ARBOUR'S WORLD AND NOBODY ELSE'S (§147): inside a round circus
   tent at night, the canvas in stripes of deep purple, teal and dark pink,
   a valance of scallops round the top of the wall, and fairy lights down
   every seam, small, silver and steady. A silver birch stands in the middle
   holding the canvas up, white bark marked across with dark lines, and off
   its branches hang the silks, the rope ladder, the rope, the hoop and the
   aerial pole; a tightrope runs from a platform on the trunk out to a post,
   over the crash mat round the tree. The hammock is slung between two of the
   wall's poles on the left, and the beanbags are on the rug on the right.
   Nobody is drawn, and there is no ring and no seats. No flame and no brown
   anywhere, not even the tree, which is what keeps it off the Faery Yurt next
   door. The room's own page hangs on the far wall, in a steel frame.

   NOTHING MOVES, and the lights never twinkle. Every colour is one §147
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Paper Street's screen(). tools/make-paper-street.py
   holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var STRIPES = ['var(--aar-purple)', 'var(--aar-teal)', 'var(--aar-wine)'];

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
  function line(s, x1, y1, x2, y2, ink, wd) {
    s.appendChild(el('path', { d: 'M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2, stroke: ink, 'stroke-width': wd, 'stroke-linecap': 'round', fill: 'none' }));
  }

  // A stretch of the canvas wall: a stripe between every pair of poles, the
  // rope and the valance along the top, and the lights coming down the seams
  // from the roof above.
  function canvasWall(w, h, from) {
    var s = svg(w, h), sw = 150, top = 90;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--aar-night)' }));
    for (var x = 0, i = from || 0; x < w; x += sw, i++) {
      s.appendChild(el('rect', { x: x, y: 0, width: sw + 1, height: h, fill: STRIPES[i % 3] }));
    }
    for (x = 0; x <= w; x += sw) {
      line(s, x, 0, x, top, 'var(--aar-steel)', 3);
      for (var b = 10; b < top; b += 26) {
        s.appendChild(el('circle', { cx: x, cy: b, r: 9, fill: 'var(--aar-bulb)', opacity: '0.18' }));
        s.appendChild(el('circle', { cx: x, cy: b, r: 4, fill: 'var(--aar-bulb)' }));
      }
      if (x > 0 && x < w) s.appendChild(el('rect', { x: x - 5, y: top, width: 10, height: h - top, fill: 'var(--aar-steel)' }));
    }
    for (x = 0, i = 0; x < w; x += 34, i++) {
      s.appendChild(el('path', { d: 'M' + x + ' ' + top + ' a17 15 0 0 0 34 0 Z', fill: i % 2 ? 'var(--aar-sea)' : 'var(--aar-rose)' }));
    }
    line(s, 0, top, w, top, 'var(--aar-steel)', 4);
    return s;
  }

  // The birch and everything hanging off it: the silks and the rope ladder
  // on the left, the rope in front, the hoop and the pole on the right, and
  // the tightrope from the platform on the trunk out to its post.
  function birch(r, w, h) {
    var s = svg(w, h), cx = w * 0.5, foot = h;
    // Everything hangs from low enough on the tree to be seen from the door.
    var by = function (f) { return h * (0.24 + 0.76 * f); };
    // The trunk, narrowing up and out of the top.
    s.appendChild(el('path', { fill: 'var(--aar-birch)', stroke: 'var(--aar-mark)', 'stroke-width': 3,
      d: 'M' + (cx - 46) + ' ' + foot + ' C ' + (cx - 40) + ' ' + by(0.6) + ', ' + (cx - 28) + ' ' + by(0.3) + ', ' + (cx - 22) + ' 0 L ' + (cx + 22) + ' 0 C ' + (cx + 28) + ' ' + by(0.3) + ', ' + (cx + 40) + ' ' + by(0.6) + ', ' + (cx + 46) + ' ' + foot + ' Z' }));
    for (var y = 40; y < h - 30; y += 34 + r() * 30) {
      var mw = 14 + r() * 24, mx = cx - 26 + r() * 30;
      line(s, mx, y, mx + mw, y, 'var(--aar-mark)', 5);
    }
    // The branches, each a pale stroke over a dark one.
    var boughs = [
      [cx - 8, by(0.22), cx - 300, by(0.18), cx - 400, by(0.2)],
      [cx - 8, by(0.32), cx - 160, by(0.26), cx - 250, by(0.27)],
      [cx + 8, by(0.28), cx + 200, by(0.22), cx + 300, by(0.24)],
      [cx + 8, by(0.14), cx + 120, by(0.1), cx + 210, by(0.1)],
      [cx - 8, by(0.08), cx - 90, by(0.04), cx - 150, by(0.05)]
    ];
    boughs.forEach(function (bg) {
      var d = 'M' + bg[0] + ' ' + bg[1] + ' Q ' + bg[2] + ' ' + bg[3] + ' ' + bg[4] + ' ' + bg[5];
      s.appendChild(el('path', { d: d, stroke: 'var(--aar-mark)', 'stroke-width': 20, 'stroke-linecap': 'round', fill: 'none' }));
      s.appendChild(el('path', { d: d, stroke: 'var(--aar-birch)', 'stroke-width': 14, 'stroke-linecap': 'round', fill: 'none' }));
      for (var l = 0; l < 3; l++) {
        s.appendChild(el('ellipse', { cx: bg[4] + (r() - 0.5) * 40, cy: bg[5] - 10 - r() * 24, rx: 12, ry: 6, fill: 'var(--aar-sea)' }));
      }
    });
    // The silks, from the long branch on the left down to the mat.
    var sx = cx - 390, sy = by(0.2);
    s.appendChild(el('rect', { x: sx - 16, y: sy - 4, width: 32, height: 16, rx: 5, fill: 'var(--aar-steel)' }));
    s.appendChild(el('path', { d: 'M' + (sx - 12) + ' ' + sy + ' C ' + (sx - 18) + ' ' + by(0.5) + ', ' + (sx - 34) + ' ' + by(0.8) + ', ' + (sx - 36) + ' ' + (foot - 10) + ' L ' + (sx - 10) + ' ' + (foot - 10) + ' C ' + (sx - 8) + ' ' + by(0.8) + ', ' + (sx - 2) + ' ' + by(0.5) + ', ' + sx + ' ' + sy + ' Z', fill: 'var(--aar-rose)' }));
    s.appendChild(el('path', { d: 'M' + sx + ' ' + sy + ' C ' + (sx + 4) + ' ' + by(0.5) + ', ' + (sx + 12) + ' ' + by(0.8) + ', ' + (sx + 14) + ' ' + (foot - 10) + ' L ' + (sx + 40) + ' ' + (foot - 10) + ' C ' + (sx + 34) + ' ' + by(0.8) + ', ' + (sx + 18) + ' ' + by(0.5) + ', ' + (sx + 12) + ' ' + sy + ' Z', fill: 'var(--aar-sea)' }));
    // The rope ladder, off the shorter branch on the left.
    var lx = cx - 250, ly = by(0.27);
    line(s, lx - 22, ly, lx - 22, foot - 30, 'var(--aar-rope)', 5);
    line(s, lx + 22, ly, lx + 22, foot - 30, 'var(--aar-rope)', 5);
    for (var g = ly + 34; g < foot - 30; g += 40) line(s, lx - 22, g, lx + 22, g, 'var(--aar-rope)', 6);
    // The rope, with its knot.
    var rx = cx - 130;
    line(s, rx, by(0.25), rx, foot - 60, 'var(--aar-rope)', 8);
    s.appendChild(el('circle', { cx: rx, cy: foot - 56, r: 12, fill: 'var(--aar-rope)' }));
    // The hoop, its ring wrapped in pink tape, on a rope from the branch on the right.
    var hx = cx + 290, hy = by(0.58), hr = 70;
    line(s, hx, by(0.24), hx, hy - hr, 'var(--aar-rope)', 4);
    s.appendChild(el('circle', { cx: hx, cy: hy, r: hr, fill: 'none', stroke: 'var(--aar-steel)', 'stroke-width': 9 }));
    for (var t = 0; t < 8; t++) {
      var a = Math.PI * 0.55 + t * 0.24;
      s.appendChild(el('path', { d: 'M' + (hx + hr * Math.cos(a)) + ' ' + (hy + hr * Math.sin(a)) + ' L ' + (hx + hr * Math.cos(a + 0.12)) + ' ' + (hy + hr * Math.sin(a + 0.12)), stroke: 'var(--aar-rose)', 'stroke-width': 13 }));
    }
    // The aerial pole, on its swivel from the high branch, pink tape up its foot.
    var px = cx + 200;
    s.appendChild(el('rect', { x: px - 10, y: by(0.1), width: 20, height: 18, rx: 4, fill: 'var(--aar-steel)' }));
    s.appendChild(el('rect', { x: px - 6, y: by(0.1) + 16, width: 12, height: foot - by(0.1) - 30, fill: 'var(--aar-steel)' }));
    for (var k = 0; k < 9; k++) line(s, px - 6, foot - 220 + k * 20, px + 6, foot - 210 + k * 20, 'var(--aar-rose)', 5);
    // The tightrope: a platform on the trunk, the wire, the post.
    var ty = foot - 230;
    s.appendChild(el('rect', { x: cx - 120, y: ty, width: 90, height: 12, rx: 3, fill: 'var(--aar-steel)' }));
    line(s, cx - 120, ty + 2, 30, ty + 2, 'var(--aar-steel)', 4);
    line(s, 30, ty - 6, 30, foot, 'var(--aar-steel)', 12);
    s.appendChild(el('rect', { x: 8, y: foot - 14, width: 44, height: 14, rx: 5, fill: 'var(--aar-steel)' }));
    return s;
  }

  // The hammock, slung between two poles, dark pink with a teal edge.
  function hammock(w, h) {
    var s = svg(w, h), pt = 60, sag = h - 110;
    [26, w - 26].forEach(function (x) { s.appendChild(el('rect', { x: x - 9, y: pt - 20, width: 18, height: h - pt + 20, fill: 'var(--aar-steel)' })); });
    [[26, 110], [w - 26, w - 110]].forEach(function (p) {
      [-14, 0, 14].forEach(function (o) { line(s, p[0], pt, p[1], pt + 70 + o, 'var(--aar-rope)', 2.5); });
    });
    var d = 'M110 ' + (pt + 60) + ' Q ' + (w / 2) + ' ' + (sag + 70) + ' ' + (w - 110) + ' ' + (pt + 60) + ' L ' + (w - 110) + ' ' + (pt + 84) + ' Q ' + (w / 2) + ' ' + (sag + 96) + ' 110 ' + (pt + 84) + ' Z';
    s.appendChild(el('path', { d: d, fill: 'var(--aar-rose)', stroke: 'var(--aar-sea)', 'stroke-width': 8, 'stroke-linejoin': 'round' }));
    return s;
  }

  // The beanbags on the rug: dark pink, purple and teal.
  function beanbags(w, h) {
    var s = svg(w, h);
    [[w * 0.2, 'var(--aar-rose)', 1], [w * 0.52, 'var(--aar-plum)', 1.12], [w * 0.82, 'var(--aar-sea)', 0.95]].forEach(function (b) {
      var bw = 120 * b[2], bh = 74 * b[2];
      s.appendChild(el('ellipse', { cx: b[0], cy: h - bh, rx: bw, ry: bh, fill: b[1], stroke: 'var(--aar-night)', 'stroke-width': 4 }));
      s.appendChild(el('ellipse', { cx: b[0] + 10, cy: h - bh * 1.55, rx: bw * 0.5, ry: bh * 0.32, fill: 'var(--aar-night)', opacity: '0.25' }));
    });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-aerial-arbour.html'] = {
    prefix: 'aar-walk',
    from: 'campgrounds.html',
    build: function (kit) {
      var r = seeded(147);
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 1800 + F;                       // the wall across from the door
      var HALF = 900, eye = sh / 2, decor = [];
      var WH = Math.max(sh + 220, 780);

      decor.push(kit.item(canvasWall(HALF * 2 + 200, WH, 0), { x: 0, z: END + 20, w: HALF * 2 + 200, h: WH }));
      decor.push(kit.item(canvasWall(END + 200, WH, 1), { x: -HALF, z: (END + 200) / 2, w: END + 200, h: WH, turn: kit.LEFT }));
      decor.push(kit.item(canvasWall(END + 200, WH, 2), { x: HALF, z: (END + 200) / 2, w: END + 200, h: WH, turn: kit.RIGHT }));
      var swing = kit.item(hammock(560, 320), { x: -HALF + 30, z: END * 0.3, w: 560, h: 320, turn: kit.LEFT });
      decor.push(swing);
      var bags = kit.item(beanbags(600, 200), { x: HALF - 40, z: END * 0.36, w: 600, h: 200, turn: kit.RIGHT });
      decor.push(bags);
      var TH = WH + 260;
      var tree = kit.item(birch(r, 820, TH), { x: -220, z: END * 0.55, w: 820, h: TH });
      decor.push(tree);

      var page = kit.screen(kit.page, 'The Aerial Arbour’s own page, on the wall across from the door');
      var frame = kit.item(page, { x: 260, z: END, w: sw, h: sh, cls: 'aar-walk-frame' });

      var stops = [
        kit.stop({ name: 'just inside the door of the tent, with the birch in the middle', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'under the birch, with the silks, the ladder, the hoop and the pole hanging off it', spot: kit.front(tree, 1100) }, tree),
        kit.stop({ name: 'by the hammock, slung between two of the wall’s poles', spot: kit.front(swing, 650) }, swing),
        kit.stop({ name: 'by the beanbags on the rug', spot: kit.front(bags, 650) }, bags),
        kit.stop({ name: 'at the wall across from the door, with the room’s own page on it', spot: { x: 260, z: END - F }, link: page }, frame)
      ];

      return {
        cls: 'aar-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'A round tent at night, striped purple, teal and dark pink, with a silver birch up the middle. Its own page hangs on the far wall.',
        bounds: function () { return { x: [-HALF + 160, HALF - 160], z: [0, END - F] }; },
        // The round rug the shape of the tent, its dark pink and teal rings,
        // and the crash mat round the tree under everything that hangs.
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--aar-night'));
          kit.oval(g, 0, END * 0.5, HALF + 80, END * 0.5 + 120, kit.ink('--aar-floor'));
          kit.oval(g, 0, END * 0.5, HALF - 10, END * 0.5 + 30, kit.ink('--aar-rose'));
          kit.oval(g, 0, END * 0.5, HALF - 26, END * 0.5 + 14, kit.ink('--aar-floor'));
          kit.oval(g, 0, END * 0.5, HALF - 60, END * 0.5 - 20, kit.ink('--aar-sea'));
          kit.oval(g, 0, END * 0.5, HALF - 74, END * 0.5 - 34, kit.ink('--aar-floor'));
          kit.oval(g, -220, END * 0.55, 560, 420, kit.ink('--aar-steel'));
          kit.oval(g, -220, END * 0.55, 548, 408, kit.ink('--aar-panel'));
        }
      };
    }
  };
})();
