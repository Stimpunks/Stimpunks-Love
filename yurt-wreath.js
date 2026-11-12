/* The wreath on the Faery Yurt's door (Helen Edgar's ask, 2026-11-11): dressed
   for whichever festival of the Wheel of the Year is nearest today, by the date
   on the visitor's own device. It reads the date once, when the page opens,
   shows that festival's dressing and says which in words. It keeps nothing,
   sends nothing and changes nothing by itself afterwards; a page left open
   past midnight changes when it is opened again. The festivals and what each
   wears are written by tools/make-yurt-wreath.py from data/yurt-wreath.json. */
(function () {
  var box = document.querySelector('[data-yurt-wreath]');
  if (!box) return;
  var items = Array.prototype.slice.call(box.querySelectorAll('li[data-sabbat]'));
  if (!items.length) return;
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var DAY = 86400000;
  function ahead(li) {
    // Days from today to this festival's next day, this year or next.
    var m = +li.getAttribute('data-month') - 1, d = +li.getAttribute('data-day');
    var t = new Date(today.getFullYear(), m, d);
    if (t < today) t = new Date(today.getFullYear() + 1, m, d);
    return Math.round((t - today) / DAY);
  }
  function behind(li) {
    var m = +li.getAttribute('data-month') - 1, d = +li.getAttribute('data-day');
    var t = new Date(today.getFullYear(), m, d);
    if (t > today) t = new Date(today.getFullYear() - 1, m, d);
    return Math.round((today - t) / DAY);
  }
  var near = null, gap = Infinity, next = null, soon = Infinity;
  items.forEach(function (li) {
    var g = Math.min(ahead(li), behind(li));
    if (g < gap) { gap = g; near = li; }
    var a = ahead(li);
    if (a > 0 && a < soon) { soon = a; next = li; }
  });
  var id = near.getAttribute('data-sabbat');
  var dress = box.querySelector('.yurt-wreath__dress[data-sabbat="' + id + '"]');
  if (dress) dress.removeAttribute('hidden');
  near.setAttribute('aria-current', 'date');
  var say = box.querySelector('[data-yurt-wreath-says]');
  if (!say) return;
  function words(li) { return li.textContent.replace(/\.$/, ''); }
  var line = gap === 0 ? 'Today is ' : 'Today it is dressed for ';
  say.textContent = line + words(near) + '.' +
    (next && next !== near ? ' Next on the wheel: ' + next.querySelector('b').textContent + ', ' +
      next.textContent.split(': ')[0].split(', ').slice(1).join(', ') + '.' : '');
})();
