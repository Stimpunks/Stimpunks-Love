/* =============================================================================
   Rescue A Cat, walked into on Paper Street. Ryan's ask, 2026-11-04: round one
   of the rooms still to be walked into.

   IT IS RESCUE A CAT'S WORLD AND NOBODY ELSE'S (§87): this end of the street
   with the lights out. The fronts are dark, the windows are dark, and the one
   light is a torch, the room's own: on the page it is in your hand, and a scene
   that cannot follow a hand has it set down on the kerb where you came in,
   still on, pointing up the road the way you were looking. Its beam lies on the
   road ahead, and THE ONLY COLOUR ANYWHERE IS EYESHINE: pairs of eyes in the
   dark, under the parked car, halfway up a drainpipe, along the top of a garden
   wall and in a soggy cardboard box, sending the beam back the way it came.
   Two points at a time, paired and looking at you, which keeps it off Stay
   Frosty's thousand beads of damp; a small beam on the ground and not level
   headlights on a sign, which keeps it off the Outskirts; and nothing lit to go
   into, which keeps it off the Small Hours' diner.

   NO CAT IS DRAWN, ONLY EYES. The cats waiting are the shelter's, on its page,
   each in its own torch pool, and a cat drawn here would be a cat the shelter
   does not have; so the eyes are anybody's, nobody is named and nothing says
   how many. The page stands on a board by the kerb, and rescuing and adopting
   are done there, because shelter.js talks to the CB and is never run here.

   NOTHING MOVES: no eye blinks, no tail twitches, at any setting. Every colour
   is one Rescue A Cat declares, by name. It keeps nothing, sends nothing and
   fetches nothing; its page arrives through Paper Street's screen().
   tools/make-paper-street.py holds each of those.
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
  // A pair of eyes, sending the torch's light back.
  function eyes(s, x, y, r) {
    s.appendChild(el('ellipse', { cx: x - r * 1.6, cy: y, rx: r, ry: r * 0.8, fill: 'var(--rac-eye)' }));
    s.appendChild(el('ellipse', { cx: x + r * 1.6, cy: y, rx: r, ry: r * 0.8, fill: 'var(--rac-eye)' }));
  }

  // A row of dark fronts with the lights out: no window lit, a drainpipe, and
  // on the left-hand row a garden wall in front with eyes along its top.
  function fronts(w, h, wall) {
    var s = svg(w, h);
    for (var x = 0, k = 0; x < w; x += 520, k++) {
      var fh = h - 80 - (k % 3) * 120;
      s.appendChild(el('rect', { x: x, y: h - fh, width: 500, height: fh, fill: 'var(--rac-panel)' }));
      for (var r = 0; r < 2; r++) {
        s.appendChild(el('rect', { x: x + 70, y: h - fh + 80 + r * 220, width: 140, height: 160, fill: 'var(--rac-night)' }));
        s.appendChild(el('rect', { x: x + 290, y: h - fh + 80 + r * 220, width: 140, height: 160, fill: 'var(--rac-night)' }));
      }
      s.appendChild(el('rect', { x: x + 470, y: h - fh + 20, width: 14, height: fh - 20, fill: 'var(--rac-night)' }));
      if (k % 3 === 1) eyes(s, x + 477, h - fh * 0.5, 6);
    }
    if (wall) {
      s.appendChild(el('rect', { x: 0, y: h - 220, width: w, height: 220, fill: 'var(--rac-stripe)' }));
      for (var bx = 0; bx < w; bx += 90) s.appendChild(el('rect', { x: bx, y: h - 220, width: 4, height: 220, fill: 'var(--rac-night)' }));
      [0.2, 0.55, 0.8].forEach(function (t, i) { eyes(s, w * t, h - 236, 7 + i); });
    }
    return s;
  }

  // The parked car, a dark shape with the eyes of somebody underneath it.
  function car(w, h) {
    var s = svg(w, h);
    s.appendChild(el('path', { fill: 'var(--rac-panel)', d: 'M0 ' + (h - 60) + ' V' + (h * 0.5) + ' L' + w * 0.2 + ' ' + h * 0.42 + ' L' + w * 0.32 + ' ' + h * 0.08 + ' H' + w * 0.72 + ' L' + w * 0.86 + ' ' + h * 0.42 + ' L' + w + ' ' + h * 0.5 + ' V' + (h - 60) + ' Z' }));
    [0.2, 0.8].forEach(function (t) { s.appendChild(el('circle', { cx: w * t, cy: h - 50, r: 50, fill: 'var(--rac-night)' })); });
    eyes(s, w * 0.5, h - 30, 8);
    return s;
  }

  // A soggy cardboard box on its side, and the eyes inside it.
  function box(w, h) {
    var s = svg(w, h);
    s.appendChild(el('path', { fill: 'var(--rac-fall)', d: 'M0 ' + h + ' V' + h * 0.25 + ' L' + w * 0.18 + ' 0 H' + w + ' V' + h * 0.75 + ' L' + w * 0.82 + ' ' + h + ' Z' }));
    s.appendChild(el('rect', { x: w * 0.08, y: h * 0.3, width: w * 0.66, height: h * 0.62, fill: 'var(--rac-night)' }));
    eyes(s, w * 0.4, h * 0.6, 7);
    return s;
  }

  // THE TORCH, set down on the kerb and still on, pointing up the road.
  function torch(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 10, y: h - 60, width: w * 0.6, height: 40, rx: 12, fill: 'var(--rac-stripe)' }));
    s.appendChild(el('path', { fill: 'var(--rac-stripe)', d: 'M' + w * 0.6 + ' ' + (h - 66) + ' H' + (w - 20) + ' V' + (h - 14) + ' H' + w * 0.6 + ' Z' }));
    s.appendChild(el('ellipse', { cx: w - 18, cy: h - 40, rx: 8, ry: 26, fill: 'var(--rac-beam)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['rescue-a-cat.html'] = {
    prefix: 'rac-walk',
    build: function (kit) {
      var F = kit.F;
      var sh = kit.H - 24;
      var eye = sh / 2;
      var ROAD = 600, LONG = 5200;
      var decor = [];
      var FH = 1000;

      decor.push(kit.item(fronts(LONG, FH, true), { x: -ROAD - 400, z: LONG / 2 - 400, w: LONG, h: FH, turn: kit.LEFT }));
      decor.push(kit.item(fronts(LONG, FH, false), { x: ROAD + 400, z: LONG / 2 - 400, w: LONG, h: FH, turn: kit.RIGHT }));
      decor.push(kit.item(fronts(3200, FH, false), { x: 0, z: LONG - 300, w: 3200, h: FH }));
      decor.push(kit.item(car(560, 260), { x: 360, z: 1500, w: 560, h: 260, turn: -0.2 }));
      decor.push(kit.item(box(220, 160), { x: -480, z: 2300, w: 220, h: 160, turn: 0.3 }));
      decor.push(kit.item(torch(160, 90), { x: 80, z: 160, w: 160, h: 90, turn: 0.15 }));

      // The page, on a board by the kerb, in the panel's dark.
      var PW = Math.min(kit.W - 160, 820), PH = Math.round(PW * 0.62);
      var page = kit.screen(kit.page, 'Rescue A Cat’s own page, on a board by the kerb');
      var board = kit.item(page, { x: -ROAD + 60, z: 1300, w: PW, h: PH, y: 140, turn: 0.6, cls: 'rac-walk-board' });

      var stops = [
        kit.stop({ name: 'by the torch on the kerb, its beam up the dark road', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the board by the kerb, with the shelter’s own page, where the cats are waiting', spot: kit.front(board), link: page }, board),
        kit.stop({ name: 'by the parked car, a pair of eyes under it', spot: { x: 60, z: 1500 - F * 0.8, yaw: 0.4 } }),
        kit.stop({ name: 'by the garden wall, eyes along the top of it and in a soggy box', spot: { x: -200, z: 2300 - F * 0.9, yaw: -0.5 } })
      ];

      return {
        cls: 'rac-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The lights are out; the torch is on the kerb. The shelter’s own page is on a board by the kerb.',
        bounds: function () { return { x: [-ROAD + 100, ROAD - 100], z: [-200, LONG - 1200] }; },
        ground: function (g, near, far) {
          kit.quad(g, -8000, 8000, near, far, kit.ink('--rac-night'));
          kit.quad(g, -ROAD - 400, -ROAD, near, far, kit.ink('--rac-panel'), 0.5);
          kit.quad(g, ROAD, ROAD + 400, near, far, kit.ink('--rac-panel'), 0.5);
          // THE TORCH'S BEAM on the road, widening away from it and fading.
          var beam = kit.ink('--rac-beam');
          for (var k = 0; k < 48; k++) {
            var z0 = 200 + k * 45, half = 40 + k * 13;
            kit.quad(g, 140 - half + k * 4, 140 + half + k * 4, z0, z0 + 46, beam, Math.max(0.02, 0.22 - k * 0.0045));
          }
        }
      };
    }
  };
})();
