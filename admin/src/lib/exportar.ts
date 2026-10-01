import { collection, getDocs, orderBy, query } from "firebase/firestore/lite";
import { db } from "./firebase";
import type { Cliente, Foto, Testimonio } from "../types";

function descargarBlob(nombreArchivo: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(url);
}

// Exporta clientes + testimonios + galería en un único .json, con la URL de cada imagen (no
// descarga los archivos: eso exigiría CORS en el bucket). Solo respaldo/consulta, sin reimportación.
export async function exportarTodo(alProgresar?: (mensaje: string) => void): Promise<void> {
  alProgresar?.("Leyendo clientes…");
  const clientesSnap = await getDocs(query(collection(db!, "clientes"), orderBy("nombre")));
  const clientes = clientesSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Cliente, "id">) }));
  const nombrePorClienteId = new Map(clientes.map((c) => [c.id, c.nombre]));

  alProgresar?.("Leyendo testimonios…");
  const testimoniosSnap = await getDocs(query(collection(db!, "testimonios"), orderBy("orden")));
  const testimonios = testimoniosSnap.docs.map((d) => {
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

  alProgresar?.("Leyendo galería…");
  const galeriaSnap = await getDocs(query(collection(db!, "galeria"), orderBy("creadoEn", "desc")));
  const galeria = galeriaSnap.docs.map((d) => {
    const f = d.data() as Omit<Foto, "id">;
    return {
      id: d.id,
      titulo: f.titulo,
      descripcion: f.descripcion ?? null,
      categoria: f.categoria,
      url: f.url,
      ancho: f.ancho,
      alto: f.alto,
      publicado: f.publicado,
    };
  });

  const datos = {
    exportadoEn: new Date().toISOString(),
    clientes: clientes.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      tipo: c.tipo ?? "empresa",
      destacado: c.destacado,
      publicado: c.publicado,
      logoUrl: c.logoUrl ?? null,
    })),
    testimonios,
    galeria,
  };

  const fecha = new Date().toISOString().slice(0, 10);
  descargarBlob(`respaldo-transportes-jpgalvez-${fecha}.json`, new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" }));
  alProgresar?.("");
}
