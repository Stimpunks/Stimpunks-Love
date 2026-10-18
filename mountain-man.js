/* The Emergent Future Worlds Meets Mountain Man: David's cabin at the summit,
   Helen Edgar's relay of his brief, 2026-10-18. This drives what the room
   does after a press, and only after a press:

   ONE SWITCH. The fire, the LED strips, the diffuser, the big screen's plate
   and the speakers go on together and off together, and the words beside the
   switch say which. The cabin is drawn ON and STILL: the fire lit, the strips
   lit, the plate ready. Pressing the switch off darkens all of it and puts the
   plate away; pressing it on again brings it all back, and from that press the
   fire burns and the diffuser's wisps rise, at Regular and MAX. At Gentle they
   are lit and still, because Gentle takes away the motion and never the words.
   NOTHING MOVES BEFORE THE PRESS, at any setting.

   NOTHING FLICKERS AND NOTHING FLASHES. The fire's sway is a slow change of
   shape and a glow that moves between two close values over a second and a
   half; the wisps rise and fade; a colour drift moves one strip colour into
   the next over three seconds and holds it for six. None of it crosses WCAG's
   flash line, which is Club Chronic's rule and the fractal window's limit.

   THE LIGHTS ARE THE VISITOR'S TO COLOUR: Next colour steps through the
   cabin's own four, at every setting. The drift runs only at MAX GLITTER, only
   once pressed, and stops when the dial comes down.

   THE HOWL IS ARITHMETIC. One wolf starts, two more join, about five seconds,
   made with the browser's own oscillators when the button is pressed and not
   before: no recording, nothing fetched, nothing hosted. MAX_GAIN is the
   loudest it can be, and tools/make-mountain-cabin.py refuses it above 0.2,
   the Repeater's ceiling.

   THE WINDOW OPENS ONTO DAVID'S PHOTOGRAPHS: a dialog the tool fills from
   data/polaroids.json records, and says it is waiting while there are none.

   It stores nothing, sends nothing and counts nothing. */
(function () {
  'use strict';
  var svg = document.querySelector('svg.efw-scene__draw');
  var row = document.querySelector('[data-efw-controls]');
  var says = document.querySelector('[data-efw-says]');
  if (!svg || !row || !says) return;
  var MAX_GAIN = 0.16;
  // The strips' colours, in the order Next colour and the drift go round
  // them: the cabin's own four, then the whole rainbow (Helen's ask).
  var LEDS = ['--efw-led-1', '--efw-led-2', '--efw-led-3', '--efw-led-4',
              '--efw-rb-red', '--efw-rb-orange', '--efw-rb-yellow', '--efw-rb-green', '--efw-rb-blue', '--efw-rb-indigo', '--efw-rb-violet'];
  // The oils on the shelf by the diffuser, Helen's list, in her order. A
  // scent here is a smell and nothing else: the words never say what one does.
  var SCENTS = ['lavender', 'chamomile', 'tea tree', 'orange blossom', 'chocolate', 'marshmallow', 'cupcakes'];
  var scent = 0;
  var plate = document.querySelector('[data-efw-plate]');
  var howlRow = document.querySelector('[data-efw-howl]');
  var gallery = document.querySelector('[data-efw-gallery]');
  var flames = svg.querySelectorAll('.efw-fire__flame');
  var heart = svg.querySelector('.efw-fire__heart');
  var glow = svg.querySelector('.efw-fire__glow');
  var wisps = svg.querySelectorAll('.efw-wisp');
  var coffee = svg.querySelectorAll('.efw-coffee path');

  function level() { return document.documentElement.getAttribute('data-intensity') || 'regular'; }
  function say(text) {
    says.textContent = '';
    setTimeout(function () { says.textContent = text; }, 60);
  }
  function button(parent, words) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'efw-btn';
    b.textContent = words;
    parent.appendChild(b);
    parent.appendChild(document.createTextNode(' '));
    return b;
  }

  /* ── The colour of the strips ─────────────────────────────────────────── */
  var led = 0, drifting = false, driftRaf = 0;
  function hex(name) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v;
  }
  function rgb(h) {
    h = h.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function setLed(value) { svg.style.setProperty('--efw-led', value); }
  function next() {
    led = (led + 1) % LEDS.length;
    setLed('var(' + LEDS[led] + ')');
    return led;
  }
  var NAMES = ['teal', 'magenta', 'lime', 'periwinkle', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

  function drift(now) {
    if (!drifting) return;
    if (level() !== 'max' || !on) { stopDrift('The lights have stopped drifting, because the dial came down.'); return; }
    var HOLD = 6000, FADE = 3000, span = HOLD + FADE;
    var t = (now - driftStart) % span, step = Math.floor((now - driftStart) / span);
    var a = rgb(hex(LEDS[(led + step) % LEDS.length])), b = rgb(hex(LEDS[(led + step + 1) % LEDS.length]));
    var k = t < HOLD ? 0 : (t - HOLD) / FADE;
    k = k * k * (3 - 2 * k);
    driftAt = (led + step + (k > 0.5 ? 1 : 0)) % LEDS.length;
    var c = a.map(function (x, i) { return Math.round(x + (b[i] - x) * k); });
    setLed('rgb(' + c.join(',') + ')');
    driftRaf = requestAnimationFrame(drift);
  }
  var driftStart = 0, driftAt = 0;
  function stopDrift(words) {
    // Stopping settles on the colour the drift had reached, never back to the
    // one it started from: a jump back would be the one hard change in here.
    drifting = false;
    cancelAnimationFrame(driftRaf);
    led = driftAt;
    setLed('var(' + LEDS[led] + ')');
    if (driftBtn) driftBtn.textContent = 'Let the lights drift';
    if (words) say(words);
  }

  /* ── The fire and the wisps ───────────────────────────────────────────── */
  var on = true, lit = false, raf = 0, t0 = 0;
  function still() {
    for (var i = 0; i < flames.length; i++) flames[i].removeAttribute('transform');
    if (heart) heart.setAttribute('opacity', '1');
    if (glow) glow.setAttribute('opacity', '.18');
    for (var j = 0; j < wisps.length; j++) { wisps[j].removeAttribute('transform'); wisps[j].setAttribute('opacity', '1'); }
    for (var k = 0; k < coffee.length; k++) { coffee[k].removeAttribute('transform'); coffee[k].setAttribute('opacity', '1'); }
  }
  function frame(now) {
    if (!lit || !on) return;
    if (level() === 'gentle') { still(); raf = requestAnimationFrame(frame); return; }
    var t = (now - t0) / 1000;
    for (var i = 0; i < flames.length; i++) {
      var s = 1 + 0.035 * Math.sin(t * 1.7 + i * 1.3), sx = 1 + 0.025 * Math.sin(t * 1.1 + i);
      flames[i].setAttribute('transform', 'translate(155 358) scale(' + sx.toFixed(3) + ' ' + s.toFixed(3) + ') translate(-155 -358)');
    }
    if (heart) heart.setAttribute('opacity', (0.92 + 0.08 * Math.sin(t * 0.9)).toFixed(3));
    if (glow) glow.setAttribute('opacity', (0.17 + 0.03 * Math.sin(t * 0.7)).toFixed(3));
    for (var j = 0; j < wisps.length; j++) {
      var p = ((t * 0.18 + j * 0.5) % 1);
      wisps[j].setAttribute('transform', 'translate(' + (Math.sin(t * 0.8 + j) * 3).toFixed(1) + ' ' + (-p * 34).toFixed(1) + ')');
      wisps[j].setAttribute('opacity', (1 - p).toFixed(2));
    }
    for (var k = 0; k < coffee.length; k++) {
      var q = ((t * 0.25 + k * 0.5) % 1);
      coffee[k].setAttribute('transform', 'translate(0 ' + (-q * 14).toFixed(1) + ')');
      coffee[k].setAttribute('opacity', (1 - q).toFixed(2));
    }
    raf = requestAnimationFrame(frame);
  }
  function light() {
    lit = true; t0 = performance.now();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }

  /* ── The one switch ───────────────────────────────────────────────────── */
  function setOn(state) {
    on = state;
    svg.classList.toggle('is-off', !on);
    if (plate) plate.hidden = !on;
    if (howlBtn) howlBtn.disabled = false;
    if (!on) {
      lit = false; cancelAnimationFrame(raf); still();
      if (drifting) stopDrift();
      switchBtn.textContent = 'Switch everything on';
      say('Everything is off: the fire is out, the strips are dark, the diffuser has stopped (the ' + SCENTS[scent] + ' stays in it), the big screen’s plate is put away, and the speakers are off. The moon is still up.');
    } else {
      light();
      switchBtn.textContent = 'Switch everything off';
      say(level() === 'gentle'
        ? 'Everything is on: the fire is lit, the strips are on in ' + NAMES[led] + ', the diffuser is on with ' + SCENTS[scent] + ' in it, the big screen’s plate is back, and the speakers are on. At Gentle the fire and the wisps stay still.'
        : 'Everything is on: the fire is burning, the strips are on in ' + NAMES[led] + ', the diffuser’s wisps are rising with ' + SCENTS[scent] + ' in them, the big screen’s plate is back, and the speakers are on.');
    }
  }

  /* ── The howl ─────────────────────────────────────────────────────────── */
  var ctx = null, howling = false;
  function voice(c, at, base, detune, gainTop) {
    var o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = 'sawtooth';
    o.detune.value = detune;
    f.type = 'lowpass'; f.frequency.value = 900; f.Q.value = 2;
    var fr = o.frequency;
    fr.setValueAtTime(base, at);
    fr.exponentialRampToValueAtTime(base * 2.2, at + 1.1);
    fr.setValueAtTime(base * 2.2, at + 2.0);
    fr.exponentialRampToValueAtTime(base * 1.5, at + 3.4);
    var v = c.createOscillator(), va = c.createGain();
    v.frequency.value = 5.2; va.gain.value = base * 0.03;
    v.connect(va); va.connect(fr);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gainTop, at + 0.5);
    g.gain.setValueAtTime(gainTop, at + 2.6);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 3.6);
    o.connect(f); f.connect(g); g.connect(c.destination);
    o.start(at); v.start(at); o.stop(at + 3.7); v.stop(at + 3.7);
  }
  function howl() {
    if (howling) return;
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    howling = true;
    howlBtn.disabled = true;
    var t = ctx.currentTime + 0.05, top = MAX_GAIN / 3;
    voice(ctx, t, 180, 0, top);
    voice(ctx, t + 0.9, 150, -12, top * 0.9);
    voice(ctx, t + 1.6, 210, 9, top * 0.8);
    say('The pack is howling: one wolf, then the others.');
    setTimeout(function () {
      howling = false; howlBtn.disabled = false;
      say('The pack has gone quiet.');
    }, 5400);
  }

  /* ── The window ───────────────────────────────────────────────────────── */
  function openWindow() {
    if (!gallery || typeof gallery.showModal !== 'function') return;
    gallery.showModal();
  }
  function closeWindow() { if (gallery && gallery.open) gallery.close(); }

  /* ── Wiring ───────────────────────────────────────────────────────────── */
  var switchBtn = button(row, 'Switch everything off');
  var nextBtn = button(row, 'Next colour');
  var scentBtn = button(row, 'Change the scent');
  scentBtn.addEventListener('click', function () {
    scent = (scent + 1) % SCENTS.length;
    say(on ? 'The diffuser has ' + SCENTS[scent] + ' in it now.' : 'The diffuser has ' + SCENTS[scent] + ' in it now, and is off until you switch everything on.');
  });
  var driftBtn = button(row, 'Let the lights drift');
  driftBtn.hidden = level() !== 'max';
  new MutationObserver(function () {
    var max = level() === 'max';
    driftBtn.hidden = !max;
    if (!max && drifting) stopDrift('The lights have stopped drifting, because the dial came down.');
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-intensity'] });
  row.hidden = false;
  switchBtn.addEventListener('click', function () { setOn(!on); });
  nextBtn.addEventListener('click', function () {
    if (!on) { say('The strips are off. Switch everything on first.'); return; }
    if (drifting) stopDrift();
    say('The strips are ' + NAMES[next()] + '.');
  });
  driftBtn.addEventListener('click', function () {
    if (!on) { say('The strips are off. Switch everything on first.'); return; }
    if (drifting) { stopDrift(); say('The lights have stopped drifting, on ' + NAMES[led] + '.'); return; }
    if (level() !== 'max') { say('The lights drift only at MAX GLITTER.'); return; }
    drifting = true; driftStart = performance.now();
    driftBtn.textContent = 'Stop the lights drifting';
    say('The lights are drifting from one colour to the next, round the rainbow, slowly, until you stop them.');
    driftRaf = requestAnimationFrame(drift);
  });
  var howlBtn = null;
  if (howlRow) {
    howlBtn = button(howlRow, 'Hear the wolves howl (about five seconds)');
    howlRow.hidden = false;
    howlBtn.addEventListener('click', howl);
  }
  var openBtn = document.querySelector('[data-efw-open-window]');
  if (openBtn) openBtn.addEventListener('click', openWindow);
  var win = svg.querySelector('[data-efw-window]');
  if (win) { win.style.cursor = 'pointer'; win.addEventListener('click', openWindow); }
  var closeBtn = document.querySelector('[data-efw-close-window]');
  if (closeBtn) closeBtn.addEventListener('click', closeWindow);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { cancelAnimationFrame(raf); cancelAnimationFrame(driftRaf); }
    else { if (lit && on) light(); if (drifting) { driftStart = performance.now(); driftRaf = requestAnimationFrame(drift); } }
  });
})();
