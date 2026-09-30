import { Navigate, Outlet } from "react-router";

import { useAutenticacion } from "../context/AutenticacionContext";
import NavbarPrivado from "../components/comunes/NavbarPrivado";

export function RutaPrivada() {
  const { estaAutenticado, sesionCargada } = useAutenticacion();

  if (!sesionCargada) {
    return null;
  }

  // Un usuario sin sesión debe autenticarse antes de continuar.
  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return (
  <>
    <NavbarPrivado />
    <Outlet />
  </>
);
}

export default RutaPrivada;