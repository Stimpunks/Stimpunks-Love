/* =============================================================================
   The Healing Checkpoint, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round 1 of the rooms left on Paper Street.

   IT IS ROOM 429 AND NOBODY ELSE'S (§31): a round save room with a spring in
   the floor, cut out of card, and THE LIGHT COMES UP OUT OF THE FLOOR, which no
   other room on the street does. So the spring is the brightest thing here,
   the floor gets lighter towards it, every top surface is dark and every
   underside and every wall's foot carries a rim of the spring's light; the
   dark is overhead, where the dome is. There is no flame, no warm ground (the
   room's one warm value, --hc-clay, is on a cup and nothing bigger), and no
   straight edge on the walls: they stand in a ring.

   THE BED IS BUILT, in its arched alcove across the spring from the door, and
   it is not a reward: nothing here counts, nothing is stored, and nothing in
   this file says what rest is for. The room's own page stands on the curved
   wall to the right, facing the spring.

   NOTHING MOVES and nothing makes a sound. Every colour is one §31 declares,
   by name. It keeps nothing, sends nothing and fetches nothing; its page
   arrives through Paper Street's screen(). tools/make-paper-street.py holds
   each of those.
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

  // A length of the round wall: darkest at the top, lit at its foot by the
  // spring, with the rim of that light along the bottom.
  function wall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--hc-vault)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.55, width: w, height: h * 0.45, fill: 'var(--hc-chamber)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.82, width: w, height: h * 0.18, fill: 'var(--hc-lit)' }));
    s.appendChild(el('rect', { x: 0, y: h - 8, width: w, height: 8, fill: 'var(--hc-glim)' }));
    return s;
  }

  // The alcove at the back with the bed built into it. Its top is dark; the
  // spring's light catches it underneath.
  function alcove(w, h) {
    var s = svg(w, h), aw = w * 0.7, ax = (w - aw) / 2, spring = h * 0.32;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--hc-vault)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.82, width: w, height: h * 0.18, fill: 'var(--hc-lit)' }));
    s.appendChild(el('path', { fill: 'var(--hc-alcove)',
      d: 'M' + ax + ' ' + h + ' V' + spring + ' A' + aw / 2 + ' ' + aw / 2 + ' 0 0 1 ' + (ax + aw) + ' ' + spring + ' V' + h + ' Z' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--hc-glim)', 'stroke-width': 4, 'stroke-opacity': '0.5',
      d: 'M' + ax + ' ' + h + ' V' + spring + ' A' + aw / 2 + ' ' + aw / 2 + ' 0 0 1 ' + (ax + aw) + ' ' + spring + ' V' + h }));
    // The bed: a soft mattress on a rounded base, a pillow, a blanket.
    var bx = ax + 40, bw = aw - 80, by = h * 0.66;
    s.appendChild(el('rect', { x: bx, y: by + 70, width: bw, height: h - by - 70, rx: 30, fill: 'var(--hc-chamber)' }));
    s.appendChild(el('rect', { x: bx + 10, y: h - 12, width: bw - 20, height: 6, rx: 3, fill: 'var(--hc-glim)' }));
    s.appendChild(el('rect', { x: bx - 6, y: by, width: bw + 12, height: 90, rx: 40, fill: 'var(--hc-lit)' }));
    s.appendChild(el('rect', { x: bx + 4, y: by + 82, width: bw - 8, height: 6, rx: 3, fill: 'var(--hc-glim)', 'fill-opacity': '0.8' }));
    s.appendChild(el('rect', { x: bx + 24, y: by - 34, width: bw * 0.26, height: 50, rx: 25, fill: 'var(--hc-chamber)' }));
    s.appendChild(el('rect', { x: bx + 28, y: by + 12, width: bw * 0.26 - 8, height: 4, rx: 2, fill: 'var(--hc-dim)' }));
    s.appendChild(el('path', { fill: 'var(--hc-alcove)', d: 'M' + (bx + bw * 0.36) + ' ' + (by + 6) + ' Q' + (bx + bw * 0.7) + ' ' + (by - 30) +
      ' ' + (bx + bw - 10) + ' ' + (by + 10) + ' V' + (by + 60) + ' H' + (bx + bw * 0.36) + ' Z' }));
    // A clay cup on the ledge by the bed: the room's one warm value.
    s.appendChild(el('rect', { x: ax + aw - 30, y: by - 70, width: 40, height: 48, rx: 8, fill: 'var(--hc-clay)' }));
    s.appendChild(el('rect', { x: ax + aw - 40, y: by - 22, width: 70, height: 10, fill: 'var(--hc-lit)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['healing-checkpoint.html'] = {
    prefix: 'hc-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var eye = sh / 2;
      var R = 1500, C = R + 80;                  // the ring's radius and the spring at its centre
      var WH = Math.max(900, sh + 340);
      var N = 16, WW = 2 * R * Math.sin(Math.PI / N) + 30;
      var decor = [];
      var on = function (phi, r) { return { x: r * Math.sin(phi), z: C - r * Math.cos(phi), turn: phi + Math.PI }; };

      // The ring of wall, open where the door is behind you; the alcove takes
      // the length of it across the spring.
      for (var k = 2; k < N - 1; k++) {
        if (k === N / 2) continue;
        var p = on(k / N * Math.PI * 2, R);
        decor.push(kit.item(wall(WW, WH), { x: p.x, z: p.z, w: WW, h: WH, turn: p.turn }));
      }
      var a = on(Math.PI, R - 10);
      var bed = kit.item(alcove(1100, WH), { x: a.x, z: a.z, w: 1100, h: WH, turn: a.turn });

      var page = kit.screen(kit.page, 'The Healing Checkpoint’s own page, on the curved wall');
      var pp = on(Math.PI * 0.64, R - 60);
      var leaf = kit.item(page, { x: pp.x, z: pp.z, w: sw, h: sh, turn: pp.turn, cls: 'hc-walk-wall' });

      var stops = [
        kit.stop({ name: 'inside the door of room 429, the spring ahead of you', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the edge of the spring, its light coming up past you', spot: { x: 0, z: C - 520 } }),
        kit.stop({ name: 'at the bed in its alcove, which nobody is charging you for', spot: kit.front(bed, F * 1.3) }, bed),
        kit.stop({ name: 'at the curved wall, with the room’s own page on it', spot: kit.front(leaf), link: page }, leaf)
      ];

      return {
        cls: 'hc-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The spring is in the floor ahead of you, the bed in its alcove beyond it, and the room’s own page on the wall to the right.',
        bounds: function () { return { x: [-R + 420, R - 420], z: [0, C + R - 420] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--hc-vault'));
          // The floor lighter towards the spring, in rings.
          kit.oval(g, 0, C, R, R, kit.ink('--hc-chamber'));
          kit.oval(g, 0, C, R * 0.72, R * 0.72, kit.ink('--hc-lit'));
          // The spring itself, and its light, the brightest thing in the room.
          kit.oval(g, 0, C, 420, 420, kit.ink('--hc-glim'), 0.35);
          kit.oval(g, 0, C, 330, 330, kit.ink('--hc-spring'));
          kit.oval(g, 0, C, 260, 260, kit.ink('--hc-glim'), 0.5);
          kit.oval(g, 0, C, 150, 150, kit.ink('--hc-steam'), 0.35);
        }
      };
    }
  };
})();
