/* =============================================================================
   Penguin Pebbling — the third cabinet in the Arcade.

   WHAT THIS IS, AND WHAT IT CAREFULLY IS NOT. Penguin pebbling is one of the
   Five Neurodivergent Love Locutions, coined by Amythest Schaber (Neurowonderful)
   and documented by Stimpunks in 2022; the locution is "I thought about you
   today. I remembered this thing about you. Here's something I want to share
   with you specifically" (@brainsandspoons), and Helen Edgar wrote it up at
   Autistic Realms in 2023.

   THERE IS ALREADY A PENGUIN PEBBLING GAME and this is not it. Helen Edgar and
   Ryan Boren published a thirty-card game of that name in 2026; it lives at
   penguinpebbling.app and it is licensed CC BY-NC-SA 4.0. THIS SITE IS CC BY-SA
   4.0, with no non-commercial clause. An adaptation of that deck would drag
   NC-SA onto a page that cannot carry it, and relicensing is not ours alone to
   do -- the artwork and half the authorship are Helen's. So this cabinet is
   built on the LOCUTION, which is Schaber's and the community's, and it takes
   nothing from the deck: no cards, no prompts, no artwork, no five-locution
   structure. The deck is linked and credited as the separate, better thing it
   is. Do not merge them.

   WHAT IT REFUSES, all of it out of the locution itself:
     · IT DOES NOT COUNT WHAT YOU GAVE. No tally, no total, no streak. The
       practice is explicitly not about volume.
     · IT DOES NOT REQUIRE A PEBBLE BACK. The other penguins bring you things on
       their own clock whether or not you have ever given them anything -- which
       is the difference between pebbling and trading, made mechanical rather
       than asserted.
     · NO PEBBLE IS THE WRONG PEBBLE. Every one is taken, every one gets a
       different thing said back, and there is no matching puzzle underneath.
       Giving is how you find out who somebody is, not a lock to pick.
     · A PEBBLE YOU KEEP IS NOT A FAILURE. You can carry one the whole time.

   AND ONE HONEST NOTE ABOUT THE PENGUINS, in the house style. Adélie and gentoo
   penguins really do build nests out of stones and really do carry them about,
   and they also steal them from each other constantly. The tidy romance -- one
   penguin selecting the perfect pebble and presenting it to its beloved -- is
   the popular retelling rather than the finding. The locution is named after the
   image and is not weakened by that, because a metaphor does not have to be a
   finding. The room says so on its own face rather than quietly trading on it.
   There is no stealing in this cabinet, because the game is about the locution
   and not about penguins.

   NO DOM ELEMENT IS EVER ROTATED, as in the other two. The lean is a drawn pose.
   ============================================================================= */
(function () {
  'use strict';

  var shore = document.getElementById('shore');
  if (!shore) return;

  /* peng-you, not peng: the <g id="peng"> in the page's <defs> is the DRAWING,
     and this is the player made out of it. They shared an id in the first
     build, getElementById returned the definition, and start() threw on the
     first line that reached into it. */
  var me      = document.getElementById('peng-you');
  var attract = document.getElementById('shore-attract');
  var coin    = document.getElementById('shore-coin');
  var rest    = document.getElementById('shore-rest');
  var says    = document.getElementById('shore-says');
  var log     = document.getElementById('shore-log');
  var nojs    = document.getElementById('shore-nojs');

  var ASPECT = 8 / 5;
  function measure() {
    var r = shore.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) ASPECT = r.width / r.height;
  }
  measure();
  window.addEventListener('resize', measure);

  var SAND = 56;   /* the top of the shingle, in per cent */
  var BACK = 96;

  var SPEEDS = {
    slow:   { walk: 15, note: 'Slow' },
    steady: { walk: 22, note: 'Steady' },
    quick:  { walk: 30, note: 'Quick' }
  };
  var speed = 'steady';

  /* Six things worth carrying. EACH HAS ITS OWN SHAPE as well as its own
     colour and its own name, and that is not decoration: the fills all have to
     clear 4.5 against the outline that draws them, which squeezes them into a
     narrow band of light tones, and two light tones a hue apart are two things
     nobody can tell apart at sprite size. Shape is the channel that survives
     it. The name is the third, said out loud on every pick-up, because colour
     is never the only thing carrying a difference on this site.

     None of them is better than another and nothing sorts them. */
  var OUTLINE = 'stroke="#1E2833" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
  var THINGS = [
    { id: 'grey', name: 'a smooth grey pebble', fill: '#A8B0B8',
      art: '<ellipse cx="20" cy="16" rx="15" ry="10" fill="#A8B0B8" ' + OUTLINE + '/>' +
           '<path d="M10 12 q7 -5 17 -2" fill="none" stroke="#1E2833" stroke-width="1.8" opacity=".4"/>' },
    { id: 'white', name: 'a pale round pebble', fill: '#EDE9E2',
      art: '<circle cx="20" cy="16" r="12" fill="#EDE9E2" ' + OUTLINE + '/>' },
    { id: 'glass', name: 'a piece of sea glass', fill: '#6FBFA4',
      art: '<path d="M7 20 l6 -13 l16 -2 l4 14 l-11 7z" fill="#6FBFA4" ' + OUTLINE + '/>' },
    { id: 'speck', name: 'a speckled stone', fill: '#B09A7E',
      art: '<ellipse cx="20" cy="16" rx="14" ry="11" fill="#B09A7E" ' + OUTLINE + '/>' +
           '<circle cx="15" cy="13" r="1.8" fill="#1E2833"/><circle cx="24" cy="18" r="1.6" fill="#1E2833"/>' +
           '<circle cx="21" cy="10" r="1.4" fill="#1E2833"/>' },
    { id: 'feather', name: 'a small dark feather', fill: '#8494A8',
      art: '<path d="M34 3 q-16 6 -22 16 q-4 7 0 10 q5 3 10 -2 q9 -9 12 -24z" fill="#8494A8" ' + OUTLINE + '/>' +
           '<path d="M32 6 L10 26" fill="none" stroke="#1E2833" stroke-width="1.8"/>' },
    { id: 'shell', name: 'a broken shell', fill: '#E8A874',
      art: '<path d="M20 28 q-15 -4 -14 -15 q10 -6 20 -4 q9 2 8 11 q-1 7 -14 8z" fill="#E8A874" ' + OUTLINE + '/>' +
           '<path d="M12 12 l6 15 M20 9 l1 19 M28 12 l-5 15" fill="none" stroke="#1E2833" ' +
           'stroke-width="1.6" opacity=".55"/>' }
  ];

  /* Three neighbours. Each one answers a gift by telling you something about
     itself, and the answers cycle rather than matching -- there is no right
     pebble for anybody, which is the whole point of the locution. */
  /* Staggered up the beach, and drawn smaller than you are. The first build put
     everybody at the same size on the same line and there was no telling which
     penguin you were steering -- which is a fairly basic thing for a game to
     get wrong and was invisible until it was looked at. Depth carries it now,
     and you are the one in front. */
  var NEIGHBOURS = [
    { name: 'the penguin near the water', x: 24, y: 72,
      lines: ['takes it and turns it over twice. “I like the ones that have been in the sea.”',
              'tucks it into the nest. “I have been standing here since before it got light.”',
              'holds on to it a while. “I do not always want to talk. I do want you to come over.”',
              'sets it down carefully. “That is the fourth thing you have brought me. I am not counting. I just noticed.”'] },
    { name: 'the penguin up the beach', x: 56, y: 80,
      lines: ['takes it without looking up. “Thank you. I am in the middle of something.”',
              'turns it to the light. “This one is the same colour as the sky today.”',
              'puts it straight in the nest. “I keep everything. That is not a problem I have.”',
              'stops. “You did not have to come all the way over here.”'] },
    { name: 'the penguin by the tussock', x: 84, y: 76,
      lines: ['takes it gently. “I was thinking about you earlier and then I forgot to say.”',
              'adds it to the pile. “I am building this very slowly. There is no finish.”',
              'looks at it for a long moment. “Nobody asks me what I like. You keep guessing.”',
              'nudges it into place. “You can just stand here if you want. You do not have to give me anything.”'] }
  ];

  var you = { x: 40, y: 78, face: 1, pose: 'stand', carrying: null, step: 0, lean: 0 };
  var pebbles = [], nests = [], mine = null;
  var running = false, paused = false, last = 0, raf = 0, held = {};
  var giftClock = 14;

  function say(t) { if (says) says.textContent = t; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function place(el, x, y) { el.style.left = x + '%'; el.style.top = y + '%'; }

  function note(line) {
    if (!log) return;
    var li = document.createElement('li');
    li.textContent = line;
    log.insertBefore(li, log.firstChild);
    while (log.children.length > 6) log.removeChild(log.lastChild);
  }

  function setPose(el, name) {
    var poses = el.querySelectorAll('.pose');
    for (var i = 0; i < poses.length; i++) {
      if (poses[i].dataset.pose === name) poses[i].setAttribute('data-on', '');
      else poses[i].removeAttribute('data-on');
    }
  }

  function svgEl(cls, viewBox, inner) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('class', cls);
    el.setAttribute('viewBox', viewBox);
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = inner;
    return el;
  }

  function dropPebble(thing, x, y) {
    var el = svgEl('pebble', '0 0 40 32', thing.art);
    place(el, x, y);
    shore.appendChild(el);
    pebbles.push({ thing: thing, x: x, y: y, el: el });
  }

  function nestArt(count) {
    /* A RING OF STONES, not a flat disc. The first version drew the nest as one
       filled ellipse and it read as a puddle the penguins were standing in. A
       nest is a rim with a hollow, which is also what the animal actually
       builds. */
    var s = '<ellipse cx="50" cy="58" rx="40" ry="17" fill="none" stroke="#1E2833" ' +
            'stroke-width="3"/>';
    for (var k = 0; k < 9; k++) {
      var a = Math.PI * 2 * (k / 9);
      s += '<ellipse cx="' + (50 + Math.cos(a) * 40).toFixed(1) + '" cy="'
        + (58 + Math.sin(a) * 17).toFixed(1) + '" rx="8" ry="6" fill="#A69C90" '
        + 'stroke="#1E2833" stroke-width="2.6"/>';
    }
    /* The nest grows as things go into it. It is THEIRS and it is not a score:
       nothing anywhere adds these up, and yours grows from gifts you did not
       ask for. */
    /* What has been given sits INSIDE the rim, and it is not a score: nothing
       anywhere adds these up, and your own nest fills with things nobody was
       repaying you for. */
    for (var i = 0; i < count && i < 10; i++) {
      var col = (i % 5) * 16 + 26, row = Math.floor(i / 5);
      s += '<ellipse cx="' + col + '" cy="' + (60 - row * 8) + '" rx="7" ry="5.5" fill="'
        + THINGS[i % THINGS.length].fill + '" stroke="#1E2833" stroke-width="2.4"/>';
    }
    return s;
  }

  function drawNest(n) {
    n.el.innerHTML = nestArt(n.count);
  }

  /* ── Setting the beach out ──────────────────────────────────────────────── */
  function build() {
    for (var i = 0; i < NEIGHBOURS.length; i++) {
      var nb = NEIGHBOURS[i];
      var nest = svgEl('nest', '0 0 100 80', nestArt(0));
      nest.classList.add('nest--theirs');
      place(nest, nb.x + 7, nb.y);
      shore.appendChild(nest);

      var peng = document.createElement('div');
      peng.className = 'peng peng--them';
      peng.setAttribute('aria-hidden', 'true');
      peng.innerHTML = '<svg viewBox="0 0 100 100">' + me.querySelector('svg').innerHTML + '</svg>';
      place(peng, nb.x - 8, nb.y);
      shore.appendChild(peng);
      setPose(peng, 'stand');

      nests.push({ name: nb.name, lines: nb.lines, x: nb.x, y: nb.y, count: 0, said: 0, el: nest, peng: peng });
    }

    /* Your own nest, so that what other penguins bring you has somewhere to go. */
    var own = svgEl('nest', '0 0 100 80', nestArt(0));
    own.classList.add('nest--yours');
    place(own, 10, BACK - 3);
    shore.appendChild(own);
    mine = { name: 'your own nest', x: 10, count: 0, el: own };

    for (var j = 0; j < 9; j++) {
      dropPebble(pick(THINGS), rand(16, 94), rand(SAND + 6, BACK - 6));
    }
  }

  function nearestNest() {
    for (var i = 0; i < nests.length; i++) {
      if (Math.abs(nests[i].x - you.x) < 10 && you.y > SAND) return nests[i];
    }
    return null;
  }

  /* ── The loop ───────────────────────────────────────────────────────────── */
  function step(now) {
    raf = window.requestAnimationFrame(step);
    if (!running || paused) { last = now; return; }
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    var s = SPEEDS[speed];

    var dx = 0, dy = 0;
    if (held.left) dx -= 1;
    if (held.right) dx += 1;
    if (held.up) dy -= 1;
    if (held.down) dy += 1;

    if (dx || dy) {
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      you.x += (dx / len) * s.walk * dt;
      you.y += (dy / len) * s.walk * dt * ASPECT;
      if (dx < -0.01) you.face = -1;
      if (dx > 0.01) you.face = 1;
      you.step += dt;
      you.pose = (Math.floor(you.step * 5) % 2) ? 'waddle' : 'stand';
    } else if (you.lean <= 0) {
      you.pose = 'stand';
    }

    if (you.lean > 0) { you.lean -= dt; you.pose = 'give'; }

    you.x = Math.max(6, Math.min(94, you.x));
    you.y = Math.max(SAND + 2, Math.min(BACK, you.y));
    place(me, you.x, you.y);
    me.setAttribute('data-face', you.face < 0 ? 'left' : 'right');
    setPose(me, you.pose);

    if (!you.carrying) {
      for (var i = pebbles.length - 1; i >= 0; i--) {
        var pb = pebbles[i];
        var ax = pb.x - you.x, ay = (pb.y - you.y) / ASPECT;
        if (Math.sqrt(ax * ax + ay * ay) < 6) {
          if (pb.el.parentNode) pb.el.parentNode.removeChild(pb.el);
          pebbles.splice(i, 1);
          you.carrying = pb.thing;
          me.setAttribute('data-carrying', '');
          me.querySelector('.beakful ellipse').setAttribute('fill', pb.thing.fill);
          say('You picked up ' + pb.thing.name + '. Carry it to somebody, or put it down, '
            + 'or just keep it. All three are fine.');
        }
      }
    }

    /* They bring you things on their own clock, whether or not you have ever
       given them anything. That is the difference between pebbling and trading,
       and it is a timer rather than a trigger on purpose. */
    giftClock -= dt;
    if (giftClock <= 0) {
      giftClock = rand(16, 30);
      mine.count++;
      drawNest(mine);
      var who = pick(nests);
      var what = pick(THINGS);
      say(who.name + ' came over and left ' + what.name + ' by your nest, then went back. '
        + 'You had not given them anything for it. That is not how this works.');
      note('somebody left you ' + what.name);
    }

    if (pebbles.length < 6) dropPebble(pick(THINGS), rand(16, 94), rand(SAND + 6, BACK - 6));
  }

  /* ── Giving ─────────────────────────────────────────────────────────────── */
  function give() {
    if (!running) return;
    if (!you.carrying) {
      say('You are not carrying anything. There are pebbles all over the beach.');
      return;
    }
    var n = nearestNest();
    you.lean = 0.5;
    if (!n) {
      /* Putting one down is a real thing to do with it. */
      dropPebble(you.carrying, you.x, you.y);
      say('You put ' + you.carrying.name + ' down. Nobody minds.');
      you.carrying = null;
      me.removeAttribute('data-carrying');
      return;
    }
    var line = n.lines[n.said % n.lines.length];
    n.said++;
    n.count++;
    drawNest(n);
    say('You gave ' + you.carrying.name + ' to ' + n.name + ', who ' + line);
    note('gave ' + you.carrying.name + ' to ' + n.name);
    you.carrying = null;
    me.removeAttribute('data-carrying');
  }

  /* ── Starting and pausing ───────────────────────────────────────────────── */
  function start() {
    running = true; paused = false;
    shore.setAttribute('data-playing', '');
    build();
    place(me, you.x, you.y);
    setPose(me, 'stand');
    if (rest) { rest.hidden = false; rest.setAttribute('aria-pressed', 'false'); rest.textContent = 'PAUSE'; }
    var ctl = document.querySelectorAll('.shore-control');
    for (var i = 0; i < ctl.length; i++) ctl[i].hidden = false;
    say('A beach with pebbles on it and three neighbours who each have a nest. Pick something '
      + 'up by walking into it and press GIVE beside somebody. Nothing here is counted, nothing '
      + 'is owed back, and there is no wrong thing to give anybody.');
    shore.focus();
    last = performance.now();
    if (!raf) raf = window.requestAnimationFrame(step);
  }

  function setRest(on) {
    paused = on;
    if (!rest) return;
    rest.setAttribute('aria-pressed', String(on));
    rest.textContent = on ? 'CARRY ON' : 'PAUSE';
    say(on ? 'Paused. The beach is holding still.' : 'Going again.');
  }

  if (coin) { coin.hidden = false; coin.addEventListener('click', start); }
  if (nojs) nojs.hidden = true;
  if (rest) rest.addEventListener('click', function () { setRest(!paused); });

  /* ── Controls ───────────────────────────────────────────────────────────── */
  var KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
               w: 'up', a: 'left', s: 'down', d: 'right',
               W: 'up', A: 'left', S: 'down', D: 'right' };

  shore.setAttribute('tabindex', '0');
  shore.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { shore.blur(); held = {}; say('The beach let go of the keys.'); return; }
    var k = KEYS[e.key];
    if (k) { held[k] = true; e.preventDefault(); return; }
    if (e.key === 'g' || e.key === 'G' || e.key === ' ') { give(); e.preventDefault(); }
  });
  shore.addEventListener('keyup', function (e) {
    var k = KEYS[e.key];
    if (k) { held[k] = false; e.preventDefault(); }
  });
  shore.addEventListener('blur', function () { held = {}; });

  var pads = document.querySelectorAll('.shore-pad button[data-go]');
  for (var pi = 0; pi < pads.length; pi++) {
    (function (b) {
      var dir = b.dataset.go, pointer = false;
      b.addEventListener('pointerdown', function () { pointer = true; held[dir] = true; b.setAttribute('data-held', ''); });
      function release() { held[dir] = false; b.removeAttribute('data-held'); }
      b.addEventListener('pointerup', release);
      b.addEventListener('pointerleave', release);
      b.addEventListener('pointercancel', release);
      b.addEventListener('click', function () {
        if (pointer) { pointer = false; return; }
        if (!running) return;
        if (dir === 'left') { you.x -= 7; you.face = -1; }
        if (dir === 'right') { you.x += 7; you.face = 1; }
        if (dir === 'up') { you.y -= 7 * ASPECT; }
        if (dir === 'down') { you.y += 7 * ASPECT; }
      });
    }(pads[pi]));
  }

  var acts = document.querySelectorAll('.shore-control[data-act]');
  for (var ai = 0; ai < acts.length; ai++) {
    acts[ai].addEventListener('click', function () {
      if (this.dataset.act === 'give') give();
    });
  }

  var knobs = document.querySelectorAll('.knob[data-shore-speed]');
  function setSpeed(k, announce) {
    if (!SPEEDS[k]) k = 'steady';
    speed = k;
    for (var i = 0; i < knobs.length; i++) {
      knobs[i].setAttribute('aria-pressed', String(knobs[i].dataset.shoreSpeed === k));
    }
    if (announce) say('Speed: ' + SPEEDS[k].note + '. The beach’s own knob, not the room’s dial.');
  }
  for (var ki = 0; ki < knobs.length; ki++) {
    knobs[ki].addEventListener('click', function () { setSpeed(this.dataset.shoreSpeed, true); });
  }
  setSpeed(document.documentElement.getAttribute('data-intensity') === 'gentle' ? 'slow' : 'steady', false);
})();
