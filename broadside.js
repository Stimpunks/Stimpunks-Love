/* The Broadsheet Broadside's print buttons. Loaded by its own page only.

   Printing the page already prints every sheet, one side to a page, because
   love.css's §62 hides everything else; that is what happens with scripts off,
   and it is why the buttons ship `hidden` rather than sitting there dead. What
   a button adds is choosing ONE sheet: it marks that sheet's set, marks the
   body, asks the browser to print, and takes both marks off again afterwards,
   so a sheet printed on its own and the page printed whole are the same sheet.

   It stores nothing, sends nothing and builds no frame. The print dialog is
   the browser's, and it is its own answer to the press. */
(function () {
  'use strict';
  var body = document.body;
  var buttons = document.querySelectorAll('.bb-print');
  if (!buttons.length || typeof window.print !== 'function') return;

  function clear() {
    body.removeAttribute('data-bb-print');
    var marked = document.querySelectorAll('.bb-set.bb-printing');
    for (var i = 0; i < marked.length; i++) marked[i].classList.remove('bb-printing');
  }
  window.addEventListener('afterprint', clear);

  for (var i = 0; i < buttons.length; i++) {
    var row = buttons[i].closest('.bb-printrow');
    if (row) row.removeAttribute('hidden');
    buttons[i].addEventListener('click', function (e) {
      var set = document.getElementById(e.currentTarget.getAttribute('data-bb-sheet'));
      if (!set) return;
      clear();
      set.classList.add('bb-printing');
      body.setAttribute('data-bb-print', '');
      window.print();
    });
  }
})();
