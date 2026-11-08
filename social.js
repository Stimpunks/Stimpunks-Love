/* =============================================================================
   Stimpunks Social, on social.html (Ryan's ask, 2026-11-02): our short posts,
   moved here from stimpunkssocial.wordpress.com and posted here from the
   office's Posts page.

   THE PAGE IS ALREADY WHOLE WITHOUT THIS. Every post is written into it by
   tools/make-social.py from data/social.json. This does two things:

     · DRESSES IT AS THE CB, as Home and the forums are dressed: the posts are
       moved into a shadow root with cb.css and social.css the only sheets that
       reach them, in the theme the reader's radio wears (loveCall.schemeFor).
       A link to a post (#w123) is found inside the shadow root, because a
       browser looks for a fragment in the page and not in a shadow root.
     · SHOWS WHAT THE OFFICE POSTED SINCE THE MORNING, from /cb/social, which
       is public, until the morning timer folds it into the data. A post
       already on the page is never drawn twice.

   IT KEEPS NOTHING AND SENDS NOTHING: one GET of /cb/social, no storage, no
   pass. Nothing is counted and nothing moves. Words are set with textContent
   and links are built as elements, never from a string.
   ============================================================================= */
(function () {
  'use strict';

  var mount = document.querySelector('[data-social]');
  if (!mount || !document.body.attachShadow) return;
  var HERE = 'America/Denver';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function cbState() {
    try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return v && v.pass ? v : null; }
    catch (e) { return null; }
  }

  /* ── The box, in the CB's clothes ──────────────────────────────────────── */

  var host = el('div', 'sp-mount');
  var root = host.attachShadow({ mode: 'open' });
  var waiting = 2;
  host.style.visibility = 'hidden';
  ['/cb.css?v=68004e34ba', '/social.css?v=1dde795a98'].forEach(function (href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    function ready() { if (--waiting === 0) { host.style.visibility = ''; land(); } }
    l.addEventListener('load', ready);
    l.addEventListener('error', ready);
    root.appendChild(l);
  });
  var box = el('div', 'sp');
  root.appendChild(box);
  mount.parentNode.insertBefore(host, mount);
  box.appendChild(mount);

  function radioHost() { return document.querySelector('.cb-host'); }
  function dressNow() {
    var lc = window.loveCall, r = radioHost(), s = cbState(), look = null;
    if (r && r.getAttribute('data-scheme')) look = r.getAttribute('data-scheme');
    else if (lc && lc.schemeFor) look = lc.schemeFor((s && s.scheme) || 'auto');
    if (look) host.setAttribute('data-scheme', look);
    host.setAttribute('data-motion', 'off');
  }
  dressNow();
  try {
    var watched = null;
    var onHost = new MutationObserver(dressNow);
    new MutationObserver(function () {
      var r = radioHost();
      if (r && r !== watched) { watched = r; onHost.observe(r, { attributes: true, attributeFilter: ['data-scheme'] }); dressNow(); }
    }).observe(document.body, { childList: true });
  } catch (e) { /* the page keeps the colours it opened in */ }
  ['(prefers-contrast: more)', '(prefers-color-scheme: light)'].forEach(function (q) {
    try { window.matchMedia(q).addEventListener('change', dressNow); } catch (e) { /* an old browser */ }
  });

  /* ── A link to one post ────────────────────────────────────────────────── */

  function land() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    if (!id || !/^[a-z][A-Za-z0-9_-]{1,40}$/.test(id)) return;
    var post = root.getElementById(id);
    if (!post) return;
    post.scrollIntoView({ block: 'start' });
    post.setAttribute('tabindex', '-1');
    post.focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', land);

  /* ── What the office posted since the morning ─────────────────────────── */

  function dayWords(iso) {
    try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: HERE }); }
    catch (e) { return iso.slice(0, 10); }
  }
  function yearOf(iso) {
    try { return +new Date(iso).toLocaleDateString('en-US', { year: 'numeric', timeZone: HERE }); }
    catch (e) { return +iso.slice(0, 4); }
  }
  // The words, with every bare http or https address a link, the punctuation that ends a sentence outside it.
  function linked(p, text) {
    var re = /https?:\/\/[^\s<>"]+/g, at = 0, m;
    while ((m = re.exec(text))) {
      var href = m[0];
      while (/[.,;:!?'"’”]$/.test(href) || (/\)$/.test(href) && href.indexOf('(') < 0)) href = href.slice(0, -1);
      if (m.index > at) p.appendChild(document.createTextNode(text.slice(at, m.index)));
      var a = el('a', null, href); a.href = href;
      p.appendChild(a);
      at = m.index + href.length;
      re.lastIndex = at;
    }
    if (at < text.length) p.appendChild(document.createTextNode(text.slice(at)));
  }
  function paragraph(text) {
    var p = el('p');
    text.split('\n').forEach(function (line, i) {
      if (i) p.appendChild(el('br'));
      linked(p, line);
    });
    return p;
  }
  function postItem(x) {
    var li = el('li', 'sp-post');
    li.id = x.id;
    String(x.text || '').trim().split(/\n\s*\n/).forEach(function (para) { if (para.trim()) li.appendChild(paragraph(para)); });
    var when = el('p', 'sp-when');
    var a = el('a'); a.href = '#' + x.id;
    var t = el('time', null, dayWords(x.t)); t.setAttribute('datetime', x.t);
    a.appendChild(t); when.appendChild(a);
    li.appendChild(when);
    return li;
  }
  function listFor(year) {
    var head = root.getElementById('social-' + year);
    if (head) return head.parentNode.querySelector('.sp-list');
    var sec = el('section', 'sp-year');
    sec.setAttribute('aria-labelledby', 'social-' + year);
    var h = el('h2', null, String(year)); h.id = 'social-' + year;
    var ol = el('ul', 'sp-list');
    sec.appendChild(h); sec.appendChild(ol);
    var first = mount.querySelector('.sp-year');
    mount.insertBefore(sec, first || null);
    return ol;
  }
  fetch('/cb/social', { headers: { accept: 'application/json' }, credentials: 'omit', cache: 'no-store' }).then(function (r) {
    return r.ok ? r.json() : null;
  }).then(function (b) {
    if (!b || !Array.isArray(b.posts)) return;
    b.posts.slice().reverse().forEach(function (x) {
      if (!x || typeof x.id !== 'string' || !/^[a-z][A-Za-z0-9_-]{1,40}$/.test(x.id) || typeof x.t !== 'string' || root.getElementById(x.id)) return;
      var ol = listFor(yearOf(x.t));
      ol.insertBefore(postItem(x), ol.firstChild);
    });
    land();
  }, function () { /* the page as it was built this morning stands */ });
})();
