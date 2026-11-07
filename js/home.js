/* home.js
 * 07 Nov 2026 v3
 *
 * v3 — WEB-TRIM (master schedule row 9b). The rotating lines and their pause
 *   button are gone. Home's See it work has one switch, Free or the Plan:
 *   it swaps the video (and its poster and spoken label), the written steps,
 *   the hint line, and highlights that column in Free, or the Plan.
 *   Nothing plays until the person taps play (videos have no sound).
 * v2 — 14 Jul 2026. Rotator pause button (archived in BNH-Files).
 */
(function () {
  "use strict";
  var vid = document.getElementById("walk");
  if (!vid) return;
  var src = vid.querySelector("source");
  var hint = document.getElementById("tier-hint");
  var NAMES = { free: "Free", plan: "the Plan" };

  function show(tier) {
    document.querySelectorAll("#see .switch button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.tier === tier));
    });
    var name = vid.dataset[tier];
    vid.pause();
    vid.poster = "assets/video/" + name + "_poster.webp";
    src.src = "assets/video/" + name + ".mp4";
    vid.load();
    vid.setAttribute("aria-label", (tier === "free" ? "Free" : "The Plan") + ": a " + vid.dataset[tier + "Secs"] + "-second video with captions and no sound");
    document.getElementById("steps-free").hidden = tier !== "free";
    document.getElementById("steps-plan").hidden = tier !== "plan";
    var cf = document.getElementById("col-free"), cp = document.getElementById("col-plan");
    if (cf) cf.className = tier === "free" ? "on" : "";
    if (cp) cp.className = tier === "plan" ? "on" : "";
    if (hint) hint.textContent = "Showing the app on " + NAMES[tier] + ".";
  }

  document.querySelectorAll("#see .switch button").forEach(function (b) {
    b.addEventListener("click", function () { show(b.dataset.tier); });
  });
})();
