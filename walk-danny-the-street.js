/* =============================================================================
   Danny the Street, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   1 of the rooms left on Paper Street.

   IT IS THE ROAD'S WORLD AND NOBODY ELSE'S (§33): the road surface itself at
   four in the morning, under one sodium lamp. On its page you look down at it;
   here you stand on it, which is the one thing Paper Street can do, and
   EVERYTHING ELSE STILL LIES FLAT: the kerbs down both sides, the broken centre
   line, a manhole cover, the drain grates and the joints in the tar are all
   drawn on the ground, and nothing stands up but the room's own page, propped
   at the far end of the road in the lamp's pool, because a room's page on
   Paper Street has to stand to be read. The lamp is overhead and out of sight;
   all you see of it is its pool.

   ONE HUE AND NOTHING ELSE, because low-pressure sodium is a single
   wavelength: every value is on §33's one warm line from the tar up to the
   lamp. Paper Street's own street, every shopfront in its colours and standing
   up, is what this is not. NOTHING OF DC'S IS DRAWN: every drawing is of a
   road, and the words are the page's own, about whose the street's name is.

   NOTHING MOVES. Every colour is one §33 declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['danny-the-street.html'] = {
    prefix: 'dn-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 3000 + F;                        // where the page is propped
      var eye = sh / 2;
      var KERB = 760;                            // the road's half-width, to the kerb
      var LAMP = END - F * 0.7;                  // the lamp's pool, round the page
      var HOLE = { x: 260, z: 1500 };            // the manhole cover

      var page = kit.screen(kit.page, 'Danny the Street’s own page, propped at the end of the road under the lamp');
      var propped = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'dn-walk-page' });

      var stops = [
        kit.stop({ name: 'on the road at four in the morning, the centre line running away from you', spot: { x: -200, z: 0 } }),
        kit.stop({ name: 'by the kerb, at a drain grate', spot: { x: -KERB + 180, z: 900 } }),
        kit.stop({ name: 'at the manhole cover, in the middle of the tar', spot: { x: HOLE.x, z: HOLE.z - F * 0.5 } }),
        kit.stop({ name: 'in the lamp’s pool, with the street’s own page propped at the end of the road', spot: { x: 0, z: END - F }, link: page }, propped)
      ];

      return {
        cls: 'dn-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: -200, z: 0 },
        stops: stops,
        decor: [],
        arrive: 'Its own page is propped at the far end of the road, in the lamp’s pool.',
        bounds: function () { return { x: [-KERB + 120, KERB - 120], z: [0, END - F] }; },
        ground: function (g, from, to) {
          var tar = kit.ink('--dn-tar'), kerb = kit.ink('--dn-kerb'), chalk = kit.ink('--dn-chalk');
          var paint = kit.ink('--dn-paint'), sodium = kit.ink('--dn-sodium');
          kit.quad(g, -4000, 4000, from, to, tar);
          // The pavement past each kerb, and the kerbstones themselves.
          [-1, 1].forEach(function (side) {
            var a = side * KERB, b = side * (KERB + 60);
            kit.quad(g, Math.min(a, b), Math.max(a, b), from, to, kerb);
            kit.quad(g, side < 0 ? -4000 : KERB + 60, side < 0 ? -KERB - 60 : 4000, from, to, chalk, 0.18);
            for (var z = Math.ceil(from / 180) * 180; z < to; z += 180) kit.quad(g, Math.min(a, b), Math.max(a, b), z, z + 5, tar);
          });
          // The broken centre line.
          for (var d = Math.ceil(from / 600) * 600; d < to; d += 600) kit.quad(g, -14, 14, d, d + 300, paint, 0.9);
          // Joints in the tar, where it was laid in strips.
          for (var j = Math.ceil(from / 1400) * 1400; j < to; j += 1400) kit.quad(g, -KERB, KERB, j, j + 4, kerb, 0.6);
          kit.quad(g, 360, 366, from, to, kerb, 0.4);
          // The drain grates in the gutter, bars across them.
          [[-1, 900], [1, 1900], [-1, 2900]].forEach(function (gr) {
            var x0 = gr[0] < 0 ? -KERB + 4 : KERB - 124;
            kit.quad(g, x0, x0 + 120, gr[1], gr[1] + 200, kerb);
            for (var k = 0; k < 6; k++) kit.quad(g, x0 + 10, x0 + 110, gr[1] + 14 + k * 32, gr[1] + 30 + k * 32, tar);
          });
          // The manhole cover, rings in it.
          kit.oval(g, HOLE.x, HOLE.z, 150, 150, kerb);
          kit.oval(g, HOLE.x, HOLE.z, 132, 132, tar);
          kit.oval(g, HOLE.x, HOLE.z, 110, 110, kerb);
          kit.oval(g, HOLE.x, HOLE.z, 60, 60, tar);
          // The lamp's pool: the one light, overhead and out of sight.
          kit.oval(g, 0, LAMP, 1500, 1100, sodium, 0.10);
          kit.oval(g, 0, LAMP, 900, 700, sodium, 0.10);
          kit.oval(g, 0, LAMP, 420, 340, sodium, 0.10);
        }
      };
    }
  };
})();
