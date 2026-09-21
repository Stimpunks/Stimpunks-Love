/* =============================================================================
   The Oracle Deck's draw.

   THE WHOLE DECK IS ALREADY ON THE PAGE and this file does not add a single
   card to it. Drawing moves a COPY of one of them into the slot at the top;
   every card is face up in the index below whether or not anybody presses
   anything, and with this file switched off the draw table hides itself and
   the room is unharmed. That is not a fallback. A room that made somebody
   gamble to reach its contents would have put its contents behind chance,
   which is the "lite version" mistake holding a deck.

   IT DRAWS AND IT DOES NOT PREDICT. There is no spread, no position, no
   reversal and no reading of several cards together -- nothing here that could
   be assembled into a statement about somebody's life. The cards ask
   questions; make-oracle.py refuses one that does not. The only thing this
   file decides is which question you get, and it will happily give you the
   same one twice, because a deck that avoided repeats would be pretending to
   have a plan.

   NOTHING IS STORED. The card you drew is not remembered between visits and no
   count is kept of how many you have turned over. A tally beside a practice
   that is not about volume would quietly make it about volume -- the same
   refusal the pebbling cabinet makes two doors down.
   ============================================================================= */
(function () {
  'use strict';

  var table = document.querySelector('.orc-table');
  var slot = document.getElementById('orc-slot');
  var draw = document.getElementById('orc-draw');
  var clear = document.getElementById('orc-clear');
  var said = document.getElementById('orc-said');
  if (!table || !slot || !draw || !clear || !said) return;

  var cards = [].slice.call(document.querySelectorAll('.orc-index .orc-card'));
  if (!cards.length) return;

  var empty = slot.innerHTML;

  function put(card) {
    var copy = card.cloneNode(true);
    copy.removeAttribute('id');
    /* The index's pictures are lazy, which is right for a list of thirteen and
       wrong for the one somebody just asked to see. */
    var img = copy.querySelector('img');
    if (img) img.loading = 'eager';
    /* An h3 in the index is an h3 in the slot: the two sit under headings of
       the same rank, so nothing about the page's outline changes. */
    slot.replaceChildren(copy);
    clear.hidden = false;
    var name = copy.querySelector('.orc-name');
    var ask = copy.querySelector('.orc-ask');
    said.textContent = 'You drew ' + (name ? name.textContent : 'a card') +
      (ask ? '. ' + ask.textContent : '.');
  }

  draw.addEventListener('click', function () {
    put(cards[Math.floor(Math.random() * cards.length)]);
    draw.textContent = 'Draw another';
  });

  clear.addEventListener('click', function () {
    slot.innerHTML = empty;
    clear.hidden = true;
    draw.textContent = 'Draw a card';
    said.textContent = 'Put back. The deck is face down again.';
    draw.focus();
  });
})();
