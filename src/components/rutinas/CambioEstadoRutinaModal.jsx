import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, Button, Spinner } from "@heroui/react";
import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { toast } from "sonner";

export function CambioEstadoRutinaModal({
  isOpen,
  onOpenChange,
  rutina,
  accion,
  cambiarEstado,
}) {
  const queryClient = useQueryClient();

  const estaDesactivando = accion === "desactivar";

  const nombreAlumno = rutina
    ? `${rutina.alumnoNombre} ${rutina.alumnoApellido}`
    : "";

  const mutation = useMutation({
    mutationFn: () => cambiarEstado(rutina.id),

    onSuccess: async (rutinaActualizada) => {
      await queryClient.invalidateQueries({ queryKey: ["rutinas"] });

      toast.success(
        estaDesactivando ? "Rutina desactivada" : "Rutina reactivada",
        {
          description: estaDesactivando
            ? `Se desactivó correctamente la rutina "${rutinaActualizada.nombre}" de ${rutinaActualizada.alumnoNombre} ${rutinaActualizada.alumnoApellido}.`
            : `Se reactivó correctamente la rutina "${rutinaActualizada.nombre}" de ${rutinaActualizada.alumnoNombre} ${rutinaActualizada.alumnoApellido}.`,
        },
      );

      onOpenChange(false);
    },

    onError: (error) => {
      const respuesta = error?.response?.data;

      toast.error(
        estaDesactivando
          ? "No se pudo desactivar la rutina"
          : "No se pudo reactivar la rutina",
        {
          description:
            respuesta?.mensaje ??
            "Ocurrió un problema al cambiar el estado de la rutina.",
        },
      );
    },
  });

  if (!rutina) {
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
            aria-labelledby="cambio-estado-rutina-titulo"
            aria-describedby="cambio-estado-rutina-descripcion"
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
                id="cambio-estado-rutina-titulo"
                className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
              >
                {estaDesactivando ? "Desactivar rutina" : "Reactivar rutina"}
              </AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body
              id="cambio-estado-rutina-descripcion"
              className="text-sm text-hierro-200"
            >
              <p>
                ¿Deseás {estaDesactivando ? "desactivar" : "reactivar"} la
                rutina{" "}
                <span className="font-medium text-hueso">{rutina.nombre}</span>{" "}
                de{" "}
                <span className="font-medium text-hueso">{nombreAlumno}</span>?
              </p>

              <p className="mt-3 text-hierro-400">
                {estaDesactivando
                  ? "La rutina dejará de estar activa, pero se conservarán sus datos y ejercicios asociados."
                  : "La rutina volverá a estar activa. El alumno no debe tener otra rutina activa; de lo contrario, el sistema rechazará la operación."}
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

export default CambioEstadoRutinaModal;
