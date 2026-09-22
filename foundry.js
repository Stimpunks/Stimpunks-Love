/* =============================================================================
   The Foundry: the bench.

   One file for one room. Nothing here is shared with anywhere else on the
   street, and nothing here is stored: no localStorage, no cookie, no request.
   What you type stays in the page and reloading empties it — which is the
   Mopery nook's decision for the Mopery nook's reason. Everything this site
   remembers between pages is about somebody's tolerance, and the dial is it.

   THE ROOM WORKS WITH THIS FILE SWITCHED OFF, in the sense that matters: the
   cases at the foot of the page are every typeface on the street, set in
   itself, with its designer, its licence and the room that sets it, and they
   are ordinary markup. make-foundry.py also renders the DEFAULT proof into the
   page, so the sheet on the bench is never blank. What this file adds is the
   ability to change it, and the <noscript> above the bench says so rather than
   leaving somebody pressing controls that do nothing.
   ========================================================================== */
(function () {
  'use strict';

  var proof = document.getElementById('fo-proof');
  var text = document.getElementById('fo-proof-text');
  if (!proof || !text) return;

  var faceSel = document.getElementById('fo-face');
  var weightSel = document.getElementById('fo-weight');
  var slantSel = document.getElementById('fo-slant');
  var caseSel = document.getElementById('fo-case');
  var sampleSel = document.getElementById('fo-sample');
  var own = document.getElementById('fo-own');
  var colophon = document.getElementById('fo-colophon');
  var said = document.getElementById('fo-said');
  var slantFine = document.getElementById('fo-slant-fine');

  var KNOBS = [
    { id: 'fo-size', prop: 'fontSize', unit: 'px' },
    { id: 'fo-leading', prop: 'lineHeight', unit: '' },
    { id: 'fo-tracking', prop: 'letterSpacing', unit: 'em' },
    { id: 'fo-measure', prop: 'maxWidth', unit: 'ch' }
  ].map(function (k) {
    k.el = document.getElementById(k.id);
    k.out = document.getElementById(k.id + '-out');
    k.start = k.el ? k.el.value : null;
    return k;
  });

  /* An aria-live region does not announce text it already holds, and every
     control here can be moved back to a value it was just at — so the same
     sentence can legitimately arrive twice and the second one would be silent
     to the reader who most needs it. love.js's speak() solves this for the
     Playhouse; this is the same two lines, kept local because that helper is
     not exported and two copies of a behaviour is better than a shared thing
     nobody owns. */
  function say(words) {
    if (!said) return;
    said.textContent = '';
    setTimeout(function () { said.textContent = words; }, 30);
  }

  function chosenFace() {
    return faceSel && faceSel.selectedOptions[0];
  }

  /* THE WEIGHTS ARE REBUILT PER FACE, from the list make-foundry.py worked out
     by hashing the files. Several families here are variable fonts declared
     against two or three weights with ONE file behind them, and offering a bold
     that renders the same drawings as the regular is a control that does
     nothing — make-chappell.py's typo that never becomes a video, arriving as a
     dropdown. The nearest surviving weight is kept when the face changes, so
     moving from a two-weight family to a one-weight family does not silently
     reset somebody's whole bench. */
  function rebuildWeights() {
    var face = chosenFace();
    if (!face || !weightSel) return;
    var want = parseInt(weightSel.value, 10) || 400;
    var list = (face.dataset.weights || '400').split(',');
    weightSel.replaceChildren();
    list.forEach(function (w) {
      var o = document.createElement('option');
      o.value = w;
      o.textContent = w + (list.length === 1 ? ' — the only weight this site holds' : '');
      weightSel.appendChild(o);
    });
    var best = list.reduce(function (a, b) {
      return Math.abs(b - want) < Math.abs(a - want) ? b : a;
    });
    weightSel.value = best;
    weightSel.disabled = list.length === 1;
  }

  /* A REAL ITALIC IS A SECOND ALPHABET AND THIS SITE EITHER HOLDS ONE OR IT DOES
     NOT. Where it does not, the option is disabled rather than quietly handed to
     the browser, which answers a request for an italic it has no file for by
     inventing one — nothing looks broken, and the room has told you a lie about
     somebody's typeface. The machine slant next to it is that invention, on
     purpose and labelled, which is the only honest way to show the difference. */
  function updateSlant() {
    var face = chosenFace();
    if (!face || !slantSel) return;
    var real = !!face.dataset.italic;
    var italic = slantSel.querySelector('option[value="italic"]');
    if (italic) {
      italic.disabled = !real;
      italic.textContent = real
        ? 'Italic — a different set of drawings'
        : 'Italic — this site holds no italic for this face';
      if (!real && slantSel.value === 'italic') slantSel.value = 'oblique';
    }
    if (slantFine) {
      slantFine.dataset.real = real ? 'yes' : 'no';
    }
  }

  function currentText() {
    if (!sampleSel) return text.textContent;
    if (sampleSel.value === 'own') return own ? own.value : '';
    var opt = sampleSel.selectedOptions[0];
    return opt ? (opt.dataset.text || '') : '';
  }

  function render() {
    var face = chosenFace();
    if (!face) return;

    text.textContent = currentText();
    text.style.fontFamily = "'" + face.dataset.family + "', serif";
    text.style.fontWeight = weightSel ? weightSel.value : '400';

    /* THE SLANT IS A FONT SETTING AND NEVER A TRANSFORM. check-gentle.py reads
       rotation and skew out of the computed matrix and cannot tell a leaning
       page from a leaning letter; a skewX() here would be reported, correctly,
       as this room's decoration outranking somebody's Gentle setting. Same call
       arcade.js made when it moved its sprites with left/top. */
    var slant = slantSel ? slantSel.value : 'normal';
    text.style.fontStyle = slant === 'oblique' ? 'oblique 12deg' : slant;
    text.style.fontSynthesis = slant === 'oblique' ? 'style' : 'none';

    text.style.textTransform = caseSel && caseSel.value !== 'none' ? caseSel.value : 'none';

    KNOBS.forEach(function (k) {
      if (!k.el) return;
      var v = k.el.value + k.unit;
      text.style[k.prop] = v;
      if (k.out) k.out.textContent = v;
    });

    var ink = document.querySelector('input[name="fo-ink"]:checked');
    if (ink) {
      proof.style.setProperty('--proof-ink', ink.dataset.ink);
      proof.style.setProperty('--proof-paper', ink.dataset.paper);
    }

    if (colophon) {
      var bits = [
        face.dataset.family,
        'drawn by ' + face.dataset.designer,
        face.dataset.licence
      ];
      var set = [];
      if (weightSel && weightSel.value !== '400') set.push('weight ' + weightSel.value);
      if (slant === 'italic') set.push('italic');
      if (slant === 'oblique') set.push('machine slant, 12°');
      KNOBS.forEach(function (k) { if (k.el) set.push(k.el.value + k.unit); });
      colophon.textContent = bits.join(' · ') + ' — set at ' + set.join(', ') +
        '. Self-hosted from stimpunks.love; the typeface is not ours.';
    }
  }

  if (faceSel) {
    faceSel.addEventListener('change', function () {
      rebuildWeights();
      updateSlant();
      render();
      say(faceSel.selectedOptions[0].dataset.family + ', drawn by ' +
          faceSel.selectedOptions[0].dataset.designer + '.');
    });
  }
  [weightSel, slantSel, caseSel, sampleSel].forEach(function (el) {
    if (el) el.addEventListener('change', render);
  });
  KNOBS.forEach(function (k) { if (k.el) k.el.addEventListener('input', render); });
  document.querySelectorAll('input[name="fo-ink"]').forEach(function (r) {
    r.addEventListener('change', function () {
      render();
      say(r.parentElement.querySelector('.fo-ink__name').textContent + '.');
    });
  });

  /* Typing moves the picker to "your own words" rather than fighting it. A
     textarea that silently did nothing until you also changed a dropdown is the
     control that gives no sign of having worked, which is the Playhouse's
     lesson about where an answer has to appear. */
  if (own) {
    own.addEventListener('input', function () {
      if (sampleSel) sampleSel.value = 'own';
      render();
    });
  }

  var printBtn = document.getElementById('fo-print');
  if (printBtn) {
    printBtn.addEventListener('click', function () {
      say('Sending the proof to your printer. The bench and the shelves are not on it.');
      window.print();
    });
  }

  var resetBtn = document.getElementById('fo-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      KNOBS.forEach(function (k) { if (k.el) k.el.value = k.start; });
      if (slantSel) slantSel.value = 'normal';
      if (caseSel) caseSel.value = 'none';
      var first = document.querySelector('input[name="fo-ink"]');
      if (first) first.checked = true;
      rebuildWeights();
      updateSlant();
      render();
      say('Bench put back. The face and the words are where you left them.');
    });
  }

  rebuildWeights();
  updateSlant();
  render();
})();
