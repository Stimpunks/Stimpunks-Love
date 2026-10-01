/* =============================================================================
   The Brass Tacks Board: news, notices, events, celebrations and posts meant to
   persist. Ryan's brief, 2026-09-30. Anybody reads it; a moderator posts, with
   their username on the post; the moderator who posted it edits it; any
   moderator takes a post down. See netlify/cb/lib.mjs, the Brass Tacks Board.

   EVERY POST ARRIVES AS NODES, NOT HTML. The server reads the Markdown once and
   this file builds what it says with createElement and textContent, so nothing
   a moderator types becomes markup here. tools/make-brass.py refuses
   innerHTML, insertAdjacentHTML or outerHTML anywhere in this file.

   A PICTURE GOES THROUGH THE RADIO'S OWN REDRAW (window.loveRedraw in cb.js),
   which drops everything a camera writes into a file, before anything is sent.
   This file reads love-cb and never writes it, and stores nothing.
   ============================================================================= */
(function () {
  'use strict';

  var list = document.getElementById('brass-posts');
  var state = document.getElementById('brass-state');
  var write = document.getElementById('brass-write');
  var said = document.getElementById('brass-said');
  if (!list || !state) return;

  var me = null;
  try { me = JSON.parse(localStorage.getItem('love-cb') || 'null'); } catch (e) {}
  var base = !!(me && me.pass && (me.base || /^cb[12]\.base\./.test(me.pass)));
  function fold(h) { return String(h || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function say(t) { if (said) said.textContent = t; }

  function call(send, path) {
    var headers = { 'accept': 'application/json' };
    if (send) headers['content-type'] = 'application/json';
    if (send && me) headers['authorization'] = 'Bearer ' + me.pass;
    return fetch(path || '/cb/brass', {
      method: send ? 'POST' : 'GET', headers: headers, body: send ? JSON.stringify(send) : undefined,
      credentials: 'omit', cache: 'no-store',
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; });
    });
  }
  function why(r, otherwise) {
    if (r && r.body && typeof r.body.error === 'string' && r.body.error) return r.body.error;
    if (r && (r.status === 404 || r.status === 405)) return 'The board is not kept on this server. It only answers on stimpunks.world itself.';
    return otherwise;
  }

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

  /* ── The nodes, built ───────────────────────────────────────────────────── */
  function inline(nodes, into) {
    nodes.forEach(function (n) {
      if (n.t === 'text') into.appendChild(document.createTextNode(n.v));
      else if (n.t === 'br') into.appendChild(el('br'));
      else if (n.t === 'code') into.appendChild(el('code', null, n.v));
      else if (n.t === 'b' || n.t === 'i' || n.t === 's') { var w = el({ b: 'strong', i: 'em', s: 'del' }[n.t]); inline(n.c, w); into.appendChild(w); }
      else if (n.t === 'a') {
        var a = el('a'); a.href = n.href; inline(n.c, a);
        try {
          var u = new URL(n.href, location.href);
          if (/^https?:$/.test(u.protocol) && u.host !== location.host) {
            a.rel = 'noopener noreferrer';
            into.appendChild(a);
            var host = el('span', 'btb-host', ' ↗ ' + u.host);
            into.appendChild(host);
            return;
          }
        } catch (e) {}
        into.appendChild(a);
      }
    });
  }
  function blocks(nodes, into) {
    nodes.forEach(function (b) {
      var e;
      if (b.t === 'p') { e = el('p'); inline(b.c, e); }
      else if (b.t === 'h') { e = el('h' + Math.min(6, b.level + 2)); inline(b.c, e); }
      else if (b.t === 'hr') e = el('hr');
      else if (b.t === 'code') { e = el('pre'); e.appendChild(el('code', null, b.v)); e.tabIndex = 0; }
      else if (b.t === 'quote') { e = el('blockquote'); blocks(b.c, e); }
      else if (b.t === 'ul' || b.t === 'ol') {
        e = el(b.t);
        if (b.t === 'ol' && b.start !== 1) e.start = b.start;
        b.items.forEach(function (it) { var li = el('li'); blocks(it, li); e.appendChild(li); });
      } else if (b.t === 'table') {
        var wrap = el('div', 'btb-table'); wrap.tabIndex = 0;
        e = el('table');
        var thead = el('thead'), tr = el('tr');
        b.head.forEach(function (c, k) { var th = el('th'); th.scope = 'col'; if (b.align[k]) th.style.textAlign = b.align[k]; inline(c, th); tr.appendChild(th); });
        thead.appendChild(tr); e.appendChild(thead);
        var tb = el('tbody');
        b.rows.forEach(function (r) {
          var row = el('tr');
          r.forEach(function (c, k) { var td = el('td'); if (b.align[k]) td.style.textAlign = b.align[k]; inline(c, td); row.appendChild(td); });
          tb.appendChild(row);
        });
        e.appendChild(tb);
        wrap.appendChild(e);
        e = wrap;
      }
      if (e) into.appendChild(e);
    });
  }

  /* ── The posts ─────────────────────────────────────────────────────────── */
  var posts = [];
  function draw(focusId) {
    list.textContent = '';
    if (!posts.length) {
      state.hidden = false;
      state.textContent = 'Nothing is pinned up yet.';
      list.hidden = true;
      return;
    }
    state.hidden = true;
    list.hidden = false;
    posts.forEach(function (p) { list.appendChild(plate(p)); });
    var go = focusId || (location.hash.indexOf('#post-') === 0 ? location.hash.slice(6) : null);
    if (go) {
      var h = document.getElementById('post-' + go + '-h');
      if (h) { h.tabIndex = -1; h.focus(); }
    }
  }

  function plate(p) {
    var art = el('article', 'btb-plate');
    art.id = 'post-' + p.id;
    art.setAttribute('aria-labelledby', 'post-' + p.id + '-h');
    ['tl', 'tr', 'bl', 'br'].forEach(function (k) { var t = el('span', 'btb-tack btb-tack--' + k); t.setAttribute('aria-hidden', 'true'); art.appendChild(t); });
    var h = el('h2', 'btb-plate__title', p.title);
    h.id = 'post-' + p.id + '-h';
    art.appendChild(h);
    var by = el('p', 'btb-plate__by');
    by.appendChild(document.createTextNode('Posted by '));
    by.appendChild(el('b', null, p.handle));
    by.appendChild(document.createTextNode(', ' + day(p.t)));
    if (p.edited) by.appendChild(document.createTextNode(' · edited ' + day(p.edited)));
    by.appendChild(document.createTextNode(' · '));
    var link = el('a', null, 'Link to this post'); link.href = '#post-' + p.id;
    by.appendChild(link);
    art.appendChild(by);
    if (p.img) {
      var fig = el('figure', 'btb-plate__pic');
      var img = el('img');
      img.src = '/cb/brass/image?id=' + encodeURIComponent(p.img);
      img.alt = p.alt || '';
      img.loading = 'lazy'; img.decoding = 'async';
      fig.appendChild(img);
      art.appendChild(fig);
    }
    var body = el('div', 'btb-plate__body');
    blocks(p.ast || [], body);
    art.appendChild(body);
    if (base) {
      var tools = el('p', 'btb-plate__tools');
      if (fold(p.handle) === fold(me.handle)) {
        var edit = el('button', 'btb-btn btb-btn--small', 'Edit this post'); edit.type = 'button';
        edit.addEventListener('click', function () { openForm(p, art, edit); });
        tools.appendChild(edit);
      }
      var down = el('button', 'btb-btn btb-btn--small', 'Take this post down'); down.type = 'button';
      down.addEventListener('click', function () { confirmDown(p, tools, down); });
      tools.appendChild(down);
      art.appendChild(tools);
    }
    return art;
  }

  function confirmDown(p, tools, down) {
    var box = el('div', 'btb-sure');
    box.appendChild(el('p', null, 'This takes “' + p.title + '” down for everybody, and its picture with it. It cannot be put back.'));
    var yes = el('button', 'btb-btn btb-btn--small', 'Yes, take it down'); yes.type = 'button';
    var no = el('button', 'btb-btn btb-btn--small', 'Leave it up'); no.type = 'button';
    box.appendChild(yes); box.appendChild(no);
    tools.appendChild(box); down.hidden = true; no.focus();
    no.addEventListener('click', function () { box.remove(); down.hidden = false; down.focus(); });
    yes.addEventListener('click', function () {
      yes.disabled = true;
      call({ action: 'remove', id: p.id }).then(function (r) {
        if (r.status === 200) {
          posts = r.body.posts || []; draw(); say('“' + p.title + '” is down.');
          var top = document.getElementById('btb-posts-h'); if (top) { top.tabIndex = -1; top.focus(); }
          return;
        }
        yes.disabled = false; say(why(r, 'That did not work. Nothing was taken down.'));
      }, function () { yes.disabled = false; say('The board could not be reached just now. Nothing was taken down.'); });
    });
  }

  /* ── Writing: a new post, or editing your own ──────────────────────────── */
  var n = 0;
  function field(label, input, hint) {
    var id = 'btb-f' + (++n);
    var wrap = el('p', 'btb-field');
    var lab = el('label', null, label); lab.htmlFor = id;
    input.id = id;
    wrap.appendChild(lab);
    if (hint) { var h = el('span', 'btb-hint', hint); h.id = id + '-hint'; input.setAttribute('aria-describedby', h.id); wrap.appendChild(h); }
    wrap.appendChild(input);
    return wrap;
  }

  function openForm(p, into, opener) {
    var old = into.querySelector(':scope > .btb-form');
    if (old) { old.remove(); if (opener) opener.focus(); return; }
    var form = el('form', 'btb-form');
    form.noValidate = true;
    var title = el('input', 'btb-in'); title.type = 'text'; title.maxLength = 120; title.required = true; title.autocomplete = 'off';
    var body = el('textarea', 'btb-in btb-in--body'); body.rows = 12; body.maxLength = 20000; body.required = true;
    if (p) { title.value = p.title; body.value = p.body; }
    form.appendChild(field('Title', title));
    form.appendChild(field('What it says', body, 'Markdown works: # headings, **bold**, *italic*, ~~struck~~, `code`, [a link](https://…), - lists, 1. numbered lists, > quotes, ``` code blocks ```, --- a rule, and | tables |. A new line is a new line.'));

    // The picture: chosen, redrawn here, sent, described and said yes to.
    var pic = { id: p && p.img ? p.img : null, url: null };
    var picBox = el('div', 'btb-pic');
    var picLine = el('p', 'btb-pic__line');
    var thumb = el('img', 'btb-pic__thumb'); thumb.alt = ''; thumb.hidden = true;
    var file = el('input'); file.type = 'file'; file.accept = 'image/*'; file.hidden = true; file.tabIndex = -1;
    var choose = el('button', 'btb-btn btb-btn--small', 'Add a picture'); choose.type = 'button';
    var drop = el('button', 'btb-btn btb-btn--small', 'Take the picture off'); drop.type = 'button';
    var alt = el('textarea', 'btb-in'); alt.rows = 2; alt.maxLength = 600;
    var altP = field('Say what is in the picture', alt, 'Needed: the picture is on the board for everybody, and this is what a screen reader says.');
    var yes = el('input'); yes.type = 'checkbox';
    var yesP = el('p', 'btb-check');
    var yesL = el('label'); yesL.appendChild(yes); yesL.appendChild(document.createTextNode(' Everybody recognisable in this picture has said yes to it being on the board, where anybody can see it.'));
    yesP.appendChild(yesL);
    if (p && p.img) { alt.value = p.alt || ''; thumb.src = '/cb/brass/image?id=' + encodeURIComponent(p.img); thumb.hidden = false; }
    function picState() {
      var has = !!pic.id;
      choose.textContent = has ? 'Change the picture' : 'Add a picture';
      drop.hidden = !has; altP.hidden = !has; yesP.hidden = !has; thumb.hidden = !has;
      picLine.textContent = has ? 'The picture, as it will go up:' : 'A picture is up to you. It is redrawn in your browser first, which takes off everything a camera writes into the file.';
    }
    choose.addEventListener('click', function () { file.click(); });
    file.addEventListener('change', function () {
      var f = file.files && file.files[0];
      if (!f) return;
      if (!window.loveRedraw) { say('The radio is still tuning in, and the picture goes through it. Try again in a moment.'); return; }
      say('Getting the picture ready…');
      window.loveRedraw(f).then(function (blob) {
        return fetch('/cb/brass/image', { method: 'POST', body: blob, credentials: 'omit', cache: 'no-store',
          headers: { 'content-type': 'image/jpeg', 'authorization': 'Bearer ' + me.pass, 'accept': 'application/json' } })
          .then(function (r) { return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b, blob: blob }; }); });
      }).then(function (r) {
        if (r.status !== 200 || !r.body.id) { say(why(r, 'That picture did not go up. Try another.')); return; }
        if (pic.url) URL.revokeObjectURL(pic.url);
        pic.id = r.body.id; pic.url = URL.createObjectURL(r.blob);
        thumb.src = pic.url; yes.checked = false;
        picState(); say('The picture is ready. Say what is in it.'); alt.focus();
      }, function () { say('That picture could not be read. Try another.'); });
      file.value = '';
    });
    drop.addEventListener('click', function () { pic.id = null; alt.value = ''; yes.checked = false; picState(); choose.focus(); });
    picBox.appendChild(picLine); picBox.appendChild(thumb);
    var picRow = el('p', 'btb-row'); picRow.appendChild(choose); picRow.appendChild(drop); picBox.appendChild(picRow);
    picBox.appendChild(altP); picBox.appendChild(yesP); picBox.appendChild(file);
    form.appendChild(picBox);
    picState();

    var preview = el('div', 'btb-preview'); preview.hidden = true;
    var row = el('p', 'btb-row');
    var look = el('button', 'btb-btn', 'Preview'); look.type = 'button';
    var go = el('button', 'btb-btn', p ? 'Save the changes' : 'Pin it up'); go.type = 'submit';
    var stop = el('button', 'btb-btn', p ? 'Keep it as it was' : 'Not now'); stop.type = 'button';
    row.appendChild(look); row.appendChild(go); row.appendChild(stop);
    form.appendChild(row);
    form.appendChild(preview);

    look.addEventListener('click', function () {
      call({ action: 'preview', body: body.value }).then(function (r) {
        if (r.status !== 200) { say(why(r, 'The preview did not work just now.')); return; }
        preview.textContent = '';
        preview.appendChild(el('p', 'btb-preview__label', 'Preview, not yet on the board:'));
        var h = el('h2', 'btb-plate__title', title.value || 'Untitled'); preview.appendChild(h);
        var b = el('div', 'btb-plate__body'); blocks(r.body.ast || [], b); preview.appendChild(b);
        preview.hidden = false;
        say('The preview is under the buttons.');
      }, function () { say('The board could not be reached just now.'); });
    });
    stop.addEventListener('click', function () { form.remove(); if (opener) opener.focus(); else say(''); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var send = { action: p ? 'edit' : 'post', title: title.value, body: body.value };
      if (p) send.id = p.id;
      if (pic.id) { send.img = pic.id; send.alt = alt.value; send.yes = yes.checked; }
      go.disabled = true;
      say(p ? 'Saving…' : 'Pinning it up…');
      call(send).then(function (r) {
        go.disabled = false;
        if (r.status === 200) {
          posts = r.body.posts || [];
          if (pic.url) URL.revokeObjectURL(pic.url);
          form.remove();
          draw(r.body.id);
          say(p ? 'Saved.' : 'It is up, with your username on it.');
          return;
        }
        say(why(r, 'That did not work. Nothing was changed.'));
      }, function () { go.disabled = false; say('The board could not be reached just now. Nothing was changed.'); });
    });
    into.appendChild(form);
    title.focus();
  }

  if (base && write) {
    write.hidden = false;
    var open = document.getElementById('brass-new');
    if (open) open.addEventListener('click', function () { openForm(null, write, open); });
  }

  state.textContent = 'Reading the board…';
  call(null).then(function (r) {
    if (r.status === 200 && Array.isArray(r.body.posts)) { posts = r.body.posts; draw(); return; }
    state.textContent = why(r, 'The board could not be read just now.');
  }, function () { state.textContent = 'The board could not be read just now.'; });
}());
