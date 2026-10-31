/* =============================================================================
   The Latibulum, walked into on Paper Street. Ryan's call, 2026-10-31: the
   fifth room you can walk into.

   IT IS THE BURROW'S WORLD AND NOBODY ELSE'S (§16): dug into a hill, with a
   round green door, thick walls, arches of planed wood, plaster lit warm by
   one low lamp, and no sky in it anywhere. You come in at the round door and
   go along a passage through arch after arch, each a lit plaster panel in the
   dark earth, to the hollow at the end, where the room's own page is on the
   plaster wall in a frame of beam, with the low lamp on a table beside it. Its
   words sit dark on lit plaster there as they do in the room, which is what
   keeps this off the Faery Yurt, cream on dark all the way down.

   THE WIRELESS AND THE TELEVISION ARE THE ROOM'S OWN (Ryan, 2026-10-31), lifted
   off the page on the wall by Paper Street's kit.lift(), and they stand in the
   hollow either side of it, to walk up to and switch on. They are the page's
   own markup, so they say how long they run before the press, as on the page,
   and nothing reaches YouTube until somebody presses one.

   THE LAMP'S POOL ON THE FLOOR IS THE ROOM'S OWN, --lamp at .16, and like the
   room's it is the same at every setting; nothing moves at any setting, the
   lamp's breathing included, which on the page is MAX's only motion and is
   the page's to keep. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Paper Street's screen(). tools/make-paper-street.py
   holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // An arched opening's outline, its foot on the floor at the bottom edge.
  function archPath(cx, h, ow, oh) {
    var l = cx - ow / 2, r = cx + ow / 2, spring = h - oh + ow / 2;
    return 'M' + l + ' ' + h + ' V' + spring + ' A' + ow / 2 + ' ' + ow / 2 + ' 0 0 1 ' + r + ' ' + spring + ' V' + h + ' Z';
  }

  // One arch across the passage: dark earth, a lit plaster panel round the
  // opening, and the opening framed in planed beam.
  function arch(w, h, ow, oh, panel) {
    var s = svg(w, h), cx = w / 2, hole = archPath(cx, h, ow, oh);
    s.appendChild(el('path', { 'fill-rule': 'evenodd', fill: 'var(--burrow)', d: 'M0 0 H' + w + ' V' + h + ' H0 Z ' + hole }));
    s.appendChild(el('path', { 'fill-rule': 'evenodd', fill: 'var(--plaster-2)',
      d: 'M' + (cx - panel / 2) + ' ' + (h - oh - 260) + ' H' + (cx + panel / 2) + ' V' + h + ' H' + (cx - panel / 2) + ' Z ' + hole }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--beam)', 'stroke-width': 38, d: hole }));
    return s;
  }

  // The round door you come in by, standing open: the earth of the hill, a
  // round hole, and the green door swung back against the wall.
  function roundDoor(w, h, d) {
    var s = svg(w, h), cx = w / 2, cy = h - d / 2 - 10, r = d / 2;
    var hole = 'M' + (cx - r) + ' ' + cy + ' A' + r + ' ' + r + ' 0 1 1 ' + (cx + r) + ' ' + cy + ' A' + r + ' ' + r + ' 0 1 1 ' + (cx - r) + ' ' + cy + ' Z';
    s.appendChild(el('path', { 'fill-rule': 'evenodd', fill: 'var(--loam)', d: 'M0 0 H' + w + ' V' + h + ' H0 Z ' + hole }));
    s.appendChild(el('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: 'var(--beam)', 'stroke-width': 44 }));
    s.appendChild(el('ellipse', { cx: cx - r - 120, cy: cy, rx: 70, ry: r - 20, fill: 'var(--door)' }));
    s.appendChild(el('circle', { cx: cx - r - 110, cy: cy, r: 12, fill: 'var(--brass)' }));
    return s;
  }

  // The plaster wall of the hollow, with a frame of beam where the page hangs.
  function wall(w, h, fw, fh) {
    var s = svg(w, h), cx = w / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--burrow)' }));
    s.appendChild(el('rect', { x: cx - fw / 2 - 260, y: 0, width: fw + 520, height: h, fill: 'var(--plaster)' }));
    s.appendChild(el('rect', { x: cx - fw / 2 - 30, y: h - fh - 30, width: fw + 60, height: fh + 30, fill: 'var(--beam)' }));
    s.appendChild(el('rect', { x: 0, y: h - 40, width: w, height: 40, fill: 'var(--umber)' }));
    return s;
  }

  // The low lamp on its small table, at knee height.
  function lamp(w, h) {
    var s = svg(w, h), cx = w / 2;
    s.appendChild(el('rect', { x: cx - 90, y: h - 150, width: 180, height: 22, fill: 'var(--beam)' }));
    s.appendChild(el('rect', { x: cx - 80, y: h - 128, width: 16, height: 128, fill: 'var(--beam)' }));
    s.appendChild(el('rect', { x: cx + 64, y: h - 128, width: 16, height: 128, fill: 'var(--beam)' }));
    s.appendChild(el('rect', { x: cx - 8, y: h - 250, width: 16, height: 100, fill: 'var(--brass)' }));
    s.appendChild(el('circle', { cx: cx, cy: h - 300, r: 70, fill: 'var(--lamp)', 'fill-opacity': '0.16' }));
    s.appendChild(el('path', { fill: 'var(--lamp)', d: 'M' + (cx - 46) + ' ' + (h - 250) + ' L' + (cx - 28) + ' ' + (h - 330) + ' H' + (cx + 28) + ' L' + (cx + 46) + ' ' + (h - 250) + ' Z' }));
    return s;
  }

  // A passage wall: plaster above a beam rail, earth-dark below it, and pegs
  // with coats on them where somebody came in out of the weather.
  function sideWall(w, h, coats) {
    var s = svg(w, h), rail = h - 220;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--plaster-2)' }));
    s.appendChild(el('rect', { x: 0, y: rail, width: w, height: h - rail, fill: 'var(--umber-2)' }));
    s.appendChild(el('rect', { x: 0, y: rail - 14, width: w, height: 18, fill: 'var(--beam)' }));
    if (coats) {
      s.appendChild(el('rect', { x: 40, y: rail - 470, width: w - 80, height: 16, fill: 'var(--beam)' }));
      for (var x = 90, k = 0; x < w - 60; x += 150, k++) {
        s.appendChild(el('circle', { cx: x, cy: rail - 450, r: 8, fill: 'var(--brass)' }));
        if (k % 2 === 0) s.appendChild(el('path', { fill: k % 4 ? 'var(--door)' : 'var(--rust)',
          d: 'M' + (x - 10) + ' ' + (rail - 446) + ' L' + (x - 52) + ' ' + (rail - 180) + ' H' + (x + 52) + ' L' + (x + 10) + ' ' + (rail - 446) + ' Z' }));
      }
    }
    return s;
  }

  // A deep armchair by the lamp, upholstered in the room's oat.
  function armchair(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: w * 0.1, y: 0, width: w * 0.8, height: h * 0.64, rx: 40, fill: 'var(--oat-2)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.3, width: w * 0.22, height: h * 0.56, rx: 30, fill: 'var(--plaster-2)' }));
    s.appendChild(el('rect', { x: w * 0.78, y: h * 0.3, width: w * 0.22, height: h * 0.56, rx: 30, fill: 'var(--plaster-2)' }));
    s.appendChild(el('rect', { x: w * 0.16, y: h * 0.56, width: w * 0.68, height: h * 0.26, rx: 16, fill: 'var(--oat)' }));
    s.appendChild(el('rect', { x: w * 0.14, y: h * 0.86, width: 16, height: h * 0.14, fill: 'var(--beam)' }));
    s.appendChild(el('rect', { x: w * 0.86 - 16, y: h * 0.86, width: 16, height: h * 0.14, fill: 'var(--beam)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['latibulum.html'] = {
    prefix: 'lat-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var END = 4400 + F;                       // where the hollow's wall stands
      var eye = sh / 2;
      var AW = 3600, AH = Math.max(1800, sh + 900), OW = 760, OH = Math.max(eye * 1.8, 560);
      var decor = [];

      decor.push(kit.item(roundDoor(AW, AH, Math.max(OH, 700)), { x: 0, z: 640, w: AW, h: AH }));
      var LAST = 0;
      for (var z = 1240; z < END - F * 3.6; z += 560) {
        decor.push(kit.item(arch(AW, AH, OW, OH, 1500), { x: 0, z: z, w: AW, h: AH }));
        LAST = z;
      }
      // The passage's walls between the round door and the last arch, plastered,
      // with coats on pegs along the left one.
      var WH = Math.max(OH + 260, eye * 2.4);
      [-1, 1].forEach(function (side) {
        var len = LAST - 640;
        decor.push(kit.item(sideWall(len, WH, side < 0), { x: side * (OW / 2 + 20), z: 640 + len / 2, w: len, h: WH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var WW = 3600, WH = Math.max(1600, sh + 700);
      decor.push(kit.item(wall(WW, WH, sw, sh), { x: 0, z: END + 20, w: WW, h: WH }));
      decor.push(kit.item(lamp(260, 360), { x: sw / 2 + 200, z: END - 80, w: 260, h: 360 }));

      var page = kit.screen(kit.page, 'The Latibulum’s own page, on the plaster wall of the hollow');
      var framed = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'lat-walk-wall' });

      // The wireless and the television, off the page, either side of it in the
      // hollow. Where you stand to use one is worked out once it has its size:
      // far enough back that the whole set and its plate are on the stage.
      var TW = 560, HOLLOW = sw / 2 + TW / 2 + 160;
      var wireless = kit.lift(page, '.thing.wireless', { x: -HOLLOW, z: END - 120, w: TW });
      var telly = kit.lift(page, '.thing.telly', { x: HOLLOW, z: END - 120, w: TW });
      // From an eye halfway up the stage, the set's top and its plate's foot
      // both on the stage, and never nearer than the set's own size.
      var at = function (it) { return kit.front(it); };
      // A deep armchair beside the lamp, turned to the room.
      decor.push(kit.item(armchair(360, 330), { x: sw / 2 + 520, z: END - 420, w: 360, h: 330, turn: kit.RIGHT }));
      // In steps the keyboard goes with you; at a set, to its own play button,
      // found once the set has arrived off the page.
      var button = function (it) {
        return { focus: function (o) { var b = it.el.querySelector('button.facade'); if (b) b.focus(o); } };
      };

      var stops = [
        kit.stop({ name: 'outside the round door, under the hill', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'along the passage, under the arches', spot: { x: 0, z: (END - F) * 0.5 } }),
        kit.stop({ name: 'at the wireless in the corner of the hollow', spot: at(wireless), link: button(wireless) }, wireless),
        kit.stop({ name: 'in the hollow, with the room’s own page on the wall', spot: { x: 0, z: END - F }, link: page }, framed),
        kit.stop({ name: 'at the television, dragged down here from another decade', spot: at(telly), link: button(telly) }, telly)
      ];

      return {
        cls: 'lat-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on the plaster wall in the hollow at the end of the passage, by the low lamp.',
        // The passage is the arches' width; the hollow past the last arch is
        // wide enough to step up to the sets either side of the page.
        bounds: function (cam) {
          var x = cam && cam.z > LAST ? HOLLOW : OW / 2 - 60;
          return { x: [-x, x], z: [0, END - F] };
        },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--umber'));
          // Floorboards, the long way down the passage and across the hollow.
          var seam = kit.ink('--umber-2');
          for (var bx = -1800; bx < 1800; bx += 90) kit.quad(g, bx, bx + 3, Math.max(from, 0), Math.min(to, END + 40), seam, 0.8);
          kit.quad(g, -150, 150, Math.max(from, 0), Math.min(to, END), kit.ink('--rust'));
          // A braided rug in the hollow, rings of the room's rust, oat and door green.
          [['--rust', 620, 330], ['--oat-2', 540, 280], ['--door', 440, 220], ['--rust', 320, 160], ['--oat-2', 180, 90]].forEach(function (ring) {
            kit.oval(g, 0, END - F * 0.9, ring[1], ring[2], kit.ink(ring[0]), 1);
          });
          kit.oval(g, sw / 2 + 200, END - 140, 520, 260, kit.ink('--lamp'), 0.16);
        }
      };
    }
  };
})();
