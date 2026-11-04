/* =============================================================================
   Now Playing, walked into on Cel Street: off the poster column on the
   pavement by the front door.

   IT IS THE BILL'S WORLD AND NOBODY ELSE'S (§53): one sheet, screenprinted in
   two inks, pasted round a column out in the weather at night, and you walk
   round it. The column is the dark painted drum, shaded where it turns away
   from the shop windows across the pavement; the sheet is pasted round it, a
   panel to each face. TWO INKS AND NO BLACK: --np-red and --np-cobalt carry no
   word, and where one is printed over the other they make --np-both, which
   nobody mixed. The ornament here is drawn that way, the second screen
   multiplied over the first, so the third colour on it is the overprint and
   not a third ink. It is not Club Chronic (a hundred flyers on a black wall,
   paper as the subject) and not the zine table (toner on white).

   NOTHING ON IT PLAYS. The bill is the page's own, lifted; nothing is
   pressed here but your way round the column. No headliner and nothing
   counted, because the page says so and the words are the page's.

   Nothing moves, at any setting. Every colour is one the page declares, by
   name. It keeps nothing, sends nothing and fetches nothing; its page arrives
   through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['now-playing.html'] = {
    name: 'Now Playing',
    faces: ['"Rammetto One"', '"Instrument Sans"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var FACES = 8, FW = 1.7, R = FW / (2 * Math.tan(Math.PI / FACES)), H = 3.6;

      // NIGHT ON THE PAVEMENT, and the shop windows across it lighting the
      // column from one side.
      kit.scene.background = kit.col('--np-night');
      kit.scene.fog = new T.Fog(kit.col('--np-night'), 16, 46);
      kit.scene.add(new T.HemisphereLight(kit.col('--np-stock'), kit.col('--np-night'), 1.1));
      var shops = new T.DirectionalLight(kit.col('--np-stock'), 1.4);
      shops.position.set(0, 4, 20);
      kit.scene.add(shops);

      // The pavement, and across it the lit shop windows the light comes from.
      box(60, 0.1, 60, at(0, -0.05, 0), '--np-night', false, false);
      box(60, 0.12, 0.3, at(0, 0.06, 7.2), '--np-drum', false, false);
      for (var w = -3; w <= 3; w++) kit.flat(new T.PlaneGeometry(3.2, 2.2), at(w * 4.6, 1.6, 12, Math.PI), '--np-stock');

      // THE COLUMN: the drum, a face to every panel of the sheet, the base and
      // the cap. The faces that turn away from the windows are the shaded iron.
      function face(i) { var a = i / FACES * Math.PI * 2; return at(Math.sin(a) * R, 0, Math.cos(a) * R, a); }
      cyl(R * 1.06, R * 1.1, 0.3, at(0, 0.15, 0), '--np-drum', 0.02, FACES * 2);
      cyl(R * 1.12, R * 1.0, 0.36, at(0, H + 0.48, 0), '--np-drum', 0.02, FACES * 2);
      cyl(0.2, R * 0.75, 0.9, at(0, H + 1.1, 0), '--np-drum-2', 0.02, FACES * 2);
      function cyl(r0, r1, h, m, ink, ol, seg) { kit.cyl(r0, r1, h, m, ink, ol, seg); }
      for (var i = 0; i < FACES; i++) {
        var away = Math.cos(i / FACES * Math.PI * 2) < 0;
        box(FW, H, 0.12, M(face(i), at(0, 0.3 + H / 2, -0.06)), away ? '--np-drum' : '--np-drum-2', false);
      }

      // THE SHEET, a panel pasted on each face, in the stock.
      function sheet(i) { box(FW - 0.12, H - 0.2, 0.02, M(face(i), at(0, 0.3 + H / 2, 0.01)), '--np-stock', false, false); }

      // The overprint: two screens, the second multiplied over the first, so
      // where they cross is the third colour and nothing printed it.
      var inks = kit.paper(640, 640, function (c, w, h) {
        c.fillStyle = kit.ink('--np-stock'); c.fillRect(0, 0, w, h);
        c.globalCompositeOperation = 'multiply';
        c.fillStyle = kit.ink('--np-red');
        c.beginPath(); c.arc(w * 0.4, h * 0.42, w * 0.3, 0, Math.PI * 2); c.fill();
        c.fillStyle = kit.ink('--np-cobalt');
        c.beginPath(); c.moveTo(w * 0.06, h * 0.8);
        c.bezierCurveTo(w * 0.3, h * 0.1, w * 0.55, h * 0.12, w * 0.68, h * 0.5);
        c.bezierCurveTo(w * 0.8, h * 0.85, w * 0.9, h * 0.6, w * 0.95, h * 0.3);
        c.lineTo(w * 0.95, h * 0.95); c.lineTo(w * 0.06, h * 0.95); c.closePath(); c.fill();
        c.globalCompositeOperation = 'source-over';
        c.fillStyle = kit.ink('--np-stock');
        c.beginPath(); c.arc(w * 0.4, h * 0.42, w * 0.04, 0, Math.PI * 2); c.fill();
      });
      // The title, printed on both screens, so it is in the overprint's ink,
      // with the cobalt screen's fringe a hair off the red's.
      var title = kit.paper(900, 300, function (c, w, h) {
        c.fillStyle = kit.ink('--np-stock'); c.fillRect(0, 0, w, h);
        c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '96px "Rammetto One"';
        c.globalCompositeOperation = 'multiply';
        c.fillStyle = kit.ink('--np-red'); c.fillText('NOW', w / 2 - 3, h * 0.3 - 2);
        c.fillStyle = kit.ink('--np-cobalt'); c.fillText('NOW', w / 2 + 3, h * 0.3 + 2);
        c.fillStyle = kit.ink('--np-red'); c.fillText('PLAYING', w / 2 - 3, h * 0.72 - 2);
        c.fillStyle = kit.ink('--np-cobalt'); c.fillText('PLAYING', w / 2 + 3, h * 0.72 + 2);
        c.globalCompositeOperation = 'source-over';
      });

      // The page goes up on the face you meet first; its words go round the
      // rest, a part to a face, and the faces between carry the ornament.
      var stops = [];
      function front(i, d) { var a = i / FACES * Math.PI * 2; return { x: Math.sin(a) * (R + d), z: Math.cos(a) * (R + d), yaw: a }; }
      function onFace(i, y) { return M(face(i), at(0, y, 0.03)); }
      // Words are laid over the picture and no drum hides them, so each face's
      // words show only from in front of that face.
      function side(i) { var c = front(i, 2.6), q = 2.6; return [c.x - q, c.x + q, c.z - q, c.z + q]; }
      for (i = 0; i < FACES; i++) sheet(i);
      kit.sheet(title, FW - 0.24, (FW - 0.24) / 3, onFace(0, 0.3 + H - 0.55));
      var page = kit.screen(1180, 800, FW - 0.24, onFace(0, 1.55), 'Now Playing’s own page, pasted on the column', side(0));
      var head = kit.lift(page, '.np-head', { w: 520, ww: FW - 0.3, m: onFace(1, 0.55), bare: true, zone: side(1) });
      var lede = kit.lift(page, '.np-lede', { w: 520, h: 900, ww: FW - 0.3, m: onFace(2, 0.55), bare: true, zone: side(2) });
      var bill = kit.lift(page, '.np-part', { n: 0, w: 520, h: 940, ww: FW - 0.3, m: onFace(3, 0.45), bare: true, zone: side(3) });
      kit.sheet(inks, FW - 0.4, FW - 0.4, onFace(4, 0.3 + H / 2));
      var rules = kit.lift(page, '.np-part', { n: 1, w: 520, h: 940, ww: FW - 0.3, m: onFace(5, 0.45), bare: true, zone: side(5) });
      kit.sheet(inks, FW - 0.4, FW - 0.4, onFace(6, 0.3 + H / 2));
      kit.sheet(title, FW - 0.24, (FW - 0.24) / 3, onFace(7, 0.3 + H / 2));

      var K = R + 0.6;
      var at0 = front(0, 2.6), at1 = front(1, 2.0), at2 = front(2, 2.0), at3 = front(3, 2.0), at4 = front(4, 2.4), at5 = front(5, 2.0);
      stops.push(
        { name: 'on the pavement in front of the column', where: 'in front of the column', x: at0.x, z: at0.z + 1.6, yaw: 0, pitch: 0.1 },
        { name: 'at the column, where the page is pasted', where: 'at the page pasted on the column', x: at0.x, z: at0.z, yaw: at0.yaw, pitch: 0.06, page: kit.page, frame: page },
        { name: 'a step round: the head of the bill', where: 'at the head of the bill', x: at1.x, z: at1.z, yaw: at1.yaw, pitch: 0.12, frame: head.el },
        { name: 'round again: what is on, and that nothing here plays', where: 'at the lines under the title', x: at2.x, z: at2.z, yaw: at2.yaw, pitch: 0.12, frame: lede.el },
        { name: 'round the back: the bill', where: 'at the bill', x: at3.x, z: at3.z, yaw: at3.yaw, pitch: 0.12, frame: bill.el },
        { name: 'at the two screens crossing, round the back', where: 'at the two inks crossing', x: at4.x, z: at4.z, yaw: at4.yaw, pitch: 0.16 },
        { name: 'round again: how this poster is printed', where: 'at how the poster is printed', x: at5.x, z: at5.z, yaw: at5.yaw, pitch: 0.12, frame: rules.el }
      );

      return {
        start: { x: at0.x, z: at0.z + 1.6, yaw: 0 },
        // The pavement all round the column and never through it: four strips
        // round a square the drum stands in, and you keep to the nearest.
        bounds: { x: [-(R + 4), R + 4], z: [-(R + 4), R + 5], areas: [
          { x: [-(R + 4), R + 4], z: [-(R + 4), -K] }, { x: [-(R + 4), R + 4], z: [K, R + 5] },
          { x: [-(R + 4), -K], z: [-(R + 4), R + 5] }, { x: [K, R + 4], z: [-(R + 4), R + 5] }] },
        stops: stops
      };
    }
  };
})();
