/* =============================================================================
   Fantasy Fancy Dress: the shop through the curtain at the back of the
   Dopamine Dress-Up Den, Helen Edgar's ask, 2026-10-15.

   EVERYTHING HERE GOES ON A BODYMIND. Wings, ears, tails, paws, beads, rings
   and dress-up suits need somebody to wear them, so they are never put on the
   Den's valet stand. The bodymind is the one somebody drew at the Bodymind
   Booth and brought through, in the address after the #, which never reaches
   any server; whatever it already has on from the Den's rails stays on it.
   With nobody brought through, it is somebody drawn at random, and a
   different somebody each time: the booth's rule that no body is the one a
   room starts from. avatar.js draws all of it.

   NOTHING IS KEPT AND NOTHING IS SENT. The way back to the Den carries the
   look in its own address, the same way it came in, and keeping it as an
   avatar is the Den's to do, when somebody presses Keep there.
   tools/make-fancy-dress.py reads this file and refuses a fetch, storage, a
   camera, a file, a canvas or markup written from a string.

   NOTHING MOVES. A pick changes the drawing at once.
   ============================================================================= */
(function () {
  'use strict';

  var A = window.loveAvatar;
  var form = document.getElementById('ffd-rails');
  var box = document.getElementById('ffd-body');
  var readout = document.getElementById('ffd-readout');
  var who = document.getElementById('ffd-who');
  var said = document.getElementById('ffd-said');
  var back = document.getElementById('ffd-back');
  var doBox = document.getElementById('ffd-do');
  var someone = document.getElementById('ffd-someone');
  if (!A || !form || !box || !readout) return;

  var ONLY = A.data.bodyOnly || [];
  var rails = Array.prototype.slice.call(form.querySelectorAll('.ffd-rail[data-slot]'));

  function say(text) {
    said.textContent = '';
    setTimeout(function () { said.textContent = text; }, 60);
  }

  /* Who came through, from the address. */
  var from = {};
  location.hash.replace(/^#/, '').split('&').forEach(function (kv) {
    var i = kv.indexOf('=');
    if (i > 0) from[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1));
  });
  var brought = from.look ? A.uncode(from.look) : null;
  if (brought && brought.base !== 'bodymind') brought = null;
  var body = brought ? brought.body : A.random().body;
  var den = {};   // what it has on from the Den's rails, which stays on it

  function sel(rail, part) { return rail.querySelector('[data-part="' + part + '"]'); }
  function radio(rail, value) { return rail.querySelector('input[type="radio"][value="' + value + '"]'); }

  function set(slot, piece) {
    var rail = form.querySelector('.ffd-rail[data-slot="' + slot + '"]');
    if (!rail) return;
    var r = radio(rail, piece ? piece[0] : '');
    if (r) r.checked = true;
    if (piece) { sel(rail, 'print').value = piece[1]; sel(rail, 'colours').value = piece[2]; }
  }

  if (brought) {
    Object.keys(brought.wear || {}).forEach(function (slot) {
      if (ONLY.indexOf(slot) !== -1) set(slot, brought.wear[slot]);
      else den[slot] = brought.wear[slot];
    });
  }

  function worn() {
    var out = {};
    rails.forEach(function (rail) {
      var r = rail.querySelector('input[type="radio"]:checked');
      if (r && r.value) out[rail.getAttribute('data-slot')] = [r.value, sel(rail, 'print').value, sel(rail, 'colours').value];
    });
    return out;
  }

  function look() {
    var wear = {}, here = worn();
    Object.keys(den).forEach(function (k) { wear[k] = den[k]; });
    Object.keys(here).forEach(function (k) { wear[k] = here[k]; });
    return A.clean({ base: 'bodymind', body: body, wear: wear });
  }

  function show() {
    var lk = look();
    box.textContent = '';
    var art = lk && A.draw(lk, { ground: true, cls: 'ffd-bodymind' });
    if (art) box.appendChild(art);
    box.hidden = false;
    var on = lk ? A.wearWords(lk) : '';
    var whose = brought ? 'On your bodymind: ' : 'On somebody drawn at random: ';
    readout.textContent = on ? whose + on + '.' : (brought ? 'Your bodymind has nothing on from the rails yet.' : 'Somebody drawn at random, with nothing on from the rails yet.');
    if (back) back.href = 'dopamine-dress-up-den.html' + (lk ? '#look=' + A.code(lk) : '');
    return lk;
  }

  /* Picking a piece opens its print and colours on its own first suggestion;
     changing them after that is yours. */
  form.addEventListener('change', function (e) {
    var t = e.target;
    if (t.type === 'radio' && t.value && t.getAttribute('data-start')) {
      var st = t.getAttribute('data-start').split(' '), rail = t.closest('.ffd-rail');
      sel(rail, 'print').value = st[0];
      sel(rail, 'colours').value = st[1];
    }
    show();
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  function any(list) { return list[Math.floor(Math.random() * list.length)]; }
  function values(s) { return Array.prototype.map.call(s.options, function (o) { return o.value; }); }

  document.getElementById('ffd-surprise').addEventListener('click', function () {
    rails.forEach(function (rail) {
      var radios = Array.prototype.slice.call(rail.querySelectorAll('input[type="radio"]'));
      var pieces = radios.filter(function (r) { return r.value; });
      (Math.random() < .45 ? radios[0] : any(pieces)).checked = true;
      sel(rail, 'print').value = any(values(sel(rail, 'print')));
      sel(rail, 'colours').value = any(values(sel(rail, 'colours')));
    });
    show();
    say('Surprise. ' + readout.textContent);
  });
  document.getElementById('ffd-bare').addEventListener('click', function () {
    rails.forEach(function (rail) { rail.querySelector('input[type="radio"]').checked = true; });
    show();
    say('Everything from this shop is off. ' + readout.textContent);
  });
  if (!brought && someone) {
    someone.hidden = false;
    someone.addEventListener('click', function () {
      body = A.random().body;
      show();
      say('Somebody else, drawn at random. ' + readout.textContent);
    });
  }

  if (who) {
    who.textContent = '';
    if (brought) {
      who.appendChild(document.createTextNode('Your bodymind came through with you. Whatever it had on from the rails in the Dress-Up Den stays on it, and everything from these rails goes on top.'));
    } else {
      who.appendChild(document.createTextNode('Nobody came through with you, so this is somebody drawn at random, and a different somebody every time. Draw your own at '));
      var a = document.createElement('a'); a.href = 'bodymind-booth.html'; a.textContent = 'the Bodymind Booth';
      who.appendChild(a);
      who.appendChild(document.createTextNode(', take it into the Dress-Up Den, and come through the curtain: it comes in with you.'));
    }
  }

  if (doBox) doBox.hidden = false;
  show();
})();
