// Harborly PMS (demo). Fictional data, fake auth: any email/password signs in.
(function () {
  const P = window.PMS;
  const qs = new URLSearchParams(location.search);
  const page = document.body.dataset.page;
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (_) {} },
    del(k) { try { sessionStorage.removeItem(k); } catch (_) {} },
  };
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const money = (n) => (n === undefined || n === null || n === "" ? "" : "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const main = document.getElementById("main");

  if (page !== "login" && !store.get("hp_session")) { location.replace("index.html?next=" + encodeURIComponent(location.pathname.split("/").pop() + location.search)); return; }

  function shell(title) {
    document.getElementById("app").insertAdjacentHTML("afterbegin", `
      <aside class="side"><div class="brand"><img src="logo.svg" alt="Harborly" class="logo">Harborly<span>PMS</span></div>
        <nav>
          <a href="dashboard.html" class="${page === "dashboard" ? "on" : ""}">Dashboard</a>
          <a href="listings.html" class="${["listings", "listing", "reservations", "calendar"].includes(page) ? "on" : ""}">Listings</a>
          <a href="owners.html" class="${page === "owners" ? "on" : ""}">Owners</a>
          <a href="account.html" class="${page === "account" ? "on" : ""}">Account</a>
        </nav></aside>`);
    document.getElementById("top").innerHTML = `<h1>${esc(title)}</h1><div class="who"><span id="account-name">${esc(P.account.company_name)}</span> · <a href="#" id="logout">Log out</a></div>`;
    document.getElementById("logout").onclick = (e) => { e.preventDefault(); store.del("hp_session"); location.href = "index.html"; };
  }
  function pager(total, per, cur, base) {
    const pages = Math.max(1, Math.ceil(total / per));
    let h = `<div class="pager" data-total="${total}">Page ${cur} of ${pages} `;
    if (cur > 1) h += `<a rel="prev" href="${base}page=${cur - 1}">‹ Prev</a> `;
    if (cur < pages) h += `<a rel="next" href="${base}page=${cur + 1}">Next ›</a>`;
    return h + "</div>";
  }
  const listing = (id) => P.listings.find((l) => l.source_listing_id === id);
  const addr = (a) => [a.street, a.city, a.state, a.postal_code, a.country].filter(Boolean).join(", ");

  if (page === "login") {
    const step = qs.get("step") || "email";
    const next = qs.get("next") || "dashboard.html";
    if (step === "email") {
      main.innerHTML = `<div class="auth card"><div class="brand big"><img src="logo.svg" alt="Harborly" class="logo">Harborly<span>PMS</span></div><h1>Log in</h1>
        <form id="f"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="username" required>
        <button id="continue" type="submit">Continue</button></form><p class="note">Demo portal with fictional data. Any email and password work.</p></div>`;
      document.getElementById("f").onsubmit = (e) => { e.preventDefault(); store.set("hp_email", document.getElementById("email").value); location.href = "index.html?step=password&next=" + encodeURIComponent(next); };
    } else {
      main.innerHTML = `<div class="auth card"><div class="brand big"><img src="logo.svg" alt="Harborly" class="logo">Harborly<span>PMS</span></div><h1>Enter your password</h1>
        <p class="muted">${esc(store.get("hp_email") || "")}</p>
        <form id="f"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required>
        <button id="login" type="submit">Log in</button></form><p><a href="index.html">Use another account</a></p></div>`;
      document.getElementById("f").onsubmit = (e) => { e.preventDefault(); main.innerHTML = '<div class="auth card"><p>Signing you in…</p></div>'; setTimeout(() => { store.set("hp_session", "1"); location.href = next; }, 900); };
    }
    return;
  }

  if (page === "dashboard") {
    shell("Dashboard");
    const all = Object.values(P.reservations).flat();
    const up = all.filter((r) => r.status === "confirmed").sort((a, b) => a.arrival_date.localeCompare(b.arrival_date)).slice(0, 8);
    main.innerHTML = `<div class="grid"><div class="card stat"><b>${P.listings.length}</b>Listings</div><div class="card stat"><b>${up.length ? all.filter((r) => r.status === "confirmed").length : 0}</b>Upcoming reservations</div><div class="card stat"><b>${P.owners.length}</b>Owners</div></div>
      <div class="card"><h2>Next arrivals</h2><table><thead><tr><th>Arrival</th><th>Guest</th><th>Listing</th><th>Channel</th></tr></thead><tbody>
      ${up.map((r) => { const l = P.listings.find((x) => P.reservations[x.source_listing_id].includes(r)); return `<tr><td>${r.arrival_date}</td><td>${esc(r.guest.first_name + " " + r.guest.last_name)}</td><td>${esc(l.name)}</td><td>${r.channel}</td></tr>`; }).join("")}</tbody></table></div>`;
  }

  if (page === "account") {
    shell("Account");
    const a = P.account;
    main.innerHTML = `<div class="card"><h2>Company profile</h2><dl class="kv" id="profile">
      <dt>Account ID</dt><dd data-field="source_account_id">${a.source_account_id}</dd><dt>Company name</dt><dd data-field="company_name">${esc(a.company_name)}</dd>
      <dt>Email</dt><dd data-field="email">${a.email}</dd><dt>Phone</dt><dd data-field="phone">${a.phone}</dd><dt>Address</dt><dd data-field="address">${esc(addr(a.address))}</dd>
      <dt>Plan</dt><dd data-field="plan">${esc(a.plan)}</dd><dt>Currency</dt><dd data-field="currency">${a.currency}</dd><dt>Timezone</dt><dd data-field="timezone">${a.timezone}</dd></dl></div>
      <div class="card"><h2>Users</h2><table id="users"><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>
      ${P.users.map((u) => `<tr><td>${esc(u.name)}</td><td>${u.email}</td><td>${esc(u.role)}</td></tr>`).join("")}</tbody></table></div>`;
  }

  if (page === "listings") {
    shell("Listings");
    const per = 10, cur = Math.max(1, parseInt(qs.get("page") || "1", 10));
    const rows = P.listings.slice((cur - 1) * per, cur * per);
    main.innerHTML = `<div class="card"><p class="muted">${P.listings.length} listings</p><table id="listings"><thead><tr><th>Listing</th><th>Nickname</th><th>ID</th><th>City</th><th>Status</th><th></th></tr></thead><tbody>
      ${rows.map((l) => `<tr data-listing-id="${l.source_listing_id}"><td><a href="listing.html?id=${l.source_listing_id}">${esc(l.name)}</a></td><td>${esc(l.internal_name)}</td><td class="mono">${l.source_listing_id}</td><td>${esc(l.address.city)}</td><td><span class="pill ${l.status}">${l.status}</span></td><td><a href="reservations.html?listing=${l.source_listing_id}">Reservations</a> · <a href="calendar.html?listing=${l.source_listing_id}">Calendar</a></td></tr>`).join("")}
      </tbody></table>${pager(P.listings.length, per, cur, "listings.html?")}</div>`;
  }

  if (page === "listing") {
    const l = listing(qs.get("id"));
    shell(l ? l.name : "Listing not found");
    if (!l) { main.innerHTML = '<div class="card">This listing does not exist.</div>'; return; }
    const o = P.owners.find((x) => x.source_owner_id === l.source_owner_id);
    const row = (k, label, v) => `<dt>${label}</dt><dd data-field="${k}">${v ?? ""}</dd>`;
    main.innerHTML = `<div class="tabs"><a class="on" href="listing.html?id=${l.source_listing_id}">Details</a><a href="reservations.html?listing=${l.source_listing_id}">Reservations</a><a href="calendar.html?listing=${l.source_listing_id}">Calendar</a></div>
      <div class="grid2"><div class="card"><h2>Overview</h2><dl class="kv">
        ${row("source_listing_id", "Listing ID", `<span class="mono">${l.source_listing_id}</span>`)}${row("name", "Title", esc(l.name))}${row("internal_name", "Nickname", esc(l.internal_name))}
        ${row("status", "Status", l.status)}${row("property_type", "Property type", l.property_type)}${row("address", "Address", esc(addr(l.address)))}
        ${row("coordinates", "Coordinates", l.address.latitude + ", " + l.address.longitude)}${row("bedrooms", "Bedrooms", l.bedrooms)}${row("beds", "Beds", l.beds)}
        ${row("bathrooms", "Bathrooms", l.bathrooms)}${row("max_guests", "Max guests", l.max_guests)}${row("area_sqm", "Area (m²)", l.area_sqm)}
        ${row("owner", "Owner", o ? `${esc(o.name)} <span class="mono">(${o.source_owner_id})</span>` : "")}</dl></div>
      <div class="card"><h2>Terms & pricing</h2><dl class="kv">
        ${row("check_in_time", "Check-in", l.check_in_time)}${row("check_out_time", "Check-out", l.check_out_time)}${row("min_nights", "Min nights", l.min_nights)}${row("max_nights", "Max nights", l.max_nights)}
        ${row("currency", "Currency", l.currency)}${row("base_price", "Base price / night", money(l.base_price))}${row("weekend_price", "Weekend price / night", money(l.weekend_price))}
        ${row("cleaning_fee", "Cleaning fee", money(l.cleaning_fee))}${row("security_deposit", "Security deposit", money(l.security_deposit))}
        ${row("extra_guest_fee", "Extra guest fee", money(l.extra_guest_fee) + " / night after " + l.extra_guest_after + " guests")}</dl></div></div>
      <div class="card"><h2>Description</h2><p data-field="description">${esc(l.description)}</p><h3>House rules</h3><p data-field="house_rules">${esc(l.house_rules)}</p>
        <h3>Amenities</h3><ul class="chips" id="amenities">${l.amenities.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
        <h3>Photos</h3><div class="photos" id="photos">${l.photos.map((p) => `<a href="${p}"><img src="${p}" alt="${esc(l.name)} photo"></a>`).join("")}</div></div>
      <div class="card"><h2>Channels</h2><table id="channels"><thead><tr><th>Channel</th><th>Channel listing ID</th><th>Status</th></tr></thead><tbody>
        ${l.channels.map((c) => `<tr><td>${c.channel}</td><td class="mono">${c.channel_listing_id}</td><td>${c.status}</td></tr>`).join("")}</tbody></table></div>`;
  }

  if (page === "reservations") {
    const l = listing(qs.get("listing"));
    shell(l ? "Reservations · " + l.name : "Reservations");
    if (!l) { main.innerHTML = '<div class="card">Choose a listing from <a href="listings.html">Listings</a>.</div>'; return; }
    const from = qs.get("from") || "", to = qs.get("to") || "";
    let rs = P.reservations[l.source_listing_id].slice().sort((a, b) => b.arrival_date.localeCompare(a.arrival_date));
    if (from) rs = rs.filter((r) => r.departure_date > from);
    if (to) rs = rs.filter((r) => r.arrival_date <= to);
    const per = 20, cur = Math.max(1, parseInt(qs.get("page") || "1", 10));
    const base = `reservations.html?listing=${l.source_listing_id}${from ? "&from=" + from : ""}${to ? "&to=" + to : ""}&`;
    main.innerHTML = `<div class="tabs"><a href="listing.html?id=${l.source_listing_id}">Details</a><a class="on" href="reservations.html?listing=${l.source_listing_id}">Reservations</a><a href="calendar.html?listing=${l.source_listing_id}">Calendar</a></div>
      <div class="card"><form class="filters" method="get"><input type="hidden" name="listing" value="${l.source_listing_id}"><label>From <input type="date" name="from" value="${from}"></label><label>To <input type="date" name="to" value="${to}"></label><button type="submit">Filter</button></form>
      <p class="muted" id="count">${rs.length} reservations</p><div class="scroll"><table id="reservations"><thead><tr>
      <th>Reservation ID</th><th>Status</th><th>Channel</th><th>Confirmation</th><th>Booked</th><th>Arrival</th><th>Departure</th><th>Nights</th><th>Adults</th><th>Children</th><th>Infants</th><th>Pets</th>
      <th>Guest</th><th>Guest email</th><th>Guest phone</th><th>Lang</th><th>Accommodation</th><th>Cleaning</th><th>Taxes</th><th>Channel fee</th><th>Total</th><th>Paid</th><th>Balance</th><th>Payout</th><th>Notes</th></tr></thead><tbody>
      ${rs.slice((cur - 1) * per, cur * per).map((r) => `<tr data-reservation-id="${r.source_reservation_id}" data-guest-id="${r.guest.source_guest_id}"><td class="mono">${r.source_reservation_id}</td><td><span class="pill ${r.status}">${r.status}</span></td><td>${r.channel}</td><td class="mono">${r.channel_confirmation_code}</td><td>${r.booked_at.slice(0, 10)}</td><td>${r.arrival_date}</td><td>${r.departure_date}</td><td>${r.nights}</td><td>${r.adults}</td><td>${r.children}</td><td>${r.infants}</td><td>${r.pets}</td>
        <td>${esc(r.guest.first_name + " " + r.guest.last_name)}</td><td>${r.guest.email}</td><td>${r.guest.phone}</td><td>${r.guest.language}</td><td>${money(r.accommodation_total)}</td><td>${money(r.cleaning_fee)}</td><td>${money(r.taxes)}</td><td>${money(r.channel_fee)}</td><td>${money(r.total_price)}</td><td>${money(r.paid_amount)}</td><td>${money(r.balance_due)}</td><td>${money(r.payout)}</td><td>${esc(r.notes)}</td></tr>`).join("")}
      </tbody></table></div>${pager(rs.length, per, cur, base)}</div>`;
  }

  if (page === "calendar") {
    const l = listing(qs.get("listing"));
    shell(l ? "Calendar · " + l.name : "Calendar");
    if (!l) { main.innerHTML = '<div class="card">Choose a listing from <a href="listings.html">Listings</a>.</div>'; return; }
    const days = P.calendars[l.source_listing_id];
    const months = [...new Set(days.map((d) => d.date.slice(0, 7)))];
    const m = months.includes(qs.get("month")) ? qs.get("month") : months[0];
    const i = months.indexOf(m);
    const nav = `<div class="pager">${i > 0 ? `<a rel="prev" href="calendar.html?listing=${l.source_listing_id}&month=${months[i - 1]}">‹ ${months[i - 1]}</a>` : ""} <b id="month">${m}</b> ${i < months.length - 1 ? `<a rel="next" href="calendar.html?listing=${l.source_listing_id}&month=${months[i + 1]}">${months[i + 1]} ›</a>` : ""}</div>`;
    main.innerHTML = `<div class="tabs"><a href="listing.html?id=${l.source_listing_id}">Details</a><a href="reservations.html?listing=${l.source_listing_id}">Reservations</a><a class="on" href="calendar.html?listing=${l.source_listing_id}">Calendar</a></div>
      <div class="card"><p class="muted">Currency: <span id="currency">${l.currency}</span> · Calendar available ${months[0]} to ${months[months.length - 1]}</p>${nav}
      <table id="calendar"><thead><tr><th>Date</th><th>Price</th><th>Min nights</th><th>Available</th><th>Blocked by</th><th>Reservation</th></tr></thead><tbody>
      ${days.filter((d) => d.date.startsWith(m)).map((d) => `<tr class="${d.available ? "" : "blocked"}"><td>${d.date}</td><td>${money(d.price)}</td><td>${d.min_nights}</td><td>${d.available ? "Yes" : "No"}</td><td>${d.block_reason}</td><td class="mono">${d.source_reservation_id}</td></tr>`).join("")}
      </tbody></table>${nav}</div>`;
  }

  if (page === "owners") {
    shell("Owners");
    main.innerHTML = `<div class="card"><p class="muted">${P.owners.length} owners</p><table id="owners"><thead><tr><th>Owner ID</th><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th>Address</th><th>Listings</th><th>Commission</th><th>Payout</th></tr></thead><tbody>
      ${P.owners.map((o) => `<tr data-owner-id="${o.source_owner_id}"><td class="mono">${o.source_owner_id}</td><td>${esc(o.name)}</td><td>${esc(o.company)}</td><td>${o.email}</td><td>${o.phone}</td><td>${esc(addr(o.address))}</td>
        <td>${o.listing_ids.map((id) => `<a class="mono" href="listing.html?id=${id}">${id}</a>`).join("<br>")}</td><td>${o.commission_percent}%</td><td>${o.payout_method}</td></tr>`).join("")}</tbody></table></div>`;
  }
})();
