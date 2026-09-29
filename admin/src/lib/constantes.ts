// Debe coincidir con isValidCategoria() en ../../../firestore.rules y con categoriasGaleria en
// el proyecto de la landing (../../../src/data/sitio.ts). Son 2 proyectos npm separados: no hay
// forma de importar el archivo compartido, así que esta lista se mantiene a mano en ambos.
export const categoriasGaleria = [
  { valor: "flota", label: "Flota" },
  { valor: "mudanzas", label: "Mudanzas" },
  { valor: "aduana", label: "Aduanas" },
  { valor: "almacenes", label: "Almacenes" },
  { valor: "equipo", label: "Nuestro equipo" },
  { valor: "otros", label: "Otros" },
] as const;

// La consola vive en su propio subdominio: las imágenes del sitio principal (assets estáticos,
// no subidas por la consola) deben referenciarse con URL absoluta, no con ruta relativa "/images/...".
export const SITIO_URL = "https://transportesjpgalvez.com";
