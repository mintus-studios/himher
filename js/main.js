// JS is running, so enable the scroll animations
document.documentElement.classList.remove("no-js");

// ---------- Languages ----------
// German lives at / (index.html), English at /en/ (en/index.html).
// The DE | EN links in the header jump between the two pages.
const pageLang = document.documentElement.lang === "en" ? "en" : "de";

const menuLabels = {
  de: { open: "Menü öffnen", close: "Menü schließen" },
  en: { open: "Open menu", close: "Close menu" },
};

function rememberLang(lang) {
  try { localStorage.setItem("lang", lang); } catch (e) { /* storage blocked: fine, just not remembered */ }
}

function savedLang() {
  try { return localStorage.getItem("lang"); } catch (e) { return null; }
}

// Clicking DE / EN remembers the choice and keeps the current section (#live etc.)
document.querySelectorAll("[data-lang-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    rememberLang(link.dataset.langLink);
    location.href = link.getAttribute("href") + location.hash;
  });
});

// First visit, browser in the other language: offer a one-click switch (small box at the bottom)
const browserIsGerman = (navigator.languages || [navigator.language || ""])
  .some((l) => String(l).toLowerCase().startsWith("de"));
const otherLang = pageLang === "de" ? "en" : "de";

if (!savedLang() && browserIsGerman === (otherLang === "de")) {
  const hint = document.createElement("div");
  hint.className = "lang-hint";
  hint.setAttribute("role", "note");
  const switchLink = document.querySelector('[data-lang-link="' + otherLang + '"]');
  hint.innerHTML = otherLang === "en"
    ? '<span>This page is also available in English.</span> <a href="#" lang="en">Switch to English</a>'
    : '<span>Diese Seite gibt es auch auf Deutsch.</span> <a href="#" lang="de">Auf Deutsch lesen</a>';
  const close = document.createElement("button");
  close.type = "button";
  close.className = "lang-hint-close";
  close.setAttribute("aria-label", pageLang === "de" ? "Schließen" : "Close");
  close.textContent = "×";
  hint.appendChild(close);
  document.body.appendChild(hint);

  hint.querySelector("a").addEventListener("click", (event) => {
    event.preventDefault();
    if (switchLink) switchLink.click();
  });
  close.addEventListener("click", () => {
    rememberLang(pageLang); // they're happy with this language: don't ask again
    hint.remove();
  });
}

// ---------- Mobile navigation ----------
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");

function setNavOpen(open) {
  nav.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", menuLabels[pageLang][open ? "close" : "open"]);
}

navToggle.addEventListener("click", () => {
  setNavOpen(!nav.classList.contains("is-open"));
});

// Close the menu after picking a link
nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setNavOpen(false));
});

// Close the menu with the Escape key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setNavOpen(false);
});

// Fade sections in as they scroll into view
const revealSections = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealSections.forEach((section) => observer.observe(section));
} else {
  revealSections.forEach((section) => section.classList.add("is-visible"));
}

// Respect "reduce motion": stop the hero video and show the poster image instead
const heroVideo = document.querySelector(".hero-video");
if (heroVideo && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  heroVideo.removeAttribute("autoplay");
  heroVideo.pause();
}

// Song list: "Show all" / "Show less"
const setlist = document.querySelector("#setlist");
const setlistToggle = document.querySelector(".setlist-toggle");
if (setlist && setlistToggle) {
  setlistToggle.addEventListener("click", () => {
    const expanded = setlist.classList.toggle("is-expanded");
    setlistToggle.setAttribute("aria-expanded", String(expanded));
    // When collapsing, scroll back so the list title stays in view
    if (!expanded) setlist.closest(".setlist-wrap").scrollIntoView({ block: "start" });
  });
}

// Current year in the footer
document.querySelector("#year").textContent = new Date().getFullYear();
