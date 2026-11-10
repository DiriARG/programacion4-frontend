import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Spinner } from "@heroui/react";
import { IconDumbbell, IconInfoCircle } from "@tabler/icons-react";
import { toast } from "sonner";

import { CampoFormulario } from "../comunes/CampoFormulario";
import { SelectorAlumnoRutina } from "./SelectorAlumnoRutina";
import { SelectorEjercicioRutina } from "./SelectorEjercicioRutina";
import { TarjetaEjercicioRutina } from "./TarjetaEjercicioRutina";
import { crearRutinaSchema } from "../../schemas/crearRutinaSchema";
import { ejerciciosService } from "../../services/ejerciciosService";
import { rutinasService } from "../../services/rutinasService";
import { usuariosService } from "../../services/usuariosService";

const valoresIniciales = {
  alumnoId: "",
  nombre: "",
  ejercicios: [],
};

// Calcula el orden de un ejercicio dentro de los ejercicios asignados al mismo día de la semana.
const calcularOrdenEnDia = (ejercicios, indice) => {
  // Obtiene el día del ejercicio cuyo orden se quiere calcular.
  const diaSemana = ejercicios[indice]?.diaSemana;

  if (!diaSemana) {
    return null;
  }

  return (
    ejercicios
      // "slice" no incluye la posición final, por eso se suma 1 al índice para así obtener desde el primer ejercicio hasta el actual inclusive.
      .slice(0, indice + 1)
      // Conserva solamente los ejercicios que tienen el mismo día que el actual, el .length devuelve la posición del ejercicio dentro de ese día.
      .filter((ejercicio) => ejercicio?.diaSemana === diaSemana).length
  );
};

/* El profesor no carga manualmente el campo orden de cada ejercicio, pero el backend lo requiere para registrar las asociaciones.
Por eso, antes de enviar la rutina, se calcula automáticamente el orden los ejercicios dentro de cada día. */
const prepararRutinaParaEnviar = (data) => {
  // Guarda el último orden asignado para cada día de la semana.
  const ultimoOrdenPorDia = {};

  return {
    ...data,
    ejercicios: data.ejercicios.map((ejercicio) => {
      /* Obtiene el último orden asignado para ese día o cero si todavía no hay ejercicios. 
      Suma uno para asignar el siguiente número de orden. */
      const orden = (ultimoOrdenPorDia[ejercicio.diaSemana] ?? 0) + 1;

      // Actualiza el contador de ese día.
      ultimoOrdenPorDia[ejercicio.diaSemana] = orden;

      return {
        ...ejercicio,
        orden,
      };
    }),
  };
};

export function CrearRutinaModal({ isOpen, onOpenChange }) {
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
    resolver: zodResolver(crearRutinaSchema),
    defaultValues: valoresIniciales,
    mode: "onBlur",
  });

  // "move" cambia la posición de un ejercicio dentro de la lista y "replace" permite reemplazar toda la lista, en este caso, para vaciarla.
  const { fields, append, remove, move, replace } = useFieldArray({
    control,
    name: "ejercicios",
  });

  // Reinicia el formulario al cerrarlo para que la próxima apertura comience vacía.
  const reiniciarFormulario = () => {
    reset(valoresIniciales);
    // Vacía explícitamente la colección de ejercicios administrada por useFieldArray ("ejercicios").
    replace([]);
    clearErrors();
  };

  const cambiarEstadoModal = (abierto) => {
    if (!abierto) {
      reiniciarFormulario();
    }

    onOpenChange(abierto);
  };

  /* El "useWatch" observa los valores actuales de los ejercicios del formulario. 
  Permite actualizar la información y el orden de las tarjetas cuando se agrega, elimina o modifica o reorganiza algún ejercicio. */
  const ejerciciosFormulario =
    useWatch({
      control,
      name: "ejercicios",
    }) ?? [];

  const {
    data: alumnos = [],
    isPending: alumnosPendientes,
    isError: alumnosError,
    refetch: refetchAlumnos,
  } = useQuery({
    queryKey: ["alumnos", "activos"],
    queryFn: usuariosService.consultarAlumnosActivos,
    enabled: isOpen,
  });

  const {
    data: ejerciciosCatalogo = [],
    isPending: ejerciciosPendientes,
    isError: ejerciciosError,
    refetch: refetchEjercicios,
  } = useQuery({
    queryKey: ["ejercicios", "activos"],
    queryFn: ejerciciosService.consultarEjerciciosActivos,
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: (data) => rutinasService.crearRutina(data),

    onSuccess: async (rutinaCreada) => {
      await queryClient.invalidateQueries({
        queryKey: ["rutinas"],
      });

      toast.success("Rutina creada", {
        description: `Se creó correctamente la rutina "${rutinaCreada.nombre}" para ${rutinaCreada.alumnoNombre} ${rutinaCreada.alumnoApellido}.`,
      });

      cambiarEstadoModal(false);
    },

    onError: (error) => {
      const respuesta = error?.response?.data;

      if (respuesta?.erroresValidacion) {
        Object.entries(respuesta.erroresValidacion).forEach(
          ([campo, mensaje]) => {
            /* El back devuelve los errores con índices entre corchetes por ej: "ejercicios[0].series". 
            Se convierte los índices al formato que se utilizan en los nombres de los campos del formulario para que "setError" pueda identificar el campo correspondiente y mostrar el mensaje de validación.  */
            const campoFormulario = campo.replace(/\[(\d+)\]/g, ".$1");

            setError(campoFormulario, {
              type: "server",
              message: mensaje,
            });
          },
        );

        return;
      }

      toast.error("No se pudo crear la rutina", {
        description:
          respuesta?.mensaje ?? "Ocurrió un problema al crear la rutina.",
      });
    },
  });

  const agregarEjercicio = (ejercicioId) => {
    append({
      ejercicioId,
      series: "",
      repeticiones: "",
      peso: "",
      diaSemana: "",
    });

    clearErrors("ejercicios");
  };

  const onSubmit = (data) => {
    clearErrors();
    mutation.mutate(prepararRutinaParaEnviar(data));
  };

  const alumnosSinDatos = alumnos.length === 0;
  const ejerciciosSinDatos = ejerciciosCatalogo.length === 0;

  const formularioBloqueado =
    mutation.isPending ||
    alumnosPendientes ||
    ejerciciosPendientes ||
    alumnosError ||
    ejerciciosError ||
    alumnosSinDatos ||
    ejerciciosSinDatos;

  const ejerciciosPorId = new Map(
    ejerciciosCatalogo.map((ejercicio) => [String(ejercicio.id), ejercicio]),
  );

  const errorEjercicios =
    errors.ejercicios?.message ?? errors.ejercicios?.root?.message;

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={cambiarEstadoModal}
        variant="blur"
        isDismissable={!mutation.isPending}
        isKeyboardDismissDisabled={mutation.isPending}
      >
        <Modal.Container
          size="cover"
          placement="center"
          scroll="inside"
          className="max-h-[90vh]"
        >
          <Modal.Dialog
            aria-labelledby="crear-rutina-titulo"
            aria-describedby="crear-rutina-descripcion"
            className="border border-hierro-700 bg-hierro-900"
          >
            <form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <Modal.Header className="border-b border-hierro-800">
                <Modal.Icon className="text-azul-500">
                  <IconDumbbell size={22} />
                </Modal.Icon>

                <div>
                  <Modal.Heading
                    id="crear-rutina-titulo"
                    className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
                  >
                    Crear rutina
                  </Modal.Heading>

                  <p
                    id="crear-rutina-descripcion"
                    className="mt-1 text-sm text-hierro-400"
                  >
                    Completá los datos y agregá los ejercicios de la rutina.
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="max-h-[60vh] space-y-7 overflow-y-auto py-6">
                <section className="space-y-5">
                  <h3 className="border-b border-hierro-800 pb-3 font-titulos text-sm tracking-[0.1em] text-hueso uppercase">
                    Datos generales
                  </h3>

                  <Controller
                    name="alumnoId"
                    control={control}
                    render={({ field }) => (
                      <SelectorAlumnoRutina
                        alumnos={alumnos}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.alumnoId?.message}
                        isPending={alumnosPendientes}
                        isError={alumnosError}
                        isDisabled={mutation.isPending}
                        onRetry={() => refetchAlumnos()}
                      />
                    )}
                  />

                  <CampoFormulario
                    label="Nombre de la rutina"
                    placeholder="Ej.: Rutina de hipertrofia"
                    autoComplete="off"
                    maxLength={100}
                    registration={register("nombre")}
                    error={errors.nombre?.message}
                    isRequired
                    isDisabled={mutation.isPending}
                  />
                </section>

                <section className="space-y-5">
                  <div className="flex items-center justify-between gap-3 border-b border-hierro-800 pb-3">
                    <h3 className="font-titulos text-sm tracking-[0.1em] text-hueso uppercase">
                      Ejercicios
                    </h3>

                    <span className="text-xs text-hierro-400">
                      {fields.length}{" "}
                      {fields.length === 1 ? "ejercicio" : "ejercicios"}
                    </span>
                  </div>

                  <SelectorEjercicioRutina
                    key={isOpen ? "abierto" : "cerrado"}
                    ejercicios={ejerciciosCatalogo}
                    onAgregar={agregarEjercicio}
                    isDisabled={mutation.isPending}
                    isPending={ejerciciosPendientes}
                    isError={ejerciciosError}
                    onRetry={() => refetchEjercicios()}
                  />

                  {errorEjercicios ? (
                    <p role="alert" className="text-sm text-danger">
                      {errorEjercicios}
                    </p>
                  ) : null}

                  {fields.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-hierro-700 px-4 py-8 text-center">
                      <IconDumbbell
                        size={28}
                        className="mx-auto text-hierro-500"
                      />

                      <p className="mt-3 text-sm text-hierro-300">
                        Todavía no agregaste ejercicios.
                      </p>

                      <p className="mt-1 text-xs text-hierro-500">
                        Buscá un ejercicio en el catálogo para comenzar.
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-hierro-400">
                        El orden dentro de cada día se calcula según la posición
                        de los ejercicios en esta lista. Podés reorganizarlos
                        con las flechas.
                      </p>

                      <div className="space-y-4">
                        {fields.map((campo, indice) => {
                          const ejercicioId =
                            ejerciciosFormulario[indice]?.ejercicioId;

                          return (
                            <TarjetaEjercicioRutina
                              key={campo.id}
                              indice={indice}
                              ejercicio={ejerciciosPorId.get(
                                String(ejercicioId),
                              )}
                              orden={calcularOrdenEnDia(
                                ejerciciosFormulario,
                                indice,
                              )}
                              register={register}
                              control={control}
                              errores={errors.ejercicios?.[indice]}
                              puedeMoverArriba={indice > 0}
                              puedeMoverAbajo={indice < fields.length - 1}
                              onMoverArriba={() => move(indice, indice - 1)}
                              onMoverAbajo={() => move(indice, indice + 1)}
                              onEliminar={() => remove(indice)}
                              isDisabled={mutation.isPending}
                            />
                          );
                        })}
                      </div>
                    </>
                  )}
                </section>

                <div className="rounded-lg border border-hierro-700 bg-hierro-800/50 p-3">
                  <div className="flex items-start gap-2">
                    <IconInfoCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-azul-500"
                    />

                    <div>
                      <p className="text-sm font-medium text-hueso">
                        Estado de la rutina
                      </p>

                      <p className="mt-1 text-xs leading-relaxed text-hierro-300">
                        La nueva rutina se creará como activa. Si el alumno ya
                        tiene otra rutina activa, esta última pasará
                        automáticamente a inactiva.
                      </p>
                    </div>
                  </div>
                </div>
              </Modal.Body>

              <Modal.Footer className="border-t border-hierro-800 pt-5">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  isDisabled={mutation.isPending}
                  onPress={() => cambiarEstadoModal(false)}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isDisabled={formularioBloqueado || fields.length === 0}
                >
                  {mutation.isPending ? (
                    <>
                      <Spinner size="sm" />
                      Creando...
                    </>
                  ) : (
                    "Crear rutina"
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

export default CrearRutinaModal;
