/* =============================================================================
   Count Me In: the stair, the step you take, and the lift. Ryan's brief,
   2026-09-30, after the counting game in our Discord's Collaborative Nonsense
   channels, and his chairlift the same afternoon, "so everyone can join".

   A NUMBER TO A STEP, NEVER TWO IN A ROW, AND NOBODY NAMED. Taking a step
   sends the CB pass the radio keeps in love-cb, which this file reads and never
   writes. The lift sends no number at all: the stair works out the next step
   itself, so riding it can never send anybody back to one.

   READ WHEN IT MATTERS, NOT POLLED. The stair is read when the page opens, when
   somebody goes to the number box, when the tab comes back to the front, and
   after every step, so a page is as fresh as it can be at the moment somebody
   types a number, without asking the server every few seconds. A number at or
   below the step we are on is somebody behind, and the stair treats it that
   way, so a page that fell behind costs nobody anything.

   Nothing here is stored anywhere, and nothing moves.
   ============================================================================= */
(function () {
  'use strict';

  var stepEl = document.getElementById('cmi-step');
  var where = document.getElementById('cmi-where');
  var label = document.getElementById('cmi-step-label');
  if (!stepEl || !where) return;

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
      return 'The stair is not kept on this server. It only answers on stimpunks.world itself.';
    }
    return otherwise;
  }

  function num(n) {
    try { return n.toLocaleString(); } catch (e) { return String(n); }
  }

  var said = document.getElementById('cmi-said');
  function say(t) { if (said) said.textContent = t; }

  var now = 0;
  function draw(b) {
    now = b.step || 0;
    stepEl.textContent = now ? num(now) : 'G';
    if (label) label.textContent = now ? 'We are on step' : 'We are on the ground floor';
    var s = now ? 'We are on step ' + num(now) + '. The next step is ' + num(now + 1) + '.'
                : 'We are at the bottom. The next step is 1.';
    if (b.best) s += ' The highest the stair has reached is step ' + num(b.best) + '.';
    if (b.fell && b.fell.at) s += ' The last time it went back to one, it had got to step ' + num(b.fell.at) + '.';
    where.textContent = s;
  }

  function read() {
    return call('/cb/stair').then(function (r) {
      if (r.status === 200 && typeof r.body.step === 'number') { draw(r.body); return true; }
      stepEl.textContent = '?';
      where.textContent = 'The stair could not be read just now.';
      return false;
    }, function () {
      stepEl.textContent = '?';
      where.textContent = 'The stair could not be read just now.';
      return false;
    });
  }
  where.textContent = 'Reading the stair…';
  read();
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') read();
  });

  var me = pass();
  var ways = document.getElementById('cmi-ways');
  var signon = document.getElementById('cmi-signon');
  if (!me) { if (signon) signon.hidden = false; return; }
  if (!ways) return;
  ways.hidden = false;

  var form = document.getElementById('cmi-step-form');
  var box = document.getElementById('cmi-n');
  var go = form.querySelector('.cmi-btn');
  var lift = document.getElementById('cmi-lift');

  function answer(r, how) {
    if (r.body && typeof r.body.step === 'number') draw(r.body);
    if (r.status === 200 && r.body.took) {
      say(how === 'lift' ? 'Up one by the lift, to step ' + num(r.body.step) + '. The next step is somebody else’s.'
                         : 'Up to step ' + num(r.body.step) + '. The next step is somebody else’s.');
    } else if (r.status === 200 && r.body.wrong) {
      say('The stair wanted ' + num(r.body.wanted) + ', so it has gone back to one. Anybody’s number can slip, and nobody is told whose it was.');
    } else if (r.status === 401) {
      say('The password has changed since you signed on. Sign on again at the Community Center, then come back.');
    } else {
      say(why(r, 'That step did not go in. Try again in a moment.'));
    }
  }

  box.addEventListener('focus', read);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = box.value.trim();
    if (!/^\d{1,7}$/.test(t) || Number(t) < 1) { say('A step is a whole number in figures, like ' + num(now + 1) + '.'); box.focus(); return; }
    go.disabled = true; lift.disabled = true;
    say('Taking the step…');
    call('/cb/stair/climb', { n: Number(t) }, me.pass).then(function (r) {
      go.disabled = false; lift.disabled = false;
      if (r.status === 200) box.value = '';
      answer(r, 'number');
    }, function () { go.disabled = false; lift.disabled = false; say('The stair could not be reached just now. No step was taken.'); });
  });

  lift.addEventListener('click', function () {
    go.disabled = true; lift.disabled = true;
    say('The lift is going up…');
    call('/cb/stair/climb', { lift: true }, me.pass).then(function (r) {
      go.disabled = false; lift.disabled = false;
      answer(r, 'lift');
    }, function () { go.disabled = false; lift.disabled = false; say('The stair could not be reached just now. The lift did not move.'); });
  });
}());
