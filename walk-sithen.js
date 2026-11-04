/* =============================================================================
   Sithen, walked into on Paper Street: turning 02 off the Outskirts, a fairy
   fort standing in a field under a full moon. Ryan's ask, 2026-11-04: round 1
   of the rooms you can walk into.

   IT IS SITHEN'S WORLD AND NOBODY ELSE'S (§36): ONE OBJECT THAT YOU CIRCLE. A
   ring of banked earth with whitethorn on it, in an open field, lit by the moon
   from directly overhead, so everything is evenly silvered and what shadow
   there is lies straight down. THE DOOR IS NOT OPENED AND YOU DO NOT GO IN:
   the ring is made of banks standing in a circle, and the track goes round
   the outside of it and never through, which is what the bounds keep. The
   room's own page stands on a low panel of earth at the foot of the ring,
   facing out to the track.

   THERE IS NO GREEN IN IT ANYWHERE. Grass under a full moon has a brightness
   and not a colour, so every value is one of §36's on its grey-violet line,
   which is what holds it off the campgrounds, the other cold night ground.
   Nothing here is from the Merry Gentry or October Daye books, and nothing
   tells anybody how to behave. NOTHING MOVES. Every colour is one §36
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Paper Street's screen(). tools/make-paper-street.py
   holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function seeded(n) {
    return function () {
      n = (n + 0x6D2B79F5) | 0;
      var t = Math.imul(n ^ (n >>> 15), 1 | n);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // One stretch of the bank: earth heaped in a low curve, its top silvered,
  // whitethorn growing out of it in dark lines with bone blossom.
  function bank(r, w, h) {
    var s = svg(w, h), top = h * 0.45;
    s.appendChild(el('path', { fill: 'var(--sth-bank)', d: 'M0 ' + h + ' Q' + (w * 0.1) + ' ' + top + ' ' + (w / 2) + ' ' + top + ' Q' + (w * 0.9) + ' ' + top + ' ' + w + ' ' + h + ' Z' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--sth-moon)', 'stroke-width': 5, d: 'M' + (w * 0.08) + ' ' + (top + 40) + ' Q' + (w / 2) + ' ' + (top - 2) + ' ' + (w * 0.92) + ' ' + (top + 40) }));
    for (var i = 0; i < 3; i++) {
      var x = w * (0.2 + r() * 0.6), y = top + 6, d = 'M' + x + ' ' + y;
      var tips = [];
      for (var b = 0; b < 6; b++) {
        var bx = x + (r() - 0.5) * 220, by = y - 60 - r() * (top - 30);
        d += ' M' + x + ' ' + y + ' Q' + ((x + bx) / 2 + (r() - 0.5) * 60) + ' ' + ((y + by) / 2) + ' ' + bx + ' ' + by;
        tips.push([bx, by]);
      }
      s.appendChild(el('path', { d: d, fill: 'none', stroke: 'var(--sth-thorn)', 'stroke-width': 4, 'stroke-linecap': 'round' }));
      tips.forEach(function (t) {
        for (var k = 0; k < 4; k++) s.appendChild(el('circle', { cx: t[0] + (r() - 0.5) * 40, cy: t[1] + (r() - 0.5) * 30, r: 4 + r() * 4, fill: 'var(--sth-bone)' }));
      });
    }
    return s;
  }

  // The moon, full, straight overhead: a disc and nothing round it.
  function moon(w) {
    var s = svg(w, w);
    s.appendChild(el('circle', { cx: w / 2, cy: w / 2, r: w / 2 - 2, fill: 'var(--sth-moon)' }));
    s.appendChild(el('circle', { cx: w * 0.42, cy: w * 0.44, r: w * 0.1, fill: 'var(--sth-dim)', opacity: '0.5' }));
    s.appendChild(el('circle', { cx: w * 0.62, cy: w * 0.6, r: w * 0.07, fill: 'var(--sth-dim)', opacity: '0.5' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['sithen.html'] = {
    prefix: 'sithen-walk',
    from: 'the-outskirts.html',
    build: function (kit) {
      var r = seeded(36);
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 900), sh = kit.H - 24;
      var R = 1300, ZC = 1500 + R + F;           // the ring's middle
      var OUT = R + 260;                        // the track round it
      var PANEL = ZC - R - 120;                 // the panel at its foot
      var eye = sh / 2, decor = [];

      // THE RING, bank by bank, each facing out from the middle.
      var N = 22, seg = 2 * Math.PI * R / N + 30;
      for (var i = 0; i < N; i++) {
        var a = (i + 0.5) / N * 2 * Math.PI;
        var bx = Math.sin(a) * R, bz = ZC - Math.cos(a) * R;
        decor.push(kit.item(bank(r, seg, 640), { x: bx, z: bz, w: seg, h: 640, turn: a }));
      }
      decor.push(kit.item(moon(260), { x: 0, z: ZC + 2600, w: 260, h: 260, y: sh * 1.4 + 900 }));

      var page = kit.screen(kit.page, 'Sithen’s own page, on a low panel of earth at the foot of the ring');
      var panel = kit.item(page, { x: 0, z: PANEL, w: sw, h: sh, cls: 'sithen-walk-panel' });

      var stops = [
        kit.stop({ name: 'in the field, with the ring of thorn ahead of you', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the panel at the foot of the ring, with the room’s own page on it', spot: { x: 0, z: PANEL - F }, link: page }, panel),
        kit.stop({ name: 'on the track round the west of the ring, the bank on your right', spot: { x: -OUT - 140, z: ZC - R * 0.6, yaw: 0 } }),
        kit.stop({ name: 'on the track round the east of the ring, the bank on your left', spot: { x: OUT + 140, z: ZC - R * 0.6, yaw: 0 } })
      ];

      return {
        cls: 'sithen-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on a low panel of earth at the foot of the ring, and the track goes round it.',
        // You walk round the ring and never into it: beside it you keep to
        // the track's side, and in front of it you stop at the panel.
        bounds: function (cam) {
          if (!cam || cam.z > 1e8) return { x: [-1900, 1900], z: [0, ZC + R] };
          if (cam.z > PANEL - F * 0.5) return { x: cam.x < 0 ? [-1900, -OUT] : [OUT, 1900], z: [0, ZC + R] };
          return { x: [-1900, 1900], z: [0, Math.abs(cam.x) >= OUT ? ZC + R : PANEL - F * 0.5] };
        },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--sth-bank'));
          // The track trodden round the ring, a little paler than the field.
          for (var k = 0; k < 48; k++) {
            var t = k / 48 * 2 * Math.PI;
            kit.oval(g, Math.sin(t) * OUT, ZC - Math.cos(t) * OUT, 120, 120, kit.ink('--sth-thorn'), 0.35);
          }
          kit.quad(g, -90, 90, 0, ZC - OUT, kit.ink('--sth-thorn'), 0.35);
          // Grass under the moon: a brightness, not a colour.
          var lit = seeded(9), dim = kit.ink('--sth-dim');
          for (var q = 0; q < 700; q++) {
            var qx = -2400 + lit() * 4800, qz = lit() * (ZC + R + 1400);
            if (qz < near || qz > far) continue;
            kit.oval(g, qx, qz, 6 + lit() * 10, 3 + lit() * 4, dim, 0.35);
          }
        }
      };
    }
  };
})();
