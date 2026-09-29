import { useEffect, useState, type FormEvent } from "react";
import {
  collection, deleteDoc, deleteField, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc,
} from "firebase/firestore/lite";
import { db, storage } from "../lib/firebase";
import { esUrlImagenSegura } from "../lib/config";
import { categoriasGaleria } from "../lib/constantes";
import { mensajeError } from "../lib/errores";
import { eliminarArchivo, prepararImagen, rutaArchivo, subirArchivo } from "../lib/imagenes";
import type { Foto } from "../types";

const coleccion = "galeria";
const tituloDesdeArchivo = (nombre: string) => nombre.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim().slice(0, 120) || "Foto";

interface Progreso {
  nombre: string;
  valor: number;
  estado: string;
}

export default function GaleriaPanel() {
  const [items, setItems] = useState<Foto[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState<Progreso[]>([]);

  async function cargar() {
    const snap = await getDocs(query(collection(db!, coleccion), orderBy("creadoEn", "desc")));
    setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Foto, "id">) })));
  }

  useEffect(() => {
    cargar();
  }, []);

  const publicadas = items.filter((f) => f.publicado).length;

  async function subirFoto(archivo: File, opciones: { titulo: string; descripcion: string; categoria: string; publicado: boolean }, alProgresar: (p: number) => void) {
    const referencia = doc(collection(db!, coleccion));
    const imagen = await prepararImagen(archivo, 1920);
    const ruta = rutaArchivo(coleccion, referencia.id, imagen.ext);
    const url = await subirArchivo(storage!, ruta, imagen.blob, alProgresar);
    try {
      await setDoc(referencia, {
        titulo: opciones.titulo || tituloDesdeArchivo(archivo.name),
        ...(opciones.descripcion ? { descripcion: opciones.descripcion } : {}),
        categoria: opciones.categoria,
        url,
        path: ruta,
        ancho: imagen.ancho,
        alto: imagen.alto,
        publicado: opciones.publicado,
        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp(),
      });
    } catch (error) {
      await eliminarArchivo(storage!, ruta).catch(() => {});
      throw error;
    }
  }

  async function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = evento.currentTarget;
    if (!form.reportValidity()) return;
    const datos = new FormData(form);
    const archivos = [...((form.elements.namedItem("archivos") as HTMLInputElement).files ?? [])];
    const opciones = {
      titulo: String(datos.get("titulo") ?? "").trim(),
      descripcion: String(datos.get("descripcion") ?? "").trim(),
      categoria: String(datos.get("categoria") ?? ""),
      publicado: datos.get("publicado") === "on",
    };
    setSubiendo(true);
    setProgreso(archivos.map((a) => ({ nombre: a.name, valor: 0, estado: "Subiendo…" })));

    for (let i = 0; i < archivos.length; i++) {
      try {
        await subirFoto(archivos[i], opciones, (p) => setProgreso((prev) => prev.map((item, idx) => (idx === i ? { ...item, valor: p } : item))));
        setProgreso((prev) => prev.map((item, idx) => (idx === i ? { ...item, valor: 1, estado: "Listo" } : item)));
      } catch (error) {
        console.error(error);
        setProgreso((prev) => prev.map((item, idx) => (idx === i ? { ...item, estado: mensajeError(error) } : item)));
      }
    }

    form.reset();
    setSubiendo(false);
    await cargar().catch((error) => alert(mensajeError(error)));
  }

  async function actualizarFoto(item: Foto, valores: { titulo: string; categoria: string; publicado: boolean; descripcion: string }) {
    await updateDoc(doc(db!, coleccion, item.id), {
      titulo: valores.titulo,
      categoria: valores.categoria,
      publicado: valores.publicado,
      descripcion: valores.descripcion || deleteField(),
      actualizadoEn: serverTimestamp(),
    });
    setItems((prev) => prev.map((f) => (f.id === item.id ? { ...f, ...valores, descripcion: valores.descripcion || undefined } : f)));
  }

  async function eliminar(item: Foto) {
    if (!confirm(`¿Eliminar "${item.titulo}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteDoc(doc(db!, coleccion, item.id));
      await eliminarArchivo(storage!, item.path).catch((error) => console.warn("No se pudo borrar el archivo", error));
      await cargar();
    } catch (error) {
      alert(mensajeError(error));
    }
  }

  return (
    <>
      <form className="tarjeta form admin-form admin-form--ancho" onSubmit={alEnviar} noValidate>
        <h2 className="tarjeta__titulo">Subir fotos</h2>
        <div className="form__grid">
          <div className="campo campo--completo">
            <label htmlFor="galeria-archivos">Fotos (puede elegir varias)</label>
            <input type="file" id="galeria-archivos" name="archivos" accept="image/*" multiple required />
          </div>
          <div className="campo">
            <label htmlFor="galeria-categoria">Categoría</label>
            <select id="galeria-categoria" name="categoria" required defaultValue={categoriasGaleria[0].valor}>
              {categoriasGaleria.map((c) => <option key={c.valor} value={c.valor}>{c.label}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="galeria-titulo">Título (opcional; si se deja vacío se usa el nombre del archivo)</label>
            <input id="galeria-titulo" name="titulo" maxLength={120} />
          </div>
          <div className="campo campo--completo">
            <label htmlFor="galeria-descripcion">Descripción (opcional)</label>
            <textarea id="galeria-descripcion" name="descripcion" rows={2} maxLength={500}></textarea>
          </div>
        </div>
        <label className="check"><input type="checkbox" name="publicado" defaultChecked /> Publicar inmediatamente</label>
        <p className="form__ayuda">Las fotos se optimizan automáticamente (máx. 1920 px, formato WebP) antes de subirse.</p>
        <button type="submit" className="btn btn--primario" disabled={subiendo}>Subir</button>
        <ul className="admin-progreso">
          {progreso.map((p, i) => (
            <li key={i}>
              <span>{p.nombre}</span>
              <progress max={1} value={p.valor} />
              <span>{p.estado}</span>
            </li>
          ))}
        </ul>
      </form>

      <p className="admin-contador">{items.length} fotos · {publicadas} publicadas</p>

      <ul className="admin-galeria">
        {items.map((item) => (
          <FotoTarjeta key={item.id} item={item} onGuardar={(valores) => actualizarFoto(item, valores)} onEliminar={() => eliminar(item)} />
        ))}
      </ul>
    </>
  );
}

function FotoTarjeta({ item, onGuardar, onEliminar }: {
  item: Foto;
  onGuardar: (valores: { titulo: string; categoria: string; publicado: boolean; descripcion: string }) => Promise<void>;
  onEliminar: () => void;
}) {
  const [estado, setEstado] = useState("");

  async function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    try {
      await onGuardar({
        titulo: String(datos.get("titulo") ?? "").trim(),
        categoria: String(datos.get("categoria") ?? ""),
        publicado: datos.get("publicado") === "on",
        descripcion: String(datos.get("descripcion") ?? "").trim(),
      });
      setEstado("Cambios guardados.");
    } catch (error) {
      setEstado(mensajeError(error));
    }
  }

  return (
    <li className="tarjeta admin-foto">
      {esUrlImagenSegura(item.url) && <img src={item.url} alt={item.titulo} loading="lazy" />}
      <form className="admin-foto__form" onSubmit={alEnviar}>
        <label>Título<input name="titulo" defaultValue={item.titulo} maxLength={120} required /></label>
        <label>Categoría
          <select name="categoria" defaultValue={item.categoria}>
            {categoriasGaleria.map((c) => <option key={c.valor} value={c.valor}>{c.label}</option>)}
          </select>
        </label>
        <label>Descripción<textarea name="descripcion" defaultValue={item.descripcion ?? ""} maxLength={500} rows={2}></textarea></label>
        <label className="check"><input type="checkbox" name="publicado" defaultChecked={item.publicado} /> Publicada</label>
        <div className="admin-acciones">
          <button type="submit" className="btn btn--primario btn--chico">Guardar</button>
          <button type="button" className="btn-texto btn-texto--peligro" onClick={onEliminar}>Eliminar</button>
        </div>
        <p className="form__estado" role="status">{estado}</p>
      </form>
    </li>
  );
}
