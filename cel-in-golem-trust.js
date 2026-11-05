/* =============================================================================
   The Golem Trust, walked into on Cel Street, over the bridge from Widdershins.
   Ryan's ask, 2026-11-04: subrooms of Widdershins in the city over the bridge.

   A LONG HALL KEPT BY GOLEMS WHO OWN THEMSELVES (§144). There is no lamp:
   golems need none. The light comes in through three tall windows in the far
   wall, and THEY ARE NOT GLASS: every pane is clay pressed thin enough for the
   day to come through, pale where it is thinnest and darker where a thumb
   pressed harder, so each pane carries the whorl of a thumb. The panes are the
   only things in here that give light; everything else stands in front of
   them in its own outline, lit from behind and dark on the side you see: the
   drawers between the windows, the long table with its slates, and three
   golems, blocks of clay with no face and no eyes, anybody's and nobody's
   character. The light lies on the slate floor towards you, soft, with no
   edge anywhere.

   THE CAVE IS THE ONE TO WATCH: its light comes through ice and the whole
   tunnel glows; here the walls are dark and only the windows give light. It
   shares nothing with Widdershins, a crooked city at night outdoors.

   ONE PRESS: the golem behind the table holds up its slate, or puts it down.
   It is a press, and nothing moves by itself. Every colour is one §144
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['golem-trust.html'] = {
    name: 'The Golem Trust',
    from: 'widdershins.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var W = 14, BACK = -10, FRONT = 1.6, H = 5.2;
      var WINS = [-4.6, 0, 4.6], WW = 2.4, SILL = 1.0, TOP = 4.0;

      // THE DAY THROUGH THE CLAY. A little of it everywhere, and the rest from
      // just inside each window, so whatever stands in front of one is lit on
      // its far side and dark on the side you see.
      kit.scene.background = kit.col('--gtr-deep');
      kit.scene.add(new T.AmbientLight(kit.col('--gtr-pane'), 0.12));
      WINS.forEach(function (x) {
        var l = new T.PointLight(kit.col('--gtr-pane'), 5, 14, 1.4);
        l.position.set(x, 2.6, BACK + 0.6);
        kit.scene.add(l);
      });

      // The hall: slate underfoot, the walls and the ceiling dark.
      box(W, 0.2, FRONT - BACK, at(0, -0.1, (FRONT + BACK) / 2), '--gtr-slate', false, false);
      box(W, 0.2, FRONT - BACK, at(0, H + 0.1, (FRONT + BACK) / 2), '--gtr-deep', false, false);
      [-1, 1].forEach(function (s) { box(0.3, H, FRONT - BACK, at(s * (W / 2 + 0.15), H / 2, (FRONT + BACK) / 2), '--gtr-deep', false, false); });
      box(W, H, 0.3, at(0, H / 2, FRONT + 0.15), '--gtr-deep', false, false);

      // THE BACK WALL, built round the three windows, and the windows: a
      // frame, panes of clay that give light, and in every pane a thumb's
      // whorl and a pressed line, where the clay is thicker and darker.
      function hash(n) { var h = Math.sin(n * 12.9898) * 43758.5453; return h - Math.floor(h); }
      var edges = [-W / 2].concat(WINS.map(function (x) { return [x - WW / 2, x + WW / 2]; }).reduce(function (a, b) { return a.concat(b); }, [])).concat([W / 2]);
      for (var e = 0; e < edges.length; e += 2) box(edges[e + 1] - edges[e], H, 0.3, at((edges[e] + edges[e + 1]) / 2, H / 2, BACK - 0.15), '--gtr-deep', false, false);
      WINS.forEach(function (x, wi) {
        var arch = WW / 2;
        box(WW, SILL, 0.3, at(x, SILL / 2, BACK - 0.15), '--gtr-deep', false, false);
        box(WW, H - TOP - arch, 0.3, at(x, TOP + arch + (H - TOP - arch) / 2, BACK - 0.15), '--gtr-deep', false, false);
        var cols = 3, rows = 4, gap = 0.08;
        var pw = (WW - gap * (cols + 1)) / cols, ph = (TOP - SILL - gap * (rows + 1)) / rows;
        kit.flat(new T.PlaneGeometry(WW, TOP - SILL), at(x, (SILL + TOP) / 2, BACK - 0.02), '--gtr-frame');
        for (var c = 0; c < cols; c++) {
          for (var r = 0; r < rows; r++) {
            var px = x - WW / 2 + gap + pw / 2 + c * (pw + gap), py = SILL + gap + ph / 2 + r * (ph + gap);
            kit.flat(new T.PlaneGeometry(pw, ph), at(px, py, BACK), '--gtr-pane');
            var n = wi * 50 + c * 10 + r, tx = px + (hash(n) - 0.5) * pw * 0.4, ty = py + (hash(n + 3) - 0.5) * ph * 0.3;
            for (var k = 0; k < 3; k++) {
              var ring = new T.RingGeometry(0.05 + k * 0.06, 0.075 + k * 0.06, 24);
              ring.scale(0.85, 1.1, 1);
              kit.flat(ring, at(tx, ty, BACK + 0.006), '--gtr-thick');
            }
            kit.flat(new T.PlaneGeometry(pw * (0.4 + hash(n + 7) * 0.35), 0.03), at(px - pw * 0.1, py - ph * 0.32, BACK + 0.006), '--gtr-thick');
          }
        }
        // The arch over each window: a half round of clay panes in its frame.
        kit.flat(new T.CircleGeometry(arch, 32, 0, Math.PI), at(x, TOP, BACK - 0.02), '--gtr-frame');
        kit.flat(new T.CircleGeometry(arch - gap, 32, 0, Math.PI), at(x, TOP + 0.01, BACK), '--gtr-pane');
        [-1, 1].forEach(function (s) { kit.flat(new T.PlaneGeometry(gap, arch * 0.85), at(x + s * (pw / 2 + gap / 2), TOP + arch * 0.42, BACK + 0.004), '--gtr-frame'); });
        // The day lying on the slate floor towards you, soft, a little wider
        // as it comes.
        var pool = new T.BufferGeometry();
        pool.setAttribute('position', new T.Float32BufferAttribute([
          -WW / 2, 0, 0, WW / 2, 0, 0, WW / 2 + 0.9, 0, 5.5,
          -WW / 2, 0, 0, WW / 2 + 0.9, 0, 5.5, -WW / 2 - 0.9, 0, 5.5], 3));
        var lit = kit.flat(pool, at(x, 0.012, BACK + 0.2), '--gtr-pane');
        lit.material.transparent = true; lit.material.opacity = 0.16; lit.material.depthWrite = false;
      });

      // THE DRAWERS between the windows, where the papers are that say each
      // golem belongs to themself. The golems keep the keys.
      [-2.3, 2.3].forEach(function (x) {
        box(1.8, 3.0, 0.6, at(x, 1.5, BACK + 0.3), '--gtr-frame', 0.02);
        for (var c = 0; c < 2; c++) for (var r = 0; r < 6; r++) {
          box(0.78, 0.42, 0.04, at(x - 0.42 + c * 0.84, 0.32 + r * 0.47, BACK + 0.62), '--gtr-frame', 0.015, false);
          box(0.16, 0.05, 0.03, at(x - 0.42 + c * 0.84, 0.36 + r * 0.47, BACK + 0.65), '--gtr-deep', false, false);
        }
      });

      // A SLATE: a face of slate in a frame of fired clay, lines of chalk on
      // it that say no word. Lying down, or held up.
      function slate(w, h, m, list) {
        function add(geo, mm, ink) {
          if (list) list.push(kit.facets(geo, M(m, mm), ink));
          else kit.piece(geo, M(m, mm), ink, 0.012, false);
        }
        add(new T.BoxGeometry(w, h, 0.03), at(0, 0, 0), '--gtr-clay');
        add(new T.BoxGeometry(w - 0.08, h - 0.08, 0.034), at(0, 0, 0), '--gtr-slate');
        for (var k = 0; k < 3; k++) {
          var lw = (w - 0.2) * (0.5 + 0.4 * hash(w * 31 + k));
          if (list) list.push(kit.flat(new T.PlaneGeometry(lw, 0.018), M(m, at(-((w - 0.2) - lw) / 2, h / 2 - 0.09 - k * (h - 0.16) / 3, 0.019)), '--gtr-chalk-2'));
          else kit.flat(new T.PlaneGeometry(lw, 0.018), M(m, at(-((w - 0.2) - lw) / 2, h / 2 - 0.09 - k * (h - 0.16) / 3, 0.019)), '--gtr-chalk-2');
        }
      }

      // THE LONG TABLE, with slates lying on it.
      var TZ = -6.4;
      box(7.4, 0.12, 1.3, at(0, 0.82, TZ), '--gtr-frame', 0.025);
      [[-3.5, -0.55], [-3.5, 0.55], [3.5, -0.55], [3.5, 0.55]].forEach(function (p) { box(0.12, 0.8, 0.12, at(p[0], 0.4, TZ + p[1]), '--gtr-frame', 0.015); });
      [[-2.8, 0.1, 0.2], [-1.7, -0.2, -0.3], [1.3, 0.15, 0.1], [2.5, -0.1, 0.4], [-0.6, 0.35, -0.1]].forEach(function (p) {
        slate(0.6, 0.42, at(p[0], 0.9, TZ + p[1], p[2], -Math.PI / 2));
      });

      // THE GOLEMS: blocks of clay, a head with no face, shoulders, arms and
      // legs, standing facing you with the windows behind them. Anybody's.
      function golem(x, z, s, armsOut) {
        var G = M(at(x, 0, z), new T.Matrix4().makeScale(s, s, s));
        var ink = '--gtr-clay-2';
        [-1, 1].forEach(function (sd) { box(0.42, 0.9, 0.44, M(G, at(sd * 0.27, 0.45, 0)), ink, 0.03); });
        box(1.2, 1.3, 0.6, M(G, at(0, 1.55, 0)), ink, 0.03);
        box(0.52, 0.56, 0.46, M(G, at(0, 2.5, 0)), ink, 0.03);
        if (armsOut !== false) [-1, 1].forEach(function (sd) { box(0.3, 1.2, 0.32, M(G, at(sd * 0.76, 1.55, 0, 0, 0, sd * 0.06)), ink, 0.03); });
        return G;
      }
      golem(-4.6, -8.9, 1.0);
      golem(4.6, -8.9, 0.95);
      var MID = golem(0, -7.7, 1.0, false);

      // The one behind the table, its arms down, or up with a slate held up
      // to you: one press, and nothing moves by itself.
      var down = [], up = [];
      [-1, 1].forEach(function (sd) {
        down.push(kit.facets(new T.BoxGeometry(0.3, 1.2, 0.32), M(MID, at(sd * 0.76, 1.55, 0, 0, 0, sd * 0.06)), '--gtr-clay-2'));
        up.push(kit.facets(new T.BoxGeometry(0.28, 0.95, 0.3), M(MID, at(sd * 0.58, 1.7, 0.38, 0, 0.9, sd * 0.25)), '--gtr-clay-2'));
      });
      slate(1.0, 0.72, M(MID, at(0, 1.78, 0.7)), up);
      up.forEach(function (m) { kit.hide(m, true); });
      var holdUp = kit.press({
        say: function () { return kit.hidden(up[0]) ? 'Ask the golem at the table' : 'Thank the golem at the table'; },
        at: [kit.touch(1.4, 2.8, 1.0, M(MID, at(0, 1.4, 0)))],
        press: function () {
          var raise = kit.hidden(up[0]);
          up.forEach(function (m) { kit.hide(m, !raise); });
          down.forEach(function (m) { kit.hide(m, raise); });
          return raise ? 'The golem at the table holds up its slate to you, written on in chalk. That is its answer, and it is a whole one.'
                       : 'The golem puts its slate down on the table again, its arms at its sides.';
        } });

      // THE ROOM'S OWN PAGE, on the left wall near the door, and the two
      // lines its page holds up on slates, lifted onto the right wall.
      var pw = 2.6, ph = pw * 800 / 1180;
      var frame = kit.screen(1180, 800, pw, at(-W / 2 + 0.05, 1.7, -3.2, LEFT), 'The Golem Trust’s own page, on the wall by the door');
      box(0.04, ph + 0.24, pw + 0.24, at(-W / 2 + 0.01, 1.7, -3.2), '--gtr-clay', false, false);
      var slates = [0, 1].map(function (n) {
        return kit.lift(frame, '.gtr-slate', { n: n, w: 640, ww: 1.5, m: at(W / 2 - 0.05, 1.0, -2.6 - n * 2.6, RIGHT) });
      });

      var stops = [
        { name: 'inside the door, the three windows of clay at the far end of the hall', x: 0, z: 0.4, yaw: 0, pitch: 0.14 },
        { name: 'at the long table of slates, before the golem behind it', x: 0, z: -4.2, yaw: 0, pitch: 0.06, acts: [holdUp] },
        { name: 'under the left window, a thumb’s whorl in every pane of clay', x: -4.6, z: -6.6, yaw: 0, pitch: 0.42 },
        { name: 'at the drawers between the windows, where the papers are kept', x: 2.3, z: -7.6, yaw: 0, pitch: 0.12 },
        { name: 'at the wall by the door, with the room’s own page', x: -W / 2 + 2.5, z: -3.2, yaw: LEFT, pitch: 0.02, page: kit.page, frame: frame },
        { name: 'at the first slate on the right wall, the right to communicate', x: W / 2 - 2.2, z: -2.6, yaw: RIGHT, pitch: 0.02, frame: slates[0].el },
        { name: 'at the second slate on the right wall, everybody communicates', x: W / 2 - 2.2, z: -5.2, yaw: RIGHT, pitch: 0.02, frame: slates[1].el }
      ];

      return {
        start: { x: 0, z: 0.4, yaw: 0 },
        bounds: { x: [-W / 2 + 1.2, W / 2 - 1.2], z: [-8.2, 0.9], areas: [
          { x: [-W / 2 + 1.2, W / 2 - 1.2], z: [-5.4, 0.9] },
          { x: [-W / 2 + 1.2, -3.9], z: [-8.2, -5.4] },
          { x: [3.9, W / 2 - 1.2], z: [-8.2, -5.4] }
        ] },
        stops: stops
      };
    }
  };
})();
