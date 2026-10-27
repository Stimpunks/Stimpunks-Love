/* attach.js: pictures and files on a task in Tasks and on its comments
   (Ryan's asks, 2026-10-27). The second place to take a pattern up moves it
   into one file, as rack.js, table.js and comments.js did: the pictures,
   each pressed to grow and with its description under it; the files, each a
   button that saves it; and the tray that takes new ones before they are
   sent. It sets no colour and talks to no server of its own: each caller
   hands it a prefix for its own classes, its way of fetching one with the
   pass (o.fetch(f)) and of putting one up (o.upload(query, blob)), and its
   words.

   The forums' rules (uploadMeta in lib.mjs): a picture is redrawn by the
   radio's one redraw (window.loveRedraw) before it goes, which takes off what
   a camera wrote into it; a file goes as it is, one of o.kinds, checked by its
   first bytes on the server. A file is only ever saved, never opened here.
   A file bigger than o.part goes up a part at a time and comes back the same
   way (TASK_PART in lib.mjs), because Netlify refuses a request over about
   6 MB before any function sees it; the caller's upload and fetch carry the
   parts, and nothing here knows where they go.
   Nothing is kept in the browser, and every word is built with textContent. */
(function () {
  'use strict';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function sizeWords(n) {
    if (n >= 1000000) return (Math.round(n / 100000) / 10) + ' MB';
    return Math.max(1, Math.round(n / 1000)) + ' KB';
  }
  function dots(kinds) { return kinds.map(function (k) { return '.' + k; }).join(', '); }

  /* A file sent: in one request when it fits a part, and otherwise its first
     part with its name, size and how many parts, the rest one at a time, and
     then done, when the server checks the whole of it. o: { upload(query,
     blob), file, blob, part, say(text) }. Answers the last response. The
     forums call this as well as the tray. */
  function send(o) {
    var file = o.file, blob = o.blob, part = o.part || 0;
    if (!part || blob.size <= part) return o.upload('kind=file&name=' + encodeURIComponent(file.name), blob);
    var parts = Math.ceil(blob.size / part), id = null;
    function said(r) {
      return r.json().catch(function () { return {}; }).then(function (b) {
        if (!r.ok) throw new Error((b && b.error) || 'it could not be sent just now.');
        return b;
      });
    }
    function one(n) {
      o.say('Sending ' + file.name + ', part ' + (n + 1) + ' of ' + parts + '…');
      var piece = blob.slice(n * part, Math.min(blob.size, (n + 1) * part));
      var q = n === 0 ? 'kind=file&name=' + encodeURIComponent(file.name) + '&size=' + blob.size + '&parts=' + parts : 'up=' + encodeURIComponent(id) + '&part=' + n;
      return o.upload(q, piece).then(said).then(function (b) {
        if (n === 0) id = b.id;
        return n + 1 < parts ? one(n + 1) : null;
      });
    }
    return one(0).then(function () {
      o.say('Checking ' + file.name + '…');
      return o.upload('up=' + encodeURIComponent(id) + '&done=1', new Blob([]));
    });
  }
  /* A file fetched whole: one request, or a part at a time, in order, for a
     file kept in parts. Answers its buffers, or null. fetch(f, part). */
  function fetchWhole(fetch1, f) {
    var got = [], n = 0, all = f.parts > 1 ? f.parts : 1;
    function next() {
      return fetch1(f, all > 1 ? n : null).then(function (r) { return r.ok ? r.arrayBuffer() : null; }, function () { return null; }).then(function (buf) {
        if (!buf) return null;
        got.push(buf);
        n++;
        return n < all ? next() : got;
      });
    }
    return next();
  }
  /* A file saved, never opened here: a type no browser shows as a page. */
  function saveAs(bufs, name, into) {
    var url = URL.createObjectURL(new Blob(bufs, { type: 'application/octet-stream' }));
    var a = el('a');
    a.href = url;
    a.download = name;
    a.hidden = true;
    into.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }

  // Pictures already fetched, by whatever key the caller gives them, for the life of the page.
  var fetched = {};

  /* The pictures and files on something, as two lists.
     o: { p, files, key(f), fetch(f, part), say(text), meta(f) (a line under each, or ''), tools(f, li, row) (its buttons) } */
  function shown(o) {
    var p = o.p, wrap = el('div', p + '-files__list');
    var pics = (o.files || []).filter(function (f) { return f.kind === 'pic'; });
    var docs = (o.files || []).filter(function (f) { return f.kind === 'file'; });
    if (pics.length) { var ul = el('ul', p + '-pics'); pics.forEach(function (f) { ul.appendChild(picItem(o, f)); }); wrap.appendChild(ul); }
    if (docs.length) { var ul2 = el('ul', p + '-docs'); docs.forEach(function (f) { ul2.appendChild(docItem(o, f)); }); wrap.appendChild(ul2); }
    return wrap;
  }
  function picItem(o, f) {
    var p = o.p, li = el('li', p + '-pic');
    var said = f.alt || 'A picture with no description.';
    var b = el('button', p + '-pic__btn');
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', 'Larger: ' + said);
    var img = el('img', p + '-pic__img');
    img.alt = '';
    b.appendChild(img);
    li.appendChild(b);
    b.addEventListener('click', function () {
      var big = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(big));
      li.classList.toggle(p + '-pic--large', big);
    });
    var key = o.key(f);
    if (fetched[key]) img.src = fetched[key];
    else o.fetch(f).then(function (r) { return r.ok ? r.blob() : null; }, function () { return null; }).then(function (blob) {
      if (!blob || !/^image\//.test(blob.type)) { b.replaceWith(el('p', 'cb-quiet', 'This picture could not be fetched just now.')); return; }
      img.src = fetched[key] = URL.createObjectURL(blob);
    });
    li.appendChild(el('p', f.alt ? p + '-pic__alt' : p + '-pic__alt cb-quiet', f.alt || 'No description.'));
    var m = o.meta ? o.meta(f) : '';
    if (m) li.appendChild(el('p', p + '-when', m));
    if (o.tools) { var row = el('div', p + '-row'); o.tools(f, li, row); if (row.firstChild) li.appendChild(row); }
    return li;
  }
  function docItem(o, f) {
    var p = o.p, li = el('li', p + '-doc');
    var b = el('button', 'cb-btn ' + p + '-small', 'Save “' + f.name + '”');
    b.type = 'button';
    li.appendChild(b);
    var m = o.meta ? o.meta(f) : '';
    li.appendChild(el('span', p + '-when', (f.name.split('.').pop() || '').toUpperCase() + ', ' + sizeWords(f.size) + (m ? '. ' + m : '')));
    b.addEventListener('click', function () {
      b.disabled = true;
      if (f.parts > 1) o.say('Fetching ' + f.name + ', ' + sizeWords(f.size) + ', in ' + f.parts + ' parts…');
      // A file in parts is fetched a part at a time, in order, and put back together here.
      fetchWhole(o.fetch, f).then(function (bufs) {
        b.disabled = false;
        if (!bufs) { o.say('That file could not be fetched just now.'); return; }
        saveAs(bufs, f.name, li);
        o.say('Saving ' + f.name + '. It is exactly as it was attached: open it only with something you trust.');
      });
    });
    if (o.tools) o.tools(f, li, li);
    return li;
  }

  /* The tray: Add pictures or files (or drop them on o.drop), each put up as
     it is chosen, waiting there with its description box until the caller
     sends them. Ones already on the thing (o.had) wait there too, so an edit
     can leave one out.
     o: { p, id (unique among trays on the page), kinds, fileMax, part, altMax, most, have (how many it holds already),
          upload(query, blob), drop (an element things can be dropped on), changed() }
     Answers { node, list() ([{ id, alt }], everything in the tray), busy(), clear(), keep(key, f) } */
  function tray(o) {
    var p = o.p, kinds = o.kinds || [], fileMax = o.fileMax || 5000000;
    var wrap = el('div', p + '-attach');
    var add = el('button', 'cb-btn ' + p + '-small', 'Add pictures or files'); add.type = 'button';
    var picker = el('input');
    picker.type = 'file';
    picker.multiple = true;
    // Any picture: written in two halves, because a slash and a star together read as the start of a comment to the tools that check this file.
    picker.accept = 'image/' + '*,' + kinds.map(function (k) { return '.' + k; }).join(',');
    picker.hidden = true;
    picker.tabIndex = -1;
    add.addEventListener('click', function () { picker.click(); });
    var ul = el('ul', p + '-att');
    var answer = el('p', p + '-answer');
    answer.setAttribute('role', 'status');
    var note = el('p', 'cb-quiet ' + p + '-hint', 'Pictures are redrawn in your browser before they go, which takes off what a camera wrote into them, where it was taken included. A file goes exactly as it is, with anything written inside it, such as an author’s name. Files can be ' +
      dots(kinds) + ', up to ' + sizeWords(fileMax) + ' each, ' + o.most + ' at most here. Ask anybody recognisable in a picture before you attach it.');
    var items = (o.had || []).map(function (f) { return { id: f.id, kind: f.kind, name: f.name, size: f.size, alt: f.alt || '', had: true, key: o.key ? o.key(f) : null }; });
    var pending = 0;
    function changed() { if (o.changed) o.changed(); }
    function draw() {
      ul.textContent = '';
      items.forEach(function (f, i) {
        var li = el('li', p + '-att__item');
        var src = f.local || (f.key && fetched[f.key]);
        if (f.kind === 'pic') {
          if (src) { var im = el('img', p + '-att__thumb'); im.src = src; im.alt = ''; li.appendChild(im); }
          var id = o.id + '-alt-' + f.id;
          var lab = el('label', null, 'What is in it (if you like)'); lab.htmlFor = id;
          var input = el('input', p + '-input ' + p + '-alt'); input.id = id; input.type = 'text'; input.maxLength = o.altMax || 600; input.value = f.alt;
          input.addEventListener('input', function () { f.alt = input.value; });
          li.appendChild(lab); li.appendChild(input);
          if (f.had) li.appendChild(el('p', 'cb-quiet', 'Already attached.'));
        } else li.appendChild(el('p', null, f.name + ', ' + sizeWords(f.size) + (f.had ? ', already attached.' : ', ready.')));
        var drop = el('button', 'cb-btn ' + p + '-small', 'Leave it out'); drop.type = 'button';
        drop.addEventListener('click', function () {
          items.splice(i, 1);
          draw();
          changed();
          answer.textContent = 'Left out.';
          (ul.querySelector('button') || add).focus();
        });
        li.appendChild(drop);
        ul.appendChild(li);
      });
    }
    function upload(file) {
      var ext = (String(file.name || '').split('.').pop() || '').toLowerCase();
      var isPic = /^image\//.test(file.type || '') && !/svg/.test(file.type);
      if (items.length + pending + (o.have || 0) >= o.most) return file.name + ' did not go: ' + o.most + ' pictures and files at most here.';
      if (!isPic && kinds.indexOf(ext) < 0) return (file.name || 'That') + ' is not a kind of file this takes. It takes pictures, and ' + dots(kinds) + ' files.';
      if (!isPic && file.size > fileMax) return file.name + ' is ' + sizeWords(file.size) + '. A file is ' + sizeWords(fileMax) + ' at most.';
      if (isPic && !window.loveRedraw) return (file.name || 'The picture') + ' did not go: the radio, which redraws pictures, has not finished loading. Try again in a moment.';
      pending++;
      changed();
      answer.textContent = isPic ? 'Redrawing the picture…' : 'Sending ' + file.name + '…';
      (isPic ? window.loveRedraw(file) : Promise.resolve(file)).then(function (blob) {
        var sent = isPic ? o.upload('kind=pic', blob) : send({ upload: o.upload, file: file, blob: blob, part: o.part, say: function (t) { answer.textContent = t; } });
        return sent.then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (b) {
            if (!r.ok) throw new Error((b && b.error) || 'it could not be sent just now.');
            items.push({ id: b.id, kind: b.kind, name: b.name, size: b.size, alt: '', local: isPic ? URL.createObjectURL(blob) : null });
            draw();
            changed();
            answer.textContent = isPic ? 'The picture is ready. Say what is in it, if you like.' : file.name + ' is ready.';
          });
        });
      }).catch(function (e) {
        answer.textContent = (file.name || 'The picture') + ': ' + ((e && e.message && e.message !== 'big') ? e.message : (isPic ? 'it could not be read or made small enough here. Try a screenshot of it, or another picture.' : 'it could not be sent just now.'));
      }).then(function () { pending--; changed(); });
      return null;
    }
    function several(list) {
      var refused = list.map(upload).filter(Boolean);
      if (refused.length) answer.textContent = refused.join(' ');
    }
    picker.addEventListener('change', function () {
      var list = Array.prototype.slice.call(picker.files || []);
      picker.value = '';
      several(list);
    });
    // Dropped on the place it belongs to: the button does the same for a keyboard, a screen reader and a phone.
    if (o.drop) {
      o.drop.addEventListener('dragover', function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') >= 0) { e.preventDefault(); o.drop.classList.add(p + '-files--over'); } });
      o.drop.addEventListener('dragleave', function () { o.drop.classList.remove(p + '-files--over'); });
      o.drop.addEventListener('drop', function (e) {
        if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
        e.preventDefault();
        o.drop.classList.remove(p + '-files--over');
        several(Array.prototype.slice.call(e.dataTransfer.files));
      });
    }
    draw();
    var row = el('div', p + '-row');
    row.appendChild(add);
    wrap.appendChild(row);
    wrap.appendChild(picker);
    wrap.appendChild(ul);
    wrap.appendChild(answer);
    wrap.appendChild(note);
    return {
      node: wrap,
      row: row,
      count: function () { return items.length; },
      fresh: function () { return items.filter(function (f) { return !f.had; }).length; },
      busy: function () { return pending > 0; },
      list: function () { return items.map(function (f) { return { id: f.id, alt: f.alt }; }); },
      // Once sent: the pictures shown from what was redrawn here, with no second fetch, under the keys the caller will fetch them by.
      sent: function (keyOf) { items.forEach(function (f) { if (f.local) fetched[keyOf(f)] = f.local; }); },
      clear: function () { items = []; draw(); changed(); answer.textContent = ''; },
      say: function (t) { answer.textContent = t; },
    };
  }

  /* A record's own Pictures and files part (a task's, a contact's, a grant
     request's, a case's): its heading, what it holds with Describe it and
     Take it off on each, and the tray with Attach them. Anybody who can open
     the record attaches to it and takes one off, as anybody changes it.
     o: { p, id (the record's), heading(level, text), files, key(f), fetch(f, part), upload(query, blob),
          ask(send) (the page's own function, which knows attach, detach and describe), why(r, otherwise),
          say(text), sure(into, text, yesText, yes, back), after(r, said) (the record drawn again, the
          keyboard back on this part), meta(f), kinds, fileMax, part, altMax, most } */
  function section(o) {
    var p = o.p, sec = el('section', p + '-files');
    sec.appendChild(o.heading(3, 'Pictures and files'));
    var files = o.files || [];
    if (!files.length) sec.appendChild(el('p', 'cb-quiet', 'None yet.'));
    else sec.appendChild(shown({ p: p, files: files, key: o.key, fetch: o.fetch, say: o.say, meta: o.meta,
      tools: function (f, li, row) {
        if (f.kind === 'pic') row.appendChild(describer(o, f, row));
        var off = el('button', 'cb-btn ' + p + '-small', 'Take it off'); off.type = 'button';
        off.addEventListener('click', function () { takeOff(o, f, row, off); });
        row.appendChild(off);
      } }));
    // Nothing is attached until Attach them: the tray holds what is put up until then.
    var go = el('button', 'cb-btn ' + p + '-small', 'Attach them'); go.type = 'button'; go.hidden = true;
    var tr = null;
    function sync() { go.hidden = !tr.count(); go.disabled = tr.busy(); go.textContent = tr.count() === 1 ? 'Attach it' : 'Attach them'; }
    tr = tray({ p: p, id: p + '-rec-' + o.id, kinds: o.kinds, fileMax: o.fileMax, part: o.part, altMax: o.altMax, most: o.most, have: files.length,
      key: o.key, upload: o.upload, drop: sec, changed: function () { if (tr) sync(); } });
    tr.row.appendChild(go);
    go.addEventListener('click', function () {
      if (!tr.count() || tr.busy()) return;
      go.disabled = true;
      tr.say('Attaching…');
      o.ask({ action: 'attach', id: o.id, files: tr.list() }).then(function (r) {
        go.disabled = false;
        if (r.status !== 200) { tr.say(o.why(r, 'Nothing was attached. Try again in a moment.')); return; }
        var n = tr.count();
        tr.sent(o.key);
        o.after(r, n === 1 ? 'Attached.' : n + ' attached.');
      });
    });
    sec.appendChild(tr.node);
    return sec;
  }
  function takeOff(o, f, row, btn) {
    var name = f.kind === 'pic' ? (f.alt ? 'the picture “' + f.alt + '”' : 'this picture') : '“' + f.name + '”';
    o.sure(row, 'This takes ' + name + ' off and deletes it for everybody. It cannot be put back.', 'Take it off', function (done) {
      o.ask({ action: 'detach', id: o.id, f: f.id }).then(function (r) {
        done();
        if (r.status !== 200) { o.say(o.why(r, 'That was not taken off. Nothing was changed.')); return; }
        o.after(r, 'Taken off and deleted.');
      });
    }, btn);
  }
  function describer(o, f, row) {
    var p = o.p;
    var describe = el('button', 'cb-btn ' + p + '-small', f.alt ? 'Change its description' : 'Describe it');
    describe.type = 'button';
    describe.addEventListener('click', function () {
      describe.hidden = true;
      var form = el('div', p + '-describe');
      var id = p + '-alt-' + f.id;
      var lab = el('label', null, 'What is in it');
      lab.htmlFor = id;
      var input = el('input', p + '-input ' + p + '-alt');
      input.id = id;
      input.type = 'text';
      input.maxLength = o.altMax || 600;
      input.value = f.alt || '';
      var save = el('button', 'cb-btn ' + p + '-small', 'Save it'); save.type = 'button';
      var cancel = el('button', 'cb-btn ' + p + '-small', 'Cancel'); cancel.type = 'button';
      form.appendChild(lab); form.appendChild(input); form.appendChild(save); form.appendChild(cancel);
      row.appendChild(form);
      input.focus();
      cancel.addEventListener('click', function () { form.remove(); describe.hidden = false; describe.focus(); });
      function sendIt() {
        save.disabled = true;
        o.ask({ action: 'describe', id: o.id, f: f.id, alt: input.value }).then(function (r) {
          save.disabled = false;
          if (r.status !== 200) { o.say(o.why(r, 'That did not save. Nothing was changed.')); return; }
          o.after(r, input.value.trim() ? 'Its description is saved.' : 'Its description is taken off.');
        });
      }
      save.addEventListener('click', sendIt);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); sendIt(); } if (e.key === 'Escape') { e.preventDefault(); cancel.click(); } });
    });
    return describe;
  }

  window.loveAttach = { section: section, shown: shown, tray: tray, send: send, fetchWhole: fetchWhole, saveAs: saveAs, sizeWords: sizeWords };
})();
