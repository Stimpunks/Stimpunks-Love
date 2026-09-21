/* =============================================================================
   The Mopery: the shelves, the parlour screen and the Raven nook.

   Three small things in one file because they belong to one room, and none of
   them is shared with anywhere else on the street.
   ============================================================================= */

/* -----------------------------------------------------------------------------
   1. What a spine opens to.

   A NATIVE <dialog> AND showModal(), the decision pebble-board.js made and for
   the same five reasons: the focus trap, Escape, the inert background, the
   backdrop and returning focus to the button are all the browser's. Nothing
   here re-implements any of them.

   AND THE DIALOG IS A CLONE OF MARKUP THAT IS ALREADY ON THE PAGE, not a
   rendering of data-* attributes. Two copies of a book's note in one document
   is how a shelf ends up disagreeing with its own popup. It also means the room
   still works with this file switched off: the records are [hidden], the
   <noscript> in the head unhides them, and a reader with no JavaScript gets a
   plain catalogue instead of a wall of buttons that do nothing.
   -------------------------------------------------------------------------- */
(function () {
  'use strict';

  var sheet = document.getElementById('mop-sheet');
  if (!sheet || typeof sheet.showModal !== 'function') return;
  var body = document.getElementById('mop-sheet-body');

  function open(btn) {
    var record = document.getElementById(btn.dataset.record);
    if (!record) return;
    var copy = record.cloneNode(true);
    copy.removeAttribute('id');
    copy.removeAttribute('hidden');
    /* The record's own heading is an h4 because of where it sits in the page's
       outline; inside the dialog it is the title of the thing. */
    var h = copy.querySelector('h4');
    if (h) {
      var h2 = document.createElement('h2');
      h2.innerHTML = h.innerHTML;
      h.replaceWith(h2);
    }
    body.replaceChildren(copy);
    sheet.showModal();
  }

  document.addEventListener('click', function (e) {
    var spine = e.target.closest('.mop-spine');
    if (spine) { open(spine); return; }
    if (e.target.closest('.mop-shut')) { sheet.close(); return; }
    /* A click on the backdrop closes it. The backdrop is not an element, so the
       event arrives on the dialog itself; anything inside stops here. Without
       the bounds test, clicking the note would close the note. */
    if (e.target === sheet) {
      var r = sheet.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right &&
                   e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) sheet.close();
    }
  });

  /* Escape, explicitly. See the note in pebble-board.js: <dialog> is supposed
     to handle this and was observed not to under automation, and the cost of
     being wrong the other way is a modal a keyboard user cannot leave. */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sheet.open) sheet.close();
  });

  sheet.addEventListener('close', function () { body.replaceChildren(); });
})();


/* -----------------------------------------------------------------------------
   2. The Raven, in whichever voice you like.

   Every typeface on this street is in the picker, which is the one place here
   where borrowing all of them is the joke rather than the failure: nothing of
   the Playhouse arrives when you set the poem in Titan One except the
   letterforms. @font-face is lazy, so choosing a face is what downloads it and
   a reader who never opens the picker never pays for one.

   THE CHOICE IS NOT REMEMBERED, on purpose. Everything else this site stores is
   about somebody's tolerance -- the intensity dial -- and is theirs to keep
   across pages. A typeface for one poem is a thing you are playing with, and
   quietly re-applying it next week would be the site deciding it knew how you
   wanted to read.
   -------------------------------------------------------------------------- */
(function () {
  'use strict';

  var picker = document.getElementById('raven-font');
  var poem = document.getElementById('raven-poem');
  if (!picker || !poem) return;

  picker.addEventListener('change', function () {
    poem.style.fontFamily = picker.value;
  });
})();


/* -----------------------------------------------------------------------------
   3. The parlour screen.

   ONE SCREEN, A LISTING BESIDE IT, AND TUNING IS NOT PLAYING. The behaviour is
   the Solarpunk Hermitage's television and the promise is the street's rather
   than that room's:

     · WHILE THE SCREEN IS OFF, previous and next are silent. They move which
       version is selected, the screen says which one and how long it runs, and
       NOTHING is fetched. The whole list can be walked without a single request
       leaving this page.
     · ONCE IT IS PLAYING, tuning changes the picture, because by then the
       visitor has asked for a screen and making them press play again for every
       version would be a worse room and no more consented.

   AND EVERY CONTROL SAYS WHAT IT WILL DO BEFORE IT IS PRESSED. A next button
   that only said "next" is the one place this design could quietly stop telling
   somebody how long the thing they are about to start runs for.

   WHAT THE OFF PANEL SAYS IS DERIVED FROM THE SELECTED CUT AND NOTHING ELSE.
   The Hermitage found that one the hard way: a panel written only on the path
   that does not play ends up sitting beside a running video naming a different
   programme. When two code paths can reach one piece of UI, render it from the
   state rather than writing it on the way past.

   love-embed.js BUILDS THE FRAME. It is the only thing on this site that
   builds a YouTube iframe and it is exposed for exactly this reason: two copies
   of those attributes is one copy that gets a referrerpolicy fixed and one that
   does not, silently, in the security-relevant half of that file.
   -------------------------------------------------------------------------- */
(function () {
  'use strict';

  var screen = document.getElementById('mopery-screen');
  if (!screen) return;

  var offPanel = document.getElementById('mopery-off');
  var nowEl    = document.getElementById('mopery-now');
  var runsEl   = document.getElementById('mopery-runs');
  var playBtn  = document.getElementById('mopery-play');
  var nextEl   = document.getElementById('mopery-nextup');
  var statusEl = document.getElementById('mopery-status');
  var prevBtn  = document.getElementById('mopery-prev');
  var nextBtn  = document.getElementById('mopery-next');
  if (!offPanel || !playBtn || !nextEl || !statusEl) return;

  var rows = [].slice.call(document.querySelectorAll('.mop-cut'));
  if (!rows.length) return;

  var cuts = rows.map(function (li) {
    return {
      el: li,
      id: li.dataset.id,
      title: li.dataset.title,
      runs: li.dataset.runs,
      spoken: li.dataset.spoken,
      how: li.dataset.how
    };
  });

  var at = 0;      // which version is selected
  var on = false;  // whether anything has been pressed

  /* The way out, for a version whose owner has embedding switched off. Built
     here rather than written into the page because it belongs to whichever cut
     is selected, and only one is. A link dressed as a screen is the broken
     thing; this is dressed as a door. */
  var door = document.createElement('a');
  door.className = 'mop-door';
  door.textContent = 'Open it on YouTube →';
  door.hidden = true;
  playBtn.insertAdjacentElement('afterend', door);

  function wrap(i) { return (i % cuts.length + cuts.length) % cuts.length; }

  function label() {
    var n = cuts[wrap(at + 1)];
    nextEl.textContent = 'Next: ' + n.title + ' · ' + n.spoken;
  }

  /* Said out loud, because the only other signal that the selection changed is
     a picture. The off panel cannot carry this on its own: it is hidden while
     the screen is playing, and a live region that disappears announces nothing. */
  function say(text) { statusEl.textContent = text; }

  function mark() {
    cuts.forEach(function (c, i) { c.el.classList.toggle('mop-cut--on', i === at); });
  }

  function render(c) {
    nowEl.textContent = c.title;
    if (c.how === 'link') {
      runsEl.textContent = c.runs + ' · this one will not play here';
      playBtn.hidden = true;
      door.hidden = false;
      door.href = 'https://www.youtube.com/watch?v=' + c.id;
    } else {
      runsEl.textContent = 'Runs ' + c.runs;
      playBtn.hidden = false;
      door.hidden = true;
    }
  }

  /* Rebuilt rather than hidden, so a retired player is GONE from the page and
     not merely invisible. A hidden player is still a player. */
  function clearFrame() {
    var frame = screen.querySelector('iframe');
    if (frame) frame.remove();
  }

  function showPanel(c) {
    clearFrame();
    render(c);
    offPanel.hidden = false;
    say(c.how === 'link'
      ? 'Selected: ' + c.title + ', ' + c.spoken + '. This one cannot be played here; a link out is on the screen.'
      : 'Selected: ' + c.title + ', ' + c.spoken + '. The screen is off.');
  }

  function playNow(c) {
    render(c);
    if (c.how === 'link') { showPanel(c); return; }
    var player = window.loveEmbed && window.loveEmbed.frame(c.id, c.title);
    if (!player) { showPanel(c); return; }
    clearFrame();
    offPanel.hidden = true;
    screen.appendChild(player);
    on = true;
    say('Now playing ' + c.title + ', ' + c.spoken + '.');
  }

  function tune(i, bring) {
    at = wrap(i);
    var c = cuts[at];
    if (on) { playNow(c); } else { showPanel(c); }
    mark();
    label();
    if (bring) screen.scrollIntoView({ block: 'center' });
  }

  playBtn.addEventListener('click', function () { playNow(cuts[at]); });
  if (prevBtn) prevBtn.addEventListener('click', function () { tune(at - 1, false); });
  if (nextBtn) nextBtn.addEventListener('click', function () { tune(at + 1, false); });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.mop-tune');
    if (!btn) return;
    var i = parseInt(btn.dataset.cut, 10) - 1;
    on = true;               // choosing from the listing IS pressing play
    tune(i, true);
  });

  showPanel(cuts[0]);
  mark();
  label();
})();
