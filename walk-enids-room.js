/* =============================================================================
   Enid's Room, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1 of
   the rooms left on Paper Street.

   IT IS ENID'S ROOM'S WORLD AND NOBODY ELSE'S (§9): black walls, technicolour
   everything else, cut out of card. Somewhere to sit when you are not feeling
   any joy, dark, quiet and funny about it, so the room is lit only by the two
   glows its page has in its corners, violet high up on the far right and green
   low down by the door, with glow-in-the-dark stars stuck up high. The sticker
   wall runs down the left-hand wall, every sticker in one of the room's own
   colours and none of them carrying a word here (the words are on the page);
   the boombox stands silent on a low chest on the right; a bed along the right
   wall, a beanbag, a rug. The room's own page hangs on the far wall.

   THE POLAROID WALL IS NOT IN THE SCENE. Its photographs are people's, under
   consent records that name the pages they appear on, so nothing of it is
   drawn here and nobody is drawn at all: the photographs are seen only on the
   room's own page.

   NOTHING MOVES AND NOTHING MAKES A SOUND. Every colour is one love.css
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Paper Street's screen(). tools/make-paper-street.py
   holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var BRIGHT = ['--pink', '--green', '--yellow', '--cyan', '--violet', '--orange', '--red'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }
  // A five-pointed star, for the glow-in-the-dark ones stuck up high.
  function star(s, x, y, r, ink) {
    var d = '';
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr).toFixed(1) + ' ';
    }
    s.appendChild(el('path', { d: d + 'Z', fill: ink }));
  }

  // A black wall, glow-in-the-dark stars stuck along its top.
  function wall(w, h, glow) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--ink)' }));
    if (glow) [1, 0.75, 0.5, 0.3].forEach(function (k) {
      s.appendChild(el('ellipse', { cx: w * 0.84, cy: h * 0.08, rx: w * 0.22 * k, ry: h * 0.42 * k, fill: 'var(--violet)', 'fill-opacity': '0.06' }));
    });
    for (var x = 60, n = 0; x < w; x += 170, n++) star(s, x, 60 + (n * 47) % 140, 14 + (n % 3) * 4, 'var(--green)');
    s.appendChild(el('rect', { x: 0, y: h - 24, width: w, height: 24, fill: 'var(--ink-2)' }));
    return s;
  }

  // The sticker wall: stickers of every colour, pill and square, stuck on
  // across it.
  function stickers(w, h) {
    var s = svg(w, h), n = 0;
    for (var y = 20; y < h - 60; y += 72) {
      for (var x = 20 + (y / 72 % 2) * 40; x < w - 120; n++) {
        var sw = 110 + (n * 37) % 90;
        s.appendChild(el('rect', { x: x, y: y + (n * 13) % 18, width: sw, height: 48, rx: n % 2 ? 24 : 6,
          fill: 'var(' + BRIGHT[n % BRIGHT.length] + ')' }));
        x += sw + 18;
      }
    }
    return s;
  }

  // The boombox on its low chest, silent.
  function boombox(w, h) {
    var s = svg(w, h), bh = h * 0.5;
    s.appendChild(el('rect', { x: 0, y: bh, width: w, height: h - bh, rx: 8, fill: 'var(--ink-3)' }));
    s.appendChild(el('rect', { x: 20, y: bh + 30, width: w - 40, height: 12, fill: 'var(--ink-2)' }));
    s.appendChild(el('rect', { x: w * 0.1, y: bh * 0.2, width: w * 0.8, height: bh * 0.8, rx: 20, fill: 'var(--pink)' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--cream)', 'stroke-width': 8, d: 'M' + w * 0.28 + ' ' + bh * 0.2 + ' V' + bh * 0.04 + ' H' + w * 0.72 + ' V' + bh * 0.2 }));
    [0.28, 0.72].forEach(function (k) {
      s.appendChild(el('circle', { cx: w * k, cy: bh * 0.62, r: bh * 0.26, fill: 'var(--ink)' }));
      s.appendChild(el('circle', { cx: w * k, cy: bh * 0.62, r: bh * 0.1, fill: 'var(--cyan)' }));
    });
    s.appendChild(el('rect', { x: w * 0.43, y: bh * 0.42, width: w * 0.14, height: bh * 0.3, rx: 4, fill: 'var(--yellow)' }));
    return s;
  }

  // The bed along the wall: a black frame, a violet cover, a pink pillow.
  function bed(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: 40, height: h, rx: 10, fill: 'var(--ink-3)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.45, width: w, height: h * 0.4, rx: 14, fill: 'var(--violet)' }));
    s.appendChild(el('rect', { x: 60, y: h * 0.3, width: w * 0.2, height: h * 0.2, rx: 20, fill: 'var(--pink)' }));
    s.appendChild(el('rect', { x: w * 0.4, y: h * 0.45, width: w * 0.6, height: 16, fill: 'var(--green)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.85, width: w, height: h * 0.15, fill: 'var(--ink-3)' }));
    return s;
  }

  // A beanbag, slumped.
  function beanbag(w, h) {
    var s = svg(w, h);
    s.appendChild(el('path', { fill: 'var(--orange)', d: 'M0 ' + h + ' Q0 ' + h * 0.2 + ' ' + w * 0.45 + ' ' + h * 0.1 + ' Q' + w + ' 0 ' + w + ' ' + h + ' Z' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--red)', 'stroke-width': 6, d: 'M' + w * 0.3 + ' ' + h * 0.5 + ' Q' + w * 0.5 + ' ' + h * 0.65 + ' ' + w * 0.75 + ' ' + h * 0.45 }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['enids-room.html'] = {
    prefix: 'enid-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var END = 2000 + F;                          // the far wall
      var eye = sh / 2;
      var SIDE = 820, WH = Math.max(950, sh + 400);
      var decor = [];

      decor.push(kit.item(wall(SIDE * 2 + 40, WH, true), { x: 0, z: END + 30, w: SIDE * 2 + 40, h: WH }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(wall(END + 400, WH, false), { x: side * SIDE, z: (END - 400) / 2, w: END + 400, h: WH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT, near: 0.3 }));
      });
      var sticks = kit.item(stickers(1600, 520), { x: -SIDE + 6, z: 1100, w: 1600, h: 520, y: 140, turn: kit.LEFT });
      var box = kit.item(boombox(280, 280), { x: SIDE - 200, z: 1300, w: 280, h: 280, turn: -0.9 });
      decor.push(sticks, box);
      decor.push(kit.item(bed(1100, 300), { x: SIDE - 6, z: END - 650, w: 1100, h: 300, turn: kit.RIGHT }));
      decor.push(kit.item(beanbag(300, 200), { x: -380, z: END - 500, w: 300, h: 200 }));

      var page = kit.screen(kit.page, 'Enid’s Room’s own page, on the far wall');
      var leaf = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'enid-walk-wall' });

      var stops = [
        kit.stop({ name: 'inside the door, in the green glow low down by it', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the sticker wall, every sticker its own colour', spot: kit.front(sticks, F * 1.1) }, sticks),
        kit.stop({ name: 'at the boombox on its low chest, silent', spot: kit.front(box, F * 0.7) }, box),
        kit.stop({ name: 'at the far wall, under the violet glow, with the room’s own page on it', spot: { x: 0, z: END - F }, link: page }, leaf)
      ];

      return {
        cls: 'enid-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page hangs on the far wall, under the violet glow.',
        bounds: function () { return { x: [-SIDE + 300, SIDE - 300], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--ink'));
          kit.quad(g, -SIDE, SIDE, Math.max(from, -400), Math.min(to, END), kit.ink('--ink-2'));
          // The rug, and the green glow low down by the door.
          kit.oval(g, -60, 1200, 520, 380, kit.ink('--pink'), 0.5);
          kit.oval(g, -60, 1200, 420, 300, kit.ink('--ink'), 0.6);
          kit.oval(g, -SIDE, 0, 900, 700, kit.ink('--green'), 0.12);
        }
      };
    }
  };
})();
