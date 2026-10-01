import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  collection, deleteDoc, deleteField, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc, writeBatch,
  type DocumentReference,
} from "firebase/firestore/lite";
import { db, storage } from "../lib/firebase";
import { esUrlImagenSegura } from "../lib/config";
import { mensajeError } from "../lib/errores";
import { eliminarArchivo, prepararImagen, rutaArchivo, subirArchivo } from "../lib/imagenes";
import { descargarCsv, generarCsv, parsearCsv } from "../lib/csv";
import { normalizar } from "../lib/texto";
import type { Cliente, TipoCliente } from "../types";

const coleccion = "clientes";
const esSi = (valor: string | undefined) => /^s[ií]$/i.test((valor ?? "").trim());

export default function ClientesPanel() {
  const [items, setItems] = useState<Cliente[]>([]);
  const [cargado, setCargado] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [esPersona, setEsPersona] = useState(false);
  const [estadoForm, setEstadoForm] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [importando, setImportando] = useState(false);
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
  const personas = items.filter((c) => c.tipo === "persona").length;

  function limpiarForm() {
    formRef.current?.reset();
    setEditando(null);
    setEsPersona(false);
    setEstadoForm("");
  }

  function alCambiarTipo(valor: string) {
    const persona = valor === "persona";
    setEsPersona(persona);
    if (persona) (formRef.current!.elements.namedItem("destacado") as HTMLInputElement).checked = false;
  }

  function editar(item: Cliente) {
    setEditando(item);
    setEsPersona(item.tipo === "persona");
    setEstadoForm("");
    requestAnimationFrame(() => {
      const form = formRef.current;
      if (!form) return;
      form.reset();
      (form.elements.namedItem("nombre") as HTMLInputElement).value = item.nombre;
      (form.elements.namedItem("tipo") as HTMLSelectElement).value = item.tipo ?? "empresa";
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
      const tipo: TipoCliente = datos.get("tipo") === "persona" ? "persona" : "empresa";
      const destacado = tipo === "empresa" && datos.get("destacado") === "on";
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

      const payload = { nombre, tipo, destacado, publicado, ...camposLogo };
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

  function exportarCsv() {
    const columnas = ["Nombre", "Tipo", "Destacado", "Publicado"];
    const filas = items.map((c) => [c.nombre, c.tipo === "persona" ? "Persona" : "Empresa", c.destacado ? "Sí" : "No", c.publicado ? "Sí" : "No"]);
    descargarCsv("clientes.csv", generarCsv(columnas, filas));
  }

  // Empareja por nombre (sin distinguir tildes ni mayúsculas): un nombre corregido crearía un cliente nuevo, no renombra.
  async function alImportarCsv(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!archivo) return;

    const [encabezado, ...datos] = parsearCsv(await archivo.text());
    // Las columnas se buscan por nombre (no por posición) para aceptar CSV con columnas extra.
    const columna = (nombre: string) => (encabezado ?? []).findIndex((h) => normalizar(h.trim()) === nombre);
    const [iNombre, iTipo, iDestacado, iPublicado] = ["nombre", "tipo", "destacado", "publicado"].map(columna);
    if (iNombre < 0 || iDestacado < 0 || iPublicado < 0) {
      alert('El CSV debe tener las columnas "Nombre", "Destacado" y "Publicado" (y, opcionalmente, "Tipo").');
      return;
    }
    if (datos.length === 0) {
      alert("El archivo no tiene filas de datos.");
      return;
    }
    if (!confirm(`Se leyeron ${datos.length} filas. Se actualizarán los clientes existentes (comparando por nombre) y se crearán los que no existan. ¿Continuar?`)) return;

    setImportando(true);
    try {
      const porNombre = new Map(items.map((c) => [normalizar(c.nombre), c]));
      const acciones: { ref: DocumentReference; datos: Record<string, unknown>; nueva: boolean }[] = [];
      let sinCambios = 0;

      for (const fila of datos) {
        const nombre = (fila[iNombre] ?? "").trim();
        if (!nombre) continue;
        const existente = porNombre.get(normalizar(nombre));
        const tipoTexto = (iTipo >= 0 ? fila[iTipo] ?? "" : "").trim();
        // Sin valor de tipo se conserva el actual; "Persona" o "Persona natural" = persona, cualquier otro valor = empresa.
        const tipo: TipoCliente = tipoTexto ? (/^persona/i.test(tipoTexto) ? "persona" : "empresa") : existente?.tipo ?? "empresa";
        const destacado = tipo === "empresa" && esSi(fila[iDestacado]);
        const publicado = esSi(fila[iPublicado]);

        if (existente) {
          if (existente.nombre === nombre && existente.tipo === tipo && existente.destacado === destacado && existente.publicado === publicado) {
            sinCambios++;
            continue;
          }
          acciones.push({ ref: doc(db!, coleccion, existente.id), datos: { nombre, tipo, destacado, publicado, actualizadoEn: serverTimestamp() }, nueva: false });
        } else {
          acciones.push({ ref: doc(collection(db!, coleccion)), datos: { nombre, tipo, destacado, publicado, creadoEn: serverTimestamp(), actualizadoEn: serverTimestamp() }, nueva: true });
        }
      }

      // writeBatch admite hasta 500 operaciones: se parte en lotes por si el CSV crece.
      for (let i = 0; i < acciones.length; i += 400) {
        const lote = writeBatch(db!);
        for (const accion of acciones.slice(i, i + 400)) {
          if (accion.nueva) lote.set(accion.ref, accion.datos);
          else lote.update(accion.ref, accion.datos);
        }
        await lote.commit();
      }

      const creados = acciones.filter((a) => a.nueva).length;
      const actualizados = acciones.length - creados;
      alert(`Importación terminada: ${creados} creados, ${actualizados} actualizados, ${sinCambios} sin cambios.`);
      await cargar();
    } catch (error) {
      alert(mensajeError(error));
    } finally {
      setImportando(false);
    }
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
          <label htmlFor="cliente-tipo">Tipo</label>
          <select id="cliente-tipo" name="tipo" defaultValue="empresa" onChange={(e) => alCambiarTipo(e.target.value)}>
            <option value="empresa">Empresa</option>
            <option value="persona">Persona natural</option>
          </select>
          {esPersona && <p className="form__ayuda">Las personas naturales no se pueden destacar y no aparecen en el listado público de empresas.</p>}
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
        <label className="check"><input type="checkbox" name="destacado" disabled={esPersona} /> Destacar en Inicio</label>
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
          <span>{items.length - personas} empresas · {personas} personas · {publicados} publicados</span>
          <button type="button" className="btn btn--secundario btn--chico" onClick={exportarCsv}>Exportar CSV</button>
          <label className="btn btn--secundario btn--chico">
            {importando ? "Importando…" : "Importar CSV"}
            <input type="file" accept=".csv,text/csv" hidden disabled={importando} onChange={alImportarCsv} />
          </label>
        </div>

        {cargado && items.length === 0 && (
          <div className="admin-aviso">
            <p>Todavía no hay clientes en Firestore.</p>
          </div>
        )}

        <div className="admin-tabla-wrap">
          <table className="admin-tabla">
            <thead><tr><th>Nombre</th><th>Tipo</th><th>Logo</th><th>Destacado</th><th>Publicado</th><th><span className="sr-only">Acciones</span></th></tr></thead>
            <tbody>
              {filtrados.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td>{item.tipo === "persona" ? "Persona" : "Empresa"}</td>
                  <td>{esUrlImagenSegura(item.logoUrl) ? <img src={item.logoUrl} alt="" className="admin-miniatura" /> : "—"}</td>
                  <td><input type="checkbox" checked={item.destacado} disabled={item.tipo === "persona"} onChange={(e) => alternar(item, "destacado", e.target.checked)} aria-label={`Destacar ${item.nombre}`} /></td>
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
