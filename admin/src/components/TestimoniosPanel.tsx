import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  collection, deleteDoc, deleteField, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc,
} from "firebase/firestore/lite";
import { db } from "../lib/firebase";
import { esUrlImagenSegura } from "../lib/config";
import { mensajeError } from "../lib/errores";
import { descargarCsv, generarCsv } from "../lib/csv";
import { normalizar } from "../lib/texto";
import type { Cliente, Testimonio } from "../types";

const coleccion = "testimonios";

export default function TestimoniosPanel() {
  const [items, setItems] = useState<Testimonio[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
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
    getDocs(query(collection(db!, "clientes"), orderBy("nombre"))).then((snap) => {
      setClientes(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Cliente, "id">) })));
    });
  }, []);

  function limpiarForm() {
    formRef.current?.reset();
    setEditando(null);
    setEstadoForm("");
  }

  function clienteDe(item: Testimonio) {
    return clientes.find((c) => c.id === item.clienteId);
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
      (form.elements.namedItem("empresa") as HTMLInputElement).value = clienteDe(item)?.nombre ?? "";
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
    const datos = new FormData(form);
    const empresaTexto = String(datos.get("empresa") ?? "").trim();
    const clienteElegido = clientes.find((c) => normalizar(c.nombre) === normalizar(empresaTexto));
    if (!clienteElegido) {
      setEstadoForm(clientes.length === 0 ? "Primero agrega un cliente en la pestaña Clientes." : "Selecciona un cliente de la lista de clientes.");
      return;
    }
    setGuardando(true);
    setEstadoForm("Guardando…");
    try {
      const autor = String(datos.get("autor") ?? "").trim();
      const cargo = String(datos.get("cargo") ?? "").trim();
      const texto = String(datos.get("texto") ?? "").trim();
      const orden = Math.max(0, Math.min(9999, Math.trunc(Number(datos.get("orden")) || 0)));
      const publicado = datos.get("publicado") === "on";

      const referencia = editando ? doc(db!, coleccion, editando.id) : doc(collection(db!, coleccion));
      const payload = {
        autor, clienteId: clienteElegido.id, texto, orden, publicado,
        ...(cargo ? { cargo } : editando ? { cargo: deleteField() } : {}),
      };
      if (editando) {
        await updateDoc(referencia, { ...payload, actualizadoEn: serverTimestamp() });
      } else {
        await setDoc(referencia, { ...payload, creadoEn: serverTimestamp(), actualizadoEn: serverTimestamp() });
      }

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
      await cargar();
    } catch (error) {
      alert(mensajeError(error));
    }
  }

  function exportarCsv() {
    const columnas = ["Autor", "Cargo", "Empresa", "Texto", "Orden", "Publicado"];
    const filas = items.map((t) => [t.autor, t.cargo ?? "", clienteDe(t)?.nombre ?? "", t.texto, t.orden, t.publicado ? "Sí" : "No"]);
    descargarCsv("testimonios.csv", generarCsv(columnas, filas));
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
          <label htmlFor="testimonio-empresa">Cliente (empresa o persona)</label>
          <input id="testimonio-empresa" name="empresa" list="testimonio-empresa-lista" maxLength={150} autoComplete="off" required />
          <datalist id="testimonio-empresa-lista">
            {clientes.map((c) => <option key={c.id} value={c.nombre} />)}
          </datalist>
          <p className="form__ayuda">Escribe para buscar y elige un cliente de la lista. Si es una persona natural, en el sitio solo se mostrará su nombre como autor.</p>
        </div>
        <div className="campo">
          <label htmlFor="testimonio-texto">Testimonio</label>
          <textarea id="testimonio-texto" name="texto" rows={5} maxLength={1000} required></textarea>
        </div>
        <div className="campo">
          <label htmlFor="testimonio-orden">Orden (menor = aparece primero)</label>
          <input type="number" id="testimonio-orden" name="orden" min={0} max={9999} step={1} defaultValue={1} required />
        </div>
        <p className="form__ayuda">El logo mostrado junto al testimonio es el logo del cliente elegido; para cambiarlo, edítalo en la pestaña Clientes.</p>
        <label className="check"><input type="checkbox" name="publicado" defaultChecked /> Publicado en el sitio</label>
        <div className="acciones">
          <button type="submit" className="btn btn--primario" disabled={guardando}>Guardar</button>
          {editando && <button type="button" className="btn btn--secundario" onClick={limpiarForm}>Cancelar</button>}
        </div>
        <p className="form__estado" role="status">{estadoForm}</p>
      </form>

      <div>
        <div className="admin-toolbar">
          <span>{items.length} testimonios</span>
          <button type="button" className="btn btn--secundario btn--chico" onClick={exportarCsv}>Exportar CSV</button>
        </div>

        {cargado && items.length === 0 && (
          <div className="admin-aviso">
            <p>Todavía no hay testimonios en Firestore.</p>
          </div>
        )}
        <ul className="admin-lista">
          {items.map((item) => (
            <li key={item.id} className="tarjeta admin-item">
              <div className="admin-item__cabecera">
                {esUrlImagenSegura(clienteDe(item)?.logoUrl) && <img src={clienteDe(item)!.logoUrl} alt="" className="admin-miniatura" />}
                <div>
                  <strong>{item.autor}</strong>
                  <span className="admin-item__meta">{[item.cargo, clienteDe(item)?.nombre].filter(Boolean).join(", ")}</span>
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
