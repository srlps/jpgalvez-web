import { deleteObject, getDownloadURL, ref, uploadBytesResumable, type FirebaseStorage } from "firebase/storage";

export interface ImagenPreparada {
  blob: Blob;
  ancho: number;
  alto: number;
  ext: "webp" | "jpg";
}

export async function prepararImagen(archivo: File, ladoMaximo: number): Promise<ImagenPreparada> {
  if (!archivo.type.startsWith("image/")) throw new Error(`"${archivo.name}" no es una imagen.`);
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext("2d")!;
  // Fondo blanco por si el navegador no codifica WebP y cae a JPEG (sin transparencia).
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, ancho, alto);
  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();
  const codificar = (tipo: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, tipo, 0.85));
  let blob = await codificar("image/webp");
  if (!blob || blob.type !== "image/webp") blob = await codificar("image/jpeg");
  if (!blob) throw new Error("No se pudo procesar la imagen.");
  return { blob, ancho, alto, ext: blob.type === "image/webp" ? "webp" : "jpg" };
}

export function subirArchivo(storage: FirebaseStorage, ruta: string, blob: Blob, alProgresar?: (p: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const tarea = uploadBytesResumable(ref(storage, ruta), blob, {
      contentType: blob.type,
      cacheControl: "public, max-age=31536000, immutable",
    });
    tarea.on(
      "state_changed",
      (snap) => alProgresar?.(snap.bytesTransferred / snap.totalBytes),
      reject,
      () => getDownloadURL(tarea.snapshot.ref).then(resolve, reject),
    );
  });
}

export async function eliminarArchivo(storage: FirebaseStorage, ruta?: string) {
  if (!ruta) return;
  try {
    await deleteObject(ref(storage, ruta));
  } catch (error) {
    if ((error as { code?: string } | undefined)?.code !== "storage/object-not-found") throw error;
  }
}

// Nombre único por subida: los archivos se cachean como inmutables.
export const rutaArchivo = (carpeta: string, id: string, ext: string) => `${carpeta}/${id}-${Date.now()}.${ext}`;
