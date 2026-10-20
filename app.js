// Guesty (demo reskin). Synthetic data, fake auth: any email/password signs in.
// Add ?mfa=1 to the login URL to get the SMS step (any 6 digits pass). Off by default so Deck's
// unattended runs never stop at a code prompt.
// Hooks Deck's routines rely on — keep them: #email/#password on index.html, #account-name
// (visible) on dashboard.html, api/data.json.
(function () {
  const P = window.PMS;
  try {
    if (!document.querySelector(".synthetic")) {
      const b = document.createElement("div");
      b.className = "synthetic";
      b.innerHTML = '<span class="dot"></span>Synthetic demo environment — fictional data, not a live Guesty account';
      document.body.appendChild(b);
    }
  } catch (_) {}
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

  const svg = (d, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
  const I = {
    house: '<path d="M4 10.5 12 4l8 6.5V20H4z"/><path d="M4 20h16"/>',
    home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',
    inbox: '<path d="M4 5h16v14H4z"/><path d="M4 13h4l2 3h4l2-3h4"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="1.5"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    bell2: '<path d="M5 18h14M7 18v-6a5 5 0 0 1 10 0v6"/><path d="M10 21h4"/>',
    building: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.5 2.5-2.5-.5-.5-2.5z"/>',
    store: '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9v11h16V9"/><path d="M4 9h16"/>',
    wallet: '<rect x="3" y="6" width="18" height="13" rx="1.5"/><path d="M16 12.5h2"/><path d="M3 9h18"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 10h18"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6"/>',
    grid: '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><path d="M16.5 13v7M13 16.5h7"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    plus: '<circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/>',
    help: '<circle cx="12" cy="12" r="8"/><path d="M9.8 9.5a2.3 2.3 0 1 1 3.2 2.1c-.7.3-1 .8-1 1.4V14"/><path d="M12 17h.01"/>',
    burger: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',
    sms: '<path d="M5 5h14v11H9l-4 3z"/><path d="M8.5 9h7M8.5 12h5"/>',
  };
  const wordmark = `<span class="wordmark">${svg(I.house)}Guesty</span>`;
  const initials = (P.users[0]?.name || P.account.company_name).split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  function shell(crumbs) {
    const nav = [
      ["Homepage", I.home, "dashboard.html", ["dashboard"]],
      ["Inbox", I.inbox, null, [], '<span class="badge">99+</span>'],
      ["Multi calendar", I.cal, `calendar.html?listing=${P.listings[0].source_listing_id}`, ["calendar"]],
      ["Agents hub", I.spark, null, [], "", "ai"],
      ["Reservations", I.bell2, "reservations.html", ["reservations"]],
      ["Properties", I.building, "listings.html", ["listings", "listing"]],
      ["Operations", I.wrench, null, []],
      ["Marketing and sales", I.store, null, []],
      ["Owners", I.users, "owners.html", ["owners"]],
      ["Financials", I.wallet, null, []],
      ["Guest payments", I.card, null, []],
      ["Accounting", I.book, null, []],
      ["Integrations", I.grid, null, []],
      ["Account", I.user, "account.html", ["account"]],
    ];
    document.body.insertAdjacentHTML("afterbegin", `<header class="topbar">${svg(I.burger, 'class="burger"')}${wordmark}
      <div class="search">${svg(I.search, 'width="18" height="18"')}Type <kbd>/</kbd> to search</div>
      <div class="tools">${svg(I.spark)}${svg(I.bookmark)}${svg(I.plus)}<span class="bell">${svg(I.bell2)}<b>38</b></span>${svg(I.help)}
        <div class="acct" id="acct"><span id="account-name">${esc(P.account.company_name)}</span><span class="avatar">${esc(initials)}</span>
          <div class="menu" id="menu"><a href="account.html">Account settings</a><a href="#" id="logout">Log out</a></div></div></div></header>`);
    document.getElementById("app").insertAdjacentHTML("afterbegin", `<aside class="side">${nav.map(([label, icon, href, pages, badge = "", cls = ""]) =>
      `<a href="${href || "#"}" class="${cls} ${pages.includes(page) ? "on" : ""}"${href ? "" : ' data-dead="1"'}>${svg(icon)}${label}${badge}</a>`).join("")}</aside>`);
    document.getElementById("top").outerHTML = `<div class="crumbs">${crumbs.map((c, i) => (i < crumbs.length - 1 ? `<a href="${c[1]}">${esc(c[0])}</a><span class="sep">›</span>` : `<b>${esc(c[0])}</b>`)).join("")}</div>`;
    document.querySelectorAll("[data-dead]").forEach((a) => (a.onclick = (e) => e.preventDefault()));
    document.getElementById("acct").onclick = (e) => { if (e.target.id !== "logout") document.getElementById("menu").classList.toggle("open"); };
    document.getElementById("logout").onclick = (e) => { e.preventDefault(); store.del("hp_session"); location.href = "index.html"; };
  }
  const head = (title, sub = "", actions = "") => `<div class="page-head"><div><h1>${esc(title)}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${actions ? `<div class="actions">${actions}</div>` : ""}</div>`;
  function pager(total, per, cur, base) {
    const pages = Math.max(1, Math.ceil(total / per));
    let h = `<div class="pager" data-total="${total}">`;
    if (cur > 1) h += `<a rel="prev" href="${base}page=${cur - 1}">‹ Prev</a>`;
    h += `<span>Page ${cur} of ${pages}</span>`;
    if (cur < pages) h += `<a rel="next" href="${base}page=${cur + 1}">Next ›</a>`;
    return h + "</div>";
  }
  const listing = (id) => P.listings.find((l) => l.source_listing_id === id);
  const listingOf = (r) => P.listings.find((x) => P.reservations[x.source_listing_id].includes(r));
  const addr = (a) => [a.street, a.city, a.state, a.postal_code, a.country].filter(Boolean).join(", ");
  const tabs = (l, on) => `<div class="tabs-wrap"><div class="tabs">${[["Details", `listing.html?id=${l.source_listing_id}`], ["Reservations", `reservations.html?listing=${l.source_listing_id}`], ["Calendar", `calendar.html?listing=${l.source_listing_id}`]]
    .map(([t, h]) => `<a class="${t === on ? "on" : ""}" href="${h}">${t}</a>`).join("")}</div></div>`;

  if (page === "login") {
    if (qs.get("mfa") === "1") store.set("hp_mfa", "1");
    if (qs.get("mfa") === "0") store.del("hp_mfa");
    const step = qs.get("step") || "email";
    const next = qs.get("next") || "dashboard.html";
    const go = (s) => (location.href = `index.html?step=${s}&next=${encodeURIComponent(next)}`);
    const frame = (inner) => `<div class="auth-page"><div class="auth-top">${wordmark}</div><div class="auth-form"><div class="inner auth">${inner}</div></div><div class="auth-photo"><div></div></div></div>`;
    const google = `<div class="or"><span>OR</span></div><button type="button" class="btn ghost"><svg width="16" height="16" viewBox="0 0 48 48"><path fill="#4285F4" d="M45 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2.1 5-4.4 6.6v5.5h7.1c4.2-3.8 6.5-9.5 6.5-16.1z"/><path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.5 46 24 46z"/><path fill="#FBBC05" d="M11.8 28.2c-.4-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.5C3 17.1 2 20.4 2 24s1 6.9 2.5 9.9z"/><path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.2 29.9 2 24 2 15.5 2 8.1 6.9 4.5 14.1l7.3 5.7c1.7-5.2 6.5-9 12.2-9z"/></svg><b style="font-weight:500">Sign in with Google</b></button>
      <div class="links"><a href="#">Forgot password?</a><a href="#">Need help?</a></div>
      <div class="small">New to Guesty? <a href="#">Register a new account</a><br>Guesty for Hosts User? <a href="#">Go to Guesty for Hosts ↗</a></div>`;
    if (step === "email") {
      main.innerHTML = frame(`<h1>Welcome!</h1><p class="lead">Please enter your details to sign in.</p>
        <form id="f"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="username" placeholder="Enter your email" required>
        <button id="continue" class="btn" type="submit">Continue</button></form>${google}`);
      document.getElementById("f").onsubmit = (e) => { e.preventDefault(); store.set("hp_email", document.getElementById("email").value); go("password"); };
    } else if (step === "password") {
      main.innerHTML = frame(`<h1>Welcome!</h1><p class="lead">Please enter your details to sign in.</p>
        <div class="who-row"><span>${esc(store.get("hp_email") || "")}</span><a href="index.html?next=${encodeURIComponent(next)}">Change</a></div>
        <form id="f"><label for="password">Password</label><div class="pw-wrap"><input id="password" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" required>${svg(I.eye, 'class="eye" id="eye"')}</div>
        <label class="check"><input type="checkbox">Remember me</label>
        <button id="login" class="btn" type="submit">Continue</button></form>${google}`);
      document.getElementById("eye").onclick = () => { const p = document.getElementById("password"); p.type = p.type === "password" ? "text" : "password"; };
      document.getElementById("f").onsubmit = (e) => {
        e.preventDefault();
        if (store.get("hp_mfa")) return go("sms");
        document.querySelector(".auth").innerHTML = '<p class="signing"><span class="spin"></span>Signing you in…</p>';
        setTimeout(() => { store.set("hp_session", "1"); location.href = next; }, 900);
      };
    } else if (step === "sms") {
      const last4 = (P.account.phone || "").replace(/\D/g, "").slice(-4);
      main.innerHTML = frame(`<div class="sms-icon">${svg(I.sms, 'width="26" height="26"')}</div><h1 style="font-size:24px;margin:0">SMS authentication</h1><p class="phone">+1 XXX-XXX-${last4}</p>
        <form id="f"><label>Enter the code you received</label><div class="codes">${[0, 1, 2, 3, 4, 5].map((i) => `<input type="text" inputmode="numeric" maxlength="1" id="code-${i}" aria-label="Digit ${i + 1}">`).join("")}</div>
        <div class="resend">Didn't receive the code? <a href="#" id="resend" class="wait">Resend in 30s</a></div>
        <label class="check"><input type="checkbox">Do not challenge me on this device again</label>
        <p class="err" id="err" hidden></p><button id="verify" class="btn" type="submit">Verify code</button></form>
        <a class="back" href="index.html?next=${encodeURIComponent(next)}">Back to sign in</a>`);
      const boxes = [...document.querySelectorAll(".codes input")];
      boxes[0].focus();
      boxes.forEach((b, i) => {
        b.oninput = () => { b.value = b.value.replace(/\D/g, "").slice(-1); if (b.value && boxes[i + 1]) boxes[i + 1].focus(); };
        b.onkeydown = (e) => { if (e.key === "Backspace" && !b.value && boxes[i - 1]) boxes[i - 1].focus(); };
        b.onpaste = (e) => { e.preventDefault(); const d = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6); d.split("").forEach((c, j) => boxes[j] && (boxes[j].value = c)); (boxes[d.length] || boxes[5]).focus(); };
      });
      let left = 30; const rs = document.getElementById("resend");
      const tick = setInterval(() => { left--; if (left <= 0) { clearInterval(tick); rs.textContent = "Resend code"; rs.classList.remove("wait"); } else rs.textContent = `Resend in ${left}s`; }, 1000);
      rs.onclick = (e) => e.preventDefault();
      document.getElementById("f").onsubmit = (e) => {
        e.preventDefault();
        const code = boxes.map((b) => b.value).join(""), err = document.getElementById("err");
        if (!/^\d{6}$/.test(code)) { err.textContent = "Enter the 6-digit code."; err.hidden = false; return; }
        const btn = document.getElementById("verify"); btn.disabled = true; btn.textContent = "Verifying…";
        setTimeout(() => { store.set("hp_session", "1"); location.href = next; }, 900);
      };
    }
    return;
  }

  if (page === "dashboard") {
    shell([["Homepage"]]);
    const all = Object.values(P.reservations).flat();
    const confirmed = all.filter((r) => r.status === "confirmed");
    const up = confirmed.slice().sort((a, b) => a.arrival_date.localeCompare(b.arrival_date)).slice(0, 8);
    const first = (P.users[0]?.name || "").split(" ")[0];
    main.innerHTML = head(`Good morning${first ? ", " + first : ""}`, `Here's what's happening across ${esc(P.account.company_name)}.`) +
      `<div class="grid"><div class="panel stat"><b>${P.listings.length}</b><span>Listings</span></div><div class="panel stat"><b>${confirmed.length}</b><span>Upcoming reservations</span></div><div class="panel stat"><b>${P.owners.length}</b><span>Owners</span></div></div>
      <div class="panel"><h2>Next arrivals</h2><table><thead><tr><th>Arrival</th><th>Guest</th><th>Listing</th><th>Channel</th></tr></thead><tbody>
      ${up.map((r) => `<tr><td>${r.arrival_date}</td><td>${esc(r.guest.first_name + " " + r.guest.last_name)}</td><td>${esc(listingOf(r).name)}</td><td>${r.channel}</td></tr>`).join("")}</tbody></table></div>`;
  }

  if (page === "account") {
    shell([["Account"]]);
    const a = P.account;
    main.innerHTML = head("Account", "Company profile and users") + `<div class="panel"><h2>Company profile</h2><div class="body"><dl class="kv" id="profile">
      <dt>Account ID</dt><dd data-field="source_account_id">${a.source_account_id}</dd><dt>Company name</dt><dd data-field="company_name">${esc(a.company_name)}</dd>
      <dt>Email</dt><dd data-field="email">${a.email}</dd><dt>Phone</dt><dd data-field="phone">${a.phone}</dd><dt>Address</dt><dd data-field="address">${esc(addr(a.address))}</dd>
      <dt>Plan</dt><dd data-field="plan">${esc(a.plan)}</dd><dt>Currency</dt><dd data-field="currency">${a.currency}</dd><dt>Timezone</dt><dd data-field="timezone">${a.timezone}</dd></dl></div></div>
      <div class="panel"><h2>Users</h2><table id="users"><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>
      ${P.users.map((u) => `<tr><td>${esc(u.name)}</td><td>${u.email}</td><td>${esc(u.role)}</td></tr>`).join("")}</tbody></table></div>`;
  }

  if (page === "listings") {
    shell([["Properties", "listings.html"], ["Listings"]]);
    const per = 10, cur = Math.max(1, parseInt(qs.get("page") || "1", 10));
    const rows = P.listings.slice((cur - 1) * per, cur * per);
    const n = (s) => P.listings.filter((l) => l.status === s).length;
    main.innerHTML = head("Listings", "All the properties in your Guesty account.", '<a href="#">••• More</a><a class="pbtn" href="#">+ New listing</a>') +
      `<div class="panel"><div class="toolbar"><span class="chip">${P.listings.length} Listings</span><span class="fake-input">${svg(I.search, 'width="16" height="16"')}Search by listings name...</span></div>
      <div class="tabs"><a class="on" href="listings.html">All (${P.listings.length})</a><a href="#">Active (${n("active")})</a><a href="#">Inactive (${n("inactive")})</a></div>
      <div class="scroll"><table id="listings"><thead><tr><th>Listing title</th><th>Listing's nickname</th><th>Listing ID</th><th>City</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      ${rows.map((l) => `<tr data-listing-id="${l.source_listing_id}"><td><a href="listing.html?id=${l.source_listing_id}">${esc(l.name)}</a></td><td>${esc(l.internal_name)}</td><td class="mono">${l.source_listing_id}</td><td>${esc(l.address.city)}</td><td><span class="pill ${l.status}">${l.status === "active" ? "Active" : "Inactive"}</span></td><td><a href="reservations.html?listing=${l.source_listing_id}">Reservations</a> · <a href="calendar.html?listing=${l.source_listing_id}">Calendar</a></td></tr>`).join("")}
      </tbody></table></div>${pager(P.listings.length, per, cur, "listings.html?")}</div>`;
  }

  if (page === "listing") {
    const l = listing(qs.get("id"));
    shell([["Properties", "listings.html"], ["Listings", "listings.html"], [l ? l.internal_name : "Not found"]]);
    if (!l) { main.innerHTML = '<div class="panel"><div class="body">This listing does not exist.</div></div>'; return; }
    const o = P.owners.find((x) => x.source_owner_id === l.source_owner_id);
    const row = (k, label, v) => `<dt>${label}</dt><dd data-field="${k}">${v ?? ""}</dd>`;
    main.innerHTML = head(l.name, esc(addr(l.address))) + tabs(l, "Details") +
      `<div class="grid2"><div class="panel"><h2>Overview</h2><div class="body"><dl class="kv">
        ${row("source_listing_id", "Listing ID", `<span class="mono">${l.source_listing_id}</span>`)}${row("name", "Title", esc(l.name))}${row("internal_name", "Nickname", esc(l.internal_name))}
        ${row("status", "Status", l.status)}${row("property_type", "Property type", l.property_type)}${row("address", "Address", esc(addr(l.address)))}
        ${row("coordinates", "Coordinates", l.address.latitude + ", " + l.address.longitude)}${row("bedrooms", "Bedrooms", l.bedrooms)}${row("beds", "Beds", l.beds)}
        ${row("bathrooms", "Bathrooms", l.bathrooms)}${row("max_guests", "Max guests", l.max_guests)}${row("area_sqm", "Area (m²)", l.area_sqm)}
        ${row("owner", "Owner", o ? `${esc(o.name)} <span class="mono">(${o.source_owner_id})</span>` : "")}</dl></div></div>
      <div class="panel"><h2>Terms & pricing</h2><div class="body"><dl class="kv">
        ${row("check_in_time", "Check-in", l.check_in_time)}${row("check_out_time", "Check-out", l.check_out_time)}${row("min_nights", "Min nights", l.min_nights)}${row("max_nights", "Max nights", l.max_nights)}
        ${row("currency", "Currency", l.currency)}${row("base_price", "Base price / night", money(l.base_price))}${row("weekend_price", "Weekend price / night", money(l.weekend_price))}
        ${row("cleaning_fee", "Cleaning fee", money(l.cleaning_fee))}${row("security_deposit", "Security deposit", money(l.security_deposit))}
        ${row("extra_guest_fee", "Extra guest fee", money(l.extra_guest_fee) + " / night after " + l.extra_guest_after + " guests")}</dl></div></div></div>
      <div class="panel"><h2>Description</h2><div class="body"><p data-field="description">${esc(l.description)}</p><h3>House rules</h3><p data-field="house_rules">${esc(l.house_rules)}</p>
        <h3>Amenities</h3><ul class="chips" id="amenities">${l.amenities.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
        <h3>Photos</h3><div class="photos" id="photos">${l.photos.map((p) => `<a href="${p}"><img src="${p}" alt="${esc(l.name)} photo"></a>`).join("")}</div></div></div>
      <div class="panel"><h2>Channels</h2><table id="channels"><thead><tr><th>Channel</th><th>Channel listing ID</th><th>Status</th></tr></thead><tbody>
        ${l.channels.map((c) => `<tr><td>${c.channel}</td><td class="mono">${c.channel_listing_id}</td><td>${c.status}</td></tr>`).join("")}</tbody></table></div>`;
  }

  if (page === "reservations") {
    const l = listing(qs.get("listing"));
    shell(l ? [["Properties", "listings.html"], [l.internal_name, `listing.html?id=${l.source_listing_id}`], ["Reservations"]] : [["Reservations"]]);
    const from = qs.get("from") || "", to = qs.get("to") || "";
    let rs = (l ? P.reservations[l.source_listing_id] : Object.values(P.reservations).flat()).slice().sort((a, b) => b.arrival_date.localeCompare(a.arrival_date));
    if (from) rs = rs.filter((r) => r.departure_date > from);
    if (to) rs = rs.filter((r) => r.arrival_date <= to);
    const per = 20, cur = Math.max(1, parseInt(qs.get("page") || "1", 10));
    const base = `reservations.html?${l ? "listing=" + l.source_listing_id + "&" : ""}${from ? "from=" + from + "&" : ""}${to ? "to=" + to + "&" : ""}`;
    main.innerHTML = head(l ? l.name : "Reservations", l ? "Reservations for this listing" : "All reservations across your listings") + (l ? tabs(l, "Reservations") : "") +
      `<div class="panel"><form class="filters" method="get">${l ? `<input type="hidden" name="listing" value="${l.source_listing_id}">` : ""}<label>From <input type="date" name="from" value="${from}"></label><label>To <input type="date" name="to" value="${to}"></label><button type="submit">Filter</button></form>
      <p class="count" id="count">${rs.length} reservations</p><div class="scroll"><table id="reservations"><thead><tr>
      <th>Reservation ID</th><th>Status</th>${l ? "" : "<th>Listing</th>"}<th>Channel</th><th>Confirmation</th><th>Booked</th><th>Arrival</th><th>Departure</th><th>Nights</th><th>Adults</th><th>Children</th><th>Infants</th><th>Pets</th>
      <th>Guest</th><th>Guest email</th><th>Guest phone</th><th>Lang</th><th>Accommodation</th><th>Cleaning</th><th>Taxes</th><th>Channel fee</th><th>Total</th><th>Paid</th><th>Balance</th><th>Payout</th><th>Notes</th></tr></thead><tbody>
      ${rs.slice((cur - 1) * per, cur * per).map((r) => `<tr data-reservation-id="${r.source_reservation_id}" data-guest-id="${r.guest.source_guest_id}"><td class="mono">${r.source_reservation_id}</td><td><span class="pill ${r.status}">${r.status}</span></td>${l ? "" : `<td>${esc(listingOf(r).internal_name)}</td>`}<td>${r.channel}</td><td class="mono">${r.channel_confirmation_code}</td><td>${r.booked_at.slice(0, 10)}</td><td>${r.arrival_date}</td><td>${r.departure_date}</td><td>${r.nights}</td><td>${r.adults}</td><td>${r.children}</td><td>${r.infants}</td><td>${r.pets}</td>
        <td>${esc(r.guest.first_name + " " + r.guest.last_name)}</td><td>${r.guest.email}</td><td>${r.guest.phone}</td><td>${r.guest.language}</td><td>${money(r.accommodation_total)}</td><td>${money(r.cleaning_fee)}</td><td>${money(r.taxes)}</td><td>${money(r.channel_fee)}</td><td>${money(r.total_price)}</td><td>${money(r.paid_amount)}</td><td>${money(r.balance_due)}</td><td>${money(r.payout)}</td><td>${esc(r.notes)}</td></tr>`).join("")}
      </tbody></table></div>${pager(rs.length, per, cur, base)}</div>`;
  }

  if (page === "calendar") {
    const l = listing(qs.get("listing"));
    shell(l ? [["Multi calendar", `calendar.html?listing=${P.listings[0].source_listing_id}`], [l.internal_name]] : [["Multi calendar"]]);
    if (!l) { main.innerHTML = '<div class="panel"><div class="body">Choose a listing from <a href="listings.html">Properties</a>.</div></div>'; return; }
    const days = P.calendars[l.source_listing_id];
    const months = [...new Set(days.map((d) => d.date.slice(0, 7)))];
    const m = months.includes(qs.get("month")) ? qs.get("month") : months[0];
    const i = months.indexOf(m);
    const nav = `<div class="pager">${i > 0 ? `<a rel="prev" href="calendar.html?listing=${l.source_listing_id}&month=${months[i - 1]}">‹ ${months[i - 1]}</a>` : ""} <b id="month">${m}</b> ${i < months.length - 1 ? `<a rel="next" href="calendar.html?listing=${l.source_listing_id}&month=${months[i + 1]}">${months[i + 1]} ›</a>` : ""}</div>`;
    main.innerHTML = head(l.name, `Currency: <span id="currency">${l.currency}</span> · Calendar available ${months[0]} to ${months[months.length - 1]}`) + tabs(l, "Calendar") +
      `<div class="panel">${nav}<table id="calendar"><thead><tr><th>Date</th><th>Price</th><th>Min nights</th><th>Available</th><th>Blocked by</th><th>Reservation</th></tr></thead><tbody>
      ${days.filter((d) => d.date.startsWith(m)).map((d) => `<tr class="${d.available ? "" : "blocked"}"><td>${d.date}</td><td>${money(d.price)}</td><td>${d.min_nights}</td><td>${d.available ? "Yes" : "No"}</td><td>${d.block_reason}</td><td class="mono">${d.source_reservation_id}</td></tr>`).join("")}
      </tbody></table>${nav}</div>`;
  }

  if (page === "owners") {
    shell([["Owners"]]);
    main.innerHTML = head("Owners", "Property owners, commissions and payouts", '<a class="pbtn" href="#">+ New owner</a>') +
      `<div class="panel"><p class="count">${P.owners.length} owners</p><div class="scroll"><table id="owners"><thead><tr><th>Owner ID</th><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th>Address</th><th>Listings</th><th>Commission</th><th>Payout</th></tr></thead><tbody>
      ${P.owners.map((o) => `<tr data-owner-id="${o.source_owner_id}"><td class="mono">${o.source_owner_id}</td><td>${esc(o.name)}</td><td>${esc(o.company)}</td><td>${o.email}</td><td>${o.phone}</td><td>${esc(addr(o.address))}</td>
        <td>${o.listing_ids.map((id) => `<a class="mono" href="listing.html?id=${id}">${id}</a>`).join("<br>")}</td><td>${o.commission_percent}%</td><td>${o.payout_method}</td></tr>`).join("")}</tbody></table></div></div>`;
  }
})();
