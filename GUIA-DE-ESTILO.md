# Guía de estilo — Transportes JeanPierre

Base visual para el rediseño (Fase 2). Todo lo que se diseñe o implemente en el sitio debe partir de este documento.

**Regla del dueño (no negociable): modernizar sin rebranding.** No se cambian el logo, el nombre de la marca ni los colores. Lo que sí cambia es *cómo* se usan: jerarquía, espaciado, tipografía más legible, componentes y organización de la información.

Todos los valores de este documento salen del logo (`public/images/logos/logo.png`, muestreado píxel a píxel) o del CSS actual del sitio reconstruido (`src/styles/site.css`). No se inventó ningún color nuevo.

---

## 1. Marca

| Elemento | Valor |
|---|---|
| Razón social | Transportes e Inversiones Jeanpierre S.A.C. |
| Nombre comercial (logo) | **JEANPIERRE** — "Transportes, cargo y mudanzas" |
| Nombre usado en el sitio | Transportes JeanPierre |
| Logo | `public/images/logos/logo.png` (480×189, PNG transparente) |
| Firma | `public/images/logos/firma.png` (blanca, sobre fondo oscuro) |
| Favicon | `public/favicon.ico` |

### Uso del logo

El logo tiene el texto **"JEANPIERRE" en blanco** y el lema en rojo, sobre un círculo cian con un camión gris. Por eso:

- **Solo va sobre fondos oscuros**: azul marino (`--color-azul`, preferido) o gris carbón (`--gris-900`/`--gris-800`). Sobre blanco el nombre desaparece; sobre granate el lema rojo se pierde.
- No recolorear, no estirar, no rotar, no aplicar sombras, contornos ni filtros.
- No colocarlo directamente sobre fotografías; si hace falta, sobre una capa azul marino opaca.
- Espacio libre alrededor: como mínimo la altura de la letra "J" del nombre, por los cuatro lados.
- Tamaño mínimo: **140 px de ancho** en móvil, 220 px en escritorio. Por debajo de eso el lema deja de leerse.
- Texto alternativo: `alt="Transportes JeanPierre"`.

> ⚠️ **Detectado en el sitio actual** (corregir en el rediseño):
> - En `Header.astro` el `alt` del logo es `"Grupo Vargas"` (resto de la plantilla original).
> - En móvil (`≤768px`) `site.css` pone el header en blanco (`#masthead .wrapper { background: #fff }`) y el logo a 35 px de alto: el nombre blanco queda invisible y el lema ilegible.

---

## 2. Colores

### 2.1 Colores de marca

Los colores de la marca son **azul, granate y plata**: los mismos de la flota y los uniformes (confirmado por el dueño 2026-10-02). El plata no es un gris neutro más: debe percibirse como color de marca, por encima del blanco.

| Token | Hex | Origen | Uso |
|---|---|---|---|
| `--color-azul` | `#014171` | Header, bloque "¿Por qué elegirnos?" | Color institucional principal: header, footer superior, bandas de sección, títulos y enlaces sobre fondo claro |
| `--color-granate` | `#8F0616` | Botones, "Nuestro compromiso", cabeceras de página | Acción y énfasis: botones principales (CTA), bandas destacadas |
| `--color-plata` | `#BBBCBF` | Camión del logo, vehículos y uniformes | Acento sobre fondos oscuros (antetítulos, enlaces en hover, borde de los círculos de íconos), franjas bajo el header y sobre el footer. **Nunca como color de texto sobre blanco** |
| `--color-plata-medio` | `color-mix(plata 75%, blanco)` ≈ `#CECFD1` | Derivado del plata | Segundo tinte claro para alternar bandas claras contiguas (Nosotros tras Servicios, Galería tras Clientes) |
| `--color-plata-claro` | `color-mix(plata 40%, blanco)` ≈ `#E4E4E5` | Derivado del plata | **Fondo de todas las secciones claras y de la página.** Ningún fondo de sección es blanco; el blanco queda para tarjetas y campos |
| `--color-cian` | `#00B5E8` | Círculo del logo | Acentos puntuales que se mantienen por decisión del cliente: subrayado activo/hover del menú, métricas de la portada, año de fundación, borde y comilla de los testimonios, íconos y etiquetas de la sección Contacto, y el anillo de foco |
| `--color-rojo-logo` | `#E41319` | Lema del logo | **Reservado al logo.** No se usa en la interfaz para no competir con el granate |

`#004070` (bloque "Visítenos") es prácticamente idéntico a `#014171`: se unifica en `--color-azul`.

### 2.2 Neutros

Se consolidan los ~12 grises del tema original en una sola escala (todos ya existen en el sitio o en el logo):

| Token | Hex | Origen | Uso |
|---|---|---|---|
| `--gris-900` | `#2A2A2A` | Footer | Footer, fondos oscuros |
| `--gris-800` | `#303030` | Bloque de contacto, títulos (`#333`/`#323232`/`#303030` unificados) | Títulos sobre fondo claro, bandas oscuras |
| `--gris-700` | `#4C4C4C` | Bandas "Nuestros servicios" | Texto de párrafo sobre fondo claro, bandas carbón |
| `--gris-500` | `#737373` | Texto base actual | Texto secundario (fechas, notas, ayudas de formulario) |
| `--gris-400` | `#A2A2A2` | Texto del footer | Texto sobre `--gris-900` |
| `--gris-300` | `#BBBCBF` | Gris oscuro del camión del logo | Mismo valor que `--color-plata`. Bordes de inputs, separadores sobre fondo claro |
| `--gris-200` | `#D0D0D1` | Gris claro del camión del logo | Bordes suaves, tarjetas |
| `--gris-100` | `#E6E6E6` | Separadores del menú móvil | Divisores |
| `--gris-50` | `#F2F2F2` | Equivale al `rgba(0,0,0,.05)` de filas/inputs actuales | Fondos suaves dentro de tarjetas, filas de tabla |
| `--blanco` | `#FFFFFF` | — | Fondo base, texto sobre fondos oscuros |

### 2.3 Colores funcionales

| Token | Hex | Uso |
|---|---|---|
| `--color-error` | `#D9534F` | Errores de validación (ya usado en los formularios). Siempre acompañado de un mensaje de texto, nunca solo el color |

### 2.4 Estados (hover/activo)

No se agregan tonos nuevos: los estados se derivan oscureciendo el mismo color con `color-mix()`:

```css
--color-granate-hover: color-mix(in srgb, var(--color-granate) 82%, #000);
--color-azul-hover:    color-mix(in srgb, var(--color-azul) 82%, #000);
```

Se abandona el hover gris (`#545454`) de los botones del tema original.

### 2.5 Contraste (WCAG 2.1)

| Combinación | Contraste aprox. | Resultado |
|---|---|---|
| Blanco sobre `--color-azul` | 10.5 : 1 | ✅ Cualquier texto |
| Blanco sobre `--color-granate` | 9.5 : 1 | ✅ Cualquier texto |
| Blanco sobre `--gris-700` | 8.6 : 1 | ✅ Cualquier texto |
| `--gris-700` sobre blanco | 8.6 : 1 | ✅ Texto de párrafo |
| `--gris-500` sobre blanco | 4.7 : 1 | ⚠️ Justo AA — solo texto secundario, nunca párrafos largos |
| `--gris-400` sobre `--gris-900` | 5.6 : 1 | ✅ |
| `--color-plata` sobre `--color-azul` | 5.5 : 1 | ✅ Antetítulos, cifras, íconos, menú activo |
| `--color-plata` sobre `--gris-800` | 6.6 : 1 | ✅ |
| `--gris-700` sobre `--color-plata-claro` | 6.6 : 1 | ✅ Texto de párrafo en bandas claras |
| `--color-plata` sobre blanco | 1.9 : 1 | ❌ Nunca texto; solo bordes y decoración |
| `--color-cian` sobre `--gris-900` | 6.0 : 1 | ✅ |
| `--color-cian` sobre `--color-azul` | 4.4 : 1 | ⚠️ Solo texto grande (≥24 px) o elementos decorativos |
| `--color-cian` sobre blanco | 2.4 : 1 | ❌ Nunca texto; solo decoración |
| `#156E85` (hover/activo del menú actual) sobre `--color-azul` | 1.8 : 1 | ❌ Por eso se reemplaza (ver 6.2) |

---

## 3. Tipografía

Se conservan las dos familias del sitio original: son parte de la identidad.

| Rol | Familia | Pesos | Uso |
|---|---|---|---|
| Display | **Fjalla One** | 400 (única disponible) | Títulos, menú, botones, cifras destacadas |
| Texto | **Open Sans** | 300, 400, 700 (+ itálicas 400/700) | Párrafos, formularios, tablas, footer |

Reglas:

- Fjalla One **nunca en negrita ni itálica** (no existen; el navegador las falsearía): `font-synthesis: none`.
- Fjalla One en **mayúsculas** para menú, botones y títulos de página (ya es así en el original); en títulos de sección puede ir en tipo oración.
- Open Sans 300 solo a partir de 18 px (el original usaba peso 100, que no está cargado y caía a 300).
- **Nada de texto justificado** (`text-align: justify`) — genera "ríos" de espacio. Todo alineado a la izquierda; centrado solo en títulos cortos y bloques de 1–2 líneas.
- Largo de línea máximo en párrafos: `65ch`.

### Escala (base 16 px, fluida)

El original usaba 14 px de base; se sube a 16 px por legibilidad.

| Token | Tamaño | Familia | Interlineado | Uso |
|---|---|---|---|---|
| `--fs-display` | `clamp(2.5rem, 1.6rem + 3.5vw, 4rem)` | Fjalla One | 1.05 | Titular del banner de Inicio |
| `--fs-h1` | `clamp(2rem, 1.5rem + 2vw, 3rem)` | Fjalla One | 1.1 | Título de página |
| `--fs-h2` | `clamp(1.75rem, 1.4rem + 1.4vw, 2.25rem)` | Fjalla One | 1.15 | Título de sección |
| `--fs-h3` | `1.5rem` | Fjalla One | 1.2 | Título de tarjeta |
| `--fs-h4` | `1.25rem` | Fjalla One | 1.25 | Subtítulo |
| `--fs-lead` | `1.25rem` | Open Sans 300 | 1.6 | Párrafo introductorio de sección |
| `--fs-body` | `1rem` | Open Sans 400 | 1.65 | Texto general |
| `--fs-small` | `0.875rem` | Open Sans 400 | 1.5 | Notas, ayudas, pie |
| `--fs-overline` | `0.8125rem` | Open Sans 700, mayúsculas, `letter-spacing: .12em` | 1.4 | Antetítulo sobre un H2 ("NUESTROS SERVICIOS") |

---

## 4. Espaciado, rejilla y forma

### Espaciado (base 4 px)

`--sp-1: 4px` · `--sp-2: 8px` · `--sp-3: 12px` · `--sp-4: 16px` · `--sp-5: 24px` · `--sp-6: 32px` · `--sp-7: 48px` · `--sp-8: 64px` · `--sp-9: 96px`

- Padding vertical de sección: `--sp-seccion: clamp(2.5rem, 1.5rem + 3.5vw, 4.5rem)` (compactado el 2026-10-02 para acortar el scroll hasta el formulario).
- Separación entre tarjetas de una rejilla: `--sp-5` en móvil, `--sp-6` en escritorio.

### Rejilla

- Ancho máximo de contenido: **1170 px** (el mismo `.container` del original), con `padding-inline: 1rem` (móvil) / `1.5rem` (≥768 px).
- Diseño **mobile-first**; puntos de corte conservados del original: `768px`, `992px`, `1200px`.
- Se reemplazan los floats de Bootstrap 3 por CSS Grid / Flexbox.

### Bordes y sombras

| Token | Valor | Uso |
|---|---|---|
| `--radio-sm` | `4px` | Botones, inputs (el original usaba 3px) |
| `--radio-md` | `8px` | Tarjetas, imágenes de contenido |
| `--radio-circulo` | `50%` | Contenedores de íconos (ver 6.5) |
| `--sombra-sm` | `0 1px 2px rgb(0 0 0 / .08)` | Inputs, elementos en reposo |
| `--sombra-md` | `0 4px 12px rgb(1 65 113 / .12)` | Tarjetas, header fijo |
| `--sombra-lg` | `0 12px 32px rgb(1 65 113 / .16)` | Tarjeta en hover, menú desplegado |

Las sombras usan el azul de marca con baja opacidad en vez de gris puro.

### Movimiento

- Transiciones de 150–250 ms, `ease-out`. Solo `color`, `background-color`, `border-color`, `box-shadow`, `transform`, `opacity` (nunca `all`).
- Respetar `prefers-reduced-motion: reduce` (desactivar desplazamientos y animaciones).

---

## 5. Lenguaje visual

- **Bandas de color a ancho completo**: es el rasgo más reconocible del sitio original (granate → carbón → azul). Se mantiene, pero:
  - Las bandas claras usan `--color-plata-claro` o `--color-plata-medio` (nunca blanco); no encadenar más de dos bandas oscuras seguidas.
  - Dos secciones principales contiguas (las del menú) nunca comparten fondo. Orden actual: Servicios `plata-claro` → Nosotros (`plata-medio`, granate, azul) → Clientes `plata-claro` → Galería `plata-medio` → Contacto `gris-800`. Las subsecciones sí pueden repetir color.
  - Cada banda oscura usa un solo color de marca plano (sin degradados entre granate y azul).
- **Plata como tercer color de marca**: es el fondo de toda la página (plata claro) y el acento de antetítulos y círculos sobre las bandas oscuras. Una franja plata de 3 px bajo el header y sobre el footer recuerda la franja de los vehículos. El cian se mantiene solo en los acentos listados en 2.1.
- **El círculo** del logo es el motivo gráfico recurrente: contenedores circulares para íconos (como ya hace "¿Por qué elegirnos?"), avatares de testimonios, viñetas.
- **Fotografía**: fotos reales de la flota, el personal y los almacenes; nada de bancos de imágenes genéricos. Proporciones fijas (`16/9` en banners y tarjetas) con `object-fit: cover` centrado y `loading="lazy"` salvo la primera imagen visible. Nunca recortar una foto para esconder texto incrustado: se usa la versión de la imagen sin texto.
- **Texto sobre foto**: siempre con una capa azul (`linear-gradient(rgb(1 65 113 / .85), rgb(1 65 113 / .45))`) para garantizar contraste.
- **Contenido en texto real, no en imágenes**: títulos, listas y datos que hoy están incrustados en imágenes pasan a HTML (pendiente de confirmar con el dueño, ver AGENTS.md).

---

## 6. Componentes

### 6.1 Botones

| Variante | Fondo | Texto | Borde | Hover |
|---|---|---|---|---|
| Principal (CTA) | `--color-granate` | blanco | — | `--color-granate-hover` |
| Secundario (fondo claro) | transparente | `--color-azul` | 2px `--color-azul` | fondo `--color-azul`, texto blanco |
| Sobre fondo oscuro | transparente | blanco | 2px blanco | fondo blanco, texto `--color-azul` |

- Fjalla One, mayúsculas, `letter-spacing: .04em`, alto mínimo 48 px, padding horizontal `--sp-6`, `--radio-sm`.
- Un solo botón principal (granate) por bloque visible: es la acción que queremos ("Contacto", "Llamar", "Enviar").
- Cada destino tiene una sola puerta visible: nunca dos botones o enlaces a la vista que lleven al mismo lugar.
- Foco visible en todos: `outline: 3px solid var(--color-cian); outline-offset: 2px`.

### 6.2 Header y navegación

- Fondo `--color-azul` con franja plata inferior de 3 px, logo a la izquierda, menú a la derecha (como el original).
- Ítems en Fjalla One mayúsculas, blancos. **Activo/hover: línea inferior de 3 px `--color-cian`** y texto blanco (reemplaza el `#156E85` actual, que no se ve sobre azul).
- Botón de llamada/cotización (variante principal) a la derecha del menú en escritorio.
- Header fijo al hacer scroll más compacto (logo más chico, `--sombra-md`), sin cambiar de color.
- Móvil: el header **se mantiene azul** (no blanco) para que el logo se lea; menú hamburguesa blanco que despliega un panel azul a pantalla completa.

### 6.3 Enlaces

- En texto sobre fondo claro: `--color-azul`, subrayado (`text-underline-offset: 3px`); hover `--color-granate`.
- Sobre fondo oscuro: blanco subrayado; hover `--color-plata`.
- Se retira el `#156E85` (color de enlace del tema Konstruct; no aparece en el logo ni en ningún bloque de marca).

### 6.4 Tarjetas (servicios, testimonios)

- Fondo blanco, `--radio-md`, `--sombra-md`; en hover `--sombra-lg` + `translateY(-2px)`.
- Imagen arriba (`16/9`), título Fjalla One `--fs-h3` en `--gris-800`, texto `--gris-700`, enlace "Ver más" como botón secundario o enlace con flecha.
- Acento opcional: borde superior de 4 px en `--color-granate` (servicios) o `--color-cian` (testimonios).

### 6.5 Íconos

- Los íconos actuales (`public/images/iconos/elegirnos-*.png`) son PNG blancos con fondo azul incrustado. En el rediseño se reemplazan por **SVG de línea** (trazo 2 px, extremos redondeados) con **los mismos pictogramas** (camión, personal, reloj/puntualidad, escudo/seguridad), coloreados con `currentColor`.
- Se presentan dentro de un círculo: borde plata con ícono blanco sobre bandas oscuras, o granate/azul con ícono blanco sobre bandas claras.

### 6.6 Formularios

- Etiquetas visibles encima de cada campo (no solo *placeholder*).
- Inputs: fondo blanco, borde 1px `--gris-300`, `--radio-sm`, alto mínimo 48 px, texto `--fs-body`.
- Foco: borde `--color-azul` + anillo `0 0 0 3px rgb(0 181 232 / .35)` (cian).
- Error: borde `--color-error` + mensaje de texto debajo en `--fs-small` (la validación actual de `site.js` ya genera `.field-error`).
- Los formularios van sobre tarjeta blanca aunque la banda de fondo sea oscura.

### 6.7 Testimonios

- Comilla grande (Fjalla One o SVG) en `--color-cian`, cita en Open Sans itálica `--fs-lead`, nombre en Fjalla One y empresa/logo del cliente debajo.

### 6.8 Footer

- Fondo `--gris-900` con franja plata superior de 3 px (se conserva el mapa de fondo `footer-mapa.png` con baja opacidad), texto `--gris-400`, títulos blancos en Fjalla One.
- Columnas (3 en escritorio): marca y datos corporativos; "Legal y cumplimiento" + "Respaldo y cumplimiento" apilados; "Horario de atención" + "Síganos" apilados. En tablet la marca ocupa la columna izquierda y las otras dos se apilan a su derecha; en móvil todo se apila.
- Barra inferior con copyright y créditos, separada por un borde `rgb(255 255 255 / .1)`.

---

## 7. Tokens CSS

Bloque de referencia para el inicio de `src/styles/site.css` cuando se implemente el rediseño:

```css
:root {
  /* Marca */
  --color-azul: #014171;
  --color-granate: #8F0616;
  --color-cian: #00B5E8; /* acentos puntuales, ver 2.1 */
  --color-plata: #BBBCBF;
  --color-plata-claro: color-mix(in srgb, var(--color-plata) 40%, #fff);
  --color-plata-medio: color-mix(in srgb, var(--color-plata) 75%, #fff);
  --color-rojo-logo: #E41319; /* solo logo */
  --color-azul-hover: color-mix(in srgb, var(--color-azul) 82%, #000);
  --color-granate-hover: color-mix(in srgb, var(--color-granate) 82%, #000);

  /* Neutros */
  --gris-900: #2A2A2A;
  --gris-800: #303030;
  --gris-700: #4C4C4C;
  --gris-500: #737373;
  --gris-400: #A2A2A2;
  --gris-300: #BBBCBF;
  --gris-200: #D0D0D1;
  --gris-100: #E6E6E6;
  --gris-50: #F2F2F2;
  --blanco: #FFFFFF;

  /* Funcionales */
  --color-error: #D9534F;

  /* Tipografía */
  --font-display: "Fjalla One", "Arial Narrow", sans-serif;
  --font-texto: "Open Sans", system-ui, sans-serif;
  --fs-display: clamp(2.5rem, 1.6rem + 3.5vw, 4rem);
  --fs-h1: clamp(2rem, 1.5rem + 2vw, 3rem);
  --fs-h2: clamp(1.75rem, 1.4rem + 1.4vw, 2.25rem);
  --fs-h3: 1.5rem;
  --fs-h4: 1.25rem;
  --fs-lead: 1.25rem;
  --fs-body: 1rem;
  --fs-small: 0.875rem;
  --fs-overline: 0.8125rem;

  /* Espaciado */
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 24px;
  --sp-6: 32px;
  --sp-7: 48px;
  --sp-8: 64px;
  --sp-9: 96px;
  --sp-seccion: clamp(2.5rem, 1.5rem + 3.5vw, 4.5rem);
  --ancho-max: 1170px;

  /* Forma */
  --radio-sm: 4px;
  --radio-md: 8px;
  --radio-circulo: 50%;
  --sombra-sm: 0 1px 2px rgb(0 0 0 / .08);
  --sombra-md: 0 4px 12px rgb(1 65 113 / .12);
  --sombra-lg: 0 12px 32px rgb(1 65 113 / .16);

  /* Movimiento */
  --transicion: 200ms ease-out;
}
```

---

## 8. Qué NO hacer

- Cambiar, redibujar, recolorear o "modernizar" el logo, o usar otro nombre de marca.
- Introducir tonos nuevos (verdes, naranjas, morados, degradados de moda). Solo la paleta de la sección 2 y sus variantes oscurecidas para estados.
- Usar el rojo del logo (`#E41319`) o el cian como color de texto sobre blanco.
- Poner el logo sobre fondo blanco o granate.
- Usar otras tipografías, o Fjalla One en negrita/itálica.
- Justificar texto.
- Volver a meter texto dentro de imágenes.

---

## 9. Decisiones a confirmar con el dueño

Estas decisiones respetan la paleta, pero cambian cómo se usa un color existente:

1. Retirar el `#156E85` (azul verdoso de enlaces del tema) y usar el azul de marca para enlaces y el plata para los antetítulos sobre fondo oscuro (el menú activo sigue en cian).
2. Unificar `#004070` en `#014171`.
3. Subir el texto base de 14 px a 16 px y oscurecer el texto de párrafo de `#737373` a `#4C4C4C`.
4. Mantener el header azul también en móvil (hoy es blanco y oculta el nombre del logo).
5. **Decidido** (2026-09-29): excepción puntual a la regla de "no introducir tonos nuevos" — el botón flotante de WhatsApp usa el verde oficial de la marca (`#25D366`, token `--color-whatsapp`), porque es el ícono de un canal externo reconocible, no una marca nueva del sitio. El botón de WhatsApp del hero mantiene la paleta del sitio (variante `.btn--relleno` sobre `.btn--claro`), a propósito más discreto que "Llamar" pero visible (no un simple contorno transparente).
6. **Decidido** (2026-10-02): los colores de marca son **azul, granate y plata** (flota y uniformes). Al supervisor del rediseño la web le parecía "azul, rojo y blanco". Ajuste deliberadamente leve, sin cambiar la estructura: el plata reemplaza al cian en todos los acentos, las bandas claras pasan de `--gris-50` a `--color-plata-claro`, y se agregan franjas plata bajo el header y sobre el footer. Un primer intento más drástico (fondo de toda la página en plata, bandas de plata pura, contacto en azul) se descartó. Ajuste posterior del mismo día: **ningún fondo de sección es blanco** (toda la página usa `--color-plata-claro`; el cliente pidió compactar secciones para que compartan fila en escritorio, lo que reduce la necesidad de alternar colores), y el cian se conserva en menú, métricas, año de fundación, testimonios y Contacto.
