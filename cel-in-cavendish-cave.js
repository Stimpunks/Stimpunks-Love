/* =============================================================================
   The Cave, walked into on Cel Street, through its door upstairs at Cavendish
   Coworking. Ryan's ask, 2026-11-01: the rooms behind the doors.

   IT IS THE ROOM'S OWN WORLD AND SHARES NOTHING WITH THE HOUSE IT OPENS OFF
   (§76). The house is green daylight through canvas blinds; this is a tunnel in
   glacier ice, and nothing in it gives off light. There is no lamp and no
   opening: the day outside comes in through the ice itself, so the arch is deep
   blue where the ice is thick, its layers lie along it in seams, it goes paler
   towards the far end where the ice thins, and the far wall glows. One crack
   runs through to the day as a line of near-white. Icicles hang from the crown
   and the melt lies still along the floor. Nobody is drawn.

   THE ICE IS THE LIGHT. So every wall is drawn unlit, in its own colour, and
   what stands in the tunnel (the ledges, the icicles, the floor) is lit only by
   a sky of the ice's glow above and the deep ice below. If a lamp ever appears
   in here, it has become Stay Frosty with a view: that is dark wet rock lit by
   glints, at the bottom of the caverns. The Rabbit Hole is a slate shaft daylit
   from one end, and the Watering Hole and the Campfire across the landing are a
   pan at noon and a fire at night; nothing of theirs is here.

   NOTHING MOVES AT ANY SETTING. It is the quiet room, and the ice is still.

   THE WORDS ARE THE PAGE'S OWN, lifted off it and never retyped: the room's name
   and its line by the door, how it goes here, why inside the ice, and whose
   words, David Thornburg's name with them; the ice wall at the far end with the
   page's screen in it, what is on it and the way back, played through
   love-embed.js and rack.js, and the rack of caves along the right-hand ledge.
   The room's call and its radio stay on its page, which hangs by the door,
   because they talk to the CB.

   Every colour is one §76 declares, by name. It keeps nothing and sends
   nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['cavendish-cave.html'] = {
    name: 'The Cave',
    from: 'cavendish-coworking.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var R = 3.2, Y0 = 0.9, L = 16, S = 8, SL = L / S;   // the arch's radius, where it springs, the tunnel's length, its sections
      var NA = 16;                                         // panels round the arch
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var TOP = Y0 + R;

      // THE ONLY LIGHT ON WHAT STANDS IN HERE is the ice's own: its glow from
      // above, the deep ice from below. No lamp, nothing that casts.
      kit.scene.background = kit.col('--cv-deep');
      kit.scene.add(new T.HemisphereLight(kit.col('--cv-glow'), kit.col('--cv-deep'), 2.4));

      // An unlit sheet, for the ice that is its own light: drawn in its colour
      // or a painted map, and never shaded by anything.
      function ice(geo, m, ink, map, alpha) {
        var mat = new T.MeshBasicMaterial({ side: T.DoubleSide });
        if (map) { mat.map = map; mat.transparent = alpha !== undefined; } else mat.color = kit.col(ink);
        if (alpha !== undefined) { mat.transparent = true; mat.opacity = alpha; mat.depthWrite = false; }
        var mesh = new T.Mesh(geo, mat);
        mesh.matrixAutoUpdate = false;
        mesh.matrix.copy(m);
        mesh.matrixWorldNeedsUpdate = true;
        kit.scene.add(mesh);
        return mesh;
      }
      // Where a panel of the arch sits, at a turn th from the floor on the right
      // (0) over the crown (PI/2) to the floor on the left (PI), and the matrix
      // that lays a sheet there facing into the tunnel, its length along it.
      function rim(th, r) { return { x: Math.cos(th) * (r || R), y: Y0 + Math.sin(th) * (r || R) }; }
      function onArch(th, z, r) {
        var p = rim(th, r), c = Math.cos(th), s = Math.sin(th);
        var m = new T.Matrix4().makeBasis(new T.Vector3(-s, c, 0), new T.Vector3(0, 0, -1), new T.Vector3(-c, -s, 0));
        m.setPosition(p.x, p.y, z);
        return m;
      }

      // THE ICE OF THE ARCH, section by section from the door to the far end:
      // deep where it is thick, its layers in seams along it, paler as it thins
      // towards the far wall.
      var pw = 2 * R * Math.sin(Math.PI / NA / 2) + 0.02;
      for (var k = 0; k < S; k++) {
        var z = -(k + 0.5) * SL, f = k / (S - 1);
        var base = f < 0.6 ? '--cv-deep' : f < 0.86 ? '--cv-seam' : '--cv-thin';
        var layer = f < 0.6 ? '--cv-seam' : f < 0.86 ? '--cv-thin' : '--cv-glow';
        for (var i = 0; i < NA; i++) {
          var th = (i + 0.5) / NA * Math.PI;
          var band = (i === 3 || i === NA - 4);
          ice(new T.PlaneGeometry(pw, SL + 0.02), onArch(th, z), band ? layer : base);
        }
        // The straight walls under where the arch springs.
        [[R, RIGHT], [-R, LEFT]].forEach(function (w) {
          ice(new T.PlaneGeometry(SL + 0.02, Y0 + 0.02), at(w[0], Y0 / 2, z, w[1]), base);
        });
      }

      // THE FAR WALL, where the ice is thinnest: it glows in the middle and goes
      // to the thin and then the deep ice at its edges.
      var far = kit.paper(512, 512, function (c, w, h) {
        c.fillStyle = kit.ink('--cv-thin'); c.fillRect(0, 0, w, h);
        var g = c.createRadialGradient(w * 0.5, h * 0.55, w * 0.04, w * 0.5, h * 0.55, w * 0.62);
        g.addColorStop(0, kit.ink('--cv-crack'));
        g.addColorStop(0.18, kit.ink('--cv-glow'));
        g.addColorStop(0.62, kit.ink('--cv-thin'));
        g.addColorStop(1, kit.ink('--cv-seam'));
        c.fillStyle = g; c.fillRect(0, 0, w, h);
        c.strokeStyle = kit.ink('--cv-thin'); c.lineWidth = 3;
        for (var n = 1; n < 6; n++) { c.beginPath(); c.moveTo(0, h * n / 6 + 8 * Math.sin(n)); c.bezierCurveTo(w * 0.3, h * n / 6 - 14, w * 0.7, h * n / 6 + 14, w, h * n / 6 - 6); c.stroke(); }
      });
      ice(new T.PlaneGeometry(2 * R + 0.2, TOP + 0.1), at(0, (TOP + 0.1) / 2, -L), null, far);

      // THE NEAR END, round the door you came in by, thick ice, and the door in
      // it shut.
      ice(new T.PlaneGeometry(2 * R + 0.2, TOP + 0.1), at(0, (TOP + 0.1) / 2, 0.02, Math.PI), '--cv-deep');
      box(1.3, 2.3, 0.08, at(0, 1.15, -0.04), '--cv-shelf', 0.012);
      box(1.5, 0.1, 0.12, at(0, 2.35, -0.05), '--cv-thin', 0.01);
      box(0.1, 2.35, 0.12, at(-0.7, 1.17, -0.05), '--cv-thin', 0.01);
      box(0.1, 2.35, 0.12, at(0.7, 1.17, -0.05), '--cv-thin', 0.01);
      cyl(0.04, 0.04, 0.05, at(0.45, 1.1, -0.1, 0, Math.PI / 2), '--cv-glow', 0.006, 10);

      // THE CRACK, through to the day outside, high on the left of the arch near
      // the far end: a line of near-white in the ice.
      var crack = kit.paper(128, 512, function (c, w, h) {
        c.clearRect(0, 0, w, h);
        c.strokeStyle = kit.ink('--cv-crack'); c.lineCap = 'round'; c.lineJoin = 'round';
        c.lineWidth = 7; c.beginPath();
        var pts = [[64, 0], [52, 60], [74, 128], [58, 196], [80, 262], [62, 330], [76, 400], [60, 470], [68, 512]];
        c.moveTo(pts[0][0], pts[0][1]);
        for (var n = 1; n < pts.length; n++) c.lineTo(pts[n][0], pts[n][1]);
        c.stroke();
        c.lineWidth = 3; c.beginPath(); c.moveTo(74, 128); c.lineTo(104, 170); c.moveTo(80, 262); c.lineTo(34, 300); c.stroke();
      });
      ice(new T.PlaneGeometry(0.5, 2.6), onArch(2.05, -12.6, R - 0.02), null, crack, 1);

      // THE FLOOR, the shelf of the ice, and the melt lying still down the
      // middle of it, holding the glow.
      box(2 * R, 0.1, L, at(0, -0.05, -L / 2), '--cv-shelf', false, false);
      ice(new T.PlaneGeometry(1.0, L - 1.2), at(0, 0.005, -L / 2 - 0.4, 0, -Math.PI / 2), '--cv-thin');

      // THE LEDGES in the ice along both walls, where the page's words stand.
      [[-(R - 0.3), 1], [R - 0.3, -1]].forEach(function (w) {
        box(0.6, 0.12, L - 3, at(w[0], 0.42, -L / 2 - 0.6), '--cv-shelf', 0.012);
        box(0.06, 0.42, L - 3, at(w[0] + w[1] * 0.27, 0.21, -L / 2 - 0.6), '--cv-seam', false);
      });

      // ICICLES along the arch near the crown, each its own length, hanging
      // still: a shape worked out from where it hangs, never drawn at random.
      for (var q = 0; q < 26; q++) {
        var qz = -1.4 - q * 0.55, qth = Math.PI / 2 + Math.sin(q * 2.3) * 0.55;
        var qp = rim(qth, R - 0.05), len = 0.25 + 0.3 * (0.5 + 0.5 * Math.sin(q * 1.7));
        cyl(0.05, 0.0, len, at(qp.x, qp.y - len / 2, qz), q % 3 ? '--cv-glow' : '--cv-crack', 0.006, 7);
      }

      // THE ROOM'S OWN PAGE, by the door on the right, in a frame of the
      // ledges' ice, with its call and its radio on it.
      var pgw = 2.0, pgh = pgw * 800 / 1180, PZ = -3.4;
      box(0.05, pgh + 0.12, pgw + 0.12, at(R - 0.62, 0.6 + pgh / 2, PZ), '--cv-seam', 0.01);
      var page = kit.screen(1180, 800, pgw, at(R - 0.66, 0.6 + pgh / 2, PZ, RIGHT), 'The Cave’s own page, by the door, with its call');

      // THE PAGE'S WORDS, lifted off it: its name and its line by the door on
      // the left, how it goes here and why inside the ice further along that
      // ledge, and whose words across from them.
      var XL = -(R - 0.75), XR = R - 0.75;
      var head = kit.lift(page, '.cv-head', { drop: '.cv-head__art', w: 760, ww: 1.6, m: at(XL, 1.75, -3.2, LEFT) });
      kit.lift(page, '.lede', { w: 760, ww: 1.6, m: at(XL, 1.15, -3.2, LEFT) });
      var norms = kit.lift(page, '.cv-part', { n: 0, w: 760, h: 760, ww: 1.8, m: at(XL, 1.35, -6.6, LEFT) });
      var why = kit.lift(page, '.cv-part', { n: 3, w: 760, ww: 1.8, m: at(XL, 1.35, -10.4, LEFT) });
      var whose = kit.lift(page, '.cv-credits', { w: 760, ww: 1.6, m: at(XR, 1.35, -7.2, RIGHT) });

      // THE ICE WALL: the page's screen set into the far wall where the ice is
      // thinnest, giving off nothing until somebody presses it, what is on it
      // under it and the way back under that; and the rack of caves along the
      // right-hand ledge towards it.
      var screen = kit.lift(page, '.cv-screen', { w: 860, ww: 2.6, m: at(0, 2.05, -L + 0.4) });
      kit.lift(page, '.cv-screen__now', { w: 760, ww: 2.2, m: at(0, 1.2, -L + 0.45) });
      kit.lift(page, '.cv-screen__back', { w: 640, ww: 1.7, m: at(0, 0.85, -L + 0.45) });
      var rack = kit.lift(page, '.cv-rack', { w: 860, h: 900, ww: 2.0, m: at(XR, 1.45, -11.2, RIGHT) });

      kit.wire(page, 'rack.js');

      return {
        start: { x: 0, z: -1.4, yaw: 0 },
        bounds: { x: [-(R - 1.1), R - 1.1], z: [-L + 1.6, -0.9] },
        stops: [
          { name: 'just inside the door, the tunnel of ice running ahead and glowing where it thins at the far end', x: 0, z: -1.4, yaw: 0, pitch: 0.12 },
          { name: 'on the left by the door: the room’s name and its line', x: 0.9, z: -3.2, yaw: LEFT, pitch: 0.05, frame: head.el },
          { name: 'on the right by the door, with the room’s own page on the ice, its call and its radio', x: -0.9, z: PZ, yaw: RIGHT, pitch: 0.05, page: kit.page, frame: page },
          { name: 'along the left-hand ledge: how it goes here', x: 0.9, z: -6.6, yaw: LEFT, pitch: 0.02, frame: norms.el },
          { name: 'along the right-hand ledge: whose words these are, David Thornburg’s caves among them', x: -0.9, z: -7.2, yaw: RIGHT, pitch: 0.02, frame: whose.el },
          { name: 'under the icicles along the crown of the arch, hanging still', x: 0, z: -8.8, yaw: 0, pitch: 0.8 },
          { name: 'further along the left: why inside the ice', x: 0.9, z: -10.4, yaw: LEFT, pitch: 0.02, frame: why.el },
          { name: 'at the rack on the right-hand ledge: caves to watch together', x: -0.9, z: -11.2, yaw: RIGHT, pitch: 0.02, frame: rack.el },
          { name: 'under the crack in the ice, a line of near-white through to the day outside', x: 0.6, z: -12.6, yaw: 0.55, pitch: 0.6 },
          { name: 'at the ice wall at the far end, where the ice is thinnest, its screen giving off nothing until somebody presses it', x: 0, z: -L + 3.4, yaw: 0, pitch: 0.12, frame: screen.el },
          { name: 'back at the door you came in by, shut, in the thick ice', x: 0, z: -2.4, yaw: Math.PI, pitch: 0.05 }
        ]
      };
    }
  };
})();
