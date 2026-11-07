/* site.js
 * 07 Nov 2026 v11
 *
 * v11 — WEB-TRIM (master schedule row 9b; Graeme, 07 Nov: "far far far too
 *   many words … too busy"). Three pages: Home, How it works, About, shown
 *   as plain links (no Menu button needed for three). The layout toggle is
 *   gone. The footer keeps Accessibility and the email address, written
 *   out (an email link does nothing for many people); Privacy and Terms
 *   return when their pages exist, never as "coming soon" links.
 *   Giving back is held until Graeme has something to say (07 Nov).
 *
 * v10 — A-10: Accessibility added to the footer.
 * v9 — Domain-migration prep: every link built from BASE_PATH.
 * Earlier history: see the archive in BNH-Files
 *   (Archive/website_web-trim_07nov2026/live-before-48cf877/js/site.js).
 */

(function () {
  "use strict";

  // On *.github.io this repo is served under /website/; on the custom
  // domain at the root. Build every path as BASE_PATH + "/page/".
  var BASE_PATH = /(^|\.)github\.io$/.test(window.location.hostname)
    ? "/website"
    : "";

  var NAV_LINKS = [
    { label: "Home", href: BASE_PATH + "/" },
    { label: "How it works", href: BASE_PATH + "/how-it-works/" },
    { label: "About", href: BASE_PATH + "/about/" }
  ];

  var FOOTER_LINKS = [
    { label: "Accessibility", href: BASE_PATH + "/accessibility/" }
  ];

  function norm(p) { return p.endsWith("/") ? p : p + "/"; }
  function isCurrent(href) { return norm(window.location.pathname) === norm(href); }

  function renderNav() {
    var mount = document.getElementById("site-nav");
    if (!mount) return;
    var links = NAV_LINKS.map(function (l) {
      return '<li><a href="' + l.href + '"' + (isCurrent(l.href) ? ' aria-current="page"' : "") + ">" + l.label + "</a></li>";
    }).join("");
    mount.innerHTML =
      '<header class="site-header">' +
        '<div class="wrap">' +
          '<a class="brand" href="' + (BASE_PATH || "") + '/"><img src="' + BASE_PATH + '/assets/logo.png" alt="" width="32" height="32">Alongside</a>' +
          '<nav aria-label="Main"><ul class="nav-links">' + links + "</ul></nav>" +
        "</div>" +
      "</header>";
  }

  function renderFooter() {
    var mount = document.getElementById("site-footer");
    if (!mount) return;
    var links = FOOTER_LINKS.map(function (l) {
      return '<a href="' + l.href + '">' + l.label + "</a>";
    }).join("");
    mount.innerHTML =
      '<footer class="site-footer"><div class="wrap">' + links +
        '<span class="email">hello@buildnewhabits.co.uk</span>' +
        "<span>&copy; " + new Date().getFullYear() + " Build New Habits</span>" +
      "</div></footer>";
  }

  renderNav();
  renderFooter();
})();
