/* The Play Pod's lamp switch (play-pod.html, love.css §131).
   One button turns the UV lamp in the drawing off and on: off, the tray is an
   ordinary black tray of pale paint in a pale room; on, the room goes dark and
   everything in the tray glows. That is fluorescence, which is there only
   while the lamp is. It keeps nothing and sends nothing, and it moves nothing
   by itself: a press changes the drawing, and that is all. The button ships
   hidden, so a page with no script shows the lamp on and no dead control. */
(function () {
  var btn = document.querySelector('[data-ppd-lamp]');
  var fig = document.querySelector('.ppd-lamp');
  var said = document.querySelector('[data-ppd-said]');
  if (!btn || !fig) return;
  var WORDS = {
    on: 'The lamp is on. The room goes dark and everything in the tray glows.',
    off: 'The lamp is off. It is an ordinary black tray of pale paint, and nothing glows.'
  };
  btn.hidden = false;
  btn.addEventListener('click', function () {
    var on = fig.getAttribute('data-lamp') !== 'on';
    fig.setAttribute('data-lamp', on ? 'on' : 'off');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (said) said.textContent = WORDS[on ? 'on' : 'off'];
  });
})();
