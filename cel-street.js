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
   The one exception is what a room hands the kit to move (flames, turn,
   lights; Ryan, 2026-11-04, for the Faery Yurt's candles, record and fairy
   lights): by itself only at MAX and only where that room's own page moves
   it at MAX, otherwise only once somebody presses its switch, never in a
   low-stimulation mode or a hidden tab, and held under the flash line.
   A game controller is the one thing read every frame, and only while one is
   connected, because a browser has no event for a stick moving; reading it
   draws nothing unless it asks for something.
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
  var ROOMS = {'a-quiet-pint.html': 'cel-in-a-quiet-pint.js', 'adventurers-guild.html': 'cel-in-adventurers-guild.js', 'all-needs-met.html': 'cel-in-all-needs-met.js', 'all-together-now.html': 'cel-in-all-together-now.js', 'arcade.html': 'cel-in-arcade.js', 'arlesglad-caverns.html': 'cel-in-arlesglad-caverns.js', 'big-steep-fermentables.html': 'cel-in-big-steep-fermentables.js', 'black-leather-lagoon.html': 'cel-in-black-leather-lagoon.js', 'bodymind-booth.html': 'cel-in-bodymind-booth.js', 'brass-tacks-board.html': 'cel-in-brass-tacks-board.js', 'breaker-breaker.html': 'cel-in-breaker-breaker.js', 'brew-and-stew.html': 'cel-in-brew-and-stew.js', 'brighter-days.html': 'cel-in-brighter-days.js', 'broadsheet-broadside.html': 'cel-in-broadsheet-broadside.js', 'campgrounds.html': 'cel-in-campgrounds.js', 'cavendish-campfire.html': 'cel-in-cavendish-campfire.js', 'cavendish-cave.html': 'cel-in-cavendish-cave.js', 'cavendish-coworking.html': 'cel-in-cavendish-coworking.js', 'cavendish-editorial.html': 'cel-in-cavendish-editorial.js', 'cavendish-events.html': 'cel-in-cavendish-events.js', 'cavendish-operations.html': 'cel-in-cavendish-operations.js', 'cavendish-primary-classroom.html': 'cel-in-cavendish-primary-classroom.js', 'cavendish-watering-hole.html': 'cel-in-cavendish-watering-hole.js', 'champuru.html': 'cel-in-champuru.js', 'chimera-obscura.html': 'cel-in-chimera-obscura.js', 'clacks-tower.html': 'cel-in-clacks-tower.js', 'club-chronic.html': 'cel-in-club-chronic.js', 'collection-collection.html': 'cel-in-collection-collection.js', 'comfort-station.html': 'cel-in-comfort-station.js', 'community-care.html': 'cel-in-community-care.js', 'community-center.html': 'cel-in-community-center.js', 'community-library.html': 'cel-in-community-library.js', 'cooldown-room.html': 'cel-in-cooldown-room.js', 'coping.html': 'cel-in-coping.js', 'count-me-in.html': 'cel-in-count-me-in.js', 'covenstead.html': 'cel-in-covenstead.js', 'dance-punks.html': 'cel-in-dance-punks.js', 'danny-the-street.html': 'cel-in-danny-the-street.js', 'dead-tired-society.html': 'cel-in-dead-tired-society.js', 'dopamine-dress-up-den.html': 'cel-in-dopamine-dress-up-den.js', 'enids-room.html': 'cel-in-enids-room.js', 'excursions.html': 'cel-in-excursions.js', 'faery-cinema-room.html': 'cel-in-faery-cinema-room.js', 'faery-music-room.html': 'cel-in-faery-music-room.js', 'faery-myths-room.html': 'cel-in-faery-myths-room.js', 'faery-reading-room.html': 'cel-in-faery-reading-room.js', 'faery-yurt.html': 'cel-in-faery-yurt.js', 'fantasy-fancy-dress.html': 'cel-in-fantasy-fancy-dress.js', 'foundry.html': 'cel-in-foundry.js', 'fridge-of-sighs.html': 'cel-in-fridge-of-sighs.js', 'gentle-help.html': 'cel-in-gentle-help.js', 'glow-go-gee-gaws.html': 'cel-in-glow-go-gee-gaws.js', 'glow-wild-hollow.html': 'cel-in-glow-wild-hollow.js', 'golem-trust.html': 'cel-in-golem-trust.js', 'haunted-house.html': 'cel-in-haunted-house.js', 'healing-checkpoint.html': 'cel-in-healing-checkpoint.js', 'hear-queer-here.html': 'cel-in-hear-queer-here.js', 'hey-good-cookin.html': 'cel-in-hey-good-cookin.js', 'jungle-room.html': 'cel-in-jungle-room.js', 'l-space.html': 'cel-in-l-space.js', 'latibulum.html': 'cel-in-latibulum.js', 'laughingstock.html': 'cel-in-laughingstock.js', 'learning-large.html': 'cel-in-learning-large.js', 'lightbulb-picture-house.html': 'cel-in-lightbulb-picture-house.js', 'live-room.html': 'cel-in-live-room.js', 'loo-with-a-view.html': 'cel-in-loo-with-a-view.js', 'looking-glass-house.html': 'cel-in-looking-glass-house.js', 'looming-rocks.html': 'cel-in-looming-rocks.js', 'mycelium-munchies.html': 'cel-in-mycelium-munchies.js', 'natures-contribution.html': 'cel-in-natures-contribution.js', 'neurohome.html': 'cel-in-neurohome.js', 'nothing-for-sale.html': 'cel-in-nothing-for-sale.js', 'now-playing.html': 'cel-in-now-playing.js', 'oook.html': 'cel-in-oook.js', 'oracle-deck.html': 'cel-in-oracle-deck.js', 'otterly-adorbs.html': 'cel-in-otterly-adorbs.js', 'pando-calrissian.html': 'cel-in-pando-calrissian.js', 'pebble-board.html': 'cel-in-pebble-board.js', 'pekoe-and-purrs.html': 'cel-in-pekoe-and-purrs.js', 'penguin-pebbling.html': 'cel-in-penguin-pebbling.js', 'pets.html': 'cel-in-pets.js', 'pink-pony-club.html': 'cel-in-pink-pony-club.js', 'play-pod.html': 'cel-in-play-pod.js', 'playhouse.html': 'cel-in-playhouse.js', 'plural-mural.html': 'cel-in-plural-mural.js', 'polaroids.html': 'cel-in-polaroids.js', 'quill-drift.html': 'cel-in-quill-drift.js', 'rabbit-hole.html': 'cel-in-rabbit-hole.js', 'rebellion-rave-room.html': 'cel-in-rebellion-rave-room.js', 'repeater.html': 'cel-in-repeater.js', 'rescue-a-cat.html': 'cel-in-rescue-a-cat.js', 'rescue-a-dog.html': 'cel-in-rescue-a-dog.js', 'rescue-small-animals.html': 'cel-in-rescue-small-animals.js', 'retail-therapy.html': 'cel-in-retail-therapy.js', 'samefood-cafe.html': 'cel-in-samefood-cafe.js', 'sandbox.html': 'cel-in-sandbox.js', 'scalable-feast-ballroom.html': 'cel-in-scalable-feast-ballroom.js', 'seaside-convenience.html': 'cel-in-seaside-convenience.js', 'show-your-work.html': 'cel-in-show-your-work.js', 'sithen.html': 'cel-in-sithen.js', 'small-hours.html': 'cel-in-small-hours.js', 'solarpunk-hermitage.html': 'cel-in-solarpunk-hermitage.js', 'spaceholder-saloon.html': 'cel-in-spaceholder-saloon.js', 'stay-breezy.html': 'cel-in-stay-breezy.js', 'stay-frosty.html': 'cel-in-stay-frosty.js', 'sunshine-sanctuary.html': 'cel-in-sunshine-sanctuary.js', 'swaying-sweetgrass.html': 'cel-in-swaying-sweetgrass.js', 'the-aerial-arbour.html': 'cel-in-the-aerial-arbour.js', 'the-bough-house.html': 'cel-in-the-bough-house.js', 'the-chappell.html': 'cel-in-the-chappell.js', 'the-dairy.html': 'cel-in-the-dairy.js', 'the-den.html': 'cel-in-the-den.js', 'the-doom-scoop.html': 'cel-in-the-doom-scoop.js', 'the-doomscroll.html': 'cel-in-the-doomscroll.js', 'the-feed.html': 'cel-in-the-feed.js', 'the-garden.html': 'cel-in-the-garden.js', 'the-green.html': 'cel-in-the-green.js', 'the-honesty-box.html': 'cel-in-the-honesty-box.js', 'the-mopery.html': 'cel-in-the-mopery.js', 'the-mountain-cabin.html': 'cel-in-the-mountain-cabin.js', 'the-mud-room.html': 'cel-in-the-mud-room.js', 'the-open-notebook.html': 'cel-in-the-open-notebook.js', 'the-outskirts.html': 'cel-in-the-outskirts.js', 'the-pile.html': 'cel-in-the-pile.js', 'the-quiet-stall.html': 'cel-in-the-quiet-stall.js', 'the-run.html': 'cel-in-the-run.js', 'the-source.html': 'cel-in-the-source.js', 'town-hall-board.html': 'cel-in-town-hall-board.js', 'town-hall-directors.html': 'cel-in-town-hall-directors.js', 'town-hall-executive-session.html': 'cel-in-town-hall-executive-session.js', 'town-hall-fishbowl.html': 'cel-in-town-hall-fishbowl.js', 'town-hall-moderators.html': 'cel-in-town-hall-moderators.js', 'town-hall.html': 'cel-in-town-hall.js', 'truckin-food-court.html': 'cel-in-truckin-food-court.js', 'vital-plant-living.html': 'cel-in-vital-plant-living.js', 'volunteers.html': 'cel-in-volunteers.js', 'widdershins.html': 'cel-in-widdershins.js', 'wide-spread-chaos.html': 'cel-in-wide-spread-chaos.js', 'words-bud-beats.html': 'cel-in-words-bud-beats.js', 'world.html': 'cel-in-world.js', 'your-room.html': 'cel-in-your-room.js', 'zibaldone.html': 'cel-in-zibaldone.js', 'zine-issue-2.html': 'cel-in-zine-issue-2.js', 'zine-table.html': 'cel-in-zine-table.js'};
  var NAMES = {"a-quiet-pint.html": "A Quiet Pint", "adventurers-guild.html": "The Adventurer’s Guild", "all-needs-met.html": "All Needs Met Wildlife Sanctuary", "all-together-now.html": "All Together Now Farms", "arcade.html": "The Arcade", "arlesglad-caverns.html": "Arlesglad Caverns", "big-steep-fermentables.html": "Big Steep Fermentables", "black-leather-lagoon.html": "Black Leather Lagoon", "bodymind-booth.html": "The Bodymind Booth", "brass-tacks-board.html": "The Brass Tacks Board", "breaker-breaker.html": "Breaker Breaker", "brew-and-stew.html": "Brew and Stew", "brighter-days.html": "Brighter Days Solar Farm", "broadsheet-broadside.html": "The Broadsheet Broadside", "campgrounds.html": "The Campgrounds", "cavendish-campfire.html": "The Campfire", "cavendish-cave.html": "The Cave", "cavendish-coworking.html": "Cavendish Coworking", "cavendish-editorial.html": "The Editorial Room", "cavendish-events.html": "The Events Room", "cavendish-operations.html": "The Operations Room", "cavendish-primary-classroom.html": "Cavendish Primary Classroom", "cavendish-watering-hole.html": "The Watering Hole", "champuru.html": "Champuru", "chimera-obscura.html": "Chimera Obscura", "clacks-tower.html": "The Clacks Tower", "club-chronic.html": "Club Chronic", "collection-collection.html": "The Collection Collection", "comfort-station.html": "The Comfort Station", "community-care.html": "Community Care", "community-center.html": "The Community Center", "community-library.html": "The Community Library", "cooldown-room.html": "The Cooldown Room", "coping.html": "Coping", "count-me-in.html": "Count Me In", "covenstead.html": "Covenstead", "dance-punks.html": "Dance, Punks", "danny-the-street.html": "Danny the Street", "dead-tired-society.html": "Dead Tired Society", "dopamine-dress-up-den.html": "The Dopamine Dress-Up Den", "enids-room.html": "Enid's Room", "excursions.html": "Excursions", "faery-cinema-room.html": "The Cinema", "faery-music-room.html": "The Music Room", "faery-myths-room.html": "Myths & Legends", "faery-reading-room.html": "The Reading Room", "faery-yurt.html": "The Faery Yurt", "fantasy-fancy-dress.html": "Fantasy Fancy Dress", "foundry.html": "The Foundry", "fridge-of-sighs.html": "The Fridge of Sighs", "gentle-help.html": "Gentle Help Cannabis Farm", "glow-go-gee-gaws.html": "Glow Go Gee Gaws", "glow-wild-hollow.html": "Glow Wild Hollow", "golem-trust.html": "The Golem Trust", "haunted-house.html": "The Haunted House", "healing-checkpoint.html": "The Healing Checkpoint", "hear-queer-here.html": "Hear Queer Here", "hey-good-cookin.html": "Hey, Good Cookin’", "jungle-room.html": "The Jungle Room", "l-space.html": "L-Space", "latibulum.html": "The Latibulum", "laughingstock.html": "Laughingstock", "learning-large.html": "Learning Large", "lightbulb-picture-house.html": "The Lightbulb Picture House", "live-room.html": "The Live Room", "loo-with-a-view.html": "Loo With a View", "looking-glass-house.html": "Looking-Glass House", "looming-rocks.html": "Looming Rocks Amphitheatre", "mycelium-munchies.html": "Mycelium Munchies", "natures-contribution.html": "Nature’s Contribution", "neurohome.html": "NeuroHome", "nothing-for-sale.html": "Nothing For Sale", "now-playing.html": "Now Playing", "oook.html": "Oook", "oracle-deck.html": "The Oracle Deck", "otterly-adorbs.html": "Otterly Adorbs", "pando-calrissian.html": "Pando Calrissian", "pebble-board.html": "The Pebble Board", "pekoe-and-purrs.html": "Pekoe and Purrs", "penguin-pebbling.html": "Penguin Pebbling", "pets.html": "Pets", "pink-pony-club.html": "Pink Pony Club", "play-pod.html": "The Play Pod", "playhouse.html": "The Playhouse", "plural-mural.html": "Plural Mural", "polaroids.html": "The Polaroid Wall", "quill-drift.html": "Quill Drift", "rabbit-hole.html": "The Rabbit Hole", "rebellion-rave-room.html": "Rebellion Rave Room", "repeater.html": "The Repeater", "rescue-a-cat.html": "Rescue A Cat", "rescue-a-dog.html": "Rescue A Dog", "rescue-small-animals.html": "Rescue Small Animals", "retail-therapy.html": "Retail Therapy", "samefood-cafe.html": "Samefood Cafe", "sandbox.html": "The Sandbox", "scalable-feast-ballroom.html": "Scalable Feast Ballroom", "seaside-convenience.html": "The Seaside Convenience", "show-your-work.html": "Show Your Work", "sithen.html": "Sithen", "small-hours.html": "The Small Hours", "solarpunk-hermitage.html": "The Solarpunk Hermitage", "spaceholder-saloon.html": "Spaceholder Saloon", "stay-breezy.html": "Stay Breezy", "stay-frosty.html": "Stay Frosty", "sunshine-sanctuary.html": "The Sunshine Sanctuary for Sick Dragons", "swaying-sweetgrass.html": "Swaying Sweetgrass", "the-aerial-arbour.html": "The Aerial Arbour", "the-bough-house.html": "The Bough House", "the-chappell.html": "The Chappell", "the-dairy.html": "The Dairy", "the-den.html": "The Den", "the-doom-scoop.html": "The Doom Scoop", "the-doomscroll.html": "The Doomscroll", "the-feed.html": "The Feed", "the-garden.html": "The Garden", "the-green.html": "The Green", "the-honesty-box.html": "The Honesty Box", "the-mopery.html": "The Mopery", "the-mountain-cabin.html": "The Emergent Future Worlds Meets Mountain Man", "the-mud-room.html": "The MUD Room", "the-open-notebook.html": "The Open Notebook", "the-outskirts.html": "The Outskirts", "the-pile.html": "The Pile", "the-quiet-stall.html": "The Quiet Stall", "the-run.html": "The Run", "the-source.html": "The Source", "town-hall-board.html": "The Board room", "town-hall-directors.html": "The Directors’ room", "town-hall-executive-session.html": "Executive Session", "town-hall-fishbowl.html": "The Fishbowl", "town-hall-moderators.html": "The Moderators’ room", "town-hall.html": "The Town Hall", "truckin-food-court.html": "Truckin’ Food Court", "vital-plant-living.html": "Vital Plant Living", "volunteers.html": "Volunteers", "widdershins.html": "Widdershins", "wide-spread-chaos.html": "Wide-Spread Chaos Gardens", "words-bud-beats.html": "Words, Bud, Beats", "world.html": "World", "your-room.html": "Your Room", "zibaldone.html": "The Zibaldone", "zine-issue-2.html": "Issue #2, One Root, Two Rainbows", "zine-table.html": "The Zine Table"};
  // cel:rooms:end
  var CHUNK = 60;            // the street is drawn in lengths this long
  var VIEW = 300;            // and only the lengths this near you are drawn
  var FRONT = 6.2;           // half the street, kerb to kerb past the pavements
  var ROAD = 3.5;            // half the road
  var EYE = 1.6;
  var WALK = 4.6, TURN = 1.7, STEP = 2.2, STEP_TURN = Math.PI / 6;
  var INK = 0.05;            // how thick the ink round a solid thing is

  var hereEl = document.querySelector('[data-cel-here]');
  // Which room you are in, said on the stage and in the tab: a plate pinned in
  // the stage's corner, over the picture, so it takes no room on the page and
  // a long name is cut short rather than wrapping (Ryan, 2026-11-04). The line
  // under the stage still says it in words; the plate is for eyes only.
  var plateEl = document.querySelector('[data-cel-plate]');
  var titleWas = document.title;
  var failed = document.querySelector('[data-cel-failed]');
  var controls = document.querySelector('[data-cel-controls]');
  var list = document.querySelector('[data-cel-doors]');
  var modeBtn = document.querySelector('[data-cel-mode]');
  var climbBtn = document.querySelector('[data-cel-go="climb"]');
  var outBtn = document.querySelector('[data-cel-out]');
  var placesEl = document.querySelector('[data-cel-places]');
  var zoomedEl = document.querySelector('[data-cel-zoomed]');
  var teleForm = document.querySelector('[data-cel-tele]');
  var teleSaid = document.querySelector('[data-cel-tele-said]');
  var fullEl = document.querySelector('[data-cel-full]');
  var fullBtn = document.querySelector('[data-cel-fullscreen]');

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

  // PAINTED, NOT PRINTED. Every solid thing's colour is laid on as if with a
  // brush: a soft mottle a few metres across and a finer streak running up
  // and down, worked out from where the surface is in the world, so it never
  // stretches with a piece's size and nothing has to be unwrapped for it. It
  // moves a colour a few per cent lighter or darker and never to another
  // colour, so a thing stays in the ink it was drawn in; a sheet that carries
  // words or a picture (a material with a map) is never painted over.
  var PAINT = 0.16;
  function painted(mat) {
    if (mat.map) return mat;
    mat.onBeforeCompile = function (sh) {
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vPaintAt;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvPaintAt = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', [
          '#include <common>',
          'varying vec3 vPaintAt;',
          'float paintHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }',
          'float paintNoise(vec3 x) {',
          '  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);',
          '  return mix(mix(mix(paintHash(i), paintHash(i + vec3(1.0, 0.0, 0.0)), f.x), mix(paintHash(i + vec3(0.0, 1.0, 0.0)), paintHash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),',
          '             mix(mix(paintHash(i + vec3(0.0, 0.0, 1.0)), paintHash(i + vec3(1.0, 0.0, 1.0)), f.x), mix(paintHash(i + vec3(0.0, 1.0, 1.0)), paintHash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);',
          '}'
        ].join('\n'))
        .replace('vec4 diffuseColor = vec4( diffuse, opacity );', [
          'vec4 diffuseColor = vec4( diffuse, opacity );',
          // A pale wall shows a fine streak as corrugation close up, so the
          // paler the colour the more of its texture is the soft mottle.
          'float paintLum = dot(diffuse, vec3(0.299, 0.587, 0.114));',
          'float paintStreak = mix(0.45, 0.12, smoothstep(0.45, 0.85, paintLum));',
          'float paintN = paintNoise(vPaintAt * 0.32) * (1.0 - paintStreak) + paintNoise(vec3(vPaintAt.x * 2.6, vPaintAt.y * 0.55, vPaintAt.z * 2.6)) * paintStreak;',
          'diffuseColor.rgb *= 1.0 + (paintN - 0.5) * ' + PAINT.toFixed(3) + ';'
        ].join('\n'));
    };
    mat.customProgramCacheKey = function () { return 'painted'; };
    return mat;
  }
  // THE LOOK (Helen Edgar's call for her rooms, 2026-11-11: "more like Second
  // Life and not anime cel style, that is my choice", then "an option for anime
  // cel or photo real"): the street is drawn in cel, Ryan's look, and a room may
  // say look: 'real' on its object, which draws it with smooth lit materials,
  // soft colour in the light and no inked hulls, in exactly the same colours.
  // Look under the stage lets anybody flip the room they are in between the
  // two for this visit; it is kept nowhere. lookChoice is theirs, lookNow the
  // look everything is built in while a room is built.
  var lookChoice = null, lookNow = 'cel';
  function real() { return lookNow === 'real'; }
  function solid(c) {
    return real()
      ? painted(new THREE.MeshStandardMaterial({ color: c, roughness: 0.78, metalness: 0.0 }))
      : painted(new THREE.MeshToonMaterial({ color: c, gradientMap: gradient }));
  }
  var mats = {};
  function toon(name) {
    var k = lookNow + '|' + name;
    if (!mats[k]) mats[k] = solid(col(name));
    return mats[k];
  }
  function toonColor(c) {
    var key = lookNow + '|c' + c.getHexString();
    if (!mats[key]) mats[key] = solid(c);
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
    if (ink !== false && !real()) {
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
    post: { ground: '.signpost__arm', stripes: null, name: '.signpost__to' },
    road: { ground: '.roadout__arm', stripes: null, name: '.roadout__to' },
    lift: { ground: '.liftdown__plate', stripes: null, name: '.liftdown__to' },
    board: { ground: '.noticeboard__case', stripes: null, name: '.noticeboard__what' },
    brass: { ground: '.brasstacks__plate', stripes: null, name: '.brasstacks__what' },
    column: { ground: '.postercol__drum', stripes: null, name: '.postercol__what' },
    name: { ground: null, stripes: null, name: null }
  };
  function named(t, kind) {
    t = t.replace(/[\u2190-\u21ff]/g, '').replace(/\s+/g, ' ').trim();
    if (kind === 'gate' || kind === 'lift') {
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
      var aw = P.stripes ? c.querySelector(P.stripes) : null, nm = P.name ? c.querySelector(P.name) : null;
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
        lived(d.name + f + ':' + k, x, y, front, g, balc, W / cols);
        if (balc) {
          box(W / cols - 0.25, 0.14, 0.9, at(x, y - 1.05, front + 0.45, 0, 0, 0, g), '--cel-kerb');
          box(W / cols - 0.25, 0.85, 0.07, at(x, y - 0.55, front + 0.88, 0, 0, 0, g), '--cel-kerb', 0.03);
          if ((k + f) % 3 === 0) box(0.7, 0.5, 0.3, at(x - 0.6, y - 0.73, front + 0.3, 0, 0, 0, g), '--cel-frame');
        }
      }
    }
    // ON THE PAVEMENT IN FRONT OF SOME SHOPS, a table and two chairs, or a
    // planter by the door: somebody lives and works here.
    var out = hash(d.name + 'out');
    if (out < 0.28) cafe(at(W / 2 - 1.6, 0.25, front + 1.3, 0, 0, 0, g), d.name);
    else if (out < 0.6) planter(at(-W / 2 + 0.45, 0.25, front + 0.45, 0, 0, 0, g), d.name, 0.7);
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

  // THE LIFE IN THE WINDOWS: a sill under every one, and in some a curtain
  // drawn to one side, a box of flowers on the sill, or a pot plant on the
  // balcony, chosen by the window's own hash so the street is the same street
  // every time. Every colour is Cel Street's own.
  var FLOWERS = ['--cel-sign-red', '--cel-sign-yellow', '--cel-wall-2', '--cel-cloud'];
  var CURTAINS = ['--cel-wall-2', '--cel-sign-yellow', '--cel-wall-4', '--cel-cloud', '--cel-sign-red'];
  var BLOOM = new THREE.IcosahedronGeometry(0.07, 0), BUSH = new THREE.IcosahedronGeometry(1, 1);
  function flowers(m, wide, deep, key, n) {
    for (var q = 0; q < n; q++) {
      var fx = (hash(key + 'fx' + q) - 0.5) * wide, fz = (hash(key + 'fz' + q) - 0.5) * deep;
      piece(BLOOM.clone(), new THREE.Matrix4().multiplyMatrices(m, at(fx, 0.02 + hash(key + 'fy' + q) * 0.08, fz)),
        toon(FLOWERS[Math.floor(hash(key + 'fc' + q) * FLOWERS.length)]), FLOWERS[Math.floor(hash(key + 'fc' + q) * FLOWERS.length)], false);
    }
  }
  function lived(key, x, y, front, g, balc, cw) {
    box(1.35, 0.08, 0.16, at(x, y - 0.78, front + 0.08, 0, 0, 0, g), '--cel-kerb', 0.02);
    var r = hash(key);
    if (r < 0.35) {
      var c = CURTAINS[Math.floor(hash(key + 'c') * CURTAINS.length)];
      box(0.34, 1.3, 0.02, at(x + (r < 0.17 ? -0.38 : 0.38), y, front + 0.035, 0, 0, 0, g), c, false, false);
    }
    if (!balc && hash(key + 'b') < 0.32) {
      var bm = at(x, y - 0.66, front + 0.2, 0, 0, 0, g);
      box(1.2, 0.22, 0.26, bm, '--cel-trunk', 0.02);
      var bush = BUSH.clone(); bush.scale(0.58, 0.16, 0.13);
      piece(bush, new THREE.Matrix4().multiplyMatrices(bm, at(0, 0.16, 0)), toon('--cel-leaf'), '--cel-leaf', 0.02);
      flowers(new THREE.Matrix4().multiplyMatrices(bm, at(0, 0.2, 0)), 1.0, 0.18, key, 6);
    }
    if (balc && hash(key + 'p') < 0.4) {
      var pm = at(x + (hash(key + 'px') - 0.5) * (cw - 1.0), y - 0.98, front + 0.62, 0, 0, 0, g);
      cyl(0.16, 0.12, 0.3, new THREE.Matrix4().multiplyMatrices(pm, at(0, 0.15, 0)), '--cel-wall-3', 0.02, 10);
      var leaf = BUSH.clone(); leaf.scale(0.26, 0.34, 0.26);
      piece(leaf, new THREE.Matrix4().multiplyMatrices(pm, at(0, 0.5, 0)), toon('--cel-leaf'), '--cel-leaf', 0.03);
    }
  }
  // A table and two chairs outside a shop, and a planter of flowers.
  function cafe(m, key) {
    function on(x, y, z, ry) { return new THREE.Matrix4().multiplyMatrices(m, at(x, y, z, ry || 0)); }
    cyl(0.4, 0.4, 0.05, on(0, 0.74, 0), '--cel-cloud', 0.02, 16);
    cyl(0.04, 0.05, 0.72, on(0, 0.37, 0), '--cel-ink', false, 6);
    cyl(0.22, 0.22, 0.03, on(0, 0.02, 0), '--cel-ink', false, 12);
    [-0.7, 0.7].forEach(function (o, k) {
      box(0.42, 0.05, 0.42, on(o, 0.46, 0.05), k ? '--cel-sign-yellow' : '--cel-sign-blue', 0.02);
      box(0.42, 0.45, 0.05, on(o + (k ? 0.2 : -0.2), 0.7, 0.05, Math.PI / 2), k ? '--cel-sign-yellow' : '--cel-sign-blue', 0.02);
      [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].forEach(function (l) { box(0.04, 0.44, 0.04, on(o + l[0], 0.22, 0.05 + l[1]), '--cel-ink', false); });
    });
    cyl(0.07, 0.07, 0.14, on(0, 0.84, 0), '--cel-leaf', 0.01, 8);
  }
  function planter(m, key, size) {
    box(size, 0.5, size * 0.7, new THREE.Matrix4().multiplyMatrices(m, at(0, 0.25, 0)), '--cel-wall-3', 0.03);
    var bush = BUSH.clone(); bush.scale(size * 0.48, 0.32, size * 0.34);
    piece(bush, new THREE.Matrix4().multiplyMatrices(m, at(0, 0.62, 0)), toon('--cel-leaf'), '--cel-leaf', 0.03);
    flowers(new THREE.Matrix4().multiplyMatrices(m, at(0, 0.78, 0)), size * 0.8, size * 0.5, key + 'pl', 9);
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

  // THE LIFT HEAD, on the pavement by the stoop, with the stair beside it: the
  // way down to the caverns, named first and the stair in the same breath, as
  // the front page has it. Its plate is in the lift's own ground and lettering.
  var LIFT_Z = 5.6;
  function liftHead(d, i) {
    var g = at(ROAD + 2.0, 0.25, LIFT_Z, -Math.PI / 2);
    var shop = new THREE.Color(d.ground), mat = toonColor(shop), key = 'c' + shop.getHexString();
    function on(x, y, z) { return new THREE.Matrix4().multiplyMatrices(g, at(x, y, z)); }
    box(1.9, 2.7, 1.1, on(0, 1.35, -0.45), '--cel-wall-3');
    box(1.9, 0.14, 1.2, on(0, 2.75, -0.45), '--cel-kerb');
    [-1, 1].forEach(function (k) { box(0.76, 2.1, 0.06, on(k * 0.4, 1.05, 0.12), '--cel-frame', 0.02); });
    piece((function () { var b = BOX.clone(); b.scale(0.2, 0.34, 0.06); return b; })(), on(1.06, 1.25, 0.12), mat, key);
    signboard(d, 2.6, 0.5, on(0, 3.15, 0.15));
    // The stair beside it: a well in the pavement with a rail round three sides.
    box(1.3, 0.02, 2.2, on(-1.9, 0.02, -0.5), '--cel-road', false, false);
    [[-2.55, -1.6], [-2.55, 0.6], [-1.25, -1.6], [-1.25, 0.6]].forEach(function (p) { box(0.06, 0.9, 0.06, on(p[0], 0.45, p[1]), '--cel-frame', false); });
    box(0.06, 0.06, 2.2, on(-2.55, 0.9, -0.5), '--cel-frame', false);
    box(0.06, 0.06, 2.2, on(-1.25, 0.9, -0.5), '--cel-frame', false);
    box(1.3, 0.06, 0.06, on(-1.9, 0.9, -1.6), '--cel-frame', false);
    hitbox(i, 2.4, 3.4, 1.6, on(0, 1.6, 0));
  }

  // THE ROAD OUT, at the far end: the last streetlight, and past it the road
  // going on with no kerb, under the arm that names where it goes, in the
  // road-out sign's own ground and lettering.
  function roadOut(d, i, zEnd) {
    var z = -zEnd - 3;
    var shop = new THREE.Color(d.ground), mat = toonColor(shop), key = 'c' + shop.getHexString();
    cyl(0.1, 0.14, 4.0, at(ROAD + 0.9, 2.0, z), '--cel-pole', 0.03, 8);
    piece((function () { var b = BOX.clone(); b.scale(3.6, 0.12, 0.12); return b; })(), at(ROAD + 0.9 - 1.7, 3.95, z), mat, key);
    signboard(d, 3.2, 0.6, at(ROAD + 0.9 - 1.8, 3.5, z + 0.08));
    cyl(0.08, 0.12, 7.5, at(-ROAD - 0.9, 3.75, z - 1.5), '--cel-pole', 0.03, 8);
    box(1.4, 0.12, 0.12, at(-ROAD - 0.3, 7.4, z - 1.5), '--cel-pole', 0.03);
    box(0.5, 0.18, 0.32, at(-ROAD + 0.35, 7.25, z - 1.5), '--cel-frame', 0.02);
    // Past it the road runs on, with no pavement and no kerb, into the haze.
    box(ROAD * 2, 0.08, 60, at(0, -0.04, z - 32), '--cel-road', false, false);
    hitbox(i, 3.6, 2, 1, at(ROAD + 0.9 - 1.8, 3.4, z));
  }

  // THE STREET FURNITURE BY THE FRONT DOOR, on the left-hand pavement at the
  // stoop's end, each in the ground and lettering the front page dresses it
  // in: the Pebble Board, a case under glass on legs; the Brass Tacks Board, a
  // plate bolted to the end wall; Now Playing, a poster column; and high on
  // the same wall, the street's name on a plate, as streets have, because the
  // street has a name and it is not ours.
  var KERB_L = -(ROAD + 0.2), WALL_L = -(FRONT - 0.52);
  var FURNITURE = {
    board: { z: 1.7, stand: { x: -2.2, z: 1.7 } },
    brass: { z: 8.6, stand: { x: -2.6, z: 8.6 } },
    column: { z: -1.1, stand: { x: -1.4, z: -1.1 } },
    name: { z: 6.2, stand: { x: -1.2, z: 6.2, pitch: 0.42 } }
  };
  function furnish(d, i) {
    var shop = new THREE.Color(d.ground), mat = toonColor(shop), key = 'c' + shop.getHexString();
    var z = FURNITURE[d.kind].z, face = Math.PI / 2;
    taken.push({ x: d.kind === 'column' ? KERB_L - 0.75 : WALL_L + 0.6, z: z, r: 1.4 });
    function own(w, h, dd) { var b = BOX.clone(); b.scale(w, h, dd); return b; }
    if (d.kind === 'board') {
      var g = at(WALL_L + 0.7, 0, z, face);
      function on(x, y, zz) { return new THREE.Matrix4().multiplyMatrices(g, at(x, y, zz)); }
      [-0.8, 0.8].forEach(function (x) { box(0.08, 1.0, 0.08, on(x, 0.5, 0), '--cel-frame', 0.02); });
      piece(own(1.9, 1.15, 0.18), on(0, 1.55, 0), mat, key);
      box(1.7, 0.95, 0.02, on(0, 1.55, 0.1), '--cel-glass', false, false);
      signboard(d, 1.6, 0.3, on(0, 1.86, 0.115));
      hitbox(i, 2, 2.2, 0.6, on(0, 1.1, 0));
    } else if (d.kind === 'brass') {
      var b = at(WALL_L, 0, z, face);
      piece(own(1.8, 1.05, 0.06), new THREE.Matrix4().multiplyMatrices(b, at(0, 1.55, 0.03)), mat, key);
      signboard(d, 1.6, 0.28, new THREE.Matrix4().multiplyMatrices(b, at(0, 1.8, 0.065)));
      [[-0.78, 2.0], [0.78, 2.0], [-0.78, 1.1], [0.78, 1.1]].forEach(function (p) {
        cyl(0.035, 0.035, 0.03, new THREE.Matrix4().multiplyMatrices(b, at(p[0], p[1], 0.07, 0, Math.PI / 2)), '--cel-frame', false, 8);
      });
      hitbox(i, 1.9, 1.2, 0.3, new THREE.Matrix4().multiplyMatrices(b, at(0, 1.55, 0.1)));
    } else if (d.kind === 'column') {
      var cx = KERB_L - 0.75;
      piece(new THREE.CylinderGeometry(0.55, 0.55, 2.7, 20), at(cx, 1.45, z), mat, key);
      cyl(0.62, 0.62, 0.12, at(cx, 0.06, z), '--cel-frame', 0.02, 20);
      cyl(0.66, 0.5, 0.3, at(cx, 2.95, z), '--cel-frame', 0.02, 20);
      cyl(0.08, 0.2, 0.3, at(cx, 3.25, z), '--cel-frame', 0.02, 10);
      signboard(d, 1.0, 0.3, at(cx + 0.56, 2.35, z, face));
      hitbox(i, 1.2, 3.4, 1.2, at(cx, 1.7, z));
    } else if (d.kind === 'name') {
      var plate = { name: d.name.toUpperCase(), ground: css('--cel-paint'), ink: css('--cel-print'), face: d.face, weight: d.weight };
      var n = at(WALL_L, 0, z, face);
      box(2.6, 0.62, 0.05, new THREE.Matrix4().multiplyMatrices(n, at(0, 3.6, 0.025)), '--cel-sign-red', 0.02);
      signboard(plate, 2.44, 0.48, new THREE.Matrix4().multiplyMatrices(n, at(0, 3.6, 0.055)));
      hitbox(i, 2.6, 0.7, 0.3, new THREE.Matrix4().multiplyMatrices(n, at(0, 3.6, 0.1)));
    }
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
        for (var nudge = 0; nudge < 12 && !clearOfDoor(s, zz, 2.4); nudge++) zz -= 0.6;
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
        taken.push({ x: x, z: zz, r: 0.6 });
        // A basket of flowers hung on the pole, on the road side.
        var hb = at(x - s * 0.42, 3.3, zz);
        box(0.36, 0.05, 0.05, at(x - s * 0.21, 3.75, zz), '--cel-frame', false);
        cyl(0.26, 0.18, 0.24, hb, '--cel-trunk', 0.02, 10);
        var hang = BUSH.clone(); hang.scale(0.3, 0.2, 0.3);
        piece(hang, new THREE.Matrix4().multiplyMatrices(hb, at(0, 0.16, 0)), toon('--cel-leaf'), '--cel-leaf', 0.02);
        flowers(new THREE.Matrix4().multiplyMatrices(hb, at(0, 0.24, 0)), 0.5, 0.5, 'hb' + zz + s, 7);
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
    dannySays(tops);
    // Across the road, every other pole.
    for (var i = 0; i < tops['-1'].length && i < tops['1'].length; i += 2) {
      var a = tops['-1'][i], b = tops['1'][i];
      wire(new THREE.Vector3(a.x + 0.85, 9.55, a.z), new THREE.Vector3(b.x - 0.85, 9.55, b.z), 0.9);
      wire(new THREE.Vector3(a.x + 0.5, 8.4, a.z), new THREE.Vector3(b.x - 0.5, 8.4, b.z), 1.1, 0.035);
    }
  }

  function tree(x, z, r) {
    taken.push({ x: x, z: z, r: 1.7 });
    cyl(0.16, 0.24, 3.2, at(x, 1.85, z), '--cel-trunk', 0.03, 8);
    var leaf = new THREE.IcosahedronGeometry(1, 1);
    [[0, 3.9, 0, 1.5], [0.8, 3.4, 0.4, 1.1], [-0.7, 3.5, -0.3, 1.15], [0.1, 4.7, -0.2, 1.05]].forEach(function (b, k) {
      var g = leaf.clone(); g.scale(b[3] * r, b[3] * r * 0.9, b[3] * r);
      piece(g, at(x + b[0], b[1], z + b[2], k), toon('--cel-leaf'), '--cel-leaf', 0.06);
    });
  }

  function signpost(x, z, faceTex, red) {
    taken.push({ x: x, z: z, r: 0.7 });
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
    taken.push({ x: x, z: z, r: 1.0 });
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
    taken.push({ x: x, z: z, r: 1.0 });
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
    taken.push({ x: x, z: z, r: 0.6 });
    cyl(0.05, 0.05, 3.2, at(x, 1.85, z), '--cel-wall-2', 0.02, 6);
    put(new THREE.Mesh(new THREE.CircleGeometry(0.4, 28), new THREE.MeshToonMaterial({ map: windowTex, gradientMap: gradient })), at(x, 3.45, z, s < 0 ? 0.6 : -0.6));
    cyl(0.45, 0.45, 0.06, at(x, 3.45, z, s < 0 ? 0.6 : -0.6, Math.PI / 2), '--cel-wall-2', 0.02, 28);
  }

  // THE STREET AS SOMEWHERE PEOPLE LIVE: benches facing the shops with a bin
  // beside them, lamp posts down the kerbs, planters of flowers, bollards at
  // the crossings and a post box near the stoop, each put only where nothing
  // else already stands. None of it lights up or moves: the sun is out.
  var taken = [];
  // Where the shops' middles are, side by side, so nothing tall is put in
  // front of one: the poles, the street trees, the parked cars, the lamps.
  var doorsNow = [];
  function clearOfDoor(sd, z, half) { return doorsNow.every(function (p) { return p.side !== sd || Math.abs(p.z - z) > (half || 2.6); }); }
  function free(x, z, r) { return taken.every(function (t) { return Math.hypot(t.x - x, t.z - z) > t.r + r; }); }
  function bench(x, z, s) {
    var m = at(x, 0.25, z, s < 0 ? Math.PI / 2 : -Math.PI / 2);
    function on(a, y, b) { return new THREE.Matrix4().multiplyMatrices(m, at(a, y, b)); }
    [-0.14, 0, 0.14].forEach(function (o) { box(1.7, 0.05, 0.12, on(0, 0.45, o), '--cel-trunk', 0.015); });
    [0.62, 0.8].forEach(function (y) { box(1.7, 0.12, 0.05, on(0, y, -0.2), '--cel-trunk', 0.015); });
    [-0.75, 0.75].forEach(function (a) { box(0.06, 0.45, 0.42, on(a, 0.22, 0), '--cel-ink', false); box(0.06, 0.5, 0.05, on(a, 0.68, -0.22), '--cel-ink', false); });
    taken.push({ x: x, z: z, r: 1.0 });
  }
  function bin(x, z) {
    cyl(0.26, 0.22, 0.8, at(x, 0.65, z), '--cel-leaf', 0.02, 12);
    cyl(0.28, 0.28, 0.08, at(x, 1.07, z), '--cel-ink', false, 12);
    taken.push({ x: x, z: z, r: 0.4 });
  }
  function lamp(x, z, s) {
    cyl(0.07, 0.1, 4.6, at(x, 2.55, z), '--cel-panel', 0.02, 8);
    box(0.9, 0.06, 0.06, at(x - s * 0.42, 4.8, z), '--cel-panel', 0.015);
    box(0.5, 0.16, 0.3, at(x - s * 0.82, 4.72, z), '--cel-panel', 0.02);
    box(0.4, 0.03, 0.22, at(x - s * 0.82, 4.63, z), '--cel-glint', false, false);
    taken.push({ x: x, z: z, r: 0.5 });
  }
  // A DRINKING FOUNTAIN at the kerb: two basins, one low enough to roll under
  // in a wheelchair and one for standing, a spout for filling a bottle, and a
  // bowl at its foot for a dog. Free, like everything on the street.
  function fountain(x, z, s) {
    var m = at(x, 0.25, z, s < 0 ? Math.PI / 2 : -Math.PI / 2);
    function on(a, y, b, ry) { return new THREE.Matrix4().multiplyMatrices(m, at(a, y, b, ry || 0)); }
    box(0.34, 1.05, 0.34, on(-0.32, 0.52, -0.1), '--cel-sign-blue', 0.03);
    box(0.3, 0.86, 0.3, on(0.34, 0.43, -0.1), '--cel-sign-blue', 0.03);
    cyl(0.26, 0.18, 0.12, on(-0.32, 1.1, 0.12), '--cel-frame', 0.02, 14);
    cyl(0.24, 0.17, 0.11, on(0.38, 0.88, 0.14), '--cel-frame', 0.02, 14);
    cyl(0.19, 0.19, 0.02, on(-0.32, 1.15, 0.12), '--cel-glint', false, 14);
    cyl(0.17, 0.17, 0.02, on(0.38, 0.93, 0.14), '--cel-glint', false, 14);
    box(0.04, 0.12, 0.04, on(-0.32, 1.2, 0.0), '--cel-frame', false);
    box(0.04, 0.1, 0.04, on(0.38, 0.97, 0.03), '--cel-frame', false);
    // The bottle filler on the tall one's back, and the dog's bowl.
    box(0.2, 0.36, 0.08, on(-0.32, 1.42, -0.22), '--cel-sign-blue', 0.02);
    box(0.06, 0.06, 0.1, on(-0.32, 1.5, -0.15), '--cel-frame', false);
    cyl(0.16, 0.12, 0.08, on(0.05, 0.04, 0.32), '--cel-frame', 0.015, 12);
    cyl(0.12, 0.12, 0.01, on(0.05, 0.085, 0.32), '--cel-glint', false, 12);
    taken.push({ x: x, z: z, r: 0.8 });
  }
  function bollard(x, z) {
    cyl(0.1, 0.1, 0.9, at(x, 0.7, z), '--cel-ink', false, 10);
    cyl(0.105, 0.105, 0.1, at(x, 0.95, z), '--cel-paint', false, 10);
    taken.push({ x: x, z: z, r: 0.3 });
  }
  function postbox(x, z) {
    cyl(0.32, 0.32, 1.35, at(x, 0.93, z), '--cel-sign-red', 0.03, 16);
    cyl(0.36, 0.36, 0.12, at(x, 1.64, z), '--cel-sign-red', 0.02, 16);
    box(0.36, 0.05, 0.04, at(x - 0.31, 1.3, z, Math.PI / 2), '--cel-ink', false);
    taken.push({ x: x, z: z, r: 0.5 });
  }
  function livable(zEnd, crossings, lotsFrom, placed) {
    var last = Math.max(-zEnd + 3, lotsFrom);
    // Nothing tall stands in front of the middle of a shop, where you stand
    // to read its sign.
    function clearOf(sd, z) { return clearOfDoor(sd, z, 2.6); }
    crossings.forEach(function (c) {
      [-1, 1].forEach(function (s) { [-2.1, -1.2, 1.2, 2.1].forEach(function (o) { if (free(s * (ROAD + 0.3), c + o, 0.3)) bollard(s * (ROAD + 0.3), c + o); }); });
    });
    if (free(ROAD + 0.75, -4.4, 0.5)) postbox(ROAD + 0.75, -4.4);
    for (var z = -7, k = 0; z > last; z -= 13, k++) {
      var s = k % 2 ? 1 : -1, x = s * (ROAD + 0.35);
      if (free(x, z, 0.5) && clearOf(s, z)) lamp(x, z, s);
    }
    // Fountains first, so a bench never takes a fountain's place.
    for (z = -21, k = 0; z > last; z -= 37, k++) {
      s = k % 2 ? 1 : -1;
      var fx = s * (ROAD + 0.62);
      for (var t = 0; t < 6 && !free(fx, z, 0.8); t++) z -= 1.3;
      if (free(fx, z, 0.8)) fountain(fx, z, s);
    }
    // Benches all the way down both sides, somewhere to sit every few doors,
    // with a bin beside every other one. They are lower than any shop's
    // window, so they may stand at the kerb in front of one; the tall things
    // may not.
    for (z = -10, k = 0; z > last; z -= 6, k++) {
      s = k % 2 ? -1 : 1;
      var bx = s * (ROAD + 0.85);
      if (!free(bx, z, 1.0)) continue;
      bench(bx, z, s);
      if (k % 4 < 2 && free(bx, z - 1.4, 0.4)) bin(bx, z - 1.4);
    }
    for (z = -3, k = 0; z > last; z -= 17, k++) {
      s = k % 2 ? 1 : -1;
      var px = s * (ROAD + 0.5);
      if (free(px, z, 0.6)) { planter(at(px, 0.25, z, Math.PI / 2), 'kerb' + z, 1.0); taken.push({ x: px, z: z, r: 0.6 }); }
    }
  }

  // DANNY THE STREET SAYS SO. In the comics and on television the street
  // talks by changing its own signs; these are banners strung across the
  // road between the poles, every few, with words of ours in Danny's manner,
  // never a line of DC's. They are written by tools/make-cel-street.py out of
  // data/danny-says.json between the cel:danny markers, never by hand, and
  // the same words are a list on the page for anybody the picture does not
  // reach. Danny is they.
  // cel:danny:begin
  var DANNY_SAYS = ["DANNY IS GLAD YOU CAME", "STAY AS LONG AS YOU LIKE", "NOBODY HERE NEEDS EXPLAINING", "COME AS YOU ARE. DANNY DID", "LOUD OR QUIET, DANNY LIKES YOU", "THERE IS ALWAYS A BENCH", "DANNY THINKS YOUR STIMS ARE LOVELY", "QUEER WITHOUT FEAR, SAYS DANNY", "DANNY KEEPS NO RECORD OF YOU", "LOST? DANNY WILL FIND YOU A DOOR", "REST HERE. DANNY IS IN NO HURRY", "ALL OF YOU IS WELCOME ON DANNY"];
  // cel:danny:end
  var DANNY_GROUNDS = [['--cel-sign-yellow', '--cel-print'], ['--cel-cloud', '--cel-sign-red'], ['--cel-sign-blue', '--cel-cloud'], ['--cel-paint', '--cel-print']];
  function dannySays(tops) {
    if (!DANNY_SAYS.length) return;
    var n = 0;
    for (var i = 1; i < tops['-1'].length && i < tops['1'].length; i += 2) {
      var a = tops['-1'][i], b = tops['1'][i];
      var said = DANNY_SAYS[n % DANNY_SAYS.length], pair = DANNY_GROUNDS[n % DANNY_GROUNDS.length];
      n++;
      var dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz), w = len * 0.72, h = 1.0;
      var mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2, turn = -Math.atan2(dz, dx);
      var face = tex(1024, Math.round(1024 * h / w), function (c, cw, ch) {
        c.fillStyle = css(pair[0]); c.fillRect(0, 0, cw, ch);
        c.strokeStyle = css(pair[1]); c.lineWidth = 8; c.strokeRect(10, 10, cw - 20, ch - 20);
        c.fillStyle = css(pair[1]); c.textAlign = 'center'; c.textBaseline = 'middle';
        var size = Math.round(ch * 0.42);
        do { c.font = size + 'px "Rammetto One"'; size -= 2; } while (c.measureText(said).width > cw - 70 && size > 18);
        c.fillText(said, cw / 2, ch / 2 + 2);
      });
      [0, Math.PI].forEach(function (back) {
        var m = at(mx, 6.1, mz, turn + back);
        put(new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: face, fog: true })), new THREE.Matrix4().multiplyMatrices(m, at(0, 0, 0.012)));
      });
      box(w + 0.06, h + 0.06, 0.02, at(mx, 6.1, mz, turn), '--cel-ink', false);
      // The cords from its corners to the poles.
      [[a, -1], [b, 1]].forEach(function (end) {
        var cx = mx + Math.cos(-turn) * end[1] * w / 2, cz = mz + Math.sin(-turn) * end[1] * w / 2;
        wire(new THREE.Vector3(cx, 6.55, cz), new THREE.Vector3(end[0].x, 6.9, end[0].z), 0.05, 0.02);
        wire(new THREE.Vector3(cx, 5.65, cz), new THREE.Vector3(end[0].x, 5.6, end[0].z), 0.05, 0.02);
      });
    }
  }

  // Far blocks past the end of the street, and hills in the haze behind.
  function beyond(zEnd, open, gap) {
    for (var i = 0; i < 9; i++) {
      var r = hash('far' + i), w = 10 + r * 10, h = 12 + hash('h' + i) * 18;
      if (gap && Math.abs(-38 + i * 9.5) < 9) continue;
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
    // In a headset you stand on the floor and the headset says where your
    // head is: what moves is where your feet stand and which way they face.
    if (xrOn) { dolly.position.set(me.x, (up ? ROOF - EYE : 0) - xrSeat, me.z); dolly.rotation.set(0, me.yaw, 0); dolly.updateMatrixWorld(true); }
    else {
      camera.position.set(me.x, (up ? ROOF : EYE) - xrSeat, me.z);
      camera.rotation.set(me.pitch, me.yaw, 0, 'YXZ');
      camera.updateMatrixWorld(true);
    }
    carry(); ears();
    skyGroup.position.set(me.x, 0, me.z - 6);
    sun.position.set(me.x + SUN.x, SUN.y, me.z + SUN.z);
    sun.target.position.set(me.x, 0, me.z - 12);
    sun.target.updateMatrixWorld();
    for (var i = 0; i < far.length; i++) far[i].o.visible = !far[i].o.userData.hidden && Math.abs(far[i].z - me.z) < VIEW + CHUNK / 2;
  }
  // A THING YOU CAN PICK UP (kit.hold, Helen's headset round): pressed, it
  // comes to your hand in a headset, or to just in front of you on a screen,
  // and pressed again it goes back where it came from, so nothing is ever
  // left floating. Carried every frame from where your hand or your eyes are.
  var HOLD = new THREE.Matrix4().makeTranslation(0, -0.12, -0.45), HOLD_VR = new THREE.Matrix4().makeTranslation(0, 0, -0.12);
  function carry() {
    var hs = scene.userData.holds || [];
    for (var i = 0; i < hs.length; i++) {
      var h = hs[i].userData.hold;
      if (!h || !h.by) continue;
      if (h.by === 'screen') hs[i].matrix.copy(camera.matrixWorld).multiply(HOLD);
      else hs[i].matrix.copy(h.by.matrixWorld).multiply(HOLD_VR);
      hs[i].matrixWorldNeedsUpdate = true;
    }
  }
  function holdToggle(mesh, by) {
    var h = mesh.userData.hold;
    if (h.by) { h.by = null; mesh.matrix.copy(h.home); mesh.matrixWorldNeedsUpdate = true; ctlSay((h.say || 'It') + ' goes back where it was.'); }
    else {
      // One thing in a hand at a time: whatever that hand held goes home.
      (scene.userData.holds || []).forEach(function (o) { var oh = o.userData.hold; if (oh.by === by) { oh.by = null; o.matrix.copy(oh.home); o.matrixWorldNeedsUpdate = true; } });
      h.by = by; ctlSay('You pick up ' + (h.say || 'it') + '; press it again to put it back, or press something to use it on.');
    }
    draw();
  }
  function heldBy(by) {
    var hs = scene.userData.holds || [];
    for (var i = 0; i < hs.length; i++) if (hs[i].userData.hold.by === by) return hs[i];
    return null;
  }
  function heldNow() {
    var hs = scene.userData.holds || [];
    for (var i = 0; i < hs.length; i++) if (hs[i].userData.hold.by) return hs[i];
    return null;
  }
  // A held thing put somewhere (kit.place): take() says what happened and
  // stands the thing where it now is, or refuses with false.
  function putOn(target, by) {
    var held = heldBy(by);
    if (!held || !target.userData.take) return false;
    var words = target.userData.take(held, held.userData.hold.say);
    if (words === false) return false;
    held.userData.hold.by = null; held.matrixWorldNeedsUpdate = true;
    ctlSay(typeof words === 'string' ? words : 'Done.');
    draw();
    return true;
  }
  // A SOUND WITH A PLACE (kit.spatial): a room's own sound, made by its page's
  // script (the Reading Room's crackle, the yurt's bell), is heard from where
  // its thing stands, through a panner between the script's output and the
  // speakers, with your ears where your head is, every frame. The script
  // hands over its output only once it has made its sound, so each is asked
  // for until it answers. Nothing is fetched; it is the same arithmetic.
  var EAR = new THREE.Vector3(), EAR_F = new THREE.Vector3(), EAR_Q = new THREE.Quaternion();
  function ears() {
    var ss = scene.userData.spatials || [];
    if (!ss.length) return;
    if (xrOn) { camera.getWorldPosition(EAR); camera.getWorldQuaternion(EAR_Q); EAR_F.set(0, 0, -1).applyQuaternion(EAR_Q); }
    else { EAR.set(me.x, EYE - xrSeat, me.z); EAR_F.set(-Math.sin(me.yaw) * Math.cos(me.pitch), Math.sin(me.pitch), -Math.cos(me.yaw) * Math.cos(me.pitch)); }
    for (var i = 0; i < ss.length; i++) {
      var sp = ss[i];
      if (!sp.panner) {
        var o = null;
        try { o = sp.get(); } catch (e) { o = null; }
        if (!o || !o.ctx || !o.node) continue;
        try {
          var pn = o.ctx.createPanner();
          pn.panningModel = 'HRTF'; pn.distanceModel = 'inverse'; pn.refDistance = 1; pn.maxDistance = 30; pn.rolloffFactor = 1;
          if (pn.positionX) { pn.positionX.value = sp.pos.x; pn.positionY.value = sp.pos.y; pn.positionZ.value = sp.pos.z; }
          else pn.setPosition(sp.pos.x, sp.pos.y, sp.pos.z);
          o.node.disconnect(); o.node.connect(pn); pn.connect(o.ctx.destination);
          sp.panner = pn; sp.ctx = o.ctx;
        } catch (e) { continue; }
      }
      var l = sp.ctx.listener;
      try {
        if (l.positionX) {
          l.positionX.value = EAR.x; l.positionY.value = EAR.y; l.positionZ.value = EAR.z;
          l.forwardX.value = EAR_F.x; l.forwardY.value = EAR_F.y; l.forwardZ.value = EAR_F.z;
          l.upX.value = 0; l.upY.value = 1; l.upZ.value = 0;
        } else { l.setPosition(EAR.x, EAR.y, EAR.z); l.setOrientation(EAR_F.x, EAR_F.y, EAR_F.z, 0, 1, 0); }
      } catch (e) { /* an old browser */ }
    }
  }
  // Each place read aloud as you arrive, in a headset only, where the words
  // under the stage cannot be read; the panel switches it off.
  function voice(words) {
    if (!xrOn || !xrVoice || !('speechSynthesis' in window)) return;
    try { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(words)); } catch (e) { /* no voice here */ }
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
  // In a headset the headset asks for every picture itself (xrFrame), so a
  // change only moves you; the next picture it asks for shows it.
  function draw() { place(); if (xrOn) return; if (travel) { travelDraw(); return; } zones(); renderer.render(scene, camera); css3d.render(scene, camera); }
  function soon() { if (!frame) frame = requestAnimationFrame(tick); }

  /* ── Through a portal: a swirl of the Milky Way ──────────────────────── */
  // Helen Edgar's ask, 2026-11-12: going through any portal of her yurt is a
  // travel down a spiral tunnel of space, real pictures and a slow swirl. A
  // room says `tunnel: { walls, end }`, two photographs off its own page (the
  // yurt's are the Milky Way behind her Music Room's doors and the Whirlpool
  // Galaxy behind her Cinema's, credited there and on this page): the walls
  // are wrapped round a tube you look down, twice over at two depths so the
  // stars part as you go, and the galaxy turns at the far end and comes to
  // meet you. Nothing is drawn over either picture. It plays only on a press
  // (Walk into, Back out, a place in the headset) between that room and a room
  // off it, for TRAVEL seconds; the tube swirls at SWIRL and the galaxy turns
  // at TURN_GALAXY, both radians a second and both far slower than TURN_MIN
  // allows; at Gentle the picture stands still for TRAVEL_STILL seconds and
  // nothing swirls; in a low-stimulation mode, or a hidden tab, there is no
  // travel at all, you are simply there. It comes up and goes over FADE
  // seconds each way, so nothing flashes. tools/make-cel-street.py holds the
  // turns and the fade.
  var TRAVEL = 3.4, TRAVEL_STILL = 1.2, SWIRL = 0.11, TURN_GALAXY = 0.09, FADE = 0.5, TRAVEL_MOST = 12;
  var travel = null, tunnelScene = null, tunnel = null;
  function tunnelMake(spec) {
    var key = spec.walls + '|' + spec.end;
    if (tunnel && tunnel.key === key) return tunnel;
    var loader = new THREE.TextureLoader();
    // The walls are the sky alone: a room says how much of its photograph is
    // sky (`sky`, a fraction from the top), and the ground below the horizon
    // is left off the tube, because a tunnel of space has no desert in it.
    // That is a crop and nothing else; no pixel of the sky is changed.
    function pic(file, rx, ry, sky) {
      var t = loader.load(file, function (tex) {
        if (sky && sky < 1 && tex.image) {
          var im = tex.image, c = document.createElement('canvas');
          c.width = im.width; c.height = Math.round(im.height * sky);
          c.getContext('2d').drawImage(im, 0, 0, im.width, c.height, 0, 0, c.width, c.height);
          tex.image = c;
        }
        tex.needsUpdate = true;
        if (travel) soon();
      });
      t.colorSpace = THREE.SRGBColorSpace;
      if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); }
      return t;
    }
    tunnelScene = new THREE.Scene();
    tunnelScene.background = col('--cel-ink');
    var rig = new THREE.Group();
    var tube = new THREE.CylinderGeometry(1, 1, 90, 48, 1, true);
    tube.rotateX(Math.PI / 2);
    var outer = new THREE.Mesh(tube, new THREE.MeshBasicMaterial({ map: pic(spec.walls, 5, 10, spec.sky), side: THREE.BackSide, transparent: true, opacity: 0 }));
    outer.scale.set(2.6, 2.6, 1); outer.position.z = -34;
    var inner = new THREE.Mesh(tube, new THREE.MeshBasicMaterial({ map: pic(spec.walls, 3, 7, spec.sky), side: THREE.BackSide, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    inner.scale.set(1.7, 1.7, 1); inner.position.z = -34; inner.rotation.z = 1.3;
    // The far end is closed with the same sky, so there is no hole of black
    // past the galaxy, and the galaxy stands in front of it, big enough to
    // fill the tube by the time it reaches you.
    var sky = new THREE.Mesh(new THREE.CircleGeometry(2.7, 64), new THREE.MeshBasicMaterial({ map: pic(spec.walls, 1.4, 1.4, spec.sky), transparent: true, opacity: 0 }));
    sky.position.z = -78;
    var galaxy = new THREE.Mesh(new THREE.CircleGeometry(4.8, 64), new THREE.MeshBasicMaterial({ map: pic(spec.end), transparent: true, opacity: 0 }));
    galaxy.position.z = -44;
    rig.add(outer, inner, sky, galaxy);
    tunnelScene.add(rig);
    tunnel = { key: key, rig: rig, outer: outer, inner: inner, sky: sky, galaxy: galaxy };
    return tunnel;
  }
  function travelStart(spec) {
    if (!spec || document.documentElement.hasAttribute('data-low') || (document.hidden && !xrOn)) return;
    if (travel) { travel.arrived = false; return; }
    var gentle = document.documentElement.getAttribute('data-intensity') === 'gentle';
    travel = { t: 0, began: performance.now(), len: gentle ? TRAVEL_STILL : TRAVEL, swirl: !gentle, arrived: false };
    var t = tunnelMake(spec), v = new THREE.Vector3();
    if (xrOn) dolly.updateMatrixWorld(true); else camera.updateMatrixWorld(true);
    camera.getWorldDirection(v);
    t.rig.rotation.set(0, Math.atan2(-v.x, -v.z), 0);
    t.galaxy.position.z = -44; t.galaxy.scale.set(1, 1, 1);
    css3d.domElement.style.visibility = 'hidden';
    soon();
  }
  function travelStep(dt, now) {
    var t = tunnel, tr = travel;
    // Its length is the clock's, so a slow frame never draws it out.
    tr.t = (now - tr.began) / 1000;
    var fade = Math.max(0, Math.min(1, tr.t / FADE, (tr.len - tr.t) / FADE));
    t.outer.material.opacity = fade; t.inner.material.opacity = fade * 0.55; t.galaxy.material.opacity = fade; t.sky.material.opacity = fade;
    if (tr.swirl) {
      var on = Math.min(1, tr.t / tr.len);
      t.outer.material.map.offset.y -= dt * 0.22;
      t.inner.material.map.offset.y -= dt * 0.34;
      t.outer.rotation.z += SWIRL * dt;
      t.inner.rotation.z -= SWIRL * 0.6 * dt;
      t.galaxy.rotation.z += TURN_GALAXY * dt;
      t.galaxy.position.z = -44 + 30 * on;
      t.galaxy.scale.setScalar(1 + 0.5 * on);
      t.sky.rotation.z -= SWIRL * 0.3 * dt;
    }
    if (tr.t >= tr.len && (tr.arrived || tr.t > TRAVEL_MOST)) {
      travel = null;
      css3d.domElement.style.visibility = '';
      draw();
    }
  }
  function travelDraw() {
    var v = new THREE.Vector3();
    if (xrOn) dolly.updateMatrixWorld(true); else camera.updateMatrixWorld(true);
    camera.getWorldPosition(v);
    tunnel.rig.position.copy(v);
    renderer.render(tunnelScene, camera);
  }

  /* ── What a room lets move, and only when somebody asks ──────────────── */
  // Ryan, 2026-11-04, for the Faery Yurt and the rooms off it: candles that
  // flicker, a record that turns, fairy lights that twinkle. That reverses
  // "nothing on Cel Street moves by itself" for exactly what a room hands the
  // kit (flames, turn, lights, and drift and rise since 2026-11-11) and nothing else, and only as the candles behind
  // the door marked E move (candles.js): by itself at MAX only where the room
  // says its own page moves that thing at MAX (max: true), and at any setting
  // once somebody presses its switch, which the dial does not undo. Never in a
  // low-stimulation mode and never in a hidden tab. And never a flash: a flame
  // dims by a tenth of itself at most (DIM), out of wobbles none faster than
  // HZ's last; a bulb takes TWINKLE seconds to go down to TWINKLE_LOW and up
  // again; a thing that turns takes TURN_MIN seconds at least to go round.
  // tools/make-cel-street.py reads these and refuses them past those lines.
  var DIM = 0.1, HZ = [0.6, 1.1, 1.7, 2.5], TWINKLE = 3.4, TWINKLE_LOW = 0.38, TURN_MIN = 1.8;
  var moveFrame = 0, moveWas = 0;
  function moveOn(mv) {
    // A headset's page can read as hidden while the headset shows the room.
    if (document.documentElement.hasAttribute('data-low') || (document.hidden && !xrOn)) return false;
    return mv.asked === null ? !!mv.max && document.documentElement.getAttribute('data-intensity') === 'max' : mv.asked;
  }
  function stepMoves(now) {
    var mvs = scene.userData.moves || [], any = false, s = now / 1000, dt = moveWas ? Math.min(s - moveWas, 0.1) : 0;
    moveWas = s;
    for (var i = 0; i < mvs.length; i++) {
      if (moveOn(mvs[i])) { any = true; mvs[i].step(s, dt); mvs[i].still = false; }
      else if (!mvs[i].still) { mvs[i].rest(); mvs[i].still = true; }
    }
    if (!any) moveWas = 0;
    return any;
  }
  function moveTick(now) {
    moveFrame = 0;
    var any = stepMoves(now);
    draw();
    if (any && !xrOn) moveFrame = requestAnimationFrame(moveTick);
  }
  function moves() {
    ctlSync();
    // In a headset, what moves is stepped in the headset's own frames.
    if (scene.userData.moves && !moveFrame && !xrOn) moveFrame = requestAnimationFrame(moveTick);
  }
  new MutationObserver(moves).observe(document.documentElement, { attributes: true, attributeFilter: ['data-intensity', 'data-low'] });
  document.addEventListener('visibilitychange', moves);

  // A ROOM'S OWN SWITCHES go under the line that says where you are: its
  // lights, its candles, its record, and the things in it to press, each
  // saying what it did in words. A switch at a place is also in that line
  // while you stand there, and a thing to press can be pressed in the scene.
  var ctlEl = document.querySelector('[data-cel-roomctl]');
  var ctlList = document.querySelector('[data-cel-roomctl-list]');
  var ctlSaid = document.querySelector('[data-cel-roomctl-said]');
  function ctlSay(words) {
    if (words) vrTell(words);
    if (!ctlSaid || !words) return;
    // Said again even when it is the same sentence: emptied, and set on the
    // next frame, so a screen reader hears a repeat as a change.
    ctlSaid.textContent = '';
    requestAnimationFrame(function () { ctlSaid.textContent = words; });
  }
  function roomCtl() {
    if (!ctlEl) return;
    while (ctlList.firstChild) ctlList.removeChild(ctlList.firstChild);
    var cs = inside ? scene.userData.ctl || [] : [];
    ctlEl.hidden = !cs.length;
    cs.forEach(function (c) { ctlList.appendChild(c.make(false)); });
    if (ctlSaid) ctlSaid.textContent = '';
    ctlSync();
  }
  function ctlSync() { (scene.userData.ctl || []).forEach(function (c) { c.sync(); }); }
  function ctlButton(words, here, fn) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = here ? 'cel-walkin' : 'cel-act';
    b.textContent = words;
    b.addEventListener('click', fn);
    return b;
  }
  // A row of buttons, one pressed, under its name.
  // here: in the line that says where you are. named: with its name over it.
  function ctlRow(label, choices, cur, pick, here, named) {
    var g = document.createElement('div');
    g.className = 'cel-roomctl__row'; g.setAttribute('role', 'group'); g.setAttribute('aria-label', label);
    if (named) { var p = document.createElement('p'); p.className = 'cel-roomctl__name'; p.textContent = label; g.appendChild(p); }
    choices.forEach(function (w, i) {
      var b = ctlButton(w, here, function () { pick(i); });
      b.setAttribute('aria-pressed', i === cur() ? 'true' : 'false');
      b.setAttribute('data-choice', i);
      g.appendChild(b);
    });
    return g;
  }
  function syncRows(els, cur) {
    els.forEach(function (g) {
      g.querySelectorAll('[data-choice]').forEach(function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-choice') === cur ? 'true' : 'false'); });
    });
  }
  function live(els) { return els.filter(function (e) { return e.isConnected; }); }

  function nearest() {
    if (up) return null;
    var best = null, bd = 1e9, p = xrOn ? headWorld() : me;
    stops.forEach(function (s) {
      var d = Math.hypot(s.x - p.x, s.z - p.z) + Math.abs(angle(s.yaw - p.yaw)) * 2;
      if (d < bd) { bd = d; best = s; }
    });
    return bd < 3.2 ? best : null;
  }
  function angle(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }

  function plateUp() {
    var where = inside ? inside.name : 'Cel Street';
    if (plateEl) { plateEl.textContent = where; plateEl.hidden = false; }
    document.title = inside ? inside.name + ' \u00b7 ' + titleWas : titleWas;
  }

  var said = '';
  function tell() {
    spotTell();
    if (!hereEl) return;
    var s = nearest();
    var words = inside
      ? (s ? inside.name + ': ' + (s.where || s.name) + '.' : 'In ' + inside.name + '.')
      : up ? 'Up over the roofs, looking down on the solar panels.' : s ? 'In front of ' + s.name + '.' : 'Out on Cel Street, in the sun.';
    if (words === said) return;
    said = words;
    voice(s ? (s.where || s.name) : words);
    if (xrOn) vrPanel();
    hereEl.textContent = words + ' ';
    if (s && ROOMS[s.page] && !(inside && s.page === inside.page)) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'cel-walkin';
      b.textContent = 'Walk into ' + (s.room || s.name);
      b.addEventListener('click', function () { enter(s.page); });
      hereEl.appendChild(b);
      hereEl.appendChild(document.createTextNode(' '));
    }
    // What there is to do where you stand: the room's own switches at this place.
    if (s && s.acts) s.acts.forEach(function (c) { hereEl.appendChild(c.make(true)); hereEl.appendChild(document.createTextNode(' ')); });
    if (s && s.page) {
      var a = document.createElement('a');
      a.href = s.page;
      a.textContent = inside && s.page === inside.page ? 'Open the room\u2019s page \u2192' : ROOMS[s.page] ? 'or open its page \u2192' : 'Go into ' + (s.room || s.name) + ' \u2192';
      hereEl.appendChild(a);
    }
  }

  /* ── Walking into a room, and out again ───────────────────────────────── */
  // A room can open off another (the campgrounds' pitches), so what you came
  // in from is a stack: Back out takes you one room back, and the street is
  // at the bottom of it.
  var inside = null, behind = [];
  function kit(page, name) {
    var home = scene;
    function addCtl(c) { (home.userData.ctl = home.userData.ctl || []).push(c); return c; }
    function addMove(mv) { mv.asked = null; mv.still = true; (home.userData.moves = home.userData.moves || []).push(mv); return mv; }
    // The switch for something that moves, pressed while it is moving.
    function moveSwitch(mv, words, said) {
      var sw = { els: [], mv: mv };
      // Pressed as a button, or in the scene where the room puts a kit.touch
      // (o.at on flames, turn and lights).
      sw.go = function () {
        mv.asked = !moveOn(mv);
        moves();
        ctlSay(document.documentElement.hasAttribute('data-low') && mv.asked
          ? 'Nothing moves while a low-stimulation mode is on; it will when the mode is off.'
          : said(mv.asked));
      };
      sw.make = function (here) {
        var b = ctlButton(words, here, function () { sw.go(); });
        b.setAttribute('aria-pressed', moveOn(mv) ? 'true' : 'false');
        sw.els.push(b);
        return b;
      };
      sw.sync = function () {
        sw.els = live(sw.els);
        sw.els.forEach(function (b) { b.setAttribute('aria-pressed', moveOn(mv) ? 'true' : 'false'); });
      };
      return sw;
    }
    return {
      THREE: THREE, scene: scene, page: page, name: name,
      gentle: document.documentElement.getAttribute('data-intensity') === 'gentle',
      col: col, at: at, box: box, cyl: cyl,
      // Every box and column a room drew in one of its colours, recoloured at
      // once (a room whose own switch changes its light); a colour by name.
      tint: function (name, to) { toon(name).color.copy(col(to)); },
      piece: function (geo, m, ink, ink2, shadow) { piece(geo, m, toon(ink), ink, ink2, shadow); },
      facets: function (geo, m, ink) {
        var mesh = put(new THREE.Mesh(geo, solid(col(ink))), m);
        mesh.castShadow = true;
        return mesh;
      },
      // cloth(kind, inkA, inkB, repeat): a woven, knitted, velvet, fur, pile,
      // canvas or leather texture drawn on a canvas in two of the room's
      // inks (Helen's ask, 2026-11-11: cushions, rugs and blankets with a
      // texture you can see), tiled `repeat` times across a metre, for
      // kit.fabric. Drawn, never fetched; the colours are the room's own.
      cloth: function (kind, inkA, inkB, repeat) {
        var a = css(inkA), b = css(inkB), N = 256;
        var map = tex(N, N, function (g) {
          g.fillStyle = a; g.fillRect(0, 0, N, N);
          g.fillStyle = b; g.strokeStyle = b;
          var i, j, k;
          if (kind === 'weave' || kind === 'canvas') {
            var step = kind === 'canvas' ? 8 : 16;
            for (i = 0; i < N; i += step) for (j = 0; j < N; j += step) {
              if (((i + j) / step) % 2 === 0) { g.globalAlpha = 0.55; g.fillRect(i, j, step - 1, step / 2 - 1); g.globalAlpha = 0.3; g.fillRect(i, j + step / 2, step / 2 - 1, step / 2 - 1); }
            }
          } else if (kind === 'knit') {
            g.lineWidth = 5; g.lineCap = 'round';
            for (j = 0; j < N + 16; j += 16) for (i = 0; i < N + 16; i += 16) {
              g.globalAlpha = 0.6; g.beginPath(); g.moveTo(i, j); g.lineTo(i + 8, j + 10); g.lineTo(i + 16, j); g.stroke();
              g.globalAlpha = 0.25; g.beginPath(); g.moveTo(i + 2, j + 4); g.lineTo(i + 8, j + 12); g.lineTo(i + 14, j + 4); g.stroke();
            }
          } else if (kind === 'velvet') {
            for (k = 0; k < 9000; k++) { g.globalAlpha = 0.08 + Math.random() * 0.12; g.fillRect(Math.random() * N, Math.random() * N, 2, 3 + Math.random() * 4); }
          } else if (kind === 'fur') {
            g.lineWidth = 2; g.lineCap = 'round';
            for (k = 0; k < 1400; k++) {
              var x = Math.random() * N, y = Math.random() * N, r = 4 + Math.random() * 6;
              g.globalAlpha = 0.25 + Math.random() * 0.35; g.beginPath(); g.arc(x, y, r, Math.random() * Math.PI, Math.random() * Math.PI + 3); g.stroke();
            }
          } else if (kind === 'pile') {
            for (i = 0; i < N; i += 6) for (j = 0; j < N; j += 6) { g.globalAlpha = 0.15 + ((i * 7 + j * 13) % 10) / 25; g.beginPath(); g.arc(i + 3, j + 3, 2.2, 0, Math.PI * 2); g.fill(); }
          } else if (kind === 'leather') {
            for (k = 0; k < 2200; k++) { g.globalAlpha = 0.06 + Math.random() * 0.1; g.beginPath(); g.arc(Math.random() * N, Math.random() * N, 3 + Math.random() * 5, 0, Math.PI * 2); g.fill(); }
            g.globalAlpha = 0.35; g.lineWidth = 1;
            for (k = 0; k < 60; k++) { g.beginPath(); g.moveTo(Math.random() * N, Math.random() * N); g.lineTo(Math.random() * N, Math.random() * N); g.stroke(); }
          }
          g.globalAlpha = 1;
        });
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(repeat || 4, repeat || 4);
        return map;
      },
      // fabric(geo, m, cloth, shadow): a thing made of cloth, its own mesh,
      // the weave as its surface and, in the real look, as its relief too.
      fabric: function (geo, m, cloth, shadow) {
        var mat = real()
          ? new THREE.MeshStandardMaterial({ map: cloth, bumpMap: cloth, bumpScale: 0.012, roughness: 0.96, metalness: 0 })
          : new THREE.MeshToonMaterial({ map: cloth, gradientMap: gradient });
        var mesh = put(new THREE.Mesh(geo, mat), m);
        mesh.castShadow = shadow !== false; mesh.receiveShadow = true;
        return mesh;
      },
      // place(touch, take): somewhere a held thing can be put: pressed while
      // you hold something, take(mesh, say) is called with it and says what
      // happened (and sets the mesh's matrix where it now stands), or returns
      // false to refuse; the thing is let go of if it was taken.
      place: function (hb, take) { hb.userData.take = take; return hb; },
      // held(): the thing in your hand just now, or null.
      held: function () { return heldNow(); },
      flat: function (geo, m, ink) { return put(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col(ink) })), m); },
      // A colour by name as the canvas wants it, a sheet of paper drawn on a
      // canvas in those inks, and that sheet hung somewhere, lit like
      // everything else.
      ink: css,
      paper: function (pw, ph, draw) { return tex(pw, ph, draw); },
      // Sheets of one paper are merged into one mesh, however many there are.
      sheet: function (map, w, h, m) {
        if (!map.userData.mat || map.userData.look !== lookNow) {
          map.userData.look = lookNow;
          map.userData.mat = real() ? new THREE.MeshStandardMaterial({ map: map, roughness: 0.9, metalness: 0 }) : new THREE.MeshToonMaterial({ map: map, gradientMap: gradient });
        }
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
        // Where the page stands and how big, for the board that reads it in
        // a headset (readerUp), which shows no page.
        (home.userData.screens = home.userData.screens || []).push({ f: f, m: m.clone(), ww: ww, wh: ww * ph / pw });
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
      // THE ROOM'S OWN SWITCHES AND THINGS THAT MOVE (Ryan, 2026-11-04). Each
      // goes among the room's controls under the line that says where you are;
      // hand one to a stop's acts and it is in that line too while you stand
      // there. Every one says what it did, in words.
      //
      // choose({ label, choices: [words], start, pick: function (i) -> words }):
      // a row of buttons, one pressed.
      choose: function (o) {
        var cur = o.start || 0, ch = { els: [] };
        ch.make = function (here) { var g = ctlRow(o.label, o.choices, function () { return cur; }, ch.pick, here, !here); ch.els.push(g); return g; };
        ch.pick = function (i) { cur = i; syncRows(ch.els, cur); ctlSay(o.pick(i)); draw(); };
        ch.sync = function () { ch.els = live(ch.els); syncRows(ch.els, cur); };
        return addCtl(ch);
      },
      // press({ say, press: function () -> words, at: [kit.touch(...)] }): a
      // thing to press, as a button and, where o.at is, in the scene itself.
      press: function (o) {
        var pr = { els: [] };
        pr.go = function () { ctlSay(o.press()); draw(); };
        pr.make = function (here) { var b = ctlButton(typeof o.say === 'function' ? o.say() : o.say, here, pr.go); pr.els.push(b); return b; };
        pr.sync = function () { pr.els = live(pr.els); if (typeof o.say === 'function') pr.els.forEach(function (b) { b.textContent = o.say(); }); };
        pr.go = (function (go) { return function () { go(); pr.sync(); }; })(pr.go);
        (o.at || []).forEach(function (hb) { hb.userData.act = pr; });
        return addCtl(pr);
      },
      // A thing shown or put away by a press (tea in a cup, a curtain drawn
      // across): kit.hide(mesh, true) puts it away, false shows it, and
      // kit.hidden(mesh) says which.
      hide: function (mesh, away) { mesh.userData.hidden = !!away; mesh.visible = !away; },
      hidden: function (mesh) { return !!mesh.userData.hidden; },
      // An invisible box w by h by d standing as m, to press in the scene.
      touch: function (w, h, d, m) {
        var hb = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ visible: false }));
        hb.matrixAutoUpdate = false; hb.matrix.copy(m); hb.matrixWorld.copy(m);
        hits.push(hb);
        return hb;
      },
      // flames([{ mesh, light }], { say, max, said }): candle flames, each a
      // mesh from kit.flat with its foot at its origin, and the light it
      // gives if any. They flicker under the flash line, each on its own.
      flames: function (list, o) {
        var fs = list.map(function (f) {
          var mesh = f.mesh || f;
          return { mesh: mesh, light: f.light || null, m: mesh.matrix.clone(), c: mesh.material.color.clone(),
                   i: f.light ? f.light.intensity : 0, sp: 0.88 + Math.random() * 0.12,
                   ph: HZ.map(function () { return Math.random() * Math.PI * 2; }) };
        });
        var sc = new THREE.Matrix4();
        var mv = addMove({ max: !!o.max,
          step: function (s) {
            fs.forEach(function (f) {
              var a = 0;
              for (var i = 0; i < HZ.length; i++) a += Math.sin(s * HZ[i] * f.sp * Math.PI * 2 + f.ph[i]);
              a /= HZ.length;
              var k = 1 - DIM * (a + 1) / 2;
              f.mesh.material.color.copy(f.c).multiplyScalar(k);
              f.mesh.matrix.copy(f.m).multiply(sc.makeScale(1 - 0.05 * a, 1 + 0.14 * a, 1 - 0.05 * a));
              f.mesh.matrixWorldNeedsUpdate = true;
              if (f.light) f.light.intensity = f.i * k;
            });
          },
          rest: function () {
            fs.forEach(function (f) {
              f.mesh.material.color.copy(f.c); f.mesh.matrix.copy(f.m); f.mesh.matrixWorldNeedsUpdate = true;
              if (f.light) f.light.intensity = f.i;
            });
          } });
        var sw = addCtl(moveSwitch(mv, o.say, o.said || function (on) { return on ? 'The candles flicker.' : 'The candles are still.'; }));
        (o.at || []).forEach(function (hb) { hb.userData.act = sw; });
        return sw;
      },
      // turn(meshes, about, { say, max, period, said }): things that go round
      // together about the upright through `about` (a matrix), once in
      // o.period seconds, never quicker than TURN_MIN.
      turn: function (meshes, about, o) {
        var period = Math.max(TURN_MIN, o.period || 6), ang = 0, rot = new THREE.Matrix4();
        var inv = about.clone().invert();
        var ms = meshes.map(function (m) { return { o: m, base: m.matrix.clone(), pre: inv.clone().multiply(m.matrix) }; });
        var mv = addMove({ max: !!o.max,
          step: function (s, dt) {
            ang = (ang + dt * Math.PI * 2 / period) % (Math.PI * 2);
            rot.makeRotationY(-ang);
            ms.forEach(function (m) { m.o.matrix.copy(about).multiply(rot).multiply(m.pre); m.o.matrixWorldNeedsUpdate = true; });
          },
          // A record that stops stays where it stopped.
          rest: function () {} });
        var sw = addCtl(moveSwitch(mv, o.say, o.said || function (on) { return on ? 'It turns.' : 'It stops.'; }));
        (o.at || []).forEach(function (hb) { hb.userData.act = sw; });
        return sw;
      },
      // drift(list, { say, max, period, said, at }): small things that fly
      // about a point, each on its own slow loop (Helen Edgar's ask, 2026-11-11,
      // for the faeries round the portals in her yurt). list: [{ meshes, about
      // (a Vector3), r, h, period, wings }]. Each goes round its point r out,
      // up and down h, once in period seconds and never quicker than TURN_MIN,
      // turned to face the way it flies, and its wings (meshes drawn with their
      // root at the body) fold and open once in WING seconds, the page's own
      // flutter; its meshes are drawn where it rests, and it rests where it
      // stops. Nothing in it flashes: a wing folds, nothing dims.
      drift: function (list, o) {
        var WING = 1.7, inv = new THREE.Matrix4(), tr = new THREE.Matrix4(), rot = new THREE.Matrix4(), fold = new THREE.Matrix4();
        var ds = list.map(function (d, n) {
          inv.makeTranslation(-d.about.x, -d.about.y, -d.about.z);
          return { about: d.about.clone(), r: d.r || 0.5, h: d.h || 0.2, dir: n % 2 ? 1 : -1,
                   period: Math.max(TURN_MIN, d.period || o.period || 7), ph: Math.random() * Math.PI * 2,
                   meshes: d.meshes.map(function (m) { return { o: m, local: inv.clone().multiply(m.matrix), wing: (d.wings || []).indexOf(m) }; }) };
        });
        var mv = addMove({ max: !!o.max,
          step: function (s) {
            ds.forEach(function (d) {
              var a = d.ph + d.dir * s * Math.PI * 2 / d.period;
              tr.makeTranslation(d.about.x + Math.cos(a) * d.r, d.about.y + Math.sin(a * 2 + d.ph) * d.h, d.about.z + Math.sin(a) * d.r);
              rot.makeRotationY(-a + (d.dir > 0 ? Math.PI : 0));
              var f = 0.55 + 0.45 * Math.abs(Math.sin(s * Math.PI / WING + d.ph));
              d.meshes.forEach(function (m) {
                m.o.matrix.copy(tr).multiply(rot).multiply(m.local);
                if (m.wing >= 0) m.o.matrix.multiply(fold.makeScale(f, 1, 1));
                m.o.matrixWorldNeedsUpdate = true;
              });
            });
          },
          // A faerie that stops stays where it stopped.
          rest: function () {} });
        var sw = addCtl(moveSwitch(mv, o.say, o.said || function (on) { return on ? 'They fly.' : 'They settle.'; }));
        (o.at || []).forEach(function (hb) { hb.userData.act = sw; });
        return sw;
      },
      // rise(list, { say, said, max, period, back }): things that rise, as
      // bubbles up a tube or the wax in a lava lamp (Helen Edgar's ask,
      // 2026-11-11, for her Play Pod). list: [{ meshes, lift, period, ph }]:
      // each rises `lift` (metres) from where it is drawn once in period
      // seconds, never quicker than TURN_MIN, and either comes back down the
      // same way (o.back, the lava) or starts again at the foot, growing from
      // nothing at the foot and shrinking to nothing at the top so there is no
      // jump (a bubble). Its meshes are drawn where they rest and rest where
      // they stop. Nothing dims, nothing flashes.
      rise: function (list, o) {
        var tr = new THREE.Matrix4(), sc = new THREE.Matrix4();
        var rs = list.map(function (d, n) {
          return { lift: d.lift || 1, period: Math.max(TURN_MIN, d.period || o.period || 8), ph: d.ph != null ? d.ph : (n * 0.618) % 1,
                   meshes: d.meshes.map(function (m) { return { o: m, base: m.matrix.clone() }; }) };
        });
        var mv = addMove({ max: !!o.max,
          step: function (s) {
            rs.forEach(function (d) {
              var u = (s / d.period + d.ph) % 1, k = 1;
              if (o.back) u = 0.5 - 0.5 * Math.cos(u * Math.PI * 2);
              else k = Math.max(0.001, Math.sin(u * Math.PI));
              tr.makeTranslation(0, d.lift * u, 0);
              sc.makeScale(k, k, k);
              d.meshes.forEach(function (m) {
                // Lifted straight up from where it was drawn.
                m.o.matrix.copy(tr).multiply(m.base);
                if (!o.back) m.o.matrix.multiply(sc);
                m.o.matrixWorldNeedsUpdate = true;
              });
            });
          },
          rest: function () {} });
        var sw = addCtl(moveSwitch(mv, o.say, o.said || function (on) { return on ? 'They rise.' : 'They hold still.'; }));
        (o.at || []).forEach(function (hb) { hb.userData.act = sw; });
        return sw;
      },
      // hold(mesh, { say }): a thing you can pick up (Helen's headset round):
      // a kit.facets or kit.flat mesh, drawn where it lives; pressed, it comes
      // to your hand in a headset or to just in front of you on a screen, and
      // pressed again it goes back where it was.
      hold: function (mesh, o) {
        mesh.userData.hold = { home: mesh.matrix.clone(), say: o && o.say, by: null };
        hits.push(mesh);
        (home.userData.holds = home.userData.holds || []).push(mesh);
        return mesh;
      },
      // sit({ x, z, yaw, say, up, at }): somewhere to sit: pressed, you are
      // stood there facing that way with your eyes at a sitting height, in a
      // headset and on a screen, and pressed again you stand. One seat at a
      // time; leaving the room stands you up.
      // stature({ tall | small, say, back, done, undone, at }): EAT ME and DRINK
      // ME (Looking-Glass House, Helen's ask, 2026-11-12): pressed, your eyes
      // go up by `tall` or down by `small` metres, on a screen and in a headset
      // alike (xrSeat is the one height everything reads), and pressed again,
      // or on leaving the room, you are your own size. Sitting down while
      // grown puts you at a seat's height; standing up keeps you grown.
      stature: function (o) {
        var self = this;
        return self.press({ say: function () { return stature === o ? (o.back || 'Back to your own size') : o.say; }, at: o.at,
          press: function () {
            if (stature === o) { stature = null; if (!seated) xrSeat = 0; place(); vrPanelPlace(); return o.undone || 'You are your own size again.'; }
            stature = o; xrSeat = (o.small || 0) - (o.tall || 0); place(); vrPanelPlace();
            return o.done || 'You grow.';
          } });
      },
      sit: function (o) {
        var self = this, SQ = new THREE.Matrix4();
        // o.squash: the cushion's mesh (kit.facets or kit.fabric), pressed a
        // little flatter while you sit on it, and back when you stand.
        function squash(down) {
          if (!o.squash) return;
          var m = o.squash;
          if (!m.userData.unsquashed) m.userData.unsquashed = m.matrix.clone();
          m.matrix.copy(m.userData.unsquashed);
          if (down) { var p = new THREE.Vector3().setFromMatrixPosition(m.matrix); m.matrix.premultiply(SQ.makeTranslation(-p.x, -p.y, -p.z)).premultiply(SQ.makeScale(1.06, 0.78, 1.06)).premultiply(SQ.makeTranslation(p.x, p.y, p.z)); }
          m.matrixWorldNeedsUpdate = true;
        }
        return self.press({ say: function () { return seated === o ? (o.up || 'Stand up') : (o.say || 'Sit down'); }, at: o.at,
          press: function () {
            if (seated === o) { seated = null; xrSeat = stature ? (stature.small || 0) - (stature.tall || 0) : 0; squash(false); place(); vrPanelPlace(); return o.stood || 'You stand up.'; }
            if (seated && seated.unsquash) seated.unsquash();
            seated = o; o.unsquash = function () { squash(false); }; squash(true); xrSeat = SEAT;
            if (xrOn) footFor(o.x, o.z, o.yaw - headLocal().yaw); else { me.x = o.x; me.z = o.z; me.yaw = o.yaw; }
            place(); vrPanelPlace();
            return o.sat || 'You sit down.';
          } });
      },
      // spatial(get, pos): a sound heard from pos ([x, y, z] or a Vector3): get()
      // returns { ctx, node } once the page's script has its output (window.loveFire.output(),
      // window.loveYurtBell.output()), or nothing yet.
      spatial: function (get, pos) {
        var v = pos && pos.isVector3 ? pos.clone() : new THREE.Vector3(pos[0], pos[1], pos[2]);
        (home.userData.spatials = home.userData.spatials || []).push({ get: get, pos: v, panner: null, ctx: null });
      },
      // sound({ kind, pos, at, say, stop, said }): one of the room's own sounds
      // out of cel-sounds.js (made of arithmetic there, nothing recorded or
      // fetched), heard from pos through the panner above, with a switch
      // under the line that says where you are and, where o.at is, on the
      // thing itself. Off until pressed, on until pressed again, and off when
      // you leave the room (soundsOff, from enter and leave), so no room's
      // sound follows you into another. Helen Edgar's ask, 2026-11-12.
      // caption(fn): what is sounding now, in words, or nothing: fn() is asked
      // whenever the headset's panel is drawn, which says it for as long as
      // it sounds. kit.sound gives its own (o.caption); a room gives one for
      // a sound its page's script makes (the Reading Room's fire).
      caption: function (fn) { (home.userData.captions = home.userData.captions || []).push(fn); },
      sound: function (o) {
        var self = this, S = function () { return window.loveCelSounds || null; };
        self.spatial(function () { var s = S(); return s ? s.output(o.kind) : null; }, o.pos);
        (home.userData.sounds = home.userData.sounds || []).push(o.kind);
        self.caption(function () { var s = S(); return s && s.playing(o.kind) ? (o.caption || o.kind) : ''; });
        return self.press({ say: function () { var s = S(); return s && s.playing(o.kind) ? (o.stop || 'Let it be quiet') : o.say; }, at: o.at,
          press: function () {
            var s = S();
            if (!s) return 'The sounds have not loaded yet; try again in a moment.';
            var on = s.toggle(o.kind);
            if (on === null) return 'This browser would not make the sound.';
            return o.said ? o.said(on) : (on ? 'It sounds.' : 'It is quiet.');
          } });
      },
      // plaque({ title, lines, face, ink, ground, edge, w, m, size }): a board of
      // words in WebGL, wrapped to its width, for a headset, which shows no
      // page; returns its height in the world.
      plaque: function (o) {
        var pw = 1024, size = o.size || 42, face = o.face || 'sans-serif', pad = 48, rows = [];
        var probe = document.createElement('canvas').getContext('2d');
        probe.font = size + 'px ' + face;
        (o.lines || []).forEach(function (line) {
          var cur = '';
          String(line).split(/\s+/).forEach(function (wd) {
            var t = cur ? cur + ' ' + wd : wd;
            if (probe.measureText(t).width > pw - pad * 2 && cur) { rows.push(cur); cur = wd; } else cur = t;
          });
          rows.push(cur);
        });
        var th = o.title ? Math.round(size * 1.5) + 18 : 0, ph = pad * 2 + th + rows.length * Math.round(size * 1.3);
        var map = tex(pw, ph, function (g) {
          g.fillStyle = css(o.ground); g.fillRect(0, 0, pw, ph);
          if (o.edge) { g.strokeStyle = css(o.edge); g.lineWidth = 10; g.strokeRect(5, 5, pw - 10, ph - 10); }
          g.fillStyle = css(o.ink); g.textBaseline = 'top'; g.textAlign = 'left';
          var y = pad;
          if (o.title) { g.font = '700 ' + Math.round(size * 1.5) + 'px ' + face; g.fillText(o.title, pad, y); y += th; }
          g.font = size + 'px ' + face;
          rows.forEach(function (r) { g.fillText(r, pad, y); y += Math.round(size * 1.3); });
        });
        var h = o.w * ph / pw;
        this.sheet(map, o.w, h, o.m);
        return h;
      },
      // bulbs(points, r, inks): a string of little glass bulbs at points
      // ([x, y, z]), coloured in turn from inks, one mesh however many.
      bulbs: function (points, r, inks) {
        var mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 8, 6), new THREE.MeshBasicMaterial(), points.length);
        var m = new THREE.Matrix4();
        points.forEach(function (p, i) { mesh.setMatrixAt(i, m.makeTranslation(p[0], p[1], p[2])); mesh.setColorAt(i, col(inks[i % inks.length])); });
        put(mesh, new THREE.Matrix4());
        return { mesh: mesh, n: points.length, ph: points.map(function (p, i) { return (i * 0.37) % 1; }) };
      },
      // lights({ label, strings: [kit.bulbs(...)], washes: [PointLight], sets:
      // [{ say, inks }], max, twinkle }): a string of lights and its switches:
      // out, low or lit, which colours, and whether they twinkle.
      lights: function (o) {
        var LEVELS = ['Out', 'Low', 'Lit'], BULB = [0.14, 0.55, 1], WASH = [0, 0.45, 1];
        var lvl = 2, set = 0, tw = null, lt = { els: [] }, tmp = new THREE.Color();
        var washes = (o.washes || []).map(function (l) { return { l: l, i: l.intensity }; });
        // o.cycle (Helen Edgar's ask, 2026-11-11, her Play Pod's sensory mats):
        // instead of twinkling, each bulb drifts from one of the set's inks to
        // the next, a whole TWINKLE for each step, so a colour changes over
        // seconds and nothing flashes.
        var tmp2 = new THREE.Color();
        function paint(s) {
          var inks = o.sets[set].inks.map(col);
          o.strings.forEach(function (b) {
            for (var i = 0; i < b.n; i++) {
              if (o.cycle && s != null && inks.length > 1) {
                var t = s / TWINKLE + b.ph[i] * inks.length, j = Math.floor(t) % inks.length, u = t - Math.floor(t);
                u = u * u * (3 - 2 * u);
                tmp.copy(inks[j]).lerp(tmp2.copy(inks[(j + 1) % inks.length]), u).multiplyScalar(BULB[lvl]);
                b.mesh.setColorAt(i, tmp);
                continue;
              }
              var f = s == null ? 1 : TWINKLE_LOW + (1 - TWINKLE_LOW) * (0.5 + 0.5 * Math.cos((s / TWINKLE + b.ph[i]) * Math.PI * 2));
              b.mesh.setColorAt(i, tmp.copy(inks[i % inks.length]).multiplyScalar(BULB[lvl] * f));
            }
            b.mesh.instanceColor.needsUpdate = true;
          });
          washes.forEach(function (w, wi) {
            if (o.cycle && s != null && inks.length > 1) {
              var t2 = s / TWINKLE + wi * 0.37, j2 = Math.floor(t2) % inks.length, u2 = t2 - Math.floor(t2);
              u2 = u2 * u2 * (3 - 2 * u2);
              w.l.color.copy(inks[j2]).lerp(tmp2.copy(inks[(j2 + 1) % inks.length]), u2);
            } else w.l.color.copy(inks[0]);
            w.l.intensity = w.i * WASH[lvl];
          });
        }
        var mv = addMove({ max: !!o.max, step: function (s) { paint(s); }, rest: function () { paint(null); } });
        tw = moveSwitch(mv, o.twinkle || (o.cycle ? 'Let the colours change' : 'Let them twinkle'), function (on) { return on ? (o.cycle ? 'The colours change, slowly, one into the next.' : 'They twinkle, slowly, each in its own time.') : 'They hold still.'; });
        lt.make = function (here) {
          var g = document.createElement('div');
          g.className = 'cel-roomctl__group';
          if (!here) { var p = document.createElement('p'); p.className = 'cel-roomctl__name'; p.textContent = o.label; g.appendChild(p); }
          g.appendChild(ctlRow(o.label + ': how bright', LEVELS, function () { return lvl; }, function (i) {
            lvl = i; paint(null); moves(); lt.sync(); draw();
            ctlSay(o.label + (i === 0 ? ' are out.' : i === 1 ? ' are low.' : ' are lit.'));
          }, here, false));
          if (o.sets.length > 1) g.appendChild(ctlRow(o.label + ': colours', o.sets.map(function (x) { return x.say; }), function () { return set; }, function (i) {
            set = i; paint(null); moves(); lt.sync(); draw();
            ctlSay(o.label + ': ' + o.sets[i].say.charAt(0).toLowerCase() + o.sets[i].say.slice(1) + '.');
          }, here, false));
          g.appendChild(tw.make(here));
          lt.els.push(g);
          return g;
        };
        lt.sync = function () {
          lt.els = live(lt.els);
          lt.els.forEach(function (g) {
            var rows = g.querySelectorAll('[role="group"]');
            syncRows([rows[0]], lvl);
            if (rows[1]) syncRows([rows[1]], set);
          });
          tw.sync();
        };
        paint(null);
        return addCtl(lt);
      },
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
  // A room's sounds stop as you go out of it, either way (into a room off it,
  // or back out), so a sound is only ever heard in the room it is in.
  function soundsOff() {
    var S = window.loveCelSounds, ks = (scene && scene.userData.sounds) || [];
    if (S) ks.forEach(function (k) { S.off(k); });
  }
  function enter(page, push, then) {
    if (!ROOMS[page] || (inside && inside.page === page)) return;
    var from = inside;
    soundsOff();
    if (inside && inside.tunnel && push !== false && stops.some(function (t) { return t.page === page; })) travelStart(inside.tunnel);
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
      lookNow = lookChoice || room.look || 'cel';
      // In the real look nothing is lifted to a bright step by the cel's
      // gradient, so the room gets a little even light of its own to stand on.
      // A room says `dusk` (0 to 1) to have less of it: Looking-Glass House at
      // its tea party (Helen, 2026-11-12) is lit by its own candles and fairy
      // lights, and the even light would wash them out.
      if (real()) scene.add(new THREE.AmbientLight(col('--cel-page'), 0.55 * (1 - Math.min(1, Math.max(0, room.dusk || 0)))));
      var k = kit(page, name);
      var made = room.build(k);
      lookNow = 'cel';
      // A room with a basket of wings (Helen Edgar's yurt, 2026-11-09) lends a
      // pair while you are in it: a row under the room's own switches, None
      // first. The pair goes with your place to the radio (spotTell), and back
      // in the basket when you leave (leave); it is kept in no storage.
      wornWings = null;
      if (Array.isArray(made.wings) && made.wings.length) {
        var pairs = made.wings.filter(function (w) { return typeof w === 'string'; });
        k.choose({ label: 'Borrow a pair of wings', choices: ['None'].concat(pairs.map(function (w) { return wingName(w) + ' wings'; })), start: 0,
          pick: function (i) {
            wornWings = i > 0 ? pairs[i - 1] : null;
            spotTell();
            return wornWings ? 'You are wearing ' + wingName(wornWings).toLowerCase() + ' wings, for anybody in the room who sees your figure; they go back in the basket when you leave.' : 'The wings are back in the basket.';
          } });
      }
      bake();
      xrSeat = 0; seated = null; stature = null; xrTour = 0;
      inside = { page: page, name: name, vr: !!made.vr, from: room.from || null, tunnel: room.tunnel || null };
      if (travel) travel.arrived = true;
      // A room that starts at a level of its own (Helen's yurt at MAX GLITTER,
      // 2026-11-11): love.js decides, honouring a dial the visitor has set and
      // a device that asks for less, and stores nothing.
      if (made.glitter && window.loveLevel && window.loveLevel.start) window.loveLevel.start(made.glitter);
      stops = made.stops; bounds = made.bounds;
      me = { x: made.start.x, z: made.start.z, yaw: made.start.yaw || 0, pitch: 0.05 };
      up = false; glide = null; held = {};
      if (push !== false) history.pushState({ celIn: page }, '', '#in=' + page.replace(/\.html$/, ''));
      wayOut(); places(); roomCtl(); vrOffer(); radioRoom(); lookShow();
      said = '';
      draw(); tell(); plateUp(); moves();
      if (xrOn && inside.vr) vrStand({ x: me.x, z: me.z, yaw: me.yaw });
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
    soundsOff();
    var into = behind.length ? behind[behind.length - 1].inside : null;
    if (into && into.tunnel && inside.from === into.page) travelStart(into.tunnel);
    scene.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.isCSS3DObject && o.element.parentNode) o.element.parentNode.removeChild(o.element);
    });
    var was = behind.pop();
    scene = was.scene; far = was.far; stops = was.stops; bounds = was.bounds; hits = was.hits; me = was.me;
    inside = was.inside; glide = null; held = {}; wornWings = null;
    xrSeat = 0; seated = null; stature = null;
    // The room you came back into shows its own page again.
    scene.traverse(function (o) { if (o.isCSS3DObject) o.element.style.display = ''; });
    if (travel) travel.arrived = true;
    wayOut(); places(); roomCtl(); vrOffer(); radioRoom();
    if (!inside && list) list.querySelectorAll('a').forEach(function (a) { a.removeAttribute('tabindex'); });
    said = '';
    draw(); tell(); plateUp(); moves();
    if (xrOn && vrHere()) vrStand({ x: me.x, z: me.z, yaw: me.yaw });
  }
  // THE RADIO FOLLOWS YOU IN (Helen Edgar's ask, 2026-11-07): the room you are
  // in is written on the page's <body>, and cb.js makes the radio that room's,
  // its channel and Be seen here, so you chat with whoever else is in it.
  function radioRoom() {
    var tag = inside ? inside.page.replace(/\.html$/, '') : '';
    folkClear(); spotSaid = ''; spotTell();
    if ((document.body.getAttribute('data-cel-room') || '') === tag) return;
    if (tag) document.body.setAttribute('data-cel-room', tag); else document.body.removeAttribute('data-cel-room');
    window.dispatchEvent(new CustomEvent('love-cel-room'));
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

  // YOUR COMPANIONS: your chimera and your avatar, standing at the foot of the
  // picture with you wherever you look, on a layer of their own over the
  // street (Ryan, 2026-11-04, as on Paper Street). Your chimera is your
  // familiar, read from your own browser where familiar.js already keeps it,
  // and comes along unless you send it home; the page says data-familiar=
  // "walks", so it is not put on the page as well. Your avatar comes only on
  // a press: Bring my avatar asks the CB for your avatars once, with the pass
  // the radio keeps, and brings the one you wear. Nothing here keeps either.
  var folkEl = document.querySelector('[data-cel-folk]');
  var bringMe = document.querySelector('[data-cel-bring-me]');
  var bringFam = document.querySelector('[data-cel-bring-fam]');
  var folkSaid = document.querySelector('[data-cel-folk-said]');
  var meFig = null, famFig = null, famName = '';
  function loadScript(src, ready) {
    if (ready()) return Promise.resolve();
    return new Promise(function (ok, no) {
      var sc = document.createElement('script');
      sc.src = src; sc.defer = true;
      sc.onload = function () { ready() ? ok() : no(); };
      sc.onerror = no;
      document.head.appendChild(sc);
    });
  }
  function stored(which) {
    try { return JSON.parse((which === 'pass' ? localStorage.getItem('love-cb') : localStorage.getItem('love-familiar')) || 'null'); }
    catch (e) { return null; }
  }
  function companion(node, cls) {
    var el = document.createElement('div');
    el.className = 'cel-figure ' + cls;
    var vb = (node.getAttribute('viewBox') || '0 0 1 1').split(/[\s,]+/).map(Number);
    if (vb[2] > 0 && vb[3] > 0) el.style.aspectRatio = vb[2] + ' / ' + vb[3];
    el.appendChild(node);
    folkEl.appendChild(el);
    return el;
  }
  function folkTell(words) { if (folkSaid) folkSaid.textContent = words; }
  function familiarOut() {
    var v = stored('familiar');
    if (!folkEl || !v || !v.parts) return;
    loadScript('chimera.js', function () { return !!window.loveChimera; }).then(function () {
      var C = window.loveChimera, p = C.clean(v.parts);
      var node = p && C.draw(p, { prefix: 'celf', cls: 'cel-figure__art' });
      if (!node) return;
      famFig = companion(node, 'cel-figure--familiar');
      famName = typeof v.name === 'string' && v.name ? v.name : 'Your chimera';
      if (bringFam) { bringFam.hidden = false; bringFam.textContent = 'Send ' + famName + ' home'; }
      folkTell(famName + ' is walking with you.');
    }, function () {});
  }
  if (bringFam) bringFam.addEventListener('click', function () {
    if (famFig) {
      famFig.remove(); famFig = null;
      bringFam.textContent = 'Bring ' + famName + ' back';
      folkTell(famName + ' has gone home. It is still your familiar everywhere else on the street.');
    } else {
      familiarOut();
    }
  });
  var cbPass = stored('pass');
  cbPass = cbPass && cbPass.pass ? cbPass.pass : null;
  if (bringMe && folkEl && cbPass) {
    bringMe.hidden = false;
    bringMe.addEventListener('click', function () {
      if (meFig) {
        meFig.remove(); meFig = null;
        bringMe.textContent = 'Bring my avatar';
        folkTell('Your avatar has gone home. You walk with no body now.');
        return;
      }
      folkTell('Fetching your avatar\u2026');
      fetch('/cb/avatars', { method: 'GET', credentials: 'omit', cache: 'no-store',
        headers: { accept: 'application/json', authorization: 'Bearer ' + cbPass } })
        .then(function (r) { return r.json().then(function (b) { return { status: r.status, body: b }; }); })
        .then(function (r) {
          var list = r.body && r.body.avatars;
          if (r.status === 401) { folkTell('This username has been signed off. Sign on again and press it again.'); return; }
          if (r.status !== 200 || !list) { folkTell('Your avatars could not be fetched just now.'); return; }
          if (!list.length) { folkTell('You have no avatar kept yet. The Bodymind Booth is where one is drawn.'); return; }
          var a = list.filter(function (x) { return x.id === r.body.wearing; })[0] || list[0];
          return loadScript('avatar.js', function () { return !!window.loveAvatar; }).then(function () {
            var node = window.loveAvatar.draw(a.look, { cls: 'cel-figure__art' });
            if (!node) { folkTell('That avatar could not be drawn.'); return; }
            meFig = companion(node, 'cel-figure--you');
            bringMe.textContent = 'Send my avatar home';
            folkTell('You are walking as ' + (a.name || 'your avatar') + (a.id === r.body.wearing ? ', the one you wear on the CB.' : '.'));
          });
        })
        .catch(function () { folkTell('The street could not be reached just now.'); });
    });
  }

  // THE TELEPORTER: a room by its name, from anywhere on the street or in any
  // room, straight there (Ryan, 2026-11-04). The names come with ROOMS, so it
  // asks for nothing. It leaves every room you are in first, so Back out goes
  // to the street (or through the room a room opens off), and it is a step in
  // the tab's history like walking in.
  var STREET_NAME = 'Cel Street itself';
  function sortName(n) { return n.replace(/^(the|a|an) /i, '').toLowerCase(); }
  function teleList() {
    if (!teleForm) return;
    var dl = teleForm.querySelector('datalist');
    var names = Object.keys(NAMES).map(function (p) { return NAMES[p]; });
    names.sort(function (a, b) { return sortName(a) < sortName(b) ? -1 : sortName(a) > sortName(b) ? 1 : 0; });
    [STREET_NAME].concat(names).forEach(function (n) {
      var o = document.createElement('option'); o.value = n; dl.appendChild(o);
    });
  }
  function teleFind(q) {
    q = q.trim().toLowerCase();
    if (!q) return { none: true };
    if (q === STREET_NAME.toLowerCase() || q === 'cel street' || q === 'the street') return { page: '' };
    var pages = Object.keys(NAMES);
    var exact = pages.filter(function (p) { return NAMES[p].toLowerCase() === q; });
    if (exact.length) return { page: exact[0] };
    var some = pages.filter(function (p) { return NAMES[p].toLowerCase().indexOf(q) >= 0; });
    return some.length === 1 ? { page: some[0] } : some.length ? { many: true } : { none: true };
  }
  function teleport(page) {
    if (page === '' ? !inside : inside && inside.page === page) {
      if (teleSaid) teleSaid.textContent = 'You are already there.';
      return;
    }
    while (inside) leave();
    if (page === '') {
      history.pushState(null, '', location.pathname + location.search);
      if (teleSaid) teleSaid.textContent = 'Back out on Cel Street.';
      stage.focus({ preventScroll: true });
      return;
    }
    history.pushState({ celIn: page }, '', '#in=' + page.replace(/\.html$/, ''));
    if (teleSaid) teleSaid.textContent = 'Teleporting to ' + NAMES[page] + '\u2026';
    enter(page, false, function () {
      if (teleSaid) teleSaid.textContent = 'You are in ' + NAMES[page] + '.';
      stage.focus({ preventScroll: true });
    });
  }
  if (teleForm) {
    var teleQ = teleForm.querySelector('input');
    teleForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = teleFind(teleQ.value);
      if (f.page !== undefined) { teleQ.value = ''; teleport(f.page); stage.scrollIntoView({ block: 'nearest' }); }
      else if (teleSaid) teleSaid.textContent = f.many ? 'Several rooms have that in their names: keep typing, or pick one from the list.' : 'No room on Cel Street goes by that name.';
    });
    // Picking a name from the list goes there at once; typing waits for Enter.
    teleQ.addEventListener('input', function (e) {
      if (e.inputType && e.inputType !== 'insertReplacementText') return;
      var f = teleFind(teleQ.value);
      if (f.page !== undefined && (f.page === '' || NAMES[f.page].toLowerCase() === teleQ.value.trim().toLowerCase())) teleForm.requestSubmit();
    });
  }

  // A room that is more than one rectangle (a narrow passage opening into a
  // wide hollow) gives its bounds as areas, and you keep to whichever you are
  // in, or are brought back into the nearest.
  function clampPoint(px, pz) {
    var areas = bounds.areas || [bounds], best = null, bd = Infinity;
    areas.forEach(function (a) {
      var x = Math.max(a.x[0], Math.min(a.x[1], px)), z = Math.max(a.z[0], Math.min(a.z[1], pz));
      var d = Math.hypot(x - px, z - pz);
      if (d < bd) { bd = d; best = { x: x, z: z }; }
    });
    return best;
  }
  function clamp() {
    var best = clampPoint(me.x, me.z);
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
    if (travel) { travelStep(dt, now); any = !!travel; }
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
    if (xrOn) { glide = null; vrStand(to); return; }
    if (!gliding) { glide = null; me.x = to.x; me.z = to.z; me.yaw = to.yaw; me.pitch = to.pitch; draw(); tell(); return; }
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
    var road = things.filter(function (t) { return t.kind === 'road'; })[0];
    var lift = things.filter(function (t) { return t.kind === 'lift'; })[0];
    var furniture = things.filter(function (t) { return FURNITURE[t.kind]; });
    var along = { '-1': -2, '1': -2 }, placed = [], open = [];
    doorsNow = placed;
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
      // A street tree never stands in front of the middle of a shop, where
      // you stand to read its sign; it moves along to the gap.
      var ts = (k % 2) ? 1 : -1, tz = z;
      while (!clearOfDoor(ts, tz, 3.4) && tz > z - 9) tz -= 0.8;
      if (clearOfDoor(ts, tz, 3.4)) tree(ts * (ROAD + 1.6), tz, 1);
    }
    var k;
    crossings.forEach(function (c, n) {
      signpost(ROAD + 1.1, c + 4.4, arrowTex, false);
      signpost(-ROAD - 1.1, c - 4.4, slowTex, true);
      if (n % 2 === 0) mirror(ROAD + 1.0, c - 4.5, 1);
    });
    signpost(-ROAD - 1.1, 10.4, slowTex, true);
    // The street's clutter, all the way down: a vending machine against a
    // wall, a bicycle against a pole, a car at the kerb.
    for (z = -20, k = 0; z > -zEnd + 20; z -= 77, k++) vending((k % 2 ? 1 : -1) * (FRONT - 0.6), z, k % 2 ? 1 : -1);
    for (z = -9.4, k = 0; z > -zEnd + 20; z -= 60, k++) bicycle((k % 2 ? 1 : -1) * (ROAD + 1.0), z);
    for (z = -32, k = 0; z > -zEnd + 20; z -= 71, k++) { var cs = k % 2 ? -1 : 1; if (clearOfDoor(cs, z, 4.2)) car(cs * (ROAD - 0.95), z); }
    if (field) treeline(field, 'field');
    if (lift) { liftHead(lift, 'lift'); taken.push({ x: ROAD + 2.0, z: LIFT_Z, r: 2.6 }); }
    furniture.forEach(function (d, n) { furnish(d, 'f' + n); });
    if (road) roadOut(road, 'road', zEnd);
    livable(zEnd, crossings, lots.length ? -zEnd + lots.length * 17.2 + 4 : -zEnd, placed);
    beyond(zEnd, open, !!road);
    sky();
    bake();
    // Stops run from the stoop's end down: the field, the lift, the street
    // furniture by the front door, every door and gate, and the road out at
    // the far end.
    var ends = (field ? 1 : 0) + (lift ? 1 : 0), pre = ends + furniture.length;
    hits.forEach(function (h) {
      var u = h.userData.stop;
      h.userData.stop = u === 'field' ? 0 : u === 'lift' ? (field ? 1 : 0) : u === 'road' ? pre + placed.length
        : typeof u === 'string' && u.charAt(0) === 'f' ? ends + Number(u.slice(1)) : u + pre;
    });
    hits.forEach(function (h) { scene.add(h); h.updateMatrixWorld = function () {}; });
    bounds.z = [-zEnd - 4, field ? TREES - 2.5 : 9];
    stops = placed.map(function (p) {
      return { name: p.name, page: p.page, x: -p.side * 1.5, z: p.z, yaw: p.side < 0 ? Math.PI / 2 : -Math.PI / 2 };
    });
    function said(n) { return n.replace(/^THE /, 'The ').replace(/\B[A-Z]+/g, function (w) { return w.toLowerCase(); }); }
    stops = furniture.map(function (d) {
      var st = FURNITURE[d.kind].stand;
      return { name: d.kind === 'name' ? d.name : said(d.name), page: d.page, x: st.x, z: st.z, yaw: Math.PI / 2, pitch: st.pitch };
    }).concat(stops);
    if (lift) stops.unshift({ name: lift.name, page: lift.page, x: 1.5, z: LIFT_Z, yaw: -Math.PI / 2 });
    if (field) stops.unshift({ name: said(field.name), page: field.page, x: 0, z: TREES - 4, yaw: Math.PI });
    if (road) stops.push({ name: said(road.name), page: road.page, x: 0, z: -zEnd + 5, yaw: 0, pitch: 0.12 });

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
    teleList();
    familiarOut();
    // Arriving at a room by its address (a room's Walk this room), the stage
    // comes to the top of the window once, so the room is above the fold;
    // never if you have already scrolled, and never again as you walk.
    if (roomInAddress()) {
      if (window.scrollY < 10) stage.scrollIntoView({ block: 'start' });
      enter(roomInAddress(), false);
    }
    plateUp();
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

  // Enter, or A on a controller: into the page you are standing at, or into
  // the room or the page through the door you are standing at.
  function goIn() {
    var s = nearest();
    if (s && s.frame) {
      var into = s.frame.tagName === 'IFRAME' ? s.frame : s.frame.querySelector('button, a[href], summary, [tabindex]');
      if (into) into.focus({ preventScroll: true });
    }
    else if (s && ROOMS[s.page] && !(inside && s.page === inside.page)) enter(s.page);
    else if (s && s.page) window.location.href = s.page;
  }
  // Shift and an arrow turns and looks instead of walking, as Q, E, R and F do.
  var SHIFTED = { ArrowUp: 'lookup', ArrowDown: 'lookdown', ArrowLeft: 'turnl', ArrowRight: 'turnr' };
  function keyFor(e) { return e.shiftKey && SHIFTED[e.key] ? SHIFTED[e.key] : KEYS[e.key]; }
  stage.addEventListener('keydown', function (e) {
    if (e.target !== stage) return;
    if (e.key === 'Escape' && inside) { e.preventDefault(); outOfRoom(); return; }
    if (e.key === 'Enter') { goIn(); return; }
    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      var z = e.key === '+' || e.key === '=' ? 'in' : e.key === '-' || e.key === '_' ? 'out' : e.key === '0' ? 'reset' : null;
      if (z) { e.preventDefault(); zoom(z); return; }
    }
    var what = keyFor(e);
    if (!what) return;
    e.preventDefault();
    if (!gliding || what === 'ahead' || what === 'climb') { stepOnce(what); return; }
    if (!held[what]) { held[what] = true; glide = null; soon(); }
  });
  stage.addEventListener('keyup', function (e) {
    var w = KEYS[e.key];
    if (w) held[w] = false;
    if (SHIFTED[e.key]) held[SHIFTED[e.key]] = false;
    if (e.key === 'Shift') Object.keys(SHIFTED).forEach(function (k) { held[SHIFTED[k]] = false; });
  });
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

  // ZOOM, so the words in a room can be read from where you stand: the
  // camera's own zoom, a quarter again at each press, up to four times. The
  // pages stood in a room are drawn through the same camera, so they grow
  // with the picture. It lasts this visit and nothing remembers it.
  var ZOOMS = [1, 1.25, 1.6, 2, 2.5, 3.2, 4], zoomAt = 0;
  function zoom(how) {
    zoomAt = how === 'in' ? Math.min(ZOOMS.length - 1, zoomAt + 1) : how === 'out' ? Math.max(0, zoomAt - 1) : 0;
    camera.zoom = ZOOMS[zoomAt];
    camera.updateProjectionMatrix();
    draw();
    if (zoomedEl) zoomedEl.textContent = zoomAt ? 'Zoomed in ' + ZOOMS[zoomAt] + ' times' : 'Normal size';
  }
  document.querySelectorAll('[data-cel-zoom]').forEach(function (b) {
    b.addEventListener('click', function () { zoom(b.getAttribute('data-cel-zoom')); });
  });
  // A pinch on a trackpad arrives as the wheel with Control held.
  var pinch = 0;
  stage.addEventListener('wheel', function (e) {
    if (!e.ctrlKey) return;
    e.preventDefault();
    pinch += e.deltaY;
    if (Math.abs(pinch) > 40) { zoom(pinch < 0 ? 'in' : 'out'); pinch = 0; }
  }, { passive: false });

  // FULL SCREEN: the street, the words under it, its buttons and its places
  // fill the screen, and Escape or the same button brings them back.
  function fullNow() { return document.fullscreenElement || document.webkitFullscreenElement; }
  if (fullBtn && fullEl && (document.fullscreenEnabled || document.webkitFullscreenEnabled)) {
    fullBtn.hidden = false;
    fullBtn.addEventListener('click', function () {
      if (fullNow()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else {
        var ask = fullEl.requestFullscreen || fullEl.webkitRequestFullscreen;
        var p = ask.call(fullEl);
        if (p && p.catch) p.catch(function () {});
      }
    });
    var flipped = function () {
      fullBtn.textContent = fullNow() ? 'Leave full screen' : 'Full screen';
      if (fullNow()) stage.focus({ preventScroll: true });
      resize();
    };
    document.addEventListener('fullscreenchange', flipped);
    document.addEventListener('webkitfullscreenchange', flipped);
  }

  // A GAME CONTROLLER, such as an Xbox controller on a Mac. A browser shows a
  // page a controller only once one of its buttons has been pressed there,
  // and has no event for a stick moving, so while one is connected, and only
  // then, the page reads it once a frame. Reading it moves nothing: the
  // street is drawn again only when the controller asks for something.
  // Standard mapping: left stick walks, right stick turns and looks, the
  // triggers zoom, the bumpers go to the place before and after, A goes in,
  // B backs out, X faces ahead and Y climbs.
  var pads = 0, padFrame = 0, padLast = 0, padWas = {}, padStepped = {}, placeAt = -1;
  var DEAD = 0.2;
  var padEl = document.querySelector('[data-cel-pad]');
  function padSay() { if (padEl) padEl.hidden = !pads; }
  function axis(v) { return Math.abs(v) < DEAD ? 0 : (v - Math.sign(v) * DEAD) / (1 - DEAD); }
  // The place before or after: counted from the place a bumper last went to
  // while a glide is still on its way there, or else from where you stand.
  function placeBy(n) {
    if (!stops.length) return;
    var s = nearest(), i = glide && placeAt >= 0 && placeAt < stops.length ? placeAt : s ? stops.indexOf(s) : -1;
    i = i < 0 ? (n > 0 ? 0 : stops.length - 1) : (i + n + stops.length) % stops.length;
    placeAt = i;
    standAt(stops[i]);
  }
  // A goes in the way a press on Walk into does, when there is one to press.
  function padIn() {
    var w = hereEl && hereEl.querySelector('.cel-walkin');
    if (w) w.click(); else goIn();
  }
  function padTick(now) {
    padFrame = 0;
    if (!pads) return;
    var dt = padLast ? Math.min((now - padLast) / 1000, 0.1) : 0;
    padLast = now;
    var list = navigator.getGamepads ? navigator.getGamepads() : [];
    var moved = false;
    for (var n = 0; n < list.length; n++) {
      var g = list[n];
      if (!g) continue;
      // Some controllers' drivers give a button's value and leave pressed false.
      var b = function (k) { var x = g.buttons[k]; return !!x && (x.pressed || x.value > 0.5); };
      var once = function (k) { var key = g.index + ':' + k, was = padWas[key]; padWas[key] = b(k); return b(k) && !was; };
      if (once(0)) padIn();
      if (once(1) && inside) outOfRoom();
      if (once(2)) { stepOnce('ahead'); }
      if (once(3)) { stepOnce('climb'); }
      if (once(4)) placeBy(-1);
      if (once(5)) placeBy(1);
      if (once(6)) zoom('out');
      if (once(7)) zoom('in');
      var fwd = -axis(g.axes[1] || 0) + (b(12) ? 1 : 0) - (b(13) ? 1 : 0);
      var side = axis(g.axes[0] || 0) + (b(15) ? 1 : 0) - (b(14) ? 1 : 0);
      var turn = -axis(g.axes[2] || 0), look = -axis(g.axes[3] || 0);
      if (gliding) {
        if (fwd || side || turn || look) {
          glide = null;
          move(fwd, side, turn, look, { m: WALK * dt, t: TURN * dt });
          moved = true;
        }
      } else {
        // In steps, a push of a stick is one step, and letting it go is needed
        // before the next.
        [['fwd', fwd > 0.6], ['back', fwd < -0.6], ['right', side > 0.6], ['left', side < -0.6],
         ['turnl', turn > 0.6], ['turnr', turn < -0.6], ['lookup', look > 0.6], ['lookdown', look < -0.6]].forEach(function (p) {
          var key = g.index + ':' + p[0];
          if (p[1] && !padStepped[key]) stepOnce(p[0]);
          padStepped[key] = p[1];
        });
      }
    }
    if (moved) { draw(); tell(); }
    padFrame = requestAnimationFrame(padTick);
  }
  window.addEventListener('gamepadconnected', function () {
    pads++; padSay();
    if (!padFrame) { padLast = 0; padFrame = requestAnimationFrame(padTick); }
  });
  window.addEventListener('gamepaddisconnected', function () {
    pads = Math.max(0, pads - 1); padSay();
    if (!pads && padFrame) { cancelAnimationFrame(padFrame); padFrame = 0; padWas = {}; padStepped = {}; }
  });

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
    // A thing a room lets you press is pressed; anything else stands you there.
    if (hit && hit.object.userData.take && heldBy('screen') && putOn(hit.object, 'screen')) return;
    if (hit && hit.object.userData.hold) { holdToggle(hit.object, 'screen'); return; }
    if (hit && hit.object.userData.act) hit.object.userData.act.go();
    else if (hit) standAt(stops[hit.object.userData.stop]);
    stage.focus({ preventScroll: true });
  });

  /* ── Other people in the room, as 3D figures ──────────────────────────── */
  // Helen Edgar's ask, 2026-11-07, her Faery Yurt first: see the people who
  // are in the room and chat with them. THE RADIO DOES THE ASKING AND THIS
  // DOES THE DRAWING. Walking into a room says so on <body> (radioRoom), and
  // the radio becomes that room's: its channel is where you chat, Be seen here
  // is how you are seen, and Show my avatar in 3D rooms (cb.js) sends which of
  // this room's places you are at. This page says which (love-cel-spot: the
  // place's index in the room's own list, never a position), and draws the
  // people the radio hears of (love-cel-folk), each a figure built here out of
  // the avatar they wear: its body's shape, skin, hair, pose, chair and aids,
  // and its clothes as blocks of their own colours, every colour read by name
  // out of avatar.js's own tables. Nothing here is fetched or kept: the list
  // is the radio's, and it goes when you leave the room.
  var folkGroup = null, folkList = null, spotSaid = '', wornWings = null;
  // The place you are at: the nearest by distance alone, so a headset's free
  // walking still counts, and none when you are far from any.
  function spotOf() {
    var best = -1, bd = 6;
    stops.forEach(function (s, i) { var d = Math.hypot(s.x - me.x, s.z - me.z); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  function spotTell() {
    var i = inside ? spotOf() : -1;
    var key = inside ? inside.page + ':' + i + ':' + (wornWings || '') : '';
    if (key === spotSaid) return;
    spotSaid = key;
    window.dispatchEvent(new CustomEvent('love-cel-spot', { detail: inside && i >= 0 ? { room: inside.page.replace(/\.html$/, ''), spot: i, wings: wornWings } : null }));
  }
  function folkClear() {
    if (!folkGroup) return;
    folkGroup.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material && o.material.map) o.material.map.dispose();
    });
    if (folkGroup.parent) folkGroup.parent.remove(folkGroup);
    folkGroup = null;
  }
  // A figure in its colours: a toon mesh and the ink hull behind it.
  function figurePart(g, geo, colour, m) {
    var mesh = new THREE.Mesh(geo, painted(new THREE.MeshToonMaterial({ color: new THREE.Color(colour), gradientMap: gradient })));
    mesh.matrixAutoUpdate = false; mesh.matrix.copy(m); mesh.castShadow = true;
    g.add(mesh);
    var h = new THREE.Mesh(geo, inkMat);
    h.matrixAutoUpdate = false;
    h.matrix.copy(m).multiply(new THREE.Matrix4().makeScale(1.07, 1.05, 1.07));
    g.add(h);
    return mesh;
  }
  var SIZE = { shorter: 0.92, middling: 1, taller: 1.08 };
  var WIDTH = { narrow: 0.34, middling: 0.4, broad: 0.46 };
  var DEPTH = { flat: 0.18, soft: 0.22, round: 0.26, big: 0.32 };
  var HIPS = { narrow: 0.3, middling: 0.36, wide: 0.42 };
  // The four pairs are real wings (Helen's ask, 2026-11-09: "real butterfly
  // and moth wings"): photographs with their backgrounds cut away, the same
  // files the yurt's basket shows and credits (faery-yurt/), each on one flat
  // plane across the shoulders, angled back a little, drawn as the picture it
  // is and never painted or inked (a material with a map is never painted).
  // Loaded once each through three.js's own image loader, only when a figure
  // first wears the pair.
  var WING_NAMES = { moth: 'Moth', monarch: 'Monarch', lady: 'American lady', fritillary: 'Fritillary' };
  function wingName(w) { return WING_NAMES[w] || (w.charAt(0).toUpperCase() + w.slice(1)); }
  var WING_FILES = { moth: 'faery-yurt/moth.png', monarch: 'faery-yurt/wings-monarch.png', lady: 'faery-yurt/wings-lady.png', fritillary: 'faery-yurt/wings-fritillary.png' };
  var wingTex = {};
  function wingPicture(pair) {
    if (!wingTex[pair]) {
      var t = new THREE.TextureLoader().load(WING_FILES[pair], function () { draw(); });
      t.colorSpace = THREE.SRGBColorSpace;
      wingTex[pair] = t;
    }
    return wingTex[pair];
  }
  function wingsOf(pair, g, sw, sd, y) {
    var w = 0.9, h = 0.62;
    var mat = new THREE.MeshBasicMaterial({ map: wingPicture(pair), transparent: true, alphaTest: 0.2, side: THREE.DoubleSide, depthWrite: false });
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.matrixAutoUpdate = false;
    mesh.matrix.copy(at(0, y + 0.12, sd / 2 + 0.05, -0.18, 0, 0));
    g.add(mesh);
  }
  var WINGS = {
    moth: function (g, sw, sd, y) { wingsOf('moth', g, sw, sd, y); },
    monarch: function (g, sw, sd, y) { wingsOf('monarch', g, sw, sd, y); },
    lady: function (g, sw, sd, y) { wingsOf('lady', g, sw, sd, y); },
    fritillary: function (g, sw, sd, y) { wingsOf('fritillary', g, sw, sd, y); }
  };

  function figureOf(who) {
    var A = window.loveAvatar && window.loveAvatar.data, look = who.look;
    if (!A || !look) return null;
    var g = new THREE.Group();
    var body = look.base === 'bodymind' && look.body ? look.body : {};
    var wear = look.wear || {};
    var skin = (A.body.colours.skin[body.skin] || A.body.colours.skin.t5);
    var hairC = body.hairColour === 'rainbow' ? A.body.colours.hair_rainbow[0] : (A.body.colours.hair[body.hairColour] || A.body.colours.hair.brown);
    var layer = A.inks[body.layer] || A.inks.coal;
    function cloth(slot, fallback) {
      var w = wear[slot], cw = w && A.colourways[w[2]];
      return cw && cw.inks && A.inks[cw.inks[0]] ? A.inks[cw.inks[0]] : fallback;
    }
    var k = SIZE[body.height] || 1, sw = WIDTH[body.shoulders] || 0.4, sd = DEPTH[body.middle] || 0.22, hw = HIPS[body.hips] || 0.36;
    var seated = body.pose === 'wheelchair' || body.pose === 'powerchair';
    var chair = A.body.colours.chair, chairL = A.body.colours.chair_light;
    var legY = seated ? 0.5 : 0, legH = seated ? 0.46 : 0.78 * k, torsoY = legY + legH;
    var top = cloth('top', layer), bottom = cloth('bottom', A.inks.denim === layer ? A.inks.coal : layer), feet = cloth('feet', A.inks.black);
    // Legs and feet.
    if (seated) {
      figurePart(g, new THREE.BoxGeometry(hw, 0.16, 0.44), bottom, at(0, legY + 0.38, -0.2));
      figurePart(g, new THREE.BoxGeometry(hw, 0.4, 0.14), bottom, at(0, legY + 0.1, -0.4));
      figurePart(g, new THREE.BoxGeometry(hw, 0.08, 0.22), feet, at(0, 0.12, -0.46));
      // The chair: seat, back, wheels; a powerchair sits lower and squarer, with a joystick.
      var power = body.pose === 'powerchair';
      figurePart(g, new THREE.BoxGeometry(hw + 0.16, 0.08, 0.5), chair, at(0, legY - 0.04, -0.12));
      figurePart(g, new THREE.BoxGeometry(hw + 0.16, 0.5, 0.06), chair, at(0, legY + 0.22, 0.14));
      if (power) {
        figurePart(g, new THREE.BoxGeometry(hw + 0.2, 0.26, 0.56), chair, at(0, legY - 0.22, -0.1));
        [-1, 1].forEach(function (sd2) { figurePart(g, new THREE.CylinderGeometry(0.16, 0.16, 0.08, 12), chairL, at(sd2 * (hw / 2 + 0.14), 0.16, -0.12, 0, 0, Math.PI / 2)); });
        figurePart(g, new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6), chairL, at(hw / 2 + 0.16, legY + 0.14, -0.2));
      } else {
        [-1, 1].forEach(function (sd2) { figurePart(g, new THREE.CylinderGeometry(0.3, 0.3, 0.04, 16), chairL, at(sd2 * (hw / 2 + 0.12), 0.3, -0.02, 0, 0, Math.PI / 2)); });
      }
    } else {
      [-1, 1].forEach(function (sd2) {
        figurePart(g, new THREE.BoxGeometry(hw * 0.42, legH, 0.2), bottom, at(sd2 * hw * 0.27, legH / 2, 0));
        figurePart(g, new THREE.BoxGeometry(hw * 0.42, 0.08, 0.3), feet, at(sd2 * hw * 0.27, 0.04, -0.06));
      });
    }
    // Torso, an outer layer over it, arms, hands.
    var torsoH = 0.6 * k;
    figurePart(g, new THREE.BoxGeometry(sw, torsoH, sd), top, at(0, torsoY + torsoH / 2, 0));
    if (wear.outer) figurePart(g, new THREE.BoxGeometry(sw + 0.08, torsoH * 0.9, sd + 0.08), cloth('outer', layer), at(0, torsoY + torsoH * 0.5, 0));
    var sleeve = wear.outer ? cloth('outer', layer) : top;
    var armH = torsoH * 0.9;
    [-1, 1].forEach(function (sd2) {
      var ax = sd2 * (sw / 2 + 0.07 + (wear.outer ? 0.04 : 0));
      figurePart(g, new THREE.BoxGeometry(0.11, armH, 0.11), sleeve, at(ax, torsoY + torsoH - armH / 2, seated ? -0.04 : 0));
      figurePart(g, new THREE.BoxGeometry(0.1, 0.1, 0.1), skin, at(ax, torsoY + torsoH - armH - 0.04, seated ? -0.04 : 0));
    });
    // A pair of wings borrowed from a room's basket (Helen's yurt): a real
    // moth or butterfly, a photograph across the shoulders, angled back.
    // Nothing of them moves.
    if (WINGS[who.wings]) WINGS[who.wings](g, sw, sd, torsoY + torsoH * 0.78);
    // Head, face (the eyes and the mouth in ink, so every face reads at a
    // distance), hair, hat, glasses, mask.
    var headY = torsoY + torsoH + 0.18, faceZ = -0.13;
    figurePart(g, new THREE.BoxGeometry(0.24, 0.28, 0.24), skin, at(0, headY, 0));
    var ink = css('--cel-ink');
    if (body.eyes !== 'closed') [-1, 1].forEach(function (sd2) { figurePart(g, new THREE.BoxGeometry(0.035, 0.035, 0.02), ink, at(sd2 * 0.055, headY + 0.03, faceZ)); });
    else [-1, 1].forEach(function (sd2) { figurePart(g, new THREE.BoxGeometry(0.05, 0.012, 0.02), ink, at(sd2 * 0.055, headY + 0.03, faceZ)); });
    figurePart(g, new THREE.BoxGeometry(body.mouth === 'grin' || body.mouth === 'smile' ? 0.08 : 0.05, 0.012, 0.02), ink, at(0, headY - 0.06, faceZ));
    if (body.faceAid === 'mask') figurePart(g, new THREE.BoxGeometry(0.2, 0.12, 0.03), A.body.colours.mask, at(0, headY - 0.05, faceZ));
    if (body.eyewear === 'glasses' || body.eyewear === 'dark') figurePart(g, new THREE.BoxGeometry(0.22, 0.05, 0.02), body.eyewear === 'dark' ? ink : A.body.colours.aid, at(0, headY + 0.03, faceZ - 0.01));
    var hair = body.hair || 'short';
    if (hair !== 'bald') {
      var big = hair === 'afro' || hair === 'curly', longH = hair === 'long' || hair === 'wavy' || hair === 'braids' || hair === 'locs';
      figurePart(g, new THREE.BoxGeometry(big ? 0.34 : 0.27, big ? 0.2 : hair === 'shaved' ? 0.06 : 0.1, big ? 0.34 : 0.27), hairC, at(0, headY + 0.13 + (big ? 0.03 : 0), 0.01));
      if (longH) figurePart(g, new THREE.BoxGeometry(0.26, 0.36, 0.1), hairC, at(0, headY - 0.04, 0.14));
      if (hair === 'bun' || hair === 'ponytail') figurePart(g, new THREE.SphereGeometry(0.07, 10, 8), hairC, at(0, headY + (hair === 'bun' ? 0.14 : 0.02), 0.16));
      if (hair === 'mohawk') figurePart(g, new THREE.BoxGeometry(0.06, 0.14, 0.26), hairC, at(0, headY + 0.22, 0));
      if (hair === 'bob') figurePart(g, new THREE.BoxGeometry(0.3, 0.2, 0.3), hairC, at(0, headY + 0.02, 0.02));
    }
    if (wear.head) figurePart(g, new THREE.BoxGeometry(0.32, 0.1, 0.32), cloth('head', layer), at(0, headY + 0.22, 0));
    if (body.ears === 'defenders' || body.ears === 'headphones') [-1, 1].forEach(function (sd2) { figurePart(g, new THREE.BoxGeometry(0.05, 0.1, 0.1), A.body.colours.aid_dark, at(sd2 * 0.14, headY, 0)); });
    // Something always with them, in the hand it is in.
    var hands = body.hands;
    if (hands === 'cane' || hands === 'white' || hands === 'crutches' || hands === 'walker') {
      var ac = hands === 'white' ? A.body.colours.white_cane : A.body.colours.aid;
      var hx = sw / 2 + 0.2;
      if (hands === 'walker') {
        figurePart(g, new THREE.BoxGeometry(sw + 0.2, 0.04, 0.04), ac, at(0, 0.9 * k, -0.3));
        [-1, 1].forEach(function (sd2) { figurePart(g, new THREE.CylinderGeometry(0.015, 0.015, 0.9 * k, 6), ac, at(sd2 * (sw / 2 + 0.08), 0.45 * k, -0.3)); });
      } else {
        figurePart(g, new THREE.CylinderGeometry(0.015, 0.015, torsoY + 0.1, 6), ac, at(hx, (torsoY + 0.1) / 2, -0.05));
        if (hands === 'white') figurePart(g, new THREE.CylinderGeometry(0.025, 0.025, 0.1, 6), A.body.colours.cane_tip, at(hx, 0.05, -0.05));
        if (hands === 'crutches') figurePart(g, new THREE.CylinderGeometry(0.015, 0.015, torsoY + 0.1, 6), ac, at(-hx, (torsoY + 0.1) / 2, -0.05));
      }
    }
    // Their name over their head, facing you wherever you stand.
    var map = tex(512, 128, function (c, w, h) {
      var face = getComputedStyle(stage).fontFamily;
      c.fillStyle = css('--cel-page'); c.fillRect(0, 0, w, h);
      c.strokeStyle = css('--cel-ink'); c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10);
      c.fillStyle = css('--cel-ink'); c.textAlign = 'center'; c.textBaseline = 'middle';
      var size = 56;
      do { c.font = '700 ' + size + 'px ' + face; size -= 4; } while (c.measureText(who.handle).width > w - 40 && size > 20);
      c.fillText(who.handle, w / 2, h / 2);
    });
    var tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: map, depthTest: false }));
    tag.scale.set(0.5, 0.125, 1);
    tag.position.set(0, headY + 0.5, 0);
    g.add(tag);
    return g;
  }
  function folkDraw() {
    folkClear();
    if (!inside || !folkList || folkList.room !== inside.page.replace(/\.html$/, '') || !folkList.folk.length) { draw(); return; }
    folkGroup = new THREE.Group();
    var bySpot = {};
    folkList.folk.forEach(function (who) {
      var s = stops[who.spot];
      if (!s) return;
      var fig = figureOf(who);
      if (!fig) return;
      var n = (bySpot[who.spot] = (bySpot[who.spot] || 0) + 1);
      // Beside the place, never on it: you may be standing there yourself, and
      // from inside a figure all you see is its ink. Several at one place
      // stand side by side, a stride apart, facing what the place faces.
      var side = (Math.floor((n - 1) / 2) + 1) * 0.8 * (n % 2 ? 1 : -1);
      fig.position.set(s.x + Math.cos(s.yaw) * side, 0, s.z - Math.sin(s.yaw) * side);
      fig.rotation.y = s.yaw;
      folkGroup.add(fig);
    });
    scene.add(folkGroup);
    draw();
  }
  window.addEventListener('love-cel-folk', function (e) {
    var d = e.detail;
    folkList = d && d.room && Array.isArray(d.folk) ? { room: d.room, folk: d.folk } : null;
    if (!folkList || !folkList.folk.length) { folkDraw(); return; }
    loadScript('avatar.js', function () { return !!window.loveAvatar; }).then(folkDraw, function () {});
  });

  /* ── In a headset ──────────────────────────────────────────────────────── */
  // Helen Edgar's ask, 2026-11-07, starting with her Faery Yurt: the room in a
  // VR headset, through the headset's own browser (WebXR). It is offered only
  // on the street and in a room whose file says vr: true (the street since
  // Ryan's ask of 2026-11-08, with the Campgrounds), and only where the
  // browser can show a room in a headset at all, so on every screen nothing about the room
  // changes: Enter VR stays hidden and none of this runs.
  //
  // IN THE HEADSET YOU MOVE ONLY WHILE YOUR OWN HAND SAYS SO. You look round
  // by turning your head, and you move by pointing and pressing (at the floor
  // to stand there, at a place to stand at it, facing what is there) or by
  // pushing a stick forward or back, which glides you the way your head faces
  // for as long as it is pushed, at a walking pace, and stops when you let go;
  // pushed sideways, it turns you, slowly, for as long as it is pushed.
  // Ryan's calls, 2026-11-07, reversing the trial's "no gliding" and its
  // snap turns: navigating by pointing alone was too hard. Gliding makes some
  // people sick, so the panel switches to steps (no walking, and a stick
  // turns you a twelfth of the way round at a time), and pointing still works
  // either way. Nothing ever carries you to a place: pointing at one stands
  // you there.
  //
  // A ROOM BEHIND A ROOM IS WALKED INTO WITHOUT LEAVING THE HEADSET: standing
  // at its way through, the panel says Walk into it (and pointing at the way
  // again does the same), and Back out takes you back to the way you came in
  // by. A room that does not say vr: true takes you out of the headset and
  // says so; the street and every room that does keep you in it.
  // Up over the roofs is offered in the headset too, as a press of its own
  // that says how high it is first, and down again is one press.
  // What a room lets move moves as it does on a screen, under the same line.
  //
  // THE ROOM'S SWITCHES ARE A PANEL IN FRONT OF YOU, the same switches as
  // under the line that says where you are, read off the buttons the room
  // makes (so they say what those say), pressed by pointing, with what each
  // did written at the top. It comes back in front of you wherever you go,
  // and a squeeze or its own last button puts it out of the way.
  //
  // A ROOM'S OWN PAGE IS NOT IN THE HEADSET: a page stood in the scene is a
  // web page laid over the picture, and a headset shows only the picture.
  // Rendering every frame here is the headset's need, not motion: it asks for
  // a picture for each eye every frame, and the room is as still as ever.
  // tools/make-cel-street.py holds that the frames run only while a session
  // is open, and tools/make-csp.py that only this script asks for a headset.
  var vrBtn = document.querySelector('[data-cel-vr]');
  var vrNote = document.querySelector('[data-cel-vr-said]');
  var xrCan = false, xrOn = false, xrSession = null, xrLast = 0;
  var dolly = new THREE.Group();
  var FLOOR = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  var xrRay = new THREE.Raycaster(), xrAim = new THREE.Matrix4(), xrAt = new THREE.Vector3(), xrQ = new THREE.Euler();
  var hands = [], panel = null, panelTiles = [], panelOpen = true, panelWords = '', chatLast = null;
  var PANEL_FAR = 0.85, PANEL_TALL = 0.95, PANEL_LEAN = -0.25;
  // Metres a second with a stick pushed all the way: a walking pace, slower
  // than the screen's, because speed is what makes a glide sickening.
  // Turning with a stick glides too, at VR_TURN radians a second all the way
  // over, about a fifth of a turn: slow, because turning is the most
  // sickening way to be moved. With gliding off, a stick steps you round.
  var VR_WALK = 1.4, VR_TURN = 1.2, xrGlide = true, xrGoing = false, xrPrev = 0, xrWhy = '';
  // HELEN EDGAR'S HEADSET ROUND (2026-11-11, after her first real headset:
  // "do all of above"): xrStep is the snap turn, a twelfth, an eighth or a
  // quarter of the way round; xrSeat how far below standing eye height you
  // sit (the panel's Sit down, or a room's kit.sit); xrVoice whether each
  // place is read aloud as you arrive, in the headset only; xrTour the guided
  // walk's next place, 0 when not walking; xrDim a moment of dark the walk
  // puts between places; vignette the ring that darkens the edges of the view
  // while a stick glides you, which is what keeps a glide from turning a
  // stomach; xrMode VR or passthrough. SEAT is a sitting eye height below
  // standing, TOUR_EVERY the walk's pace.
  var stature = null;
  var xrStep = STEP_TURN, xrSeat = 0, xrVoice = true, xrTour = 0, xrTourAt = 0, xrDim = 0, vignette = null, xrMode = 'immersive-vr', arCan = false, xrSky = null;
  var SEAT = 0.55, TOUR_EVERY = 7000, seated = null;
  // THE HEADSET ROUND OF 2026-11-12 (Helen Edgar, after her rooms' sounds:
  // "anything else to improve VR experience in my yurt and all subrooms",
  // then "All of them"). BUZZ and BUZZ_MS are the strength and length of the
  // small buzz a controller gives on a press or a pick-up (xrBuzz: null
  // follows the dial, none at Gentle or in a low-stimulation mode; true or
  // false is the panel's switch for this visit). GRAB is how near a hand has
  // to be to a thing to take it by reaching. xrBreak is the bodymind break in
  // the headset: the room put away for a still, dim, empty place. xrLight is
  // the lighter picture (no cast shadows, only the LAMPS_NEAR lamps that light
  // where you stand most),
  // switched on by itself when frames have run slower than SLOW for SLOW_FOR
  // seconds, and by the panel's switch (xrLightAsked, after which nothing
  // changes it by itself). reader is the room's own page, read off the page
  // itself onto a board where the page stands, because a headset shows no
  // page. palms are the tracked hands, drawn joint by joint.
  var BUZZ = 0.35, BUZZ_MS = 35, GRAB = 0.14, SLOW = 1 / 45, SLOW_FOR = 2.5, LAMPS_NEAR = 4;
  var xrBuzz = null, xrBreak = false, breakScene = null, xrLight = false, xrLightAsked = false, xrSlow = 0, xrLampsAt = 0;
  var reader = null, readerTiles = [], palms = [], knuckle = null;
  var arBtn = document.querySelector('[data-cel-ar]');
  // Whether where you are now can be shown in a headset: the street can, and
  // a room only when its file says vr: true.
  function vrHere() { return inside ? inside.vr : true; }
  // The newest few messages on the radio's channel, for the panel, handed over
  // by the radio (cb.js) out of what it already shows; nothing asked for here.
  window.addEventListener('love-cel-chat', function (e) {
    var d = e.detail;
    chatLast = d && Array.isArray(d.lines) && d.lines.length ? { channel: String(d.channel || ''), lines: d.lines.slice(-3) } : null;
    if (xrOn && panelOpen) vrPanel();
  });
  if (navigator.xr && navigator.xr.isSessionSupported) {
    navigator.xr.isSessionSupported('immersive-vr').then(function (ok) { xrCan = !!ok; vrOffer(); }).catch(function () {});
  }
  function vrOffer() {
    if (vrBtn) vrBtn.hidden = !(xrCan && vrHere()) && !xrOn;
    if (arBtn) arBtn.hidden = !(arCan && vrHere()) || xrOn;
    if (!xrOn) return;
    panelWords = '';
    readerUp();
    if (vrHere()) { vrPanel(); return; }
    xrWhy = inside.name + ' is not offered in a headset yet, so you are back on the screen.';
    if (xrSession) xrSession.end();
  }
  function vrTell(words) { panelWords = words; if (xrOn) vrPanel(); }

  // Where your head is, on the floor, in the room, and which way it faces.
  function headLocal() {
    xrQ.setFromQuaternion(camera.quaternion, 'YXZ');
    return { x: camera.position.x, z: camera.position.z, yaw: xrQ.y };
  }
  function footFor(x, z, yaw) {
    var h = headLocal(), c = Math.cos(yaw), s = Math.sin(yaw);
    me.x = x - (c * h.x + s * h.z); me.z = z - (-s * h.x + c * h.z); me.yaw = yaw;
  }
  function headWorld() {
    var h = headLocal(), c = Math.cos(me.yaw), s = Math.sin(me.yaw);
    return { x: me.x + c * h.x + s * h.z, z: me.z - s * h.x + c * h.z, yaw: me.yaw + h.yaw };
  }
  function inBounds(x, z) {
    return (bounds.areas || [bounds]).some(function (a) { return x >= a.x[0] && x <= a.x[1] && z >= a.z[0] && z <= a.z[1]; });
  }
  function vrStand(to) {
    footFor(to.x, to.z, to.yaw - headLocal().yaw);
    place(); vrPanelPlace(); tell();
  }

  // The panel: a heading saying what was last done, the room's switches, and
  // a last row to put the panel away or leave the headset.
  function tileTex(words, pressed, wide, shape) {
    var w = wide ? 1024 : 512, h = shape ? Math.max(96, Math.round(w / shape)) : wide ? 192 : 128;
    return tex(w, h, function (g) {
      var face = getComputedStyle(stage).fontFamily;
      g.fillStyle = css(pressed ? '--cel-ink' : '--cel-page'); g.fillRect(0, 0, w, h);
      g.strokeStyle = css('--cel-ink'); g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
      g.fillStyle = css(pressed ? '--cel-page' : '--cel-ink');
      var size = wide ? 44 : 40, lines;
      do {
        g.font = '700 ' + size + 'px ' + face;
        lines = []; var line = '';
        String(words).split(/\s+/).forEach(function (wd) {
          var t = line ? line + ' ' + wd : wd;
          if (g.measureText(t).width > w - 48 && line) { lines.push(line); line = wd; } else line = t;
        });
        if (line) lines.push(line);
        size -= 3;
      } while (lines.length * (size + 8) > h - 24 && size > 18);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      var lh = size + 8, y0 = h / 2 - (lines.length - 1) * lh / 2;
      lines.forEach(function (l, i) { g.fillText(l, w / 2, y0 + i * lh); });
    });
  }
  function vrPanel() {
    if (!panel) { panel = new THREE.Group(); dolly.add(panel); }
    panelTiles.forEach(function (t) { t.geometry.dispose(); t.material.map.dispose(); t.material.dispose(); });
    while (panel.children.length) panel.remove(panel.children[0]);
    panelTiles = [];
    var items = [];
    if (xrBreak) {
      // The break's own panel: what it is, the way back, and nothing of the
      // room's. It stops nothing by itself; a sound still going is offered.
      items.push({ words: panelWords || 'A bodymind break. The room is put away and nothing here moves. Stay as long as you like; the room is as you left it.', wide: true });
      if (captions().length) items.push({ words: 'Quiet the room’s sounds', wide: true, go: function () { soundsOff(); if (window.loveFire) window.loveFire.off(); vrTell('The room’s sounds are quiet. They start again only when you press them.'); } });
      items.push({ words: 'Come back to the room', wide: true, go: function () { breakSet(false); } });
      if (panelOpen) items.push({ words: 'Put the switches away', go: function () { panelOpen = false; vrPanel(); } });
      else items.push({ words: 'Show the switches', go: function () { panelOpen = true; vrPanel(); } });
      items.push({ words: 'Take the headset out of the room', go: function () { if (xrSession) xrSession.end(); } });
    } else if (panelOpen) {
      items.push({ words: panelWords || ((inside ? 'In ' + inside.name : up ? 'Up over the roofs' : 'Out on Cel Street') + '. Push a stick forward or back to walk, or point and press: at the floor to stand there, at a switch to press it.'), wide: true });
      if (chatLast) {
        items.push({ words: 'On the radio, ' + chatLast.channel.toLowerCase() + ':', wide: true, label: true });
        chatLast.lines.forEach(function (l) {
          var words = String(l.handle || '') + ': ' + String(l.text || '').replace(/\s+/g, ' ');
          items.push({ words: words.length > 110 ? words.slice(0, 107) + '\u2026' : words, wide: true });
        });
      }
      // What is sounding, in words, for as long as it sounds: nobody has to
      // hear the rain to know it is raining.
      var heard = captions();
      if (heard.length) items.push({ words: 'Sounding now: ' + heard.join('; ') + '.', wide: true, label: true });
      // The break and the dial first, where a hand finds them quickest.
      items.push({ words: 'I need a bodymind break (the room is put away for a still, dim, empty place)', wide: true, go: function () { breakSet(true); } });
      var lv = window.loveLevel;
      if (lv) {
        items.push({ words: lv.ask || 'How loud do you want it?', wide: true, label: true });
        lv.levels.forEach(function (key) {
          items.push({ words: lv.names[key], pressed: lv.now() === key,
            go: function () { lv.set(key); moves(); vrTell(lv.names[key] + '. ' + (key === 'gentle' ? 'Nothing in the room moves by itself, and the controllers do not buzz.' : key === 'max' ? 'What the room lets move at MAX moves.' : 'Things move only when you press their switches.')); } });
        });
      }
      var holder = document.createElement('div');
      (scene.userData.ctl || []).forEach(function (c) { holder.appendChild(c.make(false)); });
      holder.querySelectorAll('.cel-roomctl__name, button').forEach(function (el) {
        if (el.tagName === 'BUTTON') items.push({ words: el.textContent, pressed: el.getAttribute('aria-pressed') === 'true', btn: el });
        else items.push({ words: el.textContent, wide: true, label: true });
      });
      // (Not called at: the tiles' layout below counts columns in a var at,
      // the same variable, and Walk into pressed with a number.)
      var wayIn = nearest();
      if (wayIn && ROOMS[wayIn.page] && !(inside && wayIn.page === inside.page)) {
        var inPage = wayIn.page;
        items.push({ words: 'Walk into ' + (wayIn.room || wayIn.name), wide: true, go: function () { enter(inPage); } });
      }
      var back = behind.length ? behind[behind.length - 1].inside : null;
      if (inside) items.push({ words: back ? 'Back out into ' + back.name : 'Back out onto the street', wide: true, go: function () { outOfRoom(); } });
      if (!inside) items.push({ words: up ? 'Climb back down to the street' : 'Climb up over the roofs (high up, ' + ROOF + ' metres, looking down)', wide: true,
        go: function () { act('climb'); place(); vrPanelPlace(); tell(); vrTell(up ? 'Up over the roofs, looking down on the solar panels. One press brings you back down.' : 'Back down on the street.'); } });
      items.push({ words: xrGlide ? 'Gliding with the sticks: switch to steps' : 'Steps: switch to gliding with the sticks', pressed: !xrGlide,
        go: function () { xrGlide = !xrGlide; vrTell(xrGlide ? 'Gliding: push a stick forward or back to walk, or sideways to turn.' : 'Steps: a stick turns you a twelfth of the way round at a time; point and press to move.'); } });
      items.push({ words: xrSeat ? 'Stand up' : 'Sit down where you are (eyes at a sitting height)', pressed: !!xrSeat,
        go: function () { xrSeat = xrSeat ? 0 : SEAT; seated = null; place(); vrPanelPlace(); vrTell(xrSeat ? 'Sitting: your eyes are at a sitting height. Stand up puts them back.' : 'Standing again.'); } });
      items.push({ words: 'A little lower', go: function () { xrSeat = Math.min(1.0, xrSeat + 0.08); place(); vrPanelPlace(); vrTell('A little lower.'); } });
      items.push({ words: 'A little higher', go: function () { xrSeat = Math.max(-0.4, xrSeat - 0.08); place(); vrPanelPlace(); vrTell('A little higher.'); } });
      items.push({ words: 'Snap turn ' + Math.round(xrStep * 180 / Math.PI) + ' degrees (press to change)',
        go: function () { xrStep = xrStep === Math.PI / 6 ? Math.PI / 4 : xrStep === Math.PI / 4 ? Math.PI / 2 : Math.PI / 6; vrPanel(); vrTell('Snap turns of ' + Math.round(xrStep * 180 / Math.PI) + ' degrees, in steps.'); } });
      items.push({ words: 'Turn left', go: function () { snapTurn(-1); } });
      items.push({ words: 'Turn right', go: function () { snapTurn(1); } });
      items.push({ words: 'Put me back at the way in', go: function () { if (stops[0]) vrStand(stops[0]); vrTell('Back at the way in.'); } });
      items.push({ words: buzzOn() ? 'A buzz in the hand on a press: on' : 'A buzz in the hand on a press: off', pressed: buzzOn(),
        go: function () { xrBuzz = !buzzOn(); vrTell(xrBuzz ? 'The controller gives a small buzz when you press or pick something up.' : 'The controllers do not buzz.'); } });
      items.push({ words: xrLight ? 'Picture: lighter (press for full)' : 'Picture: full (press for lighter)', pressed: xrLight,
        go: function () { xrLightAsked = true; lighterSet(!xrLight); vrTell(xrLight ? 'A lighter picture: no cast shadows, and only the lamps that light where you stand, so it runs smoothly.' : 'The full picture again, shadows and every lamp.'); } });
      items.push({ words: xrVoice ? 'Places read aloud: on' : 'Places read aloud: off', pressed: xrVoice,
        go: function () { xrVoice = !xrVoice; if (!xrVoice && window.speechSynthesis) window.speechSynthesis.cancel(); vrPanel(); vrTell(xrVoice ? 'Each place is read aloud as you arrive.' : 'Places are not read aloud.'); } });
      if (inside) items.push({ words: xrTour ? 'Stop the walk round' : 'Walk me round the room, place by place (any press stops it)', pressed: !!xrTour, go: function () { tourToggle(); } });
      if (inside) items.push({ words: lookOf() === 'real' ? 'Look: real (press for cel)' : 'Look: cel (press for real)', go: function () { relook(); } });
      items.push({ words: 'Put the switches away', go: function () { panelOpen = false; vrPanel(); } });
      items.push({ words: 'Take the headset out of the room', go: function () { if (xrSession) xrSession.end(); } });
    } else {
      items.push({ words: 'Show the switches', go: function () { panelOpen = true; vrPanel(); } });
    }
    // Three across, read from a little under an arm's length away. A room with
    // many switches would hang one panel taller than a person, its head over
    // yours and its foot under the floor, so past PANEL_TALL the tiles go on
    // in leaves side by side, each turned to face you: the first straight
    // ahead (what was said, the break and the dial are on it), the next to
    // its right, the next to its left. A leaf starts at a heading where it can.
    var W = 0.22, H = 0.066, GAP = 0.01, COLS = 3, y = 0, at = 0, leaf = null, leaves = [];
    function leafNew() { leaf = { tiles: [], h: 0 }; leaves.push(leaf); y = 0; at = 0; }
    function rowDone() { if (at) { y -= H + GAP; at = 0; } }
    function tall(it) { return it.wide ? (it.label ? H * 0.75 : H * 1.5) : H; }
    // How tall it would all be in one leaf, so the leaves it takes come out
    // about the same height and the last is never three tiles on their own.
    var whole = 0, across = 0;
    items.forEach(function (it) {
      if (it.wide) { if (across) { whole += H + GAP; across = 0; } whole += tall(it) + GAP; }
      else if (++across === COLS) { whole += H + GAP; across = 0; }
    });
    if (across) whole += H + GAP;
    var most = whole / Math.ceil(whole / PANEL_TALL) + H * 2.5;
    leafNew();
    items.forEach(function (it) {
      var wide = it.wide, w = wide ? COLS * W + (COLS - 1) * GAP : W, h = tall(it);
      if (wide) rowDone();
      if (!at && leaf.tiles.length && -y + h > most) {
        // A heading is never left at the foot of a leaf with its switches on
        // the next: it goes over with them.
        var last = leaf.tiles[leaf.tiles.length - 1], head = last.userData.heading && leaf.tiles.length > 1 ? leaf.tiles.pop() : null;
        leafNew();
        if (head) { var hh = head.geometry.parameters.height; head.position.y = -hh / 2; leaf.tiles.push(head); y = -(hh + GAP); }
      }
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tileTex(it.words, it.pressed, wide) }));
      m.position.set(wide ? 0 : (at - (COLS - 1) / 2) * (W + GAP), y - h / 2, 0);
      m.userData.tile = it.btn || it.go ? it : null;
      m.userData.heading = !!it.label;
      leaf.tiles.push(m); panelTiles.push(m);
      if (wide) y -= h + GAP;
      else if (++at === COLS) rowDone();
    });
    leaves.forEach(function (l) { l.tiles.forEach(function (m) { l.h = Math.max(l.h, m.geometry.parameters.height / 2 - m.position.y); }); });
    // The tallest leaf's middle where vrPanelPlace stands the panel, every
    // leaf's top level with it, and each leaf on an arc about where you
    // stand, leaning back about its own middle to face you.
    var tallest = 0, spread = (COLS * W + (COLS - 1) * GAP + 0.05) / PANEL_FAR;
    leaves.forEach(function (l) { tallest = Math.max(tallest, l.h); });
    leaves.forEach(function (l, i) {
      var turn = (i % 2 ? (i + 1) / 2 : -i / 2) * spread, g = new THREE.Group();
      g.position.set(PANEL_FAR * Math.sin(turn), (tallest - l.h) / 2, PANEL_FAR * (1 - Math.cos(turn)));
      g.rotation.set(PANEL_LEAN, -turn, 0, 'YXZ');
      l.tiles.forEach(function (m) { m.position.y += l.h / 2; g.add(m); });
      panel.add(g);
    });
  }
  // In front of your head, a little below it, leaning back to face you.
  function vrPanelPlace() {
    if (!panel) return;
    var h = headLocal();
    // Put away, the one tile that brings the switches back sits lower, out of
    // the way of whatever is being read or looked at.
    panel.position.set(h.x - Math.sin(h.yaw) * PANEL_FAR, Math.max(panelOpen ? 0.8 : 0.6, camera.position.y - (panelOpen ? 0.35 : 0.62)), h.z - Math.cos(h.yaw) * PANEL_FAR);
    panel.rotation.set(0, h.yaw, 0);
  }

  // A BUZZ IN THE HAND: a press that lands, a thing picked up or put down,
  // gives the controller one small buzz, so a press has a feel. It follows
  // the dial (none at Gentle or in a low-stimulation mode) unless the panel's
  // switch says otherwise for this visit, and it is never stronger than BUZZ
  // or longer than BUZZ_MS, which tools/make-cel-street.py holds.
  function buzzOn() {
    if (xrBuzz !== null) return xrBuzz;
    var d = document.documentElement;
    return d.getAttribute('data-intensity') !== 'gentle' && !d.hasAttribute('data-low');
  }
  function buzz(hand, much) {
    var src = hand && hand.userData.src, pad = src && src.gamepad, motor = pad && pad.hapticActuators && pad.hapticActuators[0];
    if (!motor || !motor.pulse || !buzzOn()) return;
    try { motor.pulse(BUZZ * Math.min(1, much || 1), BUZZ_MS); } catch (e) { /* no motor in this hand */ }
  }
  // WITHIN REACH: the nearest thing of a list a hand is close enough to take
  // hold of, measured to the thing's own edge and not its middle.
  var REACH = new THREE.Vector3(), REACH_C = new THREE.Vector3();
  function within(hand, list, want) {
    REACH.setFromMatrixPosition(hand.matrixWorld);
    var best = null, bd = GRAB;
    for (var i = 0; i < list.length; i++) {
      var o = list[i];
      if (!o.geometry || o.userData.hidden || !want(o)) continue;
      if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
      REACH_C.copy(o.geometry.boundingSphere.center).applyMatrix4(o.matrixWorld);
      var d = REACH.distanceTo(REACH_C) - o.geometry.boundingSphere.radius;
      if (d < bd) { bd = d; best = o; }
    }
    return best;
  }
  function loose(o) { return !!o.userData.hold && !o.userData.hold.by; }
  function takes(o) { return !!o.userData.take; }
  // A turn of one snap, about your own head, for a stick in steps and for the
  // panel's Turn left and Turn right, which need no stick at all.
  function snapTurn(sign) {
    var hw = headWorld(), yaw = me.yaw - sign * xrStep, h = headLocal(), c = Math.cos(yaw), sn = Math.sin(yaw);
    me.yaw = yaw; me.x = hw.x - (c * h.x + sn * h.z); me.z = hw.z - (-sn * h.x + c * h.z);
    place(); vrPanelPlace();
  }
  // What is sounding in the room now, in words: each room's sound says its
  // own (kit.sound's caption, kit.caption for a page script's sound).
  function captions() {
    return (scene.userData.captions || []).map(function (f) { try { return f(); } catch (e) { return ''; } }).filter(Boolean);
  }
  // THE BODYMIND BREAK, IN THE HEADSET: the page's break is a calm screen over
  // the page, which a headset cannot show, so this is its own: the room put
  // away for a still, dim, empty place in the break's own colours (the far
  // band is its treeline in mist), with the floor under your feet where it
  // was. Nothing in it moves, at any setting; it stops nothing by itself (a
  // sound still going is offered on its panel); nothing is read aloud while
  // it is up; and the room is as you left it when you come back. In
  // passthrough the room is simply put away and your own room is the break.
  function breakSet(on) {
    xrBreak = on; xrTour = 0; xrGoing = false; xrSlow = 0;
    if (on) {
      if (!breakScene) {
        breakScene = new THREE.Scene();
        var ground = new THREE.Mesh(new THREE.CircleGeometry(60, 48), new THREE.MeshBasicMaterial({ color: col('--bbr-dusk-near') }));
        ground.rotation.x = -Math.PI / 2;
        var ridge = new THREE.Mesh(new THREE.CylinderGeometry(58, 58, 9, 48, 1, true), new THREE.MeshBasicMaterial({ color: col('--bbr-dusk-far'), side: THREE.BackSide }));
        breakScene.add(ground, ridge);
        breakScene.userData.land = [ground, ridge];
      }
      var ar = xrMode === 'immersive-ar';
      breakScene.background = ar ? null : col('--bbr-dusk');
      breakScene.userData.land.forEach(function (o, i) { o.visible = !ar; o.position.set(me.x, i ? 4.5 - xrSeat : -xrSeat, me.z); });
      if (vignette) vignette.material.opacity = 0;
      if (window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch (e) { /* no voice here */ } }
    }
    panelOpen = true; panelWords = on ? '' : 'Back in the room, as you left it.';
    vrPanel(); vrPanelPlace();
  }
  // THE LIGHTER PICTURE: dropped frames are what turn a stomach in a headset,
  // so when the frames have run slower than SLOW for SLOW_FOR seconds the
  // room is drawn lighter, once, and says so: no cast shadows, and only the
  // LAMPS_NEAR lamps that light where you stand most (a lamp's strength over
  // how far off it is, so the one big lamp that lights a whole room is never
  // the one put out; always that many, so nothing is built again as you walk). It never switches back by itself, which would flap;
  // the panel's Picture switch does, and once that is pressed nothing changes
  // it for the visit. Leaving the headset puts everything back.
  function lighterSet(on) {
    xrLight = on; xrLampsAt = 0;
    renderer.shadowMap.enabled = !on;
    [scene].concat(behind.map(function (b) { return b.scene; })).forEach(function (sc) {
      sc.traverse(function (o) {
        if (o.isPointLight && !on) o.visible = !o.userData.hidden;
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { m.needsUpdate = true; });
      });
    });
  }
  function slowStep(dt, now) {
    if (!xrLight && !xrLightAsked && dt) {
      xrSlow = dt > SLOW ? xrSlow + dt : Math.max(0, xrSlow - dt);
      if (xrSlow > SLOW_FOR) {
        lighterSet(true);
        vrTell('The room is drawn lighter to keep it smooth: no cast shadows, and only the lamps that light where you stand. Picture on the switches puts them back.');
      }
    }
    if (!xrLight || now - xrLampsAt < 1000) return;
    xrLampsAt = now;
    var lamps = [];
    camera.getWorldPosition(REACH);
    scene.traverse(function (o) { if (o.isPointLight && !o.userData.hidden) lamps.push(o); });
    if (lamps.length <= LAMPS_NEAR) { lamps.forEach(function (l) { l.visible = true; }); return; }
    lamps.forEach(function (l) {
      l.getWorldPosition(REACH_C);
      var far2 = REACH_C.distanceToSquared(REACH);
      l.userData.lights = l.distance && far2 > l.distance * l.distance ? 0 : l.intensity / Math.max(1, far2);
    });
    lamps.sort(function (a, b) { return b.userData.lights - a.userData.lights; });
    lamps.forEach(function (l, i) { l.visible = i < LAMPS_NEAR; });
  }
  // HANDS WITHOUT CONTROLLERS: where the headset tracks bare hands, each
  // joint is drawn as a small bead, so you see your own hands; a pinch is the
  // press (the headset sends it as one), pointing is the same beam, and a
  // pinch on a thing within reach takes it. Sticks there are none, so the
  // panel's Turn left and Turn right turn you, and pointing moves you.
  function palmsUp() {
    for (var i = 0; i < 2; i++) { var palm = renderer.xr.getHand(i); dolly.add(palm); palms.push(palm); }
  }
  function palmsStep() {
    for (var i = 0; i < palms.length; i++) {
      var joints = palms[i].children;
      for (var j = 0; j < joints.length; j++) {
        if (joints[j].userData.bead) continue;
        if (!knuckle) knuckle = { geo: new THREE.SphereGeometry(0.008, 8, 6), mat: new THREE.MeshBasicMaterial({ color: col('--cel-glint') }) };
        var bead = new THREE.Mesh(knuckle.geo, knuckle.mat);
        joints[j].userData.bead = bead; joints[j].add(bead);
      }
    }
  }

  // THE ROOM'S OWN PAGE, READ IN THE HEADSET. A room's page stands in its
  // scene as a web page laid over the picture, and a headset shows only the
  // picture, so everything the page says was missing there: its welcome, its
  // stories, its credits. The reader is a board where the page stands, the
  // page's own size, written from the page itself as it is loaded on that
  // screen (nothing more is fetched but the page's own pictures, and nothing
  // is copied into any file, so it cannot drift from the page): its headings,
  // paragraphs, lists, quotations and credits, part by part, in the page's
  // own ink, ground and faces where those are legible together and Cel
  // Street's page and ink where they are not (measured, 4.5 to 1), with its
  // pictures drawn whole and their credits under them. Under it, Back, Next,
  // the part before and the part after, each saying where it goes and never
  // a number, and Read it to me, which speaks the board, a picture by its
  // alt text. A PHOTOGRAPH WITH A CONSENT RECORD IS NEVER DRAWN (class
  // "photo", the polaroid wall's): its record names the pages it may hang on,
  // so the board says a photograph hangs on the room's own page and only
  // there. Controls, the dial, the sign-off, the job marker and anything
  // hidden are left out. It is drawn only in a headset, and only on a press
  // of its tiles does it change. A room that says reader: false has none.
  var READ_SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEMPLATE: 1, SVG: 1, svg: 1, BUTTON: 1, INPUT: 1, SELECT: 1, TEXTAREA: 1, LABEL: 1, IFRAME: 1, VIDEO: 1, AUDIO: 1, CANVAS: 1, NAV: 1, FOOTER: 1, FORM: 1, DIALOG: 1 };
  var READ_OUT = '.dial-dock, .dial, .signoff, .quest, .skip, .hlink, .cozy, [hidden], [aria-hidden="true"], [data-cb-dock], .backlink, .cb-host';
  var READ_HELD = 'A photograph hangs here on the room’s own page, and is shown only there.';
  function readerParts(doc) {
    var parts = [], part = null;
    // An element's words: its own label if it has one, otherwise its text
    // with its controls, drawings and hidden parts left out, so a button's
    // label is never read as part of the sentence it sits in.
    function said(el) {
      var label = el.getAttribute('aria-label');
      if (label) return label.replace(/\s+/g, ' ').trim();
      var copy = el.cloneNode(true);
      Array.prototype.forEach.call(copy.querySelectorAll('button, select, input, textarea, script, style, svg, [hidden], [aria-hidden="true"], .hlink'), function (x) { x.remove(); });
      return (copy.textContent || '').replace(/\s+/g, ' ').trim();
    }
    function start(title) { part = { title: title, blocks: [], lead: false }; parts.push(part); }
    function add(kind, text, img) {
      if (!text && !img) return;
      // Words above the page's title (a header's over-line) wait for it.
      if (!part) { start(inside ? inside.name : ''); part.lead = true; }
      var lastB = part.blocks[part.blocks.length - 1];
      if (kind === 'held' && lastB && lastB.kind === 'held') return;
      part.blocks.push({ kind: kind, text: text, img: img || null });
    }
    function picture(el) {
      if (el.classList.contains('photo')) { add('held', READ_HELD); return; }
      var src = el.currentSrc || el.src;
      if (!src || /^data:/.test(src)) return;
      add('img', el.getAttribute('alt') || '', src);
    }
    function walk(el) {
      for (var c = el.firstElementChild; c; c = c.nextElementSibling) {
        var tag = c.tagName;
        if (READ_SKIP[tag] || c.matches(READ_OUT)) continue;
        if (tag === 'H1' && part && part.lead && parts.length === 1) { part.title = said(c); part.lead = false; continue; }
        if (tag === 'H1' || tag === 'H2') { start(said(c)); continue; }
        if (tag === 'H3' || tag === 'H4' || tag === 'H5' || tag === 'H6' || tag === 'SUMMARY' || tag === 'DT') { add('h', said(c)); continue; }
        if (tag === 'IMG') { picture(c); continue; }
        if (tag === 'BLOCKQUOTE') { add('quote', said(c)); continue; }
        if (tag === 'FIGCAPTION' || tag === 'CITE') { add('credit', said(c)); continue; }
        if (tag === 'P' || tag === 'DD' || (tag === 'LI' && !c.querySelector('p, ul, ol, h3, h4, figure, blockquote, details, img'))) {
          Array.prototype.forEach.call(c.querySelectorAll('img'), picture);
          add(tag === 'LI' ? 'li' : 'p', said(c));
          continue;
        }
        walk(c);
      }
    }
    walk(doc.body);
    return parts.filter(function (pt) { return pt.blocks.length; });
  }
  // How bright a colour is, WCAG's way, and the ratio of two.
  function lum(c) {
    function ch(v) { return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    var k = c.clone().convertLinearToSRGB();
    return 0.2126 * ch(k.r) + 0.7152 * ch(k.g) + 0.0722 * ch(k.b);
  }
  function ratio(a, b) { var la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); }
  // The page's own ink and ground, if the page says both plainly and they
  // read together; otherwise Cel Street's page and ink, which do.
  function readerInks(doc) {
    var own = { ink: css('--cel-ink'), ground: css('--cel-page'), face: getComputedStyle(stage).fontFamily, head: getComputedStyle(stage).fontFamily };
    try {
      var view = doc.defaultView, cs = view.getComputedStyle(doc.body), h1 = doc.querySelector('h1');
      own.face = cs.fontFamily || own.face;
      own.head = h1 ? view.getComputedStyle(h1).fontFamily || own.face : own.face;
      var alpha = (cs.backgroundColor.match(/[\d.]+/g) || []).map(Number);
      var clear = alpha.length === 4 && alpha[3] < 1;
      if (!clear && cs.backgroundImage === 'none' && ratio(new THREE.Color(cs.color), new THREE.Color(cs.backgroundColor)) >= 4.5) { own.ink = cs.color; own.ground = cs.backgroundColor; }
    } catch (e) { /* the page's styles could not be read; Cel Street's own */ }
    return own;
  }
  // A part's blocks laid out into leaves of one board each: words wrapped to
  // the board, a picture given a leaf's upper part to itself.
  function readerLeaves(parts, g, W, H, inks) {
    var pad = Math.round(W * 0.06), size = Math.round(W / 27), lh = Math.round(size * 1.38), top = pad + Math.round(size * 1.5), leaves = [];
    function wrap(text, font, width) {
      g.font = font;
      var rows = [], cur = '';
      String(text).split(/\s+/).forEach(function (wd) {
        var t = cur ? cur + ' ' + wd : wd;
        if (g.measureText(t).width > width && cur) { rows.push(cur); cur = wd; } else cur = t;
      });
      if (cur) rows.push(cur);
      return rows;
    }
    parts.forEach(function (pt, pi) {
      var leaf = null, y = 0;
      function fresh() { leaf = { part: pi, title: pt.title, runs: [], said: [] }; leaves.push(leaf); y = top; }
      fresh();
      var head = wrap(pt.title, '700 ' + Math.round(size * 1.45) + 'px ' + inks.head, W - pad * 2);
      head.forEach(function (r) { leaf.runs.push({ text: r, x: pad, y: y, font: '700 ' + Math.round(size * 1.45) + 'px ' + inks.head }); y += Math.round(size * 1.9); });
      if (pt.title) leaf.said.push(pt.title + '.');
      y += Math.round(size * 0.4);
      pt.blocks.forEach(function (b) {
        if (b.kind === 'img') {
          var ih = Math.round(H * 0.5);
          if (y + ih > H - pad) fresh();
          leaf.runs.push({ img: b.img, x: pad, y: y, w: W - pad * 2, h: ih });
          leaf.said.push('A picture' + (b.text ? ': ' + b.text : '.'));
          y += ih + Math.round(size * 0.6);
          return;
        }
        var font = (b.kind === 'h' ? '700 ' + Math.round(size * 1.12) : b.kind === 'credit' || b.kind === 'held' ? 'italic ' + Math.round(size * 0.86) : b.kind === 'quote' ? 'italic ' + size : String(size)) + 'px ' + inks.face;
        var inset = b.kind === 'li' ? Math.round(size * 1.1) : b.kind === 'quote' ? Math.round(size * 1.4) : 0;
        var rows = wrap(b.text, font, W - pad * 2 - inset), step = b.kind === 'credit' || b.kind === 'held' ? Math.round(lh * 0.86) : lh;
        leaf.said.push(b.text);
        rows.forEach(function (r, ri) {
          if (y + step > H - pad) fresh();
          leaf.runs.push({ text: r, x: pad + inset, y: y, font: font, dot: b.kind === 'li' && ri === 0, bar: b.kind === 'quote' });
          y += step;
        });
        y += Math.round(size * 0.55);
      });
    });
    return leaves.filter(function (lf) { return lf.runs.length; });
  }
  function readerDown() {
    if (!reader) return;
    reader.gone = true;
    [reader.board].concat(readerTiles).forEach(function (m) { if (m.parent) m.parent.remove(m); m.geometry.dispose(); if (m.material.map) m.material.map.dispose(); m.material.dispose(); });
    reader = null; readerTiles = [];
  }
  function readerUp() {
    readerDown();
    if (!xrOn || !inside || !vrHere()) return;
    var room = window.loveCelRooms && window.loveCelRooms[inside.page];
    var where = (scene.userData.screens || [])[0];
    if (!where || (room && room.reader === false)) return;
    var doc = null;
    try { doc = where.f.contentDocument; } catch (e) { doc = null; }
    if (!doc || doc.readyState !== 'complete' || !doc.body || !doc.querySelector('main, h1, p')) {
      // Not read yet: the board goes up when the page has arrived.
      if (!where.waiting) { where.waiting = true; where.f.addEventListener('load', function () { where.waiting = false; if (xrOn) { readerUp(); vrPanel(); } }); }
      return;
    }
    var parts = readerParts(doc);
    if (!parts.length) return;
    var W = 1024, bar = 0.13, H = Math.max(640, Math.round(W * where.wh * (1 - bar) / where.ww));
    var inks = readerInks(doc), probe = document.createElement('canvas').getContext('2d');
    var r = reader = { at: 0, leaves: [], inks: inks, W: W, H: H, where: where, pics: {}, speaking: false, gone: false };
    r.leaves = readerLeaves(parts, probe, W, H, inks);
    var bh = where.wh * (1 - bar), th = where.wh * bar;
    r.board = new THREE.Mesh(new THREE.PlaneGeometry(where.ww, bh), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1) }));
    r.board.matrixAutoUpdate = false;
    r.board.matrix.copy(where.m).multiply(new THREE.Matrix4().makeTranslation(0, th / 2, 0.03));
    r.board.matrixWorldNeedsUpdate = true;
    scene.add(r.board);
    r.tile = function (k, words, go, pressed) {
      var tw = where.ww / 5, m = new THREE.Mesh(new THREE.PlaneGeometry(tw * 0.96, th * 0.9), new THREE.MeshBasicMaterial({ map: tileTex(words, pressed, false, (tw * 0.96) / (th * 0.9)) }));
      m.matrixAutoUpdate = false;
      m.matrix.copy(where.m).multiply(new THREE.Matrix4().makeTranslation((k - 2) * tw, -where.wh / 2 + th / 2, 0.03));
      m.matrixWorldNeedsUpdate = true;
      m.userData.tile = go ? { go: go } : null;
      scene.add(m); readerTiles.push(m);
    };
    // The page's faces are asked for before the first leaf is drawn, and the
    // leaves laid out again once they are here, because a wrap measured in a
    // fallback face is the wrong wrap.
    readerDraw();
    if (document.fonts && document.fonts.load) {
      Promise.all([document.fonts.load('700 40px ' + inks.head), document.fonts.load('40px ' + inks.face), document.fonts.load('italic 40px ' + inks.face)].map(function (pr) { return pr.catch(function () {}); })).then(function () {
        if (r.gone) return;
        r.leaves = readerLeaves(parts, probe, W, H, inks);
        r.at = Math.min(r.at, r.leaves.length - 1);
        readerDraw();
      });
    }
  }
  function readerDraw() {
    var r = reader;
    if (!r || !r.leaves.length) return;
    var leaf = r.leaves[r.at], W = r.W, H = r.H, pad = Math.round(W * 0.06), size = Math.round(W / 27);
    var map = tex(W, H, function (g) {
      g.fillStyle = r.inks.ground; g.fillRect(0, 0, W, H);
      g.strokeStyle = r.inks.ink; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6);
      g.fillStyle = r.inks.ink; g.textBaseline = 'top'; g.textAlign = 'left';
      g.font = Math.round(size * 0.74) + 'px ' + r.inks.face;
      g.fillText((inside ? inside.name : '') + (leaf.title && inside && leaf.title !== inside.name ? ' · ' + leaf.title : ''), pad, Math.round(pad * 0.55), W - pad * 2);
      leaf.runs.forEach(function (run) {
        if (run.img) {
          var pic = r.pics[run.img];
          if (!pic) {
            pic = r.pics[run.img] = new Image();
            pic.addEventListener('load', function () { if (!r.gone && r.leaves[r.at] === leaf) readerDraw(); });
            pic.src = run.img;
          }
          if (pic.complete && pic.naturalWidth) {
            var k = Math.min(run.w / pic.naturalWidth, run.h / pic.naturalHeight), dw = pic.naturalWidth * k, dh = pic.naturalHeight * k;
            g.drawImage(pic, run.x + (run.w - dw) / 2, run.y + (run.h - dh) / 2, dw, dh);
          } else g.strokeRect(run.x, run.y, run.w, run.h);
          return;
        }
        g.font = run.font;
        if (run.dot) g.fillRect(run.x - Math.round(size * 0.7), run.y + Math.round(size * 0.42), Math.round(size * 0.24), Math.round(size * 0.24));
        if (run.bar) g.fillRect(run.x - Math.round(size * 0.7), run.y, Math.round(size * 0.12), Math.round(size * 1.3));
        g.fillText(run.text, run.x, run.y);
      });
    });
    if (r.board.material.map) r.board.material.map.dispose();
    r.board.material.map = map; r.board.material.needsUpdate = true;
    // The tiles under the board: each says where it goes.
    readerTiles.forEach(function (m) { if (m.parent) m.parent.remove(m); m.geometry.dispose(); m.material.map.dispose(); m.material.dispose(); });
    readerTiles = [];
    var before = null, after = null, i;
    for (i = r.at - 1; i >= 0; i--) if (r.leaves[i].part !== leaf.part) { before = i; while (before > 0 && r.leaves[before - 1].part === r.leaves[i].part) before--; break; }
    for (i = r.at + 1; i < r.leaves.length; i++) if (r.leaves[i].part !== leaf.part) { after = i; break; }
    function to(n) { return function () { readerHush(); r.at = n; readerDraw(); }; }
    function names(n) { return r.leaves[n].title || 'the next part'; }
    r.tile(0, before === null ? 'The first part' : 'Back to: ' + names(before), before === null ? null : to(before), before === null);
    r.tile(1, r.at === 0 ? 'The start of the page' : 'Back a leaf', r.at === 0 ? null : to(r.at - 1), r.at === 0);
    r.tile(2, r.speaking ? 'Stop reading' : 'Read it to me', function () { if (r.speaking) { readerHush(); readerDraw(); } else readerSpeak(); }, r.speaking);
    r.tile(3, r.at === r.leaves.length - 1 ? 'The end of the page' : r.leaves[r.at + 1].part === leaf.part ? 'Next leaf: more of this' : 'Next: ' + names(r.at + 1), r.at === r.leaves.length - 1 ? null : to(r.at + 1), r.at === r.leaves.length - 1);
    r.tile(4, after === null ? 'The last part' : 'On to: ' + names(after), after === null ? null : to(after), after === null);
  }
  function readerHush() {
    if (!reader || !reader.speaking) return;
    reader.speaking = false;
    if (window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch (e) { /* no voice here */ } }
  }
  function readerSpeak() {
    var r = reader;
    if (!r || !('speechSynthesis' in window)) { vrTell('This headset’s browser has no voice to read with.'); return; }
    try {
      window.speechSynthesis.cancel();
      var words = new SpeechSynthesisUtterance(r.leaves[r.at].said.join(' '));
      words.addEventListener('end', function () { if (!r.gone && r.speaking) { r.speaking = false; readerDraw(); } });
      r.speaking = true;
      window.speechSynthesis.speak(words);
      readerDraw();
    } catch (e) { r.speaking = false; }
  }

  // What a hand is pointing at: a tile on the panel or under the page's
  // board, a thing the room lets you press, a place, the floor you could
  // stand on, or the floor past the room's edge, where you cannot.
  function aimOf(hand) {
    xrAim.identity().extractRotation(hand.matrixWorld);
    xrRay.ray.origin.setFromMatrixPosition(hand.matrixWorld);
    xrRay.ray.direction.set(0, 0, -1).applyMatrix4(xrAim);
    xrRay.far = 20;
    var t = xrRay.intersectObjects(xrBreak ? panelTiles : panelTiles.concat(readerTiles), false)[0];
    if (t) return { tile: t.object.userData.tile, d: t.distance, on: t.object };
    if (xrBreak) return null;
    var hit = xrRay.intersectObjects(hits, false)[0];
    if (hit) return { hit: hit.object, d: hit.distance };
    if (xrRay.ray.intersectPlane(FLOOR, xrAt)) {
      var d = xrRay.ray.origin.distanceTo(xrAt);
      if (d < 15) return inBounds(xrAt.x, xrAt.z) ? { floor: { x: xrAt.x, z: xrAt.z }, d: d } : { off: true, d: d };
    }
    return null;
  }
  function pressWith(hand) {
    var a = aimOf(hand);
    if (xrTour) { xrTour = 0; vrTell('The walk round stops here.'); }
    if (a && a.tile) { buzz(hand); if (a.tile.btn) a.tile.btn.click(); else a.tile.go(); vrPanel(); return; }
    if (a && 'tile' in a) return;
    if (xrBreak) return;
    // Within reach comes before what is pointed at: a thing in your hand goes
    // onto what you hold it against, and a thing your empty hand is on is
    // taken, by a press (or a pinch) as by a squeeze.
    var mine = heldBy(hand), spot = mine ? within(hand, hits, takes) : null;
    if (spot && putOn(spot, hand)) { buzz(hand); vrPanel(); return; }
    var got = mine ? null : within(hand, scene.userData.holds || [], loose);
    if (got) { holdToggle(got, hand); buzz(hand); vrPanel(); return; }
    if (!a) return;
    if (a.off) { vrTell('That is past the edge of the room. Point at the floor inside it to stand there.'); return; }
    if (a.hit && a.hit.userData.take && heldBy(hand) && putOn(a.hit, hand)) { buzz(hand); vrPanel(); return; }
    if (a.hit && a.hit.userData.hold) { holdToggle(a.hit, hand); buzz(hand); vrPanel(); return; }
    if (a.hit && a.hit.userData.act) { buzz(hand); a.hit.userData.act.go(); vrPanel(); return; }
    if (a.hit) {
      var st = stops[a.hit.userData.stop];
      if (ROOMS[st.page] && !(inside && st.page === inside.page) && nearest() === st) { enter(st.page); return; }
      buzz(hand, 0.6); vrStand(st); return;
    }
    if (a.floor) { buzz(hand, 0.6); footFor(a.floor.x, a.floor.z, me.yaw); place(); vrPanelPlace(); tell(); }
  }
  // REACH, SQUEEZE, CARRY, LET GO: a squeeze with your hand on a thing takes
  // it, for as long as you squeeze; let go against whatever takes it (a cup
  // under a teapot, the phonograph under a record) and it is put there, let
  // go anywhere else and it goes home, so nothing is left floating. A squeeze
  // on nothing shows the switches or puts them away, as it always did. The
  // press that takes and the press that puts back are still there for
  // anybody who cannot keep a grip closed.
  function gripStart(hand) {
    hand.userData.gripped = null;
    if (xrBreak || heldBy(hand)) return;
    var got = within(hand, scene.userData.holds || [], loose);
    if (!got) return;
    holdToggle(got, hand); hand.userData.gripped = got; buzz(hand); vrPanel();
  }
  function gripEnd(hand) {
    var got = hand.userData.gripped;
    hand.userData.gripped = null;
    if (!got) { xrTour = 0; panelOpen = !panelOpen; vrPanel(); vrPanelPlace(); return; }
    if (got.userData.hold.by !== hand) return;
    var spot = within(hand, hits, takes);
    if (!(spot && putOn(spot, hand))) holdToggle(got, hand);
    buzz(hand, 0.6); vrPanel();
  }
  function handsUp() {
    for (var i = 0; i < 2; i++) {
      var hand = renderer.xr.getController(i);
      var beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -1)]),
        new THREE.LineBasicMaterial({ color: col('--cel-glint') }));
      beam.visible = false; hand.add(beam);
      var dot = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.035, 20), new THREE.MeshBasicMaterial({ color: col('--cel-glint'), side: THREE.DoubleSide }));
      dot.visible = false;
      // Where you cannot stand: a cross on the floor past the room's edge, a
      // different shape from the ring and not only a different colour.
      var cross = new THREE.Group(), crossMat = new THREE.MeshBasicMaterial({ color: col('--cel-glint'), side: THREE.DoubleSide });
      [Math.PI / 4, -Math.PI / 4].forEach(function (turn) { var arm = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.05), crossMat); arm.rotation.z = turn; cross.add(arm); });
      cross.rotation.x = -Math.PI / 2; cross.visible = false;
      hand.userData = { beam: beam, dot: dot, cross: cross, src: null, turned: false, gripped: null };
      hand.addEventListener('connected', function (e) { this.userData.src = e.data; });
      hand.addEventListener('disconnected', function () { this.userData.src = null; this.userData.beam.visible = false; this.userData.dot.visible = false; this.userData.cross.visible = false; });
      hand.addEventListener('select', function () { pressWith(this); });
      hand.addEventListener('squeezestart', function () { gripStart(this); });
      hand.addEventListener('squeezeend', function () { gripEnd(this); });
      dolly.add(hand); hands.push(hand);
    }
    palmsUp();
  }
  // A stick pushed sideways turns you about your own head: gliding, for as
  // long as it is pushed; in steps, a twelfth of the way round, once, and it
  // has to come back before it turns you again.
  // Pushed forward or back, it walks your head the way your head faces, for
  // as long as it is pushed, kept inside the room as on a screen; whichever
  // stick is pushed further is the one that counts.
  function xrSticks(dt) {
    var push = 0, spin = 0;
    hands.forEach(function (hand) {
      var src = hand.userData.src, pad = src && src.gamepad;
      if (!pad || pad.axes.length < 4) return;
      var x = pad.axes[2], y = -pad.axes[3];
      if (Math.abs(y) > Math.abs(push)) push = y;
      if (xrGlide) { if (Math.abs(x) > Math.abs(spin)) spin = x; return; }
      if (Math.abs(x) > 0.6 && !hand.userData.turned) {
        hand.userData.turned = true;
        snapTurn(Math.sign(x));
      } else if (Math.abs(x) < 0.3) hand.userData.turned = false;
    });
    var r = Math.abs(spin) > 0.2 ? Math.sign(spin) * (Math.abs(spin) - 0.2) / 0.8 : 0;
    if (xrGlide && r && dt) {
      var hw0 = headWorld(), yaw = me.yaw - r * VR_TURN * dt, h = headLocal(), c = Math.cos(yaw), s = Math.sin(yaw);
      me.yaw = yaw; me.x = hw0.x - (c * h.x + s * h.z); me.z = hw0.z - (-s * h.x + c * h.z);
    }
    var f = Math.abs(push) > 0.2 ? Math.sign(push) * (Math.abs(push) - 0.2) / 0.8 : 0;
    if (f || r) xrTour = 0;
    if (xrGlide && (f || r)) xrGoing = true;
    if (xrGlide && f && dt) {
      var hw = headWorld(), d = f * VR_WALK * dt;
      var to = clampPoint(hw.x - Math.sin(hw.yaw) * d, hw.z - Math.cos(hw.yaw) * d);
      me.x += to.x - hw.x; me.z += to.z - hw.z;
    }
    if (!(xrGlide && (f || r)) && xrGoing) { xrGoing = false; vrPanelPlace(); tell(); }
  }
  // THE GUIDED WALK (Helen's headset round): one press, and you are stood at
  // each of the room's places in turn, a few seconds at each, with a moment
  // of dark between (the vignette closing and opening), never carried; any
  // press, squeeze or stick stops it. For anybody who finds the sticks hard.
  function tourToggle() {
    if (xrTour) { xrTour = 0; vrTell('The walk round stops here.'); return; }
    xrTour = 1; xrTourAt = 0;
    vrTell('Walking you round the room, place by place, with a moment of dark between; any press stops it.');
  }
  function tourStep(now) {
    if (!xrTour || !inside) return;
    if (xrTourAt && now - xrTourAt < TOUR_EVERY) return;
    var i = xrTour - 1;
    if (i >= stops.length) { xrTour = 0; vrTell('That was the whole room.'); return; }
    xrTourAt = now; xrTour++; xrDim = 1;
    vrStand(stops[i]);
  }
  // The vignette: a ring at the edge of the view, dark while a stick glides
  // you and for the walk's moment between places, clear otherwise; it is on
  // the camera, so it goes where the head goes, and it hides nothing when
  // you stand still.
  function vignetteUp() {
    if (vignette) return;
    vignette = new THREE.Mesh(new THREE.RingGeometry(0.24, 2.0, 32), new THREE.MeshBasicMaterial({ color: col('--cel-ink'), transparent: true, opacity: 0, depthTest: false, depthWrite: false, side: THREE.DoubleSide }));
    vignette.position.set(0, 0, -0.5); vignette.renderOrder = 999;
    camera.add(vignette);
  }
  function vignetteStep(dt) {
    if (!vignette) return;
    var want = xrGoing ? 0.82 : 0;
    if (xrDim > 0) { want = Math.max(want, Math.min(1, xrDim)); xrDim = Math.max(0, xrDim - dt * 1.6); }
    var o = vignette.material.opacity;
    vignette.material.opacity = o + (want - o) * Math.min(1, dt * 9);
  }
  var ARC = [];
  for (var ai = 0; ai <= 12; ai++) ARC.push(new THREE.Vector3());
  var arcP = new THREE.Vector3();
  function xrBeams() {
    hands.forEach(function (hand) {
      var u = hand.userData, src = u.src;
      var shown = !!src && src.targetRayMode === 'tracked-pointer';
      var a = shown ? aimOf(hand) : null;
      u.beam.visible = shown;
      if (a && a.floor) {
        // Pointing at the floor, the beam sags to where you would stand, as a
        // thrown rope would, so the spot reads as a spot and not a wall.
        var d = a.d;
        for (var k = 0; k <= 12; k++) {
          var t = k / 12;
          arcP.copy(xrRay.ray.origin).addScaledVector(xrRay.ray.direction, d * t);
          arcP.y += Math.sin(t * Math.PI) * Math.min(0.6, d * 0.12);
          hand.worldToLocal(arcP);
          ARC[k].copy(arcP);
        }
        u.beam.geometry.setFromPoints(ARC); u.beam.scale.z = 1;
      } else {
        u.beam.geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -1)]);
        u.beam.scale.z = a ? a.d : 3;
      }
      var here = xrBreak ? breakScene : scene;
      if (u.dot.parent !== here) here.add(u.dot);
      if (u.cross.parent !== here) here.add(u.cross);
      u.cross.visible = !!a && !!a.off;
      if (u.cross.visible) u.cross.position.copy(xrRay.ray.origin).addScaledVector(xrRay.ray.direction, a.d).setY(0.012);
      u.dot.visible = !!a && !('tile' in a) && !a.off;
      if (u.dot.visible) {
        u.dot.position.copy(xrRay.ray.origin).addScaledVector(xrRay.ray.direction, a.d - 0.01);
        if (a.floor) { u.dot.position.y = 0.01; u.dot.rotation.set(-Math.PI / 2, 0, 0); u.dot.scale.setScalar(4); }
        else { u.dot.lookAt(xrRay.ray.origin); u.dot.scale.setScalar(1); }
      }
      panelTiles.forEach(function (t) { if (t.userData.tile) t.scale.setScalar(a && a.tile && a.tile === t.userData.tile ? 1.06 : 1); });
    });
  }
  function xrFrame(now) {
    var here = xrBreak ? breakScene : scene;
    if (dolly.parent !== here) here.add(dolly);
    var dt = xrPrev ? Math.min((now - xrPrev) / 1000, 0.1) : 0;
    xrPrev = now;
    // On a break nothing of the room is stepped, walked or drawn: your head,
    // your hands and the break's own panel, and that is all.
    if (xrBreak) { place(); palmsStep(); xrBeams(); renderer.render(breakScene, camera); return; }
    stepMoves(now);
    xrSticks(dt);
    tourStep(now);
    vignetteStep(dt);
    place();
    if (travel) { travelStep(dt, now); if (travel) { travelDraw(); return; } }
    slowStep(dt, now);
    palmsStep();
    xrBeams();
    renderer.render(scene, camera);
    if (!xrLast) { xrLast = now; vrPanelPlace(); }
  }
  function xrEnd() {
    renderer.setAnimationLoop(null);
    xrOn = false; xrSession = null; xrLast = 0; xrPrev = 0; xrGoing = false;
    renderer.xr.enabled = false;
    hands.forEach(function (hand) {
      if (hand.userData.dot.parent) hand.userData.dot.parent.remove(hand.userData.dot);
      if (hand.userData.cross.parent) hand.userData.cross.parent.remove(hand.userData.cross);
      dolly.remove(hand);
    });
    hands = [];
    palms.forEach(function (palm) { dolly.remove(palm); });
    palms = [];
    readerHush(); readerDown();
    xrBreak = false; xrBuzz = null; xrSlow = 0; xrLightAsked = false;
    if (xrLight) lighterSet(false);
    if (panel) { dolly.remove(panel); panel = null; panelTiles = []; }
    if (vignette) { camera.remove(vignette); vignette = null; }
    xrSeat = 0; seated = null; stature = null; xrTour = 0; xrDim = 0;
    if (window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch (e) {} }
    if (xrMode === 'immersive-ar') { scene.background = xrSky; skyGroup.visible = true; renderer.setClearAlpha(1); }
    xrMode = 'immersive-vr';
    dolly.remove(camera);
    if (dolly.parent) dolly.parent.remove(dolly);
    camera.position.set(0, 0, 0); camera.quaternion.identity();
    camera.zoom = ZOOMS[zoomAt];
    clamp(); resize(); tell(); moves(); vrOffer();
    if (vrBtn) vrBtn.textContent = 'Enter VR';
    if (vrNote) vrNote.textContent = xrWhy || 'Out of the headset, back on the screen where you were.';
    xrWhy = '';
  }
  // After three.js has put its own size back, or the picture is drawn at the
  // headset's size and then cleared.
  renderer.xr.addEventListener('sessionend', xrEnd);
  if (vrBtn) vrBtn.addEventListener('click', function () { openXR('immersive-vr'); });
  // PASSTHROUGH (Helen's headset round): on a headset with cameras (a Quest 3),
  // the same room drawn over your own room, with no sky and no ground of its
  // own; the yurt's canvas still stands round you, because it is the room.
  if (arBtn) arBtn.addEventListener('click', function () { openXR('immersive-ar'); });
  if (navigator.xr && navigator.xr.isSessionSupported) {
    navigator.xr.isSessionSupported('immersive-ar').then(function (ok) { arCan = !!ok; vrOffer(); }).catch(function () {});
  }
  function openXR(mode) {
    if (xrSession) { xrSession.end(); return; }
    xrMode = mode;
    navigator.xr.requestSession(mode, { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] }).then(function (session) {
      xrSession = session;
      renderer.xr.enabled = true;
      renderer.xr.setReferenceSpaceType('local-floor');
      // Sharpest in the middle of the view, where you look, lighter at the
      // edges: what a standalone headset needs to keep its frames.
      try { renderer.xr.setFoveation(1); } catch (e) { /* not every browser */ }
      return renderer.xr.setSession(session).then(function () {
        xrOn = true; glide = null; held = {};
        dolly.add(camera); scene.add(dolly);
        vignetteUp();
        if (mode === 'immersive-ar') { xrSky = scene.background; scene.background = null; skyGroup.visible = false; renderer.setClearAlpha(0); }
        handsUp(); readerUp(); panelOpen = true; panelWords = ''; vrPanel();
        renderer.setAnimationLoop(xrFrame);
        vrBtn.textContent = 'Leave VR';
        if (vrNote) vrNote.textContent = 'In the headset. Push a stick forward or back to walk, or point and press to move and to press things; the headset’s own menu takes you out.';
      });
    }).catch(function () {
      xrSession = null; renderer.xr.enabled = false;
      if (vrNote) vrNote.textContent = 'The headset could not open the room just now.';
    });
  }

  /* ── The look, flipped for this visit ──────────────────────────────────── */
  // Under the stage, in a room only (the street stays in its cel): the room
  // you are in drawn again in the other look, where you stand, kept nowhere.
  var lookBtn = document.querySelector('[data-cel-look]');
  function lookOf() { return inside ? (lookChoice || (window.loveCelRooms[inside.page] || {}).look || 'cel') : 'cel'; }
  function lookShow() {
    if (!lookBtn) return;
    lookBtn.hidden = !inside;
    lookBtn.textContent = lookOf() === 'real' ? 'Look: real (press for cel)' : 'Look: cel (press for real)';
  }
  function relook() {
    if (!inside) return;
    lookChoice = lookOf() === 'real' ? 'cel' : 'real';
    var pg = inside.page, was = { x: me.x, z: me.z, yaw: me.yaw, pitch: me.pitch };
    outOfRoom();
    enter(pg, false, function () {
      me.x = was.x; me.z = was.z; me.yaw = was.yaw; me.pitch = was.pitch;
      // Back out pushed the parent's address; the room is still the room.
      history.replaceState({ celIn: pg }, '', '#in=' + pg.replace(/\.html$/, ''));
      place(); draw(); tell(); lookShow(); vrPanelPlace();
    });
    ctlSay(lookChoice === 'real' ? 'The room is drawn in the real look: smooth and lit, no inked edges, the same colours.' : 'The room is drawn in the cel look: flat colour and inked edges.');
  }
  if (lookBtn) lookBtn.addEventListener('click', relook);

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
      var road = doc.querySelector('a.roadout');
      if (road) items.push({ el: road, kind: 'road' });
      var lift = doc.querySelector('a.liftdown');
      if (lift) items.push({ el: lift, kind: 'lift' });
      // The street furniture by the front door, and the street's own name.
      [['a.noticeboard', 'board'], ['a.brasstacks', 'brass'], ['a.postercol', 'column'],
       ['.masthead__who a[href="danny-the-street.html"]', 'name']].forEach(function (f) {
        var el = doc.querySelector(f[0]);
        if (el) items.push({ el: el, kind: f[1] });
      });
      var worn = wear(items);
      var faces = worn.map(function (d) { return document.fonts ? document.fonts.load(d.weight + ' 64px ' + d.face, d.name).catch(function () {}) : null; });
      if (document.fonts) faces.push(document.fonts.load('64px "Rammetto One"').catch(function () {}));
      return Promise.all(faces).then(function () { build(worn); });
    })
    .catch(function (e) { fail(); if (window.console) console.error('Cel Street could not be built:', e); });
}
