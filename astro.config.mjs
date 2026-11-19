import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // Dominio de producción: lo usan la URL canónica, el sitemap, robots.txt, Open Graph y los datos estructurados.
  site: "https://transporteseinversionesjeanpierre.com.pe",
  trailingSlash: "always",
  integrations: [sitemap()],
});
