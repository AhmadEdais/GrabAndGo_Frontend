// ─── DOM Refs ─────────────────────────────────────────────────────────────────
const greetingLine = document.getElementById("greeting-line");

// ─── Init ─────────────────────────────────────────────────────────────────────
const raw = localStorage.getItem(CONFIG.USER_KEY);
const user = raw ? JSON.parse(raw) : null;

greetingLine.textContent = user?.firstName
  ? `Hi, ${user.firstName} 👋`
  : "Hi there 👋";
