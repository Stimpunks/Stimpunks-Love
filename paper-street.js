/* =============================================================================
   Paper Street: the street, walked as paper. Ryan's ask, 2026-10-30: a sandbox
   game on the web, walking down the street and into the rooms, with your
   avatars, chimeras and pets along; built a little at a time, the street first.

   THE DOORS ARE THE FRONT PAGE'S OWN, READ WHEN THE PAGE OPENS. This file asks
   for index.html once, takes its row of doors, the street furniture, the fence
   round the open ground and the two ends of the road, and stands a copy of each
   up as a flat of card. A copy made at build time would be a second street that
   drifts from the first; this is always the street as it is, each door in its
   own §5 clothes, and a new shopfront is on Paper Street the day it opens.
   tools/make-paper-street.py refuses this file if index.html stops having the
   parts it reads.

   A STREET IN REAL 3D, AND THE BROWSER DOES THE SEEING (Ryan's call,
   2026-10-31, reversing the first build's rule that nothing here is rotated:
   flats that always turned to face you were more disorienting than a world
   that stays where it is). The stage holds the perspective, one rig carries the
   whole world and is moved and turned by where you stand and which way you
   face, and every thing in it keeps its own place and its own facing: the
   shopfronts are two rows facing each other across the road, and standing at a
   door turns you to face it. check-gentle.py cannot see any of it, because its
   probes load pages from disk, where the street cannot be read; what it was
   standing guard over is held here instead: nothing moves by itself.

   A ROOM YOU CAN WALK INTO IS A SCENE OF ITS OWN, IN A FILE OF ITS OWN (Ryan,
   2026-10-31). A door whose room has a walk-<room>.js goes in here rather than
   to the page: the street's flats are put by, the room's file is loaded, and
   it builds the room in its own world, drawn in its own section's inks, with
   the room's real page on a screen or a wall inside it. That screen is only
   ever made by this file's screen(), so every room's page arrives the same
   honest way: the page itself, at full size when you stand in front of it, its
   links leaving for the whole window. Where you are goes after the # in the
   address, which never reaches a server, so Back takes you out of the room.
   There is no pattern for a room here: this file knows how to stand a thing at
   a place and draw it from where you stand, and nothing about what a room is.

   MOVING IS YOURS, AND NOTHING MOVES BY ITSELF. Steps jump from stop to stop
   with no motion at all, and are where Gentle starts; Glide walks you smoothly
   while a key or a button is held, and is where Regular and MAX start. The
   switch overrides either, for this visit only. Tab moves you down the street:
   the keyboard going to a door stands you in front of it. A game controller is
   read each frame only while one is connected, because a browser has no
   event for a stick moving; a frame with nothing asked of it does nothing.

   LOOKING AROUND turns the rig, and looking up and down slides the horizon,
   the way the old games did it, so the floor drops away and the roof comes
   into view. In Steps a turn is a jump of a twelfth of the way round with
   nothing moving between; gliding, it turns while you hold a key or drag.

   YOUR COMPANIONS COME ALONG, AND NOBODY IS HANDED A BODY. Your familiar walks
   with you if you have one (read from love-familiar, which familiar.js keeps;
   this file never writes it). Your avatar comes only when you press Bring my
   avatar, which asks /cb/avatars once with the pass the radio keeps, and walks
   in front of you; with no avatar you walk with no body at all.

   IT KEEPS NOTHING AND SENDS NOTHING. Two reads, the front page and, on a
   press, your avatars; no storage, no timer, nothing counted. The make tool
   reads this file for each of those.
   ========================================================================== */
(function () {
  'use strict';

  var stage = document.querySelector('[data-ps-stage]');
  if (!stage) return;
  var flatsEl = stage.querySelector('[data-ps-flats]');
  // The perspective is held by a box inside the stage, never by the stage:
  // Safari draws a 3D world flat when the box holding its perspective also
  // clips, and the stage has to clip.
  var view = stage.querySelector('[data-ps-view]');
  var folkEl = stage.querySelector('[data-ps-folk]');
  var here = document.querySelector('[data-ps-here]');
  // Which room you are in, said on the stage and in the tab: a ticket pinned in
  // the stage's corner, over the street, so it takes no room on the page and a
  // long name is cut short rather than wrapping (Ryan, 2026-11-04). The line
  // under the stage still says it in words; the ticket is for eyes only.
  var plateEl = document.querySelector('[data-ps-plate]');
  var titleWas = document.title;
  function plateUp() {
    var room = scene && scene.room;
    if (plateEl) { plateEl.textContent = room ? room.name : 'Paper Street'; plateEl.hidden = false; }
    document.title = room ? room.name + ' \u00b7 ' + titleWas : titleWas;
  }
  var said = document.querySelector('[data-ps-said]');
  var controls = document.querySelector('[data-ps-controls]');
  var failed = document.querySelector('[data-ps-failed]');
  if (!flatsEl || !view || !folkEl || !here || !controls) return;

  /* The rooms you can walk into, each its own file. Written by
     tools/make-paper-street.py from the walk-*.js files there are; do not
     hand-edit between the markers. */
  // walk:rooms:begin
  var ROOMS = {'a-quiet-pint.html': 'walk-a-quiet-pint.js', 'adventurers-guild.html': 'walk-adventurers-guild.js', 'all-needs-met.html': 'walk-all-needs-met.js', 'all-together-now.html': 'walk-all-together-now.js', 'arcade.html': 'walk-arcade.js', 'arlesglad-caverns.html': 'walk-arlesglad-caverns.js', 'big-steep-fermentables.html': 'walk-big-steep-fermentables.js', 'black-leather-lagoon.html': 'walk-black-leather-lagoon.js', 'bodymind-booth.html': 'walk-bodymind-booth.js', 'brass-tacks-board.html': 'walk-brass-tacks-board.js', 'breaker-breaker.html': 'walk-breaker-breaker.js', 'brew-and-stew.html': 'walk-brew-and-stew.js', 'brighter-days.html': 'walk-brighter-days.js', 'broadsheet-broadside.html': 'walk-broadsheet-broadside.js', 'campgrounds.html': 'walk-campgrounds.js', 'cavendish-campfire.html': 'walk-cavendish-campfire.js', 'cavendish-cave.html': 'walk-cavendish-cave.js', 'cavendish-coworking.html': 'walk-cavendish-coworking.js', 'cavendish-editorial.html': 'walk-cavendish-editorial.js', 'cavendish-events.html': 'walk-cavendish-events.js', 'cavendish-operations.html': 'walk-cavendish-operations.js', 'cavendish-watering-hole.html': 'walk-cavendish-watering-hole.js', 'champuru.html': 'walk-champuru.js', 'chimera-obscura.html': 'walk-chimera-obscura.js', 'club-chronic.html': 'walk-club-chronic.js', 'collection-collection.html': 'walk-collection-collection.js', 'comfort-station.html': 'walk-comfort-station.js', 'community-care.html': 'walk-community-care.js', 'community-center.html': 'walk-community-center.js', 'community-library.html': 'walk-community-library.js', 'cooldown-room.html': 'walk-cooldown-room.js', 'coping.html': 'walk-coping.js', 'count-me-in.html': 'walk-count-me-in.js', 'covenstead.html': 'walk-covenstead.js', 'dance-punks.html': 'walk-dance-punks.js', 'danny-the-street.html': 'walk-danny-the-street.js', 'dead-tired-society.html': 'walk-dead-tired-society.js', 'dopamine-dress-up-den.html': 'walk-dopamine-dress-up-den.js', 'enids-room.html': 'walk-enids-room.js', 'faery-cinema-room.html': 'walk-faery-cinema-room.js', 'faery-music-room.html': 'walk-faery-music-room.js', 'faery-myths-room.html': 'walk-faery-myths-room.js', 'faery-reading-room.html': 'walk-faery-reading-room.js', 'faery-yurt.html': 'walk-faery-yurt.js', 'fantasy-fancy-dress.html': 'walk-fantasy-fancy-dress.js', 'foundry.html': 'walk-foundry.js', 'fridge-of-sighs.html': 'walk-fridge-of-sighs.js', 'gentle-help.html': 'walk-gentle-help.js', 'glow-go-gee-gaws.html': 'walk-glow-go-gee-gaws.js', 'glow-wild-hollow.html': 'walk-glow-wild-hollow.js', 'haunted-house.html': 'walk-haunted-house.js', 'healing-checkpoint.html': 'walk-healing-checkpoint.js', 'hear-queer-here.html': 'walk-hear-queer-here.js', 'hey-good-cookin.html': 'walk-hey-good-cookin.js', 'jungle-room.html': 'walk-jungle-room.js', 'l-space.html': 'walk-l-space.js', 'latibulum.html': 'walk-latibulum.js', 'laughingstock.html': 'walk-laughingstock.js', 'learning-large.html': 'walk-learning-large.js', 'lightbulb-picture-house.html': 'walk-lightbulb-picture-house.js', 'live-room.html': 'walk-live-room.js', 'loo-with-a-view.html': 'walk-loo-with-a-view.js', 'looming-rocks.html': 'walk-looming-rocks.js', 'mycelium-munchies.html': 'walk-mycelium-munchies.js', 'natures-contribution.html': 'walk-natures-contribution.js', 'neurohome.html': 'walk-neurohome.js', 'nothing-for-sale.html': 'walk-nothing-for-sale.js', 'now-playing.html': 'walk-now-playing.js', 'oook.html': 'walk-oook.js', 'oracle-deck.html': 'walk-oracle-deck.js', 'otterly-adorbs.html': 'walk-otterly-adorbs.js', 'pando-calrissian.html': 'walk-pando-calrissian.js', 'pebble-board.html': 'walk-pebble-board.js', 'pekoe-and-purrs.html': 'walk-pekoe-and-purrs.js', 'penguin-pebbling.html': 'walk-penguin-pebbling.js', 'pets.html': 'walk-pets.js', 'pink-pony-club.html': 'walk-pink-pony-club.js', 'play-pod.html': 'walk-play-pod.js', 'playhouse.html': 'walk-playhouse.js', 'plural-mural.html': 'walk-plural-mural.js', 'polaroids.html': 'walk-polaroids.js', 'quill-drift.html': 'walk-quill-drift.js', 'rabbit-hole.html': 'walk-rabbit-hole.js', 'rebellion-rave-room.html': 'walk-rebellion-rave-room.js', 'repeater.html': 'walk-repeater.js', 'rescue-a-cat.html': 'walk-rescue-a-cat.js', 'rescue-a-dog.html': 'walk-rescue-a-dog.js', 'rescue-small-animals.html': 'walk-rescue-small-animals.js', 'samefood-cafe.html': 'walk-samefood-cafe.js', 'sandbox.html': 'walk-sandbox.js', 'seaside-convenience.html': 'walk-seaside-convenience.js', 'show-your-work.html': 'walk-show-your-work.js', 'sithen.html': 'walk-sithen.js', 'small-hours.html': 'walk-small-hours.js', 'solarpunk-hermitage.html': 'walk-solarpunk-hermitage.js', 'stay-breezy.html': 'walk-stay-breezy.js', 'stay-frosty.html': 'walk-stay-frosty.js', 'swaying-sweetgrass.html': 'walk-swaying-sweetgrass.js', 'the-bough-house.html': 'walk-the-bough-house.js', 'the-chappell.html': 'walk-the-chappell.js', 'the-dairy.html': 'walk-the-dairy.js', 'the-den.html': 'walk-the-den.js', 'the-doom-scoop.html': 'walk-the-doom-scoop.js', 'the-doomscroll.html': 'walk-the-doomscroll.js', 'the-feed.html': 'walk-the-feed.js', 'the-garden.html': 'walk-the-garden.js', 'the-green.html': 'walk-the-green.js', 'the-honesty-box.html': 'walk-the-honesty-box.js', 'the-mopery.html': 'walk-the-mopery.js', 'the-mountain-cabin.html': 'walk-the-mountain-cabin.js', 'the-mud-room.html': 'walk-the-mud-room.js', 'the-open-notebook.html': 'walk-the-open-notebook.js', 'the-outskirts.html': 'walk-the-outskirts.js', 'the-pile.html': 'walk-the-pile.js', 'the-quiet-stall.html': 'walk-the-quiet-stall.js', 'the-run.html': 'walk-the-run.js', 'the-source.html': 'walk-the-source.js', 'town-hall-board.html': 'walk-town-hall-board.js', 'town-hall-directors.html': 'walk-town-hall-directors.js', 'town-hall-executive-session.html': 'walk-town-hall-executive-session.js', 'town-hall-fishbowl.html': 'walk-town-hall-fishbowl.js', 'town-hall-moderators.html': 'walk-town-hall-moderators.js', 'town-hall.html': 'walk-town-hall.js', 'truckin-food-court.html': 'walk-truckin-food-court.js', 'vital-plant-living.html': 'walk-vital-plant-living.js', 'volunteers.html': 'walk-volunteers.js', 'widdershins.html': 'walk-widdershins.js', 'wide-spread-chaos.html': 'walk-wide-spread-chaos.js', 'words-bud-beats.html': 'walk-words-bud-beats.js', 'world.html': 'walk-world.js', 'your-room.html': 'walk-your-room.js', 'zibaldone.html': 'walk-zibaldone.js', 'zine-issue-2.html': 'walk-zine-issue-2.js', 'zine-table.html': 'walk-zine-table.js'};
  var NAMES = {"a-quiet-pint.html": "A Quiet Pint", "adventurers-guild.html": "The Adventurer’s Guild", "all-needs-met.html": "All Needs Met Wildlife Sanctuary", "all-together-now.html": "All Together Now Farms", "arcade.html": "The Arcade", "arlesglad-caverns.html": "Arlesglad Caverns", "big-steep-fermentables.html": "Big Steep Fermentables", "black-leather-lagoon.html": "Black Leather Lagoon", "bodymind-booth.html": "The Bodymind Booth", "brass-tacks-board.html": "The Brass Tacks Board", "breaker-breaker.html": "Breaker Breaker", "brew-and-stew.html": "Brew and Stew", "brighter-days.html": "Brighter Days Solar Farm", "broadsheet-broadside.html": "The Broadsheet Broadside", "campgrounds.html": "The Campgrounds", "cavendish-campfire.html": "The Campfire", "cavendish-cave.html": "The Cave", "cavendish-coworking.html": "Cavendish Coworking", "cavendish-editorial.html": "The Editorial Room", "cavendish-events.html": "The Events Room", "cavendish-operations.html": "The Operations Room", "cavendish-watering-hole.html": "The Watering Hole", "champuru.html": "Champuru", "chimera-obscura.html": "Chimera Obscura", "club-chronic.html": "Club Chronic", "collection-collection.html": "The Collection Collection", "comfort-station.html": "The Comfort Station", "community-care.html": "Community Care", "community-center.html": "Community Center", "community-library.html": "Community Library", "cooldown-room.html": "The Cooldown Room", "coping.html": "Coping", "count-me-in.html": "Count Me In", "covenstead.html": "Covenstead", "dance-punks.html": "Dance, Punks", "danny-the-street.html": "Danny the Street", "dead-tired-society.html": "Dead Tired Society", "dopamine-dress-up-den.html": "Dopamine Dress-Up Den", "enids-room.html": "Enid's Room", "faery-cinema-room.html": "The Cinema", "faery-music-room.html": "The Music Room", "faery-myths-room.html": "Myths & Legends", "faery-reading-room.html": "The Reading Room", "faery-yurt.html": "Faery Yurt", "fantasy-fancy-dress.html": "Fantasy Fancy Dress", "foundry.html": "The Foundry", "fridge-of-sighs.html": "The Fridge of Sighs", "gentle-help.html": "Gentle Help Cannabis Farm", "glow-go-gee-gaws.html": "Glow Go Gee Gaws", "glow-wild-hollow.html": "Glow Wild Hollow", "haunted-house.html": "The Haunted House", "healing-checkpoint.html": "The Healing Checkpoint", "hear-queer-here.html": "Hear Queer Here", "hey-good-cookin.html": "Hey, Good Cookin’", "jungle-room.html": "The Jungle Room", "l-space.html": "L-Space", "latibulum.html": "The Latibulum", "laughingstock.html": "Laughingstock", "learning-large.html": "Learning Large", "lightbulb-picture-house.html": "The Lightbulb Picture House", "live-room.html": "The Live Room", "loo-with-a-view.html": "Loo With a View", "looming-rocks.html": "Looming Rocks Amphitheatre", "mycelium-munchies.html": "Mycelium Munchies", "natures-contribution.html": "Nature’s Contribution", "neurohome.html": "NeuroHome", "nothing-for-sale.html": "Nothing For Sale", "now-playing.html": "Now Playing", "oook.html": "Oook", "oracle-deck.html": "The Oracle Deck", "otterly-adorbs.html": "Otterly Adorbs", "pando-calrissian.html": "Pando Calrissian", "pebble-board.html": "The Pebble Board", "pekoe-and-purrs.html": "Pekoe and Purrs", "penguin-pebbling.html": "Penguin Pebbling", "pets.html": "Pets", "pink-pony-club.html": "Pink Pony Club", "play-pod.html": "The Play Pod", "playhouse.html": "The Playhouse", "plural-mural.html": "Plural Mural", "polaroids.html": "The Polaroid Wall", "quill-drift.html": "Quill Drift", "rabbit-hole.html": "The Rabbit Hole", "rebellion-rave-room.html": "Rebellion Rave Room", "repeater.html": "The Repeater", "rescue-a-cat.html": "Rescue A Cat", "rescue-a-dog.html": "Rescue A Dog", "rescue-small-animals.html": "Rescue Small Animals", "samefood-cafe.html": "Samefood Cafe", "sandbox.html": "The Sandbox", "seaside-convenience.html": "The Seaside Convenience", "show-your-work.html": "Show Your Work", "sithen.html": "Sithen", "small-hours.html": "The Small Hours", "solarpunk-hermitage.html": "The Solarpunk Hermitage", "stay-breezy.html": "Stay Breezy", "stay-frosty.html": "Stay Frosty", "swaying-sweetgrass.html": "Swaying Sweetgrass", "the-bough-house.html": "The Bough House", "the-chappell.html": "The Chappell", "the-dairy.html": "The Dairy", "the-den.html": "The Den", "the-doom-scoop.html": "The Doom Scoop", "the-doomscroll.html": "The Doomscroll", "the-feed.html": "The Feed", "the-garden.html": "The Garden", "the-green.html": "The Green", "the-honesty-box.html": "The Honesty Box", "the-mopery.html": "The Mopery", "the-mountain-cabin.html": "The Emergent Future Worlds Meets Mountain Man", "the-mud-room.html": "The MUD Room", "the-open-notebook.html": "The Open Notebook", "the-outskirts.html": "The Outskirts", "the-pile.html": "The Pile", "the-quiet-stall.html": "The Quiet Stall", "the-run.html": "The Run", "the-source.html": "The Source", "town-hall-board.html": "Board", "town-hall-directors.html": "Directors", "town-hall-executive-session.html": "Executive Session", "town-hall-fishbowl.html": "The Fishbowl", "town-hall-moderators.html": "Moderators", "town-hall.html": "Town Hall", "truckin-food-court.html": "Truckin’ Food Court", "vital-plant-living.html": "Vital Plant Living", "volunteers.html": "Volunteers", "widdershins.html": "Widdershins", "wide-spread-chaos.html": "Wide-Spread Chaos Gardens", "words-bud-beats.html": "Words, Bud, Beats", "world.html": "World", "your-room.html": "Your Room", "zibaldone.html": "The Zibaldone", "zine-issue-2.html": "The Zine Table, Issue #2: One Root, Two Rainbows", "zine-table.html": "The Zine Table"};
  var FROM = {"all-needs-met.html": "natures-contribution.html", "all-together-now.html": "natures-contribution.html", "big-steep-fermentables.html": "arlesglad-caverns.html", "black-leather-lagoon.html": "the-outskirts.html", "brew-and-stew.html": "campgrounds.html", "brighter-days.html": "natures-contribution.html", "cavendish-campfire.html": "cavendish-coworking.html", "cavendish-cave.html": "cavendish-coworking.html", "cavendish-editorial.html": "cavendish-coworking.html", "cavendish-events.html": "cavendish-coworking.html", "cavendish-operations.html": "cavendish-coworking.html", "cavendish-watering-hole.html": "cavendish-coworking.html", "cooldown-room.html": "rebellion-rave-room.html", "dance-punks.html": "the-outskirts.html", "faery-cinema-room.html": "faery-yurt.html", "faery-music-room.html": "faery-yurt.html", "faery-myths-room.html": "faery-yurt.html", "faery-reading-room.html": "faery-yurt.html", "faery-yurt.html": "campgrounds.html", "fantasy-fancy-dress.html": "dopamine-dress-up-den.html", "gentle-help.html": "natures-contribution.html", "glow-go-gee-gaws.html": "arlesglad-caverns.html", "glow-wild-hollow.html": "faery-yurt.html", "haunted-house.html": "the-outskirts.html", "l-space.html": "community-library.html", "looming-rocks.html": "the-outskirts.html", "mycelium-munchies.html": "arlesglad-caverns.html", "natures-contribution.html": "campgrounds.html", "nothing-for-sale.html": "the-outskirts.html", "oook.html": "l-space.html", "oracle-deck.html": "the-mopery.html", "otterly-adorbs.html": "arcade.html", "penguin-pebbling.html": "arcade.html", "play-pod.html": "faery-yurt.html", "polaroids.html": "enids-room.html", "quill-drift.html": "arcade.html", "rebellion-rave-room.html": "the-outskirts.html", "repeater.html": "the-outskirts.html", "sithen.html": "the-outskirts.html", "small-hours.html": "the-outskirts.html", "solarpunk-hermitage.html": "campgrounds.html", "stay-breezy.html": "stay-frosty.html", "stay-frosty.html": "arlesglad-caverns.html", "swaying-sweetgrass.html": "campgrounds.html", "the-bough-house.html": "campgrounds.html", "the-chappell.html": "pink-pony-club.html", "the-dairy.html": "all-together-now.html", "the-den.html": "jungle-room.html", "the-doomscroll.html": "the-mopery.html", "the-mountain-cabin.html": "campgrounds.html", "the-source.html": "the-feed.html", "town-hall-board.html": "town-hall.html", "town-hall-directors.html": "town-hall.html", "town-hall-executive-session.html": "town-hall.html", "town-hall-fishbowl.html": "town-hall.html", "town-hall-moderators.html": "town-hall.html", "wide-spread-chaos.html": "natures-contribution.html", "world.html": "the-garden.html", "zine-issue-2.html": "zine-table.html"};
  // walk:rooms:end
  window.lovePaperRooms = window.lovePaperRooms || {};

  /* ── The street's measurements, in the street's own units ─────────────── */
  var ROAD = 420;        // half the road's width: wide enough to stand back from a door without backing into the fronts opposite
  var KERB = 34;         // between the road's edge and a flat
  var GAP = 330;         // between one stop and the next, down the street
  var SPEED = 620;       // gliding forward, units a second
  var SIDEWAYS = 420;    // gliding across
  var NEAR = 0.15;       // a thing wholly nearer than this many focal lengths is put away
  var FAR = 15;          // and one wholly further than this many
  var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;   // the facings of the two rows of fronts

  var street = null;     // the street scene, kept while you are in a room
  var scene = null;      // { stops, decor, bounds, ground, eye, horizon, sides, room }
  var folk = [];         // { el, x, z, h, w }
  var cam = { x: 0, z: 0 };
  var goal = null;       // where a glide is heading
  var held = {};         // keys and buttons held down
  var last = 0, running = false;
  var F = 600, W = 0, H = 0, HORIZON = 0, EYE = 165, BASE = 0;
  // ZOOM: how many times longer the eye's focal length is than F. Only the
  // view's perspective and the eye's place in the rig use it, so the street
  // and every page in it come closer together while nothing moves in the
  // world and your companions stay by you.
  var ZOOM = 1;
  var yaw = 0, pitch = 0;   // which way you face (radians, right is more) and how far up you look (pixels)
  var TURN = 1.3, LOOK = 320, STEP_TURN = Math.PI / 6;
  var mode = null, chosen = false;
  var me = null, fam = null;
  var byEl = new WeakMap();  // a placed element, to the stop it belongs to
  var wired = 0;             // how many times a room's own script has been run against its lifts

  function level() { return document.documentElement.getAttribute('data-intensity') || 'regular'; }
  function steps() { return mode === 'steps'; }

  function speak(el, text) {
    if (!el) return;
    el.textContent = '';
    setTimeout(function () { el.textContent = text; }, 40);
  }

  /* ── Reading the street ───────────────────────────────────────────────── */
  function read() {
    return fetch('index.html', { credentials: 'same-origin', cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('no street'); return r.text(); })
      .then(function (src) { return new DOMParser().parseFromString(src, 'text/html'); });
  }

  function nameOf(a) {
    var n = a.querySelector('.door__name, [class$="__what"], [class$="__to"], .lotgate__name');
    return (n ? n.textContent : a.textContent).replace(/\s+/g, ' ').replace(/[→↓]/g, '').trim();
  }

  // Which page a door goes to, as a filename. Netlify rewrites the front page's
  // links into clean addresses as it serves them (/jungle-room, not
  // jungle-room.html), and the dev server does not, so a door is read in
  // either form; compared as written, no door on the live street matched a
  // room, and nothing here said so.
  function pageOf(a) {
    var h = (a.getAttribute('href') || '').split('#')[0].split('?')[0];
    if (/^[a-z]+:/i.test(h)) return '';
    h = h.replace(/^\.?\//, '');
    if (!h) return 'index.html';
    return /\.[a-z0-9]+$/i.test(h) ? h : h + '.html';
  }

  // One flat: a wrapper of ours holding a copy of the street's own element.
  var tagged = 0;
  function flat(node, width, side, kind) {
    var wrap = document.createElement('div');
    wrap.className = 'ps-flat ps-flat--' + kind;
    wrap.style.width = width + 'px';
    var copy = document.importNode(node, true);
    wrap.appendChild(copy);
    flatsEl.appendChild(wrap);
    var links = wrap.querySelectorAll('a[href]');
    var s = { el: wrap, side: side, w: width, h: 0, x: 0, z: 0, y: 0, turn: 0, name: nameOf(copy), pool: null, link: links[0] || null };
    byEl.set(wrap, s);
    // A door whose room you can walk into says so, under its fold, in words.
    Array.prototype.forEach.call(links, function (a) {
      if (!ROOMS[pageOf(a)]) return;
      var tag = document.createElement('span');
      tag.className = 'ps-walkin';
      tag.id = 'ps-walkin-' + (++tagged);
      tag.textContent = 'You can walk in';
      wrap.appendChild(tag);
      a.setAttribute('aria-describedby', tag.id);
    });
    return s;
  }

  function lay(doc) {
    var row = doc.querySelector('ul.doors');
    var doors = row ? row.querySelectorAll(':scope > li > a.door') : [];
    if (!doors.length) throw new Error('no doors');
    var pick = function (sel) { return doc.querySelector(sel); };
    var stops = [];

    // The treeline end, where you start: the way to the campgrounds, then the
    // lift head on the stoop, then the street furniture, as the Map has them.
    var order = [];
    var camp = pick('a.signpost');
    if (camp) order.push([camp, 330, 'left', 'sign']);
    var lift = pick('a.liftdown');
    if (lift) order.push([lift, 300, 'right', 'furniture']);
    ['a.noticeboard', 'a.brasstacks', 'a.postercol'].forEach(function (sel, i) {
      var n = pick(sel);
      if (n) order.push([n, 320, i % 2 ? 'right' : 'left', 'furniture']);
    });
    var side = order.length % 2 ? 'right' : 'left';
    var half = Math.floor((doors.length + 1) / 2);
    var gate = pick('a.gardengate');
    Array.prototype.forEach.call(doors, function (d, i) {
      if (i === half && gate) { order.push([gate, 320, side, 'gate']); side = side === 'left' ? 'right' : 'left'; }
      order.push([d, 270, side, 'door']);
      side = side === 'left' ? 'right' : 'left';
    });
    var ground = pick('div.openground');
    if (ground) order.push([ground, 620, side, 'lots']);

    // Two rows of fronts facing each other across the road, shoulder to
    // shoulder, each side in its own order down the street.
    var along = { left: 600, right: 600 };
    order.forEach(function (o) {
      var s = flat(o[0], o[1], o[2], o[3]);
      s.z = along[o[2]] + o[1] / 2;
      along[o[2]] += o[1] + 40;
      s.turn = o[2] === 'left' ? LEFT : RIGHT;
      stops.push(s);
    });
    var end = Math.max(along.left, along.right);

    // The far end of the road, standing across it: the way out to The Outskirts.
    var out = pick('a.roadout');
    if (out) {
      var b = flat(out, 360, 'middle', 'backcloth');
      b.z = end + 700;
      stops.push(b);
    }
    var far = out ? end + 700 : end;
    return {
      stops: stops, decor: bunting(far), sides: true, eye: 165, horizon: 0.4, room: null,
      // The road and the pavements, and never through a front or behind one.
      bounds: function () {
        var lim = ROAD + KERB - 40;
        return { x: [-lim, lim], z: [-200, far - 260] };
      },
      ground: streetGround
    };
  }

  // Card bunting strung across the road, in the street's own inks, as the
  // front page has it over its doors. It lights nothing and nothing moves it.
  var BUNT = ['--hot', '--cyan', '--yellow', '--green', '--violet', '--orange'];
  function bunting(far) {
    var out = [], NS = 'http://www.w3.org/2000/svg', w = 2 * (ROAD + KERB) + 40;
    for (var z = 900, n = 0; z < far - 300; z += 1100, n++) {
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + w + ' 90');
      svg.setAttribute('width', w); svg.setAttribute('height', 90);
      svg.setAttribute('aria-hidden', 'true');
      var line = document.createElementNS(NS, 'path');
      line.setAttribute('d', 'M0 6 Q' + w / 2 + ' 46 ' + w + ' 6');
      line.setAttribute('fill', 'none'); line.setAttribute('stroke', 'var(--ps-kerb)'); line.setAttribute('stroke-width', 3);
      svg.appendChild(line);
      for (var i = 0, k = 0; i < w - 40; i += 46, k++) {
        var t = (i + 23) / w, y = 6 + 160 * t * (1 - t) * 0.5;
        var tri = document.createElementNS(NS, 'path');
        tri.setAttribute('d', 'M' + (i + 4) + ' ' + y + ' L' + (i + 42) + ' ' + y + ' L' + (i + 23) + ' ' + (y + 38) + ' Z');
        tri.setAttribute('fill', 'var(' + BUNT[(k + n) % BUNT.length] + ')');
        svg.appendChild(tri);
      }
      var wrap = document.createElement('div');
      wrap.className = 'ps-thing';
      wrap.style.width = w + 'px'; wrap.style.height = '90px';
      wrap.appendChild(svg);
      flatsEl.appendChild(wrap);
      out.push({ el: wrap, x: 0, y: 440, z: z, w: w, h: 90, turn: 0 });
    }
    return out;
  }

  // Sizes are only known once the copies are in the page and their faces load.
  function measure() {
    if (scene !== street) return;
    street.stops.forEach(function (s) {
      s.el.style.transform = 'none';
      s.h = s.el.offsetHeight || 280;
      s.x = s.side === 'left' ? -(ROAD + KERB) : s.side === 'right' ? (ROAD + KERB) : 0;
      // Where you stand to look at it: across the road from it, far enough
      // back that the whole front is on the stage, turned to face it.
      var fit = Math.min(2.2, (W - 40) / s.w, (BASE - 10) / Math.max(s.h - EYE, 1), (H - BASE - 10) / EYE);
      var back = Math.min(F / Math.max(fit, 0.2), 2 * (ROAD + KERB) - 80);
      s.spot = s.side === 'left' ? { x: s.x + back, z: s.z, yaw: RIGHT }
             : s.side === 'right' ? { x: s.x - back, z: s.z, yaw: LEFT }
             : { x: 0, z: s.z - back, yaw: 0 };
      // The light a front throws onto the road in front of it, in its own colour.
      var c = getComputedStyle(s.el.firstElementChild).backgroundColor;
      s.pool = (c && c !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(c)) ? c : null;
    });
    floorUp();
  }

  /* ── Where things land on the screen ──────────────────────────────────── */
  function size() {
    var r = view.getBoundingClientRect();
    W = r.width; H = r.height;
    F = Math.max(320, Math.min(W * 0.9, 900));
    EYE = scene ? scene.eye : 165;
    BASE = H * (scene ? scene.horizon : 0.4);
    lookAt();
    view.style.perspective = (F * ZOOM) + 'px';
  }

  // Looking up slides the horizon down the stage, so the roof comes in from
  // the top; never so far that the floor or the sky leaves the stage entirely.
  function lookAt() {
    var lim = H * 0.36;
    pitch = Math.max(-lim, Math.min(lim, pitch));
    HORIZON = BASE + pitch;
    view.style.perspectiveOrigin = (W / 2) + 'px ' + HORIZON + 'px';
  }

  // Where you see a point from: across (rx) and away (rz), turned to the way
  // you face. Worked out, never applied to anything as a turn.
  function seen(x, z) {
    var dx = x - cam.x, dz = z - cam.z, c = Math.cos(yaw), n = Math.sin(yaw);
    return { rx: dx * c - dz * n, rz: dx * n + dz * c };
  }
  function screenAt(rx, y, rz) {
    if (rz <= 1) return null;
    var s = F / rz;
    return { x: W / 2 + rx * s, y: HORIZON + (EYE - y) * s, s: s, dz: rz };
  }
  function project(x, y, z) {
    var v = seen(x, z);
    return screenAt(v.rx, y, v.rz);
  }

  // The rig: the whole world, moved by where you stand and turned by which way
  // you face. A point in the world (x across, y up, z away) is (x, -y, -z) in
  // the page's own axes, so this puts your eye at the stage's perspective.
  function rig() {
    flatsEl.style.transform = 'translate3d(' + (W / 2).toFixed(1) + 'px,' + HORIZON.toFixed(1) + 'px,' + (F * ZOOM).toFixed(1) + 'px) rotateY(' +
      yaw.toFixed(5) + 'rad) translate3d(' + (-cam.x).toFixed(1) + 'px,' + EYE.toFixed(1) + 'px,' + cam.z.toFixed(1) + 'px)';
  }

  // A thing in the world keeps its own place and facing; it is put away only
  // when it is wholly behind you or wholly too far to matter. Your companions
  // (mine) are drawn from where you look, on their own layer, as before.
  function place(item) {
    if (!item.el) return;
    if (item.mine) {
      var p = screenAt(item.x - item.w / 2, (item.y || 0) + item.h, item.z);
      if (!p) { item.el.classList.add('ps-off'); return; }
      item.el.classList.remove('ps-off');
      item.el.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px) scale(' + p.s.toFixed(4) + ')';
      item.el.style.zIndex = String(Math.max(1, Math.round(100000 - p.dz)));
      return;
    }
    var t = item.turn || 0, c = Math.cos(t), n = Math.sin(t);
    var x0 = item.x - item.w / 2 * c, z0 = item.z - item.w / 2 * n;
    var a = seen(x0, z0), b = seen(x0 + item.w * c, z0 + item.w * n);
    var on = Math.max(a.rz, b.rz) > F * (item.near || NEAR) && Math.min(a.rz, b.rz) < F * FAR;
    item.el.classList.toggle('ps-off', !on);
    item.el.style.transform = 'translate3d(' + x0.toFixed(1) + 'px,' + (-((item.y || 0) + item.h)).toFixed(1) + 'px,' + (-z0).toFixed(1) +
      'px) rotateY(' + t.toFixed(5) + 'rad)';
  }

  function ink(name) { return getComputedStyle(stage).getPropertyValue(name).trim() || '#000'; }

  // THE FLOOR IS A PLANE IN THE WORLD, drawn once from above onto a canvas and
  // laid down flat, rather than worked out again every time you move. A room's
  // ground() draws on it in the world's own units with quad() and oval().
  var map = null;
  function floor(g, pts, fill, alpha) {
    if (!map) return;
    g.globalAlpha = alpha == null ? 1 : alpha;
    g.fillStyle = fill;
    g.beginPath();
    pts.forEach(function (q, j) {
      var u = (q[0] - map.x0) / map.k, v = (map.z1 - q[1]) / map.k;
      if (j) g.lineTo(u, v); else g.moveTo(u, v);
    });
    g.closePath(); g.fill();
    g.globalAlpha = 1;
  }
  function quad(g, x0, x1, z0, z1, fill, alpha) { floor(g, [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], fill, alpha); }
  function oval(g, x, z, rx, rz, fill, alpha) {
    var pts = [];
    for (var i = 0; i < 24; i++) {
      var t = i / 24 * Math.PI * 2;
      pts.push([x + Math.cos(t) * rx, z + Math.sin(t) * rz]);
    }
    floor(g, pts, fill, alpha);
  }
  // Laid in tiles: one plane the length of the street is a layer too big for
  // the browser to draw in 3D, and it quietly draws nothing.
  var TILE = 2000, TK = 6;
  function floorUp() {
    if (!scene) return;
    (scene.floorEls || []).forEach(function (t) { t.el.remove(); });
    scene.floorEls = [];
    var b = scene.bounds({ x: 0, z: 1e9 });
    var z0 = b.z[0] - 2000, z1 = b.z[1] + F * 3 + 2000;
    for (var tz = z0; tz < z1; tz += TILE) {
      for (var tx = -3000; tx < 3000; tx += TILE) {
        var c = document.createElement('canvas');
        c.width = c.height = Math.ceil(TILE / TK);
        c.className = 'ps-floor';
        c.setAttribute('aria-hidden', 'true');
        c.style.width = c.style.height = TILE + 'px';
        c.style.transform = 'translate3d(' + tx + 'px,0px,' + (-(tz + TILE)) + 'px) rotateX(90deg)';
        map = { x0: tx, z1: tz + TILE, k: TK };
        scene.ground(c.getContext('2d'), tz, tz + TILE);
        flatsEl.insertBefore(c, flatsEl.firstChild);
        scene.floorEls.push({ el: c, x0: tx, z0: tz });
      }
    }
    map = null;
  }
  // A floor tile wholly behind you is put away, as anything else is.
  function placeFloor() {
    (scene.floorEls || []).forEach(function (t) {
      var far = -Infinity;
      [[t.x0, t.z0], [t.x0 + TILE, t.z0], [t.x0, t.z0 + TILE], [t.x0 + TILE, t.z0 + TILE]].forEach(function (q) {
        far = Math.max(far, seen(q[0], q[1]).rz);
      });
      t.el.classList.toggle('ps-off', far < 10);
    });
  }


  function streetGround(g, near, far) {
    var edge = ROAD + KERB + 4000;   // the floor runs out to the horizon whichever way you face
    quad(g, -edge, edge, near, far, ink('--ps-pave'));
    quad(g, -ROAD, ROAD, near, far, ink('--ps-road'));
    quad(g, -ROAD - 6, -ROAD, near, far, ink('--ps-kerb'));
    quad(g, ROAD, ROAD + 6, near, far, ink('--ps-kerb'));
    // The centre line, painted on the card in dashes.
    var dash = ink('--ps-line');
    for (var z = Math.ceil(near / 200) * 200; z < far; z += 200) quad(g, -5, 5, z, z + 90, dash);
    // Paving slabs on the pavements, scored into the card.
    var seam = ink('--ps-road');
    for (z = Math.ceil(near / 160) * 160; z < far; z += 160) {
      quad(g, -ROAD - KERB - 600, -ROAD - 6, z, z + 3, seam, 0.6);
      quad(g, ROAD + 6, ROAD + KERB + 600, z, z + 3, seam, 0.6);
    }
    // Pools of each front's own light on the road in front of it.
    street.stops.forEach(function (s) {
      if (!s.pool) return;
      var into = s.side === 'left' ? 1 : s.side === 'right' ? -1 : 0;
      if (into) oval(g, s.x + into * 150, s.z, s.w * 0.34, s.w * 0.62, s.pool, 0.22);
      else oval(g, s.x, s.z - 150, s.w * 0.62, s.w * 0.34, s.pool, 0.22);
    });
  }

  function draw() {
    rig();
    placeFloor();
    scene.decor.forEach(place);
    scene.stops.forEach(place);
    placeFolk();
    noteWhere();
  }

  /* ── Where you are, in words ──────────────────────────────────────────── */
  function spotFor(s) {
    if (typeof s.spot === 'function') return s.spot();
    return s.spot || { x: s.x, z: s.z - F };
  }

  var lastNear = null, quiet = null;
  function nearest() {
    var best = null, d = Infinity;
    scene.stops.forEach(function (s) {
      var sp = spotFor(s);
      var k = Math.abs(sp.z - cam.z) + Math.abs(sp.x - cam.x) * 0.5 + Math.abs(towards(yaw, sp.yaw || 0)) * 120;
      // Of things read from one place, the one with the keyboard.
      if (s.el && s.el.contains(document.activeElement)) k -= 1;
      if (k < d) { d = k; best = s; }
    });
    return best;
  }
  function whereWords(s) {
    if (!s) return '';
    var name = typeof s.name === 'function' ? s.name() : s.name;
    if (scene.room) return 'In ' + scene.room.name + ': ' + name + '.';
    return 'Standing by: ' + s.name + (s.side === 'middle' ? ', across the end of the road.' : ', on the ' + s.side + '.');
  }
  function noteWhere() {
    var s = nearest();
    if (s === lastNear) return;
    lastNear = s;
    var text = whereWords(s);
    // Said out loud only once you stop, so a glide does not chatter.
    clearTimeout(quiet);
    if (steps()) speak(here, text);
    else quiet = setTimeout(function () { speak(here, text); }, 700);
  }

  /* ── Moving ───────────────────────────────────────────────────────────── */
  function clamp() {
    var b = scene.bounds(cam);
    cam.x = Math.max(b.x[0], Math.min(b.x[1], cam.x));
    cam.z = Math.max(b.z[0], Math.min(b.z[1], cam.z));
  }

  function standAt(s) {
    var spot = spotFor(s);
    var face = spot.yaw || 0;
    if (steps()) { goal = null; cam.x = spot.x; cam.z = spot.z; yaw = face; pitch = 0; lookAt(); clamp(); draw(); return; }
    goal = { x: spot.x, z: spot.z, yaw: face, pitch: 0 };
    go();
  }
  function faceAhead() {
    if (steps()) { yaw = 0; pitch = 0; lookAt(); draw(); return; }
    goal = { x: cam.x, z: cam.z, yaw: 0, pitch: 0 };
    go();
  }
  // The shortest way round to an angle.
  function towards(from, to) {
    var d = (to - from) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  function go() {
    if (running) return;
    running = true; last = 0;
    requestAnimationFrame(tick);
  }

  function tick(t) {
    var dt = last ? Math.min(0.1, (t - last) / 1000) : 0;
    last = t;
    var fwd = (held.fwd ? 1 : 0) - (held.back ? 1 : 0);
    var across = (held.right ? 1 : 0) - (held.left ? 1 : 0);
    var turn = (held.turnr ? 1 : 0) - (held.turnl ? 1 : 0);
    var up = (held.lookup ? 1 : 0) - (held.lookdown ? 1 : 0);
    if (fwd || across || turn || up) {
      goal = null;
      // Ahead is the way you face; across is square to it.
      var c = Math.cos(yaw), n = Math.sin(yaw);
      cam.x += (fwd * SPEED * n + across * SIDEWAYS * c) * dt;
      cam.z += (fwd * SPEED * c - across * SIDEWAYS * n) * dt;
      yaw += turn * TURN * dt;
      pitch += up * LOOK * dt;
      lookAt();
    } else if (goal) {
      var k = Math.min(1, dt * 7);
      cam.x += (goal.x - cam.x) * k;
      cam.z += (goal.z - cam.z) * k;
      yaw += towards(yaw, goal.yaw) * k;
      pitch += (goal.pitch - pitch) * k;
      lookAt();
      if (Math.abs(goal.x - cam.x) < 1 && Math.abs(goal.z - cam.z) < 1 && Math.abs(towards(yaw, goal.yaw)) < 0.004 && Math.abs(goal.pitch - pitch) < 1) {
        cam.x = goal.x; cam.z = goal.z; yaw = goal.yaw; pitch = goal.pitch; lookAt(); goal = null;
      }
    }
    clamp();
    draw();
    if (fwd || across || turn || up || goal) requestAnimationFrame(tick);
    else running = false;
  }

  // In steps, a press is one stop; the keyboard goes with it, so Enter goes in.
  function step(dir) {
    if (dir === 'turnl' || dir === 'turnr') { yaw += (dir === 'turnr' ? 1 : -1) * STEP_TURN; draw(); return; }
    if (dir === 'lookup' || dir === 'lookdown') { pitch += (dir === 'lookup' ? 1 : -1) * H * 0.12; lookAt(); draw(); return; }
    if (dir === 'ahead') { faceAhead(); return; }
    var list = scene.stops;
    if (!list.length) return;
    var at = nearest() || list[0];
    var i = list.indexOf(at);
    var next = null;
    if (dir === 'fwd' || dir === 'back') {
      next = list[Math.max(0, Math.min(list.length - 1, i + (dir === 'fwd' ? 1 : -1)))];
    } else if (scene.sides) {
      var want = dir === 'left' ? 'left' : 'right';
      for (var j = i; j < list.length && !next; j++) if (list[j].side === want) next = list[j];
      for (var k = i; k >= 0 && !next; k--) if (list[k].side === want) next = list[k];
    }
    if (!next) return;
    standAt(next);
    if (next.link) next.link.focus({ preventScroll: true });
  }

  var KEYS = { ArrowUp: 'fwd', w: 'fwd', W: 'fwd', ArrowDown: 'back', s: 'back', S: 'back',
               ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right',
               q: 'turnl', Q: 'turnl', e: 'turnr', E: 'turnr', r: 'lookup', R: 'lookup', f: 'lookdown', F: 'lookdown',
               x: 'ahead', X: 'ahead' };

  // Shift and an arrow turns and looks instead of walking, as Q, E, R and F do.
  var SHIFTED = { ArrowUp: 'lookup', ArrowDown: 'lookdown', ArrowLeft: 'turnl', ArrowRight: 'turnr' };
  stage.addEventListener('keydown', function (e) {
    if (!e.altKey && !e.ctrlKey && !e.metaKey && (e.target === stage || e.target.tagName === 'A')) {
      var z = e.key === '+' || e.key === '=' ? 'in' : e.key === '-' || e.key === '_' ? 'out' : e.key === '0' ? 'reset' : null;
      if (z) { e.preventDefault(); zoom(z); return; }
    }
    var dir = e.shiftKey && SHIFTED[e.key] ? SHIFTED[e.key] : KEYS[e.key];
    if (!dir || e.altKey || e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    if (dir === 'ahead') { if (!e.repeat) faceAhead(); return; }
    if (steps()) { if (!e.repeat) step(dir); return; }
    held[dir] = true; go();
  });
  stage.addEventListener('keyup', function (e) {
    var dir = KEYS[e.key];
    if (dir) held[dir] = false;
    if (SHIFTED[e.key]) held[SHIFTED[e.key]] = false;
    if (e.key === 'Shift') Object.keys(SHIFTED).forEach(function (k) { held[SHIFTED[k]] = false; });
  });
  stage.addEventListener('focusout', function (e) {
    if (!stage.contains(e.relatedTarget)) held = {};
  });
  // The keyboard going into a page standing in the scene makes the browser
  // scroll the window to show that frame, and a frame in a 3D scene can seem
  // to be anywhere, so the window jumped away mid-walk. Where the window was
  // when Tab was pressed is put back the moment the keyboard lands.
  var tabFrom = null;
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') tabFrom = { x: window.scrollX, y: window.scrollY };
  }, true);
  function keepWindow() {
    if (tabFrom && (window.scrollX !== tabFrom.x || window.scrollY !== tabFrom.y)) window.scrollTo(tabFrom.x, tabFrom.y);
    tabFrom = null;
  }
  // The keyboard going to anything standing in the scene stands you at it.
  function standAtThing(e) {
    keepWindow();
    for (var n = e.target; n && n !== flatsEl; n = n.parentNode) {
      var s = byEl.get(n);
      if (!s) continue;
      // Several things read from one place (a fingerpost's arms) are told
      // apart by what has the keyboard, not by where you stand.
      if (spotFor(s).z !== cam.z || spotFor(s).x !== cam.x) standAt(s);
      else noteWhere();
      return;
    }
  }
  flatsEl.addEventListener('focusin', standAtThing);
  flatsEl.addEventListener('ps-into', standAtThing);

  // The buttons under the stage: a press is a step, and in Glide, holding one walks.
  Array.prototype.forEach.call(controls.querySelectorAll('[data-ps-go]'), function (b) {
    var dir = b.getAttribute('data-ps-go');
    var stop = function () { held[dir] = false; };
    b.addEventListener('pointerdown', function (e) {
      if (steps() || dir === 'ahead') return;
      e.preventDefault();
      held[dir] = true; go();
      try { b.setPointerCapture(e.pointerId); } catch (x) {}
    });
    b.addEventListener('pointerup', stop);
    b.addEventListener('pointercancel', stop);
    b.addEventListener('lostpointercapture', stop);
    b.addEventListener('click', function (e) {
      // A click from a pointer already walked while it was held.
      if (dir === 'ahead') { faceAhead(); return; }
      if (!steps() && e.detail) return;
      if (steps()) step(dir);
      else { held[dir] = true; go(); setTimeout(stop, 260); }
    });
  });

  /* ── Dragging to look ─────────────────────────────────────────────────── */
  // A drag across the street looks round, at every setting, because the view
  // follows your own hand and nothing else. On a touch screen only a sideways
  // drag turns (the stage lets the page scroll up and down under a thumb); a
  // mouse looks up and down as well. A drag that went anywhere is not a press.
  var drag = null, dragged = false;
  stage.addEventListener('pointerdown', function (e) {
    if (e.button || !scene || (e.target.closest && e.target.closest('iframe'))) return;
    drag = { x: e.clientX, y: e.clientY, yaw: yaw, pitch: pitch, id: e.pointerId, touch: e.pointerType === 'touch' };
    dragged = false;
  });
  stage.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!dragged && Math.abs(dx) < 6 && (drag.touch || Math.abs(dy) < 6)) return;
    if (!dragged) { dragged = true; try { stage.setPointerCapture(drag.id); } catch (x) {} goal = null; }
    yaw = drag.yaw - dx * 0.005;
    if (!drag.touch) { pitch = drag.pitch + dy; lookAt(); }
    draw();
  });
  function dropDrag() { drag = null; }
  stage.addEventListener('pointerup', dropDrag);
  stage.addEventListener('pointercancel', function () { drag = null; dragged = false; });
  stage.addEventListener('click', function (e) {
    if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; }
  }, true);

  /* ── Zoom, full screen and a game controller ──────────────────────────── */
  // ZOOM, so the words on a door or a page in a room can be read from where
  // you stand: a quarter again at each press, up to four times, for this
  // visit, and nothing remembers it.
  var ZOOMS = [1, 1.25, 1.6, 2, 2.5, 3.2, 4], zoomAt = 0;
  var zoomedEl = document.querySelector('[data-ps-zoomed]');
  function zoom(how) {
    zoomAt = how === 'in' ? Math.min(ZOOMS.length - 1, zoomAt + 1) : how === 'out' ? Math.max(0, zoomAt - 1) : 0;
    ZOOM = ZOOMS[zoomAt];
    if (!scene) return;
    view.style.perspective = (F * ZOOM) + 'px';
    draw();
    if (zoomedEl) zoomedEl.textContent = zoomAt ? 'Zoomed in ' + ZOOM + ' times' : 'Normal size';
  }
  Array.prototype.forEach.call(controls.querySelectorAll('[data-ps-zoom]'), function (b) {
    b.addEventListener('click', function () { zoom(b.getAttribute('data-ps-zoom')); });
  });
  // A pinch on a trackpad arrives as the wheel with Control held.
  var pinch = 0;
  stage.addEventListener('wheel', function (e) {
    if (!e.ctrlKey) return;
    e.preventDefault();
    pinch += e.deltaY;
    if (Math.abs(pinch) > 40) { zoom(pinch < 0 ? 'in' : 'out'); pinch = 0; }
  }, { passive: false });

  // FULL SCREEN: the street, the words under it and its buttons fill the
  // screen, and Escape or the same button brings them back. Inside a room the
  // stage changing size sets the room up again, as any change of size does.
  var fullEl = document.querySelector('[data-ps-full]');
  var fullBtn = controls.querySelector('[data-ps-fullscreen]');
  function fullNow() { return document.fullscreenElement || document.webkitFullscreenElement; }
  if (fullBtn && fullEl && (document.fullscreenEnabled || document.webkitFullscreenEnabled)) {
    fullBtn.hidden = false;
    fullBtn.addEventListener('click', function () {
      if (fullNow()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else {
        var asked = (fullEl.requestFullscreen || fullEl.webkitRequestFullscreen).call(fullEl);
        if (asked && asked.catch) asked.catch(function () {});
      }
    });
    var flipped = function () {
      fullBtn.textContent = fullNow() ? 'Leave full screen' : 'Full screen';
      if (fullNow()) stage.focus({ preventScroll: true });
    };
    document.addEventListener('fullscreenchange', flipped);
    document.addEventListener('webkitfullscreenchange', flipped);
  }

  // A GAME CONTROLLER, such as an Xbox controller on a Mac. A browser shows a
  // page a controller only once one of its buttons has been pressed there,
  // and has no event for a stick moving, so while one is connected, and only
  // then, the page reads it once a frame; a frame with nothing asked of it
  // moves and draws nothing. Standard mapping: the left stick walks, the right
  // stick turns and looks, the triggers zoom, the bumpers go to the door or
  // place before and after, A goes in, B backs out and X faces ahead.
  var pads = 0, padFrame = 0, padLast = 0, padWas = {}, padStepped = {};
  var DEAD = 0.2;
  var padEl = controls.querySelector('[data-ps-pad]');
  function padSay() { if (padEl) padEl.hidden = !pads; }
  function axis(v) { return Math.abs(v) < DEAD ? 0 : (v - (v < 0 ? -DEAD : DEAD)) / (1 - DEAD); }
  function placeBy(n) {
    var list = scene ? scene.stops : [];
    if (!list.length) return;
    var i = list.indexOf(nearest());
    var next = list[i < 0 ? 0 : Math.max(0, Math.min(list.length - 1, i + n))];
    standAt(next);
    if (next.link) next.link.focus({ preventScroll: true });
  }
  function padIn() {
    var s = nearest();
    if (!s) return;
    if (s.link) { s.link.click(); return; }
    var t = s.el && s.el.querySelector('iframe, button, a[href], summary, [tabindex]');
    if (t) t.focus({ preventScroll: true });
  }
  function padTick(t) {
    padFrame = 0;
    if (!pads) return;
    var dt = padLast ? Math.min(0.1, (t - padLast) / 1000) : 0;
    padLast = t;
    var all = navigator.getGamepads ? navigator.getGamepads() : [];
    var moved = false;
    for (var n = 0; n < all.length; n++) {
      var g = all[n];
      if (!g || !scene) continue;
      // Some controllers' drivers give a button's value and leave pressed false.
      var b = function (k) { var x = g.buttons[k]; return !!x && (x.pressed || x.value > 0.5); };
      var once = function (k) { var key = g.index + ':' + k, was = padWas[key]; padWas[key] = b(k); return b(k) && !was; };
      if (once(0)) padIn();
      if (once(1) && outBtn && !outBtn.hidden) outBtn.click();
      if (once(2)) faceAhead();
      if (once(4)) placeBy(-1);
      if (once(5)) placeBy(1);
      if (once(6)) zoom('out');
      if (once(7)) zoom('in');
      var fwd = -axis(g.axes[1] || 0) + (b(12) ? 1 : 0) - (b(13) ? 1 : 0);
      var across = axis(g.axes[0] || 0) + (b(15) ? 1 : 0) - (b(14) ? 1 : 0);
      var turn = axis(g.axes[2] || 0), up = -axis(g.axes[3] || 0);
      if (!steps()) {
        if (fwd || across || turn || up) {
          goal = null;
          var c = Math.cos(yaw), si = Math.sin(yaw);
          cam.x += (fwd * SPEED * si + across * SIDEWAYS * c) * dt;
          cam.z += (fwd * SPEED * c - across * SIDEWAYS * si) * dt;
          yaw += turn * TURN * dt;
          pitch += up * LOOK * dt;
          lookAt();
          moved = true;
        }
      } else {
        // In steps, a push of a stick is one step, and it has to come back
        // before the next.
        [['fwd', fwd > 0.6], ['back', fwd < -0.6], ['right', across > 0.6], ['left', across < -0.6],
         ['turnr', turn > 0.6], ['turnl', turn < -0.6], ['lookup', up > 0.6], ['lookdown', up < -0.6]].forEach(function (q) {
          var key = g.index + ':' + q[0];
          if (q[1] && !padStepped[key]) step(q[0]);
          padStepped[key] = q[1];
        });
      }
    }
    if (moved) { clamp(); draw(); }
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

  /* ── Steps or Glide ───────────────────────────────────────────────────── */
  var modeBtn = controls.querySelector('[data-ps-mode]');
  function showMode() {
    if (!modeBtn) return;
    modeBtn.setAttribute('aria-pressed', steps() ? 'true' : 'false');
    modeBtn.textContent = steps() ? 'Moving in steps: switch to gliding' : 'Gliding: switch to steps';
  }
  function setMode(m, byHand) {
    mode = m; if (byHand) chosen = true;
    held = {}; goal = null;
    showMode();
  }
  if (modeBtn) modeBtn.addEventListener('click', function () {
    setMode(steps() ? 'glide' : 'steps', true);
    speak(said, steps() ? 'You move in steps now, one stop at a time.' : 'You glide now, for as long as you hold a key or a button.');
  });
  window.addEventListener('love-intensity', function () {
    if (!chosen) setMode(level() === 'gentle' ? 'steps' : 'glide');
    // A room's light on its floor can follow the dial, so the floor is drawn again.
    if (scene) floorUp();
  });

  /* ── Rooms ────────────────────────────────────────────────────────────── */
  var outBtn = controls.querySelector('[data-ps-out]');
  var pageLink = controls.querySelector('[data-ps-page]');

  function script(src, ready) {
    if (ready()) return Promise.resolve();
    return new Promise(function (ok, no) {
      var s = document.createElement('script');
      s.src = src; s.defer = true;
      s.onload = function () { ready() ? ok() : no(); };
      s.onerror = no;
      document.head.appendChild(s);
    });
  }

  // The room's real page, on whatever the room hangs it on. Its links that go
  // to another page leave for the whole window, because a room's way back to
  // the street opening the street inside the room is a hall of mirrors.
  function screen(page, title) {
    var f = document.createElement('iframe');
    f.src = page;
    f.title = title;
    f.addEventListener('load', function () {
      var d = null;
      try { d = f.contentDocument; } catch (x) { return; }
      if (!d) return;
      // The keyboard going into the page is never heard out here, so the page
      // says so, and you are stood in front of the screen it is on.
      d.addEventListener('focusin', function () {
        f.dispatchEvent(new CustomEvent('ps-into', { bubbles: true }));
      });
      d.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href]');
        if (!a) return;
        var to = a.getAttribute('href');
        if (to.charAt(0) !== '#') a.target = '_top';
      }, true);
    });
    return f;
  }

  // What a room's file is handed: how to stand a thing in its scene, and how
  // to see it from where you are. Nothing about what the room is.
  function kit(page, name) {
    return {
      W: W, H: H, F: F, page: page, name: name,
      // The two facings a thing along a wall can have: turned to face across
      // the room from the left wall, and from the right.
      LEFT: LEFT, RIGHT: RIGHT,
      // Where to stand to look at a thing square on, whichever way it faces:
      // out in front of it, far enough back that all of it is on the stage, and
      // turned to it. Worked out when it is asked for, so a thing lifted off a
      // page is stood back from at its real size, and from this scene's eye.
      front: function (it, most) {
        return function () {
          var top = (it.y || 0) + it.h;
          var fit = Math.min(2, (W - 40) / it.w, (BASE - 10) / Math.max(top - EYE, 1), (H - BASE - 10) / Math.max(EYE - (it.y || 0), 1));
          var back = F / Math.max(fit, 0.15);
          if (most) back = Math.min(back, most);
          var t = it.turn || 0;
          return { x: it.x + Math.sin(t) * back, z: it.z - Math.cos(t) * back, yaw: -t };
        };
      },
      item: function (node, o) {
        var wrap = document.createElement('div');
        wrap.className = 'ps-thing' + (o.cls ? ' ' + o.cls : '');
        wrap.style.width = o.w + 'px';
        wrap.style.height = o.h + 'px';
        if (node) wrap.appendChild(node);
        flatsEl.appendChild(wrap);
        var it = { el: wrap, x: o.x || 0, y: o.y || 0, z: o.z || 0, w: o.w, h: o.h, near: o.near, turn: o.turn || 0 };
        return it;
      },
      stop: function (o, it) {
        var s = { el: it ? it.el : null, x: it ? it.x : (o.x || 0), z: it ? it.z : (o.z || 0), y: it ? it.y : 0, w: it ? it.w : 0,
                  h: it ? it.h : 0, turn: it ? it.turn : 0, name: o.name, spot: o.spot, link: o.link || null, side: 'middle' };
        if (it) { byEl.set(it.el, s); (it.stops = it.stops || []).push(s); }
        return s;
      },
      // A thing off the room's own page, copied out of the page on its screen
      // once that has loaded, so nothing more is fetched: the wireless itself
      // rather than a drawing of it. It wears the page's own body class, so the
      // room's own rules dress it, and it is pressed as it is on the page;
      // love-embed.js, on this page too, turns a pressed facade into a player
      // here as it does there. A thing whose page has lost it stays empty, and
      // tools/make-paper-street.py refuses a room that lifts what its page
      // does not have.
      lift: function (frame, sel, o) {
        var wrap = document.createElement('div');
        wrap.className = 'ps-thing ps-lifted' + (o.cls ? ' ' + o.cls : '');
        wrap.style.width = o.w + 'px';
        flatsEl.appendChild(wrap);
        var it = { el: wrap, x: o.x || 0, y: o.y || 0, z: o.z || 0, w: o.w, h: o.h || 1, near: o.near, turn: o.turn || 0 };
        var put = function () {
          var d = null;
          try { d = frame.contentDocument; } catch (x) { return; }
          var all = d ? d.querySelectorAll(sel) : [];
          var node = all[o.n || 0];
          if (!node || wrap.firstChild || !wrap.isConnected) return;
          var dress = document.createElement('div');
          dress.className = d.body.className;
          dress.style.minHeight = '0';
          var copy = document.importNode(node, true);
          // Parts that only another of the room's own scripts can work, which is
          // not here, are left out rather than left dead (o.drop).
          if (o.drop) Array.prototype.forEach.call(copy.querySelectorAll(o.drop), function (n) { n.remove(); });
          dress.appendChild(copy);
          wrap.appendChild(dress);
          // Its size is known only now, so the stops standing at it learn it too.
          it.h = wrap.offsetHeight;
          (it.stops || []).forEach(function (st) { st.h = it.h; });
          if (scene && scene.room) draw();
        };
        frame.addEventListener('load', put);
        put();
        return it;
      },
      // The room's own script, run against what was lifted, once it has all
      // arrived: the Mopery's parlour plays its cellos because mopery.js finds
      // the copies here as it finds the originals there. Only a script the
      // room's own page loads (make-paper-street.py holds that), and loaded
      // afresh each time the room is built, because it finds its parts once,
      // when it runs.
      wire: function (frame, src) {
        var run = function () {
          setTimeout(function () {
            var s = document.createElement('script');
            s.src = src + '?walk=' + (++wired);
            document.head.appendChild(s);
          }, 0);
        };
        frame.addEventListener('load', run);
      },
      // A WAY INTO A ROOM BEHIND THIS ONE: a pitch's post, a turning's board, a
      // door at the back, drawn by the room (art) with the way's own name laid
      // over it in the room's own lettering (label, a class of the room's), and
      // a real link to that room's page, which walks you in here and takes you
      // there anywhere else. Under it, on the theatre's own card, it says you
      // can walk in, or that nothing is behind it yet; its words never dimmed.
      door: function (page, o) {
        o = o || {};
        var it = this.item(o.art || null, o);
        var a = document.createElement(page ? 'a' : 'span');
        a.className = 'ps-way' + (o.label ? ' ' + o.label : '');
        if (page) a.href = page;
        if (o.no) {
          var no = document.createElement('span');
          no.className = 'ps-way__no';
          no.textContent = o.no;
          a.appendChild(no);
        }
        var nm = document.createElement('span');
        nm.className = 'ps-way__name';
        nm.textContent = o.name || NAMES[page] || page;
        a.appendChild(nm);
        it.el.appendChild(a);
        var tag = document.createElement('span');
        tag.className = 'ps-walkin';
        tag.id = 'ps-walkin-' + (++tagged);
        tag.textContent = page && ROOMS[page] ? 'You can walk in' : page ? 'Its page' : 'Nothing behind it yet';
        it.el.appendChild(tag);
        a.setAttribute('aria-describedby', tag.id);
        it.link = page ? a : null;
        it.page = page || null;
        it.wayName = nm.textContent;
        return it;
      },
      screen: screen, project: project, quad: quad, oval: oval, ink: ink
    };
  }
  // The room a room opens off, as tools/make-paper-street.py reads it off each
  // room's own file; the way out of a room goes back into it, and a room reached
  // by its address or the teleporter still backs out through it.
  function parentOf(page) { return FROM[page] && ROOMS[FROM[page]] ? FROM[page] : ''; }

  // keep: rebuilt for a new size, so you stay where you are standing and
  // nothing is said.
  // cameFrom: the room behind this one you have just backed out of, so you are
  // stood at the way into it.
  function enter(page, push, keep, cameFrom) {
    var mod = ROOMS[page];
    var was = scene && scene.room ? scene.room.page : '';
    if (!mod) return Promise.resolve(false);
    var name = NAMES[page] || (street && street.stops.filter(function (s) { return s.link && pageOf(s.link) === page; })[0] || {}).name || page;
    return script(mod, function () { return !!window.lovePaperRooms[page]; }).then(function () {
      var room = window.lovePaperRooms[page];
      if (scene === street) {
        street.cam = { x: cam.x, z: cam.z };
        street.frag = document.createDocumentFragment();
        while (flatsEl.firstChild) street.frag.appendChild(flatsEl.firstChild);
      } else if (scene && scene.room) {
        flatsEl.textContent = '';
        if (scene.cls) stage.classList.remove(scene.cls);
      }
      size();
      var built = room.build(kit(page, name));
      scene = {
        stops: built.stops, decor: built.decor || [], sides: false, room: { page: page, name: name },
        eye: built.eye || 165, horizon: built.horizon || 0.4, cls: built.cls || null,
        bounds: built.bounds, ground: built.ground
      };
      if (scene.cls) stage.classList.add(scene.cls);
      size();
      floorUp();
      var start = built.start || { x: 0, z: 0 };
      var way = cameFrom ? built.stops.filter(function (st) { return st.link && st.link.tagName === 'A' && pageOf(st.link) === cameFrom; })[0] : null;
      if (way) start = spotFor(way);
      if (!keep) { cam.x = start.x; cam.z = start.z; yaw = start.yaw || 0; pitch = 0; lookAt(); }
      goal = null; held = {};
      clamp();
      lastNear = keep ? nearest() : null;
      draw(); plateUp();
      if (push) history.pushState({ psIn: page, psFrom: was }, '', '#in=' + page.replace(/\.html$/, ''));
      var up = parentOf(page);
      if (outBtn) { outBtn.hidden = false; outBtn.textContent = up ? 'Back out to ' + NAMES[up] : 'Back out onto the street'; }
      if (pageLink) { pageLink.href = page; pageLink.textContent = 'Open ' + name + '’s page'; pageLink.hidden = false; }
      if (keep) return true;
      if (way) {
        speak(said, 'Back in ' + name + ', at the way into ' + (NAMES[cameFrom] || cameFrom) + '.');
        way.link.focus({ preventScroll: true });
        lastNear = way;
        return true;
      }
      speak(said, 'You are in ' + name + '. ' + (built.arrive || ''));
      stage.focus({ preventScroll: true });
      return true;
    }, function () {
      speak(said, 'That room could not be walked into just now, so here is its page.');
      location.href = page;
      return false;
    });
  }

  function leave() {
    if (!scene || !scene.room) return;
    var was = scene.room.page;
    flatsEl.textContent = '';
    if (scene.cls) stage.classList.remove(scene.cls);
    scene = street;
    if (street.frag) { flatsEl.appendChild(street.frag); street.frag = null; }
    size();
    var door = null;
    for (var p = was; p && !door; p = FROM[p]) door = street.stops.filter(function (s) { return s.link && pageOf(s.link) === p; })[0];
    if (door) { var sp = spotFor(door); cam.x = sp.x; cam.z = sp.z; }
    else if (street.cam) { cam.x = street.cam.x; cam.z = street.cam.z; }
    goal = null; held = {}; lastNear = null;
    clamp(); draw(); plateUp();
    if (outBtn) { outBtn.hidden = true; outBtn.textContent = 'Back out onto the street'; }
    if (pageLink) pageLink.hidden = true;
    speak(said, 'Back out on the street.');
    if (door && door.link) door.link.focus({ preventScroll: true });
  }

  flatsEl.addEventListener('click', function (e) {
    if (!scene || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]');
    if (!a || !ROOMS[pageOf(a)]) return;
    // In a room, only its ways into the rooms behind it walk you in; a link on
    // something lifted off its page is that page's own.
    if (scene !== street && !a.classList.contains('ps-way')) return;
    e.preventDefault();
    enter(pageOf(a), true);
  });
  // Going out is going back, when the room or street it backs out to is the
  // step behind; a room opened straight from its address, or teleported to,
  // backs out in place, through the room it opens off.
  if (outBtn) outBtn.addEventListener('click', function () {
    if (!scene || !scene.room) return;
    var cur = scene.room.page, to = parentOf(cur);
    var st = history.state || {};
    // psFrom is only ever what you walked in from; a step put in place here
    // has none, so going out of it never goes back past where you were.
    if (st.psIn === cur && st.psFrom === to) { history.back(); return; }
    if (to) {
      history.replaceState({ psIn: to, psFrom: null }, '', '#in=' + to.replace(/\.html$/, ''));
      enter(to, false, false, cur);
      return;
    }
    leave();
    history.replaceState({}, '', location.pathname);
  });
  // THE TELEPORTER: a room by its name, from the street or from inside any
  // room, straight there (Ryan, 2026-11-04). The names come with ROOMS, so it
  // asks for nothing, and going is a step in the tab's history like walking in.
  var teleForm = document.querySelector('[data-ps-tele]');
  var teleSaid = document.querySelector('[data-ps-tele-said]');
  var STREET_NAME = 'Paper Street itself';
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
    if (q === STREET_NAME.toLowerCase() || q === 'paper street' || q === 'the street') return { page: '' };
    var pages = Object.keys(NAMES);
    var exact = pages.filter(function (p) { return NAMES[p].toLowerCase() === q; });
    if (exact.length) return { page: exact[0] };
    var some = pages.filter(function (p) { return NAMES[p].toLowerCase().indexOf(q) >= 0; });
    return some.length === 1 ? { page: some[0] } : some.length ? { many: true } : { none: true };
  }
  function teleport(page) {
    var now = scene && scene.room ? scene.room.page : '';
    if (page === now) { speak(teleSaid, 'You are already there.'); return; }
    if (page === '') {
      leave();
      history.pushState({}, '', location.pathname);
      speak(teleSaid, 'Back out on Paper Street.');
      stage.focus({ preventScroll: true });
      return;
    }
    history.pushState({ psIn: page, psFrom: now }, '', '#in=' + page.replace(/\.html$/, ''));
    speak(teleSaid, 'Teleporting to ' + NAMES[page] + '\u2026');
    enter(page, false).then(function (ok) {
      if (ok) { speak(teleSaid, 'You are in ' + NAMES[page] + '.'); stage.focus({ preventScroll: true }); }
    });
  }
  if (teleForm) {
    var teleQ = teleForm.querySelector('input');
    teleForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!street) return;
      var f = teleFind(teleQ.value);
      if (f.page !== undefined) { teleQ.value = ''; teleport(f.page); stage.scrollIntoView({ block: 'nearest' }); }
      else speak(teleSaid, f.many ? 'Several rooms have that in their names: keep typing, or pick one from the list.' : 'No room on Paper Street goes by that name.');
    });
    // Picking a name from the list goes there at once; typing waits for Enter.
    teleQ.addEventListener('input', function (e) {
      if (e.inputType && e.inputType !== 'insertReplacementText') return;
      var f = teleFind(teleQ.value);
      if (f.page !== undefined && (f.page === '' || NAMES[f.page].toLowerCase() === teleQ.value.trim().toLowerCase())) teleForm.requestSubmit();
    });
  }
  window.addEventListener('popstate', function () {
    var want = roomInAddress();
    var cur = scene && scene.room ? scene.room.page : '';
    if (want && want !== cur) enter(want, false, false, cur);
    else if (!want && cur) leave();
  });
  function roomInAddress() {
    var m = /^#in=([a-z0-9-]+)$/.exec(location.hash);
    var page = m ? m[1] + '.html' : null;
    return page && ROOMS[page] ? page : null;
  }

  /* ── Companions ───────────────────────────────────────────────────────── */
  function figure(node, cls, h, aspect) {
    var el = document.createElement('div');
    el.className = 'ps-figure ' + cls;
    el.appendChild(node);
    folkEl.appendChild(el);
    var f = { el: el, h: h, w: h * aspect, x: 0, z: 0, mine: true };
    el.style.width = f.w + 'px'; el.style.height = f.h + 'px';
    folk.push(f);
    return f;
  }

  // Out on the road you are straight ahead; on the pavement, at a door, you
  // stand to the road side of it.
  // YOUR COMPANIONS ARE PLACED FROM WHERE YOU LOOK, not in the world: they are
  // with you whichever way you face. Each stands far enough off that its feet
  // are on the stage, which matters where the eye is high, as it is in a room
  // whose page fills the screen. Out on the road they are ahead of you; in a
  // room, or on the pavement at a door, they stand to either side, so neither
  // stands between you and the thing you came to.
  function placeFolk() {
    var room = H - 14 - HORIZON;
    var depth = function (want) { return room > 20 ? Math.max(want, F * EYE / room) : F * FAR * 0.9; };
    var aside = scene.room || Math.abs(cam.x) > ROAD;
    var edge = function (f, d, side) { return side * (W / 2 - f.w * (F / d) / 2 - 16) * d / F; };
    if (me) {
      me.z = depth(F * 0.72);
      me.x = aside ? edge(me, me.z, -1) : 0;
    }
    if (fam) {
      fam.z = depth(F * (me ? 0.8 : 0.85));
      fam.x = aside ? edge(fam, fam.z, 1) : F * 0.2;
    }
    folk.forEach(place);
  }

  function readFamiliar() {
    var v = null;
    try { v = JSON.parse(localStorage.getItem('love-familiar') || 'null'); } catch (e) { return null; }
    return v && v.parts ? v : null;
  }

  function bringFamiliar() {
    var v = readFamiliar();
    if (!v) return;
    script('chimera.js', function () { return !!window.loveChimera; }).then(function () {
      var C = window.loveChimera, p = C.clean(v.parts);
      var node = p && C.draw(p, { prefix: 'psf', cls: 'ps-figure__art' });
      if (!node) return;
      fam = figure(node, 'ps-figure--familiar', 92, 400 / 460);
      draw();
      var name = typeof v.name === 'string' && v.name ? v.name : 'Your familiar';
      var line = document.querySelector('[data-ps-familiar]');
      if (line) { line.textContent = name + ' is walking with you.'; line.hidden = false; }
    }, function () {});
  }

  function pass() {
    try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return v && v.pass ? v.pass : null; }
    catch (e) { return null; }
  }

  var bring = controls.querySelector('[data-ps-bring]');
  if (bring && pass()) {
    bring.hidden = false;
    bring.addEventListener('click', function () {
      if (me) {
        me.el.remove(); folk.splice(folk.indexOf(me), 1); me = null;
        bring.textContent = 'Bring my avatar';
        speak(said, 'Your avatar has gone home. You walk with no body now.');
        draw();
        return;
      }
      speak(said, 'Fetching your avatar…');
      fetch('/cb/avatars', { method: 'GET', credentials: 'omit', cache: 'no-store',
        headers: { accept: 'application/json', authorization: 'Bearer ' + pass() } })
        .then(function (r) { return r.json().then(function (b) { return { status: r.status, body: b }; }); })
        .then(function (r) {
          var list = r.body && r.body.avatars;
          if (r.status === 401) { speak(said, 'This username has been signed off. Sign on again and press it again.'); return; }
          if (r.status !== 200 || !list) { speak(said, 'Your avatars could not be fetched just now.'); return; }
          if (!list.length) { speak(said, 'You have no avatar kept yet. The Bodymind Booth is where one is drawn.'); return; }
          var a = list.filter(function (x) { return x.id === r.body.wearing; })[0] || list[0];
          return script('avatar.js', function () { return !!window.loveAvatar; }).then(function () {
            var node = window.loveAvatar.draw(a.look, { cls: 'ps-figure__art' });
            if (!node) { speak(said, 'That avatar could not be drawn.'); return; }
            var vb = (node.getAttribute('viewBox') || '0 0 200 300').split(' ').map(Number);
            me = figure(node, 'ps-figure--you', 158, vb[2] / vb[3]);
            bring.textContent = 'Send my avatar home';
            speak(said, 'You are walking as ' + (a.name || 'your avatar') + (a.id === r.body.wearing ? ', the one you wear on the CB.' : '.'));
            draw();
          });
        })
        .catch(function () { speak(said, 'The street could not be reached just now.'); });
    });
  }

  /* ── Starting ─────────────────────────────────────────────────────────── */
  setMode(level() === 'gentle' ? 'steps' : 'glide');
  read().then(function (doc) {
    street = scene = lay(doc);
    size();
    measure();
    cam.x = 0; cam.z = 0;
    controls.hidden = false;
    stage.classList.add('ps-stage--up');
    draw();
    bringFamiliar();
    // Faces arriving change every flat's height.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); if (scene === street) draw(); });
    plateUp();
    teleList();
    // Arriving at a room by its address (a room's Walk this room), the stage
    // comes to the top of the window once, so the room is above the fold;
    // never if you have already scrolled, and never again as you walk.
    var want = roomInAddress();
    if (want) {
      if (window.scrollY < 10) stage.scrollIntoView({ block: 'start' });
      enter(want, false);
    }
  }).catch(function () {
    if (failed) failed.hidden = false;
  });

  // When the stage itself changes size, not only the window: a stage measured
  // before the page had settled built a room for a stage no wide at all.
  var resizing = null, seenW = 0, seenH = 0;
  function resized() {
    clearTimeout(resizing);
    resizing = setTimeout(function () {
      var r = stage.getBoundingClientRect();
      if (!scene || (Math.round(r.width) === seenW && Math.round(r.height) === seenH)) return;
      seenW = Math.round(r.width); seenH = Math.round(r.height);
      if (scene.room) { enter(scene.room.page, false, true); return; }
      size(); measure(); draw();
    }, 120);
  }
  if (window.ResizeObserver) new ResizeObserver(resized).observe(stage);
  else window.addEventListener('resize', resized);
})();
