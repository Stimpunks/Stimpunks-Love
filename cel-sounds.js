/* cel-sounds.js: A SOUND IN EVERY ROOM OF HELEN EDGAR'S ON CEL STREET, MADE OF
   ARITHMETIC. Helen's ask, 2026-11-12 ("Sounds first", off a list of what her
   rooms could still have): wind chimes and a breeze in the yurt, rain on the
   Reading Room's roof, the harp stirring in the Music Room, the projector in
   the Cinema, water dripping in the crystal cave, the sea in Glow Wild Hollow,
   the bubble tube in the Play Pod and the kettle at the tea party. Each is
   drawn in the browser the way rdr-fire.js draws the fire and yurt-bell.js the
   bell: oscillators and noise, nothing recorded, nothing fetched, nothing
   hosted, nothing reaching anybody's server. Each is off until its switch in
   the room is pressed, on until it is pressed again or the room is left (the
   street's oldest promise: nothing plays until you press play), and heard from
   where its thing stands through the kit's panner (cel-street.js's
   kit.sound, which places it with kit.spatial). The words on each switch are
   the same at every setting; Gentle takes away nothing here, because a sound
   you pressed for is yours. Every sound sits under MAX_GAIN, the Repeater's
   ceiling, and the beds that go on (rain, sea, a motor) are a few seconds of
   sound drawn once and looped with their ends crossfaded, so the loop never
   clicks. It keeps nothing and sends nothing. MIT, like every top-level script
   here. */
(function () {
  'use strict';
  var MAX_GAIN = 0.2, LOOK_AHEAD = 1.5, TICK = 250, SOUNDS = {};
  var ctx = null, live = {}, masters = {}, timer = 0;
  function context() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function rnd() { return Math.random(); }
  function white() { return Math.random() * 2 - 1; }
  // A fixed scatter for the drawn beds, so a bed sounds the same every time.
  function hash(i, j) {
    var n = Math.imul(i + 31, 374761393) ^ Math.imul(j + 7, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  // A bed: seconds of sound drawn by fill(out, n, sr), its ends crossfaded
  // over `fade` seconds so the loop is seamless, every sample clamped.
  function loop(sr, seconds, fade, fill) {
    var n = Math.floor(sr * seconds), out = new Float32Array(n), i;
    fill(out, n, sr);
    var x = Math.floor(sr * fade);
    for (i = 0; i < x; i++) { var u = i / x; out[i] = out[i] * u + out[n - x + i] * (1 - u); }
    for (i = 0; i < n; i++) out[i] = Math.max(-1, Math.min(1, out[i]));
    return out;
  }
  // A struck or plucked note: sine partials [ratio, weight], a quick attack,
  // a decay of `len` seconds, at `amp`, into `out` at `t`.
  function note(c, out, t, hz, partials, amp, len, attack) {
    partials.forEach(function (p) {
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(hz * p[0], t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, p[1] * amp), t + (attack || 0.006));
      g.gain.exponentialRampToValueAtTime(0.0001, t + len * (0.5 + p[1] * 0.5));
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + len + 0.05);
    });
  }
  // A short burst of noise, bandpassed, decaying: a drop, a click, a rattle.
  function burst(c, out, t, hz, q, amp, len) {
    var n = Math.max(32, Math.floor(c.sampleRate * len)), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = white() * Math.exp(-i / (n * 0.3));
    var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = b; f.type = 'bandpass'; f.frequency.value = hz; f.Q.value = q; g.gain.value = amp;
    s.connect(f); f.connect(g); g.connect(out);
    s.start(t); s.stop(t + len + 0.02);
  }
  function kind(name, spec) { SOUNDS[name] = spec; }

  // WIND CHIMES AND A BREEZE (the Faery Yurt): a breeze through the canvas,
  // brown noise held low and swelling on two slow tides, and five tubes
  // struck at random, more often when the air moves, each ringing two or three
  // seconds in a tube's own inharmonic partials.
  var TUBES = [1319, 1480, 1661, 1976, 2217];
  kind('chimes', { level: 0.8,
    bed: function (sr) {
      return loop(sr, 24, 1, function (out, n) {
        var b = 0, lp = 0;
        for (var i = 0; i < n; i++) {
          b = (b + white() * 0.02) * 0.985; lp += (b - lp) * 0.03;
          var sw = (0.5 + 0.5 * Math.sin(Math.PI * 2 * i / (sr * 8))) * (0.5 + 0.5 * Math.sin(Math.PI * 2 * i / (sr * 12) + 1));
          out[i] = lp * 1.3 * (0.3 + 0.7 * sw);
        }
      });
    },
    events: [{ first: 0.4, fn: function (c, out, t) {
      var hz = TUBES[Math.floor(rnd() * TUBES.length)];
      note(c, out, t, hz, [[1, 1], [2.76, 0.3], [5.4, 0.12]], 0.22 + rnd() * 0.26, 2.2 + rnd() * 1.2, 0.004);
      return t + 0.22 + rnd() * rnd() * 3.4;
    } }] });

  // RAIN ON THE ROOF (the Reading Room): a soft hiss, swelling and easing as
  // a shower does, and drops landing on the canvas, each its own size.
  kind('rain', { level: 0.7,
    bed: function (sr) {
      return loop(sr, 16, 1, function (out, n) {
        var lp = 0, lp2 = 0, i;
        for (i = 0; i < n; i++) {
          var x = white(); lp += (x - lp) * 0.35; lp2 += (lp - lp2) * 0.05;
          var sw = 0.55 + 0.45 * Math.sin(Math.PI * 2 * i / (sr * 16));
          out[i] = (lp - lp2) * 0.22 * sw;
        }
        for (var p = 0; p < 140; p++) {
          var t0 = Math.floor(hash(p, 1) * (n - sr)), len = Math.floor(sr * (0.012 + hash(p, 2) * 0.03));
          var amp = 0.12 + hash(p, 3) * 0.3, f = 1600 + hash(p, 4) * 3400;
          for (var k = 0; k < len; k++) {
            var env = Math.exp(-k / (len * 0.25));
            out[t0 + k] += (white() * 0.5 + Math.sin(k / sr * f * Math.PI * 2) * 0.5) * amp * env;
          }
        }
      });
    } });

  // THE HARP STIRRING IN A DRAUGHT (the Music Room): single strings plucked
  // now and then, and sometimes a short run up them, out of one pentatonic
  // scale, so nothing it plays is ever a wrong note.
  var STRINGS = [294, 330, 370, 440, 494, 587, 659, 740, 880];
  function pluck(c, out, t, hz, amp) { note(c, out, t, hz, [[1, 1], [2, 0.35], [3, 0.15], [4, 0.06]], amp, 1.5 + rnd() * 0.8, 0.004); }
  kind('harp', { level: 0.8, bed: null,
    events: [{ first: 0.6, fn: function (c, out, t) {
      var i = Math.floor(rnd() * STRINGS.length);
      if (rnd() < 0.35) {
        var run = 2 + Math.floor(rnd() * 3);
        for (var k = 0; k < run; k++) pluck(c, out, t + k * 0.13, STRINGS[Math.min(STRINGS.length - 1, i + k)], 0.28);
      } else pluck(c, out, t, STRINGS[i], 0.22 + rnd() * 0.2);
      return t + 0.9 + rnd() * 3.5;
    } }] });

  // THE PROJECTOR (the Cinema): a motor's whirr, a low hum off the lamp
  // house, and the shutter ticking twenty-four times a second, with the slow
  // flutter of a reel that is not quite true.
  kind('projector', { level: 0.5,
    bed: function (sr) {
      return loop(sr, 12, 0.5, function (out, n) {
        var lp = 0, per = sr / 24, i;
        for (i = 0; i < n; i++) {
          lp += (white() - lp) * 0.08;
          var fl = 1 + 0.12 * Math.sin(Math.PI * 2 * i / (sr * 3));
          var ph = i % per, click = ph < sr * 0.0015 ? white() * 0.5 * Math.exp(-ph / (sr * 0.0005)) : 0;
          out[i] = (lp * 0.5 + Math.sin(i / sr * 60 * Math.PI * 2) * 0.08 + click) * fl;
        }
      });
    } });

  // WATER DRIPPING (the crystal cave): a drip into the still pool, its pitch
  // falling as a drop's does, and the cave giving it back twice, fainter and
  // longer each time; under it, the faint air of a cave.
  kind('drip', { level: 0.75,
    bed: function (sr) {
      return loop(sr, 8, 1, function (out, n) {
        var b = 0, lp = 0;
        for (var i = 0; i < n; i++) { b = (b + white() * 0.02) * 0.985; lp += (b - lp) * 0.005; out[i] = lp * 1.4; }
      });
    },
    events: [{ first: 0.5, fn: function (c, out, t) {
      function plink(at, amp, len) {
        var o = c.createOscillator(), g = c.createGain(), f0 = 1500 + rnd() * 900;
        o.type = 'sine';
        o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(f0 * 0.55, at + 0.07);
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(amp, at + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
        o.connect(g); g.connect(out); o.start(at); o.stop(at + len + 0.05);
      }
      plink(t, 0.5, 0.25); plink(t + 0.17, 0.2, 0.4); plink(t + 0.36, 0.08, 0.55);
      if (rnd() < 0.25) plink(t + 0.12, 0.3, 0.2);
      return t + 0.6 + rnd() * 3.4;
    } }] });

  // THE SEA (Glow Wild Hollow): waves coming in on two slow tides, each one a
  // swell of noise that opens up as it breaks and hisses out over the sand.
  kind('sea', { level: 0.85,
    bed: function (sr) {
      return loop(sr, 24, 1.5, function (out, n) {
        var lp = 0, hp = 0, i;
        for (i = 0; i < n; i++) {
          var a = 0.5 + 0.5 * Math.sin(Math.PI * 2 * i / (sr * 8) - 1.2), b = 0.5 + 0.5 * Math.sin(Math.PI * 2 * i / (sr * 12) + 0.4);
          var sw = Math.pow(0.35 * a + 0.65 * b, 1.6), x = white();
          lp += (x - lp) * (0.015 + 0.14 * sw); hp += (x - hp) * 0.6;
          out[i] = lp * (0.25 + 1.1 * sw) + (x - hp) * 0.1 * sw * sw;
        }
      });
    } });

  // THE BUBBLE TUBE (the Play Pod): the pump's hum under the floor of the
  // tube, and bubbles rising, each a small rising note as a bubble is.
  kind('bubbles', { level: 0.6,
    bed: function (sr) {
      return loop(sr, 8, 1, function (out, n) {
        var lp = 0;
        for (var i = 0; i < n; i++) { lp += (white() - lp) * 0.04; out[i] = Math.sin(i / sr * 85 * Math.PI * 2) * 0.12 + lp * 0.5; }
      });
    },
    events: [{ first: 0.2, fn: function (c, out, t) {
      var o = c.createOscillator(), g = c.createGain(), f0 = 500 + rnd() * 700, amp = 0.18 + rnd() * 0.25;
      o.type = 'sine';
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 1.35, t + 0.05);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(amp, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.15);
      return t + 0.06 + rnd() * 0.45;
    } }] });

  // THE KETTLE ON THE SPIRIT STOVE (Looking-Glass House): hissing and
  // beginning to boil, its lid rattling, and every so often coming up to the
  // whistle and sinking back, because at this tea party it is always six and
  // the kettle is never quite ready.
  kind('kettle', { level: 0.6,
    bed: function (sr) {
      return loop(sr, 16, 1, function (out, n) {
        var hp = 0, b = 0, lp = 0, e = 0;
        for (var i = 0; i < n; i++) {
          var x = white(); hp += (x - hp) * 0.5;
          b = (b + white() * 0.02) * 0.985; lp += (b - lp) * 0.02; e += (Math.abs(white()) - e) * 0.0008;
          out[i] = (x - hp) * 0.16 + lp * 1.2 * (0.4 + 1.6 * e);
        }
      });
    },
    events: [
      { first: 0.5, fn: function (c, out, t) {
        var k = 2 + Math.floor(rnd() * 3);
        for (var i = 0; i < k; i++) {
          note(c, out, t + i * 0.05, 2360 * (0.98 + rnd() * 0.04), [[1, 1], [1.33, 0.5]], 0.14, 0.08, 0.002);
          burst(c, out, t + i * 0.05, 3200, 2, 0.12, 0.03);
        }
        return t + 0.5 + rnd() * 1.8;
      } },
      { first: 6, fn: function (c, out, t) {
        var o = c.createOscillator(), g = c.createGain(), v = c.createOscillator(), vg = c.createGain();
        o.type = 'sine'; o.frequency.value = 2050; v.type = 'sine'; v.frequency.value = 5; vg.gain.value = 12;
        v.connect(vg); vg.connect(o.frequency);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 3); g.gain.setValueAtTime(0.09, t + 6); g.gain.exponentialRampToValueAtTime(0.0001, t + 8.5);
        o.connect(g); g.connect(out); o.start(t); v.start(t); o.stop(t + 8.6); v.stop(t + 8.6);
        return t + 14 + rnd() * 12;
      } }] });

  // Each sound's own master, made once and kept, so the kit's panner stays on
  // it across being switched off and on; it starts out going straight to the
  // speakers, and ears() in cel-street.js moves it onto a panner.
  function master(name) {
    if (!masters[name]) {
      var g = ctx.createGain(); g.gain.value = MAX_GAIN * SOUNDS[name].level; g.connect(ctx.destination);
      masters[name] = g;
    }
    return masters[name];
  }
  // The events scheduled a little ahead of the clock, on a short timer only
  // while a sound with events is on: each event schedules itself on the audio
  // clock and says when its next one comes.
  function tick() {
    timer = 0;
    var now = ctx.currentTime, any = false;
    Object.keys(live).forEach(function (k) {
      var s = live[k];
      if (!s.events.length) return;
      any = true;
      s.events.forEach(function (ev) {
        var guard = 0;
        while (ev.at < now + LOOK_AHEAD && guard++ < 40) {
          var at = Math.max(ev.at, now + 0.05), next = ev.fn(ctx, s.gain, at);
          ev.at = Math.max(next, at + 0.02);
        }
      });
    });
    if (any) timer = setTimeout(tick, TICK);
  }
  function on(name) {
    var spec = SOUNDS[name];
    if (!spec) return null;
    if (live[name]) return true;
    try {
      var c = context(), m = master(name), g = c.createGain(), src = null;
      g.gain.value = 1; g.connect(m);
      if (spec.bed) {
        if (!spec.buffer) {
          var data = spec.bed(c.sampleRate);
          spec.buffer = c.createBuffer(1, data.length, c.sampleRate);
          spec.buffer.copyToChannel(data, 0);
        }
        src = c.createBufferSource(); src.buffer = spec.buffer; src.loop = true;
        src.connect(g); src.start();
      }
      var t0 = c.currentTime;
      live[name] = { gain: g, src: src, events: (spec.events || []).map(function (e) { return { fn: e.fn, at: t0 + (e.first || 0) }; }) };
      if (!timer) tick();
      return true;
    } catch (e) { return null; }
  }
  function off(name) {
    var s = live[name];
    if (!s) return;
    delete live[name];
    try {
      var t = ctx.currentTime;
      s.gain.gain.setValueAtTime(1, t); s.gain.gain.linearRampToValueAtTime(0, t + 0.15);
      if (s.src) s.src.stop(t + 0.2);
      setTimeout(function () { try { s.gain.disconnect(); if (s.src) s.src.disconnect(); } catch (e) {} }, 300);
    } catch (e) {}
    if (!Object.keys(live).length && timer) { clearTimeout(timer); timer = 0; }
  }
  function offAll() { Object.keys(live).forEach(off); }
  function toggle(name) { if (live[name]) { off(name); return false; } return on(name); }
  function playing(name) { return !!live[name]; }
  function output(name) { return ctx && masters[name] ? { ctx: ctx, node: masters[name] } : null; }
  function kinds() { return Object.keys(SOUNDS); }
  // ONE STRING PLUCKED BY A HAND (the Music Room's harp, Helen's ask,
  // 2026-11-11: "play the harp"): string i, counted up from the lowest, out of
  // the same pentatonic scale the stirring plays, so there is no wrong note,
  // through the harp's own master, so it is heard from the harp. It needs no
  // switch: a string sounds when it is touched, and says which note it was.
  var SCALE = [294, 330, 370, 440, 494], NAMES = ['D', 'E', 'F sharp', 'A', 'B'];
  function pluckString(i) {
    try {
      var c = context(), hz = SCALE[i % 5] * Math.pow(2, Math.floor(i / 5) - 1);
      pluck(c, master('harp'), c.currentTime + 0.01, hz, 0.34);
      return NAMES[i % 5];
    } catch (e) { return null; }
  }
  // A hand run up n strings, low to high, each a little after the last on
  // the audio clock (no timer).
  function run(n) {
    try {
      var c = context(), t = c.currentTime + 0.02;
      for (var k = 0; k < n; k++) pluck(c, master('harp'), t + k * 0.11, SCALE[k % 5] * Math.pow(2, Math.floor(k / 5) - 1), 0.28);
      return true;
    } catch (e) { return null; }
  }
  window.loveCelSounds = { on: on, off: off, offAll: offAll, toggle: toggle, playing: playing, output: output, kinds: kinds, pluck: pluckString, run: run };
  window.addEventListener('pagehide', offAll);
})();
