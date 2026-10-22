/* =============================================================================
   Joining the CB, on join.html. Ryan's brief, 2026-10-21: the starter
   password became invites, an invite's link opens this page with its code
   after the #, and here somebody chooses a username and a password of their
   own, and an email address for recovery if they want one. See
   netlify/cb/lib.mjs, invites, and privacy.html#accounts for what it keeps.

   THE CB'S, DRESSED AS THE CB, as the forums and tasks are: a shadow root
   with cb.css and join.css the only sheets that reach it, in the radio's
   theme for this device. join.css names no colour of its own.

   IT SENDS ONLY TO /cb/join, and only what the form says: the invite, the
   username, the passwords and the address. The code in the link is after the
   #, so it reaches the server in a request body and never as an address. What
   it keeps is love-cb, the pass, once somebody has joined, the way the front
   desk keeps it; then love.js brings the radio. Nothing else is kept.

   A MODERATOR'S USERNAME takes the moderators' password and no invite: the
   page asks the server whether a username is a moderator's as soon as it is
   typed, and shows the field for it then. tools/make-accounts.py holds this.
   ============================================================================= */
(function () {
  'use strict';

  var mount = document.querySelector('[data-join]');
  if (!mount) return;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function cbState() {
    try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return v && v.pass ? v : null; }
    catch (e) { return null; }
  }
  function link(href, text) { var a = el('a', null, text); a.href = href; return a; }
  function day(t) {
    try { return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; }
  }

  /* ── The box ───────────────────────────────────────────────────────────── */

  var host = el('div', 'jn-mount');
  var root = host.attachShadow({ mode: 'open' });
  var waiting = 2;
  host.style.visibility = 'hidden';
  ['/cb.css', '/join.css'].forEach(function (href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    function ready() { if (--waiting === 0) host.style.visibility = ''; }
    l.addEventListener('load', ready);
    l.addEventListener('error', ready);
    root.appendChild(l);
  });
  var box = el('div', 'jn');
  root.appendChild(box);
  var bar = el('div', 'cb-bar jn-bar');
  var brand = el('p', 'jn-name');
  brand.appendChild(el('span', 'cb-brand', 'CB'));
  brand.appendChild(document.createTextNode(' The joining desk'));
  bar.appendChild(brand);
  box.appendChild(bar);
  var view = el('div', 'jn-view');
  box.appendChild(view);
  mount.textContent = '';
  mount.appendChild(host);

  /* The radio's theme for this device, as call.js would choose it: nobody here
     is signed on yet, so there is no radio to take it from. */
  function dressNow() {
    var lc = window.loveCall, s = cbState();
    if (lc && lc.schemeFor) host.setAttribute('data-scheme', lc.schemeFor((s && s.scheme) || 'auto'));
    host.setAttribute('data-motion', 'off');
  }
  dressNow();
  ['(prefers-contrast: more)', '(prefers-color-scheme: light)'].forEach(function (q) {
    try { window.matchMedia(q).addEventListener('change', dressNow); } catch (e) { /* an old browser */ }
  });

  function ask(send) {
    return fetch('/cb/join', {
      method: 'POST', credentials: 'omit', cache: 'no-store',
      headers: { 'accept': 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify(send),
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; });
    });
  }
  function why(r, otherwise) {
    if (r && r.status === 429) return 'Too many tries from here in a minute. Wait a moment and try again.';
    if (r && r.body && typeof r.body.error === 'string' && r.body.error) return r.body.error;
    if (r && (r.status === 404 || r.status === 405)) return 'The joining desk is not on this server. It only answers on stimpunks.world itself.';
    return otherwise;
  }

  /* ── Somebody already on ───────────────────────────────────────────────── */

  var on = cbState();
  if (on) {
    var p = el('p');
    if (/^cb1\./.test(on.pass)) {
      p.appendChild(document.createTextNode('This browser is signed on as ' + on.handle + ' with a shared password, which only claims a username now. The radio, in the corner of the screen, will claim ' + on.handle + ' for you. To join under another username instead, sign off at '));
    } else {
      p.appendChild(document.createTextNode('You are on the CB already, as ' + on.handle + '. To join under another username, sign off first, at '));
    }
    p.appendChild(link('/community-center.html#cb-signon-desk', 'the front desk'));
    p.appendChild(document.createTextNode(', and open the invite again.'));
    view.appendChild(p);
    return;
  }

  /* ── The form ──────────────────────────────────────────────────────────── */

  var given = {};
  try {
    (location.hash || '').replace(/^#/, '').split('&').forEach(function (kv) {
      var i = kv.indexOf('=');
      if (i > 0) given[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' '));
    });
  } catch (e) { /* a broken address: the boxes start empty */ }

  function field(label, id, type, auto) {
    var wrap = el('div', 'jn-field');
    var lab = el('label', 'cb-lab', label);
    lab.htmlFor = id;
    var input = el('input', 'cb-say jn-in');
    input.id = id;
    input.type = type || 'text';
    if (auto) input.autocomplete = auto;
    input.spellcheck = false;
    var note = el('p', 'cb-quiet jn-note');
    note.id = id + '-note';
    note.hidden = true;
    input.setAttribute('aria-describedby', note.id);
    wrap.appendChild(lab); wrap.appendChild(input); wrap.appendChild(note);
    return { wrap: wrap, input: input, note: note,
      say: function (t) { note.textContent = t || ''; note.hidden = !t; } };
  }

  var form = el('form', 'jn-form');
  form.setAttribute('aria-labelledby', 'jn-h');
  form.noValidate = true;
  var h = el('h2', 'jn-h', 'Join with an invite');
  h.id = 'jn-h';
  form.appendChild(h);
  var invite = field('Your invite code', 'jn-invite', 'text', 'off');
  invite.input.maxLength = 20;
  invite.input.value = given.invite || '';
  var name = field('A username', 'jn-name', 'text', 'username');
  name.input.maxLength = 24;
  name.input.value = given.name || '';
  var modPw = field('The moderators’ password', 'jn-mod', 'password', 'off');
  modPw.wrap.hidden = true;
  var pw = field('A password of your own, eight characters or more', 'jn-pw', 'password', 'new-password');
  var again = field('The same again', 'jn-pw2', 'password', 'new-password');
  var email = field('An email address for password recovery, if you want one (optional)', 'jn-email', 'email', 'email');
  email.wrap.hidden = true;
  email.say('Used for one thing: sending you a reset code when you ask for one at the front desk. Kept scrambled, shown to nobody but you, and gone when your username goes. The email comes from our team’s mailbox.');
  [invite, name, modPw, pw, again, email].forEach(function (f) { form.appendChild(f.wrap); });
  var norms = el('p', 'cb-quiet');
  norms.appendChild(document.createTextNode('Joining, you agree to '));
  norms.appendChild(link('https://stimpunks.org/covenant/', 'our covenant'));
  norms.appendChild(document.createTextNode(' and '));
  norms.appendChild(link('/community-center.html#cb-norms', 'the CB’s house norms'));
  norms.appendChild(document.createTextNode('.'));
  form.appendChild(norms);
  var go = el('button', 'cb-btn jn-go', 'Join');
  go.type = 'submit';
  form.appendChild(go);
  var said = el('p', 'cb-said jn-said');
  said.setAttribute('role', 'status');
  form.appendChild(said);
  view.appendChild(form);

  var mod = false;
  function setMod(yes) {
    mod = !!yes;
    modPw.wrap.hidden = !mod;
    invite.wrap.hidden = mod && !invite.input.value;
    if (mod) name.say('That username is a moderator’s. It is claimed with the moderators’ password as well, and needs no invite.');
  }

  /* What the server can say before anybody types a password: whether the
     invite works, whether the username is free and a moderator's, and whether
     recovery by email is switched on. */
  function check(what) {
    var send = { action: 'check' };
    if (what.invite) send.invite = invite.input.value;
    if (what.name) send.handle = name.input.value;
    return ask(send).then(function (r) {
      if (r.status !== 200) return;
      email.wrap.hidden = !r.body.emailOn;
      if (!r.body.emailOn) email.input.value = '';
      var iv = r.body.invite;
      if (iv) invite.say(iv.ok ? (iv.until ? 'This invite works, until ' + day(iv.until) + '.' : 'This invite works.') : iv.why);
      var hd = r.body.handle;
      if (hd) {
        if (hd.taken) { setMod(false); name.say(hd.why); }
        else if (!hd.ok) { setMod(false); name.say(hd.why); }
        else if (hd.mod) setMod(true);
        else { setMod(false); name.say(hd.handle + ' is free.'); }
      }
    }, function () { /* the join press says what went wrong */ });
  }
  invite.input.addEventListener('change', function () { if (invite.input.value.trim()) check({ invite: true }); else invite.say(''); });
  name.input.addEventListener('change', function () { if (name.input.value.trim()) check({ name: true }); else { name.say(''); setMod(false); } });
  check({ invite: !!invite.input.value, name: !!name.input.value });
  (invite.input.value ? name.input : invite.input).focus();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!name.input.value.trim()) { said.textContent = 'Type the username you would like.'; name.input.focus(); return; }
    if (!mod && !invite.input.value.trim()) { said.textContent = 'Type your invite code, or open the link it came in.'; invite.input.focus(); return; }
    if (pw.input.value !== again.input.value) { said.textContent = 'The two passwords are not the same.'; pw.input.focus(); return; }
    said.textContent = 'Joining…';
    go.disabled = true;
    ask({ action: 'join', invite: invite.input.value, handle: name.input.value, modPassword: mod ? modPw.input.value : undefined,
      password: pw.input.value, email: email.wrap.hidden ? undefined : email.input.value }).then(function (r) {
      go.disabled = false;
      if (r.status === 200 && r.body.pass) {
        try {
          localStorage.setItem('love-cb', JSON.stringify({ handle: r.body.handle, pass: r.body.pass, base: !!r.body.base, roles: r.body.roles || [], claimed: true, folded: false, aloud: true }));
        } catch (x) { said.textContent = 'This browser will not keep the pass, so the radio cannot stay on. A private window does that. Your username is claimed: sign on at the front desk in another window.'; return; }
        joined(r.body);
        return;
      }
      said.textContent = why(r, 'That did not work just now. Nothing was claimed.');
      if (r.body && r.body.mod) { setMod(true); modPw.input.focus(); }
      else if (r.body && r.body.taken) name.input.focus();
      else if (r.body && r.body.invite) invite.input.focus();
    }, function () { go.disabled = false; said.textContent = 'No signal: the joining desk could not be reached. Nothing was claimed.'; });
  });

  /* ── Joined: the recovery code, once, and then the radio ──────────────── */

  function joined(b) {
    view.textContent = '';
    var h2 = el('h2', 'jn-h', 'Welcome, ' + b.handle);
    h2.tabIndex = -1;
    view.appendChild(h2);
    view.appendChild(el('p', null, b.base
      ? b.handle + ' is yours, on your own password, and you are on the CB as the base, with the roles the moderators’ list gives you.'
      : b.handle + ' is yours, and only your password signs on as it.'));
    view.appendChild(el('p', null, 'Your recovery code is below. It is the way back in if you forget your password, and it will not be shown again: write it down, or keep it where you keep passwords.'));
    view.appendChild(el('p', 'cb-acct__code jn-code', b.recovery));
    var done = el('button', 'cb-btn', 'I have kept it');
    done.type = 'button';
    view.appendChild(done);
    h2.focus();
    done.addEventListener('click', function () {
      view.textContent = '';
      var h3 = el('h2', 'jn-h', 'You are on');
      h3.tabIndex = -1;
      view.appendChild(h3);
      view.appendChild(el('p', null, 'The radio is in the bottom right corner of the screen, and it rides along on every page of the street until you sign off.'));
      var next = el('p');
      next.appendChild(document.createTextNode('Some things to do now: '));
      next.appendChild(link('/forum.html#/c/introductions', 'post an introduction'));
      next.appendChild(document.createTextNode(', '));
      next.appendChild(link('/community-center.html#what-next', 'go on a quest or two'));
      next.appendChild(document.createTextNode(', or read '));
      next.appendChild(link('/cb-guide.html', 'the CB guide'));
      next.appendChild(document.createTextNode('.'));
      view.appendChild(next);
      h3.focus();
      if (window.loveRadio) window.loveRadio();
    });
  }
}());
