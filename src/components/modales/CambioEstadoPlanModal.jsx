import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, Button, Spinner } from "@heroui/react";
import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { toast } from "sonner";

export function CambioEstadoPlanModal({
  isOpen,
  onOpenChange,
  plan,
  accion,
  cambiarEstado,
}) {
  const queryClient = useQueryClient();

  const estaDesactivando = accion === "desactivar";

  const nombrePlan = plan ? plan.nombre : "";

  const mutation = useMutation({
    mutationFn: () => cambiarEstado(plan.id),

    onSuccess: (planActualizado) => {
      queryClient.invalidateQueries({ queryKey: ["planes"] });

      toast.success(estaDesactivando ? "Plan desactivado" : "Plan reactivado", {
        description: estaDesactivando
          ? `Se desactivó correctamente el plan ${planActualizado.nombre}.`
          : `Se reactivó correctamente el plan ${planActualizado.nombre}.`,
      });

      onOpenChange(false);
    },

    onError: (error) => {
      const respuesta = error?.response?.data;

      toast.error(
        estaDesactivando
          ? "No se pudo desactivar el plan"
          : "No se pudo reactivar el plan",
        {
          description:
            respuesta?.mensaje ??
            "Ocurrió un problema al cambiar el estado del plan.",
        },
      );
    },
  });

  return (
    <AlertDialog>
      <AlertDialog.Backdrop
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant="blur"
      >
        <AlertDialog.Container placement="auto" size="sm">
          <AlertDialog.Dialog
            aria-labelledby="cambio-estado-plan-titulo"
            aria-describedby="cambio-estado-plan-descripcion"
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
                id="cambio-estado-plan-titulo"
                className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
              >
                {estaDesactivando ? "Desactivar plan" : "Reactivar plan"}
              </AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body
              id="cambio-estado-plan-descripcion"
              className="text-sm text-hierro-200"
            >
              <p>
                ¿Deseás {estaDesactivando ? "desactivar" : "reactivar"} el plan{" "}
                <span className="font-medium text-hueso">{nombrePlan}</span>?
              </p>

              <p className="mt-3 text-hierro-400">
                {estaDesactivando
                  ? "El plan dejará de estar disponible como plan activo."
                  : "El plan volverá a estar disponible entre los planes activos."}
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

export default CambioEstadoPlanModal;
