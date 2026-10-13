# Campus Convenience Store POS

IT415 Midterm Practical Examination - Campus Convenience Store POS (Scenario 5).

A browser-based point-of-sale system for a small campus convenience store selling snacks, drinks, and basic school supplies. The cashier selects products, adjusts quantities, enters the customer's cash payment, and the system validates it, computes the change, and generates a digital receipt.

## Features
- Product grid with six hard-coded products and prices
- Add to Cart (adding the same product again increases its quantity)
- Quantity controls (− / +), with decreasing from 1 removing the item, capped at 99
- Remove button for each cart item
- Automatic subtotal and total computation
- Order summary with all items, total quantity, and total amount due
- Cash payment input with validation:
  - Blank, non-numeric, or negative: "Please enter a valid payment amount."
  - Insufficient: "Insufficient payment. Please enter at least ₱X.XX."
  - Empty cart: "Your cart is empty. Please add at least one item."
- Change computation (Change = Amount Paid − Total Amount)
- "Payment successful" confirmation and digital receipt shown together in a pop-up overlay, with transaction number (TXN-YYYYMMDD-XXXX) and date/time (close with ✕, Close, Esc, or clicking outside; reopen with View Receipt)
- Next Order button that starts a new transaction, clearing the cart, payment, messages, and receipt
- Success feedback when items are added or removed
- Double payment prevention (cart and payment are locked after a successful payment)

## How to Run
1. Download or clone this repository.
2. Open `index.html` in Google Chrome (double-click it, or right-click → Open with → Chrome).
3. No installation, server, or internet connection is needed.

## Folder Structure
```
CampusConvenienceStorePOS/
├── index.html          # Page structure
├── README.md           # Project documentation
├── css/
│   └── style.css       # Layout and styling
├── js/
│   └── app.js          # Cart, computation, validation, and receipt logic
└── docs/
    ├── AI_LOG.md        # AI-assisted development documentation
    ├── REQUIREMENTS.md  # Requirements analysis
    └── screenshots/     # Application and GitHub screenshots
```

## Technologies
HTML5, CSS3, vanilla JavaScript, Git, GitHub, VS Code, and Claude (AI assistant).

## Tests Performed
| # | Test | Expected Result |
|---|------|-----------------|
| 1 | Add one product | Item appears in cart with quantity 1 |
| 2 | Add multiple products | All items listed with correct subtotals |
| 3 | Increase / decrease quantity | Quantity and subtotal update; at 1, − removes the item |
| 4 | Remove a product | Item disappears; total updates |
| 5 | Total updates | Total equals the sum of all subtotals |
| 6 | Blank payment | "Please enter a valid payment amount." |
| 7 | Non-numeric payment (e.g. `e`) | "Please enter a valid payment amount." |
| 8 | Negative payment | "Please enter a valid payment amount." |
| 9 | Insufficient payment | "Insufficient payment. Please enter at least ₱X.XX." |
| 10 | Pay with an empty cart | "Your cart is empty. Please add at least one item." |
| 11 | Sufficient payment | Confirmation and receipt shown with correct change |
| 12 | Next Order (new transaction) | Cart, payment, messages, and receipt are cleared |

**Worked example:** 2 × Instant Noodles (₱36.00) + 1 × Potato Chips (₱25.00) + 1 × Bottled Water (₱20.00) = ₱81.00. Paid ₱100.00 → Change ₱19.00.
