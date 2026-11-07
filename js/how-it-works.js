/* how-it-works.js
 * 07 Nov 2026 v2
 *
 * v2 — Graeme, 07 Nov: the first one opening by itself hid the other
 *   options. Now all six start closed, so the whole list is seen first.
 *
 * WEB-TRIM (master schedule row 9b). How it works: each "When…" opens
 * straight under its own button and closes the one before (one open at a
 * time); inside it, a Free / Plan switch swaps the video, its poster and
 * spoken label, the written steps, and shows "or £59.99 a year" under the
 * Plan. The chosen tier carries over to the next scenario. Without this
 * script every scenario shows, open. Nothing plays until tapped.
 */
(function () {
  "use strict";
  var tier = "free";
  var items = document.querySelectorAll(".item");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setTier(item, t) {
    item.querySelectorAll(".switch button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.t === t)); });
    item.querySelectorAll(".steps, .yearly").forEach(function (el) { el.hidden = el.dataset.t !== t; });
    var v = item.querySelector("video"), name = v.dataset[t], file = "../assets/video/" + name + ".mp4";
    if (v.querySelector("source").getAttribute("src") !== file) {
      v.pause(); v.poster = "../assets/video/" + name + "_poster.webp"; v.querySelector("source").src = file; v.load();
    }
    v.setAttribute("aria-label", (t === "free" ? "Free" : "The Plan") + ": a " + v.dataset[t + "Secs"] + "-second video with captions and no sound");
  }

  function open(key, move) {
    items.forEach(function (item) {
      var on = item.dataset.s === key, b = item.querySelector(".opener"), p = item.querySelector(".panel");
      b.setAttribute("aria-expanded", String(on)); p.hidden = !on;
      if (on) setTier(item, tier); else item.querySelector("video").pause();
      if (on && move) b.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    });
  }

  items.forEach(function (item) {
    item.querySelector(".opener").addEventListener("click", function () {
      if (this.getAttribute("aria-expanded") === "true") {
        this.setAttribute("aria-expanded", "false"); item.querySelector(".panel").hidden = true; item.querySelector("video").pause();
      } else open(item.dataset.s, true);
    });
    item.querySelectorAll(".switch button").forEach(function (b) {
      b.addEventListener("click", function () { tier = b.dataset.t; setTier(item, tier); });
    });
  });
  // All closed to begin with, so every option is seen first.
  items.forEach(function (item) {
    item.querySelector(".opener").setAttribute("aria-expanded", "false");
    item.querySelector(".panel").hidden = true;
  });
})();
