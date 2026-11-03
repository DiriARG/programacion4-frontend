import { useEffect, useRef } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Spinner } from "@heroui/react";
import { IconPencil } from "@tabler/icons-react";
import { toast } from "sonner";

import { CampoFormulario } from "../comunes/CampoFormulario";
import { SelectorEjercicioRutina } from "./SelectorEjercicioRutina";
import { TarjetaEjercicioRutina } from "./TarjetaEjercicioRutina";
import { modificarRutinaSchema } from "../../schemas/modificarRutinaSchema";
import { rutinasService } from "../../services/rutinasService";

const valoresIniciales = {
  nombre: "",
  ejercicios: [],
};

// Convierte la respuesta del back (RutinaResponse --> detalla de una rutina) a los valores que necesita el formulario.
const obtenerValoresIniciales = (rutina) => ({
  nombre: rutina.nombre ?? "",
  ejercicios: (rutina.ejercicios ?? []).map((ejercicio) => ({
    // Conserva el ID de la asociación (entre rutina y ejercicio) para que el backend reconozca que este ejercicio ya pertenece a la rutina.
    rutinaEjercicioId: String(ejercicio.id),
    series: String(ejercicio.series),
    repeticiones: String(ejercicio.repeticiones),
    peso: ejercicio.peso == null ? "" : String(ejercicio.peso),
    diaSemana: ejercicio.diaSemana,
    // Datos auxiliares para mostrar en el formulario, no lo necesita el back (ModificarRutinaEjercicioRequest).
    ejercicioNombre: ejercicio.ejercicioNombre,
    grupoMuscular: ejercicio.grupoMuscular,
  })),
});

const calcularOrdenEnDia = (ejercicios, indice) => {
  const diaSemana = ejercicios[indice]?.diaSemana;

  if (!diaSemana) {
    return null;
  }

  return ejercicios
    .slice(0, indice + 1)
    .filter((ejercicio) => ejercicio?.diaSemana === diaSemana).length;
};

const prepararRutinaParaEnviar = (data) => {
  const ultimoOrdenPorDia = {};

  return {
    ...data,
    ejercicios: data.ejercicios.map((ejercicio) => {
      const orden = (ultimoOrdenPorDia[ejercicio.diaSemana] ?? 0) + 1;

      ultimoOrdenPorDia[ejercicio.diaSemana] = orden;

      /* Se excluyen los datos utilizados únicamente para mostrar información del ejercicio.
      De esta manera, datosEjercicio conserva el resto de las propiedades sin incluir esas dos. */
      const { ejercicioNombre, grupoMuscular, ...datosEjercicio } = ejercicio;

      return {
        ...datosEjercicio,
        orden,
      };
    }),
  };
};

export function ModificarRutinaModal({ isOpen, onOpenChange, rutina }) {
  const queryClient = useQueryClient();
  const rutinaId = rutina?.id;
  /* Guarda el ID de la rutina que ya se cargó en el formulario.
  Permite evitar que el useEffect vuelva a ejecutar reset() si React Query actualiza los datos de la misma rutina.
  Evitando sobreescribir los cambios que el profesor está realizando.  */
  const rutinaInicializadaId = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(modificarRutinaSchema),
    defaultValues: valoresIniciales,
    mode: "onBlur",
  });

  const { fields, append, remove, move, replace } = useFieldArray({
    control,
    name: "ejercicios",
  });

  const ejerciciosFormulario =
    useWatch({
      control,
      name: "ejercicios",
    }) ?? [];

  const {
    data: rutinaDetalle,
    isPending: rutinaPendiente,
    isFetching: rutinaConsultando,
    isError: rutinaError,
    refetch: refetchRutina,
  } = useQuery({
    queryKey: ["rutinas", rutinaId, "detalle"],
    queryFn: () => rutinasService.consultarRutina(rutinaId),
    enabled: isOpen && Boolean(rutinaId),
  });

  const {
    data: ejerciciosCatalogo = [],
    isPending: ejerciciosPendientes,
    isError: ejerciciosError,
    refetch: refetchEjercicios,
  } = useQuery({
    queryKey: ["ejercicios", "activos"],
    queryFn: rutinasService.consultarEjerciciosActivos,
    enabled: isOpen,
  });

  // Espera a que termine la consulta para precargar los datos más recientes.
  // Solo se ejecuta una vez por apertura y por rutina seleccionada.
  useEffect(() => {
    // Al cerrar el modal, se limpia la referencia para que la rutina pueda volver a precargarse cuando se abra nuevamente.
    if (!isOpen) {
      rutinaInicializadaId.current = null;
      return;
    }
    /* Se espera que la consulta termine y se verifica que esta rutina todavía no haya sido precargada en el formulario (rutinaInicializadaId.current === rutinaId).
    Así se evita que una nueva consulta sobreescriba los cambios del profesor.*/
    if (
      !rutinaDetalle ||
      rutinaPendiente ||
      rutinaConsultando ||
      rutinaInicializadaId.current === rutinaId
    ) {
      return;
    }

    // Se precargan los datos y se registra qué rutina ya fue inicializada.
    reset(obtenerValoresIniciales(rutinaDetalle));
    rutinaInicializadaId.current = rutinaId;
  }, [
    isOpen,
    rutinaId,
    rutinaDetalle,
    rutinaPendiente,
    rutinaConsultando,
    reset,
  ]);

  const reiniciarFormulario = () => {
    reset(valoresIniciales);
    replace([]);
    clearErrors();
    // Se elimina el ID registrado para que al volver a abrir el modal se permita precargar nuevamente la rutina seleccionada.
    rutinaInicializadaId.current = null;
  };

  const cambiarEstadoModal = (abierto) => {
    if (!abierto) {
      reiniciarFormulario();
    }

    onOpenChange(abierto);
  };

  const mutation = useMutation({
    mutationFn: (data) => rutinasService.modificarRutina(rutinaId, data),

    onSuccess: async (rutinaModificada) => {
      await queryClient.invalidateQueries({ queryKey: ["rutinas"] });

      toast.success("Rutina modificada", {
        description: `Se modificó correctamente la rutina "${rutinaModificada.nombre}".`,
      });

      cambiarEstadoModal(false);
    },

    onError: (error) => {
      const respuesta = error?.response?.data;

      if (respuesta?.erroresValidacion) {
        Object.entries(respuesta.erroresValidacion).forEach(
          ([campo, mensaje]) => {
            const campoFormulario = campo.replace(/\[(\d+)\]/g, ".$1");

            setError(campoFormulario, {
              type: "server",
              message: mensaje,
            });
          },
        );

        return;
      }

      toast.error("No se pudo modificar la rutina", {
        description:
          respuesta?.mensaje ?? "Ocurrió un problema al modificar la rutina.",
      });
    },
  });

  const agregarEjercicio = (ejercicioId) => {
    // Se busca el ejercicio seleccionado en el catálogo para recuperar sus datos y mostrarlos en el formulario.
    const ejercicio = ejerciciosCatalogo.find(
      (actual) => String(actual.id) === String(ejercicioId),
    );

    if (!ejercicio) {
      return;
    }

    append({
      // Los ejercicios nuevos se identifican mediante ejercicioId.
      ejercicioId: String(ejercicio.id),
      series: "",
      repeticiones: "",
      peso: "",
      diaSemana: "",
      ejercicioNombre: ejercicio.nombre,
      grupoMuscular: ejercicio.grupoMuscular,
    });

    clearErrors("ejercicios");
  };

  const onSubmit = (data) => {
    clearErrors();
    mutation.mutate(prepararRutinaParaEnviar(data));
  };

  const ejerciciosPorId = new Map(
    ejerciciosCatalogo.map((ejercicio) => [String(ejercicio.id), ejercicio]),
  );

  const errorEjercicios =
    errors.ejercicios?.message ?? errors.ejercicios?.root?.message;

  const formularioBloqueado =
    mutation.isPending || rutinaPendiente || rutinaError || !rutinaDetalle;

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
            aria-labelledby="modificar-rutina-titulo"
            aria-describedby="modificar-rutina-descripcion"
            className="border border-hierro-700 bg-hierro-900"
          >
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Modal.Header className="border-b border-hierro-800">
                <Modal.Icon className="text-azul-500">
                  <IconPencil size={22} />
                </Modal.Icon>

                <div>
                  <Modal.Heading
                    id="modificar-rutina-titulo"
                    className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
                  >
                    Modificar rutina
                  </Modal.Heading>

                  <p
                    id="modificar-rutina-descripcion"
                    className="mt-1 text-sm text-hierro-400"
                  >
                    Modificá el nombre y los ejercicios de la rutina.
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="max-h-[60vh] space-y-7 overflow-y-auto py-6">
                {rutinaPendiente ? (
                  <div className="flex min-h-60 items-center justify-center">
                    <Spinner size="lg" />
                  </div>
                ) : rutinaError ? (
                  <div className="surface-plate p-6 text-center">
                    <p className="text-sm text-hierro-200">
                      No se pudo consultar la información de la rutina.
                    </p>

                    <p className="mt-2 text-sm text-hierro-400">
                      Ocurrió un problema al recuperar los datos y ejercicios.
                    </p>

                    <Button
                      type="button"
                      className="mt-4"
                      variant="secondary"
                      size="md"
                      onPress={() => refetchRutina()}
                    >
                      Reintentar
                    </Button>
                  </div>
                ) : rutinaDetalle ? (
                  <>
                    <section className="space-y-5">
                      <h3 className="border-b border-hierro-800 pb-3 font-titulos text-sm tracking-[0.1em] text-hueso uppercase">
                        Datos generales
                      </h3>

                      <div className="space-y-1">
                        <p className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                          Alumno
                        </p>

                        <p className="text-sm text-hueso">
                          {rutinaDetalle.alumnoNombre}{" "}
                          {rutinaDetalle.alumnoApellido}
                        </p>
                      </div>

                      <Controller
                        name="nombre"
                        control={control}
                        render={({ field }) => (
                          <CampoFormulario
                            label="Nombre de la rutina"
                            placeholder="Ej.: Rutina de hipertrofia"
                            autoComplete="off"
                            maxLength={100}
                            registration={field}
                            error={errors.nombre?.message}
                            isRequired
                            isDisabled={mutation.isPending}
                          />
                        )}
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
                        key={isOpen ? `abierto-${rutina?.id}` : "cerrado"}
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
                          <p className="text-sm text-hierro-300">
                            La rutina no tiene ejercicios.
                          </p>

                          <p className="mt-1 text-xs text-hierro-500">
                            Agregá al menos un ejercicio para guardar los
                            cambios.
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs text-hierro-400">
                            Podés modificar los parámetros, eliminar ejercicios
                            o agregar nuevos. El orden dentro de cada día se
                            calcula según la posición en esta lista.
                          </p>

                          <div className="space-y-4">
                            {fields.map((campo, indice) => {
                              const ejercicioActual =
                                ejerciciosFormulario[indice];

                              /* Los ejercicios existentes conservan su nombre y grupo muscular que llegaron desde el detalle, incluso si fueron desactivados.
                              Los nuevos se recuperan del catálogo de activos. */
                              const ejercicio = ejercicioActual?.ejercicioNombre
                                ? {
                                    nombre: ejercicioActual.ejercicioNombre,
                                    grupoMuscular:
                                      ejercicioActual.grupoMuscular,
                                  }
                                : ejerciciosPorId.get(
                                    String(ejercicioActual?.ejercicioId),
                                  );

                              return (
                                <TarjetaEjercicioRutina
                                  key={campo.id}
                                  indice={indice}
                                  ejercicio={ejercicio}
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
                  </>
                ) : null}
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
                  isDisabled={formularioBloqueado}
                >
                  {mutation.isPending ? (
                    <>
                      <Spinner size="sm" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar cambios"
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

export default ModificarRutinaModal;
