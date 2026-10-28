/* Glow Wild Hollow: the sea that lights where it moves, and the jellyfish that
   lights when it is touched. Helen Edgar's asks, 2026-10-27, and on 2026-10-28
   "more real and far more sensory activated and stimmy".

   SEA SPARKLE LIGHTS UP WHEN THE WATER AROUND IT MOVES, so the sea here does
   the same, on a canvas laid over the drawing of the water: a finger or a
   pointer leaves lights that drift and swirl in the current behind it, more
   of them the faster it moves; a tap sends a ring of light out across the
   water; holding still keeps it glowing underneath; Stir the water spins a
   whirlpool of light, and Make a wave runs a breaking wave of light along the
   shore, for anybody without a pointer, or who wants more.

   THE CRYSTAL JELLY'S LIGHT STARTS BLUE AND TURNS GREEN, which is the room's
   own fact, so its light does that: a touch makes the bell pulse and swim up,
   a ring of light runs round the rim from where it was touched, blue and then
   green, and flows down the tentacles, and the tentacles sway when anything
   brushes through them.

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

  // ── the sea ────────────────────────────────────────────────────────────────
  var sea = document.querySelector('[data-gwh-sea]');
  if (sea && sea.querySelector('[data-gwh-tank]')) {
    var T = new Tank(sea);
    tanks.push(T);
    var lights = new Lights();
    var rings = [], swirls = [], waves = [], held = {}, last = {};
    var calm = sea.querySelector('[data-gwh-still]');
    var said = sea.querySelector('[data-gwh-said]');
    var stir = sea.querySelector('[data-gwh-stir]');
    var waveBtn = sea.querySelector('[data-gwh-wave]');
    var lit = false, nextSwell = 0;
    var C = {};
    var colours = function () { C = { sea: ink('--gwh-sea'), white: ink('--gwh-ink'), fox: ink('--gwh-fox') }; };
    colours();
    calm.setAttribute('visibility', 'hidden');
    var g = sea.querySelector('[data-gwh-sparks]');
    if (g) g.setAttribute('visibility', 'hidden');

    // The three waves of the drawing, in the tank's own pixels: the drawing is
    // 600 by 170 and every wave rises and falls six units over each 300.
    var ROWS = [52, 98, 140];
    var waveY = function (row, x) {
      return (ROWS[row] - 6 * Math.sin(Math.PI * (x / (T.w / 600)) / 150)) * (T.h / 170);
    };
    // The current: a slow drift along the shore and a roll with the waves.
    var current = function (x, y, now) {
      return [0.12 * (T.w / 600), Math.sin(x * 0.03 + now * 0.0016) * 0.12];
    };

    var burst = function (x, y, n, push, now, spread) {
      for (var i = 0; i < n; i++) {
        var a = Math.random() * 6.2832, sp = (spread || 1) * (0.3 + Math.random() * 1.6);
        lights.add({
          x: x + Math.random() * 6 - 3, y: y + Math.random() * 6 - 3,
          vx: Math.cos(a) * sp + (push ? push[0] : 0), vy: Math.sin(a) * sp * 0.6 + (push ? push[1] : 0),
          s: 1 + Math.random() * 2.6, born: now + Math.random() * 60,
          k: Math.random() < 0.18 ? 'white' : 'sea'
        });
      }
    };

    T.frame = function (now, settle) {
      var c = T.ctx;
      c.clearRect(0, 0, T.w, T.h);
      if (still()) {
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
      c.globalCompositeOperation = 'lighter';
      // A finger held still keeps the water glowing under it.
      for (var id in held) {
        var h = held[id];
        if (now - h.t > 45) { h.t = now; burst(h.x, h.y, 3, null, now, 0.7); }
      }
      // A whirlpool, spiralling out.
      swirls = swirls.filter(function (s) {
        var a = (now - s.born) / s.dur;
        if (a > 1) return false;
        for (var i = 0; i < 3; i++) {
          var ang = s.a0 + a * 6.2832 * 2.5 + i * 2.094, rad = s.R * (0.18 + 0.82 * a);
          lights.add({ x: s.x + Math.cos(ang) * rad, y: s.y + Math.sin(ang) * rad * 0.45,
            vx: -Math.sin(ang) * 1.1, vy: Math.cos(ang) * 0.45, s: 0.9 + Math.random() * 1.8, born: now,
            k: Math.random() < 0.08 ? 'white' : 'sea' });
        }
        if (Math.random() < 0.25) tink(s.y / T.h, 0.45);
        return true;
      });
      // A breaking wave, running along a row.
      waves = waves.filter(function (w) {
        var a = (now - w.born) / w.dur;
        if (a > 1) return false;
        if (a < 0) return true;
        var x = a * (T.w + 30) - 15;
        for (var i = 0; i < (w.soft ? 1 : 4); i++) {
          var xx = x - Math.random() * 18;
          lights.add({ x: xx, y: waveY(w.row, xx) + Math.random() * 5 - 2.5, vx: 0.9 + Math.random() * 0.6, vy: -0.15 - Math.random() * 0.2,
            s: (w.soft ? 0.8 : 1.4) + Math.random() * 2, born: now, k: Math.random() < 0.25 ? 'white' : 'sea' });
        }
        if (!w.soft && Math.random() < 0.18) tink(waveY(w.row, x) / T.h, 0.4);
        return true;
      });
      // Rings spreading out from a tap.
      rings = rings.filter(function (r) {
        var age = now - r.born, a = age / 1600;
        if (a > 1) return false;
        var b = brightness(age, 80), rad = 4 + (1 - Math.pow(1 - a, 3)) * r.R;
        c.strokeStyle = rgba(C.sea, b * 0.5 * (1 - a));
        c.lineWidth = 3;
        c.beginPath(); c.ellipse(r.x, r.y, rad, rad * 0.45, 0, 0, 6.2832); c.stroke();
        c.strokeStyle = rgba(C.white, b * 0.35 * (1 - a));
        c.lineWidth = 1;
        c.beginPath(); c.ellipse(r.x, r.y, rad * 0.8, rad * 0.36, 0, 0, 6.2832); c.stroke();
        return true;
      });
      // At MAX GLITTER the sea moves by itself: now and then a soft swell
      // breaks along one of the waves.
      if (max() && now > nextSwell) {
        waves.push({ born: now, dur: 2600 + Math.random() * 1400, row: Math.floor(Math.random() * 3), soft: true });
        nextSwell = now + 2600 + Math.random() * 3000;
      }
      var more = lights.draw(c, now, C, current, Math.max(0.55, Math.min(1.2, T.w / 600)));
      c.globalCompositeOperation = 'source-over';
      return more || rings.length || swirls.length || waves.length || Object.keys(held).length || max();
    };
    T.onfit = function () { lights.list = []; };

    T.cv.style.touchAction = 'none';
    T.cv.addEventListener('pointermove', function (e) {
      if (still()) return;
      var p = T.at(e), now = performance.now(), l = last[e.pointerId];
      if (held[e.pointerId]) { held[e.pointerId].x = p.x; held[e.pointerId].y = p.y; }
      if (l) {
        var dx = p.x - l.x, dy = p.y - l.y, dt = Math.max(8, now - l.t), speed = Math.hypot(dx, dy) / dt * 16;
        var n = Math.max(1, Math.min(10, Math.round(speed * 0.7)));
        var steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 8));
        for (var s = 1; s <= steps; s++) {
          burst(l.x + dx * s / steps, l.y + dy * s / steps, Math.ceil(n / steps), [dx / dt * 4, dy / dt * 4], now, 0.6);
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
      rings.push({ x: p.x, y: p.y, born: now, R: Math.min(T.w, 260) * 0.45 });
      burst(p.x, p.y, 26, null, now, 1.6);
      tink(p.y / T.h, 1); feel([18]);
      T.wake();
    });
    var letGo = function (e) { delete held[e.pointerId]; delete last[e.pointerId]; };
    T.cv.addEventListener('pointerup', letGo);
    T.cv.addEventListener('pointercancel', letGo);
    T.cv.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') letGo(e); });

    if (stir) {
      stir.hidden = false;
      stir.addEventListener('click', function () {
        if (still()) {
          lit = !lit; T.wake();
          say(said, lit ? 'The waves light blue all along, and stay lit, still.' : 'The water settles, and goes dark.');
          return;
        }
        swirls.push({ x: T.w * (0.3 + Math.random() * 0.4), y: T.h * (0.45 + Math.random() * 0.2), born: performance.now(),
          dur: 2600, R: Math.min(T.w * 0.42, 220), a0: Math.random() * 6.2832 });
        swish(2.6); feel([20, 60, 20, 60, 20]);
        T.wake();
        say(said, 'A whirlpool of light spins out across the water, and goes dark again.');
      });
    }
    if (waveBtn) {
      waveBtn.hidden = false;
      waveBtn.addEventListener('click', function () {
        if (still()) {
          lit = !lit; T.wake();
          say(said, lit ? 'The waves light blue all along, and stay lit, still.' : 'The water settles, and goes dark.');
          return;
        }
        var now = performance.now();
        for (var r = 0; r < 3; r++) waves.push({ born: now + r * 320, dur: 2200, row: 2 - r });
        swish(2.2); feel([40, 80, 40]);
        T.wake();
        say(said, 'A wave breaks along the shore in a line of blue light, and goes dark again.');
      });
    }
    root.addEventListener('love-intensity', function () { T.wake(); });
    window.addEventListener('love-intensity', function () { T.wake(); });
    T.wake();
  }

  // ── the jellyfish ──────────────────────────────────────────────────────────
  var jelly = document.querySelector('[data-gwh-jelly]');
  if (jelly && jelly.querySelector('[data-gwh-tank]')) {
    var J = new Tank(jelly);
    tanks.push(J);
    var specks = new Lights();
    var touch = jelly.querySelector('[data-gwh-touch]');
    var jsaid = jelly.querySelector('[data-gwh-jelly-said]');
    var body = jelly.querySelector('.hollow-jelly__body');
    if (body) body.setAttribute('visibility', 'hidden');
    var JC = {};
    var jcolours = function () { JC = { sea: ink('--gwh-sea'), white: ink('--gwh-ink'), fox: ink('--gwh-fox'), edge: ink('--gwh-ink-2') }; };
    jcolours();

    var RIM = 40, TENT = 14, SEG = 12;
    var rimLit = [], tents = [], pulses = [], held2 = {}, lastJ = {};
    var on = false, rise = 0, riseV = 0, nextIdle = 0;
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
        if (a < 230) v = Math.max(v, a / 230);
        else if (a < 1200) v = Math.max(v, 1 - (a - 230) / 970);
      });
      return v * v * (3 - 2 * v);
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

    // Light a ring round the rim from the point nearest x, both ways round.
    var lightRim = function (x, now) {
      var G = geo(), best = 0, bd = 1e9;
      for (var i = 0; i < RIM; i++) {
        var a = i / RIM * 6.2832, dx = G.cx + Math.cos(a) * G.hw - x;
        if (Math.sin(a) > 0 && Math.abs(dx) < bd) { bd = Math.abs(dx); best = i; }
      }
      for (var k = 0; k < RIM; k++) {
        var d = Math.min(Math.abs(k - best), RIM - Math.abs(k - best));
        rimLit[k] = now + d * 32;
      }
    };
    var pulse = function (x, now, quiet) {
      pulses.push(now);
      pulses = pulses.filter(function (p) { return now - p < 1500; });
      riseV -= 1.6 * J.w / 300;
      if (!quiet) { lightRim(x, now); bell(); feel([25, 50, 25]); }
    };

    var rimColour = function (age) {
      if (age < 0) return null;
      var t = Math.max(0, Math.min(1, (age - 250) / 600));
      return mix(JC.sea, JC.fox, t);
    };

    J.frame = function (now, settle) {
      var c = J.ctx, G = geo(), calmNow = still();
      c.clearRect(0, 0, J.w, J.h);
      var sq = calmNow ? 0 : squeeze(now);
      if (!calmNow) {
        riseV += -rise * 0.004;
        riseV *= 0.95;
        rise += riseV;
        if (Math.abs(rise) < 0.05 && Math.abs(riseV) < 0.01) { rise = 0; riseV = 0; }
      } else { rise = 0; riseV = 0; }
      var oy = rise;
      var w = G.hw * (1 - 0.16 * sq), rimY = G.rim + oy - 7 * sq * G.s, topY = G.top + oy + 9 * sq * G.s;

      // A finger held on the jelly keeps it pulsing.
      for (var id in held2) {
        if (now - held2[id].t > 1100) { held2[id].t = now; pulse(held2[id].x, now); }
      }
      if (max() && !calmNow && now > nextIdle && !Object.keys(held2).length) { pulse(G.cx, now, true); nextIdle = now + 3600; }

      // How lit the rim is now, and in what colour.
      var lights = [], glowAll = 0, glowCol = JC.fox;
      for (var k = 0; k < RIM; k++) {
        var b, col;
        if (calmNow) { b = on ? 1 : 0; col = JC.fox; }
        else { var age = now - rimLit[k]; b = brightness(age, HOLD); col = rimColour(age) || JC.fox; }
        lights.push([b, col]);
        if (b > glowAll) { glowAll = b; glowCol = col; }
      }

      // The tentacles: a rope of points that trails the rim, sways with the
      // water, and is pushed by a finger brushing through it.
      tents.forEach(function (t, ti) {
        var base = { x: G.cx - Math.cos(t.ang) * w, y: rimY + 2 * G.s };
        var p = t.pts;
        p[0].x = base.x; p[0].y = base.y;
        for (var j = 1; j < p.length; j++) {
          var q = p[j];
          if (!calmNow) {
            var vx = (q.x - q.px) * 0.94, vy = (q.y - q.py) * 0.94;
            q.px = q.x; q.py = q.y;
            q.x += vx; q.y += vy + 0.05 * G.s;
            if (max()) q.x += Math.sin(now * 0.0012 + t.phase + j * 0.4) * 0.05 * G.s * j / SEG;
          }
          var a = p[j - 1], dx = q.x - a.x, dy = q.y - a.y, dl = Math.hypot(dx, dy) || 1, f = t.len / dl;
          q.x = a.x + dx * f; q.y = a.y + dy * f;
          if (calmNow) { q.x = base.x + Math.sin(t.phase) * 2 * G.s * j / SEG; q.y = base.y + j * t.len; q.px = q.x; q.py = q.y; }
        }
        c.strokeStyle = rgba(JC.edge, 0.42);
        c.lineWidth = 1;
        c.beginPath(); c.moveTo(p[0].x, p[0].y);
        for (var m = 1; m < p.length; m++) c.lineTo(p[m].x, p[m].y);
        c.stroke();
        // Light flowing down the tentacle from its rim point.
        var ri = Math.round(((ti + 0.5) / TENT) * (RIM / 2)) % RIM;
        c.globalCompositeOperation = 'lighter';
        for (var n = 1; n < p.length; n++) {
          var tb = calmNow ? (on ? 0.6 * (1 - n / p.length) : 0) : brightness(now - rimLit[ri] - n * 70, HOLD) * (1 - n / (p.length + 2));
          if (tb <= 0.01) continue;
          var tc = calmNow ? JC.fox : (rimColour(now - rimLit[ri] - n * 70) || JC.fox);
          c.strokeStyle = rgba(tc, tb * 0.9);
          c.lineWidth = 1.6;
          c.beginPath(); c.moveTo(p[n - 1].x, p[n - 1].y); c.lineTo(p[n].x, p[n].y); c.stroke();
        }
        c.globalCompositeOperation = 'source-over';
      });

      // The glow round the whole bell.
      if (glowAll > 0.01) {
        c.globalCompositeOperation = 'lighter';
        var grd = c.createRadialGradient(G.cx, (topY + rimY) / 2, 4, G.cx, (topY + rimY) / 2, G.hw * 1.6);
        grd.addColorStop(0, rgba(glowCol, glowAll * 0.42));
        grd.addColorStop(1, rgba(glowCol, 0));
        c.fillStyle = grd;
        c.beginPath(); c.arc(G.cx, (topY + rimY) / 2, G.hw * 1.6, 0, 6.2832); c.fill();
        c.globalCompositeOperation = 'source-over';
      }

      // The bell: clear, so only its edges and its canals show.
      c.beginPath();
      c.moveTo(G.cx - w, rimY);
      c.bezierCurveTo(G.cx - w * 1.04, topY + (rimY - topY) * 0.2, G.cx - w * 0.55, topY, G.cx, topY);
      c.bezierCurveTo(G.cx + w * 0.55, topY, G.cx + w * 1.04, topY + (rimY - topY) * 0.2, G.cx + w, rimY);
      c.quadraticCurveTo(G.cx, rimY + 9 * G.s, G.cx - w, rimY);
      c.fillStyle = rgba(JC.edge, 0.1);
      c.fill();
      c.strokeStyle = rgba(JC.edge, 0.6);
      c.lineWidth = 1.5;
      c.stroke();
      // The canals, from the top of the bell to the rim, lit after the rim.
      c.globalCompositeOperation = 'lighter';
      for (var cn = 0; cn < 10; cn++) {
        var ca = Math.PI * (cn + 0.5) / 10, ex = G.cx - Math.cos(ca) * w * 0.98;
        var cb = lights[Math.round(((cn + 0.5) / 10) * (RIM / 2)) % RIM][0];
        c.strokeStyle = cb > 0.02 ? rgba(lights[Math.round(((cn + 0.5) / 10) * (RIM / 2)) % RIM][1], 0.15 + cb * 0.6) : rgba(JC.edge, 0.22);
        c.lineWidth = 1;
        c.beginPath(); c.moveTo(G.cx + (ex - G.cx) * 0.15, topY + 8 * G.s);
        c.quadraticCurveTo(G.cx + (ex - G.cx) * 0.75, topY + (rimY - topY) * 0.3, ex, rimY + 2 * G.s); c.stroke();
      }
      // The rim's ring of lights: the front half nearer, so brighter.
      for (var r2 = 0; r2 < RIM; r2++) {
        var ra = r2 / RIM * 6.2832, rx = G.cx + Math.cos(ra) * w, ry = rimY + 2 * G.s + Math.sin(ra) * 5 * G.s;
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
      // Sea sparkle in the jelly's water too, where a finger passes.
      var more = specks.draw(c, now, JC, null, Math.max(0.6, Math.min(1.3, J.w / 300)));
      c.globalCompositeOperation = 'source-over';

      if (calmNow) return false;
      var moving = Math.abs(riseV) > 0.01 || Math.abs(rise) > 0.05 || sq > 0 || glowAll > 0 ||
        tents.some(function (t) { return t.pts.some(function (q) { return Math.abs(q.x - q.px) + Math.abs(q.y - q.py) > 0.02; }); });
      return moving || more || Object.keys(held2).length > 0 || max();
    };

    var onJelly = function (p) {
      var G = geo();
      return Math.abs(p.x - G.cx) < G.hw * 1.15 && p.y > G.top - 10 * G.s && p.y < G.rim + 30 * G.s + rise;
    };

    J.cv.style.touchAction = 'pan-y';
    J.cv.style.cursor = 'pointer';
    J.cv.addEventListener('pointerdown', function (e) {
      var p = J.at(e), now = performance.now();
      if (still()) {
        on = !on; J.wake();
        say(jsaid, on ? 'The jellyfish lights up green, and stays lit.' : 'The jellyfish goes dark again.');
        return;
      }
      if (onJelly(p)) {
        held2[e.pointerId] = { x: p.x, t: now };
        pulse(p.x, now);
        say(jsaid, 'The jellyfish pulses, and a ring of light runs round its rim, blue and then green, and down its tentacles.');
      } else {
        for (var i = 0; i < 14; i++) specks.add({ x: p.x, y: p.y, vx: Math.random() * 3 - 1.5, vy: Math.random() * 2 - 1, s: 0.8 + Math.random() * 1.6, born: now, k: 'sea' });
        tink(p.y / J.h, 0.7);
      }
      J.wake();
    });
    J.cv.addEventListener('pointermove', function (e) {
      if (still()) return;
      var p = J.at(e), now = performance.now(), l = lastJ[e.pointerId];
      if (l) {
        var dx = p.x - l.x, dy = p.y - l.y, G = geo(), touched = false;
        // Brushing through the tentacles pushes them, and they glow a little.
        tents.forEach(function (t) {
          t.pts.forEach(function (q, j) {
            if (j && Math.hypot(q.x - p.x, q.y - p.y) < 16 * G.s) { q.px -= dx * 0.35; q.py -= dy * 0.2; touched = true; }
          });
        });
        if (touched && Math.random() < 0.5) {
          specks.add({ x: p.x, y: p.y, vx: dx * 0.1, vy: dy * 0.1, s: 1 + Math.random() * 1.5, born: now, k: 'fox' });
          tink(0.2 + Math.random() * 0.3, 0.35); feel(5);
        } else if (Math.hypot(dx, dy) > 5 && Math.random() < 0.6) {
          specks.add({ x: p.x, y: p.y, vx: dx * 0.08, vy: dy * 0.08, s: 0.7 + Math.random() * 1.3, born: now, k: 'sea' });
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
        if (still()) {
          on = !on; J.wake();
          say(jsaid, on ? 'The jellyfish lights up green, and stays lit.' : 'The jellyfish goes dark again.');
          return;
        }
        pulse(geo().cx + (Math.random() * 2 - 1) * geo().hw * 0.8, now);
        J.wake();
        say(jsaid, 'The jellyfish pulses, and a ring of light runs round its rim, blue and then green, and down its tentacles.');
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
