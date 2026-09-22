import { Link } from "react-router";
import { IconArrowLeft } from "@tabler/icons-react";

import Logotipo from "../components/comunes/Logotipo";
import FormularioLogin from "../components/autenticacion/FormularioLogin";

export function PaginaLogin() {
  return (
    <div className="relative flex min-h-screen flex-col bg-hierro-950 px-5 py-8 sm:px-10">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-titulos text-xs tracking-[0.2em] text-hierro-400 uppercase transition-colors hover:text-hueso"
        >
          <IconArrowLeft size={16} />
          Volver
        </Link>
      </div>

      <main className="flex flex-1 flex-col items-center justify-center py-12">
        <Logotipo className="scale-125 sm:scale-150" />

        <div className="mt-10 w-full max-w-sm">
          <div className="placa-formulario rounded-lg border border-hierro-700 p-6 shadow-2xl sm:p-8">
            <FormularioLogin />
          </div>
        </div>
      </main>
    </div>
  );
}

export default PaginaLogin;