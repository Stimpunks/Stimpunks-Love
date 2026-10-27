/* =============================================================================
   Two-step sign-in, in the browser (Ryan's ask and calls, 2026-10-26): the
   second step at sign-on, making and using a passkey, and the QR code an
   authenticator app is set up from. Loaded only when one of those is needed,
   by cb.js (the Community Center's front desk and Account on the radio) and by
   guest.js (signing on from the guest bar), so nobody who never signs on with
   a second step ever downloads it.

   IT ASKS NO SERVER ITSELF: every caller passes its own `post`, so the pass
   and the page's own way of calling the CB stay with the caller. It builds
   everything with createElement and textContent, never markup from a string.
   It keeps nothing: no code, no ticket and no passkey's answer is stored.

   The QR code is drawn here, from the otpauth address, in the browser, so the
   secret never goes to anybody else to be turned into a picture. Byte mode,
   error correction level M, versions 1 to 10, the mask with the lowest
   penalty: ISO/IEC 18004, written for this file. The secret is also shown as
   text and as a link, because a QR code is no use to somebody who cannot see
   it or has only the one device.
   ============================================================================= */
(function () {
  'use strict';

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  function b64u(buf) {
    var s = '', b = new Uint8Array(buf);
    for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function unb64u(s) {
    var t = String(s).replace(/-/g, '+').replace(/_/g, '/');
    while (t.length % 4) t += '=';
    var bin = atob(t), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out.buffer;
  }
  var canPasskey = !!(window.PublicKeyCredential && navigator.credentials && navigator.credentials.create);

  /* ── Passkeys ── */
  function create(o) {
    var pk = {
      challenge: unb64u(o.challenge),
      rp: o.rp,
      user: { id: new TextEncoder().encode(o.user.id), name: o.user.name, displayName: o.user.displayName },
      pubKeyCredParams: o.pubKeyCredParams,
      timeout: o.timeout,
      attestation: o.attestation,
      authenticatorSelection: o.authenticatorSelection,
      excludeCredentials: (o.excludeCredentials || []).map(function (c) { return { type: 'public-key', id: unb64u(c.id) }; }),
    };
    return navigator.credentials.create({ publicKey: pk }).then(function (c) {
      return { clientDataJSON: b64u(c.response.clientDataJSON), attestationObject: b64u(c.response.attestationObject) };
    });
  }
  function get(o) {
    var pk = {
      challenge: unb64u(o.challenge),
      rpId: o.rpId,
      timeout: o.timeout,
      userVerification: o.userVerification,
      allowCredentials: (o.allowCredentials || []).map(function (c) { return { type: 'public-key', id: unb64u(c.id) }; }),
    };
    return navigator.credentials.get({ publicKey: pk }).then(function (c) {
      return { id: c.id, clientDataJSON: b64u(c.response.clientDataJSON), authenticatorData: b64u(c.response.authenticatorData), signature: b64u(c.response.signature) };
    });
  }

  /* ── The second step at sign-on ──
     `second` is what the CB answered the password with; `post(payload)` sends
     { ticket, code } or { ticket, assertion } the caller's way and answers
     { status, body }. Resolves with the body that carries the pass. */
  function run(into, second, post, opts) {
    opts = opts || {};
    var idBase = opts.id || 'twostep';
    return new Promise(function (resolve, reject) {
      into.textContent = '';
      var box = el('div', 'twostep');
      box.appendChild(el('p', null, 'This username has two-step sign-in. One more step:'));
      var said = el('p', 'twostep__said');
      said.setAttribute('role', 'status');
      var busy = false;
      function send(payload, btn) {
        if (busy) return;
        busy = true; if (btn) btn.disabled = true;
        said.textContent = 'Checking…';
        payload.ticket = second.ticket;
        post(payload).then(function (r) {
          busy = false; if (btn) btn.disabled = false;
          if (r.status === 200 && r.body && r.body.pass) { said.textContent = ''; resolve(r.body); return; }
          var err = (r.body && r.body.error) || 'That did not work. Try again.';
          said.textContent = err;
          if (/run out|Start again/.test(err)) reject(new Error('expired'));
        }, function () { busy = false; if (btn) btn.disabled = false; said.textContent = 'No signal: that could not be checked just now.'; });
      }
      if (second.passkey && canPasskey) {
        var pkBtn = el('button', null, 'Use a passkey');
        pkBtn.type = 'button';
        var pkRow = el('p'); pkRow.appendChild(pkBtn);
        box.appendChild(pkRow);
        pkBtn.addEventListener('click', function () {
          said.textContent = 'Your device asks you now.';
          get(second.passkey).then(function (a) { send({ assertion: a }, pkBtn); }, function () {
            said.textContent = 'The passkey was not used. Try again, or use another step.';
          });
        });
      }
      function codeForm(labelText, id, numeric, buttonText) {
        var p = el('p');
        var lab = el('label', null, labelText); lab.htmlFor = id;
        var input = el('input'); input.id = id; input.type = 'text';
        input.autocomplete = numeric ? 'one-time-code' : 'off';
        input.spellcheck = false;
        if (numeric) { input.inputMode = 'numeric'; input.maxLength = 7; }
        var go = el('button', null, buttonText); go.type = 'button';
        // The label on a line of its own, the field and its button under it.
        var labRow = el('p'); labRow.appendChild(lab);
        p.appendChild(input); p.appendChild(document.createTextNode(' ')); p.appendChild(go);
        var both = el('div'); both.appendChild(labRow); both.appendChild(p);
        p = both;
        function fire() { if (input.value.trim()) send({ code: input.value.trim() }, go); }
        go.addEventListener('click', fire);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); fire(); } });
        return { p: p, input: input };
      }
      var first = null;
      if (second.app) {
        var app = codeForm('The six-digit code from your authenticator app', idBase + '-code', true, 'Go on');
        box.appendChild(app.p);
        first = app.input;
      }
      if (second.codes) {
        var more = el('details');
        more.appendChild(el('summary', null, 'Use a backup code instead'));
        var bk = codeForm('One of your backup codes', idBase + '-backup', false, 'Use it');
        more.appendChild(bk.p);
        more.appendChild(el('p', null, 'Each backup code works once. Lost them all, and your steps too? A moderator can reset your username.'));
        box.appendChild(more);
      }
      if (!second.app && !(second.passkey && canPasskey) && !second.codes) {
        box.appendChild(el('p', null, 'This browser cannot use your passkey here. Try the device you made it on, or ask a moderator to reset your username.'));
      }
      box.appendChild(said);
      into.appendChild(box);
      if (first) first.focus();
      else { var b = box.querySelector('button'); if (b) b.focus(); }
    });
  }

  /* ── QR ── */
  // GF(256) with the QR polynomial, x^8 + x^4 + x^3 + x^2 + 1.
  var EXP = new Array(512), LOG = new Array(256);
  (function () { var x = 1; for (var i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; } for (i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; })();
  function gmul(a, b) { return a && b ? EXP[LOG[a] + LOG[b]] : 0; }
  function rsGen(n) {
    var g = [1];
    for (var i = 0; i < n; i++) {
      var next = new Array(g.length + 1).fill(0);
      for (var j = 0; j < g.length; j++) { next[j] ^= g[j]; next[j + 1] ^= gmul(g[j], EXP[i]); }
      g = next;
    }
    return g;
  }
  function rsRem(data, n) {
    var g = rsGen(n), r = data.concat(new Array(n).fill(0));
    for (var i = 0; i < data.length; i++) {
      var c = r[i];
      if (c) for (var j = 0; j < g.length; j++) r[i + j] ^= gmul(g[j], c);
    }
    return r.slice(data.length);
  }
  // Error correction level M: [ec per block, [blocks, data codewords]...], versions 1 to 10.
  var M = [null, [10, [1, 16]], [16, [1, 28]], [26, [1, 44]], [18, [2, 32]], [24, [2, 43]], [16, [4, 27]], [18, [4, 31]],
    [22, [2, 38], [2, 39]], [22, [3, 36], [2, 37]], [26, [4, 43], [1, 44]]];
  var ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];
  function dataCw(v) { var t = 0; for (var i = 1; i < M[v].length; i++) t += M[v][i][0] * M[v][i][1]; return t; }
  function bchFormat(bits) { var d = bits << 10; for (var i = 14; i >= 10; i--) if (d & (1 << i)) d ^= 0x537 << (i - 10); return ((bits << 10) | d) ^ 0x5412; }
  function bchVersion(v) { var d = v << 12; for (var i = 17; i >= 12; i--) if (d & (1 << i)) d ^= 0x1f25 << (i - 12); return (v << 12) | d; }

  function qrMatrix(text) {
    var bytes = Array.prototype.slice.call(new TextEncoder().encode(text));
    var v = 1;
    while (v <= 10 && 4 + (v < 10 ? 8 : 16) + bytes.length * 8 > dataCw(v) * 8) v++;
    if (v > 10) return null;
    // The data: byte mode, the count, the bytes, the terminator, padding.
    var bits = [];
    function put(n, len) { for (var i = len - 1; i >= 0; i--) bits.push((n >>> i) & 1); }
    put(4, 4); put(bytes.length, v < 10 ? 8 : 16);
    bytes.forEach(function (b) { put(b, 8); });
    var cap = dataCw(v) * 8;
    put(0, Math.min(4, cap - bits.length));
    while (bits.length % 8) bits.push(0);
    var cw = [];
    for (var i = 0; i < bits.length; i += 8) { var b = 0; for (var j = 0; j < 8; j++) b = (b << 1) | bits[i + j]; cw.push(b); }
    for (var pad = 0; cw.length < dataCw(v); pad++) cw.push(pad % 2 ? 0x11 : 0xec);
    // Blocks, their error correction, interleaved.
    var ec = M[v][0], blocks = [], at = 0;
    for (i = 1; i < M[v].length; i++) for (j = 0; j < M[v][i][0]; j++) { var d = cw.slice(at, at + M[v][i][1]); at += M[v][i][1]; blocks.push({ d: d, e: rsRem(d, ec) }); }
    var out = [], most = Math.max.apply(null, blocks.map(function (x) { return x.d.length; }));
    for (i = 0; i < most; i++) blocks.forEach(function (x) { if (i < x.d.length) out.push(x.d[i]); });
    for (i = 0; i < ec; i++) blocks.forEach(function (x) { out.push(x.e[i]); });
    // The matrix and which of it is function patterns.
    var size = 17 + 4 * v, mod = [], fn = [];
    for (i = 0; i < size; i++) { mod.push(new Array(size).fill(false)); fn.push(new Array(size).fill(false)); }
    function set(x, y, dark) { mod[y][x] = dark; fn[y][x] = true; }
    function finder(cx, cy) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var x = cx + dx, y = cy + dy;
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        var dist = Math.max(Math.abs(dx), Math.abs(dy));
        set(x, y, dist !== 2 && dist !== 4);
      }
    }
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    for (i = 8; i < size - 8; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    var al = ALIGN[v];
    for (i = 0; i < al.length; i++) for (j = 0; j < al.length; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === al.length - 1) || (i === al.length - 1 && j === 0)) continue;
      for (var dy2 = -2; dy2 <= 2; dy2++) for (var dx2 = -2; dx2 <= 2; dx2++) set(al[i] + dx2, al[j] + dy2, Math.max(Math.abs(dx2), Math.abs(dy2)) !== 1);
    }
    // Format and version areas, reserved now and written after the mask.
    function formatBits(mask) {
      var f = bchFormat((0 << 3) | mask);
      for (var k = 0; k <= 5; k++) set(8, k, ((f >>> k) & 1) === 1);
      set(8, 7, ((f >>> 6) & 1) === 1); set(8, 8, ((f >>> 7) & 1) === 1); set(7, 8, ((f >>> 8) & 1) === 1);
      for (k = 9; k < 15; k++) set(14 - k, 8, ((f >>> k) & 1) === 1);
      for (k = 0; k < 8; k++) set(size - 1 - k, 8, ((f >>> k) & 1) === 1);
      for (k = 8; k < 15; k++) set(8, size - 15 + k, ((f >>> k) & 1) === 1);
      set(8, size - 8, true);
    }
    formatBits(0);
    if (v >= 7) {
      var vb = bchVersion(v);
      for (i = 0; i < 18; i++) { var bit = ((vb >>> i) & 1) === 1, a = size - 11 + (i % 3), bb = Math.floor(i / 3); set(a, bb, bit); set(bb, a, bit); }
    }
    // The codewords, zigzag from the bottom right.
    var bitAt = 0, total = out.length * 8;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) for (j = 0; j < 2; j++) {
        var x = right - j, upward = ((right + 1) & 2) === 0, y = upward ? size - 1 - vert : vert;
        if (!fn[y][x] && bitAt < total) { mod[y][x] = ((out[bitAt >>> 3] >>> (7 - (bitAt & 7))) & 1) === 1; bitAt++; }
      }
    }
    // Each mask tried, the one with the lowest penalty kept.
    var MASKS = [function (x, y) { return (x + y) % 2 === 0; }, function (x, y) { return y % 2 === 0; }, function (x) { return x % 3 === 0; },
      function (x, y) { return (x + y) % 3 === 0; }, function (x, y) { return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; },
      function (x, y) { return x * y % 2 + x * y % 3 === 0; }, function (x, y) { return (x * y % 2 + x * y % 3) % 2 === 0; },
      function (x, y) { return ((x + y) % 2 + x * y % 3) % 2 === 0; }];
    function applyMask(m) { for (var yy = 0; yy < size; yy++) for (var xx = 0; xx < size; xx++) if (!fn[yy][xx] && MASKS[m](xx, yy)) mod[yy][xx] = !mod[yy][xx]; }
    function penalty() {
      var p = 0, yy, xx, run, k;
      for (yy = 0; yy < size; yy++) { run = 1; for (xx = 1; xx < size; xx++) { if (mod[yy][xx] === mod[yy][xx - 1]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
      for (xx = 0; xx < size; xx++) { run = 1; for (yy = 1; yy < size; yy++) { if (mod[yy][xx] === mod[yy - 1][xx]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
      for (yy = 0; yy < size - 1; yy++) for (xx = 0; xx < size - 1; xx++) { var c = mod[yy][xx]; if (c === mod[yy][xx + 1] && c === mod[yy + 1][xx] && c === mod[yy + 1][xx + 1]) p += 3; }
      var pat = [true, false, true, true, true, false, true];
      function at(line, s) { for (k = 0; k < 7; k++) if (line(s + k) !== pat[k]) return false; return true; }
      function light(line, s, e) { for (k = s; k < e; k++) if (k >= 0 && k < size && line(k)) return false; return true; }
      for (yy = 0; yy < size; yy++) for (xx = 0; xx + 7 <= size; xx++) {
        var row = function (i2) { return mod[yy][i2]; }, col = function (i2) { return mod[i2][yy]; };
        if (at(row, xx) && (light(row, xx - 4, xx) || light(row, xx + 7, xx + 11))) p += 40;
        if (at(col, xx) && (light(col, xx - 4, xx) || light(col, xx + 7, xx + 11))) p += 40;
      }
      var dark = 0; for (yy = 0; yy < size; yy++) for (xx = 0; xx < size; xx++) if (mod[yy][xx]) dark++;
      p += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
      return p;
    }
    var best = 0, bestP = Infinity;
    for (var mk = 0; mk < 8; mk++) { applyMask(mk); formatBits(mk); var pp = penalty(); if (pp < bestP) { bestP = pp; best = mk; } applyMask(mk); }
    applyMask(best); formatBits(best);
    return mod;
  }
  /* The code as an SVG, dark on light with its quiet zone, and its words as
     its name. Drawn with createElementNS. */
  function qr(text, label) {
    var m = qrMatrix(text);
    if (!m) return null;
    var NS = 'http://www.w3.org/2000/svg', n = m.length, q = 4, full = n + 2 * q;
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + full + ' ' + full);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', label || 'A QR code');
    svg.setAttribute('shape-rendering', 'crispEdges');
    svg.setAttribute('class', 'twostep__qr');
    var bg = document.createElementNS(NS, 'rect');
    bg.setAttribute('width', full); bg.setAttribute('height', full); bg.setAttribute('fill', '#ffffff');
    svg.appendChild(bg);
    var d = '';
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (m[y][x]) d += 'M' + (x + q) + ' ' + (y + q) + 'h1v1h-1z';
    var path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d); path.setAttribute('fill', '#000000');
    svg.appendChild(path);
    return svg;
  }

  window.loveTwoStep = { run: run, create: create, get: get, qr: qr, qrMatrix: qrMatrix, canPasskey: canPasskey };
}());
