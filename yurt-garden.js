/* Join the faeries and Grow a garden, the Faery Yurt's two switches, Helen's ask,
   2026-10-14. Nothing here moves until somebody presses, and then it moves at
   every setting of the dial, because the press is the asking (the Arcade's rule).
   Press again and it stops and goes. Everything is driven from here rather than
   from CSS, because §3 takes CSS animation away at Gentle and somebody who asked
   for the garden at Gentle still asked for it.

   THE GARDEN GROWS ON THE PAGE, ROUND THE WORDS, NEVER OVER THEM (Helen's ask).
   It is drawn into the page itself, not over the window, along the top of the
   page, the foot of it, the empty margins either side, and along the green
   sprigs and the gaps between the sections: tangled ivy, small
   flowers in many colours, red and brown toadstools in the ivy, and mushrooms
   coming up out of the bottom. Before it
   draws it measures every paragraph, heading, link, button, label and picture,
   and a vine that reaches one stops there; a leaf or a flower that would touch
   one is left off. Most of it has grown in about twenty seconds, and then for
   about two minutes more it goes on slowly, adding more ivy and leaves, more
   flowers and more mushrooms. If the page changes shape
   it is drawn again round the new shape, from the same seed, so it is the same
   garden. THE FAERIES drift across the window, every one a different size and
   a different muted colour, with their wings going, and at MAX GLITTER much
   brighter, leaving a trail of stars that fade; nothing flashes. Both
   are aria-hidden decoration that the pointer passes through. It stores nothing
   and sends nothing: next time both are off. */
(function () {
  'use strict';
  var box = document.querySelector('[data-yurt-magic]');
  if (!box) return;
  var NS = 'http://www.w3.org/2000/svg';
  var QUICK = 20;          // seconds by which most of the garden has grown
  var GROW = 140;          // seconds until the last of it has, two minutes after
  var says = box.querySelector('[data-yurt-magic-says]');
  var btnF = box.querySelector('[data-yurt-magic-faeries]');
  var btnG = box.querySelector('[data-yurt-magic-garden]');
  var faeries = null, garden = null, grown = 0, last = 0, frame = 0, seed = 1;

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function say(t) { says.textContent = ''; setTimeout(function () { says.textContent = t; }, 50); }
  function layer(cls) {
    var d = document.createElement('div');
    d.className = cls;
    d.setAttribute('aria-hidden', 'true');
    document.body.appendChild(d);
    return d;
  }
  function ease(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }

  /* ── The garden ──────────────────────────────────────────────────────────── */
  var rnd = Math.random;
  function seeded(s) {           // mulberry32: the same seed draws the same garden
    return function () {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      var t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function rand(a, b) { return a + rnd() * (b - a); }
  function pick(list) { return list[Math.floor(rnd() * list.length)]; }
  var LEAF = 'M0 0 C-5 -3 -8 -9 -5 -14 C-3 -11 -1 -11 0 -13 C1 -11 3 -11 5 -14 C8 -9 5 -3 0 0 Z';
  var GREENS = ['#6D8A56', '#5A7848', '#7E9A64'];
  var PETALS = ['#D9B8C4', '#E8DCC4', '#B9A9D0', '#C9A0A0', '#E3C9A8',
    '#E8C547', '#8FB3D9', '#C9564F', '#9A7CC4', '#E28AA8', '#E0904A'];
  var IVY_CAPS = ['#C9564F', '#C9564F', '#8A5A3C', '#A0703F'];   // red and brown toadstools in the ivy
  var WORDS = 'p, h1, h2, h3, h4, h5, li, a, button, label, summary, figcaption, blockquote, dt, dd, ' +
    'input, textarea, select, img, iframe, video, svg, .facade, .egg__label, .glimmer__hint, .dial, .sr-only';

  // Everything the garden must not touch, in page coordinates, with room round it.
  function obstacles() {
    var out = [], sx = window.scrollX, sy = window.scrollY;
    document.querySelectorAll(WORDS).forEach(function (n) {
      if (n.closest('.yurt-garden, .yurt-faeries, .sprig')) return;   // the green sprigs are for growing along
      var r = n.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      out.push({ l: r.left + sx - 8, t: r.top + sy - 8, r: r.right + sx + 8, b: r.bottom + sy + 8 });
    });
    return out;
  }
  function blocked(obs, x, y, pad) {
    for (var i = 0; i < obs.length; i++) {
      var o = obs[i];
      if (x > o.l - pad && x < o.r + pad && y > o.t - pad && y < o.b + pad) return true;
    }
    return false;
  }
  function line(pts) { return 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L'); }

  // A vine across the page, wandering inside a band at its top (down = 1) or its foot.
  function across(W, H, down, band) {
    var pts = [], fromLeft = rnd() < .5, y0 = rand(6, band);
    var a1 = rand(6, 16), l1 = rand(50, 110), f1 = rand(0, 6.3), a2 = rand(3, 8), l2 = rand(18, 34);
    for (var x = -12; x <= W + 12; x += 6) {
      var y = Math.max(3, Math.min(band + 14, y0 + a1 * Math.sin(x / l1 + f1) + a2 * Math.sin(x / l2)));
      pts.push([fromLeft ? x : W - x, down > 0 ? y : H - y]);
    }
    return pts;
  }
  // A vine along a line across the page at y, from x0 to x1, waving a little.
  function wave(x0, x1, y, amp) {
    var pts = [], f = rand(0, 6.3), l = rand(16, 30), fromLeft = rnd() < .5;
    for (var x = x0; x <= x1; x += 6) {
      pts.push([fromLeft ? x : x0 + x1 - x, y + amp * Math.sin(x / l + f) + 2 * Math.sin(x / 7)]);
    }
    return pts;
  }
  // A strand going down from y0 (down = 1) or up (down = -1), wandering about x0
  // inside [lo, hi].
  function strand(x0, y0, down, length, lo, hi) {
    var pts = [], f = rand(0, 6.3), a = Math.min(10, (hi - lo) / 2), l = rand(14, 40);
    for (var t = 0; t <= length; t += 6) {
      pts.push([Math.max(lo, Math.min(hi, x0 + a * Math.sin(t / l + f) + 3 * Math.sin(t / 9))), y0 + down * t]);
    }
    return pts;
  }
  function flower(g, x, y, size, c) {
    var f = el('g', { transform: 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(0)' }, g);
    for (var i = 0; i < 5; i++) {
      var an = i * 1.2566;
      el('circle', { cx: (Math.cos(an) * size * .55).toFixed(2), cy: (Math.sin(an) * size * .55).toFixed(2), r: (size * .42).toFixed(2), fill: c }, f);
    }
    el('circle', { r: (size * .28).toFixed(2), fill: '#E9C874' }, f);
    return f;
  }
  // A vine is cut wherever it meets something it must not cover; each piece that
  // is left is a run, timed as its share of the whole vine.
  function vine(svg, obs, pts, start, dur, bloom) {
    var runs = [], cur = [], n = pts.length;
    function close() { if (cur.length >= 3) runs.push(cur); cur = []; }
    pts.forEach(function (p, i) { if (blocked(obs, p[0], p[1], 3)) close(); else cur.push([p[0], p[1], i / (n - 1)]); });
    close();
    var width = rand(1.6, 2.6).toFixed(1);
    return runs.map(function (run) {
      var g = el('g', {}, svg);
      var stem = el('path', { d: line(run), fill: 'none', stroke: '#4F6638', 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      var len = stem.getTotalLength() || 1, bits = [], a0 = run[0][2], a1 = run[run.length - 1][2];
      stem.setAttribute('stroke-dasharray', len.toFixed(1));
      stem.setAttribute('stroke-dashoffset', len.toFixed(1));
      for (var d = 6, k = 0; d < len; d += rand(10, 16), k++) {
        var p = stem.getPointAtLength(d), q = stem.getPointAtLength(Math.min(len, d + 1));
        var turn = Math.atan2(q.y - p.y, q.x - p.x) * 57.3 + (k % 2 ? 90 : -90);
        var r = rnd();
        if (r < .06) {
          var ms = rand(8, 12);
          if (blocked(obs, p.x, p.y - ms, ms * 1.3)) continue;
          var t = toadstool(g, p.x, p.y, ms, pick(IVY_CAPS), 0);
          bits.push({ el: t.el, at: d / len, x: p.x, y: p.y, turn: 0, size: 1 });
        } else if (r < .06 + (bloom || .15)) {
          if (blocked(obs, p.x, p.y, 7)) continue;
          bits.push({ el: flower(g, p.x, p.y, rand(3.2, 5.2), pick(PETALS)), at: d / len, x: p.x, y: p.y, turn: 0, size: 1 });
        } else {
          var tip = (turn - 90) / 57.3, tx = p.x + Math.cos(tip) * 12, ty = p.y + Math.sin(tip) * 12;
          if (blocked(obs, p.x, p.y, 4) || blocked(obs, tx, ty, 2)) continue;
          var leaf = el('path', { d: LEAF, fill: pick(GREENS), stroke: '#38491F', 'stroke-width': '.7',
            transform: 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ') rotate(' + turn.toFixed(0) + ') scale(0)' }, g);
          bits.push({ el: leaf, at: d / len, x: p.x, y: p.y, turn: turn, size: rand(.7, 1.15) });
        }
      }
      return { stem: stem, len: len, bits: bits, next: 0,
        start: start + a0 * dur, dur: Math.max(.5, (a1 - a0) * dur) };
    });
  }
  function toadstool(svg, x, base, size, cap, start) {
    var g = el('g', { transform: 'translate(' + x.toFixed(1) + ' ' + base.toFixed(1) + ') scale(0)' }, svg);
    el('rect', { x: -size * .18, y: -size * .9, width: size * .36, height: size * .9, rx: size * .12, fill: '#E8DCC4' }, g);
    el('path', { d: 'M' + (-size * .7) + ' ' + (-size * .8) + ' Q0 ' + (-size * 1.9) + ' ' + (size * .7) + ' ' + (-size * .8) + ' Q0 ' + (-size * 1.05) + ' ' + (-size * .7) + ' ' + (-size * .8) + ' Z', fill: cap }, g);
    if (cap === '#C9564F' || cap === '#8A5A3C') {
      el('circle', { cx: -size * .3, cy: -size * 1.15, r: size * .1, fill: '#F2E6D4' }, g);
      el('circle', { cx: size * .2, cy: -size * 1.3, r: size * .09, fill: '#F2E6D4' }, g);
      el('circle', { cx: 0, cy: -size * 1.05, r: size * .07, fill: '#F2E6D4' }, g);
    }
    return { el: g, x: x, y: base, start: start, dur: 5 };
  }
  function buildGarden() {
    if (garden) garden.box.remove();
    rnd = seeded(seed);
    var doc = document.documentElement;
    var W = doc.clientWidth, H = Math.max(doc.scrollHeight, document.body.scrollHeight), view = window.innerHeight;
    var obs = obstacles();
    var main = document.querySelector('main') || document.body, mr = main.getBoundingClientRect();
    var gutL = Math.max(0, mr.left + window.scrollX), gutR = Math.max(0, W - (mr.right + window.scrollX));
    var band = 60;
    var box = layer('yurt-garden');
    box.style.width = W + 'px'; box.style.height = H + 'px';
    var svg = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, box);
    var runs = [], shrooms = [];
    function add(list) { runs.push.apply(runs, list); }

    [1, -1].forEach(function (down) {
      var edge = down > 0 ? 0 : H;
      // The tangle along the top and the foot: in the first twenty seconds.
      for (var i = 0; i < 3; i++) add(vine(svg, obs, across(W, H, down, band), i * 1.2 + rand(0, .8), rand(10, 14)));
      var drops = Math.max(4, Math.round(W / 130));
      for (var j = 0; j < drops; j++) {
        var x = (j + rand(.2, .8)) * W / drops;
        add(vine(svg, obs, strand(x, edge + down * rand(4, band), down, rand(40, 160), 4, W - 4), rand(2, 9), rand(6, 10)));
      }
      // Then, for two minutes, more of it, slowly: more ivy through the tangle,
      // more strands, and more flowers on them than on the first.
      for (var t = 0; t < 3; t++) add(vine(svg, obs, across(W, H, down, band), rand(QUICK, GROW - 45), rand(25, 40), .3));
      for (var u = 0; u < drops; u++) {
        var lx = (u + rand(.1, .9)) * W / drops;
        add(vine(svg, obs, strand(lx, edge + down * rand(4, band), down, rand(30, 120), 4, W - 4), rand(QUICK, GROW - 25), rand(12, 20), .3));
      }
      // Down the margins: quickly at first, then on and on, very slowly.
      [[4, gutL - 4], [W - gutR + 4, W - 4]].forEach(function (side) {
        if (side[1] - side[0] < 8) side = down > 0 ? [4, 18] : [W - 18, W - 4];
        var mid = (side[0] + side[1]) / 2;
        add(vine(svg, obs, strand(mid, edge, down, Math.min(H, view * 1.2), side[0], side[1]), rand(0, 3), rand(14, 17)));
        add(vine(svg, obs, strand(mid + rand(-6, 6), edge, down, H, side[0], side[1]), rand(QUICK - 2, QUICK + 8), rand(100, 108), .22));
      });
    });
    // Along every green sprig, and across every gap between the sections, under
    // the words: some at once, and more of it through the two minutes after.
    var mx0 = mr.left + window.scrollX, mx1 = mr.right + window.scrollX, lines = [];
    document.querySelectorAll('.sprig svg').forEach(function (s) {
      var r = s.getBoundingClientRect(), y = r.top + window.scrollY + r.height / 2, cx = r.left + window.scrollX + r.width / 2;
      lines.push([Math.max(mx0 + 8, cx - r.width * .9), Math.min(mx1 - 8, cx + r.width * .9), y, 8]);
    });
    // Between sections: the open space where one section's last words end and
    // the next one's first words start, measured from the words themselves.
    var inCol = obs.filter(function (o) { return o.r > mx0 && o.l < mx1; });
    Array.prototype.forEach.call(main.children, function (n, i) {
      if (!i || n.classList.contains('sprig') || (n.previousElementSibling || {}).classList.contains('sprig')) return;
      var at = n.getBoundingClientRect().top + window.scrollY, lower = Infinity, upper = -Infinity;
      inCol.forEach(function (o) { if (o.t >= at - 40 && o.t < lower) lower = o.t; });
      inCol.forEach(function (o) { if (o.b <= lower && o.b > upper) upper = o.b; });
      var gap = lower - upper;
      if (gap >= 22 && gap < 400) lines.push([mx0 + 12, mx1 - 12, (upper + lower) / 2, Math.min(7, gap / 2 - 9)]);
    });
    lines.forEach(function (ln) {
      add(vine(svg, obs, wave(ln[0], ln[1], ln[2], ln[3]), rand(3, 11), rand(6, 9), .2));
      add(vine(svg, obs, wave(ln[0], ln[1], ln[2] + rand(-3, 3), ln[3]), rand(QUICK, GROW - 30), rand(15, 25), .3));
    });
    // Mushrooms out of the foot of the page, and more later, slowly.
    var caps = ['#C9564F', '#C9564F', '#E0904A', '#8A5A3C', '#E8DCC4'], spots = Math.max(5, Math.round(W / 90));
    for (var k = 0; k < spots; k++) {
      var cx = (k + rand(.1, .9)) * W / spots;
      [[rand(9, 24), rand(4, 15)], [rand(7, 13), rand(QUICK + 5, GROW - 6)], [rand(6, 11), rand(QUICK + 5, GROW - 6)]].forEach(function (m, n) {
        var x = cx + (n === 2 ? -1 : 1) * (n ? rand(8, 16) : 0), size = m[0];
        if (n && rnd() < .25) return;
        if (blocked(obs, x, H - size, size)) return;
        shrooms.push(toadstool(svg, x, H - 1, size, pick(caps), m[1]));
      });
    }
    garden = { box: box, runs: runs, shrooms: shrooms, height: H, width: W };
    drawGarden();
  }
  function drawGarden() {
    garden.runs.forEach(function (v) {
      if (v.done) return;
      var p = (grown - v.start) / v.dur;
      if (p <= 0) return;
      p = Math.min(1, p);
      v.stem.setAttribute('stroke-dashoffset', (v.len * (1 - p)).toFixed(1));
      for (var i = v.next; i < v.bits.length; i++) {
        var b = v.bits[i];
        if (b.at > p) break;
        var g = ease((p - b.at) * v.len / 30);
        b.el.setAttribute('transform', 'translate(' + b.x.toFixed(1) + ' ' + b.y.toFixed(1) + ') rotate(' + b.turn.toFixed(0) + ') scale(' + (g * b.size).toFixed(3) + ')');
        if (g >= 1 && i === v.next) v.next++;
      }
      if (p >= 1 && v.next >= v.bits.length) v.done = true;
    });
    garden.shrooms.forEach(function (m) {
      if (m.done) return;
      var s = ease((grown - m.start) / m.dur);
      m.el.setAttribute('transform', 'translate(' + m.x.toFixed(1) + ' ' + m.y.toFixed(1) + ') scale(' + s.toFixed(3) + ')');
      if (s >= 1) m.done = true;
    });
  }

  /* ── The faeries: every one a different size and a different muted colour ── */
  var TINTS = ['#C9A0A0', '#A3B59A', '#A99BC2', '#93A7B8', '#CDB98A', '#B897A8', '#B7A48E'];
  function faeryDrawing(i, tint) {
    return '<defs><radialGradient id="yf-glow-' + i + '"><stop offset="0" stop-color="' + tint + '" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="' + tint + '" stop-opacity="0"/></radialGradient></defs>' +
      '<circle class="yurt-faery__glow" r="15" fill="url(#yf-glow-' + i + ')"/>' +
      '<g class="yurt-faery__wings" fill="' + tint + '" fill-opacity=".55" stroke="#F2E6D4" stroke-opacity=".45" stroke-width=".6">' +
      '<ellipse cx="-6" cy="-4" rx="6" ry="3.6" transform="rotate(-30 -6 -4)"/><ellipse cx="6" cy="-4" rx="6" ry="3.6" transform="rotate(30 6 -4)"/>' +
      '<ellipse cx="-4.5" cy="3" rx="4" ry="2.4" transform="rotate(25 -4.5 3)"/><ellipse cx="4.5" cy="3" rx="4" ry="2.4" transform="rotate(-25 4.5 3)"/></g>' +
      '<ellipse cy="2" rx="1.8" ry="4" fill="' + tint + '"/><circle cy="-4" r="2" fill="#F2E6D4"/>';
  }
  function buildFaeries() {
    var box = layer('yurt-faeries');
    var many = window.innerWidth < 600 ? 5 : 7, list = [];
    var tints = TINTS.slice().sort(function () { return Math.random() - .5; });
    for (var i = 0; i < many; i++) {
      var size = Math.round(26 + Math.random() * 42);
      var svg = el('svg', { class: 'yurt-faery', width: size, height: size, viewBox: '-20 -20 40 40' }, box);
      svg.innerHTML = faeryDrawing(i, tints[i % tints.length]);
      list.push({ el: svg, size: size, tint: tints[i % tints.length], wings: svg.querySelector('.yurt-faery__wings'),
        glow: svg.querySelector('.yurt-faery__glow'), heart: svg.querySelector('stop'), trail: 0,
        bx: .15 + Math.random() * .7, by: .15 + Math.random() * .7,
        ax: .12 + Math.random() * .22, ay: .08 + Math.random() * .2,
        px: 40 + Math.random() * 50, py: 30 + Math.random() * 45,
        fx: Math.random() * 6.28, fy: Math.random() * 6.28, wing: .8 + Math.random() * .5 });
    }
    faeries = { box: box, list: list, t: 0, stars: [], bright: null };
  }
  /* AT MAX GLITTER THE FAERIES ARE MUCH BRIGHTER AND LEAVE A TRAIL OF STARS,
     Helen's ask. Each star is a small four-pointed sparkle that drifts down a
     little and fades out over a second and a half: it never blinks on and off,
     so nothing flashes. At Gentle and Regular there is no trail. */
  var STAR = 'M0 -5 C.6 -1.2 1.2 -.6 5 0 C1.2 .6 .6 1.2 0 5 C-.6 1.2 -1.2 .6 -5 0 C-1.2 -.6 -.6 -1.2 0 -5 Z';
  var STARS = ['#F2E6D4', '#E9C874', '#F2B673'];
  function glitter() { return document.documentElement.getAttribute('data-intensity') === 'max'; }
  function brighten(on) {
    faeries.bright = on;
    faeries.list.forEach(function (f) {
      f.glow.setAttribute('r', on ? '19' : '15');
      f.heart.setAttribute('stop-opacity', on ? '.95' : '.5');
      f.heart.setAttribute('stop-color', on ? '#F2E6D4' : f.tint);
    });
  }
  function trail(dt, W, H) {
    var on = glitter();
    if (on !== faeries.bright) brighten(on);
    if (on) faeries.list.forEach(function (f) {
      f.trail += dt;
      if (f.trail < .11) return;
      f.trail = 0;
      var size = 6 + Math.random() * 8;
      var svg = el('svg', { class: 'yurt-faery__star', width: size, height: size, viewBox: '-6 -6 12 12' }, faeries.box);
      el('path', { d: STAR, fill: STARS[Math.floor(Math.random() * STARS.length)] }, svg);
      faeries.stars.push({ el: svg, x: f.x - size / 2 + (Math.random() - .5) * 8, y: f.y - size / 2 + (Math.random() - .5) * 8, age: 0 });
    });
    faeries.stars = faeries.stars.filter(function (s) {
      s.age += dt;
      if (s.age >= 1.5) { s.el.remove(); return false; }
      s.y += dt * 9;
      s.el.style.left = s.x.toFixed(1) + 'px';
      s.el.style.top = s.y.toFixed(1) + 'px';
      s.el.style.opacity = (1 - s.age / 1.5).toFixed(3);
      return true;
    });
  }
  function drawFaeries() {
    var W = window.innerWidth, H = window.innerHeight, t = faeries.t;
    faeries.list.forEach(function (f) {
      var half = f.size / 2;
      var x = (f.bx + f.ax * Math.sin(6.283 * t / f.px + f.fx)) * W;
      var y = (f.by + f.ay * Math.sin(6.283 * t / f.py + f.fy)) * H + 6 * Math.sin(t * 1.3 + f.fx);
      var left = Math.max(0, Math.min(W - f.size, x - half)), top = Math.max(0, Math.min(H - f.size, y - half));
      f.x = left + half; f.y = top + half;
      f.el.style.left = left.toFixed(1) + 'px';
      f.el.style.top = top.toFixed(1) + 'px';
      f.wings.setAttribute('transform', 'scale(' + (0.7 + 0.3 * Math.abs(Math.sin(t * 6.283 * f.wing))).toFixed(3) + ' 1)');
    });
  }

  /* ── One loop for both, which stops when neither is on or the tab is hidden ── */
  function tick(now) {
    var dt = last ? Math.min(.1, (now - last) / 1000) : 0;
    last = now;
    if (garden && grown < GROW) { grown += dt; drawGarden(); }
    if (faeries) { faeries.t += dt; drawFaeries(); trail(dt); }
    frame = (faeries || (garden && grown < GROW)) ? requestAnimationFrame(tick) : 0;
    if (!frame) last = 0;
  }
  function run() { if (!frame) { last = 0; frame = requestAnimationFrame(tick); } }

  btnF.addEventListener('click', function () {
    if (faeries) {
      faeries.box.remove(); faeries = null;
      btnF.setAttribute('aria-pressed', 'false');
      say('The faeries have gone.');
    } else {
      buildFaeries(); drawFaeries(); run();
      btnF.setAttribute('aria-pressed', 'true');
      say('Faeries are drifting across the page. Press again to say goodbye.');
    }
  });
  btnG.addEventListener('click', function () {
    if (garden) {
      garden.box.remove(); garden = null; grown = 0;
      btnG.setAttribute('aria-pressed', 'false');
      say('The garden has gone.');
    } else {
      grown = 0; seed = Math.floor(Math.random() * 4294967296); buildGarden(); run();
      btnG.setAttribute('aria-pressed', 'true');
      say('Ivy, flowers and mushrooms are starting to grow round the edges of the page. Press again to clear them.');
    }
  });
  // The page changes shape when a window or a book opens, a picture arrives or
  // the window is resized; the garden is drawn again round the new shape.
  var reshaped = 0;
  function reshape() {
    clearTimeout(reshaped);
    reshaped = setTimeout(function () {
      if (!garden) return;
      var doc = document.documentElement;
      if (doc.clientWidth === garden.width && Math.max(doc.scrollHeight, document.body.scrollHeight) === garden.height) return;
      buildGarden(); run();
    }, 400);
  }
  window.addEventListener('resize', reshape);
  if (window.ResizeObserver) new ResizeObserver(reshape).observe(document.body);
  document.addEventListener('toggle', reshape, true);
  document.addEventListener('click', reshape, true);
  box.hidden = false;
})();
