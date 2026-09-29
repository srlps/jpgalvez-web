import { useState, type KeyboardEvent } from "react";
import { signOut, type User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { SITIO_URL } from "../lib/constantes";
import ClientesPanel from "./ClientesPanel";
import TestimoniosPanel from "./TestimoniosPanel";
import GaleriaPanel from "./GaleriaPanel";

const pestanas = [
  { id: "clientes", label: "Clientes" },
  { id: "testimonios", label: "Testimonios" },
  { id: "galeria", label: "Galería" },
] as const;

type Pestana = (typeof pestanas)[number]["id"];

export default function Consola({ usuario }: { usuario: User }) {
  const [activa, setActiva] = useState<Pestana>("clientes");

  function alPresionarTecla(evento: KeyboardEvent<HTMLButtonElement>, indice: number) {
    const paso = { ArrowRight: 1, ArrowLeft: -1 }[evento.key];
    if (!paso) return;
    const siguiente = pestanas[(indice + paso + pestanas.length) % pestanas.length];
    setActiva(siguiente.id);
    document.getElementById(`tab-${siguiente.id}`)?.focus();
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <a className="admin-header__marca" href={SITIO_URL}>
          <img src={`${SITIO_URL}/images/logos/logo.png`} alt="Transportes JeanPierre" height={56} />
          <span>Consola de administración</span>
        </a>
        <div className="admin-header__sesion">
          <span>{usuario.email}</span>
          <button type="button" className="btn btn--claro btn--chico" onClick={() => signOut(auth!)}>Cerrar sesión</button>
        </div>
      </header>

      <div className="admin-cuerpo">
        <div className="admin-tabs" role="tablist" aria-label="Secciones administrables">
          {pestanas.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              id={`tab-${p.id}`}
              aria-controls={`panel-${p.id}`}
              aria-selected={activa === p.id}
              tabIndex={activa === p.id ? 0 : -1}
              onClick={() => setActiva(p.id)}
              onKeyDown={(evento) => alPresionarTecla(evento, i)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Los 3 paneles quedan montados (solo ocultos con CSS) para no perder el estado del
            formulario ni volver a pedir los documentos a Firestore al cambiar de pestaña. */}
        <section role="tabpanel" id="panel-clientes" aria-labelledby="tab-clientes" hidden={activa !== "clientes"}>
          <ClientesPanel />
        </section>
        <section role="tabpanel" id="panel-testimonios" aria-labelledby="tab-testimonios" hidden={activa !== "testimonios"}>
          <TestimoniosPanel />
        </section>
        <section role="tabpanel" id="panel-galeria" aria-labelledby="tab-galeria" hidden={activa !== "galeria"}>
          <GaleriaPanel />
        </section>
      </div>
    </div>
  );
}
