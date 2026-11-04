/* =============================================================================
   Nature's Contribution, walked into on Cel Street: out of the campgrounds'
   wood by the one track through it, over the stile, onto open land.

   IT IS THE LAND'S WORLD AND NOBODY ELSE'S (§104): an afternoon under broken
   cloud, a whole valley of fields in the sun, and THE SHADOWS ON THE FIELDS
   ARE THE CLOUDS'. Nothing on the ground casts one: the sun lights everything
   and throws nothing, and the dark that lies on the land lies in soft-edged
   patches as big as fields. You are standing in one at the stile, which is why
   the ground under you is a hayfield in shade. It is not the campgrounds
   (dusk, lit by nothing, posts on a field) and not the Garden (midday, through
   leaves, beds in the ground): this is distance, sky and weather.

   THE FINGERPOST HAS AN ARM FOR EVERY PLACE ON THE LAND, read off the page's
   own fingerpost by tools/make-cel-street.py and written between the cel:arms
   markers, in the post's order, never by hand. An arm with nothing behind it
   yet is a solid board with no way in and its words never dimmed. Each place
   stands out in the sun in its own direction, drawn in the land's inks as you
   see it from here, and a path goes to a gate at the edge of each; a place
   built for Cel Street opens off its gate. A gate is not the room it opens
   onto: what is behind it is that place's own world.

   NOTHING MOVES, at any setting: the clouds' shadows lie where they lie, as
   the page says. Every colour is one the land declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Cel
   Street's screen().
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 29, 668265263) ^ Math.imul(k + 31, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  // The fingerpost's arms, as the page's own post has them.
  // cel:arms:begin
  var ARMS = [{"no": "WEST", "name": "All Needs Met Wildlife Sanctuary", "page": "all-needs-met.html", "state": ""}, {"no": "NORTH-WEST", "name": "Gentle Help Cannabis Farm", "page": "gentle-help.html", "state": ""}, {"no": "NORTH", "name": "Brighter Days Solar Farm", "page": "brighter-days.html", "state": ""}, {"no": "NORTH-EAST", "name": "All Together Now Farms", "page": "all-together-now.html", "state": ""}, {"no": "EAST", "name": "Wide-Spread Chaos Gardens", "page": "wide-spread-chaos.html", "state": ""}];
  // cel:arms:end

  // Which way each arm points, in the post's own words: west is to your left
  // as you come over the stile, north straight ahead.
  var BEARING = { 'WEST': -90, 'NORTH-WEST': -45, 'NORTH': 0, 'NORTH-EAST': 45, 'EAST': 90,
                  'SOUTH-WEST': -135, 'SOUTH-EAST': 135 };

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['natures-contribution.html'] = {
    name: 'Nature’s Contribution',
    from: 'campgrounds.html',
    faces: ['"Copse"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var FLAT = -Math.PI / 2;
      var GATE = 22;   // how far out the gates stand from the stile

      // THE SKY, high and pale, and the afternoon on everything, throwing
      // nothing: no light here casts a shadow.
      kit.scene.background = kit.col('--ncx-sky');
      kit.scene.fog = new T.Fog(kit.col('--ncx-sky'), 90, 320);
      kit.scene.add(new T.HemisphereLight(kit.col('--ncx-sky-high'), kit.col('--ncx-pasture'), 1.7));
      var sun = new T.DirectionalLight(kit.col('--ncx-glint'), 1.5);
      sun.position.set(-60, 50, -20);
      kit.scene.add(sun);

      // A soft-edged patch of a colour laid on the land, the way a cloud's
      // shadow lies: the ink built up in rings, so it is full in the middle
      // and comes to nothing at its edge.
      var softs = {};
      function softOf(ink) {
        if (softs[ink]) return softs[ink];
        return (softs[ink] = kit.paper(256, 256, function (c, w, h) {
          c.fillStyle = kit.ink(ink);
          for (var ring = 32; ring > 0; ring--) {
            c.globalAlpha = 0.09;
            c.beginPath(); c.arc(w / 2, h / 2, (w / 2) * ring / 32, 0, Math.PI * 2); c.fill();
          }
          c.globalAlpha = 1;
        }));
      }
      function lie(x, z, sx, sz, ink, strength, y) {
        var mat = new T.MeshBasicMaterial({ map: softOf(ink), transparent: true, opacity: strength, depthWrite: false });
        var mesh = new T.Mesh(new T.PlaneGeometry(sx, sz), mat);
        mesh.position.set(x, y || 0.04, z); mesh.rotation.x = FLAT;
        mesh.matrixAutoUpdate = false; mesh.updateMatrix(); mesh.matrixWorldNeedsUpdate = true;
        kit.scene.add(mesh);
      }

      // THE LAND: pasture everywhere, and a patchwork of fields on it with
      // hedges between them, out to the ridge.
      box(600, 0.1, 600, at(0, -0.06, -150), '--ncx-pasture', false, false);
      var FIELDS = ['--ncx-wheat', '--ncx-plough', '--ncx-meadow', '--ncx-pasture', '--ncx-wheat', '--ncx-meadow'];
      for (var fi = 0; fi < 7; fi++) {
        for (var fj = 0; fj < 10; fj++) {
          var fx = -150 + fj * 30 + (hash(fi, fj, 1) - 0.5) * 6, fz = -60 - fi * 26;
          var fw = 26 + hash(fi, fj, 2) * 6, fd = 22 + hash(fi, fj, 3) * 4;
          kit.flat(new T.PlaneGeometry(fw, fd), at(fx, 0.005, fz, 0, FLAT), FIELDS[Math.floor(hash(fi, fj, 4) * FIELDS.length)]);
          box(fw, 0.9, 0.5, at(fx, 0.4, fz - fd / 2 - 1.5), '--ncx-hedge', false, false);
        }
      }
      // THE RIDGE far off, and the clouds coming apart over it.
      for (var r = 0; r < 14; r++) {
        kit.piece(new T.ConeGeometry(40 + hash(r, 1, 1) * 30, 30 + hash(r, 1, 2) * 26, 7),
          at(-260 + r * 40, 10, -300 - hash(r, 1, 3) * 30, r), '--ncx-ridge', false);
      }
      function cloud(x, y, z, size, seed) {
        for (var q = 0; q < 6; q++) {
          var ball = new T.SphereGeometry(size * (0.45 + hash(seed, q, 1) * 0.4), 10, 8);
          ball.scale(1.3, 0.55, 1);
          kit.piece(ball, at(x + (q - 2.5) * size * 0.55, y + hash(seed, q, 2) * size * 0.25, z + (hash(seed, q, 3) - 0.5) * size * 0.6),
            q % 3 ? '--ncx-cloud' : '--ncx-cloud-under', false);
        }
      }
      for (var cl = 0; cl < 12; cl++) {
        var ca = -1.3 + cl / 11 * 2.6;
        cloud(Math.sin(ca) * 190, 70 + hash(cl, 2, 1) * 40, -40 - Math.cos(ca) * 190, 12 + hash(cl, 2, 2) * 10, cl);
      }

      // THE CLOUDS' SHADOWS, lying on the land with soft edges, whole fields at
      // once, and the biggest of them over the stile, where you are.
      lie(0, 1, 46, 30, '--ncx-shade', 1, 0.03);
      for (var sh = 0; sh < 9; sh++) {
        lie(-120 + hash(sh, 3, 1) * 240, -40 - hash(sh, 3, 2) * 180, 40 + hash(sh, 3, 3) * 50, 30 + hash(sh, 3, 4) * 30,
            '--ncx-cloud-shadow', 0.35, 0.05);
      }

      // THE WOOD behind you, dark, with the track coming out of it through a
      // gap, and the stile in the hedge at its edge.
      for (var w = 0; w < 90; w++) {
        var wx = (hash(w, 4, 1) - 0.5) * 120, wz = 6 + hash(w, 4, 2) * 24;
        if (Math.abs(wx) < 2.6 && wz < 20) continue;
        var wh = 6 + hash(w, 4, 3) * 6;
        kit.cyl(0.25, 0.32, wh * 0.4, at(wx, wh * 0.2, wz), '--ncx-trunk', 0.02, 6);
        kit.piece(new T.SphereGeometry(wh * 0.32, 8, 6), at(wx, wh * 0.62, wz, w), '--ncx-wood', 0.04);
      }
      box(1.6, 0.04, 22, at(0, 0.0, 16), '--ncx-plough', false, false);
      [-1, 1].forEach(function (s) { box(40, 1.1, 0.7, at(s * 21.4, 0.55, 3.4), '--ncx-hedge'); });
      // The stile: two posts, two rails, and a step either side.
      [-0.9, 0.9].forEach(function (o) { box(0.16, 1.3, 0.16, at(o, 0.65, 3.4), '--ncx-stile'); });
      [0.55, 1.05].forEach(function (y) { box(1.9, 0.1, 0.08, at(0, y, 3.4), '--ncx-stile'); });
      [2.9, 3.9].forEach(function (z) { box(1.4, 0.08, 0.32, at(0, 0.38, z), '--ncx-stile'); });

      // THE PLACES, each in its own direction, out in the sun past its gate,
      // drawn as you would see them from here.
      function out(deg, d) { var a = deg * Math.PI / 180; return { x: Math.sin(a) * d, z: -Math.cos(a) * d, yaw: -a }; }
      var PLACES = {
        // A wetland with a low barn beside it, left to wildlife.
        'all-needs-met.html': function (p) {
          lie(p.x, p.z, 26, 18, '--ncx-water', 1, 0.02);
          for (var q = 0; q < 40; q++) {
            kit.piece(new T.ConeGeometry(0.06, 1.0, 3), at(p.x + (hash(q, 9, 1) - 0.5) * 24, 0.5, p.z + (hash(q, 9, 2) - 0.5) * 16), '--ncx-hedge', false);
          }
          var g = at(p.x + 8, 0, p.z - 8, p.yaw);
          box(10, 2.6, 5, M(g, at(0, 1.3, 0)), '--ncx-byre');
          box(10.6, 0.3, 5.8, M(g, at(0, 2.75, 0)), '--ncx-roof');
        },
        // Three hoop houses side by side, lit through their own skins.
        'gentle-help.html': function (p) {
          [-7, 0, 7].forEach(function (o, i) {
            var g = at(p.x, 0, p.z, p.yaw);
            var hoop = new T.CylinderGeometry(2.6, 2.6, 14, 18, 1, false, 0, Math.PI);
            kit.piece(hoop, M(g, at(o, 0, 0, 0, 0, Math.PI / 2)), '--ncx-tunnel', '--ncx-tunnel-rib');
            for (var rr = -6; rr <= 6; rr += 3) kit.piece(new T.TorusGeometry(2.62, 0.05, 4, 18, Math.PI), M(g, at(o, 0, rr, 0, Math.PI / 2, 0)), '--ncx-tunnel-rib', false);
          });
        },
        // Rows of panels on posts high enough to walk under, sheep between.
        'brighter-days.html': function (p) {
          var g = at(p.x, 0, p.z, p.yaw);
          for (var row = 0; row < 4; row++) {
            for (var o = -12; o <= 12; o += 4) {
              box(0.12, 2.6, 0.12, M(g, at(o, 1.3, -row * 6)), '--ncx-trunk', false);
              box(3.8, 0.1, 2.2, M(g, at(o, 2.8, -row * 6, 0, -0.35)), '--ncx-pv');
              box(3.8, 0.04, 0.06, M(g, at(o, 3.2, -row * 6 - 1.02, 0, -0.35)), '--ncx-glint', false);
            }
          }
          for (var s = 0; s < 9; s++) {
            var sx = (hash(s, 10, 1) - 0.5) * 24, sz = -hash(s, 10, 2) * 18 - 2;
            var sheep = new T.SphereGeometry(0.5, 8, 6); sheep.scale(1.4, 0.9, 0.9);
            kit.piece(sheep, M(g, at(sx, 0.55, sz, 0, hash(s, 10, 3) * 3)), '--ncx-fleece', 0.02);
          }
        },
        // A farm with trees growing through its fields, and its barn.
        'all-together-now.html': function (p) {
          var g = at(p.x, 0, p.z, p.yaw);
          for (var a = 0; a < 4; a++) {
            kit.flat(new T.PlaneGeometry(26, 2.4), M(g, at(0, 0.03, -a * 5, 0, FLAT)), '--ncx-corn');
            for (var t = -12; t <= 12; t += 4) {
              kit.cyl(0.18, 0.24, 1.6, M(g, at(t, 0.8, -a * 5 - 2.5)), '--ncx-trunk', 0.02, 6);
              kit.piece(new T.SphereGeometry(1.4, 8, 6), M(g, at(t, 2.4, -a * 5 - 2.5, t)), '--ncx-tree', 0.03);
            }
          }
          box(7, 4.2, 9, M(g, at(14, 2.1, -6)), '--ncx-barn');
          kit.piece(new T.CylinderGeometry(0.01, 5.2, 2.6, 4, 1), M(g, at(14, 5.5, -6, 0, Math.PI / 4)), '--ncx-roof');
          box(2.4, 3, 0.1, M(g, at(14, 1.5, -1.45)), '--ncx-barn-door', false);
        },
        // Ground sown by throwing it: flowers everywhere, nothing in rows.
        'wide-spread-chaos.html': function (p) {
          var BLOOMS = ['--ncx-bloom-1', '--ncx-bloom-2', '--ncx-bloom-3', '--ncx-bloom-4'];
          lie(p.x, p.z, 30, 22, '--ncx-meadow', 1, 0.02);
          for (var q = 0; q < 220; q++) {
            var bx = p.x + (hash(q, 11, 1) - 0.5) * 28, bz = p.z + (hash(q, 11, 2) - 0.5) * 20;
            var bh = 0.4 + hash(q, 11, 3) * 0.9;
            kit.piece(new T.ConeGeometry(0.03, bh, 3), at(bx, bh / 2, bz), '--ncx-hedge', false);
            kit.piece(new T.SphereGeometry(0.16 + hash(q, 11, 4) * 0.1, 6, 4), at(bx, bh, bz), BLOOMS[q % 4], false);
          }
        }
      };

      // THE FINGERPOST by the stile, white, an arm for every place pointing
      // its way, its name and its bearing on it.
      function arm(a) {
        return kit.paper(900, 220, function (c, w, h) {
          c.fillStyle = kit.ink('--ncx-post'); c.fillRect(0, 0, w, h);
          c.strokeStyle = kit.ink('--ncx-letter'); c.lineWidth = 6;
          if (a.state === 'raising') c.setLineDash([22, 14]);
          c.strokeRect(10, 10, w - 20, h - 20);
          c.setLineDash([]);
          c.fillStyle = kit.ink('--ncx-letter'); c.textBaseline = 'alphabetic'; c.textAlign = 'center';
          c.font = '34px "Copse"'; c.fillText(a.no, w / 2, 62);
          var size = 62;
          do { c.font = size + 'px "Copse"'; size -= 2; } while (c.measureText(a.name).width > w - 70 && size > 28);
          c.fillText(a.name, w / 2, 150);
        });
      }
      var PX = 3.6, PZ = -3.2;
      box(0.22, 4.4, 0.22, at(PX, 2.2, PZ), '--ncx-post');
      var stops = [];
      ARMS.forEach(function (a, i) {
        var deg = BEARING[a.no] === undefined ? (i - (ARMS.length - 1) / 2) * 45 : BEARING[a.no];
        var rad = deg * Math.PI / 180, y = 4.0 - i * 0.42;
        // The board points its way: it runs out from the post along its bearing.
        var g = at(PX, y, PZ, -(Math.PI / 2 + rad));
        box(1.9, 0.38, 0.06, M(g, at(-1.02, 0, 0)), '--ncx-post');
        kit.sheet(arm(a), 1.86, 0.36, M(g, at(-1.02, 0, 0.035)));
        kit.sheet(arm(a), 1.86, 0.36, M(g, at(-1.02, 0, -0.035, Math.PI)));
        // The path out to its gate, the gate, and the place past it.
        var gate = out(deg, GATE), far = out(deg, GATE + 22);
        var mid = out(deg, (GATE + 4) / 2);
        kit.flat(new T.PlaneGeometry(1.4, GATE - 6), at(mid.x, 0.06, mid.z, 0, FLAT, -rad), '--ncx-plough');
        var gg = at(gate.x, 0, gate.z, gate.yaw);
        [-1.4, 1.4].forEach(function (o) { box(0.18, 1.4, 0.18, M(gg, at(o, 0.7, 0)), '--ncx-stile'); });
        [0.45, 0.85, 1.25].forEach(function (yy) { box(2.6, 0.1, 0.06, M(gg, at(0, yy, 0)), '--ncx-stile'); });
        var draw = PLACES[a.page];
        if (draw) draw(far);
        var near = out(deg, GATE - 4.2);
        stops.push({ name: a.name, where: 'at the gate into ' + a.name + ', ' + a.no.toLowerCase() + ' of the stile',
                     page: a.state === 'raising' ? undefined : a.page, x: near.x, z: near.z, yaw: gate.yaw, pitch: 0.05 });
      });

      // THE LAND'S OWN PAGE, on a board by the stile, under a little roof.
      var pw = 3.0, ph = pw * 800 / 1180, py = 0.8 + ph / 2;
      var pg = at(-5.0, 0, -2.0, 0.95);
      [-1, 1].forEach(function (s) { box(0.16, py + ph / 2 + 0.5, 0.16, M(pg, at(s * (pw / 2 + 0.16), (py + ph / 2 + 0.5) / 2, -0.06)), '--ncx-stile'); });
      box(pw + 0.24, ph + 0.24, 0.08, M(pg, at(0, py, -0.06)), '--ncx-stile');
      box(pw + 0.8, 0.1, 0.8, M(pg, at(0, py + ph / 2 + 0.55, 0.16, 0.18)), '--ncx-roof');
      var page = kit.screen(1180, 800, pw, M(pg, at(0, py, 0)), 'Nature’s Contribution’s own page, on a board by the stile');

      // THE PAGE'S OWN WORDS, on boards along the hedge either side of the
      // stile: what you see from here, what this land is for, what goes where,
      // and how things are on it.
      function notice(x, z, rot, h) {
        var g = at(x, 0, z, rot);
        box(2.5, h + 0.2, 0.08, M(g, at(0, 0.7 + h / 2, -0.06)), '--ncx-stile');
        [-1.15, 1.15].forEach(function (o) { box(0.12, 0.7 + h, 0.12, M(g, at(o, (0.7 + h) / 2, -0.12)), '--ncx-stile'); });
        return M(g, at(0, 0.7, 0));
      }
      var lede = kit.lift(page, '.ncx-lede', { w: 660, ww: 2.2, m: notice(6.4, 2.0, Math.PI + 0.5, 1.6) });
      var why = kit.lift(page, '.ncx-part', { n: 2, w: 700, h: 620, ww: 2.2, m: notice(-7.6, 2.0, Math.PI - 0.5, 1.9) });
      var flows = kit.lift(page, '.ncx-part', { n: 3, w: 760, h: 620, ww: 2.2, m: notice(11.2, 2.4, Math.PI + 0.6, 1.9) });
      var rules = kit.lift(page, '.ncx-rules', { w: 700, h: 620, ww: 2.2, m: notice(-12.4, 2.4, Math.PI - 0.6, 1.9) });

      // THE PLACES: over the stile, the page, the words along the hedge, the
      // fingerpost, and every gate in the post's order.
      function facing(x, z, d, rot) { return { x: x - Math.sin(rot) * -d, z: z + Math.cos(rot) * d }; }
      var R1 = Math.PI + 0.5, R2 = Math.PI - 0.5, R3 = Math.PI + 0.6, R4 = Math.PI - 0.6, R5 = 0.95;
      var at1 = facing(6.4, 2.0, 2.8, R1), at2 = facing(-7.6, 2.0, 2.8, R2),
          at3 = facing(11.2, 2.4, 2.8, R3), at4 = facing(-12.4, 2.4, 2.8, R4), at5 = facing(-5.0, -2.0, 3.2, R5);
      stops.unshift(
        { name: 'over the stile, out of the wood, in a cloud’s shadow', where: 'at the stile, in a cloud’s shadow', x: 0, z: 1.6, yaw: 0, pitch: 0.04 },
        { name: 'at the board by the stile, the land’s own page on it', where: 'at the land’s own page', x: at5.x, z: at5.z, yaw: R5, pitch: 0.06, page: kit.page, frame: page },
        { name: 'at the notice on the right: from the stile', where: 'at the notice on what you see from the stile', x: at1.x, z: at1.z, yaw: R1, pitch: 0.1, frame: lede.el },
        { name: 'at the notice on the left: what this land is for', where: 'at the notice on what this land is for', x: at2.x, z: at2.z, yaw: R2, pitch: 0.1, frame: why.el },
        { name: 'at the far notice on the right: what goes where', where: 'at the notice on what goes where', x: at3.x, z: at3.z, yaw: R3, pitch: 0.1, frame: flows.el },
        { name: 'at the far notice on the left: on this land', where: 'at the notice on how things are on this land', x: at4.x, z: at4.z, yaw: R4, pitch: 0.1, frame: rules.el },
        { name: 'at the fingerpost', where: 'at the white fingerpost by the stile', x: PX, z: PZ + 3.4, yaw: 0, pitch: 0.35 }
      );

      return {
        start: { x: 0, z: 1.6, yaw: 0 },
        bounds: { x: [-(GATE + 1), GATE + 1], z: [-(GATE + 1), 2.6] },
        stops: stops
      };
    }
  };
})();
