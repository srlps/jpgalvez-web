import type { APIRoute } from "astro";

// Se genera desde `site` (astro.config.mjs) para que el dominio viva en un solo lugar.
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL("sitemap-index.xml", site).href}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
