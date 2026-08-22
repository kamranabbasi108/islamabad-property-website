function renderNeighbourhoods() {
  const el = document.getElementById("neighbourhoodsGrid");
  if (!el) return;
  el.innerHTML = NEIGHBOURHOOD_INFO.map((n) => {
    const count = PROPERTIES.filter((p) => p.location.toLowerCase().includes(n.match)).length;
    return `
    <a class="neigh-card" href="properties.html?location=${encodeURIComponent(n.name)}">
      <img src="${n.image}" alt="${n.name}" loading="lazy">
      <div class="overlay">
        <span class="count-badge">${count}+ Listings</span>
        <h3>${n.name}</h3>
        <p>${n.tagline}</p>
      </div>
    </a>`;
  }).join("");
}

function renderFeatured() {
  const list = PROPERTIES.filter((p) => p.featured);
  renderPropertyGrid("featuredGrid", list);
}

function renderRecentSold() {
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

async function initHomeListings() {
  renderLoadingState("featuredGrid", "Loading featured properties…");
  renderLoadingState("recentSoldGrid", "Loading…");
  await loadProperties();
  if (propertiesLoadError) {
    renderErrorState("featuredGrid");
    renderErrorState("recentSoldGrid");
    return;
  }
  populateLocationSelect(document.getElementById("searchLocation"));
  renderNeighbourhoods();
  renderFeatured();
  renderRecentSold();
}

document.addEventListener("DOMContentLoaded", () => {
  wireSearchBar();
  initHomeListings();
});
