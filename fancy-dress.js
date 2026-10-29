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

   NOTHING IS KEPT AND NOTHING IS SENT FROM HERE. The way back to the Den
   carries the look in its own address, the same way it came in, and keeping
   it as an avatar is the Den's to do, when somebody presses Keep there.
   tools/make-fancy-dress.py reads this file and refuses a fetch, storage, a
   camera, a file, a canvas or markup written from a string.

   YOUR STRIP IS strip.js's, which only reads: signed on, "Open my strip" asks
   the CB for the avatars already kept, and this file says what pressing a
   frame does. A bodymind comes into the fitting with everything it had on; an
   outfit on the stand is the Den's, so it is a way back through. Which avatar
   came in rides back to the Den in the address, so Keep the changes there
   changes that one.

   A CHIMERA ONESIE IS MADE AFTER ONE OF YOUR CHIMERAS (a request from our
   community for Halloween, 2026-10-28). Which one is chosen under the suits
   rail: the one brought from Chimera Obscura in the address (#chimera=), the
   ones on its wall, or the ones you kept, which strip.js reads when you press
   Bring my chimeras. The look carries the chimera's parts, which avatar.js
   checks, and goes back to the Dress-Up Den with it.

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
  var chimSel = document.getElementById('ffd-suit-chimera');
  var chimSaid = document.getElementById('ffd-chimera-said');
  var ONESIE = 'chimera-onesie';
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
  var yours = !!brought;   // a bodymind of yours, rather than somebody at random
  // Which kept avatar it is, if the Den or your strip said, for the way back.
  var kept = brought && from.avatar && /^v[A-Za-z0-9_-]{10}$/.test(from.avatar) ? from.avatar : null;

  function sel(rail, part) { return rail.querySelector('[data-part="' + part + '"]'); }
  function radio(rail, value) { return rail.querySelector('input[type="radio"][value="' + value + '"]'); }

  function set(slot, piece) {
    var rail = form.querySelector('.ffd-rail[data-slot="' + slot + '"]');
    if (!rail) return;
    var r = radio(rail, piece ? piece[0] : '');
    if (r) r.checked = true;
    if (piece) { sel(rail, 'print').value = piece[1]; sel(rail, 'colours').value = piece[2]; }
  }

  /* ── Which chimera ─────────────────────────────────────────────────── */
  function chimeraOption(group, label, parts, pick) {
    var code = A.chimera && A.chimera.code(parts);
    if (!chimSel || !code) return;
    var g = chimSel.querySelector('optgroup[data-group="' + group + '"]');
    if (!g) {
      g = document.createElement('optgroup');
      g.label = label;
      g.setAttribute('data-group', group);
      chimSel.insertBefore(g, group === 'mine' ? null : chimSel.firstChild);
    }
    return { add: function (text) {
      var o = document.createElement('option');
      o.value = code;
      o.textContent = text;
      g.appendChild(o);
      if (pick) chimSel.value = code;
      return o;
    } };
  }
  function chimeraNow() { return chimSel && A.chimera ? A.chimera.uncode(chimSel.value) : null; }
  function wearOnesie() {
    var r = form.querySelector('input[name="ffd-suit"][value="' + ONESIE + '"]');
    if (r) r.checked = true;
  }

  if (brought) {
    if (brought.chimera) {
      var came = chimeraOption('came', 'On your bodymind', brought.chimera, true);
      if (came) came.add('The one it came in wearing');
    }
    Object.keys(brought.wear || {}).forEach(function (slot) {
      if (ONLY.indexOf(slot) !== -1) set(slot, brought.wear[slot]);
      else den[slot] = brought.wear[slot];
    });
  }

  // A chimera brought from Chimera Obscura goes straight on as a onesie.
  var fromBench = from.chimera && A.chimera ? A.chimera.uncode(from.chimera) : null;
  if (fromBench) {
    var bench = chimeraOption('bench', 'From Chimera Obscura', fromBench, true);
    if (bench) { bench.add('The one you brought from Chimera Obscura'); wearOnesie(); }
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
    var lk = { base: 'bodymind', body: body, wear: wear };
    if (wear.suit && wear.suit[0] === ONESIE) lk.chimera = chimeraNow();
    return A.clean(lk);
  }

  /* A chimera onesie is in its chimera's own colours, so the suits rail's
     print and colours are set aside while it is on. */
  function onesieMode() {
    var rail = form.querySelector('.ffd-rail[data-slot="suit"]');
    var r = rail && rail.querySelector('input[type="radio"]:checked');
    var on = !!(r && r.value === ONESIE);
    if (rail) ['print', 'colours'].forEach(function (part) { var x = sel(rail, part); if (x) x.disabled = on; });
  }

  function show() {
    onesieMode();
    var lk = look();
    box.textContent = '';
    var art = lk && A.draw(lk, { ground: true, cls: 'ffd-bodymind' });
    if (art) box.appendChild(art);
    box.hidden = false;
    var on = lk ? A.wearWords(lk) : '';
    var whose = yours ? 'On your bodymind: ' : 'On somebody drawn at random: ';
    readout.textContent = on ? whose + on + '.' : (yours ? 'Your bodymind has nothing on from the rails yet.' : 'Somebody drawn at random, with nothing on from the rails yet.');
    if (back) back.href = 'dopamine-dress-up-den.html' + (lk ? '#' + (kept ? 'avatar=' + encodeURIComponent(kept) + '&' : '') + 'look=' + A.code(lk) : '');
    return lk;
  }

  /* Picking a piece opens its print and colours on its own first suggestion;
     changing them after that is yours. */
  form.addEventListener('change', function (e) {
    var t = e.target;
    if (t === chimSel) wearOnesie();
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
    if (chimSel) chimSel.value = any(values(chimSel));
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

  /* ── Your strip ──────────────────────────────────────────────────────── */
  function fromStrip(a) {
    body = a.look.body;
    den = {};
    rails.forEach(function (rail) { rail.querySelector('input[type="radio"]').checked = true; });
    Object.keys(a.look.wear || {}).forEach(function (slot) {
      if (ONLY.indexOf(slot) !== -1) set(slot, a.look.wear[slot]);
      else den[slot] = a.look.wear[slot];
    });
    if (a.look.chimera) {
      var c = chimeraOption('kept-' + a.id, (a.name || 'Your bodymind') + ' had on', a.look.chimera, true);
      if (c) c.add('The one it came in wearing');
    }
    yours = true;
    kept = a.id;
    if (someone) someone.hidden = true;
    if (who) who.textContent = (a.name || 'Your bodymind') + ' came out of your strip, with everything it had on. What it wears from the Dress-Up Den stays on it, and what it wears from these rails is back on them.';
    show();
    document.getElementById('the-fitting').scrollIntoView({ block: 'start' });
    var first = form.querySelector('input[type="radio"]:checked');
    if (first) first.focus({ preventScroll: true });
    say((a.name || 'Your bodymind') + ' is in the fitting, as you kept it. ' + readout.textContent);
  }
  if (window.loveStrip) window.loveStrip({
    shows: document.getElementById('ffd-strip-do'),
    open: document.getElementById('ffd-strip-open'),
    list: document.getElementById('ffd-strip'),
    said: document.getElementById('ffd-strip-said'),
    item: 'ffd-kept', art: 'ffd-kept__photo',
    none: 'Nothing kept yet. Draw a bodymind at the Bodymind Booth, and keep it there or in the Dress-Up Den.',
    act: function (a) {
      if (a.look.base === 'bodymind') {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'ffd-go ffd-go--quiet';
        b.textContent = 'Dress ' + (a.name || 'this one') + ' here';
        b.addEventListener('click', function () { fromStrip(a); });
        return b;
      }
      // The stand never comes through the curtain; its way is back through.
      var to = document.createElement('a');
      to.className = 'ffd-go ffd-go--quiet';
      to.href = 'dopamine-dress-up-den.html#avatar=' + encodeURIComponent(a.id) + '&look=' + A.code(a.look);
      to.textContent = 'Back through with ' + (a.name || 'this one');
      return to;
    }
  });

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

  /* ── Your chimeras ────────────────────────────────────────────────────── */
  var chimDo = document.getElementById('ffd-chimera-do'), chimOpen = document.getElementById('ffd-chimera-open');
  function chimSay(text) {
    if (!chimSaid) return;
    chimSaid.textContent = '';
    setTimeout(function () { chimSaid.textContent = text; }, 60);
  }
  if (chimDo && chimOpen && window.loveStrip && window.loveStrip.chimeras && window.loveStrip.signedOn()) {
    chimDo.hidden = false;
    chimOpen.addEventListener('click', function () {
      chimSay('Fetching your chimeras…');
      window.loveStrip.chimeras().then(function (r) {
        if (r.status !== 200 || !r.body.chimeras) { chimSay(window.loveStrip.trouble(r)); return; }
        var old = chimSel.querySelector('optgroup[data-group="mine"]');
        if (old) old.remove();
        if (!r.body.chimeras.length) {
          chimSay('Nothing kept yet. Make a chimera in Chimera Obscura and press Keep it in my Profile there.');
          return;
        }
        var first = null;
        r.body.chimeras.forEach(function (c) {
          var mine = chimeraOption('mine', 'Kept in your Profile', c.parts, false);
          var o = mine && mine.add(c.name || 'Not named');
          if (o && !first) first = o;
        });
        if (first) { chimSel.value = first.value; wearOnesie(); show(); }
        chimSel.focus();
        chimSay('Your chimeras are in the list, under Kept in your Profile, and the first is on. ' + readout.textContent);
      });
    });
  }

  if (doBox) doBox.hidden = false;
  show();
})();
