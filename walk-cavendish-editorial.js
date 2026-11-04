/* =============================================================================
   The Editorial Room, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round 1 of the rooms that could not yet be walked into.

   IT IS THE EDITORIAL ROOM'S WORLD AND SHARES NOTHING WITH THE HOUSE IT OPENS
   OFF (§73): a designer's studio at night with every lamp in it switched off,
   and one light table in the middle of the floor, its tilted glass lit from
   beneath with the proofs laid out on it. The table is the only light there
   is: the proofs glow rather than being lit, the floor round the table's feet
   takes a little of it, and nothing else catches anything. The desk lamp on
   the plan chest is drawn switched off, its shade lit only from below. If a
   lamp in here is ever switched on, the room has become a desk.

   THE ONLY COLOURS ARE THE PRINTER'S: the colour bar and the registration
   target on the proofs, in the process inks, carrying no word. Its neighbours
   across the hall are lit from above (the Events Room's column) and by one
   caged bulb (the Operations Room's stripes); nothing here is lit from above
   and nothing casts a stripe. The room's own page hangs on the far wall of the
   studio, to read and press as itself.

   NOTHING MOVES AT ANY SETTING. Every colour is one §73 declares, by name. It
   keeps nothing, sends nothing and fetches nothing; its page arrives through
   Paper Street's screen(). tools/make-paper-street.py holds each of those.
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

  // A proof on the glass: a lit sheet, grey lines for its type, and in its
  // margin the colour bar and a registration target in the process inks.
  function proof(s, x, y, w, h) {
    s.appendChild(el('rect', { x: x, y: y, width: w, height: h, fill: 'var(--ed-glow)', stroke: 'var(--ed-halo)', 'stroke-width': 2 }));
    for (var ly = y + 34; ly < y + h - 40; ly += 16) {
      s.appendChild(el('rect', { x: x + 22, y: ly, width: (w - 44) * (ly % 48 ? 1 : 0.6), height: 5, fill: 'var(--ed-halo)' }));
    }
    ['--ed-process-c', '--ed-process-m', '--ed-process-y', '--ed-ink'].forEach(function (c, i) {
      s.appendChild(el('rect', { x: x + 22 + i * 18, y: y + h - 26, width: 16, height: 12, fill: 'var(' + c + ')' }));
    });
    var tx = x + w - 30, ty = y + h - 20;
    s.appendChild(el('circle', { cx: tx, cy: ty, r: 9, fill: 'none', stroke: 'var(--ed-ink)', 'stroke-width': 2 }));
    s.appendChild(el('rect', { x: tx - 14, y: ty - 1, width: 28, height: 2, fill: 'var(--ed-ink)' }));
    s.appendChild(el('rect', { x: tx - 1, y: ty - 14, width: 2, height: 28, fill: 'var(--ed-ink)' }));
  }

  // The light table: its glass tilted up toward you, lit from beneath, with
  // the proofs on it; a dark frame and legs, and the underside of the frame
  // the only other thing the glass lights.
  function lightTable(w, h) {
    var s = svg(w, h), top = 40, glass = h * 0.52;
    s.appendChild(el('path', { fill: 'var(--ed-desk)',
      d: 'M0 ' + (top + glass + 26) + ' L30 ' + top + ' H' + (w - 30) + ' L' + w + ' ' + (top + glass + 26) + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--ed-glow)',
      d: 'M22 ' + (top + glass + 8) + ' L46 ' + (top + 14) + ' H' + (w - 46) + ' L' + (w - 22) + ' ' + (top + glass + 8) + ' Z' }));
    proof(s, w * 0.12, top + 46, w * 0.22, glass * 0.72);
    proof(s, w * 0.38, top + 30, w * 0.24, glass * 0.78);
    proof(s, w * 0.66, top + 52, w * 0.2, glass * 0.68);
    s.appendChild(el('rect', { x: 0, y: top + glass + 26, width: w, height: 18, fill: 'var(--ed-halo)' }));
    [0.06, 0.94].forEach(function (k) {
      s.appendChild(el('rect', { x: w * k - 14, y: top + glass + 44, width: 28, height: h - top - glass - 44, fill: 'var(--ed-desk)' }));
    });
    s.appendChild(el('rect', { x: w * 0.06, y: h - 70, width: w * 0.88, height: 12, fill: 'var(--ed-desk)' }));
    return s;
  }

  // A plan chest along the wall: shallow drawers, each with a pull, their
  // undersides catching the table's light and nothing else.
  function planChest(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--ed-desk)' }));
    for (var y = 20; y < h - 30; y += 46) {
      s.appendChild(el('rect', { x: 14, y: y + 38, width: w - 28, height: 4, fill: 'var(--ed-halo)' }));
      s.appendChild(el('rect', { x: w / 2 - 50, y: y + 16, width: 100, height: 8, rx: 4, fill: 'var(--ed-dim)' }));
    }
    return s;
  }

  // The desk lamp on top of the chest, switched off: an arm and a shade, lit
  // only from below.
  function deskLamp(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 20, y: h - 16, width: 90, height: 16, fill: 'var(--ed-desk)' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--ed-desk)', 'stroke-width': 10,
      d: 'M64 ' + (h - 16) + ' L120 ' + (h * 0.4) + ' L' + (w - 70) + ' ' + (h * 0.22) }));
    s.appendChild(el('path', { fill: 'var(--ed-desk)', d: 'M' + (w - 110) + ' ' + (h * 0.12) + ' L' + (w - 20) + ' ' + (h * 0.3) + ' L' + (w - 60) + ' ' + (h * 0.42) + ' Z' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--ed-halo)', 'stroke-width': 4,
      d: 'M' + (w - 20) + ' ' + (h * 0.3) + ' L' + (w - 60) + ' ' + (h * 0.42) }));
    return s;
  }

  // The studio's far wall, dark, and the frame the page hangs in.
  function wall(w, h, fw, fh) {
    var s = svg(w, h), cx = w / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--ed-studio)' }));
    if (fw) s.appendChild(el('rect', { x: cx - fw / 2 - 20, y: h - fh - 60, width: fw + 40, height: fh + 40, fill: 'var(--ed-desk)' }));
    s.appendChild(el('rect', { x: 0, y: h - 30, width: w, height: 30, fill: 'var(--ed-desk)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['cavendish-editorial.html'] = {
    prefix: 'ed-walk',
    from: 'cavendish-coworking.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var END = 2600 + F;                       // where the page hangs
      var eye = sh / 2, TABLE = 1500;
      var decor = [];

      decor.push(kit.item(wall(3400, Math.max(1400, sh + 600), sw, sh), { x: 0, z: END + 30, w: 3400, h: Math.max(1400, sh + 600) }));
      var table = kit.item(lightTable(820, 440), { x: 0, z: TABLE, w: 820, h: 440 });
      decor.push(table);
      decor.push(kit.item(planChest(1100, 300), { x: -760, z: TABLE + 200, w: 1100, h: 300, turn: kit.LEFT }));
      decor.push(kit.item(deskLamp(300, 280), { x: -740, z: TABLE + 420, w: 300, h: 280, y: 300, turn: kit.LEFT }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(wall(END + 400, Math.max(1400, sh + 600), 0, 0), { x: side * 1100, z: (END + 400) / 2 - 200, w: END + 400,
          h: Math.max(1400, sh + 600), turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });

      var page = kit.screen(kit.page, 'The Editorial Room’s own page, on the studio’s far wall');
      var hung = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'ed-walk-leaf' });

      var stops = [
        kit.stop({ name: 'inside the door, the studio dark round the light table', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the light table, the proofs lit from beneath', spot: kit.front(table) }, table),
        kit.stop({ name: 'beside the plan chest, the desk lamp on it switched off', spot: { x: -380, z: TABLE + 200, yaw: -kit.LEFT } }),
        kit.stop({ name: 'at the far wall, with the room’s own page on it', spot: { x: 0, z: END - F }, link: page }, hung)
      ];

      return {
        cls: 'ed-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on the far wall, past the light table.',
        bounds: function () { return { x: [-560, 560], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--ed-studio'));
          // The table's light reaching the floor round its feet, and nowhere else.
          kit.oval(g, 0, TABLE + 60, 560, 180, kit.ink('--ed-halo'), 0.6);
          kit.oval(g, 0, TABLE + 60, 380, 110, kit.ink('--ed-halo'), 0.6);
        }
      };
    }
  };
})();
