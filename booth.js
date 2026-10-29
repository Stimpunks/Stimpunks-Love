/* =============================================================================
   The Bodymind Booth: the choices, the picture, and keeping it.

   EVERYTHING IS READ OFF THE PAGE AND OUT OF avatar.js. The choices are the
   form tools/make-bodymind.py writes out of data/bodymind.json; the picture and
   the words read back are avatar.js's, which draws every avatar on the street.
   This file keeps no second copy of either.

   NO BODY COMES FIRST. The page ships with nothing checked; this draws
   somebody at random -- how they get about, their shape, skin, face and hair --
   so there is no body the booth starts from. "Somebody else, at random" draws
   another and leaves what you always have with you, and how you get about,
   where you put them. A walking aid is for a bodymind on its feet, so in a
   chair those choices are switched off and the booth says why, beside them.

   IT SENDS ONE THING, AND ONLY WHEN SOMEBODY PRESSES A BUTTON THAT SAYS SO.
   "Keep it in my Profile" and "Keep the changes" send the look -- the choices
   and nothing else -- with the name and words typed beside it, to /cb/avatars,
   with the pass the radio keeps in love-cb, which this file reads and never
   writes. Your strip, under the booth, is strip.js's, which only reads.
   Nothing is stored, no camera or file is asked for, and nothing is drawn onto
   a canvas: an avatar stays a list of choices. make-bodymind.py reads this file
   and refuses each of those.

   NEXT DOOR IS AN ADDRESS. "Take it next door" carries the look to the
   Dress-Up Den after the #, which never reaches any server.

   AN ARIA-LIVE REGION DOES NOT ANNOUNCE TEXT IT ALREADY HOLDS, so say() clears
   it and sets it back on the next tick, as love.js and dressup.js do. Picking
   a choice is not announced: a screen reader already says it is checked, and
   the readout under the picture says the whole bodymind for anybody who wants
   it.
   ============================================================================= */
(function () {
  'use strict';

  var A = window.loveAvatar;
  var form = document.getElementById('bmb-choices');
  var frame = document.getElementById('bmb-frame');
  if (!A || !form || !frame) return;

  var readout = document.getElementById('bmb-readout');
  var said = document.getElementById('bmb-said');
  var next = document.getElementById('bmb-next');
  var keep = document.getElementById('bmb-keep');
  var change = document.getElementById('bmb-change');
  var nameIn = document.getElementById('bmb-name');
  var aboutIn = document.getElementById('bmb-about');
  var stripDo = document.getElementById('bmb-strip-do');
  var stripOpen = document.getElementById('bmb-strip-open');
  var stripList = document.getElementById('bmb-strip');
  var stripSaid = document.getElementById('bmb-strip-said');

  var AVATARS = '/cb/avatars';
  var GROUPS = A.data.body.groups;
  var STANDING = A.data.body.standingOnly;
  var wear = {};            // what it has on, if it came back from next door
  var onesie = null;        // and the chimera a chimera onesie it has on is made after
  var editing = null;       // the id of the avatar being changed, if any
  var was = { name: '', about: '' };

  function say(el, text) {
    el.textContent = '';
    setTimeout(function () { el.textContent = text; }, 60);
  }

  function pass() {
    try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return v && v.pass ? v.pass : null; }
    catch (e) { return null; }
  }

  function send(body) {
    var p = pass();
    if (!p) return Promise.resolve({ status: 0 });
    var opts = { method: body ? 'POST' : 'GET', credentials: 'omit', cache: 'no-store',
      headers: { 'accept': 'application/json', 'authorization': 'Bearer ' + p } };
    if (body) { opts.headers['content-type'] = 'application/json'; opts.body = JSON.stringify(body); }
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

  /* ── The form and the look ─────────────────────────────────────────────── */
  function read() {
    var body = {};
    GROUPS.forEach(function (g) {
      var box = form.querySelector('[data-group="' + g.key + '"]');
      if (g.multi) {
        body[g.key] = Array.prototype.map.call(box.querySelectorAll('input:checked'), function (i) { return i.value; });
      } else {
        var on = box.querySelector('input:checked');
        body[g.key] = on ? on.value : g.options[0][0];
      }
    });
    var lk = { base: 'bodymind', body: body, wear: wear };
    if (onesie) lk.chimera = onesie;
    return lk;
  }

  function set(look) {
    GROUPS.forEach(function (g) {
      var v = look.body[g.key];
      Array.prototype.forEach.call(form.querySelectorAll('[data-group="' + g.key + '"] input'), function (i) {
        i.checked = g.multi ? v.indexOf(i.value) !== -1 : i.value === v;
      });
    });
  }

  /* In a chair, a walking aid is left off, and the booth says so beside it. */
  function feet() {
    var pose = form.querySelector('[data-group="pose"] input:checked');
    var seated = pose && pose.value !== 'standing';
    var dropped = false;
    Object.keys(STANDING).forEach(function (k) {
      Array.prototype.forEach.call(form.querySelectorAll('[data-group="' + k + '"] input[data-standing]'), function (i) {
        if (seated && i.checked) {
          i.checked = false;
          dropped = true;
          var none = form.querySelector('[data-group="' + k + '"] input[value="none"]');
          if (none) none.checked = true;
        }
        i.disabled = !!seated;
        i.closest('.bmb-opt').classList.toggle('bmb-opt--off', !!seated);
      });
    });
    return dropped;
  }

  function draw() {
    var look = A.clean(read());
    if (!look) return null;
    frame.textContent = '';
    var art = A.draw(look, { ground: true, cls: 'bmb-photo' });
    if (art) frame.appendChild(art);
    readout.textContent = A.words(look);
    next.href = 'dopamine-dress-up-den.html#' + (editing ? 'avatar=' + encodeURIComponent(editing) + '&' : '') + 'look=' + A.code(look);
    return look;
  }

  function shuffle(keepAbout) {
    var r = A.random();
    if (keepAbout) {
      var now = read();
      GROUPS.forEach(function (g) {
        if (A.data.body.random.indexOf(g.key) === -1) r.body[g.key] = now.body[g.key];
      });
    } else {
      var poses = GROUPS.filter(function (g) { return g.key === 'pose'; })[0].options;
      r.body.pose = poses[Math.floor(Math.random() * poses.length)][0];
    }
    set(r);
    feet();
  }

  function editMode(id, name, about) {
    editing = id;
    was = { name: name || '', about: about || '' };
    nameIn.value = was.name;
    aboutIn.value = was.about;
    change.hidden = !id;
    keep.textContent = id ? 'Keep it as a new one' : 'Keep it in my Profile';
  }

  /* ── Keeping ───────────────────────────────────────────────────────────── */
  function words(body, edit) {
    // A change sends a name or words only if they were changed here, so
    // coming back to change a picture never rubs out what was written.
    if (!edit || nameIn.value !== was.name) body.name = nameIn.value;
    if (!edit || aboutIn.value !== was.about) body.about = aboutIn.value;
    return body;
  }

  keep.addEventListener('click', function () {
    var look = draw();
    if (!look) return;
    keep.disabled = true;
    send(words({ keep: look }, false)).then(function (r) {
      keep.disabled = false;
      if (r.status === 200 && r.body.kept) {
        editMode(r.body.kept.id, r.body.kept.name, r.body.kept.about);
        say(said, 'Kept. It is in your Profile on the radio' + (r.body.claimed ? ', where you can wear it on the CB.' : '. Claim your username under Account, on the radio, to wear it on the CB.'));
        try { window.dispatchEvent(new CustomEvent('love-avatars')); } catch (e) {}
        if (strip) strip.refresh();
        return;
      }
      say(said, trouble(r, 'Nothing was kept.'));
    });
  });

  change.addEventListener('click', function () {
    var look = draw();
    if (!look || !editing) return;
    change.disabled = true;
    send(words({ edit: editing, look: look }, true)).then(function (r) {
      change.disabled = false;
      if (r.status === 200 && r.body.avatars) {
        was = { name: nameIn.value, about: aboutIn.value };
        say(said, 'Changed, in your Profile' + (r.body.wearing === editing ? ' and on the CB, where you wear it.' : '.'));
        try { window.dispatchEvent(new CustomEvent('love-avatars')); } catch (e) {}
        if (strip) strip.refresh();
        return;
      }
      say(said, trouble(r, 'Nothing was changed.'));
    });
  });

  /* ── Your strip ──────────────────────────────────────────────────────────
     strip.js draws it; this says what pressing a frame does here. A bodymind
     comes back into the booth to be changed; an outfit on the stand is the
     Dress-Up Den's to change, so it is a way next door. */
  var strip = window.loveStrip && window.loveStrip({
    shows: stripDo, open: stripOpen, list: stripList, said: stripSaid,
    item: 'bmb-frame-kept', art: 'bmb-photo',
    none: 'Nothing kept yet. Keep one from the booth above.',
    act: function (a) {
      if (a.look.base === 'bodymind') {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'bmb-go bmb-go--quiet';
        b.textContent = 'Change ' + (a.name || 'this one') + ' here';
        b.addEventListener('click', function () {
          wear = a.look.wear || {};
          onesie = a.look.chimera || null;
          set(a.look);
          feet();
          editMode(a.id, a.name, a.about);
          draw();
          document.getElementById('the-booth').scrollIntoView({ block: 'start' });
          keep.focus();
          say(said, (a.name || 'It') + ' is in the booth. Change what you like and press Keep the changes.');
        });
        return b;
      }
      var to = document.createElement('a');
      to.className = 'bmb-go bmb-go--quiet';
      to.href = 'dopamine-dress-up-den.html#avatar=' + encodeURIComponent(a.id) + '&look=' + A.code(a.look);
      to.textContent = 'Dress ' + (a.name || 'this one') + ' next door';
      return to;
    }
  });

  /* ── Wiring ────────────────────────────────────────────────────────────── */
  form.addEventListener('change', function () {
    if (feet()) say(said, 'In a chair, a cane, crutches and a walker are left off.');
    draw();
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  document.getElementById('bmb-again').addEventListener('click', function () {
    shuffle(true);
    say(said, 'Somebody else. ' + readout.textContent);
    draw();
  });

  // Back from Profile or next door, with a look in the address: put it in the
  // booth, and say which avatar it is so Keep the changes changes that one.
  var hash = location.hash.replace(/^#/, ''), from = {};
  hash.split('&').forEach(function (kv) { var i = kv.indexOf('='); if (i > 0) from[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); });
  var brought = from.look ? A.uncode(from.look) : null;
  if (brought && brought.base === 'bodymind') {
    wear = brought.wear || {};
    onesie = brought.chimera || null;
    set(brought);
    feet();
    if (from.avatar && /^v[A-Za-z0-9_-]{10}$/.test(from.avatar)) {
      editMode(from.avatar, '', '');
      send(null).then(function (r) {
        var a = r.status === 200 && r.body.avatars && r.body.avatars.filter(function (x) { return x.id === editing; })[0];
        if (a) editMode(a.id, a.name, a.about);
      });
    }
  } else {
    shuffle(false);
  }

  document.getElementById('bmb-do').hidden = false;
  draw();
})();
