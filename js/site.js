/* site.js
 * 18 Oct 2026 v10
 *
 * v10 — A-10, first part: Accessibility added to the footer, linking the
 *   new /accessibility/ statement (built from BASE_PATH like the nav).
 *
 * v9 — Domain-migration prep. Every nav/brand link is now built from a
 *   BASE_PATH detected at runtime rather than hardcoding "/website/".
 *   GitHub Pages serves this repo as a PROJECT site, under a /website/
 *   path prefix; a custom domain (buildnewhabits.co.uk) serves the same
 *   files at the root. Hardcoding either one breaks the other. Detecting
 *   the host means the switch-over needs no code change here at all, and
 *   crucially means this commit does NOT break the live github.io site
 *   in the meantime. The three hardcoded links in page markup have been
 *   made relative for the same reason.
 *   Still to do AT switch-over, deliberately not done now because each
 *   would break the live site today: add a CNAME file, and repoint
 *   sitemap.xml + robots.txt at the real domain.
 * v8 — About added to NAV_LINKS now /about/ is a real page. Placed last,
 *   after Upgrade: it is the page about the person rather than the
 *   product, and the locked architecture is explicit that it carries no
 *   CTA and is not a conversion element — so it should not sit in the
 *   middle of the product journey. Nav is now six items, which is
 *   getting tight on narrow phones; if it wraps badly, About is the
 *   natural candidate to move to FOOTER_LINKS instead. Flagged rather
 *   than pre-emptively decided.
 * v7 — Philosophy added to NAV_LINKS now /philosophy/ is a real page.
 *   Placed FIRST in the nav, ahead of Products: the journey the site is
 *   trying to create is belief -> what we make -> who is here -> what it
 *   funds -> how to go deeper. Philosophy is family-wide (Build New
 *   Habits, not Move-specific), which is what earns it a nav slot;
 *   /who-its-for/ stays deliberately un-navved and reachable only via
 *   the gold button under the Move card on Products, because it is
 *   Move-only content and this site covers the whole product family.
 *   Nav order is a judgement call, easily reordered.
 * v6 — Footer fix: removed "Ltd" from the copyright line. Build New
 *   Habits is an unregistered sole trader (HMRC registration still
 *   outstanding) and must never be described as Ltd — this was live
 *   on every page.
 * v5 — Added Upgrade to NAV_LINKS now /upgrade/ is a real page (content
 *   complete; checkout wiring is separate infra work, not a reason to
 *   withhold the nav link — page renders real content, not a 404).
 * v4 — Website Build 2: added Impact to NAV_LINKS now it's a real live
 *   page. Nothing else changed.
 * v3 — 14 Jul 2026. Added the layout-mode toggle button (Auto/Desktop/Mobile) to the
 *   nav, wired to window.AlongsideLayout (layout.js — must load first).
 * v2 — Home page brought into scope this session. Brand mark now links to
 *   "/website/" since Home is real. Nothing else changed.
 * v1 — Initial. Nav + footer injection, mobile toggle.
 *
 * Alongside — shared site shell.
 * Injects nav + footer into every page via #site-nav / #site-footer mount
 * points, so nav/footer markup lives in exactly one place. Handles mobile
 * nav toggle and active-link state. No build step, no dependencies.
 *
 * Nav links ONLY the pages that are actually live. A nav link to a 404 is
 * worse than no link. Safety is now the only remaining unbuilt page
 * architecture, and it must not be linked — or built and published —
 * until BIZ-6's three safeguarding reviewer roles are filled. It carries
 * crisis routing; publishing that unreviewed is a real-world risk, not a
 * process formality.
 */

(function () {
  "use strict";

  // Path prefix, resolved at runtime. On *.github.io this repo is a
  // project site served under /website/. On the custom domain it is
  // served at the root. Nothing else in this file should ever hardcode
  // either form — build paths as BASE_PATH + "/page/".
  var BASE_PATH = /(^|\.)github\.io$/.test(window.location.hostname)
    ? "/website"
    : "";

  var NAV_LINKS = [
    { label: "Philosophy", href: BASE_PATH + "/philosophy/" },
    { label: "Products", href: BASE_PATH + "/products/" },
    { label: "Community", href: BASE_PATH + "/community/" },
    { label: "Impact", href: BASE_PATH + "/impact/" },
    { label: "Upgrade", href: BASE_PATH + "/upgrade/" },
    { label: "About", href: BASE_PATH + "/about/" }
  ];

  var FOOTER_LINKS = [
    { label: "Privacy", href: "#", comingSoon: true },
    { label: "Terms", href: "#", comingSoon: true },
    { label: "Accessibility", href: BASE_PATH + "/accessibility/", comingSoon: false },
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
          '<a class="site-nav__brand" href="' + (BASE_PATH || "") + '/">Alongside</a>' +
          '<div class="site-nav__right">' +
            '<ul class="site-nav__links" id="nav-links">' + linksHtml + "</ul>" +
            '<div class="site-nav__controls">' +
              '<button type="button" class="site-nav__layout-toggle" id="layout-toggle" aria-label="Layout: Auto. Press to change.">' +
                '<span aria-hidden="true">&#8646;</span> <span id="layout-toggle-label">Auto</span>' +
              "</button>" +
              '<button type="button" class="site-nav__toggle" id="nav-toggle" ' +
                'aria-expanded="false" aria-controls="nav-links" aria-label="Open menu">' +
                "&#9776;" +
              "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</nav>";

    var layoutToggle = document.getElementById("layout-toggle");
    var layoutLabel = document.getElementById("layout-toggle-label");

    function reflectLayoutState() {
      if (!window.AlongsideLayout || !layoutToggle || !layoutLabel) return;
      var state = window.AlongsideLayout.getState(); // 'auto' | 'desktop' | 'mobile'
      var display = state === "auto" ? "Auto" : state === "desktop" ? "Desktop" : "Mobile";
      layoutLabel.textContent = display;
      layoutToggle.setAttribute("aria-label", "Layout: " + display + ". Press to change.");
    }

    if (layoutToggle) {
      reflectLayoutState();
      layoutToggle.addEventListener("click", function () {
        if (window.AlongsideLayout) {
          window.AlongsideLayout.cycle();
          reflectLayoutState();
        }
      });
    }

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
          '<p class="site-footer__copy">&copy; ' + year + ' Build New Habits. Alongside is a trading name of Build New Habits.</p>' +
        "</div>" +
      "</footer>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderNav();
    renderFooter();
  });
})();
