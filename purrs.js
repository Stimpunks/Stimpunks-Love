/* =============================================================================
   Pekoe and Purrs, the cat café: the café's words, and the cat on your lap.
   Ryan's brief, 2026-10-04.

   THE CATS THEMSELVES ARE roam.js's, shared with The Run since 2026-10-05:
   reading the shelter's own list, a perch for every cat by its mood, each
   cat's card, the toys, and the cats wandering at MAX GLITTER. That file makes
   the one GET to Rescue A Cat's list and nothing else, stores nothing, sends
   nothing, and knows nothing about a CB pass. This file gives it the café's
   words and the one thing only the café does: a cat on your lap, which is
   drawn in the view down at your lap and your table, and is table.js's
   (shared with Brew and Stew), so this only adds the cat to it.

   WHERE A CAT GOES IS ITS MOOD'S BUSINESS AND NOTHING ELSE'S. A cat's markings
   are only ever handed to animals.js to draw, and make-pekoe.py refuses this
   file, and roam.js, if either reads them for anything else. A cat whose mood
   is in data-left-alone is never picked up.
   ============================================================================= */
(function () {
  'use strict';

  if (!window.loveRoam || !window.loveAnimals) return;
  var A = window.loveAnimals;
  var shelter = { href: 'rescue-a-cat.html', text: 'Rescue A Cat' };
  function looking() { return !!(window.loveTable && window.loveTable.looking()); }

  var roam = window.loveRoam({
    cls: { animal: 'pkp-cat', away: 'pkp-cat--away', draw: 'pkp-cat__draw', card: 'pkp-card__draw', whoBtn: 'pkp-who__cat' },
    draw: function (a, cls) { return A.draw(a, cls, { bare: true }); },
    somewhere: 'somewhere in the café',
    keep: {
      spot: null,
      where: 'on your lap',
      label: function (name, has) { return has ? 'Let ' + name + ' down' : 'Put ' + name + ' on your lap'; },
      alone: function (Name) { return Name + ' would rather not be picked up, which is allowed. Sit nearby and let them watch.'; },
      taken: function (Name, off, offWhere) {
        return Name + ' is on your lap.' + (off ? ' ' + off + ' hopped down and went ' + offWhere + '.' : '') +
          (looking() ? '' : ' Look down to see them.');
      },
      left: function (Name, where) { return Name + ' hopped down and went ' + (where || 'off') + '.'; },
      gone: function (Name) { return Name + ' has been adopted while you were here, and has gone home.'; },
      change: function () { if (window.loveTable) window.loveTable.redraw(); },
    },
    says: {
      looking: function () { return 'Looking in at the shelter to see who is visiting…'; },
      some: function () { return ['Every cat in here is from ', shelter, ', waiting for a home. Press one to meet them.']; },
      none: function (waiting) {
        var out = ['No cats from the shelter are in today: every one of them has gone home. '];
        return waiting ? out.concat(['There is a cat out on the street right now, waiting to be brought in at ', shelter, '.']) : out;
      },
      unreachable: function () {
        return ['The shelter could not be reached just now, so the cats are staying at ', shelter,
                '. The café only reads their list on stimpunks.world itself.'];
      },
      toysNone: function () { return 'There are no cats in the café to go after it.'; },
      adopt: function (name) { return 'Adopt ' + name + ' at Rescue A Cat →'; },
    },
  });
  if (!roam) return;

  /* ── Your lap, looking down ─────────────────────────────────────────────
     table.js draws the table and what is on it, and looks down and back up;
     this adds the cat on your lap to the picture and to the sentence. */
  var lapCat = document.getElementById('pkp-lap-cat');
  function lapWords() {
    var lap = roam.withYou();
    return lap ? 'On your lap, under the blanket: ' + roam.nameOf(lap) + ', asleep.'
      : 'On your lap: the blanket, and no cat. Pick one up from their card.';
  }
  function drawLapCat(place) {
    if (!lapCat) return;
    while (lapCat.firstChild) lapCat.removeChild(lapCat.firstChild);
    var lap = roam.withYou();
    if (lap) place(lapCat, A.draw(lap.a, 'pkp-lap__cat', { pose: 'curled' }));
  }
  if (window.loveTable) window.loveTable.add({ words: lapWords, draw: drawLapCat });
}());
