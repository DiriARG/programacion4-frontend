import { Route, Routes } from "react-router";

import { RutaPrivada } from "./routes/RutaPrivada";
import { RutaPublica } from "./routes/RutaPublica";
import { PaginaPrincipal } from "./pages/PaginaPrincipal";
import { PaginaLogin } from "./pages/PaginaLogin";
import { PaginaNoEncontrada } from "./pages/NoEncontrado";

function App() {
  return (
    <Routes>
      {/* Página principal accesible con o sin sesión. */}
      <Route path="/" element={<PaginaPrincipal />} />

      <Route element={<RutaPublica />}>
        <Route path="/login" element={<PaginaLogin />} />
      </Route>

      <Route element={<RutaPrivada />}></Route>

      <Route path="*" element={<PaginaNoEncontrada />} />
    </Routes>
  );
}

export default App;
