import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  collection, deleteDoc, deleteField, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc,
} from "firebase/firestore/lite";
import { db, storage } from "../lib/firebase";
import { esUrlImagenSegura } from "../lib/config";
import { SITIO_URL } from "../lib/constantes";
import { mensajeError } from "../lib/errores";
import { eliminarArchivo, prepararImagen, rutaArchivo, subirArchivo } from "../lib/imagenes";
import type { Cliente } from "../types";
import clientesSemilla from "../data/clientes-semilla.json";

const coleccion = "clientes";
const normalizar = (texto: string) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function ClientesPanel() {
  const [items, setItems] = useState<Cliente[]>([]);
  const [cargado, setCargado] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [estadoForm, setEstadoForm] = useState("");
  const [guardando, setGuardando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function cargar() {
    const snap = await getDocs(query(collection(db!, coleccion), orderBy("nombre")));
    setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Cliente, "id">) })));
    setCargado(true);
  }

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    const consulta = normalizar(busqueda.trim());
    return items.filter((c) => normalizar(c.nombre).includes(consulta));
  }, [items, busqueda]);

  const publicados = items.filter((c) => c.publicado).length;

  function limpiarForm() {
    formRef.current?.reset();
    setEditando(null);
    setEstadoForm("");
  }

  function editar(item: Cliente) {
    setEditando(item);
    setEstadoForm("");
    requestAnimationFrame(() => {
      const form = formRef.current;
      if (!form) return;
      form.reset();
      (form.elements.namedItem("nombre") as HTMLInputElement).value = item.nombre;
      (form.elements.namedItem("destacado") as HTMLInputElement).checked = item.destacado;
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
      const nombre = String(datos.get("nombre") ?? "").trim();
      const destacado = datos.get("destacado") === "on";
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

      const payload = { nombre, destacado, publicado, ...camposLogo };
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

      setEstadoForm("Cliente guardado.");
      limpiarForm();
      await cargar();
    } catch (error) {
      console.error(error);
      setEstadoForm(mensajeError(error));
    } finally {
      setGuardando(false);
    }
  }

  async function alternar(item: Cliente, campo: "destacado" | "publicado", valor: boolean) {
    try {
      await updateDoc(doc(db!, coleccion, item.id), { [campo]: valor, actualizadoEn: serverTimestamp() });
      setItems((prev) => prev.map((c) => (c.id === item.id ? { ...c, [campo]: valor } : c)));
    } catch (error) {
      alert(mensajeError(error));
    }
  }

  async function eliminar(item: Cliente) {
    if (!confirm(`¿Eliminar "${item.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteDoc(doc(db!, coleccion, item.id));
      await eliminarArchivo(storage!, item.logoPath).catch((error) => console.warn("No se pudo borrar el archivo", error));
      await cargar();
    } catch (error) {
      alert(mensajeError(error));
    }
  }

  async function importar() {
    const nombres = clientesSemilla as string[];
    if (!confirm(`Se crearán ${nombres.length} clientes publicados a partir del listado del sitio actual. ¿Continuar?`)) return;
    const documentos = nombres.map((nombre) => ({
      nombre,
      destacado: nombre === "MM CONSULTORES",
      publicado: true,
      ...(nombre === "MM CONSULTORES" ? { logoUrl: `${SITIO_URL}/images/logos/logo-mm-consultores.jpg` } : {}),
    }));
    for (let i = 0; i < documentos.length; i += 20) {
      const grupo = documentos.slice(i, i + 20);
      await Promise.all(grupo.map((datos) =>
        setDoc(doc(collection(db!, coleccion)), { ...datos, creadoEn: serverTimestamp(), actualizadoEn: serverTimestamp() }),
      ));
    }
    await cargar();
  }

  return (
    <div className="admin-grid">
      <form className="tarjeta form admin-form" ref={formRef} onSubmit={alEnviar} noValidate>
        <h2 className="tarjeta__titulo">{editando ? "Editar cliente" : "Agregar cliente"}</h2>
        <div className="campo">
          <label htmlFor="cliente-nombre">Nombre o razón social</label>
          <input id="cliente-nombre" name="nombre" maxLength={150} required />
        </div>
        <div className="campo">
          <label htmlFor="cliente-logo">Logo (opcional)</label>
          <input type="file" id="cliente-logo" name="logo" accept="image/*" />
        </div>
        {editando && esUrlImagenSegura(editando.logoUrl) && (
          <div className="admin-logo-actual">
            <img src={editando.logoUrl} alt="Logo actual" />
            <label className="check"><input type="checkbox" name="quitarLogo" /> Quitar logo actual</label>
          </div>
        )}
        <label className="check"><input type="checkbox" name="destacado" /> Destacar en Inicio</label>
        <label className="check"><input type="checkbox" name="publicado" defaultChecked /> Publicado en el sitio</label>
        <div className="acciones">
          <button type="submit" className="btn btn--primario" disabled={guardando}>Guardar</button>
          {editando && <button type="button" className="btn btn--secundario" onClick={limpiarForm}>Cancelar</button>}
        </div>
        <p className="form__estado" role="status">{estadoForm}</p>
      </form>

      <div>
        <div className="admin-toolbar">
          <input type="search" placeholder="Buscar cliente…" aria-label="Buscar cliente" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <span>{items.length} clientes · {publicados} publicados</span>
        </div>

        {cargado && items.length === 0 && (
          <div className="admin-aviso">
            <p>Todavía no hay clientes en Firestore.</p>
            <button type="button" className="btn btn--primario" onClick={importar}>Importar los {(clientesSemilla as string[]).length} clientes del sitio actual</button>
          </div>
        )}

        <div className="admin-tabla-wrap">
          <table className="admin-tabla">
            <thead><tr><th>Nombre</th><th>Logo</th><th>Destacado</th><th>Publicado</th><th><span className="sr-only">Acciones</span></th></tr></thead>
            <tbody>
              {filtrados.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td>{esUrlImagenSegura(item.logoUrl) ? <img src={item.logoUrl} alt="" className="admin-miniatura" /> : "—"}</td>
                  <td><input type="checkbox" checked={item.destacado} onChange={(e) => alternar(item, "destacado", e.target.checked)} aria-label={`Destacar ${item.nombre}`} /></td>
                  <td><input type="checkbox" checked={item.publicado} onChange={(e) => alternar(item, "publicado", e.target.checked)} aria-label={`Publicar ${item.nombre}`} /></td>
                  <td className="admin-acciones">
                    <button type="button" className="btn-texto" onClick={() => editar(item)}>Editar</button>
                    <button type="button" className="btn-texto btn-texto--peligro" onClick={() => eliminar(item)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
