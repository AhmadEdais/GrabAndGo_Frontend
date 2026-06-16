const request = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem(CONFIG.TOKEN_KEY);

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
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
    request("/auth/login", "POST", { email, password }),
  signup: (data) => request("/auth/signup", "POST", data),
};
