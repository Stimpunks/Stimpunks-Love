/* By the door of the Faery Yurt: the bell string, and the saucer of milk,
   each its own function below, Helen Edgar's asks of 2026-11-09.

   THE BELL STRING: a little brass
   bell on a cord by the door flap. Press to ring it. It never rings by itself,
   at any setting, and the chime is made here out of arithmetic: four quick
   strikes of one small bell, three sine partials each, a jingle ringing out over
   about two and a half seconds, never a
   recording and nothing fetched. MAX_GAIN is the ceiling the Repeater, Stay
   Breezy and the mountain cabin's howl keep to; the whole bell swings on its cord, the clapper with it, and two
   sound lines show at Regular and MAX, and at Gentle only the
   words change (Gentle takes away the wobble, never the words). It keeps
   nothing and sends nothing.

   Cel Street lifts this markup to the door of the yurt and wires this script
   to it, so the bell there is this bell. The button ships hidden, because with
   no script it would do nothing. */
(function () {
  'use strict';
  var MAX_GAIN = 0.16;
  var box = document.querySelector('[data-yurt-bell]');
  if (!box) return;
  var btn = box.querySelector('[data-yurt-bell-ring]');
  var said = box.querySelector('[data-yurt-bell-said]');
  var art = box.querySelector('.yurt-bell__art');
  if (!btn || !said) return;
  var ctx = null, timer = 0;
  function gentle() { return document.documentElement.getAttribute('data-intensity') === 'gentle'; }
  // Four quick strikes, a jingle, each a small bell of three sine partials
  // (Helen, 2026-11-09: "sway and jingle more"), ringing out over about two
  // and a half seconds; the strikes overlap under one master gain held at
  // MAX_GAIN, so the whole jingle stays under the ceiling.
  var STRIKES = [[0, 1760, 1], [0.17, 1864, 0.8], [0.38, 1760, 0.9], [0.72, 1976, 0.7], [1.1, 1760, 0.5]];
  function strike(ctx, out, at, hz, how) {
    [[1, 1], [1.5, 0.35], [2.5, 0.18]].forEach(function (p) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(hz * p[0], at);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(p[1] * how * 0.5, at + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, at + 1.4 + p[1] * 0.5);
      o.connect(g); g.connect(out);
      o.start(at); o.stop(at + 2.1);
    });
  }
  function ring() {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      var t = ctx.currentTime;
      var out = ctx.createGain();
      out.gain.setValueAtTime(MAX_GAIN, t);
      out.gain.setValueAtTime(MAX_GAIN, t + 2.0);
      out.gain.exponentialRampToValueAtTime(0.001, t + 3.2);
      out.connect(ctx.destination);
      STRIKES.forEach(function (st) { strike(ctx, out, t + st[0], st[1], st[2]); });
    } catch (e) { /* no audio here; the words still say it rang */ }
    said.textContent = 'Ting-a-ling. The bell rang, and the yurt knows you are here.';
    if (art && !gentle()) {
      art.classList.remove('is-rung');
      void art.getBoundingClientRect();
      art.classList.add('is-rung');
      clearTimeout(timer);
      timer = setTimeout(function () { art.classList.remove('is-rung'); }, 2700);
    }
  }
  btn.hidden = false;
  btn.addEventListener('click', ring);
  window.loveYurtBell = { ring: ring };
})();

/* THE SAUCER OF MILK: Stir the milk takes the spoon twice round the saucer,
   sloshes the milk, sends rings out across it and throws a few drops up, over
   about two and a half seconds, at Regular and MAX, with the words saying so
   at every setting; at Gentle only the words (love.css §14 has the drawing). Nothing stirs it by itself, nothing is
   kept or sent, and it makes no sound. The button ships hidden, because with
   no script it would do nothing. */
(function () {
  'use strict';
  var box = document.querySelector('[data-yurt-saucer]');
  if (!box) return;
  var btn = box.querySelector('[data-yurt-saucer-stir]');
  var said = box.querySelector('[data-yurt-saucer-said]');
  var art = box.querySelector('.yurt-saucer__art');
  if (!btn || !said) return;
  var timer = 0;
  function gentle() { return document.documentElement.getAttribute('data-intensity') === 'gentle'; }
  btn.hidden = false;
  btn.addEventListener('click', function () {
    said.textContent = 'Stirred. The spoon goes twice round, the milk ripples and splashes a little and settles, and the brownie pretends not to notice.';
    if (art && !gentle()) {
      art.classList.remove('is-stirred');
      void art.getBoundingClientRect();
      art.classList.add('is-stirred');
      clearTimeout(timer);
      timer = setTimeout(function () { art.classList.remove('is-stirred'); }, 3000);
    }
  });
})();

/* THE BASKET OF WINGS: Let the wings flutter (Helen, 2026-11-09) switches the
   flutter on at Regular, where otherwise they move only while the basket is
   hovered, and lets them rest at MAX, where they flutter by themselves. The
   class is all it does: love.css §14 holds the motion to the dial, so at
   Gentle the press changes nothing a visitor can see and the words say so.
   Nothing is kept, nothing is sent, and it makes no sound. The button ships
   hidden, because with no script it would do nothing. */
(function () {
  'use strict';
  var box = document.querySelector('[data-yurt-wings]');
  if (!box) return;
  var btn = box.querySelector('[data-yurt-wings-let]');
  var said = box.querySelector('[data-yurt-wings-said]');
  var art = box.querySelector('.yurt-wings__art');
  if (!btn || !said || !art) return;
  function level() { return document.documentElement.getAttribute('data-intensity') || 'regular'; }
  function fluttering() {
    if (art.classList.contains('is-fluttering')) return true;
    return level() === 'max' && !art.classList.contains('is-resting');
  }
  function wordsFor() {
    btn.textContent = fluttering() ? 'Let the wings rest' : 'Let the wings flutter';
  }
  btn.hidden = false;
  wordsFor();
  btn.addEventListener('click', function () {
    if (fluttering()) {
      art.classList.remove('is-fluttering');
      art.classList.add('is-resting');
      said.textContent = 'Resting. The wings lie still in the basket.';
    } else {
      art.classList.remove('is-resting');
      art.classList.add('is-fluttering');
      said.textContent = level() === 'gentle'
        ? 'The wings would flutter, but the dial is at Gentle, where nothing in the yurt moves; turn it up and they will.'
        : 'Fluttering. Each pair opens and closes on its own time, the moth slowest of all.';
    }
    wordsFor();
  });
  document.addEventListener('love-intensity', wordsFor);
})();
