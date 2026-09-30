# transportesjpgalvez.com — reconstrucción estática

Reconstrucción estática de `transportesjpgalvez.com` (Transportes e Inversiones Jeanpierre S.A.C.), reconstruida a partir de su [captura de Wayback Machine](https://web.archive.org/web/20231107032817/http://transportesjpgalvez.com/) tras la pérdida del dominio/código fuente original. Ver [AGENTS.md](AGENTS.md) para el contexto completo del proyecto, su alcance y los pendientes conocidos, y [EXTRACTION.md](EXTRACTION.md) para el detalle de cómo se extrajo el contenido original del archivo.

Para el rediseño (Fase 2), [GUIA-DE-ESTILO.md](GUIA-DE-ESTILO.md) define colores, tipografía, espaciado y componentes alineados con la identidad de la empresa (sin rebranding: se conservan logo, nombre y colores).

## Stack

Construido con [Astro](https://astro.build/) como generador de sitios estáticos — compila a HTML/CSS plano sin framework de JS en el cliente. El sitio actual no tiene backend; la vista previa del rediseño (`/new/`) usa Firebase (Firestore, Storage y Auth) para clientes, testimonios y galería. La consola admin es un **proyecto npm separado** (`admin/`, React + Vite), pensado para desplegarse en su propio subdominio — ver [Consola admin (proyecto separado)](#consola-admin-proyecto-separado) más abajo.

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
  pages/new/                  # vista previa del rediseño
  styles/site.css             # hoja de estilos única del sitio
  styles/new.css              # estilos del rediseño (tokens de GUIA-DE-ESTILO.md)
  scripts/site.js             # comportamiento del header, menú móvil y "volver arriba"
  scripts/new/                # JS del rediseño: menú, formularios, Firestore público, galería
  data/clientes.json          # listado de 360 clientes de la página Clientes (curado 2026-09-28: duplicados fusionados + cliente del testimonio agregado, ver AGENTS.md)
  data/sitio.ts               # datos de contacto, navegación y categorías de galería del rediseño
  data/servicios.ts           # textos de los 4 servicios y "¿Por qué elegirnos?" del rediseño

public/
  favicon.ico                 # ícono del sitio
  images/                     # imágenes del sitio original, organizadas por tipo (no por sección)
    logos/                    # logo de la empresa, firma, logos de clientes
    iconos/                   # íconos de navegación, comillas de testimonios, viñetas
    fondos/                   # imágenes usadas como background-image en site.css
    fotos/                    # fotografías de contenido embebidas con <img>
dist/                         # sitio estático generado — ignorado por git, nunca editar directamente

admin/                         # consola admin: proyecto npm separado (React + Vite + TS), ver más abajo

GUIA-DE-ESTILO.md             # guía de estilo del rediseño: paleta, tipografía, tokens CSS, componentes

firebase.json                 # config de Hosting (2 sitios: dist/ y admin/dist/), Firestore y Storage
.firebaserc                    # alias del proyecto Firebase (jpgalvez-7a5b3) y targets de Hosting
firestore.rules                # reglas de Firestore para /new/ y la consola admin (prototipo, sin desplegar)
firestore.indexes.json         # 3 índices compuestos que usan las consultas públicas
storage.rules                  # reglas de Storage para las imágenes de la consola admin (prototipo, sin desplegar)
.env.example                   # plantilla de la config web de Firebase para el sitio Astro (copiar como .env)
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

Sin configurar Firebase, las páginas muestran los datos estáticos actuales (`clientes.json` y el testimonio existente) y la galería aparece vacía.

### Activar Firebase para los datos de clientes/testimonios/galería

1. En Firebase console → Configuración del proyecto → Tus apps: registrar una **app web** (si no existe) y copiar su configuración.
2. Copiar `.env.example` como `.env` y completar los valores `PUBLIC_FIREBASE_*`.
3. Revisar las reglas y desplegarlas: `firebase deploy --only firestore:rules --dry-run`, luego `firebase deploy --only firestore,storage` (ver [Despliegue en Firebase](#despliegue-en-firebase)).

La carga de datos (Authentication, alta de clientes/testimonios/galería) se hace desde la consola admin — ver la sección siguiente.

## Consola admin (proyecto separado)

La consola admin vive en `admin/`, un **segundo proyecto npm independiente** (React + Vite + TypeScript), pensado para desplegarse en un subdominio propio (`admin.transportesjpgalvez.com`) separado de la landing. No es parte del build de Astro ni se sirve desde `/new/admin/`.

| Comando (desde `admin/`, o el atajo equivalente desde la raíz) | Acción |
|---|---|
| `npm install` / `npm run admin:install` | Instala las dependencias del proyecto admin (solo la primera vez) |
| `npm run dev` / `npm run admin:dev` | Levanta el servidor local de la consola admin con recarga en vivo |
| `npm run build` / `npm run admin:build` | Genera el SPA estático en `admin/dist/` |
| `npm run preview` (desde `admin/`) | Sirve localmente el `admin/dist/` ya generado |

1. Copiar `admin/.env.example` como `admin/.env` y completar los valores `VITE_FIREBASE_*` (misma config de Firebase que el `.env` de la raíz, mismo proyecto).
2. Authentication → Método de acceso: habilitar **Correo electrónico/contraseña** y crear el usuario del dueño.
3. Firestore → crear la colección `admins` con un documento cuyo ID sea el **UID** de ese usuario (sin campos).
4. `npm run admin:install` y luego `npm run admin:dev` (o desplegar `admin/dist/` una vez construido).
5. Entrar a la consola y usar «Importar» para cargar los 360 clientes y el testimonio actuales.

## Despliegue en Firebase

Requiere [Firebase CLI](https://firebase.google.com/docs/cli) y haber iniciado sesión (`firebase login`). El proyecto por defecto (`jpgalvez-7a5b3`) ya está fijado en `.firebaserc`; `firebase use` muestra cuál está activo.

| Componente | Comando | Qué despliega |
|---|---|---|
| Hosting (landing) | `npm run build` y luego `firebase deploy --only hosting:web` | El sitio generado en `dist/`. El `.env` debe existir **antes** del build: la config de Firebase se incrusta en el JS |
| Hosting (consola admin) | `npm run admin:build` y luego `firebase deploy --only hosting:admin` | El SPA generado en `admin/dist/`. Requiere `admin/.env` antes del build. La primera vez, el dueño debe correr `firebase hosting:sites:create landing-admin` y `firebase target:apply hosting admin landing-admin` |
| Hosting (ambos) | `npm run build && npm run admin:build` y luego `firebase deploy --only hosting` | `dist/` y `admin/dist/` a sus 2 sitios |
| Hosting (vista previa) | `firebase hosting:channel:deploy <nombre>` | Una URL temporal para revisar el build sin tocar el sitio publicado (tras `npm run build`) |
| Reglas de Firestore | `firebase deploy --only firestore:rules` | `firestore.rules` |
| Índices de Firestore | `firebase deploy --only firestore:indexes` | `firestore.indexes.json` (pueden tardar unos minutos en construirse) |
| Firestore completo | `firebase deploy --only firestore` | Reglas + índices |
| Reglas de Storage | `firebase deploy --only storage` | `storage.rules` (el primer despliegue pide permiso para que Storage lea Firestore: aceptarlo) |
| Todo | `npm run build` y luego `firebase deploy` | Hosting, Firestore y Storage |

Agregar `--dry-run` a cualquier `firebase deploy` valida la configuración y las reglas sin publicar nada (por ejemplo `firebase deploy --only firestore:rules --dry-run`).

## Pendientes conocidos

Ver AGENTS.md → "Known gaps to improve in Phase 2" para el listado actual (paginación del listado de Clientes, algunos enlaces de imágenes rotos de terceros, y los formularios de cotización/contacto dependientes del backend, dejados como placeholders estáticos).
