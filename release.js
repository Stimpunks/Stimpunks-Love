/* =============================================================================
   Your own pet, let out at Pekoe and Purrs or on the Run, and taken home.
   Ryan's ask, 2026-10-23: let your adopted dogs out on the dog park and your
   adopted cats into the cat café.

   TWO ROOMS TOOK IT AT ONCE, SO IT IS ONE FILE FROM THE START (rack.js's rule).
   Each room's tool writes the part this draws into, with the room's own words
   on its data- attributes and the room's own classes, and dresses it in its
   own section of love.css. This file finds the parts by attribute:

     [data-release]          the part, with data-kind (cat or dog), data-cls
                             (the room's class for the part; a pet's row is its
                             __pet, and __pic, __draw, __words, __name, __where
                             and __btn hang off it too),
                             data-btn (the room's button class) and the room's
                             sentences, each with {name} or {Name} in it
     [data-release-signon]   what to say to somebody not signed on, shipped hidden
     [data-release-none]     what to say to somebody with no pets of this kind
     [data-release-trouble]  where a sentence about something not working goes
     [data-release-list]     where a row for each of your pets goes
     [data-release-said]     the answer under the rows (aria-hidden)
     [data-roam-says]        the room's one live region, roam.js's

   IT ASKS ONLY WHEN THERE IS A PASS, AND ONLY /cb/release. With the pass the
   radio keeps in love-cb, which this file reads and never writes, it asks once
   which of your pets of the room's kind there are and which are out, and then
   only when you press a button: let one out, or take one home. It stores
   nothing, writes no markup from a string, and never says whose a pet is to
   anybody but you. When something changed it tells roam.js with a
   love-released event on the document, and roam.js reads the room's list
   again, so the pet arrives or leaves while you watch. make-rescue.py refuses
   this file if any of that changes.

   Every answer is said where the hand is, under the rows, and once into the
   room's live region, cleared first so a sentence said twice is heard twice.
   A row is updated in place, so the keyboard stays on the button pressed.
   ============================================================================= */
(function () {
  'use strict';

  var part = document.querySelector('[data-release]');
  var A = window.loveAnimals;
  var KINDS = { cat: 1, dog: 1 };
  if (!part || !A || !KINDS[part.getAttribute('data-kind')]) return;
  var KIND = part.getAttribute('data-kind');
  var CLS = part.getAttribute('data-cls');
  var BTN = part.getAttribute('data-btn');
  var list = part.querySelector('[data-release-list]');
  var signon = part.querySelector('[data-release-signon]');
  var none = part.querySelector('[data-release-none]');
  var trouble = part.querySelector('[data-release-trouble]');
  var said = part.querySelector('[data-release-said]');
  var says = document.querySelector('[data-roam-says]');
  var rows = {};       // id -> { li, name, where, btn, pet }
  var busy = false;

  function words(key, pet) {
    var w = part.getAttribute('data-' + key) || '';
    var n = pet ? (pet.name || 'the ' + pet.words.coat + ' ' + A.noun(pet)) : '';
    return w.replace(/\{name\}/g, n).replace(/\{Name\}/g, n.charAt(0).toUpperCase() + n.slice(1));
  }
  function speak(text) {
    if (said) { said.textContent = text; said.hidden = !text; }
    if (!says || !text) return;
    says.textContent = '';
    setTimeout(function () { says.textContent = text; }, 40);
  }
  function only(el) {
    [signon, none, trouble].forEach(function (p) { if (p) p.hidden = p !== el; });
  }
  function pass() {
    try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return v && v.pass ? v.pass : null; }
    catch (e) { return null; }
  }

  function call(method, payload) {
    var p = pass();
    if (!p) return Promise.resolve({ status: 0, body: {} });
    var opts = { method: method, credentials: 'omit', cache: 'no-store',
      headers: { 'accept': 'application/json', 'authorization': 'Bearer ' + p } };
    if (payload) { opts.headers['content-type'] = 'application/json'; opts.body = JSON.stringify(payload); }
    return fetch('/cb/release' + (method === 'GET' ? '?kind=' + KIND : ''), opts).then(function (r) {
      return r.json().then(function (b) { return { status: r.status, body: b }; }, function () { return { status: r.status, body: {} }; });
    }, function () { return { status: -1, body: {} }; });
  }

  function where(pet) { return words(pet.out ? (pet.gate ? 'is-gate' : 'is-out') : 'is-home', pet); }

  function draw(pets) {
    var ids = {};
    pets.forEach(function (pet) { ids[pet.id] = true; });
    Object.keys(rows).forEach(function (id) {
      if (!ids[id]) { list.removeChild(rows[id].li); delete rows[id]; }
    });
    pets.forEach(function (pet) {
      var r = rows[pet.id];
      if (!r) {
        r = rows[pet.id] = { li: document.createElement('li') };
        r.li.className = CLS + '__pet';
        var pic = document.createElement('span');
        pic.className = CLS + '__pic';
        pic.setAttribute('aria-hidden', 'true');
        pic.appendChild(A.draw(pet, CLS + '__draw', { bare: true }));
        var text = document.createElement('p');
        text.className = CLS + '__words';
        r.name = document.createElement('strong');
        r.name.className = CLS + '__name';
        r.where = document.createElement('span');
        r.where.className = CLS + '__where';
        text.appendChild(r.name);
        text.appendChild(r.where);
        r.btn = document.createElement('button');
        r.btn.type = 'button';
        r.btn.className = BTN + ' ' + CLS + '__btn';
        r.btn.addEventListener('click', function () { press(r); });
        r.li.appendChild(pic);
        r.li.appendChild(text);
        r.li.appendChild(r.btn);
        list.appendChild(r.li);
      }
      r.pet = pet;
      var name = pet.name || 'Not named yet';
      r.name.textContent = name;
      r.where.textContent = ', a ' + pet.words.coat + ' ' + A.noun(pet) + ', ' + where(pet) + '.';
      r.btn.textContent = words(pet.out ? 'take' : 'let', pet);
    });
    list.hidden = !pets.length;
    if (pets.length) only(null); else only(none);
  }

  function failed(r) {
    if (r.status === 0) { list.hidden = true; only(signon); speak(''); return; }
    var text = r.status === 401 ? words('signed-off') : words('trouble');
    if (trouble) trouble.textContent = text;
    only(trouble);
    speak(text);
  }

  function press(r) {
    if (busy) return;
    var pet = r.pet, out = !pet.out;
    busy = true;
    r.btn.setAttribute('aria-disabled', 'true');
    call('POST', { kind: KIND, id: pet.id, out: out }).then(function (res) {
      busy = false;
      r.btn.removeAttribute('aria-disabled');
      if (res.body && Array.isArray(res.body.pets)) draw(res.body.pets);
      if (res.status === 200) {
        var now = (res.body.pets || []).filter(function (p) { return p.id === pet.id; })[0] || pet;
        speak(words(out ? (now.gate ? 'went-gate' : 'went-out') : 'went-home', now));
        document.dispatchEvent(new CustomEvent('love-released', { detail: { id: pet.id } }));
      } else if (res.status === 409 && res.body && (res.body.why === 'each' || res.body.why === 'full')) {
        speak(words(res.body.why, pet));
      } else {
        failed(res);
      }
    });
  }

  part.hidden = false;
  if (!pass()) { only(signon); return; }
  call('GET').then(function (r) {
    if (r.status === 200 && r.body && Array.isArray(r.body.pets)) draw(r.body.pets);
    else failed(r);
  });
}());
