import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@heroui/react";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link } from "react-router";

import { TablaTurnos } from "../components/turnos/TablaTurnos";
import { turnosService } from "../services/turnosService";

export function PaginaTurnos() {
  const {
    data: turnos = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["turnos"],
    queryFn: turnosService.consultarTurnos,
  });

  return (
    <main className="min-h-screen bg-hierro-950 pt-10 pb-16">
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="relative">
            <Link
              to="/"
              aria-label="Volver al inicio"
              className="mb-6 inline-flex items-center gap-2 font-titulos text-xs tracking-[0.2em] text-hierro-400 uppercase transition-colors hover:text-hueso lg:absolute lg:-left-[250px] lg:top-6 lg:mb-0"
            >
              <IconArrowLeft size={16} />
              Inicio
            </Link>

            <div>
              <p className="etiqueta text-azul-500">Gestión de turnos</p>

              <h1 className="heading-xl mt-3 text-hueso">Turnos</h1>
            </div>
          </div>

          <div className="mt-8">
            {isPending ? (
              <div className="flex min-h-60 items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : isError ? (
              <div className="surface-plate p-6 text-center">
                <p className="text-sm text-hierro-200">
                  No se pudo cargar el listado.
                </p>

                <p className="mt-2 text-sm text-hierro-400">
                  Ocurrió un problema al consultar los turnos.
                </p>
              </div>
            ) : (
              <TablaTurnos turnos={turnos} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default PaginaTurnos;
