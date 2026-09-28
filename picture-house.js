/* The Lightbulb Picture House: a card can put its film on the big screen.

   Ryan's ask, 2026-09-28: every card on a rack can play its film on that
   rack's screen, in place of the whole programme. Four promises, and each one
   is somebody else's lesson:

   IT BUILDS NOTHING OF ITS OWN. The frame comes from loveEmbed.frameUrl, so
   love-embed.js is still the only thing on this site that builds a YouTube
   iframe, with the referrer policy and the origin check in one place.

   THE BUTTON SAYS HOW LONG BEFORE THE PRESS, like every press here, and it
   ships hidden, so a page with no script shows no control that does nothing.
   This file unhides them.

   THE ANSWER IS WHERE THE EYE GOES. The screen is a long way up the page from
   most of the cards, and a press that starts a film nobody can see is the
   Playhouse's unseen answer again. So the press moves focus to the line under
   the screen that names what is showing, which brings the screen into view,
   with no smooth scroll, because the dial exists so nothing glides unasked.

   PUTTING THE PROGRAMME BACK DOES NOT PLAY IT. It takes the film off and puts
   the screen's own PRESS PLAY plate back, exactly as the page shipped it, so
   the whole programme still waits for its own press. Nothing is stored. */
(function () {
  var screens = {};

  Array.prototype.forEach.call(document.querySelectorAll('.lph-proscenium[data-lph-screen]'), function (glass) {
    var id = glass.getAttribute('data-lph-screen');
    screens[id] = {
      glass: glass,
      plate: glass.innerHTML,
      now: document.getElementById('lph-now-' + id),
      back: document.getElementById('lph-back-' + id)
    };
  });

  if (!window.loveEmbed) return;

  Array.prototype.forEach.call(document.querySelectorAll('.lph-card__big'), function (btn) {
    if (screens[btn.getAttribute('data-lph-screen')]) btn.hidden = false;
  });

  function show(btn) {
    var s = screens[btn.getAttribute('data-lph-screen')];
    if (!s) return;
    var player = window.loveEmbed.frameUrl(btn.getAttribute('data-lph-src'),
                                           btn.getAttribute('data-lph-title'));
    if (!player) return;
    var shell = document.createElement('div');
    shell.className = 'facade';
    shell.style.padding = '0';
    shell.appendChild(player);
    s.glass.innerHTML = '';
    s.glass.appendChild(shell);
    s.now.textContent = 'Now showing on ' + btn.getAttribute('data-lph-name') + ': ' +
      btn.getAttribute('data-lph-film') + ', ' + btn.getAttribute('data-lph-runtime') +
      '. The whole programme is off until you put it back.';
    s.now.hidden = false;
    s.back.parentNode.hidden = false;
    s.now.focus();
  }

  function putBack(btn) {
    var s = screens[btn.getAttribute('data-lph-screen')];
    if (!s) return;
    s.glass.innerHTML = s.plate;
    s.now.hidden = true;
    s.now.textContent = '';
    s.back.parentNode.hidden = true;
    var plate = s.glass.querySelector('button');
    if (plate) plate.focus();
  }

  document.addEventListener('click', function (e) {
    var big = e.target.closest('.lph-card__big');
    if (big) { show(big); return; }
    var back = e.target.closest('.lph-back');
    if (back) putBack(back);
  });
})();
