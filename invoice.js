// ============================================================
// invoice.js
// ============================================================

const state = {
  transactionId: null,
  invoice: null,
  connection: null,
};

// ── DOM refs ──────────────────────────────────────────────────
const loadingEl = document.getElementById("loading-state");
const contentEl = document.getElementById("content");
const pdfToastEl = document.getElementById("pdf-toast");
const storeNameEl = document.getElementById("store-name");
const invoiceIdEl = document.getElementById("invoice-id");
const dateEl = document.getElementById("invoice-date");
const itemsListEl = document.getElementById("items-list");
const subtotalEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const totalEl = document.getElementById("total");
const pdfPendingEl = document.getElementById("pdf-pending");
const pdfReadyEl = document.getElementById("pdf-ready");
const viewPdfBtn = document.getElementById("view-pdf-btn");
const doneBtn = document.getElementById("done-btn");

// ── Helpers ───────────────────────────────────────────────────
const fmt = (amount) => `JD ${Number(amount).toFixed(3)}`;

const renderInvoice = () => {
  const inv = state.invoice;
  const items = inv.items || []; // ← never null past this point

  invoiceIdEl.textContent = `Invoice #${inv.transactionId}`;
  dateEl.textContent = new Date(inv.createdAt).toLocaleString();
  storeNameEl.textContent = inv.storeName;

  itemsListEl.innerHTML =
    items.length === 0
      ? `<li class="empty-items">No items purchased</li>`
      : items
          .map(
            (item) => `
            <li class="invoice-item">
                <div class="item-info">
                    <span class="item-name">${item.productName}</span>
                    <span class="item-sku">${item.sku}</span>
                </div>
                <span class="item-total">${fmt(item.lineTotal)}</span>
            </li>
        `,
          )
          .join("");

  subtotalEl.textContent = fmt(inv.subtotal);
  taxEl.textContent = fmt(inv.tax);
  totalEl.textContent = fmt(inv.total);

  if (inv.pdfUrlOrPath) {
    pdfPendingEl.hidden = true;
    pdfReadyEl.hidden = false;
  } else {
    pdfPendingEl.hidden = false;
    pdfReadyEl.hidden = true;
  }
};

const fetchInvoice = async () => {
  const invoice = await API.getInvoice(state.transactionId);
  state.invoice = invoice;
  renderInvoice();
};

// ── PDF Ready Toast ───────────────────────────────────────────
const showPdfToast = () => {
  pdfToastEl.hidden = false;
  setTimeout(() => {
    pdfToastEl.hidden = true;
  }, 5000);
};

// ── SignalR ───────────────────────────────────────────────────
const setupSignalR = async () => {
  state.connection = new signalR.HubConnectionBuilder()
    .withUrl(CONFIG.INVOICE_HUB_URL, {
      accessTokenFactory: () => localStorage.getItem(CONFIG.TOKEN_KEY),
    })
    .withAutomaticReconnect()
    .build();

  // Handler registered BEFORE start() — never after
  state.connection.on("InvoicePdfReady", async (payload) => {
    console.log("InvoicePdfReady received:", payload);
    await fetchInvoice(); // payload only has transactionId — re-fetch for the real pdfUrlOrPath
    showPdfToast();
  });

  await state.connection.start();
  await state.connection.invoke("SubscribeToInvoice", state.transactionId);
};

// ── View PDF ──────────────────────────────────────────────────
const handleViewPdf = async () => {
  viewPdfBtn.disabled = true;
  viewPdfBtn.textContent = "Opening…";

  try {
    const blob = await API.getInvoicePdfBlob(state.transactionId);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  } catch (err) {
    alert(`Could not open PDF: ${err.message}`);
  } finally {
    viewPdfBtn.disabled = false;
    viewPdfBtn.textContent = "View PDF";
  }
};

// ── Init ──────────────────────────────────────────────────────
const init = async () => {
  const params = new URLSearchParams(window.location.search);
  state.transactionId = Number(params.get("id"));
  if (!state.transactionId) {
    loadingEl.innerHTML = `<p class="error-text">No transaction specified.</p>`;
    return;
  }

  try {
    await setupSignalR();
    await fetchInvoice();

    loadingEl.hidden = true;
    contentEl.hidden = false;
  } catch (err) {
    loadingEl.innerHTML = `
            <p class="error-text">
                Could not load your receipt.<br>
                ${err.message}
            </p>
        `;
  }
};

document.addEventListener("DOMContentLoaded", init);

viewPdfBtn.addEventListener("click", handleViewPdf);

doneBtn.addEventListener("click", () => {
  if (state.connection) state.connection.stop();
  window.location.href = "home.html";
});
