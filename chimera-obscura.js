/* =============================================================================
   Chimera Obscura's bench: pick two animals, choose which one each part comes
   from, and the chimera appears on the table. chimera.js draws it; this only
   asks it to.

   IT KEEPS NOTHING AND SENDS NOTHING. A chimera travels in the address after
   the #, as chimera=<its parts>, which never reaches a server; the page puts
   it there as you build, with replaceState, so the address in the bar is
   always a link to what is on the table. tools/make-chimera-obscura.py refuses
   a fetch, storage and a sound in this file.

   MARKUP COMES FROM chimera.js AND NOWHERE ELSE. The controls are built with
   createElement and textContent, and the only innerHTML here is the drawing
   chimera.js hands back, so a name somebody types never becomes markup.

   THE ANSWER IS WHERE THE HAND IS (the Playhouse's lesson): the drawing changes
   on the table beside the bench, its name and its words change under it, and
   the words are the live region, so a screen reader hears which animal gave
   which part after every pick.
   ============================================================================= */
(function () {
  'use strict';

  var C = window.loveChimera;
  var bench = document.getElementById('chm-bench');
  var disc = document.getElementById('chm-disc');
  if (!C || !bench || !disc || !C.animals.length) return;

  var named = document.getElementById('chm-named');
  var spoken = document.getElementById('chm-words');
  var selA = document.getElementById('chm-a');
  var selB = document.getElementById('chm-b');
  var any = document.getElementById('chm-any');
  var slots = document.getElementById('chm-slots');
  var nameIn = document.getElementById('chm-name');
  var said = document.getElementById('chm-said');
  var noscript = document.getElementById('chm-noscript');

  var state = { a: '', b: '', any: false, parts: null, name: '', edited: false };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function say(t) { if (said) said.textContent = t; }

  /* Where to start: a chimera in the address, else the one the room opens on. */
  function fromAddress() {
    var m = /(?:^#|&)chimera=([a-z.]+)/.exec(location.hash || '');
    return m ? C.uncode(m[1]) : null;
  }
  function opening() {
    for (var i = 0; i < C.presets.length; i++) if (C.presets[i].id === C.opensOn) return C.presets[i].parts;
    return null;
  }
  function adopt(parts) {
    state.parts = C.clean(parts);
    state.a = state.parts.body;
    state.b = C.second(state.parts) || state.a;
    state.any = false;
    // A chimera made from more than two animals opens with every animal offered.
    C.slots.forEach(function (s) {
      var v = state.parts[s.key];
      if (v !== 'none' && v !== state.a && v !== state.b) state.any = true;
    });
  }

  function optionsFor(slot) {
    var pool = state.any ? C.animals.slice() : (state.a === state.b ? [state.a] : [state.a, state.b]);
    if (slot === 'back') return pool.filter(function (x) { return C.hasBack(x); }).concat(['none']);
    return pool;
  }
  function settle() {
    C.slots.forEach(function (s) {
      if (optionsFor(s.key).indexOf(state.parts[s.key]) === -1) state.parts[s.key] = s.key === 'back' ? 'none' : state.a;
    });
  }

  function fillSelect(sel, val) {
    sel.textContent = '';
    C.animals.forEach(function (an) {
      var o = el('option', null, an);
      o.value = an;
      if (an === val) o.selected = true;
      sel.appendChild(o);
    });
  }

  function buildSlots() {
    slots.textContent = '';
    C.slots.forEach(function (s) {
      var set = el('fieldset', 'chm-slot');
      set.appendChild(el('legend', 'chm-slot__name', s.legend));
      var row = el('div', 'chm-slot__opts');
      var opts = optionsFor(s.key);
      if (s.key === 'back' && opts.length === 1) {
        row.appendChild(el('p', 'chm-slot__none', state.any ? 'No animal on the shelf has a back of its own yet.' :
          'Neither animal has a back of its own, so there is nothing to put here.'));
      }
      opts.forEach(function (an) {
        if (s.key === 'back' && opts.length === 1) return;
        var lab = el('label', 'chm-opt');
        var r = el('input');
        r.type = 'radio'; r.name = 'chm-' + s.key; r.value = an;
        r.id = 'chm-' + s.key + '-' + an;
        if (state.parts[s.key] === an) r.checked = true;
        lab.setAttribute('for', r.id);
        lab.appendChild(r);
        lab.appendChild(document.createTextNode(' ' + (an === 'none' ? 'none' : an)));
        row.appendChild(lab);
      });
      set.appendChild(row);
      slots.appendChild(set);
    });
  }

  function render(fresh) {
    disc.innerHTML = C.svg(state.parts, { prefix: 'chm-live', cls: 'chm-disc__draw' + (fresh ? ' chm-new' : '') });
    if (!state.edited) state.name = C.suggest(state.parts);
    named.textContent = state.name || C.suggest(state.parts);
    if (nameIn.value !== state.name) nameIn.value = state.name;
    spoken.textContent = C.words(state.parts);
    try { history.replaceState(null, '', '#chimera=' + C.code(state.parts)); } catch (e) {}
  }

  function sync(fresh) {
    fillSelect(selA, state.a);
    fillSelect(selB, state.b);
    any.checked = state.any;
    settle();
    buildSlots();
    render(fresh);
  }

  selA.addEventListener('change', function () { state.a = selA.value; state.parts.body = state.a; sync(true); });
  selB.addEventListener('change', function () { state.b = selB.value; sync(true); });
  any.addEventListener('change', function () { state.any = any.checked; sync(false); });
  slots.addEventListener('change', function (e) {
    var t = e.target;
    if (!t || !t.name || t.name.indexOf('chm-') !== 0) return;
    var slot = t.name.slice(4);
    if (state.parts[slot] === undefined) return;
    state.parts[slot] = t.value;
    if (slot === 'body' && !state.any) { state.a = t.value; sync(true); return; }
    render(true);
  });
  nameIn.addEventListener('input', function () {
    state.edited = nameIn.value.trim() !== '';
    state.name = nameIn.value.trim();
    named.textContent = state.name || C.suggest(state.parts);
  });
  document.getElementById('chm-suggest').addEventListener('click', function () {
    state.edited = false;
    render(false);
    say('The name is back to the one the room suggests: ' + state.name + '.');
  });

  document.getElementById('chm-toss').addEventListener('click', function () {
    var pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
    var a = pick(C.animals), b = pick(C.animals.filter(function (x) { return x !== a; }));
    var p = { body: a };
    C.slots.forEach(function (s) { if (s.key !== 'body') p[s.key] = pick([a, b]); });
    var backs = [a, b].filter(function (x) { return C.hasBack(x); });
    p.back = backs.length && Math.random() < .6 ? backs[0] : 'none';
    // At least two parts from the second animal, or it is hardly a chimera.
    var fromB = C.slots.filter(function (s) { return p[s.key] === b; }).length;
    if (fromB < 2) { p.tail = b; p.markings = b; }
    state.a = a; state.b = b; state.any = false; state.edited = false;
    state.parts = C.clean(p);
    sync(true);
    say('Tossed: ' + C.suggest(state.parts) + ', out of ' + C.article(a) + ' ' + a + ' and ' + C.article(b) + ' ' + b + '.');
  });

  bench.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.chm-start') : null;
    if (!b) return;
    var parts = C.uncode(b.getAttribute('data-chimera') || '');
    if (!parts) return;
    adopt(parts);
    state.edited = false;
    sync(true);
    say('On the table: ' + state.name + '.');
  });

  document.getElementById('chm-copy').addEventListener('click', function () {
    var link = location.origin + location.pathname + '#chimera=' + C.code(state.parts);
    var done = function () { say('The link is copied. It opens this chimera on the table, and its name stays with you.'); };
    var fail = function () { say('Copying did not work here. The address in your browser’s bar is the link: ' + link); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(done, fail);
      else fail();
    } catch (err) { fail(); }
  });

  // A new chimera comes into focus at MAX; the class comes off once it has.
  disc.addEventListener('animationend', function (e) {
    if (e.target && e.target.classList) e.target.classList.remove('chm-new');
  });

  adopt(fromAddress() || opening());
  bench.hidden = false;
  if (noscript) noscript.hidden = true;
  sync(false);
})();
