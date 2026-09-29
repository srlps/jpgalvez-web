# transportesjpgalvez.com — reconstrucción estática

Reconstrucción estática de `transportesjpgalvez.com` (Transportes e Inversiones Jeanpierre S.A.C.), reconstruida a partir de su [captura de Wayback Machine](https://web.archive.org/web/20231107032817/http://transportesjpgalvez.com/) tras la pérdida del dominio/código fuente original. Ver [AGENTS.md](AGENTS.md) para el contexto completo del proyecto, su alcance y los pendientes conocidos, y [EXTRACTION.md](EXTRACTION.md) para el detalle de cómo se extrajo el contenido original del archivo.

Para el rediseño (Fase 2), [GUIA-DE-ESTILO.md](GUIA-DE-ESTILO.md) define colores, tipografía, espaciado y componentes alineados con la identidad de la empresa (sin rebranding: se conservan logo, nombre y colores).

## Stack

Construido con [Astro](https://astro.build/) como generador de sitios estáticos — compila a HTML/CSS plano sin framework de JS en el cliente. El sitio actual no tiene backend; la vista previa del rediseño (`/new/`) usa Firebase (Firestore, Storage y Auth) para clientes, testimonios, galería y la consola admin.

- **Estilos**: un único archivo propio, `src/styles/site.css`, que reemplaza a los 7 CSS del tema original (Bootstrap 3, Font Awesome, Owl Carousel, Revolution Slider, etc.). Astro lo minifica y lo publica como un solo `.css` en `dist/_astro/`.
- **JavaScript**: sin jQuery ni plugins. `src/scripts/site.js` (unas pocas líneas en JS nativo) cubre lo único que el tema realmente usaba: header fijo al hacer scroll, menú móvil y botón "volver arriba".
- **Fuentes**: Google Fonts (Fjalla One y Open Sans), solo con los pesos que se usan.

## Estructura del proyecto

```
src/
  layouts/BaseLayout.astro   # <head>, header, footer y carga de estilos/scripts
  layouts/NewLayout.astro    # layout del rediseño (/new/)
  components/                # partials compartidos de header/footer/nav/formularios
  components/new/            # componentes del rediseño
  pages/                      # un archivo por ruta (routing por archivos de Astro)
  pages/new/                  # vista previa del rediseño, incluida la consola admin (/new/admin/)
  styles/site.css             # hoja de estilos única del sitio
  styles/new.css              # estilos del rediseño (tokens de GUIA-DE-ESTILO.md)
  scripts/site.js             # comportamiento del header, menú móvil y "volver arriba"
  scripts/new/                # JS del rediseño: menú, formularios, Firestore público, galería, admin
  data/clientes.json          # listado de 360 clientes de la página Clientes (curado 2026-09-28: duplicados fusionados + cliente del testimonio agregado, ver AGENTS.md)
  data/sitio.ts               # datos de contacto, navegación y categorías de galería del rediseño
  data/servicios.ts           # textos de los 4 servicios y "¿Por qué elegirnos?" del rediseño
  data/testimonios-iniciales.ts # testimonio existente (semilla para Firestore)
public/
  favicon.ico                 # ícono del sitio
  images/                     # imágenes del sitio original, organizadas por tipo (no por sección)
    logos/                    # logo de la empresa, firma, logos de clientes
    iconos/                   # íconos de navegación, comillas de testimonios, viñetas
    fondos/                   # imágenes usadas como background-image en site.css
    fotos/                    # fotografías de contenido embebidas con <img>
dist/                         # sitio estático generado — ignorado por git, nunca editar directamente

GUIA-DE-ESTILO.md             # guía de estilo del rediseño: paleta, tipografía, tokens CSS, componentes

firebase.json                 # config de Hosting (sirve dist/), Firestore y Storage
.firebaserc                    # alias del proyecto Firebase (jpgalvez-7a5b3)
firestore.rules                # reglas de Firestore para /new/ (prototipo, sin desplegar)
firestore.indexes.json         # 3 índices compuestos que usan las consultas públicas
storage.rules                  # reglas de Storage para las imágenes de la consola admin (prototipo, sin desplegar)
.env.example                   # plantilla de la config web de Firebase (copiar como .env)
```

> ⚠️ Las reglas de Firestore y Storage ya están escritas para la consola admin, pero son un **prototipo sin desplegar**: revisarlas y desplegarlas antes de usar la consola en producción. Cloud Functions se probó y luego se descartó (el envío de correos sigue en Web3Forms). Ver AGENTS.md → "Firebase backend (Phase 2)".

## Comandos

Ejecutar desde la raíz del proyecto:

| Comando | Acción |
|---|---|
| `npm install` | Instala las dependencias (solo la primera vez) |
| `npm run dev` | Levanta el servidor local con recarga en vivo en http://localhost:4321 |
| `npm run build` | Genera el sitio estático en `dist/` |
| `npm run preview` | Sirve localmente el `dist/` ya generado, para verificar el build real |

## Rediseño (vista previa en `/new/`)

La propuesta de rediseño vive completa bajo `/new/` (por ejemplo `http://localhost:4321/new/`), sin tocar el sitio actual, para compararlos página por página. Está marcada `noindex` mientras sea vista previa.

El sitio público es **una sola página**: todo el menú lleva por scroll a secciones de Inicio (`/new/#servicios`, `#nosotros`, `#clientes`, `#galeria`, `#contacto`). Cada destino tiene un solo botón visible: «Contacto» del menú es el único acceso al formulario, y la portada ofrece llamar o escribir por WhatsApp.

| Ruta | Contenido |
|---|---|
| `/new/` | Portada · `#servicios` (acordeón con el detalle de cada servicio + bloque de minería) · `#nosotros` (historia, fundador, misión y visión, objetivos, compromiso, ¿por qué elegirnos?) · `#clientes` (cinta, testimonios, listado completo con buscador) · `#galeria` (filtros, visor, «ver más») · `#contacto` (teléfonos, WhatsApp, dirección, formulario, mapa) |
| `/new/admin/` | Consola admin: clientes, testimonios y galería — **nueva** |

Sin configurar Firebase, las páginas muestran los datos estáticos actuales (`clientes.json` y el testimonio existente) y la galería aparece vacía.

### Activar Firebase para la consola admin

1. En Firebase console → Configuración del proyecto → Tus apps: registrar una **app web** (si no existe) y copiar su configuración.
2. Copiar `.env.example` como `.env` y completar los valores `PUBLIC_FIREBASE_*`.
3. Authentication → Método de acceso: habilitar **Correo electrónico/contraseña** y crear el usuario del dueño.
4. Firestore → crear la colección `admins` con un documento cuyo ID sea el **UID** de ese usuario (sin campos).
5. Revisar las reglas y desplegarlas: `firebase deploy --only firestore:rules --dry-run`, luego `firebase deploy --only firestore,storage` (aceptar el permiso para que Storage lea Firestore).
6. Entrar a `/new/admin/` y usar «Importar» para cargar los 360 clientes y el testimonio actuales.

## Pendientes conocidos

Ver AGENTS.md → "Known gaps to improve in Phase 2" para el listado actual (paginación del listado de Clientes, algunos enlaces de imágenes rotos de terceros, y los formularios de cotización/contacto dependientes del backend, dejados como placeholders estáticos).
