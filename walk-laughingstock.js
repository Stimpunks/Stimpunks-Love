/* =============================================================================
   Laughingstock, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   one of the rest of the rooms, each its own world in card.

   IT IS THE COMEDY CELLAR'S WORLD AND NOBODY ELSE'S (§41), SEEN FROM THE BACK
   OF THE HOUSE. One follow spot behind you throws one hard-edged pool onto the
   brick at the far end, and every shadow in it falls straight back onto the
   brick. In the pool are a mic on its stand and a stool with a glass of water
   on it, and NOBODY: the only people on that stage are the comics in their own
   sets, and nobody draws their bodies for them. The house between you and it
   is small round tables, dark, with the room's name in neon on the side wall.

   NOTHING OF OURS STANDS IN THE LIGHT. The room's own page is full of our
   words, so it stands out in the house, on a board by the way in, never in
   the pool: --ls-spot is only ever where the light lands. The brick is red and
   never brown (brown is the Den); the neon is steady and the water is still,
   because nothing in the cellar moves at any setting. Every colour is one §41
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

  // The brick wall at the end, and the pool on it. Inside the pool the joints
  // catch the light; outside it the brick goes dark into the house. Where the
  // stand and the stool are, their shadows lie straight back on the brick.
  function wall(w, h, cx, cy, a, b) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--ls-joint)' }));
    var bw = 64, bh = 26;
    for (var row = 0, y = 0; y < h; y += bh + 6, row++) {
      for (var x = (row % 2) * -bw / 2; x < w; x += bw + 6) {
        s.appendChild(el('rect', { x: x, y: y, width: bw, height: bh, fill: 'var(--ls-wall)' }));
      }
    }
    s.appendChild(el('ellipse', { cx: cx, cy: cy, rx: a, ry: b, fill: 'var(--ls-spot)' }));
    // The bricks in the pool, lit red, their joints lit too.
    for (row = 0, y = 0; y < h; y += bh + 6, row++) {
      var m = y + bh / 2 - cy;
      if (Math.abs(m) >= b) continue;
      var half = a * Math.sqrt(1 - (m * m) / (b * b)) - 6;
      for (x = (row % 2) * -bw / 2; x < w; x += bw + 6) {
        var x0 = Math.max(x, cx - half), x1 = Math.min(x + bw, cx + half);
        if (x1 - x0 > 4) s.appendChild(el('rect', { x: x0, y: y, width: x1 - x0, height: bh, fill: 'var(--ls-brick)' }));
      }
    }
    s.appendChild(el('ellipse', { cx: cx, cy: cy, rx: a, ry: b, fill: 'none', stroke: 'var(--ls-joint-lit)', 'stroke-width': 4 }));
    // The shadows, thrown straight back: the stand's line, the stool's legs.
    s.appendChild(el('rect', { x: cx - 160, y: cy - b * 0.25, width: 12, height: b * 1.1, fill: 'var(--ls-joint)', 'fill-opacity': '0.55' }));
    s.appendChild(el('circle', { cx: cx - 154, cy: cy - b * 0.3, r: 26, fill: 'var(--ls-joint)', 'fill-opacity': '0.55' }));
    s.appendChild(el('rect', { x: cx + 90, y: cy + b * 0.2, width: 150, height: 14, fill: 'var(--ls-joint)', 'fill-opacity': '0.5' }));
    return s;
  }

  // The stage, a low black platform with its edge just catching the pool.
  function stage(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--ls-deep)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 6, fill: 'var(--ls-edge)' }));
    return s;
  }

  // The mic on its stand: the only thing on the stage anybody holds, and
  // nobody is holding it.
  function mic(w, h) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: m - 4, y: 40, width: 8, height: h - 50, fill: 'var(--ls-ink)' }));
    s.appendChild(el('path', { d: 'M' + (m - 40) + ' ' + h + ' L' + m + ' ' + (h - 18) + ' L' + (m + 40) + ' ' + h, fill: 'none', stroke: 'var(--ls-ink)', 'stroke-width': 8 }));
    s.appendChild(el('rect', { x: m - 11, y: 6, width: 22, height: 46, rx: 11, fill: 'var(--ls-ink)' }));
    return s;
  }

  // The stool, and the glass of water on it, still.
  function stool(w, h) {
    var s = svg(w, h), m = w / 2, top = 70;
    s.appendChild(el('rect', { x: m - 50, y: top, width: 100, height: 14, rx: 6, fill: 'var(--ls-ink)' }));
    s.appendChild(el('path', { d: 'M' + (m - 40) + ' ' + h + ' L' + (m - 26) + ' ' + (top + 14) + ' M' + (m + 40) + ' ' + h + ' L' + (m + 26) + ' ' + (top + 14),
      stroke: 'var(--ls-ink)', 'stroke-width': 8, fill: 'none' }));
    s.appendChild(el('rect', { x: m - 50, y: h - 60, width: 100, height: 6, fill: 'var(--ls-ink)' }));
    s.appendChild(el('path', { d: 'M' + (m - 14) + ' ' + (top - 50) + ' L' + (m - 11) + ' ' + top + ' H' + (m + 11) + ' L' + (m + 14) + ' ' + (top - 50) + ' Z',
      fill: 'none', stroke: 'var(--ls-ink-2)', 'stroke-width': 3 }));
    s.appendChild(el('rect', { x: m - 12, y: top - 30, width: 24, height: 28, fill: 'var(--ls-edge)', 'fill-opacity': '0.4' }));
    return s;
  }

  // A small round table in the house, two chairs pulled in, a glass on it.
  function table(w, h) {
    var s = svg(w, h), m = w / 2, top = h - 120;
    s.appendChild(el('ellipse', { cx: m, cy: top, rx: 80, ry: 12, fill: 'var(--ls-ink-2)' }));
    s.appendChild(el('rect', { x: m - 5, y: top, width: 10, height: 120, fill: 'var(--ls-ink)' }));
    s.appendChild(el('ellipse', { cx: m, cy: h - 4, rx: 40, ry: 5, fill: 'var(--ls-ink)' }));
    [-1, 1].forEach(function (side) {
      var cx = m + side * 120;
      s.appendChild(el('rect', { x: cx - 30, y: top - 70, width: 60, height: 70, rx: 8, fill: 'var(--ls-house)', stroke: 'var(--ls-edge)', 'stroke-width': 2 }));
      s.appendChild(el('rect', { x: cx - 34, y: top + 10, width: 68, height: 12, fill: 'var(--ls-house)', stroke: 'var(--ls-edge)', 'stroke-width': 2 }));
      s.appendChild(el('rect', { x: cx - 28, y: top + 22, width: 6, height: 98, fill: 'var(--ls-edge)' }));
      s.appendChild(el('rect', { x: cx + 22, y: top + 22, width: 6, height: 98, fill: 'var(--ls-edge)' }));
    });
    s.appendChild(el('rect', { x: m + 20, y: top - 34, width: 16, height: 30, fill: 'none', stroke: 'var(--ls-edge)', 'stroke-width': 2 }));
    return s;
  }

  // The side wall of the house, brick in the dark, and the neon on it: the
  // room's name in one steady tube.
  function sideWall(w, h, neonAt) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--ls-house)' }));
    for (var y = 0; y < h; y += 32) s.appendChild(el('rect', { x: 0, y: y, width: w, height: 3, fill: 'var(--ls-joint)' }));
    if (neonAt != null) {
      var t = el('text', { x: neonAt, y: h * 0.24, 'text-anchor': 'middle', 'font-family': 'Yellowtail, cursive', 'font-size': 120, fill: 'var(--ls-neon)' });
      t.textContent = 'Laughingstock';
      s.appendChild(t);
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['laughingstock.html'] = {
    prefix: 'laughs-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 2800 + F;                       // the brick at the end, where the light lands
      var SIDE = 900, eye = sh / 2, WH = sh + 420;
      var decor = [];

      var pool = { x: 0, y: eye + 40 };
      decor.push(kit.item(wall(SIDE * 2 + 200, WH, SIDE + 100, WH - pool.y - 20, 420, 300), { x: 0, z: END + 40, w: SIDE * 2 + 200, h: WH }));
      decor.push(kit.item(stage(SIDE * 2, 70), { x: 0, z: END - 380, w: SIDE * 2, h: 70 }));
      var stand = kit.item(mic(120, 340), { x: -150, z: END - 140, w: 120, h: 340, y: 70 });
      decor.push(stand, kit.item(stool(160, 270), { x: 160, z: END - 120, w: 160, h: 270, y: 70 }));
      decor.push(kit.item(sideWall(END + 400, WH, null), { x: SIDE + 100, z: (END + 400) / 2, w: END + 400, h: WH, turn: kit.RIGHT }));
      decor.push(kit.item(sideWall(END + 400, WH, END - 900), { x: -SIDE - 100, z: (END + 400) / 2, w: END + 400, h: WH, turn: kit.LEFT }));
      [[-420, 1000], [380, 1300], [-200, 1800], [460, 2200], [-500, 2500]].forEach(function (t) {
        decor.push(kit.item(table(360, 240), { x: t[0], z: t[1], w: 360, h: 240 }));
      });

      // The page, out in the house on a board by the way in, facing down the
      // room as the audience does.
      var bw = Math.min(sw, 820);
      var page = kit.screen(kit.page, 'Laughingstock’s own page, on a board in the house by the way in');
      var board = kit.item(page, { x: -SIDE + 160 + bw / 2, z: 900, w: bw, h: sh, cls: 'laughs-walk-board' });

      var stops = [
        kit.stop({ name: 'at the back of the house, under the follow spot', spot: { x: 160, z: 0 } }),
        kit.stop({ name: 'at the board by the way in, with the room’s own page out in the house', spot: { x: board.x, z: board.z - F }, link: page }, board),
        kit.stop({ name: 'at a table in the middle of the house, facing the stage', spot: { x: 0, z: 1500 } }),
        kit.stop({ name: 'at the front, facing the pool: the mic on its stand, the stool and a glass of water, and nobody', spot: { x: 0, z: END - 1100 } })
      ];

      return {
        cls: 'laughs-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 160, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The pool of light is on the brick at the far end; its own page is out in the house, on a board by the way in.',
        bounds: function () { return { x: [-SIDE + 260, SIDE - 260], z: [0, END - 1100] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--ls-deep'));
          // The boards of the house, dark, and the stage's floor in the pool's
          // spill, which is all the floor the light reaches.
          var joint = kit.ink('--ls-house');
          for (var x = -SIDE; x <= SIDE; x += 120) kit.quad(g, x - 3, x + 3, Math.max(near, 0), Math.min(far, END - 380), joint);
          kit.oval(g, 0, END - 220, 520, 160, kit.ink('--ls-spot'), 0.12);
        }
      };
    }
  };
})();
