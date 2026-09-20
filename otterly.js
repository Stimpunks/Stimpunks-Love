/* =============================================================================
   Otterly Adorbs — the second cabinet in the Arcade.

   WHAT THIS IS BUILT OUT OF. Not a cute animal picked for being cute. The
   Stimpunks Solidarity Session leaves an otter cam running every Saturday while
   the conversation drifts in and out — cameras on or off, some speaking, some
   in text, nobody required to watch. Helen Edgar wrote down what that was doing
   for her in "Stimpunks Solidarity and Otters" (Autistic Realms, 2026), and
   Star Stuff's zine No. 58, The Stone You Keep, went to the primary literature
   behind it. Every mechanic below is one of those findings, and the room says
   which:

     · THERE IS NO STANDARD OTTER. Under food limitation a population does not
       converge on one best way to be an otter; it fans out into individual
       specialists, each measurably better at its own prey (Tinker, Bentall &
       Estes 2008). So the other otters here each keep their own rhythm and
       nothing ever ranks them.
     · A MUSSEL TAKES SIX TO EIGHTY-EIGHT BLOWS, mean 35.5, same animal, same
       tool, same job (Hall & Schaller 1964). Cracking takes however many
       presses it takes. The room reports YOUR number and never a target.
     · SOME OTTERS NEVER USE A STONE, and they are not the ones who have not
       worked it out — they specialise on prey a stone would not help with, and
       the tool users show less tooth damage (Law et al. 2024). Both routes are
       here and neither is scored.
     · THE KELP DOES THE HOLDING. Otters raft and anchor in kelp so that sleep
       does not mean drifting. Float in the fronds and you stay; float in open
       water and you drift. Co-regulation stated as physics.

   WHAT IT MUST NOT DO, and this is the sharp one: zine No. 58 refuses "rest so
   you can produce" in as many words — the otter is not recharging in order to
   forage better tomorrow. SO FLOATING FILLS NOTHING. No meter, no stamina, no
   bonus afterwards. It is a thing you may do because you want to, and the
   cabinet says so out loud rather than quietly paying you for it. Wiring a
   reward to rest would have put a sentence on this page that another of our
   pages spends a spread refusing.

   TWO MORE REFUSALS INHERITED FROM THE ZINE. No hand-holding: rafting and
   kelp-anchoring are real, the sweethearts-asleep-holding-hands story is one
   the internet tells. And no lifelong favourite rock in a pouch — the primary
   supports a stone kept and reused across successive food items within a bout
   of feeding, and nothing longer, so that is all this does.

   NO DOM ELEMENT IS EVER ROTATED, here as in Quill Drift. A trick is a run of
   drawn frames; the angled poses are rotated inside their own <svg>, where a
   transform is part of the picture. check-gentle.py can read every element in
   this room and find nothing turning, whether the cabinet is running or not.
   ============================================================================= */
(function () {
  'use strict';

  var bay = document.getElementById('bay');
  if (!bay) return;

  var me      = document.getElementById('otter');
  var attract = document.getElementById('bay-attract');
  var coin    = document.getElementById('bay-coin');
  var rest    = document.getElementById('bay-rest');
  var says    = document.getElementById('bay-says');
  var log     = document.getElementById('bay-log');
  var nojs    = document.getElementById('bay-nojs');

  var ASPECT = 8 / 5;
  function measure() {
    var r = bay.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) ASPECT = r.width / r.height;
  }
  measure();
  window.addEventListener('resize', measure);

  var SURFACE = 18;   /* the waterline, in per cent of the bay's height */
  var BED = 90;

  var SPEEDS = {
    slow:   { swim: 16, drift: 2.2, note: 'Slow' },
    steady: { swim: 24, drift: 3.4, note: 'Steady' },
    quick:  { swim: 33, drift: 4.6, note: 'Quick' }
  };
  var speed = 'steady';

  /* ── State ──────────────────────────────────────────────────────────────── */
  var you = { x: 40, y: 34, face: 1, pose: 'swim', trick: null, t: 0, floating: false, stone: false };
  var others = [], fish = [], stones = [], shells = [], kelpAt = [];
  var running = false, paused = false, last = 0, raf = 0;
  var held = {};
  var feeding = false, feedClock = 22, blows = 0, cracking = null;
  var caught = 0, cracked = 0;

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

  /* ── Poses ──────────────────────────────────────────────────────────────── */
  /* Every trick is a list of [pose, seconds]. Nothing here rotates anything;
     the angled poses are separate drawings. */
  var TRICKS = {
    twirl:      [['tuck', .16], ['float', .16], ['tuck', .16], ['swim', .12]],
    somersault: [['dive', .14], ['tuck', .18], ['up', .14], ['swim', .12]],
    dive:       [['dive', .5], ['swim', .12]]
  };

  function setPose(el, name) {
    var poses = el.querySelectorAll('.pose');
    for (var i = 0; i < poses.length; i++) {
      if (poses[i].dataset.pose === name) poses[i].setAttribute('data-on', '');
      else poses[i].removeAttribute('data-on');
    }
  }

  function startTrick(who, name) {
    if (!TRICKS[name]) return;
    who.trick = { name: name, step: 0, left: TRICKS[name][0][1] };
    who.pose = TRICKS[name][0][0];
  }

  function advanceTrick(who, dt) {
    if (!who.trick) return;
    who.trick.left -= dt;
    if (who.trick.left > 0) return;
    who.trick.step++;
    var seq = TRICKS[who.trick.name];
    if (who.trick.step >= seq.length) { who.trick = null; who.pose = who.floating ? 'float' : 'swim'; return; }
    who.pose = seq[who.trick.step][0];
    who.trick.left = seq[who.trick.step][1];
  }

  /* ── The bay's furniture ────────────────────────────────────────────────── */
  function svgEl(cls, viewBox, inner, w) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('class', cls);
    el.setAttribute('viewBox', viewBox);
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = inner;
    if (w) el.style.width = w;
    return el;
  }

  function buildScenery() {
    /* Kelp. Where it grows is where a floating otter stays put, so the
       positions are state and not decoration. */
    kelpAt = [14, 30, 58, 82];
    for (var i = 0; i < kelpAt.length; i++) {
      var f = svgEl('frond', '0 0 40 300',
        '<path d="M20 300 C 6 230, 32 190, 18 130 C 8 86, 28 50, 20 4" fill="none" ' +
        'stroke="#6FB050" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M20 250 q16 -12 20 2 M20 200 q-16 -12 -20 2 M20 150 q16 -12 20 2 ' +
        'M20 100 q-16 -12 -20 2 M20 56 q16 -12 20 2" fill="none" stroke="#7ABF5A" ' +
        'stroke-width="5" stroke-linecap="round"/>');
      f.style.left = kelpAt[i] + '%';
      f.style.height = (100 - SURFACE - 6) + '%';
      bay.appendChild(f);
    }

    /* Cobbles on the bed. A stone is optional and always has been. */
    [22, 46, 68, 88].forEach(function (x) {
      var c = svgEl('cobble', '0 0 40 30',
        '<ellipse cx="20" cy="18" rx="17" ry="11" fill="#A9BAC6" stroke="#0B0413" stroke-width="2.6"/>' +
        '<path d="M10 14 q8 -5 18 -1" fill="none" stroke="#0B0413" stroke-width="1.6" opacity=".45"/>');
      stones.push({ x: x, y: BED - 3, el: c, taken: false });
      place(c, x, BED - 3);
      bay.appendChild(c);
    });

    /* Two kinds of shellfish, which is Law et al. rather than decoration: the
       clam is what a stone helps with, the urchin opens under a bite. */
    [[34, 'clam'], [76, 'urchin']].forEach(function (s) {
      var isClam = s[1] === 'clam';
      var el = svgEl('shelly', '0 0 40 34', isClam
        ? '<path d="M20 30 q-16 0 -16 -11 q0 -12 16 -12 q16 0 16 12 q0 11 -16 11z" fill="#E8D6B6" ' +
          'stroke="#0B0413" stroke-width="2.6"/><path d="M20 7 v23 M9 11 l6 19 M31 11 l-6 19" ' +
          'fill="none" stroke="#0B0413" stroke-width="1.5" opacity=".5"/>'
        : '<circle cx="20" cy="19" r="11" fill="#B79AE0" stroke="#0B0413" stroke-width="2.6"/>' +
          '<path d="M20 4 v6 M20 28 v6 M5 19 h6 M29 19 h6 M9 8 l4 4 M31 8 l-4 4 M9 30 l4 -4 M31 30 l-4 -4" ' +
          'stroke="#0B0413" stroke-width="2.2" stroke-linecap="round"/>');
      shells.push({ x: s[0], y: BED - 4, kind: s[1], el: el, open: false });
      place(el, s[0], BED - 4);
      bay.appendChild(el);
    });
  }

  /* The other otters. Each keeps its own rhythm and the game never compares
     them -- there is no standard otter, and a leaderboard would be the one
     sentence this cabinet is built to refuse. */
  var OTHERS = [
    { name: 'the otter in the kelp', bias: 'float', x: 30, y: 22 },
    { name: 'the otter down by the stones', bias: 'dive', x: 70, y: 62 },
    { name: 'the otter going round and round', bias: 'twirl', x: 54, y: 30 }
  ];

  /* The other otters are clones of the player's own drawing. The poses are
     built from <use> pointing at one <defs> block in the page, so cloning
     three more otters duplicates no ids -- they all reference the one otter. */
  function otterMarkup() {
    return document.querySelector('#otter svg').innerHTML;
  }

  function buildOthers() {
    for (var i = 0; i < OTHERS.length; i++) {
      var o = OTHERS[i];
      var el = document.createElement('div');
      el.className = 'otter';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = '<svg viewBox="0 0 100 100">' + otterMarkup() + '</svg>';
      bay.appendChild(el);
      var st = { name: o.name, bias: o.bias, x: o.x, y: o.y, face: 1, pose: 'swim',
                 trick: null, floating: o.bias === 'float', el: el,
                 vx: rand(-1, 1), vy: rand(-.4, .4), next: rand(2, 6) };
      setPose(el, 'swim');
      place(el, st.x, st.y);
      others.push(st);
    }
  }

  function inKelp(x) {
    for (var i = 0; i < kelpAt.length; i++) if (Math.abs(x - kelpAt[i]) < 6) return true;
    return false;
  }

  /* ── The loop ───────────────────────────────────────────────────────────── */
  function step(now) {
    raf = window.requestAnimationFrame(step);
    if (!running || paused) { last = now; return; }
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    var s = SPEEDS[speed];

    /* You. */
    var dx = 0, dy = 0;
    if (held.left) dx -= 1;
    if (held.right) dx += 1;
    if (held.up) dy -= 1;
    if (held.down) dy += 1;

    if (dx || dy) {
      if (you.floating) stopFloat('You rolled back over.');
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      you.x += (dx / len) * s.swim * dt;
      you.y += (dy / len) * s.swim * dt * ASPECT;
      if (dx < -0.01) you.face = -1;
      if (dx > 0.01) you.face = 1;
      if (!you.trick) you.pose = dy > 0.4 ? 'dive' : (dy < -0.4 ? 'up' : 'swim');
    } else if (you.floating) {
      /* THE KELP DOES THE HOLDING. In the fronds you stay where you are; in
         open water you drift, and nothing is lost either way. */
      if (!inKelp(you.x)) you.x += (you.x > 50 ? 1 : -1) * s.drift * dt * 0.8;
      you.y += (SURFACE + 3 - you.y) * dt * 2;
    } else {
      /* An otter is buoyant, so doing nothing takes you up. Playtested at 5,
         which is about 8 per cent of the bay a second, and it pulled you off
         the bed before you could pick a stone up -- the buoyancy was winning an
         argument the player was trying to have with a clam. It is 2 now, and it
         stops entirely while you are working on a shell, because an otter
         cracking something is holding itself there and that is the whole
         posture. */
      if (!cracking) you.y -= 2 * dt * ASPECT;
      if (!you.trick) you.pose = 'swim';
    }

    you.x = Math.max(8, Math.min(92, you.x));
    you.y = Math.max(SURFACE + 2, Math.min(BED - 4, you.y));
    advanceTrick(you, dt);
    place(me, you.x, you.y);
    me.setAttribute('data-face', you.face < 0 ? 'left' : 'right');
    setPose(me, you.floating && !you.trick ? 'float' : you.pose);

    /* The others, each on their own clock. */
    for (var i = 0; i < others.length; i++) {
      var o = others[i];
      o.next -= dt;
      if (o.next <= 0) {
        o.next = rand(2.5, 7);
        if (o.bias === 'float') { o.floating = !o.floating; }
        else startTrick(o, o.bias === 'dive' ? pick(['dive', 'somersault']) : 'twirl');
        o.vx = rand(-1, 1); o.vy = rand(-.5, .5);
      }
      if (!o.floating) {
        o.x += o.vx * s.drift * dt * 2.2;
        o.y += o.vy * s.drift * dt * 2.2 * ASPECT;
      } else {
        o.y += (SURFACE + 3 - o.y) * dt * 2;
      }
      if (o.x < 8 || o.x > 92) o.vx *= -1;
      if (o.y < SURFACE + 2 || o.y > BED - 4) o.vy *= -1;
      o.x = Math.max(8, Math.min(92, o.x));
      o.y = Math.max(SURFACE + 2, Math.min(BED - 4, o.y));
      if (o.vx < 0) o.face = -1; else o.face = 1;
      advanceTrick(o, dt);
      place(o.el, o.x, o.y);
      o.el.setAttribute('data-face', o.face < 0 ? 'left' : 'right');
      setPose(o.el, o.floating && !o.trick ? 'float' : o.pose);
    }

    /* Feeding time arrives on its own and leaves on its own. There is no clock
       on screen and nothing is lost by ignoring the whole thing; it comes
       round again. */
    feedClock -= dt;
    if (feedClock <= 0) {
      if (feeding) { endFeeding(); } else { startFeeding(); }
    }

    for (var f = fish.length - 1; f >= 0; f--) {
      var fi = fish[f];
      fi.x += fi.vx * s.drift * dt * 3;
      fi.y += Math.sin(now / 600 + fi.phase) * 4 * dt;
      place(fi.el, fi.x, fi.y);
      fi.el.setAttribute('data-face', fi.vx < 0 ? 'left' : 'right');
      if (fi.x < -8 || fi.x > 108) { drop(fi.el); fish.splice(f, 1); continue; }
      var ax = fi.x - you.x, ay = (fi.y - you.y) / ASPECT;
      if (Math.sqrt(ax * ax + ay * ay) < 7) {
        drop(fi.el); fish.splice(f, 1);
        caught++;
        say('Caught one. That is ' + caught + (caught === 1 ? ' fish.' : ' fish.')
          + ' Nothing is counting it against anything.');
      }
    }

    /* A stone, if you want one. Some otters never pick one up and the cabinet
       does not mind. */
    if (!you.stone) {
      for (var st = 0; st < stones.length; st++) {
        var c = stones[st];
        if (c.taken) continue;
        var sx = c.x - you.x, sy = (c.y - you.y) / ASPECT;
        if (Math.sqrt(sx * sx + sy * sy) < 6.5) {
          c.taken = true; c.el.style.display = 'none';
          you.stone = true; me.setAttribute('data-carrying', '');
          say('You picked up a stone. You can crack a clam with it, or put it '
            + 'down and open things the other way. Both work.');
          note('picked up a stone');
        }
      }
    }
  }

  function drop(el) { if (el.parentNode) el.parentNode.removeChild(el); }

  function startFeeding() {
    feeding = true; feedClock = 20;
    for (var i = 0; i < 7; i++) {
      var fromLeft = Math.random() < 0.5;
      var el = svgEl('fish', '0 0 40 24',
        '<path d="M34 12 q-8 -9 -18 -9 q-12 0 -12 9 q0 9 12 9 q10 0 18 -9z" fill="#CFE2F2" ' +
        'stroke="#0B0413" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M34 12 l6 -6 v12z" fill="#CFE2F2" stroke="#0B0413" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<circle cx="12" cy="9" r="1.8" fill="#0B0413"/>');
      var f = { x: fromLeft ? rand(-6, 2) : rand(98, 106), y: rand(SURFACE + 5, BED - 10),
                vx: fromLeft ? rand(.6, 1.2) : rand(-1.2, -.6), phase: rand(0, 6), el: el };
      bay.appendChild(el);
      place(el, f.x, f.y);
      fish.push(f);
    }
    say('Feeding time. Fish are coming through. Swim into one if you feel like it — '
      + 'and it is fine not to. It comes round again.');
    note('feeding time started');
  }

  function endFeeding() {
    feeding = false; feedClock = 26;
    for (var i = 0; i < fish.length; i++) drop(fish[i].el);
    fish = [];
    say('Feeding time is over. Nothing was missed; there was nothing to miss.');
  }

  /* ── Floating, and what it does not do ──────────────────────────────────── */
  function startFloat() {
    if (you.floating) return;
    you.floating = true; you.trick = null;
    say(inKelp(you.x)
      ? 'On your back, in the kelp. The kelp is holding you — you are not holding '
        + 'yourself there. Nothing is filling up while you do this. That is the point of it.'
      : 'On your back, in open water, drifting. Nothing is filling up while you do '
        + 'this. Float in the kelp if you would rather stay put.');
    note('floated on your back');
  }

  function stopFloat(msg) {
    if (!you.floating) return;
    you.floating = false;
    if (msg) say(msg);
  }

  /* ── Cracking: however many blows it takes ──────────────────────────────── */
  function crack() {
    if (!running) return;
    var near = null;
    for (var i = 0; i < shells.length; i++) {
      var sh = shells[i];
      if (sh.open) continue;
      var ax = sh.x - you.x, ay = (sh.y - you.y) / ASPECT;
      if (Math.sqrt(ax * ax + ay * ay) < 9) { near = sh; break; }
    }
    if (!near) {
      say('Nothing here to open. The clam and the urchin are down on the bed.');
      return;
    }
    if (cracking !== near) {
      cracking = near; blows = 0;
      /* Hall & Schaller counted 30 instances over six days: a mussel took a
         mean of 35.5 blows and the range ran from 6 to 88. Those are the real
         numbers and this uses them unrounded. The urchin opens under a bite,
         which is why it takes fewer and why a stone does not help with it. */
      near.need = near.kind === 'clam'
        ? Math.round(rand(6, 88))
        : Math.round(rand(2, 9));
    }
    blows++;
    if (blows < cracking.need) {
      if (blows % 6 === 0) say(cracking.kind === 'clam'
        ? 'Still going. ' + blows + ' so far. There is no number you are supposed to be at.'
        : 'Working at it. ' + blows + ' so far.');
      return;
    }
    cracking.open = true;
    cracking.el.style.opacity = '.35';
    cracked++;
    if (cracking.kind === 'clam') {
      say('Open, in ' + blows + (blows === 1 ? ' blow' : ' blows') + '. Two observers on '
        + 'the California coast in 1964 watched otters take between 6 and 88 blows to open '
        + 'a mussel, averaging 35.5. There is no correct number. There is your number.');
      note('opened the clam in ' + blows);
    } else {
      say('The urchin opens under a bite — ' + blows + (blows === 1 ? ' go' : ' goes')
        + ', and a stone would not have helped. Some otters never carry one; they are on the '
        + 'prey that does not need it.');
      note('opened the urchin in ' + blows);
    }
    cracking = null;
  }

  /* ── Starting and resting ───────────────────────────────────────────────── */
  function start() {
    running = true; paused = false;
    bay.setAttribute('data-playing', '');
    buildScenery();
    buildOthers();
    place(me, you.x, you.y);
    setPose(me, 'swim');
    if (rest) { rest.hidden = false; rest.setAttribute('aria-pressed', 'false'); rest.textContent = 'PAUSE'; }
    var others_ = document.querySelectorAll('.bay-control');
    for (var i = 0; i < others_.length; i++) others_[i].hidden = false;
    say('You are the otter with the whiskers you are steering. The other three are doing '
      + 'their own thing on their own clock and none of you is doing it better. Arrows, WASD '
      + 'or the pad; Escape gives the keys back.');
    bay.focus();
    last = performance.now();
    if (!raf) raf = window.requestAnimationFrame(step);
  }

  function setRest(on) {
    paused = on;
    if (!rest) return;
    rest.setAttribute('aria-pressed', String(on));
    rest.textContent = on ? 'CARRY ON' : 'PAUSE';
    say(on ? 'Paused. The bay is holding still. This is the cabinet stopping, which is a '
           + 'different thing from the otter resting — that one is a button of its own.'
           : 'Going again.');
  }

  if (coin) { coin.hidden = false; coin.addEventListener('click', start); }
  if (nojs) nojs.hidden = true;
  if (rest) rest.addEventListener('click', function () { setRest(!paused); });

  /* ── Controls ───────────────────────────────────────────────────────────── */
  var KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
               w: 'up', a: 'left', s: 'down', d: 'right',
               W: 'up', A: 'left', S: 'down', D: 'right' };

  bay.setAttribute('tabindex', '0');
  bay.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { bay.blur(); held = {}; say('The bay let go of the keys.'); return; }
    var k = KEYS[e.key];
    if (k) { held[k] = true; e.preventDefault(); return; }
    if (!running) return;
    if (e.key === '1') { startTrick(you, 'twirl'); e.preventDefault(); }
    if (e.key === '2') { startTrick(you, 'somersault'); e.preventDefault(); }
    if (e.key === '3') { startTrick(you, 'dive'); e.preventDefault(); }
    if (e.key === 'f' || e.key === 'F') { you.floating ? stopFloat('Back over.') : startFloat(); e.preventDefault(); }
    if (e.key === 'c' || e.key === 'C') { crack(); e.preventDefault(); }
  });
  bay.addEventListener('keyup', function (e) {
    var k = KEYS[e.key];
    if (k) { held[k] = false; e.preventDefault(); }
  });
  bay.addEventListener('blur', function () { held = {}; });

  var pads = document.querySelectorAll('.bay-pad button[data-go]');
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
        if (dir === 'down') { you.y += 7 * ASPECT; if (you.floating) stopFloat('You rolled back over.'); }
      });
    }(pads[pi]));
  }

  var acts = document.querySelectorAll('.bay-control[data-act]');
  for (var ai = 0; ai < acts.length; ai++) {
    acts[ai].addEventListener('click', function () {
      if (!running) return;
      var a = this.dataset.act;
      if (a === 'float') { you.floating ? stopFloat('Back over.') : startFloat(); return; }
      if (a === 'crack') { crack(); return; }
      startTrick(you, a);
    });
  }

  var knobs = document.querySelectorAll('.knob[data-bay-speed]');
  function setSpeed(k, announce) {
    if (!SPEEDS[k]) k = 'steady';
    speed = k;
    for (var i = 0; i < knobs.length; i++) {
      knobs[i].setAttribute('aria-pressed', String(knobs[i].dataset.baySpeed === k));
    }
    if (announce) say('Speed: ' + SPEEDS[k].note + '. The bay’s own knob, not the room’s dial.');
  }
  for (var ki = 0; ki < knobs.length; ki++) {
    knobs[ki].addEventListener('click', function () { setSpeed(this.dataset.baySpeed, true); });
  }
  setSpeed(document.documentElement.getAttribute('data-intensity') === 'gentle' ? 'slow' : 'steady', false);
})();
