/* community.js
 * 03 Aug 2026 v1
 *
 * Alongside — Community page interactions.
 * Page-specific script, not shared with other pages (matches the
 * home.js / who-its-for.js pattern).
 *
 * Handles the "Copy link to share" button — clipboard API with a
 * manual-select fallback for browsers/contexts where it's unavailable.
 * Deliberately not a named social platform share intent (Facebook,
 * Twitter, etc.) — the community page's own standing rule is zero
 * references to any named social platform.
 */

(function () {
  "use strict";

  function initShareButton() {
    var btn = document.getElementById("share-link-btn");
    var status = document.getElementById("share-link-status");
    if (!btn || !status) return;

    btn.addEventListener("click", function () {
      var url = btn.getAttribute("data-share-url");

      function announceCopied() {
        status.textContent = "Link copied.";
        window.setTimeout(function () {
          status.textContent = "";
        }, 4000);
      }

      function announceFailed() {
        status.textContent = "Couldn't copy automatically — link: " + url;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(announceCopied, announceFailed);
      } else {
        // Fallback for browsers without the Clipboard API.
        var temp = document.createElement("textarea");
        temp.value = url;
        temp.setAttribute("readonly", "");
        temp.style.position = "absolute";
        temp.style.left = "-9999px";
        document.body.appendChild(temp);
        temp.select();
        try {
          document.execCommand("copy");
          announceCopied();
        } catch (e) {
          announceFailed();
        }
        document.body.removeChild(temp);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initShareButton();
  });
})();
