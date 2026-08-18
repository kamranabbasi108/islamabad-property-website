/* Property card rendering, filtering, and shared card interactions (fav / whatsapp / share) */

const STATUS_LABELS = { "for-sale": "For Sale", "for-rent": "For Rent", sold: "Sold" };

function detailUrl(id) {
  return `property.html?id=${id}`;
}

function sortActiveFirst(list) {
  return [...list].sort((a, b) => (a.status === "sold" ? 1 : 0) - (b.status === "sold" ? 1 : 0));
}

function getRecentSold(count) {
  return PROPERTIES.filter((p) => p.status === "sold" && p.soldDate)
    .sort((a, b) => new Date(b.soldDate) - new Date(a.soldDate))
    .slice(0, count);
}

function renderPropertyCard(p) {
  const sold = p.status === "sold";
  const soldClass = sold ? "sold-overlay" : "";
  const badgeClass = sold ? "sold" : "";
  const fav = isFavourite(p.id);
  return `
  <div class="card prop-card" data-prop-id="${p.id}">
    <div class="prop-image ${soldClass}">
      <span class="status-badge ${badgeClass}">${STATUS_LABELS[p.status]}</span>
      ${p.verified ? `<span class="verified-badge" title="Verified by Kamran Abbasi">${ICONS.verified} Verified</span>` : ""}
      <img src="${p.images[0]}" alt="${p.title} — ${p.location}" loading="lazy">
      <div class="price-overlay">PKR ${formatPKR(p.price)}${p.rentPeriod ? ` <small>${p.rentPeriod}</small>` : ""}</div>
      <div class="size-overlay">${p.area}</div>
    </div>
    <div class="prop-body">
      <div class="prop-location">${p.location}</div>
      <h3 class="prop-title"><a href="${detailUrl(p.id)}">${p.title}</a></h3>
      <div class="prop-meta">
        ${p.beds ? `<span>${ICONS.bed} ${p.beds} Beds</span>` : ""}
        ${p.baths ? `<span>${ICONS.bath} ${p.baths} Baths</span>` : ""}
        <span>${ICONS.area} ${p.area}</span>
      </div>
      <div class="prop-actions">
        <a class="btn btn-outline btn-sm" href="${detailUrl(p.id)}">View Details</a>
        <div class="icon-btns">
          <button class="icon-circle whatsapp" data-wa-id="${p.id}" title="Share on WhatsApp">${ICONS.whatsapp}</button>
          <button class="icon-circle share" data-share-id="${p.id}" title="Share">${ICONS.share}</button>
          <button class="icon-circle fav ${fav ? "active" : ""}" data-fav-id="${p.id}" title="Save to Favourites">${ICONS.heart}</button>
        </div>
      </div>
    </div>
  </div>`;
}

function renderPropertyGrid(containerId, list) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!list.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">${ICONS.home}<p>No properties found right now. Check back soon, or contact Kamran Abbasi directly.</p></div>`;
    return;
  }
  el.innerHTML = sortActiveFirst(list).map(renderPropertyCard).join("");
}

function renderLoadingState(containerId, label) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><p>${label || "Loading properties…"}</p></div>`;
}

function renderErrorState(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">${ICONS.home}<p>We couldn't load listings right now. Please check your connection and try again, or contact Kamran Abbasi directly.</p></div>`;
}

function propertyUrl(p) {
  return `https://${BUSINESS.domain}/property.html?id=${p.id}`;
}

function propertyShareText(p) {
  return `${p.title}\nPKR ${formatPKR(p.price)} — ${p.location}\n${propertyUrl(p)}`;
}

function wirePropertyCardEvents(root = document) {
  root.addEventListener("click", (e) => {
    const waBtn = e.target.closest("[data-wa-id]");
    const shareBtn = e.target.closest("[data-share-id]");
    const favBtn = e.target.closest("[data-fav-id]");

    if (waBtn) {
      const p = PROPERTIES.find((x) => x.id === waBtn.dataset.waId);
      if (p) window.open(waLink(BUSINESS.whatsappNumbers[0], propertyShareText(p)), "_blank");
    }
    if (shareBtn) {
      const p = PROPERTIES.find((x) => x.id === shareBtn.dataset.shareId);
      if (p) sharePropertyCard(p);
    }
    if (favBtn) {
      const active = toggleFavourite(favBtn.dataset.favId);
      favBtn.classList.toggle("active", active);
      if (window.location.pathname.endsWith("favourites.html")) {
        renderFavouritesPage();
      }
    }
  });
}

function sharePropertyCard(p) {
  const url = propertyUrl(p);
  const text = `${p.title}\nPKR ${formatPKR(p.price)} — ${p.location}`;
  if (navigator.share) {
    navigator.share({ title: p.title, text, url }).catch(() => {});
  } else {
    window.open(waLink(BUSINESS.whatsappNumbers[0], `${text}\n${url}`), "_blank");
  }
}

document.addEventListener("DOMContentLoaded", () => wirePropertyCardEvents());
