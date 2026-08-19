/* Admin panel — Supabase-authenticated CRUD for the properties table.
   Deliberately works with raw DB rows (not the public mapPropertyRow shape)
   so editing round-trips the real columns without lossy conversions. */

const PROPERTY_TYPES = ["House", "Plot", "Flat", "Farmhouse", "Commercial"];
const AREA_UNITS = ["Marla", "Kanal", "Sqft"];

let currentUser = null;
let dashboardRows = [];
let editingId = null;
let pendingImageFiles = [];
let remainingExistingImages = [];
let removedExistingImages = [];
let busy = false;

/* ---------- small UI helpers ---------- */

function showToast(message, isError) {
  const root = document.getElementById("toastRoot");
  const toast = document.createElement("div");
  toast.className = "toast" + (isError ? " error" : "");
  toast.textContent = message;
  root.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function setBusy(state) {
  busy = state;
  document.querySelectorAll("[data-busy-disable]").forEach((el) => {
    el.disabled = state;
  });
}

function statusPill(row) {
  if (row.status === "sold") return `<span class="status-pill st-sold">Sold</span>`;
  if (row.purpose === "rent") return `<span class="status-pill st-rent">For Rent</span>`;
  return `<span class="status-pill st-sale">For Sale</span>`;
}

function storagePathFromPublicUrl(url) {
  const marker = `/object/public/${PROPERTY_IMAGES_BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

/* ---------- header (logo + logout) ---------- */

function renderHeader() {
  const el = document.getElementById("adminHeader");
  el.innerHTML = `
  <header class="navbar">
    <div class="container">
      <div class="logo">${ICONS.home}<span>Homes PK <span class="accent-italic">Marketing</span></span></div>
      <div>${currentUser ? `<button class="btn admin-logout-btn btn-sm" id="logoutBtn">${ICONS.logout} Logout</button>` : ""}</div>
    </div>
  </header>`;
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
}

/* ---------- auth ---------- */

function renderLoginForm() {
  document.getElementById("adminDashboard").style.display = "none";
  const gate = document.getElementById("authGate");
  gate.style.display = "block";
  gate.innerHTML = `
  <div class="login-card">
    <h2>Admin <span class="accent-italic">Login</span></h2>
    <p class="lead">Sign in to manage Homes PK Marketing listings.</p>
    <form id="loginForm">
      <div class="form-field">
        <label for="loginEmail">Email</label>
        <input type="email" id="loginEmail" required autocomplete="username">
      </div>
      <div class="form-field">
        <label for="loginPassword">Password</label>
        <input type="password" id="loginPassword" required autocomplete="current-password">
      </div>
      <button type="submit" class="btn btn-primary btn-block" id="loginSubmitBtn" data-busy-disable>Log In</button>
      <p class="form-msg" id="loginMsg"></p>
    </form>
  </div>`;
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const msg = document.getElementById("loginMsg");
  const btn = document.getElementById("loginSubmitBtn");

  setBusy(true);
  btn.innerHTML = `<span class="spinner"></span> Logging in…`;
  msg.classList.remove("show", "error");

  const { error } = await sbClient.auth.signInWithPassword({ email, password });

  setBusy(false);
  btn.textContent = "Log In";

  if (error) {
    msg.textContent = error.message || "Login failed. Please check your email and password.";
    msg.classList.add("show", "error");
  }
}

async function handleLogout() {
  await sbClient.auth.signOut();
}

async function initAuth() {
  const { data } = await sbClient.auth.getSession();
  currentUser = data.session ? data.session.user : null;
  renderHeader();
  if (currentUser) {
    showDashboard();
  } else {
    renderLoginForm();
  }

  sbClient.auth.onAuthStateChange((_event, session) => {
    currentUser = session ? session.user : null;
    renderHeader();
    if (currentUser) {
      showDashboard();
    } else {
      document.getElementById("adminDashboard").style.display = "none";
      renderLoginForm();
    }
  });
}

/* ---------- dashboard: list ---------- */

function showDashboard() {
  document.getElementById("authGate").style.display = "none";
  document.getElementById("authGate").innerHTML = "";
  const dash = document.getElementById("adminDashboard");
  dash.style.display = "block";
  dash.innerHTML = `
    <div class="admin-toolbar" id="adminToolbar">
      <h2 style="margin:0;">Manage <span class="accent-italic">Listings</span></h2>
      <button class="btn btn-primary" id="addPropertyBtn">${ICONS.plus} Add Property</button>
    </div>
    <div id="adminListView">
      <div class="admin-list" id="adminList"><p class="lead">Loading listings…</p></div>
    </div>
    <div id="adminFormView" style="display:none;"></div>
  `;
  document.getElementById("addPropertyBtn").addEventListener("click", () => openForm(null));
  loadDashboardList();
}

async function loadDashboardList() {
  const listEl = document.getElementById("adminList");
  const { data, error } = await sbClient.from("properties").select("*").order("created_at", { ascending: false });
  if (error) {
    listEl.innerHTML = `<div class="empty-state">${ICONS.home}<p>Couldn't load listings: ${error.message}</p></div>`;
    return;
  }
  dashboardRows = data || [];
  renderDashboardList();
}

function renderDashboardList() {
  const listEl = document.getElementById("adminList");
  if (!dashboardRows.length) {
    listEl.innerHTML = `<div class="empty-state">${ICONS.home}<p>No properties yet. Click "Add Property" to create your first listing.</p></div>`;
    return;
  }
  listEl.innerHTML = dashboardRows.map(renderAdminRow).join("");

  listEl.querySelectorAll("[data-edit-id]").forEach((btn) =>
    btn.addEventListener("click", () => openForm(btn.dataset.editId))
  );
  listEl.querySelectorAll("[data-delete-id]").forEach((btn) =>
    btn.addEventListener("click", () => handleDelete(btn.dataset.deleteId))
  );
  listEl.querySelectorAll("[data-toggle-sold-id]").forEach((btn) =>
    btn.addEventListener("click", () => handleToggleSold(btn.dataset.toggleSoldId))
  );
}

function renderAdminRow(row) {
  const thumb = Array.isArray(row.images) && row.images.length ? row.images[0] : PLACEHOLDER_PROPERTY_IMAGE;
  const areaLabel = [row.area_size, row.area_unit].filter(Boolean).join(" ");
  return `
  <div class="admin-row" data-row-id="${row.id}">
    <img class="row-thumb" src="${thumb}" alt="${row.title}">
    <div class="row-info">
      <div class="row-title">${row.title}</div>
      <div class="row-meta">${row.location || ""}${areaLabel ? " — " + areaLabel : ""}</div>
      <div style="margin-top:6px;">${statusPill(row)}</div>
    </div>
    <div class="row-price">PKR ${formatPKR(Number(row.price) || 0)}</div>
    <div class="row-actions">
      <button class="btn btn-outline btn-sm" data-toggle-sold-id="${row.id}" data-busy-disable>${row.status === "sold" ? "Mark Active" : "Mark SOLD"}</button>
      <button class="btn btn-outline btn-sm" data-edit-id="${row.id}" data-busy-disable>${ICONS.edit} Edit</button>
      <button class="btn btn-outline btn-sm" data-delete-id="${row.id}" data-busy-disable style="color:#B23A3A; border-color:#B23A3A;">${ICONS.trash} Delete</button>
    </div>
  </div>`;
}

async function handleToggleSold(id) {
  const row = dashboardRows.find((r) => r.id === id);
  if (!row || busy) return;
  const newStatus = row.status === "sold" ? "active" : "sold";
  setBusy(true);
  const { error } = await sbClient.from("properties").update({ status: newStatus }).eq("id", id);
  setBusy(false);
  if (error) {
    showToast(`Couldn't update status: ${error.message}`, true);
    return;
  }
  row.status = newStatus;
  renderDashboardList();
  showToast(newStatus === "sold" ? "Marked as sold." : "Marked as active.");
}

async function handleDelete(id) {
  const row = dashboardRows.find((r) => r.id === id);
  if (!row || busy) return;
  const confirmed = window.confirm(`Delete "${row.title}"? This cannot be undone.`);
  if (!confirmed) return;

  setBusy(true);
  const paths = (Array.isArray(row.images) ? row.images : [])
    .map(storagePathFromPublicUrl)
    .filter(Boolean);
  if (paths.length) {
    await sbClient.storage.from(PROPERTY_IMAGES_BUCKET).remove(paths);
  }
  const { error } = await sbClient.from("properties").delete().eq("id", id);
  setBusy(false);

  if (error) {
    showToast(`Couldn't delete listing: ${error.message}`, true);
    return;
  }
  dashboardRows = dashboardRows.filter((r) => r.id !== id);
  renderDashboardList();
  showToast("Listing deleted.");
}

/* ---------- dashboard: add / edit form ---------- */

function openForm(id) {
  editingId = id;
  const row = id ? dashboardRows.find((r) => r.id === id) : null;
  pendingImageFiles = [];
  remainingExistingImages = row && Array.isArray(row.images) ? [...row.images] : [];
  removedExistingImages = [];

  document.getElementById("adminToolbar").style.display = "none";
  document.getElementById("adminListView").style.display = "none";
  const formView = document.getElementById("adminFormView");
  formView.style.display = "block";
  formView.innerHTML = buildFormMarkup(row);

  document.getElementById("cancelFormBtn").addEventListener("click", closeForm);
  document.getElementById("propertyForm").addEventListener("submit", handleFormSubmit);
  renderImagePreviews();
  wireImageDropzone();
}

function closeForm() {
  editingId = null;
  document.getElementById("adminFormView").style.display = "none";
  document.getElementById("adminFormView").innerHTML = "";
  document.getElementById("adminToolbar").style.display = "flex";
  document.getElementById("adminListView").style.display = "block";
}

function buildFormMarkup(row) {
  const r = row || {};
  const opt = (value, label, selected) => `<option value="${value}" ${selected === value ? "selected" : ""}>${label}</option>`;
  return `
    <h2 style="margin-bottom:20px;">${row ? "Edit" : "Add"} <span class="accent-italic">Property</span></h2>
    <form id="propertyForm">
      <div class="form-field">
        <label for="fTitle">Title</label>
        <input type="text" id="fTitle" required value="${r.title ? r.title.replace(/"/g, "&quot;") : ""}">
      </div>

      <div class="form-grid">
        <div class="form-field">
          <label for="fPrice">Price (PKR)</label>
          <input type="number" id="fPrice" required min="0" value="${r.price != null ? r.price : ""}">
        </div>
        <div class="form-field">
          <label for="fLocation">Location</label>
          <input type="text" id="fLocation" required value="${r.location ? r.location.replace(/"/g, "&quot;") : ""}" placeholder="e.g. Gulberg Greens, Islamabad">
        </div>
      </div>

      <div class="form-grid">
        <div class="form-field">
          <label for="fType">Property Type</label>
          <select id="fType">${PROPERTY_TYPES.map((t) => opt(t, t, r.property_type)).join("")}</select>
        </div>
        <div class="form-field">
          <label for="fPurpose">Purpose</label>
          <select id="fPurpose">
            ${opt("sale", "Sale", r.purpose || "sale")}
            ${opt("rent", "Rent", r.purpose)}
          </select>
        </div>
      </div>

      <div class="form-field">
        <label for="fStatus">Status</label>
        <select id="fStatus">
          ${opt("active", "Active", r.status || "active")}
          ${opt("sold", "Sold", r.status)}
        </select>
      </div>

      <div class="form-field checkbox-field">
        <input type="checkbox" id="fFeatured" ${r.featured ? "checked" : ""}>
        <label for="fFeatured">Featured on homepage</label>
      </div>

      <div class="form-grid">
        <div class="form-field">
          <label for="fBedrooms">Bedrooms</label>
          <input type="number" id="fBedrooms" min="0" value="${r.bedrooms != null ? r.bedrooms : 0}">
        </div>
        <div class="form-field">
          <label for="fBathrooms">Bathrooms</label>
          <input type="number" id="fBathrooms" min="0" value="${r.bathrooms != null ? r.bathrooms : 0}">
        </div>
      </div>

      <div class="form-grid">
        <div class="form-field">
          <label for="fAreaSize">Area Size</label>
          <input type="number" id="fAreaSize" min="0" step="any" value="${r.area_size != null ? r.area_size : ""}">
        </div>
        <div class="form-field">
          <label for="fAreaUnit">Area Unit</label>
          <select id="fAreaUnit">${AREA_UNITS.map((u) => opt(u, u, r.area_unit)).join("")}</select>
        </div>
      </div>

      <div class="form-field">
        <label for="fDescription">Description</label>
        <textarea id="fDescription">${r.description || ""}</textarea>
      </div>

      <div class="form-field">
        <label for="fVideoUrl">Video URL</label>
        <input type="url" id="fVideoUrl" value="${r.video_url ? r.video_url.replace(/"/g, "&quot;") : ""}" placeholder="YouTube, TikTok, or any video link (optional)">
      </div>

      <div class="form-field">
        <label>Photos</label>
        <div class="upload-dropzone" id="uploadDropzone">
          ${ICONS.upload}
          <div>Click or drag photos here to upload</div>
          <input type="file" id="imageInput" accept="image/*" multiple>
        </div>
        <div class="upload-grid" id="imagePreviewGrid"></div>
      </div>

      <div style="display:flex; gap:12px; margin-top:10px;">
        <button type="submit" class="btn btn-primary" id="savePropertyBtn" data-busy-disable>${row ? "Save Changes" : "Add Property"}</button>
        <button type="button" class="btn btn-outline" id="cancelFormBtn" data-busy-disable>Cancel</button>
      </div>
      <p class="form-msg" id="formMsg"></p>
    </form>
  `;
}

function wireImageDropzone() {
  const zone = document.getElementById("uploadDropzone");
  const input = document.getElementById("imageInput");
  zone.addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    addPendingFiles(Array.from(input.files));
    input.value = "";
  });
  ["dragover", "dragleave", "drop"].forEach((evt) =>
    zone.addEventListener(evt, (e) => {
      e.preventDefault();
      zone.classList.toggle("dragover", evt === "dragover");
    })
  );
  zone.addEventListener("drop", (e) => {
    addPendingFiles(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")));
  });
}

function addPendingFiles(files) {
  pendingImageFiles.push(...files);
  renderImagePreviews();
}

function renderImagePreviews() {
  const grid = document.getElementById("imagePreviewGrid");
  const existingThumbs = remainingExistingImages
    .map(
      (url, i) => `
    <div class="upload-thumb">
      <img src="${url}" alt="Existing photo ${i + 1}">
      <button type="button" class="remove-thumb" data-remove-existing="${i}" title="Remove">${ICONS.close}</button>
    </div>`
    )
    .join("");
  const pendingThumbs = pendingImageFiles
    .map(
      (file, i) => `
    <div class="upload-thumb">
      <img src="${URL.createObjectURL(file)}" alt="New photo ${i + 1}">
      <button type="button" class="remove-thumb" data-remove-pending="${i}" title="Remove">${ICONS.close}</button>
    </div>`
    )
    .join("");
  grid.innerHTML = existingThumbs + pendingThumbs;

  grid.querySelectorAll("[data-remove-existing]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.removeExisting);
      removedExistingImages.push(remainingExistingImages[i]);
      remainingExistingImages.splice(i, 1);
      renderImagePreviews();
    })
  );
  grid.querySelectorAll("[data-remove-pending]").forEach((btn) =>
    btn.addEventListener("click", () => {
      pendingImageFiles.splice(Number(btn.dataset.removePending), 1);
      renderImagePreviews();
    })
  );
}

async function uploadPendingImages() {
  const uploadedUrls = [];
  for (const file of pendingImageFiles) {
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const { error } = await sbClient.storage.from(PROPERTY_IMAGES_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;
    const { data } = sbClient.storage.from(PROPERTY_IMAGES_BUCKET).getPublicUrl(path);
    uploadedUrls.push(data.publicUrl);
  }
  return uploadedUrls;
}

async function handleFormSubmit(e) {
  e.preventDefault();
  if (busy) return;
  const msg = document.getElementById("formMsg");
  const btn = document.getElementById("savePropertyBtn");
  msg.classList.remove("show", "error");

  const payload = {
    title: document.getElementById("fTitle").value.trim(),
    price: Number(document.getElementById("fPrice").value) || 0,
    location: document.getElementById("fLocation").value.trim(),
    property_type: document.getElementById("fType").value,
    purpose: document.getElementById("fPurpose").value,
    status: document.getElementById("fStatus").value,
    bedrooms: Number(document.getElementById("fBedrooms").value) || 0,
    bathrooms: Number(document.getElementById("fBathrooms").value) || 0,
    area_size: Number(document.getElementById("fAreaSize").value) || 0,
    area_unit: document.getElementById("fAreaUnit").value,
    description: document.getElementById("fDescription").value.trim(),
    video_url: document.getElementById("fVideoUrl").value.trim() || null,
    featured: document.getElementById("fFeatured").checked,
  };

  setBusy(true);
  btn.innerHTML = `<span class="spinner"></span> Saving…`;

  try {
    const newUrls = await uploadPendingImages();
    payload.images = [...remainingExistingImages, ...newUrls];

    if (editingId) {
      const { error } = await sbClient.from("properties").update(payload).eq("id", editingId);
      if (error) throw error;
    } else {
      const { error } = await sbClient.from("properties").insert(payload);
      if (error) throw error;
    }

    if (removedExistingImages.length) {
      const paths = removedExistingImages.map(storagePathFromPublicUrl).filter(Boolean);
      if (paths.length) await sbClient.storage.from(PROPERTY_IMAGES_BUCKET).remove(paths);
    }

    showToast(editingId ? "Property updated." : "Property added.");
    closeForm();
    loadDashboardList();
  } catch (err) {
    msg.textContent = err.message || "Something went wrong while saving. Please try again.";
    msg.classList.add("show", "error");
  } finally {
    setBusy(false);
    btn.textContent = editingId ? "Save Changes" : "Add Property";
  }
}

document.addEventListener("DOMContentLoaded", initAuth);
