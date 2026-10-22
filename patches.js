/* =============================================================================
   Patches, and the battle jacket they are sewn onto.

   Ryan's brief, 2026-10-14: collect patches for your battle jacket, kept and
   shown in your Profile, and sent as stickers on the CB. Some lie about the
   street and some are on a counter in a shop. Every one is a different size,
   shape and design, and every one sews onto the same jacket.

   THIS IS THE ONLY THING THAT DRAWS A PATCH, avatar.js's rule for people.
   tools/make-patches.py writes the list between the markers below out of
   data/patches.json, then RUNS THIS FILE to write each room's patch into its
   page, so a patch in a room and the same patch on a jacket or a sticker are
   the same markup from the same function and cannot drift. The radio loads it
   on the first patch it has to draw; love.js loads it on a page that has one.

   A PATCH IS ITS ROOM'S. It is drawn in that room's own inks, by name, so it
   changes when the room's colours change, and lettered in that room's own
   face; on the jacket they are all together and none of them match, which is
   what a battle jacket is. A drawing is built from a short list of paths and
   lines of text, every word escaped, and parsed as SVG, the way avatar.js
   does it; nothing anybody typed is ever in it.

   ON A ROOM'S PAGE IT SENDS ONE THING, AND ONLY WHEN SOMEBODY PRESSES THE
   BUTTON THAT SAYS SO: which patch, to /cb/patches, with the pass the radio
   keeps in love-cb, which this file reads and never writes. Signed off, the
   button never appears and nothing is sent. Nothing is stored and nothing
   moves. tools/make-patches.py reads this file for all of that.
   ============================================================================= */
(function (root) {
  'use strict';

  /* patches:data:begin */
  var DATA = {"patches":[{"id":"stimpunks-world","name":"Stimpunks.World","room":"The Street","page":"index.html","spot":"Lying on the pavement by the lift head, where somebody dropped it.","how":"scattered","alt":"A wide banner patch with notched ends: a hot pink edge, and Stimpunks.World stitched in cream capitals on near-black.","w":240,"h":64,"draw":[["path","M0 0 H240 L226 32 L240 64 H0 L14 32 Z","--hot",null,0],["path","M8 5 H230 L218 32 L230 59 H8 L20 32 Z","--ink",null,0],["path","M26 13 H214 M26 51 H214",null,"--ink-3",1.6],["text",120,42,25,"Bungee","--cream","STIMPUNKS.WORLD",176,400]]},{"id":"pink-pony-peep","name":"Pink Pony Peep","room":"Pink Pony Club","page":"pink-pony-club.html","spot":"Dropped on the dancefloor, under the mirrorball.","how":"scattered","alt":"A round patch with a cream edge: a small cream mirrorball on hot pink, and Pink Pony Peep stitched under it in a dark, fat script.","w":100,"h":100,"draw":[["path","M0 50 A50 50 0 1 0 100 50 A50 50 0 1 0 0 50 Z","--cream",null,0],["path","M5 50 A45 45 0 1 0 95 50 A45 45 0 1 0 5 50 Z","--hot",null,0],["path","M50 10 V19",null,"#2b0a1c",1.4],["path","M39 30 A11 11 0 1 0 61 30 A11 11 0 1 0 39 30 Z","--cream",null,0],["path","M39 30 H61 M50 19 V41 M42 23 Q50 27 58 23 M42 37 Q50 33 58 37",null,"#2b0a1c",1.2],["text",50,64,15,"Shrikhand","#2b0a1c","Pink Pony",70,400],["text",50,84,18,"Shrikhand","#2b0a1c","Peep",46,400]]},{"id":"wand-and-rabbit","name":"Wand & Rabbit","room":"The Chappell","page":"the-chappell.html","spot":"Dropped at the foot of the Magician’s Cut’s arch.","how":"scattered","alt":"A patch shaped like a pointed arch with a gold edge: a pale rabbit’s head with its ears up, a gold wand with a sparkle at its tip on deep indigo, and Wand & Rabbit in gold neon capitals.","w":96,"h":128,"draw":[["path","M0 128 V58 C0 28 22 8 48 0 C74 8 96 28 96 58 V128 Z","--leaf",null,0],["path","M5 123 V59 C5 32 25 14 48 6 C71 14 91 32 91 59 V123 Z","--nave",null,0],["path","M36 49 C31 41 30 30 33 23 C38 27 41 38 41 47 Z M45 47 C45 38 48 28 53 23 C56 30 54 41 49 49 Z","#EFE4FF",null,0],["path","M36.5 45.5 C34.2 39.5 33.6 33 34.6 28.5 C37 31.5 38.4 38 38.8 44.5 Z M47.2 44.5 C47.6 38 49 31.5 51.4 28.5 C52.4 33 51.8 39.5 49.5 45.5 Z","--ruby",null,0],["path","M31 57 A11 9.5 0 1 0 53 57 A11 9.5 0 1 0 31 57 Z","#EFE4FF",null,0],["path","M36 55 A1.6 1.6 0 1 0 39.2 55 A1.6 1.6 0 1 0 36 55 Z M44.8 55 A1.6 1.6 0 1 0 48 55 A1.6 1.6 0 1 0 44.8 55 Z","--nave",null,0],["path","M40.4 59.4 H43.6 L42 61.4 Z","--ruby",null,0],["path","M18 69 H78",null,"--leaf",1.4],["path","M58 66 L71 40",null,"--leaf",3.4],["path","M69.5 43 L71 40 M58 66 L59.5 63",null,"#EFE4FF",3.6],["path","M75 26.5 L76.5 31.5 L81.5 33 L76.5 34.5 L75 39.5 L73.5 34.5 L68.5 33 L73.5 31.5 Z","--leaf",null,0],["path","M63 21 L63.8 23.7 L66.5 24.5 L63.8 25.3 L63 28 L62.2 25.3 L59.5 24.5 L62.2 23.7 Z","#EFE4FF",null,0],["path","M22 40.5 L24.5 44 L22 47.5 L19.5 44 Z","--leaf",null,0],["text",39,93,15,"Monoton","--leaf","WAND",57,400],["text",78,93,15,"Monoton","--leaf","&",14,400],["text",48,113,15,"Monoton","--leaf","RABBIT",70,400]]},{"id":"interdependence","name":"Interdependence","room":"Town Hall","page":"town-hall.html","spot":"Left on a seat in the open middle of the hall.","how":"scattered","alt":"A six-sided patch with a pale gold edge: three linked rings in pale blue on warm grey, and Interdependence across it in tall, thin capitals.","w":116,"h":100,"draw":[["path","M29 0 H87 L116 50 L87 100 H29 L0 50 Z","--th-link",null,0],["path","M32 5 H84 L110 50 L84 95 H32 L6 50 Z","--th-wall",null,0],["path","M39 26 A10 10 0 1 0 59 26 A10 10 0 1 0 39 26 Z",null,"--th-sky",3.2],["path","M57 26 A10 10 0 1 0 77 26 A10 10 0 1 0 57 26 Z",null,"--th-sky",3.2],["path","M48 41 A10 10 0 1 0 68 41 A10 10 0 1 0 48 41 Z",null,"--th-sky",3.2],["text",58,67,12,"Forum","--th-text","INTERDEPENDENCE",82,400],["path","M34 77 H82",null,"--th-link",1.4]]},{"id":"kindness-is-punk","name":"Kindness Is Punk","room":"Club Chronic","page":"club-chronic.html","spot":"In a box on the distro table by the door, free to take.","how":"shop","alt":"A black patch with its corners cut off and a bone white edge: a brass safety pin across the top, and Kindness Is Punk in tall, narrow white capitals.","w":104,"h":84,"draw":[["path","M10 0 H94 L104 10 V74 L94 84 H10 L0 74 V10 Z","--cc-bone",null,0],["path","M12 5 H92 L99 12 V72 L92 79 H12 L5 72 V12 Z","--cc-dark",null,0],["path","M16 18 A4 4 0 1 0 24 18 A4 4 0 1 0 16 18 Z",null,"--cc-brass",2.2],["path","M24 16 H80 M24 20.5 H74 M80 16 Q85 18.25 80 20.5",null,"--cc-brass",2.2],["text",52,49,22,"Anton","--cc-bone","KINDNESS",76,400],["text",52,70,17,"Anton","--cc-bone","IS PUNK",58,400]]},{"id":"plant-powered","name":"Plant-Powered","room":"Vital Plant Living","page":"vital-plant-living.html","spot":"In a jar on the counter, free to take.","how":"shop","alt":"An oval patch with a turmeric edge: a sprout with two leaves on deep green, and Plant-Powered stitched under it in round, fat cream letters.","w":124,"h":80,"draw":[["path","M0 40 A62 40 0 1 0 124 40 A62 40 0 1 0 0 40 Z","--vpl-wall",null,0],["path","M5 40 A57 35 0 1 0 119 40 A57 35 0 1 0 5 40 Z","--vpl-leaf",null,0],["path","M62 36 V19",null,"--vpl-f-sprout",2.6],["path","M62 25 C56 25 52 21 51 15 C57 15 61 18 62 25 Z","--vpl-f-sprout",null,0],["path","M62 22 C68 22 73 18 74 12 C67 12 63 15 62 22 Z","--vpl-f-sprout",null,0],["text",62,56,13,"Bagel Fat One","--vpl-panel","PLANT-POWERED",92,400]]},{"id":"intermittently-social-lone-wolf","name":"Intermittently Social Lone Wolf","room":"The Cave","page":"cavendish-cave.html","spot":"Left on the floor of the cave, by the foot of the ice wall.","how":"scattered","alt":"A shield-shaped patch with an icy white edge: a crescent moon and a wolf’s head in pale blue on deep blue, and Intermittently Social Lone Wolf on three lines under them.","w":100,"h":124,"draw":[["path","M0 0 H100 V64 C100 96 76 114 50 124 C24 114 0 96 0 64 Z","--cv-crack",null,0],["path","M5 5 H95 V63 C95 92 73 108 50 118 C27 108 5 92 5 63 Z","--cv-deep",null,0],["path","M76 12 A7 7 0 1 0 76 26 A5.4 5.4 0 1 1 76 12 Z","--cv-dim",null,0],["path","M50 60 L39 47 L34 28 L43 37 L50 34 L57 37 L66 28 L61 47 Z","--cv-glow",null,0],["path","M43 44 L47.5 45.5 L44 47.5 Z M57 44 L52.5 45.5 L56 47.5 Z","--cv-deep",null,0],["text",50,77,8.5,"Encode Sans Expanded","--cv-text","INTERMITTENTLY",78,600],["text",50,89,9.5,"Encode Sans Expanded","--cv-text","SOCIAL",44,600],["text",50,102,10,"Encode Sans Expanded","--cv-text","LONE WOLF",54,600]]},{"id":"synapse-of-the-soil","name":"Synapse of the Soil","room":"Mycelium Munchies","page":"mycelium-munchies.html","spot":"In a dish at the end of the pass, free to take.","how":"shop","alt":"A round patch with a gold edge: pale branching threads meeting at gold knots on near-black, and Synapse of the Soil in soft, heavy cream letters.","w":104,"h":104,"draw":[["path","M0 52 A52 52 0 1 0 104 52 A52 52 0 1 0 0 52 Z","--myc-gold",null,0],["path","M5 52 A47 47 0 1 0 99 52 A47 47 0 1 0 5 52 Z","--myc-dark",null,0],["path","M52 40 L36 26 L27 28 M36 26 L34 15 M52 40 L67 24 L77 22 M67 24 L65 13 M52 40 L52 20 M52 40 L30 43 L19 39 M52 40 L74 43 L85 39",null,"--myc-cream",1.6],["path","M49.6 40 A2.4 2.4 0 1 0 54.4 40 A2.4 2.4 0 1 0 49.6 40 Z M34 26 A2 2 0 1 0 38 26 A2 2 0 1 0 34 26 Z M65 24 A2 2 0 1 0 69 24 A2 2 0 1 0 65 24 Z","--myc-gold",null,0],["text",52,67,15,"Caprasimo","--myc-cream","SYNAPSE",62,400],["text",52,83,11,"Caprasimo","--myc-cream","OF THE SOIL",60,400]]}]};
  /* patches:data:end */

  var PATCHES = '/cb/patches';
  var PASS_KEY = 'love-cb';
  var SCALE = 1.2;                         // pixels to a millimetre, in a room

  var byId = {};
  DATA.patches.forEach(function (p) { byId[p.id] = p; });

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function ink(c) { return !c ? 'none' : (c.charAt(0) === '#' ? c : 'var(' + c + ')'); }

  /* One patch's own elements, in its own millimetres. */
  function inner(p) {
    return p.draw.map(function (it) {
      if (it[0] === 'path') {
        return '<path d="' + esc(it[1]) + '" fill="' + ink(it[2]) + '"' +
          (it[3] ? ' stroke="' + ink(it[3]) + '" stroke-width="' + it[4] +
            '" stroke-linecap="round" stroke-linejoin="round"' : '') + '/>';
      }
      return '<text x="' + it[1] + '" y="' + it[2] + '" font-size="' + it[3] + '" font-family="' +
        esc("'" + it[4] + "', sans-serif") + '" font-weight="' + it[8] + '" fill="' + ink(it[5]) +
        '" text-anchor="middle" textLength="' + it[7] + '" lengthAdjust="spacingAndGlyphs">' +
        esc(it[6]) + '</text>';
    }).join('');
  }

  /* A patch on its own. With a label it is an image with its words, which is
     how a room shows it; without one it is silent and its caption speaks. */
  function svg(id, opts) {
    var p = byId[id];
    if (!p) return '';
    opts = opts || {};
    var s = opts.scale || SCALE;
    var w = Math.round(p.w * s), h = Math.round(p.h * s);
    return '<svg xmlns="http://www.w3.org/2000/svg" class="' + esc(opts.cls || 'patch__art') +
      '" viewBox="0 0 ' + p.w + ' ' + p.h + '" width="' + w + '" height="' + h + '"' +
      (opts.label ? ' role="img" aria-label="' + esc(p.alt) + '"' : ' aria-hidden="true" focusable="false"') +
      '>' + inner(p) + '</svg>';
  }

  /* ── The battle jacket ──────────────────────────────────────────────────
     A sleeveless denim jacket from the back, and the patches sewn on in the
     order the street lists them -- never the order they were picked up,
     which nothing keeps. They go on in rows across the back, each its own
     size, and if they will not all fit, every one is made smaller by the same
     amount, so no patch is ever bigger than another that was the same size. */
  var BACK = { x0: 104, x1: 416, y0: 112, y1: 542, gap: 12 };

  function layout(list, s) {
    var rows = [], row = { items: [], w: 0, h: 0 }, width = BACK.x1 - BACK.x0;
    list.forEach(function (p) {
      var pw = p.w * s, ph = p.h * s;
      if (row.items.length && row.w + BACK.gap + pw > width) { rows.push(row); row = { items: [], w: 0, h: 0 }; }
      row.w += (row.items.length ? BACK.gap : 0) + pw;
      row.h = Math.max(row.h, ph);
      row.items.push(p);
    });
    if (row.items.length) rows.push(row);
    var out = [], y = BACK.y0;
    for (var r = 0; r < rows.length; r++) {
      var x = BACK.x0 + (width - rows[r].w) / 2;
      rows[r].items.forEach(function (p) {
        out.push({ p: p, x: x, y: y + (rows[r].h - p.h * s) / 2 });
        x += p.w * s + BACK.gap;
      });
      y += rows[r].h + BACK.gap;
    }
    return y - BACK.gap <= BACK.y1 ? out : null;
  }

  function names(list) {
    var n = list.map(function (p) { return p.name; });
    return n.length < 2 ? n.join('') : n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1];
  }

  function jacketSvg(ids, opts) {
    opts = opts || {};
    var list = DATA.patches.filter(function (p) { return (ids || []).indexOf(p.id) >= 0; });
    var s = 1, at = layout(list, s);
    while (!at && s > 0.2) { s *= 0.9; at = layout(list, s); }
    var label = 'A denim battle jacket, from the back, ' +
      (list.length ? 'with patches sewn on: ' + names(list) + '.' : 'with nothing sewn on it.');
    var sewn = (at || []).map(function (a) {
      return '<g transform="translate(' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + ') scale(' + s.toFixed(3) + ')">' +
        inner(a.p) + '</g>';
    }).join('');
    return '<svg xmlns="http://www.w3.org/2000/svg" class="' + esc(opts.cls || 'jacket') +
      '" viewBox="0 0 520 600" role="img" aria-label="' + esc(label) + '">' +
      '<path d="M160 24 Q260 56 360 24 L470 64 Q424 150 444 252 L456 584 H64 L76 252 Q96 150 50 64 Z" ' +
      'fill="var(--bj-denim)" stroke="var(--bj-seam)" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M58 96 Q260 128 462 96 M68 558 H452" fill="none" stroke="var(--bj-stitch)" stroke-width="2.4" ' +
      'stroke-dasharray="7 6"/>' + sewn + '</svg>';
  }

  function parse(s) {
    if (!s || typeof DOMParser === 'undefined') return null;
    var doc = new DOMParser().parseFromString(s, 'image/svg+xml');
    var el = doc.documentElement;
    return el && el.nodeName === 'svg' ? document.importNode(el, true) : null;
  }

  root.lovePatches = {
    list: DATA.patches.map(function (p) {
      return { id: p.id, name: p.name, room: p.room, page: p.page, spot: p.spot, how: p.how };
    }),
    svg: svg,
    jacketSvg: jacketSvg,
    draw: function (id, opts) { return parse(svg(id, opts)); },
    jacket: function (ids, opts) { return parse(jacketSvg(ids, opts)); },
    name: function (id) { return byId[id] ? byId[id].name : ''; }
  };

  /* ── A patch in a room ─────────────────────────────────────────────────── */
  if (typeof document === 'undefined') return;

  function pass() {
    try { var v = JSON.parse(localStorage.getItem(PASS_KEY) || 'null'); return v && v.pass ? v.pass : null; }
    catch (e) { return null; }
  }

  function call(payload) {
    var p = pass();
    if (!p) return Promise.resolve({ status: 0, body: {} });
    return fetch(PATCHES, {
      method: 'POST', credentials: 'omit', cache: 'no-store',
      headers: { 'accept': 'application/json', 'content-type': 'application/json', 'authorization': 'Bearer ' + p },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().then(function (b) { return { status: r.status, body: b || {} }; },
        function () { return { status: r.status, body: {} }; });
    }, function () { return { status: -1, body: {} }; });
  }

  function rooms() {
    var spots = document.querySelectorAll('.patch[data-patch]');
    if (!spots.length || !pass()) return;
    for (var i = 0; i < spots.length; i++) (function (spot) {
      var go = spot.querySelector('.patch__go');
      var take = spot.querySelector('.patch__take');
      var said = spot.querySelector('.patch__said');
      if (!go || !take || !said) return;
      go.hidden = false;
      take.addEventListener('click', function () {
        take.disabled = true;
        call({ take: spot.dataset.patch }).then(function (r) {
          take.disabled = false;
          if (r.status === 200) {
            said.textContent = r.body.taken
              ? 'It is on your battle jacket now. Profile, on the radio, shows it.'
              : 'You have this one already. It is on your battle jacket, in your Profile.';
            try { window.dispatchEvent(new CustomEvent('love-patches')); } catch (e) {}
            return;
          }
          said.textContent = r.status === 401
            ? 'Since you signed on, this username has been signed off. Sign on again at the Community Center, and press it again.'
            : r.status === -1 ? 'The street could not be reached just now. Nothing was taken.'
            : (r.body && typeof r.body.error === 'string') ? r.body.error : 'That did not work just now. Nothing was taken.';
        });
      });
    })(spots[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', rooms);
  else rooms();
})(typeof window !== 'undefined' ? window : globalThis);
