import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  Modal,
  Button,
  Chip,
  Spinner,
  Table,
} from "@heroui/react";
import {
  IconAlertTriangle,
  IconCalendarEvent,
  IconUserMinus,
  IconUsers,
} from "@tabler/icons-react";
import { toast } from "sonner";

import {
  formatearDiaSemana,
  formatearHora,
} from "../../utils/formatearDiaYHora";
import { turnosService } from "../../services/turnosService";

export function DetalleTurnoModal({
  isOpen,
  onOpenChange,
  turno,
  isPending,
  isError,
}) {
  const queryClient = useQueryClient();

  const [alumnoAEliminar, setAlumnoAEliminar] = useState(null);

  const mutation = useMutation({
    mutationFn: () => turnosService.quitarAlumno(turno.id, alumnoAEliminar.id),

    onSuccess: (turnoActualizado) => {
      queryClient.setQueryData(["turno", turno.id], turnoActualizado);

      toast.success("Inscripción eliminada", {
        description: `Se quitó correctamente a ${alumnoAEliminar.nombre} ${alumnoAEliminar.apellido} del turno "${turnoActualizado.nombreClase}".`,
      });

      setAlumnoAEliminar(null);
    },

    onError: (error) => {
      const respuesta = error?.response?.data;

      toast.error("No se pudo quitar al alumno", {
        description:
          respuesta?.mensaje ??
          "Ocurrió un problema al quitar al alumno del turno.",
      });
    },
  });

  return (
    <>
      <Modal>
        <Modal.Backdrop
          isOpen={isOpen}
          onOpenChange={(abierto) => {
            if (!abierto) {
              setAlumnoAEliminar(null);
            }

            onOpenChange(abierto);
          }}
          variant="blur"
        >
          <Modal.Container placement="auto" size="lg" scroll="inside">
            <Modal.Dialog
              aria-labelledby="detalle-turno-titulo"
              className="border border-hierro-700 bg-hierro-900"
            >
              <Modal.Header>
                <div>
                  <Modal.Heading
                    id="detalle-turno-titulo"
                    className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
                  >
                    Detalle del turno
                  </Modal.Heading>

                  <p className="mt-1 text-sm text-hierro-400">
                    Información del turno y sus alumnos inscriptos.
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="space-y-6 text-sm text-hierro-200">
                {!isOpen ? null : isPending ? (
                  <div className="flex min-h-60 flex-col items-center justify-center gap-3">
                    <Spinner size="lg" />

                    <p className="text-hierro-400">
                      Cargando detalle del turno...
                    </p>
                  </div>
                ) : isError ? (
                  <div className="surface-plate p-6 text-center">
                    <p className="text-sm text-hierro-200">
                      No se pudo cargar el detalle del turno.
                    </p>

                    <p className="mt-2 text-sm text-hierro-400">
                      Ocurrió un problema al consultar la información.
                    </p>
                  </div>
                ) : turno ? (
                  <>
                    <section>
                      <div className="mb-4 flex items-center gap-2 border-b border-hierro-700 pb-3">
                        <IconCalendarEvent
                          size={20}
                          className="text-azul-500"
                        />

                        <h2 className="font-titulos text-base tracking-[0.08em] text-hueso uppercase">
                          Turno
                        </h2>
                      </div>

                      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <dt className="text-xs tracking-wider text-hierro-400 uppercase">
                            Clase
                          </dt>

                          <dd className="mt-1 font-medium text-hueso">
                            {turno.nombreClase}
                          </dd>
                        </div>

                        <div className="sm:col-span-2">
                          <dt className="text-xs tracking-wider text-hierro-400 uppercase">
                            Profesor
                          </dt>

                          <dd className="mt-1 text-hierro-200">
                            {turno.profesorNombre} {turno.profesorApellido}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-xs tracking-wider text-hierro-400 uppercase">
                            Día
                          </dt>

                          <dd className="mt-1 text-hierro-200">
                            {formatearDiaSemana(turno.diaSemana)}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-xs tracking-wider text-hierro-400 uppercase">
                            Horario
                          </dt>

                          <dd className="mt-1 whitespace-nowrap text-hierro-200">
                            {formatearHora(turno.horaInicio)} -{" "}
                            {formatearHora(turno.horaFin)}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-xs tracking-wider text-hierro-400 uppercase">
                            Estado
                          </dt>

                          <dd className="mt-1">
                            <Chip
                              variant="soft"
                              color={turno.activo ? "success" : "danger"}
                            >
                              {turno.activo ? "Activo" : "Inactivo"}
                            </Chip>
                          </dd>
                        </div>
                      </dl>
                    </section>

                    <section>
                      <div className="mb-4 flex items-center gap-2 border-b border-hierro-700 pb-3">
                        <IconUsers size={20} className="text-azul-500" />

                        <h2 className="font-titulos text-base tracking-[0.08em] text-hueso uppercase">
                          Alumnos inscriptos
                        </h2>
                      </div>

                      {turno.alumnos?.length ? (
                        <Table>
                          <Table.ScrollContainer>
                            <Table.Content aria-label="Alumnos inscriptos al turno">
                              <Table.Header>
                                <Table.Column isRowHeader>Nombre</Table.Column>

                                <Table.Column>Apellido</Table.Column>

                                <Table.Column>DNI</Table.Column>

                                {turno.activo ? (
                                  <Table.Column>Acción</Table.Column>
                                ) : null}
                              </Table.Header>

                              <Table.Body items={turno.alumnos}>
                                {(alumno) => (
                                  <Table.Row id={alumno.id}>
                                    <Table.Cell>{alumno.nombre}</Table.Cell>

                                    <Table.Cell>{alumno.apellido}</Table.Cell>

                                    <Table.Cell>{alumno.dni}</Table.Cell>

                                    {turno.activo ? (
                                      <Table.Cell>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          isDisabled={mutation.isPending}
                                          aria-label={`Quitar a ${alumno.nombre} ${alumno.apellido} del turno`}
                                          // Guarda al alumno seleccionado en el estado.
                                          onPress={() =>
                                            setAlumnoAEliminar(alumno)
                                          }
                                        >
                                          <IconUserMinus size={16} />
                                          Quitar
                                        </Button>
                                      </Table.Cell>
                                    ) : null}
                                  </Table.Row>
                                )}
                              </Table.Body>
                            </Table.Content>
                          </Table.ScrollContainer>
                        </Table>
                      ) : (
                        <p className="surface-plate p-5 text-center text-sm text-hierro-400">
                          No hay alumnos inscriptos.
                        </p>
                      )}
                    </section>
                  </>
                ) : (
                  <p className="text-sm text-hierro-400">
                    No se encontró información del turno.
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

      <AlertDialog>
        <AlertDialog.Backdrop
          // Como alumnoAEliminar tiene un alumno, isOpen es true y se abre el AlertDialog.
          isOpen={alumnoAEliminar !== null}
          onOpenChange={(abierto) => {
            if (!abierto && !mutation.isPending) {
              setAlumnoAEliminar(null);
            }
          }}
          variant="blur"
          isDismissable={!mutation.isPending}
          isKeyboardDismissDisabled={mutation.isPending}
        >
          <AlertDialog.Container placement="auto" size="sm">
            <AlertDialog.Dialog
              aria-labelledby="quitar-alumno-titulo"
              aria-describedby="quitar-alumno-descripcion"
              className="border border-hierro-700 bg-hierro-900"
            >
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger">
                  <IconAlertTriangle size={22} />
                </AlertDialog.Icon>

                <AlertDialog.Heading
                  id="quitar-alumno-titulo"
                  className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
                >
                  Quitar alumno
                </AlertDialog.Heading>
              </AlertDialog.Header>

              <AlertDialog.Body
                id="quitar-alumno-descripcion"
                className="text-sm text-hierro-200"
              >
                <p>
                  ¿Deseás quitar a{" "}
                  <span className="font-medium text-hueso">
                    {alumnoAEliminar?.nombre} {alumnoAEliminar?.apellido}
                  </span>{" "}
                  del turno{" "}
                  <span className="font-medium text-hueso">
                    {turno?.nombreClase}
                  </span>
                  ?
                </p>

                <p className="mt-3 text-hierro-400">
                  El alumno dejará de estar inscripto en este turno.
                </p>
              </AlertDialog.Body>

              <AlertDialog.Footer>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  isDisabled={mutation.isPending}
                  onPress={() => setAlumnoAEliminar(null)}
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  isDisabled={mutation.isPending || !alumnoAEliminar}
                  onPress={() => mutation.mutate()}
                >
                  {mutation.isPending ? (
                    <>
                      <Spinner size="sm" />
                      Quitando...
                    </>
                  ) : (
                    "Quitar alumno"
                  )}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </>
  );
}

export default DetalleTurnoModal;
