// ===== ELEMENTS =====
const input = document.getElementById("password");
const toggleBtn = document.getElementById("toggle");
const copyBtn = document.getElementById("copy");
const generateBtn = document.getElementById("generate");
const meterFill = document.getElementById("meter-fill");
const strengthLabel = document.getElementById("strength-label");
const crackTime = document.getElementById("crack-time");
const tipsBox = document.getElementById("tips");
const tipsList = document.getElementById("tips-list");
const checklistItems = document.querySelectorAll("#checklist li");

// A short list of passwords that appear most often in data breaches
const COMMON_PASSWORDS = [
  "password", "123456", "123456789", "12345678", "12345", "qwerty", "abc123",
  "password1", "111111", "123123", "admin", "letmein", "welcome", "monkey",
  "iloveyou", "1234567", "dragon", "football", "baseball", "sunshine",
  "princess", "qwerty123", "1q2w3e4r", "passw0rd", "master", "superman",
  "trustno1", "login", "starwars", "whatever", "hello123", "freedom",
];

const LEVELS = [
  { label: "Very Weak", color: "var(--weak)", width: "15%" },
  { label: "Weak", color: "var(--weak)", width: "30%" },
  { label: "Fair", color: "var(--fair)", width: "55%" },
  { label: "Strong", color: "var(--strong)", width: "80%" },
  { label: "Very Strong", color: "var(--very-strong)", width: "100%" },
];

const TIPS = {
  length: "Make it longer. Length matters most, so aim for 12 or more characters.",
  lower: "Add some lowercase letters.",
  upper: "Mix in a few uppercase letters.",
  number: "Include at least one number.",
  symbol: "Add symbols such as ! @ # $ % & *.",
  common: "This password is in common breach lists. Choose something unique.",
  pattern: "Avoid repeated characters and sequences like 'aaa', '123' or 'abc'.",
};

// ===== CHECKS =====
function hasSequence(pw) {
  const s = pw.toLowerCase();
  for (let i = 0; i < s.length - 2; i++) {
    const a = s.charCodeAt(i);
    const b = s.charCodeAt(i + 1);
    const c = s.charCodeAt(i + 2);
    if (a === b && b === c) return true;                 // aaa, 111
    if (b - a === 1 && c - b === 1) return true;         // abc, 123
    if (a - b === 1 && b - c === 1) return true;         // cba, 321
  }
  return false;
}

function runChecks(pw) {
  const lower = pw.toLowerCase();
  return {
    length: pw.length >= 12,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
    common: pw.length > 0 && !COMMON_PASSWORDS.some((p) => lower.includes(p)),
    pattern: pw.length > 0 && !hasSequence(pw),
  };
}

// Entropy = length × log2(size of the character pool)
function estimateEntropy(pw, checks) {
  let pool = 0;
  if (checks.lower) pool += 26;
  if (checks.upper) pool += 26;
  if (checks.number) pool += 10;
  if (checks.symbol) pool += 32;
  return pool ? pw.length * Math.log2(pool) : 0;
}

// Assumes an offline attack at 10 billion guesses per second
function formatCrackTime(entropy) {
  const seconds = Math.pow(2, entropy) / 2 / 1e10;
  const units = [
    ["years", 31536000], ["days", 86400], ["hours", 3600], ["minutes", 60], ["seconds", 1],
  ];
  if (seconds < 1) return "instantly";
  if (seconds > 31536000 * 1e6) return "millions of years";
  for (const [name, size] of units) {
    if (seconds >= size) {
      const n = Math.round(seconds / size);
      return `${n.toLocaleString()} ${n === 1 ? name.slice(0, -1) : name}`;
    }
  }
  return "instantly";
}

function getLevel(pw, checks, entropy) {
  if (!checks.common) return 0;
  let score = 0;
  if (entropy >= 28) score++;
  if (entropy >= 45) score++;
  if (entropy >= 60) score++;
  if (entropy >= 80) score++;
  if (!checks.pattern) score = Math.max(0, score - 1);
  if (!checks.length) score = Math.min(score, 2);
  return score;
}

// ===== UPDATE UI =====
function update() {
  const pw = input.value;
  const checks = runChecks(pw);

  checklistItems.forEach((li) => {
    const pass = checks[li.dataset.rule];
    li.classList.toggle("pass", pass);
    li.querySelector("i").className = pass ? "fa-solid fa-circle-check" : "fa-solid fa-circle-xmark";
  });

  if (!pw) {
    meterFill.style.width = "0";
    strengthLabel.textContent = "Start typing…";
    strengthLabel.style.color = "";
    crackTime.textContent = "";
    tipsBox.hidden = true;
    return;
  }

  const entropy = estimateEntropy(pw, checks);
  const level = LEVELS[getLevel(pw, checks, entropy)];

  meterFill.style.width = level.width;
  meterFill.style.background = level.color;
  strengthLabel.textContent = level.label;
  strengthLabel.style.color = level.color;
  crackTime.textContent = checks.common
    ? `Time to crack: ${formatCrackTime(entropy)}`
    : "Time to crack: instantly";

  const failed = Object.keys(checks).filter((key) => !checks[key]);
  tipsList.innerHTML = "";
  failed.forEach((key) => {
    const li = document.createElement("li");
    li.textContent = TIPS[key];
    tipsList.appendChild(li);
  });
  tipsBox.hidden = failed.length === 0;
}

input.addEventListener("input", update);

// ===== SHOW / HIDE =====
toggleBtn.addEventListener("click", () => {
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  toggleBtn.querySelector("i").className = show ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
  toggleBtn.setAttribute("aria-label", show ? "Hide password" : "Show password");
});

// ===== COPY =====
copyBtn.addEventListener("click", async () => {
  if (!input.value) return;
  try {
    await navigator.clipboard.writeText(input.value);
    copyBtn.querySelector("i").className = "fa-solid fa-check";
    setTimeout(() => (copyBtn.querySelector("i").className = "fa-regular fa-copy"), 1500);
  } catch (e) {
    input.select();
  }
});

// ===== GENERATE (uses the browser's secure random generator) =====
function generatePassword(length = 16) {
  const sets = ["abcdefghijkmnopqrstuvwxyz", "ABCDEFGHJKLMNPQRSTUVWXYZ", "23456789", "!@#$%^&*?-_=+"];
  const all = sets.join("");
  const random = (max) => crypto.getRandomValues(new Uint32Array(1))[0] % max;

  // Guarantee one character from each set, fill the rest randomly, then shuffle
  const chars = sets.map((set) => set[random(set.length)]);
  while (chars.length < length) chars.push(all[random(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  const pw = chars.join("");
  return hasSequence(pw) ? generatePassword(length) : pw;
}

generateBtn.addEventListener("click", () => {
  input.value = generatePassword();
  input.type = "text";
  toggleBtn.querySelector("i").className = "fa-solid fa-eye-slash";
  update();
});
