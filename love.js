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
  function blip(freq, ms) {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      var o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
      o.type = 'triangle';
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + ms / 1000 + 0.02);
    } catch (e) { /* no audio available: the button still works, just quietly */ }
  }

  /* ── The Playhouse ──────────────────────────────────────────────────────── */
  function playhouse() {
    var say = document.getElementById('playhouse-says');
    if (!say) return;

    function announce(text) { say.textContent = text; }

    var stim = document.querySelector('[data-toy="stim"]');
    var notes = [523.25, 659.25, 783.99, 880, 1046.5];
    var n = 0;
    if (stim) stim.addEventListener('click', function () {
      blip(notes[n % notes.length], 140); n++;
      announce('Stim box: ' + n + ' press' + (n === 1 ? '' : 'es') + '. Nobody is counting. (That was a lie, the box is counting, but it does not mind.)');
    });

    var yell = document.querySelector('[data-toy="yell"]');
    if (yell) yell.addEventListener('click', function () {
      blip(180, 420);
      announce('AAAAAAAAAAAAAAH!');
    });

    var clock = document.querySelector('[data-toy="clock"]');
    if (clock) clock.addEventListener('click', function () {
      var terms = clock.dataset.terms.split('|');
      var hour = new Date().getHours();
      announce('The word clock says: ' + terms[hour % terms.length] + '.');
      blip(440, 90);
    });

    var chairy = document.querySelector('[data-toy="chairy"]');
    if (chairy) chairy.addEventListener('click', function () {
      var lines = chairy.dataset.lines.split('|');
      announce('Chairy says: ' + lines[Math.floor(Math.random() * lines.length)]);
      blip(320, 160);
    });
  }

  /* ── The superposition panel ─────────────────────────────────────────────
     Three states, and "leave it open" is a real answer rather than a decline. */
  function superposition() {
    var panel = document.querySelector('.collapse');
    if (!panel) return;
    var fringe = document.querySelector('.fringe');
    var read = document.getElementById('fringe-reading');
    var btns = panel.querySelectorAll('button');

    var STATES = {
      a: ['collapsed to A — one pattern, measured, reported as the whole truth', 'a'],
      b: ['collapsed to B — the other pattern, equally measured, equally partial', 'b'],
      open: ['two patterns, one wall, neither one wrong', 'open']
    };

    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        var k = this.dataset.state;
        for (var j = 0; j < btns.length; j++) btns[j].setAttribute('aria-pressed', String(btns[j] === this));
        if (fringe) fringe.dataset.state = STATES[k][1];
        if (read) read.textContent = STATES[k][0];
      }.bind(btns[i]));
    }
  }

  function go() { dial(); playhouse(); superposition(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();
