/* =============================================================================
   Rebellion Rave Room: the rig, and the big screen.

   THE ONE ROOM ON THIS STREET WITH A STROBE IN IT, and every line below exists
   to keep one promise the whole street makes: nothing moves, flashes or plays
   until you say so. This room relaxes the street's rule about flashing and
   keeps that promise harder than anywhere else, because here it is the only
   thing standing between a strobe and somebody who did not ask for one.

     · NOTHING RUNS ON LOAD. The rig's controls ship `hidden` and this file only
       unhides them. No timer is started, no frame is requested, no class is
       set, until a button is pressed.
     · THE STROBE TAKES TWO PRESSES. The first opens a question that names the
       rate before it is answered; only "yes" starts it. A single stray tap
       cannot flash anybody.
     · EVERYTHING STOPS AT ONCE, on Escape, on either Stop button, when the tab
       is hidden and when the page is left. Coming back to the tab does NOT
       start it again: the visitor has to ask a second time, because a strobe
       that resumed by itself would be one nobody asked for this time.
     · NOTHING IS REMEMBERED. No storage of any kind -- make-rave.py refuses
       this file if any appears -- so the rig is off every time anybody comes in.
     · THE KNOB STOPS AT ELEVEN, and MAX_RATE is read by make-rave.py and held
       against the markup's max. The flash is WHITE and only white: a saturated
       red flash is the one WCAG singles out as the worst, and make-rave.py
       refuses a --rr-strobe with any colour in it.
     · THE FLASH IS DRAWN OVER THE PICTURE AND NEVER OVER A WORD. The overlay
       sits inside the hangar drawing; the whole screen flashes only if the
       visitor presses "full screen", which is a third choice of theirs.

   THE DIAL DOES NOT SWITCH THE RIG, in either direction. The Arcade's rule for
   its game speed: a Gentle that handed somebody a different rig would be the
   lite-version mistake, and a MAX that switched it on would be the rig starting
   by itself. So both the lasers and the strobe are driven from one
   requestAnimationFrame loop here rather than by CSS animation, which §3 takes
   away at Gentle with !important -- the lasers turn only when asked, at every
   setting, and are a still picture otherwise. The beams are rotated inside
   their own <svg>, where a transform is part of the picture.

   THE SCREEN IS THE HERMITAGE'S SET, and keeps that set's promises: while it
   is dark, previous and next are silent and nothing is fetched; once
   something is on, tuning changes the picture. love-embed.js still builds
   every frame. It is its own file, not looming.js with the names changed,
   for the reason that file gives.

   THE CB CAN PUT A VIDEO ON THE BIG SCREEN (Ryan, 2026-10-05), as it can on
   the Hermitage's set and Looming Rocks' stage. A moderator's Screen a video
   plays at once, because they pressed. A follower's Catch up or Follow never
   plays: the screen goes dark with that video on it, naming who is hosting it
   and how long it runs, and the play button has the keyboard. It is always
   cued on its own, even when it opens one of the mixes, because a mix cannot
   start at a place in its first video (loveEmbed.withStart refuses a list),
   and a follower has to start where the host is. Like every film here it may
   flash, and it says so on the screen. cb.js reaches this through
   window.loveSet. It switches nothing on the rig.
   ============================================================================= */
(function () {
  'use strict';

  var MAX_RATE = 11;        // flashes a second; the knob ends here, on purpose
  var FLASH_MS = 40;        // how long each flash is lit, at most

  /* ── The rig ─────────────────────────────────────────────────────────── */
  var rig = document.getElementById('rr-rig');
  var scene = document.getElementById('rr-scene');
  if (rig && scene) {
    var flash    = document.getElementById('rr-flash');
    var lasersB  = document.getElementById('rr-lasers');
    var strobeB  = document.getElementById('rr-strobe');
    var rate     = document.getElementById('rr-rate');
    var rateOut  = document.getElementById('rr-rate-out');
    var confirmP = document.getElementById('rr-confirm');
    var confirmW = document.getElementById('rr-confirm-what');
    var goB      = document.getElementById('rr-strobe-go');
    var noB      = document.getElementById('rr-strobe-no');
    var fullB    = document.getElementById('rr-full');
    var stopB    = document.getElementById('rr-stop');
    var stopS    = document.getElementById('rr-stop-scene');
    var said     = document.getElementById('rr-said');
    var status   = document.getElementById('rr-status');
    var beams = [].slice.call(scene.querySelectorAll('.rr-beam')).map(function (g) {
      return { el: g, x: +g.dataset.x, y: +g.dataset.y, sweep: +g.dataset.sweep,
               speed: +g.dataset.speed, phase: +g.dataset.phase };
    });

    var lasersOn = false, strobeOn = false, frame = 0, t0 = 0, lastFlash = -1e9;

    rate.max = String(MAX_RATE);
    rig.hidden = false;

    function hz() { return Math.max(1, Math.min(MAX_RATE, parseInt(rate.value, 10) || 1)); }
    function words(n) { return n + (n === 1 ? ' flash a second' : ' flashes a second'); }
    function past(n) { return n > 4 ? ', faster than the four a second the Health and Safety Executive recommends for a club' : ''; }

    /* The answer is where the hand is (the Playhouse's rule), and said out
       loud once. */
    function say(text) {
      said.textContent = text;
      status.textContent = '';
      window.setTimeout(function () { status.textContent = text; }, 30);
    }

    function paintLabels() {
      var n = hz();
      rateOut.textContent = words(n) + (n > 4 ? ' · past the HSE’s club limit' : '');
      lasersB.textContent = lasersOn ? 'Lasers: on. Switch them off' : 'Lasers: off. Switch on the beams sweeping the haze';
      lasersB.setAttribute('aria-pressed', String(lasersOn));
      strobeB.textContent = strobeOn ? 'Strobe: on, ' + words(n) + '. Switch it off' : 'Strobe: off. Switch it on…';
      strobeB.setAttribute('aria-pressed', String(strobeOn));
      stopS.hidden = !(lasersOn || strobeOn);
      scene.classList.toggle('rr-scene--live', lasersOn || strobeOn);
    }

    function tick(now) {
      frame = 0;
      if (!lasersOn && !strobeOn) return;
      if (!t0) t0 = now;
      var t = (now - t0) / 1000;
      if (lasersOn) {
        beams.forEach(function (b) {
          var a = b.sweep * Math.sin(t * b.speed * 2 * Math.PI / 4 + b.phase);
          b.el.setAttribute('transform', 'rotate(' + a.toFixed(2) + ' ' + b.x + ' ' + b.y + ')');
        });
      }
      if (strobeOn) {
        var period = 1000 / hz();
        if (now - lastFlash >= period) lastFlash = now;
        flash.style.opacity = (now - lastFlash) < Math.min(FLASH_MS, period / 2) ? '1' : '0';
      }
      frame = window.requestAnimationFrame(tick);
    }
    function run() { if (!frame) frame = window.requestAnimationFrame(tick); }

    function stopStrobe() {
      strobeOn = false;
      flash.style.opacity = '0';
    }
    function stopLasers() {
      lasersOn = false;
      beams.forEach(function (b) { b.el.removeAttribute('transform'); });
    }

    /* EVERYTHING OFF, from any path. One function, so no way out of this room
       can leave half the rig running. */
    function stopAll(why) {
      var was = lasersOn || strobeOn;
      stopStrobe();
      stopLasers();
      confirmP.hidden = true;
      if (frame) { window.cancelAnimationFrame(frame); frame = 0; }
      t0 = 0;
      if (document.fullscreenElement === scene && document.exitFullscreen) {
        document.exitFullscreen().catch(function () {});
      }
      paintLabels();
      if (was && why) say(why);
    }

    lasersB.addEventListener('click', function () {
      if (lasersOn) { stopLasers(); say('Lasers off.'); }
      else { lasersOn = true; run(); say('Lasers on. The beams sweep the haze until you switch them off.'); }
      paintLabels();
    });

    /* The question names the rate before it is answered, and is rewritten
       whenever the knob moves while it is open. */
    function ask() {
      var n = hz();
      var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      confirmW.textContent = 'Start the strobe? White flashes over the hangar, ' + words(n) + past(n) +
        ', until you stop it. Escape stops it at any time.' +
        (reduce ? ' Your device has asked for less motion; this will flash anyway if you say yes.' : '');
      goB.textContent = 'Yes, start the strobe at ' + n + ' a second';
    }

    strobeB.addEventListener('click', function () {
      if (strobeOn) { stopStrobe(); paintLabels(); say('Strobe off.'); return; }
      ask();
      confirmP.hidden = false;
      goB.focus();
    });

    goB.addEventListener('click', function () {
      confirmP.hidden = true;
      strobeOn = true;
      lastFlash = -1e9;
      run();
      paintLabels();
      strobeB.focus();
      say('Strobe on, ' + words(hz()) + '. Escape or Stop switches it off.');
    });
    noB.addEventListener('click', function () {
      confirmP.hidden = true;
      strobeB.focus();
      say('The strobe stays off.');
    });

    rate.addEventListener('input', function () {
      paintLabels();
      if (!confirmP.hidden) ask();
    });

    fullB.addEventListener('click', function () {
      if (!scene.requestFullscreen) { say('This browser cannot take the rig full screen.'); return; }
      scene.requestFullscreen().then(function () {
        say('The rig fills the screen. Escape brings it back, and stops everything.');
      }).catch(function () { say('The browser would not take the rig full screen.'); });
    });

    stopB.addEventListener('click', function () { stopAll('Everything is off.'); });
    stopS.addEventListener('click', function () { stopAll('Everything is off.'); stopB.focus(); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') stopAll('Escape: everything is off.');
    });
    document.addEventListener('fullscreenchange', function () {
      if (!document.fullscreenElement) stopAll('Out of full screen, and everything is off.');
    });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'visible') stopAll('Everything went off when you left the tab.');
    });
    window.addEventListener('pagehide', function () { stopAll(); });

    paintLabels();
  }

  /* ── The big screen ──────────────────────────────────────────────────── */
  var screen = document.getElementById('rr-screen');
  if (!screen) return;
  var offPanel = document.getElementById('rr-off');
  var nowEl    = document.getElementById('rr-now');
  var runsEl   = document.getElementById('rr-runs');
  var playBtn  = document.getElementById('rr-play');
  var whatEl   = document.getElementById('rr-what');
  var sayEl    = document.getElementById('rr-screen-status');
  var prevBtn  = document.getElementById('rr-prev');
  var nextBtn  = document.getElementById('rr-next');

  var chans = [].slice.call(document.querySelectorAll('.rr-chan')).map(function (li) {
    return { el: li, kind: li.dataset.kind, id: li.dataset.id, list: li.dataset.list,
             title: li.dataset.title, spoken: li.dataset.spoken, label: li.dataset.label };
  });
  if (!chans.length) return;

  var at = 0, on = false;
  var cb = null;     // a video the CB put on the screen, which is on no list
  function wrap(i) { return (i % chans.length + chans.length) % chans.length; }

  /* The src is built from the data and handed to love-embed.js, which checks
     the origin and builds the frame. A mix is the video then YouTube's list of
     RD plus its own id; a playlist starts at its own position 1. */
  function src(c) {
    var base = 'https://www.youtube-nocookie.com/embed/';
    return c.kind === 'playlist'
      ? base + 'videoseries?list=' + encodeURIComponent(c.list) + '&autoplay=1&rel=0'
      : base + encodeURIComponent(c.id) + '?list=' + encodeURIComponent('RD' + c.id) + '&autoplay=1&rel=0';
  }

  function label() {
    var n = chans[wrap(at + 1)];
    whatEl.textContent = 'Next: ' + n.title + ' · ' + n.label;
  }
  function tell(text) { sayEl.textContent = text; }
  function mark() { chans.forEach(function (c, i) { c.el.classList.toggle('rr-chan--on', !cb && i === at); }); }
  // A CB video's title, with whose it is: a channel's is just its title.
  function named(c) { return c.cb ? '\u201c' + c.title + '\u201d, ' + c.cb : c.title; }
  function render(c) { nowEl.textContent = named(c); runsEl.textContent = c.label; }
  function clearFrame() { var f = screen.querySelector('iframe'); if (f) f.remove(); }

  function showPanel(c) {
    clearFrame();
    render(c);
    offPanel.hidden = false;
    tell('On the screen: ' + named(c) + ', ' + c.label + '. The screen is dark.');
  }
  /* A place to start from, which only the CB's Catch up and Follow leave on
     the play button (data-embed-start, readyFilm's word for it). Only a CB
     video can use it, it is used once, and any move of the desk throws it away. */
  function playNow(c) {
    render(c);
    var start = parseInt(playBtn.dataset.embedStart, 10) || 0;
    delete playBtn.dataset.embedStart;
    var player = window.loveEmbed && (c.cb
      ? window.loveEmbed.frame(c.id, c.title, start)
      : window.loveEmbed.frameUrl(src(c), c.title));
    if (!player) { showPanel(c); return; }
    clearFrame();
    offPanel.hidden = true;
    screen.appendChild(player);
    on = true;
    tell('Now playing ' + named(c) + ', ' + c.label + '.');
  }
  function tune(i, go) {
    cb = null;
    delete playBtn.dataset.embedStart;
    at = wrap(i);
    if (on) playNow(chans[at]); else showPanel(chans[at]);
    mark(); label();
    if (go) screen.scrollIntoView({ block: 'center' });
  }

  playBtn.addEventListener('click', function () { playNow(cb || chans[at]); });
  prevBtn.addEventListener('click', function () { tune(at - 1, false); });
  nextBtn.addEventListener('click', function () { tune(at + 1, false); });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.rr-tuneto');
    if (!b) return;
    on = true;                 // choosing off the list IS pressing play
    tune(parseInt(b.dataset.ch, 10) - 1, true);
  });

  // 612 -> "10:12", the way every runtime here is written.
  function runsOf(secs) {
    var t = Math.round(secs), h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, x = t % 60;
    var two = function (n) { return (n < 10 ? '0' : '') + n; };
    return h ? h + ':' + two(m) + ':' + two(x) : m + ':' + two(x);
  }

  /* A moderator's Screen a video: it plays, because they pressed. */
  function play(id, start, said) {
    var title = 'A video put up from the CB';
    var player = window.loveEmbed && window.loveEmbed.frame(id, title, start);
    if (!player) return null;
    cb = { id: id, title: title, cb: 'from the CB', label: 'it may flash, like every film here' };
    delete playBtn.dataset.embedStart;
    clearFrame();
    offPanel.hidden = true;
    screen.appendChild(player);
    on = true;
    mark(); label();
    tell(said);
    return { node: player, now: null };
  }

  /* A follower's Catch up or Follow: the screen goes dark with the video on
     it, and the play button it hands back is pressed by nobody but them. */
  function ready(spec) {
    delete playBtn.dataset.embedStart;
    on = false;
    cb = { id: spec.id, title: spec.film, cb: 'hosted by ' + spec.by + ' on the CB',
           label: (spec.length ? 'Runs ' + runsOf(spec.length) : 'How long it runs was not said') + ' · it may flash, like every film here' };
    showPanel(cb);
    mark(); label();
    return playBtn;
  }

  window.loveSet = { glass: screen, name: 'the big screen', back: 'the desk goes back to the channel list', play: play, ready: ready };

  showPanel(chans[0]);
  mark();
  label();
})();
