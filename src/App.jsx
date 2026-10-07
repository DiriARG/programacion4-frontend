import { Route, Routes } from "react-router";

import { RutaPrivada } from "./routes/RutaPrivada";
import { RutaPublica } from "./routes/RutaPublica";
import { PaginaPrincipal } from "./pages/PaginaPrincipal";
import { PaginaLogin } from "./pages/PaginaLogin";
import { PaginaNoEncontrada } from "./pages/NoEncontrado";
import { PaginaUsuarios } from "./pages/PaginaUsuarios";
import { PaginaPlanes } from "./pages/PaginaPlanes";

function App() {
  return (
    <Routes>
      {/* Página principal accesible con o sin sesión. */}
      <Route path="/" element={<PaginaPrincipal />} />

      <Route element={<RutaPublica />}>
        <Route path="/login" element={<PaginaLogin />} />
      </Route>

      <Route
        element={
          <RutaPrivada rolesPermitidos={["ADMIN_GESTION", "ADMIN_GENERAL"]} />
        }
      >
        <Route
          path="/usuarios/alumnos"
          element={<PaginaUsuarios tipo="alumnos" />}
        />
      </Route>

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
      </Route>

      <Route path="*" element={<PaginaNoEncontrada />} />
    </Routes>
  );
}

export default App;
