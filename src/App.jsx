import { Routes, Route } from "react-router";
import { LoginPage } from "./pages/login/LoginPage";

export default function App() {
  return (
    <Routes>
      {/* Carga el login directamente al entrar a http://localhost:5173/ */}
      <Route path="/" element={<LoginPage />} />

      {/* También lo carga si entras a http://localhost:5173/login */}
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}