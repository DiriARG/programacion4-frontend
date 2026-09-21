import { useQuery } from "@tanstack/react-query";

import { planesService } from "../../services/planesService";
import { TarjetaPlan } from "./TarjetaPlan";

export function Planes() {
  const {
    data: planes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["planes", "activos"],
    queryFn: planesService.planesActivos,
  });

  return (
    <section
      id="planes"
      className="scroll-mt-20 border-t border-hierro-800/70 bg-hierro-950 py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="etiqueta">Planes</p>

          <h2 className="titulo-xl mt-3 text-3xl text-hueso sm:text-4xl lg:text-5xl">
            Elegí cómo vas a entrenar
          </h2>

          <div
            className="mx-auto mt-5 h-px w-16 bg-azul-600"
            aria-hidden="true"
          />

          <p className="mt-5 text-base leading-relaxed text-hierro-200/80">
            Elegí el plan que mejor se adapte a tu forma de entrenar.
          </p>
        </div>

        <div className="mt-14">
          {isLoading && (
            <p className="text-center text-sm text-hierro-400">
              Cargando planes...
            </p>
          )}

          {isError && (
            <p className="text-center text-sm text-hierro-400">
              No pudimos cargar los planes en este momento.
            </p>
          )}

          {!isLoading && !isError && planes.length === 0 && (
            <p className="text-center text-sm text-hierro-400">
              No hay planes disponibles actualmente.
            </p>
          )}

          {!isLoading && !isError && planes.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {planes.map((plan) => (
                <TarjetaPlan key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Planes;
