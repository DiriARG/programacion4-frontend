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
import { IconPencil } from "@tabler/icons-react";
import { toast } from "sonner";

import { CampoFormulario } from "../comunes/CampoFormulario";
import { modificarTurnoSchema } from "../../schemas/modificarTurnoSchema";
import { turnosService } from "../../services/turnosService";
import { usuariosService } from "../../services/usuariosService";
import { nombresDias } from "../../utils/formatearDiaYHora";

const valoresIniciales = {
  profesorId: "",
  nombreClase: "",
  diaSemana: "",
  horaInicio: "",
  horaFin: "",
};

export function ModificarTurnoModal({ isOpen, onOpenChange, turno }) {
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    reset,
    clearErrors,
    setError,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(modificarTurnoSchema),
    defaultValues: valoresIniciales,
    mode: "onBlur",
  });

  const {
    data: profesores = [],
    isPending: profesoresPendientes,
    isError: profesoresError,
  } = useQuery({
    queryKey: ["profesores", "activos"],
    queryFn: usuariosService.consultarProfesoresActivos,
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen && turno) {
      reset({
        profesorId: String(turno.profesorId ?? ""),
        nombreClase: turno.nombreClase ?? "",
        diaSemana: turno.diaSemana ?? "",
        horaInicio: turno.horaInicio?.slice(0, 5) ?? "",
        horaFin: turno.horaFin?.slice(0, 5) ?? "",
      });
    }
  }, [isOpen, turno, reset]);

  const mutation = useMutation({
    mutationFn: (data) => turnosService.modificarTurno(turno.id, data),

    onSuccess: (turnoModificado) => {
      queryClient.invalidateQueries({ queryKey: ["turnos"] });
      queryClient.invalidateQueries({ queryKey: ["turno", turno.id] });

      toast.success("Turno modificado", {
        description: `Se actualizaron correctamente los datos del turno "${turnoModificado.nombreClase}".`,
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

      toast.error("No se pudo modificar el turno", {
        description:
          respuesta?.mensaje ?? "Ocurrió un problema al modificar el turno.",
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
            aria-labelledby="modificar-turno-titulo"
            aria-describedby="modificar-turno-descripcion"
            className="border border-hierro-700 bg-hierro-900"
          >
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Modal.Header className="border-b border-hierro-800">
                <Modal.Icon className="text-azul-500">
                  <IconPencil size={22} />
                </Modal.Icon>

                <div>
                  <Modal.Heading
                    id="modificar-turno-titulo"
                    className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
                  >
                    Modificar turno
                  </Modal.Heading>

                  <p
                    id="modificar-turno-descripcion"
                    className="mt-1 text-sm text-hierro-400"
                  >
                    Modificá los datos del turno seleccionado.
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="max-h-[60vh] overflow-y-auto py-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Controller
                      name="profesorId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          className="w-full"
                          variant="secondary"
                          placeholder={
                            profesoresPendientes
                              ? "Cargando profesores..."
                              : profesoresError
                                ? "No se pudieron cargar los profesores"
                                : profesores.length === 0
                                  ? "No hay profesores activos"
                                  : "Seleccioná un profesor"
                          }
                          name={field.name}
                          value={field.value || null}
                          onChange={(valor) => field.onChange(valor ?? "")}
                          onBlur={field.onBlur}
                          isRequired
                          isInvalid={Boolean(errors.profesorId)}
                          isDisabled={
                            mutation.isPending ||
                            profesoresPendientes ||
                            profesoresError ||
                            profesores.length === 0
                          }
                        >
                          <Label className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                            Profesor
                          </Label>

                          <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                          </Select.Trigger>

                          <Select.Popover>
                            <ListBox>
                              {profesores.map((profesor) => (
                                <ListBox.Item
                                  key={profesor.id}
                                  id={String(profesor.id)}
                                  textValue={`${profesor.nombre} ${profesor.apellido}`}
                                >
                                  {profesor.nombre} {profesor.apellido}
                                </ListBox.Item>
                              ))}
                            </ListBox>
                          </Select.Popover>

                          {errors.profesorId ? (
                            <FieldError>{errors.profesorId.message}</FieldError>
                          ) : null}
                        </Select>
                      )}
                    />

                    {profesoresPendientes ? (
                      <p className="mt-2 text-xs text-hierro-400">
                        Cargando profesores activos...
                      </p>
                    ) : profesoresError ? (
                      <p className="mt-2 text-xs text-hierro-400">
                        No se pudieron consultar los profesores activos. Cerrá y
                        volvé a abrir el formulario para intentarlo nuevamente.
                      </p>
                    ) : profesores.length === 0 ? (
                      <p className="mt-2 text-xs text-hierro-400">
                        No hay profesores activos disponibles para asignar al
                        turno.
                      </p>
                    ) : null}
                  </div>

                  <Controller
                    name="nombreClase"
                    control={control}
                    render={({ field }) => (
                      <CampoFormulario
                        label="Nombre de la clase"
                        placeholder="Ej.: Entrenamiento funcional"
                        autoComplete="off"
                        maxLength={100}
                        registration={field}
                        error={errors.nombreClase?.message}
                        isRequired
                        isDisabled={mutation.isPending}
                      />
                    )}
                  />

                  <Controller
                    name="diaSemana"
                    control={control}
                    render={({ field }) => (
                      <Select
                        className="w-full"
                        variant="secondary"
                        placeholder="Seleccioná un día"
                        name={field.name}
                        value={field.value || null}
                        onChange={(valor) => field.onChange(valor ?? "")}
                        onBlur={field.onBlur}
                        isRequired
                        isInvalid={Boolean(errors.diaSemana)}
                        isDisabled={mutation.isPending}
                      >
                        <Label className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                          Día de la semana
                        </Label>

                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>

                        <Select.Popover>
                          <ListBox>
                            {Object.entries(nombresDias).map(
                              ([valor, nombre]) => (
                                <ListBox.Item
                                  key={valor}
                                  id={valor}
                                  textValue={nombre}
                                >
                                  {nombre}
                                </ListBox.Item>
                              ),
                            )}
                          </ListBox>
                        </Select.Popover>

                        {errors.diaSemana ? (
                          <FieldError>{errors.diaSemana.message}</FieldError>
                        ) : null}
                      </Select>
                    )}
                  />

                  <Controller
                    name="horaInicio"
                    control={control}
                    render={({ field }) => (
                      <CampoFormulario
                        label="Hora de inicio"
                        type="time"
                        registration={field}
                        error={errors.horaInicio?.message}
                        isRequired
                        isDisabled={mutation.isPending}
                      />
                    )}
                  />

                  <Controller
                    name="horaFin"
                    control={control}
                    render={({ field }) => (
                      <CampoFormulario
                        label="Hora de fin"
                        type="time"
                        registration={field}
                        error={errors.horaFin?.message}
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
                  isDisabled={
                    mutation.isPending ||
                    !turno ||
                    profesoresPendientes ||
                    profesoresError ||
                    profesores.length === 0
                  }
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

export default ModificarTurnoModal;
