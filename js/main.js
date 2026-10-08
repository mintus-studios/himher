// JS is running, so enable the scroll animations
document.documentElement.classList.remove("no-js");

// ---------- Language switch (DE | EN) ----------
// The starting language is picked by the small script in <head>.
// Texts that can't be <span lang="…"> (page title, alt texts, menu label) are swapped here.
const pageTitles = {
  de: "HIM/HER — Live-Duo aus Mainz",
  en: "HIM/HER — Live Music Duo from Germany", // EDIT: English page title
};
const menuLabels = {
  de: { open: "Menü öffnen", close: "Menü schließen" },
  en: { open: "Open menu", close: "Close menu" },
};

function currentLang() {
  return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "de";
}

function setLang(lang, remember = true) {
  const root = document.documentElement;
  root.setAttribute("data-lang", lang);
  root.setAttribute("lang", lang);
  document.title = pageTitles[lang];

  document.querySelectorAll("[data-alt-" + lang + "]").forEach((img) => {
    img.alt = img.getAttribute("data-alt-" + lang);
  });
  document.querySelectorAll("[data-set-lang]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.setLang === lang));
  });
  navToggle.setAttribute("aria-label", menuLabels[lang][nav.classList.contains("is-open") ? "close" : "open"]);

  // Only remember a language the visitor picked themselves
  if (remember) {
    try { localStorage.setItem("lang", lang); } catch (e) { /* storage blocked: fine, just not remembered */ }
  }
}

document.querySelectorAll("[data-set-lang]").forEach((button) => {
  button.addEventListener("click", () => setLang(button.dataset.setLang));
});

// ---------- Mobile navigation ----------
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");

function setNavOpen(open) {
  nav.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", menuLabels[currentLang()][open ? "close" : "open"]);
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

// Apply the starting language (sets title, alt texts and which button is highlighted)
setLang(currentLang(), false);

// Current year in the footer
document.querySelector("#year").textContent = new Date().getFullYear();
