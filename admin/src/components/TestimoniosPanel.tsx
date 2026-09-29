import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  collection, deleteDoc, deleteField, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc,
} from "firebase/firestore/lite";
import { db, storage } from "../lib/firebase";
import { esUrlImagenSegura } from "../lib/config";
import { mensajeError } from "../lib/errores";
import { eliminarArchivo, prepararImagen, rutaArchivo, subirArchivo } from "../lib/imagenes";
import type { Testimonio } from "../types";
import { testimoniosSemilla } from "../data/testimonios-semilla";

const coleccion = "testimonios";

export default function TestimoniosPanel() {
  const [items, setItems] = useState<Testimonio[]>([]);
  const [cargado, setCargado] = useState(false);
  const [editando, setEditando] = useState<Testimonio | null>(null);
  const [estadoForm, setEstadoForm] = useState("");
  const [guardando, setGuardando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function cargar() {
    const snap = await getDocs(query(collection(db!, coleccion), orderBy("orden")));
    setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Testimonio, "id">) })));
    setCargado(true);
  }

  useEffect(() => {
    cargar();
  }, []);

  function limpiarForm() {
    formRef.current?.reset();
    setEditando(null);
    setEstadoForm("");
  }

  function editar(item: Testimonio) {
    setEditando(item);
    setEstadoForm("");
    requestAnimationFrame(() => {
      const form = formRef.current;
      if (!form) return;
      form.reset();
      (form.elements.namedItem("autor") as HTMLInputElement).value = item.autor;
      (form.elements.namedItem("cargo") as HTMLInputElement).value = item.cargo ?? "";
      (form.elements.namedItem("empresa") as HTMLInputElement).value = item.empresa;
      (form.elements.namedItem("texto") as HTMLTextAreaElement).value = item.texto;
      (form.elements.namedItem("orden") as HTMLInputElement).value = String(item.orden);
      (form.elements.namedItem("publicado") as HTMLInputElement).checked = item.publicado;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = evento.currentTarget;
    if (!form.reportValidity()) return;
    setGuardando(true);
    setEstadoForm("Guardando…");
    try {
      const datos = new FormData(form);
      const autor = String(datos.get("autor") ?? "").trim();
      const cargo = String(datos.get("cargo") ?? "").trim();
      const empresa = String(datos.get("empresa") ?? "").trim();
      const texto = String(datos.get("texto") ?? "").trim();
      const orden = Math.max(0, Math.min(9999, Math.trunc(Number(datos.get("orden")) || 0)));
      const publicado = datos.get("publicado") === "on";
      const quitarLogo = datos.get("quitarLogo") === "on";
      const archivo = datos.get("logo") as File | null;

      const referencia = editando ? doc(db!, coleccion, editando.id) : doc(collection(db!, coleccion));
      let camposLogo: Record<string, unknown> = {};
      let subido: string | undefined;
      let descartar = editando?.logoPath;

      if (archivo && archivo.size > 0) {
        const imagen = await prepararImagen(archivo, 400);
        const ruta = rutaArchivo(coleccion, referencia.id, imagen.ext);
        const url = await subirArchivo(storage!, ruta, imagen.blob);
        camposLogo = { logoUrl: url, logoPath: ruta };
        subido = ruta;
      } else if (editando && quitarLogo && editando.logoUrl) {
        camposLogo = { logoUrl: deleteField(), logoPath: deleteField() };
      } else {
        descartar = undefined;
      }

      const payload = {
        autor, empresa, texto, orden, publicado,
        ...(cargo ? { cargo } : editando ? { cargo: deleteField() } : {}),
        ...camposLogo,
      };
      try {
        if (editando) {
          await updateDoc(referencia, { ...payload, actualizadoEn: serverTimestamp() });
        } else {
          await setDoc(referencia, { ...payload, creadoEn: serverTimestamp(), actualizadoEn: serverTimestamp() });
        }
      } catch (error) {
        if (subido) await eliminarArchivo(storage!, subido).catch(() => {});
        throw error;
      }
      if (descartar) await eliminarArchivo(storage!, descartar).catch((error) => console.warn("No se pudo borrar el logo anterior", error));

      setEstadoForm("Testimonio guardado.");
      limpiarForm();
      await cargar();
    } catch (error) {
      console.error(error);
      setEstadoForm(mensajeError(error));
    } finally {
      setGuardando(false);
    }
  }

  async function alternarPublicado(item: Testimonio, valor: boolean) {
    try {
      await updateDoc(doc(db!, coleccion, item.id), { publicado: valor, actualizadoEn: serverTimestamp() });
      setItems((prev) => prev.map((t) => (t.id === item.id ? { ...t, publicado: valor } : t)));
    } catch (error) {
      alert(mensajeError(error));
    }
  }

  async function eliminar(item: Testimonio) {
    if (!confirm(`¿Eliminar el testimonio de "${item.autor}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteDoc(doc(db!, coleccion, item.id));
      await eliminarArchivo(storage!, item.logoPath).catch((error) => console.warn("No se pudo borrar el archivo", error));
      await cargar();
    } catch (error) {
      alert(mensajeError(error));
    }
  }

  async function importar() {
    for (const t of testimoniosSemilla) {
      await setDoc(doc(collection(db!, coleccion)), { ...t, publicado: true, creadoEn: serverTimestamp(), actualizadoEn: serverTimestamp() });
    }
    await cargar();
  }

  return (
    <div className="admin-grid">
      <form className="tarjeta form admin-form" ref={formRef} onSubmit={alEnviar} noValidate>
        <h2 className="tarjeta__titulo">{editando ? "Editar testimonio" : "Agregar testimonio"}</h2>
        <div className="campo">
          <label htmlFor="testimonio-autor">Nombre de quien recomienda</label>
          <input id="testimonio-autor" name="autor" maxLength={100} required />
        </div>
        <div className="campo">
          <label htmlFor="testimonio-cargo">Cargo (opcional)</label>
          <input id="testimonio-cargo" name="cargo" maxLength={100} />
        </div>
        <div className="campo">
          <label htmlFor="testimonio-empresa">Empresa</label>
          <input id="testimonio-empresa" name="empresa" maxLength={150} required />
        </div>
        <div className="campo">
          <label htmlFor="testimonio-texto">Testimonio</label>
          <textarea id="testimonio-texto" name="texto" rows={5} maxLength={1000} required></textarea>
        </div>
        <div className="campo">
          <label htmlFor="testimonio-orden">Orden (menor = aparece primero)</label>
          <input type="number" id="testimonio-orden" name="orden" min={0} max={9999} step={1} defaultValue={1} required />
        </div>
        <div className="campo">
          <label htmlFor="testimonio-logo">Logo de la empresa (opcional)</label>
          <input type="file" id="testimonio-logo" name="logo" accept="image/*" />
        </div>
        {editando && esUrlImagenSegura(editando.logoUrl) && (
          <div className="admin-logo-actual">
            <img src={editando.logoUrl} alt="Logo actual" />
            <label className="check"><input type="checkbox" name="quitarLogo" /> Quitar logo actual</label>
          </div>
        )}
        <label className="check"><input type="checkbox" name="publicado" defaultChecked /> Publicado en el sitio</label>
        <div className="acciones">
          <button type="submit" className="btn btn--primario" disabled={guardando}>Guardar</button>
          {editando && <button type="button" className="btn btn--secundario" onClick={limpiarForm}>Cancelar</button>}
        </div>
        <p className="form__estado" role="status">{estadoForm}</p>
      </form>

      <div>
        {cargado && items.length === 0 && (
          <div className="admin-aviso">
            <p>Todavía no hay testimonios en Firestore.</p>
            <button type="button" className="btn btn--primario" onClick={importar}>Importar el testimonio del sitio actual</button>
          </div>
        )}
        <ul className="admin-lista">
          {items.map((item) => (
            <li key={item.id} className="tarjeta admin-item">
              <div className="admin-item__cabecera">
                {esUrlImagenSegura(item.logoUrl) && <img src={item.logoUrl} alt="" className="admin-miniatura" />}
                <div>
                  <strong>{item.autor}</strong>
                  <span className="admin-item__meta">{[item.cargo, item.empresa].filter(Boolean).join(", ")}</span>
                  <span className="admin-item__meta">Orden: {item.orden}</span>
                </div>
              </div>
              <p className="admin-item__texto">{item.texto}</p>
              <div className="admin-acciones">
                <label className="check">
                  <input type="checkbox" checked={item.publicado} onChange={(e) => alternarPublicado(item, e.target.checked)} aria-label={`Publicar testimonio de ${item.autor}`} />
                  Publicado
                </label>
                <button type="button" className="btn-texto" onClick={() => editar(item)}>Editar</button>
                <button type="button" className="btn-texto btn-texto--peligro" onClick={() => eliminar(item)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
