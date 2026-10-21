// ===== ELEMENTS =====
const header = document.getElementById("header");
const navMenu = document.getElementById("nav-menu");
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.querySelectorAll(".nav-link");
const themeToggle = document.getElementById("theme-toggle");
const backToTop = document.getElementById("back-to-top");
const sections = document.querySelectorAll("section[id]");

// ===== MOBILE MENU =====
navToggle.addEventListener("click", () => {
  navMenu.classList.toggle("open");
  const icon = navToggle.querySelector("i");
  icon.classList.toggle("fa-bars");
  icon.classList.toggle("fa-xmark");
});

// Close menu after clicking a link
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    const icon = navToggle.querySelector("i");
    icon.classList.add("fa-bars");
    icon.classList.remove("fa-xmark");
  });
});

// ===== DARK / LIGHT THEME =====
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const icon = themeToggle.querySelector("i");
  icon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
  try { localStorage.setItem("theme", theme); } catch (e) { /* storage blocked */ }
}

let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch (e) { /* storage blocked */ }
setTheme(savedTheme || "light");

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  setTheme(current === "dark" ? "light" : "dark");
});

// ===== SCROLL: header shadow, active link, back-to-top =====
function onScroll() {
  const scrollY = window.scrollY;

  header.classList.toggle("scrolled", scrollY > 20);
  backToTop.classList.toggle("show", scrollY > 500);

  sections.forEach((section) => {
    const top = section.offsetTop - 100;
    const bottom = top + section.offsetHeight;
    const link = document.querySelector(`.nav-link[href="#${section.id}"]`);
    if (link) link.classList.toggle("active", scrollY >= top && scrollY < bottom);
  });
}
window.addEventListener("scroll", onScroll);
onScroll();

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===== TYPING EFFECT =====
const roles = ["Full-Stack Developer", "Cybersecurity Student", "React Developer", "Problem Solver"];
const typingEl = document.getElementById("typing");
let roleIndex = 0;
let charIndex = 0;
let deleting = false;

function type() {
  const word = roles[roleIndex];
  typingEl.textContent = word.substring(0, charIndex);

  if (!deleting && charIndex < word.length) {
    charIndex++;
    setTimeout(type, 100);
  } else if (deleting && charIndex > 0) {
    charIndex--;
    setTimeout(type, 50);
  } else {
    deleting = !deleting;
    if (!deleting) roleIndex = (roleIndex + 1) % roles.length;
    setTimeout(type, deleting ? 1500 : 300);
  }
}
type();

// ===== SCROLL REVEAL + SKILL BARS =====
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("show");

      const bar = entry.target.querySelector(".bar-fill");
      if (bar) bar.style.width = bar.dataset.width;

      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ===== PROJECT FILTER =====
const filterBtns = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    projectCards.forEach((card) => {
      const match = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("hide", !match);
    });
  });
});

// ===== CONTACT FORM VALIDATION =====
const form = document.getElementById("contact-form");
const successMsg = document.getElementById("form-success");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const rules = {
  name: (v) => (v.length < 3 ? "Name must be at least 3 characters." : ""),
  email: (v) => (!emailPattern.test(v) ? "Please enter a valid email address." : ""),
  subject: (v) => (v.length < 3 ? "Subject must be at least 3 characters." : ""),
  message: (v) => (v.length < 10 ? "Message must be at least 10 characters." : ""),
};

function validateField(field) {
  const value = field.value.trim();
  const group = field.parentElement;
  const errorEl = group.querySelector(".error");
  const message = value === "" ? "This field is required." : rules[field.name](value);

  errorEl.textContent = message;
  group.classList.toggle("invalid", !!message);
  group.classList.toggle("valid", !message);
  return !message;
}

// Validate live as the user types / leaves a field
form.querySelectorAll("input, textarea").forEach((field) => {
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => {
    if (field.parentElement.classList.contains("invalid")) validateField(field);
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  successMsg.textContent = "";

  const fields = [...form.querySelectorAll("input, textarea")];
  const allValid = fields.map(validateField).every(Boolean);

  if (!allValid) {
    fields.find((f) => f.parentElement.classList.contains("invalid")).focus();
    return;
  }

  successMsg.textContent = "Thank you! Your message has been sent successfully.";
  form.reset();
  fields.forEach((f) => f.parentElement.classList.remove("valid"));
});

// ===== FOOTER YEAR =====
document.getElementById("year").textContent = new Date().getFullYear();
