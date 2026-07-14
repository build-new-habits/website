/* layout.js
 * 14 Jul 2026 v1
 *
 * Alongside — responsive layout controller.
 * Default behaviour is fully automatic: layout follows the real viewport
 * width via matchMedia, exactly like normal responsive design. On top of
 * that, a nav toggle lets the person force "desktop" or "mobile" layout
 * regardless of their actual viewport — the choice persists (localStorage)
 * across pages and reloads until they cycle back to Auto.
 *
 * Sets data-layout="mobile" or "desktop" on <html>. All layout-switching
 * CSS should key off [data-layout="..."], not raw @media width queries —
 * that's what makes the manual override actually override.
 *
 * Must load BEFORE site.js in every page (site.js's nav renders the
 * toggle button and reads window.AlongsideLayout).
 */

window.AlongsideLayout = (function () {
  "use strict";

  var STORAGE_KEY = "alongside-layout-override"; // 'mobile' | 'desktop' | absent = auto
  var BREAKPOINT = "(min-width: 768px)";
  var mql = window.matchMedia(BREAKPOINT);

  function getOverride() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return value === "mobile" || value === "desktop" ? value : null;
    } catch (e) {
      // localStorage unavailable (private browsing etc.) — fall back to auto.
      return null;
    }
  }

  function setOverride(value) {
    try {
      if (value === null) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, value);
      }
    } catch (e) {
      // Ignore — worst case the choice doesn't persist this session.
    }
  }

  function getEffectiveLayout() {
    var override = getOverride();
    if (override) return override;
    return mql.matches ? "desktop" : "mobile";
  }

  function apply() {
    document.documentElement.setAttribute("data-layout", getEffectiveLayout());
  }

  function getState() {
    // 'auto' | 'desktop' | 'mobile' — what the toggle button should show.
    return getOverride() || "auto";
  }

  function cycle() {
    var state = getState();
    var next = state === "auto" ? "desktop" : state === "desktop" ? "mobile" : null;
    setOverride(next);
    apply();
    return getState();
  }

  // Keep auto mode live if the person resizes/rotates without an override set.
  mql.addEventListener("change", function () {
    if (!getOverride()) apply();
  });

  apply();

  return {
    getState: getState,
    cycle: cycle,
    apply: apply
  };
})();
