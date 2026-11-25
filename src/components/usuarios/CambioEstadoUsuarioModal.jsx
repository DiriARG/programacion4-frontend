import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, Button, Spinner } from "@heroui/react";
import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { toast } from "sonner";

export function CambioEstadoUsuarioModal({
  isOpen,
  onOpenChange,
  usuario,
  accion,
  cambiarEstado,
}) {
  const queryClient = useQueryClient();

  const estaDesactivando = accion === "desactivar";
  const nombreCompleto = usuario ? `${usuario.nombre} ${usuario.apellido}` : "";

  const mutation = useMutation({
    mutationFn: () => cambiarEstado(usuario.id),

    onSuccess: (usuarioActualizado) => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });

      toast.success(
        estaDesactivando ? "Usuario desactivado" : "Usuario reactivado",
        {
          description: estaDesactivando
            ? `Se desactivó correctamente a ${usuarioActualizado.nombre} ${usuarioActualizado.apellido}.`
            : `Se reactivó correctamente a ${usuarioActualizado.nombre} ${usuarioActualizado.apellido}.`,
        },
      );

      onOpenChange(false);
    },

    onError: (error) => {
      const respuesta = error?.response?.data;

      toast.error(
        estaDesactivando
          ? "No se pudo desactivar el usuario"
          : "No se pudo reactivar el usuario",
        {
          description:
            respuesta?.mensaje ??
            "Ocurrió un problema al cambiar el estado del usuario.",
        },
      );
    },
  });

  if (!usuario) {
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
            aria-labelledby="cambio-estado-usuario-titulo"
            aria-describedby="cambio-estado-usuario-descripcion"
            className="border border-hierro-700 bg-hierro-900"
          >
            <AlertDialog.Header>
              <AlertDialog.Icon status={estaDesactivando ? "danger" : "success"}>
                {estaDesactivando ? (
                  <IconAlertTriangle size={22} />
                ) : (
                  <IconCircleCheck size={22} />
                )}
              </AlertDialog.Icon>

              <AlertDialog.Heading
                id="cambio-estado-usuario-titulo"
                className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
              >
                {estaDesactivando ? "Desactivar usuario" : "Reactivar usuario"}
              </AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body
              id="cambio-estado-usuario-descripcion"
              className="text-sm text-hierro-200"
            >
              <p>
                ¿Deseás {estaDesactivando ? "desactivar" : "reactivar"} a{" "}
                <span className="font-medium text-hueso">{nombreCompleto}</span>
                ?
              </p>

              {estaDesactivando ? (
                <>
                  <p className="mt-3 text-hierro-400">
                    El usuario no podrá iniciar sesión mientras se encuentre
                    inactivo.
                  </p>

                  {usuario.rol === "PROFESOR" ? (
                    <p className="mt-2 text-hierro-400">
                      Sus turnos activos también pasarán a estado inactivo.
                    </p>
                  ) : null}
                </>
              ) : usuario.rol === "PROFESOR" ? (
                <p className="mt-3 text-hierro-400">
                  La reactivación del profesor no reactiva automáticamente sus
                  turnos.
                </p>
              ) : null}
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

export default CambioEstadoUsuarioModal;
