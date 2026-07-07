const STORE_ID = 1; // hardcoded — this gate is deployed for store 1 only

const state = {
  refreshTimerId: null,
  connection: null,
};

const qrImage = document.getElementById("qr-image");
const gateStatus = document.getElementById("gate-status");

async function generateGateQr() {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/Gate/generate-qr`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": CONFIG.GATE_API_KEY,
      },
      body: JSON.stringify({ storeId: STORE_ID }),
    });

    if (!response.ok) {
      gateStatus.textContent = "Failed to load QR — retrying...";
      return;
    }

    const data = await response.json();
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data.qrCodeData)}&size=400x400`;

    qrImage.src = qrImageUrl;
    qrImage.hidden = false;
    gateStatus.textContent = "";
  } catch (err) {
    gateStatus.textContent = "Connection error — retrying...";
  }
}

function resetRefreshTimer() {
  if (state.refreshTimerId) {
    clearInterval(state.refreshTimerId);
  }
  state.refreshTimerId = setInterval(generateGateQr, 30000);
}

async function connectToGateHub() {
  state.connection = new signalR.HubConnectionBuilder()
    .withUrl(CONFIG.GATE_HUB_URL)
    .withAutomaticReconnect()
    .build();

  state.connection.on("RefreshQrToken", () => {
    generateGateQr();
    resetRefreshTimer();
  });

  state.connection.on("Error", (message) => {
    gateStatus.textContent = message;
  });

  try {
    await state.connection.start();
    await state.connection.invoke("JoinGateGroup", STORE_ID);
  } catch (err) {
    gateStatus.textContent = "Realtime connection failed.";
  }
}

async function init() {
  await generateGateQr();
  resetRefreshTimer();
  await connectToGateHub();
}

init();
