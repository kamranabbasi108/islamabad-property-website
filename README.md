# Homes PK Marketing

Real estate website for **Homes PK Marketing**, led by agent Kamran Abbasi — property listings and guidance across Gulberg Greens, Gulberg Islamabad, and DHA Islamabad.

A static HTML/CSS/JS site (no build step, no framework). Property listings are stored in Supabase and managed through an admin panel; everything else (business info, static project data, favourites) needs no backend. Favourites are stored per-browser via `localStorage`.

## Structure

- `index.html`, `properties.html`, `new-projects.html`, `favourites.html`, `about.html`, `contact.html` — main pages
- `property.html?id=<uuid>` — property detail page, fetched live from Supabase by id
- `admin.html` — password-protected admin panel for managing listings (not linked from the public nav)
- `js/data.js` — business info (`BUSINESS`), static new-projects data (`PROJECTS`), and shared helpers
- `js/supabase.js` — shared Supabase client (URL + publishable key)
- `js/properties-data.js` — maps Supabase `properties` rows into the shape the public pages render
- `js/admin.js` — admin panel auth, listing CRUD, and image upload logic
- `css/style.css` — the full design system (colors, typography, components)

## Supabase setup

The public site and admin panel expect a `properties` table and a public `property-images` storage bucket in the configured Supabase project (credentials are in `js/supabase.js`).

**As of this branch, that table and bucket do not exist yet in the connected project** — `properties` returns a schema-cache 404 and `property-images` returns "Bucket not found" when queried directly. No migrations were run here per the original instructions, so someone with access to the Supabase dashboard needs to create them before the site will show real data:

- Table `properties`: `id` (uuid, pk, default `gen_random_uuid()`), `title` (text), `price` (numeric), `location` (text), `property_type` (text), `purpose` (text: `sale`|`rent`), `status` (text: `active`|`sold`), `bedrooms` (int), `bathrooms` (int), `area_size` (numeric), `area_unit` (text), `description` (text), `video_url` (text, nullable — YouTube/TikTok/any video link), `featured` (boolean), `images` (text[]), `created_at` (timestamptz, default `now()`)
- RLS: public `SELECT`, `INSERT`/`UPDATE`/`DELETE` restricted to authenticated users
- Storage bucket `property-images`: public, with upload/delete restricted to authenticated users
- At least one Supabase Auth user (email + password) for `admin.html` to sign in with — the panel doesn't offer sign-up

Until the table exists, the public pages show their "couldn't load listings" state and the admin dashboard will show a Supabase error after login — that's expected, not a bug.

## Running locally

Any static file server works, e.g.:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080/index.html`, or `http://localhost:8080/admin.html` for the admin panel.
