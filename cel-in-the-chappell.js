/* =============================================================================
   The Chappell, walked into on Cel Street, through the doorway in Pink Pony
   Club's left-hand wall. Ryan's ask, 2026-10-31: down the street a room at a
   time, and then the rooms behind the doors. Made glorious on 2026-11-04, at
   Ryan's ask: the stained glass, and the way it lights the room.

   IT IS A SUBROOM AND IT STILL SHARES NOTHING WITH ITS PARENT (§12). The
   dancefloor is flat hot pink, cream and one big tray; this is votive indigo,
   gold leaf and thirteen free-standing arches on the stone floor of a tall
   nave, the floor showing between them. Being reached through Pink Pony Club
   is a fact about the doors, not a licence to inherit its face, so not one of
   the dancefloor's colours is used in here.

   THE BUILDING is a nave of indigo stone in bays: clustered piers with gold
   bases and capitals down both walls, a gold string course under the windows,
   and over it all a pointed vault, ultramarine and starred with gold, its ribs
   gilded and crossing at a boss in every bay. The floor is flagstones with a
   gold stud where four meet and a gold seam down the aisle.

   THE GLASS is in every bay on both walls, a pair of lancets under a round
   window, leaded panes and medallions; the great rose window high in the east
   wall over the chancel, a ring of petals round rings of roundels round a gold
   eye; a smaller rose over the west door; and two windows flanking the
   chancel. It is the Chappell's own four glass colours with the day behind
   them, and gold, and it carries no word.

   THE LIGHT is what that glass does to the room. The south windows throw their
   own pictures down across the floor of the nave, every pane where it lands,
   through shafts you can see in the air; the rose throws itself onto the floor
   in front of the chancel step; and the gold catches it on the arches, the
   piers, the plinths and the chancel's step, with the candles' gold low at the
   votive rail by the door. The light lies where it lands and stays there.

   THE ARCHES are the page's own niches, lifted off it by the kit, each standing
   on its own plinth inside a gold arch on the nave floor, seven down the left
   and six down the right, one to a bay, in the page's order; each plays its
   own video where it stands, and says how long it runs before the press,
   because the button is the page's. THE CHANCEL is the east end: up two steps,
   the same ground, gold, cream serif and glass, and what makes it the east end
   is its size and its solitude, a deeper arch of three orders with nothing
   beside it, under the rose window. Its button plays the whole playlist from
   the top, and says it runs until you stop it, because a playlist has no
   length to give. No random start.

   NOTHING MOVES: no candle flickers, no window turns, no light drifts; the
   room is drawn when you move and not otherwise. Every colour is one the
   Chappell declares, by name. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Cel Street's screen(). The glass, the
   light and the stone are drawn on canvases and in geometry here, in those
   colours, and tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-chappell.html'] = {
    name: 'The Chappell',
    from: 'pink-pony-club.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var V = function (x, y, z) { return new T.Vector3(x, y, z); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2, TAU = Math.PI * 2;
      var W = 14, HALF = W / 2, D = 38, back = -D, HW = 9, RISE = 3.6, TOP = HW + RISE + 0.5;
      var BAY = 3.4, PIER0 = -0.5, BAYS = 10;
      var LEAD = kit.ink('--glass');

      // Always the same room: a seeded hand, never chance.
      var seed = 20261104;
      function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

      // THE VAULT'S SECTION: a pointed arch springing off both walls at HW and
      // rising RISE, two arcs whose centres sit below the springing.
      var CX = 1.4, CY = (RISE * RISE - Math.pow(HALF + CX, 2) + CX * CX) / (2 * RISE);
      var RR = Math.hypot(HALF + CX, CY);
      function rise(x) { var a = Math.min(Math.abs(x), HALF); return CY + Math.sqrt(Math.max(0, RR * RR - Math.pow(a + CX, 2))); }
      function inward(x) {
        var s = x < 0 ? -1 : 1;
        return V(-s * (CX + Math.abs(x)), CY - rise(x), 0).normalize();
      }

      // ── Geometry gathered into a few meshes ─────────────────────────────
      // A bag of triangles with texture coordinates and a colour at every
      // corner, made into one mesh at the end: every window of one design is
      // one draw, every gold rib and star and jewel another.
      function Bag() { this.p = []; this.uv = []; this.c = []; }
      Bag.prototype.v = function (a, uv, c) {
        this.p.push(a.x, a.y, a.z); this.uv.push(uv[0], uv[1]); this.c.push(c.r, c.g, c.b);
      };
      Bag.prototype.quad = function (a, b, c, d, uvs, cols) {
        var self = this, pts = [a, b, c, d];
        [0, 1, 2, 0, 2, 3].forEach(function (i) { self.v(pts[i], uvs[i], cols[i]); });
      };
      Bag.prototype.geo = function (g0, m, colour) {
        var g = g0.index ? g0.toNonIndexed() : g0.clone();
        g.applyMatrix4(m);
        var p = g.attributes.position, uv = g.attributes.uv;
        for (var i = 0; i < p.count; i++) {
          this.p.push(p.getX(i), p.getY(i), p.getZ(i));
          this.uv.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0);
          this.c.push(colour.r, colour.g, colour.b);
        }
        g.dispose();
      };
      Bag.prototype.mesh = function (mat, order) {
        var g = new T.BufferGeometry();
        g.setAttribute('position', new T.Float32BufferAttribute(this.p, 3));
        g.setAttribute('uv', new T.Float32BufferAttribute(this.uv, 2));
        g.setAttribute('color', new T.Float32BufferAttribute(this.c, 3));
        var mesh = new T.Mesh(g, mat);
        mesh.matrixAutoUpdate = false;
        if (order) mesh.renderOrder = order;
        kit.scene.add(mesh);
        return mesh;
      };
      var UV4 = [[0, 0], [1, 0], [1, 1], [0, 1]];
      function same(c) { return [c, c, c, c]; }
      // A flat rectangle, its corners from a centre, the way u runs and the
      // way v runs, w by h.
      function corners(c, ux, uy, w, h) {
        var hx = ux.clone().multiplyScalar(w / 2), hy = uy.clone().multiplyScalar(h / 2);
        return [c.clone().sub(hx).sub(hy), c.clone().add(hx).sub(hy), c.clone().add(hx).add(hy), c.clone().sub(hx).add(hy)];
      }

      // Glass with the day behind it, unlit by anything in the room; light
      // laid where it lands, added to what is there; jewels and gilding that
      // shine whatever faces them.
      function glassMat(map) { return new T.MeshBasicMaterial({ map: map, alphaTest: 0.5, side: T.DoubleSide }); }
      function lightMat(map, opacity) {
        return new T.MeshBasicMaterial({ map: map, transparent: true, opacity: opacity, depthWrite: false,
          blending: T.AdditiveBlending, side: T.DoubleSide, vertexColors: true, polygonOffset: true, polygonOffsetFactor: -2 });
      }
      var shine = new T.MeshBasicMaterial({ vertexColors: true });

      // ── The glass, drawn on canvases in the Chappell's colours ──────────
      var K = 160;                                   // pixels to the metre
      var WIN_W = 2.2, WIN_H = 5.2, SILL = 3.4;      // a bay's window, in metres
      function circle(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, TAU); }
      // A pointed lancet, w wide, springing at sp and rising to its point,
      // in canvas pixels with y running down.
      function lancetPath(g, X, Y, cx, w, y0, sp) {
        var l = cx - w / 2, r = cx + w / 2, i;
        g.beginPath();
        g.moveTo(X(l), Y(y0)); g.lineTo(X(l), Y(sp));
        for (i = 0; i <= 12; i++) { var t = i / 12 * Math.PI / 3; g.lineTo(X(r - w * Math.cos(t)), Y(sp + w * Math.sin(t))); }
        for (i = 12; i >= 0; i--) { var u = i / 12 * Math.PI / 3; g.lineTo(X(l + w * Math.cos(u)), Y(sp + w * Math.sin(u))); }
        g.lineTo(X(r), Y(y0)); g.closePath();
      }
      function lancet(g, X, Y, cx, w, sp, pal, meds) {
        lancetPath(g, X, Y, cx, w, 0, sp);
        g.save(); g.clip();
        g.fillStyle = kit.ink(pal.field); g.fillRect(0, 0, g.canvas.width, g.canvas.height);
        // The field's quarries, leaded on the diagonal.
        g.strokeStyle = LEAD; g.lineWidth = 2.5;
        var step = 0.2 * K, n;
        for (n = -g.canvas.height; n < g.canvas.width + g.canvas.height; n += step) {
          g.beginPath(); g.moveTo(n, 0); g.lineTo(n + g.canvas.height, g.canvas.height); g.stroke();
          g.beginPath(); g.moveTo(n, 0); g.lineTo(n - g.canvas.height, g.canvas.height); g.stroke();
        }
        // The medallions up the light, each a ring round a roundel.
        meds.forEach(function (my, k) {
          var mx = X(cx), yy = Y(my), r = 0.31 * K;
          circle(g, mx, yy, r); g.fillStyle = kit.ink(k % 2 ? pal.med2 : pal.med); g.fill();
          g.lineWidth = 4; g.strokeStyle = LEAD; g.stroke();
          circle(g, mx, yy, r * 0.56); g.fillStyle = kit.ink(pal.core); g.fill(); g.stroke();
          g.lineWidth = 2.5;
          for (var s = 0; s < 8; s++) {
            var a = s * Math.PI / 4;
            g.beginPath(); g.moveTo(mx + Math.cos(a) * r * 0.56, yy + Math.sin(a) * r * 0.56);
            g.lineTo(mx + Math.cos(a) * r, yy + Math.sin(a) * r); g.stroke();
          }
          circle(g, mx, yy, r * 0.16); g.fillStyle = kit.ink('--chap-pale'); g.fill(); g.stroke();
        });
        // The border, with a pearl of gold every so often along it.
        lancetPath(g, X, Y, cx, w, 0, sp);
        g.lineWidth = 0.15 * K; g.strokeStyle = kit.ink(pal.border); g.stroke();
        g.fillStyle = kit.ink('--leaf');
        for (var py = 0.12; py < sp; py += 0.24) {
          circle(g, X(cx - w / 2 + 0.04), Y(py), 3.6); g.fill();
          circle(g, X(cx + w / 2 - 0.04), Y(py), 3.6); g.fill();
        }
        lancetPath(g, X, Y, cx + 0, w - 0.15, 0.075, sp);
        g.lineWidth = 2.5; g.strokeStyle = LEAD; g.stroke();
        g.restore();
        lancetPath(g, X, Y, cx, w, 0, sp);
        g.lineWidth = 6; g.strokeStyle = LEAD; g.stroke();
      }
      // A bay's window: two lancets under a round window with a quatrefoil.
      function bayWindow(pal) {
        return kit.paper(WIN_W * K, WIN_H * K, function (g, w) {
          var X = function (m) { return w / 2 + m * K; }, Y = function (m) { return WIN_H * K - m * K; };
          var LW = 0.84, SP = 3.5;
          [-0.51, 0.51].forEach(function (cx) { lancet(g, X, Y, cx, LW, SP, pal, [0.7, 1.72, 2.74]); });
          var ox = X(0), oy = Y(4.62), r = 0.52 * K;
          circle(g, ox, oy, r); g.fillStyle = kit.ink(pal.field); g.fill();
          g.save(); circle(g, ox, oy, r); g.clip();
          for (var q = 0; q < 4; q++) {
            var a = q * Math.PI / 2 + Math.PI / 4;
            circle(g, ox + Math.cos(a) * r * 0.4, oy + Math.sin(a) * r * 0.4, r * 0.4);
            g.fillStyle = kit.ink(pal.lobe); g.fill(); g.lineWidth = 3; g.strokeStyle = LEAD; g.stroke();
          }
          circle(g, ox, oy, r * 0.22); g.fillStyle = kit.ink('--leaf'); g.fill(); g.stroke();
          g.restore();
          circle(g, ox, oy, r - 0.06 * K); g.lineWidth = 0.12 * K; g.strokeStyle = kit.ink(pal.border); g.stroke();
          circle(g, ox, oy, r); g.lineWidth = 6; g.strokeStyle = LEAD; g.stroke();
          circle(g, ox, oy, r - 0.12 * K); g.lineWidth = 2.5; g.stroke();
        });
      }
      var PALS = [
        { field: '--chap-sapphire', border: '--chap-ruby', med: '--chap-ruby', med2: '--chap-emerald', core: '--leaf', lobe: '--chap-amethyst' },
        { field: '--chap-ruby', border: '--chap-sapphire', med: '--chap-sapphire', med2: '--chap-amethyst', core: '--chap-emerald', lobe: '--leaf' },
        { field: '--chap-amethyst', border: '--chap-emerald', med: '--leaf', med2: '--chap-sapphire', core: '--chap-ruby', lobe: '--chap-sapphire' }
      ];
      var WINDOWS = PALS.map(bayWindow);

      // The rose: a ring of petals round a ring of roundels round a gold eye,
      // all leaded, in a gold rim set with pale stones.
      var ROSE = kit.paper(1024, 1024, function (g, s) {
        var c = s / 2, i, a, hw;
        var P = function (r, ang) { return [c + r * Math.sin(ang), c - r * Math.cos(ang)]; };
        circle(g, c, c, 500); g.fillStyle = LEAD; g.fill();
        // Sixteen petals, pointed outward, each with a jewel near its tip.
        for (i = 0; i < 16; i++) {
          a = i * TAU / 16; hw = TAU / 16 * 0.34;
          var p0 = P(232, a - hw), p1 = P(232, a + hw), p2 = P(392, a + hw * 0.92), tip = P(470, a), p3 = P(392, a - hw * 0.92);
          g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p3[0], p3[1]);
          g.quadraticCurveTo(P(452, a - hw * 0.5)[0], P(452, a - hw * 0.5)[1], tip[0], tip[1]);
          g.quadraticCurveTo(P(452, a + hw * 0.5)[0], P(452, a + hw * 0.5)[1], p2[0], p2[1]);
          g.lineTo(p1[0], p1[1]); g.closePath();
          g.fillStyle = kit.ink(i % 2 ? '--chap-sapphire' : '--chap-ruby'); g.fill();
          g.lineWidth = 6; g.strokeStyle = LEAD; g.stroke();
          var j = P(380, a);
          circle(g, j[0], j[1], 26); g.fillStyle = kit.ink(i % 2 ? '--leaf' : '--chap-emerald'); g.fill(); g.lineWidth = 4; g.stroke();
          var k = P(300, a);
          circle(g, k[0], k[1], 18); g.fillStyle = kit.ink(i % 2 ? '--chap-amethyst' : '--leaf'); g.fill(); g.stroke();
          // A trefoil of three small roundels between this petal and the next.
          var b = a + TAU / 32;
          [[440, 0], [404, -0.035], [404, 0.035]].forEach(function (t) {
            var q = P(t[0], b + t[1]);
            circle(g, q[0], q[1], 17); g.fillStyle = kit.ink(i % 2 ? '--chap-emerald' : '--chap-amethyst'); g.fill(); g.lineWidth = 3; g.stroke();
          });
        }
        // Eight roundels round the eye.
        for (i = 0; i < 8; i++) {
          a = i * TAU / 8 + TAU / 16;
          var m = P(160, a);
          circle(g, m[0], m[1], 66); g.fillStyle = kit.ink('--chap-amethyst'); g.fill(); g.lineWidth = 5; g.strokeStyle = LEAD; g.stroke();
          for (var f = 0; f < 4; f++) {
            var fa = f * Math.PI / 2 + Math.PI / 4;
            circle(g, m[0] + Math.cos(fa) * 26, m[1] + Math.sin(fa) * 26, 24);
            g.fillStyle = kit.ink(i % 2 ? '--chap-ruby' : '--chap-sapphire'); g.fill(); g.lineWidth = 3; g.stroke();
          }
          circle(g, m[0], m[1], 14); g.fillStyle = kit.ink('--leaf'); g.fill(); g.stroke();
        }
        // The eye: a gold flower of eight petals on blue.
        circle(g, c, c, 88); g.fillStyle = kit.ink('--chap-sapphire'); g.fill(); g.lineWidth = 6; g.strokeStyle = LEAD; g.stroke();
        for (i = 0; i < 8; i++) {
          a = i * TAU / 8;
          var e = P(50, a);
          circle(g, e[0], e[1], 30); g.fillStyle = kit.ink('--leaf'); g.fill(); g.lineWidth = 3; g.stroke();
        }
        circle(g, c, c, 26); g.fillStyle = kit.ink('--chap-ruby'); g.fill(); g.lineWidth = 4; g.stroke();
        // The rim, gold, set with pale stones.
        circle(g, c, c, 491); g.lineWidth = 18; g.strokeStyle = kit.ink('--leaf'); g.stroke();
        g.fillStyle = kit.ink('--chap-pale');
        for (i = 0; i < 64; i++) { var st = P(491, i * TAU / 64); circle(g, st[0], st[1], 4.5); g.fill(); }
        circle(g, c, c, 500); g.lineWidth = 5; g.strokeStyle = LEAD; g.stroke();
        circle(g, c, c, 481); g.stroke();
      });

      // Light on the floor is the glass's picture with its edges gone soft:
      // the same canvas drawn again a little out of register all round.
      function soft(map) {
        var src = map.image;
        return kit.paper(src.width, src.height, function (g, w, h) {
          var N = 16, r = Math.max(3, w / 70);
          g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 / N;
          for (var i = 0; i < N; i++) {
            var a = i * TAU / N, d = r * (i % 2 ? 1 : 0.5);
            g.drawImage(src, Math.cos(a) * d, Math.sin(a) * d, w, h);
          }
        });
      }

      // Soft light, for the haloes round the rose and round the candles. A
      // halo is the one gradient in here, and it only ever fades to nothing.
      function halo(ink) {
        return kit.paper(256, 256, function (g, s) {
          var gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
          gr.addColorStop(0, kit.ink(ink)); gr.addColorStop(1, 'transparent');
          g.fillStyle = gr; g.fillRect(0, 0, s, s);
        });
      }

      // The flagstones: three by three to a sheet, two stones' colours, the
      // joints leaded dark, and a gold stud where four stones meet.
      var FLAGS = kit.paper(512, 512, function (g, s) {
        var cell = s / 3, i, j;
        for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) {
          g.fillStyle = kit.ink((i + j) % 2 ? '--chap-flag-2' : '--chap-flag');
          g.fillRect(i * cell, j * cell, cell, cell);
        }
        g.strokeStyle = LEAD; g.lineWidth = 5;
        for (i = 0; i <= 3; i++) {
          g.beginPath(); g.moveTo(i * cell, 0); g.lineTo(i * cell, s); g.stroke();
          g.beginPath(); g.moveTo(0, i * cell); g.lineTo(s, i * cell); g.stroke();
        }
        g.fillStyle = kit.ink('--leaf');
        for (i = 0; i <= 3; i++) for (j = 0; j <= 3; j++) { circle(g, i * cell, j * cell, 7); g.fill(); }
      });

      // ── The light in the air ────────────────────────────────────────────
      // The nave in the dark, the rose window's violet coming down it from
      // the east, the windows' gold from the south, the candles low.
      kit.scene.background = kit.col('--glass');
      kit.scene.fog = new T.Fog(kit.col('--nave'), 26, 80);
      kit.scene.add(new T.HemisphereLight(kit.col('--cream'), kit.col('--chap-stone'), 0.7));
      kit.scene.add(new T.HemisphereLight(kit.col('--leaf'), kit.col('--nave'), 0.25));
      var rose = new T.SpotLight(kit.col('--chap-amethyst'), 120, 46, 0.55, 0.8, 1.2);
      rose.position.set(0, 9.8, back + 1.0);
      rose.target.position.set(0, 0, -12);
      rose.castShadow = true;
      rose.shadow.mapSize.set(1024, 1024);
      rose.shadow.bias = -0.0008; rose.shadow.normalBias = 0.03;
      kit.scene.add(rose, rose.target);
      // The day through the south glass: no shadow of the wall it came
      // through, so it reaches the gold it falls on.
      var day = new T.DirectionalLight(kit.col('--cream'), 1.1);
      day.position.set(12, 16, 6); day.target.position.set(0, 0, -16);
      kit.scene.add(day, day.target);

      // ── The building ────────────────────────────────────────────────────
      // The floor, flagged; the walls in indigo stone; the end walls up to
      // the vault's point; the door you came in by in the west wall.
      box(W, 0.1, D + 1, at(0, -0.05, -D / 2), '--nave', false, false);
      var SW = W / 4, SD = D / 10, ix, iz;
      for (ix = 0; ix < 4; ix++) for (iz = 0; iz < 10; iz++) {
        kit.sheet(FLAGS, SW, SD, at(-HALF + (ix + 0.5) * SW, 0.004, -(iz + 0.5) * SD, 0, -Math.PI / 2));
      }
      [-1, 1].forEach(function (s) { box(0.3, TOP, D + 1, at(s * (HALF + 0.15), TOP / 2, -D / 2), '--chap-wall'); });
      box(W + 0.6, TOP, 0.3, at(0, TOP / 2, back - 0.15), '--chap-wall');
      box((W - 2.2) / 2, TOP, 0.3, at(-(W + 2.2) / 4, TOP / 2, 0.15), '--chap-wall');
      box((W - 2.2) / 2, TOP, 0.3, at((W + 2.2) / 4, TOP / 2, 0.15), '--chap-wall');
      box(2.2, TOP - 3.0, 0.3, at(0, 3.0 + (TOP - 3.0) / 2, 0.15), '--chap-wall');
      box(2.0, 2.9, 0.08, at(0, 1.45, 0.06), '--glass');
      [-1.05, 1.05].forEach(function (x) { box(0.12, 3.0, 0.36, at(x, 1.5, 0.12), '--leaf', 0.02); });
      box(2.3, 0.12, 0.36, at(0, 3.0, 0.12), '--leaf', 0.02);
      box(0.08, 0.02, D - 8, at(0, 0.012, -(D - 8) / 2 - 0.8), '--leaf', false, false);

      // The string course under the windows and the cornice the vault springs
      // from, gold, all the way down both walls.
      [-1, 1].forEach(function (s) {
        box(0.14, 0.14, D, at(s * (HALF - 0.07), SILL - 0.2, -D / 2), '--leaf', 0.015);
        box(0.36, 0.22, D, at(s * (HALF - 0.18), HW + 0.02, -D / 2), '--leaf', 0.02);
      });

      // THE VAULT: ultramarine, in strips along its section.
      var STRIPS = 22, xs = [], k2;
      for (k2 = 0; k2 <= STRIPS; k2++) xs.push(-HALF + W * k2 / STRIPS);
      for (k2 = 0; k2 < STRIPS; k2++) {
        var x0 = xs[k2], x1 = xs[k2 + 1], y0 = HW + rise(x0), y1 = HW + rise(x1);
        var len = Math.hypot(x1 - x0, y1 - y0), n0 = inward((x0 + x1) / 2);
        kit.piece(new T.BoxGeometry(len + 0.04, 0.24, D + 0.6),
          at((x0 + x1) / 2 - n0.x * 0.12, (y0 + y1) / 2 - n0.y * 0.12, -D / 2, 0, 0, Math.atan2(y1 - y0, x1 - x0)), '--chap-vault', false);
      }

      // Gold that shines whatever faces it: the ribs, the bosses, the stars,
      // the stones on the arches, the votive jars and their flames.
      var gold = new Bag(), GOLD = kit.col('--leaf');
      function along(pts, r) { gold.geo(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 48, r, 6, false), new T.Matrix4(), GOLD); }
      function onVault(x, z, under) { var n = inward(x); return V(x + n.x * under, HW + rise(x) + n.y * under, z); }
      var piers = [], j;
      for (j = 0; j <= BAYS; j++) piers.push(PIER0 - BAY * j);
      piers.push(back + 0.1);
      // A transverse rib over every pier, a pair of diagonals across every
      // bay, a ridge rib down the crown, and a boss where the diagonals meet.
      piers.forEach(function (z) {
        var pts = [], i;
        for (i = 0; i <= 40; i++) pts.push(onVault(-HALF + 0.25 + (W - 0.5) * i / 40, z, 0.12));
        along(pts, 0.1);
      });
      var ridge = [];
      for (j = 0; j <= 20; j++) ridge.push(onVault(0, 0.2 - (D + 0.2) * j / 20, 0.1));
      along(ridge, 0.07);
      for (j = 0; j < piers.length - 1; j++) {
        var za = piers[j], zb = piers[j + 1], zm = (za + zb) / 2;
        [[za, zb], [zb, za]].forEach(function (p) {
          var pts = [], i;
          for (i = 0; i <= 40; i++) { var t = i / 40; pts.push(onVault(-HALF + 0.25 + (W - 0.5) * t, p[0] + (p[1] - p[0]) * t, 0.12)); }
          along(pts, 0.075);
        });
        gold.geo(new T.SphereGeometry(0.26, 14, 10), at(0, HW + RISE - 0.22, zm), GOLD);
        gold.geo(new T.SphereGeometry(0.12, 10, 8), at(0, HW + RISE - 0.44, zm), kit.col(['--chap-ruby', '--chap-sapphire', '--chap-emerald', '--chap-amethyst'][j % 4]));
      }
      // The stars, four-pointed, all over the vault between the ribs.
      function star(c, n, size, colour) {
        var t1 = new T.Vector3(0, 0, 1), t2 = new T.Vector3().crossVectors(n, t1).normalize(), i;
        var tips = [], pts = [];
        for (i = 0; i < 8; i++) {
          var a = i * Math.PI / 4, r = i % 2 ? size * 0.32 : size;
          tips.push(c.clone().add(t1.clone().multiplyScalar(Math.cos(a) * r)).add(t2.clone().multiplyScalar(Math.sin(a) * r)));
        }
        for (i = 0; i < 8; i++) pts.push(c, tips[i], tips[(i + 1) % 8]);
        pts.forEach(function (p) { gold.v(p, [0, 0], colour); });
      }
      for (j = 0; j < 520; j++) {
        var sx = -HALF + 0.5 + rnd() * (W - 1), sz = -0.4 - rnd() * (D - 0.8);
        star(onVault(sx, sz, 0.02), inward(sx), 0.05 + rnd() * 0.08, GOLD);
      }

      // THE PIERS: a stone core against the wall with three shafts on its
      // face, a gold base and a gold capital the ribs spring from.
      piers.forEach(function (z, pj) {
        if (pj === piers.length - 1) return;
        [-1, 1].forEach(function (s) {
          box(0.8, HW, 0.9, at(s * (HALF - 0.4), HW / 2, z), '--chap-stone', 0.02);
          [-0.3, 0, 0.3].forEach(function (dz) {
            kit.cyl(0.13, 0.13, HW - 0.6, at(s * (HALF - 0.82), HW / 2, z + dz), '--chap-stone', 0.015, 12);
          });
          box(1.08, 0.44, 1.2, at(s * (HALF - 0.54), 0.22, z), '--chap-wall', 0.02);
          box(1.12, 0.07, 1.24, at(s * (HALF - 0.56), 0.47, z), '--leaf', false);
          box(1.12, 0.3, 1.24, at(s * (HALF - 0.56), HW - 0.25, z), '--leaf', 0.02);
          box(1.0, 0.12, 1.1, at(s * (HALF - 0.5), HW - 0.46, z), '--leaf', 0.015);
        });
      });

      // ── The glass in the walls, and the light it throws ─────────────────
      // Every bay has its window on both walls. The south wall (on the right)
      // has the day behind it, so its windows throw their pictures across the
      // nave floor: each corner of the glass lands where the light through it
      // falls, which is the window again, stretched and lying down.
      var glassBags = WINDOWS.map(function () { return new Bag(); });
      var poolBags = WINDOWS.map(function () { return new Bag(); });
      var shafts = new Bag(), PALE = kit.col('--chap-pale');
      var DROP_X = 0.9, DROP_Z = 0.16;                // the south light, per metre it falls
      function fall(p) { return V(p.x - DROP_X * p.y, 0.02, p.z + DROP_Z * p.y); }
      function shaft(win, pool, tint, near, far) {
        var c0 = tint.clone().multiplyScalar(near), c1 = tint.clone().multiplyScalar(far);
        [[0, 1], [1, 2], [2, 3], [3, 0]].forEach(function (e) {
          shafts.quad(win[e[0]], win[e[1]], pool[e[1]], pool[e[0]], UV4, [c0, c0, c1, c1]);
        });
      }
      var windowsAt = [];
      for (j = 0; j < BAYS; j++) windowsAt.push(PIER0 - BAY * (j + 0.5));
      windowsAt.push((piers[BAYS] + back) / 2);
      windowsAt.forEach(function (zc, wj) {
        [-1, 1].forEach(function (s) {
          var v = (wj + (s > 0 ? 1 : 0)) % WINDOWS.length;
          var c = V(s * (HALF - 0.03), SILL + WIN_H / 2, zc);
          var win = corners(c, V(0, 0, s), V(0, 1, 0), WIN_W, WIN_H);
          glassBags[v].quad(win[0], win[1], win[2], win[3], UV4, same(PALE));
          box(0.24, 0.08, WIN_W + 0.2, at(s * (HALF - 0.1), SILL - 0.04, zc), '--leaf', 0.01);
          if (s < 0 || zc < piers[BAYS]) return;
          var pool = win.map(fall);
          poolBags[v].quad(pool[0], pool[1], pool[2], pool[3], UV4, same(PALE));
          var tint = PALE.clone().lerp(kit.col(PALS[v].field), 0.45);
          shaft(win, pool, tint, 1, 0.25);
        });
      });
      // Two more windows in the east wall, either side of the chancel, and
      // two in the west wall, high, either side of the door's rose.
      [[-4.7, 1.5, back + 0.03, 1, 1], [4.7, 1.5, back + 0.03, 1, 2], [-4.5, 3.9, -0.03, -1, 0], [4.5, 3.9, -0.03, -1, 0]].forEach(function (e) {
        var c = V(e[0], e[1] + WIN_H / 2, e[2]);
        var win = corners(c, V(e[3], 0, 0), V(0, 1, 0), WIN_W, WIN_H);
        glassBags[e[4]].quad(win[0], win[1], win[2], win[3], UV4, same(PALE));
        box(WIN_W + 0.2, 0.08, 0.24, at(e[0], e[1] - 0.04, e[2] < back + 1 ? back + 0.1 : -0.1), '--leaf', 0.01);
      });

      // THE ROSE WINDOWS: the great one high in the east wall over the
      // chancel, a smaller one over the west door; and the east one's light,
      // thrown down onto the floor in front of the chancel step.
      var RY = 9.8, RS = 5.0, rb = new Bag(), rp = new Bag(), rh = new Bag();
      var east = corners(V(0, RY, back + 0.05), V(1, 0, 0), V(0, 1, 0), RS, RS);
      rb.quad(east[0], east[1], east[2], east[3], UV4, same(PALE));
      var west = corners(V(0, 9.3, -0.05), V(-1, 0, 0), V(0, 1, 0), 3.6, 3.6);
      rb.quad(west[0], west[1], west[2], west[3], UV4, same(PALE));
      var RDROP = 0.7;
      function roseFall(p) { return V(p.x, 0.022, back + RDROP * p.y); }
      var rpool = east.map(roseFall);
      rp.quad(rpool[0], rpool[1], rpool[2], rpool[3], UV4, same(PALE));
      var ring = [], ringPool = [], rr;
      for (rr = 0; rr < 32; rr++) {
        var ra = rr * TAU / 32, rpnt = V(Math.cos(ra) * RS / 2 * 0.97, RY + Math.sin(ra) * RS / 2 * 0.97, back + 0.06);
        ring.push(rpnt); ringPool.push(roseFall(rpnt));
      }
      var roseTint = PALE.clone().lerp(kit.col('--chap-amethyst'), 0.5);
      var rc0 = roseTint.clone().multiplyScalar(0.8), rc1 = roseTint.clone().multiplyScalar(0.2);
      for (rr = 0; rr < 32; rr++) {
        var nx = (rr + 1) % 32;
        shafts.quad(ring[rr], ring[nx], ringPool[nx], ringPool[rr], UV4, [rc0, rc0, rc1, rc1]);
      }
      // A halo round the rose on the stone of the east wall.
      var rhc = corners(V(0, RY, back + 0.02), V(1, 0, 0), V(0, 1, 0), RS * 2.1, RS * 2.1);
      rh.quad(rhc[0], rhc[1], rhc[2], rhc[3], UV4, same(PALE));

      glassBags.forEach(function (b, i) { b.mesh(glassMat(WINDOWS[i])); });
      poolBags.forEach(function (b, i) { b.mesh(lightMat(soft(WINDOWS[i]), 0.42), 2); });
      rb.mesh(glassMat(ROSE));
      rp.mesh(lightMat(soft(ROSE), 0.4), 2);
      rh.mesh(lightMat(halo('--chap-amethyst'), 0.7), 1);
      shafts.mesh(lightMat(null, 0.055), 3);

      // ── The room's furniture ────────────────────────────────────────────
      // AN ARCH: two gold posts set with stones, a pointed head with a gold
      // ball at its point, and a plinth at its foot, free-standing, the floor
      // showing all round it.
      var STONES = ['--chap-ruby', '--chap-sapphire', '--chap-emerald', '--chap-amethyst'].map(kit.col);
      function arch(m, w, h, rise2, plinth, stones) {
        box(w + 0.5, plinth, 0.9, M(m, at(0, plinth / 2, 0)), '--niche', 0.02);
        box(w + 0.5, 0.04, 0.9, M(m, at(0, plinth + 0.02, 0)), '--leaf', false);
        [-1, 1].forEach(function (s) { box(0.16, h, 0.24, M(m, at(s * w / 2, plinth + h / 2, 0)), '--leaf', 0.02); });
        var arm = Math.hypot(w / 2, rise2);
        [-1, 1].forEach(function (s) {
          box(arm + 0.12, 0.16, 0.24, M(m, at(s * w / 4, plinth + h + rise2 / 2, 0, 0, 0, -s * Math.atan2(rise2, w / 2))), '--leaf', 0.02);
        });
        kit.piece(new T.SphereGeometry(0.12, 12, 8), M(m, at(0, plinth + h + rise2 + 0.14, 0)), '--leaf', 0.015);
        if (!stones) return;
        [-1, 1].forEach(function (s) {
          for (var q = 0; q < stones; q++) {
            gold.geo(new T.OctahedronGeometry(0.045), M(m, at(s * w / 2, plinth + 0.35 + q * (h - 0.5) / (stones - 1), 0.125)), STONES[(q + (s > 0 ? 2 : 0)) % 4]);
          }
        });
      }

      var frame = null, stops = [];
      stops.push({ name: 'just inside the west door, the nave ahead and the rose window at the end of it', x: 0, z: -1.4, yaw: 0 });

      // THE ROOM'S OWN PAGE on the west wall, left of the door, facing in.
      var pw = 3.0, ph = pw * 800 / 1180, py = 1.0 + ph / 2;
      box(pw + 0.24, ph + 0.24, 0.08, at(-4.4, py, 0.0), '--leaf');
      frame = kit.screen(1180, 800, pw, at(-4.4, py, -0.05, Math.PI), 'The Chappell’s own page, on the west wall beside the door');
      stops.push({ name: 'at the west wall, with the Chappell’s own page on it', x: -4.4, z: -3.4, yaw: Math.PI, page: kit.page, frame: frame });

      // The nameplate over the door inside, and the room's own words beside
      // the page, facing down the nave.
      var plate = kit.lift(frame, '.nameplate', { bare: true, w: 360, ww: 1.4, m: at(0, 3.25, -0.05, Math.PI) });
      var lede = kit.lift(frame, '.lede', { w: 560, ww: 1.9, m: at(4.4, 1.3, -0.05, Math.PI) });
      stops.push({ name: 'at the west wall, with what the Chappell is beside the door', x: 4.4, z: -2.9, yaw: Math.PI, frame: lede.el });

      // THE VOTIVE RAIL by the door on the right, in the first bay: three
      // steps of candles in their glass under gold edges, lit and still, the
      // room's consent banner over them.
      var VZ = -2.2, VL = 2.1, VX = HALF - 0.45;
      [0, 1, 2].forEach(function (t) {
        var dep = 0.7 - t * 0.2, hi = 0.58 + t * 0.22, fx = HALF - 0.8 + t * 0.2;
        box(dep, hi, VL, at(fx + dep / 2, hi / 2, VZ), '--niche', 0.02);
        box(dep + 0.03, 0.04, VL + 0.03, at(fx + dep / 2, hi + 0.02, VZ), '--leaf', false);
        for (var q = 0; q < 7; q++) {
          var jz = VZ - VL / 2 + 0.18 + q * (VL - 0.36) / 6;
          gold.geo(new T.CylinderGeometry(0.06, 0.055, 0.13, 10), at(fx + 0.1, hi + 0.105, jz), STONES[(q + t) % 4]);
          gold.geo(new T.ConeGeometry(0.022, 0.07, 6), at(fx + 0.1, hi + 0.21, jz), GOLD);
        }
      });
      var votiveLight = new T.PointLight(kit.col('--leaf'), 4, 7, 1.5);
      votiveLight.position.set(VX - 0.6, 1.4, VZ);
      kit.scene.add(votiveLight);
      var vh = new Bag(), vhc = corners(V(VX - 1.0, 0.025, VZ), V(0, 0, 1), V(1, 0, 0), 3.2, 2.6);
      vh.quad(vhc[0], vhc[1], vhc[2], vhc[3], UV4, same(PALE));
      vh.mesh(lightMat(halo('--leaf'), 0.4), 1);
      var votive = kit.lift(frame, '.votive', { w: 620, ww: 2.2, m: at(HALF - 0.04, 1.6, VZ, RIGHT) });
      stops.push({ name: 'at the votive rail, the candles lit and the room’s promise over them', x: VX - 2.6, z: VZ, yaw: RIGHT, frame: votive.el });

      // THE THIRTEEN ARCHES, in the page's order: seven down the left, six
      // down the right, one to a bay, each facing the aisle.
      var AW = 1.72, AH = 1.98, AR = 0.75, PL = 0.3;
      for (var n = 0; n < 13; n++) {
        var left = n < 7, k = left ? n : n - 7;
        var z = PIER0 - BAY * (k + 2.5);
        var x = left ? -HALF + 1.6 : HALF - 1.6;
        var g = at(x, 0, z, left ? LEFT : RIGHT);
        arch(g, AW, AH, AR, PL, 5);
        var it = kit.lift(frame, '.niche', { n: n, w: 360, ww: 1.85, m: M(g, at(0, PL + 0.02, 0.02)) });
        stops.push({ name: 'at the ' + ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'][k] + ' arch down the ' + (left ? 'left' : 'right'),
          x: left ? x + 2.7 : x - 2.7, z: z, yaw: left ? LEFT : RIGHT, pitch: -0.08, frame: it.el });
      }

      // THE CHANCEL at the east end: up two steps, an arch of three orders,
      // and the whole playlist in it, alone; the rose window over it.
      var CZ = back + 1.4, CW = 4.4, CS = 0.45, STEP_W = W - 2.6;
      box(STEP_W + 0.6, 0.22, 4.6, at(0, 0.11, back + 2.3), '--chap-stone', 0.02);
      box(STEP_W, 0.23, 4.0, at(0, 0.335, back + 2.0), '--chap-stone', 0.02);
      box(STEP_W + 0.62, 0.04, 0.1, at(0, 0.22, back + 4.56), '--leaf', false);
      box(STEP_W + 0.02, 0.04, 0.1, at(0, CS, back + 3.96), '--leaf', false);
      arch(at(0, CS - 0.3, CZ - 0.5), CW + 2.0, 4.85, 1.75, 0.3, 0);
      arch(at(0, CS - 0.3, CZ - 0.25), CW + 1.1, 4.65, 1.45, 0.3, 7);
      arch(at(0, CS - 0.3, CZ), CW + 0.3, 4.45, 1.2, 0.3, 0);
      var chancel = kit.lift(frame, '.chancel', { w: 880, ww: CW + 0.8, m: at(0, CS + 0.02, CZ + 0.02) });
      var step = new T.PointLight(kit.col('--leaf'), 5, 8, 1.5);
      step.position.set(0, 1.4, back + 6.0);
      kit.scene.add(step);
      stops.push({ name: 'at the chancel, the whole playlist in the one deep arch at the east end', x: 0, z: back + 9.6, yaw: 0, pitch: 0.12, frame: chancel.el });
      stops.push({ name: 'under the rose window, its light lying on the floor before the chancel step', x: 0, z: back + 15, yaw: 0, pitch: 0.2 });

      // THE ROOM RULE, in the last bay on the right before the chancel.
      var gloria = kit.lift(frame, '.gloria', { w: 620, ww: 2.2, m: at(HALF - 0.04, 1.0, PIER0 - BAY * 8.5, RIGHT) });
      stops.push({ name: 'at the room’s rule, in the last bay on the right before the chancel', x: HALF - 2.9, z: PIER0 - BAY * 8.5, yaw: RIGHT, frame: gloria.el });

      stops.push({ name: 'in the middle of the nave, in the light the south windows throw across the floor', x: 1.2, z: -14.5, yaw: 0.35, pitch: -0.12 });
      stops.push({ name: 'under the vault, looking up at its gold ribs and stars', x: 0, z: -18, yaw: 0, pitch: 0.75 });
      stops.push({ name: 'looking back down the nave at the west door, the nameplate over it and the west rose above', x: 0, z: -12, yaw: Math.PI, pitch: 0.3, frame: plate.el });

      gold.mesh(shine);

      return {
        start: { x: 0, z: -1.4, yaw: 0 },
        bounds: { x: [-HALF + 2.8, HALF - 2.8], z: [back + 5.0, -0.8] },
        stops: stops
      };
    }
  };
})();
