import { useState, type FormEvent } from "react";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { mensajeError } from "../lib/errores";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [estado, setEstado] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!evento.currentTarget.reportValidity()) return;
    setEnviando(true);
    setEstado("Ingresando…");
    try {
      await signInWithEmailAndPassword(auth!, email.trim(), password);
    } catch (error) {
      setEstado(mensajeError(error));
    } finally {
      setEnviando(false);
    }
  }

  async function alRecuperar() {
    const correo = email.trim();
    if (!correo) {
      setEstado("Escriba su correo y vuelva a pulsar «Olvidé mi contraseña».");
      return;
    }
    try {
      await sendPasswordResetEmail(auth!, correo);
    } catch (error) {
      console.warn(error);
    }
    // Mismo mensaje exista o no la cuenta, para no revelar qué correos están registrados.
    setEstado("Si el correo está registrado, recibirá un enlace para restablecer la contraseña.");
  }

  return (
    <div className="admin-cuerpo">
      <section className="admin-login tarjeta">
        <h1 className="tarjeta__titulo">Iniciar sesión</h1>
        <form className="form" onSubmit={alEnviar} noValidate>
          <div className="campo">
            <label htmlFor="login-email">Correo electrónico</label>
            <input type="email" id="login-email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="login-password">Contraseña</label>
            <input type="password" id="login-password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn--primario btn--bloque" disabled={enviando}>Ingresar</button>
          <button type="button" className="btn-texto" onClick={alRecuperar}>Olvidé mi contraseña</button>
          <p className="form__estado" role="status">{estado}</p>
        </form>
      </section>
    </div>
  );
}
