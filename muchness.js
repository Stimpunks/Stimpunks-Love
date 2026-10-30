/* =============================================================================
   Bring Your Muchness: the fanfare for turning the dial up to MAX GLITTER.

   Ryan's ask, 2026-10-29: a spectacular confirmation when somebody turns on
   MAX GLITTER, Esmx rising from the bottom of the screen in an aura of glitter,
   and "Bring Your Muchness" in glittering letters above them. The phrase is our
   own, Infodumplings' tagline ("Bring Your Muchness Down the Rabbit Hole").

   ESMX IS KAYA OLDAKER'S DRAWING, AS SHE DREW IT. Ryan's call, the same day:
   start from Kaya's original art and not the Arcade's redrawing, and her
   Rainbow Leaping is the one, Esmx running and punching the air with one fist,
   which is the wave. art/esmx-leaping.webp is that file from Esmx's own page,
   cropped to the drawing, scaled and saved with no metadata; nothing in it is
   redrawn. Stimpunks commissioned Esmx and holds the rights, and Kaya is named
   here, on the picture's own markup, and in the liner notes, because holding
   the rights is not a reason to stop naming the hand. Her alt text is on the
   picture, because she asks anybody sharing Esmx to include it.

   It is furniture, the bodymind break's kind: its own shadow root, its own
   stylesheet (muchness.css) and its own colours (§2's --much-*), the same in
   every room. love.js loads this file only when somebody presses MAX GLITTER,
   so a visitor who never does fetches nothing for it.

   What it promises, each of which tools/check-muchness.py holds:

     · IT PLAYS ONLY WHEN SOMEBODY TURNS THE DIAL UP TO MAX, from the page's
       dial or the CB's Glitter dial, which are one setter (love.js's
       setLevel). Never when a page opens with MAX already kept, or every page
       at MAX would play it by itself, which is autoplay.
     · NOTHING FLASHES. A spark comes up over a few hundred milliseconds and
       goes over at least a second and a half (FADE_FLOOR), no two in step, so
       nothing crosses the flash line; Club Chronic's rule holds here too.
     · NO SOUND. The notice's fanfare is silent, and so is this one.
     · IT KEEPS NOTHING AND SENDS NOTHING but its own stylesheet and picture.
     · IT NEVER GETS IN THE WAY. Nothing on it can be pressed (pointer-events
       none), it is aria-hidden, it ends by itself in a few seconds, and
       Escape, a press anywhere, a hidden tab or turning the dial down ends it
       at once. The words are said by the dial's own line, which says "Bring
       your muchness" at MAX, so nobody who cannot see this misses them.
     · IT MOVES BY TRANSLATE AND SCALE, never a rotation or a skew, because
       those are all check-gentle.py can read.
     · NOT ON A PAGE WHOSE <body> SAYS data-cb="off" (Stay Frosty, which says
       nothing moves at any setting; the Healing Checkpoint; the call window),
       and not in a frame. love.js asks first and this file asks again.
   ============================================================================= */
(function () {
  'use strict';

  var LIFE = 4600;          // ms from the start to the end of the whole fanfare
  var FADE_FLOOR = 1500;    // ms: no spark goes out faster than this
  var SPARKS = 80;
  var ALT = 'A drawing of Esmx - a porkypine (part pig, part porcupine) with a pink and green colour scheme ' +
    'for the body and a huge, trailing rainbow mohawk/spikes. The spikes trail off and separate, as if they ' +
    'are made of energy. Esmx is wearing an earring in one ear and is missing a chunk in the other ear. ' +
    'Esmx is running and punching the air with one fist.';

  var host = null, stage = null, timer = 0, gone = 0;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  var SVG = 'http://www.w3.org/2000/svg';
  function sv(tag, attrs) {
    var e = document.createElementNS(SVG, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function quiet() {
    var b = document.body;
    if (!b || b.getAttribute('data-cb') === 'off' || document.hidden) return true;
    try { if (window.top !== window.self) return true; } catch (e) { return true; }
    return false;
  }

  /* A SPARK: a four-pointed star outlined in the plate's night, so it shows on
     a pale room as well as a dark one. Each comes up, rises and goes out on its
     own clock, a FADE_FLOOR at least for the going out (three quarters of its
     time), so no spark and no two together flash. */
  function spark(i) {
    var s = el('span', 'much-spark much-spark--' + (1 + i % 6));
    var t = Math.round(FADE_FLOOR / 0.75 + Math.random() * 600);
    var d = Math.round(Math.random() * (LIFE - t - 200));
    s.style.setProperty('--x', (6 + Math.random() * 88).toFixed(1) + '%');
    s.style.setProperty('--y', (Math.random() * 62).toFixed(1) + 'vh');
    s.style.setProperty('--rise', Math.round(70 + Math.random() * 170) + 'px');
    s.style.setProperty('--s', Math.round(12 + Math.random() * 24) + 'px');
    s.style.setProperty('--t', t + 'ms');
    s.style.setProperty('--d', d + 'ms');
    var svg = sv('svg', { viewBox: '-12 -12 24 24', focusable: 'false' });
    svg.appendChild(sv('path', { d: 'M0-11L2.7-2.7 11 0 2.7 2.7 0 11-2.7 2.7-11 0-2.7-2.7Z' }));
    s.appendChild(svg);
    return s;
  }

  function play() {
    if (host || quiet()) return;
    host = el('div');
    host.setAttribute('data-love-muchness', '');
    host.setAttribute('aria-hidden', 'true');
    var root = host.attachShadow({ mode: 'open' });
    var sheet = el('link');
    sheet.rel = 'stylesheet';
    sheet.href = '/muchness.css';
    root.appendChild(sheet);

    stage = el('div', 'much');
    stage.appendChild(el('div', 'much-aura'));
    var sky = el('div', 'much-sparks');
    for (var i = 0; i < SPARKS; i++) sky.appendChild(spark(i));
    stage.appendChild(sky);

    var col = el('div', 'much-col');
    var sign = el('div', 'much-sign');
    sign.appendChild(el('span', 'much-kicker', 'MAX GLITTER'));
    sign.appendChild(el('span', 'much-words', 'Bring Your Muchness'));
    col.appendChild(sign);
    var fig = el('div', 'much-fig');
    var img = el('img', 'much-esmx');
    img.alt = ALT;
    img.setAttribute('data-credit', 'Esmx the Porkypine, Rainbow Leaping, drawn by Kaya Oldaker for the Stimpunks Foundation (CC BY-SA 4.0)');
    img.decoding = 'async';
    img.src = '/art/esmx-leaping.webp';
    fig.appendChild(img);
    col.appendChild(fig);
    stage.appendChild(col);
    root.appendChild(stage);
    document.body.appendChild(host);

    // Start once the stylesheet and Esmx are both here, so nothing appears
    // unstyled and Esmx never pops in halfway up; a second and a half at most.
    var waiting = 2, started = false;
    function ready() {
      if (--waiting > 0 || started || !host) return;
      started = true;
      stage.classList.add('is-on');
      timer = setTimeout(remove, LIFE);
    }
    sheet.addEventListener('load', ready);
    sheet.addEventListener('error', remove);
    if (img.decode) img.decode().then(ready, function () { fig.hidden = true; ready(); });
    else { img.addEventListener('load', ready); img.addEventListener('error', function () { fig.hidden = true; ready(); }); }
    setTimeout(function () { if (!started) { waiting = 1; ready(); } }, 1500);

    document.addEventListener('keydown', onKey, true);
    document.addEventListener('pointerdown', leave, { capture: true, passive: true });
    document.addEventListener('visibilitychange', onHidden);
    document.addEventListener('love-intensity', onLevel);
    document.addEventListener('love-low', leave);
  }

  function onKey(e) { if (e.key === 'Escape') leave(); }
  function onHidden() { if (document.hidden) remove(); }
  function onLevel(e) { if (!e.detail || e.detail.level !== 'max') leave(); }

  // Asked to go early: a quick fade of the whole thing, then gone.
  function leave() {
    if (!host || gone) return;
    clearTimeout(timer);
    stage.classList.add('is-leaving');
    gone = setTimeout(remove, 450);
  }
  function remove() {
    clearTimeout(timer);
    clearTimeout(gone);
    gone = 0;
    document.removeEventListener('keydown', onKey, true);
    document.removeEventListener('pointerdown', leave, { capture: true });
    document.removeEventListener('visibilitychange', onHidden);
    document.removeEventListener('love-intensity', onLevel);
    document.removeEventListener('love-low', leave);
    if (host && host.parentNode) host.parentNode.removeChild(host);
    host = null;
    stage = null;
  }

  window.loveMuchness = { play: play, leave: leave };
})();
