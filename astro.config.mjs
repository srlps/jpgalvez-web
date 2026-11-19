import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://transportesjpgalvez.com",
  trailingSlash: "always",
  integrations: [sitemap()],
});
