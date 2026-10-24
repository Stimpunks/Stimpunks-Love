/* =============================================================================
   Familiars: chimeras out of Chimera Obscura that go where their people go on
   the street and find somewhere to sit in every room. A suggestion from our
   community, after the animal orbs in Castle Crashers that follow their
   player about; Ryan's calls, 2026-10-19. One file keeps yours, draws yours
   and everybody else's in the room, and moves them; chimera.js does the
   drawing, as it does everywhere else.

   YOURS FOLLOWS YOU BY BEING REMEMBERED. Every room is a page of its own, so
   nothing can carry it from one to the next: what it is made of, its name,
   its sayings, whether you let it move by itself, roughly where in the window
   you last put it down, and where in the window it was when you left the last
   page (fractions of the window, never which room, so it is not a record of
   where you have been) are kept in your own browser under love-familiar, and
   every page draws it again when you arrive. This is the only file that
   writes that key. Taking one is a press, in Chimera Obscura
   (chimera-obscura.js calls take()) or in Profile on the radio; Send it home
   forgets it. THIS FILE SENDS NOTHING ANYWHERE and counts nothing, and
   tools/make-chimera-obscura.py refuses it a request, any other storage, a
   sound, a canvas, or markup written from a string.

   EVERYBODY ELSE'S COMES FROM THE RADIO. Bringing yours into the rooms you are
   seen in is Bring my familiar on the radio, which sends it (cb.js, to
   /cb/familiar); the familiars of the people seen in your room come back on
   the radio's Be seen here answer, and cb.js hands them to visitors() here. So
   you see other people's only while you are seen in the room yourself, the
   one switch both ways. Pressing one says whose it is, what it is made of and
   one of its sayings, and nothing about you goes anywhere.

   THEY REST ONLY WHERE THERE ARE NO WORDS. A familiar sits in the page, in
   the room, where no text, no control, no picture with a meaning, no player
   and no other floating thing (another familiar included) is under it, and a
   room can mark anything else with data-familiar-avoid (the arcade's screens,
   Chimera Obscura's table). It crosses words only while it is moving (Ryan's
   call, 2026-10-19: the profile effect's pass, out on the street). When the
   page changes under it, it moves off the words. If nowhere in the window is
   clear it goes to the nearest clear place on the page, and only if there is
   none at all does it rest where it covers least.

   CHIMERA COZIES ARE THEIR OWN SPOTS (Ryan, 2026-10-19). A room can lay out
   a cozy, an element marked data-familiar-cozy, drawn in that room's own inks
   by tools/make-cozies.py, and a familiar that finds a free one in the window
   sits in it rather than anywhere else, one familiar to a cozy.

   NOTHING MOVES BY ITSELF BELOW MAX GLITTER, roam.js's rule. At MAX, or
   after Let it move by itself (the candles' rule, the radio's Let my theme
   move), a familiar wanders now and then, between cozies where there are
   some; yours comes along when you scroll and comes over to where your
   pointer settles or your keyboard has gone; and yours WALKS IN THROUGH THE
   DOOR, from where it was in the window when you left the last room to its
   spot in this one, as other people's walk in from the edge of the window
   when they arrive and out to it when they go. At Gentle and Regular they stay
   where they are put. A move glides at Regular and MAX and is a jump at
   Gentle; they move with left and top, never a transform, so check-gentle.py
   can see everything that moves. SPEECH BUBBLES are the same: one of a
   familiar's sayings, now and then, only while it may move by itself and never
   at Gentle, only where the bubble covers no words, gone after a few seconds,
   and aria-hidden, because pressing the familiar says the same thing on
   purpose. Moving yours yourself is always yours: drag it, or press it and
   choose Move it, which the arrow keys then do.

   IT KEEPS YOU COMPANY AND THAT IS ALL IT DOES. No stats, no boost, no
   levelling up as you visit rooms (a level is a tally of where you have
   been), no collection to finish and no count. It makes no sound and it
   does not react to the CB's messages, because a familiar that perked up when
   a message landed would be the receive lamp the radio refuses.

   It wears its own clothes, Chimera Obscura's: the table's white light
   round the drawing, and the room's black, brass and words on its menu,
   every pair already measured for that room. Each familiar lives in a shadow
   root, like the radio, so no room's stylesheet reaches it, and it lays no
   look over any room. Not in a frame, not in the radio's or the call's window,
   and not on a page whose <body> says data-cb="off" (Stay Frosty, where
   nothing moves, and the Healing Checkpoint, which writes nothing down);
   love.js asks the same before it loads this file. It does not print.
   ============================================================================= */
(function () {
  'use strict';
  if (window.loveFamiliar) return;

  var KEY = 'love-familiar';
  var GAP = 6;       // room kept between a familiar and anything it rests beside
  var EDGE = 10;     // and between it and the window's edge
  var SAYINGS = 5, SAYING_MAX = 80, NAME_MAX = 24;
  var AVOID = 'a[href],button,input,select,textarea,summary,label,iframe,video,audio,img,canvas,' +
    'picture,object,embed,[role="button"],[role="img"],[role="slider"],[role="application"],' +
    '[tabindex]:not([tabindex="-1"]),[contenteditable],.facade,[data-familiar-avoid]';

  var C = null;            // chimera.js
  var mine = null;         // your own familiar, or null
  var visiting = {};       // the familiars of the people seen here, by handle
  var seated = [];         // [cozy element, the familiar sitting in it]
  var listening = false;

  function intensity() { return document.documentElement.getAttribute('data-intensity') || 'regular'; }
  // Moving by itself: at MAX GLITTER, or once somebody has said theirs may.
  // A low-stimulation mode is still: nothing walks about while one is on.
  function mayMove() { return !document.documentElement.hasAttribute('data-low') && (intensity() === 'max' || !!(mine && mine.state.moves)); }
  // A walk glides, and a bubble shows, only where a move may glide at all.
  function mayGlide() { return mayMove() && intensity() !== 'gentle'; }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function btnEl(cls, text) { var b = el('button', cls, text); b.type = 'button'; return b; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function quoted(t) { return '“' + t + '”'; }

  /* ── What is kept ────────────────────────────────────────────────────── */
  function cleanName(s) { return typeof s === 'string' ? s.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX) : ''; }
  function cleanSayings(list) {
    var out = [];
    (Array.isArray(list) ? list : []).forEach(function (x) {
      var t = typeof x === 'string' ? x.replace(/\s+/g, ' ').trim() : '';
      if (t && t.length <= SAYING_MAX && out.indexOf(t) < 0 && out.length < SAYINGS) out.push(t);
    });
    return out;
  }
  function cleanAt(a, dflt) {
    if (!Array.isArray(a) || a.length !== 2) return dflt;
    var ok = a.every(function (v) { return typeof v === 'number' && isFinite(v); });
    return ok ? a.map(function (v) { return clamp(Math.round(v * 100) / 100, 0, 1); }) : dflt;
  }
  function read() {
    var v = null;
    try { v = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
    if (!v || typeof v !== 'object' || Array.isArray(v) || !v.parts) return null;
    return {
      parts: v.parts, name: cleanName(v.name), sayings: cleanSayings(v.sayings), moves: v.moves === true,
      kept: typeof v.kept === 'string' && /^h[A-Za-z0-9_-]{10}$/.test(v.kept) ? v.kept : '',
      at: cleanAt(v.at, [0.9, 0.85]), was: cleanAt(v.was, null)
    };
  }
  function write(st) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ parts: st.parts, name: st.name, sayings: st.sayings, moves: !!st.moves,
        kept: st.kept || '', at: st.at, was: st.was || null }));
      return true;
    } catch (e) { return false; }
  }
  function forget() { try { localStorage.removeItem(KEY); } catch (e) {} }
  function told() {
    try { window.dispatchEvent(new CustomEvent('love-familiar')); } catch (e) {}
  }

  function allowed() {
    var b = document.body;
    if (!b) return false;
    try { if (window.top !== window.self) return false; } catch (e) { return false; }
    return b.getAttribute('data-cb') !== 'off' && !b.hasAttribute('data-cb-window');
  }

  /* chimera.js, if this page has not got it. The radio loads it the same
     way, and the data-cb-chimera mark keeps the two from loading it twice. */
  function withChimera(then) {
    if (window.loveChimera) { C = window.loveChimera; then(); return; }
    var s = document.querySelector('script[data-cb-chimera]');
    if (!s) {
      s = document.createElement('script');
      s.src = '/chimera.js';
      s.setAttribute('data-cb-chimera', '');
      document.head.appendChild(s);
    }
    s.addEventListener('load', function () { if (window.loveChimera) { C = window.loveChimera; then(); } });
  }

  /* ── Where things are ────────────────────────────────────────────────── */
  function size() {
    var de = document.documentElement;
    return Math.min(de.clientWidth, de.clientHeight) < 560 ? 68 : 88;
  }
  function view() {
    var de = document.documentElement;
    return { w: de.clientWidth, h: de.clientHeight, x: window.scrollX, y: window.scrollY };
  }
  // Where one can be on the page at all: never past the page's own width, so
  // it never gives a phone a sideways scroll, and never below its foot.
  function bounds(inView) {
    var v = view(), S = size(), de = document.documentElement, b = document.body;
    var maxX = Math.max(EDGE, v.w - S - EDGE);
    var maxY = Math.max(EDGE, Math.max(de.scrollHeight, b.scrollHeight) - S - EDGE);
    if (!inView) return { l: EDGE, t: EDGE, r: maxX, b: maxY };
    return { l: v.x + EDGE, t: v.y + EDGE, r: Math.min(maxX, v.x + v.w - S - EDGE), b: Math.min(maxY, v.y + v.h - S - EDGE) };
  }
  function meets(a, b) { return a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b; }
  function onPage(r, pad) {
    return { l: r.left + window.scrollX - pad, t: r.top + window.scrollY - pad, r: r.right + window.scrollX + pad, b: r.bottom + window.scrollY + pad };
  }

  // Everything a familiar must not rest on inside area, in the page's
  // coordinates: every line of text, every control, picture with a meaning
  // and player, and every other floating thing (the radio, the guest bar, the
  // fractal window, every other familiar) and anything else with a shadow
  // root, whose words cannot be read from here. It walks down the page from
  // the body and leaves any part whose box is nowhere near the area, so a
  // check beside it on the changelog looks at a handful of paragraphs rather
  // than every line of a very long page. self is the familiar asking.
  function busy(area, self) {
    var out = [], range = document.createRange();
    function text(n) {
      if (!/\S/.test(n.nodeValue)) return;
      range.selectNodeContents(n);
      var rs = range.getClientRects();
      for (var i = 0; i < rs.length; i++) {
        if (!rs[i].width || !rs[i].height) continue;
        var d = onPage(rs[i], GAP);
        if (meets(d, area)) out.push(d);
      }
    }
    function visit(e) {
      if (e === self || /^(?:SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(e.tagName)) return;
      var r = e.getBoundingClientRect(), sized = r.width || r.height;
      if (sized && !meets(onPage(r, GAP), area)) return;
      if (e.shadowRoot) {
        if (sized) out.push(onPage(r, GAP));
        // The radio's host has no size of its own; its box is inside it.
        else for (var k = e.shadowRoot.firstElementChild; k; k = k.nextElementSibling) {
          var kr = k.getBoundingClientRect();
          if ((kr.width || kr.height) && meets(onPage(kr, GAP), area)) out.push(onPage(kr, GAP));
        }
        return;
      }
      if (sized && e.matches(AVOID)) { out.push(onPage(r, GAP)); return; }
      for (var c = e.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 1) visit(c);
        else if (c.nodeType === 3) text(c);
      }
    }
    for (var c = document.body.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 1) visit(c);
      else if (c.nodeType === 3) text(c);
    }
    return out;
  }
  // The busy places filed into a grid, so testing a spot only looks near it.
  function file(list) {
    var cell = 128, grid = {};
    list.forEach(function (r) {
      for (var cx = Math.floor(r.l / cell); cx <= Math.floor(r.r / cell); cx++) {
        for (var cy = Math.floor(r.t / cell); cy <= Math.floor(r.b / cell); cy++) {
          (grid[cx + ',' + cy] = grid[cx + ',' + cy] || []).push(r);
        }
      }
    });
    return { cell: cell, grid: grid };
  }
  function cover(me, f, stopAtAny) {
    var seen = [], sum = 0;
    for (var cx = Math.floor(me.l / f.cell); cx <= Math.floor(me.r / f.cell); cx++) {
      for (var cy = Math.floor(me.t / f.cell); cy <= Math.floor(me.b / f.cell); cy++) {
        var rs = f.grid[cx + ',' + cy];
        if (!rs) continue;
        for (var i = 0; i < rs.length; i++) {
          var r = rs[i];
          if (seen.indexOf(r) >= 0 || !meets(me, r)) continue;
          if (stopAtAny) return 1;
          seen.push(r);
          sum += (Math.min(me.r, r.r) - Math.max(me.l, r.l)) * (Math.min(me.b, r.b) - Math.max(me.t, r.t));
        }
      }
    }
    return sum;
  }
  function boxAt(x, y, S) { return { l: x, t: y, r: x + S, b: y + S }; }
  function clearBox(box, self) { return !busy(box, self).some(function (r) { return meets(box, r); }); }
  // The clear spot nearest a point: in the window, or anywhere on the page.
  function spotNear(tx, ty, inViewOnly, self) {
    var S = size(), B = bounds(inViewOnly);
    if (B.r < B.l || B.b < B.t) return null;
    var f = file(busy({ l: B.l, t: B.t, r: B.r + S, b: B.b + S }, self));
    var step = inViewOnly ? 20 : 40, pts = [[clamp(tx, B.l, B.r), clamp(ty, B.t, B.b)]];
    for (var x = B.l; x <= B.r; x += step) for (var y = B.t; y <= B.b; y += step) pts.push([x, y]);
    pts.push([B.r, B.b], [B.l, B.b], [B.r, B.t]);
    pts.sort(function (a, b) {
      var da = (a[0] - tx) * (a[0] - tx) + (a[1] - ty) * (a[1] - ty), db = (b[0] - tx) * (b[0] - tx) + (b[1] - ty) * (b[1] - ty);
      return da - db;
    });
    var best = null, least = Infinity;
    for (var i = 0; i < pts.length; i++) {
      var me = boxAt(pts[i][0], pts[i][1], S);
      if (!cover(me, f, true)) return { x: pts[i][0], y: pts[i][1], clear: true };
      if (inViewOnly) {
        var c = cover(me, f, false);
        if (c < least) { least = c; best = { x: pts[i][0], y: pts[i][1], clear: false }; }
      }
    }
    return best;
  }
  // Somewhere off the words, near a point: in the window if it can, else the
  // nearest clear place on the page, else where it covers least.
  function findSpot(tx, ty, self) {
    var s = spotNear(tx, ty, true, self);
    if (s && s.clear) return s;
    var far = spotNear(tx, ty, false, self);
    return far && far.clear ? far : s;
  }

  /* ── Chimera Cozies ──────────────────────────────────────────────────── */
  function cozyOf(f) { for (var i = 0; i < seated.length; i++) if (seated[i][1] === f) return seated[i][0]; return null; }
  function whoIn(c) { for (var i = 0; i < seated.length; i++) if (seated[i][0] === c) return seated[i][1]; return null; }
  function sitIn(f, c) {
    seated = seated.filter(function (x) { return x[1] !== f && x[0] !== c; });
    if (c) seated.push([c, f]);
    // In a cozy its light draws in to just behind it, so the cozy shows.
    if (f && f.host) f.host.classList.toggle('is-seated', !!c);
  }
  // Where a familiar sits in a cozy: across its middle, sunk into it, or as
  // far down it as the cozy says (data-familiar-seat, a fraction of its
  // height), the egg chair's seat being lower than a cushion's top.
  function seat(c) {
    var r = c.getBoundingClientRect(), S = size(), v = view();
    if (!r.width || !r.height) return null;
    var f = parseFloat(c.getAttribute('data-familiar-seat'));
    if (!(f > 0 && f < 1)) f = 0.62;
    return { x: Math.round(r.left + v.x + r.width / 2 - S / 2), y: Math.round(r.top + v.y + r.height * f - S) };
  }
  // The free cozies in the window whose seat has no words over it, nearest a
  // point first.
  function freeCozies(self, tx, ty, anywhere) {
    var v = view(), S = size(), out = [];
    Array.prototype.forEach.call(document.querySelectorAll('[data-familiar-cozy]'), function (c) {
      var who = whoIn(c);
      if (who && who !== self) return;
      var s = seat(c);
      if (!s) return;
      // In the window, unless asked for anywhere in the room (Sit in the cozy).
      if (!anywhere && (s.x < v.x || s.x + S > v.x + v.w || s.y < v.y || s.y + S > v.y + v.h)) return;
      if (!clearBox(boxAt(s.x, s.y, S), self.host)) return;
      out.push({ x: s.x, y: s.y, cozy: c });
    });
    if (tx != null) out.sort(function (a, b) { return Math.hypot(a.x - tx, a.y - ty) - Math.hypot(b.x - tx, b.y - ty); });
    return out;
  }
  // Where a familiar goes near a point: a free cozy in the window first, else
  // the nearest place with no words.
  function homeNear(self, tx, ty) {
    var cz = freeCozies(self, tx, ty);
    if (cz.length) return cz[0];
    var s = findSpot(tx, ty, self.host);
    return s ? { x: s.x, y: s.y, cozy: null, clear: s.clear } : null;
  }

  /* ── A familiar ──────────────────────────────────────────────────────── */
  function Familiar(st, own, whose) {
    this.state = st;
    this.own = own;
    this.whose = whose || '';
    this.pos = null;
    this.origin = { x: 0, y: 0 };
    this.walking = false;
    this.walkT = 0;
    this.menuOpen = false;
    this.timers = {};
    this.build();
  }
  var F = Familiar.prototype;

  F.later = function (name, fn, ms) { clearTimeout(this.timers[name]); this.timers[name] = setTimeout(fn, ms); };

  F.build = function () {
    var me = this;
    var host = this.host = document.createElement('love-familiar');
    host.style.cssText = 'display:block;position:absolute;left:0;top:0;z-index:60;margin:0;padding:0;border:0;visibility:hidden;';
    var S = size();
    host.style.width = S + 'px';
    host.style.height = S + 'px';
    var root = host.attachShadow({ mode: 'open' });
    var sheet = el('link');
    sheet.rel = 'stylesheet';
    sheet.href = '/familiar.css';
    // Shown once its stylesheet has arrived and it has a place, so it never
    // appears for a moment as a bare button, or in the corner.
    function ready() { me.styled = true; me.reveal(); }
    sheet.addEventListener('load', ready);
    sheet.addEventListener('error', ready);
    root.appendChild(sheet);

    this.btn = btnEl('fam');
    this.btn.setAttribute('aria-expanded', 'false');
    this.art = el('span', 'fam__art');
    this.art.setAttribute('aria-hidden', 'true');
    this.btn.appendChild(this.art);
    root.appendChild(this.btn);
    this.bubbleEl = el('p', 'fam__bubble');
    this.bubbleEl.setAttribute('aria-hidden', 'true');
    this.bubbleEl.hidden = true;
    root.appendChild(this.bubbleEl);
    this.sr = el('span', 'fam__sr');
    this.sr.setAttribute('role', 'status');
    root.appendChild(this.sr);

    var menu = this.menu = el('div', 'fam__menu');
    menu.hidden = true;
    menu.setAttribute('role', 'group');
    menu.setAttribute('aria-label', this.own ? 'Your familiar' : 'A familiar');
    this.nameP = el('p', 'fam__name');
    this.whoseP = el('p', 'fam__whose');
    this.wordsP = el('p', 'fam__words');
    this.saysP = el('p', 'fam__says');
    menu.appendChild(this.nameP);
    if (!this.own) menu.appendChild(this.whoseP);
    menu.appendChild(this.wordsP);
    menu.appendChild(this.saysP);
    var closeB = btnEl('fam__btn fam__btn--quiet', 'Close');
    if (this.own) this.buildOwn(menu, closeB);
    else {
      var row = el('div', 'fam__row');
      row.appendChild(closeB);
      menu.appendChild(row);
    }
    this.line = el('p', 'fam__line');
    this.line.setAttribute('role', 'status');
    menu.appendChild(this.line);
    root.appendChild(menu);

    closeB.addEventListener('click', function () { me.closeMenu(true); });
    menu.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); me.closeMenu(true); } });
    this.btn.addEventListener('click', function () {
      if (me.hush) { me.hush = false; return; }
      if (me.moving) return;
      if (me.menuOpen) me.closeMenu(false); else me.openMenu();
    });
    if (this.own) {
      this.btn.addEventListener('pointerdown', function (e) { me.grab(e); });
      this.btn.addEventListener('pointermove', function (e) { me.drag(e); });
      this.btn.addEventListener('pointerup', function (e) { me.drop(e); });
      this.btn.addEventListener('pointercancel', function (e) { me.drop(e); });
      this.btn.addEventListener('blur', function () { if (me.moving) me.putDown(false); });
    }
    this.btn.addEventListener('keydown', function (e) { me.keys(e); });
  };

  F.buildOwn = function (menu, closeB) {
    var me = this;
    menu.appendChild(el('p', 'fam__note', 'It goes where you go on the street and sits wherever there are no words. In a room with a free cozy, Sit in the cozy puts it there. It keeps you company, and that is all it does.'));
    var row = el('div', 'fam__row');
    var moveB = btnEl('fam__btn', 'Move it');
    this.cozyB = btnEl('fam__btn', 'Sit in the cozy');
    this.cozyB.hidden = true;
    this.letB = btnEl('fam__btn fam__btn--quiet');
    row.appendChild(moveB);
    row.appendChild(this.cozyB);
    row.appendChild(this.letB);
    menu.appendChild(row);
    this.letNote = el('p', 'fam__note', 'At MAX GLITTER it moves by itself whatever this says, and says things now and then. Below MAX it stays where you put it unless this is on.');
    menu.appendChild(this.letNote);
    var row2 = el('div', 'fam__row');
    this.tableA = el('a', 'fam__link', 'Put it on the table in Chimera Obscura');
    row2.appendChild(this.tableA);
    menu.appendChild(row2);
    var row3 = el('div', 'fam__row');
    this.homeB = btnEl('fam__btn fam__btn--quiet', 'Send it home');
    row3.appendChild(this.homeB);
    row3.appendChild(closeB);
    menu.appendChild(row3);
    var sure = this.sure = el('div', 'fam__sure');
    sure.hidden = true;
    sure.appendChild(el('p', 'fam__note', 'It stops following you, your browser forgets it, and if you brought it out on the radio it goes back in. It is still yours to make again in Chimera Obscura, and in your Profile if you kept it there.'));
    var yes = btnEl('fam__btn', 'Yes, send it home');
    var no = btnEl('fam__btn fam__btn--quiet', 'Keep it with me');
    var row4 = el('div', 'fam__row');
    row4.appendChild(yes);
    row4.appendChild(no);
    sure.appendChild(row4);
    menu.appendChild(sure);

    moveB.addEventListener('click', function () { me.startMoving(); });
    // Your press, so it goes at any setting: a glide where a move may glide,
    // a jump at Gentle and wherever it may not move by itself.
    /* SIT IN THE COZY, in any room with a free one (Ryan, 2026-10-19: he
       could not find it while it showed only for a cozy already in the
       window). The nearest free cozy in the room: a walk if it is in the
       window and a move may glide, else a jump, and a cozy out of the window
       is brought into it, because you asked to see it sit there. */
    this.cozyB.addEventListener('click', function () {
      var cz = freeCozies(me, me.pos.x, me.pos.y, true);
      me.closeMenu(false);
      if (!cz.length) {
        try { me.btn.focus({ preventScroll: true }); } catch (e) { me.btn.focus(); }
        me.tell('No cozy in this room is free just now.');
        return;
      }
      var h = cz[0], v = view(), S = size();
      var inView = h.y >= v.y && h.y + S <= v.y + v.h;
      sitIn(me, h.cozy);
      if (inView && intensity() !== 'gentle') me.walkTo(h.x, h.y, function () { me.remember(); });
      else {
        me.jump(h.x, h.y);
        if (!inView) { try { h.cozy.scrollIntoView({ block: 'center' }); } catch (e) { h.cozy.scrollIntoView(); } }
        me.remember();
      }
      // The keyboard goes back to it once it has moved, without scrolling
      // the page back to where it was.
      try { me.btn.focus({ preventScroll: true }); } catch (e) { me.btn.focus(); }
      me.tell('It sits in the cozy.');
    });
    this.letB.addEventListener('click', function () {
      me.state.moves = !me.state.moves;
      write(me.state);
      me.draw();
      me.line.textContent = me.state.moves
        ? 'It moves by itself now, at every setting: it wanders now and then, says things now and then, and comes along when you go somewhere.'
        : (intensity() === 'max' ? 'At MAX GLITTER it still moves by itself. Below MAX it stays where you put it.' : 'It stays where you put it now.');
    });
    this.homeB.addEventListener('click', function () { sure.hidden = false; me.homeB.hidden = true; no.focus(); });
    no.addEventListener('click', function () { sure.hidden = true; me.homeB.hidden = false; me.homeB.focus(); });
    yes.addEventListener('click', function () { sendHome(); });
  };

  // What it is, drawn and said: the drawing is silent and the words say it.
  F.draw = function () {
    var st = this.state;
    this.art.textContent = '';
    var svg = C.draw(st.parts, { prefix: 'fam' + (this.own ? '' : 'v'), cls: 'fam__svg' });
    if (svg) this.art.appendChild(svg);
    this.btn.setAttribute('aria-label', this.own ? 'Your familiar, ' + st.name : st.name + ', ' + this.whose + '’s familiar');
    this.nameP.textContent = st.name;
    this.whoseP.textContent = this.whose + '’s familiar';
    this.wordsP.textContent = C.words(st.parts);
    if (this.own) {
      this.tableA.href = '/chimera-obscura.html#chimera=' + C.code(st.parts);
      this.letB.textContent = 'Let it move by itself: ' + (st.moves ? 'on' : 'off');
      this.letB.setAttribute('aria-pressed', st.moves ? 'true' : 'false');
      this.letNote.hidden = intensity() !== 'max';
    }
  };

  F.place = function () { this.host.style.left = (this.pos.x - this.origin.x) + 'px'; this.host.style.top = (this.pos.y - this.origin.y) + 'px'; };
  F.put = function (x, y) { this.pos = { x: Math.round(x), y: Math.round(y) }; this.place(); };
  // Where left: 0 lands depends on the page, so it is measured, not assumed:
  // where it is on the page now less the left and top it has now, read and
  // never set, because SETTING them to 0 to measure, with a walk's
  // transition still on it, walked it in from the top corner of the page
  // every time this ran (Ryan saw it every few seconds, 2026-10-19). Only a
  // change in the origin moves it, and then with a jump.
  F.measureOrigin = function () {
    var h = this.host, r = h.getBoundingClientRect(), cs = getComputedStyle(h);
    var l = parseFloat(cs.left), t = parseFloat(cs.top);
    if (!isFinite(l) || !isFinite(t)) return;
    var o = { x: Math.round(r.left + window.scrollX - l), y: Math.round(r.top + window.scrollY - t) };
    if (o.x === this.origin.x && o.y === this.origin.y) return;
    this.origin = o;
    if (this.pos && !this.walking) { h.style.transition = 'none'; this.place(); }
  };
  F.stopWalking = function () {
    clearTimeout(this.walkT);
    this.walking = false;
    this.host.classList.remove('is-walking');
    this.host.style.pointerEvents = '';
  };
  F.jump = function (x, y) {
    this.stopWalking();
    this.host.style.transition = 'none';
    this.put(x, y);
  };
  // A walk: it may cross words now, and only now. At Gentle §3 takes the
  // transition away, so a walk there is a jump.
  F.walkTo = function (x, y, then) {
    var me = this;
    if (!this.pos || intensity() === 'gentle') { this.jump(x, y); if (then) then(); return; }
    var dx = x - this.pos.x, dy = y - this.pos.y, far = Math.sqrt(dx * dx + dy * dy);
    if (far < 2) { if (then) then(); return; }
    var ms = Math.round(clamp(far / 0.32, 450, 2800));
    this.host.classList.toggle('is-left', dx < 0);
    this.host.classList.add('is-walking');
    this.host.style.pointerEvents = 'none';
    this.walking = true;
    this.hideBubble();
    this.host.style.transition = 'left ' + ms + 'ms ease-in-out, top ' + ms + 'ms ease-in-out';
    this.put(x, y);
    clearTimeout(this.walkT);
    this.walkT = setTimeout(function () { me.stopWalking(); if (then) then(); }, ms + 60);
  };
  // Go to a place found by homeNear, gliding if it may.
  F.goTo = function (h, glide, then) {
    if (!h) return;
    sitIn(this, h.cozy || null);
    if (glide && mayGlide()) this.walkTo(h.x, h.y, then); else { this.jump(h.x, h.y); if (then) then(); }
  };
  F.inView = function () {
    if (!this.pos) return false;
    var v = view(), S = size();
    return this.pos.x + S > v.x && this.pos.x < v.x + v.w && this.pos.y + S > v.y && this.pos.y < v.y + v.h;
  };
  F.busyNow = function () { return this.walking || this.dragging || this.moving || this.menuOpen; };

  /* ── Its words ───────────────────────────────────────────────────────── */
  F.saying = function () { return this.state.sayings.length ? pick(this.state.sayings) : ''; };
  F.openMenu = function () {
    this.menuOpen = true;
    this.hideBubble();
    if (this.own) {
      this.sure.hidden = true;
      this.homeB.hidden = false;
      this.cozyB.hidden = !!cozyOf(this) || !freeCozies(this, null, null, true).length;
    }
    this.line.textContent = '';
    this.draw();
    var said = this.saying();
    this.saysP.textContent = said ? 'It says, ' + quoted(said)
      : (this.own ? 'It has nothing to say yet. Give it sayings beside its name, on the bench in Chimera Obscura or in Profile on the radio.' : '');
    this.saysP.hidden = !this.saysP.textContent;
    this.menu.hidden = false;
    this.btn.setAttribute('aria-expanded', 'true');
    this.placeMenu();
  };
  F.closeMenu = function (focus) {
    if (!this.menuOpen) return;
    this.menuOpen = false;
    this.menu.hidden = true;
    this.btn.setAttribute('aria-expanded', 'false');
    if (focus) this.btn.focus();
  };
  // Beside it where there is room, else under it, always inside the window,
  // so it never gives the page a sideways scroll.
  F.placeMenu = function () {
    var v = view(), S = size(), W = Math.min(300, v.w - 2 * EDGE), m = this.menu, p = this.pos;
    m.style.width = W + 'px';
    var left;
    if (p.x + S + 8 + W <= v.x + v.w - EDGE) left = S + 8;
    else if (p.x - 8 - W >= v.x + EDGE) left = -(W + 8);
    else left = null;
    var h = m.offsetHeight;
    if (left === null) {
      m.style.left = (clamp(p.x, v.x + EDGE, v.x + v.w - EDGE - W) - p.x) + 'px';
      m.style.top = (p.y + S + 8 + h <= v.y + v.h - EDGE ? S + 8 : -(h + 8)) + 'px';
    } else {
      m.style.left = left + 'px';
      m.style.top = (clamp(p.y, v.y + EDGE, Math.max(v.y + EDGE, v.y + v.h - EDGE - h)) - p.y) + 'px';
    }
  };
  F.tell = function (t) {
    var sr = this.sr;
    sr.textContent = '';
    setTimeout(function () { sr.textContent = t; }, 30);
  };

  /* A SPEECH BUBBLE: one of its sayings, now and then, only while it may move
     by itself, never at Gentle, and only where the bubble covers no words:
     above it if that is clear, else below, else not at all. aria-hidden,
     because pressing it says the same thing on purpose. */
  F.speak = function () {
    var me = this, said = this.saying();
    if (!said || !mayGlide() || this.busyNow() || !this.inView() || document.visibilityState !== 'visible') return;
    var b = this.bubbleEl, v = view(), S = size();
    b.textContent = said;
    b.style.left = '0px';
    b.style.top = '0px';
    b.style.visibility = 'hidden';
    b.hidden = false;
    var w = b.offsetWidth, h = b.offsetHeight;
    var x = clamp(this.pos.x + S / 2 - w / 2, v.x + EDGE, v.x + v.w - EDGE - w);
    var tries = [this.pos.y - h - 8, this.pos.y + S + 8];
    for (var i = 0; i < tries.length; i++) {
      var y = tries[i];
      if (y < v.y + EDGE || y + h > v.y + v.h - EDGE) continue;
      if (!clearBox({ l: x, t: y, r: x + w, b: y + h }, this.host)) continue;
      b.style.left = (x - this.pos.x) + 'px';
      b.style.top = (y - this.pos.y) + 'px';
      b.classList.toggle('fam__bubble--under', i === 1);
      b.style.visibility = '';
      this.later('unsay', function () { me.hideBubble(); }, 6500);
      return;
    }
    this.hideBubble();
  };
  F.hideBubble = function () { if (this.bubbleEl) { this.bubbleEl.hidden = true; clearTimeout(this.timers.unsay); } };

  /* ── Moving yours yourself ───────────────────────────────────────────── */
  F.grab = function (e) {
    if (e.button !== 0 || this.moving) return;
    this.stopWalking();
    this.down = { x: e.clientX, y: e.clientY, px: this.pos.x, py: this.pos.y, id: e.pointerId };
    // Held from the press, so a quick drag does not leave it behind.
    try { this.btn.setPointerCapture(e.pointerId); } catch (err) {}
  };
  F.drag = function (e) {
    var d = this.down;
    if (!d || e.pointerId !== d.id) return;
    var dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!this.dragging && dx * dx + dy * dy < 36) return;
    if (!this.dragging) {
      this.dragging = true;
      this.closeMenu(false);
      this.hideBubble();
      this.host.classList.add('is-held');
    }
    e.preventDefault();
    var B = bounds(false);
    this.jump(clamp(d.px + dx, B.l, B.r), clamp(d.py + dy, B.t, B.b));
  };
  F.drop = function (e) {
    var me = this;
    if (!this.down || (e && e.pointerId !== this.down.id)) return;
    this.down = null;
    if (!this.dragging) return;
    this.dragging = false;
    this.host.classList.remove('is-held');
    this.hush = true;
    setTimeout(function () { me.hush = false; }, 400);
    this.putDown(false);
  };
  F.startMoving = function () {
    this.closeMenu(false);
    this.moving = true;
    this.movingFrom = { x: this.pos.x, y: this.pos.y };
    this.host.classList.add('is-held');
    this.btn.focus();
    this.tell('Moving it. The arrow keys move it, and further with Shift. Enter puts it down, and Escape puts it back where it was.');
  };
  F.keys = function (e) {
    var me = this;
    if (!this.moving) {
      if (e.key === 'Escape' && this.menuOpen) { e.preventDefault(); this.closeMenu(true); }
      return;
    }
    var step = e.shiftKey ? 64 : 16, dx = 0, dy = 0;
    if (e.key === 'ArrowLeft') dx = -step;
    else if (e.key === 'ArrowRight') dx = step;
    else if (e.key === 'ArrowUp') dy = -step;
    else if (e.key === 'ArrowDown') dy = step;
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.hush = true;
      setTimeout(function () { me.hush = false; }, 400);
      this.putDown(true);
      return;
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.moving = false;
      this.host.classList.remove('is-held');
      this.jump(this.movingFrom.x, this.movingFrom.y);
      this.tell('Put back where it was.');
      return;
    } else return;
    e.preventDefault();
    var B = bounds(false);
    this.jump(clamp(this.pos.x + dx, B.l, B.r), clamp(this.pos.y + dy, B.t, B.b));
    try { this.host.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (err) {}
  };
  // Put down: into a free cozy if it was dropped by one, else off the words
  // if it was dropped on any, and remembered.
  F.putDown = function (say) {
    var was = this.moving, S = size();
    this.moving = false;
    this.host.classList.remove('is-held');
    var from = { x: this.pos.x, y: this.pos.y };
    var near = freeCozies(this, from.x, from.y).filter(function (c) { return Math.hypot(c.x - from.x, c.y - from.y) < S; })[0];
    var h = near || (function (me) { var s = findSpot(from.x, from.y, me.host); return s ? { x: s.x, y: s.y, cozy: null } : null; })(this);
    if (h) this.goTo(h, false);
    this.remember();
    if (say || was) {
      if (near) this.tell('Put down in the cozy.');
      else this.tell(Math.abs(this.pos.x - from.x) + Math.abs(this.pos.y - from.y) > 8 ? 'Put down nearby, where there are no words.' : 'Put down here.');
    }
  };
  /* Where in the window it was put down, kept so the next room starts it
     there. Only when you put it down: its own wandering is not a choice. */
  F.remember = function () {
    var v = view(), S = size();
    this.state.at = cleanAt([(this.pos.x - v.x) / Math.max(1, v.w - S), (this.pos.y - v.y) / Math.max(1, v.h - S)], [0.9, 0.85]);
    write(this.state);
  };
  F.fromKept = function (at) {
    var v = view(), S = size();
    return [v.x + at[0] * Math.max(0, v.w - S), v.y + at[1] * Math.max(0, v.h - S)];
  };

  /* ── Moving by itself, at MAX GLITTER or when let ────────────────────── */
  F.wander = function () {
    var me = this;
    if (!this.host.parentNode) return;
    this.later('wander', function () { me.wander(); }, 24000 + Math.random() * 26000);
    if (!mayMove() || document.visibilityState !== 'visible' || this.busyNow()) return;
    var v = view(), S = size(), h = null;
    var cz = freeCozies(this).filter(function (c) { return c.cozy !== cozyOf(me); });
    if (cz.length && Math.random() < 0.5) h = pick(cz);
    else {
      var s = spotNear(v.x + EDGE + Math.random() * Math.max(0, v.w - S - 2 * EDGE),
        v.y + EDGE + Math.random() * Math.max(0, v.h - S - 2 * EDGE), true, this.host);
      if (s && s.clear) h = { x: s.x, y: s.y, cozy: null };
    }
    if (h) this.goTo(h, true, function () { if (Math.random() < 0.5) me.speak(); });
  };
  F.chatter = function () {
    var me = this;
    if (!this.host.parentNode) return;
    this.later('chatter', function () { me.chatter(); }, 40000 + Math.random() * 50000);
    if (!this.walking) this.speak();
  };
  // When you scroll, at MAX or when let: one in the window and not in a cozy
  // goes to sit in a free cozy that has come into the window. Yours, left
  // behind, comes in from the edge it was left at; other people's stay in the
  // room.
  F.followScroll = function () {
    if (!mayMove() || this.busyNow() || document.visibilityState !== 'visible') return;
    if (this.inView()) { this.seekCozy(); return; }
    if (!this.own) return;
    var t = this.fromKept(this.state.at), h = homeNear(this, t[0], t[1]);
    if (!h || h.clear === false) return;
    this.enterFrom(this.pos.y < view().y ? 'top' : 'bottom', h);
  };
  // A free cozy in the window is its spot: at MAX, or when let, one that is
  // in the window and not in a cozy goes to sit in it. Asked after a scroll,
  // and whenever the page or the radio changes (a click, a resize), so a
  // cozy the radio stopped covering, or that a panel moved into the window,
  // is found as well as one that was scrolled to.
  F.seekCozy = function () {
    if (!mayMove() || this.busyNow() || cozyOf(this) || !this.inView() || document.visibilityState !== 'visible') return false;
    var cz = freeCozies(this, this.pos.x, this.pos.y);
    if (!cz.length) return false;
    this.goTo(cz[0], true);
    return true;
  };
  // Over to where you are: beside what has the keyboard, or where the
  // pointer has settled, unless it is near enough already.
  F.followTo = function (r) {
    if (!this.own || !mayMove() || this.busyNow() || document.visibilityState !== 'visible') return;
    var v = view(), S = size();
    var cx = (r.left + r.right) / 2 + v.x, cy = (r.top + r.bottom) / 2 + v.y;
    var mx = this.pos.x + S / 2, my = this.pos.y + S / 2;
    if (this.inView() && (mx - cx) * (mx - cx) + (my - cy) * (my - cy) < 280 * 280) return;
    var s = spotNear(r.right + v.x + 16, r.top + v.y, true, this.host);
    if (s && s.clear) this.goTo({ x: s.x, y: s.y, cozy: null }, true);
  };
  // Through the door: put just outside the window, or where it was, then walk.
  F.enterFrom = function (side, h, at) {
    var me = this, v = view(), S = size(), B = bounds(false), x = h.x, y = h.y;
    if (at) { x = v.x + at[0] * Math.max(0, v.w - S); y = v.y + at[1] * Math.max(0, v.h - S); }
    else if (side === 'top') y = v.y - S;
    else if (side === 'bottom') y = v.y + v.h;
    else if (side === 'left') x = v.x - S;
    else if (side === 'right') x = v.x + v.w;
    this.jump(clamp(x, -S, B.r + S), clamp(y, B.t, B.b + S));
    sitIn(this, h.cozy || null);
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (me.host.parentNode) me.walkTo(h.x, h.y); }); });
  };

  /* When the page changes under it (a panel opens, a picture arrives, the
     window is resized), it moves off any words now under it, or back into its
     cozy if the cozy moved. */
  F.recheck = function () {
    if (!this.host.parentNode || this.walking || this.dragging || this.moving) return;
    var S = size();
    if (this.host.style.width !== S + 'px') { this.host.style.width = S + 'px'; this.host.style.height = S + 'px'; }
    this.measureOrigin();
    var c = cozyOf(this);
    if (c) {
      var s = c.isConnected && seat(c);
      if (s && clearBox(boxAt(s.x, s.y, S), this.host)) {
        if (s.x !== this.pos.x || s.y !== this.pos.y) this.jump(s.x, s.y);
      } else { sitIn(this, null); c = null; }
    }
    if (!c && !clearBox(boxAt(this.pos.x, this.pos.y, S), this.host)) {
      this.goTo(homeNear(this, this.pos.x, this.pos.y), !this.menuOpen);
    } else if (!c) this.seekCozy();
    if (this.menuOpen) this.placeMenu();
  };

  F.arrive = function (near, door) {
    var me = this, done = false;
    document.body.appendChild(this.host);
    function go() { if (done || !me.host.parentNode) return; done = true; me.settleIn(near, door); }
    // A press (near) needs no waiting; a page that has just opened does,
    // until its faces are in, or a second and a half, whichever is first.
    if (near || !document.fonts || !document.fonts.ready) go();
    else { document.fonts.ready.then(go, go); setTimeout(go, 1500); }
  };
  F.reveal = function () { if (this.styled && this.placed) this.host.style.visibility = ''; };
  F.settleIn = function (near, door) {
    var me = this;
    this.placed = true;
    this.reveal();
    this.measureOrigin();
    this.draw();
    var t = this.own ? this.fromKept(this.state.at) : null;
    if (near && near.getBoundingClientRect) {
      var r = near.getBoundingClientRect(), v = view();
      t = [r.right + v.x + 12, r.top + v.y];
    }
    if (!t) { var v2 = view(); t = [v2.x + Math.random() * v2.w, v2.y + v2.h * (0.3 + Math.random() * 0.5)]; }
    var h = homeNear(this, t[0], t[1]);
    if (!h) h = { x: t[0], y: t[1], cozy: null };
    if (door && mayGlide()) {
      if (this.own && this.state.was) this.enterFrom(null, h, this.state.was);
      else this.enterFrom(h.x + size() / 2 < view().x + view().w / 2 ? 'left' : 'right', h);
    } else this.goTo(h, false);
    this.later('wander', function () { me.wander(); }, 20000 + Math.random() * 20000);
    this.later('chatter', function () { me.chatter(); }, 9000 + Math.random() * 20000);
  };

  // Gone: walked out to the nearest edge of the window first, where it may.
  F.leave = function () {
    var me = this;
    sitIn(this, null);
    Object.keys(this.timers).forEach(function (k) { clearTimeout(me.timers[k]); });
    function gone() { if (me.host.parentNode) me.host.parentNode.removeChild(me.host); }
    if (!mayGlide() || !this.inView() || this.menuOpen) { this.stopWalking(); gone(); return; }
    var v = view(), S = size(), toLeft = this.pos.x + S / 2 < v.x + v.w / 2;
    this.walkTo(toLeft ? v.x - S : v.x + v.w, this.pos.y, gone);
  };

  /* ── Yours ───────────────────────────────────────────────────────────── */
  function sendHome() {
    var main = document.getElementById('main') || document.querySelector('main');
    forget();
    if (mine) { sitIn(mine, null); mine.stopWalking(); Object.keys(mine.timers).forEach(function (k) { clearTimeout(mine.timers[k]); }); if (mine.host.parentNode) mine.host.parentNode.removeChild(mine.host); }
    mine = null;
    told();
    if (main) {
      if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
    }
  }

  // Taking one, from Chimera Obscura or from Profile. Its parts are checked
  // by chimera.js, and its name and sayings are its maker's, kept as written.
  function take(c, near) {
    var C0 = window.loveChimera, p = c && C0 && C0.clean(c.parts);
    if (!p) return false;
    var old = (mine && mine.state) || read() || {};
    var next = {
      parts: p, name: cleanName(c.name) || C0.suggest(p), sayings: cleanSayings(c.sayings), moves: !!old.moves,
      kept: typeof c.kept === 'string' && /^h[A-Za-z0-9_-]{10}$/.test(c.kept) ? c.kept : '',
      at: cleanAt(old.at, [0.9, 0.85]), was: null
    };
    if (!write(next)) return false;
    C = C0;
    told();
    if (!allowed()) return true;
    if (!mine) { mine = new Familiar(next, true); mine.arrive(near, false); listen(); return true; }
    mine.state = next;
    mine.draw();
    if (near && near.getBoundingClientRect) {
      var r = near.getBoundingClientRect(), v = view();
      mine.goTo(homeNear(mine, r.right + v.x + 12, r.top + v.y), true);
    }
    return true;
  }

  /* ── Everybody else's ────────────────────────────────────────────────── */
  // The familiars of the people seen in this room, from the radio's Be seen
  // here answer: [{ handle, familiar: { parts, name, sayings } }]. An empty
  // list sends them all out. Nothing about them is kept.
  function visitors(list) {
    if (!allowed()) return;
    withChimera(function () {
      var now = {};
      (Array.isArray(list) ? list : []).forEach(function (x) {
        var f = x && x.familiar, p = f && C.clean(f.parts);
        if (!p || typeof x.handle !== 'string' || !x.handle) return;
        now[x.handle.toLowerCase()] = { handle: x.handle, st: { parts: p, name: cleanName(f.name) || C.suggest(p), sayings: cleanSayings(f.sayings) } };
      });
      Object.keys(visiting).forEach(function (k) {
        if (!now[k]) { visiting[k].leave(); delete visiting[k]; }
      });
      Object.keys(now).forEach(function (k) {
        var x = now[k], v = visiting[k];
        if (v) {
          if (JSON.stringify(v.state) !== JSON.stringify(x.st)) { v.state = x.st; v.draw(); }
          return;
        }
        visiting[k] = new Familiar(x.st, false, x.handle);
        visiting[k].arrive(null, true);
      });
      if (Object.keys(now).length) listen();
    });
  }

  function each(fn) {
    if (mine) fn(mine);
    Object.keys(visiting).forEach(function (k) { fn(visiting[k]); });
  }

  function listen() {
    if (listening) return;
    listening = true;
    var timers = {};
    function later(name, fn, ms) { clearTimeout(timers[name]); timers[name] = setTimeout(fn, ms); }
    window.addEventListener('scroll', function () { later('scroll', function () { each(function (f) { f.followScroll(); }); }, 700); }, { passive: true });
    function recheck() { each(function (f) { f.recheck(); }); }
    window.addEventListener('resize', function () { later('check', recheck, 400); });
    // The radio opening, changing size, moving or folding resizes nothing on
    // the page, so nothing above would hear it: a look every few seconds,
    // only around each familiar and only while the tab is in front, moves one
    // out from under the radio and finds a cozy the radio stopped covering.
    setInterval(function () { if (document.visibilityState === 'visible') recheck(); }, 3000);
    if (window.ResizeObserver) new ResizeObserver(function () { later('check', recheck, 400); }).observe(document.body);
    document.addEventListener('click', function () { later('check', recheck, 500); }, true);
    document.addEventListener('toggle', function () { later('check', recheck, 300); }, true);
    document.addEventListener('focusin', function (e) {
      if (!mine || e.target === mine.host) return;
      var t = e.target;
      later('focus', function () { if (mine && t.getBoundingClientRect) mine.followTo(t.getBoundingClientRect()); }, 900);
    });
    var px = 0, py = 0;
    document.addEventListener('pointermove', function (e) {
      if (!mine || e.pointerType !== 'mouse' || mine.dragging) return;
      px = e.clientX; py = e.clientY;
      later('pointer', function () { if (mine) mine.followTo({ left: px, right: px, top: py, bottom: py }); }, 1500);
    }, { passive: true });
    document.addEventListener('pointerdown', function (e) {
      each(function (f) { if (f.menuOpen && e.target !== f.host) f.closeMenu(false); });
    });
  }

  /* Where in the window yours was when you left, so the next room can show
     it walking in from there: a place in the window, never the room. */
  window.addEventListener('pagehide', function () {
    if (!mine || !mine.pos) return;
    var v = view(), S = size(), st = read();
    if (!st) return;
    st.was = mine.inView() ? cleanAt([(mine.pos.x - v.x) / Math.max(1, v.w - S), (mine.pos.y - v.y) / Math.max(1, v.h - S)], null) : null;
    write(st);
  });

  // Sent home or changed in another tab: this one follows.
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY && e.key !== null) return;
    var v = read();
    if (!v) { if (mine) sendHomeQuietly(); return; }
    withChimera(function () {
      var p = C.clean(v.parts);
      if (!p) return;
      v.parts = p;
      v.name = v.name || C.suggest(p);
      if (mine) { mine.state = v; mine.draw(); return; }
      if (!allowed()) return;
      mine = new Familiar(v, true);
      mine.arrive(null, false);
      listen();
    });
  });
  function sendHomeQuietly() {
    sitIn(mine, null);
    Object.keys(mine.timers).forEach(function (k) { clearTimeout(mine.timers[k]); });
    mine.stopWalking();
    if (mine.host.parentNode) mine.host.parentNode.removeChild(mine.host);
    mine = null;
  }
  // Back from the browser's cache: forgotten meanwhile, or not.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted && mine && !read()) sendHomeQuietly();
  });

  window.loveFamiliar = {
    take: take,
    visitors: visitors,
    current: function () { var v = read(); return v ? { parts: v.parts, name: v.name, sayings: v.sayings, kept: v.kept } : null; },
    home: function () { forget(); if (mine) sendHomeQuietly(); told(); }
  };

  function boot() {
    var v = read();
    if (!v || !allowed()) return;
    withChimera(function () {
      var p = C.clean(v.parts);
      if (!p || mine) return;
      v.parts = p;
      v.name = v.name || C.suggest(p);
      mine = new Familiar(v, true);
      mine.arrive(null, true);
      listen();
      // So the radio, if it is already up, finds it at once.
      told();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
