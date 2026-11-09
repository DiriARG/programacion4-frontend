import { useState } from "react";
import { Modal, Button, Select, Label, ListBox, Spinner } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CampoFormulario } from "../comunes/CampoFormulario";
import { pagosService } from "../../services/pagosService";
import { usuariosService } from "../../services/usuariosService";
import { planesService } from "../../services/planesService";

const METODOS_PAGO = ["EFECTIVO", "TRANSFERENCIA", "TARJETA_DEBITO", "TARJETA_CREDITO", "MERCADO_PAGO"];

export function RegistrarPagoModal({ isOpen, onOpenChange }) {
  const queryClient = useQueryClient();
  const fechaHoy = new Date().toISOString().split("T")[0];
  const mesActual = new Date().getMonth() + 1;
  const anioActual = new Date().getFullYear();

  const [form, setForm] = useState({
    alumnoId: "",
    planId: "",
    montoAbonado: "",
    fechaPago: fechaHoy,
    mesPeriodo: mesActual,
    anioPeriodo: anioActual,
    metodoPago: "EFECTIVO",
  });
  const [comprobanteFile, setComprobanteFile] = useState(null);

  const { data: alumnos = [] } = useQuery({
    queryKey: ["alumnos-select"],
    queryFn: () => usuariosService.consultarUsuariosPorTipo ? usuariosService.consultarUsuariosPorTipo("alumnos") : usuariosService.consultarAlumnos(),
    enabled: isOpen,
  });

  const { data: planes = [] } = useQuery({
    queryKey: ["planes-select"],
    queryFn: planesService.consultarPlanes,
    enabled: isOpen,
  });

  const registrarMutation = useMutation({
    mutationFn: () => {
      const payload = {
        alumnoId: Number(form.alumnoId),
        planId: Number(form.planId),
        montoAbonado: Number(form.montoAbonado),
        fechaPago: form.fechaPago,
        mesPeriodo: Number(form.mesPeriodo),
        anioPeriodo: Number(form.anioPeriodo),
        metodoPago: form.metodoPago,
      };
      return pagosService.registrarPago(payload, comprobanteFile);
    },
    onSuccess: () => {
      toast.success("Pago registrado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["pagos"] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      const msj = error.response?.data?.mensaje || "Error al registrar el pago";
      toast.error("No se pudo registrar", { description: msj });
    },
  });

  const resetForm = () => {
    setForm({
      alumnoId: "",
      planId: "",
      montoAbonado: "",
      fechaPago: fechaHoy,
      mesPeriodo: mesActual,
      anioPeriodo: anioActual,
      metodoPago: "EFECTIVO",
    });
    setComprobanteFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.alumnoId || !form.planId || !form.montoAbonado) {
      toast.error("Campos incompletos", { description: "Completá los campos obligatorios." });
      return;
    }
    registrarMutation.mutate();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={!registrarMutation.isPending}>
      <div className="surface-plate border border-hierro-700 max-w-lg p-6 w-full rounded-large bg-content1 shadow-medium">
        <h2 className="font-titulos text-lg tracking-[0.08em] text-hueso uppercase mb-4">
          Registrar nuevo pago
        </h2>

        <div>
          <form id="form-pago" onSubmit={handleSubmit} className="space-y-4">
            <Select
              className="w-full"
              variant="secondary"
              placeholder="Seleccioná un alumno"
              value={form.alumnoId}
              onChange={(val) => setForm((prev) => ({ ...prev, alumnoId: val }))}
            >
              <Label className="font-titulos text-xs text-hierro-200 uppercase">Alumno *</Label>
              <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {alumnos.map((a) => (
                    <ListBox.Item key={a.id} id={String(a.id)} textValue={`${a.nombre} ${a.apellido}`}>
                      {a.nombre} {a.apellido} (DNI: {a.dni})
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>

            <Select
              className="w-full"
              variant="secondary"
              placeholder="Seleccioná un plan"
              value={form.planId}
              onChange={(val) => {
                const planSel = planes.find((p) => String(p.id) === String(val));
                setForm((prev) => ({
                  ...prev,
                  planId: val,
                  montoAbonado: planSel ? planSel.precio : prev.montoAbonado,
                }));
              }}
            >
              <Label className="font-titulos text-xs text-hierro-200 uppercase">Plan *</Label>
              <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {planes.map((p) => (
                    <ListBox.Item key={p.id} id={String(p.id)} textValue={p.nombre}>
                      {p.nombre} (${p.precio})
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <CampoFormulario
                label="Monto Abonado ($) *"
                type="number"
                step="0.01"
                value={form.montoAbonado}
                onChange={(e) => setForm({ ...form, montoAbonado: e.target.value })}
              />
              <CampoFormulario
                label="Fecha de Pago *"
                type="date"
                value={form.fechaPago}
                onChange={(e) => setForm({ ...form, fechaPago: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CampoFormulario
                label="Mes del Período (1-12) *"
                type="number"
                min={1}
                max={12}
                value={form.mesPeriodo}
                onChange={(e) => setForm({ ...form, mesPeriodo: e.target.value })}
              />
              <CampoFormulario
                label="Año del Período *"
                type="number"
                min={2000}
                max={2100}
                value={form.anioPeriodo}
                onChange={(e) => setForm({ ...form, anioPeriodo: e.target.value })}
              />
            </div>

            <Select
              className="w-full"
              variant="secondary"
              value={form.metodoPago}
              onChange={(val) => setForm((prev) => ({ ...prev, metodoPago: val }))}
            >
              <Label className="font-titulos text-xs text-hierro-200 uppercase">Método de Pago *</Label>
              <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {METODOS_PAGO.map((m) => (
                    <ListBox.Item key={m} id={m} textValue={m}>{m}</ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>

            <div>
              <Label className="font-titulos text-xs text-hierro-200 uppercase">
                Comprobante (opcional)
              </Label>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="mt-1 block w-full text-xs text-hierro-400 file:mr-3 file:rounded file:border-0 file:bg-hierro-800 file:px-3 file:py-1.5 file:text-hueso"
                onChange={(e) => setComprobanteFile(e.target.files[0] || null)}
              />
            </div>
          </form>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onPress={() => onOpenChange(false)} isDisabled={registrarMutation.isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-pago"
            variant="primary"
            isDisabled={registrarMutation.isPending}
          >
            <span>
              {registrarMutation.isPending ? <Spinner size="sm" /> : "Guardar pago"}
            </span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}