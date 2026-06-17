const state = {
  isLoading: false,
};

const form = document.getElementById("register-form");
const firstNameInput = document.getElementById("input-firstname");
const lastNameInput = document.getElementById("input-lastname");
const emailInput = document.getElementById("input-email");
const passwordInput = document.getElementById("input-password");
const submitBtn = document.getElementById("btn-submit");
const submitLabel = document.getElementById("btn-submit-label");
const spinner = document.getElementById("btn-spinner");
const firstNameError = document.getElementById("error-firstname");
const lastNameError = document.getElementById("error-lastname");
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
  [firstNameInput, lastNameInput, emailInput, passwordInput].forEach(
    (input) => {
      input.classList.remove("form-input--error");
    },
  );
  [firstNameError, lastNameError, emailError, passwordError].forEach((el) => {
    el.classList.remove("form-error--visible");
  });
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

const validate = (firstName, lastName, email, password) => {
  let valid = true;

  if (!firstName) {
    showFieldError(firstNameInput, firstNameError);
    valid = false;
  }

  if (!lastName) {
    showFieldError(lastNameInput, lastNameError);
    valid = false;
  }

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

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!validate(firstName, lastName, email, password)) return;

  setLoading(true);

  try {
    await API.signup({
      firstName,
      lastName,
      email,
      passwordHash: password,
    });

    window.location.href = "login.html";
  } catch (err) {
    showAlertError(err.message || "Something went wrong. Please try again.");
    setLoading(false);
  }
};

form.addEventListener("submit", handleSubmit);
