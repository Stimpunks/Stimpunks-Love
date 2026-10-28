/* The Haunted House (love.css §132): the lights, and the hunt.

   TWO WAYS THROUGH ONE LIST. Every thing in the house is in the list with the
   lights up, and that list is the only copy: a place in the hunt CLONES the
   thing hidden there out of the list when somebody looks, so a place and the
   list can never disagree about what is in it (the Mopery's popups' rule).
   With no script the page is the list, which is the easy way through, and the
   switch and the hunt ship hidden so nothing dead is on the page.

   The lights start UP, which is the list, because that is the way through that
   works for everybody; the hunt is one press away, and an address ending
   #lights-down opens it. An address naming a thing (#thing-…) opens the list on
   it.

   IT KEEPS NOTHING, SENDS NOTHING, MAKES NO SOUND, MOVES NOTHING ON A CLOCK AND
   COUNTS NOTHING, and tools/make-haunted-house.py reads this file for each of
   those. What you found is put back when you leave. A found thing appears right
   under the place you looked, where your hand is (the Playhouse's rule), and the
   button says it is open; nothing is announced anywhere else. */
(function () {
  'use strict';
  var main = document.querySelector('body.haunted main');
  if (!main) { return; }
  var lights = main.querySelector('.hh-lights');
  var hunt = main.querySelector('.hh-hunt');
  var list = main.querySelector('.hh-list');
  if (!lights || !hunt || !list) { return; }
  var down = lights.querySelector('[data-hh-lights="down"]');
  var up = lights.querySelector('[data-hh-lights="up"]');
  var note = lights.querySelector('.hh-lights__note');

  var NOTES = {
    up: 'The lights are up: everything in the house is in one list below.',
    down: 'The lights are down. Go from room to room and look; what is hidden turns up where you looked.'
  };

  function set(mode, focus) {
    var isDown = mode === 'down';
    hunt.hidden = !isDown;
    list.hidden = isDown;
    down.setAttribute('aria-pressed', String(isDown));
    up.setAttribute('aria-pressed', String(!isDown));
    main.setAttribute('data-hh-lights', mode);
    if (note) { note.textContent = NOTES[mode]; }
    if (focus) {
      var head = (isDown ? hunt : list).querySelector('h2');
      if (head) { head.setAttribute('tabindex', '-1'); head.focus(); }
    }
  }

  function fromHash() {
    var h = location.hash;
    if (h === '#lights-down') { set('down', false); return; }
    if (h === '#lights-up') { set('up', true); return; }
    if (h.indexOf('#thing-') === 0) {
      set('up', false);
      var el = document.getElementById(h.slice(1));
      if (el) { el.scrollIntoView(); }
    }
  }

  down.addEventListener('click', function () { set('down', true); });
  up.addEventListener('click', function () { set('up', true); });

  // A place: the first press looks and the thing turns up under it; a second
  // press puts it back. The clone loses its ids, so nothing on the page has two.
  hunt.addEventListener('click', function (e) {
    var btn = e.target.closest('.hh-look');
    if (!btn) { return; }
    var slot = document.getElementById(btn.getAttribute('aria-controls'));
    if (!slot) { return; }
    if (btn.getAttribute('aria-expanded') === 'true') {
      btn.setAttribute('aria-expanded', 'false');
      slot.hidden = true;
      slot.replaceChildren();
      return;
    }
    var body = list.querySelector('[data-hh-thing="' + btn.getAttribute('data-hh-look') + '"]');
    if (!body) { return; }
    var copy = body.cloneNode(true);
    copy.removeAttribute('data-hh-thing');
    copy.querySelectorAll('[id]').forEach(function (n) { n.removeAttribute('id'); });
    slot.replaceChildren(copy);
    slot.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  });

  lights.hidden = false;
  set('up', false);
  fromHash();
  window.addEventListener('hashchange', fromHash);
})();
