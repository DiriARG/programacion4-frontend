import { Navigate, Outlet } from "react-router";

import { useAutenticacion } from "../context/AutenticacionContext";

export function RutaPublica() {
  const { estaAutenticado, sesionCargada } = useAutenticacion();

  // Espera a comprobar la sesión antes de decidir qué mostrar.
  if (!sesionCargada) {
    return null;
  }

  // Un usuario autenticado no necesita volver al login, por lo tanto se lo redirige al inicio.
  if (estaAutenticado) {
    // replace: reemplaza "/login" en el historial por "/" para que al clickear "Atrás" no regrese al login.
    return <Navigate to="/" replace />;
  }

   // Renderiza las rutas hijas (como "/login") si el usuario no está autenticado.
  return <Outlet />;
}

export default RutaPublica;
