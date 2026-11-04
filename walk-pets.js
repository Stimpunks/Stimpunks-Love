/* =============================================================================
   Pets, walked into on Paper Street. Ryan's ask, 2026-11-04: round one of the
   rooms still to be walked into.

   IT IS PETS' WORLD AND NOBODY ELSE'S (§127): down on the floor with the
   animals at the end of the day. Paper Street's eye is set low in here, where
   yours would be sitting on the boards, so the rug and the animals are close
   and big and the skirting is at your shoulder. The dog is asleep on the rug,
   the cat has curled up beside the dog, and a rabbit is loafing in what is left
   of the light. NOBODY HAS SWITCHED THE LAMP ON, because getting up would mean
   moving somebody: it stands in the corner off, in the room's dark inks and
   never the light's or the words', with its switch lying on the floor on its
   cord where nobody reached for it.

   THE LIGHT IS THE SKY'S, GOING, THROUGH ONE LOW WINDOW in the left-hand wall:
   blue above and pale at the foot where the last of the day is, behind the
   trees and a roof, and what comes in lies level across the floor from the
   window side. No lamp lit, no flame, nothing glowing in the room, which keeps
   it off every lamplit room on the street; one soft wash and nobody's
   corridor, which keeps it off Dead Tired Society.

   THE DOORS ARE PET FLAPS set into the skirting, this room's drawings, sized
   for whoever uses them; where each one goes is on the room's own page, which
   hangs on the back wall. The animals are nobody's pets and not the shelters'.

   NOTHING MOVES, AT ANY SETTING: everybody is asleep, no tail wags and nobody
   breathes up and down. Every colour is one Pets declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Paper
   Street's screen(). tools/make-paper-street.py holds each of those.
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

  // A wall: the room's dusk, the skirting at the foot, and pet flaps set into
  // it at the sizes given (a flap is [x, width, height]).
  function wall(w, h, flaps) {
    var s = svg(w, h), sk = 120;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--pts-wall)' }));
    s.appendChild(el('rect', { x: 0, y: h - sk, width: w, height: sk, fill: 'var(--pts-skirting)' }));
    (flaps || []).forEach(function (f) {
      var x = f[0], fw = f[1], fh = f[2];
      s.appendChild(el('rect', { x: x - 10, y: h - fh - 10, width: fw + 20, height: fh + 10, rx: 14, fill: 'var(--pts-night)' }));
      s.appendChild(el('rect', { x: x, y: h - fh, width: fw, height: fh, rx: 10, fill: 'var(--pts-flap)' }));
      s.appendChild(el('rect', { x: x + 8, y: h - fh + 6, width: fw - 16, height: 6, fill: 'var(--pts-sheen)' }));
    });
    return s;
  }

  // THE WINDOW, low in the left-hand wall: the sky going, blue above and pale
  // at the foot, a roof and the trees against it, and the sill.
  function windowWall(w, h, wx, ww, wh) {
    var s = wall(w, h), top = h - 120 - 60 - wh;
    s.appendChild(el('rect', { x: wx, y: top, width: ww, height: wh, fill: 'var(--pts-zenith)' }));
    s.appendChild(el('rect', { x: wx, y: top + wh * 0.45, width: ww, height: wh * 0.55, fill: 'var(--pts-sky)' }));
    s.appendChild(el('rect', { x: wx, y: top + wh * 0.82, width: ww, height: wh * 0.18, fill: 'var(--pts-glow)' }));
    s.appendChild(el('path', { fill: 'var(--pts-night)', d: 'M' + (wx + ww * 0.1) + ' ' + (top + wh) + ' V' + (top + wh * 0.72) + ' L' + (wx + ww * 0.3) + ' ' + (top + wh * 0.58) + ' L' + (wx + ww * 0.5) + ' ' + (top + wh * 0.72) + ' V' + (top + wh) + ' Z' }));
    [0.62, 0.74, 0.88].forEach(function (k, i) {
      s.appendChild(el('ellipse', { cx: wx + ww * k, cy: top + wh * (0.7 - i * 0.04), rx: 60, ry: 110 - i * 10, fill: 'var(--pts-night)' }));
    });
    s.appendChild(el('rect', { x: wx + ww / 2 - 8, y: top, width: 16, height: wh, fill: 'var(--pts-skirting)' }));
    s.appendChild(el('rect', { x: wx, y: top + wh / 2 - 8, width: ww, height: 16, fill: 'var(--pts-skirting)' }));
    s.appendChild(el('rect', { x: wx - 20, y: top + wh, width: ww + 40, height: 26, fill: 'var(--pts-skirting)' }));
    s.appendChild(el('rect', { x: wx, y: top, width: ww, height: wh, fill: 'none', stroke: 'var(--pts-skirting)', 'stroke-width': 18 }));
    return s;
  }

  // The dog, asleep on the rug: a long curve of back, a head laid on paws.
  function dog(w, h) {
    var s = svg(w, h);
    s.appendChild(el('ellipse', { cx: w * 0.55, cy: h * 0.62, rx: w * 0.4, ry: h * 0.34, fill: 'var(--pts-dog)' }));
    s.appendChild(el('ellipse', { cx: w * 0.16, cy: h * 0.72, rx: w * 0.15, ry: h * 0.22, fill: 'var(--pts-dog)' }));
    s.appendChild(el('path', { d: 'M' + w * 0.08 + ' ' + h * 0.58 + ' q-' + w * 0.06 + ' ' + h * 0.2 + ' ' + w * 0.02 + ' ' + h * 0.34 + ' z', fill: 'var(--pts-skirting)' }));
    s.appendChild(el('path', { d: 'M' + w * 0.1 + ' ' + h * 0.74 + ' q' + w * 0.03 + ' ' + h * 0.04 + ' ' + w * 0.06 + ' 0', fill: 'none', stroke: 'var(--pts-skirting)', 'stroke-width': 5 }));
    s.appendChild(el('path', { d: 'M' + w * 0.92 + ' ' + h * 0.7 + ' q' + w * 0.08 + ' ' + h * 0.1 + ' -' + w * 0.04 + ' ' + h * 0.26, fill: 'none', stroke: 'var(--pts-dog)', 'stroke-width': 14 }));
    return s;
  }

  // The cat, curled up tight beside the dog, its tail round its nose.
  function cat(w, h) {
    var s = svg(w, h);
    s.appendChild(el('ellipse', { cx: w / 2, cy: h * 0.62, rx: w * 0.44, ry: h * 0.36, fill: 'var(--pts-cat)' }));
    s.appendChild(el('circle', { cx: w * 0.26, cy: h * 0.5, r: h * 0.24, fill: 'var(--pts-cat)' }));
    s.appendChild(el('path', { d: 'M' + w * 0.14 + ' ' + h * 0.36 + ' l' + w * 0.03 + ' -' + h * 0.18 + ' l' + w * 0.08 + ' ' + h * 0.12 + ' z', fill: 'var(--pts-cat)' }));
    s.appendChild(el('path', { d: 'M' + w * 0.28 + ' ' + h * 0.3 + ' l' + w * 0.06 + ' -' + h * 0.16 + ' l' + w * 0.06 + ' ' + h * 0.16 + ' z', fill: 'var(--pts-cat)' }));
    s.appendChild(el('path', { d: 'M' + w * 0.18 + ' ' + h * 0.52 + ' q' + w * 0.03 + ' ' + h * 0.03 + ' ' + w * 0.06 + ' 0', fill: 'none', stroke: 'var(--pts-skirting)', 'stroke-width': 4 }));
    s.appendChild(el('path', { d: 'M' + w * 0.9 + ' ' + h * 0.7 + ' Q' + w * 0.6 + ' ' + h * 1.0 + ' ' + w * 0.2 + ' ' + h * 0.78, fill: 'none', stroke: 'var(--pts-dog)', 'stroke-width': 12 }));
    return s;
  }

  // The rabbit, loafing: a loaf of a body, ears laid flat along its back.
  function rabbit(w, h) {
    var s = svg(w, h);
    s.appendChild(el('ellipse', { cx: w * 0.55, cy: h * 0.62, rx: w * 0.38, ry: h * 0.36, fill: 'var(--pts-ink-2)' }));
    s.appendChild(el('circle', { cx: w * 0.24, cy: h * 0.56, r: h * 0.26, fill: 'var(--pts-ink-2)' }));
    s.appendChild(el('ellipse', { cx: w * 0.46, cy: h * 0.34, rx: w * 0.2, ry: h * 0.08, fill: 'var(--pts-ink-2)' }));
    s.appendChild(el('circle', { cx: w * 0.18, cy: h * 0.54, r: 4, fill: 'var(--pts-skirting)' }));
    return s;
  }

  // THE LAMP, OFF: a tall dark stand and shade, in the room's dark inks, and
  // its switch lying on the floor at the end of its cord.
  function lamp(w, h) {
    var s = svg(w, h), cx = w * 0.4;
    s.appendChild(el('path', { fill: 'var(--pts-skirting)', d: 'M' + (cx - 90) + ' 180 L' + (cx - 60) + ' 20 H' + (cx + 60) + ' L' + (cx + 90) + ' 180 Z' }));
    s.appendChild(el('rect', { x: cx - 8, y: 180, width: 16, height: h - 220, fill: 'var(--pts-night)' }));
    s.appendChild(el('ellipse', { cx: cx, cy: h - 24, rx: 80, ry: 22, fill: 'var(--pts-night)' }));
    s.appendChild(el('path', { d: 'M' + cx + ' ' + (h - 30) + ' C' + (cx + 60) + ' ' + (h - 10) + ' ' + (w - 90) + ' ' + (h - 40) + ' ' + (w - 50) + ' ' + (h - 14), fill: 'none', stroke: 'var(--pts-night)', 'stroke-width': 6 }));
    s.appendChild(el('rect', { x: w - 60, y: h - 26, width: 44, height: 20, rx: 6, fill: 'var(--pts-skirting)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['pets.html'] = {
    prefix: 'pts-walk',
    build: function (kit) {
      var F = kit.F;
      var sh = kit.H - 24;
      var BACK = 2600, HALF = 1100, WH = 1400;
      var eye = 110;                            // down on the floor
      var decor = [];

      decor.push(kit.item(wall(2 * HALF + 200, WH, [[300, 220, 260], [620, 140, 160], [880, 90, 100]]), { x: 0, z: BACK, w: 2 * HALF + 200, h: WH }));
      decor.push(kit.item(windowWall(BACK + 400, WH, BACK * 0.45, 900, 620), { x: -HALF, z: BACK / 2 - 200, w: BACK + 400, h: WH, turn: kit.LEFT }));
      decor.push(kit.item(wall(BACK + 400, WH, [[BACK * 0.3, 180, 210]]), { x: HALF, z: BACK / 2 - 200, w: BACK + 400, h: WH, turn: kit.RIGHT }));

      decor.push(kit.item(dog(440, 180), { x: -300, z: 950, w: 440, h: 180 }));
      decor.push(kit.item(cat(230, 130), { x: 0, z: 990, w: 230, h: 130 }));
      decor.push(kit.item(rabbit(200, 125), { x: -720, z: 1650, w: 200, h: 125 }));
      decor.push(kit.item(lamp(460, 1200), { x: HALF - 280, z: BACK - 220, w: 460, h: 1200 }));

      // The page, on the back wall above the skirting.
      var PW = Math.min(kit.W - 160, 860), PH = Math.round(PW * 0.6);
      var page = kit.screen(kit.page, 'Pets’ own page, on the back wall');
      var hung = kit.item(page, { x: -180, z: BACK - 6, w: PW, h: PH, y: 280, cls: 'pts-walk-page' });

      var win = { x: -HALF, z: BACK / 2 - 200 - (BACK + 400) / 2 + BACK * 0.45 + 450, w: 900, h: 800, turn: kit.LEFT };
      var stops = [
        kit.stop({ name: 'down on the floor, the rug in front of you', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'by the dog and the cat, both asleep on the rug', spot: { x: -160, z: 960 - F * 0.6 } }),
        kit.stop({ name: 'by the low window, with the last of the day in it', spot: kit.front(win, 1300) }),
        kit.stop({ name: 'at the back wall, with the room’s own page over the pet flaps', spot: kit.front(hung), link: page }, hung)
      ];

      return {
        cls: 'pts-walk',
        eye: eye,
        horizon: 0.62,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Everybody is asleep. The room’s own page is on the back wall, over the pet flaps.',
        bounds: function () { return { x: [-HALF + 200, HALF - 200], z: [-200, BACK - 400] }; },
        ground: function (g, near, far) {
          kit.quad(g, -5000, 5000, near, far, kit.ink('--pts-floor'));
          var seam = kit.ink('--pts-skirting');
          for (var x = -HALF; x <= HALF; x += 160) kit.quad(g, x - 2, x + 2, Math.max(near, -400), Math.min(far, BACK), seam, 0.5);
          // The rug, where everybody is.
          kit.oval(g, -150, 1050, 760, 520, kit.ink('--pts-rug'));
          kit.oval(g, -150, 1050, 700, 470, kit.ink('--pts-sheen'), 0.12);
          // What comes in at the window lies level across the floor from the
          // left, and fades out before the far side.
          var sky = kit.ink('--pts-sky');
          for (var k = 0; k < 6; k++) kit.quad(g, -HALF, -HALF + 1600 - k * 220, 1300, 2300, sky, 0.04);
        }
      };
    }
  };
})();
