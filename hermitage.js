/* =============================================================================
   The laptop in the Solarpunk Hermitage's cave.

   It frames stimpunks.world — this site, inside a room on this site. Nothing
   third-party is involved, so this is not the press-to-play facade's problem
   (see love-embed.js) and it still waits to be pressed, for different reasons:
   a whole copy of the street loading itself into a room would mean a second
   intensity dial applying underneath the first, every font served twice, and a
   screen reader walking the entire site again for somebody who came in to read
   a book. Consent is the jukebox's reason; this one is about not handing
   anybody a page with two of everything on it.

   AND IT REFUSES TO NEST. A laptop showing the street is a laptop you can walk
   back down into this room with, which puts a laptop inside a laptop, and the
   third one is not a joke any more — it is a page that will not stop loading
   and an accessibility tree nobody can get out of. So a hermitage that finds
   itself already inside a frame does not offer the laptop at all; it says so
   instead. That check has to be here rather than in the markup, because a page
   cannot know at write time which copy of itself it will turn out to be.

   The CSP had to change for any of this to work: frame-ancestors was 'none',
   which stops this site being framed by ANYBODY including itself. It is 'self'
   now, and X-Frame-Options is SAMEORIGIN to match. Clickjacking protection
   against every other origin is unchanged. See _headers and tools/make-csp.py.
   ============================================================================= */
(function () {
  'use strict';

  var wake = document.getElementById('laptop-wake');
  if (!wake) return;

  var nested = window.self !== window.top;

  if (nested) {
    var lid = wake.parentNode;
    var said = document.createElement('p');
    said.className = 'laptop__wake';
    said.style.cursor = 'default';
    said.innerHTML = '<b>One screen is enough</b>' +
      '<span>You are already looking at this room through a laptop. ' +
      'Opening another one inside it is a corridor rather than a joke.</span>';
    lid.replaceChild(said, wake);
    return;
  }

  wake.addEventListener('click', function () {
    var frame = document.createElement('iframe');
    frame.src = 'index.html';
    frame.className = 'laptop__screen';
    frame.title = 'stimpunks.world, open on the laptop in the cave';
    frame.setAttribute('loading', 'lazy');
    wake.replaceWith(frame);
    frame.focus();
  });
})();

/* -----------------------------------------------------------------------------
   The shared television at the campfire.

   THE PROMISE IS THE SAME ONE THE WHOLE STREET MAKES and it is harder to keep
   here, because a set with a dial invites you to think of tuning and playing as
   one action. They are two:

     · WHILE THE SET IS OFF, tuning is silent. Previous and next move the
       channel, the screen says what it is now on and how long that runs, and
       NOTHING is fetched. You can walk the whole listing without a single
       request leaving this page.
     · ONCE IT IS PLAYING, tuning changes the picture, because by then the
       visitor has asked for a television and making them press play again for
       every channel would be a worse room and no more consented.

   AND EVERY CONTROL SAYS WHAT IT WILL DO BEFORE IT IS PRESSED. A next button
   that only says "next" is the one place this design could quietly break the
   room's rule that a control names its runtime first — so the label beside the
   remote names the channel it is about to tune to AND how long that one runs.

   THE CHANNEL THAT CANNOT BE EMBEDDED IS NOT SKIPPED. It is in the running
   order like everything else and the screen shows a door when you reach it,
   because silently stepping over it would hide a fact about somebody else's
   permissions that the room states out loud everywhere else.

   THE CB CAN PUT A VIDEO ON THE SET (Ryan, 2026-10-05), the way it puts one on
   a rack's screen. A moderator's Screen a video plays here at once, because
   they pressed; the set is then on, and the remote tunes back to the listing.
   A follower's Catch up or Follow never plays: the set goes off with that
   video tuned, on the panel every channel uses, naming who is hosting it and
   how long it runs, and the set's own play button has the keyboard. If the
   video is one of the listing's channels, that channel is what gets tuned.
   cb.js reaches this through window.loveSet, and loveEmbed builds the frame.
   -------------------------------------------------------------------------- */
(function () {
  'use strict';

  var screen = document.getElementById('bigscreen-screen');
  if (!screen) return;

  var offPanel = document.getElementById('bigscreen-off');
  var nowEl    = document.getElementById('bigscreen-now');
  var runsEl   = document.getElementById('bigscreen-runs');
  var playBtn  = document.getElementById('bigscreen-play');
  var whatEl   = document.getElementById('ch-what');
  var statusEl = document.getElementById('bigscreen-status');
  var prevBtn  = document.getElementById('ch-prev');
  var nextBtn  = document.getElementById('ch-next');

  var rows = [].slice.call(document.querySelectorAll('.ch'));
  if (!rows.length) return;

  var channels = rows.map(function (li) {
    return {
      el: li,
      id: li.dataset.id,
      title: li.dataset.title,
      runs: li.dataset.runs,
      spoken: li.dataset.spoken,
      how: li.dataset.how
    };
  });

  var at = 0;        // which channel is tuned
  var on = false;    // whether anything has been pressed
  var cb = null;     // a video the CB put on the set, which is in no listing

  function wrap(i) { return (i % channels.length + channels.length) % channels.length; }

  function label() {
    var next = channels[wrap(at + 1)];
    // The dial says where it is going and how long that runs, before the press.
    whatEl.textContent = 'Next: ' + next.title + ' \u00b7 ' + next.spoken;
  }

  /* SAID OUT LOUD, because the only other signal that the channel changed is a
     picture. The off panel cannot carry this on its own: it is hidden while the
     set is playing, and a live region that disappears announces nothing. */
  function say(text) { statusEl.textContent = text; }

  function mark() {
    channels.forEach(function (c, i) { c.el.classList.toggle('ch--on', !cb && i === at); });
  }

  // A CB video's title, with whose it is: a listing channel's is just its title.
  function named(ch) { return ch.cb ? '\u201c' + ch.title + '\u201d, ' + ch.cb : ch.title; }

  /* WHAT THE PANEL SAYS IS DERIVED FROM THE TUNED CHANNEL AND NOTHING ELSE.
     It used to be written only on the path that does not play, so retuning
     while the set was on left the panel holding whatever had been tuned last
     time it was off — which is how it came to sit beside a running video
     naming a different programme. A panel that is only correct on one of the
     two paths through this code is a panel that will be found wrong. */
  function render(ch) {
    nowEl.textContent = named(ch);
    if (ch.how === 'link') {
      runsEl.textContent = ch.runs + ' \u00b7 this one will not play here';
      playBtn.hidden = true;
      door.hidden = false;
      door.href = 'https://www.youtube.com/watch?v=' + ch.id;
    } else {
      runsEl.textContent = ch.runs ? 'Runs ' + ch.runs : 'How long it runs was not said';
      playBtn.hidden = false;
      door.hidden = true;
    }
  }

  /* Rebuilt rather than hidden, so a retired player is GONE from the page and
     not merely invisible — a hidden player is still a player. */
  function clearFrame() {
    var frame = screen.querySelector('iframe');
    if (frame) frame.remove();
  }

  function showPanel(ch) {
    clearFrame();
    render(ch);
    offPanel.hidden = false;
    var runs = ch.spoken || 'how long it runs was not said';
    say(ch.how === 'link'
      ? 'Tuned to ' + named(ch) + ', ' + runs + '. This one cannot be played here; a link out is on the screen.'
      : 'Tuned to ' + named(ch) + ', ' + runs + '. The set is off.');
  }

  /* A place to start from, which only the CB's Catch up and Follow leave on
     the play button (as data-embed-start, readyFilm's word for it on every
     play button). It is used once, and any retune throws it away. */
  function playNow(ch) {
    render(ch);
    if (ch.how === 'link') { showPanel(ch); return; }
    var start = parseInt(playBtn.dataset.embedStart, 10) || 0;
    delete playBtn.dataset.embedStart;
    var player = window.loveEmbed && window.loveEmbed.frame(ch.id, ch.title, start);
    if (!player) { showPanel(ch); return; }
    clearFrame();
    offPanel.hidden = true;
    screen.appendChild(player);
    on = true;
    say('Now playing ' + named(ch) + ', ' + (ch.spoken || 'how long it runs was not said') + '.');
  }

  function tune(i, focusScreen) {
    cb = null;
    delete playBtn.dataset.embedStart;
    at = wrap(i);
    var ch = channels[at];
    if (on) { playNow(ch); } else { showPanel(ch); }
    mark();
    label();
    if (focusScreen) screen.scrollIntoView({ block: 'center' });
  }

  /* The way out, for the channel whose owner has embedding switched off. Built
     here rather than written into the page because it belongs to whichever
     channel is tuned, and only one is. */
  var door = document.createElement('a');
  door.className = 'bigscreen__door';
  door.textContent = 'Open it on YouTube \u2192';
  door.hidden = true;
  playBtn.insertAdjacentElement('afterend', door);

  playBtn.addEventListener('click', function () { playNow(cb || channels[at]); });
  prevBtn.addEventListener('click', function () { tune(at - 1, false); });
  nextBtn.addEventListener('click', function () { tune(at + 1, false); });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.tune');
    if (!btn) return;
    var i = parseInt(btn.dataset.ch, 10) - 1;
    on = true;                 // choosing from the listing IS pressing play
    tune(i, true);
  });

  // 612 -> "10:12" and "10 min", the listing's two ways of saying a runtime.
  function runsOf(secs) {
    var t = Math.round(secs), h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, x = t % 60;
    var two = function (n) { return (n < 10 ? '0' : '') + n; };
    var mins = Math.round(t / 60), hh = Math.floor(mins / 60), mm = mins % 60;
    return {
      runs: h ? h + ':' + two(m) + ':' + two(x) : m + ':' + two(x),
      spoken: hh ? hh + ' hr' + (mm ? ' ' + mm + ' min' : '') : Math.max(1, mins) + ' min'
    };
  }

  function find(id) {
    for (var i = 0; i < channels.length; i++) if (channels[i].id === id) return i;
    return -1;
  }

  /* A moderator's Screen a video: it plays, because they pressed. */
  function play(id, start, said) {
    var title = 'A video put up from the CB';
    var player = window.loveEmbed && window.loveEmbed.frame(id, title, start);
    if (!player) return null;
    cb = { id: id, title: title, how: 'screen', cb: 'from the CB' };
    delete playBtn.dataset.embedStart;
    clearFrame();
    offPanel.hidden = true;
    screen.appendChild(player);
    on = true;
    mark();
    label();
    say(said);
    return { node: player, now: null };
  }

  /* A follower's Catch up or Follow: the set goes off with the video tuned,
     and the play button it hands back is pressed by nobody but them. */
  function ready(spec) {
    var i = find(spec.id);
    delete playBtn.dataset.embedStart;
    if (i >= 0 && channels[i].how === 'link') return null;
    on = false;
    if (i >= 0) {
      cb = null;
      at = i;
      showPanel(channels[i]);
    } else {
      var r = spec.length ? runsOf(spec.length) : {};
      cb = { id: spec.id, title: spec.film, runs: r.runs, spoken: r.spoken, how: 'screen', cb: 'hosted by ' + spec.by + ' on the CB' };
      showPanel(cb);
    }
    mark();
    label();
    return playBtn;
  }

  window.loveSet = { glass: screen, name: 'the television', back: 'the remote tunes back to the listing', play: play, ready: ready };

  showPanel(channels[0]);
  mark();
  label();
})();
