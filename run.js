/* =============================================================================
   The Run, the dog park: the Run's words, and the dog who comes to sit with
   you. Ryan's brief, 2026-10-05.

   THE DOGS THEMSELVES ARE roam.js's, shared with Pekoe and Purrs: reading
   Rescue A Dog's own list, a place for every dog by its mood, each dog's card,
   the ball, the treat tin and the trough, and the dogs wandering at MAX
   GLITTER. That file makes the one GET to the shelter's list and nothing else,
   stores nothing, sends nothing, and knows nothing about a CB pass. This file
   gives it the Run's words, and the one thing only the Run does: you sit in
   the rocking chair on the porch, and the dog you ask comes and lies on the
   bed beside it. That bed is kept for them, so no other dog is put there.

   NOBODY GIVES A COMMAND. The button asks a dog to come and sit with you, and a
   dog who wants to be left alone is never asked. make-the-run.py refuses this
   file if it reads a dog's markings, writes HTML or asks for anything.
   ============================================================================= */
(function () {
  'use strict';

  if (!window.loveRoam || !window.loveAnimals) return;
  var A = window.loveAnimals;
  var shelter = { href: 'rescue-a-dog.html', text: 'Rescue A Dog' };

  window.loveRoam({
    cls: { animal: 'run-dog', away: 'run-dog--away', draw: 'run-dog__draw', card: 'run-card__draw', whoBtn: 'run-who__dog' },
    draw: function (a, cls) { return A.draw(a, cls, { bare: true }); },
    somewhere: 'somewhere on the Run',
    keep: {
      spot: 'beside',
      where: 'on the bed beside your rocking chair',
      label: function (name, has) { return has ? 'Let ' + name + ' go back out' : 'Ask ' + name + ' to come and sit with you'; },
      alone: function (Name) { return Name + ' would rather be left alone, which is allowed. Let them have the shade.'; },
      taken: function (Name, off, offWhere) {
        return Name + ' came up onto the porch and lay down on the bed beside your rocking chair.' +
          (off ? ' ' + off + ' got up and went ' + offWhere + '.' : '');
      },
      left: function (Name, where) { return Name + ' got up and went ' + (where || 'off') + '.'; },
      gone: function (Name) { return Name + ' has been adopted while you were here, and has gone home.'; },
    },
    says: {
      looking: function () { return 'Looking in at the shelter to see who is out for a run…'; },
      some: function () { return ['Every dog out here is from ', shelter, ', waiting for a home. Press one to meet them.']; },
      none: function (waiting) {
        var out = ['No dogs from the shelter are out today: every one of them has gone home. '];
        return waiting ? out.concat(['There is a dog out on the street right now, waiting to be brought in at ', shelter, '.']) : out;
      },
      unreachable: function () {
        return ['The shelter could not be reached just now, so the dogs are staying at ', shelter,
                '. The Run only reads their list on stimpunks.world itself.'];
      },
      toysNone: function () { return 'There are no dogs out on the Run to go after it.'; },
      adopt: function (name) { return 'Adopt ' + name + ' at Rescue A Dog →'; },
    },
  });
}());
