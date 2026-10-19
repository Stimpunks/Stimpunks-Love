/* =============================================================================
   A familiar: a chimera out of Chimera Obscura that goes where you go on the
   street and finds somewhere to sit in every room. A suggestion from our
   community, after the animal orbs in Castle Crashers that follow their
   player about; Ryan's call, 2026-10-19. One file keeps it, draws it and
   moves it; chimera.js does the drawing, as it does everywhere else.

   IT FOLLOWS YOU BY BEING REMEMBERED. Every room is a page of its own, so
   nothing can walk from one to the next: what a familiar is made of, its
   name, whether you let it move by itself, and roughly where in the window
   you last put it down (two fractions of the window, never which room, so it
   is not a record of where you have been) are kept in your own browser under
   love-familiar, and every page draws it again when you arrive. This is the
   only file that writes that key. Taking one is a press, in Chimera Obscura
   (chimera-obscura.js calls take()) or in Profile on the radio; Send it home
   forgets it. NOTHING HERE IS SENT ANYWHERE and nothing is counted, and
   tools/make-chimera-obscura.py refuses this file a request, any other
   storage, a sound, a canvas, or markup written from a string.

   IT RESTS ONLY WHERE THERE ARE NO WORDS. It sits in the page, in the room,
   where no text, no control, no picture with a meaning, no player and no
   other floating thing is under it, and a room can mark anything else with
   data-familiar-avoid (the arcade's screens, Chimera Obscura's table). It
   crosses words only while it is moving (Ryan's call, 2026-10-19: the
   profile effect's pass, out on the street). When the page changes under it,
   it moves off the words. If nowhere in the window is clear it goes to the
   nearest clear place on the page, and only if there is none at all does it
   rest where it covers least.

   NOTHING MOVES BY ITSELF BELOW MAX GLITTER, roam.js's rule. At MAX, or
   after Let it move by itself (the candles' rule, the radio's Let my theme
   move), it wanders now and then, comes along when you scroll, and comes
   over to where your pointer settles or your keyboard has gone. At Gentle
   and Regular it stays where you put it. A move glides at Regular and MAX
   and is a jump at Gentle; it moves with left and top, never a transform,
   so check-gentle.py can see everything that moves. Moving it yourself is
   always yours: drag it, or press it and choose Move it, which the arrow
   keys then do.

   IT KEEPS YOU COMPANY AND THAT IS ALL IT DOES. No stats, no boost, no
   levelling up as you visit rooms (a level is a tally of where you have
   been), no collection to finish and no count. It makes no sound and it
   does not react to the CB, because a familiar that perked up when a
   message landed would be the receive lamp the radio refuses.

   It wears its own clothes, Chimera Obscura's: the table's white light
   round the drawing, and the room's black, brass and words on its menu,
   every pair already measured for that room. It lives in a shadow root,
   like the radio, so no room's stylesheet reaches it, and it lays no look
   over any room. Not in a frame, not in the radio's or the call's window,
   and not on a page whose <body> says data-cb="off" (Stay Frosty, where
   nothing moves, and the Healing Checkpoint, which writes nothing down);
   love.js asks the same before it loads this file. It does not print.
   ============================================================================= */
(function () {
  'use strict';
  if (window.loveFamiliar) return;

  var KEY = 'love-familiar';
  var GAP = 6;       // room kept between it and anything it rests beside
  var EDGE = 10;     // and between it and the window's edge
  var AVOID = 'a[href],button,input,select,textarea,summary,label,iframe,video,audio,img,canvas,' +
    'picture,object,embed,[role="button"],[role="img"],[role="slider"],[role="application"],' +
    '[tabindex]:not([tabindex="-1"]),[contenteditable],.facade,[data-familiar-avoid]';

  var C = null, state = null, host = null, btn = null, art = null, sr = null;
  var menu = null, nameP = null, wordsP = null, letB = null, letNote = null, line = null, sure = null, homeB = null, tableA = null;
  var pos = null, origin = { x: 0, y: 0 };
  var walking = false, walkT = 0, dragging = false, moving = false, movingFrom = null, menuOpen = false, hush = false;
  var timers = {};

  function intensity() { return document.documentElement.getAttribute('data-intensity') || 'regular'; }
  // Moving by itself: at MAX GLITTER, or once somebody has said it may.
  function mayMove() { return intensity() === 'max' || !!(state && state.moves); }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function later(name, fn, ms) { clearTimeout(timers[name]); timers[name] = setTimeout(fn, ms); }

  /* ── What is kept ────────────────────────────────────────────────────── */
  function cleanName(s) { return typeof s === 'string' ? s.replace(/\s+/g, ' ').trim().slice(0, 24) : ''; }
  function cleanAt(a) {
    if (!Array.isArray(a) || a.length !== 2) return [0.9, 0.85];
    return a.map(function (v) { return typeof v === 'number' && isFinite(v) ? clamp(Math.round(v * 100) / 100, 0, 1) : 0.85; });
  }
  function read() {
    var v = null;
    try { v = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
    if (!v || typeof v !== 'object' || Array.isArray(v) || !v.parts) return null;
    return { parts: v.parts, name: cleanName(v.name), moves: v.moves === true, at: cleanAt(v.at) };
  }
  function write() {
    if (!state) return false;
    try {
      localStorage.setItem(KEY, JSON.stringify({ parts: state.parts, name: state.name, moves: !!state.moves, at: state.at }));
      return true;
    } catch (e) { return false; }
  }
  function forget() { try { localStorage.removeItem(KEY); } catch (e) {} }

  function allowed() {
    var b = document.body;
    if (!b) return false;
    try { if (window.top !== window.self) return false; } catch (e) { return false; }
    return b.getAttribute('data-cb') !== 'off' && !b.hasAttribute('data-cb-window');
  }

  /* chimera.js, if this page has not got it. The radio loads it the same
     way, and the data-cb-chimera mark keeps the two from loading it twice. */
  function withChimera(then) {
    if (window.loveChimera) { then(); return; }
    var s = document.querySelector('script[data-cb-chimera]');
    if (!s) {
      s = document.createElement('script');
      s.src = '/chimera.js';
      s.setAttribute('data-cb-chimera', '');
      document.head.appendChild(s);
    }
    s.addEventListener('load', function () { if (window.loveChimera) then(); });
  }

  /* ── Where it is ─────────────────────────────────────────────────────── */
  function size() {
    var de = document.documentElement;
    return Math.min(de.clientWidth, de.clientHeight) < 560 ? 68 : 88;
  }
  function view() {
    var de = document.documentElement;
    return { w: de.clientWidth, h: de.clientHeight, x: window.scrollX, y: window.scrollY };
  }
  // Where it can be on the page at all: never past the page's own width, so
  // it never gives a phone a sideways scroll, and never below its foot.
  function bounds(inView) {
    var v = view(), S = size(), de = document.documentElement, b = document.body;
    var maxX = Math.max(EDGE, v.w - S - EDGE);
    var maxY = Math.max(EDGE, Math.max(de.scrollHeight, b.scrollHeight) - S - EDGE);
    if (!inView) return { l: EDGE, t: EDGE, r: maxX, b: maxY };
    return { l: v.x + EDGE, t: v.y + EDGE, r: Math.min(maxX, v.x + v.w - S - EDGE), b: Math.min(maxY, v.y + v.h - S - EDGE) };
  }
  function inView() {
    if (!pos) return false;
    var v = view(), S = size();
    return pos.x + S > v.x && pos.x < v.x + v.w && pos.y + S > v.y && pos.y < v.y + v.h;
  }

  // The host is placed in the page's own coordinates, so it stays in the
  // room when you scroll. Where left: 0 lands depends on the page, so it is
  // measured rather than assumed.
  function measureOrigin() {
    var t = host.style.transition;
    host.style.transition = 'none';
    host.style.left = '0px';
    host.style.top = '0px';
    var r = host.getBoundingClientRect();
    origin = { x: r.left + window.scrollX, y: r.top + window.scrollY };
    host.style.transition = t;
    if (pos) put(pos.x, pos.y);
  }
  function put(x, y) {
    pos = { x: Math.round(x), y: Math.round(y) };
    host.style.left = (pos.x - origin.x) + 'px';
    host.style.top = (pos.y - origin.y) + 'px';
  }
  function stopWalking() {
    clearTimeout(walkT);
    walking = false;
    host.classList.remove('is-walking');
    host.style.pointerEvents = '';
  }
  function jump(x, y) {
    stopWalking();
    host.style.transition = 'none';
    put(x, y);
  }
  // A walk: it may cross words now, and only now. At Gentle §3 takes the
  // transition away, so a walk there is a jump.
  function walkTo(x, y) {
    if (!pos || intensity() === 'gentle') { jump(x, y); return; }
    var dx = x - pos.x, dy = y - pos.y, far = Math.sqrt(dx * dx + dy * dy);
    if (far < 2) return;
    var ms = Math.round(clamp(far / 0.32, 450, 2800));
    host.classList.toggle('is-left', dx < 0);
    host.classList.add('is-walking');
    host.style.pointerEvents = 'none';
    walking = true;
    host.style.transition = 'left ' + ms + 'ms ease-in-out, top ' + ms + 'ms ease-in-out';
    put(x, y);
    clearTimeout(walkT);
    walkT = setTimeout(function () { stopWalking(); }, ms + 60);
  }

  /* ── Where the words are ─────────────────────────────────────────────── */
  function meets(a, b) { return a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b; }
  function onPage(r, pad) {
    return { l: r.left + window.scrollX - pad, t: r.top + window.scrollY - pad, r: r.right + window.scrollX + pad, b: r.bottom + window.scrollY + pad };
  }
  // Everything it must not rest on inside area, in the page's coordinates:
  // every line of text, every control, picture with a meaning and player,
  // and every other floating thing (the radio, the guest bar, the fractal
  // window) and anything else with a shadow root, whose words cannot be
  // read from here, other than this one.
  // It walks down the page from the body and leaves any part whose box is
  // nowhere near the area, so a check beside it on the changelog looks at a
  // handful of paragraphs rather than every line of a very long page.
  function busy(area) {
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
      if (e === host || /^(?:SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(e.tagName)) return;
      var r = e.getBoundingClientRect(), sized = r.width || r.height;
      if (sized && !meets(onPage(r, GAP), area)) return;
      if (e.shadowRoot) { if (sized) out.push(onPage(r, GAP)); return; }
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
  function cover(x, y, S, f, stopAtAny) {
    var me = { l: x, t: y, r: x + S, b: y + S }, seen = [], sum = 0;
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
  // The clear spot nearest a point: in the window, or anywhere on the page.
  function spotNear(tx, ty, inViewOnly) {
    var S = size(), B = bounds(inViewOnly);
    if (B.r < B.l || B.b < B.t) return null;
    var f = file(busy({ l: B.l, t: B.t, r: B.r + S, b: B.b + S }));
    var step = inViewOnly ? 20 : 40, pts = [[clamp(tx, B.l, B.r), clamp(ty, B.t, B.b)]];
    for (var x = B.l; x <= B.r; x += step) for (var y = B.t; y <= B.b; y += step) pts.push([x, y]);
    pts.push([B.r, B.b], [B.l, B.b], [B.r, B.t]);
    pts.sort(function (a, b) {
      var da = (a[0] - tx) * (a[0] - tx) + (a[1] - ty) * (a[1] - ty), db = (b[0] - tx) * (b[0] - tx) + (b[1] - ty) * (b[1] - ty);
      return da - db;
    });
    var best = null, least = Infinity;
    for (var i = 0; i < pts.length; i++) {
      if (!cover(pts[i][0], pts[i][1], S, f, true)) return { x: pts[i][0], y: pts[i][1], clear: true };
      if (inViewOnly) {
        var c = cover(pts[i][0], pts[i][1], S, f, false);
        if (c < least) { least = c; best = { x: pts[i][0], y: pts[i][1], clear: false }; }
      }
    }
    return best;
  }
  // Somewhere off the words, near a point: in the window if it can, else the
  // nearest clear place on the page, else where it covers least.
  function findSpot(tx, ty) {
    var s = spotNear(tx, ty, true);
    if (s && s.clear) return s;
    var far = spotNear(tx, ty, false);
    return far && far.clear ? far : s;
  }
  function clearHere() {
    if (!pos) return false;
    var S = size(), me = { l: pos.x, t: pos.y, r: pos.x + S, b: pos.y + S };
    return !busy(me).some(function (r) { return meets(me, r); });
  }
  function settle(tx, ty, glide) {
    var s = findSpot(tx, ty);
    if (!s) return null;
    if (glide && mayMove()) walkTo(s.x, s.y); else jump(s.x, s.y);
    return s;
  }
  function busyNow() { return walking || dragging || moving || menuOpen; }

  /* Where in the window it was put down, kept so the next room starts it
     there. Only when you put it down: its own wandering is not a choice of
     yours. */
  function remember() {
    var v = view(), S = size();
    state.at = cleanAt([(pos.x - v.x) / Math.max(1, v.w - S), (pos.y - v.y) / Math.max(1, v.h - S)]);
    write();
  }
  function startFromKept() {
    var v = view(), S = size();
    return [v.x + state.at[0] * Math.max(0, v.w - S), v.y + state.at[1] * Math.max(0, v.h - S)];
  }

  /* ── Drawing it ──────────────────────────────────────────────────────── */
  function tell(t) {
    if (!sr) return;
    sr.textContent = '';
    setTimeout(function () { sr.textContent = t; }, 30);
  }
  function drawArt() {
    art.textContent = '';
    var svg = C.draw(state.parts, { prefix: 'fam', cls: 'fam__svg' });
    if (svg) art.appendChild(svg);
    btn.setAttribute('aria-label', 'Your familiar, ' + state.name);
    nameP.textContent = state.name;
    wordsP.textContent = C.words(state.parts);
    tableA.href = '/chimera-obscura.html#chimera=' + C.code(state.parts);
    letB.textContent = 'Let it move by itself: ' + (state.moves ? 'on' : 'off');
    letB.setAttribute('aria-pressed', state.moves ? 'true' : 'false');
    letNote.hidden = intensity() !== 'max';
  }
  function build() {
    host = document.createElement('love-familiar');
    host.style.cssText = 'display:block;position:absolute;left:0;top:0;z-index:60;margin:0;padding:0;border:0;visibility:hidden;';
    var S = size();
    host.style.width = S + 'px';
    host.style.height = S + 'px';
    var root = host.attachShadow({ mode: 'open' });
    var sheet = el('link');
    sheet.rel = 'stylesheet';
    sheet.href = '/familiar.css';
    // Shown once its stylesheet has arrived, so it never appears for a
    // moment as a bare button.
    var shown = false;
    function ready() { if (shown) return; shown = true; host.style.visibility = ''; }
    sheet.addEventListener('load', ready);
    sheet.addEventListener('error', ready);
    root.appendChild(sheet);

    btn = el('button', 'fam');
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    art = el('span', 'fam__art');
    art.setAttribute('aria-hidden', 'true');
    btn.appendChild(art);
    root.appendChild(btn);

    sr = el('span', 'fam__sr');
    sr.setAttribute('role', 'status');
    root.appendChild(sr);

    menu = el('div', 'fam__menu');
    menu.hidden = true;
    menu.setAttribute('role', 'group');
    menu.setAttribute('aria-label', 'Your familiar');
    nameP = el('p', 'fam__name');
    wordsP = el('p', 'fam__words');
    menu.appendChild(nameP);
    menu.appendChild(wordsP);
    menu.appendChild(el('p', 'fam__note', 'It goes where you go on the street and sits wherever there are no words. It keeps you company, and that is all it does.'));
    var row = el('div', 'fam__row');
    var moveB = el('button', 'fam__btn', 'Move it');
    moveB.type = 'button';
    letB = el('button', 'fam__btn fam__btn--quiet');
    letB.type = 'button';
    row.appendChild(moveB);
    row.appendChild(letB);
    menu.appendChild(row);
    letNote = el('p', 'fam__note', 'At MAX GLITTER it moves by itself whatever this says. Below MAX it stays where you put it unless this is on.');
    menu.appendChild(letNote);
    var row2 = el('div', 'fam__row');
    tableA = el('a', 'fam__link', 'Put it on the table in Chimera Obscura');
    row2.appendChild(tableA);
    menu.appendChild(row2);
    var row3 = el('div', 'fam__row');
    homeB = el('button', 'fam__btn fam__btn--quiet', 'Send it home');
    homeB.type = 'button';
    var closeB = el('button', 'fam__btn fam__btn--quiet', 'Close');
    closeB.type = 'button';
    row3.appendChild(homeB);
    row3.appendChild(closeB);
    menu.appendChild(row3);
    sure = el('div', 'fam__sure');
    sure.hidden = true;
    sure.appendChild(el('p', 'fam__note', 'It stops following you, and your browser forgets it. It is still yours to make again in Chimera Obscura, and in your Profile if you kept it there.'));
    var yes = el('button', 'fam__btn', 'Yes, send it home');
    yes.type = 'button';
    var no = el('button', 'fam__btn fam__btn--quiet', 'Keep it with me');
    no.type = 'button';
    var row4 = el('div', 'fam__row');
    row4.appendChild(yes);
    row4.appendChild(no);
    sure.appendChild(row4);
    menu.appendChild(sure);
    line = el('p', 'fam__line');
    line.setAttribute('role', 'status');
    menu.appendChild(line);
    root.appendChild(menu);

    moveB.addEventListener('click', startMoving);
    letB.addEventListener('click', function () {
      state.moves = !state.moves;
      write();
      drawArt();
      line.textContent = state.moves
        ? 'It moves by itself now, at every setting: it wanders now and then and comes along when you go somewhere.'
        : (intensity() === 'max' ? 'At MAX GLITTER it still moves by itself. Below MAX it stays where you put it.' : 'It stays where you put it now.');
    });
    closeB.addEventListener('click', function () { closeMenu(true); });
    homeB.addEventListener('click', function () { sure.hidden = false; homeB.hidden = true; no.focus(); });
    no.addEventListener('click', function () { sure.hidden = true; homeB.hidden = false; homeB.focus(); });
    yes.addEventListener('click', sendHome);
    menu.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); } });

    btn.addEventListener('pointerdown', grab);
    btn.addEventListener('pointermove', drag);
    btn.addEventListener('pointerup', drop);
    btn.addEventListener('pointercancel', drop);
    btn.addEventListener('click', function () {
      if (hush) { hush = false; return; }
      if (moving) return;
      if (menuOpen) closeMenu(false); else openMenu();
    });
    btn.addEventListener('keydown', keys);
    btn.addEventListener('blur', function () { if (moving) putDown(false); });
  }

  /* ── Its menu ────────────────────────────────────────────────────────── */
  function openMenu() {
    menuOpen = true;
    sure.hidden = true;
    homeB.hidden = false;
    line.textContent = '';
    drawArt();
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    placeMenu();
  }
  function closeMenu(focus) {
    if (!menuOpen) return;
    menuOpen = false;
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (focus) btn.focus();
  }
  // Beside it where there is room, else under it, always inside the window,
  // so it never gives the page a sideways scroll.
  function placeMenu() {
    var v = view(), S = size(), W = Math.min(300, v.w - 2 * EDGE);
    menu.style.width = W + 'px';
    var left;
    if (pos.x + S + 8 + W <= v.x + v.w - EDGE) left = S + 8;
    else if (pos.x - 8 - W >= v.x + EDGE) left = -(W + 8);
    else left = null;
    var h = menu.offsetHeight;
    if (left === null) {
      menu.style.left = (clamp(pos.x, v.x + EDGE, v.x + v.w - EDGE - W) - pos.x) + 'px';
      menu.style.top = (pos.y + S + 8 + h <= v.y + v.h - EDGE ? S + 8 : -(h + 8)) + 'px';
    } else {
      menu.style.left = left + 'px';
      menu.style.top = (clamp(pos.y, v.y + EDGE, Math.max(v.y + EDGE, v.y + v.h - EDGE - h)) - pos.y) + 'px';
    }
  }
  function sendHome() {
    forget();
    var main = document.getElementById('main') || document.querySelector('main');
    remove();
    if (main) {
      if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
    }
  }
  function remove() {
    if (host && host.parentNode) host.parentNode.removeChild(host);
    host = null;
    state = null;
    pos = null;
    menuOpen = moving = dragging = walking = false;
    Object.keys(timers).forEach(function (k) { clearTimeout(timers[k]); });
  }

  /* ── Moving it yourself ──────────────────────────────────────────────── */
  var down = null;
  function grab(e) {
    if (e.button !== 0 || moving) return;
    stopWalking();
    down = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y, id: e.pointerId };
    // Held from the press, so a quick drag does not leave it behind.
    try { btn.setPointerCapture(e.pointerId); } catch (err) {}
  }
  function drag(e) {
    if (!down || e.pointerId !== down.id) return;
    var dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (!dragging && dx * dx + dy * dy < 36) return;
    if (!dragging) {
      dragging = true;
      closeMenu(false);
      host.classList.add('is-held');
    }
    e.preventDefault();
    var B = bounds(false);
    jump(clamp(down.px + dx, B.l, B.r), clamp(down.py + dy, B.t, B.b));
  }
  function drop(e) {
    if (!down || (e && e.pointerId !== down.id)) return;
    down = null;
    if (!dragging) return;
    dragging = false;
    host.classList.remove('is-held');
    hush = true;
    setTimeout(function () { hush = false; }, 400);
    putDown(false);
  }
  function startMoving() {
    closeMenu(false);
    moving = true;
    movingFrom = { x: pos.x, y: pos.y };
    host.classList.add('is-held');
    btn.focus();
    tell('Moving it. The arrow keys move it, and further with Shift. Enter puts it down, and Escape puts it back where it was.');
  }
  function keys(e) {
    if (!moving) {
      if (e.key === 'Escape' && menuOpen) { e.preventDefault(); closeMenu(true); }
      return;
    }
    var step = e.shiftKey ? 64 : 16, dx = 0, dy = 0;
    if (e.key === 'ArrowLeft') dx = -step;
    else if (e.key === 'ArrowRight') dx = step;
    else if (e.key === 'ArrowUp') dy = -step;
    else if (e.key === 'ArrowDown') dy = step;
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      hush = true;
      setTimeout(function () { hush = false; }, 400);
      putDown(true);
      return;
    } else if (e.key === 'Escape') {
      e.preventDefault();
      moving = false;
      host.classList.remove('is-held');
      jump(movingFrom.x, movingFrom.y);
      tell('Put back where it was.');
      return;
    } else return;
    e.preventDefault();
    var B = bounds(false);
    jump(clamp(pos.x + dx, B.l, B.r), clamp(pos.y + dy, B.t, B.b));
    try { host.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (err) {}
  }
  // Put down: off the words if it was dropped on any, and remembered.
  function putDown(say) {
    var was = moving;
    moving = false;
    host.classList.remove('is-held');
    var from = { x: pos.x, y: pos.y };
    var s = findSpot(pos.x, pos.y);
    if (s) jump(s.x, s.y);
    remember();
    if (say || was) {
      var shifted = Math.abs(pos.x - from.x) + Math.abs(pos.y - from.y) > 8;
      tell(shifted ? 'Put down nearby, where there are no words.' : 'Put down here.');
    }
  }

  /* ── Moving by itself, at MAX GLITTER or when let ────────────────────── */
  function wander() {
    if (!host) return;
    later('wander', wander, 24000 + Math.random() * 26000);
    if (!mayMove() || document.visibilityState !== 'visible' || busyNow()) return;
    var v = view(), S = size();
    var s = spotNear(v.x + EDGE + Math.random() * Math.max(0, v.w - S - 2 * EDGE),
      v.y + EDGE + Math.random() * Math.max(0, v.h - S - 2 * EDGE), true);
    if (s && s.clear) walkTo(s.x, s.y);
  }
  // Left behind when you scrolled: it comes in from the edge it was left at.
  function followScroll() {
    if (!host || !mayMove() || busyNow() || inView() || document.visibilityState !== 'visible') return;
    var at = startFromKept();
    var s = spotNear(at[0], at[1], true);
    if (!s || !s.clear) return;
    var v = view(), S = size(), B = bounds(false);
    jump(pos.x, clamp(pos.y < v.y ? v.y - S : v.y + v.h, B.t, B.b));
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (host) walkTo(s.x, s.y); }); });
  }
  // Over to where you are: beside what has the keyboard, or where the
  // pointer has settled, unless it is near enough already.
  function followTo(r) {
    if (!host || !mayMove() || busyNow() || document.visibilityState !== 'visible') return;
    var v = view(), S = size();
    var cx = (r.left + r.right) / 2 + v.x, cy = (r.top + r.bottom) / 2 + v.y;
    var mx = pos.x + S / 2, my = pos.y + S / 2;
    if (inView() && (mx - cx) * (mx - cx) + (my - cy) * (my - cy) < 280 * 280) return;
    var s = spotNear(r.right + v.x + 16, r.top + v.y, true);
    if (s && s.clear) walkTo(s.x, s.y);
  }

  /* When the page changes under it (a panel opens, a picture arrives, the
     window is resized), it moves off any words that are under it now. */
  function recheck() {
    if (!host || walking || dragging || moving) return;
    var S = size();
    if (host.style.width !== S + 'px') { host.style.width = S + 'px'; host.style.height = S + 'px'; }
    measureOrigin();
    if (!clearHere()) settle(pos.x, pos.y, !menuOpen);
    if (menuOpen) placeMenu();
  }

  function listen() {
    window.addEventListener('scroll', function () { later('scroll', followScroll, 700); }, { passive: true });
    window.addEventListener('resize', function () { later('check', recheck, 400); });
    if (window.ResizeObserver) new ResizeObserver(function () { later('check', recheck, 400); }).observe(document.body);
    document.addEventListener('click', function () { later('check', recheck, 500); }, true);
    document.addEventListener('toggle', function () { later('check', recheck, 300); }, true);
    document.addEventListener('focusin', function (e) {
      if (!host || e.target === host) return;
      var t = e.target;
      later('focus', function () { if (t.getBoundingClientRect) followTo(t.getBoundingClientRect()); }, 900);
    });
    var px = 0, py = 0;
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || dragging) return;
      px = e.clientX; py = e.clientY;
      later('pointer', function () { followTo({ left: px, right: px, top: py, bottom: py }); }, 1500);
    }, { passive: true });
    document.addEventListener('pointerdown', function (e) {
      if (menuOpen && host && e.target !== host) closeMenu(false);
    });
  }

  /* ── Arriving ────────────────────────────────────────────────────────── */
  var listening = false;
  function start(near) {
    if (!state || host || !allowed()) return;
    build();
    document.body.appendChild(host);
    measureOrigin();
    drawArt();
    var t = startFromKept();
    if (near && near.getBoundingClientRect) {
      var r = near.getBoundingClientRect(), v = view();
      t = [r.right + v.x + 12, r.top + v.y];
    }
    settle(t[0], t[1], false);
    if (!listening) { listening = true; listen(); }
    later('wander', wander, 20000 + Math.random() * 20000);
  }

  // Taking one, from Chimera Obscura or from Profile. Its parts are checked
  // by chimera.js, and its name is its maker's, kept as typed.
  function take(parts, name, near) {
    var C0 = window.loveChimera, p = C0 && C0.clean(parts);
    if (!p) return false;
    var old = state || read() || {};
    var next = { parts: p, name: cleanName(name) || C0.suggest(p), moves: !!old.moves, at: cleanAt(old.at) };
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) { return false; }
    C = C0;
    state = next;
    if (!allowed()) return true;
    if (!host) { start(near); return true; }
    drawArt();
    if (near && near.getBoundingClientRect) {
      var r = near.getBoundingClientRect(), v = view();
      settle(r.right + v.x + 12, r.top + v.y, true);
    }
    return true;
  }

  // Sent home or changed in another tab: this one follows.
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY && e.key !== null) return;
    var v = read();
    if (!v) { if (host) remove(); return; }
    withChimera(function () {
      C = window.loveChimera;
      var p = C.clean(v.parts);
      if (!p) return;
      v.parts = p;
      v.name = v.name || C.suggest(p);
      state = v;
      if (host) drawArt(); else start();
    });
  });
  // Back from the browser's cache: forgotten meanwhile, or not.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted && host && !read()) remove();
  });

  window.loveFamiliar = {
    take: take,
    current: function () { var v = read(); return v ? { parts: v.parts, name: v.name } : null; },
    home: function () { forget(); remove(); }
  };

  function boot() {
    var v = read();
    if (!v || !allowed()) return;
    withChimera(function () {
      C = window.loveChimera;
      var p = C.clean(v.parts);
      if (!p) return;
      v.parts = p;
      v.name = v.name || C.suggest(p);
      state = v;
      start();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
