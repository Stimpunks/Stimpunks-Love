/* =============================================================================
   The fractal window. Downloaded only when somebody presses the switch in a
   page's sign-off (love.js injects it then, and never before), drawn in a
   shadow root of its own, and gone when it is switched off or the page is left.

   IT IS NOT SYNCED TO ANY MUSIC, AND IT CANNOT BE. Almost everything that plays
   on this street plays inside another site's frame, and a page is not allowed
   to hear another site's frame; the one plain audio player streams from a host
   that sends no header letting a page read the sound. Measured, 2026-09-27. So
   this is a picture that runs beside whatever is playing, and it says so on the
   switch and on the window.

   IT NEVER FLASHES, AND THAT IS ENFORCED HERE RATHER THAN HOPED FOR. Every
   frame is computed, and then no pixel is allowed to change its relative
   luminance by more than RATE_L per second, or its red-over-everything-else by
   more than RATE_E per second, whatever the fractal wanted. At those rates a
   change of 0.1 in luminance takes the best part of half a second, so a flash
   -- two opposing changes -- takes most of a second, and WCAG 2.3.1 allows
   three a second. The limit is per pixel, so area never enters into it, and it
   holds at every speed: Quick is as quick as the picture can go without
   flashing, and where the fractal asks for more the picture smears instead.
   tools/fractal.test.mjs counts flashes in what comes out, with its own
   arithmetic, for every room's recipe at the quickest speed. That test was
   broken on purpose first: with the limit taken off it fails.

   FOLLOWS THE ARCADE, NOT THE DIAL. It runs at every setting, because the
   motion is the thing somebody switched on, and it has a speed control of its
   own that starts at Slow when the dial is at Gentle. The dial is not wired to
   it: a Gentle that handed somebody a different window would be the lite
   version with a fractal on it.

   ONE ENGINE, A DIFFERENT PICTURE IN EVERY ROOM. The recipe rides on the
   switch, written there by tools/fractals.py out of data/fractals.json, and its
   colours are the room's own custom properties, read off :root when the window
   opens. Nothing here chooses a colour. The window's own clothes are §2's
   --fx-* and are the same everywhere, like the dial and the radio.

   It stores nothing, sends nothing and fetches nothing but its own stylesheet.
   ============================================================================= */
(function (root) {
  'use strict';

  var TAU = Math.PI * 2;
  var RATE_L = 0.25;   // relative luminance per second, per pixel
  var RATE_E = 0.15;   // linear (R - G - B) per second, per pixel: the red flash
  var MAX_DT = 0.1;    // a frame after a stall moves no further than this one would

  /* ── Colour ─────────────────────────────────────────────────────────────── */
  var TO_LIN = new Float32Array(256);
  for (var i = 0; i < 256; i++) {
    var c = i / 255;
    TO_LIN[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  var LIN_STEPS = 4095, TO_SRGB = new Uint8Array(LIN_STEPS + 1);
  for (i = 0; i <= LIN_STEPS; i++) {
    var l = i / LIN_STEPS;
    var s = l <= 0.0031308 ? l * 12.92 : 1.055 * Math.pow(l, 1 / 2.4) - 0.055;
    TO_SRGB[i] = Math.round(Math.max(0, Math.min(1, s)) * 255);
  }

  function hex(h) {
    h = String(h).trim().replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (!/^[0-9a-fA-F]{6}$/.test(h.slice(0, 6))) return null;
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  /* A cyclic ramp through the room's inks, eased between each pair, as linear
     light so the limiter can measure it. */
  var RAMP = 1024;
  function ramp(inks) {
    var n = inks.length, out = new Float32Array(RAMP * 3);
    for (var k = 0; k < RAMP; k++) {
      var pos = k / RAMP * n, a = Math.floor(pos), f = pos - a;
      f = f * f * (3 - 2 * f);
      var p = inks[a % n], q = inks[(a + 1) % n];
      for (var ch = 0; ch < 3; ch++) {
        out[k * 3 + ch] = TO_LIN[Math.round(p[ch] + (q[ch] - p[ch]) * f)];
      }
    }
    return out;
  }

  /* ── The engines ──────────────────────────────────────────────────────────
     Each fills `out` with a position along the ramp (0 and up) for every pixel,
     or -1 for the room's ground. They are pure: the same recipe at the same t
     draws the same picture, which is what lets the test replay them. */
  function rows(W, H, span, cx, cy, ang, fn) {
    var k = span / H, ca = Math.cos(ang) * k, sa = Math.sin(ang) * k;
    var ox = W / 2, oy = H / 2, idx = 0;
    for (var j = 0; j < H; j++) {
      var dy = j - oy, bx = cx - dy * sa, by = cy + dy * ca;
      for (var i = 0; i < W; i++, idx++) {
        var dx = i - ox;
        fn(idx, bx + dx * ca, by + dx * sa);
      }
    }
  }

  function smooth(n, m, p) {
    var v = n + 1 - Math.log(Math.log(m) / 2) / Math.log(p);
    return v > 0 ? v : 0;
  }

  function drift(r, t) {
    var w = TAU * t / (r.period || 60), o = r.orbit || 0;
    return [r.c[0] + o * Math.cos(w), r.c[1] + o * Math.sin(w)];
  }

  function turn(r, t) { return TAU * (r.spin || 0) * t / 120; }

  /* How many iterations it takes for a point to come fully into the room's
     inks. Anything that escapes sooner fades towards the ground, so the far
     field is the room's own dark (or pale) and the light gathers at the edge. */
  function fadeOf(r, dflt) { return r.fade || dflt; }

  var ENGINES = {
    julia: function (out, glow, W, H, t, r) {
      var fade = fadeOf(r, 4);
      var p = r.power || 2, it = r.iter || 64, b = r.bands || 0.08, c = drift(r, t);
      var cr = c[0], ci = c[1];
      rows(W, H, r.span || 2.8, 0, 0, turn(r, t), function (idx, zr, zi) {
        var n = 0, m = 0;
        for (; n < it; n++) {
          var ar = zr, ai = zi;
          for (var q = 1; q < p; q++) { var tr = ar * zr - ai * zi; ai = ar * zi + ai * zr; ar = tr; }
          zr = ar + cr; zi = ai + ci;
          m = zr * zr + zi * zi;
          if (m > 256) break;
        }
        if (n >= it) { out[idx] = -1; return; }
        var v = smooth(n, m, p);
        out[idx] = v * b; glow[idx] = v < fade ? v / fade : 1;
      });
    },

    mandel: function (out, glow, W, H, t, r) {
      var fade = fadeOf(r, 5);
      var p = r.power || 2, depth = r.depth || 30, b = r.bands || 0.06;
      var breath = (1 - Math.cos(TAU * t / (r.period || 90))) / 2;
      var span = (r.span || 3) * Math.pow(depth, -breath);
      var it = Math.round((r.iter || 64) + 16 * breath * Math.log(depth) / Math.LN2);
      var conj = !!r.conj;
      rows(W, H, span, r.center[0], r.center[1], turn(r, t), function (idx, cr, ci) {
        var zr = 0, zi = 0, n = 0, m = 0;
        for (; n < it; n++) {
          if (conj) zi = -zi;
          var ar = zr, ai = zi;
          for (var q = 1; q < p; q++) { var tr = ar * zr - ai * zi; ai = ar * zi + ai * zr; ar = tr; }
          zr = ar + cr; zi = ai + ci;
          m = zr * zr + zi * zi;
          if (m > 256) break;
        }
        if (n >= it) { out[idx] = -1; return; }
        var v = smooth(n, m, p);
        out[idx] = v * b; glow[idx] = v < fade ? v / fade : 1;
      });
    },

    newton: function (out, glow, W, H, t, r) {
      var fade = fadeOf(r, 4);
      var d = r.degree || 3, it = r.iter || 32, b = r.bands || 0.03;
      var w = TAU * t / (r.period || 70);
      var ar = 1 + (r.relax || 0.3) * Math.sin(w), ai = (r.twist || 0) * Math.cos(w);
      var sector = TAU / d;
      rows(W, H, r.span || 3, 0, 0, turn(r, t), function (idx, zr, zi) {
        var n = 0;
        for (; n < it; n++) {
          var pr = 1, pi = 0;                                   // z^(d-1)
          for (var q = 1; q < d; q++) { var tr = pr * zr - pi * zi; pi = pr * zi + pi * zr; pr = tr; }
          var fr = pr * zr - pi * zi - 1, fi = pr * zi + pi * zr;   // z^d - 1
          var gr = d * pr, gi = d * pi;                         // d z^(d-1)
          var den = gr * gr + gi * gi;
          if (den < 1e-12) { n = it; break; }
          var qr = (fr * gr + fi * gi) / den, qi = (fi * gr - fr * gi) / den;
          zr -= ar * qr - ai * qi; zi -= ar * qi + ai * qr;
          if (qr * qr + qi * qi < 1e-9) break;
        }
        if (n >= it) { out[idx] = -1; return; }
        var k = Math.round(Math.atan2(zi, zr) / sector);
        k = ((k % d) + d) % d;
        out[idx] = k / d + n * b; glow[idx] = n + 1 < fade ? (n + 1) / fade : 1;
      });
    },

    phoenix: function (out, glow, W, H, t, r) {
      var fade = fadeOf(r, 4);
      var it = r.iter || 64, b = r.bands || 0.08, c = drift(r, t);
      var cr = c[0], ci = c[1];
      var pr = r.p + (r.swing || 0.04) * Math.sin(TAU * t / ((r.period || 60) * 1.618));
      rows(W, H, r.span || 2.8, 0, 0, turn(r, t), function (idx, zr, zi) {
        var yr = 0, yi = 0, n = 0, m = 0;
        for (; n < it; n++) {
          var nr = zr * zr - zi * zi + cr + pr * yr, ni = 2 * zr * zi + ci + pr * yi;
          yr = zr; yi = zi; zr = nr; zi = ni;
          m = zr * zr + zi * zi;
          if (m > 256) break;
        }
        if (n >= it) { out[idx] = -1; return; }
        var v = smooth(n, m, 2);
        out[idx] = v * b; glow[idx] = v < fade ? v / fade : 1;
      });
    },

    ember: function (out, glow, W, H, t, r) {
      var fade = fadeOf(r, 4);
      var it = r.iter || 64, b = r.bands || 0.08, c = drift(r, t);
      var cr = c[0], ci = c[1];
      rows(W, H, r.span || 2.8, 0, 0, turn(r, t), function (idx, zr, zi) {
        var n = 0, m = 0;
        for (; n < it; n++) {
          var ar = Math.abs(zr), ai = Math.abs(zi);
          zr = ar * ar - ai * ai + cr; zi = 2 * ar * ai + ci;
          m = zr * zr + zi * zi;
          if (m > 256) break;
        }
        if (n >= it) { out[idx] = -1; return; }
        var v = smooth(n, m, 2);
        out[idx] = v * b; glow[idx] = v < fade ? v / fade : 1;
      });
    },

    /* Coloured by how near each point's orbit comes to a shape, so the inside
       of the set is drawn too: petals rather than a filled blot. */
    orbit: function (out, glow, W, H, t, r) {
      var fade = fadeOf(r, 3);
      var p = r.power || 2, it = r.iter || 28, b = r.bands || 0.12, c = drift(r, t);
      var cr = c[0], ci = c[1], trap = r.trap || 'ring', rad = r.radius || 1;
      rows(W, H, r.span || 2.8, 0, 0, turn(r, t), function (idx, zr, zi) {
        var best = 1e9;
        for (var n = 0; n < it; n++) {
          var ar = zr, ai = zi;
          for (var q = 1; q < p; q++) { var tr = ar * zr - ai * zi; ai = ar * zi + ai * zr; ar = tr; }
          zr = ar + cr; zi = ai + ci;
          var m = zr * zr + zi * zi;
          if (m > 256) break;
          var dd = trap === 'cross' ? Math.min(Math.abs(zr), Math.abs(zi))
                 : trap === 'point' ? Math.sqrt((zr - rad) * (zr - rad) + zi * zi)
                 : Math.abs(Math.sqrt(m) - rad);
          if (dd < best) best = dd;
        }
        if (best >= 1e9) { out[idx] = -1; return; }
        var v = -Math.log(best + 1e-3);
        out[idx] = v * b; glow[idx] = v <= 0 ? 0 : v < fade ? v / fade : 1;
      });
    },

    /* A figure made of shrunken copies of itself, drawn by throwing points at
       it. The throw is seeded the same on every frame, so a point follows its
       own path as the maps sway rather than landing somewhere new each time --
       otherwise the picture would be static noise, which the limiter would
       smear but which is still not a picture. */
    ifs: function (out, glow, W, H, t, r) {
      var maps = IFS[r.figure], fit = IFS_FIT[r.figure] || (IFS_FIT[r.figure] = bounds(maps));
      var sway = r.sway || 0.12, w = TAU * t / (r.period || 50), ang = turn(r, t);
      var live = [], total = 0;
      for (var k = 0; k < maps.length; k++) {
        var m = maps[k], d = sway * Math.sin(w + k * 1.3), e = 1 + 0.04 * Math.sin(w * 0.7 + k);
        var cs = Math.cos(d) * e, sn = Math.sin(d) * e;
        live.push([m[0] * cs - m[2] * sn, m[1] * cs - m[3] * sn, m[0] * sn + m[2] * cs,
                   m[1] * sn + m[3] * cs, m[4], m[5]]);
        total += m[6];
      }
      var cum = [], acc = 0;
      for (k = 0; k < maps.length; k++) { acc += maps[k][6] / total; cum.push(acc); }
      for (k = 0; k < W * H; k++) out[k] = 0;
      var cx = (fit[0] + fit[2]) / 2, cy = (fit[1] + fit[3]) / 2;
      var scale = Math.min(W / (fit[2] - fit[0]), H / (fit[3] - fit[1])) * 0.9;
      var ca = Math.cos(ang), sa = Math.sin(ang);
      var seed = 7919, x = 0, y = 0, N = W * H * 2;
      for (var n = 0; n < N + 20; n++) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        var u = seed / 0x7fffffff, pick = 0;
        while (pick < cum.length - 1 && u > cum[pick]) pick++;
        var L = live[pick], nx = L[0] * x + L[1] * y + L[4];
        y = L[2] * x + L[3] * y + L[5]; x = nx;
        if (n < 20) continue;
        var rx = (x - cx), ry = (y - cy);
        var px = Math.floor(W / 2 + (rx * ca - ry * sa) * scale);
        var py = Math.floor(H / 2 - (rx * sa + ry * ca) * scale);
        if (px >= 0 && px < W && py >= 0 && py < H) out[py * W + px] += 1;
      }
      var norm = Math.log(1 + 6 * N / (W * H)), b = r.bands || 0.9;
      for (k = 0; k < W * H; k++) {
        out[k] = out[k] ? Math.min(1.5, Math.log(1 + out[k]) / norm) * b : -1;
        glow[k] = 1;
      }
    }
  };

  /* x' = a x + b y + e, y' = c x + d y + f, chosen with weight w. */
  var IFS = {
    fern:      [[0, 0, 0, 0.16, 0, 0, 1], [0.85, 0.04, -0.04, 0.85, 0, 1.6, 85],
                [0.2, -0.26, 0.23, 0.22, 0, 1.6, 7], [-0.15, 0.28, 0.26, 0.24, 0, 0.44, 7]],
    triangle:  [[0.5, 0, 0, 0.5, 0, 0, 1], [0.5, 0, 0, 0.5, 0.5, 0, 1], [0.5, 0, 0, 0.5, 0.25, 0.433, 1]],
    dragon:    [[0.5, -0.5, 0.5, 0.5, 0, 0, 1], [-0.5, -0.5, 0.5, -0.5, 1, 0, 1]],
    spiral:    [[0.787879, -0.424242, 0.242424, 0.859848, 1.758647, 1.408065, 90],
                [-0.121212, 0.257576, 0.151515, 0.05303, -6.721654, 1.377236, 5],
                [0.181818, -0.136364, 0.090909, 0.181818, 6.086107, 1.568035, 5]],
    tree:      [[0, 0, 0, 0.5, 0, 0, 5], [0.42, -0.42, 0.42, 0.42, 0, 0.2, 40],
                [0.42, 0.42, -0.42, 0.42, 0, 0.2, 40], [0.1, 0, 0, 0.1, 0, 0.2, 15]],
    crystal:   (function () {
      var out = [];
      for (var k = 0; k < 5; k++) {
        var a = TAU * k / 5 + Math.PI / 2, s = 0.382;
        out.push([s, 0, 0, s, (1 - s) * Math.cos(a), (1 - s) * Math.sin(a), 1]);
      }
      out.push([0.382, 0, 0, 0.382, 0, 0, 1]);
      return out;
    }())
  };
  var IFS_FIT = {};
  function bounds(maps) {
    var x = 0, y = 0, b = [1e9, 1e9, -1e9, -1e9], seed = 1, tot = 0, k;
    for (k = 0; k < maps.length; k++) tot += maps[k][6];
    for (var n = 0; n < 40000; n++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var u = seed / 0x7fffffff * tot, acc = 0;
      for (k = 0; k < maps.length - 1; k++) { acc += maps[k][6]; if (u <= acc) break; }
      var m = maps[k], nx = m[0] * x + m[1] * y + m[4];
      y = m[2] * x + m[3] * y + m[5]; x = nx;
      if (n > 20) { b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y); }
    }
    var px = (b[2] - b[0]) * 0.12, py = (b[3] - b[1]) * 0.12;
    return [b[0] - px, b[1] - py, b[2] + px, b[3] + py];
  }

  /* ── The picture: an engine, a ramp, and the limit ─────────────────────── */
  function Picture(recipe, ground, inks, W, H) {
    this.recipe = recipe;
    this.engine = ENGINES[recipe.kind];
    this.ramp = ramp(inks);
    this.ground = [TO_LIN[ground[0]], TO_LIN[ground[1]], TO_LIN[ground[2]]];
    this.W = 0; this.H = 0;
    this.resize(W, H);
  }

  Picture.prototype.resize = function (W, H) {
    var old = this.shown, oW = this.W, oH = this.H;
    this.W = W; this.H = H;
    this.field = new Float32Array(W * H);
    this.glow = new Float32Array(W * H);
    this.shown = new Float32Array(W * H * 3);
    this.bytes = new Uint8ClampedArray(W * H * 4);
    for (var j = 0; j < H; j++) {
      for (var i = 0; i < W; i++) {
        var k = j * W + i, src = old ? (Math.floor(j * oH / H) * oW + Math.floor(i * oW / W)) * 3 : -1;
        for (var ch = 0; ch < 3; ch++) this.shown[k * 3 + ch] = old ? old[src + ch] : this.ground[ch];
        this.bytes[k * 4 + 3] = 255;
      }
    }
    this.paint();
  };

  Picture.prototype.paint = function () {
    var S = this.shown, B = this.bytes;
    for (var k = 0, n = this.W * this.H; k < n; k++) {
      B[k * 4]     = TO_SRGB[Math.round(Math.min(1, Math.max(0, S[k * 3]))     * LIN_STEPS)];
      B[k * 4 + 1] = TO_SRGB[Math.round(Math.min(1, Math.max(0, S[k * 3 + 1])) * LIN_STEPS)];
      B[k * 4 + 2] = TO_SRGB[Math.round(Math.min(1, Math.max(0, S[k * 3 + 2])) * LIN_STEPS)];
    }
  };

  /* One frame at time t, dt real seconds after the last one. The engine says
     where every pixel wants to be; the limit decides how far it may go. The
     step is taken in linear light, where luminance is linear in the colour, so
     scaling the step scales the luminance change exactly. */
  Picture.prototype.frame = function (t, dt, limit) {
    dt = Math.min(Math.max(dt, 0), MAX_DT);
    this.engine(this.field, this.glow, this.W, this.H, t, this.recipe);
    var F = this.field, Gl = this.glow, S = this.shown, R = this.ramp, G = this.ground;
    var phase = t * (this.recipe.cycle || 1 / 45);
    var maxL = RATE_L * dt, maxE = RATE_E * dt, off = limit === false;
    for (var k = 0, n = this.W * this.H; k < n; k++) {
      var v = F[k], tr, tg, tb;
      if (v < 0) { tr = G[0]; tg = G[1]; tb = G[2]; }
      else {
        var pos = v + phase, idx = ((pos - Math.floor(pos)) * RAMP) | 0;
        var g = Gl[k];
        tr = G[0] + (R[idx * 3] - G[0]) * g;
        tg = G[1] + (R[idx * 3 + 1] - G[1]) * g;
        tb = G[2] + (R[idx * 3 + 2] - G[2]) * g;
      }
      var sr = S[k * 3], sg = S[k * 3 + 1], sb = S[k * 3 + 2];
      var dr = tr - sr, dg = tg - sg, db = tb - sb;
      var s = 1;
      if (!off) {
        var dL = Math.abs(0.2126 * dr + 0.7152 * dg + 0.0722 * db), dE = Math.abs(dr - dg - db);
        if (dL > maxL) s = maxL / dL;
        if (dE * s > maxE) s = maxE / dE;
      }
      S[k * 3] = sr + dr * s; S[k * 3 + 1] = sg + dg * s; S[k * 3 + 2] = sb + db * s;
    }
    this.paint();
  };

  var NUM = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
  var FIGURES = {
    fern: 'a frond', triangle: 'a triangle', dragon: 'a dragon curve', spiral: 'a spiral',
    tree: 'a branching tree', crystal: 'a five-sided crystal'
  };
  /* The window's words for its own picture, because the canvas is hidden from
     a screen reader and a claim only sighted readers get is not one this site
     may make. Built from the recipe, so it cannot describe a different one. */
  function describe(r) {
    var p = r.power || 2, s;
    switch (r.kind) {
      case 'julia':   s = 'A Julia set with ' + NUM[p] + '-fold symmetry, slowly changing shape'; break;
      case 'mandel':  s = 'The edge of ' + (r.conj ? 'the Tricorn' : p > 2 ? 'a Multibrot set' : 'the Mandelbrot set') +
                          ', drifting slowly in and back out'; break;
      case 'newton':  s = 'A Newton fractal, the ground divided between ' + NUM[r.degree || 3] +
                          ' roots, with the borders between them slowly shifting'; break;
      case 'phoenix': s = 'A Phoenix fractal, slowly changing shape'; break;
      case 'ember':   s = 'A Burning Ship Julia set, slowly changing shape'; break;
      case 'orbit':   s = 'A Julia set drawn by how near each point comes to a ' + (r.trap || 'ring') +
                          ', slowly changing shape'; break;
      case 'ifs':     s = FIGURES[r.figure].charAt(0).toUpperCase() + FIGURES[r.figure].slice(1) +
                          ' made of smaller copies of itself, swaying slowly'; break;
      default:        s = 'A fractal';
    }
    if (r.spin) s += ' and turning';
    return s + ', in this room’s own colours.';
  }

  var ENGINE = {
    ENGINES: ENGINES, IFS: IFS, Picture: Picture, describe: describe, hex: hex,
    RATE_L: RATE_L, RATE_E: RATE_E, MAX_DT: MAX_DT
  };

  if (typeof module === 'object' && module.exports) { module.exports = ENGINE; return; }
  if (typeof document === 'undefined') return;

  /* ── The window ─────────────────────────────────────────────────────────── */
  var SPEEDS = { slow: 0.4, steady: 1, quick: 2.2 };
  var SPEED_WORDS = { slow: 'Slow', steady: 'Steady', quick: 'Quick' };
  var CORNERS = ['bl', 'tl', 'tr', 'br'];
  var CORNER_WORDS = { bl: 'bottom left', tl: 'top left', tr: 'top right', br: 'bottom right' };
  var ON = 'Switch on the fractal window', OFF = 'Switch off the fractal window';

  var win = null;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function colours(r) {
    var cs = getComputedStyle(document.documentElement);
    var ground = hex(cs.getPropertyValue(r.ground)), inks = [];
    for (var k = 0; k < r.inks.length; k++) {
      var c = hex(cs.getPropertyValue(r.inks[k]));
      if (c) inks.push(c);
    }
    if (!ground || inks.length < 2) return null;
    return { ground: ground, inks: inks };
  }

  function Window(btn, recipe, cols) {
    var self = this;
    this.btn = btn;
    this.t = 0; this.last = 0; this.cost = 0; this.raf = 0;
    this.speed = document.documentElement.getAttribute('data-intensity') === 'gentle' ? 'slow' : 'steady';
    this.corner = 0;

    this.host = el('div', 'fx-host');
    var shadow = this.host.attachShadow({ mode: 'open' });
    /* Hidden until its stylesheet has arrived, so it never shows up for a
       moment as bare buttons at the foot of the page. */
    this.host.hidden = true;
    var sheet = el('link'); sheet.rel = 'stylesheet'; sheet.href = '/fractal.css';
    function ready() {
      if (!self.host.hidden) return;
      self.host.hidden = false;
      self.fit();
      self.title.focus();
    }
    sheet.addEventListener('load', ready);
    sheet.addEventListener('error', ready);
    shadow.appendChild(sheet);

    var box = this.box = el('section', 'fx fx--bl');
    box.setAttribute('aria-labelledby', 'fx-title');
    var bar = el('div', 'fx-bar');
    var title = this.title = el('h2', 'fx-title', 'Fractal window');
    title.id = 'fx-title'; title.tabIndex = -1;
    bar.appendChild(title);
    this.moveBtn = this.button(bar, 'Move', function () { self.move(); });
    if (document.fullscreenEnabled && box.requestFullscreen) {
      this.fullBtn = this.button(bar, 'Full screen', function () { self.full(); });
    }
    this.button(bar, 'Switch off', function () { close(true); });
    box.appendChild(bar);

    var screen = this.screen = el('div', 'fx-screen');
    var canvas = this.canvas = el('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    screen.appendChild(canvas);
    box.appendChild(screen);

    var speeds = el('div', 'fx-speed');
    speeds.setAttribute('role', 'group');
    speeds.setAttribute('aria-label', 'Speed');
    speeds.appendChild(el('span', 'fx-speed__label', 'Speed'));
    this.speedBtns = {};
    Object.keys(SPEEDS).forEach(function (k) {
      var b = self.button(speeds, SPEED_WORDS[k], function () { self.setSpeed(k); });
      self.speedBtns[k] = b;
    });
    box.appendChild(speeds);

    box.appendChild(el('p', 'fx-says', describe(recipe) + ' Not synced to any music, and it never ' +
      'flashes: at every speed, no part of it may change brightness fast enough to.'));
    this.said = el('p', 'fx-sr');
    this.said.setAttribute('aria-live', 'polite');
    box.appendChild(this.said);

    shadow.appendChild(box);
    document.body.appendChild(this.host);

    this.ctx = canvas.getContext('2d');
    this.pic = new ENGINE.Picture(recipe, cols.ground, cols.inks, 16, 9);
    this.setSpeed(this.speed, true);
    this.fit();
    this.onResize = function () { self.fit(); };
    window.addEventListener('resize', this.onResize);
    document.addEventListener('fullscreenchange', this.onResize);
    this.raf = requestAnimationFrame(function (now) { self.tick(now); });
  }

  Window.prototype.button = function (parent, text, fn) {
    var b = el('button', 'fx-btn', text);
    b.type = 'button';
    b.addEventListener('click', fn);
    parent.appendChild(b);
    return b;
  };

  Window.prototype.setSpeed = function (k, quiet) {
    this.speed = k;
    for (var s in this.speedBtns) this.speedBtns[s].setAttribute('aria-pressed', String(s === k));
    if (!quiet) this.say('Speed: ' + SPEED_WORDS[k] + '.');
  };

  Window.prototype.move = function () {
    this.box.classList.remove('fx--' + CORNERS[this.corner]);
    this.corner = (this.corner + 1) % CORNERS.length;
    this.box.classList.add('fx--' + CORNERS[this.corner]);
    this.say('Moved to the ' + CORNER_WORDS[CORNERS[this.corner]] + ' corner.');
  };

  Window.prototype.full = function () {
    if (document.fullscreenElement) document.exitFullscreen();
    else this.box.requestFullscreen().catch(function () {});
  };

  Window.prototype.say = function (text) {
    var said = this.said;
    said.textContent = '';
    setTimeout(function () { said.textContent = text; }, 30);
  };

  /* The canvas is drawn small and scaled up smoothly: a fractal at a third of
     the screen's pixels still looks like a fractal, and the cost of every frame
     is paid in pixels. If frames still run long, it draws smaller. */
  Window.prototype.fit = function (shrink) {
    var full = document.fullscreenElement === this.box;
    if (this.fullBtn) this.fullBtn.textContent = full ? 'Leave full screen' : 'Full screen';
    var rect = this.screen.getBoundingClientRect();
    var cw = Math.max(1, rect.width), ch = Math.max(1, rect.height);
    this.scale = shrink ? Math.max(0.3, (this.scale || 1) * 0.8) : (this.scale || 1);
    var W = Math.round(Math.min(full ? 720 : 480, cw * (full ? 0.5 : 0.8)) * this.scale);
    W = Math.max(96, W);
    var H = Math.max(54, Math.round(W * ch / cw));
    if (W === this.pic.W && H === this.pic.H) return;
    this.canvas.width = W; this.canvas.height = H;
    this.pic.resize(W, H);
    this.image = this.ctx.createImageData(W, H);
    this.draw();
  };

  Window.prototype.draw = function () {
    this.image.data.set(this.pic.bytes);
    this.ctx.putImageData(this.image, 0, 0);
  };

  Window.prototype.tick = function (now) {
    var self = this;
    this.raf = requestAnimationFrame(function (n) { self.tick(n); });
    if (this.last && now - this.last < 30) return;           // about thirty a second is plenty
    var dt = this.last ? (now - this.last) / 1000 : 0;
    this.last = now;
    dt = Math.min(dt, MAX_DT);
    this.t += dt * SPEEDS[this.speed];
    var t0 = performance.now();
    this.pic.frame(this.t, dt);
    this.draw();
    this.cost = this.cost * 0.9 + (performance.now() - t0) * 0.1;
    if (this.cost > 32 && this.scale > 0.3) { this.cost = 0; this.fit(true); }
  };

  Window.prototype.destroy = function () {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('fullscreenchange', this.onResize);
    if (document.fullscreenElement === this.box) document.exitFullscreen();
    this.host.remove();
  };

  function close(refocus) {
    if (!win) return;
    var btn = win.btn;
    win.destroy();
    win = null;
    btn.textContent = ON;
    if (refocus) btn.focus();
  }

  function toggle(btn) {
    if (win) { close(false); return; }
    var recipe;
    try { recipe = JSON.parse(btn.getAttribute('data-fx')); } catch (e) { return; }
    if (!recipe || !ENGINES[recipe.kind]) return;
    var cols = colours(recipe);
    if (!cols) return;
    win = new Window(btn, recipe, cols);
    btn.textContent = OFF;
  }

  root.LoveFractal = { toggle: toggle, ON: ON };
}(typeof window !== 'undefined' ? window : this));
