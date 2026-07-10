const request = async (
  endpoint,
  method = "GET",
  body = null,
  signal = null,
) => {
  const token = localStorage.getItem(CONFIG.TOKEN_KEY);

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(signal && { signal }), // ← sits alongside method, headers, body
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${CONFIG.BASE_URL}${endpoint}`, options);

  if (response.status === 401) {
    window.location.href = "login.html";
    return;
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};
const requestWithApiKey = async (
  endpoint,
  apiKey,
  method = "GET",
  body = null,
) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${CONFIG.BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};
const API = {
  login: (email, password) =>
    request("/Users/login", "POST", { email, password }),
  signup: (data) => request("/Users/register", "POST", data),
  generateQr: () => request("/Sessions/generate-qr", "POST", { storeId: 1 }),

  simulateScan: (qrCodeData) => request("/Gate/scan", "POST", { qrCodeData }),
  getActiveSession: () => request("/Sessions/active"),
  getBalance: () => request("/Wallets/balance"),
  topUp: (amount) => request("/Wallets/top-up", "POST", { amount }),
  getActiveCart: () => request("/Carts/active"),
  bindTrack: (sessionId, trackId, source) =>
    requestWithApiKey(
      "/VisionSystem/bind-track",
      CONFIG.Vision_API_KEY,
      "POST",
      {
        sessionId: String(sessionId),
        trackId,
        source,
      },
    ),

  simulateCheckout: (trackId) =>
    requestWithApiKey("/Gate/checkout", CONFIG.GATE_API_KEY, "POST", {
      trackId,
      cameraCode: "CAM03_Checkout",
      eventTime: new Date().toISOString(),
    }),
  getInvoice: (transactionId) =>
    request(`/Invoices/GetInvoiceData/${transactionId}`),

  getInvoicePdfBlob: async (transactionId) => {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    const response = await fetch(
      `${CONFIG.BASE_URL}/Invoices/${transactionId}/pdf`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      },
    );
    if (!response.ok) throw new Error("Failed to load invoice PDF");
    return response.blob();
  },
  getInvoiceList: (pageNumber = 1, pageSize = 20) =>
    request(`/Invoices?page=${pageNumber}&pageSize=${pageSize}`),
  enterStore: (gateToken) => request("/Sessions/enter", "POST", { gateToken }),
  getProductsDemo: () => request("/Products/demo", "GET"),
  getAllActiveSessions: () =>
    requestWithApiKey("/Sessions/all-active", CONFIG.Vision_API_KEY, "GET"),
};
