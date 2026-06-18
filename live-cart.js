const state = {
  isLoading: false,
  sessionId: null,
  connection: null,
  lastCartPayload: null,
};

const loadingEl = document.getElementById("loading-state");
const contentEl = document.getElementById("content");
const cartListEl = document.getElementById("cart-list");
const emptyEl = document.getElementById("empty-state");
const cartTotalEl = document.getElementById("cart-total");
const balanceEl = document.getElementById("wallet-balance");
const shortfallEl = document.getElementById("shortfall-banner");
const buttonBack = document.getElementById("btn-back");
const fmt = (amount) => `JD ${Number(amount).toFixed(3)}`;

const renderCart = () => {
  const { cartItems, cartTotal, walletBalance, isShortfall, shortfallAmount } =
    state.lastCartPayload;

  if (cartItems.length === 0) {
    cartListEl.innerHTML = "";
    emptyEl.hidden = false;
  } else {
    emptyEl.hidden = true;
    cartListEl.innerHTML = cartItems
      .map(
        (item) => `
                <li class="cart-item" data-id="${item.productId}">
                    <div class="item-info">
                        <span class="item-name">${item.productName}</span>
                        <span class="item-label">${item.aiLabel}</span>
                    </div>
                    <div class="item-right">
                        <span class="item-total">${fmt(item.lineTotal)}</span>
                        <span class="item-qty">× ${item.quantity}</span>
                    </div>
                </li>
            `,
      )
      .join("");
  }

  cartTotalEl.textContent = fmt(cartTotal);
  balanceEl.textContent = fmt(walletBalance);

  if (isShortfall) {
    shortfallEl.textContent = `Insufficient balance — return ${fmt(shortfallAmount)} worth of items to continue`;
    shortfallEl.hidden = false;
    balanceEl.classList.add("danger");
  } else {
    shortfallEl.hidden = true;
    balanceEl.classList.remove("danger");
  }
};

// ── SignalR ───────────────────────────────────────────────────
const setupSignalR = async () => {
  state.connection = new signalR.HubConnectionBuilder()
    .withUrl(CONFIG.HUB_URL, {
      accessTokenFactory: () => localStorage.getItem(CONFIG.TOKEN_KEY),
    })
    .withAutomaticReconnect()
    .build();

  // Handlers registered BEFORE start() — never after
  state.connection.on("ReceiveCartUpdate", (payload) => {
    state.lastCartPayload = payload;
    renderCart();
  });

  state.connection.on("GateStatusUpdate", (payload) => {
    console.log("GateStatusUpdate received:", payload);
    window.location.href = `invoice.html?id=${payload.transactionId}`;
  });

  await state.connection.start();
  await state.connection.invoke("SubscribeToSession", state.sessionId);
};

const liveinit = async () => {
  state.isLoading = true;

  try {
    const session = await API.getActiveSession();

    state.sessionId = session.sessionId;

    await setupSignalR();
    const cart = await API.getActiveCart(); // ← no argument needed
    state.lastCartPayload = cart;
    renderCart();
    state.isLoading = false;
    loadingEl.hidden = true;
    contentEl.hidden = false;
  } catch (err) {
    loadingEl.innerHTML = `...`;
  }
};

document.addEventListener("DOMContentLoaded", liveinit);
buttonBack.addEventListener("click", () => {
  window.location.href = "home.html";
});
