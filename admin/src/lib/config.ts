import { SITIO_URL } from "./constantes";

// Config web de Firebase (pública por diseño; la seguridad la dan firestore.rules/storage.rules). Ver .env.example.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigurado = Object.values(firebaseConfig).every(Boolean);

// A diferencia de la landing (mismo origen que /images/...), la consola vive en un subdominio
// propio: solo se aceptan imágenes de Firebase Storage o URLs absolutas del sitio principal.
export function esUrlImagenSegura(url?: string): url is string {
  return typeof url === "string" && (url.startsWith("https://firebasestorage.googleapis.com/") || url.startsWith(`${SITIO_URL}/images/`));
}
