/* =============================================================================
   The Dopamine Dress-Up Den, walked into on Cel Street. Ryan's ask,
   2026-10-31: back on the street, working down it a room at a time.

   IT IS THE DRESS-UP DEN'S WORLD AND NOBODY ELSE'S (§52): a boutique with a
   lavender wall, rails of clothes round it, and a wooden valet stand in the
   middle of the floor. THE LIGHT IS SUN TAKEN APART BY A CRYSTAL: it comes in
   at the front window, behind you as you walk in, mostly white, which is what
   lets every cloth on the rails look like itself; the rest the crystal hanging
   in the window throws on the walls as small rainbows, each one flat where it
   lands, never pooled and never an even wash. The wall stays cool lavender; if
   it ever warms towards pink it has become Covenstead with a clothes rail.

   NOBODY'S BODY IS DRAWN HERE. No figure, no mannequin, no skin, no size: the
   clothes hang on the rails and on the valet stand, which is a knob, two bars
   and a base, and whoever wears them is you.

   THE STAND, ITS READOUT AND THE RAILS ARE THE PAGE'S OWN, lifted off it by
   the kit, and dressup.js, which the page loads, is run against them, so
   picking from the rails dresses the stand here as it does there; it keeps
   and sends nothing. The looks off the peg put themselves on the stand too.
   try-on.js and strip.js are not run here: one keeps and the other fetches,
   and both stay on the page, which hangs on the back wall. The curtain at the
   back is the way through to Fantasy Fancy Dress.

   NOTHING MOVES: the crystal does not turn and the rainbows stay where they
   land. Every colour is one the room declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Cel Street's
   screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 31, 374761393) ^ Math.imul(j + 7, 668265263) ^ Math.imul(k + 13, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['dopamine-dress-up-den.html'] = {
    name: 'The Dopamine Dress-Up Den',
    faces: ['DynaPuff'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 9, D = 11, H = 3.2, back = -D;
      var L = -W / 2, R = W / 2;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var WIN = { x0: -3.3, x1: -1.1, y0: 0.9, y1: 2.6 };
      var CLOTH = ['--dd-f-tomato', '--dd-f-marigold', '--dd-f-lime', '--dd-f-turquoise', '--dd-f-indigo', '--dd-f-violet',
                   '--dd-f-teal', '--dd-f-cream', '--dd-f-hotpink', '--dd-f-gold', '--dd-f-sky', '--dd-f-plum', '--dd-f-mint',
                   '--dd-f-coral', '--dd-f-moss', '--dd-f-rust', '--dd-f-denim', '--dd-f-silver', '--dd-f-pumpkin'];
      var SPECTRUM = ['--dd-sp-1', '--dd-sp-2', '--dd-sp-3', '--dd-sp-4', '--dd-sp-5', '--dd-sp-6'];

      // THE LIGHT: the sun in at the front window, mostly white, and the shop
      // lit evenly by it off the pale floor and the lavender walls.
      kit.scene.background = kit.col('--dd-wall');
      kit.scene.add(new T.HemisphereLight(kit.col('--dd-panel'), kit.col('--dd-wall'), 1.9));
      var sun = new T.DirectionalLight(kit.col('--dd-glass'), 1.3);
      sun.position.set((WIN.x0 + WIN.x1) / 2, 5, 7);
      sun.target.position.set(0, 0, -6);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -8; sun.shadow.camera.right = 8; sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
      sun.shadow.camera.far = 30;
      kit.scene.add(sun, sun.target);

      // THE SHOP: a pale floor, lavender walls, a pale ceiling.
      box(W + 0.4, 0.1, D + 0.4, at(0, -0.05, back / 2), '--dd-panel', false, false);
      for (var b = 0; b < 18; b++) box(0.012, 0.004, D, at(L + 0.25 + b * 0.5, 0.002, back / 2), '--dd-wall', false, false);
      box(W + 0.4, 0.14, D + 0.4, at(0, H + 0.07, back / 2), '--dd-panel', false, false);
      box(0.3, H, D, at(L - 0.15, H / 2, back / 2), '--dd-wall', 0.015);
      box(0.3, H, D, at(R + 0.15, H / 2, back / 2), '--dd-wall', 0.015);
      // A wall with a hole in it, extruded.
      function holed(w, h, holes, m) {
        var s = new T.Shape();
        s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.closePath();
        holes.forEach(function (o) {
          var p = new T.Path();
          p.moveTo(o[0], o[2]); p.lineTo(o[1], o[2]); p.lineTo(o[1], o[3]); p.lineTo(o[0], o[3]); p.closePath();
          s.holes.push(p);
        });
        var g = new T.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: false });
        g.translate(0, 0, -0.3);
        kit.piece(g, m, '--dd-wall', 0.015);
      }
      // THE FRONT WALL, behind you: the door you came in by, shut, and the
      // window the sun comes in at, with the crystal hanging in it.
      holed(W + 0.6, H, [[WIN.x0, WIN.x1, WIN.y0, WIN.y1]], at(0, 0, 0.3));
      box(0.96, 2.1, 0.06, at(2.6, 1.05, -0.03), '--dd-wood', 0.015);
      cyl(0.035, 0.035, 0.06, at(2.28, 1.0, -0.08, 0, Math.PI / 2), '--dd-ink', false, 10);
      var wx = (WIN.x0 + WIN.x1) / 2, wl = WIN.x1 - WIN.x0, wy = (WIN.y0 + WIN.y1) / 2, wh = WIN.y1 - WIN.y0;
      box(wl + 0.14, 0.07, 0.12, at(wx, WIN.y1 + 0.035, 0.0), '--dd-panel', 0.012);
      box(wl + 0.2, 0.07, 0.22, at(wx, WIN.y0 - 0.035, -0.05), '--dd-panel', 0.012);
      [WIN.x0 - 0.035, WIN.x1 + 0.035, wx].forEach(function (x) { box(0.07, wh, 0.12, at(x, wy, 0.0), '--dd-panel', 0.012); });
      box(wl, 0.05, 0.08, at(wx, wy, 0.0), '--dd-panel', 0.01);
      // Outside the window: the bright day, and nothing in it to look at.
      kit.flat(new T.PlaneGeometry(wl + 0.6, wh + 0.6), at(wx, wy, 0.55, Math.PI), '--dd-glass');
      // The crystal on its thread, hanging in the window. It does not turn.
      kit.flat(new T.CylinderGeometry(0.004, 0.004, 0.5, 4), at(wx, WIN.y1 - 0.25, -0.12), '--dd-ink');
      kit.facets(new T.OctahedronGeometry(0.1, 0), at(wx, WIN.y1 - 0.58, -0.12, 0.4), '--dd-glass');

      // THE RAINBOWS the crystal throws, each one flat on the wall where it
      // lands, red to violet in the order a prism puts them in. Small, and
      // never pooled; they do not move.
      function rainbow(m, len, tall) {
        SPECTRUM.forEach(function (ink, i) {
          kit.flat(new T.PlaneGeometry(len / 6 + 0.002, tall), M(m, at(-len / 2 + (i + 0.5) * len / 6, 0, 0)), ink);
        });
      }
      [[-2.9, 2.55, 0.3], [1.1, 2.75, -0.15], [3.4, 1.95, 0.2], [-0.4, 2.85, 0.5]].forEach(function (p) {
        rainbow(at(p[0], p[1], back + 0.012, 0, 0, p[2]), 0.36, 0.08);
      });
      [[-8.8, 2.7, -0.3], [-3.9, 2.85, 0.2], [-7.4, 1.0, 0.1]].forEach(function (p) {
        rainbow(at(R - 0.012, p[1], p[0], RIGHT, 0, p[2]), 0.32, 0.07);
      });
      [[-9.9, 2.75, 0.25], [-4.0, 2.95, -0.2]].forEach(function (p) {
        rainbow(at(L + 0.012, p[1], p[0], LEFT, 0, p[2]), 0.3, 0.07);
      });
      rainbow(at(-1.6, 0.004, -3.0, 0.5, -Math.PI / 2), 0.4, 0.09);

      // A SIGN over the back wall, lettered in the room's own puffed face.
      function sign(words, ground, ink, w, h) {
        return kit.paper(Math.round(w * 220), Math.round(h * 220), function (c, cw, ch) {
          c.fillStyle = kit.ink(ground); c.fillRect(0, 0, cw, ch);
          c.strokeStyle = kit.ink(ink); c.lineWidth = 6; c.strokeRect(3, 3, cw - 6, ch - 6);
          c.fillStyle = kit.ink(ink);
          c.textAlign = 'center'; c.textBaseline = 'middle';
          var size = Math.min(ch * 0.62, 90);
          c.font = '600 ' + size + "px 'DynaPuff'";
          while (size > 8 && c.measureText(words).width > cw * 0.9) { size -= 2; c.font = '600 ' + size + "px 'DynaPuff'"; }
          c.fillText(words, cw / 2, ch / 2 + size * 0.04);
        });
      }
      kit.sheet(sign('Dopamine Dress-Up Den', '--dd-panel', '--dd-ink', 3.6, 0.42), 3.6, 0.42, at(-1.2, H - 0.36, back + 0.02));

      // THE SHOP'S OWN PAGE, on the back wall to the left of the curtain.
      var pw = 2.7, ph = pw * 800 / 1180, py = 0.55 + ph / 2;
      var pg = at(-1.65, 0, back + 0.02);
      box(pw + 0.16, ph + 0.16, 0.06, M(pg, at(0, py, 0)), '--dd-wood', 0.012);
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.04)), 'The Dopamine Dress-Up Den’s own page, on the back wall');

      // CLOTHES RAILS round the walls: a bar on two uprights, and the clothes
      // on their hangers along it, every colour the shop has. One run on every
      // rail is all black, because every rail comes in all black.
      function rail(m, len, seed) {
        [-len / 2, len / 2].forEach(function (x) { cyl(0.025, 0.025, 1.6, M(m, at(x, 0.8, 0)), '--dd-ink', false, 8); });
        cyl(0.02, 0.02, len, M(m, at(0, 1.58, 0, 0, 0, Math.PI / 2)), '--dd-ink', false, 8);
        var n = Math.floor(len / 0.13);
        for (var i = 0; i < n; i++) {
          var x = -len / 2 + 0.1 + i * (len - 0.2) / (n - 1);
          var black = i >= n - 4;
          var ink = black ? (i % 2 ? '--dd-f-black' : '--dd-f-coal') : CLOTH[Math.floor(hash(seed, i, 1) * CLOTH.length)];
          var long = 0.62 + hash(seed, i, 2) * 0.4;
          // the hanger's hook and shoulders, then the cloth hanging from them,
          // edge on to you along the bar as clothes hang on a rail.
          box(0.012, 0.06, 0.012, M(m, at(x, 1.54, 0)), '--dd-ink', false, false);
          box(0.03, 0.03, 0.42, M(m, at(x, 1.5, 0)), '--dd-wood', false, false);
          box(0.035, long, 0.44, M(m, at(x, 1.49 - long / 2, 0)), ink, 0.008);
        }
      }
      rail(at(L + 0.42, 0, -2.5, LEFT), 2.4, 1);
      rail(at(R - 0.42, 0, -4.15, RIGHT), 1.4, 2);
      rail(at(R - 0.42, 0, -7.85, RIGHT), 1.3, 3);
      rail(at(L + 0.42, 0, -7.65, LEFT), 1.5, 4);
      // A round rail standing on its own near the back, the clothes on it
      // turned out like the spokes of a wheel.
      var rr = { x: -2.6, z: -8.6, r: 0.62 };
      cyl(0.03, 0.03, 1.6, at(rr.x, 0.8, rr.z), '--dd-ink', false, 8);
      cyl(0.32, 0.36, 0.05, at(rr.x, 0.025, rr.z), '--dd-ink', false, 18);
      kit.piece(new T.TorusGeometry(rr.r, 0.018, 6, 36), at(rr.x, 1.58, rr.z, 0, Math.PI / 2), '--dd-ink', false);
      for (var k = 0; k < 16; k++) {
        var a = k / 16 * Math.PI * 2, ink = CLOTH[(k * 7) % CLOTH.length];
        var long = 0.7 + hash(5, k, 2) * 0.3;
        var hm = at(rr.x + Math.cos(a) * rr.r, 0, rr.z + Math.sin(a) * rr.r, -a);
        box(0.035, long, 0.42, M(hm, at(0, 1.49 - long / 2, 0)), ink, 0.008);
      }

      // THE VALET STAND in the middle of the floor, the page's own drawing of
      // it lifted whole, standing bare on a round rug: dressup.js, run below,
      // dresses it from the rails. The crystal and its flecks are the page's
      // wall's and stay on the page.
      var SX = 0, SZ = -5.2;
      cyl(0.82, 0.82, 0.012, at(SX, 0.006, SZ), '--dd-f-violet', false, 32);
      var stand = kit.lift(frame, '.dd-fitting__stand', {
        bare: true, w: 420, ww: 1.15, m: at(SX, 0.02, SZ),
        drop: '.dd-flecks, .dd-crystal, .dd-readout, .dd-window, .dd-start, .dd-do, .dd-who, noscript, .dd-body'
      });
      // Beside it, on a pale board on its own little stand, the words saying
      // what is on the stand, and the copy slip, surprise and take it all off.
      var BX = 1.55, BZ = -5.05, BY = 0.42;
      [-0.48, 0.48].forEach(function (x) { box(0.05, 1.5, 0.05, at(BX + x, 0.75, BZ - 0.06), '--dd-wood', 0.01); });
      var said = kit.lift(frame, '.dd-readout', { w: 420, ww: 0.95, m: at(BX, 1.02, BZ) });
      var doing = kit.lift(frame, '.dd-do', { w: 420, ww: 0.95, m: at(BX, BY, BZ), drop: '.dd-who' });

      // THE PAGE'S OWN RAILS on the left-hand wall, every slot with its prints
      // and colours, scrolling: picking from them dresses the stand.
      var rails = kit.lift(frame, '.dd-rails', { w: 760, h: 760, ww: 2.6, m: at(L + 0.05, 0.3, -5.5, LEFT) });
      // The cuts and prints the stand is drawn from: the page keeps them in a
      // template, and it comes along too, unseen.
      kit.lift(frame, '.dd-part', { n: 0, bare: true, w: 10, ww: 0.01, m: at(0, 0.01, back + 0.2), drop: 'h2, .dd-fitting' });

      // ON THE RIGHT-HAND WALL: the looks off the peg, each one putting itself
      // on the stand; a look of your own, and whose these are.
      var looks = kit.lift(frame, '.dd-looks', { w: 760, h: 760, ww: 2.2, m: at(R - 0.05, 0.45, -6.0, RIGHT) });
      var own = kit.lift(frame, '.dd-part', { n: 3, w: 700, h: 700, ww: 1.6, m: at(R - 0.05, 0.6, -2.0, RIGHT) });
      var whose = kit.lift(frame, '.dd-part', { n: 5, w: 700, h: 700, ww: 1.5, m: at(R - 0.05, 0.6, -9.7, RIGHT) });
      // ON THE LEFT-HAND WALL by the back: the house rules.
      var rules = kit.lift(frame, '.dd-part', { n: 4, w: 700, h: 700, ww: 1.5, m: at(L + 0.05, 0.6, -9.7, LEFT) });

      // THE BACK WALL: the curtained doorway through to Fantasy Fancy Dress on
      // the right, and the shop's own page on the left.
      var DX = 2.65, DW = 1.3, DH = 2.3;
      holed(W + 0.6, H, [[DX - DW / 2, DX + DW / 2, 0, DH]], at(0, 0, back));
      box(DW + 0.2, 0.12, 0.14, at(DX, DH + 0.06, back + 0.02), '--dd-wood', 0.012);
      [DX - DW / 2 - 0.05, DX + DW / 2 + 0.05].forEach(function (x) { box(0.1, DH, 0.14, at(x, DH / 2, back + 0.02), '--dd-wood', 0.012); });
      cyl(0.02, 0.02, DW, at(DX, DH - 0.06, back - 0.02, 0, 0, Math.PI / 2), '--dd-ink', false, 8);
      // The curtain, in folds of plum and violet, drawn back a little at the
      // middle so the way through shows.
      for (var f = 0; f < 12; f++) {
        var fx = DX - DW / 2 + 0.05 + f * (DW - 0.1) / 11;
        if (Math.abs(fx - DX) < 0.12) continue;
        box((DW - 0.1) / 11 + 0.01, DH - 0.1, 0.05, at(fx, (DH - 0.1) / 2, back - 0.04 - (f % 2) * 0.04), f % 2 ? '--dd-f-violet' : '--dd-f-plum', 0.006);
      }
      box(0.24, DH - 0.1, 0.02, at(DX, (DH - 0.1) / 2, back - 0.35), '--dd-ink', false, false);
      var through = kit.lift(frame, '.dd-fancy__door', { bare: true, w: 240, ww: 1.1, m: at(DX - DW / 2 - 0.95, 1.5, back + 0.04), drop: '.dd-curtain' });
      kit.lift(frame, '.dd-fancy__words', { w: 520, ww: 1.1, m: at(DX - DW / 2 - 0.95, 0.35, back + 0.04) });

      // The page's own script, run against the stand, the readout and the
      // rails lifted above: it keeps nothing and sends nothing.
      kit.wire(frame, 'dressup.js');

      return {
        start: { x: 0, z: -0.8, yaw: 0 },
        bounds: { x: [L + 0.9, R - 0.9], z: [back + 1.0, -0.5] },
        stops: [
          { name: 'just inside the door, the sun at your back and the rails all round', x: 0, z: -0.8, yaw: 0 },
          { name: 'at the window, with the crystal hanging in the sun', x: wx + 0.4, z: -1.7, yaw: Math.PI, pitch: 0.2 },
          { name: 'at the valet stand, a knob, two bars and a base, and nobody', x: SX, z: SZ + 2.4, yaw: 0, pitch: -0.1, frame: stand.el },
          { name: 'at the board beside the stand, saying what is on it', x: BX, z: BZ + 1.4, yaw: 0, pitch: -0.12, frame: doing.el },
          { name: 'at the rails on the left-hand wall, to pick what goes on the stand', x: L + 2.5, z: -5.5, yaw: LEFT, frame: rails.el },
          { name: 'at the rail by the door, every colour and one run all black', x: L + 1.8, z: -2.5, yaw: LEFT, pitch: -0.05 },
          { name: 'at the round rail near the back, the clothes on it like spokes', x: rr.x + 2.1, z: rr.z + 2.0, yaw: Math.atan2(2.1, 2.0), pitch: -0.08 },
          { name: 'at the looks off the peg, each one putting itself on the stand', x: R - 2.3, z: -6.0, yaw: RIGHT, frame: looks.el },
          { name: 'at a look of your own, sent in words', x: R - 2.0, z: -2.0, yaw: RIGHT, pitch: -0.12, frame: own.el },
          { name: 'at the house rules, on the left-hand wall by the back', x: L + 2.0, z: -9.7, yaw: LEFT, pitch: -0.12, frame: rules.el },
          { name: 'at the word on whose this is, on the right-hand wall by the back', x: R - 2.0, z: -9.7, yaw: RIGHT, pitch: -0.12, frame: whose.el },
          { name: 'at the back wall, with the shop’s own page on it', x: -1.65, z: back + 3.2, yaw: 0, page: kit.page, frame: frame },
          { name: 'Fantasy Fancy Dress', where: 'at the curtain at the back, the way through to Fantasy Fancy Dress', page: 'fantasy-fancy-dress.html', x: DX - 0.4, z: back + 2.4, yaw: 0.1, frame: through.el }
        ]
      };
    }
  };
})();
