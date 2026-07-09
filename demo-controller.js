const state = {
  mqttStatus: null,
  signalRConnection: null,
  incomingList: {},
  trackedList: {},
  currentTrackId: null,
};
let productsList = [];
const mqttStatus = document.getElementById("mqtt-status");
const incomingEmpty = document.getElementById("incoming-empty");
const incomingList = document.getElementById("incoming-list");
const trackedEmpty = document.getElementById("tracked-empty");
const trackedList = document.getElementById("tracked-list");
const btnCheckout = document.getElementById("btn-checkout");
const selectedTrackLabel = document.getElementById("selected-track-label");
const productGrid = document.getElementById("product-grid");
const eventLog = document.getElementById("event-log");
const changeMqttStatusTextToConnected = () => {
  mqttStatus.classList.remove("connection-status--disconnected");
  mqttStatus.classList.add("connection-status--connected");
  mqttStatus.textContent = "MQTT: connected successfully";
};
const changeMqttStatusTextToDisConnected = () => {
  mqttStatus.classList.remove("connection-status--connected");
  mqttStatus.classList.add("connection-status--disconnected");
  mqttStatus.textContent = "MQTT: disconnected";
};

const sessionEntered = (payload) => {
  state.incomingList[payload.sessionId] = payload;
  renderIncomingList();
};
const generateTrackId = () =>
  "C_demo_" + String(Math.floor(Math.random() * 1000)).padStart(3, "0");

const renderIncomingList = () => {
  const sessions = Object.values(state.incomingList);

  if (sessions.length === 0) {
    incomingEmpty.hidden = false;
    incomingList.hidden = true;
    incomingList.innerHTML = "";
    return;
  }

  incomingEmpty.hidden = true;
  incomingList.hidden = false;

  incomingList.innerHTML = sessions
    .map(
      (session) => `
    <div class="session-card">
      <div class="session-card__info">
        <span class="session-card__id">Session #${session.sessionId}</span>
        <span class="session-card__meta">Store ${session.storeId} — ${new Date(session.startedAt).toLocaleTimeString()}</span>
      </div>
      <button class="btn-bind" data-session-id="${session.sessionId}">Bind</button>
    </div>
  `,
    )
    .join("");
};
const connectToMqttBroker = async () => {
  state.mqttStatus = mqtt.connect(CONFIG.Broker.Host, {
    username: CONFIG.Broker.Username,
    password: CONFIG.Broker.Password,
  });
  state.mqttStatus.on("connect", () => {
    changeMqttStatusTextToConnected();
  });
  state.mqttStatus.on("close", () => {
    changeMqttStatusTextToDisConnected();
  });

  state.mqttStatus.on("error", (err) => {
    console.error("MQTT error:", err);
    mqttStatus.textContent = "MQTT: error";
  });
  state.mqttStatus.on("message", (topic, payload) => {
    console.log(topic, payload.toString());
  });
};
const connectToHub = async () => {
  state.signalRConnection = new signalR.HubConnectionBuilder()
    .withUrl(CONFIG.HUB_URL, {})
    .withAutomaticReconnect()
    .build();

  state.signalRConnection.on("SessionEntered", (payload) => {
    sessionEntered(payload);
  });
  try {
    await state.signalRConnection.start();
    console.log("Connected to CartHub");
    await state.signalRConnection.invoke("SubscribeToDemoFeed");
  } catch (err) {
    console.error("SignalR start failed:", err);
    setTimeout(connectToHub, 3000);
  }
};
const logToEventLog = (message, variant = "") => {
  const emptyMsg = eventLog.querySelector(".event-log__empty");
  if (emptyMsg) emptyMsg.remove();
  const line = document.createElement("div");
  line.className = `event-log__line${variant ? ` event-log__line--${variant}` : ""}`;
  line.textContent = message;
  eventLog.appendChild(line);
  eventLog.scrollTop = eventLog.scrollHeight;
};
const renderProductGrid = async () => {
  const cardsHtml = productsList
    .map(
      (product) => `
  <div class="product-card">
    <div class="product-card__name">${product.productName}</div>
    <div class="product-card__label">${product.productsAiLabel}</div>
    <div class="product-card__actions">
      <button class="btn-action btn-pick" data-label="${product.productsAiLabel}" disabled>Pick</button>
      <button class="btn-action btn-return" data-label="${product.productsAiLabel}" disabled>Return</button>
    </div>
  </div>
`,
    )
    .join("");

  productGrid.innerHTML = cardsHtml;
};
const renderTrackedList = async () => {
  const trackIds = Object.values(state.trackedList);

  if (trackIds.length === 0) {
    trackedEmpty.hidden = false;
    trackedList.hidden = true;
    trackedList.innerHTML = "";
    return;
  }

  trackedList.hidden = false;
  trackedEmpty.hidden = true;

  trackedList.innerHTML = trackIds
    .map(
      (tracked) => `
    <div class="track-card" data-track-id="${tracked.trackId}">
      <div class="track-card__info">
        <span class="track-card__id">${tracked.trackId}</span>
        <span class="track-card__meta">Session #${tracked.sessionId} — Store ${tracked.storeId}</span>
      </div>
      <span class="track-card__badge">Tracking</span>
    </div>
  `,
    )
    .join("");
};
productGrid.addEventListener("click", (event) => {
  const target = event.target;
  const isPick = target.classList.contains("btn-pick");
  const isReturn = target.classList.contains("btn-return");
  if (!isPick && !isReturn) return;
  if (!state.currentTrackId) return;
  const aiLabel = target.dataset.label;
  const action = isPick ? "Pick" : "Return";
  const payload = {
    TrackId: state.currentTrackId,
    AiLabel: aiLabel,
    Action: action,
    EventTime: new Date().toISOString(),
    Confidence: 0.97,
    CameraCode: "CAM_DEMO",
  };
  state.mqttStatus.publish(CONFIG.Broker.Topic, JSON.stringify(payload));
  logToEventLog(
    `${action}: ${aiLabel} → ${state.currentTrackId}`,
    isReturn ? "return" : "",
  );
});
incomingList.addEventListener("click", async (event) => {
  const target = event.target;
  if (!target.classList.contains("btn-bind")) return;
  const id = target.dataset.sessionId;
  const generatedTrackId = generateTrackId();
  try {
    await API.bindTrack(id, generatedTrackId, "CAM_DEMO");
    const storeId = state.incomingList[id]?.storeId;
    delete state.incomingList[id];
    renderIncomingList();
    state.trackedList[generatedTrackId] = {
      sessionId: id,
      trackId: generatedTrackId,
      storeId,
    };
    renderTrackedList();
  } catch (err) {
    logToEventLog(`error calling bind track ${err}`);
  }
});
trackedList.addEventListener("click", (event) => {
  const card = event.target.closest(".track-card");
  if (!card) return;

  const trackId = card.dataset.trackId;
  state.currentTrackId = trackId;

  trackedList
    .querySelectorAll(".track-card")
    .forEach((el) => el.classList.remove("track-card--selected"));

  card.classList.add("track-card--selected");

  selectedTrackLabel.textContent = trackId;
  selectedTrackLabel.classList.remove("selected-bar__value--empty");

  btnCheckout.disabled = false;

  productGrid
    .querySelectorAll(".btn-action")
    .forEach((btn) => (btn.disabled = false));
});
btnCheckout.addEventListener("click", async () => {
  if (!state.currentTrackId) return;

  const trackId = state.currentTrackId;

  try {
    await API.simulateCheckout(trackId);

    delete state.trackedList[trackId];
    renderTrackedList();

    state.currentTrackId = null;
    selectedTrackLabel.textContent = "No customer selected";
    selectedTrackLabel.classList.add("selected-bar__value--empty");

    btnCheckout.disabled = true;
    productGrid
      .querySelectorAll(".btn-action")
      .forEach((btn) => (btn.disabled = true));

    logToEventLog(`Checked out: ${trackId}`, "checkout");
  } catch (err) {
    logToEventLog(`Checkout failed for ${trackId}: ${err.message}`);
  }
});
const init = async () => {
  try {
    await connectToMqttBroker();
    await connectToHub();
    const data = await API.getProductsDemo();
    productsList = data.map((item) => ({
      productName: item.productName,
      productsAiLabel: item.productAiLabel,
      productImageUrl: item.imageUrl,
    }));
    await renderProductGrid();
  } catch (err) {
    console.log(`error${err}`);
  }
};
init();
