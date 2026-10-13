// ============================================
// Campus Convenience Store POS - app.js
// Flow: Browse → Add to Cart → Review → Pay → Validate → Confirm → Receipt
// ============================================

"use strict"; // Catches common mistakes, like undeclared variables

// ===== Product catalog (prices stored in centavos to avoid floating-point errors) =====
// Each product's photo is in the images folder (path is relative to index.html)
const PRODUCTS = [
  { id: "noodles",  name: "Instant Noodles",  priceCents: 1800, image: "images/noodles.jpg" },
  { id: "chips",    name: "Potato Chips",     priceCents: 2500, image: "images/chips.jpg" },
  { id: "soda",     name: "Soft Drink (Can)", priceCents: 2500, image: "images/soda.jpg" },
  { id: "water",    name: "Bottled Water",    priceCents: 2000, image: "images/water.jpg" },
  { id: "ballpen",  name: "Ballpen (piece)",  priceCents: 1200, image: "images/ballpen.jpg" },
  { id: "notebook", name: "Notebook (piece)", priceCents: 3500, image: "images/notebook.jpg" },
];

const MAX_QUANTITY = 99;
const TOAST_DURATION_MS = 2000;
const STORE_NAME = "Campus Convenience Store";

// All on-screen messages in one place (validation wording follows the exam sheet exactly)
const MESSAGES = {
  invalidAmount: "Please enter a valid payment amount.",
  emptyCart: "Your cart is empty. Please add at least one item.",
  insufficient: (totalCents) => `Insufficient payment. Please enter at least ${formatPeso(totalCents)}.`,
  added: (name) => `${name} added to cart.`,
  removed: (name) => `${name} removed from cart.`,
  maxReached: (name) => `${name} is already at the maximum quantity of ${MAX_QUANTITY}.`,
  newTransaction: "New transaction started. Ready for the next order.",
};

// ===== Application state (kept in memory, no database) =====
let cart = [];        // Each item: { productId, quantity }
let isPaid = false;   // true after a successful payment; locks the cart until New Transaction
let toastTimerId = null;

// ===== Element references (filled once the page loads) =====
const elements = {};

function cacheElements() {
  elements.productGrid = document.getElementById("product-grid");
  elements.cartContainer = document.getElementById("cart-container");
  elements.cartCount = document.getElementById("cart-count");
  elements.summaryContainer = document.getElementById("summary-container");
  elements.paymentForm = document.getElementById("payment-form");
  elements.amountInput = document.getElementById("amount-paid");
  elements.confirmButton = document.getElementById("confirm-payment");
  elements.paymentMessage = document.getElementById("payment-message");
  elements.paymentConfirmation = document.getElementById("payment-confirmation");
  elements.paidActions = document.getElementById("paid-actions");
  elements.viewReceiptButton = document.getElementById("view-receipt");
  elements.nextOrderPanelButton = document.getElementById("next-order-panel");
  elements.receiptDialog = document.getElementById("receipt-dialog");
  elements.receiptContainer = document.getElementById("receipt-container");
  elements.closeReceiptButton = document.getElementById("close-receipt");
  elements.closeReceiptSecondaryButton = document.getElementById("close-receipt-secondary");
  elements.nextOrderButton = document.getElementById("next-order");
  elements.toast = document.getElementById("toast");
}

// ============================================
// Helpers
// ============================================

// Converts centavos to a peso string, e.g. 16500 → "₱165.00"
function formatPeso(cents) {
  const pesos = cents / 100;
  return "₱" + pesos.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function findProduct(productId) {
  return PRODUCTS.find((product) => product.id === productId);
}

function findCartItem(productId) {
  return cart.find((item) => item.productId === productId);
}

// Joins each cart item with its product details, so rendering code doesn't repeat the lookup
// Subtotal = Unit Price × Quantity
function getCartLines() {
  return cart.map((item) => {
    const product = findProduct(item.productId);
    return { product, quantity: item.quantity, subtotalCents: product.priceCents * item.quantity };
  });
}

// Total Amount = sum of all subtotals
function getTotalCents() {
  return getCartLines().reduce((sum, line) => sum + line.subtotalCents, 0);
}

function getTotalQuantity() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Reference number format: TXN-YYYYMMDD-XXXX
function generateReference(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `TXN-${year}${month}${day}-${random}`;
}

function formatDateTime(date) {
  return date.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
}

// ============================================
// Cart actions
// ============================================

// Runs a cart change, then refreshes the screen. Does nothing once paid (cart is locked).
// The change function returns false when nothing changed, which skips the refresh.
function updateCart(change) {
  if (isPaid) return;
  if (change() === false) return;
  clearPaymentMessage();
  renderAll();
}

// Adds 1 to an item already in the cart; returns false if it is at the maximum
function incrementItem(item) {
  if (item.quantity >= MAX_QUANTITY) {
    showToast(MESSAGES.maxReached(findProduct(item.productId).name));
    return false;
  }
  item.quantity += 1;
  return true;
}

function addToCart(productId) {
  updateCart(() => {
    const item = findCartItem(productId);
    if (item) {
      // Already in cart: increase quantity instead of duplicating
      if (!incrementItem(item)) return false;
    } else {
      cart.push({ productId, quantity: 1 });
    }
    showToast(MESSAGES.added(findProduct(productId).name));
  });
}

function increaseQuantity(productId) {
  updateCart(() => {
    const item = findCartItem(productId);
    return item ? incrementItem(item) : false;
  });
}

function decreaseQuantity(productId) {
  const item = findCartItem(productId);
  if (!item) return;

  // Quantity never reaches zero: decreasing from 1 removes the item
  if (item.quantity === 1) {
    removeFromCart(productId);
    return;
  }
  updateCart(() => {
    item.quantity -= 1;
  });
}

function removeFromCart(productId) {
  updateCart(() => {
    cart = cart.filter((item) => item.productId !== productId);
    showToast(MESSAGES.removed(findProduct(productId).name));
  });
}

// ============================================
// Rendering
// ============================================

function renderAll() {
  renderProducts();
  renderCart();
  renderSummary();
  updatePaymentControls();
}

function renderProducts() {
  elements.productGrid.innerHTML = PRODUCTS.map((product) => {
    const item = findCartItem(product.id);
    const cardClass = item ? "product-card in-cart" : "product-card";
    const badge = item ? `<span class="in-cart-badge">${item.quantity} in cart</span>` : "";
    const disabled = isPaid ? "disabled" : "";
    // Full URL, so the path works the same no matter which file reads the CSS variable
    const imageUrl = new URL(product.image, document.baseURI).href;

    // --product-image is the background photo used by .product-card::before in style.css
    return `
      <article class="${cardClass}" style="--product-image: url('${imageUrl}')">
        ${badge}
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-price">${formatPeso(product.priceCents)}</p>
          <button type="button" class="btn btn-add" data-action="add" data-id="${product.id}" ${disabled}>
            Add to Cart
          </button>
        </div>
      </article>`;
  }).join("");
}

function renderCart() {
  const quantity = getTotalQuantity();
  elements.cartCount.textContent = `${quantity} ${quantity === 1 ? "item" : "items"}`;

  if (cart.length === 0) {
    elements.cartContainer.innerHTML =
      `<p class="empty-state">Your cart is empty. Click "Add to Cart" on a product to start an order.</p>`;
    return;
  }

  const disabled = isPaid ? "disabled" : "";
  const rows = getCartLines().map(({ product, quantity, subtotalCents }) => `
      <tr>
        <td>
          <span class="cart-item-name">${product.name}</span>
          <button type="button" class="btn-link" data-action="remove" data-id="${product.id}" ${disabled}>Remove</button>
        </td>
        <td class="num">${formatPeso(product.priceCents)}</td>
        <td class="center">
          <div class="qty-control">
            <button type="button" data-action="decrease" data-id="${product.id}"
                    aria-label="Decrease ${product.name}" ${disabled}>−</button>
            <span class="qty-value">${quantity}</span>
            <button type="button" data-action="increase" data-id="${product.id}"
                    aria-label="Increase ${product.name}" ${disabled}>+</button>
          </div>
        </td>
        <td class="num">${formatPeso(subtotalCents)}</td>
      </tr>`).join("");

  elements.cartContainer.innerHTML = `
    <div class="table-wrap">
      <table class="cart-table">
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col" class="num">Price</th>
            <th scope="col" class="center">Qty</th>
            <th scope="col" class="num">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function renderSummary() {
  const items = getCartLines().map(({ product, quantity, subtotalCents }) =>
    `<li><span>${quantity} × ${product.name}</span><span>${formatPeso(subtotalCents)}</span></li>`
  ).join("");

  const list = cart.length > 0
    ? `<ul class="summary-list">${items}</ul>`
    : `<p class="empty-state">No items yet.</p>`;

  elements.summaryContainer.innerHTML = `
    ${list}
    <div class="summary-row"><span>Total Quantity</span><span>${getTotalQuantity()}</span></div>
    <div class="summary-row summary-total"><span>Total Amount Due</span><span>${formatPeso(getTotalCents())}</span></div>`;
}

// Locks the payment form after a successful payment (prevents paying twice)
function updatePaymentControls() {
  elements.amountInput.disabled = isPaid;
  elements.confirmButton.disabled = isPaid;
  elements.paidActions.hidden = !isPaid;
}

// ============================================
// Payment and validation
// ============================================

function invalidResult(message) {
  return { isValid: false, message };
}

// Returns { isValid, message } or { isValid, amountPaidCents }
function validatePayment(input, totalCents) {
  if (cart.length === 0) {
    return invalidResult(MESSAGES.emptyCart);
  }

  // badInput is true when the browser cannot read the typed text as a number (e.g. "e" or "1-")
  if (input.validity.badInput) {
    return invalidResult(MESSAGES.invalidAmount);
  }

  const rawValue = input.value.trim();
  if (rawValue === "") {
    return invalidResult(MESSAGES.invalidAmount);
  }

  const amount = Number(rawValue);
  if (!Number.isFinite(amount) || amount < 0) {
    return invalidResult(MESSAGES.invalidAmount);
  }

  const amountPaidCents = Math.round(amount * 100);
  if (amountPaidCents < totalCents) {
    return invalidResult(MESSAGES.insufficient(totalCents));
  }

  return { isValid: true, amountPaidCents };
}

function handlePaymentSubmit(event) {
  event.preventDefault(); // Stop the form from reloading the page
  if (isPaid) return;     // Already paid: ignore extra clicks

  const totalCents = getTotalCents();
  const result = validatePayment(elements.amountInput, totalCents);

  if (!result.isValid) {
    showPaymentError(result.message);
    return;
  }

  completeTransaction(totalCents, result.amountPaidCents);
}

function completeTransaction(totalCents, amountPaidCents) {
  const now = new Date();
  const transaction = {
    reference: generateReference(now),
    dateTime: formatDateTime(now),
    items: getCartLines().map(({ product, quantity, subtotalCents }) => ({
      name: product.name,
      quantity,
      unitPriceCents: product.priceCents,
      subtotalCents,
    })),
    totalCents,
    amountPaidCents,
    changeCents: amountPaidCents - totalCents, // Change = Amount Paid − Total Amount
  };

  isPaid = true;
  clearPaymentMessage();
  renderConfirmation(transaction);
  renderReceipt(transaction);
  renderAll();
  openReceipt();
}

function showPaymentError(message) {
  elements.paymentMessage.textContent = message;
  // Hide, force the browser to redraw, then show again so the shake animation replays every time
  elements.paymentMessage.hidden = true;
  void elements.paymentMessage.offsetWidth;
  elements.paymentMessage.hidden = false;
  elements.amountInput.setAttribute("aria-invalid", "true");
  elements.amountInput.focus();
}

function clearPaymentMessage() {
  elements.paymentMessage.textContent = "";
  elements.paymentMessage.hidden = true;
  elements.amountInput.removeAttribute("aria-invalid");
}

// ============================================
// Confirmation and receipt
// ============================================

// One label/value row inside a .detail-list; highlighted rows are larger and green
function detailRow(label, value, isHighlighted = false) {
  const rowClass = isHighlighted ? ` class="highlight-row"` : "";
  return `<div${rowClass}><dt>${label}</dt><dd>${value}</dd></div>`;
}

function renderConfirmation(transaction) {
  elements.paymentConfirmation.innerHTML = `
    <p class="confirmation-title">✓ Payment successful</p>
    <dl class="detail-list">
      ${detailRow("Transaction No.", transaction.reference)}
      ${detailRow("Total Amount Due", formatPeso(transaction.totalCents))}
      ${detailRow("Amount Paid", formatPeso(transaction.amountPaidCents))}
      ${detailRow("Change", formatPeso(transaction.changeCents), true)}
    </dl>`;
}

function renderReceipt(transaction) {
  const rows = transaction.items.map((item) => `
    <tr>
      <td>${item.name}</td>
      <td class="num">${item.quantity}</td>
      <td class="num">${formatPeso(item.unitPriceCents)}</td>
      <td class="num">${formatPeso(item.subtotalCents)}</td>
    </tr>`).join("");

  elements.receiptContainer.innerHTML = `
    <div class="receipt">
      <header class="receipt-header">
        <p class="receipt-store">${STORE_NAME}</p>
        <p>Digital Receipt</p>
      </header>
      <dl class="detail-list">
        ${detailRow("Transaction No.", transaction.reference)}
        ${detailRow("Date &amp; Time", transaction.dateTime)}
      </dl>
      <table class="receipt-table">
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col" class="num">Qty</th>
            <th scope="col" class="num">Price</th>
            <th scope="col" class="num">Subtotal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <dl class="detail-list receipt-totals">
        ${detailRow("TOTAL AMOUNT DUE", formatPeso(transaction.totalCents), true)}
        ${detailRow("Amount Paid (Cash)", formatPeso(transaction.amountPaidCents))}
        ${detailRow("Change", formatPeso(transaction.changeCents), true)}
      </dl>
      <p class="receipt-footer">Payment confirmed. Thank you for shopping!</p>
    </div>`;
}

// ============================================
// Receipt overlay (uses the built-in <dialog> element)
// ============================================

function openReceipt() {
  if (!elements.receiptDialog.open) {
    elements.receiptDialog.showModal(); // Shows the overlay and dims the page behind it
  }
  elements.closeReceiptButton.focus();
}

function closeReceipt() {
  if (elements.receiptDialog.open) {
    elements.receiptDialog.close();
  }
}

// Clicking the dark area outside the receipt closes it
function handleDialogBackdropClick(event) {
  if (event.target === elements.receiptDialog) {
    closeReceipt();
  }
}

// ============================================
// New transaction
// ============================================

function startNewTransaction() {
  cart = [];
  isPaid = false;
  elements.amountInput.value = "";
  clearPaymentMessage();
  elements.paymentConfirmation.innerHTML = "";
  elements.receiptContainer.innerHTML = "";
  closeReceipt();
  renderAll();
  showToast(MESSAGES.newTransaction);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================================
// Feedback toast
// ============================================

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  clearTimeout(toastTimerId);
  toastTimerId = setTimeout(() => {
    elements.toast.hidden = true;
  }, TOAST_DURATION_MS);
}

// ============================================
// Event listeners
// ============================================

function handleProductClick(event) {
  const button = event.target.closest("button[data-action='add']");
  if (button) addToCart(button.dataset.id);
}

function handleCartClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const productId = button.dataset.id;
  const actions = {
    increase: increaseQuantity,
    decrease: decreaseQuantity,
    remove: removeFromCart,
  };
  const action = actions[button.dataset.action];
  if (action) action(productId);
}

function bindEvents() {
  // One listener per container ("event delegation") handles all buttons inside it
  elements.productGrid.addEventListener("click", handleProductClick);
  elements.cartContainer.addEventListener("click", handleCartClick);
  elements.paymentForm.addEventListener("submit", handlePaymentSubmit);
  elements.amountInput.addEventListener("input", clearPaymentMessage);
  // "Next Order" buttons start a new transaction for the next customer
  elements.nextOrderButton.addEventListener("click", startNewTransaction);
  elements.nextOrderPanelButton.addEventListener("click", startNewTransaction);
  elements.viewReceiptButton.addEventListener("click", openReceipt);
  elements.closeReceiptButton.addEventListener("click", closeReceipt);
  elements.closeReceiptSecondaryButton.addEventListener("click", closeReceipt);
  elements.receiptDialog.addEventListener("click", handleDialogBackdropClick);
  // The Esc key closes a <dialog> automatically
}

// ============================================
// Start the app once the page has loaded
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  renderAll();
});
