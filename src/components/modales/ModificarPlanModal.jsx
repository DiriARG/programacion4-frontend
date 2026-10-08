import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Spinner } from "@heroui/react";
import { IconPencil, IconPlus, IconX } from "@tabler/icons-react";
import { toast } from "sonner";

import { modificarPlanSchema } from "../../schemas/modificarPlanSchema";
import { planesService } from "../../services/planesService";
import { CampoFormulario } from "../comunes/CampoFormulario";

const valoresIniciales = {
  nombre: "",
  descripcion: "",
  precioMensual: "",
  beneficios: [""],
};

export function ModificarPlanModal({ isOpen, onOpenChange, plan }) {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(modificarPlanSchema),
    defaultValues: valoresIniciales,
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "beneficios",
  });

  useEffect(() => {
    if (isOpen && plan) {
      reset({
        nombre: plan.nombre ?? "",
        descripcion: plan.descripcion ?? "",
        // Convierte el precio a string para cargarlo en el formulario; Zod luego lo transforma a number.
        precioMensual: String(plan.precioMensual ?? ""),
        beneficios: plan.beneficios?.length ? plan.beneficios : [""],
      });
    }
  }, [isOpen, plan, reset]);

  const mutation = useMutation({
    mutationFn: (data) => planesService.modificarPlan(plan.id, data),

    onSuccess: (planModificado) => {
      queryClient.invalidateQueries({ queryKey: ["planes"] });

      toast.success("Plan modificado", {
        description: `Se actualizaron correctamente los datos del plan "${planModificado.nombre}".`,
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

        if (mensajeNormalizado.includes("nombre")) {
          setError("nombre", {
            type: "server",
            message: mensaje,
          });

          return;
        }
      }

      toast.error("No se pudo modificar el plan", {
        description:
          respuesta?.mensaje ?? "Ocurrió un problema al modificar el plan.",
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
            aria-labelledby="modificar-plan-titulo"
            aria-describedby="modificar-plan-descripcion"
            className="border border-hierro-700 bg-hierro-900"
          >
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Modal.Header className="border-b border-hierro-800">
                <Modal.Icon className="text-azul-500">
                  <IconPencil size={22} />
                </Modal.Icon>

                <div>
                  <Modal.Heading
                    id="modificar-plan-titulo"
                    className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
                  >
                    Modificar plan
                  </Modal.Heading>

                  <p
                    id="modificar-plan-descripcion"
                    className="mt-1 text-sm text-hierro-400"
                  >
                    Modificá los datos del plan seleccionado.
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
                        placeholder="Nombre del plan"
                        autoComplete="off"
                        maxLength={50}
                        registration={field}
                        error={errors.nombre?.message}
                        isRequired
                        isDisabled={mutation.isPending}
                      />
                    )}
                  />

                  <Controller
                    name="precioMensual"
                    control={control}
                    render={({ field }) => (
                      <CampoFormulario
                        label="Precio mensual"
                        placeholder="Ej. 10000,00"
                        inputMode="decimal"
                        autoComplete="off"
                        registration={field}
                        error={errors.precioMensual?.message}
                        isRequired
                        isDisabled={mutation.isPending}
                      />
                    )}
                  />

                  <Controller
                    name="descripcion"
                    control={control}
                    render={({ field }) => (
                      <CampoFormulario
                        label="Descripción"
                        placeholder="Descripción del plan"
                        multiline
                        autoComplete="off"
                        rows={4}
                        maxLength={200}
                        registration={field}
                        error={errors.descripcion?.message}
                        isRequired
                        isDisabled={mutation.isPending}
                        className="sm:col-span-2"
                      />
                    )}
                  />

                  <div className="sm:col-span-2">
                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                          Beneficios
                        </p>

                        <p className="mt-1 text-xs text-hierro-400">
                          Modificá las características incluidas en el plan.
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        isDisabled={mutation.isPending}
                        onPress={() => append("")}
                      >
                        <IconPlus size={16} />
                        Agregar beneficio
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {fields.map((field, indice) => (
                        <div key={field.id} className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <Controller
                              name={`beneficios.${indice}`}
                              control={control}
                              render={({ field }) => (
                                <CampoFormulario
                                  label={`Beneficio ${indice + 1}`}
                                  placeholder="Ej. Acceso a sala de musculación"
                                  autoComplete="off"
                                  registration={field}
                                  error={errors.beneficios?.[indice]?.message}
                                  isRequired
                                  isDisabled={mutation.isPending}
                                />
                              )}
                            />
                          </div>

                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            isDisabled={
                              mutation.isPending || fields.length === 1
                            }
                            aria-label={`Eliminar beneficio ${indice + 1}`}
                            onPress={() => remove(indice)}
                          >
                            <IconX size={16} />
                          </Button>
                        </div>
                      ))}
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

export default ModificarPlanModal;
