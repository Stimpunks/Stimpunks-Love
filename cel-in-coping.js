/* =============================================================================
   Coping, walked into on Cel Street. Ryan's ask, 2026-10-31: down the street a
   room at a time.

   IT IS THE EYE OF THE STORM AND NOTHING ELSE (§126). A round floor of still
   air, dry and in the sun, and a wall of cloud all the way round it, slate at
   its foot, lit full on at its tops, so the brightest thing in the room is not
   the floor but the wall's crown: the storm stays in plain sight, because that
   is the difference between coping and denial. Straight up, clear sky. NO RAIN
   FALLS INSIDE THE WALL (Community Care, next door, is the rain room), nothing
   in it is green (the Garden's light comes through leaves), and the wall is the
   brightest thing here, which keeps it off Chimera Obscura's black room.

   THE SUN IS OVERHEAD, SO IT LANDS ON THE TOP EDGE OF EVERYTHING: a gold line
   along the top of every slip, and each thing's shadow small and straight
   under it, a patch of shade on the floor. Every word stands on a slip of the
   floor's own colour, standing on the dry floor, lifted on the page's own
   ground, which covers the storm the page draws at its edges so it never
   comes along behind a word; nothing is set on the sky, the cloud or the storm.

   THE DOORS ARE THE PAGE'S OWN DRAWINGS, lifted off it, each standing alone on
   the floor of the eye, told apart by its form, under the page's words for the
   moment you are in. The page draws them out of data/coping.json, and which
   room each opens onto is written below in DOORS, out of that data in its
   order, by tools/make-cel-street.py between cel:doors markers: never by hand.
   A door whose room can be walked into here offers to walk you in; the rest
   go to their room's page. The words on the slips are the page's own, lifted,
   the opening with its not-clinical-advice paragraph among them.

   NOTHING MOVES, at any setting; there is no breathing circle. Every colour is
   one the room declares, by name. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['coping.html'] = {
    name: 'Coping',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var WALL = 46, RING = 17, TOPW = 44;
      var hash = function (i, k) { var s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };

      // CLEAR SKY STRAIGHT UP, the sun overhead, and the light with no pattern
      // in it: the sky's blue from above, the dry floor's back from below.
      kit.scene.background = kit.col('--cop-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--cop-cloud'), kit.col('--cop-shade'), 0.9));
      var sun = new T.DirectionalLight(kit.col('--cop-cloud'), 3.0);
      sun.position.set(0, 60, 0.5);
      kit.scene.add(sun, sun.target);

      // THE FLOOR OF THE EYE: dry and lit in the middle, in the wall's shade at
      // the rim.
      kit.flat(new T.CircleGeometry(WALL, 72), at(0, 0, 0, 0, -Math.PI / 2), '--cop-floor');
      kit.flat(new T.RingGeometry(WALL - 7, WALL, 72), at(0, 0.01, 0, 0, -Math.PI / 2), '--cop-shade');

      // THE WALL OF CLOUD, seen from inside: slate at its foot, the storm's
      // foot, its towers, its billows, and its crown lit full on.
      [[0, 3, '--cop-storm'], [3, 10, '--cop-foot'], [10, 22, '--cop-tower'], [22, 34, '--cop-billow'], [34, TOPW, '--cop-cloud']].forEach(function (b) {
        var band = kit.flat(new T.CylinderGeometry(WALL, WALL, b[1] - b[0], 72, 1, true), at(0, (b[0] + b[1]) / 2, 0), b[2]);
        band.material.side = T.BackSide;
      });
      // Its billows, bulging in off the wall, lit on their tops by the sun.
      var puff = function (i, r, y, size, ink) {
        var a = (i / 1) * 0.37 + hash(i, 1) * 0.3;
        kit.facets(new T.IcosahedronGeometry(size, 1), at(Math.sin(a) * r, y, -Math.cos(a) * r), ink);
      };
      for (var i = 0; i < 72; i++) puff(i, WALL - 0.6, TOPW - 1.5 + hash(i, 2) * 2.5, 3.2 + hash(i, 3) * 2.6, '--cop-cloud');
      for (var j = 0; j < 90; j++) {
        var y = 10 + hash(j, 4) * 24;
        puff(j + 100, WALL - 0.4, y, 2.8 + hash(j, 5) * 2.8, y < 22 ? '--cop-tower' : '--cop-billow');
      }
      for (var k = 0; k < 60; k++) puff(k + 300, WALL - 0.2, 0.6 + hash(k, 6) * 2.4, 2.0 + hash(k, 7) * 1.6, '--cop-storm');
      // The sky straight up, deeper towards the top, and the sun in it.
      kit.flat(new T.CircleGeometry(WALL + 4, 72), at(0, TOPW + 6, 0, 0, Math.PI / 2), '--cop-zenith');
      kit.flat(new T.CircleGeometry(1.8, 24), at(0, TOPW + 5.8, 0, 0, Math.PI / 2), '--cop-sun');

      // A WHITE SLIP standing on the floor, its top edge in the sun, its shadow
      // straight under it. w and h are the slip's size in the world.
      var slip = function (g, w, foot, h) {
        var top = foot + h;
        [-1, 1].forEach(function (s) { kit.cyl(0.035, 0.035, foot, M(g, at(s * (w / 2 - 0.15), foot / 2, -0.04)), '--cop-ink-2', false, 8); });
        box(w, h, 0.05, M(g, at(0, foot + h / 2, -0.04)), '--cop-billow', 0.012);
        kit.flat(new T.PlaneGeometry(w - 0.04, h - 0.04), M(g, at(0, foot + h / 2, -0.013)), '--cop-floor');
        box(w, 0.045, 0.06, M(g, at(0, top + 0.022, -0.04)), '--cop-sun', false);
        kit.flat(new T.CircleGeometry(1, 24), M(M(g, at(0, 0.012, 0, 0, -Math.PI / 2)), new T.Matrix4().makeScale(w / 2 + 0.2, 0.35, 1)), '--cop-shade');
      };

      // WHAT STANDS ROUND THE FLOOR, in the page's order: its name and the
      // opening, its parts, the doors under each moment, what is not in the
      // eye, and the page itself. Each takes its width of the ring.
      // cel:doors:begin
      var DOORS = [{"moment": 0, "doors": [["stay-frosty.html", "Stay Frosty"], ["cooldown-room.html", "The Cooldown Room"]]}, {"moment": 1, "doors": [["latibulum.html", "The Latibulum"], ["solarpunk-hermitage.html", "The Solarpunk Hermitage"], ["cavendish-cave.html", "The Cave"]]}, {"moment": 2, "doors": [["jungle-room.html", "The Jungle Room"], ["stay-breezy.html", "Stay Breezy"], ["glow-go-gee-gaws.html", "Glow Go Gee Gaws"], ["playhouse.html", "The Playhouse"]]}, {"moment": 3, "doors": [["healing-checkpoint.html", "The Healing Checkpoint"], ["samefood-cafe.html", "Samefood Cafe"]]}, {"moment": 4, "doors": [["community-care.html", "Community Care"], ["dead-tired-society.html", "Dead Tired Society"]]}];
      var MOMENTS = ["If you’re overloaded", "If you’re socially fried", "If you’re spiraling", "If you’re post-crash", "Is this a bad system doing what bad systems do?"];
      // cel:doors:end
      var items = [
        { kind: 'head', span: 3.6 },
        { kind: 'lede', span: 3.8 },
        { kind: 'part', n: 0, span: 3.8, where: 'at what to do right now' },
        { kind: 'part', n: 1, span: 3.8, where: 'at the cope map' },
        { kind: 'part', n: 2, span: 3.8, where: 'at the seeds to plant ahead, or grab in a storm' },
        { kind: 'part', n: 3, span: 3.8, where: 'at the words you can borrow' },
        { kind: 'part', n: 4, span: 3.8, where: 'at the science of cope' },
        { kind: 'part', n: 5, span: 3.8, where: 'at cope is not an insult' }
      ];
      var di = 0;
      DOORS.forEach(function (gp) {
        items.push({ kind: 'gap', span: 0.8 });
        items.push({ kind: 'moment', n: gp.moment, span: 2.9 });
        gp.doors.forEach(function (d) { items.push({ kind: 'door', n: di++, page: d[0], name: d[1], span: 2.8 }); });
      });
      items.push({ kind: 'gap', span: 0.8 });
      items.push({ kind: 'part', n: 7, span: 3.8, where: 'at what is not in the eye' });
      items.push({ kind: 'page', span: 3.8 });

      var total = items.reduce(function (s, it) { return s + it.span; }, 0);
      var gap = 2 * Math.PI - total / RING;
      var th = Math.PI + gap / 2, stops = [], headTh = 0;
      var stand = function (t, d) { return { x: Math.sin(t) * (RING - d), z: -Math.cos(t) * (RING - d), yaw: -t }; };
      items.forEach(function (it) {
        it.t = th + (it.span / 2) / RING;
        th += it.span / RING;
      });
      // The page goes up first, because everything else is lifted off it.
      var pw = 3.2, ph = pw * 800 / 1180, pt = items[items.length - 1].t;
      var pg = at(Math.sin(pt) * RING, 0, -Math.cos(pt) * RING, -pt);
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, 0.45 + (ph + 0.3) / 2, 0.012)), 'Coping’s own page, on a slip on the floor of the eye');
      items.forEach(function (it) {
        var t = it.t;
        if (it.kind === 'gap') return;
        var g = at(Math.sin(t) * RING, 0, -Math.cos(t) * RING, -t), s;
        if (it.kind === 'head') {
          headTh = t;
          slip(g, 3.0, 1.3, 1.25);
          kit.lift(frame, '.cop-head', { w: 900, ww: 2.8, h: 360, m: M(g, at(0, 1.38, 0.01)) });
          s = stand(t, 3.4); s.name = 'the name over the eye'; s.where = 'at the room’s name, standing on the floor of the eye'; s.pitch = 0.08;
        } else if (it.kind === 'lede') {
          slip(g, 3.2, 0.35, 3.1);
          kit.lift(frame, '.cop-lede', { w: 760, ww: 3.0, h: 760, m: M(g, at(0, 0.42, 0.01)) });
          s = stand(t, 4.0); s.name = 'the opening'; s.where = 'at the opening, where the room says what it is and what it is not'; s.pitch = 0.12;
        } else if (it.kind === 'part') {
          slip(g, 3.2, 0.35, 3.1);
          kit.lift(frame, '.cop-part', { n: it.n, w: 760, ww: 3.0, h: 760, m: M(g, at(0, 0.42, 0.01)) });
          s = stand(t, 4.0); s.name = it.where.replace(/^at /, ''); s.where = it.where; s.pitch = 0.12;
        } else if (it.kind === 'moment') {
          slip(g, 2.4, 0.85, 1.4);
          kit.lift(frame, '.cop-moment', { n: it.n, w: 440, ww: 2.2, h: 270, drop: '.cop-doors', m: M(g, at(0, 0.92, 0.01)) });
          s = stand(t, 3.3); s.pitch = 0.04; s.name = MOMENTS[it.n]; s.where = 'at the doors for ' + MOMENTS[it.n].replace(/^If /, 'when ').replace(/\?$/, '');
        } else if (it.kind === 'door') {
          // The page's own drawing of the door, stood up on the floor at the
          // height of a door, its shade straight under it.
          // Lifted on the page's own ground, as every lift here is: it covers
          // the storm the page draws at its edges, which would otherwise come
          // along behind the drawing. So each door stands in a free-standing
          // panel of the floor's colour, the sun on its top edge.
          var DW = 100 * 1.2 / 72, DH = 142 * 1.2 / 72;
          box(DW + 0.06, DH + 0.06, 0.06, M(g, at(0, DH / 2, -0.04)), '--cop-billow', 0.012);
          box(DW + 0.06, 0.045, 0.08, M(g, at(0, DH + 0.05, -0.04)), '--cop-sun', false);
          kit.lift(frame, '.cop-door__art', { n: it.n, w: 100, ww: DW, m: M(g, at(0, 0, 0.01)) });
          kit.flat(new T.CircleGeometry(1, 24), M(M(g, at(0, 0.013, 0.05, 0, -Math.PI / 2)), new T.Matrix4().makeScale(0.55, 0.22, 1)), '--cop-shade');
          s = stand(t, 3.0); s.name = it.name; s.room = it.name; s.page = it.page; s.where = 'at the door onto ' + it.name + ', standing on its own on the floor of the eye'; s.pitch = 0.1;
        } else if (it.kind === 'page') {
          slip(g, pw + 0.3, 0.45, ph + 0.3);
          s = stand(t, 3.9); s.name = 'the room’s own page'; s.where = 'at the room’s own page, on a slip on the floor of the eye'; s.page = kit.page; s.frame = frame; s.pitch = 0.04;
        }
        stops.push(s);
      });

      // Standing in the middle, and in the gap between the slips, with the
      // wall of cloud in plain sight and the sky straight up.
      var mid = { name: 'the middle of the eye', where: 'in the middle of the eye, the sun overhead and the wall of cloud all the way round', x: 0, z: 0, yaw: -headTh };
      stops.unshift(mid);
      stops.push({ name: 'the wall of cloud', where: 'in the gap between the slips, facing the wall of cloud, the storm in plain sight', x: 0, z: 13.5, yaw: Math.PI, pitch: 0.3 });
      stops.push({ name: 'the sky', where: 'looking straight up out of the eye, the sky clear', x: Math.sin(headTh + Math.PI) * 3, z: -Math.cos(headTh + Math.PI) * 3, yaw: -headTh, pitch: 0.75 });

      return {
        start: { x: 0, z: 0, yaw: -headTh },
        bounds: { x: [-15, 15], z: [-15, 15] },
        stops: stops
      };
    }
  };
})();
