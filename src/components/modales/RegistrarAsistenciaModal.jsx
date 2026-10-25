import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  FieldError,
  Label,
  ListBox,
  Modal,
  Select,
  Spinner,
} from "@heroui/react";
import { IconCalendarPlus } from "@tabler/icons-react";
import { toast } from "sonner";

import { CampoFormulario } from "../comunes/CampoFormulario";
import { registrarAsistenciaSchema } from "../../schemas/registrarAsistenciaSchema";
import { asistenciasService } from "../../services/asistenciasService";
import { turnosService } from "../../services/turnosService";
import { usuariosService } from "../../services/usuariosService";
import { useAutenticacion } from "../../context/AutenticacionContext";
import {
  formatearDiaSemana,
  formatearHora,
} from "../../utils/formatearDiaYHora";

const obtenerValoresIniciales = () => {
  const ahora = new Date();

  const anio = ahora.getFullYear();
  // padStart(2, "0") asegura que tenga al menos dos caracteres y agrega un 0 a la izquierda cuando tiene un solo dígito (ej: 3 --> 03) así respeta el formato YYY-MM-DD.
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");

  return {
    alumnoId: "",
    turnoId: "LIBRE",
    fecha: `${anio}-${mes}-${dia}`,
    hora: `${horas}:${minutos}`,
  };
};

export function RegistrarAsistenciaModal({ isOpen, onOpenChange }) {
  const { rol } = useAutenticacion();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrarAsistenciaSchema),
    defaultValues: obtenerValoresIniciales(),
    mode: "onBlur",
  });

  const {
    data: alumnos = [],
    isPending: alumnosPendientes,
    isError: alumnosError,
  } = useQuery({
    queryKey: ["alumnos", "activos"],
    queryFn: usuariosService.consultarAlumnosActivos,
    enabled: isOpen,
  });

  const {
    data: turnos = [],
    isPending: turnosPendientes,
    isError: turnosError,
  } = useQuery({
    queryKey: rol === "PROFESOR" ? ["turnos", "profesor"] : ["turnos"],
    queryFn:
      rol === "PROFESOR"
        ? turnosService.consultarTurnosProfesor
        : turnosService.consultarTurnos,
    enabled: isOpen,
  });

  const turnosActivos = turnos.filter((turno) => turno.activo === true);

  useEffect(() => {
    if (isOpen) {
      reset(obtenerValoresIniciales());
    }
  }, [isOpen, reset]);

  const mutation = useMutation({
    mutationFn: (data) => asistenciasService.registrarAsistencia(data),

    onSuccess: async (asistenciaCreada) => {
      queryClient.invalidateQueries({ queryKey: ["asistencias"] });

      toast.success("Asistencia registrada", {
        description: `Se registró correctamente la asistencia de ${asistenciaCreada.alumnoNombre} ${asistenciaCreada.alumnoApellido}.`,
      });
      reset(obtenerValoresIniciales());
      onOpenChange(false);
    },

    onError: (error) => {
      const respuesta = error?.response?.data;

      if (respuesta?.erroresValidacion) {
        Object.entries(respuesta.erroresValidacion).forEach(
          ([campo, mensaje]) => {
            setError(campo, {
              type: "server",
              message: mensaje,
            });
          },
        );

        return;
      }

      toast.error("No se pudo registrar la asistencia", {
        description:
          respuesta?.mensaje ??
          "Ocurrió un problema al registrar la asistencia.",
      });
    },
  });

  const onSubmit = (data) => {
    clearErrors();
    mutation.mutate(data);
  };

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant="blur"
        isDismissable={!mutation.isPending}
        isKeyboardDismissDisabled={mutation.isPending}
      >
        <Modal.Container size="lg" placement="center" className="max-h-[90vh]">
          <Modal.Dialog
            aria-labelledby="registrar-asistencia-titulo"
            aria-describedby="registrar-asistencia-descripcion"
            className="border border-hierro-700 bg-hierro-900"
          >
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Modal.Header className="border-b border-hierro-800">
                <Modal.Icon className="text-azul-500">
                  <IconCalendarPlus size={22} />
                </Modal.Icon>

                <div>
                  <Modal.Heading
                    id="registrar-asistencia-titulo"
                    className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
                  >
                    Registrar asistencia
                  </Modal.Heading>

                  <p
                    id="registrar-asistencia-descripcion"
                    className="mt-1 text-sm text-hierro-400"
                  >
                    Completá los datos de la asistencia que querés registrar.
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="max-h-[60vh] overflow-y-auto py-6">
                <div className="space-y-5">
                  <Controller
                    name="alumnoId"
                    control={control}
                    render={({ field }) => (
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
                        name={field.name}
                        value={field.value || null}
                        onChange={(valor) => field.onChange(valor ?? "")}
                        onBlur={field.onBlur}
                        isRequired
                        isInvalid={Boolean(errors.alumnoId)}
                        isDisabled={
                          mutation.isPending ||
                          alumnosPendientes ||
                          alumnosError ||
                          alumnos.length === 0
                        }
                      >
                        <Label className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                          Alumno
                        </Label>

                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>

                        <Select.Popover>
                          <ListBox>
                            {alumnos.map((alumno) => {
                              const nombreCompleto = `${alumno.nombre} ${alumno.apellido}`;

                              const textoAlumno = alumno.dni
                                ? `${nombreCompleto} · DNI ${alumno.dni}`
                                : nombreCompleto;

                              return (
                                <ListBox.Item
                                  key={alumno.id}
                                  id={String(alumno.id)}
                                  textValue={textoAlumno}
                                >
                                  {textoAlumno}
                                </ListBox.Item>
                              );
                            })}
                          </ListBox>
                        </Select.Popover>

                        {errors.alumnoId ? (
                          <FieldError>{errors.alumnoId.message}</FieldError>
                        ) : null}
                      </Select>
                    )}
                  />

                  {alumnosPendientes ? (
                    <p className="mt-2 text-xs text-hierro-400">
                      Cargando alumnos activos...
                    </p>
                  ) : alumnosError ? (
                    <p className="mt-2 text-xs text-hierro-400">
                      No se pudieron consultar los alumnos. Cerrá y volvé a
                      abrir el formulario para intentarlo nuevamente.
                    </p>
                  ) : alumnos.length === 0 ? (
                    <p className="mt-2 text-xs text-hierro-400">
                      No hay alumnos activos disponibles para registrar
                      asistencias.
                    </p>
                  ) : null}

                  <Controller
                    name="turnoId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        className="w-full"
                        variant="secondary"
                        placeholder={
                          turnosPendientes
                            ? "Cargando turnos..."
                            : turnosError
                              ? "No se pudieron cargar los turnos"
                              : turnosActivos.length === 0
                                ? "No hay turnos activos"
                                : "Entrenamiento libre (sin turno)"
                        }
                        name={field.name}
                        value={field.value || null}
                        onChange={(valor) => field.onChange(valor ?? "")}
                        onBlur={field.onBlur}
                        isInvalid={Boolean(errors.turnoId)}
                        isDisabled={
                          mutation.isPending ||
                          turnosPendientes ||
                          turnosError ||
                          turnosActivos.length === 0
                        }
                      >
                        <Label className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                          Turno (opcional)
                        </Label>

                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>

                        <Select.Popover>
                          <ListBox>
                            <ListBox.Item
                              id="LIBRE"
                              textValue="Entrenamiento libre (sin turno)"
                            >
                              Entrenamiento libre (sin turno)
                            </ListBox.Item>

                            {turnosActivos.map((turno) => {
                              const nombreTurno = [
                                turno.nombreClase,
                                formatearDiaSemana(turno.diaSemana),
                                `${formatearHora(turno.horaInicio)} - ${formatearHora(turno.horaFin)}`,
                              ]
                                .filter(Boolean)
                                .join(" · ");

                              return (
                                <ListBox.Item
                                  key={turno.id}
                                  id={String(turno.id)}
                                  textValue={nombreTurno}
                                >
                                  {nombreTurno}
                                </ListBox.Item>
                              );
                            })}
                          </ListBox>
                        </Select.Popover>

                        {errors.turnoId ? (
                          <FieldError>{errors.turnoId.message}</FieldError>
                        ) : null}
                      </Select>
                    )}
                  />

                  {turnosPendientes ? (
                    <p className="mt-2 text-xs text-hierro-400">
                      Cargando turnos activos...
                    </p>
                  ) : turnosError ? (
                    <p className="mt-2 text-xs text-hierro-400">
                      No se pudieron cargar los turnos. Podés registrar un
                      entrenamiento libre; para elegir un turno, volvé a
                      intentarlo.
                    </p>
                  ) : turnosActivos.length === 0 ? (
                    <p className="mt-2 text-xs text-hierro-400">
                      No hay turnos activos. Podés registrar un entrenamiento
                      libre.
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-hierro-400">
                      Si no seleccionás un turno, se registrará como
                      entrenamiento libre. Si elegís uno, el alumno debe estar
                      inscripto en él.
                    </p>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <CampoFormulario
                      label="Fecha"
                      type="date"
                      registration={register("fecha")}
                      error={errors.fecha?.message}
                      isRequired
                      isDisabled={mutation.isPending}
                    />

                    <CampoFormulario
                      label="Hora"
                      type="time"
                      registration={register("hora")}
                      error={errors.hora?.message}
                      isRequired
                      isDisabled={mutation.isPending}
                    />
                  </div>
                </div>
              </Modal.Body>

              <Modal.Footer className="border-t border-hierro-800 pt-5">
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
                  type="submit"
                  variant="primary"
                  size="md"
                  isDisabled={
                    mutation.isPending ||
                    alumnosPendientes ||
                    alumnosError ||
                    alumnos.length === 0 ||
                    turnosPendientes
                  }
                >
                  {mutation.isPending ? (
                    <>
                      <Spinner size="sm" />
                      Registrando...
                    </>
                  ) : (
                    "Registrar asistencia"
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

export default RegistrarAsistenciaModal;
