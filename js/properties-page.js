function priceInRange(price, rangeKey) {
  if (!rangeKey) return true;
  const ranges = {
    "under-2000000": [0, 2000000],
    "2000000-10000000": [2000000, 10000000],
    "10000000-50000000": [10000000, 50000000],
    "50000000-plus": [50000000, Infinity],
  };
  const r = ranges[rangeKey];
  if (!r) return true;
  return price >= r[0] && price < r[1];
}

function applyPropertyFilters() {
  const type = document.getElementById("fType").value;
  const location = document.getElementById("fLocation").value;
  const status = document.getElementById("fStatus").value;
  const price = document.getElementById("fPrice").value;
  const q = document.getElementById("fSearch").value.trim().toLowerCase();

  const filtered = PROPERTIES.filter((p) => {
    if (type && p.type !== type) return false;
    if (location && p.sector !== location) return false;
    if (status && p.status !== status) return false;
    if (!priceInRange(p.price, price)) return false;
    if (q && !(p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q))) return false;
    return true;
  });

  renderPropertyGrid("propertiesGrid", filtered);
  document.getElementById("resultsCount").textContent = `${filtered.length} propert${filtered.length === 1 ? "y" : "ies"} found`;
}

function initPropertiesPage() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("type")) document.getElementById("fType").value = params.get("type");
  if (params.get("location")) document.getElementById("fLocation").value = params.get("location");
  if (params.get("status")) document.getElementById("fStatus").value = params.get("status");
  if (params.get("price")) document.getElementById("fPrice").value = params.get("price");

  ["fType", "fLocation", "fStatus", "fPrice"].forEach((id) =>
    document.getElementById(id).addEventListener("change", applyPropertyFilters)
  );
  document.getElementById("fSearch").addEventListener("input", applyPropertyFilters);

  applyPropertyFilters();
}

document.addEventListener("DOMContentLoaded", initPropertiesPage);
