import { PaginaPrincipal } from "./pages/PaginaPrincipal";
import { PaginaNoEncontrada } from "./pages/NoEncontrado";
import { Route, Routes } from "react-router";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginaPrincipal />} />
      <Route path="*" element={<PaginaNoEncontrada />} />
    </Routes>
  );
}

export default App;
