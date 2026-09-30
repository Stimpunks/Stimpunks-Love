/* =============================================================================
   Pando Calrissian: the tree, the can, and the fence round the new growth.
   Ryan's brief, 2026-09-30, after the grow-a-tree game in our Discord's
   Collaborative Nonsense channels.

   THE GROVE IS DRAWN FROM ONE NUMBER, the times the tree has been watered, and
   from nothing else, so everybody who opens the page sees the same grove. Every
   watering sends up one sucker; each grows over the waterings after it and
   falls when it is LIFE waterings old, and the root spreads along the hill as
   the count rises. Where each stem stands and how tall it can get come from a
   hash of its own number, so a stem is always the same stem. There is no size
   the grove is growing towards and nothing happens at any number.

   IT COUNTS WATER AND NEVER WATERERS. Watering sends the CB pass the radio
   keeps in love-cb, which this file reads and never writes, and the answer
   carries the number and when the ground is dry again, and nothing about who.
   Nothing here is stored anywhere: not how often you watered, not when, not
   that you came.

   READ ONCE, NOT POLLED. The tree is read when the page opens and again after
   you water it or pin a note, because a tree is not a channel and nothing on
   the hill is waiting for you. It never claims what it has not read, which is
   the radio's rule: until the tree answers it says it is looking.

   NOTHING MOVES. The drawing is replaced whole when the number changes, with
   no transition, because the room says the grove is still at every setting.
   Every note goes in with textContent.
   ============================================================================= */
(function () {
  'use strict';

  var svg = document.getElementById('pdo-grove');
  var stemsG = document.getElementById('pdo-stems');
  var rootPath = document.getElementById('pdo-root');
  var says = document.getElementById('pdo-grove-says');
  var count = document.getElementById('pdo-count');
  if (!svg || !stemsG || !rootPath || !says || !count) return;

  var NS = 'http://www.w3.org/2000/svg';
  var LIFE = 240;      // waterings a stem stands for before it falls
  var TAU = 30;        // how many waterings a stem takes to get most of its height
  var FULL = 1500;     // the count at which the root has spread across the whole hill

  /* The hill, the same curve the page's static drawing was cut from. */
  function hill(x) { return 330 - 0.05 * x - 22 * Math.sin(Math.PI * x / 1000); }

  /* A stem's own numbers, from its own index: where it stands, how tall it can
     get, and where it sits in depth. mulberry32, seeded by the index. */
  function rand(i) {
    var a = (i * 2654435761) >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function spread(i) { return Math.min(1, 0.06 + Math.sqrt(i / FULL)); }

  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function grove(n) {
    var list = [];
    for (var i = Math.max(1, n - LIFE + 1); i <= n; i++) {
      var r = rand(i), half = spread(i) * 460;
      var x = 500 + (r() * 2 - 1) * half;
      var most = (90 + r() * 190) * (0.55 + 0.45 * spread(i));
      var age = n - i;
      var h = most * (0.06 + 0.94 * (1 - Math.exp(-age / TAU)));
      list.push({ x: x, h: h, depth: r() });
    }
    list.sort(function (a, b) { return a.depth - b.depth; });
    return list;
  }

  function draw(n) {
    var list = grove(n);
    while (stemsG.firstChild) stemsG.removeChild(stemsG.firstChild);
    list.forEach(function (s) {
      var base = hill(s.x), top = base - s.h, w = 2 + s.h / 60;
      var g = el('g', {});
      g.appendChild(el('path', { d: 'M' + s.x.toFixed(1) + ' ' + (base + 22).toFixed(1) + ' V' + base.toFixed(1),
        stroke: 'var(--pdo-root)', 'stroke-width': '1.2' }));
      g.appendChild(el('rect', { x: (s.x - w / 2).toFixed(1), y: top.toFixed(1), width: w.toFixed(1),
        height: s.h.toFixed(1), fill: 'url(#pdo-grove-bark)' }));
      if (s.h > 60) {
        [0.3, 0.55].forEach(function (f) {
          g.appendChild(el('ellipse', { cx: s.x.toFixed(1), cy: (base - s.h * f).toFixed(1),
            rx: (w * 0.42).toFixed(1), ry: '1.3', fill: 'var(--pdo-eye)' }));
        });
      }
      var rr = 3 + s.h / 18;
      g.appendChild(el('circle', { cx: (s.x - rr * 0.7).toFixed(1), cy: (top + rr * 0.7).toFixed(1), r: (rr * 0.8).toFixed(1), fill: 'var(--pdo-gold2)' }));
      g.appendChild(el('circle', { cx: (s.x + rr * 0.6).toFixed(1), cy: (top + rr * 0.6).toFixed(1), r: (rr * 0.75).toFixed(1), fill: 'var(--pdo-gold2)' }));
      g.appendChild(el('circle', { cx: s.x.toFixed(1), cy: top.toFixed(1), r: rr.toFixed(1), fill: 'var(--pdo-gold)' }));
      stemsG.appendChild(g);
    });
    /* The root: one line through the foot of every stem standing, a little past
       the ends, and a short one under bare ground before the first watering. */
    var xs = list.map(function (s) { return s.x; }).sort(function (a, b) { return a - b; });
    if (!xs.length) xs = [470, 530];
    var lo = Math.max(10, xs[0] - 24), hi = Math.min(990, xs[xs.length - 1] + 24);
    var d = 'M' + lo.toFixed(1) + ' ' + (hill(lo) + 24).toFixed(1);
    xs.forEach(function (x) { d += ' L' + x.toFixed(1) + ' ' + (hill(x) + 22).toFixed(1); });
    d += ' L' + hi.toFixed(1) + ' ' + (hill(hi) + 24).toFixed(1);
    rootPath.setAttribute('d', d);
    says.textContent = describe(n);
  }

  /* What the drawing shows, in words, without a count of stems: the number that
     matters is printed under it, and a second one would be a tally of trees. */
  function describe(n) {
    var lead = 'A hillside of aspen after sunset, the stems lit at the top and in shade at the foot. ';
    if (n === 0) return lead + 'Bare ground so far, and the root under it, with nothing up yet.';
    if (n < 6) return lead + 'A few suckers just up out of the ground, on the one root.';
    if (n < 60) return lead + 'A thicket of young suckers on the one root, the first of them already taller than the rest.';
    if (n < LIFE) return lead + 'A young grove on the one root: the oldest stems are up into the last of the light, and new suckers are still coming up between them.';
    if (spread(n) < 1) return lead + 'A grove on the one root, still spreading along the hill. The oldest stems fall and new ones come up, the way the real one does.';
    return lead + 'A grove across the whole hillside on the one root. The oldest stems fall and new ones come up between them, and the root goes on.';
  }

  function pass() {
    try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return v && v.pass ? v : null; }
    catch (e) { return null; }
  }

  function call(path, send, p) {
    var headers = { 'accept': 'application/json' };
    if (send) headers['content-type'] = 'application/json';
    if (p) headers['authorization'] = 'Bearer ' + p;
    return fetch(path, {
      method: send ? 'POST' : 'GET', headers: headers,
      body: send ? JSON.stringify(send) : undefined,
      credentials: 'omit', cache: 'no-store',
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; });
    });
  }

  /* The chalkboard's rule for what went wrong: our own sentence, or ours. */
  function why(r, otherwise) {
    if (r && r.body && typeof r.body.error === 'string' && r.body.error) return r.body.error;
    if (r && (r.status === 404 || r.status === 405)) {
      return 'The tree is not kept on this server. It only answers on stimpunks.world itself.';
    }
    return otherwise;
  }

  function when(t) {
    try { return new Date(t).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }); }
    catch (e) { return ''; }
  }

  function times(n) {
    var s;
    try { s = n.toLocaleString(); } catch (e) { s = String(n); }
    return s;
  }

  function seconds(ms) {
    var s = Math.max(1, Math.ceil(ms / 1000));
    if (s === 60) return 'a minute';
    return s === 1 ? 'a second' : s + ' seconds';
  }

  function showCount(n) {
    count.hidden = false;
    count.textContent = '';
    if (n === 0) {
      count.appendChild(document.createTextNode('Nobody has watered it yet. It was planted on 30 September 2026.'));
      return;
    }
    count.appendChild(document.createTextNode('Watered '));
    var b = document.createElement('b');
    b.textContent = times(n);
    count.appendChild(b);
    count.appendChild(document.createTextNode((n === 1 ? ' time' : ' times') + ' since it was planted on 30 September 2026.'));
  }

  var me = pass();
  var base = !!(me && (me.base || /^cb[12]\.base\./.test(me.pass)));
  var can = document.getElementById('pdo-can');
  var water = document.getElementById('pdo-water');
  var said = document.getElementById('pdo-said');
  var dryTimer = null;

  function say(t) { if (said) said.textContent = t; }

  /* The ground's wait, from the server's clock rather than the visitor's. */
  function wetFor(ms) {
    if (!water) return;
    clearTimeout(dryTimer);
    if (ms <= 0) { water.disabled = false; return; }
    water.disabled = true;
    dryTimer = setTimeout(function () {
      water.disabled = false;
      say('The ground has soaked it up. It will take more.');
    }, ms);
  }

  /* ── The fence ─────────────────────────────────────────────────────────── */
  var notes = document.getElementById('pdo-notes');
  var fenceState = document.getElementById('pdo-fence-state');
  var writeSaid = document.getElementById('pdo-write-said');
  function sayNote(t) { if (writeSaid) writeSaid.textContent = t; }

  function drawNotes(list) {
    if (!notes || !fenceState) return;
    notes.textContent = '';
    if (!list.length) {
      notes.hidden = true;
      fenceState.hidden = false;
      fenceState.textContent = 'Nothing on the fence this week.';
      return;
    }
    fenceState.hidden = true;
    notes.hidden = false;
    list.slice().reverse().forEach(function (n) {
      var li = document.createElement('li');
      li.className = 'pdo-note' + (n.base ? ' pdo-note--base' : '');
      var text = document.createElement('p');
      text.className = 'pdo-note__text';
      text.textContent = n.text;
      var by = document.createElement('p');
      by.className = 'pdo-note__by';
      by.textContent = '— ' + n.handle + (n.base ? ', the base station' : '') + ', ' + when(n.t);
      li.appendChild(text); li.appendChild(by);
      if (base) {
        var rub = document.createElement('button');
        rub.type = 'button';
        rub.className = 'pdo-btn pdo-btn--small';
        rub.textContent = 'Take this one down';
        rub.addEventListener('click', function () {
          rub.disabled = true;
          call('/cb/pando/rub', { remove: n.id }, me.pass).then(function (r) {
            if (r.status === 200 && r.body.notes) { drawNotes(r.body.notes); sayNote('Taken down.'); }
            else { rub.disabled = false; sayNote(why(r, 'That did not work. Try again in a moment.')); }
          }, function () { rub.disabled = false; sayNote('The fence could not be reached just now.'); });
        });
        li.appendChild(rub);
      }
      notes.appendChild(li);
    });
  }

  /* ── Reading the hill ──────────────────────────────────────────────────── */
  function read() {
    says.textContent = 'Looking at the tree…';
    if (fenceState) fenceState.textContent = 'Reading the fence…';
    call('/cb/pando').then(function (r) {
      if (r.status === 200 && typeof r.body.water === 'number') {
        draw(r.body.water);
        showCount(r.body.water);
        drawNotes(r.body.notes || []);
        var left = (r.body.wet || 0) + (r.body.soak || 0) - (r.body.now || 0);
        if (left > 0) { wetFor(left); say('The ground is still soaking up the last watering. It will take more in ' + seconds(left) + '.'); }
      } else {
        says.textContent = 'A hillside of aspen after sunset, with the root under it. The tree could not be read just now, so the grove is not drawn.';
        if (fenceState) fenceState.textContent = 'The fence could not be read just now.';
      }
    }, function () {
      says.textContent = 'A hillside of aspen after sunset, with the root under it. The tree could not be reached just now, so the grove is not drawn.';
      if (fenceState) fenceState.textContent = 'The fence could not be read just now.';
    });
  }
  read();

  /* ── The can ───────────────────────────────────────────────────────────── */
  var signon = document.getElementById('pdo-signon');
  var writeSignon = document.getElementById('pdo-write-signon');
  if (!me) {
    if (signon) signon.hidden = false;
    if (writeSignon) writeSignon.hidden = false;
    return;
  }

  if (can && water) {
    can.hidden = false;
    water.addEventListener('click', function () {
      water.disabled = true;
      say('Pouring…');
      call('/cb/pando/water', {}, me.pass).then(function (r) {
        if (r.status === 200 && typeof r.body.water === 'number') {
          draw(r.body.water);
          showCount(r.body.water);
          var left = (r.body.wet || 0) + (r.body.soak || 0) - (r.body.now || 0);
          if (r.body.poured) {
            say('Poured. Another sucker is coming up from the root. The ground will soak it up for ' + seconds(Math.max(left, 1000)) + '.');
            wetFor(Math.max(left, 1000));
          } else {
            say('The ground is still soaking up the last watering. It will take more in ' + seconds(r.body.soaks) + '.');
            wetFor(r.body.soaks);
          }
        } else if (r.status === 401) {
          water.disabled = false;
          say('The password has changed since you signed on. Sign on again at the Community Center, then come back.');
        } else {
          water.disabled = false;
          say(why(r, 'That did not pour. Try again in a moment.'));
        }
      }, function () { water.disabled = false; say('The tree could not be reached just now. Nothing was poured.'); });
    });
  }

  var write = document.getElementById('pdo-write');
  var form = document.getElementById('pdo-write-form');
  var box = document.getElementById('pdo-write-text');
  if (!write || !form || !box) return;
  write.hidden = false;
  document.getElementById('pdo-write-as').textContent = me.handle || 'you';
  var go = form.querySelector('.pdo-write__go');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = box.value.trim();
    if (!text) { sayNote('Write something first, then pin it up.'); box.focus(); return; }
    go.disabled = true;
    sayNote('Pinning it up…');
    call('/cb/pando/note', { text: text }, me.pass).then(function (r) {
      go.disabled = false;
      if (r.status === 200 && r.body.notes) {
        box.value = '';
        drawNotes(r.body.notes);
        sayNote('It is on the fence, at the top, for the week.');
      } else if (r.status === 401) {
        sayNote('The password has changed since you signed on. Sign on again at the Community Center, then come back.');
      } else {
        sayNote(why(r, 'That did not go up. Try again in a moment.'));
      }
    }, function () { go.disabled = false; sayNote('The fence could not be reached just now. Nothing was pinned.'); });
  });
}());
