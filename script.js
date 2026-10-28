// ===== Theme toggle (remembers choice, falls back to system setting) =====
const root = document.documentElement;
const themeBtn = document.getElementById("theme-toggle");

function storedTheme() {
  try { return localStorage.getItem("theme"); } catch { return null; }
}
function currentTheme() {
  return root.dataset.theme ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}
function applyTheme(theme) {
  root.dataset.theme = theme;
  const dark = theme === "dark";
  themeBtn.innerHTML = `<i class="fas fa-${dark ? "sun" : "moon"}" aria-hidden="true"></i>`;
  themeBtn.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} theme`);
}

applyTheme(storedTheme() || currentTheme());
themeBtn.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch { /* storage unavailable */ }
});

// ===== Mobile menu =====
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");

function setMenu(open) {
  navLinks.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menuBtn.innerHTML = `<i class="fas fa-${open ? "xmark" : "bars"}" aria-hidden="true"></i>`;
}

menuBtn.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
document.addEventListener("click", e => {
  if (navLinks.classList.contains("open") && !e.target.closest(".navbar")) setMenu(false);
});
window.addEventListener("resize", () => { if (window.innerWidth > 820) setMenu(false); });

// ===== Navbar border on scroll =====
const navbar = document.getElementById("navbar");
const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// ===== Highlight the nav link for the section in view =====
const links = [...navLinks.querySelectorAll("a")];
const sections = links
  .map(a => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(a =>
        a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(s => observer.observe(s));
}

// ===== Contact form: validates, then opens the visitor's email app =====
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");

form.addEventListener("submit", e => {
  e.preventDefault();
  let firstInvalid = null;

  form.querySelectorAll("input, textarea").forEach(field => {
    const ok = field.checkValidity() && field.value.trim() !== "";
    field.closest(".field").classList.toggle("invalid", !ok);
    if (!ok && !firstInvalid) firstInvalid = field;
  });

  if (firstInvalid) {
    statusEl.textContent = "Fill in your name, a valid email and a message to send.";
    statusEl.classList.add("error");
    firstInvalid.focus();
    return;
  }

  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const message = form.elements.message.value.trim();
  const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
  const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);

  window.location.href = `mailto:01sarvotamraj@gmail.com?subject=${subject}&body=${body}`;
  statusEl.classList.remove("error");
  statusEl.textContent = "Your email app is opening with the message ready to send.";
  form.reset();
});

// ===== Footer year =====
document.getElementById("year").textContent = new Date().getFullYear();
