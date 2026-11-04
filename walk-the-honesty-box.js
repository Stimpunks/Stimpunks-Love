/* =============================================================================
   The Honesty Box, walked up to on Paper Street. Ryan's ask, 2026-11-04: round
   1 of the rooms still to be walked into.

   IT IS THE HONESTY BOX'S WORLD AND NOBODY ELSE'S (§110): a farm stand at the
   kerb at night, a counter under a little roof with a panel on it, and ONE
   WHITE LAMP under the eave throwing a cone of light over the shelves and the
   ground in front. Inside the cone everything keeps its own colour, the pepper
   red and the marigold orange; past it the street is a dark olive night. One
   white lamp is what keeps it off Danny the Street's sodium, and one cone with
   one shadow under each thing keeps it off Nothing For Sale, lit by everybody's
   headlights at once. There is no window and no room, only a counter you walk
   up to, which keeps it off The Small Hours.

   THE PRICES ARE THE PAGE'S. Nothing on the shelves here is labelled or priced:
   the room's own page stands on the painted board by the kerb, beside the
   stand, every item and price as the page has it. What is drawn on the shelves
   is what that board sells: corn, squash, peppers, marigolds, eggs, wool,
   rope, cloth, packets of seed. The box itself is wood with a slot in it.

   NOTHING MOVES. Every colour is one the room declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Paper
   Street's screen(). tools/make-paper-street.py holds each of those.
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

  // The stand: the panel on its roof, the roof, the white lamp under the eave
  // and its cone over the shelves, and what the board sells, on the shelves.
  function stand(w, h) {
    var s = svg(w, h), m = w / 2, roof = 150, top = 210;
    s.appendChild(el('path', { d: 'M40 ' + (roof - 70) + ' L' + (w - 40) + ' ' + (roof - 70) + ' L' + (w - 90) + ' 10 L90 10 Z', fill: 'var(--hbx-pv)' }));
    for (var x = 130; x < w - 120; x += 90) s.appendChild(el('rect', { x: x, y: 18, width: 3, height: roof - 96, fill: 'var(--hbx-post)' }));
    s.appendChild(el('rect', { x: 0, y: roof - 70, width: w, height: 70, fill: 'var(--hbx-roof)' }));
    // The cone, white, falling over the shelves and stopping at the counter.
    s.appendChild(el('path', { d: 'M' + (m - 30) + ' ' + roof + ' L' + (m + 30) + ' ' + roof + ' L' + (w - 30) + ' ' + (h - 170) + ' L30 ' + (h - 170) + ' Z', fill: 'var(--hbx-lamp)', 'fill-opacity': '0.14' }));
    s.appendChild(el('rect', { x: m - 34, y: roof, width: 68, height: 18, fill: 'var(--hbx-post)' }));
    s.appendChild(el('ellipse', { cx: m, cy: roof + 22, rx: 26, ry: 10, fill: 'var(--hbx-lamp)' }));
    [24, w - 48].forEach(function (x) { s.appendChild(el('rect', { x: x, y: roof, width: 24, height: h - roof, fill: 'var(--hbx-wood)' })); });
    // Two shelves of goods and the counter.
    var shelves = [top + 150, top + 320];
    shelves.forEach(function (y) { s.appendChild(el('rect', { x: 48, y: y, width: w - 96, height: 14, fill: 'var(--hbx-wood)' })); });
    var row1 = ['--hbx-corn', '--hbx-squash', '--hbx-pepper', '--hbx-squash', '--hbx-corn', '--hbx-pepper', '--hbx-squash'];
    row1.forEach(function (c, i) {
      var cx = 100 + i * (w - 200) / (row1.length - 1);
      if (c === '--hbx-corn') s.appendChild(el('ellipse', { cx: cx, cy: shelves[0] - 34, rx: 16, ry: 34, fill: 'var(' + c + ')' }));
      else s.appendChild(el('circle', { cx: cx, cy: shelves[0] - 26, r: 26, fill: 'var(' + c + ')' }));
      s.appendChild(el('path', { d: 'M' + (cx - 10) + ' ' + (shelves[0] - 60) + ' l10 -14 l10 14', fill: 'var(--hbx-leaf)' }));
    });
    var row2 = [['--hbx-marigold', 'pot'], ['--hbx-egg', 'carton'], ['--hbx-wool', 'skein'], ['--hbx-rope', 'skein'], ['--hbx-packet', 'packet'], ['--hbx-cloth', 'fold'], ['--hbx-marigold', 'pot']];
    row2.forEach(function (it, i) {
      var cx = 100 + i * (w - 200) / (row2.length - 1), y = shelves[1];
      if (it[1] === 'pot') {
        s.appendChild(el('path', { d: 'M' + (cx - 22) + ' ' + (y - 40) + ' h44 l-6 40 h-32 Z', fill: 'var(--hbx-bag)' }));
        [-14, 0, 14].forEach(function (d) { s.appendChild(el('circle', { cx: cx + d, cy: y - 52, r: 12, fill: 'var(' + it[0] + ')' })); });
      } else if (it[1] === 'carton') {
        s.appendChild(el('rect', { x: cx - 34, y: y - 26, width: 68, height: 26, fill: 'var(--hbx-carton)' }));
        [-20, 0, 20].forEach(function (d) { s.appendChild(el('ellipse', { cx: cx + d, cy: y - 30, rx: 9, ry: 12, fill: 'var(' + it[0] + ')' })); });
      } else if (it[1] === 'skein') {
        s.appendChild(el('ellipse', { cx: cx, cy: y - 22, rx: 30, ry: 22, fill: 'var(' + it[0] + ')' }));
        s.appendChild(el('rect', { x: cx - 4, y: y - 44, width: 8, height: 44, fill: 'var(--hbx-wool-line)' }));
      } else if (it[1] === 'packet') {
        s.appendChild(el('rect', { x: cx - 18, y: y - 48, width: 36, height: 48, fill: 'var(' + it[0] + ')' }));
        s.appendChild(el('rect', { x: cx - 18, y: y - 48, width: 36, height: 8, fill: 'var(--hbx-board)' }));
      } else {
        s.appendChild(el('rect', { x: cx - 32, y: y - 30, width: 64, height: 30, fill: 'var(' + it[0] + ')' }));
        s.appendChild(el('rect', { x: cx - 32, y: y - 18, width: 64, height: 4, fill: 'var(--hbx-dim)' }));
      }
    });
    s.appendChild(el('rect', { x: 0, y: h - 170, width: w, height: 30, fill: 'var(--hbx-wood)' }));
    s.appendChild(el('rect', { x: 20, y: h - 140, width: w - 40, height: 140, fill: 'var(--hbx-roof)' }));
    return s;
  }

  // The honesty box on the counter's end: wood, a slot in the lid, a padlock.
  function box(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: h * 0.25, width: w, height: h * 0.75, fill: 'var(--hbx-wood)' }));
    s.appendChild(el('path', { d: 'M0 ' + (h * 0.25) + ' L' + (w * 0.12) + ' 0 H' + (w * 0.88) + ' L' + w + ' ' + (h * 0.25) + ' Z', fill: 'var(--hbx-roof)' }));
    s.appendChild(el('rect', { x: w * 0.3, y: h * 0.08, width: w * 0.4, height: 10, fill: 'var(--hbx-night)' }));
    s.appendChild(el('rect', { x: w * 0.42, y: h * 0.48, width: w * 0.16, height: h * 0.2, rx: 6, fill: 'var(--hbx-post)' }));
    s.appendChild(el('path', { d: 'M' + (w * 0.45) + ' ' + (h * 0.48) + ' v-16 a' + (w * 0.05) + ' ' + (w * 0.05) + ' 0 0 1 ' + (w * 0.1) + ' 0 v16', fill: 'none', stroke: 'var(--hbx-post)', 'stroke-width': 6 }));
    return s;
  }

  // The post the painted board leans on.
  function post(w, h, sh) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: w / 2 - 20, y: 0, width: 40, height: h, fill: 'var(--hbx-post)' }));
    s.appendChild(el('rect', { x: 0, y: 30, width: w, height: sh + 70, fill: 'var(--hbx-board)' }));
    s.appendChild(el('rect', { x: 0, y: 30, width: w, height: 12, fill: 'var(--hbx-paint)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-honesty-box.html'] = {
    prefix: 'hbx-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var STAND = 1500;                        // where the stand stands
      var END = 2600 + F;                      // where the board stands by the kerb
      var eye = sh / 2 + 160;
      var decor = [];

      var stall = kit.item(stand(1000, 820), { x: -450, z: STAND, w: 1000, h: 820 });
      decor.push(stall);
      var honesty = kit.item(box(150, 130), { x: -40, z: STAND - 60, w: 150, h: 130, y: 170 });
      decor.push(honesty);
      decor.push(kit.item(post(sw + 80, sh + 300, sh), { x: 450, z: END + 20, w: sw + 80, h: sh + 300 }));

      var page = kit.screen(kit.page, 'The Honesty Box’s own page, on the painted board by the kerb');
      var board = kit.item(page, { x: 450, z: END, w: sw, h: sh, y: 160, cls: 'hbx-walk-board' });

      var stops = [
        kit.stop({ name: 'on the pavement at night, the stand’s one lamp ahead', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'in the cone of the lamp, at the shelves', spot: { x: -450, z: STAND - F * 1.1 } }, stall),
        kit.stop({ name: 'at the honesty box on the end of the counter, a slot in its lid', spot: kit.front(honesty, 700) }, honesty),
        kit.stop({ name: 'at the painted board by the kerb, with the room’s own page and every price on it', spot: { x: 450, z: END - F }, link: page }, board)
      ];

      return {
        cls: 'hbx-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The stand is ahead under its one lamp; the room’s own page, with every price, is on the board by the kerb.',
        bounds: function () { return { x: [-700, 700], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--hbx-night'));
          // The kerb along the right, and the road past it.
          kit.quad(g, 900, 940, from, to, kit.ink('--hbx-kerb-edge'));
          kit.quad(g, 940, 4000, from, to, kit.ink('--hbx-kerb'));
          // The lamp's cone on the ground in front of the stand: white, one pool.
          kit.oval(g, -450, STAND - 260, 700, 420, kit.ink('--hbx-lamp'), 0.12);
          kit.oval(g, -450, STAND - 220, 460, 260, kit.ink('--hbx-lamp'), 0.12);
        }
      };
    }
  };
})();
