import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proyecto npm independiente de la landing (Astro): se despliega en su propio Firebase Hosting site
// (subdominio admin.*), ver firebase.json (target "admin") y AGENTS.md.
export default defineConfig({
  plugins: [react()],
});
