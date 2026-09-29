// Datos compartidos del rediseño (vive bajo /new/ hasta que el dueño lo apruebe).
export const BASE = "/new";

export const ruta = (path = "/") => `${BASE}${path}`;

export const empresa = {
  nombre: "Transportes JeanPierre",
  razonSocial: "Transportes e Inversiones Jeanpierre S.A.C.",
  lema: "Transportes, cargo y mudanzas",
  fundacion: 2006,
  direccion: {
    linea1: "Jr. Francisco Lazo Nro. 1956",
    linea2: "Lince, Lima — Perú",
  },
  // ⚠️ El sitio original muestra dos números de oficina distintos (Contáctenos: 265-7956, footer: 471-5162).
  oficinas: [
    { numero: "(01) 265-7956", tel: "+5112657956" },
    { numero: "(01) 471-5162", tel: "+5114715162" },
  ],
  // Antes etiquetados como Entel / RPM / RPC (ver AGENTS.md → "Outdated contact numbers").
  celulares: [
    { numero: "994 192 267", tel: "+51994192267" },
    { numero: "975 682 224", tel: "+51975682224" },
    { numero: "940 199 943", tel: "+51940199943" },
  ],
  // ⚠️ Por confirmar con el dueño: que este celular tenga WhatsApp.
  whatsapp: "51994192267",
  facebook: "https://www.facebook.com/transportejpgalvez/",
  mapaEmbed:
    "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1950.7082671415167!2d-77.0304703!3d-12.0836114!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c9a61a433dab%3A0xde659da5d642334a!2sTransportes%20E%20Inversiones%20Jeanpierre%20S.A.C.!5e0!3m2!1ses!2spe!4v1790458962143!5m2!1ses!2spe",
};

// Sitio de una sola página: todo el menú son secciones de Inicio. "Contacto" es el único acceso al formulario.
export const navegacion = [
  { href: ruta("/#servicios"), label: "Servicios" },
  { href: ruta("/#nosotros"), label: "Nosotros" },
  { href: ruta("/#clientes"), label: "Clientes" },
  { href: ruta("/#galeria"), label: "Galería" },
  { href: ruta("/#contacto"), label: "Contacto" },
];

// Mantener sincronizado con isValidGaleria() en firestore.rules.
export const categoriasGaleria = [
  { valor: "flota", label: "Flota" },
  { valor: "mudanzas", label: "Mudanzas" },
  { valor: "aduana", label: "Aduanas" },
  { valor: "almacenes", label: "Almacenes" },
  { valor: "equipo", label: "Nuestro equipo" },
  { valor: "otros", label: "Otros" },
] as const;
