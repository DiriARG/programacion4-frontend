import { Button, Modal, Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";

import { rutinasService } from "../../services/rutinasService";
import { ContenidoDetalleRutina } from "./ContenidoDetalleRutina";

export function DetalleRutinaModal({ isOpen, onOpenChange, rutina }) {
  const {
    data: rutinaDetalle,
    isPending,
    isError,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["rutinas", rutina?.id, "detalle"],
    queryFn: () => rutinasService.consultarRutina(rutina.id),
    enabled: isOpen && Boolean(rutina?.id),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const mensajeError =
    error?.response?.data?.mensaje ??
    error?.message ??
    "Ocurrió un problema al consultar la información de la rutina.";

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant="blur"
        isDismissable
      >
        <Modal.Container placement="auto" size="cover" scroll="inside">
          <Modal.Dialog
            aria-labelledby="detalle-rutina-titulo"
            className="flex h-[90vh] w-[95vw] max-w-[1100px] flex-col border border-hierro-700 bg-hierro-900"
          >
            <Modal.CloseTrigger />

            <Modal.Header>
              <div>
                <Modal.Heading
                  id="detalle-rutina-titulo"
                  className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
                >
                  Detalle de la rutina
                </Modal.Heading>

                <p className="mt-1 text-sm text-hierro-400">
                  Información general y planificación semanal.
                </p>
              </div>
            </Modal.Header>

            <Modal.Body className="min-h-0 flex-1 space-y-6">
              {!isOpen ? null : isPending ? (
                <div className="flex min-h-60 flex-col items-center justify-center gap-3">
                  <Spinner size="lg" />

                  <p className="text-sm text-hierro-400">
                    Cargando detalle de la rutina...
                  </p>
                </div>
              ) : rutinaDetalle ? (
                /* Se pasa la rutina consultada para mostrar su información y ejercicios asociados. */
                <ContenidoDetalleRutina rutina={rutinaDetalle} />
              ) : isError ? (
                <div className="surface-plate flex min-h-60 flex-col items-center justify-center gap-3 p-6 text-center">
                  <p className="text-sm text-hierro-200">
                    No se pudo cargar el detalle de la rutina.
                  </p>

                  <p className="text-sm text-hierro-400">{mensajeError}</p>

                  <Button
                    type="button"
                    variant="secondary"
                    onPress={() => refetch()}
                    isDisabled={isFetching}
                  >
                    Reintentar
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-hierro-400">
                  No se encontró información de la rutina.
                </p>
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onPress={() => onOpenChange(false)}
              >
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

export default DetalleRutinaModal;
