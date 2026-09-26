# Extraction tracking

Working checklist for the one-time migration described in [AGENTS.md](AGENTS.md) → "Extraction plan". Source: Wayback Machine CDX index for `transportesjpgalvez.com` (queried 2026-09-25). Timestamps below are confirmed `200` captures.

> This document records **Part 1** of the extraction (archive → 9 flat `.html` files). Those flat files were since migrated into the Astro `src/` structure described in AGENTS.md → "Stack" / "Source/dist architecture" (Part 2) and no longer exist in the repo — paths like `nosotros/index.html` below are historical, not current file locations.
>
> The theme CSS/JS/font files mapped below (`public_gv/web/stylesheets/**`, `public_gv/web/javascript/**`, `public_gv/web/fonts/**`, `shortcode/pattern3.png`) were later removed in the optimization pass: styles were consolidated into `src/styles/site.css` and jQuery + plugins replaced by `src/scripts/site.js`. Only the content images remain under `public/public_gv/`.

Archive URL patterns:
- Page: `https://web.archive.org/web/<timestamp>/http://transportesjpgalvez.com/<path>`
- Raw asset (bypasses the Wayback toolbar): `https://web.archive.org/web/<timestamp>im_/http://transportesjpgalvez.com/<path>`

## Step 1 — Page URLs

Raw HTML for all 9 pages was downloaded and inspected directly (cached under `.extraction-raw/*.html` during extraction; deleted after Step 4 completed, no longer part of the repo).

| Page | Local target | Archive URL | Status |
|---|---|---|---|
| Inicio | `index.html` | https://web.archive.org/web/20231107032817/http://transportesjpgalvez.com/ | Raw HTML read |
| Nosotros | `nosotros/index.html` | https://web.archive.org/web/20220519065352/http://transportesjpgalvez.com/nosotros | Raw HTML read |
| Servicios (índice) | `servicios/index.html` | https://web.archive.org/web/20180825150346/http://transportesjpgalvez.com/servicios | Raw HTML read |
| Servicios – Mudanzas | `servicios/mudanzas/index.html` | https://web.archive.org/web/20220519065351/http://transportesjpgalvez.com/servicios/mudanzas | Raw HTML read |
| Servicios – Transporte de almacenes de aduana | `servicios/transporte-de-almacenes-de-aduana/index.html` | https://web.archive.org/web/20180825135438/http://transportesjpgalvez.com/servicios/transporte-de-almacenes-de-aduana | Raw HTML read |
| Servicios – Alquiler de vehículos | `servicios/alquiler-de-vehiculos/index.html` | https://web.archive.org/web/20180825152436/http://transportesjpgalvez.com/servicios/alquiler-de-vehiculos | Raw HTML read |
| Servicios – Alquiler de almacenes | `servicios/alquiler-de-almacenes/index.html` | https://web.archive.org/web/20180825141530/http://transportesjpgalvez.com/servicios/alquiler-de-almacenes | Raw HTML read |
| Clientes | `clientes/index.html` | https://web.archive.org/web/20180825145734/http://transportesjpgalvez.com/clientes | Raw HTML read |
| Contáctenos | `contactenos/index.html` | https://web.archive.org/web/20180825153344/http://transportesjpgalvez.com/contactenos | Raw HTML read (the project's reference timestamp `20231107032817` 404s for this path — use this one instead) |

Excluded on purpose (see AGENTS.md): `blank-page.html`, `maintenance-mode.html`, `left-sidebar.html`, `right-sidebar.html`, `full-width.html` (all under `/` and `/servicios/`), `facturacion.transportesjpgalvez.com/**` (separate invoicing app), `transportesjpgalvez.com/public_gv/administrador/**` pages (separate CMS admin panel, not the public site) — note its *assets* are still loaded by the public pages, see below.

**Backend confirmation, verified directly in the HTML (not just the CDX index)**:
- Inicio: the "CONTACTAR" button (`id="btn_conta"`) calls JS `enviar_contactenos()`, which POSTs (likely AJAX) to `.../contactenos/enviar_contactenos_home`.
- Contáctenos: same function name, POSTs to `.../contactenos/enviar_contactenos` (no `_home` suffix).
- Servicios – Mudanzas/Aduana/Alquiler de vehículos/Alquiler de almacenes: each has a "COTICE SU SERVICIO AHORA" form (`id="contact-form_2"`, `method="post"`, **no `action` attribute**) with a "Enviar" submit button (`id="submit"`) — but **no JS handler was found wired to it** in the captured HTML (unlike the two forms above). The captured markup is also broken: 9 duplicate `<input name="nombre_contactenos" id="nombre_contactenos">` fields (all placeholder "Nombre", invalid duplicate IDs) plus one `textarea#mensaje_contactenos`. Reproduce the visual layout as-is per AGENTS.md, but don't try to "fix" the duplicate-field bug — that's original-site behavior, not our error.
- Servicios (índice), Nosotros, Clientes: **no quote/contact form on these pages** — confirmed absent, don't add one.

All of this stays a static, non-functional placeholder per AGENTS.md's backend-dependent note.

## Step 2 — Resource mapping (map only, do not download yet)

Every entry below was found via direct `grep` of the 9 raw HTML files (`src=`, `href=`, and inline `style="background-image:url(...)"`) — nothing here is inferred from filenames.

### Shared theme assets (identical `<link>`/`<script>` tags on all 9 pages)

| Archive source (raw) | Local target | Notes |
|---|---|---|
| `.../web/<ts>cs_/.../public_gv/web/stylesheets/bootstrap.css` | `public_gv/web/stylesheets/bootstrap.css` | |
| `.../web/<ts>cs_/.../public_gv/web/stylesheets/font-awesome.css` | `public_gv/web/stylesheets/font-awesome.css` | |
| `.../web/<ts>cs_/.../public_gv/web/stylesheets/owl.carousel.css` | `public_gv/web/stylesheets/owl.carousel.css` | |
| `.../web/<ts>cs_/.../public_gv/web/stylesheets/prettyPhoto.css` | `public_gv/web/stylesheets/prettyPhoto.css` | |
| `.../web/<ts>cs_/.../public_gv/web/stylesheets/responsive.css` | `public_gv/web/stylesheets/responsive.css` | |
| `.../web/<ts>cs_/.../public_gv/web/stylesheets/revolution-slider.css` | `public_gv/web/stylesheets/revolution-slider.css` | |
| `.../web/<ts>cs_/.../public_gv/web/stylesheets/shortcode.css` | `public_gv/web/stylesheets/shortcode.css` | |
| `.../web/<ts>cs_/.../public_gv/web/stylesheets/style.css` | `public_gv/web/stylesheets/style.css` | main theme stylesheet; still need to open it to map `@font-face`/`url(...)` refs (fonts, gradients, etc.) before Step 3 |
| `.../web/<ts>js_/.../public_gv/web/javascript/bootstrap.min.js` | `public_gv/web/javascript/bootstrap.min.js` | |
| `.../web/<ts>js_/.../public_gv/web/javascript/imagesloaded.min.js` | `public_gv/web/javascript/imagesloaded.min.js` | |
| `.../web/<ts>js_/.../public_gv/web/javascript/jquery-countTo.js` | `public_gv/web/javascript/jquery-countTo.js` | |
| `.../web/<ts>js_/.../public_gv/web/javascript/jquery-validate.js` | `public_gv/web/javascript/jquery-validate.js` | |
| `.../web/<ts>js_/.../public_gv/web/javascript/jquery-waypoints.js` | `public_gv/web/javascript/jquery-waypoints.js` | |
| `.../web/<ts>js_/.../public_gv/web/javascript/jquery.easing.js` | `public_gv/web/javascript/jquery.easing.js` | |
| `.../web/<ts>js_/.../public_gv/web/javascript/jquery.fitvids.js` | `public_gv/web/javascript/jquery.fitvids.js` | |
| `.../web/<ts>js_/.../public_gv/web/javascript/jquery.isotope.min.js` | `public_gv/web/javascript/jquery.isotope.min.js` | |
| `.../web/<ts>js_/.../public_gv/web/javascript/jquery.min.js` | `public_gv/web/javascript/jquery.min.js` | |
| `.../web/<ts>js_/.../public_gv/web/javascript/jquery.prettyPhoto.js` | `public_gv/web/javascript/jquery.prettyPhoto.js` | |
| `.../web/<ts>js_/.../public_gv/web/javascript/jquery.themepunch.revolution.min.js` | `public_gv/web/javascript/jquery.themepunch.revolution.min.js` | homepage slider (revolution slider only actually animates content on Inicio, but the `<script>` tag is present on every page) |
| `.../web/<ts>js_/.../public_gv/web/javascript/jquery.themepunch.tools.min.js` | `public_gv/web/javascript/jquery.themepunch.tools.min.js` | |
| `.../web/<ts>js_/.../public_gv/web/javascript/main.js` | `public_gv/web/javascript/main.js` | theme init script |
| `.../web/<ts>js_/.../public_gv/web/javascript/matchMedia.js` | `public_gv/web/javascript/matchMedia.js` | |
| `.../web/<ts>js_/.../public_gv/web/javascript/owl.carousel.js` | `public_gv/web/javascript/owl.carousel.js` | |
| `.../web/<ts>js_/.../public_gv/web/javascript/parallax.js` | `public_gv/web/javascript/parallax.js` | |
| `.../web/<ts>js_/.../public_gv/web/javascript/slider.js` | `public_gv/web/javascript/slider.js` | |
| `http://transportesjpgalvez.com/public_gv/web/javascript/html5shiv.js` | — | inside an `<!--[if lt IE 9]-->` comment (Wayback doesn't rewrite it) — IE8/9 shim, skip, not needed |
| `http://transportesjpgalvez.com/public_gv/web/javascript/respond.min.js` | — | same IE conditional comment, skip |
| `.../web/<ts>im_/http://transportesjpgalvez.com/public_gv/imagenes/ico.ico` | `public_gv/imagenes/ico.ico` | favicon — **not** root `/favicon.ico` (that file exists in the CDX index but no page actually references it) |
| `.../web/<ts>im_/.../public_gv/imagenes/logo.png` | `public_gv/imagenes/logo.png` | header logo, used on all 9 pages — **not** `public_gv/web/images/logo.png` (that one exists in the CDX index but no page references it, skip) |
| `.../web/<ts>im_/.../public_gv/web/images/fact_header.png` | `public_gv/web/images/fact_header.png` | nav icon → links to `facturacion.transportesjpgalvez.com` (excluded system) |
| `.../web/<ts>im_/.../public_gv/web/images/fb_header.png` | `public_gv/web/images/fb_header.png` | nav icon → links to the company's Facebook page |
| `.../web/<ts>im_/.../public_gv/web/images/webm_header.png` | `public_gv/web/images/webm_header.png` | nav icon → links to `transportesjpgalvez.com:2095` (cPanel/WHM, excluded system) |

Admin-theme assets, **confirmed loaded by every one of the 9 public pages** (`<script>` tags physically present in each page's `<head>`/footer, even though these files live under `/public_gv/administrador/` and only make sense for the CMS admin panel — original devs likely reused one global footer include for both admin and public layouts). No chart/datatable/gauge/icheck UI element actually appears in the rendered public pages, so functionally these are dead weight:

| Archive source (raw) | Local target | Notes |
|---|---|---|
| `.../web/<ts>js_/.../public_gv/administrador/js/bootstrap.min.js` | `public_gv/administrador/js/bootstrap.min.js` | duplicate of the theme's own bootstrap.min.js |
| `.../web/<ts>js_/.../public_gv/administrador/js/chartjs/chart.min.js` | `public_gv/administrador/js/chartjs/chart.min.js` | unused on public pages (no chart element) |
| `.../web/<ts>js_/.../public_gv/administrador/js/custom.js` | `public_gv/administrador/js/custom.js` | admin panel init script |
| `.../web/<ts>js_/.../public_gv/administrador/js/datatables/js/jquery.dataTables.js` | `public_gv/administrador/js/datatables/js/jquery.dataTables.js` | unused (no table element) |
| `.../web/<ts>js_/.../public_gv/administrador/js/datatables/tools/js/dataTables.tableTools.js` | `public_gv/administrador/js/datatables/tools/js/dataTables.tableTools.js` | unused; also references a dead `.swf` (Flash, definitely skip) |
| `.../web/<ts>js_/.../public_gv/administrador/js/gauge/gauge.min.js` | `public_gv/administrador/js/gauge/gauge.min.js` | unused (no gauge element) |
| `.../web/<ts>js_/.../public_gv/administrador/js/gauge/gauge_demo.js` | `public_gv/administrador/js/gauge/gauge_demo.js` | unused |
| `.../web/<ts>js_/.../public_gv/administrador/js/icheck/icheck.min.js` | `public_gv/administrador/js/icheck/icheck.min.js` | unused (no icheck checkbox) |
| `.../web/<ts>js_/.../public_gv/administrador/js/nicescroll/jquery.nicescroll.min.js` | `public_gv/administrador/js/nicescroll/jquery.nicescroll.min.js` | unused |
| `.../web/<ts>js_/.../public_gv/administrador/js/progressbar/bootstrap-progressbar.min.js` | `public_gv/administrador/js/progressbar/bootstrap-progressbar.min.js` | unused |

**Recommendation for Step 3**: skip the whole admin-theme block above — it's confirmed present but confirmed functionally dead on every public page, and porting it would mean recreating an admin-panel asset tree for a site with no backend/admin. Flag if you disagree and want byte-for-byte parity instead.

Only on **Clientes** (not on the other 8 pages):

| Archive source (raw) | Local target | Notes |
|---|---|---|
| `.../web/20180825145734cs_/.../public_gv/administrador/css/custom.css` | `public_gv/administrador/css/custom.css` | anomaly, only this page loads it |
| `.../web/20180825145734cs_/.../public_gv/administrador/css/datatables/tools/css/dataTables.tableTools.css` | `public_gv/administrador/css/datatables/tools/css/dataTables.tableTools.css` | anomaly, only this page loads it |
| `.../web/20180825145734js_/.../public_gv/administrador/js/jquery.min.js` | `public_gv/administrador/js/jquery.min.js` | duplicate of the theme's own jquery.min.js, only this page loads it |

CSS-declared assets — all 8 shared stylesheets were downloaded and every `url(...)` inside them checked against a matching class/id/selector actually present in the 9 pages' HTML (not assumed from the CSS alone):

| Archive source (raw) | Local target | Notes |
|---|---|---|
| `.../web/20180203214755im_/.../public_gv/web/fonts/fontawesome-webfont.eot(?v=4.3.0\|#iefix)` | `public_gv/web/fonts/fontawesome-webfont.eot` | `@font-face` in `font-awesome.css` (loaded on all 9 pages); icon glyphs (`<i class="fa fa-...">`) are used in nav/footer — **confirmed used** |
| `.../web/20180203214755im_/.../public_gv/web/fonts/fontawesome-webfont.svg?v=4.3.0` | `public_gv/web/fonts/fontawesome-webfont.svg` | same as above |
| `.../web/20180203214755im_/.../public_gv/web/fonts/fontawesome-webfont.ttf?v=4.3.0` | `public_gv/web/fonts/fontawesome-webfont.ttf` | same as above |
| `.../web/20180203214755im_/.../public_gv/web/fonts/fontawesome-webfont.woff?v=4.3.0` | `public_gv/web/fonts/fontawesome-webfont.woff` | same as above |
| `.../web/20180203214755im_/.../public_gv/web/fonts/fontawesome-webfont.woff2?v=4.3.0` | `public_gv/web/fonts/fontawesome-webfont.woff2` | same as above |
| `.../web/20180204010729im_/.../public_gv/web/fonts/revicons.eot(?5510888\|#iefix)` | `public_gv/web/fonts/revicons.eot` | `@font-face` in **`revolution-slider.css`** (corrects earlier guess of owl.carousel.css) — icon font for the Revolution Slider's prev/next arrows, visible on Inicio's slider — **confirmed used** |
| `.../web/20180204010729im_/.../public_gv/web/fonts/revicons.svg?5510888#revicons` | `public_gv/web/fonts/revicons.svg` | same as above |
| `.../web/20180204010729im_/.../public_gv/web/fonts/revicons.ttf?5510888` | `public_gv/web/fonts/revicons.ttf` | same as above |
| `.../web/20180204010729im_/.../public_gv/web/fonts/revicons.woff?5510888` | `public_gv/web/fonts/revicons.woff` | same as above |
| `.../web/20180204011039im_/.../public_gv/web/images/shortcode/pattern3.png` | `public_gv/web/images/shortcode/pattern3.png` | `shortcode.css` `.feature_box` rule; `class="feature_box"` found on Inicio ("Nuestro compromiso" section) — **confirmed used** |
| `.../web/20180203233748im_/.../public_gv/web/images/common/map-background.png` | `public_gv/web/images/common/map-background.png` | `style.css` `#site-content #page-footer` rule; `id="page-footer"` found on every page's footer — **confirmed used** |
| `https://fonts.googleapis.com/css?family=Fjalla+One` | not downloaded — link to Google Fonts CDN as-is | external font, declared via `@import`/`url()` in `style.css`; no backend involved, safe to keep as a live CDN link in a static site |
| `https://fonts.googleapis.com/css?family=Roboto:400,300,300italic,400italic,500,500italic,700,700italic,900,900italic` | same | same |
| `https://fonts.googleapis.com/css?family=Roboto+Slab:100,300,400,700` | same | same |

Confirmed **not used** on any of the 9 pages (CSS declares them, but no page has the matching class/attribute) — do not download:
- `public_gv/web/images/common/caret.png` (`style.css`, only applied to `<select>` elements — none exist on this site)
- `public_gv/web/images/common/bg_homeboxed.jpg` (`body.layout-boxed` — that body class is never used)
- `public_gv/web/images/shortcode/bg_header-transparent.jpg` (`.header-v5 #page-header` — that class is never used)
- `public_gv/web/images/shortcode/bg_testimonial.jpg`, `bg_clients.png`, `bg_countto.jpg`, `bg_service01.png`, `bg_workwithus.jpg`, `bg_portfolio02.jpg` (`.testimonials`/`.clients`/`.count_to` classes from `shortcode.css` — none of these classes appear anywhere; the real testimonial background is `clientes_recomiendanFjPTdbUZ.jpg`, see below)
- `public_gv/web/PIE.htc` (legacy IE CSS3 polyfill; also 404 in the archive)
- `public_gv/web/stylesheets/owl.video.play.png` (referenced by `owl.carousel.css`, but this specific file 404s in the archive — can't be recovered regardless)
- `public_gv/web/images/prettyPhoto/**` (all 5 skin folders: dark_rounded, dark_square, light_rounded, light_square, facebook) and `prettyPhoto.css`/`jquery.prettyPhoto.js` themselves — confirmed dead weight: loaded on every page, but no element anywhere has a `rel="prettyPhoto"` attribute, so the lightbox is never actually triggered
- `public_gv/web/assets/*` (arrows, bullets, gridtiles, shadows, timer — revolution-slider skin variants) and `public_gv/web/images/gradient/g30.png`/`g40.png`/`prebg.png` — all 404 in the CDX index regardless of whether the slider config would reference them, so unrecoverable either way

### Content images (page-specific, confirmed via `<img src>` / inline `background-image`)

| Archive source (raw) | Local target | Used by (confirmed) |
|---|---|---|
| `.../web/20231107032817im_/.../public_gv/uploads/slider_fondo_siGY.jpg` | `public_gv/uploads/slider_fondo_siGY.jpg` | Inicio — slider background image |
| `.../web/20231107032817im_/.../public_gv/uploads/compromiso_2HMwthPR.jpg` | `public_gv/uploads/compromiso_2HMwthPR.jpg` | Inicio — "Nuestro compromiso" |
| `.../web/20231107032817im_/.../public_gv/imagenes/home2.png` | `public_gv/imagenes/home2.png` | Inicio — "Nuestro compromiso" |
| `.../web/20231107032817im_/.../public_gv/web/images/firma-cl.png` | `public_gv/web/images/firma-cl.png` | Inicio — "Nuestro compromiso" (signature image) |
| `.../web/20231107032817im_/.../public_gv/imagenes/elegirnos1.png` | `public_gv/imagenes/elegirnos1.png` | Inicio + Nosotros — "¿Por qué elegirnos?" |
| `.../web/20231107032817im_/.../public_gv/imagenes/elegirnos2.png` | `public_gv/imagenes/elegirnos2.png` | Inicio + Nosotros — "¿Por qué elegirnos?" |
| `.../web/20231107032817im_/.../public_gv/imagenes/elegirnos3.png` | `public_gv/imagenes/elegirnos3.png` | Inicio + Nosotros — "¿Por qué elegirnos?" |
| `.../web/20231107032817im_/.../public_gv/imagenes/elegirnos4.png` | `public_gv/imagenes/elegirnos4.png` | Inicio + Nosotros — "¿Por qué elegirnos?" |
| `.../web/20231107032817im_/.../public_gv/uploads/clientes_recomiendanFjPTdbUZ.jpg` | `public_gv/uploads/clientes_recomiendanFjPTdbUZ.jpg` | Inicio only — testimonial section background |
| `.../web/20231107032817im_/.../public_gv/uploads/clientes_recomiendanDJn0X7oP.jpg` | `public_gv/uploads/clientes_recomiendanDJn0X7oP.jpg` | Inicio (testimonial photo) **and** Clientes (same file reused) |
| `.../web/20231107032817im_/.../public_gv/web/images/comilla_cliente.png` | `public_gv/web/images/comilla_cliente.png` | Inicio — testimonial quote icon (opening) |
| `.../web/20231107032817im_/.../public_gv/web/images/comilla_cliente_cerr.png` | `public_gv/web/images/comilla_cliente_cerr.png` | Inicio — testimonial quote icon (closing) |
| `.../web/20220519065352im_/.../public_gv/uploads/mision_sjU5MYPg.jpg` | `public_gv/uploads/mision_sjU5MYPg.jpg` | Nosotros — "Misión" banner |
| `.../web/20220519065352im_/.../public_gv/uploads/vision_dZ3plyBV.jpg` | `public_gv/uploads/vision_dZ3plyBV.jpg` | Nosotros — "Visión" banner |
| `.../web/20220519065352im_/.../public_gv/imagenes/check.jpg` | `public_gv/imagenes/check.jpg` | Nosotros — "Objetivos" bullet icon |
| `.../web/20180825150346im_/.../public_gv/uploads/servicios_8iSz_mudanza.jpg` | `public_gv/uploads/servicios_8iSz_mudanza.jpg` | Servicios (índice) — Mudanzas card thumbnail |
| `.../web/20180825150346im_/.../public_gv/uploads/servicios_TUwb_serv-aduana.jpg` | `public_gv/uploads/servicios_TUwb_serv-aduana.jpg` | Servicios (índice) — Aduana card thumbnail |
| `.../web/20180825150346im_/.../public_gv/uploads/servicios_H08p_serv-alquiler-vehiculos.jpg` | `public_gv/uploads/servicios_H08p_serv-alquiler-vehiculos.jpg` | Servicios (índice) — Alquiler de vehículos card thumbnail |
| `.../web/20180825150346im_/.../public_gv/uploads/servicios_d39S_serv-almacenyembalaje.jpg` | `public_gv/uploads/servicios_d39S_serv-almacenyembalaje.jpg` | Servicios (índice) — Alquiler de almacenes card thumbnail |
| `.../web/<ts>im_/.../public_gv/uploads/servicio_detalle.jpg` | `public_gv/uploads/servicio_detalle.jpg` | Shared inner-page banner on Mudanzas, Aduana, Alquiler de vehículos, Alquiler de almacenes **and** Clientes (5 pages, same file) |
| `.../web/<ts>im_/.../public_gv/imagenes/contactenos.png` | `public_gv/imagenes/contactenos.png` | Shared inner-page banner on Mudanzas, Aduana, Alquiler de vehículos, Alquiler de almacenes (confusingly **not** used on the actual Contáctenos page) |
| `.../web/20180825153344im_/.../public_gv/uploads/mision_pa17uQBd.jpg` | `public_gv/uploads/mision_pa17uQBd.jpg` | Contáctenos — inner-page banner (reuses a "mision"-named file, distinct from Nosotros's own Misión image) |
| `.../web/20180825153344im_/.../public_gv/uploads/llamenos_vQ5CmSIU.jpg` | `public_gv/uploads/llamenos_vQ5CmSIU.jpg` | Contáctenos — "Llámenos" block |

All rows above are **mapped only** — nothing downloaded yet, and every mapping was confirmed by reading the actual page source (`.extraction-raw/*.html`) and, for CSS-declared assets, by opening all 8 shared stylesheets and checking each `url(...)` against real classes/ids in the pages — nothing was inferred from filenames. Mapping is now complete; next step is Step 3 (download everything marked "confirmed used" above) and Step 4 (rewrite links) per AGENTS.md.

## Step 3 — Download (done)

All 62 confirmed-used files above were downloaded into `public_gv/...` at the project root, mirroring the original relative paths (7 CSS, 16 JS, 9 fonts, 7 shared nav/footer images, 23 content images — 0 failures, ~4.2 MB total). Skipped on purpose, per the "confirmed not used" list above: `prettyPhoto.css`/`jquery.prettyPhoto.js` + its 5 skin folders, the whole `public_gv/administrador/**` bundle, `html5shiv.js`/`respond.min.js` (IE shims), and every asset that 404s in the archive. Google Fonts stay as a live CDN link, not downloaded.

Next: Step 4 — rewrite the `web.archive.org/web/.../http://transportesjpgalvez.com/...` links in each page's HTML (cached in `.extraction-raw/*.html`) to point at these local `public_gv/...` paths, then save the result as each page's final local HTML file per the Step 1 table.

## Step 4 — Rewrite links & assemble pages (done)

All 9 pages were written to their final local paths from the Step 1 table (`index.html`, `nosotros/index.html`, `servicios/index.html`, `servicios/mudanzas/index.html`, `servicios/transporte-de-almacenes-de-aduana/index.html`, `servicios/alquiler-de-vehiculos/index.html`, `servicios/alquiler-de-almacenes/index.html`, `clientes/index.html`, `contactenos/index.html`), each derived from its cached raw HTML in `.extraction-raw/` with:
- All `web.archive.org/web/<ts>.../http://transportesjpgalvez.com/...` wrappers stripped, restoring real URLs.
- Internal page links rewritten to relative `index.html` paths (depth-aware: `../`, `../../`), asset links rewritten to relative `public_gv/...` paths — verified with `grep` afterward, zero leftover `web.archive.org`/`wayback` references.
- External links restored as real absolute URLs and left untouched: `https://www.facebook.com/transportejpgalvez/`, `http://facturacion.transportesjpgalvez.com/`, `http://transportesjpgalvez.com:2095/` (all three point to systems excluded from this project, per AGENTS.md — links kept, no page built for them).
- The Wayback toolbar/banner, its injected `<script>`/`<link>` tags, and the trailing archive.org attribution comments removed.
- The `public_gv/administrador/**` `<script>`/`<link>` tags and `prettyPhoto.css`/`jquery.prettyPhoto.js` removed (per the Step 2 "confirmed not used" findings) — including the 3 Clientes-only anomaly tags. **Correction (see AGENTS.md → "Known gaps"): the DataTables JS removed here was actually powering real client-side pagination on Clientes' `#example` table, not dead admin weight — that page now renders all 294 rows unpaginated as a result.**
- The "Extra Pages" footer widget (Blank Page/Maintenance Mode/Sidebars/Full Width) removed; the rest of the off-canvas mobile panel (search widget) kept.
- Inicio's and Contáctenos's real `enviar_contactenos()`/`enviar_contactenos_home()` AJAX wiring removed (dead endpoints); a `<!-- TODO(redesign): backend-dependent form, needs mailto/Formspree/EmailJS or similar -->` marker added above each quote/contact form (2 real forms + 4 broken "COTICE SU SERVICIO AHORA" forms on the service subpages) — the duplicate-field bug on those 4 forms was left exactly as captured, not fixed.

This completes the extraction. The `.extraction-raw/` cache folder (raw HTML + CSS + `*-urls.txt` dumps) has been deleted — nothing under the project root depends on it. No tech-stack decisions (SSG, shared partials, form service, etc.) were applied here; the 9 pages are still 9 independent static HTML files with duplicated header/footer markup, matching the "as-is" scope of this task.

**Known gaps carried into Phase 2** — see AGENTS.md → "Known gaps to improve in Phase 2" for the full, current list (Clientes table/pagination needing investigation, 4 broken `whodp.com`-hotlinked images, backend-dependent forms). Don't rely on the older note that used to be here — it under-described the Clientes issue.

