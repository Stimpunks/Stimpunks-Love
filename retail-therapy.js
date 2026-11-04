/* Retail Therapy: the light switch, the hunt and the little free library.

   Norah Hobbs's script, from the page she made for Infodumplings on 5 November
   2026, with its class names prefixed rth- and the lights set on <body> rather
   than on <html>, so that nothing here can reach another room. It keeps
   nothing and sends nothing: the next visit starts with every shelf stocked
   again, as the shop's rules say. */
(function () {
  'use strict';
  var body = document.body;
  var main = document.getElementById('main');
  var lights = main.querySelector('.rth-lights');
  var hunt = main.querySelector('.rth-hunt');
  var list = main.querySelector('.rth-list');
  var up = lights.querySelector('[data-rth-lights="up"]');
  var down = lights.querySelector('[data-rth-lights="down"]');
  var note = lights.querySelector('.rth-lights__note');
  var NOTES = {
    up: 'The lights are low and the music is off: every question in the shop is in one list below.',
    down: 'The lights are off. Go from department to department and look or feel; each question turns up right where you were.'
  };

  function set(mode, focus) {
    var isDown = mode === 'down';
    hunt.hidden = !isDown;
    list.hidden = isDown;
    up.setAttribute('aria-pressed', String(!isDown));
    down.setAttribute('aria-pressed', String(isDown));
    body.setAttribute('data-lights', mode);
    note.textContent = NOTES[mode];
    if (focus) {
      var head = (isDown ? hunt : list).querySelector('h2');
      head.setAttribute('tabindex', '-1');
      head.focus();
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

  up.addEventListener('click', function () { set('up', true); });
  down.addEventListener('click', function () { set('down', true); });

  hunt.addEventListener('click', function (e) {
    var btn = e.target.closest('.rth-look');
    if (!btn) { return; }
    var slot = document.getElementById(btn.getAttribute('aria-controls'));
    if (btn.getAttribute('aria-expanded') === 'true') {
      btn.setAttribute('aria-expanded', 'false');
      slot.hidden = true;
      slot.replaceChildren();
      return;
    }
    var thing = main.querySelector('[data-thing="' + btn.getAttribute('data-look') + '"]');
    if (!thing) { return; }
    var copy = thing.cloneNode(true);
    copy.removeAttribute('data-thing');
    copy.querySelectorAll('[id]').forEach(function (n) { n.removeAttribute('id'); });
    var where = copy.querySelector('.rth-where');
    if (where) { where.remove(); }
    slot.replaceChildren(copy);
    slot.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  });

  var directory = document.getElementById('directory');
  directory.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-go]');
    if (!btn) { return; }
    set('down', false);
    var room = document.getElementById(btn.getAttribute('data-go'));
    if (!room) { return; }
    var head = room.querySelector('h3');
    room.scrollIntoView();
    head.setAttribute('tabindex', '-1');
    head.focus();
  });

  main.querySelector('.rth-lfl__books').addEventListener('click', function (e) {
    var btn = e.target.closest('.rth-book__spine');
    if (!btn) { return; }
    var page = document.getElementById(btn.getAttribute('aria-controls'));
    var open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    page.hidden = open;
  });

  directory.hidden = false;
  lights.hidden = false;
  set('up', false);
  fromHash();
  window.addEventListener('hashchange', fromHash);
})();
