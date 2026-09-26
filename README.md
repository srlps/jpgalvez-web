# transportesjpgalvez.com — reconstrucción estática

Reconstrucción estática de `transportesjpgalvez.com` (Transportes e Inversiones Jeanpierre S.A.C.), reconstruida a partir de su [captura de Wayback Machine](https://web.archive.org/web/20231107032817/http://transportesjpgalvez.com/) tras la pérdida del dominio/código fuente original. Ver [AGENTS.md](AGENTS.md) para el contexto completo del proyecto, su alcance y los pendientes conocidos, y [EXTRACTION.md](EXTRACTION.md) para el detalle de cómo se extrajo el contenido original del archivo.

## Stack

Construido con [Astro](https://astro.build/) como generador de sitios estáticos — compila a HTML/CSS plano sin framework de JS en el cliente y sin backend.

## Estructura del proyecto

```
src/
  layouts/BaseLayout.astro   # <head>, nav, buscador off-canvas, footer, scripts del tema
  components/                # partials compartidos de header/footer/nav/formularios
  pages/                      # un archivo por ruta (routing por archivos de Astro)
  data/clientes.json          # listado de 294 clientes de la página Clientes
public/
  public_gv/                  # assets estáticos (imágenes, CSS, JS), servidos tal cual en /public_gv/...
dist/                         # sitio estático generado — ignorado por git, nunca editar directamente
```

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
