/* =============================================================================
   The headset at Dance, Punks.

   ONE HEADSET, THREE CHANNELS, AND TUNING IS NOT PLAYING. The street's rule, as
   the Hermitage's television and Looming Rocks' desk keep it:

     · WHILE THE HEADSET IS OFF, choosing a channel is silent. The band changes
       colour, the headset says which song that channel opens on, and NOTHING
       is fetched. All three can be tried without a request leaving the page.
     · ONCE IT IS ON, changing channel changes the music, because by then the
       visitor has asked for a headset, and making them put it on again for
       every channel would be a worse room and no more consented.

   A CHANNEL IS A STARTING POINT IN ONE CRATE. /embed/<VIDEO>?list=<PLAYLIST>
   is the only lever the embed answers to -- Club Chronic measured that shuffle
   and index are inert -- so each channel opens on its own song and plays on in
   order from there. The page says exactly that and never calls it shuffle.

   IT IS ITS OWN FILE, NOT looming.js WITH THE NAMES CHANGED. The two look alike
   and are not the same object: a lighting desk at a venue and a headset on a
   runway. What IS shared is love-embed.js, still the only thing on this site
   that builds a frame -- this asks it for one and never builds its own.

   WITH SCRIPTS OFF the headset and the tune buttons stay hidden, and every
   channel still opens on YouTube from its own starting point by the link beside
   it: a door rather than a dead control.
   ============================================================================= */
(function () {
  'use strict';

  var box = document.getElementById('dp-headset');
  if (!box || !window.loveEmbed) return;

  var crate   = box.getAttribute('data-crate');
  var glass   = document.getElementById('dp-glass');
  var offPane = document.getElementById('dp-off');
  var nowEl   = document.getElementById('dp-now');
  var opensEl = document.getElementById('dp-opens');
  var bandEl  = document.getElementById('dp-band');
  var onBtn   = document.getElementById('dp-on');
  var offBtn  = document.getElementById('dp-offbtn');
  var status  = document.getElementById('dp-status');

  var tunes = [].slice.call(document.querySelectorAll('.dp-tune'));
  if (!tunes.length || !/^PL[A-Za-z0-9_-]+$/.test(crate || '')) return;

  var chans = tunes.map(function (b) {
    return { btn: b, n: b.dataset.n, name: b.dataset.name, slug: b.dataset.slug,
             id: b.dataset.id, title: b.dataset.title, artist: b.dataset.artist };
  });

  var at = chans[0];
  var on = false;

  function say(t) { status.textContent = t; }

  /* WHAT THE HEADSET SAYS IS DERIVED FROM THE TUNED CHANNEL ON BOTH PATHS. The
     Hermitage's panel was only written on the path that did not play, and
     named the previous programme beside a running video. */
  function render() {
    box.className = 'dp-headset dp-headset--' + at.slug + (on ? ' dp-headset--on' : '');
    nowEl.textContent = 'Channel ' + at.n + ', ' + at.name;
    opensEl.textContent = 'Opens on ' + at.title + ' by ' + at.artist;
    bandEl.textContent = (on ? 'On: ' : 'Tuned to: ') + 'channel ' + at.n + ', ' + at.name +
      ' · runs until you take it off';
    chans.forEach(function (c) {
      c.btn.setAttribute('aria-pressed', c === at ? 'true' : 'false');
    });
  }

  /* Removed rather than hidden: a hidden player is still a player, and on a
     crate this long it is still one that is downloading. */
  function clearFrame() {
    var f = glass.querySelector('iframe');
    if (f) f.remove();
  }

  function play() {
    var src = 'https://www.youtube-nocookie.com/embed/' + at.id +
              '?list=' + crate + '&autoplay=1&rel=0';
    var player = window.loveEmbed.frameUrl(src, 'Dance, Punks, channel ' + at.n + ', ' + at.name);
    if (!player) return;
    clearFrame();
    offPane.hidden = true;
    glass.appendChild(player);
    on = true;
    offBtn.hidden = false;
    render();
    say('Headset on. Channel ' + at.n + ', ' + at.name + ', opening on ' + at.title +
        ' by ' + at.artist + '. The volume is on the player.');
  }

  function stop() {
    clearFrame();
    on = false;
    offPane.hidden = false;
    offBtn.hidden = true;
    render();
    say('Headset off. The runway is quiet. Still tuned to channel ' + at.n + ', ' + at.name + '.');
    onBtn.focus();
  }

  function tune(c) {
    at = c;
    if (on) { play(); return; }
    render();
    say('Tuned to channel ' + at.n + ', ' + at.name + '. The headset is off and nothing has loaded.');
  }

  chans.forEach(function (c) {
    c.btn.hidden = false;
    c.btn.addEventListener('click', function () { tune(c); });
  });
  onBtn.addEventListener('click', play);
  offBtn.addEventListener('click', stop);

  box.hidden = false;
  render();
})();
