/* =============================================================================
   The avatars, drawn: every bodymind made at the Bodymind Booth, everything put
   on it at the Dopamine Dress-Up Den, and the Den's valet stand for an avatar
   with no body in it. One file, so an avatar cannot be drawn one way in the
   booth, another in the Den, and a third in somebody's Profile, on Who's
   online or on a sticker -- animals.js's rule, for people.

   AN AVATAR IS A LIST OF CHOICES, NEVER A PICTURE. What is kept, sent and
   shown is the look (base, body, wear), every value a key out of the lists
   below, and this file draws it fresh wherever it goes. clean() takes nothing
   it does not know, so no word anybody typed ever reaches the drawing; names
   and descriptions travel beside it and are never put inside it.

   THE DRAWING IS SILENT. Every <svg> this makes is aria-hidden. Whoever shows
   one says what it is in words: the booth reads the owner's own choices back to
   them while they build (words()), and everywhere else an avatar says only what
   its owner wrote about it, because nothing here describes a body for somebody
   else.

   THE LISTS ARE GENERATED. Everything between the avatar:data markers is
   written by tools/make-bodymind.py out of data/bodymind.json and
   data/dressup.json, and the same keys go into netlify/cb/lib.mjs, which checks
   every avatar kept against them. Add a choice to the data file and run the
   tool; a choice that has no drawing here is refused by tools/avatar.test.mjs,
   which draws every one of them in every pose.

   EVERY GARMENT IS DRAWN FROM THE BODY IT IS ON. Nothing below is a picture of
   a garment on one body: each is worked out from the shoulders, middle, hips,
   height and pose it is put on, so a cardigan fits whoever is wearing it, on
   their feet or sitting down. A garment the Dress-Up Den hangs on its rails and
   this file cannot put on a body in both poses is a refusal, not a gap.

   NOTHING MOVES, AND NOTHING HERE STORES OR SENDS ANYTHING. It draws.
   ============================================================================= */
(function (root) {
  'use strict';

/* avatar:data:begin */
  var DATA = {"ink":"#1E1030","ground":{"stand":"#D2C6EC","bodymind":"#E98A45"},"slots":["head","outer","top","bottom","feet","boa","scarf","wings","ears","face","tail","paws","neck","wrists","held","suit"],"garments":{"head":["slouchy-beanie","beanie","wide-brim","headscarf","wig","witch-hat","tricorne","clown-hat"],"outer":["haori","cardigan","hoodie","cape","sequin-jacket","vampire-cape","wizard-robe"],"top":["button-down","tee","corset","flowing-dress","gown"],"bottom":["fisherman","skirt","wide-leg","leggings"],"feet":["platforms","slip-ons","crocs","hi-tops","socks","clown-shoes"],"boa":["boa"],"scarf":["scarf"],"wings":["dragonfly-wings","butterfly-wings","moth-wings","great-wings","bat-wings"],"ears":["cat-ears","fox-ears","bunny-ears","bear-ears","mouse-ears","wolf-ears","bat-ears"],"face":["vampire-fangs","clown-face","whisker-paint","skull-face"],"tail":["cat-tail","fox-tail","bunny-tail","bear-tail","dragon-tail","unicorn-tail","wolf-tail"],"paws":["cat-paws","bear-paws","dragon-claws","wolf-claws"],"neck":["bead-necklace","chunky-beads","pendant","choker","neck-bolts","web-choker"],"wrists":["rings","bead-bracelets","bangles","spider-rings","bone-bangles"],"held":["wizard-staff","witch-broom","magic-wand","lantern","treat-bucket"],"suit":["onesie","tiger-suit","bear-suit","dragon-suit","unicorn-suit","chimera-onesie","mummy-wraps","skeleton-suit","ghost-suit","pumpkin-suit","bat-suit","clown-suit","pirate-outfit","vampire-suit"]},"bodyOnly":["wings","ears","face","tail","paws","neck","wrists","held","suit"],"names":{"slouchy-beanie":"a slouchy beanie","beanie":"a beanie","wide-brim":"a wide-brimmed hat","headscarf":"a headscarf","wig":"a big wig","witch-hat":"a witch hat","tricorne":"a pirate hat","clown-hat":"a clown hat","haori":"a haori","cardigan":"a cardigan","hoodie":"a zip hoodie","cape":"a velvet cape","sequin-jacket":"a sequin jacket","vampire-cape":"a vampire cape","wizard-robe":"a wizard robe","button-down":"a button-down shirt","tee":"a T-shirt","corset":"a corset top","flowing-dress":"a flowing dress","gown":"a sequin gown","fisherman":"Thai fisherman pants","skirt":"a flowing skirt","wide-leg":"wide-leg trousers","leggings":"leggings","platforms":"platform boots","slip-ons":"canvas slip-ons","crocs":"Crocs","hi-tops":"hi-top trainers","socks":"just socks","clown-shoes":"clown shoes","boa":"a feather boa","scarf":"a long scarf","dragonfly-wings":"dragonfly wings","butterfly-wings":"butterfly wings","moth-wings":"moth wings","great-wings":"great faery wings","bat-wings":"bat wings","cat-ears":"cat ears","fox-ears":"fox ears","bunny-ears":"bunny ears","bear-ears":"bear ears","mouse-ears":"mouse ears","wolf-ears":"wolf ears","bat-ears":"bat ears","vampire-fangs":"vampire fangs","clown-face":"clown face paint","whisker-paint":"whisker face paint","skull-face":"skull face paint","cat-tail":"a cat tail","fox-tail":"a fox tail","bunny-tail":"a bunny tail","bear-tail":"a bear tail","dragon-tail":"a dragon tail","unicorn-tail":"a unicorn tail","wolf-tail":"a wolf tail","cat-paws":"cat paws","bear-paws":"bear paws","dragon-claws":"dragon claws","wolf-claws":"wolf claws","bead-necklace":"a bead necklace","chunky-beads":"chunky beads","pendant":"a pendant","choker":"a velvet choker","neck-bolts":"neck bolts","web-choker":"a spiderweb choker","rings":"rings","bead-bracelets":"bead bracelets","bangles":"bangles","spider-rings":"spider rings","bone-bangles":"bone bangles","wizard-staff":"a wizard staff","witch-broom":"a witch broom","magic-wand":"a magic wand","lantern":"a lantern","treat-bucket":"a treat bucket","onesie":"a onesie","tiger-suit":"a tiger suit","bear-suit":"a bear suit","dragon-suit":"a dragon suit","unicorn-suit":"a unicorn suit","chimera-onesie":"a chimera onesie","mummy-wraps":"mummy wraps","skeleton-suit":"a skeleton suit","ghost-suit":"a ghost suit","pumpkin-suit":"a pumpkin suit","bat-suit":"a bat suit","clown-suit":"a clown suit","pirate-outfit":"a pirate outfit","vampire-suit":"a vampire suit"},"prints":{"solid":[20,20,"<rect x=\"0\" y=\"0\" width=\"20\" height=\"20\" fill=\"var(--g)\"/>"],"stripes":[36,36,"<rect x=\"0\" y=\"0\" width=\"36\" height=\"6\" fill=\"var(--c1)\"/><rect x=\"0\" y=\"6\" width=\"36\" height=\"6\" fill=\"var(--c2)\"/><rect x=\"0\" y=\"12\" width=\"36\" height=\"6\" fill=\"var(--c3)\"/><rect x=\"0\" y=\"18\" width=\"36\" height=\"6\" fill=\"var(--c4)\"/><rect x=\"0\" y=\"24\" width=\"36\" height=\"6\" fill=\"var(--c5)\"/><rect x=\"0\" y=\"30\" width=\"36\" height=\"6\" fill=\"var(--c6)\"/>"],"dots":[42,42,"<rect x=\"0\" y=\"0\" width=\"42\" height=\"42\" fill=\"var(--g)\"/><circle cx=\"7\" cy=\"7\" r=\"4.4\" fill=\"var(--f1)\"/><circle cx=\"28\" cy=\"7\" r=\"4.4\" fill=\"var(--f2)\"/><circle cx=\"17.5\" cy=\"21\" r=\"4.4\" fill=\"var(--f3)\"/><circle cx=\"38.5\" cy=\"21\" r=\"4.4\" fill=\"var(--f4)\"/><circle cx=\"7\" cy=\"35\" r=\"4.4\" fill=\"var(--f5)\"/><circle cx=\"28\" cy=\"35\" r=\"4.4\" fill=\"var(--f1)\"/>"],"gingham":[24,24,"<rect x=\"0\" y=\"0\" width=\"24\" height=\"24\" fill=\"var(--g)\"/><rect x=\"0\" y=\"0\" width=\"12\" height=\"24\" fill=\"var(--f1)\" opacity=\".55\"/><rect x=\"0\" y=\"0\" width=\"24\" height=\"12\" fill=\"var(--f1)\" opacity=\".55\"/>"],"floral":[60,60,"<rect x=\"0\" y=\"0\" width=\"60\" height=\"60\" fill=\"var(--g)\"/><ellipse cx=\"31\" cy=\"24\" rx=\"6\" ry=\"2.8\" fill=\"var(--f2)\"/><ellipse cx=\"28\" cy=\"46\" rx=\"6\" ry=\"2.8\" fill=\"var(--f4)\"/><circle cx=\"15.0\" cy=\"9.0\" r=\"5.6\" fill=\"var(--f1)\"/><circle cx=\"21.7\" cy=\"13.8\" r=\"5.6\" fill=\"var(--f1)\"/><circle cx=\"19.1\" cy=\"21.7\" r=\"5.6\" fill=\"var(--f1)\"/><circle cx=\"10.9\" cy=\"21.7\" r=\"5.6\" fill=\"var(--f1)\"/><circle cx=\"8.3\" cy=\"13.8\" r=\"5.6\" fill=\"var(--f1)\"/><circle cx=\"15\" cy=\"16\" r=\"3.8\" fill=\"var(--f2)\"/><circle cx=\"45.0\" cy=\"35.0\" r=\"5.6\" fill=\"var(--f3)\"/><circle cx=\"51.7\" cy=\"39.8\" r=\"5.6\" fill=\"var(--f3)\"/><circle cx=\"49.1\" cy=\"47.7\" r=\"5.6\" fill=\"var(--f3)\"/><circle cx=\"40.9\" cy=\"47.7\" r=\"5.6\" fill=\"var(--f3)\"/><circle cx=\"38.3\" cy=\"39.8\" r=\"5.6\" fill=\"var(--f3)\"/><circle cx=\"45\" cy=\"42\" r=\"3.8\" fill=\"var(--f4)\"/><circle cx=\"47\" cy=\"11\" r=\"2.2\" fill=\"var(--f5)\"/>"],"blocks":[120,80,"<rect x=\"0\" y=\"0\" width=\"40\" height=\"40\" fill=\"var(--c1)\"/><rect x=\"40\" y=\"0\" width=\"40\" height=\"40\" fill=\"var(--c2)\"/><rect x=\"80\" y=\"0\" width=\"40\" height=\"40\" fill=\"var(--c3)\"/><rect x=\"0\" y=\"40\" width=\"40\" height=\"40\" fill=\"var(--c4)\"/><rect x=\"40\" y=\"40\" width=\"40\" height=\"40\" fill=\"var(--c5)\"/><rect x=\"80\" y=\"40\" width=\"40\" height=\"40\" fill=\"var(--c6)\"/>"],"patchwork":[72,72,"<rect x=\"0\" y=\"0\" width=\"24\" height=\"24\" fill=\"var(--c1)\"/><rect x=\"24\" y=\"0\" width=\"24\" height=\"24\" fill=\"var(--c2)\"/><rect x=\"48\" y=\"0\" width=\"24\" height=\"24\" fill=\"var(--c3)\"/><rect x=\"0\" y=\"24\" width=\"24\" height=\"24\" fill=\"var(--c4)\"/><rect x=\"24\" y=\"24\" width=\"24\" height=\"24\" fill=\"var(--c5)\"/><rect x=\"48\" y=\"24\" width=\"24\" height=\"24\" fill=\"var(--c6)\"/><rect x=\"0\" y=\"48\" width=\"24\" height=\"24\" fill=\"var(--c3)\"/><rect x=\"24\" y=\"48\" width=\"24\" height=\"24\" fill=\"var(--c1)\"/><rect x=\"48\" y=\"48\" width=\"24\" height=\"24\" fill=\"var(--c2)\"/><circle cx=\"8\" cy=\"8\" r=\"2.2\" fill=\"var(--f1)\"/><circle cx=\"16\" cy=\"16\" r=\"2.2\" fill=\"var(--f1)\"/><path d=\"M24 0 V72 M48 0 V72 M0 24 H72 M0 48 H72\" fill=\"none\" stroke=\"var(--dd-ink, #1E1030)\" stroke-width=\"1\" stroke-dasharray=\"3 3\" opacity=\".7\"/>"],"moons":[48,48,"<rect x=\"0\" y=\"0\" width=\"48\" height=\"48\" fill=\"var(--g)\"/><path d=\"M16 8 A9 9 0 1 0 24 24 A7 7 0 1 1 16 8 Z\" fill=\"var(--f1)\"/><path d=\"M36 26 L38 32 L44 34 L38 36 L36 42 L34 36 L28 34 L34 32 Z\" fill=\"var(--f2)\"/><circle cx=\"40\" cy=\"10\" r=\"1.6\" fill=\"var(--f2)\"/><circle cx=\"10\" cy=\"40\" r=\"1.6\" fill=\"var(--f1)\"/>"],"sequins":[12,10,"<rect x=\"0\" y=\"0\" width=\"12\" height=\"10\" fill=\"var(--g)\"/><circle cx=\"3\" cy=\"3\" r=\"3.2\" fill=\"var(--f1)\" stroke=\"var(--g)\" stroke-width=\".6\"/><circle cx=\"9\" cy=\"8\" r=\"3.2\" fill=\"var(--f2)\" stroke=\"var(--g)\" stroke-width=\".6\"/>"],"bats":[48,40,"<rect x=\"0\" y=\"0\" width=\"48\" height=\"40\" fill=\"var(--g)\"/><path d=\"M3 11 Q8 5 12 10 L14 7 L16 10 Q20 5 25 11 Q22 12 21 15 Q19 13 17 15 Q15 14 14 16 Q13 14 11 15 Q9 13 7 15 Q6 12 3 11 Z\" fill=\"var(--f1)\"/><path d=\"M26 29 Q31 23 35 28 L37 25 L39 28 Q43 23 48 29 Q45 30 44 33 Q42 31 40 33 Q38 32 37 34 Q36 32 34 33 Q32 31 30 33 Q29 30 26 29 Z\" fill=\"var(--f2)\"/>"],"webs":[48,48,"<rect x=\"0\" y=\"0\" width=\"48\" height=\"48\" fill=\"var(--g)\"/><path d=\"M24 24 L46.0 24.0 M24 24 L39.6 39.6 M24 24 L24.0 46.0 M24 24 L8.4 39.6 M24 24 L2.0 24.0 M24 24 L8.4 8.4 M24 24 L24.0 2.0 M24 24 L39.6 8.4 M31.0 24.0 29.0 29.0 24.0 31.0 19.0 29.0 17.0 24.0 19.0 19.0 24.0 17.0 29.0 19.0 Z M37.6 24.0 33.6 33.6 24.0 37.6 14.4 33.6 10.4 24.0 14.4 14.4 24.0 10.4 33.6 14.4 Z M44.2 24.0 38.3 38.3 24.0 44.2 9.7 38.3 3.8 24.0 9.7 9.7 24.0 3.8 38.3 9.7 Z\" fill=\"none\" stroke=\"var(--f1)\" stroke-width=\"1.1\"/>"],"pumpkins":[52,44,"<rect x=\"0\" y=\"0\" width=\"52\" height=\"44\" fill=\"var(--g)\"/><rect x=\"13.5\" y=\"3\" width=\"3\" height=\"5\" fill=\"var(--f2)\"/><ellipse cx=\"10\" cy=\"14\" rx=\"6\" ry=\"7.5\" fill=\"var(--f1)\"/><ellipse cx=\"20\" cy=\"14\" rx=\"6\" ry=\"7.5\" fill=\"var(--f1)\"/><ellipse cx=\"15\" cy=\"14\" rx=\"5.5\" ry=\"8\" fill=\"var(--f1)\" stroke=\"var(--g)\" stroke-width=\".8\"/><rect x=\"39.5\" y=\"23\" width=\"3\" height=\"5\" fill=\"var(--f2)\"/><ellipse cx=\"36\" cy=\"34\" rx=\"6\" ry=\"7.5\" fill=\"var(--f1)\"/><ellipse cx=\"46\" cy=\"34\" rx=\"6\" ry=\"7.5\" fill=\"var(--f1)\"/><ellipse cx=\"41\" cy=\"34\" rx=\"5.5\" ry=\"8\" fill=\"var(--f1)\" stroke=\"var(--g)\" stroke-width=\".8\"/>"]},"printA":{"solid":"plain","floral":"in bold florals","blocks":"in big blocks of colour","patchwork":"in patchwork","stripes":"in stripes","dots":"in polka dots","gingham":"in gingham","moons":"in moons and stars","sequins":"in sequins","bats":"with bats","webs":"in spiderwebs","pumpkins":"with pumpkins"},"colourways":{"rainbow":{"name":"all the colours there are","inks":["tomato","marigold","lime","turquoise","indigo","violet"]},"marigold-teal":{"name":"marigold and teal","inks":["marigold","teal","cream"]},"pink-lime":{"name":"hot pink and lime","inks":["hotpink","lime","cream"]},"tomato-turquoise":{"name":"tomato and turquoise","inks":["tomato","turquoise","gold"]},"indigo-cream":{"name":"indigo and cream","inks":["indigo","cream","sky"]},"violet-gold":{"name":"violet and gold","inks":["violet","gold","plum"]},"mint-coral":{"name":"mint and coral","inks":["mint","coral","cream"]},"moss-rust":{"name":"moss and rust","inks":["moss","rust","marigold"]},"denim-sky":{"name":"denim and sky","inks":["denim","sky","cream"]},"midnight-gold":{"name":"midnight and gold","inks":["indigo","gold","cream"]},"pumpkin-black":{"name":"pumpkin and black","inks":["pumpkin","black","marigold"]},"candy-corn":{"name":"candy corn","inks":["marigold","pumpkin","cream"]},"bone-black":{"name":"bone and black","inks":["cream","black","coal"]},"slime-violet":{"name":"slime and violet","inks":["lime","violet","black"]},"plum-black":{"name":"plum and black","inks":["plum","black","violet"]},"black-silver":{"name":"black and silver","inks":["black","silver","coal"]},"black":{"name":"all black","inks":["black","coal"]}},"inks":{"tomato":"#E5432F","marigold":"#F2A900","lime":"#9BD93A","turquoise":"#2BC4C0","indigo":"#28307A","violet":"#7B3FC4","teal":"#0F7C7A","cream":"#F6EBD2","hotpink":"#FF3D8B","gold":"#E8B923","sky":"#7EC8F2","plum":"#6B1F5C","mint":"#9FE2BF","coral":"#FF7F66","moss":"#5E7A2E","rust":"#A8481F","denim":"#3E5F8A","black":"#141414","silver":"#C9CCD3","coal":"#34343B","pumpkin":"#F07A1A"},"inkNames":{"tomato":"tomato","marigold":"marigold","lime":"lime","turquoise":"turquoise","indigo":"indigo","violet":"violet","teal":"teal","cream":"cream","hotpink":"hot pink","gold":"gold","sky":"sky blue","plum":"plum","mint":"mint","coral":"coral","moss":"moss","rust":"rust","denim":"denim","black":"black","silver":"silver","coal":"charcoal","pumpkin":"pumpkin orange"},"stand":{"wood":"<rect fill=\"#7A4B2E\" stroke=\"#1E1030\" stroke-width=\"2\" x=\"195\" y=\"96\" width=\"10\" height=\"484\" rx=\"3\"/><circle fill=\"#7A4B2E\" stroke=\"#1E1030\" stroke-width=\"2\" cx=\"200\" cy=\"86\" r=\"14\"/><path fill=\"#7A4B2E\" stroke=\"#1E1030\" stroke-width=\"2\" d=\"M84 176 Q200 128 316 176 L316 186 Q200 140 84 186 Z\"/><rect fill=\"#7A4B2E\" stroke=\"#1E1030\" stroke-width=\"2\" x=\"118\" y=\"318\" width=\"164\" height=\"9\" rx=\"4\"/><rect fill=\"#7A4B2E\" stroke=\"#1E1030\" stroke-width=\"2\" x=\"110\" y=\"578\" width=\"180\" height=\"14\" rx=\"7\"/>","cuts":{"slouchy-beanie":"<path fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M166 104 Q160 58 196 46 Q238 36 258 66 Q272 94 250 120 Q240 106 234 100 Z\"/><path fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M164 92 Q200 104 236 94 L236 110 Q200 120 164 108 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M176 97 V112 M188 100 V115 M200 101 V116 M212 100 V115 M224 98 V112\"/>","beanie":"<path fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M170 96 Q170 52 200 50 Q230 52 230 96 Z\"/><path fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M164 90 H236 V110 H164 Z\"/><circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"200\" cy=\"44\" r=\"11\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M176 92 V108 M188 92 V108 M200 92 V108 M212 92 V108 M224 92 V108\"/>","wide-brim":"<path fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M172 100 Q174 70 190 46 Q198 30 206 40 Q210 64 228 100 Q200 106 172 100 Z\"/><path fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M122 104 Q200 84 278 104 Q200 124 122 104 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M175 94 Q200 100 226 94\"/>","headscarf":"<path fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M226 100 Q248 108 252 138 L240 142 Q236 118 222 106 Z\"/><path fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M228 100 Q256 100 266 122 L256 128 Q246 110 226 106 Z\"/><path fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M166 104 Q162 58 200 54 Q238 58 234 104 Q200 114 166 104 Z\"/><circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"228\" cy=\"102\" r=\"7\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M172 82 Q200 72 228 82\"/>","wig":"<circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"200\" cy=\"98\" r=\"50\"/><circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"160\" cy=\"138\" r=\"17\"/><circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"240\" cy=\"138\" r=\"17\"/><circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"150\" cy=\"112\" r=\"19\"/><circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"250\" cy=\"112\" r=\"19\"/><circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"152\" cy=\"84\" r=\"20\"/><circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"248\" cy=\"84\" r=\"20\"/><circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"172\" cy=\"60\" r=\"20\"/><circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"228\" cy=\"60\" r=\"20\"/><circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"200\" cy=\"50\" r=\"21\"/><circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"182\" cy=\"74\" r=\"18\"/><circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"218\" cy=\"74\" r=\"18\"/><circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"200\" cy=\"84\" r=\"18\"/><circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"178\" cy=\"104\" r=\"16\"/><circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"222\" cy=\"104\" r=\"16\"/>","witch-hat":"<path fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M170 102 Q178 70 190 44 Q198 22 214 18 Q232 16 240 30 Q226 26 218 34 Q214 66 230 102 Z\"/><path fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M112 106 Q200 82 288 106 Q200 128 112 106 Z\"/><path fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M172 92 Q200 98 228 92 L230 102 Q200 108 170 102 Z\"/><rect fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" x=\"192\" y=\"91\" width=\"16\" height=\"12\" rx=\"2\"/>","tricorne":"<path fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M160 96 Q164 58 200 56 Q236 58 240 96 Z\"/><path fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M120 92 Q158 54 200 66 Q242 54 280 92 L200 124 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M128 90 Q160 62 200 72 Q240 62 272 90\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"150\" cy=\"88\" r=\"6\"/>","clown-hat":"<path fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M176 100 L224 100 L206 28 Z\"/><circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"207\" cy=\"24\" r=\"9\"/><circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"204\" cy=\"56\" r=\"6\"/><circle fill=\"url(#@P@-head)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"200\" cy=\"80\" r=\"6\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M172 104 Q200 112 228 104\"/>","haori":"<path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M104 168 L50 178 L46 304 Q70 318 100 304 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 296 168 L 350 178 L 354 304 Q 330 318 300 304 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M168 150 L104 168 L98 366 H172 Q170 260 184 170 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 232 150 L 296 168 L 302 366 H 228 Q 230 260 216 170 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M166 150 L176 150 Q192 200 182 366 L172 366 Q180 200 166 150 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 234 150 L 224 150 Q 208 200 218 366 L 228 366 Q 220 200 234 150 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M182 240 Q200 250 218 240\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"200\" cy=\"247\" r=\"4\"/>","cardigan":"<path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M104 168 L84 176 L64 336 L94 342 L112 230 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 296 168 L 316 176 L 336 336 L 306 342 L 288 230 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M64 336 L94 342 L92 356 L62 350 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 336 336 L 306 342 L 308 356 L 338 350 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M172 150 L104 168 L100 404 H184 L188 176 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 228 150 L 296 168 L 300 404 H 216 L 212 176 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M112 392 V404 M124 392 V404 M136 392 V404 M148 392 V404 M160 392 V404 M172 392 V404 M228 392 V404 M240 392 V404 M252 392 V404 M264 392 V404 M276 392 V404 M288 392 V404\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M118 318 H164 V356 H118 Z M236 318 H282 V356 H236 Z\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"179\" cy=\"212\" r=\"3.4\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"179\" cy=\"252\" r=\"3.4\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"179\" cy=\"292\" r=\"3.4\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"179\" cy=\"332\" r=\"3.4\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"179\" cy=\"372\" r=\"3.4\"/>","hoodie":"<path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M146 158 Q150 112 200 108 Q250 112 254 158 Q228 146 200 148 Q172 146 146 158 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M106 170 L84 178 L64 338 L94 344 L112 232 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 294 170 L 316 178 L 336 338 L 306 344 L 288 232 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M64 338 L94 344 L92 358 L62 352 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 336 338 L 306 344 L 308 358 L 338 352 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M146 156 L106 170 L108 354 Q200 362 292 354 L294 170 L254 156 Q230 168 200 170 Q170 168 146 156 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M200 170 V360 M152 296 L192 290 V338 H152 Z M248 296 L208 290 V338 H248 Z M108 340 Q200 348 292 340 M188 170 V206 M212 170 V206\"/><rect fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" x=\"196\" y=\"184\" width=\"8\" height=\"13\" rx=\"2\"/>","cape":"<path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M168 144 L98 178 Q58 332 50 474 Q110 488 170 480 Q178 320 190 158 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 232 144 L 302 178 Q 342 332 350 474 Q 290 488 230 480 Q 222 320 210 158 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M168 144 Q200 128 232 144 L226 160 Q200 150 174 160 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M112 260 Q96 380 88 476 M288 260 Q304 380 312 476\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"200\" cy=\"158\" r=\"6\"/>","sequin-jacket":"<path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M106 168 L86 176 L70 318 L98 322 L112 226 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 294 168 L 314 176 L 330 318 L 302 322 L 288 226 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M170 150 L106 168 L106 300 H194 L192 180 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 230 150 L 294 168 L 294 300 H 206 L 208 180 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M170 150 L192 180 L178 216 L160 170 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 230 150 L 208 180 L 222 216 L 240 170 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M112 290 H192 M208 290 H288\"/>","vampire-cape":"<path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M150 120 L118 70 Q150 92 182 140 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 250 120 L 282 70 Q 250 92 218 140 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M168 144 L96 180 Q66 380 60 566 H184 Q182 340 190 158 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 232 144 L 304 180 Q 334 380 340 566 H 216 Q 218 340 210 158 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M168 144 Q200 128 232 144 L226 160 Q200 150 174 160 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M178 170 Q174 360 180 560 M222 170 Q226 360 220 560\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"200\" cy=\"158\" r=\"7\"/>","wizard-robe":"<path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M106 168 L58 178 L28 330 Q62 346 108 330 L112 230 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 294 168 L 342 178 L 372 330 Q 338 346 292 330 L 288 230 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M170 150 L106 168 Q100 380 96 566 H186 Q188 340 192 176 Z\"/><path fill=\"url(#@P@-outer)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 230 150 L 294 168 Q 300 380 304 566 H 214 Q 212 340 208 176 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M186 176 V560 M214 176 V560 M44 318 Q68 330 104 318 M296 318 Q332 330 356 318\"/>","button-down":"<path fill=\"url(#@P@-top)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M100 172 L80 180 L66 322 L94 326 L108 222 Z\"/><path fill=\"url(#@P@-top)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 300 172 L 320 180 L 334 322 L 306 326 L 292 222 Z\"/><path fill=\"url(#@P@-top)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M66 322 L94 326 L92 340 L64 336 Z\"/><path fill=\"url(#@P@-top)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 334 322 L 306 326 L 308 340 L 336 336 Z\"/><path fill=\"url(#@P@-top)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M134 156 L100 172 L104 338 Q200 348 296 338 L300 172 L266 156 L234 150 L200 182 L166 150 Z\"/><path fill=\"url(#@P@-top)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M166 150 L200 182 L186 194 L156 164 Z\"/><path fill=\"url(#@P@-top)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 234 150 L 200 182 L 214 194 L 244 164 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M200 182 V344 M222 214 H254 V240 H222 Z\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"200\" cy=\"206\" r=\"3.2\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"200\" cy=\"236\" r=\"3.2\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"200\" cy=\"266\" r=\"3.2\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"200\" cy=\"296\" r=\"3.2\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"200\" cy=\"326\" r=\"3.2\"/>","tee":"<path fill=\"url(#@P@-top)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M104 170 L76 214 L100 232 L108 214 Z\"/><path fill=\"url(#@P@-top)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 296 170 L 324 214 L 300 232 L 292 214 Z\"/><path fill=\"url(#@P@-top)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M132 156 L104 170 L106 336 Q200 346 294 336 L296 170 L268 156 Q240 152 230 156 Q200 182 170 156 Q160 152 132 156 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M170 156 Q200 188 230 156\"/>","corset":"<path fill=\"url(#@P@-top)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M150 162 L158 152 L166 156 L164 200 L156 200 Z\"/><path fill=\"url(#@P@-top)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 250 162 L 242 152 L 234 156 L 236 200 L 244 200 Z\"/><path fill=\"url(#@P@-top)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M146 196 Q170 180 200 188 Q230 180 254 196 Q240 262 258 336 Q200 348 142 336 Q160 262 146 196 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M170 190 Q164 262 170 340 M230 190 Q236 262 230 340 M192 202 L208 216 L192 230 L208 244 L192 258 L208 272 L192 286 L208 300 L192 314 L208 328\"/>","flowing-dress":"<path fill=\"url(#@P@-top)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M110 172 L82 206 Q94 222 114 214 Z\"/><path fill=\"url(#@P@-top)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 290 172 L 318 206 Q 306 222 286 214 Z\"/><path fill=\"url(#@P@-top)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M134 156 L110 172 Q120 250 106 306 Q76 420 58 482 Q200 504 342 482 Q324 420 294 306 Q280 250 290 172 L266 156 Q238 152 228 158 Q200 184 172 158 Q162 152 134 156 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M114 262 Q200 274 286 262 M150 320 Q136 400 120 488 M200 280 V500 M250 320 Q264 400 280 488\"/>","gown":"<path fill=\"url(#@P@-top)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M150 162 L156 148 L164 150 L162 170 Z\"/><path fill=\"url(#@P@-top)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M 250 162 L 244 148 L 236 150 L 238 170 Z\"/><path fill=\"url(#@P@-top)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M150 162 Q162 200 146 246 Q160 300 146 340 Q106 440 74 548 Q200 568 326 548 Q294 440 254 340 Q240 300 254 246 Q238 200 250 162 Q226 176 200 176 Q174 176 150 162 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M120 470 Q110 510 104 552 M280 470 Q290 510 296 552 M200 360 V560\"/>","fisherman":"<path fill=\"url(#@P@-bottom)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M104 330 H296 L304 376 L302 566 H214 L204 414 H196 L186 566 H98 L96 376 Z\"/><path fill=\"url(#@P@-bottom)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M100 310 H300 L304 348 H96 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M194 350 Q186 366 190 382 M206 350 Q214 366 210 382 M100 552 H186 M214 552 H300\"/><circle fill=\"url(#@P@-bottom)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"200\" cy=\"350\" r=\"6\"/>","skirt":"<path fill=\"url(#@P@-bottom)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M128 312 H272 Q298 430 324 560 Q200 576 76 560 Q102 430 128 312 Z\"/><path fill=\"url(#@P@-bottom)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M126 310 H274 V330 H126 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M160 330 Q146 440 130 566 M200 330 V572 M240 330 Q254 440 270 566\"/>","wide-leg":"<path fill=\"url(#@P@-bottom)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M120 324 H280 L298 566 H212 L202 406 H198 L188 566 H102 Z\"/><path fill=\"url(#@P@-bottom)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M118 310 H282 V330 H118 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M190 330 Q186 350 180 364 M210 330 Q214 350 220 364 M146 344 L140 560 M254 344 L260 560\"/>","leggings":"<path fill=\"url(#@P@-bottom)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M140 324 H260 L252 566 H214 L204 392 H196 L186 566 H148 Z\"/><path fill=\"url(#@P@-bottom)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M138 310 H262 V328 H138 Z\"/>","platforms":"<path fill=\"url(#@P@-feet)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M138 486 H170 L172 540 Q194 542 198 554 V560 H134 L136 540 Z\"/><path fill=\"url(#@P@-feet)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M130 560 H202 V578 H130 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M166 494 V548\"/><g transform=\"translate(84 0)\"><path fill=\"url(#@P@-feet)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M138 486 H170 L172 540 Q194 542 198 554 V560 H134 L136 540 Z\"/><path fill=\"url(#@P@-feet)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M130 560 H202 V578 H130 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M166 494 V548\"/></g>","slip-ons":"<path fill=\"url(#@P@-feet)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M128 562 Q132 548 152 546 Q184 546 196 562 L198 570 H126 Z\"/><path fill=\"url(#@P@-feet)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M124 570 H200 V578 H124 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M150 552 Q164 546 176 552\"/><g transform=\"translate(84 0)\"><path fill=\"url(#@P@-feet)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M128 562 Q132 548 152 546 Q184 546 196 562 L198 570 H126 Z\"/><path fill=\"url(#@P@-feet)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M124 570 H200 V578 H124 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M150 552 Q164 546 176 552\"/></g>","crocs":"<path fill=\"url(#@P@-feet)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M126 552 Q128 530 156 528 Q190 528 200 550 L202 566 Q202 576 190 576 H136 Q124 576 124 566 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M126 566 H200 M146 546 Q136 560 150 572\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"160\" cy=\"538\" r=\"2.3\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"172\" cy=\"538\" r=\"2.3\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"184\" cy=\"542\" r=\"2.3\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"166\" cy=\"548\" r=\"2.3\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"178\" cy=\"550\" r=\"2.3\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"190\" cy=\"554\" r=\"2.3\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"146\" cy=\"548\" r=\"3\"/><g transform=\"translate(84 0)\"><path fill=\"url(#@P@-feet)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M126 552 Q128 530 156 528 Q190 528 200 550 L202 566 Q202 576 190 576 H136 Q124 576 124 566 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M126 566 H200 M146 546 Q136 560 150 572\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"160\" cy=\"538\" r=\"2.3\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"172\" cy=\"538\" r=\"2.3\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"184\" cy=\"542\" r=\"2.3\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"166\" cy=\"548\" r=\"2.3\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"178\" cy=\"550\" r=\"2.3\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"190\" cy=\"554\" r=\"2.3\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"146\" cy=\"548\" r=\"3\"/></g>","hi-tops":"<path fill=\"url(#@P@-feet)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M136 520 H168 L172 546 Q194 548 198 560 V566 H132 V546 Z\"/><path fill=\"url(#@P@-feet)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M128 566 H202 V578 H128 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M142 528 H164 M142 538 H166 M144 548 H168\"/><g transform=\"translate(84 0)\"><path fill=\"url(#@P@-feet)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M136 520 H168 L172 546 Q194 548 198 560 V566 H132 V546 Z\"/><path fill=\"url(#@P@-feet)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M128 566 H202 V578 H128 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M142 528 H164 M142 538 H166 M144 548 H168\"/></g>","socks":"<path fill=\"url(#@P@-feet)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M140 504 H166 L166 548 Q190 548 194 564 Q194 578 180 578 H140 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M140 516 H166\"/><g transform=\"translate(84 0)\"><path fill=\"url(#@P@-feet)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M140 504 H166 L166 548 Q190 548 194 564 Q194 578 180 578 H140 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M140 516 H166\"/></g>","clown-shoes":"<path fill=\"url(#@P@-feet)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M140 540 H166 L170 556 Q206 548 210 566 Q210 578 192 578 H118 Q108 578 110 566 Q112 552 140 550 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M146 548 H166 M122 570 H206\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"156\" cy=\"556\" r=\"3.6\"/><g transform=\"translate(84 0)\"><path fill=\"url(#@P@-feet)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M140 540 H166 L170 556 Q206 548 210 566 Q210 578 192 578 H118 Q108 578 110 566 Q112 552 140 550 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M146 548 H166 M122 570 H206\"/><circle fill=\"#F7F3FD\" stroke=\"#1E1030\" stroke-width=\"1.4\" cx=\"156\" cy=\"556\" r=\"3.6\"/></g>","boa":"<circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"188\" cy=\"146\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"200\" cy=\"143\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"212\" cy=\"146\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"178.0\" cy=\"152.0\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"222.0\" cy=\"152.0\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"180.6\" cy=\"173.1\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"219.4\" cy=\"173.1\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"179.5\" cy=\"194.2\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"220.5\" cy=\"194.2\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"173.6\" cy=\"215.3\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"226.4\" cy=\"215.3\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"165.1\" cy=\"236.4\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"234.9\" cy=\"236.4\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"158.0\" cy=\"257.5\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"242.0\" cy=\"257.5\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"155.3\" cy=\"278.5\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"244.7\" cy=\"278.5\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"156.9\" cy=\"299.6\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"243.1\" cy=\"299.6\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"160.0\" cy=\"320.7\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"240.0\" cy=\"320.7\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"160.4\" cy=\"341.8\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"239.6\" cy=\"341.8\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"156.0\" cy=\"362.9\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"244.0\" cy=\"362.9\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"148.0\" cy=\"384.0\" r=\"11\"/><circle fill=\"url(#@P@-boa)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" cx=\"252.0\" cy=\"384.0\" r=\"11\"/>","scarf":"<path fill=\"url(#@P@-scarf)\" stroke=\"#1E1030\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M176 148 Q200 172 224 148 L234 154 L240 392 H216 L212 180 Q200 188 188 180 L184 392 H160 L166 154 Z\"/><path fill=\"none\" stroke=\"#1E1030\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M164 392 v10 M170 392 v10 M176 392 v10 M182 392 v10 M218 392 v10 M224 392 v10 M230 392 v10 M236 392 v10\"/>"},"paint":["feet","bottom","top","outer","boa","scarf","head"]},"chimera":{"slots":["body","head","ears","mouth","arms","feet","tail","back","colours","markings"],"defaults":{"arms":"body","feet":"body"},"animals":{"armadillo":{"word":"armadillo","a":"an","fur":"#D8AE8E","light":"#F0D6BE","dark":"#8F6B52","skin":"#ECB9A3","ears":"oval","tail":{"kind":"thick","fill":"fur"},"marks":["belly"],"back":{"kind":"shell","word":"an armadillo's plates","main":"#9A7354","second":"#5E4231","third":"#CBA584"}},"axolotl":{"word":"axolotl","a":"an","fur":"#F3B3C3","light":"#FCE1E7","dark":"#D27891","skin":"#E2557F","ears":"gills","tail":{"kind":"thick","fill":"fur"},"marks":["belly"],"back":null},"badger":{"word":"badger","a":"a","fur":"#56555A","light":"#F0EFEA","dark":"#1D1D20","skin":"#4A4A4E","ears":"semi","tail":{"kind":"thick","fill":"fur"},"marks":["bands","lightHead","rimEars","tailTip"],"back":null},"bat":{"word":"bat","a":"a","fur":"#5B4A45","light":"#A58F84","dark":"#2C2321","skin":"#C08A8C","ears":"tri","tail":null,"marks":["chest"],"back":{"kind":"membrane","word":"a bat's wings","main":"#433633","second":"#8A7570","third":"#8A7570"}},"bear":{"word":"bear","a":"a","fur":"#8A5A3B","light":"#D9AB7F","dark":"#4B2F20","skin":"#E3A587","ears":"round","tail":{"kind":"stub","fill":"fur"},"marks":["belly"],"back":null},"beaver":{"word":"beaver","a":"a","fur":"#7D4F2C","light":"#B88660","dark":"#43281A","skin":"#3A2A22","ears":"round","tail":{"kind":"paddle","fill":"skin"},"marks":["belly"],"back":null},"camel":{"word":"camel","a":"a","fur":"#C9A06A","light":"#EBD7B0","dark":"#7E5A30","skin":"#A57E58","ears":"round","tail":{"kind":"tuft","fill":"fur"},"marks":["lowerFace"],"back":{"kind":"humps","word":"a camel's humps","main":"#C9A06A","second":"#7E5A30","third":"#7E5A30"}},"capybara":{"word":"capybara","a":"a","fur":"#9C6D47","light":"#BE9068","dark":"#5C3D25","skin":"#6E4B33","ears":"round","tail":{"kind":"stub","fill":"fur"},"marks":[],"back":null},"cat":{"word":"cat","a":"a","fur":"#A2A1A6","light":"#ECE9E4","dark":"#4E4D53","skin":"#F2A7B5","ears":"tri","tail":{"kind":"whip","fill":"fur"},"marks":["belly","stripes"],"back":null},"chameleon":{"word":"chameleon","a":"a","fur":"#69B04A","light":"#D9EA8A","dark":"#2E6A2E","skin":"#4E8F3A","ears":"none","tail":{"kind":"whip","fill":"fur"},"marks":["belly","stripes"],"back":{"kind":"crest","word":"a chameleon's casque","main":"#4E9A3C","second":"#2E6A2E","third":"#2E6A2E"}},"chicken":{"word":"chicken","a":"a","fur":"#C2662E","light":"#F0C38E","dark":"#7A3A18","skin":"#F2B33A","ears":"comb","tail":{"kind":"thick","fill":"dark"},"marks":["belly","chevrons"],"back":{"kind":"wings","word":"a chicken's wings","main":"#C2662E","second":"#7A3A18","third":"#8E4420"}},"crow":{"word":"crow","a":"a","fur":"#262A36","light":"#6F7DAA","dark":"#121318","skin":"#3A3B44","ears":"none","tail":{"kind":"thick","fill":"dark"},"marks":["gloss"],"back":{"kind":"wings","word":"a crow's wings","main":"#262A36","second":"#6F7DAA","third":"#121318"}},"dog":{"word":"dog","a":"a","fur":"#D6A45E","light":"#F3E3C6","dark":"#7A4E26","skin":"#8A5A3A","ears":"flop","tail":{"kind":"whip","fill":"fur"},"marks":["belly","eyePatch"],"back":null},"dolphin":{"word":"dolphin","a":"a","fur":"#7F93A8","light":"#E4EAF0","dark":"#4D6074","skin":"#F0B6BF","ears":"none","tail":{"kind":"thick","fill":"fur"},"marks":["chest"],"back":null},"elephant":{"word":"elephant","a":"an","fur":"#A3A5AA","light":"#C9CBCF","dark":"#6C6E73","skin":"#D9B8B1","ears":"fan","tail":{"kind":"tuft","fill":"fur"},"marks":[],"back":null},"fox":{"word":"fox","a":"a","fur":"#D9692B","light":"#F7EFE4","dark":"#2E211B","skin":"#2E211B","ears":"tri","tail":{"kind":"thick","fill":"fur"},"marks":["chest","darkPaws","lowerFace","tailTip"],"back":null},"frog":{"word":"frog","a":"a","fur":"#5FA64A","light":"#E8EFA6","dark":"#2F6A2A","skin":"#E79A9A","ears":"none","tail":null,"marks":["belly","spots"],"back":null},"highlandcow":{"word":"Highland cow","a":"a","fur":"#B8652A","light":"#E3B585","dark":"#7A3C15","skin":"#D99A80","ears":"horns","tail":{"kind":"tuft","fill":"fur"},"marks":[],"back":{"kind":"shag","word":"a Highland cow's shaggy coat","main":"#C9763A","second":"#8A4A1E","third":"#8A4A1E"}},"hippo":{"word":"hippo","a":"a","fur":"#8F8296","light":"#C9AEBF","dark":"#5C5062","skin":"#E8A3AA","ears":"round","tail":{"kind":"tuft","fill":"fur"},"marks":["belly"],"back":null},"jellyfish":{"word":"jellyfish","a":"a","fur":"#F2A7CB","light":"#FCDDEB","dark":"#C2639A","skin":"#F7C8DE","ears":"none","tail":{"kind":"whip","fill":"light"},"marks":["ribbons"],"back":null},"koi":{"word":"koi","a":"a","fur":"#F7F2EA","light":"#FFFFFF","dark":"#E0562A","skin":"#F4B8A6","ears":"none","tail":{"kind":"thick","fill":"fur"},"marks":["blotches"],"back":null},"lion":{"word":"lion","a":"a","fur":"#D4A25C","light":"#F3E0B8","dark":"#7A4A22","skin":"#C98E72","ears":"round","tail":{"kind":"tuft","fill":"fur"},"marks":["belly"],"back":{"kind":"ruff","word":"a lion's mane","main":"#A8622A","second":"#6E3A14","third":"#6E3A14"}},"meerkat":{"word":"meerkat","a":"a","fur":"#BF9A6C","light":"#EBDDC2","dark":"#3A2B20","skin":"#8A6A52","ears":"semi","tail":{"kind":"tuft","fill":"fur"},"marks":["belly","darkEars","patches"],"back":null},"mouse":{"word":"mouse","a":"a","fur":"#AAA29D","light":"#EFE9E3","dark":"#6B625D","skin":"#F3A9B8","ears":"round","tail":{"kind":"whip","fill":"skin"},"marks":["belly"],"back":null},"narwhal":{"word":"narwhal","a":"a","fur":"#8E99A6","light":"#E9EDF0","dark":"#4B5563","skin":"#C9CFD6","ears":"none","tail":{"kind":"thick","fill":"fur"},"marks":["chest","spots"],"back":null},"octopus":{"word":"octopus","a":"an","fur":"#DB6A44","light":"#F4A88A","dark":"#9A3620","skin":"#F8D2C0","ears":"none","tail":{"kind":"whip","fill":"fur"},"marks":["spots"],"back":null},"opossum":{"word":"opossum","a":"an","fur":"#A5A19E","light":"#F4F1EC","dark":"#232123","skin":"#EBAFB6","ears":"round","tail":{"kind":"whip","fill":"skin"},"marks":["darkEars","darkLimbs","lightHead"],"back":null},"otter":{"word":"otter","a":"an","fur":"#7B5233","light":"#DCC099","dark":"#45291A","skin":"#5B3A27","ears":"round","tail":{"kind":"thick","fill":"fur"},"marks":["chest","lowerFace"],"back":null},"owl":{"word":"owl","a":"an","fur":"#8C6A48","light":"#EEE1CA","dark":"#4A3626","skin":"#F2B33D","ears":"tufts","tail":{"kind":"thick","fill":"fur"},"marks":["belly","chevrons","disc"],"back":{"kind":"wings","word":"an owl's wings","main":"#8C6A48","second":"#4A3626","third":"#EEE1CA"}},"panda":{"word":"panda","a":"a","fur":"#F7F4EE","light":"#FFFFFF","dark":"#262626","skin":"#3B3B3B","ears":"round","tail":{"kind":"stub","fill":"light"},"marks":["band","darkEars","darkLimbs","patches"],"back":null},"parrot":{"word":"parrot","a":"a","fur":"#D7372F","light":"#F4C63A","dark":"#2D5FB3","skin":"#7C7A80","ears":"none","tail":{"kind":"thick","fill":"dark"},"marks":["darkLimbs","facePatch"],"back":{"kind":"wings","word":"a parrot's wings","main":"#D7372F","second":"#F4C63A","third":"#2D5FB3"}},"peacock":{"word":"peacock","a":"a","fur":"#1E62A8","light":"#4FA6D1","dark":"#123F70","skin":"#9A9086","ears":"plume","tail":{"kind":"thick","fill":"dark"},"marks":["facePatch"],"back":{"kind":"train","word":"a peacock's train","main":"#2F7D4A","second":"#2F7D4A","third":"#1C3E86"}},"penguin":{"word":"penguin","a":"a","fur":"#23272F","light":"#F6F6F2","dark":"#111419","skin":"#F2A33A","ears":"none","tail":{"kind":"stub","fill":"fur"},"marks":["tux"],"back":null},"pig":{"word":"pig","a":"a","fur":"#F2B8C0","light":"#FAD9DD","dark":"#9C5866","skin":"#E8909E","ears":"tri","tail":{"kind":"whip","fill":"skin"},"marks":["belly"],"back":null},"platypus":{"word":"platypus","a":"a","fur":"#7A5134","light":"#C79C74","dark":"#43291A","skin":"#3C3C3E","ears":"none","tail":{"kind":"thick","fill":"fur"},"marks":["belly"],"back":null},"porcupine":{"word":"porcupine","a":"a","fur":"#7A5E48","light":"#CDB394","dark":"#3B2C22","skin":"#9C7A62","ears":"round","tail":{"kind":"thick","fill":"dark"},"marks":["belly","lowerFace"],"back":{"kind":"quills","word":"a porcupine's quills","main":"#3B2C22","second":"#EFE4D2","third":"#EFE4D2"}},"possum":{"word":"possum","a":"a","fur":"#8F8B89","light":"#EDE6DA","dark":"#2C2826","skin":"#E6A9AE","ears":"oval","tail":{"kind":"thick","fill":"dark"},"marks":["chest","lowerFace"],"back":null},"rabbit":{"word":"rabbit","a":"a","fur":"#B39A83","light":"#F2E9DD","dark":"#5F4C3D","skin":"#F2B5BB","ears":"long","tail":{"kind":"stub","fill":"light"},"marks":["belly"],"back":null},"raccoon":{"word":"raccoon","a":"a","fur":"#8F8E91","light":"#E8E5E0","dark":"#2B2B2E","skin":"#3C3C3F","ears":"tri","tail":{"kind":"thick","fill":"fur"},"marks":["belly","darkPaws","mask","rimEars","rings"],"back":null},"raven":{"word":"raven","a":"a","fur":"#2E3140","light":"#7C83A0","dark":"#16171D","skin":"#3A3A42","ears":"none","tail":{"kind":"thick","fill":"dark"},"marks":[],"back":{"kind":"wings","word":"a raven's wings","main":"#2E3140","second":"#7C83A0","third":"#1B1C22"}},"rhino":{"word":"rhino","a":"a","fur":"#8F8B87","light":"#BDB8B2","dark":"#57534F","skin":"#C7A7A0","ears":"oval","tail":{"kind":"tuft","fill":"fur"},"marks":["folds"],"back":null},"roadrunner":{"word":"roadrunner","a":"a","fur":"#8A6B4C","light":"#EDE4D3","dark":"#3A2C20","skin":"#7D96B3","ears":"crest","tail":{"kind":"thick","fill":"dark"},"marks":["belly","chevrons"],"back":{"kind":"wings","word":"a roadrunner's wings","main":"#8A6B4C","second":"#3A2C20","third":"#EDE4D3"}},"snake":{"word":"snake","a":"a","fur":"#6FA33C","light":"#E3DE8C","dark":"#3B6222","skin":"#5E8C32","ears":"none","tail":{"kind":"thick","fill":"fur"},"marks":["coils"],"back":null},"squirrel":{"word":"squirrel","a":"a","fur":"#B8642E","light":"#F4E7D4","dark":"#6E3416","skin":"#E7A08A","ears":"tufts","tail":{"kind":"thick","fill":"fur"},"marks":["belly"],"back":null},"swan":{"word":"swan","a":"a","fur":"#F7F6F2","light":"#FFFFFF","dark":"#A9ADB3","skin":"#2B2B2F","ears":"none","tail":{"kind":"thick","fill":"fur"},"marks":[],"back":{"kind":"wings","word":"a swan's wings","main":"#F7F6F2","second":"#A9ADB3","third":"#FFFFFF"}},"tiger":{"word":"tiger","a":"a","fur":"#E07A2C","light":"#F7EBD8","dark":"#1F1714","skin":"#E8A598","ears":"round","tail":{"kind":"tuft","fill":"fur"},"marks":["lowerFace","rings","stripes"],"back":null},"turkey":{"word":"turkey","a":"a","fur":"#6E4B33","light":"#C9A07A","dark":"#2F2018","skin":"#E6A39C","ears":"none","tail":{"kind":"thick","fill":"dark"},"marks":["bareHead","chevrons"],"back":{"kind":"fan","word":"a turkey's fan","main":"#7A5232","second":"#2A1C14","third":"#E6D3B3"}},"turtle":{"word":"turtle","a":"a","fur":"#7E9A4E","light":"#E3D58E","dark":"#4C6230","skin":"#5E7A3A","ears":"none","tail":{"kind":"thick","fill":"fur"},"marks":["chest"],"back":{"kind":"scutes","word":"a turtle's shell","main":"#8A7A42","second":"#4E4422","third":"#B3A05E"}},"zebra":{"word":"zebra","a":"a","fur":"#F4F2EE","light":"#FFFFFF","dark":"#1E1E22","skin":"#3A3A3E","ears":"leaf","tail":{"kind":"tuft","fill":"fur"},"marks":["darkMuzzle","stripes"],"back":{"kind":"mane","word":"a zebra's mane","main":"#1E1E22","second":"#F4F2EE","third":"#F4F2EE"}}},"comb":"#D7313E"},"body":{"groups":[{"key":"pose","name":"How you get about","multi":false,"options":[["standing","On your feet"],["wheelchair","In a wheelchair"],["powerchair","In a power chair"]]},{"key":"height","name":"How tall","multi":false,"options":[["shorter","Shorter"],["middling","In between"],["taller","Taller"]]},{"key":"shoulders","name":"Shoulders","multi":false,"options":[["narrow","Narrow"],["middling","In between"],["broad","Broad"]]},{"key":"middle","name":"Your middle","multi":false,"options":[["flat","Flat"],["soft","Soft"],["round","Round"],["big","Big"]]},{"key":"hips","name":"Hips","multi":false,"options":[["narrow","Narrow"],["middling","In between"],["wide","Wide"]]},{"key":"skin","name":"Skin","multi":false,"options":[["t1","Tone 1, the lightest"],["t2","Tone 2"],["t3","Tone 3"],["t4","Tone 4"],["t5","Tone 5"],["t6","Tone 6"],["t7","Tone 7"],["t8","Tone 8"],["t9","Tone 9"],["t10","Tone 10, the deepest"],["lavender","Lavender"],["sage","Sage"],["sky","Sky"],["stone","Stone"]]},{"key":"marks","name":"On your skin","multi":true,"options":[["freckles","Freckles"],["vitiligo","Vitiligo"],["birthmark","A birthmark on one cheek"],["scar","A scar"]]},{"key":"face","name":"The shape of your face","multi":false,"options":[["oval","Oval"],["round","Round"],["square","Square"],["long","Long"]]},{"key":"eyes","name":"Eyes","multi":false,"options":[["open","Open"],["soft","Half closed"],["aside","Looking away"],["closed","Closed"],["wide","Wide"]]},{"key":"brows","name":"Brows","multi":false,"options":[["soft","Soft"],["straight","Straight"],["arched","Arched"],["bushy","Bushy"]]},{"key":"nose","name":"Nose","multi":false,"options":[["small","Small"],["round","Round"],["long","Long"],["broad","Broad"]]},{"key":"mouth","name":"Mouth","multi":false,"options":[["rest","At rest"],["smile","Smiling"],["grin","Grinning"],["open","Open"]]},{"key":"beard","name":"Facial hair","multi":false,"options":[["none","None"],["stubble","Stubble"],["moustache","A moustache"],["beard","A beard"],["long","A long beard"]]},{"key":"hair","name":"Hair","multi":false,"options":[["bald","No hair"],["shaved","Shaved close"],["short","Short"],["curly","Short curls"],["afro","An afro"],["locs","Locs"],["braids","Braids"],["long","Long and straight"],["wavy","Long and wavy"],["bob","A bob"],["bun","A bun"],["ponytail","A ponytail"],["mohawk","A mohawk"],["undercut","An undercut"]]},{"key":"hairColour","name":"Hair colour","multi":false,"options":[["black","Black"],["darkbrown","Dark brown"],["brown","Brown"],["auburn","Auburn"],["red","Bright red"],["ginger","Ginger"],["blonde","Blonde"],["grey","Grey"],["white","White"],["pink","Pink"],["blue","Blue"],["green","Green"],["purple","Purple"],["teal","Teal"],["rainbow","Rainbow"]]},{"key":"eyewear","name":"Over your eyes","multi":false,"options":[["none","Nothing"],["glasses","Glasses"],["dark","Dark glasses, for the light"]]},{"key":"ears","name":"On your ears","multi":false,"options":[["none","Nothing"],["aids","Hearing aids"],["cochlear","A cochlear implant"],["defenders","Ear defenders"],["headphones","Headphones"]]},{"key":"faceAid","name":"Over your nose and mouth","multi":false,"options":[["none","Nothing"],["mask","A mask"],["cannula","An oxygen cannula"]]},{"key":"hands","name":"In your hands","multi":false,"options":[["none","Nothing"],["cane","A cane"],["white","A white cane"],["crutches","Crutches"],["walker","A walker"],["aac","An AAC device"],["fidget","A fidget"]]},{"key":"neck","name":"Round your neck","multi":false,"options":[["none","Nothing"],["chew","A chew necklace"]]},{"key":"limbs","name":"Your arms and legs","multi":false,"options":[["as-drawn","As the booth draws them"],["leg","A prosthetic leg"],["arm-short","One arm ends below the elbow"],["arm","A prosthetic arm"]]},{"key":"layer","name":"Underneath, in plain","multi":false,"options":[["coal","Charcoal"],["black","Black"],["denim","Denim"],["cream","Cream"],["moss","Moss"],["plum","Plum"],["rust","Rust"],["sky","Sky blue"]]}],"colours":{"skin":{"t1":"#F7E4D6","t2":"#F0CFB6","t3":"#E6BA98","t4":"#D9A47E","t5":"#C68C63","t6":"#AF744E","t7":"#955D3C","t8":"#7B482D","t9":"#5F3621","t10":"#452618","lavender":"#C7B4EA","sage":"#A8C7A0","sky":"#9CC8E8","stone":"#B9B5AE"},"hair":{"black":"#1B1714","darkbrown":"#3B2518","brown":"#6B4428","auburn":"#8C3A1E","ginger":"#C9622A","blonde":"#E2C27A","grey":"#9A9A9C","white":"#EDEBE6","pink":"#F06BA8","blue":"#3C6BE0","green":"#3FA35A","purple":"#8A4FD0","teal":"#1E9A94","red":"#D7261E","rainbow":"#C9529A"},"hair_rainbow":["#E0352B","#F08A24","#F2C631","#3FA35A","#3C6BE0","#8A4FD0"],"aid":"#7F8A94","aid_dark":"#2E3338","white_cane":"#F4F4F2","cane_tip":"#D3352B","chair":"#3A4148","chair_light":"#B8C0C7","screen":"#DCEBF7","chew":"#2BC4C0","mask":"#F2F5F7","vitiligo":"#FBF1EC","birthmark":"#B04E62","white":"#FFFFFF"},"standingOnly":{"hands":["cane","white","crutches","walker"]},"random":["height","shoulders","middle","hips","skin","face","eyes","brows","nose","mouth","hair","hairColour","layer"]}};
/* avatar:data:end */

  var INK = DATA.ink || '#1E1030';
  var COL = DATA.body ? DATA.body.colours : {};
  var seq = 0;

  /* ── Small pieces ────────────────────────────────────────────────────── */
  var CX = 100;
  function f(n) { return String(Math.round(n * 10) / 10); }
  function pt(x, y) { return f(CX + x) + ' ' + f(y); }
  function poly(points) {
    return 'M' + points.map(function (q) { return pt(q[0], q[1]); }).join(' L') + ' Z';
  }
  function open(points) {
    return 'M' + points.map(function (q) { return pt(q[0], q[1]); }).join(' L');
  }
  function flip(points) { return points.map(function (q) { return [-q[0], q[1]]; }); }
  function dist(a, b) { var dx = b[0] - a[0], dy = b[1] - a[1]; return Math.sqrt(dx * dx + dy * dy); }
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }

  function shape(d, fill, w) {
    return '<path d="' + d + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (w || 1.3) +
      '" stroke-linejoin="round"/>';
  }
  function plain(d, fill) { return '<path d="' + d + '" fill="' + fill + '"/>'; }
  function line(d, w, colour) {
    return '<path d="' + d + '" fill="none" stroke="' + (colour || INK) + '" stroke-width="' + (w || 1) +
      '" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function dot(x, y, r, fill, w) {
    return '<circle cx="' + f(CX + x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '"' +
      (w ? ' stroke="' + INK + '" stroke-width="' + w + '"' : '') + '/>';
  }
  function oval(x, y, rx, ry, fill, w) {
    return '<ellipse cx="' + f(CX + x) + '" cy="' + f(y) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + fill + '"' +
      (w ? ' stroke="' + INK + '" stroke-width="' + w + '"' : '') + '/>';
  }
  /* A tube: a dark line with a lighter one inside it, for canes, frames and
     cables, so a pale aid stays visible on a pale ground. */
  function tube(d, w, colour) { return line(d, w + 2, INK) + line(d, w, colour); }

  /* A limb or a sleeve: a strip of the given half-widths along a polyline. */
  function strip(points, widths) {
    var L = [], R = [], n = points.length;
    for (var i = 0; i < n; i++) {
      var a = points[Math.max(0, i - 1)], b = points[Math.min(n - 1, i + 1)];
      var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = -dy / len, ny = dx / len;
      L.push([points[i][0] + nx * widths[i], points[i][1] + ny * widths[i]]);
      R.push([points[i][0] - nx * widths[i], points[i][1] - ny * widths[i]]);
    }
    return L.concat(R.reverse());
  }
  /* The first fraction t of a polyline, with its widths. */
  function upTo(points, widths, t) {
    var total = 0, i;
    for (i = 1; i < points.length; i++) total += dist(points[i - 1], points[i]);
    var want = total * Math.max(.05, Math.min(1, t)), acc = 0, P = [points[0]], W = [widths[0]];
    for (i = 1; i < points.length; i++) {
      var l = dist(points[i - 1], points[i]);
      if (acc + l >= want - .01) {
        var k = (want - acc) / (l || 1);
        if (k > .02) { P.push(lerp(points[i - 1], points[i], k)); W.push(widths[i - 1] + (widths[i] - widths[i - 1]) * k); }
        return { p: P, w: W };
      }
      acc += l; P.push(points[i]); W.push(widths[i]);
    }
    return { p: P, w: W };
  }

  /* ── The body, worked out from the choices ───────────────────────────── */
  var HEIGHT = { shorter: [.74, .8], middling: [1, 1], taller: [1.1, 1.06] };
  var SHOULDERS = { narrow: 27, middling: 32, broad: 38 };
  var MIDDLE = { flat: [22, 6], soft: [27, 6.6], round: [34, 7.6], big: [42, 8.6] };
  var HIPS = { narrow: 25, middling: 30, wide: 36 };
  var FACE = { oval: [19.5, 24.5], round: [22, 23], square: [21, 24], long: [18.5, 26.5] };
  /* A head a little larger than life, drawn in its own coordinates and scaled
     about its middle, so a face reads at the size of a picture beside a name. */
  var HEAD = 1.22;
  var STANDING_ONLY = {};

  function geometry(b) {
    var seated = b.pose !== 'standing';
    var hf = HEIGHT[b.height], legF = hf[0], armF = hf[1];
    var S = SHOULDERS[b.shoulders], m = MIDDLE[b.middle];
    var W = m[0], a = m[1];
    var H = Math.max(HIPS[b.hips], W - 3);
    var C = Math.max(S - 4, Math.min(W, S + 1));
    var fc = FACE[b.face];
    // On your feet the soles stand on the floor at 286; sitting, the feet are
    // on the footplate and the soles at 280. Everything above is measured
    // down from the middle of the head, y0.
    var y0 = seated ? 132 - 58 * legF : 286 - 134 - 102 * legF;
    var g = { seated: seated, pose: b.pose, S: S, W: W, H: H, C: C, a: a, rx: fc[0], ry: fc[1], y0: y0, legF: legF, armF: armF };
    g.chin = y0 + fc[1] * HEAD;
    g.sh = y0 + 40;
    g.pit = g.sh + 16;
    g.waist = g.sh + 50;
    g.belly = g.sh + 56;
    g.hip = g.sh + 82;
    g.crotch = g.hip + 12;
    g.keys = [[g.sh + 4, S], [g.pit, C], [g.belly, W], [g.hip, H], [g.hip + 60, H]];
    if (!seated) {
      g.knee = g.crotch + 48 * legF;
      g.ankle = g.crotch + 92 * legF;
      g.sole = g.crotch + 102 * legF;
      g.kx = Math.max(9, H * .42); g.kw = 6.5 + (W - 22) * .08;
      g.ax = Math.max(8, H * .33); g.aw = 4.5;
      g.fx = g.ax + 1.5;
    } else {
      g.knee = g.hip + 18;
      g.ankle = g.knee + 58 * legF;
      g.sole = g.ankle + 8;
      g.kx = Math.max(10, H * .55); g.kw = 7.5 + (W - 22) * .1;
      g.ax = g.kx; g.aw = 4.5;
      g.fx = g.kx;
    }
    arms(g, b);
    return g;
  }

  /* Where the arms hang, which is also where every sleeve goes. What is in
     your hands moves them: an AAC device is held up in front, a walker's grips
     and crutches' handles are at the hip, a cane is held out at one side. */
  function arms(g, b) {
    var S = g.S, W = g.W, H = g.H, sh = g.sh, armF = g.armF;
    var J = [S - 5, sh + 3], E, R;
    if (!g.seated) {
      E = [Math.max(S + 2, W + 6, g.C + 5), sh + 44 * armF];
      R = [Math.max(S + 3, H + 6, W + 4), sh + 86 * armF];
    } else {
      E = [Math.max(S + 3, W + 7), sh + 40 * armF];
      R = [Math.max(14, H * .62), g.hip + 8];
    }
    var left = { J: J, E: E, R: R }, right = { J: J, E: E, R: R };
    var h = b.hands;
    if (h === 'aac') {
      var held = [17, g.seated ? g.hip - 6 : g.belly - 2];
      left = { J: J, E: E, R: held }; right = { J: J, E: E, R: held };
    } else if (h === 'walker' || h === 'crutches') {
      var grip = [Math.max(S + 6, H + 10, W + 8), g.hip + 4];
      left = { J: J, E: E, R: grip }; right = { J: J, E: E, R: grip };
    } else if (h === 'cane') {
      right = { J: J, E: E, R: [Math.max(S + 6, H + 10, W + 8), g.hip + 8] };
    } else if (h === 'white') {
      right = { J: J, E: E, R: [Math.max(S + 4, H + 6, W + 6), g.hip] };
    } else if (h === 'fidget') {
      left = { J: J, E: E, R: [Math.max(S + 1, W + 3), g.seated ? g.hip : g.belly + 8] };
    }
    g.arm = { '-1': left, '1': right };
  }

  function armLine(g, s) {
    var A = g.arm[String(s)];
    return [[s * A.J[0], A.J[1]], [s * A.E[0], A.E[1]], [s * A.R[0], A.R[1]]];
  }
  function armWidths(g) { return [g.a + 1, g.a * .86, g.a * .7]; }

  /* How wide the body is at height y, between keys, eased. */
  function halfAt(g, y) {
    var k = g.keys;
    if (y <= k[0][0]) return k[0][1];
    for (var i = 1; i < k.length; i++) {
      if (y <= k[i][0]) {
        var t = (y - k[i - 1][0]) / (k[i][0] - k[i - 1][0]);
        t = t * t * (3 - 2 * t);
        return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * t;
      }
    }
    return k[k.length - 1][1];
  }
  function sideDown(g, e, y1, y2) {
    var out = [];
    for (var y = y1; y < y2; y += 4) out.push([halfAt(g, y) + e, y]);
    out.push([halfAt(g, y2) + e, y2]);
    return out;
  }

  /* A garment's body: from the neck (or straight across the chest) down to a
     hem, a little looser than the body by e. neck: 'crew', 'v', 'scoop',
     'collar', or a number, which is a straight top at that height. */
  function bodice(g, e, hem, neck) {
    var right = [];
    var straight = typeof neck === 'number';
    var top = straight ? neck : g.sh + 4;
    if (!straight) { right.push([8.5, g.sh - 3]); right.push([g.S + e - 1, g.sh + 1.5]); }
    right = right.concat(sideDown(g, e, top, hem));
    var d = 'M' + right.map(function (q) { return pt(q[0], q[1]); }).join(' L');
    var left = flip(right).reverse();
    d += ' L' + left.map(function (q) { return pt(q[0], q[1]); }).join(' L');
    if (straight) {
      d += ' Q' + pt(0, top + 7) + ' ' + pt(right[0][0], right[0][1]) + ' Z';
    } else {
      var depth = neck === 'v' ? 20 : neck === 'scoop' ? 15 : neck === 'collar' ? 9 : 7;
      d += ' Q' + pt(0, g.sh + depth) + ' ' + pt(8.5, g.sh - 3) + ' Z';
    }
    return d;
  }

  /* One side of an open-fronted garment: from the neck and shoulder down the
     side to the hem, and back up the front edge, which stands `gap` off the
     middle. s is -1 for the left side and 1 for the right. */
  function panel(g, e, hem, gap, s, flare) {
    flare = flare || 0;
    var right = [[gap + 3, g.sh - 2], [g.S + e - 1, g.sh + 1.5]];
    var side = sideDown(g, e, g.sh + 4, hem);
    side[side.length - 1][0] += flare;
    right = right.concat(side);
    right.push([gap, hem]);
    right.push([gap, g.sh + 12]);
    return poly(s < 0 ? flip(right) : right);
  }

  /* A sleeve on the arm s, a fraction t of the way to the wrist, e looser than
     the arm, and opening out by `flare` at the cuff. A short arm's sleeve
     stops where the arm does. */
  function sleeve(g, s, t, e, flare) {
    var w = armWidths(g).map(function (x) { return x + e; });
    if (g.short && s === -1) t = Math.min(t, .78);
    var u = upTo(armLine(g, s), w, t);
    u.w[u.w.length - 1] += flare || 0;
    return limbPath(g, s, u.p, u.w);
  }

  /* An arm or a sleeve with a rounded shoulder: down the outside from the top
     of the shoulder, across the end, and back up the inside. Worked out on the
     right and mirrored for the left, so the curve over the shoulder is the
     same both sides. */
  function limbPath(g, s, points, widths) {
    var P = points.map(function (q) { return [q[0] * s, q[1]]; });
    var edge = strip(P, widths), n = P.length;
    var inner = edge.slice(0, n), outer = edge.slice(n).reverse();
    var top = [P[0][0] + 1, P[0][1] - widths[0] * .55];
    var down = lerp(outer[0], outer[1], Math.min(.6, 7 / (dist(outer[0], outer[1]) || 1)));
    var d = [];
    function q(x) { return [x[0] * s, x[1]]; }
    d.push('M' + pt(q(inner[0])[0], q(inner[0])[1]));
    d.push('Q' + pt(q([outer[0][0] + 1, top[1]])[0], top[1]) + ' ' + pt(q(down)[0], down[1]));
    outer.slice(1).forEach(function (x) { d.push('L' + pt(q(x)[0], x[1])); });
    inner.slice().reverse().forEach(function (x) { d.push('L' + pt(q(x)[0], x[1])); });
    return d.join(' ') + ' Z';
  }

  /* The legs, on your feet or sitting down, for skin and for trousers alike. */
  function legOutline(g, s, e, hem, flare, inner) {
    var pts;
    flare = flare || 0;
    if (!g.seated) {
      var ht = Math.min(hem, g.ankle) === hem ? hem : g.ankle;
      var k = (ht - g.knee) / (g.ankle - g.knee);
      var bx = g.kx + (g.ax - g.kx) * Math.max(0, k), bw = g.kw + (g.aw - g.kw) * Math.max(0, k);
      if (ht < g.knee) { var k2 = (ht - g.crotch) / (g.knee - g.crotch); bx = g.H * .5 + (g.kx - g.H * .5) * k2; bw = g.H * .5 + (g.kw - g.H * .5) * k2; }
      pts = [[g.H + e, g.hip]];
      if (ht > g.knee) pts.push([g.kx + g.kw + e, g.knee]);
      pts.push([bx + bw + e + flare, hem]);
      pts.push([Math.max(inner || 1, bx - bw - e - flare), hem]);
      if (ht > g.knee) pts.push([Math.max(inner || 1, g.kx - g.kw - e), g.knee]);
      pts.push([inner || 0, g.crotch + (e > 2 ? 4 : 1)]);
    } else {
      var sw = 5.5 + e;
      pts = [[g.H + e, g.hip - 2], [g.kx + g.kw + e, g.knee], [g.kx + sw + .5, g.knee + 8]];
      pts.push([g.kx + sw - 1 + flare, hem]);
      pts.push([g.kx - sw + 1 - flare, hem]);
      pts.push([g.kx - sw - .5, g.knee + 8]);
      pts.push([Math.max(inner || 1, g.kx - g.kw - e), g.knee]);
      pts.push([inner || 0, g.hip + 6]);
    }
    return s < 0 ? flip(pts) : pts;
  }

  /* A pair of trousers, waist to hem: the band across the waist and both legs
     in one outline. */
  function trousers(g, e, hem, flare, inner) {
    var R = legOutline(g, 1, e, hem, flare, inner);
    var L = legOutline(g, -1, e, hem, flare, inner);
    var top = sideDown(g, e, g.waist, g.hip);
    var right = top.concat(R.slice(1));
    var left = flip(top).concat(L.slice(1));
    return 'M' + pt(-halfAt(g, g.waist) - e, g.waist) + ' L' + right.map(function (q) { return pt(q[0], q[1]); }).join(' L') +
      ' L' + left.reverse().map(function (q) { return pt(q[0], q[1]); }).join(' L') + ' Z';
  }

  /* A skirt from the waist, or a dress's skirt from wherever its bodice stops:
     standing, it flares straight to the hem; sitting, it goes over the lap to
     the knees and falls from there. */
  function skirt(g, e, from, hem, flare) {
    var right = sideDown(g, e, from, g.hip);
    if (!g.seated) {
      right.push([halfAt(g, g.hip) + e + flare * .35, g.hip + (hem - g.hip) * .4]);
      right.push([halfAt(g, g.hip) + e + flare, hem]);
    } else {
      right.push([g.kx + g.kw + e + flare * .4, g.knee]);
      right.push([g.kx + g.kw + e + flare * .55, g.knee + 6]);
      right.push([g.kx + g.kw + e + flare * .6, hem]);
    }
    var left = flip(right).reverse();
    return poly(right.concat(left));
  }

  /* The hem that a long garment reaches: 'hip', 'thigh', 'knee', 'calf' or
     'floor', on your feet or sitting down. */
  function hemAt(g, where) {
    if (!g.seated) {
      return { hip: g.hip + 6, thigh: g.hip + 26, knee: g.knee + 2, calf: g.knee + (g.ankle - g.knee) * .55, floor: g.sole - 3 }[where];
    }
    return { hip: g.hip + 4, thigh: g.hip + 10, knee: g.knee + 14, calf: g.knee + (g.ankle - g.knee) * .6, floor: g.sole - 4 }[where];
  }

  /* ── The garments, on a body ─────────────────────────────────────────── */
  /* Each returns its parts: `back` is drawn behind the body (a hood, the
     inside of a cape), `body` over the body, `sleeves` over the arms, and `top`
     over everything below the head. c.f(slot) is the slot's fabric. */
  function crewSeam(g) { return line('M' + pt(-8.5, g.sh - 3) + ' Q' + pt(0, g.sh + 7) + ' ' + pt(8.5, g.sh - 3), 1); }


  /* ── Fantasy Fancy Dress's pieces ────────────────────────────────────── */
  /* The shop behind the Den (Helen's ask, 2026-10-15): wings, ears, tails,
     paws, jewellery and dress-up suits, worn only by a bodymind, because a
     tail or a pair of ears needs somebody to wear it. Drawn here like
     everything else, from the body they are on. */
  function veil(d, fill, op) {
    return '<path d="' + d + '" fill="' + fill + '" fill-opacity="' + (op || .6) + '" stroke="' + INK +
      '" stroke-width="1.1" stroke-linejoin="round"/>';
  }
  /* A leaf shape from a base out to a tip, swelling to about half of wid. */
  function petal(bx, by, ang, len, wid) {
    var r = ang * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r);
    var tx = bx + cs * len, ty = by + sn * len, mx = bx + cs * len * .5, my = by + sn * len * .5;
    var nx = -sn * wid, ny = cs * wid;
    return 'M' + pt(bx, by) + ' Q' + pt(mx + nx, my + ny) + ' ' + pt(tx, ty) + ' Q' + pt(mx - nx, my - ny) + ' ' + pt(bx, by) + ' Z';
  }
  /* Points along a quadratic curve, for strips. */
  function bend(a, c, b, n) {
    var out = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n, u = 1 - t;
      out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
    }
    return out;
  }
  /* Where a hand is, the same place hands() draws it. */
  function handAt(g, s) {
    var A = armLine(g, s), R = A[2], E = A[1];
    var d = dist(E, R) || 1, k = 4 / d;
    return [R[0] + (R[0] - E[0]) * k, R[1] + (R[1] - E[1]) * k];
  }
  function bothHands(g, one) {
    var out = '';
    [-1, 1].forEach(function (s) { if (!(s === -1 && g.short)) out += one(handAt(g, s), s); });
    return out;
  }
  /* WHAT IS HELD GOES IN A HAND NOTHING ELSE IS IN (Halloween, 2026-10-28).
     A cane, a white cane, crutches, a walker, an AAC device or a fidget is
     part of you, the booth's rule, so nothing from the shop takes its place:
     a staff goes in the other hand, and with no hand free (both on a walker
     or an AAC device, or one hand busy and no other) it is carried the way
     people carry things when their hands are full, a long thing slung across
     the back on a strap and a short one hung at the hip on a cord. Sitting
     down, a hand is in the lap and holds it there. Which hand is worked out
     once, in drawBodymind, as g.free: 1, -1, or 0 for none. */
  function freeHand(b) {
    var h = b.hands, both = h === 'aac' || h === 'walker' || h === 'crutches';
    var right = both || h === 'cane' || h === 'white', left = both || h === 'fidget' || b.limbs === 'arm-short';
    return !right ? 1 : !left ? -1 : 0;
  }
  function held(g, inHand, carried, long, F) {
    if (g.free) { var s = g.free; return { held: inHand(handAt(g, s), s) }; }
    if (long) {
      // On a strap across the back, from low on one side to over the other shoulder.
      var low = [-g.S - 4, g.seated ? g.hip + 10 : g.hip + 24], high = [g.S + 10, g.sh - 26];
      return { back: carried(low, high), top: tube(open([[g.S * .55, g.sh], [-g.H * .7, g.hip - 4]]), 1.2, F) };
    }
    // On a cord from the shoulder to the hip.
    var hook = [g.H + 4, g.hip];
    return { top: tube(open([[-g.S * .55, g.sh + 2], hook]), 1.2, F) + carried(hook) };
  }
  function star(x, y, r, fill) {
    var P = [];
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, k = i % 2 ? r * .45 : r;
      P.push([x + Math.cos(a) * k, y + Math.sin(a) * k]);
    }
    return shape(poly(P), fill, .9);
  }
  /* A wing either side, worked out on the right and mirrored. */
  function wingPair(one) { return one(1) + one(-1); }
  function sideAng(s, ang) { return s > 0 ? ang : 180 - ang; }
  /* The hood every suit has, behind the head and round the face. */
  function hood(g, fab) {
    var y = g.y0, rx = g.rx, ry = g.ry;
    return {
      back: oval(0, y - 2, rx + 8, ry + 9, fab, 1.3),
      rim: shape('M' + pt(-rx - 7, y + 9) + ' Q' + pt(-rx - 9, y - ry - 15) + ' ' + pt(0, y - ry - 15) +
        ' Q' + pt(rx + 9, y - ry - 15) + ' ' + pt(rx + 7, y + 9) + ' L' + pt(rx + 1, y + 3) +
        ' Q' + pt(rx, y - ry - 5) + ' ' + pt(0, y - ry - 6) + ' Q' + pt(-rx, y - ry - 5) + ' ' + pt(-rx - 1, y + 3) + ' Z', fab)
    };
  }
  /* The band a pair of ears sits on, over the top of the head. */
  function earBand(g, fab) {
    var y = g.y0, rx = g.rx, ry = g.ry;
    return tube('M' + pt(-rx - 1, y - ry * .3) + ' Q' + pt(0, y - ry - 7) + ' ' + pt(rx + 1, y - ry * .3), 1.8, fab);
  }
  /* A one-piece suit, neck to ankle and wrist, with a zip down the front. */
  function suitBody(g, fab) {
    var hem = g.seated ? g.ankle - 2 : g.ankle - 3, cuffs = '';
    [-1, 1].forEach(function (s) {
      var x = s * g.ax;
      if (!g.seated) cuffs += line(open([[x - 6.5, hem - 3], [x + 6.5, hem - 3]]), .8);
    });
    return shape(trousers(g, 3.5, hem, 1.5, 0), fab) + shape(bodice(g, 3.5, g.hip + 10, 'crew'), fab) +
      line(open([[0, g.sh + 5], [0, g.crotch - 1]]), 1) + dot(0, g.sh + 9, 2.2, inkColour('silver'), .9) + cuffs;
  }
  function suitSleeves(g, fab) { return shape(sleeve(g, -1, 1, 3.2, 1.5), fab) + shape(sleeve(g, 1, 1, 3.2, 1.5), fab); }
  /* Stripes from the outside edge of each leg, and across each sleeve: the
     tiger suit's, and a chimera onesie's when its markings are striped. */
  function limbStripes(g, colour) {
    var legs = '', arms = '';
    function legOut(yy) {
      if (g.seated) return g.kx + 9;
      if (yy < g.knee) return g.H + 3.5 + (g.kx + g.kw - g.H) * (yy - g.hip) / (g.knee - g.hip);
      return g.kx + g.kw + 3.5 + (g.ax + g.aw - g.kx - g.kw) * (yy - g.knee) / (g.ankle - g.knee);
    }
    var rows = g.seated ? [g.knee + 14, g.knee + 30, g.knee + 46] : [g.hip + 16, g.knee - 6, g.knee + 16, g.ankle - 16];
    rows.forEach(function (yy) {
      var x = legOut(yy);
      legs += plain(poly([[-x, yy - 3], [-x + 8, yy], [-x, yy + 3]]), colour) + plain(poly([[x, yy - 3], [x - 8, yy], [x, yy + 3]]), colour);
    });
    [-1, 1].forEach(function (s) {
      var A = armLine(g, s), wd = armWidths(g);
      [.3, .55, .8].forEach(function (t) {
        var seg = t < .5 ? [A[0], A[1]] : [A[1], A[2]], k = t < .5 ? t * 2 : (t - .5) * 2, P = lerp(seg[0], seg[1], k);
        var dx = seg[1][0] - seg[0][0], dy = seg[1][1] - seg[0][1], l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l * s, ny = dx / l * s;
        var w = (t < .5 ? wd[0] : wd[1]) + 3;
        arms += line(open([[P[0] + nx * w * .1, P[1] + ny * w * .1], [P[0] + nx * w, P[1] + ny * w]]), 2.2, colour);
      });
    });
    return { legs: legs, arms: arms };
  }

  /* A CHIMERA ONESIE (Fantasy Fancy Dress, a request from our community for
     Halloween, 2026-10-28): a suit with a hood, made after one of your
     chimeras. It is in the colours of the animal that gave the chimera its
     colours, with the ears of the one that gave its ears on the hood, the
     tail of the one that gave its tail at the back, the markings of the one
     that gave its markings, and the back of the one that gave its back. Only
     the kinds come across from the shelf (make-bodymind.py writes them into
     DATA.chimera), never chimera.js's drawings: a onesie is a suit, and what
     it borrows is what a suit can carry. The chimera's colours are its own
     hexes, as they are in Chimera Obscura, and the INK outline carries every
     edge, as it does there. */
  function chimeraOnesie(g, c) {
    var K = DATA.chimera || {}, an = K.animals || {}, ch = c.chimera || {};
    var col = an[ch.colours];
    if (!col) return {};
    var F = col.fur, P = { fur: col.fur, light: col.light, dark: col.dark, skin: col.skin };
    var Dk = col.dark, Lt = col.light;
    var marks = (an[ch.markings] || {}).marks || [], has = function (m) { return marks.indexOf(m) !== -1; };
    var y = g.y0, rx = g.rx, ry = g.ry, hd = hood(g, F);
    var body = suitBody(g, F), sleeves = suitSleeves(g, has('darkLimbs') ? Dk : F), top = '', back = '', side = '', front = '';
    // Markings, on the front of the suit.
    var mid = (g.pit + g.hip) / 2 + 4;
    if (has('belly') || has('tux') || has('disc')) front += oval(0, mid, g.W * .55, (g.hip - g.pit) * .42, Lt, 1);
    else if (has('chest')) front += oval(0, g.pit + (g.hip - g.pit) * .22, g.W * .42, (g.hip - g.pit) * .2, Lt, 1);
    if (has('stripes') || has('chevrons') || has('bands') || has('folds') || has('coils')) {
      var st = limbStripes(g, Dk);
      front += st.legs;
      sleeves += st.arms;
    }
    if (has('spots') || has('patches') || has('blotches')) {
      var r = has('spots') ? 3 : 5.5;
      [[-.32, .18], [.28, .34], [-.12, .62], [.34, .74], [-.36, .84]].forEach(function (q) {
        front += dot(g.W * q[0], g.pit + (g.hip - g.pit) * q[1], r, Dk, .8);
      });
    }
    if (has('darkPaws') || has('darkLimbs')) {
      [-1, 1].forEach(function (s) {
        if (s === -1 && g.short) return;
        var A = armLine(g, s), w = lerp(A[1], A[2], .88);
        sleeves += oval(w[0], w[1], g.a + 2, 3.2, Dk, .9);
        if (!g.seated) front += oval(s * g.ax, g.ankle - 7, g.aw + 3, 3.2, Dk, .9);
      });
    }
    // The ears, on the hood.
    var E = (an[ch.ears] || {}).ears || 'none', Ef = has('darkEars') ? Dk : F, inner = has('darkEars') ? F : (P.skin || Lt);
    var ear = {
      round: function (s) { return dot(s * rx * .84, y - ry - 10, 8, Ef, 1.3) + dot(s * rx * .84, y - ry - 10, 3.8, inner); },
      tri: function (s) {
        return shape(poly([[s * rx * .48, y - ry - 9], [s * rx * .94, y - ry - 7], [s * rx * .78, y - ry - 24]]), Ef, 1.1) +
          plain(poly([[s * rx * .6, y - ry - 10], [s * rx * .86, y - ry - 9], [s * rx * .77, y - ry - 19]]), inner);
      },
      oval: function (s) { return oval(s * rx * .8, y - ry - 14, 6, 11, Ef, 1.2) + oval(s * rx * .8, y - ry - 13, 2.8, 7, inner); },
      long: function (s) { return oval(s * rx * .42, y - ry - 28, 6.5, 21, Ef, 1.2) + oval(s * rx * .42, y - ry - 26, 3, 15, inner); },
      flop: function (s) { return oval(s * (rx + 7), y - ry * .15, 6.5, 15, Ef, 1.2); },
      fan: function (s) { return oval(s * (rx + 11), y - ry * .25, 10, 15, Ef, 1.2) + oval(s * (rx + 11), y - ry * .25, 5.5, 10, inner); },
      horns: function (s) { return shape(poly([[s * rx * .5, y - ry - 8], [s * rx * .74, y - ry - 6], [s * (rx + 10), y - ry - 20]]), inkColour('cream'), 1); },
      gills: function (s) {
        return tube('M' + pt(s * (rx + 2), y - ry * .5) + ' l' + f(s * 13) + ' -9', 2.2, P.skin) +
          tube('M' + pt(s * (rx + 4), y - ry * .15) + ' l' + f(s * 15) + ' 0', 2.2, P.skin) +
          tube('M' + pt(s * (rx + 2), y + ry * .2) + ' l' + f(s * 13) + ' 9', 2.2, P.skin);
      }
    };
    ear.semi = ear.round;
    ear.leaf = ear.oval;
    ear.tufts = function (s) { return ear.tri(s) + line('M' + pt(s * rx * .78, y - ry - 24) + ' l' + f(s * 2) + ' -6', 1.6, Ef); };
    var crown = '';
    if (ear[E]) crown = wingPair(ear[E]);
    else if (E === 'comb') [-6, 0, 6].forEach(function (x) { crown += dot(x, y - ry - 14 + Math.abs(x) * .4, 5, K.comb || '#D7313E', 1.1); });
    else if (E === 'crest' || E === 'plume') [-14, 0, 14].forEach(function (a) {
      crown += shape('M' + pt(a * .2, y - ry - 12) + ' Q' + pt(a * .6 - 4, y - ry - 26) + ' ' + pt(a, y - ry - 34) + ' Q' + pt(a * .6 + 4, y - ry - 26) + ' ' + pt(a * .2, y - ry - 12) + ' Z', Dk, 1);
    });
    // The back, of the animal that gave the chimera its back.
    var B = ch.back && ch.back !== 'none' && an[ch.back] ? an[ch.back].back : null;
    if (B) {
      if (B.kind === 'quills' || B.kind === 'fan') {
        for (var qx = -14; qx <= 14; qx += 7) {
          var qb = y - ry - 13 + qx * qx / 60;
          crown = shape(poly([[qx - 3, qb + 2], [qx, qb - 12], [qx + 3, qb + 2]]), B.main, 1) + dot(qx, qb - 10, 1.6, B.third) + crown;
        }
      } else if (B.kind === 'mane' || B.kind === 'ruff' || B.kind === 'shag') {
        for (var i = 0; i < 7; i++) crown += dot(rx + 6 - i * .3, y - ry - 8 + i * 6, 4.4, i % 2 ? B.second : B.main, 1);
      } else if (B.kind === 'crest') {
        crown += shape('M' + pt(-12, y - ry - 8) + ' Q' + pt(0, y - ry - 34) + ' ' + pt(12, y - ry - 8) + ' Z', B.main, 1.1);
      } else if (B.kind === 'wings' || B.kind === 'membrane') {
        [-1, 1].forEach(function (s) {
          back += shape(poly([[s * g.S * .55, g.sh + 6], [s * (g.S + 28), g.sh - 12], [s * (g.S + 30), g.pit + 6], [s * (g.S + 18), g.pit + 26]]), B.main, 1.2) +
            line(open([[s * (g.S + 6), g.sh + 2], [s * (g.S + 24), g.pit + 14]]), 1.4, B.second);
        });
      } else if (B.kind === 'shell' || B.kind === 'scutes') {
        back += oval(0, (g.sh + g.hip) / 2, g.W + 10, (g.hip - g.sh) * .62, B.main, 1.3) +
          line('M' + pt(-g.W - 8, (g.sh + g.hip) / 2) + ' H' + f(CX + g.W + 8), 1.2, B.second);
      } else if (B.kind === 'humps') {
        [-1, 1].forEach(function (s) { back += dot(s * g.S * .45, g.sh - 4, 9, B.main, 1.2); });
      } else if (B.kind === 'train') {
        for (var tr = -3; tr <= 3; tr++) {
          var ang = (-90 + tr * 22) * Math.PI / 180, tx = Math.cos(ang) * 58, ty = g.pit + 10 + Math.sin(ang) * 58;
          back += line(open([[0, g.pit + 10], [tx, ty]]), 3, B.main) + dot(tx, ty, 6, B.main, 1) + dot(tx, ty, 2.6, B.third);
        }
      }
    }
    // The tail, at the back, of the animal that gave the chimera its tail.
    var T = (an[ch.tail] || {}).tail;
    if (T) {
      var tf = P[T.fill] || F, H = g.H, h = g.hip, piece = '';
      if (T.kind === 'stub') {
        piece = dot(H + (g.seated ? 5 : 8), h + (g.seated ? 2 : 8), 6, tf, 1.2);
        if (g.seated) side += piece; else back += piece;
      } else if (T.kind === 'paddle') {
        piece = oval(H + (g.seated ? 10 : 12), h + (g.seated ? 4 : 22), 7, 14, tf, 1.2);
        if (g.seated) side += piece; else back += piece;
      } else if (T.kind === 'thick') {
        var Pp = g.seated ? bend([H * .4, h - 4], [H + 30, h - 4], [H + 40, h + 30], 8) : bend([H * .4, h], [H + 30, h + 10], [H + 30, h + 58], 8);
        var w = [3, 6, 9, 11, 12, 11, 9, 6, 1.5];
        back += shape(poly(strip(Pp, w)), tf);
        if (has('tailTip')) back += shape(poly(strip(Pp.slice(6), w.slice(6))), Lt, 1);
        if (has('rings')) [2, 4].forEach(function (k) { back += dot(Pp[k][0], Pp[k][1], w[k] * .8, Dk); });
      } else {
        var d = g.seated ?
          'M' + pt(H * .4, h - 4) + ' Q' + pt(H + 26, h - 6) + ' ' + pt(H + 30, h + 18) + ' Q' + pt(H + 34, h + 40) + ' ' + pt(H + 44, h + 30) :
          'M' + pt(H * .4, h) + ' Q' + pt(H + 24, h + 6) + ' ' + pt(H + 20, h + 40) + ' Q' + pt(H + 16, h + 66) + ' ' + pt(H + 30, h + 60);
        back += tube(d, 4, tf);
        if (T.kind === 'tuft') back += dot(H + (g.seated ? 44 : 30), g.seated ? h + 30 : h + 60, 5, Dk, 1);
      }
    }
    return { body: body + front, sleeves: sleeves, hood: hd.back, top: crown + hd.rim, back: back, side: side };
  }

  var BODY_WEAR = {
    // ── On your head ──
    'slouchy-beanie': function (g, c) {
      var y = g.y0, rx = g.rx, ry = g.ry;
      return { top:
        shape('M' + pt(-rx - 2, y - ry * .3) + ' Q' + pt(-rx - 3, y - ry - 12) + ' ' + pt(2, y - ry - 11) +
          ' Q' + pt(rx + 16, y - ry - 8) + ' ' + pt(rx + 12, y - 2) + ' Q' + pt(rx + 6, y - ry * .55) + ' ' + pt(rx + 1, y - ry * .32) + ' Z', c.f('head')) +
        shape('M' + pt(-rx - 2.5, y - ry * .42) + ' Q' + pt(0, y - ry * .2) + ' ' + pt(rx + 2.5, y - ry * .42) +
          ' L' + pt(rx + 2.5, y - ry * .18) + ' Q' + pt(0, y + 1) + ' ' + pt(-rx - 2.5, y - ry * .18) + ' Z', c.f('head')) +
        line('M' + pt(-rx * .6, y - ry * .3) + ' v5 M' + pt(-rx * .2, y - ry * .26) + ' v5 M' + pt(rx * .2, y - ry * .26) + ' v5 M' + pt(rx * .6, y - ry * .3) + ' v5', .8) };
    },
    'beanie': function (g, c) {
      var y = g.y0, rx = g.rx, ry = g.ry;
      return { top:
        shape('M' + pt(-rx - 1.5, y - ry * .35) + ' Q' + pt(-rx - 1, y - ry - 8) + ' ' + pt(0, y - ry - 8) +
          ' Q' + pt(rx + 1, y - ry - 8) + ' ' + pt(rx + 1.5, y - ry * .35) + ' Z', c.f('head')) +
        dot(0, y - ry - 11, 6, 'url(#' + c.p + '-head)', 1.3) +
        shape('M' + pt(-rx - 3, y - ry * .5) + ' L' + pt(rx + 3, y - ry * .5) + ' L' + pt(rx + 3, y - ry * .16) + ' L' + pt(-rx - 3, y - ry * .16) + ' Z', c.f('head')) +
        line('M' + pt(-rx * .66, y - ry * .48) + ' v7 M' + pt(-rx * .33, y - ry * .48) + ' v7 M' + pt(0, y - ry * .48) + ' v7 M' + pt(rx * .33, y - ry * .48) + ' v7 M' + pt(rx * .66, y - ry * .48) + ' v7', .8) };
    },
    'wide-brim': function (g, c) {
      var y = g.y0, rx = g.rx, ry = g.ry;
      return { top:
        shape('M' + pt(-rx * .95, y - ry * .5) + ' Q' + pt(-rx * .7, y - ry - 14) + ' ' + pt(-2, y - ry - 18) +
          ' Q' + pt(4, y - ry - 12) + ' ' + pt(rx * .95, y - ry * .5) + ' Z', c.f('head')) +
        shape('M' + pt(-rx - 26, y - ry * .42) + ' Q' + pt(0, y - ry * .95) + ' ' + pt(rx + 26, y - ry * .42) +
          ' Q' + pt(0, y - ry * .05) + ' ' + pt(-rx - 26, y - ry * .42) + ' Z', c.f('head')) +
        line('M' + pt(-rx * .9, y - ry * .62) + ' Q' + pt(0, y - ry * .48) + ' ' + pt(rx * .9, y - ry * .62), 1) };
    },
    'headscarf': function (g, c) {
      var y = g.y0, rx = g.rx, ry = g.ry;
      return {
        back: shape('M' + pt(rx - 2, y - 6) + ' Q' + pt(rx + 14, y + 2) + ' ' + pt(rx + 12, y + 22) + ' L' + pt(rx + 5, y + 22) + ' Q' + pt(rx + 6, y + 6) + ' ' + pt(rx - 6, y - 2) + ' Z', c.f('head')),
        top:
          shape('M' + pt(-rx - 2, y - 2) + ' Q' + pt(-rx - 3, y - ry - 8) + ' ' + pt(0, y - ry - 7) +
            ' Q' + pt(rx + 3, y - ry - 8) + ' ' + pt(rx + 2, y - 2) + ' Q' + pt(0, y - ry * .55) + ' ' + pt(-rx - 2, y - 2) + ' Z', c.f('head')) +
          dot(rx + 1, y - 4, 4.5, 'url(#' + c.p + '-head)', 1.2) +
          line('M' + pt(-rx * .7, y - ry * .7) + ' Q' + pt(0, y - ry - 2) + ' ' + pt(rx * .7, y - ry * .7), .8)
      };
    },
    'wig': function (g, c) {
      var y = g.y0, rx = g.rx, ry = g.ry, out = '';
      var curls = [[-rx - 8, y + 6, 9], [rx + 8, y + 6, 9], [-rx - 10, y - 8, 10], [rx + 10, y - 8, 10],
        [-rx - 6, y - ry + 2, 11], [rx + 6, y - ry + 2, 11], [-rx * .45, y - ry - 8, 11], [rx * .45, y - ry - 8, 11],
        [0, y - ry - 11, 11], [-rx - 4, y + 18, 8], [rx + 4, y + 18, 8]];
      var back = oval(0, y - 4, rx + 15, ry + 12, 'url(#' + c.p + '-head)', 1.3);
      curls.forEach(function (q) { out += dot(q[0], q[1], q[2], 'url(#' + c.p + '-head)', 1.3); });
      var fringe = [[-rx * .7, y - ry + 6, 7], [-rx * .2, y - ry + 3, 7.5], [rx * .3, y - ry + 3, 7.5], [rx * .75, y - ry + 6, 7]];
      var front = '';
      fringe.forEach(function (q) { front += dot(q[0], q[1], q[2], 'url(#' + c.p + '-head)', 1.3); });
      return { back: back + out, top: front };
    },
    'witch-hat': function (g, c) {
      var y = g.y0, rx = g.rx, ry = g.ry, F = c.f('head');
      return { top:
        shape('M' + pt(-rx * .7, y - ry * .62) + ' Q' + pt(-rx * .38, y - ry - 14) + ' ' + pt(-3, y - ry - 26) +
          ' Q' + pt(4, y - ry - 36) + ' ' + pt(15, y - ry - 32) + ' Q' + pt(8, y - ry - 29) + ' ' + pt(6, y - ry - 22) +
          ' Q' + pt(rx * .4, y - ry - 10) + ' ' + pt(rx * .7, y - ry * .62) + ' Z', F) +
        shape('M' + pt(-rx - 20, y - ry * .5) + ' Q' + pt(0, y - ry * .98) + ' ' + pt(rx + 20, y - ry * .5) +
          ' Q' + pt(0, y - ry * .1) + ' ' + pt(-rx - 20, y - ry * .5) + ' Z', F) +
        shape(poly([[-rx * .62, y - ry * .98], [rx * .62, y - ry * .98], [rx * .68, y - ry * .76], [-rx * .68, y - ry * .76]]), F, 1.1) +
        shape(poly([[-3.5, y - ry * .99], [3.5, y - ry * .99], [3.5, y - ry * .75], [-3.5, y - ry * .75]]), inkColour('gold'), .9) };
    },
    'tricorne': function (g, c) {
      var y = g.y0, rx = g.rx, ry = g.ry, F = c.f('head');
      return { top:
        shape('M' + pt(-rx * .85, y - ry * .55) + ' Q' + pt(-rx * .8, y - ry - 12) + ' ' + pt(0, y - ry - 13) +
          ' Q' + pt(rx * .8, y - ry - 12) + ' ' + pt(rx * .85, y - ry * .55) + ' Z', F) +
        shape('M' + pt(-rx - 15, y - ry * .78) + ' Q' + pt(-rx * .5, y - ry - 12) + ' ' + pt(0, y - ry - 6) +
          ' Q' + pt(rx * .5, y - ry - 12) + ' ' + pt(rx + 15, y - ry * .78) + ' L' + pt(0, y - ry * .32) + ' Z', F) +
        line('M' + pt(-rx - 11, y - ry * .8) + ' Q' + pt(-rx * .5, y - ry - 8) + ' ' + pt(0, y - ry - 3) +
          ' Q' + pt(rx * .5, y - ry - 8) + ' ' + pt(rx + 11, y - ry * .8), 1.4, inkColour('gold')) +
        dot(-rx * .55, y - ry - 2, 3.4, inkColour('gold'), .9) };
    },
    'clown-hat': function (g, c) {
      var y = g.y0, ry = g.ry, F = c.f('head'), b = y - ry - 2;
      return { top: line('M' + pt(-g.rx - 1, y - ry * .3) + ' Q' + pt(0, y - ry - 7) + ' ' + pt(g.rx + 1, y - ry * .3), 1.6) +
        shape(poly([[-8, b + 2], [8, b], [5, b - 28]]), F) + dot(5, b - 30, 4.2, F, 1.1) +
        dot(1.5, b - 18, 2.4, F, .9) + dot(-1, b - 8, 2.4, F, .9) };
    },

    // ── Over the top ──
    'haori': function (g, c) {
      var hem = hemAt(g, 'thigh');
      var sl = '';
      [-1, 1].forEach(function (s) {
        var A = armLine(g, s), E = A[1];
        var cuffY = E[1] + 16;
        var outer = s * (Math.abs(E[0]) + g.a + 9);
        sl += shape(poly([[s * (g.S - 6), g.sh + 1], [s * (g.S + 4), g.sh + 3], [outer, cuffY - 6], [outer, cuffY + 6],
          [s * (Math.abs(E[0]) - g.a - 2), cuffY + 4], [s * (g.S - 2), g.pit + 6]]), c.f('outer'));
      });
      return {
        body: shape(panel(g, 4, hem, 5, -1, 2), c.f('outer')) + shape(panel(g, 4, hem, 5, 1, 2), c.f('outer')) +
          line(open([[-5.5, g.sh + 8], [-12, g.belly + 4]]), 1.6) + line(open([[5.5, g.sh + 8], [12, g.belly + 4]]), 1.6),
        sleeves: sl + line('M' + pt(-7, g.pit + 14) + ' Q' + pt(0, g.pit + 18) + ' ' + pt(7, g.pit + 14), 1.2) + dot(0, g.pit + 17, 2.4, INK)
      };
    },
    'cardigan': function (g, c) {
      var hem = hemAt(g, g.seated ? 'thigh' : 'thigh') + (g.seated ? 0 : 6);
      var rib = '';
      for (var x = 10; x < g.H + 4; x += 5) rib += ' M' + pt(x, hem - 5) + ' v5 M' + pt(-x, hem - 5) + ' v5';
      var pockets = g.seated ? '' :
        line(poly([[-g.H + 2, g.hip - 4], [-10, g.hip - 4], [-10, g.hip + 10], [-g.H + 3, g.hip + 10]]), 1) +
        line(poly([[g.H - 2, g.hip - 4], [10, g.hip - 4], [10, g.hip + 10], [g.H - 3, g.hip + 10]]), 1);
      var buttons = '';
      for (var y = g.pit; y < hem - 8; y += 14) buttons += dot(7.5, y, 1.8, INK);
      return {
        body: shape(panel(g, 3.5, hem, 4, -1, 1), c.f('outer')) + shape(panel(g, 3.5, hem, 4, 1, 1), c.f('outer')) +
          line(rib.slice(1), .8) + pockets + buttons,
        sleeves: shape(sleeve(g, -1, 1, 2.5, 0), c.f('outer')) + shape(sleeve(g, 1, 1, 2.5, 0), c.f('outer'))
      };
    },
    'hoodie': function (g, c) {
      var hem = hemAt(g, 'hip') + 4, y = g.y0;
      return {
        back: shape('M' + pt(-g.S + 6, g.sh + 6) + ' Q' + pt(-g.S + 2, g.sh - 12) + ' ' + pt(0, g.sh - 13) + ' Q' + pt(g.S - 2, g.sh - 12) + ' ' + pt(g.S - 6, g.sh + 6) + ' Z', c.f('outer')),
        body: shape(bodice(g, 4, hem, 'crew'), c.f('outer')) +
          line(open([[0, g.sh + 6], [0, hem]]), 1.2) +
          line(poly([[-g.W + 2, g.belly + 4], [-4, g.belly + 2], [-4, g.hip - 2], [-g.W + 6, g.hip]]), 1) +
          line(poly([[g.W - 2, g.belly + 4], [4, g.belly + 2], [4, g.hip - 2], [g.W - 6, g.hip]]), 1) +
          line(open([[-4, g.sh + 4], [-5, g.sh + 22]]), 1) + line(open([[4, g.sh + 4], [5, g.sh + 22]]), 1) +
          line(open([[-g.H - 4, hem - 5], [g.H + 4, hem - 5]]), .8),
        sleeves: shape(sleeve(g, -1, 1, 3, 0), c.f('outer')) + shape(sleeve(g, 1, 1, 3, 0), c.f('outer'))
      };
    },
    'cape': function (g, c) {
      var hem = g.seated ? g.hip + 34 : hemAt(g, 'knee') + 24;
      var wide = Math.max(Math.abs(g.arm['1'].R[0]), Math.abs(g.arm['-1'].R[0])) + g.a + 10;
      function side(s) {
        return poly((s < 0 ? flip : function (p) { return p; })([[8, g.sh - 2], [g.S + 4, g.sh + 1], [wide, g.hip - 8], [wide + 6, hem], [10, hem], [9, g.pit]]));
      }
      return {
        back: shape(poly([[-wide - 4, hem - 4], [-g.S - 2, g.sh + 6], [g.S + 2, g.sh + 6], [wide + 4, hem - 4]]), c.f('outer')),
        top: shape(side(-1), c.f('outer')) + shape(side(1), c.f('outer')) +
          line(open([[-(g.S * .7), g.pit + 6], [-(wide * .7), hem - 4]]), .8) + line(open([[g.S * .7, g.pit + 6], [wide * .7, hem - 4]]), .8) +
          dot(0, g.sh + 2, 3.5, 'url(#' + c.p + '-outer)', 1.3)
      };
    },
    'sequin-jacket': function (g, c) {
      var hem = g.waist + 10;
      return {
        body: shape(panel(g, 3.5, hem, 6, -1, 0), c.f('outer')) + shape(panel(g, 3.5, hem, 6, 1, 0), c.f('outer')) +
          shape(poly([[-9, g.sh - 2], [-6, g.pit + 10], [-15, g.pit - 2]]), c.f('outer'), 1.1) +
          shape(poly([[9, g.sh - 2], [6, g.pit + 10], [15, g.pit - 2]]), c.f('outer'), 1.1),
        sleeves: shape(sleeve(g, -1, 1, 2.5, 0), c.f('outer')) + shape(sleeve(g, 1, 1, 2.5, 0), c.f('outer'))
      };
    },
    // A vampire's cape: to the floor, its lining showing down the front edges,
    // and a collar that stands up behind the head.
    'vampire-cape': function (g, c) {
      var hem = g.seated ? g.knee + 24 : hemAt(g, 'floor') - 2, F = c.f('outer');
      var wide = Math.max(Math.abs(g.arm['1'].R[0]), Math.abs(g.arm['-1'].R[0])) + g.a + 12;
      function side(s) {
        return poly((s < 0 ? flip : function (p) { return p; })([[8, g.sh - 2], [g.S + 4, g.sh + 1], [wide, g.hip - 4], [wide + 8, hem], [12, hem], [9, g.pit]]));
      }
      var collar = wingPair(function (s) {
        return shape(poly([[s * 7, g.sh - 4], [s * (g.S - 2), g.sh - 2], [s * (g.rx + 16), g.y0 - 6], [s * (g.rx * .6), g.chin - 2]]), F, 1.2);
      });
      return {
        back: collar + shape(poly([[-wide - 6, hem - 2], [-g.S - 2, g.sh + 6], [g.S + 2, g.sh + 6], [wide + 6, hem - 2]]), F),
        top: shape(side(-1), F) + shape(side(1), F) +
          line(open([[-11, g.pit], [-13, hem - 2]]), 2.2, inkColour('tomato')) + line(open([[11, g.pit], [13, hem - 2]]), 2.2, inkColour('tomato')) +
          dot(0, g.sh + 2, 3.8, inkColour('gold'), 1.2)
      };
    },
    'wizard-robe': function (g, c) {
      var hem = hemAt(g, 'floor'), F = c.f('outer');
      return {
        body: shape(panel(g, 5, hem, 3, -1, 8), F) + shape(panel(g, 5, hem, 3, 1, 8), F) +
          line(open([[-4.5, g.sh + 10], [-4.5, hem - 1]]), 1.4, inkColour('gold')) + line(open([[4.5, g.sh + 10], [4.5, hem - 1]]), 1.4, inkColour('gold')),
        sleeves: shape(sleeve(g, -1, 1, 4, 11), F) + shape(sleeve(g, 1, 1, 4, 11), F)
      };
    },

    // ── Underneath ──
    'button-down': function (g, c) {
      var hem = hemAt(g, 'hip') + 2, buttons = '';
      for (var y = g.sh + 12; y < hem - 4; y += 12) buttons += dot(0, y, 1.5, INK);
      return {
        body: shape(bodice(g, 2.5, hem, 'collar'), c.f('top')) +
          shape(poly([[-8.5, g.sh - 3], [0, g.sh + 9], [-4, g.sh + 13], [-12, g.sh + 2]]), c.f('top'), 1.1) +
          shape(poly([[8.5, g.sh - 3], [0, g.sh + 9], [4, g.sh + 13], [12, g.sh + 2]]), c.f('top'), 1.1) +
          line(open([[0, g.sh + 9], [0, hem]]), 1) + buttons +
          line(poly([[g.C * .35, g.pit + 2], [g.C * .8, g.pit + 2], [g.C * .8, g.pit + 12], [g.C * .35, g.pit + 12]]), .9),
        sleeves: shape(sleeve(g, -1, 1, 1.8, 0), c.f('top')) + shape(sleeve(g, 1, 1, 1.8, 0), c.f('top'))
      };
    },
    'tee': function (g, c) {
      var hem = hemAt(g, 'hip');
      return {
        body: shape(bodice(g, 2.5, hem, 'crew'), c.f('top')) + crewSeam(g),
        sleeves: shape(sleeve(g, -1, .32, 2.5, 1.5), c.f('top')) + shape(sleeve(g, 1, .32, 2.5, 1.5), c.f('top'))
      };
    },
    'corset': function (g, c) {
      var top = g.pit + 2, hem = g.hip + 2, lace = '', s = 1;
      for (var y = top + 6; y < hem - 2; y += 7) { lace += (lace ? ' L' : 'M') + pt(s * 3.5, y); s = -s; }
      return {
        body: shape(bodice(g, 1, hem, top), c.f('top')) +
          line(open([[-g.C * .55, top + 3], [-g.S * .55, g.sh + 1]]), 2) + line(open([[g.C * .55, top + 3], [g.S * .55, g.sh + 1]]), 2) +
          line(lace, .9) + line(open([[-g.W * .45, top + 6], [-g.H * .5, hem - 2]]), .8) + line(open([[g.W * .45, top + 6], [g.H * .5, hem - 2]]), .8)
      };
    },
    'flowing-dress': function (g, c) {
      var hem = hemAt(g, 'calf');
      return {
        body: shape(skirt(g, 3, g.waist, hem, 18), c.f('top')) + shape(bodice(g, 2.5, g.waist + 2, 'scoop'), c.f('top')) +
          line(open([[-halfAt(g, g.waist) - 2, g.waist + 1], [halfAt(g, g.waist) + 2, g.waist + 1]]), .9) +
          line(open([[-g.H * .4, g.hip + 4], [-g.H * .7, hem - 4]]), .8) + line(open([[g.H * .4, g.hip + 4], [g.H * .7, hem - 4]]), .8),
        sleeves: shape(sleeve(g, -1, .26, 3, 4), c.f('top')) + shape(sleeve(g, 1, .26, 3, 4), c.f('top'))
      };
    },
    'gown': function (g, c) {
      var hem = hemAt(g, 'floor'), top = g.pit + 1;
      return {
        body: shape(skirt(g, 1.5, g.hip - 6, hem, 22), c.f('top')) + shape(bodice(g, 1, g.hip - 4, top), c.f('top')) +
          line(open([[-g.C * .5, top + 3], [-g.S * .5, g.sh + 1]]), 1.2) + line(open([[g.C * .5, top + 3], [g.S * .5, g.sh + 1]]), 1.2) +
          line(open([[0, g.hip + 6], [0, hem - 2]]), .8)
      };
    },

    // ── The bottom half ──
    'fisherman': function (g, c) {
      var hem = g.ankle;
      var cuffs = '';
      [-1, 1].forEach(function (s) {
        var x = s * g.ax;
        cuffs += shape(poly([[x - 7, hem - 6], [x + 7, hem - 6], [x + 6, hem + 1], [x - 6, hem + 1]]), c.f('bottom'), 1.1);
      });
      return {
        body: shape(trousers(g, 6, hem - 4, 3, 0), c.f('bottom')) + cuffs +
          shape(poly([[-halfAt(g, g.waist) - 6, g.waist - 6], [halfAt(g, g.waist) + 6, g.waist - 6], [halfAt(g, g.waist) + 6, g.waist + 5], [-halfAt(g, g.waist) - 6, g.waist + 5]]), c.f('bottom'), 1.1) +
          dot(0, g.waist + 7, 3, 'url(#' + c.p + '-bottom)', 1.2) +
          line('M' + pt(-2, g.waist + 9) + ' Q' + pt(-5, g.waist + 16) + ' ' + pt(-3, g.waist + 22) + ' M' + pt(2, g.waist + 9) + ' Q' + pt(5, g.waist + 16) + ' ' + pt(3, g.waist + 22), .9)
      };
    },
    'skirt': function (g, c) {
      var hem = g.seated ? g.ankle - 6 : g.ankle - 2;
      return {
        body: shape(skirt(g, 2, g.waist, hem, 16), c.f('bottom')) +
          shape(poly([[-halfAt(g, g.waist) - 2.5, g.waist - 3], [halfAt(g, g.waist) + 2.5, g.waist - 3], [halfAt(g, g.waist + 5) + 2.5, g.waist + 5], [-halfAt(g, g.waist + 5) - 2.5, g.waist + 5]]), c.f('bottom'), 1.1) +
          line(open([[-g.H * .45, g.waist + 6], [-g.H * .8, hem - 3]]), .8) + line(open([[0, g.waist + 6], [0, hem - 2]]), .8) + line(open([[g.H * .45, g.waist + 6], [g.H * .8, hem - 3]]), .8)
      };
    },
    'wide-leg': function (g, c) {
      var hem = g.seated ? g.ankle + 2 : g.sole - 4;
      return {
        body: shape(trousers(g, 3.5, hem, 7, 0), c.f('bottom')) +
          shape(poly([[-halfAt(g, g.waist) - 3.5, g.waist - 3], [halfAt(g, g.waist) + 3.5, g.waist - 3], [halfAt(g, g.waist + 5) + 3.5, g.waist + 5], [-halfAt(g, g.waist + 5) - 3.5, g.waist + 5]]), c.f('bottom'), 1.1) +
          line('M' + pt(-1.5, g.waist + 5) + ' Q' + pt(-3, g.waist + 12) + ' ' + pt(-6, g.waist + 16) + ' M' + pt(1.5, g.waist + 5) + ' Q' + pt(3, g.waist + 12) + ' ' + pt(6, g.waist + 16), .9)
      };
    },
    'leggings': function (g, c) {
      return {
        body: shape(trousers(g, .6, g.ankle - 1, 0, 0), c.f('bottom')) +
          shape(poly([[-halfAt(g, g.waist) - 1, g.waist - 2], [halfAt(g, g.waist) + 1, g.waist - 2], [halfAt(g, g.waist + 5) + 1, g.waist + 5], [-halfAt(g, g.waist + 5) - 1, g.waist + 5]]), c.f('bottom'), 1.1)
      };
    },

    // ── On your feet ── (a pair, each drawn where that foot is)
    'platforms': function (g, c) { return { feet: pair(g, function (x, s) {
      var y = g.sole;
      return shape(poly([[x - 6, g.ankle - 16], [x + 6, g.ankle - 16], [x + 6.5, y - 7], [x + 10, y - 5], [x + 10, y - 2], [x - 9, y - 2], [x - 6.5, y - 7]]), c.f('feet')) +
        shape(poly([[x - 10, y - 2], [x + 11, y - 2], [x + 11, y + 5], [x - 10, y + 5]]), c.f('feet')) +
        line(open([[x + s * 2.5, g.ankle - 14], [x + s * 2.5, y - 6]]), .8);
    }) }; },
    'slip-ons': function (g, c) { return { feet: pair(g, function (x) {
      var y = g.sole;
      return shape('M' + pt(x - 9, y) + ' Q' + pt(x - 9, y - 8) + ' ' + pt(x, y - 8) + ' Q' + pt(x + 10, y - 8) + ' ' + pt(x + 10, y) + ' Z', c.f('feet')) +
        line(open([[x - 10, y + 1], [x + 11, y + 1]]), 1.6) + line('M' + pt(x - 4, y - 5) + ' Q' + pt(x, y - 7) + ' ' + pt(x + 4, y - 5), .8);
    }) }; },
    'crocs': function (g, c) { return { feet: pair(g, function (x) {
      var y = g.sole;
      return shape('M' + pt(x - 10, y + 1) + ' Q' + pt(x - 11, y - 10) + ' ' + pt(x, y - 10) + ' Q' + pt(x + 11, y - 10) + ' ' + pt(x + 11, y + 1) + ' Z', c.f('feet')) +
        dot(x - 4, y - 6, 1.1, INK) + dot(x, y - 7, 1.1, INK) + dot(x + 4, y - 6, 1.1, INK) + dot(x - 2, y - 3, 1.1, INK) + dot(x + 2, y - 3, 1.1, INK) +
        line('M' + pt(x - 9, y - 4) + ' Q' + pt(x - 12, y - 10) + ' ' + pt(x - 7, y - 12), 1);
    }) }; },
    'hi-tops': function (g, c) { return { feet: pair(g, function (x) {
      var y = g.sole;
      return shape(poly([[x - 6.5, g.ankle - 8], [x + 6.5, g.ankle - 8], [x + 7, y - 6], [x + 10, y - 4], [x + 10, y], [x - 9, y], [x - 7, y - 6]]), c.f('feet')) +
        line(open([[x - 10, y + 1], [x + 11, y + 1]]), 2) +
        line('M' + pt(x - 3.5, g.ankle - 5) + ' h7 M' + pt(x - 3.5, g.ankle - 1) + ' h7 M' + pt(x - 3.5, g.ankle + 3) + ' h7', .8);
    }) }; },
    'socks': function (g, c) { return { feet: pair(g, function (x) {
      var y = g.sole;
      return shape('M' + pt(x - 5, g.ankle - 12) + ' L' + pt(x + 5, g.ankle - 12) + ' L' + pt(x + 5.5, y - 6) + ' Q' + pt(x + 11, y - 6) + ' ' + pt(x + 10, y) +
        ' L' + pt(x - 8, y) + ' Q' + pt(x - 9, y - 5) + ' ' + pt(x - 5.5, y - 6) + ' Z', c.f('feet')) +
        line(open([[x - 5, g.ankle - 8], [x + 5, g.ankle - 8]]), .8);
    }) }; },
    'clown-shoes': function (g, c) { return { feet: pair(g, function (x, s) {
      var y = g.sole, F = c.f('feet');
      return shape(poly([[x - 5, y - 13], [x + 5, y - 13], [x + 6, y - 5], [x - 6, y - 5]]), F, 1.1) +
        oval(x + s * 7, y - 2.5, 15, 6.5, F, 1.3) + line(open([[x - 5, y - 9], [x + 5, y - 9]]), 1.3) + dot(x + s * 3.5, y - 9, 1.8, INK);
    }) }; },

    // ── Fantasy Fancy Dress: faery wings, behind everything ──
    'dragonfly-wings': function (g, c) { var F = c.f('wings'); return { back: wingPair(function (s) {
      var a = petal(s * 5, g.sh + 6, sideAng(s, -30), g.S + 40, 15), b = petal(s * 5, g.sh + 14, sideAng(s, 18), g.S + 32, 13);
      return veil(a, F, .7) + veil(b, F, .7) +
        line(open([[s * 5, g.sh + 6], [s * (5 + (g.S + 36) * .866), g.sh + 6 - (g.S + 36) * .5]]), .6) +
        line(open([[s * 5, g.sh + 14], [s * (5 + (g.S + 28) * .951), g.sh + 14 + (g.S + 28) * .309]]), .6);
    }) }; },
    'butterfly-wings': function (g, c) { var F = c.f('wings'), S = g.S, sh = g.sh; return { back: wingPair(function (s) {
      var up = 'M' + pt(s * 4, sh + 4) + ' C' + pt(s * (S + 8), sh - 52) + ' ' + pt(s * (S + 48), sh - 34) + ' ' + pt(s * (S + 40), sh + 4) +
        ' Q' + pt(s * (S + 20), sh + 20) + ' ' + pt(s * 6, sh + 12) + ' Z';
      var low = 'M' + pt(s * 6, sh + 14) + ' C' + pt(s * (S + 30), sh + 18) + ' ' + pt(s * (S + 32), sh + 54) + ' ' + pt(s * (S + 12), sh + 62) +
        ' Q' + pt(s * 10, sh + 50) + ' ' + pt(s * 6, sh + 14) + ' Z';
      return veil(up, F, .65) + veil(low, F, .65) + dot(s * (S + 26), sh - 14, 5, 'none', 1) + dot(s * (S + 16), sh + 40, 3.5, 'none', .9);
    }) }; },
    'moth-wings': function (g, c) { var F = c.f('wings'), S = g.S, sh = g.sh; return { back: wingPair(function (s) {
      var up = 'M' + pt(s * 4, sh + 4) + ' Q' + pt(s * (S + 18), sh - 40) + ' ' + pt(s * (S + 48), sh - 18) + ' Q' + pt(s * (S + 56), sh + 14) +
        ' ' + pt(s * (S + 32), sh + 22) + ' Q' + pt(s * 16, sh + 22) + ' ' + pt(s * 6, sh + 12) + ' Z';
      var low = 'M' + pt(s * 6, sh + 14) + ' Q' + pt(s * (S + 34), sh + 24) + ' ' + pt(s * (S + 28), sh + 54) + ' Q' + pt(s * (S + 8), sh + 66) +
        ' ' + pt(s * 8, sh + 28) + ' Z';
      var edge = '';
      for (var i = 0; i < 5; i++) edge += dot(s * (S + 46 - i * 5), sh - 12 + i * 7, 2.2, F, .7);
      return veil(up, F, .75) + veil(low, F, .75) + edge + oval(s * (S + 24), sh - 4, 6, 4.5, 'none', 1) + dot(s * (S + 24), sh - 4, 1.8, INK);
    }) }; },
    'great-wings': function (g, c) { var F = c.f('wings'), top = g.sh - g.y0 + 44, low = g.hip - g.sh + 30; return { back: wingPair(function (s) {
      return veil(petal(s * 5, g.sh + 4, sideAng(s, -64), top / .9, 30), F, .7) + veil(petal(s * 5, g.sh + 6, sideAng(s, -26), g.S + 44, 24), F, .7) +
        veil(petal(s * 5, g.sh + 12, sideAng(s, 40), low * .82, 22), F, .7) + veil(petal(s * 5, g.sh + 14, sideAng(s, 70), low * .92, 14), F, .7);
    }) }; },
    // Bat wings: a membrane from the shoulders out to a tip, its lower edge
    // scalloped between the ribs.
    'bat-wings': function (g, c) { var F = c.f('wings'), S = g.S, sh = g.sh; return { back: wingPair(function (s) {
      var root = [S * .5, sh - 8], tip = [S + 50, sh - 30];
      var tips = [[S + 46, sh + 8], [S + 30, sh + 26], [S + 12, sh + 40], [6, sh + 44]];
      var d = 'M' + pt(s * 4, sh + 2) + ' Q' + pt(s * (S + 10), sh - 32) + ' ' + pt(s * tip[0], tip[1]), prev = tip, ribs = '';
      tips.forEach(function (q, i) {
        var m = lerp(lerp(prev, q, .5), root, .22);
        d += ' Q' + pt(s * m[0], m[1]) + ' ' + pt(s * q[0], q[1]);
        if (i < 3) ribs += line(open([[s * root[0], root[1]], [s * q[0], q[1]]]), .9);
        prev = q;
      });
      return shape(d + ' Z', F, 1.2) + ribs + line(open([[s * root[0], root[1]], [s * tip[0], tip[1]]]), 1.1);
    }) }; },

    // ── Animal ears, on a band ──
    'cat-ears': function (g, c) { var y = g.y0, rx = g.rx, ry = g.ry, F = c.f('ears'); return { top: wingPair(function (s) {
      return shape(poly([[s * rx * .18, y - ry * .9], [s * rx * .96, y - ry * .58], [s * rx * .82, y - ry - 17]]), F) +
        plain(poly([[s * rx * .38, y - ry * .9], [s * rx * .8, y - ry * .7], [s * rx * .74, y - ry - 9]]), inkColour('coral'));
    }) + earBand(g, F) }; },
    'fox-ears': function (g, c) { var y = g.y0, rx = g.rx, ry = g.ry, F = c.f('ears'); return { top: wingPair(function (s) {
      return shape(poly([[s * rx * .12, y - ry * .92], [s * rx * 1.02, y - ry * .5], [s * rx * .86, y - ry - 25]]), F) +
        plain(poly([[s * rx * .34, y - ry * .9], [s * rx * .84, y - ry * .64], [s * rx * .78, y - ry - 15]]), inkColour('cream'));
    }) + earBand(g, F) }; },
    'bunny-ears': function (g, c) { var y = g.y0, rx = g.rx, ry = g.ry, F = c.f('ears'); return { top: wingPair(function (s) {
      return shape(petal(s * rx * .36, y - ry * .82, sideAng(s, -80), 38, 10), F) +
        plain(petal(s * rx * .36, y - ry * .95, sideAng(s, -80), 28, 4.5), inkColour('coral'));
    }) + earBand(g, F) }; },
    'bear-ears': function (g, c) { var y = g.y0, rx = g.rx, ry = g.ry, F = c.f('ears'); return { top: wingPair(function (s) {
      return dot(s * rx * .76, y - ry * .84, 8, F, 1.3) + dot(s * rx * .76, y - ry * .84, 3.8, inkColour('coral'));
    }) + earBand(g, F) }; },
    'mouse-ears': function (g, c) { var y = g.y0, rx = g.rx, ry = g.ry, F = c.f('ears'); return { top: wingPair(function (s) {
      return dot(s * rx * .92, y - ry * .7, 12.5, F, 1.3) + dot(s * rx * .92, y - ry * .7, 7, inkColour('coral'));
    }) + earBand(g, F) }; },
    'wolf-ears': function (g, c) { var y = g.y0, rx = g.rx, ry = g.ry, F = c.f('ears'); return { top: wingPair(function (s) {
      return shape(poly([[s * rx * .22, y - ry * .88], [s * rx * 1.04, y - ry * .48], [s * rx * .92, y - ry - 21]]), F) +
        plain(poly([[s * rx * .42, y - ry * .86], [s * rx * .9, y - ry * .58], [s * rx * .86, y - ry - 11]]), inkColour('silver')) +
        line('M' + pt(s * rx * .92, y - ry - 21) + ' l' + f(s * 1.5) + ' -4 M' + pt(s * rx * .88, y - ry - 18) + ' l' + f(-s * 1.5) + ' -4', 1.1);
    }) + earBand(g, F) }; },
    'bat-ears': function (g, c) { var y = g.y0, rx = g.rx, ry = g.ry, F = c.f('ears'); return { top: wingPair(function (s) {
      return shape(poly([[s * rx * .3, y - ry * .86], [s * (rx + 4), y - ry * .3], [s * (rx + 10), y - ry - 16]]), F) +
        plain(poly([[s * rx * .5, y - ry * .8], [s * (rx + 1), y - ry * .44], [s * (rx + 6), y - ry - 8]]), inkColour('plum'));
    }) + earBand(g, F) }; },

    // ── Tails, behind the legs ──
    'cat-tail': function (g, c) {
      var H = g.H, h = g.hip, d = g.seated ?
        'M' + pt(H * .4, h - 4) + ' Q' + pt(H + 26, h - 6) + ' ' + pt(H + 30, h + 18) + ' Q' + pt(H + 34, h + 40) + ' ' + pt(H + 44, h + 30) :
        'M' + pt(H * .4, h) + ' Q' + pt(H + 24, h + 6) + ' ' + pt(H + 20, h + 40) + ' Q' + pt(H + 16, h + 66) + ' ' + pt(H + 30, h + 60);
      return { back: tube(d, 4.5, c.f('tail')) };
    },
    'fox-tail': function (g, c) {
      var H = g.H, h = g.hip, P = g.seated ? bend([H * .4, h - 4], [H + 30, h - 4], [H + 40, h + 30], 8) : bend([H * .4, h], [H + 30, h + 10], [H + 30, h + 58], 8);
      var w = [3, 6, 9, 11, 12, 11, 9, 6, 1.5];
      var tip = P.slice(6), tw = w.slice(6);
      return { back: shape(poly(strip(P, w)), c.f('tail')) + shape(poly(strip(tip, tw)), inkColour('cream'), 1) };
    },
    // Sitting down, a short tail would be behind the wheel, so it is drawn at
    // the side of the seat, where it can be seen.
    'bunny-tail': function (g, c) { var d = dot(g.H + (g.seated ? 6 : 9), g.hip + (g.seated ? 2 : 10), 7.5, c.f('tail'), 1.2); return g.seated ? { side: d } : { back: d }; },
    'bear-tail': function (g, c) { var d = dot(g.H + (g.seated ? 5 : 8), g.hip + (g.seated ? 2 : 8), 5.5, c.f('tail'), 1.2); return g.seated ? { side: d } : { back: d }; },
    'dragon-tail': function (g, c) {
      var H = g.H, h = g.hip, F = c.f('tail');
      var P = g.seated ? bend([H * .4, h - 4], [H + 36, h + 6], [H + 42, g.sole - 2], 10) : bend([H * .4, h], [H + 30, h + 30], [H + 46, g.sole - 2], 10);
      var w = P.map(function (q, i) { return 8 - i * .62; });
      var spikes = '';
      for (var i = 2; i < P.length - 1; i += 2) {
        var a = P[i - 1], b = P[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1;
        var nx = dy / l, ny = -dx / l, wd = w[i];
        spikes += shape(poly([[P[i][0] + nx * wd - dx * .3, P[i][1] + ny * wd - dy * .3], [P[i][0] + nx * (wd + 6), P[i][1] + ny * (wd + 6)],
          [P[i][0] + nx * wd + dx * .3, P[i][1] + ny * wd + dy * .3]]), F, 1);
      }
      return { back: spikes + shape(poly(strip(P, w)), F) };
    },
    'unicorn-tail': function (g, c) {
      var H = g.H, h = g.hip, F = c.f('tail');
      var P = g.seated ? bend([H * .4, h - 4], [H + 26, h], [H + 22, h + 46], 8) : bend([H * .4, h], [H + 24, h + 16], [H + 14, h + 74], 8);
      var w = [3, 5, 7, 8, 9, 9, 8, 7, 5];
      var strands = '';
      [-.5, 0, .5].forEach(function (k) {
        strands += line(open(P.slice(2).map(function (q, i) { return [q[0] + k * w[i + 2], q[1]]; })), .7);
      });
      return { back: shape(poly(strip(P, w)), F) + strands };
    },
    'wolf-tail': function (g, c) {
      var H = g.H, h = g.hip, P = g.seated ? bend([H * .4, h - 4], [H + 34, h + 4], [H + 36, h + 44], 8) : bend([H * .4, h], [H + 24, h + 22], [H + 20, h + 74], 8);
      var w = [3, 6, 8.5, 10, 10.5, 10, 8.5, 6, 2];
      return { back: shape(poly(strip(P, w)), c.f('tail')) + shape(poly(strip(P.slice(6), w.slice(6))), inkColour('coal'), 1) };
    },

    // ── Paws, over the hands ──
    'cat-paws': function (g, c) { return { hands: bothHands(g, function (h) {
      return dot(h[0], h[1], g.a * 1.05, c.f('paws'), 1.2) + dot(h[0], h[1] + 1.6, g.a * .36, inkColour('coral')) +
        dot(h[0] - 2.5, h[1] - 2.4, g.a * .17, inkColour('coral')) + dot(h[0], h[1] - 3.2, g.a * .17, inkColour('coral')) + dot(h[0] + 2.5, h[1] - 2.4, g.a * .17, inkColour('coral'));
    }) }; },
    'bear-paws': function (g, c) { return { hands: bothHands(g, function (h) {
      return dot(h[0], h[1], g.a * 1.3, c.f('paws'), 1.2) + oval(h[0], h[1] + .5, g.a * .62, g.a * .5, inkColour('cream'), .8) +
        line('M' + pt(h[0] - 3, h[1] + g.a * 1.1) + ' v3 M' + pt(h[0], h[1] + g.a * 1.25) + ' v3 M' + pt(h[0] + 3, h[1] + g.a * 1.1) + ' v3', 1.4);
    }) }; },
    'dragon-claws': function (g, c) { return { hands: bothHands(g, function (h) {
      var claws = '';
      [-3, 0, 3].forEach(function (x) {
        claws += shape(poly([[h[0] + x - 1.5, h[1] + g.a * .8], [h[0] + x + 1.5, h[1] + g.a * .8], [h[0] + x, h[1] + g.a * .8 + 5]]), inkColour('cream'), .8);
      });
      return claws + dot(h[0], h[1], g.a * 1.12, c.f('paws'), 1.2) + line('M' + pt(h[0] - 2.5, h[1] - 1) + ' q2.5 -2 5 0 M' + pt(h[0] - 2.5, h[1] + 2) + ' q2.5 -2 5 0', .7);
    }) }; },
    'wolf-claws': function (g, c) { return { hands: bothHands(g, function (h) {
      var claws = '';
      [-3.6, -1.2, 1.2, 3.6].forEach(function (x) {
        claws += shape(poly([[h[0] + x - 1, h[1] + g.a * .85], [h[0] + x + 1, h[1] + g.a * .85], [h[0] + x * 1.1, h[1] + g.a * .85 + 4]]), inkColour('silver'), .7);
      });
      return claws + dot(h[0], h[1], g.a * 1.15, c.f('paws'), 1.2) +
        line('M' + pt(h[0] - 3, h[1] - g.a * .9) + ' l1 -2 M' + pt(h[0], h[1] - g.a) + ' l0 -2.4 M' + pt(h[0] + 3, h[1] - g.a * .9) + ' l-1 -2', .8);
    }) }; },

    // ── Necklaces and beads ──
    'bead-necklace': function (g, c) {
      var out = '';
      bend([-9.5, g.sh - 2], [0, g.sh + 17], [9.5, g.sh - 2], 10).forEach(function (q) { out += dot(q[0], q[1], 1.9, c.f('neck'), .7); });
      return { top: out };
    },
    'chunky-beads': function (g, c) {
      var out = '';
      bend([-11, g.sh - 1], [0, g.sh + 20], [11, g.sh - 1], 6).forEach(function (q) { out += dot(q[0], q[1], 3.3, c.f('neck'), 1); });
      return { top: out };
    },
    'pendant': function (g, c) {
      return { top: line('M' + pt(-9, g.sh - 2) + ' Q' + pt(0, g.sh + 16) + ' ' + pt(9, g.sh - 2), .8) +
        shape(petal(0, g.sh + 6.5, 90, 10, 5), c.f('neck'), 1) };
    },
    'choker': function (g, c) {
      return { top: shape(poly([[-7.5, g.sh - 6], [7.5, g.sh - 6], [7.5, g.sh - 2], [-7.5, g.sh - 2]]), c.f('neck'), 1) + dot(0, g.sh, 2, c.f('neck'), .8) };
    },
    'neck-bolts': function (g, c) {
      var y = g.sh - 7, F = c.f('neck');
      return { top: wingPair(function (s) {
        return shape(poly([[s * 6, y - 2], [s * 12, y - 2], [s * 12, y + 2], [s * 6, y + 2]]), F, .9) +
          shape(poly([[s * 12, y - 3.6], [s * 15.5, y - 3.6], [s * 15.5, y + 3.6], [s * 12, y + 3.6]]), F, 1);
      }) };
    },
    'web-choker': function (g, c) {
      var F = c.f('neck'), y = g.sh - 4, lace = '';
      for (var x = -6; x <= 6; x += 3) lace += ' M' + pt(x, y + 1.5) + ' L' + pt(x * .6, y + 6);
      return { top: shape(poly([[-7.5, y - 2.5], [7.5, y - 2.5], [7.5, y + 1.5], [-7.5, y + 1.5]]), F, 1) +
        line(lace.slice(1) + ' M' + pt(-5, y + 4) + ' Q' + pt(0, y + 6) + ' ' + pt(5, y + 4), .6) +
        line('M' + pt(-3, y + 7) + ' l6 3 M' + pt(3, y + 7) + ' l-6 3 M' + pt(-3.4, y + 8.5) + ' h6.8', .7) + dot(0, y + 8.5, 2.2, INK) };
    },

    // ── Rings and bracelets ──
    'rings': function (g, c) { return { hands: bothHands(g, function (h, s) {
      return dot(h[0] + s * 1.2, h[1] + 2, 1.6, c.f('wrists'), .8) + dot(h[0] - s * 2, h[1] + 3, 1.4, c.f('wrists'), .8);
    }) }; },
    'bead-bracelets': function (g, c) { return { hands: bothHands(g, function (h, s) {
      var A = armLine(g, s), w = lerp(A[1], A[2], .9), dx = A[2][0] - A[1][0], dy = A[2][1] - A[1][1], l = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = -dy / l, ny = dx / l, out = '';
      for (var k = -1.5; k <= 1.5; k++) out += dot(w[0] + nx * k * g.a * .55, w[1] + ny * k * g.a * .55, 1.5, c.f('wrists'), .7);
      return out;
    }) }; },
    'bangles': function (g, c) { return { hands: bothHands(g, function (h, s) {
      var A = armLine(g, s), w1 = lerp(A[1], A[2], .86), w2 = lerp(A[1], A[2], .78);
      return oval(w1[0], w1[1], g.a + 1.5, 1.9, c.f('wrists'), .9) + oval(w2[0], w2[1], g.a + 2, 1.9, c.f('wrists'), .9);
    }) }; },
    'spider-rings': function (g, c) { return { hands: bothHands(g, function (h, s) {
      var x = h[0] + s, y = h[1] + 2.5, legs = '';
      [-1, 1].forEach(function (k) {
        legs += ' M' + pt(x, y) + ' l' + f(k * 3) + ' -2 M' + pt(x, y) + ' l' + f(k * 3.2) + ' 1 M' + pt(x, y) + ' l' + f(k * 2.6) + ' 3';
      });
      return line(legs.slice(1), .7) + dot(x, y, 1.9, c.f('wrists'), .7);
    }) }; },
    'bone-bangles': function (g, c) { return { hands: bothHands(g, function (h, s) {
      var A = armLine(g, s), w = lerp(A[1], A[2], .84), F = c.f('wrists'), out = oval(w[0], w[1], g.a + 1.8, 2.2, 'none', 1);
      [-1, 0, 1].forEach(function (k) {
        var x = w[0] + k * g.a * .7, y = w[1] + 1;
        out += tube(open([[x - 1.6, y], [x + 1.6, y]]), 1.4, F) + dot(x - 1.9, y, 1.2, F, .5) + dot(x + 1.9, y, 1.2, F, .5);
      });
      return out;
    }) }; },

    // ── Onesies and dress-up suits ──
    'onesie': function (g, c) {
      var F = c.f('suit'), hd = hood(g, F);
      return { body: suitBody(g, F), sleeves: suitSleeves(g, F), hood: hd.back, top: hd.rim };
    },
    'tiger-suit': function (g, c) {
      var F = c.f('suit'), hd = hood(g, F), y = g.y0, rx = g.rx, ry = g.ry;
      var st = limbStripes(g, INK), stripes = st.legs, armStripes = st.arms;
      var hoodStripes = plain(poly([[-6, y - ry - 14], [0, y - ry - 6], [6, y - ry - 14]]), INK) +
        plain(poly([[-rx - 4, y - ry * .7], [-rx + 4, y - ry * .62], [-rx - 3, y - ry * .5]]), INK) +
        plain(poly([[rx + 4, y - ry * .7], [rx - 4, y - ry * .62], [rx + 3, y - ry * .5]]), INK);
      var ears = wingPair(function (s) { return dot(s * rx * .82, y - ry - 11, 6.5, F, 1.3) + dot(s * rx * .82, y - ry - 11, 3, INK); });
      return { body: suitBody(g, F) + stripes, sleeves: suitSleeves(g, F) + armStripes, hood: hd.back, top: ears + hd.rim + hoodStripes };
    },
    'bear-suit': function (g, c) {
      var F = c.f('suit'), hd = hood(g, F), y = g.y0, rx = g.rx, ry = g.ry;
      var ears = wingPair(function (s) { return dot(s * rx * .84, y - ry - 10, 8, F, 1.3) + dot(s * rx * .84, y - ry - 10, 3.8, inkColour('cream')); });
      return { body: suitBody(g, F) + oval(0, (g.pit + g.hip) / 2 + 4, g.W * .55, (g.hip - g.pit) * .42, inkColour('cream'), 1),
        sleeves: suitSleeves(g, F), hood: hd.back, top: ears + hd.rim };
    },
    'dragon-suit': function (g, c) {
      var F = c.f('suit'), hd = hood(g, F), y = g.y0, rx = g.rx, ry = g.ry, spikes = '', scales = '';
      [-12, -6, 0, 6, 12].forEach(function (x) {
        var b = y - ry - 14 + x * x / 50;
        spikes += shape(poly([[x - 3.5, b + 1], [x, b - 9], [x + 3.5, b + 1]]), F, 1.1);
      });
      var mid = (g.pit + g.hip) / 2 + 4, bw = g.W * .48, bh = (g.hip - g.pit) * .46;
      for (var yy = mid - bh + 6; yy < mid + bh - 2; yy += 6) scales += line('M' + pt(-bw * .7, yy) + ' Q' + pt(0, yy + 3) + ' ' + pt(bw * .7, yy), .7);
      var horns = wingPair(function (s) { return shape(poly([[s * rx * .5, y - ry - 8], [s * rx * .74, y - ry - 6], [s * rx * .78, y - ry - 18]]), inkColour('cream'), 1); });
      return { body: suitBody(g, F) + oval(0, mid, bw, bh, inkColour('cream'), 1) + scales,
        sleeves: suitSleeves(g, F), hood: hd.back, top: spikes + horns + hd.rim };
    },
    'chimera-onesie': chimeraOnesie,
    'unicorn-suit': function (g, c) {
      var F = c.f('suit'), hd = hood(g, F), y = g.y0, rx = g.rx, ry = g.ry, mane = '';
      var manes = ['hotpink', 'violet', 'sky', 'mint', 'marigold'];
      for (var i = 0; i < 7; i++) mane += dot(rx + 7 - i * .3, y - ry - 8 + i * 6, 4.4, inkColour(manes[i % manes.length]), 1);
      var ears = wingPair(function (s) { return shape(poly([[s * rx * .5, y - ry - 10], [s * rx * .92, y - ry - 8], [s * rx * .78, y - ry - 22]]), F, 1.1); });
      var horn = shape(poly([[-4, y - ry - 13], [4, y - ry - 13], [0, y - ry - 38]]), inkColour('gold'), 1.2) +
        line('M' + pt(-3, y - ry - 19) + ' l6 -2 M' + pt(-2, y - ry - 25) + ' l4 -1.6 M' + pt(-1, y - ry - 31) + ' l2.2 -1', .8);
      return { body: suitBody(g, F), sleeves: suitSleeves(g, F), hood: hd.back, top: ears + hd.rim + mane + horn };
    },
    // Halloween's suits (2026-10-28). The hooded ones hide the hair as every
    // suit with a hood does; the clown's, the pirate's and the vampire's have
    // no hood, so the hair shows.
    'mummy-wraps': function (g, c) {
      var F = c.f('suit'), hd = hood(g, F), y = g.y0, rx = g.rx, ry = g.ry, wr = '', ar = '';
      for (var yy = g.sh + 10; yy < g.hip + 4; yy += 7) wr += ' M' + pt(-halfAt(g, yy) - 3.5, yy) + ' L' + pt(halfAt(g, yy + 5) + 3.5, yy + 5);
      [-1, 1].forEach(function (s) {
        var leg = g.seated ? [[s * g.H * .55, g.hip + 4], [s * g.kx, g.knee], [s * g.kx, g.ankle - 4]] : [[s * g.H * .5, g.hip + 12], [s * g.kx, g.knee], [s * g.ax, g.ankle - 4]];
        for (var k = 1; k < 6; k++) {
          var t = k / 6, P = t < .5 ? lerp(leg[0], leg[1], t * 2) : lerp(leg[1], leg[2], (t - .5) * 2), w = g.kw + 4;
          wr += ' M' + pt(P[0] - w, P[1] - 2) + ' L' + pt(P[0] + w, P[1] + 2);
        }
        var A = armLine(g, s), far = s === -1 && g.short ? .55 : .9;
        [.25, .5, .75, 1].forEach(function (t) {
          var P = t <= .5 ? lerp(A[0], A[1], t * 2) : lerp(A[1], A[2], (t - .5) * 2 * far), w = g.a + 3;
          ar += ' M' + pt(P[0] - w, P[1] - 2) + ' L' + pt(P[0] + w, P[1] + 2);
        });
      });
      var end = bend([g.H + 3, g.hip], [g.H + 14, g.hip + 16], [g.H + 10, g.hip + 42], 6);
      return { body: suitBody(g, F) + line(wr.slice(1), .9) + shape(poly(strip(end, [2.4, 2.4, 2.4, 2.4, 2.2, 2, 1.8])), F, 1),
        sleeves: suitSleeves(g, F) + line(ar.slice(1), .9), hood: hd.back,
        top: hd.rim + line('M' + pt(-rx - 6, y - ry * .62) + ' L' + pt(rx + 6, y - ry * .42) + ' M' + pt(-rx - 7, y - ry * .2) + ' L' + pt(-rx * .4, y - ry - 6), .9) };
    },
    'skeleton-suit': function (g, c) {
      var F = c.f('suit'), hd = hood(g, F), bone = inkColour('cream'), out = '', arms = '';
      for (var i = 0; i < 4; i++) {
        var yy = g.pit - 6 + i * 8, hw = halfAt(g, yy) * .62;
        out += tube('M' + pt(-hw, yy + 3) + ' Q' + pt(0, yy - 3) + ' ' + pt(hw, yy + 3), 1.8, bone);
      }
      out += tube(open([[0, g.sh + 4], [0, g.hip - 6]]), 2, bone) +
        tube('M' + pt(-g.H * .62, g.hip - 8) + ' Q' + pt(0, g.hip + 8) + ' ' + pt(g.H * .62, g.hip - 8), 2.4, bone);
      [-1, 1].forEach(function (s) {
        var knee = [s * g.kx, g.knee];
        out += tube(open([[s * g.H * .5, g.hip + 8], knee, [s * g.ax, g.ankle - 8]]), 2.4, bone) + dot(knee[0], knee[1], 2.6, bone, .9);
        var A = armLine(g, s), far = s === -1 && g.short ? .5 : .9;
        arms += tube(open([lerp(A[0], A[1], .2), A[1], lerp(A[1], A[2], far)]), 2, bone) + dot(A[1][0], A[1][1], 2.2, bone, .9);
      });
      return { body: suitBody(g, F) + out, sleeves: suitSleeves(g, F) + arms, hood: hd.back, top: hd.rim };
    },
    // A ghost's robe over a hooded suit, so it hangs to a scalloped hem and
    // the suit's legs carry on below it.
    'ghost-suit': function (g, c) {
      var F = c.f('suit'), hd = hood(g, F), hem = g.seated ? g.knee + 18 : g.knee + 22, w = Math.max(g.H, g.W) + 14;
      var d = 'M' + pt(-g.S + 2, g.sh - 1) + ' L' + pt(g.S - 2, g.sh - 1) + ' Q' + pt(w - 4, g.hip - 20) + ' ' + pt(w, hem);
      for (var i = 0; i < 5; i++) {
        var x0 = w - 2 * w * i / 5, x1 = w - 2 * w * (i + 1) / 5;
        d += ' Q' + pt((x0 + x1) / 2, hem + 9) + ' ' + pt(x1, hem);
      }
      d += ' Q' + pt(-w + 4, g.hip - 20) + ' ' + pt(-g.S + 2, g.sh - 1) + ' Z';
      return { body: suitBody(g, F) + shape(d, F), sleeves: shape(sleeve(g, -1, 1, 4, 7), F) + shape(sleeve(g, 1, 1, 4, 7), F),
        hood: hd.back, top: hd.rim };
    },
    'pumpkin-suit': function (g, c) {
      var F = c.f('suit'), hd = hood(g, F), y = g.y0, ry = g.ry;
      var mid = (g.pit + g.hip) / 2 + 2, rw = Math.max(g.W, g.H) + 12, rh = (g.hip - g.pit) * .62 + 6;
      var ribs = line('M' + pt(-rw * .45, mid - rh * .92) + ' Q' + pt(-rw * .66, mid) + ' ' + pt(-rw * .45, mid + rh * .92) +
        ' M' + pt(rw * .45, mid - rh * .92) + ' Q' + pt(rw * .66, mid) + ' ' + pt(rw * .45, mid + rh * .92) +
        ' M' + pt(0, mid - rh) + ' L' + pt(0, mid + rh), 1);
      var stalk = shape(poly([[-2.5, y - ry - 12], [2.5, y - ry - 12], [3.5, y - ry - 22], [-1, y - ry - 21]]), inkColour('moss'), 1) +
        shape(petal(2.5, y - ry - 17, -20, 12, 4), inkColour('lime'), .8);
      return { body: suitBody(g, F) + oval(0, mid, rw, rh, F, 1.3) + ribs, sleeves: suitSleeves(g, F), hood: hd.back, top: stalk + hd.rim };
    },
    // Wings from the wrists to the waist, under the sleeves, scalloped
    // between the arm and the side.
    'bat-suit': function (g, c) {
      var F = c.f('suit'), hd = hood(g, F), y = g.y0, rx = g.rx, ry = g.ry;
      var flaps = wingPair(function (s) {
        var A = armLine(g, s), el = A[1], wr = lerp(A[1], A[2], s === -1 && g.short ? .5 : .85);
        var root = [s * (halfAt(g, g.waist) + 3), g.waist], a = [wr[0] + s * g.a, wr[1]], mid = lerp(a, root, .5);
        var d = 'M' + pt(s * (g.C + 2), g.pit) + ' L' + pt(el[0] + s * g.a, el[1]) + ' L' + pt(a[0], a[1]) +
          ' Q' + pt(lerp(lerp(a, mid, .5), [0, g.pit], .2)[0], lerp(lerp(a, mid, .5), [0, g.pit], .2)[1]) + ' ' + pt(mid[0], mid[1]) +
          ' Q' + pt(lerp(lerp(mid, root, .5), [0, g.pit], .2)[0], lerp(lerp(mid, root, .5), [0, g.pit], .2)[1]) + ' ' + pt(root[0], root[1]) + ' Z';
        return shape(d, F, 1.1);
      });
      var ears = wingPair(function (s) { return shape(poly([[s * rx * .4, y - ry - 8], [s * (rx + 6), y - ry * .5], [s * (rx + 8), y - ry - 22]]), F, 1.1); });
      return { body: suitBody(g, F) + flaps, sleeves: suitSleeves(g, F), hood: hd.back, top: ears + hd.rim };
    },
    'clown-suit': function (g, c) {
      var F = c.f('suit'), hem = g.seated ? g.ankle - 2 : g.ankle - 3, ruff = '', poms = '';
      for (var i = 0; i < 9; i++) ruff += dot(-14 + i * 3.5, g.sh - 1 + Math.abs(i - 4) * -1 + 4, 4.4, inkColour('cream'), 1);
      for (var k = 0; k < 3; k++) poms += dot(0, g.pit + 6 + k * 15, 3.2, inkColour('tomato'), 1);
      return { body: shape(trousers(g, 6, hem, 5, 0), F) + shape(bodice(g, 6, g.hip + 12, 'crew'), F) + ruff + poms,
        sleeves: shape(sleeve(g, -1, 1, 5, 6), F) + shape(sleeve(g, 1, 1, 5, 6), F) };
    },
    'pirate-outfit': function (g, c) {
      var F = c.f('suit'), hem = hemAt(g, 'knee') + (g.seated ? -2 : 4), sash = inkColour('tomato'), wy = g.waist, hw = halfAt(g, wy) + 4.5;
      return { body: shape(trousers(g, 3, hem, 2, 0), F) + shape(bodice(g, 4, g.hip + 4, 'v'), F) +
          line('M' + pt(-3, g.sh + 6) + ' l6 3 M' + pt(3, g.sh + 6) + ' l-6 3 M' + pt(-3, g.sh + 11) + ' l6 3', .8) +
          shape(poly([[-hw, wy - 4], [hw, wy - 4], [halfAt(g, wy + 8) + 4.5, wy + 6], [-halfAt(g, wy + 8) - 4.5, wy + 6]]), sash, 1.1) +
          shape(poly([[hw * .6, wy + 2], [hw * .6 + 5, wy + 20], [hw * .6 + 9, wy + 18], [hw * .6 + 4, wy + 2]]), sash, 1) + dot(hw * .6, wy + 1, 3, sash, 1),
        sleeves: shape(sleeve(g, -1, .92, 4.5, 4), F) + shape(sleeve(g, 1, .92, 4.5, 4), F) };
    },
    // A tailcoat open over a waistcoat, with a cravat at the neck.
    'vampire-suit': function (g, c) {
      var F = c.f('suit'), hem = g.seated ? g.ankle - 2 : g.ankle - 3, tail = g.seated ? g.knee + 4 : hemAt(g, 'knee') - 6, cream = inkColour('cream'), btn = '';
      for (var y = g.pit + 8; y < g.hip; y += 11) btn += dot(0, y, 1.6, INK);
      return { body: shape(trousers(g, 2.5, hem, 1, 0), F) + shape(bodice(g, 2, g.hip + 2, 'v'), inkColour('tomato')) + btn +
          shape(panel(g, 4, tail, 8, -1, 4), F) + shape(panel(g, 4, tail, 8, 1, 4), F) +
          dot(0, g.sh + 2, 3.4, cream, 1) + dot(-2.6, g.sh + 6, 3, cream, 1) + dot(2.6, g.sh + 6, 3, cream, 1) + dot(0, g.sh + 10, 3, cream, 1),
        sleeves: shape(sleeve(g, -1, 1, 3, 1), F) + shape(sleeve(g, 1, 1, 3, 1), F) };
    },

    // ── Face paint and fangs ── (`paint` is under the eyes and mouth, `face`
    // over them; what you always have with you, a mask or glasses, goes over
    // both, because nothing put on here takes it off.)
    'vampire-fangs': function (g, c) {
      var my = g.y0 + 15, F = c.f('face');
      return { face: wingPair(function (s) { return shape(poly([[s * 1.4, my + .3], [s * 3.6, my + .3], [s * 2.4, my + 4.6]]), F, .7); }) };
    },
    'clown-face': function (g, c) {
      var y = g.y0, rx = g.rx, F = c.f('face');
      return { paint: dot(-rx * .58, y + 10, 4.6, F) + dot(rx * .58, y + 10, 4.6, F),
        face: line('M' + pt(-9, y + 13) + ' Q' + pt(0, y + 23) + ' ' + pt(9, y + 13), 2, F) + dot(0, y + 9, 4.4, F, 1.1) };
    },
    'whisker-paint': function (g, c) {
      var y = g.y0, rx = g.rx, F = c.f('face'), w = '';
      [-1, 1].forEach(function (s) { [-2.5, 0, 2.5].forEach(function (k) { w += ' M' + pt(s * 5, y + 11 + k * .4) + ' L' + pt(s * (rx - 3), y + 11 + k * 1.6); }); });
      return { face: line(w.slice(1), 1.1, F) + dot(0, y + 9.5, 2.6, F) };
    },
    'skull-face': function (g, c) {
      var y = g.y0, ex = g.rx * .42, my = y + 15, F = c.f('face'), dark = inkColour('coal'), teeth = '', rings = '';
      for (var x = -4; x <= 4; x += 2) teeth += ' M' + pt(x, my - 2) + ' v4';
      [-1, 1].forEach(function (s) { rings += '<circle cx="' + f(CX + s * ex) + '" cy="' + f(y + 1) + '" r="6" fill="none" stroke="' + dark + '" stroke-width="2.6"/>'; });
      return { paint: plain(facePath(g, g.face), F),
        face: rings + shape(poly([[-2.4, y + 7], [2.4, y + 7], [0, y + 11]]), dark, .6) + line(open([[-5, my], [5, my]]) + teeth, .9, dark) };
    },

    // ── Something to hold ── (in a hand nothing else is in; see held())
    'wizard-staff': function (g, c) {
      var F = c.f('held');
      function staff(a, b) { return tube(open([a, b]), 2.8, F) + shape(poly([[b[0], b[1] - 11], [b[0] + 4.5, b[1] - 5], [b[0], b[1] + 1], [b[0] - 4.5, b[1] - 5]]), inkColour('violet'), 1); }
      return held(g, function (h, s) { return staff([h[0] + s * 3, g.sole], [h[0] + s, h[1] - (g.seated ? 84 : 76)]); },
        function (low, high) { return staff(low, high); }, true, F);
    },
    'witch-broom': function (g, c) {
      var F = c.f('held');
      function broom(top, end) {
        var dx = end[0] - top[0], dy = end[1] - top[1], l = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
        var e = [end[0] + ux * 16, end[1] + uy * 16], straw = '';
        [-.5, 0, .5].forEach(function (k) { straw += ' M' + pt(end[0] + nx * k * 3, end[1] + ny * k * 3) + ' L' + pt(e[0] + nx * k * 14, e[1] + ny * k * 14); });
        return tube(open([top, end]), 2, F) +
          shape(poly([[end[0] + nx * 3, end[1] + ny * 3], [end[0] - nx * 3, end[1] - ny * 3], [e[0] - nx * 9, e[1] - ny * 9], [e[0] + nx * 9, e[1] + ny * 9]]), F, 1.1) +
          line(straw.slice(1), .7) + line(open([[end[0] + nx * 3.5, end[1] + ny * 3.5], [end[0] - nx * 3.5, end[1] - ny * 3.5]]), 1.6);
      }
      return held(g, function (h, s) { return broom([h[0] - s * 6, h[1] - 46], [h[0] + s * 6, g.sole - 18]); },
        function (low, high) { return broom(high, low); }, true, F);
    },
    'magic-wand': function (g, c) {
      var F = c.f('held');
      function wand(a, b) { return tube(open([a, b]), 1.4, F) + star(b[0], b[1], 4.6, inkColour('gold')); }
      return held(g, function (h, s) { return wand(h, [h[0] + s * 14, h[1] - 16]); },
        function (hook) { return wand([hook[0] - 4, hook[1] + 10], [hook[0] + 5, hook[1] - 9]); }, false, F);
    },
    'lantern': function (g, c) {
      var F = c.f('held');
      function lantern(h) {
        var x = h[0], y = h[1];
        return line('M' + pt(x - 4, y + 7) + ' Q' + pt(x, y - 1) + ' ' + pt(x + 4, y + 7), 1.2) +
          shape(poly([[x - 5, y + 7], [x + 5, y + 7], [x + 7, y + 10], [x - 7, y + 10]]), F, 1) +
          shape(poly([[x - 6, y + 10], [x + 6, y + 10], [x + 6, y + 24], [x - 6, y + 24]]), F, 1.1) +
          plain(poly([[x - 3.6, y + 12.5], [x + 3.6, y + 12.5], [x + 3.6, y + 21.5], [x - 3.6, y + 21.5]]), inkColour('marigold')) +
          shape(poly([[x - 7, y + 24], [x + 7, y + 24], [x + 7, y + 26.5], [x - 7, y + 26.5]]), F, 1);
      }
      return held(g, function (h) { return lantern(h); }, function (hook) { return lantern(hook); }, false, F);
    },
    'treat-bucket': function (g, c) {
      var F = c.f('held');
      function bucket(h) {
        var x = h[0], y = h[1] + 17;
        return line('M' + pt(x - 8.5, y - 6) + ' Q' + pt(x, y - 22) + ' ' + pt(x + 8.5, y - 6), 1.2) +
          oval(x, y, 10, 9, F, 1.2) + line(open([[x - 7.5, y - 5.5], [x + 7.5, y - 5.5]]), .9) +
          plain(poly([[x - 5, y - 2], [x - 2, y - 2], [x - 3.5, y - 4.5]]), INK) + plain(poly([[x + 2, y - 2], [x + 5, y - 2], [x + 3.5, y - 4.5]]), INK) +
          plain('M' + pt(x - 5, y + 2) + ' Q' + pt(x, y + 7) + ' ' + pt(x + 5, y + 2) + ' Q' + pt(x, y + 4) + ' ' + pt(x - 5, y + 2) + ' Z', INK);
      }
      return held(g, function (h) { return bucket(h); }, function (hook) { return bucket(hook); }, false, F);
    },

    // ── And the rest ──
    'boa': function (g, c) {
      var out = '', y;
      for (var i = 0; i < 9; i++) out += dot(-14 + i * 3.5, g.sh - 2 + Math.abs(i - 4) * 1.2, 4.6, 'url(#' + c.p + '-boa)', 1.1);
      for (y = g.sh + 4; y < g.hip + 10; y += 7) {
        var k = (y - g.sh) / (g.hip - g.sh);
        out += dot(-(g.S * .62 + k * 4), y, 4.6, 'url(#' + c.p + '-boa)', 1.1) + dot(g.S * .62 + k * 4, y, 4.6, 'url(#' + c.p + '-boa)', 1.1);
      }
      return { top: out };
    },
    'scarf': function (g, c) {
      var end = g.seated ? g.hip - 2 : g.hip + 14, fr = '';
      for (var x = -1; x < 2; x++) fr += ' M' + pt(-11 + x * 3, end) + ' v4 M' + pt(5 + x * 3, end + 4) + ' v4';
      return { top:
        shape(poly([[-6, g.sh + 4], [-16, end - 10], [-14, end], [-6, end], [-2, g.sh + 10]]), c.f('scarf')) +
        shape(poly([[4, g.sh + 6], [2, end - 4], [3, end + 4], [11, end + 4], [11, g.sh + 6]]), c.f('scarf')) +
        shape('M' + pt(-13, g.sh - 4) + ' Q' + pt(0, g.sh + 4) + ' ' + pt(13, g.sh - 4) + ' L' + pt(14, g.sh + 6) + ' Q' + pt(0, g.sh + 15) + ' ' + pt(-14, g.sh + 6) + ' Z', c.f('scarf')) +
        line(fr.slice(1), .8) };
    }
  };

  function pair(g, one) { return one(-g.fx, -1) + one(g.fx, 1); }

  /* ── What you have on underneath ─────────────────────────────────────── */
  function underneath(g, c, wear) {
    var out = { body: '', sleeves: '', feet: '', bottom: '' };
    var fabric = inkColour(c.layer);
    var dress = wear.top && (wear.top[0] === 'flowing-dress' || wear.top[0] === 'gown');
    var suit = !!wear.suit;
    // Cropped above the ankle, so the shoes show, and a prosthetic leg is seen.
    if (!wear.bottom && !dress && !suit) out.bottom = shape(trousers(g, 2.5, g.knee + (g.ankle - g.knee) * (g.seated ? .62 : .7), 1, 0), fabric);
    if (!wear.top && !suit) {
      out.body = shape(bodice(g, 2, hemAt(g, 'hip'), 'crew'), fabric) + crewSeam(g);
      out.sleeves = shape(sleeve(g, -1, .3, 2, 1), fabric) + shape(sleeve(g, 1, .3, 2, 1), fabric);
    }
    if (!wear.feet) {
      out.feet = pair(g, function (x) {
        var y = g.sole;
        return shape('M' + pt(x - 9, y) + ' Q' + pt(x - 9.5, y - 9) + ' ' + pt(x, y - 9) + ' Q' + pt(x + 10, y - 9) + ' ' + pt(x + 10, y) + ' Z', inkColour('cream')) +
          line(open([[x - 10, y + .5], [x + 11, y + .5]]), 1.8);
      });
    }
    return out;
  }

  function inkColour(k) { return 'var(--dd-f-' + k + ', ' + ((DATA.inks || {})[k] || '#888888') + ')'; }

  /* ── Skin, face and hair ─────────────────────────────────────────────── */
  function facePath(g, face) {
    var y = g.y0, rx = g.rx, ry = g.ry;
    var jaw = face === 'round' ? .78 : face === 'square' ? .9 : face === 'long' ? .62 : .66;
    var low = face === 'square' ? .82 : face === 'round' ? .72 : .68;
    return 'M' + pt(-rx, y) + ' C' + pt(-rx, y - ry * 1.32) + ' ' + pt(rx, y - ry * 1.32) + ' ' + pt(rx, y) +
      ' C' + pt(rx, y + ry * low) + ' ' + pt(rx * jaw, y + ry) + ' ' + pt(0, y + ry) +
      ' C' + pt(-rx * jaw, y + ry) + ' ' + pt(-rx, y + ry * low) + ' ' + pt(-rx, y) + ' Z';
  }

  var HAIR = {
    bald: function () { return {}; },
    shaved: function (g, h) {
      var y = g.y0, rx = g.rx, ry = g.ry;
      return { front: '<path d="M' + pt(-rx + .5, y - 3) + ' C' + pt(-rx, y - ry * 1.32) + ' ' + pt(rx, y - ry * 1.32) + ' ' + pt(rx - .5, y - 3) +
        ' Q' + pt(rx * .8, y - ry * .55) + ' ' + pt(0, y - ry * .62) + ' Q' + pt(-rx * .8, y - ry * .55) + ' ' + pt(-rx + .5, y - 3) + ' Z" fill="' + h + '" opacity=".5"/>' };
    },
    short: function (g, h) {
      var y = g.y0, rx = g.rx, ry = g.ry;
      return { front: shape('M' + pt(-rx - 1.2, y + 1) + ' C' + pt(-rx - 2, y - ry * 1.45) + ' ' + pt(rx + 2, y - ry * 1.45) + ' ' + pt(rx + 1.2, y + 1) +
        ' L' + pt(rx - 2, y - 6) + ' Q' + pt(rx * .4, y - ry * .62) + ' ' + pt(-rx * .2, y - ry * .5) + ' Q' + pt(-rx * .7, y - ry * .55) + ' ' + pt(-rx + 2, y - 6) + ' Z', h) };
    },
    curly: function (g, h) {
      var y = g.y0, rx = g.rx, ry = g.ry, out = '';
      out += shape('M' + pt(-rx - 1, y - 2) + ' C' + pt(-rx - 2, y - ry * 1.4) + ' ' + pt(rx + 2, y - ry * 1.4) + ' ' + pt(rx + 1, y - 2) + ' Q' + pt(0, y - ry * .5) + ' ' + pt(-rx - 1, y - 2) + ' Z', h);
      for (var i = 0; i <= 8; i++) {
        var a = Math.PI + i * Math.PI / 8;
        out += dot(Math.cos(a) * (rx + 1), y - 6 + Math.sin(a) * (ry + 2), 5, h, 1.1);
      }
      return { front: out };
    },
    afro: function (g, h) {
      var y = g.y0, rx = g.rx, ry = g.ry, back = '';
      for (var i = 0; i < 16; i++) {
        var a = i * Math.PI * 2 / 16;
        back += dot(Math.cos(a) * (rx + 13), y - 7 + Math.sin(a) * (ry + 10), 8, h, 1.2);
      }
      back += oval(0, y - 7, rx + 13, ry + 10, h);
      return { back: back, front: plain('M' + pt(-rx + .5, y - 4) + ' C' + pt(-rx, y - ry * 1.3) + ' ' + pt(rx, y - ry * 1.3) + ' ' + pt(rx - .5, y - 4) +
        ' Q' + pt(0, y - ry * .55) + ' ' + pt(-rx + .5, y - 4) + ' Z', h) };
    },
    locs: function (g, h) {
      var y = g.y0, rx = g.rx, ry = g.ry, back = '', front = '';
      [-1, 1].forEach(function (s) {
        for (var i = 0; i < 4; i++) {
          var x = s * (rx - 3 + i * 3.5);
          back += shape('M' + pt(x - 2.6, y - 6) + ' L' + pt(x + s * 3 - 2.6, y + 50) + ' Q' + pt(x + s * 3, y + 54) + ' ' + pt(x + s * 3 + 2.6, y + 50) + ' L' + pt(x + 2.6, y - 6) + ' Z', h, 1);
        }
      });
      front = shape('M' + pt(-rx - 1.5, y + 2) + ' C' + pt(-rx - 2, y - ry * 1.42) + ' ' + pt(rx + 2, y - ry * 1.42) + ' ' + pt(rx + 1.5, y + 2) +
        ' L' + pt(rx - 1, y - 5) + ' Q' + pt(0, y - ry * .55) + ' ' + pt(-rx + 1, y - 5) + ' Z', h);
      [-1, 1].forEach(function (s) {
        front += shape('M' + pt(s * (rx - 4), y - 8) + ' L' + pt(s * (rx - 1), y + 14) + ' Q' + pt(s * (rx + 1), y + 17) + ' ' + pt(s * (rx + 3), y + 14) + ' L' + pt(s * (rx + 1), y - 8) + ' Z', h, 1);
      });
      return { back: back, front: front };
    },
    braids: function (g, h) {
      var y = g.y0, rx = g.rx, ry = g.ry, back = '';
      [-1, 1].forEach(function (s) {
        for (var yy = y + 2; yy < y + 56; yy += 6) back += oval(s * (rx + 2), yy, 4, 3.6, h, 1);
        back += line(open([[s * (rx + 2), y + 56], [s * (rx + 2), y + 61]]), 2.2, h);
      });
      return { back: back, front: shape('M' + pt(-rx - 1, y + 1) + ' C' + pt(-rx - 2, y - ry * 1.4) + ' ' + pt(rx + 2, y - ry * 1.4) + ' ' + pt(rx + 1, y + 1) +
        ' L' + pt(rx - 2, y - 5) + ' Q' + pt(rx * .5, y - ry * .62) + ' ' + pt(1, y - ry * .9) + ' Q' + pt(-rx * .5, y - ry * .62) + ' ' + pt(-rx + 2, y - 5) + ' Z', h) +
        line(open([[0, y - ry - 2], [1, y - ry * .9]]), .8) };
    },
    long: function (g, h) { return longHair(g, h, false); },
    wavy: function (g, h) { return longHair(g, h, true); },
    bob: function (g, h) {
      var y = g.y0, rx = g.rx, ry = g.ry;
      return {
        back: shape('M' + pt(-rx - 5, y - 4) + ' C' + pt(-rx - 6, y - ry * 1.5) + ' ' + pt(rx + 6, y - ry * 1.5) + ' ' + pt(rx + 5, y - 4) + ' L' + pt(rx + 6, y + ry + 2) + ' L' + pt(-rx - 6, y + ry + 2) + ' Z', h),
        front: shape('M' + pt(-rx - 2, y + 6) + ' C' + pt(-rx - 3, y - ry * 1.45) + ' ' + pt(rx + 3, y - ry * 1.45) + ' ' + pt(rx + 2, y + 6) +
          ' L' + pt(rx - 2, y + 4) + ' L' + pt(rx - 3, y - ry * .42) + ' L' + pt(-rx + 3, y - ry * .42) + ' L' + pt(-rx + 2, y + 4) + ' Z', h)
      };
    },
    bun: function (g, h) {
      var y = g.y0, rx = g.rx, ry = g.ry;
      return {
        back: dot(0, y - ry - 8, 9.5, h, 1.2),
        front: shape('M' + pt(-rx - 1, y - 1) + ' C' + pt(-rx - 1.5, y - ry * 1.4) + ' ' + pt(rx + 1.5, y - ry * 1.4) + ' ' + pt(rx + 1, y - 1) +
          ' Q' + pt(rx * .6, y - ry * .7) + ' ' + pt(0, y - ry * .78) + ' Q' + pt(-rx * .6, y - ry * .7) + ' ' + pt(-rx - 1, y - 1) + ' Z', h) +
          line('M' + pt(-rx * .5, y - ry * .85) + ' Q' + pt(0, y - ry * 1.05) + ' ' + pt(rx * .5, y - ry * .85), .7)
      };
    },
    ponytail: function (g, h) {
      var y = g.y0, rx = g.rx, ry = g.ry;
      return {
        back: shape('M' + pt(rx - 4, y - ry * .6) + ' Q' + pt(rx + 14, y - 4) + ' ' + pt(rx + 8, y + 44) + ' Q' + pt(rx + 4, y + 48) + ' ' + pt(rx + 2, y + 40) + ' Q' + pt(rx + 6, y + 2) + ' ' + pt(rx - 6, y - ry * .3) + ' Z', h),
        front: shape('M' + pt(-rx - 1, y) + ' C' + pt(-rx - 1.5, y - ry * 1.42) + ' ' + pt(rx + 1.5, y - ry * 1.42) + ' ' + pt(rx + 1, y) +
          ' Q' + pt(rx * .5, y - ry * .62) + ' ' + pt(-rx * .3, y - ry * .7) + ' Q' + pt(-rx * .8, y - ry * .5) + ' ' + pt(-rx - 1, y) + ' Z', h)
      };
    },
    mohawk: function (g, h) {
      var y = g.y0, rx = g.rx, ry = g.ry, spikes = [];
      for (var i = 0; i <= 6; i++) {
        var t = i / 6, yy = y - ry * 1.05 + Math.abs(t - .5) * 10, x = -10 + t * 20;
        spikes.push([x * .45, yy + 3]); if (i < 6) spikes.push([x * .45 + 1.5, yy - 12]);
      }
      return { front: '<path d="M' + pt(-rx + .5, y - 3) + ' C' + pt(-rx, y - ry * 1.3) + ' ' + pt(rx, y - ry * 1.3) + ' ' + pt(rx - .5, y - 3) +
        ' Q' + pt(0, y - ry * .55) + ' ' + pt(-rx + .5, y - 3) + ' Z" fill="' + h + '" opacity=".35"/>' + shape(poly(spikes), h, 1.1) };
    },
    undercut: function (g, h) {
      var y = g.y0, rx = g.rx, ry = g.ry;
      return { front: '<path d="M' + pt(-rx + .5, y - 2) + ' C' + pt(-rx, y - ry * 1.3) + ' ' + pt(rx, y - ry * 1.3) + ' ' + pt(rx - .5, y - 2) +
        ' Q' + pt(0, y - ry * .5) + ' ' + pt(-rx + .5, y - 2) + ' Z" fill="' + h + '" opacity=".35"/>' +
        shape('M' + pt(-rx * .8, y - ry * .55) + ' Q' + pt(-rx * .6, y - ry * 1.35) + ' ' + pt(rx * .3, y - ry * 1.25) + ' Q' + pt(rx + 8, y - ry * 1.05) + ' ' + pt(rx + 3, y - ry * .35) +
          ' Q' + pt(rx * .2, y - ry * .9) + ' ' + pt(-rx * .8, y - ry * .55) + ' Z', h) };
    }
  };

  function longHair(g, h, wavy) {
    var y = g.y0, rx = g.rx, ry = g.ry, end = y + 52;
    var edge = function (s) {
      var p = [];
      for (var yy = y; yy <= end; yy += 6) p.push([s * (rx + 4 + (wavy ? Math.sin((yy - y) / 6) * 2.5 : 0) + (yy - y) * .06), yy]);
      return p;
    };
    var R = edge(1), L = edge(-1);
    var back = 'M' + pt(-rx - 4, y) + ' C' + pt(-rx - 6, y - ry * 1.5) + ' ' + pt(rx + 6, y - ry * 1.5) + ' ' + pt(rx + 4, y) +
      ' L' + R.map(function (q) { return pt(q[0], q[1]); }).join(' L') +
      ' Q' + pt(0, end + 6) + ' ' + pt(L[L.length - 1][0], L[L.length - 1][1]) +
      ' L' + L.reverse().map(function (q) { return pt(q[0], q[1]); }).join(' L') + ' Z';
    var front = 'M' + pt(-rx - 2, y + 8) + ' C' + pt(-rx - 3, y - ry * 1.45) + ' ' + pt(rx + 3, y - ry * 1.45) + ' ' + pt(rx + 2, y + 8) +
      ' L' + pt(rx - 1, y + 10) + ' Q' + pt(rx - 1, y - ry * .5) + ' ' + pt(1, y - ry * .92) + ' Q' + pt(-rx + 1, y - ry * .5) + ' ' + pt(-rx + 1, y + 10) + ' Z';
    return { back: shape(back, h), front: shape(front, h) + line(open([[0, y - ry - 2], [1, y - ry * .9]]), .8) };
  }

  function features(g, b, skin) {
    var y = g.y0, rx = g.rx, out = '', ex = rx * .42, ey = y + 1;
    // Eyes.
    [-1, 1].forEach(function (s) {
      var x = s * ex;
      if (b.eyes === 'closed') out += line('M' + pt(x - 3.4, ey) + ' Q' + pt(x, ey + 2.6) + ' ' + pt(x + 3.4, ey), 1.2);
      else {
        var r = b.eyes === 'wide' ? 3.8 : 3;
        out += oval(x, ey, r + .6, r * .82, COL.white, .9);
        var look = b.eyes === 'aside' ? 1.6 : 0;
        out += dot(x + look, ey + (b.eyes === 'aside' ? .5 : 0), r * .55, INK);
        if (b.eyes === 'soft') out += plain('M' + pt(x - r - 1, ey) + ' Q' + pt(x, ey - r * 1.5) + ' ' + pt(x + r + 1, ey) + ' Z', skin) + line(open([[x - r - .8, ey], [x + r + .8, ey]]), 1);
      }
    });
    // Brows.
    var by = y - 6;
    [-1, 1].forEach(function (s) {
      var x = s * ex;
      if (b.brows === 'straight') out += line(open([[x - 4, by], [x + 4, by]]), 1.4);
      else if (b.brows === 'arched') out += line('M' + pt(x - 4, by + 1) + ' Q' + pt(x, by - 3) + ' ' + pt(x + 4, by + 1), 1.3);
      else if (b.brows === 'bushy') out += line(open([[x - 4.5, by + .5], [x + 4.5, by - .5]]), 2.6);
      else out += line('M' + pt(x - 4, by + .5) + ' Q' + pt(x, by - 1.2) + ' ' + pt(x + 4, by + .5), 1.1);
    });
    // Nose.
    var ny = y + 8;
    if (b.nose === 'small') out += line('M' + pt(-1.5, ny + 1) + ' Q' + pt(0, ny + 2) + ' ' + pt(1.5, ny + 1), 1);
    else if (b.nose === 'round') out += line('M' + pt(-2.5, ny) + ' Q' + pt(-3, ny + 3) + ' ' + pt(0, ny + 3) + ' Q' + pt(3, ny + 3) + ' ' + pt(2.5, ny), 1);
    else if (b.nose === 'long') out += line('M' + pt(.5, ny - 7) + ' L' + pt(1.5, ny + 1) + ' Q' + pt(0, ny + 3) + ' ' + pt(-1.8, ny + 1.5), 1);
    else out += line('M' + pt(-4, ny + .5) + ' Q' + pt(-4, ny + 3) + ' ' + pt(0, ny + 3) + ' Q' + pt(4, ny + 3) + ' ' + pt(4, ny + .5), 1.1);
    return out;
  }

  function mouth(g, b) {
    var my = g.y0 + 15;
    if (b.mouth === 'smile') return line('M' + pt(-5, my - 1) + ' Q' + pt(0, my + 4) + ' ' + pt(5, my - 1), 1.3);
    if (b.mouth === 'grin') return shape('M' + pt(-6, my - 1.5) + ' Q' + pt(0, my + 6) + ' ' + pt(6, my - 1.5) + ' Z', COL.white, 1.2);
    if (b.mouth === 'open') return oval(0, my + .5, 3, 3.6, INK);
    return line(open([[-4, my], [4, my]]), 1.3);
  }

  function beard(g, b, h) {
    var y = g.y0, rx = g.rx, ry = g.ry, my = y + 15;
    if (b.beard === 'stubble') return '<path d="M' + pt(-rx + 1, y + 4) + ' Q' + pt(-rx + 2, y + ry) + ' ' + pt(0, y + ry + .5) + ' Q' + pt(rx - 2, y + ry) + ' ' + pt(rx - 1, y + 4) +
      ' Q' + pt(rx * .6, my - 3) + ' ' + pt(0, my - 4) + ' Q' + pt(-rx * .6, my - 3) + ' ' + pt(-rx + 1, y + 4) + ' Z" fill="' + h + '" opacity=".38"/>';
    if (b.beard === 'moustache') return shape('M' + pt(-7, my - 1) + ' Q' + pt(-4, my - 5.5) + ' ' + pt(0, my - 3.5) + ' Q' + pt(4, my - 5.5) + ' ' + pt(7, my - 1) + ' Q' + pt(0, my - 2) + ' ' + pt(-7, my - 1) + ' Z', h, 1);
    if (b.beard === 'beard' || b.beard === 'long') {
      var low = b.beard === 'long' ? y + ry + 18 : y + ry + 4;
      return shape('M' + pt(-rx + .5, y + 2) + ' Q' + pt(-rx, low - 6) + ' ' + pt(0, low) + ' Q' + pt(rx, low - 6) + ' ' + pt(rx - .5, y + 2) +
        ' L' + pt(rx - 4, y + 6) + ' Q' + pt(rx - 5, my + 4) + ' ' + pt(0, my + 4.5) + ' Q' + pt(-rx + 5, my + 4) + ' ' + pt(-rx + 4, y + 6) + ' Z', h, 1.1) +
        shape('M' + pt(-7, my - 1) + ' Q' + pt(-4, my - 5) + ' ' + pt(0, my - 3.5) + ' Q' + pt(4, my - 5) + ' ' + pt(7, my - 1) + ' Q' + pt(0, my - 2) + ' ' + pt(-7, my - 1) + ' Z', h, 1);
    }
    return '';
  }

  function marks(g, b) {
    var y = g.y0, rx = g.rx, out = '';
    var has = function (k) { return b.marks.indexOf(k) !== -1; };
    if (has('vitiligo')) {
      out += '<path d="M' + pt(-rx * .2, y - 14) + ' q5 -3 9 1 q2 5 -3 6 q-6 1 -6 -7 Z" fill="' + COL.vitiligo + '" opacity=".9"/>';
      out += '<path d="M' + pt(rx * .25, y + 17) + ' q4 1 5 5 q-3 3 -7 1 q-2 -4 2 -6 Z" fill="' + COL.vitiligo + '" opacity=".9"/>';
    }
    if (has('freckles')) {
      [-1, 1].forEach(function (s) {
        [[9, 6], [12, 8], [8, 9.5], [11.5, 11], [14, 6.5]].forEach(function (q) { out += dot(s * q[0], y + q[1], .7, INK); });
      });
    }
    if (has('birthmark')) out += '<path d="M' + pt(-rx * .78, y + 6) + ' q4 -4 8 0 q2 5 -3 7 q-6 0 -5 -7 Z" fill="' + COL.birthmark + '" opacity=".55"/>';
    if (has('scar')) out += line(open([[rx * .25, y - 10], [rx * .62, y + 2]]), 1.4, COL.vitiligo) + line('M' + pt(rx * .3, y - 7) + ' l3 -1 M' + pt(rx * .42, y - 3) + ' l3 -1', .6, COL.vitiligo);
    return out;
  }

  /* ── What you always have with you ───────────────────────────────────── */
  function headAids(g, b) {
    var y = g.y0, rx = g.rx, ry = g.ry, out = '', ex = rx * .42;
    if (b.eyewear !== 'none') {
      var lens = b.eyewear === 'dark' ? COL.aid_dark : 'none';
      [-1, 1].forEach(function (s) {
        out += '<rect x="' + f(CX + s * ex - 5.5) + '" y="' + f(y - 3.5) + '" width="11" height="8.5" rx="3" fill="' + lens + '" stroke="' + INK + '" stroke-width="1.3"/>';
        out += line(open([[s * (ex + 5.5), y - 1], [s * rx, y]]), 1.1);
      });
      out += line('M' + pt(-ex + 5.5, y) + ' Q' + pt(0, y - 2.5) + ' ' + pt(ex - 5.5, y), 1.1);
    }
    if (b.faceAid === 'mask') {
      out += line(open([[-rx + 2, y + 6], [-rx, y + 1]]), .9) + line(open([[rx - 2, y + 6], [rx, y + 1]]), .9);
      out += shape('M' + pt(-rx + 3, y + 5) + ' Q' + pt(0, y + 2) + ' ' + pt(rx - 3, y + 5) + ' L' + pt(rx - 5, y + 17) + ' Q' + pt(0, y + ry + 1) + ' ' + pt(-rx + 5, y + 17) + ' Z', COL.mask, 1.2);
      out += line('M' + pt(-rx + 5, y + 10) + ' Q' + pt(0, y + 8) + ' ' + pt(rx - 5, y + 10) + ' M' + pt(-rx + 6, y + 14) + ' Q' + pt(0, y + 12.5) + ' ' + pt(rx - 6, y + 14), .7);
    } else if (b.faceAid === 'cannula') {
      out += tube('M' + pt(-rx, y + 3) + ' Q' + pt(-rx * .55, y + 11) + ' ' + pt(-2, y + 11) + ' L' + pt(2, y + 11) + ' Q' + pt(rx * .55, y + 11) + ' ' + pt(rx, y + 3), 1.2, COL.mask);
      out += tube('M' + pt(-rx - 1, y + 5) + ' Q' + pt(-rx + 1, y + ry + 2) + ' ' + pt(0, y + ry + 9) + ' M' + pt(rx + 1, y + 5) + ' Q' + pt(rx - 1, y + ry + 2) + ' ' + pt(0, y + ry + 9), 1.2, COL.mask);
    }
    return out;
  }

  function earAids(g, b) {
    var y = g.y0, rx = g.rx, ry = g.ry, out = '';
    if (b.ears === 'aids') {
      [-1, 1].forEach(function (s) {
        out += shape('M' + pt(s * (rx + .5), y - 9) + ' q' + f(s * 6) + ' 0 ' + f(s * 5.5) + ' 9 q' + f(-s * 1) + ' 3.5 ' + f(-s * 4.5) + ' 1.5 Z', COL.aid, 1.1);
        out += line('M' + pt(s * (rx + 1), y - 8) + ' q' + f(-s * 3) + ' 3 ' + f(-s * 2) + ' 9', 1);
      });
    } else if (b.ears === 'cochlear') {
      out += dot(rx - 2, y - 12, 4.6, COL.aid, 1.2) + dot(rx - 2, y - 12, 1.6, INK);
      out += shape('M' + pt(rx + 1, y - 5) + ' q4 1 3 9 q-1 2 -3 0 Z', COL.aid, 1);
      out += line('M' + pt(rx + .5, y - 9) + ' Q' + pt(rx + 3, y - 7) + ' ' + pt(rx + 2.5, y - 5), 1);
    } else if (b.ears === 'defenders' || b.ears === 'headphones') {
      var d = b.ears === 'defenders';
      var top = y - ry - (d ? 9 : 6);
      out += tube('M' + pt(-rx - (d ? 4 : 2.5), y - 2) + ' C' + pt(-rx - 6, top) + ' ' + pt(rx + 6, top) + ' ' + pt(rx + (d ? 4 : 2.5), y - 2), d ? 4 : 2.6, d ? COL.aid_dark : COL.aid);
      [-1, 1].forEach(function (s) {
        out += oval(s * (rx + (d ? 3.5 : 2)), y + 2, d ? 6.5 : 4.5, d ? 9.5 : 7, d ? COL.aid_dark : COL.aid, 1.3);
      });
    }
    return out;
  }

  function neckAid(g, b) {
    if (b.neck !== 'chew') return '';
    return line('M' + pt(-7, g.sh - 2) + ' Q' + pt(-6, g.sh + 12) + ' ' + pt(0, g.sh + 17) + ' Q' + pt(6, g.sh + 12) + ' ' + pt(7, g.sh - 2), 1.1) +
      shape('M' + pt(-4, g.sh + 17) + ' a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 Z M' + pt(-1.6, g.sh + 17) + ' a1.6 1.6 0 1 1 3.2 0 a1.6 1.6 0 1 1 -3.2 0 Z', COL.chew, 1.1);
  }

  /* The things held, drawn in front of the body and behind the hands, so a
     hand closes on its handle. */
  function handAids(g, b) {
    var out = '', h = b.hands;
    var L = g.arm['-1'].R, R = g.arm['1'].R;
    if (h === 'cane') {
      out += tube('M' + pt(R[0] - 5, R[1] - 3) + ' Q' + pt(R[0] - 4, R[1] - 9) + ' ' + pt(R[0] + 2, R[1] - 7) + ' L' + pt(R[0] + 3, g.sole), 2.6, COL.aid_dark);
    } else if (h === 'white') {
      var tip = [R[0] + 24, g.sole];
      var red = lerp([R[0] + 1, R[1]], tip, .82);
      out += tube(open([[R[0] + 1, R[1]], red]), 2.2, COL.white_cane) + tube(open([red, tip]), 2.2, COL.cane_tip);
    } else if (h === 'crutches') {
      [-1, 1].forEach(function (s) {
        var A = armLine(g, s), cuff = lerp(A[1], A[2], .42), hand = A[2];
        out += tube(open([[cuff[0] + s * 2, cuff[1]], [hand[0] + s * 3, hand[1] - 2], [hand[0] + s * 6, g.sole]]), 2.4, COL.aid);
        out += line('M' + pt(cuff[0] - s * 1, cuff[1] - 4) + ' q' + f(s * 6) + ' 1 ' + f(s * 6) + ' 6', 2, INK);
      });
    } else if (h === 'walker') {
      var x = R[0] + 3, low = g.sole;
      out += tube(open([[-x, R[1] - 2], [-x, low - 4]]) + ' ' + open([[x, R[1] - 2], [x, low - 4]]), 2.6, COL.aid);
      out += tube(open([[-x, R[1] + 26], [x, R[1] + 26]]), 2.4, COL.aid);
      out += dot(-x, low - 2, 3.4, COL.aid_dark, 1) + dot(x, low - 2, 3.4, COL.aid_dark, 1);
    } else if (h === 'aac') {
      var cx = 0, cy = L[1] - 3;
      out += '<rect x="' + f(CX - 17) + '" y="' + f(cy - 11) + '" width="34" height="24" rx="3" fill="' + COL.aid_dark + '" stroke="' + INK + '" stroke-width="1.3"/>';
      out += '<rect x="' + f(CX - 14.5) + '" y="' + f(cy - 8.5) + '" width="29" height="19" rx="1.5" fill="' + COL.screen + '"/>';
      for (var i = 0; i < 6; i++) {
        out += '<rect x="' + f(CX - 13 + (i % 3) * 9.5) + '" y="' + f(cy - 7 + Math.floor(i / 3) * 8.5) + '" width="7" height="6.5" rx="1.2" fill="' + ['#E5432F', '#F2A900', '#2BC4C0', '#7B3FC4', '#9BD93A', '#FF7F66'][i] + '"/>';
      }
    }
    return out;
  }

  function fidget(g, b) {
    if (b.hands !== 'fidget') return '';
    var R = g.arm['-1'].R, x = -R[0], y = R[1] + 4, out = '';
    [0, 1, 2].forEach(function (i) {
      var a = -Math.PI / 2 + i * Math.PI * 2 / 3;
      out += dot(x + Math.cos(a) * 4.2, y + Math.sin(a) * 4.2, 2.8, '#2BC4C0', 1);
    });
    return out + dot(x, y, 2, COL.aid_dark, .8);
  }

  /* ── The chair ───────────────────────────────────────────────────────── */
  function chairBack(g) {
    if (!g.seated) return '';
    var out = '', w = g.S + 3;
    if (g.pose === 'wheelchair') {
      out += tube(open([[-w + 1, g.hip], [-w + 1, g.sh - 8], [-w - 4, g.sh - 10]]) + ' ' + open([[w - 1, g.hip], [w - 1, g.sh - 8], [w + 4, g.sh - 10]]), 2.6, COL.chair);
      out += shape(poly([[-w, g.pit - 6], [w, g.pit - 6], [w, g.hip], [-w, g.hip]]), COL.chair, 1.2);
    } else {
      var bx = g.H + 10, y = g.sole + 2;
      out += shape('M' + pt(-w - 2, g.sh - 2) + ' Q' + pt(0, g.sh - 10) + ' ' + pt(w + 2, g.sh - 2) + ' L' + pt(w + 2, g.hip + 4) + ' L' + pt(-w - 2, g.hip + 4) + ' Z', COL.chair, 1.2);
      out += shape(poly([[-bx, g.hip + 10], [bx, g.hip + 10], [bx + 2, y - 10], [-bx - 2, y - 10]]), COL.chair, 1.3);
      [-1, 1].forEach(function (s) {
        out += oval(s * (bx + 2), y - 16, 7, 18, COL.aid_dark, 1.3) + oval(s * (bx + 2), y - 16, 3.5, 12, COL.chair_light, .8);
      });
    }
    return out;
  }

  function chairFront(g) {
    if (!g.seated) return '';
    var out = '', y = g.sole + 2;
    if (g.pose === 'wheelchair') {
      var wx = g.H + 15, cy = g.hip + 18;
      [-1, 1].forEach(function (s) {
        out += oval(s * wx, cy, 10, 47, COL.chair, 1.3) + oval(s * wx, cy, 6, 42, COL.chair_light, 1) + oval(s * (wx + 6.5), cy, 2.4, 38, 'none', 1.6);
        out += tube(open([[s * (g.H + 4), g.hip + 4], [s * (g.kx + 6), y - 4]]), 1.8, COL.chair);
        out += dot(s * (g.kx + 8), y + 2, 3.6, COL.chair, 1.1);
      });
      out += shape(poly([[-g.kx - 11, y - 3], [g.kx + 11, y - 3], [g.kx + 11, y + 1], [-g.kx - 11, y + 1]]), COL.chair_light, 1.1);
    } else {
      var bx = g.H + 10;
      [-1, 1].forEach(function (s) {
        out += shape(poly([[s * (g.H + 2), g.hip - 6], [s * (g.H + 14), g.hip - 6], [s * (g.H + 14), g.hip], [s * (g.H + 2), g.hip]]), COL.chair, 1.1);
      });
      out += '<rect x="' + f(CX + g.H + 6) + '" y="' + f(g.hip - 14) + '" width="9" height="7" rx="1.5" fill="' + COL.aid_dark + '" stroke="' + INK + '" stroke-width="1"/>';
      out += line(open([[g.H + 10.5, g.hip - 14], [g.H + 10.5, g.hip - 19]]), 1.6) + dot(g.H + 10.5, g.hip - 20, 1.8, INK);
      out += shape(poly([[-g.kx - 11, y - 3], [g.kx + 11, y - 3], [g.kx + 11, y + 1], [-g.kx - 11, y + 1]]), COL.chair_light, 1.1);
    }
    return out;
  }

  /* ── The legs and arms, in skin ──────────────────────────────────────── */
  function legs(g, b, skin) {
    var out = '';
    [-1, 1].forEach(function (s) {
      if (b.limbs === 'leg' && s === -1) {
        // The thigh in skin, then the socket, the pylon and the foot.
        var thigh = legOutline(g, s, 0, g.knee + (g.seated ? 4 : 2), 0, 1);
        out += shape(poly(thigh), skin);
        var x = s * (g.seated ? g.kx : (g.kx + g.ax) / 2);
        out += shape(poly([[x - 6, g.knee - 2], [x + 6, g.knee - 2], [x + 4.5, g.knee + 12], [x - 4.5, g.knee + 12]]), COL.aid_dark, 1.2);
        out += tube(open([[x, g.knee + 12], [s * g.ax, g.ankle]]), 2.6, COL.aid);
      } else {
        out += shape(poly(legOutline(g, s, 0, g.ankle, 0, 1)), skin);
      }
      out += oval(s * g.fx, g.sole - 3.5, 8, 4.5, b.limbs === 'leg' && s === -1 ? COL.aid : skin, 1.2);
    });
    return out;
  }

  function armsSkin(g, b, skin) {
    var out = '';
    [-1, 1].forEach(function (s) {
      var A = armLine(g, s), w = armWidths(g);
      if (s === -1 && b.limbs === 'arm-short') {
        var u = upTo(A, w, .78), end = u.p[u.p.length - 1];
        out += shape(limbPath(g, s, u.p, u.w), skin) + dot(end[0], end[1], u.w[u.w.length - 1], skin, 1.2);
        return;
      }
      if (s === -1 && b.limbs === 'arm') {
        var half = upTo(A, w, .62);
        out += shape(limbPath(g, s, half.p, half.w), skin);
        var rest = [half.p[half.p.length - 1], A[2]];
        out += shape(poly(strip(rest, [half.w[half.w.length - 1] - .5, w[2]])), COL.aid);
        return;
      }
      out += shape(limbPath(g, s, A, w), skin);
    });
    return out;
  }

  function hands(g, b, skin) {
    var out = '';
    [-1, 1].forEach(function (s) {
      if (s === -1 && b.limbs === 'arm-short') return;
      var A = armLine(g, s), R = A[2], E = A[1];
      var d = dist(E, R) || 1, k = 4 / d;
      var c = [R[0] + (R[0] - E[0]) * k, R[1] + (R[1] - E[1]) * k];
      var colour = s === -1 && b.limbs === 'arm' ? COL.aid : skin;
      out += dot(c[0], c[1], g.a * .82, colour, 1.2);
      if (s === -1 && b.limbs === 'arm') out += line(open([[c[0] - 2, c[1] + 1], [c[0] + 2, c[1] + 1]]), .8);
      if (b.marks.indexOf('vitiligo') !== -1 && colour === skin) out += dot(c[0] + s * 1.5, c[1] - 1.5, g.a * .34, COL.vitiligo);
    });
    return out;
  }

  /* ── Patterns ────────────────────────────────────────────────────────── */
  function pattern(id, piece, scale) {
    var tile = (DATA.prints || {})[piece[1]], cw = (DATA.colourways || {})[piece[2]];
    if (!tile || !cw) return '';
    var inks = cw.inks, n = inks.length, rest = n > 1 ? inks.slice(1) : inks, v = [], i;
    v.push('--g:' + inkColour(inks[0]));
    for (i = 0; i < 6; i++) v.push('--c' + (i + 1) + ':' + inkColour(inks[i % n]));
    for (i = 0; i < 5; i++) v.push('--f' + (i + 1) + ':' + inkColour(rest[i % rest.length]));
    return '<pattern id="' + id + '" patternUnits="userSpaceOnUse" width="' + tile[0] + '" height="' + tile[1] + '"' +
      (scale !== 1 ? ' patternTransform="scale(' + scale + ')"' : '') + ' style="' + v.join(';') + '">' + tile[2] + '</pattern>';
  }

  /* ── Putting it together ─────────────────────────────────────────────── */
  function drawBodymind(look, p) {
    var b = look.body, wear = look.wear || {};
    var g = geometry(b);
    g.short = b.limbs === 'arm-short';
    g.free = freeHand(b);
    g.face = b.face;
    var skin = COL.skin[b.skin], hair = COL.hair[b.hairColour], rainbow = '';
    // Rainbow hair (Helen's ask, 2026-10-15) is stripes of colour down the hair,
    // so every style and the beard are filled with a gradient rather than one hex.
    if (b.hairColour === 'rainbow' && COL.hair_rainbow) {
      var bands = COL.hair_rainbow, stops = '';
      bands.forEach(function (c, i) {
        stops += '<stop offset="' + f(i / bands.length) + '" stop-color="' + c + '"/><stop offset="' + f((i + 1) / bands.length) + '" stop-color="' + c + '"/>';
      });
      rainbow = '<linearGradient id="' + p + '-rainbow" x1="0" y1="0" x2="0" y2="1">' + stops + '</linearGradient>';
      hair = 'url(#' + p + '-rainbow)';
    }
    var c = { p: p, layer: b.layer, chimera: look.chimera || null, f: function (slot) { return 'url(#' + p + '-' + slot + ')'; } };
    var worn = {};
    DATA.slots.forEach(function (slot) {
      var piece = wear[slot];
      worn[slot] = piece ? (BODY_WEAR[piece[0]] ? BODY_WEAR[piece[0]](g, c) : {}) : {};
    });
    var under = underneath(g, c, wear);
    // A wig, or a suit's hood, covers the hair. A suit with no hood (the
    // clown's, the pirate's, the vampire's) leaves it showing.
    var wig = (wear.head && wear.head[0] === 'wig') || !!(worn.suit && worn.suit.hood);
    var hairParts = wig ? {} : (HAIR[b.hair] ? HAIR[b.hair](g, hair) : {});
    var L = [];
    // Behind everything: the chair's back, long hair, a hood, the inside of a cape.
    var big = function (x) { return x ? '<g transform="translate(' + f(CX) + ' ' + f(g.y0) + ') scale(' + HEAD + ') translate(' + f(-CX) + ' ' + f(-g.y0) + ')">' + x + '</g>' : ''; };
    L.push(chairBack(g));
    L.push(worn.wings.back || '');
    L.push(big((hairParts.back || '') + (worn.outer.hood || '') + (worn.head.back || '') + (worn.suit.hood || '')));
    L.push(worn.outer.back || '', worn.held.back || '');
    L.push(worn.tail.back || '', worn.suit.back || '');
    // The body.
    L.push(legs(g, b, skin));
    L.push(under.feet, worn.feet.feet || '');
    L.push(under.bottom, worn.bottom.body || '');
    L.push(shape(bodice(g, 0, g.seated ? g.hip + 4 : g.hip + 8, 'crew'), skin));
    L.push('<rect x="' + f(CX - 6.5) + '" y="' + f(g.chin - 6) + '" width="13" height="' + f(g.sh - g.chin + 8) + '" fill="' + skin + '" stroke="' + INK + '" stroke-width="1.2"/>');
    L.push(chairFront(g));
    L.push(worn.tail.side || '', worn.suit.side || '');
    L.push(under.body, worn.top.body || '', worn.suit.body || '', worn.outer.body || '');
    L.push(neckAid(g, b));
    L.push(armsSkin(g, b, skin));
    L.push(under.sleeves, worn.top.sleeves || '', worn.suit.sleeves || '', worn.outer.sleeves || '');
    L.push(worn.outer.top || '', worn.boa.top || '', worn.scarf.top || '', worn.neck.top || '', worn.held.top || '');
    // The head.
    var head = '';
    [-1, 1].forEach(function (s) { head += oval(s * g.rx, g.y0 + 2, 3.6, 5.6, skin, 1.2); });
    head += shape(facePath(g, b.face), skin) + marks(g, b) + (worn.face.paint || '') + features(g, b, skin) + beard(g, b, hair) + mouth(g, b) +
      (worn.face.face || '') + headAids(g, b) + (hairParts.front || '') + earAids(g, b) + (worn.suit.top || '') + (worn.ears.top || '') + (worn.head.top || '');
    L.push(big(head));
    // In front: what is held, and the hands holding it.
    L.push(handAids(g, b), worn.held.held || '');
    L.push(hands(g, b, skin));
    L.push(worn.paws.hands || '', worn.wrists.hands || '');
    L.push(fidget(g, b));
    var defs = rainbow;
    DATA.slots.forEach(function (slot) { if (wear[slot]) defs += pattern(p + '-' + slot, wear[slot], .5); });
    return { defs: defs, art: L.join(''), g: g };
  }

  function drawStand(look, p) {
    var wear = look.wear || {}, art = DATA.stand.wood, defs = '';
    DATA.stand.paint.forEach(function (slot) {
      var piece = wear[slot];
      if (!piece) return;
      var cut = DATA.stand.cuts[piece[0]];
      if (cut) art += cut.split('@P@').join(p);
      defs += pattern(p + '-' + slot, piece, 1);
    });
    return { defs: defs, art: art };
  }

  /* The whole picture as a string. crop 'bust' frames the head and shoulders,
     for a small round picture beside a name; anything else is the whole of it. */
  function svg(look, opts) {
    opts = opts || {};
    var lk = clean(look);
    if (!lk) return '';
    var p = 'lav' + (++seq), d, vb;
    if (lk.base === 'stand') {
      d = drawStand(lk, p);
      vb = opts.crop === 'bust' ? '100 20 200 200' : '20 20 360 580';
    } else {
      d = drawBodymind(lk, p);
      var y0 = d.g.y0;
      vb = opts.crop === 'bust' ? '38 ' + f(y0 - 52) + ' 124 124' : '0 0 200 300';
      // Ears, a hood with a horn or ears on it, and wings reach above a tall
      // head, so the picture makes room for them, in the same shape.
      var tall = lk.wear.head && (lk.wear.head[0] === 'witch-hat' || lk.wear.head[0] === 'clown-hat');
      if (opts.crop !== 'bust' && (lk.wear.ears || lk.wear.suit || lk.wear.wings || tall)) vb = '-16 -40 232 348';
    }
    // ITS OWN GROUND, when asked for: the curtain of the booth a bodymind was
    // drawn in, or the wall of the Den the stand stands in, the way an animal
    // is drawn on the ground it was found on. Both are those rooms' own :root
    // colours, which reach every page and the radio's shadow root.
    var ground = '';
    if (opts.ground) {
      var v = vb.split(' ').map(Number);
      ground = '<rect x="' + v[0] + '" y="' + v[1] + '" width="' + v[2] + '" height="' + v[3] + '" fill="' +
        (lk.base === 'stand' ? 'var(--dd-wall, ' + DATA.ground.stand + ')' : 'var(--bmb-curtain, ' + DATA.ground.bodymind + ')') + '"/>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '"' + (opts.cls ? ' class="' + opts.cls + '"' : '') +
      ' aria-hidden="true" focusable="false"><defs>' + d.defs + '</defs>' + ground + d.art + '</svg>';
  }

  /* The picture as an element, for a page. */
  function draw(look, opts) {
    var s = svg(look, opts);
    if (!s || typeof DOMParser === 'undefined') return null;
    var doc = new DOMParser().parseFromString(s, 'image/svg+xml');
    var node = doc.documentElement;
    if (!node || node.nodeName !== 'svg') return null;
    return document.importNode(node, true);
  }

  /* ── Checking a look ─────────────────────────────────────────────────── */
  function own(o, k) { return typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k); }
  /* A look with nothing in it that is not on the lists, or null. The server's
     cleanLook() in netlify/cb/lib.mjs holds the same rules against the same
     generated keys, and tools/avatar.test.mjs checks the two agree. */
  function clean(look) {
    if (!look || typeof look !== 'object') return null;
    var out = { base: look.base };
    if (look.base !== 'stand' && look.base !== 'bodymind') return null;
    if (look.base === 'bodymind') {
      var b = look.body;
      if (!b || typeof b !== 'object') return null;
      out.body = {};
      for (var i = 0; i < DATA.body.groups.length; i++) {
        var grp = DATA.body.groups[i], keys = grp.options.map(function (o) { return o[0]; });
        var v = b[grp.key];
        if (grp.multi) {
          if (!Array.isArray(v)) return null;
          for (var j = 0; j < v.length; j++) if (keys.indexOf(v[j]) === -1) return null;
          out.body[grp.key] = keys.filter(function (k) { return v.indexOf(k) !== -1; });
        } else {
          if (keys.indexOf(v) === -1) return null;
          out.body[grp.key] = v;
        }
      }
      if (out.body.pose !== 'standing') {
        for (var k in STANDING_ONLY) if (STANDING_ONLY[k].indexOf(out.body[k]) !== -1) return null;
      }
    }
    var wear = look.wear || {};
    if (typeof wear !== 'object' || Array.isArray(wear)) return null;
    out.wear = {};
    for (var slot in wear) {
      if (!Object.prototype.hasOwnProperty.call(wear, slot)) continue;
      var piece = wear[slot];
      if (piece == null) continue;
      if (!own(DATA.garments, slot) || !Array.isArray(piece) || piece.length !== 3) return null;
      if (DATA.garments[slot].indexOf(piece[0]) === -1 || !own(DATA.prints, piece[1]) || !own(DATA.colourways, piece[2])) return null;
      out.wear[slot] = [piece[0], piece[1], piece[2]];
    }
    // Fantasy Fancy Dress's pieces need somebody to wear them: never on the stand.
    if (out.base === 'stand') for (var bo in out.wear) if ((DATA.bodyOnly || []).indexOf(bo) !== -1) return null;
    // A chimera onesie carries the chimera it was made after, and nothing
    // else carries one: a chimera left over from a suit taken off is dropped.
    if (out.wear.suit && out.wear.suit[0] === 'chimera-onesie') {
      var ch = cleanChimera(look.chimera);
      if (!ch) return null;
      out.chimera = ch;
    }
    return out;
  }

  /* A chimera, checked the way chimera.js's clean() and the server's
     cleanChimera() check one: every part an animal on the shelf, a back
     'none' or an animal that has one, a part with a default (arms, feet)
     allowed to be missing, and nothing else. */
  function cleanChimera(c) {
    var K = DATA.chimera;
    if (!K || !c || typeof c !== 'object' || Array.isArray(c)) return null;
    for (var key in c) if (own(c, key) && K.slots.indexOf(key) === -1) return null;
    var out = {};
    for (var i = 0; i < K.slots.length; i++) {
      var k = K.slots[i], from = own(c, k) ? k : (own(K.defaults, k) ? K.defaults[k] : null);
      if (!from || !own(c, from)) return null;
      var v = c[from];
      if (typeof v !== 'string') return null;
      if (k === 'back') { if (v !== 'none' && !(own(K.animals, v) && K.animals[v].back)) return null; }
      else if (!own(K.animals, v)) return null;
      out[k] = v;
    }
    return out;
  }
  /* A chimera out of Chimera Obscura's address (#chimera=), as chimera.js's
     uncode() reads it: the parts in the shelf's order, dots between, with
     arms and feet left out when they are the body's. */
  function chimeraUncode(s) {
    var K = DATA.chimera;
    if (!K || typeof s !== 'string' || !/^[a-z.]{3,400}$/.test(s)) return null;
    var bits = s.split('.');
    var keys = bits.length === K.slots.length ? K.slots : K.slots.filter(function (k) { return !own(K.defaults, k); });
    if (bits.length !== keys.length) return null;
    var c = {};
    keys.forEach(function (k, i) { c[k] = bits[i]; });
    return cleanChimera(c);
  }
  function chimeraCode(c) {
    var K = DATA.chimera, p = cleanChimera(c);
    if (!p) return '';
    var plain = Object.keys(K.defaults).every(function (k) { return p[k] === p[K.defaults[k]]; });
    return K.slots.filter(function (k) { return !(plain && own(K.defaults, k)); }).map(function (k) { return p[k]; }).join('.');
  }
  /* A chimera onesie in words: which animal gave what. */
  function onesieWords(ch) {
    var K = DATA.chimera || {}, by = {}, order = [];
    [['colours', 'colours'], ['ears', 'ears'], ['tail', 'tail'], ['markings', 'markings'], ['back', 'back']].forEach(function (pw) {
      var v = ch[pw[0]];
      if (!v || v === 'none' || !own(K.animals || {}, v)) return;
      if (!by[v]) { by[v] = []; order.push(v); }
      by[v].push(pw[1]);
    });
    return 'a chimera onesie with ' + and(order.map(function (v) {
      var A = K.animals[v];
      return 'the ' + and(by[v]) + ' of ' + A.a + ' ' + A.word;
    }));
  }

  /* ── Words, for the owner ────────────────────────────────────────────── */
  function label(key, value) {
    var grp = DATA.body.groups.filter(function (x) { return x.key === key; })[0];
    var o = grp && grp.options.filter(function (x) { return x[0] === value; })[0];
    return o ? o[1] : '';
  }
  function lower(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
  function and(list) {
    if (list.length < 2) return list.join('');
    return list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1];
  }
  function a(s) { return (/^[aeiou]/i.test(s) ? 'an ' : 'a ') + s; }
  function between(s) { return s === 'In between' ? 'in-between' : lower(s); }

  /* The pieces put on, in the Dress-Up Den's own words. */
  function wearWords(look) {
    var lk = clean(look);
    if (!lk) return '';
    var parts = [];
    DATA.slots.forEach(function (slot) {
      var p = lk.wear[slot];
      if (!p) return;
      var named = DATA.names[p[0]], cw = DATA.colourways[p[2]];
      if (p[0] === 'chimera-onesie' && lk.chimera) { parts.push(onesieWords(lk.chimera)); return; }
      parts.push(p[1] === 'solid' ? named + ' in plain ' + DATA.inkNames[cw.inks[0]] : named + ' ' + DATA.printA[p[1]] + ', ' + cw.name);
    });
    if (parts.length > 1) parts[parts.length - 1] = 'and ' + parts[parts.length - 1];
    return parts.join('; ');
  }

  /* A bodymind in words, read back to the person choosing it, in the booth,
     and nowhere else. Nothing here is said about anybody but to them. */
  function words(look) {
    var lk = clean(look);
    if (!lk) return '';
    var on = wearWords(lk);
    if (lk.base === 'stand') return on ? 'On the stand: ' + on + '.' : 'The stand is bare.';
    var b = lk.body, out = [];
    out.push(label('pose', b.pose) + '.');
    out.push((b.height === 'middling' ? 'In between in height' : label('height', b.height)) + ', with ' + between(label('shoulders', b.shoulders)) +
      ' shoulders, ' + a(lower(label('middle', b.middle))) + ' middle and ' + between(label('hips', b.hips)) + ' hips.');
    var skin = /^t\d/.test(b.skin) ? 'Skin ' + lower(label('skin', b.skin)) : label('skin', b.skin) + ' skin';
    out.push(skin + (b.marks.length ? ', with ' + and(b.marks.map(function (m) { return lower(label('marks', m)); })) : '') + '.');
    var face = a(lower(label('face', b.face))) + ' face, eyes ' + lower(label('eyes', b.eyes)) + ', ' + lower(label('brows', b.brows)) +
      ' brows, ' + a(lower(label('nose', b.nose))) + ' nose, mouth ' + lower(label('mouth', b.mouth));
    out.push(face.charAt(0).toUpperCase() + face.slice(1) + (b.beard !== 'none' ? ', and ' + lower(label('beard', b.beard)) : '') + '.');
    out.push(b.hair === 'bald' ? 'No hair.' : 'Hair: ' + lower(label('hair', b.hair)) + ', ' + lower(label('hairColour', b.hairColour)) + '.');
    var aids = ['eyewear', 'ears', 'faceAid', 'hands', 'neck', 'limbs'].filter(function (k) { return b[k] !== 'none' && b[k] !== 'as-drawn'; })
      .map(function (k) { var s = label(k, b[k]); return /^AAC|^An AAC/.test(s) ? s.replace(/^An/, 'an') : lower(s); });
    if (aids.length) out.push('Always with you: ' + and(aids) + '.');
    out.push(on ? 'Wearing ' + on + '.' : 'Underneath, plain ' + DATA.inkNames[b.layer] + '.');
    return out.join(' ');
  }

  /* ── A look in an address, for walking it next door ──────────────────── */
  /* The booth hands a bodymind to the Dress-Up Den in the address's fragment,
     which never reaches any server. */
  function b64url(s) {
    var bin = unescape(encodeURIComponent(s));
    var out = typeof btoa === 'function' ? btoa(bin) : Buffer.from(bin, 'binary').toString('base64');
    return out.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function unb64url(s) {
    var t = s.replace(/-/g, '+').replace(/_/g, '/');
    var bin = typeof atob === 'function' ? atob(t) : Buffer.from(t, 'base64').toString('binary');
    return decodeURIComponent(escape(bin));
  }
  function code(look) { var lk = clean(look); return lk ? b64url(JSON.stringify(lk)) : ''; }
  function uncode(s) {
    if (typeof s !== 'string' || !/^[A-Za-z0-9_-]{8,4000}$/.test(s)) return null;
    try { return clean(JSON.parse(unb64url(s))); } catch (e) { return null; }
  }

  /* A bodymind at random, for the booth to open on, so that no body is the one
     it starts from. Only the shape, skin, face and hair are drawn at random;
     nothing you always have with you is ever handed to you. */
  function random(rnd) {
    rnd = rnd || Math.random;
    var b = {};
    DATA.body.groups.forEach(function (grp) {
      var keys = grp.options.map(function (o) { return o[0]; });
      if (grp.multi) { b[grp.key] = []; return; }
      b[grp.key] = DATA.body.random.indexOf(grp.key) !== -1 ? keys[Math.floor(rnd() * keys.length)] : keys[0];
    });
    return { base: 'bodymind', body: b, wear: {} };
  }

  if (DATA.body) STANDING_ONLY = DATA.body.standingOnly || {};

  root.loveAvatar = {
    svg: svg, draw: draw, clean: clean, words: words, wearWords: wearWords,
    code: code, uncode: uncode, random: random, data: DATA,
    chimera: { clean: cleanChimera, code: chimeraCode, uncode: chimeraUncode, words: onesieWords },
    // For tools/avatar.test.mjs: which garments this file can put on a body.
    _bodyWear: Object.keys(BODY_WEAR), _hair: Object.keys(HAIR), _freeHand: freeHand
  };
})(typeof window !== 'undefined' ? window : globalThis);
