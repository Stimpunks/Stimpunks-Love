/* =============================================================================
   Chimera Obscura's bench: pick two animals, choose which one each part comes
   from, and the chimera appears on the table. chimera.js draws it; this only
   asks it to.

   IT SENDS NOTHING UNLESS YOU PRESS KEEP IT IN MY PROFILE, signed on to the CB,
   and then only the chimera's parts and its name, to /cb/chimeras. Otherwise a
   chimera travels in the address after the #, as chimera=<its parts>, which
   never reaches a server; the page puts it there as you build, with
   replaceState, so the address in the bar is always a link to what is on the
   table. This file reads the CB's pass out of love-cb and never writes it, and
   tools/make-chimera-obscura.py refuses any other request, any storage and a
   sound in it.

   NOTHING HERE IS WRITTEN AS MARKUP. The controls are built with createElement
   and textContent, and the drawing is the element chimera.js builds, so a name
   somebody types never becomes markup.

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
    disc.textContent = '';
    var art = C.draw(state.parts, { prefix: 'chm-live', cls: 'chm-disc__draw' + (fresh ? ' chm-new' : '') });
    if (art) disc.appendChild(art);
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

  /* KEEP IT IN MY PROFILE, signed on to the CB: the chimera's parts and its
     name, to /cb/chimeras, and the radio's Profile is told so it can redraw
     its list if it is open. The answer goes in the bench's own line. */
  function pass() {
    try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return v && v.pass ? v : null; }
    catch (e) { return null; }
  }
  var keepBox = document.getElementById('chm-keep');
  var keepOff = document.getElementById('chm-keep-off');
  var keepBtn = document.getElementById('chm-keep-btn');
  var me = pass();
  if (me && keepBox && keepBtn) {
    keepBox.hidden = false;
    var who = document.getElementById('chm-keep-who');
    if (who) who.textContent = me.handle || '';
    keepBtn.addEventListener('click', function () {
      var p = pass();
      if (!p) { say('Sign on to the CB first, at the Community Center, and press it again. Nothing was kept.'); return; }
      keepBtn.disabled = true;
      say('Keeping it\u2026');
      fetch('/cb/chimeras', {
        method: 'POST', credentials: 'omit', cache: 'no-store',
        headers: { 'accept': 'application/json', 'content-type': 'application/json', 'authorization': 'Bearer ' + p.pass },
        body: JSON.stringify({ keep: state.parts, name: state.name || C.suggest(state.parts) })
      }).then(function (r) {
        return r.json().then(function (b) { return { status: r.status, body: b }; }, function () { return { status: r.status, body: {} }; });
      }).then(function (r) {
        keepBtn.disabled = false;
        if (r.status === 200) {
          say('Kept in your Profile, on the radio, as ' + (state.name || C.suggest(state.parts)) + '. Send it as a sticker from there, or from Sticker.');
          try { window.dispatchEvent(new CustomEvent('love-chimeras')); } catch (e) {}
          return;
        }
        if (r.status === 401) { say('The password has changed since you signed on. Sign on again at the Community Center. Nothing was kept.'); return; }
        say((r.body && typeof r.body.error === 'string') ? r.body.error + ' Nothing was kept.' : 'That did not work just now. Nothing was kept.');
      }, function () {
        keepBtn.disabled = false;
        say('The street could not be reached just now. Nothing was kept.');
      });
    });
  } else if (keepOff) {
    keepOff.hidden = false;
  }

  // A new chimera comes into focus at MAX; the class comes off once it has.
  disc.addEventListener('animationend', function (e) {
    if (e.target && e.target.classList) e.target.classList.remove('chm-new');
  });

  adopt(fromAddress() || opening());
  bench.hidden = false;
  if (noscript) noscript.hidden = true;
  sync(false);
})();
