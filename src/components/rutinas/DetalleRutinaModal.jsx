import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Chip, Modal, Spinner, Tabs } from "@heroui/react";
import {
  IconCalendarEvent,
  IconClipboardList,
  IconUser,
} from "@tabler/icons-react";

import { rutinasService } from "../../services/rutinasService";
import { formatearFecha } from "../../utils/formatearDiaYHora";
import { TarjetaEjercicioDetalle } from "./TarjetaEjercicioDetalle";

const DIAS_SEMANA = [
  { id: "LUNES", corto: "Lun", nombre: "Lunes" },
  { id: "MARTES", corto: "Mar", nombre: "Martes" },
  { id: "MIERCOLES", corto: "Mié", nombre: "Miércoles" },
  { id: "JUEVES", corto: "Jue", nombre: "Jueves" },
  { id: "VIERNES", corto: "Vie", nombre: "Viernes" },
  { id: "SABADO", corto: "Sáb", nombre: "Sábado" },
  { id: "DOMINGO", corto: "Dom", nombre: "Domingo" },
];

export function DetalleRutinaModal({ isOpen, onOpenChange, rutina }) {
  const [diaSeleccionado, setDiaSeleccionado] = useState("LUNES");

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

  const ejerciciosRutina = rutinaDetalle?.ejercicios ?? [];

  // Selecciona el primer día que tenga ejercicios al abrir la rutina.
  useEffect(() => {
    // Cuando se cierra el modal se restablece el día seleccionado para la próxima apertura.
    if (!isOpen) {
      setDiaSeleccionado("LUNES");
      return;
    }

    // Espera a que termine la consulta inicial de la rutina.
    if (!rutinaDetalle) {
      return;
    }

    /* Busca el primer día de la semana que tenga al menos un ejercicio asignado.
    find devuelve el primer día que cumple la condición y el some comprueba si existe al menos un ejercicio asígnado a ese dia. */
    const primerDiaConEjercicios = DIAS_SEMANA.find((dia) =>
      rutinaDetalle.ejercicios.some(
        (ejercicio) => ejercicio.diaSemana === dia.id,
      ),
    );

    // Toda rutina válida contiene ejercicios, por lo que debería encontrarse un día, el if es defensivo.
    if (primerDiaConEjercicios) {
      setDiaSeleccionado(primerDiaConEjercicios.id);
    }
  }, [isOpen, rutina?.id, rutinaDetalle]); // Se ejecuta al abir/cerrar el modal, cuando se selecciona una rutina diferente o cuando se recibe o actualiza el detalle de la rutina.

  const nombreAlumno = rutinaDetalle
    ? `${rutinaDetalle.alumnoNombre} ${rutinaDetalle.alumnoApellido}`
    : "";

  const nombreProfesor = rutinaDetalle
    ? `${rutinaDetalle.profesorNombre} ${rutinaDetalle.profesorApellido}`
    : "";

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
                <>
                  <section className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="heading-lg text-hueso">
                        {rutinaDetalle.nombre}
                      </h2>

                      <Chip
                        variant="soft"
                        color={rutinaDetalle.activa ? "success" : "danger"}
                      >
                        {rutinaDetalle.activa ? "Activa" : "Inactiva"}
                      </Chip>
                    </div>

                    <Card
                      variant="secondary"
                      className="border border-hierro-700 bg-hierro-800"
                    >
                      <Card.Content className="grid grid-cols-1 gap-5 p-5 md:grid-cols-3">
                        <div className="flex items-center gap-3">
                          <IconUser
                            size={22}
                            className="shrink-0 text-hierro-400"
                          />

                          <div className="min-w-0">
                            <p className="text-xs text-hierro-400">Alumno</p>

                            <p className="mt-1 font-medium text-hueso">
                              {nombreAlumno}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <IconClipboardList
                            size={22}
                            className="shrink-0 text-hierro-400"
                          />

                          <div className="min-w-0">
                            <p className="text-xs text-hierro-400">
                              Creada por
                            </p>

                            <p className="mt-1 font-medium text-hueso">
                              {nombreProfesor}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <IconCalendarEvent
                            size={22}
                            className="shrink-0 text-hierro-400"
                          />

                          <div className="min-w-0">
                            <p className="text-xs text-hierro-400">
                              Fecha de creación
                            </p>

                            <p className="mt-1 font-medium text-hueso">
                              {formatearFecha(rutinaDetalle.fechaCreacion)}
                            </p>
                          </div>
                        </div>
                      </Card.Content>
                    </Card>
                  </section>

                  <section className="space-y-4 border-t border-hierro-700 pt-5">
                    <div>
                      <h2 className="font-titulos text-base tracking-[0.08em] text-hueso uppercase">
                        Planificación semanal
                      </h2>

                      <p className="mt-1 text-sm text-hierro-400">
                        Seleccioná un día para consultar sus ejercicios.
                      </p>
                    </div>

                    <Tabs
                      variant="secondary"
                      selectedKey={diaSeleccionado}
                      onSelectionChange={(dia) =>
                        setDiaSeleccionado(String(dia))
                      }
                    >
                      <Tabs.ListContainer>
                        <Tabs.List aria-label="Días de la rutina">
                          {DIAS_SEMANA.map((dia) => (
                            <Tabs.Tab id={dia.id} key={dia.id}>
                              {dia.corto}
                              <Tabs.Indicator />
                            </Tabs.Tab>
                          ))}
                        </Tabs.List>
                      </Tabs.ListContainer>

                      {DIAS_SEMANA.map((dia) => {
                        // Se obtienen los ejercicios del día actual y se los ordena según su posición en la rutina.
                        const ejerciciosDelDia = ejerciciosRutina
                          .filter((ejercicio) => ejercicio.diaSemana === dia.id)
                          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

                        return (
                          <Tabs.Panel id={dia.id} key={dia.id} className="pt-4">
                            {diaSeleccionado === dia.id ? (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                  <h3 className="font-titulos text-base text-hueso">
                                    {dia.nombre}
                                  </h3>

                                  <span className="text-xs text-hierro-400">
                                    {ejerciciosDelDia.length}{" "}
                                    {ejerciciosDelDia.length === 1
                                      ? "ejercicio"
                                      : "ejercicios"}
                                  </span>
                                </div>

                                {ejerciciosDelDia.length > 0 ? (
                                  <div className="space-y-3">
                                    {ejerciciosDelDia.map(
                                      (ejercicio, indice) => (
                                        <TarjetaEjercicioDetalle
                                          key={ejercicio.id}
                                          ejercicio={ejercicio}
                                        />
                                      ),
                                    )}
                                  </div>
                                ) : (
                                  <p className="surface-plate p-5 text-center text-sm text-hierro-400">
                                    No hay ejercicios planificados para este
                                    día.
                                  </p>
                                )}
                              </div>
                            ) : null}
                          </Tabs.Panel>
                        );
                      })}
                    </Tabs>
                  </section>
                </>
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
