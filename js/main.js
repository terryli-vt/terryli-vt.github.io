/* ============================================================
   TYPEWRITER
   ============================================================ */
function initTypewriter() {
  const el = document.getElementById("typewriter");
  if (!el) return;

  const phrases = [
    "I build things for the web.",
    "I turn ideas into products.",
    "I explore new technologies.",
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const TYPE_SPEED = 60;
  const DELETE_SPEED = 35;
  const PAUSE_END = 2000;
  const PAUSE_START = 400;

  function tick() {
    const current = phrases[phraseIndex];

    if (!deleting) {
      el.textContent = current.slice(0, ++charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, PAUSE_END);
        return;
      }
    } else {
      el.textContent = current.slice(0, --charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, PAUSE_START);
        return;
      }
    }

    setTimeout(tick, deleting ? DELETE_SPEED : TYPE_SPEED);
  }

  setTimeout(tick, 800);
}

/* ============================================================
   THEME
   ============================================================ */
(function () {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
})();

function initTheme() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  function updateIcon(theme) {
    btn.innerHTML =
      theme === "dark"
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
         </svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
         </svg>`;
    btn.title =
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  }

  const current =
    document.documentElement.getAttribute("data-theme") || "light";
  updateIcon(current);

  btn.addEventListener("click", () => {
    const next =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateIcon(next);
  });
}

/* ============================================================
   ACTIVE NAV LINK
   ============================================================ */
function initNav() {
  const path = window.location.pathname;
  document.querySelectorAll(".nav-links a, .nav-mobile a").forEach((a) => {
    const href = a.getAttribute("href") || "";
    const isHome = href === "index.html" || href === "/" || href === "./";
    const isCurrentHome = path.endsWith("/") || path.endsWith("index.html");

    if (isHome && isCurrentHome) {
      a.classList.add("active");
    } else if (!isHome && path.includes(href.replace(".html", ""))) {
      if (href !== "index.html") a.classList.add("active");
    }
  });
}

/* ============================================================
   MOBILE NAV
   ============================================================ */
function initMobileNav() {
  const btn = document.getElementById("nav-hamburger");
  const menu = document.getElementById("nav-mobile");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    btn.classList.toggle("open");
    menu.classList.toggle("open");
  });

  // Close on link click
  menu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      btn.classList.remove("open");
      menu.classList.remove("open");
    });
  });
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08 },
  );

  els.forEach((el) => obs.observe(el));
}

/* ============================================================
   NAVBAR
   ============================================================ */
function initNavbar() {
  const nav = document.querySelector("nav.nav");
  const mobileNav = document.getElementById("nav-mobile");
  if (!nav) return;

  const links = [
    { href: "/index.html", label: "Home" },
    { href: "/pages/projects.html", label: "Projects" },
    { href: "/pages/blog.html", label: "Blog" },
    { href: "/pages/about.html", label: "About" },
  ];

  const linkHTML = links
    .map((l) => `<a href="${l.href}">${l.label}</a>`)
    .join("");

  nav.innerHTML = `
    <a href="/index.html" class="nav-logo">
      <img src="/assets/logo-mark-cropped.svg" alt="TL" class="nav-logo-img" />
      Terry<span>Li</span>
    </a>
    <div class="nav-links">${linkHTML}</div>
    <div class="nav-right">
      <button class="theme-toggle" id="theme-toggle" title="Toggle theme" aria-label="Toggle theme"></button>
      <button class="nav-hamburger" id="nav-hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  `;

  if (mobileNav) {
    mobileNav.innerHTML = linkHTML;
  }
}

/* ============================================================
   FOOTER
   ============================================================ */
function initFooter() {
  const footer = document.querySelector("footer.footer");
  if (!footer) return;

  footer.innerHTML = `
    <span>© ${new Date().getFullYear()} Terry Li</span>
    <div class="footer-links">
      <a href="https://github.com/terryli-vt" target="_blank">GitHub</a>
      <a href="https://www.linkedin.com/in/terry-li-vt/" target="_blank">LinkedIn</a>
      <a href="mailto:terryli199@gmail.com">Email</a>
    </div>
  `;
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  initTypewriter();
  initNavbar();
  initTheme();
  initNav();
  initMobileNav();
  initReveal();
  initFooter();
});
