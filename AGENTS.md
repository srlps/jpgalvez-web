# AGENTS.md

## Project
Static reconstruction of `transportesjpgalvez.com` (Transportes e Inversiones Jeanpierre S.A.C.), a company site that went offline after the domain was lost. The original source code no longer exists — the only reference is the Wayback Machine capture:

- https://web.archive.org/web/20231107032817/http://transportesjpgalvez.com/

**Phase 1 (current)**: rebuild the site as-is from the archive capture — same sections, text, images and page structure. Do not redesign or improve yet.
**Phase 2 (future)**: modernize/redesign, especially anything that depended on the old backend (see below).

## Stack
Plain HTML/CSS output, no backend, no client-side framework — this is a brochure/informational site (no client state, no auth), so React/Vue add an unneeded client runtime and hurt SEO for zero benefit.

To avoid duplicating markup across ~9 pages, use a static-site generator with layouts/partials that compiles to plain HTML — e.g. Astro or Eleventy (11ty). Pick one before scaffolding. Fragments repeated on every page (candidates for a shared layout/partial):
- Top nav (Inicio / Nosotros / Servicios / Clientes / Contáctenos) + social/facturación/cPanel links
- Footer (company info block, "by WHODP" credit, Políticas de Privacidad)
- Quote/contact form block ("SOLICITE SU PRESUPUESTO" / "COTICE SU SERVICIO AHORA", see backend note below)

## Site map (from the archive capture)
- `/` — Inicio (Nuestro compromiso, Nuestros servicios, ¿Por qué elegirnos?, testimonios, contacto)
- `/nosotros` — Misión, Visión, Objetivos
- `/servicios` and 4 subpages: `mudanzas`, `transporte-de-almacenes-de-aduana`, `alquiler-de-vehiculos`, `alquiler-de-almacenes`
- `/clientes`
- `/contactenos`

Fetch each page from its own archive.org snapshot (append the page path to a `web.archive.org/web/<timestamp>/http://transportesjpgalvez.com/...` URL) to get accurate per-page text/images — do not assume the homepage snapshot has every section's content.

## Assets
Images are served by the capture from paths like `.../public_gv/imagenes/...`, `.../public_gv/uploads/...`, `.../public_gv/web/images/...` (append `im_` after the timestamp in the archive URL to get the raw image, e.g. `.../web/20231107032817im_/http://...`). Download and store them locally, mirroring the original `public_gv/...` relative path structure so page markup/links stay close to the original.

## Extraction plan
This is a one-time migration, not a repeatable workflow — track it as a plan here, not a skill:
1. **Map URLs** — list every archive.org page URL to extract (see site map above) in a table.
2. **Map resources** — for each page, list every resource it loads (images, CSS, JS, fonts) in a table (archive source URL → local target path). Only map in this step, don't download yet.
3. **Download** — fetch each mapped resource and save it under the project, marking its table row as done.
4. **Rewrite links** — replace all `web.archive.org/web/.../http://transportesjpgalvez.com/...` links and asset paths in the extracted HTML with the local relative references from the table.

Working tables for steps 1-2 (page URLs + resource mapping, with progress checkboxes) live in [EXTRACTION.md](EXTRACTION.md).

## Excluded / not part of this site
- Template boilerplate pages present in the capture (`blank-page.html`, `maintenance-mode.html`, `left-sidebar.html`, `right-sidebar.html`, `full-width.html`) — unused artifacts of the original HTML template, no business content. Skip them.
- `facturacion.transportesjpgalvez.com` and the `:2095` link (cPanel/WHM) — separate systems (invoicing app, hosting control panel), not part of the marketing site.

## ⚠️ Backend-dependent feature flagged for redesign
The home page ("SOLICITE SU PRESUPUESTO") and each service page ("COTICE SU SERVICIO AHORA") have a quote/contact form with an "Enviar" submit button. This almost certainly posted to a PHP backend on the original host (the Wayback CDX index confirms two now-dead endpoints, `/contactenos/enviar_contactenos` and `/contactenos/enviar_contactenos_home`) — there is no way to recover that logic from the archive. Since this project has **no backend by design**:
- Rebuild the form markup/styling only, as a non-functional placeholder for now.
- Do not wire it to any endpoint yet — leave a `<!-- TODO(redesign): backend-dependent form, needs mailto/Formspree/EmailJS or similar -->` marker in the code.
- Revisit in Phase 2 once a redesign approach (mailto link, third-party form service, etc.) is decided.

## Known gaps to improve in Phase 2
Pending, not fixed yet — tracked here for the next (improvement) phase.

- **⚠️ Clientes list/pagination — needs investigation, don't trust the current numbers**: `clientes/index.html` embeds a static `<table id="example">` with **294 client rows**, all already present in the HTML (verified by counting `<tr class="even pointer">`). In the original site this table was paginated **client-side** by a jQuery DataTables plugin (`iDisplayLength: 20`, i.e. ~15 pages of 20 rows) — that pagination was **not backend-driven**, contradicting what this file claimed earlier. During Step 3/4 of the extraction, the DataTables JS (`public_gv/administrador/js/datatables/**`) and its inline init script (which targeted this exact `#example` table) were removed as assumed "admin-panel dead weight" — that assumption was wrong for this specific page, and removing it is why the site now renders all 294 rows unpaginated instead of paginated. Open questions to resolve before redesigning: is 294 the real, complete client list, or was it already truncated by whatever crawled/generated the page originally? Does it match what's visible when paging through the archive capture manually? Until answered, don't assume this list is authoritative. Options once resolved: restore client-side pagination (e.g. re-add DataTables, or a lighter modern equivalent), or just ship it as a plain filterable list if 294 rows is confirmed correct.
- **Broken images — links to `whodp.com` (the original web agency's dev server), not `transportesjpgalvez.com`**: some body content has hardcoded `<img>` tags pointing to `http://whodp.com/nuevos-proyectos/webgalvez/public_gv/web/images/...`, a third domain never covered by this project's extraction. Confirmed via the Wayback CDX index that `whodp.com/nuevos-proyectos/webgalvez/**` was **never archived** — this is a pre-existing bug in the original site (agency forgot to swap dev-server links for production ones before launch), not something the extraction broke:
  - `nosotros/index.html` — `firma-cl.png` (recoverable: same filename already exists locally at `public_gv/web/images/firma-cl.png`; just needs the `<img src>` in the body text repointed to it)
  - `servicios/mudanzas/index.html` — `mudanza.jpg` and `mudanzasdepartamento.jpg` (not recoverable, never archived anywhere)
  - `servicios/transporte-de-almacenes-de-aduana/index.html` — `transp-aduanero.jpg` (not recoverable, never archived anywhere)
- **Backend-dependent forms**: see the dedicated section above — 2 real (dead-endpoint) forms + 4 broken/unwired forms, all left as static placeholders with a `TODO(redesign)` marker.
