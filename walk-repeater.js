/* =============================================================================
   The Repeater, walked into on Paper Street. Ryan's ask, 2026-11-04: round one
   of the rooms still to be walked into. On Cel Street it is turning 06 off the
   Outskirts; here it is reached by its address or the teleporter.

   IT IS THE REPEATER'S WORLD AND NOBODY ELSE'S (§45): a radio mast and its hut
   on the ridge at the far end of the road, and EVERYTHING IS A SILHOUETTE.
   Nothing up here is lit. The cloud is, faintly, from beneath, by every lit
   thing on the road and the town past it, so the backcloth is a sky the colour
   of somebody else's light, the glow low along the horizon and the dull warm
   cloud above it, and the ridge, the hut, the mast and the boards are cut out
   of card in one flat black against it. Nothing has a lit face, which keeps it
   off Breaker Breaker, the street's other radio, where every shape is drawn dot
   to dot by its own lamps; and the sky is warm, which keeps it off the
   campgrounds, whose sky is cold and blue and lit by nothing.

   THE TWO LAMPS ON THE MAST ARE STEADY. They light nothing round them and they
   do not blink. The room's own page stands on a board beside the track up to
   the hut, and the open line is worked there, by the page's own repeater.js,
   which makes a quiet noise in the browser and sends and listens to nothing.

   NOTHING MOVES, at any setting. Every colour is one §45 declares, by name. It
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
  var BLACK = 'var(--rp-ridge)';

  // THE MAST: a lattice tower tapering up, its stays, and its two steady lamps.
  function mast(w, h) {
    var s = svg(w, h), cx = w / 2, base = 120, tip = 18;
    var at = function (y) { return base + (tip - base) * (1 - y / h); };
    s.appendChild(el('path', { fill: 'none', stroke: BLACK, 'stroke-width': 10,
      d: 'M' + (cx - base / 2) + ' ' + h + ' L' + (cx - tip / 2) + ' 40 M' + (cx + base / 2) + ' ' + h + ' L' + (cx + tip / 2) + ' 40' }));
    for (var y = h - 60, k = 0; y > 80; y -= 70, k++) {
      var a = at(y) / 2, b = at(y - 70) / 2;
      s.appendChild(el('path', { fill: 'none', stroke: BLACK, 'stroke-width': 5,
        d: 'M' + (cx - a) + ' ' + y + ' H' + (cx + a) + (k % 2 ? ' L' + (cx - b) + ' ' + (y - 70) : ' L' + (cx + b) + ' ' + (y - 70)) }));
    }
    s.appendChild(el('rect', { x: cx - 4, y: 0, width: 8, height: 60, fill: BLACK }));
    // Its stays, out to the ground either side.
    s.appendChild(el('path', { fill: 'none', stroke: BLACK, 'stroke-width': 3, d: 'M' + cx + ' ' + h * 0.3 + ' L0 ' + h + ' M' + cx + ' ' + h * 0.3 + ' L' + w + ' ' + h }));
    s.appendChild(el('circle', { cx: cx, cy: 8, r: 9, fill: 'var(--rp-lamp)' }));
    s.appendChild(el('circle', { cx: cx, cy: h * 0.5, r: 8, fill: 'var(--rp-lamp)' }));
    return s;
  }

  // THE HUT: a box with a pitched roof, a door and a chimney pipe, in black.
  function hut(w, h) {
    var s = svg(w, h);
    s.appendChild(el('path', { fill: BLACK, d: 'M0 ' + h + ' V' + h * 0.38 + ' L' + w / 2 + ' ' + h * 0.08 + ' L' + w + ' ' + h * 0.38 + ' V' + h + ' Z' }));
    s.appendChild(el('rect', { x: w * 0.72, y: 0, width: 26, height: h * 0.3, fill: BLACK }));
    return s;
  }

  // The ridge, rising behind the hut and falling away either side.
  function ridge(w, h) {
    var s = svg(w, h);
    s.appendChild(el('path', { fill: BLACK, d: 'M0 ' + h + ' V' + h * 0.7 + ' Q' + w * 0.3 + ' ' + h * 0.55 + ' ' + w * 0.5 + ' ' + h * 0.4 + ' Q' + w * 0.7 + ' ' + h * 0.6 + ' ' + w + ' ' + h * 0.75 + ' V' + h + ' Z' }));
    return s;
  }

  // A board on two posts by the track, in black against the sky.
  function boardPosts(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: w * 0.12, y: 0, width: 20, height: h, fill: BLACK }));
    s.appendChild(el('rect', { x: w * 0.88 - 20, y: 0, width: 20, height: h, fill: BLACK }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['repeater.html'] = {
    prefix: 'rp-walk',
    from: 'the-outskirts.html',
    build: function (kit) {
      var F = kit.F;
      var sh = kit.H - 24;
      var eye = sh / 2;
      var HUT = 3400;
      var decor = [];

      decor.push(kit.item(ridge(12000, 1600), { x: 0, z: HUT + 1800, w: 12000, h: 1600, y: -300 }));
      decor.push(kit.item(mast(700, 2600), { x: 520, z: HUT + 200, w: 700, h: 2600 }));
      var hutAt = { x: -260, z: HUT, w: 640, h: 520 };
      decor.push(kit.item(hut(640, 520), hutAt));

      // The page, on a board beside the track, standing in the black.
      var PW = Math.min(kit.W - 160, 820), PH = Math.round(PW * 0.62);
      var BZ = 1500, BY = 160;
      decor.push(kit.item(boardPosts(PW, BY + 20), { x: -520, z: BZ + 4, w: PW, h: BY + 20, turn: 0.35 }));
      var page = kit.screen(kit.page, 'The Repeater’s own page, on a board beside the track');
      var board = kit.item(page, { x: -520, z: BZ, w: PW, h: PH, y: BY, turn: 0.35, cls: 'rp-walk-board' });

      var stops = [
        kit.stop({ name: 'at the foot of the track, the ridge and the mast black against the glow', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the board beside the track, with the room’s own page and the open line', spot: kit.front(board), link: page }, board),
        kit.stop({ name: 'at the hut under the mast, its two lamps steady overhead', spot: kit.front(hutAt, 1100) })
      ];

      return {
        cls: 'rp-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Nothing up here is lit. The room’s own page is on a board beside the track.',
        bounds: function () { return { x: [-700, 700], z: [-200, HUT - 700] }; },
        ground: function (g, near, far) {
          kit.quad(g, -8000, 8000, near, far, kit.ink('--rp-ridge'));
          // The track up to the hut, a shade off the black where the cloud's
          // glow catches the worn ground.
          for (var z = Math.max(-400, Math.floor(near / 60) * 60); z < Math.min(far, HUT); z += 60) {
            var x = Math.sin(z / 900) * 200;
            kit.quad(g, x - 90, x + 90, z, z + 64, kit.ink('--rp-deep'));
          }
        }
      };
    }
  };
})();
