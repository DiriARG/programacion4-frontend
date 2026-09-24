import { Navigate, Outlet } from "react-router";

import { useAutenticacion } from "../context/AutenticacionContext";

export function RutaPrivada() {
  const { estaAutenticado, sesionCargada } = useAutenticacion();

  if (!sesionCargada) {
    return null;
  }

  // Un usuario sin sesión debe autenticarse antes de continuar.
  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default RutaPrivada;