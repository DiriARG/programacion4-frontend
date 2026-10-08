import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Spinner } from "@heroui/react";
import { IconArrowLeft, IconPlus } from "@tabler/icons-react";
import { Link } from "react-router";

import { TablaPlanes } from "../components/planes/TablaPlanes";
import { CrearPlanModal } from "../components/modales/CrearPlanModal";
import { ModificarPlanModal } from "../components/modales/ModificarPlanModal";
import { CambioEstadoPlanModal } from "../components/modales/CambioEstadoPlanModal";
import { planesService } from "../services/planesService";

export function PaginaPlanes() {
  const [crearPlanModalAbierto, setCrearPlanModalAbierto] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [cambioEstadoPlan, setCambioEstadoPlan] = useState(null);

  const {
    data: planes = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["planes"],
    queryFn: planesService.consultarPlanes,
  });

  const abrirModificarPlanModal = (plan) => {
    setPlanSeleccionado(plan);
  };

  const abrirCambioEstadoPlan = (plan, accion) => {
    setCambioEstadoPlan({ plan, accion });
  };

  return (
    <>
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

              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="etiqueta text-azul-500">Gestión de planes</p>

                  <h1 className="heading-xl mt-3 text-hueso">Planes</h1>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onPress={() => setCrearPlanModalAbierto(true)}
                >
                  <IconPlus size={18} />
                  Crear
                </Button>
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
                    Ocurrió un problema al consultar los planes.
                  </p>
                </div>
              ) : (
                <TablaPlanes
                  planes={planes}
                  onModificar={abrirModificarPlanModal}
                  onDesactivar={(plan) =>
                    abrirCambioEstadoPlan(plan, "desactivar")
                  }
                  onReactivar={(plan) =>
                    abrirCambioEstadoPlan(plan, "reactivar")
                  }
                />
              )}
            </div>
          </div>
        </section>
      </main>

      <CrearPlanModal
        isOpen={crearPlanModalAbierto}
        onOpenChange={setCrearPlanModalAbierto}
      />
      <ModificarPlanModal
        isOpen={planSeleccionado !== null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setPlanSeleccionado(null);
          }
        }}
        plan={planSeleccionado}
      />
      <CambioEstadoPlanModal
        isOpen={cambioEstadoPlan !== null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setCambioEstadoPlan(null);
          }
        }}
        plan={cambioEstadoPlan?.plan}
        accion={cambioEstadoPlan?.accion}
        cambiarEstado={
          cambioEstadoPlan?.accion === "desactivar"
            ? planesService.desactivarPlan
            : planesService.reactivarPlan
        }
      />
    </>
  );
}

export default PaginaPlanes;
