/* A rack: cards under a room's screen, each of which can play its own film in
   place or put it up on the screen, in place of whatever the screen had.

   The Lightbulb Picture House's rack came first (picture-house.js), and Ryan's
   call on 2026-09-28 made it the pattern for racks: the next room to take it
   moves the behaviour into one shared file, and this is that file. THE
   BEHAVIOUR IS SHARED AND THE LOOK IS NOT: every room dresses its own screen,
   cards and buttons in its own section of love.css, and this file only finds
   the parts by their data- attributes, the job marker's rule. The promises are
   the Picture House's, and each one is somebody else's lesson:

   IT BUILDS NOTHING OF ITS OWN. The frame comes from loveEmbed.frameUrl, so
   love-embed.js is still the only thing on this site that builds a frame, with
   the referrer policy and the origin check in one place.

   THE BUTTON SAYS HOW LONG BEFORE THE PRESS, like every press here (a live
   camera says it runs until you close it), and it ships hidden, so a page with
   no script shows no control that does nothing. This file unhides them.

   THE ANSWER IS WHERE THE EYE GOES. A screen can be a long way up the page from
   the card that was pressed, and a press that starts a film nobody can see is
   the Playhouse's unseen answer again. So the press moves focus to the line
   under the screen that names what is showing, which brings the screen into
   view, with no smooth scroll, because the dial exists so nothing glides.

   PUTTING THE SCREEN BACK DOES NOT PLAY IT. It takes the film off and puts the
   screen's own plate back, exactly as the page shipped it, so whatever the
   screen had waits for its own press again. Nothing is stored.

   A SPOT FROM THE CB REACHES THE SCREEN TOO. Arriving by a spot's room link,
   cb.js marks the card's own play button with where to start
   (data-embed-start), and this reads it off the same card, so the film starts
   there on the screen as well.

   The parts, all found by attribute:
     [data-rack-screen=ID]  the element holding a screen's plate
     [data-rack-now=ID]     the line under it that names what is showing
     [data-rack-back=ID]    the button that puts the screen back (in a hidden parent)
     [data-rack-to=ID]      a card's second button, with data-rack-src,
                            data-rack-title, data-rack-film, data-rack-runtime
                            and data-rack-name (the screen's name)
     [data-rack-card]       a card, round its own plate and its second button
   A screen may carry data-rack-off, a sentence saying what the screen has
   given up while a card's film is on it.

   A SCREEN MAY HAVE NOTHING OF ITS OWN ON IT (The Doom Scoop, 2026-09-29: a
   morning is not a list anybody can put on whole). Such a screen ships hidden,
   because without this script it is a panel saying to put something up with a
   button that never appears, and this unhides it. It carries tabindex="-1", so
   taking a film off puts the keyboard back on the screen rather than nowhere.

   A card's second button may carry data-rack-shape (tall, for a short), and the
   screen wears it while that film is up, so the room can play it upright rather
   than as a small picture between two black bars.

   THE CB CAN PUT A VIDEO UP TOO, ON THE PAGE'S FIRST SCREEN. Ryan, 2026-10-04:
   a moderator pastes a YouTube address into the radio and it goes up here with
   no card for it, and anybody who presses Follow or Catch up beside them gets
   its play button on their own first screen, waiting for their press. cb.js
   makes that button, or asks loveEmbed for the frame, and loveRack.put puts it
   on the glass the way a card's second press does, with the line under it and
   the way back, so this file still builds nothing. The first screen is the
   first in the page, because a room's main screen is the one at its top. */
(function () {
  var screens = {}, order = [];

  Array.prototype.forEach.call(document.querySelectorAll('[data-rack-screen]'), function (glass) {
    var id = glass.getAttribute('data-rack-screen');
    order.push(id);
    screens[id] = {
      glass: glass,
      plate: glass.innerHTML,
      off: glass.getAttribute('data-rack-off') || '',
      now: document.querySelector('[data-rack-now="' + id + '"]'),
      back: document.querySelector('[data-rack-back="' + id + '"]')
    };
  });

  if (!window.loveEmbed) return;

  Array.prototype.forEach.call(document.querySelectorAll('[data-rack-to]'), function (btn) {
    if (screens[btn.getAttribute('data-rack-to')]) btn.hidden = false;
  });
  Object.keys(screens).forEach(function (id) { screens[id].glass.hidden = false; });

  // 100 -> "1:40", 3723 -> "1:02:03"
  function clock(s) {
    var h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60;
    return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (x < 10 ? '0' : '') + x;
  }

  /* Up on a screen, in place of whatever it had: a frame in its shell, or the
     CB's unpressed plate. The line under the screen says what, and what the
     screen has given up; the way back is shown. Nothing is focused here,
     because a card's press and the CB's want the keyboard in different places. */
  function put(id, node, said) {
    var s = screens[id];
    if (!s || !node) return null;
    s.glass.innerHTML = '';
    s.glass.appendChild(node);
    s.glass.removeAttribute('data-rack-shape');
    s.glass.hidden = false;
    if (s.now) {
      s.now.textContent = said + (s.off ? ' ' + s.off : '');
      s.now.hidden = false;
    }
    if (s.back) s.back.parentNode.hidden = false;
    return s.now;
  }

  function show(btn) {
    var id = btn.getAttribute('data-rack-to'), s = screens[id];
    if (!s) return;
    var card = btn.closest('[data-rack-card]'), own = card && card.querySelector('button.facade');
    var start = parseInt(own && own.getAttribute('data-embed-start'), 10);
    var src = btn.getAttribute('data-rack-src');
    if (start > 0 && window.loveEmbed.withStart) src = window.loveEmbed.withStart(src, start);
    else start = 0;
    var player = window.loveEmbed.frameUrl(src, btn.getAttribute('data-rack-title'));
    if (!player) return;
    var shell = document.createElement('div');
    shell.className = 'facade';
    shell.style.padding = '0';
    shell.appendChild(player);
    put(id, shell, 'Now showing on ' + btn.getAttribute('data-rack-name') + ': ' +
      btn.getAttribute('data-rack-film') + ', ' + btn.getAttribute('data-rack-runtime') +
      (start ? ', from ' + clock(start) : '') + '.');
    var shape = btn.getAttribute('data-rack-shape');
    if (shape) s.glass.setAttribute('data-rack-shape', shape);
    if (s.now) s.now.focus();
  }

  // The page's first screen and what it calls itself, as its cards name it.
  function first() {
    var id = order[0];
    if (!id) return null;
    var to = document.querySelector('[data-rack-to="' + id + '"]');
    return { id: id, name: (to && to.getAttribute('data-rack-name')) || 'the screen' };
  }
  window.loveRack = { first: first, put: put };

  function putBack(btn) {
    var s = screens[btn.getAttribute('data-rack-back')];
    if (!s) return;
    s.glass.innerHTML = s.plate;
    s.glass.removeAttribute('data-rack-shape');
    if (s.now) { s.now.hidden = true; s.now.textContent = ''; }
    if (s.back) s.back.parentNode.hidden = true;
    var plate = s.glass.querySelector('button') || (s.glass.hasAttribute('tabindex') ? s.glass : null);
    if (plate) plate.focus();
  }

  document.addEventListener('click', function (e) {
    var to = e.target.closest('[data-rack-to]');
    if (to) { show(to); return; }
    var back = e.target.closest('[data-rack-back]');
    if (back) putBack(back);
  });
})();
