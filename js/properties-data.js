/* Supabase-backed property data access.
   Maps DB rows (properties table) into the same shape the existing rendering
   code in properties.js / home.js / property-detail.js already expects, so
   that code did not need to change when the data source moved off js/data.js. */

const PLACEHOLDER_PROPERTY_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23E8E8E4'/%3E%3Cg fill='%238A8A8A'%3E%3Cpath d='M400 220 260 330v130h280V330z'/%3E%3Cpath d='M240 340 400 210l160 130-14 18-146-118-146 118z'/%3E%3C/g%3E%3C/svg%3E";

let PROPERTIES = [];
let propertiesLoaded = false;
let propertiesLoadError = null;

function mapPropertyRow(row) {
  const sold = row.status === "sold";
  const isRent = row.purpose === "rent";
  const images = Array.isArray(row.images) && row.images.length ? row.images : [PLACEHOLDER_PROPERTY_IMAGE];
  return {
    id: row.id,
    title: row.title || "Untitled Property",
    price: Number(row.price) || 0,
    location: row.location || "",
    type: row.property_type || "",
    purpose: isRent ? "For Rent" : "For Sale",
    status: sold ? "sold" : isRent ? "for-rent" : "for-sale",
    beds: row.bedrooms || 0,
    baths: row.bathrooms || 0,
    area: [row.area_size, row.area_unit].filter(Boolean).join(" "),
    images,
    description: row.description || "",
    features: [],
    verified: false,
    videoUrl: row.video_url || "",
    featured: !!row.featured,
    rentPeriod: isRent ? "per month" : undefined,
    soldDate: sold ? row.created_at : undefined,
  };
}

async function loadProperties(force) {
  if (propertiesLoaded && !force) return PROPERTIES;
  propertiesLoadError = null;
  try {
    const { data, error } = await sbClient
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    PROPERTIES = (data || []).map(mapPropertyRow);
    propertiesLoaded = true;
  } catch (err) {
    propertiesLoadError = err;
    PROPERTIES = [];
  }
  return PROPERTIES;
}

async function fetchPropertyById(id) {
  try {
    const { data, error } = await sbClient.from("properties").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapPropertyRow(data) : null;
  } catch (err) {
    propertiesLoadError = err;
    return null;
  }
}

function getDistinctLocations() {
  const seen = new Set();
  PROPERTIES.forEach((p) => {
    if (p.location && p.location.trim()) seen.add(p.location.trim());
  });
  return Array.from(seen).sort((a, b) => a.localeCompare(b));
}

function populateLocationSelect(select) {
  if (!select) return;
  const locations = getDistinctLocations();
  if (!locations.length) return;
  const current = select.value;
  const placeholderOption = select.options[0];
  select.innerHTML = "";
  if (placeholderOption) select.appendChild(placeholderOption);
  locations.forEach((loc) => {
    const opt = document.createElement("option");
    opt.value = loc;
    opt.textContent = loc;
    select.appendChild(opt);
  });
  if (locations.includes(current)) select.value = current;
}
