/* Homes PK Marketing — shared site chrome: navbar, footer, floating WhatsApp, favourites core */

const FAV_KEY = "hpk_favourites";

function getFavourites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function isFavourite(id) {
  return getFavourites().includes(id);
}

function toggleFavourite(id) {
  let favs = getFavourites();
  if (favs.includes(id)) {
    favs = favs.filter((f) => f !== id);
  } else {
    favs.push(id);
  }
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  updateFavCountBadges();
  return favs.includes(id);
}

function updateFavCountBadges() {
  const count = getFavourites().length;
  document.querySelectorAll(".js-fav-count").forEach((el) => {
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
  });
}

function buildTopbar() {
  return `
  <div class="topbar">
    <div class="container">
      <div class="phones">
        ${BUSINESS.phones
          .map(
            (p) =>
              `<a href="tel:${p.replace(/-/g, "")}">${ICONS.phone} ${p}</a>`
          )
          .join("")}
      </div>
      <span class="tagline">${BUSINESS.tagline}</span>
    </div>
  </div>`;
}

function buildNavbar(active, base) {
  base = base || "";
  const links = [
    { href: "index.html", label: "Home", key: "home" },
    { href: "properties.html", label: "Properties", key: "properties" },
    { href: "new-projects.html", label: "New Projects", key: "projects" },
    { href: "favourites.html", label: "Favourites", key: "favourites" },
    { href: "about.html", label: "About", key: "about" },
    { href: "contact.html", label: "Contact", key: "contact" },
  ];
  return `
  ${buildTopbar()}
  <header class="navbar">
    <div class="container">
      <a href="${base}index.html" class="logo">
        ${ICONS.home}
        <span>Homes PK <span class="accent-italic">Marketing</span></span>
      </a>
      <nav>
        <ul class="nav-links" id="navLinks">
          ${links
            .map(
              (l) =>
                `<li><a href="${base}${l.href}" class="${l.key === active ? "active" : ""}">${l.label}</a></li>`
            )
            .join("")}
        </ul>
      </nav>
      <div class="nav-right">
        <a href="${base}favourites.html" class="icon-link" aria-label="Favourites">
          ${ICONS.heart}
          <span class="badge-count js-fav-count">0</span>
        </a>
        <a href="${base}contact.html" class="btn btn-accent btn-sm">Contact Us</a>
        <button class="nav-toggle" id="navToggle" aria-label="Menu">${ICONS.menu}</button>
      </div>
    </div>
  </header>`;
}

function buildFooter(base) {
  base = base || "";
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-logo">${ICONS.home}<span>Homes PK Marketing</span></div>
          <p style="max-width:280px; font-size:0.88rem;">${BUSINESS.tagline} — trusted property guidance for Gulberg Greens, Gulberg Islamabad &amp; DHA Islamabad.</p>
          <div class="social-row">
            <a href="${waLink(BUSINESS.whatsappNumbers[0], defaultWaMessage())}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICONS.whatsapp}</a>
            <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">${ICONS.facebook}</a>
            <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">${ICONS.instagram}</a>
            <a href="${BUSINESS.youtube}" target="_blank" rel="noopener" aria-label="YouTube">${ICONS.youtube}</a>
          </div>
        </div>
        <div>
          <h4>Navigate</h4>
          <ul>
            <li><a href="${base}index.html">Home</a></li>
            <li><a href="${base}properties.html">Properties</a></li>
            <li><a href="${base}new-projects.html">New Projects</a></li>
            <li><a href="${base}about.html">About</a></li>
            <li><a href="${base}contact.html">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4>Categories</h4>
          <ul>
            <li><a href="${base}properties.html?type=House">Houses</a></li>
            <li><a href="${base}properties.html?type=Plot">Plots</a></li>
            <li><a href="${base}properties.html?type=Flat">Flats</a></li>
            <li><a href="${base}properties.html?type=Commercial">Commercial</a></li>
            <li><a href="${base}properties.html?type=Farmhouse">Farmhouses</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li>${BUSINESS.address}</li>
            <li><a href="tel:${BUSINESS.phones[0].replace(/-/g, "")}">${BUSINESS.phones[0]}</a></li>
            <li><a href="tel:${BUSINESS.phones[1].replace(/-/g, "")}">${BUSINESS.phones[1]}</a></li>
            <li><a href="mailto:${BUSINESS.email}">${BUSINESS.email}</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        &copy; ${new Date().getFullYear()} Homes PK Marketing. All rights reserved. — Led by Kamran Abbasi.
      </div>
    </div>
  </footer>`;
}

function buildFloatingWhatsapp() {
  return `<a class="floating-whatsapp" href="${waLink(BUSINESS.whatsappNumbers[0], defaultWaMessage())}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${ICONS.whatsapp}</a>`;
}

function initChrome(activePage) {
  const base = document.body.dataset.base || "";
  const headerEl = document.getElementById("site-header");
  const footerEl = document.getElementById("site-footer");
  const waEl = document.getElementById("floating-whatsapp");
  if (headerEl) headerEl.innerHTML = buildNavbar(activePage, base);
  if (footerEl) footerEl.innerHTML = buildFooter(base);
  if (waEl) waEl.innerHTML = buildFloatingWhatsapp();

  const toggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (toggle && navLinks) {
    toggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  }
  updateFavCountBadges();
}

document.addEventListener("DOMContentLoaded", () => {
  initChrome(document.body.dataset.page || "");
});
