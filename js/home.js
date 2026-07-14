/* home.js
 * 14 Jul 2026 v1
 *
 * Alongside — Home page interactions.
 * Page-specific script, not shared with other pages — keeps site.js generic.
 *
 * Handles:
 *  - Movement 1 rotating fading lines, with a pause control (WCAG 2.2.2)
 *    and full static list already in the DOM for screen readers.
 *  - Movement 4 accessible tabs (coach preview cards).
 * The Movement 5 accordion uses native <details>/<summary> — no JS needed.
 */

(function () {
  "use strict";

  /* ---------- Movement 1: rotating headline ---------- */

  function initRotator() {
    var rotator = document.getElementById("hero-rotator");
    if (!rotator) return;

    var lines = Array.prototype.slice.call(
      rotator.querySelectorAll(".hero__rotator-line")
    );
    var pauseBtn = document.getElementById("hero-pause");
    if (lines.length === 0) return;

    var index = 0;
    var intervalId = null;
    var isPaused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function show(i) {
      lines.forEach(function (line, idx) {
        line.classList.toggle("is-active", idx === i);
      });
    }

    function tick() {
      index = (index + 1) % lines.length;
      show(index);
    }

    function start() {
      if (intervalId || isPaused) return;
      intervalId = window.setInterval(tick, 4500);
    }

    function stop() {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    }

    show(index);
    if (!isPaused) start();

    if (pauseBtn) {
      pauseBtn.addEventListener("click", function () {
        isPaused = !isPaused;
        if (isPaused) {
          stop();
          pauseBtn.textContent = "\u25B6"; // play glyph
          pauseBtn.setAttribute("aria-label", "Resume rotating text");
        } else {
          start();
          pauseBtn.textContent = "\u23F8"; // pause glyph
          pauseBtn.setAttribute("aria-label", "Pause rotating text");
        }
      });
    }
  }

  /* ---------- Movement 4: accessible tabs ---------- */

  function initCoachTabs() {
    var tablist = document.getElementById("coach-tabs");
    if (!tablist) return;

    var tabs = Array.prototype.slice.call(
      tablist.querySelectorAll('[role="tab"]')
    );

    function selectTab(tab) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute("aria-selected", selected ? "true" : "false");
        t.setAttribute("tabindex", selected ? "0" : "-1");
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) {
          if (selected) {
            panel.removeAttribute("hidden");
          } else {
            panel.setAttribute("hidden", "");
          }
        }
      });
      tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        selectTab(tab);
      });

      tab.addEventListener("keydown", function (event) {
        var newIndex = null;
        if (event.key === "ArrowRight") {
          newIndex = (i + 1) % tabs.length;
        } else if (event.key === "ArrowLeft") {
          newIndex = (i - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          newIndex = 0;
        } else if (event.key === "End") {
          newIndex = tabs.length - 1;
        }
        if (newIndex !== null) {
          event.preventDefault();
          selectTab(tabs[newIndex]);
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initRotator();
    initCoachTabs();
  });
})();
