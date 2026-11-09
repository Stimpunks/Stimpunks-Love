/* The Faery Yurt's bell string, Helen Edgar's ask, 2026-11-09: a little brass
   bell on a cord by the door flap. Press to ring it. It never rings by itself,
   at any setting, and the chime is made here out of arithmetic: three sine
   partials of one small bell, decaying over a second and a half, never a
   recording and nothing fetched. MAX_GAIN is the ceiling the Repeater, Stay
   Breezy and the mountain cabin's howl keep to; the clapper swings and two
   sound lines show for a moment at Regular and MAX, and at Gentle only the
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
  function ring() {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      var t = ctx.currentTime;
      var out = ctx.createGain();
      out.gain.setValueAtTime(MAX_GAIN, t);
      out.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
      out.connect(ctx.destination);
      [[1760, 1], [2640, 0.35], [4400, 0.18]].forEach(function (p) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(p[0], t);
        g.gain.setValueAtTime(p[1], t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.2 + p[1] * 0.4);
        o.connect(g); g.connect(out);
        o.start(t); o.stop(t + 1.7);
      });
    } catch (e) { /* no audio here; the words still say it rang */ }
    said.textContent = 'Ting. The bell rang, and the yurt knows you are here.';
    if (art && !gentle()) {
      art.classList.remove('is-rung');
      void art.getBoundingClientRect();
      art.classList.add('is-rung');
      clearTimeout(timer);
      timer = setTimeout(function () { art.classList.remove('is-rung'); }, 1400);
    }
  }
  btn.hidden = false;
  btn.addEventListener('click', ring);
  window.loveYurtBell = { ring: ring };
})();
