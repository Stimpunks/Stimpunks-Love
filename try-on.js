/* =============================================================================
   The Dopamine Dress-Up Den: who is wearing it, and keeping it as an avatar.

   THE DEN DRAWS NO BODY OF ITS OWN. The stand is what wears the clothes until
   somebody brings in a bodymind they drew at the Bodymind Booth next door,
   which arrives in the address, after the #, and never reaches any server --
   or is fetched from their own Profile, signed on to the CB, when they press
   for it. Then everything on the rails goes on them instead, drawn by
   avatar.js, and the readout says so. The rails are dressup.js's, which this
   file reads through window.loveDressUp and never changes behind its back.

   IT SENDS ONE THING, AND ONLY WHEN SOMEBODY PRESSES A BUTTON THAT SAYS SO.
   "Keep it as an avatar" and "Keep the changes" send the look -- the stand, or
   the bodymind, and what is on it, as keys and nothing else -- with the name
   and words typed beside it, to /cb/avatars, with the pass the radio keeps in
   love-cb, which this file reads and never writes. "Your bodymind", with none
   brought in, asks the same address for the ones already kept, and so does
   Your strip, which strip.js draws and this file says what pressing does.
   Nothing is stored, no camera or file is asked for, nothing is drawn onto a
   canvas, and tools/make-bodymind.py reads this file and refuses each of
   those.

   NOTHING MOVES. Changing who wears it swaps the drawing at once.
   ============================================================================= */
(function () {
  'use strict';

  var A = window.loveAvatar, D = window.loveDressUp;
  var who = document.getElementById('dd-who');
  var stand = document.getElementById('dd-stand');
  var bodyBox = document.getElementById('dd-body');
  if (!A || !D || !who || !stand || !bodyBox) return;

  var readout = document.getElementById('dd-readout');
  var standBtn = document.getElementById('dd-who-stand');
  var bodyBtn = document.getElementById('dd-who-body');
  var mine = document.getElementById('dd-who-mine');
  var keep = document.getElementById('dd-keep');
  var change = document.getElementById('dd-change');
  var nameIn = document.getElementById('dd-keep-name');
  var aboutIn = document.getElementById('dd-keep-about');
  var said = document.getElementById('dd-keep-said');

  var AVATARS = '/cb/avatars';
  var body = null;          // the bodymind brought in, if any
  var extra = {};           // what it has on from Fantasy Fancy Dress, which the rails here do not hang
  var onesie = null;        // the chimera a chimera onesie from there is made after, which goes with it
  var door = document.getElementById('dd-fancy-door');
  var onBody = false;       // whether it is wearing the clothes
  var editing = null, was = { name: '', about: '' };

  function say(text) {
    said.textContent = '';
    setTimeout(function () { said.textContent = text; }, 60);
  }

  function pass() {
    try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return v && v.pass ? v.pass : null; }
    catch (e) { return null; }
  }

  function send(payload) {
    var p = pass();
    if (!p) return Promise.resolve({ status: 0, body: {} });
    var opts = { method: payload ? 'POST' : 'GET', credentials: 'omit', cache: 'no-store',
      headers: { 'accept': 'application/json', 'authorization': 'Bearer ' + p } };
    if (payload) { opts.headers['content-type'] = 'application/json'; opts.body = JSON.stringify(payload); }
    return fetch(AVATARS, opts).then(function (r) {
      return r.json().then(function (b) { return { status: r.status, body: b }; }, function () { return { status: r.status, body: {} }; });
    }, function () { return { status: -1, body: {} }; });
  }

  function trouble(r, nothing) {
    if (r.status === 0) return 'Sign on to the CB first, at the Community Center, and press it again. ' + nothing;
    if (r.status === 401) return 'Since you signed on, this username has been signed off. Sign on again at the Community Center. ' + nothing;
    if (r.status === -1) return 'The street could not be reached just now. ' + nothing;
    return (r.body && typeof r.body.error === 'string') ? r.body.error : 'That did not work just now. ' + nothing;
  }

  /* FANTASY FANCY DRESS, through the back, dresses only a bodymind: wings,
     ears, tails, paws, jewellery and suits. The rails here do not hang them,
     so whatever of theirs a bodymind came in wearing is carried here and put
     back on it with everything from the rails, and never on the stand. */
  var BODY_ONLY = A.data.bodyOnly || [];
  function fancy(wear) {
    var out = {};
    Object.keys(wear || {}).forEach(function (k) { if (BODY_ONLY.indexOf(k) !== -1) out[k] = wear[k]; });
    return out;
  }
  function look() {
    if (!(onBody && body)) return { base: 'stand', wear: D.wear() };
    var wear = D.wear();
    Object.keys(extra).forEach(function (k) { wear[k] = extra[k]; });
    var lk = { base: 'bodymind', body: body, wear: wear };
    if (onesie) lk.chimera = onesie;
    return lk;
  }
  /* The door through the back takes the bodymind with it, in the address,
     and which avatar it is, if one is being changed, so Keep the changes still
     changes that one when it comes back through. */
  function doorTo() {
    if (!door) return;
    var lk = onBody && body ? A.clean(look()) : null;
    door.href = 'fantasy-fancy-dress.html' + (lk ? '#' + (editing ? 'avatar=' + encodeURIComponent(editing) + '&' : '') + 'look=' + A.code(lk) : '');
  }

  /* Draw whoever is wearing it, and say it in the readout's own words. */
  function show() {
    if (onBody && body) {
      var lk = A.clean(look());
      bodyBox.textContent = '';
      var art = lk && A.draw(lk, { ground: true, cls: 'dd-bodymind' });
      if (art) bodyBox.appendChild(art);
      stand.setAttribute('hidden', '');
      bodyBox.removeAttribute('hidden');
      var on = A.wearWords(lk);
      readout.textContent = on ? 'On your bodymind: ' + on + '.' : 'Your bodymind has nothing from the rails on. Underneath, whatever you drew it in.';
    } else {
      bodyBox.setAttribute('hidden', '');
      stand.removeAttribute('hidden');
    }
    standBtn.setAttribute('aria-pressed', String(!onBody));
    bodyBtn.setAttribute('aria-pressed', String(onBody));
    doorTo();
  }

  function wearIt(b, sayIt) {
    body = b;
    onBody = true;
    mine.textContent = '';
    show();
    if (sayIt) say(sayIt + ' ' + readout.textContent);
  }

  /* Your bodymind, with none brought in: the ones you kept, to choose from,
     or where to make one. */
  function choose() {
    mine.textContent = '';
    var p = document.createElement('p');
    p.className = 'dd-who__note';
    mine.appendChild(p);
    if (!pass()) {
      p.appendChild(document.createTextNode('Draw your bodymind at '));
      var a = document.createElement('a'); a.href = 'bodymind-booth.html'; a.textContent = 'the Bodymind Booth';
      p.appendChild(a);
      p.appendChild(document.createTextNode(' next door and press Take it next door: it comes back in with you. Signed on to the CB, the ones you keep can be brought in from here.'));
      return;
    }
    p.textContent = 'Fetching the bodyminds you kept…';
    send(null).then(function (r) {
      if (r.status !== 200 || !r.body.avatars) { p.textContent = trouble(r, ''); return; }
      var bodies = r.body.avatars.filter(function (x) { return x.look.base === 'bodymind'; }).reverse();
      if (!bodies.length) {
        p.textContent = 'You have not kept a bodymind yet. Draw one at ';
        var a2 = document.createElement('a'); a2.href = 'bodymind-booth.html'; a2.textContent = 'the Bodymind Booth';
        p.appendChild(a2); p.appendChild(document.createTextNode(' next door.'));
        return;
      }
      p.textContent = 'Which of yours is wearing it? What is on the rails goes on them; what they had on before stays in your Profile.';
      var ul = document.createElement('ul');
      ul.className = 'dd-who__list';
      bodies.forEach(function (x) {
        var li = document.createElement('li');
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'dd-go dd-go--quiet';
        var when = '';
        try { when = new Date(x.t).toLocaleDateString(undefined, { day: 'numeric', month: 'long' }); } catch (e) {}
        b.textContent = x.name ? 'Put it on ' + x.name : x.about ? 'Put it on: ' + x.about : 'Put it on the one you kept on ' + when;
        b.addEventListener('click', function () {
          extra = fancy(x.look.wear);
          onesie = x.look.chimera || null;
          wearIt(x.look.body, 'It is on ' + (x.name || 'your bodymind') + '.');
          // Keep the changes changes that one; Keep it as a new one is beside it.
          editMode(x.id, x.name, x.about);
          bodyBtn.focus();
        });
        li.appendChild(b);
        ul.appendChild(li);
      });
      mine.appendChild(ul);
      var first = ul.querySelector('button');
      if (first) first.focus();
    });
  }

  standBtn.addEventListener('click', function () {
    onBody = false;
    mine.textContent = '';
    show();
    // dressup.js wrote the stand's readout; ask it to write it again.
    D.put(D.wear());
    say('Back on the stand. ' + readout.textContent);
  });
  bodyBtn.addEventListener('click', function () {
    if (body) { wearIt(body, 'It is on your bodymind.'); return; }
    choose();
  });
  document.addEventListener('love-dressed', function () { if (onBody) show(); });

  /* ── Keeping ───────────────────────────────────────────────────────────── */
  function editMode(id, name, about) {
    editing = id;
    was = { name: name || '', about: about || '' };
    nameIn.value = was.name;
    aboutIn.value = was.about;
    change.hidden = !id;
    keep.textContent = id ? 'Keep it as a new one' : 'Keep it as an avatar';
    doorTo();
  }

  function words(payload, edit) {
    if (!edit || nameIn.value !== was.name) payload.name = nameIn.value;
    if (!edit || aboutIn.value !== was.about) payload.about = aboutIn.value;
    return payload;
  }

  keep.addEventListener('click', function () {
    var lk = A.clean(look());
    if (!lk) return;
    keep.disabled = true;
    send(words({ keep: lk }, false)).then(function (r) {
      keep.disabled = false;
      if (r.status === 200 && r.body.kept) {
        editMode(r.body.kept.id, r.body.kept.name, r.body.kept.about);
        say('Kept. It is in your Profile on the radio' + (r.body.claimed ? ', where you can wear it on the CB.' : '. Claim your username under Account, on the radio, to wear it on the CB.'));
        try { window.dispatchEvent(new CustomEvent('love-avatars')); } catch (e) {}
        if (strip) strip.refresh();
        return;
      }
      say(trouble(r, 'Nothing was kept.'));
    });
  });

  change.addEventListener('click', function () {
    var lk = A.clean(look());
    if (!lk || !editing) return;
    change.disabled = true;
    send(words({ edit: editing, look: lk }, true)).then(function (r) {
      change.disabled = false;
      if (r.status === 200 && r.body.avatars) {
        was = { name: nameIn.value, about: aboutIn.value };
        say('Changed, in your Profile' + (r.body.wearing === editing ? ' and on the CB, where you wear it.' : '.'));
        try { window.dispatchEvent(new CustomEvent('love-avatars')); } catch (e) {}
        if (strip) strip.refresh();
        return;
      }
      say(trouble(r, 'Nothing was changed.'));
    });
  });

  /* ── Your strip ────────────────────────────────────────────────────────────
     strip.js draws it; this says what pressing a frame does here. Whatever
     comes out of it comes in as it was kept: a bodymind with everything it
     had on, the rails' things back on the rails and Fantasy Fancy Dress's
     carried with it, or an outfit back on the stand. Keep the changes then
     changes that one. */
  var strip = window.loveStrip && window.loveStrip({
    shows: document.getElementById('dd-strip-do'),
    open: document.getElementById('dd-strip-open'),
    list: document.getElementById('dd-strip'),
    said: document.getElementById('dd-strip-said'),
    item: 'dd-kept', art: 'dd-kept__photo',
    none: 'Nothing kept yet. Keep one from the stand above, or draw a bodymind at the Bodymind Booth next door.',
    act: function (a) {
      var mind = a.look.base === 'bodymind';
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dd-go dd-go--quiet';
      b.textContent = (mind ? 'Dress ' : 'Put ') + (a.name || 'this one') + (mind ? ' here' : ' on the stand');
      b.addEventListener('click', function () {
        if (mind) {
          D.put(a.look.wear || {});
          extra = fancy(a.look.wear);
          onesie = a.look.chimera || null;
          wearIt(a.look.body, '');
        } else {
          onBody = false;
          mine.textContent = '';
          D.put(a.look.wear || {});
          show();
        }
        editMode(a.id, a.name, a.about);
        document.getElementById('the-stand').scrollIntoView({ block: 'start' });
        (mind ? bodyBtn : standBtn).focus({ preventScroll: true });
        say((a.name || (mind ? 'Your bodymind' : 'Your outfit')) + (mind ? ' is here, ' : ' is on the stand, ') +
          'as you kept it. Change what you like on the rails and press Keep the changes. ' + readout.textContent);
      });
      return b;
    }
  });

  /* ── Brought in ────────────────────────────────────────────────────────── */
  var from = {};
  location.hash.replace(/^#/, '').split('&').forEach(function (kv) {
    var i = kv.indexOf('=');
    if (i > 0) from[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1));
  });
  var brought = from.look ? A.uncode(from.look) : null;
  who.hidden = false;
  if (brought) {
    // A bodymind walked in fresh from the booth has nothing from the rails on,
    // so it puts on whatever the stand has; one kept with clothes on, or a
    // stand, brings its own back onto the rails.
    if (brought.base === 'stand' || Object.keys(brought.wear || {}).length) D.put(brought.wear || {});
    if (from.avatar && /^v[A-Za-z0-9_-]{10}$/.test(from.avatar)) {
      editMode(from.avatar, '', '');
      send(null).then(function (r) {
        var a = r.status === 200 && r.body.avatars && r.body.avatars.filter(function (x) { return x.id === editing; })[0];
        if (a) editMode(a.id, a.name, a.about);
      });
    }
    if (brought.base === 'bodymind') { extra = fancy(brought.wear); onesie = brought.chimera || null; wearIt(brought.body, ''); }
    else show();
  } else {
    show();
  }
})();
