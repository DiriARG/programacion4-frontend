import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Spinner } from "@heroui/react";
import { IconPlus } from "@tabler/icons-react";

import { TablaPlanes } from "../components/planes/TablaPlanes";
import { CrearPlanModal } from "../components/modales/CrearPlanModal";
import { ModificarPlanModal } from "../components/modales/ModificarPlanModal";
import { planesService } from "../services/planesService";

export function PaginaPlanes() {
  const [crearPlanModalAbierto, setCrearPlanModalAbierto] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);

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

  return (
    <>
      <main className="min-h-screen bg-hierro-950 pt-10 pb-16">
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
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
    </>
  );
}

export default PaginaPlanes;
