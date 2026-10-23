/* =============================================================================
   The notice: one line from our moderators along the top of the street's
   front page, the Community Center, the forums and the office's dashboard.
   Ryan's ask, 2026-10-23: put up, changed and taken down from the desk in the
   Moderators' room, with some sparkle and a fanfare at MAX GLITTER.

   IT ASKS /cb/notice ONCE A PAGE, and the request carries nothing of anybody's:
   no pass, no cookie, nothing typed. The answer is the words, read into nodes
   on the server, and their id; markdown.js, the street's one builder, makes
   them into elements with textContent, and this file builds nothing that was
   typed any other way. It sends nothing anywhere.

   A VISITOR CAN PUT IT AWAY (Ryan's call, the same day). Put it away keeps the
   notice's id under love-notice in their own browser, which privacy.html
   lists, and nothing else, so it stays away on every page it is on until a new
   notice goes up. The id is the server's hash of the words, so changing a
   letter is a new notice. The key clears itself once the notice it names is
   no longer up. Putting it away says so to a screen reader, in the notice's
   own status line, before the slot goes. The desk's drawings are previews:
   their button puts away only that drawing and remembers nothing.

   WHERE IT GOES: every [data-notice] on a page, which ships hidden and empty,
   so a page with no script, or with no notice up, shows nothing; and whatever
   the forums and the office hand window.loveNotice.into() inside their own
   shadow roots. The desk draws its preview with window.loveNotice.draw().

   IT WEARS THE CB'S CLOTHES, in a shadow root of its own with cb.css and
   notice.css. On a page of its own it wears what the radio on the page wears,
   or call.js's answer for what the radio would, or the device's (a copy of
   schemeFor('auto') in call.js, as guest.js keeps one: change all three).
   Inside the forums or the office it sets no scheme, and wears theirs.

   MAX GLITTER IS THE ONE SETTING WHERE ANYTHING MOVES, and the words are the
   same at all three. Stars twinkle along its rims, and a fanfare plays once:
   when it arrives at MAX, or when the dial is turned up to MAX while it is on
   the page, and never in a tab nobody is looking at. THE FANFARE MAKES NO
   SOUND: nothing on the street sounds until somebody presses something, and a
   notice arrives without being pressed. It is two herald's horns, with notes
   rising out of their bells. Every drawing is aria-hidden; a screen reader
   meets a region called Notice, holding the words. tools/check-notice.py
   holds all of this.
   ============================================================================= */
(function () {
  'use strict';

  var SVG = 'http://www.w3.org/2000/svg';
  var KEY = 'love-notice';
  var STARS = 14, WAVE = 18;
  var asked = null, mdWait = null, banners = [];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function draw(tag, attrs) {
    var e = document.createElementNS(SVG, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function ask() {
    if (!asked) {
      asked = fetch('/cb/notice', { credentials: 'omit', cache: 'no-store', headers: { accept: 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (b) { return b && b.notice && Array.isArray(b.notice.ast) ? b.notice : null; }, function () { return null; });
    }
    return asked;
  }
  // markdown.js, if the page has not loaded it already, and only once there is something to build.
  function markdown() {
    if (window.loveMarkdown) return Promise.resolve(true);
    if (!mdWait) {
      mdWait = new Promise(function (done) {
        var s = document.createElement('script');
        s.src = '/markdown.js';
        s.onload = function () { done(!!window.loveMarkdown); };
        s.onerror = function () { done(false); };
        document.head.appendChild(s);
      });
    }
    return mdWait;
  }

  // Which notice this browser put away, if any.
  function putAway() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function keep(id) { try { localStorage.setItem(KEY, id); } catch (e) { /* a private window keeps nothing */ } }
  function forget() { try { localStorage.removeItem(KEY); } catch (e) { /* nothing to clear */ } }

  function dial() { return document.documentElement.getAttribute('data-intensity') || 'regular'; }
  function looking() { return document.visibilityState !== 'hidden'; }
  function media(q) { try { return window.matchMedia(q).matches; } catch (e) { return false; } }
  function cbState() {
    try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return v && v.pass ? v : null; }
    catch (e) { return null; }
  }
  function schemeNow() {
    var r = document.querySelector('.cb-host'), lc = window.loveCall;
    if (r && r.getAttribute('data-scheme')) return r.getAttribute('data-scheme');
    if (lc && lc.schemeFor) { var s = cbState(); return lc.schemeFor((s && s.scheme) || 'auto'); }
    return media('(prefers-contrast: more)') ? 'high' : media('(prefers-color-scheme: light)') ? 'day' : 'amber';
  }

  /* ── The drawings ─────────────────────────────────────────────────────── */

  // A herald's horn with its pennant, already tilted up, the left one pointing left.
  var HORN = {
    l: { body: 'M43.1 21.2 L40.0 20.1 L38.9 20.9 L19.2 13.7 C13.5 11.6 9.7 7.6 7.7 1.5 C4.2 6.6 2.1 12.3 1.5 18.4 C7.0 15.1 12.5 14.4 18.2 16.5 L37.9 23.7 L38.3 25.0 L41.3 26.1 Z',
      flag: 'M34.1 22.3 L21.9 17.9 L19.0 25.9 L26.1 25.3 L31.2 30.3 Z', rim: 'M7.7 1.5 C4.2 6.6 2.1 12.3 1.5 18.4' },
    r: { body: 'M1.5 21.2 L4.5 20.1 L5.6 20.9 L25.4 13.7 C31.0 11.6 34.9 7.6 36.9 1.5 C40.4 6.6 42.4 12.3 43.1 18.4 C37.6 15.1 32.0 14.4 26.4 16.5 L6.7 23.7 L6.3 25.0 L3.3 26.1 Z',
      flag: 'M10.4 22.3 L22.6 17.9 L25.5 25.9 L18.4 25.3 L13.3 30.3 Z', rim: 'M36.9 1.5 C40.4 6.6 42.4 12.3 43.1 18.4' },
  };
  function horn(side) {
    var h = HORN[side], s = draw('svg', { 'class': 'nt-horn nt-horn--' + side, viewBox: '0 0 44.6 31.8', focusable: 'false' });
    s.appendChild(draw('path', { 'class': 'nt-horn__flag', d: h.flag }));
    s.appendChild(draw('path', { 'class': 'nt-horn__body', d: h.body }));
    s.appendChild(draw('path', { 'class': 'nt-horn__rim', d: h.rim }));
    return s;
  }
  function note() {
    var s = draw('svg', { viewBox: '0 0 11 14', focusable: 'false' });
    s.appendChild(draw('ellipse', { cx: '3.6', cy: '11', rx: '3.4', ry: '2.4' }));
    s.appendChild(draw('rect', { x: '5.8', y: '1', width: '1.4', height: '10.2' }));
    s.appendChild(draw('path', { d: 'M7.2 1 C7.2 4 11 4.6 10 8.4 C9.6 6.4 8.6 5.6 7.2 5.4 Z' }));
    return s;
  }
  // The stars, half along the top rim and half along the bottom, each on its own clock.
  function sky() {
    var box = el('span', 'nt-sky');
    for (var i = 0; i < STARS; i++) {
      var s = el('span', 'nt-star' + (i % 3 === 1 ? ' nt-star--steel' : ''));
      s.style.left = (1 + (i + Math.random() * 0.7) * (96 / STARS)).toFixed(1) + '%';
      if (i % 2) s.style.bottom = '1px'; else s.style.top = '1px';
      s.style.setProperty('--tw', (2.8 + Math.random() * 2.2).toFixed(2) + 's');
      s.style.setProperty('--td', (-Math.random() * 5).toFixed(2) + 's');
      box.appendChild(s);
    }
    return box;
  }

  /* ── The fanfare ──────────────────────────────────────────────────────── */

  function fanfare(b) {
    if (dial() !== 'max' || b.playing || b.away || !b.box.isConnected) return;
    if (!looking()) { b.owed = true; return; }
    b.owed = false;
    b.playing = true;
    b.fan.textContent = '';
    b.box.classList.add('nt--fanfare');
    // Out of each bell: four notes rising and drifting outward, and a few sparks.
    // The left bell is at the herald's top left corner and the right one at its top right.
    ['left', 'right'].forEach(function (side) {
      var out = side === 'left' ? -1 : 1;
      for (var i = 0; i < 4; i++) {
        var n = el('span', 'nt-note');
        n.style[side] = (i % 2 ? 4 : 0) + 'px';
        n.style.top = '0';
        n.style.setProperty('--fx', (out < 0 ? -(3 + i * 4) : i * 2) + 'px');
        n.style.setProperty('--fd', (i * 0.25 + (out > 0 ? 0.12 : 0)).toFixed(2) + 's');
        n.appendChild(note());
        b.fan.appendChild(n);
      }
      for (var k = 0; k < 4; k++) {
        var p = el('span', 'nt-spark');
        p.style[side] = '4px';
        p.style.top = '6px';
        p.style.setProperty('--fx', (out < 0 ? -(4 + Math.random() * 14) : Math.random() * 6).toFixed(1) + 'px');
        p.style.setProperty('--fy', (-8 - Math.random() * 14).toFixed(1) + 'px');
        p.style.setProperty('--fd', (Math.random() * 0.5).toFixed(2) + 's');
        b.fan.appendChild(p);
      }
    });
    // The wave along both rims, from the horns' end to the far one, in the
    // stars' own box, so it keeps to the rims as they do.
    var wave = [];
    for (var w = 0; w < 2 * WAVE; w++) {
      var x = (w % WAVE) / (WAVE - 1), sp = el('span', 'nt-spark nt-spark--wave');
      sp.style.left = (1 + x * 97).toFixed(1) + '%';
      if (w < WAVE) { sp.style.top = '1px'; sp.style.setProperty('--fy', '-3px'); }
      else { sp.style.bottom = '1px'; sp.style.setProperty('--fy', '3px'); }
      sp.style.setProperty('--fd', (0.2 + x * 0.7).toFixed(2) + 's');
      b.sky.appendChild(sp);
      wave.push(sp);
    }
    setTimeout(function () {
      wave.forEach(function (sp) { sp.remove(); });
      b.fan.textContent = '';
      b.box.classList.remove('nt--fanfare');
      b.playing = false;
    }, 2900);
  }

  /* ── The banner ───────────────────────────────────────────────────────── */

  // Draws a notice ({ id, text, ast }) into slot, replacing what was there. Answers false if
  // it could not. A preview, the desk's, remembers nothing when it is put away.
  function put(slot, notice, preview) {
    slot.textContent = '';
    if (!notice || !window.loveMarkdown) { slot.hidden = true; return false; }
    var host = el('div', 'nt-mount');
    var root = host.attachShadow({ mode: 'open' });
    var own = slot.getRootNode() === document;
    if (own) host.setAttribute('data-scheme', schemeNow());
    host.setAttribute('data-dial', dial());
    var waiting = 2;
    host.style.visibility = 'hidden';
    ['/cb.css', '/notice.css'].forEach(function (href) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      function ready() { if (--waiting === 0) { host.style.visibility = ''; fanfare(b); } }
      l.addEventListener('load', ready);
      l.addEventListener('error', ready);
      root.appendChild(l);
    });
    var box = el('section', 'nt');
    box.setAttribute('aria-label', 'Notice');
    var herald = el('div', 'nt-herald');
    herald.setAttribute('aria-hidden', 'true');
    herald.appendChild(horn('l'));
    herald.appendChild(el('span', 'nt-tag', 'Notice'));
    herald.appendChild(horn('r'));
    var fan = el('span', 'nt-fan');
    herald.appendChild(fan);
    box.appendChild(herald);
    var words = el('div', 'nt-words');
    window.loveMarkdown.blocks(notice.ast, words, { prefix: 'nt' });
    box.appendChild(words);
    var away = null;
    if (typeof notice.id === 'string' && notice.id) {
      away = el('button', 'cb-btn nt-away', 'Put it away');
      away.type = 'button';
      box.appendChild(away);
    }
    var stars = sky();
    stars.setAttribute('aria-hidden', 'true');
    box.appendChild(stars);
    root.appendChild(box);
    // Where putting it away is said, there from the start so a screen reader hears the change.
    var said = el('p', 'sr');
    said.setAttribute('role', 'status');
    root.appendChild(said);
    slot.appendChild(host);
    slot.hidden = false;
    var b = { host: host, box: box, fan: fan, sky: stars, own: own, playing: false, owed: false, away: false };
    if (away) away.addEventListener('click', function () {
      b.away = true;
      if (!preview) keep(notice.id);
      box.hidden = true;
      said.textContent = preview ? 'Put away here only. This is a preview, and nothing is remembered.'
        : 'The notice is put away. It comes back when a new one goes up.';
      // The room it stood in closes at once; the slot goes once that has been said.
      slot.style.margin = '0';
      slot.style.padding = '0';
      setTimeout(function () {
        slot.hidden = true;
        slot.textContent = '';
        slot.style.margin = '';
        slot.style.padding = '';
      }, 5000);
    });
    banners = banners.filter(function (x) { return x.box.isConnected; });
    banners.push(b);
    return true;
  }

  // The notice up now, into slot, asked for once a page.
  function into(slot) {
    if (!slot) return;
    slot.hidden = true;
    ask().then(function (notice) {
      var was = putAway();
      if (was && (!notice || notice.id !== was)) forget();
      if (!notice || (was && notice.id === was)) return;
      return markdown().then(function () { put(slot, notice, false); });
    });
  }

  /* Following the dial, the radio's scheme and the device, for every banner
     on the page. Turning the dial up to MAX plays the fanfare. */
  function redial() {
    var level = dial();
    banners.forEach(function (b) {
      var was = b.host.getAttribute('data-dial');
      b.host.setAttribute('data-dial', level);
      if (level === 'max' && was !== 'max') fanfare(b);
    });
  }
  function redress() {
    banners.forEach(function (b) { if (b.own) b.host.setAttribute('data-scheme', schemeNow()); });
  }
  try {
    new MutationObserver(redial).observe(document.documentElement, { attributes: true, attributeFilter: ['data-intensity'] });
    var watched = null, onRadio = new MutationObserver(redress);
    new MutationObserver(function () {
      var r = document.querySelector('.cb-host');
      if (r && r !== watched) { watched = r; onRadio.observe(r, { attributes: true, attributeFilter: ['data-scheme'] }); redress(); }
    }).observe(document.body, { childList: true });
  } catch (e) { /* the notice keeps what it opened with */ }
  ['(prefers-contrast: more)', '(prefers-color-scheme: light)'].forEach(function (q) {
    try { window.matchMedia(q).addEventListener('change', redress); } catch (e) { /* an old browser */ }
  });
  document.addEventListener('visibilitychange', function () {
    if (looking()) banners.forEach(function (b) { if (b.owed) fanfare(b); });
  });

  window.loveNotice = { into: into, draw: function (slot, notice) { return markdown().then(function () { return put(slot, notice, true); }); } };

  Array.prototype.forEach.call(document.querySelectorAll('[data-notice]'), into);
}());
