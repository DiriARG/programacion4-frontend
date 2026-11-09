import { useState } from "react";
import { Modal, Button, Select, Label, ListBox, Spinner } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IconCalendarPlus } from "@tabler/icons-react";
import { toast } from "sonner";

import { CampoFormulario } from "../comunes/CampoFormulario";
import { pagosService } from "../../services/pagosService";
import { usuariosService } from "../../services/usuariosService";
import { planesService } from "../../services/planesService";

const METODOS_PAGO = [
  "EFECTIVO",
  "TRANSFERENCIA",
  "TARJETA_DEBITO",
  "TARJETA_CREDITO",
  "MERCADO_PAGO",
];

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

  const {
    data: alumnos = [],
    isPending: alumnosPendientes,
    isError: alumnosError,
  } = useQuery({
    queryKey: ["alumnos-select"],
    queryFn: () =>
      usuariosService.consultarUsuariosPorTipo
        ? usuariosService.consultarUsuariosPorTipo("alumnos")
        : usuariosService.consultarAlumnos(),
    enabled: isOpen,
  });

  const {
    data: planes = [],
    isPending: planesPendientes,
    isError: planesError,
  } = useQuery({
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
      toast.error("Campos incompletos", {
        description: "Completá los campos obligatorios.",
      });
      return;
    }
    registrarMutation.mutate();
  };

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant="blur"
        isDismissable={!registrarMutation.isPending}
        isKeyboardDismissDisabled={registrarMutation.isPending}
      >
        <Modal.Container size="lg" placement="center" className="max-h-[90vh]">
          <Modal.Dialog
            aria-labelledby="registrar-pago-titulo"
            aria-describedby="registrar-pago-descripcion"
            className="flex flex-col border border-hierro-700 bg-hierro-900 max-h-[85vh] overflow-hidden"
          >
            <form noValidate onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <Modal.Header className="border-b border-hierro-800 shrink-0">
                <Modal.Icon className="text-azul-500">
                  <IconCalendarPlus size={22} />
                </Modal.Icon>

                <div>
                  <Modal.Heading
                    id="registrar-pago-titulo"
                    className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
                  >
                    Registrar pago
                  </Modal.Heading>

                  <p
                    id="registrar-pago-descripcion"
                    className="mt-1 text-sm text-hierro-400"
                  >
                    Completá los datos del cobro que querés registrar en el sistema.
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="overflow-y-auto py-6 flex-1 px-6">
                <div className="space-y-5">
                  <Select
                    className="w-full"
                    variant="secondary"
                    placeholder={
                      alumnosPendientes
                        ? "Cargando alumnos..."
                        : alumnosError
                        ? "No se pudieron cargar los alumnos"
                        : alumnos.length === 0
                        ? "No hay alumnos activos"
                        : "Seleccioná un alumno"
                    }
                    value={form.alumnoId}
                    onChange={(val) =>
                      setForm((prev) => ({ ...prev, alumnoId: val }))
                    }
                    isDisabled={
                      registrarMutation.isPending ||
                      alumnosPendientes ||
                      alumnosError ||
                      alumnos.length === 0
                    }
                  >
                    <Label className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                      Alumno *
                    </Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {alumnos.map((a) => {
                          const nombreCompleto = `${a.nombre} ${a.apellido}`;
                          const textoAlumno = a.dni
                            ? `${nombreCompleto} · DNI ${a.dni}`
                            : nombreCompleto;

                          return (
                            <ListBox.Item
                              key={a.id}
                              id={String(a.id)}
                              textValue={textoAlumno}
                            >
                              {textoAlumno}
                            </ListBox.Item>
                          );
                        })}
                      </ListBox>
                    </Select.Popover>
                  </Select>

                  <Select
                    className="w-full"
                    variant="secondary"
                    placeholder={
                      planesPendientes
                        ? "Cargando planes..."
                        : planesError
                        ? "No se pudieron cargar los planes"
                        : planes.length === 0
                        ? "No hay planes disponibles"
                        : "Seleccioná un plan"
                    }
                    value={form.planId}
                    onChange={(val) => {
                      const planSel = planes.find(
                        (p) => String(p.id) === String(val)
                      );
                      setForm((prev) => ({
                        ...prev,
                        planId: val,
                        montoAbonado: planSel
                          ? planSel.precioMensual || planSel.precio || prev.montoAbonado
                          : prev.montoAbonado,
                      }));
                    }}
                    isDisabled={
                      registrarMutation.isPending ||
                      planesPendientes ||
                      planesError ||
                      planes.length === 0
                    }
                  >
                    <Label className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                      Plan *
                    </Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {planes.map((p) => {
                          const precioPlan = p.precioMensual || p.precio || 0;
                          const textoPlan = `${p.nombre} · $${precioPlan}`;
                          return (
                            <ListBox.Item
                              key={p.id}
                              id={String(p.id)}
                              textValue={textoPlan}
                            >
                              {textoPlan}
                            </ListBox.Item>
                          );
                        })}
                      </ListBox>
                    </Select.Popover>
                  </Select>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <CampoFormulario
                      label="Monto Abonado ($) *"
                      type="number"
                      step="0.01"
                      value={form.montoAbonado}
                      onChange={(e) =>
                        setForm({ ...form, montoAbonado: e.target.value })
                      }
                      isDisabled={registrarMutation.isPending}
                    />

                    <CampoFormulario
                      label="Fecha de Pago *"
                      type="date"
                      value={form.fechaPago}
                      onChange={(e) =>
                        setForm({ ...form, fechaPago: e.target.value })
                      }
                      isDisabled={registrarMutation.isPending}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <CampoFormulario
                      label="Mes del Período (1-12) *"
                      type="number"
                      min={1}
                      max={12}
                      value={form.mesPeriodo}
                      onChange={(e) =>
                        setForm({ ...form, mesPeriodo: e.target.value })
                      }
                      isDisabled={registrarMutation.isPending}
                    />

                    <CampoFormulario
                      label="Año del Período *"
                      type="number"
                      min={2000}
                      max={2100}
                      value={form.anioPeriodo}
                      onChange={(e) =>
                        setForm({ ...form, anioPeriodo: e.target.value })
                      }
                      isDisabled={registrarMutation.isPending}
                    />
                  </div>

                  <Select
                    className="w-full"
                    variant="secondary"
                    value={form.metodoPago}
                    onChange={(val) =>
                      setForm((prev) => ({ ...prev, metodoPago: val }))
                    }
                    isDisabled={registrarMutation.isPending}
                  >
                    <Label className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                      Método de Pago *
                    </Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {METODOS_PAGO.map((m) => (
                          <ListBox.Item key={m} id={m} textValue={m}>
                            {m}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>

                  <div>
                    <Label className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                      Comprobante (opcional)
                    </Label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      disabled={registrarMutation.isPending}
                      className="mt-1 block w-full text-xs text-hierro-400 file:mr-3 file:rounded file:border-0 file:bg-hierro-800 file:px-3 file:py-1.5 file:text-hueso"
                      onChange={(e) =>
                        setComprobanteFile(e.target.files[0] || null)
                      }
                    />
                  </div>
                </div>
              </Modal.Body>

              <Modal.Footer className="border-t border-hierro-800 pt-5 shrink-0 bg-hierro-900 px-6 pb-6">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  isDisabled={registrarMutation.isPending}
                  onPress={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isDisabled={registrarMutation.isPending}
                >
                  {registrarMutation.isPending ? (
                    <>
                      <Spinner size="sm" />
                      Registrando...
                    </>
                  ) : (
                    "Registrar pago"
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

export default RegistrarPagoModal;