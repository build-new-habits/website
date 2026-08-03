/* who-its-for.js
 * 03 Aug 2026 v1
 *
 * Alongside — Who it's for page interactions.
 * Page-specific script, not shared with other pages — keeps site.js
 * generic (matches the existing home.js pattern).
 *
 * Handles the accessible persona tabs. Same interaction pattern as
 * home.js's initCoachTabs() (arrow-key navigation, roving tabindex),
 * duplicated rather than shared because home.js's version is hardcoded
 * to the #coach-tabs container id and touching home.js is out of this
 * page's scope.
 */

(function () {
  "use strict";

  function initPersonaTabs() {
    var tablist = document.getElementById("persona-tabs");
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
    initPersonaTabs();
  });
})();
