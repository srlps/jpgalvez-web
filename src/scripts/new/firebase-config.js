// Config web de Firebase (pública por diseño; la seguridad la dan firestore.rules/storage.rules). Ver .env.example.
export const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigurado = Object.values(firebaseConfig).every(Boolean);

// Solo se aceptan imágenes de Firebase Storage o de los assets propios del sitio.
export function esUrlImagenSegura(url) {
  return typeof url === "string" && (url.startsWith("https://firebasestorage.googleapis.com/") || url.startsWith("/images/"));
}
