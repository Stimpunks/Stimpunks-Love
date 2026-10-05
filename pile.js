/* =============================================================================
   The Pile: take something off the Pile, say what it is now, and put it on
   what you are making. Paint the last thing you put on, or knock it all down.
   Ryan's brief, 2026-10-05.

   EVERYTHING ON THE PILE IS IN THE LIST ON THE PAGE, written by
   tools/make-the-pile.py, every part with its own drawing and what it has been,
   so with scripts off the Pile is the list. This file unhides a place to make
   something out of it: a part, what you are making it, and a button, and a copy
   of that part's own drawing goes down on the sand in front of you, painted in
   whatever colour you chose. What you made is said in words, where the hand is
   and once into the live region.

   NOTHING IS KEPT, NOTHING IS SENT AND NOTHING IS SCORED. What you made lives in
   this page and is knocked down when you leave it. There is no right answer, so
   nothing here says whether anything was a good idea. make-the-pile.py refuses
   this file if it stores, fetches, writes HTML or tilts anything.
   ============================================================================= */
(function () {
  'use strict';

  var make = document.querySelector('[data-pile-make]');
  var what = document.querySelector('[data-pile-what]');
  var as = document.querySelector('[data-pile-as]');
  var add = document.querySelector('[data-pile-add]');
  var colour = document.querySelector('[data-pile-colour]');
  var paint = document.querySelector('[data-pile-paint]');
  var down = document.querySelector('[data-pile-down]');
  var said = document.querySelector('[data-pile-said]');
  var words = document.querySelector('[data-pile-words]');
  var says = document.querySelector('[data-pile-says]');
  var build = document.querySelector('[data-pile-build]');
  if (!make || !what || !as || !add || !build) return;

  var slots = Array.prototype.slice.call(build.querySelectorAll('[data-pile-slot]'));
  var made = [];   // { key, one, as, paint, colour, colourName }

  function speak(text) {
    if (!says) return;
    says.textContent = '';
    setTimeout(function () { says.textContent = text; }, 40);
  }
  function answer(text) {
    if (said) { said.textContent = text; said.hidden = false; }
    speak(text);
  }
  function part(key) { return document.querySelector('[data-pile-part="' + key + '"]'); }
  function the(one) { return one.replace(/^(?:a|an|some) /, 'the '); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function options() {
    var li = part(what.value);
    var becomes = [];
    try { becomes = JSON.parse(li.getAttribute('data-pile-becomes') || '[]'); } catch (e) {}
    while (as.firstChild) as.removeChild(as.firstChild);
    becomes.forEach(function (b) {
      var o = document.createElement('option');
      o.value = b; o.textContent = b;
      as.appendChild(o);
    });
  }

  function describe(m) {
    return m.one + (m.colourName ? ', painted ' + m.colourName : '') + ', now ' + m.as;
  }

  function draw() {
    slots.forEach(function (g, i) {
      while (g.firstChild) g.removeChild(g.firstChild);
      var m = made[i];
      if (!m) return;
      var src = document.querySelector('[data-pile-draw="' + m.key + '"]');
      if (!src) return;
      var svg = src.cloneNode(true);
      svg.removeAttribute('class');
      svg.removeAttribute('data-pile-draw');
      ['x', 'y', 'w', 'h'].forEach(function (k) {
        svg.setAttribute(k === 'w' ? 'width' : k === 'h' ? 'height' : k, g.getAttribute('data-' + k));
      });
      if (m.colour) svg.style.setProperty('--paint', 'var(' + m.colour + ')');
      g.appendChild(svg);
    });
    if (words) {
      words.textContent = made.length ? 'What you made: ' + made.map(describe).join('; ') + '.'
        : 'Nothing yet. Take something off the Pile.';
    }
    down.hidden = paint.hidden = !made.length;
  }

  what.addEventListener('change', options);
  add.addEventListener('click', function () {
    if (made.length >= slots.length) { answer('There is no more room in front of you. Knock it down and start again.'); return; }
    var li = part(what.value);
    var m = { key: what.value, one: li.getAttribute('data-pile-one'), as: as.value,
              paint: li.getAttribute('data-pile-paint') === 'yes', colour: null, colourName: null };
    made.push(m);
    draw();
    answer('You took ' + m.one + ' and made it ' + m.as + '.');
  });
  paint.addEventListener('click', function () {
    var m = made[made.length - 1];
    if (!m) return;
    var name = colour.options[colour.selectedIndex].textContent;
    if (!m.paint) { answer(cap(the(m.one)) + ' will not take paint, and stays as it is.'); return; }
    m.colour = colour.value; m.colourName = name;
    draw();
    answer('You painted ' + the(m.one) + ' ' + name + '.');
  });
  down.addEventListener('click', function () {
    made = [];
    draw();
    answer('You knocked it all down, and everything went back on the Pile.');
    what.focus();
  });

  make.hidden = false;
  options();
  draw();
}());
