// ===== QUIZ DATA =====
// All organisations, people and links below are fictional.
const QUESTIONS = [
  {
    from: "NorthBank Security &lt;security@northbank-verify-account.com&gt;",
    subject: "URGENT: Your account will be suspended in 24 hours",
    body: `
      <p>Dear Customer,</p>
      <p>We detected unusual activity on your account. To avoid suspension, verify your identity
      immediately by entering your card number and PIN.</p>
      <span class="fake-btn" title="http://northbank-verify-account.com/login.php">Verify Now</span>
      <p class="link-hint">Hover the button to see where it really goes.</p>`,
    answer: "phishing",
    reasons: [
      "The sender's domain is 'northbank-verify-account.com', not the bank's real domain.",
      "It creates urgency with a 24-hour threat.",
      "Banks never ask for your PIN by email.",
      "It uses a generic greeting ('Dear Customer') instead of your name.",
    ],
  },
  {
    from: "University Library &lt;library@uni-northfield.ac.uk&gt;",
    subject: "Reminder: 2 books due on Friday",
    body: `
      <p>Hi Rehnuma,</p>
      <p>This is a reminder that the following items are due back on Friday:</p>
      <p>• Introduction to Network Security<br />• Information Security Management</p>
      <p>You can renew them by signing in to the library catalogue from the university website.</p>`,
    answer: "legit",
    reasons: [
      "The sender uses the university's official .ac.uk domain.",
      "It addresses you by name and mentions specific details.",
      "There's no urgency, threat or request for personal information.",
      "It tells you to go to the official website rather than clicking a link.",
    ],
  },
  {
    from: "Parcel Delivery &lt;no-reply@parcel-redelivery-uk.info&gt;",
    subject: "We missed you! Pay £1.99 to reschedule delivery",
    body: `
      <p>Your parcel could not be delivered due to an unpaid shipping fee of <strong>£1.99</strong>.</p>
      <p>Please pay within 12 hours or your parcel will be returned to sender:</p>
      <p><span class="fake-link" title="http://parcel-redelivery-uk.info/pay">www.parcel-redelivery-uk.info/pay</span></p>`,
    answer: "phishing",
    reasons: [
      "Delivery companies don't usually ask for small fees through email links.",
      "The '.info' domain doesn't match any real delivery company.",
      "There's a tight deadline to make you act without thinking.",
      "A small fee is a common trick to steal your full card details.",
    ],
  },
  {
    from: "IT Service Desk &lt;it-support@uni-northfield.ac.uk.mail-reset.co&gt;",
    subject: "Mailbox full: re-validate your password",
    body: `
      <p>Your mailbox has exceeded its storage limit. You will stop receiving emails.</p>
      <p>Click below and enter your current username and password to increase your quota:</p>
      <span class="fake-btn" title="https://mail-reset.co/uni/login">Re-validate Mailbox</span>`,
    answer: "phishing",
    reasons: [
      "Look closely: the real domain is 'mail-reset.co'. The university name is just a subdomain.",
      "IT departments never ask for your current password.",
      "'Mailbox full' is a very common phishing excuse.",
    ],
  },
  {
    from: "ShopNow Orders &lt;orders@shopnow.co.uk&gt;",
    subject: "Your order #48213 has been dispatched",
    body: `
      <p>Hi Rehnuma,</p>
      <p>Good news! Your order <strong>#48213</strong> (Wireless Mouse) has been dispatched and should
      arrive in 2–3 working days.</p>
      <p>You can track it any time from <em>My Orders</em> in your ShopNow account.</p>`,
    answer: "legit",
    reasons: [
      "The domain matches the shop name exactly.",
      "It includes a real order number and the item you bought.",
      "It doesn't ask for payment, a password or any personal details.",
    ],
  },
  {
    from: "Lottery Winners Dept &lt;claims.officer2026@freemail.com&gt;",
    subject: "Congratulations!!! You have WON £850,000",
    body: `
      <p>Your email address was selected in our international online draw!</p>
      <p>To claim your prize, reply with your full name, address, date of birth and bank details,
      and pay a <strong>£95 processing fee</strong>.</p>`,
    answer: "phishing",
    reasons: [
      "You can't win a lottery you never entered.",
      "It's sent from a free webmail address, not an official organisation.",
      "It asks for personal and bank details plus an upfront fee (advance-fee fraud).",
      "It uses excessive punctuation and capital letters to excite you.",
    ],
  },
  {
    from: "Sarah Mitchell (Finance) &lt;s.mitchell.finance@outlook-mail.net&gt;",
    subject: "Invoice overdue – see attached",
    body: `
      <p>Hi,</p>
      <p>Please see the attached overdue invoice and process payment today. The CEO has approved this.</p>
      <p><span class="attachment"><i class="fa-solid fa-file-zipper"></i> Invoice_2026_Final.zip</span></p>`,
    answer: "phishing",
    reasons: [
      "It's an unexpected attachment in a .zip file, a common way to deliver malware.",
      "It uses authority ('The CEO has approved this') and urgency.",
      "A finance colleague would use the company domain, not a look-alike webmail address.",
      "Always confirm unusual payment requests by phone.",
    ],
  },
  {
    from: "GitHub &lt;noreply@github.com&gt;",
    subject: "[GitHub] A new SSH key was added to your account",
    body: `
      <p>Hey rehnuma-patel!</p>
      <p>A new public key was added to your account. If you added this key, you can ignore this message.</p>
      <p>If you didn't, please review your security settings by signing in to github.com directly.</p>`,
    answer: "legit",
    reasons: [
      "It comes from the service's real domain (github.com).",
      "It includes your exact username.",
      "It's an informational security alert that doesn't ask for credentials.",
      "It advises you to sign in directly rather than through a link.",
    ],
  },
];

// ===== ELEMENTS =====
const screens = {
  start: document.getElementById("start-screen"),
  quiz: document.getElementById("quiz-screen"),
  result: document.getElementById("result-screen"),
};
const el = (id) => document.getElementById(id);
const answerBtns = document.querySelectorAll(".answer");

let order = [];
let current = 0;
let score = 0;

// ===== HELPERS =====
function showScreen(name) {
  Object.entries(screens).forEach(([key, screen]) => (screen.hidden = key !== name));
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ===== QUIZ FLOW =====
function startQuiz() {
  order = shuffle(QUESTIONS);
  current = 0;
  score = 0;
  el("score").textContent = 0;
  showScreen("quiz");
  showQuestion();
}

function showQuestion() {
  const q = order[current];
  el("question-count").textContent = `Question ${current + 1} of ${order.length}`;
  el("progress-fill").style.width = `${(current / order.length) * 100}%`;
  el("email-from").innerHTML = q.from;
  el("email-subject").textContent = q.subject;
  el("email-body").innerHTML = q.body;

  answerBtns.forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("correct", "wrong");
  });
  el("feedback").hidden = true;
}

function checkAnswer(chosen) {
  const q = order[current];
  const isCorrect = chosen === q.answer;
  if (isCorrect) score++;
  el("score").textContent = score;

  answerBtns.forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.answer === q.answer) btn.classList.add("correct");
    else if (btn.dataset.answer === chosen) btn.classList.add("wrong");
  });

  const label = q.answer === "phishing" ? "Phishing" : "Legitimate";
  el("feedback-title").textContent = isCorrect
    ? `✅ Correct! This is ${label}.`
    : `❌ Not quite. This is ${label}.`;

  const list = el("feedback-list");
  list.innerHTML = "";
  q.reasons.forEach((reason) => {
    const li = document.createElement("li");
    li.textContent = reason;
    list.appendChild(li);
  });

  el("feedback").classList.toggle("is-wrong", !isCorrect);
  el("feedback").hidden = false;
  el("next-btn").innerHTML = current === order.length - 1
    ? 'See Results <i class="fa-solid fa-flag-checkered"></i>'
    : 'Next <i class="fa-solid fa-arrow-right"></i>';
  el("next-btn").focus();
}

function nextQuestion() {
  current++;
  if (current < order.length) showQuestion();
  else showResults();
}

function showResults() {
  const pct = score / order.length;
  el("final-score").textContent = score;
  el("final-total").textContent = order.length;

  if (pct === 1) {
    el("result-title").textContent = "Phishing Expert! 🏆";
    el("result-message").textContent = "You spotted every single one. Attackers would struggle to fool you.";
  } else if (pct >= 0.75) {
    el("result-title").textContent = "Great Job! 🎉";
    el("result-message").textContent = "You have a sharp eye. Review the checklist below to catch the rest.";
  } else if (pct >= 0.5) {
    el("result-title").textContent = "Good Effort 👍";
    el("result-message").textContent = "You caught some, but a few slipped through. Keep practising!";
  } else {
    el("result-title").textContent = "Keep Learning 📚";
    el("result-message").textContent = "Phishing can be tricky. Use the checklist below and try again.";
  }
  showScreen("result");
}

// ===== EVENTS =====
el("total-count").textContent = QUESTIONS.length;
el("start-btn").addEventListener("click", startQuiz);
el("restart-btn").addEventListener("click", startQuiz);
el("next-btn").addEventListener("click", nextQuestion);
answerBtns.forEach((btn) => btn.addEventListener("click", () => checkAnswer(btn.dataset.answer)));
