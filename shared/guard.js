const token = localStorage.getItem(CONFIG.TOKEN_KEY);

if (!token) {
  window.location.href = "login.html";
}
