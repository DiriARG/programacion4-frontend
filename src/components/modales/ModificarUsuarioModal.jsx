import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Button, Modal, Spinner } from "@heroui/react";
import { IconPencil } from "@tabler/icons-react";
import { toast } from "sonner";

import { modificarUsuarioSchema } from "../../schemas/modificarUsuarioSchema";
import { CampoFormulario } from "../comunes/CampoFormulario";

const valoresIniciales = {
  nombre: "",
  apellido: "",
  dni: "",
  telefono: "",
  email: "",
};

export function ModificarUsuarioModal({
  isOpen,
  onOpenChange,
  usuario,
  modificar,
}) {
  const queryClient = useQueryClient();
  
  /* Se utiliza "Controller" (control) de React Hook Form en vez de "register" para que los inputs de HeroUI (que están en CampoFormulario)
  muestren correctamente los datos precargados al abrir el modal con reset(). */
  const {
    control,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(modificarUsuarioSchema),
    defaultValues: valoresIniciales,
    mode: "onBlur",
  });

  // Al abrir el modal, carga los datos del usuario seleccionado.
  useEffect(() => {
    if (isOpen && usuario) {
      reset({
        nombre: usuario.nombre ?? "",
        apellido: usuario.apellido ?? "",
        dni: usuario.dni ?? "",
        telefono: usuario.telefono ?? "",
        email: usuario.email ?? "",
      });
    }
  }, [isOpen, usuario, reset]);

  const mutation = useMutation({
    mutationFn: (data) => modificar(usuario.id, data),

    onSuccess: (usuarioModificado) => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });

      toast.success("Usuario modificado", {
        description: `Se actualizaron correctamente los datos de ${usuarioModificado.nombre} ${usuarioModificado.apellido}.`,
      });

      reset(valoresIniciales);
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
        const mensaje =
          respuesta.mensaje ?? "El dato ingresado ya se encuentra registrado.";

        const mensajeNormalizado = mensaje.toLowerCase();

        if (mensajeNormalizado.includes("email")) {
          setError("email", {
            type: "server",
            message: mensaje,
          });

          return;
        }

        if (mensajeNormalizado.includes("dni")) {
          setError("dni", {
            type: "server",
            message: mensaje,
          });

          return;
        }
      }

      toast.error("No se pudo modificar el usuario", {
        description:
          respuesta?.mensaje ?? "Ocurrió un problema al modificar el usuario.",
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
            aria-labelledby="modificar-usuario-titulo"
            aria-describedby="modificar-usuario-descripcion"
            className="border border-hierro-700 bg-hierro-900"
          >
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Modal.Header className="border-b border-hierro-800">
                <Modal.Icon className="text-azul-500">
                  <IconPencil size={22} />
                </Modal.Icon>

                <div>
                  <Modal.Heading
                    id="modificar-usuario-titulo"
                    className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
                  >
                    Modificar usuario
                  </Modal.Heading>

                  <p
                    id="modificar-usuario-descripcion"
                    className="mt-1 text-sm text-hierro-400"
                  >
                    Modificá los datos del usuario seleccionado.
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="max-h-[60vh] overflow-y-auto py-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Controller
                    name="nombre"
                    control={control}
                    render={({ field }) => (
                      <CampoFormulario
                        label="Nombre"
                        placeholder="Nombre del usuario"
                        autoComplete="given-name"
                        registration={field}
                        error={errors.nombre?.message}
                        isRequired
                        isDisabled={mutation.isPending}
                      />
                    )}
                  />

                  <Controller
                    name="apellido"
                    control={control}
                    render={({ field }) => (
                      <CampoFormulario
                        label="Apellido"
                        placeholder="Apellido del usuario"
                        autoComplete="family-name"
                        registration={field}
                        error={errors.apellido?.message}
                        isRequired
                        isDisabled={mutation.isPending}
                      />
                    )}
                  />

                  <Controller
                    name="dni"
                    control={control}
                    render={({ field }) => (
                      <CampoFormulario
                        label="DNI"
                        placeholder="Ej. 12345678"
                        inputMode="numeric"
                        autoComplete="off"
                        registration={field}
                        error={errors.dni?.message}
                        isRequired
                        isDisabled={mutation.isPending}
                      />
                    )}
                  />

                  <Controller
                    name="telefono"
                    control={control}
                    render={({ field }) => (
                      <CampoFormulario
                        label="Teléfono"
                        type="tel"
                        placeholder="Ej. 2346 123456"
                        autoComplete="tel"
                        registration={field}
                        error={errors.telefono?.message}
                        isRequired
                        isDisabled={mutation.isPending}
                      />
                    )}
                  />

                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <CampoFormulario
                        label="Email"
                        type="email"
                        placeholder="usuario@email.com"
                        autoComplete="email"
                        registration={field}
                        error={errors.email?.message}
                        isRequired
                        isDisabled={mutation.isPending}
                      />
                    )}
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
                  isDisabled={mutation.isPending}
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

export default ModificarUsuarioModal;
