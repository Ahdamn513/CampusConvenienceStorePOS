# Requirements Analysis – Campus Convenience Store POS

## Problem
A small campus convenience store computes orders, totals, and change by hand. This is slow, error-prone, and gives customers no record of their purchase.

## Target Users
- **Cashier** – operates the POS with a mouse and keyboard.
- **Customers** (mainly students) – buy snacks, drinks, and basic school supplies.

## Functional Requirements
| ID | Requirement |
|----|-------------|
| FR1 | Display at least five products with names and prices. |
| FR2 | Add products to the cart using on-screen buttons. |
| FR3 | Increase and decrease item quantities (never zero or negative). |
| FR4 | Remove a product from the cart. |
| FR5 | Automatically compute each subtotal and the total amount. |
| FR6 | Show an order summary of all items in the cart. |
| FR7 | Accept cash payment through a numeric input field. |
| FR8 | Reject blank, non-numeric, negative, and insufficient payments with clear messages. |
| FR9 | Compute change: Change = Amount Paid − Total Amount. |
| FR10 | Show a payment confirmation after a successful payment. |
| FR11 | Generate a digital receipt with a transaction reference. |
| FR12 | Start a new transaction that clears all previous data. |

## Required Inputs
- Add to Cart, +, −, and Remove button clicks
- Amount paid (numeric input)
- Confirm Payment and New Transaction button clicks

## Expected Outputs
- Cart table: item, price, quantity, subtotal
- Order summary: items, total quantity, total amount due
- Validation and success messages
- Payment confirmation with change
- Digital receipt: reference number, date/time, items, quantities, unit prices, subtotals, total, amount paid, change

## Products
| Product | Price |
|---------|-------|
| Instant Noodles | ₱18.00 |
| Potato Chips | ₱25.00 |
| Soft Drink (Can) | ₱25.00 |
| Bottled Water | ₱20.00 |
| Ballpen (piece) | ₱12.00 |
| Notebook (piece) | ₱35.00 |

## Formulas
- Subtotal = Unit Price × Quantity
- Total Amount = Sum of all item subtotals
- Change = Amount Paid − Total Amount

## Tools and Technologies
| Tool | Purpose |
|------|---------|
| HTML5 | Page structure |
| CSS3 (Grid, Flexbox, variables) | Layout and styling |
| Vanilla JavaScript | Application logic |
| VS Code | Code editor |
| Google Chrome + DevTools | Running and debugging |
| Git and GitHub | Version control |
| Claude | AI-assisted development |

## Assumptions
- No database or login; products are hard-coded.
- Cart data resets when the page is refreshed.
- Quantity is capped at 99 per item.
- The cart is locked after payment until a New Transaction is started.
- Reference number format: TXN-YYYYMMDD-XXXX.
