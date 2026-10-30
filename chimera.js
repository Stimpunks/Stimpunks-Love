/* =============================================================================
   The chimeras, drawn: every creature made in Chimera Obscura, wherever it
   goes. One file, so a chimera cannot be drawn one way on the room's table and
   another in somebody's Profile or on a sticker -- avatar.js's rule, for
   animals made of animals.

   A CHIMERA IS A LIST OF CHOICES, NEVER A PICTURE. Which animal gave the body,
   the head, the ears, the mouth, the arms, the feet, the tail, the back, the
   colours and the markings, every value a key out of the shelf below, and this file draws it
   fresh wherever it goes. clean() takes nothing it does not know, so no word
   anybody typed ever reaches the drawing; a chimera's name travels beside it
   and is never put inside it.

   IT BUILDS ELEMENTS, NOT MARKUP. The drawing is a small tree of nodes, turned
   into SVG elements with createElementNS in a page (draw()), and into a string
   only at build time, under Node, for the room's starting drawings (svg()). So
   no page ever writes this drawing with innerHTML, and the radio, whose own
   rule is that nothing becomes markup, can show it.

   EVERY PART IS FITTED TO THE BODY IT LANDS ON. Each animal is drawn for one
   shared rig, sitting up and facing you: a body of its own width and height, a
   head on top, ears placed round the head, a tail leaving the body's side, a
   back behind it. Nothing below is a picture of one animal; ears, tails, backs
   and markings are worked out from whatever body and head they are put on, so
   any part goes with any other. tools/chimera.test.mjs draws every pair.

   THE DRAWING IS SILENT. Every <svg> this makes is aria-hidden, and whoever
   shows one says what it is in words: words() says which animal gave which
   part, and a chimera's name is its maker's.

   THE SHELF IS GENERATED. Everything between the chimera:data markers is
   written by tools/make-chimera-obscura.py out of data/chimera-obscura.json,
   and the same keys go into netlify/cb/lib.mjs. Add an animal to the data file
   and run the tool. Never hand-edit between the markers.

   The drawings are code, written by Claude to Ryan's brief, after the
   chimeras Becky Hicks drew for stimpunks.org's About page.

   ARMS AND FEET BECAME PARTS OF THEIR OWN AFTER CHIMERAS WERE ALREADY BEING
   KEPT, so a part with defaults_to in the shelf (arms and feet, to the body)
   may be missing: a chimera kept, linked or sent before then takes its body's,
   in clean() here and in cleanChimera() on the CB, and an address of the older
   length still opens.

   NOTHING MOVES, AND NOTHING HERE STORES OR SENDS ANYTHING. It draws.
   ============================================================================= */
(function (root) {
  'use strict';

/* chimera:data:begin */
  var SHELF = {"slots":[{"key":"body","legend":"Body","word":"body"},{"key":"head","legend":"Head","word":"head"},{"key":"ears","legend":"Ears","word":"ears"},{"key":"mouth","legend":"Mouth","word":"mouth"},{"key":"arms","legend":"Arms","word":"arms","defaults_to":"body"},{"key":"feet","legend":"Feet","word":"feet","defaults_to":"body"},{"key":"tail","legend":"Tail","word":"tail"},{"key":"back","legend":"Back","word":"back"},{"key":"colours","legend":"Colours","word":"colours"},{"key":"markings","legend":"Markings","word":"markings"}],"groups":[{"key":"mammal","legend":"Mammals"},{"key":"bird","legend":"Birds"},{"key":"reptile","legend":"Reptiles"},{"key":"amphibian","legend":"Amphibians"},{"key":"fish","legend":"Fish"},{"key":"insect","legend":"Insects"},{"key":"arachnid","legend":"Arachnids"},{"key":"invertebrate","legend":"Other invertebrates"}],"animals":{"armadillo":{"group":"mammal","a":"an","say":["Armadillo","dillo"],"colours":{"fur":"#D8AE8E","light":"#F0D6BE","dark":"#8F6B52","skin":"#ECB9A3","nose":"#6D4A3A"},"body":{"w":168,"h":162,"top":0.7,"arms":"thin","feet":"claws"},"head":{"r":66,"sx":0.86,"sy":0.92,"shape":"round","muz":{"y":0.55,"rx":0.25,"ry":0.5},"nose":"small","eyes":{"x":0.4,"y":-0.1}},"ears":{"a":30,"type":"oval","s":0.34},"mouth":"tiny","tail":{"d":"M-6,-14 C40,-14 90,10 120,22 C126,25 122,31 115,30 C80,26 40,15 -6,14 Z","fill":"fur","bands":true,"axis":[0,0,118,26]},"back":{"kind":"shell","word":"an armadillo's plates","plate":"#9A7354","band":"#5E4231","speck":"#CBA584"},"markings":{"belly":true}},"axolotl":{"group":"amphibian","a":"an","say":["Axolotl","lotl"],"colours":{"fur":"#F3B3C3","light":"#FCE1E7","dark":"#D27891","skin":"#E2557F","nose":"#B9476A"},"body":{"w":150,"h":168,"top":0.72,"arms":"thin","feet":"small"},"head":{"r":74,"sx":1.22,"sy":0.86,"shape":"round","muz":{"none":true,"y":0.3,"rx":0.2,"ry":0.2},"nose":"none","eyes":{"x":0.52,"y":-0.06}},"ears":{"a":74,"type":"gills","s":0.42},"mouth":"grin","tail":{"d":"M-6,-14 C30,-30 70,-30 110,-50 C116,-52 120,-46 114,-40 C80,-6 40,14 -6,16 Z","fill":"fur"},"back":null,"markings":{"belly":true}},"badger":{"group":"mammal","a":"a","say":["Badger","badger"],"colours":{"fur":"#56555A","light":"#F0EFEA","dark":"#1D1D20","skin":"#4A4A4E","nose":"#111113"},"body":{"w":212,"h":152,"top":0.86,"arms":"thick","feet":"claws"},"head":{"r":76,"sx":1.08,"sy":0.94,"shape":"wedge","muz":{"y":0.44,"rx":0.3,"ry":0.26},"nose":"round","eyes":{"x":0.38,"y":-0.02}},"ears":{"a":58,"type":"semi","s":0.26},"mouth":"fierce","tail":{"d":"M-6,-10 C20,-40 60,-56 72,-48 C82,-40 52,-8 -6,12 Z","fill":"fur","axis":[0,0,70,-46]},"back":null,"markings":{"bands":true,"rimEars":true,"lightHead":true,"tailTip":true}},"bat":{"group":"mammal","a":"a","say":["Bat","bat"],"colours":{"fur":"#5B4A45","light":"#A58F84","dark":"#2C2321","skin":"#C08A8C","nose":"#2A1F1E"},"body":{"w":150,"h":156,"top":0.74,"arms":"membrane","feet":"claws"},"head":{"r":66,"sx":1.04,"sy":0.94,"shape":"round","muz":{"y":0.42,"rx":0.26,"ry":0.2},"nose":"tri","eyes":{"x":0.34,"y":-0.04}},"ears":{"a":28,"type":"tri","s":0.66},"mouth":"fangs","tail":{"none":true},"back":{"kind":"membrane","word":"a bat's wings","plate":"#433633","band":"#8A7570"},"markings":{"chest":true}},"bear":{"group":"mammal","a":"a","say":["Bear","bear"],"colours":{"fur":"#8A5A3B","light":"#D9AB7F","dark":"#4B2F20","skin":"#E3A587","nose":"#2A1A12"},"body":{"w":200,"h":178,"top":0.8,"arms":"thick","feet":"pads"},"head":{"r":80,"sx":1.05,"sy":1.0,"shape":"round","muz":{"y":0.36,"rx":0.44,"ry":0.3},"nose":"round","eyes":{"x":0.38,"y":-0.04}},"ears":{"a":42,"type":"round","s":0.36},"mouth":"smile","tail":{"d":"@circle 16 -4 17","fill":"fur","at":0.44},"back":null,"markings":{"belly":true}},"beaver":{"group":"mammal","a":"a","say":["Beaver","beaver"],"colours":{"fur":"#7D4F2C","light":"#B88660","dark":"#43281A","skin":"#3A2A22","nose":"#1E1510"},"body":{"w":198,"h":176,"top":0.78,"arms":"hands","feet":"webbed"},"head":{"r":74,"sx":1.04,"sy":0.96,"shape":"round","muz":{"y":0.4,"rx":0.38,"ry":0.26},"nose":"wide","eyes":{"x":0.38,"y":-0.08},"whiskers":true},"ears":{"a":62,"type":"round","s":0.18},"mouth":"chisel","tail":{"d":"M-6,-10 C20,-12 40,-16 60,-20 C100,-30 128,-12 124,6 C120,24 92,28 60,20 C40,16 20,14 -6,12 Z","fill":"skin","hatch":true},"back":null,"markings":{"belly":true}},"beetle":{"group":"insect","a":"a","say":["Beetle","beetle"],"colours":{"fur":"#2E6E50","light":"#8FD3AE","dark":"#163424","skin":"#6A4A2E","nose":"#163424"},"body":{"w":176,"h":170,"top":0.8,"arms":"legs","feet":"legs"},"head":{"r":60,"sx":1.12,"sy":0.86,"shape":"round","muz":{"none":true,"y":0.4,"rx":0.2,"ry":0.16},"nose":"none","eyes":{"x":0.5,"y":-0.1,"big":"compound"}},"ears":{"a":34,"type":"antennae","s":0.6},"mouth":"mandibles","tail":{"none":true},"back":{"kind":"elytra","word":"a beetle's wing cases","plate":"#2F8E62","band":"#12382A","tip":"#B9F0D2"},"markings":{"gloss":true}},"bluemorpho":{"word":"blue morpho butterfly","group":"insect","a":"a","say":["Morpho","morpho"],"colours":{"fur":"#4A3A2E","light":"#D8C6A6","dark":"#241A14","skin":"#8FC8F2","nose":"#241A14"},"body":{"w":124,"h":170,"top":0.6,"arms":"legs","feet":"legs"},"head":{"r":58,"sx":1.0,"sy":0.96,"shape":"round","muz":{"none":true,"y":0.4,"rx":0.2,"ry":0.16},"nose":"none","eyes":{"x":0.4,"y":-0.04,"big":"compound"}},"ears":{"a":22,"type":"clubs","s":0.9},"mouth":"proboscis","tail":{"none":true},"back":{"kind":"butterfly","word":"a blue morpho's wings","plate":"#2F86E6","band":"#14243F","tip":"#F7F3E8"},"markings":{"segments":true}},"camel":{"group":"mammal","a":"a","say":["Camel","camel"],"colours":{"fur":"#C9A06A","light":"#EBD7B0","dark":"#7E5A30","skin":"#A57E58","nose":"#4A3424"},"body":{"w":182,"h":170,"top":0.72,"neck":16,"arms":"thin","feet":"pads"},"head":{"r":64,"sx":0.84,"sy":1.1,"shape":"round","muz":{"none":true,"y":0.52,"rx":0.3,"ry":0.24},"nose":"nostrils","eyes":{"x":0.42,"y":-0.16,"big":"lashes"}},"ears":{"a":52,"type":"round","s":0.22},"mouth":"w","tail":{"d":"M-6,4 C20,14 36,32 42,60","whip":[8,4],"fill":"fur","tuft":[42,64,-10]},"back":{"kind":"humps","word":"a camel's humps","plate":"#C9A06A","band":"#7E5A30"},"markings":{"lowerFace":true}},"capybara":{"group":"mammal","a":"a","say":["Capybara","bara","Capy"],"colours":{"fur":"#9C6D47","light":"#BE9068","dark":"#5C3D25","skin":"#6E4B33","nose":"#2B1F17"},"body":{"w":214,"h":168,"top":0.84,"arms":"thick","feet":"pads"},"head":{"r":74,"sx":0.96,"sy":0.94,"shape":"block","muz":{"y":0.54,"rx":0.44,"ry":0.32},"nose":"wide","eyes":{"x":0.44,"y":-0.28}},"ears":{"a":46,"type":"round","s":0.17},"mouth":"smile","tail":{"d":"@circle 8 -4 8","fill":"fur","at":0.44},"back":null,"markings":{}},"cat":{"group":"mammal","a":"a","say":["Cat","cat"],"colours":{"fur":"#A2A1A6","light":"#ECE9E4","dark":"#4E4D53","skin":"#F2A7B5","nose":"#E58A9B"},"body":{"w":158,"h":168,"top":0.72,"arms":"thin","feet":"small"},"head":{"r":72,"sx":1.06,"sy":0.94,"shape":"round","muz":{"y":0.4,"rx":0.3,"ry":0.22},"nose":"tri","eyes":{"x":0.37,"y":-0.04},"whiskers":true},"ears":{"a":36,"type":"tri","s":0.42},"mouth":"w","tail":{"d":"M-6,0 C30,-10 60,-40 50,-90 C46,-112 66,-124 76,-114","whip":[13,8],"fill":"fur","end":[76,-114]},"back":null,"markings":{"stripes":"tabby","belly":true}},"caterpillar":{"group":"insect","a":"a","say":["Caterpillar","pillar"],"colours":{"fur":"#F4F1E6","light":"#F5CF35","dark":"#1D1919","skin":"#1D1919","nose":"#1D1919"},"body":{"w":136,"h":196,"top":0.66,"arms":"stubs","feet":"prolegs"},"head":{"r":62,"sx":1.04,"sy":0.96,"shape":"round","muz":{"none":true,"y":0.4,"rx":0.2,"ry":0.16},"nose":"none","eyes":{"x":0.3,"y":0.04}},"ears":{"a":24,"type":"antennae","s":0.55},"mouth":"mandibles","tail":{"d":"M-6,6 C26,24 60,28 92,12 C104,6 112,-4 116,-14","whip":[34,26],"fill":"fur","end":[116,-14]},"back":null,"markings":{"hoops":true,"rings":true,"darkEars":true}},"chameleon":{"group":"reptile","a":"a","say":["Chameleon","meleon"],"colours":{"fur":"#69B04A","light":"#D9EA8A","dark":"#2E6A2E","skin":"#4E8F3A","nose":"#2A4A22"},"body":{"w":160,"h":168,"top":0.72,"arms":"thin","feet":"claws"},"head":{"r":66,"sx":0.96,"sy":1.0,"shape":"wedge","muz":{"none":true,"y":0.42,"rx":0.3,"ry":0.2},"nose":"small","eyes":{"x":0.46,"y":-0.04,"big":"turret"}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"smile","tail":{"d":"M-6,0 C30,6 66,-4 70,-38 C74,-66 48,-80 34,-66 C22,-54 30,-36 44,-40 C54,-44 52,-56 46,-56","whip":[16,10],"fill":"fur","end":[46,-56]},"back":{"kind":"crest","word":"a chameleon's casque","plate":"#4E9A3C","band":"#2E6A2E"},"markings":{"stripes":"tabby","belly":true}},"cheetah":{"group":"mammal","a":"a","say":["Cheetah","cheetah"],"colours":{"fur":"#E2B35E","light":"#FAF1DE","dark":"#2A211C","skin":"#E3A69A","nose":"#3A2A24"},"body":{"w":168,"h":186,"top":0.7,"arms":"thin","feet":"pads"},"head":{"r":66,"sx":1.04,"sy":0.96,"shape":"round","muz":{"y":0.42,"rx":0.3,"ry":0.24},"nose":"tri","eyes":{"x":0.36,"y":-0.06},"whiskers":true},"ears":{"a":50,"type":"round","s":0.24},"mouth":"w","tail":{"d":"M-6,0 C36,0 66,-20 70,-66 C72,-92 82,-108 94,-110","whip":[15,10],"fill":"fur","end":[94,-110]},"back":null,"markings":{"spots":true,"tears":true,"lowerFace":true,"rings":true,"tailTip":true}},"chicken":{"group":"bird","a":"a","say":["Chicken","chicken"],"colours":{"fur":"#C2662E","light":"#F0C38E","dark":"#7A3A18","skin":"#F2B33A","nose":"#F0A830"},"body":{"w":178,"h":170,"top":0.74,"arms":"wings","feet":"talons"},"head":{"r":60,"sx":0.98,"sy":1.0,"shape":"round","muz":{"none":true,"y":0.3,"rx":0.2,"ry":0.2},"nose":"beak","eyes":{"x":0.36,"y":-0.08}},"ears":{"a":0,"type":"comb","s":0.5},"mouth":"wattle","tail":{"d":"M-8,-14 C10,-40 30,-74 52,-84 C46,-62 48,-46 60,-36 C70,-60 84,-72 98,-72 C84,-50 78,-24 60,-8 C40,8 16,14 -8,14 Z","fill":"dark"},"back":{"kind":"wings","word":"a chicken's wings","plate":"#C2662E","band":"#7A3A18","tip":"#8E4420"},"markings":{"chevrons":true,"belly":true}},"cricket":{"group":"insect","a":"a","say":["Cricket","cricket"],"colours":{"fur":"#6E4C2C","light":"#B98E5C","dark":"#3A2716","skin":"#8E6A44","nose":"#3A2716"},"body":{"w":150,"h":180,"top":0.68,"arms":"legs","feet":"hoppers"},"head":{"r":64,"sx":0.96,"sy":1.04,"shape":"round","muz":{"none":true,"y":0.4,"rx":0.2,"ry":0.16},"nose":"none","eyes":{"x":0.42,"y":-0.12,"big":"compound"}},"ears":{"a":10,"type":"antennae","s":1.3},"mouth":"mandibles","tail":{"none":true},"back":null,"markings":{"segments":true,"lowerFace":true}},"crow":{"group":"bird","a":"a","say":["Crow","crow","Cro"],"colours":{"fur":"#262A36","light":"#6F7DAA","dark":"#121318","skin":"#3A3B44","nose":"#5A5D6C"},"body":{"w":156,"h":168,"top":0.72,"arms":"wings","feet":"talons"},"head":{"r":64,"sx":1.0,"sy":0.98,"shape":"round","muz":{"none":true,"y":0.3,"rx":0.2,"ry":0.2},"nose":"beak","eyes":{"x":0.36,"y":-0.08}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"none","tail":{"d":"M-8,-10 C16,0 36,18 48,40 Q46,58 28,60 Q12,58 -8,14 Z","fill":"dark"},"back":{"kind":"wings","word":"a crow's wings","plate":"#262A36","band":"#6F7DAA","tip":"#121318"},"markings":{"gloss":true}},"dog":{"group":"mammal","a":"a","say":["Dog","dog"],"colours":{"fur":"#D6A45E","light":"#F3E3C6","dark":"#7A4E26","skin":"#8A5A3A","nose":"#231A14"},"body":{"w":182,"h":172,"top":0.78,"arms":"thick","feet":"pads"},"head":{"r":78,"sx":1.04,"sy":0.98,"shape":"round","muz":{"y":0.4,"rx":0.4,"ry":0.3},"nose":"round","eyes":{"x":0.38,"y":-0.06}},"ears":{"a":70,"type":"flop","s":0.5},"mouth":"open","tail":{"d":"M-6,0 C26,-6 50,-30 58,-62","whip":[15,10],"fill":"fur","end":[58,-62]},"back":null,"markings":{"eyePatch":true,"belly":true}},"dolphin":{"group":"mammal","a":"a","say":["Dolphin","dolphin"],"colours":{"fur":"#7F93A8","light":"#E4EAF0","dark":"#4D6074","skin":"#F0B6BF","nose":"#3E4F61"},"body":{"w":162,"h":196,"top":0.64,"arms":"flippers","feet":"fins"},"head":{"r":72,"sx":1.0,"sy":0.94,"shape":"round","muz":{"y":0.44,"rx":0.32,"ry":0.22},"nose":"blowhole","eyes":{"x":0.38,"y":-0.06}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"smile","tail":{"d":"M-6,-14 C24,-18 50,-34 64,-52 C58,-66 56,-78 58,-88 C70,-74 78,-60 80,-50 C92,-44 104,-36 106,-20 C92,-22 80,-26 72,-36 C52,-10 26,8 -6,14 Z","fill":"fur"},"back":null,"markings":{"chest":true}},"elephant":{"group":"mammal","a":"an","say":["Elephant","phant"],"colours":{"fur":"#A3A5AA","light":"#C9CBCF","dark":"#6C6E73","skin":"#D9B8B1","nose":"#4E5055"},"body":{"w":214,"h":186,"top":0.84,"arms":"thick","feet":"toes"},"head":{"r":88,"sx":1.0,"sy":0.98,"shape":"round","muz":{"none":true,"y":0.5,"rx":0.3,"ry":0.3},"nose":"trunk","eyes":{"x":0.34,"y":-0.12}},"ears":{"a":80,"type":"fan","s":0.62},"mouth":"tusks","tail":{"d":"M-6,4 C20,14 40,30 46,60","whip":[8,4],"fill":"fur","tuft":[46,64,-10]},"back":null,"markings":{}},"ferret":{"group":"mammal","a":"a","say":["Ferret","ferret"],"colours":{"fur":"#E6CFA2","light":"#FAF3E4","dark":"#4A3628","skin":"#E8A9A0","nose":"#D98A8C"},"body":{"w":140,"h":190,"top":0.7,"arms":"thin","feet":"small"},"head":{"r":62,"sx":1.02,"sy":0.9,"shape":"wedge","muz":{"y":0.44,"rx":0.26,"ry":0.2},"nose":"tri","eyes":{"x":0.36,"y":-0.06,"big":"dark"},"whiskers":true},"ears":{"a":46,"type":"round","s":0.26},"mouth":"tiny","tail":{"d":"M-6,0 C30,6 56,-6 70,-34 C78,-52 74,-68 66,-76","whip":[20,14],"fill":"dark","end":[66,-76]},"back":null,"markings":{"mask":true,"darkLimbs":true,"lowerFace":true}},"fox":{"group":"mammal","a":"a","say":["Fox","fox"],"colours":{"fur":"#D9692B","light":"#F7EFE4","dark":"#2E211B","skin":"#2E211B","nose":"#1E1612"},"body":{"w":164,"h":176,"top":0.72,"arms":"thin","feet":"pads"},"head":{"r":74,"sx":1.12,"sy":0.9,"shape":"wedge","muz":{"none":true,"y":0.46,"rx":0.26,"ry":0.22},"nose":"round","eyes":{"x":0.36,"y":-0.06}},"ears":{"a":32,"type":"tri","s":0.55},"mouth":"smile","tail":{"d":"M-8,-12 C30,-30 80,-80 116,-70 C140,-62 132,-30 104,-20 C70,-8 30,4 -8,16 Z","fill":"fur","axis":[0,0,128,-50]},"back":null,"markings":{"lowerFace":true,"chest":true,"darkPaws":true,"tailTip":true}},"frog":{"group":"amphibian","a":"a","say":["Frog","frog"],"colours":{"fur":"#5FA64A","light":"#E8EFA6","dark":"#2F6A2A","skin":"#E79A9A","nose":"#2A4F22"},"body":{"w":196,"h":146,"top":0.92,"arms":"thin","feet":"webbed"},"head":{"r":78,"sx":1.26,"sy":0.78,"shape":"round","muz":{"none":true,"y":0.2,"rx":0.3,"ry":0.2},"nose":"nostrils","eyes":{"x":0.46,"y":-0.66,"big":"bulge"}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"grin","tail":{"none":true},"back":null,"markings":{"belly":true,"spots":true}},"goat":{"group":"mammal","a":"a","say":["Goat","goat"],"colours":{"fur":"#A8794E","light":"#F2EADB","dark":"#4E3422","skin":"#E3B3A0","nose":"#5A3E2E"},"body":{"w":176,"h":184,"top":0.74,"arms":"thin","feet":"hooves"},"head":{"r":70,"sx":0.9,"sy":1.08,"shape":"round","muz":{"y":0.48,"rx":0.3,"ry":0.26},"nose":"y","eyes":{"x":0.4,"y":-0.1,"big":"bar"}},"ears":{"a":20,"type":"swept","s":0.6},"mouth":"beard","tail":{"d":"M-6,-4 C6,-14 14,-30 12,-44 C22,-36 24,-16 8,4 Z","fill":"fur"},"back":null,"markings":{"lowerFace":true,"chest":true}},"highlandcow":{"group":"mammal","a":"a","word":"Highland cow","say":["Coo","coo"],"colours":{"fur":"#B8652A","light":"#E3B585","dark":"#7A3C15","skin":"#D99A80","nose":"#4A2E22"},"body":{"w":212,"h":180,"top":0.84,"arms":"thick","feet":"hooves"},"head":{"r":78,"sx":1.1,"sy":0.96,"shape":"round","muz":{"y":0.5,"rx":0.5,"ry":0.3},"nose":"nostrils","eyes":{"x":0.38,"y":-0.06}},"ears":{"a":62,"type":"horns","s":0.62},"mouth":"tiny","tail":{"d":"M-6,4 C20,14 38,30 44,60","whip":[9,5],"fill":"fur","tuft":[44,64,-10]},"back":{"kind":"shag","word":"a Highland cow's shaggy coat","plate":"#C9763A","band":"#8A4A1E"},"markings":{}},"hippo":{"group":"mammal","a":"a","say":["Hippo","hippo"],"colours":{"fur":"#8F8296","light":"#C9AEBF","dark":"#5C5062","skin":"#E8A3AA","nose":"#4A3F50"},"body":{"w":224,"h":178,"top":0.86,"arms":"thick","feet":"toes"},"head":{"r":82,"sx":1.18,"sy":0.9,"shape":"block","muz":{"y":0.42,"rx":0.8,"ry":0.44},"nose":"nostrils","eyes":{"x":0.42,"y":-0.46}},"ears":{"a":46,"type":"round","s":0.14},"mouth":"pegs","tail":{"d":"M-6,2 C12,8 22,18 26,32","whip":[12,7],"fill":"fur","tuft":[26,36,-14]},"back":null,"markings":{"belly":true}},"jellyfish":{"group":"invertebrate","a":"a","say":["Jellyfish","jelly"],"colours":{"fur":"#F2A7CB","light":"#FCDDEB","dark":"#C2639A","skin":"#F7C8DE","nose":"#B65290"},"body":{"w":136,"h":140,"top":0.92,"arms":"none","feet":"streamers"},"head":{"r":82,"sx":1.22,"sy":0.92,"shape":"bell","muz":{"none":true,"y":0.12,"rx":0.2,"ry":0.16},"nose":"none","eyes":{"x":0.32,"y":-0.12}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"smile","tail":{"d":"M-6,0 C14,10 24,-8 40,2 C56,12 64,-8 80,2 C92,10 98,0 104,-6","whip":[9,5],"fill":"light","end":[104,-6]},"back":null,"markings":{"ribbons":true}},"koi":{"group":"fish","a":"a","say":["Koi","koi"],"colours":{"fur":"#F7F2EA","light":"#FFFFFF","dark":"#E0562A","skin":"#F4B8A6","nose":"#C8461F"},"body":{"w":156,"h":184,"top":0.62,"arms":"flippers","feet":"fins"},"head":{"r":64,"sx":0.94,"sy":1.04,"shape":"round","muz":{"none":true,"y":0.5,"rx":0.3,"ry":0.2},"nose":"none","eyes":{"x":0.42,"y":-0.04},"barbels":true},"ears":{"a":40,"type":"none","s":0.2},"mouth":"pout","tail":{"d":"M-6,-12 C20,-14 40,-24 56,-40 C64,-70 84,-90 104,-96 C92,-70 90,-50 96,-30 C108,-20 124,-8 132,8 C108,6 84,4 60,2 C40,8 20,14 -6,14 Z","fill":"fur"},"back":null,"markings":{"blotches":true}},"leopard":{"group":"mammal","a":"a","say":["Leopard","leopard"],"colours":{"fur":"#D9A54E","light":"#F7ECD6","dark":"#2E241D","skin":"#E0A196","nose":"#C27A72"},"body":{"w":182,"h":182,"top":0.76,"arms":"thick","feet":"pads"},"head":{"r":72,"sx":1.08,"sy":0.96,"shape":"round","muz":{"y":0.42,"rx":0.32,"ry":0.26},"nose":"tri","eyes":{"x":0.36,"y":-0.06},"whiskers":true},"ears":{"a":44,"type":"round","s":0.28},"mouth":"w","tail":{"d":"M-6,0 C34,-4 62,-30 58,-80 C56,-104 70,-118 84,-114","whip":[16,11],"fill":"fur","end":[84,-114]},"back":null,"markings":{"rosettes":true,"lowerFace":true,"rings":true}},"lion":{"group":"mammal","a":"a","say":["Lion","lion"],"colours":{"fur":"#D4A25C","light":"#F3E0B8","dark":"#7A4A22","skin":"#C98E72","nose":"#A0594E"},"body":{"w":192,"h":180,"top":0.78,"arms":"thick","feet":"pads"},"head":{"r":76,"sx":1.04,"sy":1.0,"shape":"round","muz":{"y":0.4,"rx":0.38,"ry":0.26},"nose":"tri","eyes":{"x":0.36,"y":-0.06},"whiskers":true},"ears":{"a":48,"type":"round","s":0.26},"mouth":"w","tail":{"d":"M-6,0 C30,-4 56,-24 62,-62","whip":[12,7],"fill":"fur","tuft":[63,-67,15]},"back":{"kind":"ruff","word":"a lion's mane","plate":"#A8622A","band":"#6E3A14"},"markings":{"belly":true}},"mantis":{"group":"insect","a":"a","say":["Mantis","mantis"],"colours":{"fur":"#7DBB4C","light":"#CDE88E","dark":"#3E6E24","skin":"#A8D468","nose":"#3E6E24"},"body":{"w":128,"h":196,"top":0.58,"arms":"raptorial","feet":"legs"},"head":{"r":64,"sx":1.16,"sy":0.86,"shape":"tri","muz":{"none":true,"y":0.4,"rx":0.2,"ry":0.16},"nose":"none","eyes":{"x":0.62,"y":-0.36,"big":"compound"}},"ears":{"a":16,"type":"antennae","s":1.1},"mouth":"mandibles","tail":{"none":true},"back":null,"markings":{"segments":true}},"meerkat":{"group":"mammal","a":"a","say":["Meerkat","meerkat","Meer"],"colours":{"fur":"#BF9A6C","light":"#EBDDC2","dark":"#3A2B20","skin":"#8A6A52","nose":"#2A1E16"},"body":{"w":128,"h":204,"top":0.68,"arms":"thin","feet":"claws"},"head":{"r":58,"sx":0.94,"sy":1.0,"shape":"wedge","muz":{"y":0.48,"rx":0.26,"ry":0.22},"nose":"small","eyes":{"x":0.38,"y":-0.04}},"ears":{"a":70,"type":"semi","s":0.22},"mouth":"tiny","tail":{"d":"M-6,0 C24,-6 40,-30 44,-70 C46,-90 48,-104 52,-116","whip":[12,7],"fill":"fur","tuft":[52,-120,12]},"back":null,"markings":{"patches":true,"darkEars":true,"belly":true}},"monarch":{"word":"monarch butterfly","group":"insect","a":"a","say":["Monarch","monarch"],"colours":{"fur":"#2A2220","light":"#F4EFE6","dark":"#14100F","skin":"#E58A2E","nose":"#14100F"},"body":{"w":124,"h":170,"top":0.6,"arms":"legs","feet":"legs"},"head":{"r":58,"sx":1.0,"sy":0.96,"shape":"round","muz":{"none":true,"y":0.4,"rx":0.2,"ry":0.16},"nose":"none","eyes":{"x":0.4,"y":-0.04,"big":"compound"}},"ears":{"a":22,"type":"clubs","s":0.9},"mouth":"proboscis","tail":{"none":true},"back":{"kind":"butterfly","word":"a monarch's wings","plate":"#EE8A2A","band":"#1A1412","tip":"#FFFFFF","veins":true},"markings":{"dots":true}},"mouse":{"group":"mammal","a":"a","say":["Mouse","mouse"],"colours":{"fur":"#AAA29D","light":"#EFE9E3","dark":"#6B625D","skin":"#F3A9B8","nose":"#E27A92"},"body":{"w":156,"h":150,"top":0.74,"arms":"thin","feet":"small"},"head":{"r":70,"sx":1.0,"sy":0.95,"shape":"round","muz":{"y":0.38,"rx":0.3,"ry":0.24},"nose":"tri","eyes":{"x":0.36,"y":-0.02},"whiskers":true},"ears":{"a":48,"type":"round","s":0.62},"mouth":"buck","tail":{"d":"M-10,0 C40,6 70,-10 62,-48 C56,-78 84,-96 100,-82","string":true,"fill":"skin"},"back":null,"markings":{"belly":true}},"narwhal":{"group":"mammal","a":"a","say":["Narwhal","whal"],"colours":{"fur":"#8E99A6","light":"#E9EDF0","dark":"#4B5563","skin":"#C9CFD6","nose":"#3E4652"},"body":{"w":178,"h":188,"top":0.7,"arms":"flippers","feet":"fins"},"head":{"r":74,"sx":1.04,"sy":0.94,"shape":"round","muz":{"none":true,"y":0.4,"rx":0.3,"ry":0.2},"nose":"blowhole","eyes":{"x":0.4,"y":-0.04}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"spiral","tail":{"d":"M-6,-14 C24,-18 50,-34 64,-52 C58,-66 56,-78 58,-88 C70,-74 78,-60 80,-50 C92,-44 104,-36 106,-20 C92,-22 80,-26 72,-36 C52,-10 26,8 -6,14 Z","fill":"fur"},"back":null,"markings":{"spots":true,"chest":true}},"octopus":{"group":"invertebrate","a":"an","say":["Octopus","topus"],"colours":{"fur":"#DB6A44","light":"#F4A88A","dark":"#9A3620","skin":"#F8D2C0","nose":"#9A3620"},"body":{"w":152,"h":136,"top":0.86,"arms":"tentacles","feet":"tentacles"},"head":{"r":84,"sx":0.96,"sy":1.16,"shape":"round","muz":{"none":true,"y":0.34,"rx":0.3,"ry":0.2},"nose":"none","eyes":{"x":0.34,"y":0.12}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"pout","tail":{"d":"M-6,0 C30,8 62,-8 64,-40 C66,-64 44,-74 36,-58 C30,-46 44,-38 50,-48","whip":[16,10],"fill":"fur","end":[50,-48]},"back":null,"markings":{"spots":true}},"opossum":{"group":"mammal","a":"an","say":["Opossum","opossum"],"colours":{"fur":"#A5A19E","light":"#F4F1EC","dark":"#232123","skin":"#EBAFB6","nose":"#E58E9C"},"body":{"w":172,"h":160,"top":0.76,"arms":"hands","feet":"pads"},"head":{"r":68,"sx":0.92,"sy":0.94,"shape":"wedge","muz":{"y":0.52,"rx":0.24,"ry":0.42},"nose":"small","eyes":{"x":0.36,"y":-0.08},"whiskers":true},"ears":{"a":40,"type":"round","s":0.4},"mouth":"smile","tail":{"d":"M-6,0 C30,8 62,-4 64,-40 C66,-70 40,-82 32,-62 C26,-48 42,-40 50,-52","whip":[14,9],"fill":"skin","end":[50,-52]},"back":null,"markings":{"lightHead":true,"darkEars":true,"darkLimbs":true}},"orca":{"group":"mammal","a":"an","say":["Orca","orca"],"colours":{"fur":"#1F2226","light":"#F6F7F8","dark":"#0F1012","skin":"#E8B0B8","nose":"#0F1012"},"body":{"w":184,"h":196,"top":0.66,"arms":"flippers","feet":"fins"},"head":{"r":76,"sx":1.04,"sy":0.94,"shape":"round","muz":{"none":true,"y":0.42,"rx":0.3,"ry":0.2},"nose":"blowhole","eyes":{"x":0.38,"y":-0.02}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"smile","tail":{"d":"M-6,-14 C24,-18 50,-34 64,-52 C58,-66 56,-78 58,-88 C70,-74 78,-60 80,-50 C92,-44 104,-36 106,-20 C92,-22 80,-26 72,-36 C52,-10 26,8 -6,14 Z","fill":"fur"},"back":{"kind":"fin","word":"an orca's fin","plate":"#1F2226","band":"#4A4F57"},"markings":{"eyeSpots":true,"chest":true}},"otter":{"group":"mammal","a":"an","say":["Otter","otter"],"colours":{"fur":"#7B5233","light":"#DCC099","dark":"#45291A","skin":"#5B3A27","nose":"#2A1A10"},"body":{"w":146,"h":198,"top":0.7,"arms":"thin","feet":"webbed"},"head":{"r":74,"sx":1.18,"sy":0.88,"shape":"round","muz":{"y":0.36,"rx":0.48,"ry":0.3},"nose":"wide","eyes":{"x":0.4,"y":-0.1},"whiskers":true,"pads":true},"ears":{"a":68,"type":"round","s":0.17},"mouth":"open","tail":{"d":"M-6,-18 C50,-16 100,6 132,-10 C140,-14 142,-5 136,1 C102,30 50,24 -6,16 Z","fill":"fur","axis":[0,0,134,-6]},"back":null,"markings":{"chest":true,"lowerFace":true}},"owl":{"group":"bird","a":"an","say":["Owl","owl"],"colours":{"fur":"#8C6A48","light":"#EEE1CA","dark":"#4A3626","skin":"#F2B33D","nose":"#C9A24A"},"body":{"w":184,"h":176,"top":0.86,"arms":"wings","feet":"talons"},"head":{"r":84,"sx":1.1,"sy":0.96,"shape":"round","muz":{"none":true,"y":0.3,"rx":0.2,"ry":0.2},"nose":"beak","eyes":{"x":0.36,"y":-0.04,"big":true}},"ears":{"a":34,"type":"tufts","s":0.42},"mouth":"none","tail":{"d":"M-8,-10 C20,0 40,20 46,40 L30,38 L32,52 L16,44 L10,56 L0,42 L-10,14 Z","fill":"fur"},"back":{"kind":"wings","word":"an owl's wings","plate":"#8C6A48","band":"#4A3626","tip":"#EEE1CA"},"markings":{"disc":true,"belly":true,"chevrons":true}},"panda":{"group":"mammal","a":"a","say":["Panda","panda"],"colours":{"fur":"#F7F4EE","light":"#FFFFFF","dark":"#262626","skin":"#3B3B3B","nose":"#1C1C1C"},"body":{"w":204,"h":176,"top":0.82,"arms":"thick","feet":"pads"},"head":{"r":84,"sx":1.08,"sy":0.98,"shape":"round","muz":{"y":0.4,"rx":0.32,"ry":0.24},"nose":"round","eyes":{"x":0.4,"y":-0.02}},"ears":{"a":44,"type":"round","s":0.38},"mouth":"w","tail":{"d":"@circle 18 -2 19","fill":"light","at":0.44},"back":null,"markings":{"patches":true,"darkEars":true,"darkLimbs":true,"band":true}},"parrot":{"group":"bird","a":"a","say":["Parrot","parrot"],"colours":{"fur":"#D7372F","light":"#F4C63A","dark":"#2D5FB3","skin":"#7C7A80","nose":"#F1EADB"},"body":{"w":160,"h":176,"top":0.72,"arms":"wings","feet":"talons"},"head":{"r":66,"sx":1.0,"sy":1.0,"shape":"round","muz":{"none":true,"y":0.3,"rx":0.2,"ry":0.2},"nose":"hook","eyes":{"x":0.36,"y":-0.1}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"none","tail":{"d":"M-8,-14 C20,-34 50,-80 72,-120 C78,-104 78,-90 72,-76 C84,-90 92,-96 100,-98 C88,-66 60,-24 -8,16 Z","fill":"dark"},"back":{"kind":"wings","word":"a parrot's wings","plate":"#D7372F","band":"#F4C63A","tip":"#2D5FB3"},"markings":{"darkLimbs":true,"facePatch":true}},"peacock":{"group":"bird","a":"a","say":["Peacock","peacock"],"colours":{"fur":"#1E62A8","light":"#4FA6D1","dark":"#123F70","skin":"#9A9086","nose":"#8E847A"},"body":{"w":158,"h":176,"top":0.62,"neck":24,"arms":"wings","feet":"talons"},"head":{"r":56,"sx":0.96,"sy":1.02,"shape":"round","muz":{"none":true,"y":0.3,"rx":0.2,"ry":0.2},"nose":"beak","eyes":{"x":0.36,"y":-0.06}},"ears":{"a":0,"type":"plume","s":0.7},"mouth":"none","tail":{"d":"M-8,-10 C10,-12 26,-8 36,0 C24,10 8,14 -8,12 Z","fill":"dark"},"back":{"kind":"train","word":"a peacock's train","plate":"#2F7D4A","ring":"#D8B23A","eye":"#1C3E86"},"markings":{"facePatch":true}},"penguin":{"group":"bird","a":"a","say":["Penguin","guin"],"colours":{"fur":"#23272F","light":"#F6F6F2","dark":"#111419","skin":"#F2A33A","nose":"#F2A33A"},"body":{"w":168,"h":196,"top":0.7,"arms":"flippers","feet":"paddles"},"head":{"r":72,"sx":1.0,"sy":0.96,"shape":"round","muz":{"none":true,"y":0.28,"rx":0.2,"ry":0.2},"nose":"beak","eyes":{"x":0.33,"y":-0.06}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"none","tail":{"d":"@circle 12 6 12","fill":"fur","at":0.4},"back":null,"markings":{"tux":true}},"pig":{"group":"mammal","a":"a","say":["Pig","pig"],"colours":{"fur":"#F2B8C0","light":"#FAD9DD","dark":"#9C5866","skin":"#E8909E","nose":"#8E4553"},"body":{"w":196,"h":168,"top":0.82,"arms":"thick","feet":"hooves"},"head":{"r":80,"sx":1.08,"sy":0.98,"shape":"round","muz":{"none":true,"y":0.36,"rx":0.3,"ry":0.21},"nose":"snout","eyes":{"x":0.36,"y":-0.12}},"ears":{"a":40,"type":"tri","s":0.38},"mouth":"smile","tail":{"d":"M0,0 C20,-2 40,-4 52,-10 C66,-18 64,-36 52,-34 C40,-32 44,-14 58,-14 C70,-14 76,-24 76,-34","string":true,"fill":"skin"},"back":null,"markings":{"belly":true}},"platypus":{"group":"mammal","a":"a","say":["Platypus","platypus","Platy"],"colours":{"fur":"#7A5134","light":"#C79C74","dark":"#43291A","skin":"#3C3C3E","nose":"#46494E"},"body":{"w":176,"h":162,"top":0.74,"arms":"thin","feet":"webbed"},"head":{"r":66,"sx":1.06,"sy":0.92,"shape":"round","muz":{"none":true,"y":0.42,"rx":0.3,"ry":0.2},"nose":"flatbill","eyes":{"x":0.38,"y":-0.16}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"none","tail":{"d":"M-6,-16 C30,-24 70,-28 96,-16 C110,-10 110,8 96,14 C70,24 30,20 -6,16 Z","fill":"fur"},"back":null,"markings":{"belly":true}},"porcupine":{"group":"mammal","a":"a","say":["Porcupine","cupine"],"colours":{"fur":"#7A5E48","light":"#CDB394","dark":"#3B2C22","skin":"#9C7A62","nose":"#2A1C14"},"body":{"w":172,"h":160,"top":0.76,"arms":"thin","feet":"claws"},"head":{"r":70,"sx":1.0,"sy":0.95,"shape":"round","muz":{"y":0.42,"rx":0.3,"ry":0.26},"nose":"round","eyes":{"x":0.36,"y":-0.04}},"ears":{"a":62,"type":"round","s":0.16},"mouth":"buck","tail":{"d":"M-6,-12 L10,-24 L14,-12 L30,-26 L30,-10 L46,-18 L40,-2 L54,2 L38,10 L44,22 L26,16 L22,30 L10,16 L-6,18 Z","fill":"dark"},"back":{"kind":"quills","word":"a porcupine's quills","quill":"#3B2C22","tip":"#EFE4D2"},"markings":{"belly":true,"lowerFace":true}},"possum":{"group":"mammal","a":"a","say":["Possum","possum"],"colours":{"fur":"#8F8B89","light":"#EDE6DA","dark":"#2C2826","skin":"#E6A9AE","nose":"#D98A92"},"body":{"w":168,"h":172,"top":0.76,"arms":"hands","feet":"claws"},"head":{"r":72,"sx":1.0,"sy":0.94,"shape":"round","muz":{"y":0.42,"rx":0.28,"ry":0.22},"nose":"tri","eyes":{"x":0.38,"y":-0.06,"big":"dark"},"whiskers":true},"ears":{"a":30,"type":"oval","s":0.46},"mouth":"tiny","tail":{"d":"M-8,-14 C30,-34 74,-86 108,-76 C134,-68 128,-36 102,-30 C70,-22 34,2 -8,16 Z","fill":"dark","axis":[0,0,118,-64]},"back":null,"markings":{"chest":true,"lowerFace":true}},"rabbit":{"group":"mammal","a":"a","say":["Bunny","bunny"],"colours":{"fur":"#B39A83","light":"#F2E9DD","dark":"#5F4C3D","skin":"#F2B5BB","nose":"#E48A98"},"body":{"w":164,"h":166,"top":0.72,"arms":"thin","feet":"big"},"head":{"r":72,"sx":0.95,"sy":1.02,"shape":"round","muz":{"y":0.4,"rx":0.34,"ry":0.22},"nose":"y","eyes":{"x":0.38,"y":-0.04},"whiskers":true},"ears":{"a":16,"type":"long","s":0.8},"mouth":"bunny","tail":{"d":"@circle 18 -8 22","fill":"light","at":0.44},"back":null,"markings":{"belly":true}},"raccoon":{"group":"mammal","a":"a","say":["Raccoon","accoon","Racc"],"colours":{"fur":"#8F8E91","light":"#E8E5E0","dark":"#2B2B2E","skin":"#3C3C3F","nose":"#161617"},"body":{"w":180,"h":164,"top":0.78,"arms":"hands","feet":"pads"},"head":{"r":76,"sx":1.06,"sy":0.96,"shape":"wedge","muz":{"y":0.42,"rx":0.3,"ry":0.26},"nose":"round","eyes":{"x":0.38,"y":-0.02},"whiskers":true},"ears":{"a":36,"type":"tri","s":0.46},"mouth":"smirk","tail":{"d":"M-8,-16 C30,-40 70,-110 106,-112 C132,-114 130,-84 110,-60 C80,-24 40,0 -8,18 Z","fill":"fur","axis":[0,0,112,-96]},"back":null,"markings":{"mask":true,"rimEars":true,"rings":true,"darkPaws":true,"belly":true}},"raven":{"group":"bird","a":"a","say":["Raven","raven"],"colours":{"fur":"#2E3140","light":"#7C83A0","dark":"#16171D","skin":"#3A3A42","nose":"#1B1C22"},"body":{"w":168,"h":178,"top":0.74,"arms":"wings","feet":"talons"},"head":{"r":70,"sx":1.0,"sy":0.96,"shape":"round","muz":{"none":true,"y":0.3,"rx":0.2,"ry":0.2},"nose":"bill","eyes":{"x":0.36,"y":-0.1}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"none","tail":{"d":"M-8,-8 C20,4 44,24 62,52 L40,56 L46,66 L24,58 L-8,16 Z","fill":"dark"},"back":{"kind":"wings","word":"a raven's wings","plate":"#2E3140","band":"#7C83A0","tip":"#1B1C22"},"markings":{}},"rhino":{"group":"mammal","a":"a","say":["Rhino","rhino"],"colours":{"fur":"#8F8B87","light":"#BDB8B2","dark":"#57534F","skin":"#C7A7A0","nose":"#3E3B38"},"body":{"w":216,"h":182,"top":0.84,"arms":"thick","feet":"toes"},"head":{"r":76,"sx":1.0,"sy":1.02,"shape":"block","muz":{"y":0.5,"rx":0.46,"ry":0.32},"nose":"horn","eyes":{"x":0.46,"y":-0.12}},"ears":{"a":36,"type":"oval","s":0.36},"mouth":"tiny","tail":{"d":"M-6,4 C18,12 32,26 36,48","whip":[8,4],"fill":"fur","tuft":[36,52,-10]},"back":null,"markings":{"folds":true}},"roadrunner":{"group":"bird","a":"a","say":["Roadrunner","roadrunner"],"colours":{"fur":"#8A6B4C","light":"#EDE4D3","dark":"#3A2C20","skin":"#7D96B3","nose":"#2E2620"},"body":{"w":150,"h":168,"top":0.64,"neck":16,"arms":"wings","feet":"talons"},"head":{"r":60,"sx":0.96,"sy":1.0,"shape":"round","muz":{"none":true,"y":0.3,"rx":0.2,"ry":0.2},"nose":"bill","eyes":{"x":0.36,"y":-0.1}},"ears":{"a":0,"type":"crest","s":0.62},"mouth":"none","tail":{"d":"M-8,-16 C20,-40 50,-100 68,-150 C78,-148 84,-142 84,-132 C70,-90 44,-30 -8,16 Z","fill":"dark"},"back":{"kind":"wings","word":"a roadrunner's wings","plate":"#8A6B4C","band":"#3A2C20","tip":"#EDE4D3"},"markings":{"chevrons":true,"belly":true}},"scorpion":{"group":"arachnid","a":"a","say":["Scorpion","scorpion"],"colours":{"fur":"#C99A4C","light":"#EBD39A","dark":"#6E4A1E","skin":"#A07434","nose":"#6E4A1E"},"body":{"w":160,"h":170,"top":0.7,"arms":"pincers","feet":"legs"},"head":{"r":62,"sx":1.1,"sy":0.86,"shape":"round","muz":{"none":true,"y":0.4,"rx":0.2,"ry":0.16},"nose":"none","eyes":{"x":0.2,"y":-0.2}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"chelicerae","tail":{"d":"M-6,0 C34,-6 86,-60 84,-140 C82,-210 34,-252 -26,-246","whip":[22,15],"fill":"fur","end":[-26,-246],"sting":true},"back":null,"markings":{"segments":true,"rings":true}},"shark":{"group":"fish","a":"a","say":["Shark","shark"],"colours":{"fur":"#7A8A99","light":"#EEF1F3","dark":"#4A5866","skin":"#E6A0A8","nose":"#3A4652"},"body":{"w":170,"h":200,"top":0.62,"arms":"flippers","feet":"fins"},"head":{"r":74,"sx":1.04,"sy":0.92,"shape":"wedge","muz":{"none":true,"y":0.46,"rx":0.3,"ry":0.2},"nose":"nostrils","eyes":{"x":0.44,"y":-0.08,"big":"dark"}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"jaws","tail":{"d":"M-6,-14 C20,-18 40,-30 52,-46 C62,-70 74,-96 92,-112 C86,-80 84,-56 88,-40 C100,-30 112,-14 118,4 C96,0 76,-4 62,-12 C42,4 20,12 -6,14 Z","fill":"fur"},"back":{"kind":"fin","word":"a shark's fin","plate":"#6A7A89","band":"#4A5866"},"markings":{"chest":true,"slits":true}},"sheep":{"group":"mammal","a":"a","say":["Sheep","sheep"],"colours":{"fur":"#F3EDE0","light":"#FBF8F1","dark":"#3B312D","skin":"#4A3E38","nose":"#A2827A"},"body":{"w":196,"h":176,"top":0.82,"arms":"thin","feet":"hooves"},"head":{"r":64,"sx":0.92,"sy":1.06,"shape":"round","muz":{"none":true,"y":0.5,"rx":0.3,"ry":0.22},"nose":"y","eyes":{"x":0.4,"y":-0.08,"big":"bar"}},"ears":{"a":80,"type":"oval","s":0.35},"mouth":"w","tail":{"d":"@circle 14 -6 18","fill":"fur","at":0.44},"back":{"kind":"fleece","word":"a sheep's fleece","plate":"#F3EDE0","band":"#D9CDB8"},"markings":{"bareHead":true,"darkEars":true,"darkLimbs":true,"wool":true}},"snake":{"group":"reptile","a":"a","say":["Snake","snake"],"colours":{"fur":"#6FA33C","light":"#E3DE8C","dark":"#3B6222","skin":"#5E8C32","nose":"#26391A"},"body":{"w":150,"h":178,"top":0.62,"arms":"none","feet":"none"},"head":{"r":62,"sx":1.12,"sy":0.84,"shape":"wedge","muz":{"none":true,"y":0.4,"rx":0.3,"ry":0.2},"nose":"nostrils","eyes":{"x":0.42,"y":-0.12,"big":"slit"}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"tongue","tail":{"d":"M-6,-14 C30,-10 54,30 90,34 C106,36 118,30 126,18 C122,38 106,48 88,48 C50,46 30,24 -6,14 Z","fill":"fur"},"back":null,"markings":{"coils":true}},"spider":{"group":"arachnid","a":"a","say":["Spider","spider"],"colours":{"fur":"#2E2826","light":"#F1ECE4","dark":"#151211","skin":"#C9A27A","nose":"#151211"},"body":{"w":168,"h":150,"top":0.84,"arms":"spider","feet":"legs"},"head":{"r":70,"sx":1.08,"sy":0.96,"shape":"round","muz":{"none":true,"y":0.4,"rx":0.2,"ry":0.16},"nose":"none","eyes":{"x":0.26,"y":0.06,"big":"many"}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"chelicerae","tail":{"none":true},"back":null,"markings":{"chevrons":true}},"squirrel":{"group":"mammal","a":"a","say":["Squirrel","squirrel"],"colours":{"fur":"#B8642E","light":"#F4E7D4","dark":"#6E3416","skin":"#E7A08A","nose":"#3B2216"},"body":{"w":150,"h":160,"top":0.72,"arms":"hands","feet":"small"},"head":{"r":66,"sx":1.0,"sy":0.96,"shape":"round","muz":{"y":0.4,"rx":0.3,"ry":0.22},"nose":"tri","eyes":{"x":0.38,"y":-0.06},"whiskers":true},"ears":{"a":30,"type":"tufts","s":0.48},"mouth":"buck","tail":{"d":"M-10,-10 C20,-30 30,-80 10,-130 C0,-160 30,-196 70,-180 C100,-168 96,-130 72,-124 C90,-110 96,-80 84,-50 C70,-14 30,10 -10,16 Z","fill":"fur"},"back":null,"markings":{"belly":true}},"swan":{"group":"bird","a":"a","say":["Swan","swan"],"colours":{"fur":"#F7F6F2","light":"#FFFFFF","dark":"#A9ADB3","skin":"#2B2B2F","nose":"#EE7F2D"},"body":{"w":194,"h":168,"top":0.56,"neck":28,"arms":"wings","feet":"paddles"},"head":{"r":58,"sx":0.95,"sy":0.92,"shape":"round","muz":{"none":true,"y":0.3,"rx":0.2,"ry":0.2},"nose":"duckbill","eyes":{"x":0.36,"y":-0.08}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"none","tail":{"d":"M-8,-12 C16,-20 36,-34 48,-50 C50,-30 40,-6 -8,14 Z","fill":"fur"},"back":{"kind":"wings","word":"a swan's wings","plate":"#F7F6F2","band":"#A9ADB3","tip":"#FFFFFF"},"markings":{}},"tiger":{"group":"mammal","a":"a","say":["Tiger","tiger"],"colours":{"fur":"#E07A2C","light":"#F7EBD8","dark":"#1F1714","skin":"#E8A598","nose":"#D98A8C"},"body":{"w":190,"h":182,"top":0.76,"arms":"thick","feet":"pads"},"head":{"r":78,"sx":1.1,"sy":0.96,"shape":"round","muz":{"y":0.4,"rx":0.36,"ry":0.26},"nose":"tri","eyes":{"x":0.36,"y":-0.06},"whiskers":true},"ears":{"a":44,"type":"round","s":0.3},"mouth":"w","tail":{"d":"M-6,0 C34,-6 64,-36 62,-80 C60,-100 72,-112 84,-108","whip":[16,11],"fill":"fur","tuft":[88,-107,70]},"back":null,"markings":{"stripes":"tiger","lowerFace":true,"rings":true}},"turkey":{"group":"bird","a":"a","say":["Turkey","turkey"],"colours":{"fur":"#6E4B33","light":"#C9A07A","dark":"#2F2018","skin":"#E6A39C","nose":"#D8B67C"},"body":{"w":192,"h":172,"top":0.76,"neck":14,"arms":"wings","feet":"talons"},"head":{"r":56,"sx":0.92,"sy":1.0,"shape":"round","muz":{"none":true,"y":0.3,"rx":0.2,"ry":0.2},"nose":"beak","eyes":{"x":0.36,"y":-0.1}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"wattle","tail":{"d":"M-8,-8 C8,-10 20,-4 26,6 C14,12 2,14 -8,10 Z","fill":"dark"},"back":{"kind":"fan","word":"a turkey's fan","quill":"#7A5232","band":"#2A1C14","tip":"#E6D3B3"},"markings":{"bareHead":true,"chevrons":true}},"turtle":{"group":"reptile","a":"a","say":["Turtle","turtle"],"colours":{"fur":"#7E9A4E","light":"#E3D58E","dark":"#4C6230","skin":"#5E7A3A","nose":"#2F3A1E"},"body":{"w":186,"h":158,"top":0.78,"arms":"thick","feet":"claws"},"head":{"r":62,"sx":0.95,"sy":0.86,"shape":"round","muz":{"none":true,"y":0.36,"rx":0.3,"ry":0.2},"nose":"nostrils","eyes":{"x":0.36,"y":-0.08}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"smile","tail":{"d":"M-6,-8 C14,-6 30,4 40,14 C28,14 10,12 -6,10 Z","fill":"fur"},"back":{"kind":"scutes","word":"a turtle's shell","plate":"#8A7A42","band":"#4E4422","speck":"#B3A05E"},"markings":{"chest":true}},"whale":{"group":"mammal","a":"a","say":["Whale","whale"],"colours":{"fur":"#5C7C9A","light":"#D9E3EC","dark":"#34506A","skin":"#C9D4DE","nose":"#2C4258"},"body":{"w":224,"h":200,"top":0.74,"arms":"flippers","feet":"fins"},"head":{"r":86,"sx":1.12,"sy":0.9,"shape":"round","muz":{"none":true,"y":0.44,"rx":0.3,"ry":0.2},"nose":"blowhole","eyes":{"x":0.5,"y":0.1}},"ears":{"a":40,"type":"none","s":0.2},"mouth":"grin","tail":{"d":"M-6,-14 C24,-18 50,-34 64,-52 C58,-66 56,-78 58,-88 C70,-74 78,-60 80,-50 C92,-44 104,-36 106,-20 C92,-22 80,-26 72,-36 C52,-10 26,8 -6,14 Z","fill":"fur"},"back":null,"markings":{"grooves":true}},"zebra":{"group":"mammal","a":"a","say":["Zebra","zebra"],"colours":{"fur":"#F4F2EE","light":"#FFFFFF","dark":"#1E1E22","skin":"#3A3A3E","nose":"#8C8C93"},"body":{"w":182,"h":182,"top":0.76,"arms":"thin","feet":"hooves"},"head":{"r":72,"sx":0.9,"sy":1.06,"shape":"round","muz":{"y":0.52,"rx":0.32,"ry":0.28},"nose":"nostrils","eyes":{"x":0.38,"y":-0.12}},"ears":{"a":24,"type":"leaf","s":0.5},"mouth":"tiny","tail":{"d":"M-6,4 C20,14 36,32 42,62","whip":[8,4],"fill":"fur","tuft":[42,66,-10]},"back":{"kind":"mane","word":"a zebra's mane","plate":"#1E1E22","band":"#F4F2EE"},"markings":{"stripes":"bold","darkMuzzle":true}}},"known":{"goat+sheep":"Geep","leopard+lion":"Leopon","lion+tiger":"Liger","panda+armadillo":"Pandillo","pig+porcupine":"Porkypine","sheep+goat":"Geep","tiger+lion":"Tigon"},"presets":[{"id":"bearmouse","label":"Bearmouse","whose":"Ryan's","parts":{"body":"bear","head":"bear","ears":"bear","mouth":"mouse","arms":"bear","feet":"bear","tail":"mouse","back":"none","colours":"bear","markings":"bear"}},{"id":"pandillo","label":"Pandillo","whose":"Chelsea's","parts":{"body":"panda","head":"panda","ears":"panda","mouth":"panda","arms":"panda","feet":"panda","tail":"panda","back":"armadillo","colours":"panda","markings":"panda"}},{"id":"bunnybadger","label":"Bunnybadger","whose":"Inna's","parts":{"body":"rabbit","head":"rabbit","ears":"rabbit","mouth":"badger","arms":"rabbit","feet":"rabbit","tail":"badger","back":"none","colours":"badger","markings":"badger"}},{"id":"otteraccoon","label":"An otteraccoon","whose":"Norah asked for one","parts":{"body":"otter","head":"otter","ears":"raccoon","mouth":"otter","arms":"otter","feet":"otter","tail":"raccoon","back":"none","colours":"otter","markings":"raccoon"}}],"opensOn":"otteraccoon"};
/* chimera:data:end */

  var INK = '#2A211F', IRIS = '#E9B43C';
  // Colours that are no coat's: a comb and a wattle are red on any bird, a
  // horn and a tusk are horn, a tongue is a tongue, a macaw's bare face is
  // bare, and a beaver's teeth are orange whatever colour the beaver is.
  var COMB = '#D7313E', HORN = '#EFE5CF', TONGUE = '#D3384A', BEAKLOW = '#2A2420', BARE = '#FBF7F0', ORANGE = '#E98B2A';
  // An insect's compound eye is the dark of an eye on any coat, and a shark's
  // mouth is a mouth.
  var FACETS = '#26222C', GUM = '#5A2420';
  var SVGNS = 'http://www.w3.org/2000/svg';
  var A = SHELF.animals || {};
  var SLOTS = (SHELF.slots || []).map(function (s) { return s.key; });
  var DEFAULTS = {};
  (SHELF.slots || []).forEach(function (s) { if (s.defaults_to) DEFAULTS[s.key] = s.defaults_to; });
  var seq = 0;

  /* ── Nodes ───────────────────────────────────────────────────────────── */
  function N(t, a, k) { return { t: t, a: a || {}, k: k || [] }; }
  function n(v) { return Math.round(v * 10) / 10; }
  function attrs(base, more) { return Object.assign({}, base, more || {}); }
  function OL(sw) { return { stroke: INK, 'stroke-width': sw || 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }; }
  function ell(cx, cy, rx, ry, a, deg) {
    var o = attrs({ cx: n(cx), cy: n(cy), rx: n(rx), ry: n(ry) }, a);
    if (deg) o.transform = 'rotate(' + n(deg) + ' ' + n(cx) + ' ' + n(cy) + ')';
    return N('ellipse', o);
  }
  function pth(d, a) { return N('path', attrs({ d: d }, a)); }
  function line(x1, y1, x2, y2, a) { return N('line', attrs({ x1: n(x1), y1: n(y1), x2: n(x2), y2: n(y2) }, a)); }
  function rect(x, y, w, h, a) { return N('rect', attrs({ x: n(x), y: n(y), width: n(w), height: n(h) }, a)); }
  function G(a, k) { return N('g', a, k); }
  function clip(id, d) { return N('clipPath', { id: id }, [pth(d)]); }

  function esc(v) { return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function toStr(node) {
    var a = '';
    for (var key in node.a) if (Object.prototype.hasOwnProperty.call(node.a, key)) a += ' ' + key + '="' + esc(node.a[key]) + '"';
    if (!node.k.length) return '<' + node.t + a + '/>';
    return '<' + node.t + a + '>' + node.k.map(toStr).join('') + '</' + node.t + '>';
  }
  function toDom(node, doc) {
    var e = doc.createElementNS(SVGNS, node.t);
    for (var key in node.a) if (Object.prototype.hasOwnProperty.call(node.a, key)) e.setAttribute(key, String(node.a[key]));
    node.k.forEach(function (c) { e.appendChild(toDom(c, doc)); });
    return e;
  }

  function ellD(cx, cy, rx, ry) {
    return 'M' + n(cx - rx) + ',' + n(cy) + ' a' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + n(2 * rx) + ',0 a' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + n(-2 * rx) + ',0 Z';
  }
  /* A tail's shape, with "@circle cx cy r" for a round one. */
  function tailD(d) {
    var m = /^@circle (-?[\d.]+) (-?[\d.]+) ([\d.]+)$/.exec(d);
    return m ? ellD(+m[1], +m[2], +m[3], +m[3]) : d;
  }
  function pear(cx, top, bot, wt, wb) {
    var H = bot - top;
    return 'M' + n(cx) + ',' + n(top) +
      ' C' + n(cx + wt * .55) + ',' + n(top) + ' ' + n(cx + wb * .56) + ',' + n(top + H * .45) + ' ' + n(cx + wb * .5) + ',' + n(top + H * .78) +
      ' C' + n(cx + wb * .47) + ',' + n(bot) + ' ' + n(cx + wb * .25) + ',' + n(bot) + ' ' + n(cx) + ',' + n(bot) +
      ' C' + n(cx - wb * .25) + ',' + n(bot) + ' ' + n(cx - wb * .47) + ',' + n(bot) + ' ' + n(cx - wb * .5) + ',' + n(top + H * .78) +
      ' C' + n(cx - wb * .56) + ',' + n(top + H * .45) + ' ' + n(cx - wt * .55) + ',' + n(top) + ' ' + n(cx) + ',' + n(top) + ' Z';
  }
  function wedge(hx, hy, rx, ry) {
    return 'M' + n(hx - rx) + ',' + n(hy - ry * .1) +
      ' C' + n(hx - rx) + ',' + n(hy - ry * 1.12) + ' ' + n(hx + rx) + ',' + n(hy - ry * 1.12) + ' ' + n(hx + rx) + ',' + n(hy - ry * .1) +
      ' C' + n(hx + rx) + ',' + n(hy + ry * .5) + ' ' + n(hx + rx * .35) + ',' + n(hy + ry * 1.05) + ' ' + n(hx) + ',' + n(hy + ry * 1.05) +
      ' C' + n(hx - rx * .35) + ',' + n(hy + ry * 1.05) + ' ' + n(hx - rx) + ',' + n(hy + ry * .5) + ' ' + n(hx - rx) + ',' + n(hy - ry * .1) + ' Z';
  }

  /* A blunt, boxy head: flat on top, nearly straight sides, a broad muzzle. */
  function block(hx, hy, rx, ry) {
    return 'M' + n(hx - rx * .62) + ',' + n(hy - ry * .98) +
      ' Q' + n(hx) + ',' + n(hy - ry * 1.08) + ' ' + n(hx + rx * .62) + ',' + n(hy - ry * .98) +
      ' C' + n(hx + rx * .94) + ',' + n(hy - ry * .96) + ' ' + n(hx + rx) + ',' + n(hy - ry * .7) + ' ' + n(hx + rx) + ',' + n(hy - ry * .36) +
      ' L' + n(hx + rx * 1.02) + ',' + n(hy + ry * .55) +
      ' C' + n(hx + rx * 1.02) + ',' + n(hy + ry * .98) + ' ' + n(hx + rx * .8) + ',' + n(hy + ry * 1.04) + ' ' + n(hx + rx * .48) + ',' + n(hy + ry * 1.04) +
      ' L' + n(hx - rx * .48) + ',' + n(hy + ry * 1.04) +
      ' C' + n(hx - rx * .8) + ',' + n(hy + ry * 1.04) + ' ' + n(hx - rx * 1.02) + ',' + n(hy + ry * .98) + ' ' + n(hx - rx * 1.02) + ',' + n(hy + ry * .55) +
      ' L' + n(hx - rx) + ',' + n(hy - ry * .36) +
      ' C' + n(hx - rx) + ',' + n(hy - ry * .7) + ' ' + n(hx - rx * .94) + ',' + n(hy - ry * .96) + ' ' + n(hx - rx * .62) + ',' + n(hy - ry * .98) + ' Z';
  }
  /* A mantis's head: a triangle, wide across the top where its eyes are and
     coming down to a point at the chin, every corner rounded. */
  function tri(hx, hy, rx, ry) {
    return 'M' + n(hx - rx) + ',' + n(hy - ry * .5) +
      ' C' + n(hx - rx) + ',' + n(hy - ry * 1.06) + ' ' + n(hx + rx) + ',' + n(hy - ry * 1.06) + ' ' + n(hx + rx) + ',' + n(hy - ry * .5) +
      ' C' + n(hx + rx) + ',' + n(hy - ry * .16) + ' ' + n(hx + rx * .22) + ',' + n(hy + ry * .92) + ' ' + n(hx) + ',' + n(hy + ry * 1.02) +
      ' C' + n(hx - rx * .22) + ',' + n(hy + ry * .92) + ' ' + n(hx - rx) + ',' + n(hy - ry * .16) + ' ' + n(hx - rx) + ',' + n(hy - ry * .5) + ' Z';
  }
  /* A leg drawn as a line with an outline, through its joints. */
  function jointed(out, pts, tw, fill) {
    var d = 'M' + pts.map(function (q) { return n(q[0]) + ',' + n(q[1]); }).join(' L');
    out.push(pth(d, { fill: 'none', stroke: INK, 'stroke-width': n(tw + 6), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    out.push(pth(d, { fill: 'none', stroke: fill, 'stroke-width': n(tw), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  }
  /* How far out from the middle a body's side is, a fraction of the way down it. */
  function sideAt(w, wTop, f) { return f < .78 ? wTop * .5 + (w * .5 - wTop * .5) * f / .78 : w * .5; }
  /* A jellyfish's bell: a dome with its rim in scallops. */
  function bell(hx, hy, rx, ry) {
    var yr = hy + ry * .45, d = 'M' + n(hx - rx) + ',' + n(yr) +
      ' C' + n(hx - rx) + ',' + n(hy - ry * 1.3) + ' ' + n(hx + rx) + ',' + n(hy - ry * 1.3) + ' ' + n(hx + rx) + ',' + n(yr);
    for (var i = 0; i < 6; i++) {
      var x0 = hx + rx - 2 * rx * i / 6, x1 = hx + rx - 2 * rx * (i + 1) / 6;
      d += ' Q' + n((x0 + x1) / 2) + ',' + n(yr + ry * .24) + ' ' + n(x1) + ',' + n(yr);
    }
    return d + ' Z';
  }
  /* A point on a cubic curve, for things set along a tentacle. */
  function bez(a, b, c, d, t) {
    var u = 1 - t;
    return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
      u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]];
  }
  function lum(hex) {
    var v = parseInt(String(hex).slice(1), 16);
    return (.2126 * (v >> 16 & 255) + .7152 * (v >> 8 & 255) + .0722 * (v & 255)) / 255;
  }
  /* Lines drawn on a coat: the dark colour, or the light one on a coat that
     is the dark colour or too dark to show it, so a raven's wings and a
     macaw's blue ones still have feathers. */
  function lineOn(fill, C) { return fill === C.dark || lum(fill) < .25 ? C.light : C.dark; }
  /* A lock of hair hanging out from (x, y), to one side. */
  function lock(x, y, side, L, P) {
    return [pth('M' + n(x - side * 8) + ',' + n(y - 10) + ' Q' + n(x + side * L * .7) + ',' + n(y - 8) + ' ' + n(x + side * L) + ',' + n(y + L * .75) +
      ' Q' + n(x + side * L * .35) + ',' + n(y + L * .32) + ' ' + n(x - side * 8) + ',' + n(y + 10) + ' Z', attrs({ fill: P.plate }, OL(2.5))),
      pth('M' + n(x + side * L * .15) + ',' + n(y - 2) + ' Q' + n(x + side * L * .55) + ',' + n(y + 2) + ' ' + n(x + side * L * .78) + ',' + n(y + L * .5),
        { fill: 'none', stroke: P.band, 'stroke-width': 2.5, 'stroke-linecap': 'round' })];
  }

  var SPECKS = [[-.8, -.2], [-.6, -.6], [-.45, .1], [-.25, -.75], [-.1, -.35], [.15, -.82], [.3, -.42], [.5, -.7], [.62, 0], [.8, -.32], [-.7, .42], [.72, .45]];
  var SPOTS = [[-.62, .22, 1], [-.3, .4, .8], [.36, .28, 1.2], [.6, .52, .9], [-.52, .66, 1.1], [.42, .74, .8], [-.12, .16, .7], [.08, .6, 1]];
  var HEADSPOTS = [[-.5, -.55, 1], [.35, -.68, .8], [-.08, -.82, .7], [.62, -.3, .9], [-.7, -.18, .7]];

  /* ── The parts ───────────────────────────────────────────────────────── */
  /* A back has two halves: what stands behind the body and head (a shell's
     dome, a fan of quills, a mane along the top of the head), and what sits on
     top of the head (a shell's cap, a crest of quills, a forelock). Each keeps
     its own colours, so an armadillo's plates are the armadillo's on any body. */
  function backBehind(out, id, P, cx, yt, h, w, hx, hy, rx, ry, wTop) {
    if (P.kind === 'shell' || P.kind === 'scutes') {
      // A tortoise's shell stands further out round its body than an
      // armadillo's plates do, so the plates show.
      var big = P.kind === 'scutes';
      var dcy = yt + h * (big ? .36 : .3), drx = w * (big ? .68 : .6), dry = h * (big ? .6 : .5), d = ellD(cx, dcy, drx, dry), cid = id('sh'), inside = [];
      out.push(clip(cid, d), pth(d, { fill: P.plate }));
      if (P.kind === 'shell') {
        for (var i = -3; i <= 3; i++) {
          var x0 = cx + i * drx * .27;
          inside.push(pth('M' + n(x0) + ',' + n(dcy - dry - 6) + ' Q' + n(x0 + i * drx * .07) + ',' + n(dcy) + ' ' + n(x0) + ',' + n(dcy + dry + 6),
            { fill: 'none', stroke: P.band, 'stroke-width': 4 }));
        }
        SPECKS.forEach(function (q) { inside.push(ell(cx + q[0] * drx, dcy + q[1] * dry, 4, 3, { fill: P.speck })); });
      } else {
        // A tortoise's scutes: a hexagon in the middle, a ring round it, and
        // seams out to the edge, each plate with a paler middle.
        var hcy = dcy - dry * .3, hr = dry * .34, ring = [], inner = [];
        for (var j = 0; j < 6; j++) {
          var ang = Math.PI / 6 + j * Math.PI / 3;
          inner.push([cx + Math.cos(ang) * hr, hcy + Math.sin(ang) * hr * .8]);
          ring.push([cx + Math.cos(ang) * hr * 2.1, hcy + Math.sin(ang) * hr * 1.7]);
        }
        var poly = function (pts) { return 'M' + pts.map(function (q) { return n(q[0]) + ',' + n(q[1]); }).join(' L') + ' Z'; };
        inside.push(ell(cx, hcy, hr * .45, hr * .36, { fill: P.speck }));
        for (var k2 = 0; k2 < 6; k2++) {
          var a2 = Math.PI / 6 + (k2 + .5) * Math.PI / 3;
          inside.push(ell(cx + Math.cos(a2) * hr * 1.5, hcy + Math.sin(a2) * hr * 1.25, hr * .32, hr * .26, { fill: P.speck }));
        }
        inside.push(pth(poly(inner), { fill: 'none', stroke: P.band, 'stroke-width': 4, 'stroke-linejoin': 'round' }));
        inside.push(pth(poly(ring), { fill: 'none', stroke: P.band, 'stroke-width': 4, 'stroke-linejoin': 'round' }));
        for (var m = 0; m < 6; m++) {
          inside.push(line(inner[m][0], inner[m][1], ring[m][0], ring[m][1], { stroke: P.band, 'stroke-width': 4 }));
          inside.push(line(ring[m][0], ring[m][1], cx + (ring[m][0] - cx) * 2.2, hcy + (ring[m][1] - hcy) * 2.2, { stroke: P.band, 'stroke-width': 4 }));
        }
      }
      out.push(G({ 'clip-path': 'url(#' + cid + ')' }, inside), pth(d, attrs({ fill: 'none' }, OL())));
    } else if (P.kind === 'quills') {
      // A fan of quills behind the body and head, each dark with a pale tip.
      var qcx = cx, qcy = yt + h * .32, R0 = w * .3, R1 = w * .76;
      for (var q = 0; q < 27; q++) {
        var t = q / 26, a3 = Math.PI * (.9 + t * 1.2), len = R1 * (.86 + .14 * ((q * 7) % 5) / 4);
        var spread = .055;
        var b1 = [qcx + Math.cos(a3 - spread) * R0, qcy + Math.sin(a3 - spread) * R0];
        var b2 = [qcx + Math.cos(a3 + spread) * R0, qcy + Math.sin(a3 + spread) * R0];
        var tp = [qcx + Math.cos(a3) * len, qcy + Math.sin(a3) * len];
        var c1 = [b1[0] + (tp[0] - b1[0]) * .68, b1[1] + (tp[1] - b1[1]) * .68];
        var c2 = [b2[0] + (tp[0] - b2[0]) * .68, b2[1] + (tp[1] - b2[1]) * .68];
        out.push(pth('M' + n(b1[0]) + ',' + n(b1[1]) + ' L' + n(tp[0]) + ',' + n(tp[1]) + ' L' + n(b2[0]) + ',' + n(b2[1]) + ' Z',
          { fill: P.quill, stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round' }));
        out.push(pth('M' + n(c1[0]) + ',' + n(c1[1]) + ' L' + n(tp[0]) + ',' + n(tp[1]) + ' L' + n(c2[0]) + ',' + n(c2[1]) + ' Z', { fill: P.tip }));
      }
    } else if (P.kind === 'mane') {
      // A mane along the top of the head, behind it, in tufts of its two colours.
      for (var u = 0; u < 9; u++) {
        var a4 = Math.PI * (1.18 + u * .08), bx = hx + Math.cos(a4) * rx * .86, by = hy + Math.sin(a4) * ry * .86;
        var ox = Math.cos(a4), oy = Math.sin(a4), L = ry * .38;
        out.push(pth('M' + n(bx - oy * ry * .1) + ',' + n(by + ox * ry * .1) + ' L' + n(bx + ox * L) + ',' + n(by + oy * L) +
          ' L' + n(bx + oy * ry * .1) + ',' + n(by - ox * ry * .1) + ' Z',
          attrs({ fill: u % 2 ? P.band : P.plate }, OL(2.5))));
      }
    } else if (P.kind === 'fan') {
      // A turkey's fan: feathers spread in half a wheel behind, scalloped at
      // the edge, a dark band across them and a pale rim.
      var fcx = cx, fcy = yt + h * .55, FR = Math.min(w * .92, 180), nF = 11, a0 = Math.PI * 1.04, a1 = Math.PI * 1.96, fp = [];
      for (var f = 0; f <= nF; f++) { var af = a0 + (a1 - a0) * f / nF; fp.push([fcx + Math.cos(af) * FR, fcy + Math.sin(af) * FR]); }
      var fd = 'M' + n(fcx) + ',' + n(fcy) + ' L' + n(fp[0][0]) + ',' + n(fp[0][1]);
      for (var f2 = 0; f2 < nF; f2++) {
        var am = a0 + (a1 - a0) * (f2 + .5) / nF;
        fd += ' Q' + n(fcx + Math.cos(am) * FR * 1.12) + ',' + n(fcy + Math.sin(am) * FR * 1.12) + ' ' + n(fp[f2 + 1][0]) + ',' + n(fp[f2 + 1][1]);
      }
      fd += ' Z';
      var fid = id('fn'), fin = [];
      out.push(clip(fid, fd), pth(fd, { fill: P.quill }));
      fin.push(ell(fcx, fcy, FR * .8, FR * .8, { fill: 'none', stroke: P.band, 'stroke-width': n(FR * .1) }));
      fin.push(ell(fcx, fcy, FR * 1.02, FR * 1.02, { fill: 'none', stroke: P.tip, 'stroke-width': n(FR * .2) }));
      for (var f3 = 1; f3 < nF; f3++) fin.push(line(fcx, fcy, fcx + (fp[f3][0] - fcx) * 1.2, fcy + (fp[f3][1] - fcy) * 1.2, { stroke: P.band, 'stroke-width': 2.5 }));
      out.push(G({ 'clip-path': 'url(#' + fid + ')' }, fin), pth(fd, attrs({ fill: 'none' }, OL())));
    } else if (P.kind === 'train') {
      // A peacock's train: a great fan of long feathers behind, each ending
      // in its eye.
      var tcx = cx, tcy = yt + h * .62, TR = Math.min(w * 1.2, 190), tid = id('tr'), tin = [];
      var td = 'M' + n(tcx) + ',' + n(tcy) + ' L' + n(tcx - TR) + ',' + n(tcy + TR * .05) +
        ' A' + n(TR) + ',' + n(TR * .95) + ' 0 0,1 ' + n(tcx + TR) + ',' + n(tcy + TR * .05) + ' Z';
      out.push(clip(tid, td), pth(td, { fill: P.plate }));
      for (var s = 0; s < 17; s++) {
        var as = Math.PI * (1.02 + s * .06);
        tin.push(line(tcx, tcy, tcx + Math.cos(as) * TR * 1.1, tcy + Math.sin(as) * TR * 1.05, { stroke: P.eye, 'stroke-width': 1.5 }));
      }
      var es = TR / 180;
      [[.48, 5], [.72, 7], [.94, 9]].forEach(function (row) {
        for (var e = 0; e < row[1]; e++) {
          var ae = Math.PI * (1.1 + .8 * (e + .5) / row[1]), ex = tcx + Math.cos(ae) * TR * row[0], ey = tcy + Math.sin(ae) * TR * .95 * row[0];
          var deg = ae * 180 / Math.PI + 90;
          tin.push(ell(ex, ey, 10 * es, 14 * es, attrs({ fill: P.ring }, OL(1.5)), deg));
          tin.push(ell(ex, ey + 1.5 * es, 5.5 * es, 8 * es, { fill: P.eye }, deg));
        }
      });
      out.push(G({ 'clip-path': 'url(#' + tid + ')' }, tin), pth(td, attrs({ fill: 'none' }, OL())));
    } else if (P.kind === 'shag') {
      // A Highland cow's coat: long locks hanging out round the body and the
      // sides of the head, behind them.
      var hwAt = function (f4) { return f4 < .78 ? wTop * .5 + (w * .5 - wTop * .5) * f4 / .78 : w * .5; };
      [-1, 1].forEach(function (side) {
        for (var s2 = 0; s2 < 6; s2++) {
          var f5 = .14 + s2 * .13;
          Array.prototype.push.apply(out, lock(cx + side * hwAt(f5) * .92, yt + h * f5, side, w * .11, P));
        }
        for (var s3 = 0; s3 < 3; s3++) Array.prototype.push.apply(out, lock(hx + side * rx * .84, hy + ry * (-.15 + s3 * .3), side, rx * .32, P));
      });
    } else if (P.kind === 'wings') {
      // A bird's wings, spread, on any back: rising from behind the
      // shoulders, in the bird's own colours, the flight feathers along the
      // trailing edge. Whatever arms the body has stay its own.
      [-1, 1].forEach(function (side) {
        var S = Math.min(w * .95, 188), Rx = cx + side * wTop * .22, Ry = yt + h * .3;
        var Tx = cx + side * S, Ty = yt - h * .22, Bx = cx + side * S * .42, By = yt + h * .58;
        var dx = Bx - Tx, dy = By - Ty, dl = Math.sqrt(dx * dx + dy * dy), nx = dy * side / dl, ny = -dx * side / dl;
        var wd = 'M' + n(Rx) + ',' + n(Ry) + ' C' + n(Rx + side * S * .1) + ',' + n(Ry - h * .62) + ' ' + n(Tx - side * S * .34) + ',' + n(Ty - h * .22) + ' ' + n(Tx) + ',' + n(Ty);
        var edge = 'M' + n(Tx) + ',' + n(Ty), tips = [];
        for (var i = 1; i <= 5; i++) {
          var qx = Tx + dx * (i - .5) / 5 + nx * dl * .11, qy = Ty + dy * (i - .5) / 5 + ny * dl * .11, px = Tx + dx * i / 5, py = Ty + dy * i / 5;
          var seg = ' Q' + n(qx) + ',' + n(qy) + ' ' + n(px) + ',' + n(py);
          wd += seg; edge += seg; tips.push([px, py]);
        }
        wd += ' Q' + n(cx + side * S * .2) + ',' + n(By - h * .04) + ' ' + n(Rx) + ',' + n(Ry) + ' Z';
        var wid = id('wg'), win = [];
        out.push(clip(wid, wd), pth(wd, { fill: P.plate }));
        win.push(pth(edge, { fill: 'none', stroke: P.tip, 'stroke-width': n(dl * .34), 'stroke-linejoin': 'round' }));
        win.push(pth('M' + n(Rx + side * S * .12) + ',' + n(Ry - h * .2) + ' Q' + n(cx + side * S * .55) + ',' + n(Ty - h * .02) + ' ' + n(Tx - side * S * .14) + ',' + n(Ty + h * .12),
          { fill: 'none', stroke: P.band, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
        tips.slice(0, 4).forEach(function (q) {
          win.push(line(Rx + side * S * .14, Ry - h * .06, q[0], q[1], { stroke: P.band, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
        });
        out.push(G({ 'clip-path': 'url(#' + wid + ')' }, win), pth(wd, attrs({ fill: 'none' }, OL())));
      });
    } else if (P.kind === 'crest') {
      // A chameleon's crest: a saw-toothed ridge standing up round the
      // shoulders, behind them.
      var cpts = [], ccx = cx, ccy = yt + h * .5;
      for (var c = 0; c <= 16; c++) {
        var ac = Math.PI * (1.1 + .8 * c / 16), rr = c % 2 ? 1.16 : 1;
        cpts.push(n(ccx + Math.cos(ac) * wTop * .56 * rr) + ',' + n(ccy + Math.sin(ac) * h * .6 * rr));
      }
      out.push(pth('M' + n(ccx) + ',' + n(ccy) + ' L' + cpts.join(' L') + ' Z', attrs({ fill: P.plate }, OL(2.5))));
    } else if (P.kind === 'ruff') {
      // A lion's mane: a great ruff of hair all the way round the head,
      // behind it, scalloped at its edge, its strands in the darker colour.
      var mcy = hy + ry * .06, mrx = rx * 1.42, mry = ry * 1.36, nT = 16, mv = [], md;
      for (var v = 0; v <= nT; v++) {
        var av = Math.PI * 2 * v / nT - Math.PI / 2;
        mv.push([hx + Math.cos(av) * mrx * .86, mcy + Math.sin(av) * mry * .86]);
      }
      md = 'M' + n(mv[0][0]) + ',' + n(mv[0][1]);
      for (var v2 = 0; v2 < nT; v2++) {
        var at2 = Math.PI * 2 * (v2 + .5) / nT - Math.PI / 2, reach = v2 % 2 ? 1.1 : 1.2;
        md += ' Q' + n(hx + Math.cos(at2) * mrx * reach) + ',' + n(mcy + Math.sin(at2) * mry * reach) + ' ' + n(mv[v2 + 1][0]) + ',' + n(mv[v2 + 1][1]);
      }
      var rid = id('rf'), rin = [];
      out.push(clip(rid, md + ' Z'), pth(md + ' Z', { fill: P.plate }));
      for (var v3 = 0; v3 < nT * 2; v3++) {
        var as2 = Math.PI * 2 * (v3 + .25) / (nT * 2) - Math.PI / 2;
        rin.push(line(hx + Math.cos(as2) * mrx * .7, mcy + Math.sin(as2) * mry * .7, hx + Math.cos(as2) * mrx * .98, mcy + Math.sin(as2) * mry * .98,
          { stroke: P.band, 'stroke-width': 3, 'stroke-linecap': 'round' }));
      }
      out.push(G({ 'clip-path': 'url(#' + rid + ')' }, rin), pth(md + ' Z', attrs({ fill: 'none' }, OL())));
    } else if (P.kind === 'humps') {
      // A camel's two humps, standing up behind the shoulders either side of
      // the head, each with a shaggy crown of the darker colour.
      [-1, 1].forEach(function (side) {
        // Each a round dome, its lower half behind the body, and its crown a
        // crescent of shaggier hair.
        var bx = cx + side * Math.max(wTop * .42, rx * 1.05), hw = Math.max(wTop * .3, 36), by = yt - h * .06, hh = h * .3, cr = [], ci = [];
        out.push(ell(bx, by, hw, hh, attrs({ fill: P.plate }, OL())));
        for (var z = 0; z <= 12; z++) {
          var az = Math.PI * (1.16 + .68 * z / 12), rz = z % 2 ? 1.1 : .98;
          cr.push(n(bx + Math.cos(az) * hw * rz) + ',' + n(by + Math.sin(az) * hh * rz));
          ci.unshift(n(bx + Math.cos(az) * hw * .76) + ',' + n(by + Math.sin(az) * hh * .74));
        }
        out.push(pth('M' + cr.join(' L') + ' L' + ci.join(' L') + ' Z', attrs({ fill: P.band }, OL(2.5))));
      });
    } else if (P.kind === 'membrane') {
      // A bat's wings, spread: skin stretched between long fingers out from
      // the wrist, the trailing edge in scallops between the fingertips, and
      // the thumb's claw at the wrist. Whatever arms the body has stay its own.
      [-1, 1].forEach(function (side) {
        var S = Math.min(w * .98, 190), Rx = cx + side * wTop * .3, Ry = yt + h * .22, Wx = cx + side * S * .5, Wy = yt - h * .5;
        var tips = [[cx + side * S, yt - h * .3], [cx + side * S * .98, yt + h * .1], [cx + side * S * .8, yt + h * .42], [cx + side * S * .56, yt + h * .6]];
        var Bx = cx + side * w * .4, By = yt + h * .66;
        var md2 = 'M' + n(Rx) + ',' + n(Ry) + ' Q' + n(cx + side * S * .26) + ',' + n(Wy - h * .04) + ' ' + n(Wx) + ',' + n(Wy) + ' L' + n(tips[0][0]) + ',' + n(tips[0][1]);
        var pts = tips.concat([[Bx, By]]);
        for (var f6 = 1; f6 < pts.length; f6++) {
          var mx = (pts[f6 - 1][0] + pts[f6][0]) / 2, my2 = (pts[f6 - 1][1] + pts[f6][1]) / 2;
          md2 += ' Q' + n(mx + (Wx - mx) * .3) + ',' + n(my2 + (Wy - my2) * .3) + ' ' + n(pts[f6][0]) + ',' + n(pts[f6][1]);
        }
        md2 += ' Z';
        out.push(pth(md2, attrs({ fill: P.plate }, OL())));
        tips.forEach(function (q) { out.push(line(Wx, Wy, q[0], q[1], { stroke: P.band, 'stroke-width': 3, 'stroke-linecap': 'round' })); });
        out.push(pth('M' + n(Wx) + ',' + n(Wy) + ' Q' + n(Wx + side * 4) + ',' + n(Wy - 14) + ' ' + n(Wx - side * 6) + ',' + n(Wy - 16),
          { fill: 'none', stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' }));
      });
    } else if (P.kind === 'butterfly') {
      // A butterfly's four wings, spread behind it: the hind pair first and
      // the fore pair over them, each edged in the darker colour with pale
      // spots along the edge, and a monarch's veins where it has them.
      var S2 = Math.min(Math.max(w * 1.25, 150), 185);
      [-1, 1].forEach(function (side) {
        var X = function (f) { return cx + side * S2 * f; }, Y = function (f) { return yt + h * f; };
        var hind = [[X(.08), Y(.42)], [X(.78), Y(.3)], [X(.66), Y(.9)], [X(.12), Y(.72)]];
        var fore = [[X(.06), Y(.18)], [X(1), Y(-.56)], [X(.9), Y(.2)], [X(.1), Y(.42)]];
        [hind, fore].forEach(function (q, wi) {
          var bulge = wi ? [[X(.5), Y(-.42)], [X(1.04), Y(-.14)], [X(.5), Y(.42)]] : [[X(.5), Y(.18)], [X(.84), Y(.66)], [X(.36), Y(.92)]];
          var d = 'M' + n(q[0][0]) + ',' + n(q[0][1]);
          for (var e = 0; e < 3; e++) d += ' Q' + n(bulge[e][0]) + ',' + n(bulge[e][1]) + ' ' + n(q[e + 1][0]) + ',' + n(q[e + 1][1]);
          d += ' Z';
          var bid = id('bf'), bin = [];
          out.push(clip(bid, d), pth(d, { fill: P.plate }));
          // The edge band: the outline of the wing, drawn thick, so only its
          // inner half shows inside the clip.
          bin.push(pth(d, { fill: 'none', stroke: P.band, 'stroke-width': n(S2 * .16), 'stroke-linejoin': 'round' }));
          if (P.veins) [.25, .5, .75, 1].forEach(function (t) {
            var tx = q[1][0] + (q[2][0] - q[1][0]) * t, ty = q[1][1] + (q[2][1] - q[1][1]) * t;
            bin.push(pth('M' + n(q[0][0]) + ',' + n(q[0][1]) + ' Q' + n((q[0][0] + tx) / 2 + side * 6) + ',' + n((q[0][1] + ty) / 2 - 6) + ' ' + n(tx) + ',' + n(ty),
              { fill: 'none', stroke: P.band, 'stroke-width': 3, 'stroke-linecap': 'round' }));
          });
          // Spots along the edge, a few to each curve of it.
          for (var e2 = 0; e2 < 3; e2++) {
            var a0 = q[e2], c0 = bulge[e2], b0 = q[e2 + 1];
            if (wi && e2 === 2) continue;
            [.3, .55, .8].forEach(function (t) {
              var u = 1 - t, sx = u * u * a0[0] + 2 * u * t * c0[0] + t * t * b0[0], sy = u * u * a0[1] + 2 * u * t * c0[1] + t * t * b0[1];
              var mx = (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4, my = (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4;
              bin.push(ell(sx + (mx - sx) * .09, sy + (my - sy) * .09, S2 * .02, S2 * .02, { fill: P.tip }));
            });
          }
          out.push(G({ 'clip-path': 'url(#' + bid + ')' }, bin), pth(d, attrs({ fill: 'none' }, OL())));
        });
      });
    } else if (P.kind === 'fin') {
      // A dorsal fin, up from the back behind one shoulder, its trailing edge
      // curved in, the line of its leading edge in the darker colour.
      var f0 = [cx + w * .3, yt + h * .18], f1 = [cx + w * .58, yt + h * .1], ft = [cx + w * .68, yt - h * .5];
      var fdd = 'M' + n(f0[0]) + ',' + n(f0[1]) + ' Q' + n(cx + w * .4) + ',' + n(yt - h * .2) + ' ' + n(ft[0]) + ',' + n(ft[1]) +
        ' Q' + n(cx + w * .56) + ',' + n(yt - h * .12) + ' ' + n(f1[0]) + ',' + n(f1[1]) + ' Z';
      out.push(pth(fdd, attrs({ fill: P.plate }, OL())));
      out.push(pth('M' + n(f0[0] + w * .05) + ',' + n(f0[1] - h * .06) + ' Q' + n(cx + w * .43) + ',' + n(yt - h * .16) + ' ' + n(ft[0] - w * .03) + ',' + n(ft[1] + h * .1),
        { fill: 'none', stroke: P.band, 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
    } else if (P.kind === 'fleece') {
      // A sheep's fleece: a cloud of wool round the body, behind it, in
      // rounded curls, and curls of the darker colour in it.
      var ocx = cx, ocy = yt + h * .52, orx = Math.max(w * .6, wTop * .7), ory = h * .6, nO = 16, ov = [], od;
      for (var o = 0; o <= nO; o++) { var ao = Math.PI * 2 * o / nO; ov.push([ocx + Math.cos(ao) * orx, ocy + Math.sin(ao) * ory]); }
      od = 'M' + n(ov[0][0]) + ',' + n(ov[0][1]);
      for (var o2 = 0; o2 < nO; o2++) {
        var am2 = Math.PI * 2 * (o2 + .5) / nO;
        od += ' Q' + n(ocx + Math.cos(am2) * orx * 1.14) + ',' + n(ocy + Math.sin(am2) * ory * 1.14) + ' ' + n(ov[o2 + 1][0]) + ',' + n(ov[o2 + 1][1]);
      }
      var oid = id('fl'), oin = [];
      out.push(clip(oid, od + ' Z'), pth(od + ' Z', { fill: P.plate }));
      for (var o3 = 0; o3 < nO; o3++) {
        var ac3 = Math.PI * 2 * (o3 + .5) / nO, qx3 = ocx + Math.cos(ac3) * orx * .93, qy3 = ocy + Math.sin(ac3) * ory * .93;
        oin.push(pth('M' + n(qx3 - 7) + ',' + n(qy3 + 3) + ' Q' + n(qx3) + ',' + n(qy3 - 9) + ' ' + n(qx3 + 7) + ',' + n(qy3 + 3),
          { fill: 'none', stroke: P.band, 'stroke-width': 3, 'stroke-linecap': 'round' }));
      }
      out.push(G({ 'clip-path': 'url(#' + oid + ')' }, oin), pth(od + ' Z', attrs({ fill: 'none' }, OL())));
    } else if (P.kind === 'elytra') {
      // A beetle's wing cases, lifted a little and parted behind it, as if
      // it were about to fly: two hard shining halves, the seam down the
      // inner edge of each in the darker colour and the shine along the outer.
      [-1, 1].forEach(function (side) {
        var ex2 = cx + side * w * .3, ey2 = yt + h * .36, erx = w * .34, ery = h * .58, deg = side * 16;
        var ed = ellD(ex2, ey2, erx, ery), eid = id('el'), ein = [];
        var gd = G({ transform: 'rotate(' + deg + ' ' + n(ex2) + ' ' + n(ey2) + ')' }, [clip(eid, ed), pth(ed, { fill: P.plate }),
          G({ 'clip-path': 'url(#' + eid + ')' }, [
            line(ex2 - side * erx * .9, ey2 - ery, ex2 - side * erx * .9, ey2 + ery, { stroke: P.band, 'stroke-width': n(erx * .28) }),
            pth('M' + n(ex2 + side * erx * .55) + ',' + n(ey2 - ery * .7) + ' Q' + n(ex2 + side * erx * .8) + ',' + n(ey2 - ery * .1) + ' ' + n(ex2 + side * erx * .6) + ',' + n(ey2 + ery * .5),
              { fill: 'none', stroke: P.tip, 'stroke-width': n(erx * .12), 'stroke-linecap': 'round' })]),
          pth(ed, attrs({ fill: 'none' }, OL()))]);
        out.push(gd);
      });
    }
  }

  function backTop(out, id, P, hx, hy, rx, ry) {
    if (P.kind === 'shell') {
      var L = hx - rx * .8, R = hx + rx * .8, yb = hy - ry * .4, cid = id('cp'), inside = [];
      var d = 'M' + n(L) + ',' + n(yb) + ' Q' + n(hx) + ',' + n(hy - ry * 1.62) + ' ' + n(R) + ',' + n(yb) +
        ' Q' + n(hx) + ',' + n(hy - ry * .62) + ' ' + n(L) + ',' + n(yb) + ' Z';
      out.push(clip(cid, d), pth(d, { fill: P.plate }));
      [-.3, 0, .3].forEach(function (u) {
        inside.push(pth('M' + n(hx + u * rx) + ',' + n(hy - ry * 1.2) + ' Q' + n(hx + u * rx * 1.25) + ',' + n(hy - ry * .8) + ' ' + n(hx + u * rx * 1.1) + ',' + n(hy - ry * .3),
          { fill: 'none', stroke: P.band, 'stroke-width': 3.5 }));
      });
      [[-.5, -.62], [-.15, -.85], [.2, -.7], [.48, -.6]].forEach(function (q) { inside.push(ell(hx + q[0] * rx, hy + q[1] * ry, 3.5, 2.6, { fill: P.speck })); });
      out.push(G({ 'clip-path': 'url(#' + cid + ')' }, inside), pth(d, attrs({ fill: 'none' }, OL(4.5))));
    } else if (P.kind === 'quills') {
      [-2, -1, 0, 1, 2].forEach(function (j) {
        var bx = hx + j * rx * .17, by = hy - ry * .8, tx = hx + j * rx * .3, ty = hy - ry * (1.34 - Math.abs(j) * .06);
        var b1 = bx - rx * .05, b2 = bx + rx * .05;
        out.push(pth('M' + n(b1) + ',' + n(by) + ' L' + n(tx) + ',' + n(ty) + ' L' + n(b2) + ',' + n(by) + ' Z',
          { fill: P.quill, stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round' }));
        out.push(pth('M' + n(b1 + (tx - b1) * .65) + ',' + n(by + (ty - by) * .65) + ' L' + n(tx) + ',' + n(ty) + ' L' + n(b2 + (tx - b2) * .65) + ',' + n(by + (ty - by) * .65) + ' Z',
          { fill: P.tip }));
      });
    } else if (P.kind === 'mane') {
      [-1, 0, 1].forEach(function (j) {
        var bx = hx + j * rx * .1, by = hy - ry * .9;
        out.push(pth('M' + n(bx - rx * .08) + ',' + n(by + ry * .04) + ' Q' + n(bx + j * rx * .06) + ',' + n(by - ry * .3) + ' ' + n(bx + j * rx * .14 + rx * .05) + ',' + n(by - ry * .2) +
          ' Q' + n(bx + rx * .04) + ',' + n(by - ry * .08) + ' ' + n(bx + rx * .08) + ',' + n(by + ry * .05) + ' Z', attrs({ fill: P.plate }, OL(2.5))));
      });
    } else if (P.kind === 'shag') {
      // The fringe: a mop of locks over the forehead, down to the eyes, which
      // are drawn over it and so always show.
      var L = hx - rx * .92, R = hx + rx * .92, yb = hy - ry * .3;
      var fd = 'M' + n(L) + ',' + n(yb) + ' C' + n(L) + ',' + n(hy - ry * 1.32) + ' ' + n(R) + ',' + n(hy - ry * 1.32) + ' ' + n(R) + ',' + n(yb);
      for (var i = 0; i < 5; i++) {
        var xa = R - (R - L) * i / 5, xb = R - (R - L) * (i + 1) / 5;
        fd += ' Q' + n((xa + xb) / 2) + ',' + n(hy + ry * (i % 2 ? .02 : .14)) + ' ' + n(xb) + ',' + n(yb);
      }
      out.push(pth(fd + ' Z', attrs({ fill: P.plate }, OL(3.5))));
      [-.6, -.2, .2, .6].forEach(function (u) {
        out.push(pth('M' + n(hx + u * rx * .9) + ',' + n(hy - ry * .9) + ' Q' + n(hx + u * rx * 1.05) + ',' + n(hy - ry * .5) + ' ' + n(hx + u * rx * .85) + ',' + n(hy - ry * .12),
          { fill: 'none', stroke: P.band, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
      });
    } else if (P.kind === 'fleece') {
      // A topknot of wool on the head, in curls.
      [[-.32, -.86, .2], [.3, -.88, .2], [0, -.98, .24], [-.12, -.8, .16], [.14, -.8, .16]].forEach(function (q) {
        out.push(ell(hx + q[0] * rx, hy + q[1] * ry, rx * q[2], rx * q[2] * .86, attrs({ fill: P.plate }, OL(3))));
      });
      out.push(pth('M' + n(hx - rx * .08) + ',' + n(hy - ry * .92) + ' Q' + n(hx) + ',' + n(hy - ry * 1.04) + ' ' + n(hx + rx * .08) + ',' + n(hy - ry * .92),
        { fill: 'none', stroke: P.band, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
    } else if (P.kind === 'crest') {
      // A casque: a peaked helmet of skin on top of the head.
      var cd = 'M' + n(hx - rx * .5) + ',' + n(hy - ry * .6) + ' Q' + n(hx - rx * .32) + ',' + n(hy - ry * 1.46) + ' ' + n(hx + rx * .04) + ',' + n(hy - ry * 1.5) +
        ' Q' + n(hx + rx * .36) + ',' + n(hy - ry * 1.3) + ' ' + n(hx + rx * .5) + ',' + n(hy - ry * .6) +
        ' Q' + n(hx) + ',' + n(hy - ry * .82) + ' ' + n(hx - rx * .5) + ',' + n(hy - ry * .6) + ' Z';
      out.push(pth(cd, attrs({ fill: P.plate }, OL(4))));
      [-.22, .1].forEach(function (u) {
        out.push(pth('M' + n(hx + u * rx) + ',' + n(hy - ry * 1.3) + ' Q' + n(hx + u * rx * .7) + ',' + n(hy - ry * 1) + ' ' + n(hx + u * rx * 1.3) + ',' + n(hy - ry * .78),
          { fill: 'none', stroke: P.band, 'stroke-width': 3, 'stroke-linecap': 'round' }));
      });
    }
  }

  /* What a bird has on top of its head where another animal has ears: one of
     them, standing up from behind the head, not a pair. */
  function topKnot(out, type, bx, by, k, C, outer) {
    if (type === 'comb') {
      // A chicken's comb, red on any coat, in rounded points.
      var cw = k * 1.4, ch = k * 1.15, x0 = bx - cw / 2, tops = [.62, .95, 1, .82, .58], d = 'M' + n(x0) + ',' + n(by + ch * .25) + ' L' + n(x0) + ',' + n(by - ch * .2);
      tops.forEach(function (tp, i) {
        var xa = x0 + cw * i / tops.length, xb = x0 + cw * (i + 1) / tops.length;
        d += ' Q' + n((xa + xb) / 2) + ',' + n(by - ch * tp * 1.6) + ' ' + n(xb) + ',' + n(by - ch * .2);
      });
      out.push(pth(d + ' L' + n(x0 + cw) + ',' + n(by + ch * .25) + ' Z', attrs({ fill: COMB }, OL(3.5))));
      return;
    }
    [-2, 2, -1, 1, 0].forEach(function (j) {
      var aj = (-90 + j * (type === 'crest' ? 15 : 13)) * Math.PI / 180, L = k * (type === 'crest' ? 1.2 - Math.abs(j) * .12 : 1.15 - Math.abs(j) * .08);
      var tx = bx + Math.cos(aj) * L, ty = by + Math.sin(aj) * L;
      if (type === 'crest') {
        // A roadrunner's: a ragged crest of dark feathers.
        var px = -Math.sin(aj) * k * .14, py = Math.cos(aj) * k * .14;
        out.push(pth('M' + n(bx + px) + ',' + n(by + py) + ' L' + n(tx) + ',' + n(ty) + ' L' + n(bx - px) + ',' + n(by - py) + ' Z', attrs({ fill: C.dark }, OL(2.5))));
      } else {
        // A peacock's: a little fan of bare stalks, each with a tuft at its tip.
        out.push(line(bx, by, tx, ty, { stroke: INK, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
        out.push(ell(tx, ty, k * .1, k * .15, attrs({ fill: outer }, OL(2)), j * 13));
        out.push(ell(tx, ty, k * .04, k * .06, { fill: C.light }, j * 13));
      }
    });
  }

  function ears(out, front, E, hx, hy, rx, ry, r, C, mk) {
    if (E.type === 'none') return;
    var a = E.a * Math.PI / 180, k = E.s * r;
    var outer = mk.darkEars ? C.dark : mk.rimEars ? C.light : C.fur;
    var mid = mk.rimEars ? C.fur : null;
    var inner = mk.darkEars ? C.dark : C.skin;
    if (E.type === 'comb' || E.type === 'crest' || E.type === 'plume') { topKnot(out, E.type, hx, hy - ry * .74, k, C, outer); return; }
    [-1, 1].forEach(function (side) {
      var ax = hx + side * rx * Math.sin(a), ay = hy - ry * Math.cos(a), g = [];
      if (E.type === 'gills') {
        // An axolotl's gills: three feathery fronds out from each side of the
        // head, every outline drawn before any colour so each frond is one shape.
        var dark = [], lit = [];
        [-1, 0, 1].forEach(function (j) {
          var bx = hx + side * rx * .8, by = hy - ry * .22 + j * ry * .26, th = (-42 + j * 30) * Math.PI / 180, L = k * (1.3 - Math.abs(j) * .12);
          var ux = side * Math.cos(th), uy = Math.sin(th), tx = bx + ux * L, ty = by + uy * L, paths = ['M' + n(bx) + ',' + n(by) + ' L' + n(tx) + ',' + n(ty)];
          [.35, .58, .8].forEach(function (t) {
            var qx = bx + ux * L * t, qy = by + uy * L * t, sp = k * .2;
            paths.push('M' + n(qx - uy * sp + ux * sp * .6) + ',' + n(qy + ux * sp + uy * sp * .6) + ' L' + n(qx) + ',' + n(qy) +
              ' L' + n(qx + uy * sp + ux * sp * .6) + ',' + n(qy - ux * sp + uy * sp * .6));
          });
          paths.forEach(function (p, i) {
            dark.push(pth(p, { fill: 'none', stroke: INK, 'stroke-width': i ? 6 : 10, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
            lit.push(pth(p, { fill: 'none', stroke: C.skin, 'stroke-width': i ? 2.5 : 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
          });
        });
        Array.prototype.push.apply(out, dark.concat(lit));
        return;
      }
      if (E.type === 'horns') {
        // A Highland cow's: a long horn sweeping out and up, and a small
        // furry ear sticking out under it.
        var ex = hx + side * rx * .96, ey = hy - ry * .04;
        out.push(ell(ex + side * k * .28, ey, k * .4, k * .19, attrs({ fill: outer }, OL()), side * -12));
        out.push(ell(ex + side * k * .32, ey, k * .24, k * .09, { fill: inner }, side * -12));
        var hb = k * .2, tx2 = ax + side * k * 1.45, ty2 = ay - k * .82;
        out.push(pth('M' + n(ax) + ',' + n(ay - hb) + ' Q' + n(ax + side * k * 1.05) + ',' + n(ay - hb * .6) + ' ' + n(tx2) + ',' + n(ty2) +
          ' Q' + n(ax + side * k * 1.18) + ',' + n(ay + hb * 1.2) + ' ' + n(ax) + ',' + n(ay + hb) + ' Z', attrs({ fill: HORN }, OL())));
        return;
      }
      if (E.type === 'flop') {
        // Hanging down the side of the head, in front of it.
        front.push(pth('M' + n(ax - side * k * .15) + ',' + n(ay - k * .1) +
          ' C' + n(ax + side * k * .9) + ',' + n(ay - k * .35) + ' ' + n(ax + side * k * 1.05) + ',' + n(ay + k * 1.2) + ' ' + n(ax + side * k * .5) + ',' + n(ay + k * 1.55) +
          ' C' + n(ax + side * k * .1) + ',' + n(ay + k * 1.75) + ' ' + n(ax - side * k * .25) + ',' + n(ay + k * .9) + ' ' + n(ax - side * k * .15) + ',' + n(ay - k * .1) + ' Z',
          attrs({ fill: outer }, OL())));
        return;
      }
      if (E.type === 'fan') {
        // Great flat ears at the sides, behind the head.
        var fx = hx + side * (rx * .92 + k * .3), fy = hy + ry * .12;
        out.push(ell(fx, fy, k * .85, k * 1.15, attrs({ fill: outer }, OL())));
        out.push(ell(fx + side * k * .08, fy, k * .58, k * .86, { fill: inner }));
        return;
      }
      if (E.type === 'antennae' || E.type === 'clubs') {
        // An insect's feelers, from the top of the head, out and over: a
        // butterfly's end in clubs.
        var A1 = [ax, ay], A2 = [ax + side * k * .2, ay - k * .95], A3 = [ax + side * k * .92, ay - k * .78];
        var ad = 'M' + n(A1[0]) + ',' + n(A1[1]) + ' Q' + n(A2[0]) + ',' + n(A2[1]) + ' ' + n(A3[0]) + ',' + n(A3[1]);
        var at = E.type === 'clubs' ? 3 : 4;
        out.push(pth(ad, { fill: 'none', stroke: INK, 'stroke-width': at + 5, 'stroke-linecap': 'round' }));
        out.push(pth(ad, { fill: 'none', stroke: outer, 'stroke-width': at, 'stroke-linecap': 'round' }));
        if (E.type === 'clubs') out.push(ell(A3[0], A3[1], r * .07, r * .045, attrs({ fill: outer }, OL(3)), side * -20));
        out.push(ell(ax, ay, r * .05, r * .05, attrs({ fill: outer }, OL(2.5))));
        return;
      }
      if (E.type === 'swept') {
        // A goat's: two horns up from the top of the head and sweeping back
        // and out, ridged across, and an ear sticking out under each.
        var ex3 = hx + side * rx * .98, ey3 = hy - ry * .12;
        out.push(ell(ex3 + side * k * .3, ey3, k * .44, k * .16, attrs({ fill: outer }, OL()), side * 18));
        out.push(ell(ex3 + side * k * .34, ey3, k * .26, k * .07, { fill: inner }, side * 18));
        var b0x = ax - side * k * .1, b1x = ax + side * k * .14, tpx = ax + side * k * .62, tpy = ay - k * 1.1;
        out.push(pth('M' + n(b0x) + ',' + n(ay + k * .08) + ' Q' + n(ax - side * k * .02) + ',' + n(ay - k * .8) + ' ' + n(tpx) + ',' + n(tpy) +
          ' Q' + n(ax + side * k * .36) + ',' + n(ay - k * .5) + ' ' + n(b1x) + ',' + n(ay + k * .08) + ' Z', attrs({ fill: HORN }, OL())));
        [.3, .5, .7].forEach(function (t) {
          var rx3 = ax + side * k * (.02 + t * .26), ry3 = ay - k * t * .9;
          out.push(line(rx3 - side * k * .1, ry3 + k * .02, rx3 + side * k * .1, ry3 - k * .04, { stroke: INK, 'stroke-width': 2, 'stroke-linecap': 'round' }));
        });
        return;
      }
      if (E.type === 'round' || E.type === 'semi') {
        var cy = E.type === 'round' ? -k * .35 : -k * .2;
        g.push(ell(0, cy, k, k, attrs({ fill: outer }, OL())));
        if (mid) g.push(ell(0, cy, k * .76, k * .76, { fill: mid }));
        g.push(ell(0, cy + k * .08, k * .48, k * .48, { fill: inner }));
      } else if (E.type === 'long' || E.type === 'oval') {
        var long = E.type === 'long', c2 = long ? -k * .85 : -k * .6, w2 = long ? r * .22 : r * .2;
        g.push(ell(0, c2, w2, k * (long ? 1 : .95), attrs({ fill: outer }, OL())));
        if (mid) g.push(ell(0, c2 + k * .04, w2 * .74, k * .84, { fill: mid }));
        g.push(ell(0, c2 + k * .1, w2 * .45, k * (long ? .66 : .55), { fill: inner }));
      } else if (E.type === 'tri') {
        var K = k * 1.25;
        g.push(pth('M' + n(-.42 * K) + ',' + n(.2 * K) + ' L0,' + n(-K) + ' L' + n(.42 * K) + ',' + n(.2 * K) + ' Z', attrs({ fill: outer }, OL())));
        if (mid) g.push(pth('M' + n(-.32 * K) + ',' + n(.16 * K) + ' L0,' + n(-.78 * K) + ' L' + n(.32 * K) + ',' + n(.16 * K) + ' Z',
          { fill: mid, stroke: mid, 'stroke-width': 4, 'stroke-linejoin': 'round' }));
        g.push(pth('M' + n(-.2 * K) + ',' + n(.12 * K) + ' L0,' + n(-.5 * K) + ' L' + n(.2 * K) + ',' + n(.12 * K) + ' Z',
          { fill: inner, stroke: inner, 'stroke-width': 4, 'stroke-linejoin': 'round' }));
      } else if (E.type === 'tufts') {
        // Feather tufts, leaning out.
        var T2 = k * 1.3;
        g.push(pth('M' + n(-.28 * T2) + ',' + n(.15 * T2) + ' L' + n(.12 * T2) + ',' + n(-T2) + ' L' + n(.26 * T2) + ',' + n(.15 * T2) + ' Z', attrs({ fill: outer }, OL())));
        g.push(line(-.02 * T2, .05 * T2, .1 * T2, -.6 * T2, { stroke: C.dark, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
      } else if (E.type === 'leaf') {
        // Tall and pointed, a horse's.
        var W = k * .55, H = k * 1.25;
        g.push(pth('M0,' + n(.1 * H) + ' C' + n(W) + ',' + n(-.15 * H) + ' ' + n(.6 * W) + ',' + n(-.8 * H) + ' 0,' + n(-H) +
          ' C' + n(-.6 * W) + ',' + n(-.8 * H) + ' ' + n(-W) + ',' + n(-.15 * H) + ' 0,' + n(.1 * H) + ' Z', attrs({ fill: outer }, OL())));
        g.push(pth('M0,' + n(-.05 * H) + ' C' + n(.5 * W) + ',' + n(-.25 * H) + ' ' + n(.3 * W) + ',' + n(-.72 * H) + ' 0,' + n(-.84 * H) +
          ' C' + n(-.3 * W) + ',' + n(-.72 * H) + ' ' + n(-.5 * W) + ',' + n(-.25 * H) + ' 0,' + n(-.05 * H) + ' Z', { fill: inner }));
      }
      out.push(G({ transform: 'translate(' + n(ax) + ' ' + n(ay) + ') rotate(' + side * E.a + ')' }, g));
    });
  }

  function tail(out, id, T, tx, ty, C, mk) {
    // A frog has no tail, and neither does anything given a frog's.
    if (T.none) return;
    var fill = T.fill === 'skin' ? C.skin : T.fill === 'light' ? C.light : T.fill === 'dark' ? C.dark : C.fur, d = tailD(T.d), g = [];
    var at = { transform: 'translate(' + n(tx) + ' ' + n(ty) + ')' };
    if (T.string) {
      g.push(pth(d, { fill: 'none', stroke: INK, 'stroke-width': 12, 'stroke-linecap': 'round' }));
      g.push(pth(d, { fill: 'none', stroke: fill, 'stroke-width': 6, 'stroke-linecap': 'round' }));
      if (mk.rings) g.push(pth(d, { fill: 'none', stroke: C.dark, 'stroke-width': 6, 'stroke-dasharray': '9 9' }));
      out.push(G(at, g));
      return;
    }
    if (T.whip) {
      // A tail with some thickness to it, drawn as a stroke with an outline.
      var wo = T.whip[0], wi = T.whip[1];
      g.push(pth(d, { fill: 'none', stroke: INK, 'stroke-width': wo, 'stroke-linecap': 'round' }));
      g.push(pth(d, { fill: 'none', stroke: fill, 'stroke-width': wi, 'stroke-linecap': 'round' }));
      if (mk.rings) g.push(pth(d, { fill: 'none', stroke: C.dark, 'stroke-width': wi, 'stroke-dasharray': '10 10' }));
      if (T.tuft) g.push(ell(T.tuft[0], T.tuft[1], wo * .9, wo * 1.3, attrs({ fill: C.dark }, OL(3)), T.tuft[2] || 0));
      else if (T.sting && T.end) {
        // A scorpion's: a bulb at the end of the tail and a curved sting out
        // of it, pointing down.
        var sx2 = T.end[0], sy2 = T.end[1];
        g.push(pth('M' + n(sx2 - wo * .2) + ',' + n(sy2 + wo * .2) + ' Q' + n(sx2 - wo * .95) + ',' + n(sy2 + wo * .3) + ' ' + n(sx2 - wo * 1.05) + ',' + n(sy2 + wo * 1.05) +
          ' Q' + n(sx2 - wo * .5) + ',' + n(sy2 + wo * .62) + ' ' + n(sx2 + wo * .15) + ',' + n(sy2 + wo * .45) + ' Z', attrs({ fill: C.dark }, OL(2.5))));
        g.push(ell(sx2, sy2, wo * .62, wo * .5, attrs({ fill: fill }, OL(3)), -20));
      }
      else if (mk.tailTip && T.end) g.push(ell(T.end[0], T.end[1], wi * .55, wi * .55, { fill: C.light }));
      out.push(G(at, g));
      return;
    }
    var cid = id('tl'), inside = [];
    g.push(clip(cid, d), pth(d, { fill: fill }));
    if (T.bands) [24, 48, 72, 96].forEach(function (x) { inside.push(line(x, -30, x + 6, 40, { stroke: C.dark, 'stroke-width': 3 })); });
    // A beaver's tail is scaled, in a crosshatch.
    if (T.hatch) for (var hx = -40; hx < 150; hx += 14) {
      inside.push(line(hx, -50, hx + 50, 50, { stroke: lineOn(fill, C), 'stroke-width': 2 }), line(hx + 50, -50, hx, 50, { stroke: lineOn(fill, C), 'stroke-width': 2 }));
    }
    if (T.axis) {
      var x0 = T.axis[0], y0 = T.axis[1], x1 = T.axis[2], y1 = T.axis[3];
      var dx = x1 - x0, dy = y1 - y0, L = Math.sqrt(dx * dx + dy * dy), nx = -dy / L, ny = dx / L;
      if (mk.rings) {
        [.32, .54, .76].forEach(function (t) {
          var mx = x0 + dx * t, my = y0 + dy * t;
          inside.push(line(mx + nx * 90, my + ny * 90, mx - nx * 90, my - ny * 90, { stroke: C.dark, 'stroke-width': n(L * .1) }));
        });
        inside.push(ell(x1, y1, L * .13, L * .13, { fill: C.dark }));
      }
      if (mk.tailTip) inside.push(ell(x1, y1, L * .24, L * .24, { fill: C.light }));
    }
    g.push(G({ 'clip-path': 'url(#' + cid + ')' }, inside), pth(d, attrs({ fill: 'none' }, OL())));
    out.push(G(at, g));
  }

  function arm(sx, sy, px, py, rw, fill) {
    var vx = px - sx, vy = py - sy, len = Math.sqrt(vx * vx + vy * vy);
    var deg = Math.atan2(-vx, vy) * 180 / Math.PI;
    return ell((sx + px) / 2, (sy + py) / 2, rw, len / 2 + rw * .6, attrs({ fill: fill }, OL()), deg);
  }

  function foot(out, type, fx, fy, w, fill, C, side) {
    if (type === 'none') return;
    if (type === 'legs') {
      // An insect's hind leg: out from the side, up to the knee and down to
      // the ground, two small claws at its tip.
      var lt = w * .045, L0 = [fx + side * w * .06, fy - w * .3], L1 = [fx + side * w * .34, fy - w * .44], L2 = [fx + side * w * .44, fy + w * .02];
      jointed(out, [L0, L1, L2], lt, fill);
      [-1, 1].forEach(function (i) { out.push(line(L2[0], L2[1], L2[0] + side * w * .05 + i * w * .02, L2[1] + w * .03, OL(2.5))); });
      return;
    }
    if (type === 'hoppers') {
      // A cricket's: a great thigh folded up high, ridged across, and the
      // shin down from its knee to the ground with spines along it.
      var K0 = [fx + side * w * .02, fy - w * .2], K1 = [fx + side * w * .4, fy - w * .9], K2 = [fx + side * w * .5, fy + w * .02];
      var kx = K1[0] - K0[0], ky = K1[1] - K0[1], kl = Math.sqrt(kx * kx + ky * ky), nx = -ky / kl, ny = kx / kl, wa = w * .085, wb = w * .03;
      out.push(pth('M' + n(K0[0] + nx * wa) + ',' + n(K0[1] + ny * wa) + ' Q' + n(K0[0] + kx * .45 + nx * wa * 1.25) + ',' + n(K0[1] + ky * .45 + ny * wa * 1.25) + ' ' + n(K1[0] + nx * wb) + ',' + n(K1[1] + ny * wb) +
        ' L' + n(K1[0] - nx * wb) + ',' + n(K1[1] - ny * wb) + ' Q' + n(K0[0] + kx * .45 - nx * wa * 1.25) + ',' + n(K0[1] + ky * .45 - ny * wa * 1.25) + ' ' + n(K0[0] - nx * wa) + ',' + n(K0[1] - ny * wa) +
        ' Q' + n(K0[0] - kx * .12) + ',' + n(K0[1] - ky * .12) + ' ' + n(K0[0] + nx * wa) + ',' + n(K0[1] + ny * wa) + ' Z', attrs({ fill: fill }, OL())));
      [.3, .48, .66].forEach(function (t) {
        var qx = K0[0] + kx * t, qy = K0[1] + ky * t, ww = wa * (1.1 - t * .8);
        out.push(line(qx + nx * ww * .7, qy + ny * ww * .7, qx - nx * ww * .7 + kx * .05, qy - ny * ww * .7 + ky * .05, { stroke: lineOn(fill, C), 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
      });
      jointed(out, [K1, K2], w * .035, fill);
      [.35, .6, .85].forEach(function (t) {
        var qx = K1[0] + (K2[0] - K1[0]) * t, qy = K1[1] + (K2[1] - K1[1]) * t;
        out.push(line(qx, qy, qx + side * w * .04, qy - w * .02, OL(2.5)));
      });
      return;
    }
    if (type === 'prolegs') {
      // A caterpillar's: two soft round feet each side, with a dark rim of
      // tiny hooks along the bottom of each.
      [-.07, .07].forEach(function (dx) {
        var px = fx + dx * w;
        out.push(ell(px, fy - w * .01, w * .06, w * .05, attrs({ fill: fill }, OL())));
        out.push(pth('M' + n(px - w * .045) + ',' + n(fy + w * .02) + ' Q' + n(px) + ',' + n(fy + w * .05) + ' ' + n(px + w * .045) + ',' + n(fy + w * .02),
          { fill: 'none', stroke: C.dark, 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
      });
      return;
    }
    if (type === 'fins') {
      // A fin at the foot of something that swims, turned out.
      out.push(pth('M' + n(fx - side * w * .06) + ',' + n(fy - w * .07) +
        ' Q' + n(fx + side * w * .12) + ',' + n(fy - w * .08) + ' ' + n(fx + side * w * .22) + ',' + n(fy + w * .03) +
        ' Q' + n(fx + side * w * .06) + ',' + n(fy + w * .05) + ' ' + n(fx - side * w * .07) + ',' + n(fy + w * .02) + ' Z', attrs({ fill: fill }, OL())));
      [[.1, -.03], [.16, .02]].forEach(function (q) {
        out.push(line(fx - side * w * .02, fy - w * .02, fx + side * w * q[0], fy + w * q[1], { stroke: lineOn(fill, C), 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
      });
      return;
    }
    if (type === 'tentacles') {
      // Two tentacles curling out along the ground, suckers along them.
      [[.24, 1], [.14, .75]].forEach(function (q) {
        var L = w * q[0], tw = w * .055 * q[1] + 2, x0 = fx - side * w * .04, y0 = fy - w * .06;
        var p0 = [x0, y0], p1 = [x0 + side * L * .3, fy + w * .04], p2 = [x0 + side * L * .9, fy + w * .05], p3 = [x0 + side * L, fy - w * .01];
        var d = 'M' + n(p0[0]) + ',' + n(p0[1]) + ' C' + n(p1[0]) + ',' + n(p1[1]) + ' ' + n(p2[0]) + ',' + n(p2[1]) + ' ' + n(p3[0]) + ',' + n(p3[1]) +
          ' C' + n(x0 + side * L * 1.06) + ',' + n(fy - w * .06) + ' ' + n(x0 + side * L * .8) + ',' + n(fy - w * .07) + ' ' + n(x0 + side * L * .78) + ',' + n(fy - w * .03);
        out.push(pth(d, { fill: 'none', stroke: INK, 'stroke-width': n(tw + 7), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
        out.push(pth(d, { fill: 'none', stroke: fill, 'stroke-width': n(tw), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
        [.4, .62, .84].forEach(function (t) { var s = bez(p0, p1, p2, p3, t); out.push(ell(s[0], s[1], tw * .24, tw * .24, attrs({ fill: C.skin }, OL(1.5)))); });
      });
      return;
    }
    if (type === 'streamers') {
      // A jellyfish's: thin streamers trailing from under the body.
      [-1.5, -.5, .5, 1.5].forEach(function (i) {
        var x = fx + i * w * .045, y0 = fy - 4, y1 = fy + w * (.26 + Math.abs(i) * .02), a = w * .03 * (i < 0 ? 1 : -1);
        var d = 'M' + n(x) + ',' + n(y0) + ' C' + n(x + a * 2) + ',' + n(y0 + (y1 - y0) * .3) + ' ' + n(x - a * 2) + ',' + n(y0 + (y1 - y0) * .62) + ' ' + n(x + a) + ',' + n(y1);
        out.push(pth(d, { fill: 'none', stroke: INK, 'stroke-width': 7, 'stroke-linecap': 'round' }));
        out.push(pth(d, { fill: 'none', stroke: C.skin, 'stroke-width': 3, 'stroke-linecap': 'round' }));
      });
      return;
    }
    if (type === 'pads') {
      out.push(ell(fx, fy, w * .15, w * .105, attrs({ fill: fill }, OL())));
      out.push(ell(fx, fy + w * .015, w * .07, w * .05, { fill: C.skin }));
      [-1, 0, 1].forEach(function (i) { out.push(ell(fx + i * w * .052, fy - w * .058, w * .022, w * .022, { fill: C.skin })); });
    } else if (type === 'small') {
      out.push(ell(fx, fy, w * .11, w * .068, attrs({ fill: fill }, OL())));
    } else if (type === 'claws') {
      out.push(ell(fx, fy, w * .125, w * .078, attrs({ fill: fill }, OL())));
      [-1, 0, 1].forEach(function (i) { out.push(line(fx + i * w * .04, fy + w * .03, fx + i * w * .046, fy + w * .075, { stroke: '#EFE9DF', 'stroke-width': 3.5, 'stroke-linecap': 'round' })); });
    } else if (type === 'big') {
      out.push(ell(fx, fy - w * .05, w * .15, w * .165, attrs({ fill: fill }, OL())));
      out.push(ell(fx, fy - w * .03, w * .07, w * .095, { fill: C.skin }));
    } else if (type === 'webbed') {
      out.push(ell(fx, fy, w * .15, w * .078, attrs({ fill: fill }, OL())));
      [-1, 0, 1].forEach(function (i) { out.push(line(fx + i * w * .05, fy - w * .03, fx + i * w * .062, fy + w * .05, { stroke: INK, 'stroke-width': 2.5, 'stroke-linecap': 'round' })); });
    } else if (type === 'hooves') {
      out.push(rect(fx - w * .085, fy - w * .06, w * .17, w * .1, attrs({ rx: n(w * .03), fill: C.dark }, OL())));
      out.push(line(fx, fy - w * .045, fx, fy + w * .035, { stroke: C.light, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
    } else if (type === 'toes') {
      out.push(ell(fx, fy, w * .15, w * .1, attrs({ fill: fill }, OL())));
      [-1, 0, 1].forEach(function (i) { out.push(ell(fx + i * w * .055, fy + w * .055, w * .024, w * .017, attrs({ fill: C.light }, OL(2)))); });
    } else if (type === 'talons') {
      [-1, 0, 1].forEach(function (i) {
        var d = 'M' + n(fx) + ',' + n(fy - w * .04) + ' L' + n(fx + i * w * .07) + ',' + n(fy + w * .05);
        out.push(pth(d, { fill: 'none', stroke: INK, 'stroke-width': 9, 'stroke-linecap': 'round' }));
        out.push(pth(d, { fill: 'none', stroke: C.skin, 'stroke-width': 5, 'stroke-linecap': 'round' }));
        out.push(ell(fx + i * w * .076, fy + w * .062, w * .016, w * .016, { fill: INK }));
      });
    } else if (type === 'paddles') {
      out.push(ell(fx, fy, w * .14, w * .065, attrs({ fill: C.skin }, OL())));
      [-1, 0, 1].forEach(function (i) { out.push(line(fx + i * w * .045, fy - w * .03, fx + i * w * .06, fy + w * .045, { stroke: INK, 'stroke-width': 2.5, 'stroke-linecap': 'round' })); });
    }
  }

  function eyes(out, HD, hx, hy, rx, ry, r, sclera, fierce, headFill, C) {
    [-1, 1].forEach(function (side) {
      var ex = hx + side * HD.eyes.x * rx, ey = hy + HD.eyes.y * ry;
      var brow = function (lift) { if (fierce) out.push(line(ex + side * r * .16, ey - r * (lift + .25), ex - side * r * .1, ey - r * (lift + .16), OL(5.5))); };
      if (HD.eyes.big === 'slit') {
        // A snake's: amber, with a pupil that is a slit.
        out.push(ell(ex, ey, r * .11, r * .12, attrs({ fill: IRIS }, OL(3))));
        out.push(ell(ex, ey, r * .025, r * .095, { fill: '#141010' }));
        out.push(ell(ex - r * .04, ey - r * .045, r * .022, r * .022, { fill: '#FFFFFF' }));
        brow(0);
        return;
      }
      if (HD.eyes.big === 'turret') {
        // A chameleon's: a cone of skin with rings round it and a small eye at its tip.
        out.push(ell(ex, ey, r * .2, r * .2, attrs({ fill: headFill }, OL(3))));
        out.push(ell(ex, ey, r * .13, r * .13, { fill: 'none', stroke: lineOn(headFill, C), 'stroke-width': 2.5 }));
        out.push(ell(ex + side * r * .02, ey, r * .065, r * .065, { fill: '#141010' }));
        out.push(ell(ex + side * r * .02 - r * .02, ey - r * .025, r * .02, r * .02, { fill: '#FFFFFF' }));
        brow(.06);
        return;
      }
      if (HD.eyes.big === 'bulge') {
        // A frog's: up on bumps on the top of the head, the bump's lower edge
        // lost in the head.
        out.push(ell(ex, ey, r * .2, r * .18, attrs({ fill: headFill }, OL())));
        out.push(ell(ex, ey + r * .1, r * .17, r * .09, { fill: headFill }));
        out.push(ell(ex, ey - r * .01, r * .1, r * .11, { fill: '#141010' }));
        out.push(ell(ex - r * .035, ey - r * .05, r * .03, r * .03, { fill: '#FFFFFF' }));
        brow(.06);
        return;
      }
      if (HD.eyes.big === 'lashes') {
        // A camel's: a dark eye under a heavy lid, and long lashes to keep
        // the sand out.
        out.push(ell(ex, ey, r * .08, r * .1, { fill: '#141010' }));
        out.push(ell(ex - r * .022, ey - r * .035, r * .027, r * .027, { fill: '#FFFFFF' }));
        out.push(pth('M' + n(ex - r * .13) + ',' + n(ey) + ' Q' + n(ex) + ',' + n(ey - r * .19) + ' ' + n(ex + r * .13) + ',' + n(ey),
          { fill: 'none', stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' }));
        [-.6, 0, .6].forEach(function (t) {
          var lx = ex + t * r * .1, ly = ey - r * (.095 - Math.abs(t) * .04);
          out.push(line(lx, ly, lx + (t + side * .5) * r * .07, ly - r * .1, { stroke: INK, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
        });
        brow(.04);
        return;
      }
      if (HD.eyes.big === 'compound') {
        // An insect's: great dark eyes made of facets, the light caught
        // across them.
        out.push(ell(ex, ey, r * .19, r * .22, attrs({ fill: FACETS }, OL(3))));
        // A ring of the head's lighter colour, so a dark eye shows on a dark head.
        out.push(ell(ex, ey, r * .165, r * .195, { fill: 'none', stroke: lineOn(headFill, C), 'stroke-width': 2, opacity: '.6' }));
        [[-.07, -.09], [.02, -.11], [-.1, 0], [.06, -.03], [-.02, .07], [.08, .07]].forEach(function (q) {
          out.push(ell(ex + q[0] * r, ey + q[1] * r, r * .022, r * .022, { fill: '#FFFFFF', opacity: '.22' }));
        });
        out.push(ell(ex - side * r * .05, ey - r * .08, r * .055, r * .035, { fill: '#FFFFFF', opacity: '.8' }, side * 30));
        brow(.04);
        return;
      }
      if (HD.eyes.big === 'many') {
        // A jumping spider's: two great eyes at the front, a smaller pair
        // beside them and a smaller pair again above.
        out.push(ell(ex, ey, r * .16, r * .17, attrs({ fill: '#1E1612' }, OL(3))));
        out.push(ell(ex, ey, r * .135, r * .145, { fill: 'none', stroke: lineOn(headFill, C), 'stroke-width': 2.5, opacity: '.7' }));
        out.push(ell(ex - r * .045, ey - r * .06, r * .05, r * .05, { fill: '#FFFFFF' }));
        out.push(ell(ex + r * .05, ey + r * .06, r * .02, r * .02, { fill: '#FFFFFF', opacity: '.7' }));
        out.push(ell(ex + side * r * .3, ey - r * .1, r * .065, r * .07, attrs({ fill: '#1E1612', stroke: lineOn(headFill, C), 'stroke-width': 2 })));
        out.push(ell(ex + side * r * .3 - r * .02, ey - r * .13, r * .02, r * .02, { fill: '#FFFFFF' }));
        out.push(ell(ex + side * r * .2, ey - r * .34, r * .045, r * .045, attrs({ fill: '#1E1612', stroke: lineOn(headFill, C), 'stroke-width': 2 })));
        brow(.08);
        return;
      }
      if (HD.eyes.big === 'bar') {
        // A goat's and a sheep's: an amber eye with a pupil that is a bar
        // across it.
        out.push(ell(ex, ey, r * .12, r * .1, attrs({ fill: IRIS }, OL(3))));
        out.push(rect(ex - r * .09, ey - r * .025, r * .18, r * .05, { rx: n(r * .025), fill: '#141010' }));
        out.push(ell(ex - r * .045, ey - r * .045, r * .022, r * .022, { fill: '#FFFFFF' }));
        brow(0);
        return;
      }
      if (HD.eyes.big === 'dark') {
        // A possum's: big, dark and wet, the eye of an animal out at night.
        out.push(ell(ex, ey, r * .14, r * .15, attrs({ fill: '#1E1612' }, OL(3))));
        out.push(ell(ex - r * .04, ey - r * .05, r * .04, r * .04, { fill: '#FFFFFF' }));
        out.push(ell(ex + r * .045, ey + r * .05, r * .018, r * .018, { fill: '#FFFFFF', opacity: '.7' }));
        if (fierce) out.push(line(ex + side * r * .16, ey - r * .25, ex - side * r * .1, ey - r * .16, OL(5.5)));
        return;
      }
      if (HD.eyes.big) {
        // An owl's eye is amber in any colours: an iris is not fur.
        out.push(ell(ex, ey, r * .15, r * .15, attrs({ fill: IRIS }, OL(3))));
        out.push(ell(ex, ey, r * .075, r * .075, { fill: '#141010' }));
        out.push(ell(ex - r * .035, ey - r * .04, r * .03, r * .03, { fill: '#FFFFFF' }));
        if (fierce) out.push(line(ex + side * r * .16, ey - r * .25, ex - side * r * .1, ey - r * .16, OL(5.5)));
        return;
      }
      if (sclera) {
        out.push(ell(ex, ey, r * .1, r * .115, { fill: '#FFFFFF' }));
        out.push(ell(ex - side * r * .015, ey + r * .01, r * .062, r * .078, { fill: '#141010' }));
      } else {
        out.push(ell(ex, ey, r * .075, r * .095, { fill: '#141010' }));
      }
      out.push(ell(ex - r * .022, ey - r * .035, r * .027, r * .027, { fill: '#FFFFFF' }));
      if (fierce) out.push(line(ex + side * r * .14, ey - r * .21, ex - side * r * .1, ey - r * .12, OL(5.5)));
    });
  }

  function nose(out, type, hx, ny, r, C, hy, ry, headFill) {
    var g = attrs({ fill: C.nose }, OL(3));
    if (type === 'none') return;
    if (type === 'blowhole') {
      // A dolphin's nose is on the top of its head.
      var by = hy - ry * .8;
      out.push(pth('M' + n(hx - r * .07) + ',' + n(by) + ' Q' + n(hx) + ',' + n(by + r * .06) + ' ' + n(hx + r * .07) + ',' + n(by),
        { fill: 'none', stroke: INK, 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
      return;
    }
    if (type === 'bill') {
      // A long pointed beak, a raven's or a roadrunner's, with its ridge.
      out.push(pth('M' + n(hx - r * .15) + ',' + n(ny - r * .1) + ' Q' + n(hx) + ',' + n(ny - r * .2) + ' ' + n(hx + r * .15) + ',' + n(ny - r * .1) +
        ' Q' + n(hx + r * .1) + ',' + n(ny + r * .22) + ' ' + n(hx) + ',' + n(ny + r * .44) +
        ' Q' + n(hx - r * .1) + ',' + n(ny + r * .22) + ' ' + n(hx - r * .15) + ',' + n(ny - r * .1) + ' Z', g));
      out.push(line(hx - r * .03, ny - r * .1, hx - r * .015, ny + r * .3, { stroke: '#FFFFFF', 'stroke-width': 2.5, 'stroke-linecap': 'round', opacity: '.35' }));
      return;
    }
    if (type === 'hook') {
      // A parrot's: a great curved upper beak hooking down over a dark lower one.
      out.push(ell(hx, ny + r * .16, r * .2, r * .1, attrs({ fill: BEAKLOW }, OL(3))));
      out.push(pth('M' + n(hx - r * .17) + ',' + n(ny - r * .06) + ' C' + n(hx - r * .17) + ',' + n(ny - r * .24) + ' ' + n(hx + r * .17) + ',' + n(ny - r * .24) + ' ' + n(hx + r * .17) + ',' + n(ny - r * .06) +
        ' C' + n(hx + r * .17) + ',' + n(ny + r * .14) + ' ' + n(hx + r * .06) + ',' + n(ny + r * .28) + ' ' + n(hx) + ',' + n(ny + r * .4) +
        ' C' + n(hx - r * .06) + ',' + n(ny + r * .28) + ' ' + n(hx - r * .17) + ',' + n(ny + r * .14) + ' ' + n(hx - r * .17) + ',' + n(ny - r * .06) + ' Z', g));
      [-1, 1].forEach(function (side) { out.push(ell(hx + side * r * .07, ny - r * .1, r * .022, r * .018, { fill: INK })); });
      return;
    }
    if (type === 'duckbill' || type === 'flatbill') {
      // A flat bill seen end on: a swan's, or a platypus's, which is as wide
      // as its face.
      var z = type === 'flatbill' ? 1.6 : 1, by2 = ny - r * (z - 1) * .05;
      out.push(pth('M' + n(hx - r * .3 * z) + ',' + n(by2 - r * .06) + ' C' + n(hx - r * .38 * z) + ',' + n(by2 + r * .36 * z) + ' ' + n(hx + r * .38 * z) + ',' + n(by2 + r * .36 * z) + ' ' + n(hx + r * .3 * z) + ',' + n(by2 - r * .06) +
        ' Q' + n(hx) + ',' + n(by2 - r * .19) + ' ' + n(hx - r * .3 * z) + ',' + n(by2 - r * .06) + ' Z', g));
      [-1, 1].forEach(function (side) { out.push(ell(hx + side * r * .08, by2 - r * .03, r * .028, r * .022, { fill: INK })); });
      out.push(pth('M' + n(hx - r * .24 * z) + ',' + n(by2 + r * .14 * z) + ' Q' + n(hx) + ',' + n(by2 + r * .2 * z) + ' ' + n(hx + r * .24 * z) + ',' + n(by2 + r * .14 * z),
        { fill: 'none', stroke: INK, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
      return;
    }
    if (type === 'snout') {
      out.push(ell(hx, ny, r * .3, r * .21, attrs({ fill: C.skin }, OL(3.5))));
      [-1, 1].forEach(function (side) { out.push(ell(hx + side * r * .1, ny, r * .045, r * .07, { fill: C.nose })); });
      return;
    }
    if (type === 'beak') {
      out.push(pth('M' + n(hx - r * .13) + ',' + n(ny - r * .05) + ' Q' + n(hx) + ',' + n(ny - r * .12) + ' ' + n(hx + r * .13) + ',' + n(ny - r * .05) +
        ' L' + n(hx) + ',' + n(ny + r * .22) + ' Z', g));
      out.push(line(hx - r * .08, ny - r * .02, hx + r * .08, ny - r * .02, { stroke: INK, 'stroke-width': 2, 'stroke-linecap': 'round' }));
      return;
    }
    if (type === 'nostrils' || type === 'horn') {
      [-1, 1].forEach(function (side) { out.push(ell(hx + side * r * .12, ny, r * .045, r * .065, attrs({ fill: C.nose }, OL(2)))); });
      if (type === 'horn') {
        // A rhino's: a great horn up from the end of the nose, and a smaller
        // one behind it, higher up the face, both horn on any coat.
        var hb = ny - r * .1;
        out.push(pth('M' + n(hx - r * .1) + ',' + n(hy - ry * .02) + ' Q' + n(hx - r * .06) + ',' + n(hy - ry * .3) + ' ' + n(hx + r * .02) + ',' + n(hy - ry * .46) +
          ' Q' + n(hx + r * .07) + ',' + n(hy - ry * .26) + ' ' + n(hx + r * .1) + ',' + n(hy - ry * .02) + ' Z', attrs({ fill: HORN }, OL(3))));
        out.push(pth('M' + n(hx - r * .18) + ',' + n(hb) + ' Q' + n(hx - r * .14) + ',' + n(hb - r * .46) + ' ' + n(hx + r * .04) + ',' + n(hb - r * .74) +
          ' Q' + n(hx + r * .1) + ',' + n(hb - r * .4) + ' ' + n(hx + r * .18) + ',' + n(hb) + ' Q' + n(hx) + ',' + n(hb + r * .05) + ' ' + n(hx - r * .18) + ',' + n(hb) + ' Z',
          attrs({ fill: HORN }, OL(3.5))));
      }
      return;
    }
    if (type === 'trunk') {
      // A trunk from between the eyes, hanging and then curling up to one
      // side, drawn as a thick line with an outline, its wrinkles across it.
      var tw = r * .27, x0 = hx, y0 = hy + ry * .02;
      var td = 'M' + n(x0) + ',' + n(y0) + ' C' + n(x0) + ',' + n(y0 + ry * .5) + ' ' + n(x0 - r * .04) + ',' + n(y0 + ry * .86) + ' ' + n(x0 + r * .14) + ',' + n(y0 + ry * 1.02) +
        ' C' + n(x0 + r * .28) + ',' + n(y0 + ry * 1.12) + ' ' + n(x0 + r * .42) + ',' + n(y0 + ry * 1.0) + ' ' + n(x0 + r * .42) + ',' + n(y0 + ry * .82);
      out.push(pth(td, { fill: 'none', stroke: INK, 'stroke-width': n(tw + 8), 'stroke-linecap': 'round' }));
      out.push(pth(td, { fill: 'none', stroke: headFill, 'stroke-width': n(tw), 'stroke-linecap': 'round' }));
      [.3, .46, .62].forEach(function (f) {
        var y = y0 + ry * f;
        out.push(pth('M' + n(x0 - tw * .38) + ',' + n(y) + ' Q' + n(x0) + ',' + n(y + r * .05) + ' ' + n(x0 + tw * .38) + ',' + n(y),
          { fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-linecap': 'round' }));
      });
      out.push(ell(x0 + r * .42, y0 + ry * .82 - tw * .1, tw * .3, tw * .2, { fill: C.nose }));
      return;
    }
    if (type === 'round') { out.push(ell(hx, ny, r * .14, r * .095, g), ell(hx - r * .045, ny - r * .03, r * .035, r * .02, { fill: '#FFFFFF', opacity: '.7' })); return; }
    if (type === 'wide') { out.push(ell(hx, ny, r * .19, r * .1, g), ell(hx - r * .06, ny - r * .035, r * .045, r * .022, { fill: '#FFFFFF', opacity: '.7' })); return; }
    if (type === 'small') { out.push(ell(hx, ny, r * .08, r * .055, g)); return; }
    var q = type === 'y' ? .075 : .1;
    out.push(pth('M' + n(hx - r * q) + ',' + n(ny - r * q * .5) + ' Q' + n(hx) + ',' + n(ny - r * q) + ' ' + n(hx + r * q) + ',' + n(ny - r * q * .5) +
      ' Q' + n(hx + r * q * .2) + ',' + n(ny + r * q * .8) + ' ' + n(hx) + ',' + n(ny + r * q * .8) +
      ' Q' + n(hx - r * q * .2) + ',' + n(ny + r * q * .8) + ' ' + n(hx - r * q) + ',' + n(ny - r * q * .5) + ' Z', g));
  }

  function mouthArt(out, type, hx, ny, my, r, muzY, hy, ry, C) {
    var k = r / 75, st = attrs({ fill: 'none' }, OL(3.5));
    if (type === 'none') return;
    if (type === 'tusks') {
      [-1, 1].forEach(function (side) {
        var bx = hx + side * r * .2, by = muzY - r * .02;
        out.push(pth('M' + n(bx - side * r * .04) + ',' + n(by) +
          ' C' + n(bx + side * r * .02) + ',' + n(by + r * .3) + ' ' + n(bx + side * r * .12) + ',' + n(by + r * .42) + ' ' + n(bx + side * r * .2) + ',' + n(by + r * .46) +
          ' C' + n(bx + side * r * .12) + ',' + n(by + r * .3) + ' ' + n(bx + side * r * .08) + ',' + n(by + r * .12) + ' ' + n(bx + side * r * .06) + ',' + n(by) + ' Z',
          attrs({ fill: '#FFFDF5' }, OL(3))));
      });
      return;
    }
    var phil = pth('M' + n(hx) + ',' + n(ny + r * .08) + ' L' + n(hx) + ',' + n(my), st);
    function wsmile(wd, dp) {
      return pth('M' + n(hx - wd * k) + ',' + n(my - 2 * k) + ' Q' + n(hx - wd * k / 2) + ',' + n(my + dp * k) + ' ' + n(hx) + ',' + n(my) +
        ' Q' + n(hx + wd * k / 2) + ',' + n(my + dp * k) + ' ' + n(hx + wd * k) + ',' + n(my - 2 * k), st);
    }
    function teeth(tw, th, fill) {
      var t = attrs({ rx: 1.5, fill: fill || '#FFFFFF' }, OL(2.5));
      return [rect(hx - tw * k, my, tw * k, th * k, t), rect(hx, my, tw * k, th * k, t)];
    }
    function fang(x0, y0, x1, y1, x2, y2) {
      return pth('M' + n(hx + x0 * k) + ',' + n(my + y0 * k) + ' L' + n(hx + x1 * k) + ',' + n(my + y1 * k) + ' L' + n(hx + x2 * k) + ',' + n(my + y2 * k) + ' Z',
        attrs({ fill: '#FFFFFF' }, OL(2.5)));
    }
    if (type === 'smile') out.push(phil, wsmile(15, 8));
    else if (type === 'buck') out.push.apply(out, teeth(7.5, 12).concat([phil, wsmile(14, 6)]));
    else if (type === 'bunny') out.push.apply(out, teeth(5, 9).concat([phil, wsmile(11, 5)]));
    else if (type === 'w') out.push(wsmile(12, 6));
    else if (type === 'tiny') out.push(pth('M' + n(hx - 6 * k) + ',' + n(my) + ' Q' + n(hx) + ',' + n(my + 5 * k) + ' ' + n(hx + 6 * k) + ',' + n(my), st));
    else if (type === 'fierce') out.push(fang(3, 1, 6.5, 9, 10, 2.5),
      pth('M' + n(hx - 13 * k) + ',' + n(my + 5 * k) + ' Q' + n(hx) + ',' + n(my - 4 * k) + ' ' + n(hx + 13 * k) + ',' + n(my + 5 * k), st));
    else if (type === 'open') out.push(phil,
      pth('M' + n(hx - 15 * k) + ',' + n(my - 1 * k) + ' Q' + n(hx) + ',' + n(my + 20 * k) + ' ' + n(hx + 15 * k) + ',' + n(my - 1 * k) + ' Z', attrs({ fill: '#5A2420' }, OL(3))),
      ell(hx, my + 8 * k, 6.5 * k, 4 * k, { fill: '#E8788A' }));
    else if (type === 'smirk') out.push(fang(4, 3, 6.5, 9, 9.5, 2),
      pth('M' + n(hx - 12 * k) + ',' + n(my) + ' Q' + n(hx + 2 * k) + ',' + n(my + 9 * k) + ' ' + n(hx + 14 * k) + ',' + n(my - 4 * k), st));
    // A beaver's teeth are orange, with the iron in them.
    else if (type === 'chisel') out.push.apply(out, teeth(9, 15, ORANGE).concat([phil, wsmile(15, 6)]));
    else if (type === 'grin') out.push(pth('M' + n(hx - r * .42) + ',' + n(my - r * .06) + ' Q' + n(hx) + ',' + n(my + r * .22) + ' ' + n(hx + r * .42) + ',' + n(my - r * .06), st));
    else if (type === 'pout') out.push(ell(hx, my + 4 * k, 7 * k, 6 * k, attrs({ fill: '#5A2420' }, OL(3))));
    // A bat's: a small smile and two small fangs.
    else if (type === 'fangs') out.push(wsmile(11, 5), fang(-7, 0, -5, 8, -3, 1), fang(3, 1, 5, 8, 7, 0));
    else if (type === 'pegs') {
      // A hippo's: a wide mouth, and two short tusks standing up from the
      // lower jaw at its corners.
      out.push(pth('M' + n(hx - r * .36) + ',' + n(my - r * .04) + ' Q' + n(hx) + ',' + n(my + r * .16) + ' ' + n(hx + r * .36) + ',' + n(my - r * .04), st));
      [-1, 1].forEach(function (side) {
        var tx = hx + side * r * .24;
        out.push(pth('M' + n(tx - r * .04) + ',' + n(my + r * .03) + ' L' + n(tx + side * r * .01) + ',' + n(my - r * .09) + ' L' + n(tx + r * .04) + ',' + n(my + r * .03) + ' Z',
          attrs({ fill: '#FFFDF5' }, OL(2.5))));
      });
    }
    else if (type === 'wattle') {
      // A bird's wattle, red on any coat, hanging under the beak, which is
      // drawn after it and over its top.
      [-1, 1].forEach(function (side) {
        var wx = hx + side * r * .05, wy = my - r * .06;
        out.push(pth('M' + n(wx - r * .06) + ',' + n(wy) + ' Q' + n(wx - r * .1) + ',' + n(wy + r * .26) + ' ' + n(wx) + ',' + n(wy + r * .3) +
          ' Q' + n(wx + r * .1) + ',' + n(wy + r * .26) + ' ' + n(wx + r * .06) + ',' + n(wy) + ' Z', attrs({ fill: COMB }, OL(2.5))));
      });
    } else if (type === 'tongue') {
      // A forked tongue, out and in again.
      var fork = 'M' + n(hx) + ',' + n(my) + ' L' + n(hx) + ',' + n(my + r * .2) + ' L' + n(hx - r * .06) + ',' + n(my + r * .3) +
        ' M' + n(hx) + ',' + n(my + r * .2) + ' L' + n(hx + r * .06) + ',' + n(my + r * .3);
      out.push(pth(fork, { fill: 'none', stroke: INK, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
      out.push(pth(fork, { fill: 'none', stroke: TONGUE, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
      out.push(wsmile(13, 4));
    } else if (type === 'mandibles') {
      // An insect's jaws: a pair of pincers, curving in to meet under the face.
      [-1, 1].forEach(function (side) {
        out.push(pth('M' + n(hx + side * r * .22) + ',' + n(my - r * .06) + ' Q' + n(hx + side * r * .27) + ',' + n(my + r * .16) + ' ' + n(hx + side * r * .03) + ',' + n(my + r * .22) +
          ' Q' + n(hx + side * r * .14) + ',' + n(my + r * .1) + ' ' + n(hx + side * r * .08) + ',' + n(my - r * .04) + ' Z', attrs({ fill: C.dark }, OL(3))));
      });
    } else if (type === 'chelicerae') {
      // A spider's: two stout jaws side by side, and a dark fang curling in
      // under each.
      [-1, 1].forEach(function (side) {
        var jx = hx + side * r * .09;
        out.push(pth('M' + n(jx - side * r * .05) + ',' + n(my + r * .1) + ' Q' + n(jx + side * r * .06) + ',' + n(my + r * .2) + ' ' + n(jx - side * r * .04) + ',' + n(my + r * .27) +
          ' Q' + n(jx) + ',' + n(my + r * .18) + ' ' + n(jx - side * r * .09) + ',' + n(my + r * .1) + ' Z', attrs({ fill: INK }, OL(2))));
        out.push(ell(jx, my + r * .02, r * .09, r * .1, attrs({ fill: C.fur }, OL(3))));
      });
    } else if (type === 'proboscis') {
      // A butterfly's tongue, coiled up under its face like a watch spring.
      var pR = r * .14, pcx = hx, pcy = my + r * .06 + pR, pd = 'M' + n(hx) + ',' + n(my - r * .04);
      for (var pi = 0; pi <= 30; pi++) {
        var pa = -Math.PI / 2 + pi * Math.PI / 8, pr = pR * (1 - pi / 34);
        pd += ' L' + n(pcx + Math.cos(pa) * pr) + ',' + n(pcy + Math.sin(pa) * pr);
      }
      out.push(pth(pd, { fill: 'none', stroke: INK, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
      out.push(pth(pd, { fill: 'none', stroke: C.skin, 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    } else if (type === 'jaws') {
      // A shark's: a wide grin with a row of pointed teeth in it.
      var jl = hx - r * .36, jr = hx + r * .36, jy = my - r * .02;
      out.push(pth('M' + n(jl) + ',' + n(jy) + ' Q' + n(hx) + ',' + n(my + r * .34) + ' ' + n(jr) + ',' + n(jy) +
        ' Q' + n(hx) + ',' + n(my + r * .1) + ' ' + n(jl) + ',' + n(jy) + ' Z', attrs({ fill: GUM }, OL(3))));
      for (var ti = 1; ti < 8; ti++) {
        var tt = ti / 8, tu = 1 - tt, tx3 = tu * tu * jl + 2 * tu * tt * hx + tt * tt * jr, ty3 = tu * tu * jy + 2 * tu * tt * (my + r * .1) + tt * tt * jy;
        out.push(pth('M' + n(tx3 - r * .03) + ',' + n(ty3 - r * .01) + ' L' + n(tx3) + ',' + n(ty3 + r * .08) + ' L' + n(tx3 + r * .03) + ',' + n(ty3 - r * .01) + ' Z',
          attrs({ fill: '#FFFFFF' }, OL(1.5))));
      }
    } else if (type === 'beard') {
      // A goat's: a small smile, and a beard hanging from the chin in the
      // darker colour.
      out.push(wsmile(11, 5));
      var by3 = Math.max(my + r * .14, hy + ry * .78);
      out.push(pth('M' + n(hx - r * .13) + ',' + n(by3) + ' Q' + n(hx - r * .1) + ',' + n(by3 + r * .26) + ' ' + n(hx - r * .02) + ',' + n(by3 + r * .44) +
        ' L' + n(hx + r * .02) + ',' + n(by3 + r * .34) + ' L' + n(hx + r * .05) + ',' + n(by3 + r * .44) +
        ' Q' + n(hx + r * .11) + ',' + n(by3 + r * .24) + ' ' + n(hx + r * .13) + ',' + n(by3) + ' Q' + n(hx) + ',' + n(by3 + r * .06) + ' ' + n(hx - r * .13) + ',' + n(by3) + ' Z',
        attrs({ fill: C.dark }, OL(3))));
    } else if (type === 'spiral') {
      // A narwhal's tusk: one long tooth through the upper lip, spiralled,
      // and a small smile under it.
      var bx = hx - r * .03, by = my - r * .1, tx = hx - r * .42, ty = hy - ry * 1.9, dx = tx - bx, dy = ty - by;
      var L = Math.sqrt(dx * dx + dy * dy), px = -dy / L, py = dx / L, bw = r * .075;
      out.push(wsmile(11, 5));
      out.push(pth('M' + n(bx + px * bw) + ',' + n(by + py * bw) + ' L' + n(tx) + ',' + n(ty) + ' L' + n(bx - px * bw) + ',' + n(by - py * bw) + ' Z', attrs({ fill: HORN }, OL(3))));
      for (var f = .12; f < .86; f += .12) {
        var qx = bx + dx * f, qy = by + dy * f, ww = bw * (1 - f);
        out.push(line(qx + px * ww, qy + py * ww, qx - px * ww + dx / L * ww * 1.6, qy - py * ww + dy / L * ww * 1.6, { stroke: INK, 'stroke-width': 1.8, 'stroke-linecap': 'round' }));
      }
    }
  }

  /* ── One chimera, as nodes ───────────────────────────────────────────── */
  /* A stripe from the edge of a body or head inward, thick at the edge and
     coming to a point. */
  function stripe(x0, x1, y, th, bend) {
    var xm = (x0 + x1) / 2;
    return 'M' + n(x0) + ',' + n(y - th / 2) + ' Q' + n(xm) + ',' + n(y + bend - th * .25) + ' ' + n(x1) + ',' + n(y + bend * .5) +
      ' Q' + n(xm) + ',' + n(y + bend + th * .25) + ' ' + n(x0) + ',' + n(y + th / 2) + ' Z';
  }

  function nodes(c, prefix) {
    var p = clean(c);
    if (!p) return null;
    var P = prefix || ('chm' + (++seq)), count = 0;
    function id(tag) { count += 1; return P + '-' + tag + count; }
    var C = A[p.colours].colours, mk = A[p.markings].markings, B = A[p.body].body, HD = A[p.head].head,
      E = A[p.ears].ears, T = A[p.tail].tail, MO = A[p.mouth].mouth, BK = p.back === 'none' ? null : A[p.back].back;
    var armsT = A[p.arms].body.arms, feetT = A[p.feet].body.feet;
    var cx = 200, yb = 405, w = B.w, h = B.h, wTop = w * B.top, yt = yb - h;
    // A body with a neck (a swan's, a peacock's) holds whatever head it is
    // given that much higher.
    var neck = B.neck || 0;
    var r = HD.r, rx = r * HD.sx, ry = r * HD.sy, hx = cx, hy = yt - ry * .55 - neck;
    var torsoD = pear(cx, yt, yb, wTop, w);
    var headD = HD.shape === 'wedge' ? wedge(hx, hy, rx, ry) : HD.shape === 'block' ? block(hx, hy, rx, ry) :
      HD.shape === 'bell' ? bell(hx, hy, rx, ry) : HD.shape === 'tri' ? tri(hx, hy, rx, ry) : ellD(hx, hy, rx, ry);
    var headFill = mk.lightHead ? C.light : mk.bareHead ? C.skin : C.fur;
    var cT = id('t'), cH = id('h'), out = [], front = [];
    out.push(N('defs', {}, [clip(cT, torsoD), clip(cH, headD)]));
    out.push(ell(cx, yb + 6, w * .62, 13, { fill: '#000000', opacity: '.12' }));
    if (BK) backBehind(out, id, BK, cx, yt, h, w, hx, hy, rx, ry, wTop);
    tail(out, id, T, cx + w * (T.at || .3), yb - h * .24, C, mk);
    ears(out, front, E, hx, hy, rx, ry, r, C, mk);
    if (neck) {
      // The neck stands behind the body and the head, so only its sides show.
      var nb = Math.min(wTop * .3, rx * .45), nt = Math.min(rx * .3, nb * .75), y0 = yt + h * .14, y1 = hy + ry * .3;
      out.push(pth('M' + n(cx - nb) + ',' + n(y0) + ' C' + n(cx - nb) + ',' + n(y0 - (y0 - y1) * .45) + ' ' + n(cx - nt) + ',' + n(y1 + (y0 - y1) * .35) + ' ' + n(cx - nt) + ',' + n(y1) +
        ' L' + n(cx + nt) + ',' + n(y1) + ' C' + n(cx + nt) + ',' + n(y1 + (y0 - y1) * .35) + ' ' + n(cx + nb) + ',' + n(y0 - (y0 - y1) * .45) + ' ' + n(cx + nb) + ',' + n(y0) + ' Z',
        attrs({ fill: C.fur }, OL())));
    }

    var torso = [];
    if (mk.band) torso.push(rect(cx - w, yt - 20, 2 * w, h * .36 + 20, { fill: C.dark }));
    if (mk.belly) torso.push(ell(cx, yt + h * .64, w * .28, h * .28, { fill: C.light }));
    if (mk.chest) torso.push(ell(cx, yt + h * .52, w * .27, h * .4, { fill: C.light }));
    if (mk.tux) torso.push(ell(cx, yt + h * .6, w * .34, h * .44, { fill: C.light }));
    if (mk.stripes) {
      // Rows, how far apart, how far in each reaches (a tiger's in turn
      // further and less far), and how thick at the edge.
      var SR = { bold: [6, .135, .1, .1, .06], tabby: [4, .17, .3, .3, .035], tiger: [5, .145, .16, .3, .05] }[mk.stripes];
      for (var i = 0; i < SR[0]; i++) {
        var sy0 = yt + h * (.16 + i * SR[1]), reach = i % 2 ? SR[3] : SR[2];
        [-1, 1].forEach(function (side) {
          torso.push(pth(stripe(cx + side * w * .62, cx + side * w * reach, sy0, h * SR[4], h * .03), { fill: C.dark }));
        });
      }
    }
    if (mk.folds) {
      // A rhino's: its skin in folds, round the neck and down from each
      // shoulder, as if it were armour.
      var fl = { fill: 'none', stroke: lineOn(C.fur, C), 'stroke-width': 3.5, 'stroke-linecap': 'round' };
      torso.push(pth('M' + n(cx - wTop * .44) + ',' + n(yt + h * .14) + ' Q' + n(cx) + ',' + n(yt + h * .3) + ' ' + n(cx + wTop * .44) + ',' + n(yt + h * .14), fl));
      [-1, 1].forEach(function (side) {
        torso.push(pth('M' + n(cx + side * wTop * .3) + ',' + n(yt + h * .06) + ' Q' + n(cx + side * w * .32) + ',' + n(yt + h * .4) + ' ' + n(cx + side * w * .56) + ',' + n(yt + h * .5), fl));
        torso.push(pth('M' + n(cx + side * w * .28) + ',' + n(yt + h * .62) + ' Q' + n(cx + side * w * .3) + ',' + n(yt + h * .8) + ' ' + n(cx + side * w * .46) + ',' + n(yt + h * .92), fl));
      });
    }
    if (mk.gloss) {
      // A crow's: the light caught along its feathers, which on a black bird
      // is blue.
      torso.push(pth('M' + n(cx - w * .34) + ',' + n(yt + h * .2) + ' Q' + n(cx - w * .44) + ',' + n(yt + h * .5) + ' ' + n(cx - w * .3) + ',' + n(yt + h * .8),
        { fill: 'none', stroke: C.light, 'stroke-width': n(w * .045), 'stroke-linecap': 'round' }));
    }
    if (mk.ribbons) [-1.5, -.5, .5, 1.5].forEach(function (i) {
      // A jellyfish's: frilled ribbons hanging under the bell.
      var x = cx + i * w * .17, y0 = yt + h * .1, y1 = yb - h * .06, a = w * .05;
      var d = 'M' + n(x) + ',' + n(y0) + ' C' + n(x + a) + ',' + n(y0 + (y1 - y0) * .33) + ' ' + n(x - a) + ',' + n(y0 + (y1 - y0) * .66) + ' ' + n(x) + ',' + n(y1);
      torso.push(pth(d, { fill: 'none', stroke: C.light, 'stroke-width': n(w * .08), 'stroke-linecap': 'round' }));
      torso.push(pth(d, { fill: 'none', stroke: C.dark, 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-dasharray': '7 5' }));
    });
    if (mk.blotches) {
      // A koi's: patches of colour, no two the same shape.
      [[-.34, .3, .2, .12, 20], [.36, .52, .18, .14, -25], [-.18, .78, .22, .1, 10]].forEach(function (q) {
        torso.push(ell(cx + q[0] * w, yt + q[1] * h, w * q[2], h * q[3], { fill: C.dark }, q[4]));
        torso.push(ell(cx + q[0] * w + w * q[2] * .5, yt + q[1] * h + h * q[3] * .4, w * q[2] * .6, h * q[3] * .7, { fill: C.dark }, -q[4]));
      });
    }
    if (mk.spots) SPOTS.forEach(function (q) { torso.push(ell(cx + q[0] * w * .5, yt + q[1] * h, w * .035 * q[2], w * .032 * q[2], { fill: C.dark })); });
    if (mk.coils) [.3, .54, .78].forEach(function (f) {
      // A snake's coils, one lying on the next: the shade under each coil,
      // its edge, and the light along the top of the one below.
      var y = yt + h * f, bend = h * .1;
      var arc = function (dy) { return 'M' + n(cx - w * .7) + ',' + n(y - bend * .3 + dy) + ' Q' + n(cx) + ',' + n(y + bend * 1.5 + dy) + ' ' + n(cx + w * .7) + ',' + n(y - bend * .3 + dy); };
      torso.push(pth(arc(-h * .03), { fill: 'none', stroke: C.dark, 'stroke-width': n(h * .05) }));
      torso.push(pth(arc(0), { fill: 'none', stroke: INK, 'stroke-width': 4 }));
      torso.push(pth(arc(h * .025), { fill: 'none', stroke: C.light, 'stroke-width': 3 }));
    });
    if (mk.chevrons) [0, 1, 2].forEach(function (j) {
      [-1, 0, 1].forEach(function (i) {
        var x = cx + i * w * .11 + (j % 2 ? w * .055 : 0), y = yt + h * (.48 + j * .12);
        torso.push(pth('M' + n(x - w * .04) + ',' + n(y) + ' L' + n(x) + ',' + n(y + w * .03) + ' L' + n(x + w * .04) + ',' + n(y),
          { fill: 'none', stroke: lineOn(C.fur, C), 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
      });
    });
    if (mk.rosettes) SPOTS.forEach(function (q) {
      // A leopard's: broken rings of the dark colour round a deeper middle.
      var rx2 = w * .055 * q[2], ry2 = w * .048 * q[2], x = cx + q[0] * w * .5, y = yt + q[1] * h;
      torso.push(ell(x, y, rx2, ry2, { fill: C.dark, opacity: '.28' }));
      torso.push(ell(x, y, rx2, ry2, { fill: 'none', stroke: C.dark, 'stroke-width': 5, 'stroke-dasharray': '9 4' }));
    });
    if (mk.dots) SPOTS.forEach(function (q) { torso.push(ell(cx + q[0] * w * .42, yt + q[1] * h, w * .028, w * .028, { fill: C.light })); });
    if (mk.hoops) [0, 1, 2, 3, 4].forEach(function (i) {
      // A monarch caterpillar's rings: a broad dark one and a thin bright one
      // beside it, all the way down.
      var y = yt + h * (.1 + i * .19), bend = h * .05;
      var arc = function (dy) { return 'M' + n(cx - w * .7) + ',' + n(y + dy) + ' Q' + n(cx) + ',' + n(y + bend * 2 + dy) + ' ' + n(cx + w * .7) + ',' + n(y + dy); };
      torso.push(pth(arc(0), { fill: 'none', stroke: C.dark, 'stroke-width': n(h * .07) }));
      torso.push(pth(arc(h * .065), { fill: 'none', stroke: C.light, 'stroke-width': n(h * .03) }));
    });
    if (mk.segments) [1, 2, 3, 4, 5].forEach(function (i) {
      // The plates of an insect's or a scorpion's body, one over the next.
      var y = yt + h * i / 6;
      torso.push(pth('M' + n(cx - w * .7) + ',' + n(y) + ' Q' + n(cx) + ',' + n(y + h * .07) + ' ' + n(cx + w * .7) + ',' + n(y),
        { fill: 'none', stroke: lineOn(C.fur, C), 'stroke-width': 3, 'stroke-linecap': 'round' }));
    });
    if (mk.grooves) {
      // A whale's throat: pale, and pleated in long grooves.
      torso.push(ell(cx, yt + h * .56, w * .32, h * .48, { fill: C.light }));
      [-3, -2, -1, 0, 1, 2, 3].forEach(function (i) {
        var x = cx + i * w * .075;
        torso.push(pth('M' + n(x) + ',' + n(yt + h * .14) + ' Q' + n(x + i * w * .02) + ',' + n(yt + h * .55) + ' ' + n(x) + ',' + n(yb),
          { fill: 'none', stroke: C.dark, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
      });
    }
    if (mk.slits) [-1, 1].forEach(function (side) {
      // A shark's gill slits, high on each side.
      [0, 1, 2].forEach(function (i) {
        var x = cx + side * w * (.26 + i * .06), y = yt + h * (.12 + i * .03);
        torso.push(pth('M' + n(x) + ',' + n(y) + ' Q' + n(x + side * w * .03) + ',' + n(y + h * .07) + ' ' + n(x) + ',' + n(y + h * .15),
          { fill: 'none', stroke: lineOn(C.fur, C), 'stroke-width': 3, 'stroke-linecap': 'round' }));
      });
    });
    if (mk.wool) [[-.34, .2], [-.04, .14], [.28, .22], [-.44, .46], [-.14, .4], [.16, .44], [.42, .5], [-.3, .68], [0, .64], [.3, .72], [-.12, .88], [.18, .9]].forEach(function (q) {
      // A sheep's: the wool in little curls all over.
      var x = cx + q[0] * w, y = yt + q[1] * h;
      torso.push(pth('M' + n(x - 6) + ',' + n(y + 2) + ' Q' + n(x - 5) + ',' + n(y - 7) + ' ' + n(x + 2) + ',' + n(y - 5) + ' Q' + n(x + 8) + ',' + n(y - 2) + ' ' + n(x + 4) + ',' + n(y + 4),
        { fill: 'none', stroke: lineOn(C.fur, C), 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
    });
    torso.push(ell(cx + w * .56, yt + h * .55, w * .4, h * .85, { fill: '#000000', opacity: '.09' }));
    out.push(pth(torsoD, { fill: C.fur }), G({ 'clip-path': 'url(#' + cT + ')' }, torso), pth(torsoD, attrs({ fill: 'none' }, OL())));

    var limb = mk.darkLimbs ? C.dark : C.fur, feetFill = (mk.darkLimbs || mk.darkPaws) ? C.dark : C.fur;
    [-1, 1].forEach(function (side) { foot(out, feetT, cx + side * w * .26, yb - 4, w, feetFill, C, side); });
    [-1, 1].forEach(function (side) {
      // A snake's and a jellyfish's arms are no arms.
      if (armsT === 'none') return;
      if (armsT === 'tentacles') {
        // An octopus's: out from the shoulders and curling, suckers along them.
        var tw = w * .07, x0 = cx + side * wTop * .36, y0 = yt + h * .22;
        var p0 = [x0, y0], p1 = [x0 + side * w * .34, y0 - h * .02], p2 = [x0 + side * w * .4, y0 + h * .42], p3 = [x0 + side * w * .24, y0 + h * .46];
        var td = 'M' + n(p0[0]) + ',' + n(p0[1]) + ' C' + n(p1[0]) + ',' + n(p1[1]) + ' ' + n(p2[0]) + ',' + n(p2[1]) + ' ' + n(p3[0]) + ',' + n(p3[1]) +
          ' C' + n(x0 + side * w * .12) + ',' + n(y0 + h * .5) + ' ' + n(x0 + side * w * .1) + ',' + n(y0 + h * .36) + ' ' + n(x0 + side * w * .18) + ',' + n(y0 + h * .36);
        out.push(pth(td, { fill: 'none', stroke: INK, 'stroke-width': n(tw + 8), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
        out.push(pth(td, { fill: 'none', stroke: limb, 'stroke-width': n(tw), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
        [.45, .65, .85].forEach(function (t) { var s = bez(p0, p1, p2, p3, t); out.push(ell(s[0], s[1], tw * .22, tw * .22, attrs({ fill: C.skin }, OL(1.5)))); });
        return;
      }
      if (armsT === 'wings') {
        // A wing down each side, from the shoulder, its feathers in lines.
        var wx = cx + side * w * .42, wy = yt + h * .5, wrx = w * .17, wry = h * .36;
        out.push(ell(wx, wy, wrx, wry, attrs({ fill: limb }, OL()), side * -12));
        [0, 1, 2].forEach(function (j) {
          out.push(pth('M' + n(wx - side * wrx * .5) + ',' + n(wy + wry * (-.1 + j * .25)) + ' Q' + n(wx) + ',' + n(wy + wry * (.05 + j * .25)) +
            ' ' + n(wx + side * wrx * .7) + ',' + n(wy + wry * (-.25 + j * .25)), { fill: 'none', stroke: lineOn(limb, C), 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
        });
        return;
      }
      if (armsT === 'membrane') {
        // A bat's wing folded down its side: skin over long bones, the thumb's
        // claw at the top.
        var bx0 = cx + side * wTop * .4, by0 = yt + h * .08, X = function (f) { return n(cx + side * w * f); }, Y = function (f) { return n(yt + h * f); };
        out.push(pth('M' + n(bx0) + ',' + n(by0) + ' C' + X(.66) + ',' + Y(.1) + ' ' + X(.68) + ',' + Y(.6) + ' ' + X(.5) + ',' + Y(.9) +
          ' Q' + X(.46) + ',' + Y(.76) + ' ' + X(.37) + ',' + Y(.84) + ' Q' + X(.33) + ',' + Y(.7) + ' ' + X(.25) + ',' + Y(.74) +
          ' C' + X(.3) + ',' + Y(.42) + ' ' + X(.3) + ',' + Y(.2) + ' ' + n(bx0) + ',' + n(by0) + ' Z', attrs({ fill: limb }, OL())));
        [[.5, .88], [.37, .82]].forEach(function (q) {
          out.push(line(bx0 + side * w * .04, by0 + h * .05, cx + side * w * q[0], yt + h * q[1], { stroke: lineOn(limb, C), 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
        });
        out.push(pth('M' + n(bx0) + ',' + n(by0) + ' Q' + n(bx0 + side * w * .03) + ',' + n(by0 - h * .08) + ' ' + n(bx0 - side * w * .03) + ',' + n(by0 - h * .1),
          { fill: 'none', stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' }));
        return;
      }
      if (armsT === 'flippers') {
        out.push(ell(cx + side * wTop * .58, yt + h * .44, w * .075, h * .28, attrs({ fill: limb }, OL()), side * -30));
        return;
      }
      if (armsT === 'legs') {
        // An insect's other two legs on each side, out from the body, up to
        // the knee and down, the front one held a little higher.
        [.24, .46].forEach(function (f, j) {
          var y0 = yt + h * f, x0 = cx + side * sideAt(w, wTop, f) * .86;
          jointed(out, [[x0, y0], [x0 + side * w * (.26 - j * .02), y0 - h * (.16 - j * .04)], [x0 + side * w * (.4 - j * .02), y0 + h * (.14 + j * .06)]], w * .04, limb);
        });
        return;
      }
      if (armsT === 'spider') {
        // A spider's first three legs on each side: arching high, out from
        // the knee and down again to the ground.
        [.22, .38, .54].forEach(function (f, j) {
          var y0 = yt + h * f, x0 = cx + side * sideAt(w, wTop, f) * .86;
          var K = [x0 + side * w * (.22 + j * .06), y0 - h * (.42 - j * .1)], F = [x0 + side * w * (.42 + j * .02), yb - h * (.3 - j * .12)];
          jointed(out, [[x0, y0], K, F], w * .042, limb);
        });
        return;
      }
      if (armsT === 'raptorial') {
        // A mantis's forelegs, folded up in front of its chest: the thigh down
        // and in from the shoulder, spined along its inner edge, and the shin
        // folded back up against it.
        var R0 = [cx + side * wTop * .34, yt + h * .1], R1 = [cx + side * w * .3, yt + h * .48], R2 = [cx + side * w * .08, yt + h * .16];
        jointed(out, [R0, R1], w * .1, limb);
        [.3, .5, .7, .88].forEach(function (t) {
          var qx = R0[0] + (R1[0] - R0[0]) * t - side * w * .05, qy = R0[1] + (R1[1] - R0[1]) * t;
          out.push(pth('M' + n(qx) + ',' + n(qy - h * .02) + ' L' + n(qx - side * w * .07) + ',' + n(qy + h * .005) + ' L' + n(qx) + ',' + n(qy + h * .02) + ' Z', attrs({ fill: C.light }, OL(2))));
        });
        jointed(out, [R1, R2], w * .06, limb);
        out.push(line(R2[0], R2[1], R2[0] + side * w * .04, R2[1] - h * .05, OL(3.5)));
        return;
      }
      if (armsT === 'pincers') {
        // A scorpion's: an arm out from the shoulder and up, and a great claw
        // at the end of it, its two fingers open.
        var P0 = [cx + side * wTop * .42, yt + h * .24], P1 = [cx + side * w * .64, yt + h * .22], P2 = [cx + side * w * .66, yt + h * .02];
        jointed(out, [P0, P1, P2], w * .07, limb);
        var cw = w * .14, ox = P2[0], oy = P2[1] - cw * .45;
        var Q = function (x, y) { return n(ox + side * x * cw) + ',' + n(oy + y * cw); };
        // The fixed finger on the outside, the moving one on the inside,
        // their tips curving in towards each other with the gap between.
        out.push(pth('M' + Q(.45, -.35) + ' Q' + Q(1.05, -1.25) + ' ' + Q(.2, -1.9) + ' Q' + Q(.42, -1.15) + ' ' + Q(-.02, -.5) + ' Z', attrs({ fill: limb }, OL())));
        out.push(pth('M' + Q(-.45, -.4) + ' Q' + Q(-.9, -1.15) + ' ' + Q(-.28, -1.6) + ' Q' + Q(-.38, -1) + ' ' + Q(.05, -.55) + ' Z', attrs({ fill: limb }, OL())));
        out.push(ell(ox, oy, cw * .78, cw * .62, attrs({ fill: limb }, OL()), side * -10));
        return;
      }
      if (armsT === 'stubs') {
        // A caterpillar's three pairs of true legs, small and dark, near the
        // front of its body.
        [.24, .36, .48].forEach(function (f) {
          out.push(ell(cx + side * (sideAt(w, wTop, f) + w * .02), yt + h * f, w * .05, w * .034, attrs({ fill: C.dark }, OL(2.5)), side * 12));
        });
        return;
      }
      var rw = armsT === 'thick' ? w * .12 : w * .085;
      var sx = cx + side * wTop * .4, sy = yt + h * .18, px = cx + side * w * .22, py = sy + Math.min(h * .42, w * .4);
      out.push(arm(sx, sy, px, py, rw, limb));
      if (armsT === 'hands') {
        var hf = mk.darkPaws || mk.darkLimbs ? C.dark : C.fur;
        out.push(ell(px, py + rw * .4, w * .07, w * .065, attrs({ fill: hf }, OL())));
        [-1, 0, 1].forEach(function (i) { out.push(line(px + i * w * .03, py + rw * .4 + w * .02, px + i * w * .034, py + rw * .4 + w * .06, OL(2.5))); });
      } else if (mk.darkPaws) {
        out.push(ell(px, py + rw * .5, rw * 1.02, rw * .9, attrs({ fill: C.dark }, OL())));
      }
    });

    var head = [];
    if (mk.lowerFace) head.push(ell(hx, hy + ry * .5, rx * .92, ry * .62, { fill: C.light }));
    if (mk.tux) head.push(ell(hx, hy + ry * .45, rx * .8, ry * .62, { fill: C.light }));
    if (mk.disc) [-1, 1].forEach(function (side) {
      head.push(ell(hx + side * rx * .36, hy + HD.eyes.y * ry, rx * .38, ry * .44, { fill: C.light, stroke: C.dark, 'stroke-width': 2.5 }));
    });
    if (mk.bands) [-1, 1].forEach(function (side) { head.push(ell(hx + side * rx * .36, hy - ry * .25, rx * .2, ry * .95, { fill: C.dark }, side * 14)); });
    if (mk.patches) [-1, 1].forEach(function (side) {
      var ex = hx + side * HD.eyes.x * rx, ey = hy + HD.eyes.y * ry;
      head.push(ell(ex + side * r * .03, ey + r * .04, r * .2, r * .145, { fill: C.dark }, side * 28));
    });
    if (mk.blotches) {
      head.push(ell(hx - rx * .1, hy - ry * .62, rx * .55, ry * .32, { fill: C.dark }, -8));
      head.push(ell(hx + rx * .38, hy - ry * .42, rx * .3, ry * .24, { fill: C.dark }, 20));
    }
    if (mk.spots) HEADSPOTS.forEach(function (q) { head.push(ell(hx + q[0] * rx, hy + q[1] * ry, rx * .065 * q[2], rx * .06 * q[2], { fill: C.dark })); });
    if (mk.facePatch) [-1, 1].forEach(function (side) {
      // A macaw's: bare white skin round the eye, lined with tiny feathers.
      var ex = hx + side * HD.eyes.x * rx, ey = hy + HD.eyes.y * ry;
      head.push(ell(ex + side * r * .05, ey + r * .07, r * .25, r * .2, { fill: BARE }, side * -15));
      [0, 1, 2].forEach(function (j) {
        var y = ey + r * (.14 + j * .05);
        head.push(pth('M' + n(ex - side * r * .02) + ',' + n(y) + ' Q' + n(ex + side * r * .08) + ',' + n(y + r * .03) + ' ' + n(ex + side * r * .18) + ',' + n(y - r * .01),
          { fill: 'none', stroke: C.dark, 'stroke-width': 1.8, 'stroke-linecap': 'round' }));
      });
    });
    if (mk.eyePatch) head.push(ell(hx + HD.eyes.x * rx + r * .02, hy + HD.eyes.y * ry + r * .01, r * .2, r * .17, { fill: C.dark }, 15));
    if (mk.stripes) {
      // On the forehead, how wide and how far down; on each cheek, how many,
      // how far apart, how far in and how thick.
      var SH = { bold: [.07, .38, 2, .24, .55, .09], tabby: [.045, .52, 2, .24, .68, .06], tiger: [.055, .5, 3, .2, .6, .07] }[mk.stripes], fa = rx * SH[0];
      [-1, 0, 1].forEach(function (j) {
        var tx = hx + j * rx * .18, bx = hx + j * rx * .12, ty = hy - ry * 1.05, by = hy - ry * SH[1];
        head.push(pth('M' + n(tx - fa) + ',' + n(ty) + ' L' + n(tx + fa) + ',' + n(ty) + ' L' + n(bx) + ',' + n(by) + ' Z', { fill: C.dark }));
      });
      [-1, 1].forEach(function (side) {
        for (var k = 0; k < SH[2]; k++) {
          head.push(pth(stripe(hx + side * rx * 1.02, hx + side * rx * SH[4], hy + ry * (-.05 + k * SH[3]), ry * SH[5], ry * .03), { fill: C.dark }));
        }
      });
    }
    if (mk.gloss) head.push(pth('M' + n(hx - rx * .62) + ',' + n(hy - ry * .2) + ' Q' + n(hx - rx * .52) + ',' + n(hy - ry * .76) + ' ' + n(hx + rx * .02) + ',' + n(hy - ry * .84),
      { fill: 'none', stroke: C.light, 'stroke-width': n(r * .07), 'stroke-linecap': 'round' }));
    if (mk.mask) {
      head.push(pth('M' + n(hx - rx * .95) + ',' + n(hy - ry * .1) +
        ' C' + n(hx - rx * .7) + ',' + n(hy - ry * .34) + ' ' + n(hx - rx * .2) + ',' + n(hy - ry * .3) + ' ' + n(hx) + ',' + n(hy - ry * .14) +
        ' C' + n(hx + rx * .2) + ',' + n(hy - ry * .3) + ' ' + n(hx + rx * .7) + ',' + n(hy - ry * .34) + ' ' + n(hx + rx * .95) + ',' + n(hy - ry * .1) +
        ' C' + n(hx + rx * .72) + ',' + n(hy + ry * .28) + ' ' + n(hx + rx * .25) + ',' + n(hy + ry * .22) + ' ' + n(hx) + ',' + n(hy + ry * .12) +
        ' C' + n(hx - rx * .25) + ',' + n(hy + ry * .22) + ' ' + n(hx - rx * .72) + ',' + n(hy + ry * .28) + ' ' + n(hx - rx * .95) + ',' + n(hy - ry * .1) + ' Z',
        { fill: C.dark }));
      [-1, 1].forEach(function (side) { head.push(ell(hx + side * rx * .42, hy - ry * .42, rx * .22, ry * .07, { fill: C.light }, side * 8)); });
    }
    if (mk.tears) [-1, 1].forEach(function (side) {
      // A cheetah's: a dark line from the inside of each eye down to the
      // corner of the mouth.
      var ex = hx + side * HD.eyes.x * rx, ey = hy + HD.eyes.y * ry;
      head.push(pth('M' + n(ex - side * r * .08) + ',' + n(ey + r * .04) + ' Q' + n(ex - side * r * .14) + ',' + n(ey + r * .3) + ' ' + n(hx + side * r * .2) + ',' + n(hy + ry * .62),
        { fill: 'none', stroke: C.dark, 'stroke-width': n(r * .055), 'stroke-linecap': 'round' }));
    });
    if (mk.rosettes) HEADSPOTS.forEach(function (q) { head.push(ell(hx + q[0] * rx, hy + q[1] * ry, rx * .05 * q[2], rx * .045 * q[2], { fill: C.dark })); });
    if (mk.eyeSpots) [-1, 1].forEach(function (side) {
      // An orca's: a pale patch above and behind each eye.
      head.push(ell(hx + side * rx * .66, hy - ry * .16, rx * .2, ry * .1, { fill: C.light }, side * 18));
    });
    if (mk.hoops) [-.42, .3].forEach(function (f) {
      head.push(pth('M' + n(hx - rx * 1.1) + ',' + n(hy + ry * f) + ' Q' + n(hx) + ',' + n(hy + ry * (f + .22)) + ' ' + n(hx + rx * 1.1) + ',' + n(hy + ry * f),
        { fill: 'none', stroke: C.dark, 'stroke-width': n(ry * .16) }));
      head.push(pth('M' + n(hx - rx * 1.1) + ',' + n(hy + ry * (f + .14)) + ' Q' + n(hx) + ',' + n(hy + ry * (f + .36)) + ' ' + n(hx + rx * 1.1) + ',' + n(hy + ry * (f + .14)),
        { fill: 'none', stroke: C.light, 'stroke-width': n(ry * .06) }));
    });
    head.push(ell(hx + rx * .95, hy + ry * .25, rx * .5, ry * 1.1, { fill: '#000000', opacity: '.07' }));
    out.push(pth(headD, { fill: headFill }), G({ 'clip-path': 'url(#' + cH + ')' }, head), pth(headD, attrs({ fill: 'none' }, OL())));
    front.forEach(function (f) { out.push(f); });

    var M = HD.muz, my = hy + M.y * ry, mry = M.ry * r, muzFill = mk.darkMuzzle ? C.dark : C.light;
    if (!M.none) {
      if (HD.pads) [-1, 1].forEach(function (side) { out.push(ell(hx + side * r * .19, my, r * .25, r * .2, attrs({ fill: muzFill }, OL(3.5)))); });
      else out.push(ell(hx, my, M.rx * r, mry, attrs({ fill: muzFill }, OL(3.5))));
    }
    if (BK) backTop(out, id, BK, hx, hy, rx, ry);
    eyes(out, HD, hx, hy, rx, ry, r, !!(mk.patches || mk.mask || mk.bands || mk.eyePatch || mk.eyeSpots), MO === 'fierce', headFill, C);

    var nz = HD.nose;
    var beaky = { snout: 1, beak: 1, trunk: 1, bill: 1, hook: 1, duckbill: 1, flatbill: 1 };
    var ny = nz === 'small' ? my + mry * .55 : own(beaky, nz) ? my : nz === 'nostrils' || nz === 'horn' ? my + mry * .12 : my - mry * .3;
    if (HD.whiskers) [-1, 1].forEach(function (side) {
      [0, 1, 2].forEach(function (i) {
        out.push(line(hx + side * r * .3, my - r * .02 + i * r * .06, hx + side * r * .78, my - r * .14 + i * r * .13, { stroke: INK, 'stroke-width': 2, 'stroke-linecap': 'round' }));
      });
    });
    var mouthY = ny + r * (nz === 'snout' ? .3 : .2);
    // A koi's barbels, from the corners of its mouth.
    if (HD.barbels) [-1, 1].forEach(function (side) {
      out.push(pth('M' + n(hx + side * r * .1) + ',' + n(mouthY) + ' Q' + n(hx + side * r * .3) + ',' + n(mouthY) + ' ' + n(hx + side * r * .34) + ',' + n(mouthY + r * .24),
        { fill: 'none', stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round' }));
    });
    mouthArt(out, MO, hx, ny, mouthY, r, my, hy, ry, C);
    nose(out, nz, hx, ny, r, C, hy, ry, headFill);
    return out;
  }

  function svgNode(c, opts) {
    opts = opts || {};
    var kids = nodes(c, opts.prefix);
    if (!kids) return null;
    // Its own ground, the table's white, wherever it is not already on the
    // table: on the radio, in a profile, on a sticker, in a download. An
    // avatar carries its own ground for the same reason, so a dark theme
    // never swallows its outline.
    if (opts.ground) kids.unshift(rect(0, 0, 400, 460, { rx: 28, fill: 'var(--chm-table)' }));
    var a = {};
    if (opts.cls) a['class'] = opts.cls;
    a.viewBox = '0 0 400 460';
    if (opts.width) a.width = opts.width;
    if (opts.height) a.height = opts.height;
    a['aria-hidden'] = 'true';
    a.focusable = 'false';
    return N('svg', a, kids);
  }

  /* In a page: an <svg> element, built with createElementNS. opts: prefix
     (for every id inside it, so two chimeras on one page never share a clip),
     cls, ground (the table's white behind it), and width/height if wanted. */
  function draw(c, opts) {
    var node = svgNode(c, opts);
    if (!node || !root.document) return null;
    node.a.xmlns = SVGNS;
    return toDom(node, root.document);
  }
  /* At build time, under Node: the same drawing as a string. */
  function svg(c, opts) { var node = svgNode(c, opts); return node ? toStr(node) : ''; }
  function inner(c, prefix) { var k = nodes(c, prefix); return k ? k.map(toStr).join('') : ''; }

  /* ── Checking, words and names ───────────────────────────────────────── */
  var own = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };

  /* Only a chimera made of animals on the shelf, every part present and
     nothing else. A back is 'none' or an animal that has one. A part with
     defaults_to (arms and feet) may be missing, and takes that part's animal:
     what was kept before it was a part of its own. */
  function clean(c) {
    if (!c || typeof c !== 'object' || Array.isArray(c)) return null;
    var out = {};
    for (var i = 0; i < SLOTS.length; i++) {
      var k = SLOTS[i], v = own(c, k) ? c[k] : (own(DEFAULTS, k) && own(c, DEFAULTS[k]) ? c[DEFAULTS[k]] : undefined);
      if (typeof v !== 'string') return null;
      if (k === 'back') {
        if (v !== 'none' && !(own(A, v) && A[v].back)) return null;
      } else if (!own(A, v)) return null;
      out[k] = v;
    }
    var extra = Object.keys(c).filter(function (key) { return SLOTS.indexOf(key) === -1; });
    return extra.length ? null : out;
  }

  /* The animal, other than the body's, that gave the most parts; a tie goes
     to whichever gave the earlier part. */
  function second(p) {
    var count = {}, best = null;
    SLOTS.forEach(function (k) {
      var v = p[k];
      if (k === 'body' || v === 'none' || v === p.body) return;
      count[v] = (count[v] || 0) + 1;
    });
    SLOTS.forEach(function (k) {
      var v = p[k];
      if (v && count[v] && (!best || count[v] > count[best])) best = v;
    });
    return best;
  }

  /* The name the room suggests: the body's animal, then the second animal,
     joined where they share a letter. tools/make-chimera-obscura.py works
     every one of these out and refuses a name that is Randimals' or that
     carries a word nobody should be called. */
  function suggest(c) {
    var p = clean(c);
    if (!p) return '';
    var d = second(p);
    if (!d) return A[p.body].say[0];
    var known = (SHELF.known || {})[p.body + '+' + d];
    if (known) return known;
    var tail = A[d].say[1], vowel = /^[aeiou]/.test(tail);
    var head = vowel && A[p.body].say[2] ? A[p.body].say[2] : A[p.body].say[0];
    if (head.slice(-1).toLowerCase() === tail[0]) head = head.slice(0, -1);
    return head + tail;
  }

  /* Which animal gave which part, in words, for the live line beside the
     table, for a sticker's caption, and for anybody who cannot see the
     drawing. */
  function words(c) {
    var p = clean(c);
    if (!p) return '';
    var by = {}, order = [];
    (SHELF.slots || []).forEach(function (s) {
      var v = p[s.key];
      if (v === 'none') return;
      if (!by[v]) { by[v] = []; order.push(v); }
      by[v].push(s.word);
    });
    var out = order.map(function (an) {
      var ws = by[an], list = ws.length > 1 ? ws.slice(0, -1).join(', ') + ' and ' + ws[ws.length - 1] : ws[0];
      return 'the ' + list + ' of ' + A[an].a + ' ' + word(an);
    }).join('; ');
    return out.charAt(0).toUpperCase() + out.slice(1) + '.';
  }

  /* What an animal is called, where its key (which goes into an address and
     so is letters only) is not the word: a Highland cow. */
  function word(an) { return own(A, an) ? A[an].word || an : an; }

  /* A chimera as a few letters for an address, after the #, and back. The
     parts in the shelf's order, by animal, separated by dots. When every
     defaulted part is its default (arms and feet the body's), those parts
     are left out, so a chimera linked before they were parts of their own
     has the same address now. */
  function code(c) {
    var p = clean(c);
    if (!p) return '';
    var plain = Object.keys(DEFAULTS).every(function (k) { return p[k] === p[DEFAULTS[k]]; });
    return SLOTS.filter(function (k) { return !(plain && own(DEFAULTS, k)); }).map(function (k) { return p[k]; }).join('.');
  }
  function uncode(s) {
    if (typeof s !== 'string' || !/^[a-z.]{3,400}$/.test(s)) return null;
    var bits = s.split('.');
    // An address made before arms and feet were parts of their own has
    // every part but those, in the same order.
    var keys = bits.length === SLOTS.length ? SLOTS : SLOTS.filter(function (k) { return !own(DEFAULTS, k); });
    if (bits.length !== keys.length) return null;
    var c = {};
    keys.forEach(function (k, i) { c[k] = bits[i]; });
    return clean(c);
  }

  root.loveChimera = {
    draw: draw, svg: svg, inner: inner, clean: clean, words: words, suggest: suggest,
    second: second, code: code, uncode: uncode, word: word,
    slots: SHELF.slots || [], animals: Object.keys(A), groups: SHELF.groups || [],
    group: function (an) { return own(A, an) ? A[an].group : ''; },
    hasBack: function (an) { return !!(own(A, an) && A[an].back); },
    article: function (an) { return own(A, an) ? A[an].a : 'a'; },
    presets: SHELF.presets || [], opensOn: SHELF.opensOn || ''
  };
})(typeof window !== 'undefined' ? window : globalThis);
