/* =============================================================================
   Your table: ask for something from a room's menu, and look down to see it on
   the table in front of you.

   Pekoe and Purrs came first (2026-10-04, inside purrs.js), and Brew and Stew
   asked for the same thing the same day, so the behaviour moved into this one
   file, the way rack.js did when a second room took the Picture House's rack.
   A Quiet Pint is the third room to use it (2026-10-05).
   THE BEHAVIOUR IS SHARED AND THE LOOK IS NOT: every room draws its own table,
   its own things to put on it and its own buttons, in its own section of
   love.css, and this file only finds the parts by their data- attributes.

   IT KEEPS NOTHING AND SENDS NOTHING. What is on your table lives in the page
   and is gone when you leave it: no storage, no request, no count of what
   anybody asked for. make-pekoe.py and make-brew-and-stew.py both refuse this
   file if it ever stores, fetches or writes HTML.

   A THING ON THE TABLE IS A COPY OF ITS OWN DRAWING ON THE MENU, so the menu
   and the table cannot disagree about what a latte or a loaf looks like.

   EVERY ANSWER IS SAID WHERE THE HAND IS, under the button that was pressed,
   one at a time, and once into the room's live region, cleared first so a
   sentence said twice is heard twice: the Playhouse's lesson.

   The parts, all found by attribute:
     [data-table]            the drawing of the table, with data-table-holds
       [data-slot]           a place on it, with data-x, data-y, data-w, data-h
     [data-table-order=KEY]  a button that brings KEY to the table, with
                             data-table-name; ships hidden, this unhides it.
                             It may carry data-table-tell, a sentence said
                             instead of the usual one, with {name} in it; A
                             Quiet Pint sets it to say how the order reached
                             you, and the other rooms never do
     [data-table-draw=KEY]   KEY's own drawing, copied onto the table
     [data-table-said]       the answer beside an order button (aria-hidden)
     [data-table-look]       the button that looks down and back up, with
                             data-label-down, data-label-up and data-said-up
                             (what is said on looking up); ships hidden
     [data-table-up]         what you see looking up (hidden while looking down)
     [data-table-down]       what you see looking down (shipped hidden)
     [data-table-words]      the line saying what is on the table
     [data-table-clear]      the button that clears the table (shipped hidden)
     [data-table-says]       the room's live region

   A ROOM CAN ADD TO WHAT YOU SEE LOOKING DOWN. Pekoe and Purrs puts a cat on
   your lap: window.loveTable.add({ words, draw }) gives this file a sentence to
   add to its own and a drawing to redo whenever the table is redrawn. */
(function () {
  'use strict';

  var board = document.querySelector('[data-table]');
  if (!board) return;
  var HOLDS = +board.getAttribute('data-table-holds') || 4;
  var slots = Array.prototype.slice.call(board.querySelectorAll('[data-slot]'));
  var lookBtn = document.querySelector('[data-table-look]');
  var clearBtn = document.querySelector('[data-table-clear]');
  var words = document.querySelector('[data-table-words]');
  var says = document.querySelector('[data-table-says]');
  var ups = Array.prototype.slice.call(document.querySelectorAll('[data-table-up]'));
  var downs = Array.prototype.slice.call(document.querySelectorAll('[data-table-down]'));

  var table = [];        // keys of what is on the table, in the order asked for
  var looking = false;
  var parts = [];        // what a room adds: { words: fn, draw: fn }

  function speak(text) {
    if (!says) return;
    says.textContent = '';
    setTimeout(function () { says.textContent = text; }, 40);
  }
  var lastSaid = null;
  function sayAt(el, text) {
    if (lastSaid && lastSaid !== el) { lastSaid.hidden = true; lastSaid.textContent = ''; }
    if (el) { el.textContent = text; el.hidden = false; lastSaid = el; }
    speak(text);
  }
  function listOf(names) {
    if (names.length < 2) return names.join('');
    return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
  }
  function nameOf(key) {
    var b = document.querySelector('[data-table-order="' + key + '"]');
    return b ? b.getAttribute('data-table-name') : key;
  }

  /* Put a copy of a drawing into a place on the table: the place says where
     and how big, and the copy loses its menu class so the menu's sizing does
     not follow it onto the table. */
  function place(g, svg) {
    svg.setAttribute('x', g.getAttribute('data-x'));
    svg.setAttribute('y', g.getAttribute('data-y'));
    svg.setAttribute('width', g.getAttribute('data-w'));
    svg.setAttribute('height', g.getAttribute('data-h'));
    svg.removeAttribute('class');
    svg.removeAttribute('data-table-draw');
    g.appendChild(svg);
  }

  function said() {
    var on = table.length ? 'On your table: ' + listOf(table.map(nameOf)) + '.'
      : 'Your table is empty. Ask for something from the menu.';
    return parts.reduce(function (s, p) { return s + (p.words ? ' ' + p.words() : ''); }, on);
  }

  function draw() {
    slots.forEach(function (g, i) {
      while (g.firstChild) g.removeChild(g.firstChild);
      var key = table[i];
      if (!key) return;
      var src = document.querySelector('[data-table-draw="' + key + '"]');
      if (src) place(g, src.cloneNode(true));
    });
    parts.forEach(function (p) { if (p.draw) p.draw(place); });
    if (words) words.textContent = said();
    if (clearBtn) clearBtn.hidden = !looking || !table.length;
  }

  function look(down) {
    looking = down;
    ups.forEach(function (e) { e.hidden = down; });
    downs.forEach(function (e) { e.hidden = !down; });
    if (words) words.hidden = !down;
    if (lookBtn) lookBtn.textContent = lookBtn.getAttribute(down ? 'data-label-up' : 'data-label-down');
    draw();
    speak(down ? 'You look down. ' + said() : (lookBtn && lookBtn.getAttribute('data-said-up')) || 'You look up.');
  }

  if (lookBtn) {
    lookBtn.hidden = false;
    lookBtn.addEventListener('click', function () { look(!looking); });
  }
  if (clearBtn) clearBtn.addEventListener('click', function () {
    table = [];
    draw();
    speak('Your table is cleared.');
    if (lookBtn) lookBtn.focus();
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-table-order]'), function (b) {
    var answer = b.parentNode.querySelector('[data-table-said]');
    b.hidden = false;
    b.addEventListener('click', function () {
      var name = b.getAttribute('data-table-name');
      if (table.length >= HOLDS) {
        sayAt(answer, 'Your table is full. Look down and clear it first.');
        return;
      }
      table.push(b.getAttribute('data-table-order'));
      draw();
      var tell = b.getAttribute('data-table-tell');
      sayAt(answer, tell ? tell.split('{name}').join(name.charAt(0).toUpperCase() + name.slice(1))
        : name + ' is on your table. Look down to see it.');
    });
  });

  window.loveTable = {
    add: function (part) { parts.push(part); draw(); },
    looking: function () { return looking; },
    redraw: draw,
  };
  draw();
}());
