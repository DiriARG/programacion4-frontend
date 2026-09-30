import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button, Modal, Spinner } from "@heroui/react";
import { IconUserPlus } from "@tabler/icons-react";
import { toast } from "sonner";

import { crearUsuarioPorRol } from "../../utils/configuracionUsuarios";
import { crearUsuarioSchema } from "../../schemas/crearUsuarioSchema";
import { CampoFormulario } from "../comunes/CampoFormulario";

const valoresIniciales = {
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  telefono: "",
  contrasenia: "",
};

export function CrearUsuarioModal({ isOpen, onOpenChange, rolFijo }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(crearUsuarioSchema),
    defaultValues: valoresIniciales,
    // Valida el campo cuando el usuario deja de interactuar con él.
    mode: "onBlur",
  });

  // Al abrir el modal, limpia el formulario para una nueva creación.
  useEffect(() => {
    if (isOpen) {
      reset(valoresIniciales);
    }
  }, [isOpen, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      // Obtiene la función de creación correspondiente al rol de la sección actual.
      const crearUsuario = crearUsuarioPorRol[rolFijo];

      // Envía únicamente los datos del usuario al endpoint correspondiente.
      return crearUsuario(data);
    },

    onSuccess: (usuarioCreado) => {
      // Actualiza los listados de usuarios para reflejar el nuevo registro.
      queryClient.invalidateQueries({
        queryKey: ["usuarios"],
      });

      toast.success("Usuario creado", {
        description: `Se creó correctamente el usuario ${usuarioCreado.nombre} ${usuarioCreado.apellido}.`,
      });

      reset(valoresIniciales);
      onOpenChange(false);
    },

    onError: (error) => {
      const respuesta = error?.response?.data;

      // Muestra los errores de validación enviados por el backend debajo de cada campo.
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

        // Identifica si el conflicto informado por el backend corresponde al email/DNI duplicado.
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

      // Para errores inesperados como por ejemplo desconexión con el back.
      toast.error("No se pudo crear al usuario", {
        description:
          respuesta?.mensaje ?? "Ocurrió un problema al registrar el usuario.",
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
            aria-labelledby="crear-usuario-titulo"
            aria-describedby="crear-usuario-descripcion"
            className="border border-hierro-700 bg-hierro-900"
          >
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Modal.Header className="border-b border-hierro-800">
                <Modal.Icon className="text-azul-500">
                  <IconUserPlus size={22} />
                </Modal.Icon>

                <div>
                  <Modal.Heading
                    id="crear-usuario-titulo"
                    className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
                  >
                    Crear nuevo usuario
                  </Modal.Heading>

                  <p
                    id="crear-usuario-descripcion"
                    className="mt-1 text-sm text-hierro-400"
                  >
                    Completá los datos para registrar un nuevo usuario.
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="max-h-[60vh] overflow-y-auto py-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <CampoFormulario
                    label="Nombre"
                    placeholder="Nombre del usuario"
                    autoComplete="given-name"
                    registration={register("nombre")}
                    error={errors.nombre?.message}
                    isRequired
                    isDisabled={mutation.isPending}
                  />

                  <CampoFormulario
                    label="Apellido"
                    placeholder="Apellido del usuario"
                    autoComplete="family-name"
                    registration={register("apellido")}
                    error={errors.apellido?.message}
                    isRequired
                    isDisabled={mutation.isPending}
                  />

                  <CampoFormulario
                    label="DNI"
                    placeholder="Ej. 12345678"
                    inputMode="numeric"
                    autoComplete="off"
                    registration={register("dni")}
                    error={errors.dni?.message}
                    isRequired
                    isDisabled={mutation.isPending}
                  />

                  <CampoFormulario
                    label="Teléfono"
                    type="tel"
                    placeholder="Ej. 2346 123456"
                    autoComplete="tel"
                    registration={register("telefono")}
                    error={errors.telefono?.message}
                    isRequired
                    isDisabled={mutation.isPending}
                  />

                  <CampoFormulario
                    label="Email"
                    type="email"
                    placeholder="usuario@email.com"
                    autoComplete="email"
                    registration={register("email")}
                    error={errors.email?.message}
                    isRequired
                    isDisabled={mutation.isPending}
                  />

                  <CampoFormulario
                    label="Contraseña"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    registration={register("contrasenia")}
                    error={errors.contrasenia?.message}
                    isRequired
                    isDisabled={mutation.isPending}
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
                      Creando...
                    </>
                  ) : (
                    "Crear usuario"
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

export default CrearUsuarioModal;
