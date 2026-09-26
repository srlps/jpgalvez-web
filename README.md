# transportesjpgalvez.com — static reconstruction

Static reconstruction of `transportesjpgalvez.com` (Transportes e Inversiones Jeanpierre S.A.C.), rebuilt from its [Wayback Machine capture](https://web.archive.org/web/20231107032817/http://transportesjpgalvez.com/) after the original domain/source was lost. See [AGENTS.md](AGENTS.md) for full project background, scope and known gaps, and [EXTRACTION.md](EXTRACTION.md) for how the raw content was pulled from the archive.

## Stack

Built with [Astro](https://astro.build/) as a static-site generator — compiles to plain HTML/CSS with no client-side JS framework and no backend.

## Project structure

```
src/
  layouts/BaseLayout.astro   # <head>, nav, off-canvas search, footer, theme scripts
  components/                # shared header/footer/nav/form partials
  pages/                      # one file per route (Astro file-based routing)
  data/clientes.json          # Clientes page's 294-row client list
public/
  public_gv/                  # static assets (images, CSS, JS), served as-is at /public_gv/...
dist/                         # generated static site — gitignored, never edit directly
```

## Commands

Run from the project root:

| Command | Action |
|---|---|
| `npm install` | Install dependencies (first time only) |
| `npm run dev` | Start local dev server with live reload at http://localhost:4321 |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Serve the built `dist/` locally, to sanity-check the actual build output |

## Known gaps

See AGENTS.md → "Known gaps to improve in Phase 2" for the current list (Clientes list pagination, a few broken third-party image links, and the backend-dependent quote/contact forms left as static placeholders).
