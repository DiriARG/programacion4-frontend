import { useQuery } from "@tanstack/react-query";
import { Button, Spinner } from "@heroui/react";
import { IconArrowLeft, IconRefresh } from "@tabler/icons-react";
import { Link } from "react-router";

import { ContenidoDetalleRutina } from "../components/rutinas/ContenidoDetalleRutina";
import { useAutenticacion } from "../context/AutenticacionContext";
import { rutinasService } from "../services/rutinasService";

export function PaginaRutinaAlumno() {
  const { rol } = useAutenticacion();

  const {
    data: rutinaActual,
    isPending,
    isError,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["rutinas", "actual"],
    queryFn: () => rutinasService.consultarRutinaActual(),
    enabled: rol === "ALUMNO",
    retry: false,
    refetchOnWindowFocus: false,
  });

  const mensajeError = error?.response?.data?.mensaje;

  // Se utiliza el includes porque en el service del back hay otro 404.
  const sinRutinaActiva =
    error?.response?.status === 404 &&
    mensajeError?.toLowerCase().includes("no posee una rutina activa");

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
              <p className="etiqueta text-azul-500">Mi entrenamiento</p>

              <h1 className="heading-xl mt-3 text-hueso">Mi rutina</h1>
            </div>
          </div>

          <section className="mt-8">
            {isPending ? (
              <div className="flex min-h-60 flex-col items-center justify-center gap-3">
                <Spinner size="lg" />

                <p className="text-sm text-hierro-400">Cargando tu rutina...</p>
              </div>
            ) : sinRutinaActiva ? (
              <div className="surface-plate flex min-h-60 flex-col items-center justify-center p-6 text-center">
                <h2 className="font-titulos text-lg tracking-[0.08em] text-hueso uppercase">
                  Todavía no tenés una rutina activa
                </h2>

                <p className="mt-2 max-w-lg text-sm text-hierro-400">
                  Cuando tengas una rutina activa asignada, vas a poder
                  consultar acá tu planificación semanal y los ejercicios.
                </p>
              </div>
            ) : isError ? (
              <div className="surface-plate flex min-h-60 flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-sm text-hierro-200">
                  No se pudo cargar tu rutina.
                </p>

                <p className="text-sm text-hierro-400">
                  {mensajeError ??
                    "Ocurrió un problema al consultar la información."}
                </p>

                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onPress={() => refetch()}
                  isDisabled={isFetching}
                >
                  <IconRefresh size={16} />
                  Reintentar
                </Button>
              </div>
            ) : rutinaActual ? (
              <div className="surface-plate space-y-6 p-5 sm:p-6">
                <ContenidoDetalleRutina rutina={rutinaActual} />
              </div>
            ) : (
              <p className="surface-plate p-6 text-center text-sm text-hierro-400">
                No se encontró información de tu rutina.
              </p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default PaginaRutinaAlumno;
