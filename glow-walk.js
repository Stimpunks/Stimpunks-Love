/* A night walk in Glow Wild Hollow (Helen Edgar's ask, 2026-11-11): "A guided
   walk from light to light, each stop reading its fact aloud. It would stop
   with any press, like the walk round the yurt."

   The stops are the hollow's own lights, every list of facts on the page in
   the page's order, so a light the tool adds is on the walk with nothing to
   change here. At each stop the walk puts the page at that light's heading,
   with no glide, moves the keyboard there, marks that part of the page and the fact it reads, and
   reads the heading and its first fact aloud, then waits a moment of dark and
   goes on to the next.

   It reads only with a voice on this device (SpeechSynthesisVoice.localService),
   as the radio does, because a voice that is not local sends the words to
   somebody's server. With none, it says so and walks at a reading pace, the
   fact marked where it stands on the page. It starts only when pressed, and ANY press,
   key, wheel or touch anywhere ends it where it is. It keeps nothing, sends
   nothing and makes no sound but the voice. */
(function () {
  var go = document.querySelector('[data-gwh-walk]');
  var said = document.querySelector('[data-gwh-walk-said]');
  if (!go || !said) return;
  var lists = Array.prototype.slice.call(document.querySelectorAll('ul.hollow-facts'));
  var stops = lists.map(function (ul) {
    var part = ul.closest('.hollow-part') || ul.closest('section');
    var h = part && part.querySelector('h2, h3');
    var li = ul.querySelector('li');
    if (!h || !li) return null;
    var fact = li.cloneNode(true);
    Array.prototype.forEach.call(fact.querySelectorAll('.hollow-src'), function (s) { s.remove(); });
    return { part: part, head: h, li: li, name: h.textContent.trim(), fact: fact.textContent.trim() };
  }).filter(Boolean);
  if (!stops.length) return;

  var DARK = 1400;       // the moment of dark between one light and the next
  var READ_MS = 70;      // with no voice, time to read each character, at least
  var READ_MIN = 6000;   // and never less than this at a stop
  var VOICE = typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance === 'function';
  var walking = false, at = -1, wait = null, run = 0, endedAt = -1e9;

  function localVoice() {
    var all = VOICE ? window.speechSynthesis.getVoices() : [];
    var lang = (document.documentElement.lang || 'en').toLowerCase().split('-')[0];
    var any = null;
    for (var i = 0; i < all.length; i++) {
      if (!all[i].localService) continue;
      if (all[i].lang && all[i].lang.toLowerCase().indexOf(lang) === 0) return all[i];
      any = any || all[i];
    }
    return any;
  }
  if (VOICE) window.speechSynthesis.getVoices();

  function unmark() {
    stops.forEach(function (s) { s.part.classList.remove('is-walked'); s.li.classList.remove('is-read'); });
  }
  function end(why) {
    if (!walking) return;
    walking = false; run++;
    if (wait) { clearTimeout(wait); wait = null; }
    if (VOICE) window.speechSynthesis.cancel();
    unmark();
    removeListeners();
    go.textContent = 'Take the night walk';
    go.setAttribute('aria-pressed', 'false');
    said.textContent = why;
  }
  function stopper(e) {
    if (e.type === 'keydown' && (e.key === 'Shift' || e.key === 'Alt' || e.key === 'Control' || e.key === 'Meta')) return;
    var name = at >= 0 && stops[at] ? stops[at].name : '';
    endedAt = performance.now();
    end(name ? 'The walk stopped at ' + name + '.' : 'The walk stopped.');
  }
  function addListeners() {
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (t) { document.addEventListener(t, stopper, { capture: true, passive: true }); });
  }
  function removeListeners() {
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (t) { document.removeEventListener(t, stopper, { capture: true, passive: true }); });
  }

  function next() {
    if (!walking) return;
    at++;
    if (at >= stops.length) { end('The walk is over, at the last light. Take it again whenever you like.'); return; }
    var s = stops[at], mine = run;
    unmark();
    s.part.classList.add('is-walked');
    s.li.classList.add('is-read');
    if (!s.head.hasAttribute('tabindex')) s.head.setAttribute('tabindex', '-1');
    s.head.scrollIntoView({ block: 'start' });
    s.head.focus({ preventScroll: true });
    var words = s.name + '. ' + s.fact;
    var voice = localVoice();
    said.textContent = (!voice && at === 0 ? 'This device has no voice of its own to read with, so the fact at each light is marked on the page instead, at a reading pace. ' : '') +
      'Light ' + (at + 1) + ', ' + s.name + ': ' + s.fact;
    if (voice) {
      var u = new window.SpeechSynthesisUtterance(words);
      u.voice = voice; u.lang = voice.lang; u.rate = 0.95;
      u.onend = function () { if (walking && mine === run) wait = setTimeout(next, DARK); };
      u.onerror = function () { if (walking && mine === run) wait = setTimeout(next, Math.max(READ_MIN, words.length * READ_MS)); };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } else {
      wait = setTimeout(next, Math.max(READ_MIN, words.length * READ_MS) + DARK);
    }
  }

  go.hidden = false;
  go.setAttribute('aria-pressed', 'false');
  go.addEventListener('click', function () {
    // The press on Stop the walk has already ended it on its way down, so its
    // click must not start the walk again.
    if (performance.now() - endedAt < 1000) return;
    if (walking) { end('The walk stopped.'); return; }
    walking = true; at = -1; run++;
    go.textContent = 'Stop the walk';
    go.setAttribute('aria-pressed', 'true');
    // The press that started it has already happened, so listening from here
    // on hears only the presses that should end it.
    addListeners();
    next();
  });
  window.addEventListener('pagehide', function () { end(''); });
})();
