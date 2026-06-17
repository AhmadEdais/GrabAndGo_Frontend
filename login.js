const state = {
  isLoading: false,
};

const form = document.getElementById("login-form");
const emailInput = document.getElementById("input-email");
const passwordInput = document.getElementById("input-password");
const submitBtn = document.getElementById("btn-submit");
const submitLabel = document.getElementById("btn-submit-label");
const spinner = document.getElementById("btn-spinner");
const emailError = document.getElementById("error-email");
const passwordError = document.getElementById("error-password");
const alertError = document.getElementById("alert-error");
const alertErrorText = document.getElementById("alert-error-text");
const backBtn = document.getElementById("btn-back");
backBtn.addEventListener("click", () => window.history.back());
const setLoading = (loading) => {
  state.isLoading = loading;
  submitBtn.disabled = loading;
  spinner.classList.toggle("hidden", !loading);
  submitLabel.classList.toggle("hidden", loading);
};

const clearErrors = () => {
  emailInput.classList.remove("form-input--error");
  passwordInput.classList.remove("form-input--error");
  emailError.classList.remove("form-error--visible");
  passwordError.classList.remove("form-error--visible");
  alertError.classList.remove("alert-error--visible");
};

const showFieldError = (input, errorEl) => {
  input.classList.add("form-input--error");
  errorEl.classList.add("form-error--visible");
};

const showAlertError = (message) => {
  alertErrorText.textContent = message;
  alertError.classList.add("alert-error--visible");
};

const validate = (email, password) => {
  let valid = true;

  if (!email) {
    showFieldError(emailInput, emailError);
    valid = false;
  }

  if (!password) {
    showFieldError(passwordInput, passwordError);
    valid = false;
  }

  return valid;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (state.isLoading) return;

  clearErrors();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!validate(email, password)) return;

  setLoading(true);

  try {
    const data = await API.login(email, password);
    const { token, ...user } = data;

    localStorage.setItem(CONFIG.TOKEN_KEY, data.token);
    localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));

    window.location.href = "home.html";
  } catch (err) {
    showAlertError(err.message || "Something went wrong. Please try again.");
    setLoading(false);
  }
};

form.addEventListener("submit", handleSubmit);
