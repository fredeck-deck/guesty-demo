# Harborly PMS (demo)
Fictional vacation-rental PMS portal for Deck agent demos (Guesty-style data model, invented brand, fictional data). Any email/password signs in.
Flow: `index.html` (email → password) → `dashboard.html`; `listings.html?page=N` (10/page) → `listing.html?id=` · `reservations.html?listing=&page=` (20/page, from/to filters) · `calendar.html?listing=&month=YYYY-MM`; `owners.html`; `account.html`.
Raw data: `api/data.json`.

Look follows app.guesty.com (login, SMS step, app shell). `index.html?mfa=1` adds the SMS-code step (any 6 digits); off by default so Deck runs never stop at a code prompt. Deck routines depend on `#email`/`#password` on `index.html`, a visible `#account-name` on `dashboard.html`, and `api/data.json` — keep them.
