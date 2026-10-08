import { Navigate, Outlet } from "react-router";

import { useAutenticacion } from "../context/AutenticacionContext";
import NavbarPrivado from "../components/comunes/NavbarPrivado";

export function RutaPrivada({rolesPermitidos}) {
  const { estaAutenticado, rol, sesionCargada } = useAutenticacion();

  if (!sesionCargada) {
    return null;
  }

  // Un usuario sin sesión debe autenticarse antes de continuar.
  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirige si el rol no está permitido para la ruta.
  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    return <Navigate to="/" replace />;
  }

  return (
  <>
    <NavbarPrivado />
    <Outlet />
  </>
);
}

export default RutaPrivada;