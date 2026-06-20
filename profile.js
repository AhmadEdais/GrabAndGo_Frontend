const state = {
  isLoading: false,
  balance: null,
};

const avatarEl = document.getElementById("avatar");
const nameEl = document.getElementById("profile-name");
const emailEl = document.getElementById("profile-email");
const walletAmountEl = document.getElementById("wallet-amount");
const topUpBtn = document.getElementById("top-up-btn");
const modalEl = document.getElementById("modal-overlay");
const amountInput = document.getElementById("amount-input");
const inputErrorEl = document.getElementById("input-error");
const cancelBtn = document.getElementById("cancel-btn");
const confirmBtn = document.getElementById("confirm-btn");

const renderProfile = (user) => {
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  avatarEl.textContent = initials;
  nameEl.textContent = `${user.firstName} ${user.lastName}`;
  emailEl.textContent = user.email;
};

const renderBalance = () => {
  walletAmountEl.innerHTML = `${Number(state.balance).toFixed(3)} <span class="currency">JOD</span>`;
};

const openModal = () => {
  amountInput.value = "";
  amountInput.classList.remove("error");
  inputErrorEl.textContent = "";
  modalEl.hidden = false;
  amountInput.focus();
};

const closeModal = () => {
  modalEl.hidden = true;
};

const handleTopUp = async () => {
  const amount = parseFloat(amountInput.value);

  if (!amount || amount <= 0) {
    amountInput.classList.add("error");
    inputErrorEl.textContent = "Please enter a valid amount greater than 0";
    return;
  }

  amountInput.classList.remove("error");
  inputErrorEl.textContent = "";
  confirmBtn.disabled = true;
  confirmBtn.textContent = "Processing…";

  try {
    const result = await API.topUp(amount);
    state.balance = result.newBalance; // verify field name in api-contracts.md
    renderBalance();
    closeModal();
  } catch (err) {
    inputErrorEl.textContent = err.message || "Top-up failed. Try again.";
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = "Confirm";
  }
};

const init = async () => {
  state.isLoading = true;

  // User info lives in localStorage — no API call needed
  const user = JSON.parse(localStorage.getItem(CONFIG.USER_KEY));
  renderProfile(user);

  try {
    const result = await API.getBalance();
    state.balance = result.currentBalance;
    renderBalance();
  } catch (err) {
    walletAmountEl.innerHTML = `<span style="font-size:14px; opacity:0.8">Could not load balance</span>`;
  } finally {
    state.isLoading = false;
  }

  topUpBtn.addEventListener("click", openModal);
  cancelBtn.addEventListener("click", closeModal);
  confirmBtn.addEventListener("click", handleTopUp);

  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) closeModal();
  });
};

document.addEventListener("DOMContentLoaded", init);
