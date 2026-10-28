/* Glow Wild Hollow: the sea that lights where it moves, and the jellyfish that
   lights when it is touched. Helen Edgar's asks, 2026-10-27, and on 2026-10-28
   "more real and far more sensory activated and stimmy".

   SEA SPARKLE LIGHTS UP WHEN THE WATER AROUND IT MOVES, so the sea here does
   the same, on a canvas laid over the drawing of the water. The water is a
   real ripple (Helen's ask, the same day: "much slower, more glow, more real
   looking like actual water and ripples and waves"): a touch spreads out in
   rings, a finger drawn through it leaves a wake, holding still keeps rings
   coming, Stir the water stirs it slowly round for twenty seconds (Keep it
   stirring keeps it going), and Make a wave rolls slow waves along the shore.
   Wherever the water moves a glow builds up in it, and goes down slowly.

   THE CRYSTAL JELLY'S LIGHT STARTS BLUE AND TURNS GREEN, which is the room's
   own fact, so its light does that. A touch starts its swim, twenty seconds
   long (Helen: "glow for about 20 secs and have it slower and more movement
   over 20 secs with option to loop it"): its light comes up slowly, it pulses
   every few seconds and rises a little each time, drifts from side to side
   leaning the way it goes, and a ring of light runs round its rim on every
   pulse, blue and then green, and down its tentacles. Keep it glowing keeps
   it swimming until switched off.

   NOTHING HERE FLASHES. A light may come up quickly (RISE) but always goes
   down slowly (FADE), so no light can come and go three times in a second,
   and every light is a small point, MAX_SPARKS of them at most, on a dark
   panel. At Gentle, and in a low-stimulation mode, nothing comes and goes at
   all: the waves light all at once and stay lit until stirred again, and the
   jellyfish stays lit until touched again. Nothing moves by itself below MAX
   GLITTER. The words are the same at every setting.

   SOUND AND BUZZ START OFF, and come on only with their own switches. The
   sound is arithmetic (oscillators and a little noise, never a recording),
   under MAX_GAIN, which tools/make-glow-wild.py holds to 0.2, the Repeater's
   ceiling; the buzz is the phone's own vibration, where a phone has one.

   IT KEEPS NOTHING AND SENDS NOTHING, the switches included.
   tools/make-glow-wild.py holds all of that. */
(function () {
  'use strict';

  var RISE = 120;         // ms a light takes to come up
  var FADE = 1800;        // ms it takes to go dark again: never less than 1500
  var HOLD = 500;         // ms the jellyfish's rim stays bright before it fades
  var MAX_SPARKS = 360;   // never more lights in a tank than this at once
  var MAX_GAIN = 0.18;    // the loudest the hollow's sounds can be, together

  var root = document.documentElement;
  function still() { return root.getAttribute('data-intensity') === 'gentle' || root.hasAttribute('data-low'); }
  function max() { return root.getAttribute('data-intensity') === 'max'; }

  function say(el, words) {
    if (!el) return;
    el.textContent = '';
    setTimeout(function () { el.textContent = words; }, 30);
  }

  // How bright a light is, t ms after it was born: up over RISE, held for
  // hold, then down over FADE. 0 means it has gone.
  function brightness(t, hold) {
    if (t < 0) return 0;
    if (t < RISE) return t / RISE;
    if (t < RISE + hold) return 1;
    var f = 1 - (t - RISE - hold) / FADE;
    return f > 0 ? f * f * (3 - 2 * f) : 0;
  }

  function ink(name) {
    var v = getComputedStyle(root).getPropertyValue(name).trim();
    var m = /^#?([0-9a-f]{6})$/i.exec(v);
    var n = m ? parseInt(m[1], 16) : 0xffffff;
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')'; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t | 0, a[1] + (b[1] - a[1]) * t | 0, a[2] + (b[2] - a[2]) * t | 0]; }

  // ── sound and buzz, both off until switched on ──────────────────────────
  var audio = { on: false, ctx: null, out: null };
  var buzz = { on: false, can: typeof navigator.vibrate === 'function' };

  function hearing(on) {
    if (on && !audio.ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      audio.ctx = new AC();
      var squash = audio.ctx.createDynamicsCompressor();
      audio.out = audio.ctx.createGain();
      audio.out.gain.value = MAX_GAIN;
      squash.connect(audio.out);
      audio.out.connect(audio.ctx.destination);
      audio.into = squash;
    }
    audio.on = on;
    if (audio.ctx) { if (on) audio.ctx.resume(); else audio.ctx.suspend(); }
    return true;
  }

  // A pentatonic scale, high and soft: the sea's tinkles. Higher on the
  // water's surface, lower further down.
  var BELLS = [587.33, 659.25, 739.99, 880, 987.77, 1174.66, 1318.51, 1479.98, 1760];
  var lastTink = 0;
  function tink(depth, loud) {
    if (!audio.on) return;
    var now = performance.now();
    if (now - lastTink < 55) return;
    lastTink = now;
    var c = audio.ctx, t = c.currentTime;
    var i = Math.max(0, Math.min(BELLS.length - 1, Math.round((1 - depth) * (BELLS.length - 1) + (Math.random() * 2 - 1))));
    var o = c.createOscillator(), g = c.createGain();
    o.type = 'sine';
    o.frequency.value = BELLS[i];
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.22 * (loud || 0.6), t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0004, t + 1.1);
    o.connect(g); g.connect(audio.into);
    o.start(t); o.stop(t + 1.2);
  }
  function swish(seconds) {
    if (!audio.on) return;
    var c = audio.ctx, t = c.currentTime, n = Math.round(c.sampleRate * seconds);
    var buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = buf;
    f.type = 'bandpass'; f.Q.value = 0.8;
    f.frequency.setValueAtTime(300, t);
    f.frequency.linearRampToValueAtTime(1400, t + seconds * 0.4);
    f.frequency.linearRampToValueAtTime(400, t + seconds);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.5, t + seconds * 0.3);
    g.gain.linearRampToValueAtTime(0, t + seconds);
    src.connect(f); f.connect(g); g.connect(audio.into);
    src.start(t);
  }
  var CHORDS = [[523.25, 659.25, 783.99], [587.33, 739.99, 880], [493.88, 622.25, 739.99], [440, 554.37, 659.25]];
  var chord = 0;
  function bell() {
    if (!audio.on) return;
    var c = audio.ctx, t = c.currentTime, notes = CHORDS[chord++ % CHORDS.length];
    notes.forEach(function (f, k) {
      var o = c.createOscillator(), g = c.createGain();
      o.type = k ? 'sine' : 'triangle';
      o.frequency.setValueAtTime(f, t + k * 0.09);
      g.gain.setValueAtTime(0, t + k * 0.09);
      g.gain.linearRampToValueAtTime(0.28, t + k * 0.09 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0004, t + k * 0.09 + 2.8);
      o.connect(g); g.connect(audio.into);
      o.start(t + k * 0.09); o.stop(t + k * 0.09 + 3);
    });
  }
  var lastBuzz = 0;
  function feel(pattern) {
    if (!buzz.on || !buzz.can) return;
    var now = performance.now();
    if (now - lastBuzz < 110) return;
    lastBuzz = now;
    try { navigator.vibrate(pattern); } catch (e) { /* a phone that will not buzz is a quiet phone */ }
  }

  // Every panel has its own pair of switches, and they say the same thing.
  var feels = document.querySelectorAll('[data-gwh-feel]');
  function showSwitches() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-gwh-sound]'), function (b) {
      b.setAttribute('aria-pressed', audio.on ? 'true' : 'false');
      b.textContent = audio.on ? 'Sound: on' : 'Sound: off';
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-gwh-buzz]'), function (b) {
      b.hidden = !buzz.can;
      b.setAttribute('aria-pressed', buzz.on ? 'true' : 'false');
      b.textContent = buzz.on ? 'Buzz: on' : 'Buzz: off';
    });
  }
  Array.prototype.forEach.call(feels, function (p) {
    p.hidden = false;
    p.querySelector('[data-gwh-sound]').addEventListener('click', function () {
      if (hearing(!audio.on)) { showSwitches(); if (audio.on) tink(0.3, 0.8); }
    });
    p.querySelector('[data-gwh-buzz]').addEventListener('click', function () {
      buzz.on = !buzz.on; showSwitches(); feel(30);
    });
  });
  showSwitches();

  // ── a tank: the drawing of the water with a canvas of light laid over it ──
  function Tank(panel) {
    var box = panel.querySelector('[data-gwh-tank]');
    var cv = box.querySelector('canvas');
    cv.hidden = false;
    this.box = box; this.cv = cv; this.ctx = cv.getContext('2d');
    this.w = 1; this.h = 1; this.k = 1;
    this.alive = false; this.seen = true;
    var self = this;
    this.fit();
    if (window.ResizeObserver) new ResizeObserver(function () { self.fit(); self.wake(); }).observe(box);
    if (window.IntersectionObserver) new IntersectionObserver(function (es) {
      self.seen = es[es.length - 1].isIntersecting; if (self.seen) self.wake();
    }).observe(box);
  }
  Tank.prototype.fit = function () {
    var r = this.box.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
    this.cv.width = Math.round(this.w * d); this.cv.height = Math.round(this.h * d);
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
    if (this.onfit) this.onfit();
  };
  Tank.prototype.at = function (e) {
    var r = this.cv.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  Tank.prototype.wake = function () {
    if (this.alive) return;
    this.alive = true;
    var self = this;
    requestAnimationFrame(function step(now) {
      var more = self.seen && !document.hidden && self.frame(now);
      if (more) requestAnimationFrame(step);
      else { self.alive = false; if (!document.hidden) self.frame(now, true); }
    });
  };
  document.addEventListener('visibilitychange', function () {
    tanks.forEach(function (t) { if (!document.hidden) t.wake(); });
  });
  var tanks = [];

  // Lights that drift in the water. Shared by the sea and the jellyfish's tank.
  function Lights() { this.list = []; }
  Lights.prototype.add = function (p) {
    if (this.list.length >= MAX_SPARKS) this.list.shift();
    this.list.push(p);
  };
  Lights.prototype.draw = function (c, now, colours, current, scale) {
    var z = scale || 1;
    this.list = this.list.filter(function (p) {
      var age = now - p.born;
      if (age < 0) return true;
      var b = brightness(age, p.hold || 0);
      if (b <= 0 && age > RISE) return false;
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.955; p.vy *= 0.955;
      if (current) { var cur = current(p.x, p.y, now); p.x += cur[0]; p.y += cur[1]; }
      var col = colours[p.k] || colours.sea;
      c.fillStyle = rgba(col, b * 0.22);
      c.beginPath(); c.arc(p.x, p.y, p.s * 3.2 * z, 0, 6.2832); c.fill();
      c.fillStyle = rgba(col, b * 0.55);
      c.beginPath(); c.arc(p.x, p.y, p.s * 1.5 * z, 0, 6.2832); c.fill();
      c.fillStyle = rgba(p.k === 'white' ? colours.white : col, b * 0.8);
      c.beginPath(); c.arc(p.x, p.y, p.s * 0.55 * z, 0, 6.2832); c.fill();
      return true;
    });
    return this.list.length > 0;
  };

  // A light that comes up over `rise` (never quicker than RISE), stays for
  // `hold`, and goes down over FADE. Slower than brightness(), for the
  // jellyfish's long swim.
  function slowly(t, rise, hold) {
    if (t < 0) return 0;
    var r = Math.max(RISE, rise);
    if (t < r) { var u = t / r; return u * u * (3 - 2 * u); }
    return brightness(t - r + RISE, hold);
  }
  function eased(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }

  // How long a stir, or the jellyfish's swim, lasts: Helen's twenty seconds.
  var SHOW = 20000;
  // How long the end of one takes to fade: never quicker than FADE.
  var ENDING = 3000;

  // ── the sea ────────────────────────────────────────────────────────────────
  // THE WATER IS A REAL RIPPLE, Helen's ask of 2026-10-28: "much slower, more
  // glow, more real looking like actual water and ripples and waves". The sea
  // is a grid of heights, each pulled by its neighbours, so a touch spreads out
  // in rings, rings cross and run back off the edges, and a wave rolls along
  // the shore. The sky catches on the far side of every ripple, faintly. The
  // light is sea sparkle's: wherever the water moves, a glow builds up in it a
  // little at a time, and it goes down slowly, over FADE and more, so nothing
  // in it flickers however the water moves. Stir the water stirs it slowly
  // round for SHOW, and Keep it stirring keeps it going until switched off.
  var STEP = 25;          // ms of water a step: forty steps a second, slow water
  var sea = document.querySelector('[data-gwh-sea]');
  if (sea && sea.querySelector('[data-gwh-tank]')) {
    var T = new Tank(sea);
    tanks.push(T);
    var lights = new Lights();
    var calm = sea.querySelector('[data-gwh-still]');
    var said = sea.querySelector('[data-gwh-said]');
    var stir = sea.querySelector('[data-gwh-stir]');
    var waveBtn = sea.querySelector('[data-gwh-wave]');
    var seaLoopBtn = sea.querySelector('[data-gwh-sea-loop]');
    var seaLooping = false;
    var lit = false, nextSwell = 0, clock = 0;
    var waves = [], held = {}, last = {}, stirring = null;
    var C = {};
    var colours = function () { C = { sea: ink('--gwh-sea'), white: ink('--gwh-ink'), fox: ink('--gwh-fox') }; };
    colours();
    calm.setAttribute('visibility', 'hidden');
    var g0 = sea.querySelector('[data-gwh-sparks]');
    if (g0) g0.setAttribute('visibility', 'hidden');

    // The three waves of the drawing, in the tank's own pixels: the drawing is
    // 600 by 170 and every wave rises and falls six units over each 300.
    var ROWS = [52, 98, 140];
    var waveY = function (row, x) {
      return (ROWS[row] - 6 * Math.sin(Math.PI * (x / (T.w / 600)) / 150)) * (T.h / 170);
    };

    // The water: heights now (hc) and a step ago (hp), and the glow (E).
    var GW = 0, GH = 0, cellX = 1, cellY = 1, hc, hp, E, off, offc, img, bloom, bloomc;
    var C2 = 0.12, DAMP = 0.993, DECAY = Math.exp(-STEP / FADE);
    var energy = 0, peak = 0;
    var grid = function () {
      GW = Math.max(60, Math.min(160, Math.round(T.w / 5)));
      GH = Math.max(28, Math.round(GW * T.h / T.w));
      cellX = T.w / GW; cellY = T.h / GH;
      hc = new Float32Array(GW * GH); hp = new Float32Array(GW * GH); E = new Float32Array(GW * GH);
      off = document.createElement('canvas'); off.width = GW; off.height = GH;
      offc = off.getContext('2d'); img = offc.createImageData(GW, GH);
      bloom = document.createElement('canvas'); bloom.width = Math.ceil(GW / 4); bloom.height = Math.ceil(GH / 4);
      bloomc = bloom.getContext('2d');
    };
    grid();
    T.onfit = function () { grid(); lights.list = []; };

    // Press the water down at x, y (in pixels), and let it glow there.
    var push = function (x, y, depth, r, glow) {
      var gx = x / cellX, gy = y / cellY, rr = r || 2.4;
      var x0 = Math.max(1, Math.floor(gx - rr)), x1 = Math.min(GW - 2, Math.ceil(gx + rr));
      var y0 = Math.max(1, Math.floor(gy - rr)), y1 = Math.min(GH - 2, Math.ceil(gy + rr));
      for (var j = y0; j <= y1; j++) {
        for (var i = x0; i <= x1; i++) {
          var d = Math.sqrt((i - gx) * (i - gx) + (j - gy) * (j - gy)) / rr;
          if (d >= 1) continue;
          var f = 0.5 + 0.5 * Math.cos(Math.PI * d), n = j * GW + i;
          hc[n] -= depth * f;
          if (glow) E[n] = Math.min(1.4, E[n] + glow * f);
        }
      }
    };

    // One step of water: every height pulled towards its neighbours, a little
    // lost each time, and the glow built up by the water's moving and let down
    // over FADE.
    var step = function () {
      var W = GW, n, v, lap, mv, e;
      energy = 0; peak = 0;
      for (var j = 1; j < GH - 1; j++) {
        for (var i = 1; i < W - 1; i++) {
          n = j * W + i;
          lap = hc[n - 1] + hc[n + 1] + hc[n - W] + hc[n + W] - 4 * hc[n];
          v = (2 * hc[n] - hp[n] + C2 * lap) * DAMP;
          mv = v - hc[n];
          hp[n] = v;
          mv = (mv < 0 ? -mv : mv) - 0.006;
          e = E[n] * DECAY + (mv > 0 ? Math.min(0.016, mv * 0.3) : 0);
          E[n] = e > 1.4 ? 1.4 : e;
          energy += v < 0 ? -v : v;
          if (e > peak) peak = e;
        }
      }
      var t = hc; hc = hp; hp = t;
    };

    // The water drawn: the sky's sheen on the far side of each ripple, pale and
    // faint, and the glow in sea blue, its brightest middles nearly white; then
    // the same again, small and spread out, laid on top as the glow's halo.
    var paint = function (c) {
      var d = img.data, W = GW, n, k, sx, sy, s, gl, core, a, w1, w2, base;
      for (var j = 0; j < GH; j++) {
        for (var i = 0; i < W; i++) {
          n = j * W + i; k = n * 4;
          if (i > 0 && i < W - 1 && j > 0 && j < GH - 1) { sx = hc[n + 1] - hc[n - 1]; sy = hc[n + W] - hc[n - W]; }
          else { sx = 0; sy = 0; }
          s = (sx * 0.6 + sy) * 0.9; s = s < 0 ? 0 : s > 1 ? 1 : s;
          gl = E[n] > 1 ? 1 : E[n];
          core = gl > 0.8 ? (gl - 0.8) / 0.2 : 0;
          w1 = s * 0.14; w2 = gl * 0.75;
          a = w1 + w2;
          if (a < 0.004) { d[k + 3] = 0; continue; }
          base = core * 0.45;
          d[k] = (C.white[0] * w1 + (C.sea[0] + (C.white[0] - C.sea[0]) * base) * w2) / a;
          d[k + 1] = (C.white[1] * w1 + (C.sea[1] + (C.white[1] - C.sea[1]) * base) * w2) / a;
          d[k + 2] = (C.white[2] * w1 + (C.sea[2] + (C.white[2] - C.sea[2]) * base) * w2) / a;
          d[k + 3] = (a > 1 ? 1 : a) * 255;
        }
      }
      offc.putImageData(img, 0, 0);
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = 'high';
      c.drawImage(off, 0, 0, T.w, T.h);
      bloomc.clearRect(0, 0, bloom.width, bloom.height);
      bloomc.drawImage(off, 0, 0, bloom.width, bloom.height);
      c.globalCompositeOperation = 'lighter';
      c.globalAlpha = 0.45;
      c.drawImage(bloom, 0, 0, T.w, T.h);
      c.globalAlpha = 1;
    };

    // What moves the water on each step: a finger held still, the stir going
    // round, a wave rolling along a row, and at MAX GLITTER a soft swell now
    // and then. And a few sparks of sea sparkle where the glow is brightest.
    var tick = function (t) {
      for (var id in held) {
        var h = held[id];
        if (t - h.t > 160) { h.t = t; push(h.x, h.y, 0.55, 2.2, 0.08); }
      }
      if (stirring) {
        var age = t - stirring.born;
        if (!seaLooping && t > stirring.until) {
          stirring = null;
          say(said, 'The stirring stops. The ripples settle and the glow fades slowly.');
        } else {
          var ease = eased(age / 2500) * (seaLooping ? 1 : eased((stirring.until - t) / ENDING));
          var ang = stirring.a + age * 6.2832 / 9000;
          push(T.w * (0.5 + 0.33 * Math.cos(ang)), T.h * (0.52 + 0.3 * Math.sin(ang)), 0.09 * ease, 2.4, 0.07 * ease);
          if (age - stirring.sw > 4400) { stirring.sw = age; swish(4.4); }
        }
      }
      waves = waves.filter(function (w) {
        var a = (t - w.born) / w.dur;
        if (a < 0) return true;
        if (a > 1) return false;
        var x = a * (T.w + 60) - 30;
        push(x, waveY(w.row, x), w.soft ? 0.12 : 0.32, 3.2, w.soft ? 0.025 : 0.06);
        return true;
      });
      if (max() && t > nextSwell) {
        waves.push({ born: t, dur: 9000 + Math.random() * 4000, row: Math.floor(Math.random() * 3), soft: true });
        nextSwell = t + 7000 + Math.random() * 6000;
      }
      for (var p = 0; p < 3; p++) {
        var n = (Math.random() * GW * GH) | 0;
        if (E[n] > 0.75) {
          lights.add({ x: (n % GW + Math.random()) * cellX, y: ((n / GW | 0) + Math.random()) * cellY,
            vx: 0, vy: -0.05, s: 0.6 + Math.random() * 1.1, born: t, hold: 200, k: Math.random() < 0.3 ? 'white' : 'sea' });
        }
      }
    };

    T.frame = function (now, settle) {
      var c = T.ctx;
      c.clearRect(0, 0, T.w, T.h);
      if (still()) {
        clock = 0;
        if (lit) {
          c.globalCompositeOperation = 'lighter';
          for (var r = 0; r < ROWS.length; r++) {
            for (var x = 6; x < T.w; x += 11) {
              var y = waveY(r, x);
              c.fillStyle = rgba(C.sea, 0.16); c.beginPath(); c.arc(x, y, 7, 0, 6.2832); c.fill();
              c.fillStyle = rgba(C.sea, 0.75); c.beginPath(); c.arc(x, y, 2.2, 0, 6.2832); c.fill();
            }
          }
          c.globalCompositeOperation = 'source-over';
        }
        return false;
      }
      // Water runs at its own pace whatever the screen does, and does not race
      // to catch up after the page was away.
      if (!clock || now - clock > 300) clock = now - STEP;
      while (now - clock >= STEP) { clock += STEP; tick(clock); step(); }
      paint(c);
      var more = lights.draw(c, now, C, null, Math.max(0.55, Math.min(1.2, T.w / 600)));
      c.globalCompositeOperation = 'source-over';
      if (settle) clock = 0;
      return more || energy > 0.4 || peak > 0.015 || !!stirring || waves.length > 0 ||
        Object.keys(held).length > 0 || max();
    };

    T.cv.style.touchAction = 'none';
    T.cv.addEventListener('pointermove', function (e) {
      if (still()) return;
      var p = T.at(e), now = performance.now(), l = last[e.pointerId];
      if (held[e.pointerId]) { held[e.pointerId].x = p.x; held[e.pointerId].y = p.y; }
      if (l) {
        var dx = p.x - l.x, dy = p.y - l.y, dt = Math.max(8, now - l.t), dist = Math.sqrt(dx * dx + dy * dy);
        var speed = dist / dt * 16, steps = Math.max(1, Math.ceil(dist / 6));
        var depth = Math.min(0.5, 0.08 + speed * 0.04);
        for (var s = 1; s <= steps; s++) {
          push(l.x + dx * s / steps, l.y + dy * s / steps, depth / Math.sqrt(steps), 2.2, Math.min(0.2, 0.03 + speed * 0.02) / steps);
        }
        if (speed > 3) { tink(p.y / T.h, Math.min(1, speed / 14)); feel(6); }
      }
      last[e.pointerId] = { x: p.x, y: p.y, t: now };
      T.wake();
    });
    T.cv.addEventListener('pointerdown', function (e) {
      if (still()) {
        lit = !lit; T.wake();
        say(said, lit ? 'The waves light blue all along, and stay lit, still.' : 'The water settles, and goes dark.');
        return;
      }
      var p = T.at(e), now = performance.now();
      try { T.cv.setPointerCapture(e.pointerId); } catch (x) { /* nothing to capture */ }
      held[e.pointerId] = { x: p.x, y: p.y, t: now };
      last[e.pointerId] = { x: p.x, y: p.y, t: now };
      push(p.x, p.y, 1.6, 3, 0.5);
      tink(p.y / T.h, 1); feel([18]);
      T.wake();
    });
    var letGo = function (e) { delete held[e.pointerId]; delete last[e.pointerId]; };
    T.cv.addEventListener('pointerup', letGo);
    T.cv.addEventListener('pointercancel', letGo);
    T.cv.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') letGo(e); });

    var stillToggle = function () {
      lit = !lit; T.wake();
      say(said, lit ? 'The waves light blue all along, and stay lit, still.' : 'The water settles, and goes dark.');
    };
    var startStir = function () {
      var now = performance.now();
      stirring = { born: now, until: now + SHOW, a: Math.random() * 6.2832, sw: -1e9 };
      feel([20, 60, 20, 60, 20]);
      T.wake();
    };
    if (stir) {
      stir.hidden = false;
      stir.addEventListener('click', function () {
        if (still()) { stillToggle(); return; }
        startStir();
        say(said, seaLooping ? 'The water is stirred slowly round, and glows where it moves, until you switch Keep it stirring off.'
          : 'The water is stirred slowly round for twenty seconds, and glows where it moves.');
      });
    }
    if (waveBtn) {
      waveBtn.hidden = false;
      waveBtn.addEventListener('click', function () {
        if (still()) { stillToggle(); return; }
        var now = performance.now();
        for (var r = 0; r < 3; r++) waves.push({ born: now + r * 1400, dur: 7000, row: 2 - r });
        swish(6); feel([40, 80, 40]);
        T.wake();
        say(said, 'A slow wave rolls in along the shore, glowing blue where it breaks, and the glow fades behind it.');
      });
    }
    if (seaLoopBtn) {
      seaLoopBtn.hidden = false;
      seaLoopBtn.addEventListener('click', function () {
        seaLooping = !seaLooping;
        seaLoopBtn.setAttribute('aria-pressed', seaLooping ? 'true' : 'false');
        seaLoopBtn.textContent = seaLooping ? 'Keep it stirring: on' : 'Keep it stirring: off';
        if (still()) {
          say(said, seaLooping ? 'Keep it stirring is on. At Gentle the water stays still.' : 'Keep it stirring is off.');
          return;
        }
        var now = performance.now();
        if (seaLooping) {
          if (!stirring) startStir();
          say(said, 'Keep it stirring is on: the water goes on being stirred slowly round until you switch it off.');
        } else {
          if (stirring) stirring.until = now + ENDING;
          say(said, 'Keep it stirring is off: the stirring slows and stops, and the glow fades.');
        }
      });
    }
    root.addEventListener('love-intensity', function () { T.wake(); });
    window.addEventListener('love-intensity', function () { T.wake(); });
    T.wake();
  }

  // ── the jellyfish ──────────────────────────────────────────────────────────
  // THE JELLYFISH SWIMS FOR TWENTY SECONDS, Helen's ask of 2026-10-28: "glow
  // for about 20 secs and have it slower and more movement over 20 secs with
  // option to loop it". A touch, or Touch the jellyfish, starts its swim: its
  // light comes up slowly, and it pulses every PULSE, squeezing over SQUEEZE
  // and letting go over RELAX, rising a little with each pulse and sinking
  // back, drifting from side to side and leaning the way it goes, while a ring
  // of light runs round its rim on every pulse, blue and then green, and flows
  // down its tentacles. At the end its light fades over ENDING. Keep it
  // glowing keeps it swimming until switched off.
  var PULSE = 2600, SQUEEZE = 600, RELAX = 1800;
  var jelly = document.querySelector('[data-gwh-jelly]');
  if (jelly && jelly.querySelector('[data-gwh-tank]')) {
    var J = new Tank(jelly);
    tanks.push(J);
    var specks = new Lights();
    var touch = jelly.querySelector('[data-gwh-touch]');
    var jsaid = jelly.querySelector('[data-gwh-jelly-said]');
    var jLoopBtn = jelly.querySelector('[data-gwh-jelly-loop]');
    var jLooping = false;
    var body = jelly.querySelector('.hollow-jelly__body');
    if (body) body.setAttribute('visibility', 'hidden');
    var JC = {};
    var jcolours = function () { JC = { sea: ink('--gwh-sea'), white: ink('--gwh-ink'), fox: ink('--gwh-fox'), edge: ink('--gwh-ink-2') }; };
    jcolours();

    var RIM = 40, TENT = 14, SEG = 12;
    var rimLit = [], tents = [], pulses = [], held2 = {}, lastJ = {};
    var on = false, rise = 0, riseV = 0, nextIdle = 0, swim = null;
    var dx = 0, dy = 0, tilt = 0;
    for (var i = 0; i < RIM; i++) rimLit.push(-1e9);

    // The jelly in the drawing's units: 300 by 220, the bell 108 wide, its rim
    // at 100, its top at 44.
    var geo = function () {
      var s = J.w / 300;
      return { s: s, cx: 150 * s, top: 44 * s, rim: 100 * s, hw: 54 * s };
    };
    var squeeze = function (now) {
      var v = 0;
      pulses.forEach(function (p) {
        var a = now - p;
        if (a < 0) return;
        if (a < SQUEEZE) v = Math.max(v, a / SQUEEZE);
        else if (a < SQUEEZE + RELAX) v = Math.max(v, 1 - (a - SQUEEZE) / RELAX);
      });
      return eased(v);
    };
    var setTentacles = function () {
      var G = geo();
      tents = [];
      for (var t = 0; t < TENT; t++) {
        var ang = Math.PI * (t + 0.5) / TENT;
        var len = (90 + ((t * 37) % 50)) * G.s / SEG;
        var pts = [];
        for (var j = 0; j <= SEG; j++) pts.push({ x: G.cx - Math.cos(ang) * G.hw, y: G.rim + j * len, px: 0, py: 0 });
        pts.forEach(function (p) { p.px = p.x; p.py = p.y; });
        tents.push({ ang: ang, len: len, pts: pts, phase: t * 0.9 });
      }
    };
    J.onfit = function () { setTentacles(); specks.list = []; };
    setTentacles();

    // Light a ring round the rim from the point nearest x, both ways round,
    // slowly.
    var lightRim = function (x, now) {
      var G = geo(), best = 0, bd = 1e9;
      for (var i = 0; i < RIM; i++) {
        var a = i / RIM * 6.2832, ddx = G.cx + dx + Math.cos(a) * G.hw - x;
        if (Math.sin(a) > 0 && Math.abs(ddx) < bd) { bd = Math.abs(ddx); best = i; }
      }
      for (var k = 0; k < RIM; k++) {
        var d = Math.min(Math.abs(k - best), RIM - Math.abs(k - best));
        rimLit[k] = now + d * 55;
      }
    };
    var pulse = function (x, now, quiet) {
      pulses.push(now);
      pulses = pulses.filter(function (p) { return now - p < SQUEEZE + RELAX; });
      riseV -= 0.8 * J.w / 300;
      if (!quiet) { lightRim(x, now); bell(); }
    };
    // The swim's own glow: up over 1.5 seconds, down over ENDING at its end.
    var swimGlow = function (now) {
      if (!swim) return 0;
      var up = eased((now - swim.born) / 1500);
      var down = jLooping ? 1 : eased((swim.until - now) / ENDING);
      return up * down;
    };
    var startSwim = function (now, x) {
      if (swim && (jLooping || now < swim.until)) {
        pulse(x, now); swim.next = now + PULSE;
        swim.until = Math.max(swim.until, now + ENDING + 4000);
        return;
      }
      swim = { born: now, until: now + SHOW, next: now + PULSE };
      pulse(x, now);
      feel([25, 50, 25]);
    };

    var rimColour = function (age) {
      if (age < 0) return null;
      var t = Math.max(0, Math.min(1, (age - 300) / 900));
      return mix(JC.sea, JC.fox, t);
    };

    J.frame = function (now, settle) {
      var c = J.ctx, G = geo(), calmNow = still();
      c.clearRect(0, 0, J.w, J.h);

      if (swim && !calmNow) {
        if (!jLooping && now > swim.until) {
          swim = null;
          say(jsaid, 'The jellyfish’s light fades, and it rests.');
        } else if (now >= swim.next) {
          swim.next = now + PULSE;
          pulse(G.cx + dx + (Math.random() * 2 - 1) * G.hw * 0.5, now);
        }
      }
      var sq = calmNow ? 0 : squeeze(now);
      if (!calmNow) {
        riseV += -rise * 0.0016;
        riseV *= 0.975;
        rise += riseV;
        if (Math.abs(rise) < 0.05 && Math.abs(riseV) < 0.01) { rise = 0; riseV = 0; }
        // The swim's path: side to side over sixteen seconds and a little up
        // and down over eleven, leaning the way it goes.
        var ts = swim ? now - swim.born : 0, amp = swim ? swimGlow(now) : 0;
        var tx = swim ? Math.sin(ts * 6.2832 / 16000) * 0.15 * J.w * Math.min(1, ts / 3000) : 0;
        var ty = swim ? Math.sin(ts * 6.2832 / 11000) * 8 * G.s : 0;
        var tt = swim ? Math.cos(ts * 6.2832 / 16000) * 0.2 * Math.min(1, ts / 3000) : 0;
        dx += (tx - dx) * 0.03; dy += (ty - dy) * 0.03; tilt += (tt - tilt) * 0.025;
        if (!swim && Math.abs(dx) < 0.05 && Math.abs(tilt) < 0.001) { dx = 0; dy = 0; tilt = 0; }
      } else { rise = 0; riseV = 0; dx = 0; dy = 0; tilt = 0; }
      var oy = rise + dy, cx = G.cx + dx;
      var w = G.hw * (1 - 0.16 * sq), rimY = G.rim + oy - 7 * sq * G.s, topY = G.top + oy + 9 * sq * G.s;
      var px = cx, py = (topY + rimY) / 2, ca = Math.cos(tilt), sa = Math.sin(tilt);
      var turn = function (x, y) { return { x: px + (x - px) * ca - (y - py) * sa, y: py + (x - px) * sa + (y - py) * ca }; };

      // A finger held on the jelly keeps it swimming, a pulse each PULSE.
      for (var id in held2) {
        if (now - held2[id].t > PULSE) { held2[id].t = now; startSwim(now, held2[id].x); }
      }
      if (max() && !calmNow && !swim && now > nextIdle && !Object.keys(held2).length) { pulse(cx, now, true); nextIdle = now + 3600; }

      // How lit each point of the rim is now, and in what colour: the swim's
      // own glow underneath, and a pulse's ring of light over it.
      var base = calmNow ? (on ? 1 : 0) : swimGlow(now);
      var lights = [], glowAll = 0, glowCol = JC.fox;
      for (var k = 0; k < RIM; k++) {
        var b, col;
        if (calmNow) { b = base; col = JC.fox; }
        else {
          var age = now - rimLit[k], pb = slowly(age, 320, HOLD);
          b = Math.max(pb, base * 0.5);
          col = pb > base * 0.5 ? (rimColour(age) || JC.fox) : JC.fox;
        }
        lights.push([b, col]);
        if (b > glowAll) { glowAll = b; glowCol = col; }
      }

      // The tentacles: a rope of points that trails the rim, sways with the
      // water, and is pushed by a finger brushing through it.
      var swaying = !calmNow && (swim || max());
      tents.forEach(function (t, ti) {
        var b0 = turn(cx - Math.cos(t.ang) * w, rimY + 2 * G.s);
        var p = t.pts;
        p[0].x = b0.x; p[0].y = b0.y;
        for (var j = 1; j < p.length; j++) {
          var q = p[j];
          if (!calmNow) {
            var vx = (q.x - q.px) * 0.94, vy = (q.y - q.py) * 0.94;
            q.px = q.x; q.py = q.y;
            q.x += vx; q.y += vy + 0.05 * G.s;
            if (swaying) q.x += Math.sin(now * 0.0009 + t.phase + j * 0.4) * 0.06 * G.s * j / SEG;
          }
          var a = p[j - 1], ddx = q.x - a.x, ddy = q.y - a.y, dl = Math.hypot(ddx, ddy) || 1, f = t.len / dl;
          q.x = a.x + ddx * f; q.y = a.y + ddy * f;
          if (calmNow) { q.x = b0.x + Math.sin(t.phase) * 2 * G.s * j / SEG; q.y = b0.y + j * t.len; q.px = q.x; q.py = q.y; }
        }
        c.strokeStyle = rgba(JC.edge, 0.42);
        c.lineWidth = 1;
        c.beginPath(); c.moveTo(p[0].x, p[0].y);
        for (var m = 1; m < p.length; m++) c.lineTo(p[m].x, p[m].y);
        c.stroke();
        // Light flowing down the tentacle from its rim point, and the swim's
        // own glow along its top.
        var ri = Math.round(((ti + 0.5) / TENT) * (RIM / 2)) % RIM;
        c.globalCompositeOperation = 'lighter';
        for (var n = 1; n < p.length; n++) {
          var along = 1 - n / (p.length + 2), tb, tc;
          if (calmNow) { tb = on ? 0.6 * along : 0; tc = JC.fox; }
          else {
            var fa = now - rimLit[ri] - n * 90, fb = slowly(fa, 320, HOLD) * along;
            var sb = base * 0.4 * along;
            tb = Math.max(fb, sb);
            tc = fb > sb ? (rimColour(fa) || JC.fox) : JC.fox;
          }
          if (tb <= 0.01) continue;
          c.strokeStyle = rgba(tc, tb * 0.9);
          c.lineWidth = 1.6;
          c.beginPath(); c.moveTo(p[n - 1].x, p[n - 1].y); c.lineTo(p[n].x, p[n].y); c.stroke();
        }
        c.globalCompositeOperation = 'source-over';
      });

      // The glow round the whole bell.
      if (glowAll > 0.01) {
        c.globalCompositeOperation = 'lighter';
        var grd = c.createRadialGradient(cx, py, 4, cx, py, G.hw * 1.7);
        grd.addColorStop(0, rgba(glowCol, glowAll * 0.45));
        grd.addColorStop(1, rgba(glowCol, 0));
        c.fillStyle = grd;
        c.beginPath(); c.arc(cx, py, G.hw * 1.7, 0, 6.2832); c.fill();
        c.globalCompositeOperation = 'source-over';
      }

      // The bell, leaning the way it swims: clear, so only its edges and its
      // canals show.
      c.save();
      c.translate(px, py); c.rotate(tilt); c.translate(-px, -py);
      c.beginPath();
      c.moveTo(cx - w, rimY);
      c.bezierCurveTo(cx - w * 1.04, topY + (rimY - topY) * 0.2, cx - w * 0.55, topY, cx, topY);
      c.bezierCurveTo(cx + w * 0.55, topY, cx + w * 1.04, topY + (rimY - topY) * 0.2, cx + w, rimY);
      c.quadraticCurveTo(cx, rimY + 9 * G.s, cx - w, rimY);
      c.fillStyle = rgba(JC.edge, 0.1);
      c.fill();
      c.strokeStyle = rgba(JC.edge, 0.6);
      c.lineWidth = 1.5;
      c.stroke();
      // The canals, from the top of the bell to the rim, lit with the rim.
      c.globalCompositeOperation = 'lighter';
      for (var cn = 0; cn < 10; cn++) {
        var cang = Math.PI * (cn + 0.5) / 10, ex = cx - Math.cos(cang) * w * 0.98;
        var lt = lights[Math.round(((cn + 0.5) / 10) * (RIM / 2)) % RIM];
        c.strokeStyle = lt[0] > 0.02 ? rgba(lt[1], 0.15 + lt[0] * 0.6) : rgba(JC.edge, 0.22);
        c.lineWidth = 1;
        c.beginPath(); c.moveTo(cx + (ex - cx) * 0.15, topY + 8 * G.s);
        c.quadraticCurveTo(cx + (ex - cx) * 0.75, topY + (rimY - topY) * 0.3, ex, rimY + 2 * G.s); c.stroke();
      }
      // The rim's ring of lights: the front half nearer, so brighter.
      for (var r2 = 0; r2 < RIM; r2++) {
        var ra = r2 / RIM * 6.2832, rx = cx + Math.cos(ra) * w, ry = rimY + 2 * G.s + Math.sin(ra) * 5 * G.s;
        var front = Math.sin(ra) > 0 ? 1 : 0.45;
        var lb = lights[r2][0] * front;
        c.fillStyle = rgba(JC.edge, 0.35 * front);
        c.beginPath(); c.arc(rx, ry, 1.1 * G.s, 0, 6.2832); c.fill();
        if (lb > 0.01) {
          c.fillStyle = rgba(lights[r2][1], lb * 0.3);
          c.beginPath(); c.arc(rx, ry, 4.5 * G.s, 0, 6.2832); c.fill();
          c.fillStyle = rgba(lights[r2][1], lb);
          c.beginPath(); c.arc(rx, ry, 1.8 * G.s, 0, 6.2832); c.fill();
        }
      }
      c.restore();
      // Sea sparkle in the jelly's water too, where a finger passes.
      c.globalCompositeOperation = 'lighter';
      var more = specks.draw(c, now, JC, null, Math.max(0.6, Math.min(1.3, J.w / 300)));
      c.globalCompositeOperation = 'source-over';

      if (calmNow) return false;
      var moving = Math.abs(riseV) > 0.01 || Math.abs(rise) > 0.05 || sq > 0 || glowAll > 0 ||
        Math.abs(dx) > 0.05 || Math.abs(tilt) > 0.001 ||
        tents.some(function (t) { return t.pts.some(function (q) { return Math.abs(q.x - q.px) + Math.abs(q.y - q.py) > 0.02; }); });
      return moving || more || !!swim || Object.keys(held2).length > 0 || max();
    };

    var onJelly = function (p) {
      var G = geo();
      return Math.abs(p.x - (G.cx + dx)) < G.hw * 1.2 && p.y > G.top + dy - 12 * G.s && p.y < G.rim + 30 * G.s + rise + dy;
    };
    var stillJelly = function () {
      on = !on; J.wake();
      say(jsaid, on ? 'The jellyfish lights up green, and stays lit.' : 'The jellyfish goes dark again.');
    };
    var swimWords = function () {
      return jLooping
        ? 'The jellyfish lights up and swims slowly, pulsing, with a ring of light running round its bell, blue and then green, until you switch Keep it glowing off.'
        : 'The jellyfish lights up and swims slowly for twenty seconds, pulsing, with a ring of light running round its bell, blue and then green.';
    };

    J.cv.style.touchAction = 'pan-y';
    J.cv.style.cursor = 'pointer';
    J.cv.addEventListener('pointerdown', function (e) {
      var p = J.at(e), now = performance.now();
      if (still()) { stillJelly(); return; }
      if (onJelly(p)) {
        var fresh = !swim;
        held2[e.pointerId] = { x: p.x, t: now };
        startSwim(now, p.x);
        if (fresh) say(jsaid, swimWords());
      } else {
        for (var i = 0; i < 14; i++) specks.add({ x: p.x, y: p.y, vx: Math.random() * 2 - 1, vy: Math.random() * 1.4 - 0.7, s: 0.8 + Math.random() * 1.6, born: now, k: 'sea' });
        tink(p.y / J.h, 0.7);
      }
      J.wake();
    });
    J.cv.addEventListener('pointermove', function (e) {
      if (still()) return;
      var p = J.at(e), now = performance.now(), l = lastJ[e.pointerId];
      if (l) {
        var mx = p.x - l.x, my = p.y - l.y, G = geo(), touched = false;
        // Brushing through the tentacles pushes them, and they glow a little.
        tents.forEach(function (t) {
          t.pts.forEach(function (q, j) {
            if (j && Math.hypot(q.x - p.x, q.y - p.y) < 16 * G.s) { q.px -= mx * 0.35; q.py -= my * 0.2; touched = true; }
          });
        });
        if (touched && Math.random() < 0.5) {
          specks.add({ x: p.x, y: p.y, vx: mx * 0.1, vy: my * 0.1, s: 1 + Math.random() * 1.5, born: now, k: 'fox' });
          tink(0.2 + Math.random() * 0.3, 0.35); feel(5);
        } else if (Math.hypot(mx, my) > 5 && Math.random() < 0.6) {
          specks.add({ x: p.x, y: p.y, vx: mx * 0.08, vy: my * 0.08, s: 0.7 + Math.random() * 1.3, born: now, k: 'sea' });
        }
      }
      lastJ[e.pointerId] = { x: p.x, y: p.y };
      J.wake();
    });
    var letGoJ = function (e) { delete held2[e.pointerId]; delete lastJ[e.pointerId]; };
    J.cv.addEventListener('pointerup', letGoJ);
    J.cv.addEventListener('pointercancel', letGoJ);
    J.cv.addEventListener('pointerleave', letGoJ);

    if (touch) {
      touch.hidden = false;
      touch.addEventListener('click', function () {
        var now = performance.now();
        if (still()) { stillJelly(); return; }
        var fresh = !swim;
        startSwim(now, geo().cx + dx + (Math.random() * 2 - 1) * geo().hw * 0.6);
        J.wake();
        say(jsaid, fresh ? swimWords() : 'The jellyfish pulses again, and a ring of light runs round its bell.');
      });
    }
    if (jLoopBtn) {
      jLoopBtn.hidden = false;
      jLoopBtn.addEventListener('click', function () {
        jLooping = !jLooping;
        jLoopBtn.setAttribute('aria-pressed', jLooping ? 'true' : 'false');
        jLoopBtn.textContent = jLooping ? 'Keep it glowing: on' : 'Keep it glowing: off';
        if (still()) {
          say(jsaid, jLooping ? 'Keep it glowing is on. At Gentle the jellyfish stays still.' : 'Keep it glowing is off.');
          return;
        }
        var now = performance.now();
        if (jLooping) {
          if (!swim) startSwim(now, geo().cx);
          say(jsaid, 'Keep it glowing is on: the jellyfish goes on swimming and glowing until you switch it off.');
        } else {
          if (swim) swim.until = now + ENDING;
          say(jsaid, 'Keep it glowing is off: the jellyfish’s light fades and it comes to rest.');
        }
        J.wake();
      });
    }
    window.addEventListener('love-intensity', function () { J.wake(); });
    J.wake();
  }

  // The dial and a low-stimulation mode change what every tank may do.
  if (window.MutationObserver) {
    new MutationObserver(function () { tanks.forEach(function (t) { t.wake(); }); })
      .observe(root, { attributes: true, attributeFilter: ['data-intensity', 'data-low'] });
  }
})();
