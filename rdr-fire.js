/* rdr-fire.js: THE READING ROOM'S FIRE, CRACKLING. Helen Edgar's ask, 2026-11-11
   ("real fire in reading room with crackling fire sound, all real open source,
   not YouTube, want it to be on constantly"). Made of arithmetic in the
   browser, as the Faery Yurt's bell and the mountain cabin's howl are: no
   recording, nothing fetched, nothing hosted, nothing reaching anybody's
   server. Twelve seconds of fire are drawn once (a low rumble of brown noise,
   a hiss, and a few dozen pops and ticks of different sizes), joined end to
   end so the loop never clicks, and played round and round until the button
   is pressed again or the page is left: on constantly once asked for, and
   never by itself, because a browser lets no page make a sound before a press,
   and the street's oldest promise is that nothing plays until you press play.
   Under MAX_GAIN, the Repeater's ceiling. It keeps nothing and sends nothing.
   The room on Cel Street presses the same switch through window.loveFire.
   MIT, like every top-level script here. */
(function () {
  'use strict';
  var MAX_GAIN = 0.2, SECONDS = 12, ctx = null, src = null, gain = null, buffer = null;
  function hash(i, j) {
    var n = Math.imul(i + 17, 374761393) ^ Math.imul(j + 29, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  function draw(sr) {
    var n = Math.floor(sr * SECONDS), out = new Float32Array(n), i;
    // The rumble: brown noise, held low, the body of the fire.
    var b = 0, lp = 0;
    for (i = 0; i < n; i++) {
      b = (b + (Math.random() * 2 - 1) * 0.02) * 0.985;
      lp += (b - lp) * 0.012;
      out[i] = lp * 2.2;
    }
    // The hiss of the air through the logs, faint, high.
    var h1 = 0;
    for (i = 0; i < n; i++) { var w = Math.random() * 2 - 1; out[i] += (w - h1) * 0.012; h1 = w; }
    // The pops: a burst of noise with a quick decay, some with a tick in
    // them, each where the seed puts it, none alike, most small, a few big.
    for (var p = 0; p < 70; p++) {
      var t0 = Math.floor(hash(p, 1) * (n - sr)), big = hash(p, 2) > 0.85;
      var len = Math.floor(sr * (big ? 0.03 + hash(p, 3) * 0.04 : 0.004 + hash(p, 3) * 0.014));
      var amp = big ? 0.45 + hash(p, 4) * 0.3 : 0.12 + hash(p, 4) * 0.25, tick = hash(p, 5) > 0.5, f = 1200 + hash(p, 6) * 2800;
      for (var k = 0; k < len; k++) {
        var env = Math.exp(-k / (len * 0.28)), s = (Math.random() * 2 - 1) * amp * env;
        if (tick) s += Math.sin(k / sr * f * Math.PI * 2) * amp * 0.35 * env;
        out[t0 + k] += s;
      }
    }
    // The ends crossfaded over a fifth of a second, so the loop is seamless.
    var x = Math.floor(sr * 0.2);
    for (i = 0; i < x; i++) { var u = i / x; out[i] = out[i] * u + out[n - x + i] * (1 - u); }
    for (i = 0; i < n; i++) out[i] = Math.max(-1, Math.min(1, out[i]));
    return out;
  }
  function on() {
    if (src) return true;
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      if (!buffer) { buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * SECONDS), ctx.sampleRate); buffer.copyToChannel(draw(ctx.sampleRate), 0); }
      gain = ctx.createGain(); gain.gain.value = MAX_GAIN * 0.85;
      src = ctx.createBufferSource(); src.buffer = buffer; src.loop = true;
      src.connect(gain); gain.connect(ctx.destination);
      src.start();
      return true;
    } catch (e) { src = null; return false; }
  }
  function off() {
    if (!src) return;
    try { src.stop(); src.disconnect(); gain.disconnect(); } catch (e) {}
    src = null; gain = null;
  }
  function playing() { return !!src; }
  function toggle() { if (src) { off(); return false; } return on(); }
  window.loveFire = { on: on, off: off, toggle: toggle, playing: playing };
  window.addEventListener('pagehide', off);

  // THE FILM OF THE FIRE (Helen's ask, 2026-11-11, "i need a real fire video"):
  // the page's own <video>, played by itself at MAX (muted, as the drawn fire
  // sways at MAX) and by the button at any setting, with the crackle; at
  // Regular and Gentle it stands at its poster unless pressed. loveHearth.video()
  // hands the room on Cel Street a video of its own with the same film, for a
  // texture on its fireplace, played only on its own press.
  var film = document.querySelector('[data-rdr-hearth-video]'), lit = false;
  function level() { return document.documentElement.getAttribute('data-intensity'); }
  function filmSync() {
    if (!film) return;
    var should = lit || level() === 'max';
    if (should && film.paused) { var pr = film.play(); if (pr && pr.catch) pr.catch(function () {}); }
    if (!should && !film.paused) film.pause();
  }
  document.addEventListener('love-intensity', filmSync);
  filmSync();
  function hearthOn() { lit = true; filmSync(); on(); }
  function hearthOff() { lit = false; filmSync(); off(); }
  // The film's files, named here as well as on the page, because when this
  // script runs for the room on Cel Street the page's own <video> is in a
  // frame and not in this document.
  var FILMS = [['video/reading-room-fire.webm', 'video/webm'], ['video/reading-room-fire.mp4', 'video/mp4']];
  function sources() { return FILMS; }
  window.loveHearth = { on: hearthOn, off: hearthOff, lit: function () { return lit; },
    video: function () {
      var v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
      // One src, picked by what this browser says it can play: a detached
      // video with <source> children never chose one (networkState stayed
      // empty), measured 2026-11-11.
      var pick = sources().filter(function (so) { return v.canPlayType(so[1]); })[0] || sources()[0];
      if (pick) { v.src = pick[0]; v.load(); }
      return v;
    } };

  // The button on the page, and what it says.
  var btn = document.querySelector('[data-rdr-fire]'), said = document.querySelector('[data-rdr-fire-said]');
  if (!btn) return;
  var box = document.querySelector('[data-rdr-fire-box]');
  if (box) box.hidden = false;
  function tell(words) { if (!said) return; said.textContent = ''; requestAnimationFrame(function () { said.textContent = words; }); }
  function sync() {
    btn.setAttribute('aria-pressed', lit ? 'true' : 'false');
    btn.textContent = lit ? 'Let the fire burn down' : 'Light the fire';
  }
  btn.addEventListener('click', function () {
    if (lit) { hearthOff(); sync(); tell('The fire burns down and falls quiet' + (level() === 'max' ? ', though at MAX the film goes on burning by itself.' : '.')); return; }
    hearthOn(); sync();
    tell(playing() ? 'The fire is lit: the film burns and the hearth crackles, until you press again or leave.' : 'The fire is lit and the film burns; this browser would not make the crackle.');
  });
  sync();
})();
