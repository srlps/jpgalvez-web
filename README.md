# transportesjpgalvez.com — reconstrucción estática

Reconstrucción estática de `transportesjpgalvez.com` (Transportes e Inversiones Jeanpierre S.A.C.), reconstruida a partir de su [captura de Wayback Machine](https://web.archive.org/web/20231107032817/http://transportesjpgalvez.com/) tras la pérdida del dominio/código fuente original. Ver [AGENTS.md](AGENTS.md) para el contexto completo del proyecto, su alcance y los pendientes conocidos, y [EXTRACTION.md](EXTRACTION.md) para el detalle de cómo se extrajo el contenido original del archivo.

## Stack

Construido con [Astro](https://astro.build/) como generador de sitios estáticos — compila a HTML/CSS plano sin framework de JS en el cliente y sin backend.

- **Estilos**: un único archivo propio, `src/styles/site.css`, que reemplaza a los 7 CSS del tema original (Bootstrap 3, Font Awesome, Owl Carousel, Revolution Slider, etc.). Astro lo minifica y lo publica como un solo `.css` en `dist/_astro/`.
- **JavaScript**: sin jQuery ni plugins. `src/scripts/site.js` (unas pocas líneas en JS nativo) cubre lo único que el tema realmente usaba: header fijo al hacer scroll, menú móvil y botón "volver arriba".
- **Fuentes**: Google Fonts (Fjalla One y Open Sans), solo con los pesos que se usan.

## Estructura del proyecto

```
src/
  layouts/BaseLayout.astro   # <head>, header, footer y carga de estilos/scripts
  components/                # partials compartidos de header/footer/nav/formularios
  pages/                      # un archivo por ruta (routing por archivos de Astro)
  styles/site.css             # hoja de estilos única del sitio
  scripts/site.js             # comportamiento del header, menú móvil y "volver arriba"
  data/clientes.json          # listado de 294 clientes de la página Clientes
public/
  favicon.ico                 # ícono del sitio
  images/                     # imágenes del sitio original, organizadas por tipo (no por sección)
    logos/                    # logo de la empresa, firma, logos de clientes
    iconos/                   # íconos de navegación, comillas de testimonios, viñetas
    fondos/                   # imágenes usadas como background-image en site.css
    fotos/                    # fotografías de contenido embebidas con <img>
dist/                         # sitio estático generado — ignorado por git, nunca editar directamente

firebase.json                 # config de Hosting (sirve dist/), Firestore y Storage
.firebaserc                    # alias del proyecto Firebase (jpgalvez-7a5b3)
firestore.rules                # ⚠️ todavía la regla de prueba por defecto (abierta hasta 2026-10-28), no apta para producción
firestore.indexes.json         # índices de Firestore (vacío por ahora)
storage.rules                  # deniega todo por defecto — pendiente de reglas reales para el admin console
```

> ⚠️ El backend de Firebase (Fase 2) ya tiene `firebase.json`/`.firebaserc` completos, pero **las reglas de Firestore y Storage todavía son las de prueba/por defecto** — no desplegar a producción sin reescribirlas antes. Cloud Functions se probó y luego se descartó (el envío de correos sigue en Web3Forms). Ver AGENTS.md → "Firebase backend (Phase 2)" para el detalle.

## Comandos

Ejecutar desde la raíz del proyecto:

| Comando | Acción |
|---|---|
| `npm install` | Instala las dependencias (solo la primera vez) |
| `npm run dev` | Levanta el servidor local con recarga en vivo en http://localhost:4321 |
| `npm run build` | Genera el sitio estático en `dist/` |
| `npm run preview` | Sirve localmente el `dist/` ya generado, para verificar el build real |

## Pendientes conocidos

Ver AGENTS.md → "Known gaps to improve in Phase 2" para el listado actual (paginación del listado de Clientes, algunos enlaces de imágenes rotos de terceros, y los formularios de cotización/contacto dependientes del backend, dejados como placeholders estáticos).
