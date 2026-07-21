const redirectToLoginIfUnauthenticated = () => {
  const token = localStorage.getItem(CONFIG.TOKEN_KEY);

  if (!token) {
    window.location.replace("login.html");
  }
};

redirectToLoginIfUnauthenticated();

window.addEventListener("pageshow", () => {
  redirectToLoginIfUnauthenticated();
});
