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
};
