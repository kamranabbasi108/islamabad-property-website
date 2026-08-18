/* One-time generator: reads js/data.js and writes a static listing/<id>.html
   per property so WhatsApp/social share links carry real OG meta tags
   (title, description, image) baked in at build time — no server needed. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const dataSrc = fs.readFileSync(path.join(root, "js", "data.js"), "utf8");

const sandbox = { window: { location: { origin: "", pathname: "" } } };
vm.createContext(sandbox);
vm.runInContext(dataSrc, sandbox);

// top-level `const`/`let` bindings aren't copied onto the sandbox object by vm,
// so pull them back out by evaluating identifiers within the same context.
const PROPERTIES = vm.runInContext("PROPERTIES", sandbox);
const BUSINESS = vm.runInContext("BUSINESS", sandbox);
const formatPKR = vm.runInContext("formatPKR", sandbox);

const outDir = path.join(root, "listing");
fs.mkdirSync(outDir, { recursive: true });

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function pageFor(p) {
  const priceLabel = `PKR ${formatPKR(p.price)}${p.rentPeriod ? " " + p.rentPeriod : ""}`;
  const title = `${p.title} — ${priceLabel} | ${p.location} | Homes PK Marketing`;
  const description = `${p.title} in ${p.location}. ${p.beds ? p.beds + " bed, " : ""}${p.baths ? p.baths + " bath, " : ""}${p.area}. ${p.description.slice(0, 130)}`;
  const url = `https://${BUSINESS.domain}/listing/${p.id}.html`;
  const image = escapeHtml(p.images[0]);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(p.title)} — ${escapeHtml(priceLabel)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(p.title)} — ${escapeHtml(priceLabel)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${image}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/style.css">
</head>
<body data-page="properties" data-base="../" data-id="${p.id}">

<div id="site-header"></div>

<main>
  <section class="tight">
    <div class="container" id="property-detail-root"></div>
  </section>
</main>

<div id="site-footer"></div>
<div id="floating-whatsapp"></div>

<script src="../js/data.js"></script>
<script src="../js/icons.js"></script>
<script src="../js/main.js"></script>
<script src="../js/properties.js"></script>
<script src="../js/property-detail.js"></script>
</body>
</html>
`;
}

let count = 0;
for (const p of PROPERTIES) {
  fs.writeFileSync(path.join(outDir, `${p.id}.html`), pageFor(p));
  count++;
}
console.log(`Generated ${count} listing pages in ${outDir}`);
