/* Kristina Brooke's room, Words, Bud, Beats: its script, brought onto the street by
   tools/import-room.py from the artifact they sent. Replaced whole when they send a
   new version, so change the artifact and import it again rather than editing here. */
(function () {
  var fields = document.querySelectorAll(".room-words-bud-beats [data-wbb-copy]");
  var words = document.getElementById("wbb-in-words");
  var count = document.getElementById("wbb-count");
  var button = document.getElementById("wbb-copy");
  var status = document.getElementById("wbb-status");
  if (!fields.length || !button) { return; }
  function wordCount() {
    var t = words.value.trim();
    return t ? t.split(/\s+/).length : 0;
  }
  function showCount() {
    var n = wordCount();
    count.textContent = n > 30 ? n + " words. That is " + (n - 30) + " over 30." : n + " of 30 words";
  }
  function slipText() {
    var out = ["A pairing for Words, Bud, Beats", ""];
    for (var i = 0; i < fields.length; i++) {
      out.push(fields[i].getAttribute("data-wbb-copy") + ":");
      var v = fields[i].value.trim();
      var lines = v.split("\n");
      for (var j = 0; j < lines.length; j++) { out.push("  " + lines[j]); }
      out.push("");
    }
    var canon = document.querySelector('link[rel="canonical"]');
    out.push("Copied from the Open mic at " + (canon ? canon.href : location.href.split("#")[0]));
    return out.join("\n");
  }
  function fallback(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.className = "wbb-slip-input";
    area.rows = 8;
    area.setAttribute("aria-label", "Your slip, ready to copy");
    button.parentNode.parentNode.insertBefore(area, button.parentNode.nextSibling);
    area.focus();
    area.select();
    status.textContent = "Your browser would not copy it. The slip is selected below, so press Control C or Command C.";
  }
  words.addEventListener("input", showCount);
  showCount();
  button.addEventListener("click", function () {
    if (wordCount() > 30) {
      status.textContent = "The words are over 30. Trim them, then press Copy again.";
      words.focus();
      return;
    }
    var text = slipText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        status.textContent = "Copied.";
      }, function () { fallback(text); });
    } else {
      fallback(text);
    }
  });
})();
