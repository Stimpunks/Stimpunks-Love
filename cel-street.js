/* =============================================================================
   Cel Street: the whole street, built in WebGL and drawn like a
   cel. Ryan's ask, 2026-10-31: a WebGL version of the street in a 3D anime
   style, beside Paper Street rather than instead of it, as a proof of concept.

   THE DOORS ARE THE FRONT PAGE'S OWN, READ WHEN THE PAGE OPENS. index.html is
   asked for once, its whole row of doors is taken out of it, and the garden
   gate and the lots' gates with them,
   and each door is stood for a moment in an invisible box on this page so the
   browser can say what it wears: its ground, its awning's stripes, its name's
   colour and face. Each becomes a building whose ground floor is that door's
   shop, its sign lettered in the door's own face, its awning in the door's own
   stripes. Everything round the shops (the floors above them, the roofs and
   their solar panels, the poles and the wires, the trees, the signs, the road)
   is Cel Street's, in the colours love.css declares for it as --cel-*, read by
   name.

   THE LOOK IS CEL SHADING: light in two flat steps with nothing between them,
   and every solid thing inked round its edge by a hull drawn a little larger
   behind it. The sun is high and to one side, every shadow is hard, and the
   shadow side of everything takes the sky's blue.

   NOTHING MOVES BY ITSELF. The scene is drawn when something changes and then
   not again: no clouds drift, no wires sway. Movement is requestAnimationFrame,
   and only while a key or button is held or a glide is on its way to a door.
   Gentle starts in steps, which jump with nothing in between.

   IT KEEPS NOTHING AND SENDS NOTHING. It reads index.html once, and the doors
   go into an ordinary list of links under the scene, which is the way in for a
   keyboard and a screen reader: a WebGL canvas is a picture to both.
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
import * as THREE from './vendor/three.module.min.js';
import { CSS3DRenderer, CSS3DObject } from './vendor/CSS3DRenderer.js';

var stage = document.querySelector('[data-cel-stage]');
if (stage) start();

function start() {
  'use strict';
  // The rooms you can walk into, each its own file and its own world, written
  // here by tools/make-cel-street.py from the cel-in-*.js files. Do not
  // hand-edit between the markers.
  // cel:rooms:begin
  var ROOMS = {'a-quiet-pint.html': 'cel-in-a-quiet-pint.js', 'adventurers-guild.html': 'cel-in-adventurers-guild.js', 'arcade.html': 'cel-in-arcade.js', 'bodymind-booth.html': 'cel-in-bodymind-booth.js', 'breaker-breaker.html': 'cel-in-breaker-breaker.js', 'brew-and-stew.html': 'cel-in-brew-and-stew.js', 'broadsheet-broadside.html': 'cel-in-broadsheet-broadside.js', 'campgrounds.html': 'cel-in-campgrounds.js', 'cavendish-campfire.html': 'cel-in-cavendish-campfire.js', 'cavendish-cave.html': 'cel-in-cavendish-cave.js', 'cavendish-coworking.html': 'cel-in-cavendish-coworking.js', 'cavendish-editorial.html': 'cel-in-cavendish-editorial.js', 'cavendish-events.html': 'cel-in-cavendish-events.js', 'cavendish-operations.html': 'cel-in-cavendish-operations.js', 'cavendish-watering-hole.html': 'cel-in-cavendish-watering-hole.js', 'chimera-obscura.html': 'cel-in-chimera-obscura.js', 'club-chronic.html': 'cel-in-club-chronic.js', 'collection-collection.html': 'cel-in-collection-collection.js', 'community-care.html': 'cel-in-community-care.js', 'community-center.html': 'cel-in-community-center.js', 'community-library.html': 'cel-in-community-library.js', 'coping.html': 'cel-in-coping.js', 'count-me-in.html': 'cel-in-count-me-in.js', 'covenstead.html': 'cel-in-covenstead.js', 'dead-tired-society.html': 'cel-in-dead-tired-society.js', 'dopamine-dress-up-den.html': 'cel-in-dopamine-dress-up-den.js', 'enids-room.html': 'cel-in-enids-room.js', 'faery-cinema-room.html': 'cel-in-faery-cinema-room.js', 'faery-music-room.html': 'cel-in-faery-music-room.js', 'faery-myths-room.html': 'cel-in-faery-myths-room.js', 'faery-reading-room.html': 'cel-in-faery-reading-room.js', 'faery-yurt.html': 'cel-in-faery-yurt.js', 'fantasy-fancy-dress.html': 'cel-in-fantasy-fancy-dress.js', 'foundry.html': 'cel-in-foundry.js', 'fridge-of-sighs.html': 'cel-in-fridge-of-sighs.js', 'glow-wild-hollow.html': 'cel-in-glow-wild-hollow.js', 'healing-checkpoint.html': 'cel-in-healing-checkpoint.js', 'hear-queer-here.html': 'cel-in-hear-queer-here.js', 'hey-good-cookin.html': 'cel-in-hey-good-cookin.js', 'jungle-room.html': 'cel-in-jungle-room.js', 'l-space.html': 'cel-in-l-space.js', 'latibulum.html': 'cel-in-latibulum.js', 'laughingstock.html': 'cel-in-laughingstock.js', 'learning-large.html': 'cel-in-learning-large.js', 'lightbulb-picture-house.html': 'cel-in-lightbulb-picture-house.js', 'live-room.html': 'cel-in-live-room.js', 'neurohome.html': 'cel-in-neurohome.js', 'oook.html': 'cel-in-oook.js', 'oracle-deck.html': 'cel-in-oracle-deck.js', 'otterly-adorbs.html': 'cel-in-otterly-adorbs.js', 'pando-calrissian.html': 'cel-in-pando-calrissian.js', 'pekoe-and-purrs.html': 'cel-in-pekoe-and-purrs.js', 'penguin-pebbling.html': 'cel-in-penguin-pebbling.js', 'pets.html': 'cel-in-pets.js', 'pink-pony-club.html': 'cel-in-pink-pony-club.js', 'play-pod.html': 'cel-in-play-pod.js', 'playhouse.html': 'cel-in-playhouse.js', 'plural-mural.html': 'cel-in-plural-mural.js', 'polaroids.html': 'cel-in-polaroids.js', 'quill-drift.html': 'cel-in-quill-drift.js', 'rabbit-hole.html': 'cel-in-rabbit-hole.js', 'rescue-a-cat.html': 'cel-in-rescue-a-cat.js', 'rescue-a-dog.html': 'cel-in-rescue-a-dog.js', 'rescue-small-animals.html': 'cel-in-rescue-small-animals.js', 'samefood-cafe.html': 'cel-in-samefood-cafe.js', 'sandbox.html': 'cel-in-sandbox.js', 'show-your-work.html': 'cel-in-show-your-work.js', 'solarpunk-hermitage.html': 'cel-in-solarpunk-hermitage.js', 'swaying-sweetgrass.html': 'cel-in-swaying-sweetgrass.js', 'the-bough-house.html': 'cel-in-the-bough-house.js', 'the-chappell.html': 'cel-in-the-chappell.js', 'the-den.html': 'cel-in-the-den.js', 'the-doom-scoop.html': 'cel-in-the-doom-scoop.js', 'the-doomscroll.html': 'cel-in-the-doomscroll.js', 'the-feed.html': 'cel-in-the-feed.js', 'the-honesty-box.html': 'cel-in-the-honesty-box.js', 'the-mopery.html': 'cel-in-the-mopery.js', 'the-mountain-cabin.html': 'cel-in-the-mountain-cabin.js', 'the-mud-room.html': 'cel-in-the-mud-room.js', 'the-open-notebook.html': 'cel-in-the-open-notebook.js', 'the-source.html': 'cel-in-the-source.js', 'town-hall-board.html': 'cel-in-town-hall-board.js', 'town-hall-directors.html': 'cel-in-town-hall-directors.js', 'town-hall-executive-session.html': 'cel-in-town-hall-executive-session.js', 'town-hall-fishbowl.html': 'cel-in-town-hall-fishbowl.js', 'town-hall-moderators.html': 'cel-in-town-hall-moderators.js', 'town-hall.html': 'cel-in-town-hall.js', 'vital-plant-living.html': 'cel-in-vital-plant-living.js', 'volunteers.html': 'cel-in-volunteers.js', 'words-bud-beats.html': 'cel-in-words-bud-beats.js', 'your-room.html': 'cel-in-your-room.js', 'zibaldone.html': 'cel-in-zibaldone.js', 'zine-issue-2.html': 'cel-in-zine-issue-2.js', 'zine-table.html': 'cel-in-zine-table.js'};
  // cel:rooms:end
  var CHUNK = 60;            // the street is drawn in lengths this long
  var VIEW = 300;            // and only the lengths this near you are drawn
  var FRONT = 6.2;           // half the street, kerb to kerb past the pavements
  var ROAD = 3.5;            // half the road
  var EYE = 1.6;
  var WALK = 4.6, TURN = 1.7, STEP = 2.2, STEP_TURN = Math.PI / 6;
  var INK = 0.05;            // how thick the ink round a solid thing is

  var hereEl = document.querySelector('[data-cel-here]');
  var failed = document.querySelector('[data-cel-failed]');
  var controls = document.querySelector('[data-cel-controls]');
  var list = document.querySelector('[data-cel-doors]');
  var modeBtn = document.querySelector('[data-cel-mode]');
  var climbBtn = document.querySelector('[data-cel-go="climb"]');
  var outBtn = document.querySelector('[data-cel-out]');
  var placesEl = document.querySelector('[data-cel-places]');

  function fail(words) {
    if (failed) { failed.hidden = false; if (words) failed.firstChild.textContent = words + ' '; }
    if (controls) controls.hidden = true;
  }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
  } catch (e) {
    fail('This browser could not draw the street in WebGL, so there is nothing to show here.');
    return;
  }
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  var canvas = renderer.domElement;
  canvas.className = 'cel-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  stage.insertBefore(canvas, stage.firstChild);
  // A room's own page stands in its scene as a page, laid over the canvas in
  // the same perspective, so it reads and presses as itself.
  var css3d = new CSS3DRenderer();
  css3d.domElement.className = 'cel-css3d';
  stage.insertBefore(css3d.domElement, canvas.nextSibling);

  /* ── Colours, by name, out of love.css ────────────────────────────────── */
  var rootStyle = getComputedStyle(document.documentElement);
  function css(name) { return rootStyle.getPropertyValue(name).trim(); }
  function col(name) { return new THREE.Color(css(name)); }

  // Two steps of light and nothing between them.
  var steps = new Uint8Array([165, 165, 165, 255, 255, 255, 255, 255]);
  var gradient = new THREE.DataTexture(steps, 2, 1, THREE.RGBAFormat);
  gradient.minFilter = THREE.NearestFilter;
  gradient.magFilter = THREE.NearestFilter;
  gradient.needsUpdate = true;

  var mats = {};
  function toon(name) {
    if (!mats[name]) mats[name] = new THREE.MeshToonMaterial({ color: col(name), gradientMap: gradient });
    return mats[name];
  }
  function toonColor(c) {
    var key = 'c' + c.getHexString();
    if (!mats[key]) mats[key] = new THREE.MeshToonMaterial({ color: c, gradientMap: gradient });
    return mats[key];
  }
  var inkMat = new THREE.MeshBasicMaterial({ color: col('--cel-ink'), side: THREE.BackSide });

  /* ── The scene ────────────────────────────────────────────────────────── */
  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(col('--cel-haze'), 70, 260);
  var camera = new THREE.PerspectiveCamera(62, 1, 0.1, 900);

  scene.add(new THREE.HemisphereLight(col('--cel-sky'), col('--cel-walk'), 2.1));
  var sun = new THREE.DirectionalLight(col('--cel-cloud'), 1.9);
  var SUN = new THREE.Vector3(16, 52, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -45; sun.shadow.camera.right = 45;
  sun.shadow.camera.top = 45; sun.shadow.camera.bottom = -45;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 140;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);

  /* ── Pieces that never move are merged, one mesh per material ─────────── */
  var buckets = {};
  var tmpBox = new THREE.Box3(), tmpSize = new THREE.Vector3(), tmpMid = new THREE.Vector3();
  function bucket(key, mat, shadow) {
    if (!buckets[key]) buckets[key] = { mat: mat, geos: [], shadow: shadow !== false };
    return buckets[key];
  }
  // Put a piece in place: geo in its own frame, m the matrix that stands it.
  // ink: the hull behind it, a little larger on every side, drawn in ink.
  // A piece goes into the length of street it stands in, so a length far
  // away can be left undrawn; anything longer than a length is always drawn.
  function chunkOf(g) {
    g.computeBoundingBox();
    var b = g.boundingBox;
    if (b.max.z - b.min.z > CHUNK) return 'all';
    return Math.floor((b.min.z + b.max.z) / 2 / CHUNK);
  }
  function piece(geo, m, mat, key, ink, shadow) {
    var g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.applyMatrix4(m);
    var c = chunkOf(g);
    bucket(key + '|' + c, mat, shadow).geos.push(g);
    if (ink !== false) {
      var h = geo.index ? geo.toNonIndexed() : geo.clone();
      h.computeBoundingBox();
      tmpBox.copy(h.boundingBox); tmpBox.getSize(tmpSize); tmpBox.getCenter(tmpMid);
      var t = typeof ink === 'number' ? ink : INK;
      h.translate(-tmpMid.x, -tmpMid.y, -tmpMid.z);
      h.scale(1 + 2 * t / Math.max(tmpSize.x, 1e-3), 1 + 2 * t / Math.max(tmpSize.y, 1e-3), 1 + 2 * t / Math.max(tmpSize.z, 1e-3));
      h.translate(tmpMid.x, tmpMid.y, tmpMid.z);
      h.applyMatrix4(m);
      bucket('ink|' + c, inkMat, false).geos.push(h);
    }
  }
  function merge(geos) {
    var n = 0, i, hasUv = true;
    geos.forEach(function (g) { n += g.attributes.position.count; if (!g.attributes.uv) hasUv = false; });
    var pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = hasUv ? new Float32Array(n * 2) : null, at = 0;
    geos.forEach(function (g) {
      pos.set(g.attributes.position.array, at * 3);
      if (g.attributes.normal) nor.set(g.attributes.normal.array, at * 3);
      if (uv) uv.set(g.attributes.uv.array, at * 2);
      at += g.attributes.position.count;
      g.dispose();
    });
    var out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    if (uv) out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    return out;
  }
  var far = [];               // what is drawn only while you are near it
  function bake() {
    Object.keys(buckets).forEach(function (k) {
      var b = buckets[k];
      if (!b.geos.length) return;
      var mesh = new THREE.Mesh(merge(b.geos), b.mat);
      mesh.castShadow = b.shadow; mesh.receiveShadow = k.indexOf('ink|') !== 0;
      mesh.matrixAutoUpdate = false;
      scene.add(mesh);
      var c = k.split('|')[1];
      if (c !== 'all') far.push({ o: mesh, z: (+c + 0.5) * CHUNK });
    });
    buckets = {};
  }

  // A matrix out of a place, a turn about the vertical and a tilt.
  var M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1);
  function at(x, y, z, ry, rx, rz, parent) {
    E.set(rx || 0, ry || 0, rz || 0, 'YXZ');
    Q.setFromEuler(E);
    var m = new THREE.Matrix4().compose(V.set(x, y, z), Q, S);
    return parent ? new THREE.Matrix4().multiplyMatrices(parent, m) : m;
  }
  // A mesh of its own, placed once by a matrix and never moved.
  function put(mesh, m) {
    mesh.matrixAutoUpdate = false;
    mesh.matrix.copy(m);
    mesh.matrixWorldNeedsUpdate = true;
    scene.add(mesh);
    far.push({ o: mesh, z: m.elements[14] });
    return mesh;
  }
  var BOX = new THREE.BoxGeometry(1, 1, 1);
  function box(w, h, d, m, name, ink, shadow) {
    var g = BOX.clone(); g.scale(w, h, d);
    piece(g, m, toon(name), name, ink, shadow);
  }
  function cyl(r0, r1, h, m, name, ink, seg) {
    piece(new THREE.CylinderGeometry(r0, r1, h, seg || 10), m, toon(name), name, ink);
  }

  /* ── Textures drawn on a canvas, from the same colours ────────────────── */
  function tex(w, h, draw) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    var t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }
  var windowTex = tex(128, 160, function (g, w, h) {
    g.fillStyle = css('--cel-frame'); g.fillRect(0, 0, w, h);
    g.fillStyle = css('--cel-glass'); g.fillRect(10, 10, w - 20, h - 20);
    g.fillStyle = css('--cel-glint');
    g.beginPath(); g.moveTo(26, h - 22); g.lineTo(58, 12); g.lineTo(80, 12); g.lineTo(48, h - 22); g.fill();
    g.fillRect(w / 2 - 3, 10, 6, h - 20);
  });
  var solarTex = tex(256, 160, function (g, w, h) {
    g.fillStyle = css('--cel-frame'); g.fillRect(0, 0, w, h);
    g.fillStyle = css('--cel-panel'); g.fillRect(6, 6, w - 12, h - 12);
    g.strokeStyle = css('--cel-frame'); g.lineWidth = 2;
    for (var x = 6; x < w; x += (w - 12) / 6) { g.beginPath(); g.moveTo(x, 6); g.lineTo(x, h - 6); g.stroke(); }
    for (var y = 6; y < h; y += (h - 12) / 4) { g.beginPath(); g.moveTo(6, y); g.lineTo(w - 6, y); g.stroke(); }
    g.fillStyle = css('--cel-glint'); g.globalAlpha = 0.55;
    g.beginPath(); g.moveTo(20, h - 6); g.lineTo(90, 6); g.lineTo(120, 6); g.lineTo(50, h - 6); g.fill();
  });
  var winMat = new THREE.MeshToonMaterial({ map: windowTex, gradientMap: gradient });
  var solarMat = new THREE.MeshToonMaterial({ map: solarTex, gradientMap: gradient });
  var PLANE = new THREE.PlaneGeometry(1, 1);
  function plane(w, h, m, mat, key) { var g = PLANE.clone(); g.scale(w, h, 1); piece(g, m, mat, key, false, false); }

  /* ── Reading the street ───────────────────────────────────────────────── */
  function pageOf(a) {
    var h = (a.getAttribute('href') || '').split('#')[0].split('?')[0];
    if (/^[a-z]+:/i.test(h)) return '';
    h = h.replace(/^\.?\//, '');
    if (!h) return 'index.html';
    return /\.[a-z0-9]+$/i.test(h) ? h : h + '.html';
  }
  function colours(s) { return (s.match(/rgba?\([^)]+\)/g) || []).filter(function (c) { return !/,\s*0\)$/.test(c); }); }
  function clear(c) { return !c || /rgba\([^)]*,\s*0\)$/.test(c) || c === 'transparent'; }

  // Stand each door for a moment where the browser can dress it, and write
  // down what it wears.
  // What each kind of thing on the front page wears, and where: a door's
  // ground, its awning and its name; the garden gate's arch and its words; a
  // lot's gate, the band along its top and its name.
  var PARTS = {
    door: { ground: null, stripes: '.door__awning', name: '.door__name' },
    gate: { ground: '.gardengate__arch', stripes: null, name: '.gardengate__to' },
    lot: { ground: null, stripes: null, name: '.lotgate__name' },
    post: { ground: '.signpost__arm', stripes: null, name: '.signpost__to' }
  };
  function named(t, kind) {
    t = t.replace(/[\u2190-\u21ff]/g, '').replace(/\s+/g, ' ').trim();
    if (kind === 'gate') {
      t = t.split(':').pop().trim().toLowerCase().replace(/(^|\s)\S/g, function (m) { return m.toUpperCase(); });
    }
    return t;
  }
  function wear(items) {
    var box = document.createElement('div');
    box.className = 'cel-measure';
    box.setAttribute('aria-hidden', 'true');
    var copies = items.map(function (it) {
      var c = document.importNode(it.el, true);
      c.removeAttribute('href');
      box.appendChild(c);
      return c;
    });
    document.body.appendChild(box);
    var out = copies.map(function (c, i) {
      var it = items[i], P = PARTS[it.kind];
      var g = P.ground ? c.querySelector(P.ground) || c : c;
      var cs = getComputedStyle(g);
      var aw = P.stripes ? c.querySelector(P.stripes) : null, nm = c.querySelector(P.name);
      var awCs = aw ? getComputedStyle(aw) : null, nmCs = nm ? getComputedStyle(nm) : cs;
      var ground = cs.backgroundColor;
      if (clear(ground)) ground = colours(cs.backgroundImage)[0] || '';
      var stripes = awCs ? colours(awCs.backgroundImage) : [];
      if (!stripes.length && awCs && !clear(awCs.backgroundColor)) stripes = [awCs.backgroundColor];
      if (!stripes.length && parseFloat(getComputedStyle(c).borderTopWidth) > 0) stripes = [getComputedStyle(c).borderTopColor];
      if (clear(ground)) ground = stripes[0] || css('--cel-wall-1');
      if (!stripes.length) stripes = [ground, nmCs.color];
      if (stripes.length < 2) stripes.unshift(ground);
      return {
        kind: it.kind,
        name: named(nm ? nm.textContent : it.el.textContent, it.kind),
        page: pageOf(it.el),
        ground: ground,
        stripes: stripes.slice(0, 3),
        ink: nmCs.color,
        face: nmCs.fontFamily,
        weight: nmCs.fontWeight
      };
    });
    box.remove();
    return out;
  }

  function hash(s) {
    var n = 2166136261;
    for (var i = 0; i < s.length; i++) n = Math.imul(n ^ s.charCodeAt(i), 16777619);
    return (n >>> 0) / 4294967296;
  }

  // A sign in a thing's own ground, lettered in its own face and ink.
  function signboard(d, sw, sh, m) {
    var sign = tex(768, Math.max(48, Math.round(768 * sh / sw)), function (c, w, h) {
      c.fillStyle = d.ground; c.fillRect(0, 0, w, h);
      c.strokeStyle = d.ink; c.lineWidth = 6; c.strokeRect(5, 5, w - 10, h - 10);
      var size = Math.round(h * 0.62);
      do { c.font = d.weight + ' ' + size + 'px ' + d.face; size -= 3; } while (c.measureText(d.name).width > w - 54 && size > 16);
      c.fillStyle = d.ink; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(d.name, w / 2, h / 2 + 2);
    });
    return put(new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), new THREE.MeshBasicMaterial({ map: sign, fog: true })), m);
  }
  function hitbox(i, w, h, d, m) {
    var hb = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ visible: false }));
    hb.matrixAutoUpdate = false; hb.matrix.copy(m); hb.matrixWorld.copy(m);
    hb.userData.stop = i;
    hits.push(hb);
  }

  /* ── A building, with its shop on the ground floor ─────────────────────── */
  var WALLS = ['--cel-wall-1', '--cel-wall-2', '--cel-wall-3', '--cel-wall-4'];
  var hits = [];
  function building(d, i, side, zc, W) {
    var r = hash(d.name), r2 = hash(d.name + '2'), r3 = hash(d.name + '3');
    var D = 9, H = 7.5 + Math.floor(r * 4) * 3;
    var wall = WALLS[Math.floor(r2 * WALLS.length)];
    var g = at(side * (FRONT + D / 2), 0, zc, side < 0 ? Math.PI / 2 : -Math.PI / 2);
    var front = D / 2;
    box(W, H, D, at(0, H / 2, 0, 0, 0, 0, g), wall);
    // A ledge between every floor, and the parapet round the roof.
    var floors = Math.floor((H - 4) / 3);
    for (var f = 1; f <= floors; f++) box(W + 0.16, 0.14, 0.2, at(0, 4 + (f - 1) * 3 - 0.2, front + 0.06, 0, 0, 0, g), wall);
    box(W + 0.2, 0.5, 0.3, at(0, H + 0.1, front, 0, 0, 0, g), wall);
    box(W + 0.2, 0.5, 0.3, at(0, H + 0.1, -front, 0, 0, 0, g), wall);
    box(0.3, 0.5, D, at(-W / 2, H + 0.1, 0, 0, 0, 0, g), wall);
    box(0.3, 0.5, D, at(W / 2, H + 0.1, 0, 0, 0, 0, g), wall);

    // THE SHOP: the door's own ground, its glass, its awning, and its sign
    // on the band above the awning, lettered in the door's own face.
    var shopC = new THREE.Color(d.ground);
    var shopMat = toonColor(shopC);
    piece((function () { var b = BOX.clone(); b.scale(W - 0.3, 4.5, 0.4); return b; })(), at(0, 2.25, front + 0.2, 0, 0, 0, g), shopMat, 'c' + shopC.getHexString());
    plane(1.4, 2.3, at(-W / 2 + 1.3, 1.15, front + 0.41, 0, 0, 0, g), winMat, 'win');
    plane(W - 3.6, 1.8, at(0.7, 1.5, front + 0.41, 0, 0, 0, g), winMat, 'win');
    signboard(d, W - 1.0, 0.95, at(0, 3.85, front + 0.42, 0, 0, 0, g));
    var aw = tex(256, 64, function (c, w, h) {
      var n = Math.max(d.stripes.length, 2), sw = w / 16;
      for (var k = 0; k < 16; k++) { c.fillStyle = d.stripes[k % n]; c.fillRect(k * sw, 0, sw + 1, h); }
    });
    var awM = at(0, 3.0, front + 1.12, 0, 0.42, 0, g);
    var awning = put(new THREE.Mesh(new THREE.BoxGeometry(W - 0.6, 0.08, 1.5), new THREE.MeshToonMaterial({ map: aw, gradientMap: gradient })), awM);
    awning.castShadow = true; awning.receiveShadow = true;
    put(new THREE.Mesh(new THREE.BoxGeometry(W - 0.6 + 0.1, 0.18, 1.6), inkMat), awM);

    // THE FLOORS ABOVE IT: windows, and on every other building balconies.
    var cols = Math.max(2, Math.floor(W / 2.3)), balc = r3 < 0.5;
    for (f = 0; f < floors; f++) {
      var y = 4.9 + f * 3 + 0.9;
      for (var k = 0; k < cols; k++) {
        var x = -W / 2 + (k + 0.5) * (W / cols);
        plane(1.15, 1.45, at(x, y, front + 0.02, 0, 0, 0, g), winMat, 'win');
        if (balc) {
          box(W / cols - 0.25, 0.14, 0.9, at(x, y - 1.05, front + 0.45, 0, 0, 0, g), '--cel-kerb');
          box(W / cols - 0.25, 0.85, 0.07, at(x, y - 0.55, front + 0.88, 0, 0, 0, g), '--cel-kerb', 0.03);
          if ((k + f) % 3 === 0) box(0.7, 0.5, 0.3, at(x - 0.6, y - 0.73, front + 0.3, 0, 0, 0, g), '--cel-frame');
        }
      }
    }
    // THE ROOF: rows of solar panels on racks, tipped toward the sun, and on
    // some a water tank among them.
    solar(g, W, D, H, r3 > 0.7);
    if (r3 > 0.7) {
      cyl(0.7, 0.7, 1.4, at(-W / 2 + 1.5, H + 1.05, -D / 2 + 1.6, 0, 0, 0, g), '--cel-frame');
    }
    // An invisible box to press on, the size of the building.
    hitbox(i, W, H + 1, D, at(0, H / 2, 0, 0, 0, 0, g));
    return H;
  }

  // Rows of solar panels on racks across a roof, tipped toward the sun; tank
  // leaves the corner clear for a water tank.
  function solar(g, W, D, H, tank) {
    var rows = Math.floor((D - 1.6) / 1.7);
    for (var rr = 0; rr < rows; rr++) {
      for (var pc = 0; pc < Math.floor((W - 1) / 1.15); pc++) {
        var px = -W / 2 + 0.9 + pc * 1.15, pz = -D / 2 + 1.2 + rr * 1.7;
        if (tank && pc < 2 && rr < 2) continue;
        var tilt = at(px, H + 0.55, pz, 0, -0.38, 0, g);
        box(1.05, 0.06, 1.25, tilt, '--cel-frame', 0.025);
        plane(1.0, 1.2, new THREE.Matrix4().multiplyMatrices(tilt, at(0, 0.035, 0, 0, -Math.PI / 2)), solarMat, 'solar');
        box(0.06, 0.5, 0.06, at(px, H + 0.25, pz - 0.4, 0, 0, 0, g), '--cel-frame', false);
      }
    }
  }

  // THE GARDEN GATE, halfway down, as on the Map: a gap between two shops with
  // a wall across it, an arched gate in its own ground and a sign over it in
  // its own lettering, and the tops of the garden's trees in the sun behind.
  function gardenGate(d, i, side, zc, W) {
    var g = at(side * FRONT, 0, zc, side < 0 ? Math.PI / 2 : -Math.PI / 2);
    var shop = new THREE.Color(d.ground), mat = toonColor(shop), key = 'c' + shop.getHexString();
    var gap = 3.2, wing = (W - gap) / 2;
    [-1, 1].forEach(function (k) {
      box(wing, 3.2, 0.5, new THREE.Matrix4().multiplyMatrices(g, at(k * (gap + wing) / 2, 1.6, 0.25)), '--cel-wall-3');
      box(wing + 0.1, 0.2, 0.62, new THREE.Matrix4().multiplyMatrices(g, at(k * (gap + wing) / 2, 3.3, 0.25)), '--cel-kerb');
    });
    // The arch, in the gate's own ground.
    piece((function () { var b = BOX.clone(); b.scale(0.5, 3.6, 0.6); return b; })(), new THREE.Matrix4().multiplyMatrices(g, at(-gap / 2 - 0.25, 1.8, 0.3)), mat, key);
    piece((function () { var b = BOX.clone(); b.scale(0.5, 3.6, 0.6); return b; })(), new THREE.Matrix4().multiplyMatrices(g, at(gap / 2 + 0.25, 1.8, 0.3)), mat, key);
    piece(new THREE.TorusGeometry(gap / 2 + 0.25, 0.25, 8, 20, Math.PI), new THREE.Matrix4().multiplyMatrices(g, at(0, 3.6, 0.3)), mat, key);
    signboard(d, gap + 2.4, 0.8, new THREE.Matrix4().multiplyMatrices(g, at(0, 5.0, 0.62)));
    box(0.08, 1.0, 0.08, new THREE.Matrix4().multiplyMatrices(g, at(-gap / 2 - 0.8, 4.5, 0.6)), '--cel-frame', false);
    box(0.08, 1.0, 0.08, new THREE.Matrix4().multiplyMatrices(g, at(gap / 2 + 0.8, 4.5, 0.6)), '--cel-frame', false);
    // The garden behind it: grass, and trees whose tops show over the wall.
    box(W + 10, 0.1, 30, new THREE.Matrix4().multiplyMatrices(g, at(0, 0.02, -15)), '--cel-leaf', false, false);
    for (var t = 0; t < 11; t++) {
      var p = new THREE.Vector3((hash('gt' + t) - 0.5) * (W + 6), 0, -3 - hash('gz' + t) * 25).applyMatrix4(g);
      tree(p.x, p.z, 1.4 + hash('gs' + t) * 0.6);
    }
    hitbox(i, W, 6, 4, new THREE.Matrix4().multiplyMatrices(g, at(0, 3, 0)));
  }

  // A LOT, past the last building: open ground behind a low fence, a gate in
  // the lot's own colours with its name over it, and the lot's own ground.
  function lotGate(d, i, side, zc, L) {
    var g = at(side * FRONT, 0, zc, side < 0 ? Math.PI / 2 : -Math.PI / 2);
    var shop = new THREE.Color(d.ground), mat = toonColor(shop), key = 'c' + shop.getHexString();
    var gap = 2.8, wing = (L - gap) / 2;
    [-1, 1].forEach(function (k) {
      var cx = k * (gap + wing) / 2;
      box(wing, 0.08, 0.08, new THREE.Matrix4().multiplyMatrices(g, at(cx, 1.0, 0.1)), '--cel-frame', 0.02);
      box(wing, 0.08, 0.08, new THREE.Matrix4().multiplyMatrices(g, at(cx, 0.5, 0.1)), '--cel-frame', 0.02);
      for (var x = -wing / 2; x <= wing / 2 + 0.01; x += 1.2) box(0.1, 1.2, 0.1, new THREE.Matrix4().multiplyMatrices(g, at(cx + x, 0.6, 0.1)), '--cel-frame', 0.02);
    });
    [-1, 1].forEach(function (k) {
      piece((function () { var b = BOX.clone(); b.scale(0.3, 2.8, 0.3); return b; })(), new THREE.Matrix4().multiplyMatrices(g, at(k * (gap / 2 + 0.15), 1.4, 0.1)), mat, key);
    });
    signboard(d, gap + 1.6, 0.75, new THREE.Matrix4().multiplyMatrices(g, at(0, 3.1, 0.3)));
    piece((function () { var b = BOX.clone(); b.scale(L - 0.4, 0.06, 13); return b; })(), new THREE.Matrix4().multiplyMatrices(g, at(0, 0.03, -6.8)), mat, key, false, false);
    tree(new THREE.Vector3(-L / 3, 0, -10).applyMatrix4(g).x, new THREE.Vector3(-L / 3, 0, -10).applyMatrix4(g).z, 1.2);
    hitbox(i, L, 3.5, 3, new THREE.Matrix4().multiplyMatrices(g, at(0, 1.6, 0)));
  }

  // THE TREELINE, at the stoop's end, where the street runs out into a
  // field: trees across the road with a gap for the track, and the trail sign
  // in the signpost's own colours and lettering, as the front page wears it.
  var TREES = 13;
  function treeline(d, i) {
    for (var x = -FRONT - 14; x <= FRONT + 14; x += 2.2) {
      if (Math.abs(x) < 2.2) continue;
      tree(x + (hash('tlx' + x) - 0.5) * 0.8, TREES + hash('tlz' + x) * 2.5, 1.1 + hash('tls' + x) * 0.5);
      tree(x + 1.1, TREES + 3.5 + hash('tlb' + x) * 3, 1.3 + hash('tlt' + x) * 0.6);
    }
    var g = at(0, 0, TREES - 1.2, Math.PI);
    var shop = new THREE.Color(d.ground), mat = toonColor(shop), key = 'c' + shop.getHexString();
    [-1, 1].forEach(function (k) {
      piece((function () { var b = BOX.clone(); b.scale(0.22, 2.6, 0.22); return b; })(), new THREE.Matrix4().multiplyMatrices(g, at(k * 1.6, 1.3, 0)), toon('--cel-trunk'), '--cel-trunk');
    });
    piece((function () { var b = BOX.clone(); b.scale(3.6, 0.9, 0.12); return b; })(), new THREE.Matrix4().multiplyMatrices(g, at(0, 2.2, 0)), mat, key);
    signboard(d, 3.3, 0.7, new THREE.Matrix4().multiplyMatrices(g, at(0, 2.2, 0.07)));
    // The track going off between the trees.
    box(2.6, 0.04, 9, at(0, 0.02, TREES + 3), '--cel-walk', false, false);
    hitbox(i, 4, 3, 1, new THREE.Matrix4().multiplyMatrices(g, at(0, 1.5, 0)));
  }

  /* ── The street round the shops ──────────────────────────────────────── */
  function street(zEnd, crossings) {
    var len = zEnd + 60, mid = -len / 2 + 20;
    box(ROAD * 2, 0.1, len, at(0, -0.05, mid), '--cel-road', false, false);
    box(FRONT - ROAD, 0.3, len, at(-(ROAD + FRONT) / 2, 0.1, mid), '--cel-walk', false, false);
    box(FRONT - ROAD, 0.3, len, at((ROAD + FRONT) / 2, 0.1, mid), '--cel-walk', false, false);
    box(0.2, 0.32, len, at(-ROAD - 0.1, 0.11, mid), '--cel-kerb', false, false);
    box(0.2, 0.32, len, at(ROAD + 0.1, 0.11, mid), '--cel-kerb', false, false);
    // The ground beyond the buildings, out to the haze.
    box(400, 0.1, len + 400, at(0, -0.12, mid), '--cel-walk', false, false);
    // Paint: an edge line each side, a dashed line down the middle, and a
    // crossing with its stop lines.
    box(0.15, 0.02, len, at(-ROAD + 0.4, 0.01, mid), '--cel-paint', false, false);
    box(0.15, 0.02, len, at(ROAD - 0.4, 0.01, mid), '--cel-paint', false, false);
    for (var z = 10; z > -zEnd - 30; z -= 6) {
      if (crossings.some(function (c) { return Math.abs(z - c) < 5; })) continue;
      box(0.15, 0.02, 3, at(0, 0.01, z), '--cel-paint', false, false);
    }
    crossings.forEach(function (cross) {
      for (var x = -ROAD + 0.6; x < ROAD - 0.3; x += 0.9) box(0.45, 0.02, 3.2, at(x + 0.2, 0.012, cross), '--cel-paint', false, false);
      box(ROAD - 0.2, 0.02, 0.35, at(-ROAD / 2, 0.012, cross + 3.2), '--cel-paint', false, false);
      box(ROAD - 0.2, 0.02, 0.35, at(ROAD / 2, 0.012, cross - 3.2), '--cel-paint', false, false);
    });
    // Seams in the pavement.
    for (z = 10; z > -zEnd - 30; z -= 1.5) {
      box(FRONT - ROAD - 0.3, 0.005, 0.04, at(-(ROAD + FRONT) / 2, 0.255, z), '--cel-kerb', false, false);
      box(FRONT - ROAD - 0.3, 0.005, 0.04, at((ROAD + FRONT) / 2, 0.255, z), '--cel-kerb', false, false);
    }
  }

  // Poles every so often down both sides, and the wires sagging between them,
  // across the road and down to the buildings. Many of them, and tangled.
  function wire(a, b, sag, r) {
    var pts = [];
    for (var i = 0; i <= 14; i++) {
      var t = i / 14;
      pts.push(new THREE.Vector3(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t - sag * 4 * t * (1 - t), a.z + (b.z - a.z) * t));
    }
    piece(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 18, r || 0.022, 4, false), new THREE.Matrix4(), toon('--cel-wire'), '--cel-wire', false);
  }
  function poles(zEnd) {
    var tops = { '-1': [], '1': [] };
    for (var z = 4, n = 0; z > -zEnd - 10; z -= 15, n++) {
      [-1, 1].forEach(function (s) {
        var x = s * (ROAD + 0.7), zz = z + (s > 0 ? -5 : 0);
        cyl(0.13, 0.19, 10, at(x, 5, zz), '--cel-pole', 0.03, 8);
        box(2.0, 0.14, 0.14, at(x, 9.3, zz), '--cel-pole', 0.03);
        box(1.4, 0.12, 0.12, at(x, 8.4, zz), '--cel-pole', 0.03);
        [-0.85, -0.3, 0.3, 0.85].forEach(function (o) { cyl(0.05, 0.06, 0.2, at(x + o, 9.47, zz), '--cel-frame', 0.015, 6); });
        if ((n + (s > 0 ? 1 : 0)) % 3 === 0) {
          cyl(0.32, 0.32, 0.9, at(x - s * 0.55, 7.4, zz), '--cel-frame', 0.03, 12);
          box(0.06, 0.6, 0.06, at(x - s * 0.55, 8.0, zz), '--cel-pole', false);
        }
        // Rungs up the pole.
        for (var y = 2.6; y < 8; y += 0.6) box(0.36, 0.04, 0.04, at(x, y, zz, (y * 7) % 2 ? Math.PI / 2 : 0), '--cel-frame', false);
        tops[s].push({ x: x, z: zz });
      });
    }
    [-1, 1].forEach(function (s) {
      var p = tops[s];
      for (var i = 0; i + 1 < p.length; i++) {
        var a = p[i], b = p[i + 1];
        [-0.85, -0.3, 0.3, 0.85].forEach(function (o, k) {
          wire(new THREE.Vector3(a.x + o, 9.55, a.z), new THREE.Vector3(b.x + o, 9.55, b.z), 0.5 + k * 0.08);
        });
        wire(new THREE.Vector3(a.x - 0.5, 8.4, a.z), new THREE.Vector3(b.x - 0.5, 8.4, b.z), 0.7, 0.045);
        wire(new THREE.Vector3(a.x + 0.5, 8.35, a.z), new THREE.Vector3(b.x + 0.5, 8.35, b.z), 0.85, 0.035);
        wire(new THREE.Vector3(a.x, 6.9, a.z), new THREE.Vector3(b.x, 6.9, b.z), 0.6, 0.05);
        // Down to the buildings behind the pole, at odd heights.
        wire(new THREE.Vector3(a.x, 8.3, a.z), new THREE.Vector3(s * FRONT, 6 + (i % 3), a.z - 3), 0.35);
        if (i % 2) wire(new THREE.Vector3(a.x, 6.9, a.z), new THREE.Vector3(s * FRONT, 4.7, a.z + 2.5), 0.25, 0.03);
      }
    });
    // Across the road, every other pole.
    for (var i = 0; i < tops['-1'].length && i < tops['1'].length; i += 2) {
      var a = tops['-1'][i], b = tops['1'][i];
      wire(new THREE.Vector3(a.x + 0.85, 9.55, a.z), new THREE.Vector3(b.x - 0.85, 9.55, b.z), 0.9);
      wire(new THREE.Vector3(a.x + 0.5, 8.4, a.z), new THREE.Vector3(b.x - 0.5, 8.4, b.z), 1.1, 0.035);
    }
  }

  function tree(x, z, r) {
    cyl(0.16, 0.24, 3.2, at(x, 1.85, z), '--cel-trunk', 0.03, 8);
    var leaf = new THREE.IcosahedronGeometry(1, 1);
    [[0, 3.9, 0, 1.5], [0.8, 3.4, 0.4, 1.1], [-0.7, 3.5, -0.3, 1.15], [0.1, 4.7, -0.2, 1.05]].forEach(function (b, k) {
      var g = leaf.clone(); g.scale(b[3] * r, b[3] * r * 0.9, b[3] * r);
      piece(g, at(x + b[0], b[1], z + b[2], k), toon('--cel-leaf'), '--cel-leaf', 0.06);
    });
  }

  function signpost(x, z, faceTex, red) {
    cyl(0.04, 0.04, 2.8, at(x, 1.5, z), '--cel-frame', 0.02, 6);
    put(new THREE.Mesh(new THREE.CircleGeometry(0.42, 28), new THREE.MeshToonMaterial({ map: faceTex, gradientMap: gradient })), at(x, 2.65, z + 0.03));
    cyl(0.45, 0.45, 0.04, at(x, 2.65, z - 0.01, 0, Math.PI / 2), red ? '--cel-sign-red' : '--cel-sign-blue', 0.02, 28);
  }
  var arrowTex = tex(256, 256, function (g, w, h) {
    g.fillStyle = css('--cel-sign-blue'); g.fillRect(0, 0, w, h);
    g.fillStyle = css('--cel-cloud');
    g.beginPath(); g.moveTo(128, 40); g.lineTo(196, 120); g.lineTo(150, 120); g.lineTo(150, 214); g.lineTo(106, 214); g.lineTo(106, 120); g.lineTo(60, 120); g.fill();
  });
  var slowTex = tex(256, 256, function (g, w, h) {
    g.fillStyle = css('--cel-cloud'); g.fillRect(0, 0, w, h);
    g.strokeStyle = css('--cel-sign-red'); g.lineWidth = 34;
    g.beginPath(); g.arc(128, 128, 108, 0, Math.PI * 2); g.stroke();
    g.fillStyle = css('--cel-sign-blue'); g.font = '700 110px ' + getComputedStyle(stage).fontFamily;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('20', 128, 134);
  });

  function vending(x, z, side) {
    var m = at(x, 0.25, z, side < 0 ? Math.PI / 2 : -Math.PI / 2);
    box(1.0, 1.85, 0.8, new THREE.Matrix4().multiplyMatrices(m, at(0, 0.925, 0)), side < 0 ? '--cel-sign-red' : '--cel-sign-blue');
    var front = tex(128, 220, function (g, w, h) {
      g.fillStyle = css('--cel-cloud'); g.fillRect(0, 0, w, h);
      var cans = ['--cel-sign-red', '--cel-sign-blue', '--cel-sign-yellow', '--cel-leaf', '--cel-wall-2'];
      for (var r = 0; r < 4; r++) for (var c = 0; c < 5; c++) {
        g.fillStyle = css(cans[(r + c * 2) % cans.length]); g.fillRect(10 + c * 22, 14 + r * 36, 16, 26);
      }
      g.fillStyle = css('--cel-ink'); g.fillRect(10, 170, w - 20, 34);
    });
    put(new THREE.Mesh(new THREE.PlaneGeometry(0.84, 1.45), new THREE.MeshBasicMaterial({ map: front, fog: true })), new THREE.Matrix4().multiplyMatrices(m, at(0, 1.05, 0.41)));
  }

  function bicycle(x, z) {
    var m = at(x, 0.25, z, Math.PI, 0, 0.18);
    var wheel = new THREE.TorusGeometry(0.33, 0.035, 6, 20);
    [-0.52, 0.52].forEach(function (o) {
      piece(wheel.clone(), new THREE.Matrix4().multiplyMatrices(m, at(0, 0.36, o, Math.PI / 2)), toon('--cel-ink'), '--cel-ink', false);
    });
    [[0, 0.62, 0, 0.04, 1.0, 0.6], [0, 0.55, -0.3, 0.04, 0.7, -0.5], [0, 0.6, 0.3, 0.04, 0.65, 0.4]].forEach(function (t) {
      var g = new THREE.CylinderGeometry(t[3], t[3], t[4], 6);
      piece(g, new THREE.Matrix4().multiplyMatrices(m, at(t[0], t[1], t[2], 0, Math.PI / 2 - t[5])), toon('--cel-sign-yellow'), '--cel-sign-yellow', 0.02);
    });
    box(0.25, 0.06, 0.12, new THREE.Matrix4().multiplyMatrices(m, at(0, 0.98, -0.25)), '--cel-ink', false);
    box(0.5, 0.05, 0.05, new THREE.Matrix4().multiplyMatrices(m, at(0, 1.02, 0.42)), '--cel-frame', false);
    box(0.26, 0.2, 0.26, new THREE.Matrix4().multiplyMatrices(m, at(0, 0.98, 0.62)), '--cel-frame', 0.02);
  }

  function car(x, z) {
    var m = at(x, 0, z, Math.PI);
    box(1.75, 0.75, 3.9, new THREE.Matrix4().multiplyMatrices(m, at(0, 0.75, 0)), '--cel-sign-blue');
    box(1.6, 0.6, 2.1, new THREE.Matrix4().multiplyMatrices(m, at(0, 1.42, -0.2)), '--cel-wall-1');
    plane(1.5, 0.5, new THREE.Matrix4().multiplyMatrices(m, at(0, 1.42, 0.86, 0, -0.25)), winMat, 'win');
    plane(1.5, 0.5, new THREE.Matrix4().multiplyMatrices(m, at(0, 1.42, -1.26, Math.PI, -0.25)), winMat, 'win');
    [[-0.8, 1.2], [0.8, 1.2], [-0.8, -1.2], [0.8, -1.2]].forEach(function (w) {
      cyl(0.34, 0.34, 0.24, new THREE.Matrix4().multiplyMatrices(m, at(w[0], 0.34, w[1], 0, 0, Math.PI / 2)), '--cel-ink', false, 14);
    });
  }

  function mirror(x, z, s) {
    cyl(0.05, 0.05, 3.2, at(x, 1.85, z), '--cel-wall-2', 0.02, 6);
    put(new THREE.Mesh(new THREE.CircleGeometry(0.4, 28), new THREE.MeshToonMaterial({ map: windowTex, gradientMap: gradient })), at(x, 3.45, z, s < 0 ? 0.6 : -0.6));
    cyl(0.45, 0.45, 0.06, at(x, 3.45, z, s < 0 ? 0.6 : -0.6, Math.PI / 2), '--cel-wall-2', 0.02, 28);
  }

  // Far blocks past the end of the street, and hills in the haze behind.
  function beyond(zEnd, open) {
    for (var i = 0; i < 9; i++) {
      var r = hash('far' + i), w = 10 + r * 10, h = 12 + hash('h' + i) * 18;
      box(w, h, 10, at(-38 + i * 9.5, h / 2, -zEnd - 34 - r * 18), WALLS[i % WALLS.length]);
    }
    [-1, 1].forEach(function (s) {
      for (var z = 8, k = 0; z > -zEnd - 20; z -= 14, k++) {
        var h = 14 + hash(s + 'side' + k) * 16;
        if (open.some(function (o) { return o.side === s && z < o.z0 + 6 && z > o.z1 - 6; })) continue;
        box(12, h, 12, at(s * (FRONT + 22), h / 2, z), WALLS[(k + (s > 0 ? 2 : 0)) % WALLS.length]);
        solar(at(s * (FRONT + 22), 0, z), 12, 12, h, false);
      }
    });
    var hill = new THREE.SphereGeometry(1, 16, 10);
    [[-120, -zEnd - 170, 90], [30, -zEnd - 210, 120], [160, -zEnd - 150, 80]].forEach(function (h) {
      var g = hill.clone(); g.scale(h[2], h[2] * 0.35, h[2] * 0.6);
      piece(g, at(h[0], -2, h[1]), toon('--cel-hill'), '--cel-hill', false, false);
    });
  }

  // The sky: blue overhead going pale to the haze, and big cumulus standing
  // in it, white where the sun is and the sky's blue underneath.
  function sky() {
    var g = new THREE.SphereGeometry(600, 32, 16);
    var m = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: col('--cel-sky') }, low: { value: col('--cel-haze') } },
      vertexShader: 'varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 top;\nuniform vec3 low;\nvarying vec3 p;\nvoid main() {\n  float t = clamp(p.y * 2.2, 0.0, 1.0);\n  gl_FragColor = vec4(mix(low, top, pow(t, 0.7)), 1.0);\n  #include <colorspace_fragment>\n}'
    });
    var dome = new THREE.Mesh(g, m);
    dome.renderOrder = -1;
    skyGroup.add(dome);
    var puff = new THREE.IcosahedronGeometry(1, 2);
    var cloud = new THREE.MeshToonMaterial({ color: col('--cel-cloud'), gradientMap: gradient, fog: false });
    var shade = col('--cel-cloud-shade');
    cloud.emissive = shade.clone().multiplyScalar(0.25);
    var group = new THREE.Group();
    // A ring of cumulus standing round the whole horizon, far off and low,
    // flat underneath, the way they stand at the end of a street.
    var ring = [];
    for (var n = 0; n < 11; n++) {
      var ang = (n + hash('ra' + n) * 0.6) / 11 * Math.PI * 2, dist = 400 + hash('rd' + n) * 90;
      ring.push([Math.sin(ang) * dist, 48 + hash('ry' + n) * 46, -Math.cos(ang) * dist, 42 + hash('rs' + n) * 26]);
    }
    ring.forEach(function (c, ci) {
      for (var k = 0; k < 9; k++) {
        var r = hash('cl' + ci + k), r2 = hash('cm' + ci + k);
        var s = c[3] * (0.35 + r * 0.5);
        var mesh = new THREE.Mesh(puff, cloud);
        mesh.position.set(c[0] + (r2 - 0.5) * c[3] * 2.6, c[1] + s * 0.35 + (k % 3) * c[3] * 0.2, c[2] + (r - 0.5) * c[3]);
        mesh.scale.set(s, s * 0.8, s);
        group.add(mesh);
      }
    });
    skyGroup.add(group);
    group.updateMatrixWorld(true);
    group.traverse(function (o) { o.matrixAutoUpdate = false; });
  }
  // The sky and its clouds are so far off that walking never brings you
  // under them: they keep their place over you wherever you stand.
  var skyGroup = new THREE.Group();
  scene.add(skyGroup);

  /* ── Where you stand ───────────────────────────────────────────────────── */
  var me = { x: 0, z: 6, yaw: 0, pitch: 0.05 }, ROOF = 26, up = false;
  var bounds = { x: [-FRONT + 0.6, FRONT - 0.6], z: [-60, 10] };
  var stops = [];
  var held = {}, gliding = true, glide = null, last = 0, frame = 0;

  function place() {
    camera.position.set(me.x, up ? ROOF : EYE, me.z);
    skyGroup.position.set(me.x, 0, me.z - 6);
    camera.rotation.set(me.pitch, me.yaw, 0, 'YXZ');
    sun.position.set(me.x + SUN.x, SUN.y, me.z + SUN.z);
    sun.target.position.set(me.x, 0, me.z - 12);
    sun.target.updateMatrixWorld();
    for (var i = 0; i < far.length; i++) far[i].o.visible = Math.abs(far[i].z - me.z) < VIEW + CHUNK / 2;
  }
  // A page or a thing lifted off one is laid over the picture, so no wall
  // can hide it: one that belongs to a part of a room (inside a cabin, behind
  // a curtain) names that part as a zone, [x0, x1, z0, z1], and shows only
  // while you are standing in it.
  function zones() {
    var z = scene.userData.zoned;
    if (!z) return;
    for (var i = 0; i < z.length; i++) {
      var b = z[i].zone, inZone = me.x >= b[0] && me.x <= b[1] && me.z >= b[2] && me.z <= b[3];
      z[i].el.style.visibility = inZone ? '' : 'hidden';
    }
  }
  function zoned(el, zone) { if (zone) (scene.userData.zoned = scene.userData.zoned || []).push({ el: el, zone: zone }); }
  function draw() { place(); zones(); renderer.render(scene, camera); css3d.render(scene, camera); }
  function soon() { if (!frame) frame = requestAnimationFrame(tick); }

  function nearest() {
    if (up) return null;
    var best = null, bd = 1e9;
    stops.forEach(function (s) {
      var d = Math.hypot(s.x - me.x, s.z - me.z) + Math.abs(angle(s.yaw - me.yaw)) * 2;
      if (d < bd) { bd = d; best = s; }
    });
    return bd < 3.2 ? best : null;
  }
  function angle(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }

  var said = '';
  function tell() {
    if (!hereEl) return;
    var s = nearest();
    var words = inside
      ? (s ? inside.name + ': ' + (s.where || s.name) + '.' : 'In ' + inside.name + '.')
      : up ? 'Up over the roofs, looking down on the solar panels.' : s ? 'In front of ' + s.name + '.' : 'Out on Cel Street, in the sun.';
    if (words === said) return;
    said = words;
    hereEl.textContent = words + ' ';
    if (s && ROOMS[s.page] && !(inside && s.page === inside.page)) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'cel-walkin';
      b.textContent = 'Walk into ' + (s.room || s.name);
      b.addEventListener('click', function () { enter(s.page); });
      hereEl.appendChild(b);
      hereEl.appendChild(document.createTextNode(' '));
    }
    if (s && s.page) {
      var a = document.createElement('a');
      a.href = s.page;
      a.textContent = inside && s.page === inside.page ? 'Open the room\u2019s page \u2192' : ROOMS[s.page] ? 'or open its page \u2192' : 'Go into ' + s.name + ' \u2192';
      hereEl.appendChild(a);
    }
  }

  /* ── Walking into a room, and out again ───────────────────────────────── */
  // A room can open off another (the campgrounds' pitches), so what you came
  // in from is a stack: Back out takes you one room back, and the street is
  // at the bottom of it.
  var inside = null, behind = [];
  function kit(page, name) {
    return {
      THREE: THREE, scene: scene, page: page, name: name,
      gentle: document.documentElement.getAttribute('data-intensity') === 'gentle',
      col: col, at: at, box: box, cyl: cyl,
      // Every box and column a room drew in one of its colours, recoloured at
      // once (a room whose own switch changes its light); a colour by name.
      tint: function (name, to) { toon(name).color.copy(col(to)); },
      piece: function (geo, m, ink, ink2, shadow) { piece(geo, m, toon(ink), ink, ink2, shadow); },
      facets: function (geo, m, ink) {
        var mat = new THREE.MeshToonMaterial({ color: col(ink), gradientMap: gradient, flatShading: true });
        var mesh = put(new THREE.Mesh(geo, mat), m);
        mesh.castShadow = true;
        return mesh;
      },
      flat: function (geo, m, ink) { return put(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col(ink) })), m); },
      // A colour by name as the canvas wants it, a sheet of paper drawn on a
      // canvas in those inks, and that sheet hung somewhere, lit like
      // everything else.
      ink: css,
      paper: function (pw, ph, draw) { return tex(pw, ph, draw); },
      // Sheets of one paper are merged into one mesh, however many there are.
      sheet: function (map, w, h, m) {
        if (!map.userData.mat) map.userData.mat = new THREE.MeshToonMaterial({ map: map, gradientMap: gradient });
        var g = PLANE.clone(); g.scale(w, h, 1);
        piece(g, m, map.userData.mat, 'sheet' + map.uuid, false, false);
      },
      // The room's own page, an iframe of it, pw by ph pixels and ww wide in
      // the world, its links taking the whole window as on Paper Street.
      screen: function (pw, ph, ww, m, title, zone) {
        var f = document.createElement('iframe');
        f.src = page; f.title = title; f.className = 'cel-screen';
        f.style.width = pw + 'px'; f.style.height = ph + 'px';
        f.addEventListener('load', function () {
          try {
            f.contentDocument.querySelectorAll('a[href]').forEach(function (a) { if (!/^#/.test(a.getAttribute('href'))) a.target = '_top'; });
          } catch (e) {}
        });
        var o = new CSS3DObject(f), p = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
        m.decompose(p, q, sc);
        o.position.copy(p); o.quaternion.copy(q); o.scale.setScalar(ww / pw);
        scene.add(o);
        zoned(f, zone);
        return f;
      },
      // A THING OFF THE ROOM'S OWN PAGE, copied out of the page on its screen
      // once that has loaded, so nothing more is fetched: the television itself
      // rather than a drawing of it. It wears the page's own body class, so the
      // room's own rules dress it, and it is pressed as it is on the page;
      // love-embed.js, on this page too, turns a pressed facade into a player
      // here as it does there. o.w is its width in pixels, o.ww in the world,
      // and o.m where its foot stands, facing out. Paper Street's kit.lift(),
      // in WebGL; tools/make-cel-street.py refuses a lift its page cannot meet.
      lift: function (frame, sel, o) {
        var home = scene, wrap = document.createElement('div');
        wrap.className = 'cel-lifted' + (o.cls ? ' ' + o.cls : '');
        wrap.style.width = o.w + 'px';
        // A long thing (a rail of reels, a shelf of records) is given a height
        // in pixels (o.h) and scrolls inside it, so all of it is there, the
        // keyboard reaching every part, rather than cut short to fit the wall.
        if (o.h) { wrap.style.maxHeight = o.h + 'px'; wrap.style.overflowY = 'auto'; }
        var obj = new CSS3DObject(wrap), p = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
        o.m.decompose(p, q, sc);
        obj.position.copy(p); obj.quaternion.copy(q); obj.scale.setScalar(o.ww / o.w);
        home.add(obj);
        zoned(wrap, o.zone);
        var it = { el: wrap, h: 0, wait: [] };
        // A link to a part of its own page (#…) inside a copy would change this
        // page's address, which reads as walking out of the room: it scrolls the
        // copy to that part instead, or does nothing if the part did not come.
        wrap.addEventListener('click', function (e) {
          var a = e.target.closest && e.target.closest('a[href^="#"]');
          if (!a) return;
          e.preventDefault();
          var id = decodeURIComponent(a.getAttribute('href').slice(1)), to = id ? wrap.querySelector('[id="' + id.replace(/"/g, '') + '"]') : null;
          // By layout offsets, never the screen box, which CSS3D has projected.
          var y = 0, n = to;
          while (n && n !== wrap) { y += n.offsetTop; n = n.offsetParent; }
          if (to && n === wrap) wrap.scrollTop = y;
        });
        var put = function () {
          var d = null;
          try { d = frame.contentDocument; } catch (x) { return; }
          var node = d ? d.querySelectorAll(sel)[o.n || 0] : null;
          if (!node || wrap.firstChild) return;
          var dress = document.createElement('div');
          dress.className = d.body.className;
          dress.style.minHeight = '0'; dress.style.background = 'transparent'; dress.style.padding = '0';
          // A room that sets its words' colour and face on its own body (body.room-x)
          // never reaches a copy in a div wearing that class, so they come along.
          var bodyStyle = d.defaultView.getComputedStyle(d.body);
          dress.style.color = bodyStyle.color; dress.style.fontFamily = bodyStyle.fontFamily;
          var copy = document.importNode(node, true);
          // Parts only another of the room's scripts can work, which is not
          // here, are left out rather than left dead (o.drop).
          if (o.drop) Array.prototype.forEach.call(copy.querySelectorAll(o.drop), function (n) { n.remove(); });
          // A heading's copy-a-link mark points at the page it came off, and here
          // would take the whole window there, so it never comes along.
          Array.prototype.forEach.call(copy.querySelectorAll('.hlink'), function (n) { n.remove(); });
          dress.appendChild(copy);
          wrap.appendChild(dress);
          // A thing with no ground of its own stood on its page's ground, and its
          // words were chosen for that ground, not for whatever is behind it in
          // the scene: so it brings its page's ground with it, as a sheet the
          // size of itself. A thing drawn to stand bare (o.bare) does not.
          var own = getComputedStyle(copy);
          if (!o.bare && /^rgba\(.*, 0\)$|^transparent$/.test(own.backgroundColor) && own.backgroundImage === 'none') {
            var view = d.defaultView, under = view.getComputedStyle(d.body).backgroundColor;
            if (/^rgba\(.*, 0\)$|^transparent$/.test(under)) under = view.getComputedStyle(d.documentElement).backgroundColor;
            if (!/^rgba\(.*, 0\)$|^transparent$/.test(under)) { dress.style.background = under; dress.style.padding = '14px'; }
          }
          if (home === scene) draw();
          // Its height is known only now: stand its foot where it was asked, and
          // again whenever it changes (a rack opened, a cup put on the table, a
          // line of words arriving), so it grows upward from where it stands.
          var stand = function () {
            if (wrap.offsetHeight === it.h) return;
            it.h = wrap.offsetHeight;
            obj.position.copy(p).add(new THREE.Vector3(0, it.h * o.ww / o.w / 2, 0).applyQuaternion(q));
            if (home === scene) draw();
          };
          it.h = -1; stand();
          if (window.ResizeObserver) new ResizeObserver(stand).observe(wrap);
          it.wait.splice(0).forEach(function (fn) { fn(); });
        };
        frame.addEventListener('load', put);
        put();
        return it;
      },
      // A part of a lifted thing the scene answers to, once it has arrived: a
      // switch the room's own script flips on its page's drawing (a class, a
      // colour set on it), read again whenever it changes and drawn once. The
      // scene changes only when that part does, which is only on a press.
      // fn(read, node): read('--x') is the colour that part wears under that
      // name now, read() its classes; node is the part, for its attributes.
      follow: function (it, sel, fn) {
        var go = function () {
          var node = it.el.querySelector(sel);
          if (!node) return;
          var read = function (name) {
            return name ? new THREE.Color(getComputedStyle(node).getPropertyValue(name).trim() || css(name)) : node.getAttribute('class') || '';
          };
          var again = function () { fn(read, node); draw(); };
          new MutationObserver(again).observe(node, { attributes: true });
          again();
        };
        if (it.el.firstChild) go(); else it.wait.push(go);
      },
      // The room's own script, run against what was lifted once it has all
      // arrived, loaded afresh each time the room is built because it finds its
      // parts once, when it runs. Only a script the room's own page loads.
      wire: function (frame, src) {
        frame.addEventListener('load', function () {
          Promise.resolve().then(function () {
            var sc2 = document.createElement('script');
            // In the order they are wired, as the page runs them: one script
            // often needs what an earlier one sets up (the booth needs avatar.js).
            sc2.async = false;
            sc2.src = src + '?cel=' + (++wired);
            document.head.appendChild(sc2);
          });
        });
      }
    };
  }
  var wired = 0;
  function roomFile(page, then) {
    // A room that letters a sign names its faces, and they are loaded before
    // the room is built, so the canvas is not lettered in a fallback.
    function ready(room) {
      Promise.all((room.faces || []).map(function (f) {
        return document.fonts ? document.fonts.load('64px ' + f).catch(function () {}) : null;
      })).then(function () { then(room); });
    }
    if (window.loveCelRooms && window.loveCelRooms[page]) return ready(window.loveCelRooms[page]);
    var sc = document.createElement('script');
    sc.src = ROOMS[page];
    sc.addEventListener('load', function () { if (window.loveCelRooms && window.loveCelRooms[page]) ready(window.loveCelRooms[page]); });
    sc.addEventListener('error', function () { window.location.href = page; });
    document.head.appendChild(sc);
  }
  function enter(page, push, then) {
    if (!ROOMS[page] || (inside && inside.page === page)) return;
    var from = inside;
    roomFile(page, function (room) {
      if (inside !== from) return;
      // Arriving straight at a room that opens off another (by its address),
      // you come in through the other one, so Back out goes where it should.
      if (!inside && push === false && room.from && ROOMS[room.from]) {
        enter(room.from, false, function () { enter(page, false, then); });
        return;
      }
      var door = stops.filter(function (t) { return t.page === page; })[0];
      if (door) { me.x = door.x; me.z = door.z; me.yaw = door.yaw; }
      behind.push({ inside: inside, scene: scene, far: far, stops: stops, bounds: bounds, hits: hits, me: { x: me.x, z: me.z, yaw: me.yaw, pitch: me.pitch } });
      // The room you came from keeps its page loaded, out of sight.
      scene.traverse(function (o) { if (o.isCSS3DObject) o.element.style.display = 'none'; });
      scene = new THREE.Scene(); far = []; hits = []; buckets = {};
      var name = room.name || (door ? door.room || door.name : page);
      var made = room.build(kit(page, name));
      bake();
      inside = { page: page, name: name };
      stops = made.stops; bounds = made.bounds;
      me = { x: made.start.x, z: made.start.z, yaw: made.start.yaw || 0, pitch: 0.05 };
      up = false; glide = null; held = {};
      if (push !== false) history.pushState({ celIn: page }, '', '#in=' + page.replace(/\.html$/, ''));
      wayOut(); places();
      said = '';
      draw(); tell();
      if (list) list.querySelectorAll('a').forEach(function (a) { a.tabIndex = -1; });
      if (then) then();
    });
  }
  // Inside a room its places are a list too, as the doors are on the street:
  // each one stands you there, for a keyboard and a screen reader, and for
  // anybody who would rather not walk.
  function places() {
    if (!placesEl) return;
    var ol = placesEl.querySelector('ol');
    while (ol.firstChild) ol.removeChild(ol.firstChild);
    placesEl.hidden = !inside;
    if (!inside) return;
    stops.forEach(function (s) {
      var li = document.createElement('li'), b = document.createElement('button');
      var words = s.where || s.name;
      b.type = 'button';
      b.textContent = words.charAt(0).toUpperCase() + words.slice(1);
      b.addEventListener('click', function () { standAt(s); });
      li.appendChild(b); ol.appendChild(li);
    });
  }
  // The way out names where it goes: the street, or the room behind this one.
  function wayOut() {
    var back = behind.length ? behind[behind.length - 1].inside : null;
    if (outBtn) {
      outBtn.hidden = !inside;
      outBtn.textContent = back ? 'Back out into ' + back.name : 'Back out onto the street';
    }
    if (climbBtn) climbBtn.hidden = !!inside;
  }
  function leave() {
    if (!inside) return;
    scene.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.isCSS3DObject && o.element.parentNode) o.element.parentNode.removeChild(o.element);
    });
    var was = behind.pop();
    scene = was.scene; far = was.far; stops = was.stops; bounds = was.bounds; hits = was.hits; me = was.me;
    inside = was.inside; glide = null; held = {};
    // The room you came back into shows its own page again.
    scene.traverse(function (o) { if (o.isCSS3DObject) o.element.style.display = ''; });
    wayOut(); places();
    if (!inside && list) list.querySelectorAll('a').forEach(function (a) { a.removeAttribute('tabindex'); });
    said = '';
    draw(); tell();
  }
  function outOfRoom() {
    if (history.state && history.state.celIn) history.back();
    else { leave(); history.replaceState(inside ? { celIn: inside.page } : null, '', location.pathname + location.search + (inside ? '#in=' + inside.page.replace(/\.html$/, '') : '')); }
  }
  function roomInAddress() {
    var m = /#in=([a-z0-9-]+)/.exec(location.hash);
    return m ? m[1] + '.html' : null;
  }
  window.addEventListener('popstate', function () {
    var want = roomInAddress();
    if (inside && want === inside.page) return;
    // Back to a room you came through, or all the way out; otherwise in.
    if (!want || behind.some(function (b) { return b.inside && b.inside.page === want; })) {
      while (inside && (!want || inside.page !== want)) leave();
    } else enter(want, false);
  });
  if (outBtn) outBtn.addEventListener('click', outOfRoom);

  // A room that is more than one rectangle (a narrow passage opening into a
  // wide hollow) gives its bounds as areas, and you keep to whichever you are
  // in, or are brought back into the nearest.
  function clamp() {
    var areas = bounds.areas || [bounds], best = null, bd = Infinity;
    areas.forEach(function (a) {
      var x = Math.max(a.x[0], Math.min(a.x[1], me.x)), z = Math.max(a.z[0], Math.min(a.z[1], me.z));
      var d = Math.hypot(x - me.x, z - me.z);
      if (d < bd) { bd = d; best = { x: x, z: z }; }
    });
    me.x = best.x; me.z = best.z;
    me.pitch = Math.max(up ? -1.2 : -0.55, Math.min(0.75, me.pitch));
  }
  function move(fwd, side, turn, look, k) {
    me.yaw += turn * k.t; me.pitch += look * k.t;
    var sy = Math.sin(me.yaw), cy = Math.cos(me.yaw);
    me.x += (-sy * fwd + cy * side) * k.m;
    me.z += (-cy * fwd - sy * side) * k.m;
    clamp();
  }
  var KEYS = {
    ArrowUp: 'fwd', w: 'fwd', W: 'fwd', ArrowDown: 'back', s: 'back', S: 'back',
    ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right',
    c: 'climb', C: 'climb', q: 'turnl', Q: 'turnl', e: 'turnr', E: 'turnr', r: 'lookup', R: 'lookup', f: 'lookdown', F: 'lookdown', x: 'ahead', X: 'ahead'
  };
  function act(what, k) {
    if (what === 'climb') {
      if (inside) return;
      up = !up; me.pitch = up ? -0.5 : 0.05;
      if (climbBtn) climbBtn.textContent = up ? 'Climb back down' : 'Climb up over the roofs';
      return;
    }
    if (what === 'ahead') { me.pitch = 0.05; me.yaw = Math.round(me.yaw / (2 * Math.PI)) * 2 * Math.PI; return; }
    move(what === 'fwd' ? 1 : what === 'back' ? -1 : 0,
      what === 'right' ? 1 : what === 'left' ? -1 : 0,
      what === 'turnl' ? 1 : what === 'turnr' ? -1 : 0,
      what === 'lookup' ? 1 : what === 'lookdown' ? -1 : 0, k);
  }
  function stepOnce(what) {
    glide = null;
    act(what, { m: STEP, t: STEP_TURN });
    draw(); tell();
  }

  function tick(now) {
    frame = 0;
    var dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
    last = now;
    var any = false;
    Object.keys(held).forEach(function (w) { if (held[w]) { any = true; act(w, { m: WALK * dt, t: TURN * dt }); } });
    if (glide) {
      glide.t = Math.min(1, glide.t + dt / glide.len);
      var e = glide.t < 0.5 ? 2 * glide.t * glide.t : 1 - Math.pow(-2 * glide.t + 2, 2) / 2;
      me.x = glide.from.x + (glide.to.x - glide.from.x) * e;
      me.z = glide.from.z + (glide.to.z - glide.from.z) * e;
      me.yaw = glide.from.yaw + angle(glide.to.yaw - glide.from.yaw) * e;
      me.pitch = glide.from.pitch + (glide.to.pitch - glide.from.pitch) * e;
      if (glide.t >= 1) glide = null; else any = true;
    }
    draw(); tell();
    if (any) soon(); else last = 0;
  }

  function standAt(s) {
    if (up) { up = false; if (climbBtn) climbBtn.textContent = 'Climb up over the roofs'; }
    var to = { x: s.x, z: s.z, yaw: s.yaw, pitch: s.pitch != null ? s.pitch : 0.13 };
    if (!gliding) { me.x = to.x; me.z = to.z; me.yaw = to.yaw; me.pitch = to.pitch; draw(); tell(); return; }
    glide = { from: { x: me.x, z: me.z, yaw: me.yaw, pitch: me.pitch }, to: to, t: 0,
      len: Math.min(2.2, 0.6 + Math.hypot(to.x - me.x, to.z - me.z) / 14) };
    soon();
  }

  function setMode(g) {
    gliding = g;
    if (modeBtn) {
      modeBtn.textContent = g ? 'Gliding: switch to steps' : 'Steps: switch to gliding';
      modeBtn.setAttribute('aria-pressed', g ? 'false' : 'true');
    }
  }

  /* ── Building it all, once the street has been read ────────────────────── */
  function build(things) {
    var doors = things.filter(function (t) { return t.kind === 'door'; });
    var gate = things.filter(function (t) { return t.kind === 'gate'; })[0];
    var lots = things.filter(function (t) { return t.kind === 'lot'; });
    var field = things.filter(function (t) { return t.kind === 'post'; })[0];
    var along = { '-1': -2, '1': -2 }, placed = [], open = [];
    function stand(d, side, W, make) {
      var zc = along[side] - W / 2;
      along[side] -= W + 1.2;
      make(d, placed.length, side, zc, W);
      if (make !== building) open.push({ side: side, z0: zc + W / 2, z1: zc - W / 2 });
      placed.push({ name: d.name, page: d.page, side: side, z: zc });
    }
    // The shops two by two down the street, the garden gate halfway down on
    // the left as on the Map, and then the lots past the last building.
    doors.forEach(function (d, i) {
      if (gate && i === Math.floor(doors.length / 2)) stand(gate, -1, 14, gardenGate);
      stand(d, i % 2 ? 1 : -1, 8 + Math.floor(hash(d.name + 'w') * 3) * 1.5, building);
    });
    along['1'] = along['-1'] = Math.min(along['1'], along['-1']);
    lots.forEach(function (d) { stand(d, 1, 16, lotGate); });
    var zEnd = -Math.min(along['1'], along['-1']);
    // Across from the lots, a bank of trees, and the ends of the street get a
    // building each so you are not walking off the edge of the world.
    for (var z = -zEnd + 8; z < -zEnd + lots.length * 17.2; z += 6) tree(-(FRONT + 3 + hash('bk' + z) * 6), z, 1.2 + hash('bs' + z) * 0.5);
    [-1, 1].forEach(function (s) {
      box(10, 18, 9, at(s * (FRONT + 4.5), 9, -zEnd - 6), '--cel-wall-1');
      box(10, 14, 9, at(s * (FRONT + 4.5), 7, field ? 6 : 8), '--cel-wall-3');
    });
    var crossings = [];
    for (z = -40; z > -zEnd + 10; z -= 130) crossings.push(z);
    street(zEnd, crossings);
    poles(zEnd);
    for (z = -6, k = 0; z > -zEnd; z -= 19) {
      k++;
      if (z < -zEnd + lots.length * 17.2 + 4) continue;
      tree(((k % 2) ? 1 : -1) * (ROAD + 1.6), z, 1);
    }
    var k;
    crossings.forEach(function (c, n) {
      signpost(ROAD + 1.1, c + 4.4, arrowTex, false);
      signpost(-ROAD - 1.1, c - 4.4, slowTex, true);
      if (n % 2 === 0) mirror(ROAD + 1.0, c - 4.5, 1);
    });
    signpost(-ROAD - 1.1, 4.5, slowTex, true);
    // The street's clutter, all the way down: a vending machine against a
    // wall, a bicycle against a pole, a car at the kerb.
    for (z = -20, k = 0; z > -zEnd + 20; z -= 77, k++) vending((k % 2 ? 1 : -1) * (FRONT - 0.6), z, k % 2 ? 1 : -1);
    for (z = -9.4, k = 0; z > -zEnd + 20; z -= 60, k++) bicycle((k % 2 ? 1 : -1) * (ROAD + 1.0), z);
    for (z = -32, k = 0; z > -zEnd + 20; z -= 71, k++) car((k % 2 ? -1 : 1) * (ROAD - 0.95), z);
    if (field) treeline(field, -1);
    beyond(zEnd, open);
    sky();
    bake();
    if (field) hits.forEach(function (h) { h.userData.stop += 1; });
    hits.forEach(function (h) { scene.add(h); h.updateMatrixWorld = function () {}; });
    bounds.z = [-zEnd - 4, field ? TREES - 2.5 : 9];
    stops = placed.map(function (p) {
      return { name: p.name, page: p.page, x: -p.side * 1.5, z: p.z, yaw: p.side < 0 ? Math.PI / 2 : -Math.PI / 2 };
    });
    if (field) stops.unshift({ name: field.name.replace(/^THE /, 'The ').replace(/\B[A-Z]+/g, function (w) { return w.toLowerCase(); }), page: field.page, x: 0, z: TREES - 4, yaw: Math.PI });

    // The way in for a keyboard and a screen reader: the doors as links.
    if (list) {
      stops.forEach(function (s) {
        var li = document.createElement('li'), a = document.createElement('a');
        a.href = s.page; a.textContent = s.name;
        a.addEventListener('focus', function () { standAt(s); });
        li.appendChild(a); list.appendChild(li);
      });
      list.hidden = false;
    }
    if (controls) controls.hidden = false;
    if (roomInAddress()) enter(roomInAddress(), false);
    setMode(document.documentElement.getAttribute('data-intensity') !== 'gentle');
    resize();
    tell();
  }

  /* ── Size, keys, buttons, dragging, pressing ───────────────────────────── */
  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    css3d.setSize(w, h);
    camera.aspect = w / h;
    camera.fov = w < 600 ? 72 : 62;
    camera.updateProjectionMatrix();
    draw();
  }
  if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);

  stage.addEventListener('keydown', function (e) {
    if (e.target !== stage) return;
    if (e.key === 'Escape' && inside) { e.preventDefault(); outOfRoom(); return; }
    if (e.key === 'Enter') {
      var s = nearest();
      if (s && s.frame) {
        var into = s.frame.tagName === 'IFRAME' ? s.frame : s.frame.querySelector('button, a[href], summary, [tabindex]');
        if (into) into.focus({ preventScroll: true });
      }
      else if (s && ROOMS[s.page] && !(inside && s.page === inside.page)) enter(s.page);
      else if (s && s.page) window.location.href = s.page;
      return;
    }
    var what = KEYS[e.key];
    if (!what) return;
    e.preventDefault();
    if (!gliding || what === 'ahead' || what === 'climb') { stepOnce(what); return; }
    if (!held[what]) { held[what] = true; glide = null; soon(); }
  });
  stage.addEventListener('keyup', function (e) { var w = KEYS[e.key]; if (w) held[w] = false; });
  stage.addEventListener('blur', function () { held = {}; });

  if (controls) {
    controls.querySelectorAll('[data-cel-go]').forEach(function (b) {
      var what = b.getAttribute('data-cel-go');
      function down(e) {
        if (!gliding || what === 'ahead' || what === 'climb') return;
        e.preventDefault(); held[what] = true; glide = null; soon();
      }
      function up() { held[what] = false; }
      b.addEventListener('pointerdown', down);
      b.addEventListener('pointerup', up);
      b.addEventListener('pointerleave', up);
      b.addEventListener('pointercancel', up);
      b.addEventListener('click', function () { if (!gliding || what === 'ahead' || what === 'climb') stepOnce(what); });
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stepOnce(what); } });
    });
  }
  if (modeBtn) modeBtn.addEventListener('click', function () { setMode(!gliding); held = {}; glide = null; });

  var drag = null, moved = false;
  canvas.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY, mouse: e.pointerType === 'mouse' }; moved = false; });
  window.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
    if (!moved) return;
    me.yaw += dx * 0.005;
    if (drag.mouse) me.pitch += dy * 0.004;
    drag.x = e.clientX; drag.y = e.clientY;
    clamp(); glide = null; draw(); tell();
  });
  window.addEventListener('pointerup', function () { drag = null; });
  var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  canvas.addEventListener('click', function (e) {
    if (moved) return;
    var r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    var hit = ray.intersectObjects(hits, false)[0];
    if (hit) standAt(stops[hit.object.userData.stop]);
    stage.focus({ preventScroll: true });
  });

  /* ── Read the street, then build ───────────────────────────────────────── */
  fetch('index.html', { credentials: 'same-origin', cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (src) {
      var doc = new DOMParser().parseFromString(src, 'text/html');
      var row = doc.querySelector('ul.doors');
      var doors = row ? Array.prototype.slice.call(row.querySelectorAll(':scope > li > a.door')) : [];
      if (!doors.length) throw new Error('no doors');
      var items = doors.map(function (el) { return { el: el, kind: 'door' }; });
      var gate = doc.querySelector('a.gardengate');
      if (gate) items.push({ el: gate, kind: 'gate' });
      Array.prototype.forEach.call(doc.querySelectorAll('div.openground a.lotgate'), function (el) { items.push({ el: el, kind: 'lot' }); });
      var post = doc.querySelector('a.signpost');
      if (post) items.push({ el: post, kind: 'post' });
      var worn = wear(items);
      var faces = worn.map(function (d) { return document.fonts ? document.fonts.load(d.weight + ' 64px ' + d.face, d.name).catch(function () {}) : null; });
      return Promise.all(faces).then(function () { build(worn); });
    })
    .catch(function (e) { fail(); if (window.console) console.error('Cel Street could not be built:', e); });
}
