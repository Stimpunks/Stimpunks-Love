/* =============================================================================
   The Small Hours, walked into on Paper Street, down turning 05 off the
   Outskirts. Ryan's ask, 2026-11-04: round 1 of the rooms you can walk into.

   IT IS THE ROOM'S OWN WORLD (§44): AN ALL-NIGHT DINER SEEN FROM THE CAR PARK.
   You arrive out on the dark tarmac between the painted bays, and the diner is
   one long low box with a band of plate glass all down its front, lit evenly
   from inside by tubes. The light lies out across the lot in pale shapes, one
   under every window, and nothing else out there is lit but the steady sign on
   the roof. The room's own page is in the middle window, because everything
   the diner has to say is written inside a window.

   DEAD TIRED SOCIETY IS THE ROOM TO WATCH: also tubes and a shape of light on a
   floor, but there you sit in the dark and the light is in a corridor nobody
   stands in. Here the light is inside and you are the one out in the dark, so
   no word is set out on the lot. THE TUBES DO NOT FLICKER and the sign is
   steady: nothing moves at any setting. Nothing here reads the clock or says
   when it shuts. Every colour is one §44 declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
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

  // The diner's long front: a low wall, a band of lit glass in chrome frames,
  // booths seen through it, the door at the end, a flat roof. The middle pane
  // is left open, because the page stands in it.
  function diner(w, h, gap, gh) {
    var s = svg(w, h), cx = w / 2, sill = h - 150, top = sill - gh;
    s.appendChild(el('rect', { x: 0, y: top - 120, width: w, height: h - top + 120, fill: 'var(--sh-wall)' }));
    s.appendChild(el('rect', { x: 0, y: top - 150, width: w, height: 30, fill: 'var(--sh-chrome)' }));
    s.appendChild(el('rect', { x: 0, y: sill, width: w, height: 14, fill: 'var(--sh-chrome)' }));
    var panes = [];
    for (var x = 60; x + 300 <= w - 60; x += 340) {
      if (x + 300 > cx - gap / 2 - 30 && x < cx + gap / 2 + 30) continue;
      panes.push(x);
      s.appendChild(el('rect', { x: x, y: top, width: 300, height: gh, fill: 'var(--sh-glass)' }));
      // A booth seen through the glass: red vinyl backs, a teal table.
      s.appendChild(el('rect', { x: x + 30, y: sill - 120, width: 70, height: 120, rx: 14, fill: 'var(--sh-neon)' }));
      s.appendChild(el('rect', { x: x + 200, y: sill - 120, width: 70, height: 120, rx: 14, fill: 'var(--sh-neon)' }));
      s.appendChild(el('rect', { x: x + 90, y: sill - 74, width: 120, height: 14, fill: 'var(--sh-teal)' }));
      s.appendChild(el('rect', { x: x - 6, y: top - 6, width: 312, height: gh + 12, fill: 'none', stroke: 'var(--sh-chrome)', 'stroke-width': 10 }));
    }
    // The door at the end, glass in a chrome frame.
    s.appendChild(el('rect', { x: w - 200, y: top - 40, width: 140, height: h - top + 40, fill: 'var(--sh-pale)', stroke: 'var(--sh-chrome)', 'stroke-width': 12 }));
    s.appendChild(el('rect', { x: w - 90, y: sill - 120, width: 12, height: 80, fill: 'var(--sh-chrome)' }));
    return s;
  }

  // The sign on the roof, steady: a tube in the room's neon, round a dark plate.
  function sign(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 6, y: 6, width: w - 12, height: h - 60, rx: 30, fill: 'var(--sh-lot)', stroke: 'var(--sh-neon)', 'stroke-width': 10 }));
    s.appendChild(el('rect', { x: 40, y: 40, width: w - 80, height: h - 128, rx: 18, fill: 'none', stroke: 'var(--sh-aqua)', 'stroke-width': 6 }));
    s.appendChild(el('rect', { x: w / 2 - 70, y: h - 54, width: 12, height: 54, fill: 'var(--sh-line)' }));
    s.appendChild(el('rect', { x: w / 2 + 58, y: h - 54, width: 12, height: 54, fill: 'var(--sh-line)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['small-hours.html'] = {
    prefix: 'sh-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 2600 + F;                       // the diner's front
      var SILL = 150, eye = sh / 2 + SILL, decor = [];
      var DH = sh + SILL + 300;

      decor.push(kit.item(diner(3800, DH, sw, sh), { x: 0, z: END + 10, w: 3800, h: DH }));
      decor.push(kit.item(sign(900, 360), { x: -900, z: END + 60, w: 900, h: 360, y: DH }));

      var page = kit.screen(kit.page, 'The Small Hours’ own page, in the diner’s middle window');
      var pane = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: SILL, cls: 'sh-walk-window' });

      var stops = [
        kit.stop({ name: 'out on the car park, in the dark between the bays', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'in the light from the windows, under the sign on the roof', spot: { x: -700, z: END - F * 1.6 } }),
        kit.stop({ name: 'at the middle window, with the room’s own page inside it', spot: { x: 0, z: END - F }, link: page }, pane)
      ];

      return {
        cls: 'sh-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is in the middle window of the diner, across the lot.',
        bounds: function () { return { x: [-1500, 1500], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--sh-lot'));
          // The bays, painted on the tarmac.
          var line = kit.ink('--sh-line');
          for (var x = -1800; x <= 1800; x += 360) kit.quad(g, x - 6, x + 6, END - 1500, END - 300, line);
          kit.quad(g, -1800, 1800, END - 1500, END - 1488, line);
          // The windows' light lying out across the lot, one shape to a pane.
          var pale = kit.ink('--sh-pale');
          for (var p = -1840; p + 300 <= 1840; p += 340) {
            if (p + 300 > -sw / 2 - 30 && p < sw / 2 + 30) continue;
            floor4(g, p, p + 300, END, 520, pale);
          }
          floor4(g, -sw / 2, sw / 2, END, 620, pale);
        }
      };
      // A window's light on the tarmac, splaying a little as it comes out.
      function floor4(g, x0, x1, z, d, ink) {
        for (var k = 0; k < 4; k++) kit.quad(g, x0 - k * 20, x1 + k * 20, z - d * (k + 1) / 4, z - d * k / 4, ink, 0.16 - k * 0.03);
      }
    }
  };
})();
