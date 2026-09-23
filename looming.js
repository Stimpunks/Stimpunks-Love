/* =============================================================================
   The stage at Looming Rocks Amphitheatre.

   THIS IS THE HERMITAGE'S TELEVISION, ON A ROCK FACE, and it keeps that set's
   promises because they are the street's rather than that room's:

     · WHILE THE STAGE IS DARK, tuning is silent. Previous and next move along
       the running order, the screen says what is up next and how long it runs,
       and NOTHING is fetched. The whole bill can be walked without a single
       request leaving this page.
     · ONCE SOMETHING IS PLAYING, tuning changes the picture, because by then
       the visitor has asked for a stage and making them press again for every
       act would be a worse room and no more consented.

   AND EVERY CONTROL SAYS WHAT IT WILL DO BEFORE IT IS PRESSED. A next button
   that only says "next" is the one place this design could quietly break the
   street's oldest rule, and it matters more here than at the campfire: these
   are FULL CONCERTS. The shortest is nearly an hour. Nobody should discover the
   length of the thing after committing to it.

   IT IS A SEPARATE FILE FROM hermitage.js RATHER THAN A SHARED ONE, and that is
   deliberate. The two sets look alike and are not the same object: that one is
   a television in a room with three chairs round it and a laptop beside it,
   this one is a lighting desk at an outdoor venue, and the ids and class names
   belong to their own rooms because check-classes.py refuses a name two rooms
   both claim. A shared widget would be the harmonising instinct arriving
   through a script tag, on a street whose whole architecture is that the rooms
   share nothing. What IS shared is love-embed.js, which stays the only thing on
   this site that builds a YouTube iframe.

   THE RUNNING ORDER IS A <details> AND WORKS WITH SCRIPTS OFF. Opening and
   closing the bill is the browser's job, not this file's — the guild's rule
   about its escapes, arriving on a listing. With no JavaScript at all a visitor
   still gets the whole bill, every runtime, and a link out to each act.
   ============================================================================= */
(function () {
  'use strict';

  var screen = document.getElementById('rocks-screen');
  if (!screen) return;

  var offPanel = document.getElementById('rocks-off');
  var nowEl    = document.getElementById('rocks-now');
  var runsEl   = document.getElementById('rocks-runs');
  var playBtn  = document.getElementById('rocks-play');
  var whatEl   = document.getElementById('rocks-what');
  var statusEl = document.getElementById('rocks-status');
  var prevBtn  = document.getElementById('rocks-prev');
  var nextBtn  = document.getElementById('rocks-next');

  var rows = [].slice.call(document.querySelectorAll('.act'));
  if (!rows.length) return;

  var acts = rows.map(function (li) {
    return {
      el: li,
      id: li.dataset.id,
      title: li.dataset.title,
      runs: li.dataset.runs,
      spoken: li.dataset.spoken,
      how: li.dataset.how
    };
  });

  var at = 0;        // which act the desk is on
  var on = false;    // whether anything has been pressed

  function wrap(i) { return (i % acts.length + acts.length) % acts.length; }

  /* The desk says where it is going and how long that runs, BEFORE the press. */
  function label() {
    var next = acts[wrap(at + 1)];
    whatEl.textContent = 'Next: ' + next.title + ' · ' + next.spoken;
  }

  /* SAID OUT LOUD, because the only other signal that the act changed is a
     picture. The dark panel cannot carry this on its own: it is hidden while
     something is playing, and a live region that disappears announces nothing. */
  function say(text) { statusEl.textContent = text; }

  function mark() {
    acts.forEach(function (a, i) { a.el.classList.toggle('act--on', i === at); });
  }

  /* WHAT THE PANEL SAYS IS DERIVED FROM THE TUNED ACT AND NOTHING ELSE. The
     Hermitage learned this the hard way: its panel was written only on the path
     that does not play, so retuning while the set was on left it naming the
     previous programme beside a running video. A panel that is correct on only
     one of the two paths through this code is a panel that will be found
     wrong. */
  function render(a) {
    nowEl.textContent = a.title;
    if (a.how === 'link') {
      runsEl.textContent = a.runs + ' · this one will not play here';
      playBtn.hidden = true;
      door.hidden = false;
      door.href = 'https://www.youtube.com/watch?v=' + a.id;
    } else {
      runsEl.textContent = 'Runs ' + a.runs;
      playBtn.hidden = false;
      door.hidden = true;
    }
  }

  /* Rebuilt rather than hidden, so a finished act is GONE from the page and not
     merely invisible — a hidden player is still a player, and at these lengths
     it is still a player that is downloading. */
  function clearFrame() {
    var frame = screen.querySelector('iframe');
    if (frame) frame.remove();
  }

  function showPanel(a) {
    clearFrame();
    render(a);
    offPanel.hidden = false;
    say(a.how === 'link'
      ? 'On the desk: ' + a.title + ', ' + a.spoken + '. This one cannot be played here; a way out is on the screen.'
      : 'On the desk: ' + a.title + ', ' + a.spoken + '. The stage is dark.');
  }

  function playNow(a) {
    render(a);
    if (a.how === 'link') { showPanel(a); return; }
    var player = window.loveEmbed && window.loveEmbed.frame(a.id, a.title);
    if (!player) { showPanel(a); return; }
    clearFrame();
    offPanel.hidden = true;
    screen.appendChild(player);
    on = true;
    say('Now playing ' + a.title + ', ' + a.spoken + '.');
  }

  function tune(i, goToStage) {
    at = wrap(i);
    var a = acts[at];
    if (on) { playNow(a); } else { showPanel(a); }
    mark();
    label();
    if (goToStage) screen.scrollIntoView({ block: 'center' });
  }

  /* The way out, for an act whose owner has embedding switched off. Built here
     rather than written into the page because it belongs to whichever act is on
     the desk, and only one is. Nothing in the running order is in that state
     today; the branch stays because the state is somebody else's to change and
     they can change it without telling us. */
  var door = document.createElement('a');
  door.className = 'apron__door';
  door.textContent = 'Open it on YouTube →';
  door.hidden = true;
  playBtn.insertAdjacentElement('afterend', door);

  playBtn.addEventListener('click', function () { playNow(acts[at]); });
  prevBtn.addEventListener('click', function () { tune(at - 1, false); });
  nextBtn.addEventListener('click', function () { tune(at + 1, false); });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.tuneto');
    if (!btn) return;
    var i = parseInt(btn.dataset.ch, 10) - 1;
    on = true;                 // choosing off the bill IS pressing play
    tune(i, true);
  });

  showPanel(acts[0]);
  mark();
  label();
})();
