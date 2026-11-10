import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Spinner, Label } from "@heroui/react";
import { IconPencil, IconX } from "@tabler/icons-react";
import { toast } from "sonner";

import { CampoFormulario } from "../comunes/CampoFormulario";
import { modificarEjercicioSchema } from "../../schemas/modificarEjercicioSchema";
import { ejerciciosService } from "../../services/ejerciciosService";

const valoresIniciales = {
  nombre: "",
  grupoMuscular: "",
  descripcion: "",
  // Archivo nuevo seleccionado para reemplazar o agregar. Arranca en null porque no hay selección inicial.
  imagen: null,
  eliminarImagen: false,
};

const TIPOS_IMAGEN_PERMITIDOS = ["image/jpeg", "image/png"];

export function ModificarEjercicioModal({ isOpen, onOpenChange, ejercicio }) {
  const queryClient = useQueryClient();
  const imagenInputRef = useRef(null);

  const [urlImagenActual, setUrlImagenActual] = useState("");
  const [errorVisualizacion, setErrorVisualizacion] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(modificarEjercicioSchema),
    defaultValues: valoresIniciales,
    mode: "onBlur",
  });

  const imagenRegistro = register("imagen");
  const imagenSeleccionada = watch("imagen");

  const archivoImagen =
    typeof File !== "undefined" && imagenSeleccionada instanceof File
      ? imagenSeleccionada
      : (imagenSeleccionada?.[0] ?? null);

  const nombreImagen = archivoImagen?.name ?? "Ninguna imagen seleccionada";

  // Observa en tiempo real el valor de "eliminarImagen" para actualizar condicionalmente la interfaz gráfica.
  const eliminarImagen = watch("eliminarImagen");

  const tieneImagenActual = Boolean(ejercicio?.imagenUrl);

  // Se recupera la imagen que ya está almacenada (solo si el ejercicio tiene una).
  const {
    data: imagenActual,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["imagenesEjercicios", ejercicio?.id],
    queryFn: async () => {
      const archivo = await ejerciciosService.consultarImagenEjercicio(
        ejercicio.id,
      );

      const tipoContenido = archivo.type?.split(";")[0].trim().toLowerCase();

      if (!TIPOS_IMAGEN_PERMITIDOS.includes(tipoContenido)) {
        throw new Error("El formato de imagen recibido no es compatible.");
      }

      return archivo;
    },
    enabled: isOpen && tieneImagenActual,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setErrorVisualizacion(false);

    if (!isOpen || !imagenActual) {
      setUrlImagenActual("");
      return;
    }

    const urlTemporal = URL.createObjectURL(imagenActual);

    setUrlImagenActual(urlTemporal);

    return () => {
      URL.revokeObjectURL(urlTemporal);
    };
  }, [isOpen, imagenActual]);

  useEffect(() => {
    if (isOpen && ejercicio) {
      reset({
        nombre: ejercicio.nombre ?? "",
        grupoMuscular: ejercicio.grupoMuscular ?? "",
        descripcion: ejercicio.descripcion ?? "",
        imagen: null,
        eliminarImagen: false,
      });

      if (imagenInputRef.current) {
        imagenInputRef.current.value = "";
      }
    }
  }, [isOpen, ejercicio, reset]);

  // Quita la nueva imagen seleccionada sin modificar la imagen actual almacenada.
  const quitarImagenSeleccionada = () => {
    setValue("imagen", null, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (imagenInputRef.current) {
      imagenInputRef.current.value = "";
    }
  };

  /* Marca la imagen actual para que el backend la elimine al guardar.
   No limpia el input ya que el usuario no seleccionó ninguna foto nueva, solamente cambió el estado de "eliminarImagen".*/
  const quitarImagenActual = () => {
    setValue("eliminarImagen", true, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Cancela la eliminación solicitada y conserva la imagen actual.
  const restaurarImagenActual = () => {
    setValue("eliminarImagen", false, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const mutation = useMutation({
    mutationFn: (data) =>
      ejerciciosService.modificarEjercicio(ejercicio.id, data),

    onSuccess: (ejercicioModificado) => {
      queryClient.invalidateQueries({ queryKey: ["ejercicios"] });

      toast.success("Ejercicio modificado", {
        description: `Se actualizaron correctamente los datos de "${ejercicioModificado.nombre}".`,
      });

      reset(valoresIniciales);

      if (imagenInputRef.current) {
        imagenInputRef.current.value = "";
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
        setError("nombre", {
          type: "server",
          message:
            respuesta.mensaje ??
            "Ya existe otro ejercicio registrado con ese nombre.",
        });

        return;
      }

      toast.error("No se pudo modificar el ejercicio", {
        description:
          respuesta?.mensaje ??
          "Ocurrió un problema al modificar el ejercicio.",
      });
    },
  });

  const onSubmit = (data) => {
    clearErrors();
    mutation.mutate(data);
  };

  const mostrarImagenActual =
    tieneImagenActual && !archivoImagen && !eliminarImagen;

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
            aria-labelledby="modificar-ejercicio-titulo"
            aria-describedby="modificar-ejercicio-descripcion"
            className="border border-hierro-700 bg-hierro-900"
          >
            <form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <Modal.Header className="border-b border-hierro-800">
                <Modal.Icon className="text-azul-500">
                  <IconPencil size={22} />
                </Modal.Icon>

                <div>
                  <Modal.Heading
                    id="modificar-ejercicio-titulo"
                    className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
                  >
                    Modificar ejercicio
                  </Modal.Heading>

                  <p
                    id="modificar-ejercicio-descripcion"
                    className="mt-1 text-sm text-hierro-400"
                  >
                    Modificá los datos del ejercicio seleccionado.
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="max-h-[60vh] overflow-y-auto py-6">
                <div className="space-y-5">
                  <Controller
                    name="nombre"
                    control={control}
                    render={({ field }) => (
                      <CampoFormulario
                        label="Nombre del ejercicio"
                        placeholder="Ej: Press de banca"
                        registration={field}
                        error={errors.nombre?.message}
                        isRequired
                        isDisabled={mutation.isPending}
                        maxLength={100}
                      />
                    )}
                  />

                  <Controller
                    name="grupoMuscular"
                    control={control}
                    render={({ field }) => (
                      <CampoFormulario
                        label="Grupo muscular"
                        placeholder="Ej: Pecho"
                        registration={field}
                        error={errors.grupoMuscular?.message}
                        isRequired
                        isDisabled={mutation.isPending}
                        maxLength={50}
                      />
                    )}
                  />

                  <Controller
                    name="descripcion"
                    control={control}
                    render={({ field }) => (
                      <CampoFormulario
                        label="Descripción (opcional)"
                        placeholder="Describí cómo se realiza el ejercicio..."
                        multiline
                        registration={field}
                        error={errors.descripcion?.message}
                        isDisabled={mutation.isPending}
                        rows={4}
                      />
                    )}
                  />

                  <div className="space-y-3">
                    <Label
                      id="imagen-modificar-label"
                      className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase"
                    >
                      Imagen del ejercicio (opcional)
                    </Label>

                    <input
                      id="imagen-modificar"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png"
                      name={imagenRegistro.name}
                      onBlur={imagenRegistro.onBlur}
                      onChange={imagenRegistro.onChange}
                      disabled={mutation.isPending}
                      aria-labelledby="imagen-modificar-label"
                      aria-invalid={Boolean(errors.imagen)}
                      ref={(elemento) => {
                        imagenRegistro.ref(elemento);
                        imagenInputRef.current = elemento;
                      }}
                    />

                    {mostrarImagenActual ? (
                      <div className="space-y-2">
                        <p className="text-xs text-hierro-400">Imagen actual</p>

                        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-lg border border-hierro-700 bg-hierro-950">
                          {isPending && !imagenActual ? (
                            <Spinner size="sm" />
                          ) : imagenActual &&
                            urlImagenActual &&
                            !errorVisualizacion ? (
                            <img
                              src={urlImagenActual}
                              alt={`Imagen actual de ${ejercicio.nombre}`}
                              className="h-full w-full object-cover"
                              onError={() => setErrorVisualizacion(true)}
                            />
                          ) : (
                            <p className="px-2 text-center text-xs text-hierro-400">
                              {isError || errorVisualizacion
                                ? "Imagen no disponible"
                                : "Cargando imagen..."}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {eliminarImagen && !archivoImagen ? (
                      <div className="space-y-2 rounded-lg border border-hierro-700 bg-hierro-800 p-3">
                        <p className="text-sm text-hierro-200">
                          La imagen actual se eliminará al guardar los cambios.
                        </p>

                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          isDisabled={mutation.isPending}
                          onPress={restaurarImagenActual}
                        >
                          Conservar imagen actual
                        </Button>
                      </div>
                    ) : null}

                    {archivoImagen ? (
                      <div>
                        <p className="break-all text-sm text-hierro-400">
                          Nueva imagen: {nombreImagen}
                        </p>

                        {tieneImagenActual ? (
                          <p className="mt-1 text-xs text-hierro-400">
                            La nueva imagen reemplazará a la imagen actual al
                            guardar.
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    {!tieneImagenActual && !archivoImagen ? (
                      <p className="text-sm text-hierro-400">
                        Este ejercicio no tiene una imagen registrada.
                      </p>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        isDisabled={mutation.isPending}
                        onPress={() => imagenInputRef.current?.click()}
                      >
                        Seleccionar imagen
                      </Button>

                      {archivoImagen ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="md"
                          isDisabled={mutation.isPending}
                          onPress={quitarImagenSeleccionada}
                        >
                          <IconX size={16} />
                          Quitar selección
                        </Button>
                      ) : null}

                      {mostrarImagenActual ? (
                        <Button
                          type="button"
                          variant="danger-soft"
                          size="md"
                          isDisabled={mutation.isPending}
                          onPress={quitarImagenActual}
                        >
                          <IconX size={16} />
                          Eliminar imagen
                        </Button>
                      ) : null}
                    </div>

                    <p className="text-xs text-hierro-400">
                      Formatos admitidos: JPG y PNG. Tamaño máximo: 5 MB.
                    </p>

                    {errors.imagen ? (
                      <p className="text-xs text-danger" role="alert">
                        {errors.imagen.message}
                      </p>
                    ) : null}
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
                  isDisabled={mutation.isPending || !ejercicio}
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

export default ModificarEjercicioModal;
