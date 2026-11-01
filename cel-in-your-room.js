/* =============================================================================
   Your Room, walked into on Cel Street. Ryan's ask, 2026-10-31: the street's
   rooms opened one by one, down the street in order.

   IT IS A ROOM NOBODY HAS MOVED INTO YET, AND THAT IS THE WHOLE PAGE. The page
   says there is a storefront on this street with nothing in it, empty on
   purpose, not scenery and not "coming soon", a room we are not going to
   decorate because it is not ours to decorate. So the scene is that shop,
   unlet: bare boards, bare walls, the door standing open and the street's
   light coming in off the pavement behind you, a chair, and the prompt pinned
   up on the far wall. Nothing else. No sign on the glass, because a sign would
   be "coming soon" by another name.

   IT WEARS THE PLAIN ROOMS' CLOTHES (§11) AND NOBODY ELSE'S. Every colour is
   one the plain rooms use off the street's base (§2), by name, and nothing is
   borrowed from any other room's palette, because a room of somebody's own
   will bring its own. The light in off the street is the plain rooms' chalk,
   not any one shopfront's colour.

   THE PROMPT IS THE PAGE'S OWN, lifted off it word for word, with its copy
   button and the line that answers it, and the page's own your-room.js is run
   against them, so Copy the prompt puts it on your clipboard as it does on the
   page; it sends nothing anywhere. The page's opening and its offer are lifted
   too, as the page has them, and the page itself hangs on the left-hand wall.

   NOTHING MOVES, nothing is fetched but the page through Cel Street's
   screen(), and nothing is kept. tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['your-room.html'] = {
    name: 'Your Room',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var W = 7, D = 9, H = 3.4, back = -D;

      // THE LIGHT IN OFF THE STREET: the night outside, a little of it on
      // everything, and one light out on the pavement coming in at the open
      // door and the bare window, lying across the boards in their shapes.
      kit.scene.background = kit.col('--ink');
      kit.scene.add(new T.HemisphereLight(kit.col('--chalk'), kit.col('--ink'), 0.9));
      var street = new T.SpotLight(kit.col('--chalk'), 150, 24, 0.8, 0.55, 1.1);
      street.position.set(0.4, 3.0, 3.6);
      street.target.position.set(0, 0, -4.5);
      street.castShadow = true;
      street.shadow.mapSize.set(1024, 1024);
      street.shadow.bias = -0.0008; street.shadow.normalBias = 0.03;
      kit.scene.add(street, street.target);

      // THE ROOM: bare boards, bare walls in the plain rooms' line colour, a darker
      // skirting and a ceiling.
      box(W, 0.1, D, at(0, -0.05, -D / 2), '--ink-2', false, false);
      for (var b = -W / 2 + 0.35; b < W / 2; b += 0.7) {
        box(0.02, 0.012, D - 0.1, at(b, 0.006, -D / 2), '--ink', false, false);
      }
      box(0.2, H, D, at(-W / 2 - 0.1, H / 2, -D / 2), '--ink-3');
      box(0.2, H, D, at(W / 2 + 0.1, H / 2, -D / 2), '--ink-3');
      box(W + 0.4, H, 0.2, at(0, H / 2, back - 0.1), '--ink-3');
      box(W + 0.4, 0.2, D + 0.2, at(0, H + 0.1, -D / 2), '--ink', false, false);
      [[-W / 2 + 0.02, -D / 2, LEFT, D], [W / 2 - 0.02, -D / 2, RIGHT, D], [0, back + 0.02, 0, W]].forEach(function (s) {
        box(s[3], 0.14, 0.04, at(s[0], 0.07, s[1], s[2]), '--ink-2', false);
      });

      // THE SHOPFRONT behind you: a door standing open on the right and a bare
      // window on the left with nothing written on it, and the frames round
      // them; the pavement and the kerb outside, and the dark road beyond.
      var DX0 = 1.6, DX1 = 2.7, DTOP = 2.4, WX0 = -2.9, WX1 = 0.9, WS = 0.6, WT = 2.6;
      box(WX0 + W / 2, H, 0.2, at((-W / 2 + WX0) / 2, H / 2, 0.1), '--ink-3');
      box(DX0 - WX1, H, 0.2, at((WX1 + DX0) / 2, H / 2, 0.1), '--ink-3');
      box(W / 2 - DX1, H, 0.2, at((DX1 + W / 2) / 2, H / 2, 0.1), '--ink-3');
      box(DX1 - DX0, H - DTOP, 0.2, at((DX0 + DX1) / 2, (DTOP + H) / 2, 0.1), '--ink-3');
      box(WX1 - WX0, WS, 0.2, at((WX0 + WX1) / 2, WS / 2, 0.1), '--ink-3');
      box(WX1 - WX0, H - WT, 0.2, at((WX0 + WX1) / 2, (WT + H) / 2, 0.1), '--ink-3');
      // The frames, a shade darker than the walls.
      [[WX0, WS, WT], [WX1, WS, WT], [DX0, 0, DTOP], [DX1, 0, DTOP]].forEach(function (f) {
        box(0.08, f[2] - f[1], 0.24, at(f[0], (f[1] + f[2]) / 2, 0.1), '--ink-2');
      });
      box(WX1 - WX0 + 0.08, 0.08, 0.24, at((WX0 + WX1) / 2, WS, 0.1), '--ink-2');
      box(WX1 - WX0 + 0.08, 0.08, 0.24, at((WX0 + WX1) / 2, WT, 0.1), '--ink-2');
      box(DX1 - DX0 + 0.08, 0.08, 0.24, at((DX0 + DX1) / 2, DTOP, 0.1), '--ink-2');
      box(0.05, WT - WS, 0.1, at((WX0 + WX1) / 2, (WS + WT) / 2, 0.1), '--ink-2', false);
      // The door, swung open into the room against the wall, its handle on.
      var dw = DX1 - DX0;
      box(0.05, DTOP - 0.04, dw - 0.04, at(DX1 - 0.04, DTOP / 2, -dw / 2 + 0.02), '--ink-3');
      kit.cyl(0.025, 0.025, 0.12, at(DX1 - 0.1, 1.0, -dw + 0.18, 0, 0, Math.PI / 2), '--chalk', false, 8);
      // Outside: the pavement under the light, the kerb, the road.
      box(W + 4, 0.08, 3.2, at(0, -0.04, 1.8), '--ink-3', false, false);
      box(W + 4, 0.12, 0.18, at(0, 0, 3.4), '--chalk', false, false);
      box(W + 30, 0.06, 30, at(0, -0.06, 18.5), '--ink', false, false);

      // A CHAIR in the middle of the floor, facing the far wall. The one thing
      // in the room besides the prompt, for whoever comes in to sit and think.
      var CZ = -5.2;
      box(0.46, 0.05, 0.44, at(0, 0.46, CZ), '--ink-3');
      box(0.46, 0.5, 0.05, at(0, 0.74, CZ + 0.2), '--ink-3');
      [[-0.2, -0.19], [0.2, -0.19], [-0.2, 0.19], [0.2, 0.19]].forEach(function (l) {
        box(0.04, 0.46, 0.04, at(l[0], 0.23, CZ + l[1]), '--ink-3');
      });

      // THE PAGE'S OWN WORDS. The prompt pinned up on the far wall with its
      // button and its answer; the page's opening and its offer on the
      // right-hand wall; the page itself on the left-hand wall.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.95 + ph / 2, PZ = -4.6;
      var frame = kit.screen(1180, 800, pw, at(-W / 2 + 0.03, py, PZ, LEFT), 'Your Room’s own page, on the left-hand wall');
      var prompt = kit.lift(frame, '.yr-prompt', { w: 900, h: 760, ww: 2.4, m: at(0, 0.7, back + 0.03) });
      // Four pins at its corners, the plain rooms' yellow (the card comes out
      // about 1.75 m tall at this width, its prompt scrolling inside it).
      [[-1.14, 0.76], [1.14, 0.76], [-1.14, 2.4], [1.14, 2.4]].forEach(function (p) {
        kit.piece(new T.SphereGeometry(0.03, 10, 8), at(p[0], p[1], back + 0.06), '--yellow', false);
      });
      kit.wire(frame, 'your-room.js');
      var lede = kit.lift(frame, '.lede', { w: 640, ww: 1.4, m: at(W / 2 - 0.03, 1.2, -2.6, RIGHT) });
      var offer = kit.lift(frame, '.card--call', { w: 700, h: 720, ww: 1.7, m: at(W / 2 - 0.03, 0.75, -5.6, RIGHT) });

      return {
        start: { x: -0.4, z: -1.2, yaw: 0.05 },
        bounds: { x: [-W / 2 + 0.6, W / 2 - 0.6], z: [back + 1.1, -0.7] },
        stops: [
          { name: 'just inside the open door, the bare room ahead and the street’s light on the boards', x: -0.4, z: -1.2, yaw: 0.05 },
          { name: 'in the middle of the floor, by the chair', x: -0.9, z: -4.4, yaw: 0.25, pitch: -0.2 },
          { name: 'at the far wall, with the prompt pinned up', x: 0, z: back + 3.0, yaw: 0, pitch: 0.06, frame: prompt.el },
          { name: 'at the left-hand wall, with the room’s own page on it', x: -W / 2 + 2.4, z: PZ, yaw: LEFT, pitch: 0.02, page: kit.page, frame: frame },
          { name: 'at the right-hand wall, with what the room is', x: W / 2 - 1.7, z: -2.6, yaw: RIGHT, pitch: 0.05, frame: lede.el },
          { name: 'at the right-hand wall, with the offer, plainly', x: W / 2 - 2.0, z: -5.6, yaw: RIGHT, pitch: 0.04, frame: offer.el },
          { name: 'looking back out through the open door at the street', x: 0.4, z: -3.2, yaw: Math.PI, pitch: 0 }
        ]
      };
    }
  };
})();
