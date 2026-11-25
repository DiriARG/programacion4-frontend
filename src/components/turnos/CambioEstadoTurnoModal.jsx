import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, Button, Spinner } from "@heroui/react";
import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { toast } from "sonner";

export function CambioEstadoTurnoModal({
  isOpen,
  onOpenChange,
  turno,
  accion,
  cambiarEstado,
}) {
  const queryClient = useQueryClient();

  const estaDesactivando = accion === "desactivar";
  const nombreTurno = turno ? turno.nombreClase : "";

  const mutation = useMutation({
    mutationFn: () => cambiarEstado(turno.id),

    onSuccess: (turnoActualizado) => {
      queryClient.invalidateQueries({ queryKey: ["turnos"] });
      queryClient.invalidateQueries({ queryKey: ["turno", turno.id] });

      toast.success(
        estaDesactivando ? "Turno desactivado" : "Turno reactivado",
        {
          description: estaDesactivando
            ? `Se desactivó correctamente el turno "${turnoActualizado.nombreClase}".`
            : `Se reactivó correctamente el turno "${turnoActualizado.nombreClase}".`,
        },
      );

      onOpenChange(false);
    },

    onError: (error) => {
      const respuesta = error?.response?.data;

      toast.error(
        estaDesactivando
          ? "No se pudo desactivar el turno"
          : "No se pudo reactivar el turno",
        {
          description:
            respuesta?.mensaje ??
            "Ocurrió un problema al cambiar el estado del turno.",
        },
      );
    },
  });
  
  
  // Evita mostrar el diálogo mientras se limpia el turno al cerrarlo (sucede al apretar el botón "Cancelar" de la acción "Desactivar turno").
  if (!turno) {
    return null;
  }
  
  return (
    <AlertDialog>
      <AlertDialog.Backdrop
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant="blur"
      >
        <AlertDialog.Container placement="auto" size="sm">
          <AlertDialog.Dialog
            aria-labelledby="cambio-estado-turno-titulo"
            aria-describedby="cambio-estado-turno-descripcion"
            className="border border-hierro-700 bg-hierro-900"
          >
            <AlertDialog.Header>
              <AlertDialog.Icon
                status={estaDesactivando ? "danger" : "success"}
              >
                {estaDesactivando ? (
                  <IconAlertTriangle size={22} />
                ) : (
                  <IconCircleCheck size={22} />
                )}
              </AlertDialog.Icon>

              <AlertDialog.Heading
                id="cambio-estado-turno-titulo"
                className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
              >
                {estaDesactivando ? "Desactivar turno" : "Reactivar turno"}
              </AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body
              id="cambio-estado-turno-descripcion"
              className="text-sm text-hierro-200"
            >
              <p>
                ¿Deseás {estaDesactivando ? "desactivar" : "reactivar"} el turno{" "}
                <span className="font-medium text-hueso">{nombreTurno}</span>?
              </p>

              <p className="mt-3 text-hierro-400">
                {estaDesactivando
                  ? "El turno dejará de estar activo. Las inscripciones existentes se conservarán."
                  : "Para reactivarlo, el profesor debe estar activo y no debe haber superposiciones horarias con otros turnos activos del profesor ni de los alumnos inscriptos."}
              </p>
            </AlertDialog.Body>

            <AlertDialog.Footer>
              <Button
                type="button"
                variant="secondary"
                size="md"
                isDisabled={mutation.isPending}
                onPress={() => onOpenChange(false)}
              >
                Cancelar
              </Button>

              <Button
                type="button"
                variant={estaDesactivando ? "danger" : "primary"}
                size="md"
                isDisabled={mutation.isPending}
                onPress={() => mutation.mutate()}
              >
                {mutation.isPending ? (
                  <>
                    <Spinner size="sm" />
                    {estaDesactivando ? "Desactivando..." : "Reactivando..."}
                  </>
                ) : estaDesactivando ? (
                  "Desactivar"
                ) : (
                  "Reactivar"
                )}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}

export default CambioEstadoTurnoModal;
