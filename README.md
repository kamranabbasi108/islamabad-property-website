# Homes PK Marketing

Real estate website for **Homes PK Marketing**, led by agent Kamran Abbasi — property listings and guidance across Gulberg Greens, Gulberg Islamabad, and DHA Islamabad.

A static, dependency-free HTML/CSS/JS site (no build step, no backend, no login). Favourites are stored per-browser via `localStorage`.

## Structure

- `index.html`, `properties.html`, `new-projects.html`, `favourites.html`, `about.html`, `contact.html` — main pages
- `listing/<id>.html` — one static page per property, pre-rendered with real Open Graph meta tags so WhatsApp/social shares get a working link preview
- `property.html?id=<id>` — legacy redirector to `listing/<id>.html`
- `js/data.js` — all sample property/project data and business details in one place
- `css/style.css` — the full design system (colors, typography, components)
- `scripts/generate-listings.js` — regenerates `listing/*.html` from `js/data.js` (run with `node scripts/generate-listings.js` after editing property data)

## Running locally

Any static file server works, e.g.:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080/index.html`.
