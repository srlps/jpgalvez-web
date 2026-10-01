import { collection, getDocs, orderBy, query } from "firebase/firestore/lite";
import { getBlob, ref } from "firebase/storage";
import JSZip from "jszip";
import { db, storage } from "./firebase";
import type { Cliente, Foto, Testimonio } from "../types";

function descargarBlob(nombreArchivo: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(url);
}

// Descarga un archivo de Storage y lo agrega al zip; si falla (borrado, red, etc.) no interrumpe
// el resto del respaldo, solo deja ese registro sin su imagen.
async function agregarMedia(zip: JSZip, carpeta: string, ruta: string | undefined): Promise<string | undefined> {
  if (!ruta) return undefined;
  try {
    const blob = await getBlob(ref(storage!, ruta));
    const nombre = ruta.split("/").pop()!;
    zip.file(`media/${carpeta}/${nombre}`, blob);
    return `media/${carpeta}/${nombre}`;
  } catch (error) {
    console.warn(`No se pudo descargar "${ruta}" para el respaldo`, error);
    return undefined;
  }
}

// Exporta clientes + testimonios + galería (datos y fotos) en un único .zip: JSON legible en la
// raíz y las imágenes referenciadas bajo media/<coleccion>/. Es solo de respaldo/consulta, no hay
// una función de importación equivalente para restaurarlo automáticamente.
export async function exportarTodoConMultimedia(alProgresar?: (mensaje: string) => void): Promise<void> {
  const zip = new JSZip();

  alProgresar?.("Leyendo clientes…");
  const clientesSnap = await getDocs(query(collection(db!, "clientes"), orderBy("nombre")));
  const clientes = clientesSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Cliente, "id">) }));
  const nombrePorClienteId = new Map(clientes.map((c) => [c.id, c.nombre]));

  const clientesJson = [];
  for (const c of clientes) {
    alProgresar?.(`Descargando logo de "${c.nombre}"…`);
    const logo = await agregarMedia(zip, "clientes", c.logoPath);
    clientesJson.push({ id: c.id, nombre: c.nombre, tipo: c.tipo ?? "empresa", destacado: c.destacado, publicado: c.publicado, logo: logo ?? null });
  }
  zip.file("clientes.json", JSON.stringify(clientesJson, null, 2));

  alProgresar?.("Leyendo testimonios…");
  const testimoniosSnap = await getDocs(query(collection(db!, "testimonios"), orderBy("orden")));
  const testimoniosJson = testimoniosSnap.docs.map((d) => {
    const t = d.data() as Omit<Testimonio, "id">;
    return {
      id: d.id,
      autor: t.autor,
      cargo: t.cargo ?? null,
      clienteNombre: nombrePorClienteId.get(t.clienteId) ?? null,
      texto: t.texto,
      orden: t.orden,
      publicado: t.publicado,
    };
  });
  zip.file("testimonios.json", JSON.stringify(testimoniosJson, null, 2));

  alProgresar?.("Leyendo galería…");
  const galeriaSnap = await getDocs(query(collection(db!, "galeria"), orderBy("creadoEn", "desc")));
  const fotos = galeriaSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Foto, "id">) }));
  const galeriaJson = [];
  for (const f of fotos) {
    alProgresar?.(`Descargando foto "${f.titulo}"…`);
    const foto = await agregarMedia(zip, "galeria", f.path);
    galeriaJson.push({
      id: f.id,
      titulo: f.titulo,
      descripcion: f.descripcion ?? null,
      categoria: f.categoria,
      foto: foto ?? null,
      ancho: f.ancho,
      alto: f.alto,
      publicado: f.publicado,
    });
  }
  zip.file("galeria.json", JSON.stringify(galeriaJson, null, 2));

  zip.file(
    "leeme.txt",
    "Respaldo de Clientes, Testimonios y Galeria - Transportes JeanPierre\r\n\r\n" +
      "clientes.json / testimonios.json / galeria.json: los datos de cada coleccion.\r\n" +
      "media/: las imagenes que referencian esos JSON (campo 'logo' o 'foto').\r\n\r\n" +
      "Este .zip es solo de respaldo y consulta; no existe una funcion para reimportarlo.\r\n",
  );

  alProgresar?.("Generando archivo ZIP…");
  const blob = await zip.generateAsync({ type: "blob" });
  const fecha = new Date().toISOString().slice(0, 10);
  descargarBlob(`respaldo-transportes-jpgalvez-${fecha}.zip`, blob);
  alProgresar?.("");
}
