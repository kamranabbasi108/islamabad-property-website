/* Renders a single property detail page. Reads id from body[data-id] first, then ?id= query param. */

function getPropertyId() {
  const bodyId = document.body.dataset.id;
  if (bodyId) return bodyId;
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function renderPropertyDetail() {
  const id = getPropertyId();
  const p = PROPERTIES.find((x) => x.id === id);
  const root = document.getElementById("property-detail-root");
  if (!p) {
    root.innerHTML = `<div class="empty-state">${ICONS.home}<p>This listing could not be found. <a href="../properties.html">Browse all properties</a>.</p></div>`;
    return;
  }

  document.title = `${p.title} — PKR ${formatPKR(p.price)} | ${p.location} | Homes PK Marketing`;

  const fav = isFavourite(p.id);
  const soldClass = p.status === "sold" ? "sold" : "";

  root.innerHTML = `
    <div class="breadcrumb"><a href="../index.html">Home</a> / <a href="../properties.html">Properties</a> / ${p.title}</div>

    <div class="gallery-main">
      <img id="galleryMain" src="${p.images[0]}" alt="${p.title}">
    </div>
    <div class="gallery-thumbs">
      ${p.images.map((img, i) => `<img src="${img}" class="${i === 0 ? "active" : ""}" data-thumb="${img}" alt="View ${i + 1}">`).join("")}
    </div>

    <div class="detail-header">
      <div>
        <div class="detail-badges">
          <span class="status-badge ${soldClass}" style="position:static;">${STATUS_LABELS[p.status]}</span>
          ${p.verified ? `<span class="verified-badge" style="position:static;">${ICONS.verified} Verified by Kamran Abbasi</span>` : ""}
        </div>
        <h1>${p.title}</h1>
        <p class="prop-location">${ICONS.pin} ${p.location}</p>
      </div>
      <div style="text-align:right;">
        <div class="detail-price">PKR ${formatPKR(p.price)}${p.rentPeriod ? ` <span style="font-size:1rem; color:var(--muted);">${p.rentPeriod}</span>` : ""}</div>
        <button class="icon-circle fav ${fav ? "active" : ""}" data-fav-id="${p.id}" style="margin-top:10px;" title="Save to Favourites">${ICONS.heart}</button>
        <button class="icon-circle share" data-share-id="${p.id}" style="margin-top:10px;" title="Share">${ICONS.share}</button>
      </div>
    </div>

    <div class="two-col" style="margin-top:30px;">
      <div>
        <h2>Description</h2>
        <p style="color:var(--text);">${p.description}</p>

        <h2 style="margin-top:30px;">Features &amp; Amenities</h2>
        <ul class="features-list">
          ${p.features.map((f) => `<li>${ICONS.check} ${f}</li>`).join("")}
        </ul>

        ${p.videoUrl ? `<h2 style="margin-top:30px;">Video Tour</h2><div class="video-wrap"><iframe src="${p.videoUrl}" title="Property video tour" allowfullscreen></iframe></div>` : ""}

        <h2 style="margin-top:30px;">Location</h2>
        <div class="map-embed">
          <iframe loading="lazy" src="https://www.google.com/maps?q=${encodeURIComponent(p.location + ", Islamabad")}&output=embed" allowfullscreen></iframe>
        </div>
      </div>

      <div>
        <table class="detail-table">
          <tr><td>Type</td><td>${p.type}</td></tr>
          <tr><td>Purpose</td><td>${p.purpose}</td></tr>
          ${p.beds ? `<tr><td>Bedrooms</td><td>${p.beds}</td></tr>` : ""}
          ${p.baths ? `<tr><td>Bathrooms</td><td>${p.baths}</td></tr>` : ""}
          <tr><td>Area</td><td>${p.area}</td></tr>
          <tr><td>Status</td><td>${STATUS_LABELS[p.status]}</td></tr>
        </table>

        <div class="contact-card" style="margin-bottom:24px;">
          <div class="agent-row">
            <div class="agent-avatar">KA</div>
            <div>
              <strong>${BUSINESS.agent}</strong>
              <div style="font-size:0.82rem; color:var(--muted);">${BUSINESS.name}</div>
            </div>
          </div>
          <a class="btn btn-primary" href="tel:${BUSINESS.phones[0].replace(/-/g, "")}">${ICONS.phone} Call Now</a>
          <a class="btn btn-whatsapp" href="${waLink(BUSINESS.whatsappNumbers[0], propertyShareText(p))}" target="_blank" rel="noopener">${ICONS.whatsapp} WhatsApp ${BUSINESS.phones[0]}</a>
          <a class="btn btn-outline" href="${waLink(BUSINESS.whatsappNumbers[1], propertyShareText(p))}" target="_blank" rel="noopener">${ICONS.whatsapp} WhatsApp ${BUSINESS.phones[1]}</a>
          <button class="btn btn-outline" data-share-id="${p.id}">${ICONS.share} Share Listing</button>
        </div>

        <div class="calc-box">
          <h3>${ICONS.calculator} Installment Calculator</h3>
          <div class="calc-grid" style="margin-top:16px;">
            <div class="form-field" style="margin-bottom:0;">
              <label for="calcPrice">Property Price (PKR)</label>
              <input type="number" id="calcPrice" value="${p.price}">
            </div>
            <div class="form-field" style="margin-bottom:0;">
              <label for="calcDown">Down Payment (%)</label>
              <input type="number" id="calcDown" value="20" min="0" max="100">
            </div>
            <div class="form-field" style="margin-bottom:0;">
              <label for="calcYears">Loan Duration (years)</label>
              <input type="number" id="calcYears" value="10" min="1" max="30">
            </div>
            <div class="form-field" style="margin-bottom:0;">
              <label for="calcRate">Est. Annual Profit Rate (%)</label>
              <input type="number" id="calcRate" value="12" min="0" max="30">
            </div>
          </div>
          <div class="calc-result">
            <div style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.06em; color:var(--muted);">Estimated Monthly Installment</div>
            <div class="amount" id="calcResult">PKR 0</div>
          </div>
          <p class="calc-note">This is an estimate only. Contact Kamran Abbasi for exact financing options.</p>
        </div>
      </div>
    </div>

    <div class="sticky-call-bar enabled">
      <a class="btn btn-primary btn-block" href="tel:${BUSINESS.phones[0].replace(/-/g, "")}">${ICONS.phone} Call Now</a>
      <a class="btn btn-whatsapp btn-block" href="${waLink(BUSINESS.whatsappNumbers[0], propertyShareText(p))}" target="_blank" rel="noopener">${ICONS.whatsapp} WhatsApp</a>
    </div>
  `;
  document.body.classList.add("has-sticky-call");

  document.querySelectorAll("[data-thumb]").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      document.getElementById("galleryMain").src = thumb.dataset.thumb;
      document.querySelectorAll("[data-thumb]").forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  const priceEl = document.getElementById("calcPrice");
  const downEl = document.getElementById("calcDown");
  const yearsEl = document.getElementById("calcYears");
  const rateEl = document.getElementById("calcRate");
  const resultEl = document.getElementById("calcResult");

  function calc() {
    const price = parseFloat(priceEl.value) || 0;
    const downPct = parseFloat(downEl.value) || 0;
    const years = parseFloat(yearsEl.value) || 1;
    const rate = parseFloat(rateEl.value) || 0;
    const principal = price * (1 - downPct / 100);
    const monthlyRate = rate / 100 / 12;
    const n = years * 12;
    let monthly;
    if (monthlyRate === 0) {
      monthly = principal / n;
    } else {
      monthly = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    }
    resultEl.textContent = `PKR ${Math.round(monthly).toLocaleString("en-PK")}`;
  }
  [priceEl, downEl, yearsEl, rateEl].forEach((el) => el.addEventListener("input", calc));
  calc();
}

document.addEventListener("DOMContentLoaded", renderPropertyDetail);
