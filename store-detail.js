const state = {
  currentQrData: null,
  intervalId: null,
};

const qrImage = document.getElementById("qr-image");
const qrLoading = document.getElementById("qr-loading");
const qrExpiry = document.getElementById("qr-expiry");
const btnBack = document.getElementById("btn-back");
const btnSimulate = document.getElementById("btn-simulate");
const statusMsg = document.getElementById("status-msg");
const simulateTrackBtn = document.getElementById("simulate-track-btn");
const showStatus = (msg, isError = false) => {
  statusMsg.textContent = msg;
  statusMsg.className = `status-msg ${isError ? "status-msg--error" : "status-msg--success"}`;
};

const fetchQr = async () => {
  qrLoading.style.display = "flex";

  const data = await API.generateQr();

  if (!data) {
    qrLoading.style.display = "none";
    qrExpiry.textContent = "Failed to load QR. Retrying…";
    return;
  }

  state.currentQrData = data.qrCodeData;

  qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.qrCodeData)}`;

  qrImage.onload = () => {
    qrLoading.style.display = "none";
    btnSimulate.disabled = false;
  };

  const expires = new Date(data.expiresAt);
  qrExpiry.textContent = `Refreshes at ${expires.toLocaleTimeString()}`;
};

const handleSimulate = async () => {
  if (!state.currentQrData) return;

  btnSimulate.disabled = true;
  showStatus("Scanning…");

  const result = await API.simulateScan(state.currentQrData);

  if (result) {
    showStatus(result.message); // "Access Granted"
    clearInterval(state.intervalId);
    setTimeout(() => {
      window.location.href = "live-cart.html";
    }, 800); // brief pause so user sees "Access Granted"
  } else {
    showStatus("Scan failed. Try again.", true);
    btnSimulate.disabled = false;
  }
};
const generateTrackId = () =>
  "C_demo_" + String(Math.floor(Math.random() * 1000)).padStart(3, "0");

const handleSimulateTrack = async () => {
  try {
    simulateTrackBtn.disabled = true;

    await API.simulateScan(state.currentQrData);

    const session = await API.getActiveSession();

    const trackId = generateTrackId();
    await API.bindTrack(session.sessionId, trackId);
    localStorage.setItem(CONFIG.TRACK_KEY, trackId);

    window.location.href = "live-cart.html";
  } catch (err) {
    simulateTrackBtn.disabled = false;
  }
};
const init = async () => {
  const session = await API.getActiveSession();

  if (session) {
    window.location.href = "live-cart.html";
    return;
  }
  await fetchQr(); // first call immediately
  state.intervalId = setInterval(fetchQr, 30_000); // then every 30 s
};

btnBack.addEventListener("click", () => {
  clearInterval(state.intervalId); // stop polling before leaving
  window.history.back();
});

btnSimulate.addEventListener("click", handleSimulate);
simulateTrackBtn.addEventListener("click", handleSimulateTrack);
init();
