/* =============================================================================
   The suggestion box in The Sandbox. Ryan's brief, 2026-10-13:
   anybody signed on to the CB drops in a suggestion, a feature request or a bug
   report; anybody reads the box; a moderator answers each one, done or not
   doing, with a reply. See netlify/cb/lib.mjs, the suggestion box.

   WHAT IS IN THE BOX ARRIVES AS NODES, NOT HTML, and markdown.js builds it with
   createElement and textContent, so nothing anybody types becomes markup here.
   tools/make-sandbox.py refuses innerHTML and its relatives in this file,
   refuses storage, and refuses a request anywhere but /cb/suggestions and its
   pictures. This file reads love-cb and never writes it.

   A SUGGESTION AND AN ANSWER CAN CARRY PICTURES (Ryan's call, 2026-10-25), a
   screenshot of a bug most of all. Each goes through window.loveRedraw, the
   CB's one redraw in cb.js, which takes off everything a camera or a phone
   wrote into it before anything is sent; this file draws on no canvas of its
   own. Each is shown as it was redrawn, needs a sentence saying what it shows,
   and goes in only with a tick saying the sender has looked at all of it,
   because a screenshot is a picture of somebody's screen and the box is public.

   NOTHING IS COUNTED. The filters say what is showing, never how many there
   are: a number beside a box of other people's requests is a league table of
   what the street has not done yet.
   ============================================================================= */
(function () {
  'use strict';

  var items = document.getElementById('suggest-items');
  var state = document.getElementById('suggest-state');
  var write = document.getElementById('suggest-write');
  var signon = document.getElementById('suggest-signon');
  var said = document.getElementById('suggest-said');
  var filters = document.getElementById('suggest-filter');
  if (!items || !state || !window.loveMarkdown) return;

  var me = null;
  try { me = JSON.parse(localStorage.getItem('love-cb') || 'null'); } catch (e) {}
  if (!me || !me.pass || !me.handle) me = null;
  var base = !!(me && (me.base || /^cb[12]\.base\./.test(me.pass)));

  var KINDS = { suggestion: 'Suggestion', feature: 'Feature request', bug: 'Bug report' };
  var STATUS = { open: 'Open', done: 'Done', denied: 'Not doing' };

  function fold(h) { return String(h || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim(); }
  // Words go where the hand is: inside the form that was pressed while it is
  // open, and in the box's own line once it has gone (the Playhouse's lesson).
  function say(t, here) { var at = here || said; if (at) at.textContent = t; }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function day(t) {
    try { return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { return ''; }
  }
  function words(nodes, into) { window.loveMarkdown.blocks(nodes, into, { top: 4, prefix: 'sbs' }); }
  function picUrl(id) { return '/cb/suggestions/image?id=' + encodeURIComponent(id); }
  // The pictures on a suggestion or an answer, each whole, each opening at its
  // full size, each with its description as its words.
  function shots(list, into) {
    if (!list || !list.length) return;
    var ul = el('ul', 'sbs-shots');
    list.forEach(function (x) {
      var li = el('li', 'sbs-shot');
      var a = el('a'); a.href = picUrl(x.id);
      var img = el('img'); img.src = picUrl(x.id); img.alt = x.alt || '';
      img.loading = 'lazy'; img.decoding = 'async';
      a.appendChild(img); li.appendChild(a); ul.appendChild(li);
    });
    into.appendChild(ul);
  }

  // The CB's own rule for taking a message off (canTakeOff in lib.mjs, and
  // Radio.prototype.mine in cb.js), copied only to decide whether to draw the
  // button. The server decides; change all three together.
  function mine(p) {
    if (!me) return false;
    if (base) return true;
    if (p.base || fold(p.handle) !== fold(me.handle)) return false;
    return !p.claimed || /^cb2\.acct\./.test(me.pass);
  }

  function call(send) {
    var headers = { 'accept': 'application/json' };
    if (send) headers['content-type'] = 'application/json';
    if (send && me) headers['authorization'] = 'Bearer ' + me.pass;
    return fetch('/cb/suggestions', {
      method: send ? 'POST' : 'GET', headers: headers, body: send ? JSON.stringify(send) : undefined,
      credentials: 'omit', cache: 'no-store',
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; });
    });
  }
  function why(r, otherwise) {
    if (r && r.status === 401) return 'Since you signed on, this username has been signed off. Sign on again at the Community Center, then come back.';
    if (r && r.body && typeof r.body.error === 'string' && r.body.error) return r.body.error;
    if (r && (r.status === 404 || r.status === 405)) return 'The box is not kept on this server. It only answers on stimpunks.world itself.';
    return otherwise;
  }

  /* ── The box ───────────────────────────────────────────────────────────── */
  var all = [], showing = 'all';

  function draw(focusId) {
    items.textContent = '';
    var list = all.filter(function (p) { return showing === 'all' || p.status === showing; });
    if (!all.length) {
      state.hidden = false; items.hidden = true;
      state.textContent = 'The box is empty. Yours could be the first thing in it.';
      return;
    }
    if (!list.length) {
      state.hidden = false; items.hidden = true;
      state.textContent = 'Nothing in the box is ' + STATUS[showing].toLowerCase() + ' just now.';
      return;
    }
    state.hidden = true; items.hidden = false;
    list.forEach(function (p) { items.appendChild(card(p)); });
    var go = focusId || (location.hash.indexOf('#suggestion-') === 0 ? location.hash.slice(12) : null);
    if (go) {
      var h = document.getElementById('suggestion-' + go + '-h');
      if (h) { h.tabIndex = -1; h.focus(); }
    }
  }

  function who(line, handle, p) {
    line.appendChild(el('b', null, handle));
    var mark = p.base ? 'BASE' : p.claimed ? 'CLAIMED' : null;
    if (mark) { line.appendChild(document.createTextNode(' ')); line.appendChild(el('span', 'sbs-mark', mark)); }
  }

  function card(p) {
    var art = el('article', 'sbs-item');
    art.id = 'suggestion-' + p.id;
    art.setAttribute('aria-labelledby', 'suggestion-' + p.id + '-h');
    art.appendChild(el('p', 'sbs-item__kind', (KINDS[p.kind] || 'Suggestion') + ' · ' + (STATUS[p.status] || 'Open')));
    var h = el('h4', 'sbs-item__title', p.title);
    h.id = 'suggestion-' + p.id + '-h';
    art.appendChild(h);
    var by = el('p', 'sbs-item__by');
    by.appendChild(document.createTextNode('From '));
    who(by, p.handle, p);
    by.appendChild(document.createTextNode(', ' + day(p.t) + ' · '));
    var link = el('a', null, 'Link to this'); link.href = '#suggestion-' + p.id;
    by.appendChild(link);
    art.appendChild(by);
    var body = el('div', 'sbs-item__body');
    words(p.ast || [], body);
    art.appendChild(body);
    shots(p.pics, art);
    if (p.answer) {
      var ans = el('div', 'sbs-answer');
      var head = el('p', 'sbs-answer__head');
      head.appendChild(el('b', null, STATUS[p.answer.status] || ''));
      head.appendChild(document.createTextNode(', answered by '));
      who(head, p.answer.handle, { base: true });
      head.appendChild(document.createTextNode(', ' + day(p.answer.t)));
      ans.appendChild(head);
      var reply = el('div', 'sbs-answer__body');
      words(p.answer.ast || [], reply);
      shots(p.answer.pics, reply);
      ans.appendChild(reply);
      art.appendChild(ans);
    }
    if (base || mine(p)) {
      var tools = el('p', 'sbs-item__tools');
      if (base) {
        var answer = el('button', 'sbs-btn sbs-btn--small', p.answer ? 'Change the answer' : 'Answer this'); answer.type = 'button';
        answer.addEventListener('click', function () { answerForm(p, art, answer); });
        tools.appendChild(answer);
      }
      var down = el('button', 'sbs-btn sbs-btn--small', 'Take this down'); down.type = 'button';
      down.addEventListener('click', function () { confirmDown(p, tools, down); });
      tools.appendChild(down);
      art.appendChild(tools);
    }
    return art;
  }

  function confirmDown(p, tools, down) {
    var box = el('div', 'sbs-sure');
    box.appendChild(el('p', null, 'This takes “' + p.title + '” out of the box for everybody, with its answer and its pictures. It cannot be put back.'));
    var yes = el('button', 'sbs-btn sbs-btn--small', 'Yes, take it down'); yes.type = 'button';
    var no = el('button', 'sbs-btn sbs-btn--small', 'Leave it in'); no.type = 'button';
    box.appendChild(yes); box.appendChild(no);
    var here = el('p', 'sbs-said'); here.setAttribute('role', 'status'); box.appendChild(here);
    tools.appendChild(box); down.hidden = true; no.focus();
    no.addEventListener('click', function () { box.remove(); down.hidden = false; down.focus(); });
    yes.addEventListener('click', function () {
      yes.disabled = true;
      call({ action: 'remove', id: p.id }).then(function (r) {
        if (r.status === 200) {
          all = r.body.items || []; draw(); say('“' + p.title + '” is out of the box.');
          var top = document.getElementById('suggest-list-h'); if (top) { top.tabIndex = -1; top.focus(); }
          return;
        }
        yes.disabled = false; say(why(r, 'That did not work. Nothing was taken down.'), here);
      }, function () { yes.disabled = false; say('The box could not be reached just now. Nothing was taken down.', here); });
    });
  }

  /* ── Forms, built here because a page with no script shows no dead control ── */
  var n = 0;
  function field(label, input, hint) {
    var id = 'sbs-f' + (++n);
    var wrap = el('p', 'sbs-field');
    var lab = el('label', null, label); lab.htmlFor = id;
    input.id = id;
    wrap.appendChild(lab);
    if (hint) { var h = el('span', 'sbs-hint', hint); h.id = id + '-hint'; input.setAttribute('aria-describedby', h.id); wrap.appendChild(h); }
    wrap.appendChild(input);
    return wrap;
  }
  function choices(legend, name, options, checked) {
    var set = el('fieldset', 'sbs-choices');
    set.appendChild(el('legend', null, legend));
    var group = 'sbs-r' + (++n);
    options.forEach(function (o) {
      var lab = el('label', 'sbs-choice');
      var r = el('input'); r.type = 'radio'; r.name = group; r.value = o[0];
      if (o[0] === checked) r.checked = true;
      lab.appendChild(r); lab.appendChild(document.createTextNode(' ' + o[1]));
      set.appendChild(lab);
    });
    set.value = function () { var c = set.querySelector('input:checked'); return c ? c.value : ''; };
    return set;
  }
  function row() { return el('p', 'sbs-row'); }
  function readout() { var p = el('p', 'sbs-said'); p.setAttribute('role', 'status'); return p; }
  function button(text, type) { var b = el('button', 'sbs-btn', text); b.type = type || 'button'; return b; }

  /* ── Pictures ──────────────────────────────────────────────────────────
     had is the pictures already on what is being written (an answer being
     changed); here is the form's own readout. Answers the field, with what
     to send (list), whether the sender ticked (yes), whether it is ready to
     go (check), a way in for a pasted or dropped one (take), and what to do
     once the form has gone (done). */
  var PICS = 4;
  function onlyPictures(files) {
    return Array.prototype.slice.call(files || []).filter(function (f) { return /^image\//.test(f.type || '') && !/svg/i.test(f.type); });
  }
  function picsField(had, here) {
    var set = el('fieldset', 'sbs-choices sbs-pics');
    set.appendChild(el('legend', null, 'Pictures, if you like'));
    var hint = el('p', 'sbs-hint', 'Up to ' + PICS + ', a screenshot of a bug most of all. You can paste one into the words, or drop one on them. Each is redrawn in your browser before it goes, which takes off anything a camera or a phone wrote into it, and anybody can see it in the box, so look at all of it first.');
    hint.id = 'sbs-f' + (++n);
    set.appendChild(hint);
    var list = el('ul', 'sbs-pics__list');
    set.appendChild(list);
    // image/ and its star in two halves: the tools read a slash and a star as a comment.
    var file = el('input'); file.type = 'file'; file.accept = 'image/' + '*'; file.multiple = true; file.hidden = true; file.tabIndex = -1;
    var add = button('Add a picture');
    add.setAttribute('aria-describedby', hint.id);
    var addRow = row(); addRow.appendChild(add); addRow.appendChild(file);
    set.appendChild(addRow);
    var yes = el('input'); yes.type = 'checkbox';
    var yesP = el('p', 'sbs-check');
    var yesL = el('label'); yesL.appendChild(yes);
    yesL.appendChild(document.createTextNode(' I have looked at all of every picture. Nothing in it is private: no messages but my own, no faces from a call, nothing from my other tabs, emails or notifications, and anybody recognisable in it has said yes to it being in the box, where anybody can see it.'));
    yesP.appendChild(yesL);
    set.appendChild(yesP);

    var pics = [], pending = 0;
    function lay() {
      list.textContent = '';
      pics.forEach(function (x, k) {
        var li = el('li', 'sbs-pic');
        var img = el('img', 'sbs-pic__thumb'); img.alt = ''; img.src = x.url;
        li.appendChild(img);
        var right = el('div', 'sbs-pic__about');
        right.appendChild(el('p', 'sbs-pic__name', x.name ? x.name + ', as it will go in' : 'Picture ' + (k + 1) + ', as it is now'));
        var alt = el('textarea', 'sbs-in'); alt.rows = 2; alt.maxLength = 600; alt.value = x.alt;
        alt.addEventListener('input', function () { x.alt = alt.value; });
        x.box = alt;
        right.appendChild(field('What picture ' + (k + 1) + ' shows', alt, 'Needed: a screen reader says this in its place.'));
        var off = button('Take picture ' + (k + 1) + ' off');
        off.classList.add('sbs-btn--small');
        off.addEventListener('click', function () {
          pics.splice(k, 1);
          if (x.mine) URL.revokeObjectURL(x.url);
          lay();
          say('Picture ' + (k + 1) + ' is off. Nothing of it goes in the box.', here);
          var next = list.querySelectorAll('textarea')[Math.min(k, pics.length - 1)];
          (next || add).focus();
        });
        right.appendChild(off);
        li.appendChild(right);
        list.appendChild(li);
      });
      list.hidden = !pics.length;
      yesP.hidden = !pics.length;
      add.textContent = pics.length ? 'Add another picture' : 'Add a picture';
    }
    (had || []).forEach(function (x) { pics.push({ id: x.id, alt: x.alt || '', url: picUrl(x.id) }); });
    lay();

    function take(files) {
      var room = PICS - pics.length - pending;
      if (files.length > room) say('Up to ' + PICS + ' pictures go with each one, so ' + (room > 0 ? 'only the first ' + (room === 1 ? 'one' : room) + ' will go.' : 'none of those will go.'), here);
      files.slice(0, Math.max(0, room)).forEach(send);
    }
    function send(f) {
      if (!window.loveRedraw) { say('The radio is still tuning in, and every picture goes through it. Try again in a moment.', here); return; }
      var name = f.name || 'the picture';
      pending++; lay();
      say('Getting ' + name + ' ready…', here);
      window.loveRedraw(f).then(function (blob) {
        return fetch('/cb/suggestions/image', {
          method: 'POST', body: blob, credentials: 'omit', cache: 'no-store',
          headers: { 'content-type': 'image/jpeg', 'authorization': 'Bearer ' + me.pass, 'accept': 'application/json' },
        }).then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b, blob: blob }; });
        }, function () { return { away: true }; });
      }, function (e) { return { bad: e && e.message === 'big' ? 'big' : 'read' }; }).then(function (r) {
        pending--;
        if (r.bad || r.away || r.status !== 200 || !r.body.id) {
          lay();
          say(r.bad === 'big' ? name + ' is too big, even made smaller. Try a smaller one.' :
            r.bad ? name + ' could not be read as a picture. Try another.' :
            r.away ? name + ' did not go in: the box could not be reached just now.' :
            why(r, name + ' did not go in. Try another.'), here);
          return;
        }
        var x = { id: r.body.id, alt: '', url: URL.createObjectURL(r.blob), name: f.name || '', mine: true };
        pics.push(x); yes.checked = false; lay();
        say(name + ' is ready, redrawn as it will go in. Say what it shows.', here);
        x.box.focus();
      });
    }
    add.addEventListener('click', function () {
      if (pics.length + pending >= PICS) { say('Up to ' + PICS + ' pictures go with each one. Take one off to add another.', here); return; }
      file.click();
    });
    file.addEventListener('change', function () { take(onlyPictures(file.files)); file.value = ''; });

    return {
      el: set,
      take: take,
      list: function () { return pics.map(function (x) { return { id: x.id, alt: x.alt }; }); },
      yes: function () { return pics.length ? yes.checked : false; },
      // The first thing still to do before it can go, put where the hand is.
      check: function () {
        if (pending) { say('A picture is still getting ready. Wait a moment, then send it.', here); return false; }
        for (var k = 0; k < pics.length; k++) {
          if (!pics[k].alt.trim()) { say('Say what picture ' + (k + 1) + ' shows first.', here); pics[k].box.focus(); return false; }
        }
        if (pics.length && !yes.checked) { say('Look at all of every picture, then tick the box under them.', here); yes.focus(); return false; }
        return true;
      },
      done: function () { pics.forEach(function (x) { if (x.mine) URL.revokeObjectURL(x.url); }); },
    };
  }
  // A screenshot pasted into the words, or a picture dropped on them, joins
  // the pictures. Words pasted stay words.
  function picturesFrom(box, pics) {
    box.addEventListener('paste', function (e) {
      var f = onlyPictures(e.clipboardData && e.clipboardData.files);
      if (!f.length) return;
      if (!(e.clipboardData.getData('text/plain'))) e.preventDefault();
      pics.take(f);
    });
    box.addEventListener('dragover', function (e) {
      if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') >= 0) e.preventDefault();
    });
    box.addEventListener('drop', function (e) {
      var f = onlyPictures(e.dataTransfer && e.dataTransfer.files);
      if (!f.length) return;
      e.preventDefault();
      pics.take(f);
    });
  }

  /* preset fills the form for a room that sends people here with something
     particular to ask: Chimera Obscura's "ask for an animal" arrives at
     #suggest-chimera. The words are still theirs to change or send. */
  function suggestForm(opener, preset) {
    var old = write.querySelector('.sbs-form');
    if (old) { if (preset) return; old.remove(); opener.focus(); return; }
    var form = el('form', 'sbs-form');
    form.noValidate = true;
    var kind = choices('What is it?', 'kind', [['suggestion', 'A suggestion'], ['feature', 'A feature request'], ['bug', 'A bug report']], 'suggestion');
    var title = el('input', 'sbs-in'); title.type = 'text'; title.maxLength = 120; title.autocomplete = 'off';
    var body = el('textarea', 'sbs-in sbs-in--body'); body.rows = 8; body.maxLength = 4000;
    if (preset) { title.value = preset.title || ''; body.value = preset.body || ''; }
    form.appendChild(kind);
    form.appendChild(field('A title', title));
    form.appendChild(field('Say more', body, 'Half an idea is fine. For a bug: which room, what you pressed, what happened, what you expected, and which browser. A screenshot can go with it, below. Markdown works: **bold**, *italic*, `code`, [a link](https://…), - lists, > quotes and ``` code blocks ```.'));
    var preview = el('div', 'sbs-preview'); preview.hidden = true;
    var buttons = row();
    var look = button('Preview'), go = button('Drop it in', 'submit'), stop = button('Not now');
    buttons.appendChild(look); buttons.appendChild(go); buttons.appendChild(stop);
    var here = readout();
    var pics = picsField([], here);
    picturesFrom(body, pics);
    form.appendChild(pics.el);
    form.appendChild(buttons);
    form.appendChild(here);
    form.appendChild(preview);
    look.addEventListener('click', function () {
      call({ action: 'preview', body: body.value }).then(function (r) {
        if (r.status !== 200) { say(why(r, 'The preview did not work just now.'), here); return; }
        preview.textContent = '';
        preview.appendChild(el('p', 'sbs-preview__label', 'Preview, not in the box yet:'));
        preview.appendChild(el('p', 'sbs-item__title', title.value || 'Untitled'));
        var b = el('div', 'sbs-item__body'); words(r.body.ast || [], b); preview.appendChild(b);
        preview.hidden = false;
        say('The preview is under the buttons.', here);
      }, function () { say('The box could not be reached just now.', here); });
    });
    stop.addEventListener('click', function () { pics.done(); form.remove(); opener.focus(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!pics.check()) return;
      go.disabled = true;
      say('Dropping it in…', here);
      call({ action: 'suggest', kind: kind.value(), title: title.value, body: body.value, pics: pics.list(), yes: pics.yes() }).then(function (r) {
        go.disabled = false;
        if (r.status === 200) {
          all = r.body.items || [];
          pics.done();
          form.remove();
          showing = 'all'; pressFilter();
          draw(r.body.id);
          say('It is in the box, with your handle on it. A moderator will answer it.');
          return;
        }
        say(why(r, 'That did not work. Nothing went in the box.'), here);
      }, function () { go.disabled = false; say('The box could not be reached just now. Nothing went in.', here); });
    });
    write.appendChild(form);
    if (preset) { title.focus(); title.setSelectionRange(title.value.length, title.value.length); }
    else kind.querySelector('input').focus();
  }

  function answerForm(p, art, opener) {
    var old = art.querySelector(':scope > .sbs-form');
    if (old) { old.remove(); opener.focus(); return; }
    var form = el('form', 'sbs-form');
    form.noValidate = true;
    var status = choices('Your answer', 'status', [['done', 'Done'], ['denied', 'Not doing'], ['open', 'Still open (takes any answer off)']],
      p.answer ? p.answer.status : 'done');
    var reply = el('textarea', 'sbs-in sbs-in--body'); reply.rows = 5; reply.maxLength = 2000;
    if (p.answer) reply.value = p.answer.body;
    form.appendChild(status);
    form.appendChild(field('Your reply', reply, 'Needed for done and not doing: whoever asked reads it, with your username on it. Markdown works. Still open takes the reply and its pictures off.'));
    var buttons = row();
    var go = button('Save the answer', 'submit'), stop = button('Leave it');
    buttons.appendChild(go); buttons.appendChild(stop);
    var here = readout();
    var pics = picsField(p.answer ? p.answer.pics : [], here);
    picturesFrom(reply, pics);
    form.appendChild(pics.el);
    // Still open takes the answer off, pictures and all, so it asks for none.
    function openNow() { pics.el.hidden = status.value() === 'open'; }
    status.addEventListener('change', openNow); openNow();
    form.appendChild(buttons);
    form.appendChild(here);
    stop.addEventListener('click', function () { pics.done(); form.remove(); opener.focus(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var open = status.value() === 'open';
      if (!open && !pics.check()) return;
      go.disabled = true;
      say('Saving…', here);
      call({ action: 'answer', id: p.id, status: status.value(), reply: reply.value,
        pics: open ? [] : pics.list(), yes: open ? false : pics.yes() }).then(function (r) {
        go.disabled = false;
        if (r.status === 200) { all = r.body.items || []; pics.done(); draw(p.id); say('Answered, with your username on it.'); return; }
        say(why(r, 'That did not work. The answer was not changed.'), here);
      }, function () { go.disabled = false; say('The box could not be reached just now. The answer was not changed.', here); });
    });
    art.appendChild(form);
    status.querySelector('input:checked').focus();
  }

  /* ── What is showing ───────────────────────────────────────────────────── */
  function pressFilter() {
    if (!filters) return;
    Array.prototype.forEach.call(filters.querySelectorAll('button[data-show]'), function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-show') === showing));
    });
  }
  if (filters) {
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-show]');
      if (!b) return;
      showing = b.getAttribute('data-show');
      pressFilter(); draw();
      say(showing === 'all' ? 'Showing everything in the box.' : 'Showing what is ' + STATUS[showing].toLowerCase() + '.');
    });
  }

  if (me && write) {
    write.hidden = false;
    var line = document.getElementById('suggest-who');
    if (line) line.textContent = me.handle;
    var open = document.getElementById('suggest-new');
    if (open) open.addEventListener('click', function () { suggestForm(open); });
    if (open && location.hash === '#suggest-chimera') {
      suggestForm(open, {
        title: 'Chimera Obscura: please add ',
        body: 'Which animal, or which part, and anything about how it looks that matters to you.'
      });
      write.scrollIntoView({ block: 'start' });
    }
  } else if (signon) {
    signon.hidden = false;
    if (location.hash === '#suggest-chimera') signon.scrollIntoView({ block: 'start' });
  }

  state.textContent = 'Reading the box…';
  call(null).then(function (r) {
    if (r.status === 200 && Array.isArray(r.body.items)) {
      all = r.body.items;
      if (filters) { filters.hidden = false; pressFilter(); }
      draw();
      return;
    }
    state.textContent = why(r, 'The box could not be read just now.');
  }, function () { state.textContent = 'The box could not be read just now.'; });
}());
