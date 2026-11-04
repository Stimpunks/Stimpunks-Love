/* =============================================================================
   The Cooldown Room, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round 1 of the rooms that could not yet be walked into.

   IT IS THE COOLDOWN ROOM'S WORLD AND SHARES NOTHING WITH THE HANGAR IT OPENS
   OFF (§69). The hangar is immense, black, steel and light you can see in the
   air; this is the size of a living room, soft, low and still: couches round
   the walls, floor cushions, a low table with cups on it, a water cooler in
   the corner, and the room's own page on the wall facing the couches, to read
   and press as itself (the machine's slots are on it, free, each saying what
   is in it and how it feels).

   IT IS LIT BY THE VENDING MACHINE, one tall, steady, pale panel against the
   right-hand wall at about the height of your head, the snacks standing in
   their rows behind the lit glass in the slots' own inks, its light going OUT
   across the room: a pale pool on the floor in front of it, and a pale edge
   along the top of each couch's back. There is no lamp, no flame and no brown.
   It is not the Doom Scoop's cabinet, which lights down into its own tubs, and
   the glass is not a screen.

   NOTHING MOVES AT ANY SETTING and nothing makes a sound. Every colour is one
   §69 declares, by name. It keeps nothing, sends nothing and fetches nothing;
   its page arrives through Paper Street's screen(). tools/make-paper-street.py
   holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var SNACKS = ['--cool-mint', '--cool-coral', '--cool-lilac', '--cool-butter', '--cool-sky', '--cool-rose'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // The vending machine: a dark cabinet, the lit glass, the snacks in rows
  // behind it, and the tray at the foot.
  function machine(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, rx: 10, fill: 'var(--cool-cabinet)' }));
    s.appendChild(el('rect', { x: 24, y: 30, width: w * 0.7, height: h * 0.68, fill: 'var(--cool-glass)' }));
    var rows = 5, rh = h * 0.68 / rows;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < 4; c++) {
        var x = 40 + c * (w * 0.7 - 30) / 4, y = 30 + r * rh;
        s.appendChild(el('rect', { x: x, y: y + rh * 0.25, width: (w * 0.7 - 30) / 4 - 16, height: rh * 0.55, rx: 6, fill: 'var(' + SNACKS[(r * 4 + c * 3) % SNACKS.length] + ')' }));
      }
      s.appendChild(el('rect', { x: 24, y: 30 + (r + 1) * rh - 6, width: w * 0.7, height: 6, fill: 'var(--cool-ink-2)' }));
    }
    s.appendChild(el('rect', { x: w * 0.78, y: 50, width: w * 0.16, height: h * 0.3, rx: 6, fill: 'var(--cool-couch)' }));
    s.appendChild(el('rect', { x: 40, y: h * 0.8, width: w * 0.66, height: h * 0.1, rx: 6, fill: 'var(--cool-shade)' }));
    return s;
  }

  // A couch: soft and low, its back's top edge pale where the machine's light
  // catches it.
  function couch(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h * 0.6, rx: 30, fill: 'var(--cool-couch)' }));
    s.appendChild(el('rect', { x: 20, y: 0, width: w - 40, height: 8, rx: 4, fill: 'var(--cool-glass)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.5, width: w, height: h * 0.32, rx: 18, fill: 'var(--cool-cabinet)' }));
    for (var x = w / 3; x < w - 20; x += w / 3) s.appendChild(el('rect', { x: x - 2, y: h * 0.52, width: 4, height: h * 0.28, fill: 'var(--cool-couch)' }));
    s.appendChild(el('rect', { x: 14, y: h * 0.82, width: w - 28, height: h * 0.18, fill: 'var(--cool-shade)' }));
    return s;
  }

  // The low table with cups on it, each its own colour.
  function lowTable(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: h * 0.5, width: w, height: 20, fill: 'var(--cool-cabinet)' }));
    [0.06, 0.94].forEach(function (k) { s.appendChild(el('rect', { x: w * k - 8, y: h * 0.5 + 20, width: 16, height: h * 0.5 - 20, fill: 'var(--cool-cabinet)' })); });
    ['--cool-mint', '--cool-rose', '--cool-sky'].forEach(function (c, i) {
      var x = w * (0.25 + i * 0.22);
      s.appendChild(el('path', { fill: 'var(' + c + ')', d: 'M' + (x - 22) + ' ' + (h * 0.5 - 50) + ' H' + (x + 22) + ' L' + (x + 16) + ' ' + (h * 0.5) + ' H' + (x - 16) + ' Z' }));
    });
    return s;
  }

  // The water cooler in the corner: its bottle in the sky's blue, and the tap.
  function cooler(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: w * 0.15, y: h * 0.42, width: w * 0.7, height: h * 0.58, rx: 8, fill: 'var(--cool-cabinet)' }));
    s.appendChild(el('rect', { x: w * 0.2, y: 0, width: w * 0.6, height: h * 0.4, rx: 30, fill: 'var(--cool-sky)' }));
    s.appendChild(el('rect', { x: w * 0.45, y: h * 0.56, width: w * 0.1, height: 30, fill: 'var(--cool-glass)' }));
    return s;
  }

  // A wall of the room: dark, soft, nothing on it.
  function wall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cool-room)' }));
    s.appendChild(el('rect', { x: 0, y: h - 30, width: w, height: 30, fill: 'var(--cool-shade)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['cooldown-room.html'] = {
    prefix: 'cool-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var END = 1700 + F, WIDE = 900;              // a living room's size
      var eye = sh / 2, WH = Math.max(1000, sh + 460), decor = [];

      decor.push(kit.item(wall(2 * WIDE + 40, WH), { x: 0, z: END + 30, w: 2 * WIDE + 40, h: WH }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(wall(END + 300, WH), { x: side * WIDE, z: (END + 300) / 2 - 300, w: END + 300, h: WH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var vend = kit.item(machine(360, 620), { x: WIDE - 230, z: 1250, w: 360, h: 620, turn: -0.8 });
      decor.push(vend);
      decor.push(kit.item(couch(900, 300), { x: -WIDE + 120, z: 1100, w: 900, h: 300, turn: kit.LEFT }));
      decor.push(kit.item(couch(760, 300), { x: -260, z: END - 140, w: 760, h: 300 }));
      decor.push(kit.item(lowTable(420, 160), { x: -420, z: 1150, w: 420, h: 160, turn: kit.LEFT }));
      decor.push(kit.item(cooler(140, 360), { x: WIDE - 120, z: END - 120, w: 140, h: 360 }));

      var page = kit.screen(kit.page, 'The Cooldown Room’s own page, on the wall over the far couch');
      var hung = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: 300, cls: 'cool-walk-leaf' });

      var stops = [
        kit.stop({ name: 'inside the door, shut on the noise behind you', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the vending machine, its glass lit and steady', spot: kit.front(vend, 700) }, vend),
        kit.stop({ name: 'by the couches and the low table, in the machine’s light', spot: { x: -200, z: 700, yaw: -kit.LEFT } }),
        kit.stop({ name: 'at the far wall, with the room’s own page over the couch', spot: kit.front(hung), link: page }, hung)
      ];

      return {
        cls: 'cool-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on the far wall, over the couch.',
        bounds: function () { return { x: [-WIDE + 300, WIDE - 300], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--cool-shade'));
          // A soft rug, and floor cushions on it; the machine's pale pool on the
          // floor in front of it, going out across the room.
          kit.oval(g, -200, 1100, 620, 380, kit.ink('--cool-couch'), 1);
          [['--cool-lilac', -480, 900], ['--cool-butter', -60, 1300], ['--cool-mint', -320, 1500]].forEach(function (c) {
            kit.oval(g, c[1], c[2], 80, 60, kit.ink(c[0]), 0.9);
          });
          kit.oval(g, WIDE - 200, 1200, 420, 300, kit.ink('--cool-glass'), 0.1);
        }
      };
    }
  };
})();
