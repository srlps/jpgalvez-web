import { firebaseConfigurado } from "./lib/config";
import { useAuthUsuario } from "./hooks/useAuthUsuario";
import Login from "./components/Login";
import Consola from "./components/Consola";

export default function App() {
  if (!firebaseConfigurado) {
    return (
      <div className="admin-cuerpo">
        <div className="admin-aviso admin-aviso--error">
          <p><strong>Firebase no está configurado.</strong></p>
          <p>Copie <code>.env.example</code> como <code>.env</code>, complete los valores de la app web de Firebase y vuelva a ejecutar <code>npm run dev</code> o <code>npm run build</code> dentro de la carpeta <code>admin/</code>.</p>
        </div>
      </div>
    );
  }
  return <Sesion />;
}

function Sesion() {
  const { usuario, estado } = useAuthUsuario();

  if (estado === "cargando") return <p className="admin-aviso">Cargando…</p>;
  if (estado === "anonimo") return <Login />;
  return <Consola usuario={usuario!} />;
}
