import { Route, Routes } from "react-router";

import { RutaPrivada } from "./routes/RutaPrivada";
import { RutaPublica } from "./routes/RutaPublica";
import { PaginaPrincipal } from "./pages/PaginaPrincipal";
import { PaginaLogin } from "./pages/PaginaLogin";
import { PaginaNoEncontrada } from "./pages/NoEncontrado";
import { PaginaUsuarios } from "./pages/PaginaUsuarios";
import { PaginaPlanes } from "./pages/PaginaPlanes";
import { PaginaTurnos } from "./pages/PaginaTurnos";
import { PaginaAsistencias } from "./pages/PaginaAsistencias";
import { PaginaFichasMedicas } from "./pages/PaginaFichasMedicas";
import { PaginaRutinas } from "./pages/PaginaRutinas";
import { PaginaEjercicios } from "./pages/PaginaEjercicios";
import { PaginaPagos } from "./pages/PaginaPagos";

function App() {
  return (
    <Routes>
      {/* Página principal accesible con o sin sesión. */}
      <Route path="/" element={<PaginaPrincipal />} />

      <Route element={<RutaPublica />}>
        <Route path="/login" element={<PaginaLogin />} />
      </Route>

      {/* Rutas para ADMIN_GESTION y ADMIN_GENERAL */}
      <Route
        element={
          <RutaPrivada rolesPermitidos={["ADMIN_GESTION", "ADMIN_GENERAL"]} />
        }
      >
        <Route
          path="/usuarios/alumnos"
          element={<PaginaUsuarios tipo="alumnos" />}
        />

        <Route path="/turnos" element={<PaginaTurnos />} />

        <Route path="/fichas-medicas" element={<PaginaFichasMedicas />} />

        <Route path="/pagos" element={<PaginaPagos />} />
      </Route>

      {/* Rutas exclusivas para ADMIN_GENERAL */}
      <Route element={<RutaPrivada rolesPermitidos={["ADMIN_GENERAL"]} />}>
        <Route
          path="/usuarios/profesores"
          element={<PaginaUsuarios tipo="profesores" />}
        />

        <Route
          path="/usuarios/admin-gestion"
          element={<PaginaUsuarios tipo="admin-gestion" />}
        />

        <Route path="/planes" element={<PaginaPlanes />} />

        <Route path="/ejercicios" element={<PaginaEjercicios />} />
      </Route>

      {/* Rutas compartidas con PROFESOR */}
      <Route
        element={
          <RutaPrivada
            rolesPermitidos={["ADMIN_GESTION", "ADMIN_GENERAL", "PROFESOR"]}
          />
        }
      >
        <Route path="/asistencias" element={<PaginaAsistencias />} />
      </Route>

      {/* Rutas exclusivas para PROFESOR */}
      <Route element={<RutaPrivada rolesPermitidos={["PROFESOR"]} />}>
        <Route path="/rutinas" element={<PaginaRutinas />} />
      </Route>

      {/* Ruta 404 No Encontrada */}
      <Route path="*" element={<PaginaNoEncontrada />} />
    </Routes>
  );
}

export default App;