import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { IconUserPlus } from "@tabler/icons-react";
import { toast } from "sonner";

import { turnosService } from "../../services/turnosService";
import { usuariosService } from "../../services/usuariosService";

const valoresIniciales = {
  alumnoId: "",
};

export function InscribirAlumnoModal({ isOpen, onOpenChange, turno }) {
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    reset,
    clearErrors,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: valoresIniciales,
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
    data: turnoDetalle,
    isPending: turnoDetallePendiente,
    isError: turnoDetalleError,
  } = useQuery({
    queryKey: ["turno", turno?.id],
    queryFn: () => turnosService.consultarTurno(turno.id),
    enabled: isOpen && Boolean(turno),
  });

  useEffect(() => {
    if (isOpen) {
      reset(valoresIniciales);
    }
  }, [isOpen, turno?.id, reset]);

  /* Se guarda en un "Set" los IDs de los alumnos ya inscriptos (proveniente de turnoDetalle).
  Set sirve para almacenar valores únicos y permite comprobar si un ID ya existe (con el has). */
  const alumnosInscriptos = new Set(
    (turnoDetalle?.alumnos ?? []).map((alumno) => String(alumno.id)),
  );

  // Se filtran los alumnos activos para ofrecer solamente aquellos que todavía no están inscriptos en este turno.
  const alumnosDisponibles = alumnos.filter(
    (alumno) => !alumnosInscriptos.has(String(alumno.id)),
  );

  const consultaPendiente = alumnosPendientes || turnoDetallePendiente;
  const consultaError = alumnosError || turnoDetalleError;

  const mutation = useMutation({
    mutationFn: (data) =>
      turnosService.inscribirAlumno(turno.id, Number(data.alumnoId)),

    onSuccess: (turnoActualizado, datosEnviados) => {
      /* Se actualiza los datos guardados en caché con la respuesta del back, para que la consulta que muestra el detalle del turno muestre inmediatamente la lista actualizada de alumnos. 
      Primer parámetro - ["turno", turno.id]: identifica qué entrada de la caché queremos actualizar.
      Segundo parámetro — turnoActualizado: son los nuevos datos que se recibe directamente desde el back. */
      queryClient.setQueryData(["turno", turno.id], turnoActualizado);

      const alumnoInscripto = alumnos.find(
        (alumno) => String(alumno.id) === String(datosEnviados.alumnoId),
      );

      toast.success("Alumno inscripto", {
        description: alumnoInscripto
          ? `Se inscribió correctamente a ${alumnoInscripto.nombre} ${alumnoInscripto.apellido} en el turno "${turnoActualizado.nombreClase}".`
          : `Se inscribió correctamente al alumno en el turno "${turnoActualizado.nombreClase}".`,
      });

      reset(valoresIniciales);
      onOpenChange(false);
    },

    onError: (error) => {
      const respuesta = error?.response?.data;

      toast.error("No se pudo inscribir al alumno", {
        description:
          respuesta?.mensaje ??
          "Ocurrió un problema al inscribir al alumno en el turno.",
      });
    },
  });

  const onSubmit = (data) => {
    clearErrors();
    mutation.mutate(data);
  };

  if (!turno) {
    return null;
  }

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
            aria-labelledby="inscribir-alumno-titulo"
            aria-describedby="inscribir-alumno-descripcion"
            className="border border-hierro-700 bg-hierro-900"
          >
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Modal.Header className="border-b border-hierro-800">
                <Modal.Icon className="text-azul-500">
                  <IconUserPlus size={22} />
                </Modal.Icon>

                <div>
                  <Modal.Heading
                    id="inscribir-alumno-titulo"
                    className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
                  >
                    Inscribir alumno
                  </Modal.Heading>

                  <p
                    id="inscribir-alumno-descripcion"
                    className="mt-1 text-sm text-hierro-400"
                  >
                    Seleccioná un alumno para inscribirlo en{" "}
                    <span className="font-medium text-hierro-200">
                      {turno.nombreClase}
                    </span>
                    .
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="max-h-[60vh] overflow-y-auto py-6">
                <Controller
                  name="alumnoId"
                  control={control}
                  rules={{
                    required: "Seleccioná un alumno.",
                  }}
                  render={({ field }) => (
                    <Select
                      className="w-full"
                      variant="secondary"
                      placeholder={
                        consultaPendiente
                          ? "Cargando alumnos..."
                          : consultaError
                            ? "No se pudieron cargar los alumnos"
                            : alumnosDisponibles.length === 0
                              ? "No hay alumnos disponibles"
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
                        consultaPendiente ||
                        consultaError ||
                        alumnosDisponibles.length === 0
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
                          {alumnosDisponibles.map((alumno) => {
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

                {consultaPendiente ? (
                  <p className="mt-2 text-xs text-hierro-400">
                    Cargando alumnos disponibles...
                  </p>
                ) : consultaError ? (
                  <p className="mt-2 text-xs text-hierro-400">
                    No se pudo consultar la información necesaria. Cerrá y volvé
                    a abrir el formulario para intentarlo nuevamente.
                  </p>
                ) : alumnos.length === 0 ? (
                  <p className="mt-2 text-xs text-hierro-400">
                    No hay alumnos activos disponibles en el sistema.
                  </p>
                ) : alumnosDisponibles.length === 0 ? (
                  <p className="mt-2 text-xs text-hierro-400">
                    Todos los alumnos activos ya están inscriptos en este turno.
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-hierro-400">
                    Solo se muestran alumnos activos que todavía no están
                    inscriptos en este turno.
                  </p>
                )}
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
                    consultaPendiente ||
                    consultaError ||
                    alumnosDisponibles.length === 0
                  }
                >
                  {mutation.isPending ? (
                    <>
                      <Spinner size="sm" />
                      Inscribiendo...
                    </>
                  ) : (
                    "Inscribir alumno"
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

export default InscribirAlumnoModal;
