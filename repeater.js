/* =============================================================================
   The open line at The Repeater.

   A CALL KEPT OPEN IN THE BACKGROUND, WITH NOBODY ON THE OTHER END. Pressing
   the button makes a quiet, steady noise with the Web Audio API, here, in the
   browser, and pressing again stops it. That is all this file does.

   NOTHING IS FETCHED, NOTHING IS SENT AND NOTHING LISTENS. There is no request
   in this file, no microphone, no storage. make-repeater.py refuses a form, a
   fetch, a beacon, a socket or a call for the microphone anywhere in the room
   or in this file, because a page about being reachable is exactly where a
   "leave us a message" box would arrive as a friendly edit.

   THE LOUDEST IT CAN BE IS MAX_GAIN, AND make-repeater.py REFUSES IT ABOVE 0.2.
   A line left open is a thing somebody forgets is on. The slider scales under
   that ceiling rather than up to the system volume, so no position of it can
   make this the loud thing in the room.

   IT IS NOISE AND NOT A TONE. Brown noise -- each sample a small random step
   from the last -- has most of its energy low down, which is the soft hiss of
   an open line rather than the bright one of a detuned radio. It does not
   pulse, fade or change on its own; the only thing that changes it is the
   slider, and the only thing that stops it is the button.
   ============================================================================= */
(function () {
  'use strict';

  var MAX_GAIN = 0.16;

  var set = document.getElementById('rp-set');
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!set || !AC) return;

  var openBtn  = document.getElementById('rp-open');
  var closeBtn = document.getElementById('rp-close');
  var level    = document.getElementById('rp-level');
  var stateEl  = document.getElementById('rp-state');
  var status   = document.getElementById('rp-status');

  var ctx = null, src = null, gain = null;

  function volume() { return MAX_GAIN * (parseInt(level.value, 10) / 100); }

  function noise(c) {
    var len = c.sampleRate * 4;
    var buf = c.createBuffer(1, len, c.sampleRate);
    var d = buf.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3.5;
    }
    return buf;
  }

  function open() {
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
    src = ctx.createBufferSource();
    src.buffer = noise(ctx);
    src.loop = true;
    var low = ctx.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = 900;
    gain = ctx.createGain();
    gain.gain.value = volume();
    src.connect(low); low.connect(gain); gain.connect(ctx.destination);
    src.start();
    stateEl.textContent = 'THE LINE IS OPEN';
    openBtn.hidden = true;
    closeBtn.hidden = false;
    closeBtn.focus();
    status.textContent = 'The line is open. Nobody is on the other end. It runs until you close it.';
  }

  function close() {
    if (src) { src.stop(); src.disconnect(); src = null; }
    stateEl.textContent = 'THE LINE IS CLOSED';
    closeBtn.hidden = true;
    openBtn.hidden = false;
    openBtn.focus();
    status.textContent = 'The line is closed.';
  }

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  level.addEventListener('input', function () {
    if (gain) gain.gain.value = volume();
  });
  level.setAttribute('aria-valuetext', level.value + ' percent of a quiet line');
  level.addEventListener('change', function () {
    level.setAttribute('aria-valuetext', level.value + ' percent of a quiet line');
  });

  set.hidden = false;
})();
