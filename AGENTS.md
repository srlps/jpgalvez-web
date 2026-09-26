# AGENTS.md

## Project
Static reconstruction of `transportesjpgalvez.com` (Transportes e Inversiones Jeanpierre S.A.C.), a company site that went offline after the domain was lost. The original source code no longer exists — the only reference is the Wayback Machine capture:

- https://web.archive.org/web/20231107032817/http://transportesjpgalvez.com/

**Phase 1 (done)**: rebuild the site as-is from the archive capture — same sections, text, images and page structure, no redesign. See EXTRACTION.md for how the raw HTML/assets were pulled from the archive, and "Source/dist architecture" below for how that raw HTML was then migrated into the current Astro source.
**Phase 2 (future)**: modernize/redesign, especially anything that depended on the old backend (see below).

## Stack
Plain HTML/CSS output, no backend, no client-side framework — this is a brochure/informational site (no client state, no auth), so React/Vue add an unneeded client runtime and hurt SEO for zero benefit.

**Static-site generator: [Astro](https://astro.build/)**, chosen to compile layouts/partials down to plain HTML with zero client JS runtime by default. Fragments extracted into shared layout/partials (all under `src/`):
- `src/layouts/BaseLayout.astro` — `<head>`, header, footer, and the site-wide CSS/JS imports (see `src/components/Header.astro`, `Footer.astro`)
- `src/components/forms/HomeQuoteForm.astro`, `ContactForm.astro` — the 2 remaining quote/contact form variants ("SOLICITE SU PRESUPUESTO" on Inicio, and Contáctenos' own form). See backend note below. The 4 service subpages' "COTICE SU SERVICIO AHORA" form (`ServiceQuoteForm.astro`/`ServiceQuoteSection.astro`) never worked (no `action`, duplicate `id` bug — see EXTRACTION.md) and was removed rather than kept as a non-functional placeholder.
- `src/components/ServiceNav.astro`, `Cabecera.astro`, `ElegirNos.astro` — smaller fragments reused across the service subpages / Inicio / Nosotros / Clientes.

**Styles/scripts (optimized, no jQuery)**:
- `src/styles/site.css` — the **only** stylesheet. It replaced the 7 theme CSS files (Bootstrap 3, Font Awesome, Owl Carousel, Revolution Slider, Konstruct `style.css`/`shortcode.css`/`responsive.css`), keeping only rules the markup actually uses (the theme CSS was reduced by running PurgeCSS against the built HTML, then hand-merged and verified with pixel diffs against the previous build — desktop renders identically). No inline `style=""` attributes or `<style>` blocks in pages/components: add styles to `site.css`.
- `src/scripts/site.js` — vanilla JS replacing jQuery + all theme plugins; the only behaviors the site used were the sticky header (≥992px), the mobile menu toggle and the "go to top" button. Revolution Slider was replaced by a plain `<img class="banner">` (the slider only ever had one static slide), Font Awesome by an inline SVG (menu icon) and a CSS chevron (go-to-top).
- Some rules in `site.css` intentionally reproduce spacing that the original markup produced through junk elements (empty `<p>`s from nested CMS paragraphs, `<br>` stacks, `&nbsp;` spacer columns), e.g. `h1 + p { margin-top: 20px }` or `.derco { padding-bottom: 200px }` — removing them changes the layout. The three `<br>` in `Header.astro` are also load-bearing (they position the floated menus) and were kept on purpose.

## Source/dist architecture
Source lives under `src/` (Astro components/pages) and `public/` (static assets copied as-is); the buildable site is generated into `dist/` — **never edit `dist/` directly**, it's regenerated and gitignored.

- `npm install` — install dependencies (first time only)
- `npm run dev` — local dev server with live reload (http://localhost:4321)
- `npm run build` — generates the static site into `dist/`
- `npm run preview` — serves the built `dist/` locally, to sanity-check the actual build output

Internal links and asset references use root-absolute paths (`/nosotros/`, `/public_gv/...`) rather than the original archive's relative `../` paths — required by the layout/partial system (the same partial renders at different nesting depths) and idiomatic for Astro's routing, not a visual/content redesign. `astro.config.mjs` sets `trailingSlash: "always"` so `src/pages/nosotros.astro` builds to `dist/nosotros/index.html`, matching the original site's path structure exactly.

## Site map (from the archive capture)
Each route below maps to its Astro source page under `src/pages/`:
- `/` — Inicio (Nuestro compromiso, Nuestros servicios, ¿Por qué elegirnos?, testimonios, contacto) → `src/pages/index.astro`
- `/nosotros` — Misión, Visión, Objetivos → `src/pages/nosotros.astro`
- `/servicios` and 4 subpages: `mudanzas`, `transporte-de-almacenes-de-aduana`, `alquiler-de-vehiculos`, `alquiler-de-almacenes` → `src/pages/servicios/index.astro` + `src/pages/servicios/<subpage>/index.astro`
- `/clientes` → `src/pages/clientes/index.astro` (client list rendered from `src/data/clientes.json`)
- `/contactenos` → `src/pages/contactenos/index.astro`

Fetch each page from its own archive.org snapshot (append the page path to a `web.archive.org/web/<timestamp>/http://transportesjpgalvez.com/...` URL) to get accurate per-page text/images — do not assume the homepage snapshot has every section's content.

## Assets
Images are served by the capture from paths like `.../public_gv/imagenes/...`, `.../public_gv/uploads/...`, `.../public_gv/web/images/...` (append `im_` after the timestamp in the archive URL to get the raw image, e.g. `.../web/20231107032817im_/http://...`). Download and store them locally, mirroring the original `public_gv/...` relative path structure so page markup/links stay close to the original.

## Extraction plan (completed, historical)
This was a one-time migration, done in two parts:
1. **Archive → flat HTML** (steps below) — produced 9 standalone `.html` files + `public_gv/` assets. Tables and detailed notes live in [EXTRACTION.md](EXTRACTION.md).
   1. **Map URLs** — list every archive.org page URL to extract (see site map above) in a table.
   2. **Map resources** — for each page, list every resource it loads (images, CSS, JS, fonts) in a table (archive source URL → local target path). Only map in this step, don't download yet.
   3. **Download** — fetch each mapped resource and save it under the project, marking its table row as done.
   4. **Rewrite links** — replace all `web.archive.org/web/.../http://transportesjpgalvez.com/...` links and asset paths in the extracted HTML with the local relative references from the table. This step missed the same wayback-wrapper pattern embedded *inside* the downloaded CSS files' own `url()`/`@import` rules (font-awesome, revolution-slider, bootstrap, etc. — not just the 9 HTML pages) — found and fixed during the Astro migration below.
2. **Flat HTML → Astro source** — the 9 flat files were split into the `src/layouts`/`src/components`/`src/pages` structure described in "Stack" and "Source/dist architecture" above, `public_gv/` moved under `public/`, and the Clientes table's 294 rows extracted into `src/data/clientes.json`. The original flat `.html` files were then deleted (superseded by `npm run build`'s `dist/` output).

## Excluded / not part of this site
- Template boilerplate pages present in the capture (`blank-page.html`, `maintenance-mode.html`, `left-sidebar.html`, `right-sidebar.html`, `full-width.html`) — unused artifacts of the original HTML template, no business content. Skip them.
- `facturacion.transportesjpgalvez.com` and the `:2095` link (cPanel/WHM) — separate systems (invoicing app, hosting control panel), not part of the marketing site.

## ⚠️ Backend-dependent feature flagged for redesign
The home page ("SOLICITE SU PRESUPUESTO") and Contáctenos each have a quote/contact form with an "Enviar" submit button. This almost certainly posted to a PHP backend on the original host (the Wayback CDX index confirms two now-dead endpoints, `/contactenos/enviar_contactenos` and `/contactenos/enviar_contactenos_home`) — there is no way to recover that logic from the archive. Since this project has **no backend by design**:
- Rebuild the form markup/styling only, as a non-functional placeholder for now.
- Do not wire it to any endpoint yet — leave a `<!-- TODO(redesign): backend-dependent form, needs mailto/Formspree/EmailJS or similar -->` marker in the code.
- Revisit in Phase 2 once a redesign approach (mailto link, third-party form service, etc.) is decided.

## Known gaps to improve in Phase 2
Pending, not fixed yet — tracked here for the next (improvement) phase.

- **⚠️ Clientes list/pagination — needs investigation, don't trust the current numbers**: `src/pages/clientes/index.astro` renders **294 client rows** from `src/data/clientes.json`, all already present (verified by counting `<tr class="even pointer">` in the original extracted HTML before the JSON existed). In the original site this table was paginated **client-side** by a jQuery DataTables plugin (`iDisplayLength: 20`, i.e. ~15 pages of 20 rows) — that pagination was **not backend-driven**, contradicting what this file claimed earlier. During Step 3/4 of the extraction, the DataTables JS (`public_gv/administrador/js/datatables/**`) and its inline init script (which targeted this exact `#example` table) were removed as assumed "admin-panel dead weight" — that assumption was wrong for this specific page, and removing it is why the site now renders all 294 rows unpaginated instead of paginated. Open questions to resolve before redesigning: is 294 the real, complete client list, or was it already truncated by whatever crawled/generated the page originally? Does it match what's visible when paging through the archive capture manually? Until answered, don't assume this list is authoritative. Options once resolved: restore client-side pagination with a small vanilla-JS script (jQuery/DataTables are gone from the project and shouldn't come back just for this), or just ship it as a plain filterable list if 294 rows is confirmed correct.
- **Broken images — links to `whodp.com` (the original web agency's dev server), not `transportesjpgalvez.com`**: some body content has hardcoded `<img>` tags pointing to `http://whodp.com/nuevos-proyectos/webgalvez/public_gv/web/images/...`, a third domain never covered by this project's extraction. Confirmed via the Wayback CDX index that `whodp.com/nuevos-proyectos/webgalvez/**` was **never archived** — this is a pre-existing bug in the original site (agency forgot to swap dev-server links for production ones before launch), not something the extraction broke:
  - `src/pages/nosotros.astro` — `firma-cl.png` fixed already: repointed to the local `/public_gv/web/images/firma-cl.png` (same filename already existed locally), marked with a `TODO(broken-link)` comment for traceability.
  - `src/pages/servicios/mudanzas/index.astro` — `mudanza.jpg` and `mudanzasdepartamento.jpg` (not recoverable, never archived anywhere — left pointing at `whodp.com`, marked with a `TODO(broken-link)` comment)
  - `src/pages/servicios/transporte-de-almacenes-de-aduana/index.astro` — `transp-aduanero.jpg` (not recoverable, never archived anywhere — same treatment)
- **Backend-dependent forms**: see the dedicated section above — the 2 remaining forms (Inicio, Contáctenos) are left as static placeholders with a `TODO(redesign)` marker. The 4 service subpages' "COTICE SU SERVICIO AHORA" form never worked in the original site (no `action`, duplicate-field bug) and was removed entirely rather than kept as a placeholder.
- **Header icon buttons — validate they still work**: `src/components/Header.astro`'s small icon row has 3 links carried over as-is from the original: a mail icon (`webm_header.png`, alt="Webmail") linking to `transportesjpgalvez.com:2095` (cPanel Webmail login, not WHM despite the "Excluded" note above), a Facebook icon (`fb_header.png`) linking to the company's Facebook page (obviously still relevant, no action needed), and a star icon (`fact_header.png`, alt="Facturación electrónica") linking to `facturacion.transportesjpgalvez.com` (the invoicing subdomain). Since the original domain/hosting was lost, the Webmail and facturación links likely 404/timeout now — confirm with the owner whether Webmail/facturación access is still needed and, if so, where it should point today.
- **Mobile spacing**: during the optimization pass, meaningless `&nbsp;` spacer columns were removed. Desktop (≥992px) is pixel-identical to the extracted site, but below 992px a few blocks (inner-page banner, Contáctenos form header) sit 20–50px tighter than before. Not a bug; revisit during the redesign.

## Improvement opportunities to discuss with the site owner (Phase 2)
Questions/ideas to raise with the owner before doing any of this work — none of it is implemented yet.

- **Outdated contact numbers in the footer**: it lists RPM/RPC-style numbers (Movistar/Claro-specific prefixes from the old Peruvian mobile-to-mobile plans). That distinction is obsolete in Lima now that all carriers interconnect normally — ask whether the owner still uses/wants all of those numbers, or would rather consolidate to fewer, current contact numbers.
- **Modernize the visual style**: several sections currently rely on images for content (e.g. banners/graphics with embedded text) that could instead be real HTML text/markup, making it easier to restyle and keep current. Ask the owner if they want this content brought out of images and into editable HTML as part of the redesign.
- **Small admin interface for clientes/testimonios**: a lightweight authenticated admin page/form so the owner can add new clients and new testimonials themselves (growing the current catalog beyond the static extracted data) without a developer editing `src/data/clientes.json` by hand. Would need a backend/data store — Firestore is the candidate — which is a bigger architectural change from the current "no backend" static-site design and should be scoped separately if the owner wants it.
