/* site.js
 * 14 Jul 2026 v1
 *
 * Alongside — shared site shell.
 * Injects nav + footer into every page via #site-nav / #site-footer mount
 * points, so nav/footer markup lives in exactly one place. Handles mobile
 * nav toggle and active-link state. No build step, no dependencies.
 *
 * Nav links ONLY the pages that are actually live. Do not add Home,
 * Philosophy, About, Upgrade, Safety, or Impact links until those pages
 * are real — a nav link to a 404 is worse than no link.
 */

(function () {
  "use strict";

  var NAV_LINKS = [
    { label: "Products", href: "/website/products/" },
    { label: "Community", href: "/website/community/" }
  ];

  var FOOTER_LINKS = [
    { label: "Privacy", href: "#", comingSoon: true },
    { label: "Terms", href: "#", comingSoon: true },
    { label: "Contact", href: "mailto:hello@buildnewhabits.co.uk", comingSoon: false }
  ];

  function currentPathMatches(href) {
    var path = window.location.pathname;
    // Normalise trailing slash differences.
    var normalisedPath = path.endsWith("/") ? path : path + "/";
    var normalisedHref = href.endsWith("/") ? href : href + "/";
    return normalisedPath.indexOf(normalisedHref) !== -1 && normalisedHref !== "/";
  }

  function renderNav() {
    var mount = document.getElementById("site-nav");
    if (!mount) return;

    var linksHtml = NAV_LINKS.map(function (link) {
      var isActive = currentPathMatches(link.href);
      var current = isActive ? ' aria-current="page"' : "";
      return (
        '<li><a class="site-nav__link" href="' + link.href + '"' + current + ">" +
        link.label +
        "</a></li>"
      );
    }).join("");

    mount.innerHTML =
      '<nav class="site-nav" aria-label="Primary">' +
        '<div class="site-nav__inner">' +
          '<span class="site-nav__brand">Alongside</span>' +
          '<button type="button" class="site-nav__toggle" id="nav-toggle" ' +
            'aria-expanded="false" aria-controls="nav-links" aria-label="Open menu">' +
            "&#9776;" +
          "</button>" +
          '<ul class="site-nav__links" id="nav-links">' + linksHtml + "</ul>" +
        "</div>" +
      "</nav>";

    var toggle = document.getElementById("nav-toggle");
    var links = document.getElementById("nav-links");

    if (toggle && links) {
      toggle.addEventListener("click", function () {
        var isOpen = links.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      });

      links.addEventListener("click", function (event) {
        if (event.target.tagName === "A") {
          links.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.setAttribute("aria-label", "Open menu");
        }
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && links.classList.contains("is-open")) {
          links.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.setAttribute("aria-label", "Open menu");
          toggle.focus();
        }
      });
    }
  }

  function renderFooter() {
    var mount = document.getElementById("site-footer");
    if (!mount) return;

    var year = new Date().getFullYear();

    var linksHtml = FOOTER_LINKS.map(function (link) {
      var comingSoonAttr = link.comingSoon ? " data-coming-soon" : "";
      var ariaLabel = link.comingSoon ? ' aria-label="' + link.label + ' — coming soon"' : "";
      return (
        '<li><a class="site-footer__link" href="' + link.href + '"' +
        comingSoonAttr + ariaLabel + ">" + link.label + "</a></li>"
      );
    }).join("");

    mount.innerHTML =
      '<footer class="site-footer">' +
        '<div class="site-footer__inner">' +
          '<ul class="site-footer__links">' + linksHtml + "</ul>" +
          '<p class="site-footer__copy">&copy; ' + year + ' Build New Habits Ltd. Alongside is a trading name of Build New Habits Ltd.</p>' +
        "</div>" +
      "</footer>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderNav();
    renderFooter();
  });
})();
