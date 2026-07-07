const state = {
  connection: null,
  sessionId: null,
};

const loadingStateEl = document.getElementById("loading-state");
const errorStateEl = document.getElementById("error-state");
const errorTextEl = document.getElementById("error-text");
const statusSubtitleEl = document.getElementById("status-subtitle");
const btnRetry = document.getElementById("btn-retry");

const showError = (message) => {
  loadingStateEl.style.display = "none";
  errorStateEl.style.display = "flex";
  errorTextEl.textContent = message;
};

const getGateTokenFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("gateToken");
  return raw ? decodeURIComponent(raw) : null;
};

const waitForTrackBind = async (sessionId) => {
  state.connection = new signalR.HubConnectionBuilder()
    .withUrl(CONFIG.HUB_URL, {
      accessTokenFactory: () => localStorage.getItem(CONFIG.TOKEN_KEY),
    })
    .withAutomaticReconnect()
    .build();

  state.connection.on("TrackBound", () => {
    window.location.href = "live-cart.html";
  });

  await state.connection.start();
  await state.connection.invoke("SubscribeToSession", sessionId);

  statusSubtitleEl.textContent = "Waiting for store tracking to start...";
};

const init = async () => {
  const existingSession = await API.getActiveSession();

  if (existingSession) {
    if (existingSession.isTracked) {
      window.location.href = "live-cart.html";
    } else {
      window.location.href = `entering-store.html?sessionId=${existingSession.sessionId}`;
    }
    return;
  }
  const gateToken = getGateTokenFromUrl();

  if (!gateToken) {
    showError("No entry code found. Please scan the gate QR code again.");
    return;
  }

  try {
    const result = await API.enterStore(gateToken);

    if (!result) {
      showError("Could not open a session. Please scan again.");
      return;
    }

    state.sessionId = result.sessionId;
    await waitForTrackBind(state.sessionId);
  } catch (err) {
    showError(err.message || "Failed to enter store. Please scan again.");
  }
};

btnRetry.addEventListener("click", () => {
  window.location.href = "home.html";
});

init();
