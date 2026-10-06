/* =============================================================================
   A Quiet Pint: find a table, sit at it, and say how your order reaches you.
   Loaded by a-quiet-pint.html only, after table.js.

   THE TABLES ARE IN THE PAGE ALREADY, ALL OF THEM. Each one carries what it
   has in data-pint-has, worked out from the plan by tools/make-a-quiet-pint.py
   so the words and the plan cannot disagree. Ticking a box only hides the
   tables that do not have everything ticked, and marks the ones that do on the
   plan; with scripts off, the whole list is there to read and nothing here is
   missed. The boxes ship hidden, so a page with no script shows no dead control.

   SITTING AT A TABLE is a sentence added to what your table says when you look
   down, through table.js's loveTable.add. FETCHING OR HAVING IT BROUGHT is the
   same order either way: it only changes the sentence the order button says,
   by setting data-table-tell on every one, and nobody is asked which, or why.

   IT KEEPS NOTHING AND SENDS NOTHING: no storage, no request, no HTML written.
   make-a-quiet-pint.py refuses this file if it ever does. Every answer is said
   where the hand is, one at a time, and once into the room's live region,
   cleared first so a sentence said twice is heard twice: the Playhouse's lesson. */
(function () {
  'use strict';

  var says = document.querySelector('[data-table-says]');
  function speak(text) {
    if (!says) return;
    says.textContent = '';
    setTimeout(function () { says.textContent = text; }, 40);
  }
  var lastSaid = null;
  function sayAt(el, text) {
    if (lastSaid && lastSaid !== el) { lastSaid.hidden = true; lastSaid.textContent = ''; }
    if (el) { el.textContent = text; el.hidden = false; lastSaid = el; }
    speak(text);
  }
  function listOf(xs) {
    if (xs.length < 2) return xs.join('');
    return xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1];
  }

  /* ── Finding a table ──────────────────────────────────────────────────── */
  var finder = document.querySelector('[data-pint-finder]');
  var tables = Array.prototype.slice.call(document.querySelectorAll('[data-pint-table]'));
  var spots = Array.prototype.slice.call(document.querySelectorAll('[data-pint-spot]'));
  var found = document.querySelector('[data-pint-found]');

  function wanted() {
    return Array.prototype.slice.call(document.querySelectorAll('[data-pint-want]'))
      .filter(function (b) { return b.checked; })
      .map(function (b) { return b.value; });
  }

  function show(said) {
    var want = wanted();
    var hits = [];
    tables.forEach(function (li) {
      var has = (li.getAttribute('data-pint-has') || '').split(' ');
      var ok = want.every(function (k) { return has.indexOf(k) >= 0; });
      li.hidden = !ok;
      if (ok) hits.push(li.getAttribute('data-pint-table'));
    });
    spots.forEach(function (g) {
      var on = !!(want.length && hits.indexOf(g.getAttribute('data-pint-spot')) >= 0);
      g.setAttribute('data-pint-match', on ? 'yes' : 'no');
    });
    var text;
    if (!want.length) text = 'Every table is in the list. Tick what you want, and the tables without it step out.';
    else if (!hits.length) text = 'No table has all of those. Untick one and see what is left.';
    else if (hits.length === 1) text = 'Table ' + hits[0] + ' has everything you ticked, and it is marked on the plan.';
    else text = 'Tables ' + listOf(hits) + ' have everything you ticked, and they are marked on the plan.';
    if (said) sayAt(found, text);
  }

  if (finder) {
    finder.hidden = false;
    Array.prototype.forEach.call(document.querySelectorAll('[data-pint-want]'), function (b) {
      b.addEventListener('change', function () { show(true); });
    });
    show(false);
  }

  /* ── Sitting at a table ───────────────────────────────────────────────── */
  var at = null;
  function short(n) {
    var li = document.querySelector('[data-pint-table="' + n + '"] .aqp-tab__what');
    var first = li ? li.textContent.split('.')[0] : '';
    return first ? first.charAt(0).toLowerCase() + first.slice(1) : '';
  }
  if (window.loveTable) {
    window.loveTable.add({
      words: function () { return at ? 'You are at table ' + at + ': ' + short(at) + '.' : ''; }
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-pint-sit]'), function (b) {
    var answer = b.parentNode.querySelector('[data-pint-said]');
    b.hidden = false;
    b.addEventListener('click', function () {
      at = b.getAttribute('data-pint-sit');
      spots.forEach(function (g) {
        g.setAttribute('data-pint-here', g.getAttribute('data-pint-spot') === at ? 'yes' : 'no');
      });
      if (window.loveTable) window.loveTable.redraw();
      sayAt(answer, 'You sit at table ' + at + '. Anything you order comes here; look down at your table to see it.');
    });
  });

  /* ── Fetching it, or having it brought ────────────────────────────────── */
  var how = document.querySelector('[data-pint-how]');
  if (how) {
    how.hidden = false;
    Array.prototype.forEach.call(how.querySelectorAll('input[name="aqp-how"]'), function (r) {
      r.addEventListener('change', function () {
        var tell = how.getAttribute('data-tell-' + r.value);
        Array.prototype.forEach.call(document.querySelectorAll('[data-table-order]'), function (b) {
          if (tell) b.setAttribute('data-table-tell', tell);
        });
      });
    });
  }
}());
