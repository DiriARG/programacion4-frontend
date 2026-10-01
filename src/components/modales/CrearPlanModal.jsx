import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Spinner } from "@heroui/react";
import { IconPlus, IconX } from "@tabler/icons-react";
import { toast } from "sonner";

import { planesService } from "../../services/planesService";
import { crearPlanSchema } from "../../schemas/crearPlanSchema";
import { CampoFormulario } from "../comunes/CampoFormulario";

const valoresIniciales = {
  nombre: "",
  descripcion: "",
  precioMensual: "",
  beneficios: [""],
};

export function CrearPlanModal({ isOpen, onOpenChange }) {
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
    resolver: zodResolver(crearPlanSchema),
    defaultValues: valoresIniciales,
    mode: "onBlur",
  });

  /* Gestiona dinámicamente la lista de beneficios del formulario.
   fields representa los beneficios actuales, append agrega uno nuevo, remove elimina uno y control conecta la lista con React Hook Form. */
  const { fields, append, remove } = useFieldArray({
    control,
    name: "beneficios",
  });

  useEffect(() => {
    if (isOpen) {
      reset(valoresIniciales);
    }
  }, [isOpen, reset]);

  const mutation = useMutation({
    mutationFn: (data) => planesService.crearPlan(data),

    onSuccess: (planCreado) => {
      queryClient.invalidateQueries({
        queryKey: ["planes"],
      });

      toast.success("Plan creado", {
        description: `Se creó correctamente el plan "${planCreado.nombre}".`,
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

      toast.error("No se pudo crear el plan", {
        description:
          respuesta?.mensaje ?? "Ocurrió un problema al registrar el plan.",
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
            aria-labelledby="crear-plan-titulo"
            aria-describedby="crear-plan-descripcion"
            className="border border-hierro-700 bg-hierro-900"
          >
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Modal.Header className="border-b border-hierro-800">
                <Modal.Icon className="text-azul-500">
                  <IconPlus size={22} />
                </Modal.Icon>

                <div>
                  <Modal.Heading
                    id="crear-plan-titulo"
                    className="font-titulos text-xl tracking-[0.08em] text-hueso uppercase"
                  >
                    Crear nuevo plan
                  </Modal.Heading>

                  <p
                    id="crear-plan-descripcion"
                    className="mt-1 text-sm text-hierro-400"
                  >
                    Completá los datos para registrar un nuevo plan.
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="max-h-[60vh] overflow-y-auto py-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <CampoFormulario
                    label="Nombre"
                    placeholder="Nombre del plan"
                    autoComplete="off"
                    maxLength={50}
                    registration={register("nombre")}
                    error={errors.nombre?.message}
                    isRequired
                    isDisabled={mutation.isPending}
                  />

                  <CampoFormulario
                    label="Precio mensual"
                    placeholder="Ej. 10000,00"
                    inputMode="decimal"
                    autoComplete="off"
                    registration={register("precioMensual")}
                    error={errors.precioMensual?.message}
                    isRequired
                    isDisabled={mutation.isPending}
                  />

                  <CampoFormulario
                    label="Descripción"
                    placeholder="Descripción del plan"
                    multiline
                    rows={4}
                    maxLength={200}
                    registration={register("descripcion")}
                    error={errors.descripcion?.message}
                    isRequired
                    isDisabled={mutation.isPending}
                    className="sm:col-span-2"
                  />

                  <div className="sm:col-span-2">
                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="font-titulos text-xs tracking-[0.2em] text-hierro-200 uppercase">
                          Beneficios
                        </p>

                        <p className="mt-1 text-xs text-hierro-400">
                          Agregá las características incluidas en el plan.
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
                            <CampoFormulario
                              label={`Beneficio ${indice + 1}`}
                              placeholder="Ej. Acceso a sala de musculación"
                              autoComplete="off"
                              registration={register(`beneficios.${indice}`)}
                              error={errors.beneficios?.[indice]?.message}
                              isRequired
                              isDisabled={mutation.isPending}
                            />
                          </div>

                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            // Intencionalmente se deja el botón de eliminar deshabilitado cuando solamente queda un benificio porque el back no permite crear un plan sin beneficios.
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
                      Creando...
                    </>
                  ) : (
                    "Crear plan"
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

export default CrearPlanModal;