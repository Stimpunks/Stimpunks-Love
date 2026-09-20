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

    function apply(k) {
      if (fringe) fringe.dataset.state = STATES[k][1];
      if (readings) readings.dataset.state = STATES[k][1];
      if (read) read.textContent = STATES[k][0];
    }
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
      var out = [];
      for (var i = 0; i < items.length; i++) {
        var sec = items[i];
        if (sec.dataset.sequences.split(' ').indexOf(state) < 0) continue;
        var h = sec.querySelector('h3');
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
        attributes: true, attributeFilter: ['data-state']
      });
    }

    btn.hidden = false;
    relabel();
  }

  function go() { dial(); playhouse(); superposition(); sequences(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();
