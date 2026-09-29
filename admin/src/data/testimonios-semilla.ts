import { SITIO_URL } from "../lib/constantes";

// Semilla que la consola admin importa a Firestore cuando la colección "testimonios" está vacía.
// Copia de ../../../src/data/testimonios-iniciales.ts, con logoUrl absoluta (la consola vive en
// un subdominio propio: una ruta relativa "/images/..." resolvería contra el subdominio, no contra
// el sitio principal).
export const testimoniosSemilla = [
  {
    autor: "Marcos Montañez",
    cargo: "Gerente General",
    empresa: "MM Consultores",
    texto:
      "Excelente servicio, puntual y responsable. Transportes JeanPierre es una empresa que apunta a ser líder en el mercado y su atención así lo demuestra. ¡Totalmente recomendado!",
    logoUrl: `${SITIO_URL}/images/logos/logo-mm-consultores.jpg`,
    orden: 1,
  },
];
