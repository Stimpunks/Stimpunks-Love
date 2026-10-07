/* The door marked E.

   Ryan's call, 2026-10-07: the word is the address. Say the password to the
   door and it takes you to the page whose name is the word; say anything else
   and the door stays shut. So this file holds the word's SHA-256 and never the
   word, and builds the address from what was typed. tools/make-secret-cabin.py
   writes the hash between the markers below and refuses this file if the word
   itself is anywhere in it.

   A DOOR, NOT A LOCK. Anybody who reads the repository can find the room
   behind it, and the hash of a short word can be worked back by anybody who
   cares to. That is the guild's codes again: the point is the ritual, and this
   does not pretend otherwise. Do not "harden" it.

   IT KEEPS NOTHING. Not the word, not a wrong one, and not how many times
   anybody tried: the door does not count, so there is nothing to wait out and
   nothing to be told off for. Case, spaces and punctuation do not matter, so a
   word typed the way the room writes it, in capitals, opens it too.

   IT SHIPS HIDDEN. With scripts off the form is never shown, and the page says
   how to go through by hand, because the word is the way in either way. A
   browser that cannot work out the hash (crypto.subtle is only there on https
   and on localhost) gets the same sentence rather than a box that never opens.

   THE ANSWER IS SAID TWICE IF IT IS THE SAME TWICE. An aria-live region does
   not announce text it already holds, so a second wrong word would be silent to
   a screen reader; the line is emptied and set again on the next tick, which is
   love.js's speak() for this one line. */
(function () {
  'use strict';
  // door:word:begin
  var WORD = 'bc6d56befdf5da0d52eff34f87d82feccdadadd75b675bb7a2abf793f47e374f';
  // door:word:end

  var form = document.querySelector('[data-door]');
  var byHand = document.querySelector('[data-door-by-hand]');
  if (!form) return;
  if (!(window.crypto && crypto.subtle && window.TextEncoder)) {
    if (byHand) byHand.hidden = false;
    return;
  }
  var input = form.querySelector('[data-door-word]');
  var said = form.querySelector('[data-door-said]');
  form.hidden = false;

  function say(text) {
    said.textContent = '';
    setTimeout(function () { said.textContent = text; }, 60);
  }

  function hex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) {
      return (b < 16 ? '0' : '') + b.toString(16);
    }).join('');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var word = input.value.toLowerCase().replace(/[^a-z]/g, '');
    if (!word) { say('Say the password to the door first.'); input.focus(); return; }
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(word)).then(function (buf) {
      if (hex(buf) === WORD) {
        say('The door opens.');
        location.href = word + '.html';
        return;
      }
      say('That is not the word. The door stays shut, and it does not mind how many times you try.');
      input.select();
    });
  });
})();
