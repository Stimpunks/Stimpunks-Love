/* =============================================================================
   The Playhouse, walked into on Paper Street. Ryan's ask, 2026-11-04: round one
   of the rooms still to be walked into.

   IT IS THE PLAYHOUSE'S WORLD AND NOBODY ELSE'S (§10): saturated primary blue,
   bunting along the top of every wall, a checkerboard floor in the room's ink
   and cream, and the toys, each a lump of bright colour with a hard ink edge in
   its own fill and none repeated, as the toys on the page are: the stim box in
   yellow, Chairy in green, the word clock in violet, the yell button in orange,
   and the sound board's nine keys on their stand. It is not the Arcade's coin-op
   at midnight: here it is broad day and the light is even, the way a
   television studio's is.

   THE TOYS ARE DRAWN, NOT LIFTED. Every toy and every key is worked by love.js,
   which binds once, when a page loads, so a copy lifted into the scene would be
   a button that does nothing. So each stands here as a card on its plinth, and
   the room's own page hangs on the back wall under the bunting, where every one
   of them works as itself.

   NOTHING MOVES AND NOTHING MAKES A SOUND here: the noises are the page's, on
   the press. Every colour is one love.css declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var FLAGS = ['var(--red)', 'var(--yellow)', 'var(--green)', 'var(--pink)', 'var(--orange)', 'var(--cyan)', 'var(--violet)'];
  var EDGE = { stroke: 'var(--ink)', 'stroke-width': 8, 'stroke-linejoin': 'round' };

  function el(name, attrs, edged) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (edged) for (k in EDGE) e.setAttribute(k, EDGE[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // A wall: the blue, and bunting along the top in the room's colours, each
  // pennant after the last in turn.
  function wall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--blue)' }));
    s.appendChild(el('path', { d: 'M0 60 Q' + w / 4 + ' 110 ' + w / 2 + ' 60 T' + w + ' 60', fill: 'none', stroke: 'var(--cream)', 'stroke-width': 6 }));
    for (var x = 30, i = 0; x < w - 60; x += 110, i++) {
      var t = x / w, y = 60 + Math.sin(t * Math.PI * 2) * 0 + 25 * Math.sin(t * Math.PI * 2 * 2 - Math.PI / 2) + 25;
      s.appendChild(el('path', { d: 'M' + x + ' ' + y + ' h80 l-40 90 z', fill: FLAGS[i % FLAGS.length] }, true));
    }
    s.appendChild(el('rect', { x: 0, y: h - 30, width: w, height: 30, fill: 'var(--ink)' }));
    return s;
  }

  // A toy on its plinth: the plinth in the room's cream, the toy above it in
  // its own fill, and a drawing that says which toy it is.
  function toy(kind, fill, w, h) {
    var s = svg(w, h), ph = 140, top = h - ph;
    s.appendChild(el('rect', { x: 20, y: top, width: w - 40, height: ph - 4, fill: 'var(--cream)' }, true));
    if (kind === 'box') {
      s.appendChild(el('rect', { x: 50, y: top - 200, width: w - 100, height: 200, fill: fill }, true));
      s.appendChild(el('circle', { cx: w / 2, cy: top - 100, r: 42, fill: 'var(--cream)' }, true));
    } else if (kind === 'chair') {
      s.appendChild(el('rect', { x: 60, y: top - 360, width: w - 120, height: 220, rx: 40, fill: fill }, true));
      s.appendChild(el('rect', { x: 40, y: top - 150, width: w - 80, height: 70, rx: 20, fill: fill }, true));
      s.appendChild(el('rect', { x: 60, y: top - 80, width: 24, height: 80, fill: fill }, true));
      s.appendChild(el('rect', { x: w - 84, y: top - 80, width: 24, height: 80, fill: fill }, true));
    } else if (kind === 'clock') {
      s.appendChild(el('circle', { cx: w / 2, cy: top - 130, r: 120, fill: fill }, true));
      s.appendChild(el('circle', { cx: w / 2, cy: top - 130, r: 86, fill: 'var(--cream)' }, true));
      s.appendChild(el('path', { d: 'M' + w / 2 + ' ' + (top - 130) + ' V' + (top - 196) + ' M' + w / 2 + ' ' + (top - 130) + ' H' + (w / 2 + 48), stroke: 'var(--ink)', 'stroke-width': 10, 'stroke-linecap': 'round' }));
    } else if (kind === 'yell') {
      s.appendChild(el('ellipse', { cx: w / 2, cy: top - 30, rx: w / 2 - 50, ry: 34, fill: 'var(--ink)' }));
      s.appendChild(el('path', { d: 'M' + 70 + ' ' + (top - 30) + ' V' + (top - 110) + ' A' + (w / 2 - 70) + ' 60 0 0 1 ' + (w - 70) + ' ' + (top - 110) + ' V' + (top - 30) + ' Z', fill: fill }, true));
    }
    return s;
  }

  // THE SOUND BOARD's nine keys on their stand, three by three, each its own
  // colour; the mood keys' row along the foot is three noises, never faces.
  function board(w, h) {
    var s = svg(w, h), k = (w - 80) / 3, keys = ['var(--yellow)', 'var(--green)', 'var(--cyan)', 'var(--pink)', 'var(--orange)', 'var(--violet)', 'var(--red)', 'var(--cream)', 'var(--violet-deep)'];
    s.appendChild(el('rect', { x: w / 2 - 20, y: k * 3 + 40, width: 40, height: h - k * 3 - 40, fill: 'var(--ink)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: k * 3 + 60, rx: 20, fill: 'var(--ink)' }));
    for (var i = 0; i < 9; i++) {
      var x = 20 + (i % 3) * (k + 10), y = 20 + Math.floor(i / 3) * (k + 10);
      s.appendChild(el('rect', { x: x, y: y, width: k - 10, height: k - 10, rx: 14, fill: keys[i] }));
      if (i >= 6) {
        var cy = y + (k - 10) / 2, x0 = x + 18, x1 = x + k - 28;
        var d = i === 6 ? 'M' + x0 + ' ' + (cy + 20) + ' Q' + (x0 + x1) / 2 + ' ' + (cy - 30) + ' ' + x1 + ' ' + (cy - 20)
              : i === 7 ? 'M' + x0 + ' ' + (cy - 20) + ' Q' + (x0 + x1) / 2 + ' ' + (cy + 30) + ' ' + x1 + ' ' + (cy + 20)
              : 'M' + x0 + ' ' + cy + ' l12 -18 l12 36 l12 -36 l12 36 l12 -18';
        s.appendChild(el('path', { d: d, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 7, 'stroke-linecap': 'round' }));
      }
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['playhouse.html'] = {
    prefix: 'play-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 2400 + F, HALF = 1000, WH = Math.max(1000, sh + 360);
      var eye = sh / 2, SQ = 200;
      var decor = [];

      decor.push(kit.item(wall(2 * HALF + 200, WH), { x: 0, z: END + 20, w: 2 * HALF + 200, h: WH }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(wall(END + 600, WH), { x: side * HALF, z: END / 2 - 280, w: END + 600, h: WH, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });

      // The toys stand down both sides of the floor, facing the middle.
      var toys = [['box', 'var(--yellow)', -1, 900], ['chair', 'var(--green)', 1, 1100], ['clock', 'var(--violet-deep)', -1, 1700], ['yell', 'var(--orange)', 1, 1900]];
      toys.forEach(function (t) {
        decor.push(kit.item(toy(t[0], t[1], 300, 520), { x: t[2] * 600, z: t[3], w: 300, h: 520 }));
      });
      var sb = { x: 520, z: END - 420, w: 380, h: 620 };
      decor.push(kit.item(board(380, 620), sb));

      // The page, on the back wall under the bunting.
      var page = kit.screen(kit.page, 'The Playhouse’s own page, on the back wall under the bunting');
      var hung = kit.item(page, { x: -120, z: END, w: Math.min(sw, 860), h: sh, cls: 'play-walk-page' });

      var stops = [
        kit.stop({ name: 'inside the door, on the checkerboard', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'among the toys, the stim box and Chairy either side of you', spot: { x: 0, z: 1000 - F * 0.7 } }),
        kit.stop({ name: 'at the sound board, its nine keys on their stand', spot: kit.front(sb, 1000) }),
        kit.stop({ name: 'at the back wall, with the room’s own page, where every toy works', spot: { x: -120, z: END - F }, link: page }, hung)
      ];

      return {
        cls: 'play-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Every toy works on the room’s own page, on the back wall under the bunting.',
        bounds: function () { return { x: [-HALF + 260, HALF - 260], z: [-200, END - F] }; },
        ground: function (g, near, far) {
          var ink = kit.ink('--ink'), cream = kit.ink('--cream');
          kit.quad(g, -5000, 5000, near, far, ink);
          var j0 = Math.floor(Math.max(near, -400) / SQ), j1 = Math.ceil(Math.min(far, END + 40) / SQ);
          for (var j = j0; j < j1; j++) {
            for (var i = -6; i < 6; i++) if ((i + j) % 2 === 0) kit.quad(g, i * SQ, (i + 1) * SQ, j * SQ, (j + 1) * SQ, cream);
          }
        }
      };
    }
  };
})();
