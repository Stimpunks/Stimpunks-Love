/* =============================================================================
   The Cinema, walked into on Cel Street, through the curtain in the Faery
   Yurt. Ryan's ask, 2026-10-31: the yurt's doorways opening onto their rooms;
   round 2, 2026-11-04.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§121), and this is OURS: a drawing
   of her picture palace for Cel Street, in the colours her room wears (the
   Reading Room's, §114, at her ask) and nothing else, which changes nothing on
   her page and is hers to keep or send back. The house lights are down and the
   light comes over your head from the projection box at the back, one still
   wedge onto the silver screen in its gilt arch, with the velvet curtains
   drawn back from it. That beam is what keeps it off her other two rooms (a
   fire from the floor, candles at a window) and off the Lightbulb Picture
   House, where the house lights stay up and there is no beam. Rows of velvet
   seats, and along both walls her reels on their rails, in rows and never in
   a bookcase, as she asked.

   ROUND 2 DREW MORE OF WHAT HER DRAWING HAS: a candle in a brass sconce
   between every two rails on both walls, standing still, which is what lets
   the room be seen at all with the house lights down; the gilt arch brought
   down under the ceiling with a finer line inside it, the fringed velvet
   pelmet across it and the curtains held back with tasselled brass tie-backs;
   the stage's step with its brass nosing; her film strip running along the
   top of every wall and across the old-style cinema door you came in by, with
   portholes in its two leaves; the projector in its box with a lens and two
   reels; brass along the tops of the seats as in her drawing; and a timber
   dado under the rails. Two more places to stand: in the side aisle under a
   candle, and on the stage's step turned round to the box and its beam.

   THE SCREEN AND THE REELS ARE HER PAGE'S OWN, lifted off it by the kit, and
   rack.js, the page's own script, puts a reel up on the screen here as it
   does there; nothing reaches YouTube until a press. Every rail holds all its
   reels, and scrolls when there are more than fit; her page is by the door.

   ROUND 3 (Ryan's ask, 2026-11-04: "more texture and details", flickering
   candles, things that turn, things to press). The walls above the dado hung
   in pleated fabric and a trellis woven into the carpet, both drawn on paper
   in her colours; wax run down every candle in its sconce; a pleat in the
   velvet down the back of every seat; the projector's two reels drawn as
   reels, with their flanges, their film and three holes in each; a ladder up
   to the box, a little port beside the lens and a grille along its top; a
   stack of film tins under her page by the door; and dust standing in the
   beam, which holds still, because it is a beam that does not flicker.

   WHAT MOVES IS WHAT MOVES ON HER PAGE, AND WHAT YOU ASK FOR. Her dial says
   "In here MAX turns the reels on the projector; nothing else moves unless
   you ask it to ... and the light from the box never flickers", so at MAX
   the feed reel and the take-up reel go round, once in four seconds as hers
   do, each with its own switch at any other setting; the beam, the lamp in
   the box and the step lights never move at all. Her page says the candles
   stand still, and here they do too, MAX included, until somebody presses
   Let the candles flicker; then each flickers in its own time under the
   flash line the kit holds, and its light with it. Two things to press, her
   page's own two switches, each saying what it did: Join the Faeries hangs
   faeries in the projector's light, and Grow a garden grows ivy along the
   foot of the walls and up the gilt posts, with toadstools in the corners,
   all holding still as hers do until pressed. The garden is drawn in her
   yurt's ivy, toadstool and tallow, because it is her yurt's garden, as on
   her page; everything else in her room's colours.

   This is ours, hers to keep or send back, and a change to how it looks is
   hers to ask for. Every colour is one of hers, by name. It keeps nothing,
   sends nothing and fetches nothing; her page arrives through Cel Street's
   screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['faery-cinema-room.html'] = {
    name: 'The Cinema',
    from: 'faery-yurt.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, W = 13, D = 21, H = 7.5, back = -D;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2, UP = new T.Vector3(0, 1, 0);
      function v(x, y, z) { return new T.Vector3(x, y, z); }
      function hash(i, j, k) {
        var n = Math.imul(i + 11, 374761393) ^ Math.imul(j + 37, 668265263) ^ Math.imul(k + 41, 2147483647);
        n = Math.imul(n ^ (n >>> 13), 1274126177);
        return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
      }
      // A rod from one point to another, in the world.
      function rodGeo(a, b, r, seg) {
        var d = new T.Vector3().subVectors(b, a), g = new T.CylinderGeometry(r, r, d.length(), seg || 4);
        g.applyQuaternion(new T.Quaternion().setFromUnitVectors(UP, d.normalize()));
        var mid = a.clone().add(b).multiplyScalar(0.5);
        g.translate(mid.x, mid.y, mid.z);
        return g;
      }
      // A HEAP: many small things in one colour gathered into one mesh, so a
      // press can show or put away all of them at once (the faeries, the
      // garden), or a reel can turn as one thing.
      function heap() {
        var geos = [];
        return {
          add: function (geo, m) { var g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(m || new T.Matrix4()); geos.push(g); },
          mesh: function (ink, flat) {
            var n = 0, o = 0;
            geos.forEach(function (g) { n += g.attributes.position.count; });
            var pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
            geos.forEach(function (g) {
              if (!g.attributes.normal) g.computeVertexNormals();
              pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
              o += g.attributes.position.count; g.dispose();
            });
            var out = new T.BufferGeometry();
            out.setAttribute('position', new T.BufferAttribute(pos, 3));
            out.setAttribute('normal', new T.BufferAttribute(nor, 3));
            return flat ? kit.flat(out, new T.Matrix4(), ink) : kit.facets(out, new T.Matrix4(), ink);
          }
        };
      }

      // THE HOUSE LIGHTS DOWN: almost nothing but the beam and the candles.
      kit.scene.background = kit.col('--rdr-stone');
      kit.scene.add(new T.HemisphereLight(kit.col('--rdr-wall'), kit.col('--rdr-stone'), 1.2));

      // HER FILM STRIP, as it runs across the top of her page: sprocket holes
      // along both edges, the frames between them edged in brass. Drawn for a
      // length of wall, so its frames keep their shape however long that is.
      function filmStrip(len, tall) {
        var ph = 64, pw = Math.round(ph * len / tall);
        return kit.paper(pw, ph, function (c, w, h) {
          c.fillStyle = kit.ink('--rdr-stone'); c.fillRect(0, 0, w, h);
          c.globalAlpha = 0.55; c.fillStyle = kit.ink('--rdr-ink-2');
          for (var x = 6; x < w - 8; x += 20) { c.fillRect(x, 5, 8, 6); c.fillRect(x, h - 11, 8, 6); }
          c.globalAlpha = 1;
          for (var fx = 4; fx + 54 < w; fx += 60) {
            c.fillStyle = kit.ink('--rdr-panel'); c.fillRect(fx, 15, 54, 34);
            c.globalAlpha = 0.35; c.strokeStyle = kit.ink('--rdr-brass'); c.lineWidth = 2; c.strokeRect(fx + 1, 16, 52, 32); c.globalAlpha = 1;
          }
        });
      }

      // THE ROOM.
      box(W, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--rdr-timber', false, false);
      box(W - 0.6, 0.02, D - 1, at(0, 0.01, -D / 2), '--rdr-velvet', false, false);
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--rdr-wall');
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--rdr-wall');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--rdr-wall');
      box(W + 0.6, H, 0.3, at(0, H / 2, 0.15), '--rdr-wall');
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--rdr-stone', false, false);
      // A timber dado along both side walls, under the rails, with a brass rail
      // capping it, and her strip along the top of every wall.
      var wallStrip = filmStrip(D, 0.42), endStrip = filmStrip(W, 0.42);
      [-1, 1].forEach(function (s) {
        box(0.06, 0.6, D - 0.2, at(s * (W / 2 - 0.03), 0.3, -D / 2), '--rdr-timber', false, false);
        box(0.08, 0.05, D - 0.2, at(s * (W / 2 - 0.05), 0.62, -D / 2), '--rdr-brass', false, false);
        kit.sheet(wallStrip, D, 0.42, at(s * (W / 2 - 0.02), H - 0.55, -D / 2, s < 0 ? LEFT : RIGHT));
      });
      kit.sheet(endStrip, W, 0.42, at(0, H - 0.55, back + 0.02));
      kit.sheet(endStrip, W, 0.42, at(0, H - 0.55, -0.02, Math.PI));
      // The walls between the dado and the strip hung in pleated fabric, as a
      // picture palace's are: each pleat a fold of shadow and a lit edge, in
      // her wall's claret.
      function fabric(len, tall) {
        return kit.paper(Math.round(len * 60), Math.round(tall * 60), function (c, w, h) {
          c.fillStyle = kit.ink('--rdr-wall'); c.fillRect(0, 0, w, h);
          for (var x = 0; x < w; x += 22) {
            var g = c.createLinearGradient(x, 0, x + 22, 0);
            g.addColorStop(0, kit.ink('--rdr-stone')); g.addColorStop(0.45, kit.ink('--rdr-wall')); g.addColorStop(0.8, kit.ink('--rdr-panel')); g.addColorStop(1, kit.ink('--rdr-stone'));
            c.globalAlpha = 0.55; c.fillStyle = g; c.fillRect(x, 0, 22, h);
          }
          // A band of brass piping along the top and the foot of the fabric.
          c.globalAlpha = 0.6; c.fillStyle = kit.ink('--rdr-brass'); c.fillRect(0, 4, w, 2); c.fillRect(0, h - 6, w, 2);
          c.globalAlpha = 1;
        });
      }
      var fy0 = 0.66, fh = H - 0.77 - fy0, sideFabric = fabric(D, fh);
      [-1, 1].forEach(function (s) { kit.sheet(sideFabric, D, fh, at(s * (W / 2 - 0.006), fy0 + fh / 2, -D / 2, s < 0 ? LEFT : RIGHT)); });
      kit.sheet(fabric(W, fh), W, fh, at(0, fy0 + fh / 2, -0.007, Math.PI));
      // A trellis woven into the carpet, in ember and brass on the velvet.
      var trellis = kit.paper(496, 800, function (c, w, h) {
        c.fillStyle = kit.ink('--rdr-velvet'); c.fillRect(0, 0, w, h);
        c.strokeStyle = kit.ink('--rdr-ember'); c.lineWidth = 2; c.globalAlpha = 0.45;
        for (var x = -h; x < w + h; x += 40) {
          c.beginPath(); c.moveTo(x, 0); c.lineTo(x + h, h); c.stroke();
          c.beginPath(); c.moveTo(x, 0); c.lineTo(x - h, h); c.stroke();
        }
        c.fillStyle = kit.ink('--rdr-brass'); c.globalAlpha = 0.45;
        for (var y = 0; y < h + 20; y += 20) for (var x2 = (Math.round(y / 20) % 2) * 20; x2 < w + 20; x2 += 40) { c.beginPath(); c.arc(x2, y, 2.2, 0, Math.PI * 2); c.fill(); }
        c.globalAlpha = 1;
      });
      kit.sheet(trellis, W - 0.6, D - 1, at(0, 0.021, -D / 2, 0, -Math.PI / 2));

      // The old-style cinema door you came in by, behind you: two leaves of
      // timber in a brass frame, a porthole in each, brass push plates, and
      // her film strip across the pair of them.
      box(2.1, 2.7, 0.08, at(0, 1.35, -0.04), '--rdr-brass', false);
      box(1.9, 2.55, 0.1, at(0, 1.28, -0.06), '--rdr-timber');
      box(0.03, 2.5, 0.12, at(0, 1.28, -0.1), '--rdr-stone', false);
      [-1, 1].forEach(function (s) {
        kit.piece(new T.TorusGeometry(0.17, 0.035, 6, 20), at(s * 0.47, 2.0, -0.12), '--rdr-brass', false);
        kit.flat(new T.CircleGeometry(0.15, 18), at(s * 0.47, 2.0, -0.115, Math.PI), '--rdr-panel');
        box(0.07, 0.42, 0.03, at(s * 0.12, 1.15, -0.13), '--rdr-brass', false);
      });
      kit.sheet(filmStrip(1.86, 0.24), 1.86, 0.24, at(0, 1.6, -0.125, Math.PI));

      // THE SCREEN'S GILT ARCH, brought down under the ceiling, with a finer
      // line inside it; the stage under it with its brass nosing and its step;
      // the fringed velvet pelmet across the top; the velvet curtains drawn
      // back either side and held with tasselled brass tie-backs.
      var sx = 6.2, sy = 3.3, foot = 1.5, half = 3.6, post = 4.8;
      box(sx + 1.6, 0.9, 1.6, at(0, 0.45, back + 0.8), '--rdr-timber');
      box(sx + 1.62, 0.05, 0.06, at(0, 0.9, back + 1.6), '--rdr-brass', false);
      box(sx + 0.6, 0.4, 0.6, at(0, 0.2, back + 1.9), '--rdr-timber');
      box(sx + 0.62, 0.04, 0.05, at(0, 0.4, back + 2.18), '--rdr-brass', false);
      [-1, 1].forEach(function (s) {
        box(0.36, post, 0.4, at(s * half, post / 2, back + 0.25), '--rdr-brass');
        box(0.08, post - 0.9, 0.06, at(s * (half - 0.32), 0.9 + (post - 0.9) / 2, back + 0.4), '--rdr-brass', false);
      });
      var arch = new T.TorusGeometry(half, 0.2, 8, 30, Math.PI); arch.scale(1, 0.6, 1);
      kit.piece(arch, at(0, post, back + 0.25), '--rdr-brass', 0.03);
      var inner = new T.TorusGeometry(half - 0.32, 0.05, 6, 30, Math.PI); inner.scale(1, 0.55, 1);
      kit.piece(inner, at(0, post, back + 0.4), '--rdr-brass', false);
      box(sx + 0.3, 4.1, 0.05, at(0, sy, back + 0.08), '--rdr-stone', false);
      // The pelmet, with its fringe of brass along the foot.
      var pel = 2 * half + 1.6, pelY = post + 1.5;
      box(pel, 0.6, 0.3, at(0, pelY, back + 0.62), '--rdr-velvet');
      for (var fr = -pel / 2 + 0.06; fr < pel / 2; fr += 0.11) kit.cyl(0.018, 0.03, 0.14, at(fr, pelY - 0.37, back + 0.78), '--rdr-brass', false, 6);
      [-1, 1].forEach(function (s) {
        for (var f = 0; f < 6; f++) kit.cyl(0.11, 0.17, pelY, at(s * (half + 0.45 + f * 0.17), pelY / 2, back + 0.55 + (f % 2) * 0.08), '--rdr-velvet', false, 10);
        var tx = s * (half + 0.88), ty = 2.4, tz = back + 0.82;
        kit.piece(new T.TorusGeometry(0.55, 0.045, 6, 16), at(tx, ty, tz, 0, Math.PI / 2), '--rdr-brass', false);
        kit.piece(new T.SphereGeometry(0.09, 10, 8), at(tx + s * 0.5, ty, tz + 0.2), '--rdr-brass', false);
        kit.cyl(0.02, 0.1, 0.36, at(tx + s * 0.5, ty - 0.27, tz + 0.2), '--rdr-brass', false, 10);
      });

      // HER PAGE by the door at the back, and the screen and the reels off it.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.9 + ph / 2;
      var pg = at(3.9, 0, -0.02, Math.PI);
      box(pw + 0.24, ph + 0.24, 0.08, M(pg, at(0, py, 0)), '--rdr-timber');
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.06)), 'Helen Edgar’s Cinema’s own page, by the door at the back');
      // The reels draw themselves out of a symbol on her page, so it comes too.
      kit.lift(frame, '.cin-defs', { bare: true, w: 10, ww: 0.01, m: at(0, 0.5, -0.2, Math.PI) });
      // The screen stands on the stage under the arch, its foot just above
      // the boards, and grows up from there once the page's script shows it.
      var screen = kit.lift(frame, '.cin-screen', { w: 860, ww: sx, m: at(0, foot, back + 0.12) });
      var now = kit.lift(frame, '.cin-screen__now', { w: 760, ww: 4.4, m: at(0, 1.05, back + 2.26) });
      var off = kit.lift(frame, '.cin-screen__back', { w: 420, ww: 1.6, m: at(0, 0.76, back + 2.26) });
      var stops = [
        { name: 'just inside the door, with the house lights down', x: 0, z: -2.2, yaw: 0 },
        { name: 'in a seat in the middle of the house', x: 0, z: -11.2, yaw: 0 },
        { name: 'in the side aisle, under a candle in its brass sconce', x: -3.9, z: -8.6, yaw: 0.95 },
        { name: 'at the front, under the screen', x: 0, z: back + 5.6, yaw: 0, frame: screen.el },
        { name: 'on the stage’s step, turned round to the projection box and its beam', x: 0, z: back + 2.6, yaw: Math.PI },
        { name: 'under the projection box, looking up at the projector and its reels', x: 0.3, z: -3.3, yaw: Math.PI, pitch: 1.05 }
      ];
      var RAIL = [-4.0, -7.2, -10.4, -13.6, -16.8];
      for (var n = 0; n < 10; n++) {
        var s = n < 5 ? -1 : 1, z = RAIL[n % 5];
        var g = at(s * (W / 2 - 0.06), 0, z, s < 0 ? LEFT : RIGHT);
        box(2.8, 0.08, 0.12, M(g, at(0, 0.62, 0.06)), '--rdr-brass', false);
        var it = kit.lift(frame, '.cin-shelf', { n: n, w: 860, h: 700, ww: 2.6, m: M(g, at(0, 0.7, 0.04)) });
        stops.push({ name: 'at the ' + (s < 0 ? 'left' : 'right') + '-hand rail, the reels in row ' + (n % 5 + 1), x: s * (W / 2 - 2.5), z: z, yaw: s < 0 ? LEFT : RIGHT, frame: it.el });
      }
      kit.wire(frame, 'rack.js');
      stops.push({ name: 'by the door at the back, with her room’s own page on the wall', x: 3.9, z: -2.9, yaw: Math.PI, page: kit.page, frame: frame });

      // A CANDLE IN A BRASS SCONCE between every two rails, on both walls,
      // as on each side wall of her drawing: a curled brass arm, a dish, the
      // candle and its flame, and its light falling round it, all still until
      // somebody asks them to flicker. Each has burned down to its own height,
      // wax has run down its side and pooled in the dish, and every flame is
      // kept with its light, so the candles can flicker.
      var flames = [];
      [-1, 1].forEach(function (s) {
        [-2.4, -5.6, -8.8, -12.0, -15.2, -18.4].forEach(function (cz, n) {
          var w0 = at(s * (W / 2 - 0.02), 0, cz, s < 0 ? LEFT : RIGHT), ch = 0.18 + hash(n, s + 2, 1) * 0.12, top = 3.77 + ch;
          box(0.14, 0.34, 0.04, M(w0, at(0, 3.55, 0.02)), '--rdr-brass', false);
          kit.piece(new T.TorusGeometry(0.11, 0.025, 6, 12, Math.PI), M(w0, at(0, 3.62, 0.13, Math.PI / 2, 0, Math.PI / 2)), '--rdr-brass', false);
          kit.cyl(0.13, 0.05, 0.04, M(w0, at(0, 3.75, 0.25)), '--rdr-brass', false, 14);
          kit.cyl(0.04, 0.04, ch, M(w0, at(0, 3.77 + ch / 2, 0.25)), '--rdr-ink', false, 10);
          kit.cyl(0.046, 0.04, 0.02, M(w0, at(0, top - 0.01, 0.25)), '--rdr-ink', false, 10);
          [0, 1, 2].forEach(function (k) {
            var a = (hash(n, k, s + 5) + k / 3) * Math.PI * 2, run = ch * (0.3 + hash(n, k, 9) * 0.5);
            kit.cyl(0.011, 0.015, run, M(w0, at(Math.cos(a) * 0.038, top - run / 2, 0.25 + Math.sin(a) * 0.038)), '--rdr-ink', false, 5);
          });
          var pool = new T.CylinderGeometry(0.07, 0.075, 0.008, 10); pool.scale(1, 1, 0.8);
          kit.piece(pool, M(w0, at(0.02, 3.772, 0.27)), '--rdr-ink', false);
          kit.cyl(0.003, 0.003, 0.03, M(w0, at(0, top + 0.012, 0.25)), '--rdr-stone', false, 3);
          var l = new T.PointLight(kit.col('--rdr-flame-2'), 3.0, 4.6, 1.5);
          l.position.set(s * (W / 2 - 0.5), top + 0.06, cz);
          kit.scene.add(l);
          var flame = new T.ConeGeometry(0.03, 0.1, 8); flame.translate(0, 0.05, 0);
          flames.push({ mesh: kit.flat(flame, M(w0, at(0, top + 0.004, 0.25)), '--rdr-flame-2'), light: l });
          var core = new T.SphereGeometry(0.012, 6, 4); core.translate(0, 0.012, 0);
          flames.push({ mesh: kit.flat(core, M(w0, at(0, top + 0.01, 0.25)), '--rdr-flame') });
        });
      });

      // ROWS OF VELVET SEATS with timber arms, facing the screen, an aisle
      // down either side; brass along the top of every back, as in her drawing.
      for (var row = 0; row < 7; row++) {
        var rz = -6 - row * 1.35;
        box(5.6, 0.32, 0.5, at(0, 0.16, rz + 0.1), '--rdr-timber', false);
        for (var c = 0; c < 8; c++) {
          var cx = -2.45 + c * 0.7, sg = at(cx, 0, rz);
          box(0.58, 0.14, 0.5, M(sg, at(0, 0.46, 0)), '--rdr-velvet');
          box(0.58, 0.68, 0.12, M(sg, at(0, 0.84, 0.26, 0, -0.12)), '--rdr-velvet');
          // A pleat or two in the velvet down the back of it.
          [-0.15, 0, 0.15].forEach(function (px) { box(0.014, 0.58, 0.012, M(sg, M(at(0, 0.84, 0.26, 0, -0.12), at(px, -0.02, 0.064))), '--rdr-stone', false, false); });
          box(0.52, 0.03, 0.05, M(sg, at(0, 1.18, 0.31, 0, -0.12)), '--rdr-brass', false);
          box(0.1, 0.05, 0.015, M(sg, at(0, 1.02, 0.34, 0, -0.12)), '--rdr-brass', false, false);
          box(0.08, 0.32, 0.5, M(sg, at(0.33, 0.62, 0)), '--rdr-timber', false);
        }
      }

      // THE PROJECTION BOX at the back, high up: its window onto the house,
      // the projector's lens in it, its two reels standing still on top, and
      // its one still beam.
      box(2.6, 1.3, 1.3, at(0, 6.2, -0.75), '--rdr-stone');
      box(2.64, 0.08, 1.34, at(0, 5.56, -0.75), '--rdr-timber', false);
      kit.flat(new T.PlaneGeometry(0.9, 0.55), at(0, 6.1, -1.41, Math.PI), '--rdr-panel');
      box(0.5, 0.26, 0.4, at(0, 6.0, -1.25), '--rdr-timber', false);
      kit.cyl(0.11, 0.13, 0.22, at(0, 6.1, -1.45, 0, Math.PI / 2), '--rdr-brass', false, 14);
      kit.flat(new T.CircleGeometry(0.09, 14), at(0, 6.1, -1.565, Math.PI), '--rdr-flame-2');
      // The projector's two reels, the feed and the take-up, above the lens
      // on the face of the box, facing the house as in her drawing, each on a
      // brass axle: two flanges in her pale ink with three holes cut in each,
      // the film wound between them, and the hub.
      var reels = [-0.24, 0.24].map(function (x) {
        var about = at(x, 6.36, -1.53, 0, Math.PI / 2), pale = heap(), dark = heap();
        kit.cyl(0.014, 0.014, 0.13, M(about, at(0, 0.06, 0)), '--rdr-brass', false, 6);
        [-1, 1].forEach(function (sd) {
          pale.add(new T.CylinderGeometry(0.15, 0.15, 0.008, 30), M(about, at(0, sd * 0.024, 0)));
          [0, 1, 2].forEach(function (hk) {
            var ha = hk / 3 * Math.PI * 2 + 0.3;
            dark.add(new T.CircleGeometry(0.034, 14), M(about, at(Math.cos(ha) * 0.088, sd * 0.0285, Math.sin(ha) * 0.088, 0, -sd * Math.PI / 2)));
          });
        });
        dark.add(new T.CylinderGeometry(0.11, 0.11, 0.04, 26), about);
        pale.add(new T.CylinderGeometry(0.028, 0.028, 0.06, 12), about);
        return { about: about, meshes: [pale.mesh('--rdr-ink-2'), dark.mesh('--rdr-stone')] };
      });
      // A little port beside the lens to watch the house by, and a grille
      // along the top of the box's face.
      kit.piece(new T.TorusGeometry(0.1, 0.02, 6, 16), at(0.8, 6.15, -1.42), '--rdr-brass', false);
      kit.flat(new T.CircleGeometry(0.09, 14), at(0.8, 6.15, -1.415, Math.PI), '--rdr-panel');
      for (var gr = 0; gr < 7; gr++) box(1.6, 0.025, 0.02, at(0, 6.48 + gr * 0.045, -1.41), '--rdr-timber', false, false);
      // The ladder up to it, by the door.
      [1.45, 1.9].forEach(function (lx) { box(0.06, 5.6, 0.06, at(lx, 2.8, -0.22), '--rdr-timber', false); });
      for (var rg = 0.3; rg < 5.5; rg += 0.32) box(0.45, 0.035, 0.045, at(1.675, rg, -0.22), '--rdr-timber', false);
      var from = new T.Vector3(0, 6.1, -1.45), to = new T.Vector3(0, sy, back + 0.15);
      var dir = to.clone().sub(from), len = dir.length();
      var beamGeo = new T.CylinderGeometry(0.18, 3.3, len, 24, 1, true);
      beamGeo.translate(0, -len / 2, 0);
      var beam = new T.Mesh(beamGeo, new T.MeshBasicMaterial({ color: kit.col('--rdr-ink'), transparent: true, opacity: 0.06, depthWrite: false, side: T.DoubleSide }));
      beam.position.copy(from);
      beam.quaternion.setFromUnitVectors(new T.Vector3(0, -1, 0), dir.clone().normalize());
      beam.updateMatrix();
      kit.scene.add(beam);
      var spot = new T.SpotLight(kit.col('--rdr-ink'), 260, 30, 0.2, 0.4, 1.2);
      spot.position.copy(from); spot.target.position.copy(to);
      kit.scene.add(spot, spot.target);
      // The projector's own light in the box's window, so the box can be
      // seen when you turn round to it.
      var lamp = new T.PointLight(kit.col('--rdr-flame-2'), 1.6, 2.6, 1.6);
      lamp.position.set(0, 6.1, -1.75);
      kit.scene.add(lamp);
      // Step lights low along the aisles, so the floor can be found.
      [-1, 1].forEach(function (s) {
        for (var k = 0; k < 4; k++) {
          kit.flat(new T.CircleGeometry(0.05, 10), at(s * 3.3, 0.12, -6.3 - k * 2.7, s < 0 ? LEFT : RIGHT), '--rdr-flame-2');
          var l = new T.PointLight(kit.col('--rdr-flame-2'), 0.6, 3, 1.6);
          l.position.set(s * 3.3, 0.25, -6.3 - k * 2.7);
          kit.scene.add(l);
        }
      });

      // A STACK OF FILM TINS under her page by the door, one leaning on it.
      for (var tn = 0; tn < 5; tn++) {
        var tm = at(3.9 + (hash(tn, 3, 1) - 0.5) * 0.06, 0.03 + tn * 0.055, -0.45 + (hash(tn, 3, 2) - 0.5) * 0.06, hash(tn, 3, 3) * 3);
        kit.cyl(0.22, 0.22, 0.05, tm, tn % 2 ? '--rdr-brass' : '--rdr-ink-2', 0.006, 22);
        kit.cyl(0.225, 0.225, 0.008, M(tm, at(0, 0.02, 0)), '--rdr-stone', false, 22);
      }
      kit.cyl(0.22, 0.22, 0.05, at(4.45, 0.24, -0.33, 0.3, Math.PI / 2 - 0.25), '--rdr-ink-2', 0.006, 22);

      // DUST standing in the beam, still, as the beam is: specks of her pale
      // ink caught where the light passes through the dark.
      var bdir = dir.clone().normalize(), side = new T.Vector3().crossVectors(bdir, UP).normalize(), lift = new T.Vector3().crossVectors(side, bdir).normalize();
      function inBeam(t, a, r) {
        return from.clone().addScaledVector(bdir, len * t).addScaledVector(side, Math.cos(a) * r * (0.18 + 3.1 * t)).addScaledVector(lift, Math.sin(a) * r * (0.18 + 3.1 * t));
      }
      var dust = heap();
      for (var ds = 0; ds < 160; ds++) {
        var dp = inBeam(0.06 + hash(ds, 1, 2) * 0.86, hash(ds, 1, 3) * Math.PI * 2, Math.sqrt(hash(ds, 1, 4)) * 0.8);
        dust.add(new T.SphereGeometry(0.006 + hash(ds, 1, 5) * 0.01, 4, 3), at(dp.x, dp.y, dp.z));
      }
      dust.mesh('--rdr-ink-2', true);

      // JOIN THE FAERIES, her page's own switch: faeries in the projector's
      // light, each with a cloak, a head of hair, two pairs of pale wings and
      // a little light at its heart, holding still where they are, as hers do
      // until pressed.
      var cloakH = [heap(), heap()], headH = heap(), hairH = [heap(), heap()], wingH = heap(), heartH = heap();
      [[0.3, 0.2, 0.4], [0.38, 2.2, 0.55], [0.46, 4.0, 0.3], [0.53, 1.0, 0.6], [0.6, 3.2, 0.45], [0.67, 5.3, 0.5], [0.74, 0.4, 0.25], [0.8, 2.7, 0.6], [0.42, 5.8, 0.7]].forEach(function (fp, n) {
        var c0 = inBeam(fp[0], fp[1], fp[2]), sc = 1.7;
        var fm = M(at(c0.x, c0.y, c0.z, (hash(n, 9, 1) - 0.5) * 2.4 + Math.PI, 0, (hash(n, 9, 2) - 0.5) * 0.4), new T.Matrix4().makeScale(sc, sc, sc));
        cloakH[n % 2].add(new T.ConeGeometry(0.05, 0.17, 8), fm);
        headH.add(new T.SphereGeometry(0.036, 8, 6), M(fm, at(0, 0.115, 0)));
        hairH[(n >> 1) % 2].add(new T.SphereGeometry(0.04, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.6), M(fm, at(0, 0.12, -0.006)));
        [[0.06, 0.6, 1], [0.04, 0.0, 0.7]].forEach(function (wp) {
          [-1, 1].forEach(function (sd) {
            var wing = new T.CircleGeometry(0.075 * wp[2], 12); wing.scale(0.5, 1, 1);
            var wm = M(fm, at(sd * 0.05, wp[0], -0.035, sd * 0.5, 0, -sd * (0.7 + wp[1])));
            wingH.add(wing, wm);
            wingH.add(wing.clone().rotateY(Math.PI), wm);
          });
        });
        heartH.add(new T.SphereGeometry(0.016, 6, 4), M(fm, at(0, 0.05, 0.045)));
      });
      var faeries = [cloakH[0].mesh('--rdr-velvet'), cloakH[1].mesh('--rdr-leather'), headH.mesh('--rdr-ink'),
                     hairH[0].mesh('--rdr-flame'), hairH[1].mesh('--rdr-timber'), wingH.mesh('--rdr-ink-2', true), heartH.mesh('--rdr-flame-2', true)];
      faeries.forEach(function (f) { kit.hide(f, true); });

      // GROW A GARDEN, her page's other switch: ivy along the foot of the
      // walls and up the gilt posts either side of the screen, toadstools in
      // the corners and on the stage, in her yurt's ivy, toadstool and tallow,
      // because it is her yurt's garden.
      var leafA = heap(), leafB = heap(), vine = heap(), capH = heap(), stemH = heap();
      function ivy(pts, face, seed) {
        for (var k = 1; k < pts.length; k++) {
          vine.add(rodGeo(pts[k - 1], pts[k], 0.01, 3));
          for (var q = 0; q < 3; q++) {
            var u = hash(seed, k * 3 + q, 1), p = pts[k - 1].clone().lerp(pts[k], u);
            var lf = new T.SphereGeometry(0.085, 6, 4); lf.scale(1, 0.55, 0.3);
            (hash(seed, k * 3 + q, 2) < 0.6 ? leafA : leafB).add(lf, at(p.x, p.y + (hash(seed, k * 3 + q, 3) - 0.5) * 0.14, p.z, face, 0, hash(seed, k * 3 + q, 4) * 3));
          }
        }
      }
      function run(from0, to0, base, wave, steps, seed, put) {
        var pts = [];
        for (var k = 0; k <= steps; k++) { var t = k / steps; pts.push(put(from0 + (to0 - from0) * t, base + Math.sin(t * steps * 0.7 + seed) * wave)); }
        return pts;
      }
      ivy(run(-0.9, back + 2.5, 0.32, 0.16, 60, 1, function (z, y) { return v(-W / 2 + 0.08, y, z); }), LEFT, 1);
      ivy(run(-0.9, back + 2.5, 0.3, 0.18, 60, 2, function (z, y) { return v(W / 2 - 0.08, y, z); }), RIGHT, 2);
      ivy(run(-6.2, -1.25, 0.3, 0.14, 16, 3, function (x, y) { return v(x, y, -0.09); }), Math.PI, 3);
      ivy(run(1.25, 6.2, 0.34, 0.14, 16, 4, function (x, y) { return v(x, y, -0.09); }), Math.PI, 4);
      [-1, 1].forEach(function (sd) {
        ivy(run(0.95, 4.4, 0, 0.1, 14, 5 + sd, function (y, x) { return v(sd * (half + 0.2) + x, y, back + 0.47); }), 0, 6 + sd);
      });
      function toadstool(x, y, z, sc) {
        stemH.add(new T.CylinderGeometry(0.035 * sc, 0.045 * sc, 0.18 * sc, 8), at(x, y + 0.09 * sc, z));
        capH.add(new T.SphereGeometry(0.11 * sc, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), at(x, y + 0.17 * sc, z));
        for (var d = 0; d < 5; d++) {
          var a3 = d / 5 * Math.PI * 2 + sc;
          stemH.add(new T.SphereGeometry(0.016 * sc, 5, 3), at(x + Math.cos(a3) * 0.065 * sc, y + 0.245 * sc, z + Math.sin(a3) * 0.065 * sc));
        }
      }
      [[-5.9, 0, -0.7], [5.9, 0, -0.75], [-5.9, 0, back + 2.6], [5.9, 0, back + 2.7], [-4.3, 0.9, back + 1.3], [4.25, 0.9, back + 1.35], [-5.9, 0, -10.6], [5.9, 0, -7.4]].forEach(function (cl, n) {
        for (var ts = 0; ts < 3 + n % 2; ts++) toadstool(cl[0] + (hash(n, ts, 1) - 0.5) * 0.4, cl[1], cl[2] + (hash(n, ts, 2) - 0.5) * 0.4, 0.7 + hash(n, ts, 3) * 0.8);
      });
      var garden = [leafA.mesh('--ivy'), leafB.mesh('--ivy-2'), vine.mesh('--ivy-2'), capH.mesh('--toadstool'), stemH.mesh('--tallow')];
      garden.forEach(function (g) { kit.hide(g, true); });

      // THE ROOM'S SWITCHES. The reels go round at MAX as hers do, or when
      // asked, each by its own switch; the candles flicker only when asked,
      // and the light from the box never does.
      var feed = kit.turn(reels[0].meshes, reels[0].about, { say: 'Turn the feed reel', max: true, period: 4,
        said: function (on) { return on ? 'The feed reel on the projector goes round, once in four seconds.' : 'The feed reel stops where it is.'; } });
      var takeUp = kit.turn(reels[1].meshes, reels[1].about, { say: 'Turn the take-up reel', max: true, period: 4,
        said: function (on) { return on ? 'The take-up reel on the projector goes round, once in four seconds.' : 'The take-up reel stops where it is.'; } });
      var candles = kit.flames(flames, { say: 'Let the candles flicker',
        said: function (on) { return on ? 'Every candle in its sconce flickers, each in its own time; the light from the box stays steady.' : 'The candles stand still again, as on her page.'; } });
      var mid = inBeam(0.55, 0, 0);
      var joinFaeries = kit.press({ say: function () { return kit.hidden(faeries[0]) ? 'Join the Faeries' : 'Let the Faeries go'; },
        at: [kit.touch(3, 2.4, 6, at(mid.x, mid.y, mid.z))],
        press: function () {
          var come = kit.hidden(faeries[0]);
          faeries.forEach(function (f) { kit.hide(f, !come); });
          return come ? 'Faeries have come in and hang in the projector’s light, holding still over the seats.' : 'The Faeries have gone, and the beam is empty again but for its dust.';
        } });
      var grow = kit.press({ say: function () { return kit.hidden(garden[0]) ? 'Grow a garden' : 'Clear the garden'; },
        at: [kit.touch(1.2, 1.0, 1.2, at(-5.7, 0.4, -0.9))],
        press: function () {
          var growNow = kit.hidden(garden[0]);
          garden.forEach(function (g) { kit.hide(g, !growNow); });
          return growNow ? 'Ivy has grown along the foot of the walls and up the gilt posts beside the screen, with toadstools in the corners and on the stage.' : 'The ivy and the toadstools are cleared away.';
        } });
      stops.forEach(function (st2) {
        if (/^on the stage’s step/.test(st2.name)) st2.acts = [feed, takeUp, joinFaeries];
        if (/^under the projection box/.test(st2.name)) st2.acts = [feed, takeUp];
        if (/^in a seat/.test(st2.name)) st2.acts = [joinFaeries, candles];
        if (/^in the side aisle/.test(st2.name)) st2.acts = [candles, grow];
        if (/^just inside the door/.test(st2.name)) st2.acts = [grow];
        if (/^at the front, under the screen/.test(st2.name)) st2.acts = [grow];
      });

      return {
        start: { x: 0, z: -2.2, yaw: 0 },
        bounds: { x: [-W / 2 + 1.0, W / 2 - 1.0], z: [back + 2.2, -1.0] },
        stops: stops,
        // Offered in a VR headset, as the yurt it opens off is (Ryan's ask,
        // 2026-11-07), so you walk in from the yurt without leaving the
        // headset. On a screen this changes nothing. What is lifted off her
        // page is not in the headset, which shows only the picture.
        vr: true
      };
    }
  };
})();
