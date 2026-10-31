/* format.js: buttons over a box that takes Markdown, for the people who would
   rather not write it (requests from our community, 2026-10-22, Ryan's choice
   of a toolbar over a visual editor): Bold, Italic, Link, List, Numbered,
   Checklist where the box takes one, Quote, Heading and Code, and Ctrl or Cmd
   with B, I or K. Highlight words and press Link, or paste an address over
   them, to make them a link; a small form asks for the address.

   THE BOX STAYS PLAIN TEXT, Markdown underneath, so a screen reader, a phone's
   keyboard, Preview and the server's one reader (parseBrass) all go on as they
   were, and anybody who knows Markdown types it as before. Every change goes in
   through the browser's own insertText where it can, so Undo undoes it.

   THE ARIA TOOLBAR PATTERN: one stop in the tab order, arrows move between the
   buttons, Home and End go to the ends, and every button says in words what it
   does. The link form is a plain form under the toolbar: Enter adds the link,
   Escape puts the keyboard back in the box where it was.

   It sets no colour and talks to no server: each page hands it a prefix for its
   classes (tk-, of- or fm-) and dresses it in its own stylesheet, and its own
   way of saying what happened (o.said). Nothing is kept in the browser. */
(function () {
  'use strict';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  var n = 0;

  /* An address as a Markdown link can hold it: http, https or mailto, or a path
     on this site; a bare host gets https://; and nothing that would end the
     link early. Null for anything else. */
  function address(raw) {
    var v = String(raw || '').trim();
    if (!v || v.length > 2000) return null;
    if (/^www\.|^[a-z0-9-]+(\.[a-z0-9-]+)+(\/|$|\?|#|:)/i.test(v) && !/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) v = 'https://' + v;
    if (/^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(v)) v = 'mailto:' + v;
    if (/^(https?:\/\/|mailto:)/i.test(v)) {
      try { var u = new URL(v); if (!/^(https?:|mailto:)$/.test(u.protocol) || u.username || u.password) return null; v = u.href; } catch (e) { return null; }
    } else if (!/^[\/#]/.test(v)) return null;
    return v.replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/</g, '%3C').replace(/>/g, '%3E');
  }
  // A link's words, so a bracket in them never ends the link.
  function linkWords(w) { return String(w).replace(/\s*\n\s*/g, ' ').replace(/([\[\]\\])/g, '\\$1'); }

  /* o: { p (prefix), said(text)?, checklist (the box takes - [ ] boxes) } */
  function toolbar(text, o) {
    var p = o.p, id = 'love-fmt-' + (++n);
    if (!text.id) text.id = id + '-box';
    var bar = el('div', p + '-fmt');
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', 'Formatting');
    bar.setAttribute('aria-controls', text.id);
    var form = el('div', p + '-fmtlink');
    form.setAttribute('role', 'group');
    form.setAttribute('aria-label', 'Add a link');
    form.hidden = true;
    text.parentNode.insertBefore(bar, text);
    text.parentNode.insertBefore(form, text);

    function said(t) { if (o.said) o.said(t); }
    /* Put `insert` in place of start..end, and select from a to b after. */
    function put(start, end, insert, a, b) {
      text.focus();
      text.setSelectionRange(start, end);
      var ok = false;
      try { ok = document.execCommand('insertText', false, insert); } catch (e) { ok = false; }
      if (!ok || text.value.slice(start, start + insert.length) !== insert) {
        text.setRangeText(insert, start, end, 'end');
        text.dispatchEvent(new Event('input', { bubbles: true }));
      }
      text.setSelectionRange(a, b);
    }

    /* Bold, italic, code: around the words chosen, or taken off them if they
       have it; with nothing chosen, around a placeholder that is chosen. */
    function wrap(mark, name, hint) {
      var v = text.value, s = text.selectionStart, e = text.selectionEnd;
      while (s < e && /\s/.test(v[s])) s++;
      while (e > s && /\s/.test(v[e - 1])) e--;
      var m = mark.length, inner = v.slice(s, e);
      // Italic's one star is not bold's two: **words** chosen and Italic pressed makes them both.
      var other = mark === '*' && inner.slice(0, 2) === '**' && inner.slice(0, 3) !== '***';
      if (!other && inner.length >= 2 * m && inner.slice(0, m) === mark && inner.slice(-m) === mark) {
        put(s, e, inner.slice(m, -m), s, e - 2 * m); said(name + ' taken off.'); return;
      }
      if (s >= m && v.slice(s - m, s) === mark && v.slice(e, e + m) === mark && (mark !== '*' || (v[s - m - 1] !== '*' && v[e + m] !== '*'))) {
        put(s - m, e + m, inner, s - m, e - m); said(name + ' taken off.'); return;
      }
      if (s === e) { put(s, e, mark + hint + mark, s + m, s + m + hint.length); said(name + ': type over the highlighted words.'); return; }
      put(s, e, mark + inner + mark, s + m, e + m);
      said(name + '.');
    }

    /* Lists, quotes and headings: the start of every line chosen, or taken off
       every line if they all have it already. */
    var LINES = {
      list: { test: /^(\s*)[-*+] (?!\[[ xX]\] )/, add: function () { return '- '; }, name: 'List' },
      numbered: { test: /^(\s*)\d{1,9}[.)] /, add: function (i) { return (i + 1) + '. '; }, name: 'Numbered list' },
      checklist: { test: /^(\s*)[-*+] \[[ xX]\] /, add: function () { return '- [ ] '; }, name: 'Checklist' },
      quote: { test: /^(\s*)> ?/, add: function () { return '> '; }, name: 'Quote' },
      heading: { test: /^(\s*)#{1,6} /, add: function () { return '## '; }, name: 'Heading' },
    };
    function lines(kind) {
      var k = LINES[kind], v = text.value, s = text.selectionStart, e = text.selectionEnd;
      var from = v.lastIndexOf('\n', s - 1) + 1;
      var to = v.indexOf('\n', e > s && v[e - 1] === '\n' ? e - 1 : e);
      if (to < 0) to = v.length;
      var block = v.slice(from, to).split('\n');
      var full = block.filter(function (l) { return l.trim(); });
      var off = full.length && full.every(function (l) { return k.test.test(l); });
      var i = 0;
      var out = block.map(function (l) {
        if (!l.trim() && block.length > 1) return l;
        if (off) return l.replace(k.test, '$1');
        // A line that is another kind of list item or quote becomes this kind.
        var bare = l.replace(/^(\s*)([-*+] \[[ xX]\] |[-*+] |\d{1,9}[.)] |> ?|#{1,6} )/, '$1');
        return k.add(i++) + bare.replace(/^\s+/, '');
      }).join('\n');
      put(from, to, out, from, from + out.length);
      said(off ? k.name + ' taken off.' : k.name + '.');
    }

    /* THE LINK FORM. The words chosen when it opened become the link's words;
       with nothing chosen it asks for words too, and the address stands for
       itself if none are given. */
    var keep = null;
    var lab = el('label', 'cb-lab', 'Link address');
    var addr = el('input', 'cb-say ' + p + '-fmtlink__in');
    addr.type = 'text'; addr.id = id + '-addr'; addr.autocomplete = 'off'; addr.spellcheck = false;
    addr.setAttribute('inputmode', 'url');
    addr.placeholder = 'https://';
    lab.htmlFor = addr.id;
    var wlab = el('label', 'cb-lab', 'Words to show');
    var words = el('input', 'cb-say ' + p + '-fmtlink__in');
    words.type = 'text'; words.id = id + '-words'; words.autocomplete = 'off';
    wlab.htmlFor = words.id;
    var wrapWords = el('div', p + '-fmtlink__field'); wrapWords.appendChild(wlab); wrapWords.appendChild(words);
    var wrapAddr = el('div', p + '-fmtlink__field'); wrapAddr.appendChild(lab); wrapAddr.appendChild(addr);
    var note = el('p', 'cb-quiet ' + p + '-fmtlink__note', 'To link a task, a forum topic or a record of the office, press Cancel and type [[ where you are writing, not in these fields.');
    var wrong = el('p', p + '-fmtlink__wrong');
    wrong.setAttribute('role', 'alert');
    var row = el('div', p + '-fmtlink__row');
    var add = el('button', 'cb-btn ' + p + '-small', 'Add the link'); add.type = 'button';
    var no = el('button', 'cb-btn ' + p + '-small', 'Cancel'); no.type = 'button';
    row.appendChild(add); row.appendChild(no);
    [wrapAddr, wrapWords, note, wrong, row].forEach(function (x) { form.appendChild(x); });

    function openLink() {
      var v = text.value, s = text.selectionStart, e = text.selectionEnd;
      while (s < e && /\s/.test(v[s])) s++;
      while (e > s && /\s/.test(v[e - 1])) e--;
      keep = { s: s, e: e };
      var chosen = v.slice(s, e);
      wrapWords.hidden = !!chosen;
      words.value = '';
      wrong.textContent = '';
      // Words that are themselves an address are the address.
      addr.value = address(chosen) && !/\s/.test(chosen) ? chosen : '';
      form.hidden = false;
      addr.focus();
    }
    function closeLink(back) {
      form.hidden = true;
      wrong.textContent = '';
      if (back && keep) { text.focus(); text.setSelectionRange(keep.s, keep.e); }
    }
    function addLink() {
      var to = address(addr.value);
      if (!to) { wrong.textContent = 'That is not an address a link can go to: a web address, an email address, or a page on this site starting with /.'; addr.focus(); return; }
      var v = text.value, chosen = keep ? v.slice(keep.s, keep.e) : '';
      var shown = chosen || words.value.trim() || addr.value.trim();
      var md = '[' + linkWords(shown) + '](' + to + ')';
      form.hidden = true;
      var s = keep ? keep.s : text.selectionStart, e = keep ? keep.e : text.selectionEnd;
      put(s, e, md, s + md.length, s + md.length);
      said('Linked “' + shown + '”.');
    }
    add.addEventListener('click', addLink);
    no.addEventListener('click', function () { closeLink(true); said('No link added.'); });
    form.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' && ev.target.tagName === 'INPUT') { ev.preventDefault(); addLink(); }
      else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); closeLink(true); }
    });

    /* The buttons, in the order they are read: each a word, never only a
       symbol, because the people they are for are the ones a ** means nothing to. */
    var BUTTONS = [
      ['Bold', 'Bold (Ctrl or Cmd and B)', function () { wrap('**', 'Bold', 'bold words'); }],
      ['Italic', 'Italic (Ctrl or Cmd and I)', function () { wrap('*', 'Italic', 'italic words'); }],
      ['Link', 'Link the highlighted words (Ctrl or Cmd and K)', openLink],
      ['List', 'Bulleted list', function () { lines('list'); }],
      ['Numbered', 'Numbered list', function () { lines('numbered'); }],
    ];
    if (o.checklist) BUTTONS.push(['Checklist', 'Checklist of boxes to tick', function () { lines('checklist'); }]);
    BUTTONS.push(['Quote', 'Quote', function () { lines('quote'); }]);
    BUTTONS.push(['Heading', 'Heading', function () { lines('heading'); }]);
    BUTTONS.push(['Code', 'Code', function () { wrap('`', 'Code', 'code'); }]);
    var btns = BUTTONS.map(function (b, i) {
      var x = el('button', 'cb-btn ' + p + '-fmt__btn', b[0]);
      x.type = 'button';
      x.setAttribute('aria-label', b[1]);
      x.tabIndex = i ? -1 : 0;
      // Pressing a button keeps the box's selection, which a click would otherwise take.
      x.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
      x.addEventListener('click', function () { b[2](); });
      bar.appendChild(x);
      return x;
    });
    bar.addEventListener('keydown', function (ev) {
      var i = btns.indexOf(ev.target);
      if (i < 0) return;
      var j = ev.key === 'ArrowRight' ? (i + 1) % btns.length : ev.key === 'ArrowLeft' ? (i - 1 + btns.length) % btns.length
        : ev.key === 'Home' ? 0 : ev.key === 'End' ? btns.length - 1 : -1;
      if (j < 0) return;
      ev.preventDefault();
      btns[i].tabIndex = -1; btns[j].tabIndex = 0; btns[j].focus();
    });
    bar.addEventListener('focusin', function (ev) {
      var i = btns.indexOf(ev.target);
      if (i >= 0) btns.forEach(function (x, k) { x.tabIndex = k === i ? 0 : -1; });
    });

    text.addEventListener('keydown', function (ev) {
      if (!(ev.ctrlKey || ev.metaKey) || ev.altKey || ev.isComposing) return;
      var k = ev.key.toLowerCase();
      if (k === 'b') { ev.preventDefault(); wrap('**', 'Bold', 'bold words'); }
      else if (k === 'i') { ev.preventDefault(); wrap('*', 'Italic', 'italic words'); }
      else if (k === 'k') { ev.preventDefault(); openLink(); }
    });
    // An address pasted over highlighted words makes them a link, as most editors do.
    text.addEventListener('paste', function (ev) {
      var s = text.selectionStart, e = text.selectionEnd;
      if (s === e || !ev.clipboardData) return;
      var got = (ev.clipboardData.getData('text/plain') || '').trim();
      if (!/^(https?:\/\/|mailto:)\S+$/i.test(got)) return;
      var chosen = text.value.slice(s, e);
      if (address(chosen) && !/\s/.test(chosen)) return;
      var to = address(got);
      if (!to) return;
      ev.preventDefault();
      var md = '[' + linkWords(chosen) + '](' + to + ')';
      put(s, e, md, s + md.length, s + md.length);
      said('Linked “' + chosen + '”.');
    });
    return { bar: bar };
  }

  window.loveFormat = { toolbar: toolbar, address: address };
})();
