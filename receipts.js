// ============================================================
// receipts.js
// ============================================================

const state = {
  isLoading: false,
  invoices: [],
};

// ── DOM refs ──────────────────────────────────────────────────
const loadingEl = document.getElementById("loading-state");
const contentEl = document.getElementById("content");
const summaryTotalEl = document.getElementById("summary-total");
const summaryTripsEl = document.getElementById("summary-trips");
const listEl = document.getElementById("invoice-list");
const emptyEl = document.getElementById("empty-state");

// ── Helpers ───────────────────────────────────────────────────
const fmtAmount = (amount) => Number(amount).toFixed(3);

const fmtDate = (isoString) =>
  new Date(isoString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// ── Render: Monthly Summary ──────────────────────────────────
const renderSummary = () => {
  const now = new Date();

  const thisMonth = state.invoices.filter((inv) => {
    const d = new Date(inv.generatedAt);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  const total = thisMonth.reduce((sum, inv) => sum + Number(inv.total), 0);

  summaryTotalEl.textContent = fmtAmount(total);
  summaryTripsEl.textContent = `${thisMonth.length} shopping trip${thisMonth.length === 1 ? "" : "s"}`;
};

// ── Render: List ──────────────────────────────────────────────
const renderList = () => {
  if (state.invoices.length === 0) {
    listEl.innerHTML = "";
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;

  listEl.innerHTML = state.invoices
    .map(
      (inv) => `
            <li class="invoice-row" data-action="view-invoice" data-id="${inv.transactionId}">
                <div class="invoice-icon">
                    <svg viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="10" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>
                <div class="invoice-info">
                    <p class="invoice-store">${inv.storeName}</p>
                    <p class="invoice-date">${fmtDate(inv.generatedAt)}</p>
                </div>
                <div class="invoice-amount">
                    <span class="amount">${fmtAmount(inv.total)}</span><span class="currency">JOD</span>
                </div>
            </li>
        `,
    )
    .join("");
};

// ── Event delegation — single listener for the whole list ────
listEl.addEventListener("click", (e) => {
  const row = e.target.closest('[data-action="view-invoice"]');
  if (!row) return;

  const transactionId = row.dataset.id;
  window.location.href = `invoice.html?id=${transactionId}`;
});

// ── Init ──────────────────────────────────────────────────────
const init = async () => {
  state.isLoading = true;

  try {
    const invoices = await API.getInvoiceList();
    state.invoices = invoices;

    renderSummary();
    renderList();

    loadingEl.hidden = true;
    contentEl.hidden = false;
  } catch (err) {
    loadingEl.innerHTML = `
            <p class="error-text">
                Could not load your purchase history.<br>
                ${err.message}
            </p>
        `;
  } finally {
    state.isLoading = false;
  }
};

document.addEventListener("DOMContentLoaded", init);
