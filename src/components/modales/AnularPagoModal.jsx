import { useState } from "react";
import { Modal, Button, Spinner } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconBan } from "@tabler/icons-react";
import { toast } from "sonner";

import { CampoFormulario } from "../comunes/CampoFormulario";
import { pagosService } from "../../services/pagosService";
import { useAutenticacion } from "../../context/AutenticacionContext";

export function AnularPagoModal({ pago, isOpen, onOpenChange }) {
  const { rol } = useAutenticacion();
  const queryClient = useQueryClient();
  const [motivo, setMotivo] = useState("");

  const esAdminGeneral = rol === "ADMIN_GENERAL";

  const anularMutation = useMutation({
    mutationFn: () => pagosService.anularPago(pago.id, { motivo }),
    onSuccess: () => {
      toast.success("Pago anulado correctamente");
      queryClient.invalidateQueries({ queryKey: ["pagos"] });
      onOpenChange(false);
      setMotivo("");
    },
    onError: (error) => {
      const msj = error.response?.data?.mensaje || "No se pudo anular el pago";
      toast.error("Error al anular", { description: msj });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!esAdminGeneral) {
      toast.error("Acción no autorizada", {
        description: "Solo el Administrador General puede anular pagos.",
      });
      return;
    }
    if (!motivo.trim()) {
      toast.error("Ingresá un motivo de anulación.");
      return;
    }
    anularMutation.mutate();
  };

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant="blur"
        isDismissable={!anularMutation.isPending}
        isKeyboardDismissDisabled={anularMutation.isPending}
      >
        <Modal.Container size="md" placement="center">
          <Modal.Dialog
            aria-labelledby="anular-pago-titulo"
            aria-describedby="anular-pago-descripcion"
            className="border border-hierro-700 bg-hierro-900"
          >
            <form noValidate onSubmit={handleSubmit}>
              <Modal.Header className="border-b border-hierro-800">
                <Modal.Icon className="text-rojo-500">
                  <IconBan size={22} />
                </Modal.Icon>

                <div>
                  <Modal.Heading
                    id="anular-pago-titulo"
                    className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
                  >
                    Anular Pago #{pago?.id}
                  </Modal.Heading>

                  <p
                    id="anular-pago-descripcion"
                    className="mt-1 text-sm text-hierro-400"
                  >
                    Esta acción revertirá el pago registrado.
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="py-6">
                <div className="space-y-4">
                  <p className="text-sm text-hierro-300">
                    ¿Estás seguro de anular el pago correspondiente a <span className="font-semibold text-hueso">{pago?.nombreAlumno} {pago?.apellidoAlumno}</span>?
                  </p>

                  <CampoFormulario
                    label="Motivo de la anulación *"
                    placeholder="Ej: Cobro duplicado o error en el importe"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    maxLength={255}
                    isDisabled={!esAdminGeneral || anularMutation.isPending}
                    isRequired
                  />

                  {!esAdminGeneral && (
                    <p className="text-xs text-rojo-400">
                      Atención: No posees los permisos necesarios (requiere Administrador General).
                    </p>
                  )}
                </div>
              </Modal.Body>

              <Modal.Footer className="border-t border-hierro-800 pt-5">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  isDisabled={anularMutation.isPending}
                  onPress={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="bg-rojo-600 hover:bg-rojo-700 text-white"
                  isDisabled={!esAdminGeneral || anularMutation.isPending}
                >
                  {anularMutation.isPending ? (
                    <>
                      <Spinner size="sm" />
                      Anulando...
                    </>
                  ) : (
                    "Confirmar anulación"
                  )}
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

export default AnularPagoModal;