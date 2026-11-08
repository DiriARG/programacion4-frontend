import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Spinner, Label } from "@heroui/react";
import { IconDumbbell, IconX } from "@tabler/icons-react";
import { toast } from "sonner";

import { CampoFormulario } from "../comunes/CampoFormulario";
import { crearEjercicioSchema } from "../../schemas/crearEjercicioSchema";
import { ejerciciosService } from "../../services/ejerciciosService";

const obtenerValoresIniciales = () => ({
  nombre: "",
  grupoMuscular: "",
  descripcion: "",
  imagen: null,
});

export function CrearEjercicioModal({ isOpen, onOpenChange }) {
  const queryClient = useQueryClient();
  const imagenInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(crearEjercicioSchema),
    defaultValues: obtenerValoresIniciales(),
    mode: "onBlur",
  });

  const imagenRegistro = register("imagen");
  const imagenSeleccionada = watch("imagen");

  // Obtiene el archivo seleccionado para comprobar si hay una imagen y permitir quitarla.
  const archivoImagen =
    typeof File !== "undefined" && imagenSeleccionada instanceof File
      ? imagenSeleccionada
      : (imagenSeleccionada?.[0] ?? null);

  const nombreImagen = archivoImagen?.name ?? "Ninguna imagen seleccionada";

  useEffect(() => {
    if (isOpen) {
      reset(obtenerValoresIniciales());

      if (imagenInputRef.current) {
        imagenInputRef.current.value = "";
      }
    }
  }, [isOpen, reset]);

  const quitarImagen = () => {
    /* Se le indica a RHF que modifique el valor del campo "imagen" (register) y lo establezca en null (sin archivo).
    Se utiliza null y no "undefined" acá y en obtenerValoresIniciales porque RHF no admite undefined como segundo argumento de setValue. */
    setValue("imagen", null, {
      // Recalcula si el campo fue modificado respecto de sus valores iniciales.
      shouldDirty: true,
      // Fuerza una revalidación con Zod.
      shouldValidate: true,
    });

    if (imagenInputRef.current) {
      imagenInputRef.current.value = "";
    }
  };

  const mutation = useMutation({
    // TanStack Query inyecta y pasa automáticamente a la función los datos recibidos (objeto "data") por mutate(data).
    mutationFn: ejerciciosService.crearEjercicio,

    onSuccess: (ejercicioCreado) => {
      queryClient.invalidateQueries({ queryKey: ["ejercicios"] });

      toast.success("Ejercicio registrado", {
        description: `Se registró correctamente el ejercicio "${ejercicioCreado.nombre}".`,
      });

      reset(obtenerValoresIniciales());

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
            "Ya existe un ejercicio registrado con ese nombre.",
        });

        return;
      }

      toast.error("No se pudo registrar el ejercicio", {
        description:
          respuesta?.mensaje ??
          "Ocurrió un problema al registrar el ejercicio.",
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
            aria-labelledby="crear-ejercicio-titulo"
            aria-describedby="crear-ejercicio-descripcion"
            className="border border-hierro-700 bg-hierro-900"
          >
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Modal.Header className="border-b border-hierro-800">
                <Modal.Icon className="text-azul-500">
                  <IconDumbbell size={22} />
                </Modal.Icon>

                <div>
                  <Modal.Heading
                    id="crear-ejercicio-titulo"
                    className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
                  >
                    Crear ejercicio
                  </Modal.Heading>

                  <p
                    id="crear-ejercicio-descripcion"
                    className="mt-1 text-sm text-hierro-400"
                  >
                    Completá los datos para incorporar un ejercicio al catálogo.
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="max-h-[60vh] overflow-y-auto py-6">
                <div className="space-y-5">
                  <CampoFormulario
                    label="Nombre del ejercicio"
                    placeholder="Ej: Press de banca"
                    registration={register("nombre")}
                    error={errors.nombre?.message}
                    isRequired
                    isDisabled={mutation.isPending}
                    maxLength={100}
                  />

                  <CampoFormulario
                    label="Grupo muscular"
                    placeholder="Ej: Pecho"
                    registration={register("grupoMuscular")}
                    error={errors.grupoMuscular?.message}
                    isRequired
                    isDisabled={mutation.isPending}
                    maxLength={50}
                  />

                  <CampoFormulario
                    label="Descripción (opcional)"
                    placeholder="Describí cómo se realiza el ejercicio..."
                    multiline
                    registration={register("descripcion")}
                    error={errors.descripcion?.message}
                    isDisabled={mutation.isPending}
                    rows={4}
                  />

                  <div className="space-y-2">
                    <Label
                      id="imagen-label"
                      className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase"
                    >
                      Imagen del ejercicio (opcional)
                    </Label>

                    <input
                      id="imagen"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                      name={imagenRegistro.name}
                      onBlur={imagenRegistro.onBlur}
                      onChange={imagenRegistro.onChange}
                      disabled={mutation.isPending}
                      aria-labelledby="imagen-label"
                      aria-describedby="imagen-ayuda"
                      aria-invalid={Boolean(errors.imagen)}
                      ref={(elemento) => {
                        imagenRegistro.ref(elemento);
                        imagenInputRef.current = elemento;
                      }}
                    />

                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        className="focus-visible:!ring-0 data-[focus-visible=true]:!ring-0"
                        isDisabled={mutation.isPending}
                        onPress={() => imagenInputRef.current?.click()}
                      >
                        Seleccionar imagen
                      </Button>

                      {archivoImagen ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          isDisabled={mutation.isPending}
                          onPress={quitarImagen}
                        >
                          <IconX size={16} />
                          Quitar imagen
                        </Button>
                      ) : null}
                    </div>

                    <p
                      className="break-all text-sm text-hierro-400"
                      aria-live="polite"
                    >
                      {nombreImagen}
                    </p>

                    <p id="imagen-ayuda" className="text-xs text-hierro-400">
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
                  isDisabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Spinner size="sm" />
                      Registrando...
                    </>
                  ) : (
                    "Crear ejercicio"
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

export default CrearEjercicioModal;
