/* The Open Notebook's sticker drawer: the days of the week and the months of
   the year, by name, drawn onto 4 x 7 inch sheets for Liene's PixCut S1 and
   saved to the visitor's own device as PNGs.

   EVERY NUMBER IS THE PAGE'S. The paper, the printable area, the resolution,
   the inset, the gap, the label's proportions and the sizes are read off the
   drawer's data- attributes, which tools/make-open-notebook.py writes out of
   data/open-notebook.json into the same block as the sentences that state
   them. Nothing here is a second copy of any of them.

   IT KEEPS NOTHING AND SENDS NOTHING. No storage and no request: a sheet is
   drawn on a canvas and saving it hands a file to the browser's own download,
   the Small Hours' placemat's way. make-open-notebook.py refuses this file if
   that ever changes, and refuses anything here that builds markup out of a
   string, so a face's name or its designer's can never become markup.

   ONE FACE AND SIZE, ONE STICKER. The word is sized so that the tallest and
   deepest letters of all nineteen names fit between the label's top and bottom
   padding, and every label in a size is the same height with its baseline in
   the same place. So a Monday off the week's sheet is the same sticker as a
   Monday off a sheet of Mondays, and a row of them in a notebook lines up.

   AS MANY AS WILL GO. The stickers are packed into the printable area, inset
   all round, as upright rows, as columns turned on their side, or as a band of
   one with the other in what is left, and whichever holds most wins. The
   week's and the year's sheets fill with whole weeks or years first, biggest
   label first into the first row it fits, and then go round the names again
   in their order putting in whatever still fits. Within a row the stickers
   read in the names' order.

   THE FACE MUST LOAD OR NOTHING IS DRAWN IN IT. A canvas draws in a stand-in
   face without a word when the real one has not arrived, and a sheet saying
   Doto drawn in somebody's default sans would be a false label on a file
   somebody prints. So the face is loaded and checked first, and if it cannot
   be, the drawer says so and stays on the face it had. */
(function () {
  'use strict';

  var box = document.querySelector('[data-stickers]');
  if (!box) return;
  var probe = document.createElement('canvas');
  var pctx = probe.getContext && probe.getContext('2d');
  if (!pctx || !probe.toBlob || !window.Uint8Array || !window.TextEncoder ||
      !('actualBoundingBoxAscent' in pctx.measureText('M'))) return;

  function nums(name) {
    return (box.getAttribute(name) || '').split(/\s+/).map(parseFloat);
  }
  function num(name) { return parseFloat(box.getAttribute(name)); }

  var PAPER = nums('data-paper');          // mm
  var PRINT = nums('data-printable');      // mm
  var DPI = num('data-dpi');
  var INSET = num('data-inset');
  var GAP = num('data-gap');
  var PAD = num('data-pad');               // fractions of a label's height
  var VPAD = num('data-vpad');
  var ROUND = num('data-round');
  var DAYS = box.getAttribute('data-days').split(' ');
  var MONTHS = box.getAttribute('data-months').split(' ');
  var ALL = DAYS.concat(MONTHS);
  // Where the stickers may go, in mm from the paper's top left: the printable
  // area, centred on the paper, brought in by the inset on every side.
  var AREA = {
    x: (PAPER[0] - PRINT[0]) / 2 + INSET, y: (PAPER[1] - PRINT[1]) / 2 + INSET,
    w: PRINT[0] - 2 * INSET, h: PRINT[1] - 2 * INSET
  };
  var REF = 200;                           // px, the size every face is measured at
  var PREVIEW = 600;                       // px across a sheet on the page
  var NUMBER = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
                'ten', 'eleven', 'twelve'];

  var face = box.querySelector('[data-stk-face]');
  var sizeButtons = [].slice.call(box.querySelectorAll('[data-stk-size]'));
  var sheetButtons = [].slice.call(box.querySelectorAll('[data-stk-sheet]'));
  var credit = box.querySelector('[data-stk-credit]');
  var said = box.querySelector('[data-stk-said]');
  var list = box.querySelector('[data-stk-sheets]');
  var allRow = box.querySelector('[data-stk-all-row]');
  var allButton = box.querySelector('[data-stk-all]');
  var shareAllButton = box.querySelector('[data-stk-share-all]');
  var off = document.querySelector('[data-stk-off]');
  var canonical = document.querySelector('link[rel="canonical"]');

  function ink(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function say(text) {
    // Cleared first and set on the next tick, so saying the same thing twice
    // is still a change a screen reader announces (love.js's speak()).
    said.textContent = '';
    setTimeout(function () { said.textContent = text; }, 60);
  }

  function pressed(buttons) {
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].getAttribute('aria-pressed') === 'true') return buttons[i];
    }
    return buttons[0];
  }

  function choice() {
    var opt = face.options[face.selectedIndex];
    var size = pressed(sizeButtons);
    return {
      opt: opt, slug: opt.value, family: opt.getAttribute('data-family'),
      weight: opt.getAttribute('data-weight'),
      size: size.getAttribute('data-stk-size'), sizeName: size.firstChild.textContent.trim(),
      mm: parseFloat(size.getAttribute('data-mm')),
      kind: pressed(sheetButtons).getAttribute('data-stk-sheet')
    };
  }

  function spec(c, px) {
    return c.weight + ' ' + px + 'px "' + c.family + '"';
  }

  function ready(c) {
    if (!document.fonts || !document.fonts.load) return Promise.resolve(true);
    var s = spec(c, 40);
    return document.fonts.load(s, ALL.join(' ')).then(function () {
      return document.fonts.check(s, ALL.join(' '));
    }, function () { return false; });
  }

  // ── Measuring ──────────────────────────────────────────────────────────────

  var measured = {};
  function measure(c) {
    if (measured[c.slug]) return measured[c.slug];
    pctx.font = spec(c, REF);
    var asc = 0, desc = 0, w = {};
    ALL.forEach(function (word) {
      var m = pctx.measureText(word);
      asc = Math.max(asc, m.actualBoundingBoxAscent);
      desc = Math.max(desc, m.actualBoundingBoxDescent);
      w[word] = { l: m.actualBoundingBoxLeft, r: m.actualBoundingBoxRight };
    });
    return (measured[c.slug] = { asc: asc, desc: desc, w: w });
  }

  // A label of height h mm: k is mm per measured pixel, so the word's ink fills
  // the height between the top and bottom padding.
  function geometry(m, h) {
    var k = h * (1 - 2 * VPAD) / (m.asc + m.desc);
    var pad = h * PAD, widths = {};
    ALL.forEach(function (word) { widths[word] = (m.w[word].l + m.w[word].r) * k + 2 * pad; });
    return { h: h, k: k, pad: pad, vpad: h * VPAD, widths: widths, m: m };
  }

  // ── Packing ────────────────────────────────────────────────────────────────

  function splits(h) {
    var W = AREA.w, H = AREA.h, step = h + GAP, out = [], r, c;
    var R = Math.floor((H + GAP) / step), C = Math.floor((W + GAP) / step);
    for (r = 0; r <= R; r++) {
      out.push({ first: 'rows', rows: r, rowLen: W, cols: C, colLen: H - r * step });
    }
    for (c = 1; c <= C; c++) {
      out.push({ first: 'cols', cols: c, colLen: H, rows: R, rowLen: W - c * step });
    }
    return out;
  }

  // Upright rows come first in the list, so a sticker goes on its side only
  // where no upright row has room for it.
  function bins(sp) {
    var out = [], i;
    if (sp.rowLen > 0) for (i = 0; i < sp.rows; i++) out.push({ rot: false, len: sp.rowLen, used: -GAP, items: [] });
    if (sp.colLen > 0) for (i = 0; i < sp.cols; i++) out.push({ rot: true, len: sp.colLen, used: -GAP, items: [] });
    return out;
  }

  function put(bs, item) {
    for (var i = 0; i < bs.length; i++) {
      if (bs[i].used + GAP + item.w <= bs[i].len + 1e-9) {
        bs[i].used += GAP + item.w;
        bs[i].items.push(item);
        return true;
      }
    }
    return false;
  }

  function whole(sp, items, n) {
    var bs = bins(sp), all = [], i;
    for (i = 0; i < n; i++) all = all.concat(items);
    all.sort(function (a, b) { return b.w - a.w || a.i - b.i; });
    for (i = 0; i < all.length; i++) if (!put(bs, all[i])) return null;
    return bs;
  }

  // Whole weeks or years first; then every name that will still go in, once
  // more each, longest first, so a sheet with no room for another whole set
  // still carries as many different names as it can; then round the names in
  // their order, putting in whatever fits. The arrangement that wins has the
  // most whole sets, then the most different names, then the most stickers,
  // then the fewest on their side.
  function pack(items, h) {
    var best = null;
    splits(h).forEach(function (sp) {
      var k = 0, bs = bins(sp), next, added = 0, misses = 0, i = 0, seen = {};
      while (k < 500 && (next = whole(sp, items, k + 1))) { bs = next; k++; }
      items.slice().sort(function (a, b) { return b.w - a.w || a.i - b.i; }).forEach(function (it) {
        if (put(bs, it)) added++;
      });
      while (misses < items.length && added < 2000) {
        if (put(bs, items[i % items.length])) { added++; misses = 0; } else misses++;
        i++;
      }
      bs.forEach(function (b) { b.items.forEach(function (it) { seen[it.word] = 1; }); });
      var names = Object.keys(seen).length, total = k * items.length + added;
      var turned = bs.reduce(function (s, b) { return s + (b.rot ? b.items.length : 0); }, 0);
      if (!best || k > best.k || (k === best.k && (names > best.names || (names === best.names &&
          (total > best.total || (total === best.total && turned < best.turned)))))) {
        best = { sp: sp, bins: bs, k: k, names: names, total: total, turned: turned };
      }
    });
    return { placed: place(best, h), whole: best.k };
  }

  // Bands of the same length can trade places, so they are dealt out in
  // rounds by the first name on each, Monday's band, Tuesday's, and so on,
  // then round again: the sheet reads a week at a time rather than in the
  // order the packing happened to fill it.
  function rounds(bands) {
    var by = {}, out = [], keys;
    bands.forEach(function (b) {
      var k = Math.min.apply(null, b.items.map(function (it) { return it.i; }));
      (by[k] = by[k] || []).push(b);
    });
    keys = Object.keys(by).map(Number).sort(function (a, b) { return a - b; });
    while (out.length < bands.length) {
      keys.forEach(function (k) { if (by[k].length) out.push(by[k].shift()); });
    }
    return out;
  }

  // Lay each band's stickers out in the names' order, centred along the band,
  // then centre the whole arrangement in the area.
  function place(best, h) {
    var step = h + GAP, out = [];
    var rows = rounds(best.bins.filter(function (b) { return !b.rot && b.items.length; }));
    var cols = rounds(best.bins.filter(function (b) { return b.rot && b.items.length; }));
    function lay(b, x, y, len) {
      var at = (len - b.used) / 2;
      b.items.slice().sort(function (a, c) { return a.i - c.i; }).forEach(function (it) {
        out.push(b.rot ? { word: it.word, x: x, y: y + at, w: it.w, rot: true }
                       : { word: it.word, x: x + at, y: y, w: it.w, rot: false });
        at += it.w + GAP;
      });
    }
    if (best.sp.first === 'rows') {
      rows.forEach(function (b, i) { lay(b, 0, i * step, AREA.w); });
      var y0 = rows.length * step, x0 = (AREA.w - (cols.length * step - GAP)) / 2;
      cols.forEach(function (b, j) { lay(b, x0 + j * step, y0, AREA.h - y0); });
    } else {
      cols.forEach(function (b, j) { lay(b, j * step, 0, AREA.h); });
      var x1 = cols.length * step;
      rows.forEach(function (b, i) { lay(b, x1, i * step, AREA.w - x1); });
    }
    if (out.length) {
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      out.forEach(function (p) {
        minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x + (p.rot ? h : p.w)); maxY = Math.max(maxY, p.y + (p.rot ? p.w : h));
      });
      var dx = (AREA.w - (maxX - minX)) / 2 - minX, dy = (AREA.h - (maxY - minY)) / 2 - minY;
      out.forEach(function (p) { p.x += dx; p.y += dy; });
    }
    return out;
  }

  // ── The sheets ─────────────────────────────────────────────────────────────

  function setsFor(kind) {
    if (kind === 'week') return [{ title: 'The week', file: 'week', words: DAYS, unit: 'day', own: 'week' }];
    if (kind === 'year') return [{ title: 'The year', file: 'year', words: MONTHS, unit: 'month', own: 'year' }];
    return (kind === 'days' ? DAYS : MONTHS).map(function (w) {
      return { title: w, file: w.toLowerCase(), words: [w] };
    });
  }

  function items(set, g) {
    return set.words.map(function (w, i) { return { word: w, i: i, w: g.widths[w] }; });
  }

  // When a whole week or year will not go on one sheet at this size, the
  // biggest size that does take one is named under it, smaller ones first
  // tried from the size just below.
  function fitsAt(set, c) {
    var m = measure(c), below = sizeButtons.filter(function (b) {
      return parseFloat(b.getAttribute('data-mm')) < c.mm;
    }).reverse();
    for (var i = 0; i < below.length; i++) {
      var g = geometry(m, parseFloat(below[i].getAttribute('data-mm')));
      if (pack(items(set, g), g.h).whole) return below[i].firstChild.textContent.trim();
    }
    return null;
  }

  function plan(c) {
    var g = geometry(measure(c), c.mm);
    return setsFor(c.kind).map(function (set) {
      var res = pack(items(set, g), g.h), counts = {}, turned = 0;
      res.placed.forEach(function (p) { counts[p.word] = (counts[p.word] || 0) + 1; if (p.rot) turned++; });
      var sheet = { set: set, c: c, g: g, placed: res.placed, counts: counts, turned: turned };
      if (set.words.length > 1 && !res.whole) sheet.fits = fitsAt(set, c);
      return sheet;
    });
  }

  function times(n) { return n === 1 ? 'once' : n === 2 ? 'twice' : (NUMBER[n] || n) + ' times'; }
  function and(words) {
    return words.length < 2 ? words.join('') : words.slice(0, -1).join(', ') + ' and ' + words[words.length - 1];
  }

  function describe(sheet) {
    var n = sheet.placed.length, set = sheet.set, parts;
    if (!n) return 'nothing fits at this size in this face; a smaller size will.';
    parts = [n + (n === 1 ? ' sticker' : ' stickers')];
    if (set.words.length > 1) {
      var by = {};
      set.words.forEach(function (w) { var k = sheet.counts[w] || 0; (by[k] = by[k] || []).push(w); });
      Object.keys(by).map(Number).sort(function (a, b) { return b - a; }).forEach(function (k) {
        var ws = by[k];
        if (!k) parts.push(and(ws) + (ws.length === 1 ? ' does' : ' do') + ' not fit at this size in this face');
        else if (ws.length === set.words.length) parts.push('every ' + set.unit + ' ' + times(k));
        else parts.push(and(ws) + ' ' + times(k));
      });
    }
    if (sheet.turned) {
      parts.push(sheet.turned === n ? 'all of them on their side, which fits more'
                                    : (NUMBER[sheet.turned] || sheet.turned) + ' of them on their side, to fit more');
    }
    if (set.words.length > 1 && 'fits' in sheet) {
      parts.push(sheet.fits ? 'a whole ' + set.own + ' goes on one sheet at ' + sheet.fits
                            : 'a whole ' + set.own + ' does not go on one sheet at any size in this face');
    }
    return parts.join('; ') + '.';
  }

  // ── Drawing ────────────────────────────────────────────────────────────────

  function rounded(ctx, x, y, w, h, r) {
    if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // The preview is the sheet as it comes out of the cutter: white paper, the
  // words, and the cut round every label. The saved file is the same labels
  // with nothing round them: clear, so the app cuts round each one.
  function draw(canvas, sheet, preview) {
    var ctx = canvas.getContext('2d'), s = canvas.width / PAPER[0], g = sheet.g;
    var paper = ink('--onb-sticker'), word = ink('--onb-sticker-ink'), cut = ink('--onb-dim');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (preview) { ctx.fillStyle = paper; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    sheet.placed.forEach(function (p) {
      var w = p.w * s, h = g.h * s;
      ctx.save();
      if (p.rot) {
        ctx.translate((AREA.x + p.x) * s + h, (AREA.y + p.y) * s);
        ctx.rotate(Math.PI / 2);
      } else {
        ctx.translate((AREA.x + p.x) * s, (AREA.y + p.y) * s);
      }
      ctx.beginPath();
      rounded(ctx, 0, 0, w, h, g.h * ROUND * s);
      ctx.fillStyle = paper;
      ctx.fill();
      if (preview) {
        ctx.lineWidth = Math.max(1, 0.25 * s);
        ctx.strokeStyle = cut;
        ctx.stroke();
      }
      ctx.fillStyle = word;
      ctx.font = spec(sheet.c, REF * g.k * s);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(p.word, (g.pad + g.m.w[p.word].l * g.k) * s, (g.vpad + g.m.asc * g.k) * s);
      ctx.restore();
    });
  }

  // ── Saving ─────────────────────────────────────────────────────────────────
  // The file carries its own size and its face's credit: a pHYs chunk saying
  // it is 300 dots to the inch, so anything that reads it knows it is 4 x 7
  // inches, and iTXt notes naming the face, who drew it and its licence,
  // because printing somebody's typeface is where the credit should travel.

  var CRC = (function () {
    var t = [], c, n, k;
    for (n = 0; n < 256; n++) {
      c = n;
      for (k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) c = CRC[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function chunk(type, data) {
    var out = new Uint8Array(12 + data.length), dv = new DataView(out.buffer);
    dv.setUint32(0, data.length);
    for (var i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
    out.set(data, 8);
    dv.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
    return out;
  }
  function note(key, text) {
    var enc = new TextEncoder(), k = enc.encode(key), lang = enc.encode('en'), t = enc.encode(text);
    var d = new Uint8Array(k.length + 3 + lang.length + 2 + t.length), o = 0;
    d.set(k, o); o += k.length;
    d[o++] = 0; d[o++] = 0; d[o++] = 0;        // end of keyword, not compressed, method
    d.set(lang, o); o += lang.length;
    d[o++] = 0; d[o++] = 0;                    // end of language, no translated keyword
    d.set(t, o);
    return chunk('iTXt', d);
  }
  function stamp(png, notes) {
    var dv = new DataView(png.buffer, png.byteOffset, png.byteLength);
    if (png.length < 33 || String.fromCharCode(png[12], png[13], png[14], png[15]) !== 'IHDR') return png;
    var o = 8, hasPhys = false;
    while (o + 8 <= png.length) {
      var type = String.fromCharCode(png[o + 4], png[o + 5], png[o + 6], png[o + 7]);
      if (type === 'pHYs') hasPhys = true;
      if (type === 'IEND') break;
      o += 12 + dv.getUint32(o);
    }
    var ppm = Math.round(DPI / 0.0254), p = new Uint8Array(9), pv = new DataView(p.buffer);
    pv.setUint32(0, ppm); pv.setUint32(4, ppm); p[8] = 1;
    var adds = (hasPhys ? [] : [chunk('pHYs', p)]).concat(notes.map(function (n) { return note(n[0], n[1]); }));
    var size = png.length;
    adds.forEach(function (a) { size += a.length; });
    var out = new Uint8Array(size), at = 33;     // straight after IHDR
    out.set(png.subarray(0, at), 0);
    adds.forEach(function (a) { out.set(a, at); at += a.length; });
    out.set(png.subarray(33), at);
    return out;
  }

  function inches(mm) { return +(mm / 25.4).toFixed(3); }

  function fileName(sheet) {
    return 'notebook-stickers-' + sheet.set.file + '-' + sheet.c.slug + '-' + sheet.c.size + '.png';
  }

  // A sheet's file is drawn once and kept for as long as the sheet is on the
  // page, so Save and Share hand over the same bytes, and Share has its file
  // ready the moment it is pressed: a browser opens the share sheet only
  // straight after a press, and a sheet still being drawn could miss that.
  var files = {};
  function prepare(sheet) {
    var name = fileName(sheet);
    if (files[name]) return files[name];
    return (files[name] = new Promise(function (resolve, reject) {
      var c = sheet.c, cv = document.createElement('canvas');
      cv.width = Math.round(PAPER[0] / 25.4 * DPI);
      cv.height = Math.round(PAPER[1] / 25.4 * DPI);
      draw(cv, sheet, false);
      cv.toBlob(function (blob) {
        if (!blob) { reject(new Error('no blob')); return; }
        blob.arrayBuffer().then(function (buf) {
          var what = (sheet.set.unit ? sheet.set.title : sheet.set.title + ' stickers');
          var png = stamp(new Uint8Array(buf), [
            ['Title', what + ', ' + c.sizeName + ', ' + c.family],
            ['Description', 'Set in ' + c.family + ', by ' + c.opt.getAttribute('data-by') + ', under the ' +
              c.opt.getAttribute('data-licence') + '. ' + inches(PAPER[0]) + ' x ' + inches(PAPER[1]) +
              ' inch sticker sheet at ' + DPI + ' dpi, for the PixCut S1.'],
            ['Source', canonical ? canonical.href : location.href]
          ]);
          resolve(new File([png], name, { type: 'image/png' }));
        }, reject);
      }, 'image/png');
    }));
  }

  function save(sheet, done) {
    prepare(sheet).then(function (file) {
      var url = URL.createObjectURL(file), a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
      done(file.name);
    }, function () { done(null); });
  }

  // THE SHARE SHEET, where the browser can share files (Ryan turned web-share
  // on for this drawer, 2026-10-12). It hands the files to the device's own
  // sheet, where Save Image puts them in a phone's photos, which is where the
  // printer's app picks from. What happens after that is the visitor's, and
  // nothing comes back here. make-csp.py refuses any other script that calls it.
  var SHARE = false;
  try {
    SHARE = !!(navigator.share && navigator.canShare && window.File &&
      navigator.canShare({ files: [new File([new Uint8Array(8)], 'sheet.png', { type: 'image/png' })] }));
  } catch (e) { SHARE = false; }

  function share(list, btn) {
    Promise.all(list.map(prepare)).then(function (fs) {
      return navigator.share({ files: fs });
    }).then(function () {
      answer(btn, 'Handed to your share sheet. Where it went from there was your choice, and nothing came back here.');
    }, function (err) {
      var why = err && err.name;
      answer(btn, why === 'AbortError' ? 'Nothing was shared.'
        : why === 'NotAllowedError' ? 'The sheet was still being drawn when you pressed. It is ready now: press Share again.'
        : 'Sharing did not work in this browser, sorry. Save still does.');
    });
  }

  // Draw every sheet's file in the background once its preview is up, one at a
  // time, so a Share pressed a moment later finds it ready.
  function warm(mine) {
    if (!SHARE) return;
    var queue = sheets.slice();
    (function next() {
      if (mine !== token || !queue.length) return;
      prepare(queue.shift()).then(function () { setTimeout(next, 0); }, function () { setTimeout(next, 0); });
    })();
  }

  // ── The page ───────────────────────────────────────────────────────────────

  var sheets = [], token = 0, good = face.selectedIndex;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  // A button reads Save or Share, and says which sheet only to a screen reader,
  // so the name it is called by starts with the word on it.
  function button(cls, verb, which) {
    var b = el('button', cls, verb);
    b.type = 'button';
    b.appendChild(el('span', 'sr', ' ' + which));
    return b;
  }

  // A press is answered where the hand is, under the button that was pressed,
  // the Playhouse's lesson: the status line is at the top of the drawer and a
  // Save button can be six sheets below it. One answer at a time, and each is
  // aria-hidden, because the status line already says it out loud once.
  function answer(btn, text) {
    [].slice.call(box.querySelectorAll('.onb-stk__done')).forEach(function (p) { p.hidden = true; });
    var home = btn.closest('.onb-stk__sheet, .onb-stk__all');
    var p = home.querySelector('.onb-stk__done');
    if (!p) {
      p = el('p', 'onb-stk__done');
      p.setAttribute('aria-hidden', 'true');
      home.appendChild(p);
    }
    p.textContent = text;
    p.hidden = false;
    say(text);
  }

  function showCredit(c) {
    credit.textContent = '';
    var a = el('a', '', c.opt.getAttribute('data-licence'));
    a.href = c.opt.getAttribute('data-licence-url');
    credit.appendChild(document.createTextNode('Set in '));
    credit.appendChild(el('b', '', c.family));
    credit.appendChild(document.createTextNode(', by ' + c.opt.getAttribute('data-by') + ', under the '));
    credit.appendChild(a);
    credit.appendChild(document.createTextNode('.'));
  }

  function build() {
    [].slice.call(box.querySelectorAll('.onb-stk__done')).forEach(function (p) { p.hidden = true; });
    list.textContent = '';
    list.classList.toggle('onb-stk__sheets--one', sheets.length === 1);
    sheets.forEach(function (sheet) {
      var li = el('li', 'onb-stk__sheet'), paper = el('div', 'onb-stk__paper');
      var cv = document.createElement('canvas');
      cv.width = PREVIEW;
      cv.height = Math.round(PREVIEW * PAPER[1] / PAPER[0]);
      cv.setAttribute('aria-hidden', 'true');
      paper.appendChild(cv);
      var cap = el('p', 'onb-stk__cap');
      cap.appendChild(el('b', '', sheet.set.title));
      cap.appendChild(document.createTextNode(': ' + describe(sheet)));
      var which = 'the ' + (sheet.set.own ? sheet.set.own + '’s' : sheet.set.title) + ' sheet';
      var acts = el('div', 'onb-stk__acts'), btn = button('onb-stk__save', 'Save', which);
      btn.disabled = !sheet.placed.length;
      btn.addEventListener('click', function () {
        save(sheet, function (name) {
          answer(btn, name ? 'Saved as ' + name + ', wherever your browser puts downloads. It went nowhere else.'
                           : 'That did not work in this browser, sorry. The sheet is still here.');
        });
      });
      acts.appendChild(btn);
      if (SHARE) {
        var sh = button('onb-stk__save', 'Share', which);
        sh.disabled = !sheet.placed.length;
        sh.addEventListener('click', function () { share([sheet], sh); });
        acts.appendChild(sh);
      }
      li.appendChild(paper);
      li.appendChild(cap);
      li.appendChild(acts);
      list.appendChild(li);
      draw(cv, sheet, true);
    });
    allRow.hidden = sheets.length < 2;
    if (!allRow.hidden) {
      var all = 'all ' + (NUMBER[sheets.length] || sheets.length) + ' sheets';
      allButton.textContent = 'Save ' + all;
      shareAllButton.textContent = 'Share ' + all;
    }
    shareAllButton.hidden = !SHARE;
  }

  function redraw(announce) {
    var c = choice(), mine = ++token;
    ready(c).then(function (ok) {
      if (mine !== token) return;
      if (!ok) {
        var was = face.options[good];
        face.selectedIndex = good;
        say(c.family + ' did not load, so nothing was drawn in it. The sheets are still in ' +
            was.getAttribute('data-family') + '.');
        return;
      }
      good = face.selectedIndex;
      files = {};
      sheets = plan(c);
      showCredit(c);
      build();
      warm(mine);
      if (announce) {
        var what = { week: 'the week on one sheet', days: 'a day to a sheet, ' + NUMBER[DAYS.length] + ' sheets',
                     year: 'the year on one sheet', months: 'a month to a sheet, ' + NUMBER[MONTHS.length] + ' sheets' };
        say('Drawn in ' + c.family + ' at ' + c.sizeName + ': ' + what[c.kind] +
            '. What is on each sheet is written under it.');
      }
    });
  }

  function group(buttons) {
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        buttons.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        redraw(true);
      });
    });
  }
  group(sizeButtons);
  group(sheetButtons);
  face.addEventListener('change', function () { redraw(true); });

  allButton.addEventListener('click', function () {
    var queue = sheets.filter(function (s) { return s.placed.length; }), names = [];
    (function next() {
      var sheet = queue.shift();
      if (!sheet) {
        answer(allButton, names.length
          ? 'Saved ' + (NUMBER[names.length] || names.length) + ' sheets, one file each, wherever your browser ' +
            'puts downloads. If it asked whether this page may download several files, that was the ' +
            'browser asking; they went nowhere else.'
          : 'That did not work in this browser, sorry. The sheets are still here.');
        return;
      }
      save(sheet, function (name) {
        if (name) names.push(name);
        setTimeout(next, 350);
      });
    })();
  });

  shareAllButton.addEventListener('click', function () {
    share(sheets.filter(function (s) { return s.placed.length; }), shareAllButton);
  });

  if (off) off.hidden = true;
  box.hidden = false;
  redraw(false);
})();
