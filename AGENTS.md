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

## Excluded / not part of this site
- Template boilerplate pages present in the capture (`blank-page.html`, `maintenance-mode.html`, `left-sidebar.html`, `right-sidebar.html`, `full-width.html`) — unused artifacts of the original HTML template, no business content. Skip them.
- `facturacion.transportesjpgalvez.com` and the `:2095` link (cPanel/WHM) — separate systems (invoicing app, hosting control panel), not part of the marketing site.

## ⚠️ Backend-dependent feature flagged for redesign
The home page ("SOLICITE SU PRESUPUESTO") and each service page ("COTICE SU SERVICIO AHORA") have a quote/contact form with an "Enviar" submit button. This almost certainly posted to a PHP backend on the original host — there is no way to recover that logic from the archive. Since this project has **no backend by design**:
- Rebuild the form markup/styling only, as a non-functional placeholder for now.
- Do not wire it to any endpoint yet — leave a `<!-- TODO(redesign): backend-dependent form, needs mailto/Formspree/EmailJS or similar -->` marker in the code.
- Revisit in Phase 2 once a redesign approach (mailto link, third-party form service, etc.) is decided.
