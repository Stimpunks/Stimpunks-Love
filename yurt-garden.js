/* Join the faeries and Grow a garden, the Faery Yurt's two switches, Helen's ask,
   2026-10-14. Nothing here moves until somebody presses, and then it moves at
   every setting of the dial, because the press is the asking (the Arcade's rule).
   Press again and it stops and goes. Everything is driven from here rather than
   from CSS, because §3 takes CSS animation away at Gentle and somebody who asked
   for the garden at Gentle still asked for it. The ivy creeps down both edges of
   the window and the toadstools come up in the bottom corners, very slowly; the
   faeries drift across the page with their wings going, and nothing flashes.
   Both layers are aria-hidden decoration that the pointer passes through. It
   stores nothing and sends nothing: next time both are off. */
(function () {
  'use strict';
  var box = document.querySelector('[data-yurt-magic]');
  if (!box) return;
  var NS = 'http://www.w3.org/2000/svg';
  var GROW = 150;          // seconds for the ivy to reach the foot of the window
  var says = box.querySelector('[data-yurt-magic-says]');
  var btnF = box.querySelector('[data-yurt-magic-faeries]');
  var btnG = box.querySelector('[data-yurt-magic-garden]');
  var faeries = null, garden = null, grown = 0, last = 0, frame = 0;

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

  /* ── The garden ──────────────────────────────────────────────────────────── */
  var LEAF = 'M0 0 C-5 -3 -8 -9 -5 -14 C-3 -11 -1 -11 0 -13 C1 -11 3 -11 5 -14 C8 -9 5 -3 0 0 Z';
  function vine(svg, side, W, H) {
    var g = el('g', {}, svg), pts = [], leaves = [];
    var edge = side < 0 ? 12 : W - 12;
    for (var y = -10; y <= H + 10; y += 6) pts.push([edge + side * -1 * (6 * Math.sin(y / 55) + 3 * Math.sin(y / 23)), y]);
    var d = 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L');
    var stem = el('path', { d: d, fill: 'none', stroke: '#38491F', 'stroke-width': '2.4', 'stroke-linecap': 'round' }, g);
    var len = stem.getTotalLength();
    stem.setAttribute('stroke-dasharray', len);
    stem.setAttribute('stroke-dashoffset', len);
    for (var i = 2, n = 0; i < pts.length; i += 6, n++) {
      var p = pts[i], out = n % 2 ? 1 : -1;
      var lx = Math.max(4, Math.min(W - 4, p[0] + out * 2));
      var leaf = el('path', { d: LEAF, fill: n % 3 ? '#6D8A56' : '#5A7848', stroke: '#38491F', 'stroke-width': '.8',
        transform: 'translate(' + lx.toFixed(1) + ' ' + p[1].toFixed(1) + ') rotate(' + (out * 70 + 180) + ') scale(0)' }, g);
      leaves.push({ el: leaf, at: p[1] / H, x: lx, y: p[1], turn: out * 70 + 180 });
    }
    return { stem: stem, len: len, leaves: leaves };
  }
  function toadstool(svg, x, base, size, cap, at) {
    var g = el('g', { transform: 'translate(' + x + ' ' + base + ') scale(0)' }, svg);
    el('rect', { x: -size * .18, y: -size * .9, width: size * .36, height: size * .9, rx: size * .12, fill: '#E8DCC4' }, g);
    el('path', { d: 'M' + (-size * .7) + ' ' + (-size * .8) + ' Q0 ' + (-size * 1.9) + ' ' + (size * .7) + ' ' + (-size * .8) + ' Q0 ' + (-size * 1.05) + ' ' + (-size * .7) + ' ' + (-size * .8) + ' Z', fill: cap }, g);
    if (cap === '#C9564F') {
      el('circle', { cx: -size * .3, cy: -size * 1.15, r: size * .1, fill: '#F2E6D4' }, g);
      el('circle', { cx: size * .2, cy: -size * 1.3, r: size * .09, fill: '#F2E6D4' }, g);
      el('circle', { cx: 0, cy: -size * 1.05, r: size * .07, fill: '#F2E6D4' }, g);
    }
    return { el: g, x: x, y: base, at: at };
  }
  function buildGarden() {
    if (garden) garden.box.remove();
    var W = window.innerWidth, H = window.innerHeight;
    var box = layer('yurt-garden');
    var svg = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H }, box);
    var vines = [vine(svg, -1, W, H), vine(svg, 1, W, H)];
    var shrooms = [
      toadstool(svg, 22, H - 2, 22, '#C9564F', .45), toadstool(svg, 44, H - 2, 15, '#E0904A', .62),
      toadstool(svg, 8, H - 2, 11, '#C9564F', .78),
      toadstool(svg, W - 24, H - 2, 24, '#C9564F', .5), toadstool(svg, W - 48, H - 2, 13, '#C9564F', .7),
      toadstool(svg, W - 10, H - 2, 12, '#E0904A', .85)
    ];
    garden = { box: box, vines: vines, shrooms: shrooms };
    drawGarden();
  }
  function ease(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  function drawGarden() {
    var t = Math.min(1, grown / GROW);
    garden.vines.forEach(function (v) {
      v.stem.setAttribute('stroke-dashoffset', (v.len * (1 - t)).toFixed(1));
      v.leaves.forEach(function (l) {
        var s = ease((t - l.at) * 14);
        l.el.setAttribute('transform', 'translate(' + l.x.toFixed(1) + ' ' + l.y.toFixed(1) + ') rotate(' + l.turn + ') scale(' + s.toFixed(3) + ')');
      });
    });
    garden.shrooms.forEach(function (m) {
      var s = ease((t - m.at) * 5);
      m.el.setAttribute('transform', 'translate(' + m.x + ' ' + m.y + ') scale(' + s.toFixed(3) + ')');
    });
  }

  /* ── The faeries ─────────────────────────────────────────────────────────── */
  var FAERY = '<g class="yurt-faery__glow"><circle r="15" fill="url(#yf-glow)"/></g>' +
    '<g class="yurt-faery__wings" fill="#F2E6D4" fill-opacity=".5" stroke="#E9C874" stroke-opacity=".7" stroke-width=".7">' +
    '<ellipse cx="-6" cy="-4" rx="6" ry="3.6" transform="rotate(-30 -6 -4)"/><ellipse cx="6" cy="-4" rx="6" ry="3.6" transform="rotate(30 6 -4)"/>' +
    '<ellipse cx="-4.5" cy="3" rx="4" ry="2.4" transform="rotate(25 -4.5 3)"/><ellipse cx="4.5" cy="3" rx="4" ry="2.4" transform="rotate(-25 4.5 3)"/></g>' +
    '<ellipse cy="2" rx="1.8" ry="4" fill="#F2B673"/><circle cy="-4" r="2" fill="#F2E6D4"/>';
  function buildFaeries() {
    var box = layer('yurt-faeries');
    var many = window.innerWidth < 600 ? 4 : 6, list = [];
    for (var i = 0; i < many; i++) {
      var svg = el('svg', { class: 'yurt-faery', width: '40', height: '40', viewBox: '-20 -20 40 40' }, box);
      svg.innerHTML = '<defs><radialGradient id="yf-glow-' + i + '"><stop offset="0" stop-color="#E9C874" stop-opacity=".55"/><stop offset="1" stop-color="#E9C874" stop-opacity="0"/></radialGradient></defs>' +
        FAERY.replace('yf-glow', 'yf-glow-' + i);
      list.push({ el: svg, wings: svg.querySelector('.yurt-faery__wings'),
        bx: .15 + Math.random() * .7, by: .15 + Math.random() * .7,
        ax: .12 + Math.random() * .22, ay: .08 + Math.random() * .2,
        px: 40 + Math.random() * 50, py: 30 + Math.random() * 45,
        fx: Math.random() * 6.28, fy: Math.random() * 6.28, wing: .8 + Math.random() * .5 });
    }
    faeries = { box: box, list: list, t: 0 };
  }
  function drawFaeries() {
    var W = window.innerWidth, H = window.innerHeight, t = faeries.t;
    faeries.list.forEach(function (f) {
      var x = (f.bx + f.ax * Math.sin(6.283 * t / f.px + f.fx)) * W;
      var y = (f.by + f.ay * Math.sin(6.283 * t / f.py + f.fy)) * H + 6 * Math.sin(t * 1.3 + f.fx);
      f.el.style.left = Math.max(0, Math.min(W - 40, x - 20)).toFixed(1) + 'px';
      f.el.style.top = Math.max(0, Math.min(H - 40, y - 20)).toFixed(1) + 'px';
      f.wings.setAttribute('transform', 'scale(' + (0.7 + 0.3 * Math.abs(Math.sin(t * 6.283 * f.wing))).toFixed(3) + ' 1)');
    });
  }

  /* ── One loop for both, which stops when neither is on or the tab is hidden ── */
  function tick(now) {
    var dt = last ? Math.min(.1, (now - last) / 1000) : 0;
    last = now;
    if (garden && grown < GROW) { grown += dt; drawGarden(); }
    if (faeries) { faeries.t += dt; drawFaeries(); }
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
      grown = 0; buildGarden(); run();
      btnG.setAttribute('aria-pressed', 'true');
      say('Ivy and mushrooms are starting to grow round the edges, very slowly. Press again to clear them.');
    }
  });
  var resized = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resized);
    resized = setTimeout(function () { if (garden) { buildGarden(); run(); } }, 200);
  });
  box.hidden = false;
})();
