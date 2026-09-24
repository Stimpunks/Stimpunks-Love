/* =============================================================================
   The Small Hours' jukebox: play a whole album from the top.

   EVERY TRACK IS ALREADY A PRESS-TO-PLAY BUTTON, and love-embed.js turns each
   into a player streaming from the band's own site. This file adds only the
   album button, which plays an album straight through -- and because one press
   starts several songs, its label says how many and how long BEFORE the press.
   That is the audio room's sequence rule, and make-small-hours.py writes both
   numbers from the data rather than letting anybody type them.

   IT BUILDS NOTHING OF ITS OWN. Each song is an <audio> from loveEmbed.audio,
   which checks the source against AUDIO_ORIGINS and pauses any other recording
   when this one starts, so an album and a single track can never play over
   each other. The button ships hidden and this file unhides it: a page with
   no JavaScript shows no dead control.

   IT SAYS WHAT IS ON. "Now playing" names the song and which of how many it is,
   in text beside the player and once into a live region per song, because the
   only other sign that a song changed is a sound.
   ============================================================================= */
(function () {
  'use strict';

  if (!window.loveEmbed || !window.loveEmbed.audio) return;

  var buttons = document.querySelectorAll('.sh-album__all');
  Array.prototype.forEach.call(buttons, function (btn) {
    var tracks;
    try { tracks = JSON.parse(btn.getAttribute('data-tracks') || '[]'); } catch (e) { return; }
    if (!tracks.length) return;

    var album = btn.closest('.sh-album');
    var title = album.querySelector('.sh-album__h').textContent;
    var now = album.querySelector('.sh-album__now');
    var at = 0;

    function playAt(i) {
      at = i;
      var t = tracks[i];
      var player = window.loveEmbed.audio(t[1], t[0] + ' by Josephmooon');
      if (!player) return;
      now.textContent = '';
      var line = document.createElement('p');
      line.className = 'sh-album__line';
      line.setAttribute('aria-live', 'polite');
      line.textContent = 'Now playing ' + t[0] + ', song ' + (i + 1) + ' of ' + tracks.length +
        ' on ' + title + ', ' + t[2] + '.';
      now.appendChild(line);
      now.appendChild(player);
      now.hidden = false;
      player.addEventListener('ended', function () {
        if (at + 1 < tracks.length) {
          playAt(at + 1);
        } else {
          line.textContent = 'That was the whole of ' + title + '.';
          player.remove();
        }
      });
    }

    btn.addEventListener('click', function () { playAt(0); });
    btn.hidden = false;
  });
})();
