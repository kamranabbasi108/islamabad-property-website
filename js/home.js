function renderNeighbourhoods() {
  const el = document.getElementById("neighbourhoodsGrid");
  if (!el) return;
  el.innerHTML = NEIGHBOURHOODS.map(
    (n) => `
    <div class="neigh-card">
      <img src="${n.image}" alt="${n.name}" loading="lazy">
      <div class="overlay">
        <span class="count-badge">${n.count}+ Listings</span>
        <h3>${n.name}</h3>
        <p>${n.tagline}</p>
      </div>
    </div>`
  ).join("");
}

function renderFeatured() {
  const el = document.getElementById("featuredGrid");
  if (!el) return;
  const list = PROPERTIES.filter((p) => p.featured);
  renderPropertyGrid("featuredGrid", list);
}

function renderRecentSold() {
  const el = document.getElementById("recentSoldGrid");
  if (!el) return;
  renderPropertyGrid("recentSoldGrid", getRecentSold(3));
}

function wireSearchBar() {
  const form = document.getElementById("heroSearch");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const type = document.getElementById("searchType").value;
    const location = document.getElementById("searchLocation").value;
    const status = document.getElementById("searchPurpose").value;
    const price = document.getElementById("searchPrice").value;
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (location) params.set("location", location);
    if (status) params.set("status", status);
    if (price) params.set("price", price);
    window.location.href = `properties.html?${params.toString()}`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderNeighbourhoods();
  renderFeatured();
  renderRecentSold();
  wireSearchBar();
});
