/* =============================================================================
   The World room, walked into on Cel Street, past the garden spider's web in
   the Garden. Ryan's ask, 2026-11-01: the rooms past the street's gates.

   IT IS THE ROOM'S OWN WORLD AND SHARES NOTHING WITH THE GARDEN (§119). The
   Garden is midday, light coming down through leaves onto beds in the ground,
   every shadow under its thing. This is before the sun is up: the spider's
   web strung in the air between every room on the street, each room a garden
   hanging on it, and NO GROUND anywhere. The dawn comes in level from the
   left, so it lights the silk along its length on that side (--www-glint,
   with the dew it reaches in --www-bead) and has not reached the right
   (--www-thread). Nothing is overhead and nothing stands on anything: the
   gardens hang from their threads, and so do the words.

   THE GARDENS ARE THE PAGE'S. One for each part of the Map, as the page
   strings them, and each one's words are lifted whole onto it; the page says
   who is where only to the CB, through world.js, which is not lifted or wired
   here, so nothing in this room says who is anywhere, and nothing is counted.

   THE SPIDER IS THE GARDEN'S, at the hub, in this room's inks, and says
   nothing in here. NOTHING MOVES at any setting.

   Every colour is one §119 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['world.html'] = {
    name: 'World',
    from: 'the-garden.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at;
      var RIGHT = -Math.PI / 2, LEFT = Math.PI / 2;
      function rnd(n) { var x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }

      // THE LIGHT IS THE DAWN, level from the left, warm on the cool dark; a
      // little of the dark's own light everywhere so nothing is lost in it.
      kit.scene.background = kit.col('--www-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--www-dim'), kit.col('--www-sky'), 1.2));
      var dawn = new T.DirectionalLight(kit.col('--www-dawn'), 2.2);
      dawn.position.set(-60, 2, 4);
      dawn.target.position.set(0, 3, -6);
      kit.scene.add(dawn, dawn.target);

      // A strand of silk from a to b: lit where the dawn has reached it (the
      // left of the room), still dark where it has not.
      var UP = new T.Vector3(0, 1, 0);
      function lit(x) { return x < -0.3; }
      function strand(a, b, ink, r) {
        var d = new T.Vector3().subVectors(b, a), len = d.length();
        var q = new T.Quaternion().setFromUnitVectors(UP, d.clone().normalize());
        var m = new T.Matrix4().compose(new T.Vector3().addVectors(a, b).multiplyScalar(0.5), q, new T.Vector3(1, 1, 1));
        kit.piece(new T.CylinderGeometry(r || 0.012, r || 0.012, len, 4), m, ink || (lit((a.x + b.x) / 2) ? '--www-glint' : '--www-thread'), false, false);
      }
      function bead(v, s) {
        var g = new T.SphereGeometry(s || 0.05, 8, 6);
        kit.piece(g, at(v.x, v.y, v.z), '--www-bead', false, false);
      }
      function V(x, y, z) { return new T.Vector3(x, y, z); }

      // THE WEB, strung across the far end of the room: its spokes out from the
      // hub, and the spiral laid round them a turn at a time.
      var HX = 0, HY = 5.4, HZ = -14, R = 8, SPOKES = 18;
      var ends = [];
      for (var s = 0; s < SPOKES; s++) {
        var a = s * Math.PI * 2 / SPOKES + 0.09;
        var reach = R * (0.86 + rnd(s + 40) * 0.14);
        var end = V(HX + Math.sin(a) * reach, HY + Math.cos(a) * reach, HZ);
        ends.push({ a: a, reach: reach });
        strand(V(HX, HY, HZ), end, null, 0.016);
      }
      for (var ring = 0, rad = 1.0; rad < R * 0.84; rad += 0.48, ring++) {
        for (s = 0; s < SPOKES; s++) {
          var a0 = ends[s].a, a1 = ends[(s + 1) % SPOKES].a + (s + 1 === SPOKES ? Math.PI * 2 : 0);
          var r0 = Math.min(rad + s * 0.48 / SPOKES, ends[s].reach - 0.2), r1 = Math.min(rad + (s + 1) * 0.48 / SPOKES, ends[(s + 1) % SPOKES].reach - 0.2);
          var p0 = V(HX + Math.sin(a0) * r0, HY + Math.cos(a0) * r0, HZ), p1 = V(HX + Math.sin(a1) * r1, HY + Math.cos(a1) * r1, HZ);
          strand(p0, p1, null, 0.009);
          // The dew the dawn has reached, now and then, on the lit side.
          if (lit(p0.x) && rnd(ring * 31 + s) < 0.32) bead(p0, 0.035 + rnd(ring * 7 + s) * 0.03);
        }
      }
      // The frame threads the web hangs from, out to the edges of the dark.
      [[-14, 15], [14, 15], [-15, -3], [15, -4]].forEach(function (f) {
        var i = 0, best = 1e9;
        ends.forEach(function (e, k) {
          var d = Math.hypot(HX + Math.sin(e.a) * e.reach - f[0], HY + Math.cos(e.a) * e.reach - f[1]);
          if (d < best) { best = d; i = k; }
        });
        strand(V(HX + Math.sin(ends[i].a) * ends[i].reach, HY + Math.cos(ends[i].a) * ends[i].reach, HZ), V(f[0], f[1], HZ - 4), null, 0.014);
      });

      // THE SPIDER, the Garden's own, at the hub in this room's inks; it says
      // nothing in here.
      function blob(x, y, z, sx, sy, sz, ink) {
        var g = new T.SphereGeometry(1, 14, 10); g.scale(sx, sy, sz);
        kit.piece(g, at(x, y, z), ink, 0.01);
      }
      blob(HX, HY - 0.2, HZ + 0.05, 0.3, 0.4, 0.2, '--www-body');
      blob(HX, HY + 0.28, HZ + 0.05, 0.16, 0.16, 0.13, '--www-body');
      [-1, 1].forEach(function (side) {
        for (var l = 0; l < 4; l++) {
          var y0 = HY + 0.3 - l * 0.08, ang = 0.7 - l * 0.45;
          var knee = V(HX + side * 0.55, y0 + Math.cos(ang) * 0.42, HZ + 0.06);
          strand(V(HX + side * 0.1, y0, HZ + 0.06), knee, '--www-body', 0.025);
          strand(knee, V(HX + side * (0.75 + l * 0.06), y0 + Math.cos(ang) * 0.42 - 0.75 + l * 0.12, HZ + 0.06), '--www-body', 0.02);
        }
      });

      // THE GARDENS, one for each part of the Map, hanging in the air down
      // both sides of the room on their own threads: a bed of moss with a rim,
      // nothing under it, and a thread from it out to the web.
      function garden(x, z, side) {
        var g = new T.CylinderGeometry(1.6, 1.45, 0.24, 24);
        kit.piece(g, at(x, -0.12, z), '--www-rim', 0.012);
        kit.piece(new T.CylinderGeometry(1.5, 1.5, 0.04, 24), at(x, 0.01, z), '--www-moss', false);
        for (var t = 0; t < 7; t++) {
          var aa = rnd(x * 3 + z * 7 + t) * Math.PI * 2, rr = 0.9 + rnd(x + z + t * 11) * 0.45;
          blob(x + Math.sin(aa) * rr, 0.12, z + Math.cos(aa) * rr, 0.22, 0.12, 0.2, '--www-moss');
        }
        // Hung from above, four threads to the bed's rim.
        [0.6, 2.2, 3.8, 5.4].forEach(function (aa) {
          strand(V(x + Math.sin(aa) * 1.5, 0.0, z + Math.cos(aa) * 1.5), V(x, 9.5, z), null, 0.008);
        });
        // And out to the web.
        var e = ends[side < 0 ? 13 : 5];
        strand(V(x, 0.02, z), V(HX + Math.sin(e.a) * e.reach * 0.7, HY + Math.cos(e.a) * e.reach * 0.7, HZ), null, 0.01);
        if (side < 0) for (var b = 0; b < 5; b++) bead(V(x + 1.4 - b * 0.1, 0.05 + b * 0.02, z + (rnd(b + z) - 0.5) * 1.6), 0.04);
      }
      // A word hung on silk: a thread straight up from where it hangs.
      function hung(x, y, z) { strand(V(x, y, z - 0.03), V(x, 10, z - 0.03), null, 0.008); }

      function spot(x, z, ry) { return { x: x, z: z, ry: ry }; }
      function front(name, sp, dd, pitch, more) {
        var o = { name: name, x: sp.x + Math.sin(sp.ry) * dd, z: sp.z + Math.cos(sp.ry) * dd, yaw: sp.ry, pitch: pitch || 0.05 };
        for (var key in more) o[key] = more[key];
        return o;
      }

      // THE ROOM'S OWN PAGE, hung by the way in from the Garden, facing in.
      var PG = spot(-2.2, 10.6, Math.PI), pgw = 2.4, pgh = pgw * 800 / 1180, pgy = 0.6 + pgh / 2;
      hung(PG.x, pgy + pgh / 2, PG.z + 0.04);
      var page = kit.screen(1180, 800, pgw, at(PG.x, pgy, PG.z, PG.ry), 'The World room’s own page, hung by the way in from the Garden');

      // THE ROOM'S OWN WORDS, hung near the way in, edge-on as you arrive.
      var L0 = spot(-2.0, 7.6, LEFT), L1 = spot(2.0, 7.6, RIGHT);
      hung(L0.x, 0.5, L0.z); hung(L1.x, 0.5, L1.z);
      var lede0 = kit.lift(page, '.www-lede', { n: 0, w: 700, ww: 1.7, m: at(L0.x, 0.5, L0.z, L0.ry) });
      var lede1 = kit.lift(page, '.www-lede', { n: 1, w: 700, ww: 1.7, m: at(L1.x, 0.5, L1.z, L1.ry) });

      // THE GARDENS, each with its part of the Map's words standing on it.
      // cel:parts:begin
      var PARTS = ["On the street, and behind its doors", "Past the treeline: the campgrounds", "Through the wood: Nature’s Contribution", "Past the last streetlight: the Outskirts", "Down the lift: Arlesglad Caverns", "Paperwork, pinned to the edge of the Map"];
      // cel:parts:end
      // The Map's parts as the page's directory has them, written by
      // tools/make-cel-street.py, never by hand: a garden each, in pairs down
      // both sides, left then right, nearest first.
      var beds = PARTS.map(function (p, i) { return spot(i % 2 ? 4.6 : -4.6, 4.6 - 5.2 * Math.floor(i / 2), i % 2 ? RIGHT : LEFT); });
      var parts = beds.map(function (b, i) {
        garden(b.x, b.z, b.x < 0 ? -1 : 1);
        return kit.lift(page, '.www-cat', { n: i, w: 900, h: 1000, ww: 2.3, m: at(b.x, 0.03, b.z, b.ry) });
      });

      // AT THE FAR END, UNDER THE WEB: the room's name, and the two lines
      // either side of it, hung.
      var HD = spot(0, -11.2, 0), L2 = spot(-2.2, -9.0, LEFT), SM = spot(2.2, -9.0, RIGHT);
      hung(HD.x, 0.4, HD.z); hung(L2.x, 0.5, L2.z); hung(SM.x, 0.5, SM.z);
      var head = kit.lift(page, '.www-head', { w: 900, ww: 3.2, m: at(HD.x, 0.4, HD.z, HD.ry) });
      var lede2 = kit.lift(page, '.www-lede', { n: 2, w: 700, ww: 1.7, m: at(L2.x, 0.5, L2.z, L2.ry) });
      var small = kit.lift(page, '.www-small', { w: 700, ww: 1.6, m: at(SM.x, 0.5, SM.z, SM.ry) });

      var names = PARTS.map(function (p, i) {
        return 'at the ' + ['first', 'second', 'third'][Math.floor(i / 2)] + ' garden on the ' + (i % 2 ? 'right' : 'left') + ', ' + p.charAt(0).toLowerCase() + p.slice(1);
      });
      var stops = [
        { name: 'just in from the Garden, the web across the far end and the dawn coming in from the left', x: 0, z: 9.6, yaw: 0, pitch: 0.12 },
        front('at the words hung on the left: what this room is', L0, 2.2, 0.08, { frame: lede0.el }),
        front('at the words hung on the right: the room’s own channel and call', L1, 2.2, 0.08, { frame: lede1.el })
      ];
      beds.forEach(function (b, i) { stops.push(front(names[i], b, 3.5, 0.12, { frame: parts[i].el })); });
      stops.push(
        front('under the web, at the room’s own name', HD, 3.4, 0.14, { frame: head.el }),
        front('at the words hung on the left under the web: every room, a garden each', L2, 2.2, 0.08, { frame: lede2.el }),
        front('at the words hung on the right under the web: nothing here counts anybody', SM, 2.2, 0.08, { frame: small.el }),
        { name: 'looking up at the spider at the hub, the lit silk on the left and the dark on the right', x: 0, z: -6.5, yaw: 0, pitch: 0.42 },
        front('back by the way in from the Garden, with the room’s own page hung there', PG, 2.4, 0.05, { page: kit.page, frame: page })
      );

      return {
        start: { x: 0, z: 9.6, yaw: 0 },
        bounds: { x: [-2.6, 2.6], z: [-10.4, 10.2] },
        stops: stops
      };
    }
  };
})();
