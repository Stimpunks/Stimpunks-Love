/* =============================================================================
   Rescue A Cat: the street, the rescue, the shelter, and your own cats. Ryan's
   brief, 2026-09-30, after the catch-a-cat game in our Discord's Collaborative
   Nonsense channels, renamed.

   CATS TURN UP AT RANDOM AND NOTHING HERE KNOWS WHEN. The server works out
   whether a cat is waiting and never says when the next one is due, so this
   page looks when it opens and when the tab comes back to the front, and does
   not poll. A rescue sends the CB pass the radio keeps in love-cb, which this
   file reads and never writes.

   YOUR CATS ARE KEPT IN YOUR BROWSER AND NOWHERE ELSE, under love-cats: the cat,
   its name and when you brought it in, so this page can show you the cats you
   rescued after they have gone to homes. The shelter never knows which were
   yours. Forget my cats clears it. It is the only thing this file stores, and
   privacy.html lists it.

   EVERY CAT IS DRAWN FROM ITS COAT AND ITS MARKINGS, in the torch's pool, and
   the words that describe it come from the server with it, so the drawing and
   the words cannot disagree about which cat it is. Nothing is rarer, and
   nothing moves. Every name goes in with textContent.
   ============================================================================= */
(function () {
  'use strict';

  var outBox = document.getElementById('rac-out');
  var outState = document.getElementById('rac-out-state');
  var shelterList = document.getElementById('rac-shelter');
  var shelterState = document.getElementById('rac-shelter-state');
  if (!outBox || !outState || !shelterList || !shelterState) return;

  var NS = 'http://www.w3.org/2000/svg';
  var KEY = 'love-cats';

  /* ── Drawing a cat ─────────────────────────────────────────────────────── */
  var COATS = {
    black:       { base: 'black' },
    ginger:      { base: 'ginger' },
    grey:        { base: 'grey' },
    white:       { base: 'white' },
    cream:       { base: 'cream' },
    tabby:       { base: 'tabby', stripes: true },
    greytabby:   { base: 'greytabby', stripes: true },
    tortie:      { base: 'black', patches: ['ginger', 'ginger'] },
    calico:      { base: 'white', patches: ['ginger', 'black'] },
    tuxedo:      { base: 'black', bib: true, socks: true },
    gingerwhite: { base: 'ginger', belly: true },
    bluecream:   { base: 'blue', patches: ['cream', 'cream'] },
  };
  var MARKS = { socks: 1, bib: 1, kink: 1, tip: 1, three: 1, oneeye: 1, long: 1, plain: 1 };
  function coat(k) { return 'var(--rac-coat-' + k + ')'; }

  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function drawCat(c) {
    var look = COATS[c.coat] || COATS.grey;
    var mark = MARKS[c.mark] ? c.mark : 'plain';
    var fill = coat(look.base);
    var line = { stroke: 'var(--rac-night)', 'stroke-width': '2.5', 'stroke-linejoin': 'round' };
    var svg = el('svg', { 'class': 'rac-cat', viewBox: '0 0 200 170', 'aria-hidden': 'true', focusable: 'false' });
    svg.appendChild(el('ellipse', { cx: 100, cy: 94, rx: 97, ry: 74, fill: 'var(--rac-beam)', stroke: 'var(--rac-fall)', 'stroke-width': 3 }));
    // The tail first, behind the body: a curve up the right side, bent where it is kinked.
    var tail = mark === 'kink' ? 'M136 136 Q168 128 160 104 L170 92' : 'M136 136 Q172 128 158 92';
    svg.appendChild(el('path', { d: tail, fill: 'none', stroke: 'var(--rac-night)', 'stroke-width': 14, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    svg.appendChild(el('path', { d: tail, fill: 'none', stroke: fill, 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    // Long fur: a ragged ring round the body.
    if (mark === 'long') svg.appendChild(el('ellipse', { cx: 100, cy: 118, rx: 50, ry: 43, fill: fill, stroke: 'var(--rac-night)', 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }));
    svg.appendChild(el('ellipse', Object.assign({ cx: 100, cy: 118, rx: 42, ry: 36, fill: fill }, line)));
    if (look.belly || look.bib || mark === 'bib') svg.appendChild(el('ellipse', { cx: 100, cy: look.belly ? 122 : 106, rx: look.belly ? 22 : 14, ry: look.belly ? 22 : 16, fill: coat('white') }));
    if (look.patches) {
      svg.appendChild(el('ellipse', { cx: 82, cy: 116, rx: 15, ry: 11, fill: coat(look.patches[0]) }));
      svg.appendChild(el('ellipse', { cx: 118, cy: 128, rx: 13, ry: 9, fill: coat(look.patches[1]) }));
    }
    if (look.stripes) {
      ['M72 104 Q80 110 76 120', 'M128 104 Q120 110 124 120', 'M70 124 Q80 128 76 138', 'M130 124 Q120 128 124 138'].forEach(function (d) {
        svg.appendChild(el('path', { d: d, fill: 'none', stroke: 'var(--rac-stripe)', 'stroke-width': 4, 'stroke-linecap': 'round' }));
      });
    }
    // Front legs: two, or one where the cat has three and no opinion about it.
    var legs = mark === 'three' ? [96] : [86, 106];
    legs.forEach(function (x) {
      svg.appendChild(el('rect', Object.assign({ x: x, y: 128, width: 9, height: 26, rx: 3, fill: fill }, line)));
      if (look.socks || mark === 'socks') svg.appendChild(el('rect', { x: x + 1.2, y: 145, width: 6.6, height: 8, rx: 2, fill: coat('white') }));
    });
    // Ears, one tipped flat, then the head.
    var left = mark === 'tip' ? '74,52 76,32 86,30 94,46' : '74,52 80,24 94,46';
    [left, '106,46 120,24 126,52'].forEach(function (pts) {
      svg.appendChild(el('polygon', Object.assign({ points: pts, fill: fill }, line)));
    });
    svg.appendChild(el('circle', Object.assign({ cx: 100, cy: 70, r: 28, fill: fill }, line)));
    if (look.patches) svg.appendChild(el('ellipse', { cx: 112, cy: 60, rx: 10, ry: 8, fill: coat(look.patches[0]) }));
    if (look.stripes) {
      ['M92 46 L94 56', 'M100 44 L100 55', 'M108 46 L106 56'].forEach(function (d) {
        svg.appendChild(el('path', { d: d, stroke: 'var(--rac-stripe)', 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
      });
    }
    // Eyes: eyeshine, each with a slit; one closed where the cat has one eye.
    [[89, true], [111, mark !== 'oneeye']].forEach(function (e) {
      if (e[1]) {
        svg.appendChild(el('ellipse', { cx: e[0], cy: 68, rx: 6, ry: 7, fill: 'var(--rac-eye)', stroke: 'var(--rac-night)', 'stroke-width': 1.5 }));
        svg.appendChild(el('ellipse', { cx: e[0], cy: 68, rx: 1.6, ry: 5, fill: 'var(--rac-night)' }));
      } else {
        svg.appendChild(el('path', { d: 'M' + (e[0] - 6) + ' 69 Q' + e[0] + ' 72 ' + (e[0] + 6) + ' 69', fill: 'none', stroke: 'var(--rac-night)', 'stroke-width': 2, 'stroke-linecap': 'round' }));
      }
    });
    svg.appendChild(el('polygon', { points: '96,78 104,78 100,83', fill: 'var(--rac-night)' }));
    return svg;
  }

  /* ── Talking to the shelter ────────────────────────────────────────────── */
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
      return 'The shelter is not kept on this server. It only answers on stimpunks.world itself.';
    }
    return otherwise;
  }

  function p(cls, text) { var e = document.createElement('p'); if (cls) e.className = cls; e.textContent = text; return e; }
  function when(t) {
    try { return new Date(t).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }); }
    catch (e) { return ''; }
  }
  function about(c) { return 'A ' + c.words.coat + ' cat ' + c.words.mark + ', found ' + c.words.place + '. It ' + c.words.mood + '.'; }

  var me = pass();
  var base = !!(me && (me.base || /^cb1\.base\./.test(me.pass)));
  var said = document.getElementById('rac-said');
  function say(t) { if (said) said.textContent = t; }

  function card(c, into, own) {
    var li = document.createElement('li');
    li.className = 'rac-card';
    li.appendChild(drawCat(c));
    li.appendChild(p('rac-card__name', c.name || 'Not named yet'));
    li.appendChild(p('rac-card__about', about(c)));
    li.appendChild(p('rac-card__when', (own ? 'You brought it in ' : 'Came in ') + when(c.t)));
    if (base && !own && c.name) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'rac-btn rac-btn--small'; b.textContent = 'Take this name off';
      b.addEventListener('click', function () {
        b.disabled = true;
        call('/cb/cats/unname', { id: c.id }, me.pass).then(function (r) {
          if (r.status === 200) { drawShelter(r.body.shelter || []); say('The name is off.'); }
          else { b.disabled = false; say(why(r, 'That did not work. Try again in a moment.')); }
        }, function () { b.disabled = false; say('The shelter could not be reached just now.'); });
      });
      li.appendChild(b);
    }
    into.appendChild(li);
  }

  function drawShelter(list) {
    shelterList.textContent = '';
    if (!list.length) { shelterList.hidden = true; shelterState.hidden = false; shelterState.textContent = 'Nobody in the shelter this week.'; return; }
    shelterState.hidden = true; shelterList.hidden = false;
    list.slice().reverse().forEach(function (c) { card(c, shelterList, false); });
  }

  var waiting = null;
  var drawn = document.getElementById('rac-out-cat');
  var words = document.getElementById('rac-out-words');
  var rescueBox = document.getElementById('rac-rescue');
  function drawOut(c) {
    waiting = c;
    drawn.textContent = '';
    words.textContent = '';
    if (!c) {
      outState.hidden = false;
      outState.textContent = 'No cat out there right now. Cats turn up at random, so look in again later.';
      drawn.hidden = true; words.hidden = true;
      if (rescueBox) rescueBox.hidden = true;
      return;
    }
    outState.hidden = true; drawn.hidden = false; words.hidden = false;
    drawn.appendChild(drawCat(c));
    words.appendChild(p('', 'There is a cat ' + c.words.place + '.'));
    words.appendChild(p('', 'A ' + c.words.coat + ' cat ' + c.words.mark + '.'));
    if (rescueBox && me) rescueBox.hidden = false;
  }

  function look() {
    return call('/cb/cats').then(function (r) {
      if (r.status === 200 && r.body.shelter) { drawOut(r.body.waiting); drawShelter(r.body.shelter); return; }
      outState.textContent = 'The street could not be searched just now.';
      shelterState.textContent = 'The shelter could not be reached just now.';
    }, function () {
      outState.textContent = 'The street could not be searched just now.';
      shelterState.textContent = 'The shelter could not be reached just now.';
    });
  }
  outState.textContent = 'Shining the torch about…';
  shelterState.textContent = 'Looking in at the shelter…';
  look();
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') look(); });

  /* ── Your own cats, in your own browser ────────────────────────────────── */
  var mine = document.getElementById('rac-mine');
  var mineState = document.getElementById('rac-mine-state');
  var forget = document.getElementById('rac-forget');
  function readMine() { try { var v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function writeMine(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (e) { return false; } }
  function drawMine() {
    if (!mine || !mineState) return;
    var list = readMine();
    mine.textContent = '';
    if (!list.length) { mine.hidden = true; mineState.textContent = 'You have not rescued a cat on this browser yet.'; if (forget) forget.hidden = true; return; }
    mine.hidden = false; mineState.textContent = 'Kept in this browser only. The shelter does not know which were yours.';
    if (forget) forget.hidden = false;
    list.slice().reverse().forEach(function (c) { if (c && c.words) card(c, mine, true); });
  }
  if (forget) forget.addEventListener('click', function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    drawMine();
    say('Forgotten. This browser no longer remembers which cats you rescued.');
  });
  drawMine();

  /* ── Rescuing ──────────────────────────────────────────────────────────── */
  var signon = document.getElementById('rac-signon');
  if (!me) { if (signon) signon.hidden = false; return; }
  var form = document.getElementById('rac-rescue');
  var nameBox = document.getElementById('rac-name');
  if (!form || !nameBox) return;
  var go = form.querySelector('.rac-btn');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!waiting) { say('There is no cat out there right now.'); return; }
    go.disabled = true;
    say('Going to get it…');
    call('/cb/cats/rescue', { id: waiting.id, name: nameBox.value.trim() }, me.pass).then(function (r) {
      go.disabled = false;
      if (r.status === 200 && r.body.rescued) {
        var c = r.body.rescued;
        nameBox.value = '';
        var list = readMine(); list.push(c);
        var kept = writeMine(list);
        drawOut(null); drawShelter(r.body.shelter || []); drawMine();
        say((c.name ? c.name + ' is' : 'It is') + ' safe in the shelter.' + (kept ? ' This browser will remember it was you.' : ''));
      } else if (r.status === 409) {
        drawOut(null); if (r.body.shelter) drawShelter(r.body.shelter);
        say(why(r, 'That cat is already safe in the shelter.'));
      } else if (r.status === 401) {
        say('The password has changed since you signed on. Sign on again at the Community Center, then come back.');
      } else {
        say(why(r, 'That did not work. Try again in a moment.'));
      }
    }, function () { go.disabled = false; say('The shelter could not be reached just now. The cat is still out there.'); });
  });
}());
