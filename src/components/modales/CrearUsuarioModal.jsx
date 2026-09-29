import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
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

import { crearUsuarioPorRol } from "../../utils/configuracionUsuarios";
import { useAutenticacion } from "../../context/AutenticacionContext";
import { crearUsuarioSchema } from "../../schemas/crearUsuarioSchema";
import { CampoFormulario } from "../comunes/CampoFormulario";

const valoresIniciales = {
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  telefono: "",
  contrasenia: "",
  rol: "",
};

const etiquetasRol = {
  ALUMNO: "Alumno",
  PROFESOR: "Profesor",
  ADMIN_GESTION: "Administrador de gestión",
};

const rolesQuePuedeCrear = {
  ADMIN_GESTION: ["ALUMNO"],
  ADMIN_GENERAL: ["ALUMNO", "PROFESOR", "ADMIN_GESTION"],
};

export function CrearUsuarioModal({ isOpen, onOpenChange }) {
  const { rol: rolUsuario } = useAutenticacion();

  // Según el rol del usuario autenticado, obtiene los roles de usuarios que puede crear; si no existe, usa una lista vacía.
  const rolesDisponibles = rolesQuePuedeCrear[rolUsuario] ?? [];

  // ADMIN_GESTION solo puede crear alumnos, mientras que ADMIN_GENERAL debe seleccionar el rol.
  const rolInicial = rolUsuario === "ADMIN_GESTION" ? "ALUMNO" : "";

  const {
    register,
    control,
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

  // Al abrir el modal, limpia el formulario y prepara una nueva creación.
  useEffect(() => {
    if (isOpen) {
      reset({
        ...valoresIniciales,
        rol: rolInicial,
      });
    }
  }, [isOpen, reset, rolInicial]);

  const mutation = useMutation({
    mutationFn: (data) => {
      // Separa el rol de los demás datos porque el backend recibe los datos del usuario sin el campo "rol" (CrearUsuarioRequest).
      const { rol: rolSeleccionado, ...datosUsuario } = data;

      // Busca la función correspondiente al rol seleccionado, ej: "ALUMNO" obtiene usuariosService.crearAlumno.
      const crearUsuario = crearUsuarioPorRol[rolSeleccionado];

      // Ejecuta la función correspondiente enviando únicamente los datos del usuario.
      return crearUsuario(datosUsuario);
    },

    onSuccess: (usuarioCreado) => {
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

                  {/* Solamente el ADMIN_GENERAL puede elegir el rol. */}
                  {rolUsuario === "ADMIN_GENERAL" ? (
                    <Controller
                      name="rol"
                      control={control}
                      render={({ field, fieldState }) => (
                        <Select
                          value={field.value || null}
                          onChange={field.onChange}
                          isRequired
                          isInvalid={Boolean(fieldState.error)}
                          isDisabled={mutation.isPending}
                          placeholder="Seleccioná un rol"
                          className="w-full"
                        >
                          <Label className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                            Rol
                          </Label>

                          <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                          </Select.Trigger>

                          <Select.Popover>
                            <ListBox>
                              {rolesDisponibles.map((rolDisponible) => (
                                <ListBox.Item
                                  key={rolDisponible}
                                  id={rolDisponible}
                                  textValue={etiquetasRol[rolDisponible]}
                                >
                                  {etiquetasRol[rolDisponible]}
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              ))}
                            </ListBox>
                          </Select.Popover>

                          {fieldState.error ? (
                            <FieldError>{fieldState.error.message}</FieldError>
                          ) : null}
                        </Select>
                      )}
                    />
                  ) : null}
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
