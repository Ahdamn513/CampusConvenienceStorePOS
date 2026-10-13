# AI-Assisted Development Log

**Project:** Campus Convenience Store POS
**AI Tool Used:** Claude

---

## Prompt 1 – Building the Application

**Prompt Used:**

~~~text
(Paste the FULL text of Prompt 1 here)
~~~

**Purpose:**
To give the AI the full exam context, the Scenario 5 product list, the required transaction flow and features, the exact validation messages, a UI reference, and the technical constraints, so it generates a working POS application in plain HTML, CSS, and JavaScript.

**AI Response (summary):**
The AI generated the complete project: index.html with the cart, order summary, payment, product grid, and receipt sections; style.css with a two-column layout based on the UI reference (dark-green quantity pills, product cards that turn green when in the cart); and app.js with the product catalog, cart functions (add, increase, decrease, remove), automatic subtotal and total computation in centavos, payment validation with the exact required messages, change computation, payment confirmation, digital receipt with a TXN reference number, and a New Transaction reset. It also produced REQUIREMENTS.md and README.md.

**Evaluation:**
(Correct / Partially correct / Incorrect, and why. Guiding questions: Did every required feature work when you tested it? Did the totals and change match your own calculation? Were the validation messages exactly as the exam sheet requires? Did anything look wrong or confusing?)

**Modifications Made:**
(What you changed before using it. Guiding questions: Did you change any text, colors, product names, or layout? Did you fix anything that didn't work? If you changed nothing, explain why the output was acceptable as-is.)

---

## Prompt 2 – Debugging and Refactoring

**Prompt Used:**

~~~text
inspect the system, find block of codes tha can be refactored and tell me

start refactoring
~~~

**Purpose:**
To have the AI review the working application for repeated or hard-to-maintain code, explain what could be improved, and then clean up that code without changing how the POS behaves.

**AI Response (summary):**
The AI first reviewed app.js, style.css, and index.html and listed refactoring candidates ranked by value: the same cart-to-product lookup repeated in the cart, summary, and receipt; the same "locked after payment" check and screen refresh repeated in every cart action; the maximum-quantity check written twice; repeated label/value rows in the confirmation and receipt; and product photos defined separately in the CSS. It also pointed out that the images folder was missing from the project. It then applied the main changes: a `getCartLines()` helper shared by the cart, summary, total, and receipt; an `updateCart()` wrapper for the cart actions; an `incrementItem()` helper for the maximum-quantity check; a `detailRow()` helper for the confirmation and receipt rows; product photo paths moved into the `PRODUCTS` list; and a duplicate `.peso-input` CSS rule merged. To confirm nothing broke, it ran the old and new code through the same scripted session (adding, changing quantities, removing, the 99-item limit, every payment error, a successful payment, and Next Order) and showed that both produced identical results.

**Evaluation:**
(To be filled in after Prompt 2)

**Modifications Made:**
(To be filled in after Prompt 2)
