import { useEffect, useRef } from "react";
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
import { IconFilePlus } from "@tabler/icons-react";
import { toast } from "sonner";

import { CampoFormulario } from "../comunes/CampoFormulario";
import { registrarFichaMedicaSchema } from "../../schemas/registrarFichaMedicaSchema";
import { fichasMedicasService } from "../../services/fichasMedicasService";

const obtenerValoresIniciales = () => ({
  alumnoId: "",
  // undefined porque todavía no se seleccionó ningún archivo.
  certificado: undefined,
  fechaVencimiento: "",
  observaciones: "",
});

export function RegistrarFichaMedicaModal({ isOpen, onOpenChange }) {
  const queryClient = useQueryClient();
  // Guarda una referencia al input del archivo para poder limpiar la selección realizada en el navegador cuando se reinicia el formulario.
  const certificadoInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrarFichaMedicaSchema),
    defaultValues: obtenerValoresIniciales(),
    mode: "onBlur",
  });

  // Se guarda las propiedades de React Hook Form (name, onChange, onBlur y ref) para conectarlas al input.
  const certificadoRegistro = register("certificado");
  // Se obtiene el archivo seleccionado para mostrar su nombre en el formulario.
  const certificadoSeleccionado = watch("certificado");

  const nombreCertificado =
    typeof File !== "undefined" && certificadoSeleccionado instanceof File
      ? certificadoSeleccionado.name
      : (certificadoSeleccionado?.[0]?.name ?? "Ningún archivo seleccionado");

  const {
    data: alumnosSinFicha = [],
    isPending: alumnosPendientes,
    isError: alumnosError,
    refetch,
  } = useQuery({
    queryKey: ["fichasMedicas", "alumnosSinFicha"],
    queryFn: fichasMedicasService.consultarAlumnosSinFichaMedica,
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      reset(obtenerValoresIniciales());
      // Se limpia la selección del archivo en el input del navegador, para garantizar que no siga mostrándose el archivo anterior.
      if (certificadoInputRef.current) {
        certificadoInputRef.current.value = "";
      }
    }
  }, [isOpen, reset]);

  const mutation = useMutation({
    mutationFn: ({ alumnoId, ...datos }) =>
      fichasMedicasService.registrarFichaMedica(alumnoId, datos),

    onSuccess: (fichaCreada) => {
      queryClient.invalidateQueries({ queryKey: ["fichasMedicas"] });

      toast.success("Ficha médica registrada", {
        description: `Se registró correctamente la ficha médica de ${fichaCreada.alumnoNombre} ${fichaCreada.alumnoApellido}.`,
      });

      reset(obtenerValoresIniciales());

      if (certificadoInputRef.current) {
        certificadoInputRef.current.value = "";
      }

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

      if (respuesta?.codigoEstado === 409) {
        setError("alumnoId", {
          type: "server",
          message:
            respuesta.mensaje ??
            "El alumno ya posee una ficha médica registrada.",
        });

        /* En caso de que dos admins abran el formulario y seleccionan al mismo alumno cuando todavía no tiene ficha médica.
        El primero registra la ficha correctamente, el segundo el back le rechaza la operación con 409. Por esto se le actualiza la info para que la lista este actualizada nuevamente. */
        queryClient.invalidateQueries({
          queryKey: ["fichasMedicas", "alumnosSinFicha"],
        });

        return;
      }

      toast.error("No se pudo registrar la ficha médica", {
        description:
          respuesta?.mensaje ??
          "Ocurrió un problema al registrar la ficha médica.",
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
            aria-labelledby="registrar-ficha-medica-titulo"
            aria-describedby="registrar-ficha-medica-descripcion"
            className="border border-hierro-700 bg-hierro-900"
          >
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Modal.Header className="border-b border-hierro-800">
                <Modal.Icon className="text-azul-500">
                  <IconFilePlus size={22} />
                </Modal.Icon>

                <div>
                  <Modal.Heading
                    id="registrar-ficha-medica-titulo"
                    className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
                  >
                    Registrar ficha médica
                  </Modal.Heading>

                  <p
                    id="registrar-ficha-medica-descripcion"
                    className="mt-1 text-sm text-hierro-400"
                  >
                    Seleccioná un alumno y cargá su certificado de aptitud
                    física.
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
                              : alumnosSinFicha.length === 0
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
                          alumnosPendientes ||
                          alumnosError ||
                          alumnosSinFicha.length === 0
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
                            {alumnosSinFicha.map((alumno) => {
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
                    <p className="text-xs text-hierro-400">
                      Cargando alumnos sin ficha médica...
                    </p>
                  ) : alumnosError ? (
                    <div className="space-y-2">
                      <p className="text-xs text-hierro-400">
                        No se pudieron consultar los alumnos disponibles.
                      </p>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onPress={() => refetch()}
                      >
                        Reintentar consulta
                      </Button>
                    </div>
                  ) : alumnosSinFicha.length === 0 ? (
                    <p className="text-xs text-hierro-400">
                      Todos los alumnos ya tienen una ficha médica registrada.
                    </p>
                  ) : null}

                  <div className="space-y-2">
                    <Label id="certificado-label" className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                      Certificado de aptitud física
                      <span className="text-danger" aria-hidden="true">
                        {" "}
                        *
                      </span>
                    </Label>

                    {/* Input nativo que permite seleccionar el certificado. 
                   Se oculta visualmente porque usamos un botón personalizado para abrir el selector de archivos y mostrar el nombre por separado. */}
                    <input
                      id="certificado"
                      type="file"
                      className="hidden"
                      accept="application/pdf,image/jpeg,image/png"
                      name={certificadoRegistro.name}
                      onBlur={certificadoRegistro.onBlur}
                      onChange={certificadoRegistro.onChange}
                      disabled={mutation.isPending}
                      aria-labelledby="certificado-label"
                      aria-invalid={Boolean(errors.certificado)}
                      ref={(elemento) => {
                        // Se entrega el elemento HTML a React Hook Form para que pueda registrar el campo, recibir sus cambios y validar su contenido.
                        certificadoRegistro.ref(elemento);
                        // Se guarda el elemento HTML en el useRef para acceder al input desde otra función y abrir el selector de archivos mediante su método click().
                        certificadoInputRef.current = elemento;
                      }}
                    />

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Botón visible que abre el selector asociado al input oculto. */}
                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        className="focus-visible:!ring-0 data-[focus-visible=true]:!ring-0"
                        isDisabled={mutation.isPending}
                        // .current apunta al input HTML. Su método click() abre el selector nativo de archivos.
                        onPress={() => certificadoInputRef.current?.click()}
                      >
                        Seleccionar archivo
                      </Button>

                      <span
                        className="break-all text-sm text-hierro-400"
                        aria-live="polite"
                      >
                        {nombreCertificado}
                      </span>
                    </div>

                    <p className="text-xs text-hierro-400">
                      Formatos admitidos: PDF, JPG y PNG. Tamaño máximo: 5 MB.
                    </p>

                    {errors.certificado ? (
                      <p className="text-xs text-danger" role="alert">
                        {errors.certificado.message}
                      </p>
                    ) : null}
                  </div>

                  <CampoFormulario
                    label="Fecha de vencimiento"
                    type="date"
                    registration={register("fechaVencimiento")}
                    error={errors.fechaVencimiento?.message}
                    isRequired
                    isDisabled={mutation.isPending}
                  />

                  <CampoFormulario
                    label="Observaciones (opcional)"
                    multiline
                    registration={register("observaciones")}
                    error={errors.observaciones?.message}
                    isDisabled={mutation.isPending}
                    placeholder="Agregá observaciones relevantes..."
                    rows={4}
                  />
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
                    alumnosSinFicha.length === 0
                  }
                >
                  {mutation.isPending ? (
                    <>
                      <Spinner size="sm" />
                      Registrando...
                    </>
                  ) : (
                    "Registrar ficha"
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

export default RegistrarFichaMedicaModal;
