import { useState } from "react";
import { Modal, Button, Spinner } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CampoFormulario } from "../comunes/CampoFormulario";
import { pagosService } from "../../services/pagosService";

export function AnularPagoModal({ pago, isOpen, onOpenChange }) {
  const queryClient = useQueryClient();
  const [motivo, setMotivo] = useState("");

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
    if (!motivo.trim()) {
      toast.error("Ingresá un motivo de anulación.");
      return;
    }
    anularMutation.mutate();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={!anularMutation.isPending}>
      <div className="surface-plate border border-hierro-700 max-w-md p-6 w-full rounded-large bg-content1 shadow-medium">
        <h2 className="font-titulos text-lg tracking-[0.08em] text-hueso uppercase mb-4">
          Anular Pago #{pago?.id}
        </h2>
        
        <div>
          <form id="form-anular" onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-hierro-300">
              ¿Estás seguro de anular el pago de <span className="font-semibold text-hueso">{pago?.nombreAlumno} {pago?.apellidoAlumno}</span>?
            </p>

            <CampoFormulario
              label="Motivo de la anulación *"
              placeholder="Ej: Cobro duplicado o error en el importe"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              maxLength={255}
            />
          </form>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onPress={() => onOpenChange(false)} isDisabled={anularMutation.isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-anular"
            variant="primary"
            className="bg-rojo-600 hover:bg-rojo-700 text-white"
            isDisabled={anularMutation.isPending}
          >
            {anularMutation.isPending ? <Spinner size="sm" /> : "Confirmar anulación"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}