import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../lib/firebase";

export type EstadoSesion = "cargando" | "anonimo" | "autenticado";

export function useAuthUsuario() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [estado, setEstado] = useState<EstadoSesion>("cargando");

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      setUsuario(u);
      setEstado(u ? "autenticado" : "anonimo");
    });
  }, []);

  return { usuario, estado };
}
