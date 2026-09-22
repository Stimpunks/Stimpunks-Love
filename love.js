/* =============================================================================
   stimpunks.love — the street's only shared script.

   Three jobs: the intensity dial, the Playhouse toys, and the superposition
   panel. Nothing here is required to read the site — every page is complete
   markup before this file arrives, and the dial's own default is applied by a
   tiny inline snippet in each <head> so nobody is flashed the loud version on
   the way to the quiet one.
   ============================================================================= */
(function () {
  'use strict';

  var LEVELS = ['gentle', 'regular', 'max'];
  var KEY = 'love-intensity';

  var NOTES = {
    gentle:  'Gentle: no wobble, no sparkle, no drifting marquee. Same rooms, same colours, same words — nothing is hidden at this setting.',
    regular: 'Regular: full colour and full type play. Things move when you point at them and not before. Most people land here.',
    max:     'MAX GLITTER: every room turned all the way up — sparkle, marquee, the wobble on the toys. Nobody arrives here by accident.'
  };

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private window */ } }

  /* ── The dial ───────────────────────────────────────────────────────────── */
  function dial() {
    var root = document.documentElement;
    var box = document.querySelector('.dial');
    if (!box) return;

    var btns = box.querySelectorAll('.dial__btn');
    var note = box.querySelector('.dial__note');

    function apply(level, remember) {
      if (LEVELS.indexOf(level) < 0) level = 'regular';
      root.setAttribute('data-intensity', level);
      for (var i = 0; i < btns.length; i++) {
        btns[i].setAttribute('aria-pressed', String(btns[i].dataset.level === level));
      }
      if (note) note.textContent = NOTES[level];
      if (remember) store(KEY, level);
    }

    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () { apply(this.dataset.level, true); });
    }
    apply(root.getAttribute('data-intensity') || 'regular', false);
  }

  /* ── The Stim Box ────────────────────────────────────────────────────────
     Synthesised, never a hosted file: one short oscillator blip per press.
     An AudioContext cannot start without a user gesture, which is the consent
     model enforced by the platform rather than promised by us. Silent until
     pressed, every time, on every visit. */
  var ctx = null;
  function blip(freq, ms, peak) {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      var o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
      o.type = 'triangle';
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak || 0.16, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + ms / 1000 + 0.02);
    } catch (e) { /* no audio available: the button still works, just quietly */ }
  }

  /* A yell is not a tone. The yell button used to call blip(180, 420) -- the same
     triangle oscillator as the stim box, an octave and a half down -- and a pure
     wave at one frequency is a bloop however low you put it. What makes a shout
     a shout is noise and a pitch that moves: breath through a resonance that
     sweeps, a hard attack, and a ragged fall rather than a tidy one. So this
     builds the noise itself instead of asking an oscillator to imply it. */
  function yellNoise() {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      var t = ctx.currentTime, dur = 0.62;

      /* Breath. One second of white noise, band-passed by a filter that sweeps
         down the way a voice does as a shout runs out of air. */
      var frames = Math.floor(ctx.sampleRate * dur);
      var buf = ctx.createBuffer(1, frames, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < frames; i++) d[i] = Math.random() * 2 - 1;
      var noise = ctx.createBufferSource();
      noise.buffer = buf;
      var band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.Q.value = 1.6;   /* wide. At 4.5 the filter threw away most of the breath
                               and the result measured barely louder than the bloop
                               it replaced -- right in character, still too polite. */
      band.frequency.setValueAtTime(1500, t);
      band.frequency.exponentialRampToValueAtTime(420, t + dur);

      /* The voice under the breath. Two saws a little apart beat against each
         other, which is the roughness a single clean oscillator never has. */
      var a = ctx.createOscillator(), b = ctx.createOscillator();
      a.type = b.type = 'sawtooth';
      b.detune.value = 17;
      [a, b].forEach(function (o) {
        o.frequency.setValueAtTime(240, t);
        o.frequency.exponentialRampToValueAtTime(430, t + 0.07);   /* up fast */
        o.frequency.exponentialRampToValueAtTime(180, t + dur);    /* then down */
      });
      var vg = ctx.createGain();
      vg.gain.value = 0.22;

      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.5, t + 0.012);   /* hard attack */
      g.gain.exponentialRampToValueAtTime(0.28, t + 0.22);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      noise.connect(band); band.connect(g);
      a.connect(vg); b.connect(vg); vg.connect(g);
      g.connect(ctx.destination);
      noise.start(t); a.start(t); b.start(t);
      noise.stop(t + dur); a.stop(t + dur + 0.02); b.stop(t + dur + 0.02);
    } catch (e) { /* no audio available: the button still works, just quietly */ }
  }

  /* ── The sound board ─────────────────────────────────────────────────────
     Nine keys, every noise built here out of oscillators, filters and a buffer
     of white noise. NOTHING IS FETCHED and nothing exists until a press: the
     AudioContext cannot start without a user gesture, which is the consent
     model enforced by the platform rather than promised by us, and it is the
     same promise the yell button and the jukebox make in their own ways.

     ONE `voice` PER PRESS, REGISTERED BY NAME, because make-soundboard.py reads
     these names out of this file and refuses a pad whose voice is missing. A
     key that makes no sound is not an error anywhere -- it is a button somebody
     presses and presses and nothing happens, which is make-chappell.py's typo
     that never becomes a video arriving in a room where the press IS the
     content. The mood keys register one voice per mood, so `hum:sad` missing is
     a refusal at build time rather than a silence at press time. */
  var VOICES = {}, BURSTS = {};
  function voice(key, fn) { VOICES[key] = fn; }
  function burst(kind, fn) { BURSTS[kind] = fn; }

  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* A second of white noise, made on the spot. Breath, rain, the crack across
     the front of an angry drum: everything here that is not a pitch. */
  function hiss(c, dur) {
    var frames = Math.floor(c.sampleRate * dur);
    var b = c.createBuffer(1, frames, c.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < frames; i++) d[i] = Math.random() * 2 - 1;
    var s = c.createBufferSource();
    s.buffer = b;
    return s;
  }

  /* Attack and fall, exponential both ways because ears are. Returns the gain
     to connect into; it is already wired to the speakers. */
  function env(c, t, peak, attack, dur) {
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(c.destination);
    return g;
  }

  /* Wobble on the pitch. `fade` is what makes a boing settle rather than
     shimmer forever -- the difference between a spring and a theremin. */
  function vib(c, o, t, dur, rate, depth, fade) {
    var l = c.createOscillator(), a = c.createGain();
    l.frequency.value = rate;
    a.gain.setValueAtTime(depth, t);
    if (fade) a.gain.linearRampToValueAtTime(0.0001, t + dur);
    l.connect(a); a.connect(o.frequency);
    l.start(t); l.stop(t + dur + 0.05);
  }

  /* One tone, the shape most of these are made of. */
  function tone(c, t, type, from, to, bend, peak, attack, dur) {
    var o = c.createOscillator(), g = env(c, t, peak, attack, dur);
    o.type = type;
    o.frequency.setValueAtTime(from, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + bend);
    o.connect(g);
    o.start(t); o.stop(t + dur + 0.05);
    return o;
  }

  voice('click', function (c, t) {
    /* Two parts, because a pen is two parts: the plastic and the spring. */
    var n = hiss(c, 0.05), f = c.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = 2200;
    n.connect(f); f.connect(env(c, t, 0.5, 0.0015, 0.045));
    n.start(t); n.stop(t + 0.06);
    tone(c, t, 'square', 2600, 0, 0, 0.16, 0.002, 0.03);
  });

  voice('pop', function (c, t) {
    /* A bubble goes UP. Every first draft of this sound goes down, which is a
       drip, and the ear knows the difference immediately. */
    tone(c, t, 'sine', 320, 1150, 0.07, 0.4, 0.004, 0.12);
  });

  voice('rain', function (c, t) {
    var dur = 1.8, n = hiss(c, dur), f = c.createBiquadFilter(), g = c.createGain();
    f.type = 'bandpass'; f.Q.value = 0.7;
    f.frequency.setValueAtTime(2600, t);
    f.frequency.exponentialRampToValueAtTime(1500, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.5);
    g.gain.exponentialRampToValueAtTime(0.16, t + 1.0);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(c.destination);
    n.connect(f); f.connect(g);
    n.start(t); n.stop(t + dur);
  });

  voice('chime', function (c, t) {
    /* 880 and 2.76 x 880. That ratio is why a bell is a bell and a sine is a
       sine; one partial does the whole job. */
    tone(c, t, 'sine', 880, 0, 0, 0.26, 0.005, 1.6);
    tone(c, t, 'sine', 2428, 0, 0, 0.09, 0.005, 1.1);
  });

  voice('purr', function (c, t) {
    var dur = 1.2, n = hiss(c, dur), f = c.createBiquadFilter(), g = c.createGain();
    f.type = 'lowpass'; f.frequency.value = 320; f.Q.value = 3;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.42, t + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    /* The trill is the purr. Twenty-two on the gain, not on the pitch. */
    var l = c.createOscillator(), a = c.createGain();
    l.type = 'sine'; l.frequency.value = 22; a.gain.value = 0.3;
    l.connect(a); a.connect(g.gain);
    g.connect(c.destination);
    n.connect(f); f.connect(g);
    n.start(t); l.start(t); n.stop(t + dur); l.stop(t + dur);
  });

  voice('squeak', function (c, t) {
    var f = c.createBiquadFilter(), g = env(c, t, 0.2, 0.01, 0.26);
    f.type = 'bandpass'; f.Q.value = 5; f.frequency.value = 1600;
    var o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(900, t);
    o.frequency.exponentialRampToValueAtTime(1800, t + 0.1);
    o.frequency.exponentialRampToValueAtTime(700, t + 0.26);
    o.connect(f); f.connect(g);
    o.start(t); o.stop(t + 0.3);
  });

  /* The three mood keys. What changes between moods is the SHAPE of the noise --
     where the pitch goes, how fast, and how rough it is on the way. Nothing here
     is a face and nothing here is asking anybody to identify one; see the note
     at the head of data/soundboard.json. */
  voice('hum:happy', function (c, t) {
    var o = tone(c, t, 'triangle', 196, 246.94, 0.3, 0.3, 0.06, 1.0);  /* up a third */
    vib(c, o, t, 1.0, 5, 3);
  });
  voice('hum:sad', function (c, t) {
    var o = tone(c, t, 'triangle', 174.61, 146.83, 1.6, 0.26, 0.14, 1.6);  /* F down to D */
    vib(c, o, t, 1.6, 3.2, 1.6);
  });
  voice('hum:angry', function (c, t) {
    /* Two saws fourteen cents apart. The beating between them is the anger;
       neither one alone has any in it. */
    var g = env(c, t, 0.24, 0.02, 0.9), f = c.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 900;
    f.connect(g);
    [0, 14].forEach(function (cents) {
      var o = c.createOscillator();
      o.type = 'sawtooth'; o.detune.value = cents;
      o.frequency.setValueAtTime(155.56, t);
      o.connect(f); o.start(t); o.stop(t + 0.95);
    });
  });

  voice('spring:happy', function (c, t) {
    var o = tone(c, t, 'triangle', 180, 760, 0.22, 0.3, 0.008, 0.5);
    vib(c, o, t, 0.5, 17, 60, true);
  });
  voice('spring:sad', function (c, t) {
    var o = tone(c, t, 'triangle', 420, 90, 1.1, 0.26, 0.02, 1.1);
    vib(c, o, t, 1.1, 6, 22, true);
  });
  voice('spring:angry', function (c, t) {
    var o = tone(c, t, 'sawtooth', 520, 120, 0.55, 0.32, 0.004, 0.55);
    vib(c, o, t, 0.55, 42, 90);   /* fast and never settling: the rattle */
  });

  voice('drum:happy', function (c, t) {
    [[0, 180], [0.13, 240], [0.26, 320]].forEach(function (h) {
      tone(c, t + h[0], 'sine', h[1], h[1] * 0.55, 0.15, 0.32, 0.004, 0.16);
    });
  });
  voice('drum:sad', function (c, t) {
    tone(c, t, 'sine', 110, 58, 0.9, 0.32, 0.01, 0.9);
  });
  voice('drum:angry', function (c, t) {
    tone(c, t, 'sine', 190, 52, 0.3, 0.48, 0.003, 0.34);
    var n = hiss(c, 0.12), f = c.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = 1400;
    n.connect(f); f.connect(env(c, t, 0.32, 0.002, 0.11));
    n.start(t); n.stop(t + 0.13);
  });

  /* ── The flourishes ──────────────────────────────────────────────────────
     MAX GLITTER only, one per key, no two alike -- which is the room's whole
     rule arriving on one object, so make-soundboard.py refuses two keys
     pointing at one of these. Below MAX nothing is built at all: the CSS gate
     is the second lock rather than the only one.

     Everything moves with a translate or a scale and NOTHING ROTATES,
     deliberately, the call arcade.js and quest.js both made: rotation and skew
     are all check-gentle.py can read in a computed matrix, and a checker must
     not be asked to take this file's word for something else. Nothing flashes
     and nothing strobes. */
  function bits(sky, n, make) {
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      make(s, i, n);
      sky.appendChild(s);
    }
  }
  function lag(s, secs) { s.style.animationDelay = secs.toFixed(2) + 's'; }

  burst('ring', function (sky) {          /* click: three rings out of the middle */
    bits(sky, 3, function (s, i) { lag(s, i * 0.13); });
  });
  burst('bubble', function (sky) {        /* pop: bubbles up off the bottom edge */
    bits(sky, 7, function (s) {
      s.style.left = (6 + Math.random() * 84) + '%';
      lag(s, Math.random() * 0.35);
    });
  });
  burst('drops', function (sky) {         /* rain: hairlines down the whole key */
    bits(sky, 12, function (s, i) {
      s.style.left = (4 + i * 8 + Math.random() * 4) + '%';
      lag(s, Math.random() * 0.5);
    });
  });
  burst('star', function (sky) {          /* chime: thrown outward, eight ways */
    bits(sky, 8, function (s, i, n) {
      var a = (i / n) * Math.PI * 2, r = 46 + Math.random() * 26;
      s.style.setProperty('--dx', Math.round(Math.cos(a) * r) + 'px');
      s.style.setProperty('--dy', Math.round(Math.sin(a) * r) + 'px');
    });
  });
  burst('ripple', function (sky) {        /* purr: bars widening where they lie */
    bits(sky, 4, function (s, i, n) {
      s.style.top = (14 + i * (72 / n)) + '%';
      lag(s, i * 0.09);
    });
  });
  burst('dart', function (sky) {          /* squeak: dashes shot across */
    bits(sky, 5, function (s, i) {
      s.style.top = (12 + Math.random() * 74) + '%';
      lag(s, i * 0.07);
    });
  });
  burst('arc', function (sky) {           /* hum: flat rings off the bottom edge */
    bits(sky, 4, function (s, i) { lag(s, i * 0.16); });
  });
  burst('coil', function (sky) {          /* spring: bars stretched down and back */
    bits(sky, 6, function (s, i) {
      s.style.top = (10 + i * 4) + '%';
      s.style.setProperty('--dy', (18 + i * 14) + 'px');
      lag(s, i * 0.05);
    });
  });
  burst('confetti', function (sky) {      /* drum: squares dropped off the top */
    bits(sky, 10, function (s) {
      s.style.left = (4 + Math.random() * 88) + '%';
      s.style.setProperty('--dx', (Math.round(Math.random() * 40) - 20) + 'px');
      lag(s, Math.random() * 0.45);
    });
  });

  function level() {
    return document.documentElement.getAttribute('data-intensity') || 'regular';
  }

  /* The board itself. Everything on it is generated by tools/make-soundboard.py
     out of data/soundboard.json, including the wave on every key and the mood
     each key is offering; this presses play, says what happened out loud, and
     moves the mood on.

     WHAT IT SAYS IS THE POINT. A board made of sounds is the one thing on this
     street that can lock somebody out completely, so every press writes what it
     sounded like into the room's live region -- the Jungle Room's rule that
     colour is never the only channel, in a room where the channel is audio. */
  function soundboard() {
    var grid = document.querySelector('.stimboard__grid');
    if (!grid) return;
    var say = document.getElementById('playhouse-says');
    /* One readout for the whole board rather than one per key: a key is about a
       hundred pixels wide and a sentence does not fit on it. It sits directly
       under the keys, where the hand already is. */
    var board = document.querySelector('.stimboard__said');
    var pads = grid.querySelectorAll('.stimpad');

    for (var i = 0; i < pads.length; i++) (function (pad) {
      var moods = [];
      try { moods = JSON.parse(pad.dataset.moods || '[]'); } catch (e) { moods = []; }
      var nameEl = pad.querySelector('.stimpad__name');
      var moodEl = pad.querySelector('.stimpad__mood');
      var path = pad.querySelector('.stimpad__wave path');
      var sky = pad.querySelector('.burst');
      var name = nameEl ? nameEl.textContent : 'A key';
      var at = 0, timer = null;

      /* Through sound(), like the toys, so that THE ECHO can play a key back:
         the board is in the same room and "the last noise" should mean the last
         noise, not the last noise made by a toy. */
      function play(key) {
        var fn = VOICES[key];
        if (!fn) return;   /* make-soundboard.py refuses this at build time */
        sound(function () { var c = ac(); fn(c, c.currentTime); });
      }

      function flourish() {
        if (!sky || level() !== 'max') return;
        var make = BURSTS[pad.dataset.burst];
        if (!make) return;
        sky.textContent = '';
        make(sky);
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(function () { sky.textContent = ''; }, 2200);
      }

      pad.addEventListener('click', function () {
        if (!moods.length) {
          play(pad.dataset.pad);
          /* speak() rather than a plain assignment: pressing one key twice
             writes the identical sentence, and a live region does not announce
             text it already holds. The same fault the echo and the safe food
             tin have, in a room where pressing the same key repeatedly is the
             entire point of the object. */
          if (say) speak(say, name + ': ' + pad.dataset.heard + '.', true, board);
          flourish();
          return;
        }
        /* The key shows the mood it is ABOUT to play, so pressing it plays that
           one and then offers the next. `data-lit` stays on the mood that just
           played, because the flourish belongs to the noise that happened and
           the label belongs to the one that has not. */
        var now = moods[at];
        at = (at + 1) % moods.length;
        var next = moods[at];
        play(pad.dataset.pad + ':' + now.mood);
        pad.dataset.lit = now.mood;
        flourish();
        pad.dataset.mood = next.mood;
        if (moodEl) moodEl.textContent = next.mood;
        if (path) path.setAttribute('d', next.wave);
        if (say) {
          speak(say, name + ', ' + now.mood + ': ' + now.heard +
                '. Press again for ' + next.mood + '.', true, board);
        }
      });
    }(pads[i]));
  }

  /* ── The Playhouse's toys ────────────────────────────────────────────────
     Everything in that room is a button, and by the tenth one the tile, the
     handler and the fill were three things in three files that are nowhere near
     each other. So each toy registers itself by name here and
     tools/make-toys.py refuses a tile it cannot find a `toy()` for -- a control
     that does nothing is not an error anywhere, it is a button somebody presses
     and presses in the one room whose whole premise is that pressing works.

     THE ROOM SAYS WHAT HAPPENED, OUT LOUD, EVERY TIME. #playhouse-says is the
     only live region on the page and every toy writes to it, which is what
     makes a room full of noises and colours legible to somebody using neither. */
  var TOYS = {}, NOTES = {};
  function toy(id, fn) { TOYS[id] = fn; }
  function note(id, fn) { NOTES[id] = fn; }

  var lastSaid = null;      /* what the room last said; THE ECHO repeats it */
  var lastNoise = null;     /* and the noise it made, which THE ECHO plays back */
  var playingYell = null;   /* the recording in flight, so THE OFF SWITCH can stop it */

  /* EVERY TOY MAKES A NOISE, BECAUSE SIX OF THEM MAKING NONE READ AS BROKEN.
     Ryan, 2026-09-21: in a room where most things answer out loud, the ones
     that do not feel faulty rather than quiet. So each toy registers a sound of
     its own and make-toys.py refuses one without.

     A NOTE IS A FACTORY AND NOT A SOUND, which is what makes the echo work: it
     is called once to CHOOSE what to play -- the stim box's next step up the
     scale, the telephone's end, a yell picked at random -- and hands back a
     function that plays exactly that. `sound` keeps that function, so replaying
     it gives the same noise again rather than the next one along. A note that
     played directly would make the echo advance the scale it was echoing. */
  function sound(fn) {
    lastNoise = fn;
    try { fn(); } catch (e) { /* no audio available: the toy still works, quietly */ }
  }
  function replay() {
    if (!lastNoise) return false;
    try { lastNoise(); } catch (e) {}
    return true;    /* and lastNoise is untouched: an echo of an echo is the original */
  }

  /* AN ARIA-LIVE REGION DOES NOT ANNOUNCE TEXT IT ALREADY HOLDS. Two toys here
     exist to repeat themselves -- the echo says the last thing again, the safe
     food tin says the same thing forever -- and written the obvious way both
     would be SILENT to the one reader who most needs them, while looking
     perfectly correct on screen. Clearing the region and setting it back on the
     next tick is what makes a repeat a change. */
  function speak(say, text, remember, local) {
    if (say.textContent === text) {
      say.textContent = '';
      window.setTimeout(function () { say.textContent = text; }, 60);
    } else {
      say.textContent = text;
    }
    if (remember) lastSaid = text;
    answer(local, text);
  }

  /* AND IT ANSWERS WHERE YOU PRESSED, which the room did not do until Ryan said
     the buttons looked broken to him. #playhouse-says is at the top of the page
     and is off the screen by the time anybody has scrolled to the toys, let
     alone to the sound board underneath them -- so every press was landing in a
     box the person pressing could not see. A control that gives no sign of
     having worked IS broken, whatever the markup says.

     One readout at a time: the last thing said is on the thing that said it,
     and the previous one is cleared, so it always reads as *this* control
     answering rather than a page filling up with old replies. Every one of them
     is aria-hidden, because #playhouse-says is still the only live region here
     and hearing the same sentence twice is worse than hearing it once. */
  var readout = null;
  function answer(el, text) {
    if (readout && readout !== el) { readout.textContent = ''; readout.hidden = true; }
    readout = el || null;
    if (!el) return;
    el.textContent = text;
    el.hidden = false;
  }

  /* ── One noise per toy ───────────────────────────────────────────────────
     Short, affirmative, synthesised here, and no two alike — nor alike to any
     of the sound board's nine keys, which are the other synthesised things in
     this room. Each one is a FACTORY: called to choose, returning a function
     that plays that choice, so the echo can hand back the same noise rather
     than the next one along. */
  var STIM_NOTES = [523.25, 659.25, 783.99, 880, 1046.5], stimN = 0;

  note('stim', function () {
    var hz = STIM_NOTES[stimN % STIM_NOTES.length];   /* chosen now, not on replay */
    return function () { blip(hz, 140); };
  });
  note('chairy', function () { return function () { blip(320, 160); }; });
  note('clock',  function () { return function () { blip(440, 90); }; });
  note('yell',   function () { return function () { yellNoise(); }; });

  /* A blip, and then the same blip again, quieter, a beat later. */
  note('echo', function () {
    return function () {
      blip(700, 90);
      window.setTimeout(function () { blip(700, 90, 0.055); }, 190);
    };
  });

  /* A line opening: the click of the handset, then a tone. The two ends are a
     fourth apart, because the whole toy is two people hearing one thing
     differently. */
  note('tel', function (end) {
    var hz = end === 1 ? 330 : 440;
    return function () {
      var c = ac(), t = c.currentTime;
      var n = hiss(c, 0.03), f = c.createBiquadFilter();
      f.type = 'highpass'; f.frequency.value = 1800;
      n.connect(f); f.connect(env(c, t, 0.26, 0.001, 0.028));
      n.start(t); n.stop(t + 0.04);
      tone(c, t + 0.045, 'sine', hz, 0, 0, 0.19, 0.02, 0.3);
    };
  });

  /* The same note, at the same pitch, for as long as the tin exists. */
  note('tin', function () { return function () { blip(349.23, 220); }; });

  /* A teaspoon against a mug. NOT the board's chime, which is a bell and rings
     for a second and a half: this is two high partials and almost no tail. */
  note('spoon', function () {
    return function () {
      var c = ac(), t = c.currentTime;
      tone(c, t, 'sine', 2100, 0, 0, 0.11, 0.002, 0.22);
      tone(c, t, 'sine', 3150, 0, 0, 0.05, 0.002, 0.15);
    };
  });

  /* Two notes down, quietly. The one noise in this room that comes AFTER the
     silence rather than before it: the button stops everything, then says so. */
  note('off', function () {
    return function () {
      var c = ac(), t = c.currentTime;
      tone(c, t, 'triangle', 392, 0, 0, 0.12, 0.006, 0.13);
      tone(c, t + 0.12, 'triangle', 262, 0, 0, 0.12, 0.006, 0.2);
    };
  });

  /* Somebody who has got onto the subject and is going quite fast now. */
  note('info', function () {
    return function () {
      var c = ac(), t = c.currentTime;
      [660, 740, 880, 830, 990].forEach(function (hz, i) {
        tone(c, t + i * 0.06, 'triangle', hz, 0, 0, 0.11, 0.004, 0.07);
      });
    };
  });

  toy('stim', function (el, r) {
    r.note(); stimN++;
    r.say('Stim box: ' + stimN + ' press' + (stimN === 1 ? '' : 'es') +
          '. Nobody is counting. (That was a lie, the box is counting, but it does not mind.)');
  });

  toy('chairy', function (el, r) {
    var lines = (el.dataset.lines || '').split('|');
    r.note();
    r.say('Chairy says: ' + lines[Math.floor(Math.random() * lines.length)]);
  });

  toy('clock', function (el, r) {
    var terms = (el.dataset.terms || '').split('|');
    r.note();
    r.say('The word clock says: ' + terms[new Date().getHours() % terms.length] + '.');
  });

  /* A recorded yell if the community has sent any, the synthesised one if not.
     The Audio object is built INSIDE the handler on purpose: nothing is fetched
     until somebody presses, which is the same consent model as the jukebox one
     room over. If the file will not play -- offline, or withdrawn between the
     build and the press -- it falls back rather than failing silently.

     It hands the whole playback to r.sound as one closure, so the echo replays
     THAT person's yell rather than drawing again. */
  toy('yell', function (el, r) {
    var list = [];
    try { list = JSON.parse(el.dataset.yells || '[]'); } catch (e) { list = []; }

    function synth() { r.note(); r.say('AAAAAAAAAAAAAAH!'); }
    if (!list.length) { synth(); return; }

    var pick = list[Math.floor(Math.random() * list.length)];
    var ok = true;
    r.sound(function () {
      if (playingYell) { try { playingYell.pause(); } catch (e) {} }
      var a = new Audio(pick.src);
      playingYell = a;
      var p = a.play();
      if (p && p['catch']) p['catch'](function () { if (ok) { ok = false; synth(); } });
    });
    /* Whose it is, said out loud rather than filed in the liner notes. */
    if (ok) r.say('AAAAAAAAAAAAAAH! — that one was ' + pick.who + '.');
  });

  /* Echolalia. It gives back the last thing the room said AND the last noise it
     made, both unchanged, and records neither -- so pressing it twice gives you
     the original twice rather than an echo of an echo. Saying a thing back is
     not a fault and this toy does not treat it as one: no "did you mean", no
     correction, no second version. */
  toy('echo', function (el, r) {
    var t = r.last();
    if (!t) { r.note(); r.say(el.dataset.empty); return; }
    if (!r.replay()) r.note();
    r.echo(t);
  });

  /* The double empathy problem, Damian Milton's. Two handsets, one encounter,
     and the toy NEVER says which account was right, because the whole idea is
     that neither was wrong. Pick up both ends and the next press is a new call. */
  toy('tel', function (el, r, n) {
    var calls = [];
    try { calls = JSON.parse(el.dataset.calls || '[]'); } catch (e) { calls = []; }
    if (!calls.length) return;
    var s = el._tel || (el._tel = { at: 0, heard: {} });
    var call = calls[s.at], side = n === 0 ? 'a' : 'b';
    var hands = el.querySelectorAll('.handset');
    var label = hands[n] ? hands[n].textContent : 'This end';
    r.note(n);
    r.say(label + ', on ' + call.about + ': ' + call[side]);
    s.heard[side] = true;
    if (s.heard.a && s.heard.b) { s.at = (s.at + 1) % calls.length; s.heard = {}; }
  });

  /* Safe food. The same sentence and the same note every time, for ever, which
     is the entire toy. speak() is what keeps the words audible on the second
     press; the note needs no such help, because a sound is a change. */
  toy('tin', function (el, r) { r.note(); r.say(el.dataset.says); });

  /* Spoon theory, Christine Miserandino's. It hands out the SENTENCES rather
     than the spoons: she invented them to explain a limit to somebody across a
     table, and a drawer of infinite spoons would quietly delete the limit while
     looking generous. Nothing is counted here and nothing is deducted. */
  toy('spoon', function (el, r) {
    var lines = [];
    try { lines = JSON.parse(el.dataset.sentences || '[]'); } catch (e) { lines = []; }
    if (!lines.length) return;
    var s = el._spoon || (el._spoon = { at: Math.floor(Math.random() * lines.length) });
    r.note();
    r.say('Take one: ' + lines[s.at]);
    s.at = (s.at + 1) % lines.length;
  });

  /* The way out. Closing the context kills everything the sound board has
     scheduled, including notes that have not started yet; the next press builds
     a new one, which asks for the same consent the first press did. No
     confirmation and nothing to undo -- a stop button that checks whether you
     meant it is not a stop button.

     ITS OWN NOISE COMES AFTER THE SILENCE, which is the only order that makes
     sense for this button and is why it is played once the stopping is done. */
  toy('off', function (el, r) {
    var was = !!ctx;
    if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; }
    var media = document.querySelectorAll('audio');
    for (var i = 0; i < media.length; i++) {
      if (!media[i].paused) { was = true; media[i].pause(); }
    }
    if (playingYell) { try { playingYell.pause(); } catch (e) {} playingYell = null; }
    r.note();
    r.say(was ? el.dataset.said : el.dataset.quiet);
  });

  /* An infodump is a gift and this one is not sorry. It goes deeper on one
     subject until it runs out, then starts on the next, which is also what
     happens. Every subject is ours or is credited on the way past. */
  toy('info', function (el, r) {
    var dumps = [];
    try { dumps = JSON.parse(el.dataset.dumps || '[]'); } catch (e) { dumps = []; }
    if (!dumps.length) return;
    var s = el._info || (el._info = { at: 0, part: 0 });
    var d = dumps[s.at];
    r.note();
    r.say((s.part === 0 ? 'About ' + d.subject + '. ' : '') + d.parts[s.part]);
    s.part++;
    if (s.part >= d.parts.length) { s.part = 0; s.at = (s.at + 1) % dumps.length; }
  });


  function playhouse() {
    var say = document.getElementById('playhouse-says');
    if (!say) return;
    var tiles = document.querySelectorAll('[data-toy]');
    for (var i = 0; i < tiles.length; i++) (function (el) {
      var fn = TOYS[el.dataset.toy];
      if (!fn) return;                 /* make-toys.py refuses this at build time */
      var mine = el.querySelector('.toy__said');
      var r = {
        say:  function (t) { speak(say, t, true, mine); },
        echo: function (t) { speak(say, t, false, mine); },
        last: function () { return lastSaid; },
        /* Make this toy's own noise. The factory is called now, so what gets
           remembered is the sound that actually played. */
        note: function (arg) {
          var make = NOTES[el.dataset.toy];
          if (make) sound(make(arg));   /* make-toys.py refuses a toy with none */
        },
        sound: sound,
        replay: replay
      };
      /* A tile with handsets is not itself a button: the controls are inside it,
         and each one tells the handler which end it is. */
      var hands = el.querySelectorAll('.handset');
      if (hands.length) {
        for (var h = 0; h < hands.length; h++) (function (b, n) {
          b.addEventListener('click', function () { fn(el, r, n); });
        }(hands[h], h));
        return;
      }
      el.addEventListener('click', function () { fn(el, r); });
    }(tiles[i]));
  }

  /* ── The superposition panel ─────────────────────────────────────────────
     Three states, and "leave it open" is a real answer rather than a decline. */
  function superposition() {
    var panel = document.querySelector('.collapse');
    if (!panel) return;
    var fringe = document.querySelector('.fringe');
    var read = document.getElementById('fringe-reading');
    var readings = document.getElementById('readings');
    var btns = panel.querySelectorAll('button');

    /* "neither one wrong" used to sit in the open state and it was the wrong
       claim: for the diagnostic encounter this room is about, the two readings
       are not equally true. The captions now say what the recorded passages
       say. Highlighting a passage is all a button does here — it never starts
       audio, in this room as in every other. */
    var STATES = {
      a: ['collapsed to A — the instrument\u2019s report, filed as the whole truth', 'a'],
      b: ['collapsed to B — the same wall, measured by something else', 'b'],
      open: ['both patterns at once — only one of them knows it is a measurement', 'open']
    };

    var picks = document.querySelectorAll('.measuring__btn');
    var term = picks.length ? picks[0].dataset.term : null;

    /* Which passage lights up depends on BOTH choices: the term being measured
       and the way it was collapsed. That is the whole point of the picker --
       an instrument and an object, not an instrument alone. */
    function mark() {
      if (!readings) return;
      var all = readings.querySelectorAll('.reading');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('reading--collapsed');
      if (!term) return;
      var st = readings.dataset.state || 'open';
      var hit = readings.querySelector(
        '.reading[data-term="' + term + '"][data-reading-state="' + st + '"]');
      if (hit) hit.classList.add('reading--collapsed');
    }

    function apply(k) {
      if (fringe) fringe.dataset.state = STATES[k][1];
      if (readings) readings.dataset.state = STATES[k][1];
      if (read) read.textContent = STATES[k][0];
      mark();
    }

    for (var pi = 0; pi < picks.length; pi++) {
      picks[pi].addEventListener('click', function () {
        term = this.dataset.term;
        for (var j = 0; j < picks.length; j++) {
          picks[j].setAttribute('aria-pressed', String(picks[j] === this));
        }
        if (readings) readings.dataset.term = term;   /* relabels the play control */
        mark();
      });
    }

    if (readings && term) readings.dataset.term = term;
    apply('open');

    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        var k = this.dataset.state;
        for (var j = 0; j < btns.length; j++) btns[j].setAttribute('aria-pressed', String(btns[j] === this));
        apply(k);
      }.bind(btns[i]));
    }
  }

  /* ── Stitched playback ───────────────────────────────────────────────────
     The panel collapses to a reading; this plays that reading's passages in
     order. One press starts a sequence, which is still press-to-play: the
     visitor asked for the whole thing. What makes that honest is the label —
     it says how many passages and how long BEFORE the press, so nobody gets
     four minutes they did not ask for. Collapsing still makes no sound at all.

     Enhancement only. The button ships hidden and this reveals it, so a page
     without JavaScript shows five ordinary players and no dead control. */
  function sequences() {
    var band = document.getElementById('readings');
    var btn = document.querySelector('.seqplay__btn');
    var now = document.querySelector('.seqplay__now');
    if (!band || !btn) return;

    var items = [].slice.call(band.querySelectorAll('.reading[data-sequences]'));
    if (!items.length) return;
    var queue = null, at = -1;

    function listFor(state) {
      var out = [], term = band.dataset.term;
      for (var i = 0; i < items.length; i++) {
        var sec = items[i];
        if (term && sec.dataset.term !== term) continue;
        if (sec.dataset.sequences.split(' ').indexOf(state) < 0) continue;
        var h = sec.querySelector('h4');
        out.push({ sec: sec, audio: sec.querySelector('audio'),
                   title: h ? h.textContent : 'this passage',
                   secs: parseInt(sec.dataset.seconds || '0', 10) });
      }
      return out;
    }

    function spoken(t) {
      var m = Math.floor(t / 60), s = t % 60;
      var mm = m + ' minute' + (m === 1 ? '' : 's');
      var ss = s + ' second' + (s === 1 ? '' : 's');
      if (!m) return ss;
      return s ? mm + ' ' + ss : mm;
    }

    function state() { return band.dataset.state || 'open'; }

    function relabel() {
      if (btn.dataset.mode === 'stop') { btn.textContent = 'stop'; btn.disabled = false; return; }
      var all = listFor(state()), have = [];
      for (var i = 0; i < all.length; i++) if (all[i].audio) have.push(all[i]);
      if (!have.length) {
        btn.textContent = 'nothing in this sequence is recorded yet';
        btn.disabled = true;
        return;
      }
      var total = 0, known = true;
      for (var j = 0; j < have.length; j++) {
        if (have[j].secs) total += have[j].secs; else known = false;
      }
      var name = state() === 'open' ? 'the whole sequence' : 'the ' + state().toUpperCase() + ' sequence';
      var txt = 'play ' + name + ' — ' + have.length + (have.length === 1 ? ' passage' : ' passages');
      if (known && total) txt += ', ' + spoken(total);
      if (have.length < all.length) {
        txt += ' (' + (all.length - have.length) + ' not recorded yet)';
      }
      btn.textContent = txt;
      btn.disabled = false;
    }

    function unmark() {
      for (var i = 0; i < items.length; i++) items[i].classList.remove('reading--playing');
    }

    function halt(msg) {
      if (queue && queue[at] && queue[at].audio) queue[at].audio.pause();
      queue = null; at = -1;
      unmark();
      btn.dataset.mode = 'play';
      relabel();
      if (now) now.textContent = msg || '';
    }

    function step() {
      if (!queue) return;
      at++;
      if (at >= queue.length) { halt('Sequence finished.'); return; }
      var cur = queue[at];
      unmark();
      cur.sec.classList.add('reading--playing');
      if (now) now.textContent = 'Playing ' + (at + 1) + ' of ' + queue.length + ': ' + cur.title;
      try { cur.audio.currentTime = 0; } catch (e) {}
      var p = cur.audio.play();
      if (p && p.catch) p.catch(function () {
        halt('The browser would not continue on its own. Press a passage to carry on.');
      });
    }

    btn.addEventListener('click', function () {
      if (btn.dataset.mode === 'stop') { halt('Stopped.'); return; }
      var all = listFor(state()), q = [];
      for (var i = 0; i < all.length; i++) if (all[i].audio) q.push(all[i]);
      if (!q.length) return;
      queue = q; at = -1;
      btn.dataset.mode = 'stop';
      relabel();
      step();
    });

    /* 'ended' and 'play' do not bubble, so listen on the way down. */
    band.addEventListener('ended', function (e) {
      if (queue && queue[at] && e.target === queue[at].audio) step();
    }, true);
    band.addEventListener('play', function (e) {
      if (queue && queue[at] && e.target !== queue[at].audio) halt('');
    }, true);

    if (window.MutationObserver) {
      new MutationObserver(relabel).observe(band, {
        attributes: true, attributeFilter: ['data-state', 'data-term']
      });
    }

    btn.hidden = false;
    relabel();
  }

  /* ── The Faery Yurt's sounds ─────────────────────────────────────────────
     Three tiles in Helen's regulation nook are buttons, and each plays a couple
     of seconds of somebody making a noise about what is on the tile. The Audio
     object is built INSIDE the handler, the same as the yell button's: nothing
     is fetched until somebody presses, which is the consent model the whole
     street runs on. Whose voice it is gets said out loud into the live region
     rather than only filed in the liner notes.

     ONE `playing` ACROSS ALL OF THEM, not one per button: pressing a second
     tile while the first is still going should be a change of mind, not two
     people talking over each other. The markup, the runtime on each label and
     the credits all come out of tools/make-yurt-sound.py; this only presses
     play. */
  function yurtEggs() {
    var eggs = document.querySelectorAll('.egg[data-src]');
    if (!eggs.length) return;
    var say = document.getElementById('yurt-says');
    var playing = null, lit = null;

    function stop() {
      if (playing) { try { playing.pause(); } catch (e) {} }
      if (lit) lit.removeAttribute('data-playing');
      playing = null; lit = null;
    }

    for (var i = 0; i < eggs.length; i++) {
      (function (egg) {
        egg.addEventListener('click', function () {
          stop();
          var a = new Audio(egg.dataset.src);
          playing = a; lit = egg;
          egg.setAttribute('data-playing', '');
          a.addEventListener('ended', function () { if (lit === egg) stop(); });
          var p = a.play();
          if (say) say.textContent = egg.dataset.said || '';
          /* Offline, or a recording withdrawn between the build and the press:
             say so rather than leaving a button that looks broken and explains
             nothing. */
          if (p && p['catch']) p['catch'](function () {
            stop();
            if (say) say.textContent = 'That one will not play just now.';
          });
        });
      }(eggs[i]));
    }
  }

  function go() { dial(); playhouse(); soundboard(); superposition(); sequences(); yurtEggs(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();
