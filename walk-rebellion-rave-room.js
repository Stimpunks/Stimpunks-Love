/* =============================================================================
   The Rebellion Rave Room, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round one of the rooms still to be walked into. On Cel Street it is turning
   08 off the Outskirts; here it is reached by its address or the teleporter.

   THE ANTE-CHAMBER COMES FIRST, AS IT DOES ON THE PAGE AND IN THE BUILDING
   (§68). You come in through a small room lit plainly and evenly, and the
   room's own page hangs on its left-hand wall: the first thing on that page is
   the warning, whole, and the rig is off until you switch it on there and say
   yes. Ahead, the hangar doors stand open in a frame of hazard stripes.

   THE WAY INTO THE COOLDOWN ROOM is the other door, on the ante-chamber's
   right-hand wall before the page: plain, shut, deck-dark in a pale frame,
   its name stencilled on it, and the rig does not reach it.

   THE HANGAR BEYOND IS IMMENSE, BLACK AND STEEL, and its light is light you see
   in the AIR: beams from the laser heads on two scaffold towers, caught along
   their whole length by the haze. HERE THE BEAMS ARE CUT OUT OF CARD AND STILL.
   THE STROBE IS AN OPT-IN AND IT STAYS ON THE PAGE: rave.js is never run here,
   the rig and its switches are never lifted, and nothing in this scene
   flashes, blinks, pulses or moves at any setting. Nothing in it is the
   strobe's white. The big screen over the far end of the floor is dark: it is
   a set you tune on the page.

   DANCE, PUNKS IS THE COLLISION, out on the strip: steady glows at head height,
   outdoors, silent. In here there is a roof a long way up, haze, nobody drawn,
   and no light at head height anywhere.

   Every colour is one §68 declares, by name. It keeps nothing, sends nothing and
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

  // A plain wall of the ante-chamber, evenly lit, a steel rail at hand height.
  function anteWall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rr-deck)' }));
    s.appendChild(el('rect', { x: 0, y: h - 300, width: w, height: 14, fill: 'var(--rr-steel)' }));
    s.appendChild(el('rect', { x: 0, y: h - 30, width: w, height: 30, fill: 'var(--rr-steel)' }));
    return s;
  }

  // The partition with the hangar doors standing open in it: the wall, the
  // opening, and hazard blocks round the frame, yellow and black by turns.
  function doorway(w, h, dw, dh) {
    var s = svg(w, h), l = (w - dw) / 2, top = h - dh, band = 60, step = 60;
    s.appendChild(el('path', { 'fill-rule': 'evenodd', fill: 'var(--rr-deck)',
      d: 'M0 0 H' + w + ' V' + h + ' H0 Z M' + l + ' ' + h + ' V' + top + ' H' + (l + dw) + ' V' + h + ' Z' }));
    var k = 0, x, y;
    for (x = l - band; x < l + dw + band; x += step, k++) {
      s.appendChild(el('rect', { x: x, y: top - band, width: Math.min(step, l + dw + band - x), height: band, fill: k % 2 ? 'var(--rr-hangar)' : 'var(--rr-hazard)' }));
    }
    [l - band, l + dw].forEach(function (bx) {
      for (y = top, k = 1; y < h; y += step, k++) {
        s.appendChild(el('rect', { x: bx, y: y, width: band, height: Math.min(step, h - y), fill: k % 2 ? 'var(--rr-hangar)' : 'var(--rr-hazard)' }));
      }
    });
    return s;
  }

  // TWO SCAFFOLD TOWERS with their decks, one each side of the floor, and the
  // laser heads on top throwing their beams across the haze between them,
  // drawn still: thin lines in the room's three beam colours, faint, crossing
  // the air well above where anybody stands.
  function rig(w, h) {
    var s = svg(w, h), tw = 140, top = 120, beams = ['var(--rr-laser)', 'var(--rr-magenta)', 'var(--rr-cyan)'];
    [300, w - 300].forEach(function (cx, side) {
      var tx = cx - tw / 2, y;
      for (y = top; y < h; y += 150) s.appendChild(el('rect', { x: tx - 24, y: y, width: tw + 48, height: 16, fill: 'var(--rr-steel)' }));
      s.appendChild(el('rect', { x: tx, y: top, width: 14, height: h - top, fill: 'var(--rr-steel)' }));
      s.appendChild(el('rect', { x: tx + tw - 14, y: top, width: 14, height: h - top, fill: 'var(--rr-steel)' }));
      for (y = top; y < h - 150; y += 150) {
        s.appendChild(el('path', { d: 'M' + tx + ' ' + y + ' L' + (tx + tw) + ' ' + (y + 150), stroke: 'var(--rr-steel)', 'stroke-width': 6 }));
      }
      var hy = top - 24;
      s.appendChild(el('rect', { x: cx - 44, y: hy - 30, width: 88, height: 40, rx: 6, fill: 'var(--rr-deck)', stroke: 'var(--rr-steel)', 'stroke-width': 4 }));
      for (var b = 0; b < 8; b++) {
        var ex = side ? w * (0.08 + b * 0.1) : w * (0.92 - b * 0.1), ey = 160 + b * 85;
        s.appendChild(el('path', { d: 'M' + cx + ' ' + hy + ' L' + ex + ' ' + ey, stroke: beams[(b + side) % 3], 'stroke-width': 5, 'stroke-opacity': '0.5' }));
      }
    });
    return s;
  }

  // The big screen over the far end of the floor, dark, in its steel frame.
  function bigScreen(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rr-steel)' }));
    s.appendChild(el('rect', { x: 24, y: 24, width: w - 48, height: h - 48, fill: 'var(--rr-hangar)' }));
    return s;
  }

  // The other door, to the Cooldown Room: plain and shut in a pale frame, a
  // kick plate at its foot and a handle, and its name stencilled on it.
  function otherDoor(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 20, y: 20, width: w - 40, height: h - 20, fill: 'var(--rr-deck)', stroke: 'var(--rr-dim)', 'stroke-width': 8 }));
    s.appendChild(el('rect', { x: 44, y: 250, width: w - 88, height: h - 340, fill: 'none', stroke: 'var(--rr-steel)', 'stroke-width': 6 }));
    s.appendChild(el('rect', { x: 34, y: h - 70, width: w - 68, height: 60, fill: 'var(--rr-steel)' }));
    s.appendChild(el('rect', { x: w - 74, y: 300, width: 18, height: 60, rx: 6, fill: 'var(--rr-dim)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['rebellion-rave-room.html'] = {
    prefix: 'rr-walk',
    from: 'the-outskirts.html',
    build: function (kit) {
      var F = kit.F;
      var sh = kit.H - 24;
      var eye = sh / 2;
      var ANTE = 700, PART = 1300, DOOR = 900, HALL = 2600, BACK = 5200;
      var decor = [];
      var AH = Math.max(1100, sh + 600);

      [-1, 1].forEach(function (side) {
        decor.push(kit.item(anteWall(PART + 400, AH), { x: side * ANTE, z: PART / 2 - 200, w: PART + 400, h: AH, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      decor.push(kit.item(doorway(2 * ANTE + 40, AH, DOOR, 900), { x: 0, z: PART, w: 2 * ANTE + 40, h: AH }));
      decor.push(kit.item(rig(3600, 1000), { x: 0, z: 3400, w: 3600, h: 1000 }));
      var screen = { x: 0, z: BACK, w: 2400, h: 1100, y: 700 };
      decor.push(kit.item(bigScreen(2400, 1100), screen));

      // The other door, on the ante-chamber's right-hand wall before the
      // page, so the keyboard meets it first, as you would walking in.
      var other = kit.door('cooldown-room.html', { art: otherDoor(300, 540), no: 'THE OTHER DOOR', label: 'rr-walk-stencil', cls: 'rr-walk-other',
                                                   x: ANTE - 6, z: 250, w: 300, h: 540, turn: kit.RIGHT });
      decor.push(other);

      // The page, on the ante-chamber's left-hand wall: the warning first.
      var PW = Math.min(kit.W - 160, 860), PH = Math.round(PW * 0.62);
      var page = kit.screen(kit.page, 'The Rebellion Rave Room’s own page, on the ante-chamber wall, its warning first');
      var hung = kit.item(page, { x: -ANTE + 6, z: 560, w: PW, h: PH, y: 160, turn: kit.LEFT, cls: 'rr-walk-page' });

      var stops = [
        kit.stop({ name: 'in the ante-chamber, lit plainly, the hangar doors open ahead', spot: { x: 0, z: -100 } }),
        kit.stop({ name: 'at the other door, on the right-hand wall: the way through to the Cooldown Room, where the rig does not reach', spot: kit.front(other), link: other.link }, other),
        kit.stop({ name: 'at the ante-chamber wall, with the room’s own page and its warning, where the rig is switched on or not', spot: kit.front(hung), link: page }, hung),
        kit.stop({ name: 'in the hangar doors, the beams still across the haze', spot: { x: 0, z: PART + 80 } }),
        kit.stop({ name: 'out on the floor, the towers either side and the dark big screen beyond them', spot: { x: 0, z: 2300 } })
      ];

      return {
        cls: 'rr-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: -100 },
        stops: stops,
        decor: decor,
        arrive: 'The room’s own page is on the ante-chamber wall, its warning first. Nothing in here flashes.',
        bounds: function (cam) {
          var z = cam ? cam.z : 0;
          var x = z < PART - 150 ? ANTE - 200 : z < PART + 150 ? DOOR / 2 - 80 : HALL - 400;
          return { x: [-x, x], z: [-300, 3150] };
        },
        ground: function (g, near, far) {
          kit.quad(g, -6000, 6000, near, far, kit.ink('--rr-hangar'));
          // The ante-chamber's floor, plain and even.
          kit.quad(g, -ANTE, ANTE, Math.max(near, -400), Math.min(far, PART), kit.ink('--rr-deck'));
          // The hangar floor's painted lines from when it held aircraft.
          var hz = kit.ink('--rr-hazard');
          kit.quad(g, -HALL + 200, -HALL + 230, Math.max(near, PART), Math.min(far, BACK), hz, 0.5);
          kit.quad(g, HALL - 230, HALL - 200, Math.max(near, PART), Math.min(far, BACK), hz, 0.5);
          for (var z = Math.ceil(Math.max(near, PART + 200) / 500) * 500; z < Math.min(far, BACK); z += 500) kit.quad(g, -12, 12, z, z + 220, hz, 0.35);
        }
      };
    }
  };
})();
