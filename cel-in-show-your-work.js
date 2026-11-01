/* =============================================================================
   Show Your Work, walked into on Cel Street. Ryan's ask, 2026-10-31: down the
   street a room at a time, each room its own world.

   A GARAGE WITH THE DOOR ROLLED UP (§124), drawn after the page's own picture
   of it: concrete floor, the back wall in shade with a tool wall on it (every
   tool hung over its painted outline), the cards pinned up with masking tape
   above a bench, and a stack of cards not yet turned over on the bench. The
   door is the whole front wall, rolled up into its drum, and the street is
   out there in full day.

   THE LIGHT IS THE DAY COMING IN OFF THE STREET, LEVEL, FROM BEHIND YOU, and it
   runs out before the back wall. So the one light here stands outside the
   door at a person's height and reaches no further than the bench, and it
   casts no shadow: the light is behind you, so every shadow falls behind the
   thing that made it, where you cannot see it. There is no roof light, which
   is the Foundry's, and the door never narrows to a gap, which is Dead Tired
   Society's corridor wedge.

   THE CARDS ARE THE MAKERS', AND THE PAGE'S OWN. The bench, with every card on
   it as the page has it (whose, who said yes, where it lives, how you may use
   it), is lifted off the page onto the back wall; nothing on a card is retyped
   or redrawn, and no card is drawn into the scene that the page does not have.
   A photograph on a card is never lifted (its consent record names the room's
   own page, so it is seen there, on its wall). The quotations and the
   sections are lifted as the page has them. Nobody is drawn.

   NOTHING MOVES. Every colour is one the room declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Cel
   Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['show-your-work.html'] = {
    name: 'Show Your Work',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 6.6, D = 8.4, H = 2.9, back = -D, OPEN = 2.45;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // THE DAY OUTSIDE, and the garage's shade inside it. One light, at the
      // door at a person's height, reaching as far as the bench and no further;
      // it casts nothing, because every shadow falls away from you.
      kit.scene.background = kit.col('--syw-day');
      kit.scene.add(new T.HemisphereLight(kit.col('--syw-steel'), kit.col('--syw-shade'), 1.7));
      var day = new T.SpotLight(kit.col('--syw-day'), 60, D + 0.6, 1.3, 1, 1.0);
      day.position.set(0, 1.5, 1.6);
      day.target.position.set(0, 1.0, back + 1.0);
      kit.scene.add(day, day.target);
      // And the day spilling in round each side of the opening onto the side
      // walls, brightest by the door and gone well before the back.
      [-1, 1].forEach(function (s) {
        var spill = new T.PointLight(kit.col('--syw-day'), 9, 5.5, 1.2);
        spill.position.set(s * (W / 2 - 1.2), 1.4, 0.6);
        kit.scene.add(spill);
      });

      // THE GARAGE: the concrete floor, the side walls, the back wall, the
      // ceiling, and the front wall that is nothing but the door's opening.
      box(W, 0.1, D, at(0, -0.05, -D / 2), '--syw-concrete', false, false);
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--syw-wall');
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--syw-wall');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--syw-wall');
      // The back wall in its own colour, as the page's picture has it: the
      // day does not reach it, and it is not dark, only in shade.
      kit.flat(new T.PlaneGeometry(W, H), at(0, H / 2, back + 0.002), '--syw-wall');
      box(W + 0.6, 0.2, D + 0.3, at(0, H + 0.1, -D / 2 + 0.15), '--syw-shade', false, false);
      box(W + 0.6, H - OPEN, 0.3, at(0, OPEN + (H - OPEN) / 2, 0.15), '--syw-wall');
      // A seam across the floor at the threshold, and the slab's joints.
      box(W, 0.012, 0.05, at(0, 0.006, 0.02), '--syw-steel', false, false);
      [-2.8, -5.6].forEach(function (z) { box(W, 0.012, 0.03, at(0, 0.006, z), '--syw-wall', false, false); });

      // THE DOOR, ROLLED UP: its drum across the top of the opening, inside,
      // the slats showing as seams, the handle at the middle, and a guide rail
      // down each side of the opening.
      cyl(0.24, 0.24, W - 0.2, at(0, OPEN + 0.2, -0.3, 0, 0, Math.PI / 2), '--syw-door', 0.012, 20);
      [-0.08, 0.08].forEach(function (d) {
        cyl(0.243, 0.243, W - 0.2, at(0, OPEN + 0.2 + d, -0.3, 0, 0, Math.PI / 2), '--syw-steel', false, 20);
      });
      box(0.36, 0.05, 0.1, at(0, OPEN - 0.05, -0.08), '--syw-steel', false);
      [-1, 1].forEach(function (s) {
        box(0.07, OPEN, 0.1, at(s * (W / 2 - 0.05), OPEN / 2, -0.08), '--syw-steel', 0.01);
      });

      // THE STREET: the pavement in full day, its kerb, and the day beyond.
      kit.flat(new T.PlaneGeometry(W + 30, 14), at(0, 0.001, 7, 0, -Math.PI / 2), '--syw-day');
      box(W + 30, 0.02, 0.12, at(0, 0.01, 3.4), '--syw-concrete', false, false);
      kit.flat(new T.PlaneGeometry(W + 40, 14), at(0, 6, 14, Math.PI), '--syw-day');

      // THE BENCH against the back wall, its top the door's pale steel, and on
      // it the stack of cards not yet turned over, backs up, and a roll of
      // masking tape. Nothing on it that the page's own picture does not have.
      var BZ = back + 0.7, BH = 0.92, BX = 0.6, BL = 4.2;
      box(BL, 0.06, 0.8, at(BX, BH, BZ), '--syw-door', 0.012);
      box(BL, 0.08, 0.06, at(BX, BH - 0.07, BZ + 0.38), '--syw-steel', false);
      [-1, 1].forEach(function (s) {
        [-1, 1].forEach(function (f) {
          box(0.06, BH - 0.03, 0.06, at(BX + s * (BL / 2 - 0.1), (BH - 0.03) / 2, BZ + f * 0.33), '--syw-steel', 0.01);
        });
      });
      box(BL - 0.2, 0.04, 0.7, at(BX, 0.22, BZ), '--syw-steel', false);
      [0, 1, 2, 3].forEach(function (k) {
        box(0.3, 0.012, 0.4, at(BX + 1.55 + k * 0.03, BH + 0.035 + k * 0.013, BZ + 0.05 + (k % 2) * 0.02), '--syw-back', 0.004);
      });
      cyl(0.07, 0.07, 0.05, at(BX - 1.4, BH + 0.055, BZ + 0.1), '--syw-tape', 0.005, 16);
      cyl(0.035, 0.035, 0.052, at(BX - 1.4, BH + 0.055, BZ + 0.1), '--syw-wall', false, 12);

      // THE TOOL WALL on the back wall's left: every tool in steel, hung over
      // its outline painted on the wall, so a tool that is out shows where it
      // goes back. The shapes are the page's own picture's.
      var TOOLS = [
        [[0.024, 0.22, 0], [0.1, 0.05, 0.12]],
        [[0.05, 0.2, 0], [0.07, 0.06, 0.13]],
        [[0.024, 0.2, 0], [0.06, 0.04, 0.12]],
        [[0.016, 0.18, 0], [0.04, 0.04, 0.11]],
        [[0.024, 0.14, 0], [0.05, 0.07, 0.04]],
        [[0.03, 0.09, 0.03], [0.01, 0.13, -0.05]]
      ];
      var TX = -W / 2 + 0.6, TS = 1.7;
      TOOLS.forEach(function (tool, i) {
        var x = TX + i * 0.36, y = 1.5;
        tool.forEach(function (p) {
          var cy = y + (p[2] || 0) * TS;
          kit.flat(new T.PlaneGeometry(p[0] * TS + 0.05, p[1] * TS + 0.05), at(x, cy, back + 0.006), '--syw-outline');
          box(p[0] * TS, p[1] * TS, 0.025, at(x, cy, back + 0.025), '--syw-steel', false);
        });
      });

      // THE ROOM'S OWN PAGE, on the left-hand wall by the door, in the day.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.8 + ph / 2;
      var pg = at(-W / 2 + 0.02, 0, -1.9, LEFT);
      box(pw + 0.12, ph + 0.12, 0.05, M(pg, at(0, py, 0)), '--syw-steel', 0.01);
      var page = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.04)), 'Show Your Work’s own page, on the left-hand wall by the door');

      // THE CARDS, pinned up on the back wall over the bench: the page's own
      // bench, every card as the page has it, lifted whole with its words.
      // A card's photograph has its consent record naming the room's own page, so it is
      // seen only there, on its screen: the picture is left out of the lifted bench.
      var bench = kit.lift(page, '.syw-part.syw-part--bench', { drop: '.syw-card__picture', w: 1000, h: 560, ww: 2.9, m: at(BX + 0.3, BH + 0.16, back + 0.03) });

      var stops = [
        { name: 'just inside the door, the day behind you and the garage going back into shade', x: 0, z: -0.7, yaw: 0, pitch: 0.04 },
        { name: 'at the bench, with every card its maker turned over pinned up over it', x: BX + 0.3, z: BZ + 1.85, yaw: 0, pitch: 0.24, frame: bench.el },
        { name: 'at the tool wall, every tool hung over its own outline', x: TX + 0.9, z: back + 2.0, yaw: 0, pitch: 0.14 },
        { name: 'at the left-hand wall by the door, with the room’s own page on it', x: -W / 2 + 2.3, z: -1.9, yaw: LEFT, pitch: 0.06, page: kit.page, frame: page }
      ];

      // THE SECTIONS, pinned up along the side walls as the page has them:
      // scenius and turning a card over on the left, the three places, putting
      // yours on the bench and noticing on the right.
      var PARTS = [
        { n: 1, wall: LEFT, z: -4.2, words: 'at the left-hand wall, with scenius, not genius' },
        { n: 3, wall: LEFT, z: -6.2, words: 'at the left-hand wall, with turning a card over' },
        { n: 5, wall: RIGHT, z: -1.9, words: 'at the right-hand wall, with the three places to show your work' },
        { n: 6, wall: RIGHT, z: -4.0, words: 'at the right-hand wall, with how to put yours on the bench' },
        { n: 7, wall: RIGHT, z: -6.1, words: 'at the right-hand wall, with noticing, not marking' }
      ];
      PARTS.forEach(function (p) {
        var x = p.wall === LEFT ? -W / 2 + 0.02 : W / 2 - 0.02;
        var it = kit.lift(page, '.syw-part', { n: p.n, w: 640, h: 640, ww: 1.5, m: at(x, 0.85, p.z, p.wall) });
        stops.push({ name: p.words, x: p.wall === LEFT ? -W / 2 + 2.2 : W / 2 - 2.2, z: p.z, yaw: p.wall, pitch: 0.1, frame: it.el });
      });

      stops.push({ name: 'looking back out of the door at the street in full day', x: 0, z: -5.2, yaw: Math.PI, pitch: 0.02 });

      return {
        start: { x: 0, z: -0.7, yaw: 0 },
        bounds: { x: [-W / 2 + 0.9, W / 2 - 0.9], z: [BZ + 1.1, 2.6] },
        stops: stops
      };
    }
  };
})();
