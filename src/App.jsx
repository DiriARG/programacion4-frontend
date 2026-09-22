import { PaginaPrincipal } from "./pages/PaginaPrincipal";
import { PaginaLogin } from "./pages/PaginaLogin";
import { PaginaNoEncontrada } from "./pages/NoEncontrado";
import { Route, Routes } from "react-router";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginaPrincipal />} />
      <Route path="/login" element={<PaginaLogin />} />
      <Route path="*" element={<PaginaNoEncontrada />} />
    </Routes>
  );
}

export default App;
